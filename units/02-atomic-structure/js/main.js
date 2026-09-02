// main.js — Unit 2 view-model (Atomic Structure & Theory, C.6 + C.5B).
import {
  ATOMIC_MODELS, BUILD_SET, ISOTOPE_ELEMENTS, SPECTRA,
  CONFIG_EXCEPTIONS, NOBLE_CORES, SE, SCENARIOS, SHOP, EVIDENCE,
  SPECTRA_BANDS, MASS_BANDS, HONORS_BANDS
} from './model.js';
import {
  ATOMIC_MASS, ELEMENTS, averageAtomicMass, electronConfiguration, formatConfig,
  shellOccupancy, valenceElectrons, frequencyOf, photonEnergy, rydbergWavelength, fmt
} from '../../../shared/js/chem.js';
import { createGame, outcomeBand } from '../../../shared/js/game.js';
import { sceneArt } from './art.js';

// Approximate visible-spectrum colour for a wavelength in nm (Dan Bruton method).
function wavelengthToRGB(nm) {
  let r = 0, g = 0, b = 0;
  if (nm >= 380 && nm < 440) { r = -(nm - 440) / 60; b = 1; }
  else if (nm < 490) { g = (nm - 440) / 50; b = 1; }
  else if (nm < 510) { g = 1; b = -(nm - 510) / 20; }
  else if (nm < 580) { r = (nm - 510) / 70; g = 1; }
  else if (nm < 645) { r = 1; g = -(nm - 645) / 65; }
  else if (nm <= 780) { r = 1; }
  let f = 1;
  if (nm < 420) f = 0.3 + 0.7 * (nm - 380) / 40;
  else if (nm > 700) f = 0.3 + 0.7 * (780 - nm) / 80;
  const ch = c => Math.round(255 * Math.pow(Math.max(0, c * f), 0.8));
  return `rgb(${ch(r)},${ch(g)},${ch(b)})`;
}

const ORBITALS = { s: 1, p: 3, d: 5, f: 7 };
const EV_J = 1.602176634e-19;

// Prompts that need information not present in the original scenario wording.
const SCENARIO_GOAL_OVERRIDES = {
  'b-neon': 'Build a neon-20 ion, Ne+, formed when a neutral neon-20 atom loses one electron.'
};

// C.6(E) must ask students to choose a configuration before the interface reveals it.
const CONFIG_CHALLENGES = {
  'e-magnesium': {
    goal: 'Which noble-gas electron configuration is the ground-state configuration of magnesium?',
    correct: '[Ne] 3s2',
    choices: ['[Ne] 3s1 3p1', '[Ne] 3s2', '[Ne] 3p2']
  },
  'e-chromium': {
    goal: 'Which listed electron configuration is the observed ground-state configuration of chromium?',
    correct: '[Ar] 4s1 3d5',
    choices: ['[Ar] 4s2 3d4', '[Ar] 4s2 3d5', '[Ar] 4s1 3d5']
  },
  'e-copper': {
    goal: 'Which listed electron configuration is the observed ground-state configuration of copper?',
    correct: '[Ar] 4s1 3d10',
    choices: ['[Ar] 4s1 3d10', '[Ar] 4s2 3d9', '[Ar] 4s2 3d10']
  }
};

const CONFIG_ART_META = {
  'e-magnesium': { sym:'Mg', z:12, name:'Magnesium' },
  'e-chromium': { sym:'Cr', z:24, name:'Chromium' },
  'e-copper': { sym:'Cu', z:29, name:'Copper' }
};

function configurationChallengeArt(id) {
  const m = CONFIG_ART_META[id];
  if (!m) return '';
  return `<svg viewBox="0 0 400 150" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
    <defs><linearGradient id="${id}-question-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#102a34"/><stop offset="1" stop-color="#0c1d25"/></linearGradient></defs>
    <rect width="400" height="150" fill="url(#${id}-question-bg)"/>
    <rect x="20" y="18" width="74" height="74" rx="8" fill="#173844" stroke="#4f93a0"/>
    <text x="57" y="57" text-anchor="middle" font-family="Bitter, serif" font-size="30" font-weight="700" fill="#dcebee">${m.sym}</text>
    <text x="57" y="78" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="#9fc8d0">Z = ${m.z}</text>
    <text x="116" y="31" font-family="JetBrains Mono, monospace" font-size="9" font-weight="700" fill="#9fc8d0">GROUND-STATE CONFIGURATION</text>
    <rect x="116" y="43" width="258" height="49" rx="6" fill="#122932" stroke="#385966"/>
    <text x="245" y="72" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="21" font-weight="700" fill="#f0c47e">?</text>
    <text x="245" y="86" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="8" fill="#abc1c8">choose an answer in the workspace</text>
    <text x="20" y="117" font-family="JetBrains Mono, monospace" font-size="8" fill="#abc1c8">${m.name} · answer hidden until submitted</text>
    <text x="20" y="139" font-family="JetBrains Mono, monospace" font-size="10" font-weight="700" fill="#cfe6ea">CONFIGURATION MISSION</text>
  </svg>`;
}

const skills = [
  { id:'a', code:'C.6(A)', label:'Atomic models', target:3 }, { id:'b', code:'C.6(B)', label:'Atomic structure', target:3 },
  { id:'d', code:'C.6(D)', label:'Average mass', target:3 }, { id:'c', code:'C.6(C)', label:'Spectra', target:3 },
  { id:'e', code:'C.6(E)', label:'Configuration', target:3 }, { id:'f', code:'C.5(B)', label:'Group patterns', target:3 },
  { id:'h1', code:'Honors', label:'Photon energy', target:2, honors:true }, { id:'h2', code:'Honors', label:'Orbital exceptions', target:2, honors:true },
  { id:'cap', code:'Capstone', label:'Final evidence', target:1, honors:true }
];

