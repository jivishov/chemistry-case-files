from pathlib import Path
import re

ROOT = Path('.')
STAMP = 'u9-fidelity-20260826'
CDN = 'https://cdn.jsdelivr.net/npm/alpinejs@3.14.1/dist/module.esm.js'


def read(path):
    return Path(path).read_text(encoding='utf-8')


def write(path, text):
    Path(path).write_text(text, encoding='utf-8')


def replace(text, old, new, label):
    if old not in text:
        raise RuntimeError(f'{label}: expected text not found')
    return text.replace(old, new)


def sub1(text, pattern, repl, label, flags=re.S):
    new, n = re.subn(pattern, lambda m: repl, text, count=1, flags=flags)
    if n != 1:
        raise RuntimeError(f'{label}: expected one match, got {n}')
    return new


# ---------------------------------------------------------------------------
# Restore Alpine 3.14.1 loading across the site.
# The recent local-vendor change introduced a file named 3.14.1 whose own
# Alpine.version is 3.13.10. Use the exact CDN module the pages used before.
# ---------------------------------------------------------------------------
for html in [Path('index.html'), Path('units/index.html'), *sorted(Path('units').glob('*/index.html'))]:
    if not html.exists():
        continue
    t = html.read_text(encoding='utf-8')
    t = re.sub(
        r"import Alpine from ['\"][^'\"]*shared/vendor/alpine-3\.14\.1\.esm\.min\.js['\"]\s*;",
        f"import Alpine from '{CDN}';",
        t,
    )
    t = re.sub(
        r"const \{ default: Alpine \} = await import\(['\"][^'\"]*shared/vendor/alpine-3\.14\.1\.esm\.min\.js['\"]\);",
        f"const {{ default: Alpine }} = await import('{CDN}');",
        t,
    )
    html.write_text(t, encoding='utf-8')


# ---------------------------------------------------------------------------
# Unit 9 model: standards copy, reference context, definitions, strength logic,
# weak-acid pool, and full scenario layer.
# ---------------------------------------------------------------------------
model_path = Path('units/09-acids-bases/js/model.js')
model = read(model_path)

model = replace(model,
"    text: 'Define acids and bases; distinguish Arrhenius from Bronsted-Lowry and identify the conjugate pair.' },",
"    text: 'Define acids and bases; distinguish Arrhenius from Brønsted-Lowry and identify conjugate acid-base pairs.' },",
'model TEKS B')
model = replace(model,
"    text: 'Differentiate strong from weak acids and bases by their extent of dissociation.' },",
"    text: 'Differentiate strong from weak acids and bases by the extent to which they ionize or react with water.' },",
'model TEKS C')
model = replace(model,
"    text: 'Honors: drive a titration curve to the equivalence point and pick the indicator.' },",
"    text: 'Honors: analyze a strong-acid/strong-base titration curve and identify the equivalence point.' },",
'model honors h1')
model = replace(model,
"    text: 'Honors: find the pH of a weak acid from its Ka, including polyprotic acids.' }",
"    text: 'Honors: calculate the pH of a weak monoprotic acid from its Ka and concentration.' }",
'model honors h2')

where_map = {
'glass-etching cream, and the one burn that hides for hours': 'glass etching and specialized industrial processing',
'sold as muriatic acid for concrete and pool pH; also your stomach': 'muriatic-acid products, pool pH control, and gastric acid',
'a lab reagent drum, and older flame-retardant chemistry': 'laboratory synthesis and industrial chemical processing',
'a lab reagent that browns on the shelf as it oxidises in light': 'a laboratory reagent that can darken as iodide is oxidized',
'rotten-egg gas dissolved in water, in sewers and hot springs': 'aqueous hydrogen sulfide in natural waters and some industrial systems',
'fertilizer plants and metal etching; it stains skin yellow on contact': 'fertilizer production and metal processing',
'formed in place from nitrite in cured-meat chemistry': 'nitrite chemistry in aqueous and food systems',
'car battery acid, and the most-produced chemical on earth': 'lead-acid batteries and large-scale industrial chemical production',
'what sulfur dioxide becomes when it dissolves in rain': 'aqueous sulfur dioxide and sulfite chemistry',
'every carbonated drink, rainwater, and your own blood buffer': 'carbonated water, rainwater, and the carbonic-acid/bicarbonate buffer system',
'the tang in cola, and the rust converter in a hardware aisle': 'some soft drinks, rust treatment, and industrial phosphate chemistry',
'a lab reducing agent, and a fungicide feedstock': 'laboratory reducing chemistry and industrial synthesis',
'vinegar, at about 5 percent': 'vinegar, commonly about 5% acetic acid by volume or mass depending on labeling',
'the oxidiser cabinet, and solid rocket propellant': 'specialized laboratory and industrial oxidation chemistry',
'a strong bleaching and oxidising agent, unstable when concentrated': 'chlorate chemistry; concentrated chloric acid is unstable',
'the short-lived acid behind chlorite bleaching': 'aqueous chlorite chemistry and chlorine-dioxide generation processes',
'what bleach becomes in pool water; the form that actually disinfects': 'a disinfecting species formed in chlorine-based water treatment',
'the carbon-dioxide scrubber on a submarine and a spacecraft': 'carbon-dioxide scrubbing in specialized life-support systems',
'drain cleaner and lye; the most common caustic call on this line': 'lye, some drain cleaners, and industrial processing',
'the electrolyte inside an alkaline battery, and soft soap': 'alkaline-battery electrolyte and soap manufacture',
'milk of magnesia, off a bathroom shelf': 'milk of magnesia and some antacid products',
'slaked lime, in mortar and in water treatment': 'slaked lime, mortar, and water treatment',
'a lab titrant for weak acids; barium salts are their own poisoning': 'laboratory titration and analytical chemistry',
'the gel in a chewable antacid tablet': 'some antacid formulations and water-treatment applications',
'the green sludge in an oxygen-poor rust pit': 'iron chemistry in oxygen-poor aqueous environments',
'the orange stain in the creek below an iron-rich spring': 'iron-rich waters and rust-colored mineral deposits',
'muriatic acid, poured for concrete and pool pH': 'muriatic-acid products used for masonry and pool pH control',
'a lab reagent drum in the store room': 'a laboratory reagent used in chemical synthesis',
'the metal-etching bath in a machine shop': 'metal processing and laboratory oxidation chemistry',
'the oxidiser cabinet, kept away from everything organic': 'specialized laboratory oxidation chemistry',
'battery acid, and the carboy under the bench': 'lead-acid batteries and industrial sulfuric-acid use',
}
for old, new in where_map.items():
    model = model.replace(old, new)

