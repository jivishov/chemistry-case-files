// model.js: Unit 7 domain data (Gas Laws & Kinetic Molecular Theory, TEKS C.10).
// Pure data + view-side physics helpers. Core gas math lives in shared/js/chem.js.

// ---- C.10(A): the postulates of the kinetic molecular theory ----
export const KMT_POSTULATES = [
  { id: 1, short: 'Constant motion', text: 'In the ideal-gas model, particles move continuously in random, straight-line paths between collisions.' },
  { id: 2, short: 'Negligible particle volume', text: 'Ideal-gas particles are treated as extremely small compared with the space between them, so their own volume is negligible.' },
  { id: 3, short: 'Elastic collisions', text: 'Collisions between ideal-gas particles and with container walls are elastic, so total kinetic energy is conserved during the collisions.' },
  { id: 4, short: 'No intermolecular forces', text: 'The ideal-gas model assumes no attractive or repulsive forces between particles except during collisions.' },
  { id: 5, short: 'KE ∝ T', text: 'Average translational kinetic energy is proportional to absolute temperature in kelvins.' }
];

// Scenario -> which postulate explains it. Used by the C.10(A) check.
// Extended additively for the Scenario layer: `id` so a brief can pin a group of
// observations, `where` for the setting it turns up in, and `consequences` keyed by
// postulate id. The consequences live HERE rather than on the scenario because the
// answer varies inside a group, so the cost of a wrong mental model is a property of
// the observation being explained, not of the setting it happens in.
export const KMT_QUIZ = [
  { id: 'k-fill', answer: 1,
    scenario: 'A gas released into one part of a container eventually spreads throughout the available space.',
    where: 'diffusion of gas particles through a container',
    consequences: {
      1: 'Correct. Continuous random motion carries particles throughout the available space.',
      2: 'Negligible particle volume explains why gases are highly compressible, not why particles move through the container.',
      3: 'Elastic collisions conserve kinetic energy during collisions, but the observation is about continuous random motion.',
      4: 'The no-forces assumption helps describe ideal behavior, but it does not by itself create particle motion.',
      5: 'Temperature affects average kinetic energy and characteristic speeds, but particles move at every temperature in this model.'
    } },
  { id: 'k-mix', answer: 1,
    scenario: 'Two gases placed in the same container become distributed throughout the container over time.',
    where: 'diffusion and mixing of gases',
    consequences: {
      1: 'Correct. Random molecular motion causes gases to diffuse and become distributed throughout the available space.',
      2: 'Small particle size helps explain compressibility, not the motion that produces diffusion.',
      3: 'Elastic collisions conserve kinetic energy during collisions; random motion is the more direct explanation for diffusion.',
      4: 'Neglecting intermolecular forces is an ideal-gas assumption, but random motion is the key idea in this observation.',
      5: 'Higher temperature changes the speed distribution, but diffusion occurs because particles are already in continuous random motion.'
    } },
  { id: 'k-squeeze', answer: 2,
    scenario: 'A gas can be compressed to a much smaller volume because most of the sample volume is space between particles.',
    where: 'compression of a gas in a cylinder',
    consequences: {
      2: 'Correct. In the ideal-gas model, particle volume is negligible compared with the space between particles, so compression mainly reduces that spacing.',
      1: 'Constant motion explains how particles move through the container, not why the gas has so much compressible space.',
      3: 'Elastic collisions describe energy conservation during collisions, not the large spacing between particles.',
      4: 'The no-forces assumption is not the main reason a gas is highly compressible.',
      5: 'Temperature affects kinetic energy; it does not explain why most of a gas sample is empty space.'
    } },
  { id: 'k-chips', answer: 2,
    scenario: 'Air in a sealed syringe can be compressed much more than a comparable volume of liquid.',
    where: 'a syringe used to compare gas and liquid compressibility',
    consequences: {
      2: 'Correct. Gas particles are separated by large distances compared with their own size, leaving space that can be reduced by compression.',
      1: 'Particle motion occurs in both the original and compressed gas; it does not explain the large change in volume.',
      3: 'Elastic collisions do not create the empty space that makes a gas easy to compress.',
      4: 'Neglecting intermolecular forces is not the most direct explanation for the large compressibility difference.',
      5: 'The comparison is about spacing between particles, not a temperature change.'
    } },
  { id: 'k-settle', answer: 3,
    scenario: 'In the ideal-gas model, collisions do not gradually remove kinetic energy from the moving particles.',
    where: 'the idealized particle model',
    consequences: {
      3: 'Correct. An elastic collision conserves the total kinetic energy of the colliding particles.',
      1: 'Constant motion describes the motion, while elastic collisions explain why the model does not lose kinetic energy during collisions.',
      2: 'Particle size is unrelated to whether a collision conserves kinetic energy.',
      4: 'The no-forces assumption concerns interactions between collisions, not energy conservation in a collision.',
      5: 'Temperature sets the average translational kinetic energy at equilibrium; the question is specifically about collision behavior.'
    } },
  { id: 'k-condense', answer: 4,
    scenario: 'The ideal-gas model does not represent condensation caused by attractions between particles.',
    where: 'the limits of the ideal-gas model',
    consequences: {
      4: 'Correct. The ideal-gas model neglects intermolecular attractions, so condensation is outside the model.',
      1: 'Real gas particles remain in motion even when attractions become important; motion alone does not rule out condensation.',
      2: 'Negligible particle volume is a different ideal-gas assumption and does not remove attractive forces.',
      3: 'Elastic collisions concern kinetic-energy conservation during collisions, not intermolecular attraction.',
      5: 'Lower temperature can promote condensation in real gases, but the ideal-gas assumption at issue is the absence of intermolecular attractions.'
    } },
  { id: 'k-balloon', answer: 5,
    scenario: 'Heating a sample of the same gas increases its average translational kinetic energy.',
    where: 'temperature changes in a gas sample',
    consequences: {
      5: 'Correct. Average translational kinetic energy is proportional to absolute temperature, so characteristic molecular speeds also increase for the same gas.',
      1: 'The particles were already moving before heating; constant motion does not describe how average kinetic energy changes with temperature.',
      2: 'Heating does not make the individual gas particles larger.',
      3: 'Elastic collisions conserve kinetic energy during collisions; heating changes the energy of the sample through energy transfer.',
      4: 'The no-forces assumption is not the relationship between temperature and average translational kinetic energy.'
    } },
  { id: 'k-equalT', answer: 5,
    scenario: 'Two ideal gases at the same temperature have the same average translational kinetic energy per particle.',
    where: 'two different gases at the same temperature',
    consequences: {
      5: 'Correct. Average translational kinetic energy depends on absolute temperature, not molar mass. The lighter gas has greater characteristic molecular speeds at the same temperature.',
      1: 'Both gases are in continuous motion, but that does not explain why their average translational kinetic energies are equal.',
      2: 'Particle size is not what determines average translational kinetic energy in the ideal-gas model.',
      3: 'Elastic collisions conserve energy during collisions; equal temperature is what gives the gases equal average translational kinetic energy.',
      4: 'Intermolecular attractions are neglected in the ideal model, but the equality here follows from the temperature–kinetic-energy relationship.'
    } }
];

