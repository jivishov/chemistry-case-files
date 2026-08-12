// tests/molezoom.test.js — regression tests for the shared "Feel a mole" tool.
// Run the same way as the engine tests: node tests/molezoom.test.js
// U5 and U5a both spread createMoleZoom(), so a break here breaks two units.
import {
  ZOOM_MAX_POW, ZOOM_DOT_CAP, ZOOM_ANALOGIES, ZOOM_STAGE, ZOOM_MIN_PITCH_PX, ZOOM_REF_PX_PER_UNIT,
  zoomCountLabel, zoomAnalogyFor, zoomIsCapped, zoomDotsSvg, zoomDotCap, zoomLattice,
  zoomDrawnCount, createMoleZoom
} from '../shared/js/molezoom.js';

let pass = 0, fail = 0;
const t = (name, cond) => { cond ? pass++ : (fail++, console.log('FAIL:', name)); };

// ---- reading the fragment back ------------------------------------------
// The field is drawn as <pattern> tiles filling one <rect> per row, so counting
// <circle> elements no longer counts dots. dotsOf() replays the tiling the way a
// renderer would and hands back every dot the fragment actually paints — which is
// what the count and the bounds have to be asserted against.
function dotsOf(frag) {
  const pats = {};
  for (const m of frag.matchAll(/<pattern id="([^"]+)"[^>]*x="([\d.-]+)" y="([\d.-]+)" width="([\d.]+)" height="([\d.]+)">\s*<circle cx="([\d.]+)" cy="([\d.]+)" r="([\d.]+)"/g)) {
    const [, id, x, y, w, h, cx, cy, r] = m;
    pats[id] = { x: +x, y: +y, w: +w, h: +h, cx: +cx, cy: +cy, r: +r };
  }
  const dots = [];
  let exact = true;
  for (const m of frag.matchAll(/<rect x="([\d.-]+)" y="([\d.-]+)" width="([\d.]+)" height="([\d.]+)" fill="url\(#([^)]+)\)"/g)) {
    const [, rx, ry, rw, rh, id] = m;
    const p = pats[id];
    if (!p) { exact = false; continue; }
    const k = +rw / p.w, j0 = (+rx - p.x) / p.w, row = (+ry - p.y) / p.h;
    // A rect only shows a whole number of dots if it covers whole tiles from the
    // pattern's own origin. Anything else would clip a dot and make the count a lie.
    if (Math.abs(k - Math.round(k)) > 1e-6 || Math.abs(j0 - Math.round(j0)) > 1e-6
        || Math.abs(row - Math.round(row)) > 1e-6) exact = false;
    for (let j = 0; j < Math.round(k); j++) {
      const d = { x: p.x + (Math.round(j0) + j) * p.w + p.cx, y: p.y + Math.round(row) * p.h + p.cy, r: p.r };
      // ...and the dot has to sit clear of the rect it is painted through, or the
      // renderer clips a crescent off it however tidy the arithmetic looked.
      if (d.x - d.r < +rx || d.x + d.r > +rx + +rw || d.y - d.r < +ry || d.y + d.r > +ry + +rh) exact = false;
      dots.push(d);
    }
  }
  return { dots, exact, n: dots.length };
}
const count = (pow, opts) => dotsOf(zoomDotsSvg(pow, opts)).n;
const radius = pow => dotsOf(zoomDotsSvg(pow)).dots[0].r;

// ---- the milestone table -------------------------------------------------
t('the slider stops one decade under a mole', ZOOM_MAX_POW === 23);
t('analogies are ordered ascending, which the lookup relies on',
  ZOOM_ANALOGIES.every((a, i) => i === 0 || a.pow > ZOOM_ANALOGIES[i - 1].pow));
t('the table starts at 10^0 so every power has a milestone at or below it', ZOOM_ANALOGIES[0].pow === 0);
t('the table reaches the top of the slider', ZOOM_ANALOGIES[ZOOM_ANALOGIES.length - 1].pow === ZOOM_MAX_POW);
t('every milestone carries text', ZOOM_ANALOGIES.every(a => typeof a.text === 'string' && a.text.length > 10));

