// main.js — Unit 10 view-model (Thermochemistry, TEKS C.13). Scenario layer.
//
// The units_new build: units/10-thermochemistry rendered in the mission-cockpit shell.
// This unit is one of the two implementations the whole Scenario-layer retrofit was
// modelled on (RETROFIT-U1-U4.md section 6.2 quotes nextScenario, seCaption, capUnlocked
// and recordWorld from here), so the chemistry, the grading, the consequences and the
// world-state all arrived working and are copied as they were. No band, verdict,
// consequence, scenario or clinical threshold is changed by the port. What this file adds
// over the worksheet build is presentation plumbing only:
//   * unitId 'units_new/10-thermochemistry', so progress never collides with the old save
//   * the cockpit readouts the mission screen and the status rail bind to (activeBrief,
//     activeVerdict, activeTone, activeArtId, activeStationName, activeStateLabel,
//     activeOutcomeText, activeReference, coreSkills, teksMasteredCount, scArt)
//   * screenOf, the per-bench claim on that one screen -- see the block comment on it.
//     The calorimeter bench carries THREE commits (the core prediction, Hess's law and
//     formation enthalpy), which is the sharpest case of porting trap 3 in the tree.
//   * coreReadings, four honest meters for the rail, all derived from state that was
//     already here: no new counter, no new mechanic.
// There is no canvas and no WebGL here, so trap 12 does not apply: the energy diagram on
// the pack bench is hand-rolled SVG on purpose (see diagramSvg below) and needs no
// lifecycle, no resize hook and no Chart.js.
//
// Wires model.js + the engine + the shared game framework. Every stage is a brief ->
// tool -> commit -> consequence (GAMIFICATION design rule 0): the law picker, pack
// picker, q calculator and equilibrium predictor are the tools; committing produces a
// verdict (outcomeBand for the two dose stages, per-option consequences for the
// decision stages) that feeds a session-local world-state. Here the world-state IS a
// thermochemistry readout: the patient's core temperature, in degrees Celsius.
// Outcomes are primary; XP/streak stay a quiet line; per-TEKS mastery meters persist.
import { SE, LAWS, FIELD_MATERIALS, PACKS, HESS_ROUTES, FORMATION_CASES, SCENARIOS } from './model.js';
import { sceneArt } from './art.js';
import {
  SPECIFIC_HEAT, heatTransfer, finalTemperature, classifyThermal,
  hessCombine, enthalpyFromFormation, fmt
} from '../../../shared/js/chem.js';
import { createGame, outcomeBand } from '../../../shared/js/game.js';

const pick = a => a[(Math.random() * a.length) | 0];
const rN = (x, n) => { const p = 10 ** n; return Math.round(x * p) / p; };
const rand = (lo, hi, dp = 0) => rN(lo + Math.random() * (hi - lo), dp);

// The patient's core temperature is the world-state. These are the clinical bands a
// rescue medic actually works to: shivering stops near 32, and 35 is the line between
// mild and moderate hypothermia.
const CORE_START = 33.4;
const CORE_MIN = 28, CORE_MAX = 37.5;
// Shivering is the patient's own heat source and it fails below this. It is already the
// line coreState() reads; naming it lets the rail's second meter show the margin left.
const SHIVER_FLOOR = 32;

// The station names the header falls back to before a scenario has been drawn for a
// bench. Every bench here generates in init(), so this is only ever seen on the capstone
// before it is unlocked -- but a header reading "undefined" is not an acceptable state.
const STATION_NAME = {
  laws: 'Read the situation', pack: 'Pick the pack', warm: 'Size the heat',
  calorimeter: 'Calorimetry', capstone: 'The call'
};

const skills = [
  { id: 'a',   code: 'C.13(A)',  label: 'Four laws',           target: 3 },
  { id: 'b',   code: 'C.13(B)',  label: 'Calorimetry',         target: 3 },
  { id: 'c',   code: 'C.13(C)',  label: 'Exo/endo + diagram',  target: 3 },
  { id: 'd',   code: 'C.13(D)',  label: 'q = mc(dT)',          target: 3 },
  { id: 'h1',  code: 'Honors',   label: "Hess's law",          target: 2, honors: true },
  { id: 'h2',  code: 'Honors',   label: 'Formation enthalpy',  target: 2, honors: true },
  { id: 'cap', code: 'Capstone', label: 'Evacuation call',     target: 1, honors: true }
];

export { SE };

