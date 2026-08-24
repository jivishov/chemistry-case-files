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
    text: 'Define acids and bases; distinguish Arrhenius from Bronsted-Lowry and identify the conjugate pair.' },
  { id: 'c',  code: 'C.12(C)', mode: 'strength',   honors: false,
    text: 'Differentiate strong from weak acids and bases by their extent of dissociation.' },
  { id: 'd',  code: 'C.12(D)', mode: 'neutralize', honors: false,
    text: 'Predict the products of acid-base reactions that form water.' },
  { id: 'e',  code: 'C.12(E)', mode: 'meter',      honors: false,
    text: 'Define pH and calculate it from the hydrogen-ion concentration.' },
  { id: 'h1', code: 'Honors',  mode: 'neutralize', honors: true,
    text: 'Honors: drive a titration curve to the equivalence point and pick the indicator.' },
  { id: 'h2', code: 'Honors',  mode: 'meter',      honors: true,
    text: 'Honors: find the pH of a weak acid from its Ka, including polyprotic acids.' }
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
    where: 'glass-etching cream, and the one burn that hides for hours' },
  { f: 'HCl',     name: 'hydrochloric acid', kind: 'binary', prefix: 'hydro',  root: 'chlor',    suffix: '-ic acid',
    where: 'sold as muriatic acid for concrete and pool pH; also your stomach' },
  { f: 'HBr',     name: 'hydrobromic acid',  kind: 'binary', prefix: 'hydro',  root: 'brom',     suffix: '-ic acid',
    where: 'a lab reagent drum, and older flame-retardant chemistry' },
  { f: 'HI',      name: 'hydroiodic acid',   kind: 'binary', prefix: 'hydro',  root: 'iod',      suffix: '-ic acid',
    where: 'a lab reagent that browns on the shelf as it oxidises in light' },
  { f: 'H2S',     name: 'hydrosulfuric acid',kind: 'binary', prefix: 'hydro',  root: 'sulfur',   suffix: '-ic acid',
    where: 'rotten-egg gas dissolved in water, in sewers and hot springs' },
  { f: 'HNO3',    name: 'nitric acid',       kind: 'oxy',    prefix: '(none)', root: 'nitr',     suffix: '-ic acid',
    where: 'fertilizer plants and metal etching; it stains skin yellow on contact' },
  { f: 'HNO2',    name: 'nitrous acid',      kind: 'oxy',    prefix: '(none)', root: 'nitr',     suffix: '-ous acid',
    where: 'formed in place from nitrite in cured-meat chemistry' },
  { f: 'H2SO4',   name: 'sulfuric acid',     kind: 'oxy',    prefix: '(none)', root: 'sulfur',   suffix: '-ic acid',
    where: 'car battery acid, and the most-produced chemical on earth' },
  { f: 'H2SO3',   name: 'sulfurous acid',    kind: 'oxy',    prefix: '(none)', root: 'sulfur',   suffix: '-ous acid',
    where: 'what sulfur dioxide becomes when it dissolves in rain' },
  { f: 'H2CO3',   name: 'carbonic acid',     kind: 'oxy',    prefix: '(none)', root: 'carbon',   suffix: '-ic acid',
    where: 'every carbonated drink, rainwater, and your own blood buffer' },
  { f: 'H3PO4',   name: 'phosphoric acid',   kind: 'oxy',    prefix: '(none)', root: 'phosphor', suffix: '-ic acid',
    where: 'the tang in cola, and the rust converter in a hardware aisle' },
  { f: 'H3PO3',   name: 'phosphorous acid',  kind: 'oxy',    prefix: '(none)', root: 'phosphor', suffix: '-ous acid',
    where: 'a lab reducing agent, and a fungicide feedstock' },
  { f: 'HC2H3O2', name: 'acetic acid',       kind: 'oxy',    prefix: '(none)', root: 'acet',     suffix: '-ic acid',
    where: 'vinegar, at about 5 percent' },
  { f: 'HClO4',   name: 'perchloric acid',   kind: 'oxy',    prefix: 'per',    root: 'chlor',    suffix: '-ic acid',
    where: 'the oxidiser cabinet, and solid rocket propellant' },
  { f: 'HClO3',   name: 'chloric acid',      kind: 'oxy',    prefix: '(none)', root: 'chlor',    suffix: '-ic acid',
    where: 'a strong bleaching and oxidising agent, unstable when concentrated' },
  { f: 'HClO2',   name: 'chlorous acid',     kind: 'oxy',    prefix: '(none)', root: 'chlor',    suffix: '-ous acid',
    where: 'the short-lived acid behind chlorite bleaching' },
  { f: 'HClO',    name: 'hypochlorous acid', kind: 'oxy',    prefix: 'hypo',   root: 'chlor',    suffix: '-ous acid',
    where: 'what bleach becomes in pool water; the form that actually disinfects' }
];

