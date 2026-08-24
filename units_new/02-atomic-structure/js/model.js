// model.js — Unit 2 domain data (Atomic Structure & Theory, TEKS C.6, C.5).
// Pure data. All atomic math lives in shared/js/chem.js.

// ---- C.6(A): development of atomic theory (reference timeline) ----
export const ATOMIC_MODELS = [
  { who: 'Dalton', year: 1803, model: 'Solid sphere',
    idea: 'Atoms are indivisible solid spheres; all atoms of an element are identical.' },
  { who: 'Thomson', year: 1897, model: 'Plum pudding',
    idea: 'Atoms contain tiny negative electrons spread through a positive charge.' },
  { who: 'Rutherford', year: 1911, model: 'Nuclear atom',
    idea: 'Gold-foil scattering revealed a tiny, dense, positive nucleus.' },
  { who: 'Bohr', year: 1913, model: 'Energy levels',
    idea: 'Electrons occupy fixed energy levels (shells) around the nucleus. This is the model drawn here.' },
  { who: 'Heisenberg', year: 1927, model: 'Quantum cloud',
    idea: 'Position and momentum cannot both be known, so electrons fill probability clouds.' }
];

// Atomic numbers offered in the Build and Electron dropdowns. Kept light so the
// shell diagram stays readable (Z 1-20 plus a few transition metals and Br).
export const BUILD_SET = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 24, 26, 29, 30, 35];

// ---- C.6(D): real isotopic compositions (mass in u, abundance in %) ----
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
    note: 'Balmer series: electrons dropping to the n=2 level emit these four visible lines.' },
  { key: 'He', name: 'Helium', lines: [447.1, 471.3, 492.2, 501.6, 587.6, 667.8],
    note: 'First detected in sunlight before it was found on Earth. The 587.6 nm line is its signature.' },
  { key: 'Ne', name: 'Neon', lines: [585.2, 588.2, 603.0, 607.4, 614.3, 626.6, 640.2, 650.7, 692.9, 703.2],
    note: 'A dense cluster of red-orange lines gives neon signs their glow.' },
  { key: 'Na', name: 'Sodium', lines: [568.8, 589.0, 589.6, 615.4],
    note: 'The 589 nm sodium doublet is the bright yellow of street lamps.' },
  { key: 'Hg', name: 'Mercury', lines: [404.7, 435.8, 546.1, 577.0, 579.1],
    note: 'These sharp lines drive fluorescent and street lighting.' }
];

// ---- Honors (C.6 E): ground-state configuration exceptions ----
// Aufbau predicts the "predicted" form (recomputed live from the engine); the
// actual form gains stability from a half-filled or filled d subshell. Actual
// strings use the same noble-gas-core, fill-order convention as the predicted
// column, so the only visible difference is the electron that shifts s -> d.
export const CONFIG_EXCEPTIONS = [
  { sym: 'Cr', z: 24, actual: '[Ar] 4s1 3d5', why: 'A half-filled 3d subshell is extra stable, so one 4s electron moves to 3d.' },
  { sym: 'Cu', z: 29, actual: '[Ar] 4s1 3d10', why: 'A completely filled 3d subshell is extra stable, so one 4s electron moves to 3d.' },
  { sym: 'Ag', z: 47, actual: '[Kr] 5s1 4d10', why: 'Like copper, a filled 4d subshell wins out over a filled 5s.' },
  { sym: 'Au', z: 79, actual: '[Xe] 6s1 4f14 5d10', why: 'A filled 5d subshell is favored, leaving a single 6s electron.' }
];

// Noble-gas core atomic numbers, used to abbreviate configurations.
export const NOBLE_CORES = [
  { z: 2, sym: 'He' }, { z: 10, sym: 'Ne' }, { z: 18, sym: 'Ar' },
  { z: 36, sym: 'Kr' }, { z: 54, sym: 'Xe' }, { z: 86, sym: 'Rn' }
];

