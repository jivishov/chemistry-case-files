/*
 * Cockpit geometry probe: the numbers that turn "it looks cramped" into a decision.
 *
 * HANDOFF-COCKPIT-REFINEMENT.md §3 opens with the rule this tool exists to serve -- measure
 * before you style, and measure the CHILD BLOCKS, not the panel. Knowing that a bench
 * scrolls 352px says nothing about what to move; knowing that one reference card inside it
 * is 552px tall says everything. So this reports both, per station:
 *
 *   columns   the three track widths, which is the width the art has to draw in
 *   scroll    scrollHeight - clientHeight for the bench, the mission column and the rail
 *   blocks    every child of the active panel, tallest first, with its class
 *   type      the smallest computed font-size found in instructional text
 *
 * Usage, from the repo root:
 *   node units_new/tools/cockpit-measure.mjs 08-solutions
 *   node units_new/tools/cockpit-measure.mjs 08-solutions --blocks
 *   node units_new/tools/cockpit-measure.mjs 08-solutions --station "Molarity" --blocks
 *   node units_new/tools/cockpit-measure.mjs 08-solutions --shot
 *   node units_new/tools/cockpit-measure.mjs 08-solutions --walk "Molarity"
 *
 * `--walk` is the state walk from §6: untouched, one pick, every pick, committed. It clicks
 * only inside `.panel.is-active`, because every bench's markup is in the DOM at once and a
 * bare `.choice` selector resolves into a hidden panel.
 *
 * Flags:
 *   --station <name>  one station (the tab's aria-label); default is all of them
 *   --blocks          per-child heights of the active panel
 *   --walk <station>  screenshot the panel through its selection states
 *   --shot            screenshot each station's shell
 *   --size WxH        viewport; default 1536x726, Emil's panel at 125%
 *
 * Env: PW_ROOT (checkout with Playwright, default ../Lab_studio), OUT (screenshot dir).
 */
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { createRequire } from 'node:module';
import { extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = fileURLToPath(new URL('../../', import.meta.url));
const PW_ROOT = resolve(REPO, process.env.PW_ROOT ?? '../Lab_studio');
const OUT = process.env.OUT ?? tmpdir();

const argv = process.argv.slice(2);
const flag = (name, fallback = null) => {
  const i = argv.indexOf('--' + name);
  return i === -1 ? fallback : (argv[i + 1] ?? true);
};
const has = name => argv.includes('--' + name);
const slug = argv.find(a => !a.startsWith('--') && argv[argv.indexOf(a) - 1] !== '--station' &&
  argv[argv.indexOf(a) - 1] !== '--walk' && argv[argv.indexOf(a) - 1] !== '--size');

if (!slug) {
  console.error('usage: node units_new/tools/cockpit-measure.mjs <unit-slug> [--blocks] [--station NAME] [--walk NAME] [--shot] [--size WxH]');
  process.exit(2);
}
const [W, H] = String(flag('size', '1536x726')).split('x').map(Number);

const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.woff2': 'font/woff2', '.pdf': 'application/pdf',
};

function serve() {
  const server = createServer(async (req, res) => {
    try {
      let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
      if (p.endsWith('/')) p += 'index.html';
      const full = join(REPO, normalize(p).replace(/^(\.\.[/\\])+/, ''));
      const body = await readFile(full);
      res.writeHead(200, { 'content-type': MIME[extname(full)] ?? 'application/octet-stream' });
      res.end(body);
    } catch { res.writeHead(404).end('not found'); }
  });
  return new Promise(r => server.listen(0, '127.0.0.1', () => r(server)));
}

/* ---- runs in the page ---- */
function probe() {
  const box = sel => {
    const el = document.querySelector(sel);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { w: Math.round(r.width), h: Math.round(r.height), scroll: el.scrollHeight - el.clientHeight };
  };
  const name = el => el.tagName.toLowerCase() +
    (typeof el.className === 'string' && el.className.trim()
      ? '.' + el.className.trim().split(/\s+/).slice(0, 3).join('.') : '');

  const painted = e => {
    const cs = getComputedStyle(e);
    if (cs.display === 'none' || cs.visibility === 'hidden') return false;
    const r = e.getBoundingClientRect();
    return r.height > 0 && r.width > 0;
  };

  /* Several benches wrap their whole content in one anonymous <div> (an x-if or x-show
     container), and listing that div reports the panel height back at you. Descend through
     any run of single-child wrappers first, so the blocks printed are the ones a person
     could actually move. */
  let host = document.querySelector('.chem-console > .panel.is-active');
  const depth = [];
  while (host) {
    const kids = [...host.children].filter(painted);
    if (kids.length !== 1) break;
    depth.push(name(kids[0]));
    host = kids[0];
  }
  const blocks = host ? [...host.children].filter(painted)
    .map(e => ({ tag: name(e), h: Math.round(e.getBoundingClientRect().height) }))
    .sort((a, b) => b.h - a.h) : [];

  /* The legibility floor's own scope, so the number here is the number the gate reads. */
  let smallest = null;
  document.querySelectorAll('*').forEach(el => {
    if (el.children.length) return;
    if (!(el.textContent || '').trim()) return;
    if (!(el.closest('.chem-console > .panel.is-active') || el.closest('.mission-screen'))) return;
    if (el.closest('svg') || el.closest('.command-kicker') || el.closest('.screen-system')) return;
    if (el.closest('sup') || el.closest('sub')) return;
    /* KaTeX stacks zero-width struts at 1px inside every rendered equation. The layout gate
       judges the whole .katex box for the same reason; measuring its internals reports noise. */
    if (el.closest('.katex')) return;
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') return;
    const fs = parseFloat(cs.fontSize);
    if (smallest === null || fs < smallest.fs) {
      smallest = { fs, at: name(el), text: (el.textContent || '').trim().slice(0, 30) };
    }
  });

  const de = document.documentElement;
  return {
    doc: { y: de.scrollHeight - de.clientHeight, x: de.scrollWidth - de.clientWidth },
    job: box('.mission-screen'),
    bench: box('.chem-console > .panel.is-active'),
    rail: box('.life-support-board'),
    copy: box('.mission-screen > .screen-copy'),
    art: box('.mission-screen-art svg'),
    blocks,
    depth,
    smallest,
  };
}

