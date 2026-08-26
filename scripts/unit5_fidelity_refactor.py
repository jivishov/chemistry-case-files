from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]


def read(rel):
    return (ROOT / rel).read_text(encoding='utf-8')


def write(rel, text):
    (ROOT / rel).write_text(text, encoding='utf-8')


def replace_once(text, old, new, label):
    n = text.count(old)
    if n != 1:
        raise RuntimeError(f'{label}: expected 1 occurrence, found {n}')
    return text.replace(old, new, 1)


def jsq(value):
    return "'" + value.replace('\\', '\\\\').replace("'", "\\'") + "'"


def scenario_bounds(text, sid):
    marker = "{ id: '" + sid + "'"
    start = text.find(marker)
    if start < 0:
        raise RuntimeError(f'scenario not found: {sid}')
    nxt = text.find("\n  { id: '", start + len(marker))
    end = len(text) if nxt < 0 else nxt
    return start, end


def scenario_field(text, sid, field, value):
    start, end = scenario_bounds(text, sid)
    block = text[start:end]
    pat = re.compile(rf"(\b{re.escape(field)}\s*:\s*)'(?:\\.|[^'\\])*'")
    block2, n = pat.subn(lambda m: m.group(1) + jsq(value), block, count=1)
    if n != 1:
        raise RuntimeError(f'{sid}.{field}: expected 1 field, found {n}')
    return text[:start] + block2 + text[end:]


def scenario_option(text, sid, key, field, value):
    start, end = scenario_bounds(text, sid)
    block = text[start:end]
    pat = re.compile(rf"(\{{\s*key:\s*'{re.escape(key)}'.*?\b{re.escape(field)}\s*:\s*)'(?:\\.|[^'\\])*'", re.S)
    block2, n = pat.subn(lambda m: m.group(1) + jsq(value), block, count=1)
    if n != 1:
        raise RuntimeError(f'{sid}.{key}.{field}: expected 1 field, found {n}')
    return text[:start] + block2 + text[end:]


