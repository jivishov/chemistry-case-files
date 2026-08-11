// main.js: Unit 6 view-model (Alpine data factory). Wires model + engine to the UI.
import { REACTIONS, STRUCTURAL_TYPES, SUBTYPES, SCENARIOS } from './model.js';
import {
  molarMass, atomTally, isBalanced, isLowestTerms,
  limitingReactant, moleRatio, percentYield, fmt, MOLAR_VOLUME_STP, AVOGADRO
} from '../../../shared/js/chem.js';
import { speciesColor } from '../../../shared/js/render.js';
import { createGame, outcomeBand } from '../../../shared/js/game.js';

const STATE = { s: '(s)', l: '(l)', g: '(g)', aq: '(aq)' };

export const SE = [
  { id: 'a',  code: 'C.9(A)', mode: 'balance',  honors: false, text: 'Interpret, write, and balance equations using conservation of mass.' },
  { id: 'b',  code: 'C.9(B)', mode: 'classify', honors: false, text: 'Differentiate acid-base, precipitation, and redox reactions.' },
  { id: 'c',  code: 'C.9(C)', mode: 'stoich',   honors: false, text: 'Perform stoichiometric calculations: mass, gas volume, percent yield.' },
  { id: 'd',  code: 'C.9(D)', mode: 'lr',       honors: false, text: 'Describe and apply the concept of limiting reactants.' },
  { id: 'h1', code: 'Honors', mode: 'stoich',   honors: true,  text: 'Count particles with Avogadro’s number, a C.8 crossover beyond C.9.' },
  { id: 'h2', code: 'Honors', mode: 'lr',       honors: true,  text: 'Recover the excess reactant left once the limiting one is spent.' }
];

// Mastery targets. Built from shared/js/game.js's createGame contract, NOT from
// GAMIFICATION.md's API block, which omits `honors` and would silently put honors
// skills into the capstone gate.
const skills = [
  { id: 'a',   code: 'C.9(A)',   label: 'Balance it',         target: 3 },
  { id: 'b',   code: 'C.9(B)',   label: 'Classify it',        target: 3 },
  { id: 'c',   code: 'C.9(C)',   label: 'Size the dose',      target: 3 },
  { id: 'd',   code: 'C.9(D)',   label: 'Limiting reactant',  target: 3 },
  { id: 'h1',  code: 'Honors',   label: 'Particle counts',    target: 2, honors: true },
  { id: 'h2',  code: 'Honors',   label: 'Excess recovery',    target: 2, honors: true },
  { id: 'cap', code: 'Capstone', label: 'The tanker',         target: 1, honors: true }
];

// ---- world-state constants: the truck, the clock, and the county's tanker ----
const START_SODA = 50;      // kg of soda ash on the engine at the start of the shift
const SHIFT_START = 6 * 60; // the rotation starts at 06:00
const AID_CAP = 180;        // kg the county's mutual-aid truck can bring

const pick = a => a[(Math.random() * a.length) | 0];
const rN = (x, d = 2) => { const f = 10 ** d; return Math.round(x * f) / f; };
const rand = (lo, hi, d = 0) => rN(lo + Math.random() * (hi - lo), d);

// Limiting-reactant cells that satisfy the generator rule, built once at module load.
// The rule is measured, not chosen: sweeping both reactant masses from 5 g to 40 g in
// 5 g steps across the nine two-reactant reactions gives 576 cells, and 13 of them put
// the wrong-reactant error under 5 percent, where no band can separate it. Requiring
// the excess reactant to sit at least 25 percent over what the limiting one consumes
// leaves 515 cells and ZERO under 5 percent; the smallest surviving error is 25.3
// percent, so the 3 percent band cannot be reached off the wrong reactant.
const LR_CELLS = {};
for (const r of REACTIONS.filter(x => x.reactants.length === 2)) {
  const [A, B] = r.reactants;
  const cells = [];
  for (let ma = 5; ma <= 40; ma += 5) for (let mb = 5; mb <= 40; mb += 5) {
    const amounts = { [A.f]: ma, [B.f]: mb };
    const res = limitingReactant(r, amounts);
    const excess = res.leftover.find(l => !l.isLimiting);
    if (excess && excess.mol0 >= 1.25 * excess.used) cells.push(amounts);
  }
  LR_CELLS[r.id] = cells;
}

