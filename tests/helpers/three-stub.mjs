/* tests/helpers/three-stub.mjs — a three.js stand-in for the headless harness.
 *
 * Units 04 and 07 could not be driven in tests/scenario-coherence.test.mjs at all: their
 * main.js imports ./vsepr.js and ./gasbox.js, both of which `import * as THREE from 'three'`,
 * and node cannot resolve a bare specifier the page supplies through an importmap. So the
 * chemistry, the generators and the verdict builders in two of eleven units -- the half of
 * main.js worth testing -- were asserted against model.js data instead of being run.
 *
 * Nothing in those two modules touches THREE at module scope: every use is inside mount() or
 * a build step that the harness never reaches, because `$refs` is absent and the viewer takes
 * its `if (!el) return` branch. So resolving the specifier is the whole problem.
 *
 * Every export here is a class whose constructor THROWS. That is deliberate and it is the
 * difference between a stub and a mock: if a future test really does try to render, it gets a
 * named error at the line that tried, rather than a silent no-op that quietly passes. A
 * `Proxy` would have been shorter and would have hidden exactly that.
 *
 * The list is every `THREE.*` symbol vsepr.js, gasbox.js and shared/js/stage3d.js reference.
 * A new one shows up as `undefined is not a constructor`, which is a clear enough signal to
 * come back and add it.
 */
const NAMES = [
  'AmbientLight', 'BoxGeometry', 'BufferAttribute', 'BufferGeometry', 'CanvasTexture',
  'CircleGeometry', 'Color', 'CylinderGeometry', 'DirectionalLight', 'EdgesGeometry',
  'Float32BufferAttribute', 'Group', 'LineBasicMaterial', 'LineSegments', 'Mesh',
  'MeshBasicMaterial', 'MeshStandardMaterial', 'PerspectiveCamera', 'Scene',
  'SphereGeometry', 'Vector3', 'WebGLRenderer',
  // three/addons/controls/OrbitControls.js resolves here too, so its one export lives here.
  'OrbitControls',
];

const unavailable = name => {
  const C = class {
    constructor() {
      throw new Error(
        `three.${name} was constructed under tests/helpers/three-stub.mjs. The headless ` +
        'harness resolves `three` to a stub because node cannot load the browser importmap; ' +
        'it can run a unit\'s generators but not its WebGL viewer. If this stack is a ' +
        'generator, something changed to make it reach the 3D stage.');
    }
  };
  Object.defineProperty(C, 'name', { value: name });
  return C;
};

const exported = Object.fromEntries(NAMES.map(n => [n, unavailable(n)]));

export const {
  AmbientLight, BoxGeometry, BufferAttribute, BufferGeometry, CanvasTexture,
  CircleGeometry, Color, CylinderGeometry, DirectionalLight, EdgesGeometry,
  Float32BufferAttribute, Group, LineBasicMaterial, LineSegments, Mesh,
  MeshBasicMaterial, MeshStandardMaterial, PerspectiveCamera, Scene,
  SphereGeometry, Vector3, WebGLRenderer, OrbitControls,
} = exported;

/* Side constants and colour spaces are read as VALUES, not constructed -- a material's
   `side: THREE.BackSide` is set at build time, so these have to be real numbers rather than
   throwing classes or the build would fail for the wrong reason. The values are three's own. */
export const BackSide = 1;
export const DoubleSide = 2;
export const SRGBColorSpace = 'srgb';