// Hydroxide bases: metal name (+ roman numeral for a variable-charge metal) +
// hydroxide. The roman numeral is '(none)' for fixed-charge metals.
export const BASE_NAMES = [
  { f: 'LiOH',    name: 'lithium hydroxide',   kind: 'base', metal: 'lithium',   roman: '(none)', suffix: 'hydroxide',
    where: 'the carbon-dioxide scrubber on a submarine and a spacecraft' },
  { f: 'NaOH',    name: 'sodium hydroxide',    kind: 'base', metal: 'sodium',    roman: '(none)', suffix: 'hydroxide',
    where: 'drain cleaner and lye; the most common caustic call on this line' },
  { f: 'KOH',     name: 'potassium hydroxide', kind: 'base', metal: 'potassium', roman: '(none)', suffix: 'hydroxide',
    where: 'the electrolyte inside an alkaline battery, and soft soap' },
  { f: 'Mg(OH)2', name: 'magnesium hydroxide', kind: 'base', metal: 'magnesium', roman: '(none)', suffix: 'hydroxide',
    where: 'milk of magnesia, off a bathroom shelf' },
  { f: 'Ca(OH)2', name: 'calcium hydroxide',   kind: 'base', metal: 'calcium',   roman: '(none)', suffix: 'hydroxide',
    where: 'slaked lime, in mortar and in water treatment' },
  { f: 'Ba(OH)2', name: 'barium hydroxide',    kind: 'base', metal: 'barium',    roman: '(none)', suffix: 'hydroxide',
    where: 'a lab titrant for weak acids; barium salts are their own poisoning' },
  { f: 'Al(OH)3', name: 'aluminum hydroxide',  kind: 'base', metal: 'aluminum',  roman: '(none)', suffix: 'hydroxide',
    where: 'the gel in a chewable antacid tablet' },
  { f: 'Fe(OH)2', name: 'iron(II) hydroxide',  kind: 'base', metal: 'iron',      roman: '(II)',   suffix: 'hydroxide',
    where: 'the green sludge in an oxygen-poor rust pit' },
  { f: 'Fe(OH)3', name: 'iron(III) hydroxide', kind: 'base', metal: 'iron',      roman: '(III)',  suffix: 'hydroxide',
    where: 'the orange stain in the creek below an iron-rich spring' }
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
//   kind 'framework' -> qA picks Arrhenius vs Bronsted-Lowry, qB the role.
export const DEFINE_POOL = [
  { kind: 'conjugate', ce: 'HCO3^-', text: 'The bicarbonate ion can act as a Bronsted-Lowry acid.',
    qA: { q: 'Its conjugate base is:', type: 'ce', options: ['CO3^2-', 'H2CO3', 'OH^-', 'CO2'], answer: 'CO3^2-' },
    qB: { q: 'Here the species is acting as a(n):', type: 'text', options: ['acid', 'base'], answer: 'acid' },
    explain: 'A Bronsted-Lowry acid donates a proton. Remove one H+ from HCO3- to get its conjugate base CO3^2-.' },
  { kind: 'conjugate', ce: 'NH3', text: 'Ammonia can act as a Bronsted-Lowry base.',
    qA: { q: 'Its conjugate acid is:', type: 'ce', options: ['NH4^+', 'NH2^-', 'NO3^-', 'N2'], answer: 'NH4^+' },
    qB: { q: 'Here the species is acting as a(n):', type: 'text', options: ['acid', 'base'], answer: 'base' },
    explain: 'A base accepts a proton. Add one H+ to NH3 to get its conjugate acid NH4+.' },
  { kind: 'conjugate', ce: 'H2O', text: 'Water can act as a Bronsted-Lowry acid (it is amphoteric).',
    qA: { q: 'Its conjugate base is:', type: 'ce', options: ['OH^-', 'H3O^+', 'O2', 'H2'], answer: 'OH^-' },
    qB: { q: 'Here the species is acting as a(n):', type: 'text', options: ['acid', 'base'], answer: 'acid' },
    explain: 'Acting as an acid, water donates a proton: H2O minus H+ gives OH-.' },
  { kind: 'conjugate', ce: 'H2O', text: 'Water can also act as a Bronsted-Lowry base (it is amphoteric).',
    qA: { q: 'Its conjugate acid is:', type: 'ce', options: ['H3O^+', 'OH^-', 'H2O2', 'H2'], answer: 'H3O^+' },
    qB: { q: 'Here the species is acting as a(n):', type: 'text', options: ['acid', 'base'], answer: 'base' },
    explain: 'Acting as a base, water accepts a proton: H2O plus H+ gives the hydronium ion H3O+.' },
  { kind: 'conjugate', ce: 'HSO4^-', text: 'The hydrogen sulfate ion can act as a Bronsted-Lowry acid.',
    qA: { q: 'Its conjugate base is:', type: 'ce', options: ['SO4^2-', 'H2SO4', 'SO3^2-', 'S^2-'], answer: 'SO4^2-' },
    qB: { q: 'Here the species is acting as a(n):', type: 'text', options: ['acid', 'base'], answer: 'acid' },
    explain: 'Remove one H+ from HSO4- to get its conjugate base SO4^2-.' },
  { kind: 'conjugate', ce: 'CH3COO^-', text: 'The acetate ion can act as a Bronsted-Lowry base.',
    qA: { q: 'Its conjugate acid is:', type: 'ce', options: ['CH3COOH', 'CH3COO^-', 'CO2', 'CH4'], answer: 'CH3COOH' },
    qB: { q: 'Here the species is acting as a(n):', type: 'text', options: ['acid', 'base'], answer: 'base' },
    explain: 'Add one H+ to acetate to get its conjugate acid, acetic acid (CH3COOH).' },
  { kind: 'conjugate', ce: 'H2PO4^-', text: 'The dihydrogen phosphate ion can act as a Bronsted-Lowry acid.',
    qA: { q: 'Its conjugate base is:', type: 'ce', options: ['HPO4^2-', 'H3PO4', 'PO4^3-', 'P^3-'], answer: 'HPO4^2-' },
    qB: { q: 'Here the species is acting as a(n):', type: 'text', options: ['acid', 'base'], answer: 'acid' },
    explain: 'Remove one H+ from H2PO4- to get HPO4^2-.' },
  { kind: 'framework', text: '"An acid is any substance that produces H+ ions when dissolved in water."',
    qA: { q: 'This statement is which definition?', type: 'text', options: ['Arrhenius', 'Bronsted-Lowry'], answer: 'Arrhenius' },
    qB: { q: 'It is describing a(n):', type: 'text', options: ['acid', 'base'], answer: 'acid' },
    explain: 'Arrhenius defines acids and bases by the ions they release in water: H+ for an acid.' },
  { kind: 'framework', text: '"A base is any substance that produces OH- ions when dissolved in water."',
    qA: { q: 'This statement is which definition?', type: 'text', options: ['Arrhenius', 'Bronsted-Lowry'], answer: 'Arrhenius' },
    qB: { q: 'It is describing a(n):', type: 'text', options: ['acid', 'base'], answer: 'base' },
    explain: 'Arrhenius bases release OH- in water.' },
  { kind: 'framework', text: '"An acid is a proton (H+) donor."',
    qA: { q: 'This statement is which definition?', type: 'text', options: ['Arrhenius', 'Bronsted-Lowry'], answer: 'Bronsted-Lowry' },
    qB: { q: 'It is describing a(n):', type: 'text', options: ['acid', 'base'], answer: 'acid' },
    explain: 'Bronsted-Lowry defines an acid as a proton donor, with no need for water.' },
  { kind: 'framework', text: '"A base is a proton (H+) acceptor."',
    qA: { q: 'This statement is which definition?', type: 'text', options: ['Arrhenius', 'Bronsted-Lowry'], answer: 'Bronsted-Lowry' },
    qB: { q: 'It is describing a(n):', type: 'text', options: ['acid', 'base'], answer: 'base' },
    explain: 'Bronsted-Lowry defines a base as a proton acceptor.' },
  { kind: 'framework', text: 'NH3 has no OH- to release, yet it makes a solution basic by taking H+ from water.',
    qA: { q: 'Which definition explains NH3 as a base?', type: 'text', options: ['Arrhenius', 'Bronsted-Lowry'], answer: 'Bronsted-Lowry' },
    qB: { q: 'NH3 is acting as a(n):', type: 'text', options: ['acid', 'base'], answer: 'base' },
    explain: 'Arrhenius cannot call NH3 a base (it has no OH-). Bronsted-Lowry can: NH3 accepts a proton.' }
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
    q: 'At equal concentration, why does the strong acid have the lowest pH?',
    options: [
      'It ionizes completely, giving the highest [H+].',
      'It simply contains more hydrogen atoms.',
      'It is more concentrated than the others.',
      'It is a larger molecule.'
    ],
    answer: 'It ionizes completely, giving the highest [H+].'
  },
  base: {
    q: 'At equal concentration, why does the strong base have the highest pH?',
    options: [
      'It ionizes completely, giving the highest [OH-].',
      'It simply contains more oxygen atoms.',
      'It is more concentrated than the others.',
      'It is a heavier compound.'
    ],
    answer: 'It ionizes completely, giving the highest [OH-].'
  }
};

