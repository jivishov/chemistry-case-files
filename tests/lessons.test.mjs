import { missionSourcePath } from '../scripts/lesson-missions.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { UNITS } from '../shared/js/teks.js';
import { MODEL_CONFIG, modelState, renderModel } from '../shared/lessons/models.js';
import { renderLesson } from '../shared/lessons/render.js';
import { STANDARDS } from '../shared/lessons/standards.js';
import { typeset } from '../shared/lessons/typeset.js';
import { ILLUSTRATIONS, renderIllustration } from '../shared/lessons/illustrations.js';
import { createSim as createAtomicSim } from '../units/02-atomic-structure/js/main.js';
import { createSim as createNuclearSim } from '../units/11-nuclear/js/main.js';
import { SERIES } from '../units/11-nuclear/js/model.js';

const read = path => fs.readFile(new URL('../' + path, import.meta.url), 'utf8');
const sources = JSON.parse(await read('shared/lessons/source-catalog.json'));
const expectedStandards = {};
let standardGroup;
for (const line of (await read('TEKS.md')).split(/\r?\n/)) {
  const group = line.match(/^\*\*\((\d+)\)\*\*/);
  if (group) standardGroup = group[1];
  const expectation = line.match(/^- \(([A-H])\) (.+)$/);
  if (expectation) expectedStandards[`C.${standardGroup}(${expectation[1]})`] = expectation[2];
}
assert.deepEqual(STANDARDS, expectedStandards, 'Displayed TEKS text matches the authoritative local transcription');
const near = (actual, expected, tolerance = 1e-9) => assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} ≠ ${expected}`);
let assessments = 0, honors = 0, gradedSkills = 0;
const illustratedSections = new Set();

// Display mathematics is authored explicitly, with valid paragraph boundaries.
const worked = typeset('Calculate:<eq label="Heat">q = mcΔT</eq>Then compare.');
assert.ok(worked.includes('<p>Calculate:</p><div class="lesson-equation">'));
assert.ok(worked.endsWith('</div></div><p>Then compare.</p>'));
assert.ok(typeset('<p>Use <eq>N = nN<sub>A</sub></eq> for the count.</p>', {html:true}).includes('N<sub>A</sub>'));
assert.ok(typeset('<eq>x < y</eq>').includes('x &lt; y'), 'Plain-text equation markup is escaped');
assert.ok(typeset('Use K_sp.').includes('K<sub>sp</sub>'), 'Inline variable subscripts stay legible');
assert.throws(()=>renderIllustration(99,'missing'), /Missing teaching illustration/);

for (const unit of UNITS) {
  const { default: lesson } = await import(`../shared/lessons/units/${String(unit.n).padStart(2, '0')}.js`);
  const html = await read(`units/${unit.slug}/learn.html`);
  assert.equal(html.replace(/\r\n/g, '\n'), renderLesson(lesson, sources, unit), `${unit.slug}: rebuild the published reading page`);
  assert.equal([...html.matchAll(/data-book-section\b/g)].length, lesson.sections.length + 7, `${unit.slug}: every reading section can become a book page`);
  assert.ok(html.includes('id="lesson-book"') && html.includes('id="lesson-print"'), `${unit.slug}: both reading controls are available`);
  for (const section of [...lesson.sections, ...lesson.honors]) {
    const illustration = `${unit.n}/${section.id}`;
    illustratedSections.add(illustration);
    assert.ok(ILLUSTRATIONS[illustration], `${illustration}: the concept has an authored illustration`);
    assert.equal(html.split(`data-illustration="${illustration}"`).length - 1, 1, `${illustration}: exactly one static illustration`);
    assert.ok(renderIllustration(unit.n,section.id).includes('role="img" aria-label="'), `${illustration}: accessible text equivalent`);
    assert.ok(section.teks?.length, `${unit.slug}/${section.id}: explicit TEKS alignment`);
    for (const code of section.teks) assert.ok(STANDARDS[code], `${unit.slug}/${section.id}: real TEKS code ${code}`);
  }
  assert.ok(!/<eq\b|@@DISPLAY\d+@@|<p>\s*<div/.test(html), `${unit.slug}: no unrendered math or invalid block nesting`);
  for (const section of lesson.sections) {
    const sectionHTML = html.slice(html.indexOf(`id="${section.id}"`), html.indexOf(`id="heading-${section.id}"`));
    assert.ok(sectionHTML.includes('class="lesson-standards"'), `${unit.slug}/${section.id}: standard appears before the relevant reading`);
  }
  const mission = await read(`units/${unit.slug}/index.html`);
  // Active entry pages must load the same working implementation as their interfaces.
  assert.ok(mission.includes('./js/main.js'), `${unit.slug}: matching mission implementation`);
  for (const match of mission.matchAll(/(?:src|href)="([^"]+)"|import\('([^']+)'\)|from '([^']+)'/g)) {
    const target = match[1] || match[2] || match[3];
    if (!target.startsWith('.') && !target.startsWith('css/')) continue;
    await fs.access(new URL(`../units/${unit.slug}/${target.split(/[?#]/)[0]}`, import.meta.url));
  }
  const modes = new Set([...mission.matchAll(/<button\b[^>]*role="tab"[^>]*>/g)].flatMap(([tag]) => [...tag.matchAll(/@click="setMode\('([a-z]+)'\)"/g)].map(m => m[1])));
  assert.ok(modes.size >= 4, `${unit.slug}: recognize the active mission tabs`);
  assert.deepEqual(new Set(lesson.assessment.map(a => a[0])), modes, `${unit.slug}: every active assessment needs preparatory reading`);
  const implementation = await read(missionSourcePath(unit));
  const skillBlock = implementation.match(/const skills = (\[[\s\S]*?\n\]);/)?.[1];
  assert.ok(skillBlock, `${unit.slug}: graded skill definitions found`);
  const actualSkills = [...skillBlock.matchAll(/\bid:\s*['"]([^'"]+)['"]/g)].map(m => m[1]);
  assert.deepEqual(new Set(Object.keys(lesson.skills)), new Set(actualSkills), `${unit.slug}: every graded skill must have instruction`);
  const instruction = new Set([...lesson.sections.map(s => s.id), ...lesson.honors.map(h => `honors-${h.id}`)]);
  for (const [skill, targets] of Object.entries(lesson.skills)) {
    assert.ok(targets.length, `${unit.slug}/${skill}: instruction is not empty`);
    for (const target of targets) assert.ok(instruction.has(target), `${unit.slug}/${skill}: missing preparatory section ${target}`);
    if (!skill.startsWith('h') || skill === 'hl') assert.ok(targets.some(id => !id.startsWith('honors-')), `${unit.slug}/${skill}: core skills cannot depend only on optional Honors reading`);
  }
  gradedSkills += actualSkills.length;
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
  assert.equal(new Set(ids).size, ids.length, `${unit.slug}: unique navigation targets`);
  for (const [, target] of html.matchAll(/href="#([^"]+)"/g)) assert.ok(ids.includes(target), `${unit.slug}: broken reading link ${target}`);
  for (const [, target] of html.matchAll(/(?:src|href)="((?:\.\.\/|\.\/|learn\.html|index\.html)[^"]*)"/g)) {
    await fs.access(new URL(`../units/${unit.slug}/${target.split(/[?#]/)[0]}`, import.meta.url));
  }
  assert.ok(mission.includes('href="learn.html"'), `${unit.slug}: return to reading`);
  assert.ok(mission.includes('../../shared/lessons/mission-bridge.js'), `${unit.slug}: case-file destination`);
  for (const h of lesson.honors) assert.ok(modes.has(h.mode), `${unit.slug}: honors extension points to a real mission`);
  for (const c of lesson.checks) {
    assert.ok(Number.isInteger(c.answer) && c.options[c.answer], `${unit.slug}: usable practice answer`);
    assert.ok(lesson.sections.some(s => s.id === c.section), `${unit.slug}: feedback has an explanation to revisit`);
  }
  for (const s of [...lesson.sections, ...lesson.honors]) {
    assert.ok(s.sources.length > 0, `${unit.slug}/${s.id}: source attribution`);
    for (const id of s.sources) assert.ok(sources[id]?.url.startsWith('https://'), `${unit.slug}: missing source ${id}`);
  }
  const cfg = MODEL_CONFIG[unit.n];
  for (let v = cfg.min; v <= cfg.max + 1e-7; v += cfg.step) {
    v = Number(v.toFixed(8));
    for (const progress of [0, 0.25, 0.5, 0.75, 1]) {
      const { svg, summary, rows } = renderModel(unit.n, v, progress);
      assert.ok(!/NaN|undefined|Infinity/.test(svg + summary + JSON.stringify(rows)), `${unit.slug}: invalid model output`);
      assert.ok(svg.includes('role="img"') && summary.length > 50, `${unit.slug}: image has a text equivalent`);
    }
  }
  assert.throws(() => modelState(unit.n, cfg.min - 1), RangeError);
  assert.throws(() => modelState(unit.n, NaN), RangeError);
  assert.throws(() => modelState(unit.n, cfg.start, 1.1), RangeError);
  assessments += lesson.assessment.length;
  honors += lesson.honors.length;
}
assert.equal(illustratedSections.size, 79, 'All 54 core topics and 25 Honors extensions are illustrated');
assert.deepEqual(new Set(Object.keys(ILLUSTRATIONS)), illustratedSections, 'No stale or orphaned illustration definitions');

