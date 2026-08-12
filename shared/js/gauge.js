// gauge.js — shared live-readout dials for control-driven numbers.
// Mirrors chem.js / game.js / render.js: PURE, node-tested model helpers
// (dialModel and the axis + plain-language functions it composes) plus a
// registerGauge(Alpine) that owns the DOM. That is the same split render.js
// uses for x-ce / x-tex, so there is exactly one dial implementation and the
// units only describe what they are measuring.
//
// WHY a dial at all. A card that reads "×0.329" states the number but not the
// story. A student reading it has to do the interpreting the card should have
// done: which side of the baseline is this, and which way did my last slider
// move push it. The dial answers both, so the number stops being an opaque
// multiplier and becomes a position the learner can watch travel.
//
// SCIENTIFIC CHOICES, because a gauge that misrepresents its own scale teaches
// worse than no gauge:
//   * A multiplier is a RATIO, so the ratio axis is LOGARITHMIC and centered on
//     the baseline. ×1/2 and ×2 sit the same distance from center, which is the
//     honest picture of "half" against "double". On a linear 0..max axis the
//     halving would read as a small nudge and the doubling as a huge one, and a
//     student would draw the wrong conclusion from a correct number.
//   * The baseline is always drawn and labeled, so the bar reads as a deviation
//     from a stated reference, never as a fill from an implied zero.
//   * Off-scale values are capped AND announced ("off the top"), never silently
//     pinned at the end where they would look like an exact maximum.
//   * Direction is side-of-baseline + arrow + word, never hue alone, and never
//     borrows success/danger: a falling pressure is not a failure. Copper stays
//     Honors-only, so the dial lives entirely in the teal ramp.
//   * The trend readout compares against the PREVIOUS setting, so cause (the
//     slider) and effect (the number) stay linked in one glance.
import { fmt } from './chem.js';

// Tick anchors for a ratio axis. Kept to factor-shaped numbers so a fold of 3
// reads "×1/2 ×1 ×2" and a fold of 20 reads "×1/5 ×1 ×5", instead of the 1.5s
// and 2.5s a general-purpose nice-number ladder would produce.
const NICE_FACTORS = [1, 2, 3, 5, 10];

// Named fractions/multiples a student can picture without arithmetic. Anything
// outside the table falls back to an honest percentage or multiplier.
const FRACTION_WORD = { 2: 'half', 3: 'a third', 4: 'a quarter', 5: 'a fifth', 8: 'an eighth', 10: 'a tenth' };
const MULTIPLE_WORD = { 2: 'double', 3: 'triple' };

const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);

// PURE. Snap x to the nearest factor-shaped number (1, 2, 3, 5 x a power of ten).
export function niceFactor(x) {
  if (!(x > 0) || !isFinite(x)) return 1;
  const decade = 10 ** Math.floor(Math.log10(x));
  const m = x / decade;
  let best = NICE_FACTORS[0];
  for (const n of NICE_FACTORS) if (Math.abs(n - m) < Math.abs(best - m)) best = n;
  return best * decade;
}

// PURE. Position of a ratio on a log axis running 1/fold .. fold, so the
// baseline ratio of 1 lands at exactly 0.5 and reciprocals are symmetric.
export function ratioPos(ratio, fold = 3) {
  const f = fold > 1 ? fold : 2;
  if (!(ratio > 0) || !isFinite(ratio)) return 0.5;
  // The three anchors are returned exactly rather than computed, so the baseline
  // tick and a needle sitting on it land on the same pixel instead of an ulp apart.
  if (ratio >= f) return 1;
  if (ratio <= 1 / f) return 0;
  return 0.5 + Math.log(ratio) / (2 * Math.log(f));
}

// PURE. Position on a linear axis.
export function linPos(value, min, max) {
  if (!(max > min)) return 0;
  return (clamp(value, min, max) - min) / (max - min);
}

