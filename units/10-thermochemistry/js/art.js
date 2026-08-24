// art.js — Unit 10 scene illustrations ("Heat Line": a hypothermic climber on a ledge).
// One inline SVG per SCENARIO id (see model.js), rendered into the cockpit's mission
// screen via x-html. The only file in this unit written from scratch for the port.
//
// Built on the same scaffolding as units_new/01-practices-matter/js/art.js and
// units_new/04-bonding-geometry/js/art.js, because the tree shares a shell and a set that
// disagrees with itself reads as several products:
//   • viewBox is 400x150 — the 8:3 the .mission-frame is sized to.
//   • Every gradient/pattern/clip id is prefixed with the scene id. Alpine keeps all
//     station panels in the DOM (x-show, not x-if), so the SVGs coexist and an unprefixed
//     id would bleed from one scene into another. kit() does the prefixing.
//   • Lighting is from the upper left everywhere, so a pouch in one banner is shaded like
//     the pouch in the next.
//   • Keep the subject above y=100. Below that the caption scrim fades the art out.
//   • Banners are aria-hidden: the scenario's goal text directly below is the
//     authoritative description, so announcing the art too is redundant.
//
// Where Unit 1's set says "in the tank" with waterColumn() and Unit 4's says "under the
// sink" with sinkCupboard(), this one says "out on the ledge" with ledge() and "on the
// kit board" with kitBoard(). That is how a scene declares which end of the rescue it is
// at without spending a word of the caption on it: the kit board is where the work
// happens, the ledge is where the consequence lands.
//
// One colour rule runs the whole set and it is the unit's subject: WARM IS ORANGE, COLD
// IS BLUE, and a pouch, a thermometer column, an arrow or a plateau takes its tint from
// which way the heat is actually going. A cold pack drawn warm would teach the sign
// backwards, which is the exact mistake three of these scenarios punish.
//
// Palette tracks tokens.css: teal for instruments, copper for the two Honors jobs,
// semantic red/amber for hazards, and a cold blue-grey for the mountain itself.

const MONO = "'JetBrains Mono', ui-monospace, monospace";

const C = {
  teal: '#2a7d8a', teal7: '#1d5b66', teal3: '#79b0ba', tealLt: '#cfe6ea',
  ink: '#08141a', dim: '#9fc2c9', steel: '#687a82', steelLt: '#aebfc6',
  pale: '#cfdbe0', white: '#e8f2f4', slate: '#3a5560',
  copper: '#c0772f', copper7: '#95591f', copper1: '#f1ddc8',
  success: '#2f8f5b', warn: '#b8881f', danger: '#bf4a30', ember: '#f0a02f',
  // the mountain
  snow: '#dfeaf0', snowMid: '#b8ccd8', snowSh: '#8fa9ba', rock: '#22343f', rockDk: '#16262f',
  // the kit
  tarp: '#3f382e', tarpLt: '#6a5c4a', card: '#f2efe6',
  // heat direction — the one rule that runs the whole set
  hot: '#e2673a', hotLt: '#f7b07a', cold: '#4f9fc0', coldLt: '#a8d8e6',
  flesh: '#d8a882', bag: '#c9702c', bagDk: '#8c4a1c'
};

// Three backgrounds, because this unit happens in three places.
const LEDGE_BG  = ['#0a1c26', '#153039'];   // out on the ledge, in the weather
const KIT_BG    = ['#121a1f', '#232e35'];   // the kit board inside the shelter
const COPPER_BG = ['#1c1208', '#2e2113'];   // Honors
const SUN_BG    = ['#2a1a10', '#3f2a18'];   // the one summer callout, C.13(C)

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
    // Standing glass, metal or plastic: shadow / highlight / body / shadow across x.
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

// Deterministic scatter, so a scene redraws identically every frame rather than shimmering
// each time Alpine re-evaluates the x-html binding.
const seeded = seed => { let s = seed; return () => (s = (s * 1103515245 + 12345) % 2147483648) / 2147483648; };

// ---- signature 1: out on the ledge ----
// Two ridge silhouettes at different depths, snow on the near peaks, and the snow shelf
// the rescue is standing on. This is the "you are looking at the consequence" signature.
const ledge = (floor = 98, { flakes = true, glow = null } = {}) =>
  `<g>`
  // one wash from the upper left, so the sky is not a flat ramp
  + `<path d="M0 0 H236 L96 ${floor} H0 Z" fill="#ffffff" opacity=".05"/>`
  + (glow ? `<ellipse cx="${glow[0]}" cy="${glow[1]}" rx="86" ry="52" fill="${glow[2]}" opacity=".16"/>` : '')
  // far ridge
  + `<path d="M0 66 L44 38 L82 56 L130 24 L184 52 L226 34 L288 60 L334 40 L400 62 V${floor} H0 Z" fill="${C.rock}"/>`
  + `<path d="M130 24 l15 13 l-10 2 l-6 -5 l-9 6 l-9 -3 z" fill="${C.snowSh}" opacity=".55"/>`
  + `<path d="M226 34 l13 11 l-9 2 l-5 -4 l-8 5 l-7 -3 z" fill="${C.snowSh}" opacity=".5"/>`
  // near ridge, darker because it is closer to us and out of the light
  + `<path d="M0 82 L58 58 L102 74 L156 46 L204 70 L260 54 L316 76 L362 62 L400 78 V${floor} H0 Z" fill="${C.rockDk}"/>`
  + `<path d="M156 46 l17 14 l-11 2 l-7 -5 l-10 6 l-9 -3 z" fill="${C.snowSh}" opacity=".42"/>`
  // the shelf, lit along its top edge
  + `<path d="M0 ${floor} Q118 ${floor - 5} 244 ${floor + 2} T400 ${floor - 3} V150 H0 Z" fill="${C.snowMid}"/>`
  + `<path d="M0 ${floor} Q118 ${floor - 5} 244 ${floor + 2} T400 ${floor - 3}" fill="none" stroke="${C.snow}" stroke-width="2"/>`
  + (flakes ? snowfall() : '')
  + `</g>`;

// Sparse falling snow. Small, low-contrast, and never over a label.
const snowfall = (n = 34, seed = 17) => {
  const r = seeded(seed);
  let out = `<g fill="${C.snow}">`;
  for (let i = 0; i < n; i++) {
    const x = r() * 400, y = r() * 96, s = .8 + r() * 1.1;
    out += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${s.toFixed(1)}" opacity="${(.18 + r() * .3).toFixed(2)}"/>`;
  }
  return out + `</g>`;
};

