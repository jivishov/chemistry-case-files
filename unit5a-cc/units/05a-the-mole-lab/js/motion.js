// motion.js — optional motion + celebration layer for the Mission Deck template.
// PURE ENHANCEMENT. Every export is a safe no-op when:
//   • there is no DOM (e.g. a headless Node import of createSim for verification),
//   • the user prefers reduced motion, or
//   • a CDN module fails to load (offline, blocked, or a Pages hiccup).
// The simulator is fully functional and fully styled without any of this; the CSS
// handles the page-load reveal and the meter glow on its own. This module only adds
// the confetti milestone burst and a richer spring on the surge when the libs load.
//
// Libraries are CDN ESM (GitHub Pages safe, no build step):
//   Motion One  — orchestrated spring micro-interactions
//   canvas-confetti — the "crew saved / system certified" celebration

const hasDOM = typeof window !== 'undefined' && typeof document !== 'undefined';
const reduced = () =>
  hasDOM && typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let _motion = null, _confetti = null, _loading = null;
function ensureLibs() {
  if (!hasDOM) return Promise.resolve();
  if (_loading) return _loading;
  _loading = (async () => {
    try { _motion = await import('https://cdn.jsdelivr.net/npm/motion@11.11.17/+esm'); }
    catch { _motion = null; }
    try {
      const m = await import('https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.3/dist/confetti.module.mjs');
      _confetti = m.default || m;
    } catch { _confetti = null; }
  })();
  return _loading;
}
if (hasDOM && !reduced()) ensureLibs();   // warm the cache early; failures are swallowed

// surge(el): a one-shot emphasis pulse on an element (e.g. the crew safety meter when a
// good result heals it). The CSS class drives the glow on its own; if Motion One is up,
// add a brief spring on top. Safe no-op without a DOM, element, or with reduced motion.
export function surge(el) {
  if (!hasDOM || !el || reduced()) return;
  // A brightness flash, not a transform/shadow: the meter-fill sits inside an
  // overflow:hidden clip, so scaling or a glow would be clipped away. If Motion One
  // is up, use it for a smooth pulse; otherwise the CSS .is-surge class does it.
  if (_motion && typeof _motion.animate === 'function') {
    try {
      _motion.animate(el, { filter: ['brightness(1)', 'brightness(1.85)', 'brightness(1)'] },
        { duration: 0.7, easing: 'ease-out' });
      return;
    } catch { /* fall through to CSS */ }
  }
  el.classList.remove('is-surge');
  void el.offsetWidth;                 // restart the CSS animation
  el.classList.add('is-surge');
  setTimeout(() => el.classList.remove('is-surge'), 800);
}

// celebrate({big}): the milestone burst, fired only on a NEW certification (not every
// correct answer), with a bigger version when the whole mission is certified.
export function celebrate(opts = {}) {
  if (!hasDOM || reduced()) return;
  ensureLibs().then(() => {
    if (!_confetti) return;
    const big = !!opts.big;
    const base = { disableForReducedMotion: true, scalar: 0.9, ticks: 180,
      colors: ['#3fb3bf', '#79d2da', '#46c98a', '#e8ab6e'] };
    try {
      _confetti({ ...base, particleCount: big ? 130 : 55, spread: big ? 95 : 62,
        startVelocity: big ? 48 : 34, origin: { x: 0.5, y: 0.22 } });
      if (big) {
        setTimeout(() => _confetti({ ...base, particleCount: 60, angle: 60, spread: 75, origin: { x: 0, y: 0.55 } }), 160);
        setTimeout(() => _confetti({ ...base, particleCount: 60, angle: 120, spread: 75, origin: { x: 1, y: 0.55 } }), 160);
      }
    } catch { /* ignore */ }
  });
}
