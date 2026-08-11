// main.js — Unit 11 view-model (Nuclear Chemistry, TEKS C.14). Scenario layer.
// Wires model.js + the engine + the shared game framework. Every stage is a brief ->
// tool -> commit -> consequence (GAMIFICATION design rule 0): the emission picker with
// its A and Z steppers, the fission/fusion classifier, the isotope bench and the
// activity calculator are the tools; committing produces a verdict (outcomeBand on the
// dose stage, per-option consequences everywhere else) that feeds a session-local
// world-state. Here the world-state IS nuclear: the activity left in the morning's
// technetium vial, in millicuries, falling on the real 6 hour half-life. Wrong calls
// cost minutes, and minutes cost activity. Outcomes are primary; XP and streak stay a
// quiet line; per-TEKS mastery meters persist.
import {
  SE, EMISSIONS, REASONS, UNIT_HOURS, UNIT_LABEL,
  SERIES, BINDING_CASES, DOSAGE_CASES, SCENARIOS
} from './model.js';
import {
  NUCLIDES, DECAY_PARTICLES, decayProduct, isBalancedNuclear, symbolForZ, nameForZ,
  halfLifeRemaining, nucleonMassSum, massDefect, bindingEnergyMeV, MEV_PER_U,
  HYDROGEN_ATOM_MASS_U, NEUTRON_MASS_U, effectiveHalfLife, fmt
} from '../../../shared/js/chem.js';
import { createGame, outcomeBand } from '../../../shared/js/game.js';

const pick = a => a[(Math.random() * a.length) | 0];
const rN = (x, n) => { const p = 10 ** n; return Math.round(x * p) / p; };
const rand = (lo, hi, dp = 0) => rN(lo + Math.random() * (hi - lo), dp);
const nuclide = sym => NUCLIDES.find(n => n.sym === sym);

// The vial is the world-state. A generator elution of a few hundred millicuries is an
// ordinary morning, a single adult dose is roughly 25 mCi, and the technetium in it
// halves every 6 hours whatever anybody does about it.
const START_VIAL = 340;      // mCi on the bench at 07:00
const TC_HALFLIFE_H = 6;     // hours
const DOSE_MCI = 25;         // one adult dose drawn from the vial
const SHIFT_START = 7 * 60;  // 07:00, in minutes past midnight

const skills = [
  { id: 'a',   code: 'C.14(A)',  label: 'Decay equations',    target: 3 },
  { id: 'b',   code: 'C.14(B)',  label: 'Fission vs fusion',  target: 3 },
  { id: 'c',   code: 'C.14(C)',  label: 'Applications',       target: 3 },
  { id: 'hl',  code: 'C.14(C)',  label: 'Half-life on the clock', target: 3 },
  { id: 'h1',  code: 'Honors',   label: 'Decay series',       target: 2, honors: true },
  { id: 'h2',  code: 'Honors',   label: 'Binding energy',     target: 2, honors: true },
  { id: 'h3',  code: 'Honors',   label: 'Effective half-life', target: 2, honors: true },
  { id: 'cap', code: 'Capstone', label: 'The last call',      target: 1, honors: true }
];

// mhchem fragment for one nuclide, e.g. ^{99}_{43}Tc. Falls back to the bare atomic
// number when a Z is off the end of both reference tables, which the stepper ranges
// are built to prevent.
const nucCE = (A, Z) => `^{${A}}_{${Z}}${symbolForZ(Z) || `\\text{Z${Z}}`}`;

export { SE };

