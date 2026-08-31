import * as THREE from "three";
import {
  createStars,
  createDawnGlow,
  createHills,
  createGround,
  createGrass,
  createTree,
} from "./sceneObjects.js";

// The CSS layer supplies the long page-height sky gradient. This viewport-sized
// Three.js scene supplies the moving, procedural detail and anchors the field
// to the bottom of the document as the user scrolls toward it.
const MAX_PIXEL_RATIO = 2;
const MOBILE_BREAKPOINT = 768;
const RESIZE_DEBOUNCE_MS = 150;

const STARS_DESKTOP = 340;
const STARS_MOBILE = 150;
const GRASS_DESKTOP = 920;
const GRASS_MOBILE = 330;
const FIELD_BASE_PX = 82;
const BACKGROUND_PREFERENCE_KEY = "portfolio:three-background";

let renderer = null;
let scene = null;
let camera = null;
let stars = null;
let field = null;
let animationId = null;
let resizeTimer = null;
let bodyObserver = null;
let started = false;
let failed = false;
let cachedDocHeight = 0;
let tabVisible = !document.hidden;

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const clock = new THREE.Clock();

function readBackgroundPreference() {
  try {
    return localStorage.getItem(BACKGROUND_PREFERENCE_KEY) !== "off";
  } catch {
    return true;
  }
}

let backgroundPreference = readBackgroundPreference();

function updateCanvasVisibility(enabled) {
  const canvas = document.getElementById("bg-canvas");
  canvas?.classList.toggle("is-disabled", !enabled);
}

export function isThreeBackgroundEnabled() {
  return backgroundPreference;
}

export function setThreeBackgroundEnabled(enabled) {
  const nextValue = Boolean(enabled);
  backgroundPreference = nextValue;
  try {
    localStorage.setItem(BACKGROUND_PREFERENCE_KEY, nextValue ? "on" : "off");
  } catch {
    // The toggle still works for this page load if storage is unavailable.
  }

  updateCanvasVisibility(nextValue);
  if (nextValue) initThreeBackground();
  else destroyThreeBackground();
  return nextValue;
}

function isMobile() {
  return window.innerWidth < MOBILE_BREAKPOINT;
}

function disposeMaterial(material) {
  if (Array.isArray(material)) material.forEach(disposeMaterial);
  else material?.dispose();
}

function disposeObject(object) {
  object?.traverse((child) => {
    child.geometry?.dispose();
    disposeMaterial(child.material);
  });
}

function clearScenery() {
  if (stars) {
    scene.remove(stars);
    disposeObject(stars);
    stars = null;
  }
  if (field?.group) {
    scene.remove(field.group);
    disposeObject(field.group);
    field = null;
  }
}

function buildScene() {
  clearScenery();

  const width = window.innerWidth;
  const height = window.innerHeight;
  const mobile = isMobile();

  stars = createStars(mobile ? STARS_MOBILE : STARS_DESKTOP, { w: width, h: height });
  stars.material.uniforms.uPixelRatio.value = renderer.getPixelRatio();
  scene.add(stars);

  const group = new THREE.Group();

  const dawnGlow = createDawnGlow(mobile ? 210 : 290);
  dawnGlow.position.set(-width * (mobile ? 0.25 : 0.3), mobile ? 78 : 96, -12);
  group.add(dawnGlow);

  group.add(createHills(width * 1.45));
  group.add(createGround(width * 1.6, height));

  const backGrass = createGrass(Math.round((mobile ? GRASS_MOBILE : GRASS_DESKTOP) * 0.62), {
    width: width * 1.52,
    minHeight: mobile ? 22 : 24,
    maxHeight: mobile ? 68 : 78,
    zNear: -1.4,
    zFar: -5.6,
    seed: mobile ? 2603 : 4519,
    palette: [0x376d3c, 0x719c52],
  });
  group.add(backGrass.mesh);

  const trees = [];
  if (!mobile) {
    const distantTree = createTree(31, { seed: 813, distant: true, lean: -0.02 });
    distantTree.position.x = -width * 0.37;
    trees.push(distantTree);

    const middleTree = createTree(42, { seed: 1521, distant: true, lean: 0.015 });
    middleTree.position.x = width * 0.06;
    trees.push(middleTree);
  }

  const mainTree = createTree(mobile ? 57 : 72, { seed: 3407, lean: -0.012 });
  mainTree.position.x = width * (mobile ? 0.27 : 0.34);
  trees.push(mainTree);
  trees.forEach((tree) => group.add(tree));

  const frontGrass = createGrass(Math.round((mobile ? GRASS_MOBILE : GRASS_DESKTOP) * 0.52), {
    width: width * 1.52,
    minHeight: mobile ? 36 : 40,
    maxHeight: mobile ? 94 : 112,
    zNear: 5.5,
    zFar: -0.6,
    seed: mobile ? 6221 : 9217,
    palette: [0x23612f, 0x559e46],
  });
  group.add(frontGrass.mesh);

  scene.add(group);
  field = { group, grasses: [backGrass, frontGrass], trees, dawnGlow };

  updateAnchor();
  updateSceneMotion(0);
}

