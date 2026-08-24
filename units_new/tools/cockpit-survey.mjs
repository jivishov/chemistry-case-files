/*
 * Regenerates the per-unit cockpit-refinement survey from the tree itself.
 *
 * HANDOFF-COCKPIT-REFINEMENT.md §5 carries this table, and a hand-maintained table is a
 * table that is wrong by the second unit. Every column here is read from the files, so the
 * output is the state of the tree rather than the state of somebody's notes:
 *
 *   resizer     units_new/shared/columns.js imported by the unit's index.html
 *   call-row    the .call-row class on at least one commit row
 *   reference   the mission column's Reference card is a <details>, not a <section>
 *   floor       LABEL_FLOOR declared in the unit's js/art.js
 *   labels      in-SVG label sizes below the 8-unit floor, out of all authored sizes
 *
 * Usage, from the repo root:
 *   node units_new/tools/cockpit-survey.mjs           # the table
 *   node units_new/tools/cockpit-survey.mjs --json     # same rows, machine-readable
 *   node units_new/tools/cockpit-survey.mjs --md       # the §5 markdown table, to paste
 *
 * Exit code is 0 always: this reports, it does not gate. The gates are npm test and
 * tests/unit5a-layout.test.mjs.
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const UNITS_NEW = fileURLToPath(new URL('../', import.meta.url));

const read = p => (existsSync(p) ? readFileSync(p, 'utf8') : '');

/* The authored in-SVG label sizes. Every unit's art.js passes them the same way -- as a
   `size:` option to that unit's mono() helper -- so one pattern reads all eleven. The
   helper's own `size = 9` default is not counted: an unspecified size is not an authored
   decision, and it already clears the floor.
   `boxed` on the same call is the declared opt-out -- a subscript that lives in the few
   units between a symbol's baseline and its tile's bottom edge, which the floor would print
   through the symbol -- so those are counted apart from the exposure rather than inside it. */
const labelSizes = art =>
  [...art.matchAll(/\{[^{}]*?\bsize:\s*([0-9.]+)[^{}]*?\}/g)]
    .map(m => ({ size: parseFloat(m[1]), boxed: /\bboxed\b/.test(m[0]) }));

/* Every unit emits its in-SVG type through exactly one `<text` site, inside mono(). That is
   what makes the floor a one-line change per unit -- and what a second site would quietly
   undo, so it is reported rather than assumed. */
const textSites = art => (art.match(/<text\b/g) ?? []).length;

export function survey() {
  return readdirSync(UNITS_NEW, { withFileTypes: true })
    .filter(d => d.isDirectory() && /^\d\d-/.test(d.name))
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(d => {
      const dir = join(UNITS_NEW, d.name);
      const html = read(join(dir, 'index.html'));
      const art = read(join(dir, 'js/art.js'));
      const sizes = labelSizes(art);
      return {
        unit: d.name,
        resizer: /shared\/columns\.js/.test(html) && /mountColumnResizers\s*\(/.test(html),
        callRow: /\bcall-row\b/.test(html),
        reference: /<details[^>]*class="[^"]*\bscreen-reference\b/.test(html),
        labelFloor: /\bLABEL_FLOOR\b/.test(art),
        under: sizes.filter(s => s.size < 8 && !s.boxed).length,
        boxed: sizes.filter(s => s.size < 8 && s.boxed).length,
        sizes: sizes.length,
        textSites: textSites(art),
      };
    });
}

const rows = survey();

if (process.argv.includes('--json')) {
  console.log(JSON.stringify(rows, null, 2));
} else {
  const mark = ok => (ok ? '✅' : '—');
  /* With a floor in place every un-boxed label clears it, so the exposure is zero and the
     only sub-floor type left is the declared opt-out. That is what "done" means here. */
  const labels = r => r.labelFloor
    ? 'done' + (r.boxed ? ` (${r.boxed} boxed)` : '')
    : `${r.under} / ${r.sizes}`;
  if (process.argv.includes('--md')) {
    console.log('| unit | resizer | `call-row` | reference `<details>` | `LABEL_FLOOR` | labels < 8 units |');
    console.log('|---|---|---|---|---|---|');
    for (const r of rows) {
      console.log(`| ${r.unit} | ${mark(r.resizer)} | ${mark(r.callRow)} | ${mark(r.reference)} | ${mark(r.labelFloor)} | ${labels(r)} |`);
    }
  } else {
    const w = Math.max(...rows.map(r => r.unit.length));
    console.log('unit'.padEnd(w) + '  resizer  call-row  reference  floor  labels < 8u');
    for (const r of rows) {
      console.log(r.unit.padEnd(w) +
        '  ' + mark(r.resizer).padEnd(7) +
        '  ' + mark(r.callRow).padEnd(8) +
        '  ' + mark(r.reference).padEnd(9) +
        '  ' + mark(r.labelFloor).padEnd(5) +
        '  ' + labels(r));
    }
    const done = rows.filter(r => r.resizer && r.callRow && r.reference && r.labelFloor);
    console.log('\n' + done.length + ' of ' + rows.length + ' units carry all four shared patterns.');
    const leaky = rows.filter(r => r.textSites !== 1);
    if (leaky.length) {
      console.log('in-SVG type escapes mono() in: ' +
        leaky.map(r => `${r.unit} (${r.textSites} <text sites)`).join(', '));
    }
  }
}
