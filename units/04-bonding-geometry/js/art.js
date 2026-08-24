// art.js — Unit 4 scene illustrations ("Move-In Week": your first apartment).
// One inline SVG per SCENARIO id (see model.js), rendered into the cockpit's mission
// screen via x-html. The only file in this unit written from scratch for the port.
//
// Built on the same scaffolding as units_new/01-practices-matter/js/art.js and
// units_new/05-the-mole/js/art.js, because the three share a shell and a set that
// disagrees with itself reads as three products:
//   • viewBox is 400x150 — the 8:3 the .mission-frame is sized to.
//   • Every gradient/pattern/clip id is prefixed with the scene id. Alpine keeps all
//     station panels in the DOM (x-show, not x-if), so the SVGs coexist and an unprefixed
//     id would bleed from one scene into another. kit() does the prefixing.
//   • Lighting is from the upper left everywhere, so a bottle in one banner is shaded
//     like the bottle in the next.
//   • Keep the subject above y=100. Below that the caption scrim fades the art out.
//   • Banners are aria-hidden: the scenario's goal text directly below is the
//     authoritative description, so announcing the art too is redundant.
//
// Where Unit 1's set says "in the tank" with waterColumn() and "on the desk" with
// deskShelf(), this one says "under the sink" with sinkCupboard() and "on the counter"
// with counterTop(). That is how a scene declares which half of the apartment it is in
// without spending a word of the caption on it: the counter is where the work happens,
// the cupboard under the sink is where the consequence lands.
//
// The molecule glyphs in the C.7(C) scenes use the same element colours and the same pale
// lone-pair lobe with two dark electrons in it as the 3D viewer in js/vsepr.js. A banner
// that coloured oxygen differently from the thing spinning on the bench beside it would be
// teaching two facts about one molecule.
//
// Palette tracks tokens.css: teal for the fixtures and the tools, copper for the three
// Honors jobs, semantic red/amber for hazards, warm neutrals for the apartment itself.

const MONO = "'JetBrains Mono', ui-monospace, monospace";

const C = {
  teal: '#2a7d8a', teal7: '#1d5b66', teal3: '#79b0ba', tealLt: '#cfe6ea',
  ink: '#08141a', dim: '#9fc2c9', steel: '#687a82', steelLt: '#aebfc6',
  pale: '#cfdbe0', white: '#e8f2f4', slate: '#3a5560',
  copper: '#c0772f', copper7: '#95591f', copper1: '#f1ddc8',
  success: '#2f8f5b', warn: '#b8881f', danger: '#bf4a30', ember: '#f0a02f',
  // the apartment itself
  worktop: '#584e44', worktopLt: '#7c7062', tile: '#33454e', grout: '#4a5f68',
  enamel: '#dfe7e4', card: '#f2efe6', wood: '#6b4f34', woodLt: '#8f6c47',
  brass: '#b8913f', rust: '#8a5230'
};

// Element colours, lifted from js/vsepr.js so the banner and the 3D bench agree.
const EL = {
  H: '#e8e8e8', C: '#404040', N: '#3050f8', O: '#ff3020', F: '#7fe04f',
  Cl: '#35c635', Be: '#b6f000', B: '#ffb5b5', S: '#ffce1a', P: '#ff8000'
};
const LONE_SHELL = '#6f93b0', LONE_DOT = '#2f5d7a';
// Sodium is not in the viewer's colour table (nothing in MOLECULES has it as an atom), so
// the h1 banner takes CPK violet for the one place an ion pair is drawn.
const SODIUM = '#ab5cf2';

// Three backgrounds, because this unit happens in three places.
const SINK_BG    = ['#0c1e24', '#16303a'];   // inside the cupboard under the sink
const COUNTER_BG = ['#131c22', '#25313a'];   // out on the kitchen counter
const COPPER_BG  = ['#1c1208', '#2e2113'];   // Honors

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

// ---- signature 1: under the sink ----
// The cupboard the bottles came out of and go back into. Board back wall, the P-trap
// coming down out of the sink above, and the cupboard floor the containers stand on.
// This is the "you are looking at the consequence" signature.
const sinkCupboard = (floor = 100, { trap = true } = {}) =>
  `<g>`
  // back boards, lit from the upper left so the left wall is the bright one
  + `<rect width="400" height="${floor}" fill="#16262c"/>`
  + `<g stroke="#0d1b21" stroke-width="1" opacity=".7">`
  + [56, 112, 168, 224, 280, 336].map(x => `<path d="M${x} 0 V${floor}"/>`).join('') + `</g>`
  + `<path d="M0 0 H400 L400 12 Q200 22 0 12 Z" fill="#0a171c" opacity=".8"/>`
  // the cupboard floor, and the damp stain every one of these cupboards has
  + `<rect y="${floor}" width="400" height="${150 - floor}" fill="#3c332c"/>`
  + `<path d="M0 ${floor} H400" stroke="${C.steelLt}" stroke-width="1" opacity=".3"/>`
  + `<ellipse cx="150" cy="${floor + 3}" rx="94" ry="5" fill="#241d17" opacity=".55"/>`
  + (trap
    // the trap: down out of the sink, round the bend, off through the back wall
    ? `<g fill="none" stroke="${C.steelLt}" stroke-width="9" stroke-linecap="round" opacity=".78">`
      + `<path d="M330 -6 V44"/><path d="M330 44 a17 17 0 0 0 34 0 V16"/></g>`
      + `<g fill="none" stroke="#ffffff" stroke-width="2" opacity=".2">`
      + `<path d="M327 0 V40"/><path d="M361 20 V38"/></g>`
      + `<rect x="322" y="8" width="16" height="5" rx="2" fill="${C.steel}"/>`
      + `<rect x="356" y="14" width="16" height="5" rx="2" fill="${C.steel}"/>`
    : '')
  + `</g>`;

// ---- signature 2: the kitchen counter ----
// Tiled backsplash with real grout lines, then the worktop slab with a front lip. This is
// the "you are doing the work" signature.
const counterTop = (top = 96, { tiles = true } = {}) => {
  let wall = '';
  if (tiles) {
    wall += `<rect width="400" height="${top}" fill="${C.tile}"/>`;
    // 40x24 tiles, offset every other row, only the grout drawn
    for (let row = 0, y = -6; y < top; row++, y += 24) {
      wall += `<path d="M0 ${y} H400" stroke="${C.grout}" stroke-width="1.4" opacity=".55"/>`;
      const off = row % 2 ? 20 : 0;
      for (let x = off; x <= 400; x += 40) {
        wall += `<path d="M${x} ${y} V${Math.min(y + 24, top)}" stroke="${C.grout}" stroke-width="1.2" opacity=".4"/>`;
      }
    }
    // one warm wash from the upper left, so the whole wall is not flat
    wall += `<path d="M0 0 H210 L96 ${top} H0 Z" fill="#ffffff" opacity=".045"/>`;
  }
  return `<g>${wall}`
    + `<rect y="${top}" width="400" height="7" fill="${C.worktopLt}"/>`
    + `<rect y="${top + 7}" width="400" height="${150 - top - 7}" fill="${C.worktop}"/>`
    + `<path d="M0 ${top} H400" stroke="#cbbfae" stroke-width="1" opacity=".45"/>`
    + `</g>`;
};

// Console readout box: dark screen, cool stroke, a light catch along the top lip.
const panelBox = (x, y, w, h, { r = 7, fill = C.ink, stroke = C.slate, sw = 1.8 } = {}) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`
  + `<path d="M${x + r} ${y + 1.5} H${x + w - r}" stroke="${C.tealLt}" stroke-width="1" opacity=".14"/>`;

// Flow arrow: solid where something moves, dashed where a claim is passed on.
const flow = (x1, x2, y, { color = C.teal3, w = 2, dash, op = .9 } = {}) =>
  `<g opacity="${op}"><path d="M${x1} ${y} H${x2 - 8}" fill="none" stroke="${color}" stroke-width="${w}"`
  + ` stroke-linecap="round"${dash ? ` stroke-dasharray="${dash}"` : ''}/>`
  + `<path d="M${x2} ${y} l-9 -5 v10 z" fill="${color}"/></g>`;

// The unit's signature object: a container with a label patch on it. Every scene in this
// set has at least one, because the whole week is about what the labels do or do not say.
// `lines` is up to two short strings printed on the patch; `state` strikes it red.
const bottle = (x, base, w, h, { k, tint = ['#123c30', '#1f6a52', '#4fae86'], lines = [],
  cap = C.steelLt, state, neck = .42, id = 'btl' } = {}) => {
  const body = k ? k.glass(id, tint) : tint[1];
  const bw = w * neck, bx = x - bw / 2, shoulder = base - h * .72;
  const patchH = Math.min(h * .34, 26), patchY = base - h * .5;
  return `<g>`
    + `<ellipse cx="${x}" cy="${base + 2}" rx="${(w / 2 + 2).toFixed(1)}" ry="4" fill="#040c10" opacity=".38"/>`
    // shoulders drawn, not a plain rect: it is what makes a bottle a bottle
    + `<path d="M${(x - w / 2).toFixed(1)} ${base} V${(base - h * .62).toFixed(1)}`
    + ` Q${(x - w / 2).toFixed(1)} ${shoulder.toFixed(1)} ${bx.toFixed(1)} ${(shoulder - 5).toFixed(1)}`
    + ` V${(base - h).toFixed(1)} H${(bx + bw).toFixed(1)} V${(shoulder - 5).toFixed(1)}`
    + ` Q${(x + w / 2).toFixed(1)} ${shoulder.toFixed(1)} ${(x + w / 2).toFixed(1)} ${(base - h * .62).toFixed(1)}`
    + ` V${base} Z" fill="${body}" stroke="${C.steelLt}" stroke-width="1.5"/>`
    + `<rect x="${(bx - 1.5).toFixed(1)}" y="${(base - h - 5).toFixed(1)}" width="${(bw + 3).toFixed(1)}" height="6" rx="2" fill="${cap}"/>`
    + `<rect x="${(x - w / 2 + 2.5).toFixed(1)}" y="${(base - h * .58).toFixed(1)}" width="3" height="${(h * .48).toFixed(1)}" rx="1.5" fill="#ffffff" opacity=".28"/>`
    + (lines.length
      ? `<rect x="${(x - w / 2 + 3).toFixed(1)}" y="${patchY.toFixed(1)}" width="${(w - 6).toFixed(1)}" height="${patchH.toFixed(1)}" rx="2.5" fill="${C.card}" opacity=".94"/>`
        + lines.map((t, i) => mono(x, patchY + 11 + i * 10, t, { size: i ? 7 : 8.5, fill: C.slate, w: i ? 500 : 700 })).join('')
      : '')
    + (state === 'bad'
      ? `<g stroke="${C.danger}" stroke-width="2.6" stroke-linecap="round" opacity=".92">`
        + `<path d="M${(x - w / 2 + 4).toFixed(1)} ${patchY.toFixed(1)} l${(w - 8).toFixed(1)} ${patchH.toFixed(1)}"/>`
        + `<path d="M${(x + w / 2 - 4).toFixed(1)} ${patchY.toFixed(1)} l-${(w - 8).toFixed(1)} ${patchH.toFixed(1)}"/></g>`
      : '')
    + `</g>`;
};

