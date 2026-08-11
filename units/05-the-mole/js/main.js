// main.js — Unit 5 view-model (The Mole, TEKS C.8), Scenario-layer reference.
// Wires the model + engine + the shared game framework. Each task is an authentic
// brief whose committed result drives a real-world consequence (GAMIFICATION design
// rule 0): the factor-label chain, percent check, and formula steppers are the tools;
// committing produces a verdict (outcomeBand for dose tasks, per-option/constructed
// consequences for decision/identity tasks) that feeds a session-local world-state log.
// Outcomes are primary; XP/streak are a quiet line; per-TEKS mastery meters track learning.
import { SE, SUBSTANCES, FORMULA_POOL, HYDRATES, COMBUSTION, SCENARIOS } from './model.js';
import { sceneArt } from './art.js';
import {
  molarMass, percentComposition, parseFormula, ATOMIC_MASS, AVOGADRO,
  empiricalFormula, combustionFormula, fmt
} from '../../../shared/js/chem.js';
import { createGame, outcomeBand } from '../../../shared/js/game.js';

const pick = a => a[(Math.random() * a.length) | 0];
const shuffle = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
const rN = (x, n) => { const p = 10 ** n; return Math.round(x * p) / p; };
const absClose = (a, b, tol) => Math.abs(a - b) <= tol;
const AVO_TEXT = '6.022 × 10²³';      // 6.022 x 10^23, for tile labels
const mm = M => M.toFixed(2);
// Build a formula string from {el: subscript}; 1s are implicit (C1 -> C).
const sub1 = n => (n > 1 ? n : '');

// Factor tiles (numerator / denominator with units that must cancel).
const molgFwd = M => ({ numV: M, numU: 'g', numText: mm(M) + ' g', denV: 1, denU: 'mol', denText: '1 mol' });           // g per mol  (mol -> g)
const molgInv = M => ({ numV: 1, numU: 'mol', numText: '1 mol', denV: M, denU: 'g', denText: mm(M) + ' g' });           // mol per g  (g -> mol)
const avoFwd = () => ({ numV: AVOGADRO, numU: 'particles', numText: AVO_TEXT + ' units', denV: 1, denU: 'mol', denText: '1 mol' });   // units per mol
const avoInv = () => ({ numV: 1, numU: 'mol', numText: '1 mol', denV: AVOGADRO, denU: 'particles', denText: AVO_TEXT + ' units' });   // mol per unit

const skills = [
  { id: 'a',  code: 'C.8(A)', label: 'Mass and moles',       target: 3 },
  { id: 'b',  code: 'C.8(B)', label: 'Moles and particles',  target: 3 },
  { id: 'c',  code: 'C.8(C)', label: 'Percent composition',  target: 3 },
  { id: 'd',  code: 'C.8(D)', label: 'Empirical/molecular',  target: 3 },
  { id: 'h1', code: 'Honors', label: 'Hydrate recovery',     target: 2, honors: true },
  { id: 'h2', code: 'Honors', label: 'Combustion analysis',  target: 2, honors: true },
  { id: 'cap', code: 'Capstone', label: 'Food-grade audit',  target: 1, honors: true }
];

export { SE };

