from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]


def sub_once(text, pattern, replacement, label, flags=re.S):
    new, n = re.subn(pattern, lambda m: replacement, text, count=1, flags=flags)
    if n != 1:
        raise SystemExit(f'{label}: expected 1 replacement, got {n}')
    return new


def swap(text, old, new, label=None):
    if old not in text:
        raise SystemExit(f"missing text for replacement: {label or old[:80]}")
    return text.replace(old, new)


# ------------------------------------------------------------------ model.js
p = ROOT / 'units/07-gas-laws/js/model.js'
t = p.read_text(encoding='utf-8')

kmt_postulates = r"""export const KMT_POSTULATES = [
  { id: 1, short: 'Constant motion', text: 'In the ideal-gas model, particles move continuously in random, straight-line paths between collisions.' },
  { id: 2, short: 'Negligible particle volume', text: 'Ideal-gas particles are treated as extremely small compared with the space between them, so their own volume is negligible.' },
  { id: 3, short: 'Elastic collisions', text: 'Collisions between ideal-gas particles and with container walls are elastic, so total kinetic energy is conserved during the collisions.' },
  { id: 4, short: 'No intermolecular forces', text: 'The ideal-gas model assumes no attractive or repulsive forces between particles except during collisions.' },
  { id: 5, short: 'KE ∝ T', text: 'Average translational kinetic energy is proportional to absolute temperature in kelvins.' }
];"""
t = sub_once(t, r"export const KMT_POSTULATES = \[.*?\n\];", kmt_postulates, 'KMT postulates')

kmt_quiz = r"""export const KMT_QUIZ = [
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
];"""
t = sub_once(t, r"export const KMT_QUIZ = \[.*?\n\];\n\n// ---- C\.10\(B\):", kmt_quiz + "\n\n// ---- C.10(B):", 'KMT quiz')

gas_laws = r"""export const GAS_LAWS = [
  { name: "Boyle's law", rel: 'P \\propto 1/V', held: 'n, T constant', note: 'At constant temperature, pressure increases as volume decreases.' },
  { name: "Charles's law", rel: 'V \\propto T', held: 'n, P constant', note: 'At constant pressure, volume increases with kelvin temperature.' },
  { name: "Gay-Lussac's law", rel: 'P \\propto T', held: 'n, V constant', note: 'At constant volume, pressure increases with kelvin temperature.' },
  { name: "Avogadro's law", rel: 'V \\propto n', held: 'P, T constant', note: 'At constant pressure and temperature, volume increases with the number of moles.' },
  { name: 'Combined law', rel: 'PV/T = \\text{const}', held: 'n constant', note: 'For a fixed amount of ideal gas, PV/T remains constant.' }
];"""
t = sub_once(t, r"export const GAS_LAWS = \[.*?\n\];", gas_laws, 'gas laws')

dalton_gases = r"""export const DALTON_GASES = [
  { name: 'N₂', formula: 'N2', mol: 1.5, where: 'major component in the simplified gas-mixture models' },
  { name: 'O₂', formula: 'O2', mol: 0.4, where: 'component used for partial-pressure calculations' },
  { name: 'CO₂', formula: 'CO2', mol: 0.1, where: 'example component for gas-mixture exploration' },
  { name: 'He', formula: 'He', mol: 0, where: 'example light gas used in the Honors speed comparison' },
  { name: 'Ar', formula: 'Ar', mol: 0, where: 'minor component included in the simplified dry-air sample' }
];"""
t = sub_once(t, r"export const DALTON_GASES = \[.*?\n\];", dalton_gases, 'Dalton gases')

scenarios = r"""export const SCENARIOS = [
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

  { id: 'b-tyre', stage: 'ideal', skill: 'b', type: 'dose',
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
];"""
t = sub_once(t, r"export const SCENARIOS = \[.*?\n\];\n\nexport const SE = \[", scenarios + "\n\nexport const SE = [", 'scenarios')

se_block = r"""export const SE = [
  { id: 'a', code: 'C.10(A)', mode: 'kmt', honors: false, text: 'Describe the postulates of the kinetic molecular theory.' },
  { id: 'b', code: 'C.10(B)', mode: 'ideal', honors: false, text: 'Describe and calculate the relationships among volume, pressure, number of moles, and temperature for an ideal gas.' },
  { id: 'c', code: 'C.10(C)', mode: 'dalton', honors: false, text: "Define and apply Dalton's law of partial pressure." },
  { id: 'h1', code: 'Honors', mode: 'kmt', honors: true, text: 'Compare Maxwell–Boltzmann speed distributions, rms molecular speed, and average translational kinetic energy.' },
  { id: 'h2', code: 'Honors', mode: 'ideal', honors: true, text: 'Compare ideal-gas pressure with a van der Waals real-gas correction.' },
  { id: 'h3', code: 'Honors', mode: 'dalton', honors: true, text: 'Subtract water-vapor partial pressure from the total pressure of a gas collected over water.' }
];"""
t = sub_once(t, r"export const SE = \[.*?\n\];\s*$", se_block + "\n", 'SE block')
for a, b in [('vapour', 'vapor'), ('Vapour', 'Vapor'), ('analyser', 'analyzer'), ('Analyser', 'Analyzer'), ('analysed', 'analyzed'), ('harbour', 'harbor'), ('tyres', 'tires'), ('tyre', 'tire'), ('idealisation', 'idealization'), ('behaviour', 'behavior'), ('millilitres', 'milliliters')]:
    t = t.replace(a, b)
