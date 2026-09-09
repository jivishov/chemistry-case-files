// svg-fidelity.js — calibrated Unit 1 SVG rendering helpers.
// Keeps scientific geometry/data dynamic while allowing scenario art to remain a separate context layer.

export const CYLINDER_GEOM = Object.freeze({
  maxVolume: 50,
  glassX: 48,
  glassW: 90,
  liquidLeft: 50,
  liquidRight: 136,
  topY: 66,
  bottomY: 566,
  meniscusDepth: 6
});

export const TARGET_GEOM = Object.freeze({ cx: 60, cy: 60, radius: 46 });

const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);

export function cylinderLevelY(volume) {
  const g = CYLINDER_GEOM;
  const span = g.bottomY - g.topY;
  const v = clamp(Number(volume) || 0, 0, g.maxVolume);
  return g.bottomY - (v / g.maxVolume) * span;
}

export function cylinderTicksSvg(labels = false) {
  const g = CYLINDER_GEOM;
  let s = '';
  for (let v = 0; v <= g.maxVolume; v++) {
    const y = cylinderLevelY(v);
    const major = v % 10 === 0;
    const mid = !major && v % 5 === 0;
    const x1 = major ? 96 : mid ? 108 : 119;
    const w = major ? 2.2 : mid ? 1.6 : 1.1;
    s += `<line x1="${x1}" x2="${g.liquidRight}" y1="${y}" y2="${y}" stroke="#7d929b" stroke-width="${w}"></line>`;
    if (labels && major) {
      s += `<text x="${g.liquidRight + 8}" y="${y + 5}" font-size="15" fill="#687a82" font-family="JetBrains Mono">${v}</text>`;
    }
  }
  return s;
}

// A displacement sample is a 3-D object. Its projected linear size therefore scales
// with the cube root of its volume, not with the final liquid-height coordinate.
// The previous drawing made the object's height depend on dAfter, which visually
// implied that identical samples changed size when the starting water level changed.
export function displacementSampleSvg(sampleVolume) {
  const g = CYLINDER_GEOM;
  const volume = Number(sampleVolume);
  if (!(volume > 0) || !Number.isFinite(volume)) return '';

  const side = clamp(42 * Math.cbrt(volume / 3), 38, 62);
  const depth = clamp(side * 0.15, 5, 9);
  const mid = (g.liquidLeft + g.liquidRight) / 2;
  const x = mid - side / 2;
  const y = g.bottomY - 6 - side;

  return `<g data-visual-role="displacement-sample" data-sample-volume="${volume.toFixed(1)}">`
    + `<path d="M${x.toFixed(2)} ${(y + depth).toFixed(2)} H${(x + side).toFixed(2)} V${(y + side).toFixed(2)} H${x.toFixed(2)} Z" fill="#80664f" opacity="0.9"></path>`
    + `<path d="M${x.toFixed(2)} ${(y + depth).toFixed(2)} L${(x + depth).toFixed(2)} ${y.toFixed(2)} H${(x + side).toFixed(2)} L${(x + side).toFixed(2)} ${(y + depth).toFixed(2)} Z" fill="#b19a82" opacity="0.95"></path>`
    + `<path d="M${(x + side).toFixed(2)} ${(y + depth).toFixed(2)} L${(x + side + depth).toFixed(2)} ${y.toFixed(2)} V${(y + side - depth).toFixed(2)} L${(x + side).toFixed(2)} ${(y + side).toFixed(2)} Z" fill="#674f3d" opacity="0.9"></path>`
    + `</g>`;
}

export function graduatedCylinderSvg(volume, { labels = false, block = false, sampleVolume = null } = {}) {
  const g = CYLINDER_GEOM;
  const v = clamp(Number(volume) || 0, 0, g.maxVolume);
  const y = cylinderLevelY(v);
  const mid = (g.liquidLeft + g.liquidRight) / 2;
  const curve = `M${g.liquidLeft} ${y - g.meniscusDepth} Q${mid} ${y + g.meniscusDepth} ${g.liquidRight} ${y - g.meniscusDepth}`;
  const liquidPath = `${curve} L${g.liquidRight} ${g.bottomY} L${g.liquidLeft} ${g.bottomY} Z`;

  let s = `<g data-visual-role="live-graduated-cylinder">`
    + `<rect x="${g.glassX}" y="28" width="${g.glassW}" height="566" rx="8" fill="#f7fafb" stroke="#aebfc6" stroke-width="2.5"></rect>`
    + `<rect x="${g.glassX}" y="28" width="${g.glassW}" height="12" rx="6" fill="#eaf1f3" stroke="#aebfc6" stroke-width="2"></rect>`
    + `<rect x="34" y="588" width="118" height="16" rx="6" fill="#e6eef0" stroke="#aebfc6" stroke-width="2"></rect>`;

  if (v > 0) {
    s += `<path d="${liquidPath}" fill="#79b0ba" opacity="0.5"></path>`;
    if (block) {
      s += displacementSampleSvg(sampleVolume);
      // A light water veil restores the optical cue that the sample is submerged.
      s += `<path d="${liquidPath}" fill="#79b0ba" opacity="0.12" pointer-events="none"></path>`;
    }
    s += `<path d="${curve}" fill="none" stroke="#3f7f8c" stroke-width="2.4" stroke-linecap="round"></path>`;
  }

  s += `<rect x="${g.liquidLeft + 6}" y="48" width="6" height="516" rx="3" fill="#ffffff" opacity="0.7"></rect>`
    + cylinderTicksSvg(labels)
    + `</g>`;
  return s;
}

export function targetDotsSvg(dots, { tuple = false, radius = 3.5, fill = '#1d5b66' } = {}) {
  const g = TARGET_GEOM;
  if (!Array.isArray(dots)) return '';
  return dots.map(d => {
    const x = tuple ? Number(d?.[0]) : Number(d?.x);
    const y = tuple ? Number(d?.[1]) : Number(d?.y);
    if (!Number.isFinite(x) || !Number.isFinite(y)) return '';
    return `<circle data-visual-role="measurement-point" cx="${(g.cx + x * g.radius).toFixed(2)}" cy="${(g.cy + y * g.radius).toFixed(2)}" r="${radius}" fill="${fill}"></circle>`;
  }).join('');
}

function markScenarioContext(svg) {
  if (typeof svg !== 'string' || !svg.startsWith('<svg ')) return svg;
  return svg.replace('<svg ', '<svg data-visual-role="scenario-context" ');
}

export function installSvgFidelity(sim) {
  if (!sim || typeof sim !== 'object') return sim;

  const originalScenarioArt = typeof sim.scArt === 'function' ? sim.scArt.bind(sim) : null;

  sim.lvlY = cylinderLevelY;
  sim.ticksSvg = cylinderTicksSvg;
  sim.cylSvg = function (volume, options = {}) {
    const sampleVolume = options.block ? Number(this.dVolTrue) : null;
    return graduatedCylinderSvg(volume, { ...options, sampleVolume });
  };
  sim.boardDots = dots => targetDotsSvg(dots, { tuple: true, radius: 3.5, fill: '#1d5b66' });
  sim.liveDots = function () {
    return targetDotsSvg(this.evDots, { tuple: false, radius: 4, fill: '#2a7d8a' });
  };

  // Scenario banners are illustrative context. Marking them explicitly prevents future
  // photorealistic replacements from being mistaken for the authoritative live data SVGs.
  if (originalScenarioArt) sim.scArt = id => markScenarioContext(originalScenarioArt(id));

  return sim;
}
