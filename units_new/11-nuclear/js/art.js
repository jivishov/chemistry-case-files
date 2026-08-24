// art.js - Unit 11 scene illustrations ("Hot Lab": a nuclear-medicine morning).
// One inline SVG per SCENARIO id (see model.js), rendered into the cockpit's mission
// screen via x-html. The only file in this unit written from scratch for the port.
//
// Built on the same scaffolding as units_new/01-practices-matter/js/art.js,
// units_new/05-the-mole/js/art.js and units_new/04-bonding-geometry/js/art.js, because
// the four share a shell and a set that disagrees with itself reads as four products:
//   • viewBox is 400x150 - the 8:3 the .mission-frame is sized to.
//   • Every gradient/pattern/clip id is prefixed with the scene id. Alpine keeps all
//     station panels in the DOM (x-show, not x-if), so the SVGs coexist and an unprefixed
//     id would bleed from one scene into another. kit() does the prefixing.
//   • Lighting is from the upper left everywhere, so a vial in one banner is shaded like
//     the vial in the next.
//   • Keep the subject above y=100. Below that the caption scrim fades the art out.
//   • Banners are aria-hidden: the scenario's goal text directly below is the
//     authoritative description, so announcing the art too is redundant.
//
// THIRTY-ONE banners, roughly twice any other unit in the tree, so this set leans harder
// on signatures than the others do. There are two, and they answer the same question
// Unit 1's waterColumn()/deskShelf() pair did - which side of the glass are we on:
//
//   hotLab()  the place the work happens. Leaded-glass mullions, light raking in from the
//             upper left, suspended motes, and the stainless bench everything stands on.
//   outside() the place the consequence lands. A wide floor, a skirting, a wall corner,
//             and a colder, greyer ground. Past the lead: the ward, the ring, the roof,
//             the reactor, the corridor, the customer.
//
// On top of those sit the repeated grammars that carry the rotations. The eight C.14(A)
// scenes all read left-to-right as SOURCE -> BARRIERS -> DETECTOR, because that is
// literally what the evidence paragraph describes and because a set of eight that each
// invented its own layout would be eight drawings rather than one bench seen eight times.
// The seven C.14(B) scenes are all nucleus diagrams over a place. The eight C.14(C)
// scenes are all a job with the isotope's decisive property drawn into it.
//
// Palette tracks tokens.css: teal for the lab and its glass, lead grey for shielding,
// ember for activity (warm against a teal ground, and it is the one colour in the set
// that means "this is radioactive"), cyan for a gamma photon, copper for the three Honors
// jobs and the capstone.

const MONO = "'JetBrains Mono', ui-monospace, monospace";

const C = {
  teal: '#2a7d8a', teal7: '#1d5b66', teal3: '#79b0ba', tealLt: '#cfe6ea',
  ink: '#08141a', dim: '#9fc2c9', steel: '#687a82', steelLt: '#aebfc6',
  pale: '#cfdbe0', white: '#e8f2f4', slate: '#3a5560',
  copper: '#c0772f', copper7: '#95591f', copper1: '#f1ddc8',
  success: '#2f8f5b', warn: '#b8881f', danger: '#bf4a30', ember: '#f0a02f',
  // the lab itself
  lead: '#59636d', leadLt: '#8b959e', leadDk: '#333c45',
  bench: '#2f3a42', card: '#f2efe6', acrylic: '#a8cfdc',
  glow: '#ffc45c', photon: '#7fd7e8', beta: '#8fd66a', alpha: '#e8734a',
  flesh: '#d9a884', scrub: '#3f8f9c'
};

// Two grounds, because this unit happens on two sides of a lead wall, plus copper for
// the Honors calls and the capstone.
const LAB_BG    = ['#08202a', '#123039'];   // inside the hot lab
const OUT_BG    = ['#111a20', '#242f37'];   // past the lead
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
    // Sphere, bead or nucleus lit from the upper left.
    orb(n, [hi, base, sh]) { return k.rad(n, [[0, hi], [.55, base], [1, sh]]); },
    // The halo around anything hot. Ember at the centre, gone by the rim.
    hot(n, tint = C.glow) { return k.rad(n, [[0, tint, .55], [.55, tint, .16], [1, tint, 0]], { cx: '50%', cy: '50%', r: '50%' }); }
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

// Deterministic suspended particulate, so a scene redraws identically every frame.
const motes = (seed = 5, n = 22, yMax = 86) => {
  let s = seed, out = '';
  const rnd = () => (s = (s * 1103515245 + 12345) % 2147483648) / 2147483648;
  for (let i = 0; i < n; i++) {
    const x = rnd() * 400, y = 6 + rnd() * (yMax - 6), r = .7 + rnd() * 1.3;
    out += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}" fill="${C.tealLt}" opacity="${r > 1.4 ? .26 : .15}"/>`;
  }
  return out;
};

// ---- SIGNATURE 1: inside the hot lab, looking through leaded glass ----
// Raking light from the upper left, the mullions that frame every view into a hot cell,
// motes in the beam, and the stainless bench everything in this unit stands on.
const hotLab = (benchY = 88) =>
  `<path d="M0 0 H176 L66 ${benchY} H0 Z" fill="${C.tealLt}" opacity=".05"/>`
  + `<g stroke="${C.steelLt}" stroke-width="2" opacity=".11">`
  + `<path d="M112 0 V${benchY}"/><path d="M292 0 V${benchY}"/><path d="M0 24 H400"/></g>`
  + motes()
  + `<rect x="0" y="${benchY}" width="400" height="${150 - benchY}" fill="${C.bench}"/>`
  + `<path d="M0 ${benchY} H400" stroke="${C.steelLt}" stroke-width="1.8" opacity=".5"/>`
  + `<path d="M0 ${benchY + 3.5} H400" stroke="#061015" stroke-width="1.2" opacity=".55"/>`;

// ---- SIGNATURE 2: past the lead - the ward, the ring, the roof, the world ----
// Colder and greyer than the lab, and built out of architecture rather than glassware:
// a wide floor, a skirting line, and one wall corner to say this is a room you walked into.
const outside = (floorY = 94, corner = 318) =>
  `<path d="M0 0 H234 L112 ${floorY} H0 Z" fill="${C.white}" opacity=".045"/>`
  + `<path d="M${corner} 0 V${floorY}" stroke="${C.steelLt}" stroke-width="1" opacity=".12"/>`
  + `<rect x="0" y="${floorY}" width="400" height="${150 - floorY}" fill="#1c242b"/>`
  + `<path d="M0 ${floorY - 5} H400" stroke="${C.steelLt}" stroke-width="1" opacity=".13"/>`
  + `<path d="M0 ${floorY} H400" stroke="${C.steelLt}" stroke-width="1.3" opacity=".34"/>`;

// The radiation trefoil: three 60-degree sectors, the one symbol in the set that means
// exactly one thing.
const trefoil = (cx, cy, r, { color = C.ember, op = .9 } = {}) => {
  const ri = r * .34, seg = a => {
    const s = (a - 30) * Math.PI / 180, e = (a + 30) * Math.PI / 180;
    const P = (rr, t) => `${(rr * Math.cos(t)).toFixed(2)} ${(rr * Math.sin(t)).toFixed(2)}`;
    return `M${P(ri, s)} L${P(r, s)} A${r} ${r} 0 0 1 ${P(r, e)} L${P(ri, e)} A${ri} ${ri} 0 0 0 ${P(ri, s)} Z`;
  };
  return `<g transform="translate(${cx},${cy})" fill="${color}" opacity="${op}">`
    + [90, 210, 330].map(a => `<path d="${seg(a)}"/>`).join('')
    + `<circle r="${(r * .17).toFixed(2)}"/></g>`;
};

