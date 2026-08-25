// model.js — Unit 1 domain data (Practices, Measurement & Matter, SEP C.1-C.4).
// Pure data. Measurement math lives in shared/js/chem.js; this file holds the pools,
// standards map, and scenario layer used by the Unit 1 simulation.

// ---- C.1: SI reference shown beside the graduated cylinder ----
export const SI_UNITS = [
  { quantity: 'Length',      unit: 'meter',    sym: 'm' },
  { quantity: 'Mass',        unit: 'kilogram', sym: 'kg' },
  { quantity: 'Time',        unit: 'second',   sym: 's' },
  { quantity: 'Temperature', unit: 'kelvin',   sym: 'K' },
  { quantity: 'Amount',      unit: 'mole',     sym: 'mol' }
];

export const PREFIXES = [
  { name: 'kilo',  sym: 'k', factor: '10³' },
  { name: 'deci',  sym: 'd', factor: '10⁻¹' },
  { name: 'centi', sym: 'c', factor: '10⁻²' },
  { name: 'milli', sym: 'm', factor: '10⁻³' },
  { name: 'micro', sym: 'μ', factor: '10⁻⁶' }
];

// ---- C.2: number pools for the significant-figure drills ----
// Whole-number trailing zeros are intentionally avoided unless scientific notation
// makes the intended significant figures explicit.
export const SF_COUNT = ['0.00450', '1.200e3', '100.0', '3.080', '4.50e4', '0.067', '12.000', '5.0', '908', '0.0010', '2.50', '6.080e4'];
export const SF_ROUND = [123.456, 0.0023456, 45678, 9.8765, 0.10472, 2345.6, 0.085019, 7654.3];
export const SF_CALC = [
  ['2.5', '3.42'], ['12.0', '4.8'], ['3.14', '2.0'], ['0.50', '6.755'],
  ['25.0', '1.2'], ['8.4', '0.025'], ['100.', '3.1'], ['6.022', '2.0']
];

// ---- C.3: substances for density-by-displacement identification (g/mL) ----
// `toxic` is an activity-specific compatibility flag used by the simulation decision.
// It is not intended as a universal toxicology classification. Real aquatic-metal effects
// depend on metal form, concentration, species, pH, hardness, and other water chemistry.
export const SUBSTANCES = [
  { name: 'Aluminum', density: 2.70,  toxic: false, leach: 0.000 },
  { name: 'Titanium', density: 4.51,  toxic: false, leach: 0.000 },
  { name: 'Zinc',     density: 7.14,  toxic: true,  leach: 0.030 },
  { name: 'Iron',     density: 7.87,  toxic: false, leach: 0.000 },
  { name: 'Copper',   density: 8.96,  toxic: true,  leach: 0.045 },
  { name: 'Silver',   density: 10.49, toxic: false, leach: 0.000 },
  { name: 'Lead',     density: 11.34, toxic: true,  leach: 0.038 },
  { name: 'Gold',     density: 19.32, toxic: false, leach: 0.000 }
];

// ---- C.4: the four accuracy/precision combinations (static reference board) ----
// dots are normalized [-1,1] target coordinates; center is the accepted/reference value.
export const AP_BOARDS = [
  { key: 'both',     title: 'Accurate + precise', desc: 'Close to the reference value and tightly grouped.',
    dots: [[0.05, -0.08], [-0.06, 0.04], [0.02, 0.09], [-0.03, -0.05], [0.07, 0.02]] },
  { key: 'precise',  title: 'Precise, not accurate', desc: 'Tightly grouped but shifted from the reference value (systematic bias).',
    dots: [[0.55, 0.42], [0.62, 0.5], [0.5, 0.55], [0.58, 0.46], [0.64, 0.4]] },
  { key: 'accurate', title: 'Accurate, not precise', desc: 'Mean close to the reference value but widely scattered (random variation).',
    dots: [[0.5, -0.1], [-0.45, 0.2], [0.1, 0.55], [-0.2, -0.5], [0.15, -0.2]] },
  { key: 'neither',  title: 'Neither', desc: 'Shifted from the reference value and widely scattered.',
    dots: [[0.45, 0.5], [0.7, 0.2], [0.3, 0.75], [0.8, 0.55], [0.55, 0.3]] }
];

