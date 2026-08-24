// art.js - Unit 6 scene illustrations ("Second Due": a rural fire-and-rescue rotation).
// One inline SVG per SCENARIO id (see model.js), rendered into the cockpit's mission
// screen via x-html. The only file in this unit written from scratch for the port.
//
// Built on the same scaffolding as units_new/01-practices-matter/js/art.js,
// units_new/05-the-mole/js/art.js and units_new/04-bonding-geometry/js/art.js, because
// the four share a shell and a set that disagrees with itself reads as four products:
//   * viewBox is 400x150 - the 8:3 the .mission-frame is sized to.
//   * Every gradient, pattern and clip id is prefixed with the scene id. Alpine keeps all
//     station panels in the DOM (x-show, not x-if), so the fifteen SVGs coexist in one
//     document and an unprefixed id would bleed from one scene into another. kit() does
//     the prefixing; nothing here hand-writes a raw <defs>.
//   * Lighting is from the upper left everywhere, so a cylinder in one banner is shaded
//     like the cylinder in the next.
//   * Nothing below y=100. scene() paints the caption scrim from y=102 down, so a label
//     at y=110 comes out faded and one at y=116 reads as occluded (porting trap 7).
//   * Banners are aria-hidden: the scenario's goal text directly below is the
//     authoritative description, so announcing the art as well would say it twice.
//
// Two set signatures, which is what HANDOFF-U6.md asks for and what Units 1, 4 and 5 each
// settled on. Where Unit 1 says "in the tank" and "on the desk", and Unit 4 says "under
// the sink" and "on the counter", this one says:
//   * roadside()  - the call itself: night, a road, a treeline, and the engine's red-blue
//                   wash coming in from the left. This is where the reaction is running.
//   * pumpPanel() - the back step of the engine: a steel plate with gauges and discharge
//                   outlets, and the caustic-soda hopper under it. This is where the
//                   gets worked and where the consequence gets booked.
// A scene declares which half of the rotation it is in without spending a caption word on
// it: five of the fifteen are at the panel, the rest are out on the road.
//
// Palette tracks tokens.css: teal for the tools and the fixtures, copper for the two
// Honors jobs, semantic red/amber/green for hazards and outcomes, and fire-service red
// and amber for the apparatus itself.

const MONO = "'JetBrains Mono', ui-monospace, monospace";

const C = {
  teal: '#2a7d8a', teal7: '#1d5b66', teal3: '#79b0ba', tealLt: '#cfe6ea',
  ink: '#08141a', dim: '#9fc2c9', steel: '#687a82', steelLt: '#aebfc6',
  pale: '#cfdbe0', white: '#e8f2f4', slate: '#3a5560',
  copper: '#c0772f', copper7: '#95591f', copper1: '#f1ddc8',
  success: '#2f8f5b', warn: '#b8881f', danger: '#bf4a30', ember: '#f0a02f',
  // the rotation itself
  apparatus: '#a3251c', apparatusLt: '#d1443a', chrome: '#c3ced3',
  road: '#2b3238', roadLt: '#3b444b', stripe: '#d8c98a',
  tree: '#0e1c1e', card: '#f2efe6', soda: '#e6ecec', gasBlue: '#7fc4dd',
  hazGreen: '#3f9a5c', hazYellow: '#d8b03a'
};

// Two backgrounds plus the Honors one, because this unit happens in two places.
const ROAD_BG  = ['#0a1820', '#152a33'];   // out on the call, at night
const PANEL_BG = ['#0d1a1e', '#1e3038'];   // at the back step of the engine
const COPPER_BG = ['#1c1208', '#2e2113'];  // Honors

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
    // A standing cylinder - a bottle, a tank, a pipe seen side on. Shadow / highlight /
    // body / shadow across x, so the light is always on the upper left.
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
const panelBox = (x, y, w, h, { r = 7, fill = C.ink, stroke = C.slate, sw = 1.8 } = {}) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`
  + `<path d="M${x + r} ${y + 1.5} H${x + w - r}" stroke="${C.tealLt}" stroke-width="1" opacity=".14"/>`;

// Flow arrow: solid where something moves, dashed where a claim is passed on.
const flow = (x1, x2, y, { color = C.teal3, w = 2, dash, op = .9 } = {}) =>
  `<g opacity="${op}"><path d="M${x1} ${y} H${x2 - 8}" fill="none" stroke="${color}" stroke-width="${w}"`
  + ` stroke-linecap="round"${dash ? ` stroke-dasharray="${dash}"` : ''}/>`
  + `<path d="M${x2} ${y} l-9 -5 v10 z" fill="${color}"/></g>`;

// ---- signature 1: the roadside ----
// Night sky, a treeline, the road, and the red-blue wash off the engine standing just out
// of frame to the left. Every call on this rotation happens here, so the horizon line and
// the light wash are what make fifteen very different subjects read as one rotation.
const roadside = (horizon = 74, { wash = true, verge = true } = {}) => {
  let trees = '';
  // A treeline built from one deterministic walk, so the horizon is never a flat rule.
  let seed = 7;
  const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
  for (let x = -8; x < 412; x += 11) {
    const h = 9 + rnd() * 16;
    trees += `<path d="M${x} ${horizon} l${(4 + rnd() * 2).toFixed(1)} ${-h.toFixed(1)} l${(4 + rnd() * 2).toFixed(1)} ${h.toFixed(1)} z"/>`;
  }
  return `<g>`
    + `<g fill="${C.tree}" opacity=".92">${trees}</g>`
    + `<path d="M0 ${horizon} H400" stroke="#243840" stroke-width="1" opacity=".6"/>`
    // the road, darker at the bottom so the surface reads as receding
    + `<rect y="${horizon}" width="400" height="${150 - horizon}" fill="${C.road}"/>`
    + `<rect y="${horizon}" width="400" height="7" fill="${C.roadLt}"/>`
    + (verge
      ? `<path d="M0 ${horizon + 6} H400" stroke="#5d6a70" stroke-width="1.2" opacity=".5"/>`
        + `<g stroke="${C.stripe}" stroke-width="2.4" stroke-dasharray="16 14" opacity=".55">`
        + `<path d="M0 ${horizon + 22} H400"/></g>`
      : '')
    + (wash
      // the engine's lightbar, off frame left: red on the near side, blue behind it
      ? `<path d="M0 ${horizon - 26} L96 ${horizon + 4} L0 ${horizon + 22} Z" fill="${C.apparatusLt}" opacity=".16"/>`
        + `<path d="M0 ${horizon - 12} L78 ${horizon + 10} L0 ${horizon + 30} Z" fill="#5aa8e0" opacity=".13"/>`
      : '')
    + `</g>`;
};

// ---- signature 2: the pump panel ----
// The back step of the engine: a steel plate with gauges and discharge outlets, and the
// hopper of caustic soda under it. This is the "you are working the number" signature, and it
// is where the two Honors jobs and the two book-keeping scenes live.
const pumpPanel = (top = 8, { outlets = true } = {}) =>
  `<g>`
  + `<rect y="${top}" width="400" height="${150 - top}" fill="#1a2d34"/>`
  // the diamond-plate deck the panel is bolted to, drawn as a rivet run
  + `<rect y="${top}" width="400" height="6" fill="#26424c"/>`
  + `<g fill="${C.chrome}" opacity=".35">`
  + Array.from({ length: 15 }, (_, i) => `<circle cx="${14 + i * 27}" cy="${top + 3}" r="1.4"/>`).join('')
  + `</g>`
  // one warm wash from the upper left so the plate is not flat
  + `<path d="M0 ${top} H180 L64 150 H0 Z" fill="#ffffff" opacity=".04"/>`
  + (outlets
    // two 2.5 inch discharges down the right edge, caps chained on
    ? `<g>`
      + [[368, 60], [368, 88]].map(([cx, cy]) =>
        `<circle cx="${cx}" cy="${cy}" r="11" fill="#2f4d57" stroke="${C.chrome}" stroke-width="2"/>`
        + `<circle cx="${cx}" cy="${cy}" r="5.5" fill="#0e1c21"/>`
        + `<path d="M${cx - 11} ${cy} a11 11 0 0 1 6 -9.6" fill="none" stroke="#ffffff" stroke-width="1.4" opacity=".3"/>`).join('')
      + `</g>`
    : '')
  + `</g>`;

// A round pump gauge. `frac` 0..1 swings the needle across a 240 degree face; `zone`
// paints the band the needle is sitting in, which is how a scene says "reading high"
// without a caption.
const gauge = (cx, cy, r, { frac = .5, label, zone = C.teal3, face = '#0f1e24' } = {}) => {
  const a = (-210 + frac * 240) * Math.PI / 180;
  const nx = cx + Math.cos(a) * (r - 5), ny = cy + Math.sin(a) * (r - 5);
  let ticks = '';
  for (let i = 0; i <= 8; i++) {
    const t = (-210 + i * 30) * Math.PI / 180;
    ticks += `<path d="M${(cx + Math.cos(t) * (r - 2.5)).toFixed(1)} ${(cy + Math.sin(t) * (r - 2.5)).toFixed(1)}`
      + ` L${(cx + Math.cos(t) * (r - 6)).toFixed(1)} ${(cy + Math.sin(t) * (r - 6)).toFixed(1)}"`
      + ` stroke="${C.steelLt}" stroke-width="1.1" opacity=".7"/>`;
  }
  return `<g>`
    + `<circle cx="${cx}" cy="${cy}" r="${r + 2.5}" fill="#243c45" stroke="${C.chrome}" stroke-width="1.6"/>`
    + `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${face}"/>`
    + `<path d="M${cx - r * .72} ${cy - r * .5} a${r} ${r} 0 0 1 ${r * .5} -${r * .28}" fill="none" stroke="#ffffff" stroke-width="1.4" opacity=".16"/>`
    + ticks
    + `<path d="M${cx} ${cy} L${nx.toFixed(1)} ${ny.toFixed(1)}" stroke="${zone}" stroke-width="2.2" stroke-linecap="round"/>`
    + `<circle cx="${cx}" cy="${cy}" r="2.4" fill="${C.chrome}"/>`
    + (label ? mono(cx, cy + r + 11, label, { size: 6.5, fill: C.dim, ls: '.06em' }) : '')
    + `</g>`;
};