def patch_model():
    rel = 'units/05-the-mole/js/model.js'
    t = read(rel)

    scenarios = {
        'a-oxygen': {
            'system': 'Oxygen supply',
            'goal': 'The cabin oxygen system needs a specified amount of O2. Convert the required moles to grams before adjusting the supply.',
            'why': 'Molar mass links an amount in moles to the mass of oxygen used in this simulation.',
            'actionLabel': 'Submit oxygen amount',
            'safeState': 'TARGET MET', 'lowState': 'BELOW TARGET', 'highState': 'ABOVE TARGET',
            'safe': 'The converted amount meets the activity target.',
            'low': 'The amount is below the activity target. Recheck the molar-mass conversion.',
            'high': 'The amount is above the activity target. Recheck the molar-mass conversion.',
            'fail': 'Complete the conversion before submitting the oxygen amount.'
        },
        'a-fuel': {
            'system': 'Methane loading',
            'goal': 'A course-correction system specifies methane in moles, but the loading display uses grams. Convert the required amount to mass.',
            'why': 'Use the molar mass of CH4 to connect moles of methane with grams of methane.',
            'actionLabel': 'Submit fuel mass',
            'safeState': 'TARGET MET', 'lowState': 'BELOW TARGET', 'highState': 'ABOVE TARGET',
            'safe': 'The converted mass meets the activity target.',
            'low': 'The mass is below the activity target. Recheck the conversion factor.',
            'high': 'The mass is above the activity target. Recheck the conversion factor.',
            'fail': 'Complete the conversion before submitting the fuel mass.'
        },
        'a-scrubber': {
            'system': 'CO2 scrubber log',
            'goal': 'A scrubber cartridge contains a measured mass of CO2. Convert the mass to moles for the system log.',
            'why': 'This is a grams-to-moles conversion using the molar mass of CO2.',
            'actionLabel': 'Submit CO2 amount',
            'safeState': 'VALUE RECORDED', 'lowState': 'VALUE LOW', 'highState': 'VALUE HIGH',
            'safe': 'The CO2 amount is recorded using the correct conversion.',
            'low': 'The recorded amount is too low for the given mass. Recheck the grams-to-moles conversion.',
            'high': 'The recorded amount is too high for the given mass. Recheck the grams-to-moles conversion.',
            'fail': 'Complete the conversion before recording the CO2 amount.'
        },
        'b-eva': {
            'system': 'EVA oxygen count',
            'goal': 'An EVA oxygen tank is specified in moles, while the monitoring system reports O2 molecules. Convert the amount to molecules.',
            'why': 'Avogadro’s number connects moles with the number of molecules.',
            'actionLabel': 'Submit molecule count',
            'safeState': 'COUNT MATCHES', 'lowState': 'COUNT LOW', 'highState': 'COUNT HIGH',
            'safe': 'The molecule count matches the activity target.',
            'low': 'The molecule count is below the target. Recheck the Avogadro-number conversion.',
            'high': 'The molecule count is above the target. Recheck the Avogadro-number conversion.',
            'fail': 'Complete the conversion before submitting the molecule count.'
        },
        'b-ration': {
            'system': 'Glucose inventory',
            'goal': 'A glucose sample is recorded in moles, but the inventory log requires molecules. Convert the amount to molecules.',
            'why': 'Use Avogadro’s number to convert between moles and molecules of glucose.',
            'actionLabel': 'Submit molecule count',
            'safeState': 'COUNT RECORDED', 'lowState': 'COUNT LOW', 'highState': 'COUNT HIGH',
            'safe': 'The molecule count matches the activity target.',
            'low': 'The molecule count is below the target. Recheck the conversion.',
            'high': 'The molecule count is above the target. Recheck the conversion.',
            'fail': 'Complete the conversion before recording the molecule count.'
        },
        'b-sample': {
            'system': 'NaCl sample count',
            'goal': 'A sodium chloride sample has a measured mass. Convert grams to moles, then moles to formula units.',
            'why': 'Ionic compounds are counted in formula units. This two-step conversion uses molar mass and Avogadro’s number.',
            'actionLabel': 'Submit formula-unit count',
            'safeState': 'COUNT RECORDED', 'lowState': 'COUNT LOW', 'highState': 'COUNT HIGH',
            'safe': 'The formula-unit count matches the activity target.',
            'low': 'The count is below the target. Check both conversion factors and unit cancellation.',
            'high': 'The count is above the target. Check both conversion factors and unit cancellation.',
            'fail': 'Complete both conversion steps before submitting the formula-unit count.'
        },
        'c-ore': {
            'system': 'Hematite composition',
            'goal': 'A sample is labeled hematite, Fe2O3, with a reported iron percentage. Calculate the theoretical percent iron and compare it with the report.',
            'why': 'Percent composition gives the mass percentage of each element in a compound. Use the stated tolerance only as this activity’s comparison criterion.'
        },
        'c-greenhouse': {
            'system': 'Fertilizer composition',
            'goal': 'A fertilizer record lists ammonia, NH3, with a reported nitrogen percentage. Calculate the theoretical percent nitrogen and compare it with the report.',
            'why': 'Theoretical percent composition comes from the chemical formula and atomic masses.'
        },
        'c-fuelpurity': {
            'system': 'Methane composition',
            'goal': 'A fuel record lists methane, CH4, with a reported carbon percentage. Calculate the theoretical percent carbon and compare it with the report.',
            'why': 'Agreement in one elemental percentage can support consistency with the formula, but it does not by itself prove purity or identity.'
        },
        'd-leak': {
            'system': 'Unknown gas sample',
            'goal': 'Use the element masses to find the empirical formula, then use molar mass to find the molecular formula. Compare the result with the activity’s reference candidates.',
            'why': 'An empirical formula gives the simplest whole-number ratio. The molecular formula is a whole-number multiple of that ratio.',
            'success': 'The formula matches one of the reference candidates.',
            'fail': 'The formula does not match the data. Recheck the mole ratios and molecular-formula multiplier.'
        },
        'd-surface': {
            'system': 'Unknown solid sample',
            'goal': 'Use the element masses to determine the empirical and molecular formulas, then compare the result with the provided candidates.',
            'why': 'Formula data can distinguish among the candidates in this activity; a formula alone does not uniquely identify every possible substance.',
            'success': 'The formula matches one of the reference candidates.',
            'fail': 'The formula does not match the data. Recheck the mole ratios and multiplier.'
        },
        'd-coolant': {
            'system': 'Unknown fluid sample',
            'goal': 'Use the element masses and molar mass to determine the molecular formula, then compare it with the provided candidates.',
            'why': 'Use the empirical ratio first, then the molar-mass multiplier. The comparison is limited to the activity’s reference candidates.',
            'success': 'The formula matches one of the reference candidates.',
            'fail': 'The formula does not match the data. Recheck the empirical formula and multiplier.'
        },
        'h1-desiccant': {
            'system': 'Hydrate analysis',
            'goal': 'A hydrate is heated to remove water. Use the hydrate mass and dry-salt mass to determine x in the hydrate formula.',
            'why': 'Compare moles of water lost with moles of anhydrous salt to find the whole-number hydrate ratio.',
            'success': 'Your value of x matches the mass data.',
            'fail': 'The value of x does not match the mass data. Recalculate moles of water and anhydrous salt.'
        },
        'h2-arson': {
            'system': 'Combustion analysis',
            'goal': 'Use the masses of CO2 and H2O produced by complete combustion to determine the empirical formula of the sample.',
            'why': 'CO2 gives the amount of carbon, H2O gives the amount of hydrogen, and oxygen can be found by mass difference when the sample contains only C, H, and O.',
            'success': 'Your empirical formula matches the combustion data.',
            'fail': 'The empirical formula does not match the combustion data. Recheck the mole amounts and whole-number ratio.'
        },
        'cap-pod': {
            'system': 'Resupply analysis',
            'goal': 'Use element masses and molar mass to determine the compound, then compare a reported elemental percentage with the theoretical composition.',
            'why': 'The final decision uses two pieces of evidence: formula consistency and the activity’s composition criterion.'
        }
    }
    for sid, fields in scenarios.items():
        for field, value in fields.items():
            t = scenario_field(t, sid, field, value)

    for sid, element_formula in [('c-ore', 'Fe2O3'), ('c-greenhouse', 'NH3'), ('c-fuelpurity', 'CH4')]:
        t = scenario_option(t, sid, 'accept', 'label', 'Report is consistent')
        t = scenario_option(t, sid, 'accept', 'good', f'The reported composition meets the activity criterion for {element_formula}.')
        t = scenario_option(t, sid, 'accept', 'consequence', f'The reported composition falls outside the activity criterion for {element_formula}.')
        t = scenario_option(t, sid, 'reject', 'label', 'Report is inconsistent')
        t = scenario_option(t, sid, 'reject', 'good', f'The reported composition falls outside the activity criterion for {element_formula}.')
        t = scenario_option(t, sid, 'reject', 'consequence', f'The reported composition actually meets the activity criterion for {element_formula}.')

    cap_opts = {
        'approve': ('Accept the pod', 'The formula matches the manifest and the reported composition meets the activity criterion.', 'The evidence does not support accepting the pod under the activity rules.'),
        'quarantine': ('Hold for recheck', 'The formula matches the manifest, but the reported composition falls outside the activity criterion.', 'The evidence does not support holding the pod for this reason under the activity rules.'),
        'reject': ('Reject the pod', 'The formula does not match the manifest, so the activity rules require rejection.', 'The formula matches the manifest, so rejection is not supported by the activity evidence.')
    }
    for key, (label, good, consequence) in cap_opts.items():
        t = scenario_option(t, 'cap-pod', key, 'label', label)
        t = scenario_option(t, 'cap-pod', key, 'good', good)
        t = scenario_option(t, 'cap-pod', key, 'consequence', consequence)

    misconception_block = """export const MISCONCEPTIONS = {
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
};"""
    pat = re.compile(r"export const MISCONCEPTIONS = \{.*?\n\};", re.S)
    t, n = pat.subn(misconception_block, t, count=1)
    if n != 1:
        raise RuntimeError('MISCONCEPTIONS block not replaced')

    pat = re.compile(r"export const ARI_INTRO = '(?:\\.|[^'\\])*';")
    t, n = pat.subn("export const ARI_INTRO = 'ARI produced a sample solution. Evaluate the calculation before accepting it. The solution may contain a common conversion error.';", t, count=1)
    if n != 1:
        raise RuntimeError('ARI_INTRO not replaced')

    write(rel, t)


