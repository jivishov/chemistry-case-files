// art.js — Unit 5 mission illustrations (The Mole, ISV Meridian voyage).
// One inline SVG per SCENARIO id (see model.js). Each banner depicts the
// situation behind the task so the brief reads like a console screen, not a
// worksheet. Rendered at the top of every brief card via x-html in index.html.
//
// The scaffolding (viewBox, space gradient, bottom scrim, console frame, mono
// caption) is identical across scenes, so it lives in scene() below and each
// entry supplies only its caption + the body shapes. Rules the builder keeps:
//   • Every gradient/pattern/clip id is prefixed with the scene id. Alpine keeps
//     all stage panels in the DOM (x-show, not x-if), so the SVGs coexist and an
//     unprefixed id would bleed across scenes. kit() does the prefixing: bodies
//     are `k => '...'` and ask k for the paint they need.
//   • Banners are aria-hidden: the brief's role/goal/why text directly below each
//     one is the authoritative description, so announcing the art too is redundant.
//   • Lighting is from the upper left everywhere — tube()/orb() encode that, so a
//     cylinder in one banner is shaded like the cylinder in the next.
//   • Keep the subject above y=102. Below that the caption scrim fades art out.
//   • Exteriors get stars(), interiors get bulkhead() — that is how the set says
//     "outside the hull" vs "inside a deck" without a label.
// Palette tracks tokens.css: teal for ship systems, copper for the two Honors
// jobs, semantic red/amber for hazards, rust for Mars. viewBox is 400x150; the
// banner is clipped to a rounded top by .brief-art, so the bottom runs square.

const MONO = "'JetBrains Mono', ui-monospace, monospace";

const C = {
  teal: '#2a7d8a', teal7: '#1d5b66', teal3: '#79b0ba', tealLt: '#cfe6ea',
  ink: '#08141a', hull: '#16313a', dim: '#9fc2c9',
  steel: '#687a82', steelLt: '#aebfc6', pale: '#cfdbe0', white: '#e8f2f4',
  slate: '#3a5560', copper: '#c0772f', copper7: '#95591f', copper1: '#f1ddc8',
  success: '#2f8f5b', warn: '#b8881f', danger: '#bf4a30',
  ember: '#f0a02f', rust: '#c0673f', rustDk: '#7a3a22'
};

// Default background pairs (top, bottom) for the two themes.
const SPACE = ['#0b1a22', '#143038'];
const COPPER_BG = ['#1c1208', '#2e2113'];

// ---------------------------------------------------------------- paint kit
// kit(id) hands a scene its own namespace for <defs>. Bodies call k.tube(...)
// and get back a url(#id-name) while the definition is collected for the <defs>
// block scene() assembles.
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
    hatch(n, color, op = .22) {
      defs.push(`<pattern id="${id}-${n}" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">`
        + `<line x1="0" y1="0" x2="0" y2="7" stroke="${color}" stroke-width="1.4" opacity="${op}"/></pattern>`);
      return url(n);
    },
    // Standing cylinder: shadow / highlight / body / shadow across x.
    tube(n, [sh, base, hi]) { return k.lin(n, [[0, sh], [.22, hi], [.52, base], [1, sh]], true); },
    // Cylinder lying on its side (pipes, pods): sheen along the top.
    pipe(n, [sh, base, hi]) { return k.lin(n, [[0, base], [.24, hi], [.6, base], [1, sh]]); },
    // Sphere lit from the upper left.
    orb(n, [hi, base, sh]) { return k.rad(n, [[0, hi], [.55, base], [1, sh]]); }
  };
  return k;
}

// ---------------------------------------------------------------- primitives
const mono = (x, y, s, { size = 9, fill = C.dim, w = 500, anchor = 'middle', ls } = {}) =>
  `<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="${MONO}" font-size="${size}"`
  + ` font-weight="${w}" fill="${fill}"${ls ? ` letter-spacing="${ls}"` : ''}>${s}</text>`;

// Starfield from an 'x,y,r ...' list. Brightness follows radius so every sky matches.
const stars = spec => spec.trim().split(/\s+/).map(p => {
  const [x, y, r] = p.split(',').map(Number);
  const [fill, op] = r >= 1.4 ? [C.tealLt, .95] : r >= 1.1 ? [C.dim, .8] : ['#7fa6ae', .6];
  return `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" opacity="${op}"/>`;
}).join('');

// Interior counterpart to stars(): a riveted bulkhead seam behind the machinery.
const bulkhead = (y, x1 = 0, x2 = 400) => {
  let out = `<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="${C.teal3}" stroke-width="1" opacity=".13"/>`;
  for (let x = x1 + 16; x < x2; x += 30) out += `<circle cx="${x}" cy="${y}" r="1.3" fill="${C.teal3}" opacity=".2"/>`;
  return out;
};

const rivets = spec => spec.trim().split(/\s+/).map(p => {
  const [x, y] = p.split(',');
  return `<circle cx="${x}" cy="${y}" r="1.5" fill="${C.steel}" opacity=".9"/>`;
}).join('');

// Louvered vent slats, drawn with a lit top edge so they read as angled blades.
const louvers = (x1, x2, y0, n, step) => {
  let out = '';
  for (let i = 0; i < n; i++) {
    const y = y0 + i * step;
    out += `<path d="M${x1 + 4} ${y} H${x2} L${x2 - 4} ${y + 6} H${x1} Z" fill="#061014"/>`
      + `<path d="M${x1 + 4} ${y} H${x2}" stroke="${C.slate}" stroke-width="1" opacity=".8"/>`;
  }
  return out;
};

// Flow arrow: solid where matter moves, dashed where a reading is passed on.
const flow = (x1, x2, y, { color = C.teal3, w = 2.2, dash, op = .9 } = {}) =>
  `<g opacity="${op}"><path d="M${x1} ${y} H${x2 - 9}" fill="none" stroke="${color}" stroke-width="${w}"`
  + ` stroke-linecap="round"${dash ? ` stroke-dasharray="${dash}"` : ''}/>`
  + `<path d="M${x2} ${y} l-10 -5.6 v11.2 z" fill="${color}"/></g>`;

// Console readout box: dark screen, cool stroke, a light catch along the top lip.
const panelBox = (x, y, w, h, { r = 8, fill = C.ink, stroke = C.slate, sw = 2 } = {}) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`
  + `<path d="M${x + r} ${y + 1.6} H${x + w - r}" stroke="${C.tealLt}" stroke-width="1" opacity=".14"/>`;

// Rising gas or vapour, repeated from an 'x,y ...' list so every plume matches.
const wisps = (spec, { color = C.teal3, w = 2, op = .75, h = 1 } = {}) =>
  `<g fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" opacity="${op}">`
  + spec.trim().split(/\s+/).map(p => {
    const [x, y] = p.split(',').map(Number);
    return `<path d="M${x} ${y} q${7 * h} -${8 * h} 0 -${15 * h} q-${7 * h} -${7 * h} 0 -${14 * h}"/>`;
  }).join('') + `</g>`;

// Teardrop with the point up.
const drop = (x, y, s = 1, fill = '#3a98a6') =>
  `<path d="M${x} ${y - 9 * s} C${x + 6 * s} ${y - 2 * s} ${x + 6 * s} ${y + 4 * s} ${x} ${y + 4 * s}`
  + ` C${x - 6 * s} ${y + 4 * s} ${x - 6 * s} ${y - 2 * s} ${x} ${y - 9 * s} Z" fill="${fill}"/>`;

const magnifier = (x, y, r, color = C.teal3) =>
  `<g transform="translate(${x},${y})" fill="none" stroke="${color}" stroke-linecap="round">`
  + `<circle r="${r}" fill="${C.tealLt}" fill-opacity=".08" stroke-width="2.6"/>`
  + `<line x1="${(r * .72).toFixed(1)}" y1="${(r * .72).toFixed(1)}" x2="${(r * 1.6).toFixed(1)}" y2="${(r * 1.6).toFixed(1)}" stroke-width="3.4"/>`
  + `<path d="M${(-r * .58).toFixed(1)} ${(-r * .18).toFixed(1)} A${(r * .7).toFixed(1)} ${(r * .7).toFixed(1)} 0 0 1 ${(-r * .1).toFixed(1)} ${(-r * .64).toFixed(1)}" stroke-width="1.8" opacity=".5"/>`
  + `</g>`;

