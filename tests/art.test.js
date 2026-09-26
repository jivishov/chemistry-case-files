// tests/art.test.js — gate for the units scene art. Run: node tests/art.test.js
//
// Wave 2 shipped three units whose art.js was ONE template wearing a different caption per
// scenario: 21, 13 and 18 banners, each set with exactly one distinct drawing in it. Every
// other gate passed. `npm test` never looked at art, and the layout audit still reported
// "1136 states clean across 11 builds" with the templates in place, because it audits scroll,
// clipping, occlusion and font size, not whether a picture depicts anything. The only thing
// that caught it was a human opening a contact sheet, which a report can claim without doing.
//
// So this suite makes the cheap half mechanical. It cannot judge whether a banner is a GOOD
// drawing — that still needs units/tools/contact-sheet.mjs and eyes — but it can prove the
// set is N drawings rather than one drawing N times, which is the failure that actually shipped.
//
// Units are DISCOVERED, not listed. Wave 1 left four units out of two registration lists
// precisely because a human had to remember to add them; a suite that walks the directory has
// no such step, and a new unit is covered the moment its art.js exists.
import { readdirSync, existsSync } from 'node:fs';

let pass = 0, fail = 0;
const t = (name, cond) => { cond ? pass++ : (fail++, console.log('FAIL:', name)); };

// The structural skeleton of a banner: its element sequence with every attribute and all text
// stripped. Two banners built from the same template collapse to the same string no matter how
// far apart their captions, hues and gradient ids look in source. This is the whole detector.
const skeleton = svg => (String(svg).match(/<[a-zA-Z][a-zA-Z0-9-]*/g) ?? []).join('');

const UNITS = readdirSync('units', { withFileTypes: true })
  .filter(d => /^\d\d-/.test(d.name) && d.isDirectory() && existsSync(`units/${d.name}/js/art.js`))
  .map(d => d.name)
  .sort();

// A discovery bug that finds nothing would otherwise report a clean run over zero units.
t(`found units builds with art (${UNITS.length})`, UNITS.length === 11);

for (const unit of UNITS) {
  const art = (await import(`../units/${unit}/js/art.js`)).SCENE_ART;
  const sceneArt = (await import(`../units/${unit}/js/art.js`)).sceneArt;
  const scenarios = (await import(`../units/${unit}/js/model.js`)).SCENARIOS;

  const ids = art && typeof art === 'object' ? Object.keys(art) : [];
  t(`${unit}: exports a non-empty SCENE_ART`, ids.length > 0);
  if (!ids.length) continue;

  // main.js reads art through scArt(id) -> sceneArt(id). Both names are load-bearing; either
  // `export const` or `export function` is fine, which is why this asserts callability only.
  t(`${unit}: exports a callable sceneArt`, typeof sceneArt === 'function');
  t(`${unit}: sceneArt returns the banner`, sceneArt(ids[0]) === art[ids[0]]);
  t(`${unit}: sceneArt of an unknown id is empty, not undefined`, sceneArt('no-such-scene') === '');

  // The mission screen has a banner slot for every scenario, so the mapping is exactly 1:1 —
  // no spares and no gaps. Every finished unit holds this.
  const scIds = scenarios.map(s => s.id);
  const missing = scIds.filter(id => !ids.includes(id));
  const spare = ids.filter(id => !scIds.includes(id));
  t(`${unit}: a banner for every scenario${missing.length ? ' -> missing ' + missing.join(', ') : ''}`,
    missing.length === 0);
  t(`${unit}: no banner without a scenario${spare.length ? ' -> spare ' + spare.join(', ') : ''}`,
    spare.length === 0);

  // THE wave-2 assertion.
  const distinct = new Set(ids.map(id => skeleton(art[id]))).size;
  t(`${unit}: ${ids.length} banners are ${ids.length} distinct drawings, not ${distinct}`,
    distinct === ids.length);

  // The frame contract. 400x150 is what the mission screen reserves, and the banner is
  // decoration whose goal text is the authoritative description — hence aria-hidden.
  const badBox = ids.filter(id => !String(art[id]).includes('viewBox="0 0 400 150"'));
  const badHide = ids.filter(id => !String(art[id]).includes('aria-hidden="true"'));
  t(`${unit}: every banner is a 400x150 viewBox${badBox.length ? ' -> ' + badBox[0] : ''}`,
    badBox.length === 0);
  t(`${unit}: every banner is aria-hidden${badHide.length ? ' -> ' + badHide[0] : ''}`,
    badHide.length === 0);

  // Defs bleed, the oldest art trap here: Alpine keeps every panel in the DOM at once, so two
  // banners sharing a gradient id are one gradient, and whichever scene renders second inherits
  // the first one's fill. Per-scene id prefixes are what kit(id) exists to produce.
  const owner = new Map();
  const bled = [];
  for (const id of ids) {
    for (const m of String(art[id]).matchAll(/\bid="([^"]+)"/g)) {
      const defId = m[1];
      if (owner.has(defId) && owner.get(defId) !== id) bled.push(`${defId} in ${owner.get(defId)} and ${id}`);
      else owner.set(defId, id);
    }
  }
  t(`${unit}: no defs id shared between banners${bled.length ? ' -> ' + bled[0] : ''}`, bled.length === 0);
}

// ---- the detector has to actually detect -------------------------------------------
// Without these, a skeleton() that silently returned '' would report every set as one
// drawing, and a skeleton() that included attributes would report every set as clean.
t('skeleton collapses two banners built from one template', (() => {
  const a = '<svg viewBox="0 0 400 150"><rect fill="#111"/><text x="10">alpha</text></svg>';
  const b = '<svg viewBox="0 0 400 150"><rect fill="#eee"/><text x="99">omega</text></svg>';
  return skeleton(a) === skeleton(b);
})());
t('skeleton separates two genuinely different drawings', (() => {
  const a = '<svg><rect/><text>x</text></svg>';
  const b = '<svg><rect/><circle/><path/><text>x</text></svg>';
  return skeleton(a) !== skeleton(b);
})());
t('skeleton is not empty for real markup', skeleton('<svg><g><rect/></g></svg>').length > 0);

console.log(`art: ${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
