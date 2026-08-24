/*
 * The residual-scroll table in HANDOFF-COCKPIT-REFINEMENT.md §8.5, generated.
 *
 * That table was hand-typed twice and wrong once, which is the same failure cockpit-survey.mjs
 * exists to prevent for §5. This reads the numbers off the tree the same way: drive every unit,
 * visit every station, report the benches that still scroll.
 *
 * Usage, from the repo root:
 *   node units_new/tools/scroll-table.mjs             # a table, tallest first
 *   node units_new/tools/scroll-table.mjs --md        # the §8.5 markdown rows, to paste
 *   node units_new/tools/scroll-table.mjs --size 1366x625
 *
 * Env: PW_ROOT (checkout with Playwright, default ../Lab_studio).
 *
 * A bench appearing here is not a failure -- every one is inside a declared `scrollPorts` entry,
 * so nothing is clipped and the document never scrolls. It is the worklist, in order.
 */
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { readdirSync, existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = fileURLToPath(new URL('../../', import.meta.url));
const PW_ROOT = resolve(REPO, process.env.PW_ROOT ?? '../Lab_studio');

const argv = process.argv.slice(2);
const sizeArg = argv[argv.indexOf('--size') + 1];
const [W, H] = (argv.includes('--size') ? sizeArg : '1536x726').split('x').map(Number);
const asMarkdown = argv.includes('--md');

const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.woff2': 'font/woff2', '.pdf': 'application/pdf',
};

const server = await new Promise(r => {
  const s = createServer(async (req, res) => {
    try {
      let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
      if (p.endsWith('/')) p += 'index.html';
      res.writeHead(200, { 'content-type': MIME[extname(p)] ?? 'application/octet-stream' });
      res.end(await readFile(join(REPO, normalize(p))));
    } catch { res.writeHead(404).end('not found'); }
  });
  s.listen(0, '127.0.0.1', () => r(s));
});
const origin = 'http://127.0.0.1:' + server.address().port;

let chromium;
try { ({ chromium } = createRequire(join(PW_ROOT, 'package.json'))('playwright')); }
catch { console.error(`Playwright not found under ${PW_ROOT}.`); process.exit(2); }

const units = readdirSync(join(REPO, 'units_new'), { withFileTypes: true })
  .filter(d => d.isDirectory() && /^\d\d-/.test(d.name)
    && existsSync(join(REPO, 'units_new', d.name, 'index.html')))
  .map(d => d.name).sort();

const browser = await chromium.launch();
const rows = [];
let benches = 0;

for (const unit of units) {
  const page = await browser.newPage({ viewport: { width: W, height: H } });
  await page.goto(origin + '/units_new/' + unit + '/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(700);
  const stations = await page.$$eval('nav.station-nav .tab',
    ts => ts.map(t => t.getAttribute('aria-label')).filter(Boolean));
  // The Case File is the last tab and is the one station allowed to scroll by design.
  for (const st of stations.slice(0, -1)) {
    await page.click(`nav.station-nav [aria-label="${st}"]`).catch(() => {});
    await page.waitForTimeout(170);
    const r = await page.evaluate(() => {
      const p = document.querySelector('.chem-console > .panel.is-active');
      if (!p) return null;
      const tall = [...p.querySelectorAll(':scope > *')]
        .map(e => ({ tag: e.tagName.toLowerCase() + (typeof e.className === 'string' && e.className.trim()
          ? '.' + e.className.trim().split(/\s+/)[0] : ''), h: Math.round(e.getBoundingClientRect().height) }))
        .sort((a, b) => b.h - a.h)[0];
      return { scroll: p.scrollHeight - p.clientHeight, tall };
    });
    if (!r) continue;
    benches++;
    if (r.scroll > 0) rows.push({ unit, station: st, ...r });
  }
  await page.close();
}
await browser.close();
server.close();

rows.sort((a, b) => b.scroll - a.scroll);

if (asMarkdown) {
  console.log(`| unit | bench | scroll | tallest block |`);
  console.log(`|---|---|---|---|`);
  for (const r of rows) {
    console.log(`| ${r.unit.slice(0, 2)} | ${r.station} | ${r.scroll} | \`${r.tall.tag}\` ${r.tall.h}px |`);
  }
} else {
  console.log(`${rows.length} of ${benches} benches scroll at ${W}x${H}\n`);
  for (const r of rows) {
    console.log(`${String(r.scroll).padStart(5)}  ${r.unit.padEnd(28)} ${r.station.padEnd(24)} tallest: ${r.tall.tag} ${r.tall.h}px`);
  }
}
