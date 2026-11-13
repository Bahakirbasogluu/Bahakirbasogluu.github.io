// One particle field that takes the form of whatever the page is talking about:
// a sign-off seal, an agent graph, a stack of documents, engagements in orbit, a body with lesions,
// a lecture hall, a filter, a rising path, a shelf of repositories, initials.
import * as THREE from "three";

const TAU = Math.PI * 2;

function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function onSphere(r, rand) {
  const u = rand() * 2 - 1;
  const a = rand() * TAU;
  const s = Math.sqrt(1 - u * u);
  return [r * s * Math.cos(a), r * s * Math.sin(a), r * u];
}

// ---------------------------------------------------------------- shapes
export const GRAPH_NODES = [
  { p: [-2.25, 0.0, 0.0], r: 0.13 },
  { p: [-1.35, 0.0, 0.1], r: 0.17 },
  { p: [-0.35, 0.82, 0.35], r: 0.2 },
  { p: [-0.55, -0.72, -0.3], r: 0.16 },
  { p: [0.32, -0.86, 0.22], r: 0.2 },
  { p: [1.05, 0.0, 0.0], r: 0.24 },
  { p: [1.85, 0.0, 0.12], r: 0.2, hot: true }, // the human gate
  { p: [2.6, 0.0, 0.0], r: 0.14 },
];
export const GRAPH_EDGES = [
  [0, 1, 0], [1, 2, 0.25], [1, 3, -0.2], [3, 4, -0.15], [2, 5, 0.25], [4, 5, -0.2], [5, 6, 0], [6, 7, 0], [6, 5, 0.75],
]; // prettier-ignore

export function edgePoint(edge, t) {
  const a = GRAPH_NODES[edge[0]].p;
  const b = GRAPH_NODES[edge[1]].p;
  const lift = edge[2];
  const k = 4 * t * (1 - t) * lift;
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t + k, a[2] + (b[2] - a[2]) * t + k * 0.3];
}

function graph(n, rand) {
  const pos = new Float32Array(n * 3);
  const heat = new Float32Array(n);
  const weights = GRAPH_NODES.map((g) => g.r * g.r);
  const total = weights.reduce((a, b) => a + b, 0);
  const onNodes = Math.floor(n * 0.62);
  for (let i = 0; i < n; i++) {
    let p;
    if (i < onNodes) {
      let pick = rand() * total;
      let k = 0;
      while (pick > weights[k]) pick -= weights[k++];
      const node = GRAPH_NODES[k];
      const s = onSphere(node.r * (0.92 + rand() * 0.1), rand);
      p = [node.p[0] + s[0], node.p[1] + s[1], node.p[2] + s[2]];
      heat[i] = node.hot ? 1 : 0;
    } else {
      const e = GRAPH_EDGES[Math.floor(rand() * GRAPH_EDGES.length)];
      p = edgePoint(e, rand());
      const j = onSphere(0.012, rand);
      p = [p[0] + j[0], p[1] + j[1], p[2] + j[2]];
      heat[i] = e[2] > 0.5 ? 0.55 : 0;
    }
    pos.set(p, i * 3);
  }
  return { pos, heat };
}

