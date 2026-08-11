// main.js: Unit 7 view-model (Gas Laws & Kinetic Molecular Theory, C.10).
import {
  KMT_POSTULATES, KMT_QUIZ, GAS_LAWS, RELATIONSHIPS, DALTON_GASES,
  REAL_GASES, WATER_VP, maxwellBoltzmann, rmsSpeed, mostProbableSpeed, SE, SCENARIOS
} from './model.js';
import { idealGasSolve, vanderWaalsPressure, partialPressures, GAS_CONSTANT_R, fmt } from '../../../shared/js/chem.js';
import { lineChart, speciesColor } from '../../../shared/js/render.js';
import { createGasBox } from './gasbox.js';
import { createGame, outcomeBand } from '../../../shared/js/game.js';

// Three.js + Chart.js objects live at module scope, never inside Alpine's reactive proxy.
let gasbox = null, lawChart = null, mbChart = null, zChart = null;

const pick = a => a[(Math.random() * a.length) | 0];
const rN = (x, d = 2) => { const f = 10 ** d; return Math.round(x * f) / f; };
// fmt() prints 3 significant figures, so a raw draw of 8437 would DISPLAY as 8440 and
// the learner would be graded against a number they were never shown. Snap every drawn
// quantity to 3 sig figs BEFORE deriving a target, so what is on screen is exactly what
// the target comes from. U7 is the unit most exposed to this: idealGasSolve is fed four
// values that are all displayed and all learner-facing.
const snap = x => Number(x.toPrecision(3));
const draw = (lo, hi) => snap(lo + Math.random() * (hi - lo));

const VAR_LABEL = { P: 'Pressure P', V: 'Volume V', n: 'Moles n', T: 'Temperature T' };
const VAR_UNIT = { P: 'atm', V: 'L', n: 'mol', T: 'K' };

// ---- world-state constants: the bank, the dive-day clock, the oxygen ceiling ----
const START_BANK = 200;     // atm of storage pressure in the bank at the start of the day
const SHIFT_START = 6 * 60; // the boat starts filling at 06:00
const PPO2_LIMIT = 1.4;     // atm, the recreational working limit (1.6 is contingency)

// Mastery targets. Built from shared/js/game.js's createGame contract, NOT from
// GAMIFICATION.md's API block, which omits `honors` and would silently put honors
// skills into the capstone gate.
const skills = [
  { id: 'a',   code: 'C.10(A)', label: 'Kinetic theory',      target: 3 },
  { id: 'b',   code: 'C.10(B)', label: 'Size the fill',       target: 3 },
  { id: 'c',   code: 'C.10(C)', label: 'Blend the mix',       target: 3 },
  { id: 'h1',  code: 'Honors',  label: 'Speed distribution',  target: 2, honors: true },
  { id: 'h2',  code: 'Honors',  label: 'Real-gas correction', target: 2, honors: true },
  { id: 'h3',  code: 'Honors',  label: 'Gas over water',      target: 2, honors: true },
  { id: 'cap', code: 'Capstone', label: 'The last fill',      target: 1, honors: true }
];

const scOf = id => SCENARIOS.find(s => s.id === id);
const quizOf = id => KMT_QUIZ.find(q => q.id === id);

export { SE };

