// tests/game.test.js — regression tests for the pure gamification helpers.
// Run the same way as the engine tests: node tests/game.test.js
import { masteryState, xpFor, MASTERY_TARGET, createGame, outcomeBand } from '../shared/js/game.js';

const approx = (a, b, t = 1e-9) => Math.abs(a - b) < t;
let pass = 0, fail = 0;
const t = (name, cond) => { cond ? pass++ : (fail++, console.log('FAIL:', name)); };

// masteryState (pure)
t('default target is 3', MASTERY_TARGET === 3);
t('run 0 of 3: empty, not mastered', (() => { const m = masteryState(0, 3); return m.fraction === 0 && m.mastered === false; })());
t('run 1 of 3: one third', approx(masteryState(1, 3).fraction, 1 / 3));
t('run 2 of 3: two thirds, not mastered', approx(masteryState(2, 3).fraction, 2 / 3) && masteryState(2, 3).mastered === false);
t('run 3 of 3: full + mastered', masteryState(3, 3).fraction === 1 && masteryState(3, 3).mastered === true);
t('overshoot clamps to full', masteryState(7, 3).fraction === 1 && masteryState(7, 3).mastered === true);
t('uses default target when omitted', masteryState(3).mastered === true);
t('zero target does not divide by zero', isFinite(masteryState(1, 0).fraction));

// xpFor (pure)
t('wrong answer earns nothing', xpFor(false, true, 9) === 0);
t('plain correct = 10', xpFor(true, false, 0) === 10);
t('first-try correct = 15', xpFor(true, true, 0) === 15);
t('streak adds a capped kicker', xpFor(true, true, 3) === 15 + 3 * 2);
t('streak kicker caps at 5', xpFor(true, false, 50) === 10 + 5 * 2);
t('negative streak treated as 0', xpFor(true, false, -4) === 10);

// createGame integration (no DOM/localStorage needed in node)
const skills = [
  { id: 'a', code: 'C.8(A)', label: 'mol-g', target: 3 },
  { id: 'b', code: 'C.8(B)', label: 'particles', target: 3 },
  { id: 'h1', code: 'Honors', label: 'hydrate', target: 2, honors: true }
];
const g = createGame({ unitId: '05-the-mole', skills });
t('starts with zero xp', g.g_xp === 0);
t('starts unmastered', g.gMastered('a') === false && g.gMastery('a') === 0);

g.gRecord('a', true, true);
g.gRecord('a', true, true);
t('two correct -> 2/3 meter', approx(g.gMastery('a'), 2 / 3));
t('two correct, not yet mastered', g.gMastered('a') === false);
g.gRecord('a', true, false);
t('third correct -> mastered', g.gMastered('a') === true && g.gMastery('a') === 1);
t('xp accumulated from the run', g.g_xp > 0);

// a wrong answer resets the run but keeps the mastered flag
g.gRecord('b', true, true);
g.gRecord('b', false, false);
t('wrong answer resets the run', g.gMastery('b') === 0);
t('streak resets on a wrong answer', g.g_streak === 0);

// once mastered, a later wrong answer keeps the meter full (mastery is sticky)
g.gRecord('a', false, false);
t('mastered skill stays full after a miss', g.gMastered('a') === true && g.gMastery('a') === 1);

// gOverall counts only core skills (h1 is honors)
t('overall ignores honors skills', approx(g.gOverall(), 1 / 2)); // a mastered, b not, of 2 core

// reset clears everything
g.gReset();
t('reset clears xp', g.g_xp === 0);
t('reset clears mastery', g.gMastered('a') === false);

// outcomeBand (pure, Scenario layer)
const rel = { mode: 'relative', ideal: 0.005, acceptable: 0.02 };
t('relative: dead-on value is ideal + within spec', (() => {
  const o = outcomeBand(100, 100, rel);
  return o.band === 'ideal' && o.withinSpec === true && o.direction === 'on' && o.error === 0;
})());
t('relative: acceptable boundary is inclusive', (() => {
  const o = outcomeBand(102, 100, rel); // relError exactly 0.02
  return o.band === 'acceptable' && o.withinSpec === true && o.direction === 'on';
})());
t('relative: just past acceptable reads high + out of spec', (() => {
  const o = outcomeBand(102.5, 100, rel); // relError 0.025
  return o.band === 'high' && o.withinSpec === false && o.direction === 'high';
})());
t('relative: low miss reads low', (() => {
  const o = outcomeBand(90, 100, rel);
  return o.band === 'low' && o.direction === 'low' && o.error < 0 && approx(o.relError, 0.1);
})());
t('absolute: small abs error is acceptable', (() => {
  const o = outcomeBand(51, 50, { mode: 'absolute', ideal: 0.5, acceptable: 2 });
  return o.band === 'acceptable' && o.withinSpec === true && approx(o.absError, 1);
})());
t('absolute: large abs error reads high', (() => {
  const o = outcomeBand(53, 50, { mode: 'absolute', ideal: 0.5, acceptable: 2 });
  return o.band === 'high' && o.withinSpec === false;
})());
t('relative mode with zero target throws', (() => {
  try { outcomeBand(1, 0, rel); return false; } catch { return true; }
})());
t('acceptable below ideal (bad ordering) throws', (() => {
  try { outcomeBand(1, 1, { mode: 'absolute', ideal: 2, acceptable: 1 }); return false; } catch { return true; }
})());
t('non-finite value throws', (() => {
  try { outcomeBand(NaN, 100, rel); return false; } catch { return true; }
})());
t('negative threshold throws', (() => {
  try { outcomeBand(1, 1, { mode: 'absolute', ideal: -1, acceptable: 1 }); return false; } catch { return true; }
})());

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
