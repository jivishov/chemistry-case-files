// model.js — Unit 2 domain data (Atomic Structure & Theory, TEKS C.6, C.5).
// Pure data. All atomic math lives in shared/js/chem.js.

// ---- C.6(A): development of atomic theory (reference timeline) ----
export const ATOMIC_MODELS = [
  { who: 'Dalton', year: 1803, model: 'Solid sphere',
    idea: 'Dalton proposed that matter is made of atoms and that atoms of the same element are alike.' },
  { who: 'Thomson', year: 1897, model: 'Plum pudding',
    idea: 'Cathode-ray evidence revealed negatively charged electrons, so atoms were not indivisible.' },
  { who: 'Rutherford', year: 1911, model: 'Nuclear atom',
    idea: 'Gold-foil scattering showed that most atomic mass and positive charge are concentrated in a tiny nucleus.' },
  { who: 'Bohr', year: 1913, model: 'Energy levels',
    idea: 'Bohr placed electrons in specific energy levels; transitions between levels helped explain hydrogen line spectra.' },
  { who: 'Heisenberg', year: 1927, model: 'Quantum model',
    idea: 'Quantum theory uses probability distributions rather than fixed electron paths, and the uncertainty principle limits simultaneous precision of position and momentum.' }
];

// Atomic numbers offered in the Build and Electron dropdowns. Kept light so the
// shell diagram stays readable (Z 1-20 plus a few transition metals and Br).
export const BUILD_SET = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 24, 26, 29, 30, 35];

// ---- C.6(D): representative isotopic compositions (mass in u, abundance in %) ----
export const ISOTOPE_ELEMENTS = [
  { sym: 'B', name: 'Boron', accepted: 10.81, isotopes: [
    { a: 10, mass: 10.0129, abundance: 19.90 }, { a: 11, mass: 11.0093, abundance: 80.10 } ] },
  { sym: 'Cl', name: 'Chlorine', accepted: 35.45, isotopes: [
    { a: 35, mass: 34.9689, abundance: 75.77 }, { a: 37, mass: 36.9659, abundance: 24.23 } ] },
  { sym: 'Cu', name: 'Copper', accepted: 63.55, isotopes: [
    { a: 63, mass: 62.9296, abundance: 69.15 }, { a: 65, mass: 64.9278, abundance: 30.85 } ] },
  { sym: 'Br', name: 'Bromine', accepted: 79.90, isotopes: [
    { a: 79, mass: 78.9183, abundance: 50.69 }, { a: 81, mass: 80.9163, abundance: 49.31 } ] },
  { sym: 'Mg', name: 'Magnesium', accepted: 24.305, isotopes: [
    { a: 24, mass: 23.9850, abundance: 78.99 }, { a: 25, mass: 24.9858, abundance: 10.00 },
    { a: 26, mass: 25.9826, abundance: 11.01 } ] }
];

// ---- C.6(C): visible emission lines (nm). Hydrogen is computed from Rydberg. ----
export const SPECTRA = [
  { key: 'H', name: 'Hydrogen', computed: true,
    note: 'Balmer series: transitions to n = 2 produce these four visible hydrogen lines.' },
  { key: 'He', name: 'Helium', lines: [447.1, 471.3, 492.2, 501.6, 587.6, 667.8],
    note: 'Helium was first identified in the solar spectrum. The 587.6 nm line is one strong visible helium line.' },
  { key: 'Ne', name: 'Neon', lines: [585.2, 588.2, 603.0, 607.4, 614.3, 626.6, 640.2, 650.7, 692.9, 703.2],
    note: 'Many strong red-orange lines contribute to the characteristic glow of a neon discharge.' },
  { key: 'Na', name: 'Sodium', lines: [568.8, 589.0, 589.6, 615.4],
    note: 'The strong 589.0 and 589.6 nm sodium doublet produces the familiar yellow sodium emission.' },
  { key: 'Hg', name: 'Mercury', lines: [404.7, 435.8, 546.1, 577.0, 579.1],
    note: 'Mercury has prominent visible emission lines; mercury discharge lamps also emit ultraviolet light used to excite fluorescent phosphors.' }
];

