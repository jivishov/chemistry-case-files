// art.js - Unit 7 scene illustrations ("The Fill Station": a dive shop, one shift).
// One inline SVG per SCENARIO id (see model.js), rendered into the cockpit's mission
// screen via x-html.
//
// Built on the same scaffolding as units_new/11-nuclear/js/art.js and
// units_new/01-practices-matter/js/art.js, because the tree shares a shell and a set that
// disagrees with itself reads as several products:
//   • viewBox is 400x150 - the 8:3 the .mission-frame is sized to.
//   • Every gradient/pattern/clip id is prefixed with the scene id. Alpine keeps all
//     station panels in the DOM (x-show, not x-if), so the SVGs coexist and an unprefixed
//     id would bleed from one scene into another. kit() does the prefixing.
//   • Lighting is from the upper left everywhere, so a cylinder in one banner is shaded
//     like the cylinder in the next.
//   • Keep the subject above y=100. Below that the caption scrim fades the art out.
//   • Banners are aria-hidden: the scenario's goal text directly below is the
//     authoritative description, so announcing the art too is redundant.
//
// THIRTEEN banners, the smallest set in the tree. Two signatures answer the same question
// Unit 1's waterColumn()/deskShelf() pair did - which side of the roller door are we on:
//
//   fillRoom()  the bench. Block wall, the storage bank racked against it, raking light
//               from the upper left, and the steel bench everything stands on.
//   outside()   the lot and the rail. A horizon, a colder ground, and either the sea the
//               cylinder is going into or the tarmac the truck is parked on.
//
// On top of those sit the grammars that carry the rotations. The three C.10(A) scenes each
// draw the OBSERVATION - what you can actually see happening - with the particles that
// explain it. The three C.10(B) scenes are all a vessel plus a state card with three
// values filled and the fourth a question mark, because that is literally what the bench
// asks. The three C.10(C) scenes are all a stacked partial-pressure bar next to the thing
// the mixture is in, since a stack of slices summing to a total IS Dalton's law. The two
// numeric Honors calls are genuine graphs and share one plot primitive, the way Unit 11's
// decay curve and binding curve do.
//
// Palette tracks tokens.css: teal for the shop and its steel, oxygen green for the O2
// line, a colder blue for nitrogen, ember for heat and for a gauge that has moved,
// copper for the Honors calls and the capstone.

const MONO = "'JetBrains Mono', ui-monospace, monospace";

const C = {
  teal: '#2a7d8a', teal7: '#1d5b66', teal3: '#79b0ba', tealLt: '#cfe6ea',
  ink: '#08141a', dim: '#9fc2c9', steel: '#687a82', steelLt: '#aebfc6',
  pale: '#cfdbe0', white: '#e8f2f4', slate: '#3a5560',
  copper: '#c0772f', copper7: '#95591f', copper1: '#f1ddc8',
  success: '#2f8f5b', warn: '#b8881f', danger: '#bf4a30', ember: '#f0a02f',
  // the dive shop
  steelDk: '#3d4a52', tank: '#357180', tankDk: '#16333c', tankLt: '#8fc3cf',
  o2: '#5cc47f', n2: '#6f97cb', sea: '#12475a', seaDk: '#082934',
  sun: '#ffd27a', rubber: '#232a2e', brass: '#c9a24a', card: '#f2efe6',
  tarmac: '#33383b', wall: '#243138'
};

// Two grounds, because this unit happens on two sides of a roller door, plus copper for
// the Honors calls and the capstone.
const BENCH_BG  = ['#08202a', '#123039'];   // inside the fill room
const OUT_BG    = ['#123141', '#20454f'];   // the lot, the deck, the rail
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
    // Standing steel or glass: shadow / highlight / body / shadow across x.
    glass(n, [sh, base, hi]) { return k.lin(n, [[0, sh], [.22, hi], [.52, base], [1, sh]], true); },
    // Sphere or bead lit from the upper left.
    orb(n, [hi, base, sh]) { return k.rad(n, [[0, hi], [.55, base], [1, sh]]); },
    // The halo around anything hot or lit.
    hot(n, tint = C.sun) { return k.rad(n, [[0, tint, .5], [.55, tint, .14], [1, tint, 0]], { cx: '50%', cy: '50%', r: '50%' }); }
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

// ---- SIGNATURE 1: the fill room. Block wall, the bank racked against it, steel bench.
const fillRoom = (benchY = 92) =>
  `<path d="M0 0 H168 L58 ${benchY} H0 Z" fill="${C.tealLt}" opacity=".05"/>`
  + `<rect width="400" height="${benchY}" fill="${C.wall}" opacity=".35"/>`
  + `<g stroke="${C.steelLt}" stroke-width="1" opacity=".09">`
  + `<path d="M0 22 H400"/><path d="M0 50 H400"/><path d="M0 78 H400"/>`
  + `<path d="M62 0 V22 M148 22 V50 M62 50 V78 M234 0 V22 M320 22 V50 M234 50 V78"/></g>`
  // the storage bank, racked and out of focus behind the work
  + `<g opacity=".26">`
  + [0, 1, 2, 3, 4].map(i => `<rect x="${306 + i * 19}" y="${benchY - 62}" width="14" height="62" rx="7" fill="${C.steelLt}"/>`).join('')
  + `<path d="M300 ${benchY - 44} H400 M300 ${benchY - 16} H400" stroke="${C.steel}" stroke-width="3"/></g>`
  + `<rect x="0" y="${benchY}" width="400" height="${150 - benchY}" fill="${C.steelDk}"/>`
  + `<path d="M0 ${benchY} H400" stroke="${C.steelLt}" stroke-width="1.8" opacity=".5"/>`
  + `<path d="M0 ${benchY + 3.5} H400" stroke="#061015" stroke-width="1.2" opacity=".55"/>`;

// ---- SIGNATURE 2: outside. A horizon, a colder ground, and either sea or tarmac.
const outside = (ground = 'sea', horizon = 62) => {
  const sea = ground === 'sea';
  return `<path d="M0 0 H228 L104 ${horizon} H0 Z" fill="${C.white}" opacity=".05"/>`
    + `<circle cx="52" cy="18" r="13" fill="${C.sun}" opacity=".28"/>`
    + `<circle cx="52" cy="18" r="6" fill="${C.sun}" opacity=".5"/>`
    + `<rect y="${horizon}" width="400" height="${150 - horizon}" fill="${sea ? C.sea : C.tarmac}"/>`
    + `<path d="M0 ${horizon} H400" stroke="${C.steelLt}" stroke-width="1.2" opacity=".35"/>`
    + (sea
      ? `<g stroke="${C.tankLt}" stroke-width="1.2" fill="none" opacity=".22">`
        + `<path d="M14 ${horizon + 12} q10 -4 20 0 t20 0 t20 0"/>`
        + `<path d="M232 ${horizon + 20} q10 -4 20 0 t20 0 t20 0"/>`
        + `<path d="M96 ${horizon + 30} q10 -4 20 0 t20 0 t20 0"/></g>`
      : `<g stroke="${C.steelLt}" stroke-width="1.4" opacity=".16">`
        + `<path d="M0 ${horizon + 22} H400" stroke-dasharray="22 16"/>`
        + `<path d="M0 ${horizon + 44} H400" stroke-dasharray="22 16"/></g>`);
};