function updateAnchor() {
  if (!field) return;
  const viewportHeight = window.innerHeight;
  const distanceFromBottom = Math.max(0, cachedDocHeight - (window.scrollY + viewportHeight));
  field.group.position.y = -viewportHeight / 2 + (FIELD_BASE_PX - distanceFromBottom);

  const scrollableDistance = Math.max(1, cachedDocHeight - viewportHeight);
  const scrollProgress = THREE.MathUtils.clamp(window.scrollY / scrollableDistance, 0, 1);
  if (stars) stars.material.uniforms.uOpacity.value = THREE.MathUtils.lerp(0.42, 0.18, scrollProgress);
}

function updateSceneMotion(time) {
  if (stars) stars.material.uniforms.uTime.value = time;
  if (!field) return;

  field.grasses.forEach((grass) => {
    grass.material.uniforms.uTime.value = time;
  });
  field.dawnGlow.material.uniforms.uTime.value = time;

  field.trees.forEach((tree, index) => {
    const phase = tree.userData.windPhase ?? index;
    const baseRotation = tree.userData.baseRotation ?? 0;
    tree.rotation.z = baseRotation + Math.sin(time * 0.38 + phase) * (index === field.trees.length - 1 ? 0.0055 : 0.0035);
    if (tree.userData.canopy) {
      tree.userData.canopy.rotation.z = Math.sin(time * 0.62 + phase * 1.3) * 0.008;
    }
  });
}

function renderFrame() {
  if (renderer && scene && camera) renderer.render(scene, camera);
}

function animate() {
  animationId = requestAnimationFrame(animate);
  if (!tabVisible) return;

  updateSceneMotion(clock.getElapsedTime());
  renderFrame();
}

function updateCamera() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  camera.left = -width / 2;
  camera.right = width / 2;
  camera.top = height / 2;
  camera.bottom = -height / 2;
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
    renderFrame();
  }, RESIZE_DEBOUNCE_MS);
}

function handleScroll() {
  updateAnchor();
  if (reducedMotion) renderFrame();
}

function handleVisibilityChange() {
  tabVisible = !document.hidden;
  if (tabVisible) clock.getDelta();
}

export function initThreeBackground() {
  if (!backgroundPreference) {
    updateCanvasVisibility(false);
    return;
  }
  if (started || failed) return;
  started = true;
  updateCanvasVisibility(true);

  try {
    const canvas = document.getElementById("bg-canvas");
    if (!canvas) {
      failed = true;
      return;
    }

    const width = window.innerWidth;
    const height = window.innerHeight;

    scene = new THREE.Scene();
    camera = new THREE.OrthographicCamera(-width / 2, width / 2, height / 2, -height / 2, -1000, 1000);
    camera.position.z = 10;

    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "high-performance" });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, MAX_PIXEL_RATIO));
    renderer.setSize(width, height);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    scene.add(new THREE.HemisphereLight(0xa9c8e6, 0x1b3822, 1.5));

    const dawnLight = new THREE.DirectionalLight(0xffc184, 1.7);
    dawnLight.position.set(-5, 4, 7);
    scene.add(dawnLight);

    const coolFill = new THREE.DirectionalLight(0x7ca8dc, 0.65);
    coolFill.position.set(4, 2, 5);
    scene.add(coolFill);

    cachedDocHeight = document.documentElement.scrollHeight;
    buildScene();

    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll, { passive: true });
    document.addEventListener("visibilitychange", handleVisibilityChange);

    bodyObserver = new ResizeObserver(() => {
      cachedDocHeight = document.documentElement.scrollHeight;
      updateAnchor();
      if (reducedMotion) renderFrame();
    });
    bodyObserver.observe(document.body);

    if (reducedMotion) renderFrame();
    else {
      clock.start();
      animate();
    }
  } catch (error) {
    failed = true;
    started = false;
    updateCanvasVisibility(false);
    console.error("[three background] failed to initialize, skipping:", error);
  }
}

// Retained for the route renderer API. The scene is tied to the document, not
// to one route's hero element.
export function observeHeroElement() {}

export function destroyThreeBackground() {
  if (!started) return;
  cancelAnimationFrame(animationId);
  animationId = null;
  clearTimeout(resizeTimer);
  window.removeEventListener("resize", handleResize);
  window.removeEventListener("scroll", handleScroll);
  document.removeEventListener("visibilitychange", handleVisibilityChange);
  bodyObserver?.disconnect();
  clearScenery();
  clock.stop();
  renderer?.dispose();
  renderer = null;
  scene = null;
  camera = null;
  started = false;
}
