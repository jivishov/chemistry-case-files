// tests/notation.test.mjs — gate for shared/js/notation.js. Run: node tests/notation.test.mjs
//
// Two jobs, and the second is the one that matters. The first is that H2O comes out as H₂O.
// The second is that notationHTML, which runs over authored ENGLISH, does not touch anything
// that only looks like chemistry: the TEKS codes (C.9(C)), the framework names
// (Bronsted-Lowry), the words that are also element symbols (NO, In, At, No), pH, and every
// bare number in a consequence line. A formula typesetter that subscripts part of a sentence
// is worse than no typesetter at all, so most of this file is negative cases.
import {
  escapeHTML, formulaHTML, configHTML, sciHTML, expHTML, notationHTML, isFormulaToken, registerNotation
} from '../shared/js/notation.js';
import { electronConfiguration, formatConfig, ELEMENTS } from '../shared/js/chem.js';
import { readFileSync, readdirSync, existsSync } from 'node:fs';

const src = rel => readFileSync(new URL(`../${rel}`, import.meta.url), 'utf8');
import { REACTIONS } from '../units/06-reactions-stoichiometry/js/model.js';
import { COMPOUNDS, MOLECULES } from '../units/04-bonding-geometry/js/model.js';
import { STRENGTH, NEUT_ACIDS, NEUT_BASES, WEAK_ACIDS } from '../units/09-acids-bases/js/model.js';
import { SOLUBILITY_CURVES } from '../units/08-solutions/js/model.js';

let pass = 0, fail = 0;
const t = (name, cond) => { cond ? pass++ : (fail++, console.log('FAIL:', name)); };
const eq = (name, got, want) => {
  if (got === want) pass++;
  else { fail++; console.log(`FAIL: ${name}\n   got  ${JSON.stringify(got)}\n   want ${JSON.stringify(want)}`); }
};

// ===================================== escaping =====================================
eq('escapeHTML closes every hole', escapeHTML(`<a href="x">&'`), '&lt;a href=&quot;x&quot;&gt;&amp;&#39;');
t('escapeHTML survives null and undefined', escapeHTML(null) === '' && escapeHTML(undefined) === '');
t('formulaHTML escapes before it marks up', !formulaHTML('<script>').includes('<script>'));
t('notationHTML escapes before it marks up', !notationHTML('<img src=x onerror=y>').includes('<img'));

// =================================== formulaHTML ====================================
eq('a single subscript', formulaHTML('H2O'), 'H<sub>2</sub>O');
eq('two subscripts', formulaHTML('Fe2O3'), 'Fe<sub>2</sub>O<sub>3</sub>');
eq('a two-letter symbol keeps its lowercase', formulaHTML('NaCl'), 'NaCl');
eq('a bracketed group takes its multiplier', formulaHTML('Ca(OH)2'), 'Ca(OH)<sub>2</sub>');
eq('nested brackets', formulaHTML('Cu(NO3)2'), 'Cu(NO<sub>3</sub>)<sub>2</sub>');
eq('a three-digit subscript stays one run', formulaHTML('C100H200'), 'C<sub>100</sub>H<sub>200</sub>');
eq('an organic formula', formulaHTML('CH3COOH'), 'CH<sub>3</sub>COOH');
eq('a long chain', formulaHTML('C2H5NH2'), 'C<sub>2</sub>H<sub>5</sub>NH<sub>2</sub>');

// The coefficient/subscript distinction is the whole point of the scanner's one state bit.
eq('a leading coefficient stays full size', formulaHTML('2H2O'), '2H<sub>2</sub>O');
eq('a spaced coefficient stays full size', formulaHTML('2 H2O'), '2 H<sub>2</sub>O');
eq('the reaction from the Unit 3 panel', formulaHTML('2Na + 2H2O -> 2NaOH + H2'),
   '2Na + 2H<sub>2</sub>O → 2NaOH + H<sub>2</sub>');
eq('a coefficient after a plus is not a subscript', formulaHTML('Cl2 + 2Na -> 2NaCl'),
   'Cl<sub>2</sub> + 2Na → 2NaCl');

