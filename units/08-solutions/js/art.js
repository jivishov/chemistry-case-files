// art.js - Unit 8 scene illustrations for Solutions & Solubility.
// Each 400×150 SVG is rendered in the mission screen. Visual text is concise,
// chemistry-centered, and must not imply that the activity simulation is a measurement.

const MONO = "'JetBrains Mono', ui-monospace, monospace";

const C = {
  teal: '#2a7d8a', teal7: '#1d5b66', teal3: '#79b0ba', tealLt: '#cfe6ea',
  ink: '#08141a', dim: '#9fc2c9', steel: '#687a82', steelLt: '#aebfc6',
  pale: '#cfdbe0', white: '#e8f2f4', slate: '#3a5560',
  copper: '#c0772f', copper7: '#95591f', copper1: '#f1ddc8',
  success: '#2f8f5b', warn: '#b8881f', danger: '#bf4a30', ember: '#f0a02f',
  water: '#2f7d92', waterDk: '#12414f', waterLt: '#8fc9d6',
  concrete: '#4a5259', concreteDk: '#2b3238', grate: '#5d666d',
  solid: '#e4e9ea', solidSh: '#a9b6ba', crystal: '#dff0f4',
  tea: '#a4602a', honey: '#d79a2b', oil: '#6b7a4a', purple: '#8a4fb5', purpleLt: '#c79ae0',
  tile: '#3c4c52', counter: '#5a4636', night: '#101b26',
  cation: '#e07a45', anion: '#5aa9c4', card: '#f2efe6'
};

const PLANT_BG  = ['#0a232c', '#123842'];
const ROOM_BG   = ['#1a1c19', '#2b2a23'];
const COPPER_BG = ['#1c1208', '#2e2113'];

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
    rad(n, list, { cx = '36%', cy = '30%', r = '78%' } = {}) {
      defs.push(`<radialGradient id="${id}-${n}" cx="${cx}" cy="${cy}" r="${r}">${stops(list)}</radialGradient>`);
      return url(n);
    },
    clip(n, shape) {
      defs.push(`<clipPath id="${id}-${n}">${shape}</clipPath>`);
      return url(n);
    },
    glass(n, [sh, base, hi]) { return k.lin(n, [[0, sh], [.22, hi], [.52, base], [1, sh]], true); },
    orb(n, [hi, base, sh]) { return k.rad(n, [[0, hi], [.55, base], [1, sh]]); }
  };
  return k;
}

const LABEL_FLOOR = 8;
const mono = (x, y, s, { size = 9, fill = C.dim, w = 500, anchor = 'middle', ls, boxed } = {}) =>
  `<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="${MONO}"`
  + ` font-size="${boxed ? size : Math.max(size, LABEL_FLOOR)}"`
  + ` font-weight="${w}" fill="${fill}"${ls ? ` letter-spacing="${ls}"` : ''}>${s}</text>`;

const rng = seed => { let s = seed; return () => (s = (s * 1103515245 + 12345) % 2147483648) / 2147483648; };

const plant = (floorY = 92, { door = false } = {}) =>
  `<path d="M0 0 H186 L74 ${floorY} H0 Z" fill="${C.tealLt}" opacity=".05"/>`
  + `<g opacity=".5"><rect x="0" y="6" width="400" height="9" rx="4.5" fill="${C.concrete}"/>`
  + `<path d="M0 8.5 H400" stroke="${C.steelLt}" stroke-width="1" opacity=".45"/>`
  + `<g fill="${C.grate}"><rect x="66" y="0" width="5" height="8"/><rect x="228" y="0" width="5" height="8"/>`
  + `<rect x="330" y="0" width="5" height="8"/></g></g>`
  + `<g fill="${C.concrete}" opacity=".3"><rect x="24" y="15" width="20" height="${floorY - 15}"/>`
  + `<rect x="356" y="15" width="24" height="${floorY - 15}"/></g>`
  + (door
    ? `<rect x="286" y="24" width="86" height="${floorY - 24}" fill="#8fa6ad" opacity=".18"/>`
      + `<rect x="286" y="24" width="86" height="${floorY - 24}" fill="none" stroke="${C.steelLt}" stroke-width="1.2" opacity=".5"/>`
    : '')
  + `<rect x="0" y="${floorY}" width="400" height="${150 - floorY}" fill="${C.concreteDk}"/>`
  + `<g stroke="${C.grate}" stroke-width="1" opacity=".5">`
  + [0, 1, 2, 3, 4, 5, 6, 7].map(i => `<path d="M${i * 52} ${floorY} V150"/>`).join('') + `</g>`
  + `<path d="M0 ${floorY} H400" stroke="${C.steelLt}" stroke-width="1.8" opacity=".5"/>`
  + `<path d="M0 ${floorY + 3.5} H400" stroke="#061015" stroke-width="1.2" opacity=".55"/>`;

const breakRoom = (counterY = 90, { window: win = true } = {}) =>
  `<rect width="400" height="${counterY}" fill="${C.tile}" opacity=".55"/>`
  + `<g stroke="#20292d" stroke-width="1" opacity=".45">`
  + [22, 44, 66].map(y => `<path d="M0 ${y} H400"/>`).join('')
  + [40, 80, 120, 160, 200, 240, 280, 320, 360].map(x => `<path d="M${x} 0 V${counterY}"/>`).join('') + `</g>`
  + (win
    ? `<rect x="268" y="10" width="112" height="56" rx="2" fill="#6f8b96" opacity=".3"/>`
      + `<rect x="268" y="10" width="112" height="56" rx="2" fill="none" stroke="${C.steelLt}" stroke-width="1.4" opacity=".55"/>`
      + `<path d="M324 10 V66 M268 38 H380" stroke="${C.steelLt}" stroke-width="1.2" opacity=".45"/>`
    : '')
  + `<path d="M0 0 H150 L54 ${counterY} H0 Z" fill="#ffe9c2" opacity=".05"/>`
  + `<rect x="0" y="${counterY}" width="400" height="${150 - counterY}" fill="${C.counter}"/>`
  + `<path d="M0 ${counterY} H400" stroke="#c8a878" stroke-width="1.8" opacity=".45"/>`
  + `<path d="M0 ${counterY + 3.5} H400" stroke="#1a1207" stroke-width="1.2" opacity=".5"/>`;

const beaker = (x, yTop, w, h, { k, n = 'bk', level = .68, tint = null, solid = 0, ions = 0, ionTint = null, seed = 3, lip = true, label = null } = {}) => {
  const g = k ? k.glass(n, ['#16323b', '#2c6675', '#a6d3dd']) : '#2c6675';
  const yL = yTop + h * (1 - level), floor = yTop + h;
  const sh = solid ? 4 + solid * (h * .3) : 0;
  let inner = `<path d="M${x + 1.5} ${yL.toFixed(1)} h${w - 3} V${floor - 2.5} h${-(w - 3)} Z" fill="${tint || C.water}" opacity="${tint ? .62 : .42}"/>`
    + `<path d="M${x + 1.5} ${yL.toFixed(1)} h${w - 3}" stroke="${tint || C.waterLt}" stroke-width="1.5" opacity=".95"/>`;
  if (ions) {
    const rnd = rng(seed);
    for (let i = 0; i < ions; i++) {
      inner += `<circle cx="${(x + 4 + rnd() * (w - 8)).toFixed(1)}" cy="${(yL + 4 + rnd() * (floor - yL - 8 - sh)).toFixed(1)}" r="1.7" fill="${ionTint || C.waterLt}" opacity=".85"/>`;
    }
  }
  if (solid) {
    inner += `<path d="M${x + 2} ${floor - 2.5} q${w * .22} ${-sh} ${w * .5} ${-sh * .82} q${w * .26} ${sh * .2} ${w * .26} ${sh * .82} Z" fill="${C.solid}" opacity=".92"/>`
      + `<path d="M${x + 2} ${floor - 2.5} q${w * .22} ${-sh} ${w * .5} ${-sh * .82}" fill="none" stroke="#ffffff" stroke-width="1" opacity=".6"/>`;
    const rnd2 = rng(seed + 11);
    for (let i = 0; i < 5; i++) {
      inner += `<rect x="${(x + 5 + rnd2() * (w - 12)).toFixed(1)}" y="${(floor - 5 - rnd2() * sh).toFixed(1)}" width="2.4" height="2.4" fill="${C.solidSh}" opacity=".9"/>`;
    }
  }
  return `<g>`
    + `<path d="M${x} ${yTop} v${h - 5} a5 5 0 0 0 5 5 h${w - 10} a5 5 0 0 0 5 -5 V${yTop}" fill="${g}" opacity=".38" stroke="${C.steelLt}" stroke-width="1.4"/>`
    + inner
    + `<rect x="${x + 3}" y="${yTop + 4}" width="2.6" height="${h - 12}" rx="1.3" fill="#ffffff" opacity=".32"/>`
    + (lip ? `<path d="M${x - 2} ${yTop} h${w + 4}" stroke="${C.steelLt}" stroke-width="1.6" stroke-linecap="round"/>` : '')
    + (label ? mono(x + w / 2, yTop - 5, label, { size: 7.5, fill: C.pale, w: 700 }) : '')
    + `</g>`;
};

