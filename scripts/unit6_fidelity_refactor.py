from pathlib import Path
import re

ROOT = Path('.')


def read(path):
    return (ROOT / path).read_text(encoding='utf-8')


def write(path, text):
    (ROOT / path).write_text(text, encoding='utf-8')


def replace_exact(path, old, new, expected=1):
    text = read(path)
    count = text.count(old)
    if count != expected:
        raise SystemExit(f'{path}: expected {expected} occurrence(s) of {old!r}, found {count}')
    write(path, text.replace(old, new, expected))


def replace_present(path, old, new):
    text = read(path)
    if old not in text:
        raise SystemExit(f'{path}: missing expected text {old!r}')
    write(path, text.replace(old, new))


MODEL = 'units/06-reactions-stoichiometry/js/model.js'
MAIN = 'units/06-reactions-stoichiometry/js/main.js'
ART = 'units/06-reactions-stoichiometry/js/art.js'
CASE = 'units/06-reactions-stoichiometry/js/case.js'
INDEX = 'units/06-reactions-stoichiometry/index.html'

# ---------------------------------------------------------------------------
# model.js: replace the entire student-facing scenario layer. Reaction data,
# generator constraints, thresholds, and scenario IDs remain unchanged.
# ---------------------------------------------------------------------------
model = read(MODEL)
model = model.replace(
    '// Rule of thumb used for the Redox tag at HS level: a free element (single-element\n// formula) appearing as a reactant or product means oxidation states change.\n',
    '// Redox subtype data are curated for this reaction bank. A free element can be a\n// useful clue, but students should confirm that oxidation numbers change.\n'
)
marker = 'export const SCENARIOS = ['
idx = model.find(marker)
if idx < 0:
    raise SystemExit('model.js: SCENARIOS marker not found')

scenarios = r'''export const SCENARIOS = [
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
'''
model = model[:idx] + scenarios
write(MODEL, model)

# ---------------------------------------------------------------------------
# main.js: standards wording, dynamic feedback, references, and simulation
# labels. Logic and numeric thresholds are intentionally unchanged.
# ---------------------------------------------------------------------------
main = read(MAIN)
main = main.replace("from './model.js';", "from './model.js?v=u6-3';")
main = main.replace("from './art.js';", "from './art.js?v=u6-3';")
main = main.replace("text: 'Describe and apply the concept of limiting reactants.'", "text: 'Describe the concept of limiting reactants.'")
main = main.replace("label: 'Balance it'", "label: 'Balance equations'")
main = main.replace("label: 'Classify it'", "label: 'Classify reactions'")
main = main.replace("label: 'Size the dose'", "label: 'Stoichiometry'")
main = main.replace("label: 'Excess recovery'", "label: 'Excess remaining'")
main = main.replace("label: 'The tanker'", "label: 'Capstone'")