// ---- zoomCountLabel: the exponent is the point above ten thousand --------
t('one particle reads as 1', zoomCountLabel(0) === '1');
t('small counts read in full with separators', zoomCountLabel(4) === '10,000');
t('big counts read as an exponent, never a 24-digit string', zoomCountLabel(23) === '10<sup>23</sup>');
t('the switch happens right above ten thousand', zoomCountLabel(5) === '10<sup>5</sup>');
// The exponent is a raised run of ordinary digits, never a caret and never a
// Unicode superscript: this unit's mono face has 1/2/3 but not 0 or 4-9, so a
// character superscript would swap fonts mid-number (see gauge.js exp10Parts).
t('the exponent is raised, not written as a caret',
  [5, 6, 12, 18, 23].every(p => !zoomCountLabel(p).includes('^')));
t('no exponent smuggles in a Unicode superscript the font may not have',
  Array.from({ length: ZOOM_MAX_POW + 1 }, (_, p) => zoomCountLabel(p))
    .every(s => !/[⁰¹²³⁴⁵⁶⁷⁸⁹⁻]/.test(s)));
t('every label is either a plain count or 10 with a raised exponent',
  Array.from({ length: ZOOM_MAX_POW + 1 }, (_, p) => zoomCountLabel(p))
    .every(s => /^[\d,]+$|^10<sup>\d+<\/sup>$/.test(s)));
t('a fractional power is rounded, not printed raw', zoomCountLabel(2.4) === '100');
t('a negative power cannot produce a fraction', zoomCountLabel(-3) === '1');

// ---- zoomAnalogyFor: takes the milestone at or below --------------------
t('10^0 gets the single-particle line', zoomAnalogyFor(0).includes('one particle'));
t('a power between milestones takes the one below', zoomAnalogyFor(5) === zoomAnalogyFor(2));
t('10^6 steps up to the stadium', zoomAnalogyFor(6).includes('million'));
t('the top of the slider names a mole', zoomAnalogyFor(23).includes('mole'));
t('above the table it stays on the last milestone', zoomAnalogyFor(99) === zoomAnalogyFor(23));

// ---- the cap comes off the display, not off a magic number --------------
// It is a resolution budget: dots stop being dots below ZOOM_MIN_PITCH_PX apart,
// so a denser screen legitimately earns more of them and the copy quotes whatever
// number that worked out to.
t('the reference stage holds tens of thousands, not hundreds',
  ZOOM_DOT_CAP > 50000 && ZOOM_DOT_CAP < 200000);
t('the cap is the default cap at the reference resolution',
  zoomDotCap({ pxPerUnit: ZOOM_REF_PX_PER_UNIT }) === ZOOM_DOT_CAP);
t('twice the pixel density holds about four times the dots', (() => {
  const ratio = zoomDotCap({ pxPerUnit: 2 * ZOOM_REF_PX_PER_UNIT }) / ZOOM_DOT_CAP;
  return ratio > 3.99 && ratio < 4.01;
})());
t('a smaller stage holds fewer dots', zoomDotCap({ w: 160, h: 100 }) < ZOOM_DOT_CAP);
t('a garbage resolution still yields a usable cap',
  zoomDotCap({ pxPerUnit: 0 }) >= 1 && Number.isFinite(zoomDotCap({ pxPerUnit: 0 })));
t('the cap really does sit at the resolution floor', (() => {
  // At the cap the lattice pitch should land on ZOOM_MIN_PITCH_PX device pixels.
  const { p } = zoomLattice(ZOOM_DOT_CAP);
  return Math.abs(p * ZOOM_REF_PX_PER_UNIT - ZOOM_MIN_PITCH_PX) < 0.15;
})());