// ---- Honors: observed ground-state configuration exceptions ----
// The shared chemistry engine intentionally returns the simple Aufbau/Madelung
// prediction. Unit 2 applies the listed observed exceptions when an element is displayed.
export const CONFIG_EXCEPTIONS = [
  { sym: 'Cr', z: 24, actual: '[Ar] 4s1 3d5', why: 'Chromium is an observed exception: its ground state differs from the simple Aufbau prediction because the 4s and 3d subshells are close in energy.' },
  { sym: 'Cu', z: 29, actual: '[Ar] 4s1 3d10', why: 'Copper is an observed exception: its ground state differs from the simple Aufbau prediction because the 4s and 3d subshells are close in energy.' },
  { sym: 'Ag', z: 47, actual: '[Kr] 5s1 4d10', why: 'Silver is an observed exception to the simple Aufbau prediction.' },
  { sym: 'Au', z: 79, actual: '[Xe] 6s1 4f14 5d10', why: 'Gold is an observed exception to the simple Aufbau prediction.' }
];

// Noble-gas core atomic numbers, used to abbreviate configurations.
export const NOBLE_CORES = [
  { z: 2, sym: 'He' }, { z: 10, sym: 'Ne' }, { z: 18, sym: 'Ar' },
  { z: 36, sym: 'Kr' }, { z: 54, sym: 'Xe' }, { z: 86, sym: 'Rn' }
];

// Stable ids follow the intentional display order A, B, D, C, E, C.5(B).
export const SE = [
  { id: 'a', code: 'C.6(A)', mode: 'models',  honors: false, text: 'Compare historical atomic models and connect each to evidence that changed atomic theory.' },
  { id: 'b', code: 'C.6(B)', mode: 'build',   honors: false, text: 'Describe atomic and ionic structure using subatomic particles, mass number, and charge.' },
  { id: 'd', code: 'C.6(D)', mode: 'mass',    honors: false, text: 'Calculate average atomic mass from isotopic composition.' },
  { id: 'c', code: 'C.6(C)', mode: 'spectra', honors: false, text: 'Relate wavelength, frequency, and photon energy to emission spectra.' },
  { id: 'e', code: 'C.6(E)', mode: 'config',  honors: false, text: 'Use electron configurations and Lewis dot structures to represent electron arrangements.' },
  { id: 'f', code: 'C.5(B)', mode: 'config',  honors: false, text: 'Use valence-electron patterns to explain similar properties within a group.' }
];

// These are activity answer tolerances, not scientific definitions.
export const SPECTRA_BANDS = { mode: 'relative', ideal: 0.01, acceptable: 0.03 };
export const MASS_BANDS = { mode: 'relative', ideal: 0.001, acceptable: 0.003 };
export const HONORS_BANDS = { mode: 'relative', ideal: 0.02, acceptable: 0.05 };

export const SHOP = {
  role: 'Practice shift · sign and lighting shop', shiftStart: '13:00', tubeSlots: 6,
  note: 'The rack, round, and progress meters are practice indicators, not scientific measurements or industry procedures.'
};