// A glass vial with a crimped aluminium cap, liquid at `level` (0..1 of the barrel).
const vial = (x, yTop, w, h, { level = .6, tint = C.glow, k, n = 'v', cap = C.steelLt } = {}) => {
  const g = k ? k.glass(n, ['#1a3b45', '#2f6a76', '#8fc4cf']) : '#2f6a76';
  const bodyTop = yTop + 9, bodyH = h - 9, yL = bodyTop + bodyH * (1 - level);
  return `<g>`
    + `<rect x="${x}" y="${yTop}" width="${w}" height="9" rx="2" fill="${cap}"/>`
    + `<rect x="${x + 2}" y="${yTop + 2}" width="${w - 4}" height="3" rx="1.5" fill="#e6eef1" opacity=".5"/>`
    + `<rect x="${x}" y="${bodyTop}" width="${w}" height="${bodyH}" rx="3" fill="${g}" opacity=".45" stroke="${C.steelLt}" stroke-width="1.4"/>`
    + `<path d="M${x + 1.5} ${yL.toFixed(1)} h${w - 3} V${(bodyTop + bodyH - 2).toFixed(1)} h${-(w - 3)} Z" fill="${tint}" opacity=".6"/>`
    + `<path d="M${x + 1.5} ${yL.toFixed(1)} h${w - 3}" stroke="${tint}" stroke-width="1.4" opacity=".95"/>`
    + `<rect x="${x + 2}" y="${bodyTop + 3}" width="2.6" height="${bodyH - 8}" rx="1.3" fill="#ffffff" opacity=".38"/>`
    + `</g>`;
};

// A lead pig: thick walls, a lid, and the seam that says it is cast rather than pressed.
const leadPot = (x, yTop, w, h, { lid = true, k, n = 'pot' } = {}) => {
  const g = k ? k.glass(n, [C.leadDk, C.lead, C.leadLt]) : C.lead;
  return `<g>`
    + (lid ? `<rect x="${x - 3}" y="${yTop - 7}" width="${w + 6}" height="8" rx="2.5" fill="${g}" stroke="${C.leadDk}" stroke-width="1.2"/>` : '')
    + `<rect x="${x}" y="${yTop}" width="${w}" height="${h}" rx="3" fill="${g}" stroke="${C.leadDk}" stroke-width="1.4"/>`
    + `<path d="M${x + 4} ${yTop + 4} V${yTop + h - 4}" stroke="${C.leadLt}" stroke-width="1.6" opacity=".5"/>`
    + `<path d="M${x + w - 5} ${yTop + 5} V${yTop + h - 4}" stroke="${C.leadDk}" stroke-width="1.6" opacity=".6"/>`
    + `</g>`;
};

// One barrier in the SOURCE -> BARRIERS -> DETECTOR grammar the eight C.14(A) scenes
// share. Real thicknesses, relatively: card is a line, acrylic is a slab, lead is a wall.
const BARRIER = {
  paper:   { w: 3,  fill: C.card,    stroke: '#b9b19c', tag: 'CARD' },
  acrylic: { w: 9,  fill: C.acrylic, stroke: '#7fb0c0', tag: 'ACRYLIC', op: .55 },
  lead:    { w: 15, fill: C.lead,    stroke: C.leadDk,  tag: 'LEAD' },
  air:     { w: 2,  fill: C.teal3,   stroke: C.teal3,   tag: 'AIR', op: .18 }
};
const barrier = (x, kind, { y = 30, h = 52, label = true } = {}) => {
  const b = BARRIER[kind];
  return `<g>`
    + `<rect x="${x}" y="${y}" width="${b.w}" height="${h}" rx="1.5" fill="${b.fill}"`
    + ` opacity="${b.op === undefined ? 1 : b.op}" stroke="${b.stroke}" stroke-width="1"/>`
    + (kind === 'lead' ? `<path d="M${x} ${y + h / 2} h${b.w}" stroke="${C.leadDk}" stroke-width="1" opacity=".7"/>` : '')
    + (label ? mono(x + b.w / 2, y - 5, b.tag, { size: 7, fill: C.steel, ls: '.1em' }) : '')
    + `</g>`;
};

// A particle track. `stop` is the x it dies at; past that it is drawn as a fading ghost so
// the eye reads "it got this far and no further".
const track = (x1, x2, y, { color = C.ember, dash = '4 4', w = 1.8, stop = null, wiggle = 0 } = {}) => {
  const end = stop === null ? x2 : stop;
  const path = wiggle
    ? `M${x1} ${y} q${(end - x1) / 4} ${-wiggle} ${(end - x1) / 2} 0 t${(end - x1) / 2} 0`
    : `M${x1} ${y} H${end}`;
  return `<g><path d="${path}" fill="none" stroke="${color}" stroke-width="${w}"`
    + ` stroke-linecap="round" stroke-dasharray="${dash}"/>`
    + (stop === null
      ? `<path d="M${x2} ${y} l-8 -4.5 v9 z" fill="${color}"/>`
      : `<g opacity=".9"><circle cx="${end}" cy="${y}" r="3.2" fill="${color}" opacity=".85"/>`
        + `<path d="M${end - 5} ${y - 5} l-4 -4 M${end - 5} ${y + 5} l-4 4" stroke="${color}" stroke-width="1.4" stroke-linecap="round"/></g>`)
    + `</g>`;
};

// The survey meter at the far right of the C.14(A) grammar: a box, a dial, a needle set
// by `read` (0..1), and the probe that faces the source.
const meterBox = (x, y, read = .8, { tint = C.ember } = {}) => {
  const a = (-140 + 100 * read) * Math.PI / 180;
  return `<g>`
    + `<rect x="${x}" y="${y}" width="34" height="42" rx="4" fill="#20303a" stroke="${C.steelLt}" stroke-width="1.5"/>`
    + `<path d="M${x + 4} ${y + 1.5} H${x + 30}" stroke="${C.tealLt}" stroke-width="1" opacity=".2"/>`
    + `<circle cx="${x + 17}" cy="${y + 16}" r="11" fill="#0c1a21" stroke="${C.steel}" stroke-width="1.2"/>`
    + `<path d="M${x + 8} ${y + 18} a10 10 0 0 1 18 0" fill="none" stroke="${C.steel}" stroke-width="1" opacity=".7"/>`
    + `<path d="M${x + 17} ${y + 16} l${(9 * Math.cos(a)).toFixed(1)} ${(9 * Math.sin(a)).toFixed(1)}" stroke="${tint}" stroke-width="1.8" stroke-linecap="round"/>`
    + `<rect x="${x + 6}" y="${y + 30}" width="22" height="7" rx="2" fill="#0c1a21" stroke="${C.steel}" stroke-width=".9"/>`
    + `<path d="M${x - 12} ${y + 21} h11" stroke="${C.steelLt}" stroke-width="2" stroke-linecap="round"/>`
    + `<rect x="${x - 22}" y="${y + 13}" width="11" height="16" rx="3" fill="${C.steelLt}"/>`
    + `</g>`;
};

// A nucleus: protons and neutrons packed into a disc, lit from the upper left. `n` is how
// many beads to draw, not the real nucleon count, which would be a grey blob at this size.
const nucleus = (cx, cy, r, { k, id = 'nuc', hue = C.teal3, beads = 9, seed = 3 } = {}) => {
  const g = k ? k.orb(id, ['#e9f6f8', hue, '#12333c']) : hue;
  let s = seed, out = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${g}"/>`;
  const rnd = () => (s = (s * 1103515245 + 12345) % 2147483648) / 2147483648;
  for (let i = 0; i < beads; i++) {
    const t = rnd() * 6.283, rr = rnd() * (r - 2.6);
    out += `<circle cx="${(cx + rr * Math.cos(t)).toFixed(1)}" cy="${(cy + rr * Math.sin(t)).toFixed(1)}"`
      + ` r="1.9" fill="${i % 2 ? '#ffffff' : C.ink}" opacity="${i % 2 ? .32 : .28}"/>`;
  }
  return out + `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#ffffff" stroke-width=".9" opacity=".25"/>`;
};

// A person, drawn as a silhouette because the rail figure and every ward scene need the
// same body at four different sizes. `glow` puts activity inside them.
const person = (x, y, s = 1, { tint = C.scrub, glow = null, head = C.flesh } = {}) =>
  `<g transform="translate(${x},${y}) scale(${s})">`
  + `<path d="M-13 0 v-20 a13 13 0 0 1 26 0 v20 z" fill="${tint}"/>`
  + `<circle cx="0" cy="-27" r="9" fill="${head}"/>`
  + (glow ? `<circle cx="0" cy="-9" r="6" fill="${glow}" opacity=".75"/>` : '')
  + `<path d="M-13 -12 h26" stroke="#000000" stroke-width="1" opacity=".12"/>`
  + `</g>`;