const basin = (x, y, w, h, { k, n = 'bs', level = .72, tint = null, sludge = 0, weir = false } = {}) => {
  const yL = y + h * (1 - level);
  const water = k ? k.lin(n, [[0, tint || '#3a8ba0'], [1, C.waterDk]]) : (tint || C.water);
  return `<g>`
    + `<path d="M${x} ${y} v${h} h${w} V${y}" fill="none" stroke="${C.concrete}" stroke-width="6" stroke-linejoin="round"/>`
    + `<path d="M${x} ${y} v${h} h${w} V${y}" fill="none" stroke="${C.steelLt}" stroke-width="1" opacity=".35"/>`
    + `<rect x="${x + 3}" y="${yL.toFixed(1)}" width="${w - 6}" height="${(y + h - 3 - yL).toFixed(1)}" fill="${water}" opacity=".8"/>`
    + `<path d="M${x + 3} ${yL.toFixed(1)} h${w - 6}" stroke="${C.waterLt}" stroke-width="1.4" opacity=".8"/>`
    + (sludge ? `<path d="M${x + 3} ${y + h - 3} h${w - 6} v${-sludge} q${-(w - 6) * .3} ${sludge * .55} ${-(w - 6) * .55} ${-sludge * .1} q${-(w - 6) * .28} ${sludge * .5} ${-(w - 6) * .45} ${sludge * .1} Z" fill="${C.solidSh}" opacity=".85"/>` : '')
    + (weir ? `<path d="M${x - 12} ${yL - 8} h14 v6 h-14 z" fill="${C.concrete}"/><path d="M${x + 2} ${yL - 2} q3 6 0 10" fill="none" stroke="${C.waterLt}" stroke-width="2" opacity=".7"/>` : '')
    + `</g>`;
};

const SOL = {
  KNO3:  [13, 22, 32, 46, 64, 85, 110, 138, 169, 205, 246],
  NaNO3: [73, 80, 88, 96, 104, 114, 124, 136, 148, 163, 180],
  NH4Cl: [29, 33, 37, 41, 46, 50, 55, 60, 66, 71, 77],
  KCl:   [28, 31, 34, 37, 40, 43, 46, 48, 51, 54, 56],
  NaCl:  [35.7, 35.8, 36, 36.3, 36.6, 37, 37.3, 37.8, 38.4, 39, 39.8],
  KClO3: [3.3, 5.2, 7.4, 10.5, 14, 19, 24, 31, 38, 47, 57]
};
const solAt = (key, t) => {
  const d = SOL[key], i = Math.max(0, Math.min(9, Math.floor(t / 10))), f = (t - i * 10) / 10;
  return d[i] + (d[i + 1] - d[i]) * f;
};

const solChart = (x, y, w, h, { keys = ['KNO3'], mark = null, sMax = 250, colors = {}, tLab = true, sLab = true, band = null } = {}) => {
  const PX = t => x + (t / 100) * w, PY = s => y + h - Math.min(1, s / sMax) * h;
  const COL = { KNO3: C.ember, NaNO3: C.waterLt, NH4Cl: C.success, KCl: C.copper1, NaCl: C.teal3, KClO3: C.purpleLt };
  let out = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#07171e" opacity=".55"/><g stroke="${C.steel}" stroke-width=".7" opacity=".4">`
    + [.25, .5, .75].map(f => `<path d="M${x} ${(y + h * f).toFixed(1)} H${x + w}"/>`).join('')
    + [.25, .5, .75].map(f => `<path d="M${(x + w * f).toFixed(1)} ${y} V${y + h}"/>`).join('') + `</g>`;
  if (band) out += `<rect x="${PX(band[0]).toFixed(1)}" y="${y}" width="${(PX(band[1]) - PX(band[0])).toFixed(1)}" height="${h}" fill="${C.copper}" opacity=".12"/>`;
  keys.forEach(key => {
    const pts = SOL[key].map((s, i) => `${PX(i * 10).toFixed(1)} ${PY(s).toFixed(1)}`);
    out += `<path d="M${pts.join(' L')}" fill="none" stroke="${colors[key] || COL[key]}" stroke-width="2" stroke-linecap="round"/>`
      + mono(PX(100) - 2, PY(SOL[key][10]) - 4, key, { size: 7, fill: colors[key] || COL[key], anchor: 'end', w: 700 });
  });
  out += `<path d="M${x} ${y} V${y + h} H${x + w}" fill="none" stroke="${C.steelLt}" stroke-width="1.2" opacity=".8"/>`;
  if (mark) {
    const s = solAt(mark.key, mark.t), mx = PX(mark.t), my = PY(s);
    out += `<path d="M${mx.toFixed(1)} ${y + h} V${my.toFixed(1)} H${x}" fill="none" stroke="${C.white}" stroke-width="1.2" stroke-dasharray="3 3" opacity=".9"/>`
      + `<circle cx="${mx.toFixed(1)}" cy="${my.toFixed(1)}" r="3.4" fill="${C.white}" stroke="${COL[mark.key]}" stroke-width="2"/>`
      + (mark.tText ? mono(mx, y + h + 9, mark.tText, { size: 7, fill: C.white, w: 700 }) : '')
      + (mark.sText ? mono(x - 4, my + 3, mark.sText, { size: 7.5, fill: C.white, anchor: 'end', w: 700 }) : '');
  }
  if (tLab) out += mono(x + w - 2, y + h + 9, 'TEMPERATURE  C', { size: 7, fill: C.steel, anchor: 'end', ls: '.06em' });
  if (sLab) out += `<g transform="translate(${x - 15},${y + h / 2}) rotate(-90)">` + mono(0, 0, 'g / 100 g H2O', { size: 7, fill: C.steel, ls: '.06em' }) + `</g>`;
  return out;
};

const jarRow = (x, y, states, { k, gap = 34, w = 26, h = 34 } = {}) =>
  states.map((st, i) => `<g>`
    + beaker(x + i * gap, y, w, h, { k, n: `jar${i}`, level: .7, tint: st.tint || null, solid: st.solid || 0, ions: st.ions || 0, ionTint: st.ionTint, seed: 5 + i * 7, lip: false })
    + `<rect x="${x + i * gap + w / 2 - 1}" y="${y - 12}" width="2" height="${h * .6 + 12}" fill="${C.steelLt}" opacity=".8"/>`
    + `<rect x="${x + i * gap + w / 2 - 5}" y="${y + h * .55}" width="10" height="3" rx="1.5" fill="${C.steelLt}" opacity=".9"/>`
    + (st.label ? mono(x + i * gap + w / 2, y + h + 10, st.label, { size: 7, fill: st.labelFill || C.dim, w: 700 }) : '') + `</g>`).join('')
  + `<path d="M${x - 6} ${y - 12} H${x + states.length * gap - gap + w + 6}" stroke="${C.steelLt}" stroke-width="2" opacity=".55"/>`;

