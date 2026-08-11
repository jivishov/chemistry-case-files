// main.js: Unit 9 view-model (Acids & Bases, TEKS C.12). Wires the model + engine + the
// shared game framework to the UI. You are the overnight tech on a poison-control bench,
// one night shift, with a patient next door who is acidotic at pH 7.20. Every stage's core
// interaction IS the chemistry: build an IUPAC name from its rule parts, find a conjugate
// partner, sort bottles by dissociation, criss-cross a salt and call the moles that
// neutralize it, and convert an ion concentration into a pH. No multiple-choice-with-a-
// meter, no drag-and-drop. The Scenario layer sits around those tools unchanged: a brief
// before the call, a banded verdict after it, and a world-state that is the chemistry
// itself, the patient's arterial pH.
import {
  SE, ACID_NAMES, BASE_NAMES, ACID_PREFIXES, ACID_ROOTS, ACID_SUFFIXES,
  BASE_METALS, BASE_ROMANS, BASE_SUFFIXES, DEFINE_POOL, STRENGTH, STRENGTH_REASON,
  NEUT_ACIDS, NEUT_BASES, WEAK_ACIDS, WEAK_CONCS, INDICATORS,
  SCENARIOS, NEUT_BANDS, METER_BANDS, METER_MANTISSAS, WEAK_BANDS, titrBands
} from './model.js';
import {
  pH, pOH, pHfromPOH, equivalenceVolume, titrationPH, phWeakAcid,
  moleRatio, gcd, fmt
} from '../../../shared/js/chem.js';
import { createGame, outcomeBand } from '../../../shared/js/game.js';
import { lineChart } from '../../../shared/js/render.js';

// Chart.js object lives at module scope, never inside Alpine's reactive proxy.
let titrChart = null;

const pick = a => a[(Math.random() * a.length) | 0];
const shuffle = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
// Pick from a list while avoiding the recently used items, so a run is not rote.
const pickNot = (a, recent, keyFn = x => x) => {
  const fresh = a.filter(x => !recent.includes(keyFn(x)));
  return pick(fresh.length ? fresh : a);
};
const rN = (x, n) => { const p = 10 ** n; return Math.round(x * p) / p; };
const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));
const lcm = (a, b) => a * b / gcd(a, b);
const scOf = id => SCENARIOS.find(s => s.id === id);
// "an acid" but "a base": the define verdict builds a sentence around a pool value.
const article = w => (/^[aeiou]/i.test(w) ? 'an ' : 'a ') + w;

// pH -> color across the scale: red (acidic 0) through green (neutral 7) to
// blue (basic 14). Hue 0..240 maps the 0..14 range.
const phColor = ph => `hsl(${clamp(ph / 14, 0, 1) * 240}, 68%, 45%)`;

// ---- world-state constants: the patient, the reference window, the night clock ----
const PH_START = 7.20;      // arterial pH on arrival: a real acidotic patient
const PH_FLOOR = 6.80;      // the low extreme of survivable, and the end of the scale
const PH_CEIL = 7.44;       // correct calls titrate INTO the window, never past it
const WIN_LO = 7.35, WIN_HI = 7.45;   // the real arterial reference range
const PH_CRASH = 7.10;      // below this the patient is crashing, not just acidotic
const SCALE_LO = 6.80, SCALE_HI = 7.60;   // the drawn scale, with headroom past the window
const DRIFT_PER_MIN = 0.002;  // the patient drifts down while you work: 0.02 pH per 10 min
const SHIFT_START = 23 * 60;  // the night shift starts at 23:00
const SHIFT_LEN = 8 * 60;     // and hands over at 07:00: the clock stops there rather than
                              // stamping a log line at lunchtime on a night shift

// Build a neutral salt formula from a cation token + its subscript and an anion
// token (poly = takes parentheses) + its subscript. e.g. ('Ca',1,'NO3',true,2) -> 'Ca(NO3)2'.
function buildSalt(cat, catSub, an, anPoly, anSub) {
  const catPart = cat + (catSub > 1 ? catSub : '');
  const anPart = anSub > 1 ? (anPoly ? `(${an})${anSub}` : `${an}${anSub}`) : an;
  return catPart + anPart;
}

const skills = [
  { id: 'a',  code: 'C.12(A)', label: 'Acid/base naming',      target: 3 },
  { id: 'b',  code: 'C.12(B)', label: 'Definitions/conjugates', target: 3 },
  { id: 'c',  code: 'C.12(C)', label: 'Strong vs weak',         target: 3 },
  { id: 'd',  code: 'C.12(D)', label: 'Neutralization',         target: 3 },
  { id: 'e',  code: 'C.12(E)', label: 'pH from [H+]',           target: 3 },
  { id: 'h1', code: 'Honors',  label: 'Titration curve',        target: 2, honors: true },
  { id: 'h2', code: 'Honors',  label: 'Weak-acid Ka',           target: 2, honors: true },
  { id: 'cap', code: 'Capstone', label: 'Last call',            target: 1, honors: true }
];

export { SE };

