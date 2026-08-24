// art.js - Unit 8 scene illustrations ("Day Three": a water treatment plant on notice,
// with a break room attached). One inline SVG per SCENARIO id (see model.js), rendered
// into the cockpit's mission screen via x-html.
//
// Built on the same scaffolding as units_new/11-nuclear/js/art.js and
// units_new/01-practices-matter/js/art.js, because the tree shares a shell and a set that
// disagrees with itself reads as several products:
//   • viewBox is 400x150 - the 8:3 the .mission-frame is sized to.
//   • Every gradient/pattern/clip id is prefixed with the scene id. Alpine keeps all
//     station panels in the DOM (x-show, not x-if), so the SVGs coexist and an unprefixed
//     id would bleed from one scene into another. kit() does the prefixing.
//   • Lighting is from the upper left everywhere, so a beaker in one banner is shaded like
//     the beaker in the next.
//   • Keep the subject above y=100. Below that the caption scrim fades the art out.
//   • Banners are aria-hidden: the scenario's goal text directly below is the
//     authoritative description, so announcing the art too is redundant.
//
// EIGHTEEN banners. Two signatures answer the same question Unit 1's waterColumn() and
// deskShelf() pair did - which room are we standing in:
//
//   plant()      the process side. Concrete piers, the pipe run overhead, walkway grating,
//                and the wet floor everything drips onto.
//   breakRoom()  the domestic side. Tiled splashback, a counter, and the window onto the
//                lot. This is where the iced tea, the honey jar and the kettle live, and
//                the whole unit's argument is that those are the same chemistry.
//
// On top of those sit the grammars that carry the rotations. The unit's core idea is one
// picture - HEAPED SOLID ON THE FLOOR versus NOTHING VISIBLE BUT TINT - and beaker()
// draws both, so every C.11(A)/(B) scene can say "dissolved" or "did not" in one glance.
// The three C.11(C) scenes and the two Honors calls all read the SAME solubility chart,
// drawn from real g/100 g data, because that is literally the bench instrument. The two
// C.11(E) scenes are a balance handing a mass to a flask filled to the mark; the two
// C.11(F) scenes are a measured draw of stock going into a made-up batch volume.
//
// Palette tracks tokens.css: teal for the plant and its water, warm amber for the break
// room, permanganate purple for the one chemical that has a colour of its own, copper for
// the Honors calls and the capstone.

const MONO = "'JetBrains Mono', ui-monospace, monospace";

const C = {
  teal: '#2a7d8a', teal7: '#1d5b66', teal3: '#79b0ba', tealLt: '#cfe6ea',
  ink: '#08141a', dim: '#9fc2c9', steel: '#687a82', steelLt: '#aebfc6',
  pale: '#cfdbe0', white: '#e8f2f4', slate: '#3a5560',
  copper: '#c0772f', copper7: '#95591f', copper1: '#f1ddc8',
  success: '#2f8f5b', warn: '#b8881f', danger: '#bf4a30', ember: '#f0a02f',
  // the plant and the room
  water: '#2f7d92', waterDk: '#12414f', waterLt: '#8fc9d6',
  concrete: '#4a5259', concreteDk: '#2b3238', grate: '#5d666d',
  solid: '#e4e9ea', solidSh: '#a9b6ba', crystal: '#dff0f4',
  tea: '#a4602a', honey: '#d79a2b', oil: '#6b7a4a', purple: '#8a4fb5', purpleLt: '#c79ae0',
  tile: '#3c4c52', counter: '#5a4636', night: '#101b26',
  cation: '#e07a45', anion: '#5aa9c4', card: '#f2efe6'
};

// Two grounds, because this unit happens on two sides of one door, plus copper for the
// Honors calls and the capstone.
const PLANT_BG  = ['#0a232c', '#123842'];   // the process side
const ROOM_BG   = ['#1a1c19', '#2b2a23'];   // the break room
const COPPER_BG = ['#1c1208', '#2e2113'];   // Honors and the last call

// ---------------------------------------------------------------- paint kit
// kit(id) hands a scene its own <defs> namespace. Bodies call k.glass(...) and get back
// url(#id-name) while the definition is collected for the <defs> block.
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
    // Standing glass: shadow / highlight / body / shadow across x.
    glass(n, [sh, base, hi]) { return k.lin(n, [[0, sh], [.22, hi], [.52, base], [1, sh]], true); },
    // Sphere, bead or ion lit from the upper left.
    orb(n, [hi, base, sh]) { return k.rad(n, [[0, hi], [.55, base], [1, sh]]); }
  };
  return k;
}

// ---------------------------------------------------------------- primitives
// ---------------------------------------------------------------- label legibility
/* A floor for in-scene labels.
 *
 * The banner is a 400-unit viewBox rendered at roughly the width of the mission column, so a
 * label authored at 7 units reaches the screen at about 7 CSS PX. The words on the drawing are
 * the part of the scene that carries the chemistry, and at that size they are decoration.
 *
 * A floor rather than a multiplier, for two reasons: it cannot make the caption or the display
 * numerals grow, which is what would push a long caption past the 400-unit frame; and the
 * hierarchy it flattens between 6.5 and 7.5 was invisible at that size anyway. One number, and
 * the whole small set moves together.
 *
 * `boxed: true` opts a label out. A subscript that lives in the few units between a symbol's
 * baseline and its tile's bottom edge has nowhere to grow into, and the floor would print it
 * through the symbol above. One flag per site is cheaper and clearer than lowering the floor
 * for every label in the unit.
 *
 * The rendered size still scales with the column, so the left drag handle is the other half of
 * this control: at the default 31vw the floor lands near 9.2px, and wider is bigger. */
const LABEL_FLOOR = 8;

const mono = (x, y, s, { size = 9, fill = C.dim, w = 500, anchor = 'middle', ls, boxed } = {}) =>
  `<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="${MONO}"`
  + ` font-size="${boxed ? size : Math.max(size, LABEL_FLOOR)}"`
  + ` font-weight="${w}" fill="${fill}"${ls ? ` letter-spacing="${ls}"` : ''}>${s}</text>`;

// A deterministic pseudo-random stream, so a scene redraws identically every frame.
const rng = seed => { let s = seed; return () => (s = (s * 1103515245 + 12345) % 2147483648) / 2147483648; };

// ---- SIGNATURE 1: the process side. Concrete, the pipe run, grating, a wet floor.
const plant = (floorY = 92, { door = false } = {}) =>
  `<path d="M0 0 H186 L74 ${floorY} H0 Z" fill="${C.tealLt}" opacity=".05"/>`
  // the pipe run overhead, with its hangers
  + `<g opacity=".5"><rect x="0" y="6" width="400" height="9" rx="4.5" fill="${C.concrete}"/>`
  + `<path d="M0 8.5 H400" stroke="${C.steelLt}" stroke-width="1" opacity=".45"/>`
  + `<g fill="${C.grate}"><rect x="66" y="0" width="5" height="8"/><rect x="228" y="0" width="5" height="8"/>`
  + `<rect x="330" y="0" width="5" height="8"/></g></g>`
  // concrete piers
  + `<g fill="${C.concrete}" opacity=".3"><rect x="24" y="15" width="20" height="${floorY - 15}"/>`
  + `<rect x="356" y="15" width="24" height="${floorY - 15}"/></g>`
  + (door
    ? `<rect x="286" y="24" width="86" height="${floorY - 24}" fill="#8fa6ad" opacity=".18"/>`
      + `<rect x="286" y="24" width="86" height="${floorY - 24}" fill="none" stroke="${C.steelLt}" stroke-width="1.2" opacity=".5"/>`
    : '')
  // walkway grating along the floor line
  + `<rect x="0" y="${floorY}" width="400" height="${150 - floorY}" fill="${C.concreteDk}"/>`
  + `<g stroke="${C.grate}" stroke-width="1" opacity=".5">`
  + [0, 1, 2, 3, 4, 5, 6, 7].map(i => `<path d="M${i * 52} ${floorY} V150"/>`).join('') + `</g>`
  + `<path d="M0 ${floorY} H400" stroke="${C.steelLt}" stroke-width="1.8" opacity=".5"/>`
  + `<path d="M0 ${floorY + 3.5} H400" stroke="#061015" stroke-width="1.2" opacity=".55"/>`;

// ---- SIGNATURE 2: the break room. Tiled splashback, a counter, a window onto the lot.
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

