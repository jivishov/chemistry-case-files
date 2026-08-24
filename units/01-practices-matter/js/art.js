// art.js — Unit 1 scene illustrations ("Tank Watch": the fish tank in your room).
// One inline SVG per SCENARIO id (see model.js), rendered into the cockpit's mission
// screen and into each brief card via x-html.
//
// Built on the same scaffolding as units/05-the-mole/js/art.js, because the two units
// share a shell and a set that disagrees with itself reads as two products:
//   • viewBox is 400x150 — the 8:3 the .mission-frame is sized to.
//   • Every gradient/pattern/clip id is prefixed with the scene id. Alpine keeps all
//     stage panels in the DOM (x-show, not x-if), so the SVGs coexist and an unprefixed
//     id would bleed from one scene into another. kit() does the prefixing.
//   • Lighting is from the upper left everywhere, so a glass cylinder in one banner is
//     shaded like the glass cylinder in the next.
//   • Keep the subject above y=102. Below that the caption scrim fades the art out.
//   • Banners are aria-hidden: the brief's role/goal/why text directly below is the
//     authoritative description, so announcing the art too is redundant.
//
// Where Unit 5's set says "outside the hull" with stars and "inside a deck" with a
// bulkhead, this one says "in the tank" with waterColumn() and "on the desk beside it"
// with deskShelf(). That is how a scene declares which side of the glass it is on
// without spending a word of the caption on it.
//
// Palette tracks tokens.css: teal for the tank and its tools, copper for the two Honors
// jobs, semantic red/amber for hazards, warm neutrals for the room.

const MONO = "'JetBrains Mono', ui-monospace, monospace";

const C = {
  teal: '#2a7d8a', teal7: '#1d5b66', teal3: '#79b0ba', tealLt: '#cfe6ea',
  ink: '#08141a', dim: '#9fc2c9', steel: '#687a82', steelLt: '#aebfc6',
  pale: '#cfdbe0', white: '#e8f2f4', slate: '#3a5560',
  copper: '#c0772f', copper7: '#95591f', copper1: '#f1ddc8',
  success: '#2f8f5b', warn: '#b8881f', danger: '#bf4a30', ember: '#f0a02f',
  gravel: '#6d6154', gravelLt: '#9a8b78', wood: '#7a5a3c',
  leaf: '#3fa66b', leafDk: '#25784a', fish: '#e08a3c', fish2: '#5aa9c4'
};

// Two backgrounds, because this unit happens on two sides of one pane of glass.
const WATER_BG = ['#0a2730', '#0e3b44'];   // looking into the tank
const ROOM_BG  = ['#141b21', '#232c33'];   // the desk, the log, the balance
const COPPER_BG = ['#1c1208', '#2e2113'];  // Honors

// ---------------------------------------------------------------- paint kit
// kit(id) hands a scene its own <defs> namespace. Bodies call k.glass(...) and get
// back url(#id-name) while the definition is collected for the <defs> block.
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

// The tank interior signature: suspended particulate and a few light shafts. This is
// what tells the eye "you are looking through water", the way stars() said "vacuum".
const waterColumn = (spec = '54,34,1.1 118,22,0.9 196,40,1.2 262,26,1 330,44,0.9 88,66,0.8 240,72,1 356,64,0.85') =>
  `<g>` + `<path d="M40 0 L88 96 M150 0 L188 96 M292 0 L322 96" stroke="${C.teal3}" stroke-width="12"`
  + ` opacity=".05" stroke-linecap="round"/>`
  + spec.trim().split(/\s+/).map(p => {
    const [x, y, r] = p.split(',').map(Number);
    return `<circle cx="${x}" cy="${y}" r="${r}" fill="${C.tealLt}" opacity="${r >= 1.1 ? .32 : .2}"/>`;
  }).join('') + `</g>`;

// The room counterpart: the shelf edge the desk scenes stand on.
const deskShelf = (y, x1 = 0, x2 = 400) =>
  `<rect x="${x1}" y="${y}" width="${x2 - x1}" height="${150 - y}" fill="#2b343b"/>`
  + `<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="${C.steelLt}" stroke-width="1" opacity=".28"/>`;

// Gravel bed. Deterministic from a seed so a scene redraws identically every frame.
const gravel = (yTop, seed = 7, x1 = 0, x2 = 400) => {
  let out = `<rect x="${x1}" y="${yTop}" width="${x2 - x1}" height="${150 - yTop}" fill="${C.gravel}"/>`;
  let s = seed;
  const rnd = () => (s = (s * 1103515245 + 12345) % 2147483648) / 2147483648;
  for (let i = 0; i < 46; i++) {
    const x = x1 + rnd() * (x2 - x1), y = yTop + 2 + rnd() * 14, r = 1.6 + rnd() * 2.4;
    out += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}" fill="${rnd() > .5 ? C.gravelLt : '#574c42'}" opacity=".85"/>`;
  }
  return out;
};

// A stem plant, leaves alternating up the stalk.
const plant = (x, base, h, tint = C.leaf) => {
  const leaves = [];
  for (let i = 0, y = -h * .3; y > -h + 4; i++, y -= h * .24) {
    const d = i % 2 ? 8 : -8;
    leaves.push(`<path d="M0 ${y.toFixed(1)} q${d} -2 ${d * .9} -8 q${-d} 1 ${-d * .9} 8z" fill="${i % 2 ? tint : C.leafDk}"/>`);
  }
  return `<g transform="translate(${x},${base})">`
    + `<path d="M0 0 V${-h}" fill="none" stroke="${C.leafDk}" stroke-width="2" stroke-linecap="round"/>`
    + leaves.join('') + `</g>`;
};

// A fish, drawn side-on and lit from above. dir -1 swims left.
const fish = (x, y, s = 1, { body = C.fish, dir = 1, mood = 'ok' } = {}) => {
  const eye = mood === 'sick' ? C.pale : C.ink;
  return `<g transform="translate(${x},${y}) scale(${dir * s},${s})">`
    + `<path d="M0 0 C-6 -8 -20 -10 -28 0 C-20 10 -6 8 0 0 Z" fill="${body}" opacity=".55"/>`
    + `<path d="M2 0 C-4 -7 -18 -9 -26 0 C-18 9 -4 7 2 0 Z" fill="${body}"/>`
    + `<path d="M-26 0 l-9 -6 v12 z" fill="${body}" opacity=".85"/>`
    + `<path d="M-12 -6 l4 -6 l7 6 z" fill="${body}" opacity=".7"/>`
    + `<path d="M-4 -5 C-10 -2 -10 2 -4 5" fill="none" stroke="#ffffff" stroke-width="1" opacity=".35"/>`
    + `<circle cx="-3" cy="-1.6" r="1.7" fill="${eye}"/>`
    + `</g>`;
};