def patch_index():
    rel = 'units/05-the-mole/index.html'
    t = read(rel)
    replacements = [
        ('<meta name="description" content="Mole Control: keep four crew alive on the haul to Mars. Scrub the air, fill the tanks, ID a leak, all with mole, mass, particle, percent, and formula math. A scaffold-fade ladder, gut-check estimates, and self-explanation on a miss make you do the conversion thinking yourself. TEKS C.8.">',
         '<meta name="description" content="Unit 5 practice for moles and chemical quantities: mass–mole conversions, particle counts, percent composition, empirical and molecular formulas, and Honors extensions. TEKS C.8.">'),
        ('aria-label="Purity check" title="Purity check · C.8(C) percent composition"><span class="tab-full" aria-hidden="true">Purity check</span><span class="tab-short" aria-hidden="true">Purity</span>',
         'aria-label="Composition check" title="Composition check · C.8(C) percent composition"><span class="tab-full" aria-hidden="true">Composition</span><span class="tab-short" aria-hidden="true">Comp.</span>'),
        ('aria-label="Feel a mole" title="Feel a mole · powers-of-ten zoom"><span class="tab-full" aria-hidden="true">Feel a mole</span><span class="tab-short" aria-hidden="true">Mole</span>',
         'aria-label="Mole scale" title="Mole scale · powers-of-ten comparison"><span class="tab-full" aria-hidden="true">Mole scale</span><span class="tab-short" aria-hidden="true">Scale</span>'),
        ('<span class="command-kicker">Instincts</span>', '<span class="command-kicker">Estimation</span>'),
        ('<p><span x-text="calib.est"></span>/8 gut checks calibrated</p>', '<p><span x-text="calib.est"></span>/8 estimates completed</p>'),
        ('<p>Ballpark <strong x-text="calib.estOk"></strong>/<strong x-text="calib.est"></strong> right', '<p>Estimates <strong x-text="calib.estOk"></strong>/<strong x-text="calib.est"></strong> correct'),
        ('Resolve it to <strong x-text="unitLabel(cv.targetUnit)"></strong>, then commit.', 'Convert it to <strong x-text="unitLabel(cv.targetUnit)"></strong>, then submit.'),
        ('Gut-check first: where will the answer land?', 'Estimate first: what order of magnitude should the answer have?'),
        ('Lock in an estimate to unlock the build.', 'Select an estimate to continue.'),
        ("'Make the gut-check estimate first.'", "'Make an estimate first.'"),
        ("'Type the amount, then ship it.'", "'Type the amount, then submit.'"),
        ('What went wrong? Name the slip, then see the fix.', 'What caused the error? Select the best explanation.'),
        ("Check ARI's work. Does the number hold up?", "Check ARI’s work. Is the calculation correct?"),
        ('Trust it, sign off', 'Accept the calculation'),
        ('Flag it, the number is off', 'Mark as incorrect'),
        ('What did ARI get wrong? Name it.', 'Which error did ARI make?'),
        ('Commit your call', 'Submit evaluation'),
        ("'Trust the number or flag it first.'", "'Decide whether the calculation is correct first.'"),
        ("'Now name what is wrong with it.'", "'Then identify the error.'"),
        ('<div class="v" x-text="fmt(MM(pc.sub.f))"></div>', '<div class="v" x-text="fmt(MM(pc.sub.f)) + \' g/mol\'"></div>'),
        ("'label says ' + pc.target.el", "'reported % ' + pc.target.el"),
        ("'Real % of ' + pc.target.el + ' (your calculation)'", "'Theoretical % ' + pc.target.el + ' (your calculation)'"),
        ('Percent = (mass of the element in one mole / molar mass) times 100. The label is good only if it lands within <span x-text="pc.tol"></span>% of the real value.',
         'Percent by mass = (mass of the element in 1 mol of compound / molar mass) × 100. <strong>Activity criterion:</strong> accept the reported value if it is within <span x-text="pc.tol"></span> percentage points of the theoretical value.'),
        ('Commit the call', 'Submit decision'),
        ("'Now say whether the label holds.'", "'Then decide whether the report meets the activity criterion.'"),
        ('Certify Mystery ID three times to unlock water reclaim and fire forensics.', 'Complete three Mystery ID problems correctly to unlock hydrate and combustion analysis.'),
        ('All carbon goes to <span x-ce="\'CO2\'"></span>, all hydrogen to <span x-ce="\'H2O\'"></span><span x-show="cb.sampleMass!==null">, and oxygen is found by mass difference</span>. Build the empirical formula.',
         'For this activity, assume complete combustion: carbon is determined from <span x-ce="\'CO2\'"></span>, hydrogen from <span x-ce="\'H2O\'"></span><span x-show="cb.sampleMass!==null">, and oxygen by mass difference</span>. Build the empirical formula.'),
        ('Set the oven', 'Submit x'),
        ('Match the fuel', 'Submit formula'),
        ('The resupply pod unlocks once all four core systems (C.8 A to D) are certified. Certified so far:', 'The resupply pod unlocks once all four core C.8 skills are mastered. Mastered so far:'),
        ('Open the pod log', 'Open analysis'),
        ('Manifest says <strong x-text="cap.claimed.name"></strong> (<span class="mono" x-ce="cap.claimed.molecular"></span>). Build the molecular formula from the element masses to confirm what is really inside, then check the purity.',
         'Manifest says <strong x-text="cap.claimed.name"></strong> (<span class="mono" x-ce="cap.claimed.molecular"></span>). Build the molecular formula from the element masses, then compare the reported composition with the theoretical value.'),
        ('What is really inside:', 'Molecular formula from the data:'),
        ('Step 2. Purity gauge reads <strong x-text="cap.measured + \'% \' + cap.targetEl.el"></strong>. Work out the real % of <span x-text="cap.targetEl.el"></span> for what you just identified (it passes within <span x-text="cap.tol"></span>%):',
         'Step 2. The report gives <strong x-text="cap.measured + \'% \' + cap.targetEl.el"></strong>. Calculate the theoretical % of <span x-text="cap.targetEl.el"></span>. <strong>Activity criterion:</strong> within <span x-text="cap.tol"></span> percentage points passes this comparison.'),
        ("'Real % of ' + cap.targetEl.el", "'Theoretical % of ' + cap.targetEl.el"),
        ('Step 3. Make the call. Bring it aboard if the contents and purity both check out, quarantine if the contents are right but purity fails, jettison if the manifest is wrong.',
         'Step 3. Decide using the activity rules: accept if formula and composition both meet the criteria, hold for recheck if the formula matches but composition does not, and reject if the formula conflicts with the manifest.'),
        ('>Make the call</button>', '>Submit decision</button>'),
        ("'Make the call on the pod first.'", "'Select an action for the pod first.'"),
        ('<span class="brief-role">&#128300; Feel a mole</span>', '<span class="brief-role">&#128300; Mole scale</span>'),
        ('A mole is 6.022 &times; 10<sup>23</sup> of something. That number is too big to picture. Slide it up one power of ten at a time and watch how fast it outruns anything you could ever draw.',
         'One mole contains 6.022 &times; 10<sup>23</sup> representative particles. Move from 1 to 10<sup>23</sup> particles one power of ten at a time; the slider stops below one mole.'),
        ('<p class="zoom-analogy">That is <span x-text="zoomAnalogy()"></span></p>', '<p class="zoom-analogy">Scale note: <span x-text="zoomAnalogy()"></span></p>'),
        ('Only <span x-text="zoomDrawn()"></span> dots are drawn here &mdash; every one this screen can still tell apart. The rest will not fit on any screen, which is exactly the point.',
         'Only <span x-text="zoomDrawn()"></span> dots are drawn because this display cannot resolve more individual dots at this size. The number above still shows the selected particle count.'),
        ('<aside class="life-support-board panel" aria-label="Life-support status">', '<aside class="life-support-board panel" aria-label="Simulation status">'),
        ('<span class="command-kicker">Life support</span>', '<span class="command-kicker">Simulation</span>'),
        ('<span>Crew safety</span>', '<span>Crew safety score</span>'),
        ('<section class="latest-consequence" :class="\'tone-\' + activeTone" aria-label="Latest consequence">', '<section class="latest-consequence" :class="\'tone-\' + activeTone" aria-label="Latest simulation result">'),
        ('<span class="command-kicker">Latest consequence</span>', '<span class="command-kicker">Latest result</span>'),
        ("'No system has been touched yet. Commit a chemistry action and the ship state will change here.'", "'No scenario result yet. Submit a chemistry answer to update the simulation.'"),
        ('<section class="mission-log" aria-label="Mission log">', '<section class="mission-log" aria-label="Simulation log">'),
        ('<span class="command-kicker">Mission log</span>', '<span class="command-kicker">Simulation log</span>'),
        ('Awaiting first call.', 'Awaiting first result.'),
        ("import('./js/main.js?v=u5-1')", "import('./js/main.js?v=u5-2')"),
        ("import('./js/case.js?v=u5-1')", "import('./js/case.js?v=u5-2')")
    ]
    for old, new in replacements:
        t = replace_once(t, old, new, f'index replacement: {old[:45]}')
    write(rel, t)