// Stable ids follow the intentional display order A, B, D, C, E, C.5(B).  C.6(A) is the
// one permitted mode change: it owns the new `models` bench instead of hiding in Build.
export const SE = [
  { id: 'a', code: 'C.6(A)', mode: 'models',  honors: false, text: 'Compare atomic models and connect each to the evidence that made it necessary.' },
  { id: 'b', code: 'C.6(B)', mode: 'build',   honors: false, text: 'Describe atomic and ionic structure: particles, mass number, and charge.' },
  { id: 'd', code: 'C.6(D)', mode: 'mass',    honors: false, text: 'Calculate average atomic mass from isotopic composition.' },
  { id: 'c', code: 'C.6(C)', mode: 'spectra', honors: false, text: 'Relate wavelength, frequency, and energy to an emission spectrum.' },
  { id: 'e', code: 'C.6(E)', mode: 'config',  honors: false, text: 'Express electron arrangements with configurations and Lewis dot structures.' },
  { id: 'f', code: 'C.5(B)', mode: 'config',  honors: false, text: 'Predict chemical-family behavior from valence-electron patterns.' }
];

export const SPECTRA_BANDS = { mode: 'relative', ideal: 0.01, acceptable: 0.03 };
// 0.3% of chlorine's 35.45 u reference is 0.11 u. A plausible isotope assay moves the
// weighted average by much more than that, so this tolerance identifies the assay instead
// of rewarding a vague near-enough guess.
export const MASS_BANDS = { mode: 'relative', ideal: 0.001, acceptable: 0.003 };
export const HONORS_BANDS = { mode: 'relative', ideal: 0.02, acceptable: 0.05 };

export const SHOP = {
  role: 'Saturday hand · sign and lighting shop', shiftStart: '13:00', tubeSlots: 6,
  note: 'The rack is a model of the shop shift, not a physical safety protocol.'
};

export const EVIDENCE = {
  crt: {
    object: 'the flea-market CRT', observation: 'the beam bends when a magnet is held beside the tube',
    forces: 'Thomson', because: 'a solid indivisible sphere has nothing inside it that a magnet can steer',
    consequence: {
      Dalton: 'Dalton’s solid sphere offers no charged part for the magnet to bend.',
      Thomson: 'Thomson’s electron makes a bendable charged beam possible.',
      Rutherford: 'A nucleus explains concentrated positive charge, not the steerable beam itself.',
      Bohr: 'Energy levels do not by themselves explain why the beam bends.',
      Heisenberg: 'A probability model still needs Thomson’s electron before there is a beam to steer.'
    }
  },
  tube: {
    object: 'the color tube', observation: 'a gas tube glows in four sharp colors, not a continuous rainbow',
    forces: 'Bohr', because: 'a continuous range of electron energies would make a continuum rather than line spectra',
    consequence: {
      Dalton: 'A solid-sphere model gives no electron-energy explanation for the separate colors.',
      Thomson: 'Spread-out charge does not predict a few discrete wavelengths.',
      Rutherford: 'A nucleus alone does not set the electron transitions that make the lines.',
      Bohr: 'Bohr’s fixed energy levels predict photons at specific wavelengths.',
      Heisenberg: 'The quantum model refines electron location, but the observed discrete levels identify Bohr here.'
    }
  },
  assay: {
    object: 'the supplier assay', observation: 'two salt suppliers report the same fixed mass ratio',
    forces: 'Dalton', because: 'repeatable whole-number mass combinations require atoms with stable identities',
    consequence: {
      Dalton: 'Dalton’s stable atoms account for the same elemental ratio in repeated compounds.',
      Thomson: 'Electrons explain charge but do not establish the fixed compound mass ratio.',
      Rutherford: 'The nuclear atom does not add the needed whole-atom composition rule.',
      Bohr: 'Energy levels describe electron states, not the repeatable mass ratio.',
      Heisenberg: 'Uncertainty describes measurement limits, not the constant composition of a compound.'
    }
  },
  uncertainty: {
    object: 'the precision-position card', observation: 'position and speed cannot both be pinned down without a limit',
    forces: 'Heisenberg', because: 'a single exact electron path would require both values at once',
    consequence: {
      Dalton: 'A solid sphere has no electron position-and-momentum problem to describe.',
      Thomson: 'Embedded electrons still do not have a defensible exact path here.',
      Rutherford: 'Orbiting particles with exact paths conflict with the stated measurement limit.',
      Bohr: 'Fixed energy levels do not guarantee a simultaneously exact path and momentum.',
      Heisenberg: 'Heisenberg’s quantum description treats the limit as physical, not a bad instrument.'
    }
  }
};

