// tests/gauge.test.js — regression tests for the pure dial model.
// Run the same way as the engine tests: node tests/gauge.test.js
// The DOM half (buildDial/paintDial/registerGauge) is deliberately not tested
// here; everything a wrong dial could misteach lives in these pure functions.
import {
  niceFactor, ratioPos, linPos, logPos, ratioPhrase, ratioTicks, dialModel, axisKey,
  DIAL_GEOM, DIAL_TONES, arcAngle, arcPoint, needleRotation, arcPathD, arcSegment, tickLabelPoint,
  exp10Parts, tickChars, EXP_SCALE
} from '../shared/js/gauge.js';

const approx = (a, b, t = 1e-9) => Math.abs(a - b) < t;
let pass = 0, fail = 0;
const t = (name, cond) => { cond ? pass++ : (fail++, console.log('FAIL:', name)); };

// ---- niceFactor: tick anchors stay factor-shaped -------------------------
t('niceFactor snaps sqrt(3) to 2 (gives x1/2, x2 ticks)', niceFactor(Math.sqrt(3)) === 2);
t('niceFactor snaps sqrt(20) to 5 (gives x1/5, x5 ticks)', niceFactor(Math.sqrt(20)) === 5);
t('niceFactor crosses decades', niceFactor(43) === 50 && niceFactor(11) === 10);
t('niceFactor survives garbage', niceFactor(0) === 1 && niceFactor(-4) === 1 && niceFactor(NaN) === 1);

// ---- ratioPos: THE core scientific claim of the component ----------------
// A multiplier is a ratio, so the axis is logarithmic about the baseline.
t('baseline ratio sits dead centre', ratioPos(1, 3) === 0.5);
t('x1/3 pins the low end of a 3-fold axis', approx(ratioPos(1 / 3, 3), 0));
t('x3 pins the high end of a 3-fold axis', approx(ratioPos(3, 3), 1));
t('half and double are symmetric about centre',
  approx(0.5 - ratioPos(0.5, 3), ratioPos(2, 3) - 0.5));
t('a tenth and ten-fold are symmetric about centre',
  approx(0.5 - ratioPos(0.1, 20), ratioPos(10, 20) - 0.5));
t('a linear axis would NOT be symmetric (this is why the axis is log)',
  !approx(0.5 - linPos(0.5, 0, 3), linPos(2, 0, 3) - 0.5));
t('off-scale ratios clamp instead of overflowing',
  ratioPos(500, 3) === 1 && ratioPos(0.0001, 3) === 0);
t('a non-positive ratio falls back to centre, not NaN', ratioPos(0, 3) === 0.5 && ratioPos(-2, 3) === 0.5);
t('fold <= 1 is coerced to a usable axis', ratioPos(1, 0.5) === 0.5 && isFinite(ratioPos(2, 1)));

// ---- linPos / logPos ----------------------------------------------------
t('linPos maps range to 0..1', linPos(5, 5, 100) === 0 && linPos(100, 5, 100) === 1);
t('linPos midpoint', approx(linPos(52.5, 5, 100), 0.5));
t('linPos clamps', linPos(-9, 5, 100) === 0 && linPos(999, 5, 100) === 1);
t('linPos does not divide by zero', linPos(3, 5, 5) === 0);
t('logPos spaces decades evenly', approx(logPos(10 ** 12, 1, 10 ** 24), 0.5));
t('logPos clamps and rejects non-positive input', logPos(0, 1, 100) === 0 && logPos(1e9, 1, 100) === 1);

// ---- ratioPhrase: the comprehension fix the cards were missing ----------
t('x0.329 reads as a third, not as an opaque multiplier',
  ratioPhrase(0.329).includes('a third') && ratioPhrase(0.329).includes('67% lower'));
t('x0.5 reads as half', ratioPhrase(0.5).startsWith('half of the baseline'));
t('x0.25 reads as a quarter', ratioPhrase(0.25).startsWith('a quarter of the baseline'));
t('an unnameable fraction falls back to an honest percent',
  ratioPhrase(0.37) === '37% of the baseline · 63% lower');
