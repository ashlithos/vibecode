// Shared helpers for the Data UX intro films. Every function is pure (seeded) so each frame is a function of t.
import { parse as otParse } from '/node_modules/opentype.js/dist/opentype.mjs';

// ---------------------------------------------------------------- timing shared by all seven films
export const FILM = { width: 1920, height: 1080, fps: 30, duration: 7 };
export const RESOLVE = 4.0;           // frame 120: "Data UX" fully formed, the sonic-logo landing note
export const MOTIF = [3.5, 3.75, 4.0]; // root, fifth, ninth (D4, A4, E5)

// ---------------------------------------------------------------- math
export const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const lerp = (a, b, t) => a + (b - a) * t;
export const inv = (a, b, x) => clamp((x - a) / (b - a));
export const smooth = (a, b, x) => { const t = inv(a, b, x); return t * t * (3 - 2 * t); };
export const TAU = Math.PI * 2;

export const bez = (x1, y1, x2, y2) => {      // CSS cubic-bezier(x1,y1,x2,y2) as f(t)
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
  const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  const X = (u) => ((ax * u + bx) * u + cx) * u, Y = (u) => ((ay * u + by) * u + cy) * u;
  const dX = (u) => (3 * ax * u + 2 * bx) * u + cx;
  return (t) => {
    if (t <= 0) return 0; if (t >= 1) return 1;
    let u = t;
    for (let i = 0; i < 8; i++) { const e = X(u) - t, d = dX(u); if (Math.abs(e) < 1e-6 || Math.abs(d) < 1e-6) break; u -= e / d; }
    u = clamp(u);
    return Y(u);
  };
};
export const E = {
  lin: (t) => t,
  in2: (t) => t * t, out2: (t) => 1 - (1 - t) * (1 - t),
  in3: (t) => t * t * t, out3: (t) => 1 - Math.pow(1 - t, 3), out4: (t) => 1 - Math.pow(1 - t, 4),
  io2: (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
  io3: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  outBack: (t, s = 1.7) => 1 + (s + 1) * Math.pow(t - 1, 3) + s * Math.pow(t - 1, 2),
  inBack: (t, s = 1.7) => (s + 1) * t * t * t - s * t * t,
  outElastic: (t) => (t === 0 || t === 1 ? t : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * (TAU / 3)) + 1),
};
// key-framed value: keys [[t, v, ease?]...]; ease belongs to the segment ending at that key
export function K(t, keys) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [t1, v1, e] = keys[i];
    if (t <= t1) {
      const [t0, v0] = keys[i - 1];
      const f = typeof e === 'function' ? e : E[e || 'io2'];
      return lerp(v0, v1, f((t - t0) / (t1 - t0)));
    }
  }
  return keys[keys.length - 1][1];
}
// stepped time: hold motion on an n-fps grid ("on 2s" at 24 fps = step(t, 12))
export const step = (t, fps) => Math.floor(t * fps + 1e-6) / fps;

// ---------------------------------------------------------------- seeded randomness
export function hash(...a) {
  let h = 2166136261 >>> 0;
  for (const v of a) {
    h = Math.imul(h ^ ((Math.round(v * 9973) | 0) >>> 0), 16777619) >>> 0;
    h ^= h >>> 13; h = Math.imul(h, 0x5bd1e995) >>> 0; h ^= h >>> 15;
  }
  return (h >>> 0) / 4294967296;
}
export const hr = (a, b, ...s) => a + (b - a) * hash(...s);
export function rng(seed) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
// smooth 1-D value noise in [-1,1]
export function noise1(x, seed = 0) {
  const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f);
  return lerp(hash(i, seed) * 2 - 1, hash(i + 1, seed) * 2 - 1, u);
}
export function noise2(x, y, seed = 0) {
  const i = Math.floor(x), j = Math.floor(y), fx = x - i, fy = y - j;
  const ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy);
  const a = hash(i, j, seed), b = hash(i + 1, j, seed), c = hash(i, j + 1, seed), d = hash(i + 1, j + 1, seed);
  return lerp(lerp(a, b, ux), lerp(c, d, ux), uy) * 2 - 1;
}

// ---------------------------------------------------------------- canvas / assets
export function canvas(w = FILM.width, h = FILM.height) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; return c;
}
export function loadImage(src) {
  return new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => rej(new Error('img ' + src)); i.src = src; });
}
export async function loadFont(url) {
  const buf = await (await fetch(url)).arrayBuffer();
  return otParse(buf);
}
export async function cssFont(family, url, weight = 'normal') {
  const f = new FontFace(family, `url(${url})`, { weight });
  await f.load(); document.fonts.add(f); return f;
}