def replace_method(text, name, next_name, replacement):
    pat = re.compile(rf"    {re.escape(name)}\(\) \{{.*?\n    \}},\n    {re.escape(next_name)}", re.S)
    new = replacement.rstrip() + '\n    ' + next_name
    text2, n = pat.subn(lambda m: new, text, count=1)
    if n != 1:
        raise RuntimeError(f'method replacement failed: {name}')
    return text2


def patch_main():
    rel = 'units/05-the-mole/js/main.js'
    t = read(rel)
    reps = [
        ("from './model.js?v=u5-1';", "from './model.js?v=u5-2';"),
        ("from './art.js?v=u5-1';", "from './art.js?v=u5-2';"),
        ("from '../../../shared/js/molezoom.js';", "from '../../../shared/js/molezoom.js?v=u5-fidelity-2';"),
        ("const ARI_OK_CLAIM = 'Ran it twice and the units cancel clean. I would sign off on this one.';", "const ARI_OK_CLAIM = 'I used the stated conversion factor, checked the unit cancellation, and obtained this result.';"),
        ("{ id: 'h1', code: 'Honors', label: 'Hydrate recovery',", "{ id: 'h1', code: 'Honors', label: 'Hydrate formula',"),
        ("{ id: 'cap', code: 'Capstone', label: 'Food-grade audit',", "{ id: 'cap', code: 'Capstone', label: 'Resupply analysis',"),
        ("{ key: 'air',   label: 'Air' },", "{ key: 'air',   label: 'Air score' },"),
        ("{ key: 'power', label: 'Power' },", "{ key: 'power', label: 'Power score' },"),
        ("{ key: 'food',  label: 'Food' },", "{ key: 'food',  label: 'Food score' },"),
        ("{ key: 'hull',  label: 'Hull' }", "{ key: 'hull',  label: 'Hull score' }"),
        ("get crewState() { return this.crew >= 67 ? 'Crew safe' : this.crew >= 34 ? 'Crew strained' : 'Crew in danger'; }", "get crewState() { return this.crew >= 67 ? 'Simulation stable' : this.crew >= 34 ? 'Simulation caution' : 'Simulation critical'; }"),
        ("return 'Your gut keeps missing the size. Count the powers of ten before you commit.';", "return 'Your estimates often miss the order of magnitude. Check the powers of ten before calculating.';"),
        ("return 'Your size sense is good, but the final number often slips. Slow down on the arithmetic.';", "return 'Your estimates are usually reasonable, but the final result often differs. Recheck the arithmetic and units.';"),
        ("if (estRate >= 0.8) return 'Your sense of size is sharp. Trust your gut.';", "if (estRate >= 0.8) return 'Your order-of-magnitude estimates are consistently strong.';"),
        ("if (this.mode === 'zoom') return 'Feel a mole';", "if (this.mode === 'zoom') return 'Mole scale';"),
        ("if (this.mode === 'zoom') return 'Scale from one particle to a mole without pretending the whole mole fits on screen.';", "if (this.mode === 'zoom') return 'Compare powers of ten up to 10^23 particles. One mole contains 6.022 × 10^23 particles.';"),
        ("return 'Pick a station and make the number protect the crew.';", "return 'Select a station and use the chemistry to complete the scenario.';"),
        ("const explain = `Cancel ${srcUnit === 'g' ? 'grams' : 'moles'} so the chain resolves to ${this.unitLabel(to)}: ${fmt(gval)} ${this.unitLabel(srcUnit)} resolves to ${fmt(trueValue)} ${this.unitLabel(to)}.`;", "const explain = `Cancel ${srcUnit === 'g' ? 'grams' : 'moles'} so the chain converts to ${this.unitLabel(to)}: ${fmt(gval)} ${this.unitLabel(srcUnit)} converts to ${fmt(trueValue)} ${this.unitLabel(to)}.`;"),
        ("if (this.cv.rungForced) return 'Two-step conversion · tap the ready-made tiles';", "if (this.cv.rungForced) return 'Two-step conversion · select the provided factors';"),
        ("if (r === 1) return 'Setup level 1 of 3 · tap the ready-made tiles';", "if (r === 1) return 'Level 1 of 3 · select conversion factors';"),
        ("if (r === 2) return 'Setup level 2 of 3 · build the factor yourself';", "if (r === 2) return 'Level 2 of 3 · build the conversion factor';"),
        ("return 'Setup level 3 of 3 · solve it and type the amount';", "return 'Level 3 of 3 · calculate and enter the result';"),
        ("return `Your gut said ${this.estLabel(this.cvEstimate, u)} but your answer is ${this.estLabel(yDec, u)}. One is lying. Fix it.`;", "return `Your estimate was ${this.estLabel(this.cvEstimate, u)}, but your calculation is ${this.estLabel(yDec, u)}. Compare the powers of ten and revise either the estimate or the calculation.`;"),
        ("const tol = 1.5;                                   // percent (absolute) accept window", "const tol = 1.5;                                   // percentage-point activity criterion")
    ]
    for old, new in reps:
        t = replace_once(t, old, new, f'main replacement: {old[:45]}')

    old = """      let v, good = false, delta;
      if (!reached) {
        // the value must resolve to the target unit before the system can act on it
        const detail = rung === 3
          ? `${sc.fail} Enter a number for the amount in ${tgt}.`
          : `${sc.fail} ${this.cv.explain}`;
        v = { tone: 'fail', icon: '\\u{2699}\\u{FE0F}', state: 'CALC STALLED', headline: 'Numbers did not resolve',
          detail, gauge: null };
        delta = -5;
      } else {
        const band = outcomeBand(value, this.cv.trueValue, rung === 3 ? TYPED_BANDS : this.cv.bands);
        good = band.withinSpec;
        const dev = `${Math.abs((value - this.cv.trueValue) / this.cv.trueValue * 100).toFixed(0)}%`;
        const yourTxt = `${fmt(value)} ${tgt}`;
        if (good) {
          v = { tone: 'success', icon: sc.icon, state: sc.safeState, headline: 'On target',
            detail: `You delivered ${yourTxt}, right on the ${needTxt} the ship needed. ${sc.safe}`, gauge: 'on' };
          this.cvDone = true; delta = 6;
        } else if (band.direction === 'low') {
          v = { tone: 'fail', icon: '\\u{1F6A8}', state: sc.lowState, headline: 'Too little',
            detail: `You delivered ${yourTxt}, ${dev} short of the ${needTxt} needed. ${sc.low}`, gauge: 'low' };
          delta = -12;
        } else {
          v = { tone: 'fail', icon: '\\u{1F6A8}', state: sc.highState, headline: 'Too much',
            detail: `You delivered ${yourTxt}, ${dev} over the ${needTxt} needed. ${sc.high}`, gauge: 'high' };
          delta = -12;
        }
      }"""
    new = """      let v, good = false, delta;
      if (!reached) {
        const detail = rung === 3
          ? `Enter a numerical result in ${tgt}. ${sc.fail}`
          : `${this.cv.explain} ${sc.fail}`;
        v = { tone: 'fail', icon: '\\u{2699}\\u{FE0F}', state: 'CALCULATION INCOMPLETE', headline: 'Conversion incomplete',
          detail, gauge: null };
        delta = -5;
      } else {
        const band = outcomeBand(value, this.cv.trueValue, rung === 3 ? TYPED_BANDS : this.cv.bands);
        good = band.withinSpec;
        const dev = `${Math.abs((value - this.cv.trueValue) / this.cv.trueValue * 100).toFixed(0)}%`;
        const yourTxt = `${fmt(value)} ${tgt}`;
        if (good) {
          v = { tone: 'success', icon: sc.icon, state: sc.safeState, headline: 'Meets activity target',
            detail: `Your result is ${yourTxt}; the simulation target is ${needTxt}. ${sc.safe}`, gauge: 'on' };
          this.cvDone = true; delta = 6;
        } else if (band.direction === 'low') {
          v = { tone: 'fail', icon: '\\u{1F6A8}', state: sc.lowState, headline: 'Below activity target',
            detail: `Your result is ${yourTxt}, about ${dev} below the simulation target of ${needTxt}. ${sc.low}`, gauge: 'low' };
          delta = -12;
        } else {
          v = { tone: 'fail', icon: '\\u{1F6A8}', state: sc.highState, headline: 'Above activity target',
            detail: `Your result is ${yourTxt}, about ${dev} above the simulation target of ${needTxt}. ${sc.high}`, gauge: 'high' };
          delta = -12;
        }
      }"""
    t = replace_once(t, old, new, 'conversion verdict block')

    pat = re.compile(r"    auditWorking\(cv, flaw\) \{.*?\n    \},\n    get auditClaim", re.S)
    repl = """    auditWorking(cv, flaw) {
      const g = fmt(cv.given.value), srcU = this.unitLabel(cv.given.unit), tgtU = this.unitLabel(cv.targetUnit);
      const usesMass = cv.given.unit === 'g' || cv.targetUnit === 'g';
      if (flaw === 'noConvert') return `I copied ${g} ${srcU} as ${tgtU} without applying a conversion factor.`;
      if (flaw === 'wrongMass') return `I used ${mm(cv.wrongM)} g/mol as the molar mass and converted ${g} ${srcU} to ${tgtU}.`;
      if (flaw === 'decade') return usesMass
        ? `I converted ${g} ${srcU} using ${mm(cv.M)} g/mol and handled the powers of ten mentally.`
        : `I multiplied ${g} ${srcU} by Avogadro’s number and handled the powers of ten mentally.`;
      return usesMass
        ? `I used ${mm(cv.M)} g/mol and checked that the units cancel to ${tgtU}.`
        : `I multiplied ${g} ${srcU} by Avogadro’s number and checked that the units cancel to ${tgtU}.`;
    },
    get auditClaim"""
    t, n = pat.subn(repl, t, count=1)
    if n != 1:
        raise RuntimeError('auditWorking replacement failed')

    pat = re.compile(r"      let v, delta;\n      if \(a\.correct\) \{.*?\n      \}\n      this\.recordWorld", re.S)
    repl = """      let v, delta;
      if (a.correct) {
        if (this.auditPick === 'trust') {
          v = { tone: 'success', icon: sc.icon, state: 'CALCULATION CORRECT', headline: 'Correct evaluation',
            detail: `ARI calculated ${aiTxt}; the reference result is ${trueTxt}. You correctly accepted the calculation.` };
          delta = 5;
        } else {
          v = { tone: 'warn', icon: '\\u{2699}\\u{FE0F}', state: 'CALCULATION CORRECT', headline: 'Recheck your evaluation',
            detail: `ARI calculated ${aiTxt}, which matches the reference result ${trueTxt}. The calculation should be accepted.` };
          delta = -3;
        }
      } else if (this.auditPick === 'trust') {
        v = { tone: 'fail', icon: '\\u{1F6A8}', state: 'CALCULATION INCORRECT', headline: 'Error missed',
          detail: `ARI calculated ${aiTxt}, but the reference result is ${trueTxt}. ${MISCONCEPTIONS[a.flaw].fix}` };
        delta = -12;
      } else if (this.auditFlaw === a.flaw) {
        this.missTally[sk][a.flaw] = 0;
        v = { tone: 'success', icon: '\\u{1F50D}', state: 'ERROR IDENTIFIED', headline: 'Correct evaluation',
          detail: `You correctly marked ${aiTxt} as incorrect and identified the error. The reference result is ${trueTxt}. ${MISCONCEPTIONS[a.flaw].fix}` };
        delta = 8;
      } else {
        this.missTally[sk][a.flaw] = Math.max(0, (this.missTally[sk][a.flaw] || 0) - 1);
        v = { tone: 'warn', icon: '\\u{2699}\\u{FE0F}', state: 'ERROR IDENTIFIED', headline: 'Check the error type',
          detail: `You correctly marked the calculation as incorrect, but selected the wrong error type. ARI calculated ${aiTxt}; the reference result is ${trueTxt}. ${MISCONCEPTIONS[a.flaw].fix}` };
        delta = -4;
      }
      this.recordWorld"""
    t, n = pat.subn(repl, t, count=1)
    if n != 1:
        raise RuntimeError('audit verdict replacement failed')

    pc_method = """    pcCertify() {
      if (this.pcDone || !this.pcDecision || this.pcInput === '') return;
      const sc = this.pc.sc;
      const el = this.pc.target.el;
      const opt = sc.options.find(o => o.key === this.pcDecision);
      const gap = Math.abs(this.pc.measured - this.pc.theo);
      const dirTxt = this.pc.measured < this.pc.theo ? 'below' : 'above';
      const fig = `The reported value is ${this.pc.measured}% ${el}; the theoretical value from the formula is ${fmt(this.pc.theo)}% ${el}. The difference is ${fmt(gap)} percentage points ${dirTxt} the theoretical value.`;
      let v, good = false, delta, feed;
      if (!this.pcInputOk) {
        v = { tone: 'warn', icon: '\\u{2699}\\u{FE0F}', state: 'RECHECK CALCULATION', headline: 'Recalculate percent composition',
          detail: `Your calculated percent by mass does not match the formula. The theoretical value is ${fmt(this.pc.theo)}% ${el}.`, gauge: null };
        delta = -5; feed = `${sc.system}, calculation needs review`;
      } else if (this.pcDecision === this.pc.correctKey) {
        good = true;
        v = { tone: 'success', icon: sc.icon, state: 'DECISION CORRECT', headline: 'Correct decision', detail: `${fig} ${opt.good}`, gauge: null };
        this.pcDone = true; delta = 6; feed = `${sc.system}, decision correct`;
      } else {
        v = { tone: 'fail', icon: '\\u{1F6A8}', state: 'DECISION INCORRECT', headline: 'Recheck the decision', detail: `${fig} ${opt.consequence}`, gauge: null };
        delta = -12; feed = `${sc.system}, decision incorrect`;
      }
      this.gRecord('c', good, !this.pcAttempted);
      this.recordWorld({ icon: v.icon, tone: v.tone, text: feed, stock: sc.stock, delta });
      this.pcAttempted = true; this.pcChecked = true; this.pcVerdict = v; this.lastVerdict = v;
    },"""
    t = replace_method(t, 'pcCertify', 'pcNext() { this.genPercent(); },', pc_method)

    fo_method = """    foCertify() {
      if (this.foDone) return;
      const sc = this.fo.sc;
      const ok = this.foEmpOk && this.foMolOk;
      let v;
      if (ok) {
        v = { tone: 'success', icon: sc.icon, state: 'FORMULA MATCH', headline: 'Formula matches the data',
          detail: `Your empirical and molecular formulas match the sample data. Among the activity candidates, ${this.fo.item.molecular} corresponds to ${this.fo.item.name}.`, gauge: null };
        this.foDone = true;
        this.recordWorld({ icon: sc.icon, tone: 'success', text: `${sc.system}, formula matched`, stock: sc.stock, delta: 6 });
      } else {
        v = { tone: 'fail', icon: '\\u{2753}', state: 'RECHECK FORMULA', headline: 'Formula does not match',
          detail: `Recheck the mole ratios and the molecular-formula multiplier. The expected molecular formula is ${this.fo.item.molecular}.`, gauge: null };
        this.recordWorld({ icon: '\\u{1F6A8}', tone: 'fail', text: `${sc.system}, formula needs review`, stock: sc.stock, delta: -12 });
      }
      this.gRecord('d', ok, !this.foAttempted);
      this.foAttempted = true; this.foChecked = true; this.foVerdict = v; this.lastVerdict = v;
    },"""
    t = replace_method(t, 'foCertify', 'foNext() { this.genFormula(); },', fo_method)

    hy_method = """    hyCertify() {
      if (this.hyDone) return;
      const sc = this.hy.sc;
      const ok = this.hyX === this.hy.xCorrect;
      let v;
      if (ok) {
        v = { tone: 'success', icon: sc.icon, state: 'FORMULA CORRECT', headline: 'Hydrate ratio correct',
          detail: `x = ${this.hy.xCorrect}. ${sc.success}`, gauge: null };
        this.hyDone = true;
        this.recordWorld({ icon: sc.icon, tone: 'success', text: `${sc.system}, hydrate ratio correct`, stock: sc.stock, delta: 6 });
      } else {
        v = { tone: 'fail', icon: '\\u{1F6A8}', state: 'RECHECK FORMULA', headline: 'Recalculate x',
          detail: `${sc.fail} The expected value is x = ${this.hy.xCorrect}.`, gauge: null };
        this.recordWorld({ icon: '\\u{1F6A8}', tone: 'fail', text: `${sc.system}, hydrate ratio needs review`, stock: sc.stock, delta: -12 });
      }
      this.gRecord('h1', ok, !this.hyAttempted);
      this.hyAttempted = true; this.hyChecked = true; this.hyVerdict = v; this.lastVerdict = v;
    },"""
    t = replace_method(t, 'hyCertify', 'hyNext() { this.genHydrate(); },', hy_method)

    cb_method = """    cbCertify() {
      if (this.cbDone) return;
      const sc = this.cb.sc;
      const ok = this.cbOk;
      let v;
      if (ok) {
        v = { tone: 'success', icon: sc.icon, state: 'FORMULA CORRECT', headline: 'Empirical formula correct',
          detail: `${sc.success} Empirical formula: ${this.cb.empStr}.`, gauge: null };
        this.cbDone = true;
        this.recordWorld({ icon: sc.icon, tone: 'success', text: `${sc.system}, empirical formula correct`, stock: sc.stock, delta: 6 });
      } else {
        v = { tone: 'fail', icon: '\\u{2753}', state: 'RECHECK FORMULA', headline: 'Empirical formula does not match',
          detail: `${sc.fail} The expected empirical formula is ${this.cb.empStr}.`, gauge: null };
        this.recordWorld({ icon: '\\u{1F6A8}', tone: 'fail', text: `${sc.system}, empirical formula needs review`, stock: sc.stock, delta: -12 });
      }
      this.gRecord('h2', ok, !this.cbAttempted);
      this.cbAttempted = true; this.cbChecked = true; this.cbVerdict = v; this.lastVerdict = v;
    },"""
    t = replace_method(t, 'cbCertify', 'cbNext() { this.genCombustion(); },', cb_method)

    pat = re.compile(r"    capCertify\(\) \{.*?\n    \}\n  \};", re.S)
    cap_method = """    capCertify() {
      if (this.capWin || !this.capPick) return;
      const sc = this.cap.sc;
      const opt = sc.options.find(o => o.key === this.capPick);
      const idTxt = this.cap.labelWrong
        ? `The manifest lists ${this.cap.claimed.name}, but the sample data gives ${this.cap.item.molecular} (${this.cap.item.name}).`
        : `The sample data is consistent with ${this.cap.item.molecular} (${this.cap.item.name}), matching the manifest.`;
      const compTxt = this.cap.labelWrong
        ? ''
        : ` The reported ${this.cap.targetEl.el} value is ${this.cap.measured}%; the theoretical value is ${fmt(this.cap.theo)}%. Under the activity criterion, the composition ${this.cap.purityPass ? 'meets' : 'does not meet'} the tolerance.`;
      const fig = `${idTxt}${compTxt}`;
      let v, good = false, delta, feed;
      if (!this.capFormulaOk) {
        v = { tone: 'warn', icon: '\\u{2699}\\u{FE0F}', state: 'RECHECK FORMULA', headline: 'Complete the formula first',
          detail: `Derive the molecular formula from the data before deciding. The expected formula is ${this.cap.item.molecular}.`, gauge: null };
        delta = -5; feed = `${sc.system}, formula needs review`;
      } else if (!this.capPurityInputOk) {
        v = { tone: 'warn', icon: '\\u{2699}\\u{FE0F}', state: 'RECHECK COMPOSITION', headline: 'Recalculate percent composition',
          detail: `The theoretical value is ${fmt(this.cap.theo)}% ${this.cap.targetEl.el}. Recheck the percent-by-mass calculation.`, gauge: null };
        delta = -5; feed = `${sc.system}, composition calculation needs review`;
      } else if (this.capPick === this.cap.correctAction) {
        good = true;
        v = { tone: 'success', icon: sc.icon, state: 'DECISION CORRECT', headline: 'Correct decision', detail: `${fig} ${opt.good}`, gauge: null };
        this.capWin = true; delta = 6;
        feed = `${sc.system}, ${this.capActionWord(this.capPick)} correctly`;
      } else {
        v = { tone: 'fail', icon: '\\u{1F6A8}', state: 'DECISION INCORRECT', headline: 'Recheck the decision', detail: `${fig} ${opt.consequence}`, gauge: null };
        delta = -12; feed = `${sc.system}, decision incorrect`;
      }
      this.gRecord('cap', good, !this.capAttempted);
      this.recordWorld({ icon: v.icon, tone: v.tone, text: feed, stock: sc.stock, delta });
      this.capAttempted = true; this.capChecked = true; this.capVerdict = v; this.lastVerdict = v;
    }
  };"""
    t, n = pat.subn(cap_method, t, count=1)
    if n != 1:
        raise RuntimeError('capCertify replacement failed')

    write(rel, t)