// ---- C.10(B): named gas-law relationships for the reference table ----
export const GAS_LAWS = [
  { name: "Boyle's law", rel: 'P \\propto 1/V', held: 'n, T constant', note: 'At constant temperature, pressure increases as volume decreases.' },
  { name: "Charles's law", rel: 'V \\propto T', held: 'n, P constant', note: 'At constant pressure, volume increases with kelvin temperature.' },
  { name: "Gay-Lussac's law", rel: 'P \\propto T', held: 'n, V constant', note: 'At constant volume, pressure increases with kelvin temperature.' },
  { name: "Avogadro's law", rel: 'V \\propto n', held: 'P, T constant', note: 'At constant pressure and temperature, volume increases with the number of moles.' },
  { name: 'Combined law', rel: 'PV/T = \\text{const}', held: 'n constant', note: 'For a fixed amount of ideal gas, PV/T remains constant.' }
];

// Plottable relationships for the C.10(B) curve. axis tells the chart what to vary.
export const RELATIONSHIPS = [
  { key: 'boyle',     name: "Boyle (P vs V)",      vary: 'V', out: 'P', xLabel: 'Volume (L)',      yLabel: 'Pressure (atm)' },
  { key: 'charles',   name: "Charles (V vs T)",    vary: 'T', out: 'V', xLabel: 'Temperature (K)', yLabel: 'Volume (L)' },
  { key: 'gaylussac', name: "Gay-Lussac (P vs T)", vary: 'T', out: 'P', xLabel: 'Temperature (K)', yLabel: 'Pressure (atm)' }
];