// A small exponential decay curve, with the elapsed point marked. `frac` is what is left.
const decayCurve = (x, y, w, h, { frac = .5, tint = C.ember, grid = true } = {}) => {
  const pts = [];
  for (let i = 0; i <= 24; i++) {
    const t = i / 24;
    pts.push(`${(x + w * t).toFixed(1)} ${(y + h - h * Math.pow(.5, t * 3.2)).toFixed(1)}`);
  }
  const tx = x + w * (Math.log2(1 / Math.max(.06, frac)) / 3.2);
  const ty = y + h - h * frac;
  return `<g>`
    + (grid ? `<g stroke="${C.steel}" stroke-width=".7" opacity=".35">`
      + `<path d="M${x} ${y} V${y + h} H${x + w}"/>`
      + `<path d="M${x} ${y + h / 2} H${x + w}" stroke-dasharray="2 4"/></g>` : '')
    + `<path d="M${pts.join(' L')}" fill="none" stroke="${tint}" stroke-width="2" stroke-linecap="round"/>`
    + `<path d="M${tx.toFixed(1)} ${y + h} V${ty.toFixed(1)}" stroke="${C.tealLt}" stroke-width="1" stroke-dasharray="2 3" opacity=".8"/>`
    + `<circle cx="${tx.toFixed(1)}" cy="${ty.toFixed(1)}" r="3" fill="${C.white}" stroke="${tint}" stroke-width="1.8"/>`
    + `</g>`;
};

// A gamma camera head or a PET ring gantry, depending on `ring`.
const gantry = (cx, cy, s = 1, { ring = false } = {}) =>
  `<g transform="translate(${cx},${cy}) scale(${s})">`
  + (ring
    ? `<circle r="34" fill="none" stroke="${C.steelLt}" stroke-width="9" opacity=".9"/>`
      + `<circle r="34" fill="none" stroke="${C.steel}" stroke-width="9" stroke-dasharray="5 4" opacity=".55"/>`
      + `<circle r="26" fill="#0d1a21" opacity=".55"/>`
    : `<rect x="-34" y="-16" width="68" height="24" rx="4" fill="${C.steelLt}"/>`
      + `<rect x="-30" y="8" width="60" height="6" rx="2" fill="${C.steel}"/>`
      + `<rect x="-4" y="-34" width="8" height="20" rx="2" fill="${C.steel}"/>`)
  + `</g>`;

// A ruled card, for a form, a label, a brochure or a QA log.
const card = (x, y, w, h, { lines = 3, tint = C.card } = {}) => {
  let l = '';
  for (let i = 1; i <= lines; i++) {
    const ly = y + (h / (lines + 1)) * i;
    l += `<path d="M${x + 6} ${ly.toFixed(1)} H${x + w - 6}" stroke="${C.steel}" stroke-width=".9" opacity=".5"/>`;
  }
  return `<g><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="2.5" fill="${tint}" stroke="${C.steelLt}" stroke-width="1.2"/>${l}</g>`;
};