// Percent meter — the shared way the set asks "what fraction of this is that?".
const donut = (cx, cy, r, label, { pct = .42, color = C.ember, sw = 7 } = {}) => {
  const circ = 2 * Math.PI * r;
  return `<g transform="translate(${cx},${cy})">`
    + `<circle r="${r}" fill="none" stroke="#22434c" stroke-width="${sw}"/>`
    + `<circle r="${r}" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round"`
    + ` stroke-dasharray="${(circ * pct).toFixed(1)} ${(circ * (1 - pct)).toFixed(1)}" transform="rotate(-90)"/>`
    + mono(0, -1, '?', { size: 13, w: 700, fill: C.white })
    + mono(0, 10, label, { size: 7 }) + `</g>`;
};

// ---------------------------------------------------------------- molecules
// One colour map for every ball-and-stick in the unit, so the CO2 leaving the
// scrubber is drawn like the CO2 the fire gave off.
const ATOM = { C: '#4d5b63', H: '#e8f2f4', O: '#bf4a30', N: '#2a7d8a', Na: '#b8881f', Cl: '#2f8f5b' };
const atom = (x, y, r, el) =>
  `<circle cx="${x}" cy="${y}" r="${r}" fill="${ATOM[el]}"/>`
  + `<circle cx="${(x - r * .3).toFixed(1)}" cy="${(y - r * .34).toFixed(1)}" r="${(r * .34).toFixed(1)}" fill="#ffffff" opacity=".28"/>`;
const bond = (x1, y1, x2, y2, w = 2) =>
  `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#9fb0b7" stroke-width="${w}" opacity=".8"/>`;

const o2 = (x, y, s = 1) => bond(x - 4.4 * s, y, x + 4.4 * s, y, 2.4 * s)
  + atom(x - 4.4 * s, y, 3.6 * s, 'O') + atom(x + 4.4 * s, y, 3.6 * s, 'O');
const co2 = (x, y, s = 1) => bond(x - 8 * s, y, x + 8 * s, y, 2.4 * s)
  + atom(x - 8 * s, y, 3.3 * s, 'O') + atom(x + 8 * s, y, 3.3 * s, 'O') + atom(x, y, 4.3 * s, 'C');
const h2o = (x, y, s = 1) => bond(x, y, x - 7.5 * s, y - 6 * s, 2.2 * s) + bond(x, y, x + 7.5 * s, y - 6 * s, 2.2 * s)
  + atom(x - 7.5 * s, y - 6 * s, 2.8 * s, 'H') + atom(x + 7.5 * s, y - 6 * s, 2.8 * s, 'H') + atom(x, y, 4.4 * s, 'O');
const ch4 = (x, y, s = 1) => {
  const h = [[-10, -7.2], [10, -7.2], [-10, 7.2], [10, 7.2]].map(([dx, dy]) => [x + dx * s, y + dy * s]);
  return h.map(([hx, hy]) => bond(x, y, hx, hy, 2 * s)).join('')
    + h.map(([hx, hy]) => atom(hx, hy, 2.9 * s, 'H')).join('') + atom(x, y, 5 * s, 'C');
};

// Isometric crystal grain (hydrate crystals, salt grains). Origin = top vertex.
const crystal = (x, y, s, [top, left, right] = ['#9cc6cf', '#5d8a95', '#3f6b76']) => {
  const a = s, b = s * .5, c = s;
  return `<g transform="translate(${x},${y})">`
    + `<path d="M0 0 L${a} ${b} L0 ${2 * b} L${-a} ${b} Z" fill="${top}"/>`
    + `<path d="M${-a} ${b} L0 ${2 * b} L0 ${2 * b + c} L${-a} ${b + c} Z" fill="${left}"/>`
    + `<path d="M${a} ${b} L0 ${2 * b} L0 ${2 * b + c} L${a} ${b + c} Z" fill="${right}"/></g>`;
};

const hexPts = r => [[1, 0], [.5, .866], [-.5, .866], [-1, 0], [-.5, -.866], [.5, -.866]]
  .map(([a, b]) => `${(a * r).toFixed(1)},${(b * r).toFixed(1)}`).join(' ');

// A leafy stalk for the greenhouse bed.
const plant = (x, base, h) => {
  const leaves = [];
  for (let i = 0, y = -h * .32; y > -h + 4; i++, y -= h * .26) {
    const d = i % 2 ? 9 : -9;
    leaves.push(`<path d="M0 ${y.toFixed(1)} q${d} -2 ${d * .9} -9 q${-d} 1 ${-d * .9} 9z" fill="${i % 2 ? '#3fa66b' : C.success}"/>`);
  }
  return `<g transform="translate(${x},${base})">`
    + `<path d="M0 0 V${-h}" fill="none" stroke="${C.success}" stroke-width="2.2" stroke-linecap="round"/>`
    + leaves.join('') + `</g>`;
};