// ---- signature 2: the kit board ----
// The shelter wall behind, then the tarp the kit is laid out on, with a front lip. This is
// the "you are doing the work" signature.
const kitBoard = (top = 94, { seam = true } = {}) => {
  let wall = `<rect width="400" height="${top}" fill="#1b242a"/>`;
  // shelter fabric: slack diagonal folds catching the light from the upper left
  wall += `<g stroke="#26333b" stroke-width="7" opacity=".85" stroke-linecap="round">`;
  for (let x = -40; x < 460; x += 46) wall += `<path d="M${x} -8 L${x + 30} ${top + 8}"/>`;
  wall += `</g>`;
  wall += `<path d="M0 0 H210 L88 ${top} H0 Z" fill="#ffffff" opacity=".045"/>`;
  return `<g>${wall}`
    + `<rect y="${top}" width="400" height="6" fill="${C.tarpLt}"/>`
    + `<rect y="${top + 6}" width="400" height="${150 - top - 6}" fill="${C.tarp}"/>`
    + (seam ? `<path d="M0 ${top + 12} H400" stroke="#2c261e" stroke-width="1.4" opacity=".8"/>` : '')
    + `<path d="M0 ${top} H400" stroke="#c9bda6" stroke-width="1" opacity=".4"/>`
    + `</g>`;
};

// Console readout box: dark screen, cool stroke, a light catch along the top lip.
const panelBox = (x, y, w, h, { r = 7, fill = C.ink, stroke = C.slate, sw = 1.8 } = {}) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`
  + `<path d="M${x + r} ${y + 1.5} H${x + w - r}" stroke="${C.tealLt}" stroke-width="1" opacity=".14"/>`;

// Flow arrow. Solid where heat actually moves, dashed where a number is passed on. The
// colour is the direction: C.hot leaving a warm body, C.cold leaving a cold one.
const flow = (x1, x2, y, { color = C.teal3, w = 2, dash, op = .9 } = {}) => {
  const s = x2 >= x1 ? 1 : -1;   // right-to-left arrows are half the second-law scenes
  return `<g opacity="${op}"><path d="M${x1} ${y} H${x2 - 8 * s}" fill="none" stroke="${color}" stroke-width="${w}"`
    + ` stroke-linecap="round"${dash ? ` stroke-dasharray="${dash}"` : ''}/>`
    + `<path d="M${x2} ${y} l${-9 * s} -5 v10 z" fill="${color}"/></g>`;
};

// A struck-through shape: the wrong call, drawn and then cancelled. Used wherever a
// scenario's whole point is that somebody is about to do the thing heat does not do.
const barred = (x, y, r = 11) =>
  `<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="${C.danger}" stroke-width="2"/>`
  + `<path d="M${x - r * .72} ${y + r * .72} l${(r * 1.44).toFixed(1)} ${(-r * 1.44).toFixed(1)}"`
  + ` stroke="${C.danger}" stroke-width="2" stroke-linecap="round"/>`;

// A small mono chip on a dark plate: the one number a scene is about. Every temperature
// printed in this set uses it, so 31.0 C on one banner is the same object as 33.4 C on
// the next rather than free-floating text.
const chip = (x, y, text, { color = C.tealLt, w = 46, size = 8.5 } = {}) =>
  `<g><rect x="${(x - w / 2).toFixed(1)}" y="${y - 9}" width="${w}" height="15" rx="4" fill="#0a161c" opacity=".9" stroke="${color}" stroke-width="1"/>`
  + mono(x, y + 2, text, { size, fill: color, w: 700 }) + `</g>`;

// The unit's signature object: a chemical pouch. `kind` sets the whole colour story --
// 'hot' releases heat and glows, 'cold' absorbs it and frosts, 'spent' is grey and done.
// Every C.13(C) scene has at least two, because picking between them IS the question.
const pouch = (x, base, w, h, { k, kind = 'hot', label, id = 'p', tilt = 0 } = {}) => {
  const ramp = kind === 'hot' ? ['#5a2410', '#c0562c', '#f6b183']
    : kind === 'cold' ? ['#123c4c', '#2f7c9c', '#a8d8e6']
      : ['#2a3238', '#4c565d', '#8b969d'];
  const edge = kind === 'hot' ? C.hot : kind === 'cold' ? C.cold : C.steel;
  const body = k ? k.glass(id, ramp) : ramp[1];
  const x0 = x - w / 2, y0 = base - h;
  return `<g transform="rotate(${tilt} ${x} ${base})">`
    + `<ellipse cx="${x}" cy="${base + 3}" rx="${(w / 2 + 2).toFixed(1)}" ry="3.5" fill="#040c10" opacity=".38"/>`
    // crimped seal along the top, which is what makes a pouch a pouch
    + `<rect x="${(x0 - 3).toFixed(1)}" y="${y0.toFixed(1)}" width="${w + 6}" height="6" rx="2" fill="${edge}" opacity=".85"/>`
    + `<g stroke="#0a1418" stroke-width=".8" opacity=".5">`
    + [0, 1, 2, 3, 4].map(i => `<path d="M${(x0 - 1 + i * (w + 2) / 4).toFixed(1)} ${(y0 + 1).toFixed(1)} v4"/>`).join('') + `</g>`
    // soft body: a rounded bag, wider at the bottom where the contents sit
    + `<path d="M${x0.toFixed(1)} ${(y0 + 5).toFixed(1)} H${(x0 + w).toFixed(1)}`
    + ` Q${(x0 + w + 4).toFixed(1)} ${(base - h * .4).toFixed(1)} ${(x0 + w - 1).toFixed(1)} ${base}`
    + ` Q${x.toFixed(1)} ${(base + 4).toFixed(1)} ${(x0 + 1).toFixed(1)} ${base}`
    + ` Q${(x0 - 4).toFixed(1)} ${(base - h * .4).toFixed(1)} ${x0.toFixed(1)} ${(y0 + 5).toFixed(1)} Z"`
    + ` fill="${body}" stroke="${edge}" stroke-width="1.4"/>`
    + `<rect x="${(x0 + 3).toFixed(1)}" y="${(y0 + 9).toFixed(1)}" width="3" height="${(h - 15).toFixed(1)}" rx="1.5" fill="#ffffff" opacity=".3"/>`
    // the state the chemistry is in: heat coming off it, or frost forming on it
    + (kind === 'hot'
      ? `<g fill="none" stroke="${C.hotLt}" stroke-width="1.6" stroke-linecap="round" opacity=".85">`
        + [-1, 0, 1].map(d => `<path d="M${(x + d * 9).toFixed(1)} ${(y0 - 4).toFixed(1)} q4 -6 0 -11"/>`).join('') + `</g>`
      : kind === 'cold'
        ? `<g fill="${C.coldLt}" opacity=".8">`
          + [[-8, .55], [0, .5], [8, .6], [-4, .72], [5, .78]].map(([d, f]) =>
            `<circle cx="${(x + d).toFixed(1)}" cy="${(base - h * f).toFixed(1)}" r="1.5"/>`).join('')
          + `</g><g stroke="${C.coldLt}" stroke-width="1.2" stroke-linecap="round" opacity=".7">`
          + `<path d="M${(x - w / 2 - 6).toFixed(1)} ${(y0 - 2).toFixed(1)} l-4 -5"/>`
          + `<path d="M${(x + w / 2 + 6).toFixed(1)} ${(y0 - 2).toFixed(1)} l4 -5"/></g>`
        : '')
    + (label
      ? `<rect x="${(x0 + 2).toFixed(1)}" y="${(base - h * .52).toFixed(1)}" width="${w - 4}" height="14" rx="2.5" fill="${C.card}" opacity=".94"/>`
        + mono(x, base - h * .52 + 10.5, label, { size: 7.5, fill: C.slate, w: 700 })
      : '')
    + `</g>`;
};

