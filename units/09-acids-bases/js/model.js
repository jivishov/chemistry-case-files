// model.js: Unit 9 domain data. The units_new build: copied verbatim from
// units/09-acids-bases/js/model.js apart from this header. It imports nothing, so it needs
// no re-pathing, and the 16 SCENARIOS its game layer is built from are the same 16 that
// js/art.js draws a banner for, one to one.
//
// Unit 9 domain data (Acids & Bases, TEKS C.12). Pure data + the
// standards map. All quantitative work (pH, pOH, equivalence volume, weak-acid
// pH) lives in shared/js/chem.js; this file holds the naming, definition,
// strength, neutralization, and weak-acid pools the stage generators draw from,
// the measured dose bands, and the SCENARIOS the game layer is built from.

// Standards map: each C.12 sub-letter drives one stage. The two Honors rows are
// extensions beyond the listed letters (titration curve + weak-acid Ka). Titration
// is NOT a named sub-letter, so it rides on C.12(D); the weak-acid Ka work rides
// on C.12(E). Stable ids key the mastery meters in the right rail.
export const SE = [
  { id: 'a',  code: 'C.12(A)', mode: 'naming',     honors: false,
    text: 'Name and write chemical formulas for acids and bases using IUPAC rules.' },
  { id: 'b',  code: 'C.12(B)', mode: 'define',     honors: false,
    text: 'Define acids and bases; distinguish Arrhenius from Brønsted-Lowry and identify conjugate acid-base pairs.' },
  { id: 'c',  code: 'C.12(C)', mode: 'strength',   honors: false,
    text: 'Differentiate strong from weak acids and bases by the extent to which they ionize or react with water.' },
  { id: 'd',  code: 'C.12(D)', mode: 'neutralize', honors: false,
    text: 'Predict the products of acid-base reactions that form water.' },
  { id: 'e',  code: 'C.12(E)', mode: 'meter',      honors: false,
    text: 'Define pH and calculate it from the hydrogen-ion concentration.' },
  { id: 'h1', code: 'Honors',  mode: 'neutralize', honors: true,
    text: 'Honors: analyze a strong-acid/strong-base titration curve and identify the equivalence point.' },
  { id: 'h2', code: 'Honors',  mode: 'meter',      honors: true,
    text: 'Honors: calculate the pH of a weak monoprotic acid from its Ka and concentration.' }
];

// ===================== C.12(A) acid + base naming =====================
// Each acid carries the segment decisions an IUPAC name is built from, so the
// name builder can grade by part (prefix/root/suffix) and rebuild the name.
//   binary acid:  hydro- + root + -ic acid   (e.g. HCl -> hydrochloric acid)
//   oxyacid -ate: root + -ic acid            (e.g. HNO3 -> nitric acid)
//   oxyacid -ite: root + -ous acid           (e.g. HNO2 -> nitrous acid)
//   per.../hypo... prefixes shift the chlorine oxyacid series.
// `where` is additive: the everyday place the substance turns up, rendered under the
// bottle as "where it turns up" so it reads as one sentence with any of the naming
// briefs (a caller on the phone, an antacid box, a transfer sheet).
export const ACID_NAMES = [
  { f: 'HF',      name: 'hydrofluoric acid', kind: 'binary', prefix: 'hydro',  root: 'fluor',    suffix: '-ic acid',
    where: 'glass etching and specialized industrial processing' },
  { f: 'HCl',     name: 'hydrochloric acid', kind: 'binary', prefix: 'hydro',  root: 'chlor',    suffix: '-ic acid',
    where: 'muriatic-acid products, pool pH control, and gastric acid' },
  { f: 'HBr',     name: 'hydrobromic acid',  kind: 'binary', prefix: 'hydro',  root: 'brom',     suffix: '-ic acid',
    where: 'laboratory synthesis and industrial chemical processing' },
  { f: 'HI',      name: 'hydroiodic acid',   kind: 'binary', prefix: 'hydro',  root: 'iod',      suffix: '-ic acid',
    where: 'a laboratory reagent that can darken as iodide is oxidized' },
  { f: 'H2S',     name: 'hydrosulfuric acid',kind: 'binary', prefix: 'hydro',  root: 'sulfur',   suffix: '-ic acid',
    where: 'aqueous hydrogen sulfide in natural waters and some industrial systems' },
  { f: 'HNO3',    name: 'nitric acid',       kind: 'oxy',    prefix: '(none)', root: 'nitr',     suffix: '-ic acid',
    where: 'fertilizer production and metal processing' },
  { f: 'HNO2',    name: 'nitrous acid',      kind: 'oxy',    prefix: '(none)', root: 'nitr',     suffix: '-ous acid',
    where: 'nitrite chemistry in aqueous and food systems' },
  { f: 'H2SO4',   name: 'sulfuric acid',     kind: 'oxy',    prefix: '(none)', root: 'sulfur',   suffix: '-ic acid',
    where: 'lead-acid batteries and large-scale industrial chemical production' },
  { f: 'H2SO3',   name: 'sulfurous acid',    kind: 'oxy',    prefix: '(none)', root: 'sulfur',   suffix: '-ous acid',
    where: 'aqueous sulfur dioxide and sulfite chemistry' },
  { f: 'H2CO3',   name: 'carbonic acid',     kind: 'oxy',    prefix: '(none)', root: 'carbon',   suffix: '-ic acid',
    where: 'carbonated water, rainwater, and the carbonic-acid/bicarbonate buffer system' },
  { f: 'H3PO4',   name: 'phosphoric acid',   kind: 'oxy',    prefix: '(none)', root: 'phosphor', suffix: '-ic acid',
    where: 'some soft drinks, rust treatment, and industrial phosphate chemistry' },
  { f: 'H3PO3',   name: 'phosphorous acid',  kind: 'oxy',    prefix: '(none)', root: 'phosphor', suffix: '-ous acid',
    where: 'laboratory reducing chemistry and industrial synthesis' },
  { f: 'HC2H3O2', name: 'acetic acid',       kind: 'oxy',    prefix: '(none)', root: 'acet',     suffix: '-ic acid',
    where: 'vinegar, commonly about 5% acetic acid by volume or mass depending on labeling' },
  { f: 'HClO4',   name: 'perchloric acid',   kind: 'oxy',    prefix: 'per',    root: 'chlor',    suffix: '-ic acid',
    where: 'specialized laboratory and industrial oxidation chemistry' },
  { f: 'HClO3',   name: 'chloric acid',      kind: 'oxy',    prefix: '(none)', root: 'chlor',    suffix: '-ic acid',
    where: 'chlorate chemistry; concentrated chloric acid is unstable' },
  { f: 'HClO2',   name: 'chlorous acid',     kind: 'oxy',    prefix: '(none)', root: 'chlor',    suffix: '-ous acid',
    where: 'aqueous chlorite chemistry and chlorine-dioxide generation processes' },
  { f: 'HClO',    name: 'hypochlorous acid', kind: 'oxy',    prefix: 'hypo',   root: 'chlor',    suffix: '-ous acid',
    where: 'a disinfecting species formed in chlorine-based water treatment' }
];