repls = {
    "return 'Pick a bench. Every call comes down to the same question: what reaction is running, and how much of what does it take to stop it.';": "return 'Choose an activity. Balance, classify, calculate, compare, and explain your answer from the chemical evidence.';",
    "out.push({ k: 'Conservation', v: 'the same count of every element on both sides' });": "out.push({ k: 'Conservation', v: 'the same number of each type of atom on both sides' });",
    "out.push({ k: 'Lowest terms', v: 'divide the whole set by its common factor before you call it' });": "out.push({ k: 'Lowest terms', v: 'use the smallest whole-number coefficient set' });",
    "out.push({ k: 'A free element', v: 'on either side means oxidation states moved: redox' });": "out.push({ k: 'Redox check', v: 'a free element can be a clue; confirm that oxidation numbers change' });",
    "out.push({ k: 'Two solutions', v: 'leaving a solid is precipitation; acid plus base is acid-base' });": "out.push({ k: 'Subtypes', v: 'a solid from aqueous ions indicates precipitation; acid plus base can be acid-base' });",
    "out.push({ k: 'The route', v: 'grams, mol, mole ratio, mol, grams. Four steps, always' });": "out.push({ k: 'Mass-to-mass route', v: 'grams -> moles -> mole ratio -> moles -> grams' });",
    "out.push({ k: 'Mole ratio', v: 'the coefficients of the balanced equation, nothing else' });": "out.push({ k: 'Mole ratio', v: 'use coefficients from the balanced equation' });",
    "out.push({ k: 'Both halves', v: 'which reactant runs out, then what that much can make' });": "out.push({ k: 'Two steps', v: 'identify the limiting reactant, then calculate theoretical product' });",
    "out.push({ k: 'The test', v: 'take each reactant all the way to product; the smaller answer wins' });": "out.push({ k: 'Limiting test', v: 'calculate product from each reactant; the smaller product amount identifies the limiting reactant' });",
    "out.push({ k: 'What is left', v: 'starting mol of the excess, minus the mol it actually used' });": "out.push({ k: 'What is left', v: 'starting moles of excess reactant minus moles consumed' });",
    "out.push({ k: 'What it used', v: 'comes off the LIMITING reactant, through the mole ratio' });": "out.push({ k: 'Moles consumed', v: 'use the limiting reactant and the balanced-equation mole ratio' });",
    "out.push({ k: 'Then back', v: 'times its molar mass, because the compartment is weighed in grams' });": "out.push({ k: 'Return to grams', v: 'multiply remaining moles by molar mass' });",
    "out.push({ k: 'The call', v: 'lay it now, dam and hold for aid, or withdraw to the state team' });": "out.push({ k: 'Activity choices', v: 'compare required mass with simulated available inventory' });",
    "state: 'READ FROM THE BOOK'": "state: 'ANSWER SHOWN'",
    "headline: 'You looked it up'": "headline: 'Answer shown'",
    "detail: `The coefficients are on the page now, but this one does not count toward the run. ${sc.wrong}`": "detail: `The coefficients are shown. This problem does not count toward mastery. ${sc.wrong}`",
    "headline: 'Atoms balance, coefficients do not reduce'": "headline: 'Balanced, but not in lowest terms'",
    "detail: `Every element tallies, but the coefficients share a common factor. An equation is not written until it is in the smallest whole numbers. ${sc.wrong}`": "detail: `Every element is balanced, but the coefficients share a common factor. Divide the entire set to obtain the smallest whole-number coefficients. ${sc.wrong}`",
    "state: 'CALLED IT'": "state: 'CLASSIFIED'",
    "state: 'WRONG CLASS'": "state: 'INCORRECT TYPE'",
    "state: 'WRONG SUB-TYPE'": "state: 'INCORRECT SUBTYPE'",
    "headline: 'Right type, wrong chemistry underneath'": "headline: 'Type correct; subtype incorrect'",
    "detail: `${rxn.structural} is right, but the sub-classification is not: this one is ${subList}. That is the half that tells you what the products do once they are in the ditch.`": "detail: `${rxn.structural} is correct, but the subtype selection is not. This reaction is ${subList}. Review what changes chemically in the reaction.`",
    "headline: 'Nothing to act on'": "headline: 'Enter a numerical answer'",
    "headline: 'Called it'": "headline: 'Calculation accepted'",
    "headline: 'Called it low'": "headline: 'Calculated value too low'",
    "headline: 'Called it high'": "headline: 'Calculated value too high'",
    "detail: `You called ${yours}; it works out to ${needTxt}. ${sc.safe}`": "detail: `You entered ${yours}; the theoretical value is ${needTxt}. ${sc.safe}`",
    "detail: `You called ${yours}, ${off} under the ${needTxt} it actually comes to. ${sc.low}`": "detail: `You entered ${yours}, which is ${off} below the theoretical value of ${needTxt}. ${sc.low}`",
    "detail: `You called ${yours}, ${off} over the ${needTxt} it actually comes to. ${sc.high}`": "detail: `You entered ${yours}, which is ${off} above the theoretical value of ${needTxt}. ${sc.high}`",
    "headline: `${this.lm.limiting} runs out first`": "headline: `${this.lm.limiting} is the limiting reactant`",
    "detail: `You called ${yours} and it comes to ${needTxt}. ${sc.safe}`": "detail: `You entered ${yours}; the theoretical product is ${needTxt}. ${sc.safe}`",
    "state: 'WRONG REACTANT'": "state: 'INCORRECT REACTANT'",
    "headline: `${this.lm.limiting} is what runs out, not ${this.lmPick}`": "headline: `${this.lm.limiting} is limiting, not ${this.lmPick}`",
    "detail: `Work the yield off ${this.lm.limiting} and it comes to ${needTxt}. Off ${this.lmPick}, which is still sitting there in excess when the reaction stops, you get a number the reaction was never going to reach. ${sc.high}`": "detail: `Calculate theoretical yield from ${this.lm.limiting}; it gives ${needTxt}. ${this.lmPick} is in excess and cannot set the theoretical product amount. ${sc.high}`",
    "headline: 'Right reactant, yield too low'": "headline: 'Limiting reactant correct; yield too low'",
    "headline: 'Right reactant, yield too high'": "headline: 'Limiting reactant correct; yield too high'",
    "detail: `${this.lm.limiting} is the one that runs out, so that half is right. But you called ${yours}, ${off} under the ${needTxt} it makes. ${sc.low}`": "detail: `${this.lm.limiting} is the limiting reactant, but ${yours} is ${off} below the theoretical value of ${needTxt}. ${sc.low}`",
    "detail: `${this.lm.limiting} is the one that runs out, so that half is right. But you called ${yours}, ${off} over the ${needTxt} it makes. ${sc.high}`": "detail: `${this.lm.limiting} is the limiting reactant, but ${yours} is ${off} above the theoretical value of ${needTxt}. ${sc.high}`",
    "state: 'NO COUNT'": "state: 'ENTER A COUNT'",
    "headline: 'Nothing to file'": "headline: 'Enter a particle count'",
    "headline: 'Count filed'": "headline: 'Particle count accepted'",
    "detail: `You filed ${yours}; the mass works out to ${needTxt}. ${sc.safe}`": "detail: `You entered ${yours}; the mass corresponds to ${needTxt}. ${sc.safe}`",
    "detail: `You filed ${yours} against ${needTxt}. ${lowSide ? sc.low : sc.high}`": "detail: `You entered ${yours}; the target is ${needTxt}. ${lowSide ? sc.low : sc.high}`",
    "state: 'NO FIGURE'": "state: 'ENTER A MASS'",
    "headline: 'Nothing to book in'": "headline: 'Enter the remaining mass'",
    "headline: 'Booked back in'": "headline: 'Remaining mass accepted'",
    "detail: `You booked ${yours}; ${needTxt} is what is actually left once ${this.h2s.limiting} is spent. ${sc.safe}`": "detail: `You entered ${yours}; ${needTxt} remains after ${this.h2s.limiting} is consumed. ${sc.safe}`",
    "headline: lowSide ? 'Booked back short' : 'Booked back long'": "headline: lowSide ? 'Remaining mass too low' : 'Remaining mass too high'",
    "detail: `You booked ${yours} against ${needTxt}. ${lowSide ? sc.low : sc.high}`": "detail: `You entered ${yours}; the calculated remainder is ${needTxt}. ${lowSide ? sc.low : sc.high}`",
    "state: 'RIGHT CALL'": "state: 'SUPPORTED CHOICE'",
    "headline: 'Right call'": "headline: 'Evidence-supported choice'",
    "state: 'WRONG CALL'": "state: 'UNSUPPORTED CHOICE'",
    "headline: 'Wrong call'": "headline: 'Choice not supported by the activity data'",
}
for old, new in repls.items():
    if old not in main:
        raise SystemExit(f'main.js: missing expected student-facing string: {old}')
    main = main.replace(old, new)

