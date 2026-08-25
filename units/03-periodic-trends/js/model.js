// model.js: Unit 3 domain data (Periodic Table & Trends, TEKS C.5).
// Student-facing scientific data and scenario copy live here. Periodic-position,
// atomic-mass, electronegativity, and electron-structure helpers live in shared/js/chem.js.

// Current Texas Chemistry TEKS §112.43(c)(5).
export const SE = [
  { id: 'a', code: 'C.5(A)', mode: 'table', honors: false,
    text: 'Explain the development of the Periodic Table over time using evidence such as chemical and physical properties.' },
  { id: 'b', code: 'C.5(B)', mode: 'families', honors: false,
    text: 'Predict the properties of elements in chemical families, including alkali metals, alkaline earth metals, halogens, noble gases, and transition metals, based on valence-electron patterns using the Periodic Table.' },
  { id: 'c', code: 'C.5(C)', mode: 'trends', honors: false,
    text: 'Analyze and interpret elemental data, including atomic radius, atomic mass, electronegativity, ionization energy, and reactivity to identify periodic trends.' },
  { id: 'h1', code: 'C.5(C)', mode: 'trends', honors: true,
    text: 'Honors: use a simplified effective-nuclear-charge model and electron shielding to explain general trends in radius and ionization energy.' },
  { id: 'h2', code: 'C.5(C)', mode: 'trends', honors: true,
    text: 'Honors: explain the Period 2 ionization-energy dips at Groups 13 and 16 using subshell energy and electron pairing.' }
];

// Per-element reference data for the 37 elements used in this unit.
// radius: one consistent calculated atomic-radius data set, in pm.
// ie1: first ionization energy, in kJ/mol.
// reactivity: a 0–100 SIMULATION SCORE used only by this activity. It is not a
// standardized scientific reactivity scale and must be labeled as such in the UI.
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

export const FAMILY_LABELS = {
  hydrogen: 'Hydrogen',
  alkali: 'Alkali metal',
  'alkaline-earth': 'Alkaline earth metal',
  transition: 'Transition metal',
  metalloid: 'Metalloid',
  'post-transition': 'Post-transition metal',
  nonmetal: 'Nonmetal',
  halogen: 'Halogen',
  noble: 'Noble gas'
};

// C.5(A): development of the Periodic Table.
export const TABLE_HISTORY = [
  { who: 'Döbereiner', year: 1829,
    idea: 'Triads: grouped some elements in threes with similar properties; the middle atomic mass was often close to the average of the other two.',
    evidence: 'Examples such as Li–Na–K and Cl–Br–I showed repeating chemical and physical properties.',
    viz: { type: 'triads', cap: 'Some triads show a middle atomic mass close to the average of the outer two.',
      triads: [
        { els: [{ sym: 'Li', mass: 6.9 }, { sym: 'Na', mass: 23.0 }, { sym: 'K', mass: 39.1 }] },
        { els: [{ sym: 'Cl', mass: 35.5 }, { sym: 'Br', mass: 79.9 }, { sym: 'I', mass: 126.9 }] },
        { els: [{ sym: 'Ca', mass: 40.1 }, { sym: 'Sr', mass: 87.6 }, { sym: 'Ba', mass: 137.3 }] }
      ] } },
  { who: 'Newlands', year: 1865,
    idea: 'Law of Octaves: arranged elements by atomic weight and noticed that similar properties often repeated at regular intervals among the lighter elements.',
    evidence: 'The pattern worked best for lighter elements and did not organize all known elements successfully.',
    viz: { type: 'octaves', cap: 'Rows arranged by atomic weight show an early repeating pattern among lighter elements.',
      highlightCol: 1,
      rows: [
        ['H', 'Li', 'Be', 'B', 'C', 'N', 'O'],
        ['F', 'Na', 'Mg', 'Al', 'Si', 'P', 'S']
      ] } },
  { who: 'Mendeleev', year: 1869,
    idea: 'Arranged elements mainly by atomic weight while keeping elements with similar properties together, and left gaps for elements not yet discovered.',
    evidence: 'He predicted properties of missing elements such as eka-boron, eka-aluminium, and eka-silicon; later discoveries supported the periodic pattern.',
    viz: { type: 'gaps', cap: 'Mendeleev left gaps where the periodic pattern predicted undiscovered elements.',
      groupHeaders: ['I', 'II', 'III', 'IV'],
      rows: [
        ['Li', 'Be', 'B', 'C'],
        ['Na', 'Mg', 'Al', 'Si'],
        ['K', 'Ca', '?', 'Ti'],
        ['Cu', 'Zn', '?', '?']
      ] } },
  { who: 'Moseley', year: 1913,
    idea: 'Showed that the periodic table should be ordered by atomic number rather than atomic weight.',
    evidence: 'Element X-ray spectra changed systematically with atomic number and resolved mass-order exceptions such as Ar/K and Co/Ni.',
    viz: { type: 'numbered', cap: 'Atomic-number order resolves pairs whose atomic masses run in the opposite order.',
      pairs: [
        [{ sym: 'Ar', z: 18, mass: 39.9 }, { sym: 'K', z: 19, mass: 39.1 }],
        [{ sym: 'Co', z: 27, mass: 58.9 }, { sym: 'Ni', z: 28, mass: 58.7 }]
      ] } },
  { who: 'Seaborg', year: 1944,
    idea: 'Proposed the actinide concept: the heavy elements beginning with actinium form a series analogous to the lanthanides.',
    evidence: 'The actinide-series model explained the chemistry and placement of the transuranium elements and shaped the modern periodic table.',
    viz: { type: 'blocks', cap: 'The modern long form displays the lanthanide and actinide series as the f-block below the main table.' } }
];

