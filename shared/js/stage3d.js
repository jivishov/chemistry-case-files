// stage3d.js: the shared depth environment for this suite's Three.js stages
// (U4's VSEPR viewer, U7's kinetic particle box). Relies on the page's import map.
//
// Both stages used to sit on a flat fill, which flattens them: with no horizon and no
// ground, a rotating model reads as a sticker rather than as an object in a space. This
// module adds the ROOM around the model and nothing else:
//   - a graded studio backdrop, bright behind the subject and deeper above and below,
//     so the frame has a light direction and the model has something to sit against;
//   - a floor grid that recedes and dissolves, giving perspective something to converge
//     on (its cells are a fixed world size, so in U7 the box visibly spans more of them
//     as volume grows);
//   - a soft contact shadow, so the model has somewhere to stand.
//
// It deliberately touches nothing that belongs to the model: no lights are added, no
// material is edited, no environment map is installed, so the molecule and the particle
// box shade EXACTLY as they did before. Every object it adds is depthWrite:false, and
// update() fades the floor out as the camera drops toward and under the ground plane, so
// the environment can never veil or occlude the thing being taught.
import * as THREE from 'three';

// sRGB hexes. units/04 and units/07 `css/style.css` mirror these in the `.stage`
// fallback gradient — what shows for the frame before WebGL first paints.
//
// These values are constrained, not just chosen. U7's cage is a 1px line of #9fb6bf
// (luminance 176) and U4's bonds are near it, so any large FIELD the environment paints
// has to stay clear of that band or the wireframe dissolves into it. A first pass with a
// mid-tone floor (luminance ~190, ~150 under the shadow) put 43% of the cage's pixels
// under 25 luminance of contrast and 21% under 12 — i.e. gone. So the whole environment
// is kept LIGHT (every field >= ~208): the floor is a lit surface, not a dark one, and
// depth comes from the ramp between 208 and 251 plus the thin grid lines, which are free
// to be dark because they are 1px and sparse. Re-measure if you retune any of this.
export const BACKDROP = { top: 0xd6e5ec, horizon: 0xf8fbfc, bottom: 0xc0d2db };

const GROUND = 0xfbfdfe;   // floor haze: brighter than the backdrop, so it reads as a lit surface
const GRID   = 0x7e97a3;
const SHADOW = 0x2f4a57;

// Kept below the cage's own weight on purpose: particles darkest, then the cage, then the
// grid, then the floor. At 0.55 the grid lines landed at the cage's exact luminance.
const GRID_ALPHA   = 0.38;  // lives in the grid's vertex alpha, not material.opacity
const HAZE_ALPHA   = 0.85;
// Readable because the disc is TIGHT (shadowSpread < 1): it stays inside the model's own
// screen silhouette, so it darkens the ground behind the particles and never behind the
// cage's bottom edges, which fall on floor further out than the disc reaches.
const SHADOW_ALPHA = 0.30;

const clamp01 = x => (x < 0 ? 0 : x > 1 ? 1 : x);
const smooth = t => t * t * (3 - 2 * t);
const rgba = (hex, a) => `rgba(${(hex >> 16) & 255},${(hex >> 8) & 255},${hex & 255},${a})`;

// Backdrop dome. Vertex colours (not a custom shader) so three handles the colour-space
// conversion the same way it does for every other material in these scenes.
function buildBackdrop(radius) {
  const geo = new THREE.SphereGeometry(radius, 16, 64);
  const pos = geo.attributes.position;
  const horizon = new THREE.Color(BACKDROP.horizon);
  const top = new THREE.Color(BACKDROP.top);
  const bottom = new THREE.Color(BACKDROP.bottom);
  const col = new Float32Array(pos.count * 3);
  const c = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    // Key the ramp to LATITUDE, not world height: the visible slice of a 55-unit sphere
    // is a sliver of its world Y, so a height ramp would read as a flat fill again. The
    // ramp runs the WHOLE way to each pole rather than saturating early, so no camera
    // angle — including orbiting under the floor — ever frames a flat fill.
    const s = pos.getY(i) / radius;                     // sin(latitude), -1..1
    c.copy(horizon).lerp(s >= 0 ? top : bottom, smooth(Math.abs(s)));
    col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
  }
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({
    side: THREE.BackSide, vertexColors: true, depthWrite: false, fog: false
  }));
  mesh.renderOrder = -1;
  return mesh;
}