# World-log language and simulation status labels.
main = main.replace("text: `${sc.system}, looked up`", "text: `${sc.system}, answer shown`")
main = main.replace("text: `${sc.system}, ${good ? 'dose called' : 'dose missed'}`", "text: `${sc.system}, ${good ? 'calculation correct' : 'calculation incorrect'}`")
main = main.replace("text: `${sc.system}, ${good ? 'yield called' : 'yield missed'}`", "text: `${sc.system}, ${good ? 'yield correct' : 'yield incorrect'}`")
main = main.replace("text: `${sc.system}, ${good ? 'count filed' : 'count rejected'}`", "text: `${sc.system}, ${good ? 'particle count correct' : 'particle count incorrect'}`")
main = main.replace("text: `${sc.system}, ${good ? 'recovery booked' : 'recovery wrong'}`", "text: `${sc.system}, ${good ? 'remainder correct' : 'remainder incorrect'}`")
main = main.replace("text: `${sc.system}, ${good ? 'right call' : 'wrong call'}`", "text: `${sc.system}, ${good ? 'supported choice' : 'unsupported choice'}`")
main = main.replace("hint: 'minutes burned out of a twelve hour rotation; a wrong call costs about three times a right one'", "hint: 'simulated minutes used; incorrect submissions use more simulated time than correct submissions'")
main = main.replace("hint: 'calls you have logged on this rotation, right or wrong'", "hint: 'problems submitted in this simulation'")
main = main.replace("hint: 'of the calls you have made, the share that were right'", "hint: 'percentage of submitted problems answered correctly'")
main = main.replace("hint: 'core skills certified: three right in a row on each of C.9(A) to C.9(D)'", "hint: 'core skills mastered: three correct in a row on each of C.9(A) to C.9(D)'")
write(MAIN, main)

