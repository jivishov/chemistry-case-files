// model.js — Unit 5 domain data (The Mole & Chemical Quantities, TEKS C.8).
// Same world, chemistry, and grading spine as units/05-the-mole, plus
// data for four learning mechanics on the dose stages (scaffold-fade ladder,
// gut-check gate, self-explanation, molecular-eyes zoom). Pure data + the standards
// map. All quantitative work (molar mass, percent composition, empirical/combustion
// formulas) lives in shared/js/chem.js; this file only holds the substance pools the
// procedural generators draw from, plus the lab-mechanic copy at the foot.

// Standards map: each C.8 sub-letter drives one stage. The two Honors rows are
// extensions beyond the listed letters (hydrate + combustion) and ride on the
// C.8(D) skill. Stable ids key the mastery meters in the right rail.
export const SE = [
  { id: 'a',  code: 'C.8(A)', mode: 'molg',      honors: false,
    text: 'Define the mole and apply molar mass to convert between moles and grams.' },
  { id: 'b',  code: 'C.8(B)', mode: 'particles', honors: false,
    text: 'Calculate the number of atoms or molecules in a sample using Avogadro’s number.' },
  { id: 'c',  code: 'C.8(C)', mode: 'percent',   honors: false,
    text: 'Calculate the percent composition of compounds.' },
  { id: 'd',  code: 'C.8(D)', mode: 'formula',   honors: false,
    text: 'Differentiate between empirical and molecular formulas.' },
  { id: 'h1', code: 'C.8(D)', mode: 'formula',   honors: true,
    text: 'Honors: determine the formula of a hydrate from the mass of water lost on heating.' },
  { id: 'h2', code: 'C.8(D)', mode: 'formula',   honors: true,
    text: 'Honors: determine an empirical formula from combustion analysis.' }
];

// Substances for the mol <-> g and mol <-> particles converters and the percent
// composition inspector. Every formula parses with the engine’s ATOMIC_MASS table.
export const SUBSTANCES = [
  { f: 'H2O',     name: 'water' },
  { f: 'CO2',     name: 'carbon dioxide' },
  { f: 'O2',      name: 'oxygen gas' },
  { f: 'N2',      name: 'nitrogen gas' },
  { f: 'NaCl',    name: 'sodium chloride' },
  { f: 'NH3',     name: 'ammonia' },
  { f: 'CH4',     name: 'methane' },
  { f: 'C6H12O6', name: 'glucose' },
  { f: 'CaCO3',   name: 'calcium carbonate' },
  { f: 'H2SO4',   name: 'sulfuric acid' },
  { f: 'Fe2O3',   name: 'iron(III) oxide' },
  { f: 'C2H6O',   name: 'ethanol' },
  { f: 'NaHCO3',  name: 'sodium bicarbonate' },
  { f: 'KCl',     name: 'potassium chloride' }
];

// Empirical vs molecular pairs for the formula stage and the capstone. Some pairs
// are identical (n = 1) so the learner sees that empirical can equal molecular.
export const FORMULA_POOL = [
  { molecular: 'C6H12O6', empirical: 'CH2O',  name: 'glucose' },
  { molecular: 'C6H6',    empirical: 'CH',    name: 'benzene' },
  { molecular: 'H2O2',    empirical: 'HO',    name: 'hydrogen peroxide' },
  { molecular: 'C2H4O2',  empirical: 'CH2O',  name: 'acetic acid' },
  { molecular: 'C4H10',   empirical: 'C2H5',  name: 'butane' },
  { molecular: 'N2O4',    empirical: 'NO2',   name: 'dinitrogen tetroxide' },
  { molecular: 'C2H2',    empirical: 'CH',    name: 'acetylene' },
  { molecular: 'C5H10',   empirical: 'CH2',   name: 'cyclopentane' },
  { molecular: 'Fe2O3',   empirical: 'Fe2O3', name: 'iron(III) oxide' },
  { molecular: 'H2O',     empirical: 'H2O',   name: 'water' }
];