// A scuba cylinder: domed shoulder, valve block, handwheel, and an optional shoulder band
// carrying the mix sticker. `clipN` returns a clip of the barrel so particles can be drawn
// inside the steel rather than floating over it.
const cylinder = (x, yTop, w, h, { k, n = 'cyl', tint = C.tank, valve = true, boot = false } = {}) => {
  const rd = w / 2, body = `M${x} ${yTop + rd} a${rd} ${rd} 0 0 1 ${w} 0 v${h - rd - 4} a4 4 0 0 1 -4 4 h${-(w - 8)} a4 4 0 0 1 -4 -4 z`;
  const g = k ? k.glass(n, [C.tankDk, tint, C.tankLt]) : tint;
  return `<g>`
    + (valve
      ? `<rect x="${x + w / 2 - 5}" y="${yTop - 11}" width="10" height="12" rx="2" fill="${C.steelLt}"/>`
        + `<circle cx="${x + w / 2}" cy="${yTop - 13}" r="4.5" fill="none" stroke="${C.brass}" stroke-width="2"/>`
      : '')
    + `<path d="${body}" fill="${g}" stroke="${C.tankDk}" stroke-width="1.3"/>`
    + `<rect x="${x + 3}" y="${yTop + rd}" width="2.8" height="${h - rd - 9}" rx="1.4" fill="#ffffff" opacity=".3"/>`
    + (boot ? `<path d="M${x - 2} ${yTop + h} h${w + 4} v4 a3 3 0 0 1 -3 3 h${-(w - 2)} a3 3 0 0 1 -3 -3 z" fill="${C.rubber}"/>` : '')
    + `</g>`;
};

// The mix sticker banded round a cylinder's shoulder. Separate from cylinder() so it can be
// laid over the gas inside rather than under it.
const sticker = (x, yTop, w, text, { fill = C.o2, drop = 27 } = {}) =>
  `<g><rect x="${x}" y="${yTop + drop}" width="${w}" height="13" fill="${fill}" opacity=".92"/>`
  + mono(x + w / 2, yTop + drop + 10, text, { size: 7.5, fill: '#07211a', w: 700, ls: '.04em' }) + `</g>`;

// The barrel outline as a bare path, for clipping particles into a cylinder.
const barrelPath = (x, yTop, w, h) => {
  const rd = w / 2;
  return `<path d="M${x} ${yTop + rd} a${rd} ${rd} 0 0 1 ${w} 0 v${h - rd - 4} a4 4 0 0 1 -4 4 h${-(w - 8)} a4 4 0 0 1 -4 -4 z"/>`;
};

// Gas molecules in a region, optionally with the motion streak that says how fast they are
// going. `streak` is length in user units; 0 draws a cold, still gas.
const particles = (bx, by, bw, bh, { n = 14, seed = 7, tint = C.tealLt, r = 2, streak = 0, op = .85 } = {}) => {
  const rnd = rng(seed);
  let out = '';
  for (let i = 0; i < n; i++) {
    const px = bx + rnd() * bw, py = by + rnd() * bh, a = rnd() * 6.283;
    if (streak) {
      out += `<path d="M${(px - streak * Math.cos(a)).toFixed(1)} ${(py - streak * Math.sin(a)).toFixed(1)}`
        + ` L${px.toFixed(1)} ${py.toFixed(1)}" stroke="${tint}" stroke-width="${(r * .7).toFixed(1)}"`
        + ` stroke-linecap="round" opacity="${op * .45}"/>`;
    }
    out += `<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="${r}" fill="${tint}" opacity="${op}"/>`;
  }
  return out;
};

// A pressure gauge: bezel, arc, ticks, needle at `read` (0..1) and an optional ghost needle
// where it read earlier, which is how a scene says "this moved on its own".
const gauge = (cx, cy, r, { read = .6, ghost = null, tint = C.ember, label = null, unit = null } = {}) => {
  const ang = v => (-210 + 240 * v) * Math.PI / 180;
  const hand = (v, col, w) => `<path d="M${cx} ${cy} l${(r * .74 * Math.cos(ang(v))).toFixed(1)} ${(r * .74 * Math.sin(ang(v))).toFixed(1)}"`
    + ` stroke="${col}" stroke-width="${w}" stroke-linecap="round"/>`;
  let ticks = '';
  for (let i = 0; i <= 6; i++) {
    const a = ang(i / 6), r1 = r - 2.5, r2 = r - 6.5;
    ticks += `<path d="M${(cx + r1 * Math.cos(a)).toFixed(1)} ${(cy + r1 * Math.sin(a)).toFixed(1)}`
      + ` L${(cx + r2 * Math.cos(a)).toFixed(1)} ${(cy + r2 * Math.sin(a)).toFixed(1)}"`
      + ` stroke="${C.steelLt}" stroke-width="1" opacity=".7"/>`;
  }
  return `<g>`
    + `<circle cx="${cx}" cy="${cy}" r="${r + 2.5}" fill="${C.steelDk}" stroke="${C.steelLt}" stroke-width="1.4"/>`
    + `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#0b1a21"/>`
    + `<circle cx="${cx - r * .3}" cy="${cy - r * .35}" r="${r * .62}" fill="#ffffff" opacity=".05"/>`
    + ticks
    + (ghost === null ? '' : hand(ghost, C.steel, 1.6))
    + hand(read, tint, 2.1)
    + `<circle cx="${cx}" cy="${cy}" r="2" fill="${C.steelLt}"/>`
    + (label ? mono(cx, cy + r * .58, label, { size: 7.5, fill: tint, w: 700 }) : '')
    + (unit ? mono(cx, cy - r * .34, unit, { size: 7, fill: C.steel }) : '')
    + `</g>`;
};

// The state card the ideal-gas bench actually asks with: three quantities given and the
// fourth a question mark, ruled onto a work slip.
const stateCard = (x, y, w, rows, { title = null } = {}) => {
  const hh = title ? 15 : 4;
  const h = hh + rows.length * 13 + 5;
  let body = '';
  rows.forEach(([lab, val, unknown], i) => {
    const ly = y + hh + 10 + i * 13;
    body += mono(x + 8, ly, lab, { size: 8, fill: unknown ? C.ember : C.slate, anchor: 'start', w: 700 })
      + mono(x + w - 8, ly, val, { size: 8.5, fill: unknown ? C.ember : C.ink, anchor: 'end', w: unknown ? 700 : 500 });
  });
  return `<g>`
    + `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="${C.card}" stroke="${C.steelLt}" stroke-width="1.2"/>`
    + (title
      ? `<path d="M${x} ${y + 12} H${x + w}" stroke="${C.steelLt}" stroke-width=".9"/>`
        + mono(x + 8, y + 9, title, { size: 7, fill: C.steel, anchor: 'start', ls: '.12em', w: 700 })
      : '')
    + body + `</g>`;
};