// A squat jar with a metal lid, filled with something granular. The white-solid scenes all
// need one, and a jar reads differently from a bottle at this size, which is the point:
// the pantry holds jars, the cupboard holds bottles.
const jar = (x, base, w, h, { k, fill = '#e9edee', lid = C.brass, id = 'jar', label, grain = true } = {}) => {
  const g = k ? k.glass(id, ['#1a3a42', '#2c5e69', '#78adb8']) : '#2c5e69';
  const inner = base - h * .62;
  let grains = '';
  if (grain) {
    let s = 91;
    const rnd = () => (s = (s * 1103515245 + 12345) % 2147483648) / 2147483648;
    for (let i = 0; i < 26; i++) {
      grains += `<rect x="${(x - w / 2 + 4 + rnd() * (w - 9)).toFixed(1)}" y="${(inner + 2 + rnd() * (base - inner - 5)).toFixed(1)}"`
        + ` width="1.8" height="1.8" fill="#ffffff" opacity="${(.35 + rnd() * .5).toFixed(2)}"/>`;
    }
  }
  return `<g>`
    + `<ellipse cx="${x}" cy="${base + 2}" rx="${(w / 2 + 2).toFixed(1)}" ry="3.5" fill="#040c10" opacity=".38"/>`
    + `<rect x="${(x - w / 2).toFixed(1)}" y="${(base - h).toFixed(1)}" width="${w}" height="${h}" rx="4" fill="${g}" stroke="${C.steelLt}" stroke-width="1.5"/>`
    + `<path d="M${(x - w / 2 + 2).toFixed(1)} ${inner.toFixed(1)} H${(x + w / 2 - 2).toFixed(1)} V${(base - 2).toFixed(1)} H${(x - w / 2 + 2).toFixed(1)} Z" fill="${fill}" opacity=".9"/>`
    + grains
    + `<rect x="${(x - w / 2 - 2).toFixed(1)}" y="${(base - h - 6).toFixed(1)}" width="${w + 4}" height="7" rx="2.5" fill="${lid}"/>`
    + `<rect x="${(x - w / 2 + 3).toFixed(1)}" y="${(base - h + 4).toFixed(1)}" width="3" height="${(h - 10).toFixed(1)}" rx="1.5" fill="#ffffff" opacity=".3"/>`
    + (label
      ? `<rect x="${(x - w / 2 + 3).toFixed(1)}" y="${(base - h * .42).toFixed(1)}" width="${w - 6}" height="15" rx="2" fill="${C.card}" opacity=".95"/>`
        + mono(x, base - h * .42 + 11, label, { size: 8.5, fill: C.slate, w: 700 })
      : '')
    + `</g>`;
};

// A frying pan, side on, handle to the right. `heat` draws the ring under it.
const pan = (x, y, w, { heat = true, content } = {}) =>
  `<g>`
  + `<path d="M${x - w / 2} ${y} h${w} a${w / 2} 11 0 0 1 -${w} 0 z" fill="#2c3338" stroke="${C.steelLt}" stroke-width="1.6"/>`
  + `<ellipse cx="${x}" cy="${y}" rx="${w / 2}" ry="5.5" fill="#3d454b" stroke="${C.steelLt}" stroke-width="1.4"/>`
  + (content || '')
  + `<path d="M${x + w / 2 - 2} ${y - 1} l34 -7" stroke="#1e2428" stroke-width="6" stroke-linecap="round"/>`
  + `<path d="M${x + w / 2 - 2} ${y - 2.5} l34 -7" stroke="#4a5257" stroke-width="1.6" stroke-linecap="round"/>`
  + (heat
    ? `<g stroke="${C.brass}" stroke-width="2" fill="none" opacity=".8">`
      + `<path d="M${x - w / 2 + 6} ${y + 20} h${w - 12}"/></g>`
      + `<g fill="none" stroke-linecap="round">`
      + [-18, -6, 6, 18].map(d =>
        `<path d="M${x + d} ${y + 19} q3 -7 0 -12" stroke="${C.ember}" stroke-width="2.6" opacity=".9"/>`
        + `<path d="M${x + d} ${y + 19} q-2 -5 0 -8" stroke="#5fc7e8" stroke-width="1.6" opacity=".85"/>`).join('')
      + `</g>`
    : '')
  + `</g>`;

// A conductivity meter: a box with a needle and two probes into whatever is beside it.
// `reads` true swings the needle over and lights the lamp.
const meter = (x, y, { reads = true, probeTo } = {}) =>
  `<g>`
  + panelBox(x, y, 74, 40)
  + `<path d="M${x + 8} ${y + 30} A29 29 0 0 1 ${x + 66} ${y + 30}" fill="none" stroke="${C.slate}" stroke-width="1.4"/>`
  + `<path d="M${x + 37} ${y + 30} l${reads ? 17 : -17} ${reads ? -14 : -14}" stroke="${reads ? C.success : C.danger}" stroke-width="2.2" stroke-linecap="round"/>`
  + `<circle cx="${x + 37}" cy="${y + 30}" r="2.6" fill="${C.steelLt}"/>`
  + mono(x + 37, y + 12, reads ? 'CURRENT' : 'NOTHING', { size: 7, fill: reads ? C.success : C.danger, ls: '.1em', w: 700 })
  + (probeTo
    ? `<g stroke="${C.steelLt}" stroke-width="1.8" fill="none" opacity=".85">`
      + `<path d="M${x + 16} ${y + 40} C${x + 6} ${y + 58} ${probeTo[0] - 14} ${probeTo[1] - 12} ${probeTo[0] - 7} ${probeTo[1]}"/>`
      + `<path d="M${x + 58} ${y + 40} C${x + 62} ${y + 58} ${probeTo[0] + 14} ${probeTo[1] - 12} ${probeTo[0] + 7} ${probeTo[1]}"/></g>`
      + `<circle cx="${probeTo[0] - 7}" cy="${probeTo[1]}" r="2.2" fill="${C.brass}"/>`
      + `<circle cx="${probeTo[0] + 7}" cy="${probeTo[1]}" r="2.2" fill="${C.brass}"/>`
    : '')
  + `</g>`;

// A 2D molecule glyph. Same element colours and the same pale lone-pair lobe with two dark
// electrons in it as the 3D viewer in js/vsepr.js, so the banner and the bench agree.
// `shape` is one of the five VSEPR names model.js uses.
const GEO2D = {
  'linear': { bonds: [[1, 0], [-1, 0]], lone: [] },
  'bent': { bonds: [[-.79, .61], [.79, .61]], lone: [[-.6, -.8], [.6, -.8]] },
  'trigonal planar': { bonds: [[0, -1], [.87, .5], [-.87, .5]], lone: [] },
  // The receding bond is drawn last and shorter by the caller's `back` factor, which is
  // how a pyramid reads at all in two dimensions.
  'trigonal pyramidal': { bonds: [[-.87, .5], [.87, .5], [0, .62]], lone: [[0, -1]] },
  'tetrahedral': { bonds: [[-.87, -.5], [.87, -.5], [-.5, .87], [.5, .87]], lone: [] }
};
const mol2d = (cx, cy, shape, { k, central, ligand, s = 1, bond = 24, id = 'm', showLone = true } = {}) => {
  const geo = GEO2D[shape];
  if (!geo) return '';
  const rc = 9 * s, rl = 6.6 * s, L = bond * s;
  const cOrb = k ? k.orb(id + 'c', ['#ffffff', EL[central] || '#888', '#101820']) : (EL[central] || '#888');
  const lOrb = k ? k.orb(id + 'l', ['#ffffff', EL[ligand] || '#888', '#101820']) : (EL[ligand] || '#888');
  let out = '<g>';
  // lone pairs first, so an atom always draws over its own cloud
  if (showLone) {
    for (const [dx, dy] of geo.lone) {
      const px = cx + dx * L * .62, py = cy + dy * L * .62;
      const ax = -dy, ay = dx;   // perpendicular, for the two electrons
      out += `<ellipse cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" rx="${(10 * s).toFixed(1)}" ry="${(7.4 * s).toFixed(1)}"`
        + ` transform="rotate(${(Math.atan2(dy, dx) * 180 / Math.PI).toFixed(1)} ${px.toFixed(1)} ${py.toFixed(1)})"`
        + ` fill="${LONE_SHELL}" opacity=".42"/>`;
      for (const side of [-1, 1]) {
        const ex = px + ax * 3.4 * s * side, ey = py + ay * 3.4 * s * side;
        out += `<circle cx="${ex.toFixed(1)}" cy="${ey.toFixed(1)}" r="${(1.9 * s).toFixed(1)}" fill="${LONE_DOT}"/>`;
      }
    }
  }
  geo.bonds.forEach(([dx, dy], i) => {
    const back = shape === 'trigonal pyramidal' && i === 2 ? .62 : 1;
    const px = cx + dx * L * back, py = cy + dy * L * back;
    out += `<path d="M${cx} ${cy} L${px.toFixed(1)} ${py.toFixed(1)}" stroke="#b9c6cc" stroke-width="${(3.2 * s * back).toFixed(1)}"`
      + ` stroke-linecap="round" opacity="${back < 1 ? .62 : .95}"/>`;
    out += `<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="${(rl * back).toFixed(1)}" fill="${lOrb}"/>`;
  });
  out += `<circle cx="${cx}" cy="${cy}" r="${rc.toFixed(1)}" fill="${cOrb}"/>`;
  return out + '</g>';
};

