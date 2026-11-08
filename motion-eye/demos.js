/* Motion Eye — demo renderers.
   Each demo: (root, params, ctx) => { play() }. Root is an empty .demo element.
   Everything time-based goes through ctx so slow-mo and remounting are safe. */
(function (global) {
  'use strict';
  const E = global.MotionEngine;
  const D = {};
  const $ = (r, s) => r.querySelector(s);
  const $$ = (r, s) => Array.from(r.querySelectorAll(s));

  const I = {
    logout: '<svg viewBox="0 0 16 16" class="ic"><path d="M6 3H3.5v10H6M10 5l3 3-3 3M13 8H6.5" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    chev: '<svg viewBox="0 0 16 16" class="ic"><path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    check: '<svg viewBox="0 0 16 16" class="ic"><path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    x: '<svg viewBox="0 0 16 16" class="ic"><path d="M4.5 4.5l7 7M11.5 4.5l-7 7" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>',
    heart: '<svg viewBox="0 0 16 16" class="ic"><path d="M8 13.5S2 10 2 6.2A3 3 0 0 1 8 4.6a3 3 0 0 1 6 1.6C14 10 8 13.5 8 13.5z" fill="currentColor"/></svg>',
    bell: '<svg viewBox="0 0 16 16" class="ic"><path d="M4 11V7a4 4 0 0 1 8 0v4l1 1.2H3zM6.5 13.6a1.6 1.6 0 0 0 3 0" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>',
    search: '<svg viewBox="0 0 16 16" class="ic"><circle cx="7" cy="7" r="4.2" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M10.2 10.2L13.5 13.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>',
    ok: '<svg viewBox="0 0 16 16" class="ic"><circle cx="8" cy="8" r="6.5" fill="currentColor"/><path d="M5 8.2l2 2 4-4.4" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    grip: '<svg viewBox="0 0 16 16" class="ic"><circle cx="6" cy="4" r="1.1" fill="currentColor"/><circle cx="10" cy="4" r="1.1" fill="currentColor"/><circle cx="6" cy="8" r="1.1" fill="currentColor"/><circle cx="10" cy="8" r="1.1" fill="currentColor"/><circle cx="6" cy="12" r="1.1" fill="currentColor"/><circle cx="10" cy="12" r="1.1" fill="currentColor"/></svg>'
  };
  const spin = '<span class="ui-spin" aria-hidden="true"></span>';
  const COINS = [
    { n: 'Ethereum', c: '#627EEA', l: 'Ξ' }, { n: 'Bitcoin', c: '#F7931A', l: '₿' },
    { n: 'Chainlink', c: '#2A5ADA', l: '⬡' }, { n: 'Flare', c: '#E62058', l: 'F' }, { n: 'Near Protocol', c: '#111', l: 'N' }
  ];
  const coin = c => `<span class="coin" style="background:${c.c}">${c.l}</span>`;
  const PEOPLE = [
    ['Ava Lindqvist', 'Commented on Q4 plan', '#8B5CF6'], ['Sam Okafor', 'Invited you to Design', '#10B981'],
    ['Mia Tanaka', 'Approved invoice #1042', '#F59E0B'], ['Leo Martín', 'Shared “Roadmap.pdf”', '#3B82F6'],
    ['Noor Haddad', 'Mentioned you', '#EC4899'], ['Kai Brennan', 'Closed issue #318', '#14B8A6'],
    ['Iris Novak', 'Requested review', '#6366F1'], ['Omar Reyes', 'Uploaded 3 files', '#EF4444'],
    ['Zoe Park', 'Joined the workspace', '#84CC16'], ['Ravi Shah', 'Edited Pricing page', '#F97316'],
    ['Elle Moreau', 'Left a reaction', '#06B6D4'], ['Tom Becker', 'Assigned you a task', '#A855F7'],
    ['Lina Costa', 'Updated status', '#22C55E'], ['Yuki Sato', 'Replied in thread', '#0EA5E9']
  ];
  const avatar = p => `<span class="av" style="background:${p[2]}">${p[0].split(' ').map(s => s[0]).join('')}</span>`;
  const win = (body, extra) => `<div class="win"><div class="win-bar"><i></i><i></i><i></i></div><div class="win-body">${body}</div>${extra || ''}</div>`;
  const skLines = (ws) => `<div class="sk-lines">${(ws || [70, 92, 54, 80]).map(w => `<span style="width:${w}%"></span>`).join('')}</div>`;
  const pulse = (ctx, el) => ctx.anim(el, [{ transform: 'scale(1)' }, { transform: 'scale(.96)' }, { transform: 'scale(1)' }], { dur: 220, ease: 'ease-out', fill: 'none' });

  /* ---------------- Dropdown / select ---------------- */
  D.dropdown = (root, p, ctx) => {
    const crypto = p.variant === 'crypto';
    root.innerHTML = crypto
      ? `<div class="dd dd-crypto"><button class="ui-select dd-trig">${coin(COINS[0])}<span>Ethereum</span>${I.chev}</button>
         <div class="ui-card dd-menu">${COINS.map(c => `<div class="dd-item">${coin(c)}<span>${c.n}</span></div>`).join('')}</div></div>`
      : `<div class="dd dd-account"><div class="ui-card dd-menu">
           <div class="dd-head"><div class="ui-strong">Alex Rivera</div><div class="ui-muted">alex@example.com</div></div>
           <div class="dd-item">Dashboard</div><div class="dd-item">My Integrations</div><div class="dd-item">Billing &amp; Invoices</div>
           <div class="dd-item">Account Settings</div><div class="dd-item dd-split">Log out ${I.logout}</div></div>
         <button class="ui-btn dd-trig">Options</button></div>`;
    const menu = $(root, '.dd-menu'), trig = $(root, '.dd-trig');
    const sign = crypto ? -1 : 1;
    const origins = { trigger: crypto ? 'top center' : 'bottom center', center: 'center center', top: 'top center', bottom: 'bottom center' };
    menu.style.transformOrigin = origins[p.origin || 'trigger'] || p.origin;
    const hidden = { opacity: 0, transform: `translateY(${sign * (p.dist || 0)}px) scale(${p.scale == null ? 1 : p.scale})` };
    const shown = { opacity: 1, transform: 'translateY(0px) scale(1)' };
    let open = false;
    ctx.anim(menu, [hidden, hidden], { dur: 0 });
    const doOpen = () => { open = true; trig.classList.add('is-active'); ctx.anim(menu, [hidden, shown], { dur: p.dur, ease: p.ease }); };
    const doClose = () => { open = false; trig.classList.remove('is-active'); ctx.anim(menu, [shown, hidden], { dur: p.exitDur != null ? p.exitDur : p.dur, ease: p.exitEase || p.ease }); };
    ctx.on(trig, 'click', () => (open ? doClose() : doOpen()));
    return { play() { ctx.after(300, () => { pulse(ctx, trig); doOpen(); if (p.close) ctx.after(1100, doClose); }); } };
  };

  /* ---------------- Tabs: indicator + content ---------------- */
  D.tabs = (root, p, ctx) => {
    const labels = ['Overview', 'Activity', 'Settings'];
    const data = [
      { t: 'Revenue · this month', v: '$48.2k', b: [78, 56, 88] },
      { t: 'Events · last 24h', v: '1,284', b: [92, 40, 66] },
      { t: 'Workspace', v: 'Acme Inc.', b: [58, 84, 36] }
    ];
    const html = i => `<div class="ui-muted">${data[i].t}</div><div class="tb-v">${data[i].v}</div>${data[i].b.map(w => `<span class="tb-bar-line" style="width:${w}%"></span>`).join('')}`;
    root.innerHTML = `<div class="tb"><div class="tb-bar"><span class="tb-ind"></span>${labels.map((l, i) => `<button class="tb-tab${i ? '' : ' is-on'}">${l}</button>`).join('')}</div>
      <div class="ui-card tb-panel"><div class="tb-content">${html(0)}</div></div></div>`;
    const ind = $(root, '.tb-ind'), tabs = $$(root, '.tb-tab'), panel = $(root, '.tb-panel');
    let cur = 0, x = tabs[0].offsetLeft, w = tabs[0].offsetWidth;
    ind.style.width = w + 'px'; ind.style.transform = `translateX(${x}px)`;
    const mode = p.content || 'cut';
    const go = to => {
      if (to === cur) return;
      const from = cur; cur = to;
      tabs.forEach((t, i) => t.classList.toggle('is-on', i === to));
      const nx = tabs[to].offsetLeft, nw = tabs[to].offsetWidth;
      ctx.anim(ind, [{ transform: `translateX(${x}px)`, width: w + 'px' }, { transform: `translateX(${nx}px)`, width: nw + 'px' }],
        { dur: p.ind === 'jump' ? 0 : p.dur, ease: p.ease });
      x = nx; w = nw;
      const old = $(panel, '.tb-content:not(.is-leaving)');
      const neu = document.createElement('div');
      neu.className = 'tb-content'; neu.innerHTML = html(to);
      if (mode === 'cut') { old.replaceWith(neu); return; }
      const dir = p.dir === 'fixed' ? 1 : (to > from ? 1 : -1);
      const d = mode === 'slide' ? (p.cdist || 24) : 0;
      const cd = p.cdur != null ? p.cdur : p.dur;
      old.classList.add('is-leaving');
      panel.appendChild(neu);
      ctx.anim(old, [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: `translateX(${-dir * d * 0.6}px)` }], { dur: cd * 0.6, ease: 'ease-out' })
        .finished.then(() => old.remove(), () => {});
      ctx.anim(neu, [{ opacity: 0, transform: `translateX(${dir * d}px)` }, { opacity: 1, transform: 'none' }], { dur: cd, ease: p.cease || p.ease });
    };
    tabs.forEach((t, i) => ctx.on(t, 'click', () => go(i)));
    return { play() { ctx.after(400, () => go(1)); ctx.after(1500, () => go(2)); ctx.after(2600, () => go(0)); } };
  };

  /* ---------------- Spinner ---------------- */
  D.spinner = (root, p, ctx) => {
    root.innerHTML = `<div class="sp">${Array.from({ length: 12 }, (_, i) =>
      `<i style="transform:rotate(${i * 30}deg) translateY(-1.6em);opacity:${(0.14 + 0.86 * ((i + 1) / 12)).toFixed(2)}"></i>`).join('')}</div>`;
    const sp = $(root, '.sp');
    return { play() { ctx.anim(sp, [{ transform: 'rotate(0deg)' }, { transform: 'rotate(360deg)' }], { dur: p.dur, ease: p.ease, iterations: Infinity }); } };
  };

  /* ---------------- Drawer (side panel) ---------------- */
  D.drawer = (root, p, ctx) => {
    root.innerHTML = win(`${skLines([62, 88, 74, 50, 80])}<button class="ui-btn ui-btn-primary dr-open">Open details</button>`,
      `<div class="scrim"></div><aside class="dr-panel"><div class="ui-strong">Invoice #1042</div><div class="ui-muted">Due Nov 30 · Acme Inc.</div>
       <div class="dr-rows"><div><span>Design retainer</span><b>$4,200</b></div><div><span>Prototype sprint</span><b>$2,800</b></div><div><span>Tax</span><b>$560</b></div></div>
       <button class="ui-btn ui-btn-primary dr-pay">Pay $7,560</button></aside>`);
    const panel = $(root, '.dr-panel'), scrim = $(root, '.scrim'), btn = $(root, '.dr-open');
    const slide = (p.mode || 'slide') === 'slide';
    const hid = slide ? { transform: 'translateX(102%)', opacity: 1 } : { transform: 'scale(.9)', opacity: 0 };
    const vis = slide ? { transform: 'translateX(0)', opacity: 1 } : { transform: 'scale(1)', opacity: 1 };
    if (!slide) panel.style.transformOrigin = 'center';
    ctx.anim(panel, [hid, hid], { dur: 0 }); ctx.anim(scrim, [{ opacity: 0 }, { opacity: 0 }], { dur: 0 });
    let open = false;
    const doOpen = () => { open = true; scrim.style.pointerEvents = 'auto'; ctx.anim(panel, [hid, vis], { dur: p.dur, ease: p.ease }); ctx.anim(scrim, [{ opacity: 0 }, { opacity: 1 }], { dur: p.dur, ease: 'ease-out' }); };
    const doClose = () => {
      open = false; scrim.style.pointerEvents = 'none';
      const d = p.exitDur != null ? p.exitDur : p.dur, e = p.exitEase || p.ease;
      ctx.anim(panel, [vis, hid], { dur: d, ease: e }); ctx.anim(scrim, [{ opacity: 1 }, { opacity: 0 }], { dur: d, ease: 'ease-out' });
    };
    ctx.on(btn, 'click', () => (open ? doClose() : doOpen()));
    ctx.on(scrim, 'click', () => open && doClose());
    return { play() { ctx.after(350, () => { pulse(ctx, btn); doOpen(); if (p.close) ctx.after(1300, doClose); }); } };
  };

  /* ---------------- Modal ---------------- */
  D.modal = (root, p, ctx) => {
    root.innerHTML = win(`${skLines([66, 90, 48])}<button class="ui-btn md-trig">Delete project</button>`,
      `<div class="scrim"></div><div class="md-wrap"><div class="ui-card md-card"><div class="ui-strong">Delete project?</div>
       <div class="ui-muted">This removes all 24 files. You can’t undo this.</div>
       <div class="md-actions"><button class="ui-btn md-cancel">Cancel</button><button class="ui-btn ui-btn-danger">Delete</button></div></div></div>`);
    const card = $(root, '.md-card'), scrim = $(root, '.scrim'), trig = $(root, '.md-trig'), wrap = $(root, '.md-wrap');
    if (p.origin === 'trigger') {
      const c = card.getBoundingClientRect(), t = trig.getBoundingClientRect();
      card.style.transformOrigin = `${t.left + t.width / 2 - c.left}px ${t.top + t.height / 2 - c.top}px`;
    }
    const hid = { opacity: 0, transform: `translateY(${p.dist || 0}px) scale(${p.scale == null ? 1 : p.scale})` };
    const vis = { opacity: 1, transform: 'translateY(0px) scale(1)' };
    ctx.anim(card, [hid, hid], { dur: 0 }); ctx.anim(scrim, [{ opacity: 0 }, { opacity: 0 }], { dur: 0 });
    wrap.style.pointerEvents = 'none';
    const bdur = p.bdur != null ? p.bdur : 200;
    const doOpen = () => {
      wrap.style.pointerEvents = '';
      ctx.anim(scrim, [{ opacity: 0 }, { opacity: 1 }], { dur: bdur, ease: 'ease-out' });
      ctx.anim(card, [hid, vis], { dur: p.dur, ease: p.ease, delay: p.seq === 'sequential' ? bdur : 0 });
    };
    const doClose = () => {
      wrap.style.pointerEvents = 'none';
      ctx.anim(scrim, [{ opacity: 1 }, { opacity: 0 }], { dur: 150, ease: 'ease-out' });
      ctx.anim(card, [vis, { opacity: 0, transform: 'scale(.98)' }], { dur: 150, ease: 'ease-out' });
    };
    ctx.on(trig, 'click', doOpen);
    ctx.on($(root, '.md-cancel'), 'click', doClose);
    ctx.on(wrap, 'click', e => { if (e.target === wrap) doClose(); });
    return { play() { ctx.after(350, () => { pulse(ctx, trig); doOpen(); }); } };
  };

  /* ---------------- Command palette, opened over and over ---------------- */
  D.palette = (root, p, ctx) => {
    root.innerHTML = win(skLines([60, 86, 72, 44, 90, 66]),
      `<div class="pl-wrap"><div class="ui-card pl-card"><div class="pl-input">${I.search}<span class="ui-muted">Type a command…</span></div>
       ${['New issue', 'Go to inbox', 'Assign to me', 'Change status'].map((c, i) => `<div class="pl-item${i ? '' : ' is-on'}">${c}<kbd>${['C', 'G I', 'I', 'S'][i]}</kbd></div>`).join('')}</div></div>
       <div class="keycap">⌘K</div>`);
    const card = $(root, '.pl-card'), key = $(root, '.keycap');
    const hid = { opacity: 0, transform: `scale(${p.scale == null ? 1 : p.scale})` }, vis = { opacity: 1, transform: 'scale(1)' };
    ctx.anim(card, [hid, hid], { dur: 0 });
    let open = false;
    const hit = () => ctx.anim(key, [{ transform: 'scale(1)', opacity: .55 }, { transform: 'scale(.9)', opacity: 1 }, { transform: 'scale(1)', opacity: .55 }], { dur: 200, fill: 'none' });
    const toggle = () => {
      hit(); open = !open;
      if (open) ctx.anim(card, [hid, vis], { dur: p.dur, ease: p.ease });
      else ctx.anim(card, [vis, hid], { dur: Math.round(p.dur * 0.7), ease: 'ease-out' });
    };
    ctx.on(key, 'click', toggle);
    return { play() { [300, 900, 1400, 2000, 2500].forEach(t => ctx.after(t, toggle)); } };
  };

  /* ---------------- Hover: button colour or card lift ---------------- */
  D.hover = (root, p, ctx) => {
    const card = p.variant === 'card';
    root.innerHTML = card
      ? `<div class="hv-grid"><div class="ui-card hv-card hv-t"><span class="hv-thumb" style="--h:220"></span><div class="ui-strong">Brand refresh</div><div class="ui-muted">12 files · edited 2h ago</div></div>
         <div class="ui-card hv-card"><span class="hv-thumb" style="--h:30"></span><div class="ui-strong">Q4 roadmap</div><div class="ui-muted">4 files · edited today</div></div></div>`
      : `<div class="hv-row"><div class="ui-muted hv-label">Download your data</div><button class="ui-btn hv-btn hv-t">Export CSV</button></div>`;
    const t = $(root, '.hv-t');
    const css = E.ease(p.ease || 'ease-out').css;
    const set = on => {
      const d = (p.dur || 0) * E.speed;
      if (card) {
        const lift = p.lift == null ? 2 : p.lift, s = p.shadow == null ? .3 : p.shadow;
        t.style.transition = `transform ${d}ms ${css}, box-shadow ${d}ms ${css}`;
        t.style.transform = on ? `translateY(${-lift}px)` : '';
        t.style.boxShadow = on ? `0 ${2 + lift * 1.4}px ${8 + lift * 2.6}px rgba(16,18,24,${(0.08 + 0.22 * s).toFixed(2)})` : '';
      } else {
        t.style.transition = `background-color ${d}ms ${css}, border-color ${d}ms ${css}, color ${d}ms ${css}`;
        t.classList.toggle('is-hover', on);
      }
    };
    ctx.on(t, 'mouseenter', () => set(true));
    ctx.on(t, 'mouseleave', () => set(false));
    return {
      play() {
        const cur = E.cursor(root, ctx);
        const away = { x: root.clientWidth * 0.78, y: root.clientHeight * 0.86 };
        ctx.after(250, () => cur.to(t, 500, () => {
          set(true);
          ctx.after(900, () => { cur.to(away, 420); set(false);
            ctx.after(700, () => cur.to(t, 420, () => { set(true); ctx.after(900, () => { set(false); cur.to(away, 420, () => cur.hide()); }); }));
          });
        }));
      }
    };
  };

  /* ---------------- Toasts ---------------- */
  D.toast = (root, p, ctx) => {
    root.innerHTML = win(skLines([70, 88, 52, 76]), '<div class="ts-stack"></div>');
    const stack = $(root, '.ts-stack');
    const msgs = [['Changes saved', 'All edits synced'], ['Invite sent', 'to sam@example.com'], ['Export ready', 'report.csv · 2.1 MB']];
    const dir = p.from === 'top' ? -1 : 1;
    const add = i => {
      const el = document.createElement('div');
      el.className = 'ui-card ts';
      el.innerHTML = `<span class="ts-ic">${I.ok}</span><div><div class="ui-strong">${msgs[i][0]}</div><div class="ui-muted">${msgs[i][1]}</div></div>`;
      const old = Array.from(stack.children);
      if (p.stack === 'jump') stack.appendChild(el);
      else E.flip(ctx, old, () => stack.appendChild(el), { dur: p.dur, ease: p.ease });
      ctx.anim(el, [{ opacity: 0, transform: `translateY(${dir * (p.dist || 24)}px) scale(.98)` }, { opacity: 1, transform: 'none' }], { dur: p.dur, ease: p.ease });
    };
    return { play() { ctx.after(300, () => add(0)); ctx.after(1250, () => add(1)); ctx.after(2200, () => add(2)); } };
  };

  /* ---------------- List: stagger in, or clear all ---------------- */
  D.list = (root, p, ctx) => {
    const n = p.count || 6, compact = n > 7, exit = p.phase === 'exit';
    root.innerHTML = `<div class="ui-card ls${compact ? ' is-compact' : ''}"><div class="ls-head"><span class="ui-strong">Notifications</span>${exit ? '<button class="ls-clear">Clear all</button>' : `<span class="ui-muted">${n} new</span>`}</div>
      <div class="ls-body">${PEOPLE.slice(0, n).map(pp => `<div class="ls-row">${avatar(pp)}<div class="ls-txt"><div class="ui-strong">${pp[0]}</div>${compact ? '' : `<div class="ui-muted">${pp[1]}</div>`}</div><span class="ui-muted ls-time">2m</span></div>`).join('')}
      <div class="ls-empty ui-muted">You’re all caught up ✓</div></div></div>`;
    const rows = $$(root, '.ls-row'), empty = $(root, '.ls-empty');
    const hid = { opacity: 0, transform: `translateY(${p.dist || 8}px)` }, vis = { opacity: 1, transform: 'none' };
    ctx.anim(empty, [{ opacity: 0 }, { opacity: 0 }], { dur: 0 });
    if (!exit) rows.forEach(r => ctx.anim(r, [hid, hid], { dur: 0 }));
    const cap = p.cap == null ? 999 : p.cap;
    const enter = () => rows.forEach((r, i) => ctx.anim(r, [hid, vis], { dur: p.dur, ease: p.ease, delay: Math.min(i, cap) * (p.stagger || 0) }));
    const clear = () => {
      const st = p.exitStagger || 0, d = p.exitDur != null ? p.exitDur : p.dur;
      rows.forEach((r, i) => ctx.anim(r, [vis, { opacity: 0, transform: `translateX(${-(p.dist || 16)}px)` }], { dur: d, ease: 'ease-out', delay: i * st }));
      ctx.anim(empty, [{ opacity: 0 }, { opacity: 1 }], { dur: 200, delay: (rows.length - 1) * st + d });
    };
    if (exit) ctx.on($(root, '.ls-clear'), 'click', clear);
    return { play() { if (exit) ctx.after(700, () => { pulse(ctx, $(root, '.ls-clear')); clear(); }); else ctx.after(300, enter); } };
  };

  /* ---------------- Accordion ---------------- */
  D.accordion = (root, p, ctx) => {
    const qa = [
      ['What is a workspace?', 'A workspace holds your projects, members and billing. One person can belong to several workspaces and switch between them.'],
      ['Can I change plans later?', 'Yes. Upgrades apply right away; downgrades start at the next billing cycle.'],
      ['How do I export data?', 'Go to Settings → Data and choose CSV or JSON.']
    ];
    root.innerHTML = `<div class="ui-card ac">${qa.map(q => `<div class="ac-item"><button class="ac-head"><span>${q[0]}</span>${I.chev}</button><div class="ac-panel"><div class="ac-inner">${q[1]}</div></div></div>`).join('')}</div>`;
    const items = $$(root, '.ac-item');
    const overflow = p.content === 'overflow';
    const state = items.map(() => ({ open: false, h: 0 }));
    items.forEach(it => { const pn = $(it, '.ac-panel'); pn.style.height = '0px'; pn.style.overflow = overflow ? 'visible' : 'hidden'; if (overflow) $(it, '.ac-inner').style.opacity = '0'; });
    const toggle = i => {
      const it = items[i], pn = $(it, '.ac-panel'), inner = $(it, '.ac-inner'), chev = $(it, '.ic'), s = state[i];
      s.open = !s.open;
      const h = inner.offsetHeight;
      const from = s.open ? 0 : h, to = s.open ? h : 0;
      ctx.anim(chev, [{ transform: `rotate(${s.open ? 0 : 180}deg)` }, { transform: `rotate(${s.open ? 180 : 0}deg)` }], { dur: p.anim === false ? 0 : p.dur, ease: p.ease });
      ctx.anim(pn, [{ height: from + 'px' }, { height: to + 'px' }], { dur: p.anim === false ? 0 : p.dur, ease: p.ease });
      if (overflow) inner.style.opacity = s.open ? '1' : '0';
      else if (s.open && p.anim !== false && p.content === 'fade') ctx.anim(inner, [{ opacity: 0, transform: 'translateY(-4px)' }, { opacity: 1, transform: 'none' }], { dur: p.dur, ease: 'ease-out', delay: p.dur * 0.35 });
    };
    items.forEach((it, i) => ctx.on($(it, '.ac-head'), 'click', () => toggle(i)));
    return { play() { ctx.after(400, () => toggle(0)); ctx.after(2000, () => toggle(0)); } };
  };

  /* ---------------- Press feedback ---------------- */
  D.press = (root, p, ctx) => {
    root.innerHTML = `<div class="pr"><div class="ui-muted">Profile updated?</div><button class="ui-btn ui-btn-primary pr-btn">Save changes</button></div>`;
    const b = $(root, '.pr-btn');
    const css = E.ease(p.ease || 'out-quint').css;
    const down = () => { b.style.transition = `transform ${(p.dur || 120) * E.speed}ms ${css}`; b.style.transform = `scale(${p.pressScale == null ? 1 : p.pressScale})`; };
    const up = () => { b.style.transition = `transform ${(p.dur || 120) * 1.8 * E.speed}ms ${css}`; b.style.transform = 'scale(1)'; };
    ctx.on(b, 'pointerdown', down); ctx.on(b, 'pointerup', up); ctx.on(b, 'pointerleave', up);
    return {
      play() {
        const cur = E.cursor(root, ctx);
        const click = then => { cur.down(); down(); ctx.after(170, () => { cur.up(); up(); then && then(); }); };
        ctx.after(250, () => cur.to(b, 500, () => ctx.after(150, () => click(() => ctx.after(800, () => click(() => ctx.after(600, () => cur.hide())))))));
      }
    };
  };

  /* ---------------- Loading button ---------------- */
  D.loadbtn = (root, p, ctx) => {
    const stable = p.mode !== 'swap';
    root.innerHTML = `<div class="ui-card lb"><div class="ui-strong">Profile</div><div class="lb-field"><span>Name</span><b>Alex Rivera</b></div><div class="lb-field"><span>Role</span><b>Design lead</b></div>
      <div class="lb-foot"><button class="ui-btn lb-cancel">Cancel</button><button class="ui-btn ui-btn-primary lb-btn${stable ? ' lb-stable' : ''}">${stable
        ? '<span class="lb-l is-on">Save</span><span class="lb-l">' + spin + '</span><span class="lb-l">' + I.check + '</span>'
        : 'Save'}</button></div></div>`;
    const b = $(root, '.lb-btn');
    const layers = $$(root, '.lb-l');
    const show = i => {
      if (!stable) { b.innerHTML = ['Save', spin + ' Saving…', I.check + ' Saved'][i]; return; }
      layers.forEach((l, j) => {
        const on = j === i, was = l.classList.contains('is-on');
        if (on === was) return;
        l.classList.toggle('is-on', on);
        ctx.anim(l, on ? [{ opacity: 0, transform: 'scale(.8)' }, { opacity: 1, transform: 'scale(1)' }] : [{ opacity: 1, transform: 'scale(1)' }, { opacity: 0, transform: 'scale(.8)' }], { dur: p.dur || 160, ease: 'out-quint' });
      });
    };
    const run = () => { pulse(ctx, b); show(1); ctx.after(1100, () => { show(2); ctx.after(1100, () => show(0)); }); };
    ctx.on(b, 'click', run);
    return { play() { ctx.after(450, run); } };
  };

  /* ---------------- Like (optimistic UI) ---------------- */
  D.like = (root, p, ctx) => {
    root.innerHTML = `<div class="ui-card lk"><div class="lk-head">${avatar(['Lena Ortiz', '', '#F43F5E'])}<div><div class="ui-strong">Lena Ortiz</div><div class="ui-muted">Shipped the new onboarding ✨</div></div></div>
      <div class="lk-img"></div><div class="lk-foot"><button class="lk-btn"><span class="lk-heart">${I.heart}</span><span class="lk-n">241</span></button><span class="ui-muted">12 comments</span></div></div>`;
    const btn = $(root, '.lk-btn'), heart = $(root, '.lk-heart'), n = $(root, '.lk-n');
    let liked = false, busy = false;
    const apply = () => {
      liked = !liked; btn.classList.toggle('is-on', liked); n.textContent = liked ? '242' : '241';
      if (liked) ctx.anim(heart, [{ transform: 'scale(1)' }, { transform: 'scale(1.35)' }, { transform: 'scale(1)' }], { dur: 320, ease: 'ease-out', fill: 'none' });
    };
    const click = () => {
      if (busy) return;
      pulse(ctx, btn);
      if (!p.latency) return apply();
      busy = true; btn.classList.add('is-busy');
      ctx.after(p.latency, () => { busy = false; btn.classList.remove('is-busy'); apply(); });
    };
    ctx.on(btn, 'click', click);
    return { play() { ctx.after(500, click); } };
  };

  /* ---------------- Toggle switch ---------------- */
  D.toggle = (root, p, ctx) => {
    const rows = ['Email notifications', 'Weekly digest', 'Product updates'];
    root.innerHTML = `<div class="ui-card tg">${rows.map((r, i) => `<div class="tg-row"><span>${r}</span><button class="sw${i === 1 ? ' is-on' : ''}" aria-label="${r}"><i></i></button></div>`).join('')}</div>`;
    const sws = $$(root, '.sw');
    const css = E.ease(p.ease || 'out-quint');
    const flip = sw => {
      const knob = $(sw, 'i'), on = !sw.classList.contains('is-on');
      const d = p.mode === 'teleport' ? 0 : (css.dur != null ? css.dur : p.dur);
      sw.style.transition = `background-color ${d * E.speed}ms ease-out`;
      sw.classList.toggle('is-on', on);
      const a = on ? 0 : 1.05, b = on ? 1.05 : 0;
      ctx.anim(knob, [{ transform: `translateX(${a}em)` }, { transform: `translateX(${b}em)` }], { dur: p.mode === 'teleport' ? 0 : p.dur, ease: p.ease });
    };
    sws.forEach(sw => {
      ctx.anim($(sw, 'i'), [{ transform: `translateX(${sw.classList.contains('is-on') ? 1.05 : 0}em)` }, { transform: `translateX(${sw.classList.contains('is-on') ? 1.05 : 0}em)` }], { dur: 0 });
      ctx.on(sw, 'click', () => flip(sw));
    });
    return { play() { [400, 1400, 2400].forEach(t => ctx.after(t, () => flip(sws[0]))); } };
  };

  /* ---------------- Checkbox ---------------- */
  D.checkbox = (root, p, ctx) => {
    const tasks = ['Review pull request', 'Reply to Sam', 'Update roadmap'];
    root.innerHTML = `<div class="ui-card cb"><div class="ui-strong">Today</div>${tasks.map(t => `<button class="cb-row"><span class="cb-box"><svg viewBox="0 0 16 16"><path d="M4 8.4l2.6 2.6L12 5.4" pathLength="1"/></svg></span><span class="cb-t">${t}</span></button>`).join('')}</div>`;
    const rows = $$(root, '.cb-row');
    rows.forEach(r => ctx.anim($(r, 'path'), [{ strokeDashoffset: 1 }, { strokeDashoffset: 1 }], { dur: 0 }));
    const check = r => {
      if (r.classList.contains('is-on')) return;
      r.classList.add('is-on');
      const draw = p.draw !== false;
      ctx.anim($(r, '.cb-box'), [{ transform: 'scale(1)' }, { transform: 'scale(.86)' }, { transform: 'scale(1)' }], { dur: draw ? 240 : 0, fill: 'none' });
      ctx.anim($(r, 'path'), [{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { dur: draw ? p.dur : 0, ease: 'out-quint', delay: draw ? 40 : 0 });
    };
    rows.forEach(r => ctx.on(r, 'click', () => check(r)));
    return { play() { rows.forEach((r, i) => ctx.after(450 + i * 600, () => check(r))); } };
  };

  /* ---------------- Error shake ---------------- */
  D.shake = (root, p, ctx) => {
    root.innerHTML = `<div class="ui-card sh"><div class="ui-strong">Sign in</div><div class="sh-f"><label>Email</label><div class="sh-in">alex@example.com</div></div>
      <div class="sh-f"><label>Password</label><div class="sh-in sh-pw">••••••••</div><div class="sh-err">Incorrect password. Try again.</div></div><button class="ui-btn ui-btn-primary sh-btn">Sign in</button></div>`;
    const pw = $(root, '.sh-pw'), err = $(root, '.sh-err'), btn = $(root, '.sh-btn');
    ctx.anim(err, [{ opacity: 0 }, { opacity: 0 }], { dur: 0 });
    const fire = () => {
      pulse(ctx, btn);
      pw.classList.add('is-err');
      const n = Math.max(1, Math.round(p.cycles || 3)) * 2, amp = p.amp || 0;
      const kf = [{ transform: 'translateX(0)' }];
      for (let i = 0; i < n; i++) kf.push({ transform: `translateX(${(i % 2 ? -1 : 1) * amp * (1 - i / n)}px)` });
      kf.push({ transform: 'translateX(0)' });
      ctx.anim(pw, kf, { dur: p.dur, ease: 'linear', fill: 'none' });
      ctx.anim(err, [{ opacity: 0 }, { opacity: 1 }], { dur: 160 });
    };
    ctx.on(btn, 'click', fire);
    return { play() { ctx.after(500, fire); } };
  };

  /* ---------------- Remove item (FLIP) ---------------- */
  D.remove = (root, p, ctx) => {
    root.innerHTML = `<div class="ui-card rm"><div class="ls-head"><span class="ui-strong">Team members</span><span class="ui-muted">5</span></div><div class="rm-body">${PEOPLE.slice(0, 5).map(pp =>
      `<div class="rm-row">${avatar(pp)}<span class="rm-n">${pp[0]}</span><button class="rm-x" aria-label="Remove">${I.x}</button></div>`).join('')}</div></div>`;
    const card = $(root, '.rm'), body = $(root, '.rm-body');
    const remove = row => {
      if (!row || row.classList.contains('is-going')) return;
      row.classList.add('is-going');
      ctx.anim(row, [{ opacity: 1, transform: 'scale(1)' }, { opacity: 0, transform: 'scale(.96)' }], { dur: 140, ease: 'ease-out' }).finished.then(() => {
        if (ctx.dead) return;
        const others = Array.from(body.children).filter(r => r !== row);
        const h0 = card.offsetHeight;
        if (p.flip) {
          E.flip(ctx, others, () => row.remove(), { dur: p.dur, ease: p.ease });
          ctx.anim(card, [{ height: h0 + 'px' }, { height: card.offsetHeight + 'px' }], { dur: p.dur, ease: p.ease, fill: 'none' });
        } else row.remove();
      }, () => {});
    };
    $$(root, '.rm-x').forEach(x => ctx.on(x, 'click', () => remove(x.closest('.rm-row'))));
    return { play() { ctx.after(600, () => remove(body.children[1])); ctx.after(1900, () => remove(body.children[2])); } };
  };

  /* ---------------- Reorder (FLIP) ---------------- */
  D.reorder = (root, p, ctx) => {
    const pages = [['/pricing', 820], ['/blog', 340], ['/docs', 1210], ['/about', 180], ['/changelog', 560]];
    root.innerHTML = `<div class="ui-card ro"><div class="ls-head"><span class="ui-strong">Top pages</span><button class="ro-sort">Sort: A–Z</button></div><div class="ro-body">${pages.map(pg =>
      `<div class="ro-row" data-name="${pg[0]}" data-v="${pg[1]}"><span class="ro-n">${pg[0]}</span><span class="ro-bar"><i style="width:${pg[1] / 12.1}%"></i></span><span class="ro-v">${pg[1].toLocaleString('en-US')}</span></div>`).join('')}</div></div>`;
    const body = $(root, '.ro-body'), btn = $(root, '.ro-sort');
    let byViews = false;
    const sort = () => {
      byViews = !byViews; btn.textContent = byViews ? 'Sort: Views ↓' : 'Sort: A–Z';
      const rows = Array.from(body.children);
      const sorted = rows.slice().sort((a, b) => byViews ? b.dataset.v - a.dataset.v : a.dataset.name.localeCompare(b.dataset.name));
      const mut = () => sorted.forEach(r => body.appendChild(r));
      if (p.flip) E.flip(ctx, rows, mut, { dur: p.dur, ease: p.ease }); else mut();
    };
    // start alphabetical
    Array.from(body.children).sort((a, b) => a.dataset.name.localeCompare(b.dataset.name)).forEach(r => body.appendChild(r));
    ctx.on(btn, 'click', sort);
    return { play() { ctx.after(600, () => { pulse(ctx, btn); sort(); }); ctx.after(2100, () => { pulse(ctx, btn); sort(); }); } };
  };

  /* ---------------- Live counter (tabular vs proportional figures) ---------------- */
  D.counter = (root, p, ctx) => {
    root.innerHTML = `<div class="ui-card ct"><div class="ui-muted">Live visitors</div><div class="ct-n">1,111</div><div class="ui-muted ct-sub">updated every 80ms</div></div>`;
    const n = $(root, '.ct-n');
    n.style.fontVariantNumeric = p.tabular ? 'tabular-nums' : 'proportional-nums';
    // fixed sequence so both sides show the same numbers
    let v = 1111, i = 0;
    const seq = [97, 3, 110, 1, 88, 600, 11, 4, 101, 7, 9, 1, 222, 5, 13, 77, 2, 18, 140, 1, 9, 311, 3, 6, 120, 2, 80, 1, 11, 400];
    const tick = () => { v = 1000 + ((v - 1000 + seq[i % seq.length]) % 9000); i++; n.textContent = v.toLocaleString('en-US'); if (i < 60) ctx.after(80, tick); };
    return { play() { ctx.after(200, tick); } };
  };

  /* ---------------- Skeleton: shimmer style, or skeleton -> content swap ---------------- */
  D.skeleton = (root, p, ctx) => {
    if (p.mode === 'shimmer') {
      root.innerHTML = `<div class="ui-card skc sk-${p.contrast || 'soft'}"><div class="skc-head"><span class="sk sk-av"></span><div class="skc-lines"><span class="sk" style="width:60%"></span><span class="sk" style="width:38%"></span></div></div>
        <span class="sk sk-img"></span><span class="sk" style="width:92%"></span><span class="sk" style="width:74%"></span></div>`;
      return {
        play() {
          $$(root, '.sk').forEach(s => {
            if (p.style === 'pulse') ctx.anim(s, [{ opacity: 1 }, { opacity: .3 }, { opacity: 1 }], { dur: p.speed, ease: 'ease-in-out', iterations: Infinity });
            else ctx.anim(s, [{ backgroundPosition: '100% 0' }, { backgroundPosition: '0% 0' }], { dur: p.speed, ease: 'linear', iterations: Infinity });
          });
        }
      };
    }
    const match = p.match !== false;
    const skel = match
      ? `<div class="skc-head"><span class="sk sk-av"></span><div class="skc-lines"><span class="sk" style="width:55%"></span><span class="sk" style="width:35%"></span></div></div><span class="sk sk-img"></span><span class="sk" style="width:90%"></span>`
      : `<span class="sk" style="width:70%"></span><span class="sk" style="width:90%"></span><span class="sk" style="width:50%"></span>`;
    const real = `<div class="skc-head">${avatar(['Mia Tanaka', '', '#F59E0B'])}<div class="skc-lines"><div class="ui-strong">Mia Tanaka</div><div class="ui-muted">Approved invoice #1042</div></div></div><div class="skc-img"></div><div class="skc-txt">Looks good — shipping Friday.</div>`;
    root.innerHTML = `<div class="skw"><div class="ui-card skc sk-soft"><div class="skc-in">${skel}</div></div><div class="skw-next">${skLines([80, 60])}</div></div>`;
    const card = $(root, '.skc'), inner = $(root, '.skc-in');
    $$(root, '.sk').forEach(s => ctx.anim(s, [{ backgroundPosition: '100% 0' }, { backgroundPosition: '0% 0' }], { dur: 1500, iterations: Infinity }));
    const swap = () => {
      const neu = document.createElement('div'); neu.className = 'skc-in'; neu.innerHTML = real;
      if (!match) { inner.replaceWith(neu); return; }
      inner.classList.add('is-leaving'); card.appendChild(neu);
      ctx.anim(inner, [{ opacity: 1 }, { opacity: 0 }], { dur: 200 }).finished.then(() => inner.remove(), () => {});
      ctx.anim(neu, [{ opacity: 0 }, { opacity: 1 }], { dur: 250, ease: 'ease-out' });
    };
    return { play() { ctx.after(1500, swap); } };
  };

  /* ---------------- Loader: spinner timing rules, skeleton, step messages ---------------- */
  D.loader = (root, p, ctx) => {
    const rows = [['INV-1042', 'Acme Inc.', '$7,560'], ['INV-1041', 'Northwind', '$2,140'], ['INV-1040', 'Globex', '$980'], ['INV-1039', 'Initech', '$4,300']];
    const rowsHTML = rows.map(r => `<div class="ld-row"><b>${r[0]}</b><span class="ui-muted">${r[1]}</span><span>${r[2]}</span></div>`).join('');
    const skelHTML = rows.map(() => `<div class="ld-row"><span class="sk" style="width:80%"></span><span class="sk" style="width:70%"></span><span class="sk" style="width:60%"></span></div>`).join('');
    root.innerHTML = `<div class="ui-card ld"><div class="ls-head"><span class="ui-strong">Invoices</span><button class="ui-btn ld-btn">Refresh</button></div><div class="ld-body">${rowsHTML}</div></div>`;
    const body = $(root, '.ld-body'), btn = $(root, '.ld-btn');
    const style = p.style || 'spinner';
    let loading = false;
    const setBody = (html, fade) => { body.innerHTML = html; if (fade) ctx.anim(body, [{ opacity: 0 }, { opacity: 1 }], { dur: 180, ease: 'ease-out', fill: 'none' }); };
    const load = () => {
      if (loading) return; loading = true; pulse(ctx, btn);
      const lat = p.latency || 0;
      if (style === 'skeleton') {
        setBody(skelHTML);
        $$(body, '.sk').forEach(s => ctx.anim(s, [{ backgroundPosition: '100% 0' }, { backgroundPosition: '0% 0' }], { dur: 1500, iterations: Infinity }));
        ctx.after(lat, () => { loading = false; setBody(rowsHTML, true); });
        return;
      }
      if (style === 'steps') {
        const steps = ['Collecting 48 invoices…', 'Calculating tax…', 'Generating PDF…', 'Almost done…'];
        setBody(`<div class="ld-center ld-steps">${spin}<div class="ld-msg ui-strong">${steps[0]}</div><div class="ld-prog"><i></i></div><div class="ui-muted ld-step">Step 1 of 4</div></div>`);
        ctx.anim($(body, '.ld-prog i'), [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { dur: lat, ease: 'linear' });
        steps.forEach((s, i) => i && ctx.after(lat * i / steps.length, () => {
          const m = $(body, '.ld-msg'); if (!m) return;
          m.textContent = s; $(body, '.ld-step').textContent = `Step ${i + 1} of 4`;
          ctx.anim(m, [{ opacity: 0, transform: 'translateY(4px)' }, { opacity: 1, transform: 'none' }], { dur: 200, ease: 'out-quint' });
        }));
        ctx.after(lat, () => { loading = false; setBody(rowsHTML, true); });
        return;
      }
      const showAfter = p.showAfter || 0, minShow = p.minShow || 0;
      let shownAt = -1, done = false;
      const t0 = performance.now();
      const showSpinner = () => { if (done) return; shownAt = performance.now(); setBody(`<div class="ld-center">${spin}</div>`); };
      if (showAfter > 0) { body.classList.add('is-stale'); ctx.after(showAfter, showSpinner); } else showSpinner();
      ctx.after(lat, () => {
        done = true;
        const finish = () => { loading = false; body.classList.remove('is-stale'); setBody(rowsHTML, shownAt >= 0); };
        if (shownAt < 0) return finish();
        const shownFor = (performance.now() - shownAt) / E.speed;
        if (shownFor < minShow) ctx.after(minShow - shownFor, finish); else finish();
      });
      void t0;
    };
    ctx.on(btn, 'click', load);
    return {
      play() {
        ctx.after(500, load);
        if ((p.latency || 0) < 1000) ctx.after(2000, load);
      }
    };
  };

  /* ---------------- Progress bar: same total, different pacing ---------------- */
  D.progress = (root, p, ctx) => {
    root.innerHTML = `<div class="ui-card pg"><div class="pg-top"><span class="ui-strong">Exporting report.pdf</span><span class="pg-pct">0%</span></div><div class="pg-track"><i></i></div><div class="ui-muted pg-sub">Preparing 48 pages</div></div>`;
    const bar = $(root, '.pg-track i'), pct = $(root, '.pg-pct'), sub = $(root, '.pg-sub');
    const curve = p.curve === 'accel' ? 'ease-in' : p.curve === 'decel' ? 'out-quint' : 'linear';
    const run = () => ctx.tween({ dur: p.total || 3200, ease: curve,
      update: k => { bar.style.transform = `scaleX(${k})`; pct.textContent = Math.round(k * 100) + '%'; },
      done: () => { sub.textContent = 'Done — 2.4 MB'; pct.textContent = '100%'; } });
    bar.style.transform = 'scaleX(0)';
    return { play() { ctx.after(400, run); } };
  };

  /* ---------------- Dashboard page load ---------------- */
  D.dashboard = (root, p, ctx) => {
    root.innerHTML = `<div class="win db"><div class="win-bar"><i></i><i></i><i></i></div><div class="db-main">
      <div class="db-side db-el"><span></span><span></span><span></span><span></span></div>
      <div class="db-content"><div class="db-h db-el"><b>Overview</b><span class="ui-muted">Nov 2026</span></div>
        <div class="db-tiles">${[['MRR', '$48.2k'], ['Users', '3,912'], ['Churn', '1.8%']].map(t => `<div class="db-tile db-el"><span class="ui-muted">${t[0]}</span><b>${t[1]}</b></div>`).join('')}</div>
        <div class="db-chart db-el"><svg viewBox="0 0 100 34" preserveAspectRatio="none"><polyline points="0,28 12,24 24,26 36,18 48,20 60,12 72,14 84,7 100,4" fill="none" stroke="var(--ui-accent)" stroke-width="1.6" vector-effect="non-scaling-stroke"/></svg></div>
      </div></div></div>`;
    const els = $$(root, '.db-el'), content = $(root, '.db-main');
    const crazy = ['translateX(-80px) rotate(-8deg)', 'translateY(-50px) scale(.5)', 'translate(40px,60px) rotate(12deg)', 'translateY(70px) scale(1.4)', 'translate(-60px,30px) rotate(-14deg)', 'scale(.2) rotate(30deg)'];
    if (p.mode === 'all') els.forEach((el, i) => ctx.anim(el, [{ opacity: 0, transform: crazy[i % crazy.length] }, { opacity: 0, transform: crazy[i % crazy.length] }], { dur: 0 }));
    else ctx.anim(content, [{ opacity: 0 }, { opacity: 0 }], { dur: 0 });
    return {
      play() {
        ctx.after(300, () => {
          if (p.mode === 'all') els.forEach((el, i) => ctx.anim(el, [{ opacity: 0, transform: crazy[i % crazy.length] }, { opacity: 1, transform: 'none' }], { dur: 750, ease: 'out-back', delay: i * 120 }));
          else {
            ctx.anim(content, [{ opacity: 0 }, { opacity: 1 }], { dur: 200, ease: 'ease-out' });
            $$(root, '.db-tile').forEach((el, i) => ctx.anim(el, [{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { dur: 260, ease: 'out-quint', delay: 60 + i * 40 }));
          }
        });
      }
    };
  };

  /* ---------------- Notification bell: ambient vs event-only motion ---------------- */
  D.bell = (root, p, ctx) => {
    root.innerHTML = `<div class="win"><div class="bl-top"><b>Acme</b><span class="bl-search">${I.search}<span class="ui-muted">Search</span></span><button class="bl-bell">${I.bell}<span class="bl-badge">3</span></button><span class="av" style="background:#6366F1">AR</span></div>
      <div class="win-body">${skLines([72, 90, 60, 84, 46])}</div></div>`;
    const bell = $(root, '.bl-bell .ic'), badge = $(root, '.bl-badge');
    const wiggle = [{ transform: 'rotate(0)' }, { transform: 'rotate(16deg)' }, { transform: 'rotate(-14deg)' }, { transform: 'rotate(9deg)' }, { transform: 'rotate(-5deg)' }, { transform: 'rotate(0)' }];
    ctx.anim(badge, [{ transform: 'scale(0)' }, { transform: 'scale(0)' }], { dur: 0 });
    return {
      play() {
        if (p.ambient) {
          ctx.anim(bell, wiggle.concat([{ transform: 'rotate(0)' }]), { dur: 900, iterations: Infinity, ease: 'ease-in-out' });
          ctx.anim(badge, [{ transform: 'scale(1)' }, { transform: 'scale(1.25)' }, { transform: 'scale(1)' }], { dur: 700, iterations: Infinity, delay: 1500 });
        }
        ctx.after(1500, () => {
          ctx.anim(badge, [{ transform: 'scale(0)' }, { transform: 'scale(1)' }], { dur: 300, ease: 'out-back', fill: p.ambient ? 'none' : 'both' });
          if (!p.ambient) ctx.anim(bell, wiggle, { dur: 550, ease: 'ease-out', fill: 'none' });
        });
      }
    };
  };

  /* ---------------- Card entrance: properties / reduced motion ---------------- */
  D.cardIn = (root, p, ctx) => {
    root.innerHTML = win(skLines([68, 88, 54, 92, 70]), `<div class="ci-wrap"><div class="ui-card ci">${avatar(PEOPLE[0])}<div><div class="ui-strong">New comment</div><div class="ui-muted">Ava on “Q4 plan”: Love this direction.</div></div></div></div>`);
    const card = $(root, '.ci');
    const modes = {
      many: { from: { opacity: 0, transform: 'translate(40px,-30px) rotate(-12deg) scale(.55)', filter: 'blur(8px) hue-rotate(120deg)' }, dur: 700, ease: 'out-back' },
      few: { from: { opacity: 0, transform: 'translateY(8px) scale(.98)', filter: 'blur(0px) hue-rotate(0deg)' }, dur: 240, ease: 'out-quint' },
      'slide-big': { from: { opacity: 1, transform: 'translateX(130%)', filter: 'blur(0px) hue-rotate(0deg)' }, dur: 520, ease: 'in-out-quart' },
      fade: { from: { opacity: 0, transform: 'none', filter: 'blur(0px) hue-rotate(0deg)' }, dur: 220, ease: 'ease-out' }
    };
    const m = modes[p.mode] || modes.few;
    const to = { opacity: 1, transform: 'none', filter: 'blur(0px) hue-rotate(0deg)' };
    ctx.anim(card, [m.from, m.from], { dur: 0 });
    return { play() { ctx.after(400, () => ctx.anim(card, [m.from, to], { dur: m.dur, ease: m.ease })); } };
  };

  /* ---------------- Consistency: three popovers, one system or three ---------------- */
  D.consistency = (root, p, ctx) => {
    root.innerHTML = `<div class="cs"><div class="cs-bar">
      <div class="cs-slot"><button class="ui-btn cs-b">File ${I.chev}</button><div class="ui-card cs-pop"><div>New file</div><div>Duplicate</div><div>Archive</div></div></div>
      <div class="cs-slot"><button class="ui-btn cs-b">Status ${I.chev}</button><div class="ui-card cs-pop"><div><i style="background:#9CA3AF"></i>Backlog</div><div><i style="background:#F59E0B"></i>In progress</div><div><i style="background:#22C55E"></i>Done</div></div></div>
      <div class="cs-slot"><button class="ui-btn cs-b">?</button><div class="ui-card cs-pop cs-tip">Keyboard shortcuts</div></div>
    </div></div>`;
    const slots = $$(root, '.cs-slot');
    const set = p.set || [];
    const frames = i => {
      const s = set[i] || {};
      return [{ opacity: 0, transform: `translateY(${-(s.dist || 0)}px) scale(${s.scale == null ? 1 : s.scale})` }, { opacity: 1, transform: 'none' }];
    };
    slots.forEach((sl, i) => { const pop = $(sl, '.cs-pop'); const f = frames(i)[0]; ctx.anim(pop, [f, f], { dur: 0 }); });
    const open = i => { const s = set[i] || {}, pop = $(slots[i], '.cs-pop'); pulse(ctx, $(slots[i], '.cs-b')); ctx.anim(pop, frames(i), { dur: s.dur, ease: s.ease }); };
    const close = i => { const s = set[i] || {}, pop = $(slots[i], '.cs-pop'); ctx.anim(pop, frames(i).reverse(), { dur: Math.round((s.dur || 200) * 0.7), ease: s.ease === 'out-back' ? 'ease-out' : s.ease }); };
    slots.forEach((sl, i) => { let o = false; ctx.on($(sl, '.cs-b'), 'click', () => { o = !o; o ? open(i) : close(i); }); });
    return { play() { [0, 1, 2].forEach(i => { ctx.after(300 + i * 1000, () => open(i)); ctx.after(1000 + i * 1000, () => close(i)); }); } };
  };

  /* ---------------- Search-as-you-type ---------------- */
  D.search = (root, p, ctx) => {
    const all = ['Invoice #1042', 'Invoice #1041', 'Inventory report', 'Investor update', 'Invite teammates', 'Integrations', 'Insights dashboard', 'Billing settings'];
    root.innerHTML = `<div class="ui-card sr"><div class="sr-in">${I.search}<span class="sr-q"></span><span class="sr-caret"></span></div><div class="sr-list"></div></div>`;
    const q = $(root, '.sr-q'), list = $(root, '.sr-list');
    const render = text => {
      const hits = all.filter(a => a.toLowerCase().includes(text.toLowerCase())).slice(0, 5);
      list.innerHTML = hits.map(h => `<div class="sr-row">${h.replace(new RegExp('(' + text + ')', 'i'), '<mark>$1</mark>')}</div>`).join('') || '<div class="sr-row ui-muted">No results</div>';
      if (p.restagger) $$(list, '.sr-row').forEach((r, i) => ctx.anim(r, [{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { dur: 300, ease: 'out-quint', delay: i * 60 }));
    };
    render('');
    const word = 'invo';
    return { play() { [...word].forEach((ch, i) => ctx.after(500 + i * 340, () => { q.textContent = word.slice(0, i + 1); render(q.textContent); })); } };
  };

  /* ---------------- Interruptible sidebar ---------------- */
  D.interrupt = (root, p, ctx) => {
    root.innerHTML = `<div class="win it"><div class="win-bar"><i></i><i></i><i></i><button class="it-btn">Toggle sidebar</button></div><div class="it-main">
      <aside class="it-side"><b>Projects</b><span>Brand refresh</span><span>Q4 roadmap</span><span>Website</span><span>Hiring</span></aside><div class="win-body">${skLines([70, 90, 56, 82])}</div></div></div>`;
    const side = $(root, '.it-side'), btn = $(root, '.it-btn');
    let open = false, anim = null;
    const W = () => side.offsetWidth;
    ctx.anim(side, [{ transform: 'translateX(-100%)' }, { transform: 'translateX(-100%)' }], { dur: 0 });
    const toggle = () => {
      open = !open;
      pulse(ctx, btn);
      const to = open ? 0 : -W();
      let from;
      if (p.mode === 'retarget') {
        const m = new DOMMatrixReadOnly(getComputedStyle(side).transform);
        from = m.m41;
      } else from = open ? -W() : 0;
      if (anim) anim.cancel();
      anim = ctx.anim(side, [{ transform: `translateX(${from}px)` }, { transform: `translateX(${to}px)` }], { dur: p.dur, ease: p.ease });
    };
    ctx.on(btn, 'click', toggle);
    return { play() { [300, 520, 740, 960, 1180].forEach(t => ctx.after(t, toggle)); } };
  };

  /* ---------------- Drag: release spring, or rubber-band at the edge ---------------- */
  D.drag = (root, p, ctx) => {
    const rubber = p.mode === 'rubber';
    root.innerHTML = rubber
      ? `<div class="win dg-win"><div class="win-body">${skLines([66, 88, 50])}</div><div class="scrim" style="opacity:1"></div><div class="dg-sheet"><span class="dg-handle"></span><div class="ui-strong">Share “Q4 plan”</div>${PEOPLE.slice(0, 3).map(pp => `<div class="dg-row">${avatar(pp)}<span>${pp[0]}</span><span class="ui-muted">Can edit</span></div>`).join('')}</div></div>`
      : `<div class="dg"><div class="dg-home"></div><div class="ui-card dg-card">${I.grip}<div><div class="ui-strong">Drag me</div><div class="ui-muted">then let go</div></div></div></div>`;
    const el = $(root, rubber ? '.dg-sheet' : '.dg-card');
    el.style.touchAction = 'none';
    let ox = 0, oy = 0, back = null;
    const H = () => el.offsetHeight;
    const band = dy => { // dy < 0 = pulling up past the open position
      if (dy >= 0) return dy;
      if (!p.rubber) return 0;
      const d = H(), c = 0.55, x = -dy;
      return -(1 - 1 / (x * c / d + 1)) * d;
    };
    const place = (x, y) => { ox = x; oy = y; el.style.transform = `translate(${x}px, ${y}px)`; };
    const release = () => {
      const fx = ox, fy = oy;
      place(0, 0);
      back = ctx.anim(el, [{ transform: `translate(${fx}px, ${fy}px)` }, { transform: 'translate(0px, 0px)' }],
        { dur: p.dur || 350, ease: rubber ? 'spring-snappy' : p.ease, fill: 'none' });
    };
    const move = (dx, dy) => rubber ? place(0, band(dy)) : place(dx, dy);
    let sx = 0, sy = 0, drag = false;
    ctx.on(el, 'pointerdown', e => { drag = true; sx = e.clientX; sy = e.clientY; if (back) back.cancel(); el.setPointerCapture(e.pointerId); });
    ctx.on(el, 'pointermove', e => { if (drag) move(e.clientX - sx, e.clientY - sy); });
    const end = () => { if (drag) { drag = false; release(); } };
    ctx.on(el, 'pointerup', end); ctx.on(el, 'pointercancel', end);
    return {
      play() {
        const cur = E.cursor(root, ctx);
        const grab = rubber ? $(root, '.dg-handle') : el;
        ctx.after(250, () => cur.to(grab, 450, () => {
          cur.down();
          const start = { x: cur.x, y: cur.y };
          const dx = rubber ? 0 : root.clientWidth * 0.26, dy = rubber ? -root.clientHeight * 0.32 : -root.clientHeight * 0.2;
          ctx.after(120, () => ctx.tween({ dur: 600, ease: 'ease-in-out',
            update: k => { cur.set(start.x + dx * k, start.y + dy * k); move(dx * k, dy * k); },
            done: () => ctx.after(250, () => { cur.up(); release(); ctx.after(500, () => cur.hide()); }) }));
        }));
      }
    };
  };

  global.Demos = D;
})(window);
