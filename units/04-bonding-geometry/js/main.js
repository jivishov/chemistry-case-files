// main.js - Unit 4 view-model (Bonding, Nomenclature & Geometry, C.7). Scenario layer.
//
// The units_new build: units/04-bonding-geometry rendered in the mission-cockpit shell.
// This unit was the Scenario-layer retrofit's own pilot, so the chemistry, the grading,
// the consequences and the world-state all arrived working and are copied as they were.
// What this file adds over the worksheet build is presentation plumbing only:
//   * unitId 'units_new/04-bonding-geometry', so progress never collides with the old save
//   * the cockpit readouts the mission screen and the status rail bind to (activeBrief,
//     activeVerdict, activeTone, activeArtId, activeStationName, activeStateLabel,
//     activeOutcomeText, activeReference, coreSkills, teksMasteredCount, scArt)
//   * screenOf, the per-bench claim on that one screen -- see the block comment on it.
//   * a resize call for the WebGL viewer, whose canvas measures zero if it is laid out
//     while its station's panel is still display:none.
// No band, verdict, consequence or scenario text is changed by the port.
//
// Wires model.js + the engine + the shared game framework. Every stage is a brief ->
// tool -> commit -> consequence (GAMIFICATION design rule 0): the two element selects,
// the naming quiz, the 3D VSEPR viewer and the melt/conductivity bench are the tools,
// and committing produces a verdict (per-option consequences throughout, since every
// C.7 stage is qualitative) that feeds a session-local world-state.
// Here the world-state IS the chemistry: the shelf under the sink, twelve container
// slots that a correct call turns into a labeled bottle and a wrong call leaves flagged.
// Outcomes are primary; XP/streak stay a quiet line; per-TEKS mastery meters persist.
import {
  ELEMENTS, COMPOUNDS, MOLECULES, GEOMETRIES, SUBSTANCE_TYPES,
  IMF_TYPES, IMF_EXAMPLES, BOND_PAIRS, SCENARIOS, SE
} from './model.js';
import { sceneArt } from './art.js';
import {
  ELECTRONEGATIVITY, bondType, percentIonicCharacter, parseFormula, fmt
} from '../../../shared/js/chem.js';
import { createGame } from '../../../shared/js/game.js';
import { createViewer } from './vsepr.js';

let viewer = null; // kept out of Alpine's reactive proxy

const shuffle = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
const pick = a => a[(Math.random() * a.length) | 0];
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
// "an ionic bond" but "a metallic bond": the four bond names split on the first letter.
const art = w => (/^[aeiou]/i.test(w) ? 'an ' : 'a ') + w;

// The four values bondType() can return, in the order the buttons read best.
const BOND_OPTIONS = [
  { key: 'ionic', label: 'Ionic', hint: 'a metal and a nonmetal transfer electrons' },
  { key: 'polar covalent', label: 'Polar covalent', hint: 'two nonmetals share, but unevenly' },
  { key: 'nonpolar covalent', label: 'Nonpolar covalent', hint: 'two nonmetals share almost evenly' },
  { key: 'metallic', label: 'Metallic', hint: 'two metals pool their electrons' }
];

// Honors h1: where a bond sits on the ionic-covalent continuum.
const PCT_OPTIONS = [
  { key: 'ionic', label: 'More than half ionic (over 50%)' },
  { key: 'polar', label: 'Polar, but still mostly covalent' },
  { key: 'nonpolar', label: 'Essentially nonpolar (almost no partial charge)' }
];

// Honors h2: the molecule as a whole, not the individual bonds.
const POLAR_OPTIONS = [
  { key: 'polar', label: 'Polar overall (the bond dipoles do not cancel)' },
  { key: 'nonpolar', label: 'Nonpolar overall (the shape cancels the bond dipoles)' }
];

const SHELF_SLOTS = 12;

// Fallback for the header's active-station line, used only before a bench has generated
// its first scenario. After that the scenario's own `system` is the better name, because
// it says which container is in your hand rather than which tab is open.
const STATION_NAME = {
  bond: 'Bond type', name: 'Naming', geometry: '3D geometry',
  forces: 'Forces & properties', capstone: 'The last bottle'
};

const skills = [
  { id: 'a',   code: 'C.7(A)',   label: 'Bond type',            target: 3 },
  { id: 'b',   code: 'C.7(B)',   label: 'Names and formulas',   target: 3 },
  { id: 'c',   code: 'C.7(C)',   label: 'VSEPR shapes',         target: 3 },
  { id: 'd',   code: 'C.7(D)',   label: 'Forces and properties', target: 3 },
  { id: 'h1',  code: 'Honors',   label: '% ionic character',    target: 2, honors: true },
  { id: 'h2',  code: 'Honors',   label: 'Molecular polarity',   target: 2, honors: true },
  { id: 'h3',  code: 'Honors',   label: 'Intermolecular forces', target: 2, honors: true },
  { id: 'cap', code: 'Capstone', label: 'The last bottle',      target: 1, honors: true }
];

export { SE };

