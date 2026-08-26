// art.js — Unit 9 scene illustrations ("The Night Shift": one overnight poison-control
// bench, and an acidotic patient in the bay next door).
// One inline SVG per SCENARIO id (see model.js), rendered into the cockpit's mission screen
// via x-html. The only file in this unit written from scratch for the port.
//
// Built on the same scaffolding as units_new/01-practices-matter/js/art.js,
// units_new/05-the-mole/js/art.js and units_new/04-bonding-geometry/js/art.js, because the
// four share a shell and a set that disagrees with itself reads as four products:
//   • viewBox is 400x150 — the 8:3 the .mission-frame is sized to.
//   • Every gradient/pattern/clip id is prefixed with the scene id. Alpine keeps all
//     station panels in the DOM (x-show, not x-if), so the SVGs coexist and an unprefixed
//     id would bleed from one scene into another. kit() does the prefixing.
//   • Lighting is from the upper left everywhere — one task lamp over the bench — so a
//     bottle in one banner is shaded like the bottle in the next.
//   • Keep the subject above y=100. Below that the caption scrim fades the art out.
//   • Banners are aria-hidden: the scenario's goal text directly below is the
//     authoritative description, so announcing the art too is redundant.
//
// THE SET SIGNATURE, and it carries a fact rather than just a mood. Unit 1 says "in the
// tank" or "on the desk"; Unit 4 says "under the sink" or "on the counter". This unit says
// **whether this call reaches the patient**:
//
//   • benchTop() is the poison-control bench — pegboard, worktop, one lamp. Ten of the
//     sixteen calls never leave it: a soda, a bucket of cleaner, an antacid box. They cost
//     you minutes and nothing else, and their banners are closed off, bench and back wall.
//   • The other six get the BAY. Those are exactly the six scenarios whose correct outcome
//     moves the arterial pH (the ones main.js derives REACHING from): the transfer sheet,
//     the buffer note, the four bottles from the scene, the blood gas, the titration the
//     ward doses against, and the handover. Two of them happen in the bay outright and are
//     drawn there with bayRoom(); the other four are bench scenes that show the lit gap of
//     curtain at the right edge, with the monitor trace running across it.
//
// So a learner who never reads a word of this file still sees the difference between the
// calls that cost time and the calls that cost the patient — before committing either.
//
// Palette tracks tokens.css: teal for the department and its instruments, copper for the
// two Honors jobs, semantic red/amber for hazards, a monitor green that appears ONLY in
// the bay so it never reads as decoration.

const MONO = "'JetBrains Mono', ui-monospace, monospace";

const C = {
  teal: '#2a7d8a', teal7: '#1d5b66', teal3: '#79b0ba', tealLt: '#cfe6ea',
  ink: '#08141a', dim: '#9fc2c9', steel: '#687a82', steelLt: '#aebfc6',
  pale: '#cfdbe0', white: '#e8f2f4', slate: '#3a5560',
  copper: '#c0772f', copper7: '#95591f', copper1: '#f1ddc8',
  success: '#2f8f5b', warn: '#b8881f', danger: '#bf4a30', ember: '#f0a02f',
  // the department itself
  board: '#16303a', boardLine: '#0c1f27', worktop: '#2f4148', worktopLt: '#54737d',
  chrome: '#9fb3ba', linen: '#dbe4e2', card: '#f2efe6', trace: '#5fe0a0',
  curtain: '#2b6f7a', blood: '#a8394a', rubber: '#2b3236'
};

// pH-paper colours across the scale, so a strip in one banner agrees with a strip in
// another and with the .ph-scale gradient in css/style.css.
const PH_PAPER = { acid: '#c0392b', weak: '#d98a23', neutral: '#4a9d4a', base: '#3a4fa0' };

// Three backgrounds, because this unit happens in three places.
const BENCH_BG  = ['#0b1e25', '#153039'];   // the poison-control bench
const BAY_BG    = ['#0c1a22', '#1c3540'];   // the resus bay next door
const COPPER_BG = ['#1c1208', '#2e2113'];   // Honors

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
    // Standing glass or plastic: shadow / highlight / body / shadow across x.
    glass(n, [sh, base, hi]) { return k.lin(n, [[0, sh], [.22, hi], [.52, base], [1, sh]], true); },
    // Sphere or bead lit from the upper left.
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

// Console readout box: dark screen, cool stroke, a light catch along the top lip.
const panelBox = (x, y, w, h, { r = 6, fill = C.ink, stroke = C.slate, sw = 1.6 } = {}) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`
  + `<path d="M${x + r} ${y + 1.4} H${x + w - r}" stroke="${C.tealLt}" stroke-width="1" opacity=".14"/>`;

// Flow arrow: solid where something moves, dashed where a claim is passed on.
const flow = (x1, x2, y, { color = C.teal3, w = 2, dash, op = .9 } = {}) =>
  `<g opacity="${op}"><path d="M${x1} ${y} H${x2 - 8}" fill="none" stroke="${color}" stroke-width="${w}"`
  + ` stroke-linecap="round"${dash ? ` stroke-dasharray="${dash}"` : ''}/>`
  + `<path d="M${x2} ${y} l-9 -5 v10 z" fill="${color}"/></g>`;

// ---- the lit gap of curtain: this call reaches the patient ----
// Drawn at the right edge of a bench scene, so the bay is present without taking the frame.
// The trace is the only place monitor green appears outside a full bay scene.
const bayGap = (k, top) => {
  const g = k.lin('gap', [[0, '#0a1a21'], [.22, '#26616c'], [1, '#57a9b4']], true);
  return `<g>`
    + `<rect x="320" y="0" width="80" height="${top}" fill="${g}" opacity=".92"/>`
    + `<g stroke="#0d252c" stroke-width="1.3" opacity=".45">`
    + [334, 350, 366, 382].map(x => `<path d="M${x} 0 V${top}"/>`).join('') + `</g>`
    + `<path d="M324 44 h12 l4 -13 l6 25 l4 -12 h44" fill="none" stroke="${C.trace}"`
    + ` stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" opacity=".9"/>`
    + `<path d="M320 0 V${top}" stroke="${C.chrome}" stroke-width="1.5" opacity=".55"/>`
    + `</g>`;
};