// The scene geometry is intentionally unchanged because the 400×150 banners are tightly
// fitted to the mission column. Normalize only the student-visible SVG copy here so the
// language/science refactor does not disturb the artwork layout.
const ART_COPY = [
  ['THE JUNK-SHELF CRT · THE BEAM BENDS', 'CRT EVIDENCE · THE BEAM BENDS'],
  ['a charged part', 'a charged particle'],
  ['THE COLOR TUBE · FOUR SHARP COLORS, NOT A RAINBOW', 'LINE SPECTRUM · DISCRETE LINES, NOT A CONTINUUM'],
  ['a continuous rainbow', 'continuous spectrum'],
  ['what the tube gives', 'observed line spectrum'],
  ['discrete lines mean discrete drops', 'discrete lines → discrete energies'],
  ['one photon per drop', 'photon from a transition'],
  ['THE SUPPLIER ASSAY · THE SAME RATIO, TWICE', 'COMPOSITION DATA · THE SAME RATIO, TWICE'],
  ['two suppliers, two sacks', 'two samples, same compound'],
  ['supplier A', 'sample A'], ['supplier B', 'sample B'],
  ['identical, every batch', 'same composition'],
  ['THE ARGON-40 CYLINDER · NEUTRAL, AND SET RIGHT', 'ARGON-40 · NEUTRAL ATOM'],
  ['off the shelf', 'sample record'], ['THE SERVICE TAG', 'PARTICLE COUNTS'],
  ['THE HOT SIGN TUBE · ONE ELECTRON GONE', 'Ne+ ION · ONE ELECTRON REMOVED'],
  ['the tube ran hot', 'neon discharge'], ['it ionised in service', 'Ne atom loses 1 e−'],
  ['BUILD Ne+', 'MODEL Ne+'],
  ['THE CHLORINE-37 TRACER · MASS NUMBER, NOT AVERAGE', 'CHLORINE-37 · MASS NUMBER, NOT AVERAGE MASS'],
  ['the leak-check bottle', 'isotope sample'], ['NOT THE TABLE VALUE', 'MASS NUMBER ≠ TABLE AVERAGE'],
  ['one bottle, one isotope', 'one atom, one isotope'],
  ['THE TUBING INVOICE · THE BEAM BALANCES AT 10.81', 'BORON ISOTOPES · CALCULATE THE WEIGHTED AVERAGE'],
  ['borosilicate, boxed', 'reference isotope data'], ['INVOICE', 'B SAMPLE'],
  ['THE ASSAY, WEIGHED', 'WEIGHTED CONTRIBUTIONS'], ['THE ASSAY', 'REFERENCE DATA'],
  ['THE COPPER SPOOL · WHAT THE SCRAP BUYER PAYS FOR', 'COPPER ISOTOPES · CALCULATE THE WEIGHTED AVERAGE'],
  ['the spool, on the scale', 'copper sample'],
  ['THE POOL TABLETS · A THREE-QUARTER MIX', 'CHLORINE ISOTOPES · CALCULATE THE WEIGHTED AVERAGE'],
  ['the shop sells these too', 'chlorine sample'], ['POOL Cl', 'Cl DATA'],
  ['THE DEAD STREETLIGHT · SODIUM, AT 589 nm', 'SODIUM EMISSION · STRONG LINES NEAR 589 nm'],
  ['out since Thursday', 'selected Na spectrum'], ['the handheld', 'spectroscope'],
  ['four lines, and one doublet', 'strong yellow doublet near 589 nm'], ['that is the yellow you see', 'characteristic sodium emission'],
  ["THE LOBBY SIGN · NEON'S RED-ORANGE CLUSTER", 'NEON EMISSION · RED-ORANGE LINE CLUSTER'],
  ['one segment dead', 'selected Ne spectrum'], ['is why neon looks like neon', 'characteristic neon pattern'],
  ['THE CEILING TUBE · MERCURY, INTO THE VIOLET', 'MERCURY EMISSION · VISIBLE LINE PATTERN'],
  ['the shop’s own ceiling', 'selected Hg spectrum'], ['the same grammar, new positions', 'different element, different pattern'],
  ['lines are a fingerprint', 'line pattern supports identity'],
  ['THE MAGNESIUM ELECTRODE · FILL IT, THEN DOT IT', 'MAGNESIUM · CONFIGURATION AND VALENCE DOTS'],
  ['CERTIFY', 'CHECK'],
  ['THE CHROMIUM ELECTRODE · ONE ELECTRON MOVES', 'CHROMIUM · OBSERVED CONFIGURATION EXCEPTION'],
  ['AUFBAU PREDICTS', 'SIMPLE PREDICTION'], ['THE BENCH FINDS', 'OBSERVED GROUND STATE'],
  ['a half-filled d row is worth the move', 'Cr differs from the simple prediction'],
  ['THE COPPER COIL · A FILLED d ROW WINS TOO', 'COPPER · OBSERVED CONFIGURATION EXCEPTION'],
  ['the last gap in d closes', 'Cu differs from the simple prediction'],
  ['THE SEALED ARGON TUBE · A FULL SHELL DOES NOTHING', 'ARGON · FULL VALENCE SHELL, LOW REACTIVITY'],
  ['SEALED · 10 YEARS', 'LONG SERVICE RECORD'], ['FAMILY CALL', 'GROUP PATTERN'], ['inert', 'very unreactive'], ['seal it in', 'low reactivity'],
  ['THE ALUMINUM ELECTRODE · THREE TO GIVE AWAY', 'ALUMINUM · THREE VALENCE ELECTRONS'],
  ['gives 3', 'often forms'], ['away', 'Al 3+ ions'],
  ['THE GETTER ORDER · ONE SHORT, AND GRABBING', 'CHLORINE · SEVEN VALENCE ELECTRONS'],
  ['the getter cartridge', 'chlorine sample'], ['takes one', 'often forms'], ['and is done', 'Cl− ions'], ['Cl -', 'Cl−'],
  ['THE LINE CHECK · ONE DROP, ONE PHOTON, ONE ENERGY', 'PHOTON ENERGY · E = hc / λ'],
  ['the drop that made the line', 'allowed transition'], ['E = hc / L', 'E = hc / λ'],
  ['THE ORBITAL CHECK · IS THIS ONE AN EXCEPTION?', 'CONFIGURATION CHECK · PREDICTED VS OBSERVED'],
  ['PREDICTED BY FILLING ORDER', 'SIMPLE AUFBAU PREDICTION'], ['WHAT THE BENCH SHOWS', 'OBSERVED GROUND STATE'],
  ['an exception is evidence, not a typo', 'compare prediction with observed data'],
  ['THE UNLABELLED CYLINDER · NAME IT, THEN CALL IT', 'UNLABELED CYLINDER · SPECTRUM + IDENTIFICATION STATUS'],
  ['no stencil', 'no verified label'], ['READ IT', 'SPECTRUM'], ['full shell?', 'Group 18 pattern'],
  ['THE LAST CALL', 'EVIDENCE DECISION'], ['fill the tube', 'use cylinder'], ['send it back', 'return for ID'],
  ['call it in', 'mark hazardous'], ['on the evidence', 'choose the justified action']
];