t('x2 reads as double', ratioPhrase(2).startsWith('double the baseline'));
t('x3 reads as triple', ratioPhrase(3).startsWith('triple the baseline'));
t('x1.25 falls back to a multiplier + percent', ratioPhrase(1.25) === '1.25× the baseline · 25% higher');
t('x1 says so plainly', ratioPhrase(1) === 'the same as the baseline');
t('a large multiplier drops the percent clause, which adds nothing there',
  ratioPhrase(18.8) === '18.8× the baseline');
t('just under five-fold keeps the percent clause', ratioPhrase(4.5) === '4.5× the baseline · 350% higher');
t('a tiny wobble still reads as unchanged', ratioPhrase(1.002) === 'the same as the baseline');
t('the reference can be named for the unit', ratioPhrase(0.5, 'the 300 K baseline').includes('the 300 K baseline'));
t('garbage yields an empty phrase, not a wrong one', ratioPhrase(0) === '' && ratioPhrase(NaN) === '');

// ---- ratioTicks --------------------------------------------------------
const t3 = ratioTicks(3);
t('a 3-fold axis ticks x1/3 x1/2 x1 x2 x3', t3.map(x => x.label).join(' ') === '×1/3 ×1/2 ×1 ×2 ×3');
t('exactly one tick is flagged as the reference', t3.filter(x => x.ref).length === 1);
t('the reference tick sits at centre', t3.find(x => x.ref).pos === 0.5);
t('a 20-fold axis ticks in fifths', ratioTicks(20).map(x => x.label).join(' ') === '×1/20 ×1/5 ×1 ×5 ×20');
t('ticks are ordered low to high', t3.every((x, i) => i === 0 || x.pos >= t3[i - 1].pos));

// ---- dialModel: ratio kind ---------------------------------------------
const p = dialModel({ kind: 'ratio', value: 0.329, fold: 20, label: 'relative pressure' });
t('ratio dial prints the same x-number as its card', p.valueText === '×0.329');
t('ratio dial reports the direction as a word', p.dir === 'down' && p.dirWord === 'below the baseline');
t('ratio dial fill spans baseline -> needle', approx(p.fillTo, 0.5) && p.fillFrom < 0.5);
t('first paint has no trend (nothing to compare against)', p.trend === 'steady' && p.prevPos === null);
t('ratio dial axis bounds follow the fold', approx(p.lo, 0.05) && approx(p.hi, 20));
t('ratio dial carries the plain-language read', p.read.includes('a third'));
t('aria text names the value, side and reading',
  p.ariaText.includes('relative pressure: ×0.329') && p.ariaText.includes('below the baseline'));

const up = dialModel({ kind: 'ratio', value: 1.25, fold: 20 }, 0.329);
t('a rise is reported as rising with the amount', up.trend === 'rising' && up.trendText === 'up 0.921');
t('a rise carries an up arrow', up.trendIcon === '▲');
t('a rise leaves a ghost at the previous reading', approx(up.prevPos, ratioPos(0.329, 20)));
t('a rise above baseline flips the fill to the high side', up.dir === 'up' && approx(up.fillFrom, 0.5));
t('the trend is spoken in the aria text', up.ariaText.includes('up 0.921 since the last change'));

const down = dialModel({ kind: 'ratio', value: 0.5, fold: 3 }, 2);
t('a fall is reported as falling', down.trend === 'falling' && down.trendText === 'down 1.5' && down.trendIcon === '▼');

t('an unchanged value reports steady, not a zero-sized move',
  dialModel({ kind: 'ratio', value: 1.25, fold: 20 }, 1.25).trend === 'steady');
t('float noise does not fake a move',
  dialModel({ kind: 'ratio', value: 1 + 1e-15, fold: 3 }, 1).trend === 'steady');

const atRef = dialModel({ kind: 'ratio', value: 1, fold: 3 });
t('sitting on the baseline is its own state', atRef.dir === 'at' && atRef.dirWord === 'at the baseline');

// A raw value with a named reference must reduce to the same ratio reading.
const raw = dialModel({ kind: 'ratio', value: 150, ref: 300, fold: 3, refLabel: 'the 300 K baseline' });
t('a raw value + ref reads as the ratio between them', raw.valueText === '×0.5' && raw.read.startsWith('half of the 300 K baseline'));
t('a raw-value dial keeps its bounds in raw units', raw.lo === 100 && raw.hi === 900);
const rawUp = dialModel({ kind: 'ratio', value: 450, ref: 300, fold: 3 }, 150);
t('a raw-value delta is reported in ratio units', rawUp.trendText === 'up 1');

