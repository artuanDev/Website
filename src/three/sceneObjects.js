import * as THREE from "three";

// All scenery is generated from geometry and shaders. A seeded random source
// keeps the composition stable when the canvas is rebuilt after a resize.
function randomSource(seed) {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let result = value;
    result = Math.imul(result ^ (result >>> 15), result | 1);
    result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
}

function colorFromPalette(palette, amount) {
  return new THREE.Color(palette[0]).lerp(new THREE.Color(palette[1]), amount);
}

// ---------- Stars ----------
export function createStars(count, viewport) {
  const random = randomSource(7103 + count);
  const positions = new Float32Array(count * 3);
  const phases = new Float32Array(count);
  const sizes = new Float32Array(count);
  const alphas = new Float32Array(count);
  const colors = new Float32Array(count * 3);

  const top = viewport.h / 2;
  const zoneBottom = viewport.h * 0.015;
  const cool = new THREE.Color(0xb9d8ff);
  const warm = new THREE.Color(0xffe1bd);

  for (let i = 0; i < count; i++) {
    const distribution = Math.pow(random(), 0.72);
    const y = zoneBottom + distribution * (top - zoneBottom);
    const color = cool.clone().lerp(warm, random());

    positions[i * 3] = (random() - 0.5) * viewport.w * 1.12;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = -20;
    phases[i] = random() * Math.PI * 2;
    sizes[i] = random() > 0.94 ? 3.6 + random() * 2.2 : 1.1 + random() * 2.4;
    alphas[i] = Math.min(1, (y - zoneBottom) / Math.max(1, (top - zoneBottom) * 0.58));
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("phase", new THREE.BufferAttribute(phases, 1));
  geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));
  geometry.setAttribute("aAlpha", new THREE.BufferAttribute(alphas, 1));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  const material = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uPixelRatio: { value: 1 },
      uOpacity: { value: 0.42 },
    },
    transparent: true,
    depthWrite: false,
    depthTest: true,
    blending: THREE.AdditiveBlending,
    vertexShader: /* glsl */ `
      attribute float phase;
      attribute float size;
      attribute float aAlpha;
      attribute vec3 color;
      uniform float uTime;
      uniform float uPixelRatio;
      varying float vTwinkle;
      varying float vAlpha;
      varying vec3 vColor;

      void main() {
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        vTwinkle = 0.55 + 0.45 * sin(uTime * (0.75 + size * 0.08) + phase);
        vAlpha = aAlpha;
        vColor = color;
        gl_PointSize = size * uPixelRatio * (0.78 + 0.22 * vTwinkle);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uOpacity;
      varying float vTwinkle;
      varying float vAlpha;
      varying vec3 vColor;

      void main() {
        vec2 point = gl_PointCoord - 0.5;
        float distanceToCentre = length(point);
        float core = smoothstep(0.48, 0.02, distanceToCentre);
        float sparkle = smoothstep(0.08, 0.0, abs(point.x)) * smoothstep(0.48, 0.08, abs(point.y));
        sparkle += smoothstep(0.08, 0.0, abs(point.y)) * smoothstep(0.48, 0.08, abs(point.x));
        float alpha = max(core, sparkle * 0.35) * vAlpha * (0.38 + 0.62 * vTwinkle) * uOpacity;
        if (alpha < 0.01) discard;
        gl_FragColor = vec4(vColor, alpha);
      }
    `,
  });

  return new THREE.Points(geometry, material);
}