/* ---- driver ---- */
let chromium;
try { ({ chromium } = createRequire(join(PW_ROOT, 'package.json'))('playwright')); }
catch { console.error(`Playwright not found under ${PW_ROOT}.`); process.exit(2); }

const server = await serve();
const origin = 'http://127.0.0.1:' + server.address().port;
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: W, height: H } });
await page.goto(origin + '/units_new/' + slug + '/', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(600);

/* The tabs' aria-labels are the canonical station names at every width -- the visible text
   swaps between two labels on a breakpoint, which is why the layout gate keys off them too. */
const stations = await page.$$eval('nav.station-nav .tab', tabs =>
  tabs.map(t => t.getAttribute('aria-label')).filter(Boolean));
const only = flag('station');
const list = only ? stations.filter(s => s === only) : stations;
if (only && !list.length) {
  console.error(`no station "${only}". Have: ${stations.join(' | ')}`);
  process.exit(2);
}

console.log(`${slug} @ ${W}x${H}`);

for (const st of list) {
  await page.click(`nav.station-nav [aria-label="${st}"]`).catch(() => {});
  await page.waitForTimeout(260);
  const r = await page.evaluate(probe);
  const cols = [r.job, r.bench, r.rail].map(b => (b ? b.w : '-')).join(' / ');
  const scr = [r.bench, r.copy, r.rail].map(b => (b ? b.scroll : '-')).join(' / ');
  console.log(`\n  ${st}`);
  console.log(`    columns job/bench/rail   ${cols} px`);
  console.log(`    scroll  bench/copy/rail  ${scr} px      doc ${r.doc.y}/${r.doc.x}`);
  if (r.art) console.log(`    scene art               ${r.art.w}x${r.art.h} px`);
  if (r.smallest) console.log(`    smallest type           ${r.smallest.fs.toFixed(1)}px ${r.smallest.at} "${r.smallest.text}"`);
  if (has('blocks')) {
    if (r.depth.length) console.log(`    inside                  ${r.depth.join(' > ')}`);
    for (const b of r.blocks) console.log(`    ${String(b.h).padStart(5)}px  ${b.tag}`);
  }
  if (has('shot')) {
    const p = join(OUT, `cockpit-${slug}-${st.replace(/\W+/g, '-')}.png`);
    await page.screenshot({ path: p });
    console.log(`    shot ${p}`);
  }
}

/* ---- the state walk (§6) ------------------------------------------------------------- */
/* Scoped to `.panel.is-active` throughout: every bench is in the DOM at once, so a bare
   `.choice` or `.opt` selector picks a control on a panel nobody can see. */
const walk = flag('walk');
if (walk) {
  await page.click(`nav.station-nav [aria-label="${walk}"]`).catch(() => {});
  await page.waitForTimeout(260);
  const shoot = async label => {
    const p = join(OUT, `walk-${slug}-${walk.replace(/\W+/g, '-')}-${label}.png`);
    const panel = await page.$('.chem-console > .panel.is-active');
    await (panel ?? page).screenshot({ path: p });
    console.log(`    ${label.padEnd(12)} ${p}`);
  };
  console.log(`\n  state walk: ${walk}`);
  await shoot('untouched');

  /* One click per control GROUP, in document order, so a bench that gates its commit on two
     separate picks is photographed both half-answered and fully answered. */
  const groups = await page.$eval('.chem-console > .panel.is-active', panel => {
    const owners = new Map();
    panel.querySelectorAll('.choice, .opt, .pair, .miss-opt').forEach(el => {
      const parent = el.parentElement;
      if (!owners.has(parent)) owners.set(parent, []);
      owners.get(parent).push(el);
    });
    return [...owners.values()].map(list => list.length);
  });
  for (let g = 0; g < groups.length; g++) {
    await page.evaluate(i => {
      const panel = document.querySelector('.chem-console > .panel.is-active');
      const owners = new Map();
      panel.querySelectorAll('.choice, .opt, .pair, .miss-opt').forEach(el => {
        if (!owners.has(el.parentElement)) owners.set(el.parentElement, []);
        owners.get(el.parentElement).push(el);
      });
      [...owners.values()][i]?.[0]?.click();
    }, g);
    await page.waitForTimeout(180);
    await shoot('pick' + (g + 1));
  }

  const committed = await page.evaluate(() => {
    const panel = document.querySelector('.chem-console > .panel.is-active');
    const btn = [...panel.querySelectorAll('.btn-accent, .btn-honors')].find(b => !b.disabled);
    if (!btn) return false;
    btn.click();
    return true;
  });
  await page.waitForTimeout(280);
  if (committed) await shoot('committed');
  else console.log('    commit button never enabled — the gate did not open on these picks');
}

await browser.close();
server.close();
