// model.js: Unit 8 domain data (Solutions & Solubility, TEKS C.11).
// Quantitative chemistry helpers live in shared/js/chem.js. This file holds the
// standards map, curated item pools, solubility-curve data, and Unit 8 scenarios.

// Current Texas Chemistry TEKS implemented in 2024. Honors rows are extensions.
export const SE = [
  { id: 'a', code: 'C.11(A)', mode: 'dissolve', honors: false,
    text: 'Describe the unique role of water in solutions in terms of polarity.' },
  { id: 'b', code: 'C.11(B)', mode: 'types', honors: false,
    text: 'Distinguish electrolytes from nonelectrolytes and unsaturated, saturated, and supersaturated solutions.' },
  { id: 'c', code: 'C.11(C)', mode: 'curve', honors: false,
    text: 'Use solubility curves to investigate temperature effects on solid and gas solubility and relate dissolution rate to temperature, agitation, and surface area.' },
  { id: 'd', code: 'C.11(D)', mode: 'precip', honors: false,
    text: 'Use general solubility rules to predict the solubility of products in a double-replacement reaction.' },
  { id: 'e', code: 'C.11(E)', mode: 'molarity', honors: false,
    text: 'Calculate the concentration of a solution in units of molarity.' },
  { id: 'f', code: 'C.11(F)', mode: 'dilute', honors: false,
    text: 'Calculate solution dilutions using molarity.' },
  { id: 'h1', code: 'C.11(D)', mode: 'precip', honors: true,
    text: 'Honors: use Ksp and the ion product Q to predict whether a precipitate forms.' },
  { id: 'h2', code: 'C.11(C)', mode: 'curve', honors: true,
    text: 'Honors: calculate how much solid crystallizes when a saturated solution is cooled.' }
];

// ===== C.11(A) polarity and water-solubility pool =====
// The activity uses deliberately clear examples. The boolean is an activity
// classification of appreciable water solubility, not a universal rule for all
// ionic, polar, or nonpolar substances.
export const POLARITY_POOL = [
  { name: 'sodium chloride',      formula: 'NaCl',         kind: 'ionic',    dissolves: true,
    where: 'the softener brine tank and the shaker on the break-room table' },
  { name: 'potassium iodide',     formula: 'KI',           kind: 'ionic',    dissolves: true,
    where: 'an iodide reagent bottle on the bench and iodized salt' },
  { name: 'lithium bromide',      formula: 'LiBr',         kind: 'ionic',    dissolves: true,
    where: 'a desiccant solution used in some absorption chillers' },
  { name: 'table sugar (sucrose)', formula: 'C12H22O11',   kind: 'polar',    dissolves: true,
    where: 'sugar added to a drink in the break room' },
  { name: 'ethanol',              formula: 'C2H6O',        kind: 'polar',    dissolves: true,
    where: 'a laboratory alcohol solution' },
  { name: 'methanol',             formula: 'CH4O',         kind: 'polar',    dissolves: true,
    where: 'a laboratory solvent or standard solution' },
  { name: 'ammonia',              formula: 'NH3',          kind: 'polar',    dissolves: true,
    where: 'an aqueous reagent used in water chemistry' },
  { name: 'benzene',              formula: 'C6H6',         kind: 'nonpolar', dissolves: false,
    where: 'a nonpolar hydrocarbon associated with some fuel contamination' },
  { name: 'octane (gasoline component)', formula: 'C8H18', kind: 'nonpolar', dissolves: false,
    where: 'a hydrocarbon component of gasoline' },
  { name: 'hexane',               formula: 'C6H14',        kind: 'nonpolar', dissolves: false,
    where: 'a nonpolar laboratory solvent' },
  { name: 'iodine',               formula: 'I2',           kind: 'nonpolar', dissolves: false,
    where: 'molecular iodine used in chemistry demonstrations and analysis' },
  { name: 'carbon tetrachloride', formula: 'CCl4',         kind: 'nonpolar', dissolves: false,
    where: 'a legacy nonpolar solvent that is no longer used routinely because of its hazards' }
];

export const KIND_LABEL = {
  ionic: 'Ionic',
  polar: 'Polar covalent',
  nonpolar: 'Nonpolar covalent'
};

