// model.js — Unit 1 domain data (Practices, Measurement & Matter, SEP C.1-C.4).
// Pure data. Measurement math lives in shared/js/chem.js; this file only holds the pools
// the procedural generators draw from, the standards map, and the Scenario layer.
//
// The chemistry pools (SI_UNITS, PREFIXES, SF_COUNT/ROUND/CALC, SUBSTANCES, AP_BOARDS)
// are units/01-practices-matter's, carried over unchanged so the two builds teach the
// same content. What is new here is SCENARIOS: the everyday world the cockpit puts that
// content inside, per RETROFIT-U1-U4.md section 3 ("Tank Watch" — the fish tank in your
// room) and section 5 (task types and bands).

// ---- C.1: SI reference shown beside the graduated cylinder / dosing syringe ----
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
export const SF_COUNT = ['0.00450', '1200', '100.0', '3.080', '45000', '0.067', '12.000', '5.0', '908', '0.0010', '2.50', '60800'];
export const SF_ROUND = [123.456, 0.0023456, 45678, 9.8765, 0.10472, 2345.6, 0.085019, 7654.3];
export const SF_CALC = [
  ['2.5', '3.42'], ['12.0', '4.8'], ['3.14', '2.0'], ['0.50', '6.755'],
  ['25.0', '1.2'], ['8.4', '0.025'], ['100.', '3.1'], ['6.022', '2.0']
];

// ---- C.3: substances for density-by-displacement identification (g/mL) ----
// `toxic` is the tank fact the decision turns on, and it is real rather than decorative:
// copper, zinc and lead are the metals actually toxic in a freshwater tank (copper to
// invertebrates from about 0.01 mg/L). Aluminum, titanium, iron, silver and gold are not
// acutely so. `leach` is the mg/L of dissolved metal a day in the water costs you, used by
// the world-state when a toxic decoration is left in.
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
// dots are normalized [-1,1] target coordinates; center is the accepted value.
export const AP_BOARDS = [
  { key: 'both',     title: 'Accurate + precise', desc: 'Close to the true value and tightly grouped.',
    dots: [[0.05, -0.08], [-0.06, 0.04], [0.02, 0.09], [-0.03, -0.05], [0.07, 0.02]] },
  { key: 'precise',  title: 'Precise, not accurate', desc: 'Tightly grouped but off the true value (systematic error).',
    dots: [[0.55, 0.42], [0.62, 0.5], [0.5, 0.55], [0.58, 0.46], [0.64, 0.4]] },
  { key: 'accurate', title: 'Accurate, not precise', desc: 'Centered on the true value but widely scattered (random error).',
    dots: [[0.5, -0.1], [-0.45, 0.2], [0.1, 0.55], [-0.2, -0.5], [0.15, -0.2]] },
  { key: 'neither',  title: 'Neither', desc: 'Off the true value and scattered.',
    dots: [[0.45, 0.5], [0.7, 0.2], [0.3, 0.75], [0.8, 0.55], [0.55, 0.3]] }
];

// Standards map. Codes, modes, honors flags and text are units/01-practices-matter's,
// byte for byte; only the stable `id`s are new, and they key the mastery meters and the
// TEKS popover in the cockpit header.
export const SE = [
  { id: 'a',  code: 'C.1', mode: 'measure',  honors: false, text: 'Plan and safely conduct investigations using appropriate tools, models, and SI units.' },
  { id: 'b',  code: 'C.2', mode: 'sigfig',   honors: false, text: 'Analyze and interpret data, including significant figures, precision, and error.' },
  { id: 'c',  code: 'C.3', mode: 'density',  honors: false, text: 'Develop and communicate evidence-based explanations and conclusions.' },
  { id: 'd',  code: 'C.4', mode: 'evaluate', honors: false, text: 'Evaluate the accuracy, precision, and reliability of scientific measurements.' },
  { id: 'h1', code: 'Honors', mode: 'density',  honors: true, text: 'Honors: propagate reading uncertainty into a density and decide whether the sample is big enough to name the metal.' },
  { id: 'h2', code: 'Honors', mode: 'evaluate', honors: true, text: 'Honors: quantify precision with a standard deviation and decide whether the test kit can still be trusted.' }
];