// A stacked partial-pressure bar. `slices` are [label, fraction, colour]; they sum upward
// from the bottom, which is Dalton's law drawn rather than described. `limit` puts a dashed
// threshold line across it at a fraction of the total.
//
// The gas the scene is ASKING ABOUT goes first, so it sits on the floor of the stack. That
// is not decoration: a 1.4 atm oxygen limit can only be read against a slice measured from
// zero, and a limit line drawn across a bar whose oxygen floats on top of the nitrogen
// would be a line at a height that means nothing.
const barStack = (x, yBot, w, h, slices, { limit = null, limitLabel = null, total = null } = {}) => {
  let out = '', acc = 0;
  slices.forEach(([lab, f, col]) => {
    const sh = h * f, sy = yBot - (acc + f) * h;
    out += `<rect x="${x}" y="${sy.toFixed(1)}" width="${w}" height="${sh.toFixed(1)}" fill="${col}" opacity=".82"/>`
      + `<path d="M${x} ${sy.toFixed(1)} h${w}" stroke="${col}" stroke-width="1.4"/>`
      + (sh >= 11 ? mono(x + w / 2, (sy + sh / 2 + 3).toFixed(1), lab, { size: 7.5, fill: '#06181d', w: 700 }) : '');
    acc += f;
  });
  return `<g>`
    + `<rect x="${x}" y="${yBot - h}" width="${w}" height="${h}" fill="#08181f" opacity=".7"/>`
    + out
    + `<rect x="${x}" y="${yBot - h}" width="${w}" height="${h}" fill="none" stroke="${C.steelLt}" stroke-width="1.1"/>`
    + (limit === null ? ''
      : `<path d="M${x - 7} ${(yBot - limit * h).toFixed(1)} H${x + w + 7}" stroke="${C.danger}" stroke-width="1.4" stroke-dasharray="4 3"/>`
        + (limitLabel ? mono(x + w + 9, (yBot - limit * h + 3).toFixed(1), limitLabel, { size: 7, fill: C.danger, anchor: 'start', w: 700 }) : ''))
    + (total ? mono(x + w / 2, yBot - h - 5, total, { size: 8, fill: C.tealLt, w: 700 }) : '')
    + `</g>`;
};

// One plot primitive, shared by the two Honors graphs the way Unit 11 shares one curve
// between its decay scenes. `series` are {pts:[[0..1,0..1]], color, dash, w}; axis labels
// sit outside the box, and everything stays above y=100 by construction.
const plot = (x, y, w, h, { series = [], xlab = null, ylab = null, gridY = null, marks = [] } = {}) => {
  const px = (u, v) => `${(x + u * w).toFixed(1)} ${(y + h - v * h).toFixed(1)}`;
  let out = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#07171e" opacity=".55"/>`
    + `<path d="M${x} ${y} V${y + h} H${x + w}" fill="none" stroke="${C.steelLt}" stroke-width="1.2" opacity=".75"/>`;
  if (gridY !== null) {
    out += `<path d="M${x} ${(y + h - gridY * h).toFixed(1)} H${x + w}" stroke="${C.steel}" stroke-width="1" stroke-dasharray="3 3" opacity=".8"/>`;
  }
  series.forEach(s => {
    out += `<path d="M${s.pts.map(([u, v]) => px(u, v)).join(' L')}" fill="none" stroke="${s.color}"`
      + ` stroke-width="${s.w || 2}" stroke-linecap="round"${s.dash ? ` stroke-dasharray="${s.dash}"` : ''}/>`;
  });
  marks.forEach(m => {
    out += `<circle cx="${(x + m.u * w).toFixed(1)}" cy="${(y + h - m.v * h).toFixed(1)}" r="3" fill="${C.white}" stroke="${m.color || C.ember}" stroke-width="1.8"/>`;
    if (m.label) out += mono(x + m.u * w + (m.dx || 0), y + h - m.v * h + (m.dy || -7), m.label, { size: 7, fill: m.color || C.ember, w: 700 });
  });
  if (xlab) out += mono(x + w / 2, y + h + 9, xlab, { size: 7, fill: C.steel, ls: '.08em' });
  if (ylab) out += `<g transform="translate(${x - 7},${y + h / 2}) rotate(-90)">` + mono(0, 0, ylab, { size: 7, fill: C.steel, ls: '.08em' }) + `</g>`;
  return out;
};

// A Maxwell-Boltzmann shape in plot coordinates. `a` is the most probable speed as a
// fraction of the x axis; amplitude falls as `a` grows, because the area under the curve
// is the same population however hot or light the gas is.
const mbCurve = (a, steps = 44) => {
  const pts = [];
  for (let i = 0; i <= steps; i++) {
    const u = i / steps, t = u / a;
    pts.push([u, Math.min(1, t * t * Math.exp(1 - t * t) * (0.42 / a))]);
  }
  return pts;
};

// A thermometer: bulb, stem, a column to `frac`, and the scale ticks beside it.
const thermometer = (x, yTop, h, { frac = .5, tint = C.ember, label = null } = {}) =>
  `<g>`
  + `<rect x="${x - 3.5}" y="${yTop}" width="7" height="${h}" rx="3.5" fill="#0b1a21" stroke="${C.steelLt}" stroke-width="1.2"/>`
  + `<rect x="${x - 2}" y="${(yTop + h - h * frac).toFixed(1)}" width="4" height="${(h * frac - 1).toFixed(1)}" rx="2" fill="${tint}"/>`
  + `<circle cx="${x}" cy="${yTop + h + 4}" r="6" fill="${tint}" stroke="${C.steelLt}" stroke-width="1.2"/>`
  + `<g stroke="${C.steelLt}" stroke-width=".9" opacity=".6">`
  + [.2, .4, .6, .8].map(t => `<path d="M${x + 4} ${(yTop + h - h * t).toFixed(1)} h4"/>`).join('') + `</g>`
  + (label ? mono(x, yTop - 5, label, { size: 7.5, fill: tint, w: 700 }) : '')
  + `</g>`;

// A filling whip: the braided hose from the bank or the oxygen line to a cylinder valve.
const whip = (d, { color = C.rubber, tint = C.steelLt, w = 5 } = {}) =>
  `<g fill="none" stroke-linecap="round">`
  + `<path d="${d}" stroke="${color}" stroke-width="${w}"/>`
  + `<path d="${d}" stroke="${tint}" stroke-width="${w}" stroke-dasharray="1.5 5" opacity=".45"/>`
  + `</g>`;

// The compressor: a motor block, a flywheel, the intake filter and the delivery pipe.
const compressor = (x, y, s = 1) =>
  `<g transform="translate(${x},${y}) scale(${s})">`
  + `<rect x="0" y="0" width="62" height="40" rx="4" fill="${C.steelDk}" stroke="${C.steelLt}" stroke-width="1.4"/>`
  + `<rect x="4" y="4" width="54" height="9" rx="2" fill="${C.teal7}" opacity=".7"/>`
  + `<circle cx="20" cy="26" r="10" fill="#0d1b22" stroke="${C.steelLt}" stroke-width="1.6"/>`
  + `<circle cx="20" cy="26" r="3.2" fill="${C.brass}"/>`
  + `<g stroke="${C.steel}" stroke-width="1.3"><path d="M20 17 V35 M11 26 H29 M14 20 L26 32 M26 20 L14 32"/></g>`
  + `<rect x="38" y="18" width="18" height="16" rx="2.5" fill="#0d1b22" stroke="${C.steel}" stroke-width="1.1"/>`
  + `<path d="M41 30 h12 M41 26 h12 M41 22 h8" stroke="${C.o2}" stroke-width="1.2" opacity=".55"/>`
  + `<rect x="-9" y="6" width="11" height="16" rx="3" fill="${C.steelLt}"/>`
  + `<path d="M62 14 h12" stroke="${C.steelLt}" stroke-width="4" stroke-linecap="round"/>`
  + `</g>`;