// THE picture this whole unit turns on. A vessel of water with, at the bottom, either a
// heap of solid that did not go in or nothing at all - and above it, either a tint that
// says something is dissolved or clear water that says nothing is.
//   solid  0..1, how much undissolved solid is heaped on the floor of the vessel
//   tint   the colour of the solution, null for plain water
//   ions   draw dissolved particles in the body of the liquid
const beaker = (x, yTop, w, h, { k, n = 'bk', level = .68, tint = null, solid = 0, ions = 0, ionTint = null, seed = 3, lip = true, label = null } = {}) => {
  const g = k ? k.glass(n, ['#16323b', '#2c6675', '#a6d3dd']) : '#2c6675';
  const yL = yTop + h * (1 - level), floor = yTop + h;
  const sh = solid ? 4 + solid * (h * .3) : 0;
  let inner = `<path d="M${x + 1.5} ${yL.toFixed(1)} h${w - 3} V${floor - 2.5} h${-(w - 3)} Z" fill="${tint || C.water}" opacity="${tint ? .62 : .42}"/>`
    + `<path d="M${x + 1.5} ${yL.toFixed(1)} h${w - 3}" stroke="${tint || C.waterLt}" stroke-width="1.5" opacity=".95"/>`;
  if (ions) {
    const rnd = rng(seed);
    for (let i = 0; i < ions; i++) {
      inner += `<circle cx="${(x + 4 + rnd() * (w - 8)).toFixed(1)}" cy="${(yL + 4 + rnd() * (floor - yL - 8 - sh)).toFixed(1)}"`
        + ` r="1.7" fill="${ionTint || C.waterLt}" opacity=".85"/>`;
    }
  }
  if (solid) {
    // a heap, not a rectangle: this is what "it did not dissolve" looks like
    inner += `<path d="M${x + 2} ${floor - 2.5} q${w * .22} ${-sh} ${w * .5} ${-sh * .82} q${w * .26} ${sh * .2} ${w * .26} ${sh * .82} Z"`
      + ` fill="${C.solid}" opacity=".92"/>`
      + `<path d="M${x + 2} ${floor - 2.5} q${w * .22} ${-sh} ${w * .5} ${-sh * .82}" fill="none" stroke="#ffffff" stroke-width="1" opacity=".6"/>`;
    const rnd2 = rng(seed + 11);
    for (let i = 0; i < 5; i++) {
      inner += `<rect x="${(x + 5 + rnd2() * (w - 12)).toFixed(1)}" y="${(floor - 5 - rnd2() * sh).toFixed(1)}" width="2.4" height="2.4" fill="${C.solidSh}" opacity=".9"/>`;
    }
  }
  return `<g>`
    + `<path d="M${x} ${yTop} v${h - 5} a5 5 0 0 0 5 5 h${w - 10} a5 5 0 0 0 5 -5 V${yTop}"`
    + ` fill="${g}" opacity=".38" stroke="${C.steelLt}" stroke-width="1.4"/>`
    + inner
    + `<rect x="${x + 3}" y="${yTop + 4}" width="2.6" height="${h - 12}" rx="1.3" fill="#ffffff" opacity=".32"/>`
    + (lip ? `<path d="M${x - 2} ${yTop} h${w + 4}" stroke="${C.steelLt}" stroke-width="1.6" stroke-linecap="round"/>` : '')
    + (label ? mono(x + w / 2, yTop - 5, label, { size: 7.5, fill: C.pale, w: 700 }) : '')
    + `</g>`;
};

// A concrete basin in cross-section: walls, water, an optional sludge layer on the floor
// and an optional inlet weir at the left.
const basin = (x, y, w, h, { k, n = 'bs', level = .72, tint = null, sludge = 0, weir = false } = {}) => {
  const yL = y + h * (1 - level);
  const water = k ? k.lin(n, [[0, tint || '#3a8ba0'], [1, C.waterDk]]) : (tint || C.water);
  return `<g>`
    + `<path d="M${x} ${y} v${h} h${w} V${y}" fill="none" stroke="${C.concrete}" stroke-width="6" stroke-linejoin="round"/>`
    + `<path d="M${x} ${y} v${h} h${w} V${y}" fill="none" stroke="${C.steelLt}" stroke-width="1" opacity=".35"/>`
    + `<rect x="${x + 3}" y="${yL.toFixed(1)}" width="${w - 6}" height="${(y + h - 3 - yL).toFixed(1)}" fill="${water}" opacity=".8"/>`
    + `<path d="M${x + 3} ${yL.toFixed(1)} h${w - 6}" stroke="${C.waterLt}" stroke-width="1.4" opacity=".8"/>`
    + (sludge
      ? `<path d="M${x + 3} ${y + h - 3} h${w - 6} v${-sludge} q${-(w - 6) * .3} ${sludge * .55} ${-(w - 6) * .55} ${-sludge * .1}`
        + ` q${-(w - 6) * .28} ${sludge * .5} ${-(w - 6) * .45} ${sludge * .1} Z" fill="${C.solidSh}" opacity=".85"/>`
      : '')
    + (weir ? `<path d="M${x - 12} ${yL - 8} h14 v6 h-14 z" fill="${C.concrete}"/>`
      + `<path d="M${x + 2} ${yL - 2} q3 6 0 10" fill="none" stroke="${C.waterLt}" stroke-width="2" opacity=".7"/>` : '')
    + `</g>`;
};

// ---- the bench instrument: real solubility data, g per 100 g of water, at 0..100 C ----
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

