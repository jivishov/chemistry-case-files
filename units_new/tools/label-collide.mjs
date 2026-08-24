/*
 * Label collision detector for scene art.
 *
 * HANDOFF-COCKPIT-REFINEMENT.md §3 records how the label floor was tuned: render every scene
 * and look at it, because "8.0 was collision-free; 8.4 ran labels together" and the difference
 * is invisible in the source. That is true and it worked for one unit with twelve scenes. It
 * does not scale to ten units and ~1,700 labels, and a contact sheet cannot tell a collision
 * the floor CAUSED from one the drawing always had.
 *
 * So: measure. Every <text> in every banner is laid out by a real browser, and two things get
 * reported -- text boxes that overlap each other, and text that leaves the 400x150 frame. Run
 * it against a git ref as well as the working tree and only the DELTA needs eyes.
 *
 * Usage, from the repo root:
 *   node units_new/tools/label-collide.mjs 08-solutions            # working tree only
 *   node units_new/tools/label-collide.mjs --vs HEAD 08-solutions  # new problems only
 *   node units_new/tools/label-collide.mjs --vs HEAD 01-practices-matter 02-atomic-structure
 *
 * Exit code 1 if the working tree has any problem the reference did not (with --vs), or any
 * problem at all (without). Env: PW_ROOT.
 *
 * What counts as crowded: two label boxes that overlap on one axis and come within CLEAR px on
 * the other. That rule was not guessed -- it is what separates Unit 3 at its tuned floor of 8,
 * which §3 records as collision-free, from the same unit at 8.4, which §3 records as running
 * labels together. The pair §3 names is `c-cell`'s "167 pm" over "6.9 u": stacked on baselines
 * ten units apart, they clear each other by 1px at floor 8 and by 0px at 8.4. Nothing else in
 * the source says that, and no eye finds it in a 400px frame.
 *
 * A drawing that stacks a mass under a symbol inside a 24-unit tile overlaps ON PURPOSE, so a
 * run with no --vs is a census rather than a list of defects. The delta is the signal.
 */
import { writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, resolve } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const REPO = fileURLToPath(new URL('../../', import.meta.url));
const PW_ROOT = resolve(REPO, process.env.PW_ROOT ?? '../Lab_studio');

const CLEAR = 1;          // px two labels must keep between them, at 1px per viewBox unit
const FRAME = { w: 400, h: 150 };
const OUT_OF_FRAME = 1.5; // px a glyph box may sit outside the frame before it is reported

const argv = process.argv.slice(2);
const vsIdx = argv.indexOf('--vs');
const REF = vsIdx === -1 ? null : argv[vsIdx + 1];
const slugs = argv.filter((a, i) => !a.startsWith('--') && !(vsIdx !== -1 && i === vsIdx + 1));
if (!slugs.length) {
  console.error('usage: node units_new/tools/label-collide.mjs [--vs <ref>] <slug> [slug...]');
  process.exit(2);
}

let chromium;
try { ({ chromium } = createRequire(join(PW_ROOT, 'package.json'))('playwright')); }
catch { console.error(`Playwright not found under ${PW_ROOT}.`); process.exit(2); }

/* art.js imports its siblings by relative path, so a reference copy has to live somewhere those
   still resolve from. One directory deeper works, with every relative specifier pushed out one
   level: './model.js' becomes '.././model.js' and '../shared/x.js' becomes '../../shared/x.js',
   which is the same one-line rule for both. */