// The dive truck, side on: a flat-fronted van with the trailer hitch and one tire drawn
// large enough to be the subject when b-tire needs it to be.
const truck = (x, y, s = 1, { tireTint = C.rubber } = {}) =>
  `<g transform="translate(${x},${y}) scale(${s})">`
  + `<path d="M0 0 h74 v-22 h20 l14 16 v6 h6 v16 H0 z" fill="${C.slate}" stroke="${C.steelLt}" stroke-width="1.4"/>`
  + `<path d="M78 -18 h12 l10 12 h-22 z" fill="${C.tealLt}" opacity=".35"/>`
  + `<rect x="8" y="-14" width="58" height="14" rx="2" fill="${C.teal7}" opacity=".55"/>`
  + `<circle cx="26" cy="16" r="11" fill="${tireTint}" stroke="#0a0f12" stroke-width="1.4"/>`
  + `<circle cx="26" cy="16" r="4.5" fill="${C.steelLt}"/>`
  + `<circle cx="92" cy="16" r="11" fill="${tireTint}" stroke="#0a0f12" stroke-width="1.4"/>`
  + `<circle cx="92" cy="16" r="4.5" fill="${C.steelLt}"/>`
  + `</g>`;

// The depth column: surface, graduated depth ticks with the absolute pressure each one
// carries, and a diver silhouette hanging at the planned depth.
const depthColumn = (x, yTop, w, h, { marks = [], diver = null } = {}) => {
  let out = `<rect x="${x}" y="${yTop}" width="${w}" height="${h}" fill="${C.sea}" opacity=".85"/>`
    + `<path d="M${x} ${yTop} h${w}" stroke="${C.tankLt}" stroke-width="1.6" opacity=".8"/>`
    + `<rect x="${x}" y="${yTop}" width="${w}" height="${h}" fill="none" stroke="${C.steelLt}" stroke-width="1" opacity=".5"/>`;
  marks.forEach(([f, lab]) => {
    const my = yTop + f * h;
    out += `<path d="M${x} ${my.toFixed(1)} h${w}" stroke="${C.tankLt}" stroke-width=".9" stroke-dasharray="3 3" opacity=".5"/>`
      + mono(x + w + 4, my + 3, lab, { size: 7, fill: C.tankLt, anchor: 'start' });
  });
  if (diver !== null) {
    const dy = yTop + diver * h;
    out += `<g transform="translate(${x + w / 2},${dy.toFixed(1)})">`
      + `<path d="M-9 0 q9 -9 18 0 q-9 9 -18 0 z" fill="${C.ink}" opacity=".85"/>`
      + `<circle cx="9" cy="-3" r="4" fill="${C.ink}" opacity=".9"/>`
      + `<path d="M-9 1 l-7 6 M-9 -1 l-7 -5" stroke="${C.ink}" stroke-width="2" stroke-linecap="round" opacity=".85"/>`
      + `<circle cx="13" cy="-8" r="1.6" fill="${C.tealLt}" opacity=".8"/>`
      + `<circle cx="16" cy="-13" r="1.1" fill="${C.tealLt}" opacity=".6"/></g>`;
  }
  return out;
};

// The oxygen analyzer: a handheld box with a two-digit readout and its sampling probe.
const analyzer = (x, y, { read = '20.9%', tint = C.o2, probe = 'left' } = {}) =>
  `<g>`
  + `<rect x="${x}" y="${y}" width="46" height="34" rx="4" fill="#1a262d" stroke="${C.steelLt}" stroke-width="1.4"/>`
  + `<rect x="${x + 5}" y="${y + 5}" width="36" height="14" rx="2" fill="#04120f" stroke="${C.steel}" stroke-width=".9"/>`
  + mono(x + 23, y + 16, read, { size: 9, fill: tint, w: 700 })
  + `<g fill="${C.steel}"><rect x="${x + 6}" y="${y + 23}" width="10" height="5" rx="1.5"/>`
  + `<rect x="${x + 20}" y="${y + 23}" width="10" height="5" rx="1.5"/>`
  + `<rect x="${x + 34}" y="${y + 23}" width="6" height="5" rx="1.5"/></g>`
  + (probe === 'left'
    ? `<path d="M${x} ${y + 26} h-14" stroke="${C.steelLt}" stroke-width="2.4" stroke-linecap="round"/>`
      + `<rect x="${x - 24}" y="${y + 21}" width="11" height="10" rx="3" fill="${C.steelLt}"/>`
    : `<path d="M${x + 46} ${y + 26} h14" stroke="${C.steelLt}" stroke-width="2.4" stroke-linecap="round"/>`
      + `<rect x="${x + 59}" y="${y + 21}" width="11" height="10" rx="3" fill="${C.steelLt}"/>`)
  + `</g>`;