// ---- signature 1: the poison-control bench ----
// Pegboard back wall, worktop slab with a front lip, one lamp wash from the upper left.
// The pegboard is drawn as dotted rules rather than 260 separate circles: the same read at
// this size, and a tenth of the DOM in a page that keeps all sixteen banners mounted.
const benchTop = (k, top = 94, { bay = false } = {}) => {
  const slab = k.lin('slab', [[0, '#6d8c95'], [.42, C.worktopLt], [1, '#33474f']], true);
  let wall = `<rect width="400" height="${top}" fill="${C.board}"/>`;
  for (let y = 9; y < top - 4; y += 13) {
    wall += `<path d="M6 ${y} H394" stroke="${C.boardLine}" stroke-width="2.4"`
      + ` stroke-linecap="round" stroke-dasharray="1.6 10.4" opacity=".9"/>`;
  }
  wall += `<path d="M0 0 H206 L94 ${top} H0 Z" fill="#ffffff" opacity=".05"/>`;
  return `<g>${wall}${bay ? bayGap(k, top) : ''}`
    + `<rect y="${top}" width="400" height="6" fill="${slab}"/>`
    + `<rect y="${top + 6}" width="400" height="${150 - top - 6}" fill="${C.worktop}"/>`
    + `<path d="M0 ${top} H400" stroke="${C.chrome}" stroke-width="1" opacity=".5"/>`
    + `</g>`;
};

// ---- signature 2: the bay ----
// Curtain on a rail, drawn back to the left; the floor the trolley stands on. This is the
// "you are looking at the consequence" signature, and only two scenes get it outright.
const bayRoom = (k, floor = 98) => {
  const cur = k.lin('cur', [[0, '#1d4a54'], [.35, C.curtain], [1, '#16383f']], true);
  return `<g>`
    + `<rect width="400" height="${floor}" fill="#12262e"/>`
    + `<path d="M0 0 H190 L86 ${floor} H0 Z" fill="#ffffff" opacity=".045"/>`
    // the rail
    + `<rect y="4" width="400" height="4" rx="2" fill="${C.chrome}" opacity=".65"/>`
    // curtain, gathered on the right
    + `<path d="M258 8 h142 v${floor - 8} h-142 q10 -${(floor - 8) / 2} 0 -${floor - 8} z" fill="${cur}"/>`
    + `<g stroke="#0f2b33" stroke-width="1.4" opacity=".45">`
    + [278, 300, 322, 344, 368].map(x => `<path d="M${x} 10 V${floor}"/>`).join('') + `</g>`
    // floor
    + `<rect y="${floor}" width="400" height="${150 - floor}" fill="#26363d"/>`
    + `<path d="M0 ${floor} H400" stroke="${C.chrome}" stroke-width="1" opacity=".35"/>`
    + `</g>`;
};

// The unit's signature object: a reagent bottle with a label patch. `lines` is up to two
// short strings printed on the patch; state 'bad' strikes it red.
const bottle = (x, base, w, h, { k, tint = ['#123c30', '#1f6a52', '#4fae86'], lines = [],
  cap = C.chrome, state, neck = .42, id = 'btl' } = {}) => {
  const body = k ? k.glass(id, tint) : tint[1];
  const bw = w * neck, bx = x - bw / 2, shoulder = base - h * .72;
  const patchH = Math.min(h * .34 + 2, 26), patchY = base - h * .5;
  return `<g>`
    + `<ellipse cx="${x}" cy="${base + 2}" rx="${(w / 2 + 2).toFixed(1)}" ry="3.6" fill="#040c10" opacity=".4"/>`
    + `<path d="M${(x - w / 2).toFixed(1)} ${base} V${(base - h * .62).toFixed(1)}`
    + ` Q${(x - w / 2).toFixed(1)} ${shoulder.toFixed(1)} ${bx.toFixed(1)} ${(shoulder - 5).toFixed(1)}`
    + ` V${(base - h).toFixed(1)} H${(bx + bw).toFixed(1)} V${(shoulder - 5).toFixed(1)}`
    + ` Q${(x + w / 2).toFixed(1)} ${shoulder.toFixed(1)} ${(x + w / 2).toFixed(1)} ${(base - h * .62).toFixed(1)}`
    + ` V${base} Z" fill="${body}" stroke="${C.chrome}" stroke-width="1.4"/>`
    + `<rect x="${(bx - 1.5).toFixed(1)}" y="${(base - h - 5).toFixed(1)}" width="${(bw + 3).toFixed(1)}" height="6" rx="2" fill="${cap}"/>`
    + `<rect x="${(x - w / 2 + 2.5).toFixed(1)}" y="${(base - h * .58).toFixed(1)}" width="2.6" height="${(h * .46).toFixed(1)}" rx="1.3" fill="#ffffff" opacity=".3"/>`
    + (lines.length
      ? `<rect x="${(x - w / 2 + 3).toFixed(1)}" y="${patchY.toFixed(1)}" width="${(w - 6).toFixed(1)}" height="${patchH.toFixed(1)}" rx="2.5" fill="${C.card}" opacity=".95"/>`
        + lines.map((t, i) => mono(x, patchY + 8.5 + i * 11, t, { size: i ? 6.5 : 8, fill: C.slate, w: i ? 500 : 700 })).join('')
      : '')
    + (state === 'bad'
      ? `<g stroke="${C.danger}" stroke-width="2.4" stroke-linecap="round" opacity=".92">`
        + `<path d="M${(x - w / 2 + 4).toFixed(1)} ${patchY.toFixed(1)} l${(w - 8).toFixed(1)} ${patchH.toFixed(1)}"/>`
        + `<path d="M${(x + w / 2 - 4).toFixed(1)} ${patchY.toFixed(1)} l-${(w - 8).toFixed(1)} ${patchH.toFixed(1)}"/></g>`
      : '')
    + `</g>`;
};

// A straight-sided beaker with a pour lip, filled to `level` of its height.
const beaker = (x, base, w, h, { k, level = .55, liquid = '#3f8fa0', id = 'bk', ticks = true } = {}) => {
  const g = k ? k.glass(id, ['#183a42', '#2a5d68', '#7ab0bb']) : '#2a5d68';
  const top = base - h, ly = base - h * level;
  return `<g>`
    + `<ellipse cx="${x}" cy="${base + 2}" rx="${(w / 2 + 2).toFixed(1)}" ry="3.4" fill="#040c10" opacity=".38"/>`
    + `<path d="M${x - w / 2} ${top} V${base - 4} q0 4 5 4 H${x + w / 2 - 5} q5 0 5 -4 V${top}" fill="${g}" stroke="${C.chrome}" stroke-width="1.4"/>`
    + `<path d="M${x - w / 2 + 2} ${ly} H${x + w / 2 - 2} V${base - 5} q0 3 3 3 H${x + w / 2 - 6} q3 0 3 -3 Z" fill="${liquid}" opacity=".78"/>`
    + `<path d="M${x - w / 2 + 2} ${ly} H${x + w / 2 - 2}" stroke="#ffffff" stroke-width="1.2" opacity=".5"/>`
    + (ticks ? `<g stroke="${C.chrome}" stroke-width="1" opacity=".55">`
      + [.3, .5, .7].map(f => `<path d="M${x - w / 2 + 2} ${(base - h * f).toFixed(1)} h6"/>`).join('') + `</g>` : '')
    + `<path d="M${x + w / 2} ${top} l6 -3" stroke="${C.chrome}" stroke-width="1.4" stroke-linecap="round"/>`
    + `<rect x="${x - w / 2 + 3}" y="${top + 4}" width="2.4" height="${(h * .6).toFixed(1)}" rx="1.2" fill="#ffffff" opacity=".26"/>`
    + `</g>`;
};

