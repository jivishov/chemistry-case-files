// main.js — Unit 3 view-model (Periodic Table & Trends, C.5 A-C).
import {
  SE, ELEMENT_DATA, FAMILY_LABELS, TABLE_HISTORY, MENDELEEV_GAP,
  MASS_ORDER_INVERSIONS, FAMILIES, FAMILY_QUIZ, TREND_PROPS, TREND_RUNS,
  TREND_QUIZ, IE_ANOMALIES
} from './model.js';
import {
  ELEMENTS, ATOMIC_MASS, ELECTRONEGATIVITY, electronConfiguration, formatConfig,
  valenceElectrons, period, effectiveNuclearCharge, fmt
} from '../../../shared/js/chem.js';
import { lineChart } from '../../../shared/js/render.js';

// Chart.js instances live at module scope, never inside Alpine's reactive proxy.
let trendChart = null, ieChart = null;

// Merge the unit's reference data with chem.js facts once. Each entry gains its
// atomic number, name, mass, electronegativity (null when undefined, e.g. noble
// gases), and the derived period. The CSS grid is positioned from period (row)
// and group (column), so no separate row/col fields are needed.
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

// Heatmap min/max per property, computed once over the present (non-null) values
// so the per-cell coloring does not rescan all 37 elements on every render.
const HEAT_RANGES = Object.fromEntries(TREND_PROPS.map(p => {
  const vals = ELEMENTS_FULL.map(e => e[p.field]).filter(v => v != null);
  return [p.field, { min: Math.min(...vals), max: Math.max(...vals) }];
}));

// Main-group columns (used to scope valence + the Honors Zeff demo).
const MAIN_GROUP = new Set([1, 2, 13, 14, 15, 16, 17, 18]);
// The comparison-game verb for each property.
const COMPARE_VERB = {
  radius: 'larger atomic radius', ie1: 'higher first ionization energy',
  en: 'higher electronegativity', mass: 'greater atomic mass'
};
// Heatmap sequential scale endpoints (light -> dark teal/ink; non-copper).
const HEAT_LO = [234, 243, 244], HEAT_HI = [21, 69, 78];

export { SE };