p.write_text(t, encoding='utf-8')


# ------------------------------------------------------------------ main.js
p = ROOT / 'units/07-gas-laws/js/main.js'
t = p.read_text(encoding='utf-8')
t = t.replace("from './model.js';", "from './model.js?v=u7-fidelity-20260825';")
t = t.replace("from './art.js';", "from './art.js?v=u7-fidelity-20260825';")
t = t.replace("const START_BANK = 200;     // atm of storage pressure in the bank at the start of the day", "const START_BANK = 200;     // simulation reserve points; not a physical pressure or gas quantity")
t = t.replace("const PPO2_LIMIT = 1.4;     // atm, the recreational working limit (1.6 is contingency)", "const PPO2_LIMIT = 1.4;     // atm, activity criterion based on NOAA's common nitrox working limit")
t = sub_once(t, r"get bankMood\(\) \{.*?\},\n    get bankState\(\) \{.*?\n    \},", """get bankMood() { return this.bank >= START_BANK * 0.5 ? '●' : this.bank >= START_BANK * 0.2 ? '▲' : '■'; },
    get bankState() {
      if (this.bank >= START_BANK * 0.5) return 'Reserve high';
      if (this.bank >= START_BANK * 0.2) return 'Reserve low';
      return 'Reserve depleted';
    },""", 'bank state')
t = t.replace("|| 'Dive-boat fill station';", "|| 'Gas laws activity';")
t = t.replace("'Read the tank, solve the relationship, and keep the bank honest.'", "'Read the values, calculate the relationship, and compare your result with the evidence.'")
t = sub_once(t, r"get activeReference\(\) \{.*?\n    \},\n    get bankReadings\(\) \{", """get activeReference() {
      if (this.mode === 'ideal') return [{ k: 'Equation', v: 'PV = nRT' }, { k: 'Model', v: 'use kelvin and absolute pressure; treat the gas as ideal' }];
      if (this.mode === 'dalton') return [{ k: 'Dalton', v: 'Ptotal = sum of partial pressures' }, { k: 'Depth problems', v: '1.40 atm pO₂ is the activity criterion' }];
      return [{ k: 'KMT', v: 'these are ideal-gas model assumptions' }, { k: 'Simulation', v: 'reserve points are not a measured gas quantity' }];
    },
    get bankReadings() {""", 'active reference')
t = sub_once(t, r"return \[\n        \{ key: 'bank'.*?\n      \];", """return [
        { key: 'bank', label: 'Reserve', raw: `${fmt(this.bank)}/200 pts`, pct: this.bankPct, color: this.bankColor, hint: 'simulated reserve score; not a physical pressure or amount of gas' },
        { key: 'clock', label: 'Clock', raw: this.clockLabel, pct: Math.min(100, this.clockMin / 480 * 100), color: 'var(--accent)', hint: 'simulated activity time' },
        { key: 'core', label: 'Core', raw: `${this.teksMasteredCount}/3`, pct: this.gOverall() * 100, color: 'var(--accent-700)', hint: 'core skills mastered' },
        { key: 'answers', label: 'Log', raw: `${this.worldLog.length}`, pct: Math.min(100, this.worldLog.length / 6 * 100), color: 'var(--success)', hint: 'recent activity results' }
      ];""", 'bank readings')