// Rising bubbles from an 'x,y ...' list.
const bubbles = spec => `<g fill="none" stroke="${C.tealLt}" stroke-width="1.1" opacity=".55">`
  + spec.trim().split(/\s+/).map(p => {
    const [x, y] = p.split(',').map(Number);
    return `<circle cx="${x}" cy="${y}" r="2.4"/><circle cx="${x + 3}" cy="${y - 9}" r="1.7"/><circle cx="${x - 2}" cy="${y - 17}" r="1.2"/>`;
  }).join('') + `</g>`;

// Console readout box: dark screen, cool stroke, a light catch along the top lip.
const panelBox = (x, y, w, h, { r = 7, fill = C.ink, stroke = C.slate, sw = 1.8 } = {}) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`
  + `<path d="M${x + r} ${y + 1.5} H${x + w - r}" stroke="${C.tealLt}" stroke-width="1" opacity=".14"/>`;

// Flow arrow: solid where liquid moves, dashed where a number is passed on.
const flow = (x1, x2, y, { color = C.teal3, w = 2, dash, op = .9 } = {}) =>
  `<g opacity="${op}"><path d="M${x1} ${y} H${x2 - 8}" fill="none" stroke="${color}" stroke-width="${w}"`
  + ` stroke-linecap="round"${dash ? ` stroke-dasharray="${dash}"` : ''}/>`
  + `<path d="M${x2} ${y} l-9 -5 v10 z" fill="${color}"/></g>`;

// A graduated barrel with a plunger — the unit's signature tool. Ticks are real: one
// per unit of `ticks`, every fifth longer, because this whole unit is about the fact
// that the marks are what you may claim.
const syringe = (x, y, len, { fillFrac = .62, ticks = 20, tint = '#8ecad4', rot = 0 } = {}) => {
  const h = 22, bx = x, by = y - h / 2;
  let t = '';
  for (let i = 0; i <= ticks; i++) {
    const tx = bx + 6 + (len - 22) * (i / ticks), major = i % 5 === 0;
    t += `<line x1="${tx.toFixed(1)}" y1="${by + 2}" x2="${tx.toFixed(1)}" y2="${(by + (major ? 9 : 6)).toFixed(1)}"`
      + ` stroke="${C.slate}" stroke-width="${major ? 1.2 : .8}" opacity=".95"/>`;
  }
  const fillW = (len - 26) * fillFrac;
  return `<g transform="rotate(${rot} ${x} ${y})">`
    + `<rect x="${bx}" y="${by}" width="${len}" height="${h}" rx="4" fill="#dfeaee" stroke="${C.steelLt}" stroke-width="1.6"/>`
    + `<rect x="${bx + 4}" y="${by + 3}" width="${fillW.toFixed(1)}" height="${h - 6}" rx="2" fill="${tint}" opacity=".9"/>`
    + `<rect x="${(bx + 4 + fillW).toFixed(1)}" y="${by + 2}" width="5" height="${h - 4}" rx="2" fill="${C.steel}"/>`
    + `<rect x="${(bx + 9 + fillW).toFixed(1)}" y="${by + 9}" width="${Math.max(6, len - fillW - 30).toFixed(1)}" height="4" rx="2" fill="${C.steelLt}"/>`
    + `<rect x="${bx + len - 2}" y="${by + 7}" width="10" height="8" rx="3" fill="${C.steelLt}"/>`
    + `<path d="M${bx + len + 8} ${y} h16" stroke="${C.steelLt}" stroke-width="2.2" stroke-linecap="round"/>`
    + `<rect x="${bx + 3}" y="${by + 3}" width="3" height="${h - 6}" rx="1.5" fill="#ffffff" opacity=".5"/>`
    + t + `</g>`;
};

// A tall graduated cylinder, the density station's tool. `level` is 0..1 of the barrel.
const cylinder = (x, yTop, w, h, { level = .55, tint = '#4e9dab', block = null, k } = {}) => {
  const g = k ? k.glass('cylg', ['#20444e', '#2f6a76', '#79b0ba']) : '#2f6a76';
  const yL = yTop + h * (1 - level);
  let ticks = '';
  for (let i = 1; i < 10; i++) {
    const ty = yTop + h * (i / 10), major = i % 5 === 0;
    ticks += `<line x1="${x + w - (major ? 12 : 8)}" y1="${ty.toFixed(1)}" x2="${x + w - 2}" y2="${ty.toFixed(1)}"`
      + ` stroke="${C.pale}" stroke-width="${major ? 1.2 : .8}" opacity=".7"/>`;
  }
  return `<g>`
    + `<rect x="${x}" y="${yTop}" width="${w}" height="${h}" rx="4" fill="${g}" opacity=".35" stroke="${C.steelLt}" stroke-width="1.6"/>`
    + `<path d="M${x + 2} ${yL + 3} Q${x + w / 2} ${yL + 9} ${x + w - 2} ${yL + 3} L${x + w - 2} ${yTop + h - 2} L${x + 2} ${yTop + h - 2} Z" fill="${tint}" opacity=".62"/>`
    + (block ? `<rect x="${(x + w / 2 - block.w / 2).toFixed(1)}" y="${(yTop + h - 4 - block.h).toFixed(1)}" width="${block.w}" height="${block.h}" rx="2" fill="${block.fill}"/>` : '')
    + `<path d="M${x + 2} ${yL + 3} Q${x + w / 2} ${yL + 9} ${x + w - 2} ${yL + 3}" fill="none" stroke="${C.tealLt}" stroke-width="1.6"/>`
    + `<rect x="${x + 3}" y="${yTop + 4}" width="3" height="${h - 10}" rx="1.5" fill="#ffffff" opacity=".35"/>`
    + ticks + `</g>`;
};

// A ruled page — the log everybody else reads.
const notebook = (x, y, w, h, lines = 5) => {
  let l = '';
  for (let i = 1; i <= lines; i++) {
    const ly = y + (h / (lines + 1)) * i;
    l += `<line x1="${x + 10}" y1="${ly.toFixed(1)}" x2="${x + w - 10}" y2="${ly.toFixed(1)}" stroke="${C.steel}" stroke-width=".9" opacity=".5"/>`;
  }
  return `<g><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="#f2efe6" stroke="${C.steelLt}" stroke-width="1.4"/>`
    + `<line x1="${x + 8}" y1="${y}" x2="${x + 8}" y2="${y + h}" stroke="${C.danger}" stroke-width="1" opacity=".45"/>`
    + l + `</g>`;
};

// A test tube in a stand — the C.4 station's instrument.
const testTube = (x, yTop, h, tint) =>
  `<g><path d="M${x - 6} ${yTop} v${h - 7} a6 6 0 0 0 12 0 V${yTop} z" fill="${tint}" opacity=".72" stroke="${C.tealLt}" stroke-width="1.3"/>`
  + `<rect x="${x - 7.5}" y="${yTop - 3}" width="15" height="4" rx="2" fill="${C.steelLt}"/>`
  + `<rect x="${x - 4.5}" y="${yTop + 4}" width="2.5" height="${h - 16}" rx="1.2" fill="#ffffff" opacity=".4"/></g>`;

// Target board — the accuracy/precision figure, drawn small enough for a banner.
const targetBoard = (cx, cy, r, dots, dotColor = C.ember) =>
  `<g transform="translate(${cx},${cy})">`
  + `<circle r="${r}" fill="#f4f8f9" opacity=".92" stroke="${C.steelLt}" stroke-width="1.4"/>`
  + `<circle r="${(r * .66).toFixed(1)}" fill="none" stroke="${C.pale}" stroke-width="1.1"/>`
  + `<circle r="${(r * .33).toFixed(1)}" fill="#dcebee" stroke="${C.pale}" stroke-width="1"/>`
  + `<circle r="2" fill="${C.danger}"/>`
  + dots.map(([dx, dy]) => `<circle cx="${(dx * r).toFixed(1)}" cy="${(dy * r).toFixed(1)}" r="2.4" fill="${dotColor}"/>`).join('')
  + `</g>`;

// ---------------------------------------------------------------- scaffolding
// scene(id, opts) -> a complete 400x150 banner string.
//   caption  required mono strapline along the bottom
//   body     required k => shapes, drawn between background and scrim
//   theme    'water' (default, in the tank) | 'room' (on the desk) | 'copper' (Honors)
//   frame    override the frame stroke (e.g. danger red for a hazard scene)
function scene(id, { caption, body, theme = 'water', bg, frame, capColor }) {
  const honors = theme === 'copper';
  const [top, bot] = bg || (honors ? COPPER_BG : theme === 'room' ? ROOM_BG : WATER_BG);
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
    // Keep the scene subjects large enough to read at a glance without scaling the
    // frame or the bottom caption. This renderer serves the Unit 1 working cases only;
    // the separate Case File supplies its own stage markup.
    + `<g transform="translate(200 70) scale(1.1) translate(-200 -70)">`
    + art
    + `</g>`
    + `<rect y="102" width="400" height="48" fill="url(#${id}-scrim)"/>`
    + `<path d="M1 150 V9 A8 8 0 0 1 9 1 H391 A8 8 0 0 1 399 9 V150" fill="none"`
    + ` stroke="${frameColor}" stroke-width="1" opacity="${frameOp}"/>`
    + mono(16, 138, caption, { size: 10.5, fill: cap, anchor: 'start', ls: '.05em' })
    + `</svg>`;
}

export const SCENE_ART = {

  // ---------- C.1 read the tool ----------
  // The syringe, the bottle it came out of, and the water it is about to go into.
  'a-dechlor': scene('a-dechlor', { caption: 'DECHLORINATOR · READ IT, THEN LOG IT', body: k => {
    const bottle = k.glass('btl', ['#123c30', '#1f6a52', '#4fae86']);
    return waterColumn()
      + gravel(96, 11)
      + plant(28, 100, 46) + plant(46, 100, 32, '#57bd83')
      + fish(104, 84, .8, { body: C.fish2, dir: 1 })
      + bubbles('66,90')
      // the bottle on the rim, cap off
      + `<rect x="292" y="34" width="44" height="62" rx="7" fill="${bottle}" stroke="${C.teal3}" stroke-width="1.6"/>`
      + `<rect x="304" y="22" width="20" height="14" rx="3" fill="${C.steelLt}"/>`
      + `<rect x="298" y="44" width="32" height="24" rx="3" fill="#f2efe6" opacity=".92"/>`
      // Two lines inside the 24-unit label, spaced for the 8-unit floor rather than for the
      // 7 the second line used to be: 11 apart, both inside the rect.
      + mono(314, 51, 'DE-', { size: 8, fill: C.slate, w: 700 })
      + mono(314, 62, 'CHLOR', { size: 8, fill: C.slate })
      + `<rect x="296" y="40" width="4" height="52" rx="2" fill="#ffffff" opacity=".25"/>`
      // the cylinder the dose is actually read from, filled from the bottle and pouring
      // toward the tank. The reading is taken here, not from the bottle and not from a
      // syringe: a syringe is read at the plunger seal, and this unit's whole C.1 lesson
      // is the meniscus.
      + `<path d="M288 40 C268 42 250 40 238 36" fill="none" stroke="#6fb99a" stroke-width="2.6" stroke-linecap="round" opacity=".8"/>`
      + cylinder(196, 24, 46, 78, { level: .58, tint: '#8ecad4', k })
      + `<ellipse cx="219" cy="106" rx="26" ry="4" fill="#040c10" opacity=".35"/>`
      + flow(186, 148, 62, { dash: '3 5', op: .55 })
      + panelBox(120, 28, 62, 24)
      + mono(151, 44, '? mL', { size: 12, w: 700, fill: C.white });
  } }),

  // The dosing cap, sat between two marks. A magnified inset says "this is the digit".
  'a-plantfood': scene('a-plantfood', { caption: 'PLANT FOOD · THE LEVEL IS BETWEEN THE MARKS', body: k => {
    const cap = k.glass('cap', ['#2a1c3a', '#4b3566', '#7d5fa0']);
    return waterColumn('40,30,1 130,20,1.1 210,44,.9 300,28,1 360,50,1.1')
      + gravel(98, 23)
      + plant(340, 102, 52) + plant(360, 102, 38, '#57bd83')
      + plant(320, 102, 30)
      + fish(300, 52, .7, { body: C.leaf, dir: -1 })
      // the cap, big, with a real graduated shoulder
      + `<path d="M92 26 h74 l-7 62 a30 8 0 0 1 -60 0 z" fill="${cap}" stroke="${C.steelLt}" stroke-width="1.8"/>`
      + `<ellipse cx="129" cy="26" rx="37" ry="8" fill="#8a6cae" stroke="${C.steelLt}" stroke-width="1.6"/>`
      + `<path d="M96 52 a33 8 0 0 0 66 0 v34 a30 8 0 0 1 -60 0 z" fill="#6fb99a" opacity=".72"/>`
      + `<path d="M96 52 a33 8 0 0 0 66 0" fill="none" stroke="#b6e5cf" stroke-width="1.8"/>`
      + `<g stroke="${C.white}" stroke-width="1.3" opacity=".8">`
      + `<path d="M150 38 h14"/><path d="M148 52 h16"/><path d="M146 66 h14"/><path d="M144 80 h16"/></g>`
      + mono(178, 41, '10', { size: 8, anchor: 'start', fill: C.pale })
      + mono(178, 55, '7.5', { size: 8, anchor: 'start', fill: C.pale })
      + mono(178, 69, '5', { size: 8, anchor: 'start', fill: C.pale })
      + mono(178, 83, '2.5', { size: 8, anchor: 'start', fill: C.pale })
      // magnifier over the meniscus
      + `<circle cx="248" cy="52" r="27" fill="#0d2b33" stroke="${C.teal3}" stroke-width="2.4"/>`
      + `<path d="M228 54 a20 6 0 0 0 40 0" fill="none" stroke="#b6e5cf" stroke-width="2.4"/>`
      + `<g stroke="${C.white}" stroke-width="1.4" opacity=".85"><path d="M236 42 h24"/><path d="M236 66 h24"/></g>`
      + `<line x1="268" y1="72" x2="284" y2="88" stroke="${C.teal3}" stroke-width="4" stroke-linecap="round"/>`;
  } }),

  // The hospital bucket: one fish, an air stone, and a dose that has a window.
  'a-meds': scene('a-meds', { caption: 'HOSPITAL BUCKET · THE DOSE HAS A WINDOW', body: k => {
    const pail = k.glass('pail', ['#123039', '#1f5563', '#4a93a3']);
    return `<g opacity=".5">${waterColumn('34,26,.9 356,34,1')}</g>`
      + deskShelf(112)
      // the bucket, cut away so the fish reads
      + `<path d="M116 32 h132 l-13 76 h-106 z" fill="${pail}" stroke="${C.steelLt}" stroke-width="1.8"/>`
      + `<ellipse cx="182" cy="32" rx="66" ry="9" fill="#2b6c7c" stroke="${C.steelLt}" stroke-width="1.6"/>`
      + `<path d="M120 46 h124 l-11 62 h-102 z" fill="#3f8fa0" opacity=".55"/>`
      + `<path d="M124 46 a58 7 0 0 0 116 0" fill="none" stroke="${C.tealLt}" stroke-width="1.6" opacity=".8"/>`
      + fish(196, 76, .95, { body: C.fish, dir: -1, mood: 'sick' })
      + bubbles('146,96 158,100')
      + `<circle cx="150" cy="102" r="5" fill="${C.steel}"/>`
      + `<path d="M150 102 C126 96 118 74 112 58" fill="none" stroke="${C.steelLt}" stroke-width="2" opacity=".7"/>`
      // the syringe on the shelf beside it, plus the window it has to land in
      + syringe(258, 62, 104, { fillFrac: .44, ticks: 16, tint: '#d9a2c4' })
      + panelBox(262, 80, 116, 30)
      + mono(320, 91, 'THERAPEUTIC WINDOW', { size: 6.5, fill: C.dim, ls: '.06em' })
      + `<rect x="272" y="96" width="96" height="9" rx="4" fill="#1c3b44"/>`
      + `<rect x="304" y="96" width="30" height="9" rx="4" fill="${C.success}" opacity=".85"/>`;
  } }),

  // ---------- C.2 significant figures ----------
  // The log page itself: the number, and the next reader's hand reaching for it.
  'b-log': scene('b-log', { theme: 'room', caption: 'THE LOG · THE DIGITS ARE THE CLAIM', body: k => {
    const lamp = k.rad('lamp', [[0, '#ffd89b', .5], [1, '#ffd89b', 0]], { cx: '50%', cy: '50%', r: '50%' });
    return `<circle cx="120" cy="20" r="120" fill="${lamp}"/>`
      + deskShelf(116)
      + notebook(46, 24, 152, 84, 6)
      + mono(60, 44, 'TANK LOG', { size: 8.5, anchor: 'start', fill: C.slate, w: 700, ls: '.1em' })
      + mono(60, 62, '4.0 mL', { size: 15, anchor: 'start', fill: '#1d3d47', w: 700 })
      + mono(60, 78, '4.00 mL', { size: 15, anchor: 'start', fill: C.danger, w: 700 })
      + `<line x1="58" y1="73.5" x2="140" y2="73.5" stroke="${C.danger}" stroke-width="1.4" opacity=".8"/>`
      + mono(150, 78, '?', { size: 17, fill: C.danger, w: 700 })
      // pencil
      + `<g transform="rotate(-28 214 62)"><rect x="188" y="56" width="70" height="9" rx="2" fill="${C.ember}"/>`
      + `<path d="M188 56 l-13 4.5 l13 4.5 z" fill="#f2efe6"/><path d="M180 58.8 l-5 1.7 l5 1.7 z" fill="#3a3a3a"/>`
      + `<rect x="252" y="56" width="10" height="9" fill="#c96a8a"/></g>`
      // the next reader's syringe, waiting to be filled from that number
      + flow(266, 316, 62, { dash: '3 5', op: .55 })
      + syringe(300, 62, 84, { fillFrac: .5, ticks: 12, tint: '#8ecad4' })
      + mono(334, 96, 'NEXT WATER CHANGE', { size: 6.5, fill: C.dim, ls: '.06em' });
  } }),

  // Tape measure on the glass: the box's number vs the tank's number.
  'b-volume': scene('b-volume', { theme: 'room', caption: 'THE BOX SAYS 20 · THE TAPE SAYS OTHERWISE', body: k => {
    const water = k.lin('w', [[0, '#3f93a4', .8], [1, '#1d5b66', .9]]);
    return deskShelf(118)
      // the tank, seen from the front, with the water line short of the rim
      + `<rect x="40" y="26" width="216" height="84" rx="3" fill="#0e2b33" stroke="${C.steelLt}" stroke-width="2.4"/>`
      + `<rect x="44" y="44" width="208" height="62" fill="${water}"/>`
      + `<line x1="44" y1="44" x2="252" y2="44" stroke="${C.tealLt}" stroke-width="1.6" opacity=".8"/>`
      + gravel(96, 31, 44, 252)
      + plant(76, 100, 40) + plant(216, 100, 34, '#57bd83')
      + fish(150, 66, .75, { body: C.fish2 }) + fish(198, 82, .6, { body: C.fish, dir: -1 })
      + `<rect x="40" y="26" width="216" height="6" rx="2" fill="${C.steel}"/>`
      // the tape measure laid along the base, with real ticks
      + `<rect x="40" y="114" width="216" height="14" rx="2" fill="${C.ember}" stroke="${C.copper7}" stroke-width="1.2"/>`
      + (() => { let t = ''; for (let i = 0; i <= 24; i++) { const x = 44 + i * 8.7; t += `<line x1="${x.toFixed(1)}" y1="114" x2="${x.toFixed(1)}" y2="${i % 6 === 0 ? 124 : 120}" stroke="#3a2a12" stroke-width="${i % 6 === 0 ? 1.2 : .7}"/>`; } return t; })()
      // the box's claim vs the measurement
      + panelBox(276, 34, 106, 30)
      + mono(329, 47, 'BOX SAYS', { size: 7, fill: C.dim, ls: '.08em' })
      + mono(329, 59, '20 gal', { size: 13, fill: C.warn, w: 700 })
      + panelBox(276, 70, 106, 30, { stroke: C.teal })
      + mono(329, 83, 'TAPE SAYS', { size: 7, fill: C.dim, ls: '.08em' })
      + mono(329, 95, '18.4 gal', { size: 13, fill: C.white, w: 700 });
  } }),

  // Two honest inputs going into a calculator that hands back ten dishonest digits.
  'b-pergallon': scene('b-pergallon', { theme: 'room', caption: 'TWO DIGITS IN · TEN DIGITS OUT', body: k => {
    const scr = k.lin('scr', [[0, '#123c46'], [1, '#08202a']]);
    return deskShelf(120)
      + panelBox(28, 30, 96, 30)
      + mono(76, 43, 'PER GALLON', { size: 7, fill: C.dim, ls: '.07em' })
      + mono(76, 55, '5.0 mL', { size: 13, fill: C.white, w: 700 })
      + panelBox(28, 68, 96, 30)
      + mono(76, 81, 'GALLONS', { size: 7, fill: C.dim, ls: '.07em' })
      + mono(76, 93, '18.4', { size: 13, fill: C.white, w: 700 })
      + flow(130, 168, 64, { dash: '3 5', op: .6 })
      // the calculator
      + `<rect x="174" y="22" width="92" height="86" rx="8" fill="#2c3941" stroke="${C.steelLt}" stroke-width="1.6"/>`
      + `<rect x="182" y="30" width="76" height="22" rx="3" fill="${scr}" stroke="${C.slate}" stroke-width="1.2"/>`
      + mono(252, 45, '92.0000', { size: 9, anchor: 'end', fill: C.success, w: 700 })
      + (() => { let b = ''; for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) b += `<rect x="${184 + c * 18}" y="${58 + r * 16}" width="14" height="12" rx="2.5" fill="#455661"/>`; return b; })()
      + flow(272, 306, 64, { dash: '3 5', op: .6 })
      // what actually belongs in the log
      + panelBox(312, 44, 74, 40, { stroke: C.teal })
      + mono(349, 58, 'LOG IT AS', { size: 7, fill: C.dim, ls: '.08em' })
      + mono(349, 74, '92 mL', { size: 15, fill: C.white, w: 700 });
  } }),

  // ---------- C.3 density by displacement ----------
  // Balance, then the two cylinders. This is the whole method in one banner.
  'c-ornament': scene('c-ornament', { caption: 'MASS IT · DISPLACE IT · NAME IT', body: k => {
    return waterColumn('44,28,1 300,24,.9 370,52,1.1')
      // the ornament: a little pagoda, unlabelled metal
      + `<g transform="translate(58,58)">`
      + `<path d="M-22 0 h44 l-8 10 h-28 z" fill="#8e9aa2"/>`
      + `<path d="M-26 -2 h52 l-6 -8 h-40 z" fill="#b3bfc6"/>`
      + `<path d="M-16 -10 h32 l-5 12 h-22 z" fill="#8e9aa2"/>`
      + `<path d="M-19 -12 h38 l-5 -7 h-28 z" fill="#b3bfc6"/>`
      + `<path d="M-9 -19 h18 l-3 10 h-12 z" fill="#8e9aa2"/>`
      + `<path d="M-11 -21 h22 l-4 -6 h-14 z" fill="#c8d3d9"/>`
      + `<rect x="-2" y="-33" width="4" height="7" fill="#c8d3d9"/>`
      + `<rect x="-24" y="10" width="48" height="6" rx="2" fill="#6d787f"/></g>`
      + mono(58, 90, '? METAL', { size: 8, fill: C.warn, ls: '.1em', w: 700 })
      // balance
      + `<rect x="112" y="72" width="72" height="24" rx="5" fill="#39474f" stroke="${C.steelLt}" stroke-width="1.4"/>`
      + `<rect x="104" y="64" width="88" height="9" rx="3" fill="#5b6b74"/>`
      + panelBox(122, 78, 52, 14, { r: 3 })
      + mono(148, 89, '38.6 g', { size: 8.5, fill: C.success, w: 700 })
      + flow(196, 224, 66, { dash: '3 5', op: .6 })
      // the two cylinders: before and after
      + cylinder(232, 18, 30, 68, { level: .52, k })
      + mono(247, 98, 'BEFORE', { size: 7, fill: C.dim, ls: '.08em' })
      + cylinder(300, 18, 30, 68, { level: .70, tint: '#4e9dab', block: { w: 15, h: 18, fill: '#7d878e' } })
      + mono(315, 98, 'AFTER', { size: 7, fill: C.dim, ls: '.08em' })
      + `<path d="M266 40 h30" stroke="${C.ember}" stroke-width="1.4" stroke-dasharray="3 4"/>`
      + `<path d="M266 28 h30" stroke="${C.ember}" stroke-width="1.4" stroke-dasharray="3 4"/>`
      + mono(374, 40, 'ΔV', { size: 12, fill: C.ember, w: 700 });
  } }),

  // The gravel vac turns up a pendant. Sold as silver; the density will say.
  'c-pendant': scene('c-pendant', { caption: 'SOLD AS SILVER · THE PLATING IS SCRATCHED', body: k => {
    const glow = k.rad('gl', [[0, '#ffe6a8', .55], [1, '#ffe6a8', 0]], { cx: '50%', cy: '50%', r: '50%' });
    return waterColumn()
      + gravel(84, 41)
      + plant(348, 88, 44) + plant(370, 88, 30, '#57bd83')
      + fish(320, 40, .7, { body: C.fish2, dir: -1 })
      // the siphon tube coming down into the gravel
      + `<path d="M40 -6 C44 24 34 44 44 70" fill="none" stroke="${C.steelLt}" stroke-width="9" opacity=".55"/>`
      + `<path d="M40 -6 C44 24 34 44 44 70" fill="none" stroke="#bfe0e6" stroke-width="5" opacity=".45"/>`
      + bubbles('40,58 50,66')
      // the pendant, half out of the gravel, catching the light
      + `<circle cx="176" cy="80" r="34" fill="${glow}"/>`
      + `<g transform="translate(176,78) rotate(-14)">`
      + `<circle r="15" fill="#c9d3d8"/><circle r="15" fill="none" stroke="#8c979e" stroke-width="1.6"/>`
      + `<circle r="9" fill="#aab6bd"/>`
      + `<path d="M-4 -14 a14 14 0 0 1 12 4" fill="none" stroke="#ffffff" stroke-width="2.2" opacity=".7"/>`
      // the scratch, showing the base metal underneath
      + `<path d="M-8 6 l11 -9" stroke="${C.copper}" stroke-width="2.6" stroke-linecap="round"/>`
      + `<circle cx="0" cy="-19" r="4.5" fill="none" stroke="#c9d3d8" stroke-width="2.6"/></g>`
      + mono(176, 30, 'PLATED?', { size: 9, fill: C.warn, ls: '.1em', w: 700 })
      + `<path d="M176 36 V56" stroke="${C.warn}" stroke-width="1.2" stroke-dasharray="3 4" opacity=".7"/>`
      // the balance waiting on the rim
      + `<rect x="240" y="60" width="66" height="22" rx="5" fill="#39474f" stroke="${C.steelLt}" stroke-width="1.4"/>`
      + `<rect x="234" y="53" width="80" height="8" rx="3" fill="#5b6b74"/>`
      + panelBox(249, 65, 48, 13, { r: 3 })
      + mono(273, 75, '? g', { size: 8, fill: C.dim, w: 700 });
  } }),

  // Plant weights: almost always lead, sat in soft water for months.
  'c-anchor': scene('c-anchor', { caption: 'PLANT WEIGHTS · USUALLY LEAD, ALWAYS UNDERWATER', body: k => {
    return waterColumn('60,24,1 150,32,.9 268,20,1.1 350,40,1')
      + gravel(92, 53)
      // three stems, each pinned by a wrapped strip of grey metal
      + plant(96, 96, 54) + plant(150, 96, 46, '#57bd83') + plant(206, 96, 50)
      + `<g fill="#8c949a" stroke="#5f676c" stroke-width="1.1">`
      + `<rect x="88" y="88" width="17" height="9" rx="2.5"/>`
      + `<rect x="142" y="88" width="17" height="9" rx="2.5"/>`
      + `<rect x="198" y="88" width="17" height="9" rx="2.5"/></g>`
      + `<g stroke="#6e777d" stroke-width=".9" opacity=".9">`
      + `<path d="M93 88 v9 M99 88 v9 M147 88 v9 M153 88 v9 M203 88 v9 M209 88 v9"/></g>`
      // the unlabelled bag they came from, on the rim
      + `<path d="M262 30 h74 l-6 62 h-62 z" fill="#3b4a52" opacity=".9" stroke="${C.steelLt}" stroke-width="1.3"/>`
      + `<rect x="272" y="24" width="54" height="8" rx="3" fill="#5b6b74"/>`
      + `<rect x="276" y="44" width="46" height="26" rx="2" fill="#f2efe6" opacity=".18"/>`
      + mono(299, 60, 'NO LABEL', { size: 7.5, fill: C.dim, ls: '.08em' })
      + `<g fill="#8c949a" stroke="#5f676c" stroke-width="1"><rect x="280" y="74" width="14" height="8" rx="2.5"/><rect x="300" y="76" width="14" height="8" rx="2.5"/></g>`
      // one on the balance
      + `<rect x="348" y="70" width="46" height="20" rx="5" fill="#39474f" stroke="${C.steelLt}" stroke-width="1.3"/>`
      + `<rect x="344" y="64" width="54" height="7" rx="3" fill="#5b6b74"/>`
      + mono(371, 84, '? g', { size: 8, fill: C.dim, w: 700 });
  } }),

  // ---------- C.4 accuracy vs precision ----------
  // Five drop-kit runs against the shop's number: two boards, side by side.
  'd-dropkit': scene('d-dropkit', { theme: 'room', caption: 'FIVE RUNS · ONE REFERENCE', body: k => {
    return deskShelf(120)
      // the kit: five tubes, five slightly different colours
      + `<rect x="24" y="70" width="104" height="12" rx="3" fill="#39474f" stroke="${C.steelLt}" stroke-width="1.2"/>`
      + testTube(38, 34, 40, '#e8c34a') + testTube(60, 34, 40, '#e2b83f')
      + testTube(82, 34, 40, '#eac957') + testTube(104, 34, 40, '#dfb238')
      + `<circle cx="122" cy="30" r="5" fill="${C.teal3}" opacity=".8"/>`
      + `<path d="M122 34 v10" stroke="${C.teal3}" stroke-width="2"/>`
      + mono(76, 96, 'YOUR KIT ×5', { size: 7.5, fill: C.dim, ls: '.08em' })
      // the two boards the whole station is about
      + targetBoard(212, 56, 34, [[.06, -.1], [-.08, .05], [.02, .12], [-.04, -.06], [.09, .03]], C.success)
      + mono(212, 102, 'TIGHT + CENTRED', { size: 7, fill: C.dim, ls: '.06em' })
      + targetBoard(318, 56, 34, [[.5, .38], [.58, .46], [.46, .5], [.54, .42], [.6, .36]], C.danger)
      + mono(318, 102, 'TIGHT + SHIFTED', { size: 7, fill: C.dim, ls: '.06em' })
      + `<path d="M256 56 h24" stroke="${C.steelLt}" stroke-width="1.2" stroke-dasharray="3 4" opacity=".6"/>`
      + mono(268, 40, 'or', { size: 9, fill: C.dim });
  } }),

  // The pen meter: two decimals of display, and no promise that either is real.
  'd-penmeter': scene('d-penmeter', { theme: 'room', caption: 'RESOLUTION IS NOT PRECISION', body: k => {
    const scr = k.lin('scr', [[0, '#1a4a52'], [1, '#07222a']]);
    return deskShelf(122)
      // the beaker it keeps getting dipped into
      + `<path d="M34 40 h58 v50 a10 8 0 0 1 -58 0 z" fill="#123039" stroke="${C.steelLt}" stroke-width="1.5"/>`
      + `<path d="M34 52 h58 v38 a10 8 0 0 1 -58 0 z" fill="#3f8fa0" opacity=".6"/>`
      + `<path d="M36 52 a27 5 0 0 0 54 0" fill="none" stroke="${C.tealLt}" stroke-width="1.5"/>`
      + `<path d="M34 40 h58" stroke="${C.steelLt}" stroke-width="1.5"/>`
      + mono(63, 104, 'SAME SAMPLE', { size: 7, fill: C.dim, ls: '.07em' })
      // the pen meter, dipped
      + `<g transform="rotate(16 140 60)">`
      + `<rect x="128" y="10" width="26" height="72" rx="6" fill="#37454d" stroke="${C.steelLt}" stroke-width="1.5"/>`
      + `<rect x="132" y="16" width="18" height="16" rx="2.5" fill="${scr}" stroke="${C.slate}" stroke-width="1"/>`
      + mono(141, 28, '0.47', { size: 7, fill: C.success, w: 700 })
      + `<rect x="134" y="38" width="14" height="5" rx="2" fill="#4d5f6a"/>`
      + `<rect x="135" y="82" width="12" height="26" rx="3" fill="#8c979e"/>`
      + `<rect x="137" y="104" width="8" height="8" rx="2" fill="${C.ember}"/></g>`
      // five readings that do not agree
      + panelBox(196, 22, 186, 74)
      + mono(206, 38, 'FIVE DIPS', { size: 7.5, anchor: 'start', fill: C.dim, ls: '.08em' })
      + ['0.47', '0.52', '0.44', '0.55', '0.46'].map((v, i) =>
        mono(212 + i * 36, 58, v, { size: 10, fill: i % 2 ? C.warn : C.white, w: 700 })).join('')
      + `<line x1="206" y1="68" x2="372" y2="68" stroke="${C.slate}" stroke-width="1"/>`
      + mono(206, 86, 'REFERENCE 0.50', { size: 8, anchor: 'start', fill: C.teal3 })
      + `<circle cx="352" cy="82" r="9" fill="none" stroke="${C.danger}" stroke-width="2"/>`
      + mono(352, 86, '?', { size: 11, fill: C.danger, w: 700 });
  } }),

  // Strips that spent a summer in a car. The pads are the evidence.
  'd-strips': scene('d-strips', { theme: 'room', caption: 'A SUMMER IN A HOT CAR', body: k => {
    const sun = k.rad('sun', [[0, '#ffb347', .5], [1, '#ffb347', 0]], { cx: '50%', cy: '50%', r: '50%' });
    return `<circle cx="66" cy="24" r="86" fill="${sun}"/>`
      + deskShelf(120)
      // the car window and the bottle on the dash
      + `<path d="M22 26 h96 l14 54 h-110 z" fill="#16242b" stroke="${C.steelLt}" stroke-width="1.6"/>`
      + `<path d="M28 32 h84 l11 42 h-95 z" fill="#2d4a55" opacity=".75"/>`
      + `<path d="M34 74 l64 -40" stroke="#ffffff" stroke-width="6" opacity=".12"/>`
      + `<rect x="60" y="52" width="24" height="26" rx="4" fill="#c9d3d8" stroke="#8c979e" stroke-width="1.2"/>`
      + `<rect x="66" y="46" width="12" height="8" rx="2.5" fill="${C.ember}"/>`
      + mono(72, 96, 'DASHBOARD', { size: 7, fill: C.dim, ls: '.07em' })
      + `<g stroke="${C.ember}" stroke-width="1.6" stroke-linecap="round" opacity=".8">`
      + `<path d="M136 34 h14"/><path d="M136 46 h20"/><path d="M136 58 h12"/></g>`
      // the five strips, pads uneven
      + `<g>` + [0, 1, 2, 3, 4].map(i => {
        const x = 178 + i * 42;
        const pads = ['#c9a83c#d8b84a#b89a30', '#a88f3c#c9a83c#8f7828', '#d8c65c#e2d070#c9b44a',
          '#8f7828#a88f3c#6e5c1e', '#c9a83c#b89a30#d8b84a'][i].split('#').filter(Boolean);
        return `<rect x="${x}" y="26" width="18" height="66" rx="2" fill="#f2efe6" stroke="${C.steelLt}" stroke-width="1"/>`
          + pads.map((c, j) => `<rect x="${x + 2}" y="${32 + j * 19}" width="14" height="15" rx="1.5" fill="#${c}"/>`).join('');
      }).join('') + `</g>`
      + mono(280, 106, 'FIVE STRIPS · SAME WATER', { size: 7, fill: C.dim, ls: '.06em' });
  } }),

  // ---------- Honors ----------
  // The uncertainty bars of two candidate metals, overlapping or not.
  'h1-sizecall': scene('h1-sizecall', { theme: 'copper', caption: 'CAN THIS SAMPLE TELL THEM APART?', body: k => {
    const bar = k.lin('bar', [[0, '#e0a45e'], [1, '#95591f']], true);
    return `<g opacity=".35">${deskShelf(124)}</g>`
      // balance with a ± on the readout
      + `<rect x="26" y="60" width="76" height="26" rx="5" fill="#3a2c1c" stroke="${C.copper}" stroke-width="1.4"/>`
      + `<rect x="18" y="52" width="92" height="9" rx="3" fill="#5b452c"/>`
      + panelBox(36, 66, 56, 15, { r: 3, fill: '#1a1108', stroke: C.copper7 })
      + mono(64, 78, '38.6 ±0.1', { size: 7.5, fill: C.ember, w: 700 })
      + mono(64, 98, 'BALANCE', { size: 7, fill: '#c39a6a', ls: '.08em' })
      // the density axis with two candidate windows on it
      + `<line x1="140" y1="76" x2="376" y2="76" stroke="#c39a6a" stroke-width="1.4"/>`
      + `<g stroke="#c39a6a" stroke-width="1.1" opacity=".8">`
      + `<path d="M152 76 v6"/><path d="M212 76 v6"/><path d="M272 76 v6"/><path d="M332 76 v6"/></g>`
      + mono(152, 94, '7.0', { size: 7, fill: '#c39a6a' })
      + mono(272, 94, '8.0', { size: 7, fill: '#c39a6a' })
      + mono(258, 34, 'g/mL', { size: 7, fill: '#c39a6a', ls: '.1em' })
      // zinc window, iron window, and your measurement's spread across them
      + `<rect x="160" y="52" width="16" height="18" rx="3" fill="${C.copper}" opacity=".55"/>`
      + mono(168, 46, 'Zn', { size: 8.5, fill: C.copper1, w: 700 })
      + `<rect x="304" y="52" width="16" height="18" rx="3" fill="${C.copper}" opacity=".55"/>`
      + mono(312, 46, 'Fe', { size: 8.5, fill: C.copper1, w: 700 })
      + `<rect x="188" y="60" width="118" height="9" rx="4.5" fill="${bar}" opacity=".9"/>`
      + `<path d="M188 56 v17 M306 56 v17" stroke="${C.copper1}" stroke-width="2" stroke-linecap="round"/>`
      + mono(247, 22, 'YOUR ± SPREAD', { size: 7.5, fill: C.copper1, ls: '.08em', w: 700 });
  } }),

  // The two cures: replace the reagent (scatter) or cross-check outside (bias).
  'h2-kitcall': scene('h2-kitcall', { theme: 'copper', caption: 'SCATTER AND BIAS HAVE DIFFERENT CURES', body: k => {
    return `<g opacity=".35">${deskShelf(124)}</g>`
      + targetBoard(86, 46, 30, [[.5, -.12], [-.44, .22], [.1, .54], [-.2, -.5], [.16, -.2]], C.ember)
      + mono(86, 88, 'SCATTER', { size: 8, fill: C.copper1, ls: '.1em', w: 700 })
      + mono(86, 99, 'replace the reagent', { size: 7, fill: '#c39a6a' })
      + targetBoard(314, 46, 30, [[.52, .4], [.6, .48], [.48, .52], [.56, .44], [.62, .38]], C.danger)
      + mono(314, 88, 'BIAS', { size: 8, fill: C.copper1, ls: '.1em', w: 700 })
      + mono(314, 99, 'cross-check outside', { size: 7, fill: '#c39a6a' })
      // the statistic that tells them apart
      + panelBox(158, 30, 84, 44, { fill: '#1a1108', stroke: C.copper7 })
      + mono(200, 46, 's =', { size: 10, fill: C.copper1, w: 700 })
      + mono(200, 62, '?', { size: 16, fill: C.ember, w: 700 })
      + mono(200, 88, 'ONE NUMBER', { size: 6.5, fill: '#c39a6a', ls: '.08em' });
  } }),

  // ---------- Capstone ----------
  // The bucket, the tank, and the one decision that connects them.
  'cap-waterchange': scene('cap-waterchange', { caption: 'SIX FISH · ONE CALL', body: k => {
    const water = k.lin('w', [[0, '#3f93a4', .8], [1, '#1d5b66', .95]]);
    const pail = k.glass('pail', ['#123039', '#1f5563', '#4a93a3']);
    return `<g opacity=".7">${waterColumn('40,20,.9 360,28,1')}</g>`
      + deskShelf(120)
      // the tank, freshly refilled
      + `<rect x="20" y="26" width="184" height="86" rx="3" fill="#0e2b33" stroke="${C.steelLt}" stroke-width="2.2"/>`
      + `<rect x="24" y="42" width="176" height="66" fill="${water}"/>`
      + `<line x1="24" y1="42" x2="200" y2="42" stroke="${C.tealLt}" stroke-width="1.6" opacity=".85"/>`
      + gravel(96, 61, 24, 200)
      + plant(52, 100, 44) + plant(170, 100, 38, '#57bd83') + plant(184, 100, 26)
      + bubbles('118,92')
      + `<rect x="20" y="26" width="184" height="6" rx="2" fill="${C.steel}"/>`
      // the hose still hanging in
      + `<path d="M150 -4 C158 16 140 28 148 46" fill="none" stroke="${C.steelLt}" stroke-width="7" opacity=".5"/>`
      // the bucket of fish waiting on the shelf
      + `<path d="M236 44 h116 l-11 66 h-94 z" fill="${pail}" stroke="${C.steelLt}" stroke-width="1.8"/>`
      + `<ellipse cx="294" cy="44" rx="58" ry="8" fill="#2b6c7c" stroke="${C.steelLt}" stroke-width="1.5"/>`
      + `<path d="M240 56 h108 l-9 54 h-90 z" fill="#3f8fa0" opacity=".55"/>`
      + fish(288, 72, .62, { body: C.fish, dir: -1 }) + fish(320, 86, .55, { body: C.fish2 })
      + fish(272, 92, .5, { body: C.leaf, dir: -1 }) + fish(316, 64, .48, { body: C.fish2, dir: -1 })
      + fish(258, 78, .45, { body: C.fish }) + fish(300, 100, .42, { body: C.fish, dir: -1 })
      + bubbles('256,102')
      + mono(294, 34, 'WAITING', { size: 8, fill: C.ember, ls: '.12em', w: 700 })
      // the question mark bridging the two
      + `<path d="M206 70 h24" stroke="${C.ember}" stroke-width="1.6" stroke-dasharray="3 4"/>`
      + mono(218, 60, '?', { size: 15, fill: C.ember, w: 700 });
  } })
};

export function sceneArt(id) { return SCENE_ART[id] || ''; }
