// main.js - Unit 4 view-model (Bonding, Nomenclature & Geometry, C.7).
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

let viewer = null;

const shuffle = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
const pick = a => a[(Math.random() * a.length) | 0];
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const art = w => (/^[aeiou]/i.test(w) ? 'an ' : 'a ') + w;

const BOND_OPTIONS = [
  { key: 'ionic', label: 'Ionic', hint: 'typically a metal + nonmetal; attraction between ions' },
  { key: 'polar covalent', label: 'Polar covalent', hint: 'shared electrons are distributed unequally' },
  { key: 'nonpolar covalent', label: 'Nonpolar covalent', hint: 'shared electrons are distributed nearly equally' },
  { key: 'metallic', label: 'Metallic', hint: 'metal atoms with delocalized valence electrons' }
];

const PCT_OPTIONS = [
  { key: 'ionic', label: 'Higher ionic character (over 50% estimate)' },
  { key: 'polar', label: 'Polar covalent range' },
  { key: 'nonpolar', label: 'Very low ionic character' }
];

const POLAR_OPTIONS = [
  { key: 'polar', label: 'Polar overall (bond dipoles do not cancel)' },
  { key: 'nonpolar', label: 'Nonpolar overall (bond dipoles cancel)' }
];

const SHELF_SLOTS = 12;
const STATION_NAME = {
  bond: 'Bond type', name: 'Naming', geometry: '3D geometry',
  forces: 'Forces & properties', capstone: 'The last bottle'
};

const skills = [
  { id: 'a', code: 'C.7(A)', label: 'Bond type', target: 3 },
  { id: 'b', code: 'C.7(B)', label: 'Names and formulas', target: 3 },
  { id: 'c', code: 'C.7(C)', label: 'VSEPR shapes', target: 3 },
  { id: 'd', code: 'C.7(D)', label: 'Forces and properties', target: 3 },
  { id: 'h1', code: 'Honors', label: '% ionic character', target: 2, honors: true },
  { id: 'h2', code: 'Honors', label: 'Molecular polarity', target: 2, honors: true },
  { id: 'h3', code: 'Honors', label: 'Intermolecular forces', target: 2, honors: true },
  { id: 'cap', code: 'Capstone', label: 'The last bottle', target: 1, honors: true }
];

export { SE };

