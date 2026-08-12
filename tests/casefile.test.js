// tests/casefile.test.js — gate for the shared Case File component and every
// unit's case data. Run: node tests/casefile.test.js
//
// This suite is the reason a malformed Case File cannot ship: it validates each
// unit's CASE against the schema, checks cross-unit uniqueness, and exercises the
// pure step/quiz logic. When you add a Case File to a new unit, add it to UNITS.
import { readFileSync } from 'node:fs';
import { validateCase, createCaseFile, caseFileMarkup, teaserMarkup } from '../shared/js/casefile.js';

import { CASE as U1 } from '../units/01-practices-matter/js/case.js';
import { CASE as U2 } from '../units/02-atomic-structure/js/case.js';
import { CASE as U3 } from '../units/03-periodic-trends/js/case.js';
import { CASE as U4 } from '../units/04-bonding-geometry/js/case.js';
import { CASE as U5 } from '../units/05-the-mole/js/case.js';
import { CASE as U6 } from '../units/06-reactions-stoichiometry/js/case.js';
import { CASE as U7 } from '../units/07-gas-laws/js/case.js';
import { CASE as U8 } from '../units/08-solutions/js/case.js';
import { CASE as U9 } from '../units/09-acids-bases/js/case.js';
import { CASE as U10 } from '../units/10-thermochemistry/js/case.js';
import { CASE as U11 } from '../units/11-nuclear/js/case.js';

// Unit 5A intentionally shares Unit 5's story, so it is excluded from the
// id/number uniqueness check below but still validated as data.
const UNITS = [
  { unit: '01', CASE: U1 },
  { unit: '02', CASE: U2 },
  { unit: '03', CASE: U3 },
  { unit: '04', CASE: U4 },
  { unit: '05', CASE: U5 },
  { unit: '06', CASE: U6 },
  { unit: '07', CASE: U7 },
  { unit: '08', CASE: U8 },
  { unit: '09', CASE: U9 },
  { unit: '10', CASE: U10 },
  { unit: '11', CASE: U11 }
];
// U5a (the lab build) is an OPTIONAL variant: it is absent from teks.js's UNITS[],
// the hub never links it, and nothing outside its own folder loads from it, so a
// deploy or a checkout can legitimately drop it. Imported dynamically so this gate
// still runs when the folder is gone, and counted as skipped rather than silently
// dropped, because a quietly smaller test run is worse than a smaller one you can see.
let U5A = null;
try { ({ CASE: U5A } = await import('../units/05a-the-mole-lab/js/case.js')); } catch { /* not deployed */ }
const ALL = U5A ? [...UNITS, { unit: '05a', CASE: U5A }] : [...UNITS];

let pass = 0, fail = 0, skipped = 0;
const t = (name, cond) => { cond ? pass++ : (fail++, console.log('FAIL:', name)); };
const skip = name => { skipped++; console.log('SKIP:', name, '(unit 05a not present)'); };

// ---------------------------------------------------------------- schema gate
for (const { unit, CASE } of ALL) {
  const problems = validateCase(CASE);
  t(`unit ${unit}: case data is valid${problems.length ? ' -> ' + problems.join('; ') : ''}`, problems.length === 0);
}

// validateCase itself must actually catch things
t('validateCase rejects a non-object', validateCase(null).length > 0);
t('validateCase rejects a missing title', (() => {
  const bad = { ...U1, title: '' };
  return validateCase(bad).some(p => p.startsWith('title'));
})());
t('validateCase rejects two correct quiz options', (() => {
  const bad = { ...U1, quiz: { ...U1.quiz, options: U1.quiz.options.map(o => ({ ...o, correct: true })) } };
  return validateCase(bad).some(p => p.includes('exactly 1 correct'));
})());
t('validateCase rejects zero correct quiz options', (() => {
  const bad = { ...U1, quiz: { ...U1.quiz, options: U1.quiz.options.map(o => ({ ...o, correct: false })) } };
  return validateCase(bad).some(p => p.includes('exactly 1 correct'));
})());
t('validateCase rejects a one-chapter story', validateCase({ ...U1, steps: [U1.steps[0]] }).some(p => p.startsWith('steps')));
t('validateCase rejects a stage with no svg', validateCase({ ...U1, stage: '<div></div>' }).some(p => p.startsWith('stage')));
t('validateCase rejects a missing teaser', validateCase({ ...U1, teaser: '' }).some(p => p.startsWith('teaser')));
t('validateCase rejects state that shadows step', validateCase({ ...U1, state: { step: 2 } }).some(p => p.includes('shadows')));

