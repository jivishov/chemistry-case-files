// tests/scenario-coherence.test.mjs — gate for the CONTENT-COHERENCE-AUDIT findings.
// Run: node tests/scenario-coherence.test.mjs
//
// The audit's mechanical pass (key sets, banner coverage) came back clean, and art.test.js
// and casefile.test.js already hold that ground. Every one of its 27 findings was SEMANTIC:
// authored narrative asserting a fact the runtime draw does not guarantee. That class of bug
// is invisible to a shape check, which is why it survived every existing gate.
//
// This suite closes the half of it that IS mechanical. It drives the real generators through
// tests/helpers/headless-sim.mjs and asserts, per finding, the invariant the fix installed:
// a pinned pool is honoured, a required bottle is always dealt, a banner names the outcome
// its own consequence describes, an honors bench reads the call it claims to read. Where a
// fix was pure prose (a wrong number, a contradicted mechanism) it asserts the corrected
// text is present and the wrong one is gone, because that is what can silently come back.
//
// All eleven units are driven here. Units 04 and 07 used to be data-only, because their
// main.js reaches ./vsepr.js and ./gasbox.js and those `import * as THREE from 'three'` --
// a bare specifier the page supplies through an importmap and bare node cannot resolve.
// helpers/three-resolve.mjs maps it to a stub whose every class throws if constructed, which
// is enough: nothing in those modules touches THREE at module scope, and the viewer takes its
// `if (!el) return` branch without $refs. So their generators run for real now, and the
// model.js text assertions below are joined by live ones rather than standing in for them.
import { register } from 'node:module';
register('./helpers/three-resolve.mjs', import.meta.url);
import { loadSim, makeSim, seedRandom } from './helpers/headless-sim.mjs';
import { readFileSync, readdirSync, existsSync } from 'node:fs';

let pass = 0, fail = 0;
const t = (name, cond) => { cond ? pass++ : (fail++, console.log('FAIL:', name)); };
const ROUNDS = 400;

// A file's text, for the prose findings. Read rather than imported so a claim about the
// SOURCE (a comment, a pinned constraint) is checkable as well as a claim about the data.
const src = rel => readFileSync(new URL(`../${rel}`, import.meta.url), 'utf8');
const both = slug => ['units'].map(tree => `${tree}/${slug}`).filter(f => existsSync(new URL(`../${f}`, import.meta.url)));

// Drive a unit for ROUNDS draws, calling `step` after each regeneration. Seeded, so a
// failure names a seed that reproduces it.
async function drive(unit, patch, step, seed = 1234) {
  const { createSim } = await loadSim(unit);
  const restore = seedRandom(seed);
  try {
    const s = makeSim(createSim, patch);
    for (let i = 0; i < ROUNDS; i++) step(s, i);
    return s;
  } finally { restore(); }
}

// ===================================================================================
// Every generator in every drivable unit survives repeated regeneration. This is the
// backstop for the pool narrowing the fixes introduced: a constraint that leaves a
// generator with nothing to draw now throws by design, and this is what would catch it.
// ===================================================================================
const UNITS = readdirSync(new URL('../units', import.meta.url), { withFileTypes: true })
  .filter(d => /^\d\d-/.test(d.name) && d.isDirectory() && existsSync(new URL(`../units/${d.name}/js/main.js`, import.meta.url)))
  .map(d => d.name).sort();
t(`found units builds with a view-model (${UNITS.length})`, UNITS.length === 11);

