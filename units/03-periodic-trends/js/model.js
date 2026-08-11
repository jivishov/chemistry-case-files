// model.js — Unit 3 domain data (Periodic Table & Trends, TEKS C.5).
// Pure data. Periodic-position + valence math lives in shared/js/chem.js;
// atomic mass and electronegativity are read from chem.js by symbol. The numbers
// that cannot be derived from a simple rule (radius, first ionization energy,
// a qualitative reactivity index, family) live here as measured reference data.

// Standards map: each C.5 sub-letter drives one mode; two Honors rows extend the
// trends mode. Unique ids keep the right-rail x-for keys distinct (C.5(C) repeats).
export const SE = [
  { id: 'a',  code: 'C.5(A)', mode: 'table',    honors: false,
    text: 'Explain how the Periodic Table developed over time using evidence from chemical and physical properties.' },
  { id: 'b',  code: 'C.5(B)', mode: 'families', honors: false,
    text: 'Predict the properties of chemical families (alkali, alkaline earth, halogens, noble gases, transition metals) from valence-electron patterns.' },
  { id: 'c',  code: 'C.5(C)', mode: 'trends',   honors: false,
    text: 'Analyze and interpret elemental data (atomic radius, atomic mass, electronegativity, ionization energy, reactivity) to identify periodic trends.' },
  { id: 'h1', code: 'C.5(C)', mode: 'trends',   honors: true,
    text: 'Honors: use effective nuclear charge and electron shielding to explain why radius shrinks and ionization energy rises across a period.' },
  { id: 'h2', code: 'C.5(C)', mode: 'trends',   honors: true,
    text: 'Honors: account for the ionization-energy dips at Groups 13 and 16 from subshell stability and electron pairing.' }
];

