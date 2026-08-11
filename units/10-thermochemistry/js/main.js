// main.js — Unit 10 view-model (Thermochemistry, TEKS C.13). Scenario layer.
// Wires model.js + the engine + the shared game framework. Every stage is a brief ->
// tool -> commit -> consequence (GAMIFICATION design rule 0): the law picker, pack
// picker, q calculator and equilibrium predictor are the tools; committing produces a
// verdict (outcomeBand for the two dose stages, per-option consequences for the
// decision stages) that feeds a session-local world-state. Here the world-state IS a
// thermochemistry readout: the patient's core temperature, in degrees Celsius.
// Outcomes are primary; XP/streak stay a quiet line; per-TEKS mastery meters persist.
import { SE, LAWS, FIELD_MATERIALS, PACKS, HESS_ROUTES, FORMATION_CASES, SCENARIOS } from './model.js';
import {
  SPECIFIC_HEAT, heatTransfer, finalTemperature, classifyThermal,
  hessCombine, enthalpyFromFormation, fmt
} from '../../../shared/js/chem.js';
import { createGame, outcomeBand } from '../../../shared/js/game.js';

const pick = a => a[(Math.random() * a.length) | 0];
const rN = (x, n) => { const p = 10 ** n; return Math.round(x * p) / p; };
const rand = (lo, hi, dp = 0) => rN(lo + Math.random() * (hi - lo), dp);

// The patient's core temperature is the world-state. These are the clinical bands a
// rescue medic actually works to: shivering stops near 32, and 35 is the line between
// mild and moderate hypothermia.
const CORE_START = 33.4;
const CORE_MIN = 28, CORE_MAX = 37.5;

const skills = [
  { id: 'a',   code: 'C.13(A)',  label: 'Four laws',           target: 3 },
  { id: 'b',   code: 'C.13(B)',  label: 'Calorimetry',         target: 3 },
  { id: 'c',   code: 'C.13(C)',  label: 'Exo/endo + diagram',  target: 3 },
  { id: 'd',   code: 'C.13(D)',  label: 'q = mc(dT)',          target: 3 },
  { id: 'h1',  code: 'Honors',   label: "Hess's law",          target: 2, honors: true },
  { id: 'h2',  code: 'Honors',   label: 'Formation enthalpy',  target: 2, honors: true },
  { id: 'cap', code: 'Capstone', label: 'Evacuation call',     target: 1, honors: true }
];

export { SE };