function documents(n, rand) {
  const pos = new Float32Array(n * 3);
  const heat = new Float32Array(n);
  const W = 1.55;
  const H = 2.1;
  const pages = [
    { z: 0.55, x: 0.28, y: -0.08, rot: -0.1, share: 0.5 },
    { z: 0.0, x: 0.0, y: 0.0, rot: -0.04, share: 0.3 },
    { z: -0.55, x: -0.28, y: 0.08, rot: 0.03, share: 0.2 },
  ];
  const rows = [];
  for (let r = 0; r < 17; r++) rows.push({ y: H / 2 - 0.3 - r * 0.105, len: r === 0 ? 0.42 : 0.35 + rand() * 0.6, hot: r === 15 });
  let i = 0;
  for (const page of pages) {
    const count = page === pages[2] ? n - i : Math.floor(n * page.share);
    for (let k = 0; k < count; k++, i++) {
      let x;
      let y;
      let h = 0;
      const roll = rand();
      if (roll < 0.2) {
        const side = Math.floor(rand() * 4);
        const t = rand();
        x = side < 2 ? (t - 0.5) * W : (side === 2 ? -0.5 : 0.5) * W;
        y = side < 2 ? (side === 0 ? -0.5 : 0.5) * H : (t - 0.5) * H;
      } else if (roll < 0.86) {
        const row = rows[Math.floor(rand() * rows.length)];
        x = -W / 2 + 0.16 + rand() * (W - 0.32) * row.len;
        y = row.y + (rand() - 0.5) * 0.012;
        if (row.hot && page === pages[0]) h = 1;
      } else {
        // a stamp-like block in the corner of each page
        x = W / 2 - 0.42 + rand() * 0.28;
        y = H / 2 - 0.34 + rand() * 0.2;
        if (page === pages[0]) h = 0.7;
      }
      const c = Math.cos(page.rot);
      const s = Math.sin(page.rot);
      pos.set([x * c + page.x, y + page.y, page.z + x * s], i * 3);
      heat[i] = h;
    }
  }
  return { pos, heat };
}

function body(n, rand) {
  const pos = new Float32Array(n * 3);
  const heat = new Float32Array(n);
  // [cx, cy, cz, rx, ry, rz]
  const parts = [
    [0, 1.78, 0, 0.25, 0.3, 0.27], [0, 1.42, 0, 0.1, 0.12, 0.1], [0, 0.82, 0, 0.5, 0.56, 0.28],
    [0, 0.12, 0, 0.43, 0.4, 0.26], [0, -0.34, 0, 0.48, 0.3, 0.27],
    [-0.72, 0.86, 0, 0.12, 0.44, 0.12], [0.72, 0.86, 0, 0.12, 0.44, 0.12],
    [-0.84, 0.08, 0, 0.09, 0.42, 0.09], [0.84, 0.08, 0, 0.09, 0.42, 0.09],
    [-0.24, -1.02, 0, 0.19, 0.52, 0.19], [0.24, -1.02, 0, 0.19, 0.52, 0.19],
    [-0.24, -1.84, 0, 0.12, 0.42, 0.12], [0.24, -1.84, 0, 0.12, 0.42, 0.12],
  ]; // prettier-ignore
  const lesions = [
    [0.18, 1.0, 0.08, 0.15], [-0.22, 0.66, -0.05, 0.1], [0.1, 0.2, 0.1, 0.075], [-0.3, -0.3, 0.05, 0.06],
    [0.34, 0.5, -0.1, 0.045], [-0.12, 1.4, 0.02, 0.035], [0.5, 1.12, 0.0, 0.03], [-0.05, -0.1, -0.12, 0.026],
    [0.26, -0.42, 0.1, 0.022], [-0.4, 0.98, 0.1, 0.02], [0.02, 0.6, 0.16, 0.018],
  ]; // prettier-ignore
  const lesionShare = 0.13;
  const lw = lesions.map((l) => Math.max(l[3] ** 2, 0.0006));
  const lt = lw.reduce((a, b) => a + b, 0);
  const pw = parts.map((p) => p[3] * p[4] + p[4] * p[5] + p[3] * p[5]);
  const pt = pw.reduce((a, b) => a + b, 0);
  for (let i = 0; i < n; i++) {
    if (rand() < lesionShare) {
      let pick = rand() * lt;
      let k = 0;
      while (pick > lw[k]) pick -= lw[k++];
      const l = lesions[k];
      const s = onSphere(l[3] * Math.cbrt(rand()), rand);
      pos.set([l[0] + s[0], l[1] + s[1], l[2] + s[2]], i * 3);
      heat[i] = 1;
    } else {
      let pick = rand() * pt;
      let k = 0;
      while (pick > pw[k]) pick -= pw[k++];
      const p = parts[k];
      const shell = rand() < 0.82 ? 1 : Math.cbrt(rand());
      const s = onSphere(shell, rand);
      pos.set([p[0] + s[0] * p[3], p[1] + s[1] * p[4], p[2] + s[2] * p[5]], i * 3);
    }
  }
  return { pos, heat };
}

