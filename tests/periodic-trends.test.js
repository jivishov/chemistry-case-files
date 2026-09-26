// tests/periodic-trends.test.js — gate for the Unit 3 C.5(C) comparison bench.
// Run: node tests/periodic-trends.test.js
//
// The bench asks a learner to read two candidate parts off the element data and then choose
// which part goes in. Both halves shipped correct and the bench was still incoherent: the
// PAIR was drawn from the whole periodic table while the two ACTIONS were fixed strings per
// scenario, so a reading of aluminium (1.61 Pauling) against chlorine (3.16) could be
// followed by "Fit the lithium cell" / "Offer a sodium cell instead". Nothing caught it.
// npm test never looked at SCENARIO_TASKS, and the layout audit measures scroll, clipping,
// occlusion and font size, not whether the question and the call are about the same objects.
//
// The fix designs the bug out rather than guarding against it: the pair is now built FROM
// the two symbols the actions name, so a pair over other elements is unconstructible. That
// makes the obvious assertion ("the pair matches the actions") unfalsifiable, and an
// assertion that cannot fail is worse than none. So this suite tests the two things that
// CAN still drift:
//
//   1. THE WIRING. newC() is driven for real, through createSim(), and the pair it lands on
//      has to come from the scenario it landed on. This is the assertion that would have
//      failed on the code that shipped, and it fails again the moment anything repoints
//      newC() at a pool that is not the scenario's own.
//   2. THE THREE CONSTRAINTS, at the three benches where each one actually bites. Every one
//      is asserted as an absence plus the positive fact that makes the absence meaningful,
//      so a constraint quietly loosened (a lowered gap floor, a dropped anomaly check) fails
//      here rather than reaching a class.
import { createSim, SCENARIO_PAIRS } from '../units/03-periodic-trends/js/main.js';
import {
  SCENARIOS, SCENARIO_TASKS, ELEMENT_DATA, TREND_PROPS
} from '../units/03-periodic-trends/js/model.js';
import { ELEMENTS, ATOMIC_MASS, ELECTRONEGATIVITY, period } from '../shared/js/chem.js';

let pass = 0, fail = 0;
const t = (name, cond) => { cond ? pass++ : (fail++, console.log('FAIL:', name)); };

// The values the bench prints, rebuilt from the same two sources main.js merges. A second
// implementation on purpose: a test that read main.js's own merged table could not tell a
// wrong number from a wrongly-merged one. Group comes from ELEMENT_DATA, period from the
// atomic number, because ELEMENT_DATA carries the column but not the row.
const VAL = Object.fromEntries(ELEMENT_DATA.map(d => [d.sym, {
  radius: d.radius, ie1: d.ie1, mass: ATOMIC_MASS[d.sym],
  en: ELECTRONEGATIVITY[d.sym] ?? null,
  group: d.group, period: period(ELEMENTS.find(e => e.sym === d.sym).z)
}]));
const GAP_MIN = { radius: 25, ie1: 150, en: 0.5, mass: 8 };
const PROP = Object.fromEntries(TREND_PROPS.map(p => [p.key, p]));
const NAME = Object.fromEntries(ELEMENTS.map(e => [e.sym, e.name.toLowerCase()]));
// chem.js spells element 13 the American way; the repair bench writes British English
// throughout ("aluminium case"). Listed rather than fuzzy-matched so a genuine mismatch
// between an action key and its element still fails.
const ALT_NAME = { Al: ['aluminium'] };

const PAIR_IDS = Object.entries(SCENARIO_TASKS)
  .filter(([, task]) => task.pool === 'pair')
  .map(([id]) => id);

// A discovery bug that found nothing would otherwise report a clean run over zero benches.
t(`found pool:'pair' scenarios (${PAIR_IDS.length})`, PAIR_IDS.length === 3);
t(`a pool for every pool:'pair' scenario`, PAIR_IDS.every(id => Array.isArray(SCENARIO_PAIRS[id])));
t('no pool without a scenario', Object.keys(SCENARIO_PAIRS).every(id => PAIR_IDS.includes(id)));

