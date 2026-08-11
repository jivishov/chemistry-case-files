// main.js: Unit 8 view-model (Solutions & Solubility, TEKS C.11). Wires the model +
// engine + shared game framework to the UI. You are the bench chemist at a small town's
// water plant, on day three of a do-not-drink notice. Every stage's core interaction IS
// the chemistry (classify by polarity, read a real solubility curve, apply solubility
// rules to each product, fill a flask to a target molarity, draw stock for a dilution),
// not multiple choice with a meter glued on. The Scenario layer sits around those tools
// unchanged: a brief before the call, a banded verdict after it, and a world-state that
// is the chemistry itself, the manganese left in the finished water.
import {
  SE, POLARITY_POOL, KIND_LABEL, TYPES_POOL, SOLUBILITY_CURVES, CURVE_TEMPS,
  RATE_FACTORS, CORE_CATIONS, CORE_ANIONS, MOLARITY_SOLUTES, DILUTION_STOCKS, KSP_SALTS,
  SCENARIOS, CURVE_MIN_SEP, CURVE_BANDS, MOLARITY_BANDS, DILUTION_BANDS, CRYS_BANDS
} from './model.js';
import {
  molarMass, percentError, predictSolubility, ionicFormula, doubleReplacement,
  IONS, SOLUBILITY_RULES, fmt
} from '../../../shared/js/chem.js';
import { lineChart } from '../../../shared/js/render.js';
import { createGame, outcomeBand } from '../../../shared/js/game.js';

// Chart.js instance lives at module scope, never inside Alpine's reactive proxy.
let curveChart = null;

const pick = a => a[(Math.random() * a.length) | 0];
const shuffle = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
// Pick from a list while avoiding the recently used items (so a run is not rote).
const pickNot = (a, recent, keyFn = x => x) => {
  const fresh = a.filter(x => !recent.includes(keyFn(x)));
  return pick(fresh.length ? fresh : a);
};
const rN = (x, n) => { const p = 10 ** n; return Math.round(x * p) / p; };
const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));