# Improve the Arrhenius/Brønsted-Lowry cards.
framework_repls = {
'"An acid is any substance that produces H+ ions when dissolved in water."': '"An Arrhenius acid increases the concentration of H3O+ in water."',
'"A base is any substance that produces OH- ions when dissolved in water."': '"An Arrhenius base increases the concentration of OH- in water."',
'Arrhenius defines acids and bases by the ions they release in water: H+ for an acid.': 'In water, an Arrhenius acid increases H3O+ concentration.',
'Arrhenius bases release OH- in water.': 'In water, an Arrhenius base increases OH- concentration.',
'Bronsted-Lowry': 'Brønsted-Lowry',
'NH3 has no OH- to release, yet it makes a solution basic by taking H+ from water.': 'NH3 has no OH- in its formula, yet it makes water basic by accepting a proton from H2O and producing OH-.',
'Arrhenius cannot call NH3 a base (it has no OH-). Bronsted-Lowry can: NH3 accepts a proton.': 'Brønsted-Lowry describes NH3 directly as a base because NH3 accepts a proton. In water, that reaction also increases [OH-].',
}
for old, new in framework_repls.items():
    model = model.replace(old, new)

strength_reason = """export const STRENGTH_REASON = {
  acid: {
    q: 'At equal formal concentration, why do strong acids in this activity generally have lower pH than weak acids?',
    options: [
      'Strong acids ionize essentially completely in water, producing more H3O+ than weak acids.',
      'Strong acids simply contain more hydrogen atoms.',
      'Strong acids are always more concentrated.',
      'Strong acids are always larger molecules.'
    ],
    answer: 'Strong acids ionize essentially completely in water, producing more H3O+ than weak acids.'
  },
  base: {
    q: 'At equal formal concentration, why do the strong bases in this activity generally have higher pH than weak bases?',
    options: [
      'Strong soluble hydroxides dissociate essentially completely, producing more OH- than weak bases.',
      'Strong bases simply contain more oxygen atoms.',
      'Strong bases are always more concentrated.',
      'Strong bases are always heavier compounds.'
    ],
    answer: 'Strong soluble hydroxides dissociate essentially completely, producing more OH- than weak bases.'
  }
};"""
model = sub1(model, r"export const STRENGTH_REASON = \{.*?\n\};\n\n// ===================== C\.12\(D\)", strength_reason + "\n\n// ===================== C.12(D)", 'strength reason')

weak_block = """export const WEAK_ACIDS = [
  { f: 'CH3COOH',  name: 'acetic acid',       Ka: 1.8e-5, poly: false, note: '' },
  { f: 'HF',       name: 'hydrofluoric acid', Ka: 6.8e-4, poly: false, note: '' },
  { f: 'HCOOH',    name: 'formic acid',       Ka: 1.8e-4, poly: false, note: '' },
  { f: 'HClO',     name: 'hypochlorous acid', Ka: 3.0e-8, poly: false, note: '' },
  { f: 'C6H5COOH', name: 'benzoic acid',      Ka: 6.3e-5, poly: false, note: '' }
];"""
model = sub1(model, r"export const WEAK_ACIDS = \[.*?\n\];\nexport const WEAK_CONCS", weak_block + "\nexport const WEAK_CONCS", 'weak acid pool')

