// main.js — Unit 5A view-model (The Mole, Lab Build, TEKS C.8).
// Reasoning-first fork of Unit 5. Same world, chemistry, and grading spine; the two
// dose stages (mass<->mole, mole<->particles) gain four Tier-1 learning mechanics:
//   A scaffold-fade ladder (rung 1 tiles -> 2 build-the-factor -> 3 type-the-answer),
//   B a gut-check gate (commit an order-of-magnitude estimate before the answer),
//   C self-explanation on a miss (a rule-based misconception detector), and
//   D a "Feel a mole" zoom tab. All four are view-model/UI logic that lives HERE, not
// in the shared engine, so chem.js/game.js and their Node test suites are untouched.
// Lab/ladder state persists under chem.lab.unit5a-codex, separate from mastery.
import { SE, SUBSTANCES, FORMULA_POOL, HYDRATES, COMBUSTION, SCENARIOS,
  TYPED_BANDS, ZOOM_ANALOGIES, MISCONCEPTIONS, ARI_INTRO } from './model.js?v=codex-cockpit-2';
import { sceneArt } from './art.js';
import {
  molarMass, percentComposition, parseFormula, ATOMIC_MASS, AVOGADRO,
  empiricalFormula, combustionFormula, fmt
} from '../../shared/js/chem.js';
import { createGame, outcomeBand } from '../../shared/js/game.js';

