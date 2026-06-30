import * as THREE from "three";
import { createStars, createGround, createGrass, createTree } from "./sceneObjects.js";

// Full-page backdrop. A CSS gradient (#sky-bg in style.css) paints the sky
// from deep space at the top to a warm dawn horizon at the bottom. This
// Three.js layer adds faint twinkling stars high in the sky and a grassy
// field with a low-poly tree that is ANCHORED TO THE BOTTOM OF THE PAGE:
// on a tall, scrolling tab you scroll down through the sky to reach the field.
//
// The canvas itself stays viewport-sized (cheap to render); the field group is
// shifted vertically based on scroll position so it lines up with the document
// bottom. An orthographic camera (1 unit = 1px) keeps the tree flat on the
// ground line with no perspective "floating".
const MAX_PIXEL_RATIO = 2;
const MOBILE_BREAKPOINT = 768;
const RESIZE_DEBOUNCE_MS = 150;

const STARS_DESKTOP = 260;
const STARS_MOBILE = 110;
const GRASS_DESKTOP = 280;
const GRASS_MOBILE = 110;

// Pixels of bare ground left visible below the grass roots at the page bottom.
const FIELD_BASE_PX = 70;

let renderer = null;
let scene = null;
let camera = null;
let stars = null;
let field = null; // { group, grass: { mesh, data }, tree }
let animationId = null;
let resizeTimer = null;
let bodyObserver = null;
let started = false;
let failed = false;

let cachedDocHeight = 0;
let tabVisible = !document.hidden;
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const clock = new THREE.Clock();
const dummy = new THREE.Object3D();

function isMobile() {
  return window.innerWidth < MOBILE_BREAKPOINT;
}

function buildScene() {
  for (const obj of [stars, field?.group]) {
    if (obj) scene.remove(obj);
  }

  const w = window.innerWidth;
  const h = window.innerHeight;

  stars = createStars(isMobile() ? STARS_MOBILE : STARS_DESKTOP, { w, h });
  stars.material.uniforms.uPixelRatio.value = renderer.getPixelRatio();
  scene.add(stars);

  const group = new THREE.Group();
  group.add(createGround(w * 1.6, h));

  const grass = createGrass(isMobile() ? GRASS_MOBILE : GRASS_DESKTOP, { width: w * 1.5 });
  group.add(grass.mesh);

  const tree = createTree(isMobile() ? 55 : 78);
  tree.position.x = w * (isMobile() ? 0.28 : 0.33);
  group.add(tree);

  scene.add(group);
  field = { group, grass, tree };

  layoutGrass(0);
  updateAnchor();
}

// Place the field so its ground line aligns with the bottom of the document:
// fully visible when scrolled to the bottom, sliding off-screen below when
// there is still more page beneath the viewport.
function updateAnchor() {
  if (!field) return;
  const vh = window.innerHeight;
  const distFromBottom = Math.max(0, cachedDocHeight - (window.scrollY + vh));
  field.group.position.y = -vh / 2 + (FIELD_BASE_PX - distFromBottom);
}

function layoutGrass(time) {
  const { mesh, data } = field.grass;
  for (let i = 0; i < data.length; i++) {
    const b = data[i];
    const sway = Math.sin(time * b.swaySpeed + b.phase) * 0.16;
    dummy.position.set(b.x, 0, b.z);
    dummy.rotation.set(0, b.rotY, b.baseTilt + sway);
    dummy.scale.set(b.widthScale, b.height / 100, 1);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
  }
  mesh.instanceMatrix.needsUpdate = true;
}

function renderFrame() {
  if (renderer && scene && camera) renderer.render(scene, camera);
}

function animate() {
  animationId = requestAnimationFrame(animate);
  if (!tabVisible) return;

  const time = clock.getElapsedTime();
  stars.material.uniforms.uTime.value = time;
  layoutGrass(time);
  if (field?.tree) field.tree.rotation.z = Math.sin(time * 0.5) * 0.02;

  renderFrame();
}

function updateCamera() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  camera.left = -w / 2;
  camera.right = w / 2;
  camera.top = h / 2;
  camera.bottom = -h / 2;
  camera.updateProjectionMatrix();
}

function resize() {
  if (!renderer || !camera) return;
  updateCamera();
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, MAX_PIXEL_RATIO));
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function handleResize() {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    resize();
    cachedDocHeight = document.documentElement.scrollHeight;
    buildScene();
    if (reducedMotion) renderFrame();
  }, RESIZE_DEBOUNCE_MS);
}

function handleScroll() {
  updateAnchor();
  if (reducedMotion) renderFrame();
}

function handleVisibilityChange() {
  tabVisible = !document.hidden;
}

export function initThreeBackground() {
  if (started || failed) return;
  started = true;

  try {
    const canvas = document.getElementById("bg-canvas");
    if (!canvas) {
      failed = true;
      return;
    }

    const w = window.innerWidth;
    const h = window.innerHeight;

    scene = new THREE.Scene();
    camera = new THREE.OrthographicCamera(-w / 2, w / 2, h / 2, -h / 2, -1000, 1000);
    camera.position.z = 10;

    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, MAX_PIXEL_RATIO));
    renderer.setSize(w, h);

    // Cool ambient + a warm low "dawn" key light so the tree reads warm.
    scene.add(new THREE.AmbientLight(0xb9c4dc, 1.0));
    const dawn = new THREE.DirectionalLight(0xffd2a1, 1.05);
    dawn.position.set(-4, 3, 6);
    scene.add(dawn);

    cachedDocHeight = document.documentElement.scrollHeight;
    buildScene();

    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll, { passive: true });
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Re-anchor the field when the page height changes (e.g. switching tabs).
    bodyObserver = new ResizeObserver(() => {
      cachedDocHeight = document.documentElement.scrollHeight;
      updateAnchor();
      if (reducedMotion) renderFrame();
    });
    bodyObserver.observe(document.body);

    if (reducedMotion) renderFrame();
    else animate();
  } catch (err) {
    failed = true;
    console.error("[three background] failed to initialize, skipping:", err);
  }
}

// Kept for API compatibility with main.js. The backdrop is a persistent
// full-page scene, so there's no hero element to track.
export function observeHeroElement() {}

export function destroyThreeBackground() {
  if (!started) return;
  cancelAnimationFrame(animationId);
  window.removeEventListener("resize", handleResize);
  window.removeEventListener("scroll", handleScroll);
  document.removeEventListener("visibilitychange", handleVisibilityChange);
  bodyObserver?.disconnect();
  stars?.geometry.dispose();
  stars?.material.dispose();
  field?.group.traverse((o) => {
    if (o.geometry) o.geometry.dispose();
    if (o.material) o.material.dispose();
  });
  renderer?.dispose();
  started = false;
}
