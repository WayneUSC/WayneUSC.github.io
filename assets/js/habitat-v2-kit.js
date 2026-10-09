/* Rendering helpers adapted from the supplied Habitat Studio 2.0 (2026-10-07).
 * Public SNAIL-only integration: procedural materials and surface-sampled Gaussians.
 * No source photos, residential data, synthetic sensor streams or app UI.
 * The factory owns its texture/material caches so each canvas can dispose fully. */
export function createRenderKit(THREE) {
const clamp = (n, a, b) => Math.min(b, Math.max(a, n));
const mix = (a, b, t) => a + (b - a) * t;
/* ── Procedural surface textures and PBR materials ──
 * Generated once on canvas; nothing is loaded. Maps are linear multipliers around 0.9–1.0 so the model's
 * documented base colour stays the visual average. Surface detail is decoration, not measured material data. */

/* tileable value noise */
function makeNoise(seed = 7) {
  const P = new Uint8Array(512), perm = Array.from({length: 256}, (_, i) => i);
  let s = seed * 2654435761 >>> 0; const rnd = () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
  for (let i = 255; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [perm[i], perm[j]] = [perm[j], perm[i]]; }
  for (let i = 0; i < 512; i++) P[i] = perm[i & 255];
  const V = new Float32Array(256).map((_, i) => P[i] / 255);
  const lat = (x, y, px, py) => V[P[((x % px) + px) % px + P[((y % py) + py) % py]] & 255];
  const noise = (x, y, px = 256, py = 256) => {
    const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
    const a = lat(xi, yi, px, py), b = lat(xi + 1, yi, px, py), c = lat(xi, yi + 1, px, py), d = lat(xi + 1, yi + 1, px, py);
    return mix(mix(a, b, u), mix(c, d, u), v);
  };
  const fbm = (x, y, px, py, oct = 4) => { let sum = 0, amp = .5, f = 1, norm = 0; for (let o = 0; o < oct; o++) { sum += amp * noise(x * f, y * f, px * f, py * f); norm += amp; amp *= .5; f *= 2; } return sum / norm; };
  return {noise, fbm};
}

const TEX = {};
function canvasTexture(size, painter, {srgb = false, repeat = true} = {}) {
  const cv = document.createElement('canvas'); cv.width = cv.height = size;
  const ctx = cv.getContext('2d'), img = ctx.createImageData(size, size), d = img.data;
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const v = painter(x / size, y / size, x, y), i = (y * size + x) * 4;
    if (Array.isArray(v)) { d[i] = v[0] * 255; d[i + 1] = v[1] * 255; d[i + 2] = v[2] * 255; } else d[i] = d[i + 1] = d[i + 2] = clamp(v, 0, 1) * 255;
    d[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  if (repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 8; t.needsUpdate = true; t.userData.canvas = cv;
  return t;
}
function buildTextures() {
  if (TEX.ready) return TEX;
  const N = makeNoise(11), N2 = makeNoise(29);
  // wood: grain lines along u, ring distortion, fine fibres
  TEX.wood = canvasTexture(512, (u, v) => {
    const d = N.fbm(u * 4, v * 6, 4, 6, 3), rings = Math.sin((v * 22 + d * 3.4) * Math.PI * 2) * .5 + .5;
    const fibre = N2.fbm(u * 96, v * 12, 96, 12, 2);
    return .80 + .12 * Math.pow(rings, 1.7) + .08 * fibre;
  });
  TEX.woodBump = canvasTexture(256, (u, v) => { const d = N.fbm(u * 4, v * 6, 4, 6, 2); return .5 + .5 * Math.sin((v * 22 + d * 3.4) * Math.PI * 2) * .6 + .2 * N2.noise(u * 128, v * 16, 128, 16); });
  // fabric: basket weave with irregular threads
  TEX.weave = canvasTexture(256, (u, v) => {
    const f = 40, cu = Math.floor(u * f), cv = Math.floor(v * f), over = (cu + cv) % 2 === 0;
    const t = over ? Math.sin((u * f % 1) * Math.PI) : Math.sin((v * f % 1) * Math.PI);
    return .55 + .35 * t + .1 * N.noise(u * 64, v * 64, 64, 64);
  });
  TEX.fabric = canvasTexture(256, (u, v) => .9 + .07 * N.fbm(u * 8, v * 8, 8, 8, 3) + .03 * N2.noise(u * 80, v * 80, 80, 80));
  // plaster / concrete: soft mottling + speckles
  TEX.concrete = canvasTexture(512, (u, v) => {
    const m = N.fbm(u * 6, v * 6, 6, 6, 4), sp = N2.noise(u * 220, v * 220, 220, 220);
    return .86 + .1 * m + (sp > .93 ? -.08 : 0) + .03 * sp;
  });
  TEX.plaster = canvasTexture(256, (u, v) => .94 + .05 * N.fbm(u * 5, v * 5, 5, 5, 4));
  // floor tile: 4×4 tiles per texture, grout + per-tile tone
  TEX.tile = canvasTexture(512, (u, v) => {
    const tu = u * 4, tv = v * 4, iu = Math.floor(tu), iv = Math.floor(tv), fu = tu - iu, fv = tv - iv;
    const g = Math.min(fu, 1 - fu, fv, 1 - fv); if (g < .012) return .62;
    const tone = .92 + .06 * N2.noise(iu * 7.3, iv * 5.1, 256, 256);
    return tone + .04 * N.fbm(u * 10, v * 10, 10, 10, 3);
  });
  TEX.carpet = canvasTexture(256, (u, v) => .84 + .14 * N.fbm(u * 32, v * 32, 32, 32, 3) + .04 * N2.noise(u * 128, v * 128, 128, 128));
  TEX.leather = canvasTexture(256, (u, v) => { const a = N.noise(u * 48, v * 48, 48, 48), b = N2.noise(u * 48 + 7, v * 48 + 3, 48, 48); return .7 + .3 * Math.abs(a - b) * 1.6; });
  TEX.brushed = canvasTexture(256, (u, v) => .45 + .35 * N.fbm(u * 2, v * 128, 2, 128, 3));
  TEX.ready = true;
  return TEX;
}
function texRepeat(t, metersPerTile) { const c = t.clone(); c.repeat.set(1 / metersPerTile, 1 / metersPerTile); c.needsUpdate = true; return c; }


function colorOf(spec) {
  const col = new THREE.Color(); let alpha = 1;
  if (Array.isArray(spec)) { col.setRGB(spec[0], spec[1], spec[2], THREE.SRGBColorSpace); alpha = spec[3] ?? 1; } else col.set(spec);
  return {col, alpha};
}
/* Surface family from the documented material name / grain flag. */
function surfaceKind(name, def) {
  const n = name.toLowerCase();
  if (n === 'shadow') return 'shadow';
  if (n === 'light') return 'light';
  if (n === 'display') return 'display';
  if (n === 'screen') return 'screen';
  if (n === 'glass' || n === 'window') return 'glass';
  if (n === 'mirror') return 'mirror';
  if (n === 'tile') return 'tile';
  if (/carpet|^rug$/.test(n)) return 'carpet';
  if (n === 'rugline') return 'fabric';
  if (/leather/.test(n)) return 'leather';
  if (/wood|sample/.test(n) || def.grain === 1) return 'wood';
  if (/curtain|linen|pillow|cushion|duvet|mattress/.test(n)) return 'fabric';
  if (/concrete|slab|livingfloor/.test(n)) return 'concrete';
  if (/metal|steel|brass|pipe/.test(n)) return 'metal';
  if (def.grain === 2) return 'fabric';
  if (/plaster|wall|base|white|paper|cream|ceiling|whiteframe/.test(n)) return 'plaster';
  return 'paint';
}
function makeFieldMaterial(name, def) {
  const T = buildTextures(), kind = surfaceKind(name, def), {col, alpha} = colorOf(def.color);
  const rough = def.roughness, metal = def.metalness;
  let m;
  switch (kind) {
    case 'shadow': m = new THREE.MeshBasicMaterial({visible: false}); break;
    case 'light': m = new THREE.MeshStandardMaterial({color: col, emissive: col, emissiveIntensity: 2.4 * (def.emission || .7), roughness: .4}); break;
    case 'display': m = new THREE.MeshStandardMaterial({color: col, emissive: col, emissiveIntensity: 1.6 * (def.emission || .65), roughness: .25}); break;
    case 'screen': m = new THREE.MeshPhysicalMaterial({color: col, roughness: .12, metalness: .1, clearcoat: 1, clearcoatRoughness: .05, envMapIntensity: 1.2}); break;
    case 'glass': m = new THREE.MeshPhysicalMaterial({color: col, transparent: true, opacity: name === 'window' ? .42 : Math.max(.14, alpha), roughness: .04, metalness: 0, envMapIntensity: 1.6, depthWrite: false, side: THREE.DoubleSide,
      emissive: name === 'window' ? col : new THREE.Color(0), emissiveIntensity: name === 'window' ? .9 * (def.emission || .3) : 0}); break;
    case 'mirror': m = new THREE.MeshStandardMaterial({color: col, roughness: .06, metalness: 1, envMapIntensity: 1.4}); break;
    case 'wood': m = new THREE.MeshPhysicalMaterial({color: col, map: texRepeat(T.wood, .9), bumpMap: texRepeat(T.woodBump, .9), bumpScale: .6, roughness: rough ?? .58, metalness: 0, clearcoat: .22, clearcoatRoughness: .45}); break;
    case 'fabric': m = new THREE.MeshStandardMaterial({color: col, map: texRepeat(T.fabric, .6), bumpMap: texRepeat(T.weave, .05), bumpScale: .9, roughness: rough ?? .96, metalness: 0}); break;
    case 'carpet': m = new THREE.MeshStandardMaterial({color: col, map: texRepeat(T.carpet, .35), bumpMap: texRepeat(T.carpet, .12), bumpScale: 1.2, roughness: .98}); break;
    case 'leather': m = new THREE.MeshPhysicalMaterial({color: col, bumpMap: texRepeat(T.leather, .08), bumpScale: .5, roughness: .48, sheen: .4, sheenRoughness: .6, sheenColor: col.clone().multiplyScalar(1.2), clearcoat: .15, clearcoatRoughness: .5}); break;
    case 'concrete': m = new THREE.MeshStandardMaterial({color: col, map: texRepeat(T.concrete, 2.4), roughness: rough ?? .82, metalness: 0}); break;
    case 'tile': m = new THREE.MeshStandardMaterial({color: col, map: texRepeat(T.tile, 2.4), roughness: .42, metalness: 0, envMapIntensity: .8}); break;
    case 'metal': m = new THREE.MeshStandardMaterial({color: col, roughnessMap: texRepeat(T.brushed, .4), roughness: rough ?? .42, metalness: metal ?? .85, envMapIntensity: 1.1}); break;
    case 'plaster': m = new THREE.MeshStandardMaterial({color: col, map: texRepeat(T.plaster, 1.6), roughness: rough ?? .88, metalness: 0}); break;
    default: m = new THREE.MeshStandardMaterial({color: col, roughness: rough ?? .7, metalness: metal ?? 0});
  }
  if (alpha < .99 && !m.transparent && kind !== 'shadow') { m.transparent = true; m.opacity = alpha; m.depthWrite = false; }
  m.userData.kind = kind; m.userData.name = name;
  if (def.emission && !['light', 'display', 'glass'].includes(kind)) { m.emissive = col.clone(); m.emissiveIntensity = def.emission; }
  return m;
}
const ZONE_PALETTE = {'客厅': '#b89c73', '厨房': '#a3ad9b', '书房': '#a3abba', '卧室': '#80ab9c', '卫浴': '#abc2bf', '会客': '#b58f59', '休息': '#7aa896', '研讨': '#8a9eb8', '工作': '#8aa080', '展示': '#9eaba3', '过渡': '#bfab85', '物性试验': '#c9a46a', '示意': '#9fb4bc', '建筑': '#7e8d93', '观测': '#7e8d93'};
const SHARED_MAT = {};
function clayMaterial() { return SHARED_MAT.clay ||= new THREE.MeshStandardMaterial({color: new THREE.Color().setRGB(.78, .81, .78, THREE.SRGBColorSpace), roughness: .8, metalness: 0}); }
function zoneMaterial(zone) {
  const key = 'zone:' + zone; if (SHARED_MAT[key]) return SHARED_MAT[key];
  return SHARED_MAT[key] = new THREE.MeshStandardMaterial({color: new THREE.Color(ZONE_PALETTE[zone] || '#9fb4bc'), roughness: .72, metalness: 0});
}

/* ── Primitive → mesh builder (render geometry) ──
 * Same primitives, placements and grouping (entity | material | section) as the 1.5.2 snailGeometry(), which is
 * still used verbatim for GLB export. Rendering adds: true quarter-circle edge bevels (small, cosmetic), finer
 * tessellation and metre-scale UVs for the procedural surfaces. Placement maths is unchanged. */
const V3 = {add: (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]], sub: (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], mul: (a, k) => [a[0] * k, a[1] * k, a[2] * k],
  dot: (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2], cross: (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]],
  norm: a => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; }, len: a => Math.hypot(a[0], a[1], a[2])};

