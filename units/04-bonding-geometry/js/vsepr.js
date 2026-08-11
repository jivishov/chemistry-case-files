// vsepr.js: Three.js molecular-geometry viewer for Unit 4 (C.7C).
// Relies on the document's import map providing `three` and `three/addons/`.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { createStageEnvironment, BACKDROP } from '../../../shared/js/stage3d.js';

const N = v => { const l = Math.hypot(...v) || 1; return [v[0] / l, v[1] / l, v[2] / l]; };
const s = Math.sin, c = Math.cos, R = Math.PI / 180;

// Bond + lone-pair directions per VSEPR geometry (lone pairs shown as translucent lobes).
const GEO = {
  'linear':              { bonds: [[1, 0, 0], [-1, 0, 0]], lone: [] },
  'bent':                { bonds: [[-s(52.25 * R), -c(52.25 * R), 0], [s(52.25 * R), -c(52.25 * R), 0]],
                           lone: [[-s(52.25 * R), c(52.25 * R), 0], [s(52.25 * R), c(52.25 * R), 0]] },
  'trigonal planar':     { bonds: [[1, 0, 0], [-0.5, 0.866, 0], [-0.5, -0.866, 0]], lone: [] },
  'trigonal pyramidal':  { bonds: [0, 1, 2].map(k => [s(68.2 * R) * c(120 * k * R), -c(68.2 * R), s(68.2 * R) * s(120 * k * R)]),
                           lone: [[0, 1, 0]] },
  'tetrahedral':         { bonds: [[1, 1, 1], [-1, -1, 1], [-1, 1, -1], [1, -1, -1]].map(N), lone: [] }
};

const COLOR = { H: 0xe8e8e8, C: 0x404040, N: 0x3050f8, O: 0xff3020, F: 0x7fe04f, Cl: 0x35c635,
  Be: 0xb6f000, B: 0xffb5b5, S: 0xffce1a, P: 0xff8000, default: 0x888888 };
const RAD = { H: 0.34, C: 0.46, N: 0.43, O: 0.40, F: 0.37, Cl: 0.55, Be: 0.50, B: 0.46, S: 0.60, P: 0.60, default: 0.45 };

// Lone pair: a translucent lobe with the two electrons it represents drawn inside it.
const LONE_R = 0.42;
const ELECTRON = 0x2f5d7a;   // dark enough to stay legible through the 32% shell
const ELECTRON_R = 0.095;    // a shade under the bond radius (0.1), so it reads as a dot
const ELECTRON_GAP = 0.16;   // half the separation; keeps both dots well inside LONE_R
const col = e => COLOR[e] ?? COLOR.default;
const rad = e => RAD[e] ?? RAD.default;