// ======================= 1. the wiring, driven for real =======================
// newC() cycles the three C.5(C) scenarios and picks a comparison at random within each, so
// the lap count is set by the randomness rather than by the cycle. Twenty laps per scenario
// makes a wrong pool essentially certain to be caught (drawing from the four comparisons
// across all three scenarios instead of this scenario's own would have to come up right
// twenty times running) and makes the coverage assertion below reliable to about 1e-6. A
// correct implementation cannot fail either one at any lap count.
const LAPS_PER_SCENARIO = 20;
const sim = createSim();
const seen = new Set(), picked = new Set();
// One bucket per invariant, holding the laps that broke it, so sixty laps report as seven
// assertions naming the offending lap rather than as four hundred lines of noise.
const broke = {
  scenario: [], ownPool: [], twoParts: [], selected: [], rendered: [], cites: [], values: []
};
for (let lap = 0; lap < LAPS_PER_SCENARIO * PAIR_IDS.length; lap++) {
  sim.newC();
  const id = sim.cSc?.id, pair = sim.cPair, task = SCENARIO_TASKS[id];
  seen.add(id);

  if (!PAIR_IDS.includes(id)) { broke.scenario.push(`${lap}:${id}`); continue; }
  picked.add(`${id}/${pair.property}`);
  const syms = task.actions.map(a => a.sym);
  const where = `${lap}:${id}`;

  // THE assertion. The pair on the bench has to be one this scenario offers -- identity,
  // not shape, so a pair that merely looks plausible does not pass.
  if (!SCENARIO_PAIRS[id].includes(pair)) broke.ownPool.push(`${where}=${pair.a}/${pair.b}`);

  // And the two parts have to be the two parts the actions name. This is the sentence the
  // bug broke, checked where the learner meets it rather than where it is built.
  if (!([pair.a, pair.b].every(s => syms.includes(s)) && pair.a !== pair.b)) {
    broke.twoParts.push(`${where}=${pair.a}/${pair.b} offered ${syms.join('/')}`);
  }

  // The heatmap selects the board cell this call confirms; it must be one of the two parts
  // on the bench, or the learner is shown an element the question never mentioned.
  if (!syms.includes(sim.selectedSym)) broke.selected.push(`${where}=${sim.selectedSym}`);

  // The rendered strings, because a missing pairNote or trendLead prints blank or
  // "undefined" rather than throwing, and no other gate reads them.
  const rendered = [sim.cAsk, sim.cExplain, sim.cPairValue(pair.a), sim.cPairValue(pair.b), pair.pairNote];
  if (!rendered.every(str => typeof str === 'string' && str.length > 0 && !str.includes('undefined'))) {
    broke.rendered.push(where);
  }
  // cExplain has to cite the two parts it is explaining, and cPairValue has to find data.
  if (!(sim.cExplain.includes(pair.a) && sim.cExplain.includes(pair.b))) broke.cites.push(where);
  if ([sim.cPairValue(pair.a), sim.cPairValue(pair.b)].includes('n/a')) broke.values.push(where);
}
// Sixty laps can break the same invariant sixty times; the first few name the pattern and
// the count says how wide it is, which is more use than the full list.
const clean = (name, key) => {
  const hits = broke[key];
  const shown = hits.slice(0, 5).join(', ') + (hits.length > 5 ? `, ... (${hits.length} laps)` : '');
  t(`${name}${hits.length ? ' -> ' + shown : ''}`, hits.length === 0);
};
clean('every lap lands on a pool:\'pair\' scenario', 'scenario');
clean('every pair comes from the scenario it is shown under', 'ownPool');
clean('the two parts read are always the two parts offered', 'twoParts');
clean('the selected element is always one of the two parts', 'selected');
clean('nothing ever renders as blank or undefined', 'rendered');
clean('the explanation always cites both parts', 'cites');
clean('both values always read off the table', 'values');