scenarios = r"""export const SCENARIOS = [
  // ---------- C.12(A) naming ----------
  { id: 'a-caller', stage: 'naming', skill: 'a', type: 'identity',
    system: 'Formula on the label', icon: '\u{1F4DE}',
    goal: 'A product label gives only a chemical formula. Build the correct acid or base name from its parts.',
    why: 'A correct chemical name communicates which substance the formula represents. Use the naming pattern, not the scenario, to determine the name.',
    constraints: { formulas: ['HF', 'HCl', 'HBr', 'HI', 'H2S', 'LiOH', 'NaOH', 'KOH', 'Ba(OH)2', 'Fe(OH)2', 'Fe(OH)3'] },
    delta: { ok: 0, wrong: 0 }, minutes: { ok: 6, wrong: 16 },
    actionLabel: 'Check the name',
    right: 'The formula and name match.',
    wrongStem: 'The selected element or charge does not match the formula. Check the formula before choosing the name parts.',
    wrongSuffix: 'The element family is correct, but the ending is not. Recheck the binary-acid, oxyacid, or hydroxide naming rule.' },
  { id: 'a-antacid', stage: 'naming', skill: 'a', type: 'identity',
    system: 'Antacid ingredient', icon: '\u{1F48A}',
    goal: 'An antacid label lists its active ingredient as a formula. Name the compound using the hydroxide-base naming rule.',
    why: 'Many antacid ingredients are bases. Naming the compound correctly connects its formula with the ions it contains.',
    constraints: { formulas: ['Mg(OH)2', 'Ca(OH)2', 'Al(OH)3'] },
    delta: { ok: 0, wrong: 0 }, minutes: { ok: 5, wrong: 15 },
    actionLabel: 'Check the ingredient',
    right: 'The formula and compound name match.',
    wrongStem: 'The metal does not match the formula. Identify the cation first.',
    wrongSuffix: 'The anion name is incorrect. These compounds contain hydroxide, OH-.' },
  { id: 'a-sheet', stage: 'naming', skill: 'a', type: 'identity',
    system: 'Laboratory transfer sheet', icon: '\u{1F4CB}',
    goal: 'A transfer sheet lists an acid by formula. Build its correct name using the binary-acid or oxyacid naming pattern.',
    why: 'Related oxyacids can differ by only one oxygen atom, so the prefix and suffix must match the formula.',
    constraints: { formulas: ['HNO3', 'HNO2', 'H2SO4', 'H2SO3', 'H2CO3', 'H3PO4', 'H3PO3', 'HC2H3O2', 'HClO4', 'HClO3', 'HClO2', 'HClO'] },
    delta: { ok: 0, wrong: 0 }, minutes: { ok: 7, wrong: 18 },
    actionLabel: 'Check the sheet',
    right: 'The formula and acid name agree.',
    wrongStem: 'The selected root or prefix does not match the formula.',
    wrongSuffix: 'The root is correct, but the acid ending does not match the related anion.' },

  // ---------- C.12(B) definitions and conjugate pairs ----------
  { id: 'b-ammonia', stage: 'define', skill: 'b', type: 'decision',
    system: 'Acid-base definitions', icon: '\u{1F9F4}',
    goal: 'Identify which acid-base definition matches the statement, then identify whether the species is acting as an acid or a base.',
    why: 'Arrhenius focuses on H3O+ and OH- in water. Brønsted-Lowry focuses on proton transfer and applies to a wider range of reactions.',
    constraints: { kinds: ['framework'] },
    delta: { ok: 0, wrong: 0 }, minutes: { ok: 6, wrong: 17 },
    actionLabel: 'Check the definition',
    right: 'The framework and acid-base role are both correct.',
    wrongA: 'The framework is incorrect. Compare what the statement says about water, H3O+, OH-, or proton transfer.',
    wrongB: 'The framework is correct, but the acid-base role is reversed. Check whether the species donates or accepts a proton.' },
  { id: 'b-buffer', stage: 'define', skill: 'b', type: 'decision',
    system: 'Bicarbonate buffer pair', icon: '\u{1FA78}',
    goal: 'Identify the conjugate partner of the species on the card and determine whether that species is acting as an acid or a base.',
    why: 'Conjugate acid-base pairs differ by one H+. The carbonic-acid/bicarbonate system is an important real-world example of this relationship.',
    constraints: { kinds: ['conjugate'] },
    delta: { ok: 0, wrong: 0 }, minutes: { ok: 7, wrong: 19 },
    actionLabel: 'Check the pair',
    right: 'The conjugate partner and acid-base role are correct.',
    wrongA: 'The selected partner is not the conjugate species. Conjugate partners differ by exactly one H+.',
    wrongB: 'The partner is correct, but the role is reversed. A Brønsted-Lowry acid donates H+; a base accepts H+.' },

  // ---------- C.12(C) strong versus weak ----------
  { id: 'c-sink', stage: 'strength', skill: 'c', type: 'decision',
    system: 'Acid comparison', icon: '\u{1F374}',
    goal: 'Classify the acids as strong or weak, then explain how acid strength affects [H3O+] at equal formal concentration.',
    why: 'Strength and concentration are different properties. Strong acids ionize essentially completely in water; weak acids ionize only partially.',
    constraints: { fams: ['acid'], strong: ['HCl', 'H2SO4'], weak: ['CH3COOH', 'H2CO3', 'H3PO4', 'HClO'], must: ['CH3COOH', 'HCl'] },
    delta: { ok: 0, wrong: 0 }, minutes: { ok: 7, wrong: 18 },
    actionLabel: 'Check the classification',
    right: 'The acids are classified by their extent of ionization in water.',
    wrongSort: 'At least one acid is on the wrong side. Recheck which acids are treated as strong in this course.',
    wrongReason: 'The classifications are correct, but the explanation confuses strength with concentration or molecular composition.' },
  { id: 'c-cart', stage: 'strength', skill: 'c', type: 'decision',
    system: 'Base comparison', icon: '\u{1F9F9}',
    goal: 'Classify the bases as strong or weak, then explain why the strong bases produce more OH- at equal formal concentration.',
    why: 'Strong soluble hydroxides dissociate essentially completely. Weak molecular bases such as ammonia react with water only partially.',
    constraints: { fams: ['base'], strong: ['NaOH', 'KOH'], weak: ['NH3', 'CH3NH2', 'C2H5NH2'], must: ['NH3', 'NaOH'] },
    delta: { ok: 0, wrong: 0 }, minutes: { ok: 7, wrong: 18 },
    actionLabel: 'Check the classification',
    right: 'The bases are classified by how they produce OH- in water.',
    wrongSort: 'At least one base is on the wrong side. Recheck the strong hydroxides and weak molecular bases.',
    wrongReason: 'The classifications are correct, but the explanation does not connect base strength with OH- production in water.' },
  { id: 'c-sheet', stage: 'strength', skill: 'c', type: 'decision',
    system: 'Strength and hazard', icon: '\u{1F6A8}',
    goal: 'Classify the four acids as strong or weak, then explain why acid strength is not the same as chemical hazard.',
    why: 'Acid strength describes extent of ionization, not overall danger. For example, HF is a weak acid but is highly hazardous because fluoride can cause severe local and systemic toxicity.',
    constraints: { fams: ['acid'] },
    delta: { ok: 0, wrong: 0 }, minutes: { ok: 8, wrong: 22 },
    actionLabel: 'Check the comparison',
    right: 'The strength classification is correct, and strength has been kept separate from hazard.',
    wrongSort: 'At least one acid is misclassified. Use extent of ionization, not perceived danger.',
    wrongReason: 'The classifications may be correct, but the explanation must distinguish acid strength from hazard.' },

  // ---------- C.12(D) neutralization ----------
  { id: 'd-bucket', stage: 'neutralize', skill: 'd', type: 'dose',
    system: 'Spill-model calculation', icon: '\u{1FAA3}',
    goal: 'For this controlled simulation, predict the salt and calculate the moles of base required for stoichiometric neutralization.',
    why: 'Use the balanced acid-base reaction to match acid equivalents with hydroxide equivalents. Real chemical spills should be handled according to laboratory or emergency procedures, not by improvised neutralization.',
    constraints: { acids: ['HCl', 'HNO3'], bases: ['NaOH', 'KOH'] },
    bands: NEUT_BANDS,
    delta: { ok: 0, low: 0, high: 0 }, minutes: { ok: 9, wrong: 22 },
    actionLabel: 'Check the amount',
    safeState: 'WITHIN TOLERANCE', lowState: 'BELOW TARGET', highState: 'ABOVE TARGET',
    safe: 'The calculated amount satisfies this activity criterion for stoichiometric neutralization.',
    low: 'The amount is below the stoichiometric target. Recheck the acid-to-base mole ratio.',
    high: 'The amount is above the stoichiometric target. Recheck the coefficients and equivalents.',
    saltWrong: 'The neutralization amount is within tolerance, but the salt formula is incorrect. Balance the ion charges again.',
    fail: 'Enter a numerical amount of base before checking the result.' },
  { id: 'd-decon', stage: 'neutralize', skill: 'd', type: 'dose',
    system: 'Wastewater-model calculation', icon: '\u{1F6BF}',
    goal: 'For this activity model, predict the salt and calculate the moles of base required for stoichiometric neutralization.',
    why: 'This activity isolates acid-base stoichiometry. A neutral pH by itself does not establish that real chemical waste is safe or legal to discharge; identity, concentration, and applicable rules also matter.',
    constraints: { acids: ['H2SO4', 'HClO4', 'HBr'], bases: ['Ca(OH)2', 'Ba(OH)2', 'LiOH', 'NaOH'], nonUnity: true },
    bands: NEUT_BANDS,
    delta: { ok: 0, low: 0, high: 0 }, minutes: { ok: 10, wrong: 25 },
    actionLabel: 'Check the amount',
    safeState: 'WITHIN TOLERANCE', lowState: 'BELOW TARGET', highState: 'ABOVE TARGET',
    safe: 'The calculated amount satisfies this activity criterion for neutralization.',
    low: 'The amount is below the stoichiometric target. Recheck how many acidic protons and hydroxides are represented by the formulas.',
    high: 'The amount is above the stoichiometric target. Recheck the balanced mole ratio.',
    saltWrong: 'The amount is within tolerance, but the salt formula is incorrect. Recheck the cation and anion charges.',
    fail: 'Enter a numerical amount of base before checking the result.' },

  // ---------- C.12(E) pH ----------
  { id: 'e-soda', stage: 'meter', skill: 'e', type: 'dose',
    system: 'Soft-drink sample', icon: '\u{1F964}',
    goal: 'Use the measured hydrogen-ion concentration to calculate the pH of the sample, then classify it as acidic, neutral, or basic.',
    why: 'pH is logarithmic. A change of one pH unit corresponds to a tenfold change in hydrogen-ion concentration.',
    constraints: { kinds: ['H'], p: [3, 4] },
    bands: METER_BANDS,
    delta: { ok: 0, low: 0, high: 0 }, minutes: { ok: 6, wrong: 16 },
    actionLabel: 'Check the pH',
    safeState: 'WITHIN TOLERANCE', lowState: 'pH TOO LOW', highState: 'pH TOO HIGH',
    safe: 'The pH and classification agree with the given [H+].',
    low: 'The pH is below the target. Recheck the negative logarithm.',
    high: 'The pH is above the target. Recheck the exponent and logarithm.',
    classWrong: 'The pH is within tolerance, but the classification does not match its position relative to pH 7 for this aqueous sample.',
    fail: 'Set a pH value and choose a classification before checking the result.' },
  { id: 'e-bleach', stage: 'meter', skill: 'e', type: 'dose',
    system: 'Hydroxide sample', icon: '\u{1F9F4}',
    goal: 'The sample is reported as [OH-]. Calculate pOH, convert to pH at 25 °C, then classify the aqueous sample.',
    why: 'At 25 °C, pH + pOH = 14.00. A hydroxide concentration must therefore be converted through pOH before the pH is reported.',
    constraints: { kinds: ['OH'], p: [2, 5] },
    bands: METER_BANDS,
    delta: { ok: 0, low: 0, high: 0 }, minutes: { ok: 7, wrong: 18 },
    actionLabel: 'Check the pH',
    safeState: 'WITHIN TOLERANCE', lowState: 'pH TOO LOW', highState: 'pH TOO HIGH',
    safe: 'The pOH-to-pH conversion and classification are correct for this sample.',
    low: 'The pH is below the target. Check whether the pOH value was converted using pH + pOH = 14.00.',
    high: 'The pH is above the target. Recheck the pOH calculation and subtraction from 14.00.',
    classWrong: 'The pH is within tolerance, but the acidic/neutral/basic classification is incorrect.',
    fail: 'Set a pH value and choose a classification before checking the result.' },
  { id: 'e-gas', stage: 'meter', skill: 'e', type: 'dose',
    system: 'Near-neutral calibration sample', icon: '\u{1FA79}',
    goal: 'Convert the reported hydrogen-ion concentration to pH and classify the aqueous calibration sample.',
    why: 'Near pH 7, small numerical pH differences still represent meaningful multiplicative changes in [H+]. Use the logarithm rather than estimating from the exponent alone.',
    constraints: { kinds: ['H'], p: [7, 8], mantissas: [5, 8] },
    bands: METER_BANDS,
    delta: { ok: 0, low: 0, high: 0 }, minutes: { ok: 8, wrong: 22 },
    actionLabel: 'Check the pH',
    safeState: 'WITHIN TOLERANCE', lowState: 'pH TOO LOW', highState: 'pH TOO HIGH',
    safe: 'The pH and classification agree with the measured [H+].',
    low: 'The pH is below the target. Recheck -log[H+].',
    high: 'The pH is above the target. Recheck -log[H+].',
    classWrong: 'The pH is within tolerance, but the classification is incorrect for an aqueous sample at 25 °C.',
    fail: 'Set a pH value and choose a classification before checking the result.' },

  // ---------- Honors h1: titration ----------
  { id: 'h1-titrate', stage: 'honors1', skill: 'h1', type: 'dose',
    system: 'Strong acid-base titration', icon: '\u{1F9EA}',
    goal: 'Move the titration to the equivalence volume, then select the listed indicator whose transition range includes pH 7.00.',
    why: 'For this strong-acid/strong-base model, equivalence occurs when acid and base equivalents are equal and the modeled equivalence pH is 7.00. Activity criterion: choose the listed indicator whose range includes pH 7.00; in real titrations, more than one indicator can sometimes be suitable because the pH changes steeply near equivalence.',
    delta: { ok: 0, low: 0, high: 0 }, minutes: { ok: 11, wrong: 26 },
    actionLabel: 'Check equivalence',
    safeState: 'WITHIN TOLERANCE', lowState: 'BELOW EQUIVALENCE', highState: 'ABOVE EQUIVALENCE',
    safe: 'The selected volume is within this activity tolerance and the indicator meets the activity criterion.',
    low: 'The selected volume is below the calculated equivalence volume.',
    high: 'The selected volume is above the calculated equivalence volume.',
    indWrong: 'The volume is within tolerance, but the selected indicator does not meet this activity criterion. Choose the listed range that includes pH 7.00.',
    fail: 'Select an indicator and an equivalence volume before checking the result.' },

  // ---------- Honors h2: weak monoprotic acid ----------
  { id: 'h2-weak', stage: 'honors2', skill: 'h2', type: 'dose',
    system: 'Weak-acid equilibrium', icon: '\u{1F9C3}',
    goal: 'Use Ka and the formal concentration of a weak monoprotic acid to calculate equilibrium [H+] and pH.',
    why: 'For a weak acid, the formal acid concentration is not equal to [H+]. Use the equilibrium expression to determine x = [H+] before applying pH = -log[H+].',
    delta: { ok: 0, low: 0, high: 0 }, minutes: { ok: 11, wrong: 26 },
    actionLabel: 'Check the pH',
    safeState: 'WITHIN TOLERANCE', lowState: 'pH TOO LOW', highState: 'pH TOO HIGH',
    safe: 'The pH agrees with the weak-acid equilibrium model.',
    low: 'The pH is below the equilibrium result. Recheck whether concentration was incorrectly treated as [H+].',
    high: 'The pH is above the equilibrium result. Recheck the equilibrium expression and logarithm.',
    fail: 'Set a pH value before checking the result.' },

  // ---------- Capstone ----------
  { id: 'cap-last', stage: 'capstone', skill: 'cap', type: 'decision',
    system: 'Acid-base capstone', icon: '\u{1F305}',
    goal: 'For one unknown acid sample, name the acid, classify its strength, predict the salt formed with the given base, and calculate the neutralizing amount.',
    why: 'The capstone connects the four core ideas used throughout the unit: naming, strength, product prediction, and neutralization stoichiometry.',
    delta: { ok: 0, wrong: 0 }, minutes: { ok: 12, wrong: 30 },
    right: 'All four chemistry steps are correct.',
    wrong: 'At least one chemistry step needs revision. Use the feedback to identify the first step that does not match the evidence.' }
];"""
model = sub1(model, r"export const SCENARIOS = \[.*?\n\];\s*$", scenarios + "\n", 'scenario block')