def patch_art():
    rel = 'units/05-the-mole/js/art.js'
    t = read(rel)
    reps = {
        'RUST ROCK · DOES THE ASSAY MATCH?': 'HEMATITE · CALCULATE % IRON',
        'FERTILIZER · REAL % NITROGEN?': 'FERTILIZER · CALCULATE % NITROGEN',
        'FUEL POD · VERIFY % CARBON': 'FUEL REPORT · CHECK % CARBON',
        'UNKNOWN GAS · BUILD THE FORMULA, ID IT': 'UNKNOWN GAS · BUILD AND COMPARE FORMULAS',
        'COOLANT LEAK · ID THE FLUID': 'UNKNOWN FLUID · BUILD AND COMPARE FORMULAS',
        'RESUPPLY POD · ID, CHECK PURITY, DECIDE': 'RESUPPLY POD · IDENTIFY, CHECK, DECIDE'
    }
    for old, new in reps.items():
        t = replace_once(t, old, new, f'art caption {old}')
    write(rel, t)


def patch_case():
    rel = 'units/05-the-mole/js/case.js'
    t = read(rel)
    new_prefix = """  kicker: 'scientific case study',
  title: 'Apollo 13: Carbon Dioxide Control in a Lifeboat',
  teaser: 'Apollo 13 · April 1970',
  hook: 'After an oxygen-tank explosion forced Apollo 13 to abandon its Moon landing, the lunar module Aquarius became a lifeboat for three astronauts. Carbon dioxide removal became one of the mission’s critical life-support problems.',
  stats: [
    { v: '~320,000 km', k: 'from Earth when the crisis began' },
    { v: '3 crew', k: 'living in the lunar module during the return' },
    { v: '2 : 1', k: 'LiOH : CO2 stoichiometric mole ratio' }
  ],
  steps: [
    {
      t: 'An oxygen tank explodes',
      body: 'On April 13, 1970, an oxygen tank in Apollo 13’s service module exploded. The Moon landing was abandoned, and the crew moved into the lunar module Aquarius as a lifeboat for the return to Earth.',
      chem: 'The crisis turned consumables into quantitative problems. Oxygen, water, electrical power, and carbon dioxide removal all had limited supplies and operating constraints.',
      cap: 'April 13, 1970 · Apollo 13 changes from a lunar mission to a survival mission.'
    },
    {
      t: 'Carbon dioxide becomes a life-support concern',
      body: 'Aquarius had been designed for two astronauts on the lunar surface, not three people living in it for several days. As the crew exhaled, carbon dioxide accumulated, and the available lunar-module scrubber cartridges became a critical constraint.',
      chem: 'The amount of CO2 can be expressed in moles. With a molar mass of about 44.01 g/mol, a measured mass of CO2 can be converted to moles for stoichiometric calculations.',
      cap: 'Three crew members in Aquarius · carbon dioxide removal becomes critical.'
    },
    {
      t: 'Lithium hydroxide removes carbon dioxide',
      body: 'Apollo spacecraft used lithium hydroxide canisters to remove carbon dioxide from cabin air. A simplified stoichiometric model for the sorbent reaction is 2 LiOH + CO2 → Li2CO3 + H2O.',
      chem: 'The equation gives a 2:1 mole ratio. Removing 20 mol of CO2 would require 40 mol of LiOH, about 960 g theoretically. Actual cartridge capacity also depends on design, airflow, operating conditions, and test data.',
      cap: '2 LiOH + CO2 → Li2CO3 + H2O · stoichiometry gives the theoretical ratio.'
    },
    {
      t: 'Engineers adapt the canisters',
      body: 'The command module had additional square lithium hydroxide canisters, but the lunar module used a different canister arrangement. Engineers on the ground developed and tested an adapter made from materials already on the spacecraft, then sent the assembly procedure to the crew.',
      chem: 'The chemistry supplied the sorbent reaction; the engineering solution made cabin air flow through the available sorbent. Both were necessary for effective CO2 removal.',
      cap: 'Square command-module canisters adapted for the lunar-module system.'
    }
  ],
  quiz: {
    q: 'If 20 mol of CO2 reacts completely according to 2 LiOH + CO2 → Li2CO3 + H2O, what theoretical mass of LiOH is required? Use 24.0 g/mol for LiOH.',
    options: [
      { label: 'About 480 g (20 mol LiOH)', correct: false },
      { label: 'About 960 g (40 mol LiOH)', correct: true },
      { label: 'About 240 g (10 mol LiOH)', correct: false }
    ],
    explain: 'The balanced equation requires 2 mol LiOH for every 1 mol CO2. Therefore, 20 mol CO2 requires 40 mol LiOH. At 24.0 g/mol, the theoretical mass is 960 g. Real cartridge performance also depends on engineering design and operating conditions.'
  },
  punch: 'Apollo 13 shows how mole ratios translate a chemical equation into material requirements. Real life-support performance also depends on system design, airflow, testing, and operating limits.',
  careers: ['Environmental control and life-support engineer', 'Chemical engineer', 'Flight controller', 'Aerospace systems engineer'],
  cta: { label: 'Return to mole conversions', call: \"setMode('molg')\" },
"""
    pat = re.compile(r"  kicker: .*?\n  stage:", re.S)
    t, n = pat.subn(lambda m: new_prefix + '  stage:', t, count=1)
    if n != 1:
        raise RuntimeError('case prefix replacement failed')
    write(rel, t)


