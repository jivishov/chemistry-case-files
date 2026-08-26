// model.js - Unit 6 domain data (Reactions & Stoichiometry, TEKS C.9).
// Pure data + classification constants. No DOM, no framework.
//
// The units_new build: units/06-reactions-stoichiometry rendered in the mission-cockpit
// shell. This file is a verbatim copy of the worksheet build's model.js -- it has no
// imports to re-path and no unitId to change, and not one reaction, band, scenario id or
// line of consequence text is touched by the port. The Scenario layer here arrived
// working (HANDOFF-INDEX.md, class B) and the port is presentation only.

export const STRUCTURAL_TYPES = [
  'Synthesis', 'Decomposition', 'Single replacement', 'Double replacement', 'Combustion'
];

// C.9(B) sub-classifications layered on top.
export const SUBTYPES = ['Acid-base', 'Precipitation', 'Redox'];

// Redox subtype data are curated for this reaction bank. A free element can be a
// useful clue, but students should confirm that oxidation numbers change.

// Each species: { f: formula, c: coefficient, state: 's'|'l'|'g'|'aq' }
// display: mhchem string rendered by KaTeX.
// where: the setting this reaction actually turns up in on the rotation. Additive,
// used by the briefs and the reaction picker; nothing computes from it.
export const REACTIONS = [
  {
    id: 'haber', display: 'N2(g) + 3 H2(g) -> 2 NH3(g)',
    where: 'the co-op fertilizer depot at the edge of town',
    structural: 'Synthesis', subs: ['Redox'],
    reactants: [{ f: 'N2', c: 1, state: 'g' }, { f: 'H2', c: 3, state: 'g' }],
    products:  [{ f: 'NH3', c: 2, state: 'g' }]
  },
  {
    id: 'peroxide', display: '2 H2O2(aq) -> 2 H2O(l) + O2(g)',
    where: 'the brown bottle in the jump kit',
    structural: 'Decomposition', subs: ['Redox'],
    reactants: [{ f: 'H2O2', c: 2, state: 'aq' }],
    products:  [{ f: 'H2O', c: 2, state: 'l' }, { f: 'O2', c: 1, state: 'g' }]
  },
  {
    id: 'zinc-acid', display: 'Zn(s) + 2 HCl(aq) -> ZnCl2(aq) + H2(g)',
    where: 'muriatic acid running under a galvanized shelf',
    structural: 'Single replacement', subs: ['Redox'],
    reactants: [{ f: 'Zn', c: 1, state: 's' }, { f: 'HCl', c: 2, state: 'aq' }],
    products:  [{ f: 'ZnCl2', c: 1, state: 'aq' }, { f: 'H2', c: 1, state: 'g' }]
  },
  {
    id: 'silver-halide', display: 'AgNO3(aq) + NaCl(aq) -> AgCl v + NaNO3(aq)',
    where: 'the stained bench in the old darkroom on Third',
    structural: 'Double replacement', subs: ['Precipitation'],
    reactants: [{ f: 'AgNO3', c: 1, state: 'aq' }, { f: 'NaCl', c: 1, state: 'aq' }],
    products:  [{ f: 'AgCl', c: 1, state: 's' }, { f: 'NaNO3', c: 1, state: 'aq' }]
  },
  {
    id: 'methane', display: 'CH4(g) + 2 O2(g) -> CO2(g) + 2 H2O(g)',
    where: 'the space heater in a sealed ice-fishing shack',
    structural: 'Combustion', subs: ['Redox'],
    reactants: [{ f: 'CH4', c: 1, state: 'g' }, { f: 'O2', c: 2, state: 'g' }],
    products:  [{ f: 'CO2', c: 1, state: 'g' }, { f: 'H2O', c: 2, state: 'g' }]
  },
  {
    id: 'neutralize', display: 'HCl(aq) + NaOH(aq) -> NaCl(aq) + H2O(l)',
    where: 'the ditch at the county line, under an overturned tanker',
    structural: 'Double replacement', subs: ['Acid-base'],
    reactants: [{ f: 'HCl', c: 1, state: 'aq' }, { f: 'NaOH', c: 1, state: 'aq' }],
    products:  [{ f: 'NaCl', c: 1, state: 'aq' }, { f: 'H2O', c: 1, state: 'l' }]
  },
  {
    id: 'rust', display: '4 Fe(s) + 3 O2(g) -> 2 Fe2O3(s)',
    where: "the ladder truck's frame, every winter it sits in road salt",
    structural: 'Synthesis', subs: ['Redox'],
    reactants: [{ f: 'Fe', c: 4, state: 's' }, { f: 'O2', c: 3, state: 'g' }],
    products:  [{ f: 'Fe2O3', c: 2, state: 's' }]
  },
  {
    id: 'aluminum-chloride', display: '2 Al(s) + 3 Cl2(g) -> 2 AlCl3(s)',
    where: 'a leaking chlorine cylinder in a shed full of aluminium stock',
    structural: 'Synthesis', subs: ['Redox'],
    reactants: [{ f: 'Al', c: 2, state: 's' }, { f: 'Cl2', c: 3, state: 'g' }],
    products:  [{ f: 'AlCl3', c: 2, state: 's' }]
  },
  {
    id: 'copper-displacement', display: 'Fe(s) + CuSO4(aq) -> FeSO4(aq) + Cu(s)',
    where: 'the rinse tank at the plating shop on the industrial road',
    structural: 'Single replacement', subs: ['Redox'],
    reactants: [{ f: 'Fe', c: 1, state: 's' }, { f: 'CuSO4', c: 1, state: 'aq' }],
    products:  [{ f: 'FeSO4', c: 1, state: 'aq' }, { f: 'Cu', c: 1, state: 's' }]
  },
  {
    id: 'propane', display: 'C3H8(g) + 5 O2(g) -> 3 CO2(g) + 4 H2O(g)',
    where: 'a grill bottle in somebody’s yard, and the bobtail on the highway',
    structural: 'Combustion', subs: ['Redox'], honors: true,
    reactants: [{ f: 'C3H8', c: 1, state: 'g' }, { f: 'O2', c: 5, state: 'g' }],
    products:  [{ f: 'CO2', c: 3, state: 'g' }, { f: 'H2O', c: 4, state: 'g' }]
  }
];