// A dipole arrow: the crossed-tail arrow chemistry uses, so a cancelling pair reads as a
// cancelling pair rather than as two random arrows.
const dipole = (x, y, dx, dy, len, { color = C.ember } = {}) => {
  const n = Math.hypot(dx, dy) || 1, ux = dx / n, uy = dy / n;
  const ex = x + ux * len, ey = y + uy * len;
  return `<g stroke="${color}" stroke-width="2" fill="${color}" stroke-linecap="round">`
    + `<path d="M${x} ${y} L${ex.toFixed(1)} ${ey.toFixed(1)}" fill="none"/>`
    + `<path d="M${ex.toFixed(1)} ${ey.toFixed(1)} l${(-ux * 6 - uy * 3.5).toFixed(1)} ${(-uy * 6 + ux * 3.5).toFixed(1)}`
    + ` l${(uy * 7).toFixed(1)} ${(-ux * 7).toFixed(1)} z" stroke="none"/>`
    + `<path d="M${(x - uy * 4).toFixed(1)} ${(y + ux * 4).toFixed(1)} L${(x + uy * 4).toFixed(1)} ${(y - ux * 4).toFixed(1)}" fill="none"/>`
    + `</g>`;
};

// A tap over the sink, and the water leaving it. Used by more than one scene, so it is a
// primitive rather than inline geometry.
const tap = (x, y, { running = true } = {}) =>
  `<g>`
  + `<rect x="${x - 7}" y="${y}" width="14" height="10" rx="3" fill="${C.steelLt}"/>`
  + `<path d="M${x} ${y} V${y - 26} q0 -12 22 -12 h12" fill="none" stroke="${C.steelLt}" stroke-width="7" stroke-linecap="round"/>`
  + `<path d="M${x - 2.5} ${y - 4} V${y - 24}" stroke="#ffffff" stroke-width="1.8" opacity=".3"/>`
  + `<path d="M${x + 34} ${y - 38} v9" stroke="${C.steel}" stroke-width="9" stroke-linecap="round"/>`
  + (running
    ? `<path d="M${x} ${y + 10} V${y + 46}" stroke="${C.teal3}" stroke-width="7" opacity=".55" stroke-linecap="round"/>`
      + `<path d="M${x - 1.5} ${y + 12} V${y + 44}" stroke="${C.tealLt}" stroke-width="2" opacity=".7"/>`
    : '')
  + `</g>`;