export const EVIDENCE = {
  crt: {
    object: 'the CRT', observation: 'the beam bends when a magnet is held beside the tube',
    forces: 'Thomson', because: 'the observation requires a charged particle inside the atom that can be deflected',
    consequence: {
      Dalton: 'Dalton’s original solid-sphere model had no internal charged particle to explain the deflected beam.',
      Thomson: 'Thomson’s electron provides the negatively charged particle needed to explain the deflected beam.',
      Rutherford: 'The nucleus explains concentrated positive charge, but this observation specifically points to a mobile negative particle.',
      Bohr: 'Quantized energy levels do not by themselves explain why the cathode-ray beam bends in a magnetic field.',
      Heisenberg: 'Modern quantum theory includes electrons, but this historical observation first established the need for a negatively charged particle inside atoms.'
    }
  },
  tube: {
    object: 'the gas discharge tube', observation: 'the tube produces several sharp emission lines instead of a continuous spectrum',
    forces: 'Bohr', because: 'Bohr was the first model in this sequence to assign electrons specific energy levels that could account for discrete line spectra',
    consequence: {
      Dalton: 'The solid-sphere model has no electron-energy structure to explain separate emission lines.',
      Thomson: 'Thomson’s model introduced electrons but did not assign them discrete energy levels.',
      Rutherford: 'Rutherford’s nuclear model did not specify the quantized electron energies needed to explain the line pattern.',
      Bohr: 'Bohr introduced specific electron energy levels, providing an early explanation for discrete atomic spectra.',
      Heisenberg: 'Modern quantum theory also predicts discrete atomic energies; in this historical sequence, Bohr introduced quantized electron levels first.'
    }
  },
  assay: {
    object: 'the composition data', observation: 'two samples of the same compound have the same elemental mass ratio',
    forces: 'Dalton', because: 'constant composition is consistent with atoms combining in fixed ratios',
    consequence: {
      Dalton: 'Dalton’s atomic theory is consistent with compounds containing atoms in fixed ratios and therefore having constant composition.',
      Thomson: 'Electrons explain internal charge but do not provide the early fixed-ratio explanation tested by this observation.',
      Rutherford: 'A concentrated nucleus does not by itself explain why a compound repeats the same elemental composition.',
      Bohr: 'Electron energy levels do not explain the fixed elemental composition of a compound.',
      Heisenberg: 'The uncertainty principle concerns position and momentum, not the constant composition of a compound.'
    }
  },
  uncertainty: {
    object: 'the uncertainty card', observation: 'position and momentum cannot both be specified with unlimited precision at the same time',
    forces: 'Heisenberg', because: 'the uncertainty principle is a fundamental feature of quantum systems, not an instrument defect',
    consequence: {
      Dalton: 'Dalton’s model predates electrons and does not address electron position or momentum.',
      Thomson: 'Thomson introduced electrons but did not provide the modern quantum description of their motion.',
      Rutherford: 'Classical fixed electron paths are not a complete quantum description.',
      Bohr: 'Fixed energy levels are useful, but they do not define an exact classical electron path.',
      Heisenberg: 'Heisenberg’s uncertainty principle places a fundamental limit on simultaneous knowledge of position and momentum.'
    }
  }
};