export function createSim() {
  return {
    ...createGame({ unitId: '05-the-mole', skills }),
    SE, fmt,
    honors: false,
    mode: 'molg',

    // ---- world-state: the crew you keep alive (session-local; the primary feedback).
    // Crew safety starts full and dents on emergencies (a good run heals it back); `sol`
    // is the voyage day; the ship's log is a vivid feed of what your numbers did. All of
    // this clears on reset; per-TEKS mastery persists separately in localStorage.
    crew: 100,
    sol: 0,
    worldLog: [],
    lastVerdict: null,
    _wid: 0,
    // scenario rotation per skill, so a 3-in-a-row run walks all of a skill's contexts
    scIdx: { a: -1, b: -1, c: -1, d: -1 },

    // ---- stage state ----
    cv: null, cvChain: [], cvChecked: false, cvAttempted: false, cvDone: false, cvVerdict: null,
    pc: null, pcInput: '', pcDecision: null, pcChecked: false, pcAttempted: false, pcDone: false, pcVerdict: null,
    fo: null, fEmp: {}, fN: 1, foChecked: false, foAttempted: false, foDone: false, foVerdict: null,
    hy: null, hyX: 1, hyChecked: false, hyAttempted: false, hyDone: false, hyVerdict: null,
    cb: null, cbSub: { C: 0, H: 0, O: 0 }, cbChecked: false, cbAttempted: false, cbDone: false, cbVerdict: null,
    cap: null, capEmp: {}, capN: 1, capInput: '', capPick: null, capChecked: false, capAttempted: false, capWin: false, capVerdict: null,

    init() {
      this.gLoad();
      this.genConversion('molg');
      this.genPercent();
      this.genFormula();
      this.genHydrate();
      this.genCombustion();
    },

    setMode(m) {
      this.mode = m;
      // only re-roll a converter order when actually entering a different kind, so
      // re-clicking the active tab does not wipe an in-progress chain
      if ((m === 'molg' || m === 'particles') && (!this.cv || this.cv.kind !== m)) this.genConversion(m);
      if (m === 'capstone' && this.gOverall() === 1 && !this.cap) this.genCapstone();
    },

    resetProgress() {
      this.gReset();
      this.crew = 100; this.sol = 0;
      this.worldLog = [];
      this.scIdx = { a: -1, b: -1, c: -1, d: -1 };
      this.clearOutcome();
      this.genConversion(this.mode === 'particles' ? 'particles' : 'molg');
      this.genPercent(); this.genFormula(); this.genHydrate(); this.genCombustion();
      this.cap = null; this.capWin = false;
    },

    // ---- scenario layer plumbing ----
    nextScenario(skill) {
      const list = SCENARIOS.filter(s => s.skill === skill);
      const i = (this.scIdx[skill] = (this.scIdx[skill] ?? -1) + 1) % list.length;
      return list[i];
    },
    // advance a sol, dent or heal crew safety, and prepend a vivid feed line (newest first)
    recordWorld({ icon, tone, text, delta }) {
      this.sol++;
      this.crew = Math.max(0, Math.min(100, this.crew + (delta || 0)));
      this.worldLog.unshift({ id: ++this._wid, icon, tone, text: `Sol ${this.sol}: ${text}` });
      if (this.worldLog.length > 6) this.worldLog.pop();
    },
    get crewMood() { return this.crew >= 67 ? '\u{1F642}' : this.crew >= 34 ? '\u{1F630}' : '\u{1F635}'; },
    get crewState() { return this.crew >= 67 ? 'Crew safe' : this.crew >= 34 ? 'Crew strained' : 'Crew in danger'; },
    clearOutcome() {
      this.cvVerdict = null; this.pcVerdict = null; this.foVerdict = null;
      this.hyVerdict = null; this.cbVerdict = null; this.capVerdict = null;
      this.lastVerdict = null;
    },
    // mission illustration for the active scenario (rendered atop each brief card)
    scArt(id) { return sceneArt(id); },
    // stage-specific brief helpers (the scenario behind the active task)
    get cvBrief() { return this.cv && this.cv.sc; },
    get pcBrief() { return this.pc && this.pc.sc; },
    get foBrief() { return this.fo && this.fo.sc; },
    get hyBrief() { return this.hy && this.hy.sc; },
    get cbBrief() { return this.cb && this.cb.sc; },
    get capBrief() { return this.cap && this.cap.sc; },

    seCaption(se) {
      if (this.gMastered(se.id)) return 'Mastered';
      const sk = this.g_skills[se.id];
      const def = this.g_skillDefs.find(d => d.id === se.id) || {};
      return `${sk ? sk.run : 0} of ${def.target || 3} correct in a row`;
    },
    MM(f) { return molarMass(f); },

    // ===================== C.8(A)/(B) convert the ship's reading, then act =====================
    // The ship gives a reading in one unit; the system needs it in another. The learner
    // builds the factor-label chain to convert it. The committed value is graded against
    // what the ship actually needs: on target keeps the crew safe; too little / too much is
    // a named emergency; a chain that never resolves means the system sat idle.
    genConversion(stage) {
      const skill = stage === 'molg' ? 'a' : 'b';
      const sc = this.nextScenario(skill);
      const { formula, from, to } = sc.constraints;
      const sub = SUBSTANCES.find(s => s.f === formula) || { f: formula, name: formula };
      const M = molarMass(formula);
      // distractor molar mass must differ by a clear margin (>10%), so a wrong-mass tile
      // that still cancels lands clearly too high/low rather than near the true amount
      const others = SUBSTANCES.filter(s => Math.abs(molarMass(s.f) - M) / M > 0.1);
      const wrongM = molarMass(pick(others).f);

      // net source -> target factor, source unit, the reading range, and the tiles
      let factor, srcUnit, specs, gval;
      if (from === 'mol' && to === 'g')              { factor = M;            srcUnit = 'mol'; specs = [molgFwd(M), molgInv(M), molgFwd(wrongM)];          gval = rN(0.1 + Math.random() * 4.4, 2); }
      else if (from === 'g' && to === 'mol')         { factor = 1 / M;        srcUnit = 'g';   specs = [molgInv(M), molgFwd(M), molgInv(wrongM)];          gval = rN(40 + Math.random() * 280, 1); }
      else if (from === 'mol' && to === 'particles') { factor = AVOGADRO;     srcUnit = 'mol'; specs = [avoFwd(), avoInv(), molgFwd(M)];                    gval = rN(0.4 + Math.random() * 4.5, 2); }
      else                                           { factor = AVOGADRO / M; srcUnit = 'g';   specs = [molgInv(M), avoFwd(), molgFwd(M), molgInv(wrongM)]; gval = rN(40 + Math.random() * 240, 1); }

      // trueValue is derived from the rounded reading, so a correct chain lands on it exactly
      const trueValue = gval * factor;
      const tiles = shuffle(specs).map((s, i) => ({ id: 't' + i, ...s }));
      const explain = `Cancel ${srcUnit === 'g' ? 'grams' : 'moles'} so the chain resolves to ${this.unitLabel(to)}: ${fmt(gval)} ${this.unitLabel(srcUnit)} resolves to ${fmt(trueValue)} ${this.unitLabel(to)}.`;
      this.cv = { sc, kind: stage, skill, sub, M, given: { value: gval, unit: srcUnit },
        targetUnit: to, trueValue, tiles, explain, bands: sc.bands };
      this.cvChain = []; this.cvChecked = false; this.cvAttempted = false; this.cvDone = false; this.cvVerdict = null;
    },

    get cvSteps() {
      const out = { steps: [], unit: null, value: 0, ok: true, reached: false };
      if (!this.cv) return out;
      let unit = this.cv.given.unit, value = this.cv.given.value, ok = true;
      for (const id of this.cvChain) {
        const tile = this.cv.tiles.find(t => t.id === id); if (!tile) continue;
        const cancels = tile.denU === unit;
        if (cancels) { value = value * tile.numV / tile.denV; unit = tile.numU; } else { ok = false; }
        out.steps.push({ tile, cancels });
      }
      out.unit = unit; out.value = value; out.ok = ok;
      out.reached = ok && this.cvChain.length > 0 && unit === this.cv.targetUnit;
      return out;
    },
    unitLabel(u) { return u === 'particles' ? 'representative units' : u; },
    cvAdd(id) { if (!this.cvDone) { this.cvChain.push(id); this.cvChecked = false; } },
    cvUndo() { if (!this.cvDone) { this.cvChain.pop(); this.cvChecked = false; } },
    cvClear() { if (!this.cvDone) { this.cvChain = []; this.cvChecked = false; } },
    cvShip() {
      if (this.cvDone || this.cvChain.length === 0) return;
      const s = this.cvSteps;
      const sc = this.cv.sc;
      const tgt = this.unitLabel(this.cv.targetUnit);
      const needTxt = `${fmt(this.cv.trueValue)} ${tgt}`;
      let v, good = false, delta;

      if (!s.reached) {
        // the chain must cancel to the target unit before the system can act on it
        v = { tone: 'fail', icon: '\u{2699}\u{FE0F}', state: 'CALC STALLED', headline: 'Numbers did not resolve',
          detail: `${sc.fail} ${this.cv.explain}`, gauge: null };
        delta = -5;
      } else {
        const band = outcomeBand(s.value, this.cv.trueValue, this.cv.bands); // your value vs what the ship needs
        good = band.withinSpec;
        const dev = `${Math.abs((s.value - this.cv.trueValue) / this.cv.trueValue * 100).toFixed(0)}%`;
        const yourTxt = `${fmt(s.value)} ${tgt}`;
        if (good) {
          v = { tone: 'success', icon: sc.icon, state: sc.safeState, headline: 'On target',
            detail: `You delivered ${yourTxt}, right on the ${needTxt} the ship needed. ${sc.safe}`, gauge: 'on' };
          this.cvDone = true; delta = 6;
        } else if (band.direction === 'low') {
          v = { tone: 'fail', icon: '\u{1F6A8}', state: sc.lowState, headline: 'Too little',
            detail: `You delivered ${yourTxt}, ${dev} short of the ${needTxt} needed. ${sc.low}`, gauge: 'low' };
          delta = -12;
        } else {
          v = { tone: 'fail', icon: '\u{1F6A8}', state: sc.highState, headline: 'Too much',
            detail: `You delivered ${yourTxt}, ${dev} over the ${needTxt} needed. ${sc.high}`, gauge: 'high' };
          delta = -12;
        }
      }
      this.gRecord(this.cv.skill, good, !this.cvAttempted);
      this.recordWorld({ icon: v.icon, tone: v.tone, text: `${sc.system}, ${v.state.toLowerCase()}`, delta });
      this.cvAttempted = true; this.cvChecked = true; this.cvVerdict = v; this.lastVerdict = v;
    },
    cvNext() { this.genConversion(this.cv.kind); },

    // ===================== C.8(C) percent composition (decision) =====================
    genPercent() {
      const sc = this.nextScenario('c');
      const { formula, element } = sc.constraints;
      const sub = SUBSTANCES.find(s => s.f === formula) || { f: formula, name: formula };
      const comp = percentComposition(formula);
      const target = comp.find(c => c.el === element) || comp[0];
      const theo = target.percent;
      const tol = 1.5;                                   // percent (absolute) accept window
      const within = Math.random() < 0.5;
      let measured;
      if (within) {
        measured = theo + (Math.random() * 2 - 1) * (tol - 0.4);   // clearly inside
      } else {
        const gap = tol + 1.5 + Math.random() * 4;                 // clearly outside
        const canUp = theo + gap <= 99.5, canDown = theo - gap >= 0.5;
        const up = canUp && (!canDown || Math.random() < 0.5);
        measured = up ? theo + gap : theo - gap;
      }
      measured = rN(Math.min(99.5, Math.max(0.5, measured)), 2);
      this.pc = { sc, sub, comp, target, theo, measured, tol, within, correctKey: within ? 'accept' : 'reject' };
      this.pcInput = ''; this.pcDecision = null; this.pcChecked = false; this.pcAttempted = false; this.pcDone = false; this.pcVerdict = null;
    },
    get pcInputOk() { return absClose(parseFloat(this.pcInput), this.pc.theo, 0.3); },
    pcPick(d) { if (!this.pcDone) this.pcDecision = d; },
    pcDecState(d) {
      if (!this.pcChecked) return this.pcDecision === d ? 'on' : '';
      if (d === this.pc.correctKey) return 'correct';
      if (d === this.pcDecision) return 'wrong';
      return '';
    },
    pcCertify() {
      if (this.pcDone || !this.pcDecision || this.pcInput === '') return;
      const sc = this.pc.sc;
      const el = this.pc.target.el;
      const opt = sc.options.find(o => o.key === this.pcDecision);
      const gap = Math.abs(this.pc.measured - this.pc.theo);
      const dirTxt = this.pc.measured < this.pc.theo ? 'low' : 'high';
      // quantified figure that fronts every decision verdict
      const fig = `The label reads ${this.pc.measured}% ${el}, but the real value works out to ${fmt(this.pc.theo)}% ${el}, ${fmt(gap)} points ${dirTxt}.`;
      let v, good = false, delta, feed;
      if (!this.pcInputOk) {
        v = { tone: 'warn', icon: '\u{2699}\u{FE0F}', state: 'RECHECK', headline: 'Your math is off',
          detail: `Your percent for ${el} is off, so you cannot trust the call yet. The real value is ${fmt(this.pc.theo)}% ${el}.`, gauge: null };
        delta = -5; feed = `${sc.system}, miscalculated`;
      } else if (this.pcDecision === this.pc.correctKey) {
        good = true;
        v = { tone: 'success', icon: sc.icon, state: 'GOOD CALL', headline: 'Right call', detail: `${fig} ${opt.good}`, gauge: null };
        this.pcDone = true; delta = 6; feed = `${sc.system}, good call`;
      } else {
        v = { tone: 'fail', icon: '\u{1F6A8}', state: 'WRONG CALL', headline: 'Wrong call', detail: `${fig} ${opt.consequence}`, gauge: null };
        delta = -12; feed = `${sc.system}, wrong call`;
      }
      this.gRecord('c', good, !this.pcAttempted);
      this.recordWorld({ icon: v.icon, tone: v.tone, text: feed, delta });
      this.pcAttempted = true; this.pcChecked = true; this.pcVerdict = v; this.lastVerdict = v;
    },
    pcNext() { this.genPercent(); },

    // ===================== C.8(D) empirical + molecular (identity) =====================
    genFormula() {
      const sc = this.nextScenario('d');
      const pool = sc.constraints && sc.constraints.pool
        ? FORMULA_POOL.filter(p => sc.constraints.pool.includes(p.name))
        : FORMULA_POOL;
      const item = pick(pool);
      const molMap = parseFormula(item.molecular);
      const els = Object.keys(molMap);
      const sampleMol = rN(0.05 + Math.random() * 0.45, 2);
      const grams = {}, moles = {};
      for (const el of els) { grams[el] = rN(sampleMol * molMap[el] * ATOMIC_MASS[el], 3); moles[el] = grams[el] / ATOMIC_MASS[el]; }
      const emp = empiricalFormula(els.map(el => ({ el, moles: moles[el] })));
      const empMap = {}; emp.forEach(p => (empMap[p.el] = p.n));
      const empMass = emp.reduce((s, p) => s + ATOMIC_MASS[p.el] * p.n, 0);
      const molMass = molarMass(item.molecular);
      this.fo = { sc, item, els, grams, moles, empMap, empMass, molMass, nCorrect: Math.round(molMass / empMass) };
      this.fEmp = {}; els.forEach(el => (this.fEmp[el] = 1));
      this.fN = 1; this.foChecked = false; this.foAttempted = false; this.foDone = false; this.foVerdict = null;
    },
    get foMinMol() { return Math.min(...this.fo.els.map(el => this.fo.moles[el])); },
    foRatio(el) { return this.fo.moles[el] / this.foMinMol; },
    fEmpStep(el, d) { if (!this.foDone) { this.fEmp[el] = Math.max(1, Math.min(12, this.fEmp[el] + d)); this.foChecked = false; } },
    fNStep(d) { if (!this.foDone) { this.fN = Math.max(1, Math.min(12, this.fN + d)); this.foChecked = false; } },
    get foEmpOk() { return this.fo.els.every(el => this.fEmp[el] === this.fo.empMap[el]); },
    get foMolOk() { return this.fN === this.fo.nCorrect; },
    get foStudentEmp() { return this.fo.els.map(el => el + sub1(this.fEmp[el])).join(''); },
    get foStudentMol() { return this.fo.els.map(el => el + sub1(this.fEmp[el] * this.fN)).join(''); },
    foCertify() {
      if (this.foDone) return;
      const sc = this.fo.sc;
      const ok = this.foEmpOk && this.foMolOk;
      let v;
      if (ok) {
        v = { tone: 'success', icon: sc.icon, state: 'IDENTIFIED', headline: 'Identified', detail: `It is ${this.fo.item.name} (${this.fo.item.molecular}), ${sc.success}`, gauge: null };
        this.foDone = true;
        this.recordWorld({ icon: sc.icon, tone: 'success', text: `${sc.system}, identified`, delta: 6 });
      } else {
        v = { tone: 'fail', icon: '\u{2753}', state: 'NO MATCH', headline: 'No match', detail: `${sc.fail} It was actually ${this.fo.item.molecular} (${this.fo.item.name}).`, gauge: null };
        this.recordWorld({ icon: '\u{1F6A8}', tone: 'fail', text: `${sc.system}, misidentified`, delta: -12 });
      }
      this.gRecord('d', ok, !this.foAttempted);
      this.foAttempted = true; this.foChecked = true; this.foVerdict = v; this.lastVerdict = v;
    },
    foNext() { this.genFormula(); },

    // ===================== Honors: hydrate recovery (h1) =====================
    genHydrate() {
      const sc = SCENARIOS.find(s => s.id === 'h1-desiccant');
      const h = pick(HYDRATES);
      const Manh = molarMass(h.anhydrous), Mw = molarMass('H2O');
      const moles = rN(0.02 + Math.random() * 0.18, 3);
      const massAnh = rN(moles * Manh, 3);
      const massHyd = rN(massAnh + moles * h.x * Mw, 3);
      const waterLost = rN(massHyd - massAnh, 3);
      const xCorrect = Math.round((waterLost / Mw) / (massAnh / Manh));
      this.hy = { sc, h, Manh, Mw, massAnh, massHyd, waterLost, xCorrect };
      this.hyX = 1; this.hyChecked = false; this.hyAttempted = false; this.hyDone = false; this.hyVerdict = null;
    },
    hyStep(d) { if (!this.hyDone) { this.hyX = Math.max(1, Math.min(12, this.hyX + d)); this.hyChecked = false; } },
    hyCertify() {
      if (this.hyDone) return;
      const sc = this.hy.sc;
      const ok = this.hyX === this.hy.xCorrect;
      let v;
      if (ok) {
        v = { tone: 'success', icon: sc.icon, state: 'WATER RECOVERED', headline: 'Water recovered', detail: `x = ${this.hy.xCorrect}. ${sc.success}`, gauge: null };
        this.hyDone = true;
        this.recordWorld({ icon: sc.icon, tone: 'success', text: `${sc.system}, water recovered`, delta: 6 });
      } else {
        v = { tone: 'fail', icon: '\u{1F6A8}', state: 'WATER LOST', headline: 'Setpoint off', detail: `${sc.fail} The correct value is x = ${this.hy.xCorrect}.`, gauge: null };
        this.recordWorld({ icon: '\u{1F6A8}', tone: 'fail', text: `${sc.system}, water lost`, delta: -12 });
      }
      this.gRecord('h1', ok, !this.hyAttempted);
      this.hyAttempted = true; this.hyChecked = true; this.hyVerdict = v; this.lastVerdict = v;
    },
    hyNext() { this.genHydrate(); },

    // ===================== Honors: combustion analysis (h2) =====================
    genCombustion() {
      const sc = SCENARIOS.find(s => s.id === 'h2-arson');
      const c = pick(COMBUSTION);
      const molMap = parseFormula(c.molecular);
      const sampleMol = rN(0.02 + Math.random() * 0.13, 3);
      const massCO2 = rN(sampleMol * molMap.C * molarMass('CO2'), 3);
      const massH2O = rN(sampleMol * (molMap.H / 2) * molarMass('H2O'), 3);
      const sampleMass = c.hasO ? rN(sampleMol * molarMass(c.molecular), 3) : null;
      const emp = combustionFormula({ massCO2, massH2O, sampleMass });
      const empMap = {}; emp.forEach(p => (empMap[p.el] = p.n));
      this.cb = { sc, c, massCO2, massH2O, sampleMass, empMap, empStr: emp.map(p => p.el + sub1(p.n)).join('') };
      this.cbSub = { C: 0, H: 0, O: 0 }; this.cbChecked = false; this.cbAttempted = false; this.cbDone = false; this.cbVerdict = null;
    },
    cbStep(el, d) { if (!this.cbDone) { this.cbSub[el] = Math.max(0, Math.min(12, this.cbSub[el] + d)); this.cbChecked = false; } },
    get cbOk() { return ['C', 'H', 'O'].every(el => (this.cb.empMap[el] || 0) === this.cbSub[el]); },
    get cbStudentStr() { return ['C', 'H', 'O'].filter(el => this.cbSub[el] > 0).map(el => el + sub1(this.cbSub[el])).join('') || '?'; },
    cbCertify() {
      if (this.cbDone) return;
      const sc = this.cb.sc;
      const ok = this.cbOk;
      let v;
      if (ok) {
        v = { tone: 'success', icon: sc.icon, state: 'FUEL IDENTIFIED', headline: 'Fuel identified', detail: `${sc.success} Empirical formula ${this.cb.empStr}.`, gauge: null };
        this.cbDone = true;
        this.recordWorld({ icon: sc.icon, tone: 'success', text: `${sc.system}, fuel identified`, delta: 6 });
      } else {
        v = { tone: 'fail', icon: '\u{2753}', state: 'NO MATCH', headline: 'No match', detail: `${sc.fail} The empirical formula was ${this.cb.empStr}.`, gauge: null };
        this.recordWorld({ icon: '\u{1F6A8}', tone: 'fail', text: `${sc.system}, no match`, delta: -12 });
      }
      this.gRecord('h2', ok, !this.cbAttempted);
      this.cbAttempted = true; this.cbChecked = true; this.cbVerdict = v; this.lastVerdict = v;
    },
    cbNext() { this.genCombustion(); },

    // ===================== Capstone: connected food-grade audit =====================
    get capUnlocked() { return this.gOverall() === 1; },
    genCapstone() {
      const sc = SCENARIOS.find(s => s.id === 'cap-pod');
      const foodNames = ['glucose', 'acetic acid', 'hydrogen peroxide', 'water'];
      const foodPool = FORMULA_POOL.filter(p => foodNames.includes(p.name));
      const item = pick(foodPool);
      const molMap = parseFormula(item.molecular);
      const els = Object.keys(molMap);
      const sampleMol = rN(0.05 + Math.random() * 0.35, 2);
      const grams = {}, moles = {};
      for (const el of els) { grams[el] = rN(sampleMol * molMap[el] * ATOMIC_MASS[el], 3); moles[el] = grams[el] / ATOMIC_MASS[el]; }
      const emp = empiricalFormula(els.map(el => ({ el, moles: moles[el] })));
      const empMap = {}; emp.forEach(p => (empMap[p.el] = p.n));
      const empMass = emp.reduce((s, p) => s + ATOMIC_MASS[p.el] * p.n, 0);
      const molMass = molarMass(item.molecular);
      // the shipment label is right (~60%) or wrong (~40%)
      const labelWrong = Math.random() < 0.4;
      const others = foodPool.filter(p => p.name !== item.name);
      const claimed = labelWrong && others.length ? pick(others) : item;
      // purity assay on one element (irrelevant when the label is already wrong -> reject)
      const comp = percentComposition(item.molecular);
      const targetEl = pick(comp);
      const theo = targetEl.percent, tol = 1.5;
      const purityPass = labelWrong ? true : Math.random() < 0.5;
      let measured;
      if (purityPass) measured = theo + (Math.random() * 2 - 1) * (tol - 0.4);
      else {
        const gap = tol + 1.5 + Math.random() * 4;
        const canUp = theo + gap <= 99.5, canDown = theo - gap >= 0.5;
        const up = canUp && (!canDown || Math.random() < 0.5);
        measured = up ? theo + gap : theo - gap;
      }
      measured = rN(Math.min(99.5, Math.max(0.5, measured)), 2);
      const correctAction = labelWrong ? 'reject' : (purityPass ? 'approve' : 'quarantine');
      this.cap = { sc, item, claimed, labelWrong, els, grams, moles, empMap, empMass, molMass,
        nCorrect: Math.round(molMass / empMass), comp, targetEl, theo, tol, measured, purityPass, correctAction };
      this.capEmp = {}; els.forEach(el => (this.capEmp[el] = 1));
      this.capN = 1; this.capInput = ''; this.capPick = null;
      this.capChecked = false; this.capAttempted = false; this.capWin = false; this.capVerdict = null;
    },
    capStepEmp(el, d) { if (!this.capWin) { this.capEmp[el] = Math.max(1, Math.min(12, this.capEmp[el] + d)); this.capChecked = false; } },
    capStepN(d) { if (!this.capWin) { this.capN = Math.max(1, Math.min(12, this.capN + d)); this.capChecked = false; } },
    capPickAction(k) { if (!this.capWin) this.capPick = k; },
    capActionState(k) {
      if (!this.capChecked) return this.capPick === k ? 'on' : '';
      if (k === this.cap.correctAction) return 'correct';
      if (k === this.capPick) return 'wrong';
      return '';
    },
    capActionWord(k) { return k === 'approve' ? 'approved' : k === 'quarantine' ? 'quarantined' : 'rejected'; },
    get capEmpOk() { return this.cap.els.every(el => this.capEmp[el] === this.cap.empMap[el]); },
    get capMolOk() { return this.capN === this.cap.nCorrect; },
    get capFormulaOk() { return this.capEmpOk && this.capMolOk; },
    get capPurityInputOk() { return absClose(parseFloat(this.capInput), this.cap.theo, 0.3); },
    get capStudentMol() { return this.cap.els.map(el => el + sub1(this.capEmp[el] * this.capN)).join(''); },
    capCertify() {
      if (this.capWin || !this.capPick) return;
      const sc = this.cap.sc;
      const opt = sc.options.find(o => o.key === this.capPick);
      // a quantified read of where the pod actually stands (identity + purity)
      const idTxt = this.cap.labelWrong
        ? `The manifest claims ${this.cap.claimed.name}, but the data resolves to ${this.cap.item.molecular} (${this.cap.item.name}), so the contents are wrong.`
        : `The data confirms ${this.cap.item.molecular} (${this.cap.item.name}).`;
      const purTxt = this.cap.labelWrong
        ? ''
        : ` Purity read ${this.cap.measured}% ${this.cap.targetEl.el} vs the ${fmt(this.cap.theo)}% spec, so purity ${this.cap.purityPass ? 'passes' : 'fails'}.`;
      const fig = `${idTxt}${purTxt}`;
      let v, good = false, delta, feed;
      if (!this.capFormulaOk) {
        v = { tone: 'warn', icon: '\u{2699}\u{FE0F}', state: 'IDENTIFY FIRST', headline: 'Identify it first', detail: `Derive the molecular formula before you act. The pod holds ${this.cap.item.molecular} (${this.cap.item.name}).`, gauge: null };
        delta = -5; feed = `${sc.system}, contents not identified`;
      } else if (!this.capPurityInputOk) {
        v = { tone: 'warn', icon: '\u{2699}\u{FE0F}', state: 'RECHECK', headline: 'Purity math off', detail: `Recheck the percent before you act. The real value is ${fmt(this.cap.theo)}% ${this.cap.targetEl.el}.`, gauge: null };
        delta = -5; feed = `${sc.system}, purity miscalculated`;
      } else if (this.capPick === this.cap.correctAction) {
        good = true;
        v = { tone: 'success', icon: sc.icon, state: 'POD HANDLED', headline: 'Right call', detail: `${fig} ${opt.good}`, gauge: null };
        this.capWin = true; delta = 6;
        feed = `${sc.system}, ${this.capActionWord(this.capPick)} correctly`;
      } else {
        v = { tone: 'fail', icon: '\u{1F6A8}', state: 'WRONG CALL', headline: 'Wrong call', detail: `${fig} ${opt.consequence}`, gauge: null };
        delta = -12; feed = `${sc.system}, wrong call`;
      }
      this.gRecord('cap', good, !this.capAttempted);
      this.recordWorld({ icon: v.icon, tone: v.tone, text: feed, delta });
      this.capAttempted = true; this.capChecked = true; this.capVerdict = v; this.lastVerdict = v;
    }
  };
}
