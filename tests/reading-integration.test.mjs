import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import { UNITS } from '../shared/js/teks.js';

const root = new URL('../', import.meta.url);
const read = path => fs.readFile(new URL(path, root), 'utf8');

test('all reading and mission entry points use the same deployed course tree', async () => {
  assert.equal(UNITS.length, 11);
  assert.match(await read('index.html'), /units\/'\+u\.slug\+'\/learn\.html/);
  for (const unit of UNITS) {
    const prefix = `units/${unit.slug}/`;
    const lesson = await read(prefix + 'learn.html');
    const mission = await read(prefix + 'index.html');
    assert.ok(mission.includes('href="learn.html"'));
    assert.ok(lesson.includes('index.html?mission=casefile'));
    assert.ok(mission.includes('./js/main.js?v=lessons-20260926-1'));
    assert.ok(!mission.includes('units_new/'));
  }
});

test('requested mission links select existing controls after Alpine initializes', async () => {
  const source = await read('shared/lessons/mission-bridge.js');
  for (const requested of ['casefile', 'meter', 'capstone', 'unknown', '<script>']) {
    let initialized, selected = null;
    const buttons = ['casefile', 'meter', 'capstone'].map(mode => ({
      getAttribute: () => `setMode('${mode}')`,
      click: () => { selected = mode; }
    }));
    vm.runInNewContext(source, {
      URLSearchParams, queueMicrotask: fn => fn(),
      location: { search: '?mission=' + encodeURIComponent(requested) },
      document: {
        addEventListener: (event, fn) => { assert.equal(event, 'alpine:initialized'); initialized = fn; },
        querySelectorAll: () => buttons
      }
    });
    assert.equal(selected, null, 'do not race initialization');
    initialized();
    assert.equal(selected, ['casefile', 'meter', 'capstone'].includes(requested) ? requested : null);
  }
});

test('the actual nuclear entry imports share refinements without replacing the reviewed case', async () => {
  const directory = new URL('units/11-nuclear/', root);
  const html = await read('units/11-nuclear/index.html');
  const entry = name => html.match(new RegExp("import\\('([^']*/" + name + "\\.js[^']*)'\\)"))[1];
  const mainURL = new URL(entry('main'), directory);
  const refinementsURL = new URL(entry('refinements'), directory);
  const mainSource = await fs.readFile(mainURL, 'utf8');
  const refinementSource = await fs.readFile(refinementsURL, 'utf8');
  const modelSpecifier = source => source.match(/from '(\.\/model\.js[^']*)'/)[1];
  assert.equal(new URL(modelSpecifier(mainSource), mainURL).href, new URL(modelSpecifier(refinementSource), refinementsURL).href);
  const main = await import(mainURL.href);
  const refinements = await import(refinementsURL.href);
  const output = await import(new URL(entry('output-refinements'), directory).href);
  const { CASE } = await import(new URL(entry('case'), directory).href);
  const before = JSON.stringify(CASE);
  refinements.applyContentRefinements();
  assert.equal(JSON.stringify(CASE), before);
  const createSim = output.refineOutputCreateSim(refinements.refineCreateSim(main.createSim));
  const sim = createSim();
  const { SERIES, SCENARIOS } = await import(new URL(modelSpecifier(mainSource), mainURL).href);
  assert.equal(SCENARIOS.find(s => s.id === 'cap-lastcase').system, 'Final schedule decision');
  sim.sr = { s: SERIES.find(s => s.id === 'np237') };
  sim.srAlpha = 8; sim.srBeta = 4;
  assert.equal(sim.sr.s.end.sym, 'Tl-205');
  assert.equal(sim.srOk, true);
  sim.advanceScenePhoto('a-generator');
  const first = sim.scArt('a-generator');
  sim.advanceScenePhoto('a-generator');
  const second = sim.scArt('a-generator');
  assert.match(first, /a-generator-0\.webp/);
  assert.match(second, /a-generator-1\.webp/);
  assert.ok(!second.includes('STOPPED BY PLASTIC'));
});

test('the airbag stage and explanation use the same illustrative reactant amount', async () => {
  const { CASE } = await import('../units/06-reactions-stoichiometry/js/case.js');
  assert.ok(CASE.steps.some(step => step.body.includes('2.00 mol NaN3') && step.body.includes('67.2 L')));
  assert.match(CASE.stage, />2\.00 mol<\/text>/);
  assert.match(CASE.stage, />67 L @ STP<\/text>/);
  assert.doesNotMatch(CASE.stage, />0\.10 mol<\/text>/);
});