for (const unit of UNITS) {
  const { createSim } = await loadSim(unit);
  const restore = seedRandom(99);
  let errs = [];
  try {
    const s = makeSim(createSim, { honors: true });
    // Descriptors, not property reads: touching a getter here would evaluate it against
    // half-built state and report the harness's own bug as the unit's.
    const gens = Object.entries(Object.getOwnPropertyDescriptors(s))
      .filter(([k, d]) => typeof d.value === 'function' && /^(gen|next|new|deal|df)[A-Z]/.test(k) && k !== 'nextScenario')
      .map(([k]) => k);
    t(`${unit}: exposes regenerating benches (${gens.length})`, gens.length > 0);
    for (let i = 0; i < 80; i++) for (const g of gens) {
      try { s[g](); } catch (e) { errs.push(`${g}: ${e.message}`); }
    }
  } catch (e) { errs.push(`init: ${e.message}`); }
  restore();
  t(`${unit}: 80 rounds of every bench throw nothing`, errs.length === 0);
  [...new Set(errs)].slice(0, 4).forEach(e => console.log('      ' + e));
}

// ===================================================================================
// CC-08, CC-10 — Unit 1. A brief that names a quantity or a metal gets that draw.
// ===================================================================================
{
  // Union of everything each scenario ever drew. Asserting on the union rather than
  // per-round is the stronger form here: "this set is exactly {pH}" proves nothing else can
  // ever appear, and it does not depend on how the constraint happens to be spelled.
  const seen = {};
  await drive('01-practices-matter', { honors: true }, sim => {
    (seen[sim.evSc.id] ||= new Set()).add(sim.evScenario.key);
    (seen[sim.dSc.id] ||= new Set()).add(sim.dSub.name);
    sim.newDataset(); sim.newSample();
  });
  // t2 collapses per-round assertions into one line, or 400 rounds would print 400 passes.
  t('CC-08: d-penmeter never deals a one-decimal quantity', [...(seen['d-penmeter'] || [])].join() === 'pH');
  t('CC-08: d-dropkit and d-strips still range over all three quantities',
    (seen['d-dropkit'] || new Set()).size === 3 && (seen['d-strips'] || new Set()).size === 3);
  t('CC-10: c-pendant stays inside plated-jewellery metals',
    [...(seen['c-pendant'] || [])].every(n => ['Silver', 'Zinc', 'Copper', 'Aluminum', 'Lead'].includes(n)));
  t('CC-10: c-anchor stays inside plant-weight metals',
    [...(seen['c-anchor'] || [])].every(n => ['Lead', 'Zinc', 'Iron'].includes(n)));
  t('CC-10: c-anchor can still draw the lead its `why` names', (seen['c-anchor'] || new Set()).has('Lead'));
  t('CC-10: c-ornament is still the whole bank', (seen['c-ornament'] || new Set()).size >= 7);
  t('CC-10: both pinned scenarios keep a toxic and a safe draw',
    ['c-pendant', 'c-anchor'].every(id => {
      const TOX = ['Zinc', 'Copper', 'Lead'];
      const got = [...(seen[id] || [])];
      return got.some(n => TOX.includes(n)) && got.some(n => !TOX.includes(n));
    }));
}

// ===================================================================================
// CC-18, CC-19 — Unit 2. Two live orders on one bench, each satisfiable, each revealing
// only its own grid.
// ===================================================================================
{
  const OFFERED = ['Noble gas (Group 18)', 'Boron group (Group 13)', 'Halogen (Group 17)', 'Transition metal'];
  const { createSim } = await loadSim('02-atomic-structure');
  const restore = seedRandom(5);
  const s = makeSim(createSim, { honors: true });
  s.mode = 'config';
  t('CC-19: the configuration order is satisfied by its own tool', s.cfgZ === s.configSc.z);
  t('CC-19: the family order carries its own element', s.famZ === s.familySc.z);
  t('CC-19: the two orders want different elements and both hold', s.cfgZ !== s.famZ);

  const grid = () => OFFERED.map(m => s.familyState(m)).join('|');
  const h2 = () => ['exception', 'standard'].map(v => s.h2State(v)).join('|');
  const g0 = grid(), h0 = h2();
  s.commitConfig();
  t('CC-19: certifying the configuration does not reveal the family grid', grid() === g0);
  t('CC-19: certifying the configuration does not reveal the orbital call', h2() === h0);
  s.h2Pick = s.cfgIsException ? 'exception' : 'standard';
  s.commitH2();
  t('CC-19: certifying the orbital call does not reveal the family grid', grid() === g0);

  let offOk = true, moved = false, graded = true;
  for (let i = 0; i < 30; i++) {
    s.nextFamily();
    if (!OFFERED.includes(s.familySc.correct)) offOk = false;
    if (s.famZ !== s.familySc.z) offOk = false;
    const before = s.cfgZ;
    s.familyPick = s.familySc.correct;
    s.commitFamily();
    if (s.famVerdict.tone !== 'success') graded = false;
    if (s.cfgZ !== before) moved = true;
  }
  restore();
  t('CC-19: every family order has its answer on the offered grid', offOk);
  t('CC-19: a correct family call always grades correct', graded);
  t('CC-19: running the family order never moves the configuration tool', !moved);

  const m2 = src('units/02-atomic-structure/js/model.js');
  t('CC-18: a-tube is a gas discharge tube, not a test tube',
    m2.includes('A gas discharge tube shows separate bright lines') && !m2.includes('A test tube glows'));
}