// ---- dialModel: over-scale is announced, never silently pinned ----------
const over = dialModel({ kind: 'ratio', value: 50, fold: 3 });
t('off the top is flagged', over.over === 'hi' && over.pos === 1);
t('off the top is said out loud', over.read.includes('off the top of the dial'));
const under = dialModel({ kind: 'ratio', value: 0.01, fold: 3 });
t('off the bottom is flagged and spoken', under.over === 'lo' && under.read.includes('off the bottom of the dial'));
t('in-range readings are not flagged', p.over === null);

// ---- dialModel: span kind ----------------------------------------------
const sp = dialModel({ kind: 'span', value: 25, min: 5, max: 100, unit: ' particles', digits: 3, label: 'particles' });
t('span dial prints value + unit', sp.valueText === '25 particles');
t('span dial has no reference, so it fills from the floor',
  sp.refPos === null && sp.fillFrom === 0 && approx(sp.fillTo, linPos(25, 5, 100)));
t('span dial with no reference has no direction', sp.dir === 'none');
t('span dial ticks the two ends', sp.ticks.length === 2 && sp.ticks[0].label === '5 particles' && sp.ticks[1].label === '100 particles');
const spDelta = dialModel({ kind: 'span', value: 80, min: 5, max: 100, unit: ' particles' }, 25);
t('span dial trend carries the unit', spDelta.trendText === 'up 55 particles');

const spRef = dialModel({ kind: 'span', value: 35.5, min: 34.9, max: 37, ref: 35.45, refLabel: 'table value', digits: 4 });
t('span dial with a reference reports the signed gap',
  spRef.dir === 'up' && spRef.read === '0.05 above table value');
t('span dial reference tick is flagged', spRef.ticks.filter(x => x.ref).length === 1);
t('span dial on the reference says so',
  dialModel({ kind: 'span', value: 35.45, min: 34.9, max: 37, ref: 35.45, refLabel: 'table value', digits: 4 }).read
    === 'right on table value');
// A gap too fine for the dial to draw must not be reported as a miss: "at" and
// "0.0027731 above" contradicted each other before the reading followed dir.
const hair = dialModel({ kind: 'span', value: 35.4527731, min: 33, max: 38, ref: 35.45, refLabel: 'table value', digits: 5 });
t('a gap the dial cannot draw reads as right on, matching dir',
  hair.dir === 'at' && hair.read === 'right on table value');
const visible = dialModel({ kind: 'span', value: 35.8, min: 33, max: 38, ref: 35.45, refLabel: 'table value', digits: 5 });
t('a gap the dial CAN draw still reports the signed amount',
  visible.dir === 'up' && visible.read === '0.35 above table value');
t('bands still win over the reference phrasing',
  dialModel({ kind: 'span', value: 0, min: -4, max: 4, ref: 0, refLabel: 'neutral',
              bands: [{ upTo: 0, label: 'anion' }, { upTo: 1, label: 'neutral' }, { upTo: Infinity, label: 'cation' }] }).read === 'neutral');

// ---- dialModel: bands name the region instead of leaving a bare number --
const bands = [{ upTo: 0.4, label: 'nonpolar covalent' }, { upTo: 1.7, label: 'polar covalent' }, { upTo: Infinity, label: 'ionic' }];
t('a low band reads as its name', dialModel({ kind: 'span', value: 0.2, min: 0, max: 3.3, bands }).read === 'nonpolar covalent');
t('a middle band reads as its name', dialModel({ kind: 'span', value: 1.2, min: 0, max: 3.3, bands }).read === 'polar covalent');
t('a top band reads as its name', dialModel({ kind: 'span', value: 2.1, min: 0, max: 3.3, bands }).read === 'ionic');
t('a band boundary belongs to the upper band', dialModel({ kind: 'span', value: 0.4, min: 0, max: 3.3, bands }).read === 'polar covalent');

// ---- dialModel: decade kind --------------------------------------------
const dec = dialModel({ kind: 'decade', value: 10 ** 12, min: 1, max: 10 ** 23, digits: 3, label: 'particles' });
t('decade dial places a power of ten by its exponent', approx(dec.pos, logPos(10 ** 12, 1, 10 ** 23)));
t('decade dial counts the powers of ten', dec.read === '12 powers of ten above 1');
t('decade dial labels ticks as exponents, not 1e+23',
  dec.ticks.some(x => x.label === '10' && x.exp === '23') && dec.ticks[0].label === '1');
