from pathlib import Path


def replace_once(text, old, new, label):
    count = text.count(old)
    if count != 1:
        raise RuntimeError(f"{label}: expected exactly 1 match, found {count}")
    return text.replace(old, new, 1)


def replace_n(text, old, new, expected, label):
    count = text.count(old)
    if count != expected:
        raise RuntimeError(f"{label}: expected {expected} matches, found {count}")
    return text.replace(old, new)


main_path = Path('units/02-atomic-structure/js/main.js')
index_path = Path('units/02-atomic-structure/index.html')
main = main_path.read_text(encoding='utf-8')
index = index_path.read_text(encoding='utf-8')

# ---------------- main.js: make missions assessable rather than self-answering ----------------
old = "const ORBITALS = { s: 1, p: 3, d: 5, f: 7 };\nconst skills = ["
new = """const ORBITALS = { s: 1, p: 3, d: 5, f: 7 };
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

const skills = ["""
main = replace_once(main, old, new, 'insert configuration challenge data')

main = replace_once(main,
"  ['THE TUBING INVOICE · THE BEAM BALANCES AT 10.81', 'BORON ISOTOPES · WEIGHTED AVERAGE 10.81 u'],",
"  ['THE TUBING INVOICE · THE BEAM BALANCES AT 10.81', 'BORON ISOTOPES · CALCULATE THE WEIGHTED AVERAGE'],",
'mass art caption boron')
main = replace_once(main,
"  ['THE COPPER SPOOL · WHAT THE SCRAP BUYER PAYS FOR', 'COPPER ISOTOPES · WEIGHTED AVERAGE 63.55 u'],",
"  ['THE COPPER SPOOL · WHAT THE SCRAP BUYER PAYS FOR', 'COPPER ISOTOPES · CALCULATE THE WEIGHTED AVERAGE'],",
'mass art caption copper')
main = replace_once(main,
"  ['THE POOL TABLETS · A THREE-QUARTER MIX', 'CHLORINE ISOTOPES · 75.77% Cl-35'],",
"  ['THE POOL TABLETS · A THREE-QUARTER MIX', 'CHLORINE ISOTOPES · CALCULATE THE WEIGHTED AVERAGE'],",
'mass art caption chlorine')
main = replace_once(main,
"  ['SEALED · 10 YEARS', 'GROUP 18'], ['FAMILY CALL', 'GROUP PATTERN'], ['inert', 'very unreactive'], ['seal it in', 'low reactivity'],",
"  ['SEALED · 10 YEARS', 'LONG SERVICE RECORD'], ['FAMILY CALL', 'GROUP PATTERN'], ['inert', 'very unreactive'], ['seal it in', 'low reactivity'],",
'argon art no group answer')
main = replace_once(main,
"  ['THE UNLABELLED CYLINDER · NAME IT, THEN CALL IT', 'UNLABELED CYLINDER · EVIDENCE IS NOT A VERIFIED LABEL'],",
"  ['THE UNLABELLED CYLINDER · NAME IT, THEN CALL IT', 'UNLABELED CYLINDER · SPECTRUM + IDENTIFICATION STATUS'],",
'capstone neutral caption')
main = replace_once(main,
"  ['call it in', 'mark hazardous'], ['on the evidence', 'verify before use']",
"  ['call it in', 'mark hazardous'], ['on the evidence', 'choose the justified action']",
'capstone no answer hint')

old = """function refineSceneArt(svg) {
  return ART_COPY.reduce((out, [from, to]) => out.split(from).join(to), svg);
}
"""
new = """// Scene-specific redactions keep the illustration useful without printing the answer.
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
"""
main = replace_once(main, old, new, 'scene-specific answer redaction')

