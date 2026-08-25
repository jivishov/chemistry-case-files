// main.js: Unit 3 view-model (Periodic Table & Trends, TEKS C.5 A-C).
// Keeps the existing mechanics while presenting scientific data, activity-only
// simulation scores, and generated feedback with explicit instructional wording.
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

let trendChart = null, ieChart = null;

const pick = a => a[(Math.random() * a.length) | 0];

const ELEMENTS_FULL = ELEMENT_DATA.map(d => {
  const ref = ELEMENTS.find(e => e.sym === d.sym);
  return {
    ...d,
    z: ref.z,
    name: ref.name,
    mass: ATOMIC_MASS[d.sym],
    en: ELECTRONEGATIVITY[d.sym] ?? null,
    period: period(ref.z)
  };
});
const BY_SYM = Object.fromEntries(ELEMENTS_FULL.map(e => [e.sym, e]));

const HEAT_RANGES = Object.fromEntries(TREND_PROPS.map(p => {
  const vals = ELEMENTS_FULL.map(e => e[p.field]).filter(v => v != null);
  return [p.field, { min: Math.min(...vals), max: Math.max(...vals) }];
}));

const MAIN_GROUP = new Set([1, 2, 13, 14, 15, 16, 17, 18]);
const COMPARE_VERB = {
  radius: 'larger atomic radius',
  ie1: 'higher first ionization energy',
  en: 'higher electronegativity',
  mass: 'greater atomic mass'
};
const HEAT_LO = [234, 243, 244], HEAT_HI = [21, 69, 78];
const GAP_MIN = { radius: 25, ie1: 150, en: 0.5, mass: 8 };

// Build only comparisons that can be defended from one row/group trend (or from
// atomic-number order for atomic mass) and whose actual data agree with that trend.
function trendComparison(p, x, y) {
  const va = x[p.field], vb = y[p.field];
  if (va == null || vb == null) return null;
  if (Math.abs(va - vb) < GAP_MIN[p.key]) return null;

  const sameRow = x.period === y.period, sameCol = x.group === y.group;
  let left, moves, pairNote, trendLead;
  if (sameRow && sameCol) {
    return null;
  } else if (sameRow || sameCol) {
    left = sameRow ? (x.group < y.group ? x : y) : (x.period < y.period ? x : y);
    moves = sameRow ? p.across : p.down;
    pairNote = sameRow ? 'same period' : 'same group';
    trendLead = sameRow ? `Across Period ${left.period}` : `Down Group ${left.group}`;
  } else if (p.across === p.down) {
    left = x.z < y.z ? x : y;
    moves = p.across;
    pairNote = 'by atomic number';
    trendLead = 'In atomic-number order';
  } else {
    return null;
  }
  const right = left === x ? y : x;
  const dataRises = right[p.field] > left[p.field];
  const trendRises = moves.includes('increases');
  if (trendRises !== dataRises) return null;

  return {
    property: p.key,
    a: left.sym,
    b: right.sym,
    answer: dataRises ? right.sym : left.sym,
    pairNote,
    trendLead,
    moves
  };
}

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
      throw new Error(`${id}: no trend property can compare ${parts[0].sym} with ${parts[1].sym}`);
    }
  }
  return out;
}
export const SCENARIO_PAIRS = buildScenarioPairs();

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