// PURE. Position on a log10 axis (both bounds must be positive).
export function logPos(value, min, max) {
  if (!(min > 0) || !(max > min) || !(value > 0)) return 0;
  return (Math.log10(clamp(value, min, max)) - Math.log10(min)) / (Math.log10(max) - Math.log10(min));
}

// PURE. Plain-language reading of a ratio: the sentence a student can act on
// after seeing "×0.329". Leads with a picturable size, then the honest percent.
export function ratioPhrase(ratio, refLabel = 'the baseline') {
  if (!(ratio > 0) || !isFinite(ratio)) return '';
  if (Math.abs(ratio - 1) < 0.005) return `the same as ${refLabel}`;
  if (ratio < 1) {
    let head = `${Math.round(ratio * 100)}% of ${refLabel}`;
    for (const n of Object.keys(FRACTION_WORD)) {
      if (Math.abs(ratio * Number(n) - 1) <= 0.04) { head = `${FRACTION_WORD[n]} of ${refLabel}`; break; }
    }
    return `${head} · ${Math.round((1 - ratio) * 100)}% lower`;
  }
  let head = `${fmt(ratio, 3)}× ${refLabel}`;
  for (const k of Object.keys(MULTIPLE_WORD)) {
    if (Math.abs(ratio / Number(k) - 1) <= 0.04) { head = `${MULTIPLE_WORD[k]} ${refLabel}`; break; }
  }
  // Past about five-fold the percentage stops helping: "18.8× the baseline" is
  // already the clearest possible statement, and "1775% higher" beside it is
  // just a bigger number to parse. Below five-fold the percentage is the more
  // intuitive half of the pair, so it stays.
  if (ratio >= 5) return head;
  return `${head} · ${Math.round((ratio - 1) * 100)}% higher`;
}

// PURE. Tick anchors for a ratio axis: the two ends, the baseline, and one
// factor-shaped step on each side. Returns [] worth of {pos,label,ref} rows.
export function ratioTicks(fold = 3) {
  const f = fold > 1 ? fold : 2;
  const mid = niceFactor(Math.sqrt(f));
  const values = mid > 1 && mid < f ? [1 / f, 1 / mid, 1, mid, f] : [1 / f, 1, f];
  return values.map(v => ({
    pos: ratioPos(v, f),
    label: v === 1 ? '×1' : v < 1 ? `×1/${fmt(1 / v, 2)}` : `×${fmt(v, 2)}`,
    ref: v === 1
  }));
}