// The exponent is carried SEPARATELY so the painter can raise it as its own text
// run in the dial's own face. A Unicode superscript character would look simpler
// and is a trap: JetBrains Mono has 1/2/3 but not 0 or 4-9, so half the axis would
// silently render from a fallback font. See exp10Parts.
t('the raised part is carried apart from the baseline part, never merged into it',
  dec.ticks.every(x => !x.label.includes('^') && !/[⁰¹²³⁴⁵⁶⁷⁸⁹⁻]/.test(x.label + (x.exp ?? ''))));
t('every decade tick is either the base or 10 with a plain-digit exponent',
  dec.ticks.every(x => x.label === '1' ? !('exp' in x) : x.label === '10' && /^-?\d+$/.test(x.exp)));
t('the base of the axis is named, not written as 10 to the zero',
  exp10Parts(1).label === '1' && exp10Parts(1).exp === undefined);
t('a negative exponent survives the split', exp10Parts(1e-19).exp === '-19');
// A ratio dial has no exponents, and its ticks must not grow a stray raised run.
t('non-decade ticks carry no exponent', ratioTicks(3).every(x => x.exp === undefined));
// tickLabelPoint keeps a label on the face from its width; a raised exponent is
// drawn smaller, so counting its digits at full width would over-nudge every tick.
t('a raised exponent counts as less than a full character',
  tickChars({ label: '10', exp: '23' }) === 2 + 2 * EXP_SCALE
  && tickChars({ label: '10', exp: '23' }) < '10^23'.length);
t('a plain label measures as its own length', tickChars({ label: '×1/3' }) === 4);
t('one power of ten is singular', dialModel({ kind: 'decade', value: 10, min: 1, max: 10 ** 23 }).read === '1 power of ten above 1');
t('the bottom of a decade axis is named, not called "0 powers of ten"',
  dialModel({ kind: 'decade', value: 1, min: 1, max: 10 ** 23 }).read === 'the base of the scale');

// A log axis measures change in DECADES. Subtracting raw values made a 17-decade
// climb and an 11-decade drop both report as "1.00e+23" — indistinguishable.
const climb = dialModel({ kind: 'decade', value: 10 ** 23, min: 1, max: 10 ** 23 }, 10 ** 6);
const drop = dialModel({ kind: 'decade', value: 10 ** 12, min: 1, max: 10 ** 23 }, 10 ** 23);
t('a decade climb is reported in powers of ten', climb.trend === 'rising' && climb.trendText === 'up 17 powers of ten');
t('a decade drop is reported in powers of ten', drop.trend === 'falling' && drop.trendText === 'down 11 powers of ten');
t('the two moves are no longer indistinguishable', climb.trendText !== drop.trendText);
t('a single decade step is singular',
  dialModel({ kind: 'decade', value: 100, min: 1, max: 10 ** 23 }, 10).trendText === 'up 1 power of ten');

// Sitting exactly ON the axis maximum is not off it. Math.pow(10,23) !== 1e23 to
// the bit, which made the top notch of a real slider report "off the top".
const topNotch = dialModel({ kind: 'decade', value: Math.pow(10, 23), min: 1, max: 1e23, digits: 3 });
t('the exact top of a decade axis is not flagged off-scale',
  topNotch.over === null && topNotch.pos === 1 && !topNotch.read.includes('off the'));
t('genuinely past the top of a decade axis is still flagged',
  dialModel({ kind: 'decade', value: 1e25, min: 1, max: 1e23 }).over === 'hi');
const negEnd = dialModel({ kind: 'span', value: -4, min: -4, max: 4, ref: 0, digits: 2 });
t('the exact bottom of a signed linear axis is not flagged off-scale',
  negEnd.over === null && negEnd.pos === 0);
t('genuinely past the bottom of a signed linear axis is flagged',
  dialModel({ kind: 'span', value: -9, min: -4, max: 4, ref: 0 }).over === 'lo');