// ---------------------------------------------------------------- paths → polylines
// opentype path → array of closed contours [[x,y]...], flattened adaptively (≤ maxSeg px per segment)
export function contours(path, maxSeg = 4) {
  const out = []; let cur = null, px = 0, py = 0, sx = 0, sy = 0;
  const pushQ = (x1, y1, x, y) => { const n = Math.max(2, Math.ceil(Math.hypot(x - px, y - py) / maxSeg)); for (let i = 1; i <= n; i++) { const u = i / n, a = (1 - u) * (1 - u), b = 2 * u * (1 - u), c = u * u; cur.push([a * px + b * x1 + c * x, a * py + b * y1 + c * y]); } };
  const pushC = (x1, y1, x2, y2, x, y) => { const n = Math.max(2, Math.ceil((Math.hypot(x1 - px, y1 - py) + Math.hypot(x2 - x1, y2 - y1) + Math.hypot(x - x2, y - y2)) / maxSeg)); for (let i = 1; i <= n; i++) { const u = i / n, v = 1 - u; cur.push([v * v * v * px + 3 * v * v * u * x1 + 3 * v * u * u * x2 + u * u * u * x, v * v * v * py + 3 * v * v * u * y1 + 3 * v * u * u * y2 + u * u * u * y]); } };
  for (const c of path.commands) {
    if (c.type === 'M') { if (cur && cur.length > 2) out.push(cur); cur = [[c.x, c.y]]; px = sx = c.x; py = sy = c.y; }
    else if (c.type === 'L') { const n = Math.max(1, Math.ceil(Math.hypot(c.x - px, c.y - py) / maxSeg)); for (let i = 1; i <= n; i++) cur.push([lerp(px, c.x, i / n), lerp(py, c.y, i / n)]); px = c.x; py = c.y; }
    else if (c.type === 'Q') { pushQ(c.x1, c.y1, c.x, c.y); px = c.x; py = c.y; }
    else if (c.type === 'C') { pushC(c.x1, c.y1, c.x2, c.y2, c.x, c.y); px = c.x; py = c.y; }
    else if (c.type === 'Z') { if (cur && cur.length > 2) { const l = cur[cur.length - 1]; if (Math.hypot(l[0] - sx, l[1] - sy) < 0.01) cur.pop(); out.push(cur); } cur = null; }
  }
  if (cur && cur.length > 2) out.push(cur);
  return out;
}
export const area = (p) => { let s = 0; for (let i = 0; i < p.length; i++) { const a = p[i], b = p[(i + 1) % p.length]; s += a[0] * b[1] - b[0] * a[1]; } return s / 2; };
export const bbox = (pts) => { let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (const [x, y] of pts) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); } return { x0, y0, x1, y1, w: x1 - x0, h: y1 - y0, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2 }; };
export function polyLen(p, closed = true) { let L = 0; const n = p.length; for (let i = 0; i < (closed ? n : n - 1); i++) { const a = p[i], b = p[(i + 1) % n]; L += Math.hypot(b[0] - a[0], b[1] - a[1]); } return L; }
// resample a polyline to n points evenly spaced by arc length
export function resample(p, n, closed = true) {
  const pts = closed ? [...p, p[0]] : p; const cum = [0];
  for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const L = cum[cum.length - 1], out = []; let j = 0;
  for (let k = 0; k < n; k++) {
    const d = closed ? (k / n) * L : (k / (n - 1)) * L;
    while (j < cum.length - 2 && cum[j + 1] < d) j++;
    const u = (d - cum[j]) / Math.max(1e-9, cum[j + 1] - cum[j]);
    out.push([lerp(pts[j][0], pts[j + 1][0], u), lerp(pts[j][1], pts[j + 1][1], u)]);
  }
  return out;
}
// point at fraction u (0..1) along an open polyline, plus tangent angle
export function along(p, u, cum) {
  if (!cum) { cum = [0]; for (let i = 1; i < p.length; i++) cum.push(cum[i - 1] + Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1])); }
  const L = cum[cum.length - 1], d = clamp(u) * L;
  let lo = 0, hi = cum.length - 1; while (hi - lo > 1) { const m = (lo + hi) >> 1; if (cum[m] < d) lo = m; else hi = m; }
  const a = p[lo], b = p[hi], k = (d - cum[lo]) / Math.max(1e-9, cum[hi] - cum[lo]);
  return { x: lerp(a[0], b[0], k), y: lerp(a[1], b[1], k), ang: Math.atan2(b[1] - a[1], b[0] - a[0]), i: lo };
}
export function cumLen(p) { const cum = [0]; for (let i = 1; i < p.length; i++) cum.push(cum[i - 1] + Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1])); return cum; }
// rotate the start index of closed polygon q so it best matches p (min sum of squared distance), both length n
export function alignStart(p, q) {
  const n = p.length; let best = 0, bd = Infinity;
  for (let s = 0; s < n; s += Math.max(1, (n / 64) | 0)) { let d = 0; for (let i = 0; i < n; i += 4) { const a = p[i], b = q[(i + s) % n]; d += (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2; } if (d < bd) { bd = d; best = s; } }
  return q.map((_, i) => q[(i + best) % n]);
}
export const tracePoly = (x, p, closed = true) => { x.moveTo(p[0][0], p[0][1]); for (let i = 1; i < p.length; i++) x.lineTo(p[i][0], p[i][1]); if (closed) x.closePath(); };

// grain overlay (seeded texture, offset per frame on a stepped grid)
export function grain(x, img, t, alpha = 0.06, fps = 12, mode = 'overlay') {
  const f = Math.floor(t * fps); const ox = -Math.floor(hash(f, 1) * 900), oy = -Math.floor(hash(f, 2) * 900);
  x.save(); x.globalAlpha = alpha; x.globalCompositeOperation = mode;
  for (let yy = oy; yy < FILM.height; yy += img.height) for (let xx = ox; xx < FILM.width; xx += img.width) x.drawImage(img, xx, yy);
  x.restore();
}