// ------------------------------------------------------------ cross-unit rules
const ids = UNITS.map(u => u.CASE.id);
t('case ids are unique across units', new Set(ids).size === ids.length);
const numbers = UNITS.map(u => u.CASE.number);
t('case numbers are unique across units', new Set(numbers).size === numbers.length);
t('every case id is kebab-case', ids.every(id => /^[a-z0-9]+(-[a-z0-9]+)*$/.test(id)));
U5A ? t('unit 05a deliberately reuses unit 05 story', U5A.id === U5.id && U5A.title === U5.title)
    : skip('unit 05a reuses unit 05 story');

// ------------------------------------------------------------- editorial rules
// House style: no em-dashes or en-dashes in student-facing copy.
const dash = /[—–]/;
for (const { unit, CASE } of ALL) {
  const copy = [
    CASE.title, CASE.teaser, CASE.hook, CASE.punch, CASE.kicker, CASE.cta.label,
    CASE.quiz.q, CASE.quiz.explain,
    ...CASE.quiz.options.map(o => o.label),
    ...CASE.careers,
    ...CASE.stats.flatMap(s => [s.v, s.k]),
    ...CASE.steps.flatMap(s => [s.t, s.body, s.chem, s.cap])
  ];
  const offenders = copy.filter(s => dash.test(s));
  t(`unit ${unit}: no em/en dashes in copy${offenders.length ? ' -> ' + offenders[0] : ''}`, offenders.length === 0);
}

// The CTA has to target a real mode, expressed as an Alpine assignment or call.
for (const { unit, CASE } of ALL) {
  t(`unit ${unit}: cta.call looks like a mode switch`, /^(mode\s*=\s*'[a-z]+'|setMode\('[a-z]+'\))$/.test(CASE.cta.call));
}

// ---------------------------------------------------------------- step logic
{
  const c = createCaseFile(U1);
  t('starts on the first chapter', c.step === 0);
  t('s resolves to the current chapter', c.s === U1.steps[0]);
  t('prev at the start is a no-op', (() => { c.prev(); return c.step === 0; })());
  t('next advances', (() => { c.next(); return c.step === 1; })());
  t('go jumps to a chapter', (() => { c.go(3); return c.step === 3; })());
  t('go ignores an out-of-range index', (() => { c.go(99); return c.step === 3; })());
  t('go ignores a negative index', (() => { c.go(-2); return c.step === 3; })());
  t('atLast is true on the final chapter', c.atLast === true);
  t('next at the end is a no-op', (() => { c.next(); return c.step === U1.steps.length - 1; })());
  t('prev walks back', (() => { c.prev(); return c.step === U1.steps.length - 2; })());
}

// ---------------------------------------------------------------- quiz logic
{
  const c = createCaseFile(U1);
  const correctIdx = U1.quiz.options.findIndex(o => o.correct);
  const wrongIdx = U1.quiz.options.findIndex(o => !o.correct);

  t('no selection at the start', c.quizPick === null && c.quizChecked === false);
  t('unpicked option has no state', c.quizState(correctIdx) === '');
  t('picking marks it on', (() => { c.pickQuiz(wrongIdx); return c.quizState(wrongIdx) === 'on'; })());
  t('repicking moves the selection', (() => { c.pickQuiz(correctIdx); return c.quizState(wrongIdx) === '' && c.quizState(correctIdx) === 'on'; })());
  t('quizCorrect is false before checking', c.quizCorrect === false);
  t('checking a correct pick reveals it', (() => { c.checkQuiz(); return c.quizChecked && c.quizCorrect; })());
  t('after checking, picking is locked out', (() => { c.pickQuiz(wrongIdx); return c.quizPick === correctIdx; })());
  t('retry clears the attempt', (() => { c.retryQuiz(); return c.quizPick === null && c.quizChecked === false; })());

  const w = createCaseFile(U1);
  w.pickQuiz(wrongIdx); w.checkQuiz();
  t('a wrong pick reads wrong', w.quizState(wrongIdx) === 'wrong');
  t('a wrong pick still reveals the correct one', w.quizState(correctIdx) === 'correct');
  t('quizCorrect is false on a wrong pick', w.quizCorrect === false);

  const u = createCaseFile(U1);
  u.checkQuiz();
  t('checking with no pick does nothing', u.quizChecked === false);
}

// ------------------------------------------------------- extra stage state
{
  const c = createCaseFile(U7);
  t('unit 07 stage state is spread into the component', typeof c.depth === 'number');
  t('unit 07 starts at full depth', c.depth === 30);
  t('extra state does not disturb step logic', c.step === 0);
}