// ===================================================================================
// CC-01, CC-02, CC-13, CC-14, CC-17 — Unit 6.
// ===================================================================================
{
  let h1Ok = true, h2Ok = true, sigOk = true, prodOk = true;
  await drive('06-reactions-stoichiometry', { honors: true }, sim => {
    if (sim.h1s.rxn !== sim.st.rxn) h1Ok = false;
    if (!sim.st.rxn.products.includes(sim.h1s.species)) prodOk = false;
    if (String(sim.h1s.grams) !== String(Number(sim.h1s.grams.toPrecision(3)))) sigOk = false;
    if (sim.h2s.rxn !== sim.lm.rxn) h2Ok = false;
    if (JSON.stringify(sim.h2s.amounts) !== JSON.stringify(sim.lm.amounts)) h2Ok = false;
    if (sim.h2s.target !== sim.lm.excess.gramsLeft) h2Ok = false;
    sim.stNext(); sim.lmNext();
  });
  t('CC-01: the honors particle count files the stoich bench\'s own reaction', h1Ok);
  t('CC-01: it always files a PRODUCT of that reaction, never a reactant', prodOk);
  t('CC-01: the sample mass on screen is the mass the count is graded from', sigOk);
  t('CC-02: the honors recovery reads the limiting-reactant bench\'s own call', h2Ok);

  const m6 = src('units/06-reactions-stoichiometry/js/model.js');
  t('CC-13: d-shack no longer calls a pinned methane charge propane',
    !m6.includes('A propane heater has been running') && m6.includes('constraints: { reaction: \'methane\' }'));
  for (const f of both('06-reactions-stoichiometry/js/model.js')) {
    const x = src(f);
    t(`CC-14 (${f}): the ditch reagent is the caustic soda the equation uses`,
      x.includes('Hydrochloric acid reacts with sodium hydroxide') && !x.includes('soda ash'));
    t(`CC-14 (${f}): the neutralisation's finished-signal is not a fizz`,
      !x.includes('stopped fizzing') && x.includes('form sodium chloride and water'));
  }
  // Review found the earlier exact 35 ms narrative unsupported; test the active case's limits.
  const { CASE: airbag } = await import('../units/06-reactions-stoichiometry/js/case.js');
  t('CC-17: the active airbag case does not claim one universal deployment time',
    airbag.stats.some(s => /timing varies/.test(s.k)) && !/\d+ milliseconds/.test(airbag.hook));
  t('CC-17: the example gas volume names its temperature and pressure',
    airbag.stats.some(s => s.v === '67.2 L' && /0 °C and 1 atm/.test(s.k)));
  const a6 = src('units/06-reactions-stoichiometry/js/art.js');
  t('CC-14: the drawn bags are stencilled with the reagent in the equation',
    a6.includes("label: 'NaOH'") && !a6.includes("label: 'CO3'"));
}