function hall(n, rand) {
  // An amphitheatre of a thousand seats, and one person at the front.
  const pos = new Float32Array(n * 3);
  const heat = new Float32Array(n);
  const seats = [];
  for (let row = 0; row < 20; row++) {
    const radius = 1.0 + row * 0.16;
    const count = 22 + row * 3;
    for (let k = 0; k < count; k++) {
      const a = Math.PI * (0.12 + (0.76 * k) / (count - 1));
      seats.push([Math.cos(a) * radius, -0.9 + row * 0.085, -Math.sin(a) * radius + 1.7]);
    }
  }
  const speaker = Math.floor(n * 0.035);
  for (let i = 0; i < n; i++) {
    if (i < speaker) {
      const s = onSphere(0.09 * Math.cbrt(rand()), rand);
      pos.set([s[0], -0.95 + s[1], 1.62 + s[2]], i * 3);
      heat[i] = 1;
    } else {
      const seat = seats[i % seats.length];
      const s = onSphere(0.028 * Math.cbrt(rand()), rand);
      pos.set([seat[0] + s[0], seat[1] + s[1], seat[2] + s[2]], i * 3);
    }
  }
  return { pos, heat };
}

function filter(n, rand) {
  // Many in, few out: a wide mouth narrowing to a single stream.
  const pos = new Float32Array(n * 3);
  const heat = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const through = rand() < 0.16;
    const t = through ? rand() : rand() * 0.52;
    const y = 1.9 - t * 3.8;
    const waist = 0.07 + 1.55 * Math.pow(Math.max(0, 1 - t / 0.56), 1.8);
    const r = t > 0.56 ? 0.05 * Math.sqrt(rand()) : waist * (0.94 + rand() * 0.08);
    const a = rand() * TAU;
    pos.set([Math.cos(a) * r, y, Math.sin(a) * r], i * 3);
    heat[i] = t > 0.56 ? 1 : 0;
  }
  return { pos, heat };
}

function seal(n, rand) {
  // A sign-off stamp: two rims, tick marks between them, and the check.
  const pos = new Float32Array(n * 3);
  const heat = new Float32Array(n);
  const check = [[-0.66, 0.04], [-0.2, -0.46], [0.78, 0.58]];
  const legs = [Math.hypot(0.46, 0.5), Math.hypot(0.98, 1.04)];
  for (let i = 0; i < n; i++) {
    const roll = rand();
    let p;
    if (roll < 0.34) {
      const a = rand() * TAU;
      const r = 1.6 + (rand() - 0.5) * 0.05;
      p = [Math.cos(a) * r, Math.sin(a) * r, (rand() - 0.5) * 0.1];
    } else if (roll < 0.52) {
      const a = (Math.floor(rand() * 72) / 72) * TAU;
      const r = 1.3 + rand() * 0.14;
      p = [Math.cos(a) * r, Math.sin(a) * r, 0];
    } else if (roll < 0.66) {
      const a = rand() * TAU;
      const r = 1.16 + (rand() - 0.5) * 0.025;
      p = [Math.cos(a) * r, Math.sin(a) * r, (rand() - 0.5) * 0.06];
    } else {
      const first = rand() * (legs[0] + legs[1]) < legs[0];
      const a = check[first ? 0 : 1];
      const b = check[first ? 1 : 2];
      const t = rand();
      const j = onSphere(0.085 * Math.sqrt(rand()), rand);
      p = [a[0] + (b[0] - a[0]) * t + j[0], a[1] + (b[1] - a[1]) * t + j[1], 0.16 + j[2]];
      heat[i] = 1;
    }
    pos.set(p, i * 3);
  }
  return { pos, heat };
}