export function createSim() {
  return {
    ...createGame({ unitId: 'units_new/04-bonding-geometry', skills }),
    ELEMENTS, COMPOUNDS, MOLECULES, GEOMETRIES, SUBSTANCE_TYPES, IMF_TYPES,
    BOND_OPTIONS, PCT_OPTIONS, POLAR_OPTIONS, SE, fmt,
    honors: false,
    mode: 'bond',
    // Standards tracking is a teacher-facing concern, so it collapses to one header badge
    // and expands on demand. Session-only: nothing about it is worth persisting.
    teksOpen: false,

    // Which scenario and which verdict own the mission screen, per bench.
    //
    // The screen shows ONE scenario and ONE verdict, and three of this unit's benches
    // carry two commits: a core call and an Honors call, each with its own scenario, its
    // own banner and its own consequence. Porting trap 3 says the verdict has to follow
    // recency or whichever commit loses a fixed precedence can never be read. The
    // SCENARIO has to follow it for the same reason -- with only the verdict tracked,
    // activeArtId always resolves to the core scenario and the h1/h2/h3 banners are
    // authored and never drawn.
    //
    // So a commit claims its bench's screen and a "Next ..." button releases it. The
    // release is asymmetric on purpose, see releaseScreen().
    screenOf: { bond: null, name: null, geometry: null, forces: null, capstone: null },

    // ---- world-state: the shelf under the sink (session-local) ----
    shelf: Array(SHELF_SLOTS).fill(null),
    day: 1,
    calls: 0,
    _ring: -1,
    worldLog: [],
    _wid: 0,
    scIdx: { a: -1, b: -1, c: -1, d: -1 },

    // ---- stage state ----
    bd: null, bondA: 'Na', bondB: 'Cl', bondPick: null,
    bondChecked: false, bondAttempted: false, bondDone: false, bondVerdict: null,

    nm: null, nameDir: 'f2n', nameQ: null, nameOptions: [], nameChosen: null,
    nameChecked: false, nameAttempted: false, nameDone: false, nameVerdict: null,

    gm: null, molKey: 'H2O', geoGuess: null, rotate: true,
    geoChecked: false, geoAttempted: false, geoDone: false, geoVerdict: null,

    fx: null, fxClue: null, fxChosen: null,
    fxChecked: false, fxAttempted: false, fxDone: false, fxVerdict: null,

    pi: null, piPick: null, piChecked: false, piAttempted: false, piDone: false, piVerdict: null,
    pol: null, polPick: null, polChecked: false, polAttempted: false, polDone: false, polVerdict: null,
    im: null, imfEx: null, imfChosen: null,
    imfChecked: false, imfAttempted: false, imfDone: false, imfVerdict: null,

    cap: null, capPick: null, capChecked: false, capAttempted: false, capWin: false, capVerdict: null,

    init() {
      this.gLoad();
      this.genBond();
      this.genName();
      this.genGeometry();   // also seeds the h2 polarity bench from the same molecule
      this.genForces();
      this.genPercent();
      this.genImf();
      // The viewer used to be mounted from a $watch on `mode`. setMode() does it now,
      // because the cockpit also needs a re-measure on every later visit to the station
      // and one place that does both is easier to keep honest than two.
      this.$watch('molKey', () => this.showMolecule());
      this.$watch('honors', () => { this.genName(); });
      // LAST statement, deliberately: a <select x-model> binds before its child x-for has
      // rendered its <option>s, so an initial value that isn't the first option fails to
      // stick. The generators above set those values from the scenario, so this re-apply
      // has to run after them.
      this.$nextTick(() => { ['bondA', 'bondB', 'molKey'].forEach(k => { const v = this[k]; this[k] = null; this[k] = v; }); });
    },

    setMode(m) {
      this.mode = m;
      if (m === 'capstone' && this.capUnlocked && !this.cap) this.genCapstone();
      // Trap 12, and this unit is the first port to hit it. A WebGL canvas laid out while
      // its panel is display:none measures 0x0 and stays there: the ResizeObserver in
      // vsepr.js does fire on the transition back to visible, but not before the first
      // paint of the newly shown panel, so a frame renders into a zero-sized drawing
      // buffer and OrbitControls picks up a NaN aspect. $nextTick puts both the first
      // mount and every later re-measure after the panel is genuinely in flow.
      if (m === 'geometry') this.$nextTick(() => { this.ensureViewer(); viewer?.resize(); });
    },

    resetProgress() {
      this.gReset();
      this.screenOf = { bond: null, name: null, geometry: null, forces: null, capstone: null };
      this.shelf = Array(SHELF_SLOTS).fill(null);
      this.day = 1; this.calls = 0; this._ring = -1; this.worldLog = []; this._wid = 0;
      this.scIdx = { a: -1, b: -1, c: -1, d: -1 };
      this.genBond(); this.genName(); this.genGeometry(); this.genForces();
      this.genPercent(); this.genImf();
      this.cap = null; this.capPick = null; this.capChecked = false;
      this.capAttempted = false; this.capWin = false; this.capVerdict = null;
    },

    // ---- scenario plumbing ----
    nextScenario(skill) {
      const list = SCENARIOS.filter(s => s.skill === skill);
      const i = (this.scIdx[skill] = (this.scIdx[skill] ?? -1) + 1) % list.length;
      return list[i];
    },
    scenarioById(id) { return SCENARIOS.find(s => s.id === id) || null; },

    // A commit takes the bench's mission screen: its scenario, its banner, its verdict.
    claimScreen(mode, sc, v, honors) { this.screenOf[mode] = { sc, v, honors: !!honors }; },
    // A regenerate gives it back -- asymmetrically, and the asymmetry is the whole point.
    //
    // A CORE regenerate always takes the screen. The shell hides the console's .brief
    // card, so the mission screen is the ONLY place a new container's goal is stated; if
    // an Honors outcome could hold the screen through "Next container", the learner would
    // be looking at a bench whose question is nowhere on the page.
    //
    // An HONORS regenerate is the polite one: it evicts an Honors claim but leaves a core
    // outcome standing, because each Honors block states its own task in the console
    // beside its controls and so does not need the screen to be legible.
    releaseScreen(mode, honors) {
      const s = this.screenOf[mode];
      if (!honors || !s || s.honors) this.screenOf[mode] = null;
    },

    // Advance the move-in week, put the container on the shelf, and prepend a log line.
    // Same four-field signature as the reference implementation; `delta` is what this call
    // does to the world-state, which here is a bottle rather than a number: pass
    // { label, name, line } to occupy a slot, or nothing at all to leave the shelf alone.
    recordWorld({ icon, tone, text, delta }) {
      this.calls++;
      this.day = 1 + Math.floor(this.calls / 3);
      if (delta) this.shelfPlace(tone === 'success' ? 'ok' : 'bad', icon, delta);
      this.worldLog.unshift({ id: ++this._wid, icon, tone, text: `Day ${this.day}: ${text}` });
      if (this.worldLog.length > 6) this.worldLog.pop();
    },
    // Fill the first empty slot. Once all twelve are used the shelf keeps working by
    // cycling from the front, so a long session still shows what the last calls did.
    shelfPlace(state, icon, bottle) {
      const free = this.shelf.findIndex(s => !s);
      const i = free >= 0 ? free : (this._ring = (this._ring + 1) % SHELF_SLOTS);
      this.shelf[i] = { ...bottle, state, icon, slot: i + 1 };
    },
    // The shelf as a readable inventory: every bottle keeps its icon, its name, the label
    // written on it and the one property line that call established. The SVG above is the
    // at-a-glance view; this is the part a screen reader and a full shelf can both use.
    get shelfBottles() { return this.shelf.filter(Boolean); },
    get shelfLabeled() { return this.shelf.filter(s => s && s.state === 'ok').length; },
    get shelfFlagged() { return this.shelf.filter(s => s && s.state === 'bad').length; },
    get shelfPct() { return this.shelfLabeled / SHELF_SLOTS * 100; },
    get shelfMood() { return this.shelfFlagged === 0 ? '\u{1F642}' : this.shelfFlagged <= 2 ? '\u{1F630}' : '\u{1F635}'; },
    get shelfState() {
      const n = this.shelfFlagged;
      if (n === 0) return 'Nothing broken yet';
      if (n <= 2) return n === 1 ? 'One thing went wrong' : 'Two things went wrong';
      return 'This place is a hazard';
    },
    get shelfColor() { return this.shelfFlagged === 0 ? 'var(--success)' : this.shelfFlagged <= 2 ? 'var(--warn)' : 'var(--danger)'; },
    // The four counts the status rail's meters read. Three of them are shares of the same
    // twelve slots and the fourth is not: "calls right" is the share of the calls you have
    // actually MADE that were right, which is the one number that can fall while the others
    // rise. Every bar is drawn so that a full bar means good, which is why the flagged row
    // shows its complement.
    //
    // "3/12" rather than "3 of 12" for the same reason the labels are one word each: at
    // 1024x600 the rail's meter cells are 115px, and whether label plus value fits on one
    // line is the difference between a 54px row and a 73px one. Four of those pushed the
    // move-in log clean off the viewport (porting trap 9).
    get shelfReadings() {
      const placed = this.shelfBottles.length;
      const right = placed ? Math.round(this.shelfLabeled / placed * 100) : 100;
      return [
        { key: 'labeled', label: 'Labeled', raw: `${this.shelfLabeled}/12`, pct: this.shelfLabeled / SHELF_SLOTS * 100,
          hint: 'containers that got a label anyone can read' },
        { key: 'flagged', label: 'Flagged', raw: `${this.shelfFlagged}/12`, pct: (SHELF_SLOTS - this.shelfFlagged) / SHELF_SLOTS * 100,
          hint: 'containers a wrong call left flagged, and they stay flagged' },
        { key: 'cleared', label: 'Cleared', raw: `${placed}/12`, pct: placed / SHELF_SLOTS * 100,
          hint: 'containers you have been through at all, right or wrong' },
        // One word, deliberately. "Calls right" wrapped to two lines in this ~105px cell at
        // 1024x600 and pushed the move-in log clean off the viewport, which is porting
        // trap 9 exactly. The meaning lives in the row's title instead.
        { key: 'right', label: 'Right', raw: `${right}%`, pct: right,
          hint: 'of the calls you have made, the share that were right' }
      ];
    },
    stockColor(v) { return v >= 67 ? 'var(--success)' : v >= 34 ? 'var(--warn)' : 'var(--danger)'; },

    // The shelf figure for the cockpit's status rail. Alpine's <template x-for> does not
    // bind loop scope inside an <svg>, so it is built as a string and injected with x-html
    // on a <g> (the house pattern, RETROFIT-U1-U4.md section 8 trap 2).
    //
    // Redrawn for the port, and the reason is width. The worksheet build drew this at
    // 520x168 with a mono label and an emoji in every slot, across a full-width page. The
    // rail column is about 230 CSS px, which would have scaled an 11px label down to five
    // pixels -- illegible, and a figure whose entire content is unreadable text is worse
    // than one with none. So the slots now carry SHAPE and STATE only: a bottle
    // silhouette, tinted, with a strike through the flagged ones. Every slot keeps a
    // <title> with the name, the label and the property line, so the detail the old
    // caption printed is still reachable; the four meters above carry the counts.
    shelfSvg() {
      return this.shelf.map((slot, i) => {
        const x = 4 + (i % 6) * 40, y = 4 + ((i / 6) | 0) * 56;
        if (!slot) {
          return `<rect x="${x}" y="${y + 8}" width="32" height="36" rx="4" fill="#eef3f4"`
            + ` stroke="#cfdbe0" stroke-width="1.2" stroke-dasharray="3 3"/>`;
        }
        const ok = slot.state === 'ok';
        const fill = ok ? '#eaf5ee' : '#fbeeea', line = ok ? '#4f9a70' : '#c4674a';
        return `<g><title>${esc(slot.name)} (${esc(slot.label)}): ${esc(slot.line)}</title>`
          + `<rect x="${x + 9}" y="${y}" width="14" height="5" rx="2" fill="${line}"/>`
          + `<rect x="${x + 11}" y="${y + 4}" width="10" height="9" rx="2" fill="${fill}" stroke="${line}" stroke-width="1.2"/>`
          + `<rect x="${x}" y="${y + 12}" width="32" height="32" rx="4" fill="${fill}" stroke="${line}" stroke-width="1.5"/>`
          + `<rect x="${x + 4}" y="${y + 22}" width="24" height="9" rx="1.5" fill="#ffffff" opacity=".85"/>`
          + `<path d="M${x + 4} ${y + 26} H${x + 24}" stroke="${line}" stroke-width="1" opacity=".5"/>`
          + (ok ? '' : `<g stroke="#bf4a30" stroke-width="2" stroke-linecap="round">`
            + `<path d="M${x + 5} ${y + 17} l22 22"/><path d="M${x + 27} ${y + 17} l-22 22"/></g>`)
          + `</g>`;
      }).join('');
    },

    // ===================== cockpit readouts =====================
    // Everything the mission screen and the status rail bind to. Nothing here decides
    // anything: it reads the bench state the commit handlers above already produced.
    scArt(id) { return sceneArt(id); },

    // The bench's own scenario, before any commit has claimed the screen.
    get coreBrief() {
      if (this.mode === 'bond') return (this.bd && this.bd.sc) || null;
      if (this.mode === 'name') return (this.nm && this.nm.sc) || null;
      if (this.mode === 'geometry') return (this.gm && this.gm.sc) || null;
      if (this.mode === 'forces') return (this.fx && this.fx.sc) || null;
      // The capstone brief exists before the bottle is drawn, so the locked station still
      // says what it is going to ask for rather than showing an empty screen.
      if (this.mode === 'capstone') return (this.cap && this.cap.sc) || this.scenarioById('cap-underthesink');
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
      return b && b.id ? b.id : 'a-white-jar';
    },
    get activeStationName() {
      const b = this.activeBrief;
      if (b && b.system) return b.system;
      return STATION_NAME[this.mode] || 'Move-in week';
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
      return 'Pick a bench. Nothing gets used, mixed or poured away until you know what holds it together.';
    },

    // The facts a learner should never have to leave the bench to look up: a rule, a
    // threshold, or the two symbols on the container in front of them. Three lines at
    // most, because this card shares a column with the scenario narrative and every extra
    // line here is a line taken off the text somebody actually reads.
    //
    // Every C.7 call is qualitative, so these are rules rather than constants -- and they
    // are deliberately the rules the bench does NOT already print beside its own buttons.
    // The three benches that carry an Honors commit swap in that call's rules while its
    // outcome holds the screen, because at that point the core rule has been used and the
    // continuum, the cancellation argument and the force ranking are what is in play.
    get activeReference() {
      const out = [];
      if (this.mode === 'bond') {
        if (this.screenIsHonors && this.pi) {
          out.push({ k: 'On the label', v: this.pi.pair.a + ' and ' + this.pi.pair.b + ', ΔEN ' + fmt(this.pi.dEN, 2) });
          out.push({ k: 'Pauling estimate', v: '% ionic = (1 − e^(−0.25·ΔEN²)) × 100' });
          out.push({ k: 'Half ionic', v: 'at ΔEN 1.67, just under the 1.7 teaching line' });
        } else {
          out.push({ k: 'On the label', v: this.bondA + ' (EN ' + fmt(this.en(this.bondA), 3) + ') and ' + this.bondB + ' (EN ' + fmt(this.en(this.bondB), 3) + ')' });
          out.push({ k: 'ΔEN guide', v: 'under 0.4 nonpolar · 0.4 to 1.7 polar · over 1.7 ionic' });
          out.push({ k: 'Two metals', v: 'metallic, whatever the gap is' });
        }
      } else if (this.mode === 'name') {
        out.push({ k: 'Metal + nonmetal', v: 'no prefixes; the nonmetal takes -ide' });
        out.push({ k: 'Two nonmetals', v: 'mono, di, tri and tetra, on both parts' });
        out.push({ k: 'Ionic subscripts', v: 'fixed by the charges, never spoken in the name' });
      } else if (this.mode === 'geometry') {
        if (this.screenIsHonors && this.pol) {
          out.push({ k: 'On the bench', v: this.pol.mol.formula + ', ' + this.pol.mol.geometry });
          out.push({ k: 'Polar bonds', v: 'do not make a polar molecule on their own' });
          out.push({ k: 'A symmetric shape', v: 'points the bond dipoles against each other, so they cancel' });
        } else {
          out.push({ k: 'Domains', v: 'bonding pairs + lone pairs on the central atom' });
          out.push({ k: 'No lone pairs', v: '2 linear 180° · 3 planar 120° · 4 tetrahedral 109.5°' });
          out.push({ k: 'Each lone pair', v: 'pushes harder than a bond, so the angle closes' });
        }
      } else if (this.mode === 'forces') {
        if (this.screenIsHonors && this.imfEx) {
          out.push({ k: 'Ranking', v: 'London, then dipole-dipole, then hydrogen bonding' });
          out.push({ k: 'Hydrogen bonding', v: 'only with H bonded straight to N, O or F' });
          out.push({ k: 'Dipole-dipole', v: 'needs a permanent dipole, so a polar molecule' });
        } else {
          out.push({ k: 'Conducts dry', v: 'metallic — free electrons, no water needed' });
          out.push({ k: 'Conducts dissolved', v: 'ionic — the lattice has to come apart first' });
          out.push({ k: 'Never conducts', v: 'covalent — melts low if molecular, not at all if network' });
        }
      } else if (this.mode === 'capstone') {
        out.push({ k: 'Keep it', v: 'useful and safe, so it earns a label and a shelf' });
        out.push({ k: 'Down the drain', v: 'soluble, non-toxic, and nothing in the pipe reacts' });
        out.push({ k: 'Hazardous waste', v: 'reactive with water, or toxic' });
      }
      return out.slice(0, 3);
    },

    get coreSkills() { return SE.filter(se => !se.honors); },
    get teksMasteredCount() { return this.coreSkills.filter(se => this.gMastered(se.id)).length; },

    seCaption(se) {
      if (this.gMastered(se.id)) return 'Mastered';
      const sk = this.g_skills[se.id];
      const def = this.g_skillDefs.find(d => d.id === se.id) || {};
      return `${sk ? sk.run : 0} of ${def.target || 3} correct in a row`;
    },

    // ===================== C.7(A) two element symbols, one bond =====================
    // Decision task. The scenario pins both selects, and the predicted-bond readout stays
    // hidden until the call is committed, so the panel poses the question instead of
    // answering it. The options are exactly bondType()'s four return values.
    en(sym) { return ELECTRONEGATIVITY[sym]; },
    colorHex(el) {
      const m = { H: '#e8e8e8', C: '#404040', N: '#3050f8', O: '#ff3020', F: '#7fe04f', Cl: '#35c635', Be: '#b6f000', B: '#ffb5b5', S: '#ffce1a', P: '#ff8000' };
      return m[el] || '#888888';
    },
    get bondResult() {
      const dEN = Math.abs(this.en(this.bondA) - this.en(this.bondB));
      return { dEN, type: bondType(this.bondA, this.bondB), pct: percentIonicCharacter(dEN) };
    },
    get bondNote() {
      const t = this.bondResult.type;
      if (t === 'metallic') return 'Two metals share a sea of delocalized electrons.';
      if (t === 'ionic') return 'A metal and a nonmetal: electrons transfer, forming ions.';
      if (t === 'polar covalent') return 'Two nonmetals share electrons unequally.';
      return 'Two nonmetals share electrons nearly equally.';
    },
    genBond() {
      const sc = this.nextScenario('a');
      this.bondA = sc.constraints.a;
      this.bondB = sc.constraints.b;
      this.bd = { sc, answer: bondType(sc.constraints.a, sc.constraints.b) };
      this.bondPick = null;
      this.bondChecked = false; this.bondAttempted = false; this.bondDone = false; this.bondVerdict = null;
      this.releaseScreen('bond', false);
    },
    pickBond(k) { if (!this.bondDone) this.bondPick = k; },
    bondState(k) {
      if (!this.bondChecked) return this.bondPick === k ? 'on' : '';
      if (!this.bd) return '';
      if (k === this.bd.answer) return 'correct';
      return k === this.bondPick ? 'wrong' : '';
    },
    bondCommit() {
      if (this.bondDone || !this.bondPick) return;
      const sc = this.bd.sc;
      const good = this.bondPick === this.bd.answer;
      const label = `${this.bondA} + ${this.bondB}`;
      let v, delta, feed;
      if (good) {
        v = { tone: 'success', icon: sc.icon, state: 'LABELED', headline: `${this.bd.answer} bond`,
          detail: sc.consequences[this.bondPick], gauge: null };
        this.bondDone = true;
        delta = { label, name: sc.system, line: `${this.bd.answer} bond` };
        feed = `${sc.system}, called ${this.bd.answer}. Labeled and on the shelf.`;
      } else {
        v = { tone: 'fail', icon: '\u{1F6A8}', state: 'WRONG CALL', headline: `It is ${this.bd.answer}`,
          detail: `${sc.consequences[this.bondPick]} ${this.bondA} and ${this.bondB} make ${art(this.bd.answer)} bond.`, gauge: null };
        delta = { label, name: sc.system, line: `called ${this.bondPick}, it is ${this.bd.answer}` };
        feed = `${sc.system}, called ${this.bondPick}. It is ${this.bd.answer}.`;
      }
      this.gRecord('a', good, !this.bondAttempted);
      this.recordWorld({ icon: v.icon, tone: v.tone, text: feed, delta });
      this.bondAttempted = true; this.bondChecked = true; this.bondVerdict = v;
      this.claimScreen('bond', sc, v, false);
    },
    bondNext() { this.genBond(); },

    // ===================== C.7(B) the label somebody else will trust =====================
    // Identity task over the existing nomenclature quiz. Two of the three scenarios pin
    // the compound (the alarm, the de-icer sack); the pantry one leaves it generated, so
    // the stage cannot be cleared by memorising three answers.
    get namePool() { return COMPOUNDS.filter(c => this.honors || !c.honors); },
    genName() {
      const sc = this.nextScenario('b');
      const pool = this.namePool;
      const pinned = sc.constraints && sc.constraints.formula
        ? COMPOUNDS.find(c => c.formula === sc.constraints.formula)
        : null;
      const correct = pinned || pick(pool);
      const named = (sc.constraints && sc.constraints.distractors) || [];
      const wanted = named.map(f => COMPOUNDS.find(c => c.formula === f)).filter(c => c && c !== correct);
      const rest = shuffle(pool.filter(c => c !== correct && !wanted.includes(c)));
      const others = [...wanted, ...rest].slice(0, 3);
      this.nm = { sc, q: correct };
      this.nameQ = correct;
      this.nameOptions = shuffle([correct, ...others]).map(o => ({ formula: o.formula, name: o.name, correct: o === correct }));
      this.nameChosen = null;
      this.nameChecked = false; this.nameAttempted = false; this.nameDone = false; this.nameVerdict = null;
      this.releaseScreen('name', false);
    },
    pickName(o) { if (!this.nameDone) this.nameChosen = o; },
    nameState(o) {
      if (!this.nameChecked) return this.nameChosen === o ? 'on' : '';
      if (o.correct) return 'correct';
      if (this.nameChosen === o) return 'wrong';
      return '';
    },
    nameCommit() {
      if (this.nameDone || !this.nameChosen) return;
      const sc = this.nm.sc;
      const q = this.nm.q;
      const good = !!this.nameChosen.correct;
      const truth = `${q.formula} is ${q.name} (${q.cat.toLowerCase()}), and it lives in ${q.where}.`;
      let v, delta, feed;
      if (good) {
        v = { tone: 'success', icon: sc.icon, state: 'LABEL WRITTEN', headline: q.name,
          detail: `${truth} ${sc.success}`, gauge: null };
        this.nameDone = true;
        delta = { label: q.formula, name: q.name, line: `${q.cat.toLowerCase()}, on the shelf` };
        feed = `${sc.system}, ${q.name} labeled correctly.`;
      } else {
        v = { tone: 'fail', icon: '\u{1F6A8}', state: 'WRONG LABEL', headline: 'That label is wrong',
          detail: `${sc.fail} ${truth}`, gauge: null };
        delta = { label: q.formula, name: q.name, line: `mislabeled as ${this.nameChosen.name}` };
        feed = `${sc.system}, ${q.formula} mislabeled.`;
      }
      this.gRecord('b', good, !this.nameAttempted);
      this.recordWorld({ icon: v.icon, tone: v.tone, text: feed, delta });
      this.nameAttempted = true; this.nameChecked = true; this.nameVerdict = v;
      this.claimScreen('name', sc, v, false);
    },
    nameNext() { this.genName(); },

    // ===================== C.7(C) rotate it, then classify the shape =====================
    // Identity task. The scenario sets molKey and the existing $watch drives the viewer.
    // The reset that used to live in showMolecule() moved here, because that reset sat
    // inside the "viewer is mounted" guard and so never fired before the tab was opened.
    get currentMol() { return MOLECULES.find(m => m.key === this.molKey); },
    ensureViewer() {
      if (!viewer) { viewer = createViewer(); viewer.mount(this.$refs.stage); }
      viewer.setAutoRotate(this.rotate);
      this.showMolecule();
    },
    showMolecule() { if (viewer && viewer.isMounted()) viewer.setMolecule(this.currentMol); },
    toggleRotate() { this.rotate = !this.rotate; viewer?.setAutoRotate(this.rotate); },
    genGeometry() {
      const sc = this.nextScenario('c');
      const mol = MOLECULES.find(m => m.key === sc.constraints.molKey);
      this.gm = { sc, mol, answer: mol.geometry };
      this.molKey = sc.constraints.molKey;
      this.geoGuess = null;
      this.geoChecked = false; this.geoAttempted = false; this.geoDone = false; this.geoVerdict = null;
      this.releaseScreen('geometry', false);
      this.genPolarity();
    },
    pickGeo(g) { if (!this.geoDone) this.geoGuess = g; },
    // Graded against the shape the scenario put on the bench, not against whatever the
    // select holds now: after the call is committed the select unlocks for free
    // exploration, and the buttons must keep telling the truth about the call that was made.
    geoState(g) {
      if (!this.geoChecked) return this.geoGuess === g ? 'on' : '';
      if (!this.gm) return '';
      if (g === this.gm.answer) return 'correct';
      if (g === this.geoGuess) return 'wrong';
      return '';
    },
    geoCommit() {
      if (this.geoDone || !this.geoGuess) return;
      const sc = this.gm.sc, mol = this.gm.mol;
      const good = this.geoGuess === this.gm.answer;
      const truth = `${mol.name} has ${mol.bonds} bonding ${mol.bonds === 1 ? 'pair' : 'pairs'} and ${mol.lone} lone ${mol.lone === 1 ? 'pair' : 'pairs'} on the ${mol.central}, so it is ${mol.geometry} at ${mol.angle}.`;
      let v, delta, feed;
      if (good) {
        v = { tone: 'success', icon: sc.icon, state: 'SHAPE READ', headline: mol.geometry,
          detail: `${truth} ${sc.success}`, gauge: null };
        this.geoDone = true;
        delta = { label: mol.formula, name: mol.name, line: `${mol.geometry}, ${mol.angle}` };
        feed = `${sc.system}, ${mol.formula} read as ${mol.geometry}.`;
      } else {
        v = { tone: 'fail', icon: '\u{1F6A8}', state: 'WRONG SHAPE', headline: `It is ${mol.geometry}`,
          detail: `You called it ${this.geoGuess}. ${truth} ${sc.fail}`, gauge: null };
        delta = { label: mol.formula, name: mol.name, line: `called ${this.geoGuess}, it is ${mol.geometry}` };
        feed = `${sc.system}, ${mol.formula} called ${this.geoGuess}.`;
      }
      this.gRecord('c', good, !this.geoAttempted);
      this.recordWorld({ icon: v.icon, tone: v.tone, text: feed, delta });
      this.geoAttempted = true; this.geoChecked = true; this.geoVerdict = v;
      this.claimScreen('geometry', sc, v, false);
    },
    geoNext() { this.genGeometry(); },

    // ===================== C.7(D) a dry pan, a meter, a drop onto the tiles =====================
    // Decision task. The scenario supplies the two observations; the comparison table above
    // stays as the reference the learner reads them against.
    genForces() {
      const sc = this.nextScenario('d');
      const k = sc.constraints;
      const truth = SUBSTANCE_TYPES.find(s => s.type === k.answer);
      this.fx = { sc, truth };
      this.fxClue = { answer: k.answer, melt: k.melt, conduct: k.conduct };
      this.fxChosen = null;
      this.fxChecked = false; this.fxAttempted = false; this.fxDone = false; this.fxVerdict = null;
      this.releaseScreen('forces', false);
    },
    pickFx(t) { if (!this.fxDone) this.fxChosen = t; },
    fxState(t) {
      if (!this.fxChecked) return this.fxChosen === t ? 'on' : '';
      if (t === this.fxClue.answer) return 'correct';
      if (t === this.fxChosen) return 'wrong';
      return '';
    },
    fxCommit() {
      if (this.fxDone || !this.fxChosen) return;
      const sc = this.fx.sc, truth = this.fx.truth;
      const good = this.fxChosen === this.fxClue.answer;
      let v, delta, feed;
      if (good) {
        v = { tone: 'success', icon: sc.icon, state: 'CLASSIFIED', headline: truth.type,
          detail: `${sc.consequences[this.fxChosen]} ${truth.note}`, gauge: null };
        this.fxDone = true;
        delta = { label: sc.tag, name: sc.system, line: `${truth.type.toLowerCase()}, held by ${truth.intra}` };
        feed = `${sc.system}, classified ${truth.type.toLowerCase()}.`;
      } else {
        v = { tone: 'fail', icon: '\u{1F6A8}', state: 'MISCLASSIFIED', headline: `It is ${truth.type.toLowerCase()}`,
          detail: `${sc.consequences[this.fxChosen]} ${truth.note}`, gauge: null };
        delta = { label: sc.tag, name: sc.system, line: `called ${this.fxChosen.toLowerCase()}, it is ${truth.type.toLowerCase()}` };
        feed = `${sc.system}, called ${this.fxChosen.toLowerCase()}. It is ${truth.type.toLowerCase()}.`;
      }
      this.gRecord('d', good, !this.fxAttempted);
      this.recordWorld({ icon: v.icon, tone: v.tone, text: feed, delta });
      this.fxAttempted = true; this.fxChecked = true; this.fxVerdict = v;
      this.claimScreen('forces', sc, v, false);
    },
    fxNext() { this.genForces(); },

    // ===================== Honors h1: percent ionic character =====================
    // Honors and capstone stages have exactly one scenario each, so they look it up by id
    // rather than cycling through nextScenario().
    genPercent() {
      const sc = SCENARIOS.find(s => s.id === 'h1-percent-ionic');
      // Never the same bottle twice running: a run of two has to be two real reads.
      // Compare by symbol pair, not by object identity, the way nextMol() compares by key:
      // anything reached through `this` is an Alpine proxy and never === the raw entry.
      const last = this.pi ? this.pi.pair.a + this.pi.pair.b : '';
      const pair = pick(BOND_PAIRS.filter(p => p.a + p.b !== last));
      const dEN = Math.abs(ELECTRONEGATIVITY[pair.a] - ELECTRONEGATIVITY[pair.b]);
      const pct = percentIonicCharacter(dEN);
      const answer = pct >= 50 ? 'ionic' : (dEN >= 0.4 ? 'polar' : 'nonpolar');
      this.pi = { sc, pair, dEN, pct, answer };
      this.piPick = null;
      this.piChecked = false; this.piAttempted = false; this.piDone = false; this.piVerdict = null;
      this.releaseScreen('bond', true);
    },
    piPickBand(k) { if (!this.piDone) this.piPick = k; },
    piState(k) {
      if (!this.piChecked) return this.piPick === k ? 'on' : '';
      if (!this.pi) return '';
      if (k === this.pi.answer) return 'correct';
      return k === this.piPick ? 'wrong' : '';
    },
    piCommit() {
      if (this.piDone || !this.piPick) return;
      const sc = this.pi.sc;
      const good = this.piPick === this.pi.answer;
      const truth = `${this.pi.pair.a} and ${this.pi.pair.b} sit ${fmt(this.pi.dEN, 2)} apart on the electronegativity scale, which the Pauling estimate puts at ${fmt(this.pi.pct, 3)}% ionic character.`;
      let v;
      if (good) {
        v = { tone: 'success', icon: sc.icon, state: 'PLACED', headline: `${fmt(this.pi.pct, 3)}% ionic`,
          detail: `${truth} ${sc.consequences[this.piPick]} ${sc.success}`, gauge: null };
        this.piDone = true;
      } else {
        v = { tone: 'fail', icon: '\u{1F6A8}', state: 'MISPLACED', headline: `${fmt(this.pi.pct, 3)}% ionic`,
          detail: `${sc.consequences[this.piPick]} ${truth} ${sc.fail}`, gauge: null };
      }
      this.gRecord('h1', good, !this.piAttempted);
      this.recordWorld({ icon: v.icon, tone: v.tone,
        text: `${this.pi.pair.where}, ${good ? 'placed on the continuum' : 'placed wrong'}.`, delta: null });
      this.piAttempted = true; this.piChecked = true; this.piVerdict = v;
      this.claimScreen('bond', sc, v, true);
    },
    piNext() { this.genPercent(); },

    // ===================== Honors h2: is the whole molecule polar =====================
    genPolarity() {
      const sc = SCENARIOS.find(s => s.id === 'h2-polarity');
      const mol = MOLECULES.find(m => m.key === (this.gm ? this.gm.sc.constraints.molKey : this.molKey));
      this.pol = { sc, mol, answer: mol.polar ? 'polar' : 'nonpolar' };
      this.polPick = null;
      this.polChecked = false; this.polAttempted = false; this.polDone = false; this.polVerdict = null;
      this.releaseScreen('geometry', true);
    },
    polPickCall(k) { if (!this.polDone) this.polPick = k; },
    polState(k) {
      if (!this.polChecked) return this.polPick === k ? 'on' : '';
      if (!this.pol) return '';
      if (k === this.pol.answer) return 'correct';
      return k === this.polPick ? 'wrong' : '';
    },
    polCommit() {
      if (this.polDone || !this.polPick) return;
      const sc = this.pol.sc, mol = this.pol.mol;
      const good = this.polPick === this.pol.answer;
      const truth = mol.polar
        ? `${mol.name} is ${mol.geometry}, and that shape is not symmetric enough to cancel the bond dipoles, so the molecule is polar overall.`
        : `${mol.name} is ${mol.geometry}, and that symmetry points the bond dipoles against each other so they cancel, leaving the molecule nonpolar overall.`;
      let v;
      if (good) {
        v = { tone: 'success', icon: sc.icon, state: 'CALLED IT', headline: mol.polar ? 'Polar overall' : 'Nonpolar overall',
          detail: `${truth} ${sc.consequences[this.polPick]} ${sc.success}`, gauge: null };
        this.polDone = true;
      } else {
        v = { tone: 'fail', icon: '\u{1F6A8}', state: 'WRONG CALL', headline: mol.polar ? 'It is polar overall' : 'It is nonpolar overall',
          detail: `${sc.consequences[this.polPick]} ${truth} ${sc.fail}`, gauge: null };
      }
      this.gRecord('h2', good, !this.polAttempted);
      this.recordWorld({ icon: v.icon, tone: v.tone,
        text: `${mol.formula} polarity, ${good ? 'called right' : 'called wrong'}.`, delta: null });
      this.polAttempted = true; this.polChecked = true; this.polVerdict = v;
      this.claimScreen('geometry', sc, v, true);
    },

    // ===================== Honors h3: the force between the molecules =====================
    genImf() {
      const sc = SCENARIOS.find(s => s.id === 'h3-imf');
      this.im = { sc };
      const lastF = this.imfEx ? this.imfEx.formula : '';
      this.imfEx = pick(IMF_EXAMPLES.filter(e => e.formula !== lastF));
      this.imfChosen = null;
      this.imfChecked = false; this.imfAttempted = false; this.imfDone = false; this.imfVerdict = null;
      this.releaseScreen('forces', true);
    },
    pickImf(t) { if (!this.imfDone) this.imfChosen = t; },
    imfState(t) {
      if (!this.imfChecked) return this.imfChosen === t ? 'on' : '';
      if (t === this.imfEx.imf) return 'correct';
      if (t === this.imfChosen) return 'wrong';
      return '';
    },
    imfCommit() {
      if (this.imfDone || !this.imfChosen) return;
      const sc = this.im.sc, ex = this.imfEx;
      const good = this.imfChosen === ex.imf;
      const truth = `${ex.formula} is ${ex.why}, so the dominant force is ${ex.imf.toLowerCase()}.`;
      let v;
      if (good) {
        v = { tone: 'success', icon: sc.icon, state: 'RANKED', headline: ex.imf,
          detail: `${truth} ${sc.consequences[this.imfChosen]} ${sc.success}`, gauge: null };
        this.imfDone = true;
      } else {
        v = { tone: 'fail', icon: '\u{1F6A8}', state: 'WRONG FORCE', headline: `It is ${ex.imf.toLowerCase()}`,
          detail: `${sc.consequences[this.imfChosen]} ${truth} ${sc.fail}`, gauge: null };
      }
      this.gRecord('h3', good, !this.imfAttempted);
      this.recordWorld({ icon: v.icon, tone: v.tone,
        text: `${ex.where}, force ${good ? 'ranked right' : 'ranked wrong'}.`, delta: null });
      this.imfAttempted = true; this.imfChecked = true; this.imfVerdict = v;
      this.claimScreen('forces', sc, v, true);
    },
    imfNext() { this.genImf(); },

    // ===================== Capstone: the last bottle under the sink =====================
    get capUnlocked() { return this.gOverall() === 1; },
    genCapstone() {
      const sc = SCENARIOS.find(s => s.id === 'cap-underthesink');
      // Everything the learner is shown is derived from the drawn compound, so the one
      // defensible action is a function of the chemistry rather than of authored copy.
      const c = pick(COMPOUNDS.filter(x => x.sink));
      const syms = Object.keys(parseFormula(c.formula));
      const bond = bondType(syms[0], syms[1]);
      const klass = bond === 'ionic' ? 'Ionic' : 'Covalent molecular';
      const props = SUBSTANCE_TYPES.find(s => s.type === klass);
      const mol = MOLECULES.find(m => m.formula === c.formula);
      this.cap = {
        sc, c, syms, bond, klass, mol,
        shape: mol ? `${mol.geometry} at ${mol.angle}` : 'a lattice, so there is no discrete molecule to shape',
        mp: props.mp, heat: props.heat, conduct: props.conduct,
        correct: c.disposal
      };
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
      if (this.capWin || !this.capPick) return;
      const sc = this.cap.sc;
      const opt = sc.options.find(o => o.key === this.capPick);
      const c = this.cap.c;
      const fig = `${this.cap.syms[0]} and ${this.cap.syms[1]} make ${art(this.cap.bond)} bond, so ${c.formula} is ${c.name}, ${this.cap.klass.toLowerCase()}. Shape: ${this.cap.shape}. That is what was sitting in ${c.where}.`;
      const good = this.capPick === this.cap.correct;
      let v;
      if (good) {
        v = { tone: 'success', icon: sc.icon, state: 'RIGHT CALL', headline: 'Right call',
          detail: `${fig} ${opt.good}`, gauge: null };
        this.capWin = true;
      } else {
        const right = sc.options.find(o => o.key === this.cap.correct);
        v = { tone: 'fail', icon: '\u{1F6A8}', state: 'WRONG CALL', headline: 'Wrong call',
          detail: `${fig} ${opt.consequence} The call it needed: ${right.good}`, gauge: null };
      }
      this.gRecord('cap', good, !this.capAttempted);
      this.recordWorld({ icon: v.icon, tone: v.tone,
        text: `${c.formula} under the sink, ${good ? 'right call' : 'wrong call'}.`,
        delta: { label: c.formula, name: c.name,
          line: good ? `${this.cap.klass.toLowerCase()}, ${this.capPick === 'keep' ? 'kept and labeled' : this.capPick === 'drain' ? 'rinsed away' : 'bagged for hazardous waste'}` : `wrong call, it needed ${this.cap.correct}` } });
      this.capAttempted = true; this.capChecked = true; this.capVerdict = v;
      this.claimScreen('capstone', sc, v, false);
    }
  };
}