// ===== C.11(B) solution types =====
// s = approximate solubility in g solute per 100 g water at 20 °C.
export const TYPES_POOL = [
  { name: 'potassium nitrate',     formula: 'KNO3',      s: 32,  electrolyte: true,
    where: 'a nitrate standard prepared for analysis' },
  { name: 'sodium chloride',       formula: 'NaCl',      s: 36,  electrolyte: true,
    where: 'softener brine and road salt' },
  { name: 'potassium chloride',    formula: 'KCl',       s: 34,  electrolyte: true,
    where: 'a salt substitute and some electrode fill solutions' },
  { name: 'ammonium chloride',     formula: 'NH4Cl',     s: 37,  electrolyte: true,
    where: 'a laboratory ammonium standard' },
  { name: 'sodium nitrate',        formula: 'NaNO3',     s: 88,  electrolyte: true,
    where: 'a soluble nitrate salt' },
  { name: 'table sugar (sucrose)', formula: 'C12H22O11', s: 204, electrolyte: false,
    where: 'table sugar in a concentrated sugar solution' },
  { name: 'glucose',               formula: 'C6H12O6',   s: 91,  electrolyte: false,
    where: 'glucose in a laboratory or food solution' },
  { name: 'urea',                  formula: 'CH4N2O',    s: 108, electrolyte: false,
    where: 'urea in a concentrated aqueous solution' }
];

// ===== C.11(C) solubility curves: g solute per 100 g water =====
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

export const CURVE_TEMPS = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

// Qualitative factors that affect the rate of dissolving. These statements concern
// rate, not equilibrium solubility unless temperature is also changing solubility.
export const RATE_FACTORS = [
  { change: 'Warming the water', faster: true,
    why: 'For these solids, warmer water increases particle motion and usually increases the rate of dissolving.' },
  { change: 'Stirring the mixture', faster: true,
    why: 'Stirring moves solution away from the solid surface and brings fresh solvent into contact with it.' },
  { change: 'Grinding the solid into a fine powder', faster: true,
    why: 'Powder has more exposed surface area than the same mass in one large piece, so it dissolves faster.' },
  { change: 'Chilling the water', faster: false,
    why: 'Lower temperature generally slows particle motion and slows the dissolving of these solids.' },
  { change: 'Using one large crystal instead of powder', faster: false,
    why: 'One large crystal has less exposed surface area than the same mass of powder, so it dissolves more slowly.' },
  { change: 'Letting the beaker sit undisturbed', faster: false,
    why: 'Without stirring, dissolved solute is removed from the solid surface more slowly, so the overall dissolving rate decreases.' }
];

// ===== C.11(D) precipitation generator =====
export const CORE_CATIONS = ['Li', 'Na', 'K', 'NH4', 'Ag', 'Mg', 'Ca', 'Ba', 'Zn', 'Fe2', 'Pb', 'Al', 'Fe3'];
export const CORE_ANIONS = ['NO3', 'ClO3', 'C2H3O2', 'Cl', 'Br', 'I', 'OH', 'SO4', 'CO3', 'S', 'PO4'];

// ===== C.11(E) molarity =====
export const MOLARITY_SOLUTES = [
  { name: 'potassium permanganate', formula: 'KMnO4', where: 'an oxidant used here to convert dissolved manganese to forms that can be removed by treatment' },
  { name: 'sodium chloride',    formula: 'NaCl',    where: 'a conductivity standard for the bench meter' },
  { name: 'potassium nitrate',  formula: 'KNO3',    where: 'a nitrate standard prepared for analysis' },
  { name: 'calcium chloride',   formula: 'CaCl2',   where: 'a hardness standard for jar tests' },
  { name: 'sodium hydroxide',   formula: 'NaOH',    where: 'a base used for pH adjustment' },
  { name: 'potassium chloride', formula: 'KCl',     where: 'an electrolyte solution used with some electrodes' },
  { name: 'magnesium sulfate',  formula: 'MgSO4',   where: 'a soluble salt used in hardness-related laboratory work' },
  { name: 'sodium carbonate',   formula: 'Na2CO3',  where: 'soda ash used to increase alkalinity' },
  { name: 'glucose',            formula: 'C6H12O6', where: 'a molecular solute used for solution preparation' }
];