export const MENDELEEV_GAP = {
  predictedName: 'eka-boron',
  answer: 'Sc',
  options: ['Ca', 'Sc', 'Ti', 'Zn'],
  comparison: [
    { prop: 'Atomic mass', predicted: '~44', actual: '44.96' },
    { prop: 'Oxide formula', predicted: 'Eb2O3', actual: 'Sc2O3' },
    { prop: 'Common oxidation state', predicted: '+3', actual: '+3' }
  ],
  explain: 'Mendeleev left a gap for an element he called eka-boron and predicted key properties such as an atomic mass near 44 and an oxide with the formula Eb2O3. Scandium, discovered in 1879, fit that position and formed Sc2O3. Predictions like these provided strong evidence for the periodic pattern, even though not every predicted detail was exact.'
};

export const MASS_ORDER_INVERSIONS = [
  { a: 'Ar', b: 'K', zA: 18, zB: 19, massA: 39.95, massB: 39.10, onGrid: true,
    note: 'Potassium has a slightly lower atomic mass than argon, but atomic number places Ar (18) before K (19). This order also keeps Ar with the noble gases and K with the alkali metals.' },
  { a: 'Co', b: 'Ni', zA: 27, zB: 28, massA: 58.93, massB: 58.69, onGrid: true,
    note: 'Cobalt has a slightly greater atomic mass than nickel despite its lower atomic number. Atomic number gives the correct modern sequence: Co (27), then Ni (28).' },
  { a: 'Te', b: 'I', zA: 52, zB: 53, massA: 127.60, massB: 126.90, onGrid: false,
    note: 'Tellurium has a greater atomic mass than iodine, but atomic number places Te (52) before I (53). Mendeleev had already kept that chemical order; Moseley later established atomic number as the basis of the sequence.' }
];