main = replace_once(main,
"    modelPick: null, familyPick: null, massInput: '', specEnergyInput: '', h1EnergyInput: '', h2Pick: null, capPick: null,",
"    modelPick: null, familyPick: null, configPick: null, massInput: '', specEnergyInput: '', h1EnergyInput: '', h2Pick: null, capPick: null,",
'config answer state')
main = replace_once(main,
"    cfgVerdict: null, famVerdict: null, h2Verdict: null,",
"    cfgVerdict: null, famVerdict: null, h1Verdict: null, h2Verdict: null,",
'honors verdict state')
main = replace_once(main,
"      this.$watch('specKey', () => { this.selLine = null; });\n      this.$watch('cfgZ', () => { this.vQuiz = null; this.vChecked = false; });",
"      this.$watch('specKey', () => { this.selLine = null; this.specEnergyInput = ''; this.h1EnergyInput = ''; this.h1Verdict = null; });\n      this.$watch('cfgZ', () => { this.vQuiz = null; this.vChecked = false; this.configPick = null; this.cfgVerdict = null; this.h2Pick = null; this.h2Verdict = null; });",
'watcher resets')
main = replace_once(main,
"      this.cfgVerdict = null; this.famVerdict = null; this.h2Verdict = null; this.h2Pick = null;",
"      this.cfgVerdict = null; this.famVerdict = null; this.h1Verdict = null; this.h2Verdict = null; this.configPick = null; this.h2Pick = null; this.h1EnergyInput = '';",
'reset verdicts')

old = """    nextModels() { this.modelsSc = this.nextScenario('a'); this.modelPick = null; this.focusScenario('models', this.modelsSc); },
    nextBuild() {
      this.buildSc = this.nextScenario('b'); this.elZ = this.buildSc.z; this.onElement(); this.nNeutrons = this.buildSc.n; this.nElectrons = this.buildSc.e; this.focusScenario('build', this.buildSc);
    },
    nextMass() { this.massSc = this.nextScenario('d'); this.isoKey = this.massSc.iso; this.resetNatural(); this.massInput = ''; this.focusScenario('mass', this.massSc); },
    nextSpectra() { this.spectraSc = this.nextScenario('c'); this.specKey = this.spectraSc.spec; this.selLine = 0; this.specEnergyInput = ''; this.focusScenario('spectra', this.spectraSc); },
    nextConfig() { this.configSc = this.nextScenario('e'); this.cfgZ = this.configSc.z; this.vQuiz = null; this.vChecked = false; this.cfgVerdict = null; this.focusScenario('config', this.configSc); },
    nextFamily() { this.familySc = this.nextScenario('f'); this.famZ = this.familySc.z; this.familyPick = null; this.famVerdict = null; this.focusScenario('config', this.familySc); },
    focusScenario(mode, sc) { this.activeScenario[mode] = sc; delete this.modeVerdict[mode]; },
"""
new = """    nextModels() { this.modelsSc = this.nextScenario('a'); this.modelPick = null; this.focusScenario('models', this.modelsSc); },
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
"""
main = replace_once(main, old, new, 'mission initialization and focus state')

old = """    verdict(sc, good, detail, color) {
      const v = good
        ? { tone:'success', state:'CORRECT', headline:'The evidence supports this answer', detail }
        : { tone:'fail', state:'RECHECK', headline:'Review the evidence and try again', detail };
      this.gRecord(sc.skill, good, true);
      this.modeVerdict[sc.stage] = v;
      this.activeScenario[sc.stage] = sc;
      this.recordWorld({ sc, good, detail, color });
      return v;
    },
"""
new = """    verdict(sc, good, detail, color) {
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
"""
main = replace_once(main, old, new, 'separate core and honors verdicts')

main = replace_once(main,
"      this.verdict(sc, ok, ok ? `${this.isotopeName} has the requested proton, neutron, and electron counts.` : `Target: Z = ${sc.z}, ${sc.n} neutrons, and ${sc.e} electrons.`);",
"      this.verdict(sc, ok, ok ? `${this.isotopeName} has the requested proton, neutron, and electron counts.` : 'Recheck the element, mass number, and charge in the mission. Use A = protons + neutrons and charge = protons − electrons.');",
'build feedback without answer')

old = """    commitConfig() {
      const sc=this.configSc, ok=this.cfgZ===sc.z;
      this.cfgVerdict = this.verdict(sc, ok,
        ok ? `${this.cfgEl.name}: ${this.cfgShorthand}. ${this.cfgIsException ? 'This is the observed ground-state exception to the simple Aufbau prediction.' : 'This ground-state configuration follows the simple filling prediction.'}` : `Set the electron tool to Z = ${sc.z} before checking the configuration.`);
    },
"""
new = """    get configChallenge() { return this.configSc ? CONFIG_CHALLENGES[this.configSc.id] : null; },
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
"""
main = replace_once(main, old, new, 'real configuration question')