// PURE. The full view model for one dial. `spec` describes what is being
// measured; `prev` is the value at the previous paint (null on first paint, and
// reset whenever the axis itself changes, because a delta across two different
// axes would be meaningless).
//
// spec = {
//   kind: 'ratio' | 'span' | 'decade',
//   value, label,
//   fold,                        // ratio: axis runs 1/fold .. fold (default 3)
//   min, max,                    // span/decade: axis bounds
//   ref, refLabel,               // reference marker + what to call it
//   unit, digits,                // display suffix + significant figures
//   bands: [{ upTo, label }]     // span: named regions, e.g. bond character
// }
export function dialModel(spec, prev = null) {
  const kind = spec.kind === 'span' || spec.kind === 'decade' ? spec.kind : 'ratio';
  const digits = spec.digits ?? 3;
  const unit = spec.unit ?? '';
  const value = spec.value;
  const ok = typeof value === 'number' && isFinite(value);

  let lo, hi, pos, refPos, refValue, ticks, read, valueText, over = null;

  if (kind === 'ratio') {
    const fold = spec.fold > 1 ? spec.fold : 3;
    refValue = spec.ref > 0 ? spec.ref : 1;
    const ratio = ok ? value / refValue : 1;
    lo = refValue / fold; hi = refValue * fold;
    pos = ratioPos(ratio, fold);
    refPos = 0.5;
    ticks = ratioTicks(fold);
    read = ok ? ratioPhrase(ratio, spec.refLabel ?? 'the baseline') : '';
    valueText = ok ? `×${fmt(ratio, digits)}` : '-';
    if (ok && ratio > hi / refValue) over = 'hi';
    if (ok && ratio < lo / refValue) over = 'lo';
  } else {
    lo = spec.min ?? 0; hi = spec.max ?? 1;
    const place = kind === 'decade' ? logPos : linPos;
    pos = ok ? place(value, lo, hi) : 0;
    refValue = typeof spec.ref === 'number' && isFinite(spec.ref) ? spec.ref : null;
    refPos = refValue === null ? null : place(refValue, lo, hi);
    valueText = ok ? `${fmt(value, digits)}${unit}` : '-';
    ticks = spanTicks(kind, lo, hi, refValue, spec.refLabel, unit, digits, place);
    // Tolerant at the ends, because a value sitting exactly ON the axis maximum is
    // not off it. Math.pow(10,23) and the literal 1e23 differ by an ulp, so an
    // exact `>` here made the top notch of a decade slider report "off the top".
    // The tolerance is relative for a log axis and absolute (scaled to the span)
    // for a linear one, since a linear axis may legitimately straddle zero.
    if (kind === 'decade') {
      if (ok && value > hi * (1 + 1e-9)) over = 'hi';
      if (ok && value > 0 && value < lo * (1 - 1e-9)) over = 'lo';
    } else {
      const eps = Math.abs(hi - lo) * 1e-9;
      if (ok && value > hi + eps) over = 'hi';
      if (ok && value < lo - eps) over = 'lo';
    }
  }

  // Fill spans reference -> needle when there is a reference (so it reads as a
  // deviation), otherwise from the axis floor (so it reads as an amount).
  const anchor = refPos === null ? 0 : refPos;
  const fillFrom = Math.min(anchor, pos);
  const fillTo = Math.max(anchor, pos);

  const dir = refPos === null ? 'none'
    : Math.abs(pos - refPos) < 0.001 ? 'at' : pos > refPos ? 'up' : 'down';

  // The span reading is resolved AFTER dir so the two can never contradict each
  // other. A gap the dial is too coarse to draw is reported as "right on" instead
  // of as a string of decimals the learner would read as a miss.
  if (kind !== 'ratio') read = spanPhrase(spec, value, ok, refValue, unit, digits, dir);

  if (over) read = `${read ? read + ' · ' : ''}off the ${over === 'hi' ? 'top' : 'bottom'} of the dial`;

  // Trend against the previous setting: the direct answer to "did my move push
  // this up or down". Rendered as arrow + word + amount, never colour alone.
  let trend = 'steady', trendText = '', prevPos = null;
  if (ok && typeof prev === 'number' && isFinite(prev)) {
    let delta, shown, suffix, real;
    if (kind === 'decade' && value > 0 && prev > 0) {
      // On a log axis the change worth reporting is how many decades were crossed,
      // NOT the arithmetic difference. 10^6 -> 10^23 and 10^23 -> 10^12 both differ
      // by ~1e23, so the raw subtraction labelled a 17-decade climb and an
      // 11-decade drop as the same size move — the opposite of what the dial is for.
      delta = Math.log10(value) - Math.log10(prev);
      shown = fmt(Math.abs(delta), digits);
      suffix = shown === '1' ? ' power of ten' : ' powers of ten';
      real = Math.abs(delta) > 1e-6;
    } else {
      delta = kind === 'ratio' ? (value - prev) / refValue : value - prev;
      shown = fmt(Math.abs(delta), digits);
      suffix = kind === 'ratio' ? '' : unit;
      // Float noise below a millionth of the axis is not a change the learner made.
      real = Math.abs(delta) > (kind === 'ratio' ? 1 : Math.abs(hi - lo)) * 1e-6;
    }
    if (real && shown !== '0' && shown !== '-') {
      trend = delta > 0 ? 'rising' : 'falling';
      trendText = `${trend === 'rising' ? 'up' : 'down'} ${shown}${suffix}`;
      prevPos = kind === 'ratio' ? ratioPos(prev / refValue, spec.fold > 1 ? spec.fold : 3)
        : (kind === 'decade' ? logPos : linPos)(prev, lo, hi);
    }
  }

  const dirWord = dir === 'up' ? `above ${spec.refLabel ?? 'the baseline'}`
    : dir === 'down' ? `below ${spec.refLabel ?? 'the baseline'}`
    : dir === 'at' ? `at ${spec.refLabel ?? 'the baseline'}` : '';

  return {
    kind, pos, refPos, prevPos, fillFrom, fillTo, dir, dirWord,
    trend, trendText, trendIcon: trend === 'rising' ? '▲' : trend === 'falling' ? '▼' : '–',
    read, valueText, ticks, over, lo, hi, refValue,
    tone: toneOf(spec.tone),
    label: spec.label ?? '',
    axisKey: axisKey(spec, kind),
    ariaText: [`${spec.label ?? 'reading'}: ${valueText}`, dirWord, read, trendText && `${trendText} since the last change`]
      .filter(Boolean).join('. ') + '.'
  };
}