export function createSim() {
  return {
    SE, TABLE_HISTORY, MENDELEEV_GAP, MASS_ORDER_INVERSIONS, FAMILIES,
    TREND_PROPS, TREND_RUNS, IE_ANOMALIES, FAMILY_LABELS, fmt,
    honors: false,
    mode: 'table',
    selectedSym: 'Na',

    // ---- C.5(A) table-history state ----
    moseleyOn: false,
    mgPick: null, mgChecked: false,

    // ---- C.5(B) families state ----
    famKey: 'alkali',
    fqIdx: 0, fqPick: null, fqChecked: false,

    // ---- C.5(C) trends state ----
    trendProp: 'radius', trendRun: 'p2',
    tqIdx: 0, tqPick: null, tqChecked: false,

    init() {
      this.$nextTick(() => {
        this.buildCharts();
        // A <select x-model> binds before its child x-for has rendered its
        // <option>s, so re-apply each value once the option lists exist.
        ['trendProp', 'trendRun'].forEach(k => { const v = this[k]; this[k] = null; this[k] = v; });
      });
      this.$watch('mode', () => this.$nextTick(() => this.resizeCharts()));
      this.$watch('honors', () => this.$nextTick(() => this.resizeCharts()));
      this.$watch('trendProp', () => this.updateTrendChart());
      this.$watch('trendRun', () => this.updateTrendChart());
    },

    // ======================= shared grid + inspector =======================
    get elements() { return ELEMENTS_FULL; },
    elBySym(sym) { return BY_SYM[sym]; },
    selectEl(sym) { if (BY_SYM[sym]) this.selectedSym = sym; },

    get selected() { return BY_SYM[this.selectedSym]; },
    get selConfig() { return formatConfig(electronConfiguration(this.selected.z)); },
    get selValence() { return valenceElectrons(this.selected.z); },
    get selZeff() { return effectiveNuclearCharge(this.selected.z); },
    get selIsMainGroup() { return MAIN_GROUP.has(this.selected.group); },
    get selFamilyLabel() { return FAMILY_LABELS[this.selected.family]; },
    get selEN() { return this.selected.en == null ? '—' : this.selected.en; },

    cellClass(el) {
      const c = ['fam-' + el.family];
      if (el.sym === this.selectedSym) c.push('is-selected');
      if (this.mode === 'families' && this.famKey) {
        c.push(el.family === this.famKey ? 'fam-active' : 'is-dim');
      }
      if (this.mode === 'table' && this.moseleyOn && this.inversionSyms.includes(el.sym)) c.push('is-flagged');
      if (this.mode === 'table' && this.mgChecked && el.sym === MENDELEEV_GAP.answer) c.push('is-gap');
      return c.join(' ');
    },
    cellStyle(el) {
      let s = `grid-column:${el.group};grid-row:${el.period};`;
      if (this.mode === 'trends') {
        const hc = this.heatColor(this.prop.field, el[this.prop.field]);
        if (hc) s += `background:${hc.bg};color:${hc.dark ? '#fff' : 'var(--ink)'};border-color:rgba(0,0,0,.10);`;
        else s += 'background:repeating-linear-gradient(45deg,#eef3f5,#eef3f5 4px,#dde6e9 4px,#dde6e9 8px);color:#90a0a7;';
      }
      return s;
    },

    // ======================= C.5(A) table history =======================
    get inversionSyms() {
      return MASS_ORDER_INVERSIONS.filter(p => p.onGrid).flatMap(p => [p.a, p.b]);
    },
    pickGap(sym) { if (!this.mgChecked) this.mgPick = sym; },
    checkGap() { if (this.mgPick !== null) this.mgChecked = true; },
    resetGap() { this.mgPick = null; this.mgChecked = false; },
    gapState(sym) {
      if (!this.mgChecked) return this.mgPick === sym ? 'on' : '';
      if (sym === MENDELEEV_GAP.answer) return 'correct';
      if (sym === this.mgPick) return 'wrong';
      return '';
    },
    get gapCorrect() { return this.mgPick === MENDELEEV_GAP.answer; },
    get gapAnswerEl() { return BY_SYM[MENDELEEV_GAP.answer]; },
    // Mean of a triad's outer two masses, for the Döbereiner schematic.
    triadAvg(tr) { return ((tr.els[0].mass + tr.els[2].mass) / 2).toFixed(1); },

    // ======================= C.5(B) families =======================
    get family() { return FAMILIES.find(f => f.key === this.famKey); },
    selectFamily(key) {
      this.famKey = key;
      const f = FAMILIES.find(x => x.key === key);
      if (f && f.members.length) this.selectEl(f.members[0]);
    },
    // Family members merged with data, in the listed (top-to-bottom) order.
    get familyMembers() {
      return this.family.members.map(s => BY_SYM[s]).filter(Boolean);
    },
    // The valence count the family shares, computed from valenceElectrons to
    // reinforce the pattern. When the members do not all agree (the noble gases,
    // where helium has 2 rather than 8) fall back to the curated representative.
    get familyValence() {
      const vs = this.familyMembers.map(m => valenceElectrons(m.z));
      return vs.length && vs.every(v => v === vs[0]) ? vs[0] : this.family.valence;
    },
    get fq() { return FAMILY_QUIZ[this.fqIdx]; },
    get fqEl() { return BY_SYM[this.fq.sym]; },
    pickFq(c) { if (!this.fqChecked) this.fqPick = c; },
    checkFq() { if (this.fqPick !== null) this.fqChecked = true; },
    nextFq() {
      let i = this.fqIdx;
      while (FAMILY_QUIZ.length > 1 && i === this.fqIdx) i = (Math.random() * FAMILY_QUIZ.length) | 0;
      this.fqIdx = i; this.fqPick = null; this.fqChecked = false;
    },
    fqState(c) {
      if (!this.fqChecked) return this.fqPick === c ? 'on' : '';
      if (c === this.fq.answer) return 'correct';
      if (c === this.fqPick) return 'wrong';
      return '';
    },
    get fqCorrect() { return this.fqPick === this.fq.answer; },

    // ======================= C.5(C) trends =======================
    get prop() { return TREND_PROPS.find(p => p.key === this.trendProp); },
    get run() { return TREND_RUNS.find(r => r.key === this.trendRun); },

    heatRange(field) { return HEAT_RANGES[field]; },
    heatColor(field, value) {
      if (value == null) return null;
      const { min, max } = this.heatRange(field);
      const t = max > min ? (value - min) / (max - min) : 0.5;
      const ch = i => Math.round(HEAT_LO[i] + (HEAT_HI[i] - HEAT_LO[i]) * t);
      return { bg: `rgb(${ch(0)},${ch(1)},${ch(2)})`, dark: t > 0.55 };
    },
    // Legend endpoints (min/max) for the heatmap caption.
    get heatLegend() { return this.heatRange(this.prop.field); },

    // The line-chart series for the selected property along the selected run.
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
    // Directional summary shown under the chart.
    get trendCaption() {
      const p = this.prop, r = this.run;
      if (r.type === 'period') return `Across ${r.label.replace(', across', '')} (left to right), ${p.label.toLowerCase()} ${p.across}.`;
      return `Down ${r.label.replace(', down', '')} (top to bottom), ${p.label.toLowerCase()} ${p.down}.`;
    },
    get trendHasGap() { return this.run.items.some(it => it && typeof it === 'object' && it.gap); },

    // comparison game
    get tq() { return TREND_QUIZ[this.tqIdx]; },
    get tqProp() { return TREND_PROPS.find(p => p.key === this.tq.property); },
    get tqVerb() { return COMPARE_VERB[this.tq.property]; },
    get tqElA() { return BY_SYM[this.tq.a]; },
    get tqElB() { return BY_SYM[this.tq.b]; },
    tqValue(sym) {
      const el = BY_SYM[sym], v = el[this.tqProp.field];
      return v == null ? '—' : v + ' ' + this.tqProp.unit;
    },
    pickTq(sym) { if (!this.tqChecked) this.tqPick = sym; },
    checkTq() { if (this.tqPick !== null) this.tqChecked = true; },
    nextTq() {
      let i = this.tqIdx;
      while (TREND_QUIZ.length > 1 && i === this.tqIdx) i = (Math.random() * TREND_QUIZ.length) | 0;
      this.tqIdx = i; this.tqPick = null; this.tqChecked = false;
    },
    tqState(sym) {
      if (!this.tqChecked) return this.tqPick === sym ? 'on' : '';
      if (sym === this.tq.answer) return 'correct';
      if (sym === this.tqPick) return 'wrong';
      return '';
    },
    get tqCorrect() { return this.tqPick === this.tq.answer; },

    // Honors: effective nuclear charge across period 3 (main group only).
    get zeffRows() {
      return ['Na', 'Mg', 'Al', 'Si', 'P', 'S', 'Cl', 'Ar'].map(s => {
        const el = BY_SYM[s];
        return { sym: s, group: el.group, zeff: effectiveNuclearCharge(el.z), radius: el.radius, ie1: el.ie1 };
      });
    },

    // ======================= charts =======================
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
            label: '', data: [], borderColor: '#2a7d8a', backgroundColor: 'rgba(42,125,138,.12)',
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
            borderColor: '#95591f', backgroundColor: 'rgba(192,119,47,.12)',
            borderWidth: 2, pointRadius: d.pointRadii, pointBackgroundColor: d.pointColors, tension: 0.2, fill: true
          }],
          xTitle: 'Period 2 element (left to right)', yTitle: 'First IE (kJ/mol)', beginAtZero: false
        });
      }
    },
    resizeCharts() { trendChart?.resize(); ieChart?.resize(); }
  };
}