// ---- the packing is hexagonal, which is the densest one there is ---------
t('rows are offset and spaced like a hex lattice, not a square grid', (() => {
  const { p, rh } = zoomLattice(20000);
  return Math.abs(rh - p * Math.sqrt(3) / 2) / rh < 0.06;   // sqrt(3)/2 row spacing
})());
t('hex packing keeps neighbours further apart than a square grid of the same count', (() => {
  const n = 20000, { w, h, pad } = ZOOM_STAGE;
  const { p, rh } = zoomLattice(n);
  const near = Math.min(p, Math.hypot(p / 2, rh));           // nearest neighbour, hex
  const square = Math.sqrt((w - 2 * pad) * (h - 2 * pad) / n); // nearest neighbour, square
  return near / square > 1.06;                               // theory says 2/sqrt(3) = 1.075
})());
t('every row is full except the last, which carries the remainder', (() => {
  return [7, 1000, 12345, 99999].every(n => {
    const { cols, rows, last } = zoomLattice(n);
    return last >= 1 && last <= cols && (rows - 1) * cols + last === n;
  });
})());

// ---- the dot field ------------------------------------------------------
t('10^0 draws one dot', count(0) === 1);
t('10^2 draws a hundred', count(2) === 100);
t('10^4 now draws all ten thousand', count(4) === 10000);
t('the field caps instead of drawing 10^23 dots', count(23) === ZOOM_DOT_CAP);
t('the cap holds all the way up', [6, 15, 23].every(p => count(p) === ZOOM_DOT_CAP));
t('being capped is reported, so the UI can say so',
  zoomIsCapped(0) === false && zoomIsCapped(4) === false && zoomIsCapped(23) === true);
t('the drawn count and the field agree, so the copy cannot quote a stale number',
  [0, 2, 4, 9, 23].every(p => zoomDrawnCount(p) === count(p)));
t('every count from 1 to 400 is drawn exactly, remainder row and all',
  Array.from({ length: 400 }, (_, i) => i + 1).every(n => count(Math.log10(n)) === n));
t('the tiling covers whole tiles only, so no dot is ever half-drawn',
  [0, 2, 4, 7, 23].every(p => dotsOf(zoomDotsSvg(p)).exact));

// Dots shrink as the count grows — the field goes on straining until it is full,
// which is the whole teaching point. Past the cap it holds at the resolution floor
// instead of shrinking to nothing: a fading field would read as FEWER particles.
t('dots shrink as the power climbs', radius(0) > radius(2) && radius(2) > radius(4) && radius(4) > radius(23));
t('the shrink stops at the cap rather than fading out', radius(23) === radius(15) && radius(23) > 0.2);
t('dots never touch, so the field stays countable', (() => {
  const { p, rh, r } = zoomLattice(ZOOM_DOT_CAP);
  return 2 * r < Math.min(p, Math.hypot(p / 2, rh));
})());

t('every dot lands inside the 320x200 stage', (() => {
  const { dots, n } = dotsOf(zoomDotsSvg(23));
  return n === ZOOM_DOT_CAP && dots.every(d =>
    d.x - d.r >= 0 && d.x + d.r <= 320 && d.y - d.r >= 0 && d.y + d.r <= 200);
})());
t('a sparse field is inside the stage too, where the dots are large', (() => {
  return [0, 1, 2, 3].every(p => dotsOf(zoomDotsSvg(p)).dots.every(d =>
    d.x - d.r >= 0 && d.x + d.r <= 320 && d.y - d.r >= 0 && d.y + d.r <= 200));
})());
t('the fragment is drawing primitives only, so x-html cannot inject markup',
  [0, 4, 23].every(p => (zoomDotsSvg(p).match(/<\/?([a-zA-Z]+)/g) || [])
    .every(tag => ['<defs', '</defs', '<pattern', '</pattern', '<circle', '</circle', '<rect', '</rect']
      .includes(tag))));
t('ids are prefixed, so two fields on a page cannot capture each other\'s paint', (() => {
  const a = zoomDotsSvg(4), b = zoomDotsSvg(4, { id: 'other' });
  return a.includes('url(#zoomdot-a)') && b.includes('url(#other-a)') && !b.includes('#zoomdot-');
})());
t('stage size is overridable', (() => {
  const { dots } = dotsOf(zoomDotsSvg(2, { w: 100, h: 100 }));
  return dots.length === 100 && dots.every(d => d.x <= 100 && d.y <= 100);
})());
t('a stage of a different shape still draws the exact count',
  count(3, { w: 600, h: 120 }) === 1000 && count(3, { w: 120, h: 600 }) === 1000);
