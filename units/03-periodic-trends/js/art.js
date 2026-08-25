// art.js: Unit 3 mission-screen scene art.
// Visual geometry is preserved; student-visible captions use concise, factual chemistry.
const MONO = "'JetBrains Mono', ui-monospace, monospace";

const C = {
  ink: '#0d1b21', slate: '#37505b', steel: '#93aab5', steelLt: '#b7c6cd',
  teal: '#2a7d8a', teal3: '#4fa3ae', tealLt: '#8fd0d6',
  ember: '#c0772f', emberLt: '#e0a869', copper: '#c0772f',
  dim: '#bacdd4', card: '#e8eef0', paper: '#dfe6e4',
  gold: '#d8b054', silver: '#c9d2d6', tarnish: '#2a2b2f',
  crust: '#e9eef0', rust: '#8d4b2a', leaf: '#5f9e78', plum: '#8a5a9c'
};
const BENCH_BG = ['#12222a', '#1d3138'];
const DRAWER_BG = ['#141a20', '#242f37'];
const COPPER_BG = ['#1c1208', '#2e2113'];

const FAM = {
  alkali: '#c0504d', 'alkaline-earth': '#9a8c2b', transition: '#607d8b',
  metalloid: '#4a8f7b', 'post-transition': '#9c8aa0', nonmetal: '#3f8f5f',
  halogen: '#3a6fb0', noble: '#8a5a9c', hydrogen: '#5b6b9c'
};

function kit(id) {
  const defs = [];
  const url = n => `url(#${id}-${n})`;
  const stops = list => list.map(([o, c, a]) =>
    `<stop offset="${o}" stop-color="${c}"${a === undefined ? '' : ` stop-opacity="${a}"`}/>`).join('');
  const k = {
    defs,
    lin(n, list, horiz) {
      defs.push(`<linearGradient id="${id}-${n}" x1="0" y1="0" x2="${horiz ? 1 : 0}" y2="${horiz ? 0 : 1}">${stops(list)}</linearGradient>`);
      return url(n);
    },
    rad(n, list, { cx = '34%', cy = '28%', r = '76%' } = {}) {
      defs.push(`<radialGradient id="${id}-${n}" cx="${cx}" cy="${cy}" r="${r}">${stops(list)}</radialGradient>`);
      return url(n);
    },
    clip(n, shape) { defs.push(`<clipPath id="${id}-${n}">${shape}</clipPath>`); return url(n); },
    metal(n, [hi, base, sh]) { return k.lin(n, [[0, hi], [.3, base], [1, sh]]); },
    side(n, [sh, base, hi]) { return k.lin(n, [[0, sh], [.24, hi], [.55, base], [1, sh]], true); },
    orb(n, [hi, base, sh]) { return k.rad(n, [[0, hi], [.55, base], [1, sh]]); },
    glowAt(n, tint, op = .5) { return k.rad(n, [[0, tint, op], [.6, tint, op * .3], [1, tint, 0]], { cx: '50%', cy: '50%', r: '50%' }); }
  };
  return k;
}

const LABEL_FLOOR = 8;
const mono = (x, y, s, { size = 9, fill = C.dim, w = 500, anchor = 'middle', ls, boxed } = {}) =>
  `<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="${MONO}"`
  + ` font-size="${boxed ? size : Math.max(size, LABEL_FLOOR)}"`
  + ` font-weight="${w}" fill="${fill}"${ls ? ` letter-spacing="${ls}"` : ''}>${s}</text>`;

const crumbs = (seed = 3, n = 16, y0 = 78, y1 = 98) => {
  let s = seed, out = '';
  const rnd = () => (s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
  for (let i = 0; i < n; i++) {
    const x = 12 + rnd() * 376, y = y0 + rnd() * (y1 - y0), r = 0.5 + rnd() * 0.9;
    out += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}" fill="${C.steel}" opacity="${(0.12 + rnd() * 0.2).toFixed(2)}"/>`;
  }
  return out;
};

const benchTop = (k, y = 88) =>
  `<rect x="0" y="${y}" width="400" height="${100 - y}" fill="${k.lin('bench', [[0, '#2c4550'], [1, '#1a2b33']])}"/>`
  + `<rect x="0" y="${y}" width="400" height="1.4" fill="${C.steelLt}" opacity=".28"/>`
  + `<ellipse cx="150" cy="${y - 2}" rx="150" ry="26" fill="${k.glowAt('lamp', '#ffe6b0', .16)}"/>`;

