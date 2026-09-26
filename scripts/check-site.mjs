import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { UNITS } from '../shared/js/teks.js';
import { SCENE_PHOTOS } from '../shared/js/scene-photo-manifest.js';
import { UNIT_PHOTOS } from '../shared/js/scene-media.js';

const root = fileURLToPath(new URL('../', import.meta.url));
const origin = process.argv[2];
const queue = ['index.html', ...UNITS.flatMap(u => [`units/${u.slug}/learn.html`, `units/${u.slug}/index.html`])];
for (const [unit, ids] of Object.entries(SCENE_PHOTOS)) {
  for (const id of ids) for (const version of [0, 1]) queue.push(`shared/assets/photos/missions/${unit}/${id}-${version}.webp`);
}
queue.push(...Object.values(UNIT_PHOTOS).map(name => `shared/assets/photos/${name}.webp`));
const checked = new Set();
let scripts = 0;
function add(from, ref) {
  if (!ref || /^(?:[a-z]+:|#|\/\/)/i.test(ref) || /[${}+]/.test(ref)) return;
  if (ref.includes('units_new/')) throw Error(`Obsolete active dependency: ${from} -> ${ref}`);
  const clean = ref.split(/[?#]/)[0];
  if (!clean || !/\.[a-z0-9]+$/i.test(clean)) return;
  const target = path.posix.normalize(path.posix.join(path.posix.dirname(from), clean));
  if (target.startsWith('../') || path.isAbsolute(target)) throw Error(`Escaping site path: ${from} -> ${ref}`);
  queue.push(target);
}
while (queue.length) {
  const file = queue.shift();
  if (checked.has(file)) continue;
  checked.add(file);
  const bytes = await fs.readFile(path.join(root, file));
  if (!bytes.length) throw Error(`Empty asset: ${file}`);
  if (/\.(?:html|js|css)$/.test(file)) {
    const source = bytes.toString('utf8');
    if (/^<<<<<<< |^>>>>>>> /m.test(source)) throw Error(`Unresolved merge: ${file}`);
    if (file.endsWith('.js')) {
      execFileSync(process.execPath, ['--check', file], { cwd: root, stdio: 'pipe' });
      scripts++;
    }
    if (file.endsWith('.html')) {
      for (const [, ref] of source.matchAll(/(?:src|href)=["']([^"']+)["']/g)) add(file, ref);
      for (const [, attrs, code] of source.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)) {
        if (!code.trim() || /importmap|application\//.test(attrs)) continue;
        execFileSync(process.execPath, ['--input-type=module', '--check'], { input: code, stdio: 'pipe' });
        scripts++;
      }
    }
    const imports = source.replace(/^\s*\/\/[^\n]*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '').replace(/<!--[\s\S]*?-->/g, '');
    for (const match of imports.matchAll(/\bfrom\s+['"]([^'"]+)['"]|\bimport\(\s*['"]([^'"]+)['"]|\bimport\s+['"]([^'"]+)['"]/g)) {
      const ref = match.slice(1).find(Boolean);
      if (ref.startsWith('.')) add(file, ref);
    }
    if (file.endsWith('.css')) for (const [, ref] of source.matchAll(/url\(\s*['"]?([^)'"\s]+)['"]?\s*\)/g)) add(file, ref);
  }
}
if (origin) {
  const files = [...checked];
  let cursor = 0;
  await Promise.all(Array.from({ length: 2 }, async () => {
    while (cursor < files.length) {
      const file = files[cursor++];
      const response = await fetch(new URL(file, origin), { method: 'HEAD' });
      if (!response.ok) throw Error(`${response.status}: ${file}`);
    }
  }));
}
console.log(`Site check passed: ${checked.size} reachable files, ${scripts} scripts parsed, all 392 mission photos${origin ? ', HTTP availability confirmed' : ''}.`);
