/* Motion Eye — engine: easing math, per-stage animation context, helpers. */
(function (global) {
  'use strict';
  const M = { speed: 1 }; // speed > 1 = slow motion multiplier

  /* ---------- cubic-bezier evaluation (for charts and JS tweens) ---------- */
  function cubicBezier(x1, y1, x2, y2) {
    const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
    const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
    const sx = t => ((ax * t + bx) * t + cx) * t;
    const sy = t => ((ay * t + by) * t + cy) * t;
    const dx = t => (3 * ax * t + 2 * bx) * t + cx;
    return x => {
      if (x <= 0) return 0;
      if (x >= 1) return 1;
      let t = x;
      for (let i = 0; i < 8; i++) {
        const e = sx(t) - x;
        if (Math.abs(e) < 1e-6) return sy(t);
        const d = dx(t);
        if (Math.abs(d) < 1e-6) break;
        t -= e / d;
      }
      let lo = 0, hi = 1; t = x;
      for (let i = 0; i < 40; i++) {
        const v = sx(t);
        if (Math.abs(v - x) < 1e-6) break;
        if (x > v) lo = t; else hi = t;
        t = (lo + hi) / 2;
      }
      return sy(t);
    };
  }

  /* ---------- damped spring -> sampled curve + natural duration ---------- */
  function spring(k, c) {
    const dt = 1 / 1000, every = 1 / 60;
    let x = 0, v = 0, t = 0, next = 0;
    const vals = [];
    while (t < 4) {
      if (t >= next - 1e-9) { vals.push(x); next += every; }
      const a = -k * (x - 1) - c * v;
      v += a * dt; x += v * dt; t += dt;
      if (t > 0.05 && Math.abs(x - 1) < 0.001 && Math.abs(v) < 0.02) break;
    }
    vals.push(1);
    const n = vals.length - 1;
    return {
      fn: p => {
        if (p <= 0) return 0;
        if (p >= 1) return 1;
        const f = p * n, i = Math.floor(f);
        return vals[i] + (vals[i + 1] - vals[i]) * (f - i);
      },
      css: 'linear(' + vals.map(v => +v.toFixed(4)).join(', ') + ')',
      dur: Math.round(n * every * 1000)
    };
  }

  let LINEAR_OK = false;
  try { LINEAR_OK = CSS.supports('animation-timing-function', 'linear(0, 0.5 50%, 1)'); } catch (e) {}

  const DEF = {
    'linear':        { bez: [0, 0, 1, 1], label: 'linear' },
    'ease':          { bez: [.25, .1, .25, 1], label: 'ease（CSS 默认）' },
    'ease-in':       { bez: [.42, 0, 1, 1], label: 'ease-in' },
    'ease-out':      { bez: [0, 0, .58, 1], label: 'ease-out' },
    'ease-in-out':   { bez: [.42, 0, .58, 1], label: 'ease-in-out' },
    'out-quint':     { bez: [.23, 1, .32, 1], label: 'ease-out · 强' },
    'in-quart':      { bez: [.5, 0, .75, 0], label: 'ease-in · 强' },
    'in-out-quart':  { bez: [.77, 0, .175, 1], label: 'ease-in-out · 强' },
    'out-back':      { bez: [.34, 1.56, .64, 1], label: 'ease-out-back · 回弹' },
    'steps-12':      { css: 'steps(12, end)', fn: p => Math.floor(p * 12) / 12, label: 'steps(12)' },
    'spring-smooth': { spring: [170, 26], fallback: [.23, 1, .32, 1], label: 'spring · 无回弹' },
    'spring-snappy': { spring: [380, 26], fallback: [.3, 1.25, .5, 1], label: 'spring · 轻回弹' },
    'spring-bouncy': { spring: [200, 9], fallback: [.34, 1.9, .64, 1], label: 'spring · 大回弹' }
  };
  const cache = {};
  M.EASE_KEYS = Object.keys(DEF);
  M.ease = function (name) {
    if (cache[name]) return cache[name];
    const d = DEF[name] || DEF['ease-out'];
    let out;
    if (d.spring) {
      const s = spring(d.spring[0], d.spring[1]);
      out = { fn: s.fn, dur: s.dur, label: d.label, isSpring: true,
        css: LINEAR_OK ? s.css : 'cubic-bezier(' + d.fallback.join(',') + ')' };
    } else if (d.bez) {
      out = { fn: cubicBezier.apply(null, d.bez), css: 'cubic-bezier(' + d.bez.join(',') + ')', label: d.label, bez: d.bez };
    } else {
      out = { fn: d.fn, css: d.css, label: d.label };
    }
    out.name = name;
    return (cache[name] = out);
  };
  M.easeLabel = name => (DEF[name] ? DEF[name].label : name);

  /* ---------- per-stage context: every timer/animation is owned and killable ---------- */
  const DEAD_ANIM = { finished: Promise.resolve(), cancel() {}, effect: null };
  M.ctx = function () {
    const timers = new Set(), anims = new Set(), frames = new Set(), cleanups = [];
    let dead = false;
    const c = {
      get dead() { return dead; },
      after(ms, fn) {
        if (dead) return 0;
        const id = setTimeout(() => { timers.delete(id); if (!dead) fn(); }, ms * M.speed);
        timers.add(id);
        return id;
      },
      anim(el, kf, o) {
        o = o || {};
        if (dead || !el) return DEAD_ANIM;
        const E = M.ease(o.ease || 'linear');
        const base = E.dur != null ? E.dur : (o.dur != null ? o.dur : 250);
        const a = el.animate(kf, {
          duration: Math.max(0, base * M.speed),
          easing: E.css,
          delay: (o.delay || 0) * M.speed,
          fill: o.fill || 'both',
          iterations: o.iterations || 1,
          direction: o.direction || 'normal'
        });
        a.finished.catch(() => {});
        anims.add(a);
        return a;
      },
      /* JS-driven tween, eased and slow-mo aware */
      tween(o) {
        const E = M.ease(o.ease || 'linear');
        const dur = (E.dur != null ? E.dur : (o.dur != null ? o.dur : 250)) * M.speed;
        const t0 = performance.now() + (o.delay || 0) * M.speed;
        let stopped = false;
        const step = now => {
          if (dead || stopped) return;
          const p = dur <= 0 ? 1 : Math.min(1, Math.max(0, (now - t0) / dur));
          o.update(E.fn(p), p);
          if (p < 1) frames.add(requestAnimationFrame(step));
          else if (o.done) o.done();
        };
        frames.add(requestAnimationFrame(step));
        return { stop() { stopped = true; } };
      },
      on(el, ev, fn, opt) {
        el.addEventListener(ev, fn, opt);
        cleanups.push(() => el.removeEventListener(ev, fn, opt));
      },
      kill() {
        dead = true;
        timers.forEach(clearTimeout);
        frames.forEach(cancelAnimationFrame);
        anims.forEach(a => { try { a.cancel(); } catch (e) {} });
        cleanups.forEach(f => f());
        timers.clear(); frames.clear(); anims.clear();
      }
    };
    return c;
  };

  /* ---------- helpers ---------- */
  M.center = function (root, el) {
    const r = root.getBoundingClientRect(), b = el.getBoundingClientRect();
    return { x: b.left - r.left + b.width / 2, y: b.top - r.top + b.height / 2 };
  };

  /* FLIP: record positions, mutate the DOM, animate each element from old to new spot */
  M.flip = function (ctx, els, mutate, o) {
    const first = new Map();
    els.forEach(el => first.set(el, el.getBoundingClientRect()));
    mutate();
    els.forEach(el => {
      if (!el.isConnected) return;
      const f = first.get(el), l = el.getBoundingClientRect();
      const dx = f.left - l.left, dy = f.top - l.top;
      if (Math.abs(dx) > .5 || Math.abs(dy) > .5) {
        ctx.anim(el, [{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'none' }], Object.assign({ fill: 'none' }, o));
      }
    });
  };

  /* Simulated pointer, so both stages can be "used" identically on autoplay */
  const CURSOR_SVG = '<svg viewBox="0 0 20 24" width="20" height="24" aria-hidden="true"><path d="M2 1.5v18.2l4.6-4.3 3 6.8 3.1-1.4-3-6.6h6.4z" fill="#111" stroke="#fff" stroke-width="1.4" stroke-linejoin="round"/></svg>';
  M.cursor = function (root, ctx) {
    const el = document.createElement('div');
    el.className = 'sim-cursor';
    el.innerHTML = CURSOR_SVG;
    root.appendChild(el);
    let x = root.clientWidth * 0.82, y = root.clientHeight * 0.9;
    const place = () => { el.style.transform = `translate(${x}px, ${y}px)`; };
    place();
    const api = {
      el,
      get x() { return x; }, get y() { return y; },
      set(nx, ny) { x = nx; y = ny; place(); },
      to(target, dur, done, ease) {
        const p = target.nodeType ? M.center(root, target) : target;
        const sx = x, sy = y;
        return ctx.tween({ dur: dur || 450, ease: ease || 'ease-in-out',
          update: k => { x = sx + (p.x - sx) * k; y = sy + (p.y - sy) * k; place(); },
          done });
      },
      down() { el.classList.add('is-down'); },
      up() { el.classList.remove('is-down'); },
      hide() { el.classList.add('is-hidden'); }
    };
    return api;
  };

  global.MotionEngine = M;
})(window);