// ---------------------------------------------------------------- scaffolding
// scene(id, opts) -> a complete 400x150 banner string.
//   caption  required mono strapline along the bottom
//   body     required k => shapes, drawn between background and scrim
//   theme    'bench' (default, inside the fill room) | 'out' | 'copper'
function scene(id, { caption, body, theme = 'bench', bg, frame, capColor }) {
  const honors = theme === 'copper';
  const [top, bot] = bg || (honors ? COPPER_BG : theme === 'out' ? OUT_BG : BENCH_BG);
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

  // ================= C.10(A) name the postulate behind what you can see =================
  // Three observations, drawn as observations. Each one puts the thing you can see next to
  // the particles that are the reason for it, because the bench is asking you to connect
  // exactly those two.

  // The whip: oxygen goes in at one end and the analyzer reads the same everywhere.
  'a-whip': scene('a-whip', { caption: 'RANDOM MOTION · GAS PARTICLES SPREAD', body: k => {
    const clip = k.clip('barrel', barrelPath(96, 20, 46, 72));
    return fillRoom()
      + whip('M18 34 C46 28 44 12 74 10 C96 9 104 7 119 9')
      + `<rect x="8" y="26" width="16" height="34" rx="3" fill="${C.o2}" opacity=".55" stroke="${C.steelLt}" stroke-width="1.2"/>`
      + mono(16, 70, 'O2', { size: 8, fill: C.o2, w: 700 })
      + cylinder(96, 20, 46, 72, { k, n: 'cyl' })
      + `<g clip-path="${clip}">`
      + particles(96, 20, 46, 72, { n: 30, seed: 12, tint: C.o2, r: 2, streak: 5, op: .8 })
      + particles(96, 20, 46, 72, { n: 26, seed: 41, tint: C.n2, r: 2, streak: 5, op: .55 })
      + `</g>`
      + sticker(96, 20, 46, 'EAN32')
      // two sample points, top and bottom of the same cylinder, reading the same
      + `<path d="M142 30 H176 M142 80 H176" stroke="${C.steelLt}" stroke-width="1.2" stroke-dasharray="3 3"/>`
      + analyzer(178, 14, { read: '32.0%' })
      + analyzer(178, 64, { read: '32.0%' })
      + mono(255, 26, 'top of the barrel', { size: 7.5, fill: C.dim, anchor: 'start' })
      + mono(255, 78, 'bottom of the barrel', { size: 7.5, fill: C.dim, anchor: 'start' })
      + mono(255, 52, 'UNIFORM AFTER MIXING', { size: 9, fill: C.o2, anchor: 'start', w: 700, ls: '.08em' })
      + `<path d="M250 42 v18" stroke="${C.o2}" stroke-width="1.4" opacity=".7"/>`;
  } }),

  // The compressor: a room full of air goes into a rack of steel. Same molecules, and the
  // volume they end up in is a fraction of the one they came out of.
  'a-steel': scene('a-steel', { caption: 'GAS PARTICLES · LARGE SPACES BETWEEN THEM', body: k => {
    const clip = k.clip('barrel', barrelPath(292, 26, 40, 62));
    return fillRoom()
      + `<rect x="12" y="14" width="126" height="74" rx="3" fill="#0c2029" opacity=".8" stroke="${C.steelLt}" stroke-width="1.2" stroke-dasharray="5 4"/>`
      + particles(16, 18, 118, 66, { n: 26, seed: 5, tint: C.tealLt, r: 2, op: .7 })
      + mono(75, 98, 'large gas volume', { size: 8, fill: C.pale, w: 700 })
      + compressor(154, 34, 1)
      + `<path d="M138 44 h14" stroke="${C.steelLt}" stroke-width="3" stroke-linecap="round"/>`
      + whip('M228 48 C252 48 258 54 276 54')
      + cylinder(292, 26, 40, 62, { k, n: 'cyl', boot: true })
      + `<g clip-path="${clip}">`
      + particles(292, 26, 40, 62, { n: 26, seed: 5, tint: C.tealLt, r: 2, op: .85 })
      + `</g>`
      + gauge(356, 34, 15, { read: .82, label: '200', unit: 'atm' })
      + mono(312, 100, 'same particles', { size: 8, fill: C.o2, w: 700 })
      + mono(258, 24, 'much smaller volume', { size: 7.5, fill: C.ember, w: 700 })
      + `<path d="M244 30 C258 34 268 38 282 44" fill="none" stroke="${C.ember}" stroke-width="1.2" stroke-dasharray="3 3"/>`;
  } }),

  // The hot deck: nobody touched the cylinder, and the needle has moved anyway.
  'a-deck': scene('a-deck', { caption: 'HIGHER T · HIGHER AVERAGE KINETIC ENERGY', theme: 'out', body: k => {
    const halo = k.hot('sun');
    const clip = k.clip('barrel', barrelPath(96, 22, 44, 68));
    return outside('sea', 66)
      + `<circle cx="52" cy="18" r="46" fill="${halo}"/>`
      + `<g stroke="${C.sun}" stroke-width="1.6" opacity=".45" stroke-linecap="round">`
      + `<path d="M70 30 l22 14"/><path d="M74 18 l26 6"/><path d="M62 40 l14 20"/></g>`
      + cylinder(96, 22, 44, 68, { k, n: 'cyl', boot: true })
      + `<g clip-path="${clip}">`
      + particles(96, 22, 44, 68, { n: 22, seed: 9, tint: C.ember, r: 2, streak: 9, op: .85 })
      + `</g>`
      + thermometer(166, 22, 56, { frac: .84, tint: C.ember, label: '41 °C' })
      + gauge(250, 46, 24, { read: .78, ghost: .62, label: '215', unit: 'atm' })
      + mono(250, 82, '05:00 read 200', { size: 7.5, fill: C.steel })
      + `<path d="M296 40 h14 m0 0 l-5 -4 m5 4 l-5 4" stroke="${C.ember}" stroke-width="1.4" fill="none" stroke-linecap="round"/>`
      + mono(316, 30, 'faster', { size: 8, fill: C.ember, anchor: 'start', w: 700 })
      + mono(316, 43, 'molecules,', { size: 8, fill: C.ember, anchor: 'start' })
      + mono(316, 56, 'harder hits,', { size: 8, fill: C.ember, anchor: 'start' })
      + mono(316, 69, 'more pressure', { size: 8, fill: C.ember, anchor: 'start' });
  } }),

  // ================= C.10(B) ideal gas: three given, the fourth committed =================
  // One grammar: the vessel on the left, the state card on the right, the unknown in ember.

  // The truck: tires set cold this morning, a day of tarmac later.
  'b-tire': scene('b-tire', { caption: 'THE TRUCK IN THE LOT · SET COLD, READ HOT', theme: 'out', body: k => {
    const halo = k.hot('sun');
    return outside('tarmac', 70)
      + `<circle cx="52" cy="18" r="42" fill="${halo}"/>`
      + truck(14, 62, .92)
      // the near tire, blown up: same air, hotter tarmac
      + `<circle cx="176" cy="54" r="30" fill="${C.rubber}" stroke="${C.steelLt}" stroke-width="1.4"/>`
      + `<circle cx="176" cy="54" r="19" fill="#0d1a20" stroke="${C.steel}" stroke-width="1.2"/>`
      + `<circle cx="176" cy="54" r="9" fill="${C.steelLt}"/>`
      + `<g stroke="#11181c" stroke-width="2" opacity=".7">`
      + [0, 45, 90, 135, 180, 225, 270, 315].map(a => {
        const t = a * Math.PI / 180;
        return `<path d="M${(176 + 21 * Math.cos(t)).toFixed(1)} ${(54 + 21 * Math.sin(t)).toFixed(1)} L${(176 + 29 * Math.cos(t)).toFixed(1)} ${(54 + 29 * Math.sin(t)).toFixed(1)}"/>`;
      }).join('') + `</g>`
      + particles(158, 36, 36, 36, { n: 9, seed: 21, tint: C.ember, r: 1.8, streak: 6, op: .8 })
      + `<g stroke="${C.ember}" stroke-width="1.3" fill="none" opacity=".55">`
      + `<path d="M148 90 q5 -8 0 -14 q-5 -6 0 -12"/><path d="M204 90 q5 -8 0 -14 q-5 -6 0 -12"/></g>`
      + thermometer(224, 26, 48, { frac: .86, tint: C.ember, label: '48 C' })
      + stateCard(252, 20, 134, [['V', '14 L'], ['n', '1.7 mol'], ['T', '321 K'], ['P', '? atm', true]], { title: 'TYRE, NOW' });
  } }),

  // The twin-set: the fill is measured in atm, but what you hand over is moles.
  'b-twinset': scene('b-twinset', { caption: 'THE TWIN-SET · BAR ON THE GAUGE, MOLES OFF THE BANK', body: k => {
    const c1 = k.clip('b1', barrelPath(30, 20, 40, 72)), c2 = k.clip('b2', barrelPath(78, 20, 40, 72));
    return fillRoom()
      + cylinder(30, 20, 40, 72, { k, n: 'cylA', boot: true })
      + `<g clip-path="${c1}">` + particles(30, 20, 40, 72, { n: 24, seed: 3, tint: C.tealLt, r: 1.9, op: .7 }) + `</g>`
      + cylinder(78, 20, 40, 72, { k, n: 'cylB', boot: true })
      + `<g clip-path="${c2}">` + particles(78, 20, 40, 72, { n: 24, seed: 33, tint: C.tealLt, r: 1.9, op: .7 }) + `</g>`
      // the manifold bar that makes two cylinders one vessel
      + `<path d="M46 10 H102" stroke="${C.steelLt}" stroke-width="4" stroke-linecap="round"/>`
      + `<circle cx="74" cy="10" r="5" fill="none" stroke="${C.brass}" stroke-width="2"/>`
      + `<g stroke="${C.steelLt}" stroke-width="3"><path d="M50 10 V16"/><path d="M98 10 V16"/></g>`
      + whip('M132 34 C150 34 152 22 168 20')
      + gauge(150, 62, 17, { read: .86, label: '220', unit: 'atm' })
      + stateCard(196, 16, 118, [['P', '220 atm'], ['V', '24 L'], ['T', '292 K'], ['n', '? mol', true]], { title: 'THE FILL' })
      + `<path d="M324 44 h12 m0 0 l-4 -3.5 m4 3.5 l-4 3.5" stroke="${C.ember}" stroke-width="1.3" fill="none" stroke-linecap="round"/>`
      + `<rect x="338" y="22" width="52" height="46" rx="3" fill="#0c1c24" stroke="${C.steelLt}" stroke-width="1.2"/>`
      + mono(364, 34, 'BANK', { size: 7, fill: C.steel, ls: '.1em', w: 700 })
      + `<rect x="344" y="40" width="40" height="20" rx="2" fill="#08161c"/>`
      + `<rect x="344" y="48" width="26" height="12" rx="2" fill="${C.teal}" opacity=".7"/>`
      + mono(364, 76, 'what leaves it', { size: 7, fill: C.dim });
  } }),

  // The swim deck: the pressure is high, and the question is whether that is sun or an
  // over-fill. Solve for T and you know which.
  'b-sundeck': scene('b-sundeck', { caption: 'THE SWIM DECK · IS THAT SUN OR AN OVER-FILL?', theme: 'out', body: k => {
    const halo = k.hot('sun');
    const clip = k.clip('barrel', barrelPath(0, -22, 44, 92));
    return outside('sea', 60)
      + `<circle cx="52" cy="18" r="44" fill="${halo}"/>`
      // deck planks under a cylinder that is lying down
      + `<g stroke="${C.steelLt}" stroke-width="1" opacity=".18">`
      + `<path d="M0 74 H400 M0 86 H400"/></g>`
      + `<g transform="translate(16,88) rotate(-90)">`
      + cylinder(0, -22, 44, 92, { k, n: 'cyl' })
      + `<g clip-path="${clip}">` + particles(0, -22, 44, 92, { n: 22, seed: 17, tint: C.ember, r: 2, streak: 8, op: .8 }) + `</g>`
      + `</g>`
      + `<g stroke="${C.sun}" stroke-width="1.5" opacity=".4" stroke-linecap="round">`
      + `<path d="M64 22 l14 20"/><path d="M92 16 l10 24"/></g>`
      + gauge(148, 44, 20, { read: .84, ghost: .66, label: '208', unit: 'atm' })
      + mono(148, 74, 'filled at 200', { size: 7.5, fill: C.steel })
      + thermometer(196, 24, 50, { frac: .9, tint: C.ember, label: '?' })
      + stateCard(226, 16, 160, [['P', '208 atm'], ['V', '12.0 L'], ['n', '96 mol'], ['T', '? K', true]], { title: 'THE STEEL ON THE DECK' });
  } }),

  // ================= C.10(C) Dalton: the stack that sums to the total =================
  // One grammar: the vessel or the place on the left, the stacked partial pressures on the
  // right, and the slice the bench is asking for called out.

  // Plain air on the dock, before the first fill. The reference every blend is checked on.
  'c-air': scene('c-air', { caption: 'PARTIAL PRESSURE · MOLE FRACTION × TOTAL P', theme: 'out', body: k => {
    return outside('sea', 64)
      // the dock rail, and the barometer nailed to the post
      + `<g stroke="${C.steelLt}" stroke-width="3" opacity=".7" stroke-linecap="round">`
      + `<path d="M22 96 V40"/><path d="M96 96 V40"/><path d="M12 42 H106"/><path d="M12 64 H106"/></g>`
      + gauge(59, 22, 16, { read: .5, tint: C.tealLt, label: '1.00', unit: 'atm' })
      + analyzer(126, 44, { read: '20.9%', probe: 'left' })
      + particles(112, 12, 130, 28, { n: 16, seed: 23, tint: C.tealLt, r: 1.7, streak: 4, op: .5 })
      + mono(178, 92, 'open air at the rail', { size: 7.5, fill: C.dim })
      + barStack(252, 92, 46, 74, [
        ['O2', .21, C.o2],
        ['N2', .78, C.n2],
        ['Ar', .01, C.copper1]
      ], { total: 'P total 1.00 atm' })
      + `<path d="M300 84 C312 84 314 79 318 75" fill="none" stroke="${C.o2}" stroke-width="1.3" stroke-dasharray="3 2"/>`
      + mono(320, 70, 'pO2 = XO2 · Ptot', { size: 7.5, fill: C.o2, anchor: 'start', w: 700 })
      + mono(320, 83, '= 0.209 atm', { size: 8, fill: C.o2, anchor: 'start', w: 700 });
  } }),

  // The blend: two feed lines summing into one cylinder.
  'c-blend': scene('c-blend', { caption: 'DALTON MODEL · PARTIAL PRESSURES ADD TO TOTAL P', body: k => {
    const clip = k.clip('barrel', barrelPath(120, 22, 44, 70));
    return fillRoom()
      // the two feeds: oxygen from the top line, bank air from the bottom one
      + `<rect x="8" y="14" width="15" height="30" rx="3" fill="${C.o2}" opacity=".6" stroke="${C.steelLt}" stroke-width="1.1"/>`
      + mono(15, 54, 'O2', { size: 7.5, fill: C.o2, w: 700 })
      + `<rect x="8" y="62" width="15" height="30" rx="3" fill="${C.n2}" opacity=".6" stroke="${C.steelLt}" stroke-width="1.1"/>`
      + mono(15, 100, 'AIR', { size: 7.5, fill: C.n2, w: 700 })
      + whip('M23 26 C58 26 62 44 88 46', { color: '#12332a', tint: C.o2 })
      + whip('M23 76 C58 76 62 52 88 50', { color: '#14263c', tint: C.n2 })
      // the Y and the whip into the valve
      + `<circle cx="92" cy="48" r="6" fill="${C.steelLt}"/>`
      + whip('M98 48 C112 48 122 22 140 12')
      + cylinder(120, 22, 44, 70, { k, n: 'cyl', boot: true })
      + `<g clip-path="${clip}">`
      + particles(120, 22, 44, 70, { n: 18, seed: 6, tint: C.o2, r: 2, op: .8 })
      + particles(120, 22, 44, 70, { n: 34, seed: 61, tint: C.n2, r: 2, op: .6 })
      + `</g>`
      + sticker(120, 22, 44, 'EAN32', { drop: 26 })
      + gauge(190, 66, 16, { read: .8, label: '200', unit: 'atm' })
      + barStack(238, 92, 44, 76, [
        ['pO2', .32, C.o2],
        ['pN2', .68, C.n2]
      ], { total: 'P total 200 atm' })
      + `<path d="M284 80 h14" stroke="${C.o2}" stroke-width="1.4" stroke-dasharray="3 2"/>`
      + mono(302, 28, 'the O2 fraction', { size: 7.5, fill: C.dim, anchor: 'start' })
      + mono(302, 41, 'sets pO2 at', { size: 7.5, fill: C.dim, anchor: 'start' })
      + mono(302, 54, 'a stated P total', { size: 7.5, fill: C.dim, anchor: 'start' })
      + mono(302, 74, 'pO2 + pN2', { size: 8, fill: C.o2, anchor: 'start', w: 700 })
      + mono(302, 87, '= P total', { size: 8, fill: C.o2, anchor: 'start', w: 700 });
  } }),

  // The plan: the same mix, taken down. Depth multiplies every partial pressure in it.
  'c-ppo2': scene('c-ppo2', { caption: 'DEPTH · ABSOLUTE PRESSURE RAISES pO2', theme: 'out', body: k => {
    return outside('sea', 20)
      + depthColumn(24, 20, 54, 78, {
        marks: [[0, '0 m · 1 atm'], [.32, '10 m · 2 atm'], [.64, '20 m · 3 atm'], [.96, '30 m · 4 atm']],
        diver: .66
      })
      + mono(51, 14, 'SURFACE', { size: 7, fill: C.tankLt, ls: '.1em', w: 700 })
      + barStack(150, 92, 38, 22, [['pO2', .32, C.o2], ['pN2', .68, C.n2]], { total: 'at the surface' })
      + `<path d="M194 62 h16 m0 0 l-5 -4 m5 4 l-5 4" stroke="${C.ember}" stroke-width="1.4" fill="none" stroke-linecap="round"/>`
      + mono(202, 54, 'x4', { size: 8, fill: C.ember, w: 700 })
      + barStack(220, 92, 38, 86, [['pO2', .32, C.o2], ['pN2', .68, C.n2]], { limit: .35, total: 'at 30 m' })
      + `<path d="M258 62 H288" stroke="${C.danger}" stroke-width="1.3" stroke-dasharray="4 3"/>`
      + mono(292, 30, 'EAN32 at 4 atm', { size: 8, fill: C.o2, anchor: 'start', w: 700 })
      + mono(292, 43, '4.00 x 0.32', { size: 7.5, fill: C.dim, anchor: 'start' })
      + mono(292, 57, '= 1.28 atm pO2', { size: 8.5, fill: C.o2, anchor: 'start', w: 700 })
      + mono(292, 75, 'working limit', { size: 7.5, fill: C.danger, anchor: 'start', w: 700 })
      + mono(292, 87, '1.40 atm', { size: 7.5, fill: C.danger, anchor: 'start' });
  } }),

  // ================= Honors: the two curves this unit is really about =================

  // h1: the Maxwell-Boltzmann distribution. Same rack, same temperature, two molar masses.
  'h1-speeds': scene('h1-speeds', { caption: 'SAME T · SAME AVERAGE KE · DIFFERENT SPEEDS', theme: 'copper', body: k => {
    const cHe = k.clip('bHe', barrelPath(20, 22, 34, 64)), cAir = k.clip('bAir', barrelPath(62, 22, 34, 64));
    return `<rect width="400" height="102" fill="#160f07" opacity=".35"/>`
      // the two bottles standing in one rack, at one temperature
      + `<path d="M12 92 H104" stroke="${C.steelLt}" stroke-width="2" opacity=".5"/>`
      + `<path d="M12 44 H104" stroke="${C.steelLt}" stroke-width="2.4" opacity=".35"/>`
      + cylinder(20, 22, 34, 64, { k, n: 'cylHe', tint: '#7a6a3f', boot: true })
      + `<g clip-path="${cHe}">` + particles(20, 22, 34, 64, { n: 14, seed: 4, tint: C.copper1, r: 1.7, streak: 11, op: .9 }) + `</g>`
      + cylinder(62, 22, 34, 64, { k, n: 'cylAir', tint: '#4a5a63', boot: true })
      + `<g clip-path="${cAir}">` + particles(62, 22, 34, 64, { n: 14, seed: 44, tint: C.pale, r: 2.4, streak: 4, op: .9 }) + `</g>`
      + mono(37, 100, 'He', { size: 8, fill: C.copper1, w: 700 })
      + mono(79, 100, 'air', { size: 8, fill: C.pale, w: 700 })
      + thermometer(116, 30, 44, { frac: .55, tint: C.copper, label: '293 K' })
      + plot(150, 14, 176, 74, {
        xlab: 'MOLECULAR SPEED', ylab: 'FRACTION',
        series: [
          { pts: mbCurve(.30), color: C.pale, w: 2.2 },
          { pts: mbCurve(.56), color: C.copper1, w: 2.2 }
        ],
        marks: [
          { u: .30, v: mbCurve(.30)[Math.round(.30 * 44)][1], color: C.pale, label: 'air', dx: -12, dy: -6 },
          { u: .56, v: mbCurve(.56)[Math.round(.56 * 44)][1], color: C.copper1, label: 'He', dx: 4, dy: -6 }
        ]
      })
      + mono(336, 34, 'same', { size: 7.5, fill: C.copper1, anchor: 'start', w: 700 })
      + mono(336, 46, 'average KE', { size: 7.5, fill: C.copper1, anchor: 'start' })
      + mono(336, 64, 'lighter gas', { size: 7.5, fill: C.pale, anchor: 'start', w: 700 })
      + mono(336, 76, 'peaks right', { size: 7.5, fill: C.pale, anchor: 'start' });
  } }),

  // h2: compressibility. The ideal line at 1, and the real gas leaving it as P climbs.
  'h2-real': scene('h2-real', { caption: 'REAL GAS · DEVIATION FROM IDEAL BEHAVIOR', theme: 'copper', body: k => {
    // Z = PV/nRT for a real gas: attraction pulls it under 1, then the molecules' own
    // volume pushes it back over. Drawn on a 0.6..1.3 axis.
    const zAt = u => {
      const z = 1 - 1.35 * u * Math.exp(-2.6 * u) + 0.62 * u * u;
      return (z - .6) / .7;
    };
    const real = [];
    for (let i = 0; i <= 40; i++) { const u = i / 40; real.push([u, Math.max(0, Math.min(1, zAt(u)))]); }
    const oneV = (1 - .6) / .7;
    return `<rect width="400" height="102" fill="#160f07" opacity=".35"/>`
      // the bank itself, racked and under pressure
      + `<g>`
      + [0, 1, 2].map(i => cylinder(14 + i * 30, 20, 26, 68, { k, n: `bank${i}`, tint: '#5a4a2c', boot: true })).join('')
      + `<path d="M10 34 H100" stroke="${C.steelLt}" stroke-width="2.6" opacity=".5"/>`
      + `</g>`
      + gauge(112, 34, 15, { read: .95, tint: C.danger, label: '300', unit: 'atm' })
      + mono(57, 100, 'the storage bank', { size: 7.5, fill: C.copper1 })
      + plot(158, 12, 172, 76, {
        xlab: 'PRESSURE', ylab: 'PV / nRT', gridY: oneV,
        series: [
          { pts: [[0, oneV], [1, oneV]], color: C.steelLt, dash: '4 3', w: 1.6 },
          { pts: real, color: C.copper1, w: 2.4 }
        ],
        marks: [{ u: .28, v: zAt(.28), color: C.danger, label: 'attraction', dx: -6, dy: 12 }]
      })
      + mono(334, 20, 'ideal = 1', { size: 7.5, fill: C.steelLt, anchor: 'start' })
      + mono(334, 40, 'below:', { size: 7.5, fill: C.danger, anchor: 'start', w: 700 })
      + mono(334, 51, 'they pull', { size: 7.5, fill: C.danger, anchor: 'start' })
      + mono(334, 68, 'above:', { size: 7.5, fill: C.copper1, anchor: 'start', w: 700 })
      + mono(334, 79, 'they take', { size: 7.5, fill: C.copper1, anchor: 'start' })
      + mono(334, 90, 'up room', { size: 7.5, fill: C.copper1, anchor: 'start' });
  } }),

  // h3: gas over water. What the tube reads is your gas plus vapor that came for free.
  'h3-water': scene('h3-water', { caption: 'GAS OVER WATER · SUBTRACT WATER VAPOR P', theme: 'copper', body: k => {
    const water = k.lin('w', [[0, '#2b5f6e'], [1, '#123943']]);
    const glass = k.glass('g', ['#1a3b45', '#356f7c', '#9ccbd6']);
    return `<rect width="400" height="102" fill="#160f07" opacity=".3"/>`
      // the trough
      + `<path d="M22 56 h136 v34 a4 4 0 0 1 -4 4 H26 a4 4 0 0 1 -4 -4 z" fill="${water}" stroke="${C.steelLt}" stroke-width="1.4"/>`
      + `<path d="M22 62 H158" stroke="${C.tankLt}" stroke-width="1.2" opacity=".6"/>`
      // the inverted graduated tube, gas at the top, water pushed down
      + `<rect x="62" y="8" width="34" height="76" rx="4" fill="${glass}" opacity=".5" stroke="${C.steelLt}" stroke-width="1.4"/>`
      + `<rect x="64" y="10" width="30" height="34" rx="3" fill="${C.copper}" opacity=".26"/>`
      + `<rect x="64" y="44" width="30" height="38" fill="${water}" opacity=".85"/>`
      + `<path d="M64 44 h30" stroke="${C.copper1}" stroke-width="1.6"/>`
      + `<g stroke="${C.pale}" stroke-width=".9" opacity=".65">`
      + [16, 24, 32, 40, 48, 56, 64, 72].map(y => `<path d="M84 ${y} h10"/>`).join('') + `</g>`
      + particles(66, 12, 26, 30, { n: 9, seed: 8, tint: C.copper1, r: 1.8, streak: 4, op: .8 })
      + `<g fill="${C.tankLt}" opacity=".7">`
      + `<circle cx="79" cy="56" r="2.4"/><circle cx="83" cy="66" r="1.8"/><circle cx="76" cy="74" r="2"/></g>`
      // the delivery tube coming in under the mouth
      + `<path d="M138 70 C120 70 106 82 92 84" fill="none" stroke="${C.rubber}" stroke-width="4" stroke-linecap="round"/>`
      + `<rect x="138" y="60" width="20" height="22" rx="3" fill="${C.steelLt}" opacity=".6"/>`
      + thermometer(178, 34, 42, { frac: .42, tint: C.copper, label: '25 °C' })
      + barStack(216, 92, 44, 80, [['P dry gas', .94, C.copper], ['H2O', .06, C.tankLt]], { total: 'what the tube reads' })
      + `<path d="M262 22 h16" stroke="${C.tankLt}" stroke-width="1.3" stroke-dasharray="3 2"/>`
      + mono(282, 18, 'vapor at 25 C', { size: 7.5, fill: C.tankLt, anchor: 'start', w: 700 })
      + mono(282, 30, '= 0.0313 atm', { size: 7.5, fill: C.tankLt, anchor: 'start' })
      + mono(282, 52, 'P dry =', { size: 8, fill: C.copper1, anchor: 'start', w: 700 })
      + mono(282, 65, 'P total', { size: 8, fill: C.copper1, anchor: 'start' })
      + mono(282, 78, '- P H2O', { size: 8, fill: C.copper1, anchor: 'start' });
  } }),

  // ================= Capstone: the last fill of the day =================
  // Everything at once: what the bank has left, what the fill takes, and what the mix does
  // at the depth the diver asked for.
  'cap-lastfill': scene('cap-lastfill', { caption: 'CAPSTONE · COMPARE THE CALCULATED VALUES', theme: 'copper', body: k => {
    const clip = k.clip('barrel', barrelPath(96, 24, 40, 64));
    return `<rect width="400" height="102" fill="#160f07" opacity=".35"/>`
      // what is left in the bank
      + `<g>`
      + [0, 1, 2].map(i => cylinder(12 + i * 24, 30, 20, 56, { k, n: `bk${i}`, tint: '#4b3f26' })).join('')
      + `<path d="M8 44 H80" stroke="${C.steelLt}" stroke-width="2.2" opacity=".45"/></g>`
      + `<rect x="10" y="90" width="68" height="8" rx="3" fill="#0c1c24" stroke="${C.steelLt}" stroke-width="1"/>`
      + `<rect x="11.5" y="91.5" width="19" height="5" rx="2.5" fill="${C.danger}"/>`
      + mono(44, 13, 'RESERVE LOW', { size: 7.5, fill: C.danger, w: 700, ls: '.06em' })
      + whip('M80 58 C88 58 88 30 100 20', { color: '#2b2118', tint: C.copper1 })
      + cylinder(96, 24, 40, 64, { k, n: 'cyl', boot: true })
      + `<g clip-path="${clip}">`
      + particles(96, 24, 40, 64, { n: 12, seed: 14, tint: C.o2, r: 2, op: .8 })
      + particles(96, 24, 40, 64, { n: 20, seed: 71, tint: C.n2, r: 2, op: .55 })
      + `</g>`
      + sticker(96, 24, 40, 'EAN32', { drop: 24 })
      + gauge(158, 42, 15, { read: .48, tint: C.copper, label: '120', unit: 'atm' })
      + depthColumn(192, 18, 34, 74, { marks: [[.5, '30 m'], [.96, '40 m']], diver: .5 })
      + barStack(254, 92, 32, 74, [['pO2', .32, C.o2], ['pN2', .68, C.n2]], { limit: .35, total: 'at depth' })
      + `<path d="M286 66 H302" stroke="${C.danger}" stroke-width="1.3" stroke-dasharray="4 3"/>`
      + mono(294, 61, '1.4', { size: 7, fill: C.danger, w: 700 })
      + `<rect x="310" y="14" width="78" height="78" rx="3" fill="${C.card}" stroke="${C.steelLt}" stroke-width="1.2"/>`
      + mono(318, 26, 'DECIDE', { size: 7, fill: C.steel, anchor: 'start', ls: '.1em', w: 700 })
      + `<path d="M310 31 H388" stroke="${C.steelLt}" stroke-width=".9"/>`
      + `<g>`
      + [['criteria met', 45], ['pO2 high', 62], ['reserve low', 79]].map(([t, y]) =>
        `<circle cx="321" cy="${y - 3.5}" r="3.5" fill="none" stroke="${C.copper7}" stroke-width="1.3"/>`
        + mono(330, y, t, { size: 8, fill: C.ink, anchor: 'start' })).join('')
      + `</g>`;
  } })
};

export function sceneArt(id) { return SCENE_ART[id] || ''; }
