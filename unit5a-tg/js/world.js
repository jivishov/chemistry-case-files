// world.js - Mission Console living-ship + voyage controller (GSAP).
// Presentation-only motion: the ship + voyage SVGs live in index.html as STATIC
// markup (built once, stable refs). This module mounts GSAP onto those refs and
// tweens them from reactive state driven by Alpine x-init/x-effect on the strip.
// main.js (the view-model) is NOT touched. Reduced motion: snap, never tween.
//
// Division of labour:
//   GSAP (here)     : system fill meters (scaleY), voyage marker glide, verdict
//                      glow flash + hull thump.
//   CSS (world.css) : steady critical glow opacity pulse, airlock/fault tints,
//                      rail chips, verdict rise (all @keyframes / attribute-driven).
//
// Ref contract (data-ref attributes in index.html):
//   hull                     (group GSAP thumps on a new verdict)
//   voyage-ship              (inner <g>; GSAP x = overall * ROUTE_LEN; outer <g> base offset)
//   per system k of [air,power,food,hull]:
//     sys-<k>-block          (group; Alpine binds :data-state critical/ok -> CSS glow)
//     sys-<k>-glow           (rect; GSAP flashes opacity on a new verdict)
//     sys-<k>-fill          (rect; GSAP scaleY anchored bottom = stock%)
//
// Affected system on a verdict: main.js's verdict object `v` carries `tone` but
// NOT `stock`/`delta` (those are passed straight to recordWorld()). So we derive
// the affected system from the NET stock change since the previous react call:
// the verdict's stock is the only one that gets the extra +/-delta on top of the
// per-sol drift, so it has the largest |net|. success -> most-positive net;
// warn/fail -> most-negative net. No field on lastVerdict needed.

import { gsap } from 'https://esm.sh/gsap@3.12.5';

const SYSTEMS = ['air', 'power', 'food', 'hull'];
const ROUTE_LEN = 226;            // inner voyage-ship x spans 0..226 to reach Mars
const TONE = { success: 'var(--success)', warn: 'var(--warn)', fail: 'var(--danger)' };

const prefersReduced = () => !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
const clamp01 = v => (v < 0 ? 0 : v > 1 ? 1 : v);

function makeCtrl(root) {
  const ctrl = { root, reduced: prefersReduced(), prevVerdict: null, prevStocks: null,
                 fills: {}, glows: {}, hull: null, ship: null };
  for (const k of SYSTEMS) {
    ctrl.fills[k] = root.querySelector(`[data-ref="sys-${k}-fill"]`);
    ctrl.glows[k] = root.querySelector(`[data-ref="sys-${k}-glow"]`);
  }
  ctrl.hull = root.querySelector('[data-ref="hull"]');
  ctrl.ship = root.querySelector('[data-ref="voyage-ship"]');
  return ctrl;
}

// Seed meters instantly from current state so the ship never starts empty.
function seed(ctrl, state) {
  for (const k of SYSTEMS) {
    const f = ctrl.fills[k]; if (!f) continue;
    gsap.set(f, { scaleY: clamp01((state[k] ?? 100) / 100), transformOrigin: 'center bottom' });
  }
  if (ctrl.ship) gsap.set(ctrl.ship, { x: clamp01(state.overall ?? 0) * ROUTE_LEN });
}

// One-shot outcome-coloured pulse on the affected system so a verdict is
// something you SEE on the ship. After the pulse, inline opacity is cleared so
// the CSS steady-state ([data-state="critical"] -> glow on) reasserts.
function flashSystem(ctrl, k, tone) {
  const glow = k ? ctrl.glows[k] : null;
  if (!glow) return;
  gsap.killTweensOf(glow);
  glow.style.fill = TONE[tone] || TONE.fail;
  if (ctrl.reduced) {
    gsap.fromTo(glow, { opacity: 0.6 }, { opacity: 0, duration: 0.25,
      onComplete: () => { glow.style.opacity = ''; } });
  } else {
    gsap.fromTo(glow, { opacity: 0 }, { opacity: 0.85, duration: 0.16, yoyo: true, repeat: 1,
      ease: 'power1.inOut', onComplete: () => { glow.style.opacity = ''; } });
  }
}

function thumpHull(ctrl, tone) {
  if (!ctrl.hull || ctrl.reduced) return;
  const s = tone === 'fail' ? 1.035 : 1.018;
  gsap.fromTo(ctrl.hull, { scale: 1 }, { scale: s, duration: 0.12, ease: 'power2.out',
    yoyo: true, repeat: 1, transformOrigin: 'center',
    onComplete: () => gsap.set(ctrl.hull, { scale: 1 }) });
}

export const World = {
  controllers: new WeakMap(),

  mount(root, data) {
    if (!root) return null;
    let ctrl = this.controllers.get(root);
    if (ctrl) return ctrl;
    ctrl = makeCtrl(root);
    this.controllers.set(root, ctrl);
    try {
      const st = {
        air: data?.stocks?.air ?? 100, power: data?.stocks?.power ?? 100,
        food: data?.stocks?.food ?? 100, hull: data?.stocks?.hull ?? 100,
        overall: typeof data?.gOverall === 'function' ? data.gOverall() : 0,
      };
      seed(ctrl, st);
      ctrl.prevStocks = { ...st };   // seed prevStocks so the first verdict diff is clean
    } catch (_) { /* never break the view-model */ }
    return ctrl;
  },

  react(crew, air, power, food, hull, lastVerdict, capUnlocked, overall) {
    const root = document.querySelector('.console-strip');
    const ctrl = root ? this.controllers.get(root) : null;
    if (!ctrl) return;
    const state = { air, power, food, hull, overall };
    ctrl.reduced = prefersReduced();
    const dur = ctrl.reduced ? 0.0001 : 0.55;

    // 1. System fill meters.
    for (const k of SYSTEMS) {
      const f = ctrl.fills[k]; if (!f) continue;
      const v = clamp01((state[k] ?? 100) / 100);
      if (ctrl.reduced) gsap.set(f, { scaleY: v, transformOrigin: 'center bottom' });
      else gsap.to(f, { scaleY: v, transformOrigin: 'center bottom', duration: dur, ease: 'power2.out' });
    }

    // 2. Voyage marker glides to overall (honest continuous mapping, no invented states).
    if (ctrl.ship) {
      const x = clamp01(overall ?? 0) * ROUTE_LEN;
      if (ctrl.reduced) gsap.set(ctrl.ship, { x });
      else gsap.to(ctrl.ship, { x, duration: dur * 1.25, ease: 'power3.out' });
    }

    // 3. Verdict signature: flash the affected system + thump the hull, only on a
    //    NEW verdict. The affected system is derived from the net stock delta since
    //    the previous react call (the verdict's stock carries the extra +/-delta).
    const newVerdict = lastVerdict && lastVerdict !== ctrl.prevVerdict;
    ctrl.prevVerdict = lastVerdict || ctrl.prevVerdict;

    if (newVerdict && ctrl.prevStocks) {
      const wantMax = lastVerdict.tone === 'success';
      let best = null, bestVal = wantMax ? -Infinity : Infinity;
      for (const k of SYSTEMS) {
        const net = (state[k] ?? 0) - (ctrl.prevStocks[k] ?? 0);
        if ((wantMax && net > bestVal) || (!wantMax && net < bestVal)) { bestVal = net; best = k; }
      }
      flashSystem(ctrl, best, lastVerdict.tone);
      thumpHull(ctrl, lastVerdict.tone);
    }
    ctrl.prevStocks = { ...state };
  },
};

window.World = World;