// C.5(B): named chemical families. These are Grade-10 generalizations; exceptions
// are stated where a single family rule would otherwise be misleading.
export const FAMILIES = [
  { key: 'alkali', name: 'Alkali metals', group: 'Group 1', valence: 1, ionCharge: '+1',
    members: ['Li', 'Na', 'K'],
    behavior: 'They have one valence electron and commonly form +1 ions by losing that electron. They are soft, relatively low-density metals and are chemically reactive.',
    reactivityTrend: 'down', reactivityNote: 'For the alkali metals, reactivity generally increases down the group as the valence electron becomes farther from the nucleus and easier to remove.',
    reaction: '2Na + 2H2O -> 2NaOH + H2', reactionCaption: 'Sodium reacts with water to form sodium hydroxide and hydrogen gas.' },
  { key: 'alkaline-earth', name: 'Alkaline earth metals', group: 'Group 2', valence: 2, ionCharge: '+2',
    members: ['Be', 'Mg', 'Ca', 'Ba'],
    behavior: 'They have two valence electrons and commonly form +2 ions. They are reactive metals, but their reactions with water vary substantially within the group.',
    reactivityTrend: 'down', reactivityNote: 'Reactivity generally increases down Group 2 as the outer electrons become easier to remove. The details depend on the reaction; beryllium and magnesium do not behave like calcium in cold water.',
    reaction: 'Ca + 2H2O -> Ca(OH)2 + H2', reactionCaption: 'Calcium reacts with water to form calcium hydroxide and hydrogen gas.' },
  { key: 'halogen', name: 'Halogens', group: 'Group 17', valence: 7, ionCharge: '-1',
    members: ['F', 'Cl', 'Br', 'I'],
    behavior: 'They have seven valence electrons. In simple ionic compounds, halogen atoms commonly gain one electron to form -1 halide ions.',
    reactivityTrend: 'up', reactivityNote: 'For elemental halogens, reactivity generally increases up the group; fluorine is the most reactive member shown here.',
    reaction: 'Cl2 + 2Na -> 2NaCl', reactionCaption: 'Chlorine reacts with sodium to form sodium chloride.' },
  { key: 'noble', name: 'Noble gases', group: 'Group 18', valence: 8, ionCharge: '0',
    members: ['He', 'Ne', 'Ar'],
    behavior: 'Their outer electron shell is filled (two electrons for He; eight for Ne and Ar), so they are very unreactive under ordinary conditions and do not commonly form monatomic ions.',
    reactivityTrend: 'none', reactivityNote: 'Noble gases have very low chemical reactivity under ordinary conditions. Some heavier noble gases can form compounds under suitable conditions.',
    reaction: '', reactionCaption: 'No single reaction is representative because noble gases are very unreactive under ordinary conditions.' },
  { key: 'transition', name: 'Transition metals', group: 'Groups 3-12', valence: 2, ionCharge: 'varies',
    members: ['Fe', 'Cu', 'Zn', 'Ag', 'Au'],
    behavior: 'The d-block metals do not follow one simple main-group valence-electron rule. Many form more than one oxidation state, and their compounds and reactivities vary widely.',
    reactivityTrend: 'none', reactivityNote: 'There is no single simple reactivity trend across all of Groups 3-12. Compare specific elements and reactions rather than treating the entire block as equally unreactive.',
    reaction: 'Fe + Cu(NO3)2 -> Fe(NO3)2 + Cu', reactionCaption: 'In this reaction, iron displaces copper from copper(II) nitrate.' }
];

export const FAMILY_QUIZ = [
  { sym: 'K', prompt: 'Potassium sits in Group 1. What ion charge does it commonly form?',
    choices: ['+1', '+2', '-1', '0'], answer: '+1',
    explain: 'Potassium has one valence electron. Losing it gives K+, a +1 cation.' },
  { sym: 'Ca', prompt: 'Calcium sits in Group 2. What ion charge does it commonly form?',
    choices: ['+1', '+2', '-2', '0'], answer: '+2',
    explain: 'Calcium has two valence electrons and commonly loses both to form Ca2+.' },
  { sym: 'Cl', prompt: 'Chlorine sits in Group 17. What monatomic ion charge does it commonly form?',
    choices: ['+1', '-1', '-2', '+7'], answer: '-1',
    explain: 'A chlorine atom has seven valence electrons and can gain one electron to form Cl-.' },
  { sym: 'Ar', prompt: 'Argon sits in Group 18. What monatomic ion charge does it normally form?',
    choices: ['0', '+1', '-1', '+8'], answer: '0',
    explain: 'Argon has a filled valence shell and does not normally form a monatomic ion.' },
  { sym: 'Mg', prompt: 'Magnesium sits in Group 2. What ion charge does it commonly form?',
    choices: ['+1', '+2', '-2', '0'], answer: '+2',
    explain: 'Magnesium has two valence electrons and commonly loses both to form Mg2+.' },
  { sym: 'F', prompt: 'Fluorine sits in Group 17. What monatomic ion charge does it commonly form?',
    choices: ['-1', '+1', '-7', '0'], answer: '-1',
    explain: 'A fluorine atom can gain one electron to complete its valence shell, forming F-.' }
];