// A traffic cone. The rotation puts these out on every call, so they are the cheapest way
// to say "this is a scene, not a diagram".
const cone = (x, base, h = 20) =>
  `<g>`
  + `<ellipse cx="${x}" cy="${base}" rx="${(h * .42).toFixed(1)}" ry="${(h * .13).toFixed(1)}" fill="#0a1216" opacity=".5"/>`
  + `<path d="M${(x - h * .36).toFixed(1)} ${base} L${x} ${base - h} L${(x + h * .36).toFixed(1)} ${base} Z" fill="#d2622c"/>`
  + `<path d="M${(x - h * .36).toFixed(1)} ${base} L${x} ${base - h} L${x} ${base} Z" fill="#ffffff" opacity=".14"/>`
  + `<path d="M${(x - h * .23).toFixed(1)} ${(base - h * .38).toFixed(1)} H${(x + h * .23).toFixed(1)}" stroke="#f2ece2" stroke-width="${(h * .13).toFixed(1)}"/>`
  + `<rect x="${(x - h * .44).toFixed(1)}" y="${(base - h * .07).toFixed(1)}" width="${(h * .88).toFixed(1)}" height="${(h * .1).toFixed(1)}" rx="1" fill="#a54b1f"/>`
  + `</g>`;

// A DOT placard: the diamond on the side of anything that carries a regulated load.
const placard = (x, y, s, { fill = C.hazGreen, num, cls = '2', tilt = 0 } = {}) =>
  `<g transform="translate(${x} ${y})${tilt ? ` rotate(${tilt})` : ''}">`
  + `<path d="M0 ${-s} L${s} 0 L0 ${s} L${-s} 0 Z" fill="${fill}" stroke="#0d1418" stroke-width="1.4"/>`
  + `<path d="M0 ${-s} L${s} 0 L0 0 Z" fill="#ffffff" opacity=".16"/>`
  + (num ? mono(0, s * .12, num, { size: s * .5, boxed: true, fill: '#0d1418', w: 700 }) : '')
  + mono(0, s * .72, cls, { size: s * .34, boxed: true, fill: '#0d1418', w: 700 })
  + `</g>`;

// A horizontal tank, side on: the bobtail's barrel, the tanker's barrel, the depot's
// receiver. `tilt` rolls it onto its side, which is the whole story in three of the
// scenes, and the caller positions it.
const barrel = (x, y, w, h, { k, id = 'brl', tint = ['#39525c', '#6b8b96', '#b7ccd3'], band = true } = {}) => {
  const g = k ? k.glass(id, tint) : tint[1];
  const r = h / 2;
  return `<g>`
    + `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${g}" stroke="${C.steelLt}" stroke-width="1.6"/>`
    + `<ellipse cx="${x + r * .82}" cy="${y + r}" rx="${(r * .5).toFixed(1)}" ry="${(r * .92).toFixed(1)}" fill="#0d1a1f" opacity=".3"/>`
    + `<path d="M${x + 8} ${y + 4} H${x + w - 10}" stroke="#ffffff" stroke-width="2" opacity=".22"/>`
    + (band
      ? `<g stroke="${C.steelLt}" stroke-width="1.2" opacity=".55">`
        + `<path d="M${x + w * .34} ${y + 2} V${y + h - 2}"/><path d="M${x + w * .67} ${y + 2} V${y + h - 2}"/></g>`
      : '')
    + `</g>`;
};

// A gas cylinder standing on its foot ring: the chlorine cylinder, the depot bottle.
const cylinder = (x, base, w, h, { k, id = 'cyl', tint = ['#2b4a3a', '#4e7f60', '#93c3a4'], valve = true } = {}) => {
  const g = k ? k.glass(id, tint) : tint[1];
  const shoulder = base - h * .84;
  return `<g>`
    + `<ellipse cx="${x}" cy="${base + 2}" rx="${(w / 2 + 2).toFixed(1)}" ry="3.5" fill="#050d11" opacity=".45"/>`
    + `<path d="M${(x - w / 2).toFixed(1)} ${base} V${shoulder.toFixed(1)}`
    + ` Q${(x - w / 2).toFixed(1)} ${(shoulder - w * .34).toFixed(1)} ${x} ${(shoulder - w * .38).toFixed(1)}`
    + ` Q${(x + w / 2).toFixed(1)} ${(shoulder - w * .34).toFixed(1)} ${(x + w / 2).toFixed(1)} ${shoulder.toFixed(1)}`
    + ` V${base} Z" fill="${g}" stroke="${C.steelLt}" stroke-width="1.5"/>`
    + `<rect x="${(x - w / 2 - 1.5).toFixed(1)}" y="${(base - 5).toFixed(1)}" width="${w + 3}" height="6" rx="2" fill="${C.steel}"/>`
    + `<rect x="${(x - w / 2 + 3).toFixed(1)}" y="${(shoulder - w * .1).toFixed(1)}" width="3" height="${(h * .55).toFixed(1)}" rx="1.5" fill="#ffffff" opacity=".26"/>`
    + (valve
      ? `<rect x="${(x - 4).toFixed(1)}" y="${(shoulder - w * .38 - 8).toFixed(1)}" width="8" height="9" rx="2" fill="${C.chrome}"/>`
        + `<path d="M${(x - 7).toFixed(1)} ${(shoulder - w * .38 - 8).toFixed(1)} h14" stroke="${C.chrome}" stroke-width="2.4" stroke-linecap="round"/>`
      : '')
    + `</g>`;
};

