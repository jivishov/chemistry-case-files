// main.js: Unit 8 view-model (Solutions & Solubility, TEKS C.11).
// The core interactions are the chemistry: classify by polarity, read solubility
// curves, apply solubility rules, prepare a target molarity, and calculate a dilution.
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
import { sceneArt } from './art.js';

let curveChart = null;

const pick = a => a[(Math.random() * a.length) | 0];
const shuffle = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
const pickNot = (a, recent, keyFn = x => x) => {
  const fresh = a.filter(x => !recent.includes(keyFn(x)));
  return pick(fresh.length ? fresh : a);
};
const rN = (x, n) => { const p = 10 ** n; return Math.round(x * p) / p; };
const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));

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
const solubilityAt = (key, t) => curveOf(key).pts[CURVE_TEMPS.indexOf(t)];
const curveCellOk = (key, t) => {
  const s = solubilityAt(key, t);
  return !SOLUBILITY_CURVES.some(o => o.key !== key && Math.abs(solubilityAt(o.key, t) - s) <= CURVE_MIN_SEP);
};

const scOf = id => SCENARIOS.find(s => s.id === id);

// The Unit 8 world meter is deliberately a SIMULATION indicator. Its numerical scale
// is expressed in mg/L so students can compare it with EPA's 0.05 mg/L manganese
// secondary guideline, but answer correctness is what moves it. It is not a measured
// treatment response and the interface labels it accordingly.
const MN_START = 0.42;
const MN_TARGET = 0.05;
const MN_MAX = 0.50;
const ROUND_START = 1;
const JOBS_PER_ROUND = 4;

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
    ...createGame({ unitId: 'units_new/08-solutions', skills }),
    SE, fmt, SOLUBILITY_RULES,
    honors: false,
    teksOpen: false,
    mode: 'dissolve',

    // Session-local simulation indicator and activity log.
    mn: MN_START,
    jobs: 0,
    worldLog: [],
    _wid: 0,
    scIdx: { a: -1, b: -1, c: -1, d: -1, e: -1, f: -1 },

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

    setMode(m) {
      this.mode = m;
      if (m === 'capstone' && this.capUnlocked && !this.cap) this.genCapstone();
      this.$nextTick(() => { if (m === 'curve') this.resizeCurveChart(); });
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

    nextScenario(skill) {
      const list = SCENARIOS.filter(s => s.skill === skill);
      const i = (this.scIdx[skill] = (this.scIdx[skill] ?? -1) + 1) % list.length;
      return list[i];
    },

    recordWorld({ icon, tone, text, delta = 0 }) {
      this.jobs += 1;
      this.mn = rN(Math.max(0, Math.min(MN_MAX, this.mn + delta)), 3);
      this.worldLog.unshift({ id: ++this._wid, icon, tone, text: `${this.dayLabel}: ${text}` });
      if (this.worldLog.length > 6) this.worldLog.pop();
    },
    get dayLabel() { return `Round ${ROUND_START + Math.floor(this.jobs / JOBS_PER_ROUND)}`; },
    get mnLabel() { return this.mn.toFixed(2); },
    get mnPct() { return Math.max(0, Math.min(100, (MN_MAX - this.mn) / MN_MAX * 100)); },
    get mnMood() { return this.mn <= MN_TARGET ? '\u{1F642}' : this.mn < 0.45 ? '\u{1F630}' : '\u{1F635}'; },
    get mnState() {
      if (this.mn <= MN_TARGET) return 'At or below the activity target';
      if (this.mn < 0.45) return 'Above the activity target';
      return 'Well above the activity target';
    },
    get mnColor() { return this.mn <= MN_TARGET ? 'var(--success)' : this.mn < 0.45 ? 'var(--warn)' : 'var(--danger)'; },
    get mnLimit() { return MN_TARGET; },

    doseVerdict(sc, val, target, bands, unit, detail) {
      if (!isFinite(val)) {
        return { v: { tone: 'fail', icon: '\u{26A0}\u{FE0F}', state: 'NO NUMBER', headline: 'Enter a numerical value', detail: sc.fail, gauge: null }, good: false, dir: 'fail' };
      }
      const band = outcomeBand(val, target, bands);
      const good = band.withinSpec;
      const yours = `${fmt(val, 4)} ${unit}`;
      const targetTxt = `${fmt(target, 4)} ${unit}`;
      if (good) {
        return { v: { tone: 'success', icon: sc.icon, state: sc.safeState, headline: 'Meets activity criterion',
          detail: `Your result is ${yours}; the target is ${targetTxt}. ${detail} ${sc.safe}`, gauge: 'on' }, good: true, dir: 'ok' };
      }
      const off = `${fmt(Math.abs(val - target), 3)} ${unit}`;
      const low = band.direction === 'low';
      return { v: { tone: 'fail', icon: '\u{1F6A8}', state: low ? sc.lowState : sc.highState,
        headline: low ? 'Below target' : 'Above target',
        detail: `Your result is ${yours}; the target is ${targetTxt}. The difference is ${off} ${low ? 'below' : 'above'} target. ${detail} ${low ? sc.low : sc.high}`,
        gauge: low ? 'low' : 'high' }, good: false, dir: low ? 'low' : 'high' };
    },
    decisionVerdict(sc, good, state, headline, detail, consequence) {
      return good
        ? { tone: 'success', icon: sc.icon, state: 'CORRECT', headline, detail: `${detail} ${consequence}`, gauge: null }
        : { tone: 'fail', icon: '\u{1F6A8}', state, headline, detail: `${detail} ${consequence}`, gauge: null };
    },

    seCaption(se) {
      if (this.gMastered(se.id)) return 'Mastered';
      const sk = this.g_skills[se.id];
      const def = this.g_skillDefs.find(d => d.id === se.id) || {};
      return `${sk ? sk.run : 0} of ${def.target || 3} correct in a row`;
    },

    scArt(id) { return sceneArt(id); },
    get coreSkills() { return SE.filter(se => !se.honors); },
    get teksMasteredCount() { return this.coreSkills.filter(se => this.gMastered(se.id)).length; },
    get activeBrief() {
      const byMode = {
        dissolve: this.dp && this.dp.sc, types: this.tp && this.tp.sc,
        curve: this.cu && this.cu.sc, precip: this.pr && this.pr.sc,
        molarity: this.mo && this.mo.sc, dilute: this.di && this.di.sc,
        capstone: (this.cap && this.cap.sc) || scOf('cap-batch')
      };
      return byMode[this.mode] || null;
    },
    get activeVerdict() {
      return ({ dissolve: this.dpVerdict, types: this.tpVerdict, curve: this.cuVerdict,
        precip: this.prVerdict, molarity: this.moVerdict, dilute: this.diVerdict,
        capstone: this.capVerdict })[this.mode] || null;
    },
    get activeTone() {
      const tone = this.activeVerdict && this.activeVerdict.tone;
      return tone === 'success' ? 'safe' : (tone === 'warn' ? 'warn' : (tone ? 'danger' : 'standby'));
    },
    get activeArtId() { return (this.activeBrief && this.activeBrief.id) || 'a-brine'; },
    get activeStationName() { return (this.activeBrief && this.activeBrief.system) || 'Solutions bench'; },
    get activeStateLabel() { return (this.activeVerdict && this.activeVerdict.state) || ''; },
    get activeOutcomeText() {
      const v = this.activeVerdict, b = this.activeBrief;
      return (v && (v.detail || v.headline)) || (b && (b.why || b.goal)) || 'Observe the data, calculate when needed, and submit an evidence-based answer.';
    },
    get activeReference() {
      if (this.mode === 'curve') return [{ k: 'Read', v: 'g solute per 100 g water' }, { k: 'Rate', v: 'temperature, agitation, surface area' }];
      if (this.mode === 'molarity') return [{ k: 'M', v: 'mol solute / L solution' }, { k: 'Mass', v: 'moles × molar mass' }];
      if (this.mode === 'dilute') return [{ k: 'Equation', v: 'C1V1 = C2V2' }, { k: 'Method', v: 'measure stock; dilute to final volume' }];
      if (this.mode === 'precip') return [{ k: 'Rule set', v: 'classify each product as aq or s' }, { k: 'Result', v: 'an insoluble product is a precipitate' }];
      if (this.mode === 'types') return [{ k: 'State', v: 'compare dissolved amount with solubility' }, { k: 'Electrolyte', v: 'mobile ions conduct current' }];
      return [{ k: 'Activity model', v: 'simulated Mn indicator; not a measurement' }, { k: 'Water', v: 'polar solvent; intermolecular forces matter' }];
    },
    get waterReadings() {
      const clean = this.mnPct;
      const jobs = Math.min(100, this.jobs / JOBS_PER_ROUND * 100);
      return [
        { key: 'mn', label: 'Sim. Mn', raw: `${this.mnLabel} mg/L`, pct: clean, color: this.mnColor, hint: 'simulation indicator; answer correctness changes this value, so it is not a measured concentration' },
        { key: 'limit', label: 'Target', raw: `${this.mnLimit} mg/L`, pct: 100, color: 'var(--success)', hint: 'activity target set to EPA\'s 0.05 mg/L manganese secondary guideline' },
        { key: 'jobs', label: 'Attempts', raw: `${this.jobs}`, pct: jobs, color: 'var(--accent)', hint: 'responses logged in the current activity round' },
        { key: 'mastery', label: 'Core', raw: `${this.teksMasteredCount}/6`, pct: this.gOverall() * 100, color: 'var(--accent-700)', hint: 'core TEKS skills mastered' }
      ];
    },

    // ===================== C.11(A) water and polarity =====================
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
      const consequence = ok ? sc.right : (kindOk ? sc.wrongDis : sc.wrongKind);
      const expectedSol = this.dp.dissolves ? 'appreciably soluble in water' : 'low water solubility';
      const v = this.decisionVerdict(sc, ok, kindOk ? 'SOLUBILITY ERROR' : 'BONDING ERROR',
        ok ? `${this.dp.name}: correct classification` : `${this.dp.name}: ${KIND_LABEL[this.dp.kind].toLowerCase()}, ${expectedSol}`,
        this.dpExplain, consequence);
      this.gRecord('a', ok, !this.dpAttempted);
      this.recordWorld({ icon: v.icon, tone: v.tone, text: `${sc.system}: ${ok ? 'classification correct' : 'classification needs revision'}`, delta: ok ? sc.delta.ok : sc.delta.wrong });
      this.dpAttempted = true; this.dpChecked = true; this.dpVerdict = v;
      if (ok) this.dpDone = true;
    },
    get dpExplain() {
      const d = this.dp;
      if (d.kind === 'nonpolar') {
        return `${d.name} is ${KIND_LABEL[d.kind].toLowerCase()}. It has low solubility in polar water because water-solute attractions are not strong enough to make mixing favorable. “Like dissolves like” is a useful guideline, not an absolute rule.`;
      }
      if (d.kind === 'ionic') {
        return `${d.name} is ionic. For this selected soluble salt, polar water stabilizes separated ions through ion-dipole attractions, so it dissolves appreciably.`;
      }
      return `${d.name} is ${KIND_LABEL[d.kind].toLowerCase()}. Its polar regions interact favorably with water, so this selected substance dissolves appreciably.`;
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
      const v = this.decisionVerdict(sc, ok, classOk ? 'ELECTROLYTE ERROR' : 'SATURATION ERROR',
        ok ? `${this.tp.item.name}: ${this.tp.cls}` : `Expected: ${this.tp.cls}, ${this.tp.item.electrolyte ? 'electrolyte' : 'nonelectrolyte'}`,
        this.tpExplain, consequence);
      this.gRecord('b', ok, !this.tpAttempted);
      this.recordWorld({ icon: v.icon, tone: v.tone, text: `${sc.system}: ${ok ? 'solution classified correctly' : 'classification needs revision'}`, delta: ok ? sc.delta.ok : sc.delta.wrong });
      this.tpAttempted = true; this.tpChecked = true; this.tpVerdict = v;
      if (ok) this.tpDone = true;
    },
    get tpExplain() {
      const t = this.tp;
      const cmp = t.amount < t.item.s ? 'less than' : (t.amount > t.item.s ? 'more than' : 'equal to');
      const elec = t.item.electrolyte
        ? 'an electrolyte because it produces mobile ions in water'
        : 'a nonelectrolyte because it remains as neutral molecules and therefore conducts very poorly';
      return `${t.amount} g is ${cmp} the ${t.item.s} g equilibrium solubility in 100 g of water at 20 °C, so the solution is ${t.cls}. ${t.item.name} is ${elec}.`;
    },
    tpNext() { this.genTypes(); },

    // ===================== C.11(C) solubility curve + rate =====================
    genCurve() {
      const sc = this.nextScenario('c');
      const keys = sc.constraints.solutes, temps = sc.constraints.temps;
      let key = null, t = null;
      for (let i = 0; i < 200; i++) {
        const k = pick(keys), tt = pick(temps);
        if (curveCellOk(k, tt)) { key = k; t = tt; break; }
      }
      if (key === null) {
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
      const rateNote = rateOk ? '' : ` The rate prediction also needs revision: ${this.cu.rf.change.toLowerCase()} makes dissolving ${this.cu.rf.faster ? 'faster' : 'slower'}.`;
      const r = this.doseVerdict(sc, parseFloat(this.cuInput), this.cu.sAns, this.cu.bands,
        'g per 100 g water', this.cuExplain + rateNote);
      let v = r.v, ok = r.good && rateOk, dir = r.dir;
      if (r.good && !rateOk) {
        v = { tone: 'fail', icon: '\u{1F6A8}', state: 'RATE ERROR', headline: 'Curve reading correct; rate prediction incorrect',
          detail: `${this.cuExplain}${rateNote} ${sc.rateWrong}`, gauge: 'on' };
        dir = 'rate';
      }
      const d = sc.delta;
      this.gRecord('c', ok, !this.cuAttempted);
      this.recordWorld({ icon: v.icon, tone: v.tone, text: `${sc.system}: ${ok ? 'curve and rate correct' : (dir === 'rate' ? 'rate prediction needs revision' : 'curve reading needs revision')}`, delta: ok ? d.ok : (dir === 'high' ? d.high : d.low) });
      this.cuAttempted = true; this.cuChecked = true; this.cuVerdict = v;
      if (ok) this.cuDone = true;
    },
    get cuExplain() {
      return `At ${this.cu.t} °C, the curve for ${this.cu.name} reads about ${this.cu.sAns} g per 100 g water. ${this.cu.rf.change} makes dissolving ${this.cu.rf.faster ? 'faster' : 'slower'}: ${this.cu.rf.why}`;
    },
    cuNext() { this.genCurve(); },

    // ===================== C.11(D) precipitation predictor =====================
    genPrecipPair(wantPrecip, cations = CORE_CATIONS, anions = CORE_ANIONS) {
      for (let i = 0; i < 200; i++) {
        const a1 = pick(anions), a2 = pick(anions);
        const c1 = pick(cations), c2 = pick(cations);
        if (a1 === a2 || c1 === c2) continue;
        if (!predictSolubility(c1, a1).soluble || !predictSolubility(c2, a2).soluble) continue;
        const dr = doubleReplacement({ cation: c1, anion: a1 }, { cation: c2, anion: a2 });
        if (dr.formsPrecipitate === wantPrecip) return { c1, a1, c2, a2, dr };
      }
      const fb = wantPrecip
        ? { c1: 'Ag', a1: 'NO3', c2: 'Na', a2: 'Cl' }
        : { c1: 'Na', a1: 'NO3', c2: 'K', a2: 'Cl' };
      return { ...fb, dr: doubleReplacement({ cation: fb.c1, anion: fb.a1 }, { cation: fb.c2, anion: fb.a2 }) };
    },
    genPrecip() {
      const sc = this.nextScenario('d');
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
      const missed = this.pr.products.some((p, i) => !p.soluble && this.prCls[i] === 'aq');
      const consequence = ok ? sc.right : (missed ? sc.wrongMiss : sc.wrongDrop);
      const v = this.decisionVerdict(sc, ok, 'SOLUBILITY ERROR',
        ok ? (this.pr.formsPrecipitate ? `Precipitate: ${this.pr.precipitates.join(' and ')}` : 'No precipitate forms')
           : (missed ? 'An insoluble product was marked aqueous' : 'A soluble product was marked solid'),
        this.prExplain, consequence);
      this.gRecord('d', ok, !this.prAttempted);
      this.recordWorld({ icon: v.icon, tone: v.tone, text: `${sc.system}: ${ok ? 'product states correct' : 'product states need revision'}`, delta: ok ? sc.delta.ok : sc.delta.wrong });
      this.prAttempted = true; this.prChecked = true; this.prVerdict = v;
      if (ok) this.prDone = true;
    },
    get prExplain() {
      const parts = this.pr.products.map(p => `${p.formula} is ${p.soluble ? 'soluble (aq)' : 'classified as insoluble and forms a precipitate (s)'}`);
      const verdict = this.pr.formsPrecipitate
        ? `The activity rule set predicts a precipitate: ${this.pr.precipitates.join(' and ')}.`
        : 'Both products are classified as soluble, so no precipitation reaction is predicted.';
      return `${parts.join('; ')}. ${verdict}`;
    },
    prNext() { this.genPrecip(); },

    // ===================== C.11(E) molarity =====================
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
      const r = this.doseVerdict(sc, this.moConc, this.mo.targetM, this.mo.bands, 'M', this.moExplain);
      const d = sc.delta;
      this.gRecord('e', r.good, !this.moAttempted);
      this.recordWorld({ icon: r.v.icon, tone: r.v.tone, text: `${sc.system}: ${r.good ? 'concentration meets criterion' : 'concentration needs revision'}`, delta: r.good ? d.ok : (r.dir === 'high' ? d.high : d.low) });
      this.moAttempted = true; this.moChecked = true; this.moVerdict = r.v;
      if (r.good) this.moDone = true;
    },
    get moExplain() {
      const needMol = this.mo.targetM * (this.moVol / 1000);
      const needG = needMol * this.mo.M;
      return `M = moles / liters. For ${this.mo.targetM} M in ${this.moVol} mL, you need ${fmt(needMol, 4)} mol, which is ${fmt(needG, 4)} g of ${this.mo.s.name} (molar mass ${fmt(this.mo.M, 4)} g/mol). Your prepared concentration is ${fmt(this.moConc, 4)} M.`;
    },
    moNext() { this.genMolarity(); },

    // ===================== C.11(F) dilution =====================
    genDilute() {
      const sc = this.nextScenario('f');
      const pool = DILUTION_STOCKS.filter(x => sc.constraints.stocks.includes(x.name));
      if (!pool.length) throw new Error(`genDilute: ${sc.id} pins no DILUTION_STOCKS name that exists`);
      const stock = pick(pool);
      const v2 = pick(sc.constraints.v2);
      const idealV1 = 10 + ((Math.random() * (v2 * 0.5 - 10)) | 0);
      const targetC2 = rN((stock.c1 * idealV1) / v2, 2);
      this.di = { sc, stock, c1: stock.c1, targetC2, v2, bands: DILUTION_BANDS, idealV1 };
      this.diVstock = Math.min(50, v2);
      this.diChecked = false; this.diAttempted = false; this.diDone = false; this.diVerdict = null;
    },
    // diWater is retained only for backward-compatible visual proportions. It must not
    // be presented as an experimentally exact water volume; real preparation is to final volume.
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
      this.recordWorld({ icon: r.v.icon, tone: r.v.tone, text: `${sc.system}: ${r.good ? 'dilution meets criterion' : 'dilution needs revision'}`, delta: r.good ? d.ok : (r.dir === 'high' ? d.high : d.low) });
      this.diAttempted = true; this.diChecked = true; this.diVerdict = r.v;
      if (r.good) this.diDone = true;
    },
    get diExplain() {
      return `C1V1 = C2V2, so V1 = C2V2 / C1 = (${this.di.targetC2} M)(${this.di.v2} mL) / ${this.di.c1} M = ${this.di.idealV1} mL of stock. Measure that stock volume, then add solvent until the total solution volume reaches ${this.di.v2} mL. Your calculated final concentration is ${fmt(this.diConc)} M.`;
    },
    diNext() { this.genDilute(); },

    // ===================== Honors: Ksp / common ion =====================
    get kspUnlocked() { return this.gMastered('d'); },
    genKsp() {
      const salt = pick(KSP_SALTS);
      const want = Math.random() < 0.5;
      let a, b, Q;
      for (let i = 0; i < 80; i++) {
        a = 2 + ((Math.random() * 6) | 0);
        b = 2 + ((Math.random() * 6) | 0);
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
      const v = this.decisionVerdict(sc, ok, 'Q / Ksp ERROR',
        this.ks.forms ? 'Q > Ksp: precipitation is favored' : 'Q < Ksp: no precipitate is predicted',
        this.ksExplain, ok ? sc.right : sc.wrong);
      this.gRecord('h1', ok, !this.ksAttempted);
      this.recordWorld({ icon: v.icon, tone: v.tone, text: `${sc.system}: ${ok ? 'Q comparison correct' : 'Q comparison needs revision'}`, delta: ok ? sc.delta.ok : sc.delta.wrong });
      this.ksAttempted = true; this.ksChecked = true; this.ksVerdict = v;
      if (ok) this.ksDone = true;
    },
    get ksExplain() {
      return `Q = [cation][anion] = ${this.ksQ()}, and Ksp = ${this.ksKsp()}. Q is ${this.ks.forms ? 'greater than' : 'less than'} Ksp, so ${this.ks.forms ? 'precipitation is favored' : 'the solution is unsaturated with respect to this salt'}. Adding a common ion can raise Q and move the system toward precipitation.`;
    },
    ksNext() { this.genKsp(); },

    // ===================== Honors: crystallization =====================
    get crysUnlocked() { return this.gMastered('c'); },
    genCrys() {
      const c = pick(SOLUBILITY_CURVES.filter(x => x.key !== 'NaCl'));
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
      this.recordWorld({ icon: r.v.icon, tone: r.v.tone, text: `${sc.system}: ${r.good ? 'crystallized mass correct' : 'crystallized mass needs revision'}`, delta: r.good ? d.ok : (r.dir === 'high' ? d.high : d.low) });
      this.crAttempted = true; this.crChecked = true; this.crVerdict = r.v;
      if (r.good) this.crDone = true;
    },
    get crExplain() {
      return `At ${this.cr.t1} °C, ${this.cr.water} g of water can hold ${fmt(this.cr.s1 * this.cr.water / 100)} g of solute; at ${this.cr.t2} °C it can hold ${fmt(this.cr.s2 * this.cr.water / 100)} g. The difference, ${this.cr.ans} g, is the calculated mass that crystallizes if equilibrium is reached.`;
    },
    crNext() { this.genCrys(); },

    // ===================== Capstone =====================
    get capUnlocked() { return this.gOverall() === 1; },
    genCapstone() {
      const p = this.genPrecipPair(true);
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
      const step = !this.capStep1Ok ? 'Step 1 needs revision: recheck the bonding type and electrolyte classification.'
        : (!this.capStep2Ok ? `Step 1 is correct. Step 2 needs revision: the prepared concentration is ${fmt(this.capConc, 4)} M; the target is ${this.cap.targetM} M.`
          : 'Steps 1 and 2 are correct. Step 3 needs revision: recheck each product against the activity solubility rules.');
      const detail = ok
        ? `Stock classification correct; prepared concentration ${fmt(this.capConc, 4)} M; product states correct.`
        : step;
      const v = this.decisionVerdict(sc, ok, 'BATCH NEEDS REVISION',
        ok ? 'Integrated batch correct' : 'Integrated batch incomplete', detail, ok ? sc.right : sc.wrong);
      this.gRecord('cap', ok, !this.capAttempted);
      this.recordWorld({ icon: v.icon, tone: v.tone, text: `${sc.system}: ${ok ? 'all steps correct' : 'one or more steps need revision'}`, delta: ok ? sc.delta.ok : sc.delta.wrong });
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