// C.5(C): chartable periodic properties.
export const TREND_PROPS = [
  { key: 'radius', label: 'Atomic radius', unit: 'pm', field: 'radius',
    across: 'generally decreases', down: 'increases',
    why: 'Across a period, increasing effective nuclear charge generally pulls valence electrons closer. Down a group, an additional occupied electron shell makes atoms larger.' },
  { key: 'ie1', label: 'First ionization energy', unit: 'kJ/mol', field: 'ie1',
    across: 'generally increases', down: 'generally decreases',
    why: 'Across a period, the stronger effective nuclear attraction generally makes an electron harder to remove. Down a group, the outer electron is farther from the nucleus and more shielded.' },
  { key: 'en', label: 'Electronegativity', unit: 'Pauling', field: 'en',
    across: 'generally increases', down: 'generally decreases',
    why: 'Across much of the table, atoms attract shared bonding electrons more strongly toward the upper right. Pauling values are commonly omitted here for noble gases because this scale is based on bonding data and ordinary noble-gas bonding is limited.' },
  { key: 'mass', label: 'Atomic mass', unit: 'u', field: 'mass',
    across: 'generally increases', down: 'generally increases',
    why: 'Atomic mass usually increases as atomic number increases, but the order is not perfectly monotonic. The History tab shows important mass-order exceptions.' }
];

export const TREND_RUNS = [
  { key: 'p2', label: 'Period 2, across', type: 'period', items: ['Li', 'Be', 'B', 'C', 'N', 'O', 'F', 'Ne'] },
  { key: 'p3', label: 'Period 3, across', type: 'period', items: ['Na', 'Mg', 'Al', 'Si', 'P', 'S', 'Cl', 'Ar'] },
  { key: 'p4', label: 'Period 4, across', type: 'period', items: ['K', 'Ca', 'Sc', 'Ti', 'V', 'Cr', 'Mn', 'Fe', 'Co', 'Ni', 'Cu', 'Zn', { gap: 'Ga-Se' }, 'Br'] },
  { key: 'g1', label: 'Group 1, down', type: 'group', items: ['Li', 'Na', 'K'] },
  { key: 'g2', label: 'Group 2, down', type: 'group', items: ['Be', 'Mg', 'Ca', { gap: 'Sr' }, 'Ba'] },
  { key: 'g17', label: 'Group 17, down', type: 'group', items: ['F', 'Cl', 'Br', 'I'] },
  { key: 'g18', label: 'Group 18, down', type: 'group', items: ['He', 'Ne', 'Ar'] }
];

export const TREND_QUIZ = [
  { property: 'radius', a: 'Na', b: 'Cl', answer: 'Na',
    explain: 'Across Period 3, increasing effective nuclear charge generally pulls the valence shell inward, so sodium has a larger atomic radius than chlorine.' },
  { property: 'radius', a: 'Li', b: 'K', answer: 'K',
    explain: 'Down Group 1, each element adds an occupied electron shell, so potassium has a larger atomic radius than lithium.' },
  { property: 'ie1', a: 'Na', b: 'Cl', answer: 'Cl',
    explain: 'Across Period 3, first ionization energy generally increases, so chlorine requires more energy to remove its first electron than sodium.' },
  { property: 'ie1', a: 'Li', b: 'K', answer: 'Li',
    explain: 'Down Group 1, the outer electron becomes farther from the nucleus and more shielded, so potassium has the lower first ionization energy.' },
  { property: 'en', a: 'F', b: 'I', answer: 'F',
    explain: 'Electronegativity generally decreases down Group 17. Fluorine has the higher Pauling electronegativity.' },
  { property: 'radius', a: 'Mg', b: 'Ba', answer: 'Ba',
    explain: 'Atomic radius increases down Group 2 because additional occupied electron shells are added.' },
  { property: 'en', a: 'Mg', b: 'S', answer: 'S',
    explain: 'Across Period 3, electronegativity generally increases toward the right, so sulfur has the higher Pauling electronegativity.' }
];

export const IE_ANOMALIES = [
  { label: 'Be to B', from: 'Be', to: 'B', group: 'Groups 2 to 13',
    explain: 'Boron loses a higher-energy 2p electron, while removing another electron from beryllium would disrupt its filled 2s subshell. The 2p electron is easier to remove, so the first ionization energy dips from Be to B.' },
  { label: 'N to O', from: 'N', to: 'O', group: 'Groups 15 to 16',
    explain: 'Nitrogen has a half-filled 2p subshell with one electron in each p orbital. Oxygen pairs one of its 2p electrons, increasing electron-electron repulsion and making one electron easier to remove. The first ionization energy therefore dips from N to O.' }
];