// ---------------------------------------------------------------- bands
// A dose is graded against what the job actually needed, not against a single right
// answer. Both bands come from RETROFIT-U1-U4.md section 5.
//
// The measuring band is ABSOLUTE because the tool's precision is absolute: the smallest
// graduation is 1 mL, so one estimated digit is 0.1 mL, and half a graduation-estimate
// (0.05 mL) is the tightest a reading can honestly claim. 0.10 mL is one full estimated
// digit off — still a defensible read of the same meniscus, hence "acceptable".
export const MEASURE_BANDS = { mode: 'absolute', ideal: 0.05, acceptable: 0.10 };
// Density is RELATIVE because the whole point is telling neighbouring metals apart, and
// the tightest neighbouring pair in SUBSTANCES is zinc/iron at 7.14 vs 7.87 g/mL — a 9.8%
// gap. A 2% acceptable band is comfortably inside that, so a passing density still names
// exactly one metal.
export const DENSITY_BANDS = { mode: 'relative', ideal: 0.01, acceptable: 0.02 };
// The two Honors stages take a typed number as a precondition before the decision is
// graded (Unit 5's pcCertify shape). Looser, because both are hand-computed statistics.
export const HONORS_BANDS = { mode: 'relative', ideal: 0.02, acceptable: 0.05 };

// ---------------------------------------------------------------- the world
// TANK: the fixed facts of the room the whole unit happens in. The tank is nominally a
// 20 gallon, which is exactly the "the box says 20, the tape measure says otherwise"
// distinction C.2 is built on.
export const TANK = {
  nominalGal: 20,
  realGal: 18.4,           // measured L x W x H, minus gravel and decor displacement
  tapChlorine: 1.80,       // mg/L free chlorine straight from the municipal tap
  stressLine: 0.20,        // mg/L; fish stress above this
  metalLine: 0.010,        // mg/L dissolved metal; copper is toxic to invertebrates here
  fish: 6
};