// Charges.
eq('an explicit charge', formulaHTML('SO4^2-'), 'SO<sub>4</sub><sup>2-</sup>');
eq('a bare charge welded to an atom', formulaHTML('H+'), 'H<sup>+</sup>');
eq('a charge after a subscript', formulaHTML('NH4+'), 'NH<sub>4</sub><sup>+</sup>');
eq('a mhchem charge with no digit', formulaHTML('OH^-'), 'OH<sup>-</sup>');
eq('an operator plus is not a charge', formulaHTML('Na + Cl'), 'Na + Cl');
eq('a charge and an operator in one string', formulaHTML('H+ + OH^- -> H2O'),
   'H<sup>+</sup> + OH<sup>-</sup> → H<sub>2</sub>O');

// Arrows and mhchem's phase and precipitate markers.
eq('a reversible arrow', formulaHTML('H2CO3 <=> H+ + HCO3^-'),
   'H<sub>2</sub>CO<sub>3</sub> ⇌ H<sup>+</sup> + HCO<sub>3</sub><sup>-</sup>');
eq('a long arrow does not double up', formulaHTML('A --> B'), 'A → B');
eq('a phase label is not parsed as a formula', formulaHTML('H2O(l)'),
   'H<sub>2</sub>O<span class="phase">(l)</span>');
eq('aq survives as a phase', formulaHTML('HCl(aq)'), 'HCl<span class="phase">(aq)</span>');
eq('a precipitate marker', formulaHTML('AgCl v'), 'AgCl ↓');
eq('a hydrate multiplier is a coefficient', formulaHTML('CuSO4·5H2O'),
   'CuSO<sub>4</sub>·5H<sub>2</sub>O');
eq('an empty formula is empty, not "undefined"', formulaHTML(''), '');
eq('a null formula is empty', formulaHTML(null), '');

// ============================ every shipped formula round-trips ============================
// Not a spot check: the point is that no formula anywhere in the models comes out of the
// typesetter with a digit left unsubscripted, and that nothing is silently dropped.
const stripped = h => h.replace(/<\/?su[bp]>/g, '').replace(/<span class="phase">|<\/span>/g, '');
const ALL_FORMULAS = [
  ...REACTIONS.flatMap(r => [...r.reactants, ...r.products].map(s => s.f)),
  ...COMPOUNDS.map(c => c.formula),
  ...MOLECULES.map(m => m.formula),
  ...STRENGTH.acid.strong.map(b => b.f), ...STRENGTH.acid.weak.map(b => b.f),
  ...STRENGTH.base.strong.map(b => b.f), ...STRENGTH.base.weak.map(b => b.f),
  ...NEUT_ACIDS.map(a => a.f), ...NEUT_BASES.map(b => b.f),
  ...WEAK_ACIDS.map(a => a.f),
  ...SOLUBILITY_CURVES.map(c => c.key),
];
t(`collected the shipped formulas (${ALL_FORMULAS.length})`, ALL_FORMULAS.length > 90);
const lossy = ALL_FORMULAS.filter(f => stripped(formulaHTML(f)) !== f);
t('no shipped formula loses or gains a character in typesetting', lossy.length === 0);
if (lossy.length) console.log('   lossy:', lossy.slice(0, 8).join(' '));
const unmarked = ALL_FORMULAS.filter(f => /[0-9]/.test(f) && !formulaHTML(f).includes('<sub>'));
t('every shipped formula with a digit gets a subscript', unmarked.length === 0);
if (unmarked.length) console.log('   unmarked:', unmarked.slice(0, 8).join(' '));

// A leading coefficient must never be lowered, on any of the real display strings.
const badCoef = REACTIONS.filter(r => /^<sub>/.test(formulaHTML(r.display)));
t('no reaction display string subscripts its own leading coefficient', badCoef.length === 0);
const displaysOk = REACTIONS.every(r => {
  const h = formulaHTML(r.display);
  return h.includes('→') && !h.includes('->') && h.includes('<sub>');
});
t('every reaction display string gets a real arrow and at least one subscript', displaysOk);

// Nuclide prescripts. Unit 11's nuclear equations are the braced TeX form, which stacks the
// mass number over the atomic number IN FRONT of the symbol.
eq('a nuclide stacks its two numbers', formulaHTML('^{235}_{92}U'),
   '<span class="nuclide"><sup>235</sup><sub>92</sub></span>U');
eq('a nuclide keeps a leading coefficient full size', formulaHTML('2^{1}_{0}n'),
   '2<span class="nuclide"><sup>1</sup><sub>0</sub></span>n');