write(model_path, model)


# ---------------------------------------------------------------------------
# Unit 9 main: remove answer-driven physiology, make grading/tolerance language
# instructional, refine references and status rail, and clean dynamic feedback.
# ---------------------------------------------------------------------------
main_path = Path('units/09-acids-bases/js/main.js')
main = read(main_path)
main = main.replace("from './model.js';", f"from './model.js?v={STAMP}';")
main = main.replace("from './art.js';", f"from './art.js?v={STAMP}';")

record_world = """    recordWorld({ icon, tone, text, minutes, delta = 0 }) {
      // The clock is a simulation timer only. Student answers do not alter a physiological
      // measurement; the reference arterial pH shown in the rail remains fixed at 7.20.
      const spent = Math.min(minutes, SHIFT_LEN - this.clockMin);
      this.clockMin += spent;
      this.worldLog.unshift({ id: ++this._wid, icon, tone, text: `${this.clockLabel} ${text}` });
      if (this.worldLog.length > 6) this.worldLog.pop();
    },
    get clockLabel() {"""
main = sub1(main, r"    recordWorld\(\{ icon, tone, text, minutes, delta = 0 \}\) \{.*?\n    \},\n    get clockLabel\(\) \{", record_world, 'recordWorld')
main = sub1(main,
            r"    get phMood\(\) \{.*?\n    get phTone\(\) \{",
            "    get phMood() { return '\\u{1F9EA}'; },\n    get phState() { return 'Reference blood-gas example'; },\n    get phTone() {",
            'ph status')