// Independent physical and numerical invariants, including all allowed reaction inputs.
for (const v of [5, 10, 25]) {
  const s = modelState(1, v);
  near(s.after - s.before, v);
  near(s.mass / v, 2.7);
}
near(modelState(2, 3).wavelength, 656.11, 0.1);
near(modelState(2, 4).wavelength, 486.01, 0.1);
assert.ok(modelState(2, 6).energy > modelState(2, 3).energy);
// A teaching animation must not place the electron at forbidden intermediate energies.
for (const upper of [3, 4, 5, 6]) {
  for (const progress of [0, 0.25, 0.49, 0.5, 0.75, 1]) {
    const s = modelState(2, upper, progress);
    assert.equal(s.level, progress < 0.5 ? upper : 2);
    assert.equal(s.emitted, progress >= 0.5);
    const { svg } = renderModel(2, upper, progress);
    assert.ok(svg.includes(`data-electron-level="${s.level}"`));
    assert.equal(svg.includes('data-emitted-photon'), s.emitted);
  }
}
for (let i = 0; i < 3; i++) {
  const s = modelState(3, i);
  assert.equal(s.shells.reduce((sum, n) => sum + n, 0), s.z);
  assert.equal(s.shells.at(-1), 1);
}
assert.equal(modelState(4, 1).domains, 4);
assert.equal(modelState(4, 1).angle, 104.5);
assert.equal(modelState(4, 0).angle, 180);
near(modelState(5, 18.02).moles, 1);
near(modelState(5, 18.02).particles, 6.02214076e23, 1e8);
for (let h2 = 2; h2 <= 12; h2 += 2) {
  for (const progress of [0, 0.17, 0.4, 0.75, 1]) {
    const s = modelState(6, h2, progress);
    assert.equal(2 * s.h2 + 2 * s.water, 2 * h2, 'hydrogen atoms conserved');
    assert.equal(2 * s.o2 + s.water, 8, 'oxygen atoms conserved');
    assert.ok([s.h2, s.o2, s.water].every(n => Number.isInteger(n) && n >= 0));
    if (progress === 1) assert.ok(s.h2 === 0 || s.o2 === 0, 'a reactant is exhausted at completion');
  }
}
near(modelState(7, 10).pressure / modelState(7, 20).pressure, 2);
near(modelState(7, 10).pressure, 1.2309);
for (const v of [0.1, 0.25, 0.5, 1]) near(modelState(8, v).molarity * v, 0.1);
near(modelState(9, 3).hydronium / modelState(9, 7).hydronium, 10000);
for (const ph of [0, 3, 7, 12, 14]) near(modelState(9, ph).hydronium * modelState(9, ph).hydroxide, 1e-14, 1e-28);
for (const initial of [30, 60, 90]) {
  for (const progress of [0, 0.25, 0.5, 1]) {
    const s = modelState(10, initial, progress);
    near(s.qHot + s.qCold, 0, 1e-8);
    assert.ok(s.hot >= s.cold && s.cold >= 20 && s.hot <= initial);
    if (progress === 1) near(s.hot, s.cold);
  }
}
near(modelState(11, 2).fraction, 0.25);
assert.equal(modelState(11, 2).markers, 16);
near(modelState(11, 6).fraction, 1 / 64);
for (const [unit, value] of [[2, 3.5], [3, 0.5], [4, 0.5], [6, 3]]) assert.throws(() => modelState(unit, value), RangeError);

