// teks.js — Texas Chemistry course map (19 TAC §112.43, Adopted 2020, implemented 2024-25).
// SEPs C.1–C.4 are embedded across every unit (>=40% of instructional time).

export const COURSE = {
  code: '19 TAC §112.43',
  title: 'Chemistry (One Credit)',
  adopted: 'Adopted 2020 · implemented 2024–2025'
};

export const SEP = [
  { code: 'C.1', text: 'Ask questions, plan and safely conduct investigations, use tools and models.' },
  { code: 'C.2', text: 'Analyze and interpret data; identify patterns, error, and relationships.' },
  { code: 'C.3', text: 'Develop evidence-based explanations; communicate and argue from evidence.' },
  { code: 'C.4', text: 'Evaluate scientific work; relate research to society and STEM careers.' }
];

// Each unit leads with a `hook`: a real-world question that makes the chemistry
// worth caring about. `case` names the animated Case File that unit unlocks.
export const UNITS = [
  {
    n: 1, abbr: 'Pr', slug: '01-practices-matter',
    title: 'Practices, Measurement & Matter',
    hook: 'How does a skipped unit conversion crash a $327M Mars mission?',
    case: 'The Mars unit disaster',
    blurb: 'Lab safety, SI units, significant figures, density, and the recurring themes that frame chemistry.',
    teks: ['C.1', 'C.2', 'C.3', 'C.4'], status: 'ready'
  },
  {
    n: 2, abbr: 'At', slug: '02-atomic-structure',
    title: 'Atomic Structure & Theory',
    hook: 'Why can a firework only ever burn the colors its elements allow?',
    case: 'Fireworks are falling electrons',
    blurb: 'Build atoms and isotopes, average atomic mass, emission spectra, electron configurations.',
    teks: ['C.6', 'C.5'], status: 'ready'
  },
  {
    n: 3, abbr: 'Pt', slug: '03-periodic-trends',
    title: 'Periodic Table & Trends',
    hook: 'Why did battery engineers bet your phone on the top-left corner?',
    case: 'The lithium battery map',
    blurb: 'Explore radius, ionization energy, electronegativity, and predict chemical-family behavior.',
    teks: ['C.5'], status: 'ready'
  },
  {
    n: 4, abbr: 'Bd', slug: '04-bonding-geometry',
    title: 'Bonding, Nomenclature & Geometry',
    hook: 'How does one 104.5° bond angle keep every frozen lake alive?',
    case: 'The bend that floats ice',
    blurb: 'Ionic/covalent/metallic bonds, IUPAC naming, 3D VSEPR shapes, intermolecular forces.',
    teks: ['C.7'], status: 'ready'
  },
  {
    n: 5, abbr: 'Mo', slug: '05-the-mole',
    title: 'The Mole & Chemical Quantities',
    hook: 'How did mole math bring Apollo 13 home alive?',
    case: 'Apollo 13 survival math',
    blurb: 'Moles, molar mass, Avogadro’s number, percent composition, empirical and molecular formulas.',
    teks: ['C.8'], status: 'ready'
  },
  {
    n: 6, abbr: 'Rx', slug: '06-reactions-stoichiometry',
    title: 'Reactions & Stoichiometry',
    hook: 'What mole ratio inflates your airbag in 30 milliseconds?',
    case: 'Airbag stoichiometry',
    blurb: 'Balance and classify reactions, then run particle-level stoichiometry with limiting reactants.',
    teks: ['C.9'], status: 'ready'
  },
  {
    n: 7, abbr: 'Gs', slug: '07-gas-laws',
    title: 'Gas Laws & Kinetic Theory',
    hook: "How does Boyle's law explain why scuba divers must not hold their breath during ascent?",
    case: "Boyle's law and scuba ascent",
    blurb: 'Kinetic molecular theory, ideal-gas relationships, PV = nRT, and Dalton’s law of partial pressure.',
    teks: ['C.10'], status: 'ready'
  },
  {
    n: 8, abbr: 'Sn', slug: '08-solutions',
    title: 'Solutions & Solubility',
    hook: 'How did a quiet lake dissolve, then exhale, a lethal cloud?',
    case: 'The lake that exhaled',
    blurb: 'Dissolving, solubility curves, saturation, molarity, and dilution.',
    teks: ['C.11'], status: 'ready'
  },
  {
    n: 9, abbr: 'Ab', slug: '09-acids-bases',
    title: 'Acids & Bases',
    hook: 'What does a $1 can of soda really do to your tooth enamel?',
    case: 'Soda vs. your teeth',
    blurb: 'pH from hydrogen-ion concentration, strong vs weak, neutralization, titration.',
    teks: ['C.12'], status: 'ready'
  },
  {
    n: 10, abbr: 'Th', slug: '10-thermochemistry',
    title: 'Thermochemistry',
    hook: 'Can you put enough heat into a hypothermic climber to keep her alive?',
    case: 'Calories measured by fire',
    blurb: 'Calorimetry (q = mcΔT), exothermic vs endothermic, energy diagrams.',
    teks: ['C.13'], status: 'ready'
  },
  {
    n: 11, abbr: 'Nc', slug: '11-nuclear',
    title: 'Nuclear Chemistry',
    hook: 'A body comes out of a glacier. How does carbon-14 say it has been there 5,300 years?',
    case: 'Otzi, dated by what was left',
    blurb: 'Alpha/beta/gamma decay equations, half-life, fission versus fusion, and what isotopes are actually used for.',
    teks: ['C.14'], status: 'ready'
  }
];