export function createSim() {
  return {
    ...createGame({ unitId: '10-thermochemistry', skills }),
    SE, fmt, LAWS, PACKS, FIELD_MATERIALS, SPECIFIC_HEAT,
    honors: false,
    mode: 'laws',

    // ---- world-state: the patient you are trying to rewarm (session-local) ----
    core: CORE_START,
    elapsed: 0,
    worldLog: [],
    _wid: 0,
    scIdx: { a: -1, b: -1, c: -1, d: -1 },

    // ---- stage state ----
    lw: null, lwLaw: null, lwFlow: null, lwChecked: false, lwAttempted: false, lwDone: false, lwVerdict: null,
    pk: null, pkPick: null, pkClass: null, pkChecked: false, pkAttempted: false, pkDone: false, pkVerdict: null,
    wm: null, wmMat: '', wmQ: '', wmChecked: false, wmAttempted: false, wmDone: false, wmVerdict: null,
    cl: null, clInput: '', clChecked: false, clAttempted: false, clDone: false, clVerdict: null,
    hs: null, hsFlip: [], hsScale: [], hsChecked: false, hsAttempted: false, hsDone: false, hsVerdict: null,
    fm: null, fmInput: '', fmClass: null, fmChecked: false, fmAttempted: false, fmDone: false, fmVerdict: null,
    cap: null, capPick: null, capChecked: false, capAttempted: false, capWin: false, capVerdict: null,

    init() {
      this.gLoad();
      this.genLaw();
      this.genPack();
      this.genWarm();
      this.genCal();
      this.genHess();
      this.genFormation();
      // GOTCHA: a <select x-model> whose options come from a child x-for binds before
      // the options exist, so a non-first initial value does not stick. Re-set after paint.
      this.$nextTick(() => { const v = this.wmMat; this.wmMat = null; this.wmMat = v; });
    },

    setMode(m) {
      this.mode = m;
      if (m === 'capstone' && this.capUnlocked && !this.cap) this.genCapstone();
    },

    resetProgress() {
      this.gReset();
      this.core = CORE_START; this.elapsed = 0; this.worldLog = [];
      this.scIdx = { a: -1, b: -1, c: -1, d: -1 };
      this.genLaw(); this.genPack(); this.genWarm(); this.genCal();
      this.genHess(); this.genFormation();
      this.cap = null; this.capWin = false; this.capVerdict = null;
    },

    // ---- scenario plumbing ----
    nextScenario(skill) {
      const list = SCENARIOS.filter(s => s.skill === skill);
      const i = (this.scIdx[skill] = (this.scIdx[skill] ?? -1) + 1) % list.length;
      return list[i];
    },
    // Advance the clock, move the patient's core temperature, and prepend a log line.
    recordWorld({ icon, tone, text, delta }) {
      this.elapsed += Math.round(6 + Math.random() * 7);
      this.core = rN(Math.max(CORE_MIN, Math.min(CORE_MAX, this.core + (delta || 0))), 1);
      this.worldLog.unshift({ id: ++this._wid, icon, tone, text: `T+${this.elapsed} min: ${text}` });
      if (this.worldLog.length > 6) this.worldLog.pop();
    },
    // Core temperature mapped onto the shared .meter (30 C empty, 37 C full).
    get corePct() { return Math.max(0, Math.min(100, (this.core - 30) / 7 * 100)); },
    get coreMood() { return this.core >= 35.5 ? '\u{1F642}' : this.core >= 33 ? '\u{1F630}' : '\u{1F635}'; },
    get coreState() {
      if (this.core >= 35.5) return 'Rewarming, out of danger';
      if (this.core >= 33) return 'Mild hypothermia';
      if (this.core >= 32) return 'Shivering failing';
      return 'Moderate hypothermia, critical';
    },
    get coreColor() { return this.core >= 35.5 ? 'var(--success)' : this.core >= 33 ? 'var(--warn)' : 'var(--danger)'; },

    seCaption(se) {
      if (this.gMastered(se.id)) return 'Mastered';
      const sk = this.g_skills[se.id];
      const def = this.g_skillDefs.find(d => d.id === se.id) || {};
      return `${sk ? sk.run : 0} of ${def.target || 3} correct in a row`;
    },
    cOf(mat) { return SPECIFIC_HEAT[mat]; },

    // ===================== C.13(A) name the law, read the heat flow =====================
    // Decision task. Both halves must be right: the law that governs the situation AND
    // the direction heat actually moves. Each law carries its real mountain consequence.
    genLaw() {
      const sc = this.nextScenario('a');
      this.lw = { sc, laws: LAWS };
      this.lwLaw = null; this.lwFlow = null;
      this.lwChecked = false; this.lwAttempted = false; this.lwDone = false; this.lwVerdict = null;
    },
    lwPickLaw(k) { if (!this.lwDone) this.lwLaw = k; },
    lwPickFlow(k) { if (!this.lwDone) this.lwFlow = k; },
    lwLawState(k) {
      if (!this.lwChecked) return this.lwLaw === k ? 'on' : '';
      if (!this.lw) return '';
      if (k === this.lw.sc.lawKey) return 'correct';
      return k === this.lwLaw ? 'wrong' : '';
    },
    lwFlowState(k) {
      if (!this.lwChecked) return this.lwFlow === k ? 'on' : '';
      if (!this.lw) return '';
      if (k === this.lw.sc.flow.correct) return 'correct';
      return k === this.lwFlow ? 'wrong' : '';
    },
    lwCommit() {
      if (this.lwDone || !this.lwLaw || !this.lwFlow) return;
      const sc = this.lw.sc;
      const lawOk = this.lwLaw === sc.lawKey;
      const flowOk = this.lwFlow === sc.flow.correct;
      const good = lawOk && flowOk;
      const lawName = LAWS.find(l => l.key === sc.lawKey).tag;
      let v, delta, feed;
      if (good) {
        v = { tone: 'success', icon: sc.icon, state: 'CALLED IT', headline: `${lawName} governs this`,
          detail: sc.consequences[this.lwLaw], gauge: null };
        this.lwDone = true; delta = 0.3; feed = `${sc.system}, read correctly`;
      } else if (!lawOk) {
        v = { tone: 'fail', icon: '\u{1F6A8}', state: 'WRONG LAW', headline: 'Wrong law',
          detail: `${sc.consequences[this.lwLaw]} It was the ${lawName.toLowerCase()}.`, gauge: null };
        delta = -0.5; feed = `${sc.system}, wrong law`;
      } else {
        const right = sc.flow.options.find(o => o.key === sc.flow.correct).label;
        v = { tone: 'fail', icon: '\u{1F6A8}', state: 'WRONG DIRECTION', headline: 'Right law, wrong direction',
          detail: `You named the ${lawName.toLowerCase()} correctly, but read the heat flow backwards. ${right}.`, gauge: null };
        delta = -0.4; feed = `${sc.system}, flow misread`;
      }
      this.gRecord('a', good, !this.lwAttempted);
      this.recordWorld({ icon: v.icon, tone: v.tone, text: feed, delta });
      this.lwAttempted = true; this.lwChecked = true; this.lwVerdict = v;
    },
    lwNext() { this.genLaw(); },

    // ===================== C.13(C) pick the pack, classify it, draw the diagram =====================
    // Decision task. `need` is 'hot' or 'cold'; the pack that serves it is the one whose
    // enthalpy has the matching sign, so choosing correctly IS classifying correctly.
    genPack() {
      const sc = this.nextScenario('c');
      const offered = sc.constraints.packs.map(k => PACKS.find(p => p.key === k));
      const need = sc.constraints.need;
      const correct = offered.find(p => (need === 'hot' ? p.dH < 0 : p.dH > 0));
      this.pk = { sc, offered, need, correct };
      this.pkPick = null; this.pkClass = null;
      this.pkChecked = false; this.pkAttempted = false; this.pkDone = false; this.pkVerdict = null;
    },
    pkPickPack(k) { if (!this.pkDone) { this.pkPick = k; this.pkClass = null; } },
    pkPickClass(k) { if (!this.pkDone) this.pkClass = k; },
    pkPackState(k) {
      if (!this.pkChecked) return this.pkPick === k ? 'on' : '';
      if (!this.pk) return '';
      if (k === this.pk.correct.key) return 'correct';
      return k === this.pkPick ? 'wrong' : '';
    },
    pkClassState(k) {
      if (!this.pkChecked) return this.pkClass === k ? 'on' : '';
      if (!this.pk || !this.pkPick) return '';
      const chosen = this.pk.offered.find(p => p.key === this.pkPick);
      if (!chosen) return '';
      const truth = classifyThermal(chosen.dH);
      if (k === truth) return 'correct';
      return k === this.pkClass ? 'wrong' : '';
    },
    // The pack whose energy diagram is on screen: the learner's pick, else the first offered.
    get pkShown() {
      if (!this.pk) return null;
      return this.pk.offered.find(p => p.key === this.pkPick) || this.pk.offered[0];
    },
    get pkShownClass() { return this.pkShown ? classifyThermal(this.pkShown.dH) : ''; },
    // Reaction-coordinate diagram, built as a string so it can be injected with x-html.
    // Deliberately SVG rather than Chart.js: this is a labelled schematic (a barrier, a
    // dH arrow, two plateaus), not a data plot, and it needs no chart lifecycle inside
    // an x-show panel. Heights are schematic; the caption says so.
    diagramSvg() {
      const p = this.pkShown;
      if (!p) return '';
      const exo = p.dH < 0;
      const W = 520, H = 240, base = 170, top = 60;
      const yStart = exo ? top + 30 : base;              // reactants
      const yEnd = exo ? base : top + 30;                // products
      const peak = Math.min(yStart, yEnd) - Math.max(18, Math.min(60, p.ea / 2));
      const path = `M 70,${yStart} L 150,${yStart} C 210,${yStart} 220,${peak} 260,${peak} C 300,${peak} 310,${yEnd} 370,${yEnd} L 460,${yEnd}`;
      const arrowX = 415;
      const dHcolor = exo ? '#2f8f5b' : '#bf4a30';
      return `
        <path d="${path}" fill="none" stroke="#4f93a0" stroke-width="3" stroke-linecap="round"/>
        <line x1="70" y1="${yStart}" x2="460" y2="${yStart}" stroke="#cfdbe0" stroke-dasharray="4 4"/>
        <line x1="70" y1="${yEnd}" x2="460" y2="${yEnd}" stroke="#cfdbe0" stroke-dasharray="4 4"/>
        <text x="76" y="${yStart - 8}" font-family="JetBrains Mono" font-size="11" fill="#687a82">reactants</text>
        <text x="454" y="${yEnd - 8}" text-anchor="end" font-family="JetBrains Mono" font-size="11" fill="#687a82">products</text>
        <line x1="${arrowX}" y1="${yStart}" x2="${arrowX}" y2="${yEnd}" stroke="${dHcolor}" stroke-width="2"/>
        <path d="M ${arrowX - 4},${yEnd + (exo ? -6 : 6)} L ${arrowX},${yEnd} L ${arrowX + 4},${yEnd + (exo ? -6 : 6)}" fill="none" stroke="${dHcolor}" stroke-width="2"/>
        <text x="${arrowX + 8}" y="${(yStart + yEnd) / 2}" font-family="JetBrains Mono" font-size="12" font-weight="700" fill="${dHcolor}">dH = ${p.dH > 0 ? '+' : ''}${p.dH} kJ</text>
        <text x="260" y="${peak - 10}" text-anchor="middle" font-family="JetBrains Mono" font-size="10" fill="#687a82">activation barrier</text>
        <text x="265" y="${H - 12}" text-anchor="middle" font-family="JetBrains Mono" font-size="10" fill="#687a82">reaction progress</text>
        <text x="22" y="${top + 4}" font-family="JetBrains Mono" font-size="10" fill="#687a82">energy</text>`;
    },
    pkCommit() {
      if (this.pkDone || !this.pkPick || !this.pkClass) return;
      const sc = this.pk.sc;
      const chosen = this.pk.offered.find(p => p.key === this.pkPick);
      const packOk = this.pkPick === this.pk.correct.key;
      const classOk = this.pkClass === classifyThermal(chosen.dH);
      const good = packOk && classOk;
      const sign = `${chosen.name} runs at dH = ${chosen.dH > 0 ? '+' : ''}${chosen.dH} kJ ${chosen.per}, so it is ${classifyThermal(chosen.dH)}.`;
      let v, delta, feed;
      if (good) {
        v = { tone: 'success', icon: sc.icon, state: 'RIGHT PACK', headline: 'Right pack',
          detail: `${sign} ${sc.consequences[this.pkPick]}`, gauge: null };
        this.pkDone = true; delta = 0.4; feed = `${sc.system}, right pack`;
      } else if (!packOk) {
        v = { tone: 'fail', icon: '\u{1F6A8}', state: 'WRONG PACK', headline: 'Wrong pack',
          detail: `${sign} ${sc.consequences[this.pkPick]}`, gauge: null };
        delta = -0.6; feed = `${sc.system}, wrong pack`;
      } else {
        v = { tone: 'warn', icon: '\u{2699}\u{FE0F}', state: 'CHECK THE SIGN', headline: 'Right pack, wrong label',
          detail: `You reached for the right pouch, but mislabelled the process. ${sign}`, gauge: null };
        delta = -0.2; feed = `${sc.system}, sign misread`;
      }
      this.gRecord('c', good, !this.pkAttempted);
      this.recordWorld({ icon: v.icon, tone: v.tone, text: feed, delta });
      this.pkAttempted = true; this.pkChecked = true; this.pkVerdict = v;
    },
    pkNext() { this.genPack(); },

    // ===================== C.13(D) q = mc(dT), the rewarming dose =====================
    // Dose task. The method precondition is choosing the right specific heat; the value
    // the learner commits is their own q in kJ, so it genuinely varies (a backwards dT
    // lands low, a forgotten division by 1000 lands far high) and the four bands mean something.
    genWarm() {
      const sc = this.nextScenario('d');
      const k = sc.constraints;
      const m = rand(k.massMin, k.massMax, 0);
      const t0 = rand(k.startMin, k.startMax, 1);
      const t1 = rand(k.targetMin, k.targetMax, 1);
      const c = SPECIFIC_HEAT[k.material];
      const dT = rN(t1 - t0, 1);
      const trueQ = rN(heatTransfer({ q: null, m, c, dT }).q / 1000, 3);   // kJ
      this.wm = { sc, material: k.material, m, t0, t1, c, dT, trueQ, bands: sc.bands };
      this.wmMat = ''; this.wmQ = '';
      this.wmChecked = false; this.wmAttempted = false; this.wmDone = false; this.wmVerdict = null;
    },
    get wmMatOk() { return !!this.wm && this.wmMat === this.wm.material; },
    // Live preview of q from whatever specific heat is currently selected.
    get wmPreview() {
      if (!this.wm || !this.wmMat) return null;
      const c = SPECIFIC_HEAT[this.wmMat];
      if (c === undefined) return null;
      return rN(heatTransfer({ q: null, m: this.wm.m, c, dT: this.wm.dT }).q / 1000, 3);
    },
    wmRun() {
      if (this.wmDone || !this.wmMat || this.wmQ === '') return;
      const sc = this.wm.sc;
      const q = parseFloat(this.wmQ);
      const needTxt = `${fmt(this.wm.trueQ)} kJ`;
      let v, good = false, delta, feed;
      if (!this.wmMatOk) {
        v = { tone: 'fail', icon: '\u{2699}\u{FE0F}', state: 'WRONG SPECIFIC HEAT', headline: 'Wrong material',
          detail: `You sized the heat using the specific heat of ${this.wmMat} (${fmt(SPECIFIC_HEAT[this.wmMat])} J/g per degree C). This job heats ${this.wm.material}, which takes ${fmt(this.wm.c)} J/g per degree C, so the whole number is built on the wrong constant.`,
          gauge: null };
        delta = -0.3; feed = `${sc.system}, wrong specific heat`;
      } else if (!isFinite(q)) {
        v = { tone: 'fail', icon: '\u{2699}\u{FE0F}', state: 'NO NUMBER', headline: 'Nothing to run on',
          detail: sc.fail, gauge: null };
        delta = -0.2; feed = `${sc.system}, no value`;
      } else {
        const band = outcomeBand(q, this.wm.trueQ, this.wm.bands);
        good = band.withinSpec;
        const dev = `${Math.abs((q - this.wm.trueQ) / this.wm.trueQ * 100).toFixed(0)}%`;
        const yours = `${fmt(q)} kJ`;
        if (good) {
          v = { tone: 'success', icon: sc.icon, state: sc.safeState, headline: 'On spec',
            detail: `You called ${yours} against the ${needTxt} the job needs. ${sc.safe}`, gauge: 'on' };
          this.wmDone = true; delta = 0.5;
          feed = `${sc.system}, on spec`;
        } else if (band.direction === 'low') {
          v = { tone: 'fail', icon: '\u{1F6A8}', state: sc.lowState, headline: 'Too little heat',
            detail: `You called ${yours}, ${dev} short of the ${needTxt} needed. ${sc.low}`, gauge: 'low' };
          delta = -0.7; feed = `${sc.system}, under-heated`;
        } else {
          v = { tone: 'fail', icon: '\u{1F6A8}', state: sc.highState, headline: 'Too much heat',
            detail: `You called ${yours}, ${dev} over the ${needTxt} needed. ${sc.high}`, gauge: 'high' };
          delta = -0.7; feed = `${sc.system}, over-heated`;
        }
      }
      this.gRecord('d', good, !this.wmAttempted);
      this.recordWorld({ icon: v.icon, tone: v.tone, text: feed, delta });
      this.wmAttempted = true; this.wmChecked = true; this.wmVerdict = v;
    },
    wmNext() { this.genWarm(); },

    // ===================== C.13(B) calorimetry: heat lost = heat gained =====================
    // Dose task in absolute degrees: predict where two bodies settle. A degree is a
    // degree whatever the pot holds, so the bands are absolute rather than relative.
    genCal() {
      const sc = this.nextScenario('b');
      const k = sc.constraints;
      const hot = { m: rand(k.hotMin, k.hotMax, 0), c: SPECIFIC_HEAT[k.hotMaterial], t: rand(k.hotTMin, k.hotTMax, 0) };
      const cold = { m: rand(k.coldMin, k.coldMax, 0), c: SPECIFIC_HEAT[k.coldMaterial], t: rand(k.coldTMin, k.coldTMax, 1) };
      const res = finalTemperature(hot, cold);
      this.cl = { sc, hot, cold, hotMat: k.hotMaterial, coldMat: k.coldMaterial,
        tFinal: rN(res.tFinal, 2), q: rN(res.qTransferred, 0), bands: sc.bands };
      this.clInput = '';
      this.clChecked = false; this.clAttempted = false; this.clDone = false; this.clVerdict = null;
    },
    clCommit() {
      if (this.clDone || this.clInput === '') return;
      const sc = this.cl.sc;
      const t = parseFloat(this.clInput);
      const needTxt = `${fmt(this.cl.tFinal)} degrees C`;
      let v, good = false, delta, feed;
      if (!isFinite(t)) {
        v = { tone: 'fail', icon: '\u{2699}\u{FE0F}', state: 'NO PREDICTION', headline: 'Nothing to act on',
          detail: sc.fail, gauge: null };
        delta = -0.2; feed = `${sc.system}, no prediction`;
      } else {
        const band = outcomeBand(t, this.cl.tFinal, this.cl.bands);
        good = band.withinSpec;
        const off = `${fmt(Math.abs(t - this.cl.tFinal))} degrees`;
        const yours = `${fmt(t)} degrees C`;
        if (good) {
          v = { tone: 'success', icon: sc.icon, state: sc.safeState, headline: 'Called it',
            detail: `You predicted ${yours}; it settles at ${needTxt}. ${sc.safe}`, gauge: 'on' };
          this.clDone = true; delta = 0.5; feed = `${sc.system}, predicted`;
        } else if (band.direction === 'low') {
          v = { tone: 'fail', icon: '\u{1F6A8}', state: sc.lowState, headline: 'Predicted too cold',
            detail: `You predicted ${yours}, ${off} below the ${needTxt} it actually reaches. ${sc.low}`, gauge: 'low' };
          delta = -0.7; feed = `${sc.system}, under-predicted`;
        } else {
          v = { tone: 'fail', icon: '\u{1F6A8}', state: sc.highState, headline: 'Predicted too hot',
            detail: `You predicted ${yours}, ${off} above the ${needTxt} it actually reaches. ${sc.high}`, gauge: 'high' };
          delta = -0.7; feed = `${sc.system}, over-predicted`;
        }
      }
      this.gRecord('b', good, !this.clAttempted);
      this.recordWorld({ icon: v.icon, tone: v.tone, text: feed, delta });
      this.clAttempted = true; this.clChecked = true; this.clVerdict = v;
    },
    clNext() { this.genCal(); },

    // ===================== Honors h1: Hess's law route =====================
    // The route's steps carry the correct flip/scale as the answer key; the learner starts
    // with every step un-flipped at scale 1 and has to assemble the target themselves.
    genHess() {
      const sc = SCENARIOS.find(s => s.id === 'h1-route');
      const route = pick(HESS_ROUTES);
      this.hs = { sc, route, target: route.target };
      this.hsFlip = route.steps.map(() => false);
      this.hsScale = route.steps.map(() => 1);
      this.hsChecked = false; this.hsAttempted = false; this.hsDone = false; this.hsVerdict = null;
    },
    hsToggle(i) { if (!this.hsDone) { this.hsFlip[i] = !this.hsFlip[i]; this.hsChecked = false; } },
    hsStep(i, d) { if (!this.hsDone) { this.hsScale[i] = Math.max(1, Math.min(4, this.hsScale[i] + d)); this.hsChecked = false; } },
    hsTermDH(i) {
      if (!this.hs) return 0;
      const s = this.hs.route.steps[i];
      if (!s) return 0;
      return rN((this.hsFlip[i] ? -s.dH : s.dH) * this.hsScale[i], 1);
    },
    get hsTotal() {
      if (!this.hs) return 0;
      return rN(hessCombine(this.hs.route.steps.map((s, i) => ({ dH: s.dH, flip: this.hsFlip[i], scale: this.hsScale[i] }))), 1);
    },
    get hsOk() { return !!this.hs && Math.abs(this.hsTotal - this.hs.target.dH) <= 0.05; },
    hsCommit() {
      if (this.hsDone) return;
      const sc = this.hs.sc;
      const ok = this.hsOk;
      let v;
      if (ok) {
        v = { tone: 'success', icon: sc.icon, state: 'ROUTE PRICED', headline: 'Route priced',
          detail: `Your steps sum to ${fmt(this.hsTotal)} kJ, matching the target. ${sc.success}`, gauge: null };
        this.hsDone = true;
        this.recordWorld({ icon: sc.icon, tone: 'success', text: `${sc.system}, route priced`, delta: 0.3 });
      } else {
        v = { tone: 'fail', icon: '\u{1F6A8}', state: 'ROUTE WRONG', headline: 'Steps do not add up',
          detail: `Your steps sum to ${fmt(this.hsTotal)} kJ, but the target route is ${fmt(this.hs.target.dH)} kJ. ${sc.fail}`, gauge: null };
        this.recordWorld({ icon: '\u{1F6A8}', tone: 'fail', text: `${sc.system}, route wrong`, delta: -0.4 });
      }
      this.gRecord('h1', ok, !this.hsAttempted);
      this.hsAttempted = true; this.hsChecked = true; this.hsVerdict = v;
    },
    hsNext() { this.genHess(); },

    // ===================== Honors h2: enthalpy from formation data =====================
    genFormation() {
      const sc = SCENARIOS.find(s => s.id === 'h2-formation');
      const fc = pick(FORMATION_CASES);
      const trueDH = rN(enthalpyFromFormation(fc.products, fc.reactants), 1);
      this.fm = { sc, fc, trueDH, trueClass: classifyThermal(trueDH) };
      this.fmInput = ''; this.fmClass = null;
      this.fmChecked = false; this.fmAttempted = false; this.fmDone = false; this.fmVerdict = null;
    },
    fmPickClass(k) { if (!this.fmDone) this.fmClass = k; },
    fmClassState(k) {
      if (!this.fmChecked) return this.fmClass === k ? 'on' : '';
      if (!this.fm) return '';
      if (k === this.fm.trueClass) return 'correct';
      return k === this.fmClass ? 'wrong' : '';
    },
    get fmValueOk() {
      if (!this.fm) return false;
      const v = parseFloat(this.fmInput);
      return isFinite(v) && Math.abs(v - this.fm.trueDH) <= 1.0;
    },
    fmCommit() {
      if (this.fmDone || this.fmInput === '' || !this.fmClass) return;
      const sc = this.fm.sc;
      const valueOk = this.fmValueOk;
      const classOk = this.fmClass === this.fm.trueClass;
      const good = valueOk && classOk;
      const truth = `dHrxn works out to ${fmt(this.fm.trueDH)} kJ, which is ${this.fm.trueClass}.`;
      let v, delta;
      if (good) {
        v = { tone: 'success', icon: sc.icon, state: 'ENTHALPY CHECKED', headline: 'Enthalpy confirmed',
          detail: `${truth} ${sc.success}`, gauge: null };
        this.fmDone = true; delta = 0.3;
      } else if (!valueOk) {
        v = { tone: 'fail', icon: '\u{1F6A8}', state: 'VALUE OFF', headline: 'Enthalpy is off',
          detail: `${sc.fail} ${truth} Remember it is the sum over products minus the sum over reactants, each term multiplied by its coefficient.`, gauge: null };
        delta = -0.4;
      } else {
        v = { tone: 'warn', icon: '\u{2699}\u{FE0F}', state: 'CHECK THE SIGN', headline: 'Right number, wrong label',
          detail: `Your value is right, but the classification is not. ${truth} A negative dH releases heat.`, gauge: null };
        delta = -0.2;
      }
      this.gRecord('h2', good, !this.fmAttempted);
      this.recordWorld({ icon: v.icon, tone: v.tone, text: `${sc.system}, ${good ? 'checked' : 'off'}`, delta });
      this.fmAttempted = true; this.fmChecked = true; this.fmVerdict = v;
    },
    fmNext() { this.genFormation(); },

    // ===================== Capstone: the evacuation call =====================
    get capUnlocked() { return this.gOverall() === 1; },
    genCapstone() {
      const sc = SCENARIOS.find(s => s.id === 'cap-evac');
      // Two generated conditions decide the one defensible call: can an aircraft get in,
      // and is she warm enough to move. Nothing here is a fake trade-off.
      const ceilingOk = Math.random() < 0.5;
      const ceiling = ceilingOk ? rand(3400, 4200, 0) : rand(2300, 3000, 0);
      const ledge = 3100;
      const movable = this.core >= 33;
      const correct = ceilingOk ? 'heli' : (movable ? 'carry' : 'hold');
      this.cap = { sc, ceiling, ledge, ceilingOk, movable, correct, coreAtCall: this.core };
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
      if (this.capWin || !this.capPick) return;
      const sc = this.cap.sc;
      const opt = sc.options.find(o => o.key === this.capPick);
      const fig = `Cloud base is ${fmt(this.cap.ceiling)} m against a ledge at ${fmt(this.cap.ledge)} m, so an aircraft ${this.cap.ceilingOk ? 'can' : 'cannot'} get in. Her core is ${fmt(this.cap.coreAtCall)} degrees C, ${this.cap.movable ? 'stable enough to move' : 'too cold to move safely'}.`;
      const good = this.capPick === this.cap.correct;
      let v, delta;
      if (good) {
        v = { tone: 'success', icon: sc.icon, state: 'RIGHT CALL', headline: 'Right call',
          detail: `${fig} ${opt.good}`, gauge: null };
        this.capWin = true; delta = 1.2;
      } else {
        v = { tone: 'fail', icon: '\u{1F6A8}', state: 'WRONG CALL', headline: 'Wrong call',
          detail: `${fig} ${opt.consequence}`, gauge: null };
        delta = -1.2;
      }
      this.gRecord('cap', good, !this.capAttempted);
      this.recordWorld({ icon: v.icon, tone: v.tone, text: `${sc.system}, ${good ? 'right call' : 'wrong call'}`, delta });
      this.capAttempted = true; this.capChecked = true; this.capVerdict = v;
    }
  };
}
