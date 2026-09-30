import test from 'node:test';
import assert from 'node:assert/strict';
import { readdir, access, stat } from 'node:fs/promises';
import { photoScene, photoUrl } from '../shared/js/scene-media.js';
import { enhanceStage, caseStage } from '../shared/js/stage-materials.js';
import { validateCase, createCaseFile } from '../shared/js/casefile.js';
import { cylinderLevelY, graduatedCylinderSvg, CYLINDER_GEOM } from '../units/01-practices-matter/js/svg-fidelity.js';

const units = (await readdir(new URL('../units/', import.meta.url))).filter(x => /^\d\d-/.test(x)).sort();
const extract = (str, re) => [...str.matchAll(re)].map(x => x[0]);

test('dilution conserves the same amount of solute before and after adding solvent', async () => {
  const { SCENE_ART } = await import('../units/08-solutions/js/art.js');
  const svg = SCENE_ART['f-cleaner'];
  const bars = svg.match(/<g data-visual-role="conserved-moles">([\s\S]*?)<\/g>/)?.[1];
  assert.ok(bars, 'dilution must show the conserved-moles comparison');
  assert.match(bars, />C1V1<\/text>/);
  assert.match(bars, />C2V2<\/text>/);
  const dimensions = [...bars.matchAll(/<rect\b([^>]*)\/>/g)].map(([, attributes]) =>
    Object.fromEntries([...attributes.matchAll(/(y|width|height|opacity)="([^"]+)"/g)].map(([, name, value]) => [name, Number(value)])));
  assert.equal(dimensions.length, 2);
  assert.deepEqual(dimensions[0], dimensions[1], 'equal moles need equal bar size, baseline and visual weight');
});

test('a spent 6 C pack absorbs passive heat from the warmer 33 C chest', async () => {
  const { SCENE_ART } = await import('../units/10-thermochemistry/js/art.js');
  const svg = SCENE_ART['a-spent-pack'];
  const heat = svg.match(/<g data-visual-role="passive-heat-flow">([\s\S]*?)<\/g>/)?.[1];
  assert.ok(heat, 'the passive heat-flow arrow must be present');
  const startAndEnd = heat.match(/d="M([\d.]+) [\d.]+ H([\d.]+)"/);
  assert.ok(startAndEnd);
  const textX = label => Number(svg.match(new RegExp(`<text x="([\\d.]+)"[^>]*>${label}<\\/text>`))?.[1]);
  assert.ok(textX('33 C') > textX('6 C'), 'the warm chest is to the right of the cold pack');
  assert.ok(Number(startAndEnd[1]) > Number(startAndEnd[2]), 'heat must point left, toward the colder pack');
});

test('all 501 readable cylinder levels align with the original 1 mL graduations', () => {
  for (let tenth = 0; tenth <= 500; tenth++) {
    const volume = tenth / 10;
    const svg = graduatedCylinderSvg(volume, { labels: true });
    const y = cylinderLevelY(volume);
    assert.ok(Math.abs(y - (566 - volume * 10)) < 1e-9);
    if (volume > 0) {
      const m = svg.match(/data-visual-role="meniscus" d="M50 ([\d.-]+) Q93 ([\d.-]+) 136 ([\d.-]+)"/);
      assert.ok(m, `meniscus at ${volume} mL`);
      const bottom = .25 * +m[1] + .5 * +m[2] + .25 * +m[3];
      assert.ok(Math.abs(bottom - y) < 1e-9, `meniscus bottom must read ${volume} mL`);
    }
    assert.match(svg, /class="cylinder-classic"/);
    assert.match(svg, /class="cylinder-enhanced"/);
  }
  assert.equal(cylinderLevelY(-2), CYLINDER_GEOM.bottomY);
  assert.equal(cylinderLevelY(52), CYLINDER_GEOM.topY);
});

test('density cylinders retain the correct displacement and independent SVG definitions', () => {
  const before = graduatedCylinderSvg(20, { labels: true });
  const after = graduatedCylinderSvg(27.4, { labels: true, block: true, sampleVolume: 7.4 });
  assert.ok(Math.abs(cylinderLevelY(20) - cylinderLevelY(27.4) - 74) < 1e-9);
  assert.match(after, /data-sample-volume="7.4"/);
  assert.doesNotMatch(before, /data-sample-volume/);
  const ids = extract(before + after, /\bid="[^"]+"/g);
  assert.equal(new Set(ids).size, ids.length);
});

for (const unit of units) {
  const n = Number(unit.slice(0, 2));
  test(`${unit}: scene photographs always retain the complete original SVG`, async () => {
    const { SCENE_ART } = await import(`../units/${unit}/js/art.js`);
    assert.ok(Object.keys(SCENE_ART).length > 0);
    const file = new URL(photoUrl(n));
    await access(file);
    const bytes = (await stat(file)).size;
    assert.ok(bytes > 1000 && bytes < 150000, 'banner must be nonempty and small enough for classroom networks');
    for (const [id, svg] of Object.entries(SCENE_ART)) {
      const output = photoScene(n, id, svg);
      assert.ok(output.includes(svg), id);
      assert.match(output, /onerror=/);
      assert.match(output, /aria-label="Show original scenario illustration"/);
      assert.match(output, /class="scene-photo"/);
    }
  });
  test(`${unit}: stage polish preserves scientific text, geometry, bindings and chapter behavior`, async () => {
    const { CASE } = await import(`../units/${unit}/js/case.js`);
    assert.deepEqual(validateCase(CASE), []);
    const output = enhanceStage(CASE.stage, CASE.number);
    for (const re of [/<text\b[^>]*>[\s\S]*?<\/text>/g, /\bx-(?:show|text|html)="[^"]*"/g, /:[\w-]+="[^"]*"/g, /\bd="[^"]*"/g, /\ba-[\w-]+/g]) {
      assert.deepEqual(extract(output, re), extract(CASE.stage, re));
    }
    const state = createCaseFile(CASE);
    assert.equal(state.step, 0);
    state.next(); assert.equal(state.step, 1);
    state.prev(); assert.equal(state.step, 0);
    state.go(CASE.steps.length - 1); assert.equal(state.atLast, true);
    if (n === 1) {
      const html = caseStage(CASE);
      assert.match(html, /cf-original-stage/);
      assert.match(html, /raster-failed/);
      assert.doesNotMatch(CASE.originalStage, /<image/);
      assert.match(CASE.originalStage, /a-flow/);
    }
  });
}