// ===================================================================================
// CC-26 — Units 4 and 7, driven. Every one of these is the class §4 of the refinement
// handoff names: authored narrative asserting what the runtime draw does not guarantee.
// Unit 3's trends bench asked for an Al-against-Cl reading and offered "Fit the lithium
// cell"; these are the same question asked of the two units that were data-only until the
// three-stub let them run.
// ===================================================================================
{
  let nameOne = true, nameIsQ = true, bondOffered = true, bondDEN = true;
  let geoOffered = true, imfOffered = true, piDEN = true, fxOffered = true;
  const s4 = await drive('04-bonding-geometry', { honors: true }, sim => {
    const right = sim.nameOptions.filter(o => o.correct);
    if (right.length !== 1) nameOne = false;
    else if (right[0].formula !== sim.nameQ.formula || right[0].name !== sim.nameQ.name) nameIsQ = false;

    if (!sim.BOND_OPTIONS.some(o => o.key === sim.bondResult.type)) bondOffered = false;
    const gap = Math.abs(sim.en(sim.bondA) - sim.en(sim.bondB));
    if (Math.abs(gap - sim.bondResult.dEN) > 0.011) bondDEN = false;

    if (!sim.GEOMETRIES.includes(sim.gm.mol.geometry)) geoOffered = false;
    if (!sim.IMF_TYPES.includes(sim.imfEx.imf)) imfOffered = false;
    if (!sim.SUBSTANCE_TYPES.some(x => x.type === sim.fx.truth.type)) fxOffered = false;

    const piGap = Math.abs(sim.en(sim.pi.pair.a) - sim.en(sim.pi.pair.b));
    if (Math.abs(piGap - sim.pi.dEN) > 0.011) piDEN = false;

    sim.genBond(); sim.genName(); sim.genGeometry(); sim.genForces();
    sim.genPercent(); sim.genImf();
  });
  t('CC-26: the naming quiz offers exactly one right answer', nameOne);
  t('CC-26: that answer is the compound the bench asked about', nameIsQ);
  t('CC-26: the bond type the commit grades is on the offered grid', bondOffered);
  t('CC-26: the dEN the bench grades is the gap between the two elements it drew', bondDEN);
  t('CC-26: the geometry drawn is one the learner can pick', geoOffered);
  t('CC-26: the intermolecular force drawn is one the learner can pick', imfOffered);
  t('CC-26: the solid type drawn is one the learner can pick', fxOffered);
  t('CC-26: the Honors percent-ionic gap is the gap between its own named pair', piDEN);
  t('CC-26: Unit 4 survives being driven at all (was data-only)', !!s4.gm);
}

{
  let postOffered = true, everyConsequence = true, igStates = true, dlLimit = true, dlInMix = true;
  const s7 = await drive('07-gas-laws', { honors: true }, sim => {
    const ids = sim.KMT_POSTULATES.map(p => p.id);
    if (!ids.includes(sim.kq.item.answer)) postOffered = false;
    // Whichever of the five the learner picks, the bench has to have something to say back.
    if (!ids.every(id => sim.kq.item.consequences[id])) everyConsequence = false;

    // The scenario states three of P, V, n, T and asks for the fourth (main.js says so in a
    // comment). So the value it grades has to BE the stated value of what it asks for.
    if (sim.ig.target !== sim.ig.given[sim.ig.solveFor]) igStates = false;

    if (sim.dl.overLimit !== (sim.dl.target > sim.PPO2_LIMIT)) dlLimit = false;
    if (!sim.dGases.some(g => g.formula === sim.dl.find.formula)) dlInMix = false;

    sim.genKmt(); sim.genIdeal(); sim.genDalton();
  });
  t('CC-26: the postulate the KMT bench grades is one of the five it lists', postOffered);
  t('CC-26: every postulate a learner can pick has a consequence written for it', everyConsequence);
  t('CC-26: the ideal-gas target is the stated value of the quantity being solved for', igStates);
  t('CC-26: the over-limit flag agrees with the partial pressure it was computed from', dlLimit);
  t('CC-26: the gas whose partial pressure is asked for is in the mix on screen', dlInMix);
  t('CC-26: Unit 7 survives being driven at all (was data-only)', !!s7.kq);
}