// Scenario layer. Real-world context is deliberately separated from the scientific
// claim being graded. When an activity-specific score or decision rule is used, the
// copy identifies it as a simulation convention rather than a universal scientific rule.
export const SCENARIOS = [
  { id: 'a-datasheet', stage: 'table', skill: 'a', type: 'decision',
    system: 'The datasheet with a missing row', icon: '\u{1F4C4}', cell: 'Sc', family: 'transition',
    goal: 'A supplier datasheet has one missing row. Use the surrounding periodic pattern to identify the element before placing the order.',
    why: 'Mendeleev used gaps in his table to predict undiscovered elements. Eka-boron was predicted near an atomic mass of 44 and to form an oxide like Eb2O3; scandium, discovered in 1879, fit that position and formed Sc2O3.',
    consequences: { order: 'The identified part is added to the order.', hold: 'The order stays on hold until the missing element is identified.' },
    effect: { good: { add: 'Sc' }, bad: { drop: 'transition' } } },

  { id: 'a-warehouse', stage: 'table', skill: 'a', type: 'decision',
    system: 'Two bins in the wrong order', icon: '\u{1F4E6}', cell: 'Ar', family: 'noble',
    goal: 'The warehouse sorted element bins by atomic mass. Use Ar/K and Co/Ni to determine which quantity should set the periodic-table order.',
    why: 'Atomic mass is not perfectly monotonic: K is slightly lighter than Ar, and Ni is slightly lighter than Co. Moseley established atomic number—not atomic mass—as the basis of the modern sequence.',
    consequences: { znumber: 'The bins are relabeled by atomic number.', mass: 'The mass-based order keeps the same sequence errors.' },
    effect: { good: { add: 'Ar' }, bad: { drop: 'noble' } } },

  { id: 'a-manual', stage: 'table', skill: 'a', type: 'decision',
    system: 'The historical repair manual', icon: '\u{1F4D6}', cell: 'Na', family: 'alkali',
    goal: 'An old manual uses early mass-based patterns such as triads and octaves. Explain why those patterns were useful but could not organize the complete table.',
    why: 'Döbereiner and Newlands identified real repeating patterns among some elements. Their arrangements were limited because atomic mass alone is not the variable that defines the modern periodic sequence; atomic number is.',
    consequences: { retire: 'The manual is kept as a historical reference while the modern table is used for current work.', keep: 'The incomplete historical arrangement remains in use and misplaces later elements.' },
    effect: { good: { add: 'Na' }, bad: { drop: 'alkali' } } },

  { id: 'b-remote', stage: 'families', skill: 'b', type: 'decision',
    system: 'The leaking alkaline battery', icon: '\u{1F50B}', cell: 'K', family: 'alkali',
    goal: 'A remote has white residue around a leaking alkaline cell. Identify potassium\'s family and the charge of potassium in KOH, then choose the safe next step from the activity options.',
    why: 'Potassium hydroxide contains K+ and OH-. Potassium is a Group 1 element, so +1 is its common monatomic ion charge. A failed battery seal allows electrolyte to escape; the periodic family explains the K+ charge, not why the seal failed.',
    consequences: { clean: 'The cells are removed and the residue is handled according to the battery maker\'s cleanup guidance.', swap: 'New cells are installed without first addressing the leaked residue.' },
    effect: { good: { add: 'K' }, bad: { drop: 'alkali' } } },

  { id: 'b-contact', stage: 'families', skill: 'b', type: 'decision',
    system: 'Two metal contacts', icon: '\u{1F4BF}', cell: 'Ag', family: 'transition',
    goal: 'A silver-plated contact is tarnished while a gold-plated contact is not. Identify the periodic-table family used in this activity, then interpret the provided material note before choosing a replacement.',
    why: 'Silver and gold are both in Group 11 and are treated as transition metals in this course. Their real corrosion and tarnish behavior depends on electrochemistry and environment. The 0–100 reactivity values in this activity are simulation scores, not standardized measurements.',
    consequences: { gold: 'The repair follows the supplied material specification and uses gold plating.', silver: 'The repair uses silver plating instead of the specified corrosion-resistant option.' },
    effect: { good: { add: 'Ag' }, bad: { drop: 'transition' } } },

  { id: 'b-plastic', stage: 'families', skill: 'b', type: 'decision',
    system: 'The brominated plastic marking', icon: '\u{1F525}', cell: 'Br', family: 'halogen',
    goal: 'A laptop case is marked as containing a brominated flame retardant. Identify bromine\'s family and typical monatomic ion charge, then follow the disposal route provided by the activity.',
    why: 'Bromine is a Group 17 halogen and commonly forms Br- in ionic compounds. In brominated flame retardants, bromine is part of a compound; flame-retardant action involves combustion chemistry, not simply formation of Br-. Waste handling follows product and local disposal guidance, not a periodic-family rule.',
    consequences: { separate: 'The offcuts follow the activity\'s designated electronics-waste route.', bin: 'The offcuts are placed in the household-waste route instead of the activity\'s designated route.' },
    effect: { good: { add: 'Br' }, bad: { drop: 'halogen' } } },

  { id: 'c-cell', stage: 'trends', skill: 'c', type: 'decision',
    system: 'Lithium and sodium cells', icon: '\u{1F4F1}', cell: 'Li', family: 'alkali',
    goal: 'Compare lithium and sodium using the periodic data, then choose the cell chemistry specified for this repair.',
    why: 'Li and Na are both Group 1 elements, but Na has a larger atomic radius and greater atomic mass. Those trends are useful comparisons; they do not imply that a sodium-ion battery would weigh three times as much or have a predictable voltage. Whole-cell performance depends on electrochemistry, electrode materials, and design.',
    consequences: { lithium: 'The repair uses the lithium-ion cell specified for the device.', sodium: 'A different battery chemistry is selected even though the device specifies a lithium-ion cell.' },
    effect: { good: { add: 'Li' }, bad: { drop: 'alkali' } } },

  { id: 'c-connector', stage: 'trends', skill: 'c', type: 'decision',
    system: 'Gold on the connector', icon: '\u{1F50C}', cell: 'Au', family: 'transition',
    goal: 'Compare gold and copper using the assigned periodic property, then use the supplied corrosion note to select the connector finish.',
    why: 'Periodic properties let you compare Au and Cu, but electronegativity or atomic radius alone does not measure connector corrosion. The material note identifies gold as the more corrosion-resistant finish; the activity\'s reactivity score is only a simulation aid.',
    consequences: { gold: 'The connector follows the supplied specification and receives gold plating.', copper: 'The connector is left as bare copper instead of using the specified corrosion-resistant finish.' },
    effect: { good: { add: 'Au' }, bad: { drop: 'transition' } } },

  { id: 'c-case', stage: 'trends', skill: 'c', type: 'decision',
    system: 'Aluminum and iron', icon: '\u{1F4BB}', cell: 'Al', family: 'post-transition',
    goal: 'Compare aluminum and iron using the assigned periodic property, then use the supplied case specification to choose the replacement material.',
    why: 'Atomic mass compares individual atoms; it does not equal material density or predict the mass of an entire case. Aluminum is commonly used where low density and corrosion resistance are useful, but those engineering properties require material data beyond this periodic-trend comparison.',
    consequences: { aluminium: 'The repair uses the aluminum case specified for the device.', iron: 'A different case material is selected without the required material specification.' },
    effect: { good: { add: 'Al' }, bad: { drop: 'post-transition' } } },

  { id: 'h1-shielding', stage: 'trends', skill: 'h1', type: 'decision',
    system: 'Why the row tightens', icon: '\u{1F9F2}', cell: 'Si', family: 'metalloid',
    goal: 'Across Period 3, atomic radius generally decreases while first ionization energy generally increases. Use the activity\'s simplified effective-nuclear-charge model to explain the pattern.',
    why: 'This activity uses the simplified model Zeff = Z - core electrons: core electrons are treated as shielding fully and same-shell shielding is neglected. The model therefore increases across a period and helps explain the general trend, but it is an approximation rather than a measured Zeff value.',
    consequences: { right: 'The explanation connects the general trend to the simplified Zeff model.', left: 'The explanation assigns the stronger attraction to the wrong end of the period.' },
    effect: { good: { add: 'Si' }, bad: { drop: 'metalloid' } } },

  { id: 'h2-dip', stage: 'trends', skill: 'h2', type: 'decision',
    system: 'Two dips in the trend', icon: '\u{1F4C9}', cell: 'B', family: 'metalloid',
    goal: 'First ionization energy generally rises across Period 2, but it dips from Be to B and from N to O. Identify the electron-configuration reason for the highlighted dip.',
    why: 'From Be to B, the electron removed from B is a higher-energy 2p electron. From N to O, electron pairing in one 2p orbital increases repulsion. These local electron-configuration effects produce dips even while nuclear charge increases across the period.',
    consequences: { subshell: 'The exception is recorded with its electron-configuration explanation.', charge: 'The real exception is incorrectly treated as random measurement noise.' },
    effect: { good: { add: 'B' }, bad: { drop: 'metalloid' } } },

  { id: 'cap-substitute', stage: 'capstone', skill: 'cap', type: 'decision',
    system: 'The substitute part', icon: '\u{1F527}', cell: 'Ni', family: 'transition',
    goal: 'Estimate nickel\'s atomic radius from the neighboring values, then apply the activity\'s stated compatibility rule to the offered substitute.',
    why: 'The radius estimate practices interpolation from periodic data. The substitute decision uses a simulation compatibility rule so you can combine evidence in one capstone. The 0–100 reactivity score and its cutoff are activity criteria—not universal corrosion measurements or engineering standards.',
    consequences: { fit: 'The substitute meets the activity\'s stated compatibility criterion and is fitted.', wait: 'The activity rule does not support the substitute, so the specified part is ordered.', nofit: 'The substitute is rejected under the activity\'s compatibility criterion.' },
    effect: { good: { add: 'Ni' }, bad: { drop: 'transition' } } }
];