export function createSim() {
  return {
    // The units_new slug, not the old one: a shared localStorage key would let the two
    // builds overwrite each other's mastery (porting trap 10).
    ...createGame({ unitId: 'units_new/10-thermochemistry', skills }),
    SE, fmt, LAWS, PACKS, FIELD_MATERIALS, SPECIFIC_HEAT,
    honors: false,
    mode: 'laws',
    // Session-only: the TEKS popover in the command header. Never persisted, because a
    // panel that reopens itself on load is a panel the learner has to close again.
    teksOpen: false,

    // The mission screen shows ONE scenario and ONE verdict, and this unit's calorimeter
    // bench carries THREE commits: the core equilibrium prediction, Hess's law (h1) and
    // formation enthalpy (h2), each with its own scenario, its own banner and its own
    // consequence. Porting trap 3 says the verdict has to follow recency or whichever
    // commit loses a fixed precedence can never be read; trap 17 says the SCENARIO has to
    // follow it too, or activeArtId always resolves to the core brief and the h1/h2
    // banners are drawn and never seen.
    //
    // So a commit claims its bench's screen and a "Next ..." button releases it. The
    // release is asymmetric on purpose -- see releaseScreen().
    screenOf: { laws: null, pack: null, warm: null, calorimeter: null, capstone: null },

    // ---- world-state: the patient you are trying to rewarm (session-local) ----
    core: CORE_START,
    elapsed: 0,
    worldLog: [],
    _wid: 0,
    scIdx: { a: -1, b: -1, c: -1, d: -1 },

    // ---- stage state ----
    lw: null, lwLaw: null, lwFlow: null, lwChecked: false, lwAttempted: false, lwDone: false, lwVerdict: null,
    pk: null, pkPick: null, pkClass: null, pkChecked: false, pkAttempted: false, pkDone: false, pkVerdict: null,
    wm: null, wmMat: '', wmQ: '', wmChecked: false, wmAttempted: false, wmDone: false, wmVerdict: null,
    cl: null, clInput: '', clChecked: false, clAttempted: false, clDone: false, clVerdict: null,
    hs: null, hsFlip: [], hsScale: [], hsChecked: false, hsAttempted: false, hsDone: false, hsVerdict: null,
    fm: null, fmInput: '', fmClass: null, fmChecked: false, fmAttempted: false, fmDone: false, fmVerdict: null,
    cap: null, capPick: null, capChecked: false, capAttempted: false, capWin: false, capVerdict: null,

    init() {
      this.gLoad();
      this.genLaw();
      this.genPack();
      this.genWarm();
      this.genCal();
      this.genHess();
      this.genFormation();
      // GOTCHA: a <select x-model> whose options come from a child x-for binds before
      // the options exist, so a non-first initial value does not stick. Re-set after paint.
      this.$nextTick(() => { const v = this.wmMat; this.wmMat = null; this.wmMat = v; });
    },

    setMode(m) {
      this.mode = m;
      if (m === 'capstone' && this.capUnlocked && !this.cap) this.genCapstone();
    },

    resetProgress() {
      this.gReset();
      this.screenOf = { laws: null, pack: null, warm: null, calorimeter: null, capstone: null };
      this.core = CORE_START; this.elapsed = 0; this.worldLog = []; this._wid = 0;
      this.scIdx = { a: -1, b: -1, c: -1, d: -1 };
      this.genLaw(); this.genPack(); this.genWarm(); this.genCal();
      this.genHess(); this.genFormation();
      this.cap = null; this.capWin = false; this.capVerdict = null;
    },

    // ---- scenario plumbing ----
    nextScenario(skill) {
      const list = SCENARIOS.filter(s => s.skill === skill);
      const i = (this.scIdx[skill] = (this.scIdx[skill] ?? -1) + 1) % list.length;
      return list[i];
    },
    scenarioById(id) { return SCENARIOS.find(s => s.id === id) || null; },

    // A commit takes the bench's mission screen: its scenario, its banner, its verdict.
    claimScreen(mode, sc, v, honors) { this.screenOf[mode] = { sc, v, honors: !!honors }; },
    // A regenerate gives it back -- asymmetrically, and the asymmetry is the whole point.
    //
    // A CORE regenerate always takes the screen. The shell hides the console's .brief
    // card, so the mission screen is the ONLY place a new situation's goal is stated; if
    // an Honors outcome could hold the screen through "Next mix", the learner would be
    // looking at a bench whose question is nowhere on the page.
    //
    // An HONORS regenerate is the polite one: it evicts an Honors claim but leaves a core
    // outcome standing, because each Honors block states its own task in the console
    // beside its own controls and so does not need the screen to be legible.
    releaseScreen(mode, honors) {
      const s = this.screenOf[mode];
      if (!honors || !s || s.honors) this.screenOf[mode] = null;
    },

    // Advance the clock, move the patient's core temperature, and prepend a log line.
    recordWorld({ icon, tone, text, delta }) {
      this.elapsed += Math.round(6 + Math.random() * 7);
      this.core = rN(Math.max(CORE_MIN, Math.min(CORE_MAX, this.core + (delta || 0))), 1);
      this.worldLog.unshift({ id: ++this._wid, icon, tone, text: `T+${this.elapsed} min: ${text}` });
      if (this.worldLog.length > 6) this.worldLog.pop();
    },
    // Core temperature mapped onto the shared .meter (30 C empty, 37 C full).
    get corePct() { return Math.max(0, Math.min(100, (this.core - 30) / 7 * 100)); },
    get coreMood() { return this.core >= 35.5 ? '\u{1F642}' : this.core >= 33 ? '\u{1F630}' : '\u{1F635}'; },
    get coreState() {
      if (this.core >= 35.5) return 'Rewarming, out of danger';
      if (this.core >= 33) return 'Mild hypothermia';
      if (this.core >= 32) return 'Shivering failing';
      return 'Moderate hypothermia, critical';
    },
    get coreColor() { return this.core >= 35.5 ? 'var(--success)' : this.core >= 33 ? 'var(--warn)' : 'var(--danger)'; },

    // The four meters in the status rail's `systems` area. Four is a hard floor, not a
    // preference: the layout audit fails every non-story state with "only N of 4 system
    // meters in the DOM" below it (porting trap 13). Every one of these is derived from
    // state this unit already kept -- core, elapsed, worldLog, gOverall -- so the port
    // adds no counter and no mechanic to the world.
    //
    // Two of them read the same thermometer and that is deliberate: Core is the raw
    // number the calls move, and Shiver is the clinical margin above 32 C, which is the
    // temperature at which she stops making any heat of her own. Shiver hits zero while
    // Core still shows a third of a bar, which is exactly the point a medic cares about.
    // Recent is the one that can fall while the other three rise.
    //
    // Values are written "33.4C" and "2/4", not "33.4 degrees" or "2 of 4": at 1024x600
    // these cells are about 115px and .life-meter-label wraps, so label plus value on two
    // lines turns a 54px row into a 73px one and four of those push the log off the
    // viewport (porting trap 15). The full meaning lives in the row's title.
    get coreReadings() {
      const logged = this.worldLog.length;
      const right = logged ? this.worldLog.filter(w => w.tone === 'success').length : 0;
      const margin = rN(Math.max(0, this.core - SHIVER_FLOOR), 1);
      return [
        { key: 'core', label: 'Core', raw: `${fmt(this.core)}C`, pct: this.corePct,
          hint: 'her core temperature: the bar is empty at 30 C and full at 37 C' },
        { key: 'shiver', label: 'Shiver', raw: `+${fmt(margin)}C`,
          pct: Math.max(0, Math.min(100, margin / (CORE_MAX - SHIVER_FLOOR) * 100)),
          hint: 'degrees of margin above 32 C, where shivering stops and she has no heat source left' },
        { key: 'systems', label: 'Systems', raw: `${Math.round(this.gOverall() * 4)}/4`,
          pct: this.gOverall() * 100,
          hint: 'core benches certified, C.13 A to D. The evacuation call unlocks at four' },
        { key: 'recent', label: 'Recent', raw: logged ? `${right}/${logged}` : '0/0',
          pct: logged ? right / logged * 100 : 100,
          hint: 'of the calls still on the log, the share that went right' }
      ];
    },
    stockColor(v) { return v >= 67 ? 'var(--success)' : v >= 34 ? 'var(--warn)' : 'var(--danger)'; },

    // ===================== cockpit readouts =====================
    // Everything the mission screen and the status rail bind to. Nothing here decides
    // anything: it reads the bench state the commit handlers below already produced.
    scArt(id) { return sceneArt(id); },

    // The bench's own scenario, before any commit has claimed the screen.
    get coreBrief() {
      if (this.mode === 'laws') return (this.lw && this.lw.sc) || null;
      if (this.mode === 'pack') return (this.pk && this.pk.sc) || null;
      if (this.mode === 'warm') return (this.wm && this.wm.sc) || null;
      if (this.mode === 'calorimeter') return (this.cl && this.cl.sc) || null;
      // The capstone brief exists before the radio is picked up, so the locked station
      // still says what it is going to ask for rather than showing an empty screen.
      if (this.mode === 'capstone') return (this.cap && this.cap.sc) || this.scenarioById('cap-evac');
      return null;
    },
    get activeBrief() {
      const s = this.screenOf[this.mode];
      return (s && s.sc) || this.coreBrief;
    },
    get activeVerdict() {
      const s = this.screenOf[this.mode];
      return (s && s.v) || null;
    },
    // True while an Honors commit holds this bench's screen, and which one. Both are used
    // only to pick the reference facts: the calorimeter bench has three possible screens,
    // so "is it Honors" is not enough to tell h1's rules from h2's.
    get screenIsHonors() {
      const s = this.screenOf[this.mode];
      return !!(s && s.honors);
    },
    get screenSkill() {
      const s = this.screenOf[this.mode];
      return (s && s.sc && s.sc.skill) || null;
    },
    get activeTone() {
      const v = this.activeVerdict;
      if (!v) return 'standby';
      if (v.tone === 'success') return 'safe';
      if (v.tone === 'warn') return 'warn';
      if (v.tone === 'fail' || v.tone === 'danger') return 'danger';
      return 'standby';
    },
    get activeArtId() {
      const b = this.activeBrief;
      return b && b.id ? b.id : 'a-two-packs';
    },
    get activeStationName() {
      const b = this.activeBrief;
      if (b && b.system) return b.system;
      return STATION_NAME[this.mode] || 'Heat Line';
    },
    get activeStateLabel() {
      const v = this.activeVerdict;
      return v && v.state ? v.state : '';
    },
    get activeOutcomeText() {
      const v = this.activeVerdict;
      if (v) return v.detail || v.headline || v.state;
      const b = this.activeBrief;
      if (b) return b.why || b.goal || '';
      return 'Pick a bench. She is losing heat while you decide, and every call you make is a heat calculation.';
    },

    // The facts a learner should never have to leave the bench to look up: a constant, a
    // formula, a threshold. Three lines at most, because this card shares a column with
    // the scenario narrative and every extra line here is a line taken off the text
    // somebody actually reads.
    //
    // They are deliberately the facts the bench does NOT already print beside its own
    // controls -- the four law statements are on the buttons, q = mc(dT) is set in KaTeX
    // over the inputs, and repeating either would spend the card on nothing. What is not
    // anywhere else is the clinical thresholds the consequences turn on, the unit trap in
    // each calculation, and the patient's current number.
    get activeReference() {
      const out = [];
      if (this.mode === 'laws') {
        out.push({ k: 'Her core now', v: fmt(this.core) + ' C, ' + this.coreState.toLowerCase() });
        out.push({ k: 'Below 32 C', v: 'shivering stops, and it was her last heat source' });
        out.push({ k: 'Absolute zero', v: '0 K is -273.15 C, about 230 below this summit' });
      } else if (this.mode === 'pack') {
        out.push({ k: 'Heat into her', v: 'take the pouch with the negative dH' });
        out.push({ k: 'Heat out of it', v: 'take the pouch with the positive dH' });
        out.push({ k: 'On the diagram', v: 'products below reactants means exothermic' });
      } else if (this.mode === 'warm') {
        out.push({ k: 'q = mc(dT)', v: 'grams x J/g per C x degrees, so q comes out in joules' });
        out.push({ k: 'Commit in kJ', v: 'divide the joules by 1000; the bench grades kilojoules' });
        out.push({ k: 'dT', v: 'target minus start, and the sign travels with it' });
      } else if (this.mode === 'calorimeter') {
        if (this.screenIsHonors && this.screenSkill === 'h1') {
          out.push({ k: 'State function', v: 'any set of steps summing to the target gives the same dH' });
          out.push({ k: 'Flip a step', v: 'and the sign of its dH flips with it' });
          out.push({ k: 'Scale a step', v: 'and its dH multiplies by the same factor' });
        } else if (this.screenIsHonors && this.screenSkill === 'h2') {
          out.push({ k: 'dHrxn', v: 'sum over products minus sum over reactants' });
          out.push({ k: 'Every term', v: 'multiplied by its coefficient in the equation' });
          out.push({ k: 'An element', v: 'in its standard state has dHf = 0 by definition' });
        } else {
          out.push({ k: 'Settles between', v: 'the answer is never outside the two starting temperatures' });
          out.push({ k: 'The bigger mc', v: 'moves least; the smaller body swings further' });
          out.push({ k: 'Both in joules', v: 'mass in grams, c in J/g per C, before you set them equal' });
        }
      } else if (this.mode === 'capstone') {
        out.push({ k: 'Aircraft', v: 'needs cloud base above the ledge at 3,100 m' });
        out.push({ k: 'Carrying her', v: 'safe only at or above 33 C core' });
        out.push({ k: 'Neither', v: 'hold in the shelter and keep the heat going until light' });
      }
      return out.slice(0, 3);
    },

    get coreSkills() { return SE.filter(se => !se.honors); },
    get teksMasteredCount() { return this.coreSkills.filter(se => this.gMastered(se.id)).length; },

    seCaption(se) {
      if (this.gMastered(se.id)) return 'Mastered';
      const sk = this.g_skills[se.id];
      const def = this.g_skillDefs.find(d => d.id === se.id) || {};
      return `${sk ? sk.run : 0} of ${def.target || 3} correct in a row`;
    },
    cOf(mat) { return SPECIFIC_HEAT[mat]; },

    // ===================== C.13(A) name the law, read the heat flow =====================
    // Decision task. Both halves must be right: the law that governs the situation AND
    // the direction heat actually moves. Each law carries its real mountain consequence.
    genLaw() {
      const sc = this.nextScenario('a');
      this.lw = { sc, laws: LAWS };
      this.lwLaw = null; this.lwFlow = null;
      this.lwChecked = false; this.lwAttempted = false; this.lwDone = false; this.lwVerdict = null;
      this.releaseScreen('laws', false);
    },
    lwPickLaw(k) { if (!this.lwDone) this.lwLaw = k; },
    lwPickFlow(k) { if (!this.lwDone) this.lwFlow = k; },
    lwLawState(k) {
      if (!this.lwChecked) return this.lwLaw === k ? 'on' : '';
      if (!this.lw) return '';
      if (k === this.lw.sc.lawKey) return 'correct';
      return k === this.lwLaw ? 'wrong' : '';
    },
    lwFlowState(k) {
      if (!this.lwChecked) return this.lwFlow === k ? 'on' : '';
      if (!this.lw) return '';
      if (k === this.lw.sc.flow.correct) return 'correct';
      return k === this.lwFlow ? 'wrong' : '';
    },
    lwCommit() {
      if (this.lwDone || !this.lwLaw || !this.lwFlow) return;
      const sc = this.lw.sc;
      const lawOk = this.lwLaw === sc.lawKey;
      const flowOk = this.lwFlow === sc.flow.correct;
      const good = lawOk && flowOk;
      const lawName = LAWS.find(l => l.key === sc.lawKey).tag;
      let v, delta, feed;
      if (good) {
        v = { tone: 'success', icon: sc.icon, state: 'CALLED IT', headline: `${lawName} governs this`,
          detail: sc.consequences[this.lwLaw], gauge: null };
        this.lwDone = true; delta = 0.3; feed = `${sc.system}, read correctly`;
      } else if (!lawOk) {
        v = { tone: 'fail', icon: '\u{1F6A8}', state: 'WRONG LAW', headline: 'Wrong law',
          detail: `${sc.consequences[this.lwLaw]} It was the ${lawName.toLowerCase()}.`, gauge: null };
        delta = -0.5; feed = `${sc.system}, wrong law`;
      } else {
        const right = sc.flow.options.find(o => o.key === sc.flow.correct).label;
        v = { tone: 'fail', icon: '\u{1F6A8}', state: 'WRONG DIRECTION', headline: 'Right law, wrong direction',
          detail: `You named the ${lawName.toLowerCase()} correctly, but read the heat flow backwards. ${right}.`, gauge: null };
        delta = -0.4; feed = `${sc.system}, flow misread`;
      }
      this.gRecord('a', good, !this.lwAttempted);
      this.recordWorld({ icon: v.icon, tone: v.tone, text: feed, delta });
      this.lwAttempted = true; this.lwChecked = true; this.lwVerdict = v;
      this.claimScreen('laws', sc, v, false);
    },
    lwNext() { this.genLaw(); },

    // ===================== C.13(C) pick the pack, classify it, draw the diagram =====================
    // Decision task. `need` is 'hot' or 'cold'; the pack that serves it is the one whose
    // enthalpy has the matching sign, so choosing correctly IS classifying correctly.
    genPack() {
      const sc = this.nextScenario('c');
      const offered = sc.constraints.packs.map(k => PACKS.find(p => p.key === k));
      const need = sc.constraints.need;
      const correct = offered.find(p => (need === 'hot' ? p.dH < 0 : p.dH > 0));
      this.pk = { sc, offered, need, correct };
      this.pkPick = null; this.pkClass = null;
      this.pkChecked = false; this.pkAttempted = false; this.pkDone = false; this.pkVerdict = null;
      this.releaseScreen('pack', false);
    },
    pkPickPack(k) { if (!this.pkDone) { this.pkPick = k; this.pkClass = null; } },
    pkPickClass(k) { if (!this.pkDone) this.pkClass = k; },
    pkPackState(k) {
      if (!this.pkChecked) return this.pkPick === k ? 'on' : '';
      if (!this.pk) return '';
      if (k === this.pk.correct.key) return 'correct';
      return k === this.pkPick ? 'wrong' : '';
    },
    pkClassState(k) {
      if (!this.pkChecked) return this.pkClass === k ? 'on' : '';
      if (!this.pk || !this.pkPick) return '';
      const chosen = this.pk.offered.find(p => p.key === this.pkPick);
      if (!chosen) return '';
      const truth = classifyThermal(chosen.dH);
      if (k === truth) return 'correct';
      return k === this.pkClass ? 'wrong' : '';
    },
    // The pack whose energy diagram is on screen: the learner's pick, else the first offered.
    get pkShown() {
      if (!this.pk) return null;
      return this.pk.offered.find(p => p.key === this.pkPick) || this.pk.offered[0];
    },
    get pkShownClass() { return this.pkShown ? classifyThermal(this.pkShown.dH) : ''; },
    // Reaction-coordinate diagram, built as a string so it can be injected with x-html.
    // Deliberately SVG rather than Chart.js: this is a labelled schematic (a barrier, a
    // dH arrow, two plateaus), not a data plot, and it needs no chart lifecycle inside
    // an x-show panel. Heights are schematic; the caption says so.
    diagramSvg() {
      const p = this.pkShown;
      if (!p) return '';
      const exo = p.dH < 0;
      const W = 520, H = 240, base = 170, top = 60;
      const yStart = exo ? top + 30 : base;              // reactants
      const yEnd = exo ? base : top + 30;                // products
      const peak = Math.min(yStart, yEnd) - Math.max(18, Math.min(60, p.ea / 2));
      const path = `M 70,${yStart} L 150,${yStart} C 210,${yStart} 220,${peak} 260,${peak} C 300,${peak} 310,${yEnd} 370,${yEnd} L 460,${yEnd}`;
      const arrowX = 415;
      const dHcolor = exo ? '#2f8f5b' : '#bf4a30';
      return `
        <path d="${path}" fill="none" stroke="#4f93a0" stroke-width="3" stroke-linecap="round"/>
        <line x1="70" y1="${yStart}" x2="460" y2="${yStart}" stroke="#cfdbe0" stroke-dasharray="4 4"/>
        <line x1="70" y1="${yEnd}" x2="460" y2="${yEnd}" stroke="#cfdbe0" stroke-dasharray="4 4"/>
        <text x="76" y="${yStart - 8}" font-family="JetBrains Mono" font-size="11" fill="#687a82">reactants</text>
        <text x="454" y="${yEnd - 8}" text-anchor="end" font-family="JetBrains Mono" font-size="11" fill="#687a82">products</text>
        <line x1="${arrowX}" y1="${yStart}" x2="${arrowX}" y2="${yEnd}" stroke="${dHcolor}" stroke-width="2"/>
        <path d="M ${arrowX - 4},${yEnd + (exo ? -6 : 6)} L ${arrowX},${yEnd} L ${arrowX + 4},${yEnd + (exo ? -6 : 6)}" fill="none" stroke="${dHcolor}" stroke-width="2"/>
        <text x="${arrowX + 8}" y="${(yStart + yEnd) / 2}" font-family="JetBrains Mono" font-size="12" font-weight="700" fill="${dHcolor}">dH = ${p.dH > 0 ? '+' : ''}${p.dH} kJ</text>
        <text x="260" y="${peak - 10}" text-anchor="middle" font-family="JetBrains Mono" font-size="10" fill="#687a82">activation barrier</text>
        <text x="265" y="${H - 12}" text-anchor="middle" font-family="JetBrains Mono" font-size="10" fill="#687a82">reaction progress</text>
        <text x="22" y="${top + 4}" font-family="JetBrains Mono" font-size="10" fill="#687a82">energy</text>`;
    },
    pkCommit() {
      if (this.pkDone || !this.pkPick || !this.pkClass) return;
      const sc = this.pk.sc;
      const chosen = this.pk.offered.find(p => p.key === this.pkPick);
      const packOk = this.pkPick === this.pk.correct.key;
      const classOk = this.pkClass === classifyThermal(chosen.dH);
      const good = packOk && classOk;
      const sign = `${chosen.name} runs at dH = ${chosen.dH > 0 ? '+' : ''}${chosen.dH} kJ ${chosen.per}, so it is ${classifyThermal(chosen.dH)}.`;
      let v, delta, feed;
      if (good) {
        v = { tone: 'success', icon: sc.icon, state: 'RIGHT PACK', headline: 'Right pack',
          detail: `${sign} ${sc.consequences[this.pkPick]}`, gauge: null };
        this.pkDone = true; delta = 0.4; feed = `${sc.system}, right pack`;
      } else if (!packOk) {
        v = { tone: 'fail', icon: '\u{1F6A8}', state: 'WRONG PACK', headline: 'Wrong pack',
          detail: `${sign} ${sc.consequences[this.pkPick]}`, gauge: null };
        delta = -0.6; feed = `${sc.system}, wrong pack`;
      } else {
        v = { tone: 'warn', icon: '\u{2699}\u{FE0F}', state: 'CHECK THE SIGN', headline: 'Right pack, wrong label',
          detail: `You reached for the right pouch, but mislabelled the process. ${sign}`, gauge: null };
        delta = -0.2; feed = `${sc.system}, sign misread`;
      }
      this.gRecord('c', good, !this.pkAttempted);
      this.recordWorld({ icon: v.icon, tone: v.tone, text: feed, delta });
      this.pkAttempted = true; this.pkChecked = true; this.pkVerdict = v;
      this.claimScreen('pack', sc, v, false);
    },
    pkNext() { this.genPack(); },

    // ===================== C.13(D) q = mc(dT), the rewarming dose =====================
    // Dose task. The method precondition is choosing the right specific heat; the value
    // the learner commits is their own q in kJ, so it genuinely varies (a backwards dT
    // lands low, a forgotten division by 1000 lands far high) and the four bands mean something.
    genWarm() {
      const sc = this.nextScenario('d');
      const k = sc.constraints;
      const m = rand(k.massMin, k.massMax, 0);
      const t0 = rand(k.startMin, k.startMax, 1);
      const t1 = rand(k.targetMin, k.targetMax, 1);
      const c = SPECIFIC_HEAT[k.material];
      const dT = rN(t1 - t0, 1);
      const trueQ = rN(heatTransfer({ q: null, m, c, dT }).q / 1000, 3);   // kJ
      this.wm = { sc, material: k.material, m, t0, t1, c, dT, trueQ, bands: sc.bands };
      this.wmMat = ''; this.wmQ = '';
      this.wmChecked = false; this.wmAttempted = false; this.wmDone = false; this.wmVerdict = null;
      this.releaseScreen('warm', false);
    },
    get wmMatOk() { return !!this.wm && this.wmMat === this.wm.material; },
    // Live preview of q from whatever specific heat is currently selected.
    get wmPreview() {
      if (!this.wm || !this.wmMat) return null;
      const c = SPECIFIC_HEAT[this.wmMat];
      if (c === undefined) return null;
      return rN(heatTransfer({ q: null, m: this.wm.m, c, dT: this.wm.dT }).q / 1000, 3);
    },
    wmRun() {
      if (this.wmDone || !this.wmMat || this.wmQ === '') return;
      const sc = this.wm.sc;
      const q = parseFloat(this.wmQ);
      const needTxt = `${fmt(this.wm.trueQ)} kJ`;
      let v, good = false, delta, feed;
      if (!this.wmMatOk) {
        v = { tone: 'fail', icon: '\u{2699}\u{FE0F}', state: 'WRONG SPECIFIC HEAT', headline: 'Wrong material',
          detail: `You sized the heat using the specific heat of ${this.wmMat} (${fmt(SPECIFIC_HEAT[this.wmMat])} J/g per degree C). This job heats ${this.wm.material}, which takes ${fmt(this.wm.c)} J/g per degree C, so the whole number is built on the wrong constant.`,
          gauge: null };
        delta = -0.3; feed = `${sc.system}, wrong specific heat`;
      } else if (!isFinite(q)) {
        v = { tone: 'fail', icon: '\u{2699}\u{FE0F}', state: 'NO NUMBER', headline: 'Nothing to run on',
          detail: sc.fail, gauge: null };
        delta = -0.2; feed = `${sc.system}, no value`;
      } else {
        const band = outcomeBand(q, this.wm.trueQ, this.wm.bands);
        good = band.withinSpec;
        const dev = `${Math.abs((q - this.wm.trueQ) / this.wm.trueQ * 100).toFixed(0)}%`;
        const yours = `${fmt(q)} kJ`;
        if (good) {
          v = { tone: 'success', icon: sc.icon, state: sc.safeState, headline: 'On spec',
            detail: `You called ${yours} against the ${needTxt} the job needs. ${sc.safe}`, gauge: 'on' };
          this.wmDone = true; delta = 0.5;
          feed = `${sc.system}, on spec`;
        } else if (band.direction === 'low') {
          v = { tone: 'fail', icon: '\u{1F6A8}', state: sc.lowState, headline: 'Too little heat',
            detail: `You called ${yours}, ${dev} short of the ${needTxt} needed. ${sc.low}`, gauge: 'low' };
          delta = -0.7; feed = `${sc.system}, under-heated`;
        } else {
          v = { tone: 'fail', icon: '\u{1F6A8}', state: sc.highState, headline: 'Too much heat',
            detail: `You called ${yours}, ${dev} over the ${needTxt} needed. ${sc.high}`, gauge: 'high' };
          delta = -0.7; feed = `${sc.system}, over-heated`;
        }
      }
      this.gRecord('d', good, !this.wmAttempted);
      this.recordWorld({ icon: v.icon, tone: v.tone, text: feed, delta });
      this.wmAttempted = true; this.wmChecked = true; this.wmVerdict = v;
      this.claimScreen('warm', sc, v, false);
    },
    wmNext() { this.genWarm(); },

    // ===================== C.13(B) calorimetry: heat lost = heat gained =====================
    // Dose task in absolute degrees: predict where two bodies settle. A degree is a
    // degree whatever the pot holds, so the bands are absolute rather than relative.
    genCal() {
      const sc = this.nextScenario('b');
      const k = sc.constraints;
      const hot = { m: rand(k.hotMin, k.hotMax, 0), c: SPECIFIC_HEAT[k.hotMaterial], t: rand(k.hotTMin, k.hotTMax, 0) };
      const cold = { m: rand(k.coldMin, k.coldMax, 0), c: SPECIFIC_HEAT[k.coldMaterial], t: rand(k.coldTMin, k.coldTMax, 1) };
      const res = finalTemperature(hot, cold);
      this.cl = { sc, hot, cold, hotMat: k.hotMaterial, coldMat: k.coldMaterial,
        tFinal: rN(res.tFinal, 2), q: rN(res.qTransferred, 0), bands: sc.bands };
      this.clInput = '';
      this.clChecked = false; this.clAttempted = false; this.clDone = false; this.clVerdict = null;
      this.releaseScreen('calorimeter', false);
    },
    clCommit() {
      if (this.clDone || this.clInput === '') return;
      const sc = this.cl.sc;
      const t = parseFloat(this.clInput);
      const needTxt = `${fmt(this.cl.tFinal)} degrees C`;
      let v, good = false, delta, feed;
      if (!isFinite(t)) {
        v = { tone: 'fail', icon: '\u{2699}\u{FE0F}', state: 'NO PREDICTION', headline: 'Nothing to act on',
          detail: sc.fail, gauge: null };
        delta = -0.2; feed = `${sc.system}, no prediction`;
      } else {
        const band = outcomeBand(t, this.cl.tFinal, this.cl.bands);
        good = band.withinSpec;
        const off = `${fmt(Math.abs(t - this.cl.tFinal))} degrees`;
        const yours = `${fmt(t)} degrees C`;
        if (good) {
          v = { tone: 'success', icon: sc.icon, state: sc.safeState, headline: 'Called it',
            detail: `You predicted ${yours}; it settles at ${needTxt}. ${sc.safe}`, gauge: 'on' };
          this.clDone = true; delta = 0.5; feed = `${sc.system}, predicted`;
        } else if (band.direction === 'low') {
          v = { tone: 'fail', icon: '\u{1F6A8}', state: sc.lowState, headline: 'Predicted too cold',
            detail: `You predicted ${yours}, ${off} below the ${needTxt} it actually reaches. ${sc.low}`, gauge: 'low' };
          delta = -0.7; feed = `${sc.system}, under-predicted`;
        } else {
          v = { tone: 'fail', icon: '\u{1F6A8}', state: sc.highState, headline: 'Predicted too hot',
            detail: `You predicted ${yours}, ${off} above the ${needTxt} it actually reaches. ${sc.high}`, gauge: 'high' };
          delta = -0.7; feed = `${sc.system}, over-predicted`;
        }
      }
      this.gRecord('b', good, !this.clAttempted);
      this.recordWorld({ icon: v.icon, tone: v.tone, text: feed, delta });
      this.clAttempted = true; this.clChecked = true; this.clVerdict = v;
      this.claimScreen('calorimeter', sc, v, false);
    },
    clNext() { this.genCal(); },

    // ===================== Honors h1: Hess's law route =====================
    // The route's steps carry the correct flip/scale as the answer key; the learner starts
    // with every step un-flipped at scale 1 and has to assemble the target themselves.
    genHess() {
      const sc = SCENARIOS.find(s => s.id === 'h1-route');
      const route = pick(HESS_ROUTES);
      this.hs = { sc, route, target: route.target };
      this.hsFlip = route.steps.map(() => false);
      this.hsScale = route.steps.map(() => 1);
      this.hsChecked = false; this.hsAttempted = false; this.hsDone = false; this.hsVerdict = null;
      this.releaseScreen('calorimeter', true);
    },
    hsToggle(i) { if (!this.hsDone) { this.hsFlip[i] = !this.hsFlip[i]; this.hsChecked = false; } },
    hsStep(i, d) { if (!this.hsDone) { this.hsScale[i] = Math.max(1, Math.min(4, this.hsScale[i] + d)); this.hsChecked = false; } },
    hsTermDH(i) {
      if (!this.hs) return 0;
      const s = this.hs.route.steps[i];
      if (!s) return 0;
      return rN((this.hsFlip[i] ? -s.dH : s.dH) * this.hsScale[i], 1);
    },
    get hsTotal() {
      if (!this.hs) return 0;
      return rN(hessCombine(this.hs.route.steps.map((s, i) => ({ dH: s.dH, flip: this.hsFlip[i], scale: this.hsScale[i] }))), 1);
    },
    get hsOk() { return !!this.hs && Math.abs(this.hsTotal - this.hs.target.dH) <= 0.05; },
    hsCommit() {
      if (this.hsDone) return;
      const sc = this.hs.sc;
      const ok = this.hsOk;
      let v;
      if (ok) {
        v = { tone: 'success', icon: sc.icon, state: 'ROUTE PRICED', headline: 'Route priced',
          detail: `Your steps sum to ${fmt(this.hsTotal)} kJ, matching the target. ${sc.success}`, gauge: null };
        this.hsDone = true;
        this.recordWorld({ icon: sc.icon, tone: 'success', text: `${sc.system}, route priced`, delta: 0.3 });
      } else {
        v = { tone: 'fail', icon: '\u{1F6A8}', state: 'ROUTE WRONG', headline: 'Steps do not add up',
          detail: `Your steps sum to ${fmt(this.hsTotal)} kJ, but the target route is ${fmt(this.hs.target.dH)} kJ. ${sc.fail}`, gauge: null };
        this.recordWorld({ icon: '\u{1F6A8}', tone: 'fail', text: `${sc.system}, route wrong`, delta: -0.4 });
      }
      this.gRecord('h1', ok, !this.hsAttempted);
      this.hsAttempted = true; this.hsChecked = true; this.hsVerdict = v;
      this.claimScreen('calorimeter', sc, v, true);
    },
    hsNext() { this.genHess(); },

    // ===================== Honors h2: enthalpy from formation data =====================
    genFormation() {
      const sc = SCENARIOS.find(s => s.id === 'h2-formation');
      const fc = pick(FORMATION_CASES);
      const trueDH = rN(enthalpyFromFormation(fc.products, fc.reactants), 1);
      this.fm = { sc, fc, trueDH, trueClass: classifyThermal(trueDH) };
      this.fmInput = ''; this.fmClass = null;
      this.fmChecked = false; this.fmAttempted = false; this.fmDone = false; this.fmVerdict = null;
      this.releaseScreen('calorimeter', true);
    },
    fmPickClass(k) { if (!this.fmDone) this.fmClass = k; },
    fmClassState(k) {
      if (!this.fmChecked) return this.fmClass === k ? 'on' : '';
      if (!this.fm) return '';
      if (k === this.fm.trueClass) return 'correct';
      return k === this.fmClass ? 'wrong' : '';
    },
    get fmValueOk() {
      if (!this.fm) return false;
      const v = parseFloat(this.fmInput);
      return isFinite(v) && Math.abs(v - this.fm.trueDH) <= 1.0;
    },
    fmCommit() {
      if (this.fmDone || this.fmInput === '' || !this.fmClass) return;
      const sc = this.fm.sc;
      const valueOk = this.fmValueOk;
      const classOk = this.fmClass === this.fm.trueClass;
      const good = valueOk && classOk;
      const truth = `dHrxn works out to ${fmt(this.fm.trueDH)} kJ, which is ${this.fm.trueClass}.`;
      let v, delta;
      if (good) {
        v = { tone: 'success', icon: sc.icon, state: 'ENTHALPY CHECKED', headline: 'Enthalpy confirmed',
          detail: `${truth} ${sc.success}`, gauge: null };
        this.fmDone = true; delta = 0.3;
      } else if (!valueOk) {
        v = { tone: 'fail', icon: '\u{1F6A8}', state: 'VALUE OFF', headline: 'Enthalpy is off',
          detail: `${sc.fail} ${truth} Remember it is the sum over products minus the sum over reactants, each term multiplied by its coefficient.`, gauge: null };
        delta = -0.4;
      } else {
        v = { tone: 'warn', icon: '\u{2699}\u{FE0F}', state: 'CHECK THE SIGN', headline: 'Right number, wrong label',
          detail: `Your value is right, but the classification is not. ${truth} A negative dH releases heat.`, gauge: null };
        delta = -0.2;
      }
      this.gRecord('h2', good, !this.fmAttempted);
      this.recordWorld({ icon: v.icon, tone: v.tone, text: `${sc.system}, ${good ? 'checked' : 'off'}`, delta });
      this.fmAttempted = true; this.fmChecked = true; this.fmVerdict = v;
      this.claimScreen('calorimeter', sc, v, true);
    },
    fmNext() { this.genFormation(); },

    // ===================== Capstone: the evacuation call =====================
    get capUnlocked() { return this.gOverall() === 1; },
    genCapstone() {
      const sc = SCENARIOS.find(s => s.id === 'cap-evac');
      // Two generated conditions decide the one defensible call: can an aircraft get in,
      // and is she warm enough to move. Nothing here is a fake trade-off.
      const ceilingOk = Math.random() < 0.5;
      const ceiling = ceilingOk ? rand(3400, 4200, 0) : rand(2300, 3000, 0);
      const ledge = 3100;
      const movable = this.core >= 33;
      const correct = ceilingOk ? 'heli' : (movable ? 'carry' : 'hold');
      this.cap = { sc, ceiling, ledge, ceilingOk, movable, correct, coreAtCall: this.core };
      this.capPick = null; this.capChecked = false; this.capAttempted = false;
      this.capWin = false; this.capVerdict = null;
    },
    capPickAction(k) { if (!this.capWin) this.capPick = k; },
    capActionState(k) {
      if (!this.capChecked) return this.capPick === k ? 'on' : '';
      if (!this.cap) return '';
      if (k === this.cap.correct) return 'correct';
      return k === this.capPick ? 'wrong' : '';
    },
    capCommit() {
      if (this.capWin || !this.capPick) return;
      const sc = this.cap.sc;
      const opt = sc.options.find(o => o.key === this.capPick);
      const fig = `Cloud base is ${fmt(this.cap.ceiling)} m against a ledge at ${fmt(this.cap.ledge)} m, so an aircraft ${this.cap.ceilingOk ? 'can' : 'cannot'} get in. Her core is ${fmt(this.cap.coreAtCall)} degrees C, ${this.cap.movable ? 'stable enough to move' : 'too cold to move safely'}.`;
      const good = this.capPick === this.cap.correct;
      let v, delta;
      if (good) {
        v = { tone: 'success', icon: sc.icon, state: 'RIGHT CALL', headline: 'Right call',
          detail: `${fig} ${opt.good}`, gauge: null };
        this.capWin = true; delta = 1.2;
      } else {
        v = { tone: 'fail', icon: '\u{1F6A8}', state: 'WRONG CALL', headline: 'Wrong call',
          detail: `${fig} ${opt.consequence}`, gauge: null };
        delta = -1.2;
      }
      this.gRecord('cap', good, !this.capAttempted);
      this.recordWorld({ icon: v.icon, tone: v.tone, text: `${sc.system}, ${good ? 'right call' : 'wrong call'}`, delta });
      this.capAttempted = true; this.capChecked = true; this.capVerdict = v;
      this.claimScreen('capstone', sc, v, false);
    }
  };
}