// PURE. Identity of the axis a dial is drawn on. When this changes the learner
// is looking at a different measurement (a new element, a new case), so the
// stored previous value is dropped rather than compared across axes.
export function axisKey(spec, kind = spec.kind) {
  return [spec.series ?? '', kind, spec.fold ?? '', spec.min ?? '', spec.max ?? '', spec.ref ?? '', spec.unit ?? ''].join('|');
}

function spanTicks(kind, lo, hi, refValue, refLabel, unit, digits, place) {
  const out = [kind === 'decade'
    ? { pos: 0, ...exp10Parts(lo) }
    : { pos: 0, label: `${fmt(lo, digits)}${unit}` }];
  if (kind === 'decade') {
    const step = Math.max(1, Math.round((Math.log10(hi) - Math.log10(lo)) / 4));
    for (let p = Math.ceil(Math.log10(lo)) + step; p < Math.log10(hi) - 0.5; p += step) {
      out.push({ pos: place(10 ** p, lo, hi), ...exp10Parts(10 ** p) });
    }
  }
  if (refValue !== null) {
    out.push({ pos: place(refValue, lo, hi), label: refLabel ?? `${fmt(refValue, digits)}${unit}`, ref: true });
  }
  out.push(kind === 'decade'
    ? { pos: 1, ...exp10Parts(hi) }
    : { pos: 1, label: `${fmt(hi, digits)}${unit}` });
  return out.sort((a, b) => a.pos - b.pos);
}

function spanPhrase(spec, value, ok, refValue, unit, digits, dir) {
  if (!ok) return '';
  if (Array.isArray(spec.bands) && spec.bands.length) {
    const band = spec.bands.find(b => value < b.upTo) ?? spec.bands[spec.bands.length - 1];
    if (band) return band.label;
  }
  if (refValue !== null) {
    const d = value - refValue;
    const shown = fmt(Math.abs(d), digits);
    if (dir === 'at' || shown === '0') return `right on ${spec.refLabel ?? 'the reference'}`;
    return `${shown}${unit} ${d > 0 ? 'above' : 'below'} ${spec.refLabel ?? 'the reference'}`;
  }
  if (spec.kind === 'decade') {
    const p = Math.round(Math.log10(value));
    if (p === 0) return 'the base of the scale';
    return `${p} ${p === 1 ? 'power' : 'powers'} of ten above 1`;
  }
  return '';
}

