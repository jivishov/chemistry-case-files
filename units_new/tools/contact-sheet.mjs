/*
 * Contact sheet for a unit's scene art.
 *
 * Renders every banner in a unit's js/art.js onto one page, screenshots it, and reports how
 * many structurally DISTINCT drawings the set contains. Both halves matter: the PNG is the
 * only way to catch scrim collisions, defs bleed and lighting drift, and the distinctness
 * count is the only cheap way to catch a set that is one template wearing N captions.
 *
 * A healthy unit reports distinct == banners. Wave 2 shipped three units at distinct == 1.
 *
 * Usage, from the repo root:
 *   node units_new/tools/contact-sheet.mjs 08-solutions
 *   node units_new/tools/contact-sheet.mjs 02-atomic-structure 07-gas-laws 08-solutions
 *
 * Env:
 *   PW_ROOT   checkout that has Playwright installed (default: ../Lab_studio)
 *   OUT       directory for the .html and .png (default: the OS temp dir)
 *   WIDTH     px per frame (default 400, which is 1px per viewBox unit -- the scale at which
 *             a label collision in the drawing is a label collision on the page. 476 is the
 *             mission column at its authored 31vw on a 1536px viewport, which is the scale to
 *             judge LEGIBILITY at.)
 *
 * Needs Playwright, which this repo does not depend on -- same arrangement as
 * tests/unit5a-layout.test.mjs.
 */
import { writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const REPO = fileURLToPath(new URL('../../', import.meta.url));
const PW_ROOT = resolve(REPO, process.env.PW_ROOT ?? '../Lab_studio');
const OUT = process.env.OUT ?? tmpdir();
const WIDTH = Number(process.env.WIDTH ?? 400);
const HEIGHT = Math.round(WIDTH * 150 / 400);

const slugs = process.argv.slice(2);
if (!slugs.length) {
  console.error('usage: node units_new/tools/contact-sheet.mjs <slug> [slug...]');
  process.exit(2);
}

let chromium;
try {
  ({ chromium } = createRequire(join(PW_ROOT, 'package.json'))('playwright'));
} catch {
  console.error(`Playwright not found under ${PW_ROOT}. Set PW_ROOT to a checkout that has it.`);
  process.exit(2);
}

// Structural skeleton: the element sequence with every attribute and all text stripped. Two
// banners drawn from the same template collapse to the same string no matter how their
// captions, hues or gradient ids differ.
const skeleton = svg => (String(svg).match(/<[a-zA-Z]+/g) ?? []).join('');

const browser = await chromium.launch();
let worst = 0;

for (const slug of slugs) {
  const art = (await import(pathToFileURL(join(REPO, 'units_new', slug, 'js/art.js')).href)).SCENE_ART;
  const ids = Object.keys(art);
  const distinct = new Set(ids.map(id => skeleton(art[id]))).size;
  const avg = Math.round(ids.reduce((n, id) => n + String(art[id]).length, 0) / ids.length);

  const cells = ids.map(id =>
    `<figure><div class="frame">${art[id]}</div><figcaption>${id}</figcaption></figure>`).join('');
  const html = `<!doctype html><meta charset="utf-8"><title>${slug}</title>
<style>
  body { margin:0; padding:14px; background:#eef2f4; font:12px/1.3 ui-monospace,monospace; }
  h1 { font:600 15px/1.2 system-ui,sans-serif; margin:0 0 10px; }
  .grid { display:grid; grid-template-columns:repeat(3, ${WIDTH}px); gap:12px; }
  figure { margin:0; }
  .frame { width:${WIDTH}px; height:${HEIGHT}px; background:#fff; outline:1px solid #b9c6cd; }
  .frame svg { display:block; width:${WIDTH}px; height:${HEIGHT}px; }
  figcaption { padding:2px 0 0; color:#2b3d47; }
</style>
<h1>${slug} &mdash; ${ids.length} banners, ${distinct} distinct structures, ${avg} avg chars, ${WIDTH}px frames</h1>
<div class="grid">${cells}</div>`;

  const htmlPath = join(OUT, `sheet-${slug}-${WIDTH}.html`);
  const pngPath = join(OUT, `sheet-${slug}-${WIDTH}.png`);
  writeFileSync(htmlPath, html);

  const page = await browser.newPage({ viewport: { width: WIDTH * 3 + 60, height: 900 } });
  await page.goto(pathToFileURL(htmlPath).href);
  await page.waitForTimeout(400);
  await page.screenshot({ path: pngPath, fullPage: true });
  await page.close();

  const verdict = distinct === ids.length ? 'OK'
    : distinct <= 2 ? 'ONE TEMPLATE -- not a set of drawings'
    : `only ${distinct} distinct`;
  if (distinct !== ids.length) worst = 1;
  console.log(`${slug}: ${ids.length} banners, ${distinct} distinct, ${avg} avg chars -- ${verdict}`);
  console.log(`  ${pngPath}`);
}

await browser.close();
process.exit(worst);