const balance = (x, y, { mass = '0.00 g', tint = C.solid, heap = 1 } = {}) =>
  `<g><rect x="${x}" y="${y + 22}" width="66" height="20" rx="3" fill="#1b262c" stroke="${C.steelLt}" stroke-width="1.4"/>`
  + `<rect x="${x + 6}" y="${y + 27}" width="42" height="10" rx="1.5" fill="#04120f" stroke="${C.steel}" stroke-width=".8"/>`
  + mono(x + 27, y + 35, mass, { size: 7.5, fill: C.success, w: 700 })
  + `<circle cx="${x + 58}" cy="${y + 32}" r="3" fill="${C.steel}"/><rect x="${x + 8}" y="${y + 18}" width="50" height="4" rx="2" fill="${C.steelLt}"/>`
  + `<path d="M${x + 14} ${y + 18} q19 ${-8 - heap * 8} 38 0 z" fill="${tint}" opacity=".95"/>`
  + `<path d="M${x + 14} ${y + 18} q19 ${-8 - heap * 8} 38 0" fill="none" stroke="#ffffff" stroke-width=".9" opacity=".5"/></g>`;

const volFlask = (cx, yTop, h, { k, n = 'vf', tint = C.water, fill = .92, mark = true, label = null } = {}) => {
  const bw = h * .62, by = yTop + h * .42, bh = h * .58;
  const g = k ? k.glass(n, ['#16323b', '#2c6675', '#a6d3dd']) : '#2c6675';
  const markY = yTop + h * .30;
  const yL = fill >= .9 ? markY : by + bh * (1 - fill);
  return `<g><path d="M${cx - 5} ${yTop} h10 v${h * .42} q${bw / 2} ${h * .16} ${bw / 2 - 5} ${bh * .58} q${-bw * .06} ${bh * .42} ${-bw / 2 + 5 - (bw / 2 - 5)} 0 h${-(bw - 10)} q${-bw * .44} ${-bh * .06} ${-bw / 2 + 5} ${-bh * .58} q${-bw * .06} ${-h * .26} 5 ${-h * .42} z" fill="${g}" opacity=".4" stroke="${C.steelLt}" stroke-width="1.4"/>`
    + `<path d="M${cx - bw / 2 + 3} ${by + 6} q${bw / 2 - 3} -10 ${bw - 6} 0 v${bh - 12} q${-(bw / 2 - 3)} 6 ${-(bw - 6)} 0 z" fill="${tint}" opacity=".6"/>`
    + `<rect x="${cx - 4.5}" y="${yL.toFixed(1)}" width="9" height="${(by + 8 - yL).toFixed(1)}" fill="${tint}" opacity=".6"/><path d="M${cx - 4.5} ${yL.toFixed(1)} h9" stroke="${tint}" stroke-width="1.6"/>`
    + (mark ? `<path d="M${cx - 8} ${markY.toFixed(1)} h16" stroke="${C.white}" stroke-width="1.2"/>` + mono(cx + 11, markY + 3, 'mark', { size: 7, fill: C.white, anchor: 'start' }) : '')
    + `<rect x="${cx - 6.5}" y="${yTop - 3}" width="13" height="5" rx="2" fill="${C.steelLt}"/>`
    + (label ? mono(cx, yTop + h + 9, label, { size: 7.5, fill: C.pale, w: 700 }) : '') + `</g>`;
};

const graduate = (x, yTop, w, h, { k, n = 'gc', tint = C.water, fill = .5, ticks = 6, label = null } = {}) => {
  const g = k ? k.glass(n, ['#16323b', '#2c6675', '#a6d3dd']) : '#2c6675';
  const yL = yTop + h * (1 - fill);
  let t = '';
  for (let i = 1; i <= ticks; i++) t += `<path d="M${x + w - 8} ${(yTop + (h / (ticks + 1)) * i).toFixed(1)} h6" stroke="${C.pale}" stroke-width=".9" opacity=".7"/>`;
  return `<g><path d="M${x} ${yTop} v${h} h${w} V${yTop}" fill="${g}" opacity=".4" stroke="${C.steelLt}" stroke-width="1.3"/>`
    + `<path d="M${x + 1.5} ${yL.toFixed(1)} h${w - 3} V${yTop + h - 1.5} h${-(w - 3)} Z" fill="${tint}" opacity=".62"/><path d="M${x + 1.5} ${yL.toFixed(1)} h${w - 3}" stroke="${tint}" stroke-width="1.5"/>`
    + t + `<path d="M${x - 4} ${yTop + h} h${w + 8} v4 h${-(w + 8)} z" fill="${C.steelLt}" opacity=".8"/>`
    + (label ? mono(x + w / 2, yTop - 5, label, { size: 7.5, fill: C.pale, w: 700 }) : '') + `</g>`;
};

const ionPair = (x, y, { k, n = 'ion', cat = '2+', an = '2-', gap = 26, lock = false, tint1 = C.cation, tint2 = C.anion } = {}) => {
  const g1 = k ? k.orb(n + 'a', ['#ffe1cd', tint1, '#5c2a12']) : tint1;
  const g2 = k ? k.orb(n + 'b', ['#dff2f8', tint2, '#16414f']) : tint2;
  return `<g><circle cx="${x}" cy="${y}" r="9" fill="${g1}"/>` + mono(x, y + 3.5, cat, { size: 8, fill: '#3a1607', w: 700 })
    + `<circle cx="${x + gap}" cy="${y}" r="9" fill="${g2}"/>` + mono(x + gap, y + 3.5, an, { size: 8, fill: '#08272f', w: 700 })
    + (lock ? `<path d="M${x + 9} ${y} h${gap - 18}" stroke="${C.white}" stroke-width="2"/>` : `<path d="M${x + 10} ${y} h${gap - 20} m0 0 l-4 -3 m4 3 l-4 3" fill="none" stroke="${C.pale}" stroke-width="1.3" stroke-linecap="round"/>`) + `</g>`;
};

const crystals = (x, y, w, { n = 7, seed = 4, tint = C.crystal, size = 6 } = {}) => {
  const rnd = rng(seed);
  let out = '';
  for (let i = 0; i < n; i++) {
    const cx = x + (i + .5) * (w / n) + (rnd() - .5) * 6, s = size * (.6 + rnd() * .7), cy = y - s * .3;
    out += `<g transform="translate(${cx.toFixed(1)},${cy.toFixed(1)}) rotate(${(rnd() * 40 - 20).toFixed(1)})"><path d="M${-s / 2} 0 l${s * .3} ${-s} h${s * .4} l${s * .3} ${s} z" fill="${tint}" opacity=".95"/><path d="M${-s / 2} 0 l${s * .3} ${-s}" stroke="#ffffff" stroke-width=".8" opacity=".7"/></g>`;
  }
  return out;
};

const waterMol = (x, y, s = 1, { tint = C.waterLt } = {}) =>
  `<g transform="translate(${x},${y}) scale(${s})"><circle cx="0" cy="0" r="8" fill="${tint}"/><circle cx="-9" cy="-7" r="5" fill="${C.white}"/><circle cx="9" cy="-7" r="5" fill="${C.white}"/>`
  + mono(0, 12, 'δ−', { size: 7, fill: C.danger, w: 700 }) + mono(-14, -12, 'δ+', { size: 7, fill: C.warn, w: 700 }) + mono(14, -12, 'δ+', { size: 7, fill: C.warn, w: 700 }) + `</g>`;