// ===================================================================================
// CC-07, CC-23 — Unit 7, model.js text. These pin wording, so they read the source.
// ===================================================================================
{
  const m7 = src('units/07-gas-laws/js/model.js');
  t('CC-07: c-ppo2 states the mix dependence rather than one drawn mix',
    m7.includes('Recheck the oxygen fraction and absolute pressure'));
  t('CC-07: neither miss consequence asserts which side of the limit the draw fell on',
    !m7.includes('a depth that is actually past the limit looks fine on paper')
    && !m7.includes('cut the dive to a depth the mix could have taken easily'));
  t('CC-23: the narrative no longer prices cylinders in bar while solving in atm',
    !/\bbars?\b/.test(m7) && m7.includes('Check the algebra and the gas-constant units'));
  t('CC-23: the twin-set fill is an atm range, not the bar badge number',
    m7.includes("P: [180, 230]") && !m7.includes("P: [180, 232]"));
  const a7 = src('units/07-gas-laws/js/art.js');
  t('CC-23: every drawn gauge face reads in the unit the bench computes in',
    !a7.includes("unit: 'bar'") && a7.includes("unit: 'atm'"));
}

// ===================================================================================
// CC-03, CC-11, CC-25 — Unit 8.
// ===================================================================================
{
  const temps = {};
  await drive('08-solutions', { honors: true }, sim => {
    (temps[sim.cu.sc.id] ||= new Set()).add(sim.cu.t);
    sim.genCurve();
  });
  t('CC-03: c-basin reads the coldest cells on the chart',
    [...(temps['c-basin'] || [])].every(x => x <= 20) && (temps['c-basin'] || new Set()).size >= 2);
  t('CC-03: c-tea is still the cold glass', [...(temps['c-tea'] || [])].every(x => x <= 30));
  t('CC-03: c-rate keeps its mid-range temperatures',
    [...(temps['c-rate'] || [])].every(x => x >= 40));
  for (const f of both('08-solutions/js/model.js')) {
    const x = src(f);
    t(`CC-25 (${f}): every curve goal asks for the rate call the commit grades`,
      (x.match(/(?:affects its dissolving rate|makes the solid dissolve faster or slower)/g) || []).length === 3);
    t(`CC-11 (${f}): the sugar line no longer implies sugar is on the chart`,
      x.includes('For the solids plotted here') && !/sugar.*(?:on|from) (?:this|the) chart/i.test(x));
  }
}