t = t.replace("state: 'CALLED IT'", "state: 'CORRECT POSTULATE'")
t = t.replace("state: 'WRONG POSTULATE'", "state: 'CHECK POSTULATE'")
t = t.replace("${good ? 'read right' : 'misread'}", "${good ? 'postulate matched' : 'postulate missed'}")
t = t.replace("? `At ${this.boxT} K, which bottle has the greater AVERAGE KINETIC ENERGY per particle?`", "? `At ${this.boxT} K, which bottle has greater average translational kinetic energy per particle?`")
t = t.replace(": `At ${this.boxT} K, which bottle has the greater AVERAGE MOLECULAR SPEED?`;", ": `At ${this.boxT} K, which bottle has greater root-mean-square (rms) molecular speed?`;")
t = t.replace("Both are at ${this.boxT} K, so both average 3RT/2 per mole.", "Both are at ${this.boxT} K, so both have average translational kinetic energy 3RT/2 per mole.")
t = t.replace("${gA.name} runs at ${fmt(rmsSpeed(gA.M, this.boxT))} m/s rms against ${gB.name} at ${fmt(rmsSpeed(gB.M, this.boxT))} m/s.", "${gA.name}: v_rms = ${fmt(rmsSpeed(gA.M, this.boxT))} m/s; ${gB.name}: v_rms = ${fmt(rmsSpeed(gB.M, this.boxT))} m/s.")
t = t.replace("state: 'READ RIGHT'", "state: 'CORRECT COMPARISON'")
t = t.replace("state: 'CURVE MISREAD'", "state: 'CHECK COMPARISON'")
t = t.replace("state: 'NO NUMBER', headline: 'Nothing to act on'", "state: 'ENTER A NUMBER', headline: 'Enter a numerical answer'")
t = t.replace("state: 'NO NUMBER', headline: 'Nothing to correct'", "state: 'ENTER A NUMBER', headline: 'Enter a numerical answer'")
t = t.replace("state: 'NO NUMBER', headline: 'Nothing to report'", "state: 'ENTER A NUMBER', headline: 'Enter a numerical answer'")
t = t.replace("headline: 'Called it'", "headline: 'Within activity tolerance'")
t = t.replace("headline: 'Called it low'", "headline: 'Below the calculated value'")
t = t.replace("headline: 'Called it high'", "headline: 'Above the calculated value'")
t = t.replace("headline: 'Corrected short'", "headline: 'Below the calculated value'")
t = t.replace("headline: 'Corrected long'", "headline: 'Above the calculated value'")
t = t.replace("headline: 'Dry gas reported'", "headline: 'Within activity tolerance'")
t = t.replace("headline: lowSide ? 'Reported short' : 'Reported long'", "headline: lowSide ? 'Below the calculated value' : 'Above the calculated value'")
t = t.replace("You called ${yours}", "Your answer is ${yours}")
t = t.replace("You reported ${yours}", "Your answer is ${yours}")
t = t.replace("'fill sized' : 'fill missed'", "'answer within tolerance' : 'answer outside tolerance'")
t = t.replace("'mix called' : 'mix missed'", "'answer within tolerance' : 'answer outside tolerance'")
t = t.replace("'table corrected' : 'correction wrong'", "'answer within tolerance' : 'answer outside tolerance'")
t = t.replace("'dry gas reported' : 'vapour miscounted'", "'answer within tolerance' : 'answer outside tolerance'")
t = t.replace("'dry gas reported' : 'vapor miscounted'", "'answer within tolerance' : 'answer outside tolerance'")
t = t.replace("? ` That is past the ${PPO2_LIMIT} atm working limit at ${this.dl.depth} m, so this mix does not go to that depth.`", "? ` This is above the ${PPO2_LIMIT} atm activity criterion at ${this.dl.depth} m.`")
t = t.replace(": ` That is inside the ${PPO2_LIMIT} atm working limit at ${this.dl.depth} m, so the depth stands.`)", ": ` This is at or below the ${PPO2_LIMIT} atm activity criterion at ${this.dl.depth} m.`)")
t = t.replace("The fill draws ${c.need} atm off a bank holding ${fmt(c.bankAt)} atm.", "The simulation requires ${c.need} reserve points, and ${fmt(c.bankAt)} points remain.")
t = t.replace("state: 'RIGHT CALL', headline: 'Right call'", "state: 'EVIDENCE MATCHED', headline: 'Conclusion supported'")
t = t.replace("state: 'WRONG CALL', headline: 'Wrong call'", "state: 'CHECK THE EVIDENCE', headline: 'Conclusion not supported'")
t = t.replace("${good ? 'right call' : 'wrong call'}", "${good ? 'conclusion supported' : 'conclusion not supported'}")
for a, b in [('vapour', 'vapor'), ('Vapour', 'Vapor'), ('analyser', 'analyzer'), ('Analyser', 'Analyzer'), ('analysed', 'analyzed'), ('harbour', 'harbor'), ('tyres', 'tires'), ('tyre', 'tire'), ('idealisation', 'idealization'), ('behaviour', 'behavior')]:
    t = t.replace(a, b)
p.write_text(t, encoding='utf-8')