// Scene-specific redactions keep the illustration useful without printing the answer.
// Replacements target complete SVG text nodes so numerical geometry is not altered.
const ART_COPY_BY_SCENE = {
  'a-assay': [['DALTON', 'MODEL ?']],
  'b-argon': [['18p 22n', 'p ?  n ?'], ['18', '?'], ['22', '?']],
  'b-neon': [['10p 10n', 'p ?  n ?'], ['10', '?'], ['9', '?']],
  'b-chlorine': [['17p 20n', 'p ?  n ?'], ['17 + 20 = 37', 'protons + neutrons = 37']],
  'd-boron': [['10.81 u', 'average ?']],
  'd-copper': [['63.55 u', 'average ?']],
  'd-chlorine': [['35.45 u', 'average ?']],
  'f-argon': [['18', '?'], ['noble gas', 'family ?']],
  'f-aluminum': [['13', '?']],
  'f-chlorine': [['group 17', 'group ?']]
};

function replaceSvgText(svg, from, to) {
  return svg.split(`>${from}<`).join(`>${to}<`);
}

function refineSceneArt(svg, id) {
  let out = ART_COPY.reduce((result, [from, to]) => result.split(from).join(to), svg);
  for (const [from, to] of ART_COPY_BY_SCENE[id] || []) out = replaceSvgText(out, from, to);
  return out;
}

function observedConfiguration(z) {
  const predicted = electronConfiguration(z);
  const ex = CONFIG_EXCEPTIONS.find(x => x.z === z);
  if (!ex) return predicted;
  const actual = [...ex.actual.matchAll(/(\d+)([spdf])(\d+)/g)]
    .map(m => ({ n:Number(m[1]), l:m[2], e:Number(m[3]) }));
  return predicted.map(sub => {
    const hit = actual.find(a => a.n === sub.n && a.l === sub.l);
    return hit ? { ...sub, e:hit.e } : sub;
  });
}

export { SE };

