// model.js: Unit 8 domain data (Solutions & Solubility, TEKS C.11). Pure data +
// the standards map. All quantitative work (molarity, dilution, the solubility-rules
// predictor + ion data) lives in shared/js/chem.js; this file holds the curated pools
// the procedural generators draw from and the solubility-curve data.

// Standards map: each C.11 sub-letter drives one stage. The two Honors rows are
// extensions beyond the listed letters (common-ion / Ksp-lite, crystallization) and
// ride on the C.11(D) and C.11(C) skills. Stable ids key the mastery meters.
export const SE = [
  { id: 'a', code: 'C.11(A)', mode: 'dissolve', honors: false,
    text: 'Describe the unique role of water as a polar solvent ("like dissolves like").' },
  { id: 'b', code: 'C.11(B)', mode: 'types', honors: false,
    text: 'Distinguish unsaturated, saturated, and supersaturated solutions and electrolytes from nonelectrolytes.' },
  { id: 'c', code: 'C.11(C)', mode: 'curve', honors: false,
    text: 'Read solubility curves vs temperature and relate dissolution rate to temperature, agitation, and surface area.' },
  { id: 'd', code: 'C.11(D)', mode: 'precip', honors: false,
    text: 'Apply the general solubility rules to predict the precipitate of a double-replacement reaction.' },
  { id: 'e', code: 'C.11(E)', mode: 'molarity', honors: false,
    text: 'Calculate the concentration of a solution in units of molarity.' },
  { id: 'f', code: 'C.11(F)', mode: 'dilute', honors: false,
    text: 'Calculate dilutions of solutions using molarity (C1V1 = C2V2).' },
  { id: 'h1', code: 'C.11(D)', mode: 'precip', honors: true,
    text: 'Honors: use Ksp and the common-ion effect to decide whether a precipitate forms.' },
  { id: 'h2', code: 'C.11(C)', mode: 'curve', honors: true,
    text: 'Honors: quantify how much solid crystallizes when a saturated solution is cooled.' }
];

// ===== C.11(A) "why it dissolves" pool (conceptual, rotating) =====
// kind drives both the justification ("like dissolves like") and whether water (a
// polar solvent) dissolves it: ionic + polar dissolve, nonpolar does not. These are
// clear-cut cases on purpose; insoluble ionic salts are handled later by C.11(D).
// `where` is additive: the everyday or plant setting the solute actually turns up in,
// so a brief can name a real place instead of presenting a bare formula.
export const POLARITY_POOL = [
  { name: 'sodium chloride',      formula: 'NaCl',         kind: 'ionic',    dissolves: true,
    where: 'the softener brine tank, and the shaker on the break-room table' },
  { name: 'potassium iodide',     formula: 'KI',           kind: 'ionic',    dissolves: true,
    where: 'the iodide reagent bottle on the bench, and iodised salt' },
  { name: 'lithium bromide',      formula: 'LiBr',         kind: 'ionic',    dissolves: true,
    where: 'the desiccant loop in the plant chiller' },
  { name: 'table sugar (sucrose)', formula: 'C12H22O11',   kind: 'polar',    dissolves: true,
    where: 'the glass of iced tea somebody left on the console' },
  { name: 'ethanol',              formula: 'C2H6O',        kind: 'polar',    dissolves: true,
    where: 'the wipe-down bottle beside the glassware sink' },
  { name: 'methanol',             formula: 'CH4O',         kind: 'polar',    dissolves: true,
    where: 'the carrier solvent in the standards fridge' },
  { name: 'ammonia',              formula: 'NH3',          kind: 'polar',    dissolves: true,
    where: 'the chloramine feed, and the bottle under the kitchen sink' },
  { name: 'benzene',              formula: 'C6H6',         kind: 'nonpolar', dissolves: false,
    where: 'the fuel sheen the sampler pulled off the raw-water intake' },
  { name: 'octane (gasoline)',    formula: 'C8H18',        kind: 'nonpolar', dissolves: false,
    where: 'the generator jerrycan in the maintenance shed' },
  { name: 'hexane',               formula: 'C6H14',        kind: 'nonpolar', dissolves: false,
    where: 'the degreaser tin on the shed shelf' },
  { name: 'iodine',               formula: 'I2',           kind: 'nonpolar', dissolves: false,
    where: 'the stain in the bottom of an old titration flask' },
  { name: 'carbon tetrachloride', formula: 'CCl4',         kind: 'nonpolar', dissolves: false,
    where: 'the legacy solvent drum nobody is allowed to open any more' }
];

export const KIND_LABEL = {
  ionic: 'Ionic',
  polar: 'Polar covalent',
  nonpolar: 'Nonpolar covalent'
};