old = """    commitH1() {
      const sc=SCENARIOS.find(s=>s.id==='h1-photon'), val=parseFloat(this.h1EnergyInput), line=this.selectedLine;
      const ok=!!line && isFinite(val) && outcomeBand(val,line.energy,HONORS_BANDS).withinSpec;
      this.verdict(sc, ok, ok ? `The selected photon carries ${fmt(line.energy,3)} J.` : 'Select a line and calculate E = hc/λ after converting nm to m.', line ? line.color : '#7651a8');
    },
    h2State(v) { if (!this.h2Verdict) return this.h2Pick===v?'on':''; const correct=this.cfgIsException?'exception':'standard'; return v===correct?'correct':(v===this.h2Pick?'wrong':''); },
    commitH2() {
      const sc=SCENARIOS.find(s=>s.id==='h2-orbital'), correct=this.cfgIsException?'exception':'standard', ok=this.h2Pick===correct;
      this.h2Verdict = this.verdict(sc, ok, ok ? `${this.cfgEl.name} ${correct==='exception'?'has a listed observed exception':'follows the simple Aufbau prediction in this activity'}.` : 'Compare the displayed simple prediction with the observed ground-state configuration.');
    },
"""
new = """    commitH1() {
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
"""
main = replace_once(main, old, new, 'honors questions no longer overwrite core mission')

old = """    get activeOutcomeText() { const v=this.activeVerdict,b=this.activeBrief; return (v&&(v.detail||v.headline))||(b&&(b.why||b.goal))||'Choose an activity from the tabs above.'; },
"""
new = """    get activeOutcomeText() {
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
"""
main = replace_once(main, old, new, 'neutral pre-submit mission hint')
main = replace_once(main,
"      if(this.mode==='config') return [{k:'Ground state',v:'observed configuration is shown'},{k:'Aufbau',v:'simple prediction has listed exceptions'}];",
"      if(this.mode==='config') return [{k:'Ground state',v:'choose the configuration before the solution is shown'},{k:'Aufbau',v:'simple filling has listed observed exceptions'}];",
'config reference')
main = replace_once(main,
"    scArt(id) { return refineSceneArt(sceneArt(id)); },",
"    scArt(id) {\n      if (id && id.startsWith('e-') && !(this.cfgVerdict && this.cfgVerdict.tone === 'success')) return configurationChallengeArt(id);\n      return refineSceneArt(sceneArt(id), id);\n    },",
'configuration question art')

old = """      const ax = x(this.avgMass).toFixed(1);
      s += `<line x1="${ax}" y1="20" x2="${ax}" y2="68" stroke="#bf4a30" stroke-width="1.6" stroke-dasharray="4 3"></line>`;
      s += `<polygon points="${ax - 5},20 ${+ax + 5},20 ${ax},28" fill="#bf4a30"></polygon>`;
      s += `<text x="${ax}" y="15" font-size="9" fill="#bf4a30" text-anchor="middle" font-family="JetBrains Mono">avg ${this.avgMass.toFixed(2)}</text>`;
      return s;
"""
new = """      if (this.modeVerdict.mass && this.modeVerdict.mass.tone === 'success') {
        const ax = x(this.avgMass).toFixed(1);
        s += `<line x1="${ax}" y1="20" x2="${ax}" y2="68" stroke="#bf4a30" stroke-width="1.6" stroke-dasharray="4 3"></line>`;
        s += `<polygon points="${ax - 5},20 ${+ax + 5},20 ${ax},28" fill="#bf4a30"></polygon>`;
        s += `<text x="${ax}" y="15" font-size="9" fill="#bf4a30" text-anchor="middle" font-family="JetBrains Mono">avg ${this.avgMass.toFixed(2)}</text>`;
      }
      return s;
"""
main = replace_once(main, old, new, 'hide dynamic average until correct')