export function createSim() {
  return {
    ...createGame({ unitId:'units_new/02-atomic-structure', skills }),
    ATOMIC_MODELS, ISOTOPE_ELEMENTS, SPECTRA, CONFIG_EXCEPTIONS, SE, SHOP, EVIDENCE, SCENARIOS, fmt,
    honors: false,
    teksOpen: false,
    mode: 'models',
    electronTask: 'config',

    scIdx: { a:-1, b:-1, d:-1, c:-1, e:-1, f:-1 },
    modelsSc: null, buildSc: null, massSc: null, spectraSc: null, configSc: null, familySc: null,
    modelPick: null, familyPick: null, configPick: null, massInput: '', specEnergyInput: '', h1EnergyInput: '', h2Pick: null, capPick: null,
    modeVerdict: {}, activeScenario: {}, rack: [], shiftDay: 1, worldLog: [], _wid: 0,

    // ---- C.6(A/B) build an atom ----
    elZ: 6, nNeutrons: 6, nElectrons: 6,
    // ---- C.6(D) average atomic mass ----
    isoKey: 'Cl', isoAbund: {},
    // ---- C.6(C) emission spectra ----
    specKey: 'H', selLine: null,
    // ---- C.6(E)/C.5(B) electrons ----
    cfgZ: 11, famZ: 18, vQuiz: null, vChecked: false,
    cfgVerdict: null, famVerdict: null, h1Verdict: null, h2Verdict: null,

    init() {
      this.gLoad();
      this.onElement();
      this.resetNatural();
      this.nextModels(); this.nextBuild(); this.nextMass(); this.nextSpectra(); this.nextFamily(); this.nextConfig();
      this.$watch('elZ', () => this.onElement());
      this.$watch('isoKey', () => this.resetNatural());
      this.$watch('specKey', () => { this.selLine = null; this.specEnergyInput = ''; this.h1EnergyInput = ''; this.h1Verdict = null; });
      this.$watch('cfgZ', () => { this.vQuiz = null; this.vChecked = false; this.configPick = null; this.cfgVerdict = null; this.h2Pick = null; this.h2Verdict = null; });
      // A <select x-model> binds before its child x-for has rendered its <option>s,
      // so re-apply each selected value after those options exist.
      this.$nextTick(() => {
        ['elZ', 'isoKey', 'specKey', 'cfgZ'].forEach(k => { const v = this[k]; this[k] = null; this[k] = v; });
      });
    },

    setMode(m) {
      this.mode = m;
      if (m === 'config') this.focusScenario('config', this.electronTask === 'family' ? this.familySc : this.configSc);
      if (m === 'capstone' && this.capUnlocked && !this.capPick) this.capPick = null;
    },
    setElectronTask(task) {
      if (task !== 'config' && task !== 'family') return;
      this.electronTask = task;
      this.focusScenario('config', task === 'family' ? this.familySc : this.configSc);
    },
    resetProgress() {
      this.gReset(); this.modeVerdict = {}; this.activeScenario = {}; this.rack = []; this.shiftDay = 1; this.worldLog = []; this.electronTask = 'config';
      this.cfgVerdict = null; this.famVerdict = null; this.h1Verdict = null; this.h2Verdict = null; this.configPick = null; this.h2Pick = null; this.h1EnergyInput = '';
      this.scIdx = { a:-1, b:-1, d:-1, c:-1, e:-1, f:-1 };
      this.nextModels(); this.nextBuild(); this.nextMass(); this.nextSpectra(); this.nextFamily(); this.nextConfig();
    },
    nextScenario(skill) {
      const list = SCENARIOS.filter(s => s.skill === skill);
      const i = this.scIdx[skill] = ((this.scIdx[skill] ?? -1) + 1) % list.length;
      return list[i];
    },
    nextModels() { this.modelsSc = this.nextScenario('a'); this.modelPick = null; this.focusScenario('models', this.modelsSc); },
    nextBuild() {
      const base = this.nextScenario('b');
      this.buildSc = SCENARIO_GOAL_OVERRIDES[base.id] ? { ...base, goal:SCENARIO_GOAL_OVERRIDES[base.id] } : base;
      // Start from a neutral carbon atom instead of preloading the requested answer.
      this.elZ = 6; this.onElement();
      this.focusScenario('build', this.buildSc);
    },
    nextMass() { this.massSc = this.nextScenario('d'); this.isoKey = this.massSc.iso; this.resetNatural(); this.massInput = ''; this.focusScenario('mass', this.massSc); },
    nextSpectra() {
      this.spectraSc = this.nextScenario('c'); this.specKey = this.spectraSc.spec; this.specEnergyInput = ''; this.h1EnergyInput = ''; this.h1Verdict = null;
      this.$nextTick(() => { this.selLine = 0; });
      this.focusScenario('spectra', this.spectraSc);
    },
    nextConfig() {
      const base = this.nextScenario('e'), challenge = CONFIG_CHALLENGES[base.id];
      this.configSc = challenge ? { ...base, goal:challenge.goal } : base;
      this.cfgZ = this.configSc.z; this.configPick = null; this.vQuiz = null; this.vChecked = false; this.cfgVerdict = null; this.h2Pick = null; this.h2Verdict = null;
      this.focusScenario('config', this.configSc);
    },
    nextFamily() { this.familySc = this.nextScenario('f'); this.famZ = this.familySc.z; this.familyPick = null; this.famVerdict = null; this.focusScenario('config', this.familySc); },
    focusScenario(mode, sc) {
      if (!sc) return;
      const current = this.activeScenario[mode];
      if (!current || current.id !== sc.id) delete this.modeVerdict[mode];
      this.activeScenario[mode] = sc;
    },
    get rackState() { return this.rack.length >= 5 ? 'One task left in this practice round' : (this.rack.length ? 'Practice tasks in progress' : 'Ready for the first practice task'); },
    recordWorld({ sc, good, detail, color = '#2a7d8a' }) {
      if (good) this.rack.push({ id:`${sc.id}-${this._wid}`, label:sc.system, color });
      this.worldLog.unshift({ id:++this._wid, tone:good ? 'success' : 'fail', text:`${sc.system}: ${good ? 'correct' : 'recheck'}. ${detail}` });
      if (this.worldLog.length > 6) this.worldLog.pop();
      if (this.rack.length === SHOP.tubeSlots) {
        this.worldLog.unshift({ id:++this._wid, tone:'success', text:'Practice rack complete; a new round begins.' });
        this.rack = []; this.shiftDay += 1;
      }
    },
    verdict(sc, good, detail, color) {
      const prior = this.modeVerdict[sc.stage], active = this.activeScenario[sc.stage];
      if (prior && prior.tone === 'success' && active && active.id === sc.id) return prior;
      const v = good
        ? { tone:'success', state:'CORRECT', headline:'The evidence supports this answer', detail }
        : { tone:'fail', state:'RECHECK', headline:'Review the evidence and try again', detail };
      this.gRecord(sc.skill, good, true);
      this.modeVerdict[sc.stage] = v;
      this.activeScenario[sc.stage] = sc;
      this.recordWorld({ sc, good, detail, color });
      return v;
    },
    practiceVerdict(sc, good, detail, color = '#7651a8') {
      const v = good
        ? { tone:'success', state:'CORRECT', headline:'The extension is correct', detail }
        : { tone:'fail', state:'RECHECK', headline:'Recheck the extension', detail };
      this.gRecord(sc.skill, good, true);
      this.recordWorld({ sc, good, detail, color });
      return v;
    },
    modelState(name) { const sc=this.modelsSc; if (!this.modeVerdict.models) return this.modelPick===name?'on':''; return name===sc.correct?'correct':(name===this.modelPick?'wrong':''); },
    commitModel() {
      if (!this.modelPick) return;
      const sc = this.modelsSc, evidence = EVIDENCE[sc.evidence], ok = this.modelPick === sc.correct;
      this.verdict(sc, ok, `${this.modelPick}: ${evidence.consequence[this.modelPick]}`);
    },
    commitBuild() {
      const sc=this.buildSc, ok=this.elZ===sc.z && this.nNeutrons===sc.n && this.nElectrons===sc.e;
      this.verdict(sc, ok, ok ? `${this.isotopeName} has the requested proton, neutron, and electron counts.` : 'Recheck the element, mass number, and charge in the mission. Use A = protons + neutrons and charge = protons − electrons.');
    },
    get massDialValue() { const v = parseFloat(this.massInput); return isFinite(v) ? v : this.avgMass; },
    commitMass() {
      const sc = this.massSc, value = parseFloat(this.massInput), target = sc.expected;
      const ok = this.isoKey === sc.iso && isFinite(value) && outcomeBand(value, target, MASS_BANDS).withinSpec;
      this.verdict(sc, ok,
        ok ? `${fmt(value,5)} u matches the weighted result for the reference ${this.iso.name} isotope data.` : 'Recalculate the weighted average: multiply each isotope mass by its fractional abundance, then add the contributions.');
    },
    commitSpectra() {
      const sc=this.spectraSc, val=parseFloat(this.specEnergyInput), line=this.selectedLine;
      const ok=this.specKey===sc.spec && !!line && isFinite(val) && outcomeBand(val,line.energy,SPECTRA_BANDS).withinSpec;
      this.verdict(sc, ok, ok ? `${line.wl.toFixed(1)} nm corresponds to ${fmt(line.energy,3)} J per photon.` : `Use a ${sc.spec} line and calculate E = hc/λ in joules.`, line ? line.color : '#2a7d8a');
    },
    get configChallenge() { return this.configSc ? CONFIG_CHALLENGES[this.configSc.id] : null; },
    get configChoices() { return this.configChallenge ? this.configChallenge.choices : []; },
    configState(value) {
      if (!this.cfgVerdict) return this.configPick === value ? 'on' : '';
      const correct = this.configChallenge && this.configChallenge.correct;
      return value === correct ? 'correct' : (value === this.configPick ? 'wrong' : '');
    },
    commitConfig() {
      const sc=this.configSc, challenge=this.configChallenge;
      if (!challenge || !this.configPick) return;
      const ok=this.cfgZ===sc.z && this.configPick===challenge.correct;
      this.cfgVerdict = this.verdict(sc, ok,
        ok ? `${this.cfgEl.name}: ${this.cfgShorthand}. ${this.cfgIsException ? 'This is the observed ground-state exception to the simple Aufbau prediction.' : 'This ground-state configuration follows the simple filling prediction.'}` : (this.cfgZ!==sc.z ? `Use the mission element (Z = ${sc.z}) before submitting.` : 'Compare the subshell occupancies in the choices and select the ground-state configuration.'));
    },
    get famEl() { return ELEMENTS.find(e => e.z === this.famZ); },
    get famValence() { return valenceElectrons(this.famZ); },
    familyState(name) { if (!this.famVerdict) return this.familyPick===name?'on':''; return name===this.familySc.correct?'correct':(name===this.familyPick?'wrong':''); },
    commitFamily() {
      const sc=this.familySc, ok=this.familyPick===sc.correct;
      this.famVerdict = this.verdict(sc, ok, ok ? `${this.famEl.name} is in ${sc.correct}; its valence-electron pattern is consistent with that group.` : `${this.famEl.name} has ${this.famValence} main-group valence electrons. Use that pattern to choose its group.`);
    },
    commitH1() {
      if (this.h1Verdict && this.h1Verdict.tone === 'success') return;
      const sc=SCENARIOS.find(s=>s.id==='h1-photon'), val=parseFloat(this.h1EnergyInput), line=this.selectedLine;
      const target=line ? line.energy / EV_J : NaN;
      const ok=!!line && isFinite(val) && outcomeBand(val,target,HONORS_BANDS).withinSpec;
      this.h1Verdict = this.practiceVerdict(sc, ok, ok ? `The selected photon carries ${fmt(target,3)} eV.` : 'Convert the verified energy in joules to electronvolts by dividing by 1.602 × 10^-19 J/eV.', line ? line.color : '#7651a8');
    },
    h2State(v) { if (!this.h2Verdict) return this.h2Pick===v?'on':''; const correct=this.cfgIsException?'exception':'standard'; return v===correct?'correct':(v===this.h2Pick?'wrong':''); },
    commitH2() {
      if (this.h2Verdict && this.h2Verdict.tone === 'success') return;
      const sc=SCENARIOS.find(s=>s.id==='h2-orbital'), correct=this.cfgIsException?'exception':'standard', ok=this.h2Pick===correct;
      this.h2Verdict = this.practiceVerdict(sc, ok, ok ? `${this.cfgEl.name} ${correct==='exception'?'has a listed observed exception':'follows the simple Aufbau prediction in this activity'}.` : 'Compare the simple Aufbau prediction with the observed ground-state configuration.');
    },
    get capUnlocked() { return this.gOverall() === 1; },
    get capCorrect() { return SCENARIOS.find(s=>s.id==='cap-glowroom').correct; },
    capState(v) { if (!this.modeVerdict.capstone) return this.capPick===v?'on':''; return v===this.capCorrect?'correct':(v===this.capPick?'wrong':''); },
    commitCap() {
      if (!this.capPick) return;
      const sc=SCENARIOS.find(s=>s.id==='cap-glowroom'), ok=this.capPick===this.capCorrect;
      this.verdict(sc, ok, ok ? 'The spectrum is consistent with neon, but the cylinder is unlabeled. Return it for verified identification before use.' : 'The spectral evidence supports a likely identity, but it does not replace verified cylinder identification.', '#2f8f5b');
    },
    seCaption(se) {
      if (this.gMastered(se.id)) return 'Mastered';
      const sk = this.g_skills[se.id];
      const def = this.g_skillDefs.find(d => d.id === se.id) || {};
      return `${sk ? sk.run : 0} of ${def.target || 3} correct in a row`;
    },
    get coreSkills() { return SE.filter(se=>!se.honors); },
    get teksMasteredCount() { return this.coreSkills.filter(se=>this.gMastered(se.id)).length; },
    get activeBrief() { return this.activeScenario[this.mode] || ({models:this.modelsSc,build:this.buildSc,mass:this.massSc,spectra:this.spectraSc,config:this.configSc,capstone:SCENARIOS.find(s=>s.id==='cap-glowroom')})[this.mode] || null; },
    get activeVerdict() { return this.modeVerdict[this.mode] || null; },
    get activeTone() { const t=this.activeVerdict&&this.activeVerdict.tone; return t==='success'?'safe':(t?'danger':'standby'); },
    get activeArtId() { return (this.activeBrief&&this.activeBrief.id)||'a-crt'; },
    get activeStationName() { return (this.activeBrief&&this.activeBrief.system)||'Atomic structure'; },
    get activeStateLabel() { return (this.activeVerdict&&this.activeVerdict.state)||''; },
    get activeOutcomeText() {
      const v=this.activeVerdict, b=this.activeBrief;
      if (v) return v.detail || v.headline;
      if (!b) return 'Choose an activity from the tabs above.';
      if (this.mode==='models') return 'Compare the observation with what each historical model could explain.';
      if (this.mode==='build') return 'Use atomic number, mass number, and charge to set the particle counts.';
      if (this.mode==='mass') return 'Multiply each isotope mass by its fractional abundance, then add the contributions.';
      if (this.mode==='spectra') return 'Convert the selected wavelength to meters, then use E = hc/λ.';
      if (this.mode==='config' && b.skill==='f') return 'Use the displayed valence-electron count as evidence for the periodic-table group.';
      if (this.mode==='config') return 'Choose the ground-state configuration; the full representation appears after a correct response.';
      if (this.mode==='capstone') return 'Use the spectrum together with the cylinder identification status to choose the justified action.';
      return b.goal;
    },
    get activeReference() {
      if(this.mode==='models') return [{k:'Method',v:'observation → model'},{k:'History',v:'choose the model asked for in this sequence'}];
      if(this.mode==='build') return [{k:'Identity',v:'atomic number = protons'},{k:'Charge',v:'protons − electrons'}];
      if(this.mode==='spectra') return [{k:'Equation',v:'E = hc/λ'},{k:'Unit',v:'convert nm to m'}];
      if(this.mode==='mass') return [{k:'Average',v:'Σ(mass × fraction)'},{k:'Data',v:'use the reference isotope abundances'}];
      if(this.mode==='config') return [{k:'Ground state',v:'choose the configuration before the solution is shown'},{k:'Aufbau',v:'simple filling has listed observed exceptions'}];
      if(this.mode==='capstone') return [{k:'Evidence',v:'spectrum supports identity'},{k:'Use',v:'verified label is still required'}];
      return [{k:'Progress',v:'correct responses add one practice marker'},{k:'Round',v:'six markers complete one practice round'}];
    },
    scArt(id) {
      if (id && id.startsWith('e-') && !(this.cfgVerdict && this.cfgVerdict.tone === 'success')) return configurationChallengeArt(id);
      return refineSceneArt(sceneArt(id), id);
    },
    get rackReadings() { return [{key:'jobs',label:'Tasks',raw:`${this.rack.length}/6`,pct:this.rack.length/6*100,color:'var(--accent)'},{key:'core',label:'Core',raw:`${this.teksMasteredCount}/6`,pct:this.gOverall()*100,color:'var(--accent-700)'},{key:'day',label:'Round',raw:`${this.shiftDay}`,pct:Math.min(100,this.shiftDay/3*100),color:'var(--success)'},{key:'log',label:'Log',raw:`${this.worldLog.length}`,pct:Math.min(100,this.worldLog.length/6*100),color:'var(--warn)'}]; },
    rackSvg() { return this.rack.map((r,i)=>`<g transform="translate(${8+i*36},4)"><title>${r.label}</title><rect x="7" y="8" width="18" height="48" rx="8" fill="${r.color}" opacity=".85"/><rect x="12" y="2" width="8" height="8" rx="2" fill="#dcebee"/></g>`).join(''); },

    // ======================= C.6(A/B) BUILD =======================
    get buildElements() { return ELEMENTS.filter(e => BUILD_SET.includes(e.z)); },
    get el() { return ELEMENTS.find(e => e.z === this.elZ); },
    onElement() {
      if (!this.el) return;
      const mass = ATOMIC_MASS[this.el.sym];
      this.nNeutrons = Math.max(0, Math.round(mass) - this.elZ);
      this.nElectrons = this.elZ;
    },
    stepNeutrons(d) { this.nNeutrons = Math.max(0, Math.min(this.elZ + 12, this.nNeutrons + d)); },
    stepElectrons(d) { this.nElectrons = Math.max(1, Math.min(this.elZ + 4, this.nElectrons + d)); },
    get massNumber() { return this.elZ + this.nNeutrons; },
    get charge() { return this.elZ - this.nElectrons; },
    get chargeStr() {
      const c = this.charge;
      if (c === 0) return 'neutral atom';
      return `${Math.abs(c)}${c > 0 ? '+' : '-'} ${c > 0 ? 'cation' : 'anion'}`;
    },
    get ionNotation() {
      const c = this.charge;
      if (c === 0) return '';
      return `${Math.abs(c) > 1 ? Math.abs(c) : ''}${c > 0 ? '+' : '-'}`;
    },
    get isotopeName() { return `${this.el.name}-${this.massNumber}`; },
    get massRef() { return ATOMIC_MASS[this.el.sym]; },
    get buildShells() { return shellOccupancy(this.nElectrons); },
    bohrSvg() {
      const c = 150; let s = '';
      this.buildShells.forEach((count, i) => {
        const r = 38 + i * 26;
        s += `<circle cx="${c}" cy="${c}" r="${r}" fill="none" stroke="#cfdbe0" stroke-width="1.2"></circle>`;
        for (let k = 0; k < count; k++) {
          const ang = -Math.PI / 2 + k * 2 * Math.PI / count;
          const x = (c + r * Math.cos(ang)).toFixed(1), y = (c + r * Math.sin(ang)).toFixed(1);
          s += `<circle cx="${x}" cy="${y}" r="5.5" fill="#2a7d8a"></circle>`;
        }
      });
      return s;
    },

    // ======================= C.6(D) AVERAGE MASS =======================
    get iso() { return ISOTOPE_ELEMENTS.find(e => e.sym === this.isoKey); },
    resetNatural() { const o = {}; this.iso.isotopes.forEach(m => (o[m.a] = m.abundance)); this.isoAbund = o; },
    get abundSum() { return this.iso.isotopes.reduce((s, m) => s + (+this.isoAbund[m.a] || 0), 0); },
    get isoRows() {
      const sum = this.abundSum;
      return this.iso.isotopes.map(m => {
        const ab = +this.isoAbund[m.a] || 0, frac = sum > 0 ? ab / sum : 0;
        return { ...m, ab, frac, contrib: m.mass * frac };
      });
    },
    get avgMass() {
      return averageAtomicMass(this.iso.isotopes.map(m => ({ mass: m.mass, abundance: +this.isoAbund[m.a] || 0 })));
    },
    get avgError() { return Math.abs(this.avgMass - this.iso.accepted); },
    get isoMassAxis() {
      const ms = this.iso.isotopes.map(m => m.mass);
      return { lo: Math.floor(Math.min(...ms)) - 1, hi: Math.ceil(Math.max(...ms)) + 1 };
    },
    massLineSvg() {
      const { lo, hi } = this.isoMassAxis;
      const x = v => 40 + (v - lo) / (hi - lo) * 520;
      let s = `<line x1="40" y1="60" x2="560" y2="60" stroke="#aebfc6" stroke-width="1.5"></line>`;
      for (let v = lo; v <= hi; v++) {
        s += `<line x1="${x(v).toFixed(1)}" y1="56" x2="${x(v).toFixed(1)}" y2="64" stroke="#aebfc6"></line>`;
        s += `<text x="${x(v).toFixed(1)}" y="80" font-size="9" fill="#687a82" text-anchor="middle" font-family="JetBrains Mono">${v}</text>`;
      }
      this.isoRows.forEach(m => {
        const px = x(m.mass).toFixed(1), h = 10 + m.frac * 34, ty = (60 - h).toFixed(1);
        s += `<line x1="${px}" y1="60" x2="${px}" y2="${ty}" stroke="#2a7d8a" stroke-width="2"></line>`;
        s += `<circle cx="${px}" cy="${ty}" r="4" fill="#2a7d8a"></circle>`;
        s += `<text x="${px}" y="${(60 - h - 7).toFixed(1)}" font-size="9" fill="#1d5b66" text-anchor="middle" font-family="JetBrains Mono">${m.a}</text>`;
      });
      if (this.modeVerdict.mass && this.modeVerdict.mass.tone === 'success') {
        const ax = x(this.avgMass).toFixed(1);
        s += `<line x1="${ax}" y1="20" x2="${ax}" y2="68" stroke="#bf4a30" stroke-width="1.6" stroke-dasharray="4 3"></line>`;
        s += `<polygon points="${ax - 5},20 ${+ax + 5},20 ${ax},28" fill="#bf4a30"></polygon>`;
        s += `<text x="${ax}" y="15" font-size="9" fill="#bf4a30" text-anchor="middle" font-family="JetBrains Mono">avg ${this.avgMass.toFixed(2)}</text>`;
      }
      return s;
    },

    // ======================= C.6(C) SPECTRA =======================
    rgb(nm) { return wavelengthToRGB(nm); },
    nmToX(nm) { return 30 + (Math.max(380, Math.min(700, nm)) - 380) / 320 * 580; },
    get spec() { return SPECTRA.find(s => s.key === this.specKey); },
    get specAxis() {
      return {
        wlLo: 380, wlHi: 700,
        vLo: frequencyOf(700e-9), vHi: frequencyOf(380e-9),
        eLo: photonEnergy({ wavelength: 700e-9 }),
        eHi: photonEnergy({ wavelength: 380e-9 })
      };
    },
    get lines() {
      let raw;
      if (this.spec.computed) raw = [3, 4, 5, 6].map(n => ({ n, wl: rydbergWavelength(2, n) * 1e9 }));
      else raw = this.spec.lines.map(wl => ({ wl }));
      return raw.map(o => ({
        ...o, color: wavelengthToRGB(o.wl),
        freq: frequencyOf(o.wl * 1e-9), energy: photonEnergy({ wavelength: o.wl * 1e-9 })
      }));
    },
    get selectedLine() { return this.selLine != null ? this.lines[this.selLine] : null; },
    spectrumSvg() {
      let s = '';
      for (let nm = 380; nm <= 700; nm += 4) {
        const x = this.nmToX(nm), w = (this.nmToX(nm + 4) - x + 0.6).toFixed(1);
        s += `<rect x="${x.toFixed(1)}" y="8" width="${w}" height="24" fill="${wavelengthToRGB(nm)}"></rect>`;
      }
      s += `<rect x="30" y="46" width="580" height="40" fill="#0b0f12"></rect>`;
      this.lines.forEach((ln, i) => {
        const x = this.nmToX(ln.wl), sel = this.selLine === i;
        s += `<rect x="${(x - (sel ? 1.6 : 1)).toFixed(1)}" y="46" width="${sel ? 3.2 : 2}" height="40" fill="${ln.color}"></rect>`;
        if (sel) s += `<polygon points="${(x - 5).toFixed(1)},90 ${(x + 5).toFixed(1)},90 ${x.toFixed(1)},96" fill="#bf4a30"></polygon>`;
      });
      for (let nm = 400; nm <= 700; nm += 50) {
        const x = this.nmToX(nm).toFixed(1);
        s += `<line x1="${x}" y1="86" x2="${x}" y2="92" stroke="#aebfc6"></line>`;
        s += `<text x="${x}" y="106" font-size="9" fill="#687a82" text-anchor="middle" font-family="JetBrains Mono">${nm}</text>`;
      }
      return s;
    },
    energyLevelSvg() {
      const top = 22, bot = 205, yOf = n => top + (1 / (n * n)) * (bot - top);
      let s = '';
      for (let n = 1; n <= 6; n++) {
        const y = yOf(n).toFixed(1);
        s += `<line x1="70" y1="${y}" x2="300" y2="${y}" stroke="#aebfc6" stroke-width="1.2"></line>`;
        s += `<text x="58" y="${(+y + 3).toFixed(1)}" font-size="10" fill="#687a82" text-anchor="end" font-family="JetBrains Mono">n=${n}</text>`;
      }
      [3, 4, 5, 6].forEach((n, i) => {
        const x = 120 + i * 42, y1 = yOf(n).toFixed(1), y2 = yOf(2).toFixed(1);
        const col = wavelengthToRGB(rydbergWavelength(2, n) * 1e9);
        s += `<line x1="${x}" y1="${y1}" x2="${x}" y2="${y2}" stroke="${col}" stroke-width="2.6" marker-end="url(#arrh)"></line>`;
      });
      return s;
    },

    // ======================= C.6(E)/C.5(B) ELECTRONS =======================
    get cfgEl() { return ELEMENTS.find(e => e.z === this.cfgZ); },
    get cfgElements() { return ELEMENTS.filter(e => BUILD_SET.includes(e.z)); },
    get cfgException() { return CONFIG_EXCEPTIONS.find(x => x.z === this.cfgZ) || null; },
    get cfgConfig() { return observedConfiguration(this.cfgZ); },
    get cfgString() { return formatConfig(this.cfgConfig); },
    // Simple Aufbau prediction used only for comparison with listed exceptions.
    shorthandOf(z) {
      const core = NOBLE_CORES.filter(n => n.z < z).pop();
      const full = electronConfiguration(z);
      if (!core) return formatConfig(full);
      const beyond = full.slice(electronConfiguration(core.z).length);
      return `[${core.sym}] ${formatConfig(beyond)}`;
    },
    get cfgShorthand() { return this.cfgException ? this.cfgException.actual : this.shorthandOf(this.cfgZ); },
    get valence() { return valenceElectrons(this.cfgZ); },
    get cfgLastL() { return this.cfgConfig[this.cfgConfig.length - 1].l; },
    get isMainGroup() { return this.cfgLastL === 's' || this.cfgLastL === 'p'; },
    get orbitalDiagram() {
      return this.cfgConfig.map(sub => {
        const orb = ORBITALS[sub.l]; let e = sub.e; const boxes = new Array(orb).fill(0);
        for (let i = 0; i < orb && e > 0; i++) { boxes[i] = 1; e--; }
        for (let i = 0; i < orb && e > 0; i++) { boxes[i] = 2; e--; }
        return { label: `${sub.n}${sub.l}`, boxes };
      });
    },
    arrows(state) { return state === 2 ? '↑↓' : state === 1 ? '↑' : ''; },
    lewisSvg() {
      const cx = 70, cy = 52, v = this.valence;
      const slots = {
        top: [[cx - 9, cy - 30], [cx + 9, cy - 30]],
        right: [[cx + 34, cy - 9], [cx + 34, cy + 9]],
        bottom: [[cx - 9, cy + 30], [cx + 9, cy + 30]],
        left: [[cx - 34, cy - 9], [cx - 34, cy + 9]]
      };
      const order = ['top', 'right', 'bottom', 'left'];
      const placed = [];
      for (let pass = 0; pass < 2; pass++) for (const side of order) { if (placed.length < v) placed.push(slots[side][pass]); }
      return placed.map(p => `<circle cx="${p[0]}" cy="${p[1]}" r="3.5" fill="#1d5b66"></circle>`).join('');
    },
    get family() {
      const z = this.cfgZ, v = this.valence;
      if (z === 1) return { name: 'Hydrogen (a nonmetal)', charge: '+1 or -1', behavior: 'Hydrogen has 1 valence electron and can participate in bonding in several ways.' };
      if (z === 2) return { name: 'Noble gas (Group 18)', charge: 'none common', behavior: 'Helium has a filled first shell and is very unreactive under ordinary conditions.' };
      if (!this.isMainGroup) return { name: 'Transition metal', charge: 'varies', behavior: 'Common ion charges vary; many transition metals form ions with more than one charge.' };
      const map = {
        1: { name: 'Alkali metal (Group 1)', charge: '+1', behavior: 'Often forms +1 ions and is generally reactive.' },
        2: { name: 'Alkaline earth metal (Group 2)', charge: '+2', behavior: 'Often forms +2 ions.' },
        3: { name: 'Boron group (Group 13)', charge: '+3', behavior: 'Often forms +3 ions or covalent bonds.' },
        4: { name: 'Carbon group (Group 14)', charge: 'varies', behavior: 'Often forms covalent bonds; simple monatomic ±4 ions are uncommon.' },
        5: { name: 'Nitrogen group (Group 15)', charge: '-3 common', behavior: 'Can form -3 ions in ionic compounds and also forms many covalent bonds.' },
        6: { name: 'Chalcogens (Group 16)', charge: '-2 common', behavior: 'Often forms -2 ions in ionic compounds and also forms covalent bonds.' },
        7: { name: 'Halogen (Group 17)', charge: '-1', behavior: 'Often forms -1 ions in ionic compounds; halogens are reactive nonmetals.' },
        8: { name: 'Noble gas (Group 18)', charge: 'none common', behavior: 'A filled valence shell is associated with very low reactivity under ordinary conditions.' }
      };
      return map[v] || { name: 'Main-group element', charge: 'varies', behavior: '' };
    },
    get cfgIsException() { return !!this.cfgException; },
    pickV(n) { if (!this.vChecked) this.vQuiz = n; },
    checkV() { if (this.vQuiz !== null) this.vChecked = true; },
    vState(n) {
      if (!this.vChecked) return this.vQuiz === n ? 'on' : '';
      if (n === this.valence) return 'correct';
      if (n === this.vQuiz) return 'wrong';
      return '';
    },
    get vCorrect() { return this.vQuiz === this.valence; }
  };
}