# ---------------------------------------------------------------------------
# index.html: static directions, UI labels, accessibility text, and cache keys.
# ---------------------------------------------------------------------------
index = read(INDEX)
index_repls = {
    'content="Second due on a rural fire and hazmat rotation: balance and classify the reaction that is running, then work out how much of what it takes to stop it. Limiting reactants, percent yield and gas volume, against a truck with 50 kg of caustic soda on it. TEKS C.9."': 'content="Practice balancing and classifying chemical reactions, stoichiometric calculations, percent yield, gas volume, and limiting reactants. Includes an evidence-based simulation and TEKS C.9 alignment."',
    'aria-label="Unit 6 hazmat rotation cockpit"': 'aria-label="Unit 6 reactions and stoichiometry workspace"',
    'aria-label="Rotation benches"': 'aria-label="Unit 6 activities"',
    '>Call it in</button>': '>Submit answer</button>',
    '>Reset to 1s</button>': '>Reset coefficients</button>',
    '>Next call</button>': '>Next problem</button>',
    "x-text=\"'Name the reaction type first. The second question is optional.'\"": "x-text=\"'Select the reaction type first, then select every subtype that applies.'\"",
    '<label for="stInput">Your call (g <span x-formula="st.find.f"></span>)</label>': '<label for="stInput">Calculated mass (g <span x-formula="st.find.f"></span>)</label>',
    "x-text=\"'Work the four-step route out, then type the grams.'\"": "x-text=\"'Use the mass-to-mass stoichiometry route, then enter the calculated grams.'\"",
    "x-text=\"!lmPick ? 'Say which reactant runs out first.' : 'Now type how much product that allows.'\"": "x-text=\"!lmPick ? 'Select the limiting reactant.' : 'Now enter the theoretical product mass.'\"",
    '<div class="note note-info mt-2" x-show="!h1Unlocked">Certify C.9(C) first: three stoichiometry calls right in a row unlocks this bench.</div>': '<div class="note note-info mt-2" x-show="!h1Unlocked">Master C.9(C) first: three correct stoichiometry problems in a row unlock this activity.</div>',
    '<div class="note note-info mt-2" x-show="!h2Unlocked">Certify C.9(D) first: three limiting-reactant calls right in a row unlocks this bench.</div>': '<div class="note note-info mt-2" x-show="!h2Unlocked">Master C.9(D) first: three correct limiting-reactant problems in a row unlock this activity.</div>',
    'Certify all four core skills to take this call. Balance, classify, dose and limiting reactant each need three right in a row. Certified so far:': 'Master all four core skills to unlock the capstone. Balance, classify, stoichiometry, and limiting reactant each need three correct in a row. Mastered so far:',
    '<p class="small muted mt-3 mb-2">One call. What do you do?</p>': '<p class="small muted mt-3 mb-2">Compare the required and simulated available amounts. Which option is supported?</p>',
    '>Make the call</button>': '>Submit decision</button>',
    "x-text=\"'Make the call on the tanker first.'\"": "x-text=\"'Select one option before submitting.'\"",
    '>too little</div>': '>too low</div>',
    '>on spec</div>': '>within activity tolerance</div>',
    '>too much</div>': '>too high</div>',
    '>too few</div>': '>too low</div>',
    '>too many</div>': '>too high</div>',
    '>booked short</div>': '>too low</div>',
    '>booked long</div>': '>too high</div>',
    '<p class="eyebrow mt-4">What actually happened in there</p>': '<p class="eyebrow mt-4">Theoretical reaction result</p>',
    '<span class="command-kicker">The rotation</span>': '<span class="command-kicker">Simulation progress</span>',
    '<strong x-text="calls"></strong> calls logged': '<strong x-text="calls"></strong> problems submitted',
    '<strong x-text="rightCalls"></strong> right': '<strong x-text="rightCalls"></strong> correct',
}
for old, new in index_repls.items():
    if old not in index:
        raise SystemExit(f'index.html: missing expected string: {old}')
    index = index.replace(old, new)
