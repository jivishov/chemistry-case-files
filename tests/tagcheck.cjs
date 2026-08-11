// tagcheck.cjs — quick HTML open/close tag balance check for a unit page.
// Usage: node tests/tagcheck.cjs units/NN-slug/index.html
// (A committed script avoids the shell backslash-escaping problems that make an
//  inline `node -e` one-liner report wrong counts on some shells.)
const fs = require('fs');
const file = process.argv[2];
if (!file) { console.error('usage: node tests/tagcheck.cjs <path-to-html>'); process.exit(2); }
const h = fs.readFileSync(file, 'utf8');
const tags = ['div', 'template', 'svg', 'g', 'button', 'select', 'table', 'thead', 'tbody', 'tr', 'aside', 'main', 'header', 'label'];
let bad = 0;
for (const t of tags) {
  const open = (h.match(new RegExp('<' + t + '(\\s|>)', 'g')) || []).length;
  const close = (h.match(new RegExp('</' + t + '>', 'g')) || []).length;
  if (open !== close) bad++;
  console.log(open === close ? 'ok  ' : 'BAD ', t, open, close);
}
console.log(bad ? `\n${bad} tag(s) unbalanced` : '\nall balanced');
process.exit(bad ? 1 : 0);