// Hydroxide bases: metal name (+ roman numeral for a variable-charge metal) +
// hydroxide. The roman numeral is '(none)' for fixed-charge metals.
export const BASE_NAMES = [
  { f: 'LiOH',    name: 'lithium hydroxide',   kind: 'base', metal: 'lithium',   roman: '(none)', suffix: 'hydroxide',
    where: 'carbon-dioxide scrubbing in specialized life-support systems' },
  { f: 'NaOH',    name: 'sodium hydroxide',    kind: 'base', metal: 'sodium',    roman: '(none)', suffix: 'hydroxide',
    where: 'lye, some drain cleaners, and industrial processing' },
  { f: 'KOH',     name: 'potassium hydroxide', kind: 'base', metal: 'potassium', roman: '(none)', suffix: 'hydroxide',
    where: 'alkaline-battery electrolyte and soap manufacture' },
  { f: 'Mg(OH)2', name: 'magnesium hydroxide', kind: 'base', metal: 'magnesium', roman: '(none)', suffix: 'hydroxide',
    where: 'milk of magnesia and some antacid products' },
  { f: 'Ca(OH)2', name: 'calcium hydroxide',   kind: 'base', metal: 'calcium',   roman: '(none)', suffix: 'hydroxide',
    where: 'slaked lime, mortar, and water treatment' },
  { f: 'Ba(OH)2', name: 'barium hydroxide',    kind: 'base', metal: 'barium',    roman: '(none)', suffix: 'hydroxide',
    where: 'laboratory titration and analytical chemistry' },
  { f: 'Al(OH)3', name: 'aluminum hydroxide',  kind: 'base', metal: 'aluminum',  roman: '(none)', suffix: 'hydroxide',
    where: 'some antacid formulations and water-treatment applications' },
  { f: 'Fe(OH)2', name: 'iron(II) hydroxide',  kind: 'base', metal: 'iron',      roman: '(II)',   suffix: 'hydroxide',
    where: 'iron chemistry in oxygen-poor aqueous environments' },
  { f: 'Fe(OH)3', name: 'iron(III) hydroxide', kind: 'base', metal: 'iron',      roman: '(III)',  suffix: 'hydroxide',
    where: 'iron-rich waters and rust-colored mineral deposits' }
];

// Option vocabularies for the name-builder selects (correct part plus distractors).
export const ACID_PREFIXES = ['(none)', 'hydro', 'per', 'hypo'];
export const ACID_ROOTS    = ['fluor', 'chlor', 'brom', 'iod', 'sulfur', 'nitr', 'carbon', 'phosphor', 'acet'];
export const ACID_SUFFIXES = ['-ic acid', '-ous acid', '-ide'];
export const BASE_METALS   = ['lithium', 'sodium', 'potassium', 'magnesium', 'calcium', 'barium', 'aluminum', 'iron'];
export const BASE_ROMANS   = ['(none)', '(I)', '(II)', '(III)'];
export const BASE_SUFFIXES = ['hydroxide', 'oxide', 'hydride'];

