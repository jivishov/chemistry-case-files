// molezoom.js — the "Feel a mole" powers-of-ten tool, shared by U5 and U5a.
// Mirrors game.js: PURE, node-tested helpers plus a createMoleZoom() factory whose
// fields are spread into a unit's createSim() so they become Alpine-reactive.
//
// It lives here rather than in either unit because both need it and the dot-field
// generator is forty lines of geometry: two copies would drift, and only one of
// them would ever get fixed. The unit supplies the tab and the copy; this supplies
// the behaviour.
//
// The teaching claim is that Avogadro's number is not "a big number" but a number
// on a different scale entirely, so the tool is honest about being unable to draw
// it: it packs the stage as densely as the screen can actually resolve, and then
// says how many that was. The gap between that number and 10^23 is the lesson.
//
// ---------------------------------------------------------------- the packing
// Two decisions set how many dots fit, and both were measured rather than guessed
// (Chromium, the U5 desktop stage at 752 x 470 CSS px, rasterised and scanned):
//
//   • HEXAGONAL, not square. Rows sit sqrt(3)/2 * pitch apart and every other row
//     is offset half a pitch, so each dot has six neighbours at the same distance.
//     That is the densest circle packing that exists: for a given gap between
//     neighbours it fits 2/sqrt(3) — about 15.5% — more dots than a square grid.
//
//   • The floor is the SCREEN, not a magic number — and it is Nyquist. A dot needs
//     more than two device pixels of pitch to be sampled as a dot at all, and the
//     measured cliff is exactly that sharp. Rasterising the field at 752x470 and
//     counting resolvable dots along a scanline:
//
//         pitch 3.0px -> 39,633 dots, 225 resolved, contrast 108
//         pitch 2.6px -> 52,765 dots, 261 resolved, contrast 103
//         pitch 2.1px -> 80,883 dots, 317 resolved, contrast  52   <- the most dots
//         pitch 1.9px -> 98,807 dots,   0 resolved, contrast   0   <- flat wash
//         pitch 1.3px -> 211,062 dots,  0 resolved, contrast   0
//
//     Below 2px nothing resolves, and the field even goes LIGHTER as dots are added
//     (63% ink at 1.9, 61% at 1.3) — more particles would read as fewer. 2.1 is the
//     last pitch that still resolves and the one that resolves the most, so that is
//     the floor. The cap is then "as many dots as this display can tell apart", read
//     off the stage's real size, which means a retina panel legitimately draws more.
//
// Rendering is one <pattern> tile per row parity plus one <rect> per row, so the
// fragment is O(rows) — a few hundred nodes and ~20 KB — no matter whether it is
// standing for a hundred dots or three hundred thousand. Emitting a <circle> each
// was 400 ms and 4 MB at 100k; this is ~1 ms and holds the slider at 60 fps.

export const ZOOM_MAX_POW = 23;      // the slider's top notch, one decade under a mole

// The stage the geometry is written against; overridable per call, but the units
// both draw a 320x200 viewBox and zoomWatch() measures against this width.
export const ZOOM_STAGE = { w: 320, h: 200, pad: 8 };

// Centre-to-centre distance, in DEVICE pixels, below which dots stop resolving.
// See the note above: 2.1 still reads as dots, 1.6 reads as a solid tone.
export const ZOOM_MIN_PITCH_PX = 2.1;

// Fallback when nothing has measured the stage yet (node tests, first paint while
// the tab is still hidden): the U5 desktop layout renders those 320 units 752 CSS
// px wide at DPR 1.
export const ZOOM_REF_PX_PER_UNIT = 2.35;

const SQRT3 = Math.sqrt(3);
// 4 decimals, matching the quantisation in zoomDotsSvg: pitch and row height are
// rounded to 4 places there, so every multiple of them prints exactly and a rect
// stays an exact whole number of tiles wide.
const f = x => String(+x.toFixed(4));

// PURE. The densest dot count this stage can still show AS DOTS. A hex lattice of
// pitch p spends p^2 * sqrt(3)/2 of area per dot, so the answer is just the inner
// area divided by that, with p pinned to the display's resolution floor.
export function zoomDotCap({ w = ZOOM_STAGE.w, h = ZOOM_STAGE.h, pad = ZOOM_STAGE.pad,
                             pxPerUnit = ZOOM_REF_PX_PER_UNIT } = {}) {
  const pitch = ZOOM_MIN_PITCH_PX / Math.max(0.05, pxPerUnit);   // viewBox units
  return Math.max(1, Math.floor((w - pad * 2) * (h - pad * 2) / (pitch * pitch * SQRT3 / 2)));
}