// ---------------------------------------------------------------- scaffolding
// scene(id, opts) -> a complete 400x150 banner string.
//   caption  required mono strapline along the bottom
//   body     required k => shapes, drawn between background and scrim
//   theme    'teal' (default) | 'copper' — sets the frame + caption tint
//   bg       [topColor, bottomColor] override for the vertical gradient
//   frame    override the frame stroke (e.g. danger red for a hazard scene)
//   capColor override the caption fill
function scene(id, { caption, body, theme = 'teal', bg, frame, capColor }) {
  const honors = theme === 'copper';
  const [top, bot] = bg || (honors ? COPPER_BG : SPACE);
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

  // ---------- C.8(A) mass <-> mole ----------
  // Tank -> drifting O2 -> the crew's lungs, with the void they are sealed against.
  'a-oxygen': scene('a-oxygen', { caption: 'CABIN O₂ · REPLACE WHAT THEY BREATHED', body: k => {
    const shell = k.tube('shell', ['#0f4450', '#2a7d8a', '#4fa8b5']);
    const glass = k.rad('glass', [[0, '#123b47'], [1, '#040d12']], { cx: '38%', cy: '32%', r: '82%' });
    const lung = k.lin('lung', [[0, '#48a7b4'], [1, '#2b7581']]);
    return stars('112,26,1.3 190,20,1 258,30,1.2 62,24,0.9 384,42,1 376,94,0.9')
      // O2 bottle: hand-wheel valve, shoulder gauge, base collar
      + `<ellipse cx="52" cy="121" rx="30" ry="5" fill="#040c10" opacity=".45"/>`
      + `<rect x="27" y="42" width="50" height="78" rx="17" fill="${shell}" stroke="${C.teal3}" stroke-width="2"/>`
      + `<rect x="35" y="54" width="5" height="56" rx="2.5" fill="${C.white}" opacity=".22"/>`
      + `<rect x="29" y="105" width="46" height="10" rx="3" fill="#0d3b45"/>`
      + `<rect x="45" y="28" width="14" height="16" rx="3" fill="${C.steelLt}"/>`
      + `<circle cx="52" cy="24" r="7" fill="none" stroke="${C.steelLt}" stroke-width="2.4"/>`
      + `<path d="M45 24 H59 M52 17 V31" stroke="${C.steelLt}" stroke-width="1.3"/>`
      + `<circle cx="68" cy="57" r="5.4" fill="${C.ink}" stroke="${C.steelLt}" stroke-width="1.2"/>`
      + `<path d="M68 57 L71.5 53.5" stroke="${C.success}" stroke-width="1.5" stroke-linecap="round"/>`
      + mono(52, 89, 'O₂', { size: 15, w: 700, fill: C.white })
      + `<rect x="77" y="66" width="11" height="9" rx="2.5" fill="${C.steel}"/>`
      // the released oxygen drifting toward the crew
      + `<path d="M92 74 C122 63 152 84 178 68" fill="none" stroke="${C.teal3}" stroke-width="1.4" stroke-dasharray="2 5" opacity=".5"/>`
      + o2(108, 65, 1) + o2(138, 82, .85) + o2(166, 66, .95)
      + `<path d="M188 66 l-10 -5.6 v11.2 z" fill="${C.teal3}" opacity=".9"/>`
      // lungs: trachea, carina, two lobes with a hint of bronchi
      + `<g transform="translate(224,54)">`
      + `<rect x="-3.5" y="-36" width="7" height="27" rx="3.5" fill="${C.pale}"/>`
      + `<g stroke="#9fb0b7" stroke-width="1" opacity=".65"><path d="M-3.5 -30 H3.5"/><path d="M-3.5 -25 H3.5"/><path d="M-3.5 -20 H3.5"/><path d="M-3.5 -15 H3.5"/></g>`
      + `<path d="M0 -10 L-12 2 M0 -10 L12 2" stroke="${C.pale}" stroke-width="4" stroke-linecap="round"/>`
      + `<g fill="${lung}" stroke="${C.tealLt}" stroke-width="1.4">`
      + `<path d="M5 -8 C22 -6 32 12 30 32 C29 47 18 54 11 47 C6 42 5 28 5 8 Z"/>`
      + `<path d="M-5 -8 C-22 -6 -32 12 -30 32 C-29 47 -18 54 -11 47 C-6 42 -5 28 -5 8 Z"/></g>`
      + `<g fill="none" stroke="${C.tealLt}" stroke-width="1.1" opacity=".4">`
      + `<path d="M9 4 C16 8 20 18 20 30"/><path d="M-9 4 C-16 8 -20 18 -20 30"/></g></g>`
      // porthole onto the vacuum they are holding back
      + `<circle cx="330" cy="58" r="38" fill="${glass}" stroke="${C.slate}" stroke-width="5"/>`
      + `<circle cx="330" cy="58" r="33" fill="none" stroke="#4d6b76" stroke-width="1.3" opacity=".85"/>`
      + rivets('368,58 357,85 330,96 303,85 292,58 303,31 330,20 357,31')
      + stars('318,44,1.3 345,50,1 326,69,1.2 347,73,0.9 334,36,1')
      + `<path d="M305 74 A30 30 0 0 1 334 26" fill="none" stroke="${C.tealLt}" stroke-width="3" opacity=".14"/>`;
  } }),

  // Course correction: the burn that has to be loaded by mass, and the target.
  'a-fuel': scene('a-fuel', { caption: 'CH₄ BURN · LOAD THE RIGHT MASS', body: k => {
    const mars = k.orb('mars', ['#e89a68', '#c0673f', '#7a3a22']);
    const limb = k.rad('limb', [[.45, '#180903', 0], [1, '#180903', .62]]);
    const clip = k.clip('marsclip', `<circle cx="330" cy="58" r="34"/>`);
    const hull = k.pipe('hull', ['#8a97a0', '#cfdbe0', '#f4f9fa']);
    return stars('46,30,1.2 130,24,1 232,26,1.3 60,80,0.9 268,116,1 374,120,0.9')
      // Mars, with a reticle to say "this is the thing you are aiming at"
      + `<circle cx="330" cy="58" r="34" fill="${mars}"/>`
      + `<g clip-path="${clip}">`
      + `<ellipse cx="330" cy="27" rx="16" ry="6" fill="${C.copper1}" opacity=".6"/>`
      + `<ellipse cx="316" cy="52" rx="11" ry="7" fill="#7a3a22" opacity=".4"/>`
      + `<ellipse cx="343" cy="72" rx="13" ry="6" fill="#7a3a22" opacity=".3"/>`
      + `<circle cx="339" cy="42" r="4" fill="#8a3a22" opacity=".3"/></g>`
      + `<circle cx="330" cy="58" r="34" fill="${limb}"/>`
      + `<circle cx="330" cy="58" r="45" fill="none" stroke="${C.teal3}" stroke-width="1.3" stroke-dasharray="1 5" opacity=".5"/>`
      + `<g stroke="${C.teal3}" stroke-width="1.6" stroke-linecap="round" opacity=".7">`
      + `<path d="M330 5 V15 M330 101 V111 M277 58 H287 M373 58 H383"/></g>`
      + `<path d="M114 72 C160 54 224 40 284 46" fill="none" stroke="${C.teal3}" stroke-width="1.8" stroke-dasharray="3 6" opacity=".65"/>`
      // the ship, mid-burn
      + `<g transform="translate(86,90) rotate(-30) scale(1.16)">`
      + `<path d="M-22 -11 C-38 -9 -50 -4 -70 0 C-50 4 -38 9 -22 11 C-31 4 -31 -4 -22 -11 Z" fill="${C.ember}" opacity=".22"/>`
      + `<path d="M-22 -8 C-34 -6 -42 -3 -54 0 C-42 3 -34 6 -22 8 C-29 3 -29 -3 -22 -8 Z" fill="${C.ember}" opacity=".9"/>`
      + `<path d="M-22 -4 C-30 -3 -34 -1.5 -41 0 C-34 1.5 -30 3 -22 4 C-26 1.5 -26 -1.5 -22 -4 Z" fill="#f8eed2"/>`
      + `<path d="M-16 -7 L-23 -12 L-23 12 L-16 7 Z" fill="${C.steel}"/>`
      + `<path d="M-8 -7.5 L-17 -19 L-1 -7.5 Z" fill="${C.teal3}"/><path d="M-8 7.5 L-17 19 L-1 7.5 Z" fill="${C.teal7}"/>`
      + `<rect x="-16" y="-7.5" width="27" height="15" rx="2.5" fill="${hull}"/>`
      + `<path d="M11 -7.5 L28 0 L11 7.5 Z" fill="#eef5f7"/>`
      + `<rect x="-6" y="-7.5" width="3.5" height="15" fill="${C.teal}"/>`
      + `<circle cx="4" cy="0" r="3.2" fill="${C.teal7}" stroke="${C.tealLt}" stroke-width="1"/></g>`
      // the fuel itself — what the mass is being counted out of
      + ch4(200, 92, 1.3) + mono(200, 62, 'CH₄', { size: 9.5, w: 700, fill: C.pale });
  } }),

  // Spent cartridge on the bench: a mass reading in, a mole count out, CO2 overboard.
  'a-scrubber': scene('a-scrubber', { caption: 'TRAPPED CO₂ · CONVERT GRAMS TO MOLES', body: k => {
    const shell = k.pipe('shell', ['#091a20', '#16313a', '#22454f']);
    const rec = k.pipe('rec', ['#123f49', '#2a7d8a', '#409aa7']);
    const sorb = k.hatch('sorb', C.teal3, .14);
    return bulkhead(22)
      // cartridge: sorbent window full of trapped CO2, mass on the front display
      + `<rect x="24" y="40" width="94" height="66" rx="9" fill="${shell}" stroke="${C.teal3}" stroke-width="2"/>`
      + `<g stroke="${C.teal3}" stroke-width="1.2" opacity=".4"><path d="M38 42 V104"/><path d="M104 42 V104"/></g>`
      + `<rect x="14" y="66" width="11" height="9" rx="2.5" fill="${C.steel}"/>`
      + `<rect x="117" y="66" width="11" height="9" rx="2.5" fill="${C.steel}"/>`
      + `<rect x="44" y="50" width="54" height="36" rx="4" fill="#071318" stroke="${C.teal7}" stroke-width="1.2"/>`
      + `<rect x="45" y="51" width="52" height="34" rx="3" fill="${sorb}"/>`
      + co2(58, 60, .8) + co2(84, 72, .8) + co2(60, 80, .7)
      + mono(71, 34, 'CO₂ CARTRIDGE', { size: 7, ls: '.12em' })
      + panelBox(45, 90, 52, 13, { r: 3, stroke: C.slate, sw: 1.2 })
      + mono(71, 100, '? g', { size: 9.5, w: 700, fill: C.white })
      + flow(132, 164, 72)
      // recycler: the mole count it needs before it can vent
      + `<rect x="170" y="36" width="116" height="72" rx="9" fill="${rec}" stroke="${C.tealLt}" stroke-width="1.5"/>`
      + mono(228, 51, 'RECYCLER', { size: 8.5, fill: C.white, ls: '.14em' })
      + panelBox(182, 58, 92, 32, { r: 4, stroke: C.teal7, sw: 1.2 })
      + mono(228, 80, '? mol', { size: 15, w: 700, fill: C.success })
      + `<circle cx="192" cy="99" r="2.6" fill="${C.success}"/><circle cx="202" cy="99" r="2.6" fill="${C.warn}" opacity=".7"/>`
      + `<circle cx="212" cy="99" r="2.6" fill="${C.slate}"/>`
      // vented CO2 crossing the deck to the hull louvres
      + `<rect x="264" y="52" width="14" height="26" rx="3" fill="#0d2830" stroke="${C.teal7}" stroke-width="1.2"/>`
      + `<g stroke="#0d2830" stroke-width="1.8" opacity=".5"><path d="M266 58 H276"/><path d="M266 65 H276"/><path d="M266 72 H276"/></g>`
      + wisps('292,92 310,96 326,90', { op: .5 })
      + co2(302, 62, .62) + co2(324, 74, .55)
      // hull vent the counted CO2 goes out through
      + `<rect x="338" y="36" width="50" height="72" rx="5" fill="#0e2830" stroke="${C.slate}" stroke-width="1.8"/>`
      + louvers(341, 382, 46, 5, 13)
      + rivets('345,41 381,41 345,103 381,103');
  } }),

  // ---------- C.8(B) mole <-> particles ----------
  // Vega on the hull, tethered, with the suit-tank count telemetered back inside.
  'b-eva': scene('b-eva', { caption: 'EVA FILL · MOLES TO MOLECULES', body: k => {
    const suit = k.pipe('suit', ['#9db1b9', '#dfeaee', '#f7fbfc']);
    const hull = k.lin('hull', [[0, '#1b3a44'], [1, '#0e242c']]);
    return stars('40,26,1.3 96,18,1 216,22,1.2 68,50,0.9 122,32,1 392,110,0.9')
      // hull curving away below, with the airlock they came out of
      + `<path d="M0 150 V116 C70 100 168 98 262 110 L400 120 V150 Z" fill="${hull}"/>`
      + `<path d="M0 116 C70 100 168 98 262 110 L400 120" fill="none" stroke="#3f6a76" stroke-width="1.6" opacity=".8"/>`
      + `<g stroke="#0a1d24" stroke-width="1.4" opacity=".8"><path d="M92 104 V150"/><path d="M196 102 V150"/><path d="M300 113 V150"/></g>`
      + `<ellipse cx="54" cy="111" rx="21" ry="8.5" fill="#050f14" stroke="${C.teal3}" stroke-width="2"/>`
      + `<ellipse cx="54" cy="110" rx="14" ry="5" fill="${C.teal7}" opacity=".55"/>`
      + `<path d="M60 106 C86 100 112 92 138 78" fill="none" stroke="#9fb0b7" stroke-width="1.5" opacity=".9"/>`
      + `<circle cx="99" cy="95" r="1.8" fill="${C.steelLt}"/><circle cx="122" cy="86" r="1.8" fill="${C.steelLt}"/>`
      // the crewmate: PLSS pack, chest controls, mirrored visor
      + `<g transform="translate(150,56)">`
      + `<rect x="-24" y="-15" width="16" height="36" rx="6" fill="${C.teal7}"/>`
      + `<rect x="-21" y="-10" width="4" height="26" rx="2" fill="${C.teal}"/>`
      + `<rect x="-13" y="-14" width="9" height="26" rx="4.5" fill="#b6c8ce"/>`
      + `<rect x="-10" y="-17" width="30" height="44" rx="11" fill="${suit}"/>`
      + `<rect x="-10" y="4" width="30" height="4" fill="${C.teal}" opacity=".5"/>`
      + `<rect x="-1" y="-6" width="15" height="12" rx="2.5" fill="${C.steelLt}"/>`
      + `<circle cx="3" cy="0" r="1.5" fill="${C.success}"/><circle cx="9" cy="0" r="1.5" fill="${C.warn}"/>`
      + `<path d="M16 -6 q17 5 18 20" fill="none" stroke="#e2edf0" stroke-width="9" stroke-linecap="round"/>`
      + `<circle cx="34" cy="17" r="5.6" fill="#b6c8ce"/>`
      + `<circle cx="6" cy="-27" r="14" fill="#eef5f7"/>`
      + `<circle cx="7" cy="-27" r="10" fill="#08141a" stroke="${C.dim}" stroke-width="1.4"/>`
      + `<path d="M2 -31 a7 7 0 0 1 9 -3" fill="none" stroke="${C.teal3}" stroke-width="2.2" stroke-linecap="round" opacity=".9"/>`
      + `<rect x="-7" y="26" width="12" height="24" rx="5.5" fill="#dfeaee"/>`
      + `<rect x="8" y="26" width="12" height="24" rx="5.5" fill="#c6d6db"/>`
      + `<rect x="-8" y="46" width="14" height="8" rx="3" fill="${C.steelLt}"/>`
      + `<rect x="7" y="46" width="14" height="8" rx="3" fill="#9fb0b7"/></g>`
      // telemetry back to the console
      + `<g fill="none" stroke="${C.teal3}" stroke-width="1.6" opacity=".5" stroke-linecap="round">`
      + `<path d="M176 14 q9 7 3 17"/><path d="M186 8 q14 12 4 27"/></g>`
      + `<path d="M200 76 H246" stroke="${C.teal3}" stroke-width="1.2" stroke-dasharray="2 5" opacity=".5"/>`
      + panelBox(252, 34, 132, 68)
      + mono(318, 50, 'SUIT O₂ FILL', { size: 8, ls: '.14em' })
      + mono(318, 74, 'N × 10²³', { size: 16, w: 700, fill: C.success })
      + mono(318, 86, 'molecules', { size: 7.5 })
      + `<rect x="266" y="90" width="104" height="7" rx="3.5" fill="#0d2229" stroke="${C.teal7}" stroke-width="1"/>`
      + `<rect x="267.5" y="91.5" width="62" height="4" rx="2" fill="${C.teal}"/>`
      + `<path d="M348 87 V100" stroke="${C.warn}" stroke-width="1.6"/>`;
  } }),

  // Galley: a glucose cartridge feeding the printer, the count going to the log.
  'b-ration': scene('b-ration', { caption: "DAY'S RATION · MOLES TO MOLECULES", body: k => {
    const case_ = k.pipe('case', ['#123f49', '#2a7d8a', '#409aa7']);
    const can = k.tube('can', ['#0d2a33', '#16313a', '#22454f']);
    return bulkhead(22)
      // feedstock cartridge
      + mono(34, 40, 'C₆H₁₂O₆', { size: 7 })
      + `<rect x="20" y="46" width="28" height="50" rx="6" fill="${can}" stroke="${C.teal3}" stroke-width="1.6"/>`
      + `<g fill="none" stroke="${C.warn}" stroke-width="1.6" opacity=".9">`
      + `<polygon points="${hexPts(6)}" transform="translate(34,60)"/>`
      + `<polygon points="${hexPts(6)}" transform="translate(34,74)"/>`
      + `<polygon points="${hexPts(6)}" transform="translate(34,88)"/></g>`
      + `<rect x="48" y="66" width="12" height="8" rx="2" fill="${C.steel}"/>`
      // printer: gantry, extruder, and the meal building up on the plate
      + `<rect x="58" y="34" width="138" height="72" rx="9" fill="${case_}" stroke="${C.tealLt}" stroke-width="1.5"/>`
      + mono(127, 49, 'FOOD PRINTER', { size: 8.5, fill: C.white, ls: '.12em' })
      + `<rect x="68" y="56" width="118" height="42" rx="4" fill="#071318" stroke="${C.teal7}" stroke-width="1.2"/>`
      + `<rect x="76" y="62" width="102" height="4" rx="2" fill="${C.steel}"/>`
      + `<g transform="translate(122,66)"><rect x="-8" y="0" width="16" height="13" rx="2.5" fill="${C.steelLt}"/>`
      + `<path d="M-3.5 13 H3.5 L0 20 Z" fill="${C.warn}"/></g>`
      + `<circle cx="122" cy="90" r="2" fill="${C.warn}" opacity=".85"/>`
      + `<rect x="86" y="90" width="84" height="4" rx="2" fill="${C.steel}"/>`
      + `<path d="M94 90 q11 -13 22 0 z" fill="${C.warn}"/><path d="M126 90 q13 -10 26 0 z" fill="${C.success}"/>`
      + flow(204, 244, 70, { dash: '3 5' })
      + panelBox(250, 40, 134, 64)
      + mono(317, 56, 'RATION LOG', { size: 8, ls: '.14em' })
      + mono(317, 80, 'N × 10²³', { size: 16, w: 700, fill: C.success })
      + mono(317, 92, 'molecules', { size: 7.5 });
  } }),

  // Rover digging Mars: the scoop, the lattice it is really made of, the survey log.
  'b-sample': scene('b-sample', { caption: 'SCOOP · GRAMS TO FORMULA UNITS', bg: ['#0b1a22', '#241410'], body: k => {
    const chassis = k.pipe('chassis', ['#8a97a0', '#cfdbe0', '#eef5f7']);
    const ground = k.lin('ground', [[0, '#8a4326'], [1, '#5e2f1c']]);
    return stars('36,24,1.2 128,26,1 158,52,0.9 232,20,1.3')
      // distant Earth, a long way behind them
      + `<circle cx="272" cy="28" r="10" fill="${C.teal3}" opacity=".13"/>`
      + `<circle cx="272" cy="28" r="4.6" fill="#4a93b4"/>`
      + `<path d="M269 26 q4 -3 7 1 q-3 4 -7 1z" fill="${C.success}" opacity=".8"/>`
      // regolith
      + `<path d="M0 106 C60 98 130 102 210 105 C290 108 344 102 400 98 L400 150 L0 150 Z" fill="${ground}"/>`
      + `<path d="M0 106 C60 98 130 102 210 105 C290 108 344 102 400 98" fill="none" stroke="${C.rust}" stroke-width="2" opacity=".65"/>`
      + `<ellipse cx="26" cy="103" rx="18" ry="4.5" fill="#43200f"/>`
      + `<g fill="#a04a2a" opacity=".8"><circle cx="44" cy="98" r="1.6"/><circle cx="50" cy="92" r="1.2"/><circle cx="38" cy="94" r="1"/></g>`
      // rover
      + `<g transform="translate(78,72)">`
      + `<path d="M-30 2 L-50 14 L-56 26" fill="none" stroke="${C.steelLt}" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round"/>`
      + `<path d="M-63 22 q-9 11 2 16 l17 2 q7 -13 -4 -18 z" fill="${C.teal3}" stroke="${C.pale}" stroke-width="1"/>`
      + `<rect x="-32" y="-14" width="58" height="8" rx="2" fill="${C.teal7}"/>`
      + `<g stroke="#0b2a33" stroke-width="1" opacity=".7"><path d="M-18 -14 V-6"/><path d="M-4 -14 V-6"/><path d="M10 -14 V-6"/></g>`
      + `<rect x="14" y="-32" width="4" height="20" fill="${C.steel}"/>`
      + `<rect x="8" y="-42" width="20" height="12" rx="3" fill="${C.teal}"/>`
      + `<circle cx="24" cy="-36" r="3.2" fill="${C.ink}" stroke="${C.tealLt}" stroke-width="1"/>`
      + `<rect x="-30" y="-6" width="56" height="20" rx="4" fill="${chassis}"/>`
      + `<rect x="-24" y="-1" width="20" height="9" rx="2" fill="#0d2831"/>`
      + `<g fill="#15323d" stroke="${C.steelLt}" stroke-width="3">`
      + `<circle cx="-20" cy="20" r="9"/><circle cx="2" cy="20" r="9"/><circle cx="22" cy="20" r="9"/></g>`
      + `<g fill="${C.steelLt}"><circle cx="-20" cy="20" r="2.6"/><circle cx="2" cy="20" r="2.6"/><circle cx="22" cy="20" r="2.6"/></g></g>`
      // what a scoopful actually is: alternating ions on a cubic lattice
      + mono(206, 40, 'NaCl', { size: 9.5, w: 700, fill: C.copper1 })
      + `<circle cx="206" cy="72" r="28" fill="none" stroke="${C.teal3}" stroke-width="1.1" stroke-dasharray="3 4" opacity=".45"/>`
      + `<g transform="translate(196,66)">`
      + `<g stroke="#9fb0b7" stroke-width="1.5" opacity=".55">`
      + `<path d="M10 -8 H28 M10 -8 V10 M28 -8 V10 M10 10 H28"/></g>`
      + atom(10, -8, 5, 'Cl') + atom(28, -8, 5, 'Na') + atom(10, 10, 5, 'Na') + atom(28, 10, 5, 'Cl')
      + `<g stroke="#9fb0b7" stroke-width="1.7" opacity=".75">`
      + `<path d="M0 0 H18 M0 0 V18 M18 0 V18 M0 18 H18 M0 0 L10 -8 M18 0 L28 -8 M0 18 L10 10 M18 18 L28 10"/></g>`
      + atom(0, 0, 6, 'Na') + atom(18, 0, 6, 'Cl') + atom(0, 18, 6, 'Cl') + atom(18, 18, 6, 'Na') + `</g>`
      + panelBox(288, 50, 98, 50, { r: 6 })
      + mono(337, 66, 'SURVEY LOG', { size: 7.5, ls: '.1em' })
      + mono(337, 88, 'N × 10²³', { size: 13, w: 700, fill: C.success });
  } }),

  // ---------- C.8(C) percent composition ----------
  // The breach that forces the question, the rock that might answer it, the foundry.
  'c-ore': scene('c-ore', { caption: 'RUST ROCK · RICH ENOUGH TO SMELT?', body: k => {
    const rock = k.rad('rock', [[0, '#b25630'], [.6, '#8a3a22'], [1, '#4e2012']], { cx: '32%', cy: '26%' });
    const fire = k.lin('fire', [[0, '#f8d489'], [.45, C.ember], [1, '#a13418']]);
    const plate = k.lin('plate', [[0, '#24444f'], [1, '#152d35']]);
    return mono(61, 26, 'HULL BREACH', { size: 7, ls: '.1em' })
      // hull plate, cracked through
      + `<rect x="20" y="32" width="82" height="86" rx="4" fill="${plate}" stroke="${C.steel}" stroke-width="2"/>`
      + rivets('28,40 94,40 28,110 94,110')
      + `<g stroke="#0e252c" stroke-width="1" opacity=".7"><path d="M61 32 V118"/><path d="M20 75 H102"/></g>`
      + `<path d="M40 34 L52 58 L42 68 L58 90 L48 116" fill="none" stroke="${C.danger}" stroke-width="7" opacity=".16" stroke-linejoin="round"/>`
      + `<path d="M40 34 L52 58 L42 68 L58 90 L48 116" fill="none" stroke="${C.danger}" stroke-width="2.6" stroke-linejoin="round"/>`
      + `<g stroke="${C.danger}" stroke-width="1.2" opacity=".6"><path d="M52 58 L66 54"/><path d="M42 68 L30 74"/><path d="M58 90 L70 95"/></g>`
      + wisps('68,72 76,64', { color: C.dim, w: 1.2, op: .4, h: .55 })
      // the ore itself
      + mono(160, 52, 'Fe ?', { size: 11.5, w: 700, fill: C.copper1 })
      + `<ellipse cx="162" cy="112" rx="30" ry="5" fill="#2a0e04" opacity=".45"/>`
      + `<path d="M-30 10 L-22 -14 L-2 -22 L20 -16 L30 4 L22 22 L-6 26 Z" transform="translate(160,84)"`
      + ` fill="${rock}" stroke="${C.rust}" stroke-width="1.8" stroke-linejoin="round"/>`
      + `<g transform="translate(160,84)" stroke="${C.rust}" stroke-width="1" opacity=".45" fill="none">`
      + `<path d="M-22 -14 L-2 6 L20 -16"/><path d="M-2 6 L-6 26"/><path d="M-2 6 L30 4"/></g>`
      + `<path d="M-20 -10 L-4 -18 L2 -10 L-14 -3 Z" transform="translate(160,84)" fill="#e08a5a" opacity=".26"/>`
      + `<g fill="#e08a5a" opacity=".5"><circle cx="150" cy="96" r="2.4"/><circle cx="174" cy="94" r="1.8"/><circle cx="166" cy="72" r="1.6"/></g>`
      // the assay you have to run on it
      + `<path d="M192 80 H210" stroke="${C.teal3}" stroke-width="1.2" stroke-dasharray="2 4" opacity=".6"/>`
      + donut(234, 78, 20, '% Fe')
      // and the foundry waiting on the answer
      + `<rect x="286" y="46" width="96" height="72" rx="6" fill="${C.hull}" stroke="${C.teal3}" stroke-width="2"/>`
      + `<rect x="352" y="32" width="16" height="16" rx="2" fill="${C.slate}"/>`
      + wisps('360,30', { color: C.dim, w: 1.4, op: .3, h: .7 })
      + mono(316, 60, 'FOUNDRY', { size: 7.5, ls: '.1em' })
      + `<ellipse cx="334" cy="112" rx="36" ry="10" fill="${C.ember}" opacity=".22"/>`
      + `<path d="M304 118 V96 A30 30 0 0 1 364 96 V118 Z" fill="${fire}"/>`
      + `<path d="M315 118 V99 A19 19 0 0 1 353 99 V118 Z" fill="#f8eed2" opacity=".33"/>`;
  } }),

  // Fertilizer whose label may be lying, and the only crop aboard that eats it.
  'c-greenhouse': scene('c-greenhouse', { caption: 'FERTILIZER · REAL % NITROGEN?', body: k => {
    const jug = k.tube('jug', ['#12414c', '#2a7d8a', '#45a0ad']);
    const glass = k.lin('glass', [[0, '#16404c'], [1, '#0d222a']]);
    return bulkhead(20)
      // the canister and its claim
      + `<ellipse cx="58" cy="116" rx="30" ry="4.5" fill="#040c10" opacity=".4"/>`
      + `<rect x="44" y="38" width="24" height="6" rx="2" fill="${C.pale}"/>`
      + `<rect x="46" y="43" width="20" height="11" rx="2" fill="${C.steelLt}"/>`
      + `<path d="M88 64 q13 5 11 18 q-2 11 -11 13" fill="none" stroke="${C.teal3}" stroke-width="4"/>`
      + `<rect x="28" y="52" width="60" height="62" rx="7" fill="${jug}" stroke="${C.tealLt}" stroke-width="1.5"/>`
      + `<rect x="34" y="66" width="48" height="34" rx="3" fill="${C.white}"/>`
      + mono(58, 79, 'N-P-K', { size: 8, fill: '#1c2a31', ls: '.1em' })
      + mono(58, 94, '% N ?', { size: 11.5, w: 700, fill: C.teal })
      // the assay
      + donut(132, 76, 18, '% N')
      // pellets going to the bed
      + flow(160, 208, 96, { dash: '3 5' })
      + `<g fill="${C.teal3}" opacity=".85"><circle cx="172" cy="88" r="2.4"/><circle cx="188" cy="90" r="2"/><circle cx="200" cy="86" r="1.7"/></g>`
      // the greenhouse: dome, grow light, potato bed
      + `<path d="M212 112 A84 84 0 0 1 380 112 Z" fill="${glass}" stroke="${C.teal3}" stroke-width="2"/>`
      + `<g stroke="${C.teal3}" stroke-width="1" opacity=".4" fill="none">`
      + `<path d="M296 112 V28"/><path d="M240 108 L352 108"/><path d="M232 92 A84 84 0 0 1 360 92"/>`
      + `<path d="M252 112 L318 30"/><path d="M340 112 L274 30"/></g>`
      + `<path d="M234 100 A76 76 0 0 1 272 40" fill="none" stroke="${C.tealLt}" stroke-width="3" opacity=".13"/>`
      + `<path d="M296 30 V42" stroke="${C.slate}" stroke-width="1.5"/>`
      + `<rect x="274" y="42" width="44" height="7" rx="3" fill="${C.slate}"/>`
      + `<path d="M276 49 L252 104 L340 104 L316 49 Z" fill="${C.warn}" opacity=".1"/>`
      + `<g fill="${C.warn}" opacity=".9"><circle cx="284" cy="51" r="1.6"/><circle cx="296" cy="51" r="1.6"/><circle cx="308" cy="51" r="1.6"/></g>`
      + plant(252, 106, 30) + plant(296, 106, 38) + plant(340, 106, 27)
      + `<rect x="224" y="104" width="144" height="8" rx="2" fill="#5e2f1c"/>`;
  } }),

  // Pod claiming pure methane, an inline assay, and the engine it would feed.
  'c-fuelpurity': scene('c-fuelpurity', { caption: 'FUEL POD · VERIFY % CARBON', body: k => {
    const tank = k.pipe('tank', ['#12414c', '#2a7d8a', '#4aa3b0']);
    const bell = k.lin('bell', [[0, '#b9c7cd'], [.5, '#7d8c94'], [1, '#4a5a62']]);
    const chamber = k.pipe('chamber', ['#39464e', '#7d8c94', '#c2d0d6']);
    return stars('66,26,1.2 168,22,1 258,116,0.9 372,124,1')
      + mono(88, 44, 'DOCKED POD', { size: 7.5, ls: '.1em' })
      // the pod
      + `<rect x="26" y="56" width="124" height="48" rx="22" fill="${tank}" stroke="${C.teal3}" stroke-width="2"/>`
      + `<g stroke="#0f3540" stroke-width="1.4" opacity=".45"><path d="M64 58 V102"/><path d="M116 58 V102"/></g>`
      + `<path d="M34 66 H142" stroke="${C.white}" stroke-width="4" opacity=".14" stroke-linecap="round"/>`
      + mono(90, 86, 'CH₄', { size: 15, w: 700, fill: C.white })
      + `<g fill="${C.slate}"><path d="M46 104 L54 104 L58 114 L42 114 Z"/><path d="M120 104 L128 104 L132 114 L116 114 Z"/></g>`
      + `<rect x="150" y="72" width="12" height="16" rx="3" fill="${C.steelLt}"/>`
      // inline analyser
      + flow(164, 178, 80, { dash: '2 4', w: 1.6 })
      + `<rect x="178" y="46" width="60" height="66" rx="6" fill="#0e242c" stroke="${C.slate}" stroke-width="1.6"/>`
      + donut(208, 74, 18, '% C')
      + mono(208, 105, 'PURITY', { size: 7, ls: '.12em' })
      + flow(240, 268, 80, { dash: '2 4', w: 1.6 })
      // the engine it either feeds or does not
      + `<path d="M266 80 H292" stroke="${C.steel}" stroke-width="7" stroke-linecap="round"/>`
      + `<rect x="288" y="60" width="34" height="40" rx="7" fill="${chamber}" stroke="${C.steelLt}" stroke-width="1.4"/>`
      + `<rect x="320" y="56" width="8" height="48" rx="2" fill="${C.steelLt}"/>`
      + rivets('324,62 324,80 324,98')
      + `<path d="M326 62 L376 44 L376 116 L326 98 Z" fill="${bell}"/>`
      + `<g stroke="#3a4750" stroke-width="1" opacity=".5"><path d="M338 66 V96"/><path d="M352 60 V101"/><path d="M366 54 V107"/></g>`
      + `<path d="M326 62 L376 44" stroke="${C.white}" stroke-width="1.6" opacity=".35"/>`;
  } }),

  // ---------- C.8(D) empirical / molecular ----------
  // Something is coming through the vent and the spectrometer only has masses.
  'd-leak': scene('d-leak', { caption: 'UNKNOWN GAS · BUILD THE FORMULA, ID IT', bg: ['#0b1a22', '#241818'], frame: C.danger, capColor: '#cda99a', body: k => {
    const plate = k.lin('plate', [[0, '#23414b'], [1, '#132b33']]);
    return bulkhead(22)
      // alarm beacon over a louvred vent
      + `<circle cx="66" cy="30" r="15" fill="none" stroke="${C.danger}" stroke-width="1.4" opacity=".2"/>`
      + `<circle cx="66" cy="30" r="10" fill="none" stroke="${C.danger}" stroke-width="1.4" opacity=".35"/>`
      + `<circle cx="66" cy="30" r="5.5" fill="${C.danger}"/>`
      + `<circle cx="64.5" cy="28.5" r="1.9" fill="#f0b8a4" opacity=".8"/>`
      + `<rect x="26" y="40" width="80" height="80" rx="4" fill="${plate}" stroke="${C.steel}" stroke-width="2"/>`
      + louvers(32, 100, 52, 5, 13)
      + rivets('33,46 99,46 33,113 99,113')
      // the gas, and the unknown it is made of
      + wisps('112,96 126,102 140,92', { color: '#9aa05a', w: 2.4, op: .7, h: 1.15 })
      + `<g transform="translate(184,68)">`
      + `<g stroke="#8f9a5e" stroke-width="2.2" opacity=".75"><path d="M-11 6 H11 M0 -12 V6"/></g>`
      + atom(-11, 6, 6.5, 'C') + atom(11, 6, 6.5, 'C') + atom(0, -12, 7.5, 'C')
      + mono(0, 2, '?', { size: 15, w: 700, fill: '#e08a5a' }) + `</g>`
      + `<g opacity=".7">` + atom(150, 46, 4, 'C') + atom(212, 100, 3.4, 'C') + `</g>`
      // mass spec: the only thing you get to work from
      + panelBox(238, 38, 146, 76)
      + mono(252, 54, 'MASS SPEC', { size: 7.5, ls: '.12em', anchor: 'start' })
      + `<rect x="326" y="44" width="50" height="13" rx="6.5" fill="#2a1210" stroke="${C.danger}" stroke-width="1"/>`
      + mono(351, 53.5, 'UNKNOWN', { size: 6.5, fill: '#e08a5a' })
      + `<path d="M250 100 H374" stroke="${C.slate}" stroke-width="1"/>`
      + `<g stroke="${C.teal3}" stroke-width="1.6" fill="none" stroke-linejoin="round">`
      + `<path d="M250 100 H264 L270 76 L276 100 H294 L300 64 L306 100 H322 L328 84 L334 100 H354 L358 70 L362 100 H374"/></g>`
      + `<g stroke="${C.slate}" stroke-width="1" opacity=".8"><path d="M270 100 V104"/><path d="M300 100 V104"/><path d="M328 100 V104"/><path d="M358 100 V104"/></g>`
      + mono(374, 110, 'm/z', { size: 6.5, anchor: 'end' });
  } }),

  // A core pulled from the surface: one empirical unit, then n of them.
  'd-surface': scene('d-surface', { caption: 'DRILLED SOLID · EMPIRICAL THEN MOLECULAR', bg: ['#0b1a22', '#241410'], body: k => {
    const ground = k.lin('ground', [[0, '#7b3f24'], [1, '#4e2413']]);
    const core = k.lin('core', [[0, '#a8683f'], [1, '#6b3a20']]);
    const rig = k.pipe('rig', ['#3d4a52', '#8a97a0', '#c2d0d6']);
    return stars('44,22,1.2 138,18,1 226,24,0.9')
      + `<path d="M0 104 H400 L400 150 L0 150 Z" fill="${ground}"/>`
      + `<path d="M0 104 H400" stroke="${C.rust}" stroke-width="2" opacity=".55"/>`
      + `<ellipse cx="94" cy="104" rx="17" ry="4.5" fill="#3a1a0e"/>`
      // drill rig, biting in
      + `<g transform="translate(94,30)">`
      + `<rect x="-17" y="-13" width="34" height="17" rx="3" fill="${rig}" stroke="${C.pale}" stroke-width="1.2"/>`
      + `<g stroke="#2e3a41" stroke-width="1.2" opacity=".7"><path d="M-11 -9 H11"/><path d="M-11 -5 H11"/></g>`
      + `<rect x="-4" y="4" width="8" height="50" rx="2" fill="${C.steel}"/>`
      + `<rect x="-4" y="4" width="2.6" height="50" fill="${C.steelLt}" opacity=".7"/>`
      + `<g stroke="${C.slate}" stroke-width="1.6"><path d="M-11 6 V54"/><path d="M11 6 V54"/></g>`
      + `<rect x="-9" y="52" width="18" height="8" rx="2" fill="${C.steelLt}"/>`
      + `<path d="M-4 60 H4 L2 82 L0 88 L-2 82 Z" fill="${C.pale}"/>`
      + `<g stroke="${C.steel}" stroke-width="1" opacity=".8"><path d="M-1.5 62 L-1 80"/><path d="M1.5 62 L1 80"/></g></g>`
      + `<g fill="#a04a2a" opacity=".75"><circle cx="114" cy="98" r="1.8"/><circle cx="120" cy="92" r="1.3"/><circle cx="76" cy="96" r="1.5"/></g>`
      // the core it brought up, under a lens
      + `<g transform="translate(180,70)">`
      + `<rect x="-16" y="26" width="32" height="6" rx="2" fill="${C.steel}"/>`
      + `<rect x="-11" y="22" width="22" height="5" rx="1.5" fill="${C.steelLt}"/>`
      + `<rect x="-10" y="-24" width="20" height="47" rx="2" fill="${core}"/>`
      + `<g opacity=".5"><rect x="-10" y="-10" width="20" height="5" fill="#40200f"/><rect x="-10" y="7" width="20" height="4" fill="#40200f"/></g>`
      + `<g stroke="#40200f" stroke-width="1" opacity=".45"><path d="M-4 -20 V21"/><path d="M3 -20 V21"/></g>`
      + `<ellipse cx="0" cy="-24" rx="10" ry="3.6" fill="#b8794d"/></g>`
      + magnifier(182, 56, 19)
      // one unit, then the whole molecule
      + panelBox(240, 36, 144, 70)
      + mono(254, 52, 'FORMULA', { size: 7.5, ls: '.12em', anchor: 'start' })
      + `<polygon points="${hexPts(13)}" transform="translate(272,76)" fill="${C.hull}" stroke="${C.teal3}" stroke-width="1.8"/>`
      + mono(272, 80, '?', { size: 11, w: 700, fill: C.white })
      + mono(272, 100, 'EMPIRICAL', { size: 6.5 })
      + mono(305, 80, '× n', { size: 11, w: 700, fill: C.ember })
      + `<polygon points="${hexPts(19)}" transform="translate(346,76)" fill="${C.hull}" stroke="${C.teal3}" stroke-width="1.8"/>`
      + `<polygon points="${hexPts(11)}" transform="translate(346,76)" fill="none" stroke="${C.teal3}" stroke-width="1" opacity=".5"/>`
      + mono(346, 100, 'MOLECULAR', { size: 6.5 });
  } }),

  // Coolant weeping out of a cracked joint, creeping toward live boards.
  'd-coolant': scene('d-coolant', { caption: 'COOLANT LEAK · ID THE FLUID', body: k => {
    const pipe = k.lin('pipe', [[0, '#8a97a0'], [.24, '#e2ebee'], [.6, '#97a4ac'], [1, '#57646c']]);
    const board = k.lin('board', [[0, '#1a5138'], [1, '#0f3324']]);
    return bulkhead(18)
      // overhead run with a failed coupling
      + `<g stroke="${C.steel}" stroke-width="3"><path d="M58 14 V34"/><path d="M228 14 V34"/></g>`
      + `<g fill="${C.slate}"><rect x="48" y="10" width="20" height="6" rx="2"/><rect x="218" y="10" width="20" height="6" rx="2"/></g>`
      + `<rect x="16" y="32" width="246" height="21" rx="10.5" fill="${pipe}" stroke="${C.steelLt}" stroke-width="1.2"/>`
      + `<g fill="${C.steelLt}"><rect x="96" y="27" width="15" height="31" rx="3"/><rect x="202" y="27" width="15" height="31" rx="3"/></g>`
      + rivets('103,31 103,54 209,31 209,54')
      + `<path d="M205 53 q-4 6 1 9" fill="none" stroke="#0d1f26" stroke-width="1.6"/>`
      // the drip, and the pool creeping right
      + drop(210, 62, .9) + drop(210, 82, 1.35) + drop(210, 98, .7)
      + mono(210, 86, '?', { size: 11, w: 700, fill: '#0b1a22' })
      + `<ellipse cx="208" cy="115" rx="27" ry="5" fill="#3a98a6" opacity=".8"/>`
      + `<ellipse cx="207" cy="114" rx="16" ry="2.6" fill="#7ec4cd" opacity=".5"/>`
      // live electronics, one puddle away
      + `<g transform="translate(250,62)"><path d="M0 -9 L9.5 7 L-9.5 7 Z" fill="${C.warn}"/>`
      + `<rect x="-1.4" y="-3" width="2.8" height="6" fill="#1c1608"/><circle cx="0" cy="4" r="1.4" fill="#1c1608"/></g>`
      + `<rect x="240" y="74" width="144" height="40" rx="3" fill="${board}" stroke="${C.success}" stroke-width="1.5"/>`
      + `<g fill="none" stroke="#5fbe8c" stroke-width="1" opacity=".45">`
      + `<path d="M248 82 H272 V104 H300"/><path d="M312 78 V92 H344 V108"/><path d="M356 82 H376"/></g>`
      + `<g fill="#0b2418"><rect x="252" y="86" width="26" height="15" rx="2"/><rect x="318" y="92" width="30" height="16" rx="2"/></g>`
      + `<g stroke="#8fa39a" stroke-width="1" opacity=".8">`
      + `<path d="M256 86 V82 M262 86 V82 M268 86 V82 M274 86 V82 M256 101 V105 M262 101 V105 M268 101 V105 M274 101 V105"/>`
      + `<path d="M322 92 V88 M330 92 V88 M338 92 V88 M344 92 V88"/></g>`
      + `<g><rect x="290" y="84" width="7" height="13" rx="3.5" fill="${C.warn}"/><rect x="300" y="86" width="6" height="11" rx="3" fill="${C.warn}" opacity=".7"/></g>`
      + `<circle cx="366" cy="100" r="3.4" fill="${C.success}"/><circle cx="366" cy="100" r="6.5" fill="${C.success}" opacity=".22"/>`
      + `<circle cx="376" cy="100" r="3.4" fill="#123024"/>`
      + `<rect x="352" y="76" width="28" height="7" rx="1.5" fill="${C.pale}" opacity=".85"/>`;
  } }),

  // ---------- Honors: water reclaim (copper) ----------
  // Bake the hydrate, catch how much water leaves, and x falls out of the mass.
  'h1-desiccant': scene('h1-desiccant', { theme: 'copper', caption: 'HONORS · FIND x FROM WATER LOST', body: k => {
    const oven = k.lin('oven', [[0, '#241705'], [1, '#150e04']]);
    const coil = y => `<path d="M46 ${y} Q54 ${y - 8} 62 ${y} T78 ${y} T94 ${y} T110 ${y} T126 ${y} T142 ${y}" fill="none" stroke-linecap="round"/>`;
    return `<rect x="20" y="30" width="148" height="86" rx="9" fill="${oven}" stroke="${C.copper}" stroke-width="2"/>`
      + mono(94, 42, 'RECLAIM OVEN', { size: 7, fill: '#e0b483', ls: '.12em' })
      + `<rect x="32" y="46" width="124" height="50" rx="5" fill="#3a2410" stroke="${C.copper7}" stroke-width="1.5"/>`
      // elements above and below the tray
      + `<g stroke="${C.ember}" stroke-width="7" opacity=".16">${coil(56)}${coil(89)}</g>`
      + `<g stroke="#e0a050" stroke-width="2.6" opacity=".95">${coil(56)}${coil(89)}</g>`
      + `<rect x="46" y="80" width="96" height="5" rx="2" fill="${C.steel}"/>`
      + crystal(58, 66, 7) + crystal(76, 63, 8.5) + crystal(96, 66, 7)
      + crystal(114, 62, 9) + crystal(132, 67, 6.5)
      + mono(94, 109, '·x H₂O', { size: 10.5, w: 700, fill: C.copper1 })
      // the water it gives up
      + wisps('184,100 202,106 220,96', { color: '#9cc6cf', w: 2.4, op: .65, h: 1.35 })
      // weighed on the way out — the number the whole job turns on
      + panelBox(244, 40, 140, 64, { fill: '#1a1206', stroke: C.copper7 })
      + mono(314, 57, 'H₂O DRIVEN OFF', { size: 7.5, fill: '#e0b483', ls: '.1em' })
      + drop(284, 80, 1.5, '#3a98a6')
      + mono(330, 88, '? g', { size: 17, w: 700, fill: '#9cc6cf' });
  } }),

  // ---------- Honors: fire forensics (copper) ----------
  // Whatever burned is gone; the CO2 and water it left behind still name it.
  'h2-arson': scene('h2-arson', { theme: 'copper', bg: ['#1c1208', '#2e1813'], caption: 'HONORS · EMPIRICAL FROM CO₂ + H₂O', body: k => {
    const box = k.lin('box', [[0, '#33281c'], [1, '#1d1610']]);
    const glassFill = k.lin('flask', [[0, '#2a1e10'], [1, '#161009']]);
    // Round-bottom trap hanging off the capture line: neck at ny, bulb centred at by.
    const flask = (cx, r = 19, ny = 60, by = 92) =>
      `M${cx - 5} ${ny} V${(by - Math.sqrt(r * r - 25)).toFixed(1)}`
      + ` A${r} ${r} 0 1 0 ${cx + 5} ${(by - Math.sqrt(r * r - 25)).toFixed(1)} V${ny} Z`;
    const water = k.clip('water', `<path d="${flask(200)}"/>`);
    return `<g fill="#0a0704" opacity=".45">`
      + `<path d="M52 44 C58 30 48 22 56 10 C66 22 62 32 60 44 Z"/>`
      + `<path d="M76 44 C82 32 74 26 80 16 C88 26 84 34 84 44 Z"/></g>`
      // scorched compartment, still alight
      + `<rect x="20" y="44" width="104" height="74" rx="4" fill="${box}" stroke="${C.steel}" stroke-width="2"/>`
      + `<path d="M20 92 q26 -18 52 -4 q26 12 52 -2 V118 H20 Z" fill="#0e0904"/>`
      + `<ellipse cx="70" cy="112" rx="34" ry="8" fill="${C.ember}" opacity=".2"/>`
      + `<path d="M70 114 C56 96 62 82 70 68 C76 82 86 82 84 94 C92 88 92 100 88 106 C84 112 78 114 70 114 Z" fill="${C.danger}"/>`
      + `<path d="M70 112 C62 100 66 90 71 80 C75 90 82 92 80 100 C78 108 76 112 70 112 Z" fill="${C.ember}"/>`
      + `<path d="M70 110 C66 102 68 96 71 90 C74 97 76 102 73 107 Z" fill="#f8eed2"/>`
      // the two products, trapped and weighed
      + mono(200, 48, 'H₂O', { size: 9.5, w: 700, fill: '#9cc6cf' })
      + mono(278, 48, 'CO₂', { size: 9.5, w: 700, fill: C.pale })
      + `<path d="${flask(200)}" fill="${glassFill}" stroke="${C.copper}" stroke-width="1.8"/>`
      + `<g clip-path="${water}"><rect x="178" y="84" width="44" height="30" fill="#3a98a6"/></g>`
      + `<path d="M183 84 H217" stroke="#9cc6cf" stroke-width="1.4"/>`
      + `<path d="${flask(278)}" fill="${glassFill}" stroke="${C.copper}" stroke-width="1.8"/>`
      + `<g fill="${C.pale}" opacity=".3"><circle cx="266" cy="102" r="1.6"/><circle cx="290" cy="80" r="1.4"/><circle cx="288" cy="100" r="1.2"/></g>`
      + co2(278, 91, .95)
      // capture line the products left through
      + `<path d="M124 58 H286" fill="none" stroke="#7a5a2a" stroke-width="6" stroke-linecap="round"/>`
      + `<path d="M126 56 H284" fill="none" stroke="#a57d3c" stroke-width="1.6" opacity=".7"/>`
      + magnifier(346, 86, 17, C.copper);
  } }),

  // ---------- Capstone ----------
  // Unlabelled pod, one scan, three ways it can go.
  'cap-pod': scene('cap-pod', { caption: 'RESUPPLY POD · ID, CHECK PURITY, DECIDE', body: k => {
    const pod = k.pipe('pod', ['#78868e', '#c2d0d6', '#f4f9fa']);
    // Icons read as one glyph each: into the hold, locked, or out the door.
    const IN = `<rect x="1" y="-6" width="8" height="12" rx="1.5"/><path d="M-8 0 H-1 M-4 -4 L0 0 L-4 4"/>`;
    const LOCK = `<rect x="-5" y="-1" width="10" height="8" rx="1.5"/><path d="M-3 -1 V-4 A3 3 0 0 1 3 -4 V-1"/>`;
    const OUT = `<rect x="-9" y="-6" width="8" height="12" rx="1.5"/><path d="M2 0 H9 M5 -4 L9 0 L5 4"/>`;
    const chips = [
      ['#12281f', C.success, '#79c79a', 'BRING ABOARD', 44, IN],
      ['#2a2410', C.warn, '#e0c273', 'QUARANTINE', 70, LOCK],
      ['#2a1512', C.danger, '#e08a5a', 'JETTISON', 96, OUT]
    ];
    return stars('44,22,1.2 116,16,1 200,120,0.9')
      // scanner arch over the pod
      + `<path d="M40 42 V30 H156 V42" fill="none" stroke="${C.teal3}" stroke-width="2" stroke-linejoin="round" opacity=".9"/>`
      + `<path d="M52 38 L44 108 L152 108 L144 38 Z" fill="${C.teal3}" opacity=".07"/>`
      + `<rect x="42" y="35" width="112" height="3" rx="1.5" fill="${C.teal3}" opacity=".35"/>`
      + `<g fill="${C.teal3}"><circle cx="62" cy="36.5" r="1.6"/><circle cx="98" cy="36.5" r="1.6"/><circle cx="134" cy="36.5" r="1.6"/></g>`
      // the pod, label scuffed off
      + `<rect x="24" y="46" width="146" height="62" rx="25" fill="${pod}" stroke="${C.steelLt}" stroke-width="2"/>`
      + `<g fill="#93a3aa" opacity=".55"><rect x="72" y="46" width="8" height="62"/><rect x="118" y="46" width="8" height="62"/></g>`
      + `<g stroke="${C.white}" stroke-width="1.4" opacity=".4"><path d="M40 58 L52 52"/><path d="M138 96 L150 90"/></g>`
      + `<rect x="170" y="66" width="14" height="22" rx="3" fill="${C.steel}"/>`
      + `<rect x="34" y="58" width="34" height="34" rx="3" fill="${C.white}" stroke="${C.steelLt}" stroke-width="1"/>`
      + `<g stroke="${C.steel}" stroke-width="1.4" opacity=".55"><path d="M40 68 H58"/><path d="M40 74 H54"/></g>`
      + `<path d="M68 58 V76 L52 61 Z" fill="#b6c6cc"/><path d="M68 58 L52 61" stroke="#8d9ea6" stroke-width="1"/>`
      + mono(98, 88, '?', { size: 22, w: 700, fill: C.steel })
      // one reading, three ways out
      + `<path d="M186 77 H196" stroke="${C.teal3}" stroke-width="1.4" stroke-dasharray="2 3" opacity=".7"/>`
      + `<circle cx="200" cy="77" r="4" fill="${C.teal3}"/>`
      + chips.map(([bg, edge, ink, label, y, icon]) =>
        `<path d="M204 77 C218 77 224 ${y} 236 ${y}" fill="none" stroke="${edge}" stroke-width="1.6" opacity=".65"/>`
        + `<rect x="240" y="${y - 11}" width="144" height="22" rx="11" fill="${bg}" stroke="${edge}" stroke-width="1.4"/>`
        + `<g transform="translate(259,${y})" fill="none" stroke="${ink}" stroke-width="1.6" stroke-linecap="round">${icon}</g>`
        + mono(280, y + 3.5, label, { size: 8, fill: ink, anchor: 'start', ls: '.08em' })).join('');
  } })
};

// Lookup used by the view-model (returns '' for an unknown id so x-html stays empty).
export function sceneArt(id) { return SCENE_ART[id] || ''; }