t('newC() cycles through all three scenarios', seen.size === PAIR_IDS.length);
// Every comparison the pools offer has to be reachable: a pick() that never left index 0
// would hide c-connector's second property and quietly make the bench a single question.
const offered = PAIR_IDS.flatMap(id => SCENARIO_PAIRS[id].map(c => `${id}/${c.property}`));
const unreached = offered.filter(k => !picked.has(k));
t(`every offered comparison is reachable${unreached.length ? ' -> never picked: ' + unreached.join(', ') : ''}`,
  unreached.length === 0);

// ======================= 2. the pools, per scenario =======================
for (const id of PAIR_IDS) {
  const task = SCENARIO_TASKS[id];
  const scenario = SCENARIOS.find(s => s.id === id);
  const pool = SCENARIO_PAIRS[id] ?? [];
  const syms = task.actions.map(a => a.sym);

  t(`${id}: exactly two actions`, task.actions.length === 2);
  t(`${id}: both actions name an element in ELEMENT_DATA`,
    syms.every(sym => sym && ELEMENT_DATA.some(e => e.sym === sym)));
  t(`${id}: the two parts are different elements`, syms[0] !== syms[1]);
  t(`${id}: actionTrue is one of the action keys`, task.actions.some(a => a.k === task.actionTrue));

  // `ask` and `answer` come from the generated property, so they must NOT be written out
  // here: a stale literal would silently outrank the generated one.
  t(`${id}: no hardcoded ask`, task.ask === null);
  t(`${id}: no hardcoded answer`, task.answer === undefined);

  // A bench with no comparison has nothing to read. main.js throws on this at load, so
  // getting here proves it; assert it anyway so the reason is named on failure.
  t(`${id}: at least one property decides between the two parts`, pool.length > 0);

  t(`${id}: the board cell (${scenario.cell}) is one of the two parts`, syms.includes(scenario.cell));

  for (const c of pool) {
    const p = PROP[c.property], tag = `${id}/${c.property}`;
    t(`${tag}: names a real trend property`, !!p);
    if (!p) continue;

    const va = VAL[c.a][c.property], vb = VAL[c.b][c.property];
    t(`${tag}: both values present`, va != null && vb != null);
    t(`${tag}: answer is one of the two parts`, c.answer === c.a || c.answer === c.b);

    // Constraint 2, re-derived: a gap under the floor is a coin flip off the chart.
    t(`${tag}: gap ${Math.abs(va - vb).toFixed(2)} clears the ${GAP_MIN[c.property]} floor`,
      Math.abs(va - vb) >= GAP_MIN[c.property]);

    // cAsk always phrases it as "which of these two has the larger/higher X", so the answer
    // has to be the part that actually wins on this property.
    const winner = va > vb ? c.a : c.b;
    t(`${tag}: answer ${c.answer} is the part with the higher ${c.property} (${winner})`, c.answer === winner);

    // Constraint 3, re-derived. `a` is the earlier element along the trend, so the data has
    // to move from a to b the way `moves` says -- otherwise cExplain contradicts the two
    // values printed on the buttons right above it.
    t(`${tag}: moves is a direction`, /^(generally )?(increases|decreases)$/.test(c.moves));
    t(`${tag}: data runs ${c.moves} from ${c.a} to ${c.b}`, (vb > va) === c.moves.includes('increases'));

    // The axis has to match the note. Same period or same group is stated as such; a pair
    // sharing neither is readable only in atomic-number order, and only for a property that
    // moves the same way across a period as it does down a group.
    const sameRow = VAL[c.a].period === VAL[c.b].period, sameCol = VAL[c.a].group === VAL[c.b].group;
    const expected = sameRow ? 'same period' : sameCol ? 'same group' : 'by atomic number';
    t(`${tag}: pairNote "${c.pairNote}" matches the axis (${expected})`, c.pairNote === expected);
    if (!sameRow && !sameCol) {
      t(`${tag}: an off-axis pair is read only on a property that moves one way (${p.across}/${p.down})`,
        p.across === p.down);
    }
  }
}

