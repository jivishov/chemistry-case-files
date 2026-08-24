// main.js - Unit 11 view-model (Nuclear Chemistry, TEKS C.14). Scenario layer.
//
// The units_new build: units/11-nuclear rendered in the mission-cockpit shell. Unit 11 was
// retrofitted with its Scenario layer before this tree existed, so the chemistry, the
// grading, the consequences and the world-state all arrived working and are copied as they
// were. What this file adds over the worksheet build is presentation plumbing only:
//   * unitId 'units_new/11-nuclear', so progress never collides with the old save
//   * the cockpit readouts the mission screen and the status rail bind to (activeBrief,
//     activeVerdict, activeTone, activeArtId, activeStationName, activeStateLabel,
//     activeOutcomeText, activeReference, coreSkills, teksMasteredCount, scArt)
//   * screenOf, the per-bench claim on that one screen -- see the block comment on it.
//     Three of the five benches here carry a core commit AND an Honors commit.
//   * vialReadings / listSvg, the four rail meters and the morning's list figure.
//   * calls / callsRight, counted off recordWorld so the rail can show a hit rate. They
//     are bookkeeping for the rail and feed nothing that grades.
// No band, verdict, consequence or scenario text is changed by the port. In particular
// recordWorld keeps its own signature -- { icon, tone, text, minutes, spend } -- because
// in this unit the decay is real: the vial falls by halfLifeRemaining() over exactly the
// minutes the call took, and only then by what the call spent.
// Wires model.js + the engine + the shared game framework. Every stage is a brief ->
// tool -> commit -> consequence (GAMIFICATION design rule 0): the emission picker with
// its A and Z steppers, the fission/fusion classifier, the isotope bench and the
// activity calculator are the tools; committing produces a verdict (outcomeBand on the
// dose stage, per-option consequences everywhere else) that feeds a session-local
// world-state. Here the world-state IS nuclear: the activity left in the morning's
// technetium vial, in millicuries, falling on the real 6 hour half-life. Wrong calls
// cost minutes, and minutes cost activity. Outcomes are primary; XP and streak stay a
// quiet line; per-TEKS mastery meters persist.
import {
  SE, EMISSIONS, REASONS, UNIT_HOURS, UNIT_LABEL,
  SERIES, BINDING_CASES, DOSAGE_CASES, SCENARIOS
} from './model.js';
import {
  NUCLIDES, DECAY_PARTICLES, decayProduct, isBalancedNuclear, symbolForZ, nameForZ,
  halfLifeRemaining, nucleonMassSum, massDefect, bindingEnergyMeV, MEV_PER_U,
  HYDROGEN_ATOM_MASS_U, NEUTRON_MASS_U, effectiveHalfLife, fmt
} from '../../../shared/js/chem.js';
import { createGame, outcomeBand } from '../../../shared/js/game.js';
import { sceneArt } from './art.js';

const pick = a => a[(Math.random() * a.length) | 0];
const rN = (x, n) => { const p = 10 ** n; return Math.round(x * p) / p; };
const rand = (lo, hi, dp = 0) => rN(lo + Math.random() * (hi - lo), dp);
const nuclide = sym => NUCLIDES.find(n => n.sym === sym);

// The vial is the world-state. A generator elution of a few hundred millicuries is an
// ordinary morning, a single adult dose is roughly 25 mCi, and the technetium in it
// halves every 6 hours whatever anybody does about it.
const START_VIAL = 340;      // mCi on the bench at 07:00
const TC_HALFLIFE_H = 6;     // hours
const DOSE_MCI = 25;         // one adult dose drawn from the vial
const SHIFT_START = 7 * 60;  // 07:00, in minutes past midnight

// Fallback for the header's active-station line, used only before a bench has generated
// its first scenario. After that the scenario's own `system` is the better name, because
// it says which job is in front of you rather than which tab is open.
const STATION_NAME = {
  ident: 'Identify the source', dose: 'What is left', apply: 'Pick the isotope',
  power: 'Fission or fusion', capstone: 'The last call'
};

// The morning runs 07:00 to the 14:00 delivery, and the elution could make thirteen adult
// doses when it landed. Both are rail denominators only.
const SHIFT_MINUTES = 7 * 60;
const START_DOSES = Math.floor(START_VIAL / DOSE_MCI);
const LIST_SIZE = 8;              // patients on this morning's list

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const skills = [
  { id: 'a',   code: 'C.14(A)',  label: 'Decay equations',    target: 3 },
  { id: 'b',   code: 'C.14(B)',  label: 'Fission vs fusion',  target: 3 },
  { id: 'c',   code: 'C.14(C)',  label: 'Applications',       target: 3 },
  { id: 'hl',  code: 'C.14(C)',  label: 'Half-life on the clock', target: 3 },
  { id: 'h1',  code: 'Honors',   label: 'Decay series',       target: 2, honors: true },
  { id: 'h2',  code: 'Honors',   label: 'Binding energy',     target: 2, honors: true },
  { id: 'h3',  code: 'Honors',   label: 'Effective half-life', target: 2, honors: true },
  { id: 'cap', code: 'Capstone', label: 'The last call',      target: 1, honors: true }
];

// mhchem fragment for one nuclide, e.g. ^{99}_{43}Tc. Falls back to the bare atomic
// number when a Z is off the end of both reference tables, which the stepper ranges
// are built to prevent.
const nucCE = (A, Z) => `^{${A}}_{${Z}}${symbolForZ(Z) || `\\text{Z${Z}}`}`;

export { SE };