// ---------------------------------------------------------------- scaffolding
// scene(id, opts) -> a complete 400x150 banner string.
//   caption  required mono strapline along the bottom
//   body     required k => shapes, drawn between background and scrim
//   theme    'counter' (default, where the work happens) | 'sink' (where it lands)
//            | 'copper' (Honors)
//   frame    override the frame stroke (e.g. danger red for a hazard scene)
function scene(id, { caption, body, theme = 'counter', bg, frame, capColor }) {
  const honors = theme === 'copper';
  const [top, bot] = bg || (honors ? COPPER_BG : theme === 'sink' ? SINK_BG : COUNTER_BG);
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

  // ================= C.7(A) two element symbols, one bond =================

  // The jar of white crystals, the pan it is about to go into, and the two symbols that
  // are all the label has left. The pan is cold and empty on purpose: the call comes
  // first, the cooking second.
  'a-white-jar': scene('a-white-jar', { caption: 'THE WHITE JAR · Na + Cl, BEFORE THE PAN', body: k => {
    return counterTop(94)
      + jar(78, 94, 46, 50, { k, label: 'Na Cl', id: 'wj' })
      + pan(232, 84, 92, { heat: false })
      // the two symbols, big, where a label would have been
      + panelBox(300, 20, 84, 44)
      + mono(342, 38, 'Na', { size: 15, fill: C.white, w: 700 })
      + mono(342, 56, 'Cl', { size: 15, fill: C.white, w: 700 })
      + mono(342, 14, 'ALL THE LABEL HAS', { size: 6, fill: C.dim, ls: '.06em' })
      + flow(110, 178, 46, { dash: '4 5', op: .5 })
      + mono(144, 40, '?', { size: 16, fill: C.ember, w: 700 })
      // a spoonful lifted out, so the scene has a hand in it without drawing one
      + `<path d="M120 60 q16 -10 30 -4" fill="none" stroke="${C.steelLt}" stroke-width="3" stroke-linecap="round"/>`
      + `<ellipse cx="156" cy="58" rx="11" ry="6" fill="${C.enamel}" stroke="${C.steelLt}" stroke-width="1.3"/>`;
  } }),

  // Bare copper against copper. The frayed sleeve is peeled back, the strands are visible,
  // and the plug is still in the learner's hand rather than in the wall.
  'a-lamp-cord': scene('a-lamp-cord', { caption: 'THE LAMP CORD · BARE COPPER, TAPE OR BIN', body: k => {
    const shade = k.lin('sh', [[0, '#8f7d5f'], [.5, '#d9c39a'], [1, '#6f6047']], true);
    return counterTop(96)
      // the lamp itself, off
      + `<path d="M34 40 h58 l-9 30 h-40 z" fill="${shade}" stroke="${C.steelLt}" stroke-width="1.4"/>`
      + `<path d="M63 70 V90" stroke="${C.steel}" stroke-width="4"/>`
      + `<ellipse cx="63" cy="93" rx="20" ry="5" fill="${C.steel}"/>`
      // the cord across the worktop, sleeve split, strands bare
      + `<path d="M83 92 C130 96 156 74 206 78" fill="none" stroke="#2b3236" stroke-width="8" stroke-linecap="round"/>`
      + `<path d="M206 78 C246 82 262 66 300 70" fill="none" stroke="#2b3236" stroke-width="8" stroke-linecap="round"`
      + ` stroke-dasharray="26 34"/>`
      + `<g stroke="${C.copper}" stroke-width="1.6" fill="none" opacity=".95">`
      + `<path d="M232 74 C248 70 262 76 276 71"/><path d="M232 77 C248 74 262 79 276 75"/>`
      + `<path d="M232 80 C248 78 262 83 276 79"/></g>`
      // the split sleeve peeled back, drawn as two cuffs
      + `<path d="M224 68 l10 -3 v18 l-10 -3 z" fill="#3d454b"/>`
      + `<path d="M284 65 l-10 3 v16 l10 -3 z" fill="#3d454b"/>`
      + `<circle cx="254" cy="46" r="18" fill="none" stroke="${C.ember}" stroke-width="1.6" stroke-dasharray="3 4"/>`
      + mono(254, 24, 'Cu + Cu', { size: 10, fill: C.ember, w: 700, ls: '.08em' })
      // the plug, not yet in the wall
      + `<rect x="306" y="60" width="30" height="22" rx="4" fill="#2b3236" stroke="${C.steelLt}" stroke-width="1.3"/>`
      + `<g fill="${C.brass}"><rect x="340" y="64" width="12" height="4" rx="1.5"/><rect x="340" y="74" width="12" height="4" rx="1.5"/></g>`
      + `<rect x="352" y="58" width="26" height="30" rx="4" fill="#1b2226" stroke="${C.steel}" stroke-width="1.2" opacity=".8"/>`
      + mono(365, 48, 'NOT YET', { size: 6.5, fill: C.warn, ls: '.08em' });
  } }),

  // The gas ring lit, and the line behind the wall it comes down. The leak question is put
  // as a plume drawn UPWARD, because the whole point of the scenario is which way it goes.
  'a-gas-ring': scene('a-gas-ring', { caption: 'THE GAS LINE · A LEAK RISES OR IT DOES NOT', body: k => {
    return counterTop(92)
      // the hob plate and one lit ring
      + `<rect x="120" y="80" width="176" height="12" rx="3" fill="#242b30" stroke="${C.steelLt}" stroke-width="1.3"/>`
      + `<ellipse cx="208" cy="80" rx="46" ry="9" fill="#2f373d" stroke="${C.steelLt}" stroke-width="1.2"/>`
      + `<g fill="none" stroke-linecap="round">`
      + [-30, -18, -6, 6, 18, 30].map(d =>
        `<path d="M${208 + d} 79 q4 -12 0 -21" stroke="${C.ember}" stroke-width="3" opacity=".92"/>`
        + `<path d="M${208 + d} 79 q-2 -8 0 -12" stroke="#5fc7e8" stroke-width="2" opacity=".9"/>`).join('')
      + `</g>`
      // the supply pipe out of the wall, with the C-H molecules in it
      + `<path d="M0 62 H120" stroke="${C.brass}" stroke-width="9" stroke-linecap="round" opacity=".85"/>`
      + `<path d="M0 59 H118" stroke="#ffffff" stroke-width="1.6" opacity=".25"/>`
      + `<g>` + [26, 60, 94].map(x => mol2d(x, 62, 'tetrahedral', { k, central: 'C', ligand: 'H', s: .34, bond: 20, id: 'g' + x })).join('') + `</g>`
      + mono(60, 42, 'CH4 IN THE LINE', { size: 7, fill: C.dim, ls: '.07em' })
      // and the question: which way does it go
      + `<g opacity=".8">` + [286, 306, 326].map((x, i) =>
        `<path d="M${x} ${74 - i * 4} V${34 - i * 6}" stroke="${C.warn}" stroke-width="1.8" stroke-dasharray="4 5" stroke-linecap="round"/>`
        + `<path d="M${x} ${30 - i * 6} l-4.5 8 h9 z" fill="${C.warn}"/>`).join('') + `</g>`
      + mono(324, 20, 'UP? OR DOWN?', { size: 7.5, fill: C.warn, ls: '.07em', w: 700 })
      + `<path d="M340 74 q10 12 4 24" fill="none" stroke="${C.steel}" stroke-width="1.4" stroke-dasharray="3 4"/>`;
  } }),

  // The tap running into the sink. This is the one scene that is simultaneously counter and
  // drain: everything in the apartment is about to be washed in what comes out of it.
  'a-tap-water': scene('a-tap-water', { caption: 'THE KITCHEN TAP · O + H, AND EVERY CLEAN-UP', body: k => {
    const basin = k.glass('bsn', ['#1d2b31', '#3c4b52', '#7f929a']);
    return counterTop(96, { tiles: true })
      // the basin cut into the worktop
      + `<path d="M104 82 h188 l-16 22 h-156 z" fill="${basin}" stroke="${C.steelLt}" stroke-width="1.6"/>`
      + `<ellipse cx="198" cy="82" rx="94" ry="8" fill="#2a3a41" stroke="${C.steelLt}" stroke-width="1.4"/>`
      + `<ellipse cx="198" cy="98" rx="13" ry="4" fill="#131b1f" stroke="${C.steel}" stroke-width="1.2"/>`
      + tap(198, 42)
      // the splash where it lands
      + `<g fill="none" stroke="${C.tealLt}" stroke-width="1.4" opacity=".6">`
      + `<path d="M182 92 q10 -8 16 -3"/><path d="M214 92 q-10 -8 -16 -3"/></g>`
      // one water molecule pulled out of the stream, big, with its bend visible
      + `<circle cx="316" cy="52" r="30" fill="#0f2a32" stroke="${C.teal3}" stroke-width="2"/>`
      + mol2d(316, 46, 'bent', { k, central: 'O', ligand: 'H', s: .78, bond: 21, id: 'w' })
      + `<path d="M290 74 L262 66" stroke="${C.teal3}" stroke-width="1.4" stroke-dasharray="3 4"/>`
      + mono(316, 22, 'O + H', { size: 8.5, fill: C.tealLt, ls: '.1em', w: 700 })
      // what is waiting to be rinsed in it
      + jar(48, 96, 36, 34, { k, label: '?', id: 'tw', grain: true })
      + mono(48, 40, 'EVERYTHING', { size: 6.5, fill: C.dim, ls: '.07em' })
      + mono(48, 50, 'GETS RINSED IN IT', { size: 6.5, fill: C.dim, ls: '.07em' });
  } }),

  // ================= C.7(B) the label somebody else will trust =================

  // Two things on one wall, one letter apart. The alarm on the ceiling and the boiler
  // sticker below it, with the neighbour's claim struck through between them.
  'b-hallway-alarm': scene('b-hallway-alarm', { theme: 'sink', frame: C.danger,
    caption: 'THE HALLWAY ALARM · CO IS NOT CO2', body: k => {
    const disc = k.orb('d', ['#f6f8f7', '#cfd6d4', '#7d8785']);
    return `<rect width="400" height="150" fill="#1b262b"/>`
      // ceiling line and the alarm bolted to it
      + `<path d="M0 22 H400" stroke="${C.steelLt}" stroke-width="1.4" opacity=".35"/>`
      + `<rect y="0" width="400" height="22" fill="#233036" opacity=".9"/>`
      + `<ellipse cx="112" cy="30" rx="44" ry="12" fill="${disc}" stroke="${C.steel}" stroke-width="1.4"/>`
      + `<rect x="68" y="26" width="88" height="18" rx="9" fill="${disc}" stroke="${C.steel}" stroke-width="1.4"/>`
      + `<circle cx="112" cy="40" r="4.5" fill="${C.danger}"/>`
      + `<g stroke="${C.steel}" stroke-width="1.2" opacity=".7">`
      + [-26, -16, -6, 4, 14, 24].map(d => `<path d="M${112 + d} 32 v8"/>`).join('') + `</g>`
      + mono(112, 62, 'WATCHES FOR', { size: 6.5, fill: C.dim, ls: '.08em' })
      + mono(112, 78, 'CO', { size: 20, fill: C.white, w: 700, ls: '.06em' })
      // the boiler, and the sticker on it
      + `<rect x="238" y="30" width="112" height="66" rx="5" fill="#2c3a41" stroke="${C.steelLt}" stroke-width="1.5"/>`
      + `<rect x="248" y="40" width="92" height="26" rx="3" fill="${C.card}" opacity=".94"/>`
      + mono(294, 51, 'BOILER', { size: 6.5, fill: C.slate, ls: '.1em' })
      + mono(294, 62, 'CO2', { size: 12, fill: C.slate, w: 700 })
      + `<g stroke="${C.steelLt}" stroke-width="1.3" opacity=".6">`
      + `<path d="M258 76 H330"/><path d="M258 84 H310"/></g>`
      + `<path d="M262 30 V6" stroke="${C.steel}" stroke-width="6" stroke-linecap="round" opacity=".8"/>`
      // the neighbour's claim, struck out
      + panelBox(158, 34, 68, 26, { fill: '#2a1a18', stroke: C.danger })
      + mono(192, 51, 'SAME THING', { size: 7, fill: '#e6a294', ls: '.05em' })
      + `<path d="M164 58 L220 38" stroke="${C.danger}" stroke-width="2.4" stroke-linecap="round"/>`
      + flow(146, 168, 46, { color: C.danger, dash: '3 4', op: .7 });
  } }),

  // The split sack on the porch and the empty jar it is going into, with the cooking salt
  // already on the shelf one place along. The whole hazard of this scenario is the distance
  // between those two jars, so the scene puts them side by side.
  'b-deicer': scene('b-deicer', { caption: 'THE DE-ICER SACK · ONE JAR FROM THE SALT', body: k => {
    const sack = k.lin('sk', [[0, '#4a5a63'], [.4, '#7b8d96'], [1, '#3d4c54']], true);
    return counterTop(96)
      // the sack, split at the top, granules spilling
      + `<path d="M20 96 q-6 -46 12 -56 q28 -8 48 0 q18 10 12 56 z" fill="${sack}" stroke="${C.steelLt}" stroke-width="1.5"/>`
      + `<path d="M30 42 q22 -10 44 0" fill="none" stroke="#2c383e" stroke-width="3" stroke-linecap="round"/>`
      + `<path d="M40 40 l6 -12 l8 10 l7 -12 l6 14" fill="none" stroke="${C.steelLt}" stroke-width="1.6" stroke-linecap="round"/>`
      + `<rect x="26" y="56" width="52" height="22" rx="2" fill="${C.card}" opacity=".93"/>`
      // Two lines in a 22-unit label, spaced 12 apart for the 8-unit floor instead of the
      // 9 the smaller second line used to need.
      + mono(52, 64, 'DE-ICER', { size: 8, fill: C.slate, w: 700 })
      + mono(52, 76, 'CaCl2', { size: 8, fill: C.slate })
      + `<g fill="#e9edee" opacity=".85">`
      + [[88, 88], [96, 92], [104, 90], [92, 96], [110, 95], [82, 94]].map(([x, y]) =>
        `<rect x="${x}" y="${y}" width="2.2" height="2.2"/>`).join('') + `</g>`
      // the empty jar it is going into, label blank and waiting
      + jar(176, 96, 48, 52, { k, fill: '#e9edee', id: 'dj' })
      + `<rect x="155" y="70" width="42" height="15" rx="2" fill="${C.card}" opacity=".6" stroke="${C.ember}" stroke-width="1.2" stroke-dasharray="3 3"/>`
      + mono(176, 81, '?', { size: 11, fill: C.ember, w: 700 })
      // and the cooking salt, already labelled, one place along
      + jar(280, 96, 44, 46, { k, fill: '#f2f4f4', label: 'SALT', id: 'sj', lid: C.steelLt })
      + `<rect x="340" y="52" width="52" height="44" rx="3" fill="#2c3239" opacity=".7"/>`
      + mono(366, 68, 'FOOD', { size: 7, fill: C.dim, ls: '.09em' })
      + mono(366, 80, 'SHELF', { size: 7, fill: C.dim, ls: '.09em' })
      + `<path d="M204 60 H252" stroke="${C.warn}" stroke-width="1.6" stroke-dasharray="4 4"/>`
      + mono(228, 52, 'NEXT TO IT', { size: 6.5, fill: C.warn, ls: '.07em' });
  } }),

  // The relabelling itself: a row of jars with half their labels gone, one in the hand,
  // and the label maker spooling out the tape.
  'b-pantry': scene('b-pantry', { theme: 'sink', caption: 'THE PANTRY · HALF A LABEL IS NOT A LABEL',
    body: k => {
    return sinkCupboard(100, { trap: false })
      // the pantry shelf, and four jars on it in various states of undress
      + `<rect y="58" width="240" height="5" fill="${C.woodLt}"/>`
      + `<rect y="63" width="240" height="4" fill="${C.wood}"/>`
      + jar(34, 58, 38, 40, { k, label: 'RICE', id: 'p1' })
      + jar(84, 58, 34, 36, { k, fill: '#e2d7bd', id: 'p2' })
      + jar(132, 58, 36, 42, { k, fill: '#e9edee', id: 'p3' })
      + jar(184, 58, 40, 38, { k, fill: '#d9c9a8', id: 'p4' })
      // peeled-off label scraps on the cupboard floor
      + `<g fill="${C.card}" opacity=".7">`
      + `<path d="M56 96 l16 -3 l2 7 l-17 3 z"/><path d="M108 98 l14 -4 l3 6 l-15 4 z"/>`
      + `<path d="M154 95 l12 -2 l2 6 l-13 2 z"/></g>`
      // the jar in your hand, on the cupboard floor in front, and the label maker
      + jar(268, 98, 52, 56, { k, fill: '#e9edee', id: 'ph' })
      + `<rect x="246" y="66" width="46" height="17" rx="2" fill="${C.card}" opacity=".95"/>`
      + mono(269, 78, 'NaCl', { size: 9, fill: C.slate, w: 700 })
      + `<rect x="246" y="83" width="46" height="15" rx="2" fill="${C.card}" opacity=".45" stroke="${C.ember}" stroke-width="1.1" stroke-dasharray="3 3"/>`
      + mono(269, 95, '?', { size: 10, fill: C.ember, w: 700 })
      + panelBox(320, 44, 66, 46)
      + mono(353, 58, 'LABEL', { size: 7, fill: C.dim, ls: '.1em' })
      + `<rect x="330" y="64" width="46" height="14" rx="2" fill="${C.card}" opacity=".9"/>`
      + `<g stroke="${C.slate}" stroke-width="1.2" opacity=".55">`
      + `<path d="M336 69 H370"/><path d="M336 74 H360"/></g>`
      + flow(316, 300, 72, { color: C.ember, dash: '3 4', op: .75 });
  } }),

  // ================= C.7(C) rotate it, then classify the shape =================

  // The glass on the counter, ice riding on top, and the one molecule that explains it,
  // pulled out at size with the bend and both lone pairs visible.
  'c-ice-water': scene('c-ice-water', { caption: 'ICE WATER · THE BEND IS WHY IT FLOATS', body: k => {
    const glass = k.glass('gl', ['#1b3a42', '#2d6472', '#8ac2cd']);
    return counterTop(96)
      // the tumbler
      + `<ellipse cx="76" cy="97" rx="30" ry="5" fill="#040c10" opacity=".35"/>`
      + `<path d="M50 26 h52 l-5 70 h-42 z" fill="${glass}" opacity=".55" stroke="${C.steelLt}" stroke-width="1.6"/>`
      + `<path d="M52 40 h48 l-4 55 h-40 z" fill="#3f8fa0" opacity=".5"/>`
      + `<path d="M52 40 a24 5 0 0 0 48 0" fill="none" stroke="${C.tealLt}" stroke-width="1.8"/>`
      // ice cubes ON TOP of the line, which is the whole point of the scene
      + `<g fill="#dff0f4" opacity=".92" stroke="${C.white}" stroke-width="1">`
      + `<path d="M58 30 l16 -4 l4 12 l-16 4 z"/><path d="M80 34 l15 -3 l3 11 l-15 3 z"/>`
      + `<path d="M64 42 l14 -3 l3 10 l-14 3 z"/></g>`
      + `<path d="M52 40 h48" stroke="${C.ember}" stroke-width="1.4" stroke-dasharray="4 3" opacity=".8"/>`
      + mono(76, 18, 'IT FLOATS', { size: 7.5, fill: C.ember, ls: '.09em', w: 700 })
      + `<rect x="46" y="46" width="3" height="44" rx="1.5" fill="#ffffff" opacity=".3"/>`
      // the molecule, on a dark disc so it reads against the tiles
      + `<circle cx="248" cy="54" r="44" fill="#0d2830" stroke="${C.teal3}" stroke-width="2"/>`
      + mol2d(248, 46, 'bent', { k, central: 'O', ligand: 'H', s: 1.1, bond: 27, id: 'iw' })
      + `<path d="M232 82 A34 34 0 0 0 264 82" fill="none" stroke="${C.ember}" stroke-width="1.6"/>`
      + mono(248, 96, '104.5', { size: 8, fill: C.ember, w: 700 })
      + flow(112, 198, 58, { dash: '4 5', op: .5 })
      // the two lone pairs called out, since they are the invisible half of the answer
      + `<path d="M292 30 H324" stroke="${LONE_SHELL}" stroke-width="1.3" stroke-dasharray="3 3"/>`
      + mono(330, 26, 'TWO LONE', { size: 7, fill: '#b9d0e0', anchor: 'start', ls: '.06em' })
      + mono(330, 36, 'PAIRS', { size: 7, fill: '#b9d0e0', anchor: 'start', ls: '.06em' })
      + `<path d="M292 58 H324" stroke="#b9c6cc" stroke-width="1.3" stroke-dasharray="3 3"/>`
      + mono(330, 54, 'TWO', { size: 7, fill: C.dim, anchor: 'start', ls: '.06em' })
      + mono(330, 64, 'BONDS', { size: 7, fill: C.dim, anchor: 'start', ls: '.06em' })
      + mono(330, 80, 'FOUR DOMAINS', { size: 6.5, fill: C.steelLt, anchor: 'start', ls: '.05em' });
  } }),

  // Under the sink, where the cleaning bottles live. The ammonia bottle carries its own
  // warning; the pyramid beside it shows the lone pair that does the cleaning.
  'c-cleaning-shelf': scene('c-cleaning-shelf', { theme: 'sink',
    caption: 'THE CLEANING SHELF · A LONE PAIR DOES THE WORK', body: k => {
    return sinkCupboard(100)
      + `<rect y="64" width="266" height="5" fill="${C.woodLt}"/>`
      + `<rect y="69" width="266" height="4" fill="${C.wood}"/>`
      // three bottles, the middle one the window cleaner
      + bottle(38, 64, 34, 48, { k, tint: ['#3a2410', '#6b4a1d', '#b58a3e'], lines: ['?'], id: 'cs1' })
      + bottle(104, 64, 42, 58, { k, tint: ['#0f3340', '#1d5b70', '#5aa8bd'], lines: ['NH3'], id: 'cs2' })
      + bottle(170, 64, 32, 44, { k, tint: ['#2a1424', '#4d2440', '#8a4a76'], lines: ['?'], id: 'cs3' })
      // the never-mix warning, hung directly above the bottle it came off
      + panelBox(62, 6, 84, 22, { fill: '#2a1a18', stroke: C.danger })
      + mono(104, 20, 'NEVER MIX', { size: 8, fill: '#e6a294', ls: '.08em', w: 700 })
      + `<path d="M104 28 V38" stroke="${C.danger}" stroke-width="1.3" stroke-dasharray="3 3"/>`
      // the molecule on the cupboard floor beside them, pyramid, lone pair up
      + `<circle cx="330" cy="58" r="42" fill="#0d2830" stroke="${C.teal3}" stroke-width="2"/>`
      + mol2d(330, 60, 'trigonal pyramidal', { k, central: 'N', ligand: 'H', s: 1.05, bond: 26, id: 'cl' })
      + `<path d="M300 34 L282 30" stroke="${LONE_SHELL}" stroke-width="1.4" stroke-dasharray="3 3"/>`
      + mono(278, 27, 'THE LONE PAIR', { size: 6.5, fill: '#b9d0e0', ls: '.05em', anchor: 'end' })
      + mono(278, 37, 'DOES THE WORK', { size: 6.5, fill: '#b9d0e0', ls: '.05em', anchor: 'end' })
      + mono(330, 94, '107', { size: 8, fill: C.ember, w: 700 });
  } }),

  // What is actually burning on the ring: four bonds, nothing left over, drawn as the most
  // symmetric thing in the kitchen. The flame is the reason to care.
  'c-gas-ring-shape': scene('c-gas-ring-shape', { caption: 'ON THE RING · FOUR BONDS, NOTHING LEFT OVER',
    body: k => {
    return counterTop(94)
      + `<rect x="18" y="82" width="150" height="12" rx="3" fill="#242b30" stroke="${C.steelLt}" stroke-width="1.3"/>`
      + `<ellipse cx="93" cy="82" rx="52" ry="10" fill="#2f373d" stroke="${C.steelLt}" stroke-width="1.2"/>`
      + `<g fill="none" stroke-linecap="round">`
      + [-36, -24, -12, 0, 12, 24, 36].map(d =>
        `<path d="M${93 + d} 81 q5 -16 0 -28" stroke="${C.ember}" stroke-width="3.4" opacity=".92"/>`
        + `<path d="M${93 + d} 81 q-2 -10 0 -15" stroke="#5fc7e8" stroke-width="2.2" opacity=".9"/>`).join('')
      + `</g>`
      + `<ellipse cx="93" cy="52" rx="46" ry="26" fill="${C.ember}" opacity=".12"/>`
      // one molecule out of the flame, at size
      + `<circle cx="272" cy="52" r="44" fill="#0d2830" stroke="${C.teal3}" stroke-width="2"/>`
      + mol2d(272, 52, 'tetrahedral', { k, central: 'C', ligand: 'H', s: 1.15, bond: 29, id: 'gr' })
      + flow(150, 224, 50, { color: C.ember, dash: '4 5', op: .55 })
      + mono(272, 92, '109.5', { size: 8, fill: C.ember, w: 700 })
      // the symmetry called out as the thing being classified
      + `<g stroke="${C.teal3}" stroke-width="1" stroke-dasharray="3 4" opacity=".7">`
      + `<path d="M272 8 V96"/><path d="M228 52 H316"/></g>`
      + mono(352, 30, 'FOUR', { size: 7.5, fill: C.dim, ls: '.07em' })
      + mono(352, 41, 'THE SAME', { size: 7.5, fill: C.dim, ls: '.07em' })
      + mono(352, 56, 'NO LONE', { size: 7.5, fill: C.dim, ls: '.07em' })
      + mono(352, 67, 'PAIRS', { size: 7.5, fill: C.dim, ls: '.07em' });
  } }),

  // The extinguisher by the front door, and the two bond dipoles pointing straight at each
  // other. This is the scene that has to make a cancellation visible.
  'c-extinguisher': scene('c-extinguisher', { theme: 'sink',
    caption: 'THE EXTINGUISHER · TWO DIPOLES, CANCELLED', body: k => {
    const body_ = k.glass('ex', ['#4a0f0a', '#8e1c12', '#d4574a']);
    return `<rect width="400" height="150" fill="#1b262b"/>`
      + `<g stroke="#121e23" stroke-width="1" opacity=".7">`
      + [70, 140, 210].map(x => `<path d="M${x} 0 V100"/>`).join('') + `</g>`
      + `<rect y="100" width="400" height="50" fill="#3c332c"/>`
      + `<path d="M0 100 H400" stroke="${C.steelLt}" stroke-width="1" opacity=".3"/>`
      // the door frame it stands beside
      + `<rect x="0" y="0" width="18" height="100" fill="#2b3a41"/>`
      + `<path d="M18 0 V100" stroke="${C.steelLt}" stroke-width="1.4" opacity=".4"/>`
      // the cylinder
      + `<ellipse cx="62" cy="101" rx="24" ry="5" fill="#040c10" opacity=".4"/>`
      + `<path d="M40 100 V44 q0 -12 22 -12 q22 0 22 12 V100 z" fill="${body_}" stroke="${C.steelLt}" stroke-width="1.6"/>`
      + `<rect x="55" y="20" width="14" height="14" rx="3" fill="${C.steel}"/>`
      + `<path d="M62 20 q0 -8 14 -8 h16" fill="none" stroke="${C.steel}" stroke-width="5" stroke-linecap="round"/>`
      + `<rect x="44" y="58" width="36" height="26" rx="2" fill="${C.card}" opacity=".93"/>`
      + mono(62, 69, 'CO2', { size: 10, fill: C.slate, w: 700 })
      // The class line clears the 8-unit floor now, so it needs the extra unit of leading.
      + mono(62, 81, 'CLASS B', { size: 6, fill: C.slate })
      + `<rect x="42" y="48" width="3" height="46" rx="1.5" fill="#ffffff" opacity=".22"/>`
      // the molecule, straight, with the two dipoles drawn pointing inward at the carbon
      + `<circle cx="252" cy="52" r="43" fill="#0d2830" stroke="${C.teal3}" stroke-width="2"/>`
      + mol2d(252, 52, 'linear', { k, central: 'C', ligand: 'O', s: 1.15, bond: 30, id: 'ce' })
      + dipole(252, 28, -1, 0, 26)
      + dipole(252, 28, 1, 0, 26)
      + mono(252, 88, '180', { size: 8, fill: C.ember, w: 700 })
      // and the cancellation stated once, as arithmetic rather than prose
      + panelBox(312, 36, 76, 32)
      + mono(350, 50, '+ AND -', { size: 7.5, fill: C.dim, ls: '.06em' })
      + mono(350, 62, 'NET ZERO', { size: 8.5, fill: C.success, ls: '.06em', w: 700 });
  } }),

  // ================= C.7(D) a dry pan, a meter, a drop onto the tiles =================

  // The pan at full heat with the solid still sitting in it, and the meter across the glass
  // reading current. Two observations, one scene: that is what the bench asks you to
  // reconcile.
  'd-dry-pan': scene('d-dry-pan', { caption: 'THE DRY PAN · NO MELT, AND THE METER READS', body: k => {
    return counterTop(96)
      + pan(96, 66, 104, { heat: true, content:
        `<g fill="#eef1f1" opacity=".95">`
        + [[80, 63], [88, 65], [96, 62], [104, 65], [112, 63], [86, 60], [104, 60], [96, 67]]
          .map(([x, y]) => `<rect x="${x}" y="${y}" width="3" height="3" rx="1"/>`).join('')
        + `</g>` })
      + mono(96, 34, 'FULL HEAT, 4 MIN', { size: 7, fill: C.dim, ls: '.07em' })
      + mono(96, 44, 'NO MELT', { size: 9.5, fill: C.danger, ls: '.1em', w: 700 })
      // the glass of dissolved solid with the probes in it
      + `<path d="M212 54 h42 l-4 42 h-34 z" fill="#2d6472" opacity=".55" stroke="${C.steelLt}" stroke-width="1.5"/>`
      + `<path d="M214 64 h38 l-3 30 h-32 z" fill="#3f8fa0" opacity=".55"/>`
      + `<path d="M214 64 a19 4 0 0 0 38 0" fill="none" stroke="${C.tealLt}" stroke-width="1.6"/>`
      + `<g fill="${C.tealLt}" opacity=".7">`
      + [[224, 76], [238, 82], [230, 88], [244, 72]].map(([x, y]) =>
        `<circle cx="${x}" cy="${y}" r="1.6"/>`).join('') + `</g>`
      + meter(300, 22, { reads: true, probeTo: [233, 68] })
      + mono(233, 46, 'A PINCH IN WATER', { size: 6.5, fill: C.dim, ls: '.06em' })
      // the two facts, side by side, because the call needs both
      + `<path d="M158 76 H196" stroke="${C.steel}" stroke-width="1.4" stroke-dasharray="4 4"/>`
      + mono(177, 92, 'AND', { size: 7, fill: C.steelLt, ls: '.1em' });
  } }),

  // The grey lump: the bulb lit off dry contact, and the hammer mark where it spread
  // instead of shattering.
  'd-bulb-battery': scene('d-bulb-battery', { caption: 'THE GREY LUMP · IT LIT DRY, IT DENTED',
    body: k => {
    const lump = k.orb('lp', ['#e2e8ea', '#8d9aa0', '#3c464c']);
    const glow = k.rad('gw', [[0, '#ffe9a8', .95], [.5, '#f0a02f', .35], [1, '#f0a02f', 0]], { cx: '50%', cy: '50%', r: '50%' });
    return counterTop(96)
      // the lump, dented on top, sitting on the worktop
      + `<ellipse cx="150" cy="97" rx="40" ry="6" fill="#040c10" opacity=".4"/>`
      + `<path d="M112 96 q-2 -30 20 -38 q26 -10 46 4 q20 12 12 34 z" fill="${lump}" stroke="${C.steelLt}" stroke-width="1.4"/>`
      + `<path d="M132 60 q14 8 30 2" fill="none" stroke="#5c686e" stroke-width="2.4" stroke-linecap="round"/>`
      + `<path d="M126 68 q18 6 40 0" fill="none" stroke="#6e7a80" stroke-width="1.6" opacity=".8"/>`
      // the hammer, mid-swing, and the spread it made
      + `<path d="M198 26 l40 -14" stroke="${C.wood}" stroke-width="6" stroke-linecap="round"/>`
      + `<rect x="176" y="16" width="26" height="18" rx="3" fill="#4a5257" stroke="${C.steelLt}" stroke-width="1.2"/>`
      + `<path d="M182 40 q-6 8 -18 12" fill="none" stroke="${C.warn}" stroke-width="1.6" stroke-dasharray="3 3"/>`
      + mono(214, 46, 'DENTS, NO CRACK', { size: 7, fill: C.warn, ls: '.06em', anchor: 'start' })
      // the battery and bulb, dry probes straight onto it
      + `<rect x="18" y="52" width="46" height="22" rx="4" fill="#2c3439" stroke="${C.steelLt}" stroke-width="1.3"/>`
      + `<rect x="64" y="58" width="6" height="10" rx="2" fill="${C.brass}"/>`
      + mono(41, 67, '9V', { size: 8, fill: C.dim, w: 700 })
      + `<circle cx="44" cy="26" r="17" fill="${glow}"/>`
      + `<circle cx="44" cy="26" r="9" fill="#ffe9a8" stroke="${C.brass}" stroke-width="1.4"/>`
      + `<rect x="39" y="34" width="10" height="7" rx="2" fill="${C.brass}"/>`
      + mono(44, 6, 'LIT', { size: 8, fill: C.ember, ls: '.14em', w: 700 })
      + `<g fill="none" stroke="${C.steelLt}" stroke-width="1.7" opacity=".85">`
      + `<path d="M44 41 V50 H70 C92 50 96 64 116 68"/>`
      + `<path d="M64 74 C82 84 96 82 112 80"/></g>`
      + `<circle cx="116" cy="68" r="2.2" fill="${C.brass}"/><circle cx="112" cy="80" r="2.2" fill="${C.brass}"/>`
      + mono(18, 90, 'DRY, NO WATER', { size: 6.5, fill: C.dim, ls: '.05em', anchor: 'start' });
  } }),

  // The drop test: the chunk in the air, the shards already across the tiles, and the two
  // instruments that both came back with nothing.
  'd-drop-test': scene('d-drop-test', { theme: 'sink', frame: C.danger,
    caption: 'THE DROP TEST · SHARDS, AND NOTHING CONDUCTS', body: k => {
    const chunk = k.glass('ck', ['#7f9aa4', '#c6dde4', '#f2fafc']);
    return `<rect width="400" height="150" fill="#1b262b"/>`
      // the counter edge it came off, top left
      + `<path d="M0 30 H132 L132 40 H0 Z" fill="${C.worktopLt}"/>`
      + `<rect y="40" width="132" height="10" fill="${C.worktop}"/>`
      // the floor tiles it landed on
      + `<rect y="86" width="400" height="64" fill="#2f3d44"/>`
      + `<g stroke="#3f5158" stroke-width="1.3" opacity=".8">`
      + `<path d="M0 86 H400"/><path d="M0 112 H400"/>`
      + [46, 116, 186, 256, 326].map(x => `<path d="M${x} 86 V150"/>`).join('') + `</g>`
      // the chunk, falling
      + `<path d="M138 48 l22 -8 l14 16 l-10 18 l-22 2 z" fill="${chunk}" opacity=".9" stroke="${C.white}" stroke-width="1.2"/>`
      + `<path d="M150 34 q6 18 -4 34" fill="none" stroke="${C.pale}" stroke-width="1.4" stroke-dasharray="3 5" opacity=".7"/>`
      // the shards, sharp, on the tiles
      + `<g fill="${chunk}" opacity=".92" stroke="${C.white}" stroke-width=".9">`
      + `<path d="M172 94 l14 -5 l3 9 l-15 4 z"/><path d="M198 100 l12 -8 l7 8 l-11 6 z"/>`
      + `<path d="M226 92 l10 -3 l5 10 l-12 2 z"/><path d="M252 99 l14 -6 l4 9 l-14 4 z"/>`
      + `<path d="M186 82 l9 -6 l6 8 l-9 4 z"/></g>`
      + `<g stroke="${C.danger}" stroke-width="1.3" opacity=".8">`
      + [180, 208, 236, 262].map(x => `<path d="M${x} 76 l-4 -8 M${x} 76 l4 -8"/>`).join('') + `</g>`
      // it scratched the glass, not the other way round
      + `<path d="M292 14 h72 v26 h-72 z" fill="#2d4a54" opacity=".7" stroke="${C.steelLt}" stroke-width="1.3"/>`
      + `<g stroke="${C.white}" stroke-width="1.2" opacity=".85">`
      + `<path d="M298 34 L324 20"/><path d="M310 36 L340 20"/></g>`
      + mono(328, 10, 'IT SCRATCHED THE GLASS', { size: 6, fill: C.pale, ls: '.05em' })
      // and both instruments came back with nothing. The meter is set down ON the tiles
      // rather than floating above them, which also keeps it clear of the caption scrim:
      // its box has to finish above y=100 (trap 7) and it is 40 tall.
      + meter(294, 48, { reads: false })
      + mono(150, 18, 'OFF THE COUNTER', { size: 7, fill: C.dim, ls: '.07em', anchor: 'start' });
  } }),

  // The second white jar, halfway to caramel. The pan is the cheapest test in the kitchen
  // and this is the scene where it pays: a slump, a browning, and a meter that stays dark.
  'd-sugar-pan': scene('d-sugar-pan', { caption: 'THE OTHER WHITE JAR · IT WENT TO CARAMEL',
    body: k => {
    const syrup = k.lin('sy', [[0, '#e0a24a'], [.5, '#a9611c'], [1, '#6d3a0e']], true);
    return counterTop(96)
      + jar(46, 96, 40, 42, { k, fill: '#f2f4f4', label: 'JAR 2', id: 'sp' })
      + pan(170, 66, 108, { heat: true, content:
        `<path d="M126 64 q44 12 88 0 q-8 8 -44 8 q-36 0 -44 -8 z" fill="${syrup}"/>`
        + `<path d="M140 62 q30 6 60 0" fill="none" stroke="#f0c98a" stroke-width="1.4" opacity=".7"/>` })
      // the smell, as three curls, because a caramel smell is the observation that settles it
      + `<g fill="none" stroke="${C.ember}" stroke-width="1.6" opacity=".65" stroke-linecap="round">`
      + `<path d="M148 54 q-8 -12 2 -22 q10 -10 2 -20"/>`
      + `<path d="M176 50 q-7 -14 3 -24 q9 -9 1 -18"/>`
      + `<path d="M204 54 q-8 -12 2 -22 q10 -10 2 -20"/></g>`
      + mono(176, 12, 'CARAMEL', { size: 7.5, fill: C.ember, ls: '.12em', w: 700 })
      + mono(96, 44, 'LOW RING, 1 MIN', { size: 6.5, fill: C.dim, ls: '.05em' })
      // and the meter, dark
      + meter(310, 44, { reads: false })
      + mono(347, 34, 'DISSOLVED', { size: 6.5, fill: C.dim, ls: '.07em' })
      + flow(240, 300, 68, { color: C.steel, dash: '3 4', op: .55 });
  } }),

  // ================= Honors =================

  // h1: the continuum itself. A bar from shared electrons to transferred electrons, the
  // two teaching cutoffs drawn on it as what they are — lines somebody chose — and the
  // bottle whose label supplies the pair sitting under the mark.
  'h1-percent-ionic': scene('h1-percent-ionic', { theme: 'copper',
    caption: 'HOW IONIC, REALLY · A CONTINUUM, NOT A WALL', body: k => {
    const bar = k.lin('bar', [[0, '#6b9c5a'], [.35, '#b8881f'], [.7, '#c0772f'], [1, '#bf4a30']], true);
    const X0 = 40, X1 = 360, Y = 62;
    const at = f => X0 + (X1 - X0) * f;
    return `<g opacity=".5">${counterTop(104, { tiles: false })}</g>`
      // the two ends, drawn rather than named: a shared pair, then two separated ions
      + `<g>`
      + `<circle cx="30" cy="30" r="8" fill="${EL.C}"/><circle cx="54" cy="30" r="8" fill="${EL.C}"/>`
      + `<path d="M30 30 H54" stroke="#b9c6cc" stroke-width="3" stroke-linecap="round"/>`
      + `<circle cx="42" cy="30" r="3" fill="${LONE_DOT}"/><circle cx="42" cy="24" r="3" fill="${LONE_DOT}"/>`
      + `</g>`
      + mono(42, 48, 'SHARED', { size: 6.5, fill: '#cbb08f', ls: '.06em' })
      + `<g>`
      + `<circle cx="342" cy="30" r="8" fill="${SODIUM}"/>`
      + `<circle cx="372" cy="30" r="9" fill="${EL.Cl}"/>`
      + mono(342, 33, '+', { size: 9, fill: '#1a1208', w: 700 })
      + mono(372, 34, '-', { size: 11, fill: '#1a1208', w: 700 })
      + `</g>`
      + mono(357, 48, 'TRANSFERRED', { size: 6.5, fill: '#cbb08f', ls: '.06em' })
      // the bar
      + `<rect x="${X0}" y="${Y}" width="${X1 - X0}" height="15" rx="7.5" fill="${bar}"/>`
      + `<rect x="${X0}" y="${Y}" width="${X1 - X0}" height="15" rx="7.5" fill="none" stroke="${C.copper1}" stroke-width="1" opacity=".35"/>`
      // the two teaching cutoffs, dashed, because they are choices and not walls
      + `<g stroke="${C.copper1}" stroke-width="1.4" stroke-dasharray="3 3" opacity=".85">`
      + `<path d="M${at(0.4 / 3.3).toFixed(1)} ${Y - 8} V${Y + 23}"/>`
      + `<path d="M${at(1.7 / 3.3).toFixed(1)} ${Y - 8} V${Y + 23}"/></g>`
      + mono(at(0.4 / 3.3), Y - 12, '0.4', { size: 7, fill: '#e0b483' })
      + mono(at(1.7 / 3.3), Y - 12, '1.7', { size: 7, fill: '#e0b483' })
      + mono(X0, Y + 32, '\u0394EN 0', { size: 7, fill: '#b79a78', anchor: 'start', ls: '.05em' })
      + mono(X1, Y + 32, '3.3', { size: 7, fill: '#b79a78', anchor: 'end', ls: '.05em' })
      // The marker, the bottle the pair came off, and the question. The bottle is drawn
      // BEFORE the label, because at this size the label's baseline sits inside the
      // bottle's shoulder and whichever goes last wins.
      + bottle(at(0.62), 100, 30, 28, { k, tint: ['#3a2410', '#6b4a1d', '#c39a4e'], id: 'h1b' })
      + `<path d="M${at(0.62).toFixed(1)} ${Y - 4} l-6 -10 h12 z" fill="${C.copper1}"/>`
      + `<rect x="${(at(0.62) - 2).toFixed(1)}" y="${Y - 4}" width="4" height="21" rx="2" fill="${C.copper1}"/>`
      + mono(at(0.62) + 50, Y + 26, '% IONIC?', { size: 8, fill: '#f0d8bc', w: 700, ls: '.06em' });
  } }),

  // h2: the same two molecules, one bent and one straight, with their bond dipoles drawn.
  // The sink is in the scene because the whole call is "does water take it".
  'h2-polarity': scene('h2-polarity', { theme: 'copper',
    caption: 'WILL WATER TAKE IT · THE SHAPE DECIDES', body: k => {
    return `<g opacity=".45">${counterTop(100, { tiles: false })}</g>`
      // the sink, small, on the right: the destination the call decides
      + `<path d="M300 66 h88 l-10 30 h-68 z" fill="#3a2c18" stroke="#8a6a3c" stroke-width="1.5"/>`
      + `<ellipse cx="344" cy="66" rx="44" ry="7" fill="#4a3a20" stroke="#8a6a3c" stroke-width="1.3"/>`
      + `<path d="M304 74 h80 l-8 20 h-64 z" fill="#5d7f8a" opacity=".5"/>`
      + `<ellipse cx="344" cy="90" rx="9" ry="3" fill="#1a1208"/>`
      + mono(344, 58, 'THE SINK', { size: 6.5, fill: '#cbb08f', ls: '.1em' })
      // left: bent, dipoles add
      + `<circle cx="84" cy="48" r="38" fill="#221709" stroke="${C.copper}" stroke-width="1.6"/>`
      + mol2d(84, 42, 'bent', { k, central: 'O', ligand: 'H', s: .92, bond: 23, id: 'p1' })
      + dipole(72, 58, -.79, .61, 18, { color: '#f0c98a' })
      + dipole(96, 58, .79, .61, 18, { color: '#f0c98a' })
      + dipole(84, 30, 0, -1, 22, { color: C.ember })
      + mono(84, 96, 'THEY ADD', { size: 7.5, fill: C.ember, w: 700, ls: '.06em' })
      // right: linear, dipoles cancel
      + `<circle cx="204" cy="48" r="38" fill="#221709" stroke="${C.copper}" stroke-width="1.6"/>`
      + mol2d(204, 48, 'linear', { k, central: 'C', ligand: 'O', s: .92, bond: 25, id: 'p2' })
      + dipole(204, 26, -1, 0, 22, { color: '#f0c98a' })
      + dipole(204, 26, 1, 0, 22, { color: '#f0c98a' })
      + mono(204, 96, 'THEY CANCEL', { size: 7.5, fill: '#8fbf9f', w: 700, ls: '.06em' })
      // and the fork: one goes in the sink, one does not
      + `<path d="M124 62 C160 40 172 40 196 44" fill="none" stroke="${C.ember}" stroke-width="1.4" stroke-dasharray="3 4" opacity=".5"/>`
      + flow(244, 296, 56, { color: C.ember, dash: '4 5', op: .8 })
      + flow(244, 296, 78, { color: '#8a6a3c', dash: '2 6', op: .5 })
      + mono(270, 50, 'YES', { size: 7, fill: C.ember, ls: '.08em', w: 700 })
      + mono(270, 94, 'NO', { size: 7, fill: '#b79a78', ls: '.08em', w: 700 });
  } }),

  // h3: three bottles the same size on one counter, and the force between the molecules
  // drawn at three strengths. The boiling gap is the consequence, so it is the readout.
  'h3-imf': scene('h3-imf', { theme: 'copper',
    caption: 'BETWEEN THE MOLECULES · WHAT YOU HAVE TO BEAT', body: k => {
    // three pairs of molecules, held by a link drawn thicker each time
    const pair = (x, y, w, label, note) =>
      `<g>`
      + `<circle cx="${x - 13}" cy="${y}" r="7.5" fill="#c9a86a"/><circle cx="${x + 13}" cy="${y}" r="7.5" fill="#c9a86a"/>`
      + `<path d="M${x - 5} ${y} H${x + 5}" stroke="${C.copper1}" stroke-width="${w}" stroke-linecap="round"`
      + `${w < 2 ? ' stroke-dasharray="2 3"' : ''} opacity=".9"/>`
      + `</g>`
      + mono(x, y - 16, label, { size: 7, fill: '#e0b483', ls: '.05em', w: 700 })
      + mono(x, y + 20, note, { size: 6.5, fill: '#b79a78', ls: '.04em' });
    return `<g opacity=".5">${counterTop(100, { tiles: false })}</g>`
      // the three bottles, deliberately the same size
      + bottle(48, 100, 34, 46, { k, tint: ['#3a2410', '#6b4a1d', '#b58a3e'], lines: ['CH4'], id: 'i1' })
      + bottle(112, 100, 34, 46, { k, tint: ['#33200e', '#5f4118', '#a87e35'], lines: ['HCl'], id: 'i2' })
      + bottle(176, 100, 34, 46, { k, tint: ['#2b1c0c', '#523913', '#9a7430'], lines: ['H2O'], id: 'i3' })
      + pair(48, 26, 1.4, 'LONDON', 'weakest')
      + pair(112, 26, 3, 'DIPOLE', 'stronger')
      + pair(176, 26, 5.5, 'H-BOND', 'strongest')
      // the consequence: the same size bottle, sixty degrees apart
      + panelBox(238, 22, 146, 62, { fill: '#1a1208', stroke: '#8a6a3c' })
      + mono(311, 36, 'WHAT IT COSTS TO BOIL', { size: 6.5, fill: '#cbb08f', ls: '.06em' })
      + `<g>`
      + [['-162', 0.14, '#c9a86a'], ['-85', 0.42, '#d9a35a'], ['+100', 1, C.ember]].map(([t, f, col], i) =>
        `<rect x="248" y="${44 + i * 13}" width="${(94 * f).toFixed(1)}" height="8" rx="4" fill="${col}"/>`
        + mono(380, 51 + i * 13, t + '\u00b0C', { size: 6.5, fill: '#cbb08f', anchor: 'end' })).join('')
      + `</g>`
      + mono(311, 96, 'SAME SIZE BOTTLE. SIXTY DEGREES APART.', { size: 6, fill: '#b79a78', ls: '.04em' });
  } }),

  // ================= Capstone =================

  // The cupboard, emptied except for one container, with the three routes out of it drawn:
  // the shelf, the drain, and the bag going to the drop.
  'cap-underthesink': scene('cap-underthesink', { theme: 'sink',
    caption: 'THE LAST BOTTLE · KEEP, DRAIN OR BAG IT', body: k => {
    return sinkCupboard(100)
      // the emptied shelf, with the outlines of what used to be there
      + `<rect y="58" width="196" height="5" fill="${C.woodLt}"/>`
      + `<rect y="63" width="196" height="4" fill="${C.wood}"/>`
      + `<g fill="none" stroke="${C.steel}" stroke-width="1.1" stroke-dasharray="3 4" opacity=".55">`
      + [16, 62, 108, 152].map(x => `<rect x="${x}" y="30" width="28" height="28" rx="4"/>`).join('') + `</g>`
      + mono(98, 22, 'CLEARED', { size: 7, fill: C.success, ls: '.14em', w: 700 })
      // the one left, on the cupboard floor, label gone but for two symbols
      + bottle(122, 100, 46, 62, { k, tint: ['#123c30', '#1f6a52', '#4fae86'], lines: ['? + ?'], id: 'cb' })
      + `<circle cx="122" cy="60" r="30" fill="none" stroke="${C.ember}" stroke-width="1.6" stroke-dasharray="4 4"/>`
      // three routes, drawn from it
      + `<g stroke="${C.steel}" stroke-width="1.4" stroke-dasharray="3 4" opacity=".8">`
      + `<path d="M150 66 C186 60 196 46 222 44"/>`
      + `<path d="M150 76 C190 76 210 74 236 74"/>`
      + `<path d="M150 86 C188 92 200 96 226 96"/></g>`
      // 1. the shelf: a labelled slot
      + `<rect x="230" y="30" width="52" height="26" rx="4" fill="#1c3a30" stroke="${C.success}" stroke-width="1.4"/>`
      + mono(256, 46, 'SHELF', { size: 7.5, fill: '#8fbf9f', ls: '.08em', w: 700 })
      // 2. the drain
      + `<ellipse cx="256" cy="74" rx="15" ry="5" fill="#131b1f" stroke="${C.steel}" stroke-width="1.3"/>`
      + `<g stroke="${C.steel}" stroke-width="1" opacity=".8">`
      + `<path d="M245 74 H267"/><path d="M248 71 H264"/><path d="M248 77 H264"/></g>`
      + mono(278, 78, 'DRAIN', { size: 7.5, fill: C.dim, ls: '.08em', anchor: 'start' })
      // 3. the bag
      + `<path d="M236 88 h34 l-4 12 h-26 z" fill="#3a2422" stroke="${C.danger}" stroke-width="1.4"/>`
      + `<path d="M244 88 q9 -7 18 0" fill="none" stroke="${C.danger}" stroke-width="1.4"/>`
      + mono(278, 96, 'HAZ WASTE', { size: 7.5, fill: '#e6a294', ls: '.08em', anchor: 'start' })
      // The one that cannot be taken back. It goes on the drain route itself rather than
      // off to the right, where the trap pipe already is.
      + mono(200, 22, 'ONE ROUTE IS NOT REVERSIBLE', { size: 6.5, fill: C.warn, ls: '.05em', anchor: 'start' });
  } })
};

export function sceneArt(id) { return SCENE_ART[id] || ''; }