// ---------- Dawn glow ----------
export function createDawnGlow(size) {
  const geometry = new THREE.PlaneGeometry(size, size);
  const material = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 } },
    transparent: true,
    depthWrite: false,
    depthTest: true,
    blending: THREE.AdditiveBlending,
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      varying vec2 vUv;
      void main() {
        float d = length(vUv - vec2(0.5));
        float pulse = 0.97 + sin(uTime * 0.32) * 0.03;
        float halo = smoothstep(0.5, 0.02, d) * 0.16 * pulse;
        float disc = smoothstep(0.205, 0.19, d) * 0.34;
        vec3 color = mix(vec3(1.0, 0.45, 0.23), vec3(1.0, 0.82, 0.48), smoothstep(0.5, 0.0, d));
        gl_FragColor = vec4(color, halo + disc);
      }
    `,
  });
  const glow = new THREE.Mesh(geometry, material);
  glow.position.z = -12;
  return glow;
}

// ---------- Layered hills ----------
function createHillBand(width, options) {
  const random = randomSource(options.seed);
  const steps = Math.max(18, Math.ceil(width / 75));
  const positions = [];
  const indices = [];
  const bottom = -180;
  let slowPhase = random() * Math.PI * 2;
  let fastPhase = random() * Math.PI * 2;

  for (let i = 0; i <= steps; i++) {
    const ratio = i / steps;
    const x = -width / 2 + ratio * width;
    const broad = Math.sin(ratio * Math.PI * options.frequency + slowPhase);
    const detail = Math.sin(ratio * Math.PI * (options.frequency * 2.35) + fastPhase);
    const top = options.height + broad * options.amplitude + detail * options.amplitude * 0.22;
    positions.push(x, top, 0, x, bottom, 0);

    if (i < steps) {
      const index = i * 2;
      indices.push(index, index + 1, index + 2, index + 2, index + 1, index + 3);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  const material = new THREE.MeshBasicMaterial({
    color: options.color,
    transparent: true,
    opacity: options.opacity,
    depthWrite: true,
  });
  const band = new THREE.Mesh(geometry, material);
  band.position.z = options.z;
  return band;
}

export function createHills(width) {
  const group = new THREE.Group();
  group.add(createHillBand(width, {
    seed: 1281,
    height: 28,
    amplitude: 24,
    frequency: 3.2,
    color: 0x345c57,
    opacity: 0.72,
    z: -10,
  }));
  group.add(createHillBand(width, {
    seed: 4912,
    height: 10,
    amplitude: 18,
    frequency: 4.6,
    color: 0x244c37,
    opacity: 0.92,
    z: -8,
  }));
  return group;
}

// ---------- Ground ----------
export function createGround(width, height) {
  const geometry = new THREE.PlaneGeometry(width, height);
  geometry.translate(0, -height / 2, 0);
  const material = new THREE.ShaderMaterial({
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      varying vec2 vUv;
      float hash(vec2 point) {
        return fract(sin(dot(point, vec2(127.1, 311.7))) * 43758.5453);
      }
      void main() {
        vec3 low = vec3(0.045, 0.15, 0.075);
        vec3 high = vec3(0.12, 0.31, 0.14);
        float gradient = smoothstep(0.0, 1.0, vUv.y);
        float grain = (hash(floor(gl_FragCoord.xy * 0.34)) - 0.5) * 0.018;
        gl_FragColor = vec4(mix(low, high, gradient) + grain, 1.0);
      }
    `,
  });
  const ground = new THREE.Mesh(geometry, material);
  ground.position.z = -6;
  return ground;
}

