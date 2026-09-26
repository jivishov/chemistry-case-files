/* tests/helpers/three-resolve.mjs — a module-resolution hook that maps `three` to a stub.
 *
 * The page supplies `three` and `three/addons/` through an importmap (see units/04 and 07
 * index.html). Node has no importmap, so `import * as THREE from 'three'` is unresolvable and
 * those two units' main.js could not be loaded in a test at all.
 *
 * Registered from the test rather than passed on the command line, so `npm test` needs no
 * flags and the reason lives next to the assertions that depend on it:
 *
 *   import { register } from 'node:module';
 *   register('./helpers/three-resolve.mjs', import.meta.url);
 *
 * It short-circuits ONLY those two specifier shapes and delegates everything else, so a
 * mis-spelled import in product code still fails the way it should.
 */
const STUB = new URL('./three-stub.mjs', import.meta.url).href;

export function resolve(specifier, context, next) {
  if (specifier === 'three' || specifier.startsWith('three/addons/')) {
    return { url: STUB, shortCircuit: true, format: 'module' };
  }
  return next(specifier, context);
}
