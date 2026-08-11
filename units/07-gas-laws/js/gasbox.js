// gasbox.js: Three.js kinetic particle box for Unit 7 (C.10A).
// Particles in constant random motion with elastic wall collisions, speed scaled
// by temperature (v proportional to sqrt(T)). Relies on the document's import map.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const BASE = 0.018;   // baseline step length per frame at the reference temperature
const T_REF = 300;    // K, the temperature at which tempScale === 1
const PART_R = 0.11;  // particle radius (small -> "negligible volume" postulate)
const PALETTE = [0x2a7d8a, 0x3f8f9c, 0x5a6b9c, 0x4f93a0];

const rand = (a, b) => a + Math.random() * (b - a);

export function createGasBox() {
  let scene, camera, renderer, controls, ro, raf, host, mounted = false;
  let cage = null;          // wireframe cube (LineSegments)
  let half = 2.3;           // half-edge of the cube (volume control)
  let tempScale = 1;        // sqrt(T / T_REF)
  let parts = [];           // [{ mesh, vel: THREE.Vector3, base: number }]

  function mount(container) {
    if (mounted) return;
    host = container;
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xeef4f5);
    camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(5.4, 3.6, 6.4);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    host.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.72));
    const key = new THREE.DirectionalLight(0xffffff, 0.85); key.position.set(5, 8, 6); scene.add(key);
    const fill = new THREE.DirectionalLight(0xbcd, 0.35); fill.position.set(-5, -3, -4); scene.add(fill);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; controls.enablePan = false;
    controls.minDistance = 5; controls.maxDistance = 16;
    controls.target.set(0, 0, 0);

    buildCage();
    ro = new ResizeObserver(resize); ro.observe(host);
    resize();
    mounted = true;
    const loop = () => { raf = requestAnimationFrame(loop); step(); controls.update(); renderer.render(scene, camera); };
    loop();
  }

  function resize() {
    if (!host) return;
    const w = host.clientWidth || 320, h = host.clientHeight || 320;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
  }

  function buildCage() {
    if (cage) { cage.geometry.dispose(); cage.material.dispose(); scene.remove(cage); }
    const box = new THREE.BoxGeometry(half * 2, half * 2, half * 2);
    const edges = new THREE.EdgesGeometry(box);
    cage = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x9fb6bf }));
    box.dispose();
    scene.add(cage);
  }

  function makeParticle() {
    const g = new THREE.SphereGeometry(PART_R, 16, 12);
    const m = new THREE.MeshStandardMaterial({ color: PALETTE[(Math.random() * PALETTE.length) | 0], roughness: 0.4, metalness: 0.05 });
    const mesh = new THREE.Mesh(g, m);
    mesh.position.set(rand(-half, half), rand(-half, half), rand(-half, half));
    // Random direction; per-particle speed spread gives a lively range of speeds.
    const dir = new THREE.Vector3(rand(-1, 1), rand(-1, 1), rand(-1, 1)).normalize();
    const base = BASE * rand(0.55, 1.5);
    const vel = dir.multiplyScalar(base * tempScale);
    scene.add(mesh);
    return { mesh, vel, base };
  }

  function step() {
    const lim = half - PART_R;
    for (const p of parts) {
      const pos = p.mesh.position;
      pos.add(p.vel);
      ['x', 'y', 'z'].forEach(ax => {
        if (pos[ax] > lim) { pos[ax] = lim; p.vel[ax] = -p.vel[ax]; }
        else if (pos[ax] < -lim) { pos[ax] = -lim; p.vel[ax] = -p.vel[ax]; }
      });
    }
  }

  function setCount(n) {
    if (!mounted) return;
    while (parts.length < n) parts.push(makeParticle());
    while (parts.length > n) {
      const p = parts.pop();
      p.mesh.geometry.dispose(); p.mesh.material.dispose(); scene.remove(p.mesh);
    }
  }

  function setTemperature(T) {
    const next = Math.sqrt(Math.max(T, 1) / T_REF);
    const ratio = tempScale > 0 ? next / tempScale : 1;
    parts.forEach(p => p.vel.multiplyScalar(ratio));
    tempScale = next;
  }

  // volRel: relative volume (1 = default cube). Edge scales with the cube root.
  function setVolume(volRel) {
    half = 2.3 * Math.cbrt(Math.max(volRel, 0.05));
    if (!mounted) return;
    buildCage();
    const lim = half - PART_R;
    parts.forEach(p => p.mesh.position.clampScalar(-lim, lim));
  }

  function isMounted() { return mounted; }
  function dispose() {
    if (!mounted) return;
    cancelAnimationFrame(raf); ro?.disconnect();
    parts.forEach(p => { p.mesh.geometry.dispose(); p.mesh.material.dispose(); scene.remove(p.mesh); });
    parts = [];
    cage?.geometry.dispose(); cage?.material.dispose();
    renderer.dispose(); renderer.domElement.remove(); mounted = false;
  }

  return { mount, setCount, setTemperature, setVolume, isMounted, dispose };
}