// ---- C.10(C): gases offered in the Dalton partial-pressure mixer ----
// `where` is additive: the part each gas plays on this boat. Nothing computes from it.
export const DALTON_GASES = [
  { name: 'N₂', formula: 'N2', mol: 1.5, where: 'major component in the simplified gas-mixture models' },
  { name: 'O₂', formula: 'O2', mol: 0.4, where: 'component used for partial-pressure calculations' },
  { name: 'CO₂', formula: 'CO2', mol: 0.1, where: 'example component for gas-mixture exploration' },
  { name: 'He', formula: 'He', mol: 0, where: 'example light gas used in the Honors speed comparison' },
  { name: 'Ar', formula: 'Ar', mol: 0, where: 'minor component included in the simplified dry-air sample' }
];

// ---- Honors (C.10A): van der Waals constants for real gases ----
// a in L^2*atm/mol^2, b in L/mol. Mean molar mass M in g/mol drives the speed curve.
export const REAL_GASES = [
  { key: 'He',  name: 'Helium',          formula: 'He',  a: 0.0346, b: 0.0238, M: 4.003 },
  { key: 'N2',  name: 'Nitrogen',        formula: 'N2',  a: 1.370,  b: 0.0387, M: 28.014 },
  { key: 'O2',  name: 'Oxygen',          formula: 'O2',  a: 1.382,  b: 0.0319, M: 31.998 },
  { key: 'CO2', name: 'Carbon dioxide',  formula: 'CO2', a: 3.640,  b: 0.0427, M: 44.009 }
];

// Honors (C.10C): vapor pressure of water for "gas collected over water" problems.
// torr at each temperature; atm derived in the view.
export const WATER_VP = [
  { tC: 20, torr: 17.5 }, { tC: 25, torr: 23.8 }, { tC: 30, torr: 31.8 },
  { tC: 40, torr: 55.3 }, { tC: 50, torr: 92.5 }, { tC: 60, torr: 149.4 },
  { tC: 80, torr: 355.1 }, { tC: 100, torr: 760.0 }
];

// Maxwell-Boltzmann speed distribution for the Honors KMT chart.
// Returns [{x: speed m/s, y: relative probability}] for molar mass M (g/mol) at T (K).
export function maxwellBoltzmann(M, T, vMax = 2800, steps = 90) {
  const R = 8.314;            // J/(mol*K)
  const Mkg = M / 1000;       // kg/mol
  const k = Mkg / (2 * R * T);
  const pts = [];
  for (let i = 0; i <= steps; i++) {
    const v = (vMax * i) / steps;
    pts.push({ x: v, y: 4 * Math.PI * Math.pow(k / Math.PI, 1.5) * v * v * Math.exp(-k * v * v) });
  }
  return pts;
}

// Characteristic speeds (m/s) for the readouts.
export const rmsSpeed = (M, T) => Math.sqrt((3 * 8.314 * T) / (M / 1000));
export const mostProbableSpeed = (M, T) => Math.sqrt((2 * 8.314 * T) / (M / 1000));