function orbit(n, rand) {
  // Nine engagements around one practice. Each satellite can be lit from the page.
  const pos = new Float32Array(n * 3);
  const heat = new Float32Array(n);
  const group = new Int16Array(n).fill(-1);
  const rings = [
    { r: 1.05, tilt: 1.12, spin: 0.2, at: [0.6, 3.5] },
    { r: 1.7, tilt: 1.2, spin: -0.35, at: [1.4, 3.3, 5.2] },
    { r: 2.35, tilt: 1.08, spin: 0.5, at: [0.2, 1.9, 3.7, 5.3] },
  ];
  const place = (ring, a) => {
    const x = Math.cos(a) * ring.r;
    const y0 = Math.sin(a) * ring.r;
    const y = y0 * Math.cos(ring.tilt);
    const z = y0 * Math.sin(ring.tilt);
    const c = Math.cos(ring.spin);
    const s = Math.sin(ring.spin);
    return [x * c - y * s, x * s + y * c, z];
  };
  const moons = rings.flatMap((ring) => ring.at.map((a) => ({ p: place(ring, a), r: 0.13 + 0.05 * rand() })));
  for (let i = 0; i < n; i++) {
    const roll = rand();
    let p;
    if (roll < 0.2) {
      p = onSphere(0.4 * (rand() < 0.8 ? 1 : Math.cbrt(rand())), rand);
    } else if (roll < 0.52) {
      const ring = rings[Math.floor(rand() * rings.length)];
      p = place(ring, (Math.floor(rand() * 220) / 220) * TAU);
    } else {
      const k = Math.floor(rand() * moons.length);
      const s = onSphere(moons[k].r * (0.9 + rand() * 0.12), rand);
      p = [moons[k].p[0] + s[0], moons[k].p[1] + s[1], moons[k].p[2] + s[2]];
      group[i] = k;
      heat[i] = k === 0 ? 1 : 0;
    }
    pos.set(p, i * 3);
  }
  return { pos, heat, group };
}

function helix(n, rand) {
  // A path that widens as it climbs, with a landing at each role. The top one is now.
  const pos = new Float32Array(n * 3);
  const heat = new Float32Array(n);
  const turns = 3.25;
  const at = (t) => {
    const a = t * turns * TAU;
    const r = 0.5 + 0.55 * t;
    return [Math.cos(a) * r, -2 + 4 * t, Math.sin(a) * r];
  };
  const stops = [0.04, 0.24, 0.44, 0.62, 0.8, 0.98];
  for (let i = 0; i < n; i++) {
    const roll = rand();
    let p;
    if (roll < 0.5) {
      p = at(rand());
      const j = onSphere(0.02, rand);
      p = [p[0] + j[0], p[1] + j[1], p[2] + j[2]];
    } else if (roll < 0.6) {
      p = [(rand() - 0.5) * 0.02, -2 + 4 * rand(), (rand() - 0.5) * 0.02];
    } else {
      const k = Math.floor(rand() * stops.length);
      const c = at(stops[k]);
      const s = onSphere((0.1 + 0.022 * k) * (0.9 + rand() * 0.12), rand);
      p = [c[0] + s[0], c[1] + s[1], c[2] + s[2]];
      heat[i] = k === stops.length - 1 ? 1 : 0;
    }
    pos.set(p, i * 3);
  }
  return { pos, heat };
}

function shelf(n, rand) {
  // Eight repositories as eight boxes, two by four. The one under the pointer lights up.
  const pos = new Float32Array(n * 3);
  const heat = new Float32Array(n);
  const group = new Int16Array(n).fill(-1);
  const size = 0.3;
  const edges = [];
  for (let axis = 0; axis < 3; axis++) for (const u of [-1, 1]) for (const v of [-1, 1]) edges.push([axis, u, v]);
  for (let i = 0; i < n; i++) {
    const k = Math.floor(rand() * 8);
    const cx = ((k % 2) - 0.5) * 0.95;
    const cy = (1.5 - Math.floor(k / 2)) * 0.95;
    let p;
    if (rand() < 0.82) {
      const [axis, u, v] = edges[Math.floor(rand() * edges.length)];
      const t = (rand() * 2 - 1) * size;
      p = axis === 0 ? [t, u * size, v * size] : axis === 1 ? [u * size, t, v * size] : [u * size, v * size, t];
    } else {
      const face = Math.floor(rand() * 3);
      const a = (rand() * 2 - 1) * size;
      const b = (rand() * 2 - 1) * size;
      const side = rand() < 0.5 ? -size : size;
      p = face === 0 ? [side, a, b] : face === 1 ? [a, side, b] : [a, b, side];
    }
    pos.set([cx + p[0], cy + p[1], p[2]], i * 3);
    group[i] = k;
  }
  return { pos, heat, group };
}