const drawerTray = (k, x, y, w, h, walls = []) => {
  let out = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="${k.lin('tray', [[0, '#33434c'], [1, '#1e2a31']])}"`
    + ` stroke="${C.slate}" stroke-width="1.2"/>`
    + `<rect x="${x + 2}" y="${y + 2}" width="${w - 4}" height="2" fill="${C.steelLt}" opacity=".2"/>`;
  for (const wx of walls) out += `<rect x="${x + wx}" y="${y + 3}" width="1.4" height="${h - 6}" fill="${C.slate}" opacity=".85"/>`;
  return out;
};

const tile = (x, y, sym, { fill = C.slate, w = 26, h = 24, sub = null, dashed = false, dim = false } = {}) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="2.2" fill="${dashed ? 'none' : fill}"`
  + ` opacity="${dim ? .45 : 1}" stroke="${dashed ? C.steelLt : 'rgb(0 0 0 / 25%)'}" stroke-width="${dashed ? 1 : .8}"`
  + `${dashed ? ' stroke-dasharray="2.4 2"' : ''}/>`
  + mono(x + w / 2, y + (sub ? h / 2 + 1 : h / 2 + 3.5), sym, { size: sub ? 10 : 11, fill: dashed ? C.steelLt : '#fff', w: 600 })
  + (sub ? mono(x + w / 2, y + h - 4, sub, { size: 6.8, boxed: true, fill: dashed ? C.dim : 'rgb(255 255 255 / 82%)' }) : '');

const sheet = (k, x, y, w, h, { rows = 5, blank = -1, tilt = 0 } = {}) => {
  const face = k.lin('sheet', [[0, '#f2f4ef'], [1, '#cfd7d2']]);
  let out = `<g transform="rotate(${tilt} ${x + w / 2} ${y + h / 2})">`
    + `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="1.5" fill="${face}" stroke="${C.steel}" stroke-width=".8"/>`;
  const step = (h - 10) / rows;
  for (let i = 0; i < rows; i++) {
    const ry = y + 7 + i * step;
    if (i === blank) {
      out += `<rect x="${x + 4}" y="${ry - 3.4}" width="${w - 8}" height="${step * .78}" fill="${C.tarnish}"/>`;
    } else {
      out += `<rect x="${x + 4}" y="${ry}" width="${(w - 8) * (i % 2 ? .62 : .84)}" height="1.5" fill="${C.slate}" opacity=".55"/>`;
    }
  }
  return out + '</g>';
};

const loupe = (k, cx, cy, r = 13) =>
  `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${k.rad('lens', [[0, '#dff0f3', .5], [1, '#9fc6cd', .18]])}" stroke="${C.steelLt}" stroke-width="1.6"/>`
  + `<line x1="${cx + r * .72}" y1="${cy + r * .72}" x2="${cx + r * .72 + 9}" y2="${cy + r * .72 + 9}" stroke="${C.steel}" stroke-width="2.6" stroke-linecap="round"/>`;

const battCell = (k, n, x, y, w, h, { tint = '#3f6f7a', label = '' } = {}) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="2" fill="${k.side(n, ['#1b2b31', tint, '#cfe3e6'])}" stroke="rgb(0 0 0 / 30%)" stroke-width=".8"/>`
  + `<rect x="${x + w * .3}" y="${y - 2.6}" width="${w * .4}" height="2.8" rx="1" fill="${C.steelLt}"/>`
  + `<rect x="${x}" y="${y + h * .62}" width="${w}" height="1.6" fill="${C.ink}" opacity=".45"/>`
  + (label ? mono(x + w / 2, y + h + 9, label, { size: 7.4, fill: C.dim }) : '');

const padBoard = (k, n, x, y, { tarnished = false, w = 46, h = 30 } = {}) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="2" fill="${k.lin(n, [[0, '#1e4a3a'], [1, '#12301f']])}" stroke="rgb(0 0 0 / 35%)" stroke-width=".8"/>`
  + `<rect x="${x + 6}" y="${y + 8}" width="${w - 12}" height="9" rx="1.2" fill="${tarnished ? C.tarnish : C.gold}" stroke="${tarnished ? '#4a4b50' : '#a9832f'}" stroke-width=".7"/>`
  + (tarnished
    ? `<circle cx="${x + w / 2}" cy="${y + 12.5}" r="9" fill="${k.glowAt(n + 'h', '#3d3f45', .5)}"/>`
    : `<rect x="${x + 8}" y="${y + 9.4}" width="${(w - 16) * .5}" height="2" fill="#fff" opacity=".38"/>`)
  + `<rect x="${x + 6}" y="${y + 22}" width="${w - 12}" height="1.4" fill="${C.leaf}" opacity=".5"/>`;

const connector = (k, n, x, y, { pins = 9, plated = C.gold, corroded = false } = {}) => {
  let out = `<rect x="${x}" y="${y}" width="${pins * 6 + 8}" height="20" rx="2" fill="${k.lin(n, [[0, '#3a4a52'], [1, '#202c32']])}" stroke="rgb(0 0 0 / 30%)" stroke-width=".8"/>`;
  for (let i = 0; i < pins; i++) {
    const px = x + 5 + i * 6;
    out += `<rect x="${px}" y="${y + 4}" width="3.2" height="12" rx=".8" fill="${plated}"/>`;
    if (corroded && i % 2 === 0) out += `<rect x="${px}" y="${y + 4}" width="3.2" height="5" rx=".8" fill="${C.leaf}" opacity=".8"/>`;
  }
  return out + `<rect x="${x + 4}" y="${y + 1.6}" width="${pins * 6}" height="1.4" fill="#fff" opacity=".16"/>`;
};

const bin = (k, n, x, y, { label = '', tint = C.slate, on = false } = {}) =>
  `<path d="M${x} ${y} L${x + 26} ${y} L${x + 23} ${y + 26} L${x + 3} ${y + 26} Z" fill="${k.lin(n, [[0, tint], [1, '#1b262c']])}" stroke="${on ? C.teal3 : C.slate}" stroke-width="${on ? 1.6 : .9}"/>`
  + `<rect x="${x - 2}" y="${y - 3.4}" width="30" height="3.4" rx="1" fill="${C.steelLt}" opacity="${on ? .8 : .45}"/>`
  + (label ? mono(x + 13, y + 36, label, { size: 6.8, fill: on ? C.tealLt : C.dim }) : '');

const plot = (k, n, x, y, w, h, { pts, marks = [], tint = C.ember, fill = true, grid = true } = {}) => {
  const px = i => x + pts[i][0] * w, py = i => y + h - pts[i][1] * h;
  let out = grid
    ? `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="rgb(255 255 255 / 4%)" stroke="${C.slate}" stroke-width=".7"/>`
    + [.25, .5, .75].map(f => `<line x1="${x}" y1="${y + h * f}" x2="${x + w}" y2="${y + h * f}" stroke="${C.slate}" stroke-width=".4" opacity=".5"/>`).join('')
    : '';
  const d = pts.map((_, i) => `${i ? 'L' : 'M'}${px(i).toFixed(1)} ${py(i).toFixed(1)}`).join(' ');
  if (fill) out += `<path d="${d} L${x + w} ${y + h} L${x} ${y + h} Z" fill="${k.lin(n, [[0, tint, .32], [1, tint, 0]])}"/>`;
  out += `<path d="${d}" fill="none" stroke="${tint}" stroke-width="1.8" stroke-linejoin="round"/>`;
  pts.forEach((_, i) => {
    const big = marks.includes(i);
    out += `<circle cx="${px(i).toFixed(1)}" cy="${py(i).toFixed(1)}" r="${big ? 4 : 2.2}" fill="${big ? C.emberLt : tint}"${big ? ` stroke="#fff" stroke-width="1"` : ''}/>`;
  });
  return out;
};

const arrow = (x1, x2, y, { label = '', color = C.teal3, up = false } = {}) =>
  `<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="${color}" stroke-width="1.4" stroke-dasharray="3 2.5"/>`
  + `<path d="M${x2} ${y} l-5 -3 l0 6 Z" fill="${color}"/>`
  + (label ? mono((x1 + x2) / 2, y - 5, label, { size: 7.2, fill: color }) : '')
  + (up ? `<path d="M${x2 + 6} ${y + 6} l0 -12 l-3 4 M${x2 + 6} ${y - 6} l3 4" fill="none" stroke="${color}" stroke-width="1.2"/>` : '');

function scene(id, { caption, body, theme = 'bench', bg, frame, capColor }) {
  const honors = theme === 'copper';
  const [top, bot] = bg || (honors ? COPPER_BG : theme === 'drawer' ? DRAWER_BG : BENCH_BG);
  const frameColor = frame || (honors ? C.copper : C.teal);
  const frameOp = honors ? 0.5 : 0.38;
  const cap = capColor || (honors ? '#e0b483' : C.dim);
  const k = kit(id);
  const art = body(k);
  return `<svg viewBox="0 0 400 150" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">`
    + `<defs><linearGradient id="${id}-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${bot}"/></linearGradient>`
    + `<linearGradient id="${id}-scrim" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${bot}" stop-opacity="0"/><stop offset=".55" stop-color="${bot}" stop-opacity=".62"/><stop offset="1" stop-color="${bot}" stop-opacity=".94"/></linearGradient>`
    + k.defs.join('') + `</defs>`
    + `<rect width="400" height="150" fill="url(#${id}-bg)"/>${art}`
    + `<rect y="102" width="400" height="48" fill="url(#${id}-scrim)"/>`
    + `<path d="M1 150 V9 A8 8 0 0 1 9 1 H391 A8 8 0 0 1 399 9 V150" fill="none" stroke="${frameColor}" stroke-width="1" opacity="${frameOp}"/>`
    + mono(16, 138, caption, { size: 10.5, fill: cap, anchor: 'start', ls: '.05em' })
    + `</svg>`;
}

export const SCENE_ART = {
  'a-datasheet': scene('a-datasheet', {
    caption: 'MISSING ROW · USE THE PERIODIC PATTERN',
    body: k => benchTop(k, 90) + crumbs(4, 12)
      + sheet(k, 22, 16, 128, 74, { rows: 6, blank: 3, tilt: -1.5 })
      + loupe(k, 118, 54, 15)
      + mono(86, 12, 'GROUP III', { size: 7, fill: C.dim, ls: '.14em' })
      + tile(196, 20, 'Ca', { fill: FAM['alkaline-earth'], sub: '40.1' })
      + tile(196, 48, '?', { dashed: true, sub: '~44' })
      + tile(196, 76, 'Ti', { fill: FAM.transition, sub: '47.9' })
      + arrow(234, 264, 60, { label: 'predict' })
      + tile(276, 48, 'Sc', { fill: FAM.transition, sub: '44.96' })
      + mono(289, 84, 'found 1879', { size: 6.8, fill: C.tealLt })
      + mono(348, 34, 'MASS', { size: 6.6, fill: C.steel, ls: '.1em' })
      + mono(348, 46, 'OXIDE', { size: 6.6, fill: C.steel, ls: '.1em' })
      + mono(348, 58, 'CHARGE', { size: 6.6, fill: C.steel, ls: '.1em' })
      + [34, 46, 58].map(y => `<path d="M366 ${y - 3} l3.4 3.4 l6 -7" fill="none" stroke="${C.leaf}" stroke-width="1.6"/>`).join('')
  }),

  'a-warehouse': scene('a-warehouse', {
    caption: 'MASS ORDER FAILS · ATOMIC NUMBER FIXES IT',
    theme: 'drawer',
    body: k => drawerTray(k, 16, 30, 176, 60, [88])
      + tile(30, 42, 'K', { fill: FAM.alkali, sub: '39.10 u' })
      + tile(62, 42, 'Ar', { fill: FAM.noble, sub: '39.95 u' })
      + mono(62, 82, 'sorted by mass', { size: 6.8, fill: C.ember })
      + `<path d="M34 36 l24 0" stroke="${C.ember}" stroke-width="1.2"/>`
      + tile(118, 42, 'Ar', { fill: FAM.noble, sub: 'Z 18' })
      + tile(150, 42, 'K', { fill: FAM.alkali, sub: 'Z 19' })
      + mono(150, 82, 'sorted by Z', { size: 6.8, fill: C.tealLt })
      + arrow(200, 236, 56, { label: 'Moseley 1913' })
      + `<rect x="250" y="24" width="132" height="34" rx="2" fill="rgb(255 255 255 / 6%)" stroke="${C.slate}" stroke-width=".8"/>`
      + mono(256, 38, 'Co 58.93  before  Ni 58.69', { size: 7.4, fill: C.steelLt, anchor: 'start' })
      + mono(256, 50, 'mass runs opposite here', { size: 6.8, fill: C.dim, anchor: 'start' })
      + `<rect x="250" y="66" width="132" height="24" rx="2" fill="rgb(192 119 47 / 12%)" stroke="${C.ember}" stroke-width=".8"/>`
      + mono(316, 81, 'atomic number, not mass', { size: 7, fill: C.emberLt })
  }),

  'a-manual': scene('a-manual', {
    caption: 'EARLY MASS PATTERNS · USEFUL, BUT LIMITED',
    body: k => benchTop(k, 92) + crumbs(9, 10)
      + `<path d="M20 22 L196 18 L196 92 L20 96 Z" fill="${k.lin('leafL', [[0, '#e7ebe4'], [1, '#bcc6c0']])}" stroke="${C.steel}" stroke-width=".8"/>`
      + `<path d="M196 18 L372 22 L372 96 L196 92 Z" fill="${k.lin('leafR', [[0, '#dfe4dd'], [1, '#b2bcb6']])}" stroke="${C.steel}" stroke-width=".8"/>`
      + `<rect x="193" y="18" width="6" height="76" fill="${C.ink}" opacity=".22"/>`
      + [['Li', '6.9'], ['Na', '23.0'], ['K', '39.1']].map((e, i) => tile(34, 26 + i * 22, e[0], { fill: FAM.alkali, w: 22, h: 19, sub: e[1] })).join('')
      + [['Cl', '35.5'], ['Br', '79.9'], ['I', '126.9']].map((e, i) => tile(66, 26 + i * 22, e[0], { fill: FAM.halogen, w: 22, h: 19, sub: e[1] })).join('')
      + [['Ca', '40.1'], ['Sr', '87.6'], ['Ba', '137.3']].map((e, i) => tile(98, 26 + i * 22, e[0], { fill: FAM['alkaline-earth'], w: 22, h: 19, sub: e[1] })).join('')
      + `<path d="M126 45 l14 0 M126 45 l0 22 l14 0" fill="none" stroke="${C.slate}" stroke-width="1"/>`
      + mono(160, 50, 'middle ≈', { size: 7, fill: C.slate })
      + mono(160, 60, 'mean of two', { size: 7, fill: C.slate })
      + [0, 1, 2, 3, 4].map(i => tile(212 + i * 30, 34, '?', { dashed: true, w: 26, h: 22 })).join('')
      + `<line x1="208" y1="30" x2="352" y2="60" stroke="${C.ember}" stroke-width="2.2" opacity=".85"/>`
      + `<line x1="208" y1="60" x2="352" y2="30" stroke="${C.ember}" stroke-width="2.2" opacity=".85"/>`
      + mono(280, 78, 'pattern becomes unreliable', { size: 7.4, fill: '#7a3f22' })
      + mono(280, 90, 'atomic mass alone is not enough', { size: 6.8, fill: C.slate })
  }),

  'b-remote': scene('b-remote', {
    caption: 'ALKALINE CELL LEAK · IDENTIFY K+',
    body: k => benchTop(k, 90) + crumbs(2, 10)
      + `<rect x="26" y="14" width="66" height="78" rx="6" fill="${k.lin('case', [[0, '#3c4b52'], [1, '#1e282d']])}" stroke="rgb(0 0 0 / 35%)" stroke-width="1"/>`
      + `<rect x="34" y="34" width="50" height="48" rx="3" fill="#141c20" stroke="${C.slate}" stroke-width=".8"/>`
      + `<rect x="38" y="40" width="42" height="6" rx="1.5" fill="${C.steelLt}" opacity=".5"/>`
      + `<rect x="38" y="70" width="42" height="6" rx="1.5" fill="${C.steelLt}" opacity=".5"/>`
      + `<ellipse cx="59" cy="58" rx="26" ry="17" fill="${k.glowAt('bloom', C.crust, .42)}"/>`
      + [[46, 52, 4.4], [58, 62, 5.6], [70, 55, 3.8], [52, 66, 3.2], [66, 46, 2.8]].map(([cx, cy, r]) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${C.crust}" opacity=".82"/>`).join('')
      + mono(59, 100, 'leaked electrolyte', { size: 6.8, fill: C.dim })
      + battCell(k, 'cell', 128, 26, 22, 56, { tint: '#5a6b3f', label: 'alkaline AA' })
      + mono(186, 32, 'KOH electrolyte', { size: 8, fill: C.steelLt, anchor: 'start' })
      + mono(186, 44, 'K: Group 1', { size: 7.4, fill: C.dim, anchor: 'start' })
      + mono(186, 56, 'K+ in KOH', { size: 7.4, fill: C.dim, anchor: 'start' })
      + tile(186, 64, 'K', { fill: FAM.alkali, sub: '+1' })
      + arrow(220, 262, 76, { label: 'residue' })
      + `<path d="M300 30 a26 26 0 1 0 26 26" fill="none" stroke="${C.leaf}" stroke-width="1.6"/>`
      + mono(330, 42, 'remove cells', { size: 7.4, fill: C.leaf })
      + mono(330, 54, 'follow guidance', { size: 7.4, fill: C.leaf })
      + mono(330, 74, 'seal failure', { size: 6.8, fill: C.dim })
      + mono(330, 85, 'caused the leak', { size: 6.8, fill: C.dim })
  }),

  'b-contact': scene('b-contact', {
    caption: 'Ag AND Au · SAME GROUP, DIFFERENT MATERIAL BEHAVIOR',
    body: k => benchTop(k, 90) + crumbs(6, 12)
      + padBoard(k, 'left', 30, 30, { tarnished: true, w: 58, h: 38 })
      + mono(59, 80, 'silver plated', { size: 7.4, fill: C.dim })
      + mono(59, 91, 'sim score 8', { size: 6.8, fill: C.ember })
      + padBoard(k, 'right', 108, 30, { tarnished: false, w: 58, h: 38 })
      + mono(137, 80, 'gold plated', { size: 7.4, fill: C.dim })
      + mono(137, 91, 'sim score 3', { size: 6.8, fill: C.tealLt })
      + loupe(k, 150, 42, 12)
      + `<rect x="204" y="18" width="60" height="76" rx="3" fill="rgb(255 255 255 / 5%)" stroke="${C.slate}" stroke-width=".8"/>`
      + mono(234, 28, 'GROUP 11', { size: 6.6, fill: C.steel, ls: '.12em' })
      + tile(221, 32, 'Cu', { fill: FAM.transition, w: 26, h: 18 })
      + tile(221, 54, 'Ag', { fill: FAM.transition, w: 26, h: 18 })
      + tile(221, 76, 'Au', { fill: FAM.transition, w: 26, h: 18 })
      + arrow(272, 306, 42, { label: 'same group' })
      + arrow(272, 306, 74, { label: 'different element', color: C.emberLt })
      + mono(352, 38, 'conductors', { size: 7.4, fill: C.tealLt })
      + mono(352, 49, 'both metals', { size: 7.4, fill: C.tealLt })
      + mono(352, 70, 'corrosion', { size: 7.4, fill: C.emberLt })
      + mono(352, 81, 'behavior differs', { size: 7.4, fill: C.emberLt })
  }),

  'b-plastic': scene('b-plastic', {
    caption: 'BROMINATED PLASTIC · IDENTIFY Br, THEN FOLLOW GUIDANCE',
    theme: 'drawer',
    body: k => drawerTray(k, 14, 26, 150, 66)
      + `<path d="M26 40 L152 34 L146 84 L32 86 Z" fill="${k.lin('shell', [[0, '#43505a'], [1, '#232f36']])}" stroke="rgb(0 0 0 / 35%)" stroke-width="1"/>`
      + `<path d="M26 40 L152 34 L150 40 L28 45 Z" fill="#fff" opacity=".12"/>`
      + `<path d="M74 50 l12 -8 l12 8 l-6 4 l-6 -4 l-6 4 Z" fill="none" stroke="${C.steelLt}" stroke-width="1.2"/>`
      + mono(86, 70, '> ABS-FR <', { size: 7.6, fill: C.steelLt })
      + mono(86, 80, 'brominated', { size: 6.6, fill: C.dim })
      + [[176, 46, 9], [192, 62, 7], [172, 70, 6]].map(([x, y, s]) => `<path d="M${x} ${y} l${s} -${s * .5} l${s * .6} ${s} l-${s * .8} ${s * .5} Z" fill="#3d4a52" stroke="${C.slate}" stroke-width=".7"/>`).join('')
      + tile(212, 24, 'Br', { fill: FAM.halogen, sub: '-1' })
      + mono(225, 62, 'Group 17', { size: 7.2, fill: C.dim })
      + mono(225, 73, '7 valence e-', { size: 7.2, fill: C.dim })
      + mono(225, 84, 'common ion -1', { size: 7.2, fill: C.dim })
      + bin(k, 'ewaste', 288, 42, { label: 'electronics', tint: '#2c4a55', on: true })
      + bin(k, 'house', 336, 42, { label: 'household', tint: '#3a3f45', on: false })
      + `<line x1="336" y1="42" x2="362" y2="68" stroke="${C.ember}" stroke-width="2" opacity=".8"/>`
      + arrow(252, 282, 30, { label: '' })
      + mono(330, 20, 'disposal follows guidance', { size: 6.6, fill: C.tealLt })
  }),

  'c-cell': scene('c-cell', {
    caption: 'Li AND Na · SAME GROUP, DIFFERENT ATOMIC DATA',
    body: k => benchTop(k, 92) + crumbs(11, 10)
      + `<rect x="20" y="16" width="46" height="76" rx="6" fill="${k.lin('phone', [[0, '#39474f'], [1, '#1c262b']])}" stroke="rgb(0 0 0 / 35%)" stroke-width="1"/>`
      + `<rect x="24" y="22" width="38" height="58" rx="2" fill="#0e1a20"/>`
      + `<rect x="24" y="22" width="38" height="20" rx="2" fill="#fff" opacity=".07"/>`
      + mono(43, 100, 'the device', { size: 6.8, fill: C.dim })
      + `<circle cx="118" cy="46" r="16.7" fill="${k.orb('li', ['#e6b4b2', FAM.alkali, '#6d2a28'])}"/>`
      + mono(118, 50, 'Li', { size: 10, fill: '#fff', w: 600 })
      + mono(118, 72, '167 pm', { size: 6.8, fill: C.tealLt })
      + mono(118, 82, '6.94 u', { size: 6.8, fill: C.tealLt })
      + `<circle cx="186" cy="46" r="19" fill="${k.orb('na', ['#e6b4b2', FAM.alkali, '#6d2a28'])}"/>`
      + mono(186, 50, 'Na', { size: 10, fill: '#fff', w: 600 })
      + mono(186, 72, '190 pm', { size: 6.8, fill: C.emberLt })
      + mono(186, 82, '22.99 u', { size: 6.8, fill: C.emberLt })
      + mono(152, 22, 'GROUP 1 · COMMON ION +1', { size: 6.6, fill: C.steel, ls: '.08em' })
      + arrow(212, 246, 46, { label: 'compare atoms' })
      + battCell(k, 'small', 262, 30, 24, 44, { tint: '#3f6f7a', label: 'Li-ion' })
      + battCell(k, 'big', 306, 20, 24, 64, { tint: '#6b5b3f', label: 'Na-ion' })
      + mono(370, 44, 'atomic mass', { size: 6.8, fill: C.emberLt })
      + mono(370, 56, '≠ cell mass', { size: 6.8, fill: C.dim })
  }),

  'c-connector': scene('c-connector', {
    caption: 'CONTACT MATERIALS · PERIODIC DATA ARE ONE PART',
    body: k => benchTop(k, 92) + crumbs(7, 12)
      + connector(k, 'cu', 24, 34, { pins: 9, plated: '#b87333', corroded: true })
      + mono(55, 66, 'bare copper', { size: 7.4, fill: C.dim })
      + mono(55, 77, 'material note:', { size: 6.8, fill: C.emberLt })
      + mono(55, 88, 'corrodes more readily', { size: 6.4, fill: C.ember })
      + connector(k, 'au', 152, 34, { pins: 9, plated: C.gold })
      + mono(183, 66, 'gold plated', { size: 7.4, fill: C.dim })
      + mono(183, 77, 'material note:', { size: 6.8, fill: C.tealLt })
      + mono(183, 88, 'corrosion resistant', { size: 6.4, fill: C.tealLt })
      + loupe(k, 60, 40, 11)
      + `<rect x="256" y="18" width="126" height="72" rx="3" fill="rgb(255 255 255 / 5%)" stroke="${C.slate}" stroke-width=".8"/>`
      + mono(319, 28, 'SIMULATION SCORE', { size: 6.4, fill: C.steel, ls: '.1em' })
      + `<rect x="268" y="36" width="${15 * 4.4}" height="11" rx="1.5" fill="${C.ember}"/>`
      + mono(266, 58, 'Cu  15', { size: 7, fill: C.emberLt, anchor: 'start' })
      + `<rect x="268" y="64" width="${3 * 4.4}" height="11" rx="1.5" fill="${C.gold}"/>`
      + mono(266, 86, 'Au  3', { size: 7, fill: C.gold, anchor: 'start' })
      + mono(378, 44, 'EN 1.90', { size: 6.6, fill: C.dim, anchor: 'end' })
      + mono(378, 72, 'EN 2.54', { size: 6.6, fill: C.dim, anchor: 'end' })
  }),

  'c-case': scene('c-case', {
    caption: 'ATOMIC MASS ≠ MATERIAL DENSITY',
    theme: 'drawer',
    body: k => drawerTray(k, 12, 20, 186, 72, [96])
      + `<path d="M26 34 L92 28 L88 86 L30 88 Z" fill="${k.lin('al', [[0, '#c8d3d8'], [1, '#7d8d95']])}" stroke="rgb(0 0 0 / 30%)" stroke-width=".9"/>`
      + `<path d="M26 34 L92 28 L91 36 L28 41 Z" fill="#fff" opacity=".3"/>`
      + mono(59, 100, 'Al · 26.98 u', { size: 7, fill: C.tealLt })
      + `<path d="M116 34 L182 28 L178 86 L120 88 Z" fill="${k.lin('fe', [[0, '#9aa3a6'], [1, '#5c6467']])}" stroke="rgb(0 0 0 / 30%)" stroke-width=".9"/>`
      + [[134, 46], [162, 58], [140, 74]].map(([cx, cy]) => `<circle cx="${cx}" cy="${cy}" r="7" fill="${k.glowAt('r' + cx, C.rust, .55)}"/><circle cx="${cx}" cy="${cy}" r="2.2" fill="#2b3134"/>`).join('')
      + mono(149, 100, 'Fe · 55.85 u', { size: 7, fill: C.ember })
      + arrow(208, 242, 40, { label: 'atomic mass' })
      + arrow(208, 242, 72, { label: 'material data', color: C.tealLt })
      + `<rect x="254" y="26" width="128" height="26" rx="2" fill="rgb(79 163 174 / 14%)" stroke="${C.teal3}" stroke-width=".8"/>`
      + mono(258, 36, 'Al oxide can passivate', { size: 7.2, fill: C.tealLt, anchor: 'start' })
      + mono(258, 47, 'the surface', { size: 6.8, fill: C.dim, anchor: 'start' })
      + `<rect x="254" y="60" width="128" height="26" rx="2" fill="rgb(141 75 42 / 16%)" stroke="${C.rust}" stroke-width=".8"/>`
      + mono(258, 70, 'iron rust is often', { size: 7.2, fill: C.emberLt, anchor: 'start' })
      + mono(258, 81, 'less protective', { size: 6.8, fill: C.dim, anchor: 'start' })
  }),

  'h1-shielding': scene('h1-shielding', {
    caption: 'SIMPLIFIED Zeff MODEL · GENERAL PERIODIC TRENDS',
    theme: 'copper',
    body: k => {
      const row = [['Na', 190], ['Mg', 145], ['Al', 118], ['Si', 111], ['P', 98], ['S', 88], ['Cl', 79], ['Ar', 71]];
      const zeff = [1, 2, 3, 4, 5, 6, 7, 8];
      let out = mono(200, 11, 'PERIOD 3 · SAME CORE ELECTRONS, MORE PROTONS', { size: 7, fill: '#e0b483', ls: '.06em' });
      row.forEach(([sym, r], i) => {
        const cx = 34 + i * 47, R = r / 190 * 15 + 5;
        out += `<circle cx="${cx}" cy="50" r="${R.toFixed(1)}" fill="${k.orb('s' + i, ['#f0cfa8', '#b0762f', '#4a2c0c'])}"/>`
          + mono(cx, 53.5, sym, { size: 8, fill: '#fff', w: 600 })
          + mono(cx, 74, String(r), { size: 6.6, fill: '#d9b78e' })
          + mono(cx, 84, zeff[i].toFixed(0), { size: 6.6, fill: C.emberLt });
      });
      out += arrow(34, 364, 24, { label: 'radius generally falls; IE generally rises', color: '#e0b483' })
        + mono(200, 97, 'top: radius pm · bottom: model Zeff', { size: 6.4, fill: '#a98a67', ls: '.04em' });
      return out;
    }
  }),

  'h2-dip': scene('h2-dip', {
    caption: 'PERIOD 2 IONIZATION · GENERAL RISE WITH TWO DIPS',
    theme: 'copper',
    body: k => {
      const ie = [520, 899, 801, 1086, 1402, 1314, 1681, 2081];
      const syms = ['Li', 'Be', 'B', 'C', 'N', 'O', 'F', 'Ne'];
      const lo = 460, hi = 2140;
      const pts = ie.map((v, i) => [i / (ie.length - 1), (v - lo) / (hi - lo)]);
      let out = plot(k, 'ie', 46, 18, 300, 62, { pts, marks: [2, 5], tint: '#d99a4a' });
      syms.forEach((s, i) => out += mono(46 + i / 7 * 300, 96, s, { size: 7.4, fill: i === 2 || i === 5 ? '#f3c98a' : '#c9a377' }));
      out += mono(132, 34, 'Be → B', { size: 7, fill: '#f3c98a' })
        + mono(132, 44, 'higher-energy 2p', { size: 6.4, fill: '#c9a377' })
        + mono(258, 30, 'N → O', { size: 7, fill: '#f3c98a' })
        + mono(258, 40, 'electron pairing', { size: 6.4, fill: '#c9a377' })
        + mono(372, 26, 'kJ/mol', { size: 6.2, fill: '#a98a67' })
        + mono(24, 24, '2081', { size: 6.2, fill: '#a98a67', anchor: 'start' })
        + mono(24, 80, '520', { size: 6.2, fill: '#a98a67', anchor: 'start' });
      return out;
    }
  }),

  'cap-substitute': scene('cap-substitute', {
    caption: 'ESTIMATE THE RADIUS · APPLY THE ACTIVITY RULE',
    theme: 'copper',
    body: k => benchTop(k, 96)
      + sheet(k, 18, 14, 96, 76, { rows: 5, blank: 2 })
      + mono(66, 10, 'PERIOD 4', { size: 6.4, fill: '#c9a377', ls: '.12em' })
      + loupe(k, 92, 46, 12)
      + tile(140, 34, 'Co', { fill: FAM.transition, sub: '152 pm' })
      + tile(174, 34, '?', { dashed: true, sub: '~149' })
      + tile(208, 34, 'Cu', { fill: FAM.transition, sub: '145 pm' })
      + `<path d="M153 32 q21 -14 42 0" fill="none" stroke="#e0b483" stroke-width="1.2" stroke-dasharray="2.5 2"/>`
      + mono(174, 18, 'midpoint estimate', { size: 6.4, fill: '#e0b483' })
      + mono(174, 74, 'then check activity rule', { size: 6.8, fill: '#c9a377' })
      + `<rect x="256" y="26" width="52" height="56" rx="3" fill="rgb(255 255 255 / 8%)" stroke="#a98a67" stroke-width=".9" stroke-dasharray="3 2"/>`
      + `<path d="M266 40 q16 -6 32 0 q-16 8 -32 14 q16 -6 32 0 q-16 8 -32 14" fill="none" stroke="${C.steelLt}" stroke-width="1.8"/>`
      + mono(282, 92, 'the substitute', { size: 6.8, fill: '#c9a377' })
      + `<rect x="322" y="20" width="62" height="18" rx="2" fill="rgb(95 158 120 / 16%)" stroke="${C.leaf}" stroke-width=".8"/>`
      + mono(353, 32, 'fit', { size: 7, fill: '#8fd0a8' })
      + `<rect x="322" y="42" width="62" height="18" rx="2" fill="rgb(224 168 105 / 14%)" stroke="${C.emberLt}" stroke-width=".8"/>`
      + mono(353, 54, 'order', { size: 7, fill: '#f3c98a' })
      + `<rect x="322" y="64" width="62" height="18" rx="2" fill="rgb(141 75 42 / 20%)" stroke="${C.rust}" stroke-width=".8"/>`
      + mono(353, 76, 'do not fit', { size: 7, fill: '#e0a869' })
  })
};

export function sceneArt(id) { return SCENE_ART[id] || ''; }