const pick = a => a[(Math.random() * a.length) | 0];
const shuffle = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
const rN = (x, n) => { const p = 10 ** n; return Math.round(x * p) / p; };
const absClose = (a, b, tol) => Math.abs(a - b) <= tol;
const AVO_TEXT = '6.022 × 10²³';      // 6.022 x 10^23, for tile labels
const mm = M => M.toFixed(2);
// Tier 2: the numeric slips an "audit ARI" case can stage (the AI states each as a wrong
// number). flipped/generic are taught live, not via an audit. ARI_OK_CLAIM is what ARI
// asserts on the ~30% of audits where its solution is actually correct.
const AUDIT_FLAWS = ['wrongMass', 'decade', 'noConvert'];
const ARI_OK_CLAIM = 'Ran it twice and the units cancel clean. I would sign off on this one.';
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
    ...createGame({ unitId: 'unit5a-codex', skills }),
    SE, fmt, ARI_INTRO,
    honors: false,
    honorsJob: 'hy',
    mode: 'molg',

    // ---- lab mechanics (Unit 5A) ----
    // The scaffold-fade ladder per dose skill: 1 SELECT (tap tiles) -> 2 BUILD (construct
    // the factor) -> 3 SOLVE (type the answer). The fade is the learning. `rung` persists
    // to chem.lab.unit5a-codex (NOT through game.js); `rungMiss` is session-only.
    rung: { a: 1, b: 1 },
    rungMiss: { a: 0, b: 0 },
    // ---- Tier 2: misconception engine + audit mode (fused) ----
    // missTally remembers the learner's recurring numeric slips per dose skill (persisted
    // with the ladder under v:2). pendingAudit is SESSION-only: armed once on a recurrence,
    // consumed the moment the audit is built, so the loop can never soft-lock. The active
    // audit rides on cv.audit; these fields track the learner's Trust/Flag call on it.
    missTally: { a: {}, b: {} },
    pendingAudit: { a: null, b: null },
    auditPick: null, auditFlaw: null, auditChecked: false, auditDone: false, auditVerdict: null,
    // ---- PART B: Instincts calibration (persisted; learning evidence) ----
    // Built from the gut-check the learner already commits at rung >= 2 (no new input).
    // est = gut-calls made; estOk = the ballpark decade matched the true decade; goodOfOk =
    // ballpark right AND the final value landed on target. Persisted under the lab key at
    // v:3 (NOT via game.js); formative only, gates nothing. Cleared on resetProgress.
    calib: { est: 0, estOk: 0, goodOfOk: 0 },
    // Molecular-eyes zoom slider (ungraded). Just needs an initial value; state persists
    // across tab switches and is not regenerated.
    zoomPow: 0,

    // ---- world-state: the crew you keep alive (session-local; the primary feedback).
    // Crew safety starts full and dents on emergencies (a good run heals it back); `sol`
    // is the voyage day; the ship's log is a vivid feed of what your numbers did. All of
    // this clears on reset; per-TEKS mastery persists separately in localStorage.
    //
    // PART A (the Living Ship): the single crew meter is now DERIVED from four coupled
    // stocks the voyage drifts down every sol. crew = round(0.6*min + 0.4*avg), so neglect
    // is dangerous (the worst stock dominates) but no single slip tanks everything. Stocks
    // are session-only (reset to 100; never persisted), so crewMood/crewState keep working.
    stocks: { air: 100, power: 100, food: 100, hull: 100 },
    shipStocks: [
      { key: 'air',   label: 'Air' },
      { key: 'power', label: 'Power' },
      { key: 'food',  label: 'Food' },
      { key: 'hull',  label: 'Hull' }
    ],
    crew: 100,
    sol: 0,
    worldLog: [],
    lastVerdict: null,
    _wid: 0,
    // scenario rotation per skill, so a 3-in-a-row run walks all of a skill's contexts
    scIdx: { a: -1, b: -1, c: -1, d: -1 },

    // ---- stage state ----
    cv: null, cvChain: [], cvChecked: false, cvAttempted: false, cvDone: false, cvVerdict: null,
    // lab-mechanic fields on the dose stage (reset every genConversion):
    cvNum: { value: '', unit: '' },   // rung-2 numerator the learner constructs
    cvDen: { value: '', unit: '' },   // rung-2 denominator
    cvAnswer: '',                     // rung-3 typed answer
    cvEstimate: null,                 // rung>=2 gut-check decade (live; revisable at the reconcile gate)
    cvEstimateFirst: null,            // the FIRST gut call this problem; never revised, so calibration measures the genuine instinct
    cvReconcilePrompt: false,         // rung>=2 decade-mismatch gate is blocking commit
    cvMiss: null, cvMissOptions: [], cvMissPick: null, cvMissRevealed: false,  // self-explanation
    pc: null, pcInput: '', pcDecision: null, pcChecked: false, pcAttempted: false, pcDone: false, pcVerdict: null,
    fo: null, fEmp: {}, fN: 1, foChecked: false, foAttempted: false, foDone: false, foVerdict: null,
    hy: null, hyX: 1, hyChecked: false, hyAttempted: false, hyDone: false, hyVerdict: null,
    cb: null, cbSub: { C: 0, H: 0, O: 0 }, cbChecked: false, cbAttempted: false, cbDone: false, cbVerdict: null,
    cap: null, capEmp: {}, capN: 1, capInput: '', capPick: null, capChecked: false, capAttempted: false, capWin: false, capVerdict: null,

    init() {
      this.gLoad();
      this.labLoad();              // before genConversion so cv.rung reads the loaded value
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
      // 'zoom' generates nothing; the slider state persists across tab switches
    },

    resetProgress() {
      this.gReset();
      this.stocks = { air: 100, power: 100, food: 100, hull: 100 };
      this.crew = 100; this.sol = 0;
      this.worldLog = [];
      this.scIdx = { a: -1, b: -1, c: -1, d: -1 };
      this.clearOutcome();
      // reset the lab ladder BEFORE regenerating, so the new problem shows rung 1
      this.rung = { a: 1, b: 1 }; this.rungMiss = { a: 0, b: 0 };
      // reset the Tier 2 misconception engine + any armed/active audit
      this.missTally = { a: {}, b: {} }; this.pendingAudit = { a: null, b: null };
      this.auditPick = null; this.auditFlaw = null; this.auditChecked = false; this.auditDone = false; this.auditVerdict = null;
      // PART B: clear the Instincts calibration (learning evidence resets with progress)
      this.calib = { est: 0, estOk: 0, goodOfOk: 0 };
      if (typeof localStorage !== 'undefined') {
        try { localStorage.removeItem('chem.lab.unit5a-codex'); } catch { /* ignore */ }
      }
      this.genConversion(this.mode === 'particles' ? 'particles' : 'molg');
      this.genPercent(); this.genFormula(); this.genHydrate(); this.genCombustion();
      this.cap = null; this.capWin = false;
    },

    // ---- lab/ladder persistence (separate key from mastery; never via game.js) ----
    labLoad() {
      if (typeof localStorage === 'undefined') return;
      try {
        const raw = localStorage.getItem('chem.lab.unit5a-codex');
        if (!raw) return;
        const data = JSON.parse(raw);
        if (!data || !data.rung || ![1, 2, 3].includes(data.v)) return;
        this.rung = { a: data.rung.a || 1, b: data.rung.b || 1 };
        // v:2+ also persists the misconception tallies. They are loaded but NEVER auto-arm
        // an audit; arming happens only on a fresh in-session recurrence.
        if (data.v >= 2 && data.missTally) {
          this.missTally = { a: { ...(data.missTally.a || {}) }, b: { ...(data.missTally.b || {}) } };
        }
        // v:3+ also persists the Instincts calibration (learning evidence across sessions).
        if (data.v >= 3 && data.calib) {
          this.calib = { est: data.calib.est || 0, estOk: data.calib.estOk || 0, goodOfOk: data.calib.goodOfOk || 0 };
        }
      } catch { /* corrupt storage: keep the rung + tally + calib defaults */ }
    },
    labSave() {
      if (typeof localStorage === 'undefined') return;
      try {
        localStorage.setItem('chem.lab.unit5a-codex',
          JSON.stringify({ v: 3, rung: this.rung, missTally: this.missTally, calib: this.calib }));
      } catch { /* quota / privacy mode: rung + tallies + calib stay in-memory only */ }
    },

    // ---- scenario layer plumbing ----
    nextScenario(skill) {
      const list = SCENARIOS.filter(s => s.skill === skill);
      const i = (this.scIdx[skill] = (this.scIdx[skill] ?? -1) + 1) % list.length;
      return list[i];
    },
    // advance a sol, drift + couple the four stocks, apply the result to this task's stock,
    // re-derive crew safety, and prepend a vivid feed line (newest first). `stock` names the
    // ship system the result feeds; `delta` carries the severity (+6 good / -5 minor / -12
    // emergency) just as before, so per-task verdicts are unchanged.
    recordWorld({ icon, tone, text, stock, delta }) {
      this.sol++;
      const clamp = v => Math.max(0, Math.min(100, v));
      // 2. gentle baseline drift on EVERY stock first, so grinding one station lets the
      //    others slide (this is what makes "which station next?" a real decision).
      this.stocks.air   = clamp(this.stocks.air   - 3);
      this.stocks.power = clamp(this.stocks.power - 2);
      this.stocks.food  = clamp(this.stocks.food  - 2);
      this.stocks.hull  = clamp(this.stocks.hull  - 1);
      // 3. couplings, read once from the post-drift levels (real cause -> effect, order-free):
      //    a gasping crew burns through food reserves; a low power bus lets the scrubbers fall
      //    behind so air slips. Each coupling drains ONE OTHER stock a little, never the stock
      //    you are actively restoring and never the restore amount itself, so a good +6 result
      //    always outruns baseline + coupling and ANY stock can be recovered by tending it. The
      //    ship gets stressed and bounces back; it never soft-locks (the hard formative rule),
      //    while neglect still visibly compounds onto the rest of the system.
      const lowAir = this.stocks.air < 30, lowPower = this.stocks.power < 30;
      if (lowAir)   this.stocks.food = clamp(this.stocks.food - 3);
      if (lowPower) this.stocks.air  = clamp(this.stocks.air  - 2);
      // 4. apply the result to this scenario's stock (delta carries severity: +6 / -5 / -12)
      if (stock && this.stocks[stock] !== undefined) this.stocks[stock] = clamp(this.stocks[stock] + (delta || 0));
      // 5. re-derive crew: worst-stock-dominant, so neglect is dangerous but not instant death
      this.crew = this.recomputeCrew();
      // 6. prepend the log line
      this.worldLog = [{ id: ++this._wid, icon, tone, text: `Sol ${this.sol}: ${text}` }, ...this.worldLog].slice(0, 6);
    },
    recomputeCrew() {
      const v = [this.stocks.air, this.stocks.power, this.stocks.food, this.stocks.hull];
      const min = Math.min(...v), avg = v.reduce((s, n) => s + n, 0) / v.length;
      return Math.max(0, Math.min(100, Math.round(0.6 * min + 0.4 * avg)));
    },
    stockColor(v) { return v >= 67 ? 'var(--success)' : v >= 34 ? 'var(--warn)' : 'var(--danger)'; },
    get crewMood() { return this.crew >= 67 ? '\u{1F642}' : this.crew >= 34 ? '\u{1F630}' : '\u{1F635}'; },
    get crewState() { return this.crew >= 67 ? 'Crew safe' : this.crew >= 34 ? 'Crew strained' : 'Crew in danger'; },
    // ---- PART B: Instincts panel readout (derived from calib; formative only, gates nothing) ----
    get calibReady() { return this.calib.est >= 8; },
    get instinctNudge() {
      if (!this.calibReady) return '';
      const estRate = this.calib.estOk / this.calib.est;
      // 1. the size sense is the foundation: if the ballpark is often off, fix that first
      if (estRate <= 0.4) return 'Your gut keeps missing the size. Count the powers of ten before you commit.';
      // 2. size sense is decent but the final number drifts off even when the gut was right
      if (estRate >= 0.6 && this.calib.estOk >= 4 && this.calib.goodOfOk / this.calib.estOk <= 0.5)
        return 'Your size sense is good, but the final number often slips. Slow down on the arithmetic.';
      // 3. both the ballpark and the follow-through are strong
      if (estRate >= 0.8) return 'Your sense of size is sharp. Trust your gut.';
      return '';
    },
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
    get coreSkills() { return SE.filter(se => !se.honors); },
    get activeBrief() {
      if (this.mode === 'molg' || this.mode === 'particles') return this.cvBrief;
      if (this.mode === 'percent') return this.pcBrief;
      if (this.mode === 'formula') return this.foBrief;
      if (this.mode === 'capstone') return this.capBrief;
      return null;
    },
    get activeVerdict() {
      if (this.mode === 'molg' || this.mode === 'particles') return this.auditVerdict || this.cvVerdict;
      if (this.mode === 'percent') return this.pcVerdict;
      if (this.mode === 'formula') return this.cbVerdict || this.hyVerdict || this.foVerdict;
      if (this.mode === 'capstone') return this.capVerdict;
      return null;
    },
    get activeTone() {
      const v = this.activeVerdict;
      if (!v) return 'standby';
      if (v.tone === 'success') return 'safe';
      if (v.tone === 'warn') return 'warn';
      if (v.tone === 'fail' || v.tone === 'danger') return 'danger';
      return v.state === 'CALC STALLED' ? 'stalled' : 'standby';
    },
    get activeArtId() {
      const brief = this.activeBrief;
      return brief && brief.id ? brief.id : 'a-oxygen';
    },
    get activeStationName() {
      const brief = this.activeBrief;
      if (brief && brief.system) return brief.system;
      if (this.mode === 'zoom') return 'Feel a mole';
      if (this.mode === 'capstone') return 'Resupply pod';
      return 'Mission control';
    },
    get activeStateLabel() {
      const v = this.activeVerdict;
      return v && v.state ? v.state : 'STANDBY';
    },
    get activeOutcomeText() {
      const v = this.activeVerdict;
      if (v) return v.detail || v.headline || v.state;
      const brief = this.activeBrief;
      if (brief) return brief.why || brief.goal || '';
      if (this.mode === 'zoom') return 'Scale from one particle to a mole without pretending the whole mole fits on screen.';
      return 'Pick a station and make the number protect the crew.';
    },

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
    genConversion(stage, audit) {
      const skill = stage === 'molg' ? 'a' : 'b';
      // An audit re-runs the SAME scenario the learner just botched (found by id, so the
      // rotation index is not disturbed); a normal call rotates to the next context.
      const sc = (audit && SCENARIOS.find(s => s.id === audit.scId)) || this.nextScenario(skill);
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

      // Effective rung (single-step scope): skill a is always single-step; skill b has
      // exactly one two-step case (b-sample, g->particles). That two-step stays scaffolded
      // at tiles regardless of the ladder, and is flagged so it does not move the ladder.
      let r = this.rung[skill];
      if (r >= 2 && from === 'g' && to === 'particles') r = 1;
      const rungForced = (r !== this.rung[skill]);

      this.cv = { sc, kind: stage, skill, sub, M, wrongM, given: { value: gval, unit: srcUnit },
        targetUnit: to, trueValue, tiles, explain, bands: sc.bands, rung: r, rungForced };

      // Gut-check gate data (rung >= 2 only): the true decade and three decade options.
      if (r >= 2) {
        this.cv.decade = Math.floor(Math.log10(Math.abs(trueValue)));
        this.cv.estOptions = shuffle([this.cv.decade - 1, this.cv.decade, this.cv.decade + 1]);
      }

      // Tier 2 audit variant: ARI presents a finished solution on this same case for the
      // learner to check. ~30% are correct so the learner must actually verify, not reflex-
      // flag; the rest stage the flagged numeric slip as a confidently stated wrong value.
      if (audit) {
        const correct = Math.random() < 0.3;
        const flaw = correct ? null : audit.flaw;
        this.cv.audit = {
          correct, flaw,
          aiValue: correct ? trueValue : this.auditWrongValue(flaw, this.cv),
          working: this.auditWorking(this.cv, flaw),
          flawOpts: shuffle(AUDIT_FLAWS.map(k => ({ key: k, label: MISCONCEPTIONS[k].label })))
        };
      }

      this.cvChain = []; this.cvChecked = false; this.cvAttempted = false; this.cvDone = false; this.cvVerdict = null;
      // reset every lab-mechanic field for the new problem
      this.cvNum = { value: '', unit: '' }; this.cvDen = { value: '', unit: '' };
      this.cvAnswer = '';
      this.cvEstimate = null; this.cvEstimateFirst = null; this.cvReconcilePrompt = false;
      this.cvMiss = null; this.cvMissOptions = []; this.cvMissPick = null; this.cvMissRevealed = false;
      // reset the audit UI for the new case (cv.audit is set above only on an audit call)
      this.auditPick = null; this.auditFlaw = null; this.auditChecked = false; this.auditDone = false; this.auditVerdict = null;
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

    // ---- rung indicator (quiet, drives the dose-panel pill) ----
    get rungText() {
      if (!this.cv) return '';
      if (this.cv.rungForced) return 'Two-step conversion · tap the ready-made tiles';
      const r = this.cv.rung;
      if (r === 1) return 'Setup level 1 of 3 · tap the ready-made tiles';
      if (r === 2) return 'Setup level 2 of 3 · build the factor yourself';
      return 'Setup level 3 of 3 · solve it and type the amount';
    },

    // ---- Mechanic B: gut-check gate (rung >= 2) ----
    cvEstimatePick(d) {
      if (this.cvDone) return;
      // capture the FIRST gut call (for calibration) before the reconcile gate can revise it
      if (this.cvEstimateFirst === null) this.cvEstimateFirst = d;
      this.cvEstimate = d; this.cvReconcilePrompt = false;
    },
    // Honest label for a decade option across all three target units (plain text, no
    // fragile unicode superscripts). particles -> ~10^d; g -> ~N g (or ~10^(d-3) kg for
    // big masses); mol -> ~N mol.
    estLabel(d, unit) {
      if (unit === 'particles') return `~10^${d}`;
      if (unit === 'g') return d >= 3 ? `~${10 ** (d - 3)} kg` : `~${10 ** d} g`;
      return `~${10 ** d} mol`;
    },
    // The live value the gut-check is compared against (rung 2 built factor, rung 3 typed).
    get cvCurrentValue() {
      if (!this.cv) return NaN;
      return this.cv.rung === 2 ? this.cvBuiltFactor.result : this.cvTyped;
    },
    get cvDecadeMismatch() {
      if (!this.cv || this.cv.rung < 2 || this.cvEstimate === null) return false;
      // At rung 2 a magnitude check is only meaningful after the factor resolves to the
      // requested unit. Wrong-unit or flipped factors need unit feedback, not a decade nag.
      if (this.cv.rung === 2 && !this.cvBuiltFactor.ok) return false;
      const value = this.cvCurrentValue;
      if (!isFinite(value) || value === 0) return false;
      return Math.floor(Math.log10(Math.abs(value))) !== this.cvEstimate;
    },
    get reconcileText() {
      if (!this.cv || this.cvEstimate === null) return '';
      const value = this.cvCurrentValue;
      const yDec = (isFinite(value) && value !== 0) ? Math.floor(Math.log10(Math.abs(value))) : this.cvEstimate;
      const u = this.cv.targetUnit;
      return `Your gut said ${this.estLabel(this.cvEstimate, u)} but your answer is ${this.estLabel(yDec, u)}. One is lying. Fix it.`;
    },

    // ---- Mechanic A: rung-2 BUILD (hybrid factor) ----
    get cvBuiltFactor() {
      if (!this.cv) return { entered: false, cancels: false, result: NaN, unit: null, ok: false };
      const n = this.cvNum, d = this.cvDen;
      const entered = n.value !== '' && n.unit !== '' && d.value !== '' && d.unit !== '';
      const result = this.cv.given.value * (+n.value) / (+d.value);
      const cancels = d.unit === this.cv.given.unit;
      const unit = n.unit;
      const ok = entered && cancels && unit === this.cv.targetUnit && isFinite(result);
      return { entered, cancels, result, unit, ok };
    },

    // ---- Mechanic A: rung-3 SOLVE (typed answer) ----
    get cvTyped() { return parseFloat(this.cvAnswer); },

    // Commit readiness across rungs (replaces the rung-1-only !cvChain.length disable).
    get cvCommitReady() {
      if (!this.cv) return false;
      if (this.cv.rung === 1) return this.cvChain.length > 0;
      if (this.cvEstimate === null) return false;       // gut-check first at rung >= 2
      if (this.cv.rung === 2) return this.cvBuiltFactor.entered;
      return this.cvAnswer !== '';                       // rung 3
    },

    // ---- Mechanic C: rule-based misconception detector (first match wins) ----
    cvDetectMiss(value) {
      if (!this.cv) return 'generic';
      const rel = (a, b) => isFinite(a) && b !== 0 && Math.abs(a - b) / Math.abs(b) <= 0.03;
      // 1. unit logic: flipped means the starting unit failed to cancel; wrongUnit means it
      //    canceled but left a unit other than the one the problem requested.
      if (this.cv.rung === 2) {
        const built = this.cvBuiltFactor;
        if (!built.cancels) return 'flipped';
        if (built.entered && built.unit !== this.cv.targetUnit) return 'wrongUnit';
      } else if (this.cv.rung === 1) {
        const steps = this.cvSteps;
        if (!steps.ok) return 'flipped';
        if (this.cvChain.length > 0 && steps.unit !== this.cv.targetUnit) return 'wrongUnit';
      }
      // 2. noConvert: the answer is basically the starting reading.
      if (rel(value, this.cv.given.value)) return 'noConvert';
      // 3. wrongMass: used the distractor molar mass. Only meaningful when the conversion
      //    actually uses molar mass (grams is one endpoint); never for pure mol<->particles,
      //    where "wrong molar mass" would be a nonsense diagnosis.
      const usesMolarMass = this.cv.given.unit === 'g' || this.cv.targetUnit === 'g';
      if (usesMolarMass && (rel(value, this.cv.trueValue * (this.cv.wrongM / this.cv.M)) ||
          rel(value, this.cv.trueValue * (this.cv.M / this.cv.wrongM)))) return 'wrongMass';
      // 4. decade: off by a clean power of ten (dropped/added an Avogadro or a zero).
      if (isFinite(value) && value > 0) {
        const n = Math.round(Math.log10(value / this.cv.trueValue));
        if (n !== 0) return 'decade';
      }
      // 5. generic.
      return 'generic';
    },
    // Build the "what went wrong?" option set: the detected key plus 1-2 distractors drawn
    // from the other keys (excluding generic so options stay meaningful), shuffled.
    missOptionsFor(key) {
      const others = Object.keys(MISCONCEPTIONS).filter(k => k !== key && k !== 'generic');
      const distractors = shuffle(others).slice(0, 2);
      return shuffle([key, ...distractors]).map(k => ({ key: k, label: MISCONCEPTIONS[k].label }));
    },
    cvPickMiss(key) { this.cvMissPick = key; this.cvMissRevealed = true; },
    cvMissState(key) {
      if (!this.cvMissRevealed) return this.cvMissPick === key ? 'on' : '';
      if (key === this.cvMiss) return 'correct';
      if (key === this.cvMissPick) return 'wrong';
      return '';
    },
    get cvMissCorrectLabel() { return this.cvMiss ? MISCONCEPTIONS[this.cvMiss].label : ''; },
    get cvMissFix() { return this.cvMiss ? MISCONCEPTIONS[this.cvMiss].fix : ''; },

    // ---- Mechanic D: molecular-eyes zoom (ungraded) ----
    get zoomCount() {
      const k = this.zoomPow;
      if (k <= 4) return (10 ** k).toLocaleString('en-US');   // 1 .. 10,000
      return `10^${k}`;                                        // avoid building 1e23
    },
    get zoomCapped() { return 10 ** this.zoomPow > 300; },
    get zoomAnalogy() {
      let cur = ZOOM_ANALOGIES[0];
      for (const a of ZOOM_ANALOGIES) { if (a.pow <= this.zoomPow) cur = a; else break; }
      return cur.text;
    },
    // String-built SVG dot field injected via x-html on a <g> (never <template> in <svg>).
    // Honest LOG zoom: draw min(10^pow, CAP) dots; past the cap they keep shrinking to
    // convey that 10^23 cannot be drawn. Slider-driven only; no self-animating motion.
    get zoomDots() {
      const CAP = 300, W = 320, H = 200, pad = 8;
      const pow = this.zoomPow;
      const n = Math.min(Math.round(10 ** pow), CAP);
      const cols = Math.max(1, Math.ceil(Math.sqrt(n * W / H)));
      const rows = Math.max(1, Math.ceil(n / cols));
      const cw = (W - pad * 2) / cols, ch = (H - pad * 2) / rows;
      const capped = 10 ** pow > CAP;
      const powShrink = capped ? Math.max(0.25, 1 - (pow - 3) * 0.06) : 1;
      const r = Math.max(0.5, Math.min(cw, ch) * 0.34 * powShrink);
      let out = '';
      for (let i = 0; i < n; i++) {
        const c = i % cols, rr = (i / cols) | 0;
        const cx = pad + cw * (c + 0.5), cy = pad + ch * (rr + 0.5);
        out += `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${r.toFixed(1)}"></circle>`;
      }
      return out;
    },

    // ---- commit the dose conversion (rung-aware; same grading spine as U5) ----
    cvShip() {
      if (this.cvDone || !this.cvCommitReady) return;
      const sc = this.cv.sc;
      const rung = this.cv.rung;
      const tgt = this.unitLabel(this.cv.targetUnit);
      const needTxt = `${fmt(this.cv.trueValue)} ${tgt}`;

      // 1. derive value + reached by rung
      let value, reached;
      if (rung === 1)      { const s = this.cvSteps; value = s.value; reached = s.reached; }
      else if (rung === 2) { const f = this.cvBuiltFactor; value = f.result; reached = f.ok; }
      else                 { value = this.cvTyped; reached = isFinite(value); }

      // 2. gut-check gate: a live decade mismatch blocks commit (no record, no ladder move)
      if (rung >= 2 && this.cvDecadeMismatch) { this.cvReconcilePrompt = true; return; }

      let v, good = false, delta;
      if (!reached) {
        // the value must resolve to the target unit before the system can act on it
        const detail = rung === 3
          ? `${sc.fail} Enter a number for the amount in ${tgt}.`
          : `${sc.fail} ${this.cv.explain}`;
        v = { tone: 'fail', icon: '\u{2699}\u{FE0F}', state: 'CALC STALLED', headline: 'Numbers did not resolve',
          detail, gauge: null };
        delta = -5;
      } else {
        const band = outcomeBand(value, this.cv.trueValue, rung === 3 ? TYPED_BANDS : this.cv.bands);
        good = band.withinSpec;
        const dev = `${Math.abs((value - this.cv.trueValue) / this.cv.trueValue * 100).toFixed(0)}%`;
        const yourTxt = `${fmt(value)} ${tgt}`;
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

      // 5. record the chemical outcome (mastery + world-state) on the same spine as U5
      this.gRecord(this.cv.skill, good, !this.cvAttempted);
      this.recordWorld({ icon: v.icon, tone: v.tone, text: `${sc.system}, ${v.state.toLowerCase()}`, stock: sc.stock, delta });

      // 5b. PART B: Instincts calibration. On a non-audit SOLVE commit that carries a
      //     gut-check (rung >= 2 only; rung 1 and the forced two-step have none), log whether
      //     the ballpark decade matched the truth, and if it did, whether the final value also
      //     landed on target. This is the only writer of calib (persisted by labSave below).
      if (this.cv.rung >= 2 && !this.cv.audit) {
        // ballpark uses the FIRST gut call, not the live cvEstimate the reconcile gate lets the
        // learner revise, so calibration reflects the genuine instinct before computing rather
        // than a value back-fitted to the answer.
        const ballpark = (this.cvEstimateFirst === this.cv.decade);
        this.calib.est++;
        if (ballpark) { this.calib.estOk++; if (good) this.calib.goodOfOk++; }
      }

      // 6. adaptive ladder: orthogonal to mastery, never a second grade. Skipped on a
      //    forced two-step problem (it is not evidence about the learner's current rung).
      if (!this.cv.rungForced) {
        const skill = this.cv.skill;
        if (good && !this.cvAttempted) {
          this.rung[skill] = Math.min(3, this.rung[skill] + 1);
          this.rungMiss[skill] = 0;
        } else if (!good) {
          this.rungMiss[skill]++;
          if (this.rungMiss[skill] >= 2) { this.rung[skill] = Math.max(1, this.rung[skill] - 1); this.rungMiss[skill] = 0; }
        }
      }

      // 7. on any miss, detect the misconception and open the self-explanation panel; on a
      //    correct commit (including a correct retry after a miss) clear any lingering panel so
      //    a resolved "what went wrong" card never sits above a fresh success verdict.
      if (!good) {
        this.cvMiss = this.cvDetectMiss(value);
        this.cvMissOptions = this.missOptionsFor(this.cvMiss);
        this.cvMissPick = null; this.cvMissRevealed = false;
      } else {
        this.cvMiss = null; this.cvMissOptions = []; this.cvMissPick = null; this.cvMissRevealed = false;
      }

      // 7b. Tier 2 misconception engine: remember the pattern. On the SECOND numeric
      //     recurrence of a slip, arm an audit on the same scenario and let ARI name the
      //     pattern in this verdict. A clean first-try solve fades the skill's tallies, so
      //     demonstrated competence retires the weakness instead of letting counts pile up.
      const sk = this.cv.skill;
      const tally = this.missTally[sk];
      if (!good) {
        tally[this.cvMiss] = (tally[this.cvMiss] || 0) + 1;
        if (AUDIT_FLAWS.includes(this.cvMiss) && tally[this.cvMiss] >= 2 && !this.pendingAudit[sk] && !this.cv.audit) {
          this.pendingAudit[sk] = { flaw: this.cvMiss, scId: this.cv.sc.id };
          v.coach = MISCONCEPTIONS[this.cvMiss].coach;
        }
      } else if (!this.cvAttempted) {
        // a clean first try fades only the numeric (audit-relevant) weaknesses
        for (const k of AUDIT_FLAWS) if (tally[k]) tally[k] = Math.max(0, tally[k] - 1);
      }
      this.labSave();

      // 8. finalize
      this.cvAttempted = true; this.cvChecked = true; this.cvVerdict = v; this.lastVerdict = v;
      this.cvReconcilePrompt = false;
    },
    // cvNext consumes a pending audit: the next case becomes an "audit ARI" re-run of the
    // same scenario. Consuming it here (and nulling it) guarantees at most one audit per
    // recurrence, so a failed audit never loops.
    cvNext() {
      const p = this.pendingAudit[this.cv.skill];
      if (p) { this.pendingAudit[this.cv.skill] = null; this.genConversion(this.cv.kind, p); }
      else this.genConversion(this.cv.kind);
    },

    // ===================== Tier 2: audit ARI (fused remediation) =====================
    // ARI's stated solution for an audit is built from the SAME cv (same brief, same facts,
    // re-rolled numbers). The flaw lives in the number, not in a label, so auditing means
    // checking ARI's working against the brief rather than vibe-flagging.
    auditWrongValue(flaw, cv) {
      const g = cv.given.value;
      if (flaw === 'noConvert') return g;                                  // never multiplied by the factor
      if (flaw === 'decade') return cv.trueValue * (Math.random() < 0.5 ? 10 : 0.1);
      // wrongMass: ARI used the distractor molar mass wherever molar mass belongs.
      if (cv.targetUnit === 'g') return g * cv.wrongM;                     // mol -> g
      return cv.trueValue * (cv.M / cv.wrongM);                            // g -> mol or g -> particles
    },
    auditWorking(cv, flaw) {
      const g = fmt(cv.given.value), srcU = this.unitLabel(cv.given.unit), tgtU = this.unitLabel(cv.targetUnit);
      const usesMass = cv.given.unit === 'g' || cv.targetUnit === 'g';
      if (flaw === 'noConvert') return `I read ${g} ${srcU} off the gauge and logged it straight across as ${tgtU}. The two track close, so I skipped the factor.`;
      if (flaw === 'wrongMass') return `I used ${mm(cv.wrongM)} g per mol as the molar mass and ran ${g} ${srcU} through to ${tgtU}.`;
      if (flaw === 'decade') return usesMass
        ? `I ran ${g} ${srcU} through ${mm(cv.M)} g per mol down to ${tgtU}, carrying the powers of ten by eye.`
        : `I multiplied ${g} ${srcU} by Avogadro's number to get ${tgtU}, carrying the powers of ten by eye.`;
      return usesMass
        ? `I used ${mm(cv.M)} g per mol as the molar mass and ran ${g} ${srcU} through, letting the units cancel to ${tgtU}.`
        : `I multiplied ${g} ${srcU} by Avogadro's number, letting the units cancel to ${tgtU}.`;
    },
    get auditClaim() {
      if (!this.cv || !this.cv.audit) return '';
      return this.cv.audit.correct ? ARI_OK_CLAIM : MISCONCEPTIONS[this.cv.audit.flaw].aiClaim;
    },
    auditPickTrust() { if (!this.auditDone) { this.auditPick = 'trust'; this.auditFlaw = null; } },
    auditPickFlag() { if (!this.auditDone) this.auditPick = 'flag'; },
    auditNameFlaw(key) { if (!this.auditDone && this.auditPick === 'flag') this.auditFlaw = key; },
    get auditCommitReady() {
      if (!this.cv || !this.cv.audit) return false;
      if (this.auditPick === 'trust') return true;
      return this.auditPick === 'flag' && this.auditFlaw !== null;
    },
    auditChoiceState(k) {
      if (!this.auditChecked) return this.auditPick === k ? 'on' : '';
      const trustRight = this.cv.audit.correct;            // trusting is right iff ARI was correct
      if (k === 'trust') return trustRight ? 'correct' : (this.auditPick === 'trust' ? 'wrong' : '');
      return !trustRight ? 'correct' : (this.auditPick === 'flag' ? 'wrong' : '');
    },
    auditFlawState(key) {
      if (!this.auditChecked) return this.auditFlaw === key ? 'on' : '';
      if (key === this.cv.audit.flaw) return 'correct';
      if (key === this.auditFlaw) return 'wrong';
      return '';
    },
    // Commit the Trust/Flag call. Catching AND naming a flawed solution retires that tally
    // and pays off; letting a wrong number through dents crew safety. Audits are formative:
    // they record world-state only and never call gRecord (mastery stays a pure measure of
    // the learner producing correct work).
    auditCommit() {
      if (this.auditDone || !this.auditCommitReady) return;
      const sc = this.cv.sc, a = this.cv.audit, sk = this.cv.skill;
      const tgt = this.unitLabel(this.cv.targetUnit);
      const aiTxt = `${fmt(a.aiValue)} ${tgt}`, trueTxt = `${fmt(this.cv.trueValue)} ${tgt}`;
      let v, delta;
      if (a.correct) {
        if (this.auditPick === 'trust') {
          v = { tone: 'success', icon: sc.icon, state: 'SIGNED OFF', headline: 'Good sign-off',
            detail: `You checked ARI's ${aiTxt}, it held up, and you let it run. ${sc.safe}` };
          delta = 5;
        } else {
          v = { tone: 'warn', icon: '\u{2699}\u{FE0F}', state: 'FALSE ALARM', headline: 'False alarm',
            detail: `ARI's ${aiTxt} was right all along. Flagging good work burns time the crew cannot spare. Check the numbers before you call it.` };
          delta = -3;
        }
      } else if (this.auditPick === 'trust') {
        // the wrong number actually shipped: play out the scenario's real over/under harm
        const conseq = a.aiValue > this.cv.trueValue ? sc.high : sc.low;
        v = { tone: 'fail', icon: '\u{1F6A8}', state: 'BAD CALL SHIPPED', headline: 'You let it through',
          detail: `ARI logged ${aiTxt}, but the real amount was ${trueTxt}. You signed off without checking, and it went live. ${conseq}` };
        delta = -12;
      } else if (this.auditFlaw === a.flaw) {
        this.missTally[sk][a.flaw] = 0;                    // caught and named: that pattern is retired
        v = { tone: 'success', icon: '\u{1F50D}', state: 'CAUGHT IT', headline: 'Caught it',
          detail: `You flagged ARI's ${aiTxt} and named the slip. The real amount was ${trueTxt}. ${MISCONCEPTIONS[a.flaw].fix} You just caught your own habit in someone else's work.` };
        delta = 8;
      } else {
        this.missTally[sk][a.flaw] = Math.max(0, (this.missTally[sk][a.flaw] || 0) - 1);
        v = { tone: 'warn', icon: '\u{2699}\u{FE0F}', state: 'CLOSE', headline: 'Right to flag it',
          detail: `Flagging it was the right move, but you named the wrong slip. ARI logged ${aiTxt}; the real amount was ${trueTxt}. ${MISCONCEPTIONS[a.flaw].fix}` };
        delta = -4;
      }
      this.recordWorld({ icon: v.icon, tone: v.tone, text: `${sc.system}, audit ${v.state.toLowerCase()}`, stock: sc.stock, delta });
      this.labSave();
      this.auditDone = true; this.auditChecked = true; this.auditVerdict = v; this.lastVerdict = v;
    },

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
      this.recordWorld({ icon: v.icon, tone: v.tone, text: feed, stock: sc.stock, delta });
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
        this.recordWorld({ icon: sc.icon, tone: 'success', text: `${sc.system}, identified`, stock: sc.stock, delta: 6 });
      } else {
        v = { tone: 'fail', icon: '\u{2753}', state: 'NO MATCH', headline: 'No match', detail: `${sc.fail} It was actually ${this.fo.item.molecular} (${this.fo.item.name}).`, gauge: null };
        this.recordWorld({ icon: '\u{1F6A8}', tone: 'fail', text: `${sc.system}, misidentified`, stock: sc.stock, delta: -12 });
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
        this.recordWorld({ icon: sc.icon, tone: 'success', text: `${sc.system}, water recovered`, stock: sc.stock, delta: 6 });
      } else {
        v = { tone: 'fail', icon: '\u{1F6A8}', state: 'WATER LOST', headline: 'Setpoint off', detail: `${sc.fail} The correct value is x = ${this.hy.xCorrect}.`, gauge: null };
        this.recordWorld({ icon: '\u{1F6A8}', tone: 'fail', text: `${sc.system}, water lost`, stock: sc.stock, delta: -12 });
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
        this.recordWorld({ icon: sc.icon, tone: 'success', text: `${sc.system}, fuel identified`, stock: sc.stock, delta: 6 });
      } else {
        v = { tone: 'fail', icon: '\u{2753}', state: 'NO MATCH', headline: 'No match', detail: `${sc.fail} The empirical formula was ${this.cb.empStr}.`, gauge: null };
        this.recordWorld({ icon: '\u{1F6A8}', tone: 'fail', text: `${sc.system}, no match`, stock: sc.stock, delta: -12 });
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
      this.recordWorld({ icon: v.icon, tone: v.tone, text: feed, stock: sc.stock, delta });
      this.capAttempted = true; this.capChecked = true; this.capVerdict = v; this.lastVerdict = v;
    }
  };
}