// ===================== C.12(B) definitions + conjugate pairs =====================
// Curated rotating pool. Each card asks two things (the answer and a framing or
// role question); both must be right, and the explanation is revealed afterward.
//   kind 'conjugate' -> qA picks the conjugate partner (a formula), qB the role.
//   kind 'framework' -> qA picks Arrhenius vs Brønsted-Lowry, qB the role.
export const DEFINE_POOL = [
  { kind: 'conjugate', ce: 'HCO3^-', text: 'The bicarbonate ion can act as a Brønsted-Lowry acid.',
    qA: { q: 'Its conjugate base is:', type: 'ce', options: ['CO3^2-', 'H2CO3', 'OH^-', 'CO2'], answer: 'CO3^2-' },
    qB: { q: 'Here the species is acting as a(n):', type: 'text', options: ['acid', 'base'], answer: 'acid' },
    explain: 'A Brønsted-Lowry acid donates a proton. Remove one H+ from HCO3- to get its conjugate base CO3^2-.' },
  { kind: 'conjugate', ce: 'NH3', text: 'Ammonia can act as a Brønsted-Lowry base.',
    qA: { q: 'Its conjugate acid is:', type: 'ce', options: ['NH4^+', 'NH2^-', 'NO3^-', 'N2'], answer: 'NH4^+' },
    qB: { q: 'Here the species is acting as a(n):', type: 'text', options: ['acid', 'base'], answer: 'base' },
    explain: 'A base accepts a proton. Add one H+ to NH3 to get its conjugate acid NH4+.' },
  { kind: 'conjugate', ce: 'H2O', text: 'Water can act as a Brønsted-Lowry acid (it is amphoteric).',
    qA: { q: 'Its conjugate base is:', type: 'ce', options: ['OH^-', 'H3O^+', 'O2', 'H2'], answer: 'OH^-' },
    qB: { q: 'Here the species is acting as a(n):', type: 'text', options: ['acid', 'base'], answer: 'acid' },
    explain: 'Acting as an acid, water donates a proton: H2O minus H+ gives OH-.' },
  { kind: 'conjugate', ce: 'H2O', text: 'Water can also act as a Brønsted-Lowry base (it is amphoteric).',
    qA: { q: 'Its conjugate acid is:', type: 'ce', options: ['H3O^+', 'OH^-', 'H2O2', 'H2'], answer: 'H3O^+' },
    qB: { q: 'Here the species is acting as a(n):', type: 'text', options: ['acid', 'base'], answer: 'base' },
    explain: 'Acting as a base, water accepts a proton: H2O plus H+ gives the hydronium ion H3O+.' },
  { kind: 'conjugate', ce: 'HSO4^-', text: 'The hydrogen sulfate ion can act as a Brønsted-Lowry acid.',
    qA: { q: 'Its conjugate base is:', type: 'ce', options: ['SO4^2-', 'H2SO4', 'SO3^2-', 'S^2-'], answer: 'SO4^2-' },
    qB: { q: 'Here the species is acting as a(n):', type: 'text', options: ['acid', 'base'], answer: 'acid' },
    explain: 'Remove one H+ from HSO4- to get its conjugate base SO4^2-.' },
  { kind: 'conjugate', ce: 'CH3COO^-', text: 'The acetate ion can act as a Brønsted-Lowry base.',
    qA: { q: 'Its conjugate acid is:', type: 'ce', options: ['CH3COOH', 'CH3COO^-', 'CO2', 'CH4'], answer: 'CH3COOH' },
    qB: { q: 'Here the species is acting as a(n):', type: 'text', options: ['acid', 'base'], answer: 'base' },
    explain: 'Add one H+ to acetate to get its conjugate acid, acetic acid (CH3COOH).' },
  { kind: 'conjugate', ce: 'H2PO4^-', text: 'The dihydrogen phosphate ion can act as a Brønsted-Lowry acid.',
    qA: { q: 'Its conjugate base is:', type: 'ce', options: ['HPO4^2-', 'H3PO4', 'PO4^3-', 'P^3-'], answer: 'HPO4^2-' },
    qB: { q: 'Here the species is acting as a(n):', type: 'text', options: ['acid', 'base'], answer: 'acid' },
    explain: 'Remove one H+ from H2PO4- to get HPO4^2-.' },
  { kind: 'framework', text: '"An Arrhenius acid increases the concentration of H3O+ in water."',
    qA: { q: 'This statement is which definition?', type: 'text', options: ['Arrhenius', 'Brønsted-Lowry'], answer: 'Arrhenius' },
    qB: { q: 'It is describing a(n):', type: 'text', options: ['acid', 'base'], answer: 'acid' },
    explain: 'In water, an Arrhenius acid increases H3O+ concentration.' },
  { kind: 'framework', text: '"An Arrhenius base increases the concentration of OH- in water."',
    qA: { q: 'This statement is which definition?', type: 'text', options: ['Arrhenius', 'Brønsted-Lowry'], answer: 'Arrhenius' },
    qB: { q: 'It is describing a(n):', type: 'text', options: ['acid', 'base'], answer: 'base' },
    explain: 'In water, an Arrhenius base increases OH- concentration.' },
  { kind: 'framework', text: '"An acid is a proton (H+) donor."',
    qA: { q: 'This statement is which definition?', type: 'text', options: ['Arrhenius', 'Brønsted-Lowry'], answer: 'Brønsted-Lowry' },
    qB: { q: 'It is describing a(n):', type: 'text', options: ['acid', 'base'], answer: 'acid' },
    explain: 'Brønsted-Lowry defines an acid as a proton donor, with no need for water.' },
  { kind: 'framework', text: '"A base is a proton (H+) acceptor."',
    qA: { q: 'This statement is which definition?', type: 'text', options: ['Arrhenius', 'Brønsted-Lowry'], answer: 'Brønsted-Lowry' },
    qB: { q: 'It is describing a(n):', type: 'text', options: ['acid', 'base'], answer: 'base' },
    explain: 'Brønsted-Lowry defines a base as a proton acceptor.' },
  { kind: 'framework', text: 'NH3 has no OH- in its formula, yet it makes water basic by accepting a proton from H2O and producing OH-.',
    qA: { q: 'Which definition explains NH3 as a base?', type: 'text', options: ['Arrhenius', 'Brønsted-Lowry'], answer: 'Brønsted-Lowry' },
    qB: { q: 'NH3 is acting as a(n):', type: 'text', options: ['acid', 'base'], answer: 'base' },
    explain: 'Arrhenius cannot call NH3 a base (it has no OH-). Brønsted-Lowry can: NH3 accepts a proton.' }
];

