// main.js - Unit 6 view-model (Reactions & Stoichiometry, C.9). Alpine data factory.
//
// The units_new build: units/06-reactions-stoichiometry rendered in the mission-cockpit
// shell. Unit 6 arrived from the Scenario-layer retrofit already working -- it exports
// SCENARIOS, spreads createGame, calls gRecord and runs a world-state with verdicts -- so
// the chemistry, the bands, the commit handlers and every line of consequence text are
// copied exactly as they were. The port adds presentation plumbing only:
//   * unitId 'units_new/06-reactions-stoichiometry', so progress never collides with the
//     old build's localStorage (porting trap 10)
//   * the cockpit readouts the mission screen and the status rail bind to (activeBrief,
//     activeVerdict, activeTone, activeArtId, activeStationName, activeStateLabel,
//     activeOutcomeText, activeReference, coreSkills, teksMasteredCount, scArt)
//   * screenOf / claimScreen / releaseScreen, the per-bench claim on the one mission
//     screen -- see the block comment on it. The stoich and lr benches each carry a core
//     commit AND an Honors commit, which is porting traps 3 and 17 exactly.
//   * truckReadings, four honest meters for the rail's `systems` area (porting trap 13),
//     and the two counters they are derived from.
// No band, verdict, consequence, scenario or generator rule is changed by the port. In
// particular LR_CELLS below is byte-identical to the source's: see its own comment.
//
// Nothing here re-paths. Both trees sit one level under the repo root, so
// units/<slug>/js/ and units_new/<slug>/js/ are the same three levels from shared/.
import { REACTIONS, STRUCTURAL_TYPES, SUBTYPES, SCENARIOS } from './model.js';
import { sceneArt } from './art.js';
import {
  molarMass, atomTally, isBalanced, isLowestTerms,
  limitingReactant, moleRatio, percentYield, fmt, MOLAR_VOLUME_STP, AVOGADRO
} from '../../../shared/js/chem.js';
import { speciesColor } from '../../../shared/js/render.js';
import { createGame, outcomeBand } from '../../../shared/js/game.js';

const STATE = { s: '(s)', l: '(l)', g: '(g)', aq: '(aq)' };

// The standards map. It lives in this file rather than in model.js because that is where
// the worksheet build put it, and the cockpit reads it unchanged: HANDOFF-U6.md's claim
// that "Unit 6 has no SE export" is stale, it is exported right here and the worksheet
// index.html already bound to it. coreSkills below just filters it, so the g_skillDefs
// fallback that brief proposes is not needed.
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
const START_SODA = 50;      // kg of caustic soda on the engine at the start of the shift
const SHIFT_START = 6 * 60; // the rotation starts at 06:00
const AID_CAP = 180;        // kg the county's mutual-aid truck can bring
// A volunteer rotation is 06:00 to 18:00. Nothing grades off this; it is only the
// denominator the rail's Shift meter drains against, so a run of wrong calls visibly eats
// the day the same way it visibly eats the truck.
const ROTATION = 12 * 60;