// ===================== C.12(D) neutralization =====================
// Strong acids and bases only, so the salt-plus-water product is clean and the
// titration-to-neutral pH readout stays valid. Each acid provides an anion (with
// charge magnitude and proton count); each base provides a cation (charge +
// hydroxide count).
export const NEUT_ACIDS = [
  { f: 'HCl',   name: 'hydrochloric acid', anion: 'Cl',   anionName: 'chloride',    poly: false, charge: 1, protons: 1,
    where: 'muriatic acid, poured for concrete and pool pH' },
  { f: 'HBr',   name: 'hydrobromic acid',  anion: 'Br',   anionName: 'bromide',     poly: false, charge: 1, protons: 1,
    where: 'a lab reagent drum in the store room' },
  { f: 'HNO3',  name: 'nitric acid',       anion: 'NO3',  anionName: 'nitrate',     poly: true,  charge: 1, protons: 1,
    where: 'the metal-etching bath in a machine shop' },
  { f: 'HClO4', name: 'perchloric acid',   anion: 'ClO4', anionName: 'perchlorate', poly: true,  charge: 1, protons: 1,
    where: 'the oxidiser cabinet, kept away from everything organic' },
  { f: 'H2SO4', name: 'sulfuric acid',     anion: 'SO4',  anionName: 'sulfate',     poly: true,  charge: 2, protons: 2,
    where: 'battery acid, and the carboy under the bench' }
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
  { f: 'CH3COOH',   name: 'acetic acid',      Ka: 1.8e-5, poly: false, note: '' },
  { f: 'HF',        name: 'hydrofluoric acid', Ka: 6.8e-4, poly: false, note: '' },
  { f: 'HCOOH',     name: 'formic acid',      Ka: 1.8e-4, poly: false, note: '' },
  { f: 'HClO',      name: 'hypochlorous acid', Ka: 3.0e-8, poly: false, note: '' },
  { f: 'C6H5COOH',  name: 'benzoic acid',     Ka: 6.3e-5, poly: false, note: '' },
  { f: 'H2CO3',     name: 'carbonic acid',    Ka: 4.3e-7, poly: true,  note: 'diprotic; the first ionization (Ka1) dominates the pH' },
  { f: 'H3PO4',     name: 'phosphoric acid',  Ka: 7.5e-3, poly: true,  note: 'triprotic; use Ka1 for the first ionization' }
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
  // ---------- C.12(A) naming: identity ----------
  { id: 'a-caller', stage: 'naming', skill: 'a', type: 'identity',
    system: 'The phone', icon: '\u{1F4DE}',
    goal: 'A caller has the bottle in one hand and half a label in the other, so they are reading you a formula instead of a name. Build the name from its rule parts before you can tell them anything else.',
    why: 'Nothing on this bench happens until the substance has a name. The name is what the poison database is keyed on, what the chart says, and what the doctor in the next room repeats back. A formula read down a phone is the only thing you get, and it is enough.',
    constraints: { formulas: ['HF', 'HCl', 'HBr', 'HI', 'H2S', 'LiOH', 'NaOH', 'KOH', 'Ba(OH)2', 'Fe(OH)2', 'Fe(OH)3'] },
    delta: { ok: 0, wrong: 0 }, minutes: { ok: 6, wrong: 16 },
    actionLabel: 'Name it for the caller',
    right: 'The name goes into the log and the database returns the right protocol first time. You are off the phone in under a minute and back at the bench.',
    wrongStem: 'You name the wrong element. That is not the same substance, it is a different poisoning with a different protocol, and the caller is now following advice written for something they do not have.',
    wrongSuffix: 'You get the element right and the ending wrong. The family holds, so the advice is not absurd, but the ending is the part that says which form of it this is, and the database returns the neighbouring entry.' },
  { id: 'a-antacid', stage: 'naming', skill: 'a', type: 'identity',
    system: 'The bathroom shelf', icon: '\u{1F48A}',
    goal: 'A parent is holding an antacid box and a child who ate most of a roll of it. The active ingredient is on the box as a formula. Name it.',
    why: 'This is the friendliest call of the night and it is still the same skill. The antacids on this shelf are hydroxide bases, which is why they neutralise stomach acid at all; plenty of others are carbonates instead, and those work the same way with a different anion. The metal in front of the hydroxide is what decides whether this is a nothing call or a trip in.',
    constraints: { formulas: ['Mg(OH)2', 'Ca(OH)2', 'Al(OH)3'] },
    delta: { ok: 0, wrong: 0 }, minutes: { ok: 5, wrong: 15 },
    actionLabel: 'Name the ingredient',
    right: 'Named, logged, and the advice matches the ingredient. The parent stays home and the line is free for the next call.',
    wrongStem: 'You name the wrong metal. The advice you give belongs to a different tablet, and the one thing a parent needed to hear tonight was which one they had.',
    wrongSuffix: 'The ending is wrong, so what you have written down is not the compound in the box. A hydroxide and an oxide of the same metal do not behave the same way in a stomach.' },
  { id: 'a-sheet', stage: 'naming', skill: 'a', type: 'identity',
    system: 'The transfer sheet', icon: '\u{1F4CB}',
    goal: 'The paramedics wrote a formula on the transfer sheet for the patient in the next room. Whatever is in the bag has to match what is on that sheet. Name it.',
    why: 'The transfer sheet is the only account of what happened before the doors opened, and it follows the patient upstairs. An oxyacid named one ending out is a different acid with a different strength, and the resident who reads it will not know that you guessed.',
    constraints: { formulas: ['HNO3', 'HNO2', 'H2SO4', 'H2SO3', 'H2CO3', 'H3PO4', 'H3PO3', 'HC2H3O2', 'HClO4', 'HClO3', 'HClO2', 'HClO'] },
    delta: { ok: 0.10, wrong: -0.05 }, minutes: { ok: 7, wrong: 18 },
    actionLabel: 'Sign off the sheet',
    right: 'The sheet and the bag agree. The resident reads one name, orders against it, and nobody has to re-open the question at three in the morning.',
    wrongStem: 'The root is wrong, so the sheet now names an acid that was never in the room. Everything ordered off it is ordered for the wrong exposure.',
    wrongSuffix: 'You have the element and the wrong ending. That is the difference between the -ate acid and the -ite acid: same family, different strength, and the strength is what the next hour is about.' },

  // ---------- C.12(B) definitions and conjugate pairs: decision ----------
  { id: 'b-ammonia', stage: 'define', skill: 'b', type: 'decision',
    system: 'The cleaning cupboard', icon: '\u{1F9F4}',
    goal: 'A caller is reading the back of a bottle from under their sink and wants to know what actually makes it an acid or a base. Say which definition covers the statement in front of you, and which side of the pair it describes.',
    why: 'Arrhenius is the definition most people carry, and it cannot explain half of what is under a sink: ammonia releases no OH and is a base anyway. Bronsted-Lowry can, because it moves the question from what a substance releases to what it does with a proton. Half the calls on this line are substances Arrhenius has nothing to say about.',
    constraints: { kinds: ['framework'] },
    delta: { ok: 0, wrong: 0 }, minutes: { ok: 6, wrong: 17 },
    actionLabel: 'Answer the caller',
    right: 'The explanation lands, the caller understands why that bottle is dangerous mixed with bleach, and the call ends without a trip to anybody.',
    wrongA: 'You pick the wrong framework. The answer you give is the one that cannot account for what the caller is looking at, so it sounds like a dodge and they call back.',
    wrongB: 'You get the framework and reverse the role. Telling somebody a base is an acid is the one mistake on this line that makes them do the opposite of the right thing.' },
  { id: 'b-buffer', stage: 'define', skill: 'b', type: 'decision',
    system: 'The bicarbonate buffer', icon: '\u{1FA78}',
    goal: 'The patient next door is held where they are by the bicarbonate buffer in their blood, which works by handing protons back and forth. Identify the conjugate partner of the species on the card, and say which role it is playing here.',
    why: 'A buffer is a conjugate pair and nothing more. The pair in that patient is carbonic acid against bicarbonate, and the entire reason their pH is 7.20 rather than 6.8 is that the pair keeps trading the proton. If you cannot find a conjugate partner you cannot read a blood gas.',
    constraints: { kinds: ['conjugate'] },
    delta: { ok: 0.10, wrong: -0.05 }, minutes: { ok: 7, wrong: 19 },
    actionLabel: 'Call the pair',
    right: 'The pair is right, so the note on the chart says which direction the buffer still has room to move, and the resident dosing bicarbonate knows what it is going to do.',
    wrongA: 'The partner is wrong, which means it is not a conjugate pair at all: you have written down two species that differ by more than one proton, and a buffer note built on that is worthless.',
    wrongB: 'The species is right and the role is backwards. A pair that you think is donating when it is accepting predicts the pH moving the wrong way, which on this patient is the wrong drug.' },

  // ---------- C.12(C) strong versus weak: decision ----------
  { id: 'c-sink', stage: 'strength', skill: 'c', type: 'decision',
    system: 'Under the sink', icon: '\u{1F374}',
    goal: 'The vinegar in the kitchen and the pool acid in the garage are both acids, and at the same concentration they are not the same call. Sort the shelf in front of you into strong and weak, then say why the strong one reads the lowest pH.',
    why: 'Concentration and strength are two different things and the public uses one word for both. A dilute strong acid can put more hydrogen ion into solution than a concentrated weak one, because strength is how much of it comes apart in water, not how much of it is in the bottle.',
    // The brief names the vinegar and the pool acid, so both are required draws, and the
    // rest of the shelf is what is actually under a sink or on a garage bench. Without
    // this the shelf could read HCN / HClO4 / H2S under a brief about vinegar.
    constraints: { fams: ['acid'], strong: ['HCl', 'H2SO4'],
                   weak: ['CH3COOH', 'H2CO3', 'H3PO4', 'HClO'], must: ['CH3COOH', 'HCl'] },
    delta: { ok: 0, wrong: 0 }, minutes: { ok: 7, wrong: 18 },
    actionLabel: 'Sort the shelf',
    right: 'The shelf is sorted the way the bottles actually behave, so the advice on each one matches the risk it carries rather than the size of the label.',
    wrongSort: 'A bottle is on the wrong side. Calling a strong acid weak is how a caller gets told to rinse and wait when they needed to be on their way in.',
    wrongReason: 'The sort holds and the reason does not. Without extent of dissociation the sort is a list you memorised, and the next bottle, the one that is not on the list, gets called wrong.' },
  { id: 'c-cart', stage: 'strength', skill: 'c', type: 'decision',
    system: 'The cleaning cart', icon: '\u{1F9F9}',
    goal: 'Housekeeping left a cart in the corridor with four bases on it, and one of them is the reason a caller an hour ago could not stop coughing. Sort them strong from weak, then give the reason.',
    why: 'Ammonia and lye are both bases, and at the same concentration lye puts far more hydroxide into solution because it dissociates completely, while ammonia only takes a proton from water some of the time. That is the difference this stage is about, and on a caustic it happens to track the injury too: a strong hydroxide keeps saponifying tissue after the rinse.',
    // `why` is built on ammonia and lye, and the cough that opens the brief is ammonia,
    // so both are required draws. The strong half stops at the two hydroxides that are
    // actually in cleaning product; rubidium and caesium hydroxide are not on a
    // housekeeping cart in a hospital corridor.
    constraints: { fams: ['base'], strong: ['NaOH', 'KOH'],
                   weak: ['NH3', 'CH3NH2', 'C2H5NH2'], must: ['NH3', 'NaOH'] },
    delta: { ok: 0, wrong: 0 }, minutes: { ok: 7, wrong: 18 },
    actionLabel: 'Sort the cart',
    right: 'The cart is labelled by what each bottle does in water. The strong ones go behind a lock and the corridor stops being a hazard.',
    wrongSort: 'A bottle is on the wrong side of the cart, so the one that puts the most hydroxide into solution is not the one that gets locked up.',
    wrongReason: 'The sort is right for the wrong reason. Highest hydroxide concentration is the whole mechanism, and without it the next unfamiliar bottle is a guess.' },
  { id: 'c-sheet', stage: 'strength', skill: 'c', type: 'decision',
    system: 'Four bottles on the sheet', icon: '\u{1F6A8}',
    goal: 'The transfer sheet lists four acids that were in the room the patient came from. Sort them strong from weak, then say why the strong one sits lowest on the pH scale. Which one it was decides how much acid load the patient actually took.',
    why: 'The patient next door is acidotic because of what came off that sheet, and how much hydrogen ion a given amount delivers is exactly what strength means. One warning, because it is the thing this stage could teach by accident: strong is not the same as dangerous. Hydrofluoric acid is a WEAK acid and one of the worst things on any of these shelves, because the fluoride goes through skin and pulls calcium out of bone hours later. Strength tells you the pH. It does not tell you the injury.',
    constraints: { fams: ['acid'] },
    delta: { ok: 0.12, wrong: -0.06 }, minutes: { ok: 8, wrong: 22 },
    actionLabel: 'Flag the sheet',
    right: 'The sheet is flagged with the acid that actually loads the blood, the resident orders against that, and the number on the next blood gas stops falling.',
    wrongSort: 'You put a bottle on the wrong side, so the sheet understates how much hydrogen ion the patient took and the correction is sized for a smaller exposure than the one that happened.',
    wrongReason: 'The flag is right and the reasoning is not, so nobody upstairs can tell whether the call was chemistry or a coin flip, and it gets re-run anyway.' },

  // ---------- C.12(D) neutralization: dose plus a salt prediction ----------
  { id: 'd-bucket', stage: 'neutralize', skill: 'd', type: 'dose',
    system: 'The bucket in the garage', icon: '\u{1FAA3}',
    goal: 'Somebody mixed two bottles in a bucket to save a trip and now there is an acid on their garage floor and a base on the shelf beside it. Predict the salt the two make, then call how many moles of base it takes to bring the spill to neutral.',
    why: 'Neutralisation is the one piece of chemistry the public tries at home, and the arithmetic is what decides whether it works. Under-dose and there is still acid on the floor. Over-dose and the floor is caustic instead, which is the same burn from the other direction. What a crew would actually reach for is a weak base or an absorbent, for exactly that reason; the arithmetic is identical and this is the version you can check.',
    constraints: { acids: ['HCl', 'HNO3'], bases: ['NaOH', 'KOH'] },
    bands: NEUT_BANDS,
    delta: { ok: 0, low: 0, high: 0 }, minutes: { ok: 9, wrong: 22 },
    actionLabel: 'Call the amount',
    safeState: 'NEUTRAL', lowState: 'STILL ACID', highState: 'NOW CAUSTIC',
    safe: 'The fizzing stops and the pH paper reads neutral across the whole puddle. They mop it up with water and that is the end of the call.',
    low: 'You call it short. The middle of the puddle goes quiet and the edges are still acid, so they kneel on it in an hour thinking it is done.',
    high: 'You call it long. The acid is gone and the floor is now caustic, which does not fizz, does not smell, and burns slowly enough that nobody notices until it has.',
    saltWrong: 'The amount of base is right, so the floor ends up neutral. The salt is what you got wrong, and that is the half that says what is left behind: they need to know whether the dried crust on the concrete is table salt or something they should not sweep up dry.',
    fail: 'The number never resolved, so nothing goes on the floor and the acid stays where it is.' },
  { id: 'd-decon', stage: 'neutralize', skill: 'd', type: 'dose',
    system: 'The decon room drum', icon: '\u{1F6BF}',
    goal: 'The rinse water off the patient is sitting in the decon drum with a measured amount of acid in it, and it cannot go to the drain like that. Predict the salt, then call the moles of base the drum takes.',
    why: 'This is the same arithmetic the resident is about to do with bicarbonate on the patient next door, run on a drum where getting it wrong only costs a drum. Moles of hydrogen ion against moles of hydroxide, nothing else, and the coefficients are what make it not a one-to-one.',
    // nonUnity is a generator RULE, not a preference: this scenario's `why` teaches that
    // the coefficients are what make it not a one-to-one, which is false on any pair
    // whose proton count equals its hydroxide count. Six of this pool's twelve pairs
    // survive the rule, which is more variety than the stage needs.
    constraints: { acids: ['H2SO4', 'HClO4', 'HBr'], bases: ['Ca(OH)2', 'Ba(OH)2', 'LiOH', 'NaOH'],
                   nonUnity: true },
    bands: NEUT_BANDS,
    delta: { ok: 0, low: 0, high: 0 }, minutes: { ok: 10, wrong: 25 },
    actionLabel: 'Dose the drum',
    safeState: 'DRUM NEUTRAL', lowState: 'STILL ACID', highState: 'OVERSHOT CAUSTIC',
    safe: 'The drum comes to neutral, the paperwork clears it for the drain, and the decon room is back in service before the next ambulance.',
    low: 'You dose it short. The drum is still acid, it fails the check at the drain, and the room stays closed while the next patient waits in the corridor.',
    high: 'You overshoot. The drum is caustic now and fails the same check from the other side, and the base you wasted was the bench stock.',
    saltWrong: 'The dose is right, so the drum is neutral. The salt call is what is wrong, and on a drum going to a public drain the salt is exactly what the paperwork asks for: a sulfate and a bromide are not the same line on the form.',
    fail: 'The number never resolved, so the drum sits in the corner acid, and the decon room stays closed.' },

  // ---------- C.12(E) pH from [H+]: dose plus a classification ----------
  { id: 'e-soda', stage: 'meter', skill: 'e', type: 'dose',
    system: 'The soda a caller is worried about', icon: '\u{1F964}',
    goal: 'A caller read something online, dipped a pool test strip in a soft drink and did not like the colour. You have the same drink out of the machine in the corridor, and the bench meter has given you its hydrogen-ion concentration. Set the pH, then classify it.',
    why: 'This is the call that teaches the scale. The number they read is frightening because it is small, and pH is what turns it into something a person can hold: each whole step is a factor of ten in hydrogen ion, which is why a drink at pH 2.5 and a stomach at 1.5 are not the same thing at all.',
    constraints: { kinds: ['H'], p: [3, 4] },   // pH 2.10 to 4.00: the real soft-drink range
    bands: METER_BANDS,
    delta: { ok: 0, low: 0, high: 0 }, minutes: { ok: 6, wrong: 16 },
    actionLabel: 'Lock the meter',
    safeState: 'READ RIGHT', lowState: 'READ LOW', highState: 'READ HIGH',
    safe: 'The pH is right, the caller gets a real comparison instead of a headline, and the call is closed in three minutes.',
    low: 'You read the meter low, so you tell them it is more acidic than it is, and a caller who was already frightened now has a number that says worse.',
    high: 'You read it high, so it sounds harmless. That is the direction that gets a genuinely acidic exposure sent away without advice.',
    classWrong: 'The pH itself is right. What you called wrong is which side of neutral it sits on, and that is the half the caller repeats back to somebody else.',
    fail: 'The reading never resolved, so nothing goes in the log and the caller is told to ring back.' },
  { id: 'e-bleach', stage: 'meter', skill: 'e', type: 'dose',
    system: 'The bucket that would not rinse', icon: '\u{1F9F4}',
    goal: 'A caller has a bucket of cleaner on their hands that will not wash off, and the sample they brought reads a hydroxide-ion concentration, not a hydrogen one. Set the pH, then classify the bucket.',
    why: 'Half the samples on this bench come in as hydroxide. pH plus pOH is 14 because of water itself, so a hydroxide reading is a pH reading you have not finished converting, and skipping the conversion puts your answer on the wrong side of the scale entirely.',
    constraints: { kinds: ['OH'], p: [2, 5] },
    bands: METER_BANDS,
    delta: { ok: 0, low: 0, high: 0 }, minutes: { ok: 7, wrong: 18 },
    actionLabel: 'Lock the meter',
    safeState: 'READ RIGHT', lowState: 'READ LOW', highState: 'READ HIGH',
    safe: 'The conversion holds, the bucket is called basic at the right pH, and the caller is told to keep rinsing rather than to neutralise it with something from a cupboard.',
    low: 'You read it low. A strongly basic bucket logged as nearly neutral is one that gets rinsed for thirty seconds instead of twenty minutes, and caustic keeps going after the water stops.',
    high: 'You read it high. Overstating it is safer than understating it here, but the number still does not match the sample, and the log is what the follow-up call is answered from.',
    classWrong: 'The pH is right and the class is not, which almost always means the pOH conversion never happened: a hydroxide reading called acidic is the exact shape of that mistake.',
    fail: 'The reading never resolved, so nothing goes in the log while the caller is still on the line with wet hands.' },
  { id: 'e-gas', stage: 'meter', skill: 'e', type: 'dose',
    system: 'The blood gas that just printed', icon: '\u{1FA79}',
    goal: 'The blood gas on the patient next door prints hydrogen-ion concentration, and every protocol upstairs is written in pH. Convert it and classify it before anybody acts on it.',
    why: 'This is the number the whole night turns on. Arterial blood runs 7.35 to 7.45, and under about 7.20 is a treated emergency. Watch the trap in the second half: a patient at 7.10 is acidotic, which is the word the resident will use, and the sample is still BASIC on the chemical scale, because basic means above 7 and blood never goes anywhere near it. Clinically acidotic and chemically basic at the same time, and the meter only knows the second one.',
    constraints: { kinds: ['H'], p: [8, 8], mantissas: [5, 8] },
    bands: METER_BANDS,
    delta: { ok: 0.12, low: -0.06, high: -0.06 }, minutes: { ok: 8, wrong: 22 },
    actionLabel: 'Post the gas',
    safeState: 'GAS POSTED', lowState: 'POSTED LOW', highState: 'POSTED HIGH',
    safe: 'The pH goes on the chart correctly, the resident doses against a real number, and the next gas comes back closer to the window.',
    low: 'You post it low, so the patient looks sicker than they are and gets pushed harder than they need. Over-correction has its own name and its own complications.',
    high: 'You post it high, so the patient looks better than they are. Nothing is escalated, the drift continues, and the next gas is worse than this one.',
    classWrong: 'The pH is right and the chemical class is not. Blood sits above 7 even when a patient is dangerously acidotic, so anything above 7 is basic here however sick they are: acidosis is a move DOWN the scale, not a crossing of it. Reading it the other way is classifying off the clinical word instead of off the number.',
    fail: 'The conversion never resolved, so the gas sits unposted on the printer and nobody upstairs knows anything yet.' },

  // ---------- Honors h1 (parent d): titration curve and indicator choice ----------
  { id: 'h1-titrate', stage: 'honors1', skill: 'h1', type: 'dose',
    system: 'The sample from the scene', icon: '\u{1F9EA}',
    goal: 'A measured volume of the strong acid from the scene is in the flask and the burette holds standard base. Drive it to the equivalence point, then pick the indicator that would show it if you were doing this without a meter.',
    why: 'The bench told you the concentration on the transfer sheet; a titration is how anybody proves it. The equivalence point is where moles of hydrogen ion equal moles of hydroxide, and the indicator is only useful if its colour change happens to sit where that is, which for a strong acid against a strong base is pH 7.',
    delta: { ok: 0.08, low: -0.03, high: -0.03 }, minutes: { ok: 11, wrong: 26 },
    actionLabel: 'Confirm equivalence',
    safeState: 'ENDPOINT HIT', lowState: 'STOPPED SHORT', highState: 'RAN PAST',
    safe: 'The endpoint matches the calculated equivalence volume, so the concentration on the sheet is confirmed and the number the ward is dosing against is real.',
    low: 'You stop short of equivalence. The titre comes out low, so the sample is reported weaker than it is, and the exposure looks smaller than it was.',
    high: 'You run past equivalence. The titre is high, the sample is reported stronger than it is, and the ward prepares for a worse exposure than actually happened.',
    indWrong: 'The volume is right, so the concentration you report is right. The indicator is what you got wrong, and that is the half that matters the next time this is run without a meter: a dye that turns two pH units off the equivalence point reports a volume that was never the endpoint.',
    fail: 'The titration never resolved, so the sample goes upstairs with a concentration nobody has checked.' },

  // ---------- Honors h2 (parent e): weak-acid Ka to pH ----------
  { id: 'h2-weak', stage: 'honors2', skill: 'h2', type: 'dose',
    system: 'The bottle that was only five percent', icon: '\u{1F9C3}',
    goal: 'A caller drank from a bottle of a weak acid and the concentration is on the label. A weak acid only partly ionizes, so the concentration is not the hydrogen-ion concentration. Work the equilibrium and set the pH.',
    why: 'This is the call people are most likely to get wrong in both directions. Vinegar at 0.9 M is not pH 0.05, because almost none of it comes apart, and pH is not -log(Ka) either. The equilibrium is the only thing that gives you the actual number, and the actual number is what decides whether this is a glass of water and a wait or a trip in.',
    delta: { ok: 0, low: 0, high: 0 }, minutes: { ok: 11, wrong: 26 },
    actionLabel: 'Lock the meter',
    safeState: 'PH CALLED', lowState: 'CALLED LOW', highState: 'CALLED HIGH',
    safe: 'The pH matches the equilibrium, the advice matches the pH, and a call that sounded alarming ends at home with a glass of water.',
    low: 'You call it too acidic, which is what happens when the concentration is treated as the hydrogen-ion concentration. Somebody who was fine at home gets sent in.',
    high: 'You call it not acidic enough, which is what happens when the equilibrium is skipped in the other direction. A real exposure gets treated as a nothing call.',
    fail: 'The pH never resolved, so the caller is left holding the bottle with no advice against it.' },

  // ---------- Capstone: the last call of the night ----------
  { id: 'cap-last', stage: 'capstone', skill: 'cap', type: 'decision',
    system: 'The last call of the night', icon: '\u{1F305}',
    goal: 'One unlabelled beaker came in with the last ambulance, and the day shift arrives in an hour. Name the acid, call its strength, predict the salt it makes with the base on the bench, and neutralize it. Every skill in C.12 in one run.',
    why: 'The shift does not hand over on five separate skills, it hands over on one beaker where all of them were right at the same time. That is what a bench is: each step giving the next one something it can trust.',
    delta: { ok: 0.20, wrong: -0.08 }, minutes: { ok: 12, wrong: 30 },
    right: 'Named, classed, the salt predicted and the beaker brought to neutral. The handover sheet is one page, the patient next door is in the window, and the day shift starts from a bench that is right.',
    wrong: 'The beaker does not stand up. One step out anywhere in the run is a handover the day shift has to redo from the beginning, on the one patient who cannot wait for it.' }
];