// Per-element reference data for the 37 elements we study.
//   group     periodic-table column (1-18); the row/period is derived in the view.
//   radius    calculated atomic radius in pm (Clementi 1963 set). ONE consistent
//             definition for every element, including noble gases, so the period
//             and group trends stay monotonic. Do not mix in covalent/vdW radii.
//   ie1       first ionization energy in kJ/mol (standard tables).
//   reactivity a 0-100 qualitative reactivity index used only by the family meter
//             (reactivity is taught qualitatively, never plotted as a data series).
//   family    one of: hydrogen, alkali, alkaline-earth, transition, metalloid,
//             post-transition, nonmetal, halogen, noble.
export const ELEMENT_DATA = [
  { sym: 'H',  group: 1,  radius: 53,  ie1: 1312, reactivity: 40, family: 'hydrogen' },
  { sym: 'He', group: 18, radius: 31,  ie1: 2372, reactivity: 1,  family: 'noble' },
  { sym: 'Li', group: 1,  radius: 167, ie1: 520,  reactivity: 35, family: 'alkali' },
  { sym: 'Be', group: 2,  radius: 112, ie1: 899,  reactivity: 12, family: 'alkaline-earth' },
  { sym: 'B',  group: 13, radius: 87,  ie1: 801,  reactivity: 20, family: 'metalloid' },
  { sym: 'C',  group: 14, radius: 67,  ie1: 1086, reactivity: 25, family: 'nonmetal' },
  { sym: 'N',  group: 15, radius: 56,  ie1: 1402, reactivity: 18, family: 'nonmetal' },
  { sym: 'O',  group: 16, radius: 48,  ie1: 1314, reactivity: 70, family: 'nonmetal' },
  { sym: 'F',  group: 17, radius: 42,  ie1: 1681, reactivity: 98, family: 'halogen' },
  { sym: 'Ne', group: 18, radius: 38,  ie1: 2081, reactivity: 1,  family: 'noble' },
  { sym: 'Na', group: 1,  radius: 190, ie1: 496,  reactivity: 60, family: 'alkali' },
  { sym: 'Mg', group: 2,  radius: 145, ie1: 738,  reactivity: 35, family: 'alkaline-earth' },
  { sym: 'Al', group: 13, radius: 118, ie1: 578,  reactivity: 40, family: 'post-transition' },
  { sym: 'Si', group: 14, radius: 111, ie1: 786,  reactivity: 22, family: 'metalloid' },
  { sym: 'P',  group: 15, radius: 98,  ie1: 1012, reactivity: 55, family: 'nonmetal' },
  { sym: 'S',  group: 16, radius: 88,  ie1: 1000, reactivity: 45, family: 'nonmetal' },
  { sym: 'Cl', group: 17, radius: 79,  ie1: 1251, reactivity: 82, family: 'halogen' },
  { sym: 'Ar', group: 18, radius: 71,  ie1: 1521, reactivity: 1,  family: 'noble' },
  { sym: 'K',  group: 1,  radius: 243, ie1: 419,  reactivity: 85, family: 'alkali' },
  { sym: 'Ca', group: 2,  radius: 194, ie1: 590,  reactivity: 55, family: 'alkaline-earth' },
  { sym: 'Sc', group: 3,  radius: 184, ie1: 633,  reactivity: 30, family: 'transition' },
  { sym: 'Ti', group: 4,  radius: 176, ie1: 659,  reactivity: 25, family: 'transition' },
  { sym: 'V',  group: 5,  radius: 171, ie1: 651,  reactivity: 28, family: 'transition' },
  { sym: 'Cr', group: 6,  radius: 166, ie1: 653,  reactivity: 22, family: 'transition' },
  { sym: 'Mn', group: 7,  radius: 161, ie1: 717,  reactivity: 35, family: 'transition' },
  { sym: 'Fe', group: 8,  radius: 156, ie1: 762,  reactivity: 38, family: 'transition' },
  { sym: 'Co', group: 9,  radius: 152, ie1: 760,  reactivity: 28, family: 'transition' },
  { sym: 'Ni', group: 10, radius: 149, ie1: 737,  reactivity: 25, family: 'transition' },
  { sym: 'Cu', group: 11, radius: 145, ie1: 745,  reactivity: 15, family: 'transition' },
  { sym: 'Zn', group: 12, radius: 142, ie1: 906,  reactivity: 30, family: 'transition' },
  { sym: 'Br', group: 17, radius: 94,  ie1: 1140, reactivity: 62, family: 'halogen' },
  { sym: 'Ag', group: 11, radius: 165, ie1: 731,  reactivity: 8,  family: 'transition' },
  { sym: 'I',  group: 17, radius: 115, ie1: 1008, reactivity: 42, family: 'halogen' },
  { sym: 'Ba', group: 2,  radius: 253, ie1: 503,  reactivity: 72, family: 'alkaline-earth' },
  { sym: 'Au', group: 11, radius: 174, ie1: 890,  reactivity: 3,  family: 'transition' },
  { sym: 'Hg', group: 12, radius: 171, ie1: 1007, reactivity: 10, family: 'transition' },
  { sym: 'Pb', group: 14, radius: 154, ie1: 716,  reactivity: 18, family: 'post-transition' }
];

// Human-readable label + tint key for each family (the tint colors live in
// css/style.css). Copper is reserved for Honors, so no family uses it.
export const FAMILY_LABELS = {
  hydrogen:          'Hydrogen',
  alkali:            'Alkali metal',
  'alkaline-earth':  'Alkaline earth metal',
  transition:        'Transition metal',
  metalloid:         'Metalloid',
  'post-transition': 'Post-transition metal',
  nonmetal:          'Nonmetal',
  halogen:           'Halogen',
  noble:             'Noble gas'
};