// Keep the compact C.1-C.4 display codes used by the original Unit 1 header/popover.
export const SE = [
  { id: 'a',  code: 'C.1', mode: 'measure',  honors: false, text: 'Plan and safely conduct investigations using appropriate tools, models, and SI units.' },
  { id: 'b',  code: 'C.2', mode: 'sigfig',   honors: false, text: 'Analyze and interpret data, including significant figures, precision, and error.' },
  { id: 'c',  code: 'C.3', mode: 'density',  honors: false, text: 'Develop and communicate evidence-based explanations and conclusions.' },
  { id: 'd',  code: 'C.4', mode: 'evaluate', honors: false, text: 'Evaluate the accuracy, precision, and reliability of scientific measurements.' },
  { id: 'h1', code: 'Honors', mode: 'density',  honors: true, text: 'Honors: estimate the maximum relative uncertainty in density and decide whether the measurement supports an identification.' },
  { id: 'h2', code: 'Honors', mode: 'evaluate', honors: true, text: 'Honors: calculate standard deviation and use it with a reference value to evaluate the test kit.' }
];

export const MEASURE_BANDS = { mode: 'absolute', ideal: 0.05, acceptable: 0.10 };
export const DENSITY_BANDS = { mode: 'relative', ideal: 0.01, acceptable: 0.02 };
export const HONORS_BANDS = { mode: 'relative', ideal: 0.02, acceptable: 0.05 };

export const TANK = {
  nominalGal: 20,
  realGal: 18.4,
  tapChlorine: 1.80,
  stressLine: 0.20,        // simulation stress threshold, not a universal aquarium limit
  metalLine: 0.010,        // simulation alert threshold, not a universal metal-toxicity limit
  fish: 6
};