// ===================================================================================
// CC-04, CC-05, CC-06, CC-15, CC-16, CC-24 — Unit 9.
// ===================================================================================
{
  const shelf = {}, pairs = new Set(), cards = {};
  // Rounds per shelf, and rounds in which each formula appeared. A union-of-draws check
  // would only prove a bottle is REACHABLE; the briefs promise it is always there, so the
  // required ones have to appear in every single round. Counted independently of the
  // scenario's own `must` list, or deleting that list would make the check vacuous.
  const rounds = {}, appears = {};
  let poolOk = true, unityOk = true, fourOk = true;
  await drive('09-acids-bases', { honors: true }, sim => {
    const sc = sim.st.sc, k = sc.constraints, fs = sim.st.bottles.map(b => b.f);
    if (fs.length !== 4 || new Set(fs).size !== 4) fourOk = false;
    rounds[sc.id] = (rounds[sc.id] || 0) + 1;
    (appears[sc.id] ||= {});
    for (const f of fs) appears[sc.id][f] = (appears[sc.id][f] || 0) + 1;
    for (const b of sim.st.bottles) {
      if (b.strong && k.strong && !k.strong.includes(b.f)) poolOk = false;
      if (!b.strong && k.weak && !k.weak.includes(b.f)) poolOk = false;
    }
    (shelf[sc.id] ||= new Set()); fs.forEach(f => shelf[sc.id].add(f));
    const nu = sim.nu;
    if (nu.sc.constraints.nonUnity && nu.coefAcid === 1 && nu.coefBase === 1) unityOk = false;
    pairs.add(`${nu.sc.id} ${nu.acid.anionName}`);
    (cards[sim.df.sc.id] ||= new Set()).add(sim.df.qB.answer);
    sim.genStrength(); sim.genNeutralize(); sim.dfDeal();
  });
  t('CC-05/CC-06: every shelf is still four distinct bottles', fourOk);
  t('CC-05/CC-06: no bottle is ever drawn from outside its scenario\'s pool', poolOk);
  // Every round, not merely somewhere in the run: the briefs name these bottles out loud.
  const always = (id, f) => rounds[id] > 20 && appears[id] && appears[id][f] === rounds[id];
  t('CC-05: c-cart deals the ammonia its brief blames for the cough in EVERY round',
    always('c-cart', 'NH3'));
  t('CC-05: c-cart deals the lye its `why` is built on in EVERY round',
    always('c-cart', 'NaOH'));
  t('CC-06: c-sink deals the kitchen vinegar in EVERY round', always('c-sink', 'CH3COOH'));
  t('CC-06: c-sink deals the pool acid in EVERY round', always('c-sink', 'HCl'));
  t('CC-06: c-sink can no longer reach hydrocyanic or perchloric acid',
    !(shelf['c-sink'] || new Set()).has('HCN') && !(shelf['c-sink'] || new Set()).has('HClO4'));
  t('CC-24: no corridor cart carries rubidium or caesium hydroxide',
    !(shelf['c-cart'] || new Set()).has('RbOH') && !(shelf['c-cart'] || new Set()).has('CsOH'));
  t('CC-15: d-decon never draws a one-to-one neutralisation', unityOk);
  t('CC-15: the salts d-decon can make are the ones saltWrong names',
    [...pairs].filter(p => p.startsWith('d-decon')).every(p => /sulfate|bromide|perchlorate/.test(p))
    && [...pairs].some(p => p === 'd-decon sulfate') && [...pairs].some(p => p === 'd-decon bromide'));
  t('CC-04: the definitions bench still exercises both sides of the pair',
    (cards['b-ammonia'] || new Set()).size === 2);
  for (const f of both('09-acids-bases/js/model.js')) {
    const x = src(f);
    t(`CC-04 (${f}): b-ammonia's brief no longer promises an ammonia card`,
      !x.includes('how the ammonia cleaner under their sink can be basic'));
    t(`CC-15 (${f}): saltWrong names a salt the pool can actually make`,
      x.includes('Recheck the cation and anion charges') && !x.includes('a sulfate and a chloride'));
  }
  for (const f of both('09-acids-bases/js/case.js')) {
    const { CASE: soda } = await import(`../${f}`);
    t(`CC-16 (${f}): the stats strip agrees with the four pH units on the page`,
      soda.stats.some(s => Number(s.v.replace(/[^0-9]/g,'')) === 10000) && !soda.stats.some(s => s.v === '~1000x'));
  }
}

// ===================================================================================
// CC-12 — Unit 10. Every calorimetry banner names the outcome beside it.
// ===================================================================================
{
  const { SCENARIOS } = await import('../units/10-thermochemistry/js/model.js');
  // Published feedback describes the calculated result, not an invented physical accident.
  const doses = SCENARIOS.filter(sc => sc.lowState && sc.highState);
  t('CC-12: all six banded calculations are covered', doses.length === 6);
  for (const sc of doses) {
    t('CC-12 '+sc.id+': low feedback agrees with its result label', /lower|below/i.test(sc.low) && /LOW|BELOW/.test(sc.lowState));
    t('CC-12 '+sc.id+': high feedback agrees with its result label', /higher|above/i.test(sc.high) && /HIGH|ABOVE/.test(sc.highState));
  }
}

