// main.js: Unit 3 view-model, units_new build (Periodic Table & Trends, C.5 A-C).
//
// The chemistry, the pools and the periodic-table figure are
// units/03-periodic-trends/js/main.js's, carried over unchanged. What is added here is the
// Scenario layer the cockpit reads: createGame progress, the twelve-cell BOARD world-state,
// per-bench verdicts, three graded core commits, two Honors commits and the capstone.
//
// Three things in this file are deliberate and easy to undo by accident:
//
//   1. trendChart and ieChart stay at MODULE scope, never on the Alpine component
//      (porting trap 11). resizeCharts() is called from setMode() as well as from the
//      $watch, because a canvas laid out while its panel was display:none measures zero
//      and stays zero (trap 12). The wrapper heights are in css/style.css.
//   2. modeVerdict is a map keyed by BENCH, not a single lastVerdict (trap 3). The trends
//      bench carries three commits - c, h1 and h2 all have mode 'trends' in SE - so a fixed
//      precedence would make two of them permanently unreadable on the mission screen.
//   3. TREND_QUIZ is no longer read. The comparison bench reads its two parts off the
//      scenario's own actions and generates the deciding property from ELEMENTS_FULL at
//      runtime (RETROFIT-U1-U4.md section 3, GAMIFICATION.md:296-298). The seven-item bank
//      stays exported from model.js as the worked examples the generator's constraints were
//      derived from, and as the source unit's data unedited. The pair is NOT free to roam
//      the table: see buildScenarioPairs below for why that broke the bench.
import {
  SE, ELEMENT_DATA, FAMILY_LABELS, TABLE_HISTORY, MENDELEEV_GAP,
  MASS_ORDER_INVERSIONS, FAMILIES, FAMILY_QUIZ, TREND_PROPS, TREND_RUNS, IE_ANOMALIES,
  SCENARIOS, SCENARIO_TASKS, BOARD_CELLS, CAP_SUBSTITUTES, ANOMALY_ANSWER
} from './model.js';
import {
  ELEMENTS, ATOMIC_MASS, ELECTRONEGATIVITY, electronConfiguration, formatConfig,
  valenceElectrons, period, effectiveNuclearCharge, fmt
} from '../../../shared/js/chem.js';
import { createGame } from '../../../shared/js/game.js';
import { lineChart } from '../../../shared/js/render.js';
import { sceneArt } from './art.js';

// Chart.js instances live at module scope, never inside Alpine's reactive proxy.
let trendChart = null, ieChart = null;

const pick = a => a[(Math.random() * a.length) | 0];
const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);

// Merge the unit's reference data with chem.js facts once. Each entry gains its atomic
// number, name, mass, electronegativity (null when undefined, e.g. noble gases), and the
// derived period. The CSS grid is positioned from period (row) and group (column).
const ELEMENTS_FULL = ELEMENT_DATA.map(d => {
  const ref = ELEMENTS.find(e => e.sym === d.sym);
  return {
    ...d,
    z: ref.z, name: ref.name,
    mass: ATOMIC_MASS[d.sym],
    en: ELECTRONEGATIVITY[d.sym] ?? null,
    period: period(ref.z)
  };
});
const BY_SYM = Object.fromEntries(ELEMENTS_FULL.map(e => [e.sym, e]));

// Heatmap min/max per property, computed once over the present (non-null) values.
const HEAT_RANGES = Object.fromEntries(TREND_PROPS.map(p => {
  const vals = ELEMENTS_FULL.map(e => e[p.field]).filter(v => v != null);
  return [p.field, { min: Math.min(...vals), max: Math.max(...vals) }];
}));

const MAIN_GROUP = new Set([1, 2, 13, 14, 15, 16, 17, 18]);
const COMPARE_VERB = {
  radius: 'larger atomic radius', ie1: 'higher first ionization energy',
  en: 'higher electronegativity', mass: 'greater atomic mass'
};
const HEAT_LO = [234, 243, 244], HEAT_HI = [21, 69, 78];

// ======================= the generated comparison =======================
// The upgrade from the fixed seven-item TREND_QUIZ: the property, both values and the whole
// explanation are read off ELEMENTS_FULL rather than written out per question, so the prose
// cannot drift from the data.
//
// The PAIR, though, is not free. Each C.5(C) scenario is one specific repair job with two
// candidate parts, and its two actions name them ("Fit the lithium cell" / "Offer a sodium
// cell instead"). Drawing the pair from the whole table put an aluminium-against-chlorine
// reading above that lithium-or-sodium call: the reading and the call were about different
// parts, which makes the bench incoherent however good either half is on its own. So the
// pair is the job's own two parts, from the `sym` on each action in SCENARIO_TASKS, and
// what is generated is which PROPERTY can decide between them.
//
// Three constraints on that property, and the third is the one that matters:
//
//   1. One trend to reason from. Same period or same group gives one outright. A pair that
//      shares neither is admissible only for a property that moves the SAME way across a
//      period as it does down a group -- which is atomic mass and nothing else, because it
//      rises with the proton count either way -- and then the trend is atomic-number order.
//      That is what lets aluminium (period 3, group 13) be read against iron (period 4,
//      group 8) honestly, which the repair job requires and no single row or column offers.
//   2. A clear gap in the property, so the answer is not a coin flip on data the learner
//      cannot read to that precision off the chart.
//   3. THE DATA MUST AGREE WITH THE TREND. A pair where the property does not actually move
//      the way TREND_PROPS says it does is an anomaly, and an anomaly graded against an
//      explanation that contradicts it teaches the wrong thing. Those are dropped here;
//      explaining them is h2's job. This is what keeps gold-against-copper off
//      electronegativity, where gold's 2.54 over copper's 1.90 runs backwards to the group
//      trend, while leaving radius and mass, which do not.
//
// Read from ELEMENTS_FULL, not ELEMENT_DATA: `en` does not exist on the raw pool at all,
// and it is null for He, Ne and Ar because shared/js/chem.js omits the noble gases.
const GAP_MIN = { radius: 25, ie1: 150, en: 0.5, mass: 8 };

