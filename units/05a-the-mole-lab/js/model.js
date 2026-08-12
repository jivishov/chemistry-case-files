// model.js — Unit 5A domain data (The Mole, Lab Build, TEKS C.8).
// Reasoning-first fork of Unit 5: same world, chemistry, and grading spine, plus
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
    goal: 'The crew has been breathing all day and the cabin O2 is dropping. Resupply exactly what they used from the tanks.',
    why: 'Too little oxygen and the crew gets dizzy and slow. Too much and one spark turns the cabin into a fireball.',
    constraints: { formula: 'O2', from: 'mol', to: 'g' }, bands: DOSE_BANDS,
    actionLabel: 'Release the oxygen',
    safeState: 'AIR CLEAR', lowState: 'AIR THINNING', highState: 'FIRE RISK',
    safe: 'Fresh oxygen floods the cabin and the crew breathes easy.',
    low: 'The cabin air goes thin. The crew gets lightheaded and starts making mistakes.',
    high: 'The cabin runs oxygen-rich and the fire alarm trips. One spark could end the mission.',
    fail: 'The numbers never resolved, so the valve stays shut and the air keeps thinning.' },
  { id: 'a-fuel', stage: 'molg', skill: 'a', type: 'dose', stock: 'power',
    system: 'Course-correction burn', icon: '\u{1F680}',
    goal: 'Mars has drifted off the crosshairs. The burn needs a set amount of methane fuel. Load the right mass into the thruster.',
    why: 'Under-fuel the burn and the ship drifts off course. Over-fuel it and you overshoot the whole planet.',
    constraints: { formula: 'CH4', from: 'mol', to: 'g' }, bands: DOSE_BANDS,
    actionLabel: 'Fire the thruster',
    safeState: 'ON COURSE', lowState: 'DRIFTING', highState: 'OVERSHOOT',
    safe: 'The thruster fires clean and the ship locks back onto its track to Mars.',
    low: 'The burn comes up short. The ship drifts off course and the next window slips away.',
    high: 'The burn runs long. The ship overshoots and now you are racing past your target.',
    fail: 'The fuel load never resolved, so the burn window passes with the thruster cold.' },
  { id: 'a-scrubber', stage: 'molg', skill: 'a', type: 'dose', stock: 'air',
    system: 'CO2 scrubber', icon: '\u{1F32B}\u{FE0F}',
    goal: 'The spent scrubber cartridge holds a known mass of trapped CO2. Convert it to moles so the recycler knows how much to vent.',
    why: 'Log too few moles and CO2 lingers and headaches start. Log too many and the recycler strips the air dry.',
    constraints: { formula: 'CO2', from: 'g', to: 'mol' }, bands: DOSE_BANDS,
    actionLabel: 'Log it to the recycler',
    safeState: 'AIR BALANCED', lowState: 'CO2 LINGERS', highState: 'OVER-SCRUBBED',
    safe: 'The recycler rebalances the cabin and the CO2 readout settles to green.',
    low: 'The log under-counts the CO2, so it lingers and the crew starts getting headaches.',
    high: 'The log over-counts, the recycler over-vents, and the cabin air comes out stale and dry.',
    fail: 'The cartridge never resolved to moles, so the recycler has nothing to act on.' },

  // ---------- C.8(B) mole <-> particles (tanks & counts: convert, then act) ----------
  { id: 'b-eva', stage: 'particles', skill: 'b', type: 'dose', stock: 'air',
    system: 'EVA suit tank', icon: '\u{1F9D1}\u{200D}\u{1F680}',
    goal: 'Vega is about to spacewalk. The suit tank gauge reads in O2 molecules, but the dispenser fills in moles. Convert the fill to molecules to check the tank holds enough.',
    why: 'Short the tank and Vega runs out of air halfway across the hull. Overfill and the suit is too heavy to move in.',
    constraints: { formula: 'O2', from: 'mol', to: 'particles' }, bands: DOSE_BANDS,
    actionLabel: 'Send Vega out',
    safeState: 'EVA GO', lowState: 'AIR OUT', highState: 'TANK HEAVY',
    safe: 'Vega finishes the repair and climbs back through the airlock with air to spare.',
    low: 'Vega is halfway across the hull when the tank runs dry and has to scramble back, gasping.',
    high: 'The tank is so overfilled the suit can barely move, and Vega aborts the spacewalk.',
    fail: 'The tank fill never resolved to molecules, so Vega waits at the airlock, unable to launch.' },
  { id: 'b-ration', stage: 'particles', skill: 'b', type: 'dose', stock: 'food',
    system: 'Food printer', icon: '\u{1F37D}\u{FE0F}',
    goal: 'The food printer doses glucose in moles, but the nutrition log tracks it in molecules. Convert the day’s ration to representative units for the log.',
    why: 'Log too few and the crew is rationed and hungry. Log too many and the printer burns through stores too fast.',
    constraints: { formula: 'C6H12O6', from: 'mol', to: 'particles' }, bands: DOSE_BANDS,
    actionLabel: 'Print the rations',
    safeState: 'CREW FED', lowState: 'RATIONED', highState: 'STORES SHORT',
    safe: 'The printer plates a full day of meals and the crew eats well.',
    low: 'The log comes up short, the printer rations the crew, and morale drops.',
    high: 'The log runs high and the printer over-serves, burning through the food stores early.',
    fail: 'The ration never resolved to units, so the printer holds and the galley stays dark.' },
  { id: 'b-sample', stage: 'particles', skill: 'b', type: 'dose', stock: 'hull',
    system: 'Surface sample', icon: '\u{1FAA8}',
    goal: 'The rover scooped a salt sample of a known mass off the surface. Convert its grams to formula units (grams to moles to units) so mission control can log the find.',
    why: 'A miscounted sample throws off the whole survey, and the next dig site gets chosen on bad data.',
    constraints: { formula: 'NaCl', from: 'g', to: 'particles' }, bands: DOSE_BANDS,
    actionLabel: 'Log the find',
    safeState: 'LOGGED', lowState: 'UNDERCOUNTED', highState: 'OVERCOUNTED',
    safe: 'The count matches the scoop and mission control marks the site as promising.',
    low: 'The count comes up short, so the survey writes the site off and the rover rolls on.',
    high: 'The count runs high, so the survey over-hypes a thin site and the next dig wastes a sol.',
    fail: 'The sample never resolved to units, so the find cannot be logged at all.' },

  // ---------- C.8(C) percent composition (purity check: use it or reject it) ----------
  { id: 'c-ore', stage: 'percent', skill: 'c', type: 'decision', stock: 'hull',
    system: 'Hull-patch foundry', icon: '\u{26CF}\u{FE0F}',
    goal: 'A micrometeor cracked the hull. The rover found a rust-colored rock that might be iron ore. Work out its percent iron, then decide if it is rich enough to smelt into a patch.',
    why: 'A hull breach is a slow leak you cannot ignore. But firing up the foundry on poor ore wastes power the ship cannot spare.',
    constraints: { formula: 'Fe2O3', element: 'Fe' },
    options: [
      { key: 'accept', label: 'Smelt it into a patch', correct: null,
        good: 'The ore is iron-rich, the foundry pours a solid patch, and the hull seals.',
        consequence: 'You smelt poor ore, burn the power, and the patch is too thin to hold. The leak keeps hissing.' },
      { key: 'reject', label: 'Keep looking', correct: null,
        good: 'You skip the poor rock and the rover finds a richer vein before the air gets low.',
        consequence: 'You walked away from good ore. The breach widens while the rover hunts for nothing.' }
    ] },
  { id: 'c-greenhouse', stage: 'percent', skill: 'c', type: 'decision', stock: 'food',
    system: 'Greenhouse', icon: '\u{1F331}',
    goal: 'The space-potato greenhouse is the crew’s backup food. A fertilizer canister claims a nitrogen grade. Compute the real percent nitrogen and decide whether to feed it to the crops.',
    why: 'Get the nitrogen right and the potatoes thrive. Feed the wrong grade and you starve or burn the only crop aboard.',
    constraints: { formula: 'NH3', element: 'N' },
    options: [
      { key: 'accept', label: 'Feed the crops', correct: null,
        good: 'The grade checks out, the potatoes green up, and the backup harvest is safe.',
        consequence: 'You feed the wrong grade. The crop yellows and wilts, and the backup food is gone.' },
      { key: 'reject', label: 'Hold the canister', correct: null,
        good: 'You hold a mislabeled canister before it can touch the only crop aboard.',
        consequence: 'You held a good batch and the crops miss a feeding, slowing the harvest the crew is counting on.' }
    ] },
  { id: 'c-fuelpurity', stage: 'percent', skill: 'c', type: 'decision', stock: 'power',
    system: 'Fuel intake', icon: '\u{1F6F0}\u{FE0F}',
    goal: 'A fuel pod docked with a batch labeled as pure methane. Compute the real percent carbon and decide whether to load it into the thruster.',
    why: 'Clean fuel burns true. Contaminated fuel knocks the engine and can crack a line on the next burn.',
    constraints: { formula: 'CH4', element: 'C' },
    options: [
      { key: 'accept', label: 'Load the fuel', correct: null,
        good: 'The batch is clean methane, the tanks top off, and the next burn is ready.',
        consequence: 'You load off-spec fuel. The engine knocks on the next burn and a fuel line hairlines.' },
      { key: 'reject', label: 'Reject the pod', correct: null,
        good: 'You bounce a contaminated pod before it can reach the engine.',
        consequence: 'You reject a clean batch and the tanks run low with a burn still ahead.' }
    ] },

  // ---------- C.8(D) empirical / molecular (mystery ID: build the formula) ----------
  { id: 'd-leak', stage: 'formula', skill: 'd', type: 'identity', stock: 'air',
    system: 'Cabin leak', icon: '\u{2622}\u{FE0F}',
    goal: 'A sensor caught an unknown gas seeping into the cabin. The lab gives you its element masses and molar mass. Build the empirical formula, then scale it to the molecular formula to identify the gas.',
    why: 'If it is a toxic oxidizer you seal and vent the deck now. Name it wrong and you either gas the crew or evacuate a deck for nothing.',
    constraints: { pool: ['dinitrogen tetroxide', 'benzene', 'acetylene'] },
    success: 'identified, so the right response kicks in and the crew stays safe.',
    fail: 'The formula matches nothing on file, so the leak goes unhandled while the gas keeps seeping in.' },
  { id: 'd-surface', stage: 'formula', skill: 'd', type: 'identity', stock: 'food',
    system: 'Surface find', icon: '\u{1F52C}',
    goal: 'The rover drilled up an unknown solid. From its element masses and molar mass, build the empirical then molecular formula to identify what it found.',
    why: 'Is it water ice the crew can use, a sign of life worth reporting, or a reactive hazard to keep sealed? The formula decides how it is handled.',
    constraints: { pool: ['glucose', 'water', 'hydrogen peroxide'] },
    success: 'identified, so it is stored and reported correctly.',
    fail: 'The formula does not match, so the find is logged wrong and either wasted or mishandled.' },
  { id: 'd-coolant', stage: 'formula', skill: 'd', type: 'identity', stock: 'power',
    system: 'Coolant loop', icon: '\u{1F4A7}',
    goal: 'Something is leaking from the cooling loop. The lab hands you element masses and a molar mass. Build the formula to identify the fluid before it pools near the electronics.',
    why: 'A flammable leak near live circuits is a fire waiting to happen. The formula tells you whether to vent, contain, or mop it up.',
    constraints: { pool: ['butane', 'cyclopentane', 'acetic acid'] },
    success: 'identified, so it is contained the right way before it reaches the boards.',
    fail: 'The formula is wrong, so the leak is handled wrong and pools where it should not.' },

  // ---------- Honors: water reclaim (identity: constructed x) ----------
  { id: 'h1-desiccant', stage: 'formula', skill: 'h1', type: 'identity', stock: 'food',
    system: 'Water reclaim', icon: '\u{1F4A7}',
    goal: 'Water is precious out here. The dehumidifier crystals trapped cabin moisture. From the mass of water driven off on heating, work out x in the hydrate so the reclaim oven is set right.',
    why: 'Set x right and you recover every drop for the crew. Wrong and you bake the crystals dry or leave the water locked inside.',
    success: 'The oven drives off exactly the bound water and the crew’s tanks top back up.',
    fail: 'The setpoint is off, so the crystals come out half-wet and the reclaimed water is lost.' },

  // ---------- Honors: fire forensics (identity: constructed formula) ----------
  { id: 'h2-arson', stage: 'formula', skill: 'h2', type: 'identity', stock: 'hull',
    system: 'Fire forensics', icon: '\u{1F525}',
    goal: 'A flash fire scorched a panel and left soot. From the CO2 and water it gave off, build the empirical formula of whatever burned so you can set the right suppression protocol.',
    why: 'Knowing the fuel tells you how to fight a re-flash. Guess wrong and the next flare-up catches you with the wrong extinguisher.',
    success: 'The formula matches a known fuel, so the right fire protocol is locked in.',
    fail: 'The formula matches nothing, so the fuel stays unknown and the next flare-up is a gamble.' },

  // ---------- Capstone (connected: identify + purity, then approve / quarantine / reject) ----------
  { id: 'cap-pod', stage: 'capstone', skill: 'cap', type: 'decision', stock: 'food',
    system: 'Resupply pod', icon: '\u{1F4E6}',
    goal: 'A resupply pod docked with its label scuffed off. Identify the compound from its element masses, check its purity against the manifest, then decide what to do with it.',
    why: 'Bring aboard the wrong thing and you contaminate the ship. Jettison good supplies and the crew goes without on the long haul.',
    options: [
      { key: 'approve', label: 'Bring it aboard', correct: null,
        good: 'The pod matches its manifest and meets purity, so the supplies come aboard and the stores top up.',
        consequence: 'You bring aboard a pod that should not have passed, and it contaminates the ship’s stores.' },
      { key: 'quarantine', label: 'Quarantine it', correct: null,
        good: 'The contents check out but the purity falls short, so you hold the pod in the airlock for a re-test.',
        consequence: 'You quarantine a pod when the call was clear, leaving the crew short while it sits, or letting a mislabeled pod linger instead of jettisoning it.' },
      { key: 'reject', label: 'Jettison it', correct: null,
        good: 'The contents do not match the manifest, so you jettison the pod before it can foul the ship.',
        consequence: 'You jettison a good pod, and the crew loses supplies they needed on a one-way trip.' }
    ] }
];