// Hydrates for the Honors hydrate stage: x in (anhydrous).xH2O from mass loss.
export const HYDRATES = [
  { anhydrous: 'CuSO4',  x: 5,  name: 'copper(II) sulfate pentahydrate' },
  { anhydrous: 'MgSO4',  x: 7,  name: 'magnesium sulfate heptahydrate (Epsom salt)' },
  { anhydrous: 'CaCl2',  x: 2,  name: 'calcium chloride dihydrate' },
  { anhydrous: 'Na2CO3', x: 10, name: 'sodium carbonate decahydrate (washing soda)' },
  { anhydrous: 'BaCl2',  x: 2,  name: 'barium chloride dihydrate' }
];

// Compounds for the Honors combustion stage. hasO marks the oxygen-bearing ones,
// where the sample mass is given so oxygen is found by difference.
export const COMBUSTION = [
  { molecular: 'CH4',   name: 'methane',  hasO: false },
  { molecular: 'C2H6',  name: 'ethane',   hasO: false },
  { molecular: 'C3H8',  name: 'propane',  hasO: false },
  { molecular: 'C6H6',  name: 'benzene',  hasO: false },
  { molecular: 'C2H6O', name: 'ethanol',  hasO: true },
  { molecular: 'C3H6O', name: 'acetone',  hasO: true }
];

// Spec tolerance for the dose stages. The learner converts the equipment's current
// setting and decides run/hold; the band grades the SETTING against the batch spec
// (an on-spec setting lands within `acceptable`, a mis-set line lands clearly low or
// high). Tight enough that the run/hold call is an unambiguous compare, not a coin flip.
const DOSE_BANDS = { mode: 'relative', ideal: 0.01, acceptable: 0.03 };