function initials(n, rand) {
  const pos = new Float32Array(n * 3);
  const heat = new Float32Array(n);
  const w = 520;
  const h = 300;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d", { willReadFrequently: true });
  g.fillStyle = "#000";
  g.font = '900 250px "Archivo", "Helvetica Neue", Arial, sans-serif';
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText("BK", w / 2, h / 2 + 10);
  const data = g.getImageData(0, 0, w, h).data;
  const cells = [];
  for (let y = 0; y < h; y += 2) for (let x = 0; x < w; x += 2) if (data[(y * w + x) * 4 + 3] > 128) cells.push([x, y]);
  for (let i = 0; i < n; i++) {
    const cell = cells.length ? cells[Math.floor(rand() * cells.length)] : [w / 2, h / 2];
    pos.set([((cell[0] + rand() * 2) / w - 0.5) * 5.2, -((cell[1] + rand() * 2) / h - 0.5) * 3.0, (rand() - 0.5) * 0.22], i * 3);
    heat[i] = cell[0] > w * 0.5 && rand() < 0.08 ? 1 : 0;
  }
  return { pos, heat };
}

// ---------------------------------------------------------------- stage
const VERT = /* glsl */ `
  attribute vec3 aFrom;
  attribute vec3 aTo;
  attribute float aHeatFrom;
  attribute float aHeatTo;
  attribute float aSeed;
  uniform float uMix;
  uniform float uTime;
  uniform float uSize;
  uniform float uStill;
  uniform vec3 uPointer;
  uniform vec3 uPulse;
  uniform float uPulseAge;
  varying float vHeat;
  varying float vFade;
  void main() {
    float t = clamp((uMix - aSeed * 0.4) / 0.6, 0.0, 1.0);
    t = t * t * (3.0 - 2.0 * t);
    vec3 p = mix(aFrom, aTo, t);
    float mid = sin(t * 3.14159265);
    vec3 drift = vec3(sin(aSeed * 91.7 + uTime * 0.7), cos(aSeed * 57.3 + uTime * 0.6), sin(aSeed * 33.1 - uTime * 0.5));
    p += drift * (0.42 * mid + 0.010) * uStill;
    vec2 away = p.xy - uPointer.xy;
    float d = length(away);
    p.xy += normalize(away + 0.0001) * 0.3 * smoothstep(0.8, 0.0, d) * uStill;
    p.z += 0.25 * smoothstep(0.8, 0.0, d) * uStill;
    vec2 out2 = p.xy - uPulse.xy;
    float ring = length(out2) - uPulseAge * 3.4;
    float wave = exp(-ring * ring * 9.0) * exp(-uPulseAge * 1.5) * uStill;
    p.xy += normalize(out2 + 0.0001) * wave * 0.26;
    p.z += wave * 0.3;
    vHeat = mix(aHeatFrom, aHeatTo, t);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * (1.0 + vHeat * 1.25) / -mv.z;
    vFade = smoothstep(11.0, 5.0, -mv.z);
  }
`;
const FRAG = /* glsl */ `
  precision mediump float;
  uniform vec3 uInk;
  uniform vec3 uAccent;
  uniform float uAlpha;
  varying float vHeat;
  varying float vFade;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.32, d);
    if (a < 0.02) discard;
    vec3 c = mix(uInk, uAccent, smoothstep(0.25, 0.8, vHeat));
    gl_FragColor = vec4(c, a * uAlpha * mix(0.55, 1.0, vHeat) * vFade);
  }
`;