export function createSim() {
  return {
    ...createGame({ unitId: '11-nuclear', skills }),
    SE, fmt, EMISSIONS, REASONS, MEV_PER_U, HYDROGEN_ATOM_MASS_U, NEUTRON_MASS_U,
    honors: false,
    mode: 'ident',

    // ---- world-state: the morning's vial and the clock eating it (session-local) ----
    vial: START_VIAL,
    clockMin: 0,
    patients: 0,
    worldLog: [],
    _wid: 0,
    scIdx: { a: -1, b: -1, c: -1, hl: -1 },

    // ---- stage state ----
    id_: null, idEm: null, idA: 0, idZ: 0, idChecked: false, idAttempted: false, idDone: false, idVerdict: null,
    pw: null, pwKind: null, pwAns: null, pwChecked: false, pwAttempted: false, pwDone: false, pwVerdict: null,
    ap: null, apPick: null, apReason: null, apChecked: false, apAttempted: false, apDone: false, apVerdict: null,
    ds: null, dsIso: '', dsVal: '', dsChecked: false, dsAttempted: false, dsDone: false, dsVerdict: null,
    sr: null, srAlpha: 0, srBeta: 0, srChecked: false, srAttempted: false, srDone: false, srVerdict: null,
    be: null, beVal: '', beClass: null, beChecked: false, beAttempted: false, beDone: false, beVerdict: null,
    ef: null, efTe: '', efTime: '', efChecked: false, efAttempted: false, efDone: false, efVerdict: null,
    cap: null, capPick: null, capChecked: false, capAttempted: false, capWin: false, capVerdict: null,

    init() {
      this.gLoad();
      this.genIdent();
      this.genPower();
      this.genApply();
      this.genDose();
      this.genSeries();
      this.genBinding();
      this.genEffective();
      // GOTCHA: a <select x-model> whose options come from a child x-for binds before
      // the options exist, so a non-first initial value does not stick. Re-set after paint.
      this.$nextTick(() => { const v = this.dsIso; this.dsIso = null; this.dsIso = v; });
    },

    setMode(m) {
      this.mode = m;
      if (m === 'capstone' && this.capUnlocked && !this.cap) this.genCapstone();
    },

    resetProgress() {
      this.gReset();
      this.vial = START_VIAL; this.clockMin = 0; this.patients = 0; this.worldLog = [];
      this.scIdx = { a: -1, b: -1, c: -1, hl: -1 };
      this.genIdent(); this.genPower(); this.genApply(); this.genDose();
      this.genSeries(); this.genBinding(); this.genEffective();
      this.cap = null; this.capWin = false; this.capVerdict = null;
    },

    // ---- scenario plumbing ----
    nextScenario(skill) {
      const list = SCENARIOS.filter(s => s.skill === skill);
      const i = (this.scIdx[skill] = (this.scIdx[skill] ?? -1) + 1) % list.length;
      return list[i];
    },
    // Advance the shift clock, decay the vial by exactly that much real time, apply any
    // activity the call wasted or spent, and prepend a log line. A wrong call costs
    // roughly three times as many minutes as a right one, which is the whole feedback
    // loop: the isotope does not wait for you.
    recordWorld({ icon, tone, text, minutes, spend = 0 }) {
      this.clockMin += minutes;
      const decayed = halfLifeRemaining(this.vial, minutes / 60, TC_HALFLIFE_H);
      this.vial = rN(Math.max(0, decayed - spend), 1);
      this.worldLog.unshift({ id: ++this._wid, icon, tone, text: `${this.clockLabel} ${text}` });
      if (this.worldLog.length > 6) this.worldLog.pop();
    },
    get clockLabel() {
      const t = SHIFT_START + this.clockMin;
      return `${String(Math.floor(t / 60) % 24).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;
    },
    get dosesLeft() { return Math.floor(this.vial / DOSE_MCI); },
    get vialPct() { return Math.max(0, Math.min(100, this.vial / START_VIAL * 100)); },
    get vialMood() { return this.vial >= START_VIAL * 0.55 ? '\u{1F642}' : this.vial >= START_VIAL * 0.25 ? '\u{1F630}' : '\u{1F635}'; },
    get vialState() {
      if (this.vial >= START_VIAL * 0.55) return 'Vial hot, list on track';
      if (this.vial >= START_VIAL * 0.25) return 'Activity fading';
      if (this.vial >= DOSE_MCI) return 'Down to the last doses';
      return 'Below a usable dose';
    },
    get vialColor() {
      return this.vial >= START_VIAL * 0.55 ? 'var(--success)'
        : this.vial >= START_VIAL * 0.25 ? 'var(--warn)' : 'var(--danger)';
    },

    seCaption(se) {
      if (this.gMastered(se.id)) return 'Mastered';
      const sk = this.g_skills[se.id];
      const def = this.g_skillDefs.find(d => d.id === se.id) || {};
      return `${sk ? sk.run : 0} of ${def.target || 3} correct in a row`;
    },

    // ===================== C.14(A) name the emission, balance the equation =====================
    // Identity task with two halves that are the standard itself: read the penetration
    // evidence to name the emission (the "characteristics"), then set the daughter's A
    // and Z so both are conserved (the "balanced nuclear equation").
    genIdent() {
      const sc = this.nextScenario('a');
      const n = nuclide(sc.nuclide);
      const truth = decayProduct(n.A, n.Z, n.mode);
      // Stepper ranges wide enough to get every mode wrong, narrow enough that every Z
      // in range still resolves to a real symbol.
      const zList = [];
      for (let z = n.Z - 4; z <= n.Z + 2; z++) if (z > 0 && symbolForZ(z)) zList.push(z);
      this.id_ = { sc, n, truth,
        aMin: Math.max(0, n.A - 8), aMax: n.A,
        zMin: zList[0], zMax: zList[zList.length - 1] };
      this.idEm = null; this.idA = n.A; this.idZ = n.Z;
      this.idChecked = false; this.idAttempted = false; this.idDone = false; this.idVerdict = null;
    },
    idPickEm(k) { if (!this.idDone) this.idEm = k; },
    idEmState(k) {
      if (!this.idChecked) return this.idEm === k ? 'on' : '';
      if (!this.id_) return '';
      if (k === this.id_.n.mode) return 'correct';
      return k === this.idEm ? 'wrong' : '';
    },
    idStep(field, d) {
      if (this.idDone || !this.id_) return;
      const lo = field === 'idA' ? this.id_.aMin : this.id_.zMin;
      const hi = field === 'idA' ? this.id_.aMax : this.id_.zMax;
      this[field] = Math.max(lo, Math.min(hi, this[field] + d));
      this.idChecked = false;
    },
    get idDaughterSym() { return symbolForZ(this.idZ) || '?'; },
    get idDaughterName() { return nameForZ(this.idZ) || 'unknown'; },
    // The equation as it stands right now, so the learner watches it balance or not.
    // The emission term only appears once one is picked: mhchem has no placeholder
    // token, so an unpicked slot is shown as the muted prompt beside the equation.
    get idEquation() {
      if (!this.id_) return '';
      const em = EMISSIONS.find(e => e.key === this.idEm);
      const right = em ? `${nucCE(this.idA, this.idZ)} + ${em.notation}` : nucCE(this.idA, this.idZ);
      return `${nucCE(this.id_.n.A, this.id_.n.Z)} -> ${right}`;
    },
    // Live conservation check on whatever the learner has set so far.
    get idBalanced() {
      if (!this.id_ || !this.idEm) return false;
      const p = DECAY_PARTICLES[this.idEm];
      return isBalancedNuclear(
        [{ A: this.id_.n.A, Z: this.id_.n.Z }],
        [{ A: this.idA, Z: this.idZ }, { A: p.A, Z: p.Z }]
      );
    },
    get idMassSum() { return this.idEm ? this.idA + DECAY_PARTICLES[this.idEm].A : null; },
    get idChargeSum() { return this.idEm ? this.idZ + DECAY_PARTICLES[this.idEm].Z : null; },
    idCommit() {
      if (this.idDone || !this.idEm) return;
      const sc = this.id_.sc, n = this.id_.n, truth = this.id_.truth;
      const emOk = this.idEm === n.mode;
      const nucOk = this.idA === truth.A && this.idZ === truth.Z;
      const good = emOk && nucOk;
      const rightEq = `${nucCE(n.A, n.Z)} -> ${nucCE(truth.A, truth.Z)} + ${EMISSIONS.find(e => e.key === n.mode).notation}`;
      const rightTxt = `${n.name} goes to ${nameForZ(truth.Z).toLowerCase()}-${truth.A}.`;
      let v, minutes, spend = 0, feed;
      if (good) {
        v = { tone: 'success', icon: sc.icon, state: 'SOURCE IDENTIFIED', headline: 'Identified',
          detail: sc.consequences[this.idEm], eq: rightEq, gauge: null };
        this.idDone = true; minutes = 6 + ((Math.random() * 4) | 0); feed = `${sc.system}, identified`;
      } else if (!emOk) {
        v = { tone: 'fail', icon: '\u{2622}\u{FE0F}', state: 'WRONG EMISSION', headline: 'Wrong emission',
          detail: `${sc.consequences[this.idEm]} The evidence points to ${EMISSIONS.find(e => e.key === n.mode).tag.toLowerCase()}. ${rightTxt}`,
          eq: rightEq, gauge: null };
        minutes = 20 + ((Math.random() * 10) | 0); spend = 6; feed = `${sc.system}, misidentified`;
      } else {
        const dA = this.idA + DECAY_PARTICLES[this.idEm].A, dZ = this.idZ + DECAY_PARTICLES[this.idEm].Z;
        v = { tone: 'warn', icon: '\u{2696}\u{FE0F}', state: 'DOES NOT BALANCE', headline: 'Right emission, unbalanced equation',
          detail: `You named the emission correctly, but your right-hand side adds up to A ${dA} and Z ${dZ} against a parent at A ${n.A} and Z ${n.Z}. Both have to match. ${rightTxt}`,
          eq: rightEq, gauge: null };
        minutes = 14 + ((Math.random() * 8) | 0); feed = `${sc.system}, equation unbalanced`;
      }
      this.gRecord('a', good, !this.idAttempted);
      this.recordWorld({ icon: v.icon, tone: v.tone, text: feed, minutes, spend });
      this.idAttempted = true; this.idChecked = true; this.idVerdict = v;
    },
    idNext() { this.genIdent(); },

    // ===================== C.14(B) fission, fusion, or neither =====================
    // Decision task. Classify the equation, then answer the question that depends on
    // the classification. Every option carries its real consequence for the department.
    genPower() {
      const sc = this.nextScenario('b');
      this.pw = { sc };
      this.pwKind = null; this.pwAns = null;
      this.pwChecked = false; this.pwAttempted = false; this.pwDone = false; this.pwVerdict = null;
    },
    pwPickKind(k) { if (!this.pwDone) this.pwKind = k; },
    pwPickAns(k) { if (!this.pwDone) this.pwAns = k; },
    pwKindState(k) {
      if (!this.pwChecked) return this.pwKind === k ? 'on' : '';
      if (!this.pw) return '';
      if (k === this.pw.sc.kind) return 'correct';
      return k === this.pwKind ? 'wrong' : '';
    },
    pwAnsState(k) {
      if (!this.pwChecked) return this.pwAns === k ? 'on' : '';
      if (!this.pw) return '';
      if (k === this.pw.sc.question.correct) return 'correct';
      return k === this.pwAns ? 'wrong' : '';
    },
    pwCommit() {
      if (this.pwDone || !this.pwKind || !this.pwAns) return;
      const sc = this.pw.sc;
      const kindOk = this.pwKind === sc.kind;
      const ansOk = this.pwAns === sc.question.correct;
      const good = kindOk && ansOk;
      const kindWord = sc.kind === 'neither' ? 'neither fission nor fusion' : sc.kind;
      let v, minutes, feed;
      if (good) {
        v = { tone: 'success', icon: sc.icon, state: 'CALLED IT', headline: `This is ${kindWord}`,
          detail: sc.consequences[this.pwAns], gauge: null };
        this.pwDone = true; minutes = 6 + ((Math.random() * 4) | 0); feed = `${sc.system}, called correctly`;
      } else if (!kindOk) {
        v = { tone: 'fail', icon: '\u{2622}\u{FE0F}', state: 'WRONG PROCESS', headline: 'Wrong process',
          detail: `This is ${kindWord}. ${sc.kindNote} Classify it wrong and everything downstream of it is wrong too.`, gauge: null };
        minutes = 20 + ((Math.random() * 10) | 0); feed = `${sc.system}, process misclassified`;
      } else {
        v = { tone: 'fail', icon: '\u{1F6A8}', state: 'WRONG CONCLUSION', headline: 'Right process, wrong conclusion',
          detail: `You classified it correctly as ${kindWord}, then drew the wrong conclusion from it. ${sc.consequences[this.pwAns]}`, gauge: null };
        minutes = 18 + ((Math.random() * 8) | 0); feed = `${sc.system}, wrong conclusion`;
      }
      this.gRecord('b', good, !this.pwAttempted);
      this.recordWorld({ icon: v.icon, tone: v.tone, text: feed, minutes });
      this.pwAttempted = true; this.pwChecked = true; this.pwVerdict = v;
    },
    pwNext() { this.genPower(); },

    // ===================== C.14(C) pick the isotope and justify it =====================
    // Decision task. Choosing correctly is choosing on a nuclear property, so the second
    // half asks which property it was. Every wrong isotope carries its real outcome.
    genApply() {
      const sc = this.nextScenario('c');
      this.ap = { sc, offered: sc.offered.map(s => nuclide(s)) };
      this.apPick = null; this.apReason = null;
      this.apChecked = false; this.apAttempted = false; this.apDone = false; this.apVerdict = null;
    },
    apPickIso(k) { if (!this.apDone) this.apPick = k; },
    apPickReason(k) { if (!this.apDone) this.apReason = k; },
    apIsoState(k) {
      if (!this.apChecked) return this.apPick === k ? 'on' : '';
      if (!this.ap) return '';
      if (k === this.ap.sc.correct) return 'correct';
      return k === this.apPick ? 'wrong' : '';
    },
    apReasonState(k) {
      if (!this.apChecked) return this.apReason === k ? 'on' : '';
      if (!this.ap) return '';
      if (k === this.ap.sc.reason) return 'correct';
      return k === this.apReason ? 'wrong' : '';
    },
    // Half-life written the way a label writes it, for the isotope cards.
    hlLabel(n) { return n ? `${fmt(n.halfLife)} ${UNIT_LABEL[n.halfLifeUnit]}` : ''; },
    modeLabel(n) { return n ? (EMISSIONS.find(e => e.key === n.mode) || {}).tag || n.mode : ''; },
    apCommit() {
      if (this.apDone || !this.apPick || !this.apReason) return;
      const sc = this.ap.sc;
      const isoOk = this.apPick === sc.correct;
      const reasonOk = this.apReason === sc.reason;
      const good = isoOk && reasonOk;
      const right = nuclide(sc.correct);
      const why = REASONS.find(r => r.key === sc.reason).label;
      let v, minutes, spend = 0, feed;
      if (good) {
        v = { tone: 'success', icon: sc.icon, state: 'RIGHT ISOTOPE', headline: 'Right isotope, right reason',
          detail: sc.consequences[this.apPick], gauge: null };
        this.apDone = true; minutes = 6 + ((Math.random() * 4) | 0); feed = `${sc.system}, ${sc.correct} selected`;
      } else if (!isoOk) {
        v = { tone: 'fail', icon: '\u{2622}\u{FE0F}', state: 'WRONG ISOTOPE', headline: 'Wrong isotope',
          detail: `${sc.consequences[this.apPick]} The job needed ${right.name}: ${why}`, gauge: null };
        minutes = 22 + ((Math.random() * 10) | 0); spend = 8; feed = `${sc.system}, wrong isotope`;
      } else {
        v = { tone: 'warn', icon: '\u{2696}\u{FE0F}', state: 'RIGHT FOR THE WRONG REASON', headline: 'Right isotope, wrong reason',
          detail: `You reached for the right vial, but not for the property that actually decided it. ${why}`, gauge: null };
        minutes = 12 + ((Math.random() * 6) | 0); feed = `${sc.system}, reason misread`;
      }
      this.gRecord('c', good, !this.apAttempted);
      this.recordWorld({ icon: v.icon, tone: v.tone, text: feed, minutes, spend });
      this.apAttempted = true; this.apChecked = true; this.apVerdict = v;
    },
    apNext() { this.genApply(); },

    // ===================== C.14(C) half-life: what is left at injection =====================
    // Dose task. The method precondition is picking the right isotope's half-life (using
    // the parent's 66 hours on a technetium eluate is a real and expensive mistake); the
    // committed value is the learner's own activity, so the four bands mean something.
    genDose() {
      const sc = this.nextScenario('hl');
      const k = sc.constraints;
      const a0 = rand(k.a0Min, k.a0Max, 0);
      const elapsed = rand(k.elapsedMin, k.elapsedMax, sc.unit === 'min' ? 0 : 1);
      const trueHL = this.hlIn(sc.isotope, sc.unit);
      const trueA = rN(halfLifeRemaining(a0, elapsed, trueHL), 2);
      this.ds = { sc, a0, elapsed, trueHL, trueA, unit: sc.unit, bands: sc.bands,
        candidates: sc.candidates.map(s => nuclide(s)) };
      this.dsIso = ''; this.dsVal = '';
      this.dsChecked = false; this.dsAttempted = false; this.dsDone = false; this.dsVerdict = null;
    },
    // A nuclide's half-life expressed in some other time unit.
    hlIn(sym, unit) {
      const n = nuclide(sym);
      return n.halfLife * UNIT_HOURS[n.halfLifeUnit] / UNIT_HOURS[unit];
    },
    get dsIsoOk() { return !!this.ds && this.dsIso === this.ds.sc.isotope; },
    get dsUnitWord() { return this.ds ? UNIT_LABEL[this.ds.unit] : ''; },
    // Live preview from whatever half-life is currently selected, plus how many
    // half-lives that makes the elapsed time.
    get dsHalfLives() {
      if (!this.ds || !this.dsIso) return null;
      return rN(this.ds.elapsed / this.hlIn(this.dsIso, this.ds.unit), 2);
    },
    get dsPreview() {
      if (!this.ds || !this.dsIso) return null;
      return rN(halfLifeRemaining(this.ds.a0, this.ds.elapsed, this.hlIn(this.dsIso, this.ds.unit)), 2);
    },
    dsCommit() {
      if (this.dsDone || !this.dsIso || this.dsVal === '') return;
      const sc = this.ds.sc;
      const a = parseFloat(this.dsVal);
      const needTxt = `${fmt(this.ds.trueA)} mCi`;
      let v, good = false, minutes, spend = 0, scanned = false;
      if (!this.dsIsoOk) {
        const wrong = nuclide(this.dsIso);
        v = { tone: 'fail', icon: '\u{2699}\u{FE0F}', state: 'WRONG HALF-LIFE', headline: 'Wrong isotope on the clock',
          detail: `You decayed it on the ${wrong.name} half-life of ${fmt(this.hlIn(this.dsIso, this.ds.unit))} ${this.dsUnitWord}. This vial is ${nuclide(sc.isotope).name}, which halves every ${fmt(this.ds.trueHL)} ${this.dsUnitWord}, so the whole calculation is built on the wrong clock.`,
          gauge: null };
        minutes = 22 + ((Math.random() * 10) | 0); spend = 10;
      } else if (!isFinite(a)) {
        v = { tone: 'fail', icon: '\u{2699}\u{FE0F}', state: 'NO FIGURE', headline: 'Nothing committed',
          detail: sc.fail, gauge: null };
        minutes = 12 + ((Math.random() * 6) | 0);
      } else {
        const band = outcomeBand(a, this.ds.trueA, this.ds.bands);
        good = band.withinSpec;
        const dev = `${Math.abs((a - this.ds.trueA) / this.ds.trueA * 100).toFixed(0)}%`;
        const yours = `${fmt(a)} mCi`;
        if (good) {
          v = { tone: 'success', icon: sc.icon, state: sc.safeState, headline: 'On the prescription',
            detail: `You called ${yours} against the ${needTxt} actually in it. ${sc.safe}`, gauge: 'on' };
          this.dsDone = true; minutes = 8 + ((Math.random() * 5) | 0); spend = DOSE_MCI; scanned = true;
        } else if (band.direction === 'low') {
          v = { tone: 'fail', icon: '\u{1F6A8}', state: sc.lowState, headline: 'Under-read the vial',
            detail: `You called ${yours}, ${dev} below the ${needTxt} in it. ${sc.low}`, gauge: 'low' };
          minutes = 22 + ((Math.random() * 10) | 0); spend = DOSE_MCI + 10;
        } else {
          v = { tone: 'fail', icon: '\u{1F6A8}', state: sc.highState, headline: 'Over-read the vial',
            detail: `You called ${yours}, ${dev} above the ${needTxt} in it. ${sc.high}`, gauge: 'high' };
          minutes = 22 + ((Math.random() * 10) | 0); spend = DOSE_MCI;
        }
      }
      if (scanned) this.patients += 1;
      this.gRecord('hl', good, !this.dsAttempted);
      this.recordWorld({ icon: v.icon, tone: v.tone,
        text: `${sc.system}, ${good ? 'dose on prescription' : 'dose wrong'}`, minutes, spend });
      this.dsAttempted = true; this.dsChecked = true; this.dsVerdict = v;
    },
    dsNext() { this.genDose(); },

    // ===================== Honors h1: the whole decay series =====================
    // Only alpha moves the mass number, and it moves it by exactly 4, so the alpha count
    // is fixed the moment you look at A. The betas are then whatever it takes to land on
    // the right Z. The check is the engine's own conservation test.
    genSeries() {
      const sc = SCENARIOS.find(s => s.id === 'h1-series');
      const s = pick(SERIES);
      this.sr = { sc, s };
      this.srAlpha = 0; this.srBeta = 0;
      this.srChecked = false; this.srAttempted = false; this.srDone = false; this.srVerdict = null;
    },
    srStep(field, d) {
      if (this.srDone) return;
      this[field] = Math.max(0, Math.min(12, this[field] + d));
      this.srChecked = false;
    },
    get srA() { return this.sr ? this.sr.s.parent.A - 4 * this.srAlpha : 0; },
    get srZ() { return this.sr ? this.sr.s.parent.Z - 2 * this.srAlpha + this.srBeta : 0; },
    get srOk() {
      if (!this.sr) return false;
      const right = [{ A: this.sr.s.end.A, Z: this.sr.s.end.Z }];
      if (this.srAlpha > 0) right.push({ A: 4, Z: 2, count: this.srAlpha });
      if (this.srBeta > 0) right.push({ A: 0, Z: -1, count: this.srBeta });
      return isBalancedNuclear([{ A: this.sr.s.parent.A, Z: this.sr.s.parent.Z }], right);
    },
    get srEquation() {
      if (!this.sr) return '';
      const p = this.sr.s.parent, e = this.sr.s.end;
      const a = this.srAlpha ? ` + ${this.srAlpha > 1 ? this.srAlpha : ''}^{4}_{2}He` : '';
      const b = this.srBeta ? ` + ${this.srBeta > 1 ? this.srBeta : ''}^{0}_{-1}e` : '';
      return `${nucCE(p.A, p.Z)} -> ${nucCE(e.A, e.Z)}${a}${b}`;
    },
    srCommit() {
      if (this.srDone) return;
      const sc = this.sr.sc, s = this.sr.s;
      const ok = this.srOk;
      const trueAlpha = (s.parent.A - s.end.A) / 4;
      const trueBeta = s.end.Z - (s.parent.Z - 2 * trueAlpha);
      let v;
      if (ok) {
        v = { tone: 'success', icon: sc.icon, state: 'CHAIN CLOSED', headline: 'The series conserves',
          detail: `${this.srAlpha} alpha decays take the mass number from ${s.parent.A} down to ${s.end.A}, four at a time, and drop the atomic number by ${2 * this.srAlpha}. ${this.srBeta} beta decays put ${this.srBeta} back to land on ${s.end.Z}. ${sc.success}`,
          eq: this.srEquation, gauge: null };
        this.srDone = true;
        this.recordWorld({ icon: sc.icon, tone: 'success', text: `${sc.system}, ${s.name} closed`, minutes: 7 });
      } else {
        v = { tone: 'fail', icon: '\u{2696}\u{FE0F}', state: 'CHAIN OPEN', headline: 'The series does not conserve',
          detail: `Your chain leaves A at ${this.srA} and Z at ${this.srZ}, against ${s.end.sym} at A ${s.end.A} and Z ${s.end.Z}. Start from the mass number: only alpha changes it, and only by four, so ${s.parent.A} down to ${s.end.A} needs exactly ${trueAlpha} of them. Then count how many betas it takes to bring the atomic number back up.`,
          eq: this.srEquation, gauge: null };
        this.recordWorld({ icon: '\u{2696}\u{FE0F}', tone: 'fail', text: `${sc.system}, chain does not conserve`, minutes: 16 });
      }
      this.gRecord('h1', ok, !this.srAttempted);
      this.srAttempted = true; this.srChecked = true; this.srVerdict = v;
    },
    srNext() { this.genSeries(); },

    // ===================== Honors h2: binding energy per nucleon =====================
    // The curve that makes fission and fusion one idea rather than two. Below about
    // A = 50 a nuclide gains by joining; above about A = 100 it gains by splitting;
    // in between it sits near the top and neither route buys much.
    genBinding() {
      const sc = SCENARIOS.find(s => s.id === 'h2-binding');
      const c = pick(BINDING_CASES);
      const sum = nucleonMassSum(c.A, c.Z);
      const defect = massDefect(sum, c.mass);
      const total = bindingEnergyMeV(defect);
      const per = total / c.A;
      const route = c.A < 50 ? 'fusion' : c.A > 100 ? 'fission' : 'peak';
      this.be = { sc, c, sum: rN(sum, 6), defect: rN(defect, 6), total: rN(total, 2), per: rN(per, 3), route };
      this.beVal = ''; this.beClass = null;
      this.beChecked = false; this.beAttempted = false; this.beDone = false; this.beVerdict = null;
    },
    bePickClass(k) { if (!this.beDone) this.beClass = k; },
    beClassState(k) {
      if (!this.beChecked) return this.beClass === k ? 'on' : '';
      if (!this.be) return '';
      if (k === this.be.route) return 'correct';
      return k === this.beClass ? 'wrong' : '';
    },
    get beValueOk() {
      if (!this.be) return false;
      const v = parseFloat(this.beVal);
      return isFinite(v) && Math.abs(v - this.be.per) <= 0.05;
    },
    beCommit() {
      if (this.beDone || this.beVal === '' || !this.beClass) return;
      const sc = this.be.sc, c = this.be.c;
      const valueOk = this.beValueOk;
      const classOk = this.beClass === this.be.route;
      const good = valueOk && classOk;
      const routeWord = this.be.route === 'fusion' ? 'joining with other light nuclei, which is fusion'
        : this.be.route === 'fission' ? 'splitting into mid-sized pieces, which is fission'
        : 'neither, because it already sits near the top of the curve';
      const truth = `The loose nucleons would weigh ${fmt(this.be.sum, 7)} u, the nuclide weighs ${fmt(c.mass, 7)} u, so the defect is ${fmt(this.be.defect, 4)} u. At ${MEV_PER_U} MeV per u that is ${fmt(this.be.total, 5)} MeV in total, or ${fmt(this.be.per, 3)} MeV per nucleon across ${c.A} nucleons. Iron-56 tops the curve at about 8.79.`;
      let v, minutes;
      if (good) {
        v = { tone: 'success', icon: sc.icon, state: 'ON THE CURVE', headline: 'Placed correctly',
          detail: `${truth} ${c.name} therefore releases energy by ${routeWord}. ${sc.success}`, gauge: null };
        this.beDone = true; minutes = 7;
      } else if (!valueOk) {
        v = { tone: 'fail', icon: '\u{1F6A8}', state: 'FIGURE OFF', headline: 'Binding energy is off',
          detail: `${truth} ${sc.fail}`, gauge: null };
        minutes = 16;
      } else {
        v = { tone: 'warn', icon: '\u{2696}\u{FE0F}', state: 'WRONG SIDE OF THE PEAK', headline: 'Right number, wrong side',
          detail: `Your figure is right, but you put the nuclide on the wrong part of the curve. At A ${c.A} it releases energy by ${routeWord}.`, gauge: null };
        minutes = 12;
      }
      this.gRecord('h2', good, !this.beAttempted);
      this.recordWorld({ icon: v.icon, tone: v.tone, text: `${sc.system}, ${c.sym} ${good ? 'placed' : 'misplaced'}`, minutes });
      this.beAttempted = true; this.beChecked = true; this.beVerdict = v;
    },
    beNext() { this.genBinding(); },

    // ===================== Honors h3: effective half-life =====================
    // Decay and excretion are two independent routes out, so the RATES add. That is why
    // the combined half-life is always shorter than either one alone.
    genEffective() {
      const sc = SCENARIOS.find(s => s.id === 'h3-effective');
      const c = pick(DOSAGE_CASES);
      const te = effectiveHalfLife(c.physical, c.biological);
      const time = te * Math.log2(1 / c.threshold);
      this.ef = { sc, c, te: rN(te, 3), time: rN(time, 2), unit: UNIT_LABEL[c.unit] };
      this.efTe = ''; this.efTime = '';
      this.efChecked = false; this.efAttempted = false; this.efDone = false; this.efVerdict = null;
    },
    get efTeOk() {
      if (!this.ef) return false;
      const v = parseFloat(this.efTe);
      return isFinite(v) && Math.abs(v - this.ef.te) / this.ef.te <= 0.03;
    },
    get efTimeOk() {
      if (!this.ef) return false;
      const v = parseFloat(this.efTime);
      return isFinite(v) && Math.abs(v - this.ef.time) / this.ef.time <= 0.04;
    },
    efCommit() {
      if (this.efDone || this.efTe === '' || this.efTime === '') return;
      const sc = this.ef.sc, c = this.ef.c;
      const teOk = this.efTeOk, timeOk = this.efTimeOk;
      const good = teOk && timeOk;
      const truth = `1/te = 1/${fmt(c.physical)} + 1/${fmt(c.biological)} gives an effective half-life of ${fmt(this.ef.te)} ${this.ef.unit}, and falling to ${Math.round(c.threshold * 100)} percent takes log2(1/${c.threshold}) of them, which is ${fmt(this.ef.time)} ${this.ef.unit}.`;
      let v, minutes;
      if (good) {
        v = { tone: 'success', icon: sc.icon, state: 'RELEASE TIME SET', headline: 'Both figures check out',
          detail: `${truth} ${sc.success}`, gauge: null };
        this.efDone = true; minutes = 7;
      } else if (!teOk) {
        v = { tone: 'fail', icon: '\u{1F6A8}', state: 'HALF-LIVES NOT COMBINED', headline: 'Effective half-life is off',
          detail: `${truth} Adding or averaging the two half-lives does not work: it is the rates that add, so the reciprocals do. ${sc.fail}`, gauge: null };
        minutes = 16;
      } else {
        v = { tone: 'warn', icon: '\u{2696}\u{FE0F}', state: 'CLEARANCE TIME OFF', headline: 'Right half-life, wrong clearance time',
          detail: `Your effective half-life is right, but the time to threshold is not. ${truth}`, gauge: null };
        minutes = 12;
      }
      this.gRecord('h3', good, !this.efAttempted);
      this.recordWorld({ icon: v.icon, tone: v.tone, text: `${sc.system}, ${good ? 'time agreed' : 'time wrong'}`, minutes });
      this.efAttempted = true; this.efChecked = true; this.efVerdict = v;
    },
    efNext() { this.genEffective(); },

    // ===================== Capstone: the last patient of the morning =====================
    get capUnlocked() { return this.gOverall() === 1; },
    genCapstone() {
      const sc = SCENARIOS.find(s => s.id === 'cap-lastcase');
      // Two conditions decide the one defensible call, and the first of them is the
      // world-state the learner spent all morning creating.
      const needed = rand(20, 30, 0);
      const afternoonOpen = Math.random() < 0.5;
      const enough = this.vial >= needed;
      const correct = enough ? 'scan' : (afternoonOpen ? 'rebook' : 'refer');
      this.cap = { sc, needed, afternoonOpen, enough, correct, vialAtCall: this.vial, clockAtCall: this.clockLabel };
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
      const fig = `At ${this.cap.clockAtCall} the vial holds ${fmt(this.cap.vialAtCall)} mCi against a prescription of ${fmt(this.cap.needed)} mCi, so it ${this.cap.enough ? 'can' : 'cannot'} make the dose. The afternoon list ${this.cap.afternoonOpen ? 'has a slot open after the 14:00 delivery' : 'is full, with nothing after the 14:00 delivery'}.`;
      const good = this.capPick === this.cap.correct;
      let v, minutes;
      if (good) {
        v = { tone: 'success', icon: sc.icon, state: 'RIGHT CALL', headline: 'Right call',
          detail: `${fig} ${opt.good}`, gauge: null };
        this.capWin = true; minutes = 10;
        if (this.capPick === 'scan') this.patients += 1;
      } else {
        v = { tone: 'fail', icon: '\u{1F6A8}', state: 'WRONG CALL', headline: 'Wrong call',
          detail: `${fig} ${opt.consequence}`, gauge: null };
        minutes = 30;
      }
      this.gRecord('cap', good, !this.capAttempted);
      this.recordWorld({ icon: v.icon, tone: v.tone, text: `${sc.system}, ${good ? 'right call' : 'wrong call'}`,
        minutes, spend: good && this.capPick === 'scan' ? this.cap.needed : 0 });
      this.capAttempted = true; this.capChecked = true; this.capVerdict = v;
    }
  };
}