# ------------------------------------------------------------------ index.html
p = ROOT / 'units/07-gas-laws/index.html'
t = p.read_text(encoding='utf-8')
t = t.replace("Watch a 3D kinetic particle box, solve PV = nRT for any variable, and split a mixture with Dalton's law of partial pressures. TEKS C.10.", "Explore kinetic molecular theory, ideal-gas relationships, PV = nRT, and Dalton's law of partial pressure. TEKS C.10.")
t = t.replace('aria-label="Unit 7 dive-boat cockpit"', 'aria-label="Unit 7 gas laws interactive workspace"')
t = t.replace('aria-label="Dive-boat fill benches"', 'aria-label="Gas laws activity tabs"')
t = t.replace('aria-label="Active dive-boat job"', 'aria-label="Current chemistry scenario"')
t = t.replace('aria-label="Dive-boat bank status"', 'aria-label="Simulation status"')
t = t.replace('<span class="command-kicker">The shift</span><p><strong x-text="clockLabel"></strong> · bank <strong x-text="fmt(bank)+\' atm\'"></strong></p>', '<span class="command-kicker">Simulation</span><p><strong x-text="clockLabel"></strong> · reserve <strong x-text="fmt(bank)+\' pts\'"></strong></p>')
t = t.replace('Every particle is in constant, random motion. Change the temperature, particle count, and volume, then watch how the model responds. Drag to rotate.', 'This ideal-gas particle model shows continuous random motion. Change temperature, particle count, and volume, then observe the relative kinetic-energy and pressure readouts. Drag to rotate.')
t = t.replace('Every ×-number compares this box with one baseline box: 40 particles, 300 K, ×1 volume. Average kinetic energy depends only on temperature (postulate 5). Pressure comes from wall collisions, so it rises with more particles or higher temperature and falls as the volume grows: P &#8733; nT/V.', 'Each ×-number compares the model with a baseline of 40 particles, 300 K, and ×1 volume. In the ideal-gas model, average translational kinetic energy depends on temperature. The relative pressure model follows P &#8733; NT/V.')
t = t.replace('>Call it</button>', '>Check answer</button>')
t = t.replace("'Say which postulate explains it first.'", "'Select the postulate that best explains the observation.'")
t = t.replace('Certify C.10(A) first: three postulate calls right in a row unlocks this bench.', 'Master C.10(A) first: three correct postulate answers in a row unlock this Honors section.')
t = t.replace("'Say which bottle holds more molecules.'", "'Compare the gases using the quantity named in the question.'")
t = t.replace('What the curve actually says', 'What the distribution shows')
t = t.replace('Gas on the orange curve', 'Gas A (first curve)')
t = t.replace('<th class="num">most probable</th><th class="num">rms speed</th>', '<th class="num">most probable speed</th><th class="num">rms speed</th>')
t = t.replace('Particles share a spread of speeds, not one. Raising the temperature broadens the curve and shifts it faster; at one temperature the heavier gas peaks slower, carrying the same average energy as the lighter one.', 'Particles have a distribution of speeds. Raising temperature broadens the distribution and shifts it toward higher speeds. At the same temperature, the heavier gas has lower characteristic speeds while both gases have the same average translational kinetic energy.')
t = t.replace('<span class="k">Work out</span>', '<span class="k">Calculate</span>')
t = t.replace('>your call</div>', '>answer pending</div>')
t = t.replace('Your call (<span x-text="ig.unit"></span>)', 'Your answer (<span x-text="ig.unit"></span>)')
t = t.replace('Your call (atm)', 'Your answer (atm)')
t = t.replace('Keep units in atm, L, mol, and K.</p>', 'Keep units in atm, L, mol, and K.</p>\n              <p class="muted" style="font-size: var(--fs-xs); margin-top: var(--s-1);"><strong>Activity tolerance:</strong> answers within 3% of the calculated value are accepted.</p>')
t = t.replace('>too little</div>', '>below result</div>').replace('>on spec</div>', '>within tolerance</div>').replace('>too much</div>', '>above result</div>')
t = t.replace('Certify C.10(B) first: three ideal-gas calls right in a row unlocks this bench.', 'Master C.10(B) first: three correct ideal-gas answers in a row unlock this Honors section.')
t = t.replace("'Work the van der Waals pressure out, then type it.'", "'Calculate the van der Waals pressure, then enter it.'")
t = t.replace('>corrected short</div>', '>below result</div>').replace('>corrected long</div>', '>above result</div>')
t = t.replace("An ideal gas holds Z = 1 at every pressure. A real gas dips below 1 where attractions dominate, then rises above 1 once the particles' own volume takes over. Deviations grow at high pressure and low temperature.", "An ideal gas has Z = 1. For many real gases, attractions can produce Z < 1 in some conditions, while finite particle volume can produce Z > 1 at higher pressures. Deviations from ideal behavior generally become more important at high pressure and lower temperature.")
t = t.replace('In a mixture, each gas pushes on the walls independently. Its share of the total pressure equals its mole fraction.', 'For an ideal-gas mixture, each component contributes a partial pressure: pᵢ = xᵢPtotal. The partial pressures add to the total pressure.')
t = t.replace('>too lean</div>', '>below result</div>').replace('>too rich</div>', '>above result</div>')
t = t.replace('Certify C.10(C) first: three partial-pressure calls right in a row unlocks this bench.', 'Master C.10(C) first: three correct partial-pressure answers in a row unlock this Honors section.')
t = t.replace("A gas bubbled into an inverted tube over water mixes with water vapor. Subtract water's vapor pressure to get the dry-gas pressure.", 'A gas collected over water contains the collected gas plus water vapor. Subtract the water-vapor partial pressure from the measured total pressure to obtain the dry-gas pressure.')
t = t.replace('Vapor pressure table', 'Water vapor-pressure table')
t = t.replace("'Subtract the vapor pressure first, then type the dry value.'", "'Subtract the water-vapor partial pressure, then enter the dry-gas pressure.'")
t = t.replace('>reported short</div>', '>below result</div>').replace('>reported long</div>', '>above result</div>')
t = t.replace('Certify all three core skills to take this one. Kinetic theory, the ideal gas law and partial pressures each need three right in a row.', 'Master all three core skills to unlock the capstone. Each core skill requires three correct answers in a row.')
t = t.replace('<span class="k">This fill draws</span>\n                  <span class="v mono"><span x-text="cap.need"></span> atm of bank</span>', '<span class="k">Simulation requires</span>\n                  <span class="v mono"><span x-text="cap.need"></span> reserve points</span>')
t = t.replace('<span class="k">Bank holds</span>\n                  <span class="v mono"><span x-text="fmt(cap.bankAt)"></span> atm</span>', '<span class="k">Simulated reserve</span>\n                  <span class="v mono"><span x-text="fmt(cap.bankAt)"></span> pts</span>')
t = t.replace('<span class="k">Oxygen working limit</span>', '<span class="k">Activity pO₂ criterion</span>')
t = t.replace('Every 10 m of seawater adds 1 atm to the 1 atm already on the surface.', 'Activity model: absolute pressure is approximately 1 atm at the surface plus 1 atm for each 10 m of seawater.')
t = t.replace('One call. What do you do?', 'Use the evidence. Which condition is supported?')
t = t.replace('>Make the call</button>', '>Check conclusion</button>')
t = t.replace("'Make the call on the fill first.'", "'Select the conclusion supported by the calculated values.'")
t = t.replace('The bank &amp; the clock', 'Simulation reserve &amp; clock')
t = t.replace('<span class="small mono"><span x-text="fmt(bank)"></span> of 200 atm</span>', '<span class="small mono"><span x-text="fmt(bank)"></span> of 200 pts</span>')
t = t.replace('One cylinder is 20 atm of storage. The bank drops when a call actually puts gas in a cylinder, and a missed call spends more of it than a right one.', 'Reserve points are an activity score, not a measured pressure or amount of gas. The score changes according to the simulation rules after selected problems.')
t = t.replace('Nothing filled yet. Make a call and watch what your number costs the bank.', 'No result recorded yet. Check an answer to update the simulation log.')
t = t.replace('<span class="command-kicker">Storage bank</span>', '<span class="command-kicker">Simulated reserve</span>')
t = t.replace('<span>Pressure</span><span class="mono" x-text="fmt(bank)+\' / 200\'"></span>', '<span>Reserve</span><span class="mono" x-text="fmt(bank)+\' / 200 pts\'"></span>')
t = t.replace('<span class="command-kicker">Latest consequence</span>', '<span class="command-kicker">Latest result</span>')
t = t.replace("worldLog.length ? worldLog[0].text : 'No fill is logged yet.'", "worldLog.length ? worldLog[0].text : 'No result is logged yet.'")
t = t.replace('<span class="command-kicker">Fill log</span>', '<span class="command-kicker">Activity log</span>')
t = t.replace('The first cylinder is waiting.', 'No result recorded yet.')
t = t.replace("import { createSim } from './js/main.js';", "import { createSim } from './js/main.js?v=u7-fidelity-20260825';")
t = t.replace("import { CASE } from './js/case.js';", "import { CASE } from './js/case.js?v=u7-fidelity-20260825';")
for a, b in [('vapour', 'vapor'), ('Vapour', 'Vapor'), ('analyser', 'analyzer'), ('Analyser', 'Analyzer'), ('harbour', 'harbor'), ('tyres', 'tires'), ('tyre', 'tire'), ('idealisation', 'idealization'), ('behaviour', 'behavior')]:
    t = t.replace(a, b)