// ---------- Grass ----------
function createBladeGeometry() {
  const rows = 6;
  const positions = [];
  const uvs = [];
  const indices = [];

  for (let row = 0; row < rows; row++) {
    const ratio = row / (rows - 1);
    const halfWidth = 2.65 * Math.pow(1 - ratio, 0.72) + 0.06;
    const curve = Math.pow(ratio, 1.65) * 2.7;
    positions.push(curve - halfWidth, ratio * 100, 0, curve + halfWidth, ratio * 100, 0);
    uvs.push(0, ratio, 1, ratio);

    if (row < rows - 1) {
      const index = row * 2;
      indices.push(index, index + 1, index + 2, index + 2, index + 1, index + 3);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  return geometry;
}

function createGrassMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uWindStrength: { value: 0.72 },
    },
    side: THREE.DoubleSide,
    vertexShader: /* glsl */ `
      attribute float aPhase;
      attribute float aLean;
      varying float vHeight;
      varying vec3 vColor;
      uniform float uTime;
      uniform float uWindStrength;

      void main() {
        vec3 transformed = position;
        float heightRatio = clamp(position.y / 100.0, 0.0, 1.0);
        float worldX = instanceMatrix[3].x;
        float gust = sin(uTime * 0.82 + aPhase + worldX * 0.011);
        gust += sin(uTime * 1.47 + aPhase * 1.73 - worldX * 0.006) * 0.32;
        transformed.x += (aLean + gust * uWindStrength) * pow(heightRatio, 1.65) * 12.0;
        transformed.z += gust * pow(heightRatio, 2.0) * 1.6;

        vec4 instancePosition = instanceMatrix * vec4(transformed, 1.0);
        gl_Position = projectionMatrix * modelViewMatrix * instancePosition;
        vHeight = heightRatio;
        #ifdef USE_INSTANCING_COLOR
          vColor = instanceColor;
        #else
          vColor = vec3(0.2, 0.55, 0.22);
        #endif
      }
    `,
    fragmentShader: /* glsl */ `
      varying float vHeight;
      varying vec3 vColor;
      void main() {
        vec3 base = vColor * 0.76;
        vec3 tip = vColor * 1.12 + vec3(0.02, 0.04, 0.0);
        vec3 color = mix(base, tip, smoothstep(0.0, 1.0, vHeight));
        gl_FragColor = vec4(color, 1.0);
      }
    `,
  });
}

export function createGrass(count, area) {
  const random = randomSource(area.seed ?? 9217);
  const geometry = createBladeGeometry();
  const phases = new Float32Array(count);
  const leans = new Float32Array(count);
  geometry.setAttribute("aPhase", new THREE.InstancedBufferAttribute(phases, 1));
  geometry.setAttribute("aLean", new THREE.InstancedBufferAttribute(leans, 1));

  const material = createGrassMaterial();
  const mesh = new THREE.InstancedMesh(geometry, material, count);
  const dummy = new THREE.Object3D();
  const palette = area.palette ?? [0x245e2d, 0x4f9a45];

  for (let i = 0; i < count; i++) {
    const depth = random();
    const heightVariation = Math.pow(random(), 0.62);
    const height = THREE.MathUtils.lerp(area.minHeight ?? 34, area.maxHeight ?? 126, heightVariation) * (1 - depth * 0.26);
    const width = THREE.MathUtils.lerp(0.62, 1.38, random()) * (1 - depth * 0.16);
    const x = (random() - 0.5) * area.width;
    const z = THREE.MathUtils.lerp(area.zNear ?? 4.5, area.zFar ?? -4.5, depth);
    const color = colorFromPalette(palette, random() * 0.75 + (1 - depth) * 0.18);

    dummy.position.set(x, 0, z);
    dummy.rotation.set(0, (random() - 0.5) * 0.7, (random() - 0.5) * 0.1);
    dummy.scale.set(width, height / 100, 1);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
    mesh.setColorAt(i, color);
    phases[i] = random() * Math.PI * 2;
    leans[i] = (random() - 0.5) * 0.9;
  }

  mesh.instanceMatrix.needsUpdate = true;
  mesh.instanceColor.needsUpdate = true;
  mesh.frustumCulled = false;
  return { mesh, material };
}

// ---------- Trees ----------
function cylinderBetween(start, end, bottomRadius, topRadius, material) {
  const direction = new THREE.Vector3().subVectors(end, start);
  const length = direction.length();
  const geometry = new THREE.CylinderGeometry(topRadius, bottomRadius, length, 7, 1, false);
  const branch = new THREE.Mesh(geometry, material);
  branch.position.copy(start).add(end).multiplyScalar(0.5);
  branch.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
  return branch;
}