new_dose = """    doseVerdict(sc, val, target, bands, unit, detail, dp) {
      if (!isFinite(val)) {
        return { v: { tone: 'fail', icon: '\u{26A0}\u{FE0F}', state: 'ENTER A NUMBER', headline: 'Enter a numerical answer', detail: sc.fail, gauge: null }, good: false, dir: 'fail' };
      }
      const band = outcomeBand(val, target, bands);
      const good = band.withinSpec;
      const n = x => x.toFixed(dp);
      const yours = `${n(val)} ${unit}`;
      const targetTxt = `${n(target)} ${unit}`;
      if (good) {
        const headline = band.band === 'ideal' ? 'Correct' : 'Within activity tolerance';
        return { v: { tone: 'success', icon: sc.icon, state: sc.safeState, headline,
          detail: `Your result is ${yours}; the target is ${targetTxt}. ${detail} ${sc.safe}`, gauge: 'on' }, good: true, dir: 'ok' };
      }
      const off = `${n(Math.abs(val - target))} ${unit}`;
      const low = band.direction === 'low';
      return { v: { tone: 'fail', icon: '\u{1F6A8}', state: low ? sc.lowState : sc.highState,
        headline: low ? 'Below target' : 'Above target',
        detail: `Your result is ${yours}; the target is ${targetTxt}. The difference is ${off}. ${detail} ${low ? sc.low : sc.high}`,
        gauge: low ? 'low' : 'high' }, good: false, dir: low ? 'low' : 'high' };
    },
    decisionVerdict(sc, good, state, headline, detail, consequence) {
      return good
        ? { tone: 'success', icon: sc.icon, state: 'CORRECT', headline, detail: `${detail} ${consequence}`, gauge: null }
        : { tone: 'fail', icon: '\u{1F6A8}', state, headline, detail: `${detail} ${consequence}`, gauge: null };
    },"""
main = sub1(main, r"    doseVerdict\(sc, val, target, bands, unit, detail, dp\) \{.*?\n    decisionVerdict\(sc, good, state, headline, detail, consequence\) \{.*?\n    \},", new_dose, 'verdict builders')

main = replace(main,
"      return 'Pick a bench. The phone is downstairs, the patient is next door, and the clock is running either way.';",
"      return 'Choose a practice station. Use the chemistry evidence to complete the current task.';",
'active outcome fallback')

new_refs = """    get activeReference() {
      const out = [];
      if (this.mode === 'naming') {
        out.push({ k: 'Binary acid', v: 'no oxygen: hydro- + root + -ic acid' });
        out.push({ k: 'Oxyacid', v: '-ate ion gives -ic acid; -ite ion gives -ous acid' });
        out.push({ k: 'Hydroxide base', v: 'metal name + hydroxide; use a Roman numeral for a variable-charge metal' });
      } else if (this.mode === 'define') {
        out.push({ k: 'Arrhenius', v: 'in water: acid increases H3O+; base increases OH-' });
        out.push({ k: 'Brønsted-Lowry', v: 'acid donates H+; base accepts H+' });
        out.push({ k: 'Conjugate pair', v: 'two species that differ by exactly one H+' });
      } else if (this.mode === 'strength') {
        out.push({ k: 'Strong acid', v: 'ionizes essentially completely in water' });
        out.push({ k: 'Strong hydroxide', v: 'a soluble ionic hydroxide dissociates essentially completely' });
        out.push({ k: 'Strength ≠ hazard', v: 'strength describes ionization, not overall chemical danger' });
      } else if (this.mode === 'neutralize') {
        if (this.screenIsHonors && this.ti) {
          out.push({ k: 'Equivalence', v: 'acid equivalents = base equivalents' });
          out.push({ k: 'On the bench', v: this.ti.Ca.toFixed(2) + ' M × ' + this.ti.Va + ' mL against ' + this.ti.Cb.toFixed(2) + ' M' });
          out.push({ k: 'Activity criterion', v: 'choose the listed indicator range that includes pH 7.00' });
        } else {
          out.push({ k: 'Neutralization', v: 'match acid equivalents with hydroxide equivalents' });
          out.push({ k: 'Stoichiometry', v: 'use the balanced coefficients to get the mole ratio' });
          out.push({ k: 'Salt formula', v: 'balance cation and anion charges to the lowest whole-number ratio' });
        }
      } else if (this.mode === 'meter') {
        if (this.screenIsHonors && this.wa) {
          out.push({ k: 'Weak acid', v: 'Ka = x²/(C - x), where x = [H+]' });
          out.push({ k: 'On the bench', v: this.wa.C.toFixed(3) + ' M ' + this.wa.acid.f + ', Ka ' + this.wa.acid.Ka.toExponential(1) });
          out.push({ k: 'Then', v: 'pH = -log[H+]' });
        } else {
          out.push({ k: 'pH', v: 'pH = -log[H+]' });
          out.push({ k: 'At 25 °C', v: 'pH + pOH = 14.00' });
          out.push({ k: 'One pH unit', v: 'a tenfold change in [H+]' });
        }
      } else if (this.mode === 'capstone') {
        out.push({ k: 'Four steps', v: 'name, classify strength, predict the salt, neutralize' });
        out.push({ k: 'Neutralization', v: 'match acid and hydroxide equivalents' });
        out.push({ k: 'Check', v: 'use the first incorrect step to guide your revision' });
      }
      return out.slice(0, 3);
    },"""
main = sub1(main, r"    get activeReference\(\) \{.*?\n      return out\.slice\(0, 3\);\n    \},", new_refs, 'activeReference')