// ===== C.11(F) dilution stocks (M) =====
export const DILUTION_STOCKS = [
  { name: 'hydrochloric acid', formula: 'HCl',    c1: 12, where: 'a concentrated laboratory acid stock' },
  { name: 'sulfuric acid',     formula: 'H2SO4',  c1: 18, where: 'a concentrated laboratory acid stock' },
  { name: 'sodium hydroxide',  formula: 'NaOH',   c1: 6,  where: 'a concentrated laboratory base stock' },
  { name: 'acetic acid',       formula: 'C2H4O2', c1: 17, where: 'a concentrated laboratory acid stock' },
  { name: 'nitric acid',       formula: 'HNO3',   c1: 16, where: 'a concentrated laboratory acid stock' }
];

// ===== Honors Ksp =====
export const KSP_SALTS = [
  { formula: 'AgCl',  cation: 'Ag+',   anion: 'Cl-',    ksp: 1.8e-10 },
  { formula: 'AgBr',  cation: 'Ag+',   anion: 'Br-',    ksp: 5.4e-13 },
  { formula: 'BaSO4', cation: 'Ba^2+', anion: 'SO4^2-', ksp: 1.1e-10 },
  { formula: 'PbSO4', cation: 'Pb^2+', anion: 'SO4^2-', ksp: 2.5e-8 }
];

// ===== Activity scoring bands =====
// These are activity criteria used by the interface, not scientific definitions.
export const CURVE_MIN_SEP = 4;
export const CURVE_BANDS = { mode: 'relative', ideal: 0.02, acceptable: 0.04 };
export const MOLARITY_BANDS = { mode: 'relative', ideal: 0.01, acceptable: 0.02 };
export const DILUTION_BANDS = { mode: 'relative', ideal: 0.015, acceptable: 0.03 };
export const CRYS_BANDS = { mode: 'relative', ideal: 0.02, acceptable: 0.04 };