// ===================== C.12(C) strong vs weak =====================
// Single-family banks. A card draws four of one family with at least one strong
// and one weak, so sorting them is the dissociation lesson. Strong species ionize
// completely; weak species ionize only partially.
export const STRENGTH = {
  acid: {
    strong: [
      { f: 'HCl',   name: 'hydrochloric acid' },
      { f: 'HBr',   name: 'hydrobromic acid' },
      { f: 'HI',    name: 'hydroiodic acid' },
      { f: 'HNO3',  name: 'nitric acid' },
      { f: 'H2SO4', name: 'sulfuric acid' },
      { f: 'HClO4', name: 'perchloric acid' }
    ],
    weak: [
      { f: 'HF',       name: 'hydrofluoric acid' },
      { f: 'CH3COOH',  name: 'acetic acid' },
      { f: 'H2CO3',    name: 'carbonic acid' },
      { f: 'H3PO4',    name: 'phosphoric acid' },
      { f: 'HNO2',     name: 'nitrous acid' },
      { f: 'H2S',      name: 'hydrosulfuric acid' },
      { f: 'HClO',     name: 'hypochlorous acid' },
      { f: 'HCN',      name: 'hydrocyanic acid' }
    ]
  },
  base: {
    strong: [
      { f: 'LiOH',    name: 'lithium hydroxide' },
      { f: 'NaOH',    name: 'sodium hydroxide' },
      { f: 'KOH',     name: 'potassium hydroxide' },
      { f: 'RbOH',    name: 'rubidium hydroxide' },
      { f: 'CsOH',    name: 'cesium hydroxide' },
      { f: 'Ba(OH)2', name: 'barium hydroxide' }
    ],
    weak: [
      { f: 'NH3',     name: 'ammonia' },
      { f: 'CH3NH2',  name: 'methylamine' },
      { f: 'C2H5NH2', name: 'ethylamine' },
      { f: 'N2H4',    name: 'hydrazine' }
    ]
  }
};

// The "why" question paired with each strength card.
export const STRENGTH_REASON = {
  acid: {
    q: 'At equal formal concentration, why do strong acids in this activity generally have lower pH than weak acids?',
    options: [
      'Strong acids ionize essentially completely in water, producing more H3O+ than weak acids.',
      'Strong acids simply contain more hydrogen atoms.',
      'Strong acids are always more concentrated.',
      'Strong acids are always larger molecules.'
    ],
    answer: 'Strong acids ionize essentially completely in water, producing more H3O+ than weak acids.'
  },
  base: {
    q: 'At equal formal concentration, why do the strong bases in this activity generally have higher pH than weak bases?',
    options: [
      'Strong soluble hydroxides dissociate essentially completely, producing more OH- than weak bases.',
      'Strong bases simply contain more oxygen atoms.',
      'Strong bases are always more concentrated.',
      'Strong bases are always heavier compounds.'
    ],
    answer: 'Strong soluble hydroxides dissociate essentially completely, producing more OH- than weak bases.'
  }
};

// ===================== C.12(D) neutralization =====================
// Strong acids and bases only, so the salt-plus-water product is clean and the
// titration-to-neutral pH readout stays valid. Each acid provides an anion (with
// charge magnitude and proton count); each base provides a cation (charge +
// hydroxide count).
export const NEUT_ACIDS = [
  { f: 'HCl',   name: 'hydrochloric acid', anion: 'Cl',   anionName: 'chloride',    poly: false, charge: 1, protons: 1,
    where: 'muriatic-acid products used for masonry and pool pH control' },
  { f: 'HBr',   name: 'hydrobromic acid',  anion: 'Br',   anionName: 'bromide',     poly: false, charge: 1, protons: 1,
    where: 'a laboratory reagent used in chemical synthesis' },
  { f: 'HNO3',  name: 'nitric acid',       anion: 'NO3',  anionName: 'nitrate',     poly: true,  charge: 1, protons: 1,
    where: 'metal processing and laboratory oxidation chemistry' },
  { f: 'HClO4', name: 'perchloric acid',   anion: 'ClO4', anionName: 'perchlorate', poly: true,  charge: 1, protons: 1,
    where: 'specialized laboratory oxidation chemistry' },
  { f: 'H2SO4', name: 'sulfuric acid',     anion: 'SO4',  anionName: 'sulfate',     poly: true,  charge: 2, protons: 2,
    where: 'lead-acid batteries and industrial sulfuric-acid use' }
];

export const NEUT_BASES = [
  { f: 'NaOH',    name: 'sodium hydroxide',    cation: 'Na', cationName: 'sodium',    charge: 1, hydroxides: 1 },
  { f: 'KOH',     name: 'potassium hydroxide', cation: 'K',  cationName: 'potassium', charge: 1, hydroxides: 1 },
  { f: 'LiOH',    name: 'lithium hydroxide',   cation: 'Li', cationName: 'lithium',   charge: 1, hydroxides: 1 },
  { f: 'Ca(OH)2', name: 'calcium hydroxide',   cation: 'Ca', cationName: 'calcium',   charge: 2, hydroxides: 2 },
  { f: 'Ba(OH)2', name: 'barium hydroxide',    cation: 'Ba', cationName: 'barium',    charge: 2, hydroxides: 2 }
];

// ===================== Honors h2: weak-acid Ka -> pH =====================
// `poly` is additive and load-bearing for the h2 generator: the two polyprotic acids do
// not draw the 0.010 M concentration. Measured across all seven acids and all seven
// concentrations, the smallest gap between the true pH and the -log(Ka) misread is
// 0.120 pH at H3PO4 with C = 0.010, which clears the plus-or-minus-0.10 window by only
// 0.020 pH. Dropping that one concentration for the polyprotic pair takes the smallest
// surviving gap to 0.144 pH (H3PO4 at C = 0.025), so the margin more than doubles and the
// thin case is closed by construction rather than by a tolerance a later edit can loosen.
export const WEAK_ACIDS = [
  { f: 'CH3COOH',  name: 'acetic acid',       Ka: 1.8e-5, poly: false, note: '' },
  { f: 'HF',       name: 'hydrofluoric acid', Ka: 6.8e-4, poly: false, note: '' },
  { f: 'HCOOH',    name: 'formic acid',       Ka: 1.8e-4, poly: false, note: '' },
  { f: 'HClO',     name: 'hypochlorous acid', Ka: 3.0e-8, poly: false, note: '' },
  { f: 'C6H5COOH', name: 'benzoic acid',      Ka: 6.3e-5, poly: false, note: '' }
];
export const WEAK_CONCS = [0.010, 0.025, 0.050, 0.10, 0.25, 0.50, 1.0];