const chainMol = (x, y, s = 1, { tint = C.oil, len = 5 } = {}) => {
  let out = `<g transform="translate(${x},${y}) scale(${s})">`;
  for (let i = 0; i < len; i++) {
    const cx = i * 11 - (len - 1) * 5.5, cy = i % 2 ? 4 : -4;
    out += `<circle cx="${cx}" cy="${cy}" r="5.5" fill="${tint}"/>`;
    if (i) out += `<path d="M${cx - 11} ${i % 2 ? -4 : 4} L${cx} ${cy}" stroke="${tint}" stroke-width="2.6"/>`;
  }
  return out + mono(0, 16, 'nonpolar', { size: 7, fill: C.steel }) + `</g>`;
};

const dosePump = (x, y, { tint = C.success, label = null } = {}) =>
  `<g><rect x="${x}" y="${y}" width="32" height="26" rx="3" fill="#1b262c" stroke="${C.steelLt}" stroke-width="1.3"/><circle cx="${x + 10}" cy="${y + 13}" r="6" fill="#08161c" stroke="${C.steel}" stroke-width="1"/><path d="M${x + 10} ${y + 13} V${y + 8}" stroke="${tint}" stroke-width="1.6"/><rect x="${x + 20}" y="${y + 7}" width="7" height="12" rx="1.5" fill="${tint}" opacity=".7"/>`
  + (label ? mono(x + 16, y - 4, label, { size: 7, fill: tint, w: 700 }) : '') + `</g>`;

const slip = (x, y, w, h, { title = null, lines = [], tint = C.card } = {}) => {
  let body = '';
  lines.forEach(([lab, val, hot], i) => {
    const ly = y + (title ? 24 : 14) + i * 13;
    body += mono(x + 7, ly, lab, { size: 8, fill: hot ? C.copper7 : C.slate, anchor: 'start', w: hot ? 700 : 500 })
      + (val === undefined ? '' : mono(x + w - 7, ly, val, { size: 8.5, fill: hot ? C.copper7 : C.ink, anchor: 'end', w: 700 }));
  });
  return `<g><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="${tint}" stroke="${C.steelLt}" stroke-width="1.2"/>`
    + (title ? `<path d="M${x} ${y + 13} H${x + w}" stroke="${C.steelLt}" stroke-width=".9"/>` + mono(x + 7, y + 9.5, title, { size: 7, fill: C.steel, anchor: 'start', ls: '.1em', w: 700 }) : '') + body + `</g>`;
};

const threshold = (x, yBot, w, h, { value = .5, limit = .7, tint = C.teal3, limLabel = 'LIMIT', valLabel = null, over = null } = {}) => {
  const vY = yBot - value * h, lY = yBot - limit * h;
  const hot = over === null ? value > limit : over;
  return `<g><rect x="${x}" y="${yBot - h}" width="${w}" height="${h}" fill="#08181f" opacity=".7" stroke="${C.steelLt}" stroke-width="1"/><rect x="${x + 1}" y="${vY.toFixed(1)}" width="${w - 2}" height="${(yBot - vY - 1).toFixed(1)}" fill="${hot ? C.danger : tint}" opacity=".75"/><path d="M${x - 6} ${lY.toFixed(1)} H${x + w + 6}" stroke="${C.warn}" stroke-width="1.4" stroke-dasharray="4 3"/>`
    + mono(x + w + 8, lY + 3, limLabel, { size: 7, fill: C.warn, anchor: 'start', w: 700 })
    + (valLabel ? mono(x + w / 2, vY - 5, valLabel, { size: 7.5, fill: hot ? C.danger : tint, w: 700 }) : '') + `</g>`;
};

function scene(id, { caption, body, theme = 'plant', bg, frame, capColor }) {
  const honors = theme === 'copper';
  const [top, bot] = bg || (honors ? COPPER_BG : theme === 'room' ? ROOM_BG : PLANT_BG);
  const frameColor = frame || (honors ? C.copper : C.teal);
  const frameOp = frame ? 0.45 : honors ? 0.5 : 0.38;
  const cap = capColor || (honors ? '#e0b483' : C.dim);
  const k = kit(id);
  const art = body(k);
  return `<svg viewBox="0 0 400 150" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><defs><linearGradient id="${id}-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${bot}"/></linearGradient><linearGradient id="${id}-scrim" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${bot}" stop-opacity="0"/><stop offset=".55" stop-color="${bot}" stop-opacity=".62"/><stop offset="1" stop-color="${bot}" stop-opacity=".94"/></linearGradient>${k.defs.join('')}</defs><rect width="400" height="150" fill="url(#${id}-bg)"/>${art}<rect y="102" width="400" height="48" fill="url(#${id}-scrim)"/><path d="M1 150 V9 A8 8 0 0 1 9 1 H391 A8 8 0 0 1 399 9 V150" fill="none" stroke="${frameColor}" stroke-width="1" opacity="${frameOp}"/>${mono(16, 138, caption, { size: 10.5, fill: cap, anchor: 'start', ls: '.05em' })}</svg>`;
}