new_rail = """    get railReadings() {
      const left = Math.max(0, SHIFT_LEN - this.clockMin);
      const leftLabel = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`;
      const right = this.calls ? Math.round(this.callsRight / this.calls * 100) : 0;
      const certs = this.teksMasteredCount, coreN = this.coreSkills.length;
      const caseTarget = 15;
      return [
        { key: 'cases', label: 'Cases', raw: `${Math.min(this.calls, caseTarget)}/${caseTarget}`,
          pct: Math.min(this.calls / caseTarget, 1) * 100,
          hint: 'activity progress: this practice bar fills after 15 submitted cases' },
        { key: 'right', label: 'Accuracy', raw: `${right}%`, pct: right,
          hint: 'percentage of submitted cases answered correctly' },
        { key: 'skills', label: 'Skills', raw: `${certs}/${coreN}`, pct: certs / coreN * 100,
          hint: 'activity mastery for the five C.12 practice skills' },
        { key: 'shift', label: 'Sim time', raw: leftLabel, pct: left / SHIFT_LEN * 100,
          hint: 'simulated time remaining in the activity shift; this is not a scientific measurement' }
      ];
    },
    stockColor(v) {"""
main = sub1(main, r"    get railReadings\(\) \{.*?\n    \},\n    stockColor\(v\) \{", new_rail, 'rail readings')
main = main.replace("return 'Mastered';", "return 'Activity mastered';")

# Dynamic wording clean-up.
repls = {
"'WRONG ENDING'": "'CHECK THE ENDING'",
"'WRONG SUBSTANCE'": "'CHECK THE FORMULA'",
"named right": "correctly named",
"misnamed": "name needs revision",
"'WRONG ON THE ROLE'": "'CHECK THE ROLE'",
"'WRONG ON THE SPECIES'": "'CHECK THE PARTNER'",
"'Both halves hold'": "'Both parts are correct'",
"pair called": "pair identified",
"pair misread": "pair needs revision",
"'WRONG ON THE REASON'": "'CHECK THE EXPLANATION'",
"'WRONG ON THE SHELF'": "'CHECK THE CLASSIFICATION'",
"`The ${this.st.fam}s are sorted`": "`The ${this.st.fam}s are classified correctly`",
"`The sort the bottles actually make is not the one you called`": "`At least one ${this.st.fam} needs a different classification`",
"shelf sorted": "classification correct",
"shelf misread": "classification needs revision",
"'SALT CALLED WRONG'": "'SALT INCORRECT'",
"'Amount right, salt wrong'": "'Amount correct; salt incorrect'",
"salt called wrong": "salt formula incorrect",
"dose missed": "amount outside tolerance",
"'INDICATOR WRONG'": "'INDICATOR INCORRECT'",
"'Volume right, indicator wrong'": "'Volume correct; indicator incorrect'",
"indicator called wrong": "indicator needs revision",
"endpoint confirmed": "equivalence identified",
"endpoint missed": "equivalence volume outside tolerance",
"'CLASS CALLED WRONG'": "'CLASSIFICATION INCORRECT'",
"'Reading right, class wrong'": "'pH correct; classification incorrect'",
"class called wrong": "classification incorrect",
"pH posted": "pH correct",
"pH misread": "pH outside tolerance",
"pH called": "pH correct",
"pH missed": "pH outside tolerance",
"'HANDOVER REJECTED'": "'REVIEW NEEDED'",
"'The beaker stands up'": "'Capstone complete'",
"'The beaker does not stand up'": "'Review the capstone steps'",
"handed over clean": "capstone complete",
"handover rejected": "capstone needs revision",
}
for old, new in repls.items():
    main = main.replace(old, new)

main = sub1(main,
            r"    get stExplain\(\) \{.*?\n    \},\n    stCheck\(\)",
            """    get stExplain() {
      const strong = this.st.bottles.filter(b => b.strong).map(b => b.f);
      const weak = this.st.bottles.filter(b => !b.strong).map(b => b.f);
      if (this.st.fam === 'acid') {
        return `${strong.join(', ') || 'None'} are treated as strong acids in this activity and ionize essentially completely in water; ` +
          `${weak.join(', ') || 'none'} are weak acids and ionize only partially.`;
      }
      return `${strong.join(', ') || 'None'} are strong soluble hydroxides and dissociate essentially completely; ` +
        `${weak.join(', ') || 'none'} are weak molecular bases and react with water only partially to form OH-.`;
    },
    stCheck()""",
            'stExplain')

main = sub1(main,
            r"    get nuExplain\(\) \{.*?\n    \},\n    nuCheck\(\)",
            """    get nuExplain() {
      const n = this.nu;
      return `The balanced neutralization uses ${n.coefAcid} ${n.acid.f} for every ${n.coefBase} ${n.base.f}, a ${n.coefAcid}:${n.coefBase} mole ratio. ` +
        `${n.molAcid.toFixed(2)} mol of acid therefore requires ${n.neutralBase.toFixed(3)} mol of base for stoichiometric neutralization, ` +
        `and charge balance gives the salt ${this.nuCorrectSalt}.`;
    },
    nuCheck()""",
            'nuExplain')

main = sub1(main,
            r"    get tiExplain\(\) \{.*?\n    \},\n    tiCheck\(\)",
            """    get tiExplain() {
      const t = this.ti;
      const ind = INDICATORS.find(i => i.name === this.tiCorrectInd);
      return `Moles of acid are ${(t.Ca * t.Va / 1000).toFixed(4)}, so the strong-base titration reaches equivalence at ` +
        `Veq = Ca × Va / Cb = (${t.Ca.toFixed(2)} M)(${t.Va} mL) / ${t.Cb.toFixed(2)} M = ${t.Veq.toFixed(1)} mL. ` +
        `Activity criterion: choose the listed indicator whose transition range includes pH 7.00; that is ${ind.name} (${ind.lo} to ${ind.hi}).`;
    },
    tiCheck()""",
            'tiExplain')
main = main.replace(" The indicator is also wrong: ${this.tiInd} changes colour outside pH 7.", " The selected indicator does not meet this activity criterion: its transition range does not include pH 7.00.")

main = sub1(main,
            r"    get waExplain\(\) \{.*?\n    \},\n    waCheck\(\)",
            """    get waExplain() {
      const w = this.wa;
      const h = Math.pow(10, -w.truePH);
      return `For the monoprotic weak-acid model, solving Ka = x²/(C - x) with C = ${w.C.toFixed(3)} M gives ` +
        `x = [H+] = ${h.toExponential(2)} M, so pH = ${w.truePH.toFixed(2)}. ` +
        `Neither -log(Ka) nor -log(C) alone gives the equilibrium pH.`;
    },
    waCheck()""",
            'waExplain')

main = main.replace("'pH from [H+]'", "'pH calculations'")
write(main_path, main)


