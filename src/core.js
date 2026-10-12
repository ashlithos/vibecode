/* Core engine shared by every prototype. The build step inlines it into each HTML file,
   so every file stays a single self-contained page that works offline.

   Game time vs real time:
   - Host mode: the session clock is real time (it starts when you click "Start the session").
   - Simulate mode: the session clock is *game* time. Core.wait(sec) advances game time by
     `sec`, but only takes sec / speed real seconds. At 25x a 30-minute session plays in ~72s.
*/
(function () {
  'use strict';

  const PERSONAS = [
    { id: 'maya',  name: 'Maya',  tag: 'the chaotic',      emoji: '🌪️', color: '#ff5d73' },
    { id: 'dev',   name: 'Dev',   tag: 'the deadpan',      emoji: '🗿', color: '#7b8794' },
    { id: 'priya', name: 'Priya', tag: 'the wholesome',    emoji: '🌻', color: '#e8a317' },
    { id: 'leo',   name: 'Leo',   tag: 'the overachiever', emoji: '🚀', color: '#4a6cf7' },
    { id: 'sam',   name: 'Sam',   tag: 'the quiet one',    emoji: '🐢', color: '#16a36a' },
    { id: 'zoe',   name: 'Zoe',   tag: 'the punster',      emoji: '🎭', color: '#9b59b6' },
    { id: 'omar',  name: 'Omar',  tag: 'the storyteller',  emoji: '📚', color: '#e67e22' },
  ];

  // ---------- small utils ----------
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const rand = (a, b) => a + Math.random() * (b - a);
  const randi = (a, b) => Math.floor(rand(a, b + 1));
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const sample = (a, n) => shuffle(a).slice(0, n);
  const chance = p => Math.random() < p;
  const fmt = s => { s = Math.max(0, Math.round(s)); return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); };
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  // Random permutation with no fixed points (nobody gets themselves).
  function derange(n, noMutual) {
    for (let tries = 0; tries < 5000; tries++) {
      const p = shuffle([...Array(n).keys()]);
      if (p.some((v, i) => v === i)) continue;
      if (noMutual && p.some((v, i) => p[v] === i)) continue;
      return p;
    }
    return [...Array(n).keys()].map(i => (i + 1) % n);
  }
  function hash(s) { let h = 2166136261; for (const c of String(s)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return Math.abs(h); }

  // ---------- state ----------
  const S = {
    mode: null, cfg: null, players: PERSONAS.map(p => ({ ...p })),
    clock: 0, running: false, paused: false, speed: 25, last: Date.now(), waiters: [],
    phase: null, phases: [], timer: null, boards: {}, realStart: 0, finished: false,
  };
  const player = p => p == null ? null : typeof p === 'object' ? p : typeof p === 'number' ? S.players[p] : S.players.find(x => x.id === p);

  // ---------- clock ----------
  setInterval(() => {
    const t = Date.now(), dt = (t - S.last) / 1000; S.last = t;
    if (S.running && !S.paused) {
      if (S.mode === 'host') S.clock += dt;
      else if (S.mode === 'sim' && S.waiters.length) {
        // Several waits can be pending at once (e.g. an un-awaited generate()); advance to the nearest.
        const adv = Math.min(dt * S.speed, ...S.waiters.map(w => w.left));
        S.clock += adv;
        const due = [];
        S.waiters = S.waiters.filter(w => { w.left -= adv; if (w.left <= 1e-6) { due.push(w.res); return false; } return true; });
        due.forEach(r => r());
      }
    }
    hud();
  }, 50);

  /** Advance game time (simulate mode only). Resolves immediately in host mode. */
  function wait(sec) {
    if (S.mode !== 'sim' || S.finished) return Promise.resolve();
    return new Promise(res => { S.waiters.push({ left: Math.max(0, sec), res }); });
  }

  function hud() {
    const clk = $('#clk'); if (!clk) return;
    const target = (S.cfg && S.cfg.target) || 1800;
    clk.textContent = fmt(S.clock);
    const prog = $('#prog');
    prog.style.width = Math.min(100, S.clock / target * 100) + '%';
    prog.classList.toggle('over', S.clock > target);
    const ph = $('#phName'), pl = $('#phLeft');
    if (S.phase && !S.finished) {
      ph.innerHTML = '<b>' + esc(S.phase.name) + '</b>';
      const left = S.phase.budget - (S.clock - S.phase.start);
      pl.innerHTML = left >= 0 ? fmt(left) + ' left' : '<span class="over">+' + fmt(-left) + ' over</span>';
    } else { ph.textContent = S.finished ? 'Finished' : 'Not started'; pl.textContent = ''; }
    const rt = $('#rt');
    if (S.timer) {
      const left = S.timer.sec - (S.clock - S.timer.start);
      rt.hidden = false;
      rt.classList.toggle('ding', left <= 0);
      rt.innerHTML = '<span>⏱ ' + esc(S.timer.label) + '</span><span class="bar"><i style="width:' + Math.max(0, left / S.timer.sec * 100) + '%"></i></span><span class="t">' + (left > 0 ? fmt(left) : "Time!") + '</span>';
    } else rt.hidden = true;
  }

  // ---------- phases & timers ----------
  function closePhase() { if (S.phase && S.phase.actual == null) S.phase.actual = S.clock - S.phase.start; }
  function phase(name, budgetSec) {
    // Real rooms lose 6–14s at every phase change ("okay, eyes up here…"); charge it to the phase that's ending.
    if (S.mode === 'sim' && S.phase) S.clock += rand(6, 14);
    closePhase();
    S.phase = { name, budget: budgetSec, start: S.clock, actual: null };
    S.phases.push(S.phase);
    log(null, '— ' + name + ' (budget ' + fmt(budgetSec) + ') —', 'phase');
    hud();
  }
  function timer(label, sec) { S.timer = { label, sec, start: S.clock }; hud(); }
  function clearTimer() { S.timer = null; hud(); }
  const timerLeft = () => S.timer ? S.timer.sec - (S.clock - S.timer.start) : 0;

  // ---------- transcript ----------
  function log(p, text, kind) {
    const el = $('#log'); if (!el) return;
    p = player(p);
    const d = document.createElement('div');
    d.className = 'le ' + (kind || (p ? 'say' : 'sys'));
    d.innerHTML = '<span class="ts">' + fmt(S.clock) + '</span>' + (p ? '<b style="color:' + p.color + '">' + p.emoji + ' ' + esc(p.name) + '</b>' : '') + esc(text);
    el.appendChild(d); el.scrollTop = el.scrollHeight;
    $('#logCount').textContent = el.children.length + ' events';
  }
  function bubble(p, text) {
    p = player(p); const box = $('#bubbles'); if (!box || !p) return;
    const b = document.createElement('div'); b.className = 'bubble'; b.style.setProperty('--pc', p.color);
    b.innerHTML = '<span class="pe">' + p.emoji + '</span><div><b>' + esc(p.name) + '</b><div>' + esc(text) + '</div></div>';
    box.appendChild(b); const max = window.innerWidth < 960 ? 1 : 2; while (box.children.length > max) box.firstChild.remove();
    setTimeout(() => b.classList.add('out'), 2600); setTimeout(() => b.remove(), 3000);
  }
  /** A synthetic player says something; takes `sec` of game time. */
  function say(p, text, sec) { log(p, '“' + text + '”', 'say'); bubble(p, text); return wait(sec == null ? 6 : sec); }
  /** A player does something (no quote marks). */
  function act(p, text, sec) { log(p, ' ' + text, 'say'); return wait(sec == null ? 2 : sec); }
  function sys(text, sec) { log(null, text, 'sys'); return wait(sec == null ? 2 : sec); }

  // ---------- rendering helpers ----------
  function stage(html) { const st = $('#stage'); st.innerHTML = '<div class="fade">' + html + '</div>'; window.scrollTo({ top: 0, behavior: 'smooth' }); return st; }
  function chip(p, opt) { p = player(p); opt = opt || {}; return '<span class="pchip' + (opt.big ? ' big' : '') + (opt.dim ? ' dim' : '') + '" style="--pc:' + p.color + '"><span class="pe">' + p.emoji + '</span>' + esc(p.name) + (opt.suffix ? ' ' + opt.suffix : '') + '</span>'; }
  const script = t => '<div class="script">🎙️ <b>Say:</b> ' + t + '</div>';

  const EMOJI = [[/corgi|dog|pup/, '🐶'], [/cat|kitten/, '🐱'], [/raccoon/, '🦝'], [/dragon/, '🐉'], [/unicorn/, '🦄'], [/pizza/, '🍕'], [/taco/, '🌮'], [/rocket|space|astronaut/, '🚀'], [/robot|\bai\b/, '🤖'], [/ocean|sea|wave|swim/, '🌊'], [/fire|flame|spicy/, '🔥'], [/music|song|jingle|sing/, '🎵'], [/cake|birthday/, '🎂'], [/coffee|espresso|latte|cold brew/, '☕'], [/moon|night/, '🌙'], [/sun|sunrise|sunset/, '🌅'], [/castle|kingdom/, '🏰'], [/ghost|haunt/, '👻'], [/crown|king|queen|royal/, '👑'], [/banana/, '🍌'], [/penguin/, '🐧'], [/owl/, '🦉'], [/goose|duck/, '🦆'], [/octopus|squid/, '🐙'], [/sloth/, '🦥'], [/frog/, '🐸'], [/bear/, '🐻'], [/shark/, '🦈'], [/cowboy/, '🤠'], [/wizard|magic|spell/, '🧙'], [/ninja/, '🥷'], [/movie|film|poster|cinema/, '🎬'], [/heart|love/, '💖'], [/tree|forest/, '🌲'], [/mountain|peak|summit/, '🏔️'], [/city/, '🏙️'], [/laptop|computer|tabs|code/, '💻'], [/snack|popcorn/, '🍿'], [/star|galaxy/, '⭐'], [/rain|storm/, '🌧️'], [/sword|battle|warrior/, '⚔️'], [/shield/, '🛡️'], [/lion/, '🦁'], [/tiger/, '🐯'], [/fox/, '🦊'], [/bee\b|bees/, '🐝'], [/hamster/, '🐹'], [/llama|alpaca/, '🦙'], [/croissant|bread|baguette|loaf|sandwich/, '🥐'], [/sushi/, '🍣'], [/donut/, '🍩'], [/cheese/, '🧀'], [/disco|dance/, '🪩'], [/volcano/, '🌋'], [/rainbow/, '🌈'], [/hat\b/, '🎩'], [/sock/, '🧦'], [/train/, '🚂'], [/pirate|ship|boat/, '🏴‍☠️'], [/snail/, '🐌'], [/whale/, '🐋'], [/dinosaur|t-rex|raptor/, '🦖'], [/chicken/, '🐔'], [/cloud/, '☁️'], [/cactus|plant/, '🌵'], [/book|library/, '📚'], [/guitar|rock/, '🎸'], [/trophy|award|winner/, '🏆'], [/spreadsheet|chart|graph/, '📊'], [/calendar|meeting|sync/, '📅'], [/dumpling/, '🥟'], [/noodle|ramen/, '🍜'], [/chocolate|cocoa/, '🍫'], [/ice cream/, '🍦'], [/snow|ski|winter/, '❄️'], [/helicopter/, '🚁'], [/church|cathedral|monk/, '⛪'], [/giant|monster/, '👹'], [/\bteam\b|people/, '👥'], [/goat/, '🐐'], [/capybara|beaver/, '🦫'], [/axolotl|lizard|gecko/, '🦎'], [/otter/, '🦦'], [/hedgehog/, '🦔'], [/narwhal|unicorn whale/, '🐳'], [/turtle|tortoise/, '🐢'], [/kraken/, '🦑'], [/bat\b/, '🦇'], [/yeti/, '🦍'], [/cheeto/, '🌶️'], [/oats|porridge/, '🥣'], [/panda/, '🐼'], [/butterfly/, '🦋'], [/tea\b/, '🍵'], [/mango/, '🥭'], [/avocado/, '🥑'], [/phoenix|bird/, '🐦‍🔥'], [/lightning|thunder/, '⚡'], [/time|clock/, '⏰'], [/money|gold|rich/, '💰'], [/plane|fly|wings/, '✈️'], [/car\b|race/, '🏎️'], [/wolf/, '🐺'], [/horse/, '🐴'], [/mushroom/, '🍄'], [/cookie/, '🍪'], [/pickle/, '🥒'], [/egg/, '🥚']];
  function emojisFor(prompt, max) {
    // Emoji in the order their keywords appear in the prompt.
    const t = String(prompt).toLowerCase(), hits = [];
    for (const [re, e] of EMOJI) { const m = t.match(new RegExp('\\b(?:' + re.source + ')')); if (m && !hits.some(h => h.e === e)) hits.push({ e, at: m.index }); }
    hits.sort((a, b) => a.at - b.at);
    return hits.length ? hits.slice(0, max || 3).map(h => h.e).join('') : '✨🎨';
  }
  let genN = 0;
  /**
   * Placeholder card for an AI generation result. Returns HTML.
   * kind: image | poster | square | video | song | text
   */
  function genCard(o) {
    const id = o.id || ('gen' + (++genN));
    const h = hash(o.prompt) % 360, h2 = (h + 40 + hash(o.title || 'x') % 80) % 360;
    const kindLabel = { image: 'AI image', poster: 'AI movie poster', square: 'AI image', video: 'AI video', song: 'AI song', text: 'AI text' }[o.kind || 'image'];
    return '<div class="gen ' + (o.kind || 'image') + (o.loading === false ? ' done' : ' loading') + '" id="' + id + '" style="--h1:' + h + 'deg;--h2:' + h2 + 'deg">' +
      '<!-- REAL API PLUG-IN POINT: send the prompt below to an image/video/audio generation API and replace .gen-art with the returned media. -->' +
      '<div class="gen-art"><div class="em">' + (o.emoji || emojisFor(o.prompt)) + '</div>' +
      (o.overlayTitle ? '<div class="over"><div class="pt">' + esc(o.overlayTitle) + '</div>' + (o.overlaySub ? '<div class="ps">' + esc(o.overlaySub) + '</div>' : '') + '</div>' : '') + '</div>' +
      '<div class="gen-meta"><div class="gen-kind">' + kindLabel + ' · placeholder</div>' + (o.title ? '<div class="gen-title">' + esc(o.title) + '</div>' : '') + (o.sub || '') +
      (o.hidePrompt ? '' : '<div class="gen-prompt"><b>Prompt that would be sent:</b><br>' + esc(o.prompt) + '</div>') + '</div>' +
      '<div class="gen-load">Generating…</div></div>';
  }
  /** Flip a genCard from loading to done. ~10s of game time in sim, ~1.5s real in host. */
  async function generate(id, sec) {
    log(null, '🎨 Prompt sent to generator… (placeholder, no real API call)', 'sys');
    if (S.mode === 'sim') await wait(sec == null ? 10 : sec); else await sleep(1500);
    const el = document.getElementById(id);
    if (el) { el.classList.remove('loading'); el.classList.add('done'); }
  }

  // ---------- sentence assembly (words fly into slots) ----------
  /** parts: array of strings and {word, cat, p} slots. Returns HTML; reveal with revealSlots(id). */
  function slotSentence(id, parts, revealed) {
    return '<div class="slots big-text" id="' + id + '">' + parts.map(x => {
      if (typeof x === 'string') return '<span>' + esc(x) + '</span>';
      const p = player(x.p);
      return '<span class="slot' + (revealed ? ' in' : '') + '" style="--pc:' + (p ? p.color : 'var(--accent2)') + '"><span class="sw">' + esc(x.word || '???') + '</span><span class="sc">' + esc(x.cat || '') + (p ? ' · ' + esc(p.name) : '') + '</span></span>';
    }).join(' ') + '</div>';
  }
  async function revealSlots(id, sec) {
    for (const e of $$('#' + id + ' .slot')) { e.classList.add('in'); await (S.mode === 'sim' ? wait(sec == null ? 2.5 : sec) : sleep(550)); }
  }

  // ---------- simultaneous word collection grid ----------
  /** items: [{p, cat, word?}]. Host gets inputs; sim shows hidden ✅ as words arrive (setCollected). */
  function collectGrid(id, items, o) {
    o = o || {};
    const done = items.filter(x => x.word).length;
    return '<div class="spread"><div class="counter" id="' + id + '-count">' + done + ' / ' + items.length + ' submitted</div>' +
      (S.mode === 'host' && o.fillAct ? '<button class="btn small ghost" data-act="' + o.fillAct + '">🎲 Fill with sample answers</button>' : '') + '</div>' +
      '<div class="pgrid" id="' + id + '" style="margin-top:10px">' + items.map((x, i) => {
        const p = player(x.p);
        return '<div class="pcell' + (x.word ? ' done' : '') + '" data-cell="' + i + '"><span class="status">' + (x.word ? '✅' : '⏳') + '</span>' + chip(p) +
          '<span class="cat">' + esc(x.cat) + '</span>' +
          (S.mode === 'host' ? '<input data-ci="' + i + '" data-grid="' + id + '" value="' + esc(x.word || '') + '" placeholder="' + esc(x.hint || 'type their word') + '" autocomplete="off">'
            : '<span class="muted">' + (x.word ? (o.showWords ? '<b>' + esc(x.word) + '</b>' : 'submitted (hidden)') : 'thinking…') + '</span>') + '</div>';
      }).join('') + '</div>';
  }
  /** Read host inputs back into items. */
  function readGrid(id, items) { $$('#' + id + ' input[data-ci]').forEach(inp => { items[+inp.dataset.ci].word = inp.value.trim(); }); return items; }
  /** Mark item i as submitted in an already-rendered grid. */
  function markGrid(id, items, i, show) {
    const cell = $('#' + id + ' [data-cell="' + i + '"]'); if (!cell) return;
    cell.classList.add('done'); cell.querySelector('.status').textContent = '✅';
    const m = cell.querySelector('.muted'); if (m) m.innerHTML = show ? '<b>' + esc(items[i].word) + '</b>' : 'submitted (hidden)';
    const c = $('#' + id + '-count'); if (c) c.textContent = items.filter(x => x.word).length + ' / ' + items.length + ' submitted';
  }
  document.addEventListener('input', e => {
    const inp = e.target.closest('[data-ci]'); if (!inp) return;
    const grid = inp.dataset.grid, cell = inp.closest('.pcell'), has = !!inp.value.trim();
    cell.classList.toggle('done', has); cell.querySelector('.status').textContent = has ? '✅' : '⏳';
    const all = $$('#' + grid + ' input[data-ci]'), n = all.filter(x => x.value.trim()).length;
    const c = $('#' + grid + '-count'); if (c) c.textContent = n + ' / ' + all.length + ' submitted';
  });

  // ---------- vote board ----------
  let vbN = 0;
  class VoteBoard {
    /** options: [{id,label,emoji?,short?}], cats: [{id,label}], exclude(voter, option) -> bool */
    constructor(o) {
      this.id = o.id || ('vb' + (++vbN));
      this.options = o.options; this.voters = o.voters || S.players;
      this.cats = o.cats || [{ id: 'main', label: o.title || 'Vote' }];
      this.exclude = o.exclude; this.onChange = o.onChange;
      this.votes = {}; this.cats.forEach(c => this.votes[c.id] = {});
      S.boards[this.id] = this;
    }
    count(cat, opt) { return Object.values(this.votes[cat]).filter(v => v === opt).length; }
    tally(cat) { cat = cat || this.cats[0].id; return this.options.map(o => ({ id: o.id, label: o.label, emoji: o.emoji, n: this.count(cat, o.id) })).sort((a, b) => b.n - a.n); }
    winner(cat) { return this.tally(cat)[0]; }
    voted(cat) { return Object.keys(this.votes[cat || this.cats[0].id]).length; }
    cast(voter, opt, cat) { cat = cat || this.cats[0].id; this.votes[cat][voter] = opt; this.refresh(); }
    html() { return '<div class="vboard" id="' + this.id + '">' + this.inner() + '</div>'; }
    inner() {
      return this.cats.map(c => {
        const max = Math.max(1, ...this.options.map(o => this.count(c.id, o.id)));
        const top = this.voted(c.id) ? this.winner(c.id).n : -1;
        return '<div class="vcat"><div class="vtitle"><span>' + esc(c.label) + '</span><small>' + this.voted(c.id) + '/' + this.voters.length + ' voted</small></div>' +
          this.options.map(o => { const n = this.count(c.id, o.id); return '<div class="vbar' + (n === top && n > 0 ? ' win' : '') + '"><span class="bl">' + (o.emoji || '') + ' ' + esc(o.label) + '</span><span class="bt"><i style="width:' + (n / max * 100) + '%"></i></span><b>' + n + '</b></div>'; }).join('') +
          '<details' + (S.mode === 'host' ? ' open' : '') + '><summary>' + (S.mode === 'host' ? 'Record each person’s vote (tap)' : 'Who voted for what') + '</summary>' +
          this.voters.map(v => '<div class="vrow"><span class="vname">' + v.emoji + ' ' + esc(v.name) + '</span><div class="vopts">' +
            this.options.map(o => { const ex = this.exclude && this.exclude(v, o); const sel = this.votes[c.id][v.id] === o.id; return '<button class="vopt' + (sel ? ' sel' : '') + '"' + (ex ? ' disabled' : '') + ' data-act="core:vote" data-b="' + this.id + '" data-c="' + c.id + '" data-v="' + v.id + '" data-o="' + esc(o.id) + '">' + (o.emoji ? o.emoji + ' ' : '') + esc(o.short || o.label) + '</button>'; }).join('') +
            '</div></div>').join('') + '</details></div>';
      }).join('');
    }
    refresh() { const el = document.getElementById(this.id); if (el) el.innerHTML = this.inner(); if (this.onChange) this.onChange(this); }
  }
  /** Synthetic voters vote one by one. chooser(voter) -> option id. */
  async function simVotes(board, chooser, o) {
    o = o || {}; const cat = o.cat || board.cats[0].id;
    for (const v of shuffle(board.voters)) {
      let opt = chooser(v);
      if (board.exclude && board.exclude(v, board.options.find(x => x.id === opt))) opt = pick(board.options.filter(x => !board.exclude(v, x))).id;
      board.cast(v.id, opt, cat);
      await wait((o.gap || 4) * rand(.5, 1.5));
    }
    await wait(o.straggler == null ? 6 : o.straggler); // "is everyone in?" — waiting on the last voter
    const label = board.cats.find(c => c.id === cat).label;
    log(null, '🗳️ ' + label + ': ' + board.tally(cat).filter(x => x.n).map(x => x.label + ' ×' + x.n).join(' · '), 'sys');
  }

  // ---------- shell, landing, setup ----------
  function shell() {
    const c = S.cfg;
    document.title = c.num + ' · ' + c.title;
    document.body.innerHTML =
      '<header class="top"><div class="brand"><span class="num">' + esc(c.num) + '</span><b>' + c.emoji + ' ' + esc(c.title) + '</b><span class="mode" id="modeBadge">preview</span></div>' +
      '<div class="hud"><div class="clock" title="Session clock"><span id="clk">00:00</span><small>/ ' + fmt(c.target || 1800) + '</small></div><div class="phase"><span id="phName">Not started</span> <span id="phLeft"></span></div></div>' +
      '<div class="ctrls" id="ctrls"></div></header><div class="progress"><div id="prog"></div></div>' +
      '<div class="layout"><main><div id="rt" class="roundtimer" hidden></div><div id="stage"></div></main>' +
      '<aside class="logwrap"><div class="loghead"><span>📜 Transcript</span><small id="logCount"></small></div><div id="log"></div></aside></div>' +
      '<div id="bubbles"></div><dialog id="notesDlg"><div class="dlg" id="notesBody"></div></dialog>';
    ctrls();
  }
  function ctrls() {
    const el = $('#ctrls'); if (!el) return;
    let h = '';
    if (S.mode === 'sim' && !S.finished) {
      h += '<button class="btn small ghost" data-act="core:pause">' + (S.paused ? '▶ Resume' : '⏸ Pause') + '</button>';
      h += '<span class="seg">' + [10, 25, 60].map(x => '<button data-act="core:speed" data-x="' + x + '" class="' + (S.speed === x ? 'on' : '') + '">' + x + '×</button>').join('') + '</span>';
    }
    if (S.mode === 'host' && S.running) {
      h += '<button class="btn small ghost" data-act="core:pause">' + (S.paused ? '▶ Resume clock' : '⏸ Pause clock') + '</button>';
      h += '<button class="btn small ghost" data-act="core:end">🏁 End & report</button>';
    }
    h += '<button class="btn small ghost" data-act="core:notes">📝 Notes</button>';
    if (S.mode) h += '<button class="btn small ghost" data-act="core:restart">↺ Start over</button>';
    el.innerHTML = h;
    const b = $('#modeBadge');
    b.className = 'mode ' + (S.mode || '');
    b.textContent = S.mode === 'sim' ? 'Simulate' : S.mode === 'host' ? 'Host' : 'preview';
  }
  function agendaHtml() {
    const c = S.cfg, total = c.plan.reduce((a, p) => a + p.sec, 0);
    return '<table class="rtable">' + c.plan.map(p => '<tr><td>' + esc(p.name) + '</td><td class="n">' + fmt(p.sec) + '</td></tr>').join('') +
      '<tr><th>Total</th><th class="n">' + fmt(total) + '</th></tr></table>';
  }
  function landing() {
    const c = S.cfg;
    stage('<div class="card hero"><div class="kicker">AI team-activity playtest · 7 players · 30 min · first-time teammates</div>' +
      '<h1>' + c.emoji + ' ' + esc(c.title) + '</h1><p class="lead">' + c.tagline + '</p>' +
      '<div class="cta"><button class="btn big pink" data-act="core:sim">▶ Simulate with synthetic players</button>' +
      '<button class="btn big ghost" data-act="core:host">🎤 Host mode: click through it yourself</button></div></div>' +
      '<div class="cols"><div class="card"><h3>How it plays</h3>' + c.how + '</div>' +
      '<div class="card"><h3>Planned agenda</h3>' + agendaHtml() + '</div>' +
      '<div class="card"><h3>What you’re evaluating</h3><ul class="tight">' + c.evaluating.map(e => '<li>' + e + '</li>').join('') + '</ul></div>' +
      '<div class="card"><h3>Synthetic cast</h3><div class="stack">' + PERSONAS.map(p => '<div>' + chip(p) + ' <small>' + p.tag + '</small></div>').join('') + '</div></div></div>');
    log(null, 'Ready. Pick Simulate or Host mode.', 'sys');
  }
  function setup() {
    stage('<div class="card"><h2>Who’s playing?</h2><p class="muted">Rename the seats to your real teammates, or keep the sample cast. The 🎲 buttons later fill in sample answers using these seats.</p>' +
      '<div class="namegrid">' + S.players.map((p, i) => '<label class="namefield" style="--pc:' + p.color + '"><span class="pe">' + p.emoji + '</span><input value="' + esc(p.name) + '" data-i="' + i + '" maxlength="18" aria-label="Player ' + (i + 1) + '"></label>').join('') + '</div>' +
      '<button class="btn big" data-act="core:go">Start the session →</button></div>');
  }

  function notesHtml() {
    const c = S.cfg;
    return '<div class="notes"><h3>📝 Facilitator notes</h3>' + c.notes + '<h4>What you’re evaluating</h4><ul class="tight">' + c.evaluating.map(e => '<li>' + e + '</li>').join('') + '</ul></div>';
  }

  // ---------- finish / report ----------
  function finish(resultHtml) {
    if (S.finished) return;
    closePhase(); S.finished = true; S.running = false; S.timer = null;
    S.waiters = [];
    log(null, '🏁 Session ended at ' + fmt(S.clock), 'phase');
    const rows = [];
    for (const p of S.phases) {
      let r = rows.find(x => x.name === p.name);
      if (!r) { r = { name: p.name, budget: 0, actual: 0, n: 0 }; rows.push(r); }
      r.budget += p.budget; r.actual += p.actual || 0; r.n++;
    }
    const target = S.cfg.target || 1800, total = S.clock, budget = rows.reduce((a, r) => a + r.budget, 0);
    const v = total <= target - 60 ? ['good', '✅ Fits in ' + fmt(target) + ' with ' + fmt(target - total) + ' to spare']
      : total <= target ? ['warn', '🟡 Fits, but with almost no buffer (' + fmt(target - total) + ' left)']
      : ['bad', '🔴 Over the ' + fmt(target) + ' slot by ' + fmt(total - target) + '. See the suggested cut below'];
    const maxv = Math.max(...rows.map(r => Math.max(r.actual, r.budget)), 1);
    const realSec = (Date.now() - S.realStart) / 1000;
    const leaks = rows.filter(r => r.actual > r.budget + 15).sort((a, b) => (b.actual - b.budget) - (a.actual - a.budget));
    stage((resultHtml || '') +
      '<div class="card"><h2>⏱ Pacing report</h2><div class="verdict ' + v[0] + '">' + v[1] + '</div>' +
      '<p class="muted">' + (S.mode === 'sim' ? 'Simulated ' + fmt(total) + ' of session time in ' + Math.round(realSec) + ' real seconds. ' : 'Real time measured while you hosted. ') +
      'Planned total: ' + fmt(budget) + '. Bars: actual (green, red if over), with the planned budget shown as a black tick.</p>' +
      '<table class="rtable"><tr><th>Phase</th><th>Planned</th><th>Actual</th><th style="width:38%"></th></tr>' +
      rows.map(r => '<tr><td>' + esc(r.name) + (r.n > 1 ? ' <small>×' + r.n + '</small>' : '') + '</td><td class="n">' + fmt(r.budget) + '</td><td class="n">' + fmt(r.actual) + '</td><td><div class="rbar"><i class="' + (r.actual > r.budget + 5 ? 'over' : '') + '" style="width:' + (r.actual / maxv * 100) + '%"></i><s style="left:' + (r.budget / maxv * 100) + '%"></s></div></td></tr>').join('') +
      '<tr><th>Total</th><th class="n">' + fmt(budget) + '</th><th class="n">' + fmt(total) + '</th><th></th></tr></table>' +
      (leaks.length ? '<p><b>Where time leaked:</b> ' + leaks.slice(0, 3).map(r => esc(r.name) + ' (+' + fmt(r.actual - r.budget) + ')').join(', ') + '</p>' : '<p><b>No phase ran meaningfully over budget.</b></p>') +
      '</div><div class="card tint">' + notesHtml() + '</div>' +
      '<div class="cta"><button class="btn big pink" data-act="core:sim">▶ Simulate again</button><button class="btn big ghost" data-act="core:host">🎤 Try Host mode</button><button class="btn big ghost" data-act="core:restart">↺ Back to start</button></div>');
    ctrls(); hud();
  }

  // ---------- modes ----------
  function reset(mode) {
    S.mode = mode; S.clock = 0; S.phase = null; S.phases = []; S.timer = null; S.finished = false; S.paused = false; S.boards = {};
    S.waiters = [];
    S.runId = (S.runId || 0) + 1;
    $('#log').innerHTML = ''; $('#stage').classList.toggle('simlock', mode === 'sim');
  }
  async function startSim() {
    reset('sim'); S.players = PERSONAS.map(p => ({ ...p }));
    S.running = true; S.realStart = Date.now(); ctrls();
    log(null, '▶ Simulation started with 7 synthetic players at ' + S.speed + '× speed', 'sys');
    const run = S.runId;
    try { await S.cfg.simulate(); } catch (e) { if (run === S.runId) { console.error(e); log(null, '⚠️ Simulation error: ' + e.message, 'sys'); } }
    if (run === S.runId && !S.finished) finish(S.cfg.summary ? S.cfg.summary() : '');
  }
  function startHost() { reset('host'); S.running = false; ctrls(); setup(); log(null, 'Host mode. Name the players, then start.', 'sys'); }

  document.addEventListener('click', e => {
    const el = e.target.closest('[data-act]'); if (!el) return;
    const a = el.dataset.act;
    if (a.indexOf('core:') === 0) {
      const k = a.slice(5);
      if (k === 'sim') startSim();
      else if (k === 'host') startHost();
      else if (k === 'go') {
        $$('.namefield input').forEach(inp => { const v = inp.value.trim(); if (v) S.players[+inp.dataset.i].name = v; });
        S.running = true; S.realStart = Date.now(); S.last = Date.now(); ctrls();
        log(null, '🎤 Session started: ' + S.players.map(p => p.name).join(', '), 'sys');
        S.cfg.host();
      }
      else if (k === 'pause') { S.paused = !S.paused; ctrls(); }
      else if (k === 'speed') { S.speed = +el.dataset.x; ctrls(); }
      else if (k === 'notes') { $('#notesBody').innerHTML = notesHtml() + '<p><button class="btn" data-act="core:closeNotes">Close</button></p>'; $('#notesDlg').showModal(); }
      else if (k === 'closeNotes') $('#notesDlg').close();
      else if (k === 'end') finish(S.cfg.summary ? S.cfg.summary() : '');
      else if (k === 'restart') { S.runId++; S.mode = null; S.running = false; S.finished = false; S.waiters = []; S.timer = null; S.phase = null; S.players = PERSONAS.map(p => ({ ...p })); $('#log').innerHTML = ''; $('#stage').classList.remove('simlock'); ctrls(); hud(); landing(); }
      else if (k === 'vote') { if (S.mode !== 'host') return; const b = S.boards[el.dataset.b]; if (b) b.cast(el.dataset.v, el.dataset.o, el.dataset.c); }
      return;
    }
    if (S.mode !== 'host') return;
    const fn = S.cfg.acts && S.cfg.acts[a];
    if (fn) { e.preventDefault(); fn(el.dataset, el, e); }
  });
  document.addEventListener('keydown', e => {
    if (e.key !== 'Enter' || e.shiftKey) return;
    const el = e.target.closest('[data-enter]'); if (!el || S.mode !== 'host') return;
    const fn = S.cfg.acts && S.cfg.acts[el.dataset.enter];
    if (fn) { e.preventDefault(); fn(el.dataset, el, e); }
  });

  // ---------- public API ----------
  window.Core = {
    game(cfg) { S.cfg = cfg; shell(); landing(); },
    get players() { return S.players; }, get mode() { return S.mode; }, get clock() { return S.clock; },
    get finished() { return S.finished; },
    PERSONAS, player, chip, script, stage, log, say, act, sys, wait, sleep, phase, timer, clearTimer, timerLeft, finish,
    genCard, generate, emojisFor, slotSentence, revealSlots, collectGrid, readGrid, markGrid, VoteBoard, simVotes, esc, rand, randi, pick, shuffle, sample, chance, fmt, derange, hash, $, $$,
    css(t) { const s = document.createElement('style'); s.textContent = t; document.head.appendChild(s); },
    /** Real-time pause in host mode, game-time wait in sim. */
    beat(sec, ms) { return S.mode === 'sim' ? wait(sec) : sleep(ms == null ? 600 : ms); },
  };
})();