// ---------------------------------------------------------------- scenarios
// One everyday job per task, in the U5/U10 shape.
//   id/stage/skill/type/system/icon/goal/why  — always
//   dose     adds constraints, bands, actionLabel, safeState/lowState/highState and
//            safe/low/high/fail
//   identity adds success/fail
//   decision adds consequences keyed by the option the learner picks
//   effect   what each outcome actually does to the tank, as a partial of
//            { water, metals, log, kit, shock }: water/metals in mg/L, log/kit in
//            percentage points, shock as acute fish stress that decays over days.
//            Unit 5 carries a single `stock` name plus one signed `delta`, which works
//            because every station there feeds a ship system on the same 0-100 scale.
//            Here the four readings are different physical quantities in different
//            units, and the same task can move two of them (an overdose clears the
//            chlorine AND crashes the oxygen), so the consequence has to be a per-
//            outcome map rather than one number. recordWorld() in main.js applies it
//            after the day's baseline drift and couplings.
//
// Reading the tool is a DOSE task because the number you write down IS the dose: the log
// is what the next person mixes from. That is the same failure the unit's case file is
// about, one tank instead of one Mars orbiter.
export const SCENARIOS = [
  // ---------- C.1 read the tool (the dose you log is the dose that gets mixed) ----------
  { id: 'a-dechlor', stage: 'measure', skill: 'a', type: 'dose',
    system: 'Dechlorinator dose', icon: '\u{1F489}',
    goal: 'Water-change day. The dechlorinator is measured into the 50 mL cylinder before it goes near the tank. Read the meniscus to the digit the tool justifies and log that as the dose.',
    why: 'Whoever does the next water change mixes from your log, not from your memory. Log it short and the chlorine survives; log it long and they overdose the tank.',
    constraints: { unit: 'mL', tool: 'cylinder' }, bands: MEASURE_BANDS,
    actionLabel: 'Log the dose',
    // A correct dose neutralises whatever free chlorine is in there, so the good case is
    // a large negative that the 0 floor absorbs. Over-reading still clears the chlorine —
    // the extra thiosulfate is not the problem, the oxygen it strips out is, which is why
    // the high case pairs a cleared reading with an acute shock.
    effect: { good: { water: -3 }, low: { water: 0.55 }, high: { water: -3, shock: 28 }, fail: { water: 0.2 } },
    safeState: 'WATER CLEAR', lowState: 'CHLORINE LEFT', highState: 'OVERDOSED',
    safe: 'The chlorine test goes colourless and the fish spread back out across the tank.',
    low: 'The log understates the dose, so the next mix comes up short and free chlorine survives the water change. Gills first, always.',
    high: 'The log overstates the dose. The next mix is a heavy one, the extra thiosulfate pulls oxygen out of the water, and six fish come up to gulp at the surface.',
    fail: 'Nothing got written down, so the bottle goes back on the shelf and the tank keeps whatever the tap gave it.' },
  { id: 'a-plantfood', stage: 'measure', skill: 'a', type: 'dose',
    system: 'Plant-food cap', icon: '\u{1F331}',
    goal: 'The bottle cap is a notoriously bad measure, so this one was emptied into the 50 mL cylinder to see what it actually holds. Read the meniscus and record what really went in.',
    why: 'Plant food is nitrate and phosphate. Under-dose and the plants stall and the algae wins the light; over-dose and you have fed the algae directly.',
    constraints: { unit: 'mL', tool: 'cylinder' }, bands: MEASURE_BANDS,
    actionLabel: 'Record the dose',
    // Healthy plants take up ammonia and nitrate, so a fed tank is a slightly cleaner one.
    // An algae bloom is not a chlorine problem: it crashes dissolved oxygen overnight,
    // which is acute stress, so it lands on shock.
    effect: { good: { water: -0.15 }, low: { shock: 7 }, high: { shock: 24 }, fail: { shock: 4 } },
    safeState: 'PLANTS FED', lowState: 'PLANTS STALLING', highState: 'ALGAE BLOOM',
    safe: 'New growth on the stem plants within the week and the glass stays clear.',
    low: 'The recorded dose is light. The plants stall, the leftover light goes to algae, and the glass starts to green.',
    high: 'The recorded dose is heavy. The extra nitrate and phosphate feed an algae bloom that clouds the water in four days.',
    fail: 'No number was recorded, so the bottle gets guessed at next time too.' },
  { id: 'a-meds', stage: 'measure', skill: 'a', type: 'dose',
    system: 'Medication for one fish', icon: '\u{1F41F}',
    goal: 'One fish has fin rot and is in a hospital bucket. The dose goes into the 50 mL cylinder first, then into the syringe. Read the meniscus honestly.',
    why: 'Medication has a therapeutic window: under it the infection keeps going, over it you poison the fish you are treating.',
    constraints: { unit: 'mL', tool: 'cylinder' }, bands: MEASURE_BANDS,
    actionLabel: 'Give the dose',
    // The only stage that can heal acute stress: a fish that recovers is one less fish in
    // trouble. Negative shock clamps at zero, so it can never bank credit.
    effect: { good: { shock: -18 }, low: { shock: 11 }, high: { shock: 30 }, fail: { shock: 6 } },
    safeState: 'FISH RECOVERING', lowState: 'INFECTION HOLDS', highState: 'FISH POISONED',
    safe: 'The fin edge stops receding by day three and the fish starts eating again.',
    low: 'The dose lands under the therapeutic window. The infection carries on and the fish gets weaker.',
    high: 'The dose lands over the window. The fish stops eating and lies on the bucket floor.',
    fail: 'The syringe never got read, so the fish sits in the bucket untreated.' },

  // ---------- C.2 significant figures (the log everyone else reads) ----------
  { id: 'b-log', stage: 'sigfig', skill: 'b', type: 'identity',
    system: 'The tank log', icon: '\u{1F4D2}',
    goal: 'Write the number in the log the way the tool justifies it, so the digits themselves say how good the measurement was.',
    why: 'Extra digits are a lie about your equipment and missing digits throw away what it could actually tell you. The log is read by whoever feeds them next week.',
    success: 'The entry carries exactly the digits the tool earned, and the next reader can see the precision without asking.',
    fail: 'The entry claims a precision the tool never had, and the next person mixes to a number that was never real.',
    effect: { good: { log: 22 }, bad: { log: -16 } } },
  { id: 'b-volume', stage: 'sigfig', skill: 'b', type: 'identity',
    system: 'How big is this tank, really', icon: '\u{1F4CF}',
    goal: 'The box said 20 gallons. The tape measure and the gravel say otherwise. Report the measured volume to the digits the tape supports.',
    why: 'Every dose in this room is per gallon. Dose the box’s number instead of the tank’s and every single dose is wrong by the same factor, forever.',
    success: 'The tank’s real volume goes in the log with honest digits, and every dose from here on is scaled to the actual water.',
    fail: 'The log keeps a volume the tank does not have, and the error rides along in every dose after it.',
    effect: { good: { log: 22 }, bad: { log: -18 } } },
  { id: 'b-pergallon', stage: 'sigfig', skill: 'b', type: 'identity',
    system: 'Dose per gallon × gallons', icon: '\u{1F9EE}',
    goal: 'Multiply the label’s dose-per-gallon by the tank’s gallons, then report the product with the digits the weakest input allows.',
    why: 'A calculator will hand you ten digits from two-digit inputs. Copy those down and you have invented precision that no measurement in the room supports.',
    success: 'The product is reported to the weakest input’s precision, and the log stays honest about what was actually known.',
    fail: 'The calculator’s digits go straight into the log, and the entry now claims a precision nothing in this room can back up.',
    effect: { good: { log: 22 }, bad: { log: -16 } } },

  // ---------- C.3 density by displacement (what is that thing in the gravel) ----------
  { id: 'c-ornament', stage: 'density', skill: 'c', type: 'decision',
    system: 'The online ornament', icon: '\u{1F3EF}',
    goal: 'A metal ornament arrived with no material listed. Mass it, displace it, get a density, name the metal, then decide whether it goes in the tank.',
    why: 'Copper, zinc and lead dissolve slowly into soft water and are toxic to fish and invertebrates. Aluminum, titanium, iron, silver and gold are not acutely so. Density is the only evidence you have.',
    consequences: {
      keep: 'It goes in beside the driftwood and the tank carries on.',
      pull: 'It comes back out and goes on the shelf, and nothing dissolves into the water.'
    },
    // A supported call cleans the water up: the toxic piece comes out, or a harmless one is
    // cleared to stay and stops being a suspect. An unsupported call (density outside the
    // band, or the wrong metal named) puts a wrong identification in the log. Leaving a
    // toxic piece in adds that metal's own leach rate on top — main.js reads it from
    // SUBSTANCES, because it depends on which piece this roll produced, not on the story.
    effect: { good: { metals: -0.02 }, bad: { log: -10 } } },
  { id: 'c-pendant', stage: 'density', skill: 'c', type: 'decision',
    system: 'The pendant in the gravel', icon: '\u{1F48D}',
    goal: 'A small pendant turned up during the gravel vac, sold as silver. Mass and displacement will say what it actually is.',
    why: 'Plated jewellery is usually a cheap base metal under a thin coat, and the coat is already scratched. Which base metal decides whether the tank is fine or slowly poisoned.',
    // Sold as silver, so silver is on the table; the rest are the cheap bases plating is
    // actually laid over. Zinc, copper and lead are the toxic three, silver and aluminum
    // are not, so the call the brief promises is still a real call.
    constraints: { substances: ['Silver', 'Zinc', 'Copper', 'Aluminum', 'Lead'] },
    consequences: {
      keep: 'It stays in the gravel, and whatever it is stays in contact with the water.',
      pull: 'It comes out, gets rinsed, and goes in a drawer where it cannot leach into anything.'
    },
    // A supported call cleans the water up: the toxic piece comes out, or a harmless one is
    // cleared to stay and stops being a suspect. An unsupported call (density outside the
    // band, or the wrong metal named) puts a wrong identification in the log. Leaving a
    // toxic piece in adds that metal's own leach rate on top — main.js reads it from
    // SUBSTANCES, because it depends on which piece this roll produced, not on the story.
    effect: { good: { metals: -0.02 }, bad: { log: -10 } } },
  { id: 'c-anchor', stage: 'density', skill: 'c', type: 'decision',
    system: 'The plant-anchor weight', icon: '\u{1FAA8}',
    goal: 'The weights that hold the stem plants down came in an unlabelled bag. One of them is on the balance now.',
    why: 'Plant weights are usually lead. Lead sitting in soft, slightly acidic tank water is exactly the case where a decoration becomes a slow dose.',
    // What an unlabelled bag of aquarium plant weights actually contains. "Usually lead" is
    // a hedge the draw now honours: lead and zinc are the toxic pair, iron is not.
    constraints: { substances: ['Lead', 'Zinc', 'Iron'] },
    consequences: {
      keep: 'The stems stay pinned to the substrate and the weight stays underwater.',
      pull: 'The stems get tied to slate instead, and the weight never touches the tank again.'
    },
    // A supported call cleans the water up: the toxic piece comes out, or a harmless one is
    // cleared to stay and stops being a suspect. An unsupported call (density outside the
    // band, or the wrong metal named) puts a wrong identification in the log. Leaving a
    // toxic piece in adds that metal's own leach rate on top — main.js reads it from
    // SUBSTANCES, because it depends on which piece this roll produced, not on the story.
    effect: { good: { metals: -0.02 }, bad: { log: -10 } } },

  // ---------- C.4 judge the data (can you believe your own instrument) ----------
  { id: 'd-dropkit', stage: 'evaluate', skill: 'd', type: 'decision',
    system: 'Drop kit vs the shop', icon: '\u{1F9EA}',
    goal: 'Five runs of the liquid drop kit on the same water sample, against the value the fish shop measured. Classify what the five runs actually show.',
    why: 'Repeating a measurement exposes scatter and nothing else. If the kit is wrong the same way every time, running it five more times will only make you more confident in the wrong number.',
    consequences: {
      both: 'The kit agrees with the shop and repeats tightly, so you can dose from your own readings.',
      precise: 'The kit repeats tightly but sits off the shop’s value, so every dose you calculate from it is off by the same amount.',
      accurate: 'The kit averages out right but any single run could be well off, so one reading is not enough to dose from.',
      neither: 'The kit is neither centred nor repeatable, and dosing from it is guessing with extra steps.'
    },
    effect: { good: { kit: 24 }, bad: { kit: -18 } } },
  { id: 'd-penmeter', stage: 'evaluate', skill: 'd', type: 'decision',
    system: 'The cheap pen meter', icon: '\u{1F4DF}',
    goal: 'The digital pen meter reads to two decimals, which looks convincing. Five dips into the same beaker say whether the decimals mean anything.',
    why: 'A digital display shows digits whether or not the sensor earned them. Resolution is what the screen shows; precision is what the instrument can repeat.',
    // A pH pen measures pH, and the pH dataset is the two-decimal one. Left unpinned this
    // bench could deal nitrate at one decimal under a brief built on the second decimal.
    constraints: { quantity: 'pH' },
    consequences: {
      both: 'The pen repeats and lands on the reference, so the two decimals are real.',
      precise: 'The pen repeats beautifully and is calibrated wrong, which is the most dangerous instrument in the room.',
      accurate: 'The pen wanders, but the average is right, so it needs several dips before you believe it.',
      neither: 'The pen wanders and is off centre. The second decimal is decoration.'
    },
    effect: { good: { kit: 24 }, bad: { kit: -18 } } },
  { id: 'd-strips', stage: 'evaluate', skill: 'd', type: 'decision',
    system: 'Strips from a hot car', icon: '\u{1F321}\u{FE0F}',
    goal: 'The test strips spent a summer in a car. Five strips, same sample. Judge the set before you trust any single one.',
    why: 'Heat degrades the reagent pads unevenly. That shows up as scatter, as a shift, or as both, and the strip does not tell you which.',
    consequences: {
      both: 'The strips survived the heat and still agree with the reference.',
      precise: 'The strips agree with each other and not with reality, which is a degraded reagent reading consistently low.',
      accurate: 'The pads degraded unevenly. The average is fine and any one strip is a coin flip.',
      neither: 'The pads are cooked. These strips cannot tell you anything about this tank.'
    },
    effect: { good: { kit: 24 }, bad: { kit: -18 } } },

  // ---------- Honors ----------
  { id: 'h1-sizecall', stage: 'density', skill: 'h1', type: 'decision',
    system: 'Is the sample big enough', icon: '\u{2696}\u{FE0F}',
    goal: 'Propagate the balance and volume uncertainties into the density, then decide whether this sample can name the metal at all.',
    why: 'Two candidate metals sit close together on the density scale. If your uncertainty is wider than the gap between them, your number cannot tell them apart and saying which one it is would be a guess wearing a decimal point.',
    consequences: {
      call: 'You name the metal and act on it, because the uncertainty is narrower than the gap to the next candidate.',
      bigger: 'You hold the call and find a bigger piece, because this one cannot resolve the two candidates.'
    },
    effect: { good: { log: 15 }, bad: { log: -10 } } },
  { id: 'h2-kitcall', stage: 'evaluate', skill: 'h2', type: 'decision',
    system: 'Trust it or replace it', icon: '\u{1F4C9}',
    goal: 'Quantify the scatter with a standard deviation, then make the call on the kit itself.',
    why: 'Scatter and bias have different cures. Scatter says the reagent or the technique is failing. Bias says the kit is fine at repeating and wrong at the truth, and only an outside reference can catch that.',
    consequences: {
      trust: 'The kit repeats and lands on the reference, so it stays in the drawer and you dose from it.',
      replace: 'The reagent goes in the bin. Scatter this wide is the kit failing, not the water changing.',
      send: 'A sample goes to the shop for a cross-check, because a tight, consistently shifted set is exactly what an outside reference is for.'
    },
    effect: { good: { kit: 18 }, bad: { kit: -14 } } },

  // ---------- Capstone ----------
  { id: 'cap-waterchange', stage: 'capstone', skill: 'cap', type: 'decision',
    system: 'The water change', icon: '\u{1FAA3}',
    goal: 'The fish are in a bucket. Work out what the tank will read after the change, then make one call: back in tonight, another day in the bucket, or a sample to the shop first.',
    why: 'Every skill in this unit meets here. The number you compute, the metal you named, and whether your own kit can be believed all decide the same thing: can six fish go back in that water tonight.',
    options: [
      { key: 'tonight', label: 'Put the fish back in tonight' },
      { key: 'hold',    label: 'Hold them in the bucket another day' },
      { key: 'shop',    label: 'Take a sample to the shop first' }
    ],
    consequences: {
      tonight: 'They go back in tonight, spread out across the tank, and eat in the morning.',
      hold: 'They spend another night in the bucket with an air stone. Not comfortable, but survivable, and the tank gets another dose and another day.',
      shop: 'A sample goes to the shop. It costs you a day and it is the only way to find out what your own kit is not telling you.'
    },
    // The one place a wrong call is worse than a stalled one: putting six fish into water
    // that is not ready is the failure this whole unit exists to prevent, so it lands as
    // acute stress rather than a slow drift. main.js picks `bad` vs `badSafe` by which
    // wrong call was made — holding them an extra night is cautious, not harmful.
    effect: { good: { water: -3, metals: -0.05, shock: -40 }, bad: { shock: 45 }, badSafe: { shock: 5 } } }
];
