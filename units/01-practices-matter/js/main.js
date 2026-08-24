// main.js — Unit 1 view-model (Practices, Measurement & Matter, SEP C.1-C.4).
//
// The units_new build of Unit 1: units/01-practices-matter's four tools and every piece
// of its chemistry (meniscus reading, significant figures, density by displacement,
// accuracy vs precision, and both Honors extensions), rendered in the mission-cockpit
// shell Unit 5 uses, and wrapped in the Scenario layer RETROFIT-U1-U4.md specifies for
// this unit — "Tank Watch", the fish tank in your room.
//
// What that adds over the worksheet build, and why:
//   • Every task is a job with a consequence. The meniscus reading is a DOSE, graded
//     against what the job needed rather than against a single right answer, because the
//     number you write down is the number the next person mixes from. That is the same
//     failure the unit's case file is about, one tank instead of one Mars orbiter.
//   • The world-state IS the chemistry (GAMIFICATION.md's rule): free chlorine in mg/L,
//     dissolved metal in mg/L, and how far the log and the test kit can be trusted. No
//     generic safety dial.
//   • Mastery persists per TEKS skill via shared/js/game.js; the tank does not. It resets
//     on reload and on Reset, so a bad afternoon never becomes a permanent handicap.
//
// Everything quantitative still comes from shared/js/chem.js — this file computes no
// statistics of its own.
import {
  SI_UNITS, PREFIXES, SF_COUNT, SF_ROUND, SF_CALC, SUBSTANCES, AP_BOARDS, SE,
  MEASURE_BANDS, DENSITY_BANDS, HONORS_BANDS, TANK, SCENARIOS
} from './model.js?v=u1-1';
import { sceneArt } from './art.js?v=u1-2';
import {
  sigFigs, roundToSigFigs, density, percentError, mean, sampleStdDev, fmt
} from '../../../shared/js/chem.js';
import { createGame, outcomeBand } from '../../../shared/js/game.js';

const pick = a => a[(Math.random() * a.length) | 0];
const shuffle = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
const r1 = x => Math.round(x * 10) / 10;
const r2 = x => Math.round(x * 100) / 100;
const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);
const numClose = (a, b, tol) => Math.abs(a - b) <= (tol ?? 1e-6 * Math.max(1, Math.abs(b)));
// crude normal sample (sum of uniforms), mean 0, sd ~1
const gauss = () => (Math.random() + Math.random() + Math.random() + Math.random() - 2) / 0.816;
// Keep a target dot inside the outer ring, pulling it straight back along its own
// direction so a clamped dot still reads as "off this way", not "off to the corner".
const onBoard = (x, y) => {
  const r = Math.hypot(x, y);
  return r <= 0.92 ? { x, y } : { x: x * 0.92 / r, y: y * 0.92 / r };
};

// ---------------------------------------------------------------- the tool
// Graduated-cylinder SVG geometry (50 mL), carried over from
// units/01-practices-matter/js/main.js. The viewBox is drawn large — 10 units per mL —
// so the 1 mL graduations and the meniscus stay legible once CSS scales the drawing
// down. Every measurement in the unit is read off this one drawing, so the reader and
// the two displacement cylinders can never disagree about where a level sits.
const MAXV = 50;
const GLASS_X = 48, GLASS_W = 90;                         // outer glass wall
const CX_L = 50, CX_R = 136, CX_MID = (CX_L + CX_R) / 2;  // inner wall, where liquid sits
const TOP = 66, BOT = 566, SPAN = BOT - TOP;              // y of the 50 mL and 0 mL marks
const MENISCUS = 6;                                        // how far the liquid climbs the wall

// The C.4 datasets. Each is a real quantity a tank keeper actually checks, so the
// accepted value is a reference somebody could hand you rather than an abstraction.
// `key` is what a scenario pins in constraints.quantity; `label` is prose and free to change.
const EV_SCENARIOS = [
  { key: 'chlorine', label: 'free chlorine in the treated water', accepted: 0.50, unit: 'mg/L', dec: 2 },
  { key: 'pH', label: 'pH of the tank water', accepted: 7.40, unit: '', dec: 2 },
  { key: 'nitrate', label: 'nitrate after the water change', accepted: 20.0, unit: 'mg/L', dec: 1 }
];

// Mastery targets. Three in a row for the core practices, two for the Honors extensions,
// one for the capstone — and `honors: true` on the capstone keeps it out of the
// gOverall() gate that unlocks it.
const skills = [
  { id: 'a',  code: 'C.1',      label: 'Reading the tool',        target: 3 },
  { id: 'b',  code: 'C.2',      label: 'Significant figures',     target: 3 },
  { id: 'c',  code: 'C.3',      label: 'Density by displacement', target: 3 },
  { id: 'd',  code: 'C.4',      label: 'Accuracy vs precision',   target: 3 },
  { id: 'h1', code: 'Honors',   label: 'Error propagation',       target: 2, honors: true },
  { id: 'h2', code: 'Honors',   label: 'Quantified precision',    target: 2, honors: true },
  { id: 'cap', code: 'Capstone', label: 'The water change',       target: 1, honors: true }
];

export { SE };