const artAt = async (slug, ref) => {
  if (!ref) {
    return (await import(pathToFileURL(join(REPO, 'units_new', slug, 'js/art.js')).href)).SCENE_ART;
  }
  const rel = `units_new/${slug}/js/art.js`;
  let src;
  for (const prefix of ['', 'Chem_simulations/']) {
    try {
      src = execFileSync('git', ['show', `${ref}:${prefix}${rel}`],
        { cwd: REPO, encoding: 'utf8', maxBuffer: 1 << 26, stdio: ['ignore', 'pipe', 'ignore'] });
      break;
    } catch { /* the other prefix: this repo is a subdirectory of a monorepo */ }
  }
  if (src === undefined) throw new Error(`cannot read ${rel} at ${ref}`);
  const dir = mkdtempSync(join(REPO, 'units_new', slug, 'js', '.collideref-'));
  try {
    const file = join(dir, 'art.js');
    writeFileSync(file, src.replace(/((?:from|import\()\s*['"])(\.\.?\/)/g, '$1../$2'), 'utf8');
    return (await import(pathToFileURL(file).href)).SCENE_ART;
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
};

/* ---- runs in the page ---- */
function measure({ art, clear, frame, slack }) {
  const host = document.getElementById('host');
  const out = [];
  for (const [id, svg] of Object.entries(art)) {
    host.innerHTML = svg;
    const root = host.querySelector('svg');
    if (!root) continue;
    const base = root.getBoundingClientRect();
    const rootCTM = root.getScreenCTM();
    const texts = [...root.querySelectorAll('text')].map(t => {
      const r = t.getBoundingClientRect();
      /* Two labels on the same tilted sheet are parallel lines, not a collision -- but their
         axis-aligned screen boxes inflate by width * sin(tilt) and can appear to touch. So
         each label also carries its box in ITS OWN space plus a signature of the transform
         that got it there; a pair sharing that signature is judged in the space they share,
         and only a pair with different transforms falls back to screen boxes. */
      const b = t.getBBox();
      const m = t.getScreenCTM();
      const rel = m && rootCTM ? rootCTM.inverse().multiply(m) : null;
      const frame = rel
        ? [rel.a, rel.b, rel.c, rel.d].map(v => Math.round(v * 1e4) / 1e4).join(',')
        : 'screen';
      return {
        s: (t.textContent || '').trim(),
        size: parseFloat(t.getAttribute('font-size')) || 0,
        // Back into viewBox units, which is what the author edits.
        x1: r.left - base.left, y1: r.top - base.top,
        x2: r.right - base.left, y2: r.bottom - base.top,
        frame,
        // In the label's own space, offset by its transform's translation so a shared frame
        // compares like-for-like.
        lx1: b.x + (rel ? rel.e : 0), ly1: b.y + (rel ? rel.f : 0),
        lx2: b.x + b.width + (rel ? rel.e : 0), ly2: b.y + b.height + (rel ? rel.f : 0),
      };
    }).filter(t => t.s && t.x2 > t.x1);

    for (let i = 0; i < texts.length; i++) {
      const a = texts[i];
      if (a.x1 < -slack || a.y1 < -slack || a.x2 > frame.w + slack || a.y2 > frame.h + slack) {
        out.push({ id, kind: 'out of frame', a: a.s, size: a.size, area: 0,
          detail: `box ${a.x1.toFixed(0)},${a.y1.toFixed(0)} to ${a.x2.toFixed(0)},${a.y2.toFixed(0)}` });
      }
      for (let j = i + 1; j < texts.length; j++) {
        const b = texts[j];
        /* Gaps, not overlaps: negative means the boxes cross on that axis. Two labels are
           crowded when they cross on one axis and fail to clear on the other, which is the
           same test whether they were stacked or set side by side. */
        const same = a.frame === b.frame && a.frame !== 'screen';
        const gx = same
          ? Math.max(a.lx1, b.lx1) - Math.min(a.lx2, b.lx2)
          : Math.max(a.x1, b.x1) - Math.min(a.x2, b.x2);
        const gy = same
          ? Math.max(a.ly1, b.ly1) - Math.min(a.ly2, b.ly2)
          : Math.max(a.y1, b.y1) - Math.min(a.y2, b.y2);
        if ((gx < 0 && gy < clear) || (gy < 0 && gx < clear)) {
          out.push({
            id, kind: gx < 0 && gy < 0 ? 'overlap' : 'no clearance',
            a: a.s, b: b.s, size: Math.min(a.size, b.size) || 9,
            // Tightness, so a pre-existing crowd that got tighter still registers.
            area: Math.round(-Math.min(gx, 0) * -Math.min(gy, 0) * 10) / 10,
            detail: `gap ${gx.toFixed(1)} x ${gy.toFixed(1)}`,
          });
        }
      }
    }
  }
  return out;
}

const key = p => [p.id, p.kind, p.a, p.b ?? ''].join('|');

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 900, height: 400 } });
await page.setContent(`<!doctype html><meta charset="utf-8"><style>
  body { margin:0 }
  #host { width:${FRAME.w}px; height:${FRAME.h}px }
  #host svg { display:block; width:${FRAME.w}px; height:${FRAME.h}px }
</style><div id="host"></div>`);

let bad = 0;
for (const slug of slugs.map(s => s.replace(/[\\/]$/, ''))) {
  const now = await measure_for(await artAt(slug, null));
  const before = REF ? await measure_for(await artAt(slug, REF)) : [];
  const wasByKey = new Map(before.map(p => [key(p), p]));
  const nowKeys = new Set(now.map(key));

  /* Three buckets, because a pre-existing crowd that the floor made half again as tight is not
     "already there". */
  const fresh = [], worse = [];
  for (const p of now) {
    const was = wasByKey.get(key(p));
    if (!was) { if (REF) fresh.push(p); continue; }
    if (p.area >= was.area * 1.5 + 4) worse.push({ ...p, detail: p.detail + ` (was ${was.area})` });
  }
  const gone = before.filter(p => !nowKeys.has(key(p)));
  const report = REF ? [...fresh, ...worse] : now;

  console.log(`${slug}: ${now.length} crowded or escaping labels` + (REF
    ? `, ${fresh.length} new since ${REF}, ${worse.length} worse, ${gone.length} fixed`
    : ''));
  for (const p of report) {
    const tag = worse.includes(p) ? 'WORSE' : p.kind;
    console.log(`  ${p.id.padEnd(14)} ${tag.padEnd(12)} @${String(p.size).padEnd(4)} ${p.detail}`);
    console.log(`                 "${p.a}"` + (p.b ? `  vs  "${p.b}"` : ''));
  }
  if (report.length) bad = 1;
}

async function measure_for(art) {
  return page.evaluate(measure, { art, clear: CLEAR, frame: FRAME, slack: OUT_OF_FRAME });
}

await browser.close();
process.exit(bad);
