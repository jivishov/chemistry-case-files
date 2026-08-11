// render.js — view helpers shared by simulators.
// Depends on globals `katex` (+ mhchem) and `Chart`, loaded via CDN <script> before the module.

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
  if (typeof katex === 'undefined') { el.textContent = expr; return; }
  try { katex.render(`\\ce{${expr}}`, el, { throwOnError: false, displayMode: false }); }
  catch { el.textContent = expr; }
}

// Render plain TeX (for math like q = mc\Delta T).
export function renderTeX(el, expr, displayMode = false) {
  if (typeof katex === 'undefined') { el.textContent = expr; return; }
  try { katex.render(expr, el, { throwOnError: false, displayMode }); }
  catch { el.textContent = expr; }
}

// Register Alpine directives: x-ce (chemistry) and x-tex (math).
export function registerRender(Alpine) {
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