// PURE. A power of ten split into what sits on the baseline and what is raised:
// 10^23 -> { label: '10', exp: '23' }. 10²³ rather than 1e+23 because the exponent
// is the thing being taught, and split rather than formatted into one string
// because of how it has to be DRAWN.
//
// Unicode superscript characters look like the obvious answer and are a trap here.
// JetBrains Mono carries ¹ ² ³ — they are Latin-1 — but NOT ⁰ or ⁴-⁹, which live in
// the U+2070 block. Measured in the page at 40px: a digit and ¹²³ all advance 24.00px
// while ⁰⁴⁵⁶⁷⁸⁹ advance 23.44px, i.e. they are quietly coming from a fallback face.
// So "10¹²" would render wholly in the dial's monospace and "10⁶" would not, mixing
// two typefaces across one axis and breaking the monospace advance that
// tickLabelPoint's width estimate assumes. Raising a normal digit sidesteps the
// font's coverage entirely: every exponent is drawn in the same face as every other.
export function exp10Parts(v) {
  const p = Math.round(Math.log10(v));
  return p === 0 ? { label: '1' } : { label: '10', exp: String(p) };
}

// PURE. Width of a tick label in characters, counting a raised exponent at the
// reduced size it is actually drawn. tickLabelPoint uses this to keep a label on
// the face, so it has to measure what the eye sees, not the string's length.
export function tickChars(t) {
  return t.label.length + (t.exp ? t.exp.length * EXP_SCALE : 0);
}

// How a raised exponent is drawn, shared by the SVG dial and any HTML readout that
// prints the same notation: 68% of the size, lifted a third of the baseline size.
export const EXP_SCALE = 0.68, EXP_RISE = 0.32;

// ---------------------------------------------------------------------------
// Half-circle geometry. Pure and exported so the arc maths is node-tested: a
// gauge whose needle and whose coloured arc disagree about where a value sits
// is worse than a bare number, and that is an arithmetic bug, not a CSS one.
// ---------------------------------------------------------------------------

// One face for every dial, in its own viewBox units. The two ends of the arc sit
// on the cy baseline, which leaves the bottom strip free for the end labels and
// the inside of the arc free for the needle.
//
// Sized to stay an instrument rather than a centrepiece: three of these have to
// sit in one .stat-row without the row eating a 15-inch laptop screen. Everything
// scales together, so the only real constraint is that the tick text still lands
// near 12px once the face is drawn at its capped width (see components.css):
// 9 units x 150px / 112 units = 12.05px.
const _geom = {
  vw: 112, vh: 70, cx: 56, cy: 55, r: 34, stroke: 7,
  labelR: 47,      // tick text rides this radius, clear of the arc's outer edge
  endLabelDy: 11,  // ...except the two ends, which drop below the baseline
  tickFont: 9,     // set as an SVG attribute, so JS owns the size the maths assumes
  needleR: 28, hubR: 3.2
};
_geom.viewBox = `0 0 ${_geom.vw} ${_geom.vh}`;
export const DIAL_GEOM = Object.freeze(_geom);

// PURE. Degrees from the +x axis. pos 0 is the left end (180), pos 0.5 the apex
// (90), pos 1 the right end (0).
export function arcAngle(pos) { return 180 - clamp(pos, 0, 1) * 180; }

// PURE. Point at `radius` for a position, in viewBox units (y grows downward).
export function arcPoint(pos, radius, g = DIAL_GEOM) {
  const t = arcAngle(pos) * Math.PI / 180;
  return { x: g.cx + radius * Math.cos(t), y: g.cy - radius * Math.sin(t) };
}

// PURE. Rotation for a needle drawn pointing straight up from the hub.
export function needleRotation(pos) { return (clamp(pos, 0, 1) - 0.5) * 180; }

// PURE. The semicircle, as two quarter arcs. A single 180-degree arc segment is
// the degenerate case where the large-arc flag means nothing, so splitting it at
// the apex keeps the path unambiguous in every renderer.
export function arcPathD(g = DIAL_GEOM) {
  // Rounded at the string boundary, not in arcPoint: sin(PI) is 1.22e-16 rather
  // than 0, so the untrimmed left endpoint reads "63.99999999999999".
  const n = v => +v.toFixed(3);
  const a = arcPoint(0, g.r, g), m = arcPoint(0.5, g.r, g), b = arcPoint(1, g.r, g);
  return `M ${n(a.x)} ${n(a.y)} A ${g.r} ${g.r} 0 0 1 ${n(m.x)} ${n(m.y)} A ${g.r} ${g.r} 0 0 1 ${n(b.x)} ${n(b.y)}`;
}