export function createSim() {
  return {
    ...createGame({ unitId: 'units_new/04-bonding-geometry', skills }),
    ELEMENTS, COMPOUNDS, MOLECULES, GEOMETRIES, SUBSTANCE_TYPES, IMF_TYPES,
    BOND_OPTIONS, PCT_OPTIONS, POLAR_OPTIONS, SE, fmt,
    honors: false,
    mode: 'bond',
    teksOpen: false,

    screenOf: { bond: null, name: null, geometry: null, forces: null, capstone: null },

    shelf: Array(SHELF_SLOTS).fill(null),
    day: 1,
    calls: 0,
    _ring: -1,
    worldLog: [],
    _wid: 0,
    scIdx: { a: -1, b: -1, c: -1, d: -1 },

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
      this.genGeometry();
      this.genForces();
      this.genPercent();
      this.genImf();
      this.$watch('molKey', () => this.showMolecule());
      this.$watch('honors', () => { this.genName(); });
      this.$nextTick(() => { ['bondA', 'bondB', 'molKey'].forEach(k => { const v = this[k]; this[k] = null; this[k] = v; }); });
    },

    setMode(m) {
      this.mode = m;
      if (m === 'capstone' && this.capUnlocked && !this.cap) this.genCapstone();
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

    nextScenario(skill) {
      const list = SCENARIOS.filter(s => s.skill === skill);
      const i = (this.scIdx[skill] = (this.scIdx[skill] ?? -1) + 1) % list.length;
      return list[i];
    },
    scenarioById(id) { return SCENARIOS.find(s => s.id === id) || null; },

    claimScreen(mode, sc, v, honors) { this.screenOf[mode] = { sc, v, honors: !!honors }; },
    releaseScreen(mode, honors) {
      const s = this.screenOf[mode];
      if (!honors || !s || s.honors) this.screenOf[mode] = null;
    },

    recordWorld({ icon, tone, text, delta }) {
      this.calls++;
      this.day = 1 + Math.floor(this.calls / 3);
      if (delta) this.shelfPlace(tone === 'success' ? 'ok' : 'bad', icon, delta);
      this.worldLog.unshift({ id: ++this._wid, icon, tone, text: `Day ${this.day}: ${text}` });
      if (this.worldLog.length > 6) this.worldLog.pop();
    },
    shelfPlace(state, icon, bottle) {
      const free = this.shelf.findIndex(s => !s);
      const i = free >= 0 ? free : (this._ring = (this._ring + 1) % SHELF_SLOTS);
      this.shelf[i] = { ...bottle, state, icon, slot: i + 1 };
    },
    get shelfBottles() { return this.shelf.filter(Boolean); },
    get shelfLabeled() { return this.shelf.filter(s => s && s.state === 'ok').length; },
    get shelfFlagged() { return this.shelf.filter(s => s && s.state === 'bad').length; },
    get shelfPct() { return this.shelfLabeled / SHELF_SLOTS * 100; },
    get shelfMood() { return this.shelfFlagged === 0 ? '\u{1F642}' : this.shelfFlagged <= 2 ? '\u{1F630}' : '\u{1F635}'; },
    get shelfState() {
      const n = this.shelfFlagged;
      if (n === 0) return 'No flagged containers';
      if (n === 1) return '1 container flagged';
      return `${n} containers flagged`;
    },
    get shelfColor() { return this.shelfFlagged === 0 ? 'var(--success)' : this.shelfFlagged <= 2 ? 'var(--warn)' : 'var(--danger)'; },
    get shelfReadings() {
      const placed = this.shelfBottles.length;
      const right = placed ? Math.round(this.shelfLabeled / placed * 100) : 100;
      return [
        { key: 'labeled', label: 'Labeled', raw: `${this.shelfLabeled}/12`, pct: this.shelfLabeled / SHELF_SLOTS * 100,
          hint: 'containers classified and labeled correctly' },
        { key: 'flagged', label: 'Flagged', raw: `${this.shelfFlagged}/12`, pct: (SHELF_SLOTS - this.shelfFlagged) / SHELF_SLOTS * 100,
          hint: 'containers that need the classification or label rechecked' },
        { key: 'cleared', label: 'Cleared', raw: `${placed}/12`, pct: placed / SHELF_SLOTS * 100,
          hint: 'containers already reviewed in this session' },
        { key: 'right', label: 'Right', raw: `${right}%`, pct: right,
          hint: 'percentage of completed classifications that were correct' }
      ];
    },
    stockColor(v) { return v >= 67 ? 'var(--success)' : v >= 34 ? 'var(--warn)' : 'var(--danger)'; },

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

    scArt(id) { return sceneArt(id); },

    get coreBrief() {
      if (this.mode === 'bond') return (this.bd && this.bd.sc) || null;
      if (this.mode === 'name') return (this.nm && this.nm.sc) || null;
      if (this.mode === 'geometry') return (this.gm && this.gm.sc) || null;
      if (this.mode === 'forces') return (this.fx && this.fx.sc) || null;
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
      return 'Choose a chemistry activity to begin.';
    },

    get activeReference() {
      const out = [];
      if (this.mode === 'bond') {
        if (this.screenIsHonors && this.pi) {
          out.push({ k: 'Elements', v: this.pi.pair.a + ' and ' + this.pi.pair.b + ', ΔEN ' + fmt(this.pi.dEN, 2) });
          out.push({ k: 'Pauling estimate', v: '% ionic = (1 − e^(−0.25·ΔEN²)) × 100' });
          out.push({ k: 'Activity bands', v: 'the displayed bands are simulation criteria, not universal bond boundaries' });
        } else {
          out.push({ k: 'Elements', v: this.bondA + ' (EN ' + fmt(this.en(this.bondA), 3) + ') and ' + this.bondB + ' (EN ' + fmt(this.en(this.bondB), 3) + ')' });
          out.push({ k: 'Activity ΔEN guide', v: '<0.4 nonpolar · 0.4–1.7 polar · >1.7 ionic; approximate only' });
          out.push({ k: 'Two metals', v: 'use the metallic-bonding model rather than the ΔEN bands' });
        }
      } else if (this.mode === 'name') {
        out.push({ k: 'Binary ionic', v: 'metal name + nonmetal root ending in -ide; no prefixes' });
        out.push({ k: 'Binary molecular', v: 'use prefixes; usually omit mono- on the first element when there is one atom' });
        out.push({ k: 'Ionic subscripts', v: 'set by charge balance; they are not read as prefixes in the name' });
      } else if (this.mode === 'geometry') {
        if (this.screenIsHonors && this.pol) {
          out.push({ k: 'Molecule', v: this.pol.mol.formula + ', ' + this.pol.mol.geometry });
          out.push({ k: 'Molecular polarity', v: 'depends on bond dipoles and their vector sum in the 3D geometry' });
          out.push({ k: 'Cancellation', v: 'symmetrically arranged identical bond dipoles can cancel' });
        } else {
          out.push({ k: 'Domains', v: 'count bonds and lone pairs on the central atom; multiple bonds count as one domain' });
          out.push({ k: 'No lone pairs', v: '2 linear 180° · 3 trigonal planar 120° · 4 tetrahedral 109.5°' });
          out.push({ k: 'Lone pairs', v: 'lone-pair domains repel bonding domains more strongly and can decrease bond angles' });
        }
      } else if (this.mode === 'forces') {
        if (this.screenIsHonors && this.imfEx) {
          out.push({ k: 'All molecules', v: 'London dispersion forces are always present' });
          out.push({ k: 'Hydrogen bonding', v: 'requires H bonded to N, O, or F and an appropriate neighboring lone pair' });
          out.push({ k: 'Boiling point', v: 'IMF strength matters, but size, polarizability, and shape also affect it' });
        } else {
          out.push({ k: 'Activity model', v: 'classify by the combined observations; these patterns have exceptions' });
          out.push({ k: 'Solid conductivity', v: 'metals often conduct as solids; ionic solids do not until charged particles can move' });
          out.push({ k: 'Covalent solids', v: 'molecular and network solids differ greatly; graphite is a conducting network exception' });
        }
      } else if (this.mode === 'capstone') {
        out.push({ k: 'Unknown chemicals', v: 'do not taste, smell, mix, heat, or drain-test them' });
        out.push({ k: 'Use records', v: 'identify hazards from labels, SDS/manufacturer information, or supplied reference data' });
        out.push({ k: 'Disposal', v: 'follow product directions and local household hazardous-waste rules' });
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
      if (t === 'metallic') return 'Metallic bonding uses delocalized valence electrons in a metal.';
      if (t === 'ionic') return 'An ionic solid is held by electrostatic attraction between cations and anions.';
      if (t === 'polar covalent') return 'The bonded atoms share electron density unequally.';
      return 'The bonded atoms share electron density nearly equally.';
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
        v = { tone: 'success', icon: sc.icon, state: 'CLASSIFIED', headline: `${this.bd.answer} bonding`,
          detail: sc.consequences[this.bondPick], gauge: null };
        this.bondDone = true;
        delta = { label, name: sc.system, line: `${this.bd.answer} bonding` };
        feed = `${sc.system}: classified as ${this.bd.answer}.`;
      } else {
        v = { tone: 'fail', icon: '\u{1F6A8}', state: 'RECHECK', headline: `Correct classification: ${this.bd.answer}`,
          detail: `${sc.consequences[this.bondPick]} For this activity, ${this.bondA} and ${this.bondB} are classified with ${art(this.bd.answer)} bonding model.`, gauge: null };
        delta = { label, name: sc.system, line: `selected ${this.bondPick}; correct: ${this.bd.answer}` };
        feed = `${sc.system}: selected ${this.bondPick}; correct classification is ${this.bd.answer}.`;
      }
      this.gRecord('a', good, !this.bondAttempted);
      this.recordWorld({ icon: v.icon, tone: v.tone, text: feed, delta });
      this.bondAttempted = true; this.bondChecked = true; this.bondVerdict = v;
      this.claimScreen('bond', sc, v, false);
    },
    bondNext() { this.genBond(); },

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
      const truth = `${q.formula} is ${q.name} (${q.cat.toLowerCase()}). In this activity, it appears at ${q.where}.`;
      let v, delta, feed;
      if (good) {
        v = { tone: 'success', icon: sc.icon, state: 'LABEL CHECKED', headline: q.name,
          detail: `${truth} ${sc.success}`, gauge: null };
        this.nameDone = true;
        delta = { label: q.formula, name: q.name, line: `${q.cat.toLowerCase()}, labeled correctly` };
        feed = `${sc.system}: ${q.name} labeled correctly.`;
      } else {
        v = { tone: 'fail', icon: '\u{1F6A8}', state: 'RECHECK LABEL', headline: `Correct name: ${q.name}`,
          detail: `${sc.fail} ${truth}`, gauge: null };
        delta = { label: q.formula, name: q.name, line: `selected ${this.nameChosen.name}; correct: ${q.name}` };
        feed = `${sc.system}: ${q.formula} needs a corrected label.`;
      }
      this.gRecord('b', good, !this.nameAttempted);
      this.recordWorld({ icon: v.icon, tone: v.tone, text: feed, delta });
      this.nameAttempted = true; this.nameChecked = true; this.nameVerdict = v;
      this.claimScreen('name', sc, v, false);
    },
    nameNext() { this.genName(); },

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
      const truth = `${mol.name} has ${mol.bonds} bonding ${mol.bonds === 1 ? 'domain' : 'domains'} and ${mol.lone} lone ${mol.lone === 1 ? 'pair' : 'pairs'} on the central ${mol.central}, so its molecular geometry is ${mol.geometry}; the listed bond angle is ${mol.angle}.`;
      let v, delta, feed;
      if (good) {
        v = { tone: 'success', icon: sc.icon, state: 'IDENTIFIED', headline: mol.geometry,
          detail: `${truth} ${sc.success}`, gauge: null };
        this.geoDone = true;
        delta = { label: mol.formula, name: mol.name, line: `${mol.geometry}, ${mol.angle}` };
        feed = `${sc.system}: ${mol.formula} identified as ${mol.geometry}.`;
      } else {
        v = { tone: 'fail', icon: '\u{1F6A8}', state: 'RECHECK GEOMETRY', headline: `Correct geometry: ${mol.geometry}`,
          detail: `You selected ${this.geoGuess}. ${truth} ${sc.fail}`, gauge: null };
        delta = { label: mol.formula, name: mol.name, line: `selected ${this.geoGuess}; correct: ${mol.geometry}` };
        feed = `${sc.system}: ${mol.formula} geometry needs rechecking.`;
      }
      this.gRecord('c', good, !this.geoAttempted);
      this.recordWorld({ icon: v.icon, tone: v.tone, text: feed, delta });
      this.geoAttempted = true; this.geoChecked = true; this.geoVerdict = v;
      this.claimScreen('geometry', sc, v, false);
    },
    geoNext() { this.genGeometry(); },

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
        delta = { label: sc.tag, name: sc.system, line: `${truth.type.toLowerCase()}, ${truth.intra}` };
        feed = `${sc.system}: classified as ${truth.type.toLowerCase()}.`;
      } else {
        v = { tone: 'fail', icon: '\u{1F6A8}', state: 'RECHECK CLASSIFICATION', headline: `Best match: ${truth.type.toLowerCase()}`,
          detail: `${sc.consequences[this.fxChosen]} ${truth.note}`, gauge: null };
        delta = { label: sc.tag, name: sc.system, line: `selected ${this.fxChosen.toLowerCase()}; best match: ${truth.type.toLowerCase()}` };
        feed = `${sc.system}: classification needs rechecking.`;
      }
      this.gRecord('d', good, !this.fxAttempted);
      this.recordWorld({ icon: v.icon, tone: v.tone, text: feed, delta });
      this.fxAttempted = true; this.fxChecked = true; this.fxVerdict = v;
      this.claimScreen('forces', sc, v, false);
    },
    fxNext() { this.genForces(); },

    genPercent() {
      const sc = SCENARIOS.find(s => s.id === 'h1-percent-ionic');
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
      const truth = `${this.pi.pair.a} and ${this.pi.pair.b} differ by ${fmt(this.pi.dEN, 2)} in electronegativity. The Pauling expression used here estimates ${fmt(this.pi.pct, 3)}% ionic character.`;
      let v;
      if (good) {
        v = { tone: 'success', icon: sc.icon, state: 'CLASSIFIED', headline: `${fmt(this.pi.pct, 3)}% ionic character`,
          detail: `${truth} ${sc.consequences[this.piPick]} ${sc.success}`, gauge: null };
        this.piDone = true;
      } else {
        v = { tone: 'fail', icon: '\u{1F6A8}', state: 'RECHECK BAND', headline: `${fmt(this.pi.pct, 3)}% ionic character`,
          detail: `${sc.consequences[this.piPick]} ${truth} ${sc.fail}`, gauge: null };
      }
      this.gRecord('h1', good, !this.piAttempted);
      this.recordWorld({ icon: v.icon, tone: v.tone,
        text: `${this.pi.pair.where}: ${good ? 'activity band identified correctly' : 'activity band needs rechecking'}.`, delta: null });
      this.piAttempted = true; this.piChecked = true; this.piVerdict = v;
      this.claimScreen('bond', sc, v, true);
    },
    piNext() { this.genPercent(); },

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
        ? `${mol.name} has a ${mol.geometry} geometry in which the bond-dipole vectors do not cancel, so the molecule has a net dipole.`
        : `${mol.name} has a ${mol.geometry} geometry in which the bond-dipole vectors cancel, so the molecule has no net dipole.`;
      let v;
      if (good) {
        v = { tone: 'success', icon: sc.icon, state: 'CLASSIFIED', headline: mol.polar ? 'Polar overall' : 'Nonpolar overall',
          detail: `${truth} ${sc.consequences[this.polPick]} ${sc.success}`, gauge: null };
        this.polDone = true;
      } else {
        v = { tone: 'fail', icon: '\u{1F6A8}', state: 'RECHECK POLARITY', headline: mol.polar ? 'Correct: polar overall' : 'Correct: nonpolar overall',
          detail: `${sc.consequences[this.polPick]} ${truth} ${sc.fail}`, gauge: null };
      }
      this.gRecord('h2', good, !this.polAttempted);
      this.recordWorld({ icon: v.icon, tone: v.tone,
        text: `${mol.formula} polarity: ${good ? 'classified correctly' : 'classification needs rechecking'}.`, delta: null });
      this.polAttempted = true; this.polChecked = true; this.polVerdict = v;
      this.claimScreen('geometry', sc, v, true);
    },

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
      const truth = `${ex.formula}: ${ex.why}, so the strongest intermolecular force listed is ${ex.imf.toLowerCase()}.`;
      let v;
      if (good) {
        v = { tone: 'success', icon: sc.icon, state: 'IDENTIFIED', headline: ex.imf,
          detail: `${truth} ${sc.consequences[this.imfChosen]} ${sc.success}`, gauge: null };
        this.imfDone = true;
      } else {
        v = { tone: 'fail', icon: '\u{1F6A8}', state: 'RECHECK FORCE', headline: `Correct choice: ${ex.imf}`,
          detail: `${sc.consequences[this.imfChosen]} ${truth} ${sc.fail}`, gauge: null };
      }
      this.gRecord('h3', good, !this.imfAttempted);
      this.recordWorld({ icon: v.icon, tone: v.tone,
        text: `${ex.where}: ${good ? 'intermolecular force identified correctly' : 'intermolecular force needs rechecking'}.`, delta: null });
      this.imfAttempted = true; this.imfChecked = true; this.imfVerdict = v;
      this.claimScreen('forces', sc, v, true);
    },
    imfNext() { this.genImf(); },

    get capUnlocked() { return this.gOverall() === 1; },
    genCapstone() {
      const sc = SCENARIOS.find(s => s.id === 'cap-underthesink');
      const c = pick(COMPOUNDS.filter(x => x.sink));
      const syms = Object.keys(parseFormula(c.formula));
      const bond = bondType(syms[0], syms[1]);
      const klass = bond === 'ionic' ? 'Ionic' : 'Covalent molecular';
      const props = SUBSTANCE_TYPES.find(s => s.type === klass);
      const mol = MOLECULES.find(m => m.formula === c.formula);
      this.cap = {
        sc, c, syms, bond, klass, mol,
        shape: mol ? `${mol.geometry} at ${mol.angle}` : 'an ionic lattice; no discrete molecular geometry is assigned',
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
      const fig = `The supplied record identifies ${c.formula}, ${c.name}. The ${this.cap.syms[0]}–${this.cap.syms[1]} pair is classified with ${art(this.cap.bond)} bonding model, so the activity treats the substance as ${this.cap.klass.toLowerCase()}. Structure: ${this.cap.shape}.`;
      const good = this.capPick === this.cap.correct;
      let v;
      if (good) {
        v = { tone: 'success', icon: sc.icon, state: 'ACTION SUPPORTED', headline: 'Supported by the reference record',
          detail: `${fig} ${opt.good}`, gauge: null };
        this.capWin = true;
      } else {
        const right = sc.options.find(o => o.key === this.cap.correct);
        v = { tone: 'fail', icon: '\u{1F6A8}', state: 'RECHECK ACTION', headline: 'Use the supplied handling information',
          detail: `${fig} ${opt.consequence} Supported category: ${right.label}`, gauge: null };
      }
      const actionLine = this.capPick === 'keep'
        ? 'kept in labeled storage'
        : this.capPick === 'drain'
          ? 'approved nonhazardous disposal category'
          : 'household hazardous-waste category';
      this.gRecord('cap', good, !this.capAttempted);
      this.recordWorld({ icon: v.icon, tone: v.tone,
        text: `${c.formula}: ${good ? 'handling category supported' : 'handling category needs rechecking'}.`,
        delta: { label: c.formula, name: c.name,
          line: good ? `${this.cap.klass.toLowerCase()}, ${actionLine}` : `selected ${this.capPick}; correct category: ${this.cap.correct}` } });
      this.capAttempted = true; this.capChecked = true; this.capVerdict = v;
      this.claimScreen('capstone', sc, v, false);
    }
  };
}