// Fallback for the header's active-station line, used only before a bench has generated
// its first scenario. After that the scenario's own `system` is the better name: it says
// which call you are standing on rather than which tab is open.
const STATION_NAME = {
  balance: 'Balance', classify: 'Classify', stoich: 'Stoichiometry',
  lr: 'Limiting reactant', capstone: 'The tanker'
};

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
    ...createGame({ unitId: 'units_new/06-reactions-stoichiometry', skills }),
    REACTIONS, STRUCTURAL_TYPES, SUBTYPES, SE, fmt,
    honors: false,
    mode: 'balance',
    // Standards tracking collapses to one header badge that expands on demand. Session
    // only: nothing about a popover is worth persisting.
    teksOpen: false,

    // Which scenario and which verdict own the mission screen, per bench.
    //
    // The screen shows ONE scenario and ONE verdict, and two of this unit's benches carry
    // two commits: `stoich` has the C.9(C) dose and the Honors particle count, `lr` has
    // the C.9(D) call and the Honors excess recovery. Each has its own scenario, its own
    // banner and its own consequence. Porting trap 3 says the verdict has to follow
    // recency or whichever commit loses a fixed precedence can never be read; trap 17
    // says the SCENARIO has to follow it too, or activeArtId always resolves to the core
    // scenario and the h1 / h2 banners are drawn and never seen.
    //
    // So a commit claims its bench's screen and a "Next ..." button releases it. The
    // release is asymmetric on purpose, see releaseScreen().
    screenOf: { balance: null, classify: null, stoich: null, lr: null, capstone: null },

    // ---- world-state: caustic soda on the truck + the incident clock (session-local) ----
    soda: START_SODA,
    clockMin: 0,
    // Two counters for the rail's meters. worldLog caps at six entries, so the rotation's
    // running totals cannot be derived from it. Presentation only: nothing grades off
    // either of them.
    calls: 0,
    rightCalls: 0,
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
      this.calls = 0; this.rightCalls = 0; this._wid = 0;
      this.screenOf = { balance: null, classify: null, stoich: null, lr: null, capstone: null };
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
    // A commit takes the bench's mission screen: its scenario, its banner, its verdict.
    claimScreen(mode, sc, v, honors) { this.screenOf[mode] = { sc, v, honors: !!honors }; },
    // A regenerate gives it back -- asymmetrically, and the asymmetry is the whole point.
    //
    // A CORE regenerate always takes the screen. The shell hides the console's .brief
    // card, so the mission screen is the ONLY place a new call's goal is stated; if an
    // Honors outcome could hold the screen through "Next call", the learner would be
    // looking at a bench whose question is nowhere on the page.
    //
    // An HONORS regenerate is the polite one: it evicts an Honors claim but leaves a core
    // outcome standing, because each Honors block states its own task in the console
    // beside its own controls and so does not need the screen to be legible.
    releaseScreen(mode, honors) {
      const s = this.screenOf[mode];
      if (!honors || !s || s.honors) this.screenOf[mode] = null;
    },

    // Advance the incident clock and spend reagent off the truck. A wrong call costs
    // roughly three times the minutes of a right one, which is the feedback loop: the
    // spill does not wait while you re-run the arithmetic. Only calls that actually
    // commit reagent carry a spend; a NEGATIVE spend is reagent recovered and booked
    // back in, which is what the h2 honors bench is for, capped at the starting load.
    recordWorld({ icon, tone, text, minutes, spend = 0 }) {
      this.clockMin += minutes;
      this.soda = rN(Math.max(0, Math.min(START_SODA, this.soda - spend)), 1);
      this.calls++;
      if (tone === 'success') this.rightCalls++;
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

    // ===================== cockpit readouts =====================
    // Everything the mission screen and the status rail bind to. Nothing here decides
    // anything: it reads the bench state the commit handlers above already produced.
    scArt(id) { return sceneArt(id); },

    // The bench's own scenario, before any commit has claimed the screen.
    get coreBrief() {
      if (this.mode === 'balance') return (this.bal && this.bal.sc) || null;
      if (this.mode === 'classify') return (this.cl && this.cl.sc) || null;
      if (this.mode === 'stoich') return (this.st && this.st.sc) || null;
      if (this.mode === 'lr') return (this.lm && this.lm.sc) || null;
      // The capstone brief exists before the tanker call is drawn, so the locked station
      // still says what it is going to ask for instead of showing an empty screen.
      if (this.mode === 'capstone') return (this.cap && this.cap.sc) || scOf('cap-tanker');
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
      return b && b.id ? b.id : 'a-ladder';
    },
    get activeStationName() {
      const b = this.activeBrief;
      if (b && b.system) return b.system;
      return STATION_NAME[this.mode] || 'The rotation';
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
      return 'Pick a bench. Every call comes down to the same question: what reaction is running, and how much of what does it take to stop it.';
    },

    // The facts a learner should never have to leave the bench to look up: a route, a
    // constant, a rule. Three lines at most, because this card shares a column with the
    // scenario narrative and every extra line here is a line taken off the text somebody
    // actually reads. They are deliberately the facts the bench does NOT already print
    // beside its own controls -- the balance bench shows a live element tally, so what it
    // is missing is the rule about subscripts, not the tally.
    //
    // The two benches that carry an Honors commit swap in that call's facts while its
    // outcome holds the screen, because at that point the core route has been walked and
    // Avogadro's number, or the leftover subtraction, is what is in play.
    get activeReference() {
      const out = [];
      if (this.mode === 'balance') {
        out.push({ k: 'Conservation', v: 'the same count of every element on both sides' });
        out.push({ k: 'Coefficients only', v: 'multiply a whole formula; never edit a subscript' });
        out.push({ k: 'Lowest terms', v: 'divide the whole set by its common factor before you call it' });
      } else if (this.mode === 'classify') {
        out.push({ k: 'Five patterns', v: 'synthesis, decomposition, single and double replacement, combustion' });
        out.push({ k: 'A free element', v: 'on either side means oxidation states moved: redox' });
        out.push({ k: 'Two solutions', v: 'leaving a solid is precipitation; acid plus base is acid-base' });
      } else if (this.mode === 'stoich') {
        if (this.screenIsHonors && this.h1s) {
          out.push({ k: "Avogadro's number", v: '6.022e23 representative particles in one mole' });
          out.push({ k: 'The route', v: 'grams, then divide by molar mass, then times 6.022e23' });
          out.push({ k: 'On this sample', v: `${fmt(this.h1s.mass)} g/mol for ${this.h1s.species.f}` });
        } else {
          out.push({ k: 'The route', v: 'grams, mol, mole ratio, mol, grams. Four steps, always' });
          out.push({ k: 'Mole ratio', v: 'the coefficients of the balanced equation, nothing else' });
          out.push({ k: 'Gas at STP', v: 'one mole of any gas is 22.4 L' });
        }
      } else if (this.mode === 'lr') {
        if (this.screenIsHonors && this.h2s) {
          out.push({ k: 'What is left', v: 'starting mol of the excess, minus the mol it actually used' });
          out.push({ k: 'What it used', v: 'comes off the LIMITING reactant, through the mole ratio' });
          out.push({ k: 'Then back', v: 'times its molar mass, because the compartment is weighed in grams' });
        } else {
          out.push({ k: 'Both halves', v: 'which reactant runs out, then what that much can make' });
          out.push({ k: 'The test', v: 'take each reactant all the way to product; the smaller answer wins' });
          out.push({ k: 'Percent yield', v: 'actual over theoretical, times 100' });
        }
      } else if (this.mode === 'capstone') {
        out.push({ k: 'On the truck', v: `${fmt(this.soda)} kg of caustic soda, whatever the shift left in it` });
        out.push({ k: 'Mutual aid', v: `the county tanker brings ${AID_CAP} kg, and no more` });
        out.push({ k: 'The call', v: 'lay it now, dam and hold for aid, or withdraw to the state team' });
      }
      return out.slice(0, 3);
    },

    get coreSkills() { return SE.filter(se => !se.honors); },
    get teksMasteredCount() { return this.coreSkills.filter(se => this.gMastered(se.id)).length; },

    // ===================== the rail: the truck and the rotation =====================
    // Four meters, because tests/unit5a-layout.test.mjs fails every non-story state when
    // .system-grid holds fewer than four .ship-stock rows (porting trap 13). They have to
    // be four HONEST quantities, and these are: minutes burned, calls logged, the share of
    // them that were right, and skills certified. Right is the one that can fall while
    // the other three rise, which is what stops the board reading as one number four ways.
    //
    // One-word labels and short values, because .life-meter-label wraps and at 1024x600
    // these cells are about 115px: "Calls right" and "0 of 12" each wrap to two lines and
    // four wrapped rows push the log clean off the viewport (traps 9 and 15). The full
    // meaning lives in each row's title instead.
    get truckReadings() {
      // There is no success rate before a call has happened. A full 100% meter at startup
      // looked reassuring but claimed a result the learner had not earned yet.
      const right = this.calls ? Math.round(this.rightCalls / this.calls * 100) : null;
      const burned = Math.min(100, this.clockMin / ROTATION * 100);
      return [
        { key: 'shift', label: 'Shift', raw: `${this.clockMin}m`, pct: 100 - burned,
          hint: 'minutes burned out of a twelve hour rotation; a wrong call costs about three times a right one' },
        { key: 'calls', label: 'Calls', raw: `${this.calls}`, pct: Math.min(100, this.calls / 12 * 100),
          hint: 'calls you have logged on this rotation, right or wrong' },
        { key: 'right', label: 'Right', raw: right === null ? '-' : `${right}%`, pct: right ?? 0,
          hint: 'of the calls you have made, the share that were right' },
        { key: 'skills', label: 'Skills', raw: `${this.teksMasteredCount}/4`, pct: this.teksMasteredCount / 4 * 100,
          hint: 'core skills certified: three right in a row on each of C.9(A) to C.9(D)' }
      ];
    },
    stockColor(v) { return v >= 67 ? 'var(--success)' : v >= 34 ? 'var(--warn)' : 'var(--danger)'; },

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
      this.releaseScreen('balance', false);
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
      this.claimScreen('balance', sc, this.balVerdict, false);
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
      this.claimScreen('balance', sc, v, false);
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
      this.releaseScreen('classify', false);
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
      this.claimScreen('classify', sc, v, false);
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
      if (this.h1s) this.genHonors1();
      this.releaseScreen('stoich', false);
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
      this.claimScreen('stoich', sc, v, false);
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
      if (this.h2s) this.genHonors2();
      this.releaseScreen('lr', false);
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
      this.claimScreen('lr', sc, v, false);
    },
    lmNext() { this.genLr(); },

    // ===================== Honors h1 (parent c): particle counts =====================
    get h1Unlocked() { return this.gMastered('c'); },
    genHonors1() {
      const sc = scOf('h1-particles');
      // The brief files "the product of the call you just sized" and `safe` says the count
      // matches the mass logged at the scene, so this bench has to BE that call. An
      // independent pick(REACTIONS) broke that three ways at once: the reaction had nothing
      // to do with the C.9(C) bench, picking over reactants AND products could file a
      // REACTANT as "the product", and it reached propane without the scenario layer's gate.
      // So take the stoich bench's own reaction and its own logged amount, and carry them
      // through the mole ratio to one of that reaction's PRODUCTS.
      const st = this.st;
      const species = pick(st.rxn.products);
      // Snapped to 3 significant figures for the same reason genStoich snaps its draw:
      // fmt() prints 3 sig figs, so an unsnapped mass would be graded against a number the
      // learner was never shown.
      const grams = Number((moleRatio(st.given, species, st.givenMol) * molarMass(species.f)).toPrecision(3));
      const mol = grams / molarMass(species.f);
      this.h1s = { sc, rxn: st.rxn, species, grams, mol, mass: molarMass(species.f), target: mol * AVOGADRO, bands: sc.bands };
      this.h1Input = '';
      this.h1Checked = false; this.h1Attempted = false; this.h1Done = false; this.h1Verdict = null;
      this.releaseScreen('stoich', true);
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
      this.claimScreen('stoich', sc, v, true);
    },
    h1Next() { this.genStoich(); },

    // ===================== Honors h2 (parent d): excess recovered =====================
    get h2Unlocked() { return this.gMastered('d'); },
    genHonors2() {
      const sc = scOf('h2-recovery');
      // "It is already sitting in the numbers you just ran" is only true if it IS those
      // numbers. Drawing a fresh reaction and fresh amounts here made the brief's central
      // claim false, so the leftover now comes straight off the C.9(D) bench's own call.
      const { rxn, amounts, res } = this.lm;
      const excess = res.leftover.find(l => !l.isLimiting);
      this.h2s = { sc, rxn, amounts, res, excess, limiting: res.limiting, target: excess.gramsLeft, bands: sc.bands };
      this.h2Input = '';
      this.h2Checked = false; this.h2Attempted = false; this.h2Done = false; this.h2Verdict = null;
      this.releaseScreen('lr', true);
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
      this.claimScreen('lr', sc, v, true);
    },
    h2Next() { this.genLr(); },

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
      this.claimScreen('capstone', sc, v, false);
    }
  };
}