// A stem thermometer. `frac` is how far the column has climbed, 0 at the bulb; the tint
// follows the unit rule, warm above body temperature and cool below it.
const thermo = (x, yTop, h, { frac = .5, tint = C.hot, ticks = true } = {}) => {
  const bulbY = yTop + h, colTop = yTop + 5 + (h - 12) * (1 - frac);
  let t = '';
  if (ticks) for (let i = 1; i < 6; i++) {
    const ty = yTop + 5 + (h - 12) * (i / 6);
    t += `<path d="M${x + 3} ${ty.toFixed(1)} h${i % 3 === 0 ? 5 : 3}" stroke="${C.pale}" stroke-width="${i % 3 === 0 ? 1.1 : .8}" opacity=".75"/>`;
  }
  return `<g>`
    + `<rect x="${x - 3}" y="${yTop}" width="6" height="${h - 4}" rx="3" fill="#0e1c22" stroke="${C.steelLt}" stroke-width="1.2"/>`
    + `<circle cx="${x}" cy="${bulbY}" r="6" fill="#0e1c22" stroke="${C.steelLt}" stroke-width="1.2"/>`
    + `<circle cx="${x}" cy="${bulbY}" r="3.6" fill="${tint}"/>`
    + `<rect x="${x - 1.4}" y="${colTop.toFixed(1)}" width="2.8" height="${(bulbY - colTop).toFixed(1)}" rx="1.4" fill="${tint}"/>`
    + `<rect x="${x - 2.2}" y="${yTop + 3}" width="1.6" height="${h - 10}" rx=".8" fill="#ffffff" opacity=".3"/>`
    + t + `</g>`;
};

// The casualty, wrapped in a bivvy bag on a mat. `mood` drives nothing but the face, and
// the face is drawn small on purpose: this is a person, not an emoji.
const patient = (x, base, s = 1, { shiver = false, head = 'left', tint = C.bag } = {}) => {
  const dir = head === 'left' ? 1 : -1;
  return `<g transform="translate(${x},${base}) scale(${dir * s},${s})">`
    + `<ellipse cx="6" cy="3" rx="62" ry="6" fill="#040c10" opacity=".34"/>`
    // the mat under the bag, because a body straight on snow is the mistake the fiction avoids
    + `<rect x="-58" y="-6" width="128" height="7" rx="3" fill="#2f4b57"/>`
    // the bag, head end raised
    + `<path d="M-56 -6 q4 -26 26 -28 q16 -2 30 3 l50 12 q10 3 10 10 v9 z" fill="${tint}" stroke="${C.bagDk}" stroke-width="1.6"/>`
    + `<path d="M-52 -10 q4 -18 22 -20" fill="none" stroke="#ffffff" stroke-width="2" opacity=".22"/>`
    + `<g stroke="${C.bagDk}" stroke-width="1.1" opacity=".55">`
    + `<path d="M-8 -28 l6 26"/><path d="M14 -23 l3 21"/><path d="M40 -18 l1 16"/></g>`
    // the head, hooded
    + `<circle cx="-38" cy="-26" r="11" fill="${C.flesh}"/>`
    + `<path d="M-49 -28 a11 11 0 0 1 22 -3 l-2 4 q-10 -7 -20 -1 z" fill="#39424a"/>`
    + `<circle cx="-42" cy="-25" r="1.5" fill="${C.ink}"/>`
    + `<path d="M-44 -19 q4 2 8 0" fill="none" stroke="${C.ink}" stroke-width="1.1" opacity=".7"/>`
    + (shiver
      ? `<g stroke="${C.coldLt}" stroke-width="1.4" fill="none" opacity=".8" stroke-linecap="round">`
        + `<path d="M-56 -40 q4 -4 8 0 q4 4 8 0"/><path d="M-30 -46 q4 -4 8 0 q4 4 8 0"/></g>`
      : '')
    + `</g>`;
};

// A cook pot: the shelter's heat store and the unit's calorimeter. `level` is 0..1 of the
// body; `tint` is the water, which follows the heat rule.
const pot = (x, base, w, h, { k, level = .6, tint = C.cold, id = 'pot', steam = false } = {}) => {
  const x0 = x - w / 2, top = base - h, yL = top + 4 + (h - 6) * (1 - level);
  const body = k ? k.glass(id, ['#1d262b', '#495861', '#8b9aa3']) : '#495861';
  return `<g>`
    + `<ellipse cx="${x}" cy="${base + 2}" rx="${(w / 2 + 3).toFixed(1)}" ry="4" fill="#040c10" opacity=".38"/>`
    + `<path d="M${x0} ${top} v${(h - 5).toFixed(1)} q0 5 6 5 h${w - 12} q6 0 6 -5 V${top} Z" fill="${body}" stroke="${C.steelLt}" stroke-width="1.6"/>`
    + `<path d="M${(x0 + 2).toFixed(1)} ${yL.toFixed(1)} H${(x0 + w - 2).toFixed(1)} V${(base - 3).toFixed(1)} q0 2 -4 2 H${(x0 + 6).toFixed(1)} q-4 0 -4 -2 Z" fill="${tint}" opacity=".72"/>`
    + `<ellipse cx="${x}" cy="${top}" rx="${(w / 2).toFixed(1)}" ry="4.5" fill="#5c6c75" stroke="${C.steelLt}" stroke-width="1.4"/>`
    + `<ellipse cx="${x}" cy="${top}" rx="${(w / 2 - 4).toFixed(1)}" ry="3" fill="#101c22" opacity=".7"/>`
    + `<ellipse cx="${x}" cy="${yL.toFixed(1)}" rx="${(w / 2 - 4).toFixed(1)}" ry="2.8" fill="${tint}" opacity=".9"/>`
    // lugs, both sides, so the pot reads as liftable
    + `<path d="M${x0 - 5} ${top + 8} h6" stroke="${C.steelLt}" stroke-width="3" stroke-linecap="round"/>`
    + `<path d="M${x0 + w - 1} ${top + 8} h6" stroke="${C.steelLt}" stroke-width="3" stroke-linecap="round"/>`
    + `<rect x="${(x0 + 3).toFixed(1)}" y="${(top + 6).toFixed(1)}" width="3" height="${(h - 16).toFixed(1)}" rx="1.5" fill="#ffffff" opacity=".22"/>`
    + (steam
      ? `<g fill="none" stroke="${C.pale}" stroke-width="1.6" stroke-linecap="round" opacity=".5">`
        + [-10, 2, 12].map(d => `<path d="M${x + d} ${top - 5} q5 -8 0 -15"/>`).join('') + `</g>`
      : '')
    + `</g>`;
};