class GroupBuffer {
  constructor() { this.p = []; this.n = []; this.uv = []; }
  tri(a, b, c, na, nb, nc, ua, ub, uc) { this.p.push(...a, ...b, ...c); this.n.push(...na, ...nb, ...nc); this.uv.push(...ua, ...ub, ...uc); }
}
/* Coordinates across one face: quarter-circle rim samples (tan spacing) + flat middle. */
function bevelCoords(h, r, steps) {
  if (r <= 1e-5) return [-h, h];
  const out = [], flat = h - r;
  for (let k = steps; k >= 1; k--) out.push(-(flat + r * Math.tan(k / steps * Math.PI / 4)));
  out.push(-flat); out.push(flat);
  for (let k = 1; k <= steps; k++) out.push(flat + r * Math.tan(k / steps * Math.PI / 4));
  return out;
}
function emitPrimitive(pr, buf, opts) {
  const co = Math.cos(pr.ry || 0), si = Math.sin(pr.ry || 0); let basis = null;
  if (pr.kind === 'rod') { const y = V3.norm(V3.sub(pr.b, pr.a)), x = V3.norm(V3.cross(Math.abs(y[1]) > .9 ? [1, 0, 0] : [0, 1, 0], y)), z = V3.cross(x, y); basis = [x, y, z]; }
  const mid = basis ? V3.mul(V3.add(pr.a, pr.b), .5) : (pr.p || [0, 0, 0]);
  const place = (v, normal = false) => {
    let a;
    if (basis) a = [0, 1, 2].map(i => basis[0][i] * v[0] + basis[1][i] * v[1] + basis[2][i] * v[2]);
    else a = [v[0] * co + v[2] * si, v[1], -v[0] * si + v[2] * co];
    return normal ? a : V3.add(a, mid);
  };
  const T = (a, b, c, na, nb, nc, ua, ub, uc) => buf.tri(place(a), place(b), place(c), place(na, true), place(nb, true), place(nc, true), ua, ub, uc);
  if (pr.kind === 'box' || pr.kind === 'roundbox') {
    const half = pr.s.map(x => x / 2), minHalf = Math.min(...half);
    let radius = pr.kind === 'roundbox' ? Math.min(pr.radius || .04, minHalf * .98) : (opts.bevel && minHalf > .004 ? Math.min(.011, minHalf * .32) : 0);
    const steps = radius ? (pr.kind === 'roundbox' ? 3 : 2) : 1;
    for (let axis = 0; axis < 3; axis++) for (const sign of [-1, 1]) {
      let u = (axis + 1) % 3, v = (axis + 2) % 3;
      if (pr.s[v] > pr.s[u]) [u, v] = [v, u]; // grain along the longer side
      const cu = bevelCoords(half[u], radius, steps), cv = bevelCoords(half[v], radius, steps);
      const point = (i, j) => {
        const p = [0, 0, 0]; p[axis] = sign * half[axis]; p[u] = cu[i]; p[v] = cv[j];
        const inner = p.map((x, k) => Math.min(half[k] - radius, Math.max(-half[k] + radius, x)));
        let n = V3.norm(V3.sub(p, inner)); if (!radius) { n = [0, 0, 0]; n[axis] = sign; }
        const pos = radius ? V3.add(inner, V3.mul(n, radius)) : p;
        return {p: pos, n, uv: [p[u] + half[u], p[v] + half[v]]};
      };
      const flip = sign * ((u - axis + 3) % 3 === 1 ? 1 : -1) < 0;
      for (let i = 0; i < cu.length - 1; i++) for (let j = 0; j < cv.length - 1; j++) {
        let a = point(i, j), b = point(i + 1, j), c = point(i + 1, j + 1), d = point(i, j + 1);
        if (flip) [b, d] = [d, b];
        T(a.p, b.p, c.p, a.n, b.n, c.n, a.uv, b.uv, c.uv); T(a.p, c.p, d.p, a.n, c.n, d.n, a.uv, c.uv, d.uv);
      }
    }
  } else if (pr.kind === 'cylinder' || pr.kind === 'rod') {
    const r = pr.kind === 'rod' ? pr.radius : pr.s[0], h = pr.kind === 'rod' ? V3.len(V3.sub(pr.b, pr.a)) : pr.s[1];
    const count = pr.kind === 'rod' ? (pr.m === 'rugLine' ? 6 : r > .03 ? 18 : 10) : 36;
    for (let j = 0; j < count; j++) {
      const a = j * Math.PI * 2 / count, b = (j + 1) * Math.PI * 2 / count, n1 = [Math.cos(a), 0, Math.sin(a)], n2 = [Math.cos(b), 0, Math.sin(b)];
      const A = [r * n1[0], -h / 2, r * n1[2]], B = [r * n2[0], -h / 2, r * n2[2]], C = [r * n2[0], h / 2, r * n2[2]], D = [r * n1[0], h / 2, r * n1[2]];
      const ua = a * r, ub = b * r;
      T(A, D, C, n1, n1, n2, [ua, 0], [ua, h], [ub, h]); T(A, C, B, n1, n2, n2, [ua, 0], [ub, h], [ub, 0]);
      T([0, h / 2, 0], C, D, [0, 1, 0], [0, 1, 0], [0, 1, 0], [r, r], [C[0] + r, C[2] + r], [D[0] + r, D[2] + r]);
      T([0, -h / 2, 0], A, B, [0, -1, 0], [0, -1, 0], [0, -1, 0], [r, r], [A[0] + r, A[2] + r], [B[0] + r, B[2] + r]);
    }
  } else if (pr.kind === 'ellipsoid') {
    const [rx, ry, rz] = pr.s, lat = 16, lon = 28, avg = (rx + rz) / 2;
    const pt = (i, j) => { const a = i / lat * Math.PI, b = j / lon * Math.PI * 2; return [rx * Math.sin(a) * Math.cos(b), ry * Math.cos(a), rz * Math.sin(a) * Math.sin(b)]; };
    const nrm = p => V3.norm([p[0] / rx ** 2, p[1] / ry ** 2, p[2] / rz ** 2]);
    const uv = (i, j) => [j / lon * Math.PI * 2 * avg, i / lat * Math.PI * ry];
    for (let i = 0; i < lat; i++) for (let j = 0; j < lon; j++) {
      const a = pt(i, j), b = pt(i + 1, j), c = pt(i + 1, j + 1), d = pt(i, j + 1);
      // wound counter-clockwise from outside (1.5.2 drew both sides, so its order did not matter)
      T(a, c, b, nrm(a), nrm(c), nrm(b), uv(i, j), uv(i + 1, j + 1), uv(i + 1, j)); T(a, d, c, nrm(a), nrm(d), nrm(c), uv(i, j), uv(i, j + 1), uv(i + 1, j + 1));
    }
  }
}
/* Build per-group BufferGeometries. Returns groups with world-space geometry + per-entity bounds. */
function buildFieldGeometry(model, opts = {bevel: true}) {
  const map = new Map();
  for (const pr of model.primitives) {
    const key = [pr.entity, pr.m, pr.section || ''].join('|');
    if (!map.has(key)) map.set(key, {key, entity: pr.entity, material: pr.m, section: pr.section || '', buf: new GroupBuffer(), prims: 0});
    const g = map.get(key); emitPrimitive(pr, g.buf, opts); g.prims++;
  }
  const groups = [], entityBounds = {}, all = new THREE.Box3();
  let triangles = 0;
  for (const g of map.values()) {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(g.buf.p, 3));
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(g.buf.n, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(g.buf.uv, 2));
    geo.computeBoundingBox(); geo.computeBoundingSphere();
    g.geometry = geo; g.count = g.buf.p.length / 3; triangles += g.count / 3; delete g.buf;
    if (model.materials[g.material]?.color && surfaceKind(g.material, model.materials[g.material]) !== 'shadow') {
      const b = geo.boundingBox; if (!entityBounds[g.entity]) entityBounds[g.entity] = b.clone(); else entityBounds[g.entity].union(b);
      if (g.entity !== 'envelope' || !g.section || g.section === 'architecture_lower') all.union(b);
    }
    groups.push(g);
  }
  return {groups, entityBounds, bounds: all, triangles: Math.round(triangles)};
}

