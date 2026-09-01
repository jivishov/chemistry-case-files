// render.js — view helpers shared by simulators.
// Depends on globals `katex` (+ mhchem) and `Chart`, loaded via CDN <script> before the module.
//
// KaTeX is a CDN dependency, so its absence is a NORMAL state, not an error state: offline,
// behind a filtered network, or on the three units that never loaded it. The fallback used to
// be `el.textContent = expr`, which put raw mhchem on the page -- "H2O", "SO4^2-", "-> " --
// and quietly turned every formula in the build into ASCII. shared/js/notation.js typesets the
// same strings with real sub/sup markup and no dependency at all, so that is the fallback now.
import { escapeHTML, formulaHTML, registerNotation } from './notation.js';

// Stable color per chemical species for token visualizations + charts.
const PALETTE = ['#2a7d8a', '#c0772f', '#5a6b9c', '#6b9c5a', '#9c5a87', '#b8881f', '#3f8f9c', '#a85a3f'];
const _assigned = {};
let _next = 0;
export function speciesColor(formula) {
  if (!(formula in _assigned)) { _assigned[formula] = PALETTE[_next % PALETTE.length]; _next++; }
  return _assigned[formula];
}

// Render an mhchem expression into an element via KaTeX. Safe if katex is missing.
export function renderCE(el, expr) {
  if (!expr) { el.textContent = ''; return; }
  if (typeof katex === 'undefined') { el.innerHTML = formulaHTML(expr); return; }
  try { katex.render(`\\ce{${expr}}`, el, { throwOnError: false, displayMode: false }); }
  catch { el.innerHTML = formulaHTML(expr); }
}

// Render plain TeX (for math like q = mc\Delta T). KaTeX is preferred when it is
// present, but course equations must remain scientific notation rather than raw TeX
// when a CDN is blocked. This intentionally covers the small, authored subset used by
// the activities: fractions, roots, overbars, Greek symbols, and scripts.
const TEX_GLYPHS = {
  Delta: 'Δ', rho: 'ρ', nu: 'ν', sigma: 'σ', sum: 'Σ',
  cdot: '·', pm: '±', log: 'log',
  ',': ' ', ';': ' ', '!': '', ':': ' ', '\\': ' '
};

function texGroup(source, start) {
  if (source[start] !== '{') return null;
  let depth = 1;
  for (let i = start + 1; i < source.length; i++) {
    if (source[i] === '{') depth++;
    if (source[i] === '}' && --depth === 0) {
      return { value: source.slice(start + 1, i), next: i + 1 };
    }
  }
  return null;
}

export function texFallbackHTML(expr) {
  const render = source => {
    let out = '';
    for (let i = 0; i < source.length;) {
      const ch = source[i];

      if (ch === '\\') {
        const match = /^\\([A-Za-z]+|.)/.exec(source.slice(i));
        if (!match) { out += '\\'; i++; continue; }
        const command = match[1];
        i += match[0].length;

        if (command === 'left' || command === 'right') continue;
        if (command === 'times') {
          out += ' × ';
          while (source[i] === ' ') i++;
          continue;
        }
        if (command === 'frac' || command === 'dfrac' || command === 'tfrac') {
          const numerator = texGroup(source, i);
          const denominator = numerator && texGroup(source, numerator.next);
          if (!numerator || !denominator) { out += escapeHTML(match[0]); continue; }
          out += `<span class="tex-frac"><span class="tex-frac-n">${render(numerator.value)}</span><span class="tex-frac-d">${render(denominator.value)}</span></span>`;
          i = denominator.next;
          continue;
        }
        if (command === 'sqrt' || command === 'bar' || command === 'overline' || command === 'mathrm' || command === 'text') {
          const group = texGroup(source, i);
          if (!group) { out += escapeHTML(match[0]); continue; }
          const rendered = render(group.value);
          if (command === 'sqrt') out += `√<span class="tex-radical">(${rendered})</span>`;
          else if (command === 'bar' || command === 'overline') out += `<span class="tex-overbar">${rendered}</span>`;
          else out += rendered;
          i = group.next;
          continue;
        }
        out += TEX_GLYPHS[command] ?? escapeHTML(match[0]);
        continue;
      }

      if (ch === '^' || ch === '_') {
        const group = texGroup(source, i + 1);
        const next = group ? group.next : i + 2;
        const content = group ? render(group.value) : escapeHTML(source[i + 1] ?? '');
        out += ch === '^' ? `<sup>${content}</sup>` : `<sub>${content}</sub>`;
        i = next;
        continue;
      }

      if (ch === '{') {
        const group = texGroup(source, i);
        if (group) { out += render(group.value); i = group.next; continue; }
      }

      out += escapeHTML(ch);
      i++;
    }
    return out;
  };
  return render(String(expr ?? ''));
}

export function renderTeX(el, expr, displayMode = false) {
  if (typeof katex === 'undefined') { el.innerHTML = texFallbackHTML(expr); return; }
  try { katex.render(expr, el, { throwOnError: false, displayMode }); }
  catch { el.innerHTML = texFallbackHTML(expr); }
}

// Register Alpine directives: x-ce (chemistry) and x-tex (math), plus notation.js's
// x-formula / x-sci / x-prose. They register together deliberately: every index.html in both
// trees already calls registerRender, so wiring them here is what makes the typographic
// directives available in all thirteen builds without thirteen edits that could each be
// forgotten. The two sets do not overlap -- x-ce needs KaTeX and renders TeX, x-formula never
// touches the network -- so nothing is shadowed.
export function registerRender(Alpine) {
  registerNotation(Alpine);
  Alpine.directive('ce', (el, { expression }, { evaluateLater, effect }) => {
    const get = evaluateLater(expression);
    effect(() => get(v => renderCE(el, v)));
  });
  Alpine.directive('tex', (el, { expression, modifiers }, { evaluateLater, effect }) => {
    const get = evaluateLater(expression);
    const display = modifiers.includes('display');
    effect(() => get(v => renderTeX(el, v, display)));
  });
}

// Minimal grouped bar chart wrapper around Chart.js. Returns the Chart instance.
export function barChart(canvas, { labels, datasets, yTitle = '' }) {
  return new Chart(canvas, {
    type: 'bar',
    data: { labels, datasets },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { labels: { font: { family: 'Atkinson Hyperlegible' } } } },
      scales: {
        y: { beginAtZero: true, title: { display: !!yTitle, text: yTitle }, grid: { color: '#e2eaed' } },
        x: { grid: { display: false } }
      }
    }
  });
}

// Line chart wrapper. Pass datasets of {x,y} points with xType:'linear' (default),
// or pass labels with xType:'category' for evenly spaced ticks. Returns the Chart.
export function lineChart(canvas, { datasets, labels = null, xTitle = '', yTitle = '', xType = 'linear', beginAtZero = true }) {
  return new Chart(canvas, {
    type: 'line',
    data: labels ? { labels, datasets } : { datasets },
    options: {
      responsive: true, maintainAspectRatio: false, animation: false,
      plugins: { legend: { labels: { font: { family: 'Atkinson Hyperlegible' }, usePointStyle: true } } },
      scales: {
        x: { type: xType, title: { display: !!xTitle, text: xTitle }, grid: { color: '#eef2f4' } },
        y: { beginAtZero, title: { display: !!yTitle, text: yTitle }, grid: { color: '#e2eaed' } }
      }
    }
  });
}