// Superscript helpers for the Honors Ksp readouts (1 × 10⁻⁴ style).
const SUP = { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
const sup = s => String(s).split('').map(c => SUP[c] || c).join('');
const sci = x => {
  if (x === 0) return '0';
  const e = Math.round(Math.log10(x));
  const m = x / 10 ** e;
  const mant = Math.abs(m - 1) < 1e-9 ? '1' : String(rN(m, 2));
  return `${mant} × 10${sup(e)}`;
};

const curveOf = key => SOLUBILITY_CURVES.find(c => c.key === key);
// Solubility (g/100 g water) of a curve solute at a grid temperature.
const solubilityAt = (key, t) => curveOf(key).pts[CURVE_TEMPS.indexOf(t)];
// A (solute, temperature) cell is drawable only if no OTHER curve reads within
// CURVE_MIN_SEP grams of it there. Without this rule 12 of the 54 interior cells accept
// a value read off the wrong curve, and four of those are exact crossings that no
// tolerance can separate. See the CURVE_BANDS comment in model.js for the measurement.
const curveCellOk = (key, t) => {
  const s = solubilityAt(key, t);
  return !SOLUBILITY_CURVES.some(o => o.key !== key && Math.abs(solubilityAt(o.key, t) - s) <= CURVE_MIN_SEP);
};

const scOf = id => SCENARIOS.find(s => s.id === id);

// ---- world-state constants: the clearwell, the secondary standard, the shift clock ----
const MN_START = 0.42;     // mg/L of manganese in the finished water on day three
const MN_LIMIT = 0.05;     // mg/L, the secondary standard the notice is measured against
const MN_MAX = 0.50;       // mg/L, the far end of the meter (0 percent full)
const DAY_START = 3;       // the notice went up on Monday; this is day three
const JOBS_PER_DAY = 4;    // bench jobs in a shift, so the log stamps a believable date

const skills = [
  { id: 'a',  code: 'C.11(A)',  label: 'Water polarity',     target: 3 },
  { id: 'b',  code: 'C.11(B)',  label: 'Solution types',     target: 3 },
  { id: 'c',  code: 'C.11(C)',  label: 'Solubility curves',  target: 3 },
  { id: 'd',  code: 'C.11(D)',  label: 'Precipitation',      target: 3 },
  { id: 'e',  code: 'C.11(E)',  label: 'Molarity',           target: 3 },
  { id: 'f',  code: 'C.11(F)',  label: 'Dilution',           target: 3 },
  { id: 'h1', code: 'Honors',   label: 'Ksp / common ion',   target: 2, honors: true },
  { id: 'h2', code: 'Honors',   label: 'Crystallization',    target: 2, honors: true },
  { id: 'cap', code: 'Capstone', label: 'Batch run',         target: 1, honors: true }
];

export { SE };

export function createSim() {
  return {
    ...createGame({ unitId: '08-solutions', skills }),
    SE, fmt, SOLUBILITY_RULES,
    honors: false,
    mode: 'dissolve',

    // ---- world-state: the finished water, and the shift log (session-local) ----
    // The driving state IS the chemistry: manganese in the clearwell, in mg/L, against a
    // 0.05 mg/L secondary standard. The old `batches` counter was deleted rather than
    // renamed, because a number that only goes up is a score, not a world.
    mn: MN_START,
    jobs: 0,
    worldLog: [],
    _wid: 0,
    scIdx: { a: -1, b: -1, c: -1, d: -1, e: -1, f: -1 },

    // ---- stage state (all generated in init so x-show subtrees never hit a null) ----
    dp: null, dpKind: null, dpDis: null, dpChecked: false, dpAttempted: false, dpDone: false, dpVerdict: null, recentA: [],
    tp: null, tpClass: null, tpElec: null, tpChecked: false, tpAttempted: false, tpDone: false, tpVerdict: null,
    cu: null, cuInput: '', cuRate: null, cuChecked: false, cuAttempted: false, cuDone: false, cuVerdict: null,
    pr: null, prCls: [null, null], prChecked: false, prAttempted: false, prDone: false, prVerdict: null,
    mo: null, moGrams: '', moVol: 250, moChecked: false, moAttempted: false, moDone: false, moVerdict: null,
    di: null, diVstock: 50, diChecked: false, diAttempted: false, diDone: false, diVerdict: null,
    ks: null, ksPick: null, ksChecked: false, ksAttempted: false, ksDone: false, ksVerdict: null,
    cr: null, crInput: '', crChecked: false, crAttempted: false, crDone: false, crVerdict: null,
    cap: null, capKind: null, capElec: null, capGrams: '', capVol: 250, capCls: [null, null],
    capChecked: false, capAttempted: false, capWin: false, capVerdict: null,

    init() {
      this.gLoad();
      this.genDissolve();
      this.genTypes();
      this.genCurve();
      this.genPrecip();
      this.genMolarity();
      this.genDilute();
      this.genKsp();
      this.genCrys();
      this.$nextTick(() => this.buildCurveChart());
      this.$watch('mode', m => { if (m === 'curve') this.$nextTick(() => { this.buildCurveChart(); this.resizeCurveChart(); this.updateCurveChart(); }); });
      this.$watch('honors', () => this.$nextTick(() => this.resizeCurveChart()));
    },

    // The Begin batch run button stays, but the tab now generates too, matching U9 and
    // the rest of the units built to this pattern. The capstone reads nothing off the
    // world-state, so there is no staleness re-draw to do here (trap 34 is dormant).
    setMode(m) {
      this.mode = m;
      if (m === 'capstone' && this.capUnlocked && !this.cap) this.genCapstone();
    },

    resetProgress() {
      this.gReset();
      this.mn = MN_START; this.jobs = 0; this.worldLog = [];
      this.scIdx = { a: -1, b: -1, c: -1, d: -1, e: -1, f: -1 };
      this.genDissolve(); this.genTypes(); this.genCurve(); this.genPrecip();
      this.genMolarity(); this.genDilute(); this.genKsp(); this.genCrys();
      this.cap = null; this.capWin = false; this.capVerdict = null;
      this.$nextTick(() => this.updateCurveChart());
    },

    // ---- scenario plumbing ----
    nextScenario(skill) {
      const list = SCENARIOS.filter(s => s.skill === skill);
      const i = (this.scIdx[skill] = (this.scIdx[skill] ?? -1) + 1) % list.length;
      return list[i];
    },
    // Move the clearwell and prepend a log line. Correct work pulls the manganese down;
    // a miss pushes it back up. U10's `delta` shape, with a day stamp instead of a clock
    // because a treatment notice is measured in days, not minutes.
    recordWorld({ icon, tone, text, delta = 0 }) {
      this.jobs += 1;
      this.mn = rN(Math.max(0, Math.min(MN_MAX, this.mn + delta)), 3);
      this.worldLog.unshift({ id: ++this._wid, icon, tone, text: `${this.dayLabel}: ${text}` });
      if (this.worldLog.length > 6) this.worldLog.pop();
    },
    get dayLabel() { return `Day ${DAY_START + Math.floor(this.jobs / JOBS_PER_DAY)}`; },
    // Two fixed decimals, NOT fmt(): fmt takes significant figures, so it prints 0.42 and
    // 0.44 but bare "0.4" and "0.5", and a headline number that changes width as it moves
    // reads as a different measurement rather than the same one moving.
    get mnLabel() { return this.mn.toFixed(2); },
    // Inverted meter: 100 percent at 0.00 mg/L, 0 percent at MN_MAX.
    get mnPct() { return Math.max(0, Math.min(100, (MN_MAX - this.mn) / MN_MAX * 100)); },
    get mnMood() { return this.mn <= MN_LIMIT ? '\u{1F642}' : this.mn < 0.45 ? '\u{1F630}' : '\u{1F635}'; },
    get mnState() {
      if (this.mn <= MN_LIMIT) return 'Under the limit, the notice lifts tomorrow';
      if (this.mn < 0.45) return 'Still over, the notice holds';
      return 'Over far enough that the state calls';
    },
    get mnColor() { return this.mn <= MN_LIMIT ? 'var(--success)' : this.mn < 0.45 ? 'var(--warn)' : 'var(--danger)'; },
    get mnLimit() { return MN_LIMIT; },

    // Shared verdict builders. A dose stage grades a committed number with outcomeBand;
    // a decision stage grades a pick. Both return the same {tone, icon, state, headline,
    // detail, gauge} shape the markup renders.
    doseVerdict(sc, val, target, bands, unit, detail) {
      if (!isFinite(val)) {
        return { v: { tone: 'fail', icon: '\u{26A0}\u{FE0F}', state: 'NO NUMBER', headline: 'Nothing to act on', detail: sc.fail, gauge: null }, good: false, dir: 'fail' };
      }
      const band = outcomeBand(val, target, bands);
      const good = band.withinSpec;
      const yours = `${fmt(val, 4)} ${unit}`;
      const needTxt = `${fmt(target, 4)} ${unit}`;
      if (good) {
        return { v: { tone: 'success', icon: sc.icon, state: sc.safeState, headline: 'On spec',
          detail: `You called ${yours}; the bench needs ${needTxt}. ${detail} ${sc.safe}`, gauge: 'on' }, good: true, dir: 'ok' };
      }
      const off = `${fmt(Math.abs(val - target), 3)} ${unit}`;
      const low = band.direction === 'low';
      return { v: { tone: 'fail', icon: '\u{1F6A8}', state: low ? sc.lowState : sc.highState,
        headline: low ? 'Called it low' : 'Called it high',
        detail: `You called ${yours}, ${off} ${low ? 'under' : 'over'} the ${needTxt} the bench needs. ${detail} ${low ? sc.low : sc.high}`,
        gauge: low ? 'low' : 'high' }, good: false, dir: low ? 'low' : 'high' };
    },
    decisionVerdict(sc, good, state, headline, detail, consequence) {
      return good
        ? { tone: 'success', icon: sc.icon, state: 'CALLED IT', headline, detail: `${detail} ${consequence}`, gauge: null }
        : { tone: 'fail', icon: '\u{1F6A8}', state, headline, detail: `${detail} ${consequence}`, gauge: null };
    },

    seCaption(se) {
      if (this.gMastered(se.id)) return 'Mastered';
      const sk = this.g_skills[se.id];
      const def = this.g_skillDefs.find(d => d.id === se.id) || {};
      return `${sk ? sk.run : 0} of ${def.target || 3} correct in a row`;
    },

    // ===================== C.11(A) why it dissolves =====================
    genDissolve() {
      const sc = this.nextScenario('a');
      const pool = POLARITY_POOL.filter(x => sc.constraints.names.includes(x.name));
      if (!pool.length) throw new Error(`genDissolve: ${sc.id} pins no POLARITY_POOL name that exists`);
      const item = pickNot(pool, this.recentA, x => x.name);
      this.recentA = [...this.recentA, item.name].slice(-5);
      this.dp = { ...item, sc };
      this.dpKind = null; this.dpDis = null;
      this.dpChecked = false; this.dpAttempted = false; this.dpDone = false; this.dpVerdict = null;
    },
    dpKindState(k) {
      if (!this.dpChecked) return this.dpKind === k ? 'on' : '';
      if (k === this.dp.kind) return 'correct';
      if (k === this.dpKind) return 'wrong';
      return '';
    },
    dpDisState(v) {
      if (!this.dpChecked) return this.dpDis === v ? 'on' : '';
      if (v === this.dp.dissolves) return 'correct';
      if (v === this.dpDis) return 'wrong';
      return '';
    },
    dpPickKind(k) { if (!this.dpDone) { this.dpKind = k; this.dpChecked = false; } },
    dpPickDis(v) { if (!this.dpDone) { this.dpDis = v; this.dpChecked = false; } },
    dpCertify() {
      if (this.dpDone || this.dpKind === null || this.dpDis === null) return;
      const sc = this.dp.sc;
      const kindOk = this.dpKind === this.dp.kind;
      const ok = kindOk && this.dpDis === this.dp.dissolves;
      // The consequence belongs to whichever half of the call went wrong: the bonding
      // call is a paperwork problem, the solubility call is what reaches the basin.
      const consequence = ok ? sc.right : (kindOk ? sc.wrongDis : sc.wrongKind);
      const v = this.decisionVerdict(sc, ok, kindOk ? 'WRONG ON SOLUBILITY' : 'WRONG ON BONDING',
        ok ? `${this.dp.name}: called right` : `${this.dp.name}: ${KIND_LABEL[this.dp.kind].toLowerCase()}, ${this.dp.dissolves ? 'dissolves' : 'does not dissolve'}`,
        this.dpExplain, consequence);
      this.gRecord('a', ok, !this.dpAttempted);
      this.recordWorld({ icon: v.icon, tone: v.tone, text: `${sc.system}, ${ok ? 'sample logged' : 'sample mislogged'}`, delta: ok ? sc.delta.ok : sc.delta.wrong });
      this.dpAttempted = true; this.dpChecked = true; this.dpVerdict = v;
      if (ok) this.dpDone = true;
    },
    get dpExplain() {
      const d = this.dp;
      const why = d.kind === 'nonpolar'
        ? `${KIND_LABEL[d.kind].toLowerCase()} solutes are not pulled apart by polar water, so it does not dissolve appreciably ("like dissolves like").`
        : `water is polar, so it surrounds and separates ${d.kind === 'ionic' ? 'the ions' : 'the polar molecules'}, and it dissolves ("like dissolves like").`;
      return `${d.name} is ${KIND_LABEL[d.kind].toLowerCase()}; ${why}`;
    },
    dpNext() { this.genDissolve(); },

    // ===================== C.11(B) solution types =====================
    genTypes() {
      const sc = this.nextScenario('b');
      const pool = TYPES_POOL.filter(x => sc.constraints.names.includes(x.name));
      if (!pool.length) throw new Error(`genTypes: ${sc.id} pins no TYPES_POOL name that exists`);
      const item = pick(pool);
      const roll = Math.random();
      let amount, cls;
      if (roll < 0.4) { cls = 'unsaturated'; amount = rN(item.s * (0.4 + Math.random() * 0.4), 0); }
      else if (roll < 0.7) { cls = 'saturated'; amount = item.s; }
      else { cls = 'supersaturated'; amount = rN(item.s * (1.1 + Math.random() * 0.3), 0); }
      this.tp = { sc, item, amount, cls };
      this.tpClass = null; this.tpElec = null;
      this.tpChecked = false; this.tpAttempted = false; this.tpDone = false; this.tpVerdict = null;
    },
    tpClassState(c) {
      if (!this.tpChecked) return this.tpClass === c ? 'on' : '';
      if (c === this.tp.cls) return 'correct';
      if (c === this.tpClass) return 'wrong';
      return '';
    },
    tpElecState(v) {
      if (!this.tpChecked) return this.tpElec === v ? 'on' : '';
      if (v === this.tp.item.electrolyte) return 'correct';
      if (v === this.tpElec) return 'wrong';
      return '';
    },
    tpPickClass(c) { if (!this.tpDone) { this.tpClass = c; this.tpChecked = false; } },
    tpPickElec(v) { if (!this.tpDone) { this.tpElec = v; this.tpChecked = false; } },
    tpCertify() {
      if (this.tpDone || this.tpClass === null || this.tpElec === null) return;
      const sc = this.tp.sc;
      const classOk = this.tpClass === this.tp.cls;
      const ok = classOk && this.tpElec === this.tp.item.electrolyte;
      const consequence = ok ? sc.right : (classOk ? sc.wrongElec : sc.wrongClass);
      const v = this.decisionVerdict(sc, ok, classOk ? 'WRONG ON CONDUCTIVITY' : 'WRONG ON SATURATION',
        ok ? `${this.tp.item.name}: ${this.tp.cls}` : `It is ${this.tp.cls}, ${this.tp.item.electrolyte ? 'an electrolyte' : 'a nonelectrolyte'}`,
        this.tpExplain, consequence);
      this.gRecord('b', ok, !this.tpAttempted);
      this.recordWorld({ icon: v.icon, tone: v.tone, text: `${sc.system}, ${ok ? 'tank classified' : 'tank misread'}`, delta: ok ? sc.delta.ok : sc.delta.wrong });
      this.tpAttempted = true; this.tpChecked = true; this.tpVerdict = v;
      if (ok) this.tpDone = true;
    },
    get tpExplain() {
      const t = this.tp;
      const cmp = t.amount < t.item.s ? 'less than' : (t.amount > t.item.s ? 'more than' : 'equal to');
      return `${t.amount} g is ${cmp} the ${t.item.s} g that saturates 100 g of water at 20 °C, so the solution is ${t.cls}. ` +
        `${t.item.name} is ${t.item.electrolyte ? 'an electrolyte (it dissociates into ions that conduct)' : 'a nonelectrolyte (it dissolves as neutral molecules and does not conduct)'}.`;
    },
    tpNext() { this.genTypes(); },

    // ===================== C.11(C) solubility curve + rate =====================
    // Constrained draw, in the house idiom genPrecipPair already uses: a bounded rejection
    // loop over the scenario's cells with a guaranteed fallback, so the generator is total
    // and a caller can never crash. The rejection test is curveCellOk: no other curve may
    // read within CURVE_MIN_SEP grams at that temperature, which is what stops a value
    // read off the wrong curve from being accepted.
    genCurve() {
      const sc = this.nextScenario('c');
      const keys = sc.constraints.solutes, temps = sc.constraints.temps;
      let key = null, t = null;
      for (let i = 0; i < 200; i++) {
        const k = pick(keys), tt = pick(temps);
        if (curveCellOk(k, tt)) { key = k; t = tt; break; }
      }
      if (key === null) {
        // Fallback: the first separable cell anywhere in the scenario's ranges, then the
        // first separable cell in the whole grid. Measured for this gate: 38 of the 54
        // interior cells pass, and every scenario's own ranges hold several, so neither
        // fallback is reachable with the shipped data. They exist so a future pool edit
        // degrades instead of hanging.
        for (const k of keys) for (const tt of temps) if (key === null && curveCellOk(k, tt)) { key = k; t = tt; }
      }
      if (key === null) {
        for (const c of SOLUBILITY_CURVES) for (let i = 1; i <= 9; i++) if (key === null && curveCellOk(c.key, CURVE_TEMPS[i])) { key = c.key; t = CURVE_TEMPS[i]; }
      }
      const sAns = solubilityAt(key, t);
      const rf = pick(RATE_FACTORS);
      this.cu = { sc, key, name: curveOf(key).name, t, sAns, bands: CURVE_BANDS, rf };
      this.cuInput = ''; this.cuRate = null;
      this.cuChecked = false; this.cuAttempted = false; this.cuDone = false; this.cuVerdict = null;
      // buildCurveChart is idempotent (it returns early once curveChart exists), so it is
      // safe to re-run here. The canvas now lives inside the stage's <template x-if="cu">,
      // and this is what builds it if the subtree renders after init's $nextTick.
      this.$nextTick(() => { this.buildCurveChart(); this.updateCurveChart(); this.resizeCurveChart(); });
    },
    cuRateState(v) {
      if (!this.cuChecked) return this.cuRate === v ? 'on' : '';
      if (v === this.cu.rf.faster) return 'correct';
      if (v === this.cuRate) return 'wrong';
      return '';
    },
    cuPickRate(v) { if (!this.cuDone) { this.cuRate = v; this.cuChecked = false; } },
    cuCertify() {
      if (this.cuDone || this.cuInput === '' || this.cuRate === null) return;
      const sc = this.cu.sc;
      const rateOk = this.cuRate === this.cu.rf.faster;
      const rateNote = rateOk ? '' : ` The rate call is also wrong: ${this.cu.rf.change.toLowerCase()} makes dissolving ${this.cu.rf.faster ? 'faster' : 'slower'}.`;
      const r = this.doseVerdict(sc, parseFloat(this.cuInput), this.cu.sAns, this.cu.bands,
        'g per 100 g water', this.cuExplain + rateNote);
      let v = r.v, ok = r.good && rateOk, dir = r.dir;
      // A right number with a wrong rate call is its own outcome, and it needs its own
      // consequence text: falling through to sc.low would print "you read it low" over a
      // value that was exactly on the curve, which is the contradiction trap 30 is about.
      // The gauge deliberately still reads `on`, because the gauge describes the number.
      if (r.good && !rateOk) {
        v = { tone: 'fail', icon: '\u{1F6A8}', state: 'RATE CALLED WRONG', headline: 'Reading right, rate wrong',
          detail: `${this.cuExplain}${rateNote} ${sc.rateWrong}`, gauge: 'on' };
        dir = 'rate';
      }
      const d = sc.delta;
      this.gRecord('c', ok, !this.cuAttempted);
      this.recordWorld({ icon: v.icon, tone: v.tone, text: `${sc.system}, ${ok ? 'curve read' : (dir === 'rate' ? 'rate called wrong' : 'curve misread')}`, delta: ok ? d.ok : (dir === 'high' ? d.high : d.low) });
      this.cuAttempted = true; this.cuChecked = true; this.cuVerdict = v;
      if (ok) this.cuDone = true;
    },
    get cuExplain() {
      return `At ${this.cu.t} °C the curve for ${this.cu.name} reads about ${this.cu.sAns} g per 100 g water. ` +
        `${this.cu.rf.change.toLowerCase()} makes dissolving ${this.cu.rf.faster ? 'faster' : 'slower'}: ${this.cu.rf.why}`;
    },
    cuNext() { this.genCurve(); },

    // ===================== C.11(D) precipitation predictor =====================
    // Generate two soluble reactants whose swap matches the wanted precipitate outcome.
    genPrecipPair(wantPrecip, cations = CORE_CATIONS, anions = CORE_ANIONS) {
      for (let i = 0; i < 200; i++) {
        const a1 = pick(anions), a2 = pick(anions);
        const c1 = pick(cations), c2 = pick(cations);
        if (a1 === a2 || c1 === c2) continue;
        if (!predictSolubility(c1, a1).soluble || !predictSolubility(c2, a2).soluble) continue;
        const dr = doubleReplacement({ cation: c1, anion: a1 }, { cation: c2, anion: a2 });
        if (dr.formsPrecipitate === wantPrecip) {
          return { c1, a1, c2, a2, dr };
        }
      }
      // Guaranteed fallback (the loop above effectively always succeeds with these
      // pools; this just makes the generator total so a caller can never crash).
      const fb = wantPrecip
        ? { c1: 'Ag', a1: 'NO3', c2: 'Na', a2: 'Cl' }   // -> AgCl precipitate
        : { c1: 'Na', a1: 'NO3', c2: 'K', a2: 'Cl' };    // -> all soluble
      return { ...fb, dr: doubleReplacement({ cation: fb.c1, anion: fb.a1 }, { cation: fb.c2, anion: fb.a2 }) };
    },
    genPrecip() {
      const sc = this.nextScenario('d');
      // The scenario asks for a precipitate; a third of the draws still come back clean,
      // because "nothing drops out" has to stay a live answer or the stage is a giveaway.
      const want = sc.constraints.wantPrecip ? Math.random() < 0.7 : Math.random() < 0.3;
      const p = this.genPrecipPair(want);
      const rA = { cation: p.c1, anion: p.a1, formula: ionicFormula(p.c1, p.a1) };
      const rB = { cation: p.c2, anion: p.a2, formula: ionicFormula(p.c2, p.a2) };
      this.pr = { sc, rA, rB, products: p.dr.products, precipitates: p.dr.precipitates, formsPrecipitate: p.dr.formsPrecipitate };
      this.prCls = [null, null];
      this.prChecked = false; this.prAttempted = false; this.prDone = false; this.prVerdict = null;
    },
    prSet(i, v) { if (!this.prDone) { this.prCls = this.prCls.map((x, j) => j === i ? v : x); this.prChecked = false; } },
    prState(i, v) {
      const want = this.pr.products[i].soluble ? 'aq' : 's';
      if (!this.prChecked) return this.prCls[i] === v ? 'on' : '';
      if (v === want) return 'correct';
      if (v === this.prCls[i]) return 'wrong';
      return '';
    },
    prCertify() {
      if (this.prDone || this.prCls.includes(null)) return;
      const sc = this.pr.sc;
      const ok = this.pr.products.every((p, i) => (this.prCls[i] === 's') === !p.soluble);
      // The two failure directions are materially different in a plant: a missed solid is
      // a solid nobody planned for; an imagined solid is a settling step with nothing in it.
      const missed = this.pr.products.some((p, i) => !p.soluble && this.prCls[i] === 'aq');
      const consequence = ok ? sc.right : (missed ? sc.wrongMiss : sc.wrongDrop);
      const v = this.decisionVerdict(sc, ok, missed ? 'MISSED A SOLID' : 'EXPECTED A SOLID',
        ok ? (this.pr.formsPrecipitate ? `${this.pr.precipitates.join(' and ')} drops out` : 'Both products stay in solution')
           : 'The solubility rules say otherwise',
        this.prExplain, consequence);
      this.gRecord('d', ok, !this.prAttempted);
      this.recordWorld({ icon: v.icon, tone: v.tone, text: `${sc.system}, ${ok ? 'products called' : 'products misread'}`, delta: ok ? sc.delta.ok : sc.delta.wrong });
      this.prAttempted = true; this.prChecked = true; this.prVerdict = v;
      if (ok) this.prDone = true;
    },
    get prExplain() {
      const parts = this.pr.products.map(p => `${p.formula} is ${p.soluble ? 'soluble (aq)' : 'insoluble, so it precipitates (s)'}`);
      const verdict = this.pr.formsPrecipitate
        ? `A precipitate forms: ${this.pr.precipitates.join(' and ')}.`
        : 'Both products are soluble, so no precipitate forms (no reaction).';
      return `${parts.join('; ')}. ${verdict}`;
    },
    prNext() { this.genPrecip(); },

    // ===================== C.11(E) molarity to spec =====================
    genMolarity() {
      const sc = this.nextScenario('e');
      const pool = MOLARITY_SOLUTES.filter(x => sc.constraints.solutes.includes(x.name));
      if (!pool.length) throw new Error(`genMolarity: ${sc.id} pins no MOLARITY_SOLUTES name that exists`);
      const s = pick(pool);
      const [lo, hi] = sc.constraints.targetM;
      const targetM = rN(lo + Math.random() * (hi - lo), 2);
      this.mo = { sc, s, M: molarMass(s.formula), targetM, bands: MOLARITY_BANDS };
      this.moGrams = ''; this.moVol = 250;
      this.moChecked = false; this.moAttempted = false; this.moDone = false; this.moVerdict = null;
    },
    get moMoles() { const g = parseFloat(this.moGrams); return isFinite(g) ? g / this.mo.M : 0; },
    get moConc() { return this.moMoles / (this.moVol / 1000); },
    get moErr() { return percentError(this.moConc, this.mo.targetM); },
    get moOnSpec() { return this.moGrams !== '' && this.moErr <= this.mo.bands.acceptable * 100; },
    get moFillPct() { return clamp(this.moVol / 500, 0, 1) * 100; },
    get moTintPct() { return clamp(this.moConc / 2, 0.05, 1) * 100; },
    moShip() {
      if (this.moDone || this.moGrams === '') return;
      const sc = this.mo.sc;
      // Grade the concentration the flask actually reads, not the grams, because the
      // learner controls both the mass and the volume and either can be the error.
      const r = this.doseVerdict(sc, this.moConc, this.mo.targetM, this.mo.bands, 'M', this.moExplain);
      const d = sc.delta;
      this.gRecord('e', r.good, !this.moAttempted);
      this.recordWorld({ icon: r.v.icon, tone: r.v.tone, text: `${sc.system}, ${r.good ? 'batch on spec' : 'batch off spec'}`, delta: r.good ? d.ok : (r.dir === 'high' ? d.high : d.low) });
      this.moAttempted = true; this.moChecked = true; this.moVerdict = r.v;
      if (r.good) this.moDone = true;
    },
    get moExplain() {
      const needMol = this.mo.targetM * (this.moVol / 1000);
      const needG = needMol * this.mo.M;
      // Molar mass at 4 sig figs, not fmt()'s default 3: it is a figure the page DERIVES
      // from the draw and shows before the commit, and rounding it coarser than the band
      // would grade a learner against a number they were never given (trap 38).
      return `M = moles / litres. For ${this.mo.targetM} M in ${this.moVol} mL you need ${fmt(needMol, 4)} mol, ` +
        `which is ${fmt(needG, 4)} g of ${this.mo.s.name} (molar mass ${fmt(this.mo.M, 4)} g/mol). Your mix reads ${fmt(this.moConc, 4)} M.`;
    },
    moNext() { this.genMolarity(); },

    // ===================== C.11(F) dilution =====================
    genDilute() {
      const sc = this.nextScenario('f');
      const pool = DILUTION_STOCKS.filter(x => sc.constraints.stocks.includes(x.name));
      if (!pool.length) throw new Error(`genDilute: ${sc.id} pins no DILUTION_STOCKS name that exists`);
      const stock = pick(pool);
      const v2 = pick(sc.constraints.v2);
      // Derive the target from an integer stock volume so the exact answer is always
      // reachable on the 1 mL slider (a tiny target chosen first can be unhittable).
      const idealV1 = 10 + ((Math.random() * (v2 * 0.5 - 10)) | 0);   // 10 .. ~half of v2
      const targetC2 = rN((stock.c1 * idealV1) / v2, 2);
      this.di = { sc, stock, c1: stock.c1, targetC2, v2, bands: DILUTION_BANDS, idealV1 };
      this.diVstock = Math.min(50, v2);
      this.diChecked = false; this.diAttempted = false; this.diDone = false; this.diVerdict = null;
    },
    get diWater() { return Math.max(0, this.di.v2 - this.diVstock); },
    get diConc() { return (this.di.c1 * this.diVstock) / this.di.v2; },
    get diErr() { return percentError(this.diConc, this.di.targetC2); },
    get diOnSpec() { return this.diErr <= this.di.bands.acceptable * 100; },
    get diStockPct() { return clamp(this.diVstock / this.di.v2, 0, 1) * 100; },
    diShip() {
      if (this.diDone) return;
      const sc = this.di.sc;
      const r = this.doseVerdict(sc, this.diConc, this.di.targetC2, this.di.bands, 'M', this.diExplain);
      const d = sc.delta;
      this.gRecord('f', r.good, !this.diAttempted);
      this.recordWorld({ icon: r.v.icon, tone: r.v.tone, text: `${sc.system}, ${r.good ? 'batch on spec' : 'batch off spec'}`, delta: r.good ? d.ok : (r.dir === 'high' ? d.high : d.low) });
      this.diAttempted = true; this.diChecked = true; this.diVerdict = r.v;
      if (r.good) this.diDone = true;
    },
    get diExplain() {
      return `C1V1 = C2V2, so V1 = C2V2 / C1 = (${this.di.targetC2} M)(${this.di.v2} mL) / ${this.di.c1} M = ${this.di.idealV1} mL of stock, ` +
        `topped up to ${this.di.v2} mL. Your pour reads ${fmt(this.diConc)} M.`;
    },
    diNext() { this.genDilute(); },

    // ===================== Honors: Ksp / common ion (h1) =====================
    get kspUnlocked() { return this.gMastered('d'); },
    genKsp() {
      const salt = pick(KSP_SALTS);
      const want = Math.random() < 0.5;             // want a precipitate?
      let a, b, Q;
      for (let i = 0; i < 80; i++) {
        a = 2 + ((Math.random() * 6) | 0);          // [cation] = 10^-a
        b = 2 + ((Math.random() * 6) | 0);          // [anion]  = 10^-b
        Q = 10 ** (-(a + b));
        const ratio = Q / salt.ksp;
        if (want && ratio > 10) break;
        if (!want && ratio < 0.1) break;
      }
      this.ks = { sc: scOf('h1-ksp'), salt, a, b, Q, forms: Q > salt.ksp };
      this.ksPick = null; this.ksChecked = false; this.ksAttempted = false; this.ksDone = false; this.ksVerdict = null;
    },
    ksConc(exp) { return sci(10 ** (-exp)); },
    ksQ() { return sci(this.ks.Q); },
    ksKsp() { return sci(this.ks.salt.ksp); },
    ksState(v) {
      if (!this.ksChecked) return this.ksPick === v ? 'on' : '';
      if (v === this.ks.forms) return 'correct';
      if (v === this.ksPick) return 'wrong';
      return '';
    },
    ksPickV(v) { if (!this.ksDone) { this.ksPick = v; this.ksChecked = false; } },
    ksCertify() {
      if (this.ksDone || this.ksPick === null) return;
      const sc = this.ks.sc;
      const ok = this.ksPick === this.ks.forms;
      const v = this.decisionVerdict(sc, ok, 'Q AGAINST Ksp',
        this.ks.forms ? 'Q is greater than Ksp: it precipitates' : 'Q is less than Ksp: it stays dissolved',
        this.ksExplain, ok ? sc.right : sc.wrong);
      this.gRecord('h1', ok, !this.ksAttempted);
      this.recordWorld({ icon: v.icon, tone: v.tone, text: `${sc.system}, ${ok ? 'Q called right' : 'Q called wrong'}`, delta: ok ? sc.delta.ok : sc.delta.wrong });
      this.ksAttempted = true; this.ksChecked = true; this.ksVerdict = v;
      if (ok) this.ksDone = true;
    },
    get ksExplain() {
      return `Q = [cation][anion] = ${this.ksQ()}, and Ksp = ${this.ksKsp()}. ` +
        `Q is ${this.ks.forms ? 'greater than' : 'less than'} Ksp, so the salt ${this.ks.forms ? 'precipitates' : 'stays dissolved'}. ` +
        `Adding a common ion raises Q, which is what tips a solution into precipitating.`;
    },
    ksNext() { this.genKsp(); },

    // ===================== Honors: crystallization (h2) =====================
    get crysUnlocked() { return this.gMastered('c'); },
    genCrys() {
      const c = pick(SOLUBILITY_CURVES.filter(x => x.key !== 'NaCl'));   // need a real T-dependence
      let i1, i2;
      do { i1 = 3 + ((Math.random() * 8) | 0); i2 = 1 + ((Math.random() * (i1)) | 0); } while (i1 - i2 < 3);
      const t1 = CURVE_TEMPS[Math.min(10, i1)], t2 = CURVE_TEMPS[i2];
      const water = pick([100, 150, 200]);
      const s1 = solubilityAt(c.key, t1), s2 = solubilityAt(c.key, t2);
      const ans = rN((s1 - s2) * water / 100, 1);
      this.cr = { sc: scOf('h2-crys'), c, t1, t2, water, s1, s2, ans, bands: CRYS_BANDS };
      this.crInput = ''; this.crChecked = false; this.crAttempted = false; this.crDone = false; this.crVerdict = null;
    },
    crCertify() {
      if (this.crDone || this.crInput === '') return;
      const sc = this.cr.sc;
      const r = this.doseVerdict(sc, parseFloat(this.crInput), this.cr.ans, this.cr.bands, 'g', this.crExplain);
      const d = sc.delta;
      this.gRecord('h2', r.good, !this.crAttempted);
      this.recordWorld({ icon: r.v.icon, tone: r.v.tone, text: `${sc.system}, ${r.good ? 'yield called' : 'yield missed'}`, delta: r.good ? d.ok : (r.dir === 'high' ? d.high : d.low) });
      this.crAttempted = true; this.crChecked = true; this.crVerdict = r.v;
      if (r.good) this.crDone = true;
    },
    get crExplain() {
      return `At ${this.cr.t1} °C, ${this.cr.water} g water holds ${fmt(this.cr.s1 * this.cr.water / 100)} g; ` +
        `at ${this.cr.t2} °C it holds only ${fmt(this.cr.s2 * this.cr.water / 100)} g. ` +
        `The difference, ${this.cr.ans} g, crystallizes out.`;
    },
    crNext() { this.genCrys(); },

    // ===================== Capstone: dissolve -> dilute -> precipitate =====================
    get capUnlocked() { return this.gOverall() === 1; },
    genCapstone() {
      const p = this.genPrecipPair(true);           // a pair that does precipitate
      const saltFormula = ionicFormula(p.c1, p.a1);
      const reagentFormula = ionicFormula(p.c2, p.a2);
      this.cap = {
        sc: scOf('cap-batch'),
        salt: { formula: saltFormula, name: `${IONS.cations[p.c1].name} ${IONS.anions[p.a1].name}` },
        reagent: { formula: reagentFormula, name: `${IONS.cations[p.c2].name} ${IONS.anions[p.a2].name}` },
        M: molarMass(saltFormula),
        targetM: rN(0.25 + Math.random() * 1.25, 2),
        tolPct: 3,
        products: p.dr.products
      };
      this.capKind = null; this.capElec = null;
      this.capGrams = ''; this.capVol = 250; this.capCls = [null, null];
      this.capChecked = false; this.capAttempted = false; this.capWin = false; this.capVerdict = null;
    },
    get capMoles() { const g = parseFloat(this.capGrams); return isFinite(g) ? g / this.cap.M : 0; },
    get capConc() { return this.capMoles / (this.capVol / 1000); },
    get capErr() { return percentError(this.capConc, this.cap.targetM); },
    capKindState(k) {
      if (!this.capChecked) return this.capKind === k ? 'on' : '';
      if (k === 'ionic') return 'correct';
      if (k === this.capKind) return 'wrong';
      return '';
    },
    capElecState(v) {
      if (!this.capChecked) return this.capElec === v ? 'on' : '';
      if (v === true) return 'correct';
      if (v === this.capElec) return 'wrong';
      return '';
    },
    capClsState(i, v) {
      const want = this.cap.products[i].soluble ? 'aq' : 's';
      if (!this.capChecked) return this.capCls[i] === v ? 'on' : '';
      if (v === want) return 'correct';
      if (v === this.capCls[i]) return 'wrong';
      return '';
    },
    capPickKind(k) { if (!this.capWin) { this.capKind = k; this.capChecked = false; } },
    capPickElec(v) { if (!this.capWin) { this.capElec = v; this.capChecked = false; } },
    capSetCls(i, v) { if (!this.capWin) { this.capCls = this.capCls.map((x, j) => j === i ? v : x); this.capChecked = false; } },
    get capStep1Ok() { return this.capKind === 'ionic' && this.capElec === true; },
    get capStep2Ok() { return this.capGrams !== '' && this.capErr <= this.cap.tolPct; },
    get capStep3Ok() { return !this.capCls.includes(null) && this.cap.products.every((p, i) => (this.capCls[i] === 's') === !p.soluble); },
    capRun() {
      if (this.capWin || this.capKind === null || this.capElec === null || this.capGrams === '' || this.capCls.includes(null)) return;
      const sc = this.cap.sc;
      const ok = this.capStep1Ok && this.capStep2Ok && this.capStep3Ok;
      const step = !this.capStep1Ok ? 'Step 1 is out: recheck the bonding type and whether it conducts.'
        : (!this.capStep2Ok ? `Step 1 holds. Step 2 is out: the flask reads ${fmt(this.capConc, 4)} M against a ${this.cap.targetM} M spec.`
          : 'Steps 1 and 2 hold. Step 3 is out: recheck each product against the solubility rules.');
      const detail = ok
        ? `Stock classified, flask on spec at ${fmt(this.capConc, 4)} M, and the precipitate called.`
        : step;
      const v = this.decisionVerdict(sc, ok, 'BATCH REJECTED',
        ok ? 'The batch stands up' : 'The batch does not stand up', detail, ok ? sc.right : sc.wrong);
      this.gRecord('cap', ok, !this.capAttempted);
      this.recordWorld({ icon: v.icon, tone: v.tone, text: `${sc.system}, ${ok ? 'certified' : 'rejected'}`, delta: ok ? sc.delta.ok : sc.delta.wrong });
      this.capAttempted = true; this.capChecked = true; this.capVerdict = v;
      if (ok) this.capWin = true;
    },

    // ===================== Chart.js solubility curves =====================
    buildCurveChart() {
      if (typeof Chart === 'undefined' || !this.$refs.curveCanvas || curveChart) return;
      const datasets = SOLUBILITY_CURVES.map(c => ({
        label: c.name,
        data: c.pts.map((s, i) => ({ x: CURVE_TEMPS[i], y: s })),
        borderColor: c.color, backgroundColor: c.color,
        borderWidth: 1.5, pointRadius: 0, tension: 0.25, _key: c.key
      }));
      datasets.push({
        label: 'reading temperature', data: [], borderColor: '#1c2a31',
        borderDash: [5, 4], borderWidth: 1.5, pointRadius: 0, showLine: true
      });
      curveChart = lineChart(this.$refs.curveCanvas, {
        datasets, xTitle: 'Temperature (°C)', yTitle: 'Solubility (g per 100 g water)'
      });
      this.updateCurveChart();
    },
    updateCurveChart() {
      if (!curveChart || !this.cu) return;
      for (const ds of curveChart.data.datasets) {
        if (!ds._key) continue;
        const active = ds._key === this.cu.key;
        ds.borderColor = active ? curveOf(ds._key).color : '#cdd7db';
        ds.borderWidth = active ? 3 : 1.25;
      }
      const marker = curveChart.data.datasets[curveChart.data.datasets.length - 1];
      marker.data = [{ x: this.cu.t, y: 0 }, { x: this.cu.t, y: 260 }];
      curveChart.update();
    },
    resizeCurveChart() { curveChart?.resize(); }
  };
}
