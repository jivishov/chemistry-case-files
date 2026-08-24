// model.js: Unit 3 domain data (Periodic Table & Trends, TEKS C.5).
// units_new build. Pure data. Periodic-position + valence math lives in
// shared/js/chem.js; atomic mass and electronegativity are read from chem.js by symbol.
// The numbers that cannot be derived from a simple rule (radius, first ionization
// energy, a qualitative reactivity index, family) live here as measured reference data.
//
// The eleven chemistry pools below are units/03-periodic-trends/js/model.js's, carried
// over unchanged so both builds teach the same content, SE ids included. What is new is
// SCENARIOS at the foot of the file: the everyday world the cockpit puts that content
// inside, per RETROFIT-U1-U4.md section 3 ("The Repair Bench" - phone and laptop repairs
// at your own bench) and section 5 (task types). Every core task in this unit is a
// decision, so section 5 assigns Unit 3 no dose bands at all and nothing here imports
// outcomeBand.

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

// ============================ The Scenario layer ============================
// RETROFIT-U1-U4.md section 3: "The Repair Bench" - phone and laptop repairs in your
// bedroom. Role line `Phone and laptop repair · your bench`. One bench, one drawer of
// parts: batteries, connectors, magnets, screws, cases, cables, and a supplier datasheet
// with a hole in it. Every call is "which element belongs here".
//
// THE BOARD is the world-state, and it is the one in section 4 that most literally IS the
// chemistry: every confirmed call fills in one cell of a periodic table the learner is
// reconstructing, tinted with the real family. Each scenario therefore carries a `cell`,
// the element that call is about, and `family`, that element's family - which is what a
// wrong call knocks back off the board. The twelve cells are exactly the twelve scenarios,
// so the meter reads honestly as "cells confirmed: N of 12".
//
// Every core scenario is `type: 'decision'`: three parts on the bench, one call each. The
// two Honors rows are decisions too, on evidence the worksheet build only ever displayed.
// The capstone is Mendeleev's own move - a numeric prediction first, then the call.
//
// Counting note: the brief says "~15 banners (3 core skills x 3, plus h1, h2, cap)". That
// arithmetic is Unit 1's, which has FOUR core skills: 4 x 3 + 3 = 15. Unit 3 has three,
// so the set is 3 x 3 + 3 = 12, and 12 is what art.js holds.
export const SCENARIOS = [
  // ---------- C.5(A) how the table developed: read the pattern, then order the part ----------
  { id: 'a-datasheet', stage: 'table', skill: 'a', type: 'decision',
    system: 'The datasheet with a hole in it', icon: '\u{1F4C4}', cell: 'Sc', family: 'transition',
    goal: 'A supplier datasheet came through with one row blacked out. Its neighbours in the group are all there. Predict which element belongs in the blank before you order anything.',
    why: 'This is exactly what Mendeleev did with eka-boron in 1869, and the reason anybody trusted his table: he left the hole, said what would fill it, and scandium turned up ten years later matching the predicted mass, oxide formula and density.',
    consequences: {
      order: 'The part goes on the order and it is the right part.',
      hold: 'Nothing gets ordered until somebody can name what the row is.'
    },
    effect: { good: { add: 'Sc' }, bad: { drop: 'transition' } } },
  { id: 'a-warehouse', stage: 'table', skill: 'a', type: 'decision',
    system: 'Two bins in the wrong order', icon: '\u{1F4E6}', cell: 'Ar', family: 'noble',
    goal: 'The warehouse sorted the parts bin by atomic mass, and two parts came back in the wrong order. Say which ordering the shelf should use, then file the pair.',
    why: 'Argon is heavier than potassium and cobalt is heavier than nickel, so a mass ordering swaps both pairs and files an inert gas in with the alkali metals. Moseley fixed this in 1913 with atomic number, and it is why the shelf works at all.',
    consequences: {
      znumber: 'The bins are relabelled by atomic number and both pairs sit with the family they behave like.',
      mass: 'The bins keep the mass ordering and the next person pulls the wrong part again.'
    },
    effect: { good: { add: 'Ar' }, bad: { drop: 'noble' } } },
  { id: 'a-manual', stage: 'table', skill: 'a', type: 'decision',
    system: 'The old repair manual', icon: '\u{1F4D6}', cell: 'Na', family: 'alkali',
    goal: 'A manual from the eighties groups parts in threes by weight, the middle one averaging the outer two. It works for the first few rows and then stops. Say why it stops, then decide whether to keep using it.',
    why: 'Doebereiner triads and Newlands octaves both worked until they did not, because weight is not the organising fact. The manual is a real historical arrangement, and its failure is the evidence for the next one.',
    consequences: {
      retire: 'The manual goes in the drawer as history and the modern table goes on the wall.',
      keep: 'The manual stays on the bench and keeps being right about the first three rows and wrong after that.'
    },
    effect: { good: { add: 'Na' }, bad: { drop: 'alkali' } } },

  // ---------- C.5(B) families: the part failed the way its family fails ----------
  { id: 'b-remote', stage: 'families', skill: 'b', type: 'decision',
    system: 'The leaking remote', icon: '\u{1F50B}', cell: 'K', family: 'alkali',
    goal: 'A remote came in with white crust across the battery contacts. Name the family behind the electrolyte that did this and the ion charge it forms, then decide what the customer needs to hear.',
    why: 'An alkaline cell runs on potassium hydroxide. Group 1 has one valence electron, loses it to a +1 ion, and the hydroxide creeps out of a tired seal and carbonates on the contacts. The family predicts the failure.',
    consequences: {
      clean: 'The contacts get neutralised and cleaned, and the customer is told to pull the cells out of anything they store for a season.',
      swap: 'New cells go into the same corroded holder and the remote comes back in a month.'
    },
    effect: { good: { add: 'K' }, bad: { drop: 'alkali' } } },
  { id: 'b-contact', stage: 'families', skill: 'b', type: 'decision',
    system: 'Two contacts, one tarnished', icon: '\u{1F4BF}', cell: 'Ag', family: 'transition',
    goal: 'Two contacts sit side by side on the same board. The silver-coloured one has gone black; the gold-plated one next to it has not. Name the family both metals belong to, then decide which plating this repair gets.',
    why: 'Silver and gold are both Group 11 transition metals, which is why they conduct alike, and their reactivity indices are 8 and 3, which is why only one of them tarnishes. Same family, different position, different service life.',
    consequences: {
      gold: 'The rebuilt contact gets gold plating and it is still bright when the board comes back for something else.',
      silver: 'Silver goes back on, conducts beautifully, and is black again inside a year.'
    },
    effect: { good: { add: 'Ag' }, bad: { drop: 'transition' } } },
  { id: 'b-plastic', stage: 'families', skill: 'b', type: 'decision',
    system: 'The flame-retardant marking', icon: '\u{1F525}', cell: 'Br', family: 'halogen',
    goal: 'The laptop bottom case is stamped with a flame-retardant code. Name the family the retardant is built on and the ion charge it forms, then decide how the offcuts leave the bench.',
    why: 'Brominated flame retardants are Group 17: seven valence electrons, gain one to a -1 ion, and reactive enough to interrupt combustion. That same reactivity is why the offcuts are not general waste.',
    consequences: {
      separate: 'The offcuts go into electrical waste, which is where a halogenated plastic is supposed to go.',
      bin: 'The offcuts go in the household bin and the bromine goes wherever that goes.'
    },
    effect: { good: { add: 'Br' }, bad: { drop: 'halogen' } } },

  // ---------- C.5(C) trends: two candidate parts, one property decides ----------
  { id: 'c-cell', stage: 'trends', skill: 'c', type: 'decision',
    system: 'Lithium, not sodium', icon: '\u{1F4F1}', cell: 'Li', family: 'alkali',
    goal: 'A customer asks why every phone cell in the drawer is lithium when sodium is in the same group and far cheaper. Read the pair off the trend data and commit the comparison that answers it.',
    why: 'Same group, same one valence electron, same +1 ion. What differs is size and mass: lithium is 167 pm against sodium 190, and 6.9 u against 23.0. Energy per kilogram is the whole design, and that is a periodic trend, not a preference.',
    consequences: {
      lithium: 'The customer gets the real answer and the lithium cell goes in.',
      sodium: 'A sodium chemistry would work and weigh three times as much for the same charge.'
    },
    effect: { good: { add: 'Li' }, bad: { drop: 'alkali' } } },
  { id: 'c-connector', stage: 'trends', skill: 'c', type: 'decision',
    system: 'Gold on the connector', icon: '\u{1F50C}', cell: 'Au', family: 'transition',
    goal: 'The connector plating costs more than the connector. Read gold against copper on the property that actually decides it, and commit the comparison.',
    why: 'Copper conducts marginally better and corrodes; gold does not. Reactivity indices of 15 and 3 and electronegativities of 1.9 and 2.5 say which one is still making contact in five years, which is the only figure of merit that matters on a connector.',
    consequences: {
      gold: 'The connector is plated in gold and the intermittent fault does not come back.',
      copper: 'Bare copper goes in, works perfectly on the bench, and oxidises into an intermittent fault.'
    },
    effect: { good: { add: 'Au' }, bad: { drop: 'transition' } } },
  { id: 'c-case', stage: 'trends', skill: 'c', type: 'decision',
    system: 'Aluminium, not iron', icon: '\u{1F4BB}', cell: 'Al', family: 'post-transition',
    goal: 'The replacement case is aluminium and the customer wants to know why it is not steel. Read the two on the trend data and commit the comparison that carries the answer.',
    why: 'Aluminium is 27.0 u against iron 55.8, and it forms its own oxide skin instead of flaking rust. A laptop case is a mass-and-corrosion problem, and both halves of it are on this table.',
    consequences: {
      aluminium: 'The aluminium case goes on, at half the mass and with no rust to come.',
      iron: 'A steel case would be stiffer, twice as heavy, and rusting at every screw hole in a year.'
    },
    effect: { good: { add: 'Al' }, bad: { drop: 'post-transition' } } },

  // ---------- Honors ----------
  { id: 'h1-shielding', stage: 'trends', skill: 'h1', type: 'decision',
    system: 'Why the row tightens', icon: '\u{1F9F2}', cell: 'Si', family: 'metalloid',
    goal: 'Period 3 runs from sodium to argon on this datasheet, and the radius falls while the ionization energy climbs the whole way. Name the quantity that does it, then commit which end of the row holds its electrons harder.',
    why: 'Effective nuclear charge is the pull an outer electron actually feels: full nuclear charge minus what the inner shells screen off. Across a period the protons increase and the screening does not, so Zeff rises, the shell is drawn in, and the electron gets harder to remove. Shielding is the reason it is not simply the proton count.',
    consequences: {
      right: 'The shielding argument goes in the notes and the row makes sense from one quantity.',
      left: 'The row gets explained by mass, which is the reading Moseley already ruled out.'
    },
    effect: { good: { add: 'Si' }, bad: { drop: 'metalloid' } } },
  { id: 'h2-dip', stage: 'trends', skill: 'h2', type: 'decision',
    system: 'The two dips in the climb', icon: '\u{1F4C9}', cell: 'B', family: 'metalloid',
    goal: 'Ionization energy across period 2 climbs, except that it drops twice. Pick the subshell reason for the dip the chart is highlighting and commit it.',
    why: 'Beryllium to boron drops because boron gives up a higher-energy 2p electron rather than breaking into a filled 2s. Nitrogen to oxygen drops because oxygen has to pair a fourth electron into an occupied 2p orbital and the repulsion makes it easier to lose. Subshell structure, not nuclear charge.',
    consequences: {
      subshell: 'The exception is written down with its reason, which is what makes it an exception rather than an error.',
      charge: 'The dip gets called noise in the data, and the next one is a surprise too.'
    },
    effect: { good: { add: 'B' }, bad: { drop: 'metalloid' } } },

  // ---------- Capstone ----------
  { id: 'cap-substitute', stage: 'capstone', skill: 'cap', type: 'decision',
    system: 'The substitute part', icon: '\u{1F527}', cell: 'Ni', family: 'transition',
    goal: 'The spring contact this board needs is out of stock, and the element on its datasheet is blacked out. Predict the missing element atomic radius from the neighbours either side of it, then decide what to do about the substitute the supplier is offering.',
    why: 'This is the whole unit in one call. Position predicts properties, family predicts behaviour, and the trend decides whether the substitute survives in this device. Mendeleev committed a number before the element existed; so do you.',
    consequences: {
      fit: 'The substitute goes in, and it behaves closely enough that the repair holds.',
      wait: 'The correct part is ordered and the customer waits, which is the honest answer when the substitute cannot be vouched for.',
      nofit: 'The substitute is refused, because it would corrode against this board and take the repair with it.'
    },
    effect: { good: { add: 'Ni' }, bad: { drop: 'transition' } } }
];