// The default cap, kept as a named export because the units' copy and the tests
// both quote it. ~80,000 on the reference stage — 267x what the old square grid drew.
export const ZOOM_DOT_CAP = zoomDotCap();

// Milestone analogies along the log slider (0..23), ascending so a lookup can take
// the milestone at or just below the current power of ten. Makes the scale
// viscerally real one decade at a time.
export const ZOOM_ANALOGIES = [
  { pow: 0,  text: 'one particle, far too small to see.' },
  { pow: 2,  text: 'about a hundred, a small classroom of them.' },
  { pow: 6,  text: 'a million, a packed stadium crowd.' },
  { pow: 12, text: 'a trillion, the grains of sand on a long beach.' },
  { pow: 18, text: 'a quintillion, every grain of sand on every beach on Earth.' },
  { pow: 23, text: 'a mole, about eighty thousand times every grain of sand on every beach on Earth.' }
];

// PURE. How to print 10^pow. Small powers read better in full with separators;
// above ten thousand the exponent IS the point, and building 1e23 as a digit
// string would just be noise.
//
// RETURNS HTML, and the markup binds it with x-html: the exponent is a real
// raised <sup> run, matching the <tspan> the decade dial underneath it draws (see
// exp10Parts in gauge.js for why neither can be a Unicode superscript — this
// unit's monospace has ¹²³ but not ⁰ or ⁴-⁹, so "10⁶" would silently swap fonts
// mid-number). Only digits and separators are ever interpolated, so there is
// nothing here for x-html to inject.
export function zoomCountLabel(pow) {
  const k = Math.max(0, Math.round(pow));
  return k <= 4 ? (10 ** k).toLocaleString('en-US') : `10<sup>${k}</sup>`;
}

// PURE. The milestone at or just below this power of ten.
export function zoomAnalogyFor(pow) {
  let cur = ZOOM_ANALOGIES[0];
  for (const a of ZOOM_ANALOGIES) { if (a.pow <= pow) cur = a; else break; }
  return cur.text;
}

// PURE. How many dots actually get drawn for this power of ten.
export function zoomDrawnCount(pow, cap = ZOOM_DOT_CAP) {
  return Math.max(0, Math.min(Math.round(10 ** Math.max(0, pow)), cap));
}

// PURE. Is the dot field standing in for more particles than it draws?
export function zoomIsCapped(pow, cap = ZOOM_DOT_CAP) { return 10 ** pow > cap; }

// PURE. The hex lattice that packs n dots into the stage.
//   cols/rows  the field, laid out on the box's aspect ratio so it always fills it
//   p          horizontal pitch; rows are rh apart and odd rows shift by p/2
//   r          dot radius: 34% of the nearest-neighbour distance, so the dots grow
//              and shrink with the packing instead of needing a separate rule
//   last       dots on the final row — the remainder that makes the count exact
//
// p divides the inner width by cols + 0.5, not cols: the half-pitch shift on odd
// rows has to come out of the same box, and without that slack the offset rows'
// last dot would hang past the right edge.
export function zoomLattice(n, { w = ZOOM_STAGE.w, h = ZOOM_STAGE.h, pad = ZOOM_STAGE.pad } = {}) {
  const iw = w - pad * 2, ih = h - pad * 2;
  // Solve cols for square-ish CELLS on a hex lattice: rows ~ sqrt(3)/2 * cols * ih/iw.
  const cols = Math.max(1, Math.min(n, Math.round(Math.sqrt(n * iw * SQRT3 / (2 * ih)))));
  const rows = Math.max(1, Math.ceil(n / cols));
  const p = iw / (cols + 0.5), rh = ih / rows;
  // Nearest neighbour is either along the row (p) or diagonally into the offset one.
  const near = Math.min(p, Math.hypot(p / 2, rh));
  return { cols, rows, p, rh, last: n - (rows - 1) * cols, r: Math.max(0.05, near * 0.34) };
}