export function createSim() {
  return {
    ...createGame({ unitId: 'units_new/01-practices-matter', skills }),
    SE, SI_UNITS, PREFIXES, SUBSTANCES, AP_BOARDS, TANK, fmt,
    honors: false,
    mode: 'measure',
    MAXV,
    // TEKS tracking is a teacher-facing concern, so it collapses to one header badge and
    // expands on demand. Session-only: nothing about it is worth persisting.
    teksOpen: false,

    // ---- world-state: the tank you keep alive (session-local; the primary feedback) ----
    // Four readings, in the units they are actually measured in. `chlorine` starts at what
    // the municipal tap gives you, which is the unit's opening premise: the water is
    // already wrong and the fish are not in it yet. `shock` is acute stress (an oxygen
    // crash, a poisoned fish) that decays over days rather than sitting in a reading.
    tank: { chlorine: TANK.tapChlorine, metals: 0.002, log: 100, kit: 100 },
    shock: 0,
    day: 0,
    worldLog: [],
    lastVerdict: null,
    // The most recent commit PER BENCH. The mission screen shows one verdict at a time, so
    // a fixed precedence (core, then Honors, or the other way round) would mean one of the
    // two commits on the density and accuracy benches could never be read: whichever lost
    // the tie would be replaced the moment the other was made. Recency is the honest rule —
    // the screen answers "what did the thing I just did do?".
    modeVerdict: { measure: null, sigfig: null, density: null, evaluate: null, capstone: null },
    _wid: 0,
    // scenario rotation per skill, so a 3-in-a-row run walks all of a skill's contexts
    scIdx: { a: -1, b: -1, c: -1, d: -1 },

    // ---- C.1 read the tool (dose) ----
    mVal: 0, mGuess: '', mSc: null,
    mChecked: false, mAttempted: false, mDone: false, mVerdict: null,
    // ---- C.2 significant figures (identity) ----
    sfTask: 'count', sfQ: null, sfPick: null, sfInput: '', sfSc: null,
    sfChecked: false, sfAttempted: false, sfDone: false, sfVerdict: null,
    // ---- C.3 density by displacement (dose + decision) ----
    dSub: null, dMass: 0, dBefore: 0, dAfter: 0, dVolInput: '', dDensInput: '',
    dOptions: [], dPick: null, dAction: null, dSc: null,
    dChecked: false, dAttempted: false, dDone: false, dVerdict: null,
    // ---- Honors h1: error propagation, riding on the density bench ----
    h1Input: '', h1Pick: null, h1Checked: false, h1Attempted: false, h1Done: false, h1Verdict: null,
    // ---- C.4 accuracy vs precision (decision) ----
    evScenario: null, evTrials: [], evAccepted: 0, evDots: [], evClassPick: null, evSc: null,
    evChecked: false, evAttempted: false, evDone: false, evVerdict: null,
    // ---- Honors h2: quantified precision, riding on the judging bench ----
    h2Input: '', h2Pick: null, h2Checked: false, h2Attempted: false, h2Done: false, h2Verdict: null,
    // ---- Capstone ----
    cap: null, capInput: '', capPick: null, capChecked: false, capAttempted: false,
    capWin: false, capVerdict: null,

    init() {
      this.gLoad();
      this.newMeasure();
      this.newSF();
      this.newSample();
      this.newDataset();
    },

    setMode(m) {
      this.mode = m;
      if (m === 'capstone' && this.capUnlocked && !this.cap) this.genCapstone();
    },

    resetProgress() {
      this.gReset();
      this.tank = { chlorine: TANK.tapChlorine, metals: 0.002, log: 100, kit: 100 };
      this.shock = 0; this.day = 0;
      this.worldLog = [];
      this.scIdx = { a: -1, b: -1, c: -1, d: -1 };
      this.clearOutcome();
      this.newMeasure(); this.newSF(); this.newSample(); this.newDataset();
      this.cap = null; this.capWin = false; this.capInput = ''; this.capPick = null;
      this.h1Input = ''; this.h1Pick = null; this.h1Done = false; this.h1Checked = false; this.h1Attempted = false;
      this.h2Input = ''; this.h2Pick = null; this.h2Done = false; this.h2Checked = false; this.h2Attempted = false;
    },

    clearOutcome() {
      this.mVerdict = null; this.sfVerdict = null; this.dVerdict = null;
      this.evVerdict = null; this.h1Verdict = null; this.h2Verdict = null; this.capVerdict = null;
      this.modeVerdict = { measure: null, sigfig: null, density: null, evaluate: null, capstone: null };
      this.lastVerdict = null;
    },

    // ================= scenario layer plumbing =================
    nextScenario(skill) {
      const list = SCENARIOS.filter(s => s.skill === skill);
      const i = (this.scIdx[skill] = (this.scIdx[skill] ?? -1) + 1) % list.length;
      return list[i];
    },
    scenarioById(id) { return SCENARIOS.find(s => s.id === id) || null; },

    // Advance a day, drift every reading, apply this job's effect, and prepend a log line.
    //
    // Unit 5's recordWorld takes one stock name and one signed delta. This one takes an
    // `effect` map instead, because the four readings here are different physical
    // quantities in different units and one task can move two of them at once (a
    // dechlorinator overdose clears the chlorine AND crashes the oxygen). The signature
    // is otherwise the same, so every commit handler calls it the same way.
    recordWorld({ icon, tone, text, effect }) {
      this.day++;
      const e = effect || {};
      // 1. baseline drift on every reading first, so grinding one station lets the others
      //    slide. This is what makes "which job next?" a real decision rather than a menu.
      //    The numbers are the honest ones: evaporation gets topped off from the tap, so
      //    untreated chlorine creeps back; reagents age; a log nobody updates goes stale.
      this.tank.chlorine += 0.10;
      this.tank.metals += 0.002;
      this.tank.log -= 3;
      this.tank.kit -= 3;
      // 2. couplings, read once from the post-drift levels: bad data is not a bookkeeping
      //    problem, it is a water problem. If you cannot trust the kit you cannot see the
      //    chlorine, and if the log is wrong the next dose is mixed to a number that was
      //    never real. Each coupling drains ONE other reading a little, never the one you
      //    are actively fixing, so any reading can always be recovered by tending it.
      if (this.tank.kit < 40) this.tank.chlorine += 0.10;
      if (this.tank.log < 40) this.tank.chlorine += 0.08;
      // 3. acute stress fades before this job's own effect lands, so a fresh hit reads at
      //    full strength and an old one does not linger for a week.
      this.shock = Math.max(0, this.shock - 8);
      // 4. apply the outcome
      if (e.water !== undefined) this.tank.chlorine += e.water;
      if (e.metals !== undefined) this.tank.metals += e.metals;
      if (e.log !== undefined) this.tank.log += e.log;
      if (e.kit !== undefined) this.tank.kit += e.kit;
      if (e.shock !== undefined) this.shock += e.shock;
      // 5. clamp everything to what a real reading can be
      this.tank.chlorine = clamp(this.tank.chlorine, 0, 4);
      this.tank.metals = clamp(this.tank.metals, 0, 0.3);
      this.tank.log = clamp(this.tank.log, 0, 100);
      this.tank.kit = clamp(this.tank.kit, 0, 100);
      this.shock = clamp(this.shock, 0, 100);
      // 6. prepend the log line (newest first)
      this.worldLog = [{ id: ++this._wid, icon, tone, text: `Day ${this.day}: ${text}` }, ...this.worldLog].slice(0, 6);
    },

    // ---- derived tank health ----
    // Each reading is normalised to a 0-100 "how safe is this" score before they are
    // combined, because mg/L of chlorine and a percentage of trust are not comparable
    // numbers. The chlorine curve is flat-then-linear: below the stress line the fish do
    // not care at all, and above it the damage rises steadily to lethal.
    get sWater() {
      const c = this.tank.chlorine;
      return c <= TANK.stressLine ? 100 : clamp(100 * (1.5 - c) / (1.5 - TANK.stressLine), 0, 100);
    },
    get sMetals() {
      const m = this.tank.metals;
      return m <= TANK.metalLine ? 100 : clamp(100 * (0.08 - m) / (0.08 - TANK.metalLine), 0, 100);
    },
    // Worst-reading-dominant, exactly as Unit 5 derives crew safety: neglecting one thing
    // is dangerous, but no single slip tanks everything. `shock` then subtracts on top,
    // because acute harm is not visible in any of the four steady readings.
    get fishHealth() {
      const v = [this.sWater, this.sMetals, this.tank.log, this.tank.kit];
      const min = Math.min(...v), avg = v.reduce((s, n) => s + n, 0) / v.length;
      return clamp(Math.round(0.6 * min + 0.4 * avg - this.shock), 0, 100);
    },
    get fishMood() { return this.fishHealth >= 67 ? '\u{1F41F}' : this.fishHealth >= 34 ? '\u{1F630}' : '\u{1F480}'; },
    get tankState() {
      return this.fishHealth >= 67 ? 'Water clear, fish fine'
        : this.fishHealth >= 34 ? 'Fish at the surface, gulping'
          : 'Water toxic';
    },
    stockColor(v) { return v >= 67 ? 'var(--success)' : v >= 34 ? 'var(--warn)' : 'var(--danger)'; },
    // The right rail's four rows. Each carries the raw measurement AND the normalised bar,
    // so the learner reads a concentration rather than an abstract percentage.
    get tankReadings() {
      return [
        { key: 'water',  label: 'Chlorine', raw: `${this.tank.chlorine.toFixed(2)} mg/L`, pct: this.sWater,  hint: `free chlorine — fish stress above ${TANK.stressLine.toFixed(2)} mg/L` },
        { key: 'metals', label: 'Metals',   raw: `${this.tank.metals.toFixed(3)} mg/L`,   pct: this.sMetals, hint: `dissolved metal — toxic above ${TANK.metalLine.toFixed(3)} mg/L` },
        { key: 'log',    label: 'Tank log',        raw: `${Math.round(this.tank.log)}%`,          pct: this.tank.log,  hint: 'how far the written record can be trusted' },
        { key: 'kit',    label: 'Test kit',        raw: `${Math.round(this.tank.kit)}%`,          pct: this.tank.kit,  hint: 'how far your own readings can be trusted' }
      ];
    },

    // ================= cockpit readouts =================
    scArt(id) { return sceneArt(id); },
    get mBrief() { return this.mSc; },
    get sfBrief() { return this.sfSc; },
    get dBrief() { return this.dSc; },
    get evBrief() { return this.evSc; },
    get h1Brief() { return this.scenarioById('h1-sizecall'); },
    get h2Brief() { return this.scenarioById('h2-kitcall'); },
    get capBrief() { return this.cap && this.cap.sc; },
    get coreSkills() { return SE.filter(se => !se.honors); },
    get teksMasteredCount() { return this.coreSkills.filter(se => this.gMastered(se.id)).length; },

    get activeBrief() {
      if (this.mode === 'measure') return this.mBrief;
      if (this.mode === 'sigfig') return this.sfBrief;
      if (this.mode === 'density') return this.dBrief;
      if (this.mode === 'evaluate') return this.evBrief;
      if (this.mode === 'capstone') return this.capBrief || this.scenarioById('cap-waterchange');
      return null;
    },
    get activeVerdict() { return this.modeVerdict[this.mode] || null; },
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
      return b && b.id ? b.id : 'a-dechlor';
    },
    get activeStationName() {
      const b = this.activeBrief;
      if (b && b.system) return b.system;
      if (this.mode === 'capstone') return 'The water change';
      return 'Tank watch';
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
      return 'Pick a job and make the number good enough to act on.';
    },

    // The facts a learner should never have to hunt for while working the current bench.
    // Kept to three lines, because this card shares a column with the scenario narrative
    // and every extra line here is a line taken off the text somebody actually reads.
    get activeReference() {
      const out = [];
      // Two lines, not three, on the measuring bench: this unit's scenario goals run a
      // sentence longer than Unit 5's, and the goal is the text somebody actually has to
      // read before they can act. The third fact ("read at the bottom of the meniscus")
      // is already the first line of the bench itself, so it would have been said twice.
      if (this.mode === 'measure') {
        out.push({ k: 'Smallest graduation', v: '1 mL' });
        out.push({ k: 'So estimate to', v: '0.1 mL — one digit past the marks' });
      } else if (this.mode === 'sigfig') {
        out.push({ k: 'Leading zeros', v: 'never count' });
        out.push({ k: 'Trailing zeros', v: 'count only with a decimal point' });
        out.push({ k: 'On a product', v: 'keep the fewest sig figs of the inputs' });
      } else if (this.mode === 'density') {
        out.push({ k: 'Density', v: 'ρ = m ÷ V' });
        out.push({ k: 'Displacement', v: 'V = after − before' });
        out.push({ k: 'Toxic in a tank', v: 'copper, zinc, lead' });
      } else if (this.mode === 'evaluate' && this.evScenario) {
        out.push({ k: 'Accepted value', v: `${this.evAccepted} ${this.evScenario.unit}`.trim() });
        out.push({ k: 'Percent error', v: '|mean − accepted| ÷ accepted × 100' });
        out.push({ k: 'Accurate / precise', v: 'under 2.5% error / under 2% spread' });
      } else if (this.mode === 'capstone') {
        out.push({ k: 'Tank now', v: `${this.tank.chlorine.toFixed(2)} mg/L free chlorine` });
        out.push({ k: 'Dissolved metal', v: `${this.tank.metals.toFixed(3)} mg/L` });
        out.push({ k: 'Kit trust', v: `${Math.round(this.tank.kit)}%` });
      }
      return out.slice(0, 3);
    },

    seCaption(se) {
      if (this.gMastered(se.id)) return 'Mastered';
      const sk = this.g_skills[se.id];
      const def = this.g_skillDefs.find(d => d.id === se.id) || {};
      return `${sk ? sk.run : 0} of ${def.target || 3} correct in a row`;
    },

    // ================= C.1 reading the tool (dose) =================
    // Alpine x-for/x-if on a <template> inside <svg> does not bind scope, so the repeated
    // SVG markup is built as a string and injected with x-html on a <g>.
    get ticks() {
      const out = [];
      for (let v = 0; v <= MAXV; v++) {
        const major = v % 10 === 0;
        out.push({ v, y: this.lvlY(v), major, mid: !major && v % 5 === 0 });
      }
      return out;
    },
    lvlY(v) { return BOT - (v / MAXV) * SPAN; },
    ticksSvg(labels = false) {
      let s = '';
      for (const t of this.ticks) {
        const x1 = t.major ? 96 : t.mid ? 108 : 119;
        const w = t.major ? 2.2 : t.mid ? 1.6 : 1.1;
        s += `<line x1="${x1}" x2="${CX_R}" y1="${t.y}" y2="${t.y}" stroke="#7d929b" stroke-width="${w}"></line>`;
        if (labels && t.major) s += `<text x="${CX_R + 8}" y="${t.y + 5}" font-size="15" fill="#687a82" font-family="JetBrains Mono">${t.v}</text>`;
      }
      return s;
    },
    // Glass, liquid, submerged sample and scale all come from here, so the reader and the
    // two displacement cylinders can never drift apart.
    cylSvg(v, { labels = false, block = false } = {}) {
      const y = this.lvlY(v), m = MENISCUS;
      // The meniscus is concave: its lowest point sits exactly on the reading and the
      // edges climb the wall. That is the point students are told to read.
      const curve = `M${CX_L} ${y - m} Q${CX_MID} ${y + m} ${CX_R} ${y - m}`;
      let s = `<rect x="${GLASS_X}" y="28" width="${GLASS_W}" height="566" rx="8" fill="#f7fafb" stroke="#aebfc6" stroke-width="2.5"></rect>`
        + `<rect x="${GLASS_X}" y="28" width="${GLASS_W}" height="12" rx="6" fill="#eaf1f3" stroke="#aebfc6" stroke-width="2"></rect>`
        + `<rect x="34" y="588" width="118" height="16" rx="6" fill="#e6eef0" stroke="#aebfc6" stroke-width="2"></rect>`;
      if (v > 0) {
        s += `<path d="${curve} L${CX_R} ${BOT} L${CX_L} ${BOT} Z" fill="#79b0ba" opacity="0.5"></path>`;
        if (block) {
          const h = Math.max(0, BOT - y - 30);
          s += `<rect x="${CX_MID - 23}" y="${y + 16}" width="46" height="${h}" rx="4" fill="#8a6a4a" opacity="0.85"></rect>`;
        }
        s += `<path d="${curve}" fill="none" stroke="#3f7f8c" stroke-width="2.4" stroke-linecap="round"></path>`;
      }
      s += `<rect x="${CX_L + 6}" y="48" width="6" height="516" rx="3" fill="#ffffff" opacity="0.7"></rect>`;
      return s + this.ticksSvg(labels);
    },
    boardDots(dots) { return dots.map(d => `<circle cx="${(60 + d[0] * 46).toFixed(2)}" cy="${(60 + d[1] * 46).toFixed(2)}" r="3.5" fill="#1d5b66"></circle>`).join(''); },
    liveDots() { return this.evDots.map(d => `<circle cx="${(60 + d.x * 46).toFixed(2)}" cy="${(60 + d.y * 46).toFixed(2)}" r="4" fill="#2a7d8a"></circle>`).join(''); },

    newMeasure() {
      const sc = this.nextScenario('a');
      const base = 6 + ((Math.random() * 40) | 0);   // 6..45
      const tenth = 1 + ((Math.random() * 9) | 0);   // .1 .. .9, so the estimated digit is forced
      this.mVal = base + tenth / 10;
      this.mSc = sc;
      this.mGuess = '';
      this.mChecked = false; this.mAttempted = false; this.mDone = false; this.mVerdict = null;
    },
    get mCorrect() { return Math.abs(parseFloat(this.mGuess) - this.mVal) <= MEASURE_BANDS.acceptable + 1e-9; },
    get mReady() { return this.mGuess !== '' && isFinite(parseFloat(this.mGuess)); },
    // The dial the mission column shows after a commit: your reading against the level
    // itself, on the tool's own scale. ±0.5 mL of axis is five estimated digits either
    // way, which is wide enough to see a miss and tight enough that a good read sits on
    // the reference mark rather than somewhere in a vague middle.
    get mGauge() {
      if (!this.mChecked || !this.mReady) return null;
      return {
        kind: 'span', value: parseFloat(this.mGuess),
        min: r1(this.mVal - 0.5), max: r1(this.mVal + 0.5),
        ref: this.mVal, refLabel: 'the actual level', unit: ' mL', digits: 3,
        label: 'your reading against the level'
      };
    },
    logDose() {
      if (this.mDone || !this.mReady) return;
      const sc = this.mSc, val = parseFloat(this.mGuess);
      const band = outcomeBand(val, this.mVal, sc.bands);
      const good = band.withinSpec;
      const off = Math.abs(val - this.mVal).toFixed(2);
      let v, effect;
      if (good) {
        v = { tone: 'success', icon: sc.icon, state: sc.safeState, headline: 'Read and logged',
          detail: `You logged ${val.toFixed(1)} mL against an actual ${this.mVal.toFixed(1)} mL. ${sc.safe}` };
        effect = sc.effect.good;
        this.mDone = true;
      } else if (band.direction === 'low') {
        v = { tone: 'fail', icon: '\u{1F6A8}', state: sc.lowState, headline: 'Logged short',
          detail: `You logged ${val.toFixed(1)} mL for a level of ${this.mVal.toFixed(1)} mL — ${off} mL under. ${sc.low}` };
        effect = sc.effect.low;
      } else {
        v = { tone: 'fail', icon: '\u{1F6A8}', state: sc.highState, headline: 'Logged long',
          detail: `You logged ${val.toFixed(1)} mL for a level of ${this.mVal.toFixed(1)} mL — ${off} mL over. ${sc.high}` };
        effect = sc.effect.high;
      }
      this.gRecord('a', good, !this.mAttempted);
      this.recordWorld({ icon: v.icon, tone: v.tone, text: `${sc.system}, ${v.state.toLowerCase()}`, effect });
      this.mAttempted = true; this.mChecked = true; this.mVerdict = v; this.modeVerdict.measure = v; this.lastVerdict = v;
    },

    // ================= C.2 significant figures (identity) =================
    setTask(t) { this.sfTask = t; this.newSF(); },
    newSF() {
      const sc = this.nextScenario('b');
      if (this.sfTask === 'count') {
        const str = pick(SF_COUNT);
        this.sfQ = { str, ans: sigFigs(str) };
        this.sfPick = null;
      } else if (this.sfTask === 'round') {
        const base = pick(SF_ROUND), n = pick([2, 3]);
        this.sfQ = { base, n, ans: roundToSigFigs(base, n) };
        this.sfInput = '';
      } else {
        const [a, b] = pick(SF_CALC), sf = Math.min(sigFigs(a), sigFigs(b)), raw = parseFloat(a) * parseFloat(b);
        this.sfQ = { a, b, sf, raw, ans: roundToSigFigs(raw, sf) };
        this.sfInput = '';
      }
      this.sfSc = sc;
      this.sfChecked = false; this.sfAttempted = false; this.sfDone = false; this.sfVerdict = null;
    },
    pickSF(n) { if (!this.sfDone) { this.sfPick = n; this.sfChecked = false; } },
    countState(n) {
      if (!this.sfChecked) return this.sfPick === n ? 'on' : '';
      if (n === this.sfQ.ans) return 'correct';
      if (n === this.sfPick) return 'wrong';
      return '';
    },
    get sfReady() {
      return this.sfTask === 'count' ? this.sfPick !== null : this.sfInput !== '';
    },
    get sfCorrect() {
      if (this.sfTask === 'count') return this.sfPick === this.sfQ.ans;
      return numClose(parseFloat(this.sfInput), this.sfQ.ans, 1e-6 * Math.max(1, Math.abs(this.sfQ.ans)));
    },
    // Show the rounded answer with the right number of sig figs (trailing zeros, or
    // unambiguous scientific notation), which a bare JS number cannot represent.
    get sfAnsDisplay() {
      if (this.sfTask === 'round') return Number(this.sfQ.base).toPrecision(this.sfQ.n);
      if (this.sfTask === 'calc') return Number(this.sfQ.raw).toPrecision(this.sfQ.sf);
      return String(this.sfQ.ans);
    },
    writeLog() {
      if (this.sfDone || !this.sfReady) return;
      const sc = this.sfSc, good = this.sfCorrect;
      const said = this.sfTask === 'count' ? `${this.sfPick} sig figs` : this.sfInput;
      const truth = this.sfTask === 'count' ? `${this.sfQ.ans} sig figs` : this.sfAnsDisplay;
      const v = good
        ? { tone: 'success', icon: sc.icon, state: 'LOG HONEST', headline: 'The entry holds up',
          detail: `${truth} is right. ${sc.success}` }
        : { tone: 'fail', icon: '\u{270F}\u{FE0F}', state: 'LOG WRONG', headline: 'The entry misstates the precision',
          detail: `You wrote ${said}; the honest answer is ${truth}. ${sc.fail}` };
      this.gRecord('b', good, !this.sfAttempted);
      this.recordWorld({ icon: v.icon, tone: v.tone, text: `${sc.system}, ${good ? 'entry checks out' : 'entry is wrong'}`, effect: good ? sc.effect.good : sc.effect.bad });
      if (good) this.sfDone = true;
      this.sfAttempted = true; this.sfChecked = true; this.sfVerdict = v; this.modeVerdict.sigfig = v; this.lastVerdict = v;
    },

    // ================= C.3 density by displacement (dose + decision) =================
    // A scenario may pin the metals its own story can produce (`constraints.substances`).
    // The distractors on the identification grid still come from the whole bank, so the
    // reading stays as hard as it was; what changes is that a brief naming lead or a plated
    // base metal is no longer printed over a bar of gold.
    newSample() {
      const sc = this.nextScenario('c');
      const allow = (sc.constraints || {}).substances;
      const pool = allow ? SUBSTANCES.filter(s => allow.includes(s.name)) : SUBSTANCES;
      if (!pool.length) throw new Error(`newSample: ${sc.id} pins no SUBSTANCES entry that exists`);
      const sub = pick(pool);
      const vs = r1(3 + Math.random() * 6);
      this.dSub = sub;
      this.dMass = r1(sub.density * vs);
      this.dBefore = pick([15.0, 20.0, 25.0]);
      this.dAfter = r1(this.dBefore + vs);
      this.dOptions = shuffle([sub, ...shuffle(SUBSTANCES.filter(s => s !== sub)).slice(0, 3)]).map(s => s.name);
      this.dVolInput = ''; this.dDensInput = ''; this.dPick = null; this.dAction = null;
      this.dSc = sc;
      this.dChecked = false; this.dAttempted = false; this.dDone = false; this.dVerdict = null;
      // the Honors call rides on the same sample, so it re-rolls with it
      this.h1Input = ''; this.h1Pick = null; this.h1Checked = false; this.h1Attempted = false; this.h1Done = false; this.h1Verdict = null;
    },
    get dVolTrue() { return r1(this.dAfter - this.dBefore); },
    get dDensTrue() { return density(this.dMass, this.dVolTrue); },
    get dNearest() { return SUBSTANCES.reduce((best, s) => Math.abs(s.density - this.dDensTrue) < Math.abs(best.density - this.dDensTrue) ? s : best); },
    pickSub(name) { if (!this.dDone) { this.dPick = name; this.dChecked = false; } },
    subState(name) {
      if (!this.dChecked) return this.dPick === name ? 'on' : '';
      if (name === this.dSub.name) return 'correct';
      if (name === this.dPick) return 'wrong';
      return '';
    },
    pickAction(k) { if (!this.dDone) { this.dAction = k; this.dChecked = false; } },
    actionState(k) {
      if (!this.dChecked) return this.dAction === k ? 'on' : '';
      if (k === this.dActionTrue) return 'correct';
      if (k === this.dAction) return 'wrong';
      return '';
    },
    // Toxic metals come out; everything else can stay. This is the evidence-based
    // conclusion C.3 asks for: the density names the metal, and the metal decides the act.
    get dActionTrue() { return this.dSub && this.dSub.toxic ? 'pull' : 'keep'; },
    get dVolOk() { return numClose(parseFloat(this.dVolInput), this.dVolTrue, 0.05); },
    get dDensOk() {
      const val = parseFloat(this.dDensInput);
      if (!isFinite(val)) return false;
      return outcomeBand(val, this.dDensTrue, DENSITY_BANDS).withinSpec;
    },
    get dIdOk() { return this.dPick === this.dSub.name; },
    get dReady() { return this.dDensInput !== '' && !!this.dPick && !!this.dAction; },
    // A span dial across the whole candidate range, with every metal named as a band. The
    // learner's density lands inside exactly one band, which is the entire method in one
    // picture: a number on this axis IS an identification.
    get dGauge() {
      const val = parseFloat(this.dDensInput);
      if (!this.dChecked || !isFinite(val)) return null;
      const sorted = [...SUBSTANCES].sort((x, y) => x.density - y.density);
      const bands = sorted.map((s, i) => {
        const next = sorted[i + 1];
        return { upTo: next ? (s.density + next.density) / 2 : 20.5, label: s.name };
      });
      return {
        kind: 'span', value: val, min: 2, max: 20.5,
        ref: this.dDensTrue, refLabel: 'the sample’s real density', unit: ' g/mL', digits: 3,
        bands, label: 'where your density lands'
      };
    },
    // Honors: propagate the reading uncertainties into the density.
    get dUncert() {
      const dm = 0.1, dv = 0.2;        // balance ±0.1 g, two volume reads ±0.1 mL each
      const rel = dm / this.dMass + dv / this.dVolTrue;
      return { rel: rel * 100, abs: this.dDensTrue * rel };
    },
    // The gap to the nearest OTHER candidate, as a percentage of this density. If the
    // propagated uncertainty is wider than this, the number cannot name the metal.
    get dGapPct() {
      const others = SUBSTANCES.filter(s => s.name !== this.dNearest.name);
      const closest = others.reduce((b, s) => Math.abs(s.density - this.dNearest.density) < Math.abs(b.density - this.dNearest.density) ? s : b);
      return Math.abs(closest.density - this.dNearest.density) / this.dNearest.density * 100;
    },
    get h1True() { return this.dUncert.rel < this.dGapPct ? 'call' : 'bigger'; },
    certifySample() {
      if (this.dDone || !this.dReady) return;
      const sc = this.dSc, sub = this.dSub;
      const densOk = this.dDensOk, idOk = this.dIdOk, actOk = this.dAction === this.dActionTrue;
      const good = densOk && idOk && actOk;
      const yours = parseFloat(this.dDensInput);
      let v, effect;
      if (good) {
        v = { tone: 'success', icon: sc.icon, state: sub.toxic ? 'PULLED IN TIME' : 'CLEARED TO STAY', headline: 'Evidence and call agree',
          detail: `${fmt(yours, 3)} g/mL identifies ${sub.name}. ${sc.consequences[this.dAction]}` };
        effect = { ...sc.effect.good };
        this.dDone = true;
      } else {
        // Two different failures, and they are not equally bad. Leaving a toxic piece in
        // is the one that actually doses the tank, so it adds that metal's own leach rate.
        const leftToxic = sub.toxic && this.dAction === 'keep';
        const why = !densOk ? `Your density (${this.dDensInput}) misses the real ${fmt(this.dDensTrue, 3)} g/mL, so nothing after it is supported.`
          : !idOk ? `${fmt(this.dDensTrue, 3)} g/mL is ${sub.name}, not ${this.dPick}.`
            : `${sub.name} ${sub.toxic ? 'is toxic in a tank and had to come out' : 'is not acutely toxic and could have stayed'}.`;
        v = { tone: 'fail', icon: leftToxic ? '\u{2620}\u{FE0F}' : '\u{1F50E}', state: leftToxic ? 'METAL LEACHING' : 'CALL UNSUPPORTED',
          headline: leftToxic ? 'A toxic piece is still in the water' : 'The conclusion is not supported',
          detail: `${why} ${sc.consequences[this.dAction]}` };
        effect = { ...sc.effect.bad };
        if (leftToxic) { effect.metals = (effect.metals || 0) + sub.leach; effect.shock = (effect.shock || 0) + 12; }
      }
      this.gRecord('c', good, !this.dAttempted);
      this.recordWorld({ icon: v.icon, tone: v.tone, text: `${sc.system}, ${v.state.toLowerCase()}`, effect });
      this.dAttempted = true; this.dChecked = true; this.dVerdict = v; this.modeVerdict.density = v; this.lastVerdict = v;
    },
    h1PickOpt(k) { if (!this.h1Done) { this.h1Pick = k; this.h1Checked = false; } },
    h1State(k) {
      if (!this.h1Checked) return this.h1Pick === k ? 'on' : '';
      if (k === this.h1True) return 'correct';
      if (k === this.h1Pick) return 'wrong';
      return '';
    },
    get h1NumOk() {
      const val = parseFloat(this.h1Input);
      if (!isFinite(val)) return false;
      return outcomeBand(val, this.dUncert.rel, HONORS_BANDS).withinSpec;
    },
    get h1Ready() { return this.h1Input !== '' && !!this.h1Pick; },
    certifyH1() {
      if (this.h1Done || !this.h1Ready) return;
      const sc = this.h1Brief;
      // Precondition first, decision graded only once the arithmetic holds — Unit 5's
      // pcCertify shape. A right call reached from a wrong number is not evidence.
      const numOk = this.h1NumOk, callOk = this.h1Pick === this.h1True;
      const good = numOk && callOk;
      const v = good
        ? { tone: 'success', icon: sc.icon, state: 'RESOLVED', headline: 'The uncertainty was checked first',
          detail: `±${fmt(this.dUncert.rel, 2)}% against a ${fmt(this.dGapPct, 2)}% gap to the next candidate. ${sc.consequences[this.h1Pick]}` }
        : { tone: 'fail', icon: '\u{2696}\u{FE0F}', state: numOk ? 'WRONG CALL' : 'MATH FIRST',
          headline: numOk ? 'The number was right and the call was not' : 'The propagated uncertainty is off',
          detail: numOk
            ? `±${fmt(this.dUncert.rel, 2)}% against a ${fmt(this.dGapPct, 2)}% gap says "${this.h1True === 'call' ? 'name it' : 'find a bigger piece'}".`
            : `The relative uncertainties add: 0.1 g ÷ ${fmt(this.dMass, 3)} g plus 0.2 mL ÷ ${fmt(this.dVolTrue, 3)} mL = ${fmt(this.dUncert.rel, 2)}%.` };
      this.gRecord('h1', good, !this.h1Attempted);
      this.recordWorld({ icon: v.icon, tone: v.tone, text: `Uncertainty call, ${good ? 'resolved' : 'not supported'}`, effect: good ? sc.effect.good : sc.effect.bad });
      if (good) this.h1Done = true;
      this.h1Attempted = true; this.h1Checked = true; this.h1Verdict = v; this.modeVerdict.density = v; this.lastVerdict = v;
    },

    // ================= C.4 accuracy vs precision (decision) =================
    // Place five trials on the target the way the AP_BOARDS reference cards read: the
    // cluster's distance from the bullseye is the mean's error (accuracy), and the scatter
    // inside the cluster is the trial-to-trial spread (precision). Both axes have to carry
    // data, so a tightly grouped set never draws as a scattered one.
    plotDataset(trials, accepted) {
      const NORM = accepted * 0.09;            // 9% off the accepted value reaches the rim
      const avg = mean(trials);
      const dir = Math.random() * Math.PI * 2; // which way the systematic error points
      const cx = ((avg - accepted) / NORM) * Math.cos(dir);
      const cy = ((avg - accepted) / NORM) * Math.sin(dir);
      // golden angle, so five dots scatter organically instead of forming a pentagon
      const GOLDEN = 2.39996;
      return trials.map((v, i) => {
        const rad = Math.abs(v - avg) / NORM;
        const th = dir + GOLDEN * (i + 1);
        return onBoard(cx + rad * Math.cos(th), cy + rad * Math.sin(th));
      });
    },
    // `constraints.quantity` pins which of the three tank quantities an instrument is
    // actually capable of reading, which is also what fixes the number of decimals the
    // brief is allowed to talk about.
    newDataset() {
      const sc = this.nextScenario('d');
      const want = (sc.constraints || {}).quantity;
      const pool = want ? EV_SCENARIOS.filter(e => e.key === want) : EV_SCENARIOS;
      if (!pool.length) throw new Error(`newDataset: ${sc.id} pins no EV_SCENARIOS quantity that exists`);
      const s = pick(pool);
      const accurate = Math.random() < 0.5, precise = Math.random() < 0.5;
      const offset = accurate ? 0 : (Math.random() < 0.5 ? -1 : 1) * s.accepted * 0.06;
      const spread = (precise ? 0.005 : 0.05) * s.accepted;
      const f = s.dec === 1 ? r1 : r2;
      this.evScenario = s; this.evAccepted = s.accepted;
      this.evTrials = Array.from({ length: 5 }, () => f(s.accepted + offset + gauss() * spread));
      this.evDots = this.plotDataset(this.evTrials, s.accepted);
      this.evClassPick = null; this.evSc = sc;
      this.evChecked = false; this.evAttempted = false; this.evDone = false; this.evVerdict = null;
      this.h2Input = ''; this.h2Pick = null; this.h2Checked = false; this.h2Attempted = false; this.h2Done = false; this.h2Verdict = null;
    },
    get evMean() { return mean(this.evTrials); },
    get evStd() { return sampleStdDev(this.evTrials); },
    get evPctError() { return percentError(this.evMean, this.evAccepted); },
    get evRelStd() { return this.evMean ? this.evStd / Math.abs(this.evMean) * 100 : 0; },
    get evAccurate() { return this.evPctError < 2.5; },
    get evPrecise() { return this.evRelStd < 2; },
    get evVerdictKey() { return this.evAccurate && this.evPrecise ? 'both' : this.evPrecise ? 'precise' : this.evAccurate ? 'accurate' : 'neither'; },
    pickClass(k) { if (!this.evDone) { this.evClassPick = k; this.evChecked = false; } },
    classState(k) {
      if (!this.evChecked) return this.evClassPick === k ? 'on' : '';
      if (k === this.evVerdictKey) return 'correct';
      if (k === this.evClassPick) return 'wrong';
      return '';
    },
    // The accuracy half of the judgement, as a dial: the five-run mean against the value
    // somebody else measured. Precision is the scatter on the target board beside it, so
    // between them the two halves of C.4 each get their own picture.
    get evGauge() {
      if (!this.evScenario) return null;
      const a = this.evAccepted;
      return {
        kind: 'span', value: this.evMean, min: r2(a * 0.9), max: r2(a * 1.1),
        ref: a, refLabel: 'the accepted value', unit: this.evScenario.unit ? ` ${this.evScenario.unit}` : '', digits: 3,
        label: 'your five-run mean against the reference'
      };
    },
    judgeKit() {
      if (this.evDone || !this.evClassPick) return;
      const sc = this.evSc, good = this.evClassPick === this.evVerdictKey;
      const truth = AP_BOARDS.find(b => b.key === this.evVerdictKey);
      const v = good
        ? { tone: 'success', icon: sc.icon, state: 'JUDGED', headline: `${truth.title}`,
          detail: `${fmt(this.evPctError, 2)}% error and ${fmt(this.evRelStd, 2)}% spread. ${sc.consequences[this.evVerdictKey]}` }
        : { tone: 'fail', icon: '\u{1F4C9}', state: 'MISJUDGED', headline: `That set is ${truth.title.toLowerCase()}`,
          detail: `${fmt(this.evPctError, 2)}% error means it is ${this.evAccurate ? 'accurate' : 'not accurate'}; ${fmt(this.evRelStd, 2)}% spread means it is ${this.evPrecise ? 'precise' : 'not precise'}. ${sc.consequences[this.evClassPick]}` };
      this.gRecord('d', good, !this.evAttempted);
      this.recordWorld({ icon: v.icon, tone: v.tone, text: `${sc.system}, ${good ? 'judged correctly' : 'misjudged'}`, effect: good ? sc.effect.good : sc.effect.bad });
      if (good) this.evDone = true;
      this.evAttempted = true; this.evChecked = true; this.evVerdict = v; this.modeVerdict.evaluate = v; this.lastVerdict = v;
    },
    // Honors h2: scatter and bias have different cures, so the right action follows from
    // WHICH of the two failed, not from "the kit looks bad".
    get h2True() {
      if (!this.evPrecise) return 'replace';   // the reagent or the technique is failing
      if (!this.evAccurate) return 'send';     // tight and shifted: only an outside reference catches this
      return 'trust';
    },
    h2PickOpt(k) { if (!this.h2Done) { this.h2Pick = k; this.h2Checked = false; } },
    h2State(k) {
      if (!this.h2Checked) return this.h2Pick === k ? 'on' : '';
      if (k === this.h2True) return 'correct';
      if (k === this.h2Pick) return 'wrong';
      return '';
    },
    get h2NumOk() {
      const val = parseFloat(this.h2Input);
      if (!isFinite(val)) return false;
      return outcomeBand(val, this.evStd, HONORS_BANDS).withinSpec;
    },
    get h2Ready() { return this.h2Input !== '' && !!this.h2Pick; },
    certifyH2() {
      if (this.h2Done || !this.h2Ready) return;
      const sc = this.h2Brief;
      const numOk = this.h2NumOk, callOk = this.h2Pick === this.h2True;
      const good = numOk && callOk;
      const v = good
        ? { tone: 'success', icon: sc.icon, state: 'CALL MADE', headline: 'Quantified, then decided',
          detail: `s = ${fmt(this.evStd, 3)} on a mean of ${fmt(this.evMean, 4)}. ${sc.consequences[this.h2Pick]}` }
        : { tone: 'fail', icon: '\u{1F4C9}', state: numOk ? 'WRONG CURE' : 'MATH FIRST',
          headline: numOk ? 'The statistic was right and the cure was not' : 'The standard deviation is off',
          detail: numOk
            ? `${this.evPrecise ? 'The set repeats' : 'The set does not repeat'} and ${this.evAccurate ? 'lands on the reference' : 'sits off the reference'}, so the answer is "${this.h2True}".`
            : `s = √(Σ(xᵢ − x̄)² ÷ (n−1)) over the five trials comes to ${fmt(this.evStd, 3)}.` };
      this.gRecord('h2', good, !this.h2Attempted);
      this.recordWorld({ icon: v.icon, tone: v.tone, text: `Kit call, ${good ? 'made on the numbers' : 'not supported'}`, effect: good ? sc.effect.good : sc.effect.bad });
      if (good) this.h2Done = true;
      this.h2Attempted = true; this.h2Checked = true; this.h2Verdict = v; this.modeVerdict.evaluate = v; this.lastVerdict = v;
    },

    // ================= Capstone: the water change =================
    get capUnlocked() { return this.gOverall() === 1; },
    // The capstone's correct answer is a function of the tank the learner actually built,
    // the way Unit 10's evacuation call reads the patient's core temperature. Nothing here
    // is drawn from a pool: the chlorine, the metal load and the kit's trustworthiness are
    // whatever four stations' worth of decisions left behind.
    genCapstone() {
      const sc = this.scenarioById('cap-waterchange');
      const change = pick([40, 50, 60]);              // percent of the water being replaced
      const before = this.tank.chlorine;
      const after = r2(before * (100 - change) / 100);
      this.cap = {
        sc, change, before, after,
        gal: TANK.realGal,
        metals: this.tank.metals,
        kit: this.tank.kit,
        // The three-way call, resolved from the state rather than from a stored answer.
        correct: this.tank.kit < 50 ? 'shop'
          : (after > TANK.stressLine || this.tank.metals > TANK.metalLine) ? 'hold'
            : 'tonight'
      };
      this.capInput = ''; this.capPick = null;
      this.capChecked = false; this.capAttempted = false; this.capWin = false; this.capVerdict = null;
    },
    capPickAction(k) { if (!this.capWin) { this.capPick = k; this.capChecked = false; } },
    capActionState(k) {
      if (!this.capChecked) return this.capPick === k ? 'on' : '';
      if (k === this.cap.correct) return 'correct';
      if (k === this.capPick) return 'wrong';
      return '';
    },
    get capNumOk() {
      const val = parseFloat(this.capInput);
      if (!isFinite(val) || !this.cap) return false;
      // Absolute, not relative: a tank at 0.04 mg/L would make a relative band absurdly
      // tight, and the kit itself cannot resolve better than a hundredth anyway.
      return Math.abs(val - this.cap.after) <= 0.02 + 1e-9;
    },
    get capReady() { return this.capInput !== '' && !!this.capPick; },
    get capGauge() {
      if (!this.cap || !this.capChecked) return null;
      return {
        kind: 'span', value: this.cap.after, min: 0, max: Math.max(1, r2(this.cap.before)),
        ref: TANK.stressLine, refLabel: 'the stress line', unit: ' mg/L', digits: 2,
        label: 'what the tank will read after the change'
      };
    },
    capCommit() {
      if (this.capWin || !this.capReady) return;
      const sc = this.cap.sc;
      const numOk = this.capNumOk, callOk = this.capPick === this.cap.correct;
      const good = numOk && callOk;
      let v, effect;
      if (good) {
        v = { tone: 'success', icon: sc.icon, state: 'CALL MADE', headline: 'Six fish, and you did the arithmetic first',
          detail: `A ${this.cap.change}% change takes ${this.cap.before.toFixed(2)} mg/L down to ${this.cap.after.toFixed(2)} mg/L. ${sc.consequences[this.capPick]}` };
        effect = sc.effect.good;
        this.capWin = true;
      } else {
        // Putting fish into water that is not ready is the failure this whole unit exists
        // to prevent, so it is the only wrong call that lands as acute harm. Holding them
        // an extra night when they could have gone in is cautious, not dangerous.
        const dangerous = this.capPick === 'tonight' && this.cap.correct !== 'tonight';
        v = { tone: 'fail', icon: dangerous ? '\u{2620}\u{FE0F}' : '\u{23F3}', state: numOk ? 'WRONG CALL' : 'MATH FIRST',
          headline: numOk ? 'The number was right and the call was not' : 'Work out the water first',
          detail: numOk
            ? `${this.cap.after.toFixed(2)} mg/L chlorine, ${this.cap.metals.toFixed(3)} mg/L metal, kit at ${Math.round(this.cap.kit)}%. ${sc.consequences[this.capPick]}`
            : `A ${this.cap.change}% water change leaves ${(100 - this.cap.change)}% of the chlorine behind: ${this.cap.before.toFixed(2)} × ${((100 - this.cap.change) / 100).toFixed(2)} = ${this.cap.after.toFixed(2)} mg/L.` };
        effect = dangerous ? sc.effect.bad : sc.effect.badSafe;
      }
      this.gRecord('cap', good, !this.capAttempted);
      this.recordWorld({ icon: v.icon, tone: v.tone, text: `Water change, ${good ? 'call made on the numbers' : 'call not supported'}`, effect });
      this.capAttempted = true; this.capChecked = true; this.capVerdict = v; this.modeVerdict.capstone = v; this.lastVerdict = v;
    },
    capNext() { this.genCapstone(); }
  };
}