export function createTree(scale, options = {}) {
  const random = randomSource(options.seed ?? 3407);
  const group = new THREE.Group();
  const trunkMaterial = new THREE.MeshStandardMaterial({
    color: options.distant ? 0x493b2d : 0x714727,
    roughness: 0.94,
    flatShading: true,
  });
  const branchMaterial = trunkMaterial.clone();
  branchMaterial.color.offsetHSL(0, -0.03, 0.06);

  const base = new THREE.Vector3(0, 0, 0);
  const trunkTop = new THREE.Vector3(0.04, 2.82, 0);
  group.add(cylinderBetween(base, trunkTop, 0.22, 0.09, trunkMaterial));

  const branches = [
    [new THREE.Vector3(0, 1.05, 0), new THREE.Vector3(-0.82, 2.45, 0.06), 0.12, 0.045],
    [new THREE.Vector3(0.02, 1.25, 0), new THREE.Vector3(0.84, 2.35, -0.06), 0.13, 0.05],
    [new THREE.Vector3(0.02, 1.75, 0), new THREE.Vector3(-0.42, 3.02, -0.03), 0.095, 0.035],
    [new THREE.Vector3(0.03, 1.9, 0), new THREE.Vector3(0.48, 3.08, 0.04), 0.09, 0.03],
  ];
  branches.forEach(([start, end, bottomRadius, topRadius]) => {
    group.add(cylinderBetween(start, end, bottomRadius, topRadius, branchMaterial));
  });

  const leafColors = options.distant
    ? [0x294b32, 0x31593a, 0x386442]
    : [0x357541, 0x428849, 0x56a153, 0x6bad59];
  const leafMaterials = leafColors.map((color) => new THREE.MeshStandardMaterial({
    color,
    roughness: 0.86,
    flatShading: true,
  }));
  const canopy = new THREE.Group();
  const clusters = [
    [-0.85, 2.58, 0.06, 0.72],
    [-0.45, 3.08, -0.04, 0.82],
    [0.02, 2.62, 0.04, 0.92],
    [0.55, 3.02, -0.05, 0.8],
    [0.9, 2.54, 0.02, 0.68],
    [0.08, 3.56, 0.02, 0.78],
    [-0.78, 3.18, -0.02, 0.58],
    [0.74, 3.46, 0.03, 0.57],
  ];

  clusters.forEach(([x, y, z, radius], index) => {
    const geometry = new THREE.IcosahedronGeometry(radius * (0.9 + random() * 0.16), index % 3 === 0 ? 1 : 0);
    const leaves = new THREE.Mesh(geometry, leafMaterials[index % leafMaterials.length]);
    leaves.position.set(x + (random() - 0.5) * 0.12, y + (random() - 0.5) * 0.1, z + (random() - 0.5) * 0.12);
    leaves.rotation.set(random() * 0.45, random() * Math.PI, random() * 0.35);
    leaves.scale.set(1 + random() * 0.16, 0.9 + random() * 0.2, 0.88 + random() * 0.2);
    canopy.add(leaves);
  });
  group.add(canopy);

  const shadowMaterial = new THREE.MeshBasicMaterial({
    color: 0x07150b,
    transparent: true,
    opacity: options.distant ? 0.16 : 0.3,
    depthWrite: false,
  });
  const shadow = new THREE.Mesh(new THREE.CircleGeometry(1, 28), shadowMaterial);
  shadow.scale.set(1.35, 0.16, 1);
  shadow.position.set(0.06, 0.025, options.distant ? 0.02 : -0.03);
  group.add(shadow);

  group.scale.setScalar(scale);
  group.position.z = options.distant ? -5.4 : -1.8;
  group.userData.canopy = canopy;
  group.userData.windPhase = random() * Math.PI * 2;
  group.userData.baseRotation = options.lean ?? 0;
  return group;
}