// ===================== Honors h1: indicators =====================
// An indicator is a good choice when its color-change range brackets the
// equivalence-point pH. For a strong acid / strong base titration that pH is 7.
export const INDICATORS = [
  { name: 'methyl orange',    lo: 3.1, hi: 4.4 },
  { name: 'bromothymol blue', lo: 6.0, hi: 7.6 },
  { name: 'phenolphthalein',  lo: 8.3, hi: 10.0 }
];

// ===================== Dose bands, measured against this unit's own pools =====================
//
// NEUTRALIZE (C.12D), absolute 0.01 / 0.02 mol. This is the shipped tolerance expressed as
// a band, not a new one: genNeutralize builds neutralBase = moleRatio(coefAcid, coefBase,
// molAcid) where acid protons are 1 or 2 and base hydroxides are 1 or 2, so the ratio is
// always 0.5, 1 or 2 and molAcid is drawn from 0.20 to 1.00 mol. The smallest gap a wrong
// ratio can produce is 0.5 x 0.20 = 0.10 mol, five times the acceptable window, and the
// input steps 0.01 so the exact answer is always typable. Absolute, not relative: the
// answer is a mole figure under 2, where a relative window would be tighter than the input.
export const NEUT_BANDS = { mode: 'absolute', ideal: 0.01, acceptable: 0.02 };

// METER (C.12E), absolute 0.05 / 0.10 pH. Preserves today's pass condition exactly and adds
// the band granularity the verdict needs. The hole this closes was in the GENERATOR, not the
// band: the mantissa pool used to be [1, 2, 3, 4, 5, 8], so the pH answer was p minus one of
// 0, 0.3010, 0.4771, 0.6021, 0.6990, 0.9031 and the 4-versus-5 misread is only 0.0969 out,
// inside a plus-or-minus-0.10 window. Dropping 4 takes the smallest adjacent gap to 0.1761.
// Tightening the band instead would have doubled the fine-motor demand on a 1400-step
// slider, trading a chemistry gate for a dexterity one.
export const METER_MANTISSAS = [1, 2, 3, 5, 8];
export const METER_BANDS = { mode: 'absolute', ideal: 0.05, acceptable: 0.10 };

// WEAK ACID (honors h2), absolute 0.05 / 0.10 pH. The failure this stage tests is reporting
// -log(Ka) instead of -log(sqrt(Ka x C)); with the polyprotic 0.010 M draws removed (see the
// WEAK_ACIDS comment) the smallest surviving gap is 0.144 pH. Treating the concentration as
// the hydrogen-ion concentration instead is at minimum 0.379 pH off.
export const WEAK_BANDS = { mode: 'absolute', ideal: 0.05, acceptable: 0.10 };

// TITRATION (honors h1), per-scenario absolute bands. Veq runs from 5 mL (Ca 0.05, Va 20,
// Cb 0.20) to 200 mL (Ca 0.20, Va 50, Cb 0.05), so one module const cannot serve both ends:
// a pure relative band is unreachable at the small end and slack at the large one. outcomeBand
// has no "maximum of" mode, so the generator computes the pair. This reproduces the shipped
// pass condition, max(0.5, 2 percent of Veq), exactly.
export const titrBands = Veq => ({
  mode: 'absolute',
  ideal: Math.max(0.3, 0.01 * Veq),
  acceptable: Math.max(0.5, 0.02 * Veq)
});