// ============================ Unit 5A lab mechanics ============================
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
  flipped:   { label: 'I flipped the factor upside down',
    fix: 'The unit you start with goes on the bottom so it cancels out.' },
  noConvert: { label: 'I never actually converted',
    fix: 'My answer is basically the number I started with. Multiply by the factor to change the unit.',
    coach: 'ARI here. Twice now the answer has come out as the same number you started with. Let me take the next one, and you check that I actually convert it.',
    aiClaim: 'Quick one. The gauge basically reads in the units we need already, so this is as good as done.' },
  wrongMass: { label: 'I used the wrong molar mass',
    fix: 'I grabbed a mass from a different substance. Use the molar mass of the one in the problem.',
    coach: 'ARI here. That is the second time the wrong molar mass has slipped in. Let me run the next one so you can check my factor.',
    aiClaim: 'I pulled the molar mass straight off the substance card, so the factor should be locked in.' },
  decade:    { label: 'I was off by a power of ten',
    fix: 'Right idea, wrong size by ten or more. Recount the zeros, or whether Avogadro belongs in there.',
    coach: 'ARI here. Twice now the answer has landed a power of ten off. The next one is mine, and your job is to audit the size of it.',
    aiClaim: 'Chain is built and the units cancel clean. I kept the powers of ten in my head, so the size should be right.' },
  generic:   { label: 'Something in my steps was off',
    fix: 'Walk back through each factor and check the units cancel and the numbers are right.' }
};

// Tier 2 framing: ARI is the ship's junior AI. On a recurring numeric slip it runs the
// next job AND repeats that same slip, so the learner audits its work. Catching your own
// mistake in someone else's solution is the metacognitive flip the audit is built around.
export const ARI_INTRO = "ARI, the ship's junior AI, ran this job while you were off shift. It is still learning, and it picks up your habits, slips and all. Check its work before the number goes live.";

