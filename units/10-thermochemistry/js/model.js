// model.js — Unit 10 domain data (Thermochemistry, TEKS C.13).
//
// The units_new build: units/10-thermochemistry rendered in the mission-cockpit shell.
// This unit is one of the two implementations the Scenario-layer retrofit was modelled
// on, so its pools, its bands and its scenario fiction all arrived working. This file is
// a verbatim copy of the worksheet build's model.js apart from this header: it imports
// nothing, so there is no path to re-point, and the port changes no scenario id, no goal,
// no consequence string and no band. The 21 scenario ids below are the key set that
// js/art.js draws one 400x150 banner for, one to one, no spares and no gaps.
//
// Pure data plus the standards map. Every quantity that gets calculated lives in
// shared/js/chem.js (SPECIFIC_HEAT, heatTransfer, finalTemperature, classifyThermal,
// hessCombine, enthalpyFromFormation); this file only holds the pools the stages
// draw from and the scenario fiction that turns each number into a consequence.
//
// World: "Heat Line". You are the thermal medic on a mountain rescue team. A climber
// is going hypothermic on a ledge at 3,100 m. You carry chemical packs, a stove, a
// pot, and a shelter, and every call you make is a heat calculation.

// Standards map: each C.13 sub-letter drives one stage. Hess's law and enthalpy from
// formation are NOT named in C.13, so both ride the Honors track. Stable ids key the
// mastery meters in the right rail.
export const SE = [
  { id: 'a',  code: 'C.13(A)', mode: 'laws',        honors: false,
    text: 'Explain everyday examples that illustrate the four laws of thermodynamics.' },
  { id: 'b',  code: 'C.13(B)', mode: 'calorimeter', honors: false,
    text: 'Investigate the process of heat transfer using calorimetry.' },
  { id: 'c',  code: 'C.13(C)', mode: 'pack',        honors: false,
    text: 'Classify processes as exothermic or endothermic and represent energy changes that occur in chemical reactions using thermochemical equations or graphical analysis.' },
  { id: 'd',  code: 'C.13(D)', mode: 'warm',        honors: false,
    text: 'Perform calculations involving heat, mass, temperature change, and specific heat.' },
  { id: 'h1', code: 'Honors',  mode: 'calorimeter', honors: true,
    text: "Honors: combine measured steps with Hess's law to get the enthalpy of a route nobody can measure directly." },
  { id: 'h2', code: 'Honors',  mode: 'calorimeter', honors: true,
    text: 'Honors: calculate a reaction enthalpy from standard heats of formation.' }
];

// The four laws, in the order a student meets them. `label` is the button text and
// has to be readable on its own, because picking the law IS the answer.
export const LAWS = [
  { key: 'zeroth', tag: 'Zeroth law',
    label: 'If two systems are each in thermal equilibrium with the same third system, they are in thermal equilibrium with each other.' },
  { key: 'first',  tag: 'First law',
    label: 'Energy is conserved. It changes form or moves somewhere else, but none of it is created or destroyed.' },
  { key: 'second', tag: 'Second law',
    label: 'Spontaneous heat transfer is from higher temperature to lower temperature; the total entropy of an isolated system does not decrease.' },
  { key: 'third',  tag: 'Third law',
    label: 'As temperature approaches 0 K, a perfect crystal approaches minimum entropy; 0 K cannot be reached by a finite sequence of cooling steps.' }
];

// Materials the medic can actually pick from on the mountain. Keys match the
// SPECIFIC_HEAT table in chem.js so the <select> reads its c straight from the engine.
export const FIELD_MATERIALS = ['water', 'ice', 'ethanol', 'aluminum', 'copper', 'iron', 'granite', 'sand', 'glass'];

