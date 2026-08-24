// art.js - Unit 2 scene illustrations ("The Glow Room": a sign-and-lighting shop, Saturday
// shift). One inline SVG per SCENARIO id (see model.js), rendered into the cockpit's
// mission screen via x-html.
//
// Built on the same scaffolding as units_new/11-nuclear/js/art.js and
// units_new/01-practices-matter/js/art.js, because the tree shares a shell and a set that
// disagrees with itself reads as several products:
//   • viewBox is 400x150 - the 8:3 the .mission-frame is sized to.
//   • Every gradient/pattern/clip id is prefixed with the scene id. Alpine keeps all
//     station panels in the DOM (x-show, not x-if), so the SVGs coexist and an unprefixed
//     id would bleed from one scene into another. kit() does the prefixing.
//   • Lighting is from the upper left everywhere, so a tube in one banner is shaded like
//     the tube in the next.
//   • Keep the subject above y=100. Below that the caption scrim fades the art out.
//   • Banners are aria-hidden: the scenario's goal text directly below is the
//     authoritative description, so announcing the art too is redundant.
//
// TWENTY-ONE banners, six core skills of three plus two Honors calls and the capstone, so
// the set has to make six kinds of evidence tell themselves apart at a glance. Two
// signatures say which side of the roller door we are on:
//
//   backRoom()  the shop. Pegboard, the shelf of gas cylinders (some unlabelled), the junk
//               shelf of broken things, and the bench everything stands on.
//   outFront()  the jobs. Night, a facade, a kerb, and whatever fixture is dead: the
//               streetlight on the corner, the customer's lobby sign, the ceiling tubes.
//
// On top of those, one grammar per skill, so the rail's six letters are six pictures:
//   a  the OBSERVATION on the junk bench, with the model it forces beside it.
//   b  a labelled cylinder or tube, and the shell diagram of what is inside it.
//   d  a weighing beam: two isotope blocks at their masses, the average as the balance point.
//   c  the fixture, the spectroscope, and a SPECTRUM BAND with the element's real lines on it.
//   e  the configuration laid out as orbital boxes, plus the Lewis dots it implies.
//   f  the valence shell drawn full or short, and what the atom does about it.
//
// The color of every glow and every emission line is computed from the same wavelengths
// the bench itself shows (SPECTRA in model.js), so the rack and the art cannot teach
// competing colors - the one thing the previous version of this file got right, kept.
//
// Palette tracks tokens.css: teal for the shop, copper for the Honors jobs and the last
// call, and the emission colors for everything that is actually glowing.

import { SPECTRA } from './model.js';

const MONO = "'JetBrains Mono', ui-monospace, monospace";

const C = {
  teal: '#2a7d8a', teal7: '#1d5b66', teal3: '#79b0ba', tealLt: '#cfe6ea',
  ink: '#08141a', dim: '#9fc2c9', steel: '#687a82', steelLt: '#aebfc6',
  pale: '#cfdbe0', white: '#e8f2f4', slate: '#3a5560',
  copper: '#c0772f', copper7: '#95591f', copper1: '#f1ddc8',
  success: '#2f8f5b', warn: '#b8881f', danger: '#bf4a30', ember: '#f0a02f',
  // the shop
  peg: '#2a3840', bench: '#4a3f34', shelf: '#5c4c3c', glass: '#9dc9d6',
  brass: '#c9a24a', cu: '#c8763a', cuLt: '#eaa46e', junk: '#3b444a',
  elec: '#7fd7e8', proton: '#e0714a', neutron: '#8b959e', card: '#f2efe6',
  night: '#0a1017', facade: '#1b242c', kerb: '#2b3239', violet: '#8f6fd0'
};

// Two grounds, because the jobs are outside and the answers are in the back room, plus
// copper for the Honors calls and the capstone.
const SHOP_BG   = ['#0d1f27', '#173139'];   // the back room
const NIGHT_BG  = ['#060d14', '#111c25'];   // the street, the lobby, the ceiling
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
    tube(n, [sh, base, hi]) { return k.lin(n, [[0, sh], [.22, hi], [.52, base], [1, sh]], true); },
    // Sphere, bead or nucleus lit from the upper left.
    orb(n, [hi, base, sh]) { return k.rad(n, [[0, hi], [.55, base], [1, sh]]); },
    // The halo around anything lit.
    hot(n, tint) { return k.rad(n, [[0, tint, .6], [.5, tint, .18], [1, tint, 0]], { cx: '50%', cy: '50%', r: '50%' }); }
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

const rng = seed => { let s = seed; return () => (s = (s * 1103515245 + 12345) % 2147483648) / 2147483648; };

// Visible wavelength to a screen color. Kept from the first version of this file, because
// it is the reason the tube in a banner glows the color the bench's own spectrum says.
function wavelengthToRGB(nm) {
  let r = 0, g = 0, b = 0;
  if (nm >= 380 && nm < 440) { r = -(nm - 440) / 60; b = 1; }
  else if (nm < 490) { g = (nm - 440) / 50; b = 1; }
  else if (nm < 510) { g = 1; b = -(nm - 510) / 20; }
  else if (nm < 580) { r = (nm - 510) / 70; g = 1; }
  else if (nm < 645) { r = 1; g = -(nm - 645) / 65; }
  else if (nm <= 780) r = 1;
  const f = nm < 420 ? .3 + .7 * (nm - 380) / 40 : nm > 700 ? .3 + .7 * (780 - nm) / 80 : 1;
  const ch = v => Math.round(255 * Math.pow(Math.max(0, v * f), .8));
  return `rgb(${ch(r)},${ch(g)},${ch(b)})`;
}

// The visible lines the bench shows for a gas. Hydrogen has none in the data because the
// bench computes it from Rydberg; the Balmer series is computed here for the same reason.
const balmer = [3, 4, 5, 6].map(n => 1 / (1.09677e-2 * (1 / 4 - 1 / (n * n))));
const linesFor = key => (SPECTRA.find(x => x.key === key) || {}).lines || balmer;
// The color a tube of this gas glows: the brightest region of its own spectrum.
const glowOf = key => {
  const l = linesFor(key);
  return wavelengthToRGB(l[Math.floor(l.length / 2)]);
};