/* ── 3D Gaussian Splatting ──
 * Renderer: per-splat 3D covariance projected with the EWA Jacobian, back-to-front over-compositing, depth order
 * from a counting sort in a worker. Data: 2 × RGBA32UI texels per splat (centre f32×3 + rgba8, covariance half×6
 * + group/shade word).
 * Sources: (a) GENERATED — sampled from the same photo-assisted parametric model (labelled as such: not a capture);
 *          (b) IMPORTED — standard INRIA .ply / antimatter15 .splat / plain point-cloud .ply, read locally. */
const SH_C0 = 0.28209479177387814, COV_SCALE = 100;

class SplatData {
  constructor(n) {
    this.count = n; this.pos = new Float32Array(n * 3); this.cov = new Float32Array(n * 6);
    this.rgba = new Uint8Array(n * 4); this.group = new Uint16Array(n); this.shade = new Uint8Array(n).fill(255);
  }
  setCovFromBasis(i, a, b, c, sa, sb, sc) { // Σ = sa² aaᵀ + sb² bbᵀ + sc² ccᵀ
    const o = i * 6, A = sa * sa, B = sb * sb, C = sc * sc;
    this.cov[o] = A * a[0] * a[0] + B * b[0] * b[0] + C * c[0] * c[0];
    this.cov[o + 1] = A * a[0] * a[1] + B * b[0] * b[1] + C * c[0] * c[1];
    this.cov[o + 2] = A * a[0] * a[2] + B * b[0] * b[2] + C * c[0] * c[2];
    this.cov[o + 3] = A * a[1] * a[1] + B * b[1] * b[1] + C * c[1] * c[1];
    this.cov[o + 4] = A * a[1] * a[2] + B * b[1] * b[2] + C * c[1] * c[2];
    this.cov[o + 5] = A * a[2] * a[2] + B * b[2] * b[2] + C * c[2] * c[2];
  }
  setCovFromQuat(i, s0, s1, s2, w, x, y, z) {
    const l = Math.hypot(w, x, y, z) || 1; w /= l; x /= l; y /= l; z /= l;
    const R = [[1 - 2 * (y * y + z * z), 2 * (x * y - w * z), 2 * (x * z + w * y)], [2 * (x * y + w * z), 1 - 2 * (x * x + z * z), 2 * (y * z - w * x)], [2 * (x * z - w * y), 2 * (y * z + w * x), 1 - 2 * (x * x + y * y)]];
    this.setCovFromBasis(i, [R[0][0], R[1][0], R[2][0]], [R[0][1], R[1][1], R[2][1]], [R[0][2], R[1][2], R[2][2]], s0, s1, s2);
  }
  bounds() { const b = new THREE.Box3(); const v = new THREE.Vector3(); for (let i = 0; i < this.count; i++) b.expandByPoint(v.fromArray(this.pos, i * 3)); return b; }
  /* robust floor estimate for "fit to ground": 2nd percentile of y */
  lowY() { const ys = []; const step = Math.max(1, Math.floor(this.count / 20000)); for (let i = 0; i < this.count; i += step) ys.push(this.pos[i * 3 + 1]); ys.sort((a, b) => a - b); return ys[Math.floor(ys.length * .02)] ?? 0; }
}