export const BOARD_CELLS = SCENARIOS.map(s => ({ sym: s.cell, family: s.family, from: s.id }));

// Supplier notes for the capstone simulation. These are scenario constraints, not
// universal engineering rules.
export const CAP_SUBSTITUTES = [
  { sym: 'Cu', note: 'Activity note: conductive, but the offered finish does not meet the supplied corrosion specification.' },
  { sym: 'Zn', note: 'Activity note: its simulation score is close to nickel, so it may meet the stated compatibility rule.' },
  { sym: 'Ag', note: 'Activity note: conductive but not the specified finish for this contact.' },
  { sym: 'Fe', note: 'Activity note: the unplated steel option does not meet the supplied corrosion specification.' },
  { sym: 'Al', note: 'Activity note: its surface oxide makes this offered part unsuitable for the stated contact specification.' },
  { sym: 'Pb', note: 'Activity note: this substitute is not approved by the supplied consumer-device specification.' }
];

export const SCENARIO_TASKS = {
  'a-datasheet': {
    ask: 'Which element belongs in the missing row?', pool: 'gap',
    explain: MENDELEEV_GAP.explain,
    actions: [{ k: 'order', label: 'Order the identified part' }, { k: 'hold', label: 'Hold the order' }],
    actionTrue: 'order' },

  'a-warehouse': {
    ask: 'Which quantity should determine the periodic-table order?',
    options: [
      { k: 'znumber', label: 'Atomic number' },
      { k: 'mass', label: 'Atomic mass' },
      { k: 'alpha', label: 'Alphabetical order by symbol' },
      { k: 'density', label: 'Density' }
    ],
    answer: 'znumber',
    explain: 'Atomic mass is not perfectly monotonic: Ar/K and Co/Ni appear in opposite mass order. Moseley established atomic number as the basis of the modern periodic sequence.',
    actions: [{ k: 'znumber', label: 'Relabel by atomic number' }, { k: 'mass', label: 'Keep the mass ordering' }],
    actionTrue: 'znumber' },

  'a-manual': {
    ask: 'Why can the early mass-based arrangement not organize the complete periodic table?',
    options: [
      { k: 'weight', label: 'Atomic mass alone does not define the modern periodic sequence' },
      { k: 'threes', label: 'Any group of three elements is too small to show a pattern' },
      { k: 'printing', label: 'The later rows were missing only because they were not printed' },
      { k: 'metals', label: 'The pattern fails only because nonmetals are included' }
    ],
    answer: 'weight',
    explain: 'Triads and octaves revealed real periodic similarities, especially among lighter elements, but they did not organize all known elements. Atomic number—not atomic mass—is the basis of the modern sequence.',
    actions: [{ k: 'retire', label: 'Use the modern table' }, { k: 'keep', label: 'Keep using the old arrangement' }],
    actionTrue: 'retire' },

  'b-remote': {
    ask: 'Which family contains potassium, and what charge does potassium have in KOH?',
    options: [
      { k: 'alkali', label: 'Alkali metals; K+' },
      { k: 'alkaline-earth', label: 'Alkaline earth metals; K2+' },
      { k: 'halogen', label: 'Halogens; K-' },
      { k: 'transition', label: 'Transition metals; variable charge' }
    ],
    answer: 'alkali',
    explain: 'Potassium is a Group 1 alkali metal and commonly forms K+. In potassium hydroxide, the ions are K+ and OH-. A failed seal causes the electrolyte leak; Group 1 membership explains the potassium ion charge, not the seal failure.',
    actions: [{ k: 'clean', label: 'Remove cells and follow cleanup guidance' }, { k: 'swap', label: 'Install new cells without cleaning residue' }],
    actionTrue: 'clean' },

  'b-contact': {
    ask: 'How should the Ag/Au family and reactivity information be interpreted?',
    options: [
      { k: 'transition', label: 'Both are Group 11 metals; the 0–100 reactivity values are simulation scores' },
      { k: 'different', label: 'Silver is a transition metal, but gold is a post-transition metal' },
      { k: 'alkali', label: 'Both are alkali metals because +1 ions are possible' },
      { k: 'metalloid', label: 'Both are metalloids because they conduct electricity' }
    ],
    answer: 'transition',
    explain: 'Silver and gold are both in Group 11 and are treated as transition metals in this course. The activity reactivity numbers are simulation scores; they are not a standardized scale and do not by themselves predict real connector service life.',
    actions: [{ k: 'gold', label: 'Use the specified gold plating' }, { k: 'silver', label: 'Use silver plating instead' }],
    actionTrue: 'gold' },

  'b-plastic': {
    ask: 'Which family contains bromine, and what monatomic ion does bromine commonly form?',
    options: [
      { k: 'halogen', label: 'Halogens; Br-' },
      { k: 'noble', label: 'Noble gases; no common monatomic ion' },
      { k: 'nonmetal', label: 'Nonmetals generally; no predictable ion charge' },
      { k: 'alkaline-earth', label: 'Alkaline earth metals; Br2+' }
    ],
    answer: 'halogen',
    explain: 'Bromine is a Group 17 halogen and commonly forms Br- in ionic compounds. Brominated flame retardants are compounds; their combustion behavior and disposal requirements cannot be inferred from the Br- ion rule alone.',
    actions: [{ k: 'separate', label: 'Follow the listed electronics-waste route' }, { k: 'bin', label: 'Use the household-waste route' }],
    actionTrue: 'separate' },

  'c-cell': {
    ask: null, pool: 'pair',
    actions: [{ k: 'lithium', sym: 'Li', label: 'Use the specified lithium-ion cell' },
              { k: 'sodium', sym: 'Na', label: 'Substitute a sodium-ion cell' }],
    actionTrue: 'lithium' },
  'c-connector': {
    ask: null, pool: 'pair',
    actions: [{ k: 'gold', sym: 'Au', label: 'Use the specified gold plating' },
              { k: 'copper', sym: 'Cu', label: 'Leave the contact as bare copper' }],
    actionTrue: 'gold' },
  'c-case': {
    ask: null, pool: 'pair',
    actions: [{ k: 'aluminium', sym: 'Al', label: 'Use the specified aluminum case' },
              { k: 'iron', sym: 'Fe', label: 'Substitute a steel case' }],
    actionTrue: 'aluminium' },

  'h1-shielding': {
    ask: 'Which model explains the general radius and ionization-energy trends across Period 3?',
    options: [
      { k: 'zeff', label: 'A simplified Zeff model: nuclear charge rises while core-electron shielding stays about the same' },
      { k: 'mass', label: 'Greater atomic mass directly pulls valence electrons inward' },
      { k: 'shells', label: 'A new occupied electron shell is added at every step across the period' },
      { k: 'neutrons', label: 'Additional neutrons directly increase the electrostatic attraction on electrons' }
    ],
    answer: 'zeff',
    explain: 'This activity uses the simplified model Zeff = Z - core electrons. Across Period 3, the number of core electrons stays the same while proton count rises, so this model Zeff rises. Real electron shielding is more detailed because same-shell electrons also contribute some shielding.',
    actions: [{ k: 'right', label: 'The right side generally holds valence electrons more strongly' }, { k: 'left', label: 'The left side does' }],
    actionTrue: 'right' },

  'h2-dip': {
    ask: 'Why does first ionization energy drop at the highlighted step?', pool: 'anomaly',
    options: [
      { k: 'p-electron', label: 'The electron removed from B is a higher-energy 2p electron than the 2s electron in Be' },
      { k: 'pairing', label: 'Electron pairing in O increases repulsion within one 2p orbital' },
      { k: 'charge', label: 'Nuclear charge decreases between the two elements' },
      { k: 'size', label: 'A new occupied electron shell is added between the two elements' }
    ],
    actions: [{ k: 'subshell', label: 'Record the electron-configuration explanation' }, { k: 'charge', label: 'Treat the dip as measurement noise' }],
    actionTrue: 'subshell' }
};

export const ANOMALY_ANSWER = { 'Be to B': 'p-electron', 'N to O': 'pairing' };