// ---- C.5(A): how the Periodic Table developed, with the evidence used ----
// Each entry carries a `viz` schematic so students can see, not just read, how
// that era's arrangement looked. The view renders one mini-layout per viz.type:
//   triads   stacks of three; the middle mass is about the average of the outer two
//   octaves  rows of seven, one repeating column highlighted
//   gaps     groups (columns) with "?" cells left for undiscovered elements
//   numbered inversion pairs shown in atomic-number order (mass would disagree)
//   blocks   the long-form silhouette with the f-block pulled out below
export const TABLE_HISTORY = [
  { who: 'Döbereiner', year: 1829, idea: 'Triads: grouped elements in threes where the middle one had about the average mass of the other two.',
    evidence: 'Cl, Br, I and Li, Na, K showed repeating physical and chemical properties.',
    viz: { type: 'triads', cap: 'In each triad the middle mass is about the average of the top and bottom.',
      triads: [
        { els: [{ sym: 'Li', mass: 6.9 }, { sym: 'Na', mass: 23.0 }, { sym: 'K', mass: 39.1 }] },
        { els: [{ sym: 'Cl', mass: 35.5 }, { sym: 'Br', mass: 79.9 }, { sym: 'I', mass: 126.9 }] },
        { els: [{ sym: 'Ca', mass: 40.1 }, { sym: 'Sr', mass: 87.6 }, { sym: 'Ba', mass: 137.3 }] }
      ] } },
  { who: 'Newlands', year: 1865, idea: 'Law of Octaves: arranged by atomic weight, every eighth element repeated similar properties.',
    evidence: 'Like musical octaves, properties recurred, but the pattern broke down past calcium.',
    viz: { type: 'octaves', cap: 'Listed by weight in rows of seven. The highlighted column (Li, Na) shows the eighth-element repeat.',
      highlightCol: 1,
      rows: [
        ['H', 'Li', 'Be', 'B', 'C', 'N', 'O'],
        ['F', 'Na', 'Mg', 'Al', 'Si', 'P', 'S']
      ] } },
  { who: 'Mendeleev', year: 1869, idea: 'Ordered by atomic weight into columns of similar elements, and left gaps for elements not yet discovered.',
    evidence: 'He predicted the properties of the missing eka-boron and eka-silicon; their later discovery matched.',
    viz: { type: 'gaps', cap: 'Vertical groups by weight. The dashed "?" cells are eka-boron (Sc), eka-aluminium (Ga), and eka-silicon (Ge).',
      groupHeaders: ['I', 'II', 'III', 'IV'],
      rows: [
        ['Li', 'Be', 'B', 'C'],
        ['Na', 'Mg', 'Al', 'Si'],
        ['K', 'Ca', '?', 'Ti'],
        ['Cu', 'Zn', '?', '?']
      ] } },
  { who: 'Moseley', year: 1913, idea: 'Reordered the table by atomic number (nuclear charge) rather than atomic weight.',
    evidence: 'X-ray spectra gave each element a whole-number nuclear charge, fixing the few mass-order inversions.',
    viz: { type: 'numbered', cap: 'Order by atomic number Z. Mass would put each pair backward; Z keeps them right.',
      pairs: [
        [{ sym: 'Ar', z: 18, mass: 39.9 }, { sym: 'K', z: 19, mass: 39.1 }],
        [{ sym: 'Co', z: 27, mass: 58.9 }, { sym: 'Ni', z: 28, mass: 58.7 }]
      ] } },
  { who: 'Seaborg', year: 1944, idea: 'Pulled the lanthanides and actinides out into the f-block, giving the modern shape.',
    evidence: 'The chemistry of the heavy elements only made sense as a separate inner-transition series.',
    viz: { type: 'blocks', cap: 'The long form: s-block at the left, d and p blocks at the right, f-block detached below.' } }
];

// The Mendeleev's Gap challenge (C.5A): a predicted element that lands on a real
// in-set cell. Eka-boron -> scandium (Z 21). The eka-silicon -> germanium case is
// the more famous one but germanium is off our grid, so it is named in the note.
export const MENDELEEV_GAP = {
  predictedName: 'eka-boron',
  answer: 'Sc',
  // plausible distractors that sit near scandium on the grid
  options: ['Ca', 'Sc', 'Ti', 'Zn'],
  comparison: [
    { prop: 'Atomic mass',     predicted: '~44',          actual: '44.96' },
    { prop: 'Oxide formula',   predicted: 'Eb2O3',        actual: 'Sc2O3' },
    { prop: 'Metal density',   predicted: '~3.0 g/cm^3',  actual: '2.99 g/cm^3' },
    { prop: 'Oxide character', predicted: 'basic',        actual: 'basic' }
  ],
  explain: 'Mendeleev left a gap below boron and predicted "eka-boron." Scandium, found in 1879, matched his predicted mass, oxide formula, and density almost exactly. He did the same for eka-silicon, which turned out to be germanium. Successful predictions like these are why the gapped table was accepted.'
};