// SCENARIOS — the game layer. You are the life-support chemist on the ISV Meridian,
// a crewed ship on the long haul to Mars. Every stage is a survival problem where the
// mole number decides what happens to the four crew. The chemistry tool is unchanged
// (factor-label tiles, steppers); the fiction, the consequences, and the world-state
// (crew safety + ship's log) are what make it a game, not a worksheet.
//   Dose (8A/8B): convert the reading the ship gives you to what the system needs. The
//     band grades YOUR value against the true requirement -> on target (crew safe) vs too
//     little / too much (a named emergency) vs unresolved. icon + state words drive the
//     visual reaction; safe/low/high/fail are the vivid consequence lines.
//   Decision (8C, capstone): per-option { good, consequence } + a system icon.
//   Identity (8D + Honors): the CONSTRUCTED formula/value maps to success/fail.
//   stock: which ship system (air|power|food|hull) this task's result feeds. The Living
//     Ship couples the four stocks, so neglecting a station lets the others drift (main.js
//     recordWorld drifts all four every sol, then applies the result to this stock).
//   constraints: { formula, from, to, element, pool } so the generators apply the picks.
export const SCENARIOS = [
  // ---------- C.8(A) mass <-> mole (life support: convert the reading, then act) ----------
  { id: 'a-oxygen', stage: 'molg', skill: 'a', type: 'dose', stock: 'air',
    system: 'Oxygen supply', icon: '\u{1FAC1}',
    goal: 'The cabin oxygen system needs a specified amount of O2. Convert the required moles to grams before adjusting the supply.',
    why: 'Molar mass links an amount in moles to the mass of oxygen used in this simulation.',
    constraints: { formula: 'O2', from: 'mol', to: 'g' }, bands: DOSE_BANDS,
    actionLabel: 'Submit oxygen amount',
    safeState: 'TARGET MET', lowState: 'BELOW TARGET', highState: 'ABOVE TARGET',
    safe: 'The converted amount meets the activity target.',
    low: 'The amount is below the activity target. Recheck the molar-mass conversion.',
    high: 'The amount is above the activity target. Recheck the molar-mass conversion.',
    fail: 'Complete the conversion before submitting the oxygen amount.' },
  { id: 'a-fuel', stage: 'molg', skill: 'a', type: 'dose', stock: 'power',
    system: 'Methane loading', icon: '\u{1F680}',
    goal: 'A course-correction system specifies methane in moles, but the loading display uses grams. Convert the required amount to mass.',
    why: 'Use the molar mass of CH4 to connect moles of methane with grams of methane.',
    constraints: { formula: 'CH4', from: 'mol', to: 'g' }, bands: DOSE_BANDS,
    actionLabel: 'Submit fuel mass',
    safeState: 'TARGET MET', lowState: 'BELOW TARGET', highState: 'ABOVE TARGET',
    safe: 'The converted mass meets the activity target.',
    low: 'The mass is below the activity target. Recheck the conversion factor.',
    high: 'The mass is above the activity target. Recheck the conversion factor.',
    fail: 'Complete the conversion before submitting the fuel mass.' },
  { id: 'a-scrubber', stage: 'molg', skill: 'a', type: 'dose', stock: 'air',
    system: 'CO2 scrubber log', icon: '\u{1F32B}\u{FE0F}',
    goal: 'A scrubber cartridge contains a measured mass of CO2. Convert the mass to moles for the system log.',
    why: 'This is a grams-to-moles conversion using the molar mass of CO2.',
    constraints: { formula: 'CO2', from: 'g', to: 'mol' }, bands: DOSE_BANDS,
    actionLabel: 'Submit CO2 amount',
    safeState: 'VALUE RECORDED', lowState: 'VALUE LOW', highState: 'VALUE HIGH',
    safe: 'The CO2 amount is recorded using the correct conversion.',
    low: 'The recorded amount is too low for the given mass. Recheck the grams-to-moles conversion.',
    high: 'The recorded amount is too high for the given mass. Recheck the grams-to-moles conversion.',
    fail: 'Complete the conversion before recording the CO2 amount.' },

  // ---------- C.8(B) mole <-> particles (tanks & counts: convert, then act) ----------
  { id: 'b-eva', stage: 'particles', skill: 'b', type: 'dose', stock: 'air',
    system: 'EVA oxygen count', icon: '\u{1F9D1}\u{200D}\u{1F680}',
    goal: 'An EVA oxygen tank is specified in moles, while the monitoring system reports O2 molecules. Convert the amount to molecules.',
    why: 'Avogadro’s number connects moles with the number of molecules.',
    constraints: { formula: 'O2', from: 'mol', to: 'particles' }, bands: DOSE_BANDS,
    actionLabel: 'Submit molecule count',
    safeState: 'COUNT MATCHES', lowState: 'COUNT LOW', highState: 'COUNT HIGH',
    safe: 'The molecule count matches the activity target.',
    low: 'The molecule count is below the target. Recheck the Avogadro-number conversion.',
    high: 'The molecule count is above the target. Recheck the Avogadro-number conversion.',
    fail: 'Complete the conversion before submitting the molecule count.' },
  { id: 'b-ration', stage: 'particles', skill: 'b', type: 'dose', stock: 'food',
    system: 'Glucose inventory', icon: '\u{1F37D}\u{FE0F}',
    goal: 'A glucose sample is recorded in moles, but the inventory log requires molecules. Convert the amount to molecules.',
    why: 'Use Avogadro’s number to convert between moles and molecules of glucose.',
    constraints: { formula: 'C6H12O6', from: 'mol', to: 'particles' }, bands: DOSE_BANDS,
    actionLabel: 'Submit molecule count',
    safeState: 'COUNT RECORDED', lowState: 'COUNT LOW', highState: 'COUNT HIGH',
    safe: 'The molecule count matches the activity target.',
    low: 'The molecule count is below the target. Recheck the conversion.',
    high: 'The molecule count is above the target. Recheck the conversion.',
    fail: 'Complete the conversion before recording the molecule count.' },
  { id: 'b-sample', stage: 'particles', skill: 'b', type: 'dose', stock: 'hull',
    system: 'NaCl sample count', icon: '\u{1FAA8}',
    goal: 'A sodium chloride sample has a measured mass. Convert grams to moles, then moles to formula units.',
    why: 'Ionic compounds are counted in formula units. This two-step conversion uses molar mass and Avogadro’s number.',
    constraints: { formula: 'NaCl', from: 'g', to: 'particles' }, bands: DOSE_BANDS,
    actionLabel: 'Submit formula-unit count',
    safeState: 'COUNT RECORDED', lowState: 'COUNT LOW', highState: 'COUNT HIGH',
    safe: 'The formula-unit count matches the activity target.',
    low: 'The count is below the target. Check both conversion factors and unit cancellation.',
    high: 'The count is above the target. Check both conversion factors and unit cancellation.',
    fail: 'Complete both conversion steps before submitting the formula-unit count.' },

  // ---------- C.8(C) percent composition (purity check: use it or reject it) ----------
  { id: 'c-ore', stage: 'percent', skill: 'c', type: 'decision', stock: 'hull',
    system: 'Hematite composition', icon: '\u{26CF}\u{FE0F}',
    goal: 'A sample is labeled hematite, Fe2O3, with a reported iron percentage. Calculate the theoretical percent iron and compare it with the report.',
    why: 'Percent composition gives the mass percentage of each element in a compound. Use the stated tolerance only as this activity’s comparison criterion.',
    constraints: { formula: 'Fe2O3', element: 'Fe' },
    options: [
      { key: 'accept', label: 'Report is consistent', correct: null,
        good: 'The reported composition meets the activity criterion for Fe2O3.',
        consequence: 'The reported composition falls outside the activity criterion for Fe2O3.' },
      { key: 'reject', label: 'Report is inconsistent', correct: null,
        good: 'The reported composition falls outside the activity criterion for Fe2O3.',
        consequence: 'The reported composition actually meets the activity criterion for Fe2O3.' }
    ] },
  { id: 'c-greenhouse', stage: 'percent', skill: 'c', type: 'decision', stock: 'food',
    system: 'Fertilizer composition', icon: '\u{1F331}',
    goal: 'A fertilizer record lists ammonia, NH3, with a reported nitrogen percentage. Calculate the theoretical percent nitrogen and compare it with the report.',
    why: 'Theoretical percent composition comes from the chemical formula and atomic masses.',
    constraints: { formula: 'NH3', element: 'N' },
    options: [
      { key: 'accept', label: 'Report is consistent', correct: null,
        good: 'The reported composition meets the activity criterion for NH3.',
        consequence: 'The reported composition falls outside the activity criterion for NH3.' },
      { key: 'reject', label: 'Report is inconsistent', correct: null,
        good: 'The reported composition falls outside the activity criterion for NH3.',
        consequence: 'The reported composition actually meets the activity criterion for NH3.' }
    ] },
  { id: 'c-fuelpurity', stage: 'percent', skill: 'c', type: 'decision', stock: 'power',
    system: 'Methane composition', icon: '\u{1F6F0}\u{FE0F}',
    goal: 'A fuel record lists methane, CH4, with a reported carbon percentage. Calculate the theoretical percent carbon and compare it with the report.',
    why: 'Agreement in one elemental percentage can support consistency with the formula, but it does not by itself prove purity or identity.',
    constraints: { formula: 'CH4', element: 'C' },
    options: [
      { key: 'accept', label: 'Report is consistent', correct: null,
        good: 'The reported composition meets the activity criterion for CH4.',
        consequence: 'The reported composition falls outside the activity criterion for CH4.' },
      { key: 'reject', label: 'Report is inconsistent', correct: null,
        good: 'The reported composition falls outside the activity criterion for CH4.',
        consequence: 'The reported composition actually meets the activity criterion for CH4.' }
    ] },

  // ---------- C.8(D) empirical / molecular (mystery ID: build the formula) ----------
  { id: 'd-leak', stage: 'formula', skill: 'd', type: 'identity', stock: 'air',
    system: 'Unknown gas sample', icon: '\u{2622}\u{FE0F}',
    goal: 'Use the element masses to find the empirical formula, then use molar mass to find the molecular formula. Compare the result with the activity’s reference candidates.',
    why: 'An empirical formula gives the simplest whole-number ratio. The molecular formula is a whole-number multiple of that ratio.',
    constraints: { pool: ['dinitrogen tetroxide', 'benzene', 'acetylene'] },
    success: 'The formula matches one of the reference candidates.',
    fail: 'The formula does not match the data. Recheck the mole ratios and molecular-formula multiplier.' },
  { id: 'd-surface', stage: 'formula', skill: 'd', type: 'identity', stock: 'food',
    system: 'Unknown solid sample', icon: '\u{1F52C}',
    goal: 'Use the element masses to determine the empirical and molecular formulas, then compare the result with the provided candidates.',
    why: 'Formula data can distinguish among the candidates in this activity; a formula alone does not uniquely identify every possible substance.',
    constraints: { pool: ['glucose', 'water', 'hydrogen peroxide'] },
    success: 'The formula matches one of the reference candidates.',
    fail: 'The formula does not match the data. Recheck the mole ratios and multiplier.' },
  { id: 'd-coolant', stage: 'formula', skill: 'd', type: 'identity', stock: 'power',
    system: 'Unknown fluid sample', icon: '\u{1F4A7}',
    goal: 'Use the element masses and molar mass to determine the molecular formula, then compare it with the provided candidates.',
    why: 'Use the empirical ratio first, then the molar-mass multiplier. The comparison is limited to the activity’s reference candidates.',
    constraints: { pool: ['butane', 'cyclopentane', 'acetic acid'] },
    success: 'The formula matches one of the reference candidates.',
    fail: 'The formula does not match the data. Recheck the empirical formula and multiplier.' },

  // ---------- Honors: water reclaim (identity: constructed x) ----------
  { id: 'h1-desiccant', stage: 'formula', skill: 'h1', type: 'identity', stock: 'food',
    system: 'Hydrate analysis', icon: '\u{1F4A7}',
    goal: 'A hydrate is heated to remove water. Use the hydrate mass and dry-salt mass to determine x in the hydrate formula.',
    why: 'Compare moles of water lost with moles of anhydrous salt to find the whole-number hydrate ratio.',
    success: 'Your value of x matches the mass data.',
    fail: 'The value of x does not match the mass data. Recalculate moles of water and anhydrous salt.' },

  // ---------- Honors: fire forensics (identity: constructed formula) ----------
  { id: 'h2-arson', stage: 'formula', skill: 'h2', type: 'identity', stock: 'hull',
    system: 'Combustion analysis', icon: '\u{1F525}',
    goal: 'Use the masses of CO2 and H2O produced by complete combustion to determine the empirical formula of the sample.',
    why: 'CO2 gives the amount of carbon, H2O gives the amount of hydrogen, and oxygen can be found by mass difference when the sample contains only C, H, and O.',
    success: 'Your empirical formula matches the combustion data.',
    fail: 'The empirical formula does not match the combustion data. Recheck the mole amounts and whole-number ratio.' },

  // ---------- Capstone (connected: identify + purity, then approve / quarantine / reject) ----------
  { id: 'cap-pod', stage: 'capstone', skill: 'cap', type: 'decision', stock: 'food',
    system: 'Resupply analysis', icon: '\u{1F4E6}',
    goal: 'Use element masses and molar mass to determine the compound, then compare a reported elemental percentage with the theoretical composition.',
    why: 'The final decision uses two pieces of evidence: formula consistency and the activity’s composition criterion.',
    options: [
      { key: 'approve', label: 'Accept the pod', correct: null,
        good: 'The formula matches the manifest and the reported composition meets the activity criterion.',
        consequence: 'The evidence does not support accepting the pod under the activity rules.' },
      { key: 'quarantine', label: 'Hold for recheck', correct: null,
        good: 'The formula matches the manifest, but the reported composition falls outside the activity criterion.',
        consequence: 'The evidence does not support holding the pod for this reason under the activity rules.' },
      { key: 'reject', label: 'Reject the pod', correct: null,
        good: 'The formula does not match the manifest, so the activity rules require rejection.',
        consequence: 'The formula matches the manifest, so rejection is not supported by the activity evidence.' }
    ] }
];