// ===================================================================================
// CC-26 — Unit 11. CC-09 — Unit 5, in all five builds. CC-22 — molezoom. CC-20/21 — case 003.
// CC-27 — Unit 4 (data only: main.js needs `three`).
// ===================================================================================
{
  const { REASONS } = await import('../units/11-nuclear/js/model.js');
  const betaReason = REASONS.find(r => r.key === 'beta-local').label;
  t('CC-26: the active beta-range explanation does not invent biodistribution',
    !/where the isotope has collected/.test(betaReason));
  t('CC-26: beta range is energy dependent without a zero-exposure promise',
    /energy-dependent range/.test(betaReason) && !/none of it travels/.test(betaReason));

  const ORE = ['units/05-the-mole/js/model.js'];
  t(`CC-09: found every build that carries c-ore (${ORE.length})`,
    ORE.every(f => existsSync(new URL(`../${f}`, import.meta.url))));
  for (const f of ORE) {
    const x = src(f);
    t(`CC-09 (${f}): c-ore asks the label question its verdict actually grades`,
      x.includes('Calculate the theoretical percent iron and compare it with the report')
      && !x.includes('rich enough to smelt into a patch')
      && !x.includes('The ore is iron-rich')
      && !x.includes('You smelt poor ore'));
  }

  const mz = src('shared/js/molezoom.js');
  t('CC-22: the mole analogy no longer buries Texas a metre deep',
    !mz.includes('bury Texas') && mz.includes('about one-sixth of a mole') && mz.includes('6.022 × 10^23 particles'));

  const { CASE: battery } = await import('../units/03-periodic-trends/js/case.js');
  t('CC-21: the battery case does not assert an unsourced mass for every phone',
    battery.stats.every(s => !/ g$/.test(s.v)));
  t('CC-21: the battery case distinguishes the ionic and electronic paths',
    battery.stats.some(s => /ions inside; electrons through the circuit/.test(s.k)));
  const batteryText = battery.steps.map(s => s.body + ' ' + s.chem).join(' ');
  t('CC-20: gas-phase ionization alone does not predict cell voltage',
    /Gas-phase first ionization energy alone does not predict it/.test(batteryText));
  t('CC-20: an aqueous standard potential is not a lithium-ion operating voltage',
    /aqueous standard potentials are not the operating voltage/.test(batteryText));

  const { SUBSTANCE_TYPES } = await import('../units/04-bonding-geometry/js/model.js');
  t('CC-27: every substance class carries a heat-test result the capstone can print',
    SUBSTANCE_TYPES.every(s => typeof s.heat === 'string' && s.heat.length > 10));
  t('CC-27: the covalent-molecular result holds for something already liquid',
    !/melting point|melts at/i.test(SUBSTANCE_TYPES.find(s => s.type === 'Covalent molecular').heat));
  for (const f of both('04-bonding-geometry/js/model.js')) {
    t(`CC-27 (${f}): the capstone promises the test it actually runs`,
      src(f).includes('You have a heat test, a conductivity reading') ||
      src(f).includes('Use the supplied reference record, bonding evidence, and property data'));
  }
  for (const f of both('04-bonding-geometry/js/main.js')) {
    t(`CC-27 (${f}): the capstone reads the heat result through to the readout`,
      src(f).includes('heat: props.heat'));
  }
  for (const f of both('04-bonding-geometry/index.html')) {
    t(`CC-27 (${f}): the readout is labelled as the heat test`,
      src(f).includes('heat test') && !/>melting point</.test(src(f).split('cap.mp')[0].slice(-400)));
  }
}

console.log(`\nscenario-coherence: ${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
