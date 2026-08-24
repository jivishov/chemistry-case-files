/* Does every .call-hint actually evaluate, and does it say something?
 *
 * HANDOFF-COCKPIT-REFINEMENT.md §3: "Say why a disabled control is disabled, in the row where
 * it lives. A dead primary button with no reason beside it was the highest-load moment on the
 * bench." This is the gate for that claim across all eleven units.
 *
 * A typo in an x-show or x-text throws inside Alpine, which shows up as a console error and a
 * span that never appears -- exactly the failure the hint exists to prevent, but silent. So:
 * walk every station of every unit with Honors off and on, and for each commit row report
 *   - any page or console error at all
 *   - a hint that is present but renders empty (an expression that evaluated to nothing)
 *   - a DISABLED primary key with no visible hint beside it, which is the state §3 calls the
 *     highest-load moment on the bench
 */
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = fileURLToPath(new URL('../../', import.meta.url));
const PW_ROOT = resolve(REPO, process.env.PW_ROOT ?? '../Lab_studio');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2', '.pdf': 'application/pdf' };
const server = await new Promise(r => {
  const s = createServer(async (req, res) => {
    try {
      let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
      if (p.endsWith('/')) p += 'index.html';
      res.writeHead(200, { 'content-type': MIME[extname(p)] ?? 'application/octet-stream' });
      res.end(await readFile(join(REPO, normalize(p))));
    } catch { res.writeHead(404).end('x'); }
  });
  s.listen(0, '127.0.0.1', () => r(s));
});
const origin = 'http://127.0.0.1:' + server.address().port;
const { chromium } = createRequire(join(PW_ROOT, 'package.json'))('playwright');
const browser = await chromium.launch();

/* Usage, from the repo root:
 *   node units_new/tools/hint-check.mjs
 * Env: PW_ROOT (checkout with Playwright, default ../Lab_studio). Exit 1 on any problem. */
const units = ['01-practices-matter', '02-atomic-structure', '03-periodic-trends',
  '04-bonding-geometry', '05-the-mole', '06-reactions-stoichiometry', '07-gas-laws',
  '08-solutions', '09-acids-bases', '10-thermochemistry', '11-nuclear'];

const probe = () => {
  const out = [];
  document.querySelectorAll('.chem-console > .panel.is-active .call-row').forEach(row => {
    const key = [...row.querySelectorAll('.btn-accent, .btn-honors')][0];
    if (!key) return;
    // A locked Honors block keeps its button in the DOM unpainted. Judging a row nobody can
    // see would report every gated Honors bench as mute.
    if (key.getBoundingClientRect().height <= 0) return;
    const hint = row.querySelector('.call-hint');
    const shown = hint && getComputedStyle(hint).display !== 'none'
      && hint.getBoundingClientRect().height > 0;
    out.push({
      label: (key.textContent || '').trim().slice(0, 26),
      disabled: !!key.disabled,
      hasHint: !!hint,
      shown: !!shown,
      text: hint ? (hint.textContent || '').trim() : null,
    });
  });
  return out;
};

let problems = 0;
for (const u of units) {
  const page = await browser.newPage({ viewport: { width: 1536, height: 726 } });
  const errs = [];
  page.on('pageerror', e => errs.push('pageerror: ' + String(e).slice(0, 180)));
  page.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text().slice(0, 180)); });
  await page.goto(origin + '/units_new/' + u + '/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(900);
  const stations = await page.$$eval('nav.station-nav .tab', ts => ts.map(t => t.getAttribute('aria-label')).filter(Boolean));

  const lines = [];
  for (const honors of [false, true]) {
    if (honors) {
      await page.click('.command-actions label.switch').catch(() => {});
      await page.waitForTimeout(250);
    }
    for (const st of stations.slice(0, -1)) {
      await page.click(`nav.station-nav [aria-label="${st}"]`).catch(() => {});
      await page.waitForTimeout(220);
      for (const r of await page.evaluate(probe)) {
        const tag = honors ? st + ' (honors)' : st;
        if (r.disabled && !r.shown) {
          lines.push(`    MUTE  ${tag} :: "${r.label}" disabled, no hint visible`);
          problems++;
        } else if (r.hasHint && r.shown && !r.text) {
          lines.push(`    EMPTY ${tag} :: "${r.label}" hint rendered empty`);
          problems++;
        } else if (!r.disabled && r.shown) {
          lines.push(`    STUCK ${tag} :: "${r.label}" enabled but hint still showing: "${r.text}"`);
          problems++;
        }
      }
    }
  }
  console.log(u + (lines.length || errs.length ? '' : '  ok'));
  for (const l of [...new Set(lines)]) console.log(l);
  if (errs.length) { console.log('    ERRORS: ' + [...new Set(errs)].slice(0, 3).join(' | ')); problems++; }
  await page.close();
}
await browser.close();
server.close();
console.log('\n' + (problems ? problems + ' problem(s)' : 'every commit row accounted for'));
process.exit(problems ? 1 : 0);