export function createSim() {
  return {
    ...createGame({ unitId: '09-acids-bases', skills }),
    SE, fmt,
    honors: false,
    mode: 'naming',

    // ---- world-state: the patient, and the night log (session-local) ----
    // The driving state IS the chemistry: arterial blood pH, against the real 7.35 to 7.45
    // reference range. It drifts down with elapsed minutes, so a slow wrong answer costs
    // the same way a fast wrong one does. The old `stabilized` counter was deleted rather
    // than renamed, because a number that only goes up is a score, not a world.
    ph: PH_START,
    clockMin: 0,
    worldLog: [],
    _wid: 0,
    scIdx: { a: -1, b: -1, c: -1, d: -1, e: -1 },

    // vocabularies for the name-builder selects
    acidPrefixes: ACID_PREFIXES, acidRoots: ACID_ROOTS, acidSuffixes: ACID_SUFFIXES,
    baseMetals: BASE_METALS, baseRomans: BASE_ROMANS, baseSuffixes: BASE_SUFFIXES,
    indicators: INDICATORS,

    // ---- stage state (all generated in init so no subtree ever hits a null) ----
    na: null, naSel: { prefix: '', root: '', suffix: '', metal: '', roman: '' }, naChecked: false, naAttempted: false, naDone: false, naVerdict: null, recentA: [],
    df: null, dfBags: {}, dfLastText: '', dfA: null, dfB: null, dfChecked: false, dfAttempted: false, dfDone: false, dfVerdict: null,
    st: null, stSel: {}, stReason: null, stChecked: false, stAttempted: false, stDone: false, stVerdict: null,
    nu: null, nuCat: 1, nuAn: 1, nuBaseInput: '', nuChecked: false, nuAttempted: false, nuDone: false, nuVerdict: null,
    ti: null, tiVb: 0, tiInd: null, tiChecked: false, tiAttempted: false, tiDone: false, tiVerdict: null,
    me: null, meGuess: 7, meClass: null, meChecked: false, meAttempted: false, meDone: false, meVerdict: null,
    wa: null, waGuess: 7, waChecked: false, waAttempted: false, waDone: false, waVerdict: null,
    cap: null, capNaSel: { prefix: '', root: '', suffix: '' }, capClass: null,
    capCat: 1, capAn: 1, capBaseInput: '', capChecked: false, capAttempted: false, capWin: false, capVerdict: null,

    init() {
      this.gLoad();
      this.genNaming();
      this.dfDeal();
      this.genStrength();
      this.genNeutralize();
      this.genMeter();
      this.genTitration();
      this.genWeak();
      this.$nextTick(() => this.buildTitrChart());
      this.$watch('mode', () => this.$nextTick(() => this.resizeTitr()));
      this.$watch('honors', () => this.$nextTick(() => { this.resizeTitr(); this.reapplySelects(); }));
    },

    setMode(m) {
      this.mode = m;
      if (m === 'capstone' && this.capUnlocked && !this.cap) this.genCapstone();
    },

    resetProgress() {
      this.gReset();
      this.ph = PH_START; this.clockMin = 0; this.worldLog = [];
      this.scIdx = { a: -1, b: -1, c: -1, d: -1, e: -1 };
      this.dfBags = {}; this.dfLastText = ''; this.recentA = [];
      this.genNaming(); this.dfDeal(); this.genStrength(); this.genNeutralize();
      this.genMeter(); this.genTitration(); this.genWeak();
      this.cap = null; this.capWin = false; this.capVerdict = null;
    },

    // ---- scenario plumbing ----
    nextScenario(skill) {
      const list = SCENARIOS.filter(s => s.skill === skill);
      const i = (this.scIdx[skill] = (this.scIdx[skill] ?? -1) + 1) % list.length;
      return list[i];
    },
    // Advance the night clock, drift the patient down by exactly that much elapsed time,
    // apply what the call itself did, and prepend a log line. U11's clock-and-spend shape,
    // because the drift-with-time behaviour is exactly U11's decaying vial. A correct call
    // titrates the patient toward the window and never past it (PH_CEIL), which is what an
    // intervention that is dosed correctly looks like.
    recordWorld({ icon, tone, text, minutes, delta = 0 }) {
      // Only the minutes that fit inside the shift are spent, and the patient drifts by
      // exactly those, so the clock and the drift never disagree. Past the handover the
      // clock reads 07:00 and the drift stops: the shift is over, and the stage is practice.
      const spent = Math.min(minutes, SHIFT_LEN - this.clockMin);
      this.clockMin += spent;
      // The drift models a patient who is NOT yet corrected. Once the gas is back inside the
      // reference range they are stable and holding, so time stops costing them; a wrong
      // call on one of the six scenarios that reach them can still knock them back out, and
      // then the drift resumes. Without this, a learner who keeps practising correctly after
      // stabilising the patient would push them back into acidosis for doing nothing wrong.
      const drift = this.phInWindow ? 0 : DRIFT_PER_MIN * spent;
      const moved = this.ph - drift + delta;
      this.ph = rN(clamp(moved, PH_FLOOR, PH_CEIL), 3);
      this.worldLog.unshift({ id: ++this._wid, icon, tone, text: `${this.clockLabel} ${text}` });
      if (this.worldLog.length > 6) this.worldLog.pop();
    },
    get clockLabel() {
      const t = SHIFT_START + this.clockMin;
      return `${String(Math.floor(t / 60) % 24).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;
    },
    // Two fixed decimals, NOT fmt(): fmt takes significant figures, so it prints 7.20 as
    // "7.2", and a headline number that changes width as it moves reads as a different
    // measurement rather than the same one moving.
    get phLabel() { return this.ph.toFixed(2); },
    get phInWindow() { return this.ph >= WIN_LO && this.ph <= WIN_HI; },
    // A windowed meter, not a monotone bar: the needle sits where the patient is and the
    // safe band is drawn on the scale, so "better" is toward a band, not toward an end.
    get phNeedlePct() { return clamp((this.ph - SCALE_LO) / (SCALE_HI - SCALE_LO), 0, 1) * 100; },
    get phBandLeftPct() { return (WIN_LO - SCALE_LO) / (SCALE_HI - SCALE_LO) * 100; },
    get phBandWidthPct() { return (WIN_HI - WIN_LO) / (SCALE_HI - SCALE_LO) * 100; },
    get phMood() { return this.phInWindow ? '\u{1F642}' : this.ph >= PH_CRASH ? '\u{1F630}' : '\u{1F635}'; },
    get phState() {
      if (this.phInWindow) return 'Patient stable, the gas is in the window';
      if (this.ph >= PH_CRASH) return 'Patient acidotic, still compensating';
      return 'Patient crashing';
    },
    get phTone() { return this.phInWindow ? 'var(--success)' : this.ph >= PH_CRASH ? 'var(--warn)' : 'var(--danger)'; },
    get winLo() { return WIN_LO; },
    get winHi() { return WIN_HI; },

    // Every commit handler that can flip a mastery gate re-applies the <select> values on
    // the next tick. A select inside a subtree that first renders on MASTERY binds before
    // its x-for has built the options, and the dropdown then shows the wrong one silently
    // (trap 36). The capstone's three name selects are exactly that subtree.
    reapplySelects() {
      this.naSel = { ...this.naSel };
      this.capNaSel = { ...this.capNaSel };
    },

    // Shared verdict builders. A dose stage grades a committed number with outcomeBand; a
    // decision or identity stage grades a pick. Both return the same {tone, icon, state,
    // headline, detail, gauge} shape the markup renders.
    // `dp` is fixed decimal places, and it is required rather than optional: every quantity
    // this unit grades (a pH, a mole figure, a burette volume) is a fixed-precision
    // measurement, and fmt() takes SIGNIFICANT figures, so it would print a committed 7.30
    // as "7.3" against a target of "7.301" and read as two different measurements (trap 43).
    doseVerdict(sc, val, target, bands, unit, detail, dp) {
      if (!isFinite(val)) {
        return { v: { tone: 'fail', icon: '\u{26A0}\u{FE0F}', state: 'NO NUMBER', headline: 'Nothing to act on', detail: sc.fail, gauge: null }, good: false, dir: 'fail' };
      }
      const band = outcomeBand(val, target, bands);
      const good = band.withinSpec;
      const n = x => x.toFixed(dp);
      const yours = `${n(val)} ${unit}`;
      const needTxt = `${n(target)} ${unit}`;
      if (good) {
        return { v: { tone: 'success', icon: sc.icon, state: sc.safeState, headline: 'Called it right',
          detail: `You called ${yours}; the bench needs ${needTxt}. ${detail} ${sc.safe}`, gauge: 'on' }, good: true, dir: 'ok' };
      }
      const off = `${n(Math.abs(val - target))} ${unit}`;
      const low = band.direction === 'low';
      return { v: { tone: 'fail', icon: '\u{1F6A8}', state: low ? sc.lowState : sc.highState,
        headline: low ? 'Called it low' : 'Called it high',
        detail: `You called ${yours}, ${off} ${low ? 'under' : 'over'} the ${needTxt} it needs. ${detail} ${low ? sc.low : sc.high}`,
        gauge: low ? 'low' : 'high' }, good: false, dir: low ? 'low' : 'high' };
    },
    decisionVerdict(sc, good, state, headline, detail, consequence) {
      return good
        ? { tone: 'success', icon: sc.icon, state: 'CALLED IT', headline, detail: `${detail} ${consequence}`, gauge: null }
        : { tone: 'fail', icon: '\u{1F6A8}', state, headline, detail: `${detail} ${consequence}`, gauge: null };
    },
    // The tail every commit handler shares: book the world move, then re-apply the selects
    // in case this call was the one that unlocked the capstone.
    commitWorld(sc, ok, text, delta) {
      this.recordWorld({ icon: ok ? sc.icon : '\u{1F6A8}', tone: ok ? 'success' : 'fail', text,
        minutes: ok ? sc.minutes.ok : sc.minutes.wrong, delta });
      this.$nextTick(() => this.reapplySelects());
    },

    seCaption(se) {
      if (this.gMastered(se.id)) return 'Mastered';
      const sk = this.g_skills[se.id];
      const def = this.g_skillDefs.find(d => d.id === se.id) || {};
      return `${sk ? sk.run : 0} of ${def.target || 3} correct in a row`;
    },

    // ===================== C.12(A) acid + base naming =====================
    genNaming() {
      const sc = this.nextScenario('a');
      const pool = [...ACID_NAMES, ...BASE_NAMES].filter(x => sc.constraints.formulas.includes(x.f));
      if (!pool.length) throw new Error(`genNaming: ${sc.id} pins no ACID_NAMES or BASE_NAMES formula that exists`);
      const item = pickNot(pool, this.recentA, x => x.f);
      this.recentA = [...this.recentA, item.f].slice(-5);
      this.na = { ...item, sc };
      this.naSel = { prefix: '', root: '', suffix: '', metal: '', roman: '' };
      this.naChecked = false; this.naAttempted = false; this.naDone = false; this.naVerdict = null;
      this.$nextTick(() => this.reapplySelects());
    },
    get naReady() {
      const s = this.naSel;
      return this.na.kind === 'base' ? !!(s.metal && s.roman && s.suffix) : !!(s.prefix && s.root && s.suffix);
    },
    // The stem is the substance (which element, and which member of a series); the ending is
    // which form of it. They fail differently, so the verdict needs to know which one went.
    get naStemOk() {
      const s = this.naSel, n = this.na;
      return n.kind === 'base' ? s.metal === n.metal && s.roman === n.roman : s.prefix === n.prefix && s.root === n.root;
    },
    get naOk() {
      const s = this.naSel, n = this.na;
      return n.kind === 'base'
        ? s.metal === n.metal && s.roman === n.roman && s.suffix === n.suffix
        : s.prefix === n.prefix && s.root === n.root && s.suffix === n.suffix;
    },
    joinAcid(prefix, root, suffix) {
      const p = prefix === '(none)' ? '' : prefix;
      const stem = suffix === '-ide' ? root + 'ide' : suffix === '-ous acid' ? root + 'ous acid' : root + 'ic acid';
      return p + stem;
    },
    joinBase(metal, roman, suffix) {
      return metal + (roman === '(none)' ? '' : roman) + ' ' + suffix;
    },
    naPreview(sel) {
      const n = this.na;
      if (n.kind === 'base') {
        if (!(sel.metal && sel.roman && sel.suffix)) return '...';
        return this.joinBase(sel.metal, sel.roman, sel.suffix);
      }
      if (!(sel.prefix && sel.root && sel.suffix)) return '...';
      return this.joinAcid(sel.prefix, sel.root, sel.suffix);
    },
    get naExplain() {
      const n = this.na;
      if (n.kind === 'base') {
        return `${n.f} is ${n.name}: a hydroxide base is the metal name plus hydroxide, with a roman numeral for the charge when the metal has more than one.`;
      }
      if (n.kind === 'binary') {
        return `${n.f} is ${n.name}: a binary acid has no oxygen, so it takes hydro- plus the element root plus -ic acid.`;
      }
      return `${n.f} is ${n.name}: an oxyacid built on an -ate ion ends in -ic acid and one built on an -ite ion ends in -ous acid, with per- and hypo- shifting the chlorine series one step either way.`;
    },
    naCheck() {
      if (this.naDone || !this.naReady) return;
      const sc = this.na.sc, n = this.na;
      const stemOk = this.naStemOk;
      const ok = this.naOk;
      const consequence = ok ? sc.right : (stemOk ? sc.wrongSuffix : sc.wrongStem);
      const v = this.decisionVerdict(sc, ok, stemOk ? 'WRONG ENDING' : 'WRONG SUBSTANCE',
        ok ? `${n.name}: named right` : `It is ${n.name}, not ${this.naPreview(this.naSel)}`,
        this.naExplain, consequence);
      this.gRecord('a', ok, !this.naAttempted);
      this.commitWorld(sc, ok, `${sc.system}, ${ok ? 'named' : 'misnamed'}`, ok ? sc.delta.ok : sc.delta.wrong);
      this.naAttempted = true; this.naChecked = true; this.naVerdict = v;
      if (ok) this.naDone = true;
    },
    naNext() { this.genNaming(); },

    // ===================== C.12(B) definitions + conjugate pairs =====================
    // The scenario pins which KIND of card is dealt (a framework statement or a conjugate
    // pair), and the bag rotates within that subset so a run does not repeat a card.
    dfDeal() {
      const sc = this.nextScenario('b');
      const pool = DEFINE_POOL.filter(d => sc.constraints.kinds.includes(d.kind));
      if (!pool.length) throw new Error(`dfDeal: ${sc.id} pins no DEFINE_POOL kind that exists`);
      // One bag per scenario, so a card cannot repeat until that scenario's subset is
      // exhausted even though the two scenarios alternate.
      if (!this.dfBags[sc.id] || !this.dfBags[sc.id].length) {
        const bag = shuffle(pool.map((_, i) => i));
        if (pool[bag[0]].text === this.dfLastText && bag.length > 1) bag.push(bag.shift());
        this.dfBags[sc.id] = bag;
      }
      const item = pool[this.dfBags[sc.id].shift()];
      this.dfLastText = item.text;
      this.df = { ...item, sc };
      this.dfA = null; this.dfB = null;
      this.dfChecked = false; this.dfAttempted = false; this.dfDone = false; this.dfVerdict = null;
    },
    dfPickA(v) { if (!this.dfDone) { this.dfA = v; this.dfChecked = false; } },
    dfPickB(v) { if (!this.dfDone) { this.dfB = v; this.dfChecked = false; } },
    dfStateA(v) {
      if (!this.dfChecked) return this.dfA === v ? 'on' : '';
      if (v === this.df.qA.answer) return 'correct';
      if (v === this.dfA) return 'wrong';
      return '';
    },
    dfStateB(v) {
      if (!this.dfChecked) return this.dfB === v ? 'on' : '';
      if (v === this.df.qB.answer) return 'correct';
      if (v === this.dfB) return 'wrong';
      return '';
    },
    get dfAOk() { return this.dfA === this.df.qA.answer; },
    get dfOk() { return this.dfA === this.df.qA.answer && this.dfB === this.df.qB.answer; },
    dfCheck() {
      if (this.dfDone || this.dfA === null || this.dfB === null) return;
      const sc = this.df.sc;
      const aOk = this.dfAOk;
      const ok = this.dfOk;
      const consequence = ok ? sc.right : (aOk ? sc.wrongB : sc.wrongA);
      // The two card kinds ask different questions of qA, so the headline has to differ:
      // on a conjugate card qA is the partner and the role belongs to the species on the
      // card; on a framework card qA is the definition and the role is what it describes.
      const answer = this.df.kind === 'conjugate'
        ? `The partner is ${this.df.qA.answer}, and ${this.df.ce} is acting as ${article(this.df.qB.answer)}`
        : `It is the ${this.df.qA.answer} definition, describing ${article(this.df.qB.answer)}`;
      const v = this.decisionVerdict(sc, ok, aOk ? 'WRONG ON THE ROLE' : 'WRONG ON THE SPECIES',
        ok ? 'Both halves hold' : answer,
        this.df.explain, consequence);
      this.gRecord('b', ok, !this.dfAttempted);
      this.commitWorld(sc, ok, `${sc.system}, ${ok ? 'pair called' : 'pair misread'}`, ok ? sc.delta.ok : sc.delta.wrong);
      this.dfAttempted = true; this.dfChecked = true; this.dfVerdict = v;
      if (ok) this.dfDone = true;
    },
    dfNext() { this.dfDeal(); },

    // ===================== C.12(C) strong vs weak =====================
    genStrength() {
      const sc = this.nextScenario('c');
      const fam = pick(sc.constraints.fams);
      const pool = STRENGTH[fam];
      if (!pool) throw new Error(`genStrength: ${sc.id} pins no STRENGTH family that exists`);
      const nStrong = 1 + ((Math.random() * 3) | 0);                       // 1..3 strong, rest weak
      const bottles = shuffle([
        ...shuffle(pool.strong).slice(0, nStrong).map(b => ({ ...b, strong: true })),
        ...shuffle(pool.weak).slice(0, 4 - nStrong).map(b => ({ ...b, strong: false }))
      ]);
      const reason = STRENGTH_REASON[fam];
      this.st = { sc, fam, bottles, reason: { ...reason, options: shuffle(reason.options) } };
      this.stSel = {}; this.stReason = null;
      this.stChecked = false; this.stAttempted = false; this.stDone = false; this.stVerdict = null;
    },
    stSet(f, v) { if (!this.stDone) { this.stSel[f] = v; this.stChecked = false; } },
    stState(f, v) {
      const bottle = this.st.bottles.find(b => b.f === f);
      if (!bottle) return '';   // stale x-for item during a shelf swap; harmless
      const correct = bottle.strong ? 'strong' : 'weak';
      if (!this.stChecked) return this.stSel[f] === v ? 'on' : '';
      if (v === correct) return 'correct';
      if (v === this.stSel[f]) return 'wrong';
      return '';
    },
    stPickReason(v) { if (!this.stDone) { this.stReason = v; this.stChecked = false; } },
    stReasonState(v) {
      if (!this.stChecked) return this.stReason === v ? 'on' : '';
      if (v === this.st.reason.answer) return 'correct';
      if (v === this.stReason) return 'wrong';
      return '';
    },
    get stAllClassified() { return this.st.bottles.every(b => this.stSel[b.f]); },
    get stClassOk() { return this.st.bottles.every(b => this.stSel[b.f] === (b.strong ? 'strong' : 'weak')); },
    get stOk() { return this.stClassOk && this.stReason === this.st.reason.answer; },
    get stExplain() {
      const strong = this.st.bottles.filter(b => b.strong).map(b => b.f);
      const weak = this.st.bottles.filter(b => !b.strong).map(b => b.f);
      const ion = this.st.fam === 'acid' ? 'H+' : 'OH-';
      return `${strong.join(', ') || 'None'} ionize completely, so at equal concentration they put the most ${ion} into solution; ` +
        `${weak.join(', ') || 'none'} ionize only partly, so most of what is in the bottle stays intact in water.`;
    },
    stCheck() {
      if (this.stDone || !this.stAllClassified || !this.stReason) return;
      const sc = this.st.sc;
      const classOk = this.stClassOk;
      const ok = this.stOk;
      const consequence = ok ? sc.right : (classOk ? sc.wrongReason : sc.wrongSort);
      const v = this.decisionVerdict(sc, ok, classOk ? 'WRONG ON THE REASON' : 'WRONG ON THE SHELF',
        ok ? `The ${this.st.fam}s are sorted` : `The sort the bottles actually make is not the one you called`,
        this.stExplain, consequence);
      this.gRecord('c', ok, !this.stAttempted);
      this.commitWorld(sc, ok, `${sc.system}, ${ok ? 'shelf sorted' : 'shelf misread'}`, ok ? sc.delta.ok : sc.delta.wrong);
      this.stAttempted = true; this.stChecked = true; this.stVerdict = v;
      if (ok) this.stDone = true;
    },
    stNext() { this.genStrength(); },

    // ===================== C.12(D) neutralization =====================
    genNeutralize() {
      const sc = this.nextScenario('d');
      const acids = NEUT_ACIDS.filter(a => sc.constraints.acids.includes(a.f));
      const bases = NEUT_BASES.filter(b => sc.constraints.bases.includes(b.f));
      if (!acids.length || !bases.length) throw new Error(`genNeutralize: ${sc.id} pins no NEUT pool entry that exists`);
      const acid = pick(acids), base = pick(bases);
      const g = gcd(base.charge, acid.charge);
      const catSub = acid.charge / g, anionSub = base.charge / g;        // salt criss-cross
      const L = lcm(acid.protons, base.hydroxides);
      const coefAcid = L / acid.protons, coefBase = L / base.hydroxides; // neutralization coefficients
      // Snap the draw to what the page will DISPLAY, so a learner who works from the number
      // on screen is graded against that number and not a hidden one (trap 31).
      const molAcid = rN(0.2 + Math.random() * 0.8, 2);
      const neutralBase = rN(moleRatio({ c: coefAcid }, { c: coefBase }, molAcid), 4);
      this.nu = { sc, acid, base, molAcid, V: 1.0, catSub, anionSub, coefAcid, coefBase, neutralBase, bands: NEUT_BANDS };
      this.nuCat = 1; this.nuAn = 1; this.nuBaseInput = '';
      this.nuChecked = false; this.nuAttempted = false; this.nuDone = false; this.nuVerdict = null;
    },
    nuCatStep(d) { if (!this.nuDone) { this.nuCat = clamp(this.nuCat + d, 1, 6); this.nuChecked = false; } },
    nuAnStep(d) { if (!this.nuDone) { this.nuAn = clamp(this.nuAn + d, 1, 6); this.nuChecked = false; } },
    get nuStudentSalt() { return buildSalt(this.nu.base.cation, this.nuCat, this.nu.acid.anion, this.nu.acid.poly, this.nuAn); },
    get nuCorrectSalt() { return buildSalt(this.nu.base.cation, this.nu.catSub, this.nu.acid.anion, this.nu.acid.poly, this.nu.anionSub); },
    get nuSaltOk() { return this.nuCat === this.nu.catSub && this.nuAn === this.nu.anionSub; },
    get nuBaseVal() { return parseFloat(this.nuBaseInput); },
    // Live beaker pH as base is added. This computes the graded answer for the learner (it
    // reads 7.00 at exactly the right number of moles), so the markup keeps it hidden until
    // the call is committed and shows it afterwards, which keeps the beaker explorable.
    // Both ionizations of H2SO4 are treated as complete here, which is the standard
    // first-course treatment and exact at the neutral point (the stoichiometry is 2 OH- per
    // H2SO4 either way); away from it the reading is approximate in the third decimal,
    // because Ka2 is 0.012 rather than infinite. The pool is strong acids and bases only so
    // that this stays the only approximation on the stage.
    get nuPH() {
      const molBase = isFinite(this.nuBaseVal) ? this.nuBaseVal : 0;
      const net = this.nu.molAcid * this.nu.acid.protons - molBase * this.nu.base.hydroxides;  // mol H+ minus mol OH-
      if (Math.abs(net) < 1e-9) return 7;
      const conc = Math.abs(net) / this.nu.V;
      return clamp(net > 0 ? pH(conc) : pHfromPOH(pOH(conc)), 0, 14);
    },
    get nuPHClass() { const p = this.nuPH; return Math.abs(p - 7) < 0.05 ? 'neutral' : p < 7 ? 'acidic' : 'basic'; },
    nuPhColor(p) { return phColor(p); },
    get nuExplain() {
      const n = this.nu;
      return `${n.acid.f} gives ${n.acid.protons} H+ per formula unit and ${n.base.f} gives ${n.base.hydroxides} OH-, ` +
        `so the balanced neutralization is ${n.coefAcid} ${n.acid.f} + ${n.coefBase} ${n.base.f}, a ${n.coefAcid} to ${n.coefBase} mole ratio. ` +
        `${n.molAcid.toFixed(2)} mol of acid therefore takes ${n.neutralBase.toFixed(3)} mol of base to reach pH 7, and the salt is ${this.nuCorrectSalt} plus water.`;
    },
    nuCheck() {
      if (this.nuDone || this.nuBaseInput === '') return;
      const sc = this.nu.sc;
      const saltOk = this.nuSaltOk;
      const saltNote = saltOk ? '' : ` The salt is also wrong: criss-crossing the charges gives ${this.nuCorrectSalt}, not ${this.nuStudentSalt}.`;
      const r = this.doseVerdict(sc, this.nuBaseVal, this.nu.neutralBase, this.nu.bands, 'mol', this.nuExplain + saltNote, 3);
      let v = r.v, ok = r.good && saltOk, dir = r.dir;
      // A right amount with a wrong salt is its own outcome and needs its own consequence
      // text: falling through to sc.low would print "you called it low" over a number that
      // was exactly right, which is the contradiction trap 30 is about. The gauge still
      // reads `on`, because the gauge describes the number.
      if (r.good && !saltOk) {
        v = { tone: 'fail', icon: '\u{1F6A8}', state: 'SALT CALLED WRONG', headline: 'Amount right, salt wrong',
          detail: `${this.nuExplain}${saltNote} ${sc.saltWrong}`, gauge: 'on' };
        dir = 'salt';
      }
      const d = sc.delta;
      this.gRecord('d', ok, !this.nuAttempted);
      this.commitWorld(sc, ok, `${sc.system}, ${ok ? 'brought to neutral' : (dir === 'salt' ? 'salt called wrong' : 'dose missed')}`,
        ok ? d.ok : (dir === 'high' ? d.high : d.low));
      this.nuAttempted = true; this.nuChecked = true; this.nuVerdict = v;
      if (ok) this.nuDone = true;
      // Mastering 'd' reveals the titration canvas without a mode or honors change, so size
      // the previously display:none chart once it can be shown. Not incidental: keep it.
      if (this.honors && this.gMastered('d')) this.$nextTick(() => { this.resizeTitr(); this.updateTitrChart(); });
    },
    nuNext() { this.genNeutralize(); },

    // ===================== Honors h1: titration curve =====================
    get h1Unlocked() { return this.gMastered('d'); },
    genTitration() {
      const sc = scOf('h1-titrate');
      const Ca = pick([0.05, 0.10, 0.20]), Va = pick([20, 25, 50]), Cb = pick([0.05, 0.10, 0.20]);
      const Veq = equivalenceVolume({ Ca, Va, Cb });
      const Vmax = Veq * 2;
      const curve = [];
      for (let i = 0; i <= 120; i++) {
        const Vb = (Vmax * i) / 120;
        curve.push({ x: rN(Vb, 3), y: rN(clamp(titrationPH({ Ca, Va, Cb, Vb }), 0, 14), 3) });
      }
      // Per-scenario bands: Veq spans 5 to 200 mL, so one module const cannot serve both
      // ends. titrBands reproduces the shipped max(0.5, 2 percent) pass condition exactly.
      this.ti = { sc, Ca, Va, Cb, Veq, Vmax, curve, bands: titrBands(Veq) };
      this.tiVb = 0; this.tiInd = null;
      this.tiChecked = false; this.tiAttempted = false; this.tiDone = false; this.tiVerdict = null;
      this.updateTitrChart();
    },
    get tiCurrentPH() { return clamp(titrationPH({ Ca: this.ti.Ca, Va: this.ti.Va, Cb: this.ti.Cb, Vb: this.tiVb }), 0, 14); },
    get tiCorrectInd() { return (INDICATORS.find(i => 7 >= i.lo && 7 <= i.hi) || {}).name; },
    get tiIndOk() { return this.tiInd === this.tiCorrectInd; },
    tiPickInd(v) { if (!this.tiDone) { this.tiInd = v; this.tiChecked = false; } },
    tiIndState(v) {
      if (!this.tiChecked) return this.tiInd === v ? 'on' : '';
      if (v === this.tiCorrectInd) return 'correct';
      if (v === this.tiInd) return 'wrong';
      return '';
    },
    get tiExplain() {
      const t = this.ti;
      const ind = INDICATORS.find(i => i.name === this.tiCorrectInd);
      return `Moles of acid are ${(t.Ca * t.Va / 1000).toFixed(4)}, so equivalence needs the same moles of base: ` +
        `Veq = Ca x Va / Cb = (${t.Ca.toFixed(2)} M)(${t.Va} mL) / ${t.Cb.toFixed(2)} M = ${t.Veq.toFixed(1)} mL. ` +
        `A strong acid against a strong base is neutral at equivalence, so the indicator has to change colour around pH 7, ` +
        `which is ${ind.name} (${ind.lo} to ${ind.hi}).`;
    },
    tiCheck() {
      if (this.tiDone || !this.tiInd) return;
      const sc = this.ti.sc;
      const indOk = this.tiIndOk;
      const indNote = indOk ? '' : ` The indicator is also wrong: ${this.tiInd} changes colour outside pH 7.`;
      const r = this.doseVerdict(sc, this.tiVb, this.ti.Veq, this.ti.bands, 'mL', this.tiExplain + indNote, 1);
      let v = r.v, ok = r.good && indOk, dir = r.dir;
      if (r.good && !indOk) {
        v = { tone: 'fail', icon: '\u{1F6A8}', state: 'INDICATOR WRONG', headline: 'Volume right, indicator wrong',
          detail: `${this.tiExplain}${indNote} ${sc.indWrong}`, gauge: 'on' };
        dir = 'ind';
      }
      const d = sc.delta;
      this.gRecord('h1', ok, !this.tiAttempted);
      this.commitWorld(sc, ok, `${sc.system}, ${ok ? 'endpoint confirmed' : (dir === 'ind' ? 'indicator called wrong' : 'endpoint missed')}`,
        ok ? d.ok : (dir === 'high' ? d.high : d.low));
      this.tiAttempted = true; this.tiChecked = true; this.tiVerdict = v;
      if (ok) this.tiDone = true;
      this.$nextTick(() => { this.updateTitrChart(); this.reapplySelects(); });
    },
    tiNext() { this.genTitration(); },
    buildTitrChart() {
      if (typeof Chart === 'undefined' || !this.$refs.titrCanvas || titrChart) { this.updateTitrChart(); return; }
      titrChart = lineChart(this.$refs.titrCanvas, {
        datasets: [
          { label: 'titration curve', data: [], borderColor: '#2a7d8a', backgroundColor: '#2a7d8a', borderWidth: 2, pointRadius: 0, tension: 0.1 },
          { label: 'equivalence volume', data: [], borderColor: '#9c5a87', borderWidth: 1.5, borderDash: [6, 4], pointRadius: 0 },
          { label: 'meter reading', data: [], showLine: false, borderColor: '#1c2a31', backgroundColor: '#c0772f', pointRadius: 6, pointHoverRadius: 7 }
        ], xTitle: 'Volume of base added (mL)', yTitle: 'pH'
      });
      this.updateTitrChart();
    },
    updateTitrChart() {
      if (!titrChart || !this.ti) return;
      titrChart.data.datasets[0].data = this.ti.curve;
      // The dashed equivalence line IS the graded answer drawn on the chart, so it is
      // revealed with the verdict and never before it (trap 33). The curve and the meter
      // point stay: reading the curve is the skill this stage is named for.
      titrChart.data.datasets[1].data = this.tiChecked ? [{ x: this.ti.Veq, y: 0 }, { x: this.ti.Veq, y: 14 }] : [];
      titrChart.data.datasets[2].data = [{ x: this.tiVb, y: this.tiCurrentPH }];
      titrChart.update();
    },
    updateTitrPoint() {
      if (!titrChart) return;
      titrChart.data.datasets[2].data = [{ x: this.tiVb, y: this.tiCurrentPH }];
      titrChart.update();
    },
    resizeTitr() { if (titrChart) titrChart.resize(); },

    // ===================== C.12(E) pH from [H+] =====================
    genMeter() {
      const sc = this.nextScenario('e');
      const kind = pick(sc.constraints.kinds);
      // The mantissa pool no longer holds 4: reading 5 x 10^-p as 4 x 10^-p (or the
      // reverse) is only 0.0969 pH out and was accepted by the plus-or-minus-0.10 window.
      // With [1, 2, 3, 5, 8] the smallest adjacent gap is 0.1761. See METER_BANDS.
      const mant = sc.constraints.mantissas || METER_MANTISSAS;
      const m = pick(mant);
      const [plo, phi] = sc.constraints.p;
      const p = plo + ((Math.random() * (phi - plo + 1)) | 0);           // [ion] = m x 10^-p
      const conc = m * Math.pow(10, -p);
      const truePH = kind === 'H' ? pH(conc) : pHfromPOH(pOH(conc));
      const cls = Math.abs(truePH - 7) < 0.05 ? 'neutral' : truePH < 7 ? 'acid' : 'base';
      this.me = { sc, kind, m, p, conc, truePH, cls, bands: METER_BANDS };
      this.meGuess = 7; this.meClass = null;
      this.meChecked = false; this.meAttempted = false; this.meDone = false; this.meVerdict = null;
    },
    meConcTeX() {
      const ion = this.me.kind === 'H' ? '[\\text{H}^+]' : '[\\text{OH}^-]';
      const mant = this.me.m === 1 ? '1.0' : this.me.m.toFixed(1);
      return `${ion} = ${mant}\\times 10^{-${this.me.p}}\\ \\text{M}`;
    },
    get meClassOk() { return this.meClass === this.me.cls; },
    mePickClass(v) { if (!this.meDone) { this.meClass = v; this.meChecked = false; } },
    meClassState(v) {
      if (!this.meChecked) return this.meClass === v ? 'on' : '';
      if (v === this.me.cls) return 'correct';
      if (v === this.meClass) return 'wrong';
      return '';
    },
    phColor(p) { return phColor(p); },
    get meExplain() {
      const m = this.me;
      const clsWord = m.cls === 'acid' ? 'acidic' : m.cls === 'base' ? 'basic' : 'neutral';
      if (m.kind === 'H') {
        return `pH = -log[H+] = -log(${m.m} x 10^-${m.p}) = ${m.truePH.toFixed(2)}, which is ${clsWord}. ` +
          `Each whole step on the scale is a tenfold change in [H+].`;
      }
      return `This is a hydroxide reading, so it needs the water relationship. At 25 C, Kw = 1.0 x 10^-14, so pH + pOH = 14: ` +
        `pOH = -log[OH-] = ${pOH(m.conc).toFixed(2)}, and pH = 14 - pOH = ${m.truePH.toFixed(2)}, which is ${clsWord}.`;
    },
    meCheck() {
      if (this.meDone || !this.meClass) return;
      const sc = this.me.sc;
      const classOk = this.meClassOk;
      const clsNote = classOk ? '' : ` The classification is also wrong: at pH ${this.me.truePH.toFixed(2)} the sample is ${this.me.cls === 'acid' ? 'acidic' : this.me.cls === 'base' ? 'basic' : 'neutral'}.`;
      const r = this.doseVerdict(sc, this.meGuess, this.me.truePH, this.me.bands, 'pH', this.meExplain + clsNote, 2);
      let v = r.v, ok = r.good && classOk, dir = r.dir;
      if (r.good && !classOk) {
        v = { tone: 'fail', icon: '\u{1F6A8}', state: 'CLASS CALLED WRONG', headline: 'Reading right, class wrong',
          detail: `${this.meExplain}${clsNote} ${sc.classWrong}`, gauge: 'on' };
        dir = 'class';
      }
      const d = sc.delta;
      this.gRecord('e', ok, !this.meAttempted);
      this.commitWorld(sc, ok, `${sc.system}, ${ok ? 'pH posted' : (dir === 'class' ? 'class called wrong' : 'pH misread')}`,
        ok ? d.ok : (dir === 'high' ? d.high : d.low));
      this.meAttempted = true; this.meChecked = true; this.meVerdict = v;
      if (ok) this.meDone = true;
    },
    meNext() { this.genMeter(); },

    // ===================== Honors h2: weak-acid Ka -> pH =====================
    get h2Unlocked() { return this.gMastered('e'); },
    genWeak() {
      const sc = scOf('h2-weak');
      const acid = pick(WEAK_ACIDS);
      // The polyprotic pair does not draw 0.010 M: that is the one case where the
      // -log(Ka) misread clears the plus-or-minus-0.10 window by only 0.020 pH. See the
      // WEAK_ACIDS comment in model.js for the sweep.
      const concs = acid.poly ? WEAK_CONCS.filter(c => c > 0.010) : WEAK_CONCS;
      const C = pick(concs);
      this.wa = { sc, acid, C, truePH: phWeakAcid(acid.Ka, C), bands: WEAK_BANDS };
      this.waGuess = 7;
      this.waChecked = false; this.waAttempted = false; this.waDone = false; this.waVerdict = null;
    },
    waKaTeX() {
      const ka = this.wa.acid.Ka;
      const exp = Math.floor(Math.log10(ka));
      const mant = (ka / 10 ** exp).toFixed(1);
      return `K_a = ${mant}\\times 10^{${exp}}`;
    },
    get waExplain() {
      const w = this.wa;
      const h = Math.pow(10, -w.truePH);
      return `Solving Ka = x^2 / (C - x) exactly, with C = ${w.C.toFixed(3)} M, gives x = [H+] = ${h.toExponential(2)} M, so pH = ${w.truePH.toFixed(2)}. ` +
        `Note what it is not: -log(Ka) is ${(-Math.log10(w.acid.Ka)).toFixed(2)} and -log(C) is ${(-Math.log10(w.C)).toFixed(2)}, and neither is the answer.`;
    },
    waCheck() {
      if (this.waDone) return;
      const sc = this.wa.sc;
      const r = this.doseVerdict(sc, this.waGuess, this.wa.truePH, this.wa.bands, 'pH', this.waExplain, 2);
      const d = sc.delta;
      this.gRecord('h2', r.good, !this.waAttempted);
      this.commitWorld(sc, r.good, `${sc.system}, ${r.good ? 'pH called' : 'pH missed'}`,
        r.good ? d.ok : (r.dir === 'high' ? d.high : d.low));
      this.waAttempted = true; this.waChecked = true; this.waVerdict = r.v;
      if (r.good) this.waDone = true;
    },
    waNext() { this.genWeak(); },

    // ===================== Capstone: identify + neutralize an unknown =====================
    // Mechanics unchanged: name it, class it, predict the salt, neutralize it. What is new
    // is the brief on the front and one verdict on the back. It reads nothing off the
    // world-state, so there is no staleness re-draw to do here (trap 34 is dormant).
    get capUnlocked() { return this.gOverall() === 1; },
    genCapstone() {
      const f = pick(['HCl', 'HBr', 'HNO3', 'HClO4']);
      const acid = ACID_NAMES.find(a => a.f === f);
      const neut = NEUT_ACIDS.find(a => a.f === f);
      const base = pick(NEUT_BASES);
      const g = gcd(base.charge, neut.charge);
      const catSub = neut.charge / g, anionSub = base.charge / g;
      const L = lcm(neut.protons, base.hydroxides);
      const coefAcid = L / neut.protons, coefBase = L / base.hydroxides;
      const molAcid = rN(0.2 + Math.random() * 0.6, 2);
      const neutralBase = rN(moleRatio({ c: coefAcid }, { c: coefBase }, molAcid), 4);
      this.cap = { sc: scOf('cap-last'), acid, neut, base, molAcid, V: 1.0, catSub, anionSub, coefAcid, coefBase, neutralBase, bands: NEUT_BANDS };
      this.capNaSel = { prefix: '', root: '', suffix: '' };
      this.capClass = null; this.capCat = 1; this.capAn = 1; this.capBaseInput = '';
      this.capChecked = false; this.capAttempted = false; this.capWin = false; this.capVerdict = null;
      this.$nextTick(() => this.reapplySelects());
    },
    capPreview(sel) {
      if (!(sel.prefix && sel.root && sel.suffix)) return '...';
      return this.joinAcid(sel.prefix, sel.root, sel.suffix);
    },
    get capNameOk() {
      const s = this.capNaSel, a = this.cap.acid;
      return s.prefix === a.prefix && s.root === a.root && s.suffix === a.suffix;
    },
    capPickClass(v) { if (!this.capWin) { this.capClass = v; this.capChecked = false; } },
    capClassState(v) {
      if (!this.capChecked) return this.capClass === v ? 'on' : '';
      if (v === 'strong') return 'correct';
      if (v === this.capClass) return 'wrong';
      return '';
    },
    capCatStep(d) { if (!this.capWin) { this.capCat = clamp(this.capCat + d, 1, 6); this.capChecked = false; } },
    capAnStep(d) { if (!this.capWin) { this.capAn = clamp(this.capAn + d, 1, 6); this.capChecked = false; } },
    get capStudentSalt() { return buildSalt(this.cap.base.cation, this.capCat, this.cap.neut.anion, this.cap.neut.poly, this.capAn); },
    get capCorrectSalt() { return buildSalt(this.cap.base.cation, this.cap.catSub, this.cap.neut.anion, this.cap.neut.poly, this.cap.anionSub); },
    get capSaltOk() { return this.capCat === this.cap.catSub && this.capAn === this.cap.anionSub; },
    get capBaseVal() { return parseFloat(this.capBaseInput); },
    get capBaseOk() {
      if (!isFinite(this.capBaseVal)) return false;
      return outcomeBand(this.capBaseVal, this.cap.neutralBase, this.cap.bands).withinSpec;
    },
    get capReady() {
      const s = this.capNaSel;
      return !!(s.prefix && s.root && s.suffix) && !!this.capClass && this.capBaseInput !== '';
    },
    capCertify() {
      if (this.capWin || !this.capReady) return;
      const sc = this.cap.sc;
      const nameOk = this.capNameOk, classOk = this.capClass === 'strong';
      const saltOk = this.capSaltOk, baseOk = this.capBaseOk;
      const ok = nameOk && classOk && saltOk && baseOk;
      const step = !nameOk ? `Step 1 is out: ${this.cap.acid.f} is ${this.cap.acid.name}, not ${this.capPreview(this.capNaSel)}.`
        : (!classOk ? 'Step 1 holds. Step 2 is out: this one ionizes completely in water, so it is strong.'
          : (!saltOk ? `Steps 1 and 2 hold. Step 3 is out: criss-crossing the charges gives ${this.capCorrectSalt}, not ${this.capStudentSalt}.`
            : `Steps 1 to 3 hold. Step 4 is out: neutral takes ${this.cap.neutralBase.toFixed(3)} mol of ${this.cap.base.f}, and you called ${this.capBaseVal.toFixed(3)} mol.`));
      const detail = ok
        ? `${this.cap.acid.f} is ${this.cap.acid.name}, a strong acid; with ${this.cap.base.f} it gives ${this.capCorrectSalt} plus water, ` +
          `and ${this.cap.molAcid.toFixed(2)} mol of it takes ${this.cap.neutralBase.toFixed(3)} mol of base to reach pH 7.`
        : step;
      const v = this.decisionVerdict(sc, ok, 'HANDOVER REJECTED',
        ok ? 'The beaker stands up' : 'The beaker does not stand up', detail, ok ? sc.right : sc.wrong);
      this.gRecord('cap', ok, !this.capAttempted);
      this.commitWorld(sc, ok, `${sc.system}, ${ok ? 'handed over clean' : 'handover rejected'}`, ok ? sc.delta.ok : sc.delta.wrong);
      this.capAttempted = true; this.capChecked = true; this.capVerdict = v;
      if (ok) this.capWin = true;
    }
  };
}