// ---- SIGNATURE 1: the back room. Pegboard, the cylinder shelf, the junk shelf, the bench.
const backRoom = (benchY = 92) =>
  `<path d="M0 0 H160 L52 ${benchY} H0 Z" fill="${C.tealLt}" opacity=".055"/>`
  + `<rect width="400" height="${benchY}" fill="${C.peg}" opacity=".45"/>`
  // pegboard holes, the cheapest thing in the room and the one that says "workshop"
  + `<g fill="${C.ink}" opacity=".3">`
  + [0, 1, 2, 3, 4, 5, 6].map(r => [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
    .map(c => `<circle cx="${12 + c * 26}" cy="${10 + r * 13}" r="1.5"/>`).join('')).join('')
  + `</g>`
  // the shelf of gas cylinders along the top right, some of them unlabelled
  + `<g opacity=".3">`
  + [0, 1, 2, 3, 4].map(i => `<path d="M${300 + i * 20} 46 a5 5 0 0 1 10 0 v22 h-10 z" fill="${C.steelLt}"/>`).join('')
  + `<path d="M292 68 H400" stroke="${C.shelf}" stroke-width="4"/></g>`
  // the junk shelf on the left: broken things, stacked
  + `<g opacity=".22"><path d="M0 42 H84" stroke="${C.shelf}" stroke-width="4"/>`
  + `<rect x="8" y="26" width="20" height="16" fill="${C.junk}"/><rect x="34" y="30" width="14" height="12" fill="${C.junk}"/>`
  + `<circle cx="62" cy="35" r="7" fill="${C.junk}"/></g>`
  + `<rect x="0" y="${benchY}" width="400" height="${150 - benchY}" fill="${C.bench}"/>`
  + `<path d="M0 ${benchY} H400" stroke="${C.shelf}" stroke-width="1.8" opacity=".7"/>`
  + `<path d="M0 ${benchY + 3.5} H400" stroke="#100b06" stroke-width="1.2" opacity=".55"/>`;

// ---- SIGNATURE 2: out front. Night, a facade, a kerb, and one thing that is not lit.
const outFront = (kerbY = 94) =>
  `<rect width="400" height="${kerbY}" fill="${C.night}"/>`
  + `<g fill="${C.facade}"><rect x="0" y="16" width="118" height="${kerbY - 16}"/>`
  + `<rect x="286" y="8" width="114" height="${kerbY - 8}"/></g>`
  // lit windows in the buildings either side, small and cold
  + `<g fill="${C.copper1}" opacity=".22">`
  + `<rect x="14" y="26" width="10" height="8"/><rect x="34" y="26" width="10" height="8"/>`
  + `<rect x="14" y="44" width="10" height="8"/><rect x="94" y="34" width="10" height="8"/>`
  + `<rect x="300" y="20" width="10" height="8"/><rect x="332" y="34" width="10" height="8"/>`
  + `<rect x="366" y="20" width="10" height="8"/></g>`
  + `<rect y="${kerbY}" width="400" height="${150 - kerbY}" fill="${C.kerb}"/>`
  + `<path d="M0 ${kerbY} H400" stroke="${C.steelLt}" stroke-width="1.2" opacity=".3"/>`
  + `<path d="M0 ${kerbY - 4} H400" stroke="${C.steelLt}" stroke-width="1" opacity=".12"/>`;

// A discharge tube: glass barrel, an electrode sealed into each end, and - when it is
// running - the column of gas glowing the color its own spectrum says it should.
const dischargeTube = (x, y, w, h, { k, n = 'dt', glow = null, vertical = false, label = null } = {}) => {
  const g = k ? k.tube(n, ['#122a33', '#2c5f6d', '#a9d6e2']) : '#2c5f6d';
  const body = vertical
    ? `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${w / 2}" fill="${g}" opacity=".45" stroke="${C.glass}" stroke-width="1.3"/>`
    : `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h / 2}" fill="${g}" opacity=".45" stroke="${C.glass}" stroke-width="1.3"/>`;
  const inner = glow
    ? (vertical
      ? `<rect x="${x + 3}" y="${y + 6}" width="${w - 6}" height="${h - 12}" rx="${(w - 6) / 2}" fill="${glow}" opacity=".8"/>`
      : `<rect x="${x + 6}" y="${y + 3}" width="${w - 12}" height="${h - 6}" rx="${(h - 6) / 2}" fill="${glow}" opacity=".8"/>`)
    : '';
  const caps = vertical
    ? `<rect x="${x + w / 2 - 4}" y="${y - 6}" width="8" height="7" rx="2" fill="${C.steelLt}"/>`
      + `<rect x="${x + w / 2 - 4}" y="${y + h - 1}" width="8" height="7" rx="2" fill="${C.steelLt}"/>`
    : `<rect x="${x - 6}" y="${y + h / 2 - 4}" width="7" height="8" rx="2" fill="${C.steelLt}"/>`
      + `<rect x="${x + w - 1}" y="${y + h / 2 - 4}" width="7" height="8" rx="2" fill="${C.steelLt}"/>`;
  return `<g>` + body + inner + caps
    + (vertical
      ? `<rect x="${x + 2.5}" y="${y + 8}" width="2.2" height="${h - 18}" rx="1.1" fill="#ffffff" opacity=".34"/>`
      : `<rect x="${x + 8}" y="${y + 2.5}" width="${w - 20}" height="2.2" rx="1.1" fill="#ffffff" opacity=".34"/>`)
    + (label ? mono(x + w / 2, y - 8, label, { size: 8, fill: glow || C.pale, w: 700, ls: '.08em' }) : '')
    + `</g>`;
};

// THE instrument this unit was missing. A dark band with the element's real visible lines
// standing on it at their own wavelengths, in their own colors, with the selected line
// called out. Not a curve, and not a rainbow: discrete lines on black is the whole point.
const spectrumBand = (x, y, w, h, { lines = [], select = null, scale = true, lo = 380, hi = 720, label = null } = {}) => {
  const px = nm => x + ((nm - lo) / (hi - lo)) * w;
  let out = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#04070c" stroke="${C.steelLt}" stroke-width="1.1"/>`;
  lines.forEach(nm => {
    if (nm < lo || nm > hi) return;
    const c = wavelengthToRGB(nm), p = px(nm).toFixed(1);
    out += `<rect x="${p}" y="${y + 1}" width="2.6" height="${h - 2}" fill="${c}" opacity=".35"/>`
      + `<rect x="${(px(nm) + .7).toFixed(1)}" y="${y + 1}" width="1.2" height="${h - 2}" fill="${c}"/>`;
  });
  if (scale) {
    out += `<g>`;
    [400, 500, 600, 700].forEach(nm => {
      out += `<path d="M${px(nm).toFixed(1)} ${y + h} v3" stroke="${C.steel}" stroke-width=".9"/>`
        + mono(px(nm), y + h + 10, String(nm), { size: 6.5, fill: C.steel });
    });
    out += `</g>`;
  }
  if (select !== null) {
    const p = px(select);
    out += `<path d="M${p.toFixed(1)} ${y - 3} l-4 -6 h8 z" fill="${C.white}"/>`
      + mono(p, y - 12, `${select} nm`, { size: 7.5, fill: C.white, w: 700 });
  }
  if (label) out += mono(x + w, y - 12, label, { size: 7.5, fill: C.pale, anchor: 'end', w: 700, ls: '.08em' });
  return out;
};

// The thing a line spectrum is NOT: a continuous rainbow. a-tube needs both side by side,
// because the argument for Bohr is exactly the difference between them.
const rainbowBand = (x, y, w, h, { k, n = 'rb' }) => {
  const stops = [400, 450, 490, 520, 560, 600, 640, 690].map((nm, i, a) =>
    [(i / (a.length - 1)).toFixed(2), wavelengthToRGB(nm)]);
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${k.lin(n, stops, true)}"`
    + ` stroke="${C.steelLt}" stroke-width="1.1"/>`;
};

// A Bohr shell diagram: the nucleus with its count, a ring per shell, and the electrons
// spaced round each ring. This is the model the unit's own bench draws, so the banner
// draws it too rather than inventing a second convention.
const shells = (cx, cy, occ, { k, n = 'sh', nuc = null, charge = null, r0 = 11, dr = 9, hi = null, missing = 0, tint = C.elec } = {}) => {
  const g = k ? k.orb(n, ['#ffd9c8', C.proton, '#5a1f0c']) : C.proton;
  let out = `<circle cx="${cx}" cy="${cy}" r="${r0 - 2}" fill="${g}"/>`;
  occ.forEach((cnt, i) => {
    const r = r0 + (i + 1) * dr, last = i === occ.length - 1;
    out += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${hi && last ? C.warn : C.teal3}"`
      + ` stroke-width="${hi && last ? 1.6 : .9}" opacity="${hi && last ? .95 : .5}"/>`;
    const shown = last ? cnt - missing : cnt;
    for (let e = 0; e < shown; e++) {
      const a = (-90 + (360 / cnt) * e) * Math.PI / 180;
      out += `<circle cx="${(cx + r * Math.cos(a)).toFixed(1)}" cy="${(cy + r * Math.sin(a)).toFixed(1)}"`
        + ` r="2.3" fill="${hi && last ? C.warn : tint}"/>`;
    }
    if (last && missing) {
      const a = (-90 + (360 / cnt) * (cnt - 1)) * Math.PI / 180;
      out += `<circle cx="${(cx + r * Math.cos(a)).toFixed(1)}" cy="${(cy + r * Math.sin(a)).toFixed(1)}"`
        + ` r="2.3" fill="none" stroke="${C.danger}" stroke-width="1.2" stroke-dasharray="2 2"/>`;
    }
  });
  if (nuc) out += mono(cx, cy + 3, nuc, { size: 6.5, fill: '#2b0d04', w: 700 });
  if (charge) {
    const rr = r0 + occ.length * dr;
    out += `<rect x="${cx + rr - 6}" y="${cy - rr - 8}" width="20" height="12" rx="3" fill="${C.warn}"/>`
      + mono(cx + rr + 4, cy - rr + 1, charge, { size: 8, fill: '#241704', w: 700 });
  }
  return out;
};

// Orbital occupancy boxes with their arrows: the picture the Honors exception scene needs
// and the one e-chromium and e-copper argue over. `cells` is an array of 0 | 1 | 2.
const orbitalRow = (x, y, cells, { label = null, box = 13, tint = C.elec, note = null } = {}) => {
  let out = '';
  cells.forEach((v, i) => {
    const bx = x + i * (box + 2);
    out += `<rect x="${bx}" y="${y}" width="${box}" height="${box}" rx="1.5" fill="#0a1a22" stroke="${C.steelLt}" stroke-width="1"/>`;
    if (v >= 1) out += `<path d="M${bx + 4.5} ${y + box - 3} V${y + 3} m0 0 l-2 3 m2 -3 l2 3" fill="none" stroke="${tint}" stroke-width="1.2" stroke-linecap="round"/>`;
    if (v >= 2) out += `<path d="M${bx + box - 4.5} ${y + 3} V${y + box - 3} m0 0 l-2 -3 m2 3 l2 -3" fill="none" stroke="${tint}" stroke-width="1.2" stroke-linecap="round"/>`;
  });
  if (label) out += mono(x - 5, y + box - 3, label, { size: 7.5, fill: C.pale, anchor: 'end', w: 700 });
  if (note) out += mono(x + cells.length * (box + 2) + 3, y + box - 3, note, { size: 7, fill: C.dim, anchor: 'start' });
  return out;
};

// The weighing beam behind every average-atomic-mass job: the isotopes standing at their
// own masses, each as tall as it is abundant, and the fulcrum under the weighted average.
// A learner can see that the beam balances nearer the abundant isotope.
const weighBeam = (x, y, w, { lo, hi, items = [], avg = null, avgLabel = null, tint = C.copper, hScale = .46 } = {}) => {
  const px = m => x + ((m - lo) / (hi - lo)) * w;
  let out = `<path d="M${x} ${y} H${x + w}" stroke="${C.steelLt}" stroke-width="2.4" stroke-linecap="round"/>`
    + `<path d="M${x} ${y} v5 M${x + w} ${y} v5" stroke="${C.steel}" stroke-width="1.2"/>`
    + mono(x, y + 15, lo.toFixed(0), { size: 6.5, fill: C.steel })
    + mono(x + w, y + 15, hi.toFixed(0), { size: 6.5, fill: C.steel });
  items.forEach(it => {
    const bx = px(it.mass), bh = 10 + it.pct * hScale;
    out += `<rect x="${(bx - 11).toFixed(1)}" y="${(y - bh).toFixed(1)}" width="22" height="${bh.toFixed(1)}" rx="2" fill="${it.tint || tint}" opacity=".8"/>`
      + `<rect x="${(bx - 11).toFixed(1)}" y="${(y - bh).toFixed(1)}" width="22" height="${bh.toFixed(1)}" rx="2" fill="none" stroke="${C.steelLt}" stroke-width="1"/>`
      + mono(bx, y - bh - 4, `${it.pct.toFixed(2)}%`, { size: 7, fill: it.tint || tint, w: 700 })
      + mono(bx, y - bh / 2 + 3, it.label, { size: 7.5, fill: '#0d1116', w: 700 });
  });
  if (avg !== null) {
    const ax = px(avg);
    out += `<path d="M${ax.toFixed(1)} ${y + 2} l-7 12 h14 z" fill="${C.white}"/>`
      + `<path d="M${ax.toFixed(1)} ${y + 2} V${y - 4}" stroke="${C.white}" stroke-width="1.2" stroke-dasharray="2 2"/>`
      + mono(ax, y + 22, avgLabel || avg.toFixed(2), { size: 8, fill: C.white, w: 700 });
  }
  return out;
};

// Lewis dots: the symbol with its valence electrons on the four sides, filled one per side
// before any pairs. Small, because it is always a footnote to the configuration.
const lewis = (cx, cy, sym, v, { tint = C.elec, size = 12 } = {}) => {
  const pos = [[0, -11], [11, 0], [0, 11], [-11, 0], [-4, -11], [11, 5], [4, 11], [-11, -5]];
  let out = mono(cx, cy + size * .35, sym, { size, fill: C.white, w: 700 });
  for (let i = 0; i < v; i++) {
    const [dx, dy] = pos[i < 4 ? i : i];
    out += `<circle cx="${cx + dx}" cy="${cy + dy}" r="2.1" fill="${tint}"/>`;
  }
  return out;
};

// An energy-level ladder with one transition drawn on it: the picture behind E = hc / l.
// Spacing falls as 1/n rather than the true 1/n^2, which keeps the convergence visible -
// the point of the diagram - without stacking n=3, 4 and 5 into one unreadable line.
const levels = (x, y, w, h, { from = 3, to = 2, nMax = 5, tint = C.copper1 } = {}) => {
  const cum = n => { let t = 0; for (let i = 1; i < n; i++) t += 1 / i; return t; };
  const span = cum(nMax) || 1;
  const ly = n => y + h * (1 - cum(n) / span);
  let out = '';
  for (let n = 1; n <= nMax; n++) {
    out += `<path d="M${x} ${ly(n).toFixed(1)} H${x + w}" stroke="${C.steel}" stroke-width="1" opacity=".8"/>`
      + mono(x + w + 4, ly(n) + 3, `n=${n}`, { size: 6.5, boxed: true, fill: C.steel, anchor: 'start' });
  }
  const yf = ly(from), yt = ly(to);
  out += `<path d="M${x + w * .42} ${yf.toFixed(1)} V${yt.toFixed(1)} m0 0 l-3 4 m3 -4 l3 4" fill="none" stroke="${tint}" stroke-width="1.8" stroke-linecap="round"/>`
    + `<circle cx="${x + w * .42}" cy="${yf.toFixed(1)}" r="2.6" fill="${tint}"/>`;
  return out;
};

// A photon, drawn as the wave it is, so the wavelength in the equation is visible.
const photon = (x1, y, len, { tint = C.copper1, amp = 4, cycles = 4, arrow = true } = {}) => {
  const step = len / cycles;
  let d = `M${x1} ${y}`;
  for (let i = 0; i < cycles; i++) d += ` q${step / 4} ${-amp} ${step / 2} 0 t${step / 2} 0`;
  return `<g><path d="${d}" fill="none" stroke="${tint}" stroke-width="1.8" stroke-linecap="round"/>`
    + (arrow ? `<path d="M${x1 + len} ${y} l-6 -3.5 v7 z" fill="${tint}"/>` : '') + `</g>`;
};

// An industrial gas cylinder off the shelf: straight body, shouldered neck, valve guard,
// and the stencil that either names the gas or conspicuously does not.
const gasCylinder = (x, yTop, w, h, { k, n = 'gc', tint = '#4a6b74', label = null, labelFill = C.card, unlabelled = false } = {}) => {
  const g = k ? k.tube(n, ['#152c33', tint, '#b6d7e0']) : tint;
  return `<g>`
    + `<path d="M${x + w / 2 - 7} ${yTop - 12} h14 v12 h-14 z" fill="${C.steelLt}"/>`
    + `<path d="M${x + w / 2 - 11} ${yTop - 16} h22 v5 h-22 z" fill="${C.steel}"/>`
    + `<path d="M${x} ${yTop + 12} q0 -12 ${w / 2} -12 q${w / 2} 0 ${w / 2} 12 v${h - 16} a4 4 0 0 1 -4 4 h${-(w - 8)} a4 4 0 0 1 -4 -4 z"`
    + ` fill="${g}" stroke="#0f2229" stroke-width="1.3"/>`
    + `<rect x="${x + 4}" y="${yTop + 14}" width="2.6" height="${h - 24}" rx="1.3" fill="#ffffff" opacity=".28"/>`
    + (unlabelled
      ? `<rect x="${x + 4}" y="${yTop + 26}" width="${w - 8}" height="16" rx="2" fill="#0d1a20" opacity=".8" stroke="${C.danger}" stroke-width="1" stroke-dasharray="3 2"/>`
        + mono(x + w / 2, yTop + 37, '?', { size: 11, fill: C.danger, w: 700 })
      : label
        ? `<rect x="${x + 3}" y="${yTop + 26}" width="${w - 6}" height="15" rx="2" fill="${labelFill}"/>`
          + mono(x + w / 2, yTop + 37, label, { size: 8, fill: C.ink, w: 700, ls: '.04em' })
        : '')
    + `</g>`;
};

// The handheld spectroscope: a slit end, a body, an eyepiece, and the sight line it is
// pointed along. It appears in every C.6(C) scene, because it is how the shop looks.
const spectroscope = (x, y, { angle = 0, tint = C.steelLt, sight = 0 } = {}) =>
  `<g transform="translate(${x},${y}) rotate(${angle})">`
  + (sight ? `<path d="M-6 4 H${-6 - sight}" stroke="${C.white}" stroke-width="1" stroke-dasharray="3 3" opacity=".55"/>` : '')
  + `<path d="M0 0 h34 v16 h-34 z" fill="#20323a" stroke="${tint}" stroke-width="1.3"/>`
  + `<path d="M-7 2 h7 v12 h-7 z" fill="${tint}"/>`
  + `<path d="M34 4 h9 v8 h-9 z" fill="${tint}"/>`
  + `<circle cx="45" cy="8" r="4" fill="#0a1a22" stroke="${tint}" stroke-width="1.2"/>`
  + `<path d="M8 0 v16 M20 0 v16" stroke="${tint}" stroke-width=".8" opacity=".5"/>`
  + `</g>`;

// The spool of copper wire the scrap buyer weighs, seen end on with the winding visible.
const spool = (cx, cy, r, { tint = C.cu, tintLt = C.cuLt } = {}) => {
  let wind = '';
  for (let i = 0; i < 7; i++) wind += `<circle cx="${cx}" cy="${cy}" r="${(r - 3 - i * 2.4).toFixed(1)}" fill="none" stroke="${i % 2 ? tint : tintLt}" stroke-width="1.6" opacity=".85"/>`;
  return `<g><circle cx="${cx}" cy="${cy}" r="${r}" fill="${tint}"/>`
    + `<circle cx="${cx - r * .3}" cy="${cy - r * .3}" r="${r * .8}" fill="${tintLt}" opacity=".2"/>`
    + wind
    + `<circle cx="${cx}" cy="${cy}" r="${r * .22}" fill="#2a2018" stroke="${C.steelLt}" stroke-width="1"/>`
    + `<path d="M${cx + r - 2} ${cy} q14 -8 22 4" fill="none" stroke="${tintLt}" stroke-width="2" stroke-linecap="round"/></g>`;
};

// A ruled work slip: the job card, the invoice, the assay, the service tag.
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

// The three fixtures the C.6(C) jobs are about, one function so they are siblings: the
// dead streetlight on the corner, the customer's lobby sign, the shop's own ceiling tube.
const fixture = (kind, x, y, { k, n = 'fx', glow = null, dead = false } = {}) => {
  const halo = glow && !dead && k ? k.hot(n + 'h', glow) : null;
  if (kind === 'lamp') {
    return `<g>`
      + (halo ? `<circle cx="${x}" cy="${y + 14}" r="42" fill="${halo}"/>` : '')
      + `<path d="M${x - 4} ${y + 22} v${72}" stroke="${C.steel}" stroke-width="5"/>`
      + `<path d="M${x - 4} ${y + 22} q0 -18 22 -18" fill="none" stroke="${C.steel}" stroke-width="5"/>`
      + `<path d="M${x + 4} 0 h34 l7 14 h-48 z" transform="translate(0,${y})" fill="${C.steelLt}"/>`
      + `<path d="M${x - 3} ${y + 14} h48 l-6 9 h-36 z" fill="${dead ? '#1c262b' : glow}" opacity="${dead ? 1 : .9}"/>`
      + (dead ? `<path d="M${x + 6} ${y + 17} h30" stroke="${C.danger}" stroke-width="1.4" stroke-dasharray="3 3"/>` : '')
      + `</g>`;
  }
  if (kind === 'sign') {
    // a bent tube spelling a fragment of a lobby sign, with one segment dead
    const seg = (d, on) => `<path d="${d}" fill="none" stroke="${on ? glow : '#243038'}" stroke-width="4.5" stroke-linecap="round"`
      + ` opacity="${on ? .95 : 1}"/>`;
    return `<g>`
      + (halo ? `<rect x="${x - 14}" y="${y - 12}" width="104" height="62" fill="${halo}"/>` : '')
      + `<rect x="${x - 12}" y="${y - 10}" width="100" height="58" rx="4" fill="#0c141a" stroke="${C.steel}" stroke-width="1.4"/>`
      + seg(`M${x + 2} ${y + 36} V${y + 6} q0 -6 8 -6 h8 q8 0 8 6 v30`, true)
      + seg(`M${x + 2} ${y + 20} h24`, true)
      + seg(`M${x + 40} ${y + 36} V${y}`, !dead)
      + seg(`M${x + 40} ${y} h16 q8 0 8 8 t-8 8 h-16`, true)
      + seg(`M${x + 56} ${y + 16} l14 20`, true)
      + (dead ? `<circle cx="${x + 40}" cy="${y + 18}" r="9" fill="none" stroke="${C.danger}" stroke-width="1.4" stroke-dasharray="3 3"/>` : '')
      + `</g>`;
  }
  // 'troffer': the shop's own ceiling fluorescent, seen from below and slightly to one side
  return `<g>`
    + (halo ? `<rect x="${x - 10}" y="${y}" width="128" height="56" fill="${halo}"/>` : '')
    + `<path d="M${x} ${y} h108 l-12 16 h-84 z" fill="${C.steelLt}" opacity=".7"/>`
    + `<path d="M${x + 12} ${y + 16} h84 v9 h-84 z" fill="#101a20"/>`
    + `<rect x="${x + 16}" y="${y + 17}" width="76" height="7" rx="3.5" fill="${glow}" opacity=".92"/>`
    + `<g stroke="${C.steel}" stroke-width="2"><path d="M${x + 24} ${y} V${y - 12}"/><path d="M${x + 84} ${y} V${y - 12}"/></g>`
    + `</g>`;
};

// ---------------------------------------------------------------- scaffolding
// scene(id, opts) -> a complete 400x150 banner string.
//   theme  'shop' (default, the back room) | 'night' (out front) | 'copper'
function scene(id, { caption, body, theme = 'shop', bg, frame, capColor }) {
  const honors = theme === 'copper';
  const [top, bot] = bg || (honors ? COPPER_BG : theme === 'night' ? NIGHT_BG : SHOP_BG);
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

  // ================= C.6(A) the evidence, and the model it forced =================
  // Three observations off the junk bench. Each banner draws what you can SEE on the left
  // and the model idea that accounts for it on the right, because that pairing is the
  // whole of the skill.

  // The flea-market CRT: hold a magnet beside it and the beam bends. A solid indivisible
  // sphere has nothing in it for a magnet to steer.
  'a-crt': scene('a-crt', { caption: 'THE JUNK-SHELF CRT · THE BEAM BENDS', body: k => {
    const beam = k.hot('bm', C.elec);
    return backRoom()
      // the tube: neck, funnel, phosphor face
      + `<path d="M18 44 h26 v14 h-26 z" fill="${C.steelLt}" opacity=".8"/>`
      + `<path d="M44 40 L118 16 v70 L44 62 z" fill="${k.tube('crt', ['#122a33', '#2c5f6d', '#a9d6e2'])}" opacity=".45" stroke="${C.glass}" stroke-width="1.4"/>`
      + `<path d="M118 16 v70" stroke="${C.glass}" stroke-width="2.4"/>`
      + `<rect x="24" y="47" width="7" height="8" rx="2" fill="${C.brass}"/>`
      + mono(30, 96, 'cathode', { size: 7, fill: C.dim })
      // where the beam WOULD have gone, and where it actually lands
      + `<path d="M44 51 H116" stroke="${C.steel}" stroke-width="1.2" stroke-dasharray="4 3" opacity=".7"/>`
      + `<circle cx="118" cy="51" r="3" fill="none" stroke="${C.steel}" stroke-width="1.2" stroke-dasharray="2 2"/>`
      + `<circle cx="112" cy="72" r="16" fill="${beam}"/>`
      + `<path d="M44 51 C72 51 86 60 116 74" fill="none" stroke="${C.elec}" stroke-width="2.4" stroke-linecap="round"/>`
      + `<circle cx="117" cy="74" r="4.5" fill="${C.white}"/>`
      // the magnet held beside it
      + `<g transform="translate(66,86)">`
      + `<path d="M0 0 v-14 a13 13 0 0 1 26 0 v14 h-8 v-14 a5 5 0 0 0 -10 0 v14 z" fill="${C.danger}"/>`
      + `<path d="M0 0 h8 v6 h-8 z" fill="${C.pale}"/><path d="M18 0 h8 v6 h-8 z" fill="${C.pale}"/></g>`
      + mono(79, 100, 'magnet', { size: 7.5, fill: C.danger, w: 700 })
      + `<path d="M136 51 h16 m0 0 l-5 -4 m5 4 l-5 4" fill="none" stroke="${C.pale}" stroke-width="1.3" stroke-linecap="round"/>`
      // the model the bend forces: something charged, and small, inside the atom
      + `<g><circle cx="200" cy="50" r="26" fill="${C.proton}" opacity=".22" stroke="${C.proton}" stroke-width="1.3"/>`
      + `<g fill="${C.elec}"><circle cx="188" cy="42" r="3.2"/><circle cx="210" cy="44" r="3.2"/>`
      + `<circle cx="196" cy="60" r="3.2"/><circle cx="212" cy="60" r="3.2"/><circle cx="202" cy="50" r="3.2"/></g></g>`
      + mono(200, 90, 'a charged part', { size: 7.5, fill: C.elec, w: 700 })
      + mono(200, 100, 'inside the atom', { size: 7.5, fill: C.elec })
      + slip(248, 16, 136, 68, { title: 'WHAT IT RULES OUT', lines: [
        ['solid sphere', 'no'],
        ['nothing to steer', ''],
        ['a bendable beam', 'yes', true]
      ] });
  } }),

  // The color tube: four sharp colors, not a rainbow. That is Bohr's argument, drawn as
  // the two bands side by side.
  'a-tube': scene('a-tube', { caption: 'THE COLOR TUBE · FOUR SHARP COLORS, NOT A RAINBOW', body: k => {
    const gl = glowOf('H');
    return backRoom()
      + dischargeTube(16, 34, 22, 56, { k, n: 'dt', glow: gl, vertical: true, label: 'tube' })
      + `<circle cx="27" cy="62" r="30" fill="${k.hot('h', gl)}"/>`
      + mono(32, 100, 'it is running', { size: 7, fill: C.dim })
      // what you would expect from a hot solid, crossed out
      + rainbowBand(66, 22, 130, 15, { k, n: 'rb' })
      + mono(66, 17, 'a continuous rainbow', { size: 7, fill: C.steel, anchor: 'start', ls: '.06em' })
      + `<path d="M198 22 l10 15 M208 22 l-10 15" stroke="${C.danger}" stroke-width="2" stroke-linecap="round"/>`
      // what the tube actually gives
      + spectrumBand(66, 56, 130, 15, { lines: linesFor('H'), scale: false })
      + mono(66, 51, 'what the tube gives', { size: 7, fill: C.white, anchor: 'start', ls: '.06em', w: 700 })
      + `<path d="M200 63 l4 -5 6 10" fill="none" stroke="${C.success}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>`
      + mono(130, 90, 'discrete lines mean discrete drops', { size: 7.5, fill: C.pale, w: 700 })
      // the model that gives discrete lines: fixed levels, and a drop between two of them
      + `<g>` + levels(250, 16, 70, 60, { from: 4, to: 2, nMax: 4, tint: C.elec }) + `</g>`
      + photon(250, 86, 44, { tint: gl, amp: 3.5, cycles: 4 })
      + mono(298, 98, 'one photon per drop', { size: 7, fill: gl, w: 700 })
      + mono(287, 10, 'FIXED LEVELS', { size: 7, fill: C.elec, ls: '.1em', w: 700 });
  } }),

  // Two suppliers, one fixed mass ratio. Repeatable whole-number composition needs atoms
  // with stable identities.
  'a-assay': scene('a-assay', { caption: 'THE SUPPLIER ASSAY · THE SAME RATIO, TWICE', body: k => {
    const bar = (x, y) => `<g>`
      + `<rect x="${x}" y="${y}" width="112" height="16" rx="2" fill="#0a1a22" stroke="${C.steelLt}" stroke-width="1"/>`
      + `<rect x="${x + 1}" y="${y + 1}" width="${(112 * .393 - 1).toFixed(1)}" height="14" fill="${C.warn}" opacity=".85"/>`
      + `<rect x="${(x + 112 * .393).toFixed(1)}" y="${y + 1}" width="${(112 * .607 - 1).toFixed(1)}" height="14" fill="${C.success}" opacity=".85"/>`
      + mono(x + 112 * .2, y + 12, 'Na 39.3', { size: 7, fill: '#231704', w: 700 })
      + mono(x + 112 * .7, y + 12, 'Cl 60.7', { size: 7, fill: '#04200f', w: 700 })
      + `</g>`;
    // two sacks, two dockets, one ratio
    const sack = (x, y, name) => `<g>`
      + `<path d="M${x} ${y} q10 -8 22 0 q10 8 10 20 v18 a5 5 0 0 1 -5 5 h-32 a5 5 0 0 1 -5 -5 v-18 q0 -12 10 -20 z" fill="${C.copper7}" opacity=".85" stroke="${C.steelLt}" stroke-width="1.2"/>`
      + `<rect x="${x - 4}" y="${y + 16}" width="34" height="12" rx="2" fill="${C.card}"/>`
      + mono(x + 13, y + 25, name, { size: 7, fill: C.ink, w: 700 })
      + `</g>`;
    return backRoom()
      + sack(24, 34, 'LOT A')
      + sack(76, 40, 'LOT B')
      + mono(60, 100, 'two suppliers, two sacks', { size: 7.5, fill: C.pale, w: 700 })
      + bar(158, 26) + bar(158, 56)
      + mono(158, 22, 'supplier A', { size: 7, fill: C.dim, anchor: 'start' })
      + mono(158, 52, 'supplier B', { size: 7, fill: C.dim, anchor: 'start' })
      + `<path d="M270 34 h7 v30 h-7" fill="none" stroke="${C.white}" stroke-width="1.4"/>`
      + mono(284, 53, '=', { size: 13, fill: C.white, w: 700 })
      + mono(214, 84, 'identical, every batch', { size: 7.5, fill: C.white, w: 700 })
      + slip(296, 16, 88, 60, { title: 'DALTON', lines: [
        ['atoms', 'stable'],
        ['ratios', 'repeat', true],
        ['lots', 'agree']
      ] });
  } }),

  // ================= C.6(B) build the species: protons, neutrons, electrons =================
  // One grammar: the labelled vessel from the shelf, the shell diagram of what is inside,
  // and the count card that has to match it.

  'b-argon': scene('b-argon', { caption: 'THE ARGON-40 CYLINDER · NEUTRAL, AND SET RIGHT', body: k => {
    return backRoom()
      + gasCylinder(22, 20, 46, 70, { k, n: 'gc', tint: '#5d4d80', label: 'Ar-40' })
      + mono(45, 100, 'off the shelf', { size: 7.5, fill: C.pale, w: 700 })
      + shells(154, 50, [2, 8, 8], { k, n: 'sh', nuc: '18p 22n', r0: 13, dr: 11 })
      + mono(154, 100, 'a full outer shell', { size: 7.5, fill: C.teal3, w: 700 })
      + slip(240, 14, 144, 76, { title: 'THE SERVICE TAG', lines: [
        ['protons', '18'],
        ['neutrons', '22'],
        ['electrons', '18'],
        ['mass number', '40', true]
      ] })
      + mono(312, 100, 'protons set the element', { size: 7, fill: C.dim, w: 700 });
  } }),

  'b-neon': scene('b-neon', { caption: 'THE HOT SIGN TUBE · ONE ELECTRON GONE', body: k => {
    const gl = glowOf('Ne');
    return backRoom()
      + `<circle cx="60" cy="52" r="40" fill="${k.hot('h', gl)}"/>`
      + dischargeTube(20, 42, 84, 22, { k, n: 'dt', glow: gl, label: 'the tube ran hot' })
      + mono(62, 100, 'it ionised in service', { size: 7.5, fill: gl, w: 700 })
      // the shell diagram with the electron that left, and where it went
      + shells(178, 50, [2, 8], { k, n: 'sh', nuc: '10p 10n', r0: 12, dr: 11, missing: 1, charge: '1+' })
      + `<path d="M206 32 C222 26 232 24 244 22 m0 0 l-6 -1 m6 1 l-4 4" fill="none" stroke="${C.danger}" stroke-width="1.3" stroke-linecap="round"/>`
      + `<circle cx="248" cy="21" r="3" fill="${C.danger}"/>`
      + mono(178, 100, 'the nucleus never changed', { size: 7.5, fill: C.teal3, w: 700 })
      + slip(266, 30, 118, 58, { title: 'BUILD Ne+', lines: [
        ['protons', '10'],
        ['electrons', '9', true],
        ['charge', '1+', true]
      ] });
  } }),

  'b-chlorine': scene('b-chlorine', { caption: 'THE CHLORINE-37 TRACER · MASS NUMBER, NOT AVERAGE', body: k => {
    return backRoom()
      // the tracer bottle with its leak-check tag
      + `<g><path d="M30 32 h34 v50 a6 6 0 0 1 -6 6 H36 a6 6 0 0 1 -6 -6 z" fill="${k.tube('btl', ['#152c33', '#3f7a5e', '#b6e0cc'])}" opacity=".7" stroke="${C.glass}" stroke-width="1.3"/>`
      + `<rect x="39" y="20" width="16" height="13" rx="2" fill="${C.steelLt}"/>`
      + `<rect x="33" y="46" width="28" height="16" rx="2" fill="${C.card}"/>`
      + mono(47, 57, 'Cl-37', { size: 7.5, fill: C.ink, w: 700 })
      + `<path d="M64 26 h18 v10 h-18 z" fill="${C.card}" opacity=".9"/>`
      + mono(73, 34, 'TAG', { size: 6.5, fill: C.ink, w: 700 })
      + `</g>`
      + mono(51, 100, 'the leak-check bottle', { size: 7.5, fill: C.pale, w: 700 })
      + shells(166, 50, [2, 8, 7], { k, n: 'sh', nuc: '17p 20n', r0: 13, dr: 11 })
      // the sum that makes 37, spelled out
      + mono(166, 100, '17 + 20 = 37', { size: 8, fill: C.teal3, w: 700 })
      + slip(240, 14, 144, 76, { title: 'NOT THE TABLE VALUE', lines: [
        ['periodic table', '35.45'],
        ['this bottle', '37', true],
        ['', ''],
        ['average is a mix', '']
      ] })
      + mono(312, 100, 'one bottle, one isotope', { size: 7, fill: C.dim, w: 700 });
  } }),

  // ================= C.6(D) the weighted average, drawn as a balance =================
  // One grammar: the goods on the bench, and a beam carrying each isotope at its own mass,
  // as tall as it is abundant, balancing under the weighted average.

  'd-boron': scene('d-boron', { caption: 'THE TUBING INVOICE · THE BEAM BALANCES AT 10.81', body: k => {
    return backRoom()
      // boxes of borosilicate tubing, and the invoice on top
      + `<g><path d="M16 52 h56 v36 h-56 z" fill="${C.copper7}" opacity=".7" stroke="${C.steelLt}" stroke-width="1.2"/>`
      + `<path d="M16 52 l10 -10 h56 l-10 10 z" fill="${C.copper}" opacity=".55" stroke="${C.steelLt}" stroke-width="1"/>`
      + `<path d="M72 52 l10 -10 v36 l-10 10 z" fill="#6b3f14" opacity=".6" stroke="${C.steelLt}" stroke-width="1"/>`
      + `<g stroke="${C.glass}" stroke-width="2" opacity=".55">`
      + `<path d="M28 42 v-14 M38 42 v-16 M48 42 v-12 M58 42 v-15"/></g>`
      + `<rect x="22" y="62" width="42" height="16" rx="2" fill="${C.card}"/>`
      + mono(43, 73, 'INVOICE', { size: 7, fill: C.ink, w: 700 })
      + `</g>`
      + mono(48, 100, 'borosilicate, boxed', { size: 7.5, fill: C.pale, w: 700 })
      + weighBeam(122, 68, 148, {
        lo: 9.6, hi: 11.6, avg: 10.81, avgLabel: '10.81 u',
        items: [
          { label: 'B-10', mass: 10.0129, pct: 19.90, tint: C.teal3 },
          { label: 'B-11', mass: 11.0093, pct: 80.10, tint: C.ember }
        ]
      })
      + mono(186, 100, 'THE ASSAY, WEIGHED', { size: 7, fill: C.dim, ls: '.1em', w: 700 })
      + slip(288, 14, 96, 46, { title: 'THE ASSAY', lines: [
        ['B-10', '19.90%'],
        ['B-11', '80.10%']
      ] })
      + mono(336, 88, 'nearer the abundant one', { size: 6.5, fill: C.ember, w: 700 });
  } }),

  'd-copper': scene('d-copper', { caption: 'THE COPPER SPOOL · WHAT THE SCRAP BUYER PAYS FOR', body: k => {
    return backRoom()
      + spool(50, 52, 30)
      + `<path d="M22 88 h56" stroke="${C.steel}" stroke-width="3"/>`
      + mono(55, 100, 'the spool, on the scale', { size: 7.5, fill: C.cuLt, w: 700 })
      + weighBeam(122, 68, 150, {
        lo: 62.4, hi: 65.6, avg: 63.55, avgLabel: '63.55 u',
        items: [
          { label: 'Cu-63', mass: 62.9296, pct: 69.15, tint: C.cu },
          { label: 'Cu-65', mass: 64.9278, pct: 30.85, tint: C.teal3 }
        ]
      })
      + mono(186, 100, 'TWO ISOTOPES, ONE PRICE', { size: 7, fill: C.dim, ls: '.08em', w: 700 })
      + slip(290, 14, 94, 46, { title: 'THE ASSAY', lines: [
        ['Cu-63', '69.15%'],
        ['Cu-65', '30.85%']
      ] })
      + mono(330, 96, 'not the midpoint of the two', { size: 6.5, fill: C.cuLt, w: 700 });
  } }),

  'd-chlorine': scene('d-chlorine', { caption: 'THE POOL TABLETS · A THREE-QUARTER MIX', body: k => {
    return backRoom()
      // the tub of tablets, open, with the tablets in it
      + `<g><path d="M18 44 h60 v42 a6 6 0 0 1 -6 6 H24 a6 6 0 0 1 -6 -6 z" fill="#3f6b57" opacity=".8" stroke="${C.steelLt}" stroke-width="1.3"/>`
      + `<ellipse cx="48" cy="44" rx="30" ry="7" fill="#5c8f78" stroke="${C.steelLt}" stroke-width="1.2"/>`
      + `<g fill="${C.pale}" opacity=".95">`
      + `<ellipse cx="38" cy="42" rx="9" ry="4"/><ellipse cx="58" cy="44" rx="9" ry="4"/><ellipse cx="48" cy="38" rx="9" ry="4"/></g>`
      + `<rect x="24" y="58" width="48" height="16" rx="2" fill="${C.card}"/>`
      + mono(48, 69, 'POOL Cl', { size: 7, fill: C.ink, w: 700 })
      + `</g>`
      + mono(58, 100, 'the shop sells these too', { size: 7.5, fill: C.pale, w: 700 })
      + weighBeam(124, 68, 148, {
        lo: 34.4, hi: 37.6, avg: 35.45, avgLabel: '35.45 u',
        items: [
          { label: 'Cl-35', mass: 34.9689, pct: 75.77, tint: C.success },
          { label: 'Cl-37', mass: 36.9659, pct: 24.23, tint: C.teal3 }
        ]
      })
      + mono(186, 100, 'THREE IN FOUR ARE Cl-35', { size: 7, fill: C.dim, ls: '.08em', w: 700 })
      + slip(290, 14, 94, 46, { title: 'THE ASSAY', lines: [
        ['Cl-35', '75.77%'],
        ['Cl-37', '24.23%']
      ] })
      + mono(337, 88, 'so the average sits low', { size: 6.5, fill: C.success, w: 700 });
  } }),

  // ================= C.6(C) the spectrum, drawn as a spectrum =================
  // One grammar for all three: the dead fixture, the spectroscope pointed at it, and the
  // element's real visible lines standing on a black band at their own wavelengths. Only
  // the fixture and the line positions change - which is exactly the fingerprint idea.

  'c-sodium': scene('c-sodium', { caption: 'THE DEAD STREETLIGHT · SODIUM, AT 589 nm', theme: 'night', body: k => {
    const gl = glowOf('Na');
    return outFront()
      + fixture('lamp', 130, 12, { k, n: 'fx', glow: gl, dead: true })
      + mono(154, 100, 'out since Thursday', { size: 7.5, fill: C.danger, w: 700 })
      + spectroscope(58, 52, { angle: -18, sight: 26 })
      + mono(80, 92, 'the handheld', { size: 7, fill: C.dim })
      + `<path d="M104 46 C124 40 130 36 140 32" fill="none" stroke="${C.white}" stroke-width="1" stroke-dasharray="3 3" opacity=".5"/>`
      + spectrumBand(206, 40, 168, 26, { lines: linesFor('Na'), select: 589.0, label: 'Na' })
      + mono(290, 88, 'four lines, and one doublet', { size: 7.5, fill: C.pale, w: 700 })
      + mono(290, 99, 'that is the yellow you see', { size: 7, fill: gl, w: 700 });
  } }),

  'c-neon': scene('c-neon', { caption: "THE LOBBY SIGN · NEON'S RED-ORANGE CLUSTER", theme: 'night', body: k => {
    const gl = glowOf('Ne');
    return outFront()
      + fixture('sign', 30, 24, { k, n: 'fx', glow: gl, dead: true })
      + mono(66, 100, 'one segment dead', { size: 7.5, fill: C.danger, w: 700 })
      + spectroscope(140, 60, { angle: -12, sight: 22 })
      + spectrumBand(206, 40, 168, 26, { lines: linesFor('Ne'), select: 640.2, label: 'Ne' })
      + mono(290, 88, 'a dense cluster at the red end', { size: 7, fill: C.pale, w: 700 })
      + mono(290, 99, 'is why neon looks like neon', { size: 7, fill: gl, w: 700 });
  } }),

  'c-mercury': scene('c-mercury', { caption: 'THE CEILING TUBE · MERCURY, INTO THE VIOLET', theme: 'night', body: k => {
    const gl = glowOf('Hg');
    return outFront()
      + fixture('troffer', 30, 20, { k, n: 'fx', glow: gl })
      + mono(84, 100, 'the shop’s own ceiling', { size: 7.5, fill: C.pale, w: 700 })
      + spectroscope(120, 64, { angle: -30, sight: 20 })
      + spectrumBand(206, 40, 168, 26, { lines: linesFor('Hg'), select: 435.8, label: 'Hg' })
      + mono(290, 88, 'the same grammar, new positions', { size: 7, fill: C.pale, w: 700 })
      + mono(290, 99, 'lines are a fingerprint', { size: 7, fill: gl, w: 700 });
  } }),

  // ================= C.6(E) configuration and the dots that follow from it =================
  // One grammar: the metal in front of you, the orbital boxes it fills, and the Lewis dots
  // the outermost of those boxes imply.

  'e-magnesium': scene('e-magnesium', { caption: 'THE MAGNESIUM ELECTRODE · FILL IT, THEN DOT IT', body: k => {
    return backRoom()
      // the electrode rod, clamped
      + `<g><rect x="28" y="24" width="14" height="62" rx="3" fill="${k.tube('rod', ['#3d474d', '#9aa7ad', '#e2e9ec'])}"/>`
      + `<rect x="22" y="42" width="26" height="9" rx="2" fill="${C.steel}"/>`
      + `<path d="M14 46 h10" stroke="${C.steel}" stroke-width="4"/>`
      + `<path d="M35 86 v8" stroke="${C.steel}" stroke-width="2"/></g>`
      + mono(35, 100, 'Mg', { size: 9, fill: C.pale, w: 700 })
      + orbitalRow(84, 18, [2], { label: '1s' })
      + orbitalRow(84, 36, [2], { label: '2s' })
      + orbitalRow(84, 54, [2, 2, 2], { label: '2p' })
      + orbitalRow(84, 72, [2], { label: '3s', tint: C.warn, note: 'the valence pair' })
      + `<path d="M78 70 h-6 v20 h6" fill="none" stroke="${C.warn}" stroke-width="1.2"/>`
      + lewis(268, 52, 'Mg', 2, { tint: C.warn })
      + mono(244, 86, '2 valence electrons', { size: 7.5, fill: C.warn, w: 700 })
      + slip(292, 20, 92, 58, { title: 'CERTIFY', lines: [
        ['config', '[Ne] 3s2'],
        ['dots', '2'],
        ['group', '2', true]
      ] });
  } }),

  'e-chromium': scene('e-chromium', { caption: 'THE CHROMIUM ELECTRODE · ONE ELECTRON MOVES', body: k => {
    return backRoom()
      + `<g><rect x="24" y="26" width="16" height="60" rx="3" fill="${k.tube('rod', ['#2f4348', '#7fa2ab', '#dcecf0'])}"/>`
      + `<rect x="18" y="44" width="28" height="9" rx="2" fill="${C.steel}"/>`
      + `<path d="M32 86 v8" stroke="${C.steel}" stroke-width="2"/></g>`
      + mono(32, 100, 'Cr', { size: 9, fill: C.pale, w: 700 })
      + mono(62, 22, 'AUFBAU PREDICTS', { size: 7, fill: C.steel, anchor: 'start', ls: '.08em', w: 700 })
      + orbitalRow(94, 26, [2], { label: '4s' })
      + orbitalRow(126, 26, [1, 1, 1, 1, 0], { label: '3d' })
      + mono(62, 62, 'THE BENCH FINDS', { size: 7, fill: C.warn, anchor: 'start', ls: '.08em', w: 700 })
      + orbitalRow(94, 66, [1], { label: '4s', tint: C.warn })
      + orbitalRow(126, 66, [1, 1, 1, 1, 1], { label: '3d', tint: C.warn })
      + `<path d="M100 42 C104 52 104 54 100 62 m0 0 l3 -4 m-3 4 l-4 -3" fill="none" stroke="${C.danger}" stroke-width="1.4" stroke-linecap="round"/>`
      + `<path d="M104 44 C150 48 180 50 196 64 m0 0 l-1 -6 m1 6 l-6 -1" fill="none" stroke="${C.warn}" stroke-width="1.3" stroke-dasharray="3 3"/>`
      + mono(150, 90, 'a half-filled d row is worth the move', { size: 7.5, fill: C.warn, w: 700 })
      + slip(276, 14, 108, 58, { title: 'THE EXCEPTION', lines: [
        ['predicted', '4s2 3d4'],
        ['actual', '4s1 3d5', true],
        ['reason', 'half-filled']
      ] });
  } }),

  'e-copper': scene('e-copper', { caption: 'THE COPPER COIL · A FILLED d ROW WINS TOO', body: k => {
    return backRoom()
      + spool(44, 50, 26)
      + mono(44, 100, 'Cu, before rewiring', { size: 7.5, fill: C.cuLt, w: 700 })
      + mono(88, 22, 'AUFBAU PREDICTS', { size: 7, fill: C.steel, anchor: 'start', ls: '.08em', w: 700 })
      + orbitalRow(116, 26, [2], { label: '4s' })
      + orbitalRow(148, 26, [2, 2, 2, 2, 1], { label: '3d' })
      + mono(88, 62, 'THE BENCH FINDS', { size: 7, fill: C.cuLt, anchor: 'start', ls: '.08em', w: 700 })
      + orbitalRow(116, 66, [1], { label: '4s', tint: C.cuLt })
      + orbitalRow(148, 66, [2, 2, 2, 2, 2], { label: '3d', tint: C.cuLt })
      + `<path d="M122 42 C126 52 126 54 122 62 m0 0 l3 -4 m-3 4 l-4 -3" fill="none" stroke="${C.danger}" stroke-width="1.4" stroke-linecap="round"/>`
      + `<path d="M126 44 C178 48 206 52 218 64 m0 0 l-1 -6 m1 6 l-6 -1" fill="none" stroke="${C.cuLt}" stroke-width="1.3" stroke-dasharray="3 3"/>`
      + mono(170, 90, 'the last gap in d closes', { size: 7.5, fill: C.cuLt, w: 700 })
      + slip(288, 14, 96, 58, { title: 'THE EXCEPTION', lines: [
        ['predicted', '4s2 3d9'],
        ['actual', '4s1 3d10', true],
        ['reason', 'filled d']
      ] });
  } }),

  // ================= C.5(B) what the family does about its valence shell =================
  // One grammar: the part, the outer shell drawn full or short, and the behavior that
  // follows. The three differ by how far the shell is from full and which way it moves.

  'f-argon': scene('f-argon', { caption: 'THE SEALED ARGON TUBE · A FULL SHELL DOES NOTHING', body: k => {
    return backRoom()
      + dischargeTube(20, 40, 96, 24, { k, n: 'dt', glow: '#8e7fd6', label: "the customer's tube" })
      + `<g><path d="M20 74 h96 v14 h-96 z" fill="${C.card}" opacity=".9"/>`
      + mono(68, 85, 'SEALED · 10 YEARS', { size: 7, fill: C.ink, w: 700 })
      + `</g>`
      + shells(180, 50, [2, 8, 8], { k, n: 'sh', nuc: '18p', r0: 12, dr: 11, hi: true })
      + mono(180, 100, 'eight in the outer shell', { size: 7.5, fill: C.warn, w: 700 })
      // it neither gains nor loses: both arrows crossed out
      + `<g transform="translate(240,36)">`
      + `<path d="M0 0 h20 m0 0 l-5 -3.5 m5 3.5 l-5 3.5" fill="none" stroke="${C.steel}" stroke-width="1.3" stroke-linecap="round"/>`
      + `<path d="M4 -6 l12 12 M16 -6 l-12 12" stroke="${C.danger}" stroke-width="1.6" stroke-linecap="round"/>`
      + `<path d="M0 26 h20 m0 0 l-5 -3.5 m5 3.5 l-5 3.5" fill="none" stroke="${C.steel}" stroke-width="1.3" stroke-linecap="round"/>`
      + `<path d="M4 20 l12 12 M16 20 l-12 12" stroke="${C.danger}" stroke-width="1.6" stroke-linecap="round"/></g>`
      + mono(250, 30, 'gain', { size: 7, fill: C.steel })
      + mono(250, 80, 'lose', { size: 7, fill: C.steel })
      + slip(276, 20, 108, 58, { title: 'FAMILY CALL', lines: [
        ['group', '18'],
        ['noble gas', 'inert', true],
        ['use', 'seal it in']
      ] });
  } }),

  'f-aluminum': scene('f-aluminum', { caption: 'THE ALUMINUM ELECTRODE · THREE TO GIVE AWAY', body: k => {
    return backRoom()
      + `<g><path d="M26 26 h20 v60 h-20 z" fill="${k.tube('rod', ['#3d474d', '#a8b6bc', '#eef4f6'])}"/>`
      + `<path d="M26 26 l7 -6 h20 l-7 6 z" fill="#c6d3d8"/>`
      + `<path d="M46 26 l7 -6 v60 l-7 6 z" fill="#7d8a90"/>`
      + `<rect x="20" y="46" width="32" height="9" rx="2" fill="${C.steel}"/></g>`
      + mono(50, 100, 'Al, for the electrode', { size: 7.5, fill: C.pale, w: 700 })
      + shells(160, 50, [2, 8, 3], { k, n: 'sh', nuc: '13p', r0: 12, dr: 11, hi: true })
      + mono(160, 100, 'three in the outer shell', { size: 7.5, fill: C.warn, w: 700 })
      + `<path d="M192 34 C214 26 226 24 240 22 m0 0 l-6 -1 m6 1 l-4 4" fill="none" stroke="${C.warn}" stroke-width="1.4" stroke-linecap="round"/>`
      + `<g fill="${C.warn}"><circle cx="244" cy="21" r="2.6"/><circle cx="252" cy="26" r="2.6"/><circle cx="248" cy="32" r="2.6"/></g>`
      + mono(250, 46, 'gives 3', { size: 7.5, fill: C.warn, w: 700 })
      + mono(250, 58, 'away', { size: 7.5, fill: C.warn })
      + slip(284, 24, 100, 50, { title: 'FAMILY CALL', lines: [
        ['group', '13'],
        ['forms', 'Al 3+', true]
      ] });
  } }),

  'f-chlorine': scene('f-chlorine', { caption: 'THE GETTER ORDER · ONE SHORT, AND GRABBING', body: k => {
    return backRoom()
      // the getter cartridge: a small canister with a mesh window
      + `<g><path d="M24 34 h44 v52 a5 5 0 0 1 -5 5 H29 a5 5 0 0 1 -5 -5 z" fill="#4a5a52" stroke="${C.steelLt}" stroke-width="1.3"/>`
      + `<rect x="34" y="24" width="24" height="11" rx="2" fill="${C.steelLt}"/>`
      + `<rect x="31" y="46" width="30" height="24" rx="2" fill="#101a18"/>`
      + `<g stroke="#7f8f86" stroke-width=".9">`
      + [50, 54, 58, 62, 66].map(y => `<path d="M31 ${y} h30"/>`).join('')
      + [37, 43, 49, 55].map(x => `<path d="M${x} 46 v24"/>`).join('') + `</g></g>`
      + mono(49, 100, 'the getter cartridge', { size: 7.5, fill: C.pale, w: 700 })
      + shells(164, 50, [2, 8, 7], { k, n: 'sh', nuc: '17p', r0: 12, dr: 11, hi: true })
      + mono(164, 100, 'seven — one short of eight', { size: 7.5, fill: C.warn, w: 700 })
      + `<circle cx="248" cy="30" r="3" fill="${C.elec}"/>`
      + `<path d="M244 32 C226 38 214 42 200 46 m0 0 l6 -4 m-6 4 l5 4" fill="none" stroke="${C.elec}" stroke-width="1.4" stroke-linecap="round"/>`
      + mono(256, 48, 'takes one', { size: 7.5, fill: C.elec, anchor: 'start', w: 700 })
      + mono(256, 60, 'and is done', { size: 7.5, fill: C.elec, anchor: 'start' })
      + slip(276, 66, 108, 26, { lines: [['group 17', 'Cl -', true]] })
      + mono(330, 30, 'reactive nonmetal', { size: 7.5, fill: C.dim, w: 700 });
  } }),

  // ================= Honors =================

  // h1: the photon the line carries. The ladder, the drop, the wave, and the equation.
  'h1-photon': scene('h1-photon', { caption: 'THE LINE CHECK · ONE DROP, ONE PHOTON, ONE ENERGY', theme: 'copper', body: k => {
    const gl = wavelengthToRGB(486.1);
    return `<rect width="400" height="102" fill="#160f07" opacity=".35"/>`
      + levels(26, 12, 78, 72, { from: 4, to: 2, nMax: 5, tint: C.copper1 })
      + mono(64, 100, 'the drop that made the line', { size: 7.5, fill: C.copper1, w: 700 })
      + photon(140, 44, 75, { tint: gl, amp: 5, cycles: 3 })
      + `<path d="M140 58 H165 m0 0 l-4 -3 m4 3 l-4 3 M140 58 l4 -3 m-4 3 l4 3" fill="none" stroke="${C.pale}" stroke-width="1"/>`
      + mono(178, 61, 'one wavelength', { size: 7, fill: C.pale, anchor: 'start' })
      + spectrumBand(140, 76, 116, 16, { lines: balmer, select: null, scale: false })
      + `<path d="M${(140 + ((486.1 - 380) / (720 - 380)) * 116).toFixed(1)} 74 l-4 -6 h8 z" fill="${C.white}"/>`
      + mono(198, 100, 'the line you selected', { size: 7, fill: C.white, w: 700 })
      + slip(272, 14, 112, 76, { title: 'E = hc / L', lines: [
        ['h', '6.626e-34'],
        ['c', '2.998e8'],
        ['L', '486.1 nm'],
        ['E in joules', '?', true]
      ] })
      + mono(328, 100, 'nm to meters first', { size: 7, fill: C.copper1, w: 700 });
  } }),

  // h2: the orbital evidence. Predicted against actual, and the tick on the one the bench
  // actually finds. This is the picture the caption has been promising all along.
  'h2-orbital': scene('h2-orbital', { caption: 'THE ORBITAL CHECK · IS THIS ONE AN EXCEPTION?', theme: 'copper', body: k => {
    return `<rect width="400" height="102" fill="#160f07" opacity=".35"/>`
      + `<rect x="12" y="12" width="188" height="78" rx="4" fill="#0d1319" opacity=".7" stroke="${C.steel}" stroke-width="1"/>`
      + mono(22, 26, 'PREDICTED BY FILLING ORDER', { size: 7, fill: C.steel, anchor: 'start', ls: '.06em', w: 700 })
      + orbitalRow(50, 34, [2], { label: '4s' })
      + orbitalRow(84, 34, [2, 2, 2, 2, 1], { label: '3d' })
      + mono(22, 68, 'the s pair stays put', { size: 7, fill: C.steel, anchor: 'start' })
      + mono(22, 80, 'and d is one short', { size: 7, fill: C.steel, anchor: 'start' })
      + `<rect x="212" y="12" width="176" height="78" rx="4" fill="#1d1408" opacity=".85" stroke="${C.copper}" stroke-width="1.3"/>`
      + mono(222, 26, 'WHAT THE BENCH SHOWS', { size: 7, fill: C.copper1, anchor: 'start', ls: '.06em', w: 700 })
      + orbitalRow(250, 34, [1], { label: '4s', tint: C.copper1 })
      + orbitalRow(284, 34, [2, 2, 2, 2, 2], { label: '3d', tint: C.copper1 })
      + `<path d="M256 54 C258 62 254 64 252 70" fill="none" stroke="${C.danger}" stroke-width="1.3"/>`
      + `<path d="M258 56 C286 62 320 62 348 54 m0 0 l-2 5 m2 -5 l-6 0" fill="none" stroke="${C.copper1}" stroke-width="1.3" stroke-dasharray="3 3"/>`
      + mono(222, 68, 'one 4s electron has moved', { size: 7, fill: C.copper1, anchor: 'start', w: 700 })
      + mono(222, 80, 'to finish the d row', { size: 7, fill: C.copper1, anchor: 'start' })
      + `<path d="M198 51 h12 m0 0 l-4 -3 m4 3 l-4 3" fill="none" stroke="${C.pale}" stroke-width="1.2" stroke-linecap="round"/>`
      + `<path d="M356 76 l5 -6 8 12" fill="none" stroke="${C.success}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>`
      + mono(150, 100, 'an exception is evidence, not a typo', { size: 7.5, fill: C.copper1, w: 700 });
  } }),

  // ================= Capstone: the unlabelled cylinder =================
  // Everything the shift built, pointed at one bottle: its spectrum names it, the assay
  // checks the label's mass, the shell says what family it is in, and then one call.
  'cap-glowroom': scene('cap-glowroom', { caption: 'THE UNLABELLED CYLINDER · NAME IT, THEN CALL IT', theme: 'copper', body: k => {
    const gl = glowOf('Ne');
    return `<rect width="400" height="102" fill="#160f07" opacity=".35"/>`
      + gasCylinder(14, 22, 40, 68, { k, n: 'gc', tint: '#5b4a2c', unlabelled: true })
      + mono(34, 100, 'no stencil', { size: 7.5, fill: C.danger, w: 700 })
      + spectroscope(62, 34, { angle: 8, sight: 0 })
      + `<path d="M56 42 H54" stroke="${C.white}" stroke-width="1"/>`
      + spectrumBand(126, 12, 148, 17, { lines: linesFor('Ne'), select: null, scale: false, label: 'READ IT' })
      + `<path d="M112 42 C118 36 120 32 124 26" fill="none" stroke="${C.white}" stroke-width="1" stroke-dasharray="3 3" opacity=".6"/>`
      + shells(92, 68, [2, 8], { k, n: 'sh', nuc: '10p', r0: 9, dr: 8, hi: true })
      + mono(92, 100, 'full shell?', { size: 7, fill: C.warn, w: 700 })
      + weighBeam(152, 76, 104, {
        lo: 19.6, hi: 22.4, avg: 20.18, avgLabel: '20.18 u', hScale: .28,
        items: [
          { label: 'Ne-20', mass: 19.992, pct: 90.5, tint: C.copper },
          { label: 'Ne-22', mass: 21.991, pct: 9.3, tint: C.teal3 }
        ]
      })
      + slip(282, 12, 102, 80, { title: 'THE LAST CALL' })
      + `<g fill="none" stroke="${C.copper7}" stroke-width="1.3">`
      + [['fill the tube', 38], ['send it back', 54], ['call it in', 70]].map(([t, y]) =>
        `<circle cx="292" cy="${y - 3.5}" r="3.5"/>` + mono(301, y, t, { size: 7.5, fill: C.ink, anchor: 'start', w: 500 })).join('')
      + `</g>`
      + mono(333, 88, 'on the evidence', { size: 7, fill: C.copper7, w: 700 });
  } })
};

export function sceneArt(id) { return SCENE_ART[id] || ''; }