// ======================= 3. action keys against their elements =======================
// The key is what `consequences` is looked up by at commit time, and the `sym` is what the
// bench now reads. If the two disagree the learner is told the outcome for a different part
// than the one they compared -- the same class of bug one level down, and the check that
// catches an action repointed at the wrong element.
for (const [id, task] of Object.entries(SCENARIO_TASKS)) {
  const scenario = SCENARIOS.find(s => s.id === id);
  for (const a of task.actions) {
    // Every action's outcome has to be written, or the verdict detail prints "undefined".
    t(`${id}/${a.k}: has a consequence`, typeof scenario.consequences[a.k] === 'string');
    if (!a.sym) continue;
    const names = [NAME[a.sym], ...(ALT_NAME[a.sym] ?? [])];
    t(`${id}/${a.k}: the key names its element (${a.sym} is ${NAME[a.sym]})`, names.includes(a.k));
  }
}

// ============ 4. the three constraints, named where each one actually bites ============
const has = (id, key) => (SCENARIO_PAIRS[id] ?? []).some(c => c.property === key);

// Constraint 2 at c-cell: lithium 167 pm against sodium 190 is a 23 pm gap, under the 25 pm
// floor, so radius is not a readable comparison here even though the trend is right. Mass is
// the only property left, and it is the one the scenario's own argument turns on.
t('c-cell: radius is dropped for a 23 pm gap under the 25 pm floor',
  !has('c-cell', 'radius') && Math.abs(VAL.Li.radius - VAL.Na.radius) < GAP_MIN.radius);
t('c-cell: mass survives', has('c-cell', 'mass'));

// Constraint 3 at c-connector: gold's electronegativity (2.54) is HIGHER than copper's
// (1.90) despite sitting lower in group 11, which runs backwards to the group trend. The gap
// clears the floor, so only constraint 3 can reject it -- and it must, or the bench would
// grade an anomaly against an explanation that denies it.
t('c-connector: electronegativity is dropped as an anomaly, not for a small gap',
  !has('c-connector', 'en')
  && Math.abs(VAL.Au.en - VAL.Cu.en) >= GAP_MIN.en
  && VAL.Au.en > VAL.Cu.en && PROP.en.down.includes('decreases'));
t('c-connector: radius and mass both survive', has('c-connector', 'radius') && has('c-connector', 'mass'));

// Constraint 1 at c-case: aluminium (period 3, group 13) and iron (period 4, group 8) share
// no row and no column. Radius clears its floor by 13 pm and is still rejected, because
// radius falls across a period and rises down a group and there is no single trend to read.
// Mass rises both ways, so atomic-number order is a real reading, and it is the one kept.
t('c-case: aluminium and iron share neither row nor column',
  VAL.Al.period !== VAL.Fe.period && VAL.Al.group !== VAL.Fe.group);
t('c-case: radius is dropped for having no single trend, not for a small gap',
  !has('c-case', 'radius')
  && Math.abs(VAL.Al.radius - VAL.Fe.radius) >= GAP_MIN.radius
  && PROP.radius.across !== PROP.radius.down);
t('c-case: ionization energy is dropped the same way',
  !has('c-case', 'ie1')
  && Math.abs(VAL.Al.ie1 - VAL.Fe.ie1) >= GAP_MIN.ie1
  && PROP.ie1.across !== PROP.ie1.down);
t('c-case: mass survives on atomic-number order',
  has('c-case', 'mass') && PROP.mass.across === PROP.mass.down);

console.log(`periodic-trends: ${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