// PURE. dasharray/dashoffset that reveal only the arc between two positions of
// a path whose total length is `pathLen`. One static path can then animate any
// segment through CSS, which is what keeps the sweep smooth instead of redrawn.
export function arcSegment(fromPos, toPos, pathLen) {
  const a = clamp(Math.min(fromPos, toPos), 0, 1), b = clamp(Math.max(fromPos, toPos), 0, 1);
  return { dash: `${(b - a) * pathLen} ${pathLen}`, offset: -a * pathLen };
}

// PURE. Where a tick's text sits. The two ends drop to the bottom corners, the
// dashboard idiom, because following the circle out there would push them
// through the side of the viewBox.
//
// `chars` is the label's character count. The scale is monospaced, so half its
// width is arithmetic rather than a measurement, and a long label can be nudged
// inward until it fits. Without that, an axis in scientific notation ("2.84e-19
// J" is ten characters) hangs its left end off the side of the face.
export function tickLabelPoint(pos, g = DIAL_GEOM, chars = 0) {
  const half = chars * 0.6 * g.tickFont / 2;
  const fit = x => Math.min(Math.max(x, half + 1), g.vw - half - 1);
  if (pos <= 0.02) return { x: fit(g.cx - g.r), y: g.cy + g.endLabelDy, anchor: 'middle' };
  if (pos >= 0.98) return { x: fit(g.cx + g.r), y: g.cy + g.endLabelDy, anchor: 'middle' };
  const p = arcPoint(pos, g.labelR, g);
  return { x: fit(p.x), y: p.y, anchor: 'middle' };
}

// Categorical hues. A tone says WHICH quantity a gauge reads, never whether its
// value is good: pressure falling is not a failure, so the arc keeps one hue
// across its whole travel and direction stays with the arrow, the word, and the
// side of the reference the arc grows from. Drawn from render.js's species
// palette so a dial and a chart of the same thing agree. Copper and amber are
// left out: those are Honors and warn, and they mean something else here.
export const DIAL_TONES = Object.freeze(['teal', 'indigo', 'green', 'plum', 'slate']);
const toneOf = t => (DIAL_TONES.includes(t) ? t : 'teal');

// ---------------------------------------------------------------------------
// DOM half. Built once per element, then updated in place so the CSS
// transitions actually run (re-writing innerHTML would restart them).
// ---------------------------------------------------------------------------

const SETTLE_MS = 1500; // how long the trend chip + ghost needle stay up
const SVG_NS = 'http://www.w3.org/2000/svg';

const svgEl = (name, attrs) => {
  const n = document.createElementNS(SVG_NS, name);
  for (const k in attrs) n.setAttribute(k, attrs[k]);
  return n;
};