// Chemical packs the team carries. Every enthalpy is the real published value for the
// process as written: the dissolution enthalpies are per mole of salt, and the iron
// warmer is per 2 mol of Fe2O3 formed (2 x -824.2 kJ/mol of formation).
// `ea` is the schematic height of the energy barrier drawn on the diagram, not a
// measured activation energy; the diagram caption says so.
export const PACKS = [
  { key: 'cacl2', name: 'calcium chloride hot pack',
    ce: 'CaCl2(s) -> Ca^2+(aq) + 2Cl^-(aq)', dH: -82.8, ea: 30, per: 'per mole of CaCl2',
    feel: 'its dissolution is exothermic, so the solution warms' },
  { key: 'mgso4', name: 'magnesium sulfate hot pack',
    ce: 'MgSO4(s) -> Mg^2+(aq) + SO4^2-(aq)', dH: -91.2, ea: 34, per: 'per mole of MgSO4',
    feel: 'its dissolution is exothermic, so the solution warms' },
  { key: 'ironair', name: 'air-activated iron warmer',
    ce: '4Fe(s) + 3O2(g) -> 2Fe2O3(s)', dH: -1648.4, ea: 90, per: 'per 2 moles of Fe2O3 formed',
    feel: 'iron oxidation releases heat while oxygen diffuses through the pack' },
  { key: 'nh4no3', name: 'ammonium nitrate cold pack',
    ce: 'NH4NO3(s) -> NH4^+(aq) + NO3^-(aq)', dH: 25.7, ea: 28, per: 'per mole of NH4NO3',
    feel: 'its dissolution is endothermic, so the solution cools' },
  { key: 'nh4cl', name: 'ammonium chloride cold pack',
    ce: 'NH4Cl(s) -> NH4^+(aq) + Cl^-(aq)', dH: 14.8, ea: 20, per: 'per mole of NH4Cl',
    feel: 'its dissolution is endothermic, so the solution cools' },
  { key: 'kno3', name: 'potassium nitrate cold pack',
    ce: 'KNO3(s) -> K^+(aq) + NO3^-(aq)', dH: 34.9, ea: 36, per: 'per mole of KNO3',
    feel: 'its dissolution is endothermic, so the solution cools' }
];

// Honors: routes for the stove that nobody can put in a calorimeter directly, so the
// enthalpy has to be assembled from steps that CAN be burned cleanly. Every dH is a
// real standard value in kJ, and every target is the exact sum of the listed steps.
export const HESS_ROUTES = [
  { id: 'coke-gas',
    story: "Use Hess's law to determine ΔH for forming carbon monoxide from graphite and oxygen. Combine the two given combustion equations so all intermediate species cancel.",
    target: { ce: 'C(s) + 1/2 O2(g) -> CO(g)', dH: -110.5 },
    steps: [
      { ce: 'C(s) + O2(g) -> CO2(g)', dH: -393.5, flip: false, scale: 1 },
      { ce: 'CO(g) + 1/2 O2(g) -> CO2(g)', dH: -283.0, flip: true, scale: 1 }
    ] },
  { id: 'acetylene',
    story: "Use Hess's law to determine ΔH for forming acetylene from its elements. The target is obtained by combining the listed combustion equations.",
    target: { ce: '2C(s) + H2(g) -> C2H2(g)', dH: 226.8 },
    steps: [
      { ce: 'C(s) + O2(g) -> CO2(g)', dH: -393.5, flip: false, scale: 2 },
      { ce: 'H2(g) + 1/2 O2(g) -> H2O(l)', dH: -285.8, flip: false, scale: 1 },
      { ce: 'C2H2(g) + 5/2 O2(g) -> 2CO2(g) + H2O(l)', dH: -1299.6, flip: true, scale: 1 }
    ] },
  { id: 'nox',
    story: "Use Hess's law to determine ΔH for forming nitrogen dioxide from nitrogen and oxygen. Add the two reaction steps and verify that NO cancels.",
    target: { ce: 'N2(g) + 2O2(g) -> 2NO2(g)', dH: 66.4 },
    steps: [
      { ce: 'N2(g) + O2(g) -> 2NO(g)', dH: 180.6, flip: false, scale: 1 },
      { ce: '2NO(g) + O2(g) -> 2NO2(g)', dH: -114.2, flip: false, scale: 1 }
    ] }
];