function radialTexture(stops) {
  const cv = document.createElement('canvas');
  cv.width = cv.height = 256;
  const ctx = cv.getContext('2d');
  const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  for (const [at, color] of stops) g.addColorStop(at, color);
  ctx.fillStyle = g; ctx.fillRect(0, 0, 256, 256);
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// A unit-radius disc lying in the XZ plane, scaled by the caller. CircleGeometry's UVs
// put the gradient's centre at the disc's centre and its edge at the rim.
function buildDisc(texture, opacity, order) {
  const mesh = new THREE.Mesh(
    new THREE.CircleGeometry(1, 64),
    new THREE.MeshBasicMaterial({
      map: texture, transparent: true, opacity, depthWrite: false,
      side: THREE.DoubleSide, fog: false
    })
  );
  mesh.rotation.x = -Math.PI / 2;
  mesh.renderOrder = order;
  return mesh;
}

// Floor grid. Each line is cut into sub-segments so the fade can run ALONG it: a single
// long segment would only carry its two end alphas and would fade to nothing everywhere.
function buildGrid(extent, cell) {
  const c = new THREE.Color(GRID);
  const hold = extent * 0.18;                           // full strength under the model
  const alphaAt = r => GRID_ALPHA * (1 - clamp01((r - hold) / (extent - hold))) ** 2;
  const step = cell / 2;
  const lines = Math.floor(extent / cell);
  const pos = [], col = [];
  for (let i = -lines; i <= lines; i++) {
    const off = i * cell;
    for (let axis = 0; axis < 2; axis++) {
      for (let t = -extent; t < extent - 1e-6; t += step) {
        const ax = axis ? off : t, az = axis ? t : off;
        const bx = axis ? off : t + step, bz = axis ? t + step : off;
        const ra = Math.hypot(ax, az), rb = Math.hypot(bx, bz);
        if (ra >= extent && rb >= extent) continue;      // dissolve into a circle, not a square
        pos.push(ax, 0, az, bx, 0, bz);
        col.push(c.r, c.g, c.b, alphaAt(ra), c.r, c.g, c.b, alphaAt(rb));
      }
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 4));   // 4 items = vertex alpha
  const grid = new THREE.LineSegments(geo, new THREE.LineBasicMaterial({
    vertexColors: true, transparent: true, depthWrite: false, fog: false
  }));
  grid.renderOrder = 2;
  return grid;
}

/**
 * Add the backdrop + ground to a scene. Returns the handle the stage drives:
 *   setFootprint(half) - half-extent of the model, in world units. Parks the floor just
 *                        under it and sizes the contact shadow to match. Call again
 *                        whenever the model's size changes (U7's volume slider).
 *   update(camera)     - call once per frame, before render.
 *   dispose()          - release geometries, materials and canvas textures.
 */
export function createStageEnvironment(scene, opts = {}) {
  const {
    backdropRadius = 55,      // camera far plane is 100 and maxDistance 16 in both stages
    gridExtent = 12,
    gridCell = 1.15,
    floorGap = 0.3,           // the model hovers this far above the ground, studio-style
    hazeRadius = gridExtent * 0.42,
    shadowSpread = 0.95       // < 1 on purpose; see SHADOW_ALPHA
  } = opts;

  const backdrop = buildBackdrop(backdropRadius);
  const haze = buildDisc(radialTexture([
    [0, rgba(GROUND, 0.95)], [0.5, rgba(GROUND, 0.5)], [1, rgba(GROUND, 0)]
  ]), HAZE_ALPHA, 1);
  haze.scale.setScalar(hazeRadius);
  const grid = buildGrid(gridExtent, gridCell);
  const shadow = buildDisc(radialTexture([
    [0, rgba(SHADOW, 0.85)], [0.45, rgba(SHADOW, 0.34)], [1, rgba(SHADOW, 0)]
  ]), SHADOW_ALPHA, 3);

  // One group, fixed render order: haze, then grid, then the shadow falling across both.
  const floor = new THREE.Group();
  floor.add(haze, grid, shadow);
  scene.add(backdrop, floor);

  let floorY = -floorGap;

  function setFootprint(half) {
    const h = Math.abs(half);
    floorY = -h - floorGap;
    floor.position.y = floorY;
    shadow.scale.setScalar(Math.max(h, 0.3) * shadowSpread);
  }

  function update(camera) {
    // Scenery, not a lid: the ground fades as the eye drops to and under its plane, so
    // orbiting underneath never draws a grid across the model.
    const e = smooth(clamp01((camera.position.y - floorY) / 0.9));
    grid.material.opacity = e;
    haze.material.opacity = HAZE_ALPHA * e;
    shadow.material.opacity = SHADOW_ALPHA * e;
  }

  function dispose() {
    scene.remove(backdrop, floor);
    for (const m of [backdrop, haze, grid, shadow]) {
      m.geometry.dispose();
      m.material.map?.dispose();
      m.material.dispose();
    }
  }

  setFootprint(1);
  return { setFootprint, update, dispose };
}