// A conical flask, for the titration bench.
const flask = (x, base, w, h, { k, level = .45, liquid = '#e4b9d0', id = 'fl' } = {}) => {
  const g = k ? k.glass(id, ['#1b3037', '#2c4f58', '#7aa3ad']) : '#2c4f58';
  const neckW = w * .26, nb = base - h * .58, top = base - h;
  const ly = base - h * .58 * level - 2;
  return `<g>`
    + `<ellipse cx="${x}" cy="${base + 2}" rx="${(w / 2 + 2).toFixed(1)}" ry="3.4" fill="#040c10" opacity=".38"/>`
    + `<path d="M${x - neckW / 2} ${top} V${nb} L${x - w / 2} ${base} H${x + w / 2} L${x + neckW / 2} ${nb} V${top} Z"`
    + ` fill="${g}" stroke="${C.chrome}" stroke-width="1.4"/>`
    + `<path d="M${(x - (w / 2) * ((base - ly) / (base - nb))).toFixed(1)} ${ly.toFixed(1)}`
    + ` L${(x - w / 2 + 2).toFixed(1)} ${base - 2} H${(x + w / 2 - 2).toFixed(1)}`
    + ` L${(x + (w / 2) * ((base - ly) / (base - nb))).toFixed(1)} ${ly.toFixed(1)} Z" fill="${liquid}" opacity=".8"/>`
    + `<rect x="${x - neckW / 2 - 1.5}" y="${top - 3}" width="${neckW + 3}" height="4" rx="1.6" fill="${C.chrome}" opacity=".7"/>`
    + `<path d="M${x - neckW / 2 + 2} ${top + 3} V${nb - 2}" stroke="#ffffff" stroke-width="1.8" opacity=".25"/>`
    + `</g>`;
};

// A burette: a long graduated tube with a stopcock at the bottom.
const burette = (x, top, h, { k, fill = .55, id = 'bu' } = {}) => {
  const g = k ? k.glass(id, ['#1b3037', '#2c4f58', '#86b0b9']) : '#2c4f58';
  const w = 9, ly = top + h * (1 - fill);
  return `<g>`
    + `<rect x="${x - w / 2}" y="${top}" width="${w}" height="${h}" rx="2" fill="${g}" stroke="${C.chrome}" stroke-width="1.3"/>`
    + `<rect x="${x - w / 2 + 1.5}" y="${ly.toFixed(1)}" width="${w - 3}" height="${(top + h - ly - 2).toFixed(1)}" fill="${C.teal3}" opacity=".62"/>`
    + `<g stroke="${C.chrome}" stroke-width=".9" opacity=".6">`
    + Array.from({ length: 7 }, (_, i) => `<path d="M${x - w / 2 + 1} ${(top + 6 + i * (h - 12) / 6).toFixed(1)} h${i % 2 ? 3 : 5}"/>`).join('')
    + `</g>`
    + `<rect x="${x - w / 2 + 1.4}" y="${top + 3}" width="2" height="${(h * .5).toFixed(1)}" rx="1" fill="#ffffff" opacity=".28"/>`
    // stopcock
    + `<rect x="${x - 6}" y="${top + h}" width="12" height="5" rx="2" fill="${C.chrome}"/>`
    + `<path d="M${x + 5} ${top + h + 2.5} h7" stroke="${C.copper}" stroke-width="3" stroke-linecap="round"/>`
    + `<path d="M${x} ${top + h + 5} V${top + h + 9}" stroke="${C.chrome}" stroke-width="2.6"/>`
    + `</g>`;
};

// The phone on the bench: cradle, handset lifted, coiled cord. `lit` rings the handset.
const handset = (x, base, { s = 1, lit = false } = {}) =>
  `<g transform="translate(${x},${base}) scale(${s})">`
  + `<ellipse cx="0" cy="2" rx="26" ry="4" fill="#040c10" opacity=".38"/>`
  + `<rect x="-26" y="-14" width="52" height="16" rx="4" fill="${C.rubber}" stroke="${C.chrome}" stroke-width="1.3"/>`
  + `<g fill="#3b464c">`
  + [0, 1, 2].map(r => [0, 1, 2].map(c => `<rect x="${-20 + c * 9}" y="${-11 + r * 4}" width="6" height="2.6" rx="1"/>`).join('')).join('')
  + `</g>`
  // the coiled cord, up and to the left
  + `<path d="M-24 -12 q-14 -6 -12 -18 q2 -10 -8 -12" fill="none" stroke="${C.chrome}"`
  + ` stroke-width="2" stroke-linecap="round" stroke-dasharray="2.4 3.2" opacity=".8"/>`
  // the handset, lifted and resting on its side
  + `<g transform="translate(6,-34) rotate(-14)">`
  + `<path d="M-22 0 q-5 -7 2 -9 q7 -2 8 5 h24 q1 -7 8 -5 q7 2 2 9 q-3 5 -10 3 h-24 q-7 2 -10 -3 z"`
  + ` fill="#1e2a30" stroke="${C.chrome}" stroke-width="1.3"/>`
  + `<rect x="-8" y="-3" width="16" height="4" rx="2" fill="#2c3a41"/></g>`
  + (lit ? `<circle cx="6" cy="-34" r="24" fill="none" stroke="${C.ember}" stroke-width="1.4" stroke-dasharray="3 4" opacity=".8"/>` : '')
  + `</g>`;