function buildDial(el) {
  const g = DIAL_GEOM;
  el.classList.add('dial');
  el.setAttribute('role', 'meter');

  // The SVG is aria-hidden: the host div carries role="meter" plus the name and
  // the spoken reading, so a screen reader gets one instrument, not a shape tree.
  const svg = svgEl('svg', { class: 'dial-face', viewBox: g.viewBox, 'aria-hidden': 'true', focusable: 'false' });
  // Stroke width comes from the geometry, not from CSS, so the arc thickness can
  // never drift out of step with the radius the label maths was sized against.
  const arc = { d: arcPathD(g), fill: 'none', 'stroke-linecap': 'round', 'stroke-width': g.stroke };
  const track = svgEl('path', { ...arc, class: 'dial-arc-track' });
  const fill = svgEl('path', { ...arc, class: 'dial-arc-fill' });
  const cap = svgEl('path', { ...arc, class: 'dial-arc-cap' });
  const ticks = svgEl('g', { class: 'dial-ticks' });
  const ref = svgEl('line', { class: 'dial-arc-ref' });
  // "You were here": a hollow bead ON the arc, not a second needle. Drawn at the
  // apex and rotated into place, so one transform animates it along the arc.
  const ghost = svgEl('g', { class: 'dial-ghost' });
  ghost.appendChild(svgEl('circle', { cx: g.cx, cy: g.cy - g.r, r: 2.6 }));
  const needle = svgEl('line', { class: 'dial-needle', x1: g.cx, y1: g.cy, x2: g.cx, y2: g.cy - g.needleR });
  const hub = svgEl('circle', { class: 'dial-hub', cx: g.cx, cy: g.cy, r: g.hubR });
  const scale = svgEl('g', { class: 'dial-scale' });
  svg.append(track, fill, cap, ticks, ref, ghost, needle, hub, scale);

  const foot = document.createElement('div');
  foot.className = 'dial-foot';
  foot.innerHTML =
    '<span class="dial-trend"><span class="dial-arrow"></span><span class="dial-trend-text"></span></span>' +
    '<span class="dial-read"></span>';

  el.replaceChildren(svg, foot);

  // Measured once: the browser flattens the two quarter arcs, so its own idea of
  // the path length is the one the dash maths has to agree with. Falls back to
  // the exact semicircle if the element is somewhere getTotalLength cannot run.
  const pathLen = track.getTotalLength?.() || Math.PI * g.r;

  return {
    el, g, pathLen, track, fill, cap, ticks, ref, ghost, needle, scale,
    trend: foot.querySelector('.dial-trend'),
    arrow: foot.querySelector('.dial-arrow'),
    trendText: foot.querySelector('.dial-trend-text'),
    read: foot.querySelector('.dial-read'),
    tickKey: ''
  };
}

// Point a needle-style line at a position by rotating it about the hub.
function aimNeedle(line, pos, g) {
  line.setAttribute('transform', `rotate(${needleRotation(pos).toFixed(2)} ${g.cx} ${g.cy})`);
}