// ---------------------------------------------------------------- the markup
for (const { unit, CASE } of ALL) {
  const html = caseFileMarkup(CASE);
  t(`unit ${unit}: markup carries the stage svg`, html.includes('<svg'));
  t(`unit ${unit}: markup wires x-data="casefile"`, html.includes('x-data="casefile"'));
  t(`unit ${unit}: markup embeds the cta call`, html.includes(CASE.cta.call));
  // Raw < and > inside Alpine expressions break HTML parsing, so the chrome must
  // escape them. Catches a regression like :class="{ done: i<step }".
  t(`unit ${unit}: no raw < inside an alpine attribute`, !/:class="[^"]*<[^"]*"/.test(html) && !/x-show="[^"]*<[^"]*"/.test(html));
  // Balanced tags for the elements the chrome owns.
  for (const tag of ['section', 'figure', 'ol', 'template']) {
    const open = (html.match(new RegExp(`<${tag}[\\s>]`, 'g')) || []).length;
    const close = (html.match(new RegExp(`</${tag}>`, 'g')) || []).length;
    t(`unit ${unit}: <${tag}> balanced in markup (${open}/${close})`, open === close);
  }
}

// The teaser chip anchors to the story section on the same page.
for (const { unit, CASE } of ALL) {
  const chip = teaserMarkup(CASE);
  t(`unit ${unit}: teaser links to #casefile`, chip.includes('href="#casefile"'));
  t(`unit ${unit}: teaser carries its copy`, chip.includes(CASE.teaser));
}

// ------------------------------------------- animation classes must exist in CSS
// A stage that references .a-whatever without casefile.css defining it renders a
// silently frozen scene, which no other check would catch.
{
  const css = readFileSync(new URL('../shared/css/casefile.css', import.meta.url), 'utf8');
  const defined = new Set([...css.matchAll(/\.(a-[a-z0-9-]+)\s*(?:,|\{)/g)].map(m => m[1]));
  t(`casefile.css defines animation classes (${defined.size} found)`, defined.size > 0);

  for (const { unit, CASE } of ALL) {
    const markup = (CASE.stage || '') + (CASE.controls || '');
    const used = new Set();
    // class="a-foo bar" and :class="step===0 ? 'a-shake' : ''"
    for (const m of markup.matchAll(/class="([^"]*)"/g)) {
      for (const c of m[1].split(/\s+/)) if (c.startsWith('a-')) used.add(c);
    }
    for (const m of markup.matchAll(/'(a-[a-z0-9-]+)'/g)) used.add(m[1]);

    const missing = [...used].filter(c => !defined.has(c));
    t(`unit ${unit}: every animation class is defined${missing.length ? ' -> missing ' + missing.join(', ') : ''}`, missing.length === 0);
  }
}

// ------------------------------------------------- reduced motion must be handled
// Several keyframes end at opacity 0, so clamping duration (base.css) would hide those
// elements instead of stilling them. casefile.css must stop the animations outright.
{
  const css = readFileSync(new URL('../shared/css/casefile.css', import.meta.url), 'utf8');
  const block = css.slice(css.indexOf('@media (prefers-reduced-motion'));
  t('casefile.css has a prefers-reduced-motion block', css.includes('@media (prefers-reduced-motion'));
  t('reduced motion stops stage animations outright', /\[class\*="a-"\][\s\S]{0,220}animation:\s*none\s*!important/.test(block));
  t('reduced motion restores the a-draw stroke', /a-draw[\s\S]{0,120}stroke-dashoffset:\s*0\s*!important/.test(block));
}

// ------------------------------------- the stage must not fight reduced motion
// All Case File motion is CSS-driven so base.css's prefers-reduced-motion kill
// switch can freeze it. A stage that animates via inline JS would bypass that.
for (const { unit, CASE } of ALL) {
  const markup = (CASE.stage || '') + (CASE.controls || '');
  t(`unit ${unit}: stage has no <script>`, !/<script/i.test(markup));
  t(`unit ${unit}: stage has no SMIL <animate>`, !/<animate[\s>]|<animateTransform[\s>]/i.test(markup));
}

// The mount contract: mountCaseFile must not be callable without a DOM, but the
// pure pieces above must be. Guard that the module never touched document at import.
t('module imports cleanly in node (no DOM at import time)', typeof caseFileMarkup === 'function');

console.log(`\n${pass} passed, ${fail} failed${skipped ? `, ${skipped} skipped` : ''}`);
process.exit(fail ? 1 : 0);