// Moseley evidence (C.5A): pairs where ordering by atomic mass disagrees with
// ordering by atomic number. Ar/K and Co/Ni are both in our set (highlight them
// on the grid); Te/I is shown as a data card because tellurium is off-grid.
export const MASS_ORDER_INVERSIONS = [
  { a: 'Ar', b: 'K',  zA: 18, zB: 19, massA: 39.95,  massB: 39.10,  onGrid: true,
    note: 'By mass, K (39.10) is lighter than Ar (39.95), so a weight ordering would swap them. By atomic number Ar (18) correctly comes before K (19), keeping Ar with the noble gases and K with the alkali metals.' },
  { a: 'Co', b: 'Ni', zA: 27, zB: 28, massA: 58.93,  massB: 58.69,  onGrid: true,
    note: 'Cobalt (58.93) is heavier than nickel (58.69) despite its lower atomic number. Ordering by nuclear charge keeps each metal with the family it actually resembles.' },
  { a: 'Te', b: 'I',  zA: 52, zB: 53, massA: 127.60, massB: 126.90, onGrid: false,
    note: 'The classic case: tellurium (127.60) is heavier than iodine (126.90). Mendeleev placed Te before I by chemistry anyway; Moseley showed atomic number justifies it. Tellurium is off this grid, so only iodine is shown.' }
];

// ---- C.5(B): the named chemical families ----
// reaction is an mhchem string rendered with x-ce in the demo.
export const FAMILIES = [
  { key: 'alkali', name: 'Alkali metals', group: 'Group 1', valence: 1, ionCharge: '+1',
    members: ['Li', 'Na', 'K'],
    behavior: 'One valence electron that is lost easily, so they are soft, low-density metals that form +1 ions and react vigorously with water.',
    reactivityTrend: 'down', reactivityNote: 'Reactivity increases down the group: the lone valence electron sits farther from the nucleus and is lost more easily, so K reacts harder than Na, which reacts harder than Li.',
    reaction: '2Na + 2H2O -> 2NaOH + H2', reactionCaption: 'Sodium with water gives a base plus hydrogen gas.' },
  { key: 'alkaline-earth', name: 'Alkaline earth metals', group: 'Group 2', valence: 2, ionCharge: '+2',
    members: ['Be', 'Mg', 'Ca', 'Ba'],
    behavior: 'Two valence electrons lost to form +2 ions. Harder and less reactive than the alkali metals, but still reactive metals.',
    reactivityTrend: 'down', reactivityNote: 'Reactivity increases down the group for the same reason as Group 1: the two valence electrons are easier to remove farther down. Ba reacts far more readily than Be.',
    reaction: 'Ca + 2H2O -> Ca(OH)2 + H2', reactionCaption: 'Calcium with water gives a hydroxide plus hydrogen gas.' },
  { key: 'halogen', name: 'Halogens', group: 'Group 17', valence: 7, ionCharge: '-1',
    members: ['F', 'Cl', 'Br', 'I'],
    behavior: 'Seven valence electrons, so they gain one electron to form -1 ions. Very reactive nonmetals that form salts with metals.',
    reactivityTrend: 'up', reactivityNote: 'Reactivity increases UP the group: the smaller atoms pull in the extra electron more strongly, so fluorine is the most reactive and iodine the least.',
    reaction: 'Cl2 + 2Na -> 2NaCl', reactionCaption: 'Chlorine with sodium gives table salt.' },
  { key: 'noble', name: 'Noble gases', group: 'Group 18', valence: 8, ionCharge: '0',
    members: ['He', 'Ne', 'Ar'],
    behavior: 'A full valence shell (8, or 2 for helium), so they are stable and almost completely unreactive. They do not normally form ions or compounds.',
    reactivityTrend: 'none', reactivityNote: 'Essentially inert. Their full valence shell is exactly the arrangement other elements react to reach, so there is no driving force to gain or lose electrons.',
    reaction: '', reactionCaption: 'Noble gases rarely react, so there is no representative reaction.' },
  { key: 'transition', name: 'Transition metals', group: 'Groups 3-12', valence: 2, ionCharge: 'varies',
    members: ['Fe', 'Cu', 'Zn', 'Ag', 'Au'],
    behavior: 'Lose outer s and some d electrons, so most form more than one possible ion (for example Fe2+ and Fe3+). Hard, dense metals, often colored compounds.',
    reactivityTrend: 'none', reactivityNote: 'Much less reactive than the alkali or alkaline earth metals. Many (Au, Ag, Cu) are unreactive enough to be found as the free metal.',
    reaction: 'Fe + Cu(NO3)2 -> Fe(NO3)2 + Cu', reactionCaption: 'A more reactive transition metal displaces a less reactive one.' }
];