t('the fragment stays small no matter how many dots it stands for',
  zoomDotsSvg(23).length < 60000);

// ---- the factory both units spread -------------------------------------
const z = createMoleZoom();
t('starts at 10^0', z.zoomPow === 0);
t('exposes the slider maximum for the markup to bind', z.ZOOM_MAX_POW === ZOOM_MAX_POW);
t('starts at the reference resolution until something measures the stage',
  z.zoomPxPerUnit === ZOOM_REF_PX_PER_UNIT && z.zoomCap() === ZOOM_DOT_CAP);
t('the readout follows the slider', (() => { z.zoomPow = 6; return z.zoomCount() === '10<sup>6</sup>'; })());
t('the analogy follows the slider', z.zoomAnalogy().includes('million'));
t('the capped flag follows the slider', z.zoomCapped() === true);
t('the dot field follows the slider', dotsOf(z.zoomDots()).n === ZOOM_DOT_CAP);
t('the drawn-count line follows the slider', z.zoomDrawn() === ZOOM_DOT_CAP.toLocaleString('en-US'));
t('back down to one particle, everything follows', (() => {
  z.zoomPow = 0;
  return z.zoomCount() === '1' && z.zoomCapped() === false && dotsOf(z.zoomDots()).n === 1;
})());
t('an initial power can be supplied', createMoleZoom({ pow: 12 }).zoomCount() === '10<sup>12</sup>');
t('two instances do not share state', (() => {
  const a = createMoleZoom(), b = createMoleZoom();
  a.zoomPow = 20;
  return b.zoomPow === 0;
})());

// A measured stage feeds straight back into the field: this is what zoomWatch()
// writes, and the cap, the flag and the copy all have to move with it.
t('a denser measured stage packs more dots in the same box', (() => {
  const a = createMoleZoom({ pow: 23 }), b = createMoleZoom({ pow: 23 });
  b.zoomPxPerUnit = 2 * ZOOM_REF_PX_PER_UNIT;
  return dotsOf(b.zoomDots()).n > 3.9 * dotsOf(a.zoomDots()).n;
})());
t('zoomWatch measures the element and survives having no ResizeObserver', (() => {
  const z2 = createMoleZoom();
  z2.zoomWatch({ getBoundingClientRect: () => ({ width: 640 }) });
  return Math.abs(z2.zoomPxPerUnit - 640 / ZOOM_STAGE.w) < 1e-9;
})());
t('a stage that is still hidden behind x-show keeps the fallback', (() => {
  const z2 = createMoleZoom();
  z2.zoomWatch({ getBoundingClientRect: () => ({ width: 0 }) });
  return z2.zoomPxPerUnit === ZOOM_REF_PX_PER_UNIT;
})());

// THE contract with the units: both take these fields with `...createMoleZoom()`,
// and object spread READS an accessor and copies the value it returned. Getters
// here would flatten into frozen constants, so the markup would read "1 particle"
// forever while the slider moved underneath it. These must survive a spread.
const spread = { ...createMoleZoom() };
spread.zoomPow = 12;
t('the readouts survive an object spread (methods, not getters)',
  spread.zoomCount() === '10<sup>12</sup>' && spread.zoomAnalogy().includes('trillion')
  && spread.zoomCapped() === true && dotsOf(spread.zoomDots()).n === ZOOM_DOT_CAP);
t('every readout is a function, so no unit can spread it into a constant',
  ['zoomCount', 'zoomCapped', 'zoomAnalogy', 'zoomDots', 'zoomDrawn', 'zoomCap', 'zoomWatch']
    .every(k => typeof createMoleZoom()[k] === 'function'));
t('a spread copy still starts from its own power', { ...createMoleZoom() }.zoomCount() === '1');

console.log(`molezoom: ${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
