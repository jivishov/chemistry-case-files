/* columns.js — the drag handles that let a learner re-proportion the three cockpit columns.
 *
 * The shell (shared/cockpit.css) declares the tracks as
 *
 *   clamp(230px, var(--wb-left), 42vw) | gutter | minmax(320px, 1fr) | gutter | clamp(196px, var(--wb-right), 34vw)
 *
 * with the two custom properties defaulting to vw so the split scales with the viewport on
 * its own. This module does one thing: it injects the two gutter handles and writes those
 * two properties in px while a handle is dragged. Nothing else in the shell knows the
 * columns are adjustable, which is why the same module works for every unit on the cockpit.
 *
 * Deliberately framework-free. Alpine owns the state inside the columns; the columns' own
 * geometry is a display preference, so it is DOM-local and persisted per unit in
 * localStorage rather than pushed through the sim's reactive tree.
 *
 * Three ways to drive it, because a mouse is not the only pointer:
 *   drag            — pointer events, with pointer capture so the drag survives leaving the strip
 *   arrow keys      — 16px a press, 48px with shift (the handle is a real focusable separator)
 *   double-click    — back to the authored default
 *
 * Below the shell's 980px breakpoint the workbench stops being three side-by-side columns,
 * so the handles take themselves out of the layout and the tracks fall back to the stacked
 * template in cockpit.css.
 */

const STACK_QUERY = '(max-width: 980px)';
const KEY_STEP = 16;
const KEY_STEP_COARSE = 48;

/* The floors here mirror the clamp() floors in cockpit.css. They are restated rather than
   read back from the computed track, because during a drag the computed value is the
   OUTCOME of the clamp -- so clamping against it would ratchet a column that had already
   bottomed out and never let it grow again. */
const SIDES = {
  left:  { prop: '--wb-left',  min: 230, area: '.mission-screen' },
  right: { prop: '--wb-right', min: 196, area: '.life-support-board' },
};
const CENTER_MIN = 320;

/**
 * Wire the two handles into a cockpit's workbench.
 *
 * @param {object}  [opts]
 * @param {string}  [opts.storageKey] localStorage key; defaults to one derived from the path,
 *                                    so each unit remembers its own split.
 * @returns {() => void} teardown, for a caller that owns the lifecycle (tests do).
 */