def patch_molezoom():
    rel = 'shared/js/molezoom.js'
    t = read(rel)
    t = replace_once(t, "export const ZOOM_MAX_POW = 23;      // the slider's top notch, one decade under a mole", "export const ZOOM_MAX_POW = 23;      // the slider's top notch; 10^23 is below one mole", 'zoom max comment')
    old = """export const ZOOM_ANALOGIES = [
  { pow: 0,  text: 'one particle, far too small to see.' },
  { pow: 2,  text: 'about a hundred, a small classroom of them.' },
  { pow: 6,  text: 'a million, a packed stadium crowd.' },
  { pow: 12, text: 'a trillion, the grains of sand on a long beach.' },
  { pow: 18, text: 'a quintillion, every grain of sand on every beach on Earth.' },
  { pow: 23, text: 'a mole, about eighty thousand times every grain of sand on every beach on Earth.' }
];"""
    new = """export const ZOOM_ANALOGIES = [
  { pow: 0,  text: 'At 10^0: one particle.' },
  { pow: 2,  text: 'At 10^2: one hundred particles.' },
  { pow: 6,  text: 'At 10^6: one million particles.' },
  { pow: 12, text: 'At 10^12: one trillion particles.' },
  { pow: 18, text: 'At 10^18: one quintillion particles.' },
  { pow: 23, text: 'At 10^23: about one-sixth of a mole; one mole contains 6.022 × 10^23 particles.' }
];"""
    t = replace_once(t, old, new, 'zoom scale notes')
    write(rel, t)


