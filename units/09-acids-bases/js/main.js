// main.js: Unit 9 view-model (Acids & Bases, TEKS C.12).
//
// The units_new build: units/09-acids-bases rendered in the mission-cockpit shell. This
// unit arrived already retrofitted with the Scenario layer, so the chemistry, the bands,
// the verdicts, the consequences and the world-state are copied exactly as they were. What
// the port adds is presentation plumbing only:
//   * unitId 'units_new/09-acids-bases', so progress never collides with the old save
//   * the cockpit readouts the mission screen and the status rail bind to (activeBrief,
//     activeVerdict, activeTone, activeArtId, activeStationName, activeStateLabel,
//     activeOutcomeText, activeReference, coreSkills, teksMasteredCount, scArt)
//   * screenOf, the per-bench claim on the one mission screen (porting traps 3 and 17):
//     neutralize carries d + h1 and meter carries e + h2, so both the verdict AND the
//     scenario have to follow recency or one of the two can never be read or drawn
//   * three session counters the status rail's four meters read (calls, callsRight,
//     reached) -- counting only, nothing grades off them
//   * a resize call for the Chart.js titration curve from setMode(), because a canvas laid
//     out while its panel was display:none measures zero and stays zero (porting trap 12)
// No band, verdict, consequence or scenario text is changed by the port.
//
// Wires the model + engine + the
// shared game framework to the UI. You are the overnight tech on a poison-control bench,
// one night shift, with a patient next door who is acidotic at pH 7.20. Every stage's core
// interaction IS the chemistry: build an IUPAC name from its rule parts, find a conjugate
// partner, sort bottles by dissociation, criss-cross a salt and call the moles that
// neutralize it, and convert an ion concentration into a pH. No multiple-choice-with-a-
// meter, no drag-and-drop. The Scenario layer sits around those tools unchanged: a brief
// before the call, a banded verdict after it, and a world-state that is the chemistry
// itself, the patient's arterial pH.
import {
  SE, ACID_NAMES, BASE_NAMES, ACID_PREFIXES, ACID_ROOTS, ACID_SUFFIXES,
  BASE_METALS, BASE_ROMANS, BASE_SUFFIXES, DEFINE_POOL, STRENGTH, STRENGTH_REASON,
  NEUT_ACIDS, NEUT_BASES, WEAK_ACIDS, WEAK_CONCS, INDICATORS,
  SCENARIOS, NEUT_BANDS, METER_BANDS, METER_MANTISSAS, WEAK_BANDS, titrBands
} from './model.js?v=u9-fidelity-20260826';
import {
  pH, pOH, pHfromPOH, equivalenceVolume, titrationPH, phWeakAcid,
  moleRatio, gcd, fmt
} from '../../../shared/js/chem.js';
import { sceneArt } from './art.js?v=u9-fidelity-20260826';
import { createGame, outcomeBand } from '../../../shared/js/game.js';
import { lineChart } from '../../../shared/js/render.js';

// Chart.js object lives at module scope, never inside Alpine's reactive proxy.
let titrChart = null;

const pick = a => a[(Math.random() * a.length) | 0];
const shuffle = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
// Pick from a list while avoiding the recently used items, so a run is not rote.
const pickNot = (a, recent, keyFn = x => x) => {
  const fresh = a.filter(x => !recent.includes(keyFn(x)));
  return pick(fresh.length ? fresh : a);
};
const rN = (x, n) => { const p = 10 ** n; return Math.round(x * p) / p; };
const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));
const lcm = (a, b) => a * b / gcd(a, b);
const scOf = id => SCENARIOS.find(s => s.id === id);

// Fallback for the header's active-station line, used only before a bench has generated
// its first scenario. After that the scenario's own `system` is the better name, because
// it says which call is in front of you rather than which tab is open.
const STATION_NAME = {
  naming: 'Naming', define: 'Definitions', strength: 'Strong vs weak',
  neutralize: 'Neutralize', meter: 'pH meter', capstone: 'Triage'
};

// The six calls that physically reach the patient next door, derived from the scenarios
// rather than listed by hand: they are exactly the ones whose correct outcome moves the
// arterial pH. Read only by the status rail's "Reached" meter -- nothing grades off it.
const REACHING = SCENARIOS.filter(s => s.delta && s.delta.ok > 0).map(s => s.id);
// "an acid" but "a base": the define verdict builds a sentence around a pool value.
const article = w => (/^[aeiou]/i.test(w) ? 'an ' : 'a ') + w;

// pH -> color across the scale: red (acidic 0) through green (neutral 7) to
// blue (basic 14). Hue 0..240 maps the 0..14 range.
const phColor = ph => `hsl(${clamp(ph / 14, 0, 1) * 240}, 68%, 45%)`;

// ---- world-state constants: the patient, the reference window, the night clock ----
const PH_START = 7.20;      // arterial pH on arrival: a real acidotic patient
const PH_FLOOR = 6.80;      // the low extreme of survivable, and the end of the scale
const PH_CEIL = 7.44;       // correct calls titrate INTO the window, never past it
const WIN_LO = 7.35, WIN_HI = 7.45;   // the real arterial reference range
const PH_CRASH = 7.10;      // below this the patient is crashing, not just acidotic
const SCALE_LO = 6.80, SCALE_HI = 7.60;   // the drawn scale, with headroom past the window
const DRIFT_PER_MIN = 0.002;  // the patient drifts down while you work: 0.02 pH per 10 min
const SHIFT_START = 23 * 60;  // the night shift starts at 23:00
const SHIFT_LEN = 8 * 60;     // and hands over at 07:00: the clock stops there rather than
                              // stamping a log line at lunchtime on a night shift

// Build a neutral salt formula from a cation token + its subscript and an anion
// token (poly = takes parentheses) + its subscript. e.g. ('Ca',1,'NO3',true,2) -> 'Ca(NO3)2'.
function buildSalt(cat, catSub, an, anPoly, anSub) {
  const catPart = cat + (catSub > 1 ? catSub : '');
  const anPart = anSub > 1 ? (anPoly ? `(${an})${anSub}` : `${an}${anSub}`) : an;
  return catPart + anPart;
}

const skills = [
  { id: 'a',  code: 'C.12(A)', label: 'Acid/base naming',      target: 3 },
  { id: 'b',  code: 'C.12(B)', label: 'Definitions/conjugates', target: 3 },
  { id: 'c',  code: 'C.12(C)', label: 'Strong vs weak',         target: 3 },
  { id: 'd',  code: 'C.12(D)', label: 'Neutralization',         target: 3 },
  { id: 'e',  code: 'C.12(E)', label: 'pH calculations',           target: 3 },
  { id: 'h1', code: 'Honors',  label: 'Titration curve',        target: 2, honors: true },
  { id: 'h2', code: 'Honors',  label: 'Weak-acid Ka',           target: 2, honors: true },
  { id: 'cap', code: 'Capstone', label: 'Last call',            target: 1, honors: true }
];

export { SE };