// One property over two elements: the comparison a learner can defend, or null. `a` is
// always the earlier element along the trend's own direction, so the explanation reads the
// way the rule is stated. `pairNote` is what the bench prints between the two parts and
// `trendLead` opens the explanation, both settled here so that neither the template nor
// cExplain has to know the axis vocabulary.
function trendComparison(p, x, y) {
  const va = x[p.field], vb = y[p.field];
  if (va == null || vb == null) return null;                 // nothing to read
  if (Math.abs(va - vb) < GAP_MIN[p.key]) return null;       // constraint 2

  // Constraint 1, and the axis it settles on decides how the explanation opens.
  const sameRow = x.period === y.period, sameCol = x.group === y.group;
  let left, moves, pairNote, trendLead;
  if (sameRow && sameCol) {
    return null;                                             // one element against itself
  } else if (sameRow || sameCol) {
    left = sameRow ? (x.group < y.group ? x : y) : (x.period < y.period ? x : y);
    moves = sameRow ? p.across : p.down;
    pairNote = sameRow ? 'same period' : 'same group';
    trendLead = sameRow ? `Across period ${left.period}` : `Down group ${left.group}`;
  } else if (p.across === p.down) {
    left = x.z < y.z ? x : y;
    moves = p.across;
    pairNote = 'by atomic number';
    trendLead = 'In atomic-number order';
  } else {
    return null;                                             // no single trend to read
  }
  const right = left === x ? y : x;

  // Constraint 3. The mass-order inversions (Ar before K, Co before Ni) sit far too close
  // together to clear constraint 2, so this is their backstop rather than what catches them;
  // what it does catch is gold over copper on electronegativity.
  const dataRises = right[p.field] > left[p.field];
  if ((moves === 'increases') !== dataRises) return null;

  return {
    property: p.key, a: left.sym, b: right.sym,
    answer: (dataRises ? right : left).sym,
    pairNote, trendLead, moves
  };
}

// The comparisons available per scenario, keyed by scenario id: exactly the two parts that
// scenario's actions name, with one entry per property that can decide between them.
// Asserted non-empty at load, because a job with no defensible comparison would leave the
// bench with nothing to read, and that failure belongs in a test run rather than in front
// of a class. The pools derive from static data, so passing once is passing always.
function buildScenarioPairs() {
  const out = {};
  for (const [id, task] of Object.entries(SCENARIO_TASKS)) {
    if (task.pool !== 'pair') continue;
    const parts = (task.actions ?? []).map(a => BY_SYM[a.sym]);
    if (parts.length !== 2 || parts.some(el => !el)) {
      throw new Error(`${id}: pool 'pair' needs exactly two actions, each naming an element in ELEMENT_DATA`);
    }
    out[id] = TREND_PROPS.map(p => trendComparison(p, parts[0], parts[1])).filter(Boolean);
    if (!out[id].length) {
      throw new Error(`${id}: no trend property can decide ${parts[0].sym} against ${parts[1].sym}`);
    }
  }
  return out;
}
export const SCENARIO_PAIRS = buildScenarioPairs();

// ======================= the board figure =======================
// A reconstructed mini periodic table: 18 group columns by 6 periods. The twelve target
// cells are drawn as faint dashed slots from the first render, so the board reads as
// something being filled in rather than something appearing from nowhere. Confirmed cells
// are painted in their real family colour.
//
// String-built and injected with x-html on a <g>, because Alpine's x-for and x-if do not
// bind scope inside <svg> (RETROFIT-U1-U4.md section 8 trap 2).
//
// Colours are the saturated `fam-dot` palette from the unit's own stylesheet, not the pale
// `pt-cell` tints: the rail is dark, and a #f6e9e8 cell on it is invisible.
const FAM_FILL = {
  hydrogen: '#5b6b9c', alkali: '#c0504d', 'alkaline-earth': '#9a8c2b',
  transition: '#607d8b', metalloid: '#4a8f7b', 'post-transition': '#9c8aa0',
  nonmetal: '#3f8f5f', halogen: '#3a6fb0', noble: '#8a5a9c'
};
const FAM_LIGHT = {
  hydrogen: '#eceff5', alkali: '#f6e9e8', 'alkaline-earth': '#f1efde',
  transition: '#eaeff1', metalloid: '#e6f1ec', 'post-transition': '#f0ecf2',
  nonmetal: '#e6f0ea', halogen: '#e7eef7', noble: '#f1eaf5'
};
const CELL_W = 9, CELL_H = 8, CELL_GAP_X = 10, CELL_GAP_Y = 9;
const cellXY = sym => {
  const el = BY_SYM[sym];
  return { x: (el.group - 1) * CELL_GAP_X, y: (el.period - 1) * CELL_GAP_Y };
};

// Mastery targets: three in a row for the three core skills, two for each Honors row, one
// for the capstone. `honors: true` on the capstone keeps it out of the gOverall() gate that
// unlocks it.
const skills = [
  { id: 'a',   code: 'C.5(A)',   label: 'How the table developed', target: 3 },
  { id: 'b',   code: 'C.5(B)',   label: 'Chemical families',       target: 3 },
  { id: 'c',   code: 'C.5(C)',   label: 'Periodic trends',         target: 3 },
  { id: 'h1',  code: 'Honors',   label: 'Zeff and shielding',      target: 2, honors: true },
  { id: 'h2',  code: 'Honors',   label: 'Ionization dips',         target: 2, honors: true },
  { id: 'cap', code: 'Capstone', label: 'The substitute part',     target: 1, honors: true }
];

export { SE };