p.write_text(t, encoding='utf-8')


# ------------------------------------------------------------------ art.js
p = ROOT / 'units/07-gas-laws/js/art.js'
t = p.read_text(encoding='utf-8')
replacements = {
    'THE BLENDING WHIP · IT MIXES ITSELF': 'RANDOM MOTION · GAS PARTICLES SPREAD',
    'THE COMPRESSOR · A ROOM OF AIR INTO STEEL': 'GAS PARTICLES · LARGE SPACES BETWEEN THEM',
    'THE HOT DECK · THE NEEDLE MOVED ON ITS OWN': 'HIGHER T · HIGHER AVERAGE KINETIC ENERGY',
    'THE AIR ON THE DOCK · RECOVER AIR OUT OF AIR': 'PARTIAL PRESSURE · MOLE FRACTION × TOTAL P',
    'THE NITROX BLEND · TWO LINES, ONE TOTAL': 'DALTON MODEL · PARTIAL PRESSURES ADD TO TOTAL P',
    'THE DIVE PLAN · DEPTH MULTIPLIES THE OXYGEN': 'DEPTH · ABSOLUTE PRESSURE RAISES pO2',
    'THE RACK · SAME ENERGY, DIFFERENT SPEEDS': 'SAME T · SAME AVERAGE KE · DIFFERENT SPEEDS',
    'THE HIGH-PRESSURE BANK · WHERE IDEAL GIVES OUT': 'REAL GAS · DEVIATION FROM IDEAL BEHAVIOR',
    'THE COLLECTION TUBE · VAPOUR CAME FOR FREE': 'GAS OVER WATER · SUBTRACT WATER VAPOR P',
    'THE LAST FILL · BANK, DEPTH AND ONE CALL': 'CAPSTONE · COMPARE THE CALCULATED VALUES',
    'SAME READING': 'UNIFORM AFTER MIXING',
    '1 m3 of shop air': 'large gas volume',
    'same molecules': 'same particles',
    '1/200 the room': 'much smaller volume',
    'the sticker is': 'the O2 fraction',
    'a partial': 'sets pO2 at',
    "mono(302, 54, 'pressure'": "mono(302, 54, 'a stated P total'",
    'BANK LOW': 'RESERVE LOW',
    'ONE CALL': 'DECIDE',
    "[['fill it', 45], ['re-blend', 62], ['call it off', 79]]": "[['criteria met', 45], ['pO2 high', 62], ['reserve low', 79]]",
    "label: '41 C'": "label: '41 °C'",
    "label: '25 C'": "label: '25 °C'"
}
for old, new in replacements.items():
    if old not in t:
        raise SystemExit(f'art.js missing expected text: {old}')
    t = t.replace(old, new)