// A sheet of paper on the bench: a clipboard if `board`, with mono lines printed on it.
// `lines` is [text, size, weight, fill] tuples kept short; nothing here goes below y=100.
const sheet = (x, y, w, h, { lines = [], board = false, tilt = 0, rule = true } = {}) => {
  const rows = lines.map((L, i) => mono(x + 8, y + 17 + i * 14, L[0],
    { size: L[1] || 8, fill: L[3] || C.slate, w: L[2] || 500, anchor: 'start' })).join('');
  let ruled = '';
  if (rule) {
    for (let i = 0; i < Math.floor((h - 14) / 14); i++) {
      ruled += `<path d="M${x + 7} ${y + 20 + i * 14} H${x + w - 7}" stroke="#c9c3b4" stroke-width=".8" opacity=".7"/>`;
    }
  }
  return `<g transform="rotate(${tilt} ${x + w / 2} ${y + h / 2})">`
    + (board ? `<rect x="${x - 4}" y="${y - 5}" width="${w + 8}" height="${h + 10}" rx="3" fill="#4a3b2c" stroke="${C.chrome}" stroke-width="1.2"/>`
      + `<rect x="${x + w / 2 - 13}" y="${y - 10}" width="26" height="9" rx="3" fill="${C.chrome}"/>` : '')
    + `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="2" fill="${C.card}" stroke="#b9b2a2" stroke-width="1"/>`
    + ruled + rows
    + `</g>`;
};

// A pH test strip: paper stem, coloured pad at the wet end.
const strip = (x, y, tone, { w = 7, h = 26, rot = 0 } = {}) =>
  `<g transform="rotate(${rot} ${x} ${y})">`
  + `<rect x="${x - w / 2}" y="${y}" width="${w}" height="${h}" rx="1.5" fill="${C.card}" stroke="#b9b2a2" stroke-width=".9"/>`
  + `<rect x="${x - w / 2}" y="${y + h - 9}" width="${w}" height="9" rx="1.5" fill="${tone}"/>`
  + `</g>`;

// A tapered pail: the garage bucket and the decon drum are the same object at two sizes.
const pail = (x, base, wTop, wBot, h, { k, id = 'pl', liquid = '#3f7f8a', level = .5, lid = false, handle = true } = {}) => {
  const g = k ? k.glass(id, ['#1c333a', '#3a5f68', '#7fa4ac']) : '#3a5f68';
  const top = base - h, ly = base - h * level;
  const wAt = yy => wBot + (wTop - wBot) * ((base - yy) / h);
  const half = yy => wAt(yy) / 2;
  return `<g>`
    + `<ellipse cx="${x}" cy="${base + 2}" rx="${(wBot / 2 + 3).toFixed(1)}" ry="3.4" fill="#040c10" opacity=".4"/>`
    + `<path d="M${x - wTop / 2} ${top} L${x - wBot / 2} ${base} H${x + wBot / 2} L${x + wTop / 2} ${top} Z" fill="${g}" stroke="${C.chrome}" stroke-width="1.4"/>`
    + `<path d="M${(x - half(ly)).toFixed(1)} ${ly.toFixed(1)} L${x - wBot / 2 + 1.5} ${base - 2} H${x + wBot / 2 - 1.5} L${(x + half(ly)).toFixed(1)} ${ly.toFixed(1)} Z" fill="${liquid}" opacity=".76"/>`
    + `<path d="M${(x - half(ly)).toFixed(1)} ${ly.toFixed(1)} H${(x + half(ly)).toFixed(1)}" stroke="#ffffff" stroke-width="1.1" opacity=".45"/>`
    + `<ellipse cx="${x}" cy="${top}" rx="${wTop / 2}" ry="${(wTop / 7).toFixed(1)}" fill="none" stroke="${C.chrome}" stroke-width="1.4"/>`
    + (lid ? `<ellipse cx="${x}" cy="${top - 4}" rx="${wTop / 2 + 2}" ry="${(wTop / 6).toFixed(1)}" fill="${C.steel}" stroke="${C.chrome}" stroke-width="1.2"/>` : '')
    + (handle ? `<path d="M${x - wTop / 2 + 2} ${top + 3} q${wTop / 2 - 2} -18 ${wTop - 4} 0" fill="none" stroke="${C.chrome}" stroke-width="1.8"/>` : '')
    + `<path d="M${x - wTop / 2 + 5} ${top + 5} L${x - wBot / 2 + 4} ${base - 4}" stroke="#ffffff" stroke-width="2" opacity=".2"/>`
    + `</g>`;
};