// The stove: a burner with a flame, optionally a windscreen and a bank of snow against it.
const stove = (x, base, { lit = true, screen = false, snowBank = false, w = 46 } = {}) =>
  `<g>`
  + (screen
    ? `<path d="M${x - w / 2 - 9} ${base} v-26 h4 v26 z M${x + w / 2 + 5} ${base} v-26 h4 v26 z" fill="#5a666e"/>`
      + `<path d="M${x - w / 2 - 9} ${base - 26} H${x + w / 2 + 9}" stroke="#6f7c85" stroke-width="2"/>`
    : '')
  + (snowBank
    ? `<path d="M${x - w / 2 - 34} ${base + 2} q10 -22 30 -24 q12 -1 16 8 q-4 12 -12 16 z" fill="${C.snowMid}" stroke="${C.snow}" stroke-width="1.2"/>`
      + `<g stroke="${C.coldLt}" stroke-width="1.2" stroke-linecap="round" opacity=".9">`
      + `<path d="M${x - w / 2 - 12} ${base - 4} l3 7"/><path d="M${x - w / 2 - 6} ${base - 1} l2 6"/></g>`
    : '')
  + `<rect x="${x - w / 2}" y="${base - 8}" width="${w}" height="8" rx="3" fill="#3b444a" stroke="${C.steelLt}" stroke-width="1.3"/>`
  + `<path d="M${x - w / 2 + 5} ${base - 8} h${w - 10}" stroke="#8b969d" stroke-width="1.4"/>`
  + (lit
    ? `<g fill="none" stroke-linecap="round">`
      + [-13, -4, 5, 14].map(d =>
        `<path d="M${x + d} ${base - 9} q4 -9 0 -16" stroke="${C.ember}" stroke-width="2.8" opacity=".9"/>`
        + `<path d="M${x + d} ${base - 9} q-2 -6 0 -9" stroke="#5fc7e8" stroke-width="1.6" opacity=".9"/>`).join('')
      + `</g>`
    : '')
  + `</g>`;

// The rewarming bottle that goes against her chest.
const hwBottle = (x, base, w, h, { k, id = 'hw', tint = C.hot, frac = .7 } = {}) => {
  const x0 = x - w / 2, top = base - h;
  const body = k ? k.glass(id, ['#43301f', '#7d5a33', '#c69b62']) : '#7d5a33';
  return `<g>`
    + `<ellipse cx="${x}" cy="${base + 2}" rx="${(w / 2 + 2).toFixed(1)}" ry="3.5" fill="#040c10" opacity=".36"/>`
    + `<rect x="${x0}" y="${top}" width="${w}" height="${h}" rx="7" fill="${body}" stroke="${C.steelLt}" stroke-width="1.5"/>`
    + `<rect x="${(x0 + 2).toFixed(1)}" y="${(base - h * frac).toFixed(1)}" width="${w - 4}" height="${(h * frac - 3).toFixed(1)}" rx="5" fill="${tint}" opacity=".55"/>`
    + `<rect x="${(x - 6).toFixed(1)}" y="${(top - 7).toFixed(1)}" width="12" height="8" rx="3" fill="${C.steelLt}"/>`
    + `<g stroke="#c69b62" stroke-width="1" opacity=".6">`
    + [.3, .5, .7].map(f => `<path d="M${x0 + 4} ${(top + h * f).toFixed(1)} h${w - 8}"/>`).join('') + `</g>`
    + `<rect x="${(x0 + 3).toFixed(1)}" y="${(top + 5).toFixed(1)}" width="3" height="${(h - 12).toFixed(1)}" rx="1.5" fill="#ffffff" opacity=".3"/>`
    + `</g>`;
};

// A hanging fluid bag with its line. `tint` is the fluid's temperature, again by the rule.
const dripBag = (x, top, w, h, { tint = C.cold, lineTo = null, label } = {}) =>
  `<g>`
  + `<path d="M${x} ${top - 8} v6" stroke="${C.steelLt}" stroke-width="2"/>`
  + `<path d="M${x - 4} ${top - 8} h8" stroke="${C.steelLt}" stroke-width="2" stroke-linecap="round"/>`
  + `<path d="M${x - w / 2} ${top} h${w} v${h - 8} q0 8 -${w / 2} 8 q-${w / 2} 0 -${w / 2} -8 z" fill="#16262d" stroke="${C.steelLt}" stroke-width="1.4"/>`
  + `<path d="M${x - w / 2 + 2} ${top + 6} h${w - 4} v${h - 16} q0 6 -${w / 2 - 2} 6 q-${w / 2 - 2} 0 -${w / 2 - 2} -6 z" fill="${tint}" opacity=".6"/>`
  + `<rect x="${x - w / 2 + 3}" y="${top + 4}" width="2.6" height="${h - 16}" rx="1.3" fill="#ffffff" opacity=".28"/>`
  + (label ? mono(x, top + h * .58, label, { size: 7.5, fill: C.white, w: 700 }) : '')
  + (lineTo
    ? `<path d="M${x} ${top + h} C${x} ${top + h + 16} ${lineTo[0]} ${lineTo[1] - 20} ${lineTo[0]} ${lineTo[1]}" fill="none" stroke="${C.steelLt}" stroke-width="1.6" opacity=".85"/>`
      + `<circle cx="${x}" cy="${top + h + 6}" r="2.6" fill="${tint}"/>`
    : '')
  + `</g>`;

// A slab of rock. `hot` gives it the ember rim a stone that has been in a fire actually has.
const slab = (x, base, w, h, { hot = false, tint = '#6a6156' } = {}) =>
  `<g>`
  + `<ellipse cx="${x}" cy="${base + 2}" rx="${(w / 2 + 3).toFixed(1)}" ry="3.5" fill="#040c10" opacity=".36"/>`
  + (hot ? `<ellipse cx="${x}" cy="${base - h / 2}" rx="${(w / 2 + 16).toFixed(1)}" ry="${(h + 14).toFixed(1)}" fill="${C.hot}" opacity=".16"/>` : '')
  + `<path d="M${x - w / 2} ${base} l4 -${h} h${w - 12} l6 ${h} z" fill="${tint}" stroke="${hot ? C.hot : C.steelLt}" stroke-width="1.5"/>`
  + `<path d="M${x - w / 2 + 4} ${base - h} h${w - 12} l3 5 h${-(w - 8)} z" fill="#8a8074" opacity=".7"/>`
  + `<g stroke="#4e463c" stroke-width="1" opacity=".7">`
  + `<path d="M${x - w / 4} ${base - h + 4} l6 ${h - 6}"/><path d="M${x + w / 5} ${base - h + 3} l-4 ${h - 5}"/></g>`
  + (hot
    ? `<g fill="none" stroke="${C.hotLt}" stroke-width="1.6" stroke-linecap="round" opacity=".85">`
      + [-12, 0, 12].map(d => `<path d="M${x + d} ${base - h - 4} q4 -7 0 -13"/>`).join('') + `</g>`
    : '')
  + `</g>`;