// Twenty-one new assessment scenarios: six core skills times three, then two Honors
// extensions and one state-dependent capstone.  Values already live in the data above or
// shared chemistry helpers; these objects only state the context, intended evidence, and
// pedagogical consequence.
export const SCENARIOS = [
  { id:'a-crt', skill:'a', stage:'models', type:'decision', system:'The junk-shelf CRT', icon:'MODEL', goal:'A flea-market CRT bends its beam when a magnet is held beside it. Name the model that made the evidence meaningful.', why:EVIDENCE.crt.because, evidence:'crt', correct:'Thomson' },
  { id:'a-tube', skill:'a', stage:'models', type:'decision', system:'The color tube', icon:'MODEL', goal:'A gas discharge tube glows in four sharp colors, not a rainbow. Choose the model that gives electrons fixed energy levels.', why:EVIDENCE.tube.because, evidence:'tube', correct:'Bohr' },
  { id:'a-assay', skill:'a', stage:'models', type:'decision', system:'The supplier assay', icon:'MODEL', goal:'Two salt batches repeat the same fixed mass ratio. Choose the early atomic model this evidence supports.', why:EVIDENCE.assay.because, evidence:'assay', correct:'Dalton' },
  { id:'b-argon', skill:'b', stage:'build', type:'identity', system:'Argon-40 cylinder', icon:'BUILD', goal:'Set the atom maker to a neutral argon-40 cylinder before it goes on the sign rack.', why:'Protons set the element; neutrons set the isotope; electrons set the charge.', z:18, n:22, e:18 },
  { id:'b-neon', skill:'b', stage:'build', type:'identity', system:'Neon sign tube', icon:'BUILD', goal:'A hot sign tube ionized neon once. Build Ne+ so the service tag matches the tube.', why:'Removing one electron leaves the nucleus unchanged and creates a cation.', z:10, n:10, e:9 },
  { id:'b-chlorine', skill:'b', stage:'build', type:'identity', system:'Chlorine-37 tracer', icon:'BUILD', goal:'Build the neutral chlorine-37 tracer bottle for the leak-check record.', why:'Mass number is protons plus neutrons, not the periodic-table average.', z:17, n:20, e:17 },
  { id:'d-boron', skill:'d', stage:'mass', type:'dose', system:'Borosilicate tubing', icon:'MASS', goal:'Calculate the weighted boron mass from the fixed tubing assay, then certify your value.', why:'The average follows each isotope mass weighted by its fraction.', iso:'B', expected:10.81, assay:'B-10 19.90%; B-11 80.10%' },
  { id:'d-copper', skill:'d', stage:'mass', type:'dose', system:'Copper-wire spool', icon:'MASS', goal:'Calculate the weighted copper mass from the fixed spool assay before the scrap buyer pays the shop.', why:'The mass closest to the more abundant isotope pulls the average most strongly.', iso:'Cu', expected:63.55, assay:'Cu-63 69.15%; Cu-65 30.85%' },
  { id:'d-chlorine', skill:'d', stage:'mass', type:'dose', system:'Pool-tablet assay', icon:'MASS', goal:'Calculate the weighted chlorine mass from the fixed tablet assay before it goes into stock.', why:'A weighted average is not the midpoint unless the abundances are equal.', iso:'Cl', expected:35.45, assay:'Cl-35 75.77%; Cl-37 24.23%' },
  { id:'c-sodium', skill:'c', stage:'spectra', type:'dose', system:'Dead streetlight', icon:'LIGHT', goal:'Read the sodium spectrum and commit the energy of the selected bright line in joules.', why:'A photon carries E = hc/λ; shorter wavelengths carry more energy.', spec:'Na' },
  { id:'c-neon', skill:'c', stage:'spectra', type:'dose', system:'Lobby neon tube', icon:'LIGHT', goal:'Read the neon tube spectrum and commit the selected line energy in joules.', why:'Emission lines are an element fingerprint, not paint inside the glass.', spec:'Ne' },
  { id:'c-mercury', skill:'c', stage:'spectra', type:'dose', system:'Ceiling fluorescent', icon:'LIGHT', goal:'Read the mercury spectrum and commit the selected line energy in joules.', why:'The sharp line records one quantized electron drop.', spec:'Hg' },
  { id:'e-magnesium', skill:'e', stage:'config', type:'identity', system:'Magnesium electrode', icon:'CONFIG', goal:'Set the electron tool to magnesium and certify its configuration and Lewis-dot evidence.', why:'The configuration fills orbitals; the outer electrons drive the Lewis dots.', z:12 },
  { id:'e-chromium', skill:'e', stage:'config', type:'identity', system:'Chromium electrode', icon:'CONFIG', goal:'Set the electron tool to chromium and identify the configuration exception at the bench.', why:'A half-filled d subshell changes the simple filling prediction.', z:24 },
  { id:'e-copper', skill:'e', stage:'config', type:'identity', system:'Copper coil', icon:'CONFIG', goal:'Set the electron tool to copper and identify the configuration exception before rewiring the sign.', why:'A filled d subshell changes the simple filling prediction.', z:29 },
  { id:'f-argon', skill:'f', stage:'config', type:'decision', system:'Sealed argon tube', icon:'FAMILY', goal:'Choose the family behavior that makes argon suitable inside a tube meant to last ten years.', why:'A filled valence shell explains noble-gas inertness.', z:18, correct:'Noble gas (Group 18)' },
  { id:'f-aluminum', skill:'f', stage:'config', type:'decision', system:'Aluminum electrode', icon:'FAMILY', goal:'Choose aluminum’s main-group family behavior before selecting the electrode material.', why:'Main-group valence patterns predict typical ion behavior.', z:13, correct:'Boron group (Group 13)' },
  { id:'f-chlorine', skill:'f', stage:'config', type:'decision', system:'Getter cartridge', icon:'FAMILY', goal:'Choose chlorine’s main-group family behavior before a getter is ordered.', why:'Halogens tend to gain one electron and are reactive nonmetals.', z:17, correct:'Halogen (Group 17)' },
  { id:'h1-photon', skill:'h1', stage:'spectra', type:'dose', system:'Honors line check', icon:'HONORS', goal:'With a selected spectral line, calculate its photon energy in joules using E = hc/λ.', why:'Convert nm to m before using the photon equation.' },
  { id:'h2-orbital', skill:'h2', stage:'config', type:'decision', system:'Honors orbital check', icon:'HONORS', goal:'Use the orbital evidence to decide whether the selected configuration is an exception to simple Aufbau filling.', why:'Chromium and copper are explicit special cases in this model.' },
  { id:'cap-glowroom', skill:'cap', stage:'capstone', type:'decision', system:'Unlabelled cylinder', icon:'CAPSTONE', goal:'Read the gas evidence, use the built rack, and make the final tube-fill decision.', why:'The safe call depends on the evidence a learner assembled in this shift.' }
];