// ===== Scenarios =====
// delta changes the Unit 8 simulation indicator. It is not a measured treatment
// response and must be labeled as a simulation value wherever it is displayed.
export const SCENARIOS = [
  // ---------- C.11(A): water and polarity ----------
  { id: 'a-tea', stage: 'dissolve', skill: 'a', type: 'decision',
    system: 'The break room', icon: '\u{1F9CA}',
    goal: 'Classify the sample as ionic, polar covalent, or nonpolar covalent. Then predict whether it is appreciably soluble in water.',
    why: 'Water is polar. In this activity, the selected ionic and polar substances are much more water-soluble than the selected nonpolar substances.',
    constraints: { names: ['table sugar (sucrose)', 'sodium chloride', 'potassium iodide', 'ammonia'] },
    delta: { ok: -0.02, wrong: 0.02 },
    actionLabel: 'Submit classification',
    right: 'Your bonding classification and water-solubility prediction are both correct.',
    wrongKind: 'Recheck the type of bonding or particles in the substance, then use that classification to reason about water-solute attractions.',
    wrongDis: 'Your bonding classification is correct. Recheck whether this selected substance has appreciable solubility in polar water.' },
  { id: 'a-shed', stage: 'dissolve', skill: 'a', type: 'decision',
    system: 'The maintenance shed', icon: '\u{1F6E2}\u{FE0F}',
    goal: 'Classify the hydrocarbon or solvent sample, then predict whether it is appreciably soluble in water.',
    why: 'The selected samples are nonpolar and have low water solubility. This contrasts with the polar and ionic examples in the other scenarios.',
    constraints: { names: ['hexane', 'octane (gasoline component)', 'benzene', 'carbon tetrachloride'] },
    delta: { ok: -0.02, wrong: 0.03 },
    actionLabel: 'Submit classification',
    right: 'Your classification matches the sample: it is nonpolar and has low solubility in water.',
    wrongKind: 'Recheck the bonding and molecular polarity of this sample before predicting its behavior in water.',
    wrongDis: 'Your bonding classification is correct. Recheck how a nonpolar substance interacts with polar water.' },
  { id: 'a-basin', stage: 'dissolve', skill: 'a', type: 'decision',
    system: 'The contact basin', icon: '\u{1F3ED}',
    goal: 'Classify the sample and predict whether it is appreciably soluble in water.',
    why: 'For an aqueous treatment step, a reagent must have sufficient water solubility to disperse through the solution. Insoluble materials require different treatment considerations.',
    constraints: { names: ['sodium chloride', 'ethanol', 'methanol', 'iodine', 'lithium bromide'] },
    delta: { ok: -0.03, wrong: 0.03 },
    actionLabel: 'Submit classification',
    right: 'Your classification and water-solubility prediction are consistent with the selected substance.',
    wrongKind: 'Recheck whether the substance is ionic, polar covalent, or nonpolar covalent.',
    wrongDis: 'Your bonding classification is correct. Recheck its expected water solubility for this activity.' },

  // ---------- C.11(B): solution types ----------
  { id: 'b-honey', stage: 'types', skill: 'b', type: 'decision',
    system: 'The sample jar', icon: '\u{1F36F}',
    goal: 'Compare the dissolved amount with the 20 °C solubility limit. Classify the solution, then identify it as an electrolyte or nonelectrolyte.',
    why: 'A supersaturated solution contains more dissolved solute than its equilibrium solubility at that temperature and may crystallize when nucleation begins.',
    constraints: { names: ['table sugar (sucrose)', 'glucose', 'urea'] },
    delta: { ok: -0.02, wrong: 0.02 },
    actionLabel: 'Submit classification',
    right: 'Both the saturation state and electrolyte classification are correct.',
    wrongClass: 'Recompare the dissolved amount with the stated solubility limit at 20 °C.',
    wrongElec: 'The saturation state is correct. Recheck whether this solute forms mobile ions when it dissolves in water.' },
  { id: 'b-salt', stage: 'types', skill: 'b', type: 'decision',
    system: 'The brine tank', icon: '\u{2744}\u{FE0F}',
    goal: 'Use the 20 °C solubility limit to classify the brine, then identify whether the dissolved solute is an electrolyte.',
    why: 'At saturation, the solution is in equilibrium with undissolved solute; adding more solute does not increase the dissolved amount at the same temperature.',
    constraints: { names: ['sodium chloride', 'potassium chloride', 'ammonium chloride'] },
    delta: { ok: -0.02, wrong: 0.02 },
    actionLabel: 'Submit classification',
    right: 'Your saturation-state and electrolyte classifications are correct.',
    wrongClass: 'Recompare the dissolved mass with the solubility limit. Equal means saturated; below is unsaturated; above the equilibrium value represents a supersaturated state in this activity.',
    wrongElec: 'The saturation state is correct. These soluble ionic compounds dissociate into ions and act as electrolytes.' },
  { id: 'b-tank', stage: 'types', skill: 'b', type: 'decision',
    system: 'The chemical bay', icon: '\u{1F6E2}\u{FE0F}',
    goal: 'Classify the solution from the dissolved amount and solubility limit, then determine whether it is an electrolyte.',
    why: 'Supersaturated solutions are metastable. Crystallization can begin when nucleation is triggered, but it is not guaranteed to occur at a specific instant.',
    constraints: { names: ['potassium nitrate', 'sodium nitrate', 'ammonium chloride', 'potassium chloride'] },
    delta: { ok: -0.03, wrong: 0.03 },
    actionLabel: 'Submit classification',
    right: 'Your classification correctly describes both saturation state and electrical behavior.',
    wrongClass: 'Recheck the dissolved amount relative to the stated equilibrium solubility.',
    wrongElec: 'The saturation state is correct. Recheck whether the dissolved solute produces ions in water.' },

  // ---------- C.11(C): solubility curves and dissolution rate ----------
  { id: 'c-tea', stage: 'curve', skill: 'c', type: 'dose',
    system: 'The cold glass', icon: '\u{1F9CA}',
    goal: 'Read the selected solid\'s solubility from the curve at the marked temperature. Then predict how the stated change affects its dissolving rate.',
    why: 'Each curve gives an approximate equilibrium solubility in grams of solute per 100 g of water. Solubility and dissolving rate are related but different quantities.',
    constraints: { solutes: ['KNO3', 'KClO3', 'NaNO3'], temps: [10, 20, 30] },
    bands: CURVE_BANDS,
    delta: { ok: -0.02, low: 0.02, high: 0.02 },
    actionLabel: 'Submit reading',
    safeState: 'MEETS ACTIVITY CRITERION', lowState: 'BELOW CURVE VALUE', highState: 'ABOVE CURVE VALUE',
    safe: 'Your curve reading and rate prediction are both consistent with the displayed data.',
    low: 'Your value is below the curve. Recheck the selected solute and the marked temperature.',
    high: 'Your value is above the curve. Recheck the selected solute and the marked temperature.',
    rateWrong: 'Your curve reading is correct, but the rate prediction needs revision. Consider temperature, stirring, or surface area as stated.',
    fail: 'No numerical curve reading was submitted.' },
  { id: 'c-rate', stage: 'curve', skill: 'c', type: 'dose',
    system: 'The mixing bench', icon: '\u{1F52C}',
    goal: 'Read the solubility from the curve, then predict whether the stated change makes the solid dissolve faster or slower.',
    why: 'Temperature can affect both equilibrium solubility and dissolving rate. Stirring and particle size affect rate but do not change the equilibrium solubility value.',
    constraints: { solutes: ['KNO3', 'NH4Cl', 'KCl', 'NaCl'], temps: [40, 50, 60] },
    bands: CURVE_BANDS,
    delta: { ok: -0.03, low: 0.02, high: 0.02 },
    actionLabel: 'Submit reading',
    safeState: 'MEETS ACTIVITY CRITERION', lowState: 'BELOW CURVE VALUE', highState: 'ABOVE CURVE VALUE',
    safe: 'Your curve reading and rate prediction are both correct for the displayed conditions.',
    low: 'Your solubility value is too low. Re-read the highlighted curve at the marked temperature.',
    high: 'Your solubility value is too high. Re-read the highlighted curve at the marked temperature.',
    rateWrong: 'The curve value is correct. Recheck whether the stated change affects temperature, agitation, or exposed surface area.',
    fail: 'No numerical curve reading was submitted.' },
  { id: 'c-basin', stage: 'curve', skill: 'c', type: 'dose',
    system: 'The contact basin', icon: '\u{1F30A}',
    goal: 'Read the selected solid\'s solubility at the marked cool temperature, then predict how the stated change affects its dissolving rate.',
    why: 'For the solids plotted here, cooling generally lowers solubility. If a solution then contains more dissolved solute than the equilibrium value, crystallization may occur as equilibrium is restored.',
    constraints: { solutes: ['KNO3', 'NaNO3', 'KClO3', 'NH4Cl'], temps: [10, 20] },
    bands: CURVE_BANDS,
    delta: { ok: -0.04, low: 0.03, high: 0.03 },
    actionLabel: 'Submit reading',
    safeState: 'MEETS ACTIVITY CRITERION', lowState: 'BELOW CURVE VALUE', highState: 'ABOVE CURVE VALUE',
    safe: 'Your curve reading and rate prediction match the displayed conditions.',
    low: 'Your value is below the curve. Recheck the highlighted solute at the marked temperature.',
    high: 'Your value is above the curve. At equilibrium, that amount would exceed the plotted solubility at this temperature.',
    rateWrong: 'Your curve value is correct. Recheck the effect of the stated change on dissolving rate.',
    fail: 'No numerical curve reading was submitted.' },

  // ---------- C.11(D): precipitation ----------
  { id: 'd-kettle', stage: 'precip', skill: 'd', type: 'decision',
    system: 'The kettle', icon: '\u{1FAD6}',
    goal: 'Use the activity solubility rules to classify each product of the double-replacement reaction as aqueous or solid.',
    why: 'Mineral scale is a familiar example of an insoluble solid forming from dissolved ions, although the exact chemistry of kettle scale can involve processes beyond a simple double replacement.',
    constraints: { wantPrecip: true },
    delta: { ok: -0.03, wrong: 0.03 },
    actionLabel: 'Submit prediction',
    right: 'Both products are classified correctly using the activity solubility rules.',
    wrongMiss: 'An insoluble product was marked aqueous. Recheck the ion pair against the activity solubility rules.',
    wrongDrop: 'A soluble product was marked solid. Recheck the exceptions in the activity solubility rules.' },
  { id: 'd-basin', stage: 'precip', skill: 'd', type: 'decision',
    system: 'The dosing point', icon: '\u{2697}\u{FE0F}',
    goal: 'Predict the physical state of each product after two soluble ionic solutions are mixed.',
    why: 'In this generated reaction, a precipitate forms only when at least one product is classified as insoluble by the activity rule set.',
    constraints: { wantPrecip: true },
    delta: { ok: -0.05, wrong: 0.04 },
    actionLabel: 'Submit prediction',
    right: 'Your product states correctly identify whether this generated reaction forms a precipitate.',
    wrongMiss: 'You marked an insoluble product as aqueous. Recheck the ions and the relevant rule or exception.',
    wrongDrop: 'You marked a soluble product as solid. Recheck the ions and the relevant rule or exception.' },

  // ---------- C.11(E): molarity ----------
  { id: 'e-scoop', stage: 'molarity', skill: 'e', type: 'dose',
    system: 'The bench standard', icon: '\u{1F9EB}',
    goal: 'Prepare the stated molarity by choosing the final volume and calculating the mass of solute needed.',
    why: 'Molarity is moles of solute per liter of solution. Both the amount of solute and the final solution volume determine the concentration.',
    constraints: { solutes: ['sodium chloride', 'potassium chloride', 'glucose', 'magnesium sulfate', 'sodium carbonate', 'sodium hydroxide', 'calcium chloride', 'potassium nitrate'], targetM: [0.25, 1.2] },
    bands: MOLARITY_BANDS,
    delta: { ok: -0.03, low: 0.02, high: 0.02 },
    actionLabel: 'Submit solution',
    safeState: 'MEETS ACTIVITY CRITERION', lowState: 'BELOW TARGET', highState: 'ABOVE TARGET',
    safe: 'Your prepared concentration is within the activity criterion for the stated target.',
    low: 'Your concentration is below the target. Recheck moles, molar mass, and the conversion from milliliters to liters.',
    high: 'Your concentration is above the target. Recheck the solute mass and final volume.',
    fail: 'No solute mass was submitted.' },
  { id: 'e-permang', stage: 'molarity', skill: 'e', type: 'dose',
    system: 'The dosing barrel', icon: '\u{1F7E3}',
    goal: 'Prepare the potassium permanganate solution at the stated molarity by selecting final volume and calculating the required mass.',
    why: 'Permanganate can be used to oxidize dissolved manganese before removal by filtration. Correct reagent concentration is important; excess permanganate can also leave a pink or purple color.',
    constraints: { solutes: ['potassium permanganate'], targetM: [0.3, 1.5] },
    bands: MOLARITY_BANDS,
    delta: { ok: -0.06, low: 0.04, high: 0.08 },
    actionLabel: 'Submit solution',
    safeState: 'MEETS ACTIVITY CRITERION', lowState: 'BELOW TARGET', highState: 'ABOVE TARGET',
    safe: 'Your prepared concentration is within the activity criterion for the stated target.',
    low: 'Your concentration is below the target. Recheck the mass required for the selected final volume.',
    high: 'Your concentration is above the target. Recheck the mass and final volume; excess permanganate can create unwanted color in treated water.',
    fail: 'No solute mass was submitted.' },

  // ---------- C.11(F): dilution ----------
  { id: 'f-cleaner', stage: 'dilute', skill: 'f', type: 'dose',
    system: 'The working solution', icon: '\u{1F9F4}',
    goal: 'Use C1V1 = C2V2 to select the stock volume needed for the stated final concentration and final volume.',
    why: 'A dilution transfers a measured amount of stock solution and then adds solvent until the final volume is reached. The equation tracks the conserved amount of solute.',
    constraints: { stocks: ['sodium hydroxide', 'acetic acid'], v2: [100, 250] },
    bands: DILUTION_BANDS,
    delta: { ok: -0.02, low: 0.02, high: 0.02 },
    actionLabel: 'Submit dilution',
    safeState: 'MEETS ACTIVITY CRITERION', lowState: 'BELOW TARGET', highState: 'ABOVE TARGET',
    safe: 'Your selected stock volume produces a concentration within the activity criterion.',
    low: 'The selected stock volume is too small, so the calculated final concentration is below the target.',
    high: 'The selected stock volume is too large, so the calculated final concentration is above the target.',
    fail: 'No stock volume was submitted.' },
  { id: 'f-stock', stage: 'dilute', skill: 'f', type: 'dose',
    system: 'The analytical bench', icon: '\u{1F4A7}',
    goal: 'Calculate the stock volume needed to prepare the stated working concentration at the stated final volume.',
    why: 'Analytical reagents must be prepared to known concentrations. Measure the stock volume, then dilute to the final volume rather than treating the water volume as simply V2 - V1.',
    constraints: { stocks: ['hydrochloric acid', 'sulfuric acid', 'nitric acid'], v2: [250, 500] },
    bands: DILUTION_BANDS,
    delta: { ok: -0.03, low: 0.03, high: 0.03 },
    actionLabel: 'Submit dilution',
    safeState: 'MEETS ACTIVITY CRITERION', lowState: 'BELOW TARGET', highState: 'ABOVE TARGET',
    safe: 'Your selected stock volume gives the target working concentration within the activity criterion.',
    low: 'The selected stock volume is too small. Recalculate V1 = C2V2 / C1.',
    high: 'The selected stock volume is too large. Recalculate V1 = C2V2 / C1.',
    fail: 'No stock volume was submitted.' },

  // ---------- Honors: Ksp / ion product ----------
  { id: 'h1-ksp', stage: 'honors1', skill: 'h1', type: 'decision',
    system: 'The clearwell', icon: '\u{1F4C9}',
    goal: 'Calculate the ion product Q from the given ion concentrations and compare it with Ksp to predict whether a precipitate forms.',
    why: 'For these 1:1 salts, Q > Ksp indicates supersaturation and precipitation is favored; Q < Ksp indicates an unsaturated solution. Adding a common ion can increase Q.',
    delta: { ok: -0.03, wrong: 0.02 },
    actionLabel: 'Submit prediction',
    right: 'Your comparison of Q with Ksp gives the correct precipitation prediction.',
    wrong: 'Recalculate Q = [cation][anion] and compare it directly with Ksp before selecting the outcome.' },

  // ---------- Honors: quantitative crystallization ----------
  { id: 'h2-crys', stage: 'honors2', skill: 'h2', type: 'dose',
    system: 'The cooling tank', icon: '\u{1F9CA}',
    goal: 'Calculate how many grams crystallize when a saturated solution is cooled from the first temperature to the second.',
    why: 'Read the solubility at both temperatures, scale each value to the actual mass of water, then subtract the amount that can remain dissolved after cooling.',
    bands: CRYS_BANDS,
    delta: { ok: -0.03, low: 0.02, high: 0.02 },
    actionLabel: 'Submit mass',
    safeState: 'MEETS ACTIVITY CRITERION', lowState: 'BELOW CALCULATED MASS', highState: 'ABOVE CALCULATED MASS',
    safe: 'Your calculated crystallized mass is within the activity criterion.',
    low: 'Your mass is below the calculated value. Recheck both curve readings and the scale factor for the mass of water.',
    high: 'Your mass is above the calculated value. Recheck both curve readings and subtract the lower-temperature dissolved mass from the higher-temperature mass.',
    fail: 'No crystallized mass was submitted.' },

  // ---------- Capstone ----------
  { id: 'cap-batch', stage: 'capstone', skill: 'cap', type: 'decision',
    system: 'Integrated batch', icon: '\u{1F3AF}',
    goal: 'Complete one integrated run: classify the stock, prepare the target molarity, then predict the products and any precipitate.',
    why: 'The capstone combines the same chemistry used in the core stages. Each step must be correct for the complete batch to meet the activity criterion.',
    delta: { ok: -0.5, wrong: 0.04 },
    right: 'All three steps are correct: the stock classification, prepared molarity, and product-state predictions meet the activity criteria.',
    wrong: 'At least one step needs revision. Use the feedback to identify whether the error is in classification, molarity, or the solubility rules.' }
];