# ---------------- index.html: align visible question, answer controls, and reveal timing ----------------
index = replace_once(index,
'<details class="lesson-reference" style="margin-top: var(--s-4);"><summary>Weighted sum, isotope by isotope</summary>',
'<details class="lesson-reference" style="margin-top: var(--s-4);" x-show="modeVerdict.mass && modeVerdict.mass.tone===\'success\'"><summary>Worked sum, isotope by isotope</summary>',
'hide worked mass sum')
index = replace_once(index,
'<div class="stat-row has-dials" style="margin-top: var(--s-4);" x-show="massInput !== \'\' || modeVerdict.mass">',
'<div class="stat-row has-dials" style="margin-top: var(--s-4);" x-show="modeVerdict.mass && modeVerdict.mass.tone===\'success\'">',
'hide mass reference target')
index = replace_once(index,
'<div class="note note-info" style="margin-top: var(--s-3);" x-show="modeVerdict.mass && avgError < 0.05">',
'<div class="note note-info" style="margin-top: var(--s-3);" x-show="modeVerdict.mass && modeVerdict.mass.tone===\'success\' && avgError < 0.05">',
'hide mass confirmation until correct')

energy_stat = '<div class="stat"><div class="k">photon energy E</div><div class="v" style="font-size:var(--fs-lg)" x-prose="selectedLine ? fmt(selectedLine.energy,3)+\' J\' : \'\'"></div><div x-gauge="{ kind:\'span\', value: selectedLine ? selectedLine.energy : null, min: specAxis.eLo, max: specAxis.eHi, unit:\' J\', digits: 3, series: specKey, label:\'photon energy across the same strip\', tone:\'plum\' }"></div></div>'
energy_stat_new = '<div class="stat" x-show="modeVerdict.spectra && modeVerdict.spectra.tone===\'success\'"><div class="k">photon energy E</div><div class="v" style="font-size:var(--fs-lg)" x-prose="selectedLine ? fmt(selectedLine.energy,3)+\' J\' : \'\'"></div><div x-gauge="{ kind:\'span\', value: selectedLine ? selectedLine.energy : null, min: specAxis.eLo, max: specAxis.eHi, unit:\' J\', digits: 3, series: specKey, label:\'photon energy across the same strip\', tone:\'plum\' }"></div></div>'
index = replace_once(index, energy_stat, energy_stat_new, 'hide photon answer until correct')

# First honors block is spectra; second is configuration.
index = replace_once(index,
'          <div class="honors-block" x-show="honors">\n            <span class="honors-tag">Honors · E = hν quantization</span>',
'          <div class="honors-block" x-show="honors && modeVerdict.spectra && modeVerdict.spectra.tone===\'success\'">\n            <span class="honors-tag">Honors · convert photon energy to electronvolts</span>',
'spectra honors gate')
index = replace_once(index,
'            <p class="muted" style="font-size: var(--fs-sm); margin: var(--s-2) 0;">Energy, frequency, and wavelength are linked. Each spectral line corresponds to a characteristic photon energy associated with an allowed transition.</p>',
'            <p class="muted" style="font-size: var(--fs-sm); margin: var(--s-2) 0;">The core calculation gives energy in joules. Convert that verified value to electronvolts using 1 eV = 1.602 × 10^-19 J.</p>',
'spectra honors instructions')
index = replace_once(index,
'            <div class="eqn" style="margin: var(--s-2) 0;"><span x-tex.display="\'E = h\\\\nu = \\\\dfrac{hc}{\\\\lambda}\'"></span></div>',
'            <div class="eqn" style="margin: var(--s-2) 0;"><span x-tex.display="\'E_{eV} = \\\\dfrac{E_J}{1.602\\\\times10^{-19}}\'"></span></div>',
'spectra honors equation')
old_work = '            <div x-show="selectedLine" style="margin-top: var(--s-2);"><div class="step-line mono">λ = <span x-text="selectedLine ? selectedLine.wl.toFixed(1)+\' nm\' : \'\'"></span> = <span x-prose="selectedLine ? fmt(selectedLine.wl*1e-9,3)+\' m\' : \'\'"></span></div><div class="step-line mono">E = hc/λ = (6.626 × 10<sup>-34</sup> J·s)(2.998 × 10<sup>8</sup> m/s) ÷ <span x-prose="selectedLine ? fmt(selectedLine.wl*1e-9,3)+\' m\' : \'\'"></span> = <span class="calc" x-prose="selectedLine ? fmt(selectedLine.energy,3)+\' J\' : \'\'"></span> <span class="muted" x-prose="selectedLine ? \'(\' + fmt(selectedLine.energy/1.602e-19,3) + \' eV)\' : \'\'"></span></div></div>'
new_work = '            <div x-show="selectedLine" style="margin-top: var(--s-2);"><div class="step-line mono">Verified core result: <span class="calc" x-prose="selectedLine ? fmt(selectedLine.energy,3)+\' J\' : \'\'"></span></div><div class="step-line mono muted">Now convert J → eV; the eV result stays hidden until you submit.</div></div>'
index = replace_once(index, old_work, new_work, 'remove honors worked answer')
index = replace_once(index,
'            <div class="field field-260 mt-3"><label>Photon energy (J)</label><input type="number" step="any" x-model="h1EnergyInput" placeholder="E = hc/λ"></div>',
'            <div class="field field-260 mt-3"><label>Photon energy (eV)</label><input type="number" step="any" x-model="h1EnergyInput" placeholder="Convert the verified J value to eV"></div>',
'honors eV input')
old_call = '            <div class="row call-row mt-3"><button class="btn btn-honors" @click="commitH1()" :disabled="h1EnergyInput===\'\' || !selectedLine">Check photon calculation</button><span class="call-hint" x-show="(h1EnergyInput === \'\' || !selectedLine)" x-text="!selectedLine ? \'Select a line first.\' : \'Enter the photon energy.\'"></span></div>'
new_call = '            <div class="row call-row mt-3"><button class="btn btn-honors" @click="commitH1()" :disabled="h1EnergyInput===\'\' || !selectedLine || (h1Verdict && h1Verdict.tone===\'success\')">Check eV conversion</button><span class="call-hint" x-show="(h1EnergyInput === \'\' || !selectedLine)" x-text="!selectedLine ? \'Select a line first.\' : \'Enter the photon energy in eV.\'"></span></div>\n            <div x-show="h1Verdict" class="note" :class="h1Verdict && h1Verdict.tone===\'success\' ? \'note-ok\' : \'note-bad\'" style="margin-top: var(--s-3);"><strong x-text="h1Verdict ? h1Verdict.state : \'\'"></strong> <span x-prose="h1Verdict ? h1Verdict.detail : \'\'"></span></div>'
index = replace_once(index, old_call, new_call, 'honors inline feedback')