// ---- dialModel: degenerate input ---------------------------------------
for (const bad of [NaN, Infinity, undefined, null, 'nope']) {
  const m = dialModel({ kind: 'ratio', value: bad, fold: 3 });
  t(`value ${String(bad)} renders a dash, not a wrong reading`, m.valueText === '-' && m.read === '' && isFinite(m.pos));
}
t('an unknown kind falls back to the ratio axis', dialModel({ kind: 'bogus', value: 1 }).kind === 'ratio');

// ---- axisKey: a delta is never carried across two different axes --------
t('same axis keeps its identity',
  axisKey({ kind: 'span', min: 5, max: 100 }) === axisKey({ kind: 'span', min: 5, max: 100 }));
t('changing the bounds changes the axis',
  axisKey({ kind: 'span', min: 5, max: 100 }) !== axisKey({ kind: 'span', min: 5, max: 200 }));
t('changing the reference changes the axis',
  axisKey({ kind: 'ratio', ref: 300 }) !== axisKey({ kind: 'ratio', ref: 400 }));
t('an explicit series key changes the axis',
  axisKey({ kind: 'span', series: 'Cl' }) !== axisKey({ kind: 'span', series: 'Mg' }));
t('dialModel reports the axis it drew on', p.axisKey === axisKey({ kind: 'ratio', value: 0.329, fold: 20 }));

// ---- half-circle geometry ------------------------------------------------
// A gauge whose needle and whose coloured arc disagree about where a value sits
// is worse than a bare number, and that is arithmetic, not styling.
const G = DIAL_GEOM;
t('pos 0 is the left end of the sweep', arcAngle(0) === 180);
t('pos 0.5 is the apex', arcAngle(0.5) === 90);
t('pos 1 is the right end', arcAngle(1) === 0);
t('the sweep is exactly 180 degrees', arcAngle(0) - arcAngle(1) === 180);
t('angle is linear in position, so equal steps are equal arc', approx(arcAngle(0.25) - arcAngle(0.5), arcAngle(0.5) - arcAngle(0.75)));
t('arcAngle clamps off-scale positions', arcAngle(-3) === 180 && arcAngle(9) === 0);

const L = arcPoint(0, G.r), A = arcPoint(0.5, G.r), R = arcPoint(1, G.r);
t('left end sits on the baseline at cx - r', approx(L.x, G.cx - G.r) && approx(L.y, G.cy));
t('apex sits directly above the hub', approx(A.x, G.cx) && approx(A.y, G.cy - G.r));
t('right end sits on the baseline at cx + r', approx(R.x, G.cx + G.r) && approx(R.y, G.cy));
t('every arc point is exactly r from the hub', [0, 0.15, 0.37, 0.5, 0.72, 1]
  .every(q => { const s = arcPoint(q, G.r); return approx(Math.hypot(s.x - G.cx, s.y - G.cy), G.r); }));
t('no arc point dips below the baseline', [0, 0.1, 0.5, 0.9, 1].every(q => arcPoint(q, G.r).y <= G.cy + 1e-9));

t('needle points left at the low end', needleRotation(0) === -90);
t('needle points straight up at mid-scale', needleRotation(0.5) === 0);
t('needle points right at the high end', needleRotation(1) === 90);
t('needle rotation agrees with the arc point it should indicate', [0.2, 0.5, 0.8].every(q => {
  const deg = needleRotation(q) - 90;                       // up is -90 in +x-axis terms
  const want = arcPoint(q, G.r);
  const got = { x: G.cx + G.r * Math.cos(deg * Math.PI / 180), y: G.cy + G.r * Math.sin(deg * Math.PI / 180) };
  return approx(got.x, want.x, 1e-6) && approx(got.y, want.y, 1e-6);
}));

const d = arcPathD();
t('the path is split at the apex, so no 180-degree arc is left ambiguous', (d.match(/A /g) || []).length === 2);
t('the path starts at the left end and finishes at the right', d.startsWith(`M ${G.cx - G.r} ${G.cy}`) && d.trim().endsWith(`${G.cx + G.r} ${G.cy}`));

const semi = Math.PI * G.r;
const full = arcSegment(0, 1, semi);
t('a full sweep dashes the whole path', approx(parseFloat(full.dash), semi) && full.offset === 0);
const half = arcSegment(0.5, 1, semi);
t('a half sweep dashes half the path', approx(parseFloat(half.dash), semi / 2));
t('a sweep starting mid-scale is offset to mid-scale', approx(half.offset, -semi / 2));
t('arcSegment accepts its bounds in either order',
  JSON.stringify(arcSegment(0.75, 0.25, semi)) === JSON.stringify(arcSegment(0.25, 0.75, semi)));