index = index.replace('css/style.css?v=u6-2', 'css/style.css?v=u6-3')
index = index.replace("import('./js/main.js?v=u6-2')", "import('./js/main.js?v=u6-3')")
index = index.replace("import('./js/case.js?v=u6-1')", "import('./js/case.js?v=u6-2')")
write(INDEX, index)

# ---------------------------------------------------------------------------
# art.js: revise captions and embedded diagram labels without changing geometry.
# ---------------------------------------------------------------------------
art = read(ART)
art_repls = {
    'THE LADDER TRUCK - Fe AND O2, NINE WINTERS ON': 'IRON OXIDATION MODEL - BALANCE Fe + O2',
    'SCALING OFF IN SHEETS': 'SIMPLIFIED Fe2O3 MODEL',
    'SHOP ORDER - STEEL AND PRIMER': 'BALANCED-EQUATION COEFFICIENTS',
    'THE BACKYARD BOTTLE - THE FIVE IS THE STORY': 'PROPANE : O2 = 1 : 5',
    'HOW MUCH AIR IT NEEDED': 'STOICHIOMETRIC O2 REQUIREMENT',
    'THE DEPOT AMMONIA LINE - PRE-PLAN, BEFORE 2 A.M.': 'AMMONIA SYNTHESIS - N2 : H2 : NH3',
    'THE H2 FIGURE SETS THE STAGE-BACK': 'BALANCED RATIO: 1 : 3 : 2',
    'THE JUMP KIT - ONE IN, TWO OUT, COLD': 'H2O2 DECOMPOSITION - ONE REACTANT, TWO PRODUCTS',
    'THE DARKROOM ON THIRD - A SOLID OUT OF TWO CLEARS': 'AgCl PRECIPITATE FORMS',
    'THE SILVER IS IN IT': 'AgCl(s) FORMS',
    'THE DITCH AT THE COUNTY LINE - WARM, AND DONE CLIMBING': 'HCl + NaOH - ACID-BASE NEUTRALIZATION',
    'THE GARAGE ON BELL STREET - H2 AT THE CEILING': 'Zn + HCl - CALCULATE THEORETICAL H2',
    'THE DEPOT LOOP - WHAT IS STILL IN THE PIPE': 'AMMONIA SYNTHESIS - STOICHIOMETRIC H2',
    'STAGE-BACK, SET FROM THE H2 MASS': 'CALCULATED STOICHIOMETRIC H2 MASS',
    'TOO CLOSE AND THE PLUME REACHES YOU': 'THIS CALCULATION DOES NOT SET A REAL HAZARD ZONE',
    'THE PROPANE BOBTAIL - THE AIR THE CLOUD HAS TO FIND': 'O2 REQUIRED FOR COMPLETE PROPANE COMBUSTION',
    'TAPE': 'SIM ZONE',
    'PEOPLE INSIDE': 'SIMULATION ONLY',
    'THE ICE-FISHING SHACK - WHICHEVER RAN OUT FIRST': 'LIMITING REACTANT - COMPLETE-COMBUSTION MODEL',
    "mono(100, 44, 'CO', { size: 9, fill: '#c4ced3', ls: '.2em', w: 700 })": "mono(100, 44, 'O2 AVAILABLE', { size: 7, fill: '#c4ced3', ls: '.06em', w: 700 })",
    'LOOKS NORMAL': 'CH4 + O2',
    'O2 GOES FIRST. THAT IS WHY IT IS CO.': 'LIMITING REACTANT SETS MAXIMUM CO2',
    'THE CAUSTIC SODA ON THE TRUCK - HOW FAR THE LINE REACHES': 'LIMITING REACTANT SETS THEORETICAL NaCl',
    'THE CHLORINE SHED - ON THE STOCK, OR STILL IN THE AIR': 'LIMITING REACTANT SETS THEORETICAL AlCl3',
    'WHITE SOLID ON THE STOCK': 'AlCl3 MODEL PRODUCT',
    "mono(348, 62, 'STILL'": "mono(348, 62, 'EXCESS'",
    "mono(348, 72, 'GAS'": "mono(348, 72, 'Cl2'",
    'THE STATE LAB SAMPLE - MASS ON ONE SIDE, COUNT ON THE OTHER': 'MASS -> MOLES -> REPRESENTATIVE PARTICLES',
    'WHAT COMES BACK ON THE TRUCK - START, MINUS WHAT REACTED': 'EXCESS REACTANT: START - REACTED',
    'WHAT IT TAKES vs WHAT YOU HAVE': 'REQUIRED vs SIMULATED AVAILABLE',
    'LAY IT, HOLD FOR AID, OR WITHDRAW': 'SELECT FROM THE SIMULATION OPTIONS',
    'THE TANKER AT THE COUNTY LINE - ONE CALL, BOTH NUMBERS': 'COMPARE REQUIRED AND SIMULATED AVAILABLE AMOUNTS',
}
for old, new in art_repls.items():
    if old not in art:
        raise SystemExit(f'art.js: missing expected label {old!r}')
    art = art.replace(old, new)