// ===== C.11(B) solution-type pool (generated saturation + electrolyte class) =====
// s = approximate solubility (g per 100 g water at 20 degC). electrolyte marks salts
// (and strong acids); molecular solutes like sugar are nonelectrolytes.
export const TYPES_POOL = [
  { name: 'potassium nitrate',     formula: 'KNO3',      s: 32,  electrolyte: true,
    where: 'the nitrate standard made up for the ion meter' },
  { name: 'sodium chloride',       formula: 'NaCl',      s: 36,  electrolyte: true,
    where: 'the road salt on the driveway, and the softener brine' },
  { name: 'potassium chloride',    formula: 'KCl',       s: 34,  electrolyte: true,
    where: 'the salt-substitute shaker, and the meter fill solution' },
  { name: 'ammonium chloride',     formula: 'NH4Cl',     s: 37,  electrolyte: true,
    where: 'the ammonia standard for the chloramine check' },
  { name: 'sodium nitrate',        formula: 'NaNO3',     s: 88,  electrolyte: true,
    where: 'the fertiliser bag in the shed behind the plant' },
  { name: 'table sugar (sucrose)', formula: 'C12H22O11', s: 204, electrolyte: false,
    where: 'the jar of honey in the break room, and the iced tea' },
  { name: 'glucose',               formula: 'C6H12O6',   s: 91,  electrolyte: false,
    where: 'the sports-drink powder in somebody\'s locker' },
  { name: 'urea',                  formula: 'CH4N2O',    s: 108, electrolyte: false,
    where: 'the lawn feed the operator keeps by the loading door' }
];

// ===== C.11(C) solubility curves (g solute per 100 g water vs degC) =====
// Classic solubility-curve data on a 0..100 degC grid (step 10). All solids whose
// solubility rises with temperature; the gas case is covered by a curve note below.
export const SOLUBILITY_CURVES = [
  { key: 'KNO3',  name: 'potassium nitrate',  color: '#2a7d8a',
    pts: [13, 21, 32, 46, 64, 85, 110, 138, 169, 202, 246] },
  { key: 'NaNO3', name: 'sodium nitrate',     color: '#b4471f',
    pts: [73, 80, 88, 96, 104, 114, 124, 138, 148, 162, 180] },
  { key: 'NH4Cl', name: 'ammonium chloride',  color: '#6a8f2f',
    pts: [29, 33, 37, 41, 46, 50, 55, 60, 66, 71, 77] },
  { key: 'KCl',   name: 'potassium chloride', color: '#7a5bb0',
    pts: [28, 31, 34, 37, 40, 43, 46, 48, 51, 54, 56] },
  { key: 'NaCl',  name: 'sodium chloride',    color: '#3b6ea5',
    pts: [36, 36, 36, 37, 37, 37, 37, 38, 38, 39, 39] },
  { key: 'KClO3', name: 'potassium chlorate', color: '#c0772f',
    pts: [3, 5, 7, 10, 14, 19, 24, 30, 38, 46, 57] }
];

// Grid temperatures matching each pts index above.
export const CURVE_TEMPS = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

// ===== C.11(C) dissolution-rate factors (qualitative, rotating) =====
// faster = does this change speed dissolving up? The three TEKS levers are
// temperature, agitation, and surface area.
export const RATE_FACTORS = [
  { change: 'Warming the water', faster: true,
    why: 'Higher temperature gives particles more kinetic energy, so they strike and break off the solid more often.' },
  { change: 'Stirring the mixture', faster: true,
    why: 'Agitation sweeps dissolved particles away from the surface, keeping fresh solvent in contact with the solid.' },
  { change: 'Grinding the solid into a fine powder', faster: true,
    why: 'A powder exposes far more surface area to the solvent than one large lump.' },
  { change: 'Chilling the water', faster: false,
    why: 'Lower temperature slows particle motion, so the solid dissolves more slowly.' },
  { change: 'Using one large crystal instead of powder', faster: false,
    why: 'A single crystal has little surface area, so dissolving is slow.' },
  { change: 'Letting the beaker sit undisturbed', faster: false,
    why: 'Without agitation the solvent next to the solid saturates locally and dissolving stalls.' }
];

// ===== C.11(D) precipitation generator ion keys (core; copper excluded, Honors-only) =====
export const CORE_CATIONS = ['Li', 'Na', 'K', 'NH4', 'Ag', 'Mg', 'Ca', 'Ba', 'Zn', 'Fe2', 'Pb', 'Al', 'Fe3'];
export const CORE_ANIONS = ['NO3', 'ClO3', 'C2H3O2', 'Cl', 'Br', 'I', 'OH', 'SO4', 'CO3', 'S', 'PO4'];