old_section = '          <section class="work-order"><span class="command-kicker">Current element</span><p x-prose="configSc.goal"></p><div class="row call-row"><button class="btn btn-accent" @click="commitConfig()">Check configuration</button><button class="btn" @click="nextConfig()">Next element</button></div></section>'
new_section = '          <section class="work-order" @focusin="focusScenario(\'config\', configSc)" @click="focusScenario(\'config\', configSc)"><span class="command-kicker">Configuration mission</span><p x-prose="configSc.goal"></p><div class="choice-grid choice-grid-wide config-choice-grid"><template x-for="opt in configChoices" :key="opt"><button class="choice" :data-state="configState(opt)" @click="configPick=opt"><span class="mono" x-config="opt"></span></button></template></div><div class="row call-row mt-3"><button class="btn btn-accent" @click="commitConfig()" :disabled="!configPick || (cfgVerdict && cfgVerdict.tone===\'success\')">Check configuration</button><button class="btn" @click="nextConfig()">Next element</button><span class="call-hint" x-show="!configPick">Choose a configuration first.</span></div></section>'
index = replace_once(index, old_section, new_section, 'configuration answer controls')
index = replace_once(index,
'            <div><div class="ref-title">Ground-state electron configuration</div>',
'            <div x-show="cfgVerdict && cfgVerdict.tone===\'success\'"><div class="ref-title">Ground-state electron configuration</div>',
'configuration reveal gate')
index = replace_once(index,
'          <div class="a-row" style="margin-top: var(--s-4); align-items: flex-start;">',
'          <div class="a-row" style="margin-top: var(--s-4); align-items: flex-start;" x-show="cfgVerdict && cfgVerdict.tone===\'success\' && (!isMainGroup || vChecked)">',
'Lewis/detail reveal after valence check')
index = replace_once(index,
'          <div x-show="isMainGroup" style="margin-top: var(--s-4);">',
'          <div x-show="cfgVerdict && cfgVerdict.tone===\'success\' && isMainGroup" style="margin-top: var(--s-4);">',
'valence check gate')

