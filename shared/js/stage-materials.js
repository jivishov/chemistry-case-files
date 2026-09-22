// Upgrade surfaces, never mechanics: preserve all coordinates, paths, text,
// Alpine bindings, animation classes, timing and original fill attributes.
// CSS selects the optional material paint; Original restores authored fills.
export function enhanceStage(svg, number) {
  const defs = new Map();
  const mix = (hex, target, amount) => '#' + [0, 2, 4].map(i => {
    const n = parseInt(hex.slice(i, i + 2), 16);
    return Math.round(n + (target - n) * amount).toString(16).padStart(2, '0');
  }).join('');
  const output = svg.replace(/<(circle|rect)\b[^>]*>/g, tag => {
    const color = tag.match(/(?<![:\w-])fill="#([\da-f]{6})"/i)?.[1];
    if (!color) return tag;
    const circle = tag.startsWith('<circle');
    const r = Number(tag.match(/(?<![:\w-])r="([\d.]+)"/)?.[1]);
    const w = Number(tag.match(/(?<![:\w-])width="([\d.]+)"/)?.[1]);
    const h = Number(tag.match(/(?<![:\w-])height="([\d.]+)"/)?.[1]);
    // Tiny data points, particles, spectrum bars and pH scales stay flat and exact.
    if (circle ? !(r >= 10 && r <= 80) : !(w >= 16 && h >= 28)) return tag;
    if (/:(fill|r|width|height)=/.test(tag)) return tag;
    const type = circle ? 'orb' : 'surface';
    const id = `cf-material-${number}-${color}-${type}`;
    if (!defs.has(id)) {
      const stops = `<stop offset="0" stop-color="${mix(color, 255, .24)}"/><stop offset=".4" stop-color="#${color}"/><stop offset="1" stop-color="${mix(color, 0, .25)}"/>`;
      defs.set(id, circle
        ? `<radialGradient id="${id}" cx="30%" cy="24%" r="83%">${stops}</radialGradient>`
        : `<linearGradient id="${id}" x1="0" y1="0" x2=".6" y2="1">${stops}</linearGradient>`);
    }
    let changed = /\bclass="/.test(tag) ? tag.replace('class="', 'class="cf-material ') : tag.replace(/^<(circle|rect)/, '<$1 class="cf-material"');
    changed = /\bstyle="/.test(changed)
      ? changed.replace('style="', `style="--cf-material:url(#${id});`)
      : changed.replace(/^<(circle|rect)/, `<$1 style="--cf-material:url(#${id})"`);
    return changed;
  });
  return output.replace(/(<svg\b[^>]*>)/, `$1<defs>${[...defs.values()].join('')}</defs>`);
}

export function caseStage(CASE) {
  const enhanced = enhanceStage(CASE.stage, CASE.number);
  if (!CASE.originalStage) return enhanced;
  const original = CASE.originalStage.replace('<svg ', '<svg class="cf-original-stage" ');
  // Keep both stages bound to the same chapter. Image errors switch the entire
  // Mars stage to the complete earlier vector scene, including the spacecraft.
  const raster = enhanced.replace('<svg ', '<svg class="cf-enhanced-stage" ')
    .replaceAll('<image ', '<image onerror="this.closest(\'.cf-stage-art\').classList.add(\'raster-failed\')" ');
  return `<div class="cf-stage-art">${original}${raster}</div>`;
}