// ===== C.11(E) molarity solutes (all parse with the engine's ATOMIC_MASS table) =====
// Potassium permanganate is the one this plant's whole week turns on: it is what oxidises
// the manganese so the filters can catch it, and it is what the `e-permang` scenario is
// about. Added rather than approximated, because a brief must not name a chemical the
// stage never presents. Re-measured after adding it: sorted, the pool now runs 40.00,
// 58.44, 74.55, 101.10, 105.99, 110.98, 120.36, 158.03, 180.16 g/mol and the smallest
// adjacent gap is still 4.71 percent (Na2CO3 against CaCl2), so section 5's derivation of
// the 2 percent acceptable window is unchanged.
export const MOLARITY_SOLUTES = [
  { name: 'potassium permanganate', formula: 'KMnO4', where: 'the oxidant feed that is the only reason the filters catch manganese' },
  { name: 'sodium chloride',    formula: 'NaCl',    where: 'the conductivity standard for the bench meter' },
  { name: 'potassium nitrate',  formula: 'KNO3',    where: 'the nitrate standard the state lab asks for' },
  { name: 'calcium chloride',   formula: 'CaCl2',   where: 'the hardness standard for the jar tests' },
  { name: 'sodium hydroxide',   formula: 'NaOH',    where: 'the caustic that trims the pH before the filters' },
  { name: 'potassium chloride', formula: 'KCl',     where: 'the fill solution for the pH probe' },
  { name: 'magnesium sulfate',  formula: 'MgSO4',   where: 'the Epsom salt used to spike a hardness blank' },
  { name: 'sodium carbonate',   formula: 'Na2CO3',  where: 'the soda ash that lifts alkalinity in the basin' },
  { name: 'glucose',            formula: 'C6H12O6', where: 'the carbon feed for the biological filter trial' }
];

// ===== C.11(F) dilution stock concentrations (M) =====
export const DILUTION_STOCKS = [
  { name: 'hydrochloric acid', formula: 'HCl',    c1: 12, where: 'the acid used to pre-wash sample bottles' },
  { name: 'sulfuric acid',     formula: 'H2SO4',  c1: 18, where: 'the preservative that goes into every nutrient sample' },
  { name: 'sodium hydroxide',  formula: 'NaOH',   c1: 6,  where: 'the titrant for the alkalinity run' },
  { name: 'acetic acid',       formula: 'C2H4O2', c1: 17, where: 'the buffer stock for the colour test' },
  { name: 'nitric acid',       formula: 'HNO3',   c1: 16, where: 'the acid the metals samples are digested in' }
];

// ===== Honors (h1): common-ion / Ksp-lite. 1:1 salts so molar solubility = sqrt(Ksp). =====
export const KSP_SALTS = [
  { formula: 'AgCl',  cation: 'Ag+',   anion: 'Cl-',    ksp: 1.8e-10 },
  { formula: 'AgBr',  cation: 'Ag+',   anion: 'Br-',    ksp: 5.4e-13 },
  { formula: 'BaSO4', cation: 'Ba^2+', anion: 'SO4^2-', ksp: 1.1e-10 },
  { formula: 'PbSO4', cation: 'Pb^2+', anion: 'SO4^2-', ksp: 2.5e-8 }
];

// ===== Dose bands. Measured against this unit's own pools, not chosen by feel. =====
//
// CURVE (C.11C), relative 0.02 / 0.04. This REPLACES a provably loose shipped window.
// The old tolerance, max(2, 3 percent of the answer), accepted a value read off a
// DIFFERENT curve at the same temperature in 12 of the 54 (solute, interior grid
// temperature) cells the generator could draw, and four of those were exact crossings
// that no band can separate. The fix is a generator rule, not a band: draw only a cell
// where no other curve reads within CURVE_MIN_SEP grams at that temperature. Re-measured
// against the shipped curve data for this gate: that leaves 38 of the 54 cells, with
// every solute keeping at least 4 (KNO3 7, NaNO3 8, KClO3 8, NH4Cl 6, KCl 5, NaCl 4).
// With the rule in place a 4 percent window is safe: every answer is a whole number off
// the pts grid and the input is step="1", so only the exact integer lands inside `ideal`.
export const CURVE_MIN_SEP = 4;
export const CURVE_BANDS = { mode: 'relative', ideal: 0.02, acceptable: 0.04 };

// MOLARITY (C.11E), relative 0.01 / 0.02. Matches the shipped tolPct: 2 and is kept
// because it is already defensible. The failure this stage tests is using the wrong
// molar mass; sorted, MOLARITY_SOLUTES runs 40.00, 58.44, 74.55, 101.10, 105.99, 110.98,
// 120.36, 180.16 g/mol, and the smallest adjacent gap is 4.7 percent (Na2CO3 against
// CaCl2), more than twice the acceptable window. Missing the mL to L conversion is 1000x.
export const MOLARITY_BANDS = { mode: 'relative', ideal: 0.01, acceptable: 0.02 };

// DILUTION (C.11F), relative 0.015 / 0.03. Matches the shipped tolPct: 3. The generator
// derives the target from an integer stock volume so the exact answer is always reachable
// on the 1 mL slider. Inverting C1V1 = C2V2 gives V1 = C1V2/C2, which with stocks of 6 to
// 18 M against targets under 9 M is always far outside the window.
export const DILUTION_BANDS = { mode: 'relative', ideal: 0.015, acceptable: 0.03 };

// CRYSTALLIZATION (honors h2), relative 0.02 / 0.04. Carried over from the shipped
// max(1, 4 percent of the answer) unchanged. NOT independently re-derived: nothing in the
// measurement above implicated it, and it is an honors stage.
export const CRYS_BANDS = { mode: 'relative', ideal: 0.02, acceptable: 0.04 };

