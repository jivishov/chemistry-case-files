// tests/helpers/headless-sim.mjs — run a unit's createSim() outside a browser.
//
// Every units/<unit>/js/main.js exports a createSim() whose fields Alpine spreads onto a
// reactive component. The chemistry, the generators and the verdict builders in there are
// plain JS and are the half worth testing; the only thing that stops node from running them
// is that they reach for three Alpine magics ($nextTick, $watch, $refs) and, in a handful of
// places, for DOM nodes behind those refs.
//
// So this stubs exactly those three and nothing else:
//   * $nextTick(fn) runs fn synchronously. Every caller uses it to re-apply a <select>'s
//     value or re-measure a canvas after a re-render, so running it inline is a no-op in
//     node and never skips generator work.
//   * $watch(prop, fn) records the watcher and never fires it. Nothing a generator asserts
//     depends on a watcher having run.
//   * $refs is a Proxy returning `undefined` for any name, so `this.$refs.foo && ...` and
//     `if (!el) return` guards take their absent branch, which is the same branch the real
//     component takes before its first paint.
//
// Anything that still throws is a genuine node-hostile dependency and should be reported,
// not stubbed away: the point of this harness is to run the REAL generator, not a mock.
const NO_REFS = new Proxy({}, { get: () => undefined, has: () => false });

export async function loadSim(unit, { tree = 'units' } = {}) {
  const mod = await import(`../../${tree}/${unit}/js/main.js`);
  if (typeof mod.createSim !== 'function') throw new Error(`${tree}/${unit}: no createSim export`);
  return mod;
}

// Build a sim and run its init(). `patch` is merged in BEFORE init, which is how a test
// pins a toggle (`{ honors: true }`) that init would otherwise read at its default.
export function makeSim(createSim, patch = {}) {
  const sim = createSim();
  sim.$nextTick = fn => { if (typeof fn === 'function') fn(); };
  sim.$watch = () => {};
  sim.$refs = NO_REFS;
  Object.assign(sim, patch);
  if (typeof sim.init === 'function') sim.init();
  return sim;
}

// Deterministic Math.random, so a failing draw can be reproduced from the seed alone.
// mulberry32: one multiply-xorshift round, uniform enough for pool coverage and short
// enough to read. Returns a restore().
export function seedRandom(seed = 1) {
  const real = Math.random;
  let a = seed >>> 0;
  Math.random = () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return () => { Math.random = real; };
}