// ---------------------------------------------------------------- the scene frame
function scene(id, { caption, body, theme = 'bench', bg, frame, capColor }) {
  const honors = theme === 'copper';
  const [top, bot] = bg || (honors ? COPPER_BG : theme === 'bay' ? BAY_BG : BENCH_BG);
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

// ---------------------------------------------------------------- the set
export const SCENE_ART = {

  // ================= C.12(A) naming: identity =================

  // The phone off the cradle, a pad with half a formula on it, and the database waiting on
  // a name it has not been given. The scene is deliberately YOUR side of the call: you
  // never see the caller's kitchen, you only ever get what you wrote down.
  'a-caller': scene('a-caller', { caption: 'THE PHONE · A FORMULA, NOT A NAME', body: k => {
    return benchTop(k, 94)
      + handset(66, 92, { s: .92, lit: true })
      + sheet(126, 30, 96, 62, { tilt: -3, lines: [
        ['CALLER 02:14', 6.5, 700, '#8a8272'],
        ['reads: H ? Cl', 9, 700],
        ['name: ______', 8, 500, '#a89a86']
      ] })
      + panelBox(244, 22, 132, 62)
      + mono(256, 38, 'POISON DATABASE', { size: 6.5, fill: C.dim, ls: '.08em', anchor: 'start' })
      + `<rect x="256" y="46" width="108" height="16" rx="3" fill="#0e2630" stroke="${C.slate}" stroke-width="1"/>`
      + mono(262, 58, 'NAME:', { size: 8, fill: C.steelLt, anchor: 'start' })
      + `<path d="M300 50 V58" stroke="${C.ember}" stroke-width="1.6"/>`
      + mono(262, 76, 'no match without one', { size: 6.5, fill: C.warn, anchor: 'start' })
      + flow(228, 240, 52, { dash: '4 5', op: .55 });
  } }),

  // The bathroom shelf, staged on the bench: the box, the roll with two tablets left, and
  // the ingredient line the parent is reading down the phone.
  'a-antacid': scene('a-antacid', { caption: 'THE BATHROOM SHELF · MOST OF A ROLL, GONE', body: k => {
    const box = k.lin('bx', [[0, '#2f6b8f'], [.35, '#5aa3c6'], [1, '#24506b']], true);
    return benchTop(k, 96)
      // the carton, standing
      + `<ellipse cx="92" cy="98" rx="34" ry="4" fill="#040c10" opacity=".38"/>`
      + `<path d="M62 96 V38 L92 28 L122 38 V96 Z" fill="${box}" stroke="${C.chrome}" stroke-width="1.4"/>`
      + `<path d="M62 38 L92 28 L122 38 L92 48 Z" fill="#7cc0dd" opacity=".85"/>`
      + `<rect x="70" y="54" width="44" height="26" rx="3" fill="${C.card}" opacity=".95"/>`
      + mono(92, 64, 'ANTACID', { size: 7.5, fill: C.slate, w: 700, ls: '.06em' })
      + mono(92, 75, 'chewable', { size: 6.5, fill: '#8a8272' })
      // the roll, torn open, two tablets left and three loose on the worktop
      + `<g transform="rotate(-8 176 84)">`
      + `<rect x="160" y="60" width="32" height="34" rx="6" fill="#c9cfd2" stroke="${C.chrome}" stroke-width="1.2"/>`
      + `<path d="M160 70 h32" stroke="#9aa4a8" stroke-width="1" stroke-dasharray="2 3"/>`
      + `<ellipse cx="176" cy="60" rx="16" ry="4.4" fill="${C.linen}" stroke="${C.chrome}" stroke-width="1.1"/></g>`
      + [212, 232, 250].map((x, i) => `<ellipse cx="${x}" cy="${92 - i % 2 * 3}" rx="8" ry="3.2" fill="${C.linen}" stroke="#9aa4a8" stroke-width="1"/>`).join('')
      + handset(300, 96, { s: .62 })
      + panelBox(246, 18, 138, 34)
      + mono(258, 32, 'ACTIVE INGREDIENT', { size: 6.5, fill: C.dim, ls: '.07em', anchor: 'start' })
      + mono(258, 45, 'Mg ( OH ) 2', { size: 11, fill: C.white, w: 700, anchor: 'start' })
      + mono(214, 74, 'HOW MANY?', { size: 6.5, fill: C.warn, ls: '.08em' });
  } }),

  // The transfer sheet on its clipboard, a formula in a paramedic's handwriting, and the
  // NAME line still blank. First of the six that reach the patient, so the bay is showing.
  'a-sheet': scene('a-sheet', { caption: 'THE TRANSFER SHEET · IT FOLLOWS HIM UP', body: k => {
    return benchTop(k, 94, { bay: true })
      + sheet(40, 16, 132, 78, { board: true, tilt: -2, lines: [
        ['TRANSFER  23:41', 6.5, 700, '#8a8272'],
        ['found with: H2SO3', 9, 700],
        ['name: ____________', 8, 500, '#a89a86'],
        ['resident orders off', 6.5, 500, '#8a8272'],
        ['whatever you sign', 6.5, 500, '#8a8272']
      ] })
      // the pen, uncapped, lying across the corner
      + `<g transform="rotate(24 210 78)">`
      + `<rect x="182" y="74" width="56" height="6" rx="3" fill="#22333a" stroke="${C.chrome}" stroke-width="1"/>`
      + `<path d="M238 74 l10 3 l-10 3 z" fill="${C.chrome}"/>`
      + `<rect x="186" y="74" width="10" height="6" rx="2" fill="${C.copper}"/></g>`
      + panelBox(196, 16, 112, 44)
      + mono(206, 30, 'WHAT THE BAG IS', { size: 6.5, fill: C.dim, ls: '.07em', anchor: 'start' })
      + mono(206, 46, '?', { size: 17, fill: C.ember, w: 700, anchor: 'start' })
      + mono(222, 46, 'ous or -ic', { size: 8.5, fill: C.steelLt, anchor: 'start' })
      + flow(178, 192, 40, { dash: '4 5', op: .5 });
  } }),

  // ================= C.12(B) definitions: where the proton goes =================

  // The label says NH3, the water is on the bench, and the response card has two blanks.
  // It deliberately shows the problem rather than filling the answer in: the learner still
  // has to decide which definition fits and which member of the pair is being named.
  'b-ammonia': scene('b-ammonia', { caption: 'THE CLEANING CUPBOARD · NO OH ON THE LABEL', body: k => {
    const ammonia = k.glass('nh3', ['#17322b', '#2d6d56', '#72b58f']);
    return benchTop(k, 96)
      + `<rect x="20" y="17" width="92" height="58" rx="5" fill="#102a26" stroke="${C.teal3}" stroke-width="1.3"/>`
      + `<path d="M28 28 H104 M28 42 H104 M28 56 H104" stroke="#367460" stroke-width="1.2" opacity=".7"/>`
      + mono(66, 13, 'UNDER THE SINK', { size: 6.5, fill: C.dim, ls: '.08em' })
      + `<path d="M29 67 V36 q0 -8 8 -8 h18 v39" fill="none" stroke="${C.chrome}" stroke-width="2" opacity=".7"/>`
      + bottle(88, 96, 44, 58, { k, tint: ['#16352d', '#2d7259', '#78b692'], lines: ['NH3', 'CLEANER'], id: 'am' })
      + `<path d="M111 48 q19 -13 37 -2 q-4 16 -22 16 q-15 -1 -15 -14 z" fill="${ammonia}" opacity=".72"/>`
      + `<circle cx="160" cy="44" r="4" fill="${C.ember}"/><path d="M160 35 V53 M151 44 H169" stroke="${C.copper1}" stroke-width="1.2"/>`
      + flow(169, 206, 48, { color: C.copper1, dash: '3 4', op: .7 })
      + beaker(218, 96, 44, 43, { k, level: .66, liquid: '#4b98a4', id: 'water' })
      + mono(218, 45, 'WATER', { size: 6.5, fill: C.dim, ls: '.08em' })
      + panelBox(266, 19, 112, 60)
      + mono(322, 34, 'WHICH RULE?', { size: 7, fill: C.dim, ls: '.08em' })
      + mono(322, 50, 'NH3 + H2O', { size: 10, fill: C.white, w: 700 })
      + mono(322, 66, 'PAIR:  ?  /  ?', { size: 7.5, fill: C.warn, ls: '.07em' });
  } }),

  // One of the six patient-facing calls: the blood gas, its bicarbonate card and the monitor
  // share a bay. The card names the pair without disclosing which role a generated card asks.
  'b-buffer': scene('b-buffer', { theme: 'bay', caption: 'THE BUFFER NOTE · A PROTON HAS TWO HANDS', body: k => {
    const blood = k.glass('blood', ['#421b25', '#8f3344', '#d66a72']);
    return bayRoom(k, 99)
      + panelBox(18, 18, 102, 47, { fill: '#07161b', stroke: C.teal3 })
      + mono(30, 33, 'ARTERIAL GAS', { size: 6.5, fill: C.dim, anchor: 'start', ls: '.07em' })
      + mono(30, 54, 'pH  7.20', { size: 13, fill: C.warn, w: 700, anchor: 'start' })
      + `<path d="M132 31 h13 l4 -12 l6 24 l4 -10 h56" fill="none" stroke="${C.trace}" stroke-width="1.8" stroke-linejoin="round"/>`
      + `<path d="M132 50 h86" stroke="${C.steel}" stroke-width="1" opacity=".65"/>`
      + `<g transform="translate(70 70)"><rect x="-11" y="-25" width="22" height="42" rx="4" fill="${blood}" stroke="${C.chrome}" stroke-width="1.2"/>`
      + `<rect x="-7" y="-21" width="4" height="23" rx="2" fill="#ffffff" opacity=".27"/><rect x="-13" y="-30" width="26" height="6" rx="2" fill="${C.chrome}"/></g>`
      + panelBox(164, 51, 128, 40, { fill: '#10242c', stroke: C.teal3 })
      + mono(228, 65, 'BUFFER PAIR', { size: 6.5, fill: C.dim, ls: '.08em' })
      + mono(228, 80, 'H2CO3  /  HCO3-', { size: 8.5, fill: C.white, w: 700 })
      + `<circle cx="319" cy="64" r="18" fill="${blood}" stroke="${C.chrome}" stroke-width="1.3"/>`
      + `<path d="M319 48 V80 M303 64 H335" stroke="#f1d1c5" stroke-width="1.3" opacity=".75"/>`
      + mono(319, 92, 'PROTON', { size: 6.5, fill: '#e6a294', ls: '.08em' })
      + flow(302, 348, 64, { color: C.copper1, dash: '3 4', op: .72 });
  } }),

  // ================= C.12(C) strength: the same concentration is not the same call =================

  'c-sink': scene('c-sink', { caption: 'SAME CONCENTRATION · DIFFERENT pH', body: k => {
    return benchTop(k, 96)
      + bottle(72, 96, 46, 60, { k, tint: ['#3c2016', '#8a4726', '#d88946'], lines: ['VINEGAR', 'ACID'], id: 'vin' })
      + bottle(156, 96, 46, 60, { k, tint: ['#2b3415', '#607c28', '#b7c15c'], lines: ['POOL', 'ACID'], id: 'pool' })
      + strip(102, 54, PH_PAPER.weak, { rot: -18 })
      + strip(188, 54, PH_PAPER.acid, { rot: 14 })
      + mono(72, 27, 'KITCHEN', { size: 7, fill: C.dim, ls: '.08em' })
      + mono(156, 27, 'GARAGE', { size: 7, fill: C.dim, ls: '.08em' })
      + `<path d="M212 42 q20 -12 37 2 q-4 13 -22 16 q-15 -1 -15 -18 z" fill="#2d6270" opacity=".65" stroke="${C.tealLt}" stroke-width="1.2"/>`
      + `<path d="M216 52 h28" stroke="#b7e0e5" stroke-width="1.2" opacity=".6"/>`
      + panelBox(266, 20, 110, 59)
      + mono(321, 35, 'SORT THE SHELF', { size: 6.5, fill: C.dim, ls: '.07em' })
      + `<path d="M282 51 h78 M282 65 h78" stroke="${C.steel}" stroke-width="1.2" stroke-dasharray="3 4"/>`
      + mono(321, 57, '?  +  ?', { size: 9.5, fill: C.warn, w: 700 })
      + mono(321, 73, 'WHY THE GAP?', { size: 6.5, fill: C.steelLt, ls: '.06em' });
  } }),

  'c-cart': scene('c-cart', { caption: 'FOUR BASES · CLASSIFY STRENGTH', body: k => {
    const cart = `<g><rect x="30" y="52" width="230" height="37" rx="5" fill="#263c42" stroke="${C.chrome}" stroke-width="1.5"/>`
      + `<path d="M38 62 H252 M38 76 H252" stroke="#4d6870" stroke-width="1.2"/>`
      + `<circle cx="54" cy="94" r="8" fill="#17262b" stroke="${C.chrome}" stroke-width="1.3"/><circle cx="234" cy="94" r="8" fill="#17262b" stroke="${C.chrome}" stroke-width="1.3"/></g>`;
    return benchTop(k, 98)
      + cart
      + bottle(66, 89, 34, 42, { k, tint: ['#17302f', '#27716a', '#68b6a8'], lines: ['NH3'], id: 'ca' })
      + bottle(116, 89, 34, 42, { k, tint: ['#273419', '#6f862b', '#c5c95b'], lines: ['NaOH'], id: 'cb' })
      + bottle(166, 89, 34, 42, { k, tint: ['#1b2f34', '#2b6372', '#73b4c4'], lines: ['KOH'], id: 'cc' })
      + bottle(216, 89, 34, 42, { k, tint: ['#44251b', '#a0552b', '#d99352'], lines: ['?'], id: 'cd' })
      + mono(145, 28, 'CORRIDOR CART', { size: 8, fill: C.dim, ls: '.1em', w: 700 })
      + panelBox(280, 27, 91, 58)
      + mono(325, 42, 'DISSOCIATE', { size: 6.5, fill: C.dim, ls: '.07em' })
      + `<path d="M295 56 h60" stroke="${C.steel}" stroke-width="1.2" stroke-dasharray="3 4"/>`
      + `<path d="M295 70 h60" stroke="${C.steel}" stroke-width="1.2" stroke-dasharray="3 4"/>`
      + mono(325, 64, 'SORT', { size: 8.5, fill: C.warn, w: 700 });
  } }),

  // The packet that changes the patient’s pH has the curtain gap and monitor trace. Four
  // bottle silhouettes stay on the clipboard so the scene asks for a classification, not a
  // pre-filled answer.
  'c-sheet': scene('c-sheet', { caption: 'FOUR ACIDS · COMPARE STRENGTH', body: k => {
    return benchTop(k, 96, { bay: true })
      + sheet(27, 17, 140, 76, { board: true, tilt: -2, lines: [
        ['TRANSFER ROOM LIST', 6.5, 700, '#8a8272'],
        ['HCl     HF', 9, 700],
        ['HNO3    HC2H3O2', 8.5, 700],
        ['SORT: _________', 7, 500, '#a89a86']
      ] })
      + [202, 240, 278, 316].map((x, i) => bottle(x, 96, 28, 37 + (i % 2) * 7, {
        k, tint: i === 1 ? ['#29411a', '#697f2e', '#b4bc5e'] : ['#34301b', '#7c672d', '#c4a34d'],
        lines: ['?'], id: `fs${i}`
      })).join('')
      + mono(259, 39, 'THE ROOM', { size: 7, fill: C.dim, ls: '.1em' })
      + `<path d="M180 58 C196 48 214 47 232 52" fill="none" stroke="${C.warn}" stroke-width="1.5" stroke-dasharray="3 4"/>`
      + mono(191, 72, 'STRENGTH?', { size: 7, fill: C.warn, ls: '.07em', anchor: 'start' });
  } }),

  // ================= C.12(D) neutralization: call the dose, do not improvise it =================

  'd-bucket': scene('d-bucket', { caption: 'ACID + BASE · COMPARE MOLES', body: k => {
    return benchTop(k, 96)
      + pail(106, 97, 86, 106, 61, { k, liquid: '#b04a32', level: .42, id: 'spill' })
      + mono(106, 61, 'ACID', { size: 8, fill: '#f1d1c5', w: 700, ls: '.08em' })
      + `<path d="M72 39 q34 -16 68 -2" fill="none" stroke="${C.chrome}" stroke-width="1.5" opacity=".72"/>`
      + bottle(195, 96, 42, 54, { k, tint: ['#163229', '#2f735a', '#75b98e'], lines: ['BASE', 'SHELF'], id: 'dose' })
      + flow(152, 180, 70, { color: C.copper1, dash: '4 4', op: .68 })
      + panelBox(250, 18, 126, 62)
      + mono(313, 33, 'MOLE RATIO', { size: 6.5, fill: C.dim, ls: '.1em' })
      + mono(313, 50, 'mol H+  =  mol OH-', { size: 8.5, fill: C.white, w: 700 })
      + `<path d="M268 62 H358" stroke="${C.steel}" stroke-width="1.2" stroke-dasharray="3 4"/>`
      + mono(313, 74, 'TARGET:  ?  mol', { size: 7.5, fill: C.warn, ls: '.06em' });
  } }),

  'd-decon': scene('d-decon', { caption: 'NEUTRALIZATION MODEL · USE MOLE RATIOS', body: k => {
    return benchTop(k, 96)
      + pail(126, 98, 108, 132, 68, { k, liquid: '#4b8090', level: .52, id: 'drum', lid: false })
      + `<rect x="81" y="47" width="90" height="23" rx="4" fill="#23424b" stroke="${C.chrome}" stroke-width="1.2"/>`
      + mono(126, 61, 'DECON RINSE', { size: 7.5, fill: C.white, w: 700, ls: '.06em' })
      + strip(192, 58, PH_PAPER.acid, { rot: 10, h: 28 })
      + `<path d="M217 55 C238 36 254 35 273 37" fill="none" stroke="${C.teal3}" stroke-width="1.5" stroke-dasharray="3 4" opacity=".8"/>`
      + panelBox(263, 19, 110, 62)
      + mono(318, 34, 'MEASURED ACID', { size: 6.5, fill: C.dim, ls: '.07em' })
      + mono(318, 52, 'SALT  +  WATER', { size: 8.5, fill: C.white, w: 700 })
      + mono(318, 70, 'BASE NEEDED  ?', { size: 7, fill: C.warn, ls: '.06em' });
  } }),

  // ================= C.12(E) pH: read the ion concentration, then the scale =================

  'e-soda': scene('e-soda', { caption: 'SOFT-DRINK SAMPLE · pH FROM [H+]', body: k => {
    const can = k.lin('can', [[0, '#692525'], [.34, '#b54238'], [.58, '#e57552'], [1, '#6d2728']], true);
    return benchTop(k, 96)
      + `<ellipse cx="83" cy="97" rx="23" ry="3.5" fill="#040c10" opacity=".38"/>`
      + `<rect x="62" y="31" width="42" height="64" rx="8" fill="${can}" stroke="${C.chrome}" stroke-width="1.3"/>`
      + `<ellipse cx="83" cy="31" rx="21" ry="4" fill="#c2c8c8" stroke="${C.chrome}" stroke-width="1"/>`
      + `<path d="M76 31 h15" stroke="#737d80" stroke-width="2.5" stroke-linecap="round"/>`
      + mono(83, 61, 'COLA', { size: 9, fill: C.white, w: 700, ls: '.08em' })
      + strip(135, 50, PH_PAPER.acid, { rot: -16, h: 34 })
      + `<path d="M154 64 C177 48 191 48 211 53" fill="none" stroke="${C.teal3}" stroke-width="1.5" stroke-dasharray="3 4"/>`
      + panelBox(208, 22, 166, 62)
      + mono(291, 37, 'BENCH METER', { size: 6.5, fill: C.dim, ls: '.09em' })
      + mono(291, 56, '[H+] =  ?  M', { size: 11, fill: C.white, w: 700 })
      + mono(291, 73, 'pH  =  ?', { size: 8, fill: C.warn, ls: '.08em' });
  } }),

  'e-bleach': scene('e-bleach', { caption: 'HYDROXIDE SAMPLE · pH FROM [OH-]', body: k => {
    return benchTop(k, 96)
      + pail(102, 97, 84, 106, 57, { k, liquid: '#7398b9', level: .44, id: 'bleach' })
      + bottle(60, 94, 33, 47, { k, tint: ['#183143', '#285b80', '#74a9ce'], lines: ['OH-'], id: 'hydrox' })
      + strip(159, 54, PH_PAPER.base, { rot: 14, h: 31 })
      + flow(175, 219, 60, { color: C.teal3, dash: '3 4', op: .75 })
      + panelBox(222, 21, 151, 63)
      + mono(298, 36, 'WATER RELATIONSHIP', { size: 6.5, fill: C.dim, ls: '.07em' })
      + mono(298, 54, 'pH  +  pOH  =  14', { size: 10, fill: C.white, w: 700 })
      + mono(298, 73, 'OH-  →  pH  ?', { size: 8, fill: C.warn, ls: '.08em' });
  } }),

  // The printed gas has hydrogen-ion concentration rather than a pH. It is one of the calls
  // that reaches the patient, so the complete bay rather than a closed bench owns the frame.
  'e-gas': scene('e-gas', { theme: 'bay', caption: 'NEAR-NEUTRAL SAMPLE · CALCULATE pH', body: k => {
    const blood = k.glass('gasblood', ['#491d28', '#8d3142', '#d66a72']);
    return bayRoom(k, 99)
      + panelBox(22, 19, 107, 55, { fill: '#07161b', stroke: C.teal3 })
      + mono(34, 33, 'BLOOD GAS', { size: 6.5, fill: C.dim, anchor: 'start', ls: '.08em' })
      + mono(34, 52, 'H+ =  ?  M', { size: 10.5, fill: C.white, w: 700, anchor: 'start' })
      + mono(34, 67, 'PRINTED NOW', { size: 6, fill: C.warn, anchor: 'start', ls: '.08em' })
      + `<path d="M146 46 H184" fill="none" stroke="${C.copper1}" stroke-width="1.7" stroke-dasharray="3 4"/>`
      + `<path d="M190 46 l-9 -5 v10 z" fill="${C.copper1}"/>`
      + panelBox(202, 22, 106, 49, { fill: '#10242c', stroke: C.teal3 })
      + mono(255, 38, 'CALCULATE', { size: 6.5, fill: C.dim, ls: '.08em' })
      + mono(255, 57, 'pH =  ?', { size: 12, fill: C.white, w: 700 })
      + `<g transform="translate(348 72)"><rect x="-12" y="-27" width="24" height="43" rx="4" fill="${blood}" stroke="${C.chrome}" stroke-width="1.2"/>`
      + `<rect x="-8" y="-22" width="4" height="24" rx="2" fill="#ffffff" opacity=".25"/><rect x="-14" y="-32" width="28" height="6" rx="2" fill="${C.chrome}"/></g>`
      + `<path d="M318 85 h12 l4 -12 l6 24 l4 -10 h40" fill="none" stroke="${C.trace}" stroke-width="1.7" stroke-linejoin="round"/>`;
  } }),

  // ================= Honors: the curve and the equilibrium =================

  // The Honors graph is decorative here: it names the apparatus and the relation students
  // are about to explore without leaking the endpoint or an indicator choice.
  'h1-titrate': scene('h1-titrate', { theme: 'copper', caption: 'TITRATION · FIND EQUIVALENCE', body: k => {
    return benchTop(k, 96, { bay: true })
      + burette(98, 15, 63, { k, fill: .63, id: 'titrbu' })
      + `<path d="M98 89 C102 91 106 92 110 95" fill="none" stroke="${C.teal3}" stroke-width="1.7" stroke-dasharray="2 3"/>`
      + flask(142, 96, 74, 55, { k, level: .45, liquid: '#d6a4be', id: 'titrfl' })
      + `<circle cx="142" cy="73" r="17" fill="none" stroke="${C.copper1}" stroke-width="1.3" stroke-dasharray="3 4" opacity=".75"/>`
      + panelBox(229, 18, 149, 65, { fill: '#1b120a', stroke: C.copper })
      + mono(304, 33, 'STANDARD BASE', { size: 6.5, fill: '#e0b483', ls: '.08em' })
      + mono(304, 51, 'n H+  =  n OH-', { size: 10, fill: C.white, w: 700 })
      + `<path d="M244 62 H364" stroke="#8a6a3c" stroke-width="1.2" stroke-dasharray="3 4"/>`
      + mono(304, 75, 'EQUIVALENCE  ?', { size: 8, fill: C.copper1, w: 700, ls: '.08em' });
  } }),

  'h2-weak': scene('h2-weak', { theme: 'copper', caption: 'WEAK ACID · USE Ka AND C', body: k => {
    const acid = k.glass('weakacid', ['#4b2417', '#9b4f2d', '#df9b56']);
    return benchTop(k, 96)
      + bottle(82, 96, 49, 61, { k, tint: ['#4a2417', '#994d2b', '#df9b54'], lines: ['5%', 'WEAK ACID'], id: 'weakb' })
      + `<path d="M114 42 q21 -10 39 2 q-4 15 -21 16 q-15 0 -18 -18 z" fill="${acid}" opacity=".7"/>`
      + beaker(192, 96, 51, 48, { k, level: .56, liquid: '#c67b4d', id: 'weaksamp' })
      + [[180, 61], [202, 54], [212, 67], [191, 74], [205, 83]].map(([x, y], i) =>
        `<circle cx="${x}" cy="${y}" r="${i % 2 ? 3.2 : 2.4}" fill="${i % 2 ? C.copper1 : C.white}" opacity=".85"/>`).join('')
      + panelBox(257, 18, 120, 64, { fill: '#1b120a', stroke: C.copper })
      + mono(317, 33, 'WHAT IONIZES', { size: 6.5, fill: '#e0b483', ls: '.08em' })
      + mono(317, 51, 'Ka  +  C', { size: 11, fill: C.white, w: 700 })
      + `<path d="M274 62 H360" stroke="#8a6a3c" stroke-width="1.2" stroke-dasharray="3 4"/>`
      + mono(317, 75, '[H+]  →  pH ?', { size: 7.5, fill: C.copper1, ls: '.06em' });
  } }),

  // ================= Capstone: one unlabelled beaker, then handover =================

  'cap-last': scene('cap-last', { theme: 'bay', caption: 'CAPSTONE · CONNECT THE SKILLS', body: k => {
    const unknown = k.glass('unknown', ['#24343a', '#516d76', '#a7c5cc']);
    return bayRoom(k, 98)
      + `<rect x="20" y="18" width="83" height="35" rx="5" fill="#132c33" stroke="${C.chrome}" stroke-width="1.2"/>`
      + mono(61, 32, 'CAPSTONE', { size: 6.5, fill: C.dim, ls: '.08em' })
      + mono(61, 45, '06:00', { size: 12, fill: C.warn, w: 700 })
      + beaker(159, 96, 66, 57, { k, level: .51, liquid: '#7a9ba2', id: 'lastbeaker' })
      + `<path d="M126 59 q33 -15 66 0 q-8 15 -33 15 q-25 0 -33 -15 z" fill="${unknown}" opacity=".45"/>`
      + mono(159, 72, '?', { size: 20, fill: C.copper1, w: 700 })
      + sheet(230, 19, 132, 62, { board: true, tilt: 2, lines: [
        ['ONE BEAKER', 6.5, 700, '#8a8272'],
        ['NAME  →  STRENGTH', 7.5, 700],
        ['SALT  →  DOSE', 7.5, 700],
        ['CHECK FOUR STEPS', 6.5, 500, '#a89a86']
      ] })
      + `<path d="M194 58 C209 48 218 45 230 47" fill="none" stroke="${C.copper1}" stroke-width="1.5" stroke-dasharray="3 4"/>`
      + `<path d="M328 89 h11 l4 -12 l6 24 l4 -10 h35" fill="none" stroke="${C.trace}" stroke-width="1.6" stroke-linejoin="round" opacity=".85"/>`;
  } })

};

export function sceneArt(id) { return SCENE_ART[id] || ''; }