eq('a negative atomic number (a beta particle)', formulaHTML('^{0}_{-1}e'),
   '<span class="nuclide"><sup>0</sup><sub>-1</sub></span>e');
eq('a metastable mass number', formulaHTML('^{99m}_{43}Tc'),
   '<span class="nuclide"><sup>99m</sup><sub>43</sub></span>Tc');
eq('a fission equation end to end', formulaHTML('^{2}_{1}H + ^{3}_{1}H -> ^{4}_{2}He + ^{1}_{0}n'),
   '<span class="nuclide"><sup>2</sup><sub>1</sub></span>H + <span class="nuclide"><sup>3</sup><sub>1</sub></span>H'
   + ' → <span class="nuclide"><sup>4</sup><sub>2</sub></span>He + <span class="nuclide"><sup>1</sup><sub>0</sub></span>n');
t('a braced superscript alone still works', formulaHTML('X^{2}') === 'X<sup>2</sup>');

// A space ENDS a formula unit, so the digit after it is a coefficient. Missing this is what
// made "[Ne] 3s2" come out with the principal quantum number lowered.
eq('a space clears the subscript state', formulaHTML('Ca(OH)2 3'), 'Ca(OH)<sub>2</sub> 3');
eq('a coefficient after a closing bracket and a space', formulaHTML('(OH) 2H2O'), '(OH) 2H<sub>2</sub>O');

// ==================================== configHTML ====================================
// An electron configuration is the OPPOSITE shape to a formula: the digit before the letter
// is the shell and stays full size, the digit after it is the electron count and goes UP.
// Routing one through formulaHTML lowered the shell number and left the count flat.
eq('a configuration raises the electron count', configHTML('1s2 2s2 2p6 3s2'),
   '1s<sup>2</sup> 2s<sup>2</sup> 2p<sup>6</sup> 3s<sup>2</sup>');
eq('a noble-gas core passes through', configHTML('[Ne] 3s2'), '[Ne] 3s<sup>2</sup>');
eq('a d-subshell exception', configHTML('[Ar] 4s1 3d5'), '[Ar] 4s<sup>1</sup> 3d<sup>5</sup>');
eq('a single electron', configHTML('1s1'), '1s<sup>1</sup>');
eq('an empty configuration', configHTML(''), '');
t('configHTML escapes', !configHTML('<b>1s2').includes('<b>'));
// Not one shell number anywhere in the table may be raised, and not one electron count left
// flat, across every element the builds can select.
{
  const bad = [];
  for (const e of ELEMENTS) {
    const flat = formatConfig(electronConfiguration(e.z));
    const html = configHTML(flat);
    const back = html.replace(/<\/?sup>/g, '');
    if (back !== flat) bad.push(`${e.sym}: lossy`);
    for (const m of flat.matchAll(/(\d+)([spdf])(\d+)/g)) {
      if (!html.includes(`${m[1]}${m[2]}<sup>${m[3]}</sup>`)) bad.push(`${e.sym}: ${m[0]}`);
    }
  }
  t(`every element's configuration typesets correctly (${ELEMENTS.length} elements)`, bad.length === 0);
  if (bad.length) console.log('   bad:', bad.slice(0, 6).join(', '));
}
// The failure that shipped: a configuration must never come out with a subscript.
t('no configuration in the table ever gains a subscript',
  ELEMENTS.every(e => !configHTML(formatConfig(electronConfiguration(e.z))).includes('<sub>')));