export function createSim() {
  return {
    ...createGame({ unitId: 'units_new/03-periodic-trends', skills }),
    SE, TABLE_HISTORY, MENDELEEV_GAP, MASS_ORDER_INVERSIONS, FAMILIES,
    TREND_PROPS, TREND_RUNS, IE_ANOMALIES, FAMILY_LABELS, BOARD_CELLS, fmt,
    honors: false,
    mode: 'table',
    selectedSym: 'Li',
    teksOpen: false,

    // ---- world-state: the board you are reconstructing ----
    // `board` is the confirmed cells in the order they were confirmed; `returns` counts
    // every cell a wrong call has knocked back off, which is what the state word reads.
    board: [],
    returns: 0,
    day: 0,
    worldLog: [],
    lastVerdict: null,
    modeVerdict: { table: null, families: null, trends: null, capstone: null },
    // A bench can host more than one commit. The last commit has to own the scene as
    // well as the verdict or Honors work would be graded against one banner while the
    // mission screen still described another.
    screenOf: { table: null, families: null, trends: null, capstone: null },
    _wid: 0,
    scIdx: { a: -1, b: -1, c: -1 },

    // ---- C.5(A) the history bench ----
    aSc: null, aPick: null, aAction: null,
    aChecked: false, aAttempted: false, aVerdict: null,
    moseleyOn: false,

    // ---- C.5(B) the families bench ----
    bSc: null, bPick: null, bAction: null,
    bChecked: false, bAttempted: false, bVerdict: null,
    famKey: 'alkali',

    // ---- C.5(C) the trends bench ----
    cSc: null, cPair: null, cPick: null, cAction: null,
    cChecked: false, cAttempted: false, cVerdict: null,
    trendProp: 'radius', trendRun: 'p2',

    // ---- Honors h1 and h2, both riding on the trends bench ----
    h1Pick: null, h1Action: null, h1Checked: false, h1Attempted: false, h1Verdict: null,
    h2Anom: null, h2Pick: null, h2Action: null, h2Checked: false, h2Attempted: false, h2Verdict: null,

    // ---- Capstone ----
    cap: null, capInput: '', capPick: null,
    capChecked: false, capAttempted: false, capWin: false, capVerdict: null,

    init() {
      this.gLoad();
      this.newA();
      this.newB();
      this.newC();
      this.newH2();
      this.$nextTick(() => {
        this.buildCharts();
        // A <select x-model> binds before its child x-for has rendered its <option>s, so
        // re-apply each value once the option lists exist.
        ['trendProp', 'trendRun'].forEach(k => { const v = this[k]; this[k] = null; this[k] = v; });
      });
      this.$watch('honors', () => this.$nextTick(() => {
        this.buildCharts();
        this.resizeCharts();
      }));
      this.$watch('trendProp', () => this.updateTrendChart());
      this.$watch('trendRun', () => this.updateTrendChart());
    },

    setMode(m) {
      this.mode = m;
      if (m === 'capstone' && this.capUnlocked && !this.cap) this.genCapstone();
      // Both charts live on the trends bench. A canvas measured while its panel was
      // display:none is 0x0 and stays 0x0, and the ResizeObserver inside Chart.js fires
      // on the transition but not before this panel's first paint.
      this.$nextTick(() => {
        this.buildCharts();
        this.resizeCharts();
      });
    },

    resetProgress() {
      // The h2 canvas is behind x-if so its DOM node disappears when core trend mastery
      // is reset. Destroy the module-owned chart before that removal; otherwise Chart.js
      // keeps a stale canvas and cannot bind the next Honors session cleanly.
      ieChart?.destroy();
      ieChart = null;
      this.gReset();
      this.board = []; this.returns = 0; this.day = 0;
      this.worldLog = [];
      this.scIdx = { a: -1, b: -1, c: -1 };
      this.screenOf = { table: null, families: null, trends: null, capstone: null };
      this.clearOutcome();
      this.newA(); this.newB(); this.newC(); this.newH2();
      this.cap = null; this.capWin = false; this.capInput = ''; this.capPick = null;
      this.h1Pick = null; this.h1Action = null; this.h1Checked = false; this.h1Attempted = false;
      this.$nextTick(() => {
        this.buildCharts();
        this.resizeCharts();
      });
    },

    clearOutcome() {
      this.aVerdict = null; this.bVerdict = null; this.cVerdict = null;
      this.h1Verdict = null; this.h2Verdict = null; this.capVerdict = null;
      this.modeVerdict = { table: null, families: null, trends: null, capstone: null };
      this.lastVerdict = null;
    },

    // ================= scenario layer plumbing =================
    nextScenario(skill) {
      const list = SCENARIOS.filter(s => s.skill === skill);
      const i = (this.scIdx[skill] = (this.scIdx[skill] ?? -1) + 1) % list.length;
      return list[i];
    },
    scenarioById(id) { return SCENARIOS.find(s => s.id === id) || null; },
    taskOf(sc) { return sc ? SCENARIO_TASKS[sc.id] || null : null; },
    claimScreen(mode, sc, v, honors) {
      this.screenOf[mode] = { sc, v, honors: !!honors };
      this.modeVerdict[mode] = v;
    },
    // Core "next" buttons always restore the fresh core brief. Honors "try again"
    // clears only an Honors claim, leaving a core result visible when one exists because
    // the Honors controls state their own goal in the console.
    releaseScreen(mode, honors) {
      const screen = this.screenOf[mode];
      if (!honors || !screen || screen.honors) {
        this.screenOf[mode] = null;
        this.modeVerdict[mode] = null;
      }
    },

    // Advance a day and settle the board.
    //
    // Unit 1's recordWorld drifts four continuous readings; this one moves a set of cells,
    // because Unit 3's world-state is discrete. There is no baseline drift: a cell that has
    // been confirmed does not decay on its own, and inventing a decay here would mean
    // knocking a correct call off the board for no reason the learner could see.
    //
    // THE KNOCK-OFF RULE. A wrong call returns one cell, and it is the cell of the family
    // the learner just got wrong, so the return is thematically the mistake rather than an
    // arbitrary tax. When that family is not on the board yet, the most recently confirmed
    // cell comes off instead - otherwise an early miss would be free, and the rule has to
    // bite from the first call. Only ever ONE cell, and never the last one: a single
    // mistake can never empty the board, per GAMIFICATION.md's no-soft-lock rule.
    recordWorld({ icon, tone, text, effect }) {
      this.day++;
      const e = effect || {};
      if (e.add) {
        const spec = BOARD_CELLS.find(c => c.sym === e.add);
        if (spec && !this.board.some(c => c.sym === e.add)) this.board = [...this.board, { ...spec }];
      }
      if (e.drop && this.board.length > 1) {
        let idx = -1;
        for (let i = this.board.length - 1; i >= 0; i--) if (this.board[i].family === e.drop) { idx = i; break; }
        if (idx < 0) idx = this.board.length - 1;
        const gone = this.board[idx];
        this.board = this.board.filter((_, i) => i !== idx);
        this.returns++;
        this.worldLog = [{ id: ++this._wid, icon: '\u{21A9}\u{FE0F}', tone: 'warn',
          text: `Day ${this.day}: ${gone.sym} came back off the board.` }, ...this.worldLog].slice(0, 6);
      }
      this.worldLog = [{ id: ++this._wid, icon, tone, text: `Day ${this.day}: ${text}` }, ...this.worldLog].slice(0, 6);
    },

    // ---- derived board readings ----
    get cellsConfirmed() { return this.board.length; },
    get cellsTotal() { return BOARD_CELLS.length; },
    get boardPct() { return Math.round(100 * this.board.length / BOARD_CELLS.length); },
    get boardFamilies() { return new Set(this.board.map(c => c.family)); },
    // The three state words RETROFIT-U1-U4.md section 4 specifies for this unit, driven by
    // returns rather than by cell count: a board that is filling up while parts keep coming
    // back is not "holding", and the learner should see that distinction.
    get boardState() {
      if (this.returns === 0) return 'REPAIRS HOLDING';
      if (this.returns <= 2) return 'TWO CAME BACK';
      return 'SHELF FULL OF RETURNS';
    },
    get boardTone() { return this.returns === 0 ? 'safe' : this.returns <= 2 ? 'warn' : 'danger'; },
    get boardMood() { return this.returns === 0 ? '\u{1F527}' : this.returns <= 2 ? '\u{1F615}' : '\u{1F4E6}'; },
    stockColor(v) { return v >= 67 ? 'var(--success)' : v >= 34 ? 'var(--warn)' : 'var(--danger)'; },

    // The rail has four compact, non-overlapping readings. The family tint belongs on the
    // periodic-table cells themselves; one meter per family would consume the rail's log
    // space at a short viewport and would duplicate rather than clarify this state.
    get boardRows() {
      const coreTotal = BOARD_CELLS.filter(c => /^(a|b|c)-/.test(c.from)).length;
      const coreHave = this.board.filter(c => /^(a|b|c)-/.test(c.from)).length;
      const extensionTotal = BOARD_CELLS.length - coreTotal;
      const extensionHave = this.board.length - coreHave;
      return [
        { key: 'confirmed', label: 'Confirmed', title: 'Confirmed cells on the board',
          value: `${this.cellsConfirmed}/${this.cellsTotal}`, pct: this.boardPct, fill: this.stockColor(this.boardPct) },
        { key: 'core', label: 'Core', title: 'Confirmed core C.5 calls',
          value: `${coreHave}/${coreTotal}`, pct: Math.round(100 * coreHave / coreTotal), fill: 'var(--accent)' },
        { key: 'extensions', label: 'Extensions', title: 'Confirmed Honors and capstone calls',
          value: `${extensionHave}/${extensionTotal}`, pct: Math.round(100 * extensionHave / extensionTotal), fill: 'var(--honors)' },
        { key: 'returns', label: 'Returns', title: 'Cells knocked back off the board by unsupported calls',
          value: this.returns ? String(this.returns) : 'none', pct: Math.min(100, this.returns * 34),
          fill: this.returns ? 'var(--danger)' : 'var(--success)' }
      ];
    },

    // The board figure. Faint slot for every target cell, painted cell for every confirmed
    // one, and the group/period frame so it reads as a periodic table rather than a grid.
    boardSvg() {
      const have = Object.fromEntries(this.board.map(c => [c.sym, c]));
      let out = '';
      for (const spec of BOARD_CELLS) {
        const { x, y } = cellXY(spec.sym);
        const on = have[spec.sym];
        if (on) {
          out += `<rect x="${x}" y="${y}" width="${CELL_W}" height="${CELL_H}" rx="1.2" fill="${FAM_FILL[spec.family]}"></rect>`
            + `<text x="${x + CELL_W / 2}" y="${y + CELL_H / 2 + 1.9}" text-anchor="middle" font-size="4.6"`
            + ` fill="#fff" font-family="'JetBrains Mono', ui-monospace, monospace">${spec.sym}</text>`;
        } else {
          out += `<rect x="${x}" y="${y}" width="${CELL_W}" height="${CELL_H}" rx="1.2" fill="none"`
            + ` stroke="rgb(255 255 255 / 22%)" stroke-width="0.6" stroke-dasharray="1.6 1.4"></rect>`;
        }
      }
      return out;
    },

    // ================= cockpit readouts =================
    scArt(id) { return sceneArt(id); },
    get aBrief() { return this.aSc; },
    get bBrief() { return this.bSc; },
    get cBrief() { return this.cSc; },
    get h1Brief() { return this.scenarioById('h1-shielding'); },
    get h2Brief() { return this.scenarioById('h2-dip'); },
    get capBrief() { return (this.cap && this.cap.sc) || this.scenarioById('cap-substitute'); },
    get coreSkills() { return SE.filter(se => !se.honors); },
    get teksMasteredCount() { return this.coreSkills.filter(se => this.gMastered(se.id)).length; },

    get coreBrief() {
      if (this.mode === 'table') return this.aBrief;
      if (this.mode === 'families') return this.bBrief;
      if (this.mode === 'trends') return this.cBrief;
      if (this.mode === 'capstone') return this.capBrief;
      return null;
    },
    get activeBrief() {
      const screen = this.screenOf[this.mode];
      return (screen && screen.sc) || this.coreBrief;
    },
    get activeVerdict() {
      const screen = this.screenOf[this.mode];
      return (screen && screen.v) || null;
    },
    get screenIsHonors() {
      const screen = this.screenOf[this.mode];
      return !!(screen && screen.honors);
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
      return b && b.id ? b.id : 'a-datasheet';
    },
    get activeStationName() {
      const b = this.activeBrief;
      if (b && b.system) return b.system;
      return 'The repair bench';
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
      return 'Pick a part off the bench and say which element belongs in it.';
    },

    // Three short lines of standing fact per bench. The trends bench gets the two trend
    // directions and the reason, because that is the whole of C.5(C) and it is what a
    // learner otherwise leaves the bench to look up.
    get activeReference() {
      const out = [];
      if (this.mode === 'table') {
        out.push({ k: 'Order by', v: 'atomic number, not atomic mass' });
        out.push({ k: 'On this shelf', v: 'Ar before K, Co before Ni' });
        out.push({ k: 'A gap', v: 'is a prediction, not a missing page' });
      } else if (this.mode === 'families') {
        out.push({ k: 'Group 1 / 2', v: '1 and 2 valence electrons, +1 and +2' });
        out.push({ k: 'Group 17 / 18', v: '7 valence electrons then -1; full shell, no ion' });
        out.push({ k: 'Transition', v: 'variable charge, low reactivity' });
      } else if (this.mode === 'trends') {
        if (this.screenIsHonors && this.activeBrief?.id === 'h1-shielding') {
          out.push({ k: 'Across Period 3', v: 'protons rise; core shielding stays close to constant' });
          out.push({ k: 'Zeff', v: 'the net pull on an outer electron' });
          out.push({ k: 'Result', v: 'radius falls while first IE rises' });
        } else if (this.screenIsHonors && this.activeBrief?.id === 'h2-dip') {
          out.push({ k: 'Be to B', v: 'a higher-energy 2p electron is removed' });
          out.push({ k: 'N to O', v: 'a paired 2p electron is easier to remove' });
          out.push({ k: 'Not noise', v: 'both dips are explained by subshell structure' });
        } else {
          out.push({ k: 'Across a period', v: 'radius falls, IE and EN rise' });
          out.push({ k: 'Down a group', v: 'radius rises, IE and EN fall' });
          out.push({ k: 'Because', v: 'Zeff rises across; a new shell is added down' });
        }
      } else if (this.mode === 'capstone' && this.cap) {
        out.push({ k: 'Board now', v: `${this.cellsConfirmed} of ${this.cellsTotal} cells` });
        out.push({ k: 'The neighbours', v: `Co ${BY_SYM.Co.radius} pm, Cu ${BY_SYM.Cu.radius} pm` });
        out.push({ k: 'Corrosion line', v: 'a reactivity gap of 13 or more' });
      }
      return out.slice(0, 3);
    },

    seCaption(se) {
      if (this.gMastered(se.id)) return 'Mastered';
      const sk = this.g_skills[se.id];
      const def = this.g_skillDefs.find(d => d.id === se.id) || {};
      return `${sk ? sk.run : 0} of ${def.target || 3} correct in a row`;
    },

    // ======================= shared grid + inspector =======================
    get elements() { return ELEMENTS_FULL; },
    elBySym(sym) { return BY_SYM[sym]; },
    selectEl(sym) { if (BY_SYM[sym]) this.selectedSym = sym; },
    selectHeatFromEvent(event) {
      const node = event.target && event.target.closest ? event.target.closest('[data-sym]') : null;
      const sym = node && node.getAttribute('data-sym');
      if (sym) this.selectEl(sym);
    },
    get selected() { return BY_SYM[this.selectedSym]; },
    get selConfig() { return formatConfig(electronConfiguration(this.selected.z)); },
    get selValence() { return valenceElectrons(this.selected.z); },
    get selZeff() { return effectiveNuclearCharge(this.selected.z); },
    get selIsMainGroup() { return MAIN_GROUP.has(this.selected.group); },
    get selFamilyLabel() { return FAMILY_LABELS[this.selected.family]; },
    get selEN() { return this.selected.en == null ? 'n/a' : this.selected.en; },

    // The reusable periodic field map, as SVG rather than the worksheet build's CSS grid.
    // It shows family tints in history mode, a selected-family focus in families mode, and
    // the heatmap in trends mode. The same cell geometry serves this visual and the board.
    // In-SVG symbols stay legible without violating the HTML text floor in the narrow console.
    heatSvg() {
      const field = this.prop.field;
      const onBoard = new Set(this.board.map(c => c.sym));
      const inversion = new Set(this.inversionSyms);
      let out = '';
      for (const el of ELEMENTS_FULL) {
        const { x, y } = cellXY(el.sym);
        const hc = this.heatColor(field, el[field]);
        const sel = el.sym === this.selectedSym;
        const familyFocus = this.mode === 'families' && el.family === this.famKey;
        const showHeat = this.mode === 'trends';
        const fill = showHeat ? (hc ? hc.bg : '#3a464c') : (familyFocus ? FAM_FILL[el.family] : FAM_LIGHT[el.family]);
        const opacity = showHeat ? (hc ? 1 : .55) : (this.mode === 'families' && !familyFocus ? .34 : 1);
        const textFill = showHeat ? (hc && hc.dark ? '#fff' : '#12222a') : (familyFocus ? '#fff' : '#18313a');
        const marked = this.mode === 'table' && this.moseleyOn && inversion.has(el.sym);
        const stroke = sel ? '#ffd479' : marked ? '#c0772f' : 'rgb(0 0 0 / 25%)';
        const width = sel ? 1.4 : marked ? 1.05 : .5;
        out += `<g data-sym="${el.sym}" role="button" tabindex="0" aria-label="${el.name}, atomic number ${el.z}">`
          + `<title>${el.name} (${el.sym}), atomic number ${el.z}</title>`
          + `<rect x="${x}" y="${y}" width="${CELL_W}" height="${CELL_H}" rx="1.2" fill="${fill}" opacity="${opacity}" stroke="${stroke}" stroke-width="${width}"></rect>`
          + (onBoard.has(el.sym) ? `<circle cx="${x + CELL_W - 1.8}" cy="${y + 1.9}" r="1.1" fill="#fff" opacity=".9"></circle>` : '')
          + `<text x="${x + CELL_W / 2}" y="${y + CELL_H / 2 + 1.9}" text-anchor="middle" font-size="4.4" fill="${textFill}" font-family="'JetBrains Mono', ui-monospace, monospace">${el.sym}</text></g>`;
      }
      return out;
    },
    // Hit areas for the figure: Alpine cannot bind inside the injected <g>, so the click
    // targets are separate transparent rects rendered by x-for OUTSIDE the x-html group.
    get heatCells() {
      return ELEMENTS_FULL.map(el => ({ sym: el.sym, ...cellXY(el.sym) }));
    },
    get inversionSyms() {
      return MASS_ORDER_INVERSIONS.filter(p => p.onGrid).flatMap(p => [p.a, p.b]);
    },
    triadAvg(tr) { return ((tr.els[0].mass + tr.els[2].mass) / 2).toFixed(1); },

    // ======================= C.5(A) the history bench =======================
    newA() {
      this.aSc = this.nextScenario('a');
      this.aPick = null; this.aAction = null;
      this.aChecked = false; this.aAttempted = false; this.aVerdict = null;
      this.moseleyOn = this.aSc.id === 'a-warehouse';
      if (this.aSc.id === 'a-datasheet') this.selectEl(MENDELEEV_GAP.answer);
      this.releaseScreen('table', false);
    },
    get aTask() { return this.taskOf(this.aSc); },
    // The gap scenario reads its options straight out of MENDELEEV_GAP, so the four
    // candidates stay the curated near-scandium set rather than four random symbols.
    get aOptions() {
      const t = this.aTask;
      if (!t) return [];
      if (t.pool === 'gap') return MENDELEEV_GAP.options.map(k => ({ k, label: `${k} - ${BY_SYM[k].name}` }));
      return t.options;
    },
    get aAnswer() { return this.aTask && this.aTask.pool === 'gap' ? MENDELEEV_GAP.answer : this.aTask.answer; },
    pickA(k) { if (!this.aChecked) this.aPick = k; },
    pickAAction(k) { if (!this.aChecked) this.aAction = k; },
    aState(k) {
      if (!this.aChecked) return this.aPick === k ? 'on' : '';
      if (k === this.aAnswer) return 'correct';
      if (k === this.aPick) return 'wrong';
      return '';
    },
    aActionState(k) {
      if (!this.aChecked) return this.aAction === k ? 'on' : '';
      if (k === this.aTask.actionTrue) return 'correct';
      if (k === this.aAction) return 'wrong';
      return '';
    },
    get aReady() { return !!this.aPick && !!this.aAction && !this.aChecked; },
    commitA() {
      if (!this.aReady) return;
      const sc = this.aSc, t = this.aTask;
      const idOk = this.aPick === this.aAnswer, actOk = this.aAction === t.actionTrue;
      const good = idOk && actOk;
      let v, effect;
      if (good) {
        v = { tone: 'success', icon: sc.icon, state: 'CELL CONFIRMED', headline: 'Read the pattern, then acted on it',
          detail: `${sc.consequences[this.aAction]} ${sc.cell} goes on the board.` };
        effect = sc.effect.good;
      } else {
        v = { tone: 'fail', icon: '\u{1F4CD}', state: idOk ? 'WRONG CALL' : 'WRONG ROW',
          headline: idOk ? 'The chemistry was right and the call was not' : 'That is not what the pattern says',
          detail: idOk ? sc.consequences[this.aAction] : t.explain };
        effect = sc.effect.bad;
      }
      this.gRecord('a', good, !this.aAttempted);
      this.recordWorld({ icon: v.icon, tone: v.tone,
        text: `${sc.system}, ${good ? 'called correctly' : 'called wrong'}`, effect });
      this.aAttempted = true; this.aChecked = true;
      this.aVerdict = v; this.claimScreen('table', sc, v, false); this.lastVerdict = v;
    },
    nextA() { this.newA(); },

    // ======================= C.5(B) the families bench =======================
    newB() {
      this.bSc = this.nextScenario('b');
      this.bPick = null; this.bAction = null; this.bChecked = false; this.bAttempted = false; this.bVerdict = null;
      this.famKey = this.bSc.family === 'post-transition' ? 'transition' : this.bSc.family;
      this.selectEl(this.bSc.cell);
      this.releaseScreen('families', false);
    },
    get bTask() { return this.taskOf(this.bSc); },
    get family() { return FAMILIES.find(f => f.key === this.famKey) || FAMILIES[0]; },
    selectFamily(key) {
      this.famKey = key;
      const f = FAMILIES.find(x => x.key === key);
      if (f && f.members.length) this.selectEl(f.members[0]);
    },
    get familyMembers() { return this.family.members.map(s => BY_SYM[s]).filter(Boolean); },
    get familyValence() {
      const vs = this.familyMembers.map(m => valenceElectrons(m.z));
      return vs.length && vs.every(v => v === vs[0]) ? vs[0] : this.family.valence;
    },
    // The worksheet build's FAMILY_QUIZ is kept as the reference card beside the bench: the
    // graded question here is the scenario's, but the six worked charge examples are still
    // the fastest way to check a valence-to-charge argument.
    get familyCharges() { return FAMILY_QUIZ.filter(q => BY_SYM[q.sym].family === this.famKey); },
    pickB(k) { if (!this.bChecked) this.bPick = k; },
    pickBAction(k) { if (!this.bChecked) this.bAction = k; },
    bState(k) {
      if (!this.bChecked) return this.bPick === k ? 'on' : '';
      if (k === this.bTask.answer) return 'correct';
      if (k === this.bPick) return 'wrong';
      return '';
    },
    bActionState(k) {
      if (!this.bChecked) return this.bAction === k ? 'on' : '';
      if (k === this.bTask.actionTrue) return 'correct';
      if (k === this.bAction) return 'wrong';
      return '';
    },
    get bReady() { return !!this.bPick && !!this.bAction && !this.bChecked; },
    commitB() {
      if (!this.bReady) return;
      const sc = this.bSc, t = this.bTask;
      const idOk = this.bPick === t.answer, actOk = this.bAction === t.actionTrue;
      const good = idOk && actOk;
      let v, effect;
      if (good) {
        v = { tone: 'success', icon: sc.icon, state: 'CELL CONFIRMED', headline: 'The family predicted the failure',
          detail: `${sc.consequences[this.bAction]} ${sc.cell} goes on the board.` };
        effect = sc.effect.good;
      } else {
        v = { tone: 'fail', icon: '\u{26A0}\u{FE0F}', state: idOk ? 'WRONG CALL' : 'WRONG FAMILY',
          headline: idOk ? 'Right family, wrong thing to do about it' : 'That family does not behave that way',
          detail: idOk ? sc.consequences[this.bAction] : t.explain };
        effect = sc.effect.bad;
      }
      this.gRecord('b', good, !this.bAttempted);
      this.recordWorld({ icon: v.icon, tone: v.tone,
        text: `${sc.system}, ${good ? 'family called' : 'family missed'}`, effect });
      this.bAttempted = true; this.bChecked = true;
      this.bVerdict = v; this.claimScreen('families', sc, v, false); this.lastVerdict = v;
    },
    nextB() { this.newB(); },

    // ======================= C.5(C) the trends bench =======================
    get prop() { return TREND_PROPS.find(p => p.key === this.trendProp); },
    get run() { return TREND_RUNS.find(r => r.key === this.trendRun); },
    heatRange(field) { return HEAT_RANGES[field]; },
    heatColor(field, value) {
      if (value == null) return null;
      const { min, max } = this.heatRange(field);
      const t = max > min ? (value - min) / (max - min) : 0.5;
      const ch = i => Math.round(HEAT_LO[i] + (HEAT_HI[i] - HEAT_LO[i]) * t);
      return { bg: `rgb(${ch(0)} ${ch(1)} ${ch(2)})`, dark: t > 0.55 };
    },
    get heatLegend() { return this.heatRange(this.prop.field); },

    newC() {
      this.cSc = this.nextScenario('c');
      this.cPair = pick(SCENARIO_PAIRS[this.cSc.id]);
      this.cPick = null; this.cAction = null; this.cChecked = false; this.cAttempted = false; this.cVerdict = null;
      this.trendProp = this.cPair.property;
      this.selectEl(this.cSc.cell);
      this.releaseScreen('trends', false);
    },
    get cTask() { return this.taskOf(this.cSc); },
    get cPairProp() { return TREND_PROPS.find(p => p.key === this.cPair.property); },
    get cVerb() { return COMPARE_VERB[this.cPair.property]; },
    get cAsk() { return `Which of these two has the ${this.cVerb}?`; },
    cPairValue(sym) {
      const v = BY_SYM[sym][this.cPairProp.field];
      return v == null ? 'n/a' : `${v} ${this.cPairProp.unit}`.trim();
    },
    // Generated, so the explanation is generated with it and cannot drift from the data.
    get cExplain() {
      const p = this.cPairProp, pr = this.cPair;
      return `${pr.trendLead}, ${p.label.toLowerCase()} ${pr.moves}: ${pr.a} reads ${this.cPairValue(pr.a)} and ${pr.b} reads ${this.cPairValue(pr.b)}. ${p.why}`;
    },
    pickC(sym) { if (!this.cChecked) this.cPick = sym; },
    pickCAction(k) { if (!this.cChecked) this.cAction = k; },
    cState(sym) {
      if (!this.cChecked) return this.cPick === sym ? 'on' : '';
      if (sym === this.cPair.answer) return 'correct';
      if (sym === this.cPick) return 'wrong';
      return '';
    },
    cActionState(k) {
      if (!this.cChecked) return this.cAction === k ? 'on' : '';
      if (k === this.cTask.actionTrue) return 'correct';
      if (k === this.cAction) return 'wrong';
      return '';
    },
    get cReady() { return !!this.cPick && !!this.cAction && !this.cChecked; },
    commitC() {
      if (!this.cReady) return;
      const sc = this.cSc, t = this.cTask;
      const idOk = this.cPick === this.cPair.answer, actOk = this.cAction === t.actionTrue;
      const good = idOk && actOk;
      let v, effect;
      if (good) {
        v = { tone: 'success', icon: sc.icon, state: 'CELL CONFIRMED', headline: 'The trend decided the part',
          detail: `${sc.consequences[this.cAction]} ${sc.cell} goes on the board.` };
        effect = sc.effect.good;
      } else {
        v = { tone: 'fail', icon: '\u{1F4C8}', state: idOk ? 'WRONG PART' : 'WRONG WAY ROUND',
          headline: idOk ? 'The comparison was right and the part was not' : 'The trend runs the other way',
          detail: idOk ? sc.consequences[this.cAction] : this.cExplain };
        effect = sc.effect.bad;
      }
      this.gRecord('c', good, !this.cAttempted);
      this.recordWorld({ icon: v.icon, tone: v.tone,
        text: `${sc.system}, ${good ? 'trend read correctly' : 'trend read backwards'}`, effect });
      this.cAttempted = true; this.cChecked = true;
      this.cVerdict = v; this.claimScreen('trends', sc, v, false); this.lastVerdict = v;
      if (this.gMastered('c') && this.honors) this.$nextTick(() => {
        this.buildCharts();
        this.resizeCharts();
      });
    },
    nextC() { this.newC(); },

    // ======================= Honors h1: Zeff and shielding =======================
    // Period 3, main group only: the row the datasheet in the scenario actually covers.
    get zeffRows() {
      return ['Na', 'Mg', 'Al', 'Si', 'P', 'S', 'Cl', 'Ar'].map(s => {
        const el = BY_SYM[s];
        return { sym: s, group: el.group, zeff: effectiveNuclearCharge(el.z), radius: el.radius, ie1: el.ie1 };
      });
    },
    get h1Task() { return SCENARIO_TASKS['h1-shielding']; },
    pickH1(k) { if (!this.h1Checked) this.h1Pick = k; },
    pickH1Action(k) { if (!this.h1Checked) this.h1Action = k; },
    h1State(k) {
      if (!this.h1Checked) return this.h1Pick === k ? 'on' : '';
      if (k === this.h1Task.answer) return 'correct';
      if (k === this.h1Pick) return 'wrong';
      return '';
    },
    h1ActionState(k) {
      if (!this.h1Checked) return this.h1Action === k ? 'on' : '';
      if (k === this.h1Task.actionTrue) return 'correct';
      if (k === this.h1Action) return 'wrong';
      return '';
    },
    get h1Ready() { return !!this.h1Pick && !!this.h1Action && !this.h1Checked; },
    commitH1() {
      if (!this.h1Ready) return;
      const sc = this.h1Brief, t = this.h1Task;
      const good = this.h1Pick === t.answer && this.h1Action === t.actionTrue;
      const rows = this.zeffRows;
      const first = rows[0], last = rows[rows.length - 1];
      let v;
      if (good) {
        v = { tone: 'success', icon: sc.icon, state: 'CELL CONFIRMED', headline: 'One quantity explains the whole row',
          detail: `Zeff runs from ${first.zeff.toFixed(2)} at ${first.sym} to ${last.zeff.toFixed(2)} at ${last.sym} while the radius falls ${first.radius} to ${last.radius} pm. ${sc.consequences[this.h1Action]}` };
      } else {
        v = { tone: 'fail', icon: '\u{1F9F2}', state: 'NOT THE REASON', headline: 'That is not what tightens the row',
          detail: t.explain };
      }
      this.gRecord('h1', good, !this.h1Attempted);
      this.recordWorld({ icon: v.icon, tone: v.tone,
        text: `Period 3 datasheet, ${good ? 'shielding argument recorded' : 'reason missed'}`,
        effect: good ? sc.effect.good : sc.effect.bad });
      this.h1Attempted = true; this.h1Checked = true;
      this.h1Verdict = v; this.claimScreen('trends', sc, v, true); this.lastVerdict = v;
    },
    nextH1() {
      this.h1Pick = null; this.h1Action = null; this.h1Checked = false;
      this.h1Attempted = false; this.h1Verdict = null;
      this.releaseScreen('trends', true);
    },

    // ======================= Honors h2: the ionization dips =======================
    newH2() {
      this.h2Anom = pick(IE_ANOMALIES);
      this.h2Pick = null; this.h2Action = null; this.h2Checked = false;
      this.h2Attempted = false; this.h2Verdict = null;
      this.releaseScreen('trends', true);
    },
    get h2Task() { return SCENARIO_TASKS['h2-dip']; },
    get h2Answer() { return ANOMALY_ANSWER[this.h2Anom.label]; },
    get h2Drop() {
      const a = BY_SYM[this.h2Anom.from], b = BY_SYM[this.h2Anom.to];
      return { from: a, to: b, delta: b.ie1 - a.ie1 };
    },
    pickH2(k) { if (!this.h2Checked) this.h2Pick = k; },
    pickH2Action(k) { if (!this.h2Checked) this.h2Action = k; },
    h2State(k) {
      if (!this.h2Checked) return this.h2Pick === k ? 'on' : '';
      if (k === this.h2Answer) return 'correct';
      if (k === this.h2Pick) return 'wrong';
      return '';
    },
    h2ActionState(k) {
      if (!this.h2Checked) return this.h2Action === k ? 'on' : '';
      if (k === this.h2Task.actionTrue) return 'correct';
      if (k === this.h2Action) return 'wrong';
      return '';
    },
    get h2Ready() { return !!this.h2Pick && !!this.h2Action && !this.h2Checked; },
    commitH2() {
      if (!this.h2Ready) return;
      const sc = this.h2Brief;
      const good = this.h2Pick === this.h2Answer && this.h2Action === this.h2Task.actionTrue;
      const d = this.h2Drop;
      let v;
      if (good) {
        v = { tone: 'success', icon: sc.icon, state: 'CELL CONFIRMED', headline: 'The exception has a reason',
          detail: `${d.from.sym} to ${d.to.sym} drops ${Math.abs(d.delta)} kJ/mol. ${this.h2Anom.explain}` };
      } else {
        v = { tone: 'fail', icon: '\u{1F4C9}', state: 'WRONG DIP', headline: 'That is the other dip, or none of them',
          detail: this.h2Anom.explain };
      }
      this.gRecord('h2', good, !this.h2Attempted);
      this.recordWorld({ icon: v.icon, tone: v.tone,
        text: `${this.h2Anom.label} dip, ${good ? 'reason recorded' : 'reason missed'}`,
        effect: good ? sc.effect.good : sc.effect.bad });
      this.h2Attempted = true; this.h2Checked = true;
      this.h2Verdict = v; this.claimScreen('trends', sc, v, true); this.lastVerdict = v;
    },
    nextH2() { this.newH2(); },

    // ======================= Capstone: the substitute part =======================
    get capUnlocked() { return this.gOverall() === 1; },
    // Mendeleev's own move, on a cell whose neighbours are both in the set: the datasheet
    // is blacked out, and the radius of the missing element is predicted from the two
    // elements either side of it in period 4. Co is 152 pm and Cu is 145, so the mean is
    // 148.5 against nickel's real 149. The prediction is checkable because the answer
    // exists, which is exactly why anyone believed the gapped table.
    //
    // The three-way call is resolved from the substitute this roll offered and the board
    // the learner actually built, never from a stored key.
    genCapstone() {
      const sc = this.scenarioById('cap-substitute');
      const req = BY_SYM.Ni, sub = pick(CAP_SUBSTITUTES);
      const subEl = BY_SYM[sub.sym];
      const left = BY_SYM.Co, right = BY_SYM.Cu;
      const gap = subEl.reactivity - req.reactivity;
      this.cap = {
        sc, req, sub, subEl, left, right, gap,
        predicted: (left.radius + right.radius) / 2,
        // Corrosion first: a substitute this much more reactive than the part it replaces
        // pits against the board whatever else is true of it. Then family: same family and
        // a family the learner has actually established on the board can be vouched for.
        // Anything else is a wait, which is the honest answer rather than a punishment.
        correct: gap >= 13 ? 'nofit'
          : (subEl.family === req.family && this.boardFamilies.has(subEl.family)) ? 'fit'
            : 'wait'
      };
      this.capInput = ''; this.capPick = null;
      this.capChecked = false; this.capAttempted = false; this.capWin = false; this.capVerdict = null;
      this.releaseScreen('capstone', false);
    },
    capPickAction(k) { if (!this.capWin) { this.capPick = k; this.capChecked = false; } },
    capActionState(k) {
      if (!this.capChecked) return this.capPick === k ? 'on' : '';
      if (k === this.cap.correct) return 'correct';
      if (k === this.capPick) return 'wrong';
      return '';
    },
    // Absolute, not relative: the neighbours bracket the answer within 7 pm, so a relative
    // band would be looser than the prediction method itself can resolve.
    get capNumOk() {
      const val = parseFloat(this.capInput);
      return this.cap && isFinite(val) && Math.abs(val - BY_SYM.Ni.radius) <= 4 + 1e-9;
    },
    get capReady() { return this.capInput !== '' && !!this.capPick && !this.capWin; },
    get capActions() {
      return [
        { k: 'fit', label: 'Fit the substitute' },
        { k: 'wait', label: 'Order the correct part' },
        { k: 'nofit', label: 'Refuse it for this board' }
      ];
    },
    capCommit() {
      if (!this.capReady) return;
      const c = this.cap, sc = c.sc;
      const numOk = this.capNumOk, callOk = this.capPick === c.correct;
      const good = numOk && callOk;
      let v, effect;
      if (good) {
        v = { tone: 'success', icon: sc.icon, state: 'CALL MADE', headline: 'Predicted the row, then called the part',
          detail: `Co ${c.left.radius} pm and Cu ${c.right.radius} pm bracket the blank at about ${c.predicted.toFixed(1)} pm; nickel is ${c.req.radius}. ${sc.consequences[this.capPick]}` };
        effect = sc.effect.good;
        this.capWin = true;
      } else {
        v = { tone: 'fail', icon: numOk ? '\u{1F527}' : '\u{1F4D0}',
          state: numOk ? 'WRONG CALL' : 'PREDICT IT FIRST',
          headline: numOk ? 'The prediction held and the call did not' : 'Read the neighbours before you decide',
          detail: numOk
            ? `${c.sub.sym} sits ${c.gap >= 0 ? '+' : ''}${c.gap} on the reactivity index against nickel, and it is a ${FAMILY_LABELS[c.subEl.family].toLowerCase()}. ${sc.consequences[this.capPick]}`
            : `The blank sits between Co at ${c.left.radius} pm and Cu at ${c.right.radius} pm, so it has to be about ${c.predicted.toFixed(1)} pm. That is Mendeleev's method and it lands within 1 pm of the real value.` };
        effect = sc.effect.bad;
      }
      this.gRecord('cap', good, !this.capAttempted);
      this.recordWorld({ icon: v.icon, tone: v.tone,
        text: `Substitute part, ${good ? 'call made on the data' : 'call not supported'}`, effect });
      this.capAttempted = true; this.capChecked = true;
      this.capVerdict = v; this.claimScreen('capstone', sc, v, false); this.lastVerdict = v;
    },
    capNext() { this.genCapstone(); },

    // ======================= charts =======================
    trendData() {
      const field = this.prop.field, labels = [], values = [];
      for (const it of this.run.items) {
        if (it && typeof it === 'object' && it.gap) { labels.push(it.gap); values.push(null); continue; }
        const el = BY_SYM[it];
        labels.push(it);
        values.push(el && el[field] != null ? el[field] : null);
      }
      return { labels, values };
    },
    updateTrendChart() {
      if (!trendChart) return;
      const { labels, values } = this.trendData();
      const title = this.prop.label + ' (' + this.prop.unit + ')';
      trendChart.data.labels = labels;
      trendChart.data.datasets[0].data = values;
      trendChart.data.datasets[0].label = title;
      trendChart.options.scales.y.title.text = title;
      trendChart.update();
    },
    get trendCaption() {
      const p = this.prop, r = this.run;
      if (r.type === 'period') return `Across ${r.label.replace(', across', '')} (left to right), ${p.label.toLowerCase()} ${p.across}.`;
      return `Down ${r.label.replace(', down', '')} (top to bottom), ${p.label.toLowerCase()} ${p.down}.`;
    },
    get trendHasGap() { return this.run.items.some(it => it && typeof it === 'object' && it.gap); },
    ieData() {
      const syms = ['Li', 'Be', 'B', 'C', 'N', 'O', 'F', 'Ne'];
      const dips = new Set(IE_ANOMALIES.map(a => a.to));
      return {
        labels: syms,
        values: syms.map(s => BY_SYM[s].ie1),
        pointColors: syms.map(s => dips.has(s) ? '#c0772f' : '#1d5b66'),
        pointRadii: syms.map(s => dips.has(s) ? 7 : 3)
      };
    },
    buildCharts() {
      if (typeof Chart === 'undefined') return;
      if (this.$refs.trendCanvas && !trendChart) {
        trendChart = lineChart(this.$refs.trendCanvas, {
          labels: [], xType: 'category',
          datasets: [{
            label: '', data: [], borderColor: '#2a7d8a', backgroundColor: 'rgb(42 125 138 / 12%)',
            borderWidth: 2, pointRadius: 4, pointBackgroundColor: '#2a7d8a', tension: 0.2, spanGaps: false, fill: false
          }],
          xTitle: '', yTitle: '', beginAtZero: false
        });
        this.updateTrendChart();
      }
      if (this.$refs.ieCanvas && !ieChart) {
        const d = this.ieData();
        ieChart = lineChart(this.$refs.ieCanvas, {
          labels: d.labels, xType: 'category',
          datasets: [{
            label: 'First ionization energy (kJ/mol)', data: d.values,
            borderColor: '#95591f', backgroundColor: 'rgb(192 119 47 / 12%)',
            borderWidth: 2, pointRadius: d.pointRadii, pointBackgroundColor: d.pointColors, tension: 0.2, fill: true
          }],
          xTitle: 'Period 2 element (left to right)', yTitle: 'First IE (kJ/mol)', beginAtZero: false
        });
      }
    },
    resizeCharts() { trendChart?.resize(); ieChart?.resize(); }
  };
}