/* ── generation from the parametric model ── */
function linToSRGB8(v) { v = clamp(v, 0, 1); return Math.round((v <= .0031308 ? v * 12.92 : 1.055 * Math.pow(v, 1 / 2.4) - .055) * 255); }
function mulberry(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function textureSampler(tex) {
  const cv = tex?.userData?.canvas || tex?.source?.data; if (!cv || !cv.getContext) return null;
  const S = cv.width, data = cv.getContext('2d').getImageData(0, 0, S, S).data, rep = tex.repeat;
  return (u, v) => { const x = ((Math.floor(u * rep.x * S) % S) + S) % S, y = ((Math.floor(v * rep.y * S) % S) + S) % S; return data[(y * S + x) * 4] / 255; };
}
/* groups: [{geometry, material, groupIndex, weight}]; returns SplatData. Lighting is baked from one key light + sky. */
async function generateSplats(groups, total, onProgress, cancelled = () => false) {
  const rnd = mulberry(20261007), light = V3.norm([-.45, .85, .32]);
  let area = 0; const tris = [];
  for (const g of groups) {
    const P = g.geometry.attributes.position.array; let ga = 0; const cum = [];
    for (let i = 0; i < P.length; i += 9) {
      const e1 = [P[i + 3] - P[i], P[i + 4] - P[i + 1], P[i + 5] - P[i + 2]], e2 = [P[i + 6] - P[i], P[i + 7] - P[i + 1], P[i + 8] - P[i + 2]];
      ga += V3.len(V3.cross(e1, e2)) / 2; cum.push(ga);
    }
    tris.push({g, cum, area: ga}); area += ga * g.weight;
  }
  const counts = tris.map(t => Math.max(t.area > 1e-5 ? 24 : 0, Math.round(total * t.area * t.g.weight / area)));
  const n = counts.reduce((a, b) => a + b, 0), d = new SplatData(n);
  let k = 0, done = 0;
  for (let ti = 0; ti < tris.length; ti++) {
    if (cancelled()) throw new Error("Gaussian generation cancelled");
    const {g, cum, area: ga} = tris[ti], cnt = counts[ti]; if (!cnt) continue;
    const P = g.geometry.attributes.position.array, N = g.geometry.attributes.normal.array, U = g.geometry.attributes.uv?.array;
    const mat = g.material, kind = mat.userData.kind, base = mat.color; // linear
    const sampler = textureSampler(mat.map), emissive = kind === 'light' || kind === 'display' ? 1.35 : kind === 'glass' ? 1.08 : 1;
    const opacity = kind === 'glass' ? .32 : 1, spacing = Math.sqrt(ga / cnt);
    for (let s = 0; s < cnt; s++) {
      const r = rnd() * ga; let lo = 0, hi = cum.length - 1; while (lo < hi) { const m = (lo + hi) >> 1; if (cum[m] < r) lo = m + 1; else hi = m; }
      const i = lo * 9; let a = rnd(), b = rnd(); if (a + b > 1) { a = 1 - a; b = 1 - b; } const c = 1 - a - b;
      const p = [0, 1, 2].map(j => P[i + j] * c + P[i + 3 + j] * a + P[i + 6 + j] * b);
      const nrm = V3.norm([0, 1, 2].map(j => N[i + j] * c + N[i + 3 + j] * a + N[i + 6 + j] * b));
      let tone = 1;
      if (sampler && U) { const ui = lo * 6, uu = U[ui] * c + U[ui + 2] * a + U[ui + 4] * b, vv = U[ui + 1] * c + U[ui + 3] * a + U[ui + 5] * b; tone = sampler(uu, vv); }
      const shade = clamp(.5 + .42 * Math.max(0, V3.dot(nrm, light)) + .14 * nrm[1] + .05 * (rnd() - .5), .3, 1.12);
      d.pos.set(p, k * 3);
      const jit = 1 + .09 * (rnd() - .5);
      d.rgba[k * 4] = linToSRGB8(base.r * tone * shade * emissive * jit); d.rgba[k * 4 + 1] = linToSRGB8(base.g * tone * shade * emissive * jit); d.rgba[k * 4 + 2] = linToSRGB8(base.b * tone * shade * emissive * jit);
      d.rgba[k * 4 + 3] = opacity * (.82 + .18 * rnd()) * 255; d.shade[k] = clamp(shade / 1.15, 0, 1) * 255; d.group[k] = g.groupIndex;
      const t1 = V3.norm(V3.cross(nrm, Math.abs(nrm[1]) < .9 ? [0, 1, 0] : [1, 0, 0])), t2 = V3.cross(nrm, t1), th = rnd() * Math.PI;
      const ax = V3.add(V3.mul(t1, Math.cos(th)), V3.mul(t2, Math.sin(th))), bx = V3.cross(nrm, ax);
      const sg = Math.min(spacing * 1.05, .085);
      d.setCovFromBasis(k, ax, bx, nrm, sg * (.85 + 1.15 * rnd()), sg * (.55 + .4 * rnd()), Math.max(.0015, sg * .12));
      k++;
    }
    done += cnt; onProgress?.(done / n);
    if (ti % 6 === 5) await new Promise(r => setTimeout(r, 0));
  }
  return d;
}

/* ── depth sort worker (counting sort on 16-bit view depth) ── */
const SORT_WORKER_SRC = `let pos=null,n=0;
onmessage=e=>{const d=e.data;
 if(d.positions){pos=d.positions;n=pos.length/3;return;}
 if(!pos||!d.mv)return;const v=d.mv,depth=new Float32Array(n);let mn=Infinity,mx=-Infinity;
 for(let i=0;i<n;i++){const z=v[2]*pos[3*i]+v[6]*pos[3*i+1]+v[10]*pos[3*i+2]+v[14];depth[i]=z;if(z<mn)mn=z;if(z>mx)mx=z;}
 const B=65536,sc=(B-1)/((mx-mn)||1),cnt=new Uint32Array(B),key=new Uint16Array(n);
 for(let i=0;i<n;i++){const k=((depth[i]-mn)*sc)|0;key[i]=k;cnt[k]++;}
 let s=0;for(let k=0;k<B;k++){const c=cnt[k];cnt[k]=s;s+=c;}
 const order=new Float32Array(n);for(let i=0;i<n;i++)order[cnt[key[i]]++]=i;
 postMessage({order,id:d.id},[order.buffer]);};`;

const SPLAT_VS = `precision highp float; precision highp int; precision highp usampler2D;
uniform usampler2D uData; uniform sampler2D uGroups; uniform int uTexW; uniform vec2 uFocal; uniform vec2 uViewport; uniform float uOrthographic;
uniform float uMode; uniform float uReveal; uniform float uStyle; uniform float uRevealLo; uniform float uRevealHi; uniform float uPointPx; uniform float uGain;
in float splatIndex; out vec4 vColor; out vec2 vPos; out float vRing;
vec3 toLin(vec3 c){return mix(c/12.92,pow((c+.055)/1.055,vec3(2.4)),step(.04045,c));}
void main(){
  int idx=int(splatIndex); ivec2 c0=ivec2((idx*2)%uTexW,(idx*2)/uTexW);
  uvec4 t0=texelFetch(uData,c0,0), t1=texelFetch(uData,ivec2(c0.x+1,c0.y),0);
  uint gi=t1.w&0xffffu; vec4 gs=texelFetch(uGroups,ivec2(int(gi)%256,int(gi)/256),0);
  if(gs.a<.2){gl_Position=vec4(0.,0.,2.,1.);return;}
  vec3 center=vec3(uintBitsToFloat(t0.x),uintBitsToFloat(t0.y),uintBitsToFloat(t0.z));
  float h=fract(sin(float(idx)*12.9898)*43758.5453);
  float edge=mix(uRevealLo,uRevealHi,clamp((center.y-uRevealLo)/max(.001,uRevealHi-uRevealLo),0.,1.))+h*.35;
  float grow=clamp((uReveal*(uRevealHi-uRevealLo+.35)+uRevealLo-edge)/.35,0.,1.);
  if(grow<=0.){gl_Position=vec4(0.,0.,2.,1.);return;}
  vec4 cam=modelViewMatrix*vec4(center,1.); vec4 clip=projectionMatrix*cam; float cw=1.2*clip.w;
  if(cam.z>-.01||clip.x<-cw||clip.x>cw||clip.y<-cw||clip.y>cw){gl_Position=vec4(0.,0.,2.,1.);return;}
  vec4 rgba=vec4(float(t0.w&0xffu),float((t0.w>>8)&0xffu),float((t0.w>>16)&0xffu),float((t0.w>>24)&0xffu))/255.;
  float shade=float((t1.w>>16)&0xffu)/255.*1.15;
  vec3 col=toLin(rgba.rgb)*uGain; if(uStyle>.5)col=toLin(gs.rgb)*shade*uGain; if(gs.a>.9)col=mix(col,vec3(.16,.8,.56),.4);
  vColor=vec4(col,rgba.a*grow); vRing=uMode;
  vec2 ndc=clip.xy/clip.w; float depth=clip.z/clip.w;
  if(uMode>1.5){ vPos=position.xy; gl_Position=vec4(ndc+position.xy*uPointPx*.5*grow/uViewport*2.,depth,1.); return; }
  vec2 u1=unpackHalf2x16(t1.x),u2=unpackHalf2x16(t1.y),u3=unpackHalf2x16(t1.z);
  mat3 S=mat3(u1.x,u1.y,u2.x, u1.y,u2.y,u3.x, u2.x,u3.x,u3.y)/${COV_SCALE.toFixed(1)}*grow*grow;
  mat3 W=mat3(modelViewMatrix); mat3 Sc=W*S*transpose(W);
  float tz=cam.z; mat3 J=uOrthographic>.5
    ? mat3(uFocal.x,0.,0., 0.,uFocal.y,0., 0.,0.,0.)
    : mat3(-uFocal.x/tz,0.,0., 0.,-uFocal.y/tz,0., uFocal.x*cam.x/(tz*tz),uFocal.y*cam.y/(tz*tz),0.);
  mat3 C=J*Sc*transpose(J); float a=C[0][0]+.3, b=C[0][1], d=C[1][1]+.3;
  float mid=(a+d)*.5, rad=length(vec2((a-d)*.5,b)), l1=mid+rad, l2=mid-rad;
  if(l2<=0.){gl_Position=vec4(0.,0.,2.,1.);return;}
  vec2 dv=normalize(vec2(b,l1-a)); if(abs(b)<1e-9) dv=a>=d?vec2(1.,0.):vec2(0.,1.);
  vec2 major=min(sqrt(2.*l1),1024.)*dv, minor=min(sqrt(2.*l2),1024.)*vec2(dv.y,-dv.x);
  vPos=position.xy; gl_Position=vec4(ndc+(position.x*major+position.y*minor)/uViewport*2.,depth,1.);
}`;
const SPLAT_FS = `precision highp float; in vec4 vColor; in vec2 vPos; in float vRing;
void main(){
  float r=dot(vPos,vPos);
  if(vRing>1.5){ if(r>1.)discard; gl_FragColor=vec4(vColor.rgb*1.1,vColor.a); return; }
  if(r>4.)discard;
  if(vRing>.5){ float ring=1.-smoothstep(.0,.18,abs(r-1.)); if(ring<.02)discard; gl_FragColor=vec4(vColor.rgb*1.2,ring*.85*vColor.a); return; }
  float A=exp(-r)*vColor.a; if(A<.004)discard; gl_FragColor=vec4(vColor.rgb,A);
}`;

class SplatMesh {
  constructor(data, groupCount = 1) {
    this.data = data; this.n = data.count; this.mode = 0; this.reveal = 1; this.ready = false;
    const texW = 2048, texH = Math.ceil(this.n * 2 / texW), buf = new Uint32Array(texW * texH * 4), f32 = new Float32Array(1), u32 = new Uint32Array(f32.buffer);
    const half = THREE.DataUtils.toHalfFloat;
    for (let i = 0; i < this.n; i++) {
      const o = i * 8, c = data.cov, k = i * 6;
      for (let j = 0; j < 3; j++) { f32[0] = data.pos[i * 3 + j]; buf[o + j] = u32[0]; }
      buf[o + 3] = data.rgba[i * 4] | data.rgba[i * 4 + 1] << 8 | data.rgba[i * 4 + 2] << 16 | data.rgba[i * 4 + 3] << 24;
      const h = j => half(clamp(c[k + j] * COV_SCALE, -65000, 65000));
      buf[o + 4] = (h(0) | h(1) << 16) >>> 0; buf[o + 5] = (h(2) | h(3) << 16) >>> 0; buf[o + 6] = (h(4) | h(5) << 16) >>> 0;
      buf[o + 7] = (data.group[i] | data.shade[i] << 16) >>> 0;
    }
    const tex = new THREE.DataTexture(buf, texW, texH, THREE.RGBAIntegerFormat, THREE.UnsignedIntType);
    tex.internalFormat = 'RGBA32UI'; tex.needsUpdate = true; this.tex = tex;
    const gh = Math.max(1, Math.ceil(groupCount / 256)); this.groupData = new Uint8Array(256 * gh * 4);
    for (let g = 0; g < groupCount; g++) this.groupData.set([255, 255, 255, 128], g * 4);
    this.groupTex = new THREE.DataTexture(this.groupData, 256, gh, THREE.RGBAFormat, THREE.UnsignedByteType); this.groupTex.needsUpdate = true;
    const geo = new THREE.InstancedBufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([-2, -2, 0, 2, -2, 0, 2, 2, 0, -2, 2, 0]), 3));
    geo.setIndex([0, 1, 2, 0, 2, 3]);
    const order = new Float32Array(this.n); for (let i = 0; i < this.n; i++) order[i] = i;
    this.orderAttr = new THREE.InstancedBufferAttribute(order, 1); this.orderAttr.setUsage(THREE.DynamicDrawUsage);
    geo.setAttribute('splatIndex', this.orderAttr); geo.instanceCount = this.n;
    this.material = new THREE.ShaderMaterial({vertexShader: SPLAT_VS, fragmentShader: SPLAT_FS, transparent: true, depthWrite: false, depthTest: true, side: THREE.DoubleSide,
      blending: THREE.NormalBlending, uniforms: {uData: {value: tex}, uGroups: {value: this.groupTex}, uTexW: {value: texW}, uFocal: {value: new THREE.Vector2(1000, 1000)}, uViewport: {value: new THREE.Vector2(1000, 1000)},
        uMode: {value: 0}, uOrthographic: {value: 0}, uReveal: {value: 1}, uStyle: {value: 0}, uRevealLo: {value: 0}, uRevealHi: {value: 3}, uPointPx: {value: 2.2}, uGain: {value: 1}}});
    this.mesh = new THREE.Mesh(geo, this.material); this.mesh.frustumCulled = false; this.mesh.renderOrder = 2; this.mesh.userData.noAO = true;
    this.mesh.onBeforeRender = (renderer, scene, camera) => this.beforeRender(renderer, camera);
    const workerURL = URL.createObjectURL(new Blob([SORT_WORKER_SRC], {type: 'text/javascript'}));
    try { this.worker = new Worker(workerURL); } finally { URL.revokeObjectURL(workerURL); }
    this.worker.postMessage({positions: data.pos.slice()});
    this.sortId = 0; this.pending = false; this.lastMV = null; this.sorted = false;
    this.worker.onerror = () => { this.pending = false; this.sorted = true; this.onError?.(); };
    this.worker.onmessage = e => { this.pending = false; this.orderAttr.array = e.data.order; this.orderAttr.needsUpdate = true; this.sorted = true; this.onSorted?.(); };
  }
  setGroup(g, rgb, visible, highlight) { this.groupData.set([rgb[0], rgb[1], rgb[2], visible ? (highlight ? 255 : 128) : 0], g * 4); }
  commitGroups() { this.groupTex.needsUpdate = true; }
  beforeRender(renderer, camera) {
    const size = renderer.getDrawingBufferSize(new THREE.Vector2());
    const proj = camera.projectionMatrix.elements;
    this.material.uniforms.uViewport.value.set(size.x, size.y);
    this.material.uniforms.uFocal.value.set(proj[0] * size.x / 2, proj[5] * size.y / 2);
    this.material.uniforms.uOrthographic.value = camera.isOrthographicCamera ? 1 : 0;
    this.material.uniforms.uPointPx.value = 2.4 * renderer.getPixelRatio();
    this.mesh.modelViewMatrix.multiplyMatrices(camera.matrixWorldInverse, this.mesh.matrixWorld);
    const mv = this.mesh.modelViewMatrix.elements;
    if (!this.pending && (!this.lastMV || Math.abs(mv[2] - this.lastMV[2]) + Math.abs(mv[6] - this.lastMV[6]) + Math.abs(mv[10] - this.lastMV[10]) + Math.abs(mv[14] - this.lastMV[14]) * .05 > .002)) {
      this.lastMV = mv.slice(); this.pending = true; this.worker.postMessage({mv: this.lastMV, id: ++this.sortId});
    }
  }
  setMode(m) { this.mode = m; this.material.uniforms.uMode.value = m; }
  dispose() { this.worker.terminate(); this.tex.dispose(); this.groupTex.dispose(); this.mesh.geometry.dispose(); this.material.dispose(); }
}

return {buildFieldGeometry, makeFieldMaterial, generateSplats, SplatMesh,
  disposeCaches() { for (const v of Object.values(TEX)) if (v?.isTexture) v.dispose(); for (const v of Object.values(SHARED_MAT)) v.dispose(); }
};
}