// The solubility chart the bench actually shows: temperature across, g/100 g up, one line
// per solute, and an optional read-off - the drop line, the run line and the point where
// they meet the curve. This is the single instrument behind c-tea, c-rate, c-basin and
// h2-crys, the way Unit 11 reuses one decay curve.
const solChart = (x, y, w, h, { keys = ['KNO3'], mark = null, sMax = 250, colors = {}, tLab = true, sLab = true, band = null } = {}) => {
  const PX = t => x + (t / 100) * w, PY = s => y + h - Math.min(1, s / sMax) * h;
  const COL = { KNO3: C.ember, NaNO3: C.waterLt, NH4Cl: C.success, KCl: C.copper1, NaCl: C.teal3, KClO3: C.purpleLt };
  let out = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#07171e" opacity=".55"/>`
    + `<g stroke="${C.steel}" stroke-width=".7" opacity=".4">`
    + [.25, .5, .75].map(f => `<path d="M${x} ${(y + h * f).toFixed(1)} H${x + w}"/>`).join('')
    + [.25, .5, .75].map(f => `<path d="M${(x + w * f).toFixed(1)} ${y} V${y + h}"/>`).join('') + `</g>`;
  if (band) {
    out += `<rect x="${PX(band[0]).toFixed(1)}" y="${y}" width="${(PX(band[1]) - PX(band[0])).toFixed(1)}" height="${h}" fill="${C.copper}" opacity=".12"/>`;
  }
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

// A row of jar-test jars with their paddles, each jar in whatever state the scene needs.
const jarRow = (x, y, states, { k, gap = 34, w = 26, h = 34 } = {}) =>
  states.map((st, i) => `<g>`
    + beaker(x + i * gap, y, w, h, { k, n: `jar${i}`, level: .7, tint: st.tint || null, solid: st.solid || 0, ions: st.ions || 0, ionTint: st.ionTint, seed: 5 + i * 7, lip: false })
    + `<rect x="${x + i * gap + w / 2 - 1}" y="${y - 12}" width="2" height="${h * .6 + 12}" fill="${C.steelLt}" opacity=".8"/>`
    + `<rect x="${x + i * gap + w / 2 - 5}" y="${y + h * .55}" width="10" height="3" rx="1.5" fill="${C.steelLt}" opacity=".9"/>`
    + (st.label ? mono(x + i * gap + w / 2, y + h + 10, st.label, { size: 7, fill: st.labelFill || C.dim, w: 700 }) : '')
    + `</g>`).join('')
  + `<path d="M${x - 6} ${y - 12} H${x + states.length * gap - gap + w + 6}" stroke="${C.steelLt}" stroke-width="2" opacity=".55"/>`;

// A top-pan balance with a scoop of solid on it and the mass it is reading.
const balance = (x, y, { mass = '0.00 g', tint = C.solid, heap = 1 } = {}) =>
  `<g>`
  + `<rect x="${x}" y="${y + 22}" width="66" height="20" rx="3" fill="#1b262c" stroke="${C.steelLt}" stroke-width="1.4"/>`
  + `<rect x="${x + 6}" y="${y + 27}" width="42" height="10" rx="1.5" fill="#04120f" stroke="${C.steel}" stroke-width=".8"/>`
  + mono(x + 27, y + 35, mass, { size: 7.5, fill: C.success, w: 700 })
  + `<circle cx="${x + 58}" cy="${y + 32}" r="3" fill="${C.steel}"/>`
  + `<rect x="${x + 8}" y="${y + 18}" width="50" height="4" rx="2" fill="${C.steelLt}"/>`
  // the scoop: a shallow pan of solid, heaped
  + `<path d="M${x + 14} ${y + 18} q19 ${-8 - heap * 8} 38 0 z" fill="${tint}" opacity=".95"/>`
  + `<path d="M${x + 14} ${y + 18} q19 ${-8 - heap * 8} 38 0" fill="none" stroke="#ffffff" stroke-width=".9" opacity=".5"/>`
  + `</g>`;

// A volumetric flask: pear body, long neck, and the graduation ring the meniscus sits on.
const volFlask = (cx, yTop, h, { k, n = 'vf', tint = C.water, fill = .92, mark = true, label = null } = {}) => {
  const bw = h * .62, by = yTop + h * .42, bh = h * .58;
  const g = k ? k.glass(n, ['#16323b', '#2c6675', '#a6d3dd']) : '#2c6675';
  const markY = yTop + h * .30;
  const yL = fill >= .9 ? markY : by + bh * (1 - fill);
  return `<g>`
    + `<path d="M${cx - 5} ${yTop} h10 v${h * .42} q${bw / 2} ${h * .16} ${bw / 2 - 5} ${bh * .58}`
    + ` q${-bw * .06} ${bh * .42} ${-bw / 2 + 5 - (bw / 2 - 5)} ${0} h${-(bw - 10)}`
    + ` q${-bw * .44} ${-bh * .06} ${-bw / 2 + 5} ${-bh * .58} q${-bw * .06} ${-h * .26} ${5} ${-h * .42} z"`
    + ` fill="${g}" opacity=".4" stroke="${C.steelLt}" stroke-width="1.4"/>`
    + `<path d="M${cx - bw / 2 + 3} ${by + 6} q${bw / 2 - 3} ${-10} ${bw - 6} 0 v${bh - 12} q${-(bw / 2 - 3)} 6 ${-(bw - 6)} 0 z" fill="${tint}" opacity=".6"/>`
    + `<rect x="${cx - 4.5}" y="${yL.toFixed(1)}" width="9" height="${(by + 8 - yL).toFixed(1)}" fill="${tint}" opacity=".6"/>`
    + `<path d="M${cx - 4.5} ${yL.toFixed(1)} h9" stroke="${tint}" stroke-width="1.6"/>`
    + (mark ? `<path d="M${cx - 8} ${markY.toFixed(1)} h16" stroke="${C.white}" stroke-width="1.2"/>`
      + mono(cx + 11, markY + 3, 'mark', { size: 7, fill: C.white, anchor: 'start' }) : '')
    + `<rect x="${cx - 6.5}" y="${yTop - 3}" width="13" height="5" rx="2" fill="${C.steelLt}"/>`
    + (label ? mono(cx, yTop + h + 9, label, { size: 7.5, fill: C.pale, w: 700 }) : '')
    + `</g>`;
};

// A graduated cylinder, for the measured draw of stock the dilution stages turn on.
const graduate = (x, yTop, w, h, { k, n = 'gc', tint = C.water, fill = .5, ticks = 6, label = null } = {}) => {
  const g = k ? k.glass(n, ['#16323b', '#2c6675', '#a6d3dd']) : '#2c6675';
  const yL = yTop + h * (1 - fill);
  let t = '';
  for (let i = 1; i <= ticks; i++) t += `<path d="M${x + w - 8} ${(yTop + (h / (ticks + 1)) * i).toFixed(1)} h6" stroke="${C.pale}" stroke-width=".9" opacity=".7"/>`;
  return `<g>`
    + `<path d="M${x} ${yTop} v${h} h${w} V${yTop}" fill="${g}" opacity=".4" stroke="${C.steelLt}" stroke-width="1.3"/>`
    + `<path d="M${x + 1.5} ${yL.toFixed(1)} h${w - 3} V${yTop + h - 1.5} h${-(w - 3)} Z" fill="${tint}" opacity=".62"/>`
    + `<path d="M${x + 1.5} ${yL.toFixed(1)} h${w - 3}" stroke="${tint}" stroke-width="1.5"/>`
    + t
    + `<path d="M${x - 4} ${yTop + h} h${w + 8} v4 h${-(w + 8)} z" fill="${C.steelLt}" opacity=".8"/>`
    + (label ? mono(x + w / 2, yTop - 5, label, { size: 7.5, fill: C.pale, w: 700 }) : '')
    + `</g>`;
};

// Two ions meeting. This is the picture behind every precipitation and Ksp scene: a cation
// and an anion drifting together, and - if they must - locking into a lattice that leaves.
const ionPair = (x, y, { k, n = 'ion', cat = '2+', an = '2-', gap = 26, lock = false, tint1 = C.cation, tint2 = C.anion } = {}) => {
  const g1 = k ? k.orb(n + 'a', ['#ffe1cd', tint1, '#5c2a12']) : tint1;
  const g2 = k ? k.orb(n + 'b', ['#dff2f8', tint2, '#16414f']) : tint2;
  return `<g>`
    + `<circle cx="${x}" cy="${y}" r="9" fill="${g1}"/>` + mono(x, y + 3.5, cat, { size: 8, fill: '#3a1607', w: 700 })
    + `<circle cx="${x + gap}" cy="${y}" r="9" fill="${g2}"/>` + mono(x + gap, y + 3.5, an, { size: 8, fill: '#08272f', w: 700 })
    + (lock
      ? `<path d="M${x + 9} ${y} h${gap - 18}" stroke="${C.white}" stroke-width="2"/>`
      : `<path d="M${x + 10} ${y} h${gap - 20} m0 0 l-4 -3 m4 3 l-4 3" fill="none" stroke="${C.pale}" stroke-width="1.3" stroke-linecap="round"/>`)
    + `</g>`;
};

// A bed of crystals: what comes OUT of solution, drawn as faceted solids rather than a
// grey lump, because the point of h2-crys is that you can see them arrive.
const crystals = (x, y, w, { n = 7, seed = 4, tint = C.crystal, size = 6 } = {}) => {
  const rnd = rng(seed);
  let out = '';
  for (let i = 0; i < n; i++) {
    const cx = x + (i + .5) * (w / n) + (rnd() - .5) * 6, s = size * (.6 + rnd() * .7), cy = y - s * .3;
    out += `<g transform="translate(${cx.toFixed(1)},${cy.toFixed(1)}) rotate(${(rnd() * 40 - 20).toFixed(1)})">`
      + `<path d="M${-s / 2} 0 l${s * .3} ${-s} h${s * .4} l${s * .3} ${s} z" fill="${tint}" opacity=".95"/>`
      + `<path d="M${-s / 2} 0 l${s * .3} ${-s}" stroke="#ffffff" stroke-width=".8" opacity=".7"/></g>`;
  }
  return out;
};

// A water molecule with its partial charges shown, and its opposite number: an unbranched
// nonpolar chain with none. The pair is the whole of "like dissolves like".
const waterMol = (x, y, s = 1, { tint = C.waterLt } = {}) =>
  `<g transform="translate(${x},${y}) scale(${s})">`
  + `<circle cx="0" cy="0" r="8" fill="${tint}"/>`
  + `<circle cx="-9" cy="-7" r="5" fill="${C.white}"/><circle cx="9" cy="-7" r="5" fill="${C.white}"/>`
  + mono(0, 12, 'd-', { size: 7, fill: C.danger, w: 700 })
  + mono(-14, -12, 'd+', { size: 7, fill: C.warn, w: 700 })
  + mono(14, -12, 'd+', { size: 7, fill: C.warn, w: 700 })
  + `</g>`;

const chainMol = (x, y, s = 1, { tint = C.oil, len = 5 } = {}) => {
  let out = `<g transform="translate(${x},${y}) scale(${s})">`;
  for (let i = 0; i < len; i++) {
    const cx = i * 11 - (len - 1) * 5.5, cy = i % 2 ? 4 : -4;
    out += `<circle cx="${cx}" cy="${cy}" r="5.5" fill="${tint}"/>`;
    if (i) out += `<path d="M${cx - 11} ${i % 2 ? -4 : 4} L${cx} ${cy}" stroke="${tint}" stroke-width="2.6"/>`;
  }
  return out + mono(0, 16, 'no charge', { size: 7, fill: C.steel }) + `</g>`;
};

// The dosing pump and its feed line: a small box, a stroke counter and the pipe that puts
// the chemical into the water.
const dosePump = (x, y, { tint = C.success, label = null } = {}) =>
  `<g>`
  + `<rect x="${x}" y="${y}" width="32" height="26" rx="3" fill="#1b262c" stroke="${C.steelLt}" stroke-width="1.3"/>`
  + `<circle cx="${x + 10}" cy="${y + 13}" r="6" fill="#08161c" stroke="${C.steel}" stroke-width="1"/>`
  + `<path d="M${x + 10} ${y + 13} V${y + 8}" stroke="${tint}" stroke-width="1.6"/>`
  + `<rect x="${x + 20}" y="${y + 7}" width="7" height="12" rx="1.5" fill="${tint}" opacity=".7"/>`
  + (label ? mono(x + 16, y - 4, label, { size: 7, fill: tint, w: 700 }) : '')
  + `</g>`;

// A ruled work slip: the log line, the batch card, the notice from the state lab.
const slip = (x, y, w, h, { title = null, lines = [], tint = C.card } = {}) => {
  let body = '';
  lines.forEach(([lab, val, hot], i) => {
    const ly = y + (title ? 24 : 14) + i * 13;
    body += mono(x + 7, ly, lab, { size: 8, fill: hot ? C.copper7 : C.slate, anchor: 'start', w: hot ? 700 : 500 })
      + (val === undefined ? '' : mono(x + w - 7, ly, val, { size: 8.5, fill: hot ? C.copper7 : C.ink, anchor: 'end', w: 700 }));
  });
  return `<g><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="${tint}" stroke="${C.steelLt}" stroke-width="1.2"/>`
    + (title ? `<path d="M${x} ${y + 13} H${x + w}" stroke="${C.steelLt}" stroke-width=".9"/>`
      + mono(x + 7, y + 9.5, title, { size: 7, fill: C.steel, anchor: 'start', ls: '.1em', w: 700 }) : '')
    + body + `</g>`;
};

// A vertical scale with a threshold on it: the saturation limit a tank sits under or over,
// and the Ksp line Q has to be compared against. One primitive, two jobs.
const threshold = (x, yBot, w, h, { value = .5, limit = .7, tint = C.teal3, limLabel = 'LIMIT', valLabel = null, over = null } = {}) => {
  const vY = yBot - value * h, lY = yBot - limit * h;
  const hot = over === null ? value > limit : over;
  return `<g>`
    + `<rect x="${x}" y="${yBot - h}" width="${w}" height="${h}" fill="#08181f" opacity=".7" stroke="${C.steelLt}" stroke-width="1"/>`
    + `<rect x="${x + 1}" y="${vY.toFixed(1)}" width="${w - 2}" height="${(yBot - vY - 1).toFixed(1)}" fill="${hot ? C.danger : tint}" opacity=".75"/>`
    + `<path d="M${x - 6} ${lY.toFixed(1)} H${x + w + 6}" stroke="${C.warn}" stroke-width="1.4" stroke-dasharray="4 3"/>`
    + mono(x + w + 8, lY + 3, limLabel, { size: 7, fill: C.warn, anchor: 'start', w: 700 })
    + (valLabel ? mono(x + w / 2, vY - 5, valLabel, { size: 7.5, fill: hot ? C.danger : tint, w: 700 }) : '')
    + `</g>`;
};

// ---------------------------------------------------------------- scaffolding
// scene(id, opts) -> a complete 400x150 banner string.
//   caption  required mono strapline along the bottom
//   body     required k => shapes, drawn between background and scrim
//   theme    'plant' (default) | 'room' (the break room) | 'copper' (Honors, capstone)
function scene(id, { caption, body, theme = 'plant', bg, frame, capColor }) {
  const honors = theme === 'copper';
  const [top, bot] = bg || (honors ? COPPER_BG : theme === 'room' ? ROOM_BG : PLANT_BG);
  const frameColor = frame || (honors ? C.copper : C.teal);
  const frameOp = frame ? 0.45 : honors ? 0.5 : 0.38;
  const cap = capColor || (honors ? '#e0b483' : C.dim);
  const k = kit(id);
  const art = body(k);
  return `<svg viewBox="0 0 400 150" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">`
    + `<defs>`
    + `<linearGradient id="${id}-bg" x1="0" y1="0" x2="0" y2="1">`
    + `<stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${bot}"/></linearGradient>`
    + `<linearGradient id="${id}-scrim" x1="0" y1="0" x2="0" y2="1">`
    + `<stop offset="0" stop-color="${bot}" stop-opacity="0"/>`
    + `<stop offset=".55" stop-color="${bot}" stop-opacity=".62"/>`
    + `<stop offset="1" stop-color="${bot}" stop-opacity=".94"/></linearGradient>`
    + k.defs.join('')
    + `</defs>`
    + `<rect width="400" height="150" fill="url(#${id}-bg)"/>`
    + art
    + `<rect y="102" width="400" height="48" fill="url(#${id}-scrim)"/>`
    + `<path d="M1 150 V9 A8 8 0 0 1 9 1 H391 A8 8 0 0 1 399 9 V150" fill="none"`
    + ` stroke="${frameColor}" stroke-width="1" opacity="${frameOp}"/>`
    + mono(16, 138, caption, { size: 10.5, fill: cap, anchor: 'start', ls: '.05em' })
    + `</svg>`;
}

export const SCENE_ART = {

  // ================= C.11(A) does water take it: heap on the floor, or nothing =================
  // Three scenes, one comparison: a vessel where the solid went in against a vessel where
  // it is still sitting there, with the molecule that explains which is which.

  // The break room. The sugar is still on the floor of the cold glass; the salt is gone.
  'a-tea': scene('a-tea', { caption: 'THE BREAK ROOM · ONE WENT IN, ONE IS STILL SITTING', theme: 'room', body: k => {
    return breakRoom(90)
      + beaker(26, 26, 34, 64, { k, n: 'tea', level: .78, tint: C.tea, solid: .85, seed: 9, label: 'iced tea' })
      // ice, because this is the cold glass and that is why the heap is still there
      + `<g fill="${C.white}" opacity=".55">`
      + `<rect x="31" y="42" width="11" height="9" rx="2" transform="rotate(-12 36 46)"/>`
      + `<rect x="44" y="49" width="10" height="8" rx="2" transform="rotate(9 49 53)"/></g>`
      + beaker(80, 26, 34, 64, { k, n: 'wat', level: .78, ions: 16, ionTint: C.waterLt, seed: 21, label: 'water' })
      // the shaker that emptied into it
      + `<g transform="translate(126,30) rotate(24)">`
      + `<path d="M0 0 h16 v22 a4 4 0 0 1 -4 4 h-8 a4 4 0 0 1 -4 -4 z" fill="${C.pale}" stroke="${C.steel}" stroke-width="1.1"/>`
      + `<rect x="1" y="-5" width="14" height="6" rx="2" fill="${C.steelLt}"/>`
      + `<g fill="${C.steel}"><circle cx="5" cy="-2" r=".9"/><circle cx="9" cy="-2.6" r=".9"/><circle cx="12" cy="-2" r=".9"/></g></g>`
      + `<g fill="${C.solid}" opacity=".8">`
      + `<circle cx="112" cy="24" r="1.4"/><circle cx="106" cy="18" r="1.2"/><circle cx="118" cy="16" r="1.1"/></g>`
      + mono(44, 100, 'a heap on the floor', { size: 7.5, fill: C.ember, w: 700 })
      + mono(140, 100, 'nothing to see', { size: 7.5, fill: '#5fd39a', anchor: 'start', w: 700 })
      + waterMol(196, 40, .95)
      + mono(196, 70, 'water is polar', { size: 7.5, fill: C.waterLt, w: 700 })
      + slip(246, 16, 138, 74, { title: 'BENCH LOG', lines: [
        ['bonding', 'ionic?'],
        ['dissolves', 'yes / no', true],
        ['', ''],
        ['like takes like', '']
      ] });
  } }),

  // The shed. Nothing here is going anywhere near water, and the sample proves it.
  'a-shed': scene('a-shed', { caption: 'THE MAINTENANCE SHED · IT WILL NOT RINSE OFF', body: k => {
    return plant(92)
      // the degreaser tin, and the water beading off the bench beside it
      + `<g><path d="M22 40 h40 v46 a3 3 0 0 1 -3 3 H25 a3 3 0 0 1 -3 -3 z" fill="${C.oil}" stroke="${C.steelLt}" stroke-width="1.3"/>`
      + `<rect x="26" y="30" width="14" height="11" rx="2" fill="${C.steelLt}"/>`
      + `<rect x="27" y="50" width="30" height="20" rx="2" fill="${C.card}" opacity=".85"/>`
      + mono(42, 63, 'SOLVENT', { size: 7, fill: C.ink, w: 700 })
      + `</g>`
      + `<g fill="${C.waterLt}" opacity=".75">`
      + `<ellipse cx="76" cy="86" rx="7" ry="4"/><ellipse cx="90" cy="88" rx="5" ry="3"/><ellipse cx="66" cy="89" rx="4" ry="2.5"/></g>`
      + mono(80, 100, 'water beads off', { size: 7.5, fill: C.waterLt, w: 700 })
      // the raw-water sample: a nonpolar layer sitting ON TOP, not dissolved in
      + beaker(122, 24, 40, 66, { k, n: 'smp', level: .72, seed: 3, label: 'raw water' })
      + `<path d="M124 43 h36 v7 h-36 z" fill="${C.oil}" opacity=".8"/>`
      + `<path d="M124 43 h36" stroke="#c9d38f" stroke-width="1.2" opacity=".8"/>`
      + mono(160, 100, 'a sheen, not a solution', { size: 7.5, fill: '#9fb06a', anchor: 'start', w: 700 })
      + chainMol(238, 32, .95)
      + waterMol(238, 74, .8)
      + `<path d="M276 32 h16 m0 0 l-5 -4 m5 4 l-5 4" fill="none" stroke="${C.danger}" stroke-width="1.3" stroke-linecap="round"/>`
      + `<path d="M280 26 l10 12 M290 26 l-10 12" stroke="${C.danger}" stroke-width="1.8" stroke-linecap="round"/>`
      + mono(302, 30, 'nonpolar', { size: 8, fill: C.oil, anchor: 'start', w: 700 })
      + mono(302, 43, 'does not go', { size: 8, fill: C.oil, anchor: 'start' })
      + mono(302, 56, 'into polar', { size: 8, fill: C.oil, anchor: 'start' })
      + mono(302, 69, 'water — it', { size: 8, fill: C.oil, anchor: 'start' })
      + mono(302, 82, 'floats on it', { size: 8, fill: C.oil, anchor: 'start' });
  } }),

  // The contact basin. Three candidates on the bench; only the one in solution can reach
  // the manganese that is actually in the water.
  'a-basin': scene('a-basin', { caption: 'THE CONTACT BASIN · ONLY WHAT DISSOLVES CAN REACH IT', body: k => {
    return plant(92)
      + jarRow(20, 22, [
        { tint: C.teal, ions: 12, ionTint: C.waterLt, label: 'in', labelFill: C.success },
        { solid: .9, label: 'not in', labelFill: C.danger },
        { tint: C.teal7, ions: 6, solid: .35, label: 'part', labelFill: C.warn }
      ], { k })
      + dosePump(134, 30, { label: 'DOSE' })
      + `<path d="M150 56 V70 h18" fill="none" stroke="${C.steelLt}" stroke-width="3" stroke-linecap="round"/>`
      + basin(178, 34, 132, 56, { k, n: 'bs', level: .78, sludge: 7, weir: true })
      // the manganese already in the water, waiting to be reached
      + `<g fill="${C.purple}" opacity=".75">`
      + `<circle cx="206" cy="60" r="2.6"/><circle cx="236" cy="72" r="2.6"/><circle cx="266" cy="58" r="2.6"/>`
      + `<circle cx="288" cy="70" r="2.6"/><circle cx="250" cy="50" r="2.6"/></g>`
      + mono(244, 100, 'manganese in the water', { size: 7.5, fill: C.purpleLt, w: 700 })
      + mono(244, 30, 'CONTACT BASIN', { size: 7.5, fill: C.dim, ls: '.1em', w: 700 })
      + `<path d="M318 62 h16 m0 0 l-5 -4 m5 4 l-5 4" fill="none" stroke="${C.solidSh}" stroke-width="1.3" stroke-linecap="round"/>`
      + mono(338, 50, 'undissolved', { size: 7.5, fill: C.solidSh, anchor: 'start', w: 700 })
      + mono(338, 62, 'rakes out', { size: 7.5, fill: C.solidSh, anchor: 'start' })
      + mono(338, 74, 'with sludge', { size: 7.5, fill: C.solidSh, anchor: 'start' });
  } }),

  // ================= C.11(B) how much is in, against the limit =================
  // One grammar: the vessel, and beside it a scale with the saturation limit drawn on it,
  // plus the conductivity lamp that says whether the solution carries current.

  // The honey jar that threw a crust the day a crumb went in.
  'b-honey': scene('b-honey', { caption: 'THE BREAK-ROOM JAR · IT WAS HOLDING TOO MUCH', theme: 'room', body: k => {
    const g = k.glass('jar', ['#4a3105', '#a8761b', '#f0cd7c']);
    return breakRoom(90)
      // the jar of honey, with the crust it threw
      + `<g><path d="M34 30 h58 v52 a6 6 0 0 1 -6 6 H40 a6 6 0 0 1 -6 -6 z" fill="${g}" opacity=".85" stroke="${C.steelLt}" stroke-width="1.4"/>`
      + `<rect x="30" y="20" width="66" height="11" rx="3" fill="${C.copper7}" stroke="${C.steelLt}" stroke-width="1.1"/>`
      + crystals(38, 86, 50, { n: 7, seed: 6, tint: '#f4e3b4', size: 8 })
      + `<g fill="#fff3cf" opacity=".8"><circle cx="52" cy="52" r="2.4"/><circle cx="74" cy="46" r="2"/><circle cx="66" cy="66" r="2.6"/></g>`
      + `</g>`
      + mono(63, 100, 'a crumb went in', { size: 7.5, fill: C.honey, w: 700 })
      // the crumb, still falling in the picture
      + `<circle cx="86" cy="14" r="2.4" fill="${C.copper1}"/>`
      + `<path d="M86 18 V26" stroke="${C.copper1}" stroke-width="1" stroke-dasharray="2 2"/>`
      + threshold(132, 90, 22, 64, { value: .92, limit: .68, tint: C.honey, limLabel: 'SAT LIMIT', valLabel: 'held' })
      + mono(143, 100, 'in the jar', { size: 7, fill: C.pale })
      + slip(232, 14, 152, 76, { title: 'CLASSIFY THE TANK', lines: [
        ['unsaturated', 'room left'],
        ['saturated', 'at the line'],
        ['SUPERSATURATED', 'over it', true],
        ['conducts?', 'no — molecular']
      ] });
  } }),

  // Road salt on a February driveway, and the softener brine tank doing the same thing.
  'b-salt': scene('b-salt', { caption: 'THE BRINE TANK · SALT ON ICE THAT WILL NOT TAKE IT', body: k => {
    return plant(92, { door: true })
      // through the open door: the icy slab, the grains that stopped working
      + `<rect x="286" y="24" width="86" height="68" fill="#9fb6bd" opacity=".2"/>`
      + `<g fill="${C.solid}" opacity=".8">`
      + [0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => `<rect x="${294 + (i * 9) % 74}" y="${62 + (i % 3) * 8}" width="2.6" height="2.6" transform="rotate(${i * 17} ${295.3 + (i * 9) % 74} ${63.3 + (i % 3) * 8})"/>`).join('')
      + `</g>`
      + mono(329, 34, 'FEB · 20:10', { size: 7, fill: C.pale, ls: '.08em', w: 700 })
      + mono(329, 100, 'salt on ice, not melting', { size: 7, fill: C.pale })
      // the brine tank in the softener room: saturated, with the surplus on the floor of it
      + beaker(30, 22, 62, 68, { k, n: 'brine', level: .8, tint: '#2e7f8f', solid: .9, ions: 20, ionTint: C.waterLt, seed: 12, label: 'brine tank' })
      + `<path d="M28 34 h66" stroke="${C.warn}" stroke-width="1.3" stroke-dasharray="4 3"/>`
      + mono(96, 37, 'SATURATED', { size: 7, fill: C.warn, anchor: 'start', w: 700 })
      + mono(61, 100, 'the surplus just sits', { size: 7.5, fill: C.solidSh, w: 700 })
      // the conductivity probe: brine is an electrolyte and the lamp says so
      + `<g><rect x="164" y="22" width="44" height="30" rx="3" fill="#1b262c" stroke="${C.steelLt}" stroke-width="1.3"/>`
      + `<circle cx="176" cy="37" r="6" fill="${C.success}" opacity=".9"/>`
      + `<circle cx="176" cy="37" r="10" fill="${C.success}" opacity=".25"/>`
      + mono(196, 40, 'ON', { size: 8, fill: C.success, w: 700 })
      + `<path d="M172 52 V82 h-58" fill="none" stroke="${C.steelLt}" stroke-width="2"/>`
      + `<path d="M198 52 V90 h-104" fill="none" stroke="${C.steelLt}" stroke-width="2"/></g>`
      + mono(186, 64, 'it conducts', { size: 8, fill: '#5fd39a', w: 700 })
      + mono(186, 75, 'ions are free', { size: 7.5, fill: C.dim })
      + threshold(228, 90, 20, 62, { value: .68, limit: .68, tint: C.teal3, limLabel: 'LIMIT', valLabel: 'at it', over: false });
  } }),

  // A day tank in the chemical bay, quietly holding more than its label allows.
  'b-tank': scene('b-tank', { caption: 'THE CHEMICAL BAY · STABLE UNTIL SOMETHING KNOCKS IT', body: k => {
    const g = k.glass('tk', ['#12313a', '#2a6b7c', '#9dcbd7']);
    return plant(92)
      // the day tank: a moulded cone-bottom vessel on its frame
      + `<g><path d="M30 26 h72 v44 l-36 22 -36 -22 z" fill="${g}" opacity=".55" stroke="${C.steelLt}" stroke-width="1.5"/>`
      + `<rect x="26" y="18" width="80" height="9" rx="3" fill="${C.concrete}" stroke="${C.steelLt}" stroke-width="1"/>`
      + `<path d="M33 40 h66 v28 l-33 20 -33 -20 z" fill="#3b8ea2" opacity=".55"/>`
      + `<path d="M33 40 h66" stroke="${C.waterLt}" stroke-width="1.4"/>`
      + `<g fill="${C.waterLt}" opacity=".7"><circle cx="52" cy="54" r="1.8"/><circle cx="72" cy="62" r="1.8"/>`
      + `<circle cx="63" cy="48" r="1.8"/><circle cx="84" cy="52" r="1.8"/><circle cx="58" cy="72" r="1.8"/></g>`
      + `<g stroke="${C.steelLt}" stroke-width="2.4" opacity=".8"><path d="M36 70 V92"/><path d="M96 70 V92"/></g>`
      + `<path d="M66 92 V98 h30" fill="none" stroke="${C.steelLt}" stroke-width="2.4"/></g>`
      + `<path d="M28 40 h76" stroke="${C.warn}" stroke-width="1.3" stroke-dasharray="4 3"/>`
      + mono(66, 14, 'DAY TANK 3', { size: 7.5, fill: C.dim, ls: '.08em', w: 700 })
      // the knock it is one of away from
      + `<g transform="translate(126,60)">`
      + `<path d="M0 0 l10 -14 -3 12 h8 l-13 16 4 -14 z" fill="${C.ember}"/>`
      + `<g stroke="${C.ember}" stroke-width="1.3" opacity=".7" fill="none">`
      + `<path d="M14 -8 q6 8 0 16"/><path d="M20 -12 q9 12 0 24"/></g></g>`
      + mono(140, 92, 'one knock', { size: 7.5, fill: C.ember, w: 700 })
      + threshold(178, 90, 22, 66, { value: .93, limit: .66, tint: C.teal3, limLabel: 'SAT LIMIT', valLabel: 'held' })
      + slip(252, 16, 132, 74, { title: 'THE BAY LABEL', lines: [
        ['holding', 'over the line', true],
        ['state', 'supersaturated', true],
        ['conducts?', 'yes — ionic'],
        ['action', 'flag the tank']
      ] });
  } }),

  // ================= C.11(C) the curve is a number, not a rule of thumb =================
  // Three scenes, one instrument. The chart is drawn from real g/100 g data in SOL, and
  // every one of these reads a value off it.

  // The cold glass: everyone already knows this one, and the curve says how much.
  'c-tea': scene('c-tea', { caption: 'THE COLD GLASS · THE CURVE SAYS HOW MUCH', theme: 'room', body: k => {
    return breakRoom(90, { window: false })
      + beaker(20, 24, 40, 66, { k, n: 'glass', level: .78, tint: C.tea, solid: .8, seed: 4, label: 'iced tea' })
      + `<g fill="${C.white}" opacity=".5">`
      + `<rect x="26" y="40" width="12" height="10" rx="2" transform="rotate(-14 32 45)"/>`
      + `<rect x="42" y="48" width="11" height="9" rx="2" transform="rotate(11 47 52)"/></g>`
      + `<g><rect x="70" y="46" width="7" height="44" rx="3.5" fill="#0b1a21" stroke="${C.steelLt}" stroke-width="1.1"/>`
      + `<rect x="71.5" y="72" width="4" height="17" rx="2" fill="${C.waterLt}"/>`
      + `<circle cx="73.5" cy="92" r="5" fill="${C.waterLt}" stroke="${C.steelLt}" stroke-width="1"/></g>`
      + mono(74, 40, '10 C', { size: 7.5, fill: C.waterLt, w: 700 })
      + solChart(112, 12, 200, 74, {
        keys: ['KNO3', 'NaNO3', 'KClO3'],
        mark: { key: 'KNO3', t: 10, tText: '10', sText: '22' }
      })
      + mono(320, 34, 'read it off', { size: 8, fill: C.white, anchor: 'start', w: 700 })
      + mono(320, 47, 'at the', { size: 8, fill: C.white, anchor: 'start' })
      + mono(320, 60, 'marked', { size: 8, fill: C.white, anchor: 'start' })
      + mono(320, 73, 'temperature', { size: 8, fill: C.white, anchor: 'start' });
  } }),

  // The mixing bench: two beakers that prove rate and solubility are different questions.
  'c-rate': scene('c-rate', { caption: 'THE MIXING BENCH · HOW MUCH IS NOT HOW FAST', body: k => {
    return plant(92)
      // stirred powder on the left, an untouched lump on the right: same solid, same water
      + beaker(18, 30, 38, 58, { k, n: 'stir', level: .74, tint: C.teal7, ions: 14, seed: 2, label: 'stirred' })
      + `<rect x="35.5" y="16" width="3" height="42" rx="1.5" fill="${C.steelLt}"/>`
      + `<path d="M28 62 q9 -6 18 0" fill="none" stroke="${C.steelLt}" stroke-width="2.2"/>`
      + `<g fill="none" stroke="${C.waterLt}" stroke-width="1.2" opacity=".8">`
      + `<path d="M24 50 q13 -7 26 0"/><path d="M24 72 q13 7 26 0"/></g>`
      + beaker(70, 30, 38, 58, { k, n: 'still', level: .74, tint: C.teal7, ions: 3, solid: .8, seed: 15, label: 'left alone' })
      + mono(37, 100, 'powder', { size: 7.5, fill: '#5fd39a', w: 700 })
      + mono(89, 100, 'one lump', { size: 7.5, fill: C.ember, w: 700 })
      + solChart(140, 12, 168, 74, { keys: ['KNO3', 'NH4Cl', 'NaCl'], mark: { key: 'NH4Cl', t: 50, tText: '50', sText: '50' }, sLab: true })
      // the two levers, drawn as what they do and do not move
      + `<path d="M320 30 h18 m0 0 l-5 -4 m5 4 l-5 4" fill="none" stroke="${C.ember}" stroke-width="1.3" stroke-linecap="round"/>`
      + mono(320, 24, 'heat', { size: 7.5, fill: C.ember, anchor: 'start', w: 700 })
      + mono(320, 43, 'moves the', { size: 7.5, fill: C.ember, anchor: 'start' })
      + mono(320, 54, 'curve', { size: 7.5, fill: C.ember, anchor: 'start' })
      + `<path d="M320 68 h18" stroke="${C.steel}" stroke-width="1.3"/>`
      + `<path d="M325 63 l8 10 M333 63 l-8 10" stroke="${C.danger}" stroke-width="1.4" stroke-linecap="round"/>`
      + mono(320, 86, 'stirring does', { size: 7.5, fill: C.steel, anchor: 'start', w: 700 })
      + mono(320, 97, 'not', { size: 7.5, fill: C.steel, anchor: 'start', w: 700 });
  } }),

  // The basin overnight: whatever it cannot hold at its own temperature comes out on the
  // floor of it while nobody is watching.
  'c-basin': scene('c-basin', { caption: 'THE BASIN OVERNIGHT · IT HOLDS WHAT THE CURVE SAYS', body: k => {
    return plant(92)
      + `<circle cx="40" cy="20" r="10" fill="${C.pale}" opacity=".3"/>`
      + `<circle cx="36" cy="18" r="9" fill="${C.night}" opacity=".9"/>`
      + `<g fill="${C.pale}" opacity=".5"><circle cx="66" cy="14" r="1.2"/><circle cx="82" cy="26" r="1"/><circle cx="54" cy="32" r="1"/></g>`
      + basin(20, 34, 116, 56, { k, n: 'bs', level: .76, sludge: 9 })
      + `<g fill="${C.waterLt}" opacity=".8">`
      + `<circle cx="46" cy="56" r="1.8"/><circle cx="72" cy="64" r="1.8"/><circle cx="100" cy="54" r="1.8"/>`
      + `<circle cx="60" cy="72" r="1.8"/><circle cx="112" cy="70" r="1.8"/></g>`
      + crystals(28, 86, 100, { n: 8, seed: 19, tint: C.solidSh, size: 5 })
      + mono(78, 100, 'what it could not hold', { size: 7.5, fill: C.solidSh, w: 700 })
      + `<g><rect x="146" y="40" width="7" height="42" rx="3.5" fill="#0b1a21" stroke="${C.steelLt}" stroke-width="1.1"/>`
      + `<rect x="147.5" y="68" width="4" height="15" rx="2" fill="${C.waterLt}"/>`
      + `<circle cx="149.5" cy="86" r="5" fill="${C.waterLt}" stroke="${C.steelLt}" stroke-width="1"/></g>`
      + mono(144, 34, 'T basin', { size: 7, fill: C.waterLt, w: 700 })
      + solChart(186, 12, 152, 74, { keys: ['KNO3', 'NaNO3', 'NH4Cl'], mark: { key: 'KNO3', t: 30, tText: 'T', sText: 'S' } })
      + mono(346, 40, 'below', { size: 7.5, fill: C.success, anchor: 'start', w: 700 })
      + mono(346, 52, 'the line:', { size: 7.5, fill: C.success, anchor: 'start' })
      + mono(346, 64, 'stays in', { size: 7.5, fill: C.success, anchor: 'start' })
      + mono(346, 82, 'above it:', { size: 7.5, fill: C.danger, anchor: 'start', w: 700 })
      + mono(346, 94, 'drops out', { size: 7.5, fill: C.danger, anchor: 'start' });
  } }),

  // ================= C.11(D) which product leaves the water =================
  // Both scenes are two ions meeting. The difference is what happens next.

  // The kettle: the white crust got there by exactly this route.
  'd-kettle': scene('d-kettle', { caption: 'THE KETTLE · TWO IN SOLUTION MET AND ONE LEFT', theme: 'room', body: k => {
    const g = k.glass('kt', ['#20282c', '#59656c', '#b7c4c9']);
    return breakRoom(90, { window: false })
      // the kettle, cut open, with the scale on its element
      + `<g><path d="M26 34 h56 q8 0 8 8 v34 q0 8 -8 8 H34 q-8 0 -8 -8 z" fill="${g}" opacity=".9" stroke="${C.steelLt}" stroke-width="1.4"/>`
      + `<path d="M90 44 q16 12 0 26" fill="none" stroke="${C.steelLt}" stroke-width="3.4"/>`
      + `<rect x="40" y="26" width="26" height="9" rx="3" fill="${C.steelLt}"/>`
      + `<path d="M31 52 h46 v22 H31 z" fill="#3b8ea2" opacity=".45"/>`
      + `<path d="M31 52 h46" stroke="${C.waterLt}" stroke-width="1.3"/>`
      + `<rect x="36" y="70" width="36" height="4" rx="2" fill="${C.steel}"/>`
      + crystals(34, 71, 40, { n: 6, seed: 8, tint: C.solid, size: 5 })
      + `</g>`
      + mono(58, 100, 'scale on the element', { size: 7.5, fill: C.solid, w: 700 })
      // the route it took, drawn: two ions meet, one pair stays, one pair leaves
      + ionPair(128, 30, { k, n: 'p1', cat: 'Ca', an: 'CO3', gap: 30 })
      + `<path d="M172 30 h18 m0 0 l-5 -4 m5 4 l-5 4" fill="none" stroke="${C.pale}" stroke-width="1.3" stroke-linecap="round"/>`
      + `<g transform="translate(206,22)">`
      + `<rect x="0" y="0" width="16" height="16" rx="2" fill="${C.solid}"/>`
      + `<path d="M0 5 h16 M0 11 h16 M5 0 v16 M11 0 v16" stroke="${C.solidSh}" stroke-width=".9"/></g>`
      + `<path d="M214 42 V58 m0 0 l-4 -5 m4 5 l4 -5" fill="none" stroke="${C.solid}" stroke-width="1.4" stroke-linecap="round"/>`
      + mono(214, 70, 'insoluble', { size: 7.5, fill: C.solid, w: 700 })
      + mono(214, 82, 'it leaves', { size: 7.5, fill: C.solid })
      + ionPair(258, 62, { k, n: 'p2', cat: 'Na', an: 'Cl', gap: 30 })
      + mono(258, 95, 'soluble: stays in', { size: 7.5, fill: C.waterLt, w: 700 })
      + slip(306, 14, 78, 60, { title: 'RULES', lines: [
        ['carbonate', 'no'],
        ['nitrate', 'yes'],
        ['Group 1', 'yes']
      ] });
  } }),

  // The dosing point: whether the dose helps depends on which product drops out.
  'd-basin': scene('d-basin', { caption: 'THE DOSING POINT · WHICH PRODUCT LEAVES THE WATER', body: k => {
    return plant(92)
      + dosePump(20, 16, { label: 'FEED' })
      + `<path d="M36 42 V56" stroke="${C.steelLt}" stroke-width="3" stroke-linecap="round"/>`
      + `<g fill="${C.success}" opacity=".8"><circle cx="36" cy="60" r="2.2"/><circle cx="36" cy="66" r="1.8"/></g>`
      + basin(20, 44, 240, 48, { k, n: 'bs', level: .8, sludge: 8, weir: false })
      // the flow left to right, and the meeting in the middle of it
      + `<g stroke="${C.waterLt}" stroke-width="1.2" fill="none" opacity=".45">`
      + `<path d="M32 78 h40 m8 0 h40"/><path d="M120 86 h60"/></g>`
      + ionPair(74, 60, { k, n: 'in', cat: 'Mn', an: 'X', gap: 24 })
      + `<path d="M112 60 h14 m0 0 l-5 -4 m5 4 l-5 4" fill="none" stroke="${C.pale}" stroke-width="1.2" stroke-linecap="round"/>`
      + `<g transform="translate(136,52)">`
      + `<rect x="0" y="0" width="15" height="15" rx="2" fill="${C.purpleLt}"/>`
      + `<path d="M0 5 h15 M0 10 h15 M5 0 v15 M10 0 v15" stroke="${C.purple}" stroke-width=".9"/></g>`
      + `<path d="M143 70 V80 m0 0 l-3.5 -4.5 m3.5 4.5 l3.5 -4.5" fill="none" stroke="${C.purpleLt}" stroke-width="1.3" stroke-linecap="round"/>`
      + mono(143, 30, 'the solid carries', { size: 7, fill: C.purpleLt, w: 700 })
      + mono(143, 42, 'the contaminant out', { size: 7, fill: C.purpleLt })
      + ionPair(186, 62, { k, n: 'out', cat: 'Na', an: 'NO3', gap: 26 })
      + mono(199, 84, 'this pair stays in', { size: 7, fill: C.waterLt })
      + mono(140, 100, 'it settles and gets raked out', { size: 7.5, fill: C.solidSh, w: 700 })
      + slip(272, 14, 112, 76, { title: 'PREDICT', lines: [
        ['product 1', 'insoluble', true],
        ['product 2', 'soluble'],
        ['', ''],
        ['treatment', 'works']
      ] });
  } }),

  // ================= C.11(E) a mass and a volume make a molarity =================
  // Both scenes are the balance handing a number to the flask. The difference is the
  // chemical: one is a bench standard nobody can see, one is purple and unforgiving.

  'e-scoop': scene('e-scoop', { caption: 'THE BENCH STANDARD · A MASS INTO A KNOWN VOLUME', body: k => {
    return plant(92)
      + balance(18, 44, { mass: '14.61 g', heap: 1 })
      + mono(51, 100, 'weigh the solid', { size: 7.5, fill: C.pale, w: 700 })
      + `<path d="M92 52 C110 52 116 42 130 40 m0 0 l-6 -2.5 m6 2.5 l-5 3.5" fill="none" stroke="${C.pale}" stroke-width="1.3" stroke-linecap="round"/>`
      + volFlask(166, 12, 74, { k, n: 'vf', tint: C.teal, fill: .95, label: '250.0 mL' })
      + `<g fill="${C.waterLt}" opacity=".7">`
      + `<circle cx="152" cy="70" r="1.7"/><circle cx="176" cy="76" r="1.7"/><circle cx="166" cy="62" r="1.7"/>`
      + `<circle cx="186" cy="66" r="1.7"/><circle cx="158" cy="82" r="1.7"/></g>`
      + slip(226, 14, 158, 76, { title: 'MAKE IT UP', lines: [
        ['solute', 'NaCl'],
        ['mass', '14.61 g'],
        ['final volume', '250.0 mL'],
        ['M = mol / L', '1.00 M', true]
      ] })
      + mono(305, 100, 'every reading today is checked on this', { size: 7, fill: C.dim, w: 700 });
  } }),

  'e-permang': scene('e-permang', { caption: 'THE DOSING BARREL · PURPLE IS UNFORGIVING', body: k => {
    return plant(92)
      + balance(16, 44, { mass: '23.7 g', tint: '#4a2159', heap: 1 })
      + mono(49, 100, 'KMnO4 crystals', { size: 7.5, fill: C.purpleLt, w: 700 })
      + `<path d="M90 52 C104 52 110 44 122 42 m0 0 l-6 -2.5 m6 2.5 l-5 3.5" fill="none" stroke="${C.purpleLt}" stroke-width="1.3" stroke-linecap="round"/>`
      + volFlask(158, 14, 70, { k, n: 'vf', tint: C.purple, fill: .95, label: '1.00 L' })
      + `<path d="M188 54 C204 54 208 48 220 46 m0 0 l-6 -2.5 m6 2.5 l-5 3.5" fill="none" stroke="${C.purpleLt}" stroke-width="1.3" stroke-linecap="round"/>`
      // the feed barrel it is going into, and the pump that meters it
      + `<g><path d="M232 34 h58 v50 a7 7 0 0 1 -7 7 H239 a7 7 0 0 1 -7 -7 z" fill="#2a2233" stroke="${C.steelLt}" stroke-width="1.4"/>`
      + `<ellipse cx="261" cy="34" rx="29" ry="6" fill="#3c2f49" stroke="${C.steelLt}" stroke-width="1.2"/>`
      + `<path d="M236 48 h50 v34 a5 5 0 0 1 -5 5 H241 a5 5 0 0 1 -5 -5 z" fill="${C.purple}" opacity=".7"/>`
      + `<ellipse cx="261" cy="48" rx="25" ry="4" fill="${C.purpleLt}" opacity=".55"/></g>`
      + mono(261, 100, 'the permanganate feed', { size: 7.5, fill: C.purpleLt, w: 700 })
      + dosePump(300, 62, { tint: C.purpleLt })
      + `<path d="M290 75 h10" stroke="${C.steelLt}" stroke-width="2.4"/>`
      + `<path d="M332 75 h24" fill="none" stroke="${C.steelLt}" stroke-width="2.4"/>`
      + mono(384, 24, 'weak:', { size: 7.5, fill: C.warn, anchor: 'end', w: 700 })
      + mono(384, 35, 'Mn goes through', { size: 7, fill: C.warn, anchor: 'end' })
      + mono(384, 50, 'strong:', { size: 7.5, fill: C.danger, anchor: 'end', w: 700 })
      + mono(384, 61, 'pink from the tap', { size: 7, fill: C.danger, anchor: 'end' });
  } }),

  // ================= C.11(F) the measured draw =================
  // Both scenes are C1V1 = C2V2 drawn: a strong small volume becoming a weak large one.

  'f-cleaner': scene('f-cleaner', { caption: 'THE WORKING STRENGTH · ONE PART DRAWN, THE REST WATER', theme: 'room', body: k => {
    const g = k.glass('btl', ['#123', '#2c6675', '#a6d3dd']);
    return breakRoom(90, { window: false })
      // the concentrated bottle, back of the cupboard
      + `<g><path d="M22 34 h34 v48 a5 5 0 0 1 -5 5 H27 a5 5 0 0 1 -5 -5 z" fill="${g}" opacity=".6" stroke="${C.steelLt}" stroke-width="1.3"/>`
      + `<rect x="32" y="20" width="14" height="15" rx="2" fill="${C.steelLt}"/>`
      + `<path d="M24 44 h30 v37 a4 4 0 0 1 -4 4 H28 a4 4 0 0 1 -4 -4 z" fill="${C.success}" opacity=".7"/>`
      + `<rect x="25" y="52" width="28" height="18" rx="2" fill="${C.card}" opacity=".9"/>`
      + mono(39, 64, 'CONC', { size: 7, fill: C.ink, w: 700 })
      + `</g>`
      + mono(39, 100, 'stock', { size: 7.5, fill: C.success, w: 700 })
      + graduate(76, 40, 24, 48, { k, n: 'gc', tint: C.success, fill: .55, label: 'V1' })
      + `<path d="M104 56 h18 m0 0 l-5 -4 m5 4 l-5 4" fill="none" stroke="${C.pale}" stroke-width="1.3" stroke-linecap="round"/>`
      // the batch bottle it goes into, topped to volume
      + beaker(132, 26, 54, 64, { k, n: 'batch', level: .84, tint: '#3d8f6a', ions: 10, seed: 6, label: 'V2 batch' })
      + `<path d="M130 36 h58" stroke="${C.white}" stroke-width="1.1" stroke-dasharray="3 3"/>`
      + mono(159, 100, 'made up to volume', { size: 7.5, fill: C.pale, w: 700 })
      // the arithmetic, as two bars: strong and small, weak and large
      + `<g><rect x="212" y="46" width="18" height="40" fill="${C.success}" opacity=".85"/>`
      + `<rect x="212" y="46" width="18" height="40" fill="none" stroke="${C.steelLt}" stroke-width="1"/>`
      + mono(221, 40, 'C1V1', { size: 7.5, fill: C.success, w: 700 })
      + `<rect x="248" y="66" width="46" height="20" fill="${C.success}" opacity=".5"/>`
      + `<rect x="248" y="66" width="46" height="20" fill="none" stroke="${C.steelLt}" stroke-width="1"/>`
      + mono(271, 60, 'C2V2', { size: 7.5, fill: C.success, w: 700 })
      + `<path d="M234 66 h10" stroke="${C.pale}" stroke-width="1.4"/>`
      + mono(239, 62, '=', { size: 9, fill: C.pale, w: 700 })
      + `</g>`
      + mono(253, 100, 'same amount of solute', { size: 7, fill: C.dim, w: 700 })
      + slip(304, 20, 80, 56, { title: 'BACK LABEL', lines: [
        ['dilute', '1 : 10'],
        ['batch', '250 mL'],
        ['draw', '25 mL', true]
      ] });
  } }),

  'f-stock': scene('f-stock', { caption: 'THE TITRATION BENCH · THE DRAW IS THE WHOLE DECISION', body: k => {
    const g = k.glass('acid', ['#3a2410', '#8a6224', '#e5cd94']);
    return plant(92)
      // the burette the day's titrations run off
      + `<g><rect x="30" y="8" width="12" height="60" rx="2" fill="${k.glass('bur', ['#16323b', '#2c6675', '#a6d3dd'])}" opacity=".5" stroke="${C.steelLt}" stroke-width="1.2"/>`
      + `<rect x="31.5" y="20" width="9" height="47" fill="${C.copper1}" opacity=".55"/>`
      + `<path d="M31.5 20 h9" stroke="${C.copper1}" stroke-width="1.4"/>`
      + `<g stroke="${C.pale}" stroke-width=".8" opacity=".7">`
      + [16, 24, 32, 40, 48, 56, 64].map(y => `<path d="M42 ${y} h5"/>`).join('') + `</g>`
      + `<path d="M33 68 h6 l-3 8 z" fill="${C.steelLt}"/>`
      + `<circle cx="36" cy="70" r="3.6" fill="${C.steelLt}"/></g>`
      + `<path d="M36 78 v4" stroke="${C.copper1}" stroke-width="1.6"/>`
      + beaker(22, 76, 30, 16, { k, n: 'conical', level: .7, tint: '#b8791f', lip: false })
      + mono(36, 100, 'the run', { size: 7.5, fill: C.copper1, w: 700 })
      // the concentrated stock, and the measured draw out of it
      + `<g><path d="M70 40 h34 v44 a5 5 0 0 1 -5 5 H75 a5 5 0 0 1 -5 -5 z" fill="${g}" opacity=".75" stroke="${C.steelLt}" stroke-width="1.3"/>`
      + `<rect x="80" y="28" width="14" height="13" rx="2" fill="${C.steelLt}"/>`
      + `<rect x="73" y="54" width="28" height="16" rx="2" fill="${C.card}" opacity=".9"/>`
      + mono(87, 65, 'HCl', { size: 7.5, fill: C.danger, w: 700 })
      + `<path d="M78 22 l6 -8 6 8" fill="none" stroke="${C.danger}" stroke-width="1.4"/></g>`
      + mono(87, 100, 'concentrated', { size: 7.5, fill: C.danger, w: 700 })
      + graduate(120, 34, 22, 54, { k, n: 'gc', tint: '#b8791f', fill: .42, label: 'V1' })
      + `<path d="M146 58 h16 m0 0 l-5 -4 m5 4 l-5 4" fill="none" stroke="${C.pale}" stroke-width="1.3" stroke-linecap="round"/>`
      + volFlask(196, 16, 66, { k, n: 'vf', tint: '#c99a3e', fill: .95, label: 'V2 to the mark' })
      + slip(252, 14, 132, 76, { title: 'C1V1 = C2V2', lines: [
        ['C1 stock', '12.0 M'],
        ['C2 working', '0.500 M'],
        ['V2 batch', '500 mL'],
        ['V1 draw', '20.8 mL', true]
      ] });
  } }),

  // ================= Honors: the number under the rule =================

  // h1: Q against Ksp. Soluble is a limit, not a yes or no.
  'h1-ksp': scene('h1-ksp', { caption: 'THE CLEARWELL · Q AGAINST THE NUMBER UNDERNEATH', theme: 'copper', body: k => {
    return `<rect width="400" height="102" fill="#160f07" opacity=".35"/>`
      // two streams meeting in the clearwell
      + `<path d="M0 22 h74 v18" fill="none" stroke="${C.steelLt}" stroke-width="4"/>`
      + `<path d="M0 78 h74 v-18" fill="none" stroke="${C.steelLt}" stroke-width="4"/>`
      + `<g fill="${C.cation}" opacity=".85"><circle cx="22" cy="22" r="3"/><circle cx="42" cy="22" r="3"/><circle cx="60" cy="22" r="3"/></g>`
      + `<g fill="${C.anion}" opacity=".85"><circle cx="22" cy="78" r="3"/><circle cx="42" cy="78" r="3"/><circle cx="60" cy="78" r="3"/></g>`
      + mono(36, 16, 'ion A', { size: 7, fill: C.cation, w: 700 })
      + mono(36, 92, 'ion B', { size: 7, fill: C.anion, w: 700 })
      + basin(74, 30, 96, 58, { k, n: 'cw', level: .8, tint: '#7a5a2a', sludge: 6 })
      + ionPair(104, 56, { k, n: 'meet', cat: '+', an: '-', gap: 26 })
      + mono(122, 24, 'THE CLEARWELL', { size: 7, fill: C.copper1, ls: '.08em', w: 700 })
      + threshold(192, 90, 26, 72, { value: .84, limit: .56, tint: C.copper, limLabel: 'Ksp', valLabel: 'Q' })
      + mono(205, 100, 'this tank', { size: 7, fill: C.copper1 })
      + slip(268, 14, 116, 76, { title: 'THE CALL', lines: [
        ['Q > Ksp', 'it drops out', true],
        ['Q = Ksp', 'at the edge'],
        ['Q < Ksp', 'stays in'],
        ['common ion', 'raises Q']
      ] });
  } }),

  // h2: the cooling tank. The curve read twice and subtracted is a mass of solid.
  'h2-crys': scene('h2-crys', { caption: 'THE COOLING TANK · THE CURVE READ TWICE, SUBTRACTED', theme: 'copper', body: k => {
    const g = k.glass('tk', ['#2a2010', '#6b5426', '#d9bd7e']);
    return `<rect width="400" height="102" fill="#160f07" opacity=".3"/>`
      // the jacketed tank, cooling, with what has already come out on its floor
      + `<g><path d="M20 26 h76 v52 a8 8 0 0 1 -8 8 H28 a8 8 0 0 1 -8 -8 z" fill="${g}" opacity=".6" stroke="${C.steelLt}" stroke-width="1.5"/>`
      + `<path d="M14 34 v40 a6 6 0 0 0 6 6" fill="none" stroke="${C.copper7}" stroke-width="3"/>`
      + `<path d="M102 34 v40 a6 6 0 0 1 -6 6" fill="none" stroke="${C.copper7}" stroke-width="3"/>`
      + `<path d="M25 40 h66 v36 a6 6 0 0 1 -6 6 H31 a6 6 0 0 1 -6 -6 z" fill="#8a6a2c" opacity=".55"/>`
      + `<path d="M25 40 h66" stroke="${C.copper1}" stroke-width="1.4"/>`
      + crystals(28, 82, 60, { n: 7, seed: 5, tint: C.crystal, size: 7 })
      + `</g>`
      + `<g stroke="${C.waterLt}" stroke-width="1.4" fill="none" opacity=".7">`
      + `<path d="M8 44 q-5 6 0 12"/><path d="M108 44 q5 6 0 12"/></g>`
      + mono(58, 100, 'solid on the floor of it', { size: 7.5, fill: C.crystal, w: 700 })
      + `<g><rect x="118" y="34" width="7" height="44" rx="3.5" fill="#0b1a21" stroke="${C.steelLt}" stroke-width="1.1"/>`
      + `<rect x="119.5" y="62" width="4" height="17" rx="2" fill="${C.waterLt}"/>`
      + `<circle cx="121.5" cy="82" r="5" fill="${C.waterLt}" stroke="${C.steelLt}" stroke-width="1"/>`
      + `<path d="M128 40 v22 m0 0 l-3 -5 m3 5 l3 -5" fill="none" stroke="${C.waterLt}" stroke-width="1.3" stroke-linecap="round"/></g>`
      + mono(122, 28, 'cooling', { size: 7, fill: C.waterLt, w: 700 })
      + solChart(162, 12, 156, 74, { keys: ['KNO3'], mark: { key: 'KNO3', t: 30, tText: 'cold', sText: 'S2' }, band: [30, 80], sLab: true, tLab: false })
      // the second read, and the bracket between them that IS the yield
      + `<circle cx="${(162 + 0.8 * 156).toFixed(1)}" cy="${(12 + 74 - Math.min(1, 169 / 250) * 74).toFixed(1)}" r="3.4" fill="${C.white}" stroke="${C.ember}" stroke-width="2"/>`
      + `<path d="M${(162 + 0.8 * 156).toFixed(1)} 86 V${(12 + 74 - Math.min(1, 169 / 250) * 74).toFixed(1)} H162" fill="none" stroke="${C.white}" stroke-width="1.1" stroke-dasharray="3 3" opacity=".9"/>`
      + mono(287, 95, 'hot', { size: 7, fill: C.white, w: 700 })
      + mono(158, 34, 'S1', { size: 7.5, fill: C.white, anchor: 'end', w: 700 })
      + `<path d="M330 34 V68 m-4 0 h8 m-8 -34 h8" stroke="${C.ember}" stroke-width="1.4" fill="none"/>`
      + mono(336, 44, 'S1 - S2', { size: 8, fill: C.ember, anchor: 'start', w: 700 })
      + mono(336, 57, '= grams', { size: 8, fill: C.ember, anchor: 'start' })
      + mono(336, 70, 'out', { size: 8, fill: C.ember, anchor: 'start' });
  } }),

  // ================= Capstone: one batch, end to end =================
  'cap-batch': scene('cap-batch', { caption: 'THE BATCH THAT LIFTS THE NOTICE · EVERY STEP AT ONCE', theme: 'copper', body: k => {
    return `<rect width="400" height="102" fill="#160f07" opacity=".35"/>`
      // 1. the stock, classified
      + beaker(14, 34, 30, 50, { k, n: 'stock', level: .74, tint: '#8a6a2c', ions: 10, ionTint: C.copper1, seed: 7 })
      + mono(29, 96, 'classify', { size: 7, fill: C.copper1, w: 700 })
      + `<path d="M48 58 h12 m0 0 l-4 -3 m4 3 l-4 3" fill="none" stroke="${C.copper1}" stroke-width="1.2" stroke-linecap="round"/>`
      // 2. the flask, on spec
      + volFlask(84, 30, 54, { k, n: 'vf', tint: '#c99a3e', fill: .95, mark: false })
      + mono(84, 96, 'on spec', { size: 7, fill: C.copper1, w: 700 })
      + `<path d="M110 58 h12 m0 0 l-4 -3 m4 3 l-4 3" fill="none" stroke="${C.copper1}" stroke-width="1.2" stroke-linecap="round"/>`
      // 3. the dose and what it drops out
      + dosePump(126, 22, { tint: C.copper1 })
      + `<path d="M142 48 V56" stroke="${C.steelLt}" stroke-width="2.4"/>`
      + basin(126, 56, 96, 34, { k, n: 'bs', level: .78, tint: '#6a5326', sludge: 6 })
      + `<g transform="translate(166,64)"><rect x="0" y="0" width="12" height="12" rx="2" fill="${C.crystal}"/>`
      + `<path d="M0 4 h12 M0 8 h12 M4 0 v12 M8 0 v12" stroke="${C.solidSh}" stroke-width=".8"/></g>`
      + mono(174, 96, 'it drops out', { size: 7, fill: C.crystal, w: 700 })
      + `<path d="M226 72 h12 m0 0 l-4 -3 m4 3 l-4 3" fill="none" stroke="${C.copper1}" stroke-width="1.2" stroke-linecap="round"/>`
      // 4. the state lab's sample bottle, and the notice waiting on it
      + `<g><path d="M244 44 h26 v40 a4 4 0 0 1 -4 4 h-18 a4 4 0 0 1 -4 -4 z" fill="${k.glass('smp', ['#16323b', '#2c6675', '#a6d3dd'])}" opacity=".5" stroke="${C.steelLt}" stroke-width="1.3"/>`
      + `<rect x="251" y="36" width="12" height="9" rx="2" fill="${C.steelLt}"/>`
      + `<path d="M246 56 h22 v26 a3 3 0 0 1 -3 3 h-16 a3 3 0 0 1 -3 -3 z" fill="${C.waterLt}" opacity=".45"/>`
      + `<path d="M246 56 h22" stroke="${C.waterLt}" stroke-width="1.3"/></g>`
      + mono(257, 96, 'state lab', { size: 7, fill: C.waterLt, w: 700 })
      + slip(278, 14, 106, 76, { title: 'THE NOTICE', lines: [
        ['clearwell', 'under', true],
        ['batch', 'certified'],
        ['', ''],
        ['LIFTS', 'in the am', true]
      ] });
  } })
};

export function sceneArt(id) { return SCENE_ART[id] || ''; }