export function createSim() {
  return {
    ...createGame({ unitId: 'units_new/09-acids-bases', skills }),
    SE, fmt,
    honors: false,
    mode: 'naming',
    // Standards tracking is a teacher-facing concern, so it collapses to one header badge
    // and expands on demand. Session-only: nothing about it is worth persisting.
    teksOpen: false,

    // Which scenario and which verdict own the mission screen, per bench.
    //
    // The screen shows ONE scenario and ONE verdict, and two of this unit's benches carry
    // two commits: `neutralize` holds C.12(D) plus the Honors titration, `meter` holds
    // C.12(E) plus the Honors weak-acid Ka. Each has its own scenario, its own banner and
    // its own consequence. Porting trap 3 says the verdict has to follow recency or
    // whichever commit loses a fixed precedence can never be read; trap 17 says the
    // SCENARIO has to follow it too, or activeArtId always resolves to the core scenario
    // and the h1-titrate / h2-weak banners are drawn and never seen.
    screenOf: { naming: null, define: null, strength: null, neutralize: null, meter: null, capstone: null },

    // ---- world-state: the patient, and the night log (session-local) ----
    // The driving state IS the chemistry: arterial blood pH, against the real 7.35 to 7.45
    // reference range. It drifts down with elapsed minutes, so a slow wrong answer costs
    // the same way a fast wrong one does. The old `stabilized` counter was deleted rather
    // than renamed, because a number that only goes up is a score, not a world.
    ph: PH_START,
    clockMin: 0,
    worldLog: [],
    _wid: 0,
    // Counting only, for the status rail's four meters. `reached` holds the ids of the six
    // patient-facing calls that have been made correctly at least once.
    calls: 0,
    callsRight: 0,
    reached: [],
    scIdx: { a: -1, b: -1, c: -1, d: -1, e: -1 },

    // vocabularies for the name-builder selects
    acidPrefixes: ACID_PREFIXES, acidRoots: ACID_ROOTS, acidSuffixes: ACID_SUFFIXES,
    baseMetals: BASE_METALS, baseRomans: BASE_ROMANS, baseSuffixes: BASE_SUFFIXES,
    indicators: INDICATORS,

    // ---- stage state (all generated in init so no subtree ever hits a null) ----
    na: null, naSel: { prefix: '', root: '', suffix: '', metal: '', roman: '' }, naChecked: false, naAttempted: false, naDone: false, naVerdict: null, recentA: [],
    df: null, dfBags: {}, dfLastText: '', dfA: null, dfB: null, dfChecked: false, dfAttempted: false, dfDone: false, dfVerdict: null,
    st: null, stSel: {}, stReason: null, stChecked: false, stAttempted: false, stDone: false, stVerdict: null,
    nu: null, nuCat: 1, nuAn: 1, nuBaseInput: '', nuChecked: false, nuAttempted: false, nuDone: false, nuVerdict: null,
    ti: null, tiVb: 0, tiInd: null, tiChecked: false, tiAttempted: false, tiDone: false, tiVerdict: null,
    me: null, meGuess: 7, meClass: null, meChecked: false, meAttempted: false, meDone: false, meVerdict: null,
    wa: null, waGuess: 7, waChecked: false, waAttempted: false, waDone: false, waVerdict: null,
    cap: null, capNaSel: { prefix: '', root: '', suffix: '' }, capClass: null,
    capCat: 1, capAn: 1, capBaseInput: '', capChecked: false, capAttempted: false, capWin: false, capVerdict: null,

    init() {
      this.gLoad();
      this.genNaming();
      this.dfDeal();
      this.genStrength();
      this.genNeutralize();
      this.genMeter();
      this.genTitration();
      this.genWeak();
      this.$nextTick(() => this.buildTitrChart());
      // The mode watch moved into setMode() -- see the note there. The honors watch stays:
      // flipping Honors on is the moment the chart's own wrapper leaves display:none, and
      // nothing else fires then.
      this.$watch('honors', () => this.$nextTick(() => { this.resizeTitr(); this.reapplySelects(); }));
    },

    setMode(m) {
      this.mode = m;
      if (m === 'capstone' && this.capUnlocked && !this.cap) this.genCapstone();
      // Porting trap 12, the Chart.js half. `titrChart` is built in init() while this
      // panel is still display:none, so it measures 0x0 and -- with
      // maintainAspectRatio:false -- stays 0x0 until something re-reads the wrapper.
      // The titration canvas sits behind THREE independent display:none gates (this
      // station, the Honors switch, and the h1 unlock), so each gate owns one resize:
      // this one, the honors $watch in init(), and the hook at the end of nuCheck().
      // $nextTick, because Alpine flips x-show after the handler returns and a resize
      // read before that measures the hidden box all over again.
      if (m === 'neutralize') this.$nextTick(() => { this.resizeTitr(); this.updateTitrChart(); });
    },

    resetProgress() {
      this.gReset();
      this.screenOf = { naming: null, define: null, strength: null, neutralize: null, meter: null, capstone: null };
      this.calls = 0; this.callsRight = 0; this.reached = [];
      this.ph = PH_START; this.clockMin = 0; this.worldLog = [];
      this.scIdx = { a: -1, b: -1, c: -1, d: -1, e: -1 };
      this.dfBags = {}; this.dfLastText = ''; this.recentA = [];
      this.genNaming(); this.dfDeal(); this.genStrength(); this.genNeutralize();
      this.genMeter(); this.genTitration(); this.genWeak();
      this.cap = null; this.capWin = false; this.capVerdict = null;
    },

    // ---- scenario plumbing ----
    // A commit takes its bench's mission screen: its scenario, its banner, its verdict.
    claimScreen(mode, sc, v, honors) { this.screenOf[mode] = { sc, v, honors: !!honors }; },
    // A regenerate gives it back, asymmetrically, and the asymmetry is the whole point.
    //
    // A CORE regenerate always takes the screen. The shell hides the console's .brief
    // card, so the mission screen is the ONLY place the new call's goal is stated; if an
    // Honors outcome could hold the screen through "Next spill", the learner would be
    // looking at a bench whose question is nowhere on the page.
    //
    // An HONORS regenerate is the polite one: it evicts an Honors claim but leaves a core
    // outcome standing, because each Honors block states its own task in the console
    // beside its own controls.
    releaseScreen(mode, honors) {
      const s = this.screenOf[mode];
      if (!honors || !s || s.honors) this.screenOf[mode] = null;
    },

    nextScenario(skill) {
      const list = SCENARIOS.filter(s => s.skill === skill);
      const i = (this.scIdx[skill] = (this.scIdx[skill] ?? -1) + 1) % list.length;
      return list[i];
    },
    // Advance the night clock, drift the patient down by exactly that much elapsed time,
    // apply what the call itself did, and prepend a log line. U11's clock-and-spend shape,
    // because the drift-with-time behaviour is exactly U11's decaying vial. A correct call
    // titrates the patient toward the window and never past it (PH_CEIL), which is what an
    // intervention that is dosed correctly looks like.
    recordWorld({ icon, tone, text, minutes, delta = 0 }) {
      // The clock is a simulation timer only. Student answers do not alter a physiological
      // measurement; the reference arterial pH shown in the rail remains fixed at 7.20.
      const spent = Math.min(minutes, SHIFT_LEN - this.clockMin);
      this.clockMin += spent;
      this.worldLog.unshift({ id: ++this._wid, icon, tone, text: `${this.clockLabel} ${text}` });
      if (this.worldLog.length > 6) this.worldLog.pop();
    },
    get clockLabel() {
      const t = SHIFT_START + this.clockMin;
      return `${String(Math.floor(t / 60) % 24).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;
    },
    // Two fixed decimals, NOT fmt(): fmt takes significant figures, so it prints 7.20 as
    // "7.2", and a headline number that changes width as it moves reads as a different
    // measurement rather than the same one moving.
    get phLabel() { return this.ph.toFixed(2); },
    get phInWindow() { return this.ph >= WIN_LO && this.ph <= WIN_HI; },
    // A windowed meter, not a monotone bar: the needle sits where the patient is and the
    // safe band is drawn on the scale, so "better" is toward a band, not toward an end.
    get phNeedlePct() { return clamp((this.ph - SCALE_LO) / (SCALE_HI - SCALE_LO), 0, 1) * 100; },
    get phBandLeftPct() { return (WIN_LO - SCALE_LO) / (SCALE_HI - SCALE_LO) * 100; },
    get phBandWidthPct() { return (WIN_HI - WIN_LO) / (SCALE_HI - SCALE_LO) * 100; },
    get phMood() { return '\u{1F9EA}'; },
    get phState() { return 'Reference blood-gas example'; },
    get phTone() { return this.phInWindow ? 'var(--success)' : this.ph >= PH_CRASH ? 'var(--warn)' : 'var(--danger)'; },
    get winLo() { return WIN_LO; },
    get winHi() { return WIN_HI; },

    // Every commit handler that can flip a mastery gate re-applies the <select> values on
    // the next tick. A select inside a subtree that first renders on MASTERY binds before
    // its x-for has built the options, and the dropdown then shows the wrong one silently
    // (trap 36). The capstone's three name selects are exactly that subtree.
    reapplySelects() {
      this.naSel = { ...this.naSel };
      this.capNaSel = { ...this.capNaSel };
    },

    // Shared verdict builders. A dose stage grades a committed number with outcomeBand; a
    // decision or identity stage grades a pick. Both return the same {tone, icon, state,
    // headline, detail, gauge} shape the markup renders.
    // `dp` is fixed decimal places, and it is required rather than optional: every quantity
    // this unit grades (a pH, a mole figure, a burette volume) is a fixed-precision
    // measurement, and fmt() takes SIGNIFICANT figures, so it would print a committed 7.30
    // as "7.3" against a target of "7.301" and read as two different measurements (trap 43).
    doseVerdict(sc, val, target, bands, unit, detail, dp) {
      if (!isFinite(val)) {
        return { v: { tone: 'fail', icon: '\u{26A0}\u{FE0F}', state: 'ENTER A NUMBER', headline: 'Enter a numerical answer', detail: sc.fail, gauge: null }, good: false, dir: 'fail' };
      }
      const band = outcomeBand(val, target, bands);
      const good = band.withinSpec;
      const n = x => x.toFixed(dp);
      const yours = `${n(val)} ${unit}`;
      const targetTxt = `${n(target)} ${unit}`;
      if (good) {
        const headline = band.band === 'ideal' ? 'Correct' : 'Within activity tolerance';
        return { v: { tone: 'success', icon: sc.icon, state: sc.safeState, headline,
          detail: `Your result is ${yours}; the target is ${targetTxt}. ${detail} ${sc.safe}`, gauge: 'on' }, good: true, dir: 'ok' };
      }
      const off = `${n(Math.abs(val - target))} ${unit}`;
      const low = band.direction === 'low';
      return { v: { tone: 'fail', icon: '\u{1F6A8}', state: low ? sc.lowState : sc.highState,
        headline: low ? 'Below target' : 'Above target',
        detail: `Your result is ${yours}; the target is ${targetTxt}. The difference is ${off}. ${detail} ${low ? sc.low : sc.high}`,
        gauge: low ? 'low' : 'high' }, good: false, dir: low ? 'low' : 'high' };
    },
    decisionVerdict(sc, good, state, headline, detail, consequence) {
      return good
        ? { tone: 'success', icon: sc.icon, state: 'CORRECT', headline, detail: `${detail} ${consequence}`, gauge: null }
        : { tone: 'fail', icon: '\u{1F6A8}', state, headline, detail: `${detail} ${consequence}`, gauge: null };
    },
    // The tail every commit handler shares: book the world move, then re-apply the selects
    // in case this call was the one that unlocked the capstone.
    commitWorld(sc, ok, text, delta) {
      this.calls++;
      if (ok) {
        this.callsRight++;
        if (REACHING.includes(sc.id) && !this.reached.includes(sc.id)) this.reached.push(sc.id);
      }
      this.recordWorld({ icon: ok ? sc.icon : '\u{1F6A8}', tone: ok ? 'success' : 'fail', text,
        minutes: ok ? sc.minutes.ok : sc.minutes.wrong, delta });
      this.$nextTick(() => this.reapplySelects());
    },

    // ===================== cockpit readouts =====================
    // Everything the mission screen and the status rail bind to. Nothing here decides
    // anything: it reads the bench state the commit handlers above already produced.
    scArt(id) { return sceneArt(id); },

    // The bench's own scenario, before any commit has claimed the screen.
    get coreBrief() {
      if (this.mode === 'naming') return (this.na && this.na.sc) || null;
      if (this.mode === 'define') return (this.df && this.df.sc) || null;
      if (this.mode === 'strength') return (this.st && this.st.sc) || null;
      if (this.mode === 'neutralize') return (this.nu && this.nu.sc) || null;
      if (this.mode === 'meter') return (this.me && this.me.sc) || null;
      // The capstone brief exists before the beaker is drawn, so the locked station still
      // says what it is going to ask for rather than showing an empty screen.
      if (this.mode === 'capstone') return (this.cap && this.cap.sc) || scOf('cap-last') || null;
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
      return b && b.id ? b.id : 'a-caller';
    },
    get activeStationName() {
      const b = this.activeBrief;
      if (b && b.system) return b.system;
      return STATION_NAME[this.mode] || 'The night shift';
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
      return 'Choose a practice station. Use the chemistry evidence to complete the current task.';
    },

    // The facts a learner should never have to leave the bench to look up: a rule, a
    // relationship, a threshold. Three lines at most, because this card shares a column
    // with the scenario narrative and every extra line here is a line taken off the text
    // somebody actually reads.
    //
    // These are deliberately the facts the bench does NOT already print beside its own
    // controls -- the naming rules moved off the console paragraph and onto this card
    // rather than being said twice. The two benches that carry an Honors commit swap in
    // that call's relationships while its outcome holds the screen, because at that point
    // the core rule has been used and the equivalence arithmetic or the equilibrium is
    // what is in play.
    get activeReference() {
      const out = [];
      if (this.mode === 'naming') {
        out.push({ k: 'Binary acid', v: 'no oxygen: hydro- + root + -ic acid' });
        out.push({ k: 'Oxyacid', v: '-ate ion gives -ic acid; -ite ion gives -ous acid' });
        out.push({ k: 'Hydroxide base', v: 'metal name + hydroxide; use a Roman numeral for a variable-charge metal' });
      } else if (this.mode === 'define') {
        out.push({ k: 'Arrhenius', v: 'in water: acid increases H3O+; base increases OH-' });
        out.push({ k: 'Brønsted-Lowry', v: 'acid donates H+; base accepts H+' });
        out.push({ k: 'Conjugate pair', v: 'two species that differ by exactly one H+' });
      } else if (this.mode === 'strength') {
        out.push({ k: 'Strong acid', v: 'ionizes essentially completely in water' });
        out.push({ k: 'Strong hydroxide', v: 'a soluble ionic hydroxide dissociates essentially completely' });
        out.push({ k: 'Strength ≠ hazard', v: 'strength describes ionization, not overall chemical danger' });
      } else if (this.mode === 'neutralize') {
        if (this.screenIsHonors && this.ti) {
          out.push({ k: 'Equivalence', v: 'acid equivalents = base equivalents' });
          out.push({ k: 'On the bench', v: this.ti.Ca.toFixed(2) + ' M × ' + this.ti.Va + ' mL against ' + this.ti.Cb.toFixed(2) + ' M' });
          out.push({ k: 'Activity criterion', v: 'choose the listed indicator range that includes pH 7.00' });
        } else {
          out.push({ k: 'Neutralization', v: 'match acid equivalents with hydroxide equivalents' });
          out.push({ k: 'Stoichiometry', v: 'use the balanced coefficients to get the mole ratio' });
          out.push({ k: 'Salt formula', v: 'balance cation and anion charges to the lowest whole-number ratio' });
        }
      } else if (this.mode === 'meter') {
        if (this.screenIsHonors && this.wa) {
          out.push({ k: 'Weak acid', v: 'Ka = x²/(C - x), where x = [H+]' });
          out.push({ k: 'On the bench', v: this.wa.C.toFixed(3) + ' M ' + this.wa.acid.f + ', Ka ' + this.wa.acid.Ka.toExponential(1) });
          out.push({ k: 'Then', v: 'pH = -log[H+]' });
        } else {
          out.push({ k: 'pH', v: 'pH = -log[H+]' });
          out.push({ k: 'At 25 °C', v: 'pH + pOH = 14.00' });
          out.push({ k: 'One pH unit', v: 'a tenfold change in [H+]' });
        }
      } else if (this.mode === 'capstone') {
        out.push({ k: 'Four steps', v: 'name, classify strength, predict the salt, neutralize' });
        out.push({ k: 'Neutralization', v: 'match acid and hydroxide equivalents' });
        out.push({ k: 'Check', v: 'use the first incorrect step to guide your revision' });
      }
      return out.slice(0, 3);
    },

    get coreSkills() { return SE.filter(se => !se.honors); },
    get teksMasteredCount() { return this.coreSkills.filter(se => this.gMastered(se.id)).length; },

    // ---- the status rail's four meters (porting trap 13: never fewer than four) ----
    // Four honest quantities out of this unit's world, and each one can move without the
    // other three. Every bar is drawn so that a full bar means good.
    //
    // Short values and one-word labels, deliberately (porting trap 15): at 1024x600 the
    // rail's meter cells are about 115px, and whether label plus value fits on one line is
    // the difference between a 54px row and a 73px one. The full meaning lives in each
    // row's title.
    get railReadings() {
      const left = Math.max(0, SHIFT_LEN - this.clockMin);
      const leftLabel = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`;
      const right = this.calls ? Math.round(this.callsRight / this.calls * 100) : 0;
      const certs = this.teksMasteredCount, coreN = this.coreSkills.length;
      const caseTarget = 15;
      return [
        { key: 'cases', label: 'Cases', raw: `${Math.min(this.calls, caseTarget)}/${caseTarget}`,
          pct: Math.min(this.calls / caseTarget, 1) * 100,
          hint: 'activity progress: this practice bar fills after 15 submitted cases' },
        { key: 'right', label: 'Accuracy', raw: `${right}%`, pct: right,
          hint: 'percentage of submitted cases answered correctly' },
        { key: 'skills', label: 'Skills', raw: `${certs}/${coreN}`, pct: certs / coreN * 100,
          hint: 'activity mastery for the five C.12 practice skills' },
        { key: 'shift', label: 'Sim time', raw: leftLabel, pct: left / SHIFT_LEN * 100,
          hint: 'simulated time remaining in the activity shift; this is not a scientific measurement' }
      ];
    },
    stockColor(v) { return v >= 67 ? 'var(--success)' : v >= 34 ? 'var(--warn)' : 'var(--danger)'; },

    seCaption(se) {
      if (this.gMastered(se.id)) return 'Activity mastered';
      const sk = this.g_skills[se.id];
      const def = this.g_skillDefs.find(d => d.id === se.id) || {};
      return `${sk ? sk.run : 0} of ${def.target || 3} correct in a row`;
    },

    // ===================== C.12(A) acid + base naming =====================
    genNaming() {
      const sc = this.nextScenario('a');
      const pool = [...ACID_NAMES, ...BASE_NAMES].filter(x => sc.constraints.formulas.includes(x.f));
      if (!pool.length) throw new Error(`genNaming: ${sc.id} pins no ACID_NAMES or BASE_NAMES formula that exists`);
      const item = pickNot(pool, this.recentA, x => x.f);
      this.recentA = [...this.recentA, item.f].slice(-5);
      this.na = { ...item, sc };
      this.naSel = { prefix: '', root: '', suffix: '', metal: '', roman: '' };
      this.naChecked = false; this.naAttempted = false; this.naDone = false; this.naVerdict = null;
      this.releaseScreen('naming', false);
      this.$nextTick(() => this.reapplySelects());
    },
    get naReady() {
      const s = this.naSel;
      return this.na.kind === 'base' ? !!(s.metal && s.roman && s.suffix) : !!(s.prefix && s.root && s.suffix);
    },
    // The stem is the substance (which element, and which member of a series); the ending is
    // which form of it. They fail differently, so the verdict needs to know which one went.
    get naStemOk() {
      const s = this.naSel, n = this.na;
      return n.kind === 'base' ? s.metal === n.metal && s.roman === n.roman : s.prefix === n.prefix && s.root === n.root;
    },
    get naOk() {
      const s = this.naSel, n = this.na;
      return n.kind === 'base'
        ? s.metal === n.metal && s.roman === n.roman && s.suffix === n.suffix
        : s.prefix === n.prefix && s.root === n.root && s.suffix === n.suffix;
    },
    joinAcid(prefix, root, suffix) {
      const p = prefix === '(none)' ? '' : prefix;
      const stem = suffix === '-ide' ? root + 'ide' : suffix === '-ous acid' ? root + 'ous acid' : root + 'ic acid';
      return p + stem;
    },
    joinBase(metal, roman, suffix) {
      return metal + (roman === '(none)' ? '' : roman) + ' ' + suffix;
    },
    naPreview(sel) {
      const n = this.na;
      if (n.kind === 'base') {
        if (!(sel.metal && sel.roman && sel.suffix)) return '...';
        return this.joinBase(sel.metal, sel.roman, sel.suffix);
      }
      if (!(sel.prefix && sel.root && sel.suffix)) return '...';
      return this.joinAcid(sel.prefix, sel.root, sel.suffix);
    },
    get naExplain() {
      const n = this.na;
      if (n.kind === 'base') {
        return `${n.f} is ${n.name}: a hydroxide base is the metal name plus hydroxide, with a roman numeral for the charge when the metal has more than one.`;
      }
      if (n.kind === 'binary') {
        return `${n.f} is ${n.name}: a binary acid has no oxygen, so it takes hydro- plus the element root plus -ic acid.`;
      }
      return `${n.f} is ${n.name}: an oxyacid built on an -ate ion ends in -ic acid and one built on an -ite ion ends in -ous acid, with per- and hypo- shifting the chlorine series one step either way.`;
    },
    naCheck() {
      if (this.naDone || !this.naReady) return;
      const sc = this.na.sc, n = this.na;
      const stemOk = this.naStemOk;
      const ok = this.naOk;
      const consequence = ok ? sc.right : (stemOk ? sc.wrongSuffix : sc.wrongStem);
      const v = this.decisionVerdict(sc, ok, stemOk ? 'CHECK THE ENDING' : 'CHECK THE FORMULA',
        ok ? `${n.name}: correctly named` : `It is ${n.name}, not ${this.naPreview(this.naSel)}`,
        this.naExplain, consequence);
      this.gRecord('a', ok, !this.naAttempted);
      this.commitWorld(sc, ok, `${sc.system}, ${ok ? 'named' : 'name needs revision'}`, ok ? sc.delta.ok : sc.delta.wrong);
      this.naAttempted = true; this.naChecked = true; this.naVerdict = v;
      this.claimScreen('naming', sc, v, false);
      if (ok) this.naDone = true;
    },
    naNext() { this.genNaming(); },

    // ===================== C.12(B) definitions + conjugate pairs =====================
    // The scenario pins which KIND of card is dealt (a framework statement or a conjugate
    // pair), and the bag rotates within that subset so a run does not repeat a card.
    dfDeal() {
      const sc = this.nextScenario('b');
      const pool = DEFINE_POOL.filter(d => sc.constraints.kinds.includes(d.kind));
      if (!pool.length) throw new Error(`dfDeal: ${sc.id} pins no DEFINE_POOL kind that exists`);
      // One bag per scenario, so a card cannot repeat until that scenario's subset is
      // exhausted even though the two scenarios alternate.
      if (!this.dfBags[sc.id] || !this.dfBags[sc.id].length) {
        const bag = shuffle(pool.map((_, i) => i));
        if (pool[bag[0]].text === this.dfLastText && bag.length > 1) bag.push(bag.shift());
        this.dfBags[sc.id] = bag;
      }
      const item = pool[this.dfBags[sc.id].shift()];
      this.dfLastText = item.text;
      this.df = { ...item, sc };
      this.dfA = null; this.dfB = null;
      this.dfChecked = false; this.dfAttempted = false; this.dfDone = false; this.dfVerdict = null;
      this.releaseScreen('define', false);
    },
    dfPickA(v) { if (!this.dfDone) { this.dfA = v; this.dfChecked = false; } },
    dfPickB(v) { if (!this.dfDone) { this.dfB = v; this.dfChecked = false; } },
    dfStateA(v) {
      if (!this.dfChecked) return this.dfA === v ? 'on' : '';
      if (v === this.df.qA.answer) return 'correct';
      if (v === this.dfA) return 'wrong';
      return '';
    },
    dfStateB(v) {
      if (!this.dfChecked) return this.dfB === v ? 'on' : '';
      if (v === this.df.qB.answer) return 'correct';
      if (v === this.dfB) return 'wrong';
      return '';
    },
    get dfAOk() { return this.dfA === this.df.qA.answer; },
    get dfOk() { return this.dfA === this.df.qA.answer && this.dfB === this.df.qB.answer; },
    dfCheck() {
      if (this.dfDone || this.dfA === null || this.dfB === null) return;
      const sc = this.df.sc;
      const aOk = this.dfAOk;
      const ok = this.dfOk;
      const consequence = ok ? sc.right : (aOk ? sc.wrongB : sc.wrongA);
      // The two card kinds ask different questions of qA, so the headline has to differ:
      // on a conjugate card qA is the partner and the role belongs to the species on the
      // card; on a framework card qA is the definition and the role is what it describes.
      const answer = this.df.kind === 'conjugate'
        ? `The partner is ${this.df.qA.answer}, and ${this.df.ce} is acting as ${article(this.df.qB.answer)}`
        : `It is the ${this.df.qA.answer} definition, describing ${article(this.df.qB.answer)}`;
      const v = this.decisionVerdict(sc, ok, aOk ? 'CHECK THE ROLE' : 'CHECK THE PARTNER',
        ok ? 'Both parts are correct' : answer,
        this.df.explain, consequence);
      this.gRecord('b', ok, !this.dfAttempted);
      this.commitWorld(sc, ok, `${sc.system}, ${ok ? 'pair identified' : 'pair needs revision'}`, ok ? sc.delta.ok : sc.delta.wrong);
      this.dfAttempted = true; this.dfChecked = true; this.dfVerdict = v;
      this.claimScreen('define', sc, v, false);
      if (ok) this.dfDone = true;
    },
    dfNext() { this.dfDeal(); },

    // ===================== C.12(C) strong vs weak =====================
    // A scenario may narrow each half of its family to the bottles its own fiction can
    // hold (`strong` / `weak`) and REQUIRE the ones its brief names out loud (`must`).
    // Without that, a brief about vinegar and pool acid could draw a shelf of HCN and
    // perchloric acid, and a hospital housekeeping cart could arrive carrying caesium
    // hydroxide. Both lists are optional; a scenario that pins neither behaves as before.
    genStrength() {
      const sc = this.nextScenario('c');
      const fam = pick(sc.constraints.fams);
      const pool = STRENGTH[fam];
      if (!pool) throw new Error(`genStrength: ${sc.id} pins no STRENGTH family that exists`);
      const k = sc.constraints;
      const only = (list, allow) => (allow ? list.filter(b => allow.includes(b.f)) : list);
      const strongPool = only(pool.strong, k.strong);
      const weakPool = only(pool.weak, k.weak);
      const must = k.must || [];
      const mustStrong = strongPool.filter(b => must.includes(b.f));
      const mustWeak = weakPool.filter(b => must.includes(b.f));
      if (mustStrong.length + mustWeak.length !== must.length) {
        throw new Error(`genStrength: ${sc.id} requires a bottle its own pools do not hold`);
      }
      // Still 1..3 strong with the rest weak, but clamped so both halves stay non-empty,
      // every required bottle gets a slot, and neither half is asked for more bottles than
      // it has. Fail loudly rather than silently shipping a three-bottle shelf.
      const lo = Math.max(1, mustStrong.length, 4 - weakPool.length);
      const hi = Math.min(3, strongPool.length, 4 - Math.max(1, mustWeak.length));
      if (lo > hi) throw new Error(`genStrength: ${sc.id} cannot fill four bottles from its pools`);
      const nStrong = lo + ((Math.random() * (hi - lo + 1)) | 0);
      const take = (list, req, n) => [...req, ...shuffle(list.filter(b => !req.includes(b))).slice(0, n - req.length)];
      const bottles = shuffle([
        ...take(strongPool, mustStrong, nStrong).map(b => ({ ...b, strong: true })),
        ...take(weakPool, mustWeak, 4 - nStrong).map(b => ({ ...b, strong: false }))
      ]);
      const reason = STRENGTH_REASON[fam];
      this.st = { sc, fam, bottles, reason: { ...reason, options: shuffle(reason.options) } };
      this.stSel = {}; this.stReason = null;
      this.stChecked = false; this.stAttempted = false; this.stDone = false; this.stVerdict = null;
      this.releaseScreen('strength', false);
    },
    stSet(f, v) { if (!this.stDone) { this.stSel[f] = v; this.stChecked = false; } },
    stState(f, v) {
      const bottle = this.st.bottles.find(b => b.f === f);
      if (!bottle) return '';   // stale x-for item during a shelf swap; harmless
      const correct = bottle.strong ? 'strong' : 'weak';
      if (!this.stChecked) return this.stSel[f] === v ? 'on' : '';
      if (v === correct) return 'correct';
      if (v === this.stSel[f]) return 'wrong';
      return '';
    },
    stPickReason(v) { if (!this.stDone) { this.stReason = v; this.stChecked = false; } },
    stReasonState(v) {
      if (!this.stChecked) return this.stReason === v ? 'on' : '';
      if (v === this.st.reason.answer) return 'correct';
      if (v === this.stReason) return 'wrong';
      return '';
    },
    get stAllClassified() { return this.st.bottles.every(b => this.stSel[b.f]); },
    get stClassOk() { return this.st.bottles.every(b => this.stSel[b.f] === (b.strong ? 'strong' : 'weak')); },
    get stOk() { return this.stClassOk && this.stReason === this.st.reason.answer; },
    get stExplain() {
      const strong = this.st.bottles.filter(b => b.strong).map(b => b.f);
      const weak = this.st.bottles.filter(b => !b.strong).map(b => b.f);
      if (this.st.fam === 'acid') {
        return `${strong.join(', ') || 'None'} are treated as strong acids in this activity and ionize essentially completely in water; ` +
          `${weak.join(', ') || 'none'} are weak acids and ionize only partially.`;
      }
      return `${strong.join(', ') || 'None'} are strong soluble hydroxides and dissociate essentially completely; ` +
        `${weak.join(', ') || 'none'} are weak molecular bases and react with water only partially to form OH-.`;
    },
    stCheck() {
      if (this.stDone || !this.stAllClassified || !this.stReason) return;
      const sc = this.st.sc;
      const classOk = this.stClassOk;
      const ok = this.stOk;
      const consequence = ok ? sc.right : (classOk ? sc.wrongReason : sc.wrongSort);
      const v = this.decisionVerdict(sc, ok, classOk ? 'CHECK THE EXPLANATION' : 'CHECK THE CLASSIFICATION',
        ok ? `The ${this.st.fam}s are classified correctly` : `At least one ${this.st.fam} needs a different classification`,
        this.stExplain, consequence);
      this.gRecord('c', ok, !this.stAttempted);
      this.commitWorld(sc, ok, `${sc.system}, ${ok ? 'classification correct' : 'classification needs revision'}`, ok ? sc.delta.ok : sc.delta.wrong);
      this.stAttempted = true; this.stChecked = true; this.stVerdict = v;
      this.claimScreen('strength', sc, v, false);
      if (ok) this.stDone = true;
    },
    stNext() { this.genStrength(); },

    // ===================== C.12(D) neutralization =====================
    genNeutralize() {
      const sc = this.nextScenario('d');
      const acids = NEUT_ACIDS.filter(a => sc.constraints.acids.includes(a.f));
      const bases = NEUT_BASES.filter(b => sc.constraints.bases.includes(b.f));
      if (!acids.length || !bases.length) throw new Error(`genNeutralize: ${sc.id} pins no NEUT pool entry that exists`);
      // `nonUnity` drops every pair whose neutralization is one-to-one, which is exactly
      // the pairs where the acid's proton count equals the base's hydroxide count: there
      // lcm(p, h) === p === h, so both coefficients come out 1. A scenario that teaches the
      // coefficients cannot be allowed to draw a stage that has none.
      let pairs = [];
      for (const a of acids) for (const b of bases) pairs.push([a, b]);
      if (sc.constraints.nonUnity) pairs = pairs.filter(([a, b]) => a.protons !== b.hydroxides);
      if (!pairs.length) throw new Error(`genNeutralize: ${sc.id} leaves no acid/base pair once its rules apply`);
      const [acid, base] = pick(pairs);
      const g = gcd(base.charge, acid.charge);
      const catSub = acid.charge / g, anionSub = base.charge / g;        // salt criss-cross
      const L = lcm(acid.protons, base.hydroxides);
      const coefAcid = L / acid.protons, coefBase = L / base.hydroxides; // neutralization coefficients
      // Snap the draw to what the page will DISPLAY, so a learner who works from the number
      // on screen is graded against that number and not a hidden one (trap 31).
      const molAcid = rN(0.2 + Math.random() * 0.8, 2);
      const neutralBase = rN(moleRatio({ c: coefAcid }, { c: coefBase }, molAcid), 4);
      this.nu = { sc, acid, base, molAcid, V: 1.0, catSub, anionSub, coefAcid, coefBase, neutralBase, bands: NEUT_BANDS };
      this.nuCat = 1; this.nuAn = 1; this.nuBaseInput = '';
      this.nuChecked = false; this.nuAttempted = false; this.nuDone = false; this.nuVerdict = null;
      this.releaseScreen('neutralize', false);
    },
    nuCatStep(d) { if (!this.nuDone) { this.nuCat = clamp(this.nuCat + d, 1, 6); this.nuChecked = false; } },
    nuAnStep(d) { if (!this.nuDone) { this.nuAn = clamp(this.nuAn + d, 1, 6); this.nuChecked = false; } },
    get nuStudentSalt() { return buildSalt(this.nu.base.cation, this.nuCat, this.nu.acid.anion, this.nu.acid.poly, this.nuAn); },
    get nuCorrectSalt() { return buildSalt(this.nu.base.cation, this.nu.catSub, this.nu.acid.anion, this.nu.acid.poly, this.nu.anionSub); },
    get nuSaltOk() { return this.nuCat === this.nu.catSub && this.nuAn === this.nu.anionSub; },
    get nuBaseVal() { return parseFloat(this.nuBaseInput); },
    // Live beaker pH as base is added. This computes the graded answer for the learner (it
    // reads 7.00 at exactly the right number of moles), so the markup keeps it hidden until
    // the call is committed and shows it afterwards, which keeps the beaker explorable.
    // Both ionizations of H2SO4 are treated as complete here, which is the standard
    // first-course treatment and exact at the neutral point (the stoichiometry is 2 OH- per
    // H2SO4 either way); away from it the reading is approximate in the third decimal,
    // because Ka2 is 0.012 rather than infinite. The pool is strong acids and bases only so
    // that this stays the only approximation on the stage.
    get nuPH() {
      const molBase = isFinite(this.nuBaseVal) ? this.nuBaseVal : 0;
      const net = this.nu.molAcid * this.nu.acid.protons - molBase * this.nu.base.hydroxides;  // mol H+ minus mol OH-
      if (Math.abs(net) < 1e-9) return 7;
      const conc = Math.abs(net) / this.nu.V;
      return clamp(net > 0 ? pH(conc) : pHfromPOH(pOH(conc)), 0, 14);
    },
    get nuPHClass() { const p = this.nuPH; return Math.abs(p - 7) < 0.05 ? 'neutral' : p < 7 ? 'acidic' : 'basic'; },
    nuPhColor(p) { return phColor(p); },
    get nuExplain() {
      const n = this.nu;
      return `The balanced neutralization uses ${n.coefAcid} ${n.acid.f} for every ${n.coefBase} ${n.base.f}, a ${n.coefAcid}:${n.coefBase} mole ratio. ` +
        `${n.molAcid.toFixed(2)} mol of acid therefore requires ${n.neutralBase.toFixed(3)} mol of base for stoichiometric neutralization, ` +
        `and charge balance gives the salt ${this.nuCorrectSalt}.`;
    },
    nuCheck() {
      if (this.nuDone || this.nuBaseInput === '') return;
      const sc = this.nu.sc;
      const saltOk = this.nuSaltOk;
      const saltNote = saltOk ? '' : ` The salt is also wrong: criss-crossing the charges gives ${this.nuCorrectSalt}, not ${this.nuStudentSalt}.`;
      const r = this.doseVerdict(sc, this.nuBaseVal, this.nu.neutralBase, this.nu.bands, 'mol', this.nuExplain + saltNote, 3);
      let v = r.v, ok = r.good && saltOk, dir = r.dir;
      // A right amount with a wrong salt is its own outcome and needs its own consequence
      // text: falling through to sc.low would print "you called it low" over a number that
      // was exactly right, which is the contradiction trap 30 is about. The gauge still
      // reads `on`, because the gauge describes the number.
      if (r.good && !saltOk) {
        v = { tone: 'fail', icon: '\u{1F6A8}', state: 'SALT INCORRECT', headline: 'Amount correct; salt incorrect',
          detail: `${this.nuExplain}${saltNote} ${sc.saltWrong}`, gauge: 'on' };
        dir = 'salt';
      }
      const d = sc.delta;
      this.gRecord('d', ok, !this.nuAttempted);
      this.commitWorld(sc, ok, `${sc.system}, ${ok ? 'brought to neutral' : (dir === 'salt' ? 'salt formula incorrect' : 'amount outside tolerance')}`,
        ok ? d.ok : (dir === 'high' ? d.high : d.low));
      this.nuAttempted = true; this.nuChecked = true; this.nuVerdict = v;
      this.claimScreen('neutralize', sc, v, false);
      if (ok) this.nuDone = true;
      // Mastering 'd' reveals the titration canvas without a mode or honors change, so size
      // the previously display:none chart once it can be shown. Not incidental: keep it.
      if (this.honors && this.gMastered('d')) this.$nextTick(() => { this.resizeTitr(); this.updateTitrChart(); });
    },
    nuNext() { this.genNeutralize(); },

    // ===================== Honors h1: titration curve =====================
    get h1Unlocked() { return this.gMastered('d'); },
    genTitration() {
      const sc = scOf('h1-titrate');
      const Ca = pick([0.05, 0.10, 0.20]), Va = pick([20, 25, 50]), Cb = pick([0.05, 0.10, 0.20]);
      const Veq = equivalenceVolume({ Ca, Va, Cb });
      const Vmax = Veq * 2;
      const curve = [];
      for (let i = 0; i <= 120; i++) {
        const Vb = (Vmax * i) / 120;
        curve.push({ x: rN(Vb, 3), y: rN(clamp(titrationPH({ Ca, Va, Cb, Vb }), 0, 14), 3) });
      }
      // Per-scenario bands: Veq spans 5 to 200 mL, so one module const cannot serve both
      // ends. titrBands reproduces the shipped max(0.5, 2 percent) pass condition exactly.
      this.ti = { sc, Ca, Va, Cb, Veq, Vmax, curve, bands: titrBands(Veq) };
      this.tiVb = 0; this.tiInd = null;
      this.tiChecked = false; this.tiAttempted = false; this.tiDone = false; this.tiVerdict = null;
      this.releaseScreen('neutralize', true);
      this.updateTitrChart();
    },
    get tiCurrentPH() { return clamp(titrationPH({ Ca: this.ti.Ca, Va: this.ti.Va, Cb: this.ti.Cb, Vb: this.tiVb }), 0, 14); },
    get tiCorrectInd() { return (INDICATORS.find(i => 7 >= i.lo && 7 <= i.hi) || {}).name; },
    get tiIndOk() { return this.tiInd === this.tiCorrectInd; },
    tiPickInd(v) { if (!this.tiDone) { this.tiInd = v; this.tiChecked = false; } },
    tiIndState(v) {
      if (!this.tiChecked) return this.tiInd === v ? 'on' : '';
      if (v === this.tiCorrectInd) return 'correct';
      if (v === this.tiInd) return 'wrong';
      return '';
    },
    get tiExplain() {
      const t = this.ti;
      const ind = INDICATORS.find(i => i.name === this.tiCorrectInd);
      return `Moles of acid are ${(t.Ca * t.Va / 1000).toFixed(4)}, so the strong-base titration reaches equivalence at ` +
        `Veq = Ca × Va / Cb = (${t.Ca.toFixed(2)} M)(${t.Va} mL) / ${t.Cb.toFixed(2)} M = ${t.Veq.toFixed(1)} mL. ` +
        `Activity criterion: choose the listed indicator whose transition range includes pH 7.00; that is ${ind.name} (${ind.lo} to ${ind.hi}).`;
    },
    tiCheck() {
      if (this.tiDone || !this.tiInd) return;
      const sc = this.ti.sc;
      const indOk = this.tiIndOk;
      const indNote = indOk ? '' : ` The selected indicator does not meet this activity criterion: its transition range does not include pH 7.00.`;
      const r = this.doseVerdict(sc, this.tiVb, this.ti.Veq, this.ti.bands, 'mL', this.tiExplain + indNote, 1);
      let v = r.v, ok = r.good && indOk, dir = r.dir;
      if (r.good && !indOk) {
        v = { tone: 'fail', icon: '\u{1F6A8}', state: 'INDICATOR INCORRECT', headline: 'Volume correct; indicator incorrect',
          detail: `${this.tiExplain}${indNote} ${sc.indWrong}`, gauge: 'on' };
        dir = 'ind';
      }
      const d = sc.delta;
      this.gRecord('h1', ok, !this.tiAttempted);
      this.commitWorld(sc, ok, `${sc.system}, ${ok ? 'equivalence identified' : (dir === 'ind' ? 'indicator needs revision' : 'equivalence volume outside tolerance')}`,
        ok ? d.ok : (dir === 'high' ? d.high : d.low));
      this.tiAttempted = true; this.tiChecked = true; this.tiVerdict = v;
      this.claimScreen('neutralize', sc, v, true);
      if (ok) this.tiDone = true;
      this.$nextTick(() => { this.updateTitrChart(); this.reapplySelects(); });
    },
    tiNext() { this.genTitration(); },
    buildTitrChart() {
      if (typeof Chart === 'undefined' || !this.$refs.titrCanvas || titrChart) { this.updateTitrChart(); return; }
      titrChart = lineChart(this.$refs.titrCanvas, {
        datasets: [
          { label: 'titration curve', data: [], borderColor: '#2a7d8a', backgroundColor: '#2a7d8a', borderWidth: 2, pointRadius: 0, tension: 0.1 },
          { label: 'equivalence volume', data: [], borderColor: '#9c5a87', borderWidth: 1.5, borderDash: [6, 4], pointRadius: 0 },
          { label: 'meter reading', data: [], showLine: false, borderColor: '#1c2a31', backgroundColor: '#c0772f', pointRadius: 6, pointHoverRadius: 7 }
        ], xTitle: 'Volume of base added (mL)', yTitle: 'pH'
      });
      this.updateTitrChart();
    },
    updateTitrChart() {
      if (!titrChart || !this.ti) return;
      titrChart.data.datasets[0].data = this.ti.curve;
      // The dashed equivalence line IS the graded answer drawn on the chart, so it is
      // revealed with the verdict and never before it (trap 33). The curve and the meter
      // point stay: reading the curve is the skill this stage is named for.
      titrChart.data.datasets[1].data = this.tiChecked ? [{ x: this.ti.Veq, y: 0 }, { x: this.ti.Veq, y: 14 }] : [];
      titrChart.data.datasets[2].data = [{ x: this.tiVb, y: this.tiCurrentPH }];
      titrChart.update();
    },
    updateTitrPoint() {
      if (!titrChart) return;
      titrChart.data.datasets[2].data = [{ x: this.tiVb, y: this.tiCurrentPH }];
      titrChart.update();
    },
    resizeTitr() { if (titrChart) titrChart.resize(); },

    // ===================== C.12(E) pH from [H+] =====================
    genMeter() {
      const sc = this.nextScenario('e');
      const kind = pick(sc.constraints.kinds);
      // The mantissa pool no longer holds 4: reading 5 x 10^-p as 4 x 10^-p (or the
      // reverse) is only 0.0969 pH out and was accepted by the plus-or-minus-0.10 window.
      // With [1, 2, 3, 5, 8] the smallest adjacent gap is 0.1761. See METER_BANDS.
      const mant = sc.constraints.mantissas || METER_MANTISSAS;
      const m = pick(mant);
      const [plo, phi] = sc.constraints.p;
      const p = plo + ((Math.random() * (phi - plo + 1)) | 0);           // [ion] = m x 10^-p
      const conc = m * Math.pow(10, -p);
      const truePH = kind === 'H' ? pH(conc) : pHfromPOH(pOH(conc));
      const cls = Math.abs(truePH - 7) < 0.05 ? 'neutral' : truePH < 7 ? 'acid' : 'base';
      this.me = { sc, kind, m, p, conc, truePH, cls, bands: METER_BANDS };
      this.meGuess = 7; this.meClass = null;
      this.meChecked = false; this.meAttempted = false; this.meDone = false; this.meVerdict = null;
      this.releaseScreen('meter', false);
    },
    meConcTeX() {
      const ion = this.me.kind === 'H' ? '[\\text{H}^+]' : '[\\text{OH}^-]';
      const mant = this.me.m === 1 ? '1.0' : this.me.m.toFixed(1);
      return `${ion} = ${mant}\\times 10^{-${this.me.p}}\\ \\text{M}`;
    },
    get meClassOk() { return this.meClass === this.me.cls; },
    mePickClass(v) { if (!this.meDone) { this.meClass = v; this.meChecked = false; } },
    meClassState(v) {
      if (!this.meChecked) return this.meClass === v ? 'on' : '';
      if (v === this.me.cls) return 'correct';
      if (v === this.meClass) return 'wrong';
      return '';
    },
    phColor(p) { return phColor(p); },
    get meExplain() {
      const m = this.me;
      const clsWord = m.cls === 'acid' ? 'acidic' : m.cls === 'base' ? 'basic' : 'neutral';
      if (m.kind === 'H') {
        return `pH = -log[H+] = -log(${m.m} x 10^-${m.p}) = ${m.truePH.toFixed(2)}, which is ${clsWord}. ` +
          `Each whole step on the scale is a tenfold change in [H+].`;
      }
      return `This is a hydroxide reading, so it needs the water relationship. At 25 C, Kw = 1.0 x 10^-14, so pH + pOH = 14: ` +
        `pOH = -log[OH-] = ${pOH(m.conc).toFixed(2)}, and pH = 14 - pOH = ${m.truePH.toFixed(2)}, which is ${clsWord}.`;
    },
    meCheck() {
      if (this.meDone || !this.meClass) return;
      const sc = this.me.sc;
      const classOk = this.meClassOk;
      const clsNote = classOk ? '' : ` The classification is also wrong: at pH ${this.me.truePH.toFixed(2)} the sample is ${this.me.cls === 'acid' ? 'acidic' : this.me.cls === 'base' ? 'basic' : 'neutral'}.`;
      const r = this.doseVerdict(sc, this.meGuess, this.me.truePH, this.me.bands, 'pH', this.meExplain + clsNote, 2);
      let v = r.v, ok = r.good && classOk, dir = r.dir;
      if (r.good && !classOk) {
        v = { tone: 'fail', icon: '\u{1F6A8}', state: 'CLASSIFICATION INCORRECT', headline: 'pH correct; classification incorrect',
          detail: `${this.meExplain}${clsNote} ${sc.classWrong}`, gauge: 'on' };
        dir = 'class';
      }
      const d = sc.delta;
      this.gRecord('e', ok, !this.meAttempted);
      this.commitWorld(sc, ok, `${sc.system}, ${ok ? 'pH correct' : (dir === 'class' ? 'classification incorrect' : 'pH outside tolerance')}`,
        ok ? d.ok : (dir === 'high' ? d.high : d.low));
      this.meAttempted = true; this.meChecked = true; this.meVerdict = v;
      this.claimScreen('meter', sc, v, false);
      if (ok) this.meDone = true;
    },
    meNext() { this.genMeter(); },

    // ===================== Honors h2: weak-acid Ka -> pH =====================
    get h2Unlocked() { return this.gMastered('e'); },
    genWeak() {
      const sc = scOf('h2-weak');
      const acid = pick(WEAK_ACIDS);
      // The polyprotic pair does not draw 0.010 M: that is the one case where the
      // -log(Ka) misread clears the plus-or-minus-0.10 window by only 0.020 pH. See the
      // WEAK_ACIDS comment in model.js for the sweep.
      const concs = acid.poly ? WEAK_CONCS.filter(c => c > 0.010) : WEAK_CONCS;
      const C = pick(concs);
      this.wa = { sc, acid, C, truePH: phWeakAcid(acid.Ka, C), bands: WEAK_BANDS };
      this.waGuess = 7;
      this.waChecked = false; this.waAttempted = false; this.waDone = false; this.waVerdict = null;
      this.releaseScreen('meter', true);
    },
    waKaTeX() {
      const ka = this.wa.acid.Ka;
      const exp = Math.floor(Math.log10(ka));
      const mant = (ka / 10 ** exp).toFixed(1);
      return `K_a = ${mant}\\times 10^{${exp}}`;
    },
    get waExplain() {
      const w = this.wa;
      const h = Math.pow(10, -w.truePH);
      return `For the monoprotic weak-acid model, solving Ka = x²/(C - x) with C = ${w.C.toFixed(3)} M gives ` +
        `x = [H+] = ${h.toExponential(2)} M, so pH = ${w.truePH.toFixed(2)}. ` +
        `Neither -log(Ka) nor -log(C) alone gives the equilibrium pH.`;
    },
    waCheck() {
      if (this.waDone) return;
      const sc = this.wa.sc;
      const r = this.doseVerdict(sc, this.waGuess, this.wa.truePH, this.wa.bands, 'pH', this.waExplain, 2);
      const d = sc.delta;
      this.gRecord('h2', r.good, !this.waAttempted);
      this.commitWorld(sc, r.good, `${sc.system}, ${r.good ? 'pH correct' : 'pH outside tolerance'}`,
        r.good ? d.ok : (r.dir === 'high' ? d.high : d.low));
      this.waAttempted = true; this.waChecked = true; this.waVerdict = r.v;
      this.claimScreen('meter', sc, r.v, true);
      if (r.good) this.waDone = true;
    },
    waNext() { this.genWeak(); },

    // ===================== Capstone: identify + neutralize an unknown =====================
    // Mechanics unchanged: name it, class it, predict the salt, neutralize it. What is new
    // is the brief on the front and one verdict on the back. It reads nothing off the
    // world-state, so there is no staleness re-draw to do here (trap 34 is dormant).
    get capUnlocked() { return this.gOverall() === 1; },
    genCapstone() {
      const f = pick(['HCl', 'HBr', 'HNO3', 'HClO4']);
      const acid = ACID_NAMES.find(a => a.f === f);
      const neut = NEUT_ACIDS.find(a => a.f === f);
      const base = pick(NEUT_BASES);
      const g = gcd(base.charge, neut.charge);
      const catSub = neut.charge / g, anionSub = base.charge / g;
      const L = lcm(neut.protons, base.hydroxides);
      const coefAcid = L / neut.protons, coefBase = L / base.hydroxides;
      const molAcid = rN(0.2 + Math.random() * 0.6, 2);
      const neutralBase = rN(moleRatio({ c: coefAcid }, { c: coefBase }, molAcid), 4);
      this.cap = { sc: scOf('cap-last'), acid, neut, base, molAcid, V: 1.0, catSub, anionSub, coefAcid, coefBase, neutralBase, bands: NEUT_BANDS };
      this.capNaSel = { prefix: '', root: '', suffix: '' };
      this.capClass = null; this.capCat = 1; this.capAn = 1; this.capBaseInput = '';
      this.capChecked = false; this.capAttempted = false; this.capWin = false; this.capVerdict = null;
      this.releaseScreen('capstone', false);
      this.$nextTick(() => this.reapplySelects());
    },
    capPreview(sel) {
      if (!(sel.prefix && sel.root && sel.suffix)) return '...';
      return this.joinAcid(sel.prefix, sel.root, sel.suffix);
    },
    get capNameOk() {
      const s = this.capNaSel, a = this.cap.acid;
      return s.prefix === a.prefix && s.root === a.root && s.suffix === a.suffix;
    },
    capPickClass(v) { if (!this.capWin) { this.capClass = v; this.capChecked = false; } },
    capClassState(v) {
      if (!this.capChecked) return this.capClass === v ? 'on' : '';
      if (v === 'strong') return 'correct';
      if (v === this.capClass) return 'wrong';
      return '';
    },
    capCatStep(d) { if (!this.capWin) { this.capCat = clamp(this.capCat + d, 1, 6); this.capChecked = false; } },
    capAnStep(d) { if (!this.capWin) { this.capAn = clamp(this.capAn + d, 1, 6); this.capChecked = false; } },
    get capStudentSalt() { return buildSalt(this.cap.base.cation, this.capCat, this.cap.neut.anion, this.cap.neut.poly, this.capAn); },
    get capCorrectSalt() { return buildSalt(this.cap.base.cation, this.cap.catSub, this.cap.neut.anion, this.cap.neut.poly, this.cap.anionSub); },
    get capSaltOk() { return this.capCat === this.cap.catSub && this.capAn === this.cap.anionSub; },
    get capBaseVal() { return parseFloat(this.capBaseInput); },
    get capBaseOk() {
      if (!isFinite(this.capBaseVal)) return false;
      return outcomeBand(this.capBaseVal, this.cap.neutralBase, this.cap.bands).withinSpec;
    },
    get capReady() {
      const s = this.capNaSel;
      return !!(s.prefix && s.root && s.suffix) && !!this.capClass && this.capBaseInput !== '';
    },
    capCertify() {
      if (this.capWin || !this.capReady) return;
      const sc = this.cap.sc;
      const nameOk = this.capNameOk, classOk = this.capClass === 'strong';
      const saltOk = this.capSaltOk, baseOk = this.capBaseOk;
      const ok = nameOk && classOk && saltOk && baseOk;
      const step = !nameOk ? `Step 1 is out: ${this.cap.acid.f} is ${this.cap.acid.name}, not ${this.capPreview(this.capNaSel)}.`
        : (!classOk ? 'Step 1 holds. Step 2 is out: this one ionizes completely in water, so it is strong.'
          : (!saltOk ? `Steps 1 and 2 hold. Step 3 is out: criss-crossing the charges gives ${this.capCorrectSalt}, not ${this.capStudentSalt}.`
            : `Steps 1 to 3 hold. Step 4 is out: neutral takes ${this.cap.neutralBase.toFixed(3)} mol of ${this.cap.base.f}, and you called ${this.capBaseVal.toFixed(3)} mol.`));
      const detail = ok
        ? `${this.cap.acid.f} is ${this.cap.acid.name}, a strong acid; with ${this.cap.base.f} it gives ${this.capCorrectSalt} plus water, ` +
          `and ${this.cap.molAcid.toFixed(2)} mol of it takes ${this.cap.neutralBase.toFixed(3)} mol of base to reach pH 7.`
        : step;
      const v = this.decisionVerdict(sc, ok, 'REVIEW NEEDED',
        ok ? 'Capstone complete' : 'Review the capstone steps', detail, ok ? sc.right : sc.wrong);
      this.gRecord('cap', ok, !this.capAttempted);
      this.commitWorld(sc, ok, `${sc.system}, ${ok ? 'capstone complete' : 'capstone needs revision'}`, ok ? sc.delta.ok : sc.delta.wrong);
      this.capAttempted = true; this.capChecked = true; this.capVerdict = v;
      this.claimScreen('capstone', sc, v, false);
      if (ok) this.capWin = true;
    }
  };
}