export const SCENARIOS = [
  // ---------- C.1 read the tool ----------
  { id: 'a-dechlor', stage: 'measure', skill: 'a', type: 'dose',
    system: 'Dechlorinator measurement', icon: '\u{1F489}',
    goal: 'Read the bottom of the meniscus at eye level and record the dechlorinator volume to the nearest 0.1 mL.',
    why: 'Report only the precision supported by the graduated cylinder; an incorrect reading can change the amount used.',
    constraints: { unit: 'mL', tool: 'cylinder' }, bands: MEASURE_BANDS,
    actionLabel: 'Record the volume',
    effect: { good: { water: -3 }, low: { water: 0.55 }, high: { water: -3, shock: 28 }, fail: { water: 0.2 } },
    safeState: 'VOLUME RECORDED', lowState: 'READING TOO LOW', highState: 'READING TOO HIGH',
    safe: 'Your reading matches the graduated-cylinder level closely enough for this activity.',
    low: 'Recheck the bottom of the meniscus and the estimated digit.',
    high: 'Recheck the bottom of the meniscus and the estimated digit.',
    fail: 'No volume was recorded.' },

  { id: 'a-plantfood', stage: 'measure', skill: 'a', type: 'dose',
    system: 'Plant nutrient measurement', icon: '\u{1F331}',
    goal: 'Read the bottom of the meniscus and record the plant nutrient solution to the nearest 0.1 mL.',
    why: 'A graduated cylinder provides a more reliable volume than estimating with a bottle cap.',
    constraints: { unit: 'mL', tool: 'cylinder' }, bands: MEASURE_BANDS,
    actionLabel: 'Record the volume',
    effect: { good: { water: -0.15 }, low: { shock: 7 }, high: { shock: 24 }, fail: { shock: 4 } },
    safeState: 'VOLUME RECORDED', lowState: 'READING TOO LOW', highState: 'READING TOO HIGH',
    safe: 'The recorded amount matches the measured volume.',
    low: 'The recorded amount is lower than the measured volume in this simulation.',
    high: 'The recorded amount is higher than the measured volume in this simulation.',
    fail: 'No volume was recorded.' },

  { id: 'a-meds', stage: 'measure', skill: 'a', type: 'dose',
    system: 'Aquarium treatment measurement', icon: '\u{1F41F}',
    goal: 'Read the bottom of the meniscus and record the aquarium treatment solution to the nearest 0.1 mL.',
    why: 'Accurate measurement is important whenever a specified amount of solution is required.',
    constraints: { unit: 'mL', tool: 'cylinder' }, bands: MEASURE_BANDS,
    actionLabel: 'Record the volume',
    effect: { good: { shock: -18 }, low: { shock: 11 }, high: { shock: 30 }, fail: { shock: 6 } },
    safeState: 'VOLUME RECORDED', lowState: 'READING TOO LOW', highState: 'READING TOO HIGH',
    safe: 'The treatment amount is recorded correctly for this simulation.',
    low: 'The recorded amount is lower than the measured volume.',
    high: 'The recorded amount is higher than the measured volume.',
    fail: 'No volume was recorded.' },

  // ---------- C.2 significant figures ----------
  { id: 'b-log', stage: 'sigfig', skill: 'b', type: 'identity',
    system: 'Measurement record', icon: '\u{1F4D2}',
    goal: 'Record the value using the correct number of significant figures.',
    why: 'Significant figures communicate measurement precision; extra digits imply unsupported precision.',
    success: 'The value is reported with the appropriate number of significant figures.',
    fail: 'The reported value does not match the precision supported by the measurement.',
    effect: { good: { log: 22 }, bad: { log: -16 } } },

  { id: 'b-volume', stage: 'sigfig', skill: 'b', type: 'identity',
    system: 'Measured tank volume', icon: '\u{1F4CF}',
    goal: 'Report the measured tank volume using the appropriate significant figures.',
    why: 'A result should not imply greater precision than the measurements used to obtain it.',
    success: 'The measured volume is reported with appropriate significant figures.',
    fail: 'Recheck which measured value limits the precision of the result.',
    effect: { good: { log: 22 }, bad: { log: -18 } } },

  { id: 'b-pergallon', stage: 'sigfig', skill: 'b', type: 'identity',
    system: 'Amount per gallon × tank volume', icon: '\u{1F9EE}',
    goal: 'Multiply the amount per gallon by the tank volume and report the product with the correct significant figures.',
    why: 'For multiplication or division, match the fewest significant figures in the measured inputs.',
    success: 'The product is reported with the correct number of significant figures.',
    fail: 'The calculator may display extra digits. Round the result to the significant figures supported by the inputs.',
    effect: { good: { log: 22 }, bad: { log: -16 } } },

  // ---------- C.3 density by displacement ----------
  { id: 'c-ornament', stage: 'density', skill: 'c', type: 'decision',
    system: 'Unlabeled metal ornament', icon: '\u{1F3EF}',
    goal: 'Measure mass and displacement volume, calculate density, and identify the metal. Then use the activity reference to decide whether it should remain in the tank.',
    why: 'Density is a characteristic physical property that can support identification when compared with reference values.',
    consequences: {
      keep: 'Based on the activity reference, the identified metal is allowed to remain in the simulated tank.',
      pull: 'Based on the activity reference, the sample is removed from the simulated tank.'
    },
    effect: { good: { metals: -0.02 }, bad: { log: -10 } } },

  { id: 'c-pendant', stage: 'density', skill: 'c', type: 'decision',
    system: 'Pendant from the gravel', icon: '\u{1F48D}',
    goal: 'Measure the pendant’s mass and volume, calculate density, and compare with reference densities to identify the metal.',
    why: 'Appearance alone cannot identify a material; density provides quantitative evidence.',
    constraints: { substances: ['Silver', 'Zinc', 'Copper', 'Aluminum', 'Lead'] },
    consequences: {
      keep: 'Based on the activity reference, the identified metal is allowed to remain in the simulated tank.',
      pull: 'Based on the activity reference, the sample is removed from the simulated tank.'
    },
    effect: { good: { metals: -0.02 }, bad: { log: -10 } } },

  { id: 'c-anchor', stage: 'density', skill: 'c', type: 'decision',
    system: 'Unlabeled plant weight', icon: '\u{1FAA8}',
    goal: 'Measure the plant weight’s mass and volume, calculate density, and identify the metal from the reference data.',
    why: 'Base the identification on quantitative evidence rather than an assumption about the material.',
    constraints: { substances: ['Lead', 'Zinc', 'Iron'] },
    consequences: {
      keep: 'Based on the activity reference, the identified metal is allowed to remain in the simulated tank.',
      pull: 'Based on the activity reference, the sample is removed from the simulated tank.'
    },
    effect: { good: { metals: -0.02 }, bad: { log: -10 } } },

  // ---------- C.4 accuracy and precision ----------
  { id: 'd-dropkit', stage: 'evaluate', skill: 'd', type: 'decision',
    system: 'Liquid test kit', icon: '\u{1F9EA}',
    goal: 'Measure the same water sample five times with the liquid test kit. Compare the results with the reference value and classify the data as accurate, precise, both, or neither.',
    why: 'Accuracy compares results with a reference value; precision describes how closely repeated measurements agree.',
    consequences: {
      both: 'The measurements are close to the reference value and tightly grouped.',
      precise: 'The measurements are tightly grouped but shifted from the reference value, indicating a systematic bias in this dataset.',
      accurate: 'The mean is close to the reference value, but individual measurements are widely spread.',
      neither: 'The measurements are both widely spread and shifted from the reference value.'
    },
    effect: { good: { kit: 24 }, bad: { kit: -18 } } },

  { id: 'd-penmeter', stage: 'evaluate', skill: 'd', type: 'decision',
    system: 'Digital pen meter', icon: '\u{1F4DF}',
    goal: 'Compare five readings of the same sample with the reference value and classify their accuracy and precision.',
    why: 'Display resolution is not the same as precision; use repeated readings and the reference value to evaluate the meter.',
    constraints: { quantity: 'pH' },
    consequences: {
      both: 'The readings are close to the reference value and repeat closely.',
      precise: 'The readings repeat closely but are shifted from the reference value.',
      accurate: 'The mean is close to the reference value, but the individual readings vary widely.',
      neither: 'The readings are widely spread and shifted from the reference value.'
    },
    effect: { good: { kit: 24 }, bad: { kit: -18 } } },

  { id: 'd-strips', stage: 'evaluate', skill: 'd', type: 'decision',
    system: 'Heat-exposed test strips', icon: '\u{1F321}\u{FE0F}',
    goal: 'Compare five readings from the heat-exposed test strips with the reference value and classify their accuracy and precision.',
    why: 'Storage conditions can affect reagents; repeated measurements and a reference value reveal scatter or systematic shift.',
    consequences: {
      both: 'The measurements are close to the reference value and tightly grouped.',
      precise: 'The measurements are tightly grouped but shifted from the reference value.',
      accurate: 'The mean is close to the reference value, but individual measurements are widely spread.',
      neither: 'The measurements are widely spread and shifted from the reference value.'
    },
    effect: { good: { kit: 24 }, bad: { kit: -18 } } },

  // ---------- Honors ----------
  { id: 'h1-sizecall', stage: 'density', skill: 'h1', type: 'decision',
    system: 'Is the uncertainty small enough?', icon: '\u{2696}\u{FE0F}',
    goal: 'Using the simplified method provided, calculate the maximum relative uncertainty in density. Compare that uncertainty with the difference between possible metal densities and decide whether the evidence is strong enough to identify the sample.',
    why: 'If the uncertainty is too large to distinguish between possible values, the measurement does not support a confident identification.',
    consequences: {
      call: 'The uncertainty is smaller than the gap to the nearest candidate, so the density supports an identification.',
      bigger: 'The uncertainty is too large to distinguish the candidates confidently; use a larger sample to reduce relative uncertainty.'
    },
    effect: { good: { log: 15 }, bad: { log: -10 } } },

  { id: 'h2-kitcall', stage: 'evaluate', skill: 'h2', type: 'decision',
    system: 'Evaluate the test kit', icon: '\u{1F4C9}',
    goal: 'Calculate the standard deviation of the five measurements. Use it together with the comparison to the reference value to evaluate the test kit.',
    why: 'Standard deviation measures the spread of repeated measurements and helps describe precision. Accuracy still requires comparison with a reference value.',
    consequences: {
      trust: 'The data are precise and accurate by this activity\'s criteria, so the kit can be used in the simulation.',
      replace: 'The measurements have too much scatter. Check the reagent and measurement technique before relying on the kit.',
      send: 'The measurements are tightly grouped but shifted from the reference value. Compare the kit with an independent reference before relying on it.'
    },
    effect: { good: { kit: 18 }, bad: { kit: -14 } } },

  // ---------- Capstone ----------
  { id: 'cap-waterchange', stage: 'capstone', skill: 'cap', type: 'decision',
    system: 'Water-change challenge', icon: '\u{1FAA3}',
    goal: 'Calculate the expected free-chlorine concentration after the water change, then use all available data to choose the next step.',
    why: 'This challenge combines the measurement and data-analysis skills from Unit 1.',
    options: [
      { key: 'tonight', label: 'Put the fish back in tonight' },
      { key: 'hold',    label: 'Hold them in the bucket another day' },
      { key: 'shop',    label: 'Take a sample to the shop first' }
    ],
    consequences: {
      tonight: 'The simulated water meets the activity criteria, so the fish can return to the tank.',
      hold: 'The simulated water does not yet meet the activity criteria; keep the fish in the aerated holding bucket and correct the water conditions.',
      shop: 'The test-kit reliability score is too low to support the decision; compare the sample with an independent reference first.'
    },
    effect: { good: { water: -3, metals: -0.05, shock: -40 }, bad: { shock: 45 }, badSafe: { shock: 5 } } }
];