for a, b in [('vapour', 'vapor'), ('Vapour', 'Vapor'), ('analyser', 'analyzer'), ('Analyser', 'Analyzer'), ('harbour', 'harbor'), ('tyres', 'tires'), ('tyre', 'tire'), ('idealisation', 'idealization'), ('behaviour', 'behavior')]:
    t = t.replace(a, b)
p.write_text(t, encoding='utf-8')


# ------------------------------------------------------------------ case.js
case_js = r'''// case.js: Unit 7 Case File — Boyle's law and scuba ascent safety.
// The case uses a simplified isothermal gas sample to connect P and V. It does not
// replace formal dive training or model the mechanical limits of human lungs.

export const CASE = {
  id: 'scuba-boyle-ascent',
  number: '007',
  kicker: "Boyle's law in diving",
  title: 'Why scuba divers never hold their breath on ascent',
  teaser: 'A pressure–volume relationship with a direct safety consequence',
  hook: "Scuba divers are taught to keep breathing and never hold their breath while ascending. As surrounding pressure decreases, gas in the lungs tends to expand. Boyle's law explains the pressure–volume relationship.",
  stats: [
    { v: '≈4 atm', k: 'absolute pressure at 30 m seawater' },
    { v: '4×', k: 'model expansion from 30 m to surface' },
    { v: '≈+1 atm', k: 'pressure per 10 m seawater' }
  ],
  steps: [
    { t: 'Pressure increases with depth', body: 'At the surface, atmospheric pressure is about 1 atm. In seawater, pressure increases by about 1 atm for every 10 m of depth. At 30 m, the surrounding pressure is therefore about 4 atm absolute. A scuba regulator supplies breathing gas at approximately the surrounding pressure.', chem: 'Gas pressure results from particle collisions with surfaces. A breath taken at depth contains more gas particles in the same lung volume than an equal-volume breath taken at the surface.', cap: 'At 30 m, the model begins with 1.0 L of gas at approximately 4 atm absolute.' },
    { t: 'Gas expands as pressure decreases', body: 'Suppose 1.0 L of gas is sealed at 30 m and then brought toward the surface. If the amount of gas and temperature remain approximately constant, decreasing pressure causes its volume to increase.', chem: "Boyle's law gives P₁V₁ = P₂V₂. In the simplified model, (4 atm)(1.0 L) = (1 atm)(V₂), so the predicted volume is 4.0 L.", cap: "Boyle's law predicts increasing volume as external pressure decreases." },
    { t: 'Why breathing during ascent matters', body: 'During a normal scuba ascent, divers keep their airway open and breathe normally. If expanding gas cannot escape because a diver holds their breath or gas becomes trapped in part of the lungs, the expanding gas can injure lung tissue. In severe cases, gas bubbles can enter the arterial circulation and cause an arterial gas embolism.', chem: "Boyle's law predicts the direction of the volume change: lower pressure allows a fixed amount of gas to occupy a larger volume. The equation explains the physical trend, but actual diving safety also depends on physiology, equipment, and proper training.", cap: 'Keep breathing normally during ascent; never hold your breath.' },
    { t: "Boyle's law beyond diving", body: 'Similar pressure–volume effects occur in everyday systems. A flexible sealed bag can expand as outside pressure decreases and compress as outside pressure increases. Weather balloons also expand as atmospheric pressure decreases, although temperature changes and the balloon material make the real situation more complex.', chem: "Boyle's law applies most directly to a fixed amount of gas at approximately constant temperature. Real systems may involve changes in temperature, container shape, or other variables.", cap: "Boyle's law models the inverse relationship between pressure and volume." }
  ],
  quiz: {
    q: "In the simplified constant-temperature model, a sealed 1.0 L gas sample at 20 m is at approximately 3 atm absolute. If it is brought to the surface at 1 atm, what volume does Boyle's law predict?",
    options: [{ label: '3.0 L', correct: true }, { label: '1.0 L', correct: false }, { label: '0.33 L', correct: false }],
    explain: 'P₁V₁ = P₂V₂: (3 atm)(1.0 L) = (1 atm)(V₂), so V₂ = 3.0 L. This is the theoretical volume of a sealed gas sample under the model assumptions; it is not a target or safe volume for human lungs.'
  },
  punch: "Boyle's law connects pressure and volume. The diving example shows how a simple gas relationship can help explain an important real-world safety rule.",
  careers: ['Diving safety officer', 'Hyperbaric medicine physician', 'Aerospace engineer', 'Meteorologist'],
  cta: { label: 'Explore pressure and volume', call: "setMode('ideal')" },
  state: { depth: 30 },
  controls: `
          <div style="padding: var(--s-3) var(--s-4); border-top: 1px solid var(--cf-line); display: flex; gap: var(--s-4); align-items: center;">
            <label style="color: var(--cf-ink-2); font-size: var(--fs-xs); font-family: var(--font-mono); white-space: nowrap;" for="cf-depth">MODEL DEPTH</label>
            <input id="cf-depth" type="range" min="0" max="30" step="1" x-model.number="depth" style="flex: 1;">
            <span class="mono" style="color: var(--cf-accent); font-size: var(--fs-sm); min-width: 46px; text-align: right;" x-text="depth + ' m'"></span>
          </div>
`,
  stage: `
          <svg viewBox="0 0 640 360" role="img" aria-label="Interactive Boyle's law model: a sealed gas sample expands as pressure decreases from 30 meters depth toward the surface">
            <rect x="0" y="0" width="640" height="56" fill="#163b49"/><circle class="a-glow" style="--dur:4s" cx="560" cy="26" r="16" fill="#ffd27e" opacity=".8"/>
            <rect x="0" y="56" width="640" height="304" fill="#133548"/><rect x="0" y="150" width="640" height="210" fill="#0f2e43"/><rect x="0" y="250" width="640" height="110" fill="#0c2639"/>
            <path class="a-flow" style="--fx:26px; --dur:6s" d="M 0,58 q 40,-5 80,0 q 40,5 80,0 q 40,-5 80,0 q 40,5 80,0 q 40,-5 80,0 q 40,5 80,0 q 40,-5 80,0 q 40,5 80,0" fill="none" stroke="#7fc4d0" stroke-width="2" opacity=".6"/>
            <g font-family="JetBrains Mono" font-size="10" fill="#8fa9b2"><line x1="600" y1="70" x2="600" y2="330" stroke="#3a545f" stroke-width="1.4"/><line x1="594" y1="80" x2="606" y2="80" stroke="#3a545f"/><text x="612" y="84">0 m · 1 atm</text><line x1="594" y1="160" x2="606" y2="160" stroke="#3a545f"/><text x="612" y="164">10</text><line x1="594" y1="240" x2="606" y2="240" stroke="#3a545f"/><text x="612" y="244">20</text><line x1="594" y1="320" x2="606" y2="320" stroke="#3a545f"/><text x="612" y="324">30</text></g>
            <g><circle cx="90" cy="300" r="13" fill="#dcebee"/><rect x="74" y="313" width="34" height="20" rx="8" fill="#5ea3b0"/><rect x="104" y="308" width="10" height="22" rx="4" fill="#3a545f"/><g fill="#cfe4ea" opacity=".8"><circle class="a-rise" style="--rise:-210px; --wob:6px; --dur:5s" cx="96" cy="288" r="3"/><circle class="a-rise" style="--rise:-215px; --wob:5px; --dur:6s; --delay:1.6s" cx="102" cy="290" r="2.4"/><circle class="a-rise" style="--rise:-205px; --wob:7px; --dur:5.5s; --delay:3.2s" cx="90" cy="286" r="3.4"/></g><text x="90" y="352" text-anchor="middle" font-family="JetBrains Mono" font-size="9" fill="#8fa9b2">model sample: 1.0 L at 4 atm</text></g>
            <g class="a-float" style="--fy:-3px; --tilt:1.5deg; --dur:3.2s"><circle :cy="80 + depth*8" :r="14 * Math.cbrt(4/(1 + depth/10))" cx="330" fill="#ffd27e" fill-opacity=".85" stroke="#ffe4b0" stroke-width="2"/><line x1="330" :y1="80 + depth*8 + 14 * Math.cbrt(4/(1 + depth/10))" x2="330" :y2="80 + depth*8 + 14 * Math.cbrt(4/(1 + depth/10)) + 12" stroke="#ffe4b0" stroke-width="1.6"/><text :y="80 + depth*8 + 4" x="330" text-anchor="middle" font-family="JetBrains Mono" font-size="10" fill="#172d3b" font-weight="700" x-text="(4/(1 + depth/10)).toFixed(2) + ' L'"></text></g>
            <g font-family="JetBrains Mono"><rect x="24" y="72" width="180" height="76" rx="10" fill="#132630" stroke="#2c414d"/><text x="40" y="96" font-size="10" fill="#8fa9b2">BOYLE'S LAW MODEL</text><text x="40" y="116" font-size="12" fill="#7fc4d0" x-text="'P = ' + (1 + depth/10).toFixed(1) + ' atm'"></text><text x="40" y="136" font-size="12" fill="#ffd27e" x-text="'V = ' + (4/(1 + depth/10)).toFixed(2) + ' L'"></text><text x="128" y="126" font-size="10" fill="#8fd9ae">PV = 4.0 L·atm</text></g>
            <g x-show="step===2"><g class="a-float" style="--dur:3s"><rect x="225" y="72" width="210" height="26" rx="13" fill="#132630" stroke="#ff9a82"/><text x="330" y="89" text-anchor="middle" font-family="JetBrains Mono" font-size="10" fill="#ff9a82" font-weight="700">BREATHE NORMALLY ON ASCENT</text></g></g>
          </svg>
`
};
'''
(ROOT / 'units/07-gas-laws/js/case.js').write_text(case_js, encoding='utf-8')