// Honors: standard enthalpies of formation, kJ/mol at 298 K. Elements in their
// standard state are exactly zero by definition. Values are the published standards,
// not invented, so the computed dHrxn matches a data table a student can check.
export const FORMATION_CASES = [
  { id: 'propane',
    story: 'Use standard enthalpies of formation to calculate the reaction enthalpy for propane combustion.',
    ce: 'C3H8(g) + 5O2(g) -> 3CO2(g) + 4H2O(l)',
    reactants: [{ label: 'C3H8(g)', dHf: -103.8, coefficient: 1 }, { label: 'O2(g)', dHf: 0, coefficient: 5 }],
    products: [{ label: 'CO2(g)', dHf: -393.5, coefficient: 3 }, { label: 'H2O(l)', dHf: -285.8, coefficient: 4 }] },
  { id: 'methane',
    story: 'Use standard enthalpies of formation to calculate the reaction enthalpy for methane combustion.',
    ce: 'CH4(g) + 2O2(g) -> CO2(g) + 2H2O(l)',
    reactants: [{ label: 'CH4(g)', dHf: -74.6, coefficient: 1 }, { label: 'O2(g)', dHf: 0, coefficient: 2 }],
    products: [{ label: 'CO2(g)', dHf: -393.5, coefficient: 1 }, { label: 'H2O(l)', dHf: -285.8, coefficient: 2 }] },
  { id: 'ethanol',
    story: 'Use standard enthalpies of formation to calculate the reaction enthalpy for ethanol combustion.',
    ce: 'C2H5OH(l) + 3O2(g) -> 2CO2(g) + 3H2O(l)',
    reactants: [{ label: 'C2H5OH(l)', dHf: -277.6, coefficient: 1 }, { label: 'O2(g)', dHf: 0, coefficient: 3 }],
    products: [{ label: 'CO2(g)', dHf: -393.5, coefficient: 2 }, { label: 'H2O(l)', dHf: -285.8, coefficient: 3 }] },
  { id: 'thermite',
    story: 'Use the formation data to calculate ΔH for the thermite reaction. Treat this as a thermochemical data exercise, not a procedure for carrying out the reaction.',
    ce: '2Al(s) + Fe2O3(s) -> Al2O3(s) + 2Fe(s)',
    reactants: [{ label: 'Al(s)', dHf: 0, coefficient: 2 }, { label: 'Fe2O3(s)', dHf: -824.2, coefficient: 1 }],
    products: [{ label: 'Al2O3(s)', dHf: -1675.7, coefficient: 1 }, { label: 'Fe(s)', dHf: 0, coefficient: 2 }] },
  { id: 'lime',
    story: 'Use standard enthalpies of formation to calculate ΔH for the thermal decomposition of calcium carbonate.',
    ce: 'CaCO3(s) -> CaO(s) + CO2(g)',
    reactants: [{ label: 'CaCO3(s)', dHf: -1207.6, coefficient: 1 }],
    products: [{ label: 'CaO(s)', dHf: -634.9, coefficient: 1 }, { label: 'CO2(g)', dHf: -393.5, coefficient: 1 }] }
];

// Dose tolerance. The measurement stages genuinely vary, so both keep the four-band
// grading: relative for the q calculation, absolute degrees for the equilibrium
// prediction (a degree is a degree, whatever the pot holds).
const Q_BANDS = { mode: 'relative', ideal: 0.01, acceptable: 0.03 };
const T_BANDS = { mode: 'absolute', ideal: 0.4, acceptable: 1.2 };