function paintDial(p, m) {
  const g = p.g;
  p.el.dataset.dir = m.dir;
  p.el.dataset.trend = m.trend;
  p.el.dataset.over = m.over ?? '';
  p.el.dataset.tone = m.tone;
  p.el.setAttribute('aria-label', m.label);
  // Bounds are the dial's own 0..1 axis (a ratio dial's ends are not raw values),
  // and aria-valuetext carries the reading a screen reader actually announces.
  p.el.setAttribute('aria-valuemin', '0');
  p.el.setAttribute('aria-valuemax', '1');
  p.el.setAttribute('aria-valuenow', m.pos.toFixed(3));
  p.el.setAttribute('aria-valuetext', m.ariaText);

  // The coloured sweep runs reference -> needle, so its LENGTH is the size of the
  // deviation and the side it grows toward is the direction.
  const seg = arcSegment(m.fillFrom, m.fillTo, p.pathLen);
  p.fill.style.strokeDasharray = seg.dash;
  p.fill.style.strokeDashoffset = seg.offset;

  // Capped-and-said-so: the far sliver of the arc darkens when the value is off
  // scale, paired with the words in .dial-read.
  const capSeg = m.over === 'hi' ? arcSegment(0.94, 1, p.pathLen)
    : m.over === 'lo' ? arcSegment(0, 0.06, p.pathLen) : null;
  if (capSeg) { p.cap.style.strokeDasharray = capSeg.dash; p.cap.style.strokeDashoffset = capSeg.offset; }

  aimNeedle(p.needle, m.pos, g);
  p.ghost.style.display = m.prevPos === null ? 'none' : '';
  if (m.prevPos !== null) aimNeedle(p.ghost, m.prevPos, g);

  p.ref.style.display = m.refPos === null ? 'none' : '';
  if (m.refPos !== null) {
    // Crosses the arc, so the baseline reads as a datum on the scale rather than
    // as one more tick outside it.
    const a = arcPoint(m.refPos, g.r - 7, g), b = arcPoint(m.refPos, g.r + 8, g);
    p.ref.setAttribute('x1', a.x.toFixed(2)); p.ref.setAttribute('y1', a.y.toFixed(2));
    p.ref.setAttribute('x2', b.x.toFixed(2)); p.ref.setAttribute('y2', b.y.toFixed(2));
  }

  const tickKey = m.ticks.map(t => t.label + (t.exp ? '^' + t.exp : '')).join('|');
  if (tickKey !== p.tickKey) {
    p.tickKey = tickKey;
    p.ticks.replaceChildren();
    p.scale.replaceChildren();
    m.ticks.forEach((t, i) => {
      // The two ends and the reference always show. Everything between them is
      // "mid" and is dropped by a container query when the card gets too narrow
      // for the labels to clear each other. See components.css.
      const mid = !t.ref && i !== 0 && i !== m.ticks.length - 1;
      const cls = (t.ref ? ' is-ref' : '') + (mid ? ' is-mid' : '');
      // Tick marks only for the intermediate stops. The reference has its own
      // marker, and at the two ends a radial mark comes out horizontal and reads
      // as a stray dash beside a label that has already dropped below the arc.
      if (mid) {
        const a = arcPoint(t.pos, g.r + 5.5, g), b = arcPoint(t.pos, g.r + 8.5, g);
        p.ticks.appendChild(svgEl('line', {
          class: 'dial-tick-mark' + cls,
          x1: a.x.toFixed(2), y1: a.y.toFixed(2), x2: b.x.toFixed(2), y2: b.y.toFixed(2)
        }));
      }
      const at = tickLabelPoint(t.pos, g, tickChars(t));
      const text = svgEl('text', {
        class: 'dial-tick' + cls,
        x: at.x.toFixed(2), y: at.y.toFixed(2), 'text-anchor': at.anchor,
        'font-size': g.tickFont
      });
      text.textContent = t.label;
      // The exponent is a raised, reduced run in the SAME face rather than a
      // Unicode superscript character, which the dial's monospace only carries
      // for 1, 2 and 3 (see exp10Parts). dy is not reset afterwards because the
      // exponent is always the last run in the label.
      if (t.exp) {
        const sup = svgEl('tspan', {
          'font-size': (g.tickFont * EXP_SCALE).toFixed(2),
          dy: (-g.tickFont * EXP_RISE).toFixed(2)
        });
        sup.textContent = t.exp;
        text.appendChild(sup);
      }
      p.scale.appendChild(text);
    });
  }

  p.arrow.textContent = m.trendIcon;
  p.trendText.textContent = m.trendText;
  p.trend.hidden = m.trend === 'steady';
  p.read.textContent = m.read;
}

// Register the x-gauge directive. Usage, alongside the number it explains:
//   <div x-gauge="{ kind:'ratio', value: relP, label:'relative pressure',
//                   fold: 20, refLabel:'the 300 K, 40-particle baseline',
//                   tone:'indigo' }"></div>
// The previous value lives in a directive-local closure, NOT in Alpine state,
// so painting never writes reactive data and the effect cannot re-trigger
// itself. That also means no unit has to wire up an @input handler to get a
// trend: any expression Alpine can watch works, slider or stepper or select.
export function registerGauge(Alpine) {
  Alpine.directive('gauge', (el, { expression }, { evaluateLater, effect, cleanup }) => {
    const get = evaluateLater(expression);
    const parts = buildDial(el);
    let prev = null, axis = null, timer = null;
    effect(() => get(spec => {
      if (!spec || typeof spec !== 'object') return;
      const key = axisKey(spec);
      if (key !== axis) { axis = key; prev = null; }       // new measurement, no delta
      const m = dialModel(spec, prev);
      paintDial(parts, m);
      if (typeof spec.value === 'number' && isFinite(spec.value)) prev = spec.value;
      if (m.trend !== 'steady') {
        el.classList.add('is-moving');
        clearTimeout(timer);
        timer = setTimeout(() => el.classList.remove('is-moving'), SETTLE_MS);
      }
    }));
    cleanup(() => clearTimeout(timer));
  });
}