// PURE. The dot field as an SVG fragment, injected with x-html on a <g> (never a
// <template> inside <svg>, which the HTML parser hoists out).
//
// One <pattern> per row parity does all the drawing: patternUnits="userSpaceOnUse"
// tiles from the pattern's own origin rather than from the shape being filled, so a
// <rect> covering k whole tiles shows exactly k dots and the count stays honest. The
// dot sits at the tile's centre with r well under half the tile, so nothing is
// clipped at a rect's edge and the last row can simply be a narrower rect.
//
// ids are prefixed per call: Alpine keeps hidden panels in the DOM, so a bare
// "a"/"b" would collide with anything else on the page defining the same names.
export function zoomDotsSvg(pow, { cap = ZOOM_DOT_CAP, w = ZOOM_STAGE.w, h = ZOOM_STAGE.h,
                                   pad = ZOOM_STAGE.pad, id = 'zoomdot' } = {}) {
  const n = zoomDrawnCount(pow, cap);
  if (!n) return '';
  const lat = zoomLattice(n, { w, h, pad });
  // Quantise the pitch ONCE and build every coordinate out of the quantised value.
  // A rect only shows a whole number of dots if its width is an exact multiple of
  // the tile it is filled with; rounding p and k*p independently leaves the rect
  // edge drifting a fraction of a tile into the next dot, and a row silently gains
  // or loses one. Round first, multiply after, and the two can never disagree.
  const p = +lat.p.toFixed(4), rh = +lat.rh.toFixed(4), r = +lat.r.toFixed(4);
  const { cols, rows, last } = lat;
  const tile = (sfx, dx) =>
    `<pattern id="${id}-${sfx}" patternUnits="userSpaceOnUse" x="${f(pad + dx)}" y="${f(pad)}"`
    + ` width="${f(p)}" height="${f(rh)}">`
    + `<circle cx="${f(p / 2)}" cy="${f(rh / 2)}" r="${f(r)}"></circle></pattern>`;
  let out = `<defs>${tile('a', 0)}${tile('b', p / 2)}</defs>`;
  for (let i = 0; i < rows; i++) {
    const odd = i % 2, k = i === rows - 1 ? last : cols;
    out += `<rect x="${f(pad + (odd ? p / 2 : 0))}" y="${f(pad + i * rh)}"`
      + ` width="${f(k * p)}" height="${f(rh)}" fill="url(#${id}-${odd ? 'b' : 'a'})"></rect>`;
  }
  return out;
}

// Spread into createSim() alongside createGame(). `zoomPow` is plain reactive
// state driven by the slider; the readouts derive from it, so there is no second
// piece of state to keep in sync. Ungraded on purpose: this tab is for building
// intuition, not for being marked.
//
// These are METHODS, not getters, and that is load-bearing. A unit takes them with
// `...createMoleZoom()`, and object spread READS each accessor and copies the value
// it returned, so a getter here would be flattened into a frozen constant: the
// markup would show "1 particle" forever while the slider moved underneath it.
// Methods survive the spread by reference, and Alpine still tracks `this.zoomPow`
// when the template calls them. Same convention as game.js's gMastery(id).
// Call them with parens in markup: x-text="zoomCount()".
export function createMoleZoom({ pow = 0 } = {}) {
  return {
    ZOOM_MAX_POW,
    zoomPow: pow,
    // How many device pixels one viewBox unit covers. Reactive, so when zoomWatch()
    // measures the real stage the cap and the whole field re-derive themselves.
    zoomPxPerUnit: ZOOM_REF_PX_PER_UNIT,

    // x-init on the <svg>. The tab is behind x-show, so at first paint the stage
    // measures 0 wide and we keep the fallback; the observer fires with a real box
    // the moment it is shown, and again whenever the layout reflows or the window
    // moves to a display with a different pixel ratio.
    zoomWatch(el) {
      const measure = () => {
        const px = el.getBoundingClientRect().width;
        if (!px) return;
        const dpr = (typeof devicePixelRatio === 'number' && devicePixelRatio) || 1;
        this.zoomPxPerUnit = px * dpr / ZOOM_STAGE.w;
      };
      measure();
      if (typeof ResizeObserver === 'function') new ResizeObserver(measure).observe(el);
    },

    zoomCap() { return zoomDotCap({ pxPerUnit: this.zoomPxPerUnit }); },
    zoomCount() { return zoomCountLabel(this.zoomPow); },
    zoomCapped() { return zoomIsCapped(this.zoomPow, this.zoomCap()); },
    zoomAnalogy() { return zoomAnalogyFor(this.zoomPow); },
    zoomDots() { return zoomDotsSvg(this.zoomPow, { cap: this.zoomCap() }); },
    // For the "only N dots are drawn" line, so no unit can hardcode a stale number.
    zoomDrawn() { return zoomDrawnCount(this.zoomPow, this.zoomCap()).toLocaleString('en-US'); }
  };
}