index = replace_once(index,
'          <div class="honors-block" x-show="honors">\n            <span class="honors-tag">Honors · orbital diagrams &amp; exceptions</span>',
'          <div class="honors-block" x-show="honors && cfgVerdict && cfgVerdict.tone===\'success\'">\n            <span class="honors-tag">Honors · orbital diagrams &amp; exceptions</span>\n            <p class="muted" style="font-size: var(--fs-sm); margin: var(--s-2) 0;">Classify the selected element before opening the comparison evidence below.</p>\n            <div x-show="h2Verdict">',
'config honors gate and evidence wrapper')
old_h2_row = '            <div class="row call-row mt-3"><button class="choice" :data-state="h2State(\'exception\')" @click="h2Pick=\'exception\'">Listed exception</button><button class="choice" :data-state="h2State(\'standard\')" @click="h2Pick=\'standard\'">Simple prediction holds</button><button class="btn btn-honors" @click="commitH2()" :disabled="!h2Pick">Check classification</button><span class="call-hint" x-show="!h2Pick">Choose one classification first.</span></div>'
new_h2_row = '            </div>\n            <div class="row call-row mt-3"><button class="choice" :data-state="h2State(\'exception\')" @click="h2Pick=\'exception\'">Listed exception</button><button class="choice" :data-state="h2State(\'standard\')" @click="h2Pick=\'standard\'">Simple prediction holds</button><button class="btn btn-honors" @click="commitH2()" :disabled="!h2Pick || (h2Verdict && h2Verdict.tone===\'success\')">Check classification</button><span class="call-hint" x-show="!h2Pick">Choose one classification first.</span></div>\n            <div x-show="h2Verdict" class="note" :class="h2Verdict && h2Verdict.tone===\'success\' ? \'note-ok\' : \'note-bad\'" style="margin-top: var(--s-3);"><strong x-text="h2Verdict ? h2Verdict.state : \'\'"></strong> <span x-prose="h2Verdict ? h2Verdict.detail : \'\'"></span></div>'
index = replace_once(index, old_h2_row, new_h2_row, 'honors classification first, evidence second')

index = replace_once(index,
'          <section class="work-order mt-4"><span class="command-kicker">Group pattern</span>',
'          <section class="work-order mt-4" @focusin="focusScenario(\'config\', familySc)" @click="focusScenario(\'config\', familySc)"><span class="command-kicker">Group pattern</span>',
'group mission focus')

# Cache-bust the corrected module so GitHub Pages/browser caches cannot serve the old mission logic.
index = replace_once(index,
"  import { createSim } from './js/main.js?v=u2-teks-progress-1';",
"  import { createSim } from './js/main.js?v=u2-mission-fix-2';",
'unit2 module cache bust')

# Small layout support for configuration answer choices on the existing responsive grid.
style_path = Path('units/02-atomic-structure/css/style.css')
style = style_path.read_text(encoding='utf-8')
marker = ".choice-grid-wide { grid-template-columns: 1fr; }\n"
addition = ".choice-grid-wide { grid-template-columns: 1fr; }\n.config-choice-grid .choice { min-height: 44px; text-align: center; }\n.config-choice-grid .mono { font-size: var(--fs-sm); }\n"
style = replace_once(style, marker, addition, 'configuration choice layout')

main_path.write_text(main, encoding='utf-8')
index_path.write_text(index, encoding='utf-8')
style_path.write_text(style, encoding='utf-8')

# Assertions aimed at the exact user-facing failures found in the audit.
assert "this.elZ = this.buildSc.z" not in main, 'Build mission still preloads target element'
assert "this.nNeutrons = this.buildSc.n" not in main, 'Build mission still preloads target neutrons'
assert "WEIGHTED AVERAGE 10.81" not in main, 'Boron answer still appears in refined mission caption'
assert "WEIGHTED AVERAGE 63.55" not in main, 'Copper answer still appears in refined mission caption'
assert "CHLORINE ISOTOPES · 75.77" not in main, 'Chlorine answer-like caption still present'
assert "observed configuration is shown" not in main, 'Config reference still says answer is shown before response'
assert "configChoices" in index and "configState(opt)" in index, 'Configuration mission lacks real answer controls'
assert "modeVerdict.mass.tone==='success'" in index, 'Mass worked solution is not gated'
assert "modeVerdict.spectra.tone==='success'" in index, 'Spectra energy answer is not gated'
assert "Photon energy (eV)" in index, 'Honors spectrum question was not converted to an extension'
assert "@focusin=\"focusScenario('config', familySc)\"" in index, 'Family mission cannot take over the mission display'

print('Unit 2 mission audit patch applied successfully.')