export const SCENE_ART = {
  'a-tea': scene('a-tea', { caption: 'POLAR WATER · COMPARE SOLUTE–WATER ATTRACTIONS', theme: 'room', body: k =>
    breakRoom(90)
    + beaker(26, 26, 34, 64, { k, n: 'tea', level: .78, tint: C.tea, solid: .85, seed: 9, label: 'iced tea' })
    + `<g fill="${C.white}" opacity=".55"><rect x="31" y="42" width="11" height="9" rx="2" transform="rotate(-12 36 46)"/><rect x="44" y="49" width="10" height="8" rx="2" transform="rotate(9 49 53)"/></g>`
    + beaker(80, 26, 34, 64, { k, n: 'wat', level: .78, ions: 16, ionTint: C.waterLt, seed: 21, label: 'water' })
    + `<g transform="translate(126,30) rotate(24)"><path d="M0 0 h16 v22 a4 4 0 0 1 -4 4 h-8 a4 4 0 0 1 -4 -4 z" fill="${C.pale}" stroke="${C.steel}" stroke-width="1.1"/><rect x="1" y="-5" width="14" height="6" rx="2" fill="${C.steelLt}"/><g fill="${C.steel}"><circle cx="5" cy="-2" r=".9"/><circle cx="9" cy="-2.6" r=".9"/><circle cx="12" cy="-2" r=".9"/></g></g>`
    + mono(44, 100, 'undissolved solid', { size: 7.5, fill: C.ember, w: 700 })
    + mono(140, 100, 'dissolved particles', { size: 7.5, fill: '#5fd39a', anchor: 'start', w: 700 })
    + waterMol(196, 40, .95) + mono(196, 70, 'water is polar', { size: 7.5, fill: C.waterLt, w: 700 })
    + slip(246, 16, 138, 74, { title: 'ACTIVITY GUIDE', lines: [['bonding', 'classify'], ['water solubility', 'high / low', true], ['', ''], ['compare', 'polarity']] })
  }),

  'a-shed': scene('a-shed', { caption: 'NONPOLAR SAMPLE · LOW WATER SOLUBILITY', body: k =>
    plant(92)
    + `<g><path d="M22 40 h40 v46 a3 3 0 0 1 -3 3 H25 a3 3 0 0 1 -3 -3 z" fill="${C.oil}" stroke="${C.steelLt}" stroke-width="1.3"/><rect x="26" y="30" width="14" height="11" rx="2" fill="${C.steelLt}"/><rect x="27" y="50" width="30" height="20" rx="2" fill="${C.card}" opacity=".85"/>${mono(42, 63, 'SOLVENT', { size: 7, fill: C.ink, w: 700 })}</g>`
    + `<g fill="${C.waterLt}" opacity=".75"><ellipse cx="76" cy="86" rx="7" ry="4"/><ellipse cx="90" cy="88" rx="5" ry="3"/><ellipse cx="66" cy="89" rx="4" ry="2.5"/></g>`
    + mono(80, 100, 'separate liquid phases', { size: 7.5, fill: C.waterLt, w: 700 })
    + beaker(122, 24, 40, 66, { k, n: 'smp', level: .72, seed: 3, label: 'water sample' })
    + `<path d="M124 43 h36 v7 h-36 z" fill="${C.oil}" opacity=".8"/><path d="M124 43 h36" stroke="#c9d38f" stroke-width="1.2" opacity=".8"/>`
    + mono(160, 100, 'low mutual solubility', { size: 7.5, fill: '#9fb06a', anchor: 'start', w: 700 })
    + chainMol(238, 32, .95) + waterMol(238, 74, .8)
    + `<path d="M280 26 l10 12 M290 26 l-10 12" stroke="${C.danger}" stroke-width="1.8" stroke-linecap="round"/>`
    + mono(302, 35, 'nonpolar', { size: 8, fill: C.oil, anchor: 'start', w: 700 })
    + mono(302, 50, 'low solubility', { size: 8, fill: C.oil, anchor: 'start' })
    + mono(302, 65, 'in polar water', { size: 8, fill: C.oil, anchor: 'start' })
  }),

  'a-basin': scene('a-basin', { caption: 'WATER POLARITY · PARTICLE INTERACTIONS MATTER', body: k =>
    plant(92)
    + jarRow(20, 22, [
      { tint: C.teal, ions: 12, ionTint: C.waterLt, label: 'dissolved', labelFill: C.success },
      { solid: .9, label: 'separate', labelFill: C.danger },
      { tint: C.teal7, ions: 6, solid: .35, label: 'partial', labelFill: C.warn }
    ], { k })
    + dosePump(134, 30, { label: 'SAMPLE' })
    + `<path d="M150 56 V70 h18" fill="none" stroke="${C.steelLt}" stroke-width="3" stroke-linecap="round"/>`
    + basin(178, 34, 132, 56, { k, n: 'bs', level: .78, sludge: 7, weir: true })
    + `<g fill="${C.waterLt}" opacity=".75"><circle cx="206" cy="60" r="2.6"/><circle cx="236" cy="72" r="2.6"/><circle cx="266" cy="58" r="2.6"/><circle cx="288" cy="70" r="2.6"/><circle cx="250" cy="50" r="2.6"/></g>`
    + mono(244, 100, 'dissolved particles in water', { size: 7.5, fill: C.waterLt, w: 700 })
    + mono(244, 30, 'AQUEOUS PHASE', { size: 7.5, fill: C.dim, ls: '.1em', w: 700 })
    + mono(338, 54, 'low-solubility', { size: 7.5, fill: C.solidSh, anchor: 'start', w: 700 })
    + mono(338, 69, 'material stays', { size: 7.5, fill: C.solidSh, anchor: 'start' })
    + mono(338, 84, 'separate', { size: 7.5, fill: C.solidSh, anchor: 'start' })
  }),

  'b-honey': scene('b-honey', { caption: 'SAMPLE JAR · ABOVE EQUILIBRIUM SOLUBILITY', theme: 'room', body: k => {
    const g = k.glass('jar', ['#4a3105', '#a8761b', '#f0cd7c']);
    return breakRoom(90)
      + `<g><path d="M34 30 h58 v52 a6 6 0 0 1 -6 6 H40 a6 6 0 0 1 -6 -6 z" fill="${g}" opacity=".85" stroke="${C.steelLt}" stroke-width="1.4"/><rect x="30" y="20" width="66" height="11" rx="3" fill="${C.copper7}" stroke="${C.steelLt}" stroke-width="1.1"/>${crystals(38, 86, 50, { n: 7, seed: 6, tint: '#f4e3b4', size: 8 })}<g fill="#fff3cf" opacity=".8"><circle cx="52" cy="52" r="2.4"/><circle cx="74" cy="46" r="2"/><circle cx="66" cy="66" r="2.6"/></g></g>`
      + mono(63, 100, 'crystallization can begin', { size: 7.5, fill: C.honey, w: 700 })
      + `<circle cx="86" cy="14" r="2.4" fill="${C.copper1}"/><path d="M86 18 V26" stroke="${C.copper1}" stroke-width="1" stroke-dasharray="2 2"/>`
      + threshold(132, 90, 22, 64, { value: .92, limit: .68, tint: C.honey, limLabel: 'SOL LIMIT', valLabel: 'amount' })
      + mono(143, 100, 'at this T', { size: 7, fill: C.pale })
      + slip(232, 14, 152, 76, { title: 'CLASSIFY', lines: [['unsaturated', 'below'], ['saturated', 'at limit'], ['SUPERSATURATED', 'above', true], ['electrolyte?', 'check solute']] });
  } }),

  'b-salt': scene('b-salt', { caption: 'BRINE TANK · SATURATION LEAVES EXCESS SOLID', body: k =>
    plant(92, { door: true })
    + `<rect x="286" y="24" width="86" height="68" fill="#9fb6bd" opacity=".2"/><g fill="${C.solid}" opacity=".8">${[0,1,2,3,4,5,6,7,8].map(i => `<rect x="${294 + (i * 9) % 74}" y="${62 + (i % 3) * 8}" width="2.6" height="2.6"/>`).join('')}</g>`
    + mono(329, 100, 'excess solid remains', { size: 7, fill: C.pale })
    + beaker(30, 22, 62, 68, { k, n: 'brine', level: .8, tint: '#2e7f8f', solid: .9, ions: 20, ionTint: C.waterLt, seed: 12, label: 'brine tank' })
    + `<path d="M28 34 h66" stroke="${C.warn}" stroke-width="1.3" stroke-dasharray="4 3"/>`
    + mono(96, 37, 'SATURATED', { size: 7, fill: C.warn, anchor: 'start', w: 700 })
    + mono(61, 100, 'solid at equilibrium', { size: 7.5, fill: C.solidSh, w: 700 })
    + `<g><rect x="164" y="22" width="44" height="30" rx="3" fill="#1b262c" stroke="${C.steelLt}" stroke-width="1.3"/><circle cx="176" cy="37" r="6" fill="${C.success}" opacity=".9"/><circle cx="176" cy="37" r="10" fill="${C.success}" opacity=".25"/>${mono(196, 40, 'ON', { size: 8, fill: C.success, w: 700 })}<path d="M172 52 V82 h-58" fill="none" stroke="${C.steelLt}" stroke-width="2"/><path d="M198 52 V90 h-104" fill="none" stroke="${C.steelLt}" stroke-width="2"/></g>`
    + mono(186, 64, 'conducts current', { size: 8, fill: '#5fd39a', w: 700 })
    + mono(186, 78, 'mobile ions', { size: 7.5, fill: C.dim })
    + threshold(228, 90, 20, 62, { value: .68, limit: .68, tint: C.teal3, limLabel: 'LIMIT', valLabel: 'at it', over: false })
  }),

  'b-tank': scene('b-tank', { caption: 'SUPERSATURATED · METASTABLE ABOVE THE LIMIT', body: k => {
    const g = k.glass('tk', ['#12313a', '#2a6b7c', '#9dcbd7']);
    return plant(92)
      + `<g><path d="M30 26 h72 v44 l-36 22 -36 -22 z" fill="${g}" opacity=".55" stroke="${C.steelLt}" stroke-width="1.5"/><rect x="26" y="18" width="80" height="9" rx="3" fill="${C.concrete}" stroke="${C.steelLt}" stroke-width="1"/><path d="M33 40 h66 v28 l-33 20 -33 -20 z" fill="#3b8ea2" opacity=".55"/><path d="M33 40 h66" stroke="${C.waterLt}" stroke-width="1.4"/><g fill="${C.waterLt}" opacity=".7"><circle cx="52" cy="54" r="1.8"/><circle cx="72" cy="62" r="1.8"/><circle cx="63" cy="48" r="1.8"/><circle cx="84" cy="52" r="1.8"/><circle cx="58" cy="72" r="1.8"/></g><g stroke="${C.steelLt}" stroke-width="2.4" opacity=".8"><path d="M36 70 V92"/><path d="M96 70 V92"/></g></g>`
      + `<path d="M28 40 h76" stroke="${C.warn}" stroke-width="1.3" stroke-dasharray="4 3"/>`
      + mono(66, 14, 'SAMPLE SOLUTION', { size: 7.5, fill: C.dim, ls: '.08em', w: 700 })
      + `<g transform="translate(126,60)"><path d="M0 0 l10 -14 -3 12 h8 l-13 16 4 -14 z" fill="${C.ember}"/></g>`
      + mono(140, 92, 'nucleation', { size: 7.5, fill: C.ember, w: 700 })
      + threshold(178, 90, 22, 66, { value: .93, limit: .66, tint: C.teal3, limLabel: 'SOL LIMIT', valLabel: 'amount' })
      + slip(252, 16, 132, 74, { title: 'SOLUTION STATE', lines: [['amount', 'above limit', true], ['state', 'supersaturated', true], ['behavior', 'metastable'], ['nucleation', 'may crystallize']] });
  } }),

  'c-tea': scene('c-tea', { caption: 'SOLUBILITY CURVE · READ THE MARKED TEMPERATURE', theme: 'room', body: k =>
    breakRoom(90, { window: false })
    + beaker(20, 24, 40, 66, { k, n: 'glass', level: .78, tint: C.tea, solid: .8, seed: 4, label: 'sample' })
    + `<g fill="${C.white}" opacity=".5"><rect x="26" y="40" width="12" height="10" rx="2"/><rect x="42" y="48" width="11" height="9" rx="2"/></g>`
    + `<g><rect x="70" y="46" width="7" height="44" rx="3.5" fill="#0b1a21" stroke="${C.steelLt}" stroke-width="1.1"/><rect x="71.5" y="72" width="4" height="17" rx="2" fill="${C.waterLt}"/><circle cx="73.5" cy="92" r="5" fill="${C.waterLt}" stroke="${C.steelLt}" stroke-width="1"/></g>`
    + mono(74, 40, '10 C', { size: 7.5, fill: C.waterLt, w: 700 })
    + solChart(112, 12, 200, 74, { keys: ['KNO3', 'NaNO3', 'KClO3'], mark: { key: 'KNO3', t: 10, tText: '10', sText: '22' } })
    + mono(320, 42, 'read the', { size: 8, fill: C.white, anchor: 'start', w: 700 })
    + mono(320, 57, 'highlighted', { size: 8, fill: C.white, anchor: 'start' })
    + mono(320, 72, 'curve', { size: 8, fill: C.white, anchor: 'start' })
  }),

  'c-rate': scene('c-rate', { caption: 'DISSOLVING RATE ≠ EQUILIBRIUM SOLUBILITY', body: k =>
    plant(92)
    + beaker(18, 30, 38, 58, { k, n: 'stir', level: .74, tint: C.teal7, ions: 14, seed: 2, label: 'stirred' })
    + `<rect x="35.5" y="16" width="3" height="42" rx="1.5" fill="${C.steelLt}"/><path d="M28 62 q9 -6 18 0" fill="none" stroke="${C.steelLt}" stroke-width="2.2"/>`
    + beaker(70, 30, 38, 58, { k, n: 'still', level: .74, tint: C.teal7, ions: 3, solid: .8, seed: 15, label: 'unstirred' })
    + mono(37, 100, 'faster mixing', { size: 7.5, fill: '#5fd39a', w: 700 }) + mono(89, 100, 'slower mixing', { size: 7.5, fill: C.ember, w: 700 })
    + solChart(140, 12, 168, 74, { keys: ['KNO3', 'NH4Cl', 'NaCl'], mark: { key: 'NH4Cl', t: 50, tText: '50', sText: '50' }, sLab: true })
    + mono(320, 28, 'temperature', { size: 7.5, fill: C.ember, anchor: 'start', w: 700 })
    + mono(320, 41, 'can change', { size: 7.5, fill: C.ember, anchor: 'start' })
    + mono(320, 54, 'solubility', { size: 7.5, fill: C.ember, anchor: 'start' })
    + mono(320, 76, 'stirring', { size: 7.5, fill: C.steelLt, anchor: 'start', w: 700 })
    + mono(320, 89, 'changes rate', { size: 7.5, fill: C.steelLt, anchor: 'start' })
  }),

  'c-basin': scene('c-basin', { caption: 'COOLING · COMPARE DISSOLVED AMOUNT WITH THE CURVE', body: k =>
    plant(92)
    + basin(20, 34, 116, 56, { k, n: 'bs', level: .76, sludge: 9 })
    + `<g fill="${C.waterLt}" opacity=".8"><circle cx="46" cy="56" r="1.8"/><circle cx="72" cy="64" r="1.8"/><circle cx="100" cy="54" r="1.8"/><circle cx="60" cy="72" r="1.8"/><circle cx="112" cy="70" r="1.8"/></g>`
    + crystals(28, 86, 100, { n: 8, seed: 19, tint: C.solidSh, size: 5 })
    + mono(78, 100, 'crystals may form', { size: 7.5, fill: C.solidSh, w: 700 })
    + `<g><rect x="146" y="40" width="7" height="42" rx="3.5" fill="#0b1a21" stroke="${C.steelLt}" stroke-width="1.1"/><rect x="147.5" y="68" width="4" height="15" rx="2" fill="${C.waterLt}"/><circle cx="149.5" cy="86" r="5" fill="${C.waterLt}" stroke="${C.steelLt}" stroke-width="1"/></g>`
    + solChart(186, 12, 152, 74, { keys: ['KNO3', 'NaNO3', 'NH4Cl'], mark: { key: 'KNO3', t: 30, tText: 'T', sText: 'S' } })
    + mono(346, 42, 'at / below:', { size: 7.5, fill: C.success, anchor: 'start', w: 700 })
    + mono(346, 56, 'not over', { size: 7.5, fill: C.success, anchor: 'start' })
    + mono(346, 75, 'above:', { size: 7.5, fill: C.danger, anchor: 'start', w: 700 })
    + mono(346, 89, 'supersaturated', { size: 7.5, fill: C.danger, anchor: 'start' })
  }),

  'd-kettle': scene('d-kettle', { caption: 'ACTIVITY MODEL · SOLUBILITY RULES PREDICT A SOLID', theme: 'room', body: k => {
    const g = k.glass('kt', ['#20282c', '#59656c', '#b7c4c9']);
    return breakRoom(90, { window: false })
      + `<g><path d="M26 34 h56 q8 0 8 8 v34 q0 8 -8 8 H34 q-8 0 -8 -8 z" fill="${g}" opacity=".9" stroke="${C.steelLt}" stroke-width="1.4"/><path d="M90 44 q16 12 0 26" fill="none" stroke="${C.steelLt}" stroke-width="3.4"/><rect x="40" y="26" width="26" height="9" rx="3" fill="${C.steelLt}"/><path d="M31 52 h46 v22 H31 z" fill="#3b8ea2" opacity=".45"/><rect x="36" y="70" width="36" height="4" rx="2" fill="${C.steel}"/>${crystals(34, 71, 40, { n: 6, seed: 8, tint: C.solid, size: 5 })}</g>`
      + mono(58, 100, 'solid deposit', { size: 7.5, fill: C.solid, w: 700 })
      + ionPair(128, 30, { k, n: 'p1', cat: 'Ca', an: 'CO3', gap: 30 })
      + `<path d="M172 30 h18" fill="none" stroke="${C.pale}" stroke-width="1.3"/>`
      + `<g transform="translate(206,22)"><rect x="0" y="0" width="16" height="16" rx="2" fill="${C.solid}"/><path d="M0 5 h16 M0 11 h16 M5 0 v16 M11 0 v16" stroke="${C.solidSh}" stroke-width=".9"/></g>`
      + mono(214, 70, 'insoluble', { size: 7.5, fill: C.solid, w: 700 }) + mono(214, 82, 'solid forms', { size: 7.5, fill: C.solid })
      + ionPair(258, 62, { k, n: 'p2', cat: 'Na', an: 'Cl', gap: 30 }) + mono(258, 95, 'soluble: remains aqueous', { size: 7.5, fill: C.waterLt, w: 700 })
      + slip(306, 14, 78, 60, { title: 'RULE SET', lines: [['carbonate', 'usually no'], ['nitrate', 'yes'], ['Group 1', 'yes']] });
  } }),

  'd-basin': scene('d-basin', { caption: 'DOUBLE REPLACEMENT · CLASSIFY BOTH PRODUCTS', body: k =>
    plant(92)
    + dosePump(20, 16, { label: 'MIX' })
    + `<path d="M36 42 V56" stroke="${C.steelLt}" stroke-width="3" stroke-linecap="round"/>`
    + basin(20, 44, 240, 48, { k, n: 'bs', level: .8, sludge: 8, weir: false })
    + ionPair(74, 60, { k, n: 'in', cat: 'M+', an: 'X−', gap: 24 })
    + `<path d="M112 60 h14" fill="none" stroke="${C.pale}" stroke-width="1.2"/>`
    + `<g transform="translate(136,52)"><rect x="0" y="0" width="15" height="15" rx="2" fill="${C.solid}"/><path d="M0 5 h15 M0 10 h15 M5 0 v15 M10 0 v15" stroke="${C.solidSh}" stroke-width=".9"/></g>`
    + mono(143, 30, 'insoluble product', { size: 7, fill: C.solid, w: 700 }) + mono(143, 42, 'forms a solid', { size: 7, fill: C.solid })
    + ionPair(186, 62, { k, n: 'out', cat: 'A+', an: 'Y−', gap: 26 }) + mono(199, 84, 'soluble product stays aqueous', { size: 7, fill: C.waterLt })
    + mono(140, 100, 'activity rule set predicts the phases', { size: 7.5, fill: C.solidSh, w: 700 })
    + slip(272, 14, 112, 76, { title: 'PREDICT', lines: [['product 1', 'aq or s?', true], ['product 2', 'aq or s?'], ['', ''], ['result', 'use rules']] })
  }),

  'e-scoop': scene('e-scoop', { caption: 'MOLARITY = MOLES OF SOLUTE / LITER OF SOLUTION', body: k =>
    plant(92)
    + balance(18, 44, { mass: '14.61 g', heap: 1 }) + mono(51, 100, 'measure solute mass', { size: 7.5, fill: C.pale, w: 700 })
    + `<path d="M92 52 C110 52 116 42 130 40" fill="none" stroke="${C.pale}" stroke-width="1.3"/>`
    + volFlask(166, 12, 74, { k, n: 'vf', tint: C.teal, fill: .95, label: '250.0 mL' })
    + slip(226, 14, 158, 76, { title: 'PREPARE SOLUTION', lines: [['solute', 'NaCl'], ['mass', '14.61 g'], ['final volume', '250.0 mL'], ['M = mol / L', '1.00 M', true]] })
    + mono(305, 100, 'mass + final volume determine M', { size: 7, fill: C.dim, w: 700 })
  }),

  'e-permang': scene('e-permang', { caption: 'KMnO4 SOLUTION · MASS + FINAL VOLUME SET MOLARITY', body: k =>
    plant(92)
    + balance(16, 44, { mass: '23.7 g', tint: '#4a2159', heap: 1 }) + mono(49, 100, 'KMnO4 crystals', { size: 7.5, fill: C.purpleLt, w: 700 })
    + `<path d="M90 52 C104 52 110 44 122 42" fill="none" stroke="${C.purpleLt}" stroke-width="1.3"/>`
    + volFlask(158, 14, 70, { k, n: 'vf', tint: C.purple, fill: .95, label: '1.00 L' })
    + `<path d="M188 54 C204 54 208 48 220 46" fill="none" stroke="${C.purpleLt}" stroke-width="1.3"/>`
    + `<g><path d="M232 34 h58 v50 a7 7 0 0 1 -7 7 H239 a7 7 0 0 1 -7 -7 z" fill="#2a2233" stroke="${C.steelLt}" stroke-width="1.4"/><ellipse cx="261" cy="34" rx="29" ry="6" fill="#3c2f49" stroke="${C.steelLt}" stroke-width="1.2"/><path d="M236 48 h50 v34 a5 5 0 0 1 -5 5 H241 a5 5 0 0 1 -5 -5 z" fill="${C.purple}" opacity=".7"/></g>`
    + mono(261, 100, 'prepared reagent solution', { size: 7.5, fill: C.purpleLt, w: 700 })
    + dosePump(300, 62, { tint: C.purpleLt })
    + mono(384, 30, 'correct reagent', { size: 7.5, fill: C.warn, anchor: 'end', w: 700 })
    + mono(384, 43, 'concentration matters', { size: 7, fill: C.warn, anchor: 'end' })
    + mono(384, 61, 'excess permanganate', { size: 7.5, fill: C.danger, anchor: 'end', w: 700 })
    + mono(384, 74, 'can add color', { size: 7, fill: C.danger, anchor: 'end' })
  }),

  'f-cleaner': scene('f-cleaner', { caption: 'MEASURE V1 · THEN DILUTE TO FINAL VOLUME V2', theme: 'room', body: k => {
    const g = k.glass('btl', ['#123', '#2c6675', '#a6d3dd']);
    return breakRoom(90, { window: false })
      + `<g><path d="M22 34 h34 v48 a5 5 0 0 1 -5 5 H27 a5 5 0 0 1 -5 -5 z" fill="${g}" opacity=".6" stroke="${C.steelLt}" stroke-width="1.3"/><rect x="32" y="20" width="14" height="15" rx="2" fill="${C.steelLt}"/><path d="M24 44 h30 v37 a4 4 0 0 1 -4 4 H28 a4 4 0 0 1 -4 -4 z" fill="${C.success}" opacity=".7"/></g>`
      + mono(39, 100, 'stock solution', { size: 7.5, fill: C.success, w: 700 })
      + graduate(76, 40, 24, 48, { k, n: 'gc', tint: C.success, fill: .55, label: 'V1' })
      + `<path d="M104 56 h18" fill="none" stroke="${C.pale}" stroke-width="1.3"/>`
      + beaker(132, 26, 54, 64, { k, n: 'batch', level: .84, tint: '#3d8f6a', ions: 10, seed: 6, label: 'final V2' })
      + `<path d="M130 36 h58" stroke="${C.white}" stroke-width="1.1" stroke-dasharray="3 3"/>`
      + mono(159, 100, 'dilute to the mark', { size: 7.5, fill: C.pale, w: 700 })
      + `<g><rect x="212" y="46" width="18" height="40" fill="${C.success}" opacity=".85"/><rect x="248" y="66" width="46" height="20" fill="${C.success}" opacity=".5"/>${mono(221, 40, 'C1V1', { size: 7.5, fill: C.success, w: 700 })}${mono(271, 60, 'C2V2', { size: 7.5, fill: C.success, w: 700 })}${mono(239, 62, '=', { size: 9, fill: C.pale, w: 700 })}</g>`
      + mono(253, 100, 'same moles of solute', { size: 7, fill: C.dim, w: 700 })
      + slip(304, 20, 80, 56, { title: 'DILUTION', lines: [['C1', 'known'], ['C2, V2', 'given'], ['solve', 'V1', true]] });
  } }),

  'f-stock': scene('f-stock', { caption: 'C1V1 = C2V2 · SOLVE FOR THE STOCK VOLUME V1', body: k => {
    const g = k.glass('acid', ['#3a2410', '#8a6224', '#e5cd94']);
    return plant(92)
      + `<g><rect x="30" y="8" width="12" height="60" rx="2" fill="${k.glass('bur', ['#16323b', '#2c6675', '#a6d3dd'])}" opacity=".5" stroke="${C.steelLt}" stroke-width="1.2"/><rect x="31.5" y="20" width="9" height="47" fill="${C.copper1}" opacity=".55"/></g>`
      + beaker(22, 76, 30, 16, { k, n: 'conical', level: .7, tint: '#b8791f', lip: false }) + mono(36, 100, 'analysis', { size: 7.5, fill: C.copper1, w: 700 })
      + `<g><path d="M70 40 h34 v44 a5 5 0 0 1 -5 5 H75 a5 5 0 0 1 -5 -5 z" fill="${g}" opacity=".75" stroke="${C.steelLt}" stroke-width="1.3"/><rect x="80" y="28" width="14" height="13" rx="2" fill="${C.steelLt}"/>${mono(87, 65, 'HCl', { size: 7.5, fill: C.danger, w: 700 })}</g>`
      + mono(87, 100, 'stock', { size: 7.5, fill: C.danger, w: 700 })
      + graduate(120, 34, 22, 54, { k, n: 'gc', tint: '#b8791f', fill: .42, label: 'V1' })
      + `<path d="M146 58 h16" fill="none" stroke="${C.pale}" stroke-width="1.3"/>`
      + volFlask(196, 16, 66, { k, n: 'vf', tint: '#c99a3e', fill: .95, label: 'V2 to mark' })
      + slip(252, 14, 132, 76, { title: 'C1V1 = C2V2', lines: [['C1 stock', '12.0 M'], ['C2 target', '0.500 M'], ['V2 final', '500 mL'], ['V1 stock', '20.8 mL', true]] });
  } }),

  'h1-ksp': scene('h1-ksp', { caption: 'HONORS · COMPARE ION PRODUCT Q WITH Ksp', theme: 'copper', body: k =>
    `<rect width="400" height="102" fill="#160f07" opacity=".35"/><path d="M0 22 h74 v18" fill="none" stroke="${C.steelLt}" stroke-width="4"/><path d="M0 78 h74 v-18" fill="none" stroke="${C.steelLt}" stroke-width="4"/>`
    + `<g fill="${C.cation}" opacity=".85"><circle cx="22" cy="22" r="3"/><circle cx="42" cy="22" r="3"/><circle cx="60" cy="22" r="3"/></g><g fill="${C.anion}" opacity=".85"><circle cx="22" cy="78" r="3"/><circle cx="42" cy="78" r="3"/><circle cx="60" cy="78" r="3"/></g>`
    + mono(36, 16, 'cation', { size: 7, fill: C.cation, w: 700 }) + mono(36, 92, 'anion', { size: 7, fill: C.anion, w: 700 })
    + basin(74, 30, 96, 58, { k, n: 'cw', level: .8, tint: '#7a5a2a', sludge: 6 }) + ionPair(104, 56, { k, n: 'meet', cat: '+', an: '−', gap: 26 })
    + threshold(192, 90, 26, 72, { value: .84, limit: .56, tint: C.copper, limLabel: 'Ksp', valLabel: 'Q' })
    + slip(268, 14, 116, 76, { title: 'COMPARE', lines: [['Q > Ksp', 'precipitate', true], ['Q = Ksp', 'equilibrium'], ['Q < Ksp', 'unsaturated'], ['common ion', 'can raise Q']] })
  }),

  'h2-crys': scene('h2-crys', { caption: 'HONORS · READ TWO SOLUBILITIES AND CALCULATE THE CHANGE', theme: 'copper', body: k => {
    const g = k.glass('tk', ['#2a2010', '#6b5426', '#d9bd7e']);
    return `<rect width="400" height="102" fill="#160f07" opacity=".3"/>`
      + `<g><path d="M20 26 h76 v52 a8 8 0 0 1 -8 8 H28 a8 8 0 0 1 -8 -8 z" fill="${g}" opacity=".6" stroke="${C.steelLt}" stroke-width="1.5"/><path d="M25 40 h66 v36 a6 6 0 0 1 -6 6 H31 a6 6 0 0 1 -6 -6 z" fill="#8a6a2c" opacity=".55"/>${crystals(28, 82, 60, { n: 7, seed: 5, tint: C.crystal, size: 7 })}</g>`
      + mono(58, 100, 'crystallized solid', { size: 7.5, fill: C.crystal, w: 700 })
      + `<g><rect x="118" y="34" width="7" height="44" rx="3.5" fill="#0b1a21" stroke="${C.steelLt}" stroke-width="1.1"/><rect x="119.5" y="62" width="4" height="17" rx="2" fill="${C.waterLt}"/><circle cx="121.5" cy="82" r="5" fill="${C.waterLt}"/></g>`
      + mono(122, 28, 'cooling', { size: 7, fill: C.waterLt, w: 700 })
      + solChart(162, 12, 156, 74, { keys: ['KNO3'], mark: { key: 'KNO3', t: 30, tText: 'cold', sText: 'S2' }, band: [30, 80], sLab: true, tLab: false })
      + `<circle cx="${(162 + 0.8 * 156).toFixed(1)}" cy="${(12 + 74 - Math.min(1, 169 / 250) * 74).toFixed(1)}" r="3.4" fill="${C.white}" stroke="${C.ember}" stroke-width="2"/>`
      + mono(336, 48, 'S1 − S2', { size: 8, fill: C.ember, anchor: 'start', w: 700 }) + mono(336, 63, 'scale to', { size: 8, fill: C.ember, anchor: 'start' }) + mono(336, 78, 'water mass', { size: 8, fill: C.ember, anchor: 'start' });
  } }),

  'cap-batch': scene('cap-batch', { caption: 'CAPSTONE · CLASSIFY · CALCULATE · PREDICT', theme: 'copper', body: k =>
    `<rect width="400" height="102" fill="#160f07" opacity=".35"/>`
    + beaker(14, 34, 30, 50, { k, n: 'stock', level: .74, tint: '#8a6a2c', ions: 10, ionTint: C.copper1, seed: 7 }) + mono(29, 96, 'classify', { size: 7, fill: C.copper1, w: 700 })
    + `<path d="M48 58 h12" fill="none" stroke="${C.copper1}" stroke-width="1.2"/>`
    + volFlask(84, 30, 54, { k, n: 'vf', tint: '#c99a3e', fill: .95, mark: false }) + mono(84, 96, 'molarity', { size: 7, fill: C.copper1, w: 700 })
    + `<path d="M110 58 h12" fill="none" stroke="${C.copper1}" stroke-width="1.2"/>`
    + dosePump(126, 22, { tint: C.copper1 }) + basin(126, 56, 96, 34, { k, n: 'bs', level: .78, tint: '#6a5326', sludge: 6 })
    + `<g transform="translate(166,64)"><rect x="0" y="0" width="12" height="12" rx="2" fill="${C.crystal}"/><path d="M0 4 h12 M0 8 h12 M4 0 v12 M8 0 v12" stroke="${C.solidSh}" stroke-width=".8"/></g>`
    + mono(174, 96, 'product states', { size: 7, fill: C.crystal, w: 700 })
    + `<path d="M226 72 h12" fill="none" stroke="${C.copper1}" stroke-width="1.2"/>`
    + `<g><path d="M244 44 h26 v40 a4 4 0 0 1 -4 4 h-18 a4 4 0 0 1 -4 -4 z" fill="${k.glass('smp', ['#16323b', '#2c6675', '#a6d3dd'])}" opacity=".5" stroke="${C.steelLt}" stroke-width="1.3"/><rect x="251" y="36" width="12" height="9" rx="2" fill="${C.steelLt}"/></g>`
    + mono(257, 96, 'result', { size: 7, fill: C.waterLt, w: 700 })
    + slip(278, 14, 106, 76, { title: 'CHECK', lines: [['classification', 'correct', true], ['molarity', 'criterion'], ['products', 'correct'], ['', '']] })
  })
};

export function sceneArt(id) { return SCENE_ART[id] || ''; }