// ============================= Lab mechanics =============================
// New data only; no shared file is touched. These drive the four Tier-1 learning
// mechanics layered onto the two dose stages (and the ungraded zoom tab).

// Mechanic A (rung 3 SOLVE): a typed answer is graded with a relative band so that
// sensible 3-sig-fig rounding still reads on target. Looser than DOSE_BANDS because a
// hand-typed number carries rounding the tile chain never introduced.
export const TYPED_BANDS = { mode: 'relative', ideal: 0.005, acceptable: 0.02 };

// Mechanic C (self-explanation on a miss): rule-detected misconception -> { label, fix }.
// Plain teen language, no jargon. The detector (in main.js) returns one of these keys;
// the panel shows the matched label among distractors, then reveals the fix.
//
// Tier 2: the three NUMERIC slips (wrongMass, decade, noConvert) also carry `coach` and
// `aiClaim`. `coach` is the line ARI (the ship's junior AI) adds to the verdict when the
// slip recurs; `aiClaim` is what ARI confidently asserts while making that same slip in
// the audit that follows. flipped/generic stay one-shot (no audit) and need neither.
export const MISCONCEPTIONS = {
  flipped:   { label: 'I inverted the conversion factor',
    fix: 'Place the starting unit in the denominator so it cancels.' },
  wrongUnit: { label: 'I ended with the wrong unit',
    fix: 'After cancellation, the remaining unit must match the unit requested in the problem.' },
  noConvert: { label: 'I did not apply the conversion factor',
    fix: 'Your result is nearly the starting number. Multiply by the correct conversion factor to change units.',
    coach: 'This error has appeared more than once. On the next example, evaluate ARI’s solution and check whether a conversion was actually performed.',
    aiClaim: 'The starting value is close to the requested value, so I kept the same number.' },
  wrongMass: { label: 'I used the wrong molar mass',
    fix: 'Use the molar mass of the substance named in the problem.',
    coach: 'This error has appeared more than once. On the next example, check which substance ARI uses to choose the molar mass.',
    aiClaim: 'I selected a molar mass from the reference information and applied it to the conversion.' },
  decade:    { label: 'I misplaced a power of ten',
    fix: 'Recheck the exponent and scientific-notation arithmetic, especially when using Avogadro’s number.',
    coach: 'This error has appeared more than once. On the next example, check ARI’s exponent before accepting the result.',
    aiClaim: 'The units cancel, and I completed the scientific-notation arithmetic mentally.' },
  generic:   { label: 'I made an error in the setup or arithmetic',
    fix: 'Check each conversion factor, unit cancellation, and numerical operation in order.' }
};

// Tier 2 framing: ARI is the ship's junior AI. On a recurring numeric slip it runs the
// next job AND repeats that same slip, so the learner audits its work. Catching your own
// mistake in someone else's solution is the metacognitive flip the audit is built around.
export const ARI_INTRO = 'ARI produced a sample solution. Evaluate the calculation before accepting it. The solution may contain a common conversion error.';

// Mechanic D (molecular-eyes zoom) has no data here on purpose. The slider, its hex dot
// field and its milestone analogies all live in shared/js/molezoom.js, which Unit 5 and
// the lab build already share and which is node-tested (tests/molezoom.test.js). A local
// ZOOM_ANALOGIES copy used to sit at the foot of this file; it was the same six lines
// molezoom.js exports, so it could only ever drift out of step with the tool drawing them.