// Predict-the-charge game (C.5B): each item ties an element to the ion charge its
// family predicts, with the valence reason in the explanation.
export const FAMILY_QUIZ = [
  { sym: 'K',  prompt: 'Potassium sits in Group 1. What ion charge does it form?',
    choices: ['+1', '+2', '-1', '0'], answer: '+1',
    explain: 'Alkali metals have 1 valence electron. Losing it gives a +1 cation with a stable noble-gas configuration.' },
  { sym: 'Ca', prompt: 'Calcium sits in Group 2. What ion charge does it form?',
    choices: ['+1', '+2', '-2', '0'], answer: '+2',
    explain: 'Alkaline earth metals have 2 valence electrons and lose both to form a +2 cation.' },
  { sym: 'Cl', prompt: 'Chlorine sits in Group 17. What ion charge does it form?',
    choices: ['+1', '-1', '-2', '+7'], answer: '-1',
    explain: 'Halogens have 7 valence electrons and gain just one to complete the octet, forming a -1 anion.' },
  { sym: 'Ar', prompt: 'Argon sits in Group 18. What ion charge does it normally form?',
    choices: ['0', '+1', '-1', '+8'], answer: '0',
    explain: 'Noble gases already have a full valence shell, so they have no tendency to gain or lose electrons.' },
  { sym: 'Mg', prompt: 'Magnesium sits in Group 2. What ion charge does it form?',
    choices: ['+1', '+2', '-2', '0'], answer: '+2',
    explain: 'Like all alkaline earth metals, magnesium loses its 2 valence electrons to form a +2 ion.' },
  { sym: 'F',  prompt: 'Fluorine sits in Group 17. What ion charge does it form?',
    choices: ['-1', '+1', '-7', '0'], answer: '-1',
    explain: 'Fluorine needs one more electron to fill its valence shell, so it forms a -1 anion.' }
];

// ---- C.5(C): the chartable, numeric trend properties ----
// field is the merged-element property the chart reads. higherIsDarker just names
// the heatmap convention (larger value -> darker teal); the trend text is the
// directional summary shown under the chart.
export const TREND_PROPS = [
  { key: 'radius', label: 'Atomic radius', unit: 'pm', field: 'radius',
    across: 'decreases', down: 'increases',
    why: 'Across a period, protons are added to the same shell, pulling it inward. Down a group, each element adds a whole new shell.' },
  { key: 'ie1', label: 'First ionization energy', unit: 'kJ/mol', field: 'ie1',
    across: 'increases', down: 'decreases',
    why: 'Across a period a higher nuclear charge holds electrons tighter. Down a group the outer electron is farther out and better shielded, so it leaves more easily.' },
  { key: 'en', label: 'Electronegativity', unit: 'Pauling', field: 'en',
    across: 'increases', down: 'decreases',
    why: 'Smaller, higher-charge atoms attract bonding electrons more strongly. Noble gases have no value because they do not normally bond.' },
  { key: 'mass', label: 'Atomic mass', unit: 'u', field: 'mass',
    across: 'increases', down: 'increases',
    why: 'Mass rises with the number of protons and neutrons, so it climbs both across a period and down a group (with a few mass-order inversions, see the History tab).' }
];