// ====================== the KaTeX-less fallback, on every ce: string ======================
// render.js's renderCE falls back to formulaHTML when KaTeX is not on the page, which is a
// normal state (offline, filtered network, the units that never loaded it). So every mhchem
// string the models hand to x-ce has to survive that path with nothing lost and nothing left
// in mhchem spelling. Read from source rather than imported: the strings live on several
// differently-shaped exports, and what matters is that ALL of them are covered.
{
  const CE = [];
  for (const tree of ['units']) {
    for (const d of readdirSync(new URL(`../${tree}`, import.meta.url), { withFileTypes: true })) {
      if (!d.isDirectory() || !/^\d\d-/.test(d.name)) continue;
      for (const f of ['js/model.js', 'js/main.js']) {
        const rel = `${tree}/${d.name}/${f}`;
        if (!existsSync(new URL(`../${rel}`, import.meta.url))) continue;
        for (const m of src(rel).matchAll(/\bce: '([^']+)'/g)) CE.push([rel, m[1]]);
      }
    }
  }
  t(`collected the mhchem strings bound with x-ce (${CE.length})`, CE.length >= 30);
  // Compare the two at the level of the characters that CARRY meaning: strip all markup from
  // the output, strip the notation punctuation from the input (mhchem's ^ and TeX's _{ }),
  // normalise the arrow, and collapse whitespace. Anything left over is a real loss.
  const norm = x => x.replace(/[\^_{}]/g, '').replace(/\s*(->|→|<=>|⇌)\s*/g, '>').replace(/\s+/g, ' ').trim();
  const lost = [], stillMhchem = [];
  for (const [rel, s] of CE) {
    const h = formulaHTML(s);
    const text = h.replace(/<[^>]+>/g, '');
    if (norm(text) !== norm(s)) lost.push(`${rel}: ${s}  ->  ${text}`);
    if (/->|\^|_\{/.test(h.replace(/<[^>]+>/g, ' '))) stillMhchem.push(`${rel}: ${h}`);
  }
  t('no ce: string loses a character through the KaTeX-less fallback', lost.length === 0);
  if (lost.length) console.log('   lost:', lost.slice(0, 4).join(' | '));
  t('no ce: string comes out still spelled in mhchem', stillMhchem.length === 0);
  if (stillMhchem.length) console.log('   raw:', stillMhchem.slice(0, 4).join(' | '));
}

// ================================= sciHTML / expHTML =================================
eq('Avogadro', sciHTML(6.022e23, { sig: 4 }), '6.022 × 10<sup>23</sup>');
eq('a particle count at three figures', sciHTML(1.882e24), '1.88 × 10<sup>24</sup>');
eq('a small Ka', sciHTML(1.8e-5, { sig: 2 }), '1.8 × 10<sup>-5</sup>');
eq('a readable number is left readable', sciHTML(0.5), '0.5');
eq('a readable integer is left alone', sciHTML(22.4), '22.4');
eq('always forces the exponent form', sciHTML(22.4, { always: true, sig: 3 }), '2.24 × 10<sup>1</sup>');
eq('zero is zero', sciHTML(0), '0');
eq('a non-number is an em dash', sciHTML(NaN), '&mdash;');
eq('a mantissa of one is dropped', expHTML('1', 23), '10<sup>23</sup>');
eq('a plain power of ten', sciHTML(1e23, { sig: 1 }), '10<sup>23</sup>');

// =================================== notationHTML ===================================
// Positive: the things it is FOR.
eq('e-notation in prose', notationHTML('6.022e23 representative particles in one mole'),
   '6.022 × 10<sup>23</sup> representative particles in one mole');
eq('a signed exponent', notationHTML('you filed 1.88e+24 against it'),
   'you filed 1.88 × 10<sup>24</sup> against it');
eq('a negative exponent', notationHTML('Ka is 3.0e-8 here'), 'Ka is 3.0 × 10<sup>-8</sup> here');
eq('a written power of ten', notationHTML('so 10^4, about ten thousand times'),
   'so 10<sup>4</sup>, about ten thousand times');
eq('a formula inside a sentence', notationHTML('it works out to 12.3 g H2O at the bench'),
   'it works out to 12.3 g H<sub>2</sub>O at the bench');
eq('two formulas and a number', notationHTML('CH4 + 2 O2 makes CO2'),
   'CH<sub>4</sub> + 2 O<sub>2</sub> makes CO<sub>2</sub>');
eq('a formula at the end of a sentence', notationHTML('the excess is Fe2O3.'),
   'the excess is Fe<sub>2</sub>O<sub>3</sub>.');
eq('a bracketed formula in prose', notationHTML('dose it with Ca(OH)2 tonight'),
   'dose it with Ca(OH)<sub>2</sub> tonight');

// An ion written in prose gets its charge raised: that is the job, not a false positive.
eq('a hydroxide ion in prose', notationHTML('produces OH- ions when dissolved in water'),
   'produces OH<sup>-</sup> ions when dissolved in water');
eq('a hydrogen ion in prose', notationHTML('roughly 10,000 times the H+ of neutral saliva'),
   'roughly 10,000 times the H<sup>+</sup> of neutral saliva');
eq('a nuclide with a mass number is left as written', notationHTML('C-14 at 70% over 3000 y'),
   'C-14 at 70% over 3000 y');
eq('every nuclide spelling in Unit 11 survives', notationHTML('H-3, Co-60, F-18, I-131, Sr-90'),
   'H-3, Co-60, F-18, I-131, Sr-90');

// Negative: the things it must NOT touch. These are the real strings from the models.
const untouched = [
  'Interpret, write, and balance equations using conservation of mass.',
  'C.9(C)', 'TEKS C.12(D)', 'C.5(B) family behavior', 'Honors h1 (parent c)',
  'Bronsted-Lowry defines an acid as a proton donor, with no need for water.',
  'You call it low, so the crew treats it as a small spill and walks in.',
  'There is NO free element on the left, so there is nothing to swap.',
  'It is 1.4 atm at 30 m and 232 atm on the bench.',
  'Day 3 of 12, at 06:00, with 50 kg on the truck.',
  'Group 1 x Period 2: eager to lose one electron, tiny, light.',
  'The reading is -3.04 V against sodium at -2.71 V.',
  'Unit 5, C.8D',
  'a 20.0 percent error and inverting it is at minimum 36.0 percent',
];
for (const s of untouched) {
  eq(`prose is left alone: "${s.slice(0, 44)}"`, notationHTML(s), escapeHTML(s));
}

// Hex colours. This is not hypothetical: a case file's `stage` field is a block of SVG, and
// "#0e2836" holds "0e2836", which an unguarded e-notation rule reads as 0 × 10^2836.
const SVG = '<rect x="0" y="56" width="640" height="304" fill="#0e2836" stroke="#1e5b66"/>';
eq('an SVG block comes back escaped and otherwise untouched', notationHTML(SVG), escapeHTML(SVG));
for (const hex of ['#0e2836', '#1e5b66', '#3e8', '#0AF2', '#C0FFEE', '#7fc4d0', '#2a7d8a']) {
  eq(`the hex colour ${hex} survives`, notationHTML(`fill: ${hex};`), `fill: ${hex};`);
}
eq('a four-digit exponent is not scientific notation', notationHTML('id 4e1234 here'), 'id 4e1234 here');

// The word/symbol collisions, spelled out because they are the ones that would bite.
for (const word of ['NO', 'In', 'At', 'No', 'Na', 'Be', 'He', 'Fe', 'CO', 'Se', 'As', 'I', 'Y', 'W']) {
  eq(`the bare symbol "${word}" in prose has nothing to typeset`, notationHTML(word), word);
}
t('a bare symbol is not a formula token', !isFormulaToken('NO') && !isFormulaToken('Fe'));
t('a symbol with a digit is', isFormulaToken('O2') && isFormulaToken('Fe2O3'));
t('a capitalised English word is not', !isFormulaToken('Chlorine2') && !isFormulaToken('Sodium'));
eq('a standards code with its punctuation survives whole', notationHTML('C.9(C)'), 'C.9(C)');
eq('a bare CO2 is a formula but a bare CO is a word', notationHTML('CO and CO2'), 'CO and CO<sub>2</sub>');

// notationHTML must be idempotent on its own output, or a double-bound value would nest tags.
const once = notationHTML('6.022e23 of H2O');
eq('notationHTML does not re-mark its own markup', notationHTML(once).replace(/&lt;/g, '<').replace(/&gt;/g, '>'), once);

// ================================== the directives ==================================
{
  const seen = {};
  registerNotation({ directive: (name, fn) => { seen[name] = fn; } });
  t('registers x-formula, x-config, x-prose and x-sci',
    ['formula', 'config', 'prose', 'sci'].every(k => typeof seen[k] === 'function'));
  // Drive one directive the way Alpine would, to prove the wiring, not just the naming.
  const el = { innerHTML: '' };
  seen.formula(el, { expression: 'x', modifiers: [] }, {
    evaluateLater: () => cb => cb('H2SO4'),
    effect: fn => fn(),
  });
  eq('x-formula writes typeset HTML into the element', el.innerHTML, 'H<sub>2</sub>SO<sub>4</sub>');
  const el2 = { innerHTML: '' };
  seen.sci(el2, { expression: 'x', modifiers: ['always', '4'] }, {
    evaluateLater: () => cb => cb(6.022e23),
    effect: fn => fn(),
  });
  eq('x-sci honours its modifiers', el2.innerHTML, '6.022 × 10<sup>23</sup>');
}

console.log(`\nnotation: ${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