// ---------------------------------------------------------------- scaffolding
// scene(id, opts) -> a complete 400x150 banner string.
//   caption  required mono strapline along the bottom
//   body     required k => shapes, drawn between background and scrim
//   theme    'lab' (default, inside the hot lab) | 'out' (past the lead) | 'copper'
//   frame    override the frame stroke (e.g. danger red for a hazard scene)
function scene(id, { caption, body, theme = 'lab', bg, frame, capColor }) {
  const honors = theme === 'copper';
  const [top, bot] = bg || (honors ? COPPER_BG : theme === 'out' ? OUT_BG : LAB_BG);
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

// The shared right-hand half of every C.14(A) scene: the three barriers and the meter.
// `stopAt` is which barrier kills the track ('paper' | 'acrylic' | 'lead' | null for
// nothing stops it), and `extra` is anything the scene adds on top of the track.
const evidenceRig = (stopAt, { read = .8, color = C.ember, wiggle = 0, second = null } = {}) => {
  const X = { paper: 190, acrylic: 244, lead: 302 };
  const stop = stopAt ? X[stopAt] + 2 : null;
  return barrier(X.paper, 'paper') + barrier(X.acrylic, 'acrylic') + barrier(X.lead, 'lead')
    + meterBox(348, 36, read, { tint: color })
    + track(152, 338, 56, { color, stop, wiggle })
    + (second ? second : '');
};

export const SCENE_ART = {

  // ================= C.14(A) name the emission, balance the equation =================
  // Eight sources, one grammar: what it is on the left, what stops it in the middle, what
  // the meter still reads on the right. The scenes differ by SOURCE FORM and by WHERE THE
  // TRACK DIES, which is exactly the pair of facts the bench is asking about.

  // The generator column in its lead pig, straight off the courier. Betas die in acrylic.
  'a-generator': scene('a-generator', { caption: 'GENERATOR COLUMN · STOPPED BY PLASTIC', body: k => {
    const halo = k.hot('h');
    return hotLab()
      + `<circle cx="86" cy="56" r="46" fill="${halo}"/>`
      + leadPot(58, 34, 56, 54, { k, n: 'pig' })
      // the column itself, seen through the open lid: a glass barrel of alumina
      + `<rect x="72" y="20" width="28" height="42" rx="4" fill="${k.glass('col', ['#1a3b45', '#2f6a76', '#8fc4cf'])}" opacity=".55" stroke="${C.steelLt}" stroke-width="1.3"/>`
      + `<rect x="75" y="30" width="22" height="26" rx="2" fill="${C.glow}" opacity=".45"/>`
      + `<g fill="${C.steelLt}" opacity=".7">`
      + `<circle cx="80" cy="36" r="1.6"/><circle cx="88" cy="41" r="1.6"/><circle cx="94" cy="34" r="1.6"/>`
      + `<circle cx="83" cy="48" r="1.6"/><circle cx="92" cy="51" r="1.6"/></g>`
      + trefoil(86, 76, 9, { op: .8 })
      + mono(86, 16, 'Mo-99', { size: 9, fill: C.glow, w: 700, ls: '.08em' })
      + evidenceRig('acrylic', { read: .34, color: C.beta })
      + mono(246, 96, 'beta stops here', { size: 8, fill: C.beta });
  } }),

  // The morning elution. Gamma only: nothing before the lead touches it.
  'a-eluate': scene('a-eluate', { caption: 'MORNING ELUTION · ONLY LEAD TOUCHES IT', body: k => {
    const halo = k.hot('h', C.photon);
    return hotLab()
      + `<circle cx="88" cy="58" r="44" fill="${halo}"/>`
      + leadPot(60, 40, 54, 48, { k, n: 'pig', lid: false })
      + vial(74, 22, 26, 48, { level: .62, tint: C.photon, k, n: 'vl' })
      // the saline line still hanging off the column above
      + `<path d="M87 4 C96 12 78 16 87 22" fill="none" stroke="${C.steelLt}" stroke-width="3" opacity=".55"/>`
      + `<g stroke="${C.photon}" stroke-width="1.3" fill="none" opacity=".8">`
      + `<path d="M104 40 q6 -5 12 0 t12 0"/><path d="M104 50 q6 -5 12 0 t12 0"/></g>`
      + mono(88, 16, 'Tc-99m', { size: 9, fill: C.photon, w: 700, ls: '.08em' })
      + evidenceRig('lead', { read: .52, color: C.photon, wiggle: 7 })
      + mono(302, 96, 'halved by 3 mm Pb', { size: 8, fill: C.photon });
  } }),

  // The therapy capsule: a beta that treats, and a gamma that follows it out of the pot.
  'a-therapy': scene('a-therapy', { caption: 'THERAPY CAPSULE · BETA STOPS, GAMMA FOLLOWS', body: k => {
    const halo = k.hot('h');
    return hotLab()
      + `<circle cx="84" cy="58" r="44" fill="${halo}"/>`
      + leadPot(56, 36, 56, 52, { k, n: 'pig' })
      // the capsule, upright in its foam insert
      + `<g transform="translate(84,58)">`
      + `<rect x="-9" y="-17" width="18" height="34" rx="9" fill="#e8eef0" stroke="${C.steelLt}" stroke-width="1.4"/>`
      + `<path d="M-9 0 a9 9 0 0 1 18 0 v8 a9 9 0 0 1 -18 0 z" fill="${C.ember}" opacity=".78"/>`
      + `<rect x="-6.5" y="-14" width="2.6" height="26" rx="1.3" fill="#ffffff" opacity=".5"/></g>`
      + mono(84, 22, 'I-131', { size: 9, fill: C.glow, w: 700, ls: '.08em' })
      + trefoil(120, 80, 8, { op: .7 })
      // two tracks: the beta dies in acrylic, the gamma that follows needs lead
      + barrier(190, 'paper') + barrier(244, 'acrylic') + barrier(302, 'lead')
      + meterBox(348, 36, .4, { tint: C.ember })
      + track(152, 338, 44, { color: C.beta, stop: 246 })
      + track(152, 338, 72, { color: C.photon, stop: 304, wiggle: 6 })
      + mono(160, 38, 'beta', { size: 8, fill: C.beta, anchor: 'start' })
      + mono(160, 88, 'gamma', { size: 8, fill: C.photon, anchor: 'start' });
  } }),

  // A PET tracer syringe: two 511 keV photons leave the positron annihilation site.
  'a-pet': scene('a-pet', { caption: 'FDG DELIVERY · PAIR PHOTONS REACH THE RING', body: k => {
    const halo = k.hot('h', C.photon);
    return hotLab()
      + '<circle cx="86" cy="55" r="44" fill="' + halo + '"/>'
      + '<rect x="53" y="47" width="54" height="16" rx="5" fill="' + C.steelLt + '" stroke="' + C.steel + '" stroke-width="1.3"/>'
      + '<rect x="39" y="50" width="17" height="10" rx="2" fill="' + C.card + '" stroke="' + C.steelLt + '" stroke-width="1"/>'
      + '<path d="M107 55 H141" stroke="' + C.steelLt + '" stroke-width="3" stroke-linecap="round"/>'
      + '<circle cx="121" cy="55" r="9" fill="' + C.photon + '" opacity=".45"/>'
      + '<path d="M112 55 H72 M130 55 H170" stroke="' + C.photon + '" stroke-width="2" stroke-dasharray="4 4"/>'
      + mono(81, 35, 'F-18 FDG', { size: 9, fill: C.photon, w: 700, ls: '.08em' })
      + evidenceRig('lead', { read: .66, color: C.photon, wiggle: 7, second: track(152, 338, 72, { color: C.photon, stop: 304, wiggle: -6 }) })
      + mono(212, 38, '511 keV pair', { size: 8, fill: C.photon, anchor: 'start' });
  } }),

  // A cobalt teletherapy source remains outside the patient; gamma must cross the room.
  'a-teletherapy': scene('a-teletherapy', { caption: 'COBALT HEAD · GAMMA NEEDS LEAD', body: k => {
    const halo = k.hot('h', C.photon);
    return hotLab()
      + '<circle cx="82" cy="49" r="42" fill="' + halo + '"/>'
      + '<rect x="47" y="29" width="69" height="42" rx="6" fill="' + C.lead + '" stroke="' + C.leadLt + '" stroke-width="1.5"/>'
      + '<rect x="64" y="38" width="35" height="21" rx="3" fill="' + C.leadDk + '"/>'
      + '<circle cx="82" cy="49" r="7" fill="' + C.photon + '"/>'
      + '<path d="M116 49 L153 34 M116 49 L153 64" stroke="' + C.photon + '" stroke-width="2" stroke-dasharray="4 3"/>'
      + trefoil(47, 76, 7, { op: .7 })
      + mono(82, 19, 'Co-60', { size: 9, fill: C.photon, w: 700, ls: '.08em' })
      + evidenceRig('lead', { read: .72, color: C.photon, wiggle: 4 })
      + mono(302, 96, 'shield the transfer', { size: 8, fill: C.photon });
  } }),

  // The eye applicator puts a short-range beta source directly against a surface lesion.
  'a-eye': scene('a-eye', { caption: 'EYE APPLICATOR · BETA STOPS LOCALLY', body: k => {
    const halo = k.hot('h', C.beta);
    return hotLab()
      + '<circle cx="84" cy="58" r="42" fill="' + halo + '"/>'
      + '<path d="M39 57 q43 -35 87 0 q-43 35 -87 0 Z" fill="' + C.white + '" stroke="' + C.steelLt + '" stroke-width="1.6"/>'
      + '<circle cx="82" cy="57" r="18" fill="' + C.teal7 + '"/><circle cx="82" cy="57" r="8" fill="' + C.ink + '"/>'
      + '<rect x="111" y="44" width="24" height="26" rx="5" fill="' + C.leadLt + '" stroke="' + C.steel + '" stroke-width="1.2"/>'
      + '<circle cx="111" cy="57" r="7" fill="' + C.beta + '" opacity=".9"/>'
      + '<path d="M118 57 H153" stroke="' + C.beta + '" stroke-width="2" stroke-dasharray="3 3"/>'
      + mono(84, 20, 'Sr-90', { size: 9, fill: C.beta, w: 700, ls: '.08em' })
      + evidenceRig('acrylic', { read: .32, color: C.beta })
      + mono(246, 96, 'surface range', { size: 8, fill: C.beta });
  } }),

  // A legacy radium needle is a sealed-source problem and a basement-air problem.
  'a-radium': scene('a-radium', { caption: 'LEGACY NEEDLES · ALPHA STAYS IN THE BOX', body: k => {
    const halo = k.hot('h', C.alpha);
    return hotLab()
      + '<circle cx="86" cy="55" r="45" fill="' + halo + '"/>'
      + '<rect x="40" y="35" width="91" height="48" rx="5" fill="' + C.lead + '" stroke="' + C.leadLt + '" stroke-width="1.5"/>'
      + '<rect x="47" y="42" width="77" height="34" rx="3" fill="' + C.leadDk + '"/>'
      + '<g stroke="' + C.steelLt + '" stroke-width="2"><path d="M56 49 L111 66"/><path d="M56 58 L111 45"/><path d="M61 70 L117 53"/></g>'
      + '<circle cx="87" cy="57" r="8" fill="' + C.alpha + '" opacity=".8"/>'
      + '<path d="M131 57 H153" stroke="' + C.alpha + '" stroke-width="2" stroke-dasharray="3 3"/>'
      + mono(86, 21, 'Ra-226', { size: 9, fill: C.alpha, w: 700, ls: '.08em' })
      + evidenceRig('paper', { read: .14, color: C.alpha })
      + mono(190, 96, 'paper stops alpha', { size: 8, fill: C.alpha });
  } }),

  // The daily sealed button checks the meter before it is trusted near a patient.
  'a-checksource': scene('a-checksource', { caption: 'DAILY CHECK SOURCE · METER QA', body: k => {
    const halo = k.hot('h', C.alpha);
    return hotLab()
      + '<circle cx="83" cy="55" r="43" fill="' + halo + '"/>'
      + '<circle cx="83" cy="57" r="28" fill="' + C.steelLt + '" stroke="' + C.steel + '" stroke-width="2"/>'
      + '<circle cx="83" cy="57" r="19" fill="' + C.leadDk + '" stroke="' + C.white + '" stroke-width="1.4"/>'
      + '<circle cx="83" cy="57" r="8" fill="' + C.alpha + '"/>'
      + '<path d="M111 57 H152" stroke="' + C.alpha + '" stroke-width="2" stroke-dasharray="3 3"/>'
      + card(44, 20, 78, 15, { lines: 1 })
      + mono(83, 30, 'Am-241 · QA', { size: 7.5, fill: C.ink, w: 700 })
      + evidenceRig('paper', { read: .18, color: C.alpha })
      + mono(190, 96, 'sealed button', { size: 8, fill: C.alpha });
  } }),

  // ================= C.14(B) fission, fusion, or neither =================

  'b-supply': scene('b-supply', { caption: 'REACTOR TARGET · HEAVY NUCLEUS SPLITS', body: k => {
    const halo = k.hot('h', C.ember);
    return outside()
      + '<circle cx="92" cy="54" r="48" fill="' + halo + '"/>'
      + nucleus(92, 53, 25, { k, id: 'u', hue: C.copper, beads: 13, seed: 8 })
      + '<path d="M43 53 H65" stroke="' + C.tealLt + '" stroke-width="2" stroke-dasharray="3 3"/>'
      + '<circle cx="68" cy="53" r="3" fill="' + C.tealLt + '"/>'
      + '<path d="M116 46 L151 30 M116 59 L151 75" stroke="' + C.ember + '" stroke-width="2.4"/>'
      + nucleus(161, 25, 12, { k, id: 'f1', hue: C.photon, beads: 5, seed: 2 })
      + nucleus(163, 80, 14, { k, id: 'f2', hue: C.beta, beads: 6, seed: 5 })
      + '<g fill="' + C.tealLt + '"><circle cx="137" cy="47" r="2.4"/><circle cx="145" cy="55" r="2.4"/><circle cx="137" cy="64" r="2.4"/></g>'
      + mono(92, 18, 'U-235 target', { size: 9, fill: C.ember, w: 700 })
      + mono(220, 60, 'fission makes Mo-99', { size: 10, fill: C.white, anchor: 'start' });
  } }),

  'b-sun': scene('b-sun', { caption: 'ROOF ARRAY · THE SUN FUSES LIGHT NUCLEI', body: k => {
    const halo = k.hot('sun', C.ember);
    return outside()
      + '<circle cx="88" cy="47" r="38" fill="' + halo + '"/><circle cx="88" cy="47" r="22" fill="' + C.ember + '"/>'
      + '<g stroke="' + C.glow + '" stroke-width="2" opacity=".85"><path d="M88 12 V3"/><path d="M88 91 v-9"/><path d="M53 47 H43"/><path d="M133 47 h10"/><path d="M63 22 l-7 -7"/><path d="M113 22 l7 -7"/><path d="M63 72 l-7 7"/><path d="M113 72 l7 7"/></g>'
      + '<path d="M184 81 l82 -24 l54 16 l-82 24 Z" fill="' + C.teal7 + '" stroke="' + C.tealLt + '" stroke-width="1.3"/>'
      + '<g stroke="' + C.photon + '" stroke-width=".8" opacity=".7"><path d="M203 75 l54 16"/><path d="M224 69 l54 16"/><path d="M244 63 l54 16"/><path d="M220 70 l-18 18"/><path d="M249 62 l-18 18"/><path d="M278 54 l-18 18"/></g>'
      + '<path d="M139 56 L183 65" stroke="' + C.glow + '" stroke-width="2" stroke-dasharray="4 3"/>'
      + mono(88, 18, 'H + H', { size: 9, fill: C.white, w: 700 })
      + mono(215, 38, 'sunlight, not a reactor', { size: 10, fill: C.white, anchor: 'start' });
  } }),

  'b-vendor': scene('b-vendor', { caption: 'FUSION BROCHURE · LIGHT NUCLEI JOIN', body: k => {
    const halo = k.hot('h', C.copper);
    return outside()
      + '<circle cx="84" cy="53" r="43" fill="' + halo + '"/>'
      + nucleus(61, 53, 15, { k, id: 'd', hue: C.photon, beads: 4, seed: 7 })
      + nucleus(107, 53, 15, { k, id: 't', hue: C.beta, beads: 5, seed: 4 })
      + '<path d="M79 53 H89" stroke="' + C.copper1 + '" stroke-width="2.4"/><path d="M126 53 H155" stroke="' + C.copper + '" stroke-width="2.4"/>'
      + nucleus(170, 53, 22, { k, id: 'he', hue: C.copper, beads: 8, seed: 3 })
      + card(242, 22, 105, 58, { lines: 4, tint: C.copper1 })
      + mono(294, 39, 'COMPACT', { size: 9, fill: C.copper7, w: 700 })
      + mono(294, 53, 'FUSION', { size: 12, fill: C.copper7, w: 700 })
      + mono(294, 68, 'POWER?', { size: 9, fill: C.copper7, w: 700 })
      + mono(84, 18, 'D + T', { size: 9, fill: C.white, w: 700 });
  } }),

  'b-column': scene('b-column', { caption: 'GENERATOR COLUMN · DECAY, NOT ON-DEMAND MAKING', body: k => {
    const halo = k.hot('h');
    return hotLab()
      + '<circle cx="88" cy="54" r="46" fill="' + halo + '"/>'
      + leadPot(55, 34, 65, 54, { k, n: 'column-pot', lid: false })
      + '<rect x="73" y="17" width="29" height="55" rx="4" fill="' + k.glass('column', ['#143039', '#2f6a76', '#9fcfd8']) + '" opacity=".65" stroke="' + C.steelLt + '" stroke-width="1.4"/>'
      + '<circle cx="87" cy="42" r="8" fill="' + C.ember + '" opacity=".75"/>'
      + '<path d="M95 42 H138" stroke="' + C.beta + '" stroke-width="2" stroke-dasharray="3 3"/><circle cx="144" cy="42" r="8" fill="' + C.photon + '" opacity=".82"/>'
      + '<path d="M87 21 V10" stroke="' + C.steelLt + '" stroke-width="3"/><path d="M87 10 C103 16 71 20 87 28" fill="none" stroke="' + C.steelLt + '" stroke-width="2"/>'
      + mono(87, 14, 'Mo-99', { size: 8, fill: C.glow, w: 700 })
      + mono(210, 58, 'beta decay', { size: 11, fill: C.beta, anchor: 'start' });
  } }),

  'b-waste': scene('b-waste', { caption: 'REACTOR WASTE · FISSION FRAGMENTS REMAIN', body: k => {
    const halo = k.hot('h', C.ember);
    return outside()
      + '<circle cx="84" cy="46" r="40" fill="' + halo + '"/>'
      + nucleus(84, 47, 25, { k, id: 'heavy', hue: C.copper, beads: 13, seed: 9 })
      + '<path d="M106 42 L142 27 M108 55 L143 72" stroke="' + C.ember + '" stroke-width="2.3"/>'
      + nucleus(154, 24, 11, { k, id: 'frag-a', hue: C.photon, beads: 5, seed: 2 })
      + nucleus(155, 77, 14, { k, id: 'frag-b', hue: C.beta, beads: 6, seed: 6 })
      + '<g transform="translate(247,36)"><rect width="43" height="49" rx="3" fill="' + C.lead + '" stroke="' + C.leadLt + '" stroke-width="1.4"/><path d="M5 15 H38 M5 31 H38" stroke="' + C.leadDk + '" stroke-width="1.4"/><path d="M11 7 V42 M32 7 V42" stroke="' + C.leadLt + '" stroke-width=".8" opacity=".5"/></g>'
      + '<g transform="translate(305,41)"><rect width="39" height="44" rx="3" fill="' + C.lead + '" stroke="' + C.leadLt + '" stroke-width="1.4"/><path d="M5 14 H34 M5 28 H34" stroke="' + C.leadDk + '" stroke-width="1.4"/></g>'
      + mono(303, 28, 'FRAGMENTS', { size: 9, fill: C.white, w: 700 });
  } }),

  'b-activation': scene('b-activation', { caption: 'NEUTRON BEAM · CAPTURE, NOT FISSION', body: k => {
    const halo = k.hot('h', C.photon);
    return hotLab()
      + '<circle cx="88" cy="54" r="44" fill="' + halo + '"/>'
      + '<rect x="47" y="32" width="74" height="45" rx="5" fill="' + C.lead + '" stroke="' + C.leadLt + '" stroke-width="1.5"/>'
      + '<rect x="61" y="43" width="46" height="22" rx="2" fill="' + C.teal7 + '" stroke="' + C.tealLt + '" stroke-width="1.2"/>'
      + '<circle cx="84" cy="54" r="11" fill="' + C.photon + '" opacity=".75"/>'
      + '<path d="M4 54 H70" stroke="' + C.tealLt + '" stroke-width="2" stroke-dasharray="3 4"/>'
      + '<g fill="' + C.tealLt + '"><circle cx="19" cy="54" r="2.4"/><circle cx="37" cy="54" r="2.4"/><circle cx="55" cy="54" r="2.4"/></g>'
      + '<path d="M98 54 H153" stroke="' + C.photon + '" stroke-width="2" stroke-dasharray="3 3"/>'
      + mono(84, 21, 'Mo + n', { size: 9, fill: C.photon, w: 700 })
      + mono(205, 58, 'one neutron captured', { size: 10, fill: C.white, anchor: 'start' });
  } }),

  'b-decay': scene('b-decay', { caption: 'URANIUM STANDARD · ALPHA DECAY IS NOT FISSION', body: k => {
    const halo = k.hot('h', C.alpha);
    return outside()
      + '<circle cx="82" cy="53" r="43" fill="' + halo + '"/>'
      + nucleus(82, 53, 27, { k, id: 'uranium', hue: C.copper, beads: 14, seed: 10 })
      + '<path d="M111 53 H151" stroke="' + C.alpha + '" stroke-width="2.3" stroke-dasharray="3 3"/>'
      + nucleus(166, 53, 8, { k, id: 'alpha', hue: C.alpha, beads: 4, seed: 4 })
      + '<path d="M173 53 H206" stroke="' + C.steelLt + '" stroke-width="1.2" stroke-dasharray="2 4"/>'
      + nucleus(223, 53, 22, { k, id: 'daughter', hue: C.teal3, beads: 10, seed: 1 })
      + '<rect x="282" y="27" width="57" height="54" rx="4" fill="' + C.lead + '" stroke="' + C.leadLt + '" stroke-width="1.4"/>'
      + '<path d="M290 39 H331 M290 51 H331 M290 63 H331" stroke="' + C.leadDk + '" stroke-width="1.2"/>'
      + mono(82, 18, 'U-238', { size: 9, fill: C.white, w: 700 })
      + mono(300, 94, 'standard vial', { size: 8, fill: C.dim });
  } }),

  // ================= C.14(C) isotope applications =================

  'c-bone': scene('c-bone', { caption: 'BONE SCAN · GAMMA LEAVES THE PATIENT', body: k => {
    return outside()
      + person(84, 88, 1.45, { glow: C.photon })
      + '<g fill="' + C.photon + '" opacity=".8"><circle cx="76" cy="53" r="3"/><circle cx="92" cy="67" r="3"/><circle cx="101" cy="47" r="3"/></g>'
      + gantry(213, 52, 1.05)
      + '<path d="M102 52 L173 45 M104 66 L173 60" stroke="' + C.photon + '" stroke-width="2" stroke-dasharray="4 3"/>'
      + '<path d="M243 38 h38 v37 h-38 Z" fill="' + C.teal7 + '" stroke="' + C.tealLt + '" stroke-width="1.4"/>'
      + '<path d="M250 47 h24 M250 55 h19 M250 63 h24" stroke="' + C.photon + '" stroke-width="1.2" opacity=".75"/>'
      + vial(305, 37, 20, 42, { level: .58, tint: C.photon, k, n: 'tc' })
      + mono(84, 19, 'Tc-99m', { size: 9, fill: C.photon, w: 700 })
      + mono(213, 94, 'camera outside the body', { size: 8, fill: C.white });
  } }),

  'c-pet': scene('c-pet', { caption: 'PET METABOLISM · TWO PHOTONS, ONE RING', body: k => {
    return outside()
      + gantry(121, 54, 1.32, { ring: true })
      + person(121, 85, .94, { glow: C.photon })
      + '<path d="M98 50 L54 29 M144 50 L189 29" stroke="' + C.photon + '" stroke-width="2.2" stroke-dasharray="4 3"/>'
      + '<circle cx="50" cy="27" r="5" fill="' + C.photon + '"/><circle cx="193" cy="27" r="5" fill="' + C.photon + '"/>'
      + '<path d="M231 31 h89 v48 h-89 Z" fill="' + C.teal7 + '" stroke="' + C.steelLt + '" stroke-width="1.3"/>'
      + '<path d="M240 69 C255 47 270 65 282 42 S306 64 313 38" fill="none" stroke="' + C.photon + '" stroke-width="2"/>'
      + mono(121, 19, 'F-18 FDG', { size: 9, fill: C.photon, w: 700 })
      + mono(275, 91, '511 keV coincidence', { size: 8, fill: C.white });
  } }),

  'c-thyroid': scene('c-thyroid', { caption: 'THYROID THERAPY · BETA STOPS IN TISSUE', body: k => {
    return outside()
      + person(93, 89, 1.46, { glow: null })
      + '<path d="M83 45 q10 -11 20 0 q-2 13 -10 16 q-8 -3 -10 -16 Z" fill="' + C.beta + '" opacity=".85"/>'
      + '<path d="M94 53 H149" stroke="' + C.beta + '" stroke-width="2" stroke-dasharray="3 3"/>'
      + '<path d="M94 45 H158" stroke="' + C.photon + '" stroke-width="1.8" stroke-dasharray="3 4"/>'
      + '<rect x="168" y="35" width="57" height="48" rx="5" fill="' + C.lead + '" stroke="' + C.leadLt + '" stroke-width="1.4"/>'
      + vial(186, 43, 20, 30, { level: .62, tint: C.ember, k, n: 'i131' })
      + trefoil(218, 73, 6, { op: .75 })
      + mono(93, 19, 'I-131', { size: 9, fill: C.beta, w: 700 })
      + mono(279, 53, 'targeted uptake', { size: 10, fill: C.white, anchor: 'start' });
  } }),

  'c-sterile': scene('c-sterile', { caption: 'STERILE KITS · GAMMA PASSES THROUGH CARTONS', body: k => {
    return hotLab()
      + '<rect x="39" y="37" width="76" height="43" rx="3" fill="' + C.card + '" stroke="' + C.steelLt + '" stroke-width="1.4"/>'
      + '<path d="M39 52 H115 M64 37 V80 M90 37 V80" stroke="#b9b19c" stroke-width="1.1"/>'
      + '<rect x="123" y="27" width="31" height="61" rx="4" fill="' + C.lead + '" stroke="' + C.leadLt + '" stroke-width="1.4"/>'
      + '<circle cx="138" cy="57" r="9" fill="' + C.photon + '" opacity=".8"/>'
      + '<path d="M154 43 H254 M154 56 H267 M154 69 H254" stroke="' + C.photon + '" stroke-width="2" stroke-dasharray="4 3"/>'
      + '<rect x="266" y="38" width="77" height="42" rx="3" fill="' + C.card + '" stroke="' + C.steelLt + '" stroke-width="1.4"/>'
      + '<path d="M266 52 H343 M292 38 V80 M318 38 V80" stroke="#b9b19c" stroke-width="1.1"/>'
      + mono(138, 20, 'Co-60', { size: 9, fill: C.photon, w: 700 })
      + mono(302, 94, 'sealed kits', { size: 8, fill: C.white });
  } }),

  'c-smoke': scene('c-smoke', { caption: 'SMOKE DETECTOR · ALPHA IONISES A SMALL CHAMBER', body: k => {
    return outside()
      + '<path d="M0 22 H400" stroke="' + C.steelLt + '" stroke-width="2" opacity=".35"/>'
      + '<g transform="translate(90,39)"><ellipse cx="0" cy="0" rx="43" ry="15" fill="' + C.white + '" stroke="' + C.steelLt + '" stroke-width="1.5"/><ellipse cx="0" cy="0" rx="25" ry="8" fill="' + C.leadDk + '"/><circle cx="0" cy="0" r="6" fill="' + C.alpha + '"/></g>'
      + '<path d="M97 39 H142" stroke="' + C.alpha + '" stroke-width="2" stroke-dasharray="2 3"/>'
      + '<g fill="' + C.alpha + '" opacity=".8"><circle cx="115" cy="34" r="2"/><circle cx="125" cy="43" r="2"/><circle cx="135" cy="37" r="2"/></g>'
      + '<path d="M225 80 C232 65 246 68 248 53 C254 64 264 66 263 80 C270 66 282 68 286 52 C294 68 305 69 303 80" fill="none" stroke="' + C.steelLt + '" stroke-width="2" opacity=".55"/>'
      + '<rect x="308" y="39" width="44" height="34" rx="4" fill="' + C.teal7 + '" stroke="' + C.tealLt + '" stroke-width="1.3"/>'
      + '<path d="M317 57 h26" stroke="' + C.alpha + '" stroke-width="2"/>'
      + mono(90, 81, 'Am-241 button', { size: 8, fill: C.white })
      + mono(277, 94, 'smoke interrupts current', { size: 8, fill: C.white });
  } }),

  'c-exit': scene('c-exit', { caption: 'EXIT SIGN · BETA STAYS INSIDE THE GLASS', body: k => {
    return outside()
      + '<rect x="40" y="31" width="160" height="55" rx="5" fill="' + C.white + '" stroke="' + C.steelLt + '" stroke-width="1.6"/>'
      + '<rect x="53" y="42" width="94" height="32" rx="3" fill="' + C.teal7 + '"/>'
      + mono(100, 64, 'EXIT', { size: 21, fill: C.white, w: 700 })
      + '<path d="M156 57 h27 l-8 -8 M183 57 l-8 8" fill="none" stroke="' + C.white + '" stroke-width="3"/>'
      + '<rect x="57" y="36" width="129" height="4" rx="2" fill="' + C.beta + '" opacity=".75"/>'
      + '<path d="M73 38 H171" stroke="' + C.beta + '" stroke-width="1.4" stroke-dasharray="3 3"/>'
      + '<rect x="244" y="31" width="45" height="54" rx="6" fill="' + C.leadLt + '" stroke="' + C.steel + '" stroke-width="1.3"/>'
      + '<rect x="253" y="42" width="27" height="32" rx="13" fill="' + C.beta + '" opacity=".45"/>'
      + mono(266, 23, 'H-3', { size: 9, fill: C.beta, w: 700 })
      + mono(308, 94, 'sealed phosphor tube', { size: 8, fill: C.white });
  } }),

  'c-coffin': scene('c-coffin', { caption: 'COFFIN LID · HALF-LIFE MATCHES THE AGE', body: k => {
    return outside()
      + '<path d="M31 77 l26 -42 h111 l28 42 Z" fill="#826049" stroke="#c29a72" stroke-width="1.5"/>'
      + '<path d="M57 35 l26 42 M97 35 l16 42 M140 35 l-10 42 M168 35 l-23 42" stroke="#5c4334" stroke-width="1.2" opacity=".65"/>'
      + '<rect x="203" y="31" width="74" height="51" rx="4" fill="' + C.card + '" stroke="' + C.steelLt + '" stroke-width="1.3"/>'
      + '<path d="M214 66 H266 M214 54 H260 M214 42 H253" stroke="' + C.steel + '" stroke-width="1"/>'
      + decayCurve(300, 27, 67, 52, { frac: .7, tint: C.copper })
      + mono(113, 25, 'wood sample', { size: 9, fill: C.white, w: 700 })
      + mono(237, 94, 'C-14 clock', { size: 8, fill: C.white })
      + mono(334, 94, '5,730 y', { size: 8, fill: C.copper });
  } }),

  'c-arctic': scene('c-arctic', { caption: 'ARCTIC STATION · HEAT FOR A DECADE', body: k => {
    return outside(90, 292)
      + '<path d="M0 84 q35 -13 69 -3 t76 -3 t82 4 t81 -4 t92 5 V94 H0 Z" fill="#dce8ea" opacity=".85"/>'
      + '<rect x="73" y="43" width="100" height="37" rx="3" fill="' + C.teal7 + '" stroke="' + C.tealLt + '" stroke-width="1.5"/>'
      + '<path d="M87 80 V25 M87 25 h41 M128 25 v18" stroke="' + C.steelLt + '" stroke-width="2"/>'
      + '<g stroke="' + C.photon + '" stroke-width="1.3"><path d="M97 54 h48"/><path d="M97 64 h48"/><path d="M112 47 v26"/><path d="M129 47 v26"/></g>'
      + '<rect x="214" y="38" width="39" height="47" rx="8" fill="' + C.lead + '" stroke="' + C.leadLt + '" stroke-width="1.4"/>'
      + '<rect x="223" y="47" width="21" height="29" rx="10" fill="' + C.ember + '" opacity=".7"/>'
      + '<path d="M253 61 H309" stroke="' + C.ember + '" stroke-width="2" stroke-dasharray="4 3"/>'
      + '<path d="M315 77 v-36 h23 v36" fill="none" stroke="' + C.steelLt + '" stroke-width="2"/>'
      + mono(233, 28, 'Pu-238', { size: 9, fill: C.ember, w: 700 })
      + mono(112, 94, 'weather station', { size: 8, fill: C.white });
  } }),

  // ================= C.14(C) half-life on the clock =================

  'hl-bone': scene('hl-bone', { caption: 'BONE SCAN DRAW · ASSAY THE VIAL NOW', body: k => {
    const halo = k.hot('h', C.photon);
    return hotLab()
      + '<circle cx="89" cy="55" r="43" fill="' + halo + '"/>'
      + leadPot(56, 39, 63, 49, { k, n: 'bone-pot', lid: false })
      + vial(76, 20, 25, 49, { level: .68, tint: C.photon, k, n: 'bone-vial' })
      + '<path d="M101 48 H152" stroke="' + C.photon + '" stroke-width="2" stroke-dasharray="4 3"/>'
      + '<rect x="126" y="43" width="39" height="12" rx="4" fill="' + C.steelLt + '" stroke="' + C.steel + '" stroke-width="1.2"/>'
      + '<path d="M164 49 h29" stroke="' + C.steelLt + '" stroke-width="3"/><rect x="190" y="44" width="12" height="10" rx="2" fill="' + C.card + '"/>'
      + decayCurve(235, 24, 125, 57, { frac: .62, tint: C.photon })
      + mono(89, 16, 'Tc-99m', { size: 9, fill: C.photon, w: 700 })
      + mono(297, 94, 'activity falls while you work', { size: 8, fill: C.white });
  } }),

  'hl-pet': scene('hl-pet', { caption: 'FDG COURIER · 110 MINUTES PER HALF-LIFE', body: k => {
    return outside()
      + '<path d="M38 42 h91 v43 h-91 Z" fill="' + C.card + '" stroke="' + C.steelLt + '" stroke-width="1.4"/>'
      + '<path d="M38 56 h91 M68 42 v43 M99 42 v43" stroke="#b9b19c" stroke-width="1.1"/>'
      + '<rect x="72" y="51" width="23" height="25" rx="3" fill="' + C.lead + '" stroke="' + C.leadLt + '" stroke-width="1.2"/>'
      + vial(77, 54, 13, 18, { level: .55, tint: C.photon, k, n: 'fdg' })
      + '<circle cx="168" cy="52" r="28" fill="' + C.white + '" stroke="' + C.steelLt + '" stroke-width="1.6"/>'
      + '<path d="M168 52 V31 M168 52 L187 65" stroke="' + C.copper + '" stroke-width="2.6" stroke-linecap="round"/>'
      + '<g stroke="' + C.steel + '" stroke-width="1"><path d="M168 25 v5"/><path d="M195 52 h-5"/><path d="M168 79 v-5"/><path d="M141 52 h5"/></g>'
      + decayCurve(230, 24, 133, 57, { frac: .45, tint: C.photon })
      + mono(168, 89, '08:20', { size: 8, fill: C.white, w: 700 })
      + mono(296, 94, 'courier delay changes the vial', { size: 8, fill: C.white });
  } }),

  'hl-capsule': scene('hl-capsule', { caption: 'THERAPY CAPSULE · CALIBRATION TIME MATTERS', body: k => {
    const halo = k.hot('h', C.ember);
    return hotLab()
      + '<circle cx="87" cy="55" r="43" fill="' + halo + '"/>'
      + '<rect x="47" y="31" width="78" height="54" rx="5" fill="' + C.lead + '" stroke="' + C.leadLt + '" stroke-width="1.4"/>'
      + '<rect x="63" y="42" width="46" height="33" rx="5" fill="' + C.leadDk + '"/>'
      + '<rect x="78" y="46" width="16" height="25" rx="8" fill="' + C.card + '" stroke="' + C.steelLt + '" stroke-width="1.1"/>'
      + '<path d="M78 58 a8 8 0 0 1 16 0 v6 a8 8 0 0 1 -16 0 Z" fill="' + C.ember + '" opacity=".72"/>'
      + card(139, 38, 58, 38, { lines: 3 })
      + mono(168, 51, 'ASSAY', { size: 8, fill: C.ink, w: 700 })
      + mono(168, 66, '08:00', { size: 9, fill: C.ink, w: 700 })
      + decayCurve(232, 24, 128, 57, { frac: .82, tint: C.ember })
      + mono(87, 20, 'I-131', { size: 9, fill: C.ember, w: 700 })
      + mono(297, 94, 'longer does not mean constant', { size: 8, fill: C.white });
  } }),

  'hl-shipment': scene('hl-shipment', { caption: 'GENERATOR SHIPMENT · COLUMN ACTIVITY ON ARRIVAL', body: k => {
    return outside()
      + '<rect x="35" y="36" width="96" height="47" rx="4" fill="' + C.card + '" stroke="' + C.steelLt + '" stroke-width="1.4"/>'
      + '<path d="M35 54 H131 M67 36 V83 M99 36 V83" stroke="#b9b19c" stroke-width="1.2"/>'
      + '<rect x="73" y="43" width="24" height="29" rx="3" fill="' + C.lead + '" stroke="' + C.leadLt + '" stroke-width="1.2"/>'
      + '<rect x="79" y="47" width="12" height="19" rx="2" fill="' + C.photon + '" opacity=".5"/>'
      + '<path d="M142 58 H198" stroke="' + C.steelLt + '" stroke-width="2" stroke-dasharray="4 3"/>'
      + '<path d="M192 50 l14 8 l-14 8 Z" fill="' + C.tealLt + '"/>'
      + decayCurve(233, 24, 126, 57, { frac: .58, tint: C.glow })
      + mono(84, 24, 'Mo-99 column', { size: 8, fill: C.ink, w: 700 })
      + mono(296, 94, 'arrival assay', { size: 8, fill: C.white });
  } }),

  // ================= Honors and capstone =================

  'h1-series': scene('h1-series', { caption: 'DECAY SERIES · CONSERVATION FIXES THE WHOLE CHAIN', theme: 'copper', body: k => {
    return hotLab()
      + nucleus(56, 50, 22, { k, id: 'p', hue: C.copper, beads: 11, seed: 3 })
      + '<path d="M78 43 L111 28 M78 57 L111 72" stroke="' + C.copper1 + '" stroke-width="2" stroke-dasharray="3 3"/>'
      + nucleus(124, 25, 12, { k, id: 'd1', hue: C.photon, beads: 5, seed: 5 })
      + nucleus(124, 76, 13, { k, id: 'd2', hue: C.beta, beads: 6, seed: 8 })
      + '<path d="M138 25 H173 M138 76 H173" stroke="' + C.copper1 + '" stroke-width="1.8" stroke-dasharray="3 3"/>'
      + nucleus(189, 25, 10, { k, id: 'd3', hue: C.alpha, beads: 4, seed: 1 })
      + nucleus(189, 76, 10, { k, id: 'd4', hue: C.teal3, beads: 4, seed: 9 })
      + '<path d="M204 51 H251" stroke="' + C.copper + '" stroke-width="2" stroke-dasharray="4 3"/>'
      + nucleus(270, 51, 23, { k, id: 'stable', hue: C.copper, beads: 10, seed: 6 })
      + '<path d="M260 51 h20" stroke="' + C.white + '" stroke-width="1.2" opacity=".4"/>'
      + mono(56, 20, 'parent', { size: 8, fill: C.copper1, w: 700 })
      + mono(270, 20, 'stable daughter', { size: 8, fill: C.copper1, w: 700 });
  } }),

  'h2-binding': scene('h2-binding', { caption: 'BINDING CURVE · BOTH PATHS CLIMB TOWARD IRON', theme: 'copper', body: k => {
    const curve = 'M38 79 C70 27 121 18 172 34 S253 76 354 52';
    return outside()
      + '<path d="M33 82 H363 M38 18 V82" fill="none" stroke="' + C.steelLt + '" stroke-width="1.2" opacity=".7"/>'
      + '<path d="' + curve + '" fill="none" stroke="' + C.copper + '" stroke-width="3" stroke-linecap="round"/>'
      + '<circle cx="160" cy="31" r="5" fill="' + C.copper1 + '" stroke="' + C.copper + '" stroke-width="1.8"/>'
      + '<path d="M72 66 L142 36" stroke="' + C.beta + '" stroke-width="2" stroke-dasharray="4 3"/><path d="M319 59 L178 35" stroke="' + C.alpha + '" stroke-width="2" stroke-dasharray="4 3"/>'
      + nucleus(65, 72, 10, { k, id: 'light', hue: C.beta, beads: 4, seed: 2 })
      + nucleus(329, 64, 18, { k, id: 'heavy', hue: C.alpha, beads: 8, seed: 7 })
      + mono(160, 21, 'Fe-56 peak', { size: 9, fill: C.copper1, w: 700 })
      + mono(52, 96, 'FUSION', { size: 8, fill: C.beta, w: 700, anchor: 'start' })
      + mono(335, 96, 'FISSION', { size: 8, fill: C.alpha, w: 700, anchor: 'end' });
  } }),

  'h3-effective': scene('h3-effective', { caption: 'PATIENT RELEASE · TWO CLEARANCE ROUTES ADD', theme: 'copper', body: k => {
    return outside()
      + person(83, 88, 1.45, { glow: C.copper })
      + '<path d="M98 52 C133 36 145 29 173 27" fill="none" stroke="' + C.copper + '" stroke-width="2.2" stroke-dasharray="4 3"/>'
      + '<path d="M98 67 C132 79 145 82 173 81" fill="none" stroke="' + C.photon + '" stroke-width="2.2" stroke-dasharray="4 3"/>'
      + '<circle cx="186" cy="27" r="11" fill="' + C.copper + '" opacity=".8"/><circle cx="186" cy="81" r="11" fill="' + C.photon + '" opacity=".8"/>'
      + '<path d="M199 27 H246 M199 81 H246" stroke="' + C.copper1 + '" stroke-width="1.8" stroke-dasharray="3 3"/>'
      + '<rect x="252" y="31" width="101" height="48" rx="5" fill="' + C.copper1 + '" stroke="' + C.copper + '" stroke-width="1.4"/>'
      + '<path d="M263 67 C277 44 294 65 309 43 S337 61 344 39" fill="none" stroke="' + C.copper7 + '" stroke-width="2"/>'
      + mono(186, 18, 'physical', { size: 8, fill: C.copper1, w: 700 })
      + mono(186, 98, 'biological', { size: 8, fill: C.photon, w: 700 })
      + mono(302, 94, 'effective half-life', { size: 8, fill: C.copper1 });
  } }),

  'cap-lastcase': scene('cap-lastcase', { caption: 'LAST CALL · PRESCRIPTION AGAINST WHAT REMAINS', theme: 'copper', body: k => {
    const halo = k.hot('h', C.copper);
    return hotLab()
      + '<circle cx="83" cy="54" r="43" fill="' + halo + '"/>'
      + leadPot(52, 37, 62, 51, { k, n: 'cap-pot', lid: false })
      + vial(71, 20, 25, 50, { level: .28, tint: C.copper, k, n: 'cap-vial' })
      + '<path d="M108 59 H154" stroke="' + C.copper1 + '" stroke-width="2" stroke-dasharray="4 3"/>'
      + '<rect x="154" y="36" width="83" height="45" rx="4" fill="' + C.card + '" stroke="' + C.steelLt + '" stroke-width="1.3"/>'
      + '<path d="M166 51 H225 M166 63 H213 M166 73 H221" stroke="' + C.steel + '" stroke-width="1"/>'
      + mono(195, 47, 'RX: 25 mCi', { size: 8, fill: C.ink, w: 700 })
      + '<circle cx="296" cy="54" r="31" fill="' + C.white + '" stroke="' + C.steelLt + '" stroke-width="1.6"/>'
      + '<path d="M296 54 V30 M296 54 L315 69" stroke="' + C.copper + '" stroke-width="2.8" stroke-linecap="round"/>'
      + '<path d="M279 31 l-6 -6 M313 31 l6 -6" stroke="' + C.steel + '" stroke-width="1.3"/>'
      + mono(83, 16, 'vial now', { size: 9, fill: C.copper1, w: 700 })
      + mono(296, 94, '14:00 delivery', { size: 8, fill: C.white });
  } })
};

export function sceneArt(id) { return SCENE_ART[id] || ''; }