// ===================== SCENARIOS: the game layer =====================
// You are the overnight tech on the poison-control bench, one night shift. The calls come in
// from the phone in the same building; the patient in the next room is the thread that runs
// all night, acidotic at pH 7.20 with a target window of 7.35 to 7.45. Every stage's
// chemistry tool is unchanged (the segment name builder, the conjugate cards, the strength
// shelf, the criss-cross steppers, the pH meter, the titration curve). The fiction, the
// consequences and the world-state are what make it a shift rather than a worksheet.
//   Dose (C.12D, C.12E, h1, h2): commit a number. outcomeBand grades YOUR value against the
//     true requirement: in the window vs called low / called high (each a named consequence)
//     vs unresolved.
//   Decision and identity (C.12A, C.12B, C.12C, capstone): the consequence belongs to
//     whatever varies per draw, which for these stages is WHICH HALF of the call went wrong,
//     so each scenario carries `right` plus one string per failure direction. The per-item
//     chemistry stays in the stage's existing explain text.
//   Stages that grade two things carry a third string for the mixed case (a right number
//     under a wrong second call), because falling back on `low` would print "you called it
//     low" over a value that was exactly right.
//   constraints: what the generator pins, always by pool key, so a scenario can never
//     silently reference something that is not in the pool.
//   delta: pH the call moves the patient by, and it is ZERO for every call that cannot
//     physically reach them. Only six scenarios touch the patient: the transfer sheet the
//     resident orders from, the buffer note, the flag on the four bottles from the scene,
//     the blood gas, the titration the ward doses against, and the handover. A phone call
//     about a soda, a bucket of cleaner or an antacid box does not change somebody else's
//     arterial pH, and pretending it does is the incoherent fiction this layer exists to
//     avoid. What those calls cost is `minutes`, and while the patient is outside the
//     reference range they drift down with elapsed time, so a slow wrong answer costs twice.
export const SCENARIOS = [
  // ---------- C.12(A) naming ----------
  { id: 'a-caller', stage: 'naming', skill: 'a', type: 'identity',
    system: 'Formula on the label', icon: '\u{1F4DE}',
    goal: 'A product label gives only a chemical formula. Build the correct acid or base name from its parts.',
    why: 'A correct chemical name communicates which substance the formula represents. Use the naming pattern, not the scenario, to determine the name.',
    constraints: { formulas: ['HF', 'HCl', 'HBr', 'HI', 'H2S', 'LiOH', 'NaOH', 'KOH', 'Ba(OH)2', 'Fe(OH)2', 'Fe(OH)3'] },
    delta: { ok: 0, wrong: 0 }, minutes: { ok: 6, wrong: 16 },
    actionLabel: 'Check the name',
    right: 'The formula and name match.',
    wrongStem: 'The selected element or charge does not match the formula. Check the formula before choosing the name parts.',
    wrongSuffix: 'The element family is correct, but the ending is not. Recheck the binary-acid, oxyacid, or hydroxide naming rule.' },
  { id: 'a-antacid', stage: 'naming', skill: 'a', type: 'identity',
    system: 'Antacid ingredient', icon: '\u{1F48A}',
    goal: 'An antacid label lists its active ingredient as a formula. Name the compound using the hydroxide-base naming rule.',
    why: 'Many antacid ingredients are bases. Naming the compound correctly connects its formula with the ions it contains.',
    constraints: { formulas: ['Mg(OH)2', 'Ca(OH)2', 'Al(OH)3'] },
    delta: { ok: 0, wrong: 0 }, minutes: { ok: 5, wrong: 15 },
    actionLabel: 'Check the ingredient',
    right: 'The formula and compound name match.',
    wrongStem: 'The metal does not match the formula. Identify the cation first.',
    wrongSuffix: 'The anion name is incorrect. These compounds contain hydroxide, OH-.' },
  { id: 'a-sheet', stage: 'naming', skill: 'a', type: 'identity',
    system: 'Laboratory transfer sheet', icon: '\u{1F4CB}',
    goal: 'A transfer sheet lists an acid by formula. Build its correct name using the binary-acid or oxyacid naming pattern.',
    why: 'Related oxyacids can differ by only one oxygen atom, so the prefix and suffix must match the formula.',
    constraints: { formulas: ['HNO3', 'HNO2', 'H2SO4', 'H2SO3', 'H2CO3', 'H3PO4', 'H3PO3', 'HC2H3O2', 'HClO4', 'HClO3', 'HClO2', 'HClO'] },
    delta: { ok: 0, wrong: 0 }, minutes: { ok: 7, wrong: 18 },
    actionLabel: 'Check the sheet',
    right: 'The formula and acid name agree.',
    wrongStem: 'The selected root or prefix does not match the formula.',
    wrongSuffix: 'The root is correct, but the acid ending does not match the related anion.' },

  // ---------- C.12(B) definitions and conjugate pairs ----------
  { id: 'b-ammonia', stage: 'define', skill: 'b', type: 'decision',
    system: 'Acid-base definitions', icon: '\u{1F9F4}',
    goal: 'Identify which acid-base definition matches the statement, then identify whether the species is acting as an acid or a base.',
    why: 'Arrhenius focuses on H3O+ and OH- in water. Brønsted-Lowry focuses on proton transfer and applies to a wider range of reactions.',
    constraints: { kinds: ['framework'] },
    delta: { ok: 0, wrong: 0 }, minutes: { ok: 6, wrong: 17 },
    actionLabel: 'Check the definition',
    right: 'The framework and acid-base role are both correct.',
    wrongA: 'The framework is incorrect. Compare what the statement says about water, H3O+, OH-, or proton transfer.',
    wrongB: 'The framework is correct, but the acid-base role is reversed. Check whether the species donates or accepts a proton.' },
  { id: 'b-buffer', stage: 'define', skill: 'b', type: 'decision',
    system: 'Bicarbonate buffer pair', icon: '\u{1FA78}',
    goal: 'Identify the conjugate partner of the species on the card and determine whether that species is acting as an acid or a base.',
    why: 'Conjugate acid-base pairs differ by one H+. The carbonic-acid/bicarbonate system is an important real-world example of this relationship.',
    constraints: { kinds: ['conjugate'] },
    delta: { ok: 0, wrong: 0 }, minutes: { ok: 7, wrong: 19 },
    actionLabel: 'Check the pair',
    right: 'The conjugate partner and acid-base role are correct.',
    wrongA: 'The selected partner is not the conjugate species. Conjugate partners differ by exactly one H+.',
    wrongB: 'The partner is correct, but the role is reversed. A Brønsted-Lowry acid donates H+; a base accepts H+.' },

  // ---------- C.12(C) strong versus weak ----------
  { id: 'c-sink', stage: 'strength', skill: 'c', type: 'decision',
    system: 'Acid comparison', icon: '\u{1F374}',
    goal: 'Classify the acids as strong or weak, then explain how acid strength affects [H3O+] at equal formal concentration.',
    why: 'Strength and concentration are different properties. Strong acids ionize essentially completely in water; weak acids ionize only partially.',
    constraints: { fams: ['acid'], strong: ['HCl', 'H2SO4'], weak: ['CH3COOH', 'H2CO3', 'H3PO4', 'HClO'], must: ['CH3COOH', 'HCl'] },
    delta: { ok: 0, wrong: 0 }, minutes: { ok: 7, wrong: 18 },
    actionLabel: 'Check the classification',
    right: 'The acids are classified by their extent of ionization in water.',
    wrongSort: 'At least one acid is on the wrong side. Recheck which acids are treated as strong in this course.',
    wrongReason: 'The classifications are correct, but the explanation confuses strength with concentration or molecular composition.' },
  { id: 'c-cart', stage: 'strength', skill: 'c', type: 'decision',
    system: 'Base comparison', icon: '\u{1F9F9}',
    goal: 'Classify the bases as strong or weak, then explain why the strong bases produce more OH- at equal formal concentration.',
    why: 'Strong soluble hydroxides dissociate essentially completely. Weak molecular bases such as ammonia react with water only partially.',
    constraints: { fams: ['base'], strong: ['NaOH', 'KOH'], weak: ['NH3', 'CH3NH2', 'C2H5NH2'], must: ['NH3', 'NaOH'] },
    delta: { ok: 0, wrong: 0 }, minutes: { ok: 7, wrong: 18 },
    actionLabel: 'Check the classification',
    right: 'The bases are classified by how they produce OH- in water.',
    wrongSort: 'At least one base is on the wrong side. Recheck the strong hydroxides and weak molecular bases.',
    wrongReason: 'The classifications are correct, but the explanation does not connect base strength with OH- production in water.' },
  { id: 'c-sheet', stage: 'strength', skill: 'c', type: 'decision',
    system: 'Strength and hazard', icon: '\u{1F6A8}',
    goal: 'Classify the four acids as strong or weak, then explain why acid strength is not the same as chemical hazard.',
    why: 'Acid strength describes extent of ionization, not overall danger. For example, HF is a weak acid but is highly hazardous because fluoride can cause severe local and systemic toxicity.',
    constraints: { fams: ['acid'] },
    delta: { ok: 0, wrong: 0 }, minutes: { ok: 8, wrong: 22 },
    actionLabel: 'Check the comparison',
    right: 'The strength classification is correct, and strength has been kept separate from hazard.',
    wrongSort: 'At least one acid is misclassified. Use extent of ionization, not perceived danger.',
    wrongReason: 'The classifications may be correct, but the explanation must distinguish acid strength from hazard.' },

  // ---------- C.12(D) neutralization ----------
  { id: 'd-bucket', stage: 'neutralize', skill: 'd', type: 'dose',
    system: 'Spill-model calculation', icon: '\u{1FAA3}',
    goal: 'For this controlled simulation, predict the salt and calculate the moles of base required for stoichiometric neutralization.',
    why: 'Use the balanced acid-base reaction to match acid equivalents with hydroxide equivalents. Real chemical spills should be handled according to laboratory or emergency procedures, not by improvised neutralization.',
    constraints: { acids: ['HCl', 'HNO3'], bases: ['NaOH', 'KOH'] },
    bands: NEUT_BANDS,
    delta: { ok: 0, low: 0, high: 0 }, minutes: { ok: 9, wrong: 22 },
    actionLabel: 'Check the amount',
    safeState: 'WITHIN TOLERANCE', lowState: 'BELOW TARGET', highState: 'ABOVE TARGET',
    safe: 'The calculated amount satisfies this activity criterion for stoichiometric neutralization.',
    low: 'The amount is below the stoichiometric target. Recheck the acid-to-base mole ratio.',
    high: 'The amount is above the stoichiometric target. Recheck the coefficients and equivalents.',
    saltWrong: 'The neutralization amount is within tolerance, but the salt formula is incorrect. Balance the ion charges again.',
    fail: 'Enter a numerical amount of base before checking the result.' },
  { id: 'd-decon', stage: 'neutralize', skill: 'd', type: 'dose',
    system: 'Wastewater-model calculation', icon: '\u{1F6BF}',
    goal: 'For this activity model, predict the salt and calculate the moles of base required for stoichiometric neutralization.',
    why: 'This activity isolates acid-base stoichiometry. A neutral pH by itself does not establish that real chemical waste is safe or legal to discharge; identity, concentration, and applicable rules also matter.',
    constraints: { acids: ['H2SO4', 'HClO4', 'HBr'], bases: ['Ca(OH)2', 'Ba(OH)2', 'LiOH', 'NaOH'], nonUnity: true },
    bands: NEUT_BANDS,
    delta: { ok: 0, low: 0, high: 0 }, minutes: { ok: 10, wrong: 25 },
    actionLabel: 'Check the amount',
    safeState: 'WITHIN TOLERANCE', lowState: 'BELOW TARGET', highState: 'ABOVE TARGET',
    safe: 'The calculated amount satisfies this activity criterion for neutralization.',
    low: 'The amount is below the stoichiometric target. Recheck how many acidic protons and hydroxides are represented by the formulas.',
    high: 'The amount is above the stoichiometric target. Recheck the balanced mole ratio.',
    saltWrong: 'The amount is within tolerance, but the salt formula is incorrect. Recheck the cation and anion charges.',
    fail: 'Enter a numerical amount of base before checking the result.' },

  // ---------- C.12(E) pH ----------
  { id: 'e-soda', stage: 'meter', skill: 'e', type: 'dose',
    system: 'Soft-drink sample', icon: '\u{1F964}',
    goal: 'Use the measured hydrogen-ion concentration to calculate the pH of the sample, then classify it as acidic, neutral, or basic.',
    why: 'pH is logarithmic. A change of one pH unit corresponds to a tenfold change in hydrogen-ion concentration.',
    constraints: { kinds: ['H'], p: [3, 4] },
    bands: METER_BANDS,
    delta: { ok: 0, low: 0, high: 0 }, minutes: { ok: 6, wrong: 16 },
    actionLabel: 'Check the pH',
    safeState: 'WITHIN TOLERANCE', lowState: 'pH TOO LOW', highState: 'pH TOO HIGH',
    safe: 'The pH and classification agree with the given [H+].',
    low: 'The pH is below the target. Recheck the negative logarithm.',
    high: 'The pH is above the target. Recheck the exponent and logarithm.',
    classWrong: 'The pH is within tolerance, but the classification does not match its position relative to pH 7 for this aqueous sample.',
    fail: 'Set a pH value and choose a classification before checking the result.' },
  { id: 'e-bleach', stage: 'meter', skill: 'e', type: 'dose',
    system: 'Hydroxide sample', icon: '\u{1F9F4}',
    goal: 'The sample is reported as [OH-]. Calculate pOH, convert to pH at 25 °C, then classify the aqueous sample.',
    why: 'At 25 °C, pH + pOH = 14.00. A hydroxide concentration must therefore be converted through pOH before the pH is reported.',
    constraints: { kinds: ['OH'], p: [2, 5] },
    bands: METER_BANDS,
    delta: { ok: 0, low: 0, high: 0 }, minutes: { ok: 7, wrong: 18 },
    actionLabel: 'Check the pH',
    safeState: 'WITHIN TOLERANCE', lowState: 'pH TOO LOW', highState: 'pH TOO HIGH',
    safe: 'The pOH-to-pH conversion and classification are correct for this sample.',
    low: 'The pH is below the target. Check whether the pOH value was converted using pH + pOH = 14.00.',
    high: 'The pH is above the target. Recheck the pOH calculation and subtraction from 14.00.',
    classWrong: 'The pH is within tolerance, but the acidic/neutral/basic classification is incorrect.',
    fail: 'Set a pH value and choose a classification before checking the result.' },
  { id: 'e-gas', stage: 'meter', skill: 'e', type: 'dose',
    system: 'Near-neutral calibration sample', icon: '\u{1FA79}',
    goal: 'Convert the reported hydrogen-ion concentration to pH and classify the aqueous calibration sample.',
    why: 'Near pH 7, small numerical pH differences still represent meaningful multiplicative changes in [H+]. Use the logarithm rather than estimating from the exponent alone.',
    constraints: { kinds: ['H'], p: [7, 8], mantissas: [5, 8] },
    bands: METER_BANDS,
    delta: { ok: 0, low: 0, high: 0 }, minutes: { ok: 8, wrong: 22 },
    actionLabel: 'Check the pH',
    safeState: 'WITHIN TOLERANCE', lowState: 'pH TOO LOW', highState: 'pH TOO HIGH',
    safe: 'The pH and classification agree with the measured [H+].',
    low: 'The pH is below the target. Recheck -log[H+].',
    high: 'The pH is above the target. Recheck -log[H+].',
    classWrong: 'The pH is within tolerance, but the classification is incorrect for an aqueous sample at 25 °C.',
    fail: 'Set a pH value and choose a classification before checking the result.' },

  // ---------- Honors h1: titration ----------
  { id: 'h1-titrate', stage: 'honors1', skill: 'h1', type: 'dose',
    system: 'Strong acid-base titration', icon: '\u{1F9EA}',
    goal: 'Move the titration to the equivalence volume, then select the listed indicator whose transition range includes pH 7.00.',
    why: 'For this strong-acid/strong-base model, equivalence occurs when acid and base equivalents are equal and the modeled equivalence pH is 7.00. Activity criterion: choose the listed indicator whose range includes pH 7.00; in real titrations, more than one indicator can sometimes be suitable because the pH changes steeply near equivalence.',
    delta: { ok: 0, low: 0, high: 0 }, minutes: { ok: 11, wrong: 26 },
    actionLabel: 'Check equivalence',
    safeState: 'WITHIN TOLERANCE', lowState: 'BELOW EQUIVALENCE', highState: 'ABOVE EQUIVALENCE',
    safe: 'The selected volume is within this activity tolerance and the indicator meets the activity criterion.',
    low: 'The selected volume is below the calculated equivalence volume.',
    high: 'The selected volume is above the calculated equivalence volume.',
    indWrong: 'The volume is within tolerance, but the selected indicator does not meet this activity criterion. Choose the listed range that includes pH 7.00.',
    fail: 'Select an indicator and an equivalence volume before checking the result.' },

  // ---------- Honors h2: weak monoprotic acid ----------
  { id: 'h2-weak', stage: 'honors2', skill: 'h2', type: 'dose',
    system: 'Weak-acid equilibrium', icon: '\u{1F9C3}',
    goal: 'Use Ka and the formal concentration of a weak monoprotic acid to calculate equilibrium [H+] and pH.',
    why: 'For a weak acid, the formal acid concentration is not equal to [H+]. Use the equilibrium expression to determine x = [H+] before applying pH = -log[H+].',
    delta: { ok: 0, low: 0, high: 0 }, minutes: { ok: 11, wrong: 26 },
    actionLabel: 'Check the pH',
    safeState: 'WITHIN TOLERANCE', lowState: 'pH TOO LOW', highState: 'pH TOO HIGH',
    safe: 'The pH agrees with the weak-acid equilibrium model.',
    low: 'The pH is below the equilibrium result. Recheck whether concentration was incorrectly treated as [H+].',
    high: 'The pH is above the equilibrium result. Recheck the equilibrium expression and logarithm.',
    fail: 'Set a pH value before checking the result.' },

  // ---------- Capstone ----------
  { id: 'cap-last', stage: 'capstone', skill: 'cap', type: 'decision',
    system: 'Acid-base capstone', icon: '\u{1F305}',
    goal: 'For one unknown acid sample, name the acid, classify its strength, predict the salt formed with the given base, and calculate the neutralizing amount.',
    why: 'The capstone connects the four core ideas used throughout the unit: naming, strength, product prediction, and neutralization stoichiometry.',
    delta: { ok: 0, wrong: 0 }, minutes: { ok: 12, wrong: 30 },
    right: 'All four chemistry steps are correct.',
    wrong: 'At least one chemistry step needs revision. Use the feedback to identify the first step that does not match the evidence.' }
];