// ===== SCENARIOS: the game layer =====
// You are the bench chemist at a small town's water plant, on day three of a do-not-drink
// notice. Manganese came through the filters on Monday. Every stage's chemistry tool is
// unchanged (the polarity call, the saturation compare, the real solubility curve, the
// solubility rules, the flask, the dilution bar); the fiction, the consequences and the
// world-state (manganese left in the finished water, plus the shift log) are what make it
// a plant rather than a worksheet.
//   Dose (C.11C, C.11E, C.11F, h2): commit a number. The band grades YOUR value against
//     the true requirement: on spec vs too little / too much (each a named consequence)
//     vs unresolved.
//   Decision (C.11A, C.11B, C.11D, h1, capstone): the consequence text belongs to
//     whatever varies per draw, which for these stages is WHICH HALF of the call went
//     wrong, so each decision scenario carries a `right` plus one string per failure
//     direction. The per-item chemistry stays in the stage's existing explain getter.
//   constraints: what the generator pins, always by pool key so a scenario can never
//     silently reference something that is not there.
//   delta: mg/L the call moves the clearwell by, per outcome. Correct work pulls the
//     number down; a miss pushes it back up, and the over-dosed permanganate call adds
//     its own named second problem (purple water in the main).
export const SCENARIOS = [
  // ---------- C.11(A) why it dissolves: decision ----------
  { id: 'a-tea', stage: 'dissolve', skill: 'a', type: 'decision',
    system: 'The break room', icon: '\u{1F9CA}',
    goal: 'Somebody left a glass of iced tea on the console with sugar sitting in a heap at the bottom, and the salt shaker beside it went into a glass of water and vanished. Classify what the bench just handed you and say whether water takes it.',
    why: 'Every dosing decision in this building is the same question as the one in that glass: does water pull this apart or not. Get it wrong on a treatment chemical and you have put a solid into a basin that will simply sit on the floor of it.',
    constraints: { names: ['table sugar (sucrose)', 'sodium chloride', 'potassium iodide', 'ammonia'] },
    delta: { ok: -0.02, wrong: 0.02 },
    actionLabel: 'Log the sample',
    right: 'The log line matches what the jar actually does, and the operator on nights can trust it without repeating the test.',
    wrongKind: 'You class the bonding wrong, so the note on the jar sends the next shift looking for the wrong solvent, and the sample gets run twice.',
    wrongDis: 'You call the solubility wrong. That is the half that reaches the basin: a chemical logged as dissolving that does not is a chemical the plant thinks it dosed.' },
  { id: 'a-shed', stage: 'dissolve', skill: 'a', type: 'decision',
    system: 'The maintenance shed', icon: '\u{1F6E2}\u{FE0F}',
    goal: 'The degreaser tin in the shed will not rinse off a bench with water, and there is a sheen on the raw-water sample the intake operator pulled this morning. Classify the substance in front of you and say whether water takes it.',
    why: 'Nonpolar things do not leave when you hose them. They float, they coat, and on a raw-water intake they go straight past a process built to treat what dissolves. Knowing which side of the line something sits on tells you whether treatment is even the right tool.',
    constraints: { names: ['hexane', 'octane (gasoline)', 'benzene', 'carbon tetrachloride'] },
    delta: { ok: -0.02, wrong: 0.03 },
    actionLabel: 'Log the sample',
    right: 'The sheen is written up as a nonpolar contaminant, the intake gets a skimmer instead of a dose, and nothing goes into the basin that was never going to help.',
    wrongKind: 'You class the bonding wrong, and the write-up sends it to the wrong part of the process.',
    wrongDis: 'You log it as dissolving, so the plant treats it as a solute. The dose goes in, the sheen is still on the water, and you have spent reagent on something water was never going to take.' },
  { id: 'a-basin', stage: 'dissolve', skill: 'a', type: 'decision',
    system: 'The contact basin', icon: '\u{1F3ED}',
    goal: 'Three candidate treatment chemicals are lined up on the bench and only the ones that actually go into solution can act on the manganese in the basin. Classify the one in front of you and call whether water takes it.',
    why: 'A chemical that does not dissolve does not react. It settles, it gets raked out with the sludge, and the number in the clearwell does not move while everyone believes it was dosed.',
    constraints: { names: ['sodium chloride', 'ethanol', 'methanol', 'iodine', 'lithium bromide'] },
    delta: { ok: -0.03, wrong: 0.03 },
    actionLabel: 'Log the sample',
    right: 'The right chemical goes into the basin in solution, it can actually reach the manganese, and the clearwell number moves the way the shift plan says it should.',
    wrongKind: 'You class the bonding wrong. The reasoning on the sheet does not hold up, even though the dose happened to land somewhere reasonable.',
    wrongDis: 'You call the solubility wrong, so a solid that was going to sit on the floor of the basin gets dosed as if it were working. The clearwell reads the same tomorrow.' },

  // ---------- C.11(B) solution types: decision ----------
  { id: 'b-honey', stage: 'types', skill: 'b', type: 'decision',
    system: 'The break-room jar', icon: '\u{1F36F}',
    goal: 'The jar of honey in the break room threw a solid crust the day somebody dropped a crumb in it. A sample tank on the bench is doing the same thing on a different scale. Classify how much is dissolved against the saturation limit, then say whether it conducts.',
    why: 'Supersaturated is a warning, not a description. It means the tank is holding more than it can and will drop the lot the moment something disturbs it. That is a crust in a honey jar and a slug of solid in a feed line.',
    constraints: { names: ['table sugar (sucrose)', 'glucose', 'urea'] },
    delta: { ok: -0.02, wrong: 0.02 },
    actionLabel: 'Classify the tank',
    right: 'The tank is labelled for what it is, so nobody knocks a supersaturated feed line and nobody waits on one that had room left.',
    wrongClass: 'You call the saturation state wrong. A tank labelled unsaturated when it is holding more than it can is the one that dumps solid into the feed pump overnight.',
    wrongElec: 'You call the conductivity wrong. It is the conductivity meter that tells the plant a feed line is still carrying what it should, and a nonelectrolyte read as an electrolyte makes that alarm meaningless.' },
  { id: 'b-salt', stage: 'types', skill: 'b', type: 'decision',
    system: 'The February driveway', icon: '\u{2744}\u{FE0F}',
    goal: 'Road salt on a driveway in February stops working once the brine is holding all it can, and the brine tank in the softener room does exactly the same thing. Classify the tank against its saturation limit, then call whether it conducts.',
    why: 'Once a brine is saturated, adding more salt achieves nothing but a pile at the bottom. Every operator who has kept shovelling salt onto ice that will not melt has already met this idea.',
    constraints: { names: ['sodium chloride', 'potassium chloride', 'ammonium chloride'] },
    delta: { ok: -0.02, wrong: 0.02 },
    actionLabel: 'Classify the tank',
    right: 'The brine is called correctly, the softener gets salt only when it can use it, and the store room stops carrying twice what it needs.',
    wrongClass: 'You call the saturation state wrong, so somebody keeps loading salt into a tank that cannot take it and the undissolved bags pile up in the bottom.',
    wrongElec: 'You call the conductivity wrong. Brine strength is read off a conductivity probe here, so a wrong electrolyte call makes the softener control loop untrustworthy.' },
  { id: 'b-tank', stage: 'types', skill: 'b', type: 'decision',
    system: 'The chemical bay', icon: '\u{1F6E2}\u{FE0F}',
    goal: 'One of the day tanks in the chemical bay is holding more than its label says it can at bench temperature, and it has been quiet all week. Classify it against the saturation limit, then say whether it conducts.',
    why: 'A tank sitting supersaturated is stable right up until it is not. On day three of a notice, a feed line that chokes on its own solid is the difference between the number coming down and the notice running another week.',
    constraints: { names: ['potassium nitrate', 'sodium nitrate', 'ammonium chloride', 'potassium chloride'] },
    delta: { ok: -0.03, wrong: 0.03 },
    actionLabel: 'Classify the tank',
    right: 'The bay gets a tank flagged before it drops its load, the feed line stays clear, and the dose that is meant to go in actually goes in.',
    wrongClass: 'You call the saturation state wrong, and a tank that was one knock away from crystallising out gets left alone until it blocks the feed pump.',
    wrongElec: 'You call the conductivity wrong, so the bay believes it can verify that tank on a conductivity reading it cannot.' },

  // ---------- C.11(C) solubility curve: dose ----------
  { id: 'c-tea', stage: 'curve', skill: 'c', type: 'dose',
    system: 'The cold glass', icon: '\u{1F9CA}',
    goal: 'Everyone already knows sugar goes into hot tea and sits at the bottom of iced tea. Every solid on this chart behaves the same way, and its curve says exactly how much, which is what the plant reads it for. Read the solubility off the curve at the temperature marked, in grams per 100 g of water, then call which way the change beside it moves the rate.',
    why: 'This is the reading the entire stage rests on. A curve is not a rule of thumb, it is a number, and reading it wrong at the bench is the same mistake as guessing at the basin.',
    constraints: { solutes: ['KNO3', 'KClO3', 'NaNO3'], temps: [10, 20, 30] },
    bands: CURVE_BANDS,
    delta: { ok: -0.02, low: 0.02, high: 0.02 },
    actionLabel: 'Submit the reading',
    safeState: 'READ RIGHT', lowState: 'READ LOW', highState: 'READ HIGH',
    safe: 'The reading matches the curve, and the rate note beside it matches how the bench actually behaves.',
    low: 'You read it low, so the bench believes less will dissolve than really does, and the next batch is made up weaker than it needed to be.',
    high: 'You read it high, so the bench believes the water holds more than it does. The extra never dissolves, it settles, and it goes out with the sludge.',
    rateWrong: 'The number off the curve is right, so the batch is the right size. The rate call is what is wrong, and that is the half that decides whether the bench waits five minutes or forty for it to go in.',
    fail: 'The reading never resolved, so the curve gets no number against it and the next shift starts from nothing.' },
  { id: 'c-rate', stage: 'curve', skill: 'c', type: 'dose',
    system: 'The mixing bench', icon: '\u{1F52C}',
    goal: 'Two beakers, same solid, same water. One is stirred and one is left alone; one holds a powder and one holds a single lump. Read the solubility off the curve at the marked temperature, then call which way the change beside it moves the rate.',
    why: 'How much dissolves and how fast it dissolves are two different questions, and they get run together constantly. Temperature moves both. Stirring and grinding move only the second one, and never the first.',
    constraints: { solutes: ['KNO3', 'NH4Cl', 'KCl', 'NaCl'], temps: [40, 50, 60] },
    bands: CURVE_BANDS,
    delta: { ok: -0.03, low: 0.02, high: 0.02 },
    actionLabel: 'Submit the reading',
    safeState: 'READ RIGHT', lowState: 'READ LOW', highState: 'READ HIGH',
    safe: 'The number and the rate call both hold up, and the bench procedure gets written the way it will actually be run.',
    low: 'You read it low. The procedure calls for less solid than the water can hold, and the standard comes out under strength.',
    high: 'You read it high. The procedure calls for more than will dissolve, so the flask is left with solid in the bottom and a concentration nobody can vouch for.',
    rateWrong: 'The reading holds, so the procedure asks for the right mass. What it gets wrong is the lever: the written method now tells the next operator to change the one thing that will not move the rate.',
    fail: 'The reading never resolved, so the procedure goes out without a number in it.' },
  { id: 'c-basin', stage: 'curve', skill: 'c', type: 'dose',
    system: 'The contact basin, overnight', icon: '\u{1F30A}',
    goal: 'The basin runs cold overnight and everything dosed into it has to stay in solution until morning. Read the solubility off the curve at the basin temperature marked on the chart, then call which way the change beside it moves the rate.',
    why: 'Anything the basin cannot hold at its coldest comes out of solution while nobody is watching, and it comes out on the floor of the basin instead of doing its job. On day three that is a night of treatment thrown away.',
    // The coldest interior cells on the chart, because the brief is built on what the
    // basin holds AT ITS COLDEST. Five of this pool's cells are separable at 10 and 20 C
    // (NaNO3 and KClO3 at both, KNO3 at 10), which the draw has room in.
    constraints: { solutes: ['KNO3', 'NaNO3', 'KClO3', 'NH4Cl'], temps: [10, 20] },
    bands: CURVE_BANDS,
    delta: { ok: -0.04, low: 0.03, high: 0.03 },
    actionLabel: 'Submit the reading',
    safeState: 'READ RIGHT', lowState: 'READ LOW', highState: 'READ HIGH',
    safe: 'The overnight dose is set to what the basin can actually hold at its coldest, the rate call matches how fast it will go in, and in the morning it is still in solution and still working.',
    low: 'You read it low, so the basin is dosed under what it could have carried. The manganese has all night to sit there untreated.',
    high: 'You read it high. The basin cannot hold it, it drops out on the floor overnight, and the morning shift rakes out chemistry the town paid for.',
    rateWrong: 'The overnight dose is the right size. The rate call is wrong, and on a basin that runs all night that is the difference between chemistry that is working by midnight and chemistry that is still going in at dawn.',
    fail: 'The reading never resolved, so the overnight dose gets set by the last shift\'s number.' },

  // ---------- C.11(D) precipitation: decision ----------
  { id: 'd-kettle', stage: 'precip', skill: 'd', type: 'decision',
    system: 'The kettle', icon: '\u{1FAD6}',
    goal: 'The white crust in the break-room kettle got there by exactly this route: two things in solution met and one of the products would not stay dissolved. Label each product of the pair on the bench, and say what this one does.',
    why: 'The solubility rules are what let you say, before you mix anything, whether a product is going to leave the water. That is the whole of predicting a precipitate, including predicting that there will not be one, and it is the same table whether you are looking at a kettle or a basin.',
    constraints: { wantPrecip: true },
    delta: { ok: -0.03, wrong: 0.03 },
    actionLabel: 'Predict the precipitate',
    right: 'Both products are labelled correctly, so the bench knows what is going to drop out before it is mixed rather than after.',
    wrongMiss: 'You label an insoluble product as soluble, so the plant does not expect a solid and gets one. That is scale in a line, or a basin floor covered in something nobody planned for.',
    wrongDrop: 'You label a soluble product as insoluble, so the plant expects a solid that never arrives and waits for a settling step that has nothing to settle.' },
  { id: 'd-basin', stage: 'precip', skill: 'd', type: 'decision',
    system: 'The dosing point', icon: '\u{2697}\u{FE0F}',
    goal: 'The treatment chemical goes in at the head of the basin and meets what is already in the water. Label each product against the rules, because whether anything drops out, and which thing it is, decides whether this dose helps or is thrown away.',
    why: 'Dropping the contaminant out is treatment. Dropping the treatment chemical out is a wasted dose and a basin full of sludge. Both products staying dissolved means nothing happened at all. They look identical on the dosing pump and completely different on the solubility rules.',
    constraints: { wantPrecip: true },
    delta: { ok: -0.05, wrong: 0.04 },
    actionLabel: 'Predict the precipitate',
    right: 'The product that leaves the water is the one carrying the manganese. It settles, it gets raked out, and the clearwell number comes down.',
    wrongMiss: 'You expect the wrong product to stay in solution. The thing that actually drops out is the treatment chemical, so the dose is on the floor of the basin and the manganese is still in the water.',
    wrongDrop: 'You expect a solid that never forms, so the basin is left waiting on a settling step with nothing in it while the contaminant carries straight through to the clearwell.' },

  // ---------- C.11(E) molarity: dose ----------
  { id: 'e-scoop', stage: 'molarity', skill: 'e', type: 'dose',
    system: 'The bench standard', icon: '\u{1F9EB}',
    goal: 'A scoop of powder into a bottle of water is a concentration whether anybody writes it down or not. Make up the solution on the card to the stated molarity: weigh the solid and set the final volume.',
    why: 'Every reading this plant reports today gets compared against something somebody made up by hand. If that is out, every number behind it is out by the same amount and in the same direction, and nothing downstream can catch it.',
    // All eight non-permanganate solutes, so no pool entry is unreachable (trap 27).
    constraints: { solutes: ['sodium chloride', 'potassium chloride', 'glucose', 'magnesium sulfate', 'sodium carbonate', 'sodium hydroxide', 'calcium chloride', 'potassium nitrate'], targetM: [0.25, 1.2] },
    bands: MOLARITY_BANDS,
    delta: { ok: -0.03, low: 0.02, high: 0.02 },
    actionLabel: 'Ship the standard',
    safeState: 'ON SPEC', lowState: 'UNDER STRENGTH', highState: 'OVER STRENGTH',
    safe: 'The standard reads where it should, the meter calibrates against it, and every sample behind it means something.',
    low: 'The standard comes out weak, so the meter reads every real sample high against it. The plant thinks it has more contaminant than it has, and doses chemistry it did not need.',
    high: 'The standard comes out strong, so the meter reads every real sample low. That is the direction that lets a sample pass when it should not.',
    fail: 'The mass never resolved, so the flask stays empty and the bench has no standard to calibrate against.' },
  { id: 'e-permang', stage: 'molarity', skill: 'e', type: 'dose',
    system: 'The dosing barrel', icon: '\u{1F7E3}',
    goal: 'The permanganate feed is empty and the shift needs it made up to a stated molarity in the flask on the bench. Weigh the solid and call the volume.',
    why: 'Permanganate is what oxidises the manganese so the filters can catch it. Make it weak and the filters see raw water. Make it strong and you push purple into the distribution main, and a town already on bottled water opens the tap to pink.',
    constraints: { solutes: ['potassium permanganate'], targetM: [0.3, 1.5] },
    bands: MOLARITY_BANDS,
    delta: { ok: -0.06, low: 0.04, high: 0.08 },
    actionLabel: 'Ship the batch',
    safeState: 'ON SPEC', lowState: 'UNDER STRENGTH', highState: 'OVER STRENGTH',
    safe: 'The feed goes on at strength, the filters start catching manganese instead of passing it, and the clearwell number moves for the first time this week.',
    low: 'The feed is weak. The filters see water that was never fully oxidised, the manganese goes straight through them, and day four looks like day three.',
    high: 'The feed is strong, and the excess does not stop at the filters. Purple goes into the distribution main, so now there are two problems in the finished water and a town that already stopped trusting the tap.',
    fail: 'The mass never resolved, so the feed barrel stays empty through the shift.' },

  // ---------- C.11(F) dilution: dose ----------
  { id: 'f-cleaner', stage: 'dilute', skill: 'f', type: 'dose',
    system: 'The working strength', icon: '\u{1F9F4}',
    goal: 'Concentrated cleaner has a working strength printed on the back of the bottle and nobody ever measures it out. The bench does, for everything it draws down. Take the stock on the card to the working strength stated, in the batch volume stated.',
    why: 'C1V1 = C2V2 is the arithmetic behind every "dilute one part to ten" instruction anybody has ever followed. Doing it by eye works right up until the thing in the bottle is strong enough to matter, and everything on this bench is.',
    constraints: { stocks: ['sodium hydroxide', 'acetic acid'], v2: [100, 250] },
    bands: DILUTION_BANDS,
    delta: { ok: -0.02, low: 0.02, high: 0.02 },
    actionLabel: 'Ship the batch',
    safeState: 'ON SPEC', lowState: 'TOO WEAK', highState: 'TOO STRONG',
    safe: 'The working solution lands on its stated strength, and the job it was drawn for goes the way the method assumed.',
    low: 'You draw too little stock. The working solution is weak, the job takes twice as long, and somebody tops it up by eye to make up for it.',
    high: 'You draw too much stock. The working solution is stronger than the label on it, which is how a bench bottle ends up attacking the thing it was drawn to work on.',
    fail: 'The volume never resolved, so nothing gets drawn and the bottle stays on the shelf.' },
  { id: 'f-stock', stage: 'dilute', skill: 'f', type: 'dose',
    system: 'The titration bench', icon: '\u{1F4A7}',
    goal: 'The day\'s titrations run off a working acid drawn down from the concentrated stock. Draw the stock volume that gives the stated working strength in the stated batch volume.',
    why: 'Concentrated acid is not a thing you correct by adding more later. The volume you draw is the whole of the decision, and every alkalinity number the plant reports today sits on top of it.',
    constraints: { stocks: ['hydrochloric acid', 'sulfuric acid', 'nitric acid'], v2: [250, 500] },
    bands: DILUTION_BANDS,
    delta: { ok: -0.03, low: 0.03, high: 0.03 },
    actionLabel: 'Ship the batch',
    safeState: 'ON SPEC', lowState: 'TOO WEAK', highState: 'TOO STRONG',
    safe: 'The working acid is on strength, the titrations run against a titrant that means what it says, and the alkalinity numbers hold up.',
    low: 'The working acid is weak, so every titration takes more of it to reach the endpoint. The plant records alkalinity higher than it is and trims the wrong way.',
    high: 'The working acid is strong, so every endpoint arrives early. Alkalinity reads low across the board and the basin gets dosed for a problem it does not have.',
    fail: 'The volume never resolved, so the titration bench has no titrant and the run is off.' },

  // ---------- Honors h1 (parent d): Ksp and the common-ion effect ----------
  { id: 'h1-ksp', stage: 'honors1', skill: 'h1', type: 'decision',
    system: 'The clearwell', icon: '\u{1F4C9}',
    goal: 'The rules table gives you soluble or insoluble. Ksp gives you the number underneath it. You have both ion concentrations and the salt\'s Ksp: work out Q and decide whether it precipitates here, at these concentrations.',
    why: 'Soluble is not a yes or no, it is a limit. The same salt stays in solution in one tank and drops out in the next one, and the only thing that changed was a concentration. Adding a common ion is how a plant deliberately pushes a salt over that line.',
    delta: { ok: -0.03, wrong: 0.02 },
    actionLabel: 'Make the call',
    right: 'The call matches what the tank actually does, and the common-ion dose that follows is sized to push the right salt out and leave the rest alone.',
    wrong: 'The call is wrong, so the plant either waits on a precipitate that never comes or gets a solid it made no room for. Q against Ksp is the only thing that separates those two, and it is a number, not a judgement.' },

  // ---------- Honors h2 (parent c): quantitative crystallization, dose ----------
  { id: 'h2-crys', stage: 'honors2', skill: 'h2', type: 'dose',
    system: 'The cooling tank', icon: '\u{1F9CA}',
    goal: 'A saturated solution is cooled from one temperature to another, and the water can no longer hold what it did. Work out how many grams come out of solution.',
    why: 'This is the curve read twice and subtracted, and it is what tells a plant how much solid a cooling tank is going to hand it overnight. Guess it and you are sizing a filter for a mass nobody has calculated.',
    bands: CRYS_BANDS,
    delta: { ok: -0.03, low: 0.02, high: 0.02 },
    actionLabel: 'Call the yield',
    safeState: 'YIELD CALLED', lowState: 'CALLED SHORT', highState: 'CALLED LONG',
    safe: 'The mass matches what the tank actually drops, so the filter behind it is sized for the load it gets.',
    low: 'You call it short. More solid comes out than the filter was sized for, and it blinds partway through the night.',
    high: 'You call it long. The filter is oversized for a load that never arrives, and the money went somewhere the plant needed it more.',
    fail: 'The yield never resolved, so the cooling tank gets no figure against it.' },

  // ---------- Capstone: one batch, end to end ----------
  { id: 'cap-batch', stage: 'capstone', skill: 'cap', type: 'decision',
    system: 'The batch that lifts the notice', icon: '\u{1F3AF}',
    goal: 'One batch, end to end, with the state lab watching. Classify the stock solute, make it up to spec in the flask, then dose it and predict what drops out. Every skill in C.11 in one run.',
    why: 'The notice does not lift on six separate skills. It lifts on one batch where all of them were right at the same time, because that is what a treatment train is: each step handing a correct answer to the next one.',
    // -0.5 is the full span of the meter: a certified batch takes the clearwell under the
    // limit outright, whatever the week left in it. A rejected one costs the plant a day.
    delta: { ok: -0.5, wrong: 0.04 },
    right: 'The stock dissolves, the flask is on spec, and the product that leaves the water is the one carrying the manganese. The state lab confirms the clearwell reading and the notice comes off in the morning.',
    wrong: 'The batch does not stand up. One step out anywhere in the train is a batch the state lab will not certify, and the notice runs another day.' }
];