export function createStage(canvas, { reduced = false } = {}) {
  const small = Math.min(window.innerWidth, window.innerHeight) < 640;
  const N = small ? 7000 : 15000;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 50);
  camera.position.set(0, 0, 8.6);

  const rand = rng(20261113);
  const builders = [seal, graph, documents, orbit, body, hall, filter, helix, shelf, initials];
  const shapes = builders.map((b) => b(N, rand));
  const GRAPH = 1;
  const INITIALS = builders.length - 1;

  const geometry = new THREE.BufferGeometry();
  const attr = (array, size) => new THREE.BufferAttribute(array, size).setUsage(THREE.DynamicDrawUsage);
  const from = attr(new Float32Array(shapes[0].pos), 3);
  const to = attr(new Float32Array(shapes[1].pos), 3);
  const heatFrom = attr(new Float32Array(shapes[0].heat), 1);
  const heatTo = attr(new Float32Array(shapes[1].heat), 1);
  const seed = new Float32Array(N);
  for (let i = 0; i < N; i++) seed[i] = rand();
  geometry.setAttribute("position", from);
  geometry.setAttribute("aFrom", from);
  geometry.setAttribute("aTo", to);
  geometry.setAttribute("aHeatFrom", heatFrom);
  geometry.setAttribute("aHeatTo", heatTo);
  geometry.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
  geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 20);

  const uniforms = {
    uMix: { value: 0 },
    uTime: { value: 0 },
    uSize: { value: 30 },
    uStill: { value: reduced ? 0 : 1 },
    uAlpha: { value: 0.9 },
    uPointer: { value: new THREE.Vector3(99, 99, 0) },
    uPulse: { value: new THREE.Vector3(0, 0, 0) },
    uPulseAge: { value: 99 },
    uInk: { value: new THREE.Color("#121212") },
    uAccent: { value: new THREE.Color("#d43a1e") },
  };
  const material = new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, uniforms, transparent: true, depthWrite: false });
  const points = new THREE.Points(geometry, material);
  const group = new THREE.Group();
  group.add(points);
  scene.add(group);

  // Packets travelling the graph; they wait at the gate.
  const packets = GRAPH_EDGES.flatMap((edge, e) => (e === 8 ? [] : [0, 0.5].map((offset) => ({ edge, offset }))));
  const packetGeometry = new THREE.BufferGeometry();
  const packetPos = new Float32Array(packets.length * 3);
  packetGeometry.setAttribute("position", new THREE.BufferAttribute(packetPos, 3).setUsage(THREE.DynamicDrawUsage));
  const packetMaterial = new THREE.PointsMaterial({ color: "#d43a1e", size: 0.085, transparent: true, opacity: 0, depthWrite: false, sizeAttenuation: true });
  const packetPoints = new THREE.Points(packetGeometry, packetMaterial);
  group.add(packetPoints);

  // Where the form sits for each section: [x, y, scale, rotY, rotX]
  const poses = {
    wide: [
      [1.95, 0.8, 0.8, -0.35, 0.12], [1.4, 0.0, 0.78, -0.42, 0.1], [-1.9, 0.0, 1.05, 0.55, 0.06], [3.3, 0.2, 0.36, -0.2, 0.5],
      [2.0, 0.0, 0.98, -0.5, 0.0], [-2.0, 0.1, 0.9, 0.25, 0.42], [2.7, 1.0, 0.5, 0.0, 0.3], [3.35, 0.0, 0.6, 0.3, 0.08],
      [3.3, 0.0, 0.6, -0.5, 0.2], [0.0, 1.0, 0.9, 0.0, 0.0],
    ],
    tall: [
      [0.0, 1.45, 0.52, -0.2, 0.1], [0.0, 1.95, 0.46, -0.3, 0.1], [0.0, 2.1, 0.62, 0.4, 0.06], [0.0, 2.05, 0.42, -0.2, 0.5],
      [0.0, 2.0, 0.48, -0.4, 0.0], [0.0, 2.0, 0.5, 0.2, 0.42], [0.0, 2.3, 0.42, 0.0, 0.25], [0.0, 1.85, 0.42, 0.3, 0.08],
      [0.0, 2.05, 0.44, -0.5, 0.2], [0.0, 1.3, 0.46, 0.0, 0.0],
    ],
  }; // prettier-ignore

  let progress = 0;
  let segment = -1;
  let visible = true;
  let tall = false;
  let fit = 1;
  const pointerNdc = new THREE.Vector2(9, 9);
  const tilt = new THREE.Vector2();
  const ray = new THREE.Raycaster();
  const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  const hit = new THREE.Vector3();

  function load(index) {
    const a = shapes[Math.min(index, shapes.length - 1)];
    const b = shapes[Math.min(index + 1, shapes.length - 1)];
    from.array.set(a.pos);
    to.array.set(b.pos);
    heatFrom.array.set(a.heat);
    heatTo.array.set(b.heat);
    from.needsUpdate = to.needsUpdate = heatFrom.needsUpdate = heatTo.needsUpdate = true;
  }

  // On a phone the canvas is not the whole screen but a band in the page (see style): it scrolls
  // with the content, natively, so the form cannot lag behind the text. BAND is that band's share
  // of the small viewport height; it does not change when the address bar slides away.
  const BAND = 0.46;
  let zoom = 1;
  let drawn = "";
  function resize() {
    const w = window.innerWidth;
    tall = w < 900;
    const cw = tall ? canvas.clientWidth || w : w;
    const ch = tall ? canvas.clientHeight || Math.round(window.innerHeight * BAND) : window.innerHeight;
    const vh = tall ? ch / BAND : window.innerHeight;
    if (drawn !== `${cw}x${ch}`) {
      drawn = `${cw}x${ch}`;
      renderer.setSize(cw, ch, false);
      camera.aspect = cw / ch;
      camera.updateProjectionMatrix();
    }
    zoom = tall ? vh / ch : 1;
    fit = tall ? Math.min(1, w / vh / 0.62) : Math.min(1, Math.max(0.55, w / vh / 1.6));
    uniforms.uSize.value = (tall ? 20 : 30) * renderer.getPixelRatio() * (vh / 900);
  }

  const lerp = (a, b, t) => a + (b - a) * t;
  let last = performance.now();
  let clock = 0;
  let gateOpen = 0;
  const pinned = {}; // shape index -> [x, y, scale] in world units, measured from the layout
  const HALF = Math.tan((camera.fov / 2) * (Math.PI / 180)) * camera.position.z;
  const accentColor = new THREE.Color("#d43a1e");
  const okColor = new THREE.Color("#1f6b4a");

  function frame(now) {
    requestAnimationFrame(frame);
    if (!visible) return;
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    clock += dt;

    const index = Math.min(Math.floor(progress), shapes.length - 2);
    if (index !== segment) {
      segment = index;
      load(segment);
    }
    const mix = Math.min(Math.max(progress - segment, 0), 1);
    uniforms.uMix.value = reduced ? Math.round(mix) : mix;
    uniforms.uTime.value = clock;

    const set = tall ? poses.tall : poses.wide;
    const next = Math.min(segment + 1, set.length - 1);
    const place = (i) => {
      const pose = set[i];
      if (tall) return [0, 0, pose[2] * fit * zoom, pose[3], pose[4]];
      const pin = pinned[i];
      return pin ? [pin[0], pin[1], pin[2], pose[3], pose[4]] : [pose[0] * fit, pose[1], pose[2] * fit, pose[3], pose[4]];
    };
    const a = place(segment);
    const b = place(next);
    const e = mix * mix * (3 - 2 * mix);
    tilt.x = lerp(tilt.x, pointerNdc.x > 2 ? 0 : pointerNdc.x, 0.05);
    tilt.y = lerp(tilt.y, pointerNdc.y > 2 ? 0 : pointerNdc.y, 0.05);
    group.position.set(lerp(a[0], b[0], e), lerp(a[1], b[1], e), 0);
    group.scale.setScalar(lerp(a[2], b[2], e));
    const sway = reduced ? 0 : Math.sin(clock * 0.25) * 0.08;
    group.rotation.set(lerp(a[4], b[4], e) - tilt.y * 0.12, lerp(a[3], b[3], e) + tilt.x * 0.22 + sway, 0);

    if (pointerNdc.x < 2) {
      ray.setFromCamera(pointerNdc, camera);
      if (ray.ray.intersectPlane(plane, hit)) {
        group.worldToLocal(hit);
        uniforms.uPointer.value.lerp(hit, 0.25);
      }
    } else {
      uniforms.uPointer.value.set(99, 99, 0);
    }

    uniforms.uPulseAge.value += dt;
    const graphWeight = Math.max(0, 1 - Math.abs(progress - GRAPH) * 3.2);
    packetMaterial.color.copy(gateOpen > 0 ? okColor : accentColor);
    packetMaterial.opacity = graphWeight * 0.95;
    if (graphWeight > 0.01) {
      gateOpen = Math.max(0, gateOpen - dt);
      packets.forEach((packet, i) => {
        let t = (clock * 0.32 + packet.offset) % 1;
        if (packet.edge[1] === 6 && gateOpen <= 0) t = Math.min(t, 0.9); // wait at the gate
        if (packet.edge[0] === 6 && packet.edge[1] === 7 && gateOpen <= 0) t = 0;
        packetPos.set(edgePoint(packet.edge, t), i * 3);
      });
      packetGeometry.attributes.position.needsUpdate = true;
    }
    renderer.render(scene, camera);
  }

  resize();
  window.addEventListener("resize", resize);
  document.addEventListener("visibilitychange", () => {
    visible = !document.hidden;
    last = performance.now();
  });
  window.addEventListener("pointermove", (ev) => {
    if (ev.pointerType === "touch") return;
    pointerNdc.set((ev.clientX / window.innerWidth) * 2 - 1, -(ev.clientY / window.innerHeight) * 2 + 1);
  });
  document.documentElement.addEventListener("pointerleave", () => pointerNdc.set(9, 9));
  requestAnimationFrame(frame);

  function refreshHeat() {
    if (segment < 0) return;
    heatFrom.array.set(shapes[segment].heat);
    heatTo.array.set(shapes[Math.min(segment + 1, shapes.length - 1)].heat);
    heatFrom.needsUpdate = heatTo.needsUpdate = true;
  }

  return {
    setProgress(value) {
      progress = Math.max(0, Math.min(value, shapes.length - 1));
    },
    setTheme(dark) {
      uniforms.uInk.value.set(dark ? "#edeae3" : "#121212");
      uniforms.uAccent.value.set(dark ? "#ff5a3c" : "#d43a1e");
      accentColor.set(dark ? "#ff5a3c" : "#d43a1e");
      okColor.set(dark ? "#58c896" : "#1f6b4a");
      uniforms.uAlpha.value = dark ? 0.82 : 0.9;
    },
    openGate(seconds = 3.2) {
      gateOpen = seconds;
    },
    // Put a form where the layout has room for it: centre and size in pixels, or null to release it.
    pin(shape, box) {
      if (!box) return delete pinned[shape];
      const unit = window.innerHeight / (2 * HALF);
      pinned[shape] = [(box.x - window.innerWidth / 2) / unit, (window.innerHeight / 2 - box.y) / unit, box.size / unit];
    },
    // Light one member of a grouped form (a satellite, a box); -1 clears it.
    focus(shape, member) {
      const target = shapes[shape];
      if (!target?.group) return;
      for (let i = 0; i < N; i++) target.heat[i] = target.group[i] === member ? 1 : 0;
      refreshHeat();
    },
    // A ripple through the form from a point on screen.
    pulse(clientX, clientY) {
      const box = canvas.getBoundingClientRect();
      ray.setFromCamera(new THREE.Vector2(((clientX - box.left) / box.width) * 2 - 1, -((clientY - box.top) / box.height) * 2 + 1), camera);
      if (!ray.ray.intersectPlane(plane, hit)) return;
      group.worldToLocal(hit);
      uniforms.uPulse.value.copy(hit);
      uniforms.uPulseAge.value = 0;
    },
    rebuildInitials() {
      shapes[INITIALS] = initials(N, rng(7));
      segment = -1;
    },
  };
}