write(ART, art)

# ---------------------------------------------------------------------------
# case.js: historically qualify sodium-azide inflators and replace sensational
# language while keeping the shared Case File schema and stage mechanics.
# ---------------------------------------------------------------------------
case = read(CASE)
prefix_re = re.compile(r"export const CASE = \{.*?\n  stage: `", re.S)
new_prefix = r'''export const CASE = {
  id: 'airbag-stoichiometry',
  number: '006',
  kicker: 'historical airbag chemistry',
  title: 'How Early Airbag Inflators Used Stoichiometry',
  teaser: 'A solid propellant generated inflation gas in milliseconds',
  hook: 'Airbags must inflate extremely quickly after a crash. Many older inflators used sodium azide to generate nitrogen gas; modern inflators use several other propellant chemistries.',
  stats: [
    { v: '< 50 ms', k: 'rapid inflation timescale' },
    { v: '2 : 3', k: 'NaN3 to N2 mole ratio' },
    { v: 'historical', k: 'sodium-azide inflator model' }
  ],
  steps: [
    {
      t: 'Milliseconds matter',
      body: 'A crash sensor sends a signal to the inflator, which must generate gas rapidly enough to fill the bag before the occupant moves far forward.',
      chem: 'Reaction rate controls how quickly gas is produced; stoichiometry determines the theoretical amount of gas a reaction can produce.',
      cap: 'Crash detected -> inflator activated -> bag inflates.'
    },
    {
      t: 'A historical gas generator',
      body: 'Many early airbag inflators used sodium azide, NaN3, as part of the gas-generating system. A simplified reaction model is 2 NaN3 -> 2 Na + 3 N2.',
      chem: 'This is a decomposition reaction. The coefficients give a fixed mole ratio: 2 mol NaN3 can produce 3 mol N2.',
      cap: '2 mol NaN3 -> 3 mol N2.'
    },
    {
      t: 'Stoichiometry predicts product',
      body: 'Once an amount of sodium azide is specified, the balanced equation can be used to calculate the theoretical amount of nitrogen gas. For example, 0.10 mol NaN3 corresponds to 0.15 mol N2.',
      chem: 'Start with the known amount and multiply by the mole ratio from the balanced equation.',
      cap: 'Known amount -> mole ratio -> theoretical N2.'
    },
    {
      t: 'Real inflators are more complex',
      body: 'An actual inflator must control reaction rate, gas production, temperature, pressure, solid byproducts, and the strength of the housing. Propellant formulations have also changed since early sodium-azide designs.',
      chem: 'A balanced equation provides stoichiometric relationships, but safe engineering also requires kinetics, materials science, testing, and controlled reaction conditions.',
      cap: 'Stoichiometry is one part of the engineering design.'
    }
  ],
  quiz: {
    q: 'For the historical model 2 NaN3 -> 2 Na + 3 N2, how many moles of N2 can form from 0.10 mol NaN3?',
    options: [
      { label: '0.15 mol of N2', correct: true },
      { label: '0.10 mol of N2', correct: false },
      { label: '0.067 mol of N2', correct: false }
    ],
    explain: 'Use the 3 mol N2 / 2 mol NaN3 mole ratio: 0.10 mol NaN3 x 3/2 = 0.15 mol N2.'
  },
  punch: 'A balanced equation does not design an airbag by itself, but it gives engineers the mole relationships needed to predict how much gas a reaction can produce.',
  careers: ['Automotive safety engineer', 'Propellant chemist', 'Crash-test engineer', 'Chemical process engineer'],
  cta: { label: 'Practice the stoichiometry', call: "setMode('stoich')" },
  stage: `'''