export function createViewer() {
  let scene, camera, renderer, controls, group, ro, raf, host, mounted = false;
  let env = null;              // backdrop + ground (shared/js/stage3d.js); scenery only
  const BOND_LEN = 1.75;
  // Widest molecule here is a bond out to a chlorine: BOND_LEN + rad('Cl'). Fixed, so the
  // ground is parked once.
  const EXTENT = BOND_LEN + RAD.Cl;

  function mount(container) {
    if (mounted) return;
    host = container;
    scene = new THREE.Scene();
    scene.background = new THREE.Color(BACKDROP.horizon);   // clear colour behind the dome
    camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 0, 6.5);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    host.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.65));
    const key = new THREE.DirectionalLight(0xffffff, 0.9); key.position.set(4, 6, 5); scene.add(key);
    const fill = new THREE.DirectionalLight(0xbcd, 0.4); fill.position.set(-5, -2, -3); scene.add(fill);

    // Scenery first, so the atoms and bonds keep drawing over it.
    // Small gap: this camera sits level with the molecule, so a floor much lower than the
    // widest molecule falls clean out of the 45-degree frame and shows nothing.
    env = createStageEnvironment(scene, { gridCell: 1, gridExtent: 11, floorGap: 0.18 });
    env.setFootprint(EXTENT);

    group = new THREE.Group(); scene.add(group);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; controls.enablePan = false;
    controls.minDistance = 3.5; controls.maxDistance = 12;
    controls.autoRotate = true; controls.autoRotateSpeed = 1.4;

    ro = new ResizeObserver(resize); ro.observe(host);
    resize();
    mounted = true;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      controls.update(); env.update(camera); renderer.render(scene, camera);
    };
    loop();
  }

  function resize() {
    if (!host) return;
    const w = host.clientWidth || 320, h = host.clientHeight || 320;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
  }

  function clearGroup() {
    while (group.children.length) {
      const m = group.children.pop();
      m.geometry?.dispose(); m.material?.dispose();
    }
  }

  function addAtom(pos, element, scale = 1) {
    const g = new THREE.SphereGeometry(rad(element) * scale, 32, 24);
    const m = new THREE.MeshStandardMaterial({ color: col(element), roughness: 0.45, metalness: 0.05 });
    const mesh = new THREE.Mesh(g, m); mesh.position.set(...pos); group.add(mesh);
  }

  function addBond(a, b) {
    const va = new THREE.Vector3(...a), vb = new THREE.Vector3(...b);
    const dir = new THREE.Vector3().subVectors(vb, va);
    const len = dir.length();
    const g = new THREE.CylinderGeometry(0.1, 0.1, len, 18);
    const m = new THREE.MeshStandardMaterial({ color: 0xb9c6cc, roughness: 0.6 });
    const mesh = new THREE.Mesh(g, m);
    mesh.position.copy(va).addScaledVector(dir, 0.5);
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
    group.add(mesh);
  }

  function addLone(dir) {
    const g = new THREE.SphereGeometry(LONE_R, 24, 18);
    // depthWrite off so the shell does not hide its own electrons (or the far lobe of a
    // second pair); it still depth-TESTS, so a lobe behind an atom stays behind it.
    const m = new THREE.MeshStandardMaterial({
      color: 0x6f93b0, transparent: true, opacity: 0.32, roughness: 0.8, depthWrite: false
    });
    const mesh = new THREE.Mesh(g, m);
    const at = new THREE.Vector3(...dir).multiplyScalar(0.95);
    mesh.position.copy(at);
    mesh.scale.set(1, 1, 0.6);
    group.add(mesh);
    addLonePairDots(at, dir);
  }

  // The two electrons the cloud stands for, drawn as a Lewis-style pair inside it. They are
  // opaque, so the opaque pass lays them down before the shell blends over them and they
  // read as being IN the cloud rather than stuck on it. The shell is squashed along world Z
  // (mesh.scale above), so the pair is separated on an axis perpendicular to both the lobe
  // direction and Z, which is where the cloud is still at full radius.
  function addLonePairDots(at, dir) {
    const axis = new THREE.Vector3()
      .crossVectors(new THREE.Vector3(...dir).normalize(), new THREE.Vector3(0, 0, 1));
    if (axis.lengthSq() < 1e-6) axis.set(1, 0, 0);        // lobe pointing straight along Z
    axis.normalize();
    for (const side of [-1, 1]) {
      const dot = new THREE.Mesh(
        new THREE.SphereGeometry(ELECTRON_R, 16, 12),
        new THREE.MeshBasicMaterial({ color: ELECTRON })
      );
      dot.position.copy(at).addScaledVector(axis, side * ELECTRON_GAP);
      group.add(dot);
    }
  }

  function setMolecule(mol) {
    if (!mounted || !mol) return;
    clearGroup();
    const geo = GEO[mol.geometry]; if (!geo) return;
    addAtom([0, 0, 0], mol.central, 1.15);
    geo.bonds.slice(0, mol.bonds).forEach(d => {
      const p = [d[0] * BOND_LEN, d[1] * BOND_LEN, d[2] * BOND_LEN];
      addBond([0, 0, 0], p);
      addAtom(p, mol.ligand);
    });
    geo.lone.slice(0, mol.lone).forEach(addLone);
    controls.reset?.();
    camera.position.set(0, 0, 6.5);
  }

  function setAutoRotate(on) { if (controls) controls.autoRotate = on; }
  function isMounted() { return mounted; }
  function dispose() {
    if (!mounted) return;
    cancelAnimationFrame(raf); ro?.disconnect(); clearGroup();
    env?.dispose(); env = null;
    renderer.dispose(); renderer.domElement.remove(); mounted = false;
  }

  return { mount, setMolecule, setAutoRotate, isMounted, dispose };
}