// Spec tolerance for the dose stages. Measured, not chosen: swept across all ten
// reactions, omitting the mole ratio is at minimum a 20.0 percent error and inverting
// it is at minimum 36.0 percent, so a 3 percent acceptable window is at least six
// times narrower than the smallest error the skill's own failure mode can produce.
const DOSE_BANDS = { mode: 'relative', ideal: 0.01, acceptable: 0.03 };

// Two generator rules that the bands alone cannot enforce, both measured:
//   1. A stoich scenario must pin a NON-1:1 (given, find) pair. 50 of the 96 pairs in
//      this bank are already 1:1, and on those there is no mole-ratio error to make:
//      the task collapses to a molar-mass conversion, which is C.8, not C.9(C).
//   2. It must avoid propane's C3H8 (44.10 g/mol) against CO2 (44.01), a 0.2 percent
//      gap, where a learner using the wrong molar mass lands inside `ideal` by luck.
//      That is the only sub-3-percent molar-mass pair among the 46 usable ones.
// Every `constraints` block below satisfies both.

// SCENARIOS: the game layer. You are second due on a small-town volunteer fire and
// hazmat crew. One engine, one squad, and a co-op fertilizer depot at the edge of
// town. Every call comes down to the same question: what reaction is running, and how
// much of what does it take to stop it. The chemistry tools are unchanged (coefficient
// inputs, the classify grid, the factor-label readout, the particle tokens); the
// fiction, the consequences and the world-state (caustic soda on the truck + the incident
// log) are what make it a game rather than a worksheet.
//   Dose (C.9C, C.9D, Honors): commit a number. The band grades YOUR value against the
//     true requirement: on target vs too little / too much (each a named consequence)
//     vs unresolved. icon + state words drive the visual reaction.
//   Decision (C.9B, capstone): per-option consequence text; the chemically-correct
//     option is the one good outcome.
//   Identity (C.9A): the CONSTRUCTED coefficient set maps to success/fail.
//   constraints: { reaction, given, find, unit } so the generators apply the picks.
export const SCENARIOS = [
  // ---------- C.9(A) balance ----------
  { id: 'a-ladder', stage: 'balance', skill: 'a', type: 'identity',
    system: 'The ladder truck', icon: '\u{1F692}',
    goal: 'Balance this simplified equation for forming iron(III) oxide from iron and oxygen. Use the smallest whole-number coefficients.',
    why: 'Balancing conserves the number of each type of atom. Real rusting is a more complex electrochemical process involving water.',
    constraints: { reaction: 'rust' },
    safeState: 'BALANCED', failState: 'NOT BALANCED',
    correct: 'The coefficients are 4 : 3 : 2. Both sides contain the same number of Fe and O atoms, and the coefficients are in lowest whole-number terms.',
    wrong: 'The atom counts do not match. Recount Fe and O on both sides and adjust coefficients only.' },
  { id: 'a-grill', stage: 'balance', skill: 'a', type: 'identity',
    system: 'The backyard bottle', icon: '\u{1F525}',
    goal: 'Balance the complete-combustion equation for propane: propane plus oxygen forms carbon dioxide and water. Use the smallest whole-number coefficients.',
    why: 'The coefficients show the stoichiometric mole ratios among reactants and products.',
    constraints: { reaction: 'propane' },
    safeState: 'BALANCED', failState: 'NOT BALANCED',
    correct: 'The coefficients are 1 : 5 : 3 : 4. Carbon, hydrogen, and oxygen atoms are conserved.',
    wrong: 'Recheck the C, H, and O atom counts, then reduce the coefficients if they share a common factor.' },
  { id: 'a-depot', stage: 'balance', skill: 'a', type: 'identity',
    system: 'The ammonia synthesis line', icon: '\u{1F3ED}',
    goal: 'Balance the ammonia-synthesis equation: nitrogen plus hydrogen forms ammonia. Use the smallest whole-number coefficients.',
    why: 'The balanced equation provides the mole ratio used in later stoichiometric calculations.',
    constraints: { reaction: 'haber' },
    safeState: 'BALANCED', failState: 'NOT BALANCED',
    correct: 'The coefficients are 1 : 3 : 2. Nitrogen and hydrogen atoms are conserved.',
    wrong: 'Recheck the N and H atom counts on both sides of the equation.' },

  // ---------- C.9(B) classify ----------
  { id: 'b-jumpkit', stage: 'classify', skill: 'b', type: 'decision',
    system: 'Hydrogen peroxide sample', icon: '\u{1FA79}',
    goal: 'A sample of hydrogen peroxide decomposes and releases oxygen bubbles. Classify the reaction shown.',
    why: 'One compound forms two products. Light and heat can accelerate hydrogen peroxide decomposition, which is why it is stored in light-resistant containers.',
    constraints: { reaction: 'peroxide' },
    consequences: {
      'Decomposition': 'Correct. One compound, H2O2, forms H2O and O2, so the structural type is decomposition.',
      'Synthesis': 'Synthesis combines simpler substances into one product. This equation starts with one compound and forms two products.',
      'Single replacement': 'Single replacement requires an element to replace another element in a compound. That pattern is not present here.',
      'Double replacement': 'Double replacement starts with two compounds that exchange ions. This equation has only one reactant compound.',
      'Combustion': 'Combustion is not the structural pattern shown. H2O2 decomposes into H2O and O2.'
    } },
  { id: 'b-darkroom', stage: 'classify', skill: 'b', type: 'decision',
    system: 'Silver chloride precipitate', icon: '\u{1F4F7}',
    goal: 'Aqueous silver nitrate and sodium chloride are mixed, and solid AgCl forms. Classify the reaction shown.',
    why: 'A precipitation reaction forms an insoluble solid from ions that were dissolved in solution.',
    constraints: { reaction: 'silver-halide' },
    consequences: {
      'Double replacement': 'Correct. The ions exchange partners, and AgCl forms as a precipitate.',
      'Synthesis': 'Synthesis usually forms one product from simpler reactants. This reaction produces two compounds.',
      'Decomposition': 'Decomposition starts with one compound and forms simpler products. That pattern is not present here.',
      'Single replacement': 'Single replacement requires a free element and a compound. Both reactants here are compounds.',
      'Combustion': 'Combustion is not the structural pattern shown. This is an ion-exchange reaction that forms a precipitate.'
    } },
  { id: 'b-ditch', stage: 'classify', skill: 'b', type: 'decision',
    system: 'Acid-base reaction', icon: '\u{1F6A8}',
    goal: 'Hydrochloric acid reacts with sodium hydroxide to form sodium chloride and water. Classify the reaction shown.',
    why: 'For this activity, identify both the double-replacement pattern and the acid-base subtype. Strong-acid/strong-base neutralization is exothermic.',
    constraints: { reaction: 'neutralize' },
    spendWrong: 5,
    consequences: {
      'Double replacement': 'Correct. HCl and NaOH exchange ions, and the reaction is also classified as acid-base neutralization.',
      'Synthesis': 'Synthesis forms one main product from simpler reactants. This equation has two products.',
      'Decomposition': 'Decomposition starts with one compound. Here two aqueous compounds react.',
      'Single replacement': 'Single replacement requires a free element. No free element appears in this equation.',
      'Combustion': 'Combustion is not the pattern shown. This is an acid-base reaction with an ion-exchange pattern.'
    } },

  // ---------- C.9(C) stoichiometry ----------
  { id: 'c-garage', stage: 'stoich', skill: 'c', type: 'dose',
    system: 'Zinc and hydrochloric acid', icon: '\u{1FAA3}',
    goal: 'Using the balanced equation, calculate the theoretical mass of H2 that can form from the given mass of HCl.',
    why: 'This is a stoichiometric prediction. In a real incident, direct hazard assessment and atmospheric measurements would guide entry and ventilation decisions.',
    constraints: { reaction: 'zinc-acid', given: 'HCl', find: 'H2', unit: 'g', amount: [40, 260] },
    bands: DOSE_BANDS,
    actionLabel: 'Submit calculation',
    safeState: 'WITHIN TOLERANCE', lowState: 'RESULT TOO LOW', highState: 'RESULT TOO HIGH',
    safe: 'Your result is within the activity tolerance and matches the theoretical value from the balanced equation.',
    low: 'Your result is below the theoretical value. Recheck the mole ratio and molar-mass conversions.',
    high: 'Your result is above the theoretical value. Recheck the mole ratio and molar-mass conversions.',
    fail: 'Enter a numerical mass so the result can be compared with the theoretical value.' },
  { id: 'c-depot', stage: 'stoich', skill: 'c', type: 'dose',
    system: 'Ammonia synthesis ratio', icon: '\u{1F3ED}',
    goal: 'Calculate the stoichiometric mass of H2 that would react completely with the given mass of N2.',
    why: 'This practices mass-to-mass stoichiometry. The calculation does not establish the actual composition or hazard of an industrial process line.',
    constraints: { reaction: 'haber', given: 'N2', find: 'H2', unit: 'g', amount: [200, 1400] },
    bands: DOSE_BANDS,
    actionLabel: 'Submit calculation',
    safeState: 'WITHIN TOLERANCE', lowState: 'RESULT TOO LOW', highState: 'RESULT TOO HIGH',
    safe: 'Your result is within the activity tolerance for the stoichiometric H2 requirement.',
    low: 'Your result is too low. Convert N2 to moles, apply the 3 : 1 H2-to-N2 mole ratio, then convert H2 to grams.',
    high: 'Your result is too high. Check the 3 : 1 H2-to-N2 mole ratio and your molar-mass conversion.',
    fail: 'Enter a numerical H2 mass to compare with the stoichiometric value.' },
  { id: 'c-bobtail', stage: 'stoich', skill: 'c', type: 'dose',
    system: 'Propane combustion', icon: '\u{1F69B}',
    goal: 'Calculate the mass of O2 required for complete combustion of the given mass of propane.',
    why: 'This is the stoichiometric oxygen requirement for complete combustion. A real vapor-cloud hazard zone depends on measurements, dispersion, weather, and site conditions.',
    constraints: { reaction: 'propane', given: 'C3H8', find: 'O2', unit: 'g', amount: [1500, 9000] },
    bands: DOSE_BANDS,
    actionLabel: 'Submit calculation',
    safeState: 'WITHIN TOLERANCE', lowState: 'RESULT TOO LOW', highState: 'RESULT TOO HIGH',
    safe: 'Your result is within the activity tolerance for the stoichiometric O2 requirement.',
    low: 'Your result is too low. Recheck the 5 : 1 O2-to-propane mole ratio.',
    high: 'Your result is too high. Recheck the mole ratio and O2 molar mass.',
    fail: 'Enter a numerical O2 mass so the result can be checked.' },

  // ---------- C.9(D) limiting reactant ----------
  { id: 'd-shack', stage: 'lr', skill: 'd', type: 'dose',
    system: 'Complete-combustion model', icon: '\u{1F3D5}\u{FE0F}',
    goal: 'Using the complete-combustion equation shown, identify the limiting reactant and calculate the maximum mass of CO2 this model can produce.',
    why: 'The limiting reactant determines theoretical yield in this model. Oxygen-poor combustion can form CO and other products, which this simplified equation does not predict.',
    constraints: { reaction: 'methane' },
    bands: DOSE_BANDS,
    actionLabel: 'Submit result',
    safeState: 'WITHIN TOLERANCE', lowState: 'YIELD TOO LOW', highState: 'YIELD TOO HIGH',
    safe: 'You identified the limiting reactant and calculated the maximum CO2 predicted by the displayed complete-combustion model.',
    low: 'The limiting reactant is correct, but the theoretical CO2 mass is too low. Recheck the mole ratio to CO2.',
    high: 'The theoretical CO2 mass is too high. Make sure the calculation starts from the limiting reactant.',
    fail: 'Select a limiting reactant and enter the theoretical CO2 mass.' },
  { id: 'd-ditch', stage: 'lr', skill: 'd', type: 'dose',
    system: 'HCl and NaOH model', icon: '\u{1F69B}',
    goal: 'Given masses of HCl and NaOH, identify the limiting reactant and calculate the theoretical mass of NaCl that can form.',
    why: 'The limiting reactant sets the maximum product amount. Treat this as a stoichiometry model, not as spill-response guidance.',
    constraints: { reaction: 'neutralize' },
    bands: DOSE_BANDS,
    spend: { ok: 8, low: 5, high: 14 },
    actionLabel: 'Submit result',
    safeState: 'WITHIN TOLERANCE', lowState: 'YIELD TOO LOW', highState: 'YIELD TOO HIGH',
    safe: 'You used the limiting reactant to calculate the theoretical NaCl yield.',
    low: 'The theoretical yield is too low. Recheck the limiting reactant and mole ratio.',
    high: 'The theoretical yield is too high. Make sure the excess reactant was not used to set product amount.',
    fail: 'Select the limiting reactant and enter a theoretical NaCl mass.' },
  { id: 'd-shed', stage: 'lr', skill: 'd', type: 'dose',
    system: 'Aluminum and chlorine model', icon: '\u{2622}\u{FE0F}',
    goal: 'Given masses of Al and Cl2, identify the limiting reactant and calculate the theoretical mass of AlCl3 that can form.',
    why: 'The limiting reactant sets the theoretical product amount. Actual chlorine hazards require direct monitoring and controlled response procedures.',
    constraints: { reaction: 'aluminum-chloride' },
    bands: DOSE_BANDS,
    actionLabel: 'Submit result',
    safeState: 'WITHIN TOLERANCE', lowState: 'YIELD TOO LOW', highState: 'YIELD TOO HIGH',
    safe: 'You identified the limiting reactant and calculated the theoretical AlCl3 yield.',
    low: 'The theoretical yield is too low. Recheck the mole ratio from the limiting reactant.',
    high: 'The theoretical yield is too high. Check that the excess reactant did not determine the product amount.',
    fail: 'Select the limiting reactant and enter a theoretical AlCl3 mass.' },

  // ---------- Honors ----------
  { id: 'h1-particles', stage: 'honors1', skill: 'h1', type: 'dose',
    system: 'Particle-count conversion', icon: '\u{1F52C}',
    goal: 'Convert the product mass from the stoichiometry problem to a number of representative particles.',
    why: 'Moles connect measurable mass to microscopic particle count through Avogadro\'s constant.',
    constraints: {}, bands: DOSE_BANDS,
    actionLabel: 'Submit particle count',
    safeState: 'WITHIN TOLERANCE', lowState: 'COUNT TOO LOW', highState: 'COUNT TOO HIGH',
    safe: 'Your particle count is consistent with the product mass and Avogadro\'s constant.',
    low: 'Your count is too low. Convert grams to moles before multiplying by Avogadro\'s constant.',
    high: 'Your count is too high. Recheck the molar-mass conversion and exponent.',
    fail: 'Enter a positive particle count.' },
  { id: 'h2-recovery', stage: 'honors2', skill: 'h2', type: 'dose',
    system: 'Excess reactant remaining', icon: '\u{1F4E6}',
    goal: 'Calculate the grams of excess reactant remaining after the limiting reactant is consumed.',
    why: 'Subtract the moles consumed from the starting moles of the excess reactant, then convert the remainder to grams.',
    constraints: {}, bands: DOSE_BANDS,
    actionLabel: 'Submit remainder',
    safeState: 'WITHIN TOLERANCE', lowState: 'REMAINDER TOO LOW', highState: 'REMAINDER TOO HIGH',
    safe: 'Your remaining mass matches the excess reactant left by the stoichiometric calculation.',
    low: 'Your remaining mass is too low. Recheck how many moles of the excess reactant were consumed.',
    high: 'Your remaining mass is too high. Recheck the subtraction and final grams conversion.',
    fail: 'Enter the calculated mass of excess reactant remaining.' },

  // ---------- Capstone ----------
  { id: 'cap-tanker', stage: 'capstone', skill: 'cap', type: 'decision',
    system: 'The tanker simulation', icon: '\u{1F6A8}',
    goal: 'A simplified spill model gives the NaOH mass required to neutralize a known HCl amount. Compare that requirement with the simulated reagent inventory and select the activity response.',
    why: 'This capstone combines stoichiometry with a simulation constraint. The response options are activity rules, not real HAZMAT procedures.',
    options: [
      { key: 'lay', label: 'Use the simulated truck supply',
        good: 'In this simulation, the truck has enough NaOH to meet the calculated stoichiometric requirement.',
        consequence: 'The simulated truck supply is below the calculated requirement, so this option does not satisfy the activity constraint.' },
      { key: 'hold', label: 'Use simulated mutual aid',
        good: 'In this simulation, the truck alone is short, but the truck plus mutual-aid inventory covers the calculated requirement.',
        consequence: 'The truck already has enough simulated reagent, so additional inventory is not required by the activity model.' },
      { key: 'withdraw', label: 'Escalate the simulated response',
        good: 'In this simulation, even the combined inventory is below the calculated requirement, so escalation is the supported activity choice.',
        consequence: 'The simulated available inventory is sufficient, so escalation is not the evidence-supported activity choice.' }
    ] }
];