case, n = prefix_re.subn(lambda m: new_prefix, case, count=1)
if n != 1:
    raise SystemExit(f'case.js: expected one CASE prefix, replaced {n}')
case_repls = {
    'aria-label="Animated scene: a crash triggers sodium azide decomposition and the airbag inflates on a millisecond timeline"': 'aria-label="Animated scene illustrating a historical sodium-azide airbag inflator and stoichiometric gas generation"',
    '>0 ms</text>': '>crash</text>',
    '>15 ms: ignite</text>': '>sensor</text>',
    '>30 ms: full</text>': '>inflator</text>',
    '>50 ms: impact absorbed</text>': '>bag deployed</text>',
    '>INFLATOR: 130 g NaN3 PELLET</text>': '>HISTORICAL NaN3 INFLATOR</text>',
    '>130 g NaN3</text>': '>0.10 mol</text>',
    '>2 mol</text>': '>NaN3</text>',
    '>&#215;3/2 = 3 mol</text>': '>&#215;3/2</text>',
    '>~67 L N2</text>': '>0.15 mol N2</text>',
    '>Na + KNO3 + SiO2 &#8594; safe silicate glass</text>': '>BYPRODUCTS REQUIRE CONTROL</text>',
}
for old, new in case_repls.items():
    if old not in case:
        raise SystemExit(f'case.js: missing expected stage label {old!r}')
    case = case.replace(old, new)
write(CASE, case)

print('Unit 6 language/scientific-fidelity refactor applied.')