export function createSim() {
  return {
    ...createGame({ unitId: '07-gas-laws', skills }),
    KMT_POSTULATES, GAS_LAWS, RELATIONSHIPS, REAL_GASES, WATER_VP, SE, fmt,
    R: GAS_CONSTANT_R,
    PPO2_LIMIT,
    honors: false,
    mode: 'kmt',

    // ---- world-state: bank pressure + the dive-day clock (session-local) ----
    bank: START_BANK,
    clockMin: 0,
    worldLog: [],
    _wid: 0,
    scIdx: { a: -1, b: -1, c: -1 },

    // ---- C.10(A) particle box + KMT decision ----
    boxT: 300, boxN: 40, boxV: 1, boxMounted: false,
    mbGasKey: 'N2',
    kq: null, kPick: null,
    kChecked: false, kAttempted: false, kDone: false, kVerdict: null,

    // ---- C.10(B) ideal-gas solver ----
    solveFor: 'P', igP: 1, igV: 12, ign: 0.5, igT: 300,
    relKey: 'boyle',
    rgKey: 'CO2',
    ig: null, igInput: '',
    igChecked: false, igAttempted: false, igDone: false, igVerdict: null,

    // ---- C.10(C) Dalton mixer ----
    dGases: DALTON_GASES.map(g => ({ ...g })),
    dTotalP: 1,
    wTemp: 25, wTotal: 1,
    dl: null, dlInput: '',
    dlChecked: false, dlAttempted: false, dlDone: false, dlVerdict: null,

    // ---- honors benches ----
    h1s: null, h1Pick: null,
    h1Checked: false, h1Attempted: false, h1Done: false, h1Verdict: null,

    h2s: null, h2Input: '',
    h2Checked: false, h2Attempted: false, h2Done: false, h2Verdict: null,

    h3s: null, h3Input: '',
    h3Checked: false, h3Attempted: false, h3Done: false, h3Verdict: null,

    // ---- capstone ----
    cap: null, capPick: null, capChecked: false, capAttempted: false,
    capWin: false, capVerdict: null,

    // U7 has the most constrained init() in the repo and four ordering constraints in
    // one function: the scenario generators run BEFORE the $nextTick so the selects they
    // set are re-applied by it; the box mount and the chart build stay inside it; the
    // select re-apply stays its LAST statement; and the two $watch registrations are
    // load-bearing (the first remounts the box on entering `kmt`, the second rebuilds the
    // honors charts on the toggle).
    init() {
      this.gLoad();
      this.genKmt();
      this.genIdeal();
      this.genDalton();
      this.genHonors1();
      this.genHonors2();
      this.genHonors3();
      this.$nextTick(() => {
        this.mountBox();
        this.buildCharts();
        this.reapplySelects();
      });
      this.$watch('mode', m => { if (m === 'kmt') this.mountBox(); this.$nextTick(() => this.resizeCharts()); });
      this.$watch('honors', () => this.$nextTick(() => {
        this.buildCharts(); this.reapplySelects();
        this.updateMB(); this.updateZ(); this.resizeCharts();
      }));
    },

    // A <select x-model> binds before its child x-for has rendered its <option>s, so an
    // initial value that isn't the first option fails to stick. Re-apply once the option
    // lists exist so the dropdowns match state. Scenarios now drive `relKey`, `mbGasKey`
    // and `wTemp`, and two of those selects live inside blocks that only render after a
    // commit or an honors toggle, so this runs on every reveal, not just at init.
    // `rgKey` is deliberately NOT in this list: the honors real-gas scenario picks the
    // gas, so there is no longer a dropdown for it to fight with.
    reapplySelects() {
      ['mbGasKey', 'relKey', 'wTemp'].forEach(k => { const v = this[k]; this[k] = null; this[k] = v; });
    },

    setMode(m) {
      this.mode = m;
      // Re-draw the capstone if the bank has moved since it was generated, because the
      // bank is half of what makes the call correct. Once it is won it freezes, so a win
      // is never taken away.
      const stale = this.cap && !this.capWin && this.cap.bankAt !== this.bank;
      if (m === 'capstone' && this.capUnlocked && (!this.cap || stale)) this.genCapstone();
    },

    resetProgress() {
      this.gReset();
      this.bank = START_BANK; this.clockMin = 0; this.worldLog = [];
      this.scIdx = { a: -1, b: -1, c: -1 };
      this.genKmt(); this.genIdeal(); this.genDalton();
      this.genHonors1(); this.genHonors2(); this.genHonors3();
      this.cap = null; this.capWin = false; this.capVerdict = null;
    },

    color(formula) { return speciesColor(formula); },
    range(n) { return Array.from({ length: n }); },

    // ---- scenario plumbing ----
    nextScenario(skill) {
      const list = SCENARIOS.filter(s => s.skill === skill);
      const i = (this.scIdx[skill] = (this.scIdx[skill] ?? -1) + 1) % list.length;
      return list[i];
    },
    // Advance the dive-day clock and draw gas off the bank. A wrong call costs roughly
    // three times the minutes of a right one, which is the feedback loop: the queue on
    // the dock does not wait while you re-run the arithmetic. Only calls that actually
    // put gas in a cylinder carry a `spend`; reading a gauge or checking an analyser
    // costs time and nothing else.
    recordWorld({ icon, tone, text, minutes, spend = 0 }) {
      this.clockMin += minutes;
      this.bank = rN(Math.max(0, Math.min(START_BANK, this.bank - spend)), 1);
      this.worldLog.unshift({ id: ++this._wid, icon, tone, text: `${this.clockLabel} ${text}` });
      if (this.worldLog.length > 6) this.worldLog.pop();
    },
    get clockLabel() {
      const t = SHIFT_START + this.clockMin;
      return `${String(Math.floor(t / 60) % 24).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;
    },
    get bankPct() { return Math.max(0, Math.min(100, this.bank / START_BANK * 100)); },
    get bankMood() { return this.bank >= START_BANK * 0.5 ? '\u{1F642}' : this.bank >= START_BANK * 0.2 ? '\u{1F630}' : '\u{1F635}'; },
    get bankState() {
      if (this.bank >= START_BANK * 0.5) return 'Bank full, everyone dives';
      if (this.bank >= START_BANK * 0.2) return 'Bank low, fills are slow';
      return 'Bank dry, the boat stays tied up';
    },
    get bankColor() { return this.bank >= START_BANK * 0.5 ? 'var(--success)' : this.bank >= START_BANK * 0.2 ? 'var(--warn)' : 'var(--danger)'; },
    // Storage cylinders still worth drawing on, one token per 20 atm.
    get bankTanks() { return Array.from({ length: Math.ceil(this.bank / 20) }); },

    seCaption(se) {
      if (this.gMastered(se.id)) return 'Mastered';
      const sk = this.g_skills[se.id];
      const def = this.g_skillDefs.find(d => d.id === se.id) || {};
      return `${sk ? sk.run : 0} of ${def.target || 3} correct in a row`;
    },

    // ========== C.10(A) kinetic molecular theory ==========
    mountBox() {
      // The stage now lives inside the stage panel's <template x-if>, so bail if the
      // subtree has not rendered yet. boxMounted stays false, and the `mode` watcher
      // retries the next time the learner enters the tab.
      if (this.boxMounted || !this.$refs.stage) return;
      gasbox = createGasBox();
      gasbox.mount(this.$refs.stage);
      gasbox.setVolume(this.boxV);
      gasbox.setCount(this.boxN);
      gasbox.setTemperature(this.boxT);
      this.boxMounted = true;
    },
    onTemp() { gasbox?.setTemperature(this.boxT); if (this.honors) this.updateMB(); },
    onCount() { gasbox?.setCount(this.boxN); },
    onVol() { gasbox?.setVolume(this.boxV); },

    // Relative readouts, normalized so the default state (300 K, 40 particles, V=1) reads 1.0.
    get relKE() { return this.boxT / 300; },
    get relP() { return (this.boxN / 40) * (this.boxT / 300) / this.boxV; },

    // Decision task. The scenario pins a GROUP of observations that share a setting, and
    // the generator draws one of them; the per-postulate consequences live on the drawn
    // observation, because the correct postulate varies inside a group.
    genKmt() {
      const sc = this.nextScenario('a');
      const item = quizOf(pick(sc.constraints.quiz));
      if (!item) throw new Error(`genKmt: ${sc.id} pins a KMT_QUIZ id that does not exist`);
      this.kq = { sc, item };
      this.kPick = null;
      this.kChecked = false; this.kAttempted = false; this.kDone = false; this.kVerdict = null;
    },
    pickPostulate(id) { if (!this.kDone) this.kPick = id; },
    postState(id) {
      if (!this.kChecked) return this.kPick === id ? 'on' : '';
      if (!this.kq) return '';
      if (id === this.kq.item.answer) return 'correct';
      return id === this.kPick ? 'wrong' : '';
    },
    get kAnswerText() { return this.kq ? KMT_POSTULATES.find(p => p.id === this.kq.item.answer).text : ''; },
    postShort(id) { const p = KMT_POSTULATES.find(x => x.id === id); return p ? p.short : ''; },
    kCommit() {
      if (this.kDone || !this.kq || this.kPick === null) return;
      const { sc, item } = this.kq;
      const good = this.kPick === item.answer;
      let v, minutes;
      if (good) {
        v = { tone: 'success', icon: sc.icon, state: 'CALLED IT', headline: this.postShort(item.answer),
          detail: item.consequences[this.kPick], gauge: null };
        this.kDone = true; minutes = 5;
      } else {
        // Use each postulate's own label verbatim, as U6's limiting-reactant headline does.
        // Lower-casing it turned postulate 5's short label, "KE ∝ T", into "ke ∝ t".
        v = { tone: 'fail', icon: '\u{26A0}\u{FE0F}', state: 'WRONG POSTULATE',
          headline: `${this.postShort(item.answer)}, not ${this.postShort(this.kPick)}`,
          detail: `${item.consequences[this.kPick]} ${this.kAnswerText}`, gauge: null };
        minutes = 14;
      }
      this.gRecord('a', good, !this.kAttempted);
      this.recordWorld({ icon: v.icon, tone: v.tone, text: `${sc.system}, ${good ? 'read right' : 'misread'}`, minutes });
      this.kAttempted = true; this.kChecked = true; this.kVerdict = v;
    },
    kNext() { this.genKmt(); },

    // Honors h1: speed against energy on the Maxwell-Boltzmann curve.
    get h1Unlocked() { return this.gMastered('a'); },
    genHonors1() {
      const sc = scOf('h1-speeds');
      const gA = pick(REAL_GASES);
      let gB = pick(REAL_GASES);
      while (gB.key === gA.key) gB = pick(REAL_GASES);
      const kind = pick(['ke', 'speed']);
      // At one temperature every gas carries the same average kinetic energy, so the KE
      // question always answers `same`; the speed question always answers the lighter gas.
      const correct = kind === 'ke' ? 'same' : (gA.M < gB.M ? 'a' : 'b');
      this.h1s = { sc, gA, gB, kind, correct };
      this.mbGasKey = gA.key;
      this.h1Pick = null;
      this.h1Checked = false; this.h1Attempted = false; this.h1Done = false; this.h1Verdict = null;
    },
    get h1Question() {
      if (!this.h1s) return '';
      return this.h1s.kind === 'ke'
        ? `At ${this.boxT} K, which bottle has the greater AVERAGE KINETIC ENERGY per particle?`
        : `At ${this.boxT} K, which bottle has the greater AVERAGE MOLECULAR SPEED?`;
    },
    h1PickOption(k) { if (!this.h1Done) this.h1Pick = k; },
    h1State(k) {
      if (!this.h1Checked) return this.h1Pick === k ? 'on' : '';
      if (!this.h1s) return '';
      if (k === this.h1s.correct) return 'correct';
      return k === this.h1Pick ? 'wrong' : '';
    },
    get mbCompare() {
      if (!this.h1s) return [];
      return [this.h1s.gA, this.h1s.gB].map(g => ({
        name: g.name, M: g.M, vrms: rmsSpeed(g.M, this.boxT), vmp: mostProbableSpeed(g.M, this.boxT)
      }));
    },
    h1Commit() {
      if (this.h1Done || !this.h1s || !this.h1Pick) return;
      const { sc, gA, gB, kind, correct } = this.h1s;
      const good = this.h1Pick === correct;
      const nums = kind === 'ke'
        ? `Both are at ${this.boxT} K, so both average 3RT/2 per mole.`
        : `At ${this.boxT} K, ${gA.name} runs at ${fmt(rmsSpeed(gA.M, this.boxT))} m/s rms against ${gB.name} at ${fmt(rmsSpeed(gB.M, this.boxT))} m/s.`;
      let v, minutes;
      if (good) {
        v = { tone: 'success', icon: sc.icon, state: 'READ RIGHT', headline: 'Curve read correctly',
          detail: `${sc.kinds[kind].right} ${nums}`, gauge: null };
        this.h1Done = true; minutes = 5;
      } else {
        v = { tone: 'fail', icon: '\u{26A0}\u{FE0F}', state: 'CURVE MISREAD', headline: 'Speed and energy are not the same question',
          detail: `${sc.kinds[kind].wrong} ${nums}`, gauge: null };
        minutes = 13;
      }
      this.gRecord('h1', good, !this.h1Attempted);
      this.recordWorld({ icon: v.icon, tone: v.tone, text: `${sc.system}, ${good ? 'curve read' : 'curve misread'}`, minutes });
      this.h1Attempted = true; this.h1Checked = true; this.h1Verdict = v;
      this.$nextTick(() => { this.buildCharts(); this.reapplySelects(); this.updateMB(); this.resizeCharts(); });
    },
    h1Next() { this.genHonors1(); },

    // Honors: Maxwell-Boltzmann speed distribution. Two datasets so the comparison the
    // question asks about is the thing the chart actually draws.
    get mbStats() {
      const g = REAL_GASES.find(x => x.key === this.mbGasKey) || REAL_GASES[0];
      return { name: g.name, vrms: rmsSpeed(g.M, this.boxT), vmp: mostProbableSpeed(g.M, this.boxT) };
    },
    mbData(M) {
      const pts = maxwellBoltzmann(M, this.boxT);
      return pts;
    },
    updateMB() {
      if (!mbChart) return;
      const gA = REAL_GASES.find(x => x.key === this.mbGasKey) || REAL_GASES[0];
      const gB = this.h1s ? this.h1s.gB : REAL_GASES[REAL_GASES.length - 1];
      const a = this.mbData(gA.M), b = this.mbData(gB.M);
      // Normalize both curves against ONE maximum, or the lighter gas's flatter, broader
      // curve is rescaled to the same peak height and the comparison reads backwards.
      const max = Math.max(...a.map(p => p.y), ...b.map(p => p.y)) || 1;
      mbChart.data.datasets[0].data = a.map(p => ({ x: p.x, y: p.y / max }));
      mbChart.data.datasets[0].label = `${gA.name} at ${this.boxT} K`;
      mbChart.data.datasets[1].data = gB.key === gA.key ? [] : b.map(p => ({ x: p.x, y: p.y / max }));
      mbChart.data.datasets[1].label = `${gB.name} at ${this.boxT} K`;
      mbChart.update();
    },

    // ========== C.10(B) ideal-gas relationships (dose) ==========
    get igResult() {
      return idealGasSolve({ P: +this.igP, V: +this.igV, n: +this.ign, T: +this.igT }, this.solveFor);
    },
    get igState() {
      const st = { P: +this.igP, V: +this.igV, n: +this.ign, T: +this.igT };
      st[this.solveFor] = this.igResult;
      return st;
    },
    get idealFormula() {
      return ({ P: 'P = \\dfrac{nRT}{V}', V: 'V = \\dfrac{nRT}{P}', n: 'n = \\dfrac{PV}{RT}', T: 'T = \\dfrac{PV}{nR}' })[this.solveFor];
    },
    get resultUnit() { return VAR_UNIT[this.solveFor]; },
    onIdeal() { this.updateLawChart(); if (this.honors) this.updateZ(); },

    // The scenario states three of P, V, n and T and asks for the fourth. Every drawn
    // value is snapped to 3 sig figs before the target is derived, so the number on
    // screen is the number the grading comes from.
    genIdeal() {
      const sc = this.nextScenario('b');
      const k = sc.constraints;
      const st = { P: +this.igP, V: +this.igV, n: +this.ign, T: +this.igT };
      for (const key of ['P', 'V', 'n', 'T']) if (k[key]) st[key] = draw(k[key][0], k[key][1]);
      const target = idealGasSolve(st, k.solveFor);
      st[k.solveFor] = target;
      this.solveFor = k.solveFor;
      this.igP = st.P; this.igV = st.V; this.ign = st.n; this.igT = st.T;
      this.relKey = k.rel;
      this.ig = {
        sc, solveFor: k.solveFor, given: { ...st }, target, bands: sc.bands,
        unit: VAR_UNIT[k.solveFor], label: VAR_LABEL[k.solveFor]
      };
      this.igInput = '';
      this.igChecked = false; this.igAttempted = false; this.igDone = false; this.igVerdict = null;
      this.$nextTick(() => { this.reapplySelects(); this.updateLawChart(); if (this.honors) this.updateZ(); });
    },
    // The three stated values, in P V n T order, minus the one being asked for.
    get igGivens() {
      if (!this.ig) return [];
      return ['P', 'V', 'n', 'T'].filter(k => k !== this.ig.solveFor)
        .map(k => ({ key: k, label: VAR_LABEL[k], value: this.ig.given[k], unit: VAR_UNIT[k] }));
    },
    igCommit() {
      if (this.igDone || !this.ig || this.igInput === '') return;
      const sc = this.ig.sc;
      const val = parseFloat(this.igInput);
      const unit = this.ig.unit;
      const needTxt = `${fmt(this.ig.target, 4)} ${unit}`;
      const sp = sc.spend || {};
      let v, good = false, minutes, spend = 0;
      // idealGasSolve has no input guard: a zero volume returns Infinity and any NaN in
      // gives NaN out, and outcomeBand throws on a non-finite value. Guard unit-side.
      if (!isFinite(val)) {
        v = { tone: 'fail', icon: '\u{2699}\u{FE0F}', state: 'NO NUMBER', headline: 'Nothing to act on', detail: sc.fail, gauge: null };
        minutes = 12;
      } else {
        const band = outcomeBand(val, this.ig.target, this.ig.bands);
        good = band.withinSpec;
        const yours = `${fmt(val, 4)} ${unit}`;
        const off = `${fmt(Math.abs(val - this.ig.target), 3)} ${unit}`;
        if (good) {
          v = { tone: 'success', icon: sc.icon, state: sc.safeState, headline: 'Called it',
            detail: `You called ${yours}; PV = nRT gives ${needTxt}. ${sc.safe}`, gauge: 'on' };
          this.igDone = true; minutes = 8; spend = sp.ok || 0;
        } else if (band.direction === 'low') {
          v = { tone: 'fail', icon: '\u{1F6A8}', state: sc.lowState, headline: 'Called it low',
            detail: `You called ${yours}, ${off} under the ${needTxt} the equation gives. ${sc.low}`, gauge: 'low' };
          minutes = 22; spend = sp.low || 0;
        } else {
          v = { tone: 'fail', icon: '\u{1F6A8}', state: sc.highState, headline: 'Called it high',
            detail: `You called ${yours}, ${off} over the ${needTxt} the equation gives. ${sc.high}`, gauge: 'high' };
          minutes = 22; spend = sp.high || 0;
        }
      }
      this.gRecord('b', good, !this.igAttempted);
      this.recordWorld({ icon: v.icon, tone: v.tone, text: `${sc.system}, ${good ? 'fill sized' : 'fill missed'}`, minutes, spend });
      this.igAttempted = true; this.igChecked = true; this.igVerdict = v;
      // The relationship chart plots the solved variable, so it is revealed on commit,
      // never before it, and a canvas revealed from a hidden state needs a resize.
      this.$nextTick(() => { this.reapplySelects(); this.updateLawChart(); this.resizeCharts(); });
    },
    igNext() { this.genIdeal(); },

    lawData() {
      const rel = RELATIONSHIPS.find(r => r.key === this.relKey) || RELATIONSHIPS[0];
      const s = this.igState, cur = s[rel.vary];
      const lo = Math.max(cur * 0.3, rel.vary === 'T' ? 50 : 0.2), hi = cur * 1.9;
      const curve = [];
      for (let i = 0; i <= 44; i++) {
        const x = lo + (hi - lo) * i / 44;
        const st = { P: s.P, V: s.V, n: s.n, T: s.T };
        st[rel.vary] = x;
        curve.push({ x, y: idealGasSolve(st, rel.out) });
      }
      return { rel, curve, point: [{ x: cur, y: s[rel.out] }] };
    },
    updateLawChart() {
      if (!lawChart) return;
      const { rel, curve, point } = this.lawData();
      lawChart.data.datasets[0].data = curve;
      lawChart.data.datasets[0].label = rel.name;
      lawChart.data.datasets[1].data = point;
      lawChart.options.scales.x.title.text = rel.xLabel;
      lawChart.options.scales.y.title.text = rel.yLabel;
      lawChart.update();
    },

    // Honors h2: the real-gas correction (van der Waals), as a dose.
    get h2Unlocked() { return this.gMastered('b'); },
    get rg() { return REAL_GASES.find(g => g.key === this.rgKey) || REAL_GASES[0]; },
    genHonors2() {
      const sc = scOf('h2-real');
      const gas = pick(REAL_GASES);
      // Keep V comfortably clear of n*b, or the van der Waals denominator collapses and
      // the "pressure" it returns is negative or infinite. outcomeBand throws on both.
      const n = draw(2, 6);
      const V = draw(1.2, 3.0);
      const T = draw(280, 340);
      const target = vanderWaalsPressure({ n, V, T, a: gas.a, b: gas.b });
      const ideal = idealGasSolve({ n, V, T }, 'P');
      this.rgKey = gas.key;
      this.h2s = { sc, gas, n, V, T, target, ideal, Z: target / ideal, bands: sc.bands };
      this.h2Input = '';
      this.h2Checked = false; this.h2Attempted = false; this.h2Done = false; this.h2Verdict = null;
    },
    h2Commit() {
      if (this.h2Done || !this.h2s || this.h2Input === '') return;
      const sc = this.h2s.sc;
      const val = parseFloat(this.h2Input);
      let v, good = false, minutes;
      if (!isFinite(val)) {
        v = { tone: 'fail', icon: '\u{2699}\u{FE0F}', state: 'NO NUMBER', headline: 'Nothing to correct', detail: sc.fail, gauge: null };
        minutes = 10;
      } else {
        const band = outcomeBand(val, this.h2s.target, this.h2s.bands);
        good = band.withinSpec;
        const needTxt = `${fmt(this.h2s.target, 4)} atm`;
        const yours = `${fmt(val, 4)} atm`;
        const side = this.h2s.Z < 1 ? 'below' : 'above';
        if (good) {
          v = { tone: 'success', icon: sc.icon, state: sc.safeState, headline: 'Correction holds',
            detail: `You called ${yours}; van der Waals gives ${needTxt} against an ideal ${fmt(this.h2s.ideal, 4)} atm, so this gas sits ${side} ideal here. ${sc.safe}`, gauge: 'on' };
          this.h2Done = true; minutes = 7;
        } else {
          const lowSide = band.direction === 'low';
          v = { tone: 'fail', icon: '\u{1F6A8}', state: lowSide ? sc.lowState : sc.highState,
            headline: lowSide ? 'Corrected short' : 'Corrected long',
            detail: `You called ${yours} against ${needTxt}. ${lowSide ? sc.low : sc.high}`, gauge: lowSide ? 'low' : 'high' };
          minutes = 17;
        }
      }
      this.gRecord('h2', good, !this.h2Attempted);
      this.recordWorld({ icon: v.icon, tone: v.tone, text: `${sc.system}, ${good ? 'table corrected' : 'correction wrong'}`, minutes });
      this.h2Attempted = true; this.h2Checked = true; this.h2Verdict = v;
      this.$nextTick(() => { this.buildCharts(); this.reapplySelects(); this.updateZ(); this.resizeCharts(); });
    },
    h2Next() { this.genHonors2(); },

    zData() {
      const s = this.h2s || { n: +this.ign, T: +this.igT };
      const g = this.rg, n = s.n, T = s.T;
      const vmin = n * g.b * 1.3, vmax = 50;
      // Sweep V from large to small so pressure rises, then keep only strictly increasing
      // pressure. Below the critical temperature the van der Waals isotherm has an
      // unphysical back-bending loop; dropping it leaves the clean compressibility curve.
      const real = [];
      let maxP = -Infinity;
      for (let i = 0; i <= 120; i++) {
        const V = vmax * Math.pow(vmin / vmax, i / 120);
        const P = vanderWaalsPressure({ n, V, T, a: g.a, b: g.b });
        if (P > maxP && P <= 400) { real.push({ x: P, y: (P * V) / (n * GAS_CONSTANT_R * T) }); maxP = P; }
      }
      const top = real.length ? real[real.length - 1].x : 400;
      return { real, ideal: [{ x: 0, y: 1 }, { x: top, y: 1 }] };
    },
    updateZ() {
      if (!zChart) return;
      const { real, ideal } = this.zData();
      zChart.data.datasets[0].data = real;
      zChart.data.datasets[0].label = this.rg.name + ' (real)';
      zChart.data.datasets[1].data = ideal;
      zChart.update();
    },

    // ========== C.10(C) Dalton's law of partial pressures (dose) ==========
    get dParts() {
      const comps = this.dGases.map(g => ({ name: g.name, formula: g.formula, mol: +g.mol || 0 }));
      const pp = partialPressures(comps, +this.dTotalP || 0);
      return pp.map((r, i) => ({ ...r, formula: comps[i].formula }));
    },
    get dPartsActive() { return this.dParts.filter(p => p.mol > 0); },
    get dTotalMol() { return this.dGases.reduce((s, g) => s + (+g.mol || 0), 0); },
    get dSumPartial() { return this.dParts.reduce((s, p) => s + p.partial, 0); },

    // The mixer's own table prints every partial pressure, which IS the graded answer, so
    // the whole readout is hidden until commit and the mole inputs are frozen while the
    // call is open. Both come back the moment the number is committed.
    genDalton() {
      const sc = this.nextScenario('c');
      const k = sc.constraints;
      let comps, total, depth = null, fO2 = null;
      if (k.mix === 'air') {
        const sample = draw(2, 8);
        comps = [
          { formula: 'N2', mol: snap(sample * 0.78) },
          { formula: 'O2', mol: snap(sample * 0.21) },
          { formula: 'Ar', mol: snap(sample * 0.01) }
        ];
        total = draw(k.total[0], k.total[1]);
      } else {
        fO2 = pick([0.28, 0.30, 0.32, 0.36]);
        const sample = draw(3, 9);
        comps = [
          { formula: 'N2', mol: snap(sample * (1 - fO2)) },
          { formula: 'O2', mol: snap(sample * fO2) }
        ];
        // The scenario lists the depths it draws from, so the pool stays readable from the
        // data rather than from a literal buried in here.
        if (k.depth) { depth = pick(k.depth); total = 1 + depth / 10; }
        else total = draw(k.total[0], k.total[1]);
      }
      this.dGases = DALTON_GASES.map(g => {
        const c = comps.find(x => x.formula === g.formula);
        return { ...g, mol: c ? c.mol : 0 };
      });
      this.dTotalP = total;
      const find = this.dGases.find(g => g.formula === k.find);
      const parts = partialPressures(this.dGases.map(g => ({ name: g.name, mol: g.mol })), total);
      const row = parts[this.dGases.indexOf(find)];
      this.dl = {
        sc, find, total, depth, fO2, fraction: row.fraction, target: row.partial,
        overLimit: row.partial > PPO2_LIMIT, bands: sc.bands
      };
      this.dlInput = '';
      this.dlChecked = false; this.dlAttempted = false; this.dlDone = false; this.dlVerdict = null;
    },
    dlCommit() {
      if (this.dlDone || !this.dl || this.dlInput === '') return;
      const sc = this.dl.sc;
      const val = parseFloat(this.dlInput);
      const needTxt = `${fmt(this.dl.target, 4)} atm`;
      const sp = sc.spend || {};
      let v, good = false, minutes, spend = 0;
      if (!isFinite(val)) {
        v = { tone: 'fail', icon: '\u{2699}\u{FE0F}', state: 'NO NUMBER', headline: 'Nothing to act on', detail: sc.fail, gauge: null };
        minutes = 12;
      } else {
        const band = outcomeBand(val, this.dl.target, this.dl.bands);
        good = band.withinSpec;
        const yours = `${fmt(val, 4)} atm`;
        const frac = `a mole fraction of ${fmt(this.dl.fraction, 3)} of ${fmt(this.dl.total, 4)} atm`;
        // On the depth scenario the number is only half the point: what it MEANS against
        // the 1.4 atm working limit is the other half, so the verdict says it out loud.
        const limitNote = this.dl.depth
          ? (this.dl.overLimit
            ? ` That is past the ${PPO2_LIMIT} atm working limit at ${this.dl.depth} m, so this mix does not go to that depth.`
            : ` That is inside the ${PPO2_LIMIT} atm working limit at ${this.dl.depth} m, so the depth stands.`)
          : '';
        if (good) {
          v = { tone: 'success', icon: sc.icon, state: sc.safeState, headline: 'Called it',
            detail: `You called ${yours}; ${frac} comes to ${needTxt}.${limitNote} ${sc.safe}`, gauge: 'on' };
          this.dlDone = true; minutes = 8; spend = sp.ok || 0;
        } else if (band.direction === 'low') {
          v = { tone: 'fail', icon: '\u{1F6A8}', state: sc.lowState, headline: 'Called it low',
            detail: `You called ${yours}, under the ${needTxt} that ${frac} comes to.${limitNote} ${sc.low}`, gauge: 'low' };
          minutes = 22; spend = sp.low || 0;
        } else {
          v = { tone: 'fail', icon: '\u{1F6A8}', state: sc.highState, headline: 'Called it high',
            detail: `You called ${yours}, over the ${needTxt} that ${frac} comes to.${limitNote} ${sc.high}`, gauge: 'high' };
          minutes = 22; spend = sp.high || 0;
        }
      }
      this.gRecord('c', good, !this.dlAttempted);
      this.recordWorld({ icon: v.icon, tone: v.tone, text: `${sc.system}, ${good ? 'mix called' : 'mix missed'}`, minutes, spend });
      this.dlAttempted = true; this.dlChecked = true; this.dlVerdict = v;
      // Mastering C.10(C) here is what reveals the h3 bench for the first time, and its
      // <template x-if> subtree renders with the water-temp <select x-model> binding before
      // the x-for has built its <option>s (trap 3), so the dropdown falls back to its first
      // option and reads 20 C against a brief that says 50. Re-apply once it exists.
      this.$nextTick(() => this.reapplySelects());
    },
    dlNext() { this.genDalton(); },

    // Honors h3: gas collected over water, as a dose.
    get h3Unlocked() { return this.gMastered('c'); },
    get wp() {
      const row = WATER_VP.find(r => r.tC === +this.wTemp) || WATER_VP[0];
      const pw = row.torr / 760;
      return { torr: row.torr, pw, pDry: (+this.wTotal || 0) - pw };
    },
    genHonors3() {
      const sc = scOf('h3-water');
      // Keep the dry-gas pressure well clear of zero: at 100 degrees the vapour pressure
      // IS one atmosphere, and a target of zero makes the relative band unusable.
      const row = pick(WATER_VP.filter(r => r.tC <= 60));
      const pw = row.torr / 760;
      const total = snap(pw + 0.35 + Math.random() * 0.75);
      this.wTemp = row.tC;
      this.wTotal = total;
      this.h3s = { sc, tC: row.tC, torr: row.torr, pw, total, target: total - pw, bands: sc.bands };
      this.h3Input = '';
      this.h3Checked = false; this.h3Attempted = false; this.h3Done = false; this.h3Verdict = null;
      this.$nextTick(() => this.reapplySelects());
    },
    h3Commit() {
      if (this.h3Done || !this.h3s || this.h3Input === '') return;
      const sc = this.h3s.sc;
      const val = parseFloat(this.h3Input);
      let v, good = false, minutes;
      if (!isFinite(val)) {
        v = { tone: 'fail', icon: '\u{2699}\u{FE0F}', state: 'NO NUMBER', headline: 'Nothing to report', detail: sc.fail, gauge: null };
        minutes = 10;
      } else {
        const band = outcomeBand(val, this.h3s.target, this.h3s.bands);
        good = band.withinSpec;
        const needTxt = `${fmt(this.h3s.target, 4)} atm`;
        const yours = `${fmt(val, 4)} atm`;
        const sum = `${fmt(this.h3s.total, 4)} atm total minus ${fmt(this.h3s.pw, 3)} atm of water vapour at ${this.h3s.tC} °C`;
        if (good) {
          v = { tone: 'success', icon: sc.icon, state: sc.safeState, headline: 'Dry gas reported',
            detail: `You reported ${yours}; ${sum} comes to ${needTxt}. ${sc.safe}`, gauge: 'on' };
          this.h3Done = true; minutes = 6;
        } else {
          const lowSide = band.direction === 'low';
          v = { tone: 'fail', icon: '\u{1F6A8}', state: lowSide ? sc.lowState : sc.highState,
            headline: lowSide ? 'Reported short' : 'Reported long',
            detail: `You reported ${yours} against ${needTxt}, which is ${sum}. ${lowSide ? sc.low : sc.high}`, gauge: lowSide ? 'low' : 'high' };
          minutes = 16;
        }
      }
      this.gRecord('h3', good, !this.h3Attempted);
      this.recordWorld({ icon: v.icon, tone: v.tone, text: `${sc.system}, ${good ? 'dry gas reported' : 'vapour miscounted'}`, minutes });
      this.h3Attempted = true; this.h3Checked = true; this.h3Verdict = v;
    },
    h3Next() { this.genHonors3(); },

    // ========== Capstone: the last fill of the day ==========
    get capUnlocked() { return this.gOverall() === 1; },
    genCapstone() {
      const sc = scOf('cap-lastfill');
      const depth = pick([20, 30, 40]);
      const fO2 = pick([0.28, 0.32, 0.36, 0.40]);
      const need = Math.round(30 + Math.random() * 60);   // atm of bank this fill draws
      const bankAt = this.bank;
      const abs = 1 + depth / 10;
      const ppo2 = rN(fO2 * abs, 3);
      const enough = bankAt >= need;
      const withinLimit = ppo2 <= PPO2_LIMIT + 1e-9;
      // Deterministic from the world the learner built (the bank) and the generated dive.
      const correct = !enough ? 'off' : (withinLimit ? 'send' : 'reblend');
      this.cap = { sc, depth, fO2, abs, ppo2, need, bankAt, enough, withinLimit, correct };
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
      if (this.capWin || !this.cap || !this.capPick) return;
      const c = this.cap, sc = c.sc;
      const opt = sc.options.find(o => o.key === this.capPick);
      const fig = `${Math.round(c.fO2 * 100)} percent at ${c.depth} m is ${fmt(c.abs, 3)} atm absolute, so the oxygen runs at ${fmt(c.ppo2, 3)} atm against a ${PPO2_LIMIT} atm limit. The fill draws ${c.need} atm off a bank holding ${fmt(c.bankAt)} atm.`;
      const good = this.capPick === c.correct;
      let v, minutes;
      if (good) {
        v = { tone: 'success', icon: sc.icon, state: 'RIGHT CALL', headline: 'Right call', detail: `${fig} ${opt.good}`, gauge: null };
        this.capWin = true; minutes = 10;
      } else {
        v = { tone: 'fail', icon: '\u{1F6A8}', state: 'WRONG CALL', headline: 'Wrong call', detail: `${fig} ${opt.consequence}`, gauge: null };
        minutes = 25;
      }
      this.gRecord('cap', good, !this.capAttempted);
      this.recordWorld({ icon: v.icon, tone: v.tone, text: `${sc.system}, ${good ? 'right call' : 'wrong call'}`, minutes });
      this.capAttempted = true; this.capChecked = true; this.capVerdict = v;
    },

    // ========== charts ==========
    // Every chart object is module scope, never inside Alpine's proxy. buildCharts is
    // idempotent (each branch guards on the ref existing and the chart not existing yet),
    // so it can be re-run whenever a canvas is revealed by a commit or the honors toggle.
    buildCharts() {
      if (typeof Chart === 'undefined') return;
      if (this.$refs.lawCanvas && !lawChart) {
        lawChart = lineChart(this.$refs.lawCanvas, {
          datasets: [
            { label: 'curve', data: [], borderColor: '#2a7d8a', backgroundColor: '#2a7d8a', borderWidth: 2, pointRadius: 0, tension: 0.25 },
            { label: 'current state', data: [], showLine: false, borderColor: '#1c2a31', backgroundColor: '#1c2a31', pointRadius: 6, pointHoverRadius: 7 }
          ], xTitle: 'Volume (L)', yTitle: 'Pressure (atm)'
        });
        this.updateLawChart();
      }
      if (this.$refs.mbCanvas && !mbChart) {
        mbChart = lineChart(this.$refs.mbCanvas, {
          datasets: [
            { label: 'gas A', data: [], borderColor: '#c0772f', backgroundColor: 'rgba(192,119,47,.12)', borderWidth: 2, pointRadius: 0, fill: true, tension: 0.3 },
            { label: 'gas B', data: [], borderColor: '#2a7d8a', backgroundColor: 'rgba(42,125,138,.10)', borderWidth: 2, pointRadius: 0, fill: true, tension: 0.3 }
          ],
          xTitle: 'Molecular speed (m/s)', yTitle: 'Relative number of particles'
        });
        this.updateMB();
      }
      if (this.$refs.zCanvas && !zChart) {
        zChart = lineChart(this.$refs.zCanvas, {
          datasets: [
            { label: 'real', data: [], borderColor: '#c0772f', backgroundColor: '#c0772f', borderWidth: 2, pointRadius: 0, tension: 0.25 },
            { label: 'ideal (Z = 1)', data: [], borderColor: '#9fb6bf', borderWidth: 1.5, borderDash: [6, 4], pointRadius: 0 }
          ], xTitle: 'Pressure (atm)', yTitle: 'Z = PV/nRT', beginAtZero: false
        });
        this.updateZ();
      }
    },
    resizeCharts() { lawChart?.resize(); mbChart?.resize(); zChart?.resize(); }
  };
}