// Spec tolerance for the dose stages. Measured, not chosen. On `ideal`, at the unit's
// own shipped default state (V = 12 L, n = 0.5 mol, T = 300 K, true P = 1.0257 atm),
// using 27 degrees Celsius instead of 300 K is 91 percent off, R = 8.314 instead of
// 0.08206 is 10032 percent off, and milliliters for litres is 99.9 percent off. On
// `dalton`, taking an equal share instead of the mole fraction is 56 to 567 percent off
// on the shipped default mix. A 3 percent acceptable window is far narrower than the
// smallest error either skill's own failure mode can produce. Relative mode is not
// optional on either: `ideal` solves for P, V, n or T, whose magnitudes differ by three
// orders, and a CO2 partial of 0.05 atm makes any absolute band on `dalton` either
// meaningless or unreachable.
const DOSE_BANDS = { mode: 'relative', ideal: 0.01, acceptable: 0.03 };

// SCENARIOS: the game layer. You are the fill-station hand on a dive boat. One bench,
// one storage bank, a compressor, an oxygen line and a queue of cylinders. Every fill
// is the same equation, and the bank only holds so much. The chemistry tools are
// unchanged (the particle box, the PV = nRT solver, the Dalton mixer); the fiction, the
// consequences and the world-state (bank pressure + the day's log) are what make it a
// game rather than a worksheet.
//   Dose (C.10B, C.10C, h2, h3): commit a number. The band grades YOUR value against
//     the true requirement: on target vs too little / too much (each a named
//     consequence) vs unresolved.
//   Decision (C.10A, h1, capstone): per-option consequence text; the chemically-correct
//     option is the one good outcome. On C.10(A) the options are the five postulates and
//     the consequences live on the KMT_QUIZ item, because the answer varies within a
//     scenario's group of observations.
//   constraints: what the generator pins. `quiz` is a group of KMT_QUIZ ids; `solveFor`
//     plus the three ranges pin the ideal-gas state; `mix`/`find`/`total`/`depth` pin
//     the Dalton blend.
//   spend: bank pressure (atm) a call actually commits, per outcome. Most calls commit
//     nothing: reading a gauge or checking an analyzer costs time, not gas. Only the
//     two that put gas in a cylinder carry a spend, so the world-state moves for a
//     reason the story can defend.
export const SCENARIOS = [
  { id: 'a-whip', stage: 'kmt', skill: 'a', type: 'decision',
    system: 'Gas diffusion', icon: '\u{1F4A8}',
    goal: 'Read the observation and identify the ideal-gas KMT postulate that best explains it.',
    why: 'Kinetic molecular theory is a model that connects particle motion and spacing to observable gas behavior.',
    constraints: { quiz: ['k-mix', 'k-fill', 'k-settle'] } },
  { id: 'a-steel', stage: 'kmt', skill: 'a', type: 'decision',
    system: 'Gas compression', icon: '\u{2699}\u{FE0F}',
    goal: 'Use the observation to identify the ideal-gas assumption involved in compression or condensation behavior.',
    why: 'The ideal-gas assumptions are useful because they also show where the model can fail for real gases.',
    constraints: { quiz: ['k-squeeze', 'k-chips', 'k-condense'] } },
  { id: 'a-deck', stage: 'kmt', skill: 'a', type: 'decision',
    system: 'Temperature and motion', icon: '\u{2600}\u{FE0F}',
    goal: 'Connect absolute temperature with the average translational kinetic energy of gas particles.',
    why: 'At the same temperature, different ideal gases have the same average translational kinetic energy even though their characteristic speeds differ.',
    constraints: { quiz: ['k-balloon', 'k-equalT'] } },

  { id: 'b-tire', stage: 'ideal', skill: 'b', type: 'dose',
    system: 'Constant-volume gas model', icon: '\u{1F697}',
    goal: 'For this activity, treat the tire as a fixed-volume ideal-gas sample and use absolute pressure. Calculate the missing pressure with PV = nRT.',
    why: 'This simplified model isolates the pressure–temperature relationship. A real tire is not perfectly rigid, so the calculated value is an approximation.',
    constraints: { solveFor: 'P', rel: 'gaylussac', V: [12, 16], n: [1.4, 2.0], T: [305, 325] }, bands: DOSE_BANDS,
    actionLabel: 'Check pressure', safeState: 'WITHIN TOLERANCE', lowState: 'BELOW RESULT', highState: 'ABOVE RESULT',
    safe: 'Your answer agrees with the ideal-gas calculation within the activity tolerance.',
    low: 'Your value is below the calculated result. Check the rearrangement, kelvin temperature, and pressure units.',
    high: 'Your value is above the calculated result. Check the rearrangement, kelvin temperature, and pressure units.',
    fail: 'Enter a finite numerical value before checking the result.' },
  { id: 'b-twinset', stage: 'ideal', skill: 'b', type: 'dose',
    system: 'Cylinder gas model', icon: '\u{1F9EF}',
    goal: 'Use the ideal gas law to calculate the number of moles from the stated pressure, volume, and temperature.',
    why: 'Moles measure the amount of gas. At high pressure, real gases can deviate from the ideal model; the Honors section explores that correction.',
    constraints: { solveFor: 'n', rel: 'boyle', P: [180, 230], V: [22, 26], T: [288, 300] }, bands: DOSE_BANDS,
    spend: { ok: 24, low: 16, high: 38 }, actionLabel: 'Check moles', safeState: 'WITHIN TOLERANCE', lowState: 'BELOW RESULT', highState: 'ABOVE RESULT',
    safe: 'Your answer agrees with the ideal-gas calculation within the activity tolerance.',
    low: 'Your value is below the calculated number of moles. Recheck PV/(RT) and the units.',
    high: 'Your value is above the calculated number of moles. Recheck PV/(RT) and the units.',
    fail: 'Enter a finite numerical value before checking the result.' },
  { id: 'b-sundeck', stage: 'ideal', skill: 'b', type: 'dose',
    system: 'Heated cylinder model', icon: '\u{1F321}\u{FE0F}',
    goal: 'Treat the sealed cylinder as a fixed-volume ideal-gas sample. Calculate its temperature in kelvins from P, V, and n.',
    why: 'For a fixed amount of gas at constant volume, the ideal-gas model predicts that pressure is proportional to kelvin temperature.',
    constraints: { solveFor: 'T', rel: 'gaylussac', P: [200, 218], V: [11.5, 12.5], n: [92, 100] }, bands: DOSE_BANDS,
    actionLabel: 'Check temperature', safeState: 'WITHIN TOLERANCE', lowState: 'BELOW RESULT', highState: 'ABOVE RESULT',
    safe: 'Your answer agrees with the ideal-gas calculation within the activity tolerance.',
    low: 'Your value is below the calculated temperature. Check that temperature is solved in kelvins.',
    high: 'Your value is above the calculated temperature. Check the algebra and the gas-constant units.',
    fail: 'Enter a finite numerical value before checking the result.' },

  { id: 'c-air', stage: 'dalton', skill: 'c', type: 'dose',
    system: 'Simplified dry-air sample', icon: '\u{1F32C}\u{FE0F}',
    goal: 'Calculate the oxygen partial pressure from its mole fraction and the total pressure.',
    why: 'For an ideal-gas mixture, each component contributes a partial pressure: pᵢ = xᵢPtotal.',
    constraints: { mix: 'air', find: 'O2', total: [0.96, 1.04] }, bands: DOSE_BANDS,
    actionLabel: 'Check partial pressure', safeState: 'WITHIN TOLERANCE', lowState: 'BELOW RESULT', highState: 'ABOVE RESULT',
    safe: 'Your answer agrees with the mole-fraction calculation within the activity tolerance.',
    low: 'Your value is below the calculated partial pressure. Recheck the mole fraction and total pressure.',
    high: 'Your value is above the calculated partial pressure. Recheck the mole fraction and total pressure.',
    fail: 'Enter a finite numerical value before checking the result.' },
  { id: 'c-blend', stage: 'dalton', skill: 'c', type: 'dose',
    system: 'Ideal gas-mixture model', icon: '\u{1F7E2}',
    goal: 'Calculate the oxygen partial pressure in the model mixture from its mole fraction and total pressure.',
    why: 'Dalton’s law connects gas composition with total pressure. This activity treats the mixture as ideal.',
    constraints: { mix: 'nitrox', find: 'O2', total: [180, 232] }, bands: DOSE_BANDS,
    spend: { ok: 26, low: 18, high: 42 }, actionLabel: 'Check partial pressure', safeState: 'WITHIN TOLERANCE', lowState: 'BELOW RESULT', highState: 'ABOVE RESULT',
    safe: 'Your answer agrees with Dalton’s-law calculation within the activity tolerance.',
    low: 'Your value is below the calculated partial pressure. Check xO₂ × Ptotal.',
    high: 'Your value is above the calculated partial pressure. Check xO₂ × Ptotal.',
    fail: 'Enter a finite numerical value before checking the result.' },
  { id: 'c-ppo2', stage: 'dalton', skill: 'c', type: 'dose',
    system: 'Depth-pressure model', icon: '\u{1F30A}',
    goal: 'Use the simplified seawater model to calculate oxygen partial pressure at depth, then compare it with the 1.40 atm activity criterion.',
    why: 'For this activity, absolute pressure is approximated as 1 atm at the surface plus 1 atm for each 10 m of seawater. The 1.40 atm value is an activity criterion based on a common working oxygen limit, not a complete dive plan.',
    constraints: { mix: 'nitrox', find: 'O2', depth: [20, 30, 40] }, bands: DOSE_BANDS,
    actionLabel: 'Check partial pressure', safeState: 'WITHIN TOLERANCE', lowState: 'BELOW RESULT', highState: 'ABOVE RESULT',
    safe: 'Use the calculated partial pressure to decide whether the activity criterion is met.',
    low: 'Your value is below the calculated oxygen partial pressure. Recheck the oxygen fraction and absolute pressure.',
    high: 'Your value is above the calculated oxygen partial pressure. Recheck the oxygen fraction and absolute pressure.',
    fail: 'Enter a finite numerical value before checking the result.' },

  { id: 'h1-speeds', stage: 'honors1', skill: 'h1', type: 'decision',
    system: 'Maxwell–Boltzmann comparison', icon: '\u{1F4CA}',
    goal: 'Compare two gases at the same temperature. Decide whether the question asks about average translational kinetic energy or root-mean-square molecular speed.',
    why: 'At one temperature, ideal gases have the same average translational kinetic energy. The lighter gas has a greater rms speed and its speed distribution is shifted toward higher speeds.',
    kinds: {
      ke: { right: 'Correct. At the same temperature, both gases have the same average translational kinetic energy per particle, regardless of molar mass.', wrong: 'Average translational kinetic energy depends on absolute temperature, not molar mass. Because both gases are at the same temperature, this quantity is the same.' },
      speed: { right: 'Correct. At the same temperature, the lighter gas has the greater rms molecular speed and a distribution shifted toward higher speeds.', wrong: 'Equal average translational kinetic energy does not mean equal molecular speed. At the same temperature, the lighter gas has the greater rms speed.' }
    } },
  { id: 'h2-real', stage: 'honors2', skill: 'h2', type: 'dose',
    system: 'Real-gas correction', icon: '\u{1F4C9}',
    goal: 'Calculate the pressure predicted by the van der Waals equation for the stated gas, amount, volume, and temperature.',
    why: 'The van der Waals model accounts approximately for intermolecular attractions and finite particle volume, two effects omitted by the ideal gas law.',
    bands: DOSE_BANDS, actionLabel: 'Check corrected pressure', safeState: 'WITHIN TOLERANCE', lowState: 'BELOW RESULT', highState: 'ABOVE RESULT',
    safe: 'Your answer agrees with the van der Waals calculation within the activity tolerance.',
    low: 'Your value is below the calculated van der Waals pressure. Recheck both correction terms and the units.',
    high: 'Your value is above the calculated van der Waals pressure. Recheck both correction terms and the units.',
    fail: 'Enter a finite numerical value before checking the result.' },
  { id: 'h3-water', stage: 'honors3', skill: 'h3', type: 'dose',
    system: 'Gas collected over water', icon: '\u{1F4A7}',
    goal: 'Subtract the water-vapor partial pressure from the measured total pressure to determine the dry-gas pressure.',
    why: 'A gas collected over water contains both the collected gas and water vapor, so Ptotal = Pdry gas + PH₂O.',
    bands: DOSE_BANDS, actionLabel: 'Check dry-gas pressure', safeState: 'WITHIN TOLERANCE', lowState: 'BELOW RESULT', highState: 'ABOVE RESULT',
    safe: 'Your answer agrees with the Dalton’s-law subtraction within the activity tolerance.',
    low: 'Your value is below the calculated dry-gas pressure. Check the water-vapor value and subtraction.',
    high: 'Your value is above the calculated dry-gas pressure. Check the water-vapor value and subtraction.',
    fail: 'Enter a finite numerical value before checking the result.' },
  { id: 'cap-lastfill', stage: 'capstone', skill: 'cap', type: 'decision',
    system: 'Evidence check', icon: '\u{1F6A4}',
    goal: 'Calculate the oxygen partial pressure and compare it with the 1.40 atm activity criterion. Then compare the simulated reserve points with the points required by the scenario.',
    why: 'The capstone combines the chemistry result with a clearly labeled simulation resource. Reserve points are not a physical measurement of stored gas.',
    options: [
      { key: 'send', label: 'Both activity criteria are satisfied', good: 'The oxygen partial pressure is at or below the activity criterion, and the simulated reserve has enough points for this scenario.', consequence: 'At least one criterion is not satisfied. Recheck the oxygen partial pressure and the simulated reserve.' },
      { key: 'reblend', label: 'The O₂ partial-pressure criterion is exceeded', good: 'The simulated reserve is sufficient, but the calculated oxygen partial pressure is above the 1.40 atm activity criterion.', consequence: 'The oxygen criterion is not the limiting condition in this scenario. Compare the calculated pO₂ and reserve points again.' },
      { key: 'off', label: 'The simulated reserve is insufficient', good: 'The scenario requires more reserve points than remain in the simulation.', consequence: 'The simulated reserve is sufficient here. Compare the oxygen criterion before choosing another conclusion.' }
    ] }
];

export const SE = [
  { id: 'a', code: 'C.10(A)', mode: 'kmt', honors: false, text: 'Describe the postulates of the kinetic molecular theory.' },
  { id: 'b', code: 'C.10(B)', mode: 'ideal', honors: false, text: 'Describe and calculate the relationships among volume, pressure, number of moles, and temperature for an ideal gas.' },
  { id: 'c', code: 'C.10(C)', mode: 'dalton', honors: false, text: "Define and apply Dalton's law of partial pressure." },
  { id: 'h1', code: 'Honors', mode: 'kmt', honors: true, text: 'Compare Maxwell–Boltzmann speed distributions, rms molecular speed, and average translational kinetic energy.' },
  { id: 'h2', code: 'Honors', mode: 'ideal', honors: true, text: 'Compare ideal-gas pressure with a van der Waals real-gas correction.' },
  { id: 'h3', code: 'Honors', mode: 'dalton', honors: true, text: 'Subtract water-vapor partial pressure from the total pressure of a gas collected over water.' }
];