// SCENARIOS — the game layer for Heat Line. One coherent world: a climber going
// hypothermic on a ledge, a team with packs, a stove, a pot, and a shelter.
//   laws (C.13A):        decision. Read the situation, name the law, and read the
//                        direction of heat flow. Every option carries its real
//                        consequence on the mountain.
//   pack (C.13C):        decision. Pick the pack the injury needs and classify it
//                        exothermic or endothermic; the energy diagram then draws it.
//   warm (C.13D):        dose. q = mc(dT). Pick the specific heat, work out the
//                        temperature change, commit the heat in kilojoules.
//   calorimeter (C.13B): dose. Balance heat lost against heat gained and predict the
//                        equilibrium temperature.
//   h1/h2 (Honors):      Hess's law routes and enthalpy from formation data.
//   cap:                 the whole rescue, then the evacuation call.
export const SCENARIOS = [
  { id: 'a-two-packs', stage: 'laws', skill: 'a', type: 'decision', system: 'Thermal equilibrium', icon: '\u{1F9E4}',
    goal: 'Two used heat packs have both reached 31.0 °C. They are placed in contact. Which thermodynamic law best explains what happens?',
    why: 'Equal temperature is evidence of thermal equilibrium, so there is no net heat transfer between the packs.', lawKey: 'zeroth',
    flow: { prompt: 'What is the net direction of heat transfer between the packs?', options: [
      { key: 'a2b', label: 'From the first pack to the second' }, { key: 'b2a', label: 'From the second pack to the first' }, { key: 'none', label: 'No net transfer' }], correct: 'none' },
    consequences: { zeroth: 'Correct. Equal-temperature systems are in thermal equilibrium, so there is no net heat transfer.', first: 'The first law concerns energy conservation, but the key evidence here is equal temperature and thermal equilibrium.', second: 'The second law gives the spontaneous direction when temperatures differ; here the temperatures are equal.', third: 'The third law concerns behavior near absolute zero, not two objects at the same ordinary temperature.' } },

  { id: 'a-thermometer', stage: 'laws', skill: 'a', type: 'decision', system: 'Thermometer reading', icon: '\u{1F321}\u{FE0F}',
    goal: 'A thermometer is held in thermal contact with a sample. Its reading changes, then becomes steady at 33.4 °C. Which law explains why the final reading can represent the sample temperature?',
    why: 'A stable reading is interpreted after the thermometer and sample reach thermal equilibrium.', lawKey: 'zeroth',
    flow: { prompt: 'Why does the reading become steady?', options: [
      { key: 'equal', label: 'The thermometer and sample reach the same temperature, so net heat transfer stops' },
      { key: 'full', label: 'The thermometer runs out of room on its scale' },
      { key: 'cold', label: 'The thermometer continues removing heat indefinitely' }], correct: 'equal' },
    consequences: { zeroth: 'Correct. Thermal equilibrium is what makes a thermometer useful for comparing temperature.', first: 'Energy conservation is true, but it does not by itself explain why the thermometer and sample end at the same temperature.', second: 'Spontaneous heat transfer helps them approach equilibrium, but the zeroth law establishes the temperature relationship used by thermometry.', third: 'Absolute-zero behavior is not relevant to this measurement.' } },

  { id: 'a-stove-books', stage: 'laws', skill: 'a', type: 'decision', system: 'Energy accounting', icon: '\u{1F525}',
    goal: 'A stove releases chemical energy. The water warms, but the pot, windscreen, and surrounding air also warm. Which law explains why the energy measured in the water is less than the total energy released?',
    why: 'Energy transferred away from the water is not destroyed; it appears in other parts of the surroundings.', lawKey: 'first',
    flow: { prompt: 'Where is the rest of the transferred energy?', options: [
      { key: 'gone', label: 'It was destroyed by the flame' },
      { key: 'spread', label: 'It was transferred to the pot, windscreen, and surrounding air' },
      { key: 'stored', label: 'It remains entirely in the burned fuel' }], correct: 'spread' },
    consequences: { first: 'Correct. The first law is energy conservation: energy may change form or location, but the total is conserved.', zeroth: 'Thermal equilibrium does not account for the full energy balance.', second: 'The second law helps predict direction and entropy change, but the missing-energy question is an energy-conservation question.', third: 'The third law is not relevant to ordinary stove temperatures.' } },

  { id: 'a-shivering', stage: 'laws', skill: 'a', type: 'decision', system: 'Energy conversion', icon: '\u{1F976}',
    goal: 'Muscle metabolism converts chemical energy from nutrients into mechanical work and thermal energy. Which law connects these energy forms?',
    why: 'The first law tracks energy as it is transferred or converted rather than treating heat as newly created energy.', lawKey: 'first',
    flow: { prompt: 'What happens to the chemical energy?', options: [
      { key: 'heat', label: 'It is converted into work and thermal energy while total energy is conserved' },
      { key: 'gone', label: 'It disappears when the nutrient is used' },
      { key: 'cold', label: 'It changes into cold' }], correct: 'heat' },
    consequences: { first: 'Correct. Chemical energy can become work and thermal energy while total energy is conserved.', zeroth: 'The zeroth law addresses thermal equilibrium, not conversion among energy forms.', second: 'Entropy is relevant to real processes, but conservation of energy is the direct principle tested here.', third: 'The third law concerns the limit near 0 K.' } },

  { id: 'a-snow-windscreen', stage: 'laws', skill: 'a', type: 'decision', system: 'Heat-transfer direction', icon: '\u{2744}\u{FE0F}',
    goal: 'A hot stove windscreen is in contact with colder snow. Which law predicts the spontaneous direction of heat transfer?',
    why: 'For two objects at different temperatures, spontaneous net heat transfer is from the warmer object toward the cooler one.', lawKey: 'second',
    flow: { prompt: 'Which way does heat transfer spontaneously?', options: [
      { key: 's2snow', label: 'From the stove toward the snow' }, { key: 'snow2s', label: 'From the snow toward the stove as “cold”' }, { key: 'none', label: 'No transfer occurs' }], correct: 's2snow' },
    consequences: { second: 'Correct. Heat transfers spontaneously from the hotter stove toward the colder snow.', zeroth: 'The objects are not at the same temperature, so thermal equilibrium has not been reached.', first: 'Energy is conserved, but the second law gives the spontaneous direction of transfer.', third: 'Absolute zero is not relevant to this temperature difference.' } },

  { id: 'a-spent-pack', stage: 'laws', skill: 'a', type: 'decision', system: 'Cold pack contact', icon: '\u{1F9CA}',
    goal: 'A used pack is at 6 °C and the surface it touches is at 33 °C. Which law predicts the direction of spontaneous heat transfer?',
    why: 'The temperature difference determines the spontaneous direction of net heat transfer.', lawKey: 'second',
    flow: { prompt: 'Which way will heat transfer?', options: [
      { key: 'chest2pack', label: 'From the 33 °C surface into the 6 °C pack' }, { key: 'pack2chest', label: 'From the 6 °C pack into the 33 °C surface' }, { key: 'none', label: 'No transfer because the pack is used' }], correct: 'chest2pack' },
    consequences: { second: 'Correct. Net heat transfer is from the warmer surface to the colder pack.', zeroth: 'The objects are at different temperatures, so they are not in thermal equilibrium.', first: 'Energy conservation does not specify which direction is spontaneous.', third: 'The third law does not determine ordinary hot-to-cold heat transfer.' } },

  { id: 'a-battery-cold', stage: 'laws', skill: 'a', type: 'decision', system: 'Absolute-zero limit', icon: '\u{1F50B}',
    goal: 'A student asks whether ordinary outdoor cooling could continue until a battery reaches absolute zero. Which law addresses this limit?',
    why: 'Absolute zero is 0 K, and the third law describes the limiting behavior as temperature approaches 0 K.', lawKey: 'third',
    flow: { prompt: 'What does the third law imply about 0 K?', options: [
      { key: 'unreachable', label: '0 K cannot be reached by a finite sequence of cooling steps' }, { key: 'reached', label: '0 K is reached on sufficiently cold nights' }, { key: 'below', label: 'Ordinary matter cools below 0 K when wind chill is large enough' }], correct: 'unreachable' },
    consequences: { third: 'Correct. Absolute zero is a limiting temperature and cannot be reached by a finite sequence of cooling steps.', zeroth: 'The zeroth law defines thermal-equilibrium relationships, not the absolute-zero limit.', first: 'Energy conservation does not establish the unattainability of 0 K.', second: 'The second law is not the specific law being tested by the absolute-zero limit.' } },

  { id: 'a-cryo-stage', stage: 'laws', skill: 'a', type: 'decision', system: 'Cryogenic limit', icon: '\u{1F9EA}',
    goal: 'A laboratory cryostat reaches 0.5 K. Further cooling becomes increasingly difficult as the temperature approaches 0 K. Which law is illustrated?',
    why: 'The third law describes the approach to a minimum-entropy state and the unattainability of absolute zero by finite cooling steps.', lawKey: 'third',
    flow: { prompt: 'Which statement best matches the third law?', options: [
      { key: 'harder', label: 'As 0 K is approached, reaching 0 K by a finite cooling sequence is impossible' },
      { key: 'broken', label: 'Any slowdown proves the cooler is broken' },
      { key: 'leak', label: 'Perfect insulation would make 0 K reachable in a finite number of steps' }], correct: 'harder' },
    consequences: { third: 'Correct. The third law makes 0 K an unattainable limit for a finite cooling sequence.', zeroth: 'Waiting for equilibrium does not remove the absolute-zero limit.', first: 'Adding energy input to a refrigerator does not make 0 K attainable in a finite sequence.', second: 'Entropy is involved in thermodynamics, but this explicit 0 K limit is the third-law example.' } },

  { id: 'c-hypothermia', stage: 'pack', skill: 'c', type: 'decision', system: 'Warming pack', icon: '\u{1F525}',
    goal: 'This scenario requires a warming pack. Choose the pack whose process releases heat to its surroundings, then classify that process.',
    why: 'An exothermic process has ΔH < 0 for the reacting system and transfers heat to the surroundings.', constraints: { packs: ['cacl2', 'nh4no3'], need: 'hot' },
    consequences: { cacl2: 'Calcium chloride dissolution is exothermic in this activity, so the pack warms its surroundings.', nh4no3: 'Ammonium nitrate dissolution is endothermic, so it absorbs heat from its surroundings and cools them.' } },

  { id: 'c-ankle', stage: 'pack', skill: 'c', type: 'decision', system: 'Cooling pack', icon: '\u{1F9B6}',
    goal: 'This scenario requires a cooling pack. Choose the pack whose process absorbs heat from its surroundings, then classify that process.',
    why: 'An endothermic process has ΔH > 0 for the reacting system and absorbs heat from the surroundings.', constraints: { packs: ['nh4cl', 'mgso4'], need: 'cold' },
    consequences: { nh4cl: 'Ammonium chloride dissolution is endothermic in this activity, so the pack cools its surroundings.', mgso4: 'Magnesium sulfate dissolution is exothermic in this activity, so the pack warms its surroundings.' } },

  { id: 'c-heat-exhaust', stage: 'pack', skill: 'c', type: 'decision', system: 'Cooling scenario', icon: '\u{2600}\u{FE0F}',
    goal: 'The scenario calls for cooling. Choose the pack whose process absorbs heat from its surroundings, then classify the process.',
    why: 'Use the sign of ΔH and the direction of heat transfer, not the product name, to choose the pack.', constraints: { packs: ['kno3', 'ironair'], need: 'cold' },
    consequences: { kno3: 'Potassium nitrate dissolution is endothermic, so it absorbs heat from its surroundings.', ironair: 'Iron oxidation is exothermic, so this warmer releases heat to its surroundings instead of cooling them.' } },

  { id: 'c-fluid-bag', stage: 'pack', skill: 'c', type: 'decision', system: 'Warming a fluid bag', icon: '\u{1F4A7}',
    goal: 'A water-based training fluid is colder than the target temperature. Choose the pack that can transfer heat to the bag, then classify the pack process.',
    why: 'For this chemistry model, the relevant evidence is whether the pack process releases or absorbs heat.', constraints: { packs: ['ironair', 'nh4no3'], need: 'hot' },
    consequences: { ironair: 'Iron oxidation is exothermic, so the warmer releases heat that can be transferred to the fluid bag.', nh4no3: 'Ammonium nitrate dissolution is endothermic, so it would absorb heat rather than provide it.' } },

  { id: 'd-bottle', stage: 'warm', skill: 'd', type: 'dose', system: 'Water bottle', icon: '\u{1F6B0}',
    goal: 'Heat the stated mass of water from the starting temperature to the target temperature. Calculate the required heat with q = mcΔT.',
    why: 'The mass, specific heat capacity, and temperature change determine q for this model.', constraints: { material: 'water', massMin: 900, massMax: 1400, startMin: 4, startMax: 12, targetMin: 40, targetMax: 45 },
    bands: Q_BANDS, actionLabel: 'Check calculation', safeState: 'WITHIN TOLERANCE', lowState: 'BELOW TARGET', highState: 'ABOVE TARGET',
    safe: 'Your value is within the activity tolerance for the calculated heat.', low: 'Your value is lower than the activity target. Recheck c, ΔT, and the J-to-kJ conversion.', high: 'Your value is higher than the activity target. Recheck c, ΔT, and the J-to-kJ conversion.', fail: 'No finite numerical heat value was entered.' },

  { id: 'd-saline', stage: 'warm', skill: 'd', type: 'dose', system: 'Water-based fluid', icon: '\u{1F489}',
    goal: 'Treat the training fluid as water. Calculate the heat required to raise the stated mass from its starting temperature to the target temperature.',
    why: 'This is a q = mcΔT calculation using the specific heat capacity of water; it is not a medical-fluid protocol.', constraints: { material: 'water', massMin: 400, massMax: 700, startMin: 2, startMax: 8, targetMin: 37, targetMax: 40 },
    bands: Q_BANDS, actionLabel: 'Check calculation', safeState: 'WITHIN TOLERANCE', lowState: 'BELOW TARGET', highState: 'ABOVE TARGET',
    safe: 'Your value is within the activity tolerance for the calculated heat.', low: 'Your value is below the calculated target.', high: 'Your value is above the calculated target.', fail: 'No finite numerical heat value was entered.' },

  { id: 'd-stone', stage: 'warm', skill: 'd', type: 'dose', system: 'Granite slab', icon: '\u{1FAA8}',
    goal: 'Calculate the heat required to raise a granite slab from its starting temperature to the target temperature.',
    why: 'A material with a lower specific heat capacity requires less energy per gram for the same temperature change than water does.', constraints: { material: 'granite', massMin: 1500, massMax: 2500, startMin: -2, startMax: 4, targetMin: 55, targetMax: 68 },
    bands: Q_BANDS, actionLabel: 'Check calculation', safeState: 'WITHIN TOLERANCE', lowState: 'BELOW TARGET', highState: 'ABOVE TARGET',
    safe: 'Your value is within the activity tolerance for the calculated heat.', low: 'Your value is below the calculated target.', high: 'Your value is above the calculated target.', fail: 'No finite numerical heat value was entered.' },

  { id: 'b-stone-pot', stage: 'calorimeter', skill: 'b', type: 'dose', system: 'Stone and water', icon: '\u{1F958}',
    goal: 'In the activity model, a hot granite sample is placed in cooler water in a perfectly insulated container. Ignore the container heat capacity and predict the equilibrium temperature.',
    why: 'For this idealized two-body model with no phase change, the magnitude of heat lost by granite equals the magnitude of heat gained by water.', constraints: { hotMaterial: 'granite', hotMin: 600, hotMax: 900, hotTMin: 150, hotTMax: 220, coldMaterial: 'water', coldMin: 1200, coldMax: 1800, coldTMin: 2, coldTMax: 6 },
    bands: T_BANDS, actionLabel: 'Check prediction', safeState: 'WITHIN TOLERANCE', lowState: 'PREDICTION LOW', highState: 'PREDICTION HIGH',
    safe: 'Your predicted equilibrium temperature is within the activity tolerance.', low: 'Your prediction is below the model result.', high: 'Your prediction is above the model result.', fail: 'No finite numerical temperature was entered.' },

  { id: 'b-hot-water', stage: 'calorimeter', skill: 'b', type: 'dose', system: 'Mixing water', icon: '\u{1F375}',
    goal: 'Mix the stated masses of hot and cold water in the idealized insulated-container model and predict the equilibrium temperature.',
    why: 'Because both portions are water, their mass and starting temperature determine the equilibrium temperature in this simplified model.', constraints: { hotMaterial: 'water', hotMin: 500, hotMax: 800, hotTMin: 86, hotTMax: 96, coldMaterial: 'water', coldMin: 1000, coldMax: 1600, coldTMin: 1, coldTMax: 5 },
    bands: T_BANDS, actionLabel: 'Check prediction', safeState: 'WITHIN TOLERANCE', lowState: 'PREDICTION LOW', highState: 'PREDICTION HIGH',
    safe: 'Your predicted equilibrium temperature is within the activity tolerance.', low: 'Your prediction is below the model result.', high: 'Your prediction is above the model result.', fail: 'No finite numerical temperature was entered.' },

  { id: 'b-skillet', stage: 'calorimeter', skill: 'b', type: 'dose', system: 'Iron and water', icon: '\u{1F373}',
    goal: 'A very hot iron plate is placed in cooler water in the idealized insulated-container model. Predict the equilibrium temperature.',
    why: 'Temperature alone does not determine transferred heat; mass and specific heat capacity also matter.', constraints: { hotMaterial: 'iron', hotMin: 400, hotMax: 700, hotTMin: 200, hotTMax: 280, coldMaterial: 'water', coldMin: 900, coldMax: 1400, coldTMin: 3, coldTMax: 8 },
    bands: T_BANDS, actionLabel: 'Check prediction', safeState: 'WITHIN TOLERANCE', lowState: 'PREDICTION LOW', highState: 'PREDICTION HIGH',
    safe: 'Your predicted equilibrium temperature is within the activity tolerance.', low: 'Your prediction is below the model result.', high: 'Your prediction is above the model result.', fail: 'No finite numerical temperature was entered.' },

  { id: 'h1-route', stage: 'calorimeter', skill: 'h1', type: 'identity', system: "Hess's law", icon: '\u{2699}\u{FE0F}',
    goal: 'Reverse and scale the given thermochemical equations until they sum to the target reaction, then add their ΔH values.',
    why: 'Enthalpy is a state function, so the total ΔH depends only on initial and final states, not on the chosen path.', success: 'The equations and enthalpy sum match the target reaction.', fail: 'The equations or enthalpy sum do not yet match the target reaction.' },

  { id: 'h2-formation', stage: 'calorimeter', skill: 'h2', type: 'identity', system: 'Formation enthalpy', icon: '\u{1F4D8}',
    goal: 'Use the standard enthalpies of formation to calculate ΔH°rxn, then classify the reaction as exothermic or endothermic.',
    why: 'Use ΔH°rxn = ΣnΔH°f(products) − ΣnΔH°f(reactants), including each stoichiometric coefficient.', success: 'The calculated enthalpy and classification match the formation data.', fail: 'Recheck coefficients, signs, and products-minus-reactants.' },

  { id: 'cap-evac', stage: 'capstone', skill: 'cap', type: 'decision', system: 'Evidence check', icon: '\u{1F681}',
    goal: 'Use the displayed cloud base and core temperature to choose the option supported by the two activity criteria.',
    why: 'This is a synthesis exercise. The 33.0 °C movement cutoff and cloud-base rule are simulation criteria, not real-world medical or aviation guidance.',
    options: [
      { key: 'heli', label: 'Select helicopter under the activity criteria', good: 'Both displayed criteria support the helicopter option in this simulation.', consequence: 'The cloud-base criterion does not support the helicopter option in this simulation.' },
      { key: 'carry', label: 'Select ground movement under the activity criteria', good: 'The aircraft criterion is not met, while the simulation movement criterion is met.', consequence: 'The displayed activity criteria do not support ground movement in this case.' },
      { key: 'hold', label: 'Select shelter/hold under the activity criteria', good: 'Neither the aircraft criterion nor the simulation movement criterion is met, so this option matches the activity rules.', consequence: 'At least one displayed criterion supports another option, so holding does not match the activity rules.' }
    ] }
];