# ---------------------------------------------------------------------------
# Unit 9 HTML: concise instructional copy, activity labels, no patient telemetry,
# and cache-busting for revised modules.
# ---------------------------------------------------------------------------
idx_path = Path('units/09-acids-bases/index.html')
idx = read(idx_path)
idx = sub1(idx, r'<meta name="description" content="[^"]*">', '<meta name="description" content="Practice acid/base naming, definitions, strength, neutralization stoichiometry, and pH calculations aligned to TEKS C.12.">', 'meta description', flags=0)
idx = idx.replace('aria-label="Unit 9 night shift cockpit"', 'aria-label="Unit 9 acids and bases practice"')
idx = idx.replace('aria-label="Poison control benches"', 'aria-label="Acid-base practice stations"')
idx = idx.replace('title="Triage · the last call of the night"', 'title="Capstone · connect the Unit 9 skills"')
idx = idx.replace('title="Case file · what a can of soda does to your teeth"', 'title="Case file · acidic drinks and tooth enamel"')
idx = idx.replace('aria-label="Progress and patient telemetry"', 'aria-label="Practice progress"')
idx = idx.replace('aria-label="Active call"', 'aria-label="Active activity"')
idx = idx.replace('<span class="command-kicker">The night shift</span>', '<span class="command-kicker">Simulation shift</span>')
idx = idx.replace('aria-label="The night shift"', 'aria-label="Simulation shift"')
idx = idx.replace('calls logged &middot;\n            arterial pH <strong x-text="phLabel"></strong>', 'cases submitted &middot;\n            reference arterial pH <strong x-text="phLabel"></strong>')
idx = idx.replace('Build the IUPAC name of', 'Build the acid/base name of')
idx = idx.replace('Where it turns up:', 'Example context:')
idx = idx.replace('Step 1. Predict the salt. Acid plus base always makes a salt plus water; criss-cross the ion charges to set each subscript.', 'Step 1. Predict the salt. For the acids and metal hydroxides in this activity, neutralization forms a salt and water. Balance the ion charges to set the subscripts.')
idx = idx.replace('Step 2. Work out the moles of base that make moles of H+ equal moles of OH-, and call it. The beaker meter is read back to you once the call is in.', 'Step 2. Use the balanced mole ratio to calculate the base required for stoichiometric neutralization. Submit the amount to reveal the modeled pH.')
idx = idx.replace("x-text=\"'Work out the moles of base, then type them.'\"", "x-text=\"'Calculate the moles of base, then enter the value.'\"")
idx = idx.replace('Drive the added volume to the equivalence point, then pick the indicator. The calculated equivalence volume is drawn on the chart once you commit, not before.', 'Move the added volume to the equivalence point, then choose the listed indicator whose transition range includes pH 7.00. The calculated equivalence volume appears after you submit.')
idx = idx.replace('Indicator (its color-change range should bracket the equivalence pH):', 'Activity criterion: choose the listed indicator whose transition range includes pH 7.00:')
idx = idx.replace("x-text=\"'Choose the indicator whose range brackets the equivalence point.'\"", "x-text=\"'Choose the listed indicator whose range includes pH 7.00.'\"")
idx = idx.replace('A weak acid only partly ionizes, so solve Ka = x^2/(C - x) for x = [H+], then set the meter.', 'For this monoprotic weak-acid model, solve Ka = x²/(C - x) for x = [H+], then calculate the pH.')
idx = idx.replace('The last call unlocks once all five core skills (C.12 A to E) are mastered.', 'The capstone unlocks once all five core C.12 practice skills meet the activity mastery criterion.')
idx = idx.replace('>Take the last call</button>', '>Start capstone</button>')
idx = idx.replace('>Hand it over</button>', '>Submit capstone</button>')
idx = idx.replace('4. Neutralize to pH 7 with', '4. Calculate stoichiometric neutralization with')
idx = idx.replace('<!-- ============ RIGHT: the patient next door ============ -->', '<!-- ============ RIGHT: reference pH + activity progress ============ -->')
idx = idx.replace('aria-label="The patient next door"', 'aria-label="pH reference and practice progress"')
idx = idx.replace('<span class="command-kicker">Next door</span>', '<span class="command-kicker">pH reference</span>')
idx = idx.replace('title="arterial blood pH, against the 7.35 to 7.45 reference range">Arterial</span>', 'title="reference arterial blood pH example; typical arterial range 7.35 to 7.45">Reference</span>')
idx = idx.replace('aria-label="Night shift readings"', 'aria-label="Practice progress readings"')
idx = idx.replace('aria-label="Latest consequence"', 'aria-label="Latest feedback"')
idx = idx.replace('<span class="command-kicker">Latest consequence</span>', '<span class="command-kicker">Latest feedback</span>')
idx = idx.replace("'The clock starts at 23:00 and the patient is already outside the window.'", "'The simulation clock starts at 23:00. The pH figure above is a fixed reference example.'")
idx = idx.replace('aria-label="Night log"', 'aria-label="Activity log"')
idx = idx.replace('<span class="command-kicker">Night log</span>', '<span class="command-kicker">Activity log</span>')
idx = idx.replace('>Nothing called yet.</p>', '>Nothing submitted yet.</p>')
idx = idx.replace("./js/main.js?v=u9-1", f"./js/main.js?v={STAMP}")
idx = idx.replace("./js/case.js?v=u9-1", f"./js/case.js?v={STAMP}")
write(idx_path, idx)


# ---------------------------------------------------------------------------
# Artwork: retain the drawings/layout, but replace game-script captions with
# chemistry-centered captions and remove patient-causality language.
# ---------------------------------------------------------------------------
art_path = Path('units/09-acids-bases/js/art.js')
art = read(art_path)
art_map = {
'THE KITCHEN AND GARAGE · SAME M, DIFFERENT pH': 'SAME CONCENTRATION · DIFFERENT pH',
'THE CLEANING CART · FOUR BASES, ONE DECISION': 'FOUR BASES · CLASSIFY STRENGTH',
'FOUR BOTTLES · WHICH ONE REACHED HIM?': 'FOUR ACIDS · COMPARE STRENGTH',
'THE GARAGE BUCKET · CALL THE MOLES FIRST': 'ACID + BASE · COMPARE MOLES',
'THE DECON DRUM · NOT READY FOR THE DRAIN': 'NEUTRALIZATION MODEL · USE MOLE RATIOS',
'THE CORRIDOR SODA · A COLOUR IS NOT A NUMBER': 'SOFT-DRINK SAMPLE · pH FROM [H+]',
'THE BUCKET THAT WOULD NOT RINSE · START WITH OH-': 'HYDROXIDE SAMPLE · pH FROM [OH-]',
'THE BLOOD GAS · THE PROTOCOL SPEAKS pH': 'NEAR-NEUTRAL SAMPLE · CALCULATE pH',
'THE TITRATION BENCH · FIND THE ENDPOINT': 'TITRATION · FIND EQUIVALENCE',
'THE FIVE-PERCENT BOTTLE · EQUILIBRIUM, NOT A GUESS': 'WEAK ACID · USE Ka AND C',
'THE LAST CALL · HANDOVER IN ONE HOUR': 'CAPSTONE · CONNECT THE SKILLS',
'CALL:  ?  mol': 'TARGET:  ?  mol',
'DOSE CARD': 'MOLE RATIO',
'DRAIN AFTER  ?': 'BASE NEEDED  ?',
'UPSTAIRS': 'CALCULATE',
'ENDPOINT  ?': 'EQUIVALENCE  ?',
'HANDOVER': 'CAPSTONE',
'ALL FOUR STEPS': 'CHECK FOUR STEPS',
'ACID LOAD?': 'STRENGTH?',
}
for old, new in art_map.items():
    art = art.replace(old, new)