def static_checks():
    files = [
        'units/05-the-mole/index.html',
        'units/05-the-mole/js/model.js',
        'units/05-the-mole/js/main.js',
        'units/05-the-mole/js/art.js',
        'units/05-the-mole/js/case.js',
        'shared/js/molezoom.js'
    ]
    joined = '\n'.join(read(f) for f in files)
    forbidden = [
        'Lock in an estimate', 'Commit your call', 'Commit the call', 'Make the call',
        'Wrong call', 'Right call', 'Feel a mole', 'Purity check', 'real value works out',
        'does the number hold up', 'sign off', 'a mole, about eighty thousand'
    ]
    leftovers = [s for s in forbidden if s in joined]
    if leftovers:
        raise RuntimeError('student-facing wording remnants: ' + ', '.join(leftovers))
    if 'percentage points' not in read('units/05-the-mole/index.html'):
        raise RuntimeError('activity criterion is not labeled in percentage points')
    if 'Crew safety score' not in read('units/05-the-mole/index.html'):
        raise RuntimeError('simulation score labeling missing')
    if 'one-sixth of a mole' not in read('shared/js/molezoom.js'):
        raise RuntimeError('10^23 mole-scale correction missing')


def main():
    patch_model()
    patch_index()
    patch_main()
    patch_art()
    patch_case()
    patch_molezoom()
    static_checks()
    print('Unit 5 fidelity refactor applied and static copy checks passed.')


if __name__ == '__main__':
    main()
