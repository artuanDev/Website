import * as THREE from "three";

// ---------------------------------------------------------------------------
// Scene building blocks for the "space → sky → grassy field" backdrop.
//
// The camera is ORTHOGRAPHIC and mapped 1 world-unit = 1 CSS pixel, with the
// origin at the viewport centre (+y up). This keeps everything flat-on (no
// perspective foreshortening, so the tree never appears to float above the
// blades) and makes it trivial to anchor the field to the page bottom.
//
// The vertical sky gradient is painted in CSS (#sky-bg). Three.js draws the
// lively parts: faint twinkling stars high up, a flat green ground, a swaying
// instanced grass field, and a single low-poly tree.
// ---------------------------------------------------------------------------

// ---------- Stars ----------
// One THREE.Points cloud (one draw call). Stars are kept faint and fade toward
// the middle of the sky so they never sit brightly behind body text.
export function createStars(count, vp) {
  const positions = new Float32Array(count * 3);
  const phases = new Float32Array(count);
  const sizes = new Float32Array(count);
  const alphas = new Float32Array(count);

  const top = vp.h / 2;
  const zoneBottom = vp.h * 0.02;

  for (let i = 0; i < count; i++) {
    const y = zoneBottom + Math.random() * (top - zoneBottom);
    positions[i * 3 + 0] = (Math.random() - 0.5) * vp.w * 1.1;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = 0;
    phases[i] = Math.random() * Math.PI * 2;
    sizes[i] = 1.4 + Math.random() * 2.2;
    // Brightest near the top, fading to nothing toward the middle of the sky.
    alphas[i] = Math.min(1, (y - zoneBottom) / ((top - zoneBottom) * 0.6));
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("phase", new THREE.BufferAttribute(phases, 1));
  geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));
  geometry.setAttribute("aAlpha", new THREE.BufferAttribute(alphas, 1));

  const material = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uPixelRatio: { value: 1 },
      uOpacity: { value: 0.4 }, // overall star opacity — kept low for readability
    },
    transparent: true,
    depthWrite: false,
    depthTest: false,
    blending: THREE.AdditiveBlending,
    vertexShader: /* glsl */ `
      attribute float phase;
      attribute float size;
      attribute float aAlpha;
      uniform float uTime;
      uniform float uPixelRatio;
      varying float vTwinkle;
      varying float vAlpha;
      void main() {
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        vTwinkle = 0.5 + 0.5 * sin(uTime * 1.4 + phase);
        vAlpha = aAlpha;
        gl_PointSize = size * uPixelRatio * (0.7 + 0.3 * vTwinkle);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uOpacity;
      varying float vTwinkle;
      varying float vAlpha;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        float soft = smoothstep(0.5, 0.0, d);
        float alpha = soft * vAlpha * (0.35 + 0.65 * vTwinkle) * uOpacity;
        if (alpha < 0.01) discard;
        // Warm-white star colour.
        gl_FragColor = vec4(1.0, 0.96, 0.88, alpha);
      }
    `,
  });

  return new THREE.Points(geometry, material);
}

// ---------- Ground ----------
// A flat green quad whose TOP edge sits on the ground line (y = 0 within the
// field group) and extends downward to cover everything below it.
export function createGround(width, height) {
  const geo = new THREE.PlaneGeometry(width, height);
  geo.translate(0, -height / 2, 0); // top edge at y = 0
  const mat = new THREE.MeshBasicMaterial({ color: 0x1f4a26 });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.z = -6;
  return mesh;
}

// ---------- Grass ----------
// One InstancedMesh of thin blades, pivot at the base (y = 0) so a per-instance
// Z rotation reads as wind sway from the root. Uses an UNLIT material so the
// blades are reliably green regardless of how each one happens to be oriented.
export function createGrass(count, area) {
  const blade = new THREE.PlaneGeometry(7, 100, 1, 1);
  blade.translate(0, 50, 0); // pivot at the base

  const material = new THREE.MeshBasicMaterial({
    vertexColors: true,
    side: THREE.DoubleSide,
  });

  const mesh = new THREE.InstancedMesh(blade, material, count);
  const color = new THREE.Color();
  const data = [];

  for (let i = 0; i < count; i++) {
    const depth = Math.random(); // 0 = front, 1 = back
    const instance = {
      x: (Math.random() - 0.5) * area.width,
      z: 3 - depth * 7, // front blades nearer the camera than the tree
      rotY: Math.random() * Math.PI,
      height: 42 + Math.random() * (depth < 0.5 ? 95 : 60),
      widthScale: 0.7 + Math.random() * 0.7,
      baseTilt: (Math.random() - 0.5) * 0.25,
      phase: Math.random() * Math.PI * 2,
      swaySpeed: 0.7 + Math.random() * 0.7,
    };
    data.push(instance);

    // Bright green up front, slightly darker/cooler toward the back.
    const shade = 0.85 + Math.random() * 0.4 - depth * 0.3;
    color.setRGB(0.22 * shade, 0.6 * shade, 0.26 * shade);
    mesh.setColorAt(i, color);
  }
  mesh.instanceColor.needsUpdate = true;

  return { mesh, data };
}

// ---------- Tree ----------
// A stylized low-poly tree: tapered trunk + a few flat-shaded canopy blobs.
// Built around y = 0 at the trunk base so it roots exactly on the ground line.
export function createTree(scale) {
  const group = new THREE.Group();

  const trunkMat = new THREE.MeshStandardMaterial({
    color: 0x7a5230,
    roughness: 0.95,
    flatShading: true,
  });
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.22, 1.8, 6), trunkMat);
  trunk.position.y = 0.9; // base at y = 0
  group.add(trunk);

  const canopyDark = new THREE.MeshStandardMaterial({
    color: 0x2f6b34,
    roughness: 0.85,
    flatShading: true,
  });
  const canopyLight = canopyDark.clone();
  canopyLight.color.setHex(0x46934b);

  const blobs = [
    { p: [0, 2.2, 0], r: 0.95, mat: canopyDark },
    { p: [-0.7, 1.85, 0.2], r: 0.7, mat: canopyLight },
    { p: [0.7, 1.9, -0.1], r: 0.72, mat: canopyDark },
    { p: [0.1, 2.75, 0.1], r: 0.62, mat: canopyLight },
  ];
  for (const b of blobs) {
    const blob = new THREE.Mesh(new THREE.IcosahedronGeometry(b.r, 0), b.mat);
    blob.position.set(...b.p);
    group.add(blob);
  }

  group.scale.setScalar(scale);
  group.position.z = -2;
  return group;
}