write(art_path, art)


# ---------------------------------------------------------------------------
# Case File: factual, restrained enamel chemistry; retain existing component and SVG.
# ---------------------------------------------------------------------------
case_path = Path('units/09-acids-bases/js/case.js')
case = read(case_path)
case = replace(case, "kicker: 'in your hand at lunch'", "kicker: 'acid-base chemistry in everyday life'", 'case kicker')
case = replace(case, "title: 'What a can of soda does to your teeth'", "title: 'Why acidic drinks can demineralize tooth enamel'", 'case title')
case = replace(case, "teaser: 'What a $1 can of soda does to the hardest thing you own'", "teaser: 'A four-unit pH change means 10,000× greater [H+]'", 'case teaser')
case = sub1(case, r"  hook: '.*?',\n  stats: \[.*?\n  \],\n  steps: \[", """  hook: 'Tooth enamel is the hardest tissue in the human body. Repeated exposure to acidic drinks can shift its mineral balance toward demineralization.',
  stats: [
    { v: '2.5', k: 'example cola pH' },
    { v: '~5.5', k: 'common enamel reference' },
    { v: '10,000×', k: 'greater [H+] at pH 2.5 than pH 6.5' }
  ],
  steps: [""", 'case hook/stats')

steps = """  steps: [
    {
      t: 'Enamel is mineral',
      body: 'Tooth enamel is made mostly of hydroxyapatite, a calcium-phosphate mineral. It is extremely hard, but its surface can dissolve when the surrounding chemical environment becomes sufficiently acidic.',
      chem: 'Higher hydrogen-ion concentration can shift the mineral equilibrium toward dissolution, releasing calcium and phosphate from the enamel surface.',
      cap: 'ENAMEL · HYDROXYAPATITE MINERAL'
    },
    {
      t: 'Read the pH scale',
      body: 'Suppose saliva is at pH 6.5 and an acidic drink is at pH 2.5. The difference is 4.0 pH units. Because pH is logarithmic, the drink has 10^4, or 10,000 times, the hydrogen-ion concentration.',
      chem: 'Each decrease of one pH unit represents a tenfold increase in [H+].',
      cap: 'pH 6.5 → 2.5 · [H+] ×10,000'
    },
    {
      t: 'Demineralization',
      body: 'For tooth enamel, pH 5.5 is often used as a reference point for increased demineralization. It is not a universal cutoff; the exact balance depends on factors such as calcium and phosphate concentrations and saliva composition.',
      chem: 'When acidic conditions favor mineral dissolution, enamel loses calcium and phosphate ions. This process is called demineralization.',
      cap: '~pH 5.5 · A USEFUL REFERENCE, NOT A FIXED LIMIT'
    },
    {
      t: 'Saliva shifts the balance back',
      body: 'Saliva buffers acids and supplies calcium and phosphate ions. As the mouth becomes less acidic, conditions can again favor remineralization. Fluoride can help make remineralized enamel more resistant to later acid exposure.',
      chem: 'Demineralization and remineralization are competing processes influenced by the chemical environment around the enamel.',
      cap: 'BUFFERING SUPPORTS REMINERALIZATION'
    }
  ],"""
case = sub1(case, r"  steps: \[.*?\n  \],\n  quiz:", steps + "\n  quiz:", 'case steps')

quiz = """  quiz: {
    q: 'Saliva is at pH 6.5 and a drink is at pH 2.5. How many times greater is the hydrogen-ion concentration in the drink?',
    options: [
      { label: 'About 10,000 times greater', correct: true },
      { label: 'About 4 times greater', correct: false },
      { label: 'About 40 times greater', correct: false },
      { label: 'About 1,000 times greater', correct: false }
    ],
    explain: 'The difference is 4.0 pH units. Each pH unit represents a factor of 10 in [H+], so 10^4 = 10,000.'
  },
  punch: 'A small-looking change in pH can represent a very large change in hydrogen-ion concentration. That helps explain why repeated acid exposure can shift enamel toward demineralization.',
  careers: ['Dentist', 'Dental hygienist', 'Dental researcher', 'Food scientist'],
  cta: { label: 'Use the pH meter', call: \"setMode('meter')\" },"""
case = sub1(case, r"  quiz: \{.*?\n  cta: \{ label: 'Read the pH meter yourself', call: \"setMode\('meter'\)\" \},", quiz, 'case quiz/punch')

case_stage_map = {
'5.5: enamel dissolves': '~5.5: demineralization can increase',
'saliva holds neutral: enamel safe': 'saliva buffers acids',
'buffer + F- rebuild': 'buffering + mineral recovery',
'REMINERALIZATION (~30-60 min)': 'REMINERALIZATION',
'ACID CLOCK': 'ACID EXPOSURE',
"['safe','attack','attack','healing']": "['baseline','acidic','low pH','recovery']",
}
for old, new in case_stage_map.items():
    case = case.replace(old, new)
write(case_path, case)


# ---------------------------------------------------------------------------
# Cache version strings and static loader verification.
# ---------------------------------------------------------------------------
root_index = read('index.html')
if CDN not in root_index:
    raise RuntimeError('root index does not use Alpine 3.14.1 CDN after repair')
unit9_index = read(idx_path)
if CDN not in unit9_index:
    raise RuntimeError('Unit 9 index does not use Alpine 3.14.1 CDN after repair')
if f"main.js?v={STAMP}" not in unit9_index or f"case.js?v={STAMP}" not in unit9_index:
    raise RuntimeError('Unit 9 cache-busting strings were not updated')

# High-value remnants that must not remain in student-visible JS strings.
combined = read(model_path) + '\n' + read(main_path)
for phrase in [
    "headline: 'Called it right'",
    "headline: low ? 'Called it low' : 'Called it high'",
    "state: 'CALLED IT'",
    "the patient next door",
    "glass of water and a wait or a trip in",
    "clears it for the drain",
    "Acid plus base always makes a salt plus water",
]:
    if phrase in combined:
        raise RuntimeError(f'old student-facing wording remains: {phrase}')

print('Unit 9 refinement patches applied successfully.')