# ------------------------------------------------------------------ shared course map
p = ROOT / 'shared/js/teks.js'
t = p.read_text(encoding='utf-8')
t = swap(t, 'Why is "never hold your breath" the first rule of scuba diving?', "How does Boyle's law explain why scuba divers must not hold their breath during ascent?", 'Unit 7 hook')
t = swap(t, "case: 'The scuba ascent rule',", "case: \"Boyle's law and scuba ascent\",", 'Unit 7 case title')
t = swap(t, "blurb: 'A particle box governed by PV = nRT, plus Dalton’s law of partial pressures.',", "blurb: 'Kinetic molecular theory, ideal-gas relationships, PV = nRT, and Dalton’s law of partial pressure.',", 'Unit 7 blurb')
p.write_text(t, encoding='utf-8')


# ------------------------------------------------------------------ completeness checks
checks = {
    'units/07-gas-laws/index.html': ['Call it', 'Your call', 'Make the call', 'Certify', 'vapour', 'analyser'],
    'units/07-gas-laws/js/model.js': ['Temperature IS average kinetic energy', 'heat is speed', 'Nobody rolls a cylinder', 'vapour', 'analyser'],
    'units/07-gas-laws/js/main.js': ["headline: 'Called it'", "state: 'RIGHT CALL'", "state: 'WRONG CALL'", 'vapour miscounted'],
    'units/07-gas-laws/js/art.js': ['IT MIXES ITSELF', 'WHERE IDEAL GIVES OUT', 'VAPOUR CAME FOR FREE', 'ONE CALL'],
    'units/07-gas-laws/js/case.js': ['Gas does not negotiate', 'Boyle owns the ascent', 'exhale continuously']
}
for file, banned in checks.items():
    text = (ROOT / file).read_text(encoding='utf-8')
    for phrase in banned:
        if phrase in text:
            raise SystemExit(f'{file}: old student-facing wording remains: {phrase}')

must = {
    'units/07-gas-laws/js/model.js': ['average translational kinetic energy', 'root-mean-square', 'activity criterion'],
    'units/07-gas-laws/js/main.js': ['simulation reserve points', 'root-mean-square (rms) molecular speed'],
    'units/07-gas-laws/index.html': ['Activity tolerance:', 'Simulated reserve', 'activity criterion'],
    'units/07-gas-laws/js/case.js': ['breathe normally', 'arterial gas embolism', 'model assumptions']
}
for file, required in must.items():
    text = (ROOT / file).read_text(encoding='utf-8')
    for phrase in required:
        if phrase not in text:
            raise SystemExit(f'{file}: required scientific wording missing: {phrase}')

print('Unit 7 refinement script completed successfully.')