export function mountColumnResizers(opts = {}) {
  const grid = document.querySelector('.workbench-grid');
  if (!grid) return () => {};

  const storageKey = opts.storageKey ??
    'cockpit-columns:' + location.pathname.replace(/\/index\.html$/, '/');
  const stacked = window.matchMedia(STACK_QUERY);

  /* --- persistence ------------------------------------------------------------------ */
  /* px, not vw: a dragged width is a decision about THIS window, and re-deriving it as a
     ratio would move the divider the next time the window is a different size. */
  const load = () => {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || 'null');
      if (saved && typeof saved === 'object') return saved;
    } catch { /* a corrupt or blocked store just means no saved split */ }
    return null;
  };
  const save = state => {
    try { localStorage.setItem(storageKey, JSON.stringify(state)); } catch { /* private mode */ }
  };

  const state = load() || {};
  const apply = () => {
    for (const side of Object.keys(SIDES)) {
      const px = state[side];
      if (px) grid.style.setProperty(SIDES[side].prop, px + 'px');
      else grid.style.removeProperty(SIDES[side].prop);
    }
  };
  apply();

  /* --- geometry --------------------------------------------------------------------- */
  /* The ceiling on one side is whatever leaves the bench its 320px floor and the OTHER side
     its own floor -- computed from live boxes rather than from the CSS, so it stays true
     after a window resize or an Honors toggle that changes nothing about the tracks. */
  const widthOf = sel => document.querySelector(sel)?.getBoundingClientRect().width ?? 0;
  const gutter = () => parseFloat(getComputedStyle(grid).getPropertyValue('--wb-gutter')) || 12;

  /* Nothing may be measured, and nothing may be WRITTEN, until the grid has a real box.
     The shell starts under x-cloak, so at mount every rect is 0 -- and a ceiling computed
     from a 0-wide grid is negative, which clamps both columns to their floors and then
     stores those floors over the learner's saved split. That is how a preference gets eaten
     by its own restore. */
  const laidOut = () => grid.getBoundingClientRect().width > 0;

  const maxFor = side => {
    const other = side === 'left' ? 'right' : 'left';
    const total = grid.getBoundingClientRect().width;
    return Math.max(SIDES[side].min,
      total - 2 * gutter() - CENTER_MIN - Math.max(SIDES[other].min, widthOf(SIDES[other].area)));
  };

  /* Store what RENDERED, not what was asked for.
     cockpit.css caps each side track with a vw ceiling of its own, so a request the
     JS clamp allows can still be cut down by the CSS. Reading the width back after the
     write is what keeps the two in agreement -- otherwise a drag past the ceiling saves a
     number the page can never reproduce. */
  const setSide = (side, px) => {
    if (!laidOut()) return null;
    const asked = Math.round(Math.min(Math.max(px, SIDES[side].min), maxFor(side)));
    grid.style.setProperty(SIDES[side].prop, asked + 'px');
    const got = Math.round(widthOf(SIDES[side].area));
    state[side] = got || asked;
    if (got && got !== asked) grid.style.setProperty(SIDES[side].prop, got + 'px');
    return state[side];
  };

  /* --- the handles ------------------------------------------------------------------ */
  const handles = ['left', 'right'].map(side => {
    const el = document.createElement('button');
    el.type = 'button';
    el.className = 'wb-handle';
    el.dataset.wbHandle = side;
    /* A separator, not a button, is what this is to a screen reader: it reports the column
       width it governs and responds to arrow keys. `type=button` on the element only stops
       it submitting anything; the role is what gets announced. */
    el.setAttribute('role', 'separator');
    el.setAttribute('aria-orientation', 'vertical');
    el.setAttribute('aria-label', side === 'left'
      ? 'Resize the job column. Arrow keys adjust, double-click resets.'
      : 'Resize the board column. Arrow keys adjust, double-click resets.');
    el.tabIndex = 0;

    /* Dragging the LEFT handle moves the left column's trailing edge, so a rightward drag
       widens it. The RIGHT handle sits on the board's leading edge, so the sign flips. */
    const dir = side === 'left' ? 1 : -1;
    let startX = 0;
    let startW = 0;

    el.addEventListener('pointerdown', ev => {
      if (stacked.matches || ev.button !== 0) return;
      startX = ev.clientX;
      startW = widthOf(SIDES[side].area);
      el.setPointerCapture(ev.pointerId);
      el.dataset.dragging = '';
      grid.dataset.resizing = '';
      ev.preventDefault();
    });

    el.addEventListener('pointermove', ev => {
      if (!('dragging' in el.dataset)) return;
      setSide(side, startW + dir * (ev.clientX - startX));
    });

    const end = ev => {
      if (!('dragging' in el.dataset)) return;
      delete el.dataset.dragging;
      delete grid.dataset.resizing;
      if (el.hasPointerCapture?.(ev.pointerId)) el.releasePointerCapture(ev.pointerId);
      save(state);
      report(el, side);
    };
    el.addEventListener('pointerup', end);
    el.addEventListener('pointercancel', end);

    el.addEventListener('keydown', ev => {
      if (stacked.matches) return;
      const step = ev.shiftKey ? KEY_STEP_COARSE : KEY_STEP;
      let delta = 0;
      if (ev.key === 'ArrowLeft') delta = -step;
      else if (ev.key === 'ArrowRight') delta = step;
      else if (ev.key === 'Home' || ev.key === 'End') {
        reset(side);
        ev.preventDefault();
        return;
      } else return;
      setSide(side, widthOf(SIDES[side].area) + dir * delta);
      save(state);
      report(el, side);
      ev.preventDefault();
    });

    /* Double-click is the universal "put it back" on a splitter, and it is the only way
       back to the vw default once a px width has been written. */
    el.addEventListener('dblclick', () => reset(side));

    grid.appendChild(el);
    return el;
  });

  const reset = side => {
    delete state[side];
    grid.style.removeProperty(SIDES[side].prop);
    save(state);
    const el = handles[side === 'left' ? 0 : 1];
    report(el, side);
  };

  /* aria-valuenow on a separator is what makes the current split audible; without it the
     arrow keys move something the learner cannot hear moving. */
  function report(el, side) {
    if (!laidOut()) return;
    const w = Math.round(widthOf(SIDES[side].area));
    el.setAttribute('aria-valuenow', String(w));
    el.setAttribute('aria-valuemin', String(SIDES[side].min));
    el.setAttribute('aria-valuemax', String(Math.round(maxFor(side))));
  }
  const reportAll = () => handles.forEach((el, i) => report(el, i === 0 ? 'left' : 'right'));

  /* A window that shrinks can leave a saved width wider than the ceiling. Re-clamping on
     resize keeps the bench above its floor without discarding the learner's preference. */
  const onResize = () => {
    if (stacked.matches || !laidOut()) return;
    for (const side of Object.keys(SIDES)) if (state[side]) setSide(side, state[side]);
    reportAll();
  };
  window.addEventListener('resize', onResize);

  /* A ResizeObserver rather than a one-shot rAF: it fires when the grid FIRST gets a box
     (x-cloak lifting, the Case File tab handing the workbench back) as well as on every
     later reflow, which is exactly the set of moments a saved width has to be re-clamped
     and the separators have to re-report. */
  const ro = new ResizeObserver(onResize);
  ro.observe(grid);

  /* Stacked, the handles are not between anything. Hidden rather than removed, so a learner
     who widens the window back gets their split back. */
  const onStack = () => {
    for (const el of handles) el.hidden = stacked.matches;
    if (!stacked.matches) onResize();
  };
  stacked.addEventListener('change', onStack);
  onStack();

  return () => {
    window.removeEventListener('resize', onResize);
    stacked.removeEventListener('change', onStack);
    ro.disconnect();
    for (const el of handles) el.remove();
    for (const side of Object.keys(SIDES)) grid.style.removeProperty(SIDES[side].prop);
  };
}