export function createSim() {
  return {
    ...createGame({ unitId: 'units_new/11-nuclear', skills }),
    SE, fmt, EMISSIONS, REASONS, MEV_PER_U, HYDROGEN_ATOM_MASS_U, NEUTRON_MASS_U,
    honors: false,
    mode: 'ident',
    // Standards tracking is a teacher-facing concern, so it collapses to one header badge
    // and expands on demand. Session-only: nothing about it is worth persisting.
    teksOpen: false,

    // Which scenario and which verdict own the mission screen, per bench.
    //
    // The screen shows ONE scenario and ONE verdict, and three of this unit's five benches
    // carry two commits: a core call and an Honors call, each with its own scenario, its
    // own banner and its own consequence (ident carries the decay series, power carries
    // binding energy, dose carries effective half-life). Porting trap 3 says the verdict
    // has to follow recency or whichever commit loses a fixed precedence can never be
    // read; trap 17 says the SCENARIO has to follow it too, or the h1/h2/h3 banners are
    // drawn and never seen.
    //
    // So a commit claims its bench's screen and a "Next ..." button releases it. The
    // release is asymmetric on purpose, see releaseScreen().
    screenOf: { ident: null, dose: null, apply: null, power: null, capstone: null },

    // ---- world-state: the morning's vial and the clock eating it (session-local) ----
    vial: START_VIAL,
    clockMin: 0,
    patients: 0,
    worldLog: [],
    _wid: 0,
    // Rail bookkeeping only: how many calls have been committed and how many of those
    // were right. Nothing here grades anything; gRecord still owns mastery.
    calls: 0,
    callsRight: 0,
    scIdx: { a: -1, b: -1, c: -1, hl: -1 },

    // ---- stage state ----
    id_: null, idEm: null, idA: 0, idZ: 0, idChecked: false, idAttempted: false, idDone: false, idVerdict: null,
    pw: null, pwKind: null, pwAns: null, pwChecked: false, pwAttempted: false, pwDone: false, pwVerdict: null,
    ap: null, apPick: null, apReason: null, apChecked: false, apAttempted: false, apDone: false, apVerdict: null,
    ds: null, dsIso: '', dsVal: '', dsChecked: false, dsAttempted: false, dsDone: false, dsVerdict: null,
    sr: null, srAlpha: 0, srBeta: 0, srChecked: false, srAttempted: false, srDone: false, srVerdict: null,
    be: null, beVal: '', beClass: null, beChecked: false, beAttempted: false, beDone: false, beVerdict: null,
    ef: null, efTe: '', efTime: '', efChecked: false, efAttempted: false, efDone: false, efVerdict: null,
    cap: null, capPick: null, capChecked: false, capAttempted: false, capWin: false, capVerdict: null,

    init() {
      this.gLoad();
      this.genIdent();
      this.genPower();
      this.genApply();
      this.genDose();
      this.genSeries();
      this.genBinding();
      this.genEffective();
      // GOTCHA: a <select x-model> whose options come from a child x-for binds before
      // the options exist, so a non-first initial value does not stick. Re-set after paint.
      this.$nextTick(() => { const v = this.dsIso; this.dsIso = null; this.dsIso = v; });
    },

    setMode(m) {
      this.mode = m;
      if (m === 'capstone' && this.capUnlocked && !this.cap) this.genCapstone();
    },

    resetProgress() {
      this.gReset();
      this.vial = START_VIAL; this.clockMin = 0; this.patients = 0; this.worldLog = [];
      this.calls = 0; this.callsRight = 0;
      this.screenOf = { ident: null, dose: null, apply: null, power: null, capstone: null };
      this.scIdx = { a: -1, b: -1, c: -1, hl: -1 };
      this.genIdent(); this.genPower(); this.genApply(); this.genDose();
      this.genSeries(); this.genBinding(); this.genEffective();
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
    // card, so the mission screen is the ONLY place a new job's goal is stated; if an
    // Honors outcome could hold the screen through "Next source", the learner would be
    // looking at a bench whose question is nowhere on the page.
    //
    // An HONORS regenerate is the polite one: it evicts an Honors claim but leaves a core
    // outcome standing, because each Honors block states its own task in the console
    // beside its controls and so does not need the screen to be legible.
    releaseScreen(mode, honors) {
      const s = this.screenOf[mode];
      if (!honors || !s || s.honors) this.screenOf[mode] = null;
    },

    // Advance the shift clock, decay the vial by exactly that much real time, apply any
    // activity the call wasted or spent, and prepend a log line. A wrong call costs
    // roughly three times as many minutes as a right one, which is the whole feedback
    // loop: the isotope does not wait for you.
    recordWorld({ icon, tone, text, minutes, spend = 0 }) {
      this.calls += 1;
      if (tone === 'success') this.callsRight += 1;
      this.clockMin += minutes;
      const decayed = halfLifeRemaining(this.vial, minutes / 60, TC_HALFLIFE_H);
      this.vial = rN(Math.max(0, decayed - spend), 1);
      this.worldLog.unshift({ id: ++this._wid, icon, tone, text: `${this.clockLabel} ${text}` });
      if (this.worldLog.length > 6) this.worldLog.pop();
    },
    get clockLabel() {
      const t = SHIFT_START + this.clockMin;
      return `${String(Math.floor(t / 60) % 24).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;
    },
    get dosesLeft() { return Math.floor(this.vial / DOSE_MCI); },
    get vialPct() { return Math.max(0, Math.min(100, this.vial / START_VIAL * 100)); },
    get vialMood() { return this.vial >= START_VIAL * 0.55 ? '\u{1F642}' : this.vial >= START_VIAL * 0.25 ? '\u{1F630}' : '\u{1F635}'; },
    get vialState() {
      if (this.vial >= START_VIAL * 0.55) return 'Vial hot, list on track';
      if (this.vial >= START_VIAL * 0.25) return 'Activity fading';
      if (this.vial >= DOSE_MCI) return 'Down to the last doses';
      return 'Below a usable dose';
    },
    get vialColor() {
      return this.vial >= START_VIAL * 0.55 ? 'var(--success)'
        : this.vial >= START_VIAL * 0.25 ? 'var(--warn)' : 'var(--danger)';
    },


    // ===================== the status rail =====================
    // Four meters, because tests/unit5a-layout.test.mjs fails every non-story state with
    // "only N of 4 system meters in the DOM" when .system-grid .ship-stock is under four
    // (porting trap 13). Finding four HONEST numbers in a one-quantity world took some
    // looking: the vial itself is already the crew meter above these, so these are the
    // four things the morning actually spends -- doses, patients, time, and the share of
    // calls that were right, which is the one that can fall while the others rise.
    //
    // Values are written short ("9/13", not "9 of 13") and labels are one word, because
    // .life-meter-label wraps and a two-line row costs the log its place on a 600px
    // viewport (porting traps 9 and 15). The meaning lives in each row's title.
    get minutesLeft() { return Math.max(0, SHIFT_MINUTES - this.clockMin); },
    get vialReadings() {
      const doses = this.dosesLeft;
      // A success rate does not exist until the first call is committed. Showing 100% on
      // a fresh vial would turn the rail into a false mastery claim instead of a readout.
      const right = this.calls ? Math.round(this.callsRight / this.calls * 100) : null;
      const left = this.minutesLeft;
      return [
        { key: 'doses', label: 'Doses', raw: `${doses}/${START_DOSES}`, pct: doses / START_DOSES * 100,
          hint: 'adult doses the vial can still make, at 25 mCi each' },
        { key: 'seen', label: 'Seen', raw: `${this.patients}/${LIST_SIZE}`, pct: this.patients / LIST_SIZE * 100,
          hint: 'patients off this morning’s list of eight' },
        { key: 'clock', label: 'Clock', raw: `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`,
          pct: left / SHIFT_MINUTES * 100,
          hint: 'time left before the fresh generator lands at 14:00' },
        { key: 'right', label: 'Right', raw: right === null ? '-' : `${right}%`, pct: right ?? 0,
          hint: 'of the calls you have committed, the share that were right' }
      ];
    },
    stockColor(v) { return v >= 67 ? 'var(--success)' : v >= 34 ? 'var(--warn)' : 'var(--danger)'; },

    // The morning's list, for the rail. Alpine's <template x-for> does not bind loop scope
    // inside an <svg>, so it is built as a string and injected with x-html on a <g> (the
    // house pattern, RETROFIT-U1-U4.md section 8 trap 2).
    //
    // Drawn for a ~230px column, not for a worksheet page: eight patient slots as
    // silhouettes with no text in them at all, over a shift bar that marks where 07:00,
    // the one full half-life at 13:00 and the 14:00 delivery fall. The counts are on the
    // meters above; every slot keeps a <title> so the detail is still reachable.
    listSvg() {
      let out = '';
      for (let i = 0; i < LIST_SIZE; i++) {
        const x = 4 + i * 29, done = i < this.patients;
        const fill = done ? '#eaf5ee' : '#eef3f4', line = done ? '#4f9a70' : '#cfdbe0';
        const dash = done ? '' : ' stroke-dasharray="3 3"';
        out += `<g><title>${esc(done ? `Patient ${i + 1}: scanned` : `Patient ${i + 1}: still on the list`)}</title>`
          + `<circle cx="${x + 12}" cy="18" r="7" fill="${fill}" stroke="${line}" stroke-width="1.6"${dash}/>`
          + `<path d="M${x + 2} 46 v-8 a10 10 0 0 1 20 0 v8 z" fill="${fill}" stroke="${line}" stroke-width="1.6"${dash}/>`
          + (done ? `<path d="M${x + 7} 30 l4 5 l8 -10" fill="none" stroke="#2f8f5b" stroke-width="2.4"`
            + ` stroke-linecap="round" stroke-linejoin="round"/>` : '')
          + `</g>`;
      }
      // The shift bar: 07:00 on the left, the 14:00 delivery on the right, an amber tick
      // at 13:00 where the vial has been through one full six-hour half-life.
      const t = Math.min(1, this.clockMin / SHIFT_MINUTES);
      const mark = (4 + 228 * (6 / 7)).toFixed(1);
      out += `<g><title>${esc(`${this.clockLabel}, ${this.minutesLeft} minutes before the 14:00 delivery`)}</title>`
        + `<rect x="4" y="62" width="228" height="12" rx="6" fill="#eef3f4" stroke="#cfdbe0" stroke-width="1.2"/>`
        + `<rect x="4" y="62" width="${(228 * t).toFixed(1)}" height="12" rx="6" fill="#79b0ba" opacity=".55"/>`
        + `<line x1="${mark}" y1="60" x2="${mark}" y2="76" stroke="#b8881f" stroke-width="1.6"/>`
        + `<rect x="${(2 + 228 * t).toFixed(1)}" y="57" width="4" height="22" rx="2" fill="#08141a"/>`
        + `</g>`;
      out += `<g fill="#687a82" font-family="'JetBrains Mono', ui-monospace, monospace" font-size="9">`
        + `<text x="4" y="90">07:00</text>`
        + `<text x="232" y="90" text-anchor="end">14:00</text></g>`;
      return out;
    },

    // ===================== cockpit readouts =====================
    // Everything the mission screen and the status rail bind to. Nothing here decides
    // anything: it reads the bench state the commit handlers already produced.
    scArt(id) { return sceneArt(id); },

    // The bench's own scenario, before any commit has claimed the screen.
    get coreBrief() {
      if (this.mode === 'ident') return (this.id_ && this.id_.sc) || null;
      if (this.mode === 'power') return (this.pw && this.pw.sc) || null;
      if (this.mode === 'apply') return (this.ap && this.ap.sc) || null;
      if (this.mode === 'dose') return (this.ds && this.ds.sc) || null;
      // The capstone brief exists before the call is taken, so the locked station still
      // says what it is going to ask for rather than showing an empty screen.
      if (this.mode === 'capstone') return (this.cap && this.cap.sc) || this.scenarioById('cap-lastcase');
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
    // True while an Honors commit holds this bench's screen. Used only to pick which
    // reference facts belong on it.
    get screenIsHonors() {
      const s = this.screenOf[this.mode];
      return !!(s && s.honors);
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
      return b && b.id ? b.id : 'a-generator';
    },
    get activeStationName() {
      const b = this.activeBrief;
      if (b && b.system) return b.system;
      return STATION_NAME[this.mode] || 'Hot lab';
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
      return 'Pick a bench. Eight patients are on the list, and the vial is halving every six hours whether you are ready or not.';
    },

    // The facts a learner should never have to leave the bench to look up. Three lines at
    // most, because this card shares a column with the scenario narrative and every extra
    // line here is a line taken off the text somebody actually reads.
    //
    // Deliberately the rules the bench does NOT already print beside its own buttons: the
    // emission cards carry their own penetration descriptions and the isotope cards carry
    // their own half-lives, so these are the conservation rules and the selection rules
    // instead. The three benches that carry an Honors commit swap in that call's rules
    // while its outcome holds the screen, because by then the core rule has been used and
    // the chain, the curve and the two clearance routes are what is in play.
    get activeReference() {
      const out = [];
      if (this.mode === 'ident') {
        if (this.screenIsHonors) {
          out.push({ k: 'Only alpha', v: 'moves the mass number, and only ever by 4' });
          out.push({ k: 'So the alphas', v: 'are fixed: parent A minus final A, divided by 4' });
          out.push({ k: 'Then the betas', v: 'each put the atomic number back up by 1' });
        } else {
          out.push({ k: 'Alpha', v: 'A falls by 4, Z falls by 2' });
          out.push({ k: 'Beta minus', v: 'A unchanged, Z rises by 1 · a positron drops Z by 1' });
          out.push({ k: 'Gamma', v: 'A and Z both unchanged, so the element cannot change' });
        }
      } else if (this.mode === 'dose') {
        if (this.screenIsHonors) {
          out.push({ k: 'Rates add', v: '1/te = 1/tp + 1/tb, so te is shorter than either one' });
          out.push({ k: 'To a threshold', v: 'te multiplied by log2 of 1 over the fraction you want' });
          out.push({ k: 'Never average', v: 'averaging the two half-lives is the standard wrong answer' });
        } else {
          out.push({ k: 'Decay law', v: 'N = N0 times one half, to the power t over the half-life' });
          out.push({ k: 'The trap', v: 'decay it on the vial isotope, not on the parent it came off' });
          out.push({ k: 'One adult dose', v: '25 mCi, drawn out of the morning vial' });
        }
      } else if (this.mode === 'apply') {
        out.push({ k: 'To be seen', v: 'gamma only, so it reaches a camera and leaves nothing behind' });
        out.push({ k: 'To treat', v: 'beta or alpha, which dump their energy within millimetres' });
        out.push({ k: 'To last', v: 'match the half-life to how long the job has to run' });
      } else if (this.mode === 'power') {
        if (this.screenIsHonors) {
          out.push({ k: 'Mass defect', v: 'the loose nucleon mass minus the measured nuclide mass' });
          out.push({ k: 'Then', v: '931.5 MeV per u, divided by the number of nucleons' });
          out.push({ k: 'The peak', v: 'iron-56 at about 8.79 MeV: light joins, heavy splits' });
        } else {
          out.push({ k: 'Fission', v: 'two comparable fragments plus free neutrons, and it has to be triggered' });
          out.push({ k: 'Fusion', v: 'light nuclei forced together past their own repulsion' });
          out.push({ k: 'Neither', v: 'decay sheds a small fixed piece · capture absorbs one' });
        }
      } else if (this.mode === 'capstone') {
        out.push({ k: 'Scan now', v: 'only if the vial can still make the prescribed activity' });
        out.push({ k: 'Hold to 14:00', v: 'only if there is an afternoon slot to put her in' });
        out.push({ k: 'Refer out', v: 'when it cannot make the dose and there is no slot either' });
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

    // ===================== C.14(A) name the emission, balance the equation =====================
    // Identity task with two halves that are the standard itself: read the penetration
    // evidence to name the emission (the "characteristics"), then set the daughter's A
    // and Z so both are conserved (the "balanced nuclear equation").
    genIdent() {
      const sc = this.nextScenario('a');
      const n = nuclide(sc.nuclide);
      const truth = decayProduct(n.A, n.Z, n.mode);
      // Stepper ranges wide enough to get every mode wrong, narrow enough that every Z
      // in range still resolves to a real symbol.
      const zList = [];
      for (let z = n.Z - 4; z <= n.Z + 2; z++) if (z > 0 && symbolForZ(z)) zList.push(z);
      this.id_ = { sc, n, truth,
        aMin: Math.max(0, n.A - 8), aMax: n.A,
        zMin: zList[0], zMax: zList[zList.length - 1] };
      this.idEm = null; this.idA = n.A; this.idZ = n.Z;
      this.idChecked = false; this.idAttempted = false; this.idDone = false; this.idVerdict = null;
      this.releaseScreen('ident', false);
    },
    idPickEm(k) { if (!this.idDone) this.idEm = k; },
    idEmState(k) {
      if (!this.idChecked) return this.idEm === k ? 'on' : '';
      if (!this.id_) return '';
      if (k === this.id_.n.mode) return 'correct';
      return k === this.idEm ? 'wrong' : '';
    },
    idStep(field, d) {
      if (this.idDone || !this.id_) return;
      const lo = field === 'idA' ? this.id_.aMin : this.id_.zMin;
      const hi = field === 'idA' ? this.id_.aMax : this.id_.zMax;
      this[field] = Math.max(lo, Math.min(hi, this[field] + d));
      this.idChecked = false;
    },
    get idDaughterSym() { return symbolForZ(this.idZ) || '?'; },
    get idDaughterName() { return nameForZ(this.idZ) || 'unknown'; },
    // The equation as it stands right now, so the learner watches it balance or not.
    // The emission term only appears once one is picked: mhchem has no placeholder
    // token, so an unpicked slot is shown as the muted prompt beside the equation.
    get idEquation() {
      if (!this.id_) return '';
      const em = EMISSIONS.find(e => e.key === this.idEm);
      const right = em ? `${nucCE(this.idA, this.idZ)} + ${em.notation}` : nucCE(this.idA, this.idZ);
      return `${nucCE(this.id_.n.A, this.id_.n.Z)} -> ${right}`;
    },
    // Live conservation check on whatever the learner has set so far.
    get idBalanced() {
      if (!this.id_ || !this.idEm) return false;
      const p = DECAY_PARTICLES[this.idEm];
      return isBalancedNuclear(
        [{ A: this.id_.n.A, Z: this.id_.n.Z }],
        [{ A: this.idA, Z: this.idZ }, { A: p.A, Z: p.Z }]
      );
    },
    get idMassSum() { return this.idEm ? this.idA + DECAY_PARTICLES[this.idEm].A : null; },
    get idChargeSum() { return this.idEm ? this.idZ + DECAY_PARTICLES[this.idEm].Z : null; },
    idCommit() {
      if (this.idDone || !this.idEm) return;
      const sc = this.id_.sc, n = this.id_.n, truth = this.id_.truth;
      const emOk = this.idEm === n.mode;
      const nucOk = this.idA === truth.A && this.idZ === truth.Z;
      const good = emOk && nucOk;
      const rightEq = `${nucCE(n.A, n.Z)} -> ${nucCE(truth.A, truth.Z)} + ${EMISSIONS.find(e => e.key === n.mode).notation}`;
      const rightTxt = `${n.name} goes to ${nameForZ(truth.Z).toLowerCase()}-${truth.A}.`;
      let v, minutes, spend = 0, feed;
      if (good) {
        v = { tone: 'success', icon: sc.icon, state: 'SOURCE IDENTIFIED', headline: 'Identified',
          detail: sc.consequences[this.idEm], eq: rightEq, gauge: null };
        this.idDone = true; minutes = 6 + ((Math.random() * 4) | 0); feed = `${sc.system}, identified`;
      } else if (!emOk) {
        v = { tone: 'fail', icon: '\u{2622}\u{FE0F}', state: 'WRONG EMISSION', headline: 'Wrong emission',
          detail: `${sc.consequences[this.idEm]} The evidence points to ${EMISSIONS.find(e => e.key === n.mode).tag.toLowerCase()}. ${rightTxt}`,
          eq: rightEq, gauge: null };
        minutes = 20 + ((Math.random() * 10) | 0); spend = 6; feed = `${sc.system}, misidentified`;
      } else {
        const dA = this.idA + DECAY_PARTICLES[this.idEm].A, dZ = this.idZ + DECAY_PARTICLES[this.idEm].Z;
        v = { tone: 'warn', icon: '\u{2696}\u{FE0F}', state: 'DOES NOT BALANCE', headline: 'Right emission, unbalanced equation',
          detail: `You named the emission correctly, but your right-hand side adds up to A ${dA} and Z ${dZ} against a parent at A ${n.A} and Z ${n.Z}. Both have to match. ${rightTxt}`,
          eq: rightEq, gauge: null };
        minutes = 14 + ((Math.random() * 8) | 0); feed = `${sc.system}, equation unbalanced`;
      }
      this.gRecord('a', good, !this.idAttempted);
      this.recordWorld({ icon: v.icon, tone: v.tone, text: feed, minutes, spend });
      this.idAttempted = true; this.idChecked = true; this.idVerdict = v;
      this.claimScreen('ident', sc, v, false);
    },
    idNext() { this.genIdent(); },

    // ===================== C.14(B) fission, fusion, or neither =====================
    // Decision task. Classify the equation, then answer the question that depends on
    // the classification. Every option carries its real consequence for the department.
    genPower() {
      const sc = this.nextScenario('b');
      this.pw = { sc };
      this.pwKind = null; this.pwAns = null;
      this.pwChecked = false; this.pwAttempted = false; this.pwDone = false; this.pwVerdict = null;
      this.releaseScreen('power', false);
    },
    pwPickKind(k) { if (!this.pwDone) this.pwKind = k; },
    pwPickAns(k) { if (!this.pwDone) this.pwAns = k; },
    pwKindState(k) {
      if (!this.pwChecked) return this.pwKind === k ? 'on' : '';
      if (!this.pw) return '';
      if (k === this.pw.sc.kind) return 'correct';
      return k === this.pwKind ? 'wrong' : '';
    },
    pwAnsState(k) {
      if (!this.pwChecked) return this.pwAns === k ? 'on' : '';
      if (!this.pw) return '';
      if (k === this.pw.sc.question.correct) return 'correct';
      return k === this.pwAns ? 'wrong' : '';
    },
    pwCommit() {
      if (this.pwDone || !this.pwKind || !this.pwAns) return;
      const sc = this.pw.sc;
      const kindOk = this.pwKind === sc.kind;
      const ansOk = this.pwAns === sc.question.correct;
      const good = kindOk && ansOk;
      const kindWord = sc.kind === 'neither' ? 'neither fission nor fusion' : sc.kind;
      let v, minutes, feed;
      if (good) {
        v = { tone: 'success', icon: sc.icon, state: 'CALLED IT', headline: `This is ${kindWord}`,
          detail: sc.consequences[this.pwAns], gauge: null };
        this.pwDone = true; minutes = 6 + ((Math.random() * 4) | 0); feed = `${sc.system}, called correctly`;
      } else if (!kindOk) {
        v = { tone: 'fail', icon: '\u{2622}\u{FE0F}', state: 'WRONG PROCESS', headline: 'Wrong process',
          detail: `This is ${kindWord}. ${sc.kindNote} Classify it wrong and everything downstream of it is wrong too.`, gauge: null };
        minutes = 20 + ((Math.random() * 10) | 0); feed = `${sc.system}, process misclassified`;
      } else {
        v = { tone: 'fail', icon: '\u{1F6A8}', state: 'WRONG CONCLUSION', headline: 'Right process, wrong conclusion',
          detail: `You classified it correctly as ${kindWord}, then drew the wrong conclusion from it. ${sc.consequences[this.pwAns]}`, gauge: null };
        minutes = 18 + ((Math.random() * 8) | 0); feed = `${sc.system}, wrong conclusion`;
      }
      this.gRecord('b', good, !this.pwAttempted);
      this.recordWorld({ icon: v.icon, tone: v.tone, text: feed, minutes });
      this.pwAttempted = true; this.pwChecked = true; this.pwVerdict = v;
      this.claimScreen('power', sc, v, false);
    },
    pwNext() { this.genPower(); },

    // ===================== C.14(C) pick the isotope and justify it =====================
    // Decision task. Choosing correctly is choosing on a nuclear property, so the second
    // half asks which property it was. Every wrong isotope carries its real outcome.
    genApply() {
      const sc = this.nextScenario('c');
      this.ap = { sc, offered: sc.offered.map(s => nuclide(s)) };
      this.apPick = null; this.apReason = null;
      this.apChecked = false; this.apAttempted = false; this.apDone = false; this.apVerdict = null;
      this.releaseScreen('apply', false);
    },
    apPickIso(k) { if (!this.apDone) this.apPick = k; },
    apPickReason(k) { if (!this.apDone) this.apReason = k; },
    apIsoState(k) {
      if (!this.apChecked) return this.apPick === k ? 'on' : '';
      if (!this.ap) return '';
      if (k === this.ap.sc.correct) return 'correct';
      return k === this.apPick ? 'wrong' : '';
    },
    apReasonState(k) {
      if (!this.apChecked) return this.apReason === k ? 'on' : '';
      if (!this.ap) return '';
      if (k === this.ap.sc.reason) return 'correct';
      return k === this.apReason ? 'wrong' : '';
    },
    // Half-life written the way a label writes it, for the isotope cards.
    hlLabel(n) { return n ? `${fmt(n.halfLife)} ${UNIT_LABEL[n.halfLifeUnit]}` : ''; },
    modeLabel(n) { return n ? (EMISSIONS.find(e => e.key === n.mode) || {}).tag || n.mode : ''; },
    apCommit() {
      if (this.apDone || !this.apPick || !this.apReason) return;
      const sc = this.ap.sc;
      const isoOk = this.apPick === sc.correct;
      const reasonOk = this.apReason === sc.reason;
      const good = isoOk && reasonOk;
      const right = nuclide(sc.correct);
      const why = REASONS.find(r => r.key === sc.reason).label;
      let v, minutes, spend = 0, feed;
      if (good) {
        v = { tone: 'success', icon: sc.icon, state: 'RIGHT ISOTOPE', headline: 'Right isotope, right reason',
          detail: sc.consequences[this.apPick], gauge: null };
        this.apDone = true; minutes = 6 + ((Math.random() * 4) | 0); feed = `${sc.system}, ${sc.correct} selected`;
      } else if (!isoOk) {
        v = { tone: 'fail', icon: '\u{2622}\u{FE0F}', state: 'WRONG ISOTOPE', headline: 'Wrong isotope',
          detail: `${sc.consequences[this.apPick]} The job needed ${right.name}: ${why}`, gauge: null };
        minutes = 22 + ((Math.random() * 10) | 0); spend = 8; feed = `${sc.system}, wrong isotope`;
      } else {
        v = { tone: 'warn', icon: '\u{2696}\u{FE0F}', state: 'RIGHT FOR THE WRONG REASON', headline: 'Right isotope, wrong reason',
          detail: `You reached for the right vial, but not for the property that actually decided it. ${why}`, gauge: null };
        minutes = 12 + ((Math.random() * 6) | 0); feed = `${sc.system}, reason misread`;
      }
      this.gRecord('c', good, !this.apAttempted);
      this.recordWorld({ icon: v.icon, tone: v.tone, text: feed, minutes, spend });
      this.apAttempted = true; this.apChecked = true; this.apVerdict = v;
      this.claimScreen('apply', sc, v, false);
    },
    apNext() { this.genApply(); },

    // ===================== C.14(C) half-life: what is left at injection =====================
    // Dose task. The method precondition is picking the right isotope's half-life (using
    // the parent's 66 hours on a technetium eluate is a real and expensive mistake); the
    // committed value is the learner's own activity, so the four bands mean something.
    genDose() {
      const sc = this.nextScenario('hl');
      const k = sc.constraints;
      const a0 = rand(k.a0Min, k.a0Max, 0);
      const elapsed = rand(k.elapsedMin, k.elapsedMax, sc.unit === 'min' ? 0 : 1);
      const trueHL = this.hlIn(sc.isotope, sc.unit);
      const trueA = rN(halfLifeRemaining(a0, elapsed, trueHL), 2);
      this.ds = { sc, a0, elapsed, trueHL, trueA, unit: sc.unit, bands: sc.bands,
        candidates: sc.candidates.map(s => nuclide(s)) };
      this.dsIso = ''; this.dsVal = '';
      this.dsChecked = false; this.dsAttempted = false; this.dsDone = false; this.dsVerdict = null;
      this.releaseScreen('dose', false);
    },
    // A nuclide's half-life expressed in some other time unit.
    hlIn(sym, unit) {
      const n = nuclide(sym);
      return n.halfLife * UNIT_HOURS[n.halfLifeUnit] / UNIT_HOURS[unit];
    },
    get dsIsoOk() { return !!this.ds && this.dsIso === this.ds.sc.isotope; },
    get dsUnitWord() { return this.ds ? UNIT_LABEL[this.ds.unit] : ''; },
    // Live preview from whatever half-life is currently selected, plus how many
    // half-lives that makes the elapsed time.
    get dsHalfLives() {
      if (!this.ds || !this.dsIso) return null;
      return rN(this.ds.elapsed / this.hlIn(this.dsIso, this.ds.unit), 2);
    },
    get dsPreview() {
      if (!this.ds || !this.dsIso) return null;
      return rN(halfLifeRemaining(this.ds.a0, this.ds.elapsed, this.hlIn(this.dsIso, this.ds.unit)), 2);
    },
    dsCommit() {
      if (this.dsDone || !this.dsIso || this.dsVal === '') return;
      const sc = this.ds.sc;
      const a = parseFloat(this.dsVal);
      const needTxt = `${fmt(this.ds.trueA)} mCi`;
      let v, good = false, minutes, spend = 0, scanned = false;
      if (!this.dsIsoOk) {
        const wrong = nuclide(this.dsIso);
        v = { tone: 'fail', icon: '\u{2699}\u{FE0F}', state: 'WRONG HALF-LIFE', headline: 'Wrong isotope on the clock',
          detail: `You decayed it on the ${wrong.name} half-life of ${fmt(this.hlIn(this.dsIso, this.ds.unit))} ${this.dsUnitWord}. This vial is ${nuclide(sc.isotope).name}, which halves every ${fmt(this.ds.trueHL)} ${this.dsUnitWord}, so the whole calculation is built on the wrong clock.`,
          gauge: null };
        minutes = 22 + ((Math.random() * 10) | 0); spend = 10;
      } else if (!isFinite(a)) {
        v = { tone: 'fail', icon: '\u{2699}\u{FE0F}', state: 'NO FIGURE', headline: 'Nothing committed',
          detail: sc.fail, gauge: null };
        minutes = 12 + ((Math.random() * 6) | 0);
      } else {
        const band = outcomeBand(a, this.ds.trueA, this.ds.bands);
        good = band.withinSpec;
        const dev = `${Math.abs((a - this.ds.trueA) / this.ds.trueA * 100).toFixed(0)}%`;
        const yours = `${fmt(a)} mCi`;
        if (good) {
          v = { tone: 'success', icon: sc.icon, state: sc.safeState, headline: 'On the prescription',
            detail: `You called ${yours} against the ${needTxt} actually in it. ${sc.safe}`, gauge: 'on' };
          this.dsDone = true; minutes = 8 + ((Math.random() * 5) | 0); spend = DOSE_MCI; scanned = true;
        } else if (band.direction === 'low') {
          v = { tone: 'fail', icon: '\u{1F6A8}', state: sc.lowState, headline: 'Under-read the vial',
            detail: `You called ${yours}, ${dev} below the ${needTxt} in it. ${sc.low}`, gauge: 'low' };
          minutes = 22 + ((Math.random() * 10) | 0); spend = DOSE_MCI + 10;
        } else {
          v = { tone: 'fail', icon: '\u{1F6A8}', state: sc.highState, headline: 'Over-read the vial',
            detail: `You called ${yours}, ${dev} above the ${needTxt} in it. ${sc.high}`, gauge: 'high' };
          minutes = 22 + ((Math.random() * 10) | 0); spend = DOSE_MCI;
        }
      }
      if (scanned) this.patients += 1;
      this.gRecord('hl', good, !this.dsAttempted);
      this.recordWorld({ icon: v.icon, tone: v.tone,
        text: `${sc.system}, ${good ? 'dose on prescription' : 'dose wrong'}`, minutes, spend });
      this.dsAttempted = true; this.dsChecked = true; this.dsVerdict = v;
      this.claimScreen('dose', sc, v, false);
    },
    dsNext() { this.genDose(); },

    // ===================== Honors h1: the whole decay series =====================
    // Only alpha moves the mass number, and it moves it by exactly 4, so the alpha count
    // is fixed the moment you look at A. The betas are then whatever it takes to land on
    // the right Z. The check is the engine's own conservation test.
    genSeries() {
      const sc = SCENARIOS.find(s => s.id === 'h1-series');
      const s = pick(SERIES);
      this.sr = { sc, s };
      this.srAlpha = 0; this.srBeta = 0;
      this.srChecked = false; this.srAttempted = false; this.srDone = false; this.srVerdict = null;
      this.releaseScreen('ident', true);
    },
    srStep(field, d) {
      if (this.srDone) return;
      this[field] = Math.max(0, Math.min(12, this[field] + d));
      this.srChecked = false;
    },
    get srA() { return this.sr ? this.sr.s.parent.A - 4 * this.srAlpha : 0; },
    get srZ() { return this.sr ? this.sr.s.parent.Z - 2 * this.srAlpha + this.srBeta : 0; },
    get srOk() {
      if (!this.sr) return false;
      const right = [{ A: this.sr.s.end.A, Z: this.sr.s.end.Z }];
      if (this.srAlpha > 0) right.push({ A: 4, Z: 2, count: this.srAlpha });
      if (this.srBeta > 0) right.push({ A: 0, Z: -1, count: this.srBeta });
      return isBalancedNuclear([{ A: this.sr.s.parent.A, Z: this.sr.s.parent.Z }], right);
    },
    get srEquation() {
      if (!this.sr) return '';
      const p = this.sr.s.parent, e = this.sr.s.end;
      const a = this.srAlpha ? ` + ${this.srAlpha > 1 ? this.srAlpha : ''}^{4}_{2}He` : '';
      const b = this.srBeta ? ` + ${this.srBeta > 1 ? this.srBeta : ''}^{0}_{-1}e` : '';
      return `${nucCE(p.A, p.Z)} -> ${nucCE(e.A, e.Z)}${a}${b}`;
    },
    srCommit() {
      if (this.srDone) return;
      const sc = this.sr.sc, s = this.sr.s;
      const ok = this.srOk;
      const trueAlpha = (s.parent.A - s.end.A) / 4;
      const trueBeta = s.end.Z - (s.parent.Z - 2 * trueAlpha);
      let v;
      if (ok) {
        v = { tone: 'success', icon: sc.icon, state: 'CHAIN CLOSED', headline: 'The series conserves',
          detail: `${this.srAlpha} alpha decays take the mass number from ${s.parent.A} down to ${s.end.A}, four at a time, and drop the atomic number by ${2 * this.srAlpha}. ${this.srBeta} beta decays put ${this.srBeta} back to land on ${s.end.Z}. ${sc.success}`,
          eq: this.srEquation, gauge: null };
        this.srDone = true;
        this.recordWorld({ icon: sc.icon, tone: 'success', text: `${sc.system}, ${s.name} closed`, minutes: 7 });
      } else {
        v = { tone: 'fail', icon: '\u{2696}\u{FE0F}', state: 'CHAIN OPEN', headline: 'The series does not conserve',
          detail: `Your chain leaves A at ${this.srA} and Z at ${this.srZ}, against ${s.end.sym} at A ${s.end.A} and Z ${s.end.Z}. Start from the mass number: only alpha changes it, and only by four, so ${s.parent.A} down to ${s.end.A} needs exactly ${trueAlpha} of them. Then count how many betas it takes to bring the atomic number back up.`,
          eq: this.srEquation, gauge: null };
        this.recordWorld({ icon: '\u{2696}\u{FE0F}', tone: 'fail', text: `${sc.system}, chain does not conserve`, minutes: 16 });
      }
      this.gRecord('h1', ok, !this.srAttempted);
      this.srAttempted = true; this.srChecked = true; this.srVerdict = v;
      this.claimScreen('ident', sc, v, true);
    },
    srNext() { this.genSeries(); },

    // ===================== Honors h2: binding energy per nucleon =====================
    // The curve that makes fission and fusion one idea rather than two. Below about
    // A = 50 a nuclide gains by joining; above about A = 100 it gains by splitting;
    // in between it sits near the top and neither route buys much.
    genBinding() {
      const sc = SCENARIOS.find(s => s.id === 'h2-binding');
      const c = pick(BINDING_CASES);
      const sum = nucleonMassSum(c.A, c.Z);
      const defect = massDefect(sum, c.mass);
      const total = bindingEnergyMeV(defect);
      const per = total / c.A;
      const route = c.A < 50 ? 'fusion' : c.A > 100 ? 'fission' : 'peak';
      this.be = { sc, c, sum: rN(sum, 6), defect: rN(defect, 6), total: rN(total, 2), per: rN(per, 3), route };
      this.beVal = ''; this.beClass = null;
      this.beChecked = false; this.beAttempted = false; this.beDone = false; this.beVerdict = null;
      this.releaseScreen('power', true);
    },
    bePickClass(k) { if (!this.beDone) this.beClass = k; },
    beClassState(k) {
      if (!this.beChecked) return this.beClass === k ? 'on' : '';
      if (!this.be) return '';
      if (k === this.be.route) return 'correct';
      return k === this.beClass ? 'wrong' : '';
    },
    get beValueOk() {
      if (!this.be) return false;
      const v = parseFloat(this.beVal);
      return isFinite(v) && Math.abs(v - this.be.per) <= 0.05;
    },
    beCommit() {
      if (this.beDone || this.beVal === '' || !this.beClass) return;
      const sc = this.be.sc, c = this.be.c;
      const valueOk = this.beValueOk;
      const classOk = this.beClass === this.be.route;
      const good = valueOk && classOk;
      const routeWord = this.be.route === 'fusion' ? 'joining with other light nuclei, which is fusion'
        : this.be.route === 'fission' ? 'splitting into mid-sized pieces, which is fission'
        : 'neither, because it already sits near the top of the curve';
      const truth = `The loose nucleons would weigh ${fmt(this.be.sum, 7)} u, the nuclide weighs ${fmt(c.mass, 7)} u, so the defect is ${fmt(this.be.defect, 4)} u. At ${MEV_PER_U} MeV per u that is ${fmt(this.be.total, 5)} MeV in total, or ${fmt(this.be.per, 3)} MeV per nucleon across ${c.A} nucleons. Iron-56 tops the curve at about 8.79.`;
      let v, minutes;
      if (good) {
        v = { tone: 'success', icon: sc.icon, state: 'ON THE CURVE', headline: 'Placed correctly',
          detail: `${truth} ${c.name} therefore releases energy by ${routeWord}. ${sc.success}`, gauge: null };
        this.beDone = true; minutes = 7;
      } else if (!valueOk) {
        v = { tone: 'fail', icon: '\u{1F6A8}', state: 'FIGURE OFF', headline: 'Binding energy is off',
          detail: `${truth} ${sc.fail}`, gauge: null };
        minutes = 16;
      } else {
        v = { tone: 'warn', icon: '\u{2696}\u{FE0F}', state: 'WRONG SIDE OF THE PEAK', headline: 'Right number, wrong side',
          detail: `Your figure is right, but you put the nuclide on the wrong part of the curve. At A ${c.A} it releases energy by ${routeWord}.`, gauge: null };
        minutes = 12;
      }
      this.gRecord('h2', good, !this.beAttempted);
      this.recordWorld({ icon: v.icon, tone: v.tone, text: `${sc.system}, ${c.sym} ${good ? 'placed' : 'misplaced'}`, minutes });
      this.beAttempted = true; this.beChecked = true; this.beVerdict = v;
      this.claimScreen('power', sc, v, true);
    },
    beNext() { this.genBinding(); },

    // ===================== Honors h3: effective half-life =====================
    // Decay and excretion are two independent routes out, so the RATES add. That is why
    // the combined half-life is always shorter than either one alone.
    genEffective() {
      const sc = SCENARIOS.find(s => s.id === 'h3-effective');
      const c = pick(DOSAGE_CASES);
      const te = effectiveHalfLife(c.physical, c.biological);
      const time = te * Math.log2(1 / c.threshold);
      this.ef = { sc, c, te: rN(te, 3), time: rN(time, 2), unit: UNIT_LABEL[c.unit] };
      this.efTe = ''; this.efTime = '';
      this.efChecked = false; this.efAttempted = false; this.efDone = false; this.efVerdict = null;
      this.releaseScreen('dose', true);
    },
    get efTeOk() {
      if (!this.ef) return false;
      const v = parseFloat(this.efTe);
      return isFinite(v) && Math.abs(v - this.ef.te) / this.ef.te <= 0.03;
    },
    get efTimeOk() {
      if (!this.ef) return false;
      const v = parseFloat(this.efTime);
      return isFinite(v) && Math.abs(v - this.ef.time) / this.ef.time <= 0.04;
    },
    efCommit() {
      if (this.efDone || this.efTe === '' || this.efTime === '') return;
      const sc = this.ef.sc, c = this.ef.c;
      const teOk = this.efTeOk, timeOk = this.efTimeOk;
      const good = teOk && timeOk;
      const truth = `1/te = 1/${fmt(c.physical)} + 1/${fmt(c.biological)} gives an effective half-life of ${fmt(this.ef.te)} ${this.ef.unit}, and falling to ${Math.round(c.threshold * 100)} percent takes log2(1/${c.threshold}) of them, which is ${fmt(this.ef.time)} ${this.ef.unit}.`;
      let v, minutes;
      if (good) {
        v = { tone: 'success', icon: sc.icon, state: 'RELEASE TIME SET', headline: 'Both figures check out',
          detail: `${truth} ${sc.success}`, gauge: null };
        this.efDone = true; minutes = 7;
      } else if (!teOk) {
        v = { tone: 'fail', icon: '\u{1F6A8}', state: 'HALF-LIVES NOT COMBINED', headline: 'Effective half-life is off',
          detail: `${truth} Adding or averaging the two half-lives does not work: it is the rates that add, so the reciprocals do. ${sc.fail}`, gauge: null };
        minutes = 16;
      } else {
        v = { tone: 'warn', icon: '\u{2696}\u{FE0F}', state: 'CLEARANCE TIME OFF', headline: 'Right half-life, wrong clearance time',
          detail: `Your effective half-life is right, but the time to threshold is not. ${truth}`, gauge: null };
        minutes = 12;
      }
      this.gRecord('h3', good, !this.efAttempted);
      this.recordWorld({ icon: v.icon, tone: v.tone, text: `${sc.system}, ${good ? 'time agreed' : 'time wrong'}`, minutes });
      this.efAttempted = true; this.efChecked = true; this.efVerdict = v;
      this.claimScreen('dose', sc, v, true);
    },
    efNext() { this.genEffective(); },

    // ===================== Capstone: the last patient of the morning =====================
    get capUnlocked() { return this.gOverall() === 1; },
    genCapstone() {
      const sc = SCENARIOS.find(s => s.id === 'cap-lastcase');
      // Two conditions decide the one defensible call, and the first of them is the
      // world-state the learner spent all morning creating.
      const needed = rand(20, 30, 0);
      const afternoonOpen = Math.random() < 0.5;
      const enough = this.vial >= needed;
      const correct = enough ? 'scan' : (afternoonOpen ? 'rebook' : 'refer');
      this.cap = { sc, needed, afternoonOpen, enough, correct, vialAtCall: this.vial, clockAtCall: this.clockLabel };
      this.capPick = null; this.capChecked = false; this.capAttempted = false;
      this.capWin = false; this.capVerdict = null;
      this.releaseScreen('capstone', false);
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
      const fig = `At ${this.cap.clockAtCall} the vial holds ${fmt(this.cap.vialAtCall)} mCi against a prescription of ${fmt(this.cap.needed)} mCi, so it ${this.cap.enough ? 'can' : 'cannot'} make the dose. The afternoon list ${this.cap.afternoonOpen ? 'has a slot open after the 14:00 delivery' : 'is full, with nothing after the 14:00 delivery'}.`;
      const good = this.capPick === this.cap.correct;
      let v, minutes;
      if (good) {
        v = { tone: 'success', icon: sc.icon, state: 'RIGHT CALL', headline: 'Right call',
          detail: `${fig} ${opt.good}`, gauge: null };
        this.capWin = true; minutes = 10;
        if (this.capPick === 'scan') this.patients += 1;
      } else {
        v = { tone: 'fail', icon: '\u{1F6A8}', state: 'WRONG CALL', headline: 'Wrong call',
          detail: `${fig} ${opt.consequence}`, gauge: null };
        minutes = 30;
      }
      this.gRecord('cap', good, !this.capAttempted);
      this.recordWorld({ icon: v.icon, tone: v.tone, text: `${sc.system}, ${good ? 'right call' : 'wrong call'}`,
        minutes, spend: good && this.capPick === 'scan' ? this.cap.needed : 0 });
      this.capAttempted = true; this.capChecked = true; this.capVerdict = v;
      this.claimScreen('capstone', sc, v, false);
    }
  };
}
