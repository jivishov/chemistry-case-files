/*
 * Before/after contact sheet for the in-SVG label floor.
 *
 * HANDOFF-COCKPIT-REFINEMENT.md §3: "Render every scene and look at it. 8.0 was
 * collision-free; 8.4 ran labels together. The difference is invisible in the source and
 * obvious in a 12-scene contact sheet."
 *
 * A single sheet answers "does this collide" but not "did I cause it" -- these drawings have
 * tight labels already, and judging a floor against a blank memory is how a pre-existing
 * overlap gets fixed by lowering a number that was fine. So this renders each banner TWICE,
 * side by side: once from the unit's art.js as it stands in a git ref (default HEAD), once
 * from the working tree. The pair is the evidence.
 *
 * Usage, from the repo root:
 *   node units_new/tools/floor-compare.mjs 08-solutions
 *   node units_new/tools/floor-compare.mjs 08-solutions 02-atomic-structure
 *   REF=fa3b1c5 node units_new/tools/floor-compare.mjs 11-nuclear
 *
 * Env: PW_ROOT, OUT, WIDTH (per frame; default 400 = 1px per viewBox unit), REF (git ref).
 */
import { writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const REPO = fileURLToPath(new URL('../../', import.meta.url));
const PW_ROOT = resolve(REPO, process.env.PW_ROOT ?? '../Lab_studio');
const OUT = process.env.OUT ?? tmpdir();
const WIDTH = Number(process.env.WIDTH ?? 400);
const HEIGHT = Math.round(WIDTH * 150 / 400);
const REF = process.env.REF ?? 'HEAD';

const slugs = process.argv.slice(2);
if (!slugs.length) {
  console.error('usage: node units_new/tools/floor-compare.mjs <slug> [slug...]');
  process.exit(2);
}

let chromium;
try { ({ chromium } = createRequire(join(PW_ROOT, 'package.json'))('playwright')); }
catch { console.error(`Playwright not found under ${PW_ROOT}.`); process.exit(2); }

/* art.js imports its siblings by relative path, so a reference copy has to live somewhere those
   still resolve from. One directory deeper works, with every relative specifier pushed out one
   level: './model.js' becomes '.././model.js' and '../shared/x.js' becomes '../../shared/x.js',
   which is the same one-line rule for both. */
const stage = (slug) => {
  const rel = `units_new/${slug}/js/art.js`;
  let src;
  for (const prefix of ['', 'Chem_simulations/']) {
    try {
      src = execFileSync('git', ['show', `${REF}:${prefix}${rel}`],
        // stdio silences git's "path exists, but not..." note on the first prefix, which is
        // expected: this repo is a subdirectory of a monorepo, so one of the two is wrong.
        { cwd: REPO, encoding: 'utf8', maxBuffer: 1 << 26, stdio: ['ignore', 'pipe', 'ignore'] });
      break;
    } catch { /* try the other prefix */ }
  }
  if (src === undefined) throw new Error(`cannot read ${rel} at ${REF}`);
  const dir = mkdtempSync(join(REPO, 'units_new', slug, 'js', '.floorref-'));
  const file = join(dir, 'art.js');
  writeFileSync(file, src.replace(/((?:from|import\()\s*['"])(\.\.?\/)/g, '$1../$2'), 'utf8');
  return { file, dir };
};

const browser = await chromium.launch();

for (const slug of slugs) {
  const now = (await import(pathToFileURL(join(REPO, 'units_new', slug, 'js/art.js')).href)).SCENE_ART;
  const { file, dir } = stage(slug);
  let before;
  try {
    before = (await import(pathToFileURL(file).href)).SCENE_ART;
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }

  const ids = Object.keys(now);
  const changed = ids.filter(id => String(now[id]) !== String(before[id]));
  const cells = ids.map(id => `<figure>
    <figcaption>${id}${changed.includes(id) ? '' : ' &mdash; unchanged'}</figcaption>
    <div class="pair">
      <div class="frame"><span class="tag">${REF}</span>${before[id] ?? ''}</div>
      <div class="frame"><span class="tag">now</span>${now[id]}</div>
    </div>
  </figure>`).join('');

  const html = `<!doctype html><meta charset="utf-8"><title>${slug} floor compare</title>
<style>
  body { margin:0; padding:14px; background:#eef2f4; font:12px/1.3 ui-monospace,monospace; }
  h1 { font:600 15px/1.2 system-ui,sans-serif; margin:0 0 10px; }
  figure { margin:0 0 14px; }
  .pair { display:grid; grid-template-columns:repeat(2, ${WIDTH}px); gap:8px; }
  .frame { position:relative; width:${WIDTH}px; height:${HEIGHT}px; background:#fff; outline:1px solid #b9c6cd; }
  .frame svg { display:block; width:${WIDTH}px; height:${HEIGHT}px; }
  .tag { position:absolute; z-index:2; top:0; left:0; padding:1px 5px; background:#0b2b36; color:#cfe9ef; font-size:10px; }
  figcaption { padding:0 0 3px; color:#2b3d47; font-weight:700; }
</style>
<h1>${slug} &mdash; ${REF} (left) vs working tree (right), ${changed.length} of ${ids.length} banners changed, ${WIDTH}px frames</h1>
${cells}`;

  const htmlPath = join(OUT, `floor-${slug}-${WIDTH}.html`);
  const pngPath = join(OUT, `floor-${slug}-${WIDTH}.png`);
  writeFileSync(htmlPath, html);

  const page = await browser.newPage({ viewport: { width: WIDTH * 2 + 60, height: 900 } });
  await page.goto(pathToFileURL(htmlPath).href);
  await page.waitForTimeout(400);
  await page.screenshot({ path: pngPath, fullPage: true });
  await page.close();

  console.log(`${slug}: ${changed.length} of ${ids.length} banners changed`);
  console.log(`  ${pngPath}`);
}

await browser.close();
