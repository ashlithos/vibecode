/* Motion Eye — app: routing, guess → reveal → lab flow, progress. */
(function () {
  'use strict';
  const E = window.MotionEngine, D = window.Demos;
  const { CHAPTERS, LESSONS, KNOBS, WORDS } = window.Curriculum;
  const KEY = 'motion-eye:v1';
  const REDUCED = (() => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } })();
  const INTERACTIVE = new Set(['dropdown', 'tabs', 'drawer', 'modal', 'palette', 'hover', 'list', 'accordion', 'press', 'loadbtn', 'like', 'toggle', 'checkbox', 'shake', 'remove', 'reorder', 'loader', 'consistency', 'interrupt', 'drag']);

  const $ = (s, r) => (r || document).querySelector(s);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const chOf = id => CHAPTERS.find(c => c.id === id);
  const chNum = id => CHAPTERS.findIndex(c => c.id === id) + 1;
  const pad = n => String(n).padStart(2, '0');

  /* ---------- persistence (per-viewer convenience only) ---------- */
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { saved = {}; }
  saved.results = saved.results || {};
  const persist = () => { try { localStorage.setItem(KEY, JSON.stringify(saved)); } catch (e) {} };

  /* which side holds the better version, randomised per visit */
  const sides = {};
  const goodSide = id => sides[id] || (sides[id] = Math.random() < 0.5 ? 'A' : 'B');

  const S = { lesson: null, guessed: false, choice: null, lab: false, labParams: null, showRef: false, slow: false, stages: {} };

  /* ---------- value formatting ---------- */
  function fmt(k, v) {
    const kd = KNOBS[k];
    if (v === undefined) return '—';
    if (k === 'ease' || k === 'exitEase') return E.easeLabel(v);
    if (typeof v === 'boolean') return v ? '开' : '关';
    if (kd && kd.type === 'range') {
      if (k === 'scale' || k === 'pressScale') return Number(v).toFixed(2);
      if (k === 'cap' && v >= 14) return '不限';
      return v + (kd.unit || '');
    }
    return WORDS[v] || String(v);
  }
  const params = (l, good) => Object.assign({}, l.base, good ? l.good : l.bad);

  /* ---------- rail (the outline) ---------- */
  function score() {
    const r = saved.results, ids = Object.keys(r).filter(id => LESSONS.some(l => l.id === id));
    return { answered: ids.length, hits: ids.filter(id => r[id] === 'hit').length };
  }
  function renderRail() {
    const sc = score();
    const cur = S.lesson && S.lesson.id;
    $('#rail').innerHTML = `
      <a class="rail-brand" href="#outline"><span class="brand-mark" aria-hidden="true"></span><span>Motion Eye<small>动效眼力</small></span></a>
      <div class="rail-score"><b>${sc.hits}</b><span>/ ${sc.answered} 答对 · 共 ${LESSONS.length} 组</span></div>
      <a class="rail-home${cur ? '' : ' is-on'}" href="#outline">大纲与方法</a>
      ${CHAPTERS.map((c, ci) => `<div class="rail-ch"><div class="rail-ch-h"><span>${ci + 1}</span>${c.name}<em>${c.en}</em></div>
        <ol>${LESSONS.map((l, i) => l.ch !== c.id ? '' : `<li><a href="#${l.id}" class="${l.id === cur ? 'is-on' : ''}">
          <span class="dot ${saved.results[l.id] || ''}" aria-label="${saved.results[l.id] === 'hit' ? '答对' : saved.results[l.id] === 'miss' ? '答错' : '未答'}"></span>
          <span class="rail-n">${pad(i + 1)}</span><span class="rail-t">${esc(l.title)}</span></a></li>`).join('')}</ol></div>`).join('')}`;
    $('#top-score').textContent = `${sc.hits}/${sc.answered}`;
    const on = $('#rail a.is-on');
    if (on && on.scrollIntoView && !$('#rail').matches(':hover')) on.scrollIntoView({ block: 'nearest' });
  }

  /* ---------- stages ---------- */
  function killStages() { Object.values(S.stages).forEach(s => s.ctx && s.ctx.kill()); S.stages = {}; }
  function sideParams(side) {
    const l = S.lesson, isGood = goodSide(l.id) === side;
    if (!isGood && S.lab && S.labParams) return S.labParams;
    return params(l, isGood);
  }
  function mount(side, play) {
    const l = S.lesson;
    const box = $(`.stage[data-side="${side}"] .stage-box`);
    if (!box) return;
    if (S.stages[side]) S.stages[side].ctx.kill();
    box.querySelectorAll('.demo').forEach(n => n.remove());
    const root = document.createElement('div');
    root.className = 'demo';
    box.appendChild(root);
    const ctx = E.ctx();
    const ctl = D[l.demo](root, sideParams(side), ctx);
    S.stages[side] = { ctx, ctl };
    if (play) ctl.play();
  }
  function playBoth() { mount('A', true); mount('B', true); }

  /* ---------- timing visualisation ---------- */
  function curveSVG(name, cls) {
    const e = E.ease(name), s = 60, x0 = 12, base = 84, top = base - s;
    let d = '';
    for (let i = 0; i <= 80; i++) { const t = i / 80; d += (i ? 'L' : 'M') + (x0 + t * s).toFixed(1) + ' ' + (base - e.fn(t) * s).toFixed(1); }
    const lx = 104, lw = 160, ly = 58;
    let ticks = '';
    for (let i = 0; i <= 12; i++) {
      const x = Math.max(lx - 6, Math.min(lx + lw + 14, lx + e.fn(i / 12) * lw));
      ticks += `<line x1="${x.toFixed(1)}" x2="${x.toFixed(1)}" y1="${ly - 8}" y2="${ly + 8}" class="tk${i === 0 || i === 12 ? ' tk-key' : ''}"/>`;
    }
    return `<svg class="tchart ${cls}" viewBox="0 0 284 100" role="img" aria-label="${esc(e.label)} 的速度曲线与间距图">
      <rect x="${x0}" y="${top}" width="${s}" height="${s}" class="tc-box"/>
      <line x1="${x0}" y1="${base}" x2="${x0 + s}" y2="${top}" class="tc-diag"/>
      <path d="${d}" class="tc-curve"/>
      <text x="${x0}" y="${base + 13}" class="tc-lab">时间 →</text>
      <line x1="${lx}" x2="${lx + lw}" y1="${ly}" y2="${ly}" class="tc-line"/>${ticks}
      <text x="${lx}" y="${ly - 16}" class="tc-lab">间距图 · 每格 = 1/12 时长</text>
      <text x="${lx}" y="${ly + 24}" class="tc-lab">起点</text><text x="${lx + lw}" y="${ly + 24}" class="tc-lab" text-anchor="end">终点</text>
    </svg>`;
  }
  function vizHTML(l) {
    const g = params(l, true), b = params(l, false);
    for (const k of ['ease', 'exitEase']) {
      if (g[k] && b[k] && g[k] !== b[k]) {
        return `<div class="viz"><div class="viz-h">看曲线：刻度越密的地方越慢，越疏越快</div><div class="viz-pair">
          <figure><figcaption><span class="mark good">✓</span>${esc(E.easeLabel(g[k]))}</figcaption>${curveSVG(g[k], 'is-good')}</figure>
          <figure><figcaption><span class="mark bad">×</span>${esc(E.easeLabel(b[k]))}</figcaption>${curveSVG(b[k], 'is-bad')}</figure></div></div>`;
      }
    }
    for (const k of ['dur', 'exitDur', 'stagger', 'latency', 'showAfter', 'minShow']) {
      if (g[k] != null && b[k] != null && g[k] !== b[k]) {
        const max = Math.max(g[k], b[k], 100) * 1.08;
        const bar = (v, cls, m) => `<div class="tbar ${cls}"><span class="mark ${cls}">${m}</span><div class="tbar-track"><i style="width:${(v / max * 100).toFixed(1)}%"></i></div><b>${v}ms</b></div>`;
        return `<div class="viz"><div class="viz-h">${esc(KNOBS[k].label)}对比 · 灰色刻度每格 100ms</div><div class="tbars" style="--grid:${(100 / max * 100).toFixed(2)}%">${bar(g[k], 'good', '✓')}${bar(b[k], 'bad', '×')}</div></div>`;
      }
    }
    return '';
  }
  function diffHTML(l) {
    const g = params(l, true), b = params(l, false);
    const keys = Array.from(new Set(Object.keys(l.good).concat(Object.keys(l.bad)))).filter(k => k !== 'set' && g[k] !== b[k]);
    if (!keys.length) return '';
    return `<div class="diff">${keys.map(k => `<span class="chip"><em>${esc(KNOBS[k] ? KNOBS[k].label : k)}</em><s>${esc(fmt(k, b[k]))}</s>→<b>${esc(fmt(k, g[k]))}</b></span>`).join('')}</div>`;
  }

  /* ---------- lab (fix the weaker side) ---------- */
  function knobOptions(l, k) {
    const kd = KNOBS[k];
    if (kd.type === 'ease') return E.EASE_KEYS;
    const fromLesson = [l.bad[k], l.good[k], l.base[k]].filter(v => v !== undefined);
    return Array.from(new Set((kd.options || []).concat(fromLesson)));
  }
  function labHTML(l) {
    if (!l.knobs.length) return `<section class="lab"><p class="lab-empty">这一组没有可调参数：它考的是整体判断。回想一下你自己的产品里，有没有"各写各的"动效？</p></section>`;
    const g = params(l, true), p = S.labParams;
    const row = k => {
      const kd = KNOBS[k], id = 'knob-' + k, ref = S.showRef ? `<span class="ref">参考 ${esc(fmt(k, g[k]))}</span>` : '';
      let ctl;
      if (kd.type === 'range') ctl = `<input type="range" id="${id}" data-k="${k}" min="${kd.min}" max="${kd.max}" step="${kd.step}" value="${p[k] != null ? p[k] : kd.min}">`;
      else if (kd.type === 'bool') ctl = `<label class="sw-ctl"><input type="checkbox" id="${id}" data-k="${k}" ${p[k] ? 'checked' : ''}><span></span>${p[k] ? '开' : '关'}</label>`;
      else ctl = `<select id="${id}" data-k="${k}">${knobOptions(l, k).map(o => `<option value="${esc(o)}" ${String(p[k]) === String(o) ? 'selected' : ''}>${esc(fmt(k, o))}</option>`).join('')}</select>`;
      return `<div class="knob"><div class="knob-h"><label for="${id}">${esc(kd.label)} <em>${esc(kd.en)}</em></label><output id="out-${k}">${esc(fmt(k, p[k]))}</output>${ref}</div>${ctl}</div>`;
    };
    return `<section class="lab"><div class="lab-h"><div><b>调参台</b><span>× 那一边现在是"你的版本"。把它调到你觉得对，再和 ✓ 对比。</span></div>
      <div class="lab-actions"><label class="sw-ctl"><input type="checkbox" id="lab-ref" ${S.showRef ? 'checked' : ''}><span></span>显示参考值</label>
      <button class="btn-ghost" id="lab-reset">重置</button><button class="btn-ghost" id="lab-both">一起播放</button></div></div>
      <div class="knobs">${l.knobs.map(row).join('')}</div></section>`;
  }
  function bindLab() {
    const l = S.lesson;
    document.querySelectorAll('.lab [data-k]').forEach(inp => {
      const k = inp.dataset.k, kd = KNOBS[k];
      const ev = kd.type === 'range' ? 'input' : 'change';
      let t = 0;
      inp.addEventListener(ev, () => {
        let v;
        if (kd.type === 'range') v = Number(inp.value);
        else if (kd.type === 'bool') { v = inp.checked; inp.parentNode.lastChild.textContent = v ? '开' : '关'; }
        else v = inp.value;
        S.labParams[k] = v;
        $('#out-' + k).textContent = fmt(k, v);
        clearTimeout(t);
        t = setTimeout(() => mount(goodSide(l.id) === 'A' ? 'B' : 'A', true), kd.type === 'range' ? 220 : 0);
      });
    });
    const ref = $('#lab-ref');
    if (ref) ref.addEventListener('change', () => { S.showRef = ref.checked; refreshLab(); });
    const reset = $('#lab-reset');
    if (reset) reset.addEventListener('click', () => { S.labParams = params(l, false); refreshLab(); mount(goodSide(l.id) === 'A' ? 'B' : 'A', true); });
    const both = $('#lab-both');
    if (both) both.addEventListener('click', playBoth);
  }
  function refreshLab() { const slot = $('#lab-slot'); if (!slot) return; slot.innerHTML = labHTML(S.lesson); bindLab(); }

  /* ---------- lesson view ---------- */
  function captions() {
    const l = S.lesson, gs = goodSide(l.id);
    ['A', 'B'].forEach(side => {
      const cap = $(`.stage[data-side="${side}"] .cap`), tag = $(`.stage[data-side="${side}"] .stage-tag`);
      if (!S.guessed) { cap.innerHTML = ''; tag.textContent = side; return; }
      const good = side === gs;
      cap.innerHTML = `<span class="mark ${good ? 'good' : 'bad'}">${good ? '✓' : '×'}</span><code>${esc(good ? l.gl : l.bl)}</code>`;
      tag.textContent = !good && S.lab ? side + ' · 你的版本' : side;
    });
  }
  function renderLesson(l) {
    killStages();
    S.lesson = l; S.guessed = false; S.choice = null; S.lab = false; S.labParams = null; S.showRef = false;
    const i = LESSONS.indexOf(l), ch = chOf(l.ch), prev = LESSONS[i - 1], next = LESSONS[i + 1];
    document.title = `${l.title} · Motion Eye`;
    $('#main').innerHTML = `<article class="lv">
      <header class="lv-head"><div class="eyebrow"><span>第 ${chNum(l.ch)} 章 · ${ch.name} ${ch.en}</span><span class="num">${pad(i + 1)} / ${LESSONS.length}</span></div>
        <h1>${esc(l.q)}</h1></header>
      <div class="duel">${['A', 'B'].map(s => `<figure class="stage" data-side="${s}"><div class="stage-box"><span class="stage-tag">${s}</span></div><figcaption class="cap"></figcaption></figure>`).join('')}</div>
      <div class="controls">
        <button class="btn" id="replay"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M13 8a5 5 0 1 1-1.5-3.5M13 2.5V5h-2.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>重播<kbd>R</kbd></button>
        <button class="btn${S.slow ? ' is-on' : ''}" id="slow" aria-pressed="${S.slow}">慢放 ×4<kbd>S</kbd></button>
        <span class="hint">${INTERACTIVE.has(l.demo) ? '两边都可以直接点、拖、hover 试试。' : ''}${REDUCED ? ' 你开启了"减弱动态效果"，demo 不会自动播放，点"重播"观看。' : ''}</span>
      </div>
      <div id="guess-slot"></div>
      <nav class="lv-nav">${prev ? `<a href="#${prev.id}"><span>← 上一组</span>${esc(prev.title)}</a>` : '<span></span>'}${next ? `<a href="#${next.id}" class="next"><span>下一组 →</span>${esc(next.title)}</a>` : `<a href="#outline" class="next"><span>完成 →</span>回到大纲</a>`}</nav>
    </article>`;
    $('#replay').addEventListener('click', playBoth);
    $('#slow').addEventListener('click', toggleSlow);
    renderGuess();
    if (REDUCED) { mount('A', false); mount('B', false); } else playBoth();
    window.scrollTo(0, 0);
    renderRail();
    closeRail();
  }
  function renderGuess() {
    const l = S.lesson, slot = $('#guess-slot');
    captions();
    if (!S.guessed) {
      slot.innerHTML = `<div class="guess"><span>哪个更好？先凭直觉选，再看原因。</span>
        <div class="guess-btns"><button class="btn-pick" data-pick="A">A 更好<kbd>A</kbd></button><button class="btn-pick" data-pick="B">B 更好<kbd>B</kbd></button></div>
        <button class="link" id="skip">直接看答案</button></div>`;
      slot.querySelectorAll('[data-pick]').forEach(b => b.addEventListener('click', () => pick(b.dataset.pick)));
      $('#skip').addEventListener('click', () => pick(null));
      return;
    }
    const gs = goodSide(l.id), hit = S.choice === gs, ch = chOf(l.ch);
    const verdict = S.choice == null ? `<div class="verdict"><b>答案：${gs} 更好</b></div>`
      : `<div class="verdict ${hit ? 'is-hit' : 'is-miss'}"><b>${hit ? '眼光不错，' + gs + ' 更好' : '这次看走眼了：' + gs + ' 更好'}</b><span>${hit ? '能说出为什么吗？先在心里说一遍，再往下看。' : '开慢放再看一遍，找找区别在哪一帧。'}</span></div>`;
    slot.innerHTML = `<section class="reveal">${verdict}
      <div class="reveal-grid"><div class="reveal-text"><p class="why">${esc(l.why)}</p><p class="rule"><span>经验法则</span>${esc(l.rule)}</p>${diffHTML(l)}</div>${vizHTML(l)}</div>
      <div class="reveal-actions">${l.knobs.length ? '<button class="btn" id="open-lab">修好它 · 打开调参台</button>' : ''}
        ${ch.quote && ch.quote[1] ? `<blockquote>“${esc(ch.quote[0])}”<cite>${esc(ch.quote[1])}</cite></blockquote>` : ''}</div>
      <div id="lab-slot"></div></section>`;
    const ol = $('#open-lab');
    if (ol) ol.addEventListener('click', () => {
      S.lab = !S.lab;
      ol.textContent = S.lab ? '关闭调参台' : '修好它 · 打开调参台';
      if (S.lab) { S.labParams = params(l, false); refreshLab(); } else { $('#lab-slot').innerHTML = ''; S.labParams = null; }
      captions();
      mount(gs === 'A' ? 'B' : 'A', true);
    });
  }
  function pick(choice) {
    const l = S.lesson;
    S.guessed = true; S.choice = choice;
    if (choice && !saved.results[l.id]) { saved.results[l.id] = choice === goodSide(l.id) ? 'hit' : 'miss'; saved.last = l.id; persist(); }
    renderGuess();
    renderRail();
  }
  function toggleSlow() {
    S.slow = !S.slow; E.speed = S.slow ? 4 : 1;
    const b = $('#slow'); if (b) { b.classList.toggle('is-on', S.slow); b.setAttribute('aria-pressed', S.slow); }
    if (S.lesson) playBoth();
  }

  /* ---------- outline (home) ---------- */
  function renderHome() {
    killStages(); S.lesson = null;
    document.title = 'Motion Eye';
    const resume = LESSONS.find(l => !saved.results[l.id]) || LESSONS[0];
    const sc = score();
    $('#main').innerHTML = `<article class="home">
      <header class="hero"><p class="eyebrow">动效眼力训练 · ${LESSONS.length} 组 A/B 对比 · Web / SaaS</p>
        <h1>一眼看出哪个动效更好，<br>并且说得出为什么。</h1>
        <p class="lede">每一组都是同一个组件的两个版本，只差一两个参数。先凭直觉选，再看原因、看曲线，最后亲手把差的那一版调好。</p>
        <div class="hero-cta"><a class="btn btn-primary" href="#${resume.id}">${sc.answered ? '继续训练' : '开始第一组'} →</a>
          <span class="muted">${sc.answered ? `已完成 ${sc.answered} 组，答对 ${sc.hits} 组` : '大约 2 分钟一组，每次练一章最合适'}</span></div>
        <div class="hero-demo" aria-hidden="true">${['out-quint', 'ease-in', 'linear'].map(n => `<div class="hd-row"><code>${E.easeLabel(n)}</code><div class="hd-track"><i data-ease="${n}"></i></div></div>`).join('')}</div>
      </header>

      <section class="block"><h2>怎么练</h2><p class="block-sub">刻意练习（Anders Ericsson）的关键是：即时反馈 + 刚好够不着的难度 + 反复。每一组都按这个循环走。</p>
        <ol class="loop">
          <li><b>猜</b><span>不分析，先凭第一感觉选。直觉就是你现在的眼光。</span></li>
          <li><b>慢放</b><span>按 S 用 ×4 慢放，找出差异发生在哪一帧。</span></li>
          <li><b>说出来</b><span>用一句话讲出原因，比如"起步太慢，像没反应"。能说出来，才能在评审时用上。</span></li>
          <li><b>修好它</b><span>在调参台把差的一版调到你满意，再对比参考值。</span></li>
        </ol></section>

      <section class="block"><h2>看任何动效的 6 个问题</h2><p class="block-sub">在产品里、在别人的作品里，遇到任何动效都可以用这 6 个问题过一遍。它们对应下面的章节。</p>
        <div class="qs">
          ${[['目的', '它在解释什么？位置、关系、状态变化？还是纯装饰？', '克制'],
             ['曲线', '进场在减速吗？屏幕内移动有加速和减速吗？', '缓动'],
             ['时长', '和移动距离、元素大小、使用频率相称吗？', '时长'],
             ['空间', '它从原因处出现吗？方向符合布局吗？', '空间'],
             ['顺序', '眼睛知道先看哪里吗？有没有人在排队？', '编排'],
             ['手感', '按下有反应吗？可以打断吗？松手后像物理世界吗？', '反馈 · 物理']].map((q, i) =>
            `<div class="q"><span class="q-n">${i + 1}</span><b>${q[0]}</b><p>${q[1]}</p><em>${q[2]}</em></div>`).join('')}
        </div></section>

      <section class="block"><h2>大纲</h2><p class="block-sub">九章，由浅入深。前三章是"参数"，中间三章是"关系"，最后三章是"判断"。</p>
        <div class="chapters">${CHAPTERS.map((c, ci) => {
          const ls = LESSONS.filter(l => l.ch === c.id);
          const done = ls.filter(l => saved.results[l.id]).length;
          return `<section class="chap"><div class="chap-h"><span class="chap-n">${ci + 1}</span><div><h3>${c.name} <em>${c.en}</em></h3><p class="chap-sub">${c.sub}</p></div><span class="chap-prog">${done}/${ls.length}</span></div>
            <p class="chap-desc">${esc(c.desc)}</p>
            <ol class="chap-list">${ls.map(l => `<li><a href="#${l.id}"><span class="dot ${saved.results[l.id] || ''}"></span><span class="rail-n">${pad(LESSONS.indexOf(l) + 1)}</span>${esc(l.title)}</a></li>`).join('')}</ol></section>`;
        }).join('')}</div></section>

      <section class="block"><h2>速查表</h2><p class="block-sub">起步用的默认值。练熟之后你会知道什么时候该打破它们。</p>
        <div class="sheet-wrap"><table class="sheet"><thead><tr><th>场景</th><th>时长</th><th>曲线</th><th>备注</th></tr></thead><tbody>
          <tr><td>hover、focus、按下</td><td>100–150ms</td><td>ease-out</td><td>按下缩放 0.95–0.98</td></tr>
          <tr><td>tooltip、下拉菜单、popover</td><td>150–250ms</td><td><code>cubic-bezier(.23,1,.32,1)</code></td><td>从 scale 0.95 + 透明度开始，origin 指向触发点</td></tr>
          <tr><td>对话框、抽屉、侧边栏</td><td>250–400ms</td><td>同上</td><td>位移 4–16px；贴边的从边滑入</td></tr>
          <tr><td>屏幕内移动、指示器、换位</td><td>250–450ms</td><td><code>cubic-bezier(.77,0,.175,1)</code></td><td>ease-in-out</td></tr>
          <tr><td>离场</td><td>进场的 60–75%</td><td>ease-out，或短 ease-in</td><td>多个元素一起离开</td></tr>
          <tr><td>列表错峰</td><td>每项 20–50ms</td><td>—</td><td>总和不超过约 300ms，设上限</td></tr>
          <tr><td>手势结束</td><td>由物理决定</td><td>spring，接近临界阻尼</td><td>可打断，继承速度</td></tr>
          <tr><td>循环（spinner、跑马灯）</td><td>—</td><td>linear</td><td>加载指示器延迟 ~300ms 再出现</td></tr>
        </tbody></table></div></section>

      <section class="block"><h2>继续看更多例子</h2><p class="block-sub">练完这里，就去真实产品里"拆"动效。这些是高质量的参考来源。</p>
        <ul class="links">
          <li><a href="https://animations.dev" target="_blank" rel="noopener">animations.dev</a><span>Emil Kowalski 的动效课程，Web 交互动效最系统的资料之一</span></li>
          <li><a href="https://rauno.me/craft/interaction-design" target="_blank" rel="noopener">Invisible Details of Interaction Design</a><span>Rauno Freiberg 拆解交互里看不见的细节</span></li>
          <li><a href="https://m3.material.io/styles/motion/overview" target="_blank" rel="noopener">Material 3 · Motion</a><span>时长与曲线的完整 token 体系</span></li>
          <li><a href="https://developer.apple.com/videos/play/wwdc2018/803/" target="_blank" rel="noopener">WWDC18 · Designing Fluid Interfaces</a><span>手势、速度、可打断性</span></li>
          <li><a href="https://easings.net" target="_blank" rel="noopener">easings.net</a><span>常见曲线可视化速查</span></li>
        </ul>
        ${sc.answered ? '<button class="link" id="reset-progress">清空我的答题记录</button><span class="reset-confirm" hidden> 确定清空？ <button class="link" id="reset-yes">清空</button> <button class="link" id="reset-no">取消</button></span>' : ''}
      </section></article>`;
    heroDemo();
    const rp = $('#reset-progress');
    if (rp) {
      rp.addEventListener('click', () => { rp.hidden = true; $('.reset-confirm').hidden = false; });
      $('#reset-no').addEventListener('click', () => { rp.hidden = false; $('.reset-confirm').hidden = true; });
      $('#reset-yes').addEventListener('click', () => { saved = { results: {} }; persist(); renderHome(); renderRail(); });
    }
    window.scrollTo(0, 0);
    renderRail();
    closeRail();
  }
  let heroCtx = null;
  function heroDemo() {
    if (heroCtx) heroCtx.kill();
    heroCtx = E.ctx();
    if (REDUCED) return;
    const ctx = heroCtx;
    const run = () => {
      document.querySelectorAll('.hd-track i').forEach(i => {
        const w = i.parentNode.clientWidth - i.offsetWidth;
        ctx.anim(i, [{ transform: 'translateX(0)' }, { transform: `translateX(${w}px)` }], { dur: 900, ease: i.dataset.ease });
      });
      ctx.after(2000, run);
    };
    ctx.after(400, run);
  }

  /* ---------- routing ---------- */
  function route() {
    const id = location.hash.slice(1);
    const l = LESSONS.find(x => x.id === id);
    if (heroCtx && l) { heroCtx.kill(); heroCtx = null; }
    if (l) renderLesson(l);
    else renderHome();
  }

  /* ---------- mobile outline sheet ---------- */
  function openRail() { document.body.classList.add('rail-open'); }
  function closeRail() { document.body.classList.remove('rail-open'); }
  $('#rail-toggle').addEventListener('click', () => document.body.classList.contains('rail-open') ? closeRail() : openRail());
  $('.rail-scrim').addEventListener('click', closeRail);

  /* ---------- keyboard ---------- */
  document.addEventListener('keydown', e => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const tag = (e.target.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'select' || tag === 'textarea') return;
    const k = e.key.toLowerCase();
    if (k === 'escape') return closeRail();
    if (!S.lesson) return;
    const i = LESSONS.indexOf(S.lesson);
    if (k === 'r') playBoth();
    else if (k === 's') toggleSlow();
    else if ((k === 'a' || k === 'b') && !S.guessed) pick(k.toUpperCase());
    else if (k === 'arrowright' && LESSONS[i + 1]) location.hash = LESSONS[i + 1].id;
    else if (k === 'arrowleft' && LESSONS[i - 1]) location.hash = LESSONS[i - 1].id;
  });

  window.addEventListener('hashchange', route);
  route();
})();