t('a zero-length sweep dashes nothing', approx(parseFloat(arcSegment(0.4, 0.4, semi).dash), 0));
t('arcSegment clamps off-scale bounds', approx(parseFloat(arcSegment(-2, 5, semi).dash), semi));
// The gap half of the pattern must cover the rest of the path, or the dash repeats.
t('the dash pattern never repeats along the path', full.dash.split(' ').map(Number)[1] === semi);

const endL = tickLabelPoint(0), mid = tickLabelPoint(0.5), endR = tickLabelPoint(1);
t('end labels drop below the baseline, the dashboard idiom',
  endL.y > G.cy && approx(endL.x, G.cx - G.r) && approx(endR.x, G.cx + G.r));
t('the mid label rides outside the arc', approx(mid.x, G.cx) && approx(mid.y, G.cy - G.labelR));
t('label radius clears the arc stroke', G.labelR > G.r + G.stroke / 2);
t('every label stays inside the viewBox', [0, 0.1, 0.25, 0.5, 0.75, 0.9, 1].every(q => {
  const s = tickLabelPoint(q);
  return s.x > 4 && s.x < G.vw - 4 && s.y > 4 && s.y < G.vh - 2;
}));
t('the viewBox string agrees with the numeric bounds', G.viewBox === `0 0 ${G.vw} ${G.vh}`);
t('the needle stays inside the arc', G.needleR < G.r);
t('the tick font is small enough to render near 12px at the capped face width',
  Math.abs(G.tickFont * 150 / G.vw - 12) < 1.5);

// A long label in scientific notation ("2.84e-19 J") used to hang off the left
// edge of the face. The scale is monospaced, so the fix is arithmetic.
// Takes either a label string or a width already measured by tickChars, since a
// tick with a raised exponent is narrower than its characters suggest.
const fits = (pos, textOrChars) => {
  const chars = typeof textOrChars === 'number' ? textOrChars : textOrChars.length;
  const s = tickLabelPoint(pos, G, chars);
  const half = chars * 0.6 * G.tickFont / 2;
  return s.x - half >= 0 && s.x + half <= G.vw;
};
t('a long left-end label is nudged inward until it fits', fits(0, '2.84e-19 J'));
t('a long right-end label is nudged inward until it fits', fits(1, '5.23e-19 J'));
t('a long mid-arc label is nudged inward too',
  fits(0.26, tickChars({ label: '10', exp: '12' })) && fits(0.78, tickChars({ label: '10', exp: '18' })));
t('an absurdly long label still lands on the face, just centred', fits(0, '0.000123456789 mol/L'));
t('a short label is NOT nudged, so it stays under its arc end',
  approx(tickLabelPoint(0, G, 1).x, G.cx - G.r) && approx(tickLabelPoint(1, G, 3).x, G.cx + G.r));
t('nudging only moves x, never y',
  tickLabelPoint(0, G, 20).y === tickLabelPoint(0, G, 1).y);

// ---- tone: categorical identity, never a verdict -------------------------
t('the tone palette excludes copper and amber, which mean Honors and warn',
  !DIAL_TONES.includes('copper') && !DIAL_TONES.includes('amber') && DIAL_TONES.length >= 4);
t('a named tone is carried through', dialModel({ kind: 'ratio', value: 1, tone: 'indigo' }).tone === 'indigo');
t('an unknown tone falls back to teal rather than going unstyled',
  dialModel({ kind: 'ratio', value: 1, tone: 'chartreuse' }).tone === 'teal');
t('no tone means teal', dialModel({ kind: 'ratio', value: 1 }).tone === 'teal');
t('tone does not vary with direction: one hue across the whole travel',
  dialModel({ kind: 'ratio', value: 0.2, fold: 3, tone: 'plum' }).tone
  === dialModel({ kind: 'ratio', value: 2.4, fold: 3, tone: 'plum' }).tone);
t('tone is not part of the axis identity, so recolouring keeps the trend',
  axisKey({ kind: 'ratio', fold: 3, tone: 'teal' }) === axisKey({ kind: 'ratio', fold: 3, tone: 'plum' }));

console.log(`gauge: ${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