const rxnOf = id => REACTIONS.find(r => r.id === id);
const scOf = id => SCENARIOS.find(s => s.id === id);

export function createSim() {
  return {
    ...createGame({ unitId: '06-reactions-stoichiometry', skills }),
    REACTIONS, STRUCTURAL_TYPES, SUBTYPES, SE, fmt,
    honors: false,
    mode: 'balance',

    // ---- world-state: soda ash on the truck + the incident clock (session-local) ----
    soda: START_SODA,
    clockMin: 0,
    worldLog: [],
    _wid: 0,
    scIdx: { a: -1, b: -1, c: -1, d: -1 },

    // ---- stage state ----
    bal: null, balR: [], balP: [], balAnswerShown: false,
    balChecked: false, balAttempted: false, balDone: false, balVerdict: null,

    cl: null, clStructural: null, clSubs: [],
    clChecked: false, clAttempted: false, clDone: false, clVerdict: null,

    st: null, stInput: '',
    stChecked: false, stAttempted: false, stDone: false, stVerdict: null,

    lm: null, lmPick: null, lmInput: '', lmActual: '',
    lmChecked: false, lmAttempted: false, lmDone: false, lmVerdict: null,

    h1s: null, h1Input: '',
    h1Checked: false, h1Attempted: false, h1Done: false, h1Verdict: null,

    h2s: null, h2Input: '',
    h2Checked: false, h2Attempted: false, h2Done: false, h2Verdict: null,

    cap: null, capPick: null, capChecked: false, capAttempted: false,
    capWin: false, capVerdict: null,

    init() {
      this.gLoad();
      this.genBalance();
      this.genClassify();
      this.genStoich();
      this.genLr();
      this.genHonors1();
      this.genHonors2();
    },

    setMode(m) {
      this.mode = m;
      // Re-draw the capstone if the truck's load has moved since it was generated,
      // because the load is half of what makes the call correct. Without this the panel
      // can show a stale "on your truck" figure after the learner runs more calls, and
      // the stage's whole claim (the world you built decides the answer) stops holding.
      // Once it is won it freezes, so a win is never taken away.
      const stale = this.cap && !this.capWin && this.cap.onTruck !== this.soda;
      if (m === 'capstone' && this.capUnlocked && (!this.cap || stale)) this.genCapstone();
    },

    resetProgress() {
      this.gReset();
      this.soda = START_SODA; this.clockMin = 0; this.worldLog = [];
      this.scIdx = { a: -1, b: -1, c: -1, d: -1 };
      this.genBalance(); this.genClassify(); this.genStoich(); this.genLr();
      this.genHonors1(); this.genHonors2();
      this.cap = null; this.capWin = false; this.capVerdict = null;
    },

    // ---------- shared helpers ----------
    label(sp) { return sp.f + ' ' + STATE[sp.state]; },
    color(f) { return speciesColor(f); },
    range(n) { return Array.from({ length: n }); },

    // ---- scenario plumbing ----
    nextScenario(skill) {
      const list = SCENARIOS.filter(s => s.skill === skill);
      const i = (this.scIdx[skill] = (this.scIdx[skill] ?? -1) + 1) % list.length;
      return list[i];
    },
    // Advance the incident clock and spend reagent off the truck. A wrong call costs
    // roughly three times the minutes of a right one, which is the feedback loop: the
    // spill does not wait while you re-run the arithmetic. Only calls that actually
    // commit reagent carry a spend; a NEGATIVE spend is reagent recovered and booked
    // back in, which is what the h2 honors bench is for, capped at the starting load.
    recordWorld({ icon, tone, text, minutes, spend = 0 }) {
      this.clockMin += minutes;
      this.soda = rN(Math.max(0, Math.min(START_SODA, this.soda - spend)), 1);
      this.worldLog.unshift({ id: ++this._wid, icon, tone, text: `${this.clockLabel} ${text}` });
      if (this.worldLog.length > 6) this.worldLog.pop();
    },
    get clockLabel() {
      const t = SHIFT_START + this.clockMin;
      return `${String(Math.floor(t / 60) % 24).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;
    },
    get sodaPct() { return Math.max(0, Math.min(100, this.soda / START_SODA * 100)); },
    get sodaMood() { return this.soda >= START_SODA * 0.5 ? '\u{1F642}' : this.soda >= START_SODA * 0.2 ? '\u{1F630}' : '\u{1F635}'; },
    get sodaState() {
      if (this.soda >= START_SODA * 0.5) return 'Truck stocked';
      if (this.soda >= START_SODA * 0.2) return 'Truck running low';
      return 'Truck is dry, the next call goes unanswered';
    },
    get sodaColor() { return this.soda >= START_SODA * 0.5 ? 'var(--success)' : this.soda >= START_SODA * 0.2 ? 'var(--warn)' : 'var(--danger)'; },
    // Reagent bags still on the engine, one token per 5 kg.
    get sodaBags() { return Array.from({ length: Math.ceil(this.soda / 5) }); },

    seCaption(se) {
      if (this.gMastered(se.id)) return 'Mastered';
      const sk = this.g_skills[se.id];
      const def = this.g_skillDefs.find(d => d.id === se.id) || {};
      return `${sk ? sk.run : 0} of ${def.target || 3} correct in a row`;
    },

    // ===================== C.9(A) balance the equation =====================
    // Identity task. The commit condition is the existing isBalanced/isLowest pair;
    // what is new is that getting there is recorded, and that revealing the answer
    // costs the run rather than being free.
    genBalance() {
      const sc = this.nextScenario('a');
      const rxn = rxnOf(sc.constraints.reaction);
      this.bal = { sc, rxn };
      this.balR = rxn.reactants.map(() => 1);
      this.balP = rxn.products.map(() => 1);
      this.balAnswerShown = false;
      this.balChecked = false; this.balAttempted = false; this.balDone = false; this.balVerdict = null;
    },
    get balReactants() { return this.bal ? this.bal.rxn.reactants.map((s, i) => ({ ...s, c: +this.balR[i] || 0 })) : []; },
    get balProducts() { return this.bal ? this.bal.rxn.products.map((s, i) => ({ ...s, c: +this.balP[i] || 0 })) : []; },
    get balElements() {
      if (!this.bal) return [];
      const L = atomTally(this.balReactants), R = atomTally(this.balProducts);
      const keys = [...new Set([...Object.keys(L), ...Object.keys(R)])].sort();
      return keys.map(k => ({ el: k, left: L[k] || 0, right: R[k] || 0, ok: (L[k] || 0) === (R[k] || 0) }));
    },
    get isBalanced() { return this.bal ? isBalanced(this.balReactants, this.balProducts) : false; },
    get isLowest() { return this.bal ? isLowestTerms(this.balReactants, this.balProducts) : false; },
    resetBalance() { if (this.bal && !this.balDone) { this.balR = this.bal.rxn.reactants.map(() => 1); this.balP = this.bal.rxn.products.map(() => 1); } },
    // Revealing the key is kept: it is a genuinely useful scaffold. It costs the run,
    // so it is a scaffold rather than a way past the gate.
    showAnswer() {
      if (!this.bal || this.balDone) return;
      const sc = this.bal.sc;
      this.balR = this.bal.rxn.reactants.map(s => s.c);
      this.balP = this.bal.rxn.products.map(s => s.c);
      this.balAnswerShown = true;
      this.gRecord('a', false, !this.balAttempted);
      this.balAttempted = true;
      this.balVerdict = { tone: 'warn', icon: '\u{1F4D6}', state: 'READ FROM THE BOOK',
        headline: 'You looked it up', detail: `The coefficients are on the page now, but this one does not count toward the run. ${sc.wrong}`, gauge: null };
      this.recordWorld({ icon: '\u{1F4D6}', tone: 'warn', text: `${sc.system}, looked up`, minutes: 12 });
    },
    balCommit() {
      if (this.balDone || !this.bal || this.balAnswerShown) return;
      const sc = this.bal.sc;
      const good = this.isBalanced && this.isLowest;
      let v, minutes;
      if (good) {
        v = { tone: 'success', icon: sc.icon, state: sc.safeState, headline: 'Balanced', detail: sc.correct, gauge: null };
        this.balDone = true; minutes = 7;
      } else if (this.isBalanced) {
        v = { tone: 'warn', icon: '\u{2696}\u{FE0F}', state: 'NOT LOWEST TERMS', headline: 'Atoms balance, coefficients do not reduce',
          detail: `Every element tallies, but the coefficients share a common factor. An equation is not written until it is in the smallest whole numbers. ${sc.wrong}`, gauge: null };
        minutes = 15;
      } else {
        v = { tone: 'fail', icon: '\u{1F6A8}', state: sc.failState, headline: 'Not balanced', detail: sc.wrong, gauge: null };
        minutes = 18;
      }
      this.gRecord('a', good, !this.balAttempted);
      this.recordWorld({ icon: v.icon, tone: v.tone, text: `${sc.system}, ${good ? 'balanced' : 'not balanced'}`, minutes });
      this.balAttempted = true; this.balChecked = true; this.balVerdict = v;
    },
    balNext() { this.genBalance(); },

    // ===================== C.9(B) classify the reaction =====================
    // Decision task. Core now covers the sub-classification: C.9(B) reads
    // "differentiate among acid-base reactions, precipitation reactions, and
    // oxidation-reduction reactions", which IS the sub-type grid, so it cannot sit
    // behind the Honors toggle.
    genClassify() {
      const sc = this.nextScenario('b');
      const rxn = rxnOf(sc.constraints.reaction);
      this.cl = { sc, rxn };
      this.clStructural = null; this.clSubs = [];
      this.clChecked = false; this.clAttempted = false; this.clDone = false; this.clVerdict = null;
    },
    pickStructural(t) { if (!this.clDone) this.clStructural = t; },
    toggleSub(s) {
      if (this.clDone) return;
      const i = this.clSubs.indexOf(s);
      i >= 0 ? this.clSubs.splice(i, 1) : this.clSubs.push(s);
    },
    structuralState(t) {
      if (!this.clChecked) return this.clStructural === t ? 'on' : '';
      if (!this.cl) return '';
      if (t === this.cl.rxn.structural) return 'correct';
      return t === this.clStructural ? 'wrong' : '';
    },
    subState(s) {
      if (!this.cl) return '';
      const should = this.cl.rxn.subs.includes(s), chosen = this.clSubs.includes(s);
      if (!this.clChecked) return chosen ? 'on' : '';
      if (should) return 'correct';
      return chosen ? 'wrong' : '';
    },
    clCommit() {
      if (this.clDone || !this.cl || !this.clStructural) return;
      const sc = this.cl.sc, rxn = this.cl.rxn;
      const structOk = this.clStructural === rxn.structural;
      const subsOk = [...rxn.subs].sort().join() === [...this.clSubs].sort().join();
      const good = structOk && subsOk;
      const subList = rxn.subs.join(' and ').toLowerCase();
      let v, minutes, spend;
      if (good) {
        v = { tone: 'success', icon: sc.icon, state: 'CALLED IT', headline: `${rxn.structural}, and ${subList}`,
          detail: sc.consequences[this.clStructural], gauge: null };
        this.clDone = true; minutes = 6; spend = 0;
      } else if (!structOk) {
        v = { tone: 'fail', icon: '\u{1F6A8}', state: 'WRONG CLASS', headline: 'Wrong reaction type',
          detail: `${sc.consequences[this.clStructural]} It was ${rxn.structural.toLowerCase()}.`, gauge: null };
        minutes = 17; spend = sc.spendWrong || 0;
      } else {
        v = { tone: 'fail', icon: '\u{1F6A8}', state: 'WRONG SUB-TYPE', headline: 'Right type, wrong chemistry underneath',
          detail: `${rxn.structural} is right, but the sub-classification is not: this one is ${subList}. That is the half that tells you what the products do once they are in the ditch.`, gauge: null };
        minutes = 15; spend = sc.spendWrong || 0;
      }
      this.gRecord('b', good, !this.clAttempted);
      this.recordWorld({ icon: v.icon, tone: v.tone, text: `${sc.system}, ${good ? 'classified' : 'misclassified'}`, minutes, spend });
      this.clAttempted = true; this.clChecked = true; this.clVerdict = v;
    },
    clNext() { this.genClassify(); },

    // ===================== C.9(C) stoichiometry (dose) =====================
    // The scenario pins a NON-1:1 (given, find) pair, so the mole ratio is always
    // load-bearing, and it never pins propane's C3H8/CO2 pair, whose molar masses are
    // 0.2 percent apart and would let a wrong-mass answer land inside `ideal` by luck.
    // The worked solution stays, but it is hidden until commit: the tool must not
    // compute the graded answer for the learner.
    genStoich() {
      const sc = this.nextScenario('c');
      const k = sc.constraints;
      const rxn = rxnOf(k.reaction);
      const species = [...rxn.reactants, ...rxn.products];
      const given = species.find(s => s.f === k.given);
      const find = species.find(s => s.f === k.find);
      const [lo, hi] = k.amount || [20, 180];
      // fmt() prints 3 significant figures, so a raw 8437 would DISPLAY as 8440 and the
      // learner would be graded against a number they were never shown. Snap the draw to
      // 3 sig figs first, so what is on screen is exactly what the target derives from.
      const amount = Number(rand(lo, hi, 0).toPrecision(3));
      const givenMol = amount / molarMass(given.f);
      const findMol = moleRatio(given, find, givenMol);
      this.st = {
        sc, rxn, given, find, amount, givenMol, findMol,
        mGiven: molarMass(given.f), mFind: molarMass(find.f),
        target: findMol * molarMass(find.f),
        gasL: find.state === 'g' ? findMol * MOLAR_VOLUME_STP : null,
        bands: sc.bands
      };
      this.stInput = '';
      this.stChecked = false; this.stAttempted = false; this.stDone = false; this.stVerdict = null;
    },
    stCommit() {
      if (this.stDone || !this.st || this.stInput === '') return;
      const sc = this.st.sc;
      const val = parseFloat(this.stInput);
      const needTxt = `${fmt(this.st.target)} g ${this.st.find.f}`;
      // No reagent leaves the truck on these three: the commit is a number called in
      // (ventilation, a stage-back, an exclusion zone). What a wrong call costs is time.
      let v, good = false, minutes, spend = 0;
      if (!isFinite(val)) {
        v = { tone: 'fail', icon: '\u{2699}\u{FE0F}', state: 'NO NUMBER', headline: 'Nothing to act on',
          detail: sc.fail, gauge: null };
        minutes = 14;
      } else {
        const band = outcomeBand(val, this.st.target, this.st.bands);
        good = band.withinSpec;
        const yours = `${fmt(val)} g`;
        const off = `${fmt(Math.abs(val - this.st.target))} g`;
        if (good) {
          v = { tone: 'success', icon: sc.icon, state: sc.safeState, headline: 'Called it',
            detail: `You called ${yours}; it works out to ${needTxt}. ${sc.safe}`, gauge: 'on' };
          this.stDone = true; minutes = 8;
        } else if (band.direction === 'low') {
          v = { tone: 'fail', icon: '\u{1F6A8}', state: sc.lowState, headline: 'Called it low',
            detail: `You called ${yours}, ${off} under the ${needTxt} it actually comes to. ${sc.low}`, gauge: 'low' };
          minutes = 20;
        } else {
          v = { tone: 'fail', icon: '\u{1F6A8}', state: sc.highState, headline: 'Called it high',
            detail: `You called ${yours}, ${off} over the ${needTxt} it actually comes to. ${sc.high}`, gauge: 'high' };
          minutes = 20;
        }
      }
      this.gRecord('c', good, !this.stAttempted);
      this.recordWorld({ icon: v.icon, tone: v.tone, text: `${sc.system}, ${good ? 'dose called' : 'dose missed'}`, minutes, spend });
      this.stAttempted = true; this.stChecked = true; this.stVerdict = v;
    },
    stNext() { this.genStoich(); },

    // ===================== C.9(D) limiting reactant (dose + decision) =====================
    // Both halves must be right: WHICH reactant runs out, and what the reaction can
    // actually make. The masses come from the pre-computed cell table, so the excess
    // is always at least 25 percent over what the limiting reactant consumes and the
    // wrong-reactant answer can never land inside the band.
    genLr() {
      const sc = this.nextScenario('d');
      const rxn = rxnOf(sc.constraints.reaction);
      // A one-reactant reaction has no cell table and nothing to limit, so a scenario
      // that pinned one would render the brief over a stage that cannot be answered.
      // Fail loudly here rather than silently at `pick(undefined)` three frames later.
      const cells = LR_CELLS[rxn.id];
      if (!cells || !cells.length) throw new Error(`genLr: ${sc.id} pins ${rxn.id}, which is not a two-reactant reaction`);
      const amounts = pick(cells);
      const res = limitingReactant(rxn, amounts);
      this.lm = {
        sc, rxn, amounts, res,
        limiting: res.limiting,
        product: res.products[0],
        target: res.products[0].grams,
        excess: res.leftover.find(l => !l.isLimiting),
        gasProducts: rxn.products.filter(p => p.state === 'g'),
        bands: sc.bands
      };
      this.lmPick = null; this.lmInput = ''; this.lmActual = '';
      this.lmChecked = false; this.lmAttempted = false; this.lmDone = false; this.lmVerdict = null;
    },
    lmPickLimiting(f) { if (!this.lmDone) this.lmPick = f; },
    lmPickState(f) {
      if (!this.lmChecked) return this.lmPick === f ? 'on' : '';
      if (!this.lm) return '';
      if (f === this.lm.limiting) return 'correct';
      return f === this.lmPick ? 'wrong' : '';
    },
    get lmViz() {
      if (!this.lm) return { before: [], after: [] };
      const { rxn, amounts, res } = this.lm;
      const init = {};
      rxn.reactants.forEach(s => (init[s.f] = (amounts[s.f] || 0) / molarMass(s.f)));
      const mols = [...Object.values(init), ...res.products.map(p => p.mol), ...res.leftover.map(l => l.molLeft)];
      const maxMol = Math.max(...mols, 1e-9);
      const tc = m => (m <= 1e-9 ? 0 : Math.min(12, Math.max(1, Math.round((m / maxMol) * 12))));
      const before = rxn.reactants.map(s => ({
        f: s.f, color: speciesColor(s.f), mol: init[s.f], n: tc(init[s.f]), limiting: s.f === res.limiting
      }));
      const after = [];
      res.leftover.forEach(l => { if (l.molLeft > 1e-9) after.push({ f: l.f, color: speciesColor(l.f), mol: l.molLeft, n: tc(l.molLeft), kind: 'excess left over' }); });
      res.products.forEach(p => after.push({ f: p.f, color: speciesColor(p.f), mol: p.mol, n: tc(p.mol), kind: 'product formed' }));
      return { before, after };
    },
    get lmPercentYield() { return this.lm ? percentYield(parseFloat(this.lmActual) || 0, this.lm.target) : 0; },
    gasVolume(prodFormula) {
      if (!this.lm) return 0;
      const p = this.lm.res.products.find(x => x.f === prodFormula);
      return p ? p.mol * MOLAR_VOLUME_STP : 0;
    },
    lmCommit() {
      if (this.lmDone || !this.lm || !this.lmPick || this.lmInput === '') return;
      const sc = this.lm.sc;
      const val = parseFloat(this.lmInput);
      const pickOk = this.lmPick === this.lm.limiting;
      const needTxt = `${fmt(this.lm.target)} g ${this.lm.product.f}`;
      // Only the ditch scenario actually lays reagent, so `spend` is per-scenario data.
      const sp = sc.spend || {};
      let v, good = false, minutes, spend = 0;
      if (!isFinite(val)) {
        v = { tone: 'fail', icon: '\u{2699}\u{FE0F}', state: 'NO NUMBER', headline: 'Nothing to act on',
          detail: sc.fail, gauge: null };
        minutes = 14;
      } else {
        const band = outcomeBand(val, this.lm.target, this.lm.bands);
        good = pickOk && band.withinSpec;
        const yours = `${fmt(val)} g`;
        const off = `${fmt(Math.abs(val - this.lm.target))} g`;
        if (good) {
          v = { tone: 'success', icon: sc.icon, state: sc.safeState, headline: `${this.lm.limiting} runs out first`,
            detail: `You called ${yours} and it comes to ${needTxt}. ${sc.safe}`, gauge: 'on' };
          this.lmDone = true; minutes = 9; spend = sp.ok || 0;
        } else if (!pickOk) {
          v = { tone: 'fail', icon: '\u{1F6A8}', state: 'WRONG REACTANT', headline: `${this.lm.limiting} is what runs out, not ${this.lmPick}`,
            detail: `Work the yield off ${this.lm.limiting} and it comes to ${needTxt}. Off ${this.lmPick}, which is still sitting there in excess when the reaction stops, you get a number the reaction was never going to reach. ${sc.high}`, gauge: band.withinSpec ? null : band.direction };
          minutes = 22; spend = sp.high || 0;
        } else if (band.direction === 'low') {
          v = { tone: 'fail', icon: '\u{1F6A8}', state: sc.lowState, headline: 'Right reactant, yield too low',
            detail: `${this.lm.limiting} is the one that runs out, so that half is right. But you called ${yours}, ${off} under the ${needTxt} it makes. ${sc.low}`, gauge: 'low' };
          minutes = 20; spend = sp.low || 0;
        } else {
          v = { tone: 'fail', icon: '\u{1F6A8}', state: sc.highState, headline: 'Right reactant, yield too high',
            detail: `${this.lm.limiting} is the one that runs out, so that half is right. But you called ${yours}, ${off} over the ${needTxt} it makes. ${sc.high}`, gauge: 'high' };
          minutes = 20; spend = sp.high || 0;
        }
      }
      this.gRecord('d', good, !this.lmAttempted);
      this.recordWorld({ icon: v.icon, tone: v.tone, text: `${sc.system}, ${good ? 'yield called' : 'yield missed'}`, minutes, spend });
      this.lmAttempted = true; this.lmChecked = true; this.lmVerdict = v;
    },
    lmNext() { this.genLr(); },

    // ===================== Honors h1 (parent c): particle counts =====================
    get h1Unlocked() { return this.gMastered('c'); },
    genHonors1() {
      const sc = scOf('h1-particles');
      const rxn = pick(REACTIONS);
      const species = [...rxn.reactants, ...rxn.products];
      const target = pick(species);
      const grams = rand(10, 120, 0);
      const mol = grams / molarMass(target.f);
      this.h1s = { sc, rxn, species: target, grams, mol, mass: molarMass(target.f), target: mol * AVOGADRO, bands: sc.bands };
      this.h1Input = '';
      this.h1Checked = false; this.h1Attempted = false; this.h1Done = false; this.h1Verdict = null;
    },
    h1Commit() {
      if (this.h1Done || !this.h1s || this.h1Input === '') return;
      const sc = this.h1s.sc;
      const val = parseFloat(this.h1Input);
      let v, good = false, minutes;
      if (!isFinite(val) || val <= 0) {
        v = { tone: 'fail', icon: '\u{2699}\u{FE0F}', state: 'NO COUNT', headline: 'Nothing to file', detail: sc.fail, gauge: null };
        minutes = 10;
      } else {
        const band = outcomeBand(val, this.h1s.target, this.h1s.bands);
        good = band.withinSpec;
        const needTxt = `${this.h1s.target.toExponential(3)} particles`;
        const yours = `${val.toExponential(3)}`;
        if (good) {
          v = { tone: 'success', icon: sc.icon, state: sc.safeState, headline: 'Count filed',
            detail: `You filed ${yours}; the mass works out to ${needTxt}. ${sc.safe}`, gauge: 'on' };
          this.h1Done = true; minutes = 6;
        } else {
          const lowSide = band.direction === 'low';
          v = { tone: 'fail', icon: '\u{1F6A8}', state: lowSide ? sc.lowState : sc.highState,
            headline: lowSide ? 'Count too low' : 'Count too high',
            detail: `You filed ${yours} against ${needTxt}. ${lowSide ? sc.low : sc.high}`, gauge: lowSide ? 'low' : 'high' };
          minutes = 16;
        }
      }
      this.gRecord('h1', good, !this.h1Attempted);
      this.recordWorld({ icon: v.icon, tone: v.tone, text: `${sc.system}, ${good ? 'count filed' : 'count rejected'}`, minutes });
      this.h1Attempted = true; this.h1Checked = true; this.h1Verdict = v;
    },
    h1Next() { this.genHonors1(); },

    // ===================== Honors h2 (parent d): excess recovered =====================
    get h2Unlocked() { return this.gMastered('d'); },
    genHonors2() {
      const sc = scOf('h2-recovery');
      const rxn = pick(REACTIONS.filter(r => r.reactants.length === 2));
      const amounts = pick(LR_CELLS[rxn.id]);
      const res = limitingReactant(rxn, amounts);
      const excess = res.leftover.find(l => !l.isLimiting);
      this.h2s = { sc, rxn, amounts, res, excess, limiting: res.limiting, target: excess.gramsLeft, bands: sc.bands };
      this.h2Input = '';
      this.h2Checked = false; this.h2Attempted = false; this.h2Done = false; this.h2Verdict = null;
    },
    h2Commit() {
      if (this.h2Done || !this.h2s || this.h2Input === '') return;
      const sc = this.h2s.sc;
      const val = parseFloat(this.h2Input);
      // A correct recovery is the one call on the rotation that puts reagent BACK on
      // the truck, which is why the honors bench is worth running before the capstone.
      let v, good = false, minutes, spend = 0;
      if (!isFinite(val)) {
        v = { tone: 'fail', icon: '\u{2699}\u{FE0F}', state: 'NO FIGURE', headline: 'Nothing to book in', detail: sc.fail, gauge: null };
        minutes = 10;
      } else {
        const band = outcomeBand(val, this.h2s.target, this.h2s.bands);
        good = band.withinSpec;
        const needTxt = `${fmt(this.h2s.target)} g of ${this.h2s.excess.f}`;
        const yours = `${fmt(val)} g`;
        if (good) {
          v = { tone: 'success', icon: sc.icon, state: sc.safeState, headline: 'Booked back in',
            detail: `You booked ${yours}; ${needTxt} is what is actually left once ${this.h2s.limiting} is spent. ${sc.safe}`, gauge: 'on' };
          this.h2Done = true; minutes = 6; spend = -2;
        } else {
          const lowSide = band.direction === 'low';
          v = { tone: 'fail', icon: '\u{1F6A8}', state: lowSide ? sc.lowState : sc.highState,
            headline: lowSide ? 'Booked back short' : 'Booked back long',
            detail: `You booked ${yours} against ${needTxt}. ${lowSide ? sc.low : sc.high}`, gauge: lowSide ? 'low' : 'high' };
          minutes = 16;
        }
      }
      this.gRecord('h2', good, !this.h2Attempted);
      this.recordWorld({ icon: v.icon, tone: v.tone, text: `${sc.system}, ${good ? 'recovery booked' : 'recovery wrong'}`, minutes, spend });
      this.h2Attempted = true; this.h2Checked = true; this.h2Verdict = v;
    },
    h2Next() { this.genHonors2(); },

    // ===================== Capstone: the tanker call =====================
    get capUnlocked() { return this.gOverall() === 1; },
    genCapstone() {
      const sc = scOf('cap-tanker');
      const rxn = rxnOf('neutralize');
      const acid = rxn.reactants[0], base = rxn.reactants[1];
      // The spill is generated; what the truck holds is whatever the shift left in it.
      // Both feed one defensible call, which is the point of the stage.
      const spill = rand(15, 260, 0);                     // kg of HCl in the ditch
      const needed = rN(moleRatio(acid, base, spill / molarMass(acid.f)) * molarMass(base.f), 1);
      const onTruck = this.soda;
      const enough = needed <= onTruck;
      const withinAid = needed <= AID_CAP;
      const correct = enough ? 'lay' : (withinAid ? 'hold' : 'withdraw');
      this.cap = { sc, rxn, acid, base, spill, needed, onTruck, enough, withinAid, correct };
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
      const sc = this.cap.sc;
      const opt = sc.options.find(o => o.key === this.capPick);
      const fig = `${fmt(this.cap.spill)} kg of ${this.cap.acid.f} in the ditch takes ${fmt(this.cap.needed)} kg of ${this.cap.base.f}, and you have ${fmt(this.cap.onTruck)} kg on the truck. Mutual aid can bring ${AID_CAP} kg.`;
      const good = this.capPick === this.cap.correct;
      let v, minutes;
      if (good) {
        v = { tone: 'success', icon: sc.icon, state: 'RIGHT CALL', headline: 'Right call',
          detail: `${fig} ${opt.good}`, gauge: null };
        this.capWin = true; minutes = 10;
      } else {
        v = { tone: 'fail', icon: '\u{1F6A8}', state: 'WRONG CALL', headline: 'Wrong call',
          detail: `${fig} ${opt.consequence}`, gauge: null };
        minutes = 25;
      }
      this.gRecord('cap', good, !this.capAttempted);
      this.recordWorld({ icon: v.icon, tone: v.tone, text: `${sc.system}, ${good ? 'right call' : 'wrong call'}`, minutes });
      this.capAttempted = true; this.capChecked = true; this.capVerdict = v;
    }
  };
}