// ---------------------------------------------------------------- scaffolding
// scene(id, opts) -> a complete 400x150 banner string.
//   caption  required mono strapline along the bottom
//   body     required k => shapes, drawn between background and scrim
//   theme    'ledge' (default, out in the weather) | 'kit' (on the board) | 'copper'
//   bg       explicit two-stop background, for the one summer callout
//   frame    override the frame stroke (e.g. danger red for a hazard scene)
function scene(id, { caption, body, theme = 'ledge', bg, frame, capColor }) {
  const honors = theme === 'copper';
  const [top, bot] = bg || (honors ? COPPER_BG : theme === 'kit' ? KIT_BG : LEDGE_BG);
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

  // ================= C.13(A) the four laws, off real mountain situations =================

  // Zeroth. Two spent pouches at the same temperature, pressed together by a rookie. The
  // arrow between them is barred, because the answer to "which way" is "neither".
  'a-two-packs': scene('a-two-packs', { caption: 'TWO SPENT POUCHES · BOTH 31.0 C', body: k => {
    return kitBoard(94)
      + pouch(120, 92, 54, 46, { k, kind: 'spent', id: 'l' })
      + pouch(212, 92, 54, 46, { k, kind: 'spent', id: 'r' })
      + chip(120, 26, '31.0 C', { color: C.pale })
      + chip(212, 26, '31.0 C', { color: C.pale })
      // the barred arrow: drawn both ways, then struck through
      + `<g opacity=".8">`
      + `<path d="M152 62 H180" stroke="${C.steel}" stroke-width="2" stroke-dasharray="3 3"/>`
      + `<path d="M152 62 l8 -4 v8 z" fill="${C.steel}"/><path d="M180 62 l-8 -4 v8 z" fill="${C.steel}"/></g>`
      + `<circle cx="166" cy="62" r="11" fill="none" stroke="${C.danger}" stroke-width="2"/>`
      + `<path d="M158 70 l16 -16" stroke="${C.danger}" stroke-width="2" stroke-linecap="round"/>`
      + mono(166, 88, 'NO NET FLOW', { size: 7.5, fill: C.danger, ls: '.09em', w: 700 })
      // the fresh one still in the kit, which is what the right call reaches for
      + pouch(322, 92, 46, 52, { k, kind: 'hot', id: 'f', label: 'FRESH' })
      + mono(322, 24, 'UNOPENED', { size: 7, fill: C.ember, ls: '.12em', w: 700 });
  } }),

  // Zeroth again, and the useful half of it: the reading parks because the glass and the
  // skin have come to the same temperature. The trace is the whole idea, so it is drawn
  // large enough to read the flat part.
  'a-thermometer': scene('a-thermometer', { caption: 'THE READING CLIMBS, SLOWS, THEN PARKS', body: k => {
    return ledge(98, { glow: [300, 40, C.teal3] })
      + patient(112, 96, .92, { shiver: true })
      + thermo(150, 34, 46, { frac: .52, tint: C.hot })
      + flow(160, 178, 58, { color: C.hot, w: 1.8, dash: '3 3', op: .7 })
      // the trace: rising, bending, flat
      + panelBox(196, 20, 186, 66)
      + `<path d="M206 76 H374" stroke="${C.slate}" stroke-width="1"/>`
      + `<path d="M206 76 V28" stroke="${C.slate}" stroke-width="1"/>`
      + `<path d="M206 74 C238 74 250 44 286 38 C318 33 344 34 374 34" fill="none" stroke="${C.hot}" stroke-width="2.4" stroke-linecap="round"/>`
      + `<path d="M300 34 H374" stroke="${C.success}" stroke-width="2.4" stroke-linecap="round" opacity=".9"/>`
      + `<circle cx="374" cy="34" r="3" fill="${C.success}"/>`
      + mono(288, 26, 'EQUILIBRIUM', { size: 7, fill: C.success, ls: '.1em', w: 700, anchor: 'start' })
      + mono(212, 88, 'time', { size: 7, fill: C.dim, anchor: 'start' })
      + chip(340, 62, '33.4 C', { color: C.hotLt });
  } }),

  // First law, as fuel accounting. One cartridge in, four places the energy lands, and
  // only the small arrow reaches the water. The arrow widths are the point.
  'a-stove-books': scene('a-stove-books', { caption: 'ONE CARTRIDGE · WHERE DID THE REST GO', theme: 'kit', body: k => {
    return kitBoard(96)
      + stove(112, 94, { lit: true, screen: true })
      + pot(112, 68, 58, 34, { k, level: .6, tint: C.cold, id: 'p', steam: true })
      + chip(112, 20, 'ONE CARTRIDGE', { color: C.ember, w: 90, size: 7.5 })
      // where it actually goes: one thin arrow into the water, three fat ones elsewhere
      + flow(160, 214, 40, { color: C.hot, w: 2, op: .95 })
      + mono(218, 43, 'into the water', { size: 7.5, fill: C.hotLt, anchor: 'start' })
      + flow(160, 214, 58, { color: C.hot, w: 4, op: .8 })
      + mono(218, 61, 'into the pot', { size: 7.5, fill: C.dim, anchor: 'start' })
      + flow(160, 214, 74, { color: C.hot, w: 4, op: .7 })
      + mono(218, 77, 'into the windscreen', { size: 7.5, fill: C.dim, anchor: 'start' })
      + flow(160, 214, 90, { color: C.hot, w: 5, op: .6 })
      + mono(218, 93, 'into the shelter air', { size: 7.5, fill: C.dim, anchor: 'start' })
      + `<path d="M212 32 V96" stroke="${C.slate}" stroke-width="1" stroke-dasharray="3 4" opacity=".7"/>`
      + mono(374, 22, 'NONE OF IT IS GONE', { size: 7, fill: C.success, ls: '.06em', w: 700, anchor: 'end' });
  } }),

  // First law again, this time inside the patient. The sugar packet is not decorative:
  // it makes the chemical-energy-to-body-heat claim legible without claiming that an
  // exact amount of food produces an exact temperature rise.
  'a-shivering': scene('a-shivering', { caption: 'CHEMICAL ENERGY BECOMES BODY HEAT', body: k => {
    return ledge(98, { glow: [130, 45, C.hot] })
      + patient(128, 96, .96, { shiver: true })
      + `<rect x="232" y="48" width="58" height="32" rx="5" fill="${C.card}" stroke="${C.copper}" stroke-width="1.4"/>`
      + `<path d="M238 56 h46 M238 64 h31" stroke="${C.copper7}" stroke-width="1.5" opacity=".8"/>`
      + mono(261, 75, 'FUEL', { size: 9, fill: C.copper7, w: 700, ls: '.11em' })
      + flow(224, 175, 60, { color: C.ember, w: 3 })
      + `<g fill="none" stroke="${C.hotLt}" stroke-width="1.8" stroke-linecap="round" opacity=".88">`
      + `<path d="M180 48 q6 -10 0 -18"/><path d="M195 52 q6 -10 0 -18"/><path d="M210 57 q6 -10 0 -18"/></g>`
      + chip(192, 30, 'HEAT', { color: C.hotLt, w: 45 })
      + mono(338, 34, 'SHIVER = WORK', { size: 8, fill: C.ember, w: 700, ls: '.08em' });
  } }),

  // The windscreen scene makes the direction of heat the entire composition: the stove
  // glows, the snow bank is blue, and the only arrow runs from the burner toward the snow.
  'a-snow-windscreen': scene('a-snow-windscreen', { caption: 'HOT BURNER · COLD SNOW · HEAT LEAVES THE BURNER', theme: 'kit', body: k => {
    return kitBoard(96)
      + stove(136, 95, { lit: true, screen: true, snowBank: true, w: 64 })
      + pot(136, 68, 58, 30, { k, level: .58, tint: C.cold, id: 'snow-pot', steam: true })
      + flow(170, 244, 69, { color: C.hot, w: 3 })
      + `<path d="M244 86 q12 -24 33 -23 q22 1 29 23 z" fill="${C.snowMid}" stroke="${C.snow}" stroke-width="1.4"/>`
      + `<g stroke="${C.coldLt}" stroke-width="1.2" stroke-linecap="round"><path d="M264 62 l-4 -7"/><path d="M280 62 l3 -7"/><path d="M294 69 l6 -5"/></g>`
      + barred(314, 51, 12)
      + mono(314, 31, 'NOT "COLD OUT"', { size: 7.5, fill: C.danger, w: 700, ls: '.06em' })
      + chip(284, 91, 'MELTS', { color: C.coldLt, w: 42, size: 8 });
  } }),

  // An explicitly dangerous use of the spent pack. The subject is still the pack and
  // patient's chest, not an alarm icon, so the visual carries the thermodynamics.
  'a-spent-pack': scene('a-spent-pack', { caption: 'A 6 C PACK PULLS HEAT OUT OF A 33 C CHEST', body: k => {
    return ledge(98, { glow: [150, 52, C.danger] })
      + patient(155, 96, .98, { shiver: true })
      + pouch(176, 72, 42, 42, { k, kind: 'cold', id: 'spent', label: '6 C' })
      + flow(178, 236, 58, { color: C.hot, w: 3.2 })
      + `<path d="M246 46 q10 10 0 20 q-10 10 0 20" fill="none" stroke="${C.hotLt}" stroke-width="2.2" stroke-linecap="round"/>`
      + `<path d="M258 46 q10 10 0 20 q-10 10 0 20" fill="none" stroke="${C.hotLt}" stroke-width="2.2" stroke-linecap="round" opacity=".72"/>`
      + chip(278, 39, '33 C', { color: C.hotLt })
      + barred(334, 60, 15)
      + mono(334, 87, 'DO NOT STRAP IT ON', { size: 7, fill: C.danger, w: 700, ls: '.06em' });
  } }),

  // Third-law field question. A compact thermometer and a distant 0 K line distinguish
  // "very cold" from the unattainable limit without turning the banner into a graph.
  'a-battery-cold': scene('a-battery-cold', { caption: 'COLD SLOWS THE CHEMISTRY · IT DOES NOT REACH 0 K', body: k => {
    return ledge(98, { flakes: true })
      + `<rect x="76" y="46" width="70" height="34" rx="5" fill="#263940" stroke="${C.steelLt}" stroke-width="1.4"/>`
      + `<rect x="146" y="55" width="8" height="16" rx="2" fill="${C.steelLt}"/>`
      + `<path d="M88 62 h14 l-5 7 h14 l-13 10 4 -9 h-13 z" fill="${C.coldLt}" opacity=".82"/>`
      + `<path d="M185 80 V22" stroke="${C.steelLt}" stroke-width="1.4"/>`
      + `<path d="M180 80 H352" stroke="${C.steelLt}" stroke-width="1.4"/>`
      + `<path d="M191 30 C230 32 242 48 270 61 C300 74 320 77 346 78" fill="none" stroke="${C.cold}" stroke-width="2.4"/>`
      + `<path d="M188 80 H352" stroke="${C.danger}" stroke-width="1.4" stroke-dasharray="4 3" opacity=".8"/>`
      + mono(346, 92, '0 K', { size: 8, fill: C.danger, w: 700, anchor: 'end' })
      + mono(225, 24, 'COLDER, SLOWER', { size: 7.5, fill: C.coldLt, w: 700, ls: '.08em' });
  } }),

  // The final third-law situation happens at base, so it deliberately swaps snow for a
  // quiet instrument rack. The shrinking arrows make diminishing returns visible.
  'a-cryo-stage': scene('a-cryo-stage', { caption: 'EACH EXTRA STAGE REMOVES LESS HEAT', theme: 'kit', body: k => {
    return kitBoard(96, { seam: false })
      + `<g transform="translate(44 20)">`
      + [0, 1, 2, 3].map(i => `<rect x="${i * 58}" y="${12 + i * 7}" width="42" height="56" rx="5" fill="${i === 3 ? '#1c3039' : '#344951'}" stroke="${C.teal3}" stroke-width="1.2"/>`).join('')
      + [0, 1, 2, 3].map(i => `<circle cx="${21 + i * 58}" cy="${38 + i * 7}" r="10" fill="${i === 3 ? C.coldLt : C.teal}" opacity="${.92 - i * .12}"/>`).join('')
      + [0, 1, 2].map(i => flow(44 + i * 58, 88 + i * 58, 40 + i * 7, { color: C.coldLt, w: 3 - i * .55 })).join('')
      + `</g>`
      + chip(330, 38, '0.5 K', { color: C.coldLt, w: 46 })
      + `<path d="M330 48 v38" stroke="${C.coldLt}" stroke-width="1.4" stroke-dasharray="3 3" opacity=".75"/>`
      + mono(330, 82, 'STALLED', { size: 8, fill: C.warn, w: 700, ls: '.09em' });
  } }),

  // ================= C.13(C) choose a thermal pack =================

  'c-hypothermia': scene('c-hypothermia', { caption: 'CHEST REWARMING · EXOTHERMIC PACK', body: k => {
    return ledge(98, { glow: [144, 44, C.hot] })
      + patient(120, 96, .96, { shiver: true })
      + pouch(186, 88, 55, 51, { k, kind: 'hot', id: 'hot', label: 'HOT' })
      + pouch(286, 88, 55, 51, { k, kind: 'cold', id: 'cold', label: 'COLD' })
      + flow(186, 151, 60, { color: C.hot, w: 3.2 })
      + barred(286, 53, 13)
      + mono(186, 25, 'dH < 0', { size: 10, fill: C.hotLt, w: 700, ls: '.08em' })
      + mono(286, 25, 'dH > 0', { size: 10, fill: C.coldLt, w: 700, ls: '.08em' });
  } }),

  'c-ankle': scene('c-ankle', { caption: 'SWOLLEN ANKLE · ENDOTHERMIC PACK', body: k => {
    return ledge(98, { flakes: false })
      + `<path d="M92 61 q18 -22 40 -4 l13 17 q11 12 -7 19 H87 q-12 -2 -6 -14 z" fill="${C.flesh}" stroke="${C.bagDk}" stroke-width="1.4"/>`
      + `<ellipse cx="126" cy="78" rx="18" ry="12" fill="#c47f6d" opacity=".62"/>`
      + pouch(200, 89, 58, 52, { k, kind: 'cold', id: 'cold', label: 'COLD' })
      + pouch(302, 89, 58, 52, { k, kind: 'hot', id: 'hot', label: 'HOT' })
      + flow(168, 199, 58, { color: C.cold, w: 3.2 })
      + barred(302, 53, 13)
      + mono(200, 25, 'dH > 0', { size: 10, fill: C.coldLt, w: 700, ls: '.08em' })
      + mono(302, 25, 'dH < 0', { size: 10, fill: C.hotLt, w: 700, ls: '.08em' });
  } }),

  'c-heat-exhaust': scene('c-heat-exhaust', { caption: 'SUMMER CALLOUT · MOVE HEAT OUT FAST', bg: SUN_BG, frame: C.ember, capColor: '#f1d0a0', body: k => {
    return `<path d="M0 84 Q86 61 168 78 T400 70 V104 H0 Z" fill="#5f4c2f" opacity=".78"/>`
      + `<circle cx="340" cy="29" r="20" fill="#f1bd5b" opacity=".9"/>`
      + `<g stroke="#f1bd5b" stroke-width="2" stroke-linecap="round" opacity=".7">`
      + [0, 45, 90, 135, 180, 225, 270, 315].map(a => { const r = Math.PI * a / 180; return `<path d="M${340 + Math.cos(r) * 28} ${29 + Math.sin(r) * 28} l${Math.cos(r) * 8} ${Math.sin(r) * 8}"/>`; }).join('') + `</g>`
      + patient(136, 96, .96, { shiver: false, tint: '#b75433' })
      + pouch(196, 88, 56, 52, { k, kind: 'cold', id: 'cold', label: 'COLD' })
      + flow(155, 198, 57, { color: C.cold, w: 3.2 })
      + chip(116, 34, '39.8 C', { color: '#ffe2a0', w: 48 })
      + mono(274, 76, 'HEAT LEAVES HIM', { size: 8, fill: C.coldLt, w: 700, ls: '.08em' });
  } }),

  'c-fluid-bag': scene('c-fluid-bag', { caption: 'WARM THE FLUID BEFORE IT REACHES HER', theme: 'kit', body: k => {
    return kitBoard(96)
      + dripBag(102, 28, 46, 58, { tint: C.cold, lineTo: [206, 88], label: '2 C' })
      + pouch(188, 90, 54, 50, { k, kind: 'hot', id: 'hot', label: 'HOT' })
      + flow(160, 212, 58, { color: C.hot, w: 3 })
      + hwBottle(270, 91, 50, 48, { k, id: 'fluid', tint: C.hot, frac: .56 })
      + `<path d="M300 68 C326 68 330 50 350 50" fill="none" stroke="${C.steelLt}" stroke-width="1.5"/>`
      + `<circle cx="352" cy="50" r="4" fill="${C.hot}"/>`
      + mono(272, 29, 'BODY TEMP', { size: 8, fill: C.hotLt, w: 700, ls: '.07em' })
      + barred(120, 52, 12);
  } }),

  // ================= C.13(D) q = mcΔT =================

  'd-bottle': scene('d-bottle', { caption: 'CHEST BOTTLE · HEAT IT TO THE PROTOCOL TARGET', theme: 'kit', body: k => {
    return kitBoard(96)
      + pot(100, 92, 74, 54, { k, level: .72, tint: C.hot, id: 'pot', steam: true })
      + flow(143, 218, 58, { color: C.hot, w: 3.2 })
      + hwBottle(268, 92, 54, 58, { k, id: 'bottle', tint: C.hot, frac: .67 })
      + thermo(330, 30, 54, { frac: .72, tint: C.hot })
      + chip(332, 22, 'TARGET', { color: C.hotLt, w: 50, size: 7.5 })
      + `<path d="M240 86 h56" stroke="${C.hotLt}" stroke-width="1.1" stroke-dasharray="3 3" opacity=".72"/>`
      + mono(216, 30, 'q = mc dT', { size: 11, fill: C.tealLt, w: 700, ls: '.04em' });
  } }),

  'd-saline': scene('d-saline', { caption: 'FLUID WARMER · BODY TEMPERATURE, NOT A GUESS', theme: 'kit', body: k => {
    return kitBoard(96)
      + dripBag(104, 28, 48, 58, { tint: C.cold, lineTo: [170, 92], label: 'COLD' })
      + `<rect x="162" y="48" width="64" height="42" rx="6" fill="#1e3238" stroke="${C.teal3}" stroke-width="1.5"/>`
      + `<path d="M177 58 q8 -10 0 -20 M193 58 q8 -10 0 -20 M209 58 q8 -10 0 -20" fill="none" stroke="${C.hotLt}" stroke-width="1.8" stroke-linecap="round"/>`
      + flow(132, 161, 66, { color: C.cold, w: 2.4 })
      + flow(228, 286, 66, { color: C.hot, w: 3 })
      + dripBag(316, 28, 48, 58, { tint: C.hot, lineTo: [348, 95], label: 'WARM' })
      + chip(193, 29, 'q = mc dT', { color: C.tealLt, w: 62, size: 7 });
  } }),

  'd-stone': scene('d-stone', { caption: 'GRANITE STORES HEAT · WRAP IT BEFORE IT REACHES SKIN', body: k => {
    return ledge(98, { glow: [136, 54, C.hot] })
      + stove(110, 96, { lit: true, screen: true, w: 52 })
      + slab(190, 93, 70, 44, { hot: true })
      + flow(142, 178, 62, { color: C.hot, w: 3 })
      + `<path d="M252 92 q8 -38 42 -43 l24 10 q-3 26 -16 36 z" fill="#6c5b47" stroke="#a38d70" stroke-width="1.3"/>`
      + `<path d="M265 55 l30 33 M278 50 l29 36" stroke="#c7af8a" stroke-width="1" opacity=".62"/>`
      + chip(348, 42, 'q?', { color: C.hotLt, w: 38 })
      + mono(328, 82, 'WRAP FIRST', { size: 8, fill: C.warn, w: 700, ls: '.09em' });
  } }),

  // ================= C.13(B) calorimetry =================

  'b-stone-pot': scene('b-stone-pot', { caption: 'HOT STONE + MELTWATER · ONE SETTLING TEMPERATURE', theme: 'kit', body: k => {
    return kitBoard(96)
      + slab(104, 88, 60, 40, { hot: true })
      + flow(140, 204, 59, { color: C.hot, w: 3.2 })
      + pot(248, 92, 96, 56, { k, level: .62, tint: C.cold, id: 'mix' })
      + thermo(318, 28, 54, { frac: .57, tint: C.teal3 })
      + `<path d="M222 40 v39" stroke="${C.steelLt}" stroke-width="1.3" stroke-dasharray="3 3"/>`
      + mono(222, 29, 'q LOST = q GAINED', { size: 7.5, fill: C.tealLt, w: 700, ls: '.04em' })
      + chip(342, 28, 'Tf ?', { color: C.tealLt, w: 40 });
  } }),

  'b-hot-water': scene('b-hot-water', { caption: 'HOT KETTLE + COLD POT · MIX BEFORE THE BOTTLE', theme: 'kit', body: k => {
    return kitBoard(96)
      + pot(96, 90, 72, 50, { k, level: .7, tint: C.hot, id: 'kettle', steam: true })
      + `<path d="M136 55 C164 46 171 55 181 69" fill="none" stroke="${C.hotLt}" stroke-width="4" stroke-linecap="round"/>`
      + `<path d="M136 55 C164 46 171 55 181 69" fill="none" stroke="${C.hot}" stroke-width="2" stroke-linecap="round"/>`
      + pot(236, 90, 96, 50, { k, level: .62, tint: C.cold, id: 'melt' })
      + `<path d="M229 62 q14 -11 26 0" fill="none" stroke="${C.tealLt}" stroke-width="2" opacity=".82"/>`
      + thermo(330, 28, 54, { frac: .62, tint: C.teal3 })
      + chip(332, 22, 'Tf ?', { color: C.tealLt, w: 40 })
      + mono(174, 31, 'HOT', { size: 8, fill: C.hotLt, w: 700, ls: '.1em' })
      + mono(246, 31, 'COLD', { size: 8, fill: C.coldLt, w: 700, ls: '.1em' });
  } }),

  'b-skillet': scene('b-skillet', { caption: 'GLOWING IRON · TEMPERATURE IS NOT STORED HEAT', theme: 'kit', body: k => {
    return kitBoard(96)
      + `<path d="M67 69 h83 l18 -14 h26 v13 h-22 l-18 18 H67 z" fill="#3b4348" stroke="${C.hot}" stroke-width="1.7"/>`
      + `<ellipse cx="110" cy="66" rx="37" ry="12" fill="#8f4d2b" opacity=".8"/>`
      + `<g fill="none" stroke="${C.hotLt}" stroke-width="1.5" stroke-linecap="round" opacity=".86"><path d="M90 50 q4 -7 0 -13"/><path d="M108 48 q4 -7 0 -13"/><path d="M126 50 q4 -7 0 -13"/></g>`
      + flow(162, 224, 60, { color: C.hot, w: 3 })
      + pot(266, 92, 94, 54, { k, level: .67, tint: C.cold, id: 'quench' })
      + chip(328, 28, 'Tf ?', { color: C.tealLt, w: 40 })
      + mono(132, 28, 'IRON', { size: 8, fill: C.hotLt, w: 700, ls: '.11em' })
      + mono(268, 28, 'WATER', { size: 8, fill: C.coldLt, w: 700, ls: '.11em' });
  } }),

  // ================= Honors and capstone =================

  'h1-route': scene('h1-route', { caption: 'HESS ROUTE · FLIP, SCALE, THEN ADD', theme: 'copper', body: k => {
    return `<g>`
      + panelBox(28, 22, 112, 58, { fill: '#21170e', stroke: C.copper, sw: 1.4 })
      + panelBox(154, 22, 92, 58, { fill: '#21170e', stroke: C.copper, sw: 1.4 })
      + panelBox(260, 22, 112, 58, { fill: '#21170e', stroke: C.copper, sw: 1.4 })
      + mono(84, 46, 'STEP 1', { size: 8, fill: '#e0b483', w: 700, ls: '.09em' })
      + mono(200, 46, 'STEP 2', { size: 8, fill: '#e0b483', w: 700, ls: '.09em' })
      + mono(316, 46, 'TARGET', { size: 8, fill: '#e0b483', w: 700, ls: '.09em' })
      + mono(84, 66, 'dH  +', { size: 12, fill: C.copper1, w: 700 })
      + mono(200, 66, 'dH  -', { size: 12, fill: C.copper1, w: 700 })
      + mono(316, 66, 'SUM', { size: 12, fill: C.copper1, w: 700 })
      + flow(140, 154, 52, { color: C.copper, w: 2.2 })
      + flow(246, 260, 52, { color: C.copper, w: 2.2 })
      + `<path d="M108 91 H292" stroke="${C.copper}" stroke-width="1.4" stroke-dasharray="4 3" opacity=".7"/>`
      + mono(200, 98, 'STATE FUNCTION', { size: 8, fill: '#e0b483', w: 700, ls: '.14em' })
      + `</g>`;
  } }),

  'h2-formation': scene('h2-formation', { caption: 'FORMATION DATA · PRODUCTS MINUS REACTANTS', theme: 'copper', body: k => {
    return `<g>`
      + panelBox(26, 20, 144, 63, { fill: '#21170e', stroke: C.copper, sw: 1.4 })
      + panelBox(230, 20, 144, 63, { fill: '#21170e', stroke: C.copper, sw: 1.4 })
      + mono(98, 39, 'REACTANTS', { size: 8, fill: '#e0b483', w: 700, ls: '.1em' })
      + mono(302, 39, 'PRODUCTS', { size: 8, fill: '#e0b483', w: 700, ls: '.1em' })
      + mono(98, 62, 'sum dHf', { size: 12, fill: C.copper1, w: 700 })
      + mono(302, 62, 'sum dHf', { size: 12, fill: C.copper1, w: 700 })
      + flow(174, 225, 51, { color: C.copper, w: 2.6 })
      + `<path d="M181 79 H219" stroke="${C.copper}" stroke-width="1.4"/>`
      + mono(200, 75, 'minus', { size: 8, fill: '#e0b483', w: 700 })
      + `<path d="M62 91 H338" stroke="${C.copper}" stroke-width="1.3" stroke-dasharray="4 3" opacity=".68"/>`
      + mono(200, 99, 'COEFFICIENTS TRAVEL WITH dHf', { size: 7.5, fill: '#e0b483', w: 700, ls: '.07em' })
      + `</g>`;
  } }),

  'cap-evac': scene('cap-evac', { caption: 'EVACUATION CALL · CORE, CLOUDS, AND LIGHT', body: k => {
    return ledge(98, { glow: [282, 37, C.ember] })
      + patient(112, 96, .88, { shiver: false })
      + `<path d="M196 72 h70 l20 -12 h50 l14 12 h-16 l-14 9 h-70 l-14 -9 z" fill="#44555d" stroke="${C.steelLt}" stroke-width="1.4"/>`
      + `<path d="M275 60 v-14 h30 v14" fill="none" stroke="${C.steelLt}" stroke-width="2"/>`
      + `<path d="M316 54 q15 -16 34 0 q15 -16 31 0" fill="none" stroke="${C.pale}" stroke-width="3" opacity=".8"/>`
      + `<path d="M220 38 q25 -15 52 0" fill="none" stroke="${C.teal3}" stroke-width="1.6" stroke-dasharray="3 3"/>`
      + chip(145, 35, 'CORE >= 33 C', { color: C.hotLt, w: 78, size: 7.5 })
      + mono(288, 30, 'CLOUD BASE?', { size: 8, fill: C.pale, w: 700, ls: '.08em' })
      + flow(158, 222, 61, { color: C.hot, w: 2.4 });
  } })
};

export function sceneArt(id) { return SCENE_ART[id] || ''; }
