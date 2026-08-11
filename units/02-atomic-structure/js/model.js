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

export const SE = [
  { code: 'C.6(A)', mode: 'build',   honors: false, text: 'Construct models (Dalton through Bohr and Heisenberg) showing how atomic theory developed over time.' },
  { code: 'C.6(B)', mode: 'build',   honors: false, text: 'Describe atomic and ionic structure: the masses, charges, and locations of protons, neutrons, and electrons.' },
  { code: 'C.6(D)', mode: 'mass',    honors: false, text: 'Calculate the average atomic mass of an element from its isotopic composition.' },
  { code: 'C.6(C)', mode: 'spectra', honors: false, text: 'Relate the energy, frequency, and wavelength of light to the quantized lines of an emission spectrum.' },
  { code: 'C.6(E)', mode: 'config',  honors: false, text: 'Express the arrangement of electrons with electron configurations and Lewis dot structures.' },
  { code: 'C.5(B)', mode: 'config',  honors: false, text: 'Predict chemical-family behavior from valence-electron patterns.' }
];