// Assessment scenarios: six core skills, two Honors extensions, and a capstone.
// Scenario wording states only evidence that is actually used by the activity.
export const SCENARIOS = [
  { id:'a-crt', skill:'a', stage:'models', type:'decision', system:'CRT evidence', icon:'MODEL', goal:'A CRT beam bends near a magnet. Which historical model introduced the electron needed to explain a charged, deflectable beam?', why:EVIDENCE.crt.because, evidence:'crt', correct:'Thomson' },
  { id:'a-tube', skill:'a', stage:'models', type:'decision', system:'Line-spectrum evidence', icon:'MODEL', goal:'A gas discharge tube shows separate bright lines. Which historical model in this sequence first introduced fixed electron energy levels?', why:EVIDENCE.tube.because, evidence:'tube', correct:'Bohr' },
  { id:'a-assay', skill:'a', stage:'models', type:'decision', system:'Composition evidence', icon:'MODEL', goal:'Two samples of the same compound have the same elemental mass ratio. Which early atomic model is consistent with atoms combining in fixed ratios?', why:EVIDENCE.assay.because, evidence:'assay', correct:'Dalton' },
  { id:'b-argon', skill:'b', stage:'build', type:'identity', system:'Argon-40 atom', icon:'BUILD', goal:'Build a neutral argon-40 atom to match the sample record.', why:'Protons determine the element; neutrons determine the isotope; electrons determine net charge.', z:18, n:22, e:18 },
  { id:'b-neon', skill:'b', stage:'build', type:'identity', system:'Neon ion', icon:'BUILD', goal:'Model a Ne+ ion formed when a neon atom loses one electron in a gas discharge.', why:'Removing one electron leaves the nucleus unchanged and produces a +1 cation.', z:10, n:10, e:9 },
  { id:'b-chlorine', skill:'b', stage:'build', type:'identity', system:'Chlorine-37 atom', icon:'BUILD', goal:'Build a neutral chlorine-37 atom for the isotope record.', why:'Mass number equals protons plus neutrons; it is not the periodic-table average atomic mass.', z:17, n:20, e:17 },
  { id:'d-boron', skill:'d', stage:'mass', type:'dose', system:'Boron isotope data', icon:'MASS', goal:'Use the reference isotopic composition to calculate boron’s weighted average atomic mass.', why:'Average atomic mass is the sum of each isotope mass multiplied by its fractional abundance.', iso:'B', expected:10.81, assay:'B-10 19.90%; B-11 80.10%' },
  { id:'d-copper', skill:'d', stage:'mass', type:'dose', system:'Copper isotope data', icon:'MASS', goal:'Use the reference isotopic composition to calculate copper’s weighted average atomic mass.', why:'The more abundant isotope contributes more strongly to the weighted average.', iso:'Cu', expected:63.55, assay:'Cu-63 69.15%; Cu-65 30.85%' },
  { id:'d-chlorine', skill:'d', stage:'mass', type:'dose', system:'Chlorine isotope data', icon:'MASS', goal:'Use the reference isotopic composition to calculate chlorine’s weighted average atomic mass.', why:'A weighted average is not the midpoint unless the isotope abundances are equal.', iso:'Cl', expected:35.45, assay:'Cl-35 75.77%; Cl-37 24.23%' },
  { id:'c-sodium', skill:'c', stage:'spectra', type:'dose', system:'Sodium emission', icon:'LIGHT', goal:'Use the selected sodium emission line to calculate photon energy in joules.', why:'Photon energy follows E = hc/λ; shorter wavelength means higher frequency and higher photon energy.', spec:'Na' },
  { id:'c-neon', skill:'c', stage:'spectra', type:'dose', system:'Neon emission', icon:'LIGHT', goal:'Use the selected neon emission line to calculate photon energy in joules.', why:'A pattern of characteristic emission lines can help identify an element.', spec:'Ne' },
  { id:'c-mercury', skill:'c', stage:'spectra', type:'dose', system:'Mercury emission', icon:'LIGHT', goal:'Use the selected mercury emission line to calculate photon energy in joules.', why:'Each emission line corresponds to a photon energy associated with an allowed transition.', spec:'Hg' },
  { id:'e-magnesium', skill:'e', stage:'config', type:'identity', system:'Magnesium electrons', icon:'CONFIG', goal:'Set the electron tool to magnesium and check its ground-state electron configuration and Lewis-dot representation.', why:'For main-group elements, the highest occupied s and p electrons are the valence electrons shown in a Lewis dot structure.', z:12 },
  { id:'e-chromium', skill:'e', stage:'config', type:'identity', system:'Chromium electrons', icon:'CONFIG', goal:'Set the electron tool to chromium and compare its observed ground-state configuration with the simple Aufbau prediction.', why:'Chromium is a known exception to simple Aufbau filling.', z:24 },
  { id:'e-copper', skill:'e', stage:'config', type:'identity', system:'Copper electrons', icon:'CONFIG', goal:'Set the electron tool to copper and compare its observed ground-state configuration with the simple Aufbau prediction.', why:'Copper is a known exception to simple Aufbau filling.', z:29 },
  { id:'f-argon', skill:'f', stage:'config', type:'decision', system:'Argon group pattern', icon:'FAMILY', goal:'Use argon’s valence-electron pattern to identify its periodic-table group.', why:'A filled outer shell is associated with the very low reactivity of noble gases under ordinary conditions.', z:18, correct:'Noble gas (Group 18)' },
  { id:'f-aluminum', skill:'f', stage:'config', type:'decision', system:'Aluminum group pattern', icon:'FAMILY', goal:'Use aluminum’s valence-electron pattern to identify its periodic-table group.', why:'Main-group elements in the same group have similar valence-electron patterns and often similar chemical properties.', z:13, correct:'Boron group (Group 13)' },
  { id:'f-chlorine', skill:'f', stage:'config', type:'decision', system:'Chlorine group pattern', icon:'FAMILY', goal:'Use chlorine’s valence-electron pattern to identify its periodic-table group.', why:'Halogens have seven valence electrons and often form -1 ions in ionic compounds.', z:17, correct:'Halogen (Group 17)' },
  { id:'h1-photon', skill:'h1', stage:'spectra', type:'dose', system:'Honors photon check', icon:'HONORS', goal:'For a selected spectral line, calculate photon energy in joules using E = hc/λ.', why:'Convert wavelength from nanometers to meters before using the photon equation.' },
  { id:'h2-orbital', skill:'h2', stage:'config', type:'decision', system:'Honors exception check', icon:'HONORS', goal:'Compare the observed ground-state configuration with the simple Aufbau prediction and classify the selected element.', why:'Cr and Cu are listed observed exceptions; not every element follows a half-filled or filled-subshell shortcut.' },
  { id:'cap-glowroom', skill:'cap', stage:'capstone', type:'decision', system:'Unlabeled cylinder', icon:'CAPSTONE', goal:'The spectrum is consistent with neon, but the compressed-gas cylinder is unlabeled. Is the evidence sufficient to put it into service?', why:'A spectrum can support identity, but an unlabeled cylinder still requires verified identification before use.', correct:'return' }
];