// The family question names its own element, independent of the configuration explorer.
const atomic = createAtomicSim();
atomic.cfgZ = 11;
for (const [z, expected] of [[13, 3], [17, 7], [18, 8]]) {
  atomic.famZ = z;
  assert.equal(atomic.famValence, expected);
}

// The neptunium series includes Bi-209's very slow alpha decay to stable Tl-205.
const nuclear = createNuclearSim();
const expectedSeries = { u238: [8, 6], u235: [7, 4], th232: [6, 4], np237: [8, 4] };
for (const series of SERIES) {
  nuclear.sr = { s: series };
  [nuclear.srAlpha, nuclear.srBeta] = expectedSeries[series.id];
  assert.equal(nuclear.srA, series.end.A);
  assert.equal(nuclear.srZ, series.end.Z);
  assert.ok(nuclear.srOk, `${series.id}: actual mission accepts conserved endpoint`);
}
assert.equal(SERIES.find(s => s.id === 'np237').end.sym, 'Tl-205');
nuclear.sr = { s: SERIES.find(s => s.id === 'np237') };
nuclear.srAlpha = 7; nuclear.srBeta = 4;
assert.equal(nuclear.srOk, false, 'Bi-209 is no longer accepted as the stable endpoint');

console.log(`Lesson checks passed: ${UNITS.length} complete reading pages, ${assessments} tab mappings, ${gradedSkills} graded skill mappings, ${honors} honors extensions, 11 model invariants, and targeted mission regressions.`);