const skills = [
  { id: 'a', code: 'C.5(A)', label: 'How the table developed', target: 3 },
  { id: 'b', code: 'C.5(B)', label: 'Chemical families', target: 3 },
  { id: 'c', code: 'C.5(C)', label: 'Periodic trends', target: 3 },
  { id: 'h1', code: 'Honors', label: 'Zeff and shielding', target: 2, honors: true },
  { id: 'h2', code: 'Honors', label: 'Ionization dips', target: 2, honors: true },
  { id: 'cap', code: 'Capstone', label: 'The substitute part', target: 1, honors: true }
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

    board: [],
    returns: 0,
    day: 0,
    worldLog: [],
    lastVerdict: null,
    modeVerdict: { table: null, families: null, trends: null, capstone: null },
    screenOf: { table: null, families: null, trends: null, capstone: null },
    _wid: 0,
    scIdx: { a: -1, b: -1, c: -1 },

    aSc: null, aPick: null, aAction: null,
    aChecked: false, aAttempted: false, aVerdict: null,
    moseleyOn: false,

    bSc: null, bPick: null, bAction: null,
    bChecked: false, bAttempted: false, bVerdict: null,
    famKey: 'alkali',

    cSc: null, cPair: null, cPick: null, cAction: null,
    cChecked: false, cAttempted: false, cVerdict: null,
    trendProp: 'radius', trendRun: 'p2',

    h1Pick: null, h1Action: null, h1Checked: false, h1Attempted: false, h1Verdict: null,
    h2Anom: null, h2Pick: null, h2Action: null, h2Checked: false, h2Attempted: false, h2Verdict: null,

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
        ['trendProp', 'trendRun'].forEach(k => {
          const v = this[k];
          this[k] = null;
          this[k] = v;
        });
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
      this.$nextTick(() => {
        this.buildCharts();
        this.resizeCharts();
      });
    },

    resetProgress() {
      ieChart?.destroy();
      ieChart = null;
      this.gReset();
      this.board = [];
      this.returns = 0;
      this.day = 0;
      this.worldLog = [];
      this.scIdx = { a: -1, b: -1, c: -1 };
      this.screenOf = { table: null, families: null, trends: null, capstone: null };
      this.clearOutcome();
      this.newA();
      this.newB();
      this.newC();
      this.newH2();
      this.cap = null;
      this.capWin = false;
      this.capInput = '';
      this.capPick = null;
      this.h1Pick = null;
      this.h1Action = null;
      this.h1Checked = false;
      this.h1Attempted = false;
      this.$nextTick(() => {
        this.buildCharts();
        this.resizeCharts();
      });
    },

    clearOutcome() {
      this.aVerdict = null;
      this.bVerdict = null;
      this.cVerdict = null;
      this.h1Verdict = null;
      this.h2Verdict = null;
      this.capVerdict = null;
      this.modeVerdict = { table: null, families: null, trends: null, capstone: null };
      this.lastVerdict = null;
    },

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
    releaseScreen(mode, honors) {
      const screen = this.screenOf[mode];
      if (!honors || !screen || screen.honors) {
        this.screenOf[mode] = null;
        this.modeVerdict[mode] = null;
      }
    },

    recordWorld({ icon, tone, text, effect }) {
      this.day++;
      const e = effect || {};
      if (e.add) {
        const spec = BOARD_CELLS.find(c => c.sym === e.add);
        if (spec && !this.board.some(c => c.sym === e.add)) {
          this.board = [...this.board, { ...spec }];
        }
      }
      if (e.drop && this.board.length > 1) {
        let idx = -1;
        for (let i = this.board.length - 1; i >= 0; i--) {
          if (this.board[i].family === e.drop) { idx = i; break; }
        }
        if (idx < 0) idx = this.board.length - 1;
        const gone = this.board[idx];
        this.board = this.board.filter((_, i) => i !== idx);
        this.returns++;
        this.worldLog = [{
          id: ++this._wid,
          icon: '\u{21A9}\u{FE0F}',
          tone: 'warn',
          text: `Day ${this.day}: ${gone.sym} was removed after an incorrect response.`
        }, ...this.worldLog].slice(0, 6);
      }
      this.worldLog = [{
        id: ++this._wid,
        icon,
        tone,
        text: `Day ${this.day}: ${text}`
      }, ...this.worldLog].slice(0, 6);
    },

    get cellsConfirmed() { return this.board.length; },
    get cellsTotal() { return BOARD_CELLS.length; },
    get boardPct() { return Math.round(100 * this.board.length / BOARD_CELLS.length); },
    get boardFamilies() { return new Set(this.board.map(c => c.family)); },
    get boardState() {
      if (this.returns === 0) return 'BOARD ON TRACK';
      if (this.returns <= 2) return 'REVISIONS NEEDED';
      return 'MULTIPLE REVISIONS';
    },
    get boardTone() { return this.returns === 0 ? 'safe' : this.returns <= 2 ? 'warn' : 'danger'; },
    get boardMood() { return this.returns === 0 ? '\u{1F527}' : this.returns <= 2 ? '\u{1F4DD}' : '\u{1F4CB}'; },
    stockColor(v) { return v >= 67 ? 'var(--success)' : v >= 34 ? 'var(--warn)' : 'var(--danger)'; },

    get boardRows() {
      const coreTotal = BOARD_CELLS.filter(c => /^(a|b|c)-/.test(c.from)).length;
      const coreHave = this.board.filter(c => /^(a|b|c)-/.test(c.from)).length;
      const extensionTotal = BOARD_CELLS.length - coreTotal;
      const extensionHave = this.board.length - coreHave;
      return [
        { key: 'confirmed', label: 'Confirmed', title: 'Confirmed cells on the board',
          value: `${this.cellsConfirmed}/${this.cellsTotal}`, pct: this.boardPct, fill: this.stockColor(this.boardPct) },
        { key: 'core', label: 'Core', title: 'Confirmed core C.5 cells',
          value: `${coreHave}/${coreTotal}`, pct: Math.round(100 * coreHave / coreTotal), fill: 'var(--accent)' },
        { key: 'extensions', label: 'Extensions', title: 'Confirmed Honors and capstone cells',
          value: `${extensionHave}/${extensionTotal}`, pct: Math.round(100 * extensionHave / extensionTotal), fill: 'var(--honors)' },
        { key: 'returns', label: 'Revisions', title: 'Cells removed after incorrect responses',
          value: this.returns ? String(this.returns) : 'none', pct: Math.min(100, this.returns * 34),
          fill: this.returns ? 'var(--danger)' : 'var(--success)' }
      ];
    },

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
      return b && b.system ? b.system : 'The repair bench';
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
      return 'Select an activity and use the evidence to answer the chemistry question.';
    },

    get activeReference() {
      const out = [];
      if (this.mode === 'table') {
        out.push({ k: 'Modern order', v: 'atomic number, not atomic mass' });
        out.push({ k: 'Examples', v: 'Ar before K; Co before Ni' });
        out.push({ k: 'Mendeleev', v: 'used periodic gaps to make testable predictions' });
      } else if (this.mode === 'families') {
        out.push({ k: 'Groups 1 / 2', v: '1 or 2 valence electrons; common ions +1 or +2' });
        out.push({ k: 'Groups 17 / 18', v: 'halogens commonly form -1 ions; noble gases rarely form ions' });
        out.push({ k: 'Groups 3-12', v: 'd-block metals; oxidation states and reactivity vary' });
      } else if (this.mode === 'trends') {
        if (this.screenIsHonors && this.activeBrief?.id === 'h1-shielding') {
          out.push({ k: 'Activity model', v: 'Zeff = Z - core electrons' });
          out.push({ k: 'Across Period 3', v: 'model Zeff rises while core-electron count stays constant' });
          out.push({ k: 'General result', v: 'radius decreases; first ionization energy generally increases' });
        } else if (this.screenIsHonors && this.activeBrief?.id === 'h2-dip') {
          out.push({ k: 'Be to B', v: 'B loses a higher-energy 2p electron' });
          out.push({ k: 'N to O', v: 'electron pairing increases repulsion in O' });
          out.push({ k: 'Interpretation', v: 'both are electron-configuration effects, not random noise' });
        } else {
          out.push({ k: 'Across a period', v: 'radius generally decreases; IE and EN generally increase' });
          out.push({ k: 'Down a group', v: 'radius increases; IE and EN generally decrease' });
          out.push({ k: 'Use carefully', v: 'periodic trends compare atoms; engineering choices need additional data' });
        }
      } else if (this.mode === 'capstone' && this.cap) {
        out.push({ k: 'Radius estimate', v: `Co ${BY_SYM.Co.radius} pm; Cu ${BY_SYM.Cu.radius} pm` });
        out.push({ k: 'Activity tolerance', v: 'estimate must be within 4 pm of the reference value' });
        out.push({ k: 'Activity rule', v: 'simulation-score gap ≥13 means “do not fit”; not a scientific corrosion threshold' });
      }
      return out.slice(0, 3);
    },

    seCaption(se) {
      if (this.gMastered(se.id)) return 'Mastered';
      const sk = this.g_skills[se.id];
      const def = this.g_skillDefs.find(d => d.id === se.id) || {};
      return `${sk ? sk.run : 0} of ${def.target || 3} correct in a row`;
    },

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
    get heatCells() { return ELEMENTS_FULL.map(el => ({ sym: el.sym, ...cellXY(el.sym) })); },
    get inversionSyms() { return MASS_ORDER_INVERSIONS.filter(p => p.onGrid).flatMap(p => [p.a, p.b]); },
    triadAvg(tr) { return ((tr.els[0].mass + tr.els[2].mass) / 2).toFixed(1); },

    newA() {
      this.aSc = this.nextScenario('a');
      this.aPick = null;
      this.aAction = null;
      this.aChecked = false;
      this.aAttempted = false;
      this.aVerdict = null;
      this.moseleyOn = this.aSc.id === 'a-warehouse';
      if (this.aSc.id === 'a-datasheet') this.selectEl(MENDELEEV_GAP.answer);
      this.releaseScreen('table', false);
    },
    get aTask() { return this.taskOf(this.aSc); },
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
        v = {
          tone: 'success', icon: sc.icon, state: 'RESPONSE CORRECT',
          headline: 'Evidence and next step are supported',
          detail: `${sc.consequences[this.aAction]} ${sc.cell} is confirmed on the board.`
        };
        effect = sc.effect.good;
      } else {
        v = {
          tone: 'fail', icon: '\u{1F4CD}', state: idOk ? 'REVISE THE ACTION' : 'RECHECK THE EVIDENCE',
          headline: idOk ? 'The chemistry answer is correct; revise the next step' : 'Compare the evidence again',
          detail: idOk ? sc.consequences[this.aAction] : t.explain
        };
        effect = sc.effect.bad;
      }
      this.gRecord('a', good, !this.aAttempted);
      this.recordWorld({
        icon: v.icon, tone: v.tone,
        text: `${sc.system}: ${good ? 'response correct' : 'response needs revision'}`,
        effect
      });
      this.aAttempted = true;
      this.aChecked = true;
      this.aVerdict = v;
      this.claimScreen('table', sc, v, false);
      this.lastVerdict = v;
    },
    nextA() { this.newA(); },

    newB() {
      this.bSc = this.nextScenario('b');
      this.bPick = null;
      this.bAction = null;
      this.bChecked = false;
      this.bAttempted = false;
      this.bVerdict = null;
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
        v = {
          tone: 'success', icon: sc.icon, state: 'RESPONSE CORRECT',
          headline: 'Family pattern identified',
          detail: `${sc.consequences[this.bAction]} ${sc.cell} is confirmed on the board.`
        };
        effect = sc.effect.good;
      } else {
        v = {
          tone: 'fail', icon: '\u{26A0}\u{FE0F}', state: idOk ? 'REVISE THE ACTION' : 'RECHECK THE FAMILY',
          headline: idOk ? 'The family is correct; revise the next step' : 'Use the valence pattern to identify the family',
          detail: idOk ? sc.consequences[this.bAction] : t.explain
        };
        effect = sc.effect.bad;
      }
      this.gRecord('b', good, !this.bAttempted);
      this.recordWorld({
        icon: v.icon, tone: v.tone,
        text: `${sc.system}: ${good ? 'family identified' : 'response needs revision'}`,
        effect
      });
      this.bAttempted = true;
      this.bChecked = true;
      this.bVerdict = v;
      this.claimScreen('families', sc, v, false);
      this.lastVerdict = v;
    },
    nextB() { this.newB(); },

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
      this.cPick = null;
      this.cAction = null;
      this.cChecked = false;
      this.cAttempted = false;
      this.cVerdict = null;
      this.trendProp = this.cPair.property;
      this.selectEl(this.cSc.cell);
      this.releaseScreen('trends', false);
    },
    get cTask() { return this.taskOf(this.cSc); },
    get cPairProp() { return TREND_PROPS.find(p => p.key === this.cPair.property); },
    get cVerb() { return COMPARE_VERB[this.cPair.property]; },
    get cAsk() { return `Which element has the ${this.cVerb}?`; },
    cPairValue(sym) {
      const v = BY_SYM[sym][this.cPairProp.field];
      return v == null ? 'n/a' : `${v} ${this.cPairProp.unit}`.trim();
    },
    get cExplain() {
      const p = this.cPairProp, pr = this.cPair;
      return `${pr.trendLead}, ${p.label.toLowerCase()} ${pr.moves}: ${pr.a} is ${this.cPairValue(pr.a)} and ${pr.b} is ${this.cPairValue(pr.b)}. ${p.why}`;
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
        v = {
          tone: 'success', icon: sc.icon, state: 'RESPONSE CORRECT',
          headline: 'Trend comparison correct',
          detail: `${sc.consequences[this.cAction]} ${sc.cell} is confirmed on the board. The periodic comparison supports the chemistry step; the repair choice follows the supplied scenario specification.`
        };
        effect = sc.effect.good;
      } else {
        v = {
          tone: 'fail', icon: '\u{1F4C8}', state: idOk ? 'REVISE THE ACTION' : 'RECHECK THE TREND',
          headline: idOk ? 'The periodic comparison is correct; check the supplied repair specification' : 'Compare the two values and the direction of the trend',
          detail: idOk ? sc.consequences[this.cAction] : this.cExplain
        };
        effect = sc.effect.bad;
      }
      this.gRecord('c', good, !this.cAttempted);
      this.recordWorld({
        icon: v.icon, tone: v.tone,
        text: `${sc.system}: ${good ? 'trend comparison correct' : 'response needs revision'}`,
        effect
      });
      this.cAttempted = true;
      this.cChecked = true;
      this.cVerdict = v;
      this.claimScreen('trends', sc, v, false);
      this.lastVerdict = v;
      if (this.gMastered('c') && this.honors) this.$nextTick(() => {
        this.buildCharts();
        this.resizeCharts();
      });
    },
    nextC() { this.newC(); },

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
        v = {
          tone: 'success', icon: sc.icon, state: 'RESPONSE CORRECT',
          headline: 'Simplified Zeff model applied',
          detail: `In this activity model, Zeff changes from ${first.zeff.toFixed(2)} for ${first.sym} to ${last.zeff.toFixed(2)} for ${last.sym} while atomic radius decreases from ${first.radius} to ${last.radius} pm. These Zeff values are model outputs, not measured values. ${sc.consequences[this.h1Action]}`
        };
      } else {
        v = {
          tone: 'fail', icon: '\u{1F9F2}', state: 'RECHECK THE MODEL',
          headline: 'Use the simplified effective-nuclear-charge model',
          detail: t.explain
        };
      }
      this.gRecord('h1', good, !this.h1Attempted);
      this.recordWorld({
        icon: v.icon, tone: v.tone,
        text: `Period 3 model: ${good ? 'Zeff explanation recorded' : 'explanation needs revision'}`,
        effect: good ? sc.effect.good : sc.effect.bad
      });
      this.h1Attempted = true;
      this.h1Checked = true;
      this.h1Verdict = v;
      this.claimScreen('trends', sc, v, true);
      this.lastVerdict = v;
    },
    nextH1() {
      this.h1Pick = null;
      this.h1Action = null;
      this.h1Checked = false;
      this.h1Attempted = false;
      this.h1Verdict = null;
      this.releaseScreen('trends', true);
    },

    newH2() {
      this.h2Anom = pick(IE_ANOMALIES);
      this.h2Pick = null;
      this.h2Action = null;
      this.h2Checked = false;
      this.h2Attempted = false;
      this.h2Verdict = null;
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
        v = {
          tone: 'success', icon: sc.icon, state: 'RESPONSE CORRECT',
          headline: 'Electron-configuration effect identified',
          detail: `${d.from.sym} to ${d.to.sym} decreases by ${Math.abs(d.delta)} kJ/mol. ${this.h2Anom.explain}`
        };
      } else {
        v = {
          tone: 'fail', icon: '\u{1F4C9}', state: 'RECHECK THE EXCEPTION',
          headline: 'Match the explanation to the highlighted pair',
          detail: this.h2Anom.explain
        };
      }
      this.gRecord('h2', good, !this.h2Attempted);
      this.recordWorld({
        icon: v.icon, tone: v.tone,
        text: `${this.h2Anom.label}: ${good ? 'electron-configuration reason recorded' : 'explanation needs revision'}`,
        effect: good ? sc.effect.good : sc.effect.bad
      });
      this.h2Attempted = true;
      this.h2Checked = true;
      this.h2Verdict = v;
      this.claimScreen('trends', sc, v, true);
      this.lastVerdict = v;
    },
    nextH2() { this.newH2(); },

    get capUnlocked() { return this.gOverall() === 1; },
    genCapstone() {
      const sc = this.scenarioById('cap-substitute');
      const req = BY_SYM.Ni, sub = pick(CAP_SUBSTITUTES);
      const subEl = BY_SYM[sub.sym];
      const left = BY_SYM.Co, right = BY_SYM.Cu;
      const gap = subEl.reactivity - req.reactivity;
      this.cap = {
        sc, req, sub, subEl, left, right, gap,
        predicted: (left.radius + right.radius) / 2,
        // Activity-only rule. The 0–100 values are simulation scores, not a
        // scientific corrosion scale or an engineering standard.
        correct: gap >= 13 ? 'nofit'
          : (subEl.family === req.family && this.boardFamilies.has(subEl.family)) ? 'fit'
            : 'wait'
      };
      this.capInput = '';
      this.capPick = null;
      this.capChecked = false;
      this.capAttempted = false;
      this.capWin = false;
      this.capVerdict = null;
      this.releaseScreen('capstone', false);
    },
    capPickAction(k) {
      if (!this.capWin) {
        this.capPick = k;
        this.capChecked = false;
      }
    },
    capActionState(k) {
      if (!this.capChecked) return this.capPick === k ? 'on' : '';
      if (k === this.cap.correct) return 'correct';
      if (k === this.capPick) return 'wrong';
      return '';
    },
    get capNumOk() {
      const val = parseFloat(this.capInput);
      return this.cap && isFinite(val) && Math.abs(val - BY_SYM.Ni.radius) <= 4 + 1e-9;
    },
    get capReady() { return this.capInput !== '' && !!this.capPick && !this.capWin; },
    get capActions() {
      return [
        { k: 'fit', label: 'Fit the substitute' },
        { k: 'wait', label: 'Order the specified part' },
        { k: 'nofit', label: 'Do not fit this substitute' }
      ];
    },
    capCommit() {
      if (!this.capReady) return;
      const c = this.cap, sc = c.sc;
      const numOk = this.capNumOk, actionOk = this.capPick === c.correct;
      const good = numOk && actionOk;
      let v, effect;
      if (good) {
        v = {
          tone: 'success', icon: sc.icon, state: 'CAPSTONE COMPLETE',
          headline: 'Estimate and activity rule applied',
          detail: `Co is ${c.left.radius} pm and Cu is ${c.right.radius} pm, giving a midpoint estimate of ${c.predicted.toFixed(1)} pm; the reference radius for Ni is ${c.req.radius} pm. ${sc.consequences[this.capPick]}`
        };
        effect = sc.effect.good;
        this.capWin = true;
      } else {
        v = {
          tone: 'fail', icon: numOk ? '\u{1F527}' : '\u{1F4D0}',
          state: numOk ? 'RECHECK THE ACTIVITY RULE' : 'CHECK THE ESTIMATE',
          headline: numOk ? 'The radius estimate is acceptable; apply the stated simulation criterion' : 'Estimate the missing radius from its neighbors',
          detail: numOk
            ? `${c.sub.sym} differs from Ni by ${Math.abs(c.gap)} points on the activity's 0–100 simulation reactivity score and is classified as ${FAMILY_LABELS[c.subEl.family].toLowerCase()}. The ≥13 cutoff is an activity rule, not a scientific corrosion threshold.`
            : `Co is ${c.left.radius} pm and Cu is ${c.right.radius} pm, so their midpoint is ${c.predicted.toFixed(1)} pm. For this activity, an estimate within 4 pm of the Ni reference value (${c.req.radius} pm) meets the criterion.`
        };
        effect = sc.effect.bad;
      }
      this.gRecord('cap', good, !this.capAttempted);
      this.recordWorld({
        icon: v.icon, tone: v.tone,
        text: `Substitute activity: ${good ? 'criterion applied correctly' : 'response needs revision'}`,
        effect
      });
      this.capAttempted = true;
      this.capChecked = true;
      this.capVerdict = v;
      this.claimScreen('capstone', sc, v, false);
      this.lastVerdict = v;
    },
    capNext() { this.genCapstone(); },

    trendData() {
      const field = this.prop.field, labels = [], values = [];
      for (const it of this.run.items) {
        if (it && typeof it === 'object' && it.gap) {
          labels.push(it.gap);
          values.push(null);
          continue;
        }
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
      if (r.type === 'period') {
        return `Across ${r.label.replace(', across', '')} (left to right), ${p.label.toLowerCase()} ${p.across}.`;
      }
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