// A 5 kg bag of caustic soda, the unit's reagent. `state` 'spent' greys it out, which is how
// the two book-keeping scenes show what a call cost.
const bag = (x, base, w = 20, h = 24, { state, label } = {}) => {
  const fill = state === 'spent' ? '#4d5257' : C.soda;
  const edge = state === 'spent' ? '#6b7276' : '#a9b8b8';
  return `<g>`
    + `<path d="M${x - w / 2} ${base} V${base - h + 4} q0 -4 ${(w * .22).toFixed(1)} -4 h${(w * .56).toFixed(1)} q${(w * .22).toFixed(1)} 0 ${(w * .22).toFixed(1)} 4 V${base} Z"`
    + ` fill="${fill}" stroke="${edge}" stroke-width="1.2"/>`
    + `<path d="M${x - w / 2 + 2} ${base - h + 5} h${w - 4}" stroke="#ffffff" stroke-width="1.6" opacity=".5"/>`
    + (label ? mono(x, base - h * .38, label, { size: 6, fill: '#3c4a4a', w: 700 }) : '')
    + `</g>`;
};

// A flame, upward, lit blue at the base. Used where something is actually burning.
const flame = (x, y, s = 1) =>
  `<g>`
  + `<path d="M${x} ${y} q${-7 * s} ${-8 * s} ${-2 * s} ${-16 * s} q${5 * s} ${5 * s} ${6 * s} ${-2 * s}`
  + ` q${4 * s} ${7 * s} ${1 * s} ${11 * s} q${-2 * s} ${4 * s} ${-5 * s} ${7 * s} Z" fill="${C.ember}" opacity=".92"/>`
  + `<path d="M${x} ${y} q${-4 * s} ${-4 * s} ${-1 * s} ${-8 * s} q${3 * s} ${4 * s} ${4 * s} ${1 * s}`
  + ` q${1 * s} ${4 * s} ${-3 * s} ${7 * s} Z" fill="#ffe7a8" opacity=".85"/>`
  + `</g>`;

// A drifting cloud of gas: a soft blob run, which is what a vapour cloud actually looks
// like at this size. `tone` colours it, `n` sets how far it spreads.
const cloud = (x, y, w, h, { tone = C.gasBlue, op = .3, n = 7, seed = 3 } = {}) => {
  let s = seed;
  const rnd = () => (s = (s * 1103515245 + 12345) % 2147483648) / 2147483648;
  let out = `<g fill="${tone}" opacity="${op}">`;
  for (let i = 0; i < n; i++) {
    out += `<ellipse cx="${(x + rnd() * w).toFixed(1)}" cy="${(y + rnd() * h).toFixed(1)}"`
      + ` rx="${(h * (.4 + rnd() * .6)).toFixed(1)}" ry="${(h * (.3 + rnd() * .4)).toFixed(1)}"/>`;
  }
  return out + `</g>`;
};

// The mole-ratio strip: the one visual idea every C.9 bench shares, drawn as coloured
// blocks in the coefficients' proportion. `rows` is [[label, n, colour], ...]. This is
// what keeps the four skills reading as one unit rather than four unrelated pictures.
const ratioStrip = (x, y, w, rows, { cell = 9, gap = 3, labelW = 30 } = {}) => {
  const max = Math.max(...rows.map(r => r[1]), 1);
  const cw = Math.min(cell, (w - labelW - 6) / max - gap);
  return `<g>` + rows.map(([lab, n, col], i) => {
    const ry = y + i * (cell + 6);
    let blocks = '';
    for (let j = 0; j < n; j++) {
      blocks += `<rect x="${(x + labelW + j * (cw + gap)).toFixed(1)}" y="${ry}" width="${cw.toFixed(1)}" height="${cell}" rx="1.8" fill="${col}"/>`;
    }
    return mono(x + labelW - 5, ry + cell - 1.5, lab, { size: 7, fill: C.dim, anchor: 'end', w: 700 }) + blocks;
  }).join('') + `</g>`;
};