// The clean series offered for the trend chart. items are symbols in order; a
// {gap} entry marks an element we do not study so the line breaks honestly there.
export const TREND_RUNS = [
  { key: 'p2', label: 'Period 2, across', type: 'period',
    items: ['Li', 'Be', 'B', 'C', 'N', 'O', 'F', 'Ne'] },
  { key: 'p3', label: 'Period 3, across', type: 'period',
    items: ['Na', 'Mg', 'Al', 'Si', 'P', 'S', 'Cl', 'Ar'] },
  { key: 'p4', label: 'Period 4, across', type: 'period',
    items: ['K', 'Ca', 'Sc', 'Ti', 'V', 'Cr', 'Mn', 'Fe', 'Co', 'Ni', 'Cu', 'Zn', { gap: 'Ga-Se' }, 'Br'] },
  { key: 'g1', label: 'Group 1, down', type: 'group',
    items: ['Li', 'Na', 'K'] },
  { key: 'g2', label: 'Group 2, down', type: 'group',
    items: ['Be', 'Mg', 'Ca', { gap: 'Sr' }, 'Ba'] },
  { key: 'g17', label: 'Group 17, down', type: 'group',
    items: ['F', 'Cl', 'Br', 'I'] },
  { key: 'g18', label: 'Group 18, down', type: 'group',
    items: ['He', 'Ne', 'Ar'] }
];

// Comparison game (C.5C): "which is bigger / higher?" pairs. Same period or same
// group with a clear difference and data present for both. answer is the symbol
// that wins for that property; explain gives the trend reason.
export const TREND_QUIZ = [
  { property: 'radius', a: 'Na', b: 'Cl', answer: 'Na',
    explain: 'Across period 3, more protons pull the same outer shell inward, so sodium (far left) is much larger than chlorine (far right).' },
  { property: 'radius', a: 'Li', b: 'K', answer: 'K',
    explain: 'Down Group 1 each element adds a whole new electron shell, so potassium is larger than lithium.' },
  { property: 'ie1', a: 'Na', b: 'Cl', answer: 'Cl',
    explain: 'Across a period the rising nuclear charge holds electrons tighter, so chlorine takes far more energy to ionize than sodium.' },
  { property: 'ie1', a: 'Li', b: 'K', answer: 'Li',
    explain: 'Down a group the outer electron is farther out and better shielded, so it leaves potassium easily. Lithium has the higher ionization energy.' },
  { property: 'en', a: 'F', b: 'I', answer: 'F',
    explain: 'Down Group 17 the bonding electrons sit farther from the nucleus, so electronegativity falls. Fluorine is the most electronegative element.' },
  { property: 'radius', a: 'Mg', b: 'Ba', answer: 'Ba',
    explain: 'Down Group 2 each added shell makes the atom larger, so barium dwarfs magnesium.' },
  { property: 'en', a: 'Mg', b: 'S', answer: 'S',
    explain: 'Across period 3, electronegativity rises toward the right, so sulfur pulls bonding electrons far harder than magnesium does.' }
];

// Honors (C.5C): first-ionization-energy dips that break the smooth period-2 rise.
export const IE_ANOMALIES = [
  { label: 'Be to B', from: 'Be', to: 'B', group: 'Groups 2 to 13',
    explain: 'Boron removes a higher-energy 2p electron, while beryllium would have to break into a filled, stable 2s subshell. The 2p electron leaves more easily, so the ionization energy dips even though the nuclear charge went up.' },
  { label: 'N to O', from: 'N', to: 'O', group: 'Groups 15 to 16',
    explain: 'Nitrogen has a half-filled 2p subshell with one electron per orbital. Oxygen must pair a fourth electron into an already-occupied 2p orbital; the extra electron-electron repulsion makes it easier to remove, so the ionization energy dips.' }
];