// The twelve board cells, in the order a clean run fills them. Kept beside SCENARIOS
// because the board figure needs the set without walking every scenario, and because
// "N of 12" in the meter has to agree with what the figure can draw.
export const BOARD_CELLS = SCENARIOS.map(s => ({ sym: s.cell, family: s.family, from: s.id }));

// The substitutes the supplier offers in the capstone. Reactivity comes from ELEMENT_DATA
// above and is the qualitative index the family meter already uses; the note is what the
// bench would actually say about fitting it to a nickel spring contact.
export const CAP_SUBSTITUTES = [
  { sym: 'Cu', note: 'Softer and it tarnishes, but it plates and conducts like the original.' },
  { sym: 'Zn', note: 'Close in reactivity, and it is what the original spring is plated over anyway.' },
  { sym: 'Ag', note: 'Better conductor than the part it replaces, and priced like it.' },
  { sym: 'Fe', note: 'Steel spring, no plating. Cheap, and it is already rusting in the bag.' },
  { sym: 'Al', note: 'Light, and it takes an oxide skin that does not conduct.' },
  { sym: 'Pb', note: 'Solders beautifully, springs badly, and it is lead in a consumer device.' }
];

// ---------------------------- the graded question per scenario ----------------------------
// Unit 1 keeps the narrative in SCENARIOS and generates the graded content from the unit's
// own pools. Unit 3 does the same, with one difference worth stating: its three core benches
// ask three genuinely different questions (which element fills the gap, which family failed,
// which of two parts wins on a property), so the question cannot come from one generator.
// It lives here, keyed by scenario id, and it reuses the pools above wherever the worksheet
// build already had the content: `pool: 'gap'` reads MENDELEEV_GAP.options, `pool: 'pair'`
// means main.js generates the comparison at runtime (section 4.2), and `pool: 'anomaly'`
// means the options are fixed but which one is correct depends on the dip the chart drew.
//
// Shape: ask, options [{ k, label }], answer (an option k, or null when generated),
// explain, actions [{ k, label }], actionTrue. A commit is good only when the chemistry
// answer AND the action are both right, which is what makes these decisions rather than
// quizzes: knowing the element is not the same as ordering the part.
//
// `pool: 'pair'` actions carry a THIRD field, `sym`: the element that action's part is made
// of. It is not decoration. The pair on that bench used to be drawn from the whole table,
// which put an aluminium-against-chlorine reading above a lithium-or-sodium call -- the
// reading and the call were about different parts. main.js now builds the pair from these
// two symbols, so the two candidate parts on the bench are the two parts the job is
// actually choosing between, and what is generated is which property decides between them.
//
// Unit 4 pins its generated content with a `constraints: { a, b }` on the SCENARIO, and
// this deliberately does not. There the scenario names a bond and the actions are about
// what to do about it; here each action IS one of the two parts, so a separate
// constraints block would state the pair a second time and leave the two statements free
// to drift apart -- which is the bug this replaced. One `sym` per action means each part
// is named in exactly one place.
export const SCENARIO_TASKS = {
  'a-datasheet': {
    ask: 'Which element belongs in the blacked-out row?', pool: 'gap',
    explain: MENDELEEV_GAP.explain,
    actions: [{ k: 'order', label: 'Order that part' }, { k: 'hold', label: 'Hold the order' }],
    actionTrue: 'order' },
  'a-warehouse': {
    ask: 'Which ordering should the parts shelf use?',
    options: [
      { k: 'znumber', label: 'Atomic number, so each part sits with the family it behaves like' },
      { k: 'mass', label: 'Atomic mass, because that is what the warehouse system already sorts on' },
      { k: 'alpha', label: 'Alphabetical by symbol, because it is unambiguous' },
      { k: 'density', label: 'Density, because that is what you can measure on the bench' }
    ],
    answer: 'znumber',
    explain: 'Argon (39.95 u) is heavier than potassium (39.10 u) and cobalt (58.93) is heavier than nickel (58.69), so a mass ordering swaps both pairs. Atomic number is the nuclear charge itself, and ordering on it keeps argon with the noble gases and potassium with the alkali metals. That is Moseley 1913, and it is why the modern table is ordered the way it is.',
    actions: [{ k: 'znumber', label: 'Relabel the bins by atomic number' }, { k: 'mass', label: 'Leave the mass ordering' }],
    actionTrue: 'znumber' },
  'a-manual': {
    ask: 'Why does the manual stop working after the fourth row?',
    options: [
      { k: 'weight', label: 'It orders by atomic weight, and weight is not what sets chemical behaviour' },
      { k: 'threes', label: 'Groups of three are too small to hold a real family' },
      { k: 'printing', label: 'The later rows were never printed, so the pattern only looks broken' },
      { k: 'metals', label: 'It only covers metals, and the pattern needs nonmetals to continue' }
    ],
    answer: 'weight',
    explain: 'Doebereiner triads and Newlands octaves are both real arrangements that really did predict, and both broke down past calcium. The reason is the same in each case: they order on atomic weight. Weight tracks nuclear charge closely enough to work for the first few rows and then stops. The pattern was right; the variable was wrong.',
    actions: [{ k: 'retire', label: 'Retire it to history' }, { k: 'keep', label: 'Keep using it' }],
    actionTrue: 'retire' },

  'b-remote': {
    ask: 'Which family leaked, and what ion does it form?',
    options: [
      { k: 'alkali', label: 'Alkali metals, one valence electron, +1 ion' },
      { k: 'alkaline-earth', label: 'Alkaline earth metals, two valence electrons, +2 ion' },
      { k: 'halogen', label: 'Halogens, seven valence electrons, -1 ion' },
      { k: 'transition', label: 'Transition metals, variable ion charge' }
    ],
    answer: 'alkali',
    explain: 'An alkaline cell runs on potassium hydroxide. Potassium is Group 1: one valence electron, lost to give a +1 ion, and the hydroxide that carries the charge is what creeps out of a failed seal and carbonates into white crust on the contacts.',
    actions: [{ k: 'clean', label: 'Neutralise and clean, and warn the customer' }, { k: 'swap', label: 'Just fit new cells' }],
    actionTrue: 'clean' },
  'b-contact': {
    ask: 'Which family do both metals belong to, and what does the difference between them come from?',
    options: [
      { k: 'transition', label: 'Both are Group 11 transition metals; they differ in reactivity, not family' },
      { k: 'different', label: 'Silver is a transition metal and gold is a post-transition metal' },
      { k: 'alkali', label: 'Both behave as alkali metals because they form +1 ions' },
      { k: 'metalloid', label: 'Both are metalloids, which is why they conduct at all' }
    ],
    answer: 'transition',
    explain: 'Silver and gold are both in Group 11, which is why they conduct so similarly and both plate well. Their reactivity indices are 8 and 3. Same family explains the similarity; position within it explains why one goes black and the other does not.',
    actions: [{ k: 'gold', label: 'Gold-plate the rebuilt contact' }, { k: 'silver', label: 'Re-silver it' }],
    actionTrue: 'gold' },
  'b-plastic': {
    ask: 'Which family is the flame retardant built on, and what ion does it form?',
    options: [
      { k: 'halogen', label: 'Halogens, seven valence electrons, -1 ion' },
      { k: 'noble', label: 'Noble gases, full valence shell, no ion' },
      { k: 'nonmetal', label: 'Nonmetals generally, sharing electrons rather than forming ions' },
      { k: 'alkaline-earth', label: 'Alkaline earth metals, two valence electrons, +2 ion' }
    ],
    answer: 'halogen',
    explain: 'Brominated flame retardants are Group 17. Seven valence electrons, one gained to reach a -1 ion, and reactive enough to interrupt the radical chain that keeps a fire going. The same reactivity is the reason a halogenated plastic is handled as electrical waste and not household waste.',
    actions: [{ k: 'separate', label: 'Send the offcuts to electrical waste' }, { k: 'bin', label: 'Household bin' }],
    actionTrue: 'separate' },

  // The trends bench generates the comparison over these two parts, so `ask` and `answer`
  // are null and main.js fills both in from the property it picks.
  'c-cell': {
    ask: null, pool: 'pair',
    actions: [{ k: 'lithium', sym: 'Li', label: 'Fit the lithium cell' },
              { k: 'sodium', sym: 'Na', label: 'Offer a sodium cell instead' }],
    actionTrue: 'lithium' },
  'c-connector': {
    ask: null, pool: 'pair',
    actions: [{ k: 'gold', sym: 'Au', label: 'Gold-plate the connector' },
              { k: 'copper', sym: 'Cu', label: 'Leave it bare copper' }],
    actionTrue: 'gold' },
  'c-case': {
    ask: null, pool: 'pair',
    actions: [{ k: 'aluminium', sym: 'Al', label: 'Fit the aluminium case' },
              { k: 'iron', sym: 'Fe', label: 'Source a steel case' }],
    actionTrue: 'aluminium' },

  'h1-shielding': {
    ask: 'What makes the radius fall and the ionization energy climb across the row?',
    options: [
      { k: 'zeff', label: 'Effective nuclear charge rises: protons are added while inner-shell shielding stays about the same' },
      { k: 'mass', label: 'Atomic mass rises, and a heavier nucleus holds its electrons closer' },
      { k: 'shells', label: 'Each element across the row adds another electron shell' },
      { k: 'neutrons', label: 'Neutrons are added, which increases the nuclear pull' }
    ],
    answer: 'zeff',
    explain: 'Across a period the electrons go into the SAME shell, so the shielding they provide each other barely changes while the proton count keeps rising. The net pull an outer electron feels, Zeff, therefore rises: the shell is drawn inward and the outer electron becomes harder to remove. Adding a shell is what happens DOWN a group, and it does the opposite.',
    actions: [{ k: 'right', label: 'The right-hand end holds its electrons harder' }, { k: 'left', label: 'The left-hand end does' }],
    actionTrue: 'right' },
  'h2-dip': {
    ask: 'Why does the ionization energy drop at the highlighted step?', pool: 'anomaly',
    options: [
      { k: 'p-electron', label: 'The second element gives up a higher-energy p electron instead of breaking into a filled s subshell' },
      { k: 'pairing', label: 'The second element has to pair an electron into an already-occupied p orbital, and the repulsion makes it easier to remove' },
      { k: 'charge', label: 'The nuclear charge falls between these two elements' },
      { k: 'size', label: 'The atom gets larger between these two elements' }
    ],
    actions: [{ k: 'subshell', label: 'Record it as a subshell effect' }, { k: 'charge', label: 'Record it as noise in the data' }],
    actionTrue: 'subshell' }
};

// Which option key is correct for each ionization-energy dip. Both dips share one option
// list on purpose: the two real reasons are different, so a learner who pattern-matches
// "subshell words" without reading which step is highlighted gets it wrong half the time.
export const ANOMALY_ANSWER = { 'Be to B': 'p-electron', 'N to O': 'pairing' };