// ---------------------------------------------------------------- scaffolding
// scene(id, opts) -> a complete 400x150 banner string.
//   caption  required mono strapline along the bottom
//   body     required k => shapes, drawn between background and scrim
//   theme    'road' (default, out on the call) | 'panel' (at the back step of the engine)
//            | 'copper' (Honors)
//   frame    override the frame stroke, e.g. danger red for a hazard scene
function scene(id, { caption, body, theme = 'road', bg, frame, capColor }) {
  const honors = theme === 'copper';
  const [top, bot] = bg || (honors ? COPPER_BG : theme === 'panel' ? PANEL_BG : ROAD_BG);
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

  // ================= C.9(A) balance the equation =================

  // The ladder truck's frame rail, scaled orange after nine winters in road salt, and the
  // shop order that gets written off the equation. The rail is drawn in section so the
  // scale has somewhere to be: clean steel under, oxide over.
  'a-ladder': scene('a-ladder', { theme: 'panel',
    caption: 'THE LADDER TRUCK - Fe AND O2, NINE WINTERS ON', body: k => {
    const steel = k.glass('st', ['#2a373d', '#5d6f78', '#9fb4bc']);
    const rust = k.lin('rs', [[0, '#7a3d1c'], [.5, '#b8632c'], [1, '#8a4a20']], true);
    return pumpPanel(6, { outlets: false })
      // the rail, seen end on: web and two flanges
      + `<g>`
      + `<rect x="26" y="30" width="150" height="9" rx="2" fill="${steel}"/>`
      + `<rect x="62" y="39" width="78" height="40" fill="${steel}"/>`
      + `<rect x="26" y="79" width="150" height="9" rx="2" fill="${steel}"/>`
      + `<path d="M30 32 H172" stroke="#ffffff" stroke-width="1.4" opacity=".26"/>`
      + `</g>`
      // the scale, lifting off in sheets along the top flange
      + `<g fill="${rust}" opacity=".95">`
      + [[34, 6], [56, 8], [82, 5], [104, 9], [130, 6], [152, 7]].map(([x, w]) =>
        `<path d="M${x} 30 q${w} -7 ${w * 2} -1 q-${w} 5 -${w * 2} 1 z"/>`).join('')
      + `</g>`
      + `<g fill="${rust}" opacity=".85">`
      + [[40, 5], [70, 7], [110, 6], [146, 5]].map(([x, w]) =>
        `<path d="M${x} 88 q${w} 7 ${w * 2} 1 q-${w} -5 -${w * 2} -1 z"/>`).join('')
      + `</g>`
      + mono(101, 24, 'SCALING OFF IN SHEETS', { size: 6.5, fill: '#d99a63', ls: '.05em' })
      // the shop order the equation is written onto
      + panelBox(212, 18, 172, 74)
      + mono(298, 32, 'SHOP ORDER - STEEL AND PRIMER', { size: 6.5, fill: C.dim, ls: '.05em' })
      + ratioStrip(226, 42, 150, [
        ['Fe', 4, '#8b9aa2'], ['O2', 3, '#5f9fb5'], ['Fe2O3', 2, '#b8632c']
      ])
      + mono(298, 90, 'ATOMS IN = ATOMS OUT', { size: 7, fill: C.teal3, ls: '.08em', w: 700 })
      + flow(182, 208, 55, { dash: '4 5', op: .55 });
  } }),

  // The grill bottle in the yard, fire out, the scorch still on the grass, and the one
  // number the report will actually be read for: the oxygen coefficient.
  'a-grill': scene('a-grill', {
    caption: 'THE BACKYARD BOTTLE - THE FIVE IS THE STORY', body: k => {
    return roadside(80, { verge: false })
      // the scorched ring where it let go
      + `<ellipse cx="96" cy="92" rx="72" ry="12" fill="#241a12" opacity=".8"/>`
      + `<ellipse cx="96" cy="92" rx="52" ry="8" fill="#3a2415" opacity=".7"/>`
      // the bottle itself, upright, valve open, sooted up one side
      + cylinder(96, 90, 40, 54, { k, id: 'gb', tint: ['#4a2018', '#8a3126', '#c2604f'] })
      + `<path d="M78 88 q6 -30 4 -40 q10 8 14 -2 q6 14 2 42 z" fill="#141a1c" opacity=".55"/>`
      + mono(96, 30, 'FIRE OUT. REPORT NOT WRITTEN.', { size: 6.5, fill: C.dim, ls: '.04em' })
      // the report block: the balanced equation as blocks, with the five called out
      + panelBox(186, 16, 198, 78)
      + mono(285, 30, 'INCIDENT REPORT - COMBUSTION', { size: 6.5, fill: C.dim, ls: '.05em' })
      + ratioStrip(198, 38, 176, [
        ['C3H8', 1, '#c2604f'], ['O2', 5, '#5f9fb5'], ['CO2', 3, '#8b9aa2'], ['H2O', 4, '#6fa9bd']
      ], { cell: 8 })
      // the oxygen row is the one anybody uses, so it gets the ring
      + `<rect x="222" y="46" width="66" height="12" rx="4" fill="none" stroke="${C.ember}" stroke-width="1.4"/>`
      + mono(296, 56, 'HOW MUCH AIR IT NEEDED', { size: 6, fill: C.ember, ls: '.04em', anchor: 'start' });
  } }),

  // The co-op depot's ammonia line, and the pre-plan sheet going up on the board. The
  // three-to-one hydrogen ratio is drawn as the pipe's own contents, not as a table.
  'a-depot': scene('a-depot', {
    caption: 'THE DEPOT AMMONIA LINE - PRE-PLAN, BEFORE 2 A.M.', body: k => {
    const tank = k.glass('tk', ['#2d3f4a', '#55707d', '#9ab6c0']);
    return roadside(86, { wash: false })
      // the depot: two horizontal receivers on saddles, silhouetted
      + `<g>`
      + `<rect x="18" y="46" width="120" height="34" rx="17" fill="${tank}" stroke="${C.steelLt}" stroke-width="1.5"/>`
      + `<path d="M30 51 H126" stroke="#ffffff" stroke-width="2" opacity=".2"/>`
      + `<rect x="34" y="80" width="14" height="8" fill="#22343c"/><rect x="108" y="80" width="14" height="8" fill="#22343c"/>`
      + `</g>`
      + placard(126, 34, 13, { fill: C.hazGreen, num: 'NH3', cls: '2.2' })
      // the line off it, running right, with the vent stack
      + `<path d="M138 63 H206" stroke="${C.steelLt}" stroke-width="6" stroke-linecap="round" opacity=".85"/>`
      + `<path d="M138 61 H206" stroke="#ffffff" stroke-width="1.4" opacity=".22"/>`
      + `<path d="M186 63 V34" stroke="${C.steelLt}" stroke-width="5" stroke-linecap="round" opacity=".85"/>`
      + cloud(168, 14, 44, 12, { tone: C.gasBlue, op: .26, n: 6, seed: 11 })
      // the pre-plan sheet: what goes on the board
      + panelBox(220, 16, 164, 80)
      + mono(302, 30, 'PRE-PLAN SHEET', { size: 6.5, fill: C.dim, ls: '.08em' })
      + ratioStrip(232, 40, 142, [
        ['N2', 1, '#5f9fb5'], ['H2', 3, '#d8e6ea'], ['NH3', 2, '#8fbf9f']
      ])
      + mono(302, 88, 'THE H2 FIGURE SETS THE STAGE-BACK', { size: 6, fill: C.warn, ls: '.04em' });
  } }),

  // ================= C.9(B) classify the reaction =================

  // The jump kit open on the tailboard, peroxide foaming white on a forearm. One bottle
  // in, two things out - and the brown glass beside it, which is the same fact.
  'b-jumpkit': scene('b-jumpkit', { theme: 'panel',
    caption: 'THE JUMP KIT - ONE IN, TWO OUT, COLD', body: k => {
    const brown = k.glass('bn', ['#2e1c0c', '#6b4416', '#a97a33']);
    return pumpPanel(6, { outlets: false })
      // the open kit lid across the back
      + `<path d="M10 22 H180 V30 H10 Z" fill="#243c45"/>`
      + `<path d="M10 30 H180 L172 40 H18 Z" fill="#1a2c34"/>`
      // the forearm, and the foam on it
      + `<path d="M14 84 C60 70 108 74 152 66" fill="none" stroke="#c69a72" stroke-width="17" stroke-linecap="round"/>`
      + `<path d="M14 79 C60 65 108 69 152 61" fill="none" stroke="#e0b48c" stroke-width="5" stroke-linecap="round" opacity=".55"/>`
      // the cut, and the white foam standing up off it
      + `<path d="M74 76 l16 -3" stroke="#8a3326" stroke-width="2.4" stroke-linecap="round"/>`
      + `<g fill="#f4f8f8" opacity=".92">`
      + [[66, 70, 5], [74, 64, 6.5], [84, 61, 5.5], [93, 65, 4.5], [79, 72, 4], [88, 71, 3.4], [70, 76, 3]]
        .map(([cx, cy, r]) => `<circle cx="${cx}" cy="${cy}" r="${r}"/>`).join('')
      + `</g>`
      + `<g fill="#ffffff" opacity=".5">`
      + [[72, 52, 2.6], [86, 48, 2], [79, 43, 1.6]].map(([cx, cy, r]) => `<circle cx="${cx}" cy="${cy}" r="${r}"/>`).join('')
      + `</g>`
      + mono(84, 34, 'FOAMS COLD. NO FLAME.', { size: 6.5, fill: C.teal3, ls: '.05em' })
      // the brown bottle, and what came out of it
      + cylinder(210, 92, 30, 46, { k, id: 'pb', tint: ['#2e1c0c', '#6b4416', '#a97a33'], valve: false })
      + `<rect x="199" y="60" width="22" height="13" rx="2" fill="${C.card}" opacity=".92"/>`
      + mono(210, 70, 'H2O2', { size: 7, fill: '#3c4a4a', w: 700 })
      + flow(232, 268, 62, { dash: '3 4', op: .6 })
      + panelBox(272, 30, 112, 58)
      + mono(328, 44, 'ONE BOTTLE IN', { size: 6.5, fill: C.dim, ls: '.05em' })
      + ratioStrip(284, 52, 92, [['H2O', 2, '#6fa9bd'], ['O2', 1, '#8fbf9f']], { cell: 8, labelW: 26 })
      + mono(328, 84, 'TWO THINGS OUT', { size: 6.5, fill: C.success, ls: '.05em', w: 700 })
      // the shelf-life fact, which is the same reaction
      + mono(210, 34, 'BROWN GLASS FOR A REASON', { size: 6, fill: '#c19a5e', ls: '.04em' });
  } }),

  // The darkroom on Third: two clear bottles on a bench and the grey-white crust where
  // they ran together. The crust is the subject, so it is drawn large and lit.
  'b-darkroom': scene('b-darkroom', {
    caption: 'THE DARKROOM ON THIRD - A SOLID OUT OF TWO CLEARS', body: k => {
    const glassA = k.glass('ga', ['#1c2e34', '#38606c', '#8fb9c4']);
    const glassB = k.glass('gb', ['#1c2e34', '#38606c', '#8fb9c4']);
    return `<g>`
      // the room: a safelight wash from the upper left, a bench across the bottom
      + `<rect width="400" height="150" fill="#101a1f"/>`
      + `<path d="M0 0 H188 L84 96 H0 Z" fill="#7a2418" opacity=".2"/>`
      + `<rect y="86" width="400" height="16" fill="#2f2820"/>`
      + `<rect y="86" width="400" height="4" fill="#4a4034"/>`
      + `<g stroke="#1c1812" stroke-width="1" opacity=".6">`
      + [40, 120, 200, 280, 360].map(x => `<path d="M${x} 90 V102"/>`).join('') + `</g>`
      + `</g>`
      // the two bottles, clear, both still half full
      + cylinder(66, 86, 32, 48, { k, id: 'ga2', tint: ['#1c2e34', '#38606c', '#8fb9c4'], valve: false })
      + `<rect x="54" y="56" width="24" height="12" rx="2" fill="${C.card}" opacity=".9"/>`
      + mono(66, 65, 'AgNO3', { size: 6.5, fill: '#3c4a4a', w: 700 })
      + cylinder(122, 86, 32, 48, { k, id: 'gb2', tint: ['#1c2e34', '#38606c', '#8fb9c4'], valve: false })
      + `<rect x="110" y="56" width="24" height="12" rx="2" fill="${C.card}" opacity=".9"/>`
      + mono(122, 65, 'NaCl', { size: 6.5, fill: '#3c4a4a', w: 700 })
      // the run-together, and the crust it left
      + `<path d="M82 86 q12 6 22 0" fill="none" stroke="#4d707a" stroke-width="3" opacity=".7"/>`
      + `<g fill="#d6dedd" opacity=".9">`
      + [[176, 84, 15, 5], [200, 82, 19, 6], [226, 84, 14, 5], [190, 78, 11, 4], [214, 77, 9, 3.4]]
        .map(([cx, cy, rx, ry]) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}"/>`).join('')
      + `</g>`
      + `<g fill="#9aa6a4" opacity=".7">`
      + [[182, 80, 4], [204, 76, 3.2], [222, 79, 3.6], [196, 84, 3]].map(([cx, cy, r]) => `<circle cx="${cx}" cy="${cy}" r="${r}"/>`).join('')
      + `</g>`
      + mono(196, 62, 'GREY-WHITE CRUST', { size: 7, fill: '#cfd6d4', ls: '.06em', w: 700 })
      + mono(196, 48, 'THE SILVER IS IN IT', { size: 6, fill: C.teal3, ls: '.03em' })
      // partners traded, drawn as two crossing arrows
      + panelBox(266, 16, 118, 62)
      + mono(325, 30, 'PARTNERS TRADED', { size: 6.5, fill: C.dim, ls: '.06em' })
      + `<g stroke="${C.teal3}" stroke-width="1.6" fill="none" opacity=".9">`
      + `<path d="M282 44 C302 44 306 62 326 62"/><path d="M282 62 C302 62 306 44 326 44"/></g>`
      + `<circle cx="278" cy="44" r="4" fill="#b9c6cc"/><circle cx="278" cy="62" r="4" fill="#6fa9bd"/>`
      + `<circle cx="330" cy="44" r="4" fill="#6fa9bd"/><circle cx="330" cy="62" r="4" fill="#b9c6cc"/>`
      + mono(325, 74, 'ONE WILL NOT STAY DISSOLVED', { size: 5.5, fill: C.dim });
  } }),

  // The ditch at the county line, from the shoulder: the tanker on its side, the line of
  // reagent already laid, and the heat coming up off it. This is the scene the capstone
  // returns to, so it is drawn as its first act.
  'b-ditch': scene('b-ditch', { frame: C.danger,
    caption: 'THE DITCH AT THE COUNTY LINE - WARM, AND DONE CLIMBING', body: k => {
    return roadside(58, { verge: true })
      // the ditch cut into the near shoulder
      + `<path d="M0 96 C90 76 210 76 400 92 L400 102 H0 Z" fill="#16232a"/>`
      + `<path d="M0 96 C90 76 210 76 400 92" fill="none" stroke="#42535b" stroke-width="1.4" opacity=".7"/>`
      // the neutralised liquid in it, and the heat shimmer off the surface
      + `<path d="M18 92 C110 78 214 78 372 90 L372 98 C214 88 110 88 18 99 Z" fill="#4a6b62" opacity=".85"/>`
      + `<g stroke="#e8c98a" stroke-width="1.2" fill="none" opacity=".45">`
      + [60, 118, 176, 234, 292].map(x => `<path d="M${x} 82 q4 -7 0 -12 q-4 -6 0 -11"/>`).join('') + `</g>`
      + mono(216, 68, 'WARM THROUGH THE GLOVE', { size: 6.5, fill: '#e8c98a', ls: '.05em', anchor: 'start' })
      // the tanker, over on its side above the ditch
      + barrel(28, 22, 148, 34, { k, id: 'tb', tint: ['#4b2f2b', '#7d4a41', '#c0857a'] })
      + `<path d="M176 30 h22 v18 h-22 z" fill="#2a3a42"/>`
      + placard(96, 39, 12, { fill: C.hazYellow, num: 'HCl', cls: '8', tilt: 12 })
      // the line of caustic soda laid across, which is the intervention
      + `<g fill="${C.soda}" opacity=".9">`
      + Array.from({ length: 16 }, (_, i) => `<ellipse cx="${34 + i * 21}" cy="${86 + Math.sin(i) * 2}" rx="8" ry="3.4"/>`).join('')
      + `</g>`
      + cone(322, 96, 20) + cone(360, 94, 17)
      + mono(216, 54, 'STOPPED CLIMBING', { size: 7, fill: C.success, ls: '.06em', w: 700, anchor: 'start' });
  } }),

  // ================= C.9(C) stoichiometry: the dose =================

  // The garage on Bell Street: the jug over, acid under a galvanized shelf, hydrogen
  // collecting at the ceiling, and a pilot light nine feet away. The gas layer is the
  // subject, so it gets the top third of the frame.
  'c-garage': scene('c-garage', { frame: C.danger,
    caption: 'THE GARAGE ON BELL STREET - H2 AT THE CEILING', body: k => {
    const jug = k.glass('jg', ['#2b2416', '#6b5c2a', '#b3a153']);
    return `<g>`
      // the garage box: ceiling line, back wall, floor
      + `<rect width="400" height="150" fill="#141d21"/>`
      + `<path d="M0 20 H400" stroke="#3d4b52" stroke-width="2"/>`
      + `<path d="M0 0 H180 L80 92 H0 Z" fill="#ffffff" opacity=".035"/>`
      + `<rect y="92" width="400" height="10" fill="#2a3238"/>`
      + `</g>`
      // the hydrogen layer, banked against the ceiling
      + cloud(8, 22, 384, 20, { tone: '#cfe6ea', op: .3, n: 12, seed: 5 })
      + `<path d="M0 42 H400" stroke="#9fc2c9" stroke-width="1" stroke-dasharray="5 5" opacity=".5"/>`
      + mono(16, 34, 'H2 COLLECTS HERE', { size: 7, fill: '#d8eef2', ls: '.06em', anchor: 'start', w: 700 })
      // the galvanized shelf, fizzing where the acid has reached its feet
      + `<g>`
      + `<rect x="30" y="56" width="118" height="5" fill="#8d9ba1"/>`
      + `<rect x="30" y="76" width="118" height="5" fill="#8d9ba1"/>`
      + `<rect x="34" y="56" width="5" height="36" fill="#6f7d84"/><rect x="139" y="56" width="5" height="36" fill="#6f7d84"/>`
      + `</g>`
      // the jug over on its side and the acid running under
      + `<g transform="rotate(-74 176 86)">` + cylinder(176, 86, 26, 38, { k, id: 'jg2', tint: ['#2b2416', '#6b5c2a', '#b3a153'], valve: false }) + `</g>`
      + `<path d="M40 92 C86 86 140 88 186 90 L186 96 C140 94 86 94 40 98 Z" fill="#7d7a3a" opacity=".8"/>`
      // the fizz where the zinc coating is going
      + `<g fill="#e6f2f4" opacity=".8">`
      + [[42, 88, 2.6], [56, 84, 2], [50, 79, 1.7], [62, 90, 2.2], [70, 82, 1.8], [136, 88, 2.4], [128, 82, 1.9], [142, 78, 1.6]]
        .map(([cx, cy, r]) => `<circle cx="${cx}" cy="${cy}" r="${r}"/>`).join('')
      + `</g>`
      + mono(90, 70, 'ZINC FIZZING', { size: 6.5, fill: C.teal3, ls: '.05em' })
      // the water heater on the far wall, pilot lit
      + `<rect x="316" y="46" width="52" height="46" rx="5" fill="#37444b" stroke="${C.steelLt}" stroke-width="1.4"/>`
      + `<rect x="330" y="74" width="24" height="14" rx="2" fill="#111a1e"/>`
      + flame(342, 88, .7)
      + mono(342, 40, 'PILOT LIT', { size: 6.5, fill: C.ember, ls: '.06em', w: 700 })
      + `<path d="M312 60 H206" stroke="${C.danger}" stroke-width="1.2" stroke-dasharray="4 4" opacity=".7"/>`
      + mono(258, 56, 'NINE FEET', { size: 6, fill: C.danger, ls: '.05em' });
  } }),

  // The depot's synthesis loop under a work light, and the stage-back the number sets.
  // The loop is drawn as a real circuit, because "what is still in the pipe" is the whole
  // question and a straight line would not say it.
  'c-depot': scene('c-depot', { theme: 'panel',
    caption: 'THE DEPOT LOOP - WHAT IS STILL IN THE PIPE', body: k => {
    return pumpPanel(6, { outlets: false })
      // the loop: a closed circuit of pipe with a compressor block on it
      + `<g fill="none" stroke="${C.steelLt}" stroke-width="7" stroke-linecap="round" opacity=".9">`
      + `<path d="M42 34 H150 a18 18 0 0 1 0 36 H42 a18 18 0 0 1 0 -36 Z"/></g>`
      + `<g fill="none" stroke="#ffffff" stroke-width="1.6" opacity=".2">`
      + `<path d="M46 31 H148"/></g>`
      + `<rect x="80" y="20" width="34" height="18" rx="4" fill="#2f4d57" stroke="${C.chrome}" stroke-width="1.4"/>`
      + mono(97, 33, 'COMP', { size: 6, fill: C.dim, ls: '.05em' })
      // what is in it, as three-to-one
      + `<g fill="#d8e6ea" opacity=".85">`
      + [[54, 52], [66, 46], [78, 56], [92, 48], [106, 55], [120, 47], [134, 54], [146, 49]]
        .map(([cx, cy]) => `<circle cx="${cx}" cy="${cy}" r="3.1"/>`).join('')
      + `</g>`
      + `<g fill="#5f9fb5" opacity=".95">`
      + [[60, 60], [100, 62], [140, 60]].map(([cx, cy]) => `<circle cx="${cx}" cy="${cy}" r="4.6"/>`).join('')
      + `</g>`
      + mono(97, 88, 'THREE H2 FOR EVERY N2', { size: 6.5, fill: C.teal3, ls: '.04em' })
      // the stage-back: the engine's distance from the depot, as a measured rule
      + panelBox(200, 16, 184, 78)
      + mono(292, 30, 'STAGE-BACK, SET FROM THE H2 MASS', { size: 6, fill: C.dim, ls: '.04em' })
      + `<path d="M214 62 H372" stroke="${C.steelLt}" stroke-width="1.4" opacity=".7"/>`
      + `<g stroke="${C.steelLt}" stroke-width="1.2" opacity=".6">`
      + [214, 254, 294, 334, 372].map(x => `<path d="M${x} 58 V66"/>`).join('') + `</g>`
      // the engine at one end, the depot at the other
      + `<rect x="208" y="44" width="26" height="13" rx="3" fill="${C.apparatus}"/>`
      + `<rect x="211" y="41" width="8" height="4" rx="1.5" fill="#5aa8e0"/>`
      + `<rect x="222" y="41" width="8" height="4" rx="1.5" fill="${C.apparatusLt}"/>`
      + `<rect x="356" y="42" width="24" height="16" rx="3" fill="#4a5c65" stroke="${C.steelLt}" stroke-width="1.2"/>`
      + mono(292, 78, 'TOO CLOSE AND THE PLUME REACHES YOU', { size: 5.8, fill: C.warn, ls: '.03em' });
  } }),

  // The propane bobtail on its side on the highway, product venting, and the exclusion
  // zone the oxygen demand sets. The cloud reaching past the tape is the consequence the
  // low band names, so the tape line is drawn where the cloud can be seen crossing it.
  'c-bobtail': scene('c-bobtail', { frame: C.danger,
    caption: 'THE PROPANE BOBTAIL - THE AIR THE CLOUD HAS TO FIND', body: k => {
    return roadside(62, { verge: true })
      // the bobtail, over, cab crushed against the verge
      + `<g transform="rotate(-8 130 60)">`
      + barrel(56, 40, 150, 34, { k, id: 'bb', tint: ['#2f3a40', '#7b8a91', '#c9d6da'] })
      + `<path d="M32 42 h26 v30 h-26 z" fill="#3b4a52" stroke="${C.steelLt}" stroke-width="1.2"/>`
      + `</g>`
      + placard(120, 52, 12, { fill: C.apparatusLt, num: '1075', cls: '2.1', tilt: -8 })
      // the vent, and the cloud drifting right, downhill
      + `<path d="M204 44 q8 -8 16 -6" fill="none" stroke="${C.chrome}" stroke-width="3"/>`
      + cloud(206, 30, 178, 26, { tone: '#c6d8de', op: .26, n: 14, seed: 23 })
      + cloud(240, 46, 150, 22, { tone: '#b6ccd4', op: .2, n: 10, seed: 41 })
      // the tape, and the cloud already past it
      + `<g>`
      + `<path d="M300 24 V96" stroke="${C.ember}" stroke-width="2.4" stroke-dasharray="9 6"/>`
      + mono(304, 36, 'TAPE', { size: 6.5, fill: C.ember, ls: '.08em', anchor: 'start', w: 700 })
      + `</g>`
      + cone(288, 96, 19) + cone(316, 94, 17)
      + mono(92, 92, 'PRODUCT STILL VENTING', { size: 6.5, fill: C.dim, ls: '.05em', anchor: 'start' })
      // the driveway past the tape, where the low band puts the cloud
      + `<rect x="348" y="70" width="34" height="22" rx="2" fill="#2b3840" stroke="${C.steelLt}" stroke-width="1.2"/>`
      + `<path d="M348 70 l17 -11 l17 11 z" fill="#3d4d56" stroke="${C.steelLt}" stroke-width="1.2"/>`
      + `<rect x="360" y="80" width="8" height="12" fill="${C.ember}" opacity=".75"/>`
      + mono(384, 52, 'PEOPLE INSIDE', { size: 5.8, fill: C.danger, ls: '.03em', anchor: 'end' });
  } }),

  // ================= C.9(D) limiting reactant =================

  // The ice-fishing shack on the lake: the heater still running, the flame looking normal,
  // and the one that ran out first being the whole story. Drawn from outside and in at
  // once - the shack cut open, because the point is what is happening in the air inside.
  'd-shack': scene('d-shack', { frame: C.danger,
    caption: 'THE ICE-FISHING SHACK - WHICHEVER RAN OUT FIRST', body: k => {
    const wood = k.glass('wd', ['#2b2119', '#54402c', '#8a6b48']);
    return `<g>`
      // lake ice, and a low blue night over it
      + `<rect width="400" height="150" fill="#0e1a22"/>`
      + `<rect y="86" width="400" height="64" fill="#1b3340"/>`
      + `<g stroke="#2f5464" stroke-width="1" opacity=".7">`
      + [[0, 96, 400, 92], [0, 104, 400, 100]].map(([a, b, c, d]) => `<path d="M${a} ${b} L${c} ${d}"/>`).join('')
      + `</g>`
      + `</g>`
      // the shack, cut open on the left so the inside reads
      + `<path d="M26 88 V40 L100 22 L174 40 V88 Z" fill="${wood}" stroke="${C.steelLt}" stroke-width="1.4"/>`
      + `<path d="M26 40 L100 22 L174 40" fill="none" stroke="#9d8055" stroke-width="2.4"/>`
      + `<rect x="38" y="34" width="124" height="54" fill="#0c1418" opacity=".78"/>`
      // the air inside: oxygen going, CO building at head height
      + cloud(42, 40, 116, 14, { tone: '#8d99a0', op: .34, n: 9, seed: 17 })
      + mono(100, 44, 'CO', { size: 9, fill: '#c4ced3', ls: '.2em', w: 700 })
      // the heater, flame looking normal
      + `<rect x="118" y="62" width="34" height="26" rx="3" fill="#3b4a52" stroke="${C.steelLt}" stroke-width="1.3"/>`
      + `<rect x="124" y="68" width="22" height="14" rx="2" fill="#0f181c"/>`
      + flame(135, 82, .75)
      + mono(135, 58, 'LOOKS NORMAL', { size: 5.8, fill: C.warn, ls: '.03em' })
      // the person on the bunk
      + `<rect x="46" y="76" width="58" height="12" rx="5" fill="#3d4a3f"/>`
      + `<circle cx="54" cy="72" r="6" fill="#c69a72"/>`
      // the two reactants, and which one ran out
      + panelBox(192, 16, 192, 80)
      + mono(288, 30, 'WHICH ONE RAN OUT FIRST', { size: 6.5, fill: C.dim, ls: '.05em' })
      + ratioStrip(206, 40, 168, [
        ['CH4', 6, '#c9d6da'], ['O2', 3, '#5f9fb5']
      ], { cell: 10 })
      + `<rect x="234" y="54" width="46" height="13" rx="4" fill="none" stroke="${C.danger}" stroke-width="1.5"/>`
      + mono(288, 82, 'O2 GOES FIRST. THAT IS WHY IT IS CO.', { size: 6, fill: C.danger, ls: '.03em' });
  } }),

  // The truck's caustic soda going into the ditch: the compartment open, the bags coming out,
  // and the line running to the far end. The creek at the culvert is what pays if the
  // line stops short, so it is in frame.
  'd-ditch': scene('d-ditch', {
    caption: 'THE CAUSTIC SODA ON THE TRUCK - HOW FAR THE LINE REACHES', body: k => {
    return roadside(54, { verge: true })
      // the engine's rear compartment, open, left of frame
      + `<g>`
      + `<rect x="0" y="18" width="112" height="76" rx="4" fill="${C.apparatus}" stroke="#6d1a13" stroke-width="2"/>`
      + `<rect x="8" y="30" width="96" height="52" rx="3" fill="#1c2a30" stroke="${C.chrome}" stroke-width="1.6"/>`
      + `<path d="M8 30 H104" stroke="#ffffff" stroke-width="1.4" opacity=".2"/>`
      + `<rect x="0" y="8" width="112" height="10" rx="3" fill="#7d1a13"/>`
      + `<rect x="12" y="4" width="18" height="6" rx="2" fill="${C.apparatusLt}"/>`
      + `<rect x="36" y="4" width="18" height="6" rx="2" fill="#5aa8e0"/>`
      + `</g>`
      + bag(28, 78, 22, 26, { label: 'NaOH' }) + bag(54, 78, 22, 26, { label: 'NaOH' }) + bag(80, 78, 22, 26, { label: 'NaOH' })
      + bag(41, 50, 22, 26, { state: 'spent' }) + bag(67, 50, 22, 26, { state: 'spent' })
      + mono(56, 98, '5 kg A BAG', { size: 6, fill: '#cfdbe0', ls: '.05em' })
      // the ditch running right, with the reagent line laid partway down it
      + `<path d="M112 92 C200 82 300 84 400 90 L400 102 H112 Z" fill="#16232a"/>`
      + `<path d="M112 90 C200 80 300 82 400 88" fill="none" stroke="#42535b" stroke-width="1.4" opacity=".7"/>`
      + `<g fill="${C.soda}" opacity=".92">`
      + Array.from({ length: 9 }, (_, i) => `<ellipse cx="${126 + i * 20}" cy="${88 - i * .6}" rx="9" ry="3.6"/>`).join('')
      + `</g>`
      + `<g fill="#6b7c72" opacity=".55">`
      + Array.from({ length: 5 }, (_, i) => `<ellipse cx="${306 + i * 20}" cy="${86}" rx="9" ry="3.4"/>`).join('')
      + `</g>`
      + `<path d="M300 74 V96" stroke="${C.warn}" stroke-width="1.6" stroke-dasharray="4 4"/>`
      + mono(300, 68, 'THE LINE STOPS HERE', { size: 6, fill: C.warn, ls: '.04em' })
      // the culvert and the creek at the far end
      + `<path d="M370 82 a12 10 0 0 1 24 0 v14 h-24 z" fill="#0d171c" stroke="${C.steelLt}" stroke-width="1.3"/>`
      + mono(382, 42, 'CREEK', { size: 6.5, fill: C.teal3, ls: '.08em', w: 700 })
      + `<path d="M382 48 V74" stroke="${C.teal3}" stroke-width="1.2" stroke-dasharray="3 3" opacity=".7"/>`;
  } }),

  // The chlorine shed: a cylinder leaking beside stacked aluminium, white solid building
  // on the stock and the rest of the gas still looking for the door. The split between
  // "on the stock" and "still in the air" is the reading.
  'd-shed': scene('d-shed', { frame: C.danger,
    caption: 'THE CHLORINE SHED - ON THE STOCK, OR STILL IN THE AIR', body: k => {
    const al = k.glass('al', ['#3a444a', '#8695a0', '#cfdae0']);
    return `<g>`
      // the shed: board walls, one door standing open on the right
      + `<rect width="400" height="150" fill="#131e22"/>`
      + `<rect width="400" height="94" fill="#1b2b30"/>`
      + `<g stroke="#101c20" stroke-width="1" opacity=".7">`
      + [42, 84, 126, 168, 210, 252].map(x => `<path d="M${x} 0 V94"/>`).join('') + `</g>`
      + `<path d="M0 0 H150 L64 94 H0 Z" fill="#ffffff" opacity=".035"/>`
      + `<rect y="94" width="400" height="8" fill="#2c3339"/>`
      + `</g>`
      // the aluminium stock, stacked bar
      + `<g>`
      + [[24, 62], [24, 74], [24, 86], [58, 68], [58, 80]].map(([x, y]) =>
        `<rect x="${x}" y="${y}" width="86" height="10" rx="2" fill="${al}" stroke="${C.steelLt}" stroke-width="1"/>`).join('')
      + `</g>`
      // the white solid forming on it
      + `<g fill="#e4eaea" opacity=".92">`
      + [[38, 60, 7, 3], [62, 66, 9, 3.4], [88, 61, 6, 2.6], [74, 78, 8, 3], [104, 72, 6, 2.6]]
        .map(([cx, cy, rx, ry]) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}"/>`).join('')
      + `</g>`
      + mono(68, 48, 'WHITE SOLID ON THE STOCK', { size: 6, fill: '#d3dcdc', ls: '.03em' })
      // the cylinder, leaking at the valve
      + cylinder(180, 92, 34, 62, { k, id: 'cl2', tint: ['#3a4416', '#767f28', '#c2c85c'] })
      + placard(180, 24, 11, { fill: C.hazGreen, num: 'Cl2', cls: '2.3' })
      + `<g fill="#c9d46a" opacity=".35">`
      + [[200, 44, 12, 8], [218, 52, 16, 10], [242, 46, 14, 9], [264, 56, 18, 11], [292, 48, 15, 10]]
        .map(([cx, cy, rx, ry]) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}"/>`).join('')
      + `</g>`
      // the door, open, and the gas going out of it
      + `<rect x="330" y="26" width="8" height="68" fill="#3d4a52"/>`
      + `<path d="M338 26 L392 16 V96 L338 94 Z" fill="#0c1519" opacity=".8" stroke="${C.steelLt}" stroke-width="1.2"/>`
      + cloud(300, 42, 92, 22, { tone: '#c9d46a', op: .24, n: 8, seed: 29 })
      + mono(348, 62, 'STILL', { size: 6.5, fill: '#d6de92', ls: '.06em' })
      + mono(348, 72, 'GAS', { size: 6.5, fill: '#d6de92', ls: '.06em' })
      + flow(120, 168, 90, { color: '#c9d46a', dash: '3 4', op: .5 });
  } }),

  // ================= Honors h1: particle counts =================

  // The state lab's sample bag on the panel, and the two ways of describing one thing:
  // what it weighs, and how many of it there are. Avogadro's number is the bridge, so it
  // is drawn as a bridge.
  'h1-particles': scene('h1-particles', { theme: 'copper',
    caption: 'THE STATE LAB SAMPLE - MASS ON ONE SIDE, COUNT ON THE OTHER', body: k => {
    const bagFill = k.glass('sb', ['#3a2a12', '#6d5222', '#c0a05a']);
    return `<g>`
      + `<rect width="400" height="150" fill="#20160b"/>`
      + `<rect y="88" width="400" height="14" fill="#3a2a16"/>`
      + `<path d="M0 0 H170 L74 88 H0 Z" fill="#ffffff" opacity=".04"/>`
      + `</g>`
      // the bench scale, with the sample bag on the pan
      + `<g>`
      + `<rect x="22" y="72" width="94" height="16" rx="4" fill="#4a3a1e" stroke="${C.copper}" stroke-width="1.4"/>`
      + `<rect x="30" y="66" width="78" height="7" rx="2" fill="#6b5225"/>`
      + `</g>`
      + `<path d="M46 66 V44 q0 -6 8 -6 h34 q8 0 8 6 V66 Z" fill="${bagFill}" stroke="#c9a668" stroke-width="1.3"/>`
      + `<path d="M50 42 h44" stroke="#e0c48c" stroke-width="2" opacity=".6"/>`
      + `<g fill="#efe2c4" opacity=".8">`
      + Array.from({ length: 14 }, (_, i) => `<rect x="${52 + (i % 5) * 8}" y="${50 + ((i / 5) | 0) * 6}" width="3" height="3" rx=".8"/>`).join('')
      + `</g>`
      + mono(69, 84, 'GRAMS', { size: 7, fill: '#e0b483', ls: '.1em', w: 700 })
      // the bridge: the conversion, as an actual span
      + `<g>`
      + `<path d="M124 74 C168 40 232 40 276 74" fill="none" stroke="${C.copper}" stroke-width="2.4"/>`
      + `<g stroke="${C.copper7}" stroke-width="1.4" opacity=".8">`
      + [148, 172, 200, 228, 252].map(x => {
        const t = (x - 124) / 152;
        const y = 74 - 34 * (4 * t * (1 - t));
        return `<path d="M${x} ${y.toFixed(1)} V74"/>`;
      }).join('') + `</g>`
      + `<rect x="152" y="24" width="96" height="16" rx="5" fill="#2e2113" stroke="${C.copper}" stroke-width="1.4"/>`
      + mono(200, 36, '6.022e23', { size: 9, fill: '#f0d9b0', w: 700, ls: '.04em' })
      + mono(200, 20, "AVOGADRO'S NUMBER", { size: 5.8, fill: '#c9a879', ls: '.06em' })
      + `</g>`
      // the lab's own sheet, counted rather than weighed
      + panelBox(284, 34, 100, 54, { fill: '#2a1d10', stroke: '#8a6a3c' })
      + mono(334, 48, 'STATE LAB FILE', { size: 6, fill: '#c9a879', ls: '.06em' })
      + `<g fill="#e8d2a8" opacity=".9">`
      + Array.from({ length: 24 }, (_, i) => `<circle cx="${296 + (i % 8) * 11}" cy="${60 + ((i / 8) | 0) * 10}" r="2.6"/>`).join('')
      + `</g>`
      + mono(334, 96, 'PARTICLES', { size: 7, fill: '#e0b483', ls: '.1em', w: 700 });
  } }),

  // ================= Honors h2: excess recovered =================

  // The call is over and the excess is still sitting there. Two compartments: what went
  // out, and what is going back in. The difference is the number, and it is a number the
  // volunteer budget feels.
  'h2-recovery': scene('h2-recovery', { theme: 'copper',
    caption: 'WHAT COMES BACK ON THE TRUCK - START, MINUS WHAT REACTED', body: k => {
    return `<g>`
      + `<rect width="400" height="150" fill="#221709"/>`
      + `<rect y="92" width="400" height="10" fill="#3a2a16"/>`
      + `<path d="M0 0 H160 L70 92 H0 Z" fill="#ffffff" opacity=".04"/>`
      + `</g>`
      // what you started with
      + `<rect x="14" y="24" width="118" height="68" rx="5" fill="#2c1f10" stroke="${C.copper7}" stroke-width="1.5"/>`
      + mono(73, 38, 'WENT OUT', { size: 6.5, fill: '#c9a879', ls: '.08em' })
      + bag(38, 88, 20, 24) + bag(62, 88, 20, 24) + bag(86, 88, 20, 24) + bag(110, 88, 20, 24)
      + bag(50, 62, 20, 24) + bag(74, 62, 20, 24) + bag(98, 62, 20, 24)
      // what the reaction actually consumed, greyed
      + flow(140, 178, 58, { color: C.copper, dash: '4 5', op: .7 })
      + `<rect x="182" y="24" width="104" height="68" rx="5" fill="#2c1f10" stroke="${C.copper7}" stroke-width="1.5"/>`
      + mono(234, 38, 'REACTED', { size: 6.5, fill: '#c9a879', ls: '.08em' })
      // Four in ONE row, not three plus a stacked one: the stack put a bag under the
      // sub-label, and four also makes the arithmetic on screen read 7 - 4 = 3.
      + bag(202, 88, 20, 24, { state: 'spent' }) + bag(226, 88, 20, 24, { state: 'spent' })
      + bag(250, 88, 20, 24, { state: 'spent' }) + bag(274, 88, 20, 24, { state: 'spent' })
      + mono(234, 51, 'THE LIMITING ONE', { size: 5.6, fill: '#a8875c', ls: '.03em' })
      + mono(234, 62, 'SETS THIS', { size: 5.6, fill: '#a8875c', ls: '.03em' })
      // what goes back in the compartment
      + flow(294, 318, 58, { color: C.copper, op: .85 })
      + `<rect x="320" y="24" width="66" height="68" rx="5" fill="#2c1f10" stroke="${C.copper}" stroke-width="1.8"/>`
      + mono(353, 38, 'BACK IN', { size: 6.5, fill: '#f0d9b0', ls: '.08em', w: 700 })
      + bag(336, 88, 20, 24) + bag(360, 88, 20, 24) + bag(348, 62, 20, 24)
      + `<path d="M320 96 H386" stroke="${C.copper}" stroke-width="1.6"/>`;
  } }),

  // ================= Capstone: the tanker call =================

  // The whole rotation in one frame: the spill, the drain it is running to, what the truck
  // holds, what mutual aid can bring, and the three routes out. The two numbers that have
  // to be compared are the two bars, and they are drawn against the same scale.
  'cap-tanker': scene('cap-tanker', { frame: C.danger,
    caption: 'THE TANKER AT THE COUNTY LINE - ONE CALL, BOTH NUMBERS', body: k => {
    return roadside(52, { verge: true })
      // the tanker, over, acid running out of the dome
      + `<g transform="rotate(-6 96 40)">`
      + barrel(20, 22, 150, 32, { k, id: 'ct', tint: ['#4b2f2b', '#7d4a41', '#c0857a'] })
      + `</g>`
      + placard(88, 36, 11, { fill: C.hazYellow, num: 'HCl', cls: '8', tilt: -6 })
      // the run to the storm drain
      + `<path d="M96 58 C120 74 150 82 186 86" fill="none" stroke="#8a7a3c" stroke-width="7" stroke-linecap="round" opacity=".85"/>`
      + `<ellipse cx="200" cy="88" rx="17" ry="6" fill="#0f181c" stroke="${C.steelLt}" stroke-width="1.4"/>`
      + `<g stroke="${C.steel}" stroke-width="1" opacity=".85">`
      + `<path d="M186 88 H214"/><path d="M189 84 H211"/><path d="M189 92 H211"/></g>`
      + mono(200, 62, 'STORM DRAIN', { size: 6, fill: C.danger, ls: '.05em' })
      + mono(200, 72, 'RUNS TO THE CREEK', { size: 5.6, fill: C.warn, ls: '.04em' })
      + cone(150, 96, 18) + cone(248, 96, 18)
      // the two numbers, against one scale, which IS the call
      + panelBox(238, 12, 148, 80)
      + mono(312, 25, 'WHAT IT TAKES vs WHAT YOU HAVE', { size: 5.8, fill: C.dim, ls: '.03em' })
      + `<g>`
      + [['NEEDED', .82, C.danger], ['ON TRUCK', .34, C.teal3], ['AID', .74, C.warn]].map(([lab, f, col], i) => {
        const y = 36 + i * 17;
        return mono(248, y + 8, lab, { size: 6, fill: C.dim, anchor: 'start', w: 700 })
          + `<rect x="298" y="${y}" width="76" height="10" rx="3" fill="#16262c"/>`
          + `<rect x="298" y="${y}" width="${(76 * f).toFixed(1)}" height="10" rx="3" fill="${col}"/>`;
      }).join('')
      + `</g>`
      + mono(312, 88, 'LAY IT, HOLD FOR AID, OR WITHDRAW', { size: 5.8, fill: C.ember, ls: '.03em' });
  } })
};

export function sceneArt(id) { return SCENE_ART[id] || ''; }
