/* Motion Eye — app: routing, language, guess → reveal → lab flow, progress. */
(function () {
  'use strict';
  const E = window.MotionEngine, D = window.Demos;
  const { CHAPTERS, LESSONS, KNOBS, WORDS } = window.Curriculum;
  const EN = window.CurriculumEN;
  const KEY = 'motion-eye:v1';
  const REDUCED = (() => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } })();
  const INTERACTIVE = new Set(['tooltip', 'morph', 'iconSwap', 'flick', 'dropdown', 'tabs', 'drawer', 'modal', 'palette', 'hover', 'list', 'accordion', 'press', 'loadbtn', 'like', 'toggle', 'checkbox', 'shake', 'remove', 'reorder', 'loader', 'consistency', 'interrupt', 'drag']);
  /* how long each demo's sequence runs, so "A then B" knows when to start B (logical ms) */
  const SEQ = { dropdown: 1400, tabs: 3400, spinner: 2600, drawer: 1600, modal: 1400, palette: 3000, hover: 3700, toast: 3000, list: 1500, accordion: 2700,
    press: 2400, loadbtn: 3200, like: 1700, toggle: 3000, checkbox: 2300, shake: 1500, remove: 2800, reorder: 3200, counter: 5000, skeleton: 2400,
    progress: 4600, dashboard: 1900, bell: 2600, cardIn: 1500, consistency: 3500, search: 2200, interrupt: 2100, drag: 2200, tooltip: 3700,
    morph: 3500, iconSwap: 3300, flick: 3600 };
  const seqGap = l => {
    const p = Object.assign({}, l.base, l.good);
    if (l.demo === 'loader') return (p.latency || 0) < 1000 ? 3000 : 900 + (p.latency || 0);
    if (l.demo === 'progress') return 1100 + (p.total || 3200);
    if ((l.demo === 'dropdown' || l.demo === 'drawer') && p.close) return SEQ[l.demo] + 1500;
    if (l.demo === 'list' && p.phase === 'exit') return 1700;
    return SEQ[l.demo] || 2500;
  };

  /* ---------- language ---------- */
  let lang = 'zh';
  try { lang = localStorage.getItem('motion-eye:lang') === 'en' ? 'en' : 'zh'; } catch (e) {}
  const T = {
    zh: {
      brand: '动效眼力', answered: (h, a, n) => `/ ${a} 答对 · 共 ${n} 组`, home: '大纲与方法', outline: '大纲',
      ch: n => `第 ${n} 章`, adv: '进阶', replay: '重播', slow: '慢放 ×4', seq: '轮流播放 A → B', look: '看哪里？',
      tryIt: '两边都可以直接点、拖、hover 试试。', reduced: '你开启了"减弱动态效果"，demo 不会自动播放，点"重播"观看。',
      ask: '哪个更好？先凭直觉选，再看原因。', pickA: 'A 更好', pickB: 'B 更好', skip: '直接看答案',
      answer: s => `答案：${s} 更好`, hit: s => `眼光不错，${s} 更好`, miss: s => `这次看走眼了：${s} 更好`,
      hitSub: '能说出为什么吗？先在心里说一遍，再往下看。', missSub: '试试"轮流播放"或慢放，按提示盯住那一刻再看一遍。',
      rule: '经验法则', srcH: '出处 · 已核对原文', srcNone: '出处', consensus: '行业共识：没有找到单一的权威出处，来自顶尖产品的普遍做法和动画原理。', gist: '大意：',
      curveH: '看曲线：刻度越密的地方越慢，越疏越快', barH: k => `${k}对比 · 灰色刻度每格 100ms`, time: '时间 →', spacing: '间距图 · 每格 = 1/12 时长', start: '起点', end: '终点',
      openLab: '修好它 · 打开调参台', closeLab: '关闭调参台', labTitle: '调参台', labSub: '× 那一边现在是"你的版本"。把它调到你觉得对，再和 ✓ 对比。',
      showRef: '显示参考值', reset: '重置', both: '一起播放', ref: v => `参考 ${v}`, yours: '你的版本', labEmpty: '这一组没有可调参数：它考的是整体判断。回想一下你自己的产品里，有没有"各写各的"动效？',
      prev: '← 上一组', next: '下一组 →', done: '完成 →', backHome: '回到大纲', on: '开', off: '关', noCap: '不限'
    },
    en: {
      brand: 'Motion Eye', answered: (h, a, n) => `/ ${a} correct · ${n} pairs`, home: 'Outline & method', outline: 'Outline',
      ch: n => `Chapter ${n}`, adv: 'Advanced', replay: 'Replay', slow: 'Slow-mo ×4', seq: 'Play A, then B', look: 'Where to look?',
      tryIt: 'Both sides are live: click, drag or hover.', reduced: 'Reduce Motion is on, so demos don\'t autoplay. Press Replay to watch.',
      ask: 'Which is better? Go with your gut first, then read why.', pickA: 'A is better', pickB: 'B is better', skip: 'Just show me',
      answer: s => `Answer: ${s} is better`, hit: s => `Good eye, ${s} is better`, miss: s => `Missed this one: ${s} is better`,
      hitSub: 'Can you say why? Say it to yourself before reading on.', missSub: 'Try "Play A, then B" or slow-mo, and watch the moment the hint points to.',
      rule: 'Rule of thumb', srcH: 'Sources · checked against the original', srcNone: 'Source', consensus: 'Industry consensus: no single authoritative source found; this comes from common practice in top products and animation principles.', gist: 'Gist: ',
      curveH: 'Read the curve: dense ticks = slow, sparse ticks = fast', barH: k => `${k} · grey ticks every 100ms`, time: 'time →', spacing: 'spacing chart · each tick = 1/12 of the duration', start: 'start', end: 'end',
      openLab: 'Fix it · open the lab', closeLab: 'Close the lab', labTitle: 'Lab', labSub: 'The × side is now "your version". Tune it until it feels right, then compare with ✓.',
      showRef: 'Show reference', reset: 'Reset', both: 'Play both', ref: v => `ref ${v}`, yours: 'yours', labEmpty: 'Nothing to tune here: this one is about overall judgement. Does your own product have motion that was "tuned separately"?',
      prev: '← Previous', next: 'Next →', done: 'Done →', backHome: 'Back to outline', on: 'on', off: 'off', noCap: 'no cap'
    }
  };
  const t = k => T[lang][k];
  const lt = (l, f) => (lang === 'en' && EN.L[l.id] && EN.L[l.id][f]) || l[{ t: 'title' }[f] || f];
  const ct = (c, f) => (lang === 'en' ? EN.CH[c.id][f] : c[f]);
  const word = v => (lang === 'en' ? EN.WORDS[v] : WORDS[v]) || String(v);

  const $ = (s, r) => (r || document).querySelector(s);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const chOf = id => CHAPTERS.find(c => c.id === id);
  const chNum = id => CHAPTERS.findIndex(c => c.id === id) + 1;
  const pad = n => String(n).padStart(2, '0');
  const badge = l => (l.level === 'adv' ? `<span class="lvl lvl-adv">${t('adv')}</span>` : '');

  /* ---------- persistence (per-viewer convenience only) ---------- */
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { saved = {}; }
  saved.results = saved.results || {};
  const persist = () => { try { localStorage.setItem(KEY, JSON.stringify(saved)); } catch (e) {} };

  const sides = {};
  const goodSide = id => sides[id] || (sides[id] = Math.random() < 0.5 ? 'A' : 'B');
  const S = { lesson: null, guessed: false, choice: null, lab: false, labParams: null, showRef: false, slow: false, look: false, stages: {}, seqT: 0 };

  function fmt(k, v) {
    const kd = KNOBS[k];
    if (v === undefined) return '—';
    if (k === 'ease' || k === 'exitEase') return E.easeLabel(v, lang);
    if (typeof v === 'boolean') return v ? t('on') : t('off');
    if (kd && kd.type === 'range') {
      if (k === 'scale' || k === 'pressScale' || k === 'cdelay') return Number(v).toFixed(2);
      if (k === 'cap' && v >= 14) return t('noCap');
      return v + (lang === 'en' ? (kd.unit || '').trim() === 'ms' || (kd.unit || '').trim() === 'px' ? kd.unit : '' : (kd.unit || ''));
    }
    return word(v);
  }
  const knobLabel = k => (lang === 'en' ? KNOBS[k].en : KNOBS[k].label);
  const params = (l, good) => Object.assign({}, l.base, good ? l.good : l.bad);

  /* ---------- rail ---------- */
  function score() {
    const r = saved.results, ids = Object.keys(r).filter(id => LESSONS.some(l => l.id === id));
    return { answered: ids.length, hits: ids.filter(id => r[id] === 'hit').length };
  }
  function langSwitch() {
    return `<div class="lang" role="group" aria-label="Language"><button data-lang="zh" class="${lang === 'zh' ? 'is-on' : ''}" aria-pressed="${lang === 'zh'}">中文</button><button data-lang="en" class="${lang === 'en' ? 'is-on' : ''}" aria-pressed="${lang === 'en'}">EN</button></div>`;
  }
  function renderRail() {
    const sc = score(), cur = S.lesson && S.lesson.id;
    $('#rail').innerHTML = `
      <div class="rail-top"><a class="rail-brand" href="#outline"><span class="brand-mark" aria-hidden="true"></span><span>Motion Eye<small>${lang === 'en' ? 'Train your eye for motion' : '动效眼力'}</small></span></a>${langSwitch()}</div>
      <div class="rail-score"><b>${sc.hits}</b><span>${T[lang].answered(sc.hits, sc.answered, LESSONS.length)}</span></div>
      <a class="rail-home${cur ? '' : ' is-on'}" href="#outline">${t('home')}</a>
      ${CHAPTERS.map((c, ci) => `<div class="rail-ch"><div class="rail-ch-h"><span>${ci + 1}</span>${lang === 'en' ? ct(c, 'name') : c.name}${lang === 'en' ? '' : `<em>${c.en}</em>`}</div>
        <ol>${LESSONS.map((l, i) => l.ch !== c.id ? '' : `<li><a href="#${l.id}" class="${l.id === cur ? 'is-on' : ''}">
          <span class="dot ${saved.results[l.id] || ''}"></span><span class="rail-n">${pad(i + 1)}</span><span class="rail-t">${esc(lt(l, 't'))}</span>${badge(l)}</a></li>`).join('')}</ol></div>`).join('')}`;
    $('#top-score').textContent = `${sc.hits}/${sc.answered}`;
    $('#top-lang').innerHTML = langSwitch();
    $('#rail-toggle').textContent = t('outline');
    document.documentElement.lang = lang === 'en' ? 'en' : 'zh-CN';
    const on = $('#rail a.is-on');
    if (on && on.scrollIntoView && !$('#rail').matches(':hover')) on.scrollIntoView({ block: 'nearest' });
  }
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-lang]');
    if (!b || b.dataset.lang === lang) return;
    lang = b.dataset.lang;
    try { localStorage.setItem('motion-eye:lang', lang); } catch (err) {}
    if (S.lesson) { const keep = { guessed: S.guessed, choice: S.choice }; renderLesson(S.lesson, keep); } else renderHome();
  });

  /* ---------- stages ---------- */
  function killStages() { clearTimeout(S.seqT); Object.values(S.stages).forEach(s => s.ctx && s.ctx.kill()); S.stages = {}; }
  function sideParams(side) {
    const l = S.lesson, isGood = goodSide(l.id) === side;
    if (!isGood && S.lab && S.labParams) return S.labParams;
    return params(l, isGood);
  }
  function mount(side, play) {
    const l = S.lesson, box = $(`.stage[data-side="${side}"] .stage-box`);
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
  function setActive(side) { document.querySelectorAll('.stage').forEach(s => s.classList.toggle('is-active', s.dataset.side === side)); }
  function playBoth() { clearTimeout(S.seqT); setActive(null); mount('A', true); mount('B', true); }
  function playSeq() {
    clearTimeout(S.seqT);
    mount('A', true); mount('B', false); setActive('A');
    S.seqT = setTimeout(() => { mount('B', true); setActive('B'); S.seqT = setTimeout(() => setActive(null), seqGap(S.lesson) * E.speed); }, seqGap(S.lesson) * E.speed);
  }

  /* ---------- timing visualisation ---------- */
  function curveSVG(name, cls) {
    const e = E.ease(name), s = 60, x0 = 12, base = 84, top = base - s;
    let d = '';
    for (let i = 0; i <= 80; i++) { const x = i / 80; d += (i ? 'L' : 'M') + (x0 + x * s).toFixed(1) + ' ' + (base - e.fn(x) * s).toFixed(1); }
    const lx = 104, lw = 160, ly = 58;
    let ticks = '';
    for (let i = 0; i <= 12; i++) {
      const x = Math.max(lx - 6, Math.min(lx + lw + 14, lx + e.fn(i / 12) * lw));
      ticks += `<line x1="${x.toFixed(1)}" x2="${x.toFixed(1)}" y1="${ly - 8}" y2="${ly + 8}" class="tk${i === 0 || i === 12 ? ' tk-key' : ''}"/>`;
    }
    return `<svg class="tchart ${cls}" viewBox="0 0 284 100" role="img" aria-label="${esc(E.easeLabel(name, lang))}">
      <rect x="${x0}" y="${top}" width="${s}" height="${s}" class="tc-box"/><line x1="${x0}" y1="${base}" x2="${x0 + s}" y2="${top}" class="tc-diag"/>
      <path d="${d}" class="tc-curve"/><text x="${x0}" y="${base + 13}" class="tc-lab">${t('time')}</text>
      <line x1="${lx}" x2="${lx + lw}" y1="${ly}" y2="${ly}" class="tc-line"/>${ticks}
      <text x="${lx}" y="${ly - 16}" class="tc-lab">${t('spacing')}</text>
      <text x="${lx}" y="${ly + 24}" class="tc-lab">${t('start')}</text><text x="${lx + lw}" y="${ly + 24}" class="tc-lab" text-anchor="end">${t('end')}</text></svg>`;
  }
  function vizHTML(l) {
    const g = params(l, true), b = params(l, false);
    for (const k of ['ease', 'exitEase']) {
      if (g[k] && b[k] && g[k] !== b[k]) {
        return `<div class="viz"><div class="viz-h">${t('curveH')}</div><div class="viz-pair">
          <figure><figcaption><span class="mark good">✓</span>${esc(E.easeLabel(g[k], lang))}</figcaption>${curveSVG(g[k], 'is-good')}</figure>
          <figure><figcaption><span class="mark bad">×</span>${esc(E.easeLabel(b[k], lang))}</figcaption>${curveSVG(b[k], 'is-bad')}</figure></div></div>`;
      }
    }
    for (const k of ['dur', 'exitDur', 'stagger', 'latency', 'showAfter', 'minShow']) {
      if (g[k] != null && b[k] != null && g[k] !== b[k]) {
        const max = Math.max(g[k], b[k], 100) * 1.08;
        const bar = (v, cls, m) => `<div class="tbar ${cls}"><span class="mark ${cls}">${m}</span><div class="tbar-track"><i style="width:${(v / max * 100).toFixed(1)}%"></i></div><b>${v}ms</b></div>`;
        return `<div class="viz"><div class="viz-h">${esc(T[lang].barH(knobLabel(k)))}</div><div class="tbars" style="--grid:${(100 / max * 100).toFixed(2)}%">${bar(g[k], 'good', '✓')}${bar(b[k], 'bad', '×')}</div></div>`;
      }
    }
    return '';
  }
  function diffHTML(l) {
    const g = params(l, true), b = params(l, false);
    const keys = Array.from(new Set(Object.keys(l.good).concat(Object.keys(l.bad)))).filter(k => k !== 'set' && g[k] !== b[k]);
    if (!keys.length) return '';
    return `<div class="diff">${keys.map(k => `<span class="chip"><em>${esc(KNOBS[k] ? knobLabel(k) : k)}</em><s>${esc(fmt(k, b[k]))}</s>→<b>${esc(fmt(k, g[k]))}</b></span>`).join('')}</div>`;
  }
  function srcHTML(l) {
    if (!l.src.length) return `<div class="srcs"><div class="srcs-h">${t('srcNone')}</div><p class="src-none">${t('consensus')}</p></div>`;
    const enP = (EN.L[l.id] && EN.L[l.id].p) || [];
    let pi = 0;
    return `<div class="srcs"><div class="srcs-h">${t('srcH')}</div>${l.src.map(s => {
      const body = s.kind === 'q' ? `<q lang="en">${esc(s.text)}</q>` : `<span class="src-p">${t('gist')}${esc(lang === 'en' && enP[pi] ? enP[pi] : s.text)}</span>`;
      if (s.kind !== 'q') pi++;
      return `<div class="src"><a href="${s.src.url}" target="_blank" rel="noopener">${esc(s.src.name)}</a>${body}</div>`;
    }).join('')}</div>`;
  }

  /* ---------- lab ---------- */
  function knobOptions(l, k) {
    const kd = KNOBS[k];
    if (kd.type === 'ease') return E.EASE_KEYS;
    const fromLesson = [l.bad[k], l.good[k], l.base[k]].filter(v => v !== undefined);
    return Array.from(new Set((kd.options || []).concat(fromLesson)));
  }
  function labHTML(l) {
    if (!l.knobs.length) return `<section class="lab"><p class="lab-empty">${t('labEmpty')}</p></section>`;
    const g = params(l, true), p = S.labParams;
    const row = k => {
      const kd = KNOBS[k], id = 'knob-' + k, ref = S.showRef ? `<span class="ref">${esc(T[lang].ref(fmt(k, g[k])))}</span>` : '';
      let ctl;
      if (kd.type === 'range') ctl = `<input type="range" id="${id}" data-k="${k}" min="${kd.min}" max="${kd.max}" step="${kd.step}" value="${p[k] != null ? p[k] : kd.min}">`;
      else if (kd.type === 'bool') ctl = `<label class="sw-ctl"><input type="checkbox" id="${id}" data-k="${k}" ${p[k] ? 'checked' : ''}><span></span>${p[k] ? t('on') : t('off')}</label>`;
      else ctl = `<select id="${id}" data-k="${k}">${knobOptions(l, k).map(o => `<option value="${esc(o)}" ${String(p[k]) === String(o) ? 'selected' : ''}>${esc(fmt(k, o))}</option>`).join('')}</select>`;
      return `<div class="knob"><div class="knob-h"><label for="${id}">${esc(knobLabel(k))}${lang === 'en' ? '' : ` <em>${esc(kd.en)}</em>`}</label><output id="out-${k}">${esc(fmt(k, p[k]))}</output>${ref}</div>${ctl}</div>`;
    };
    return `<section class="lab"><div class="lab-h"><div><b>${t('labTitle')}</b><span>${t('labSub')}</span></div>
      <div class="lab-actions"><label class="sw-ctl"><input type="checkbox" id="lab-ref" ${S.showRef ? 'checked' : ''}><span></span>${t('showRef')}</label>
      <button class="btn-ghost" id="lab-reset">${t('reset')}</button><button class="btn-ghost" id="lab-both">${t('both')}</button></div></div>
      <div class="knobs">${l.knobs.map(row).join('')}</div></section>`;
  }
  const badSide = () => (goodSide(S.lesson.id) === 'A' ? 'B' : 'A');
  function bindLab() {
    document.querySelectorAll('.lab [data-k]').forEach(inp => {
      const k = inp.dataset.k, kd = KNOBS[k];
      let tm = 0;
      inp.addEventListener(kd.type === 'range' ? 'input' : 'change', () => {
        let v;
        if (kd.type === 'range') v = Number(inp.value);
        else if (kd.type === 'bool') { v = inp.checked; inp.parentNode.lastChild.textContent = v ? t('on') : t('off'); }
        else v = inp.value;
        S.labParams[k] = v;
        $('#out-' + k).textContent = fmt(k, v);
        clearTimeout(tm);
        tm = setTimeout(() => mount(badSide(), true), kd.type === 'range' ? 220 : 0);
      });
    });
    const ref = $('#lab-ref');
    if (ref) ref.addEventListener('change', () => { S.showRef = ref.checked; refreshLab(); });
    const reset = $('#lab-reset');
    if (reset) reset.addEventListener('click', () => { S.labParams = params(S.lesson, false); refreshLab(); mount(badSide(), true); });
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
      cap.innerHTML = `<span class="mark ${good ? 'good' : 'bad'}">${good ? '✓' : '×'}</span><code>${esc(lt(l, good ? 'gl' : 'bl'))}</code>`;
      tag.textContent = !good && S.lab ? side + ' · ' + t('yours') : side;
    });
  }
  function lookHTML(l) {
    const h = EN.L[l.id] && EN.L[l.id].look;
    if (!h) return '';
    return `<div class="look${S.look ? ' is-open' : ''}"><button class="link" id="look-btn" aria-expanded="${S.look}">${t('look')}</button><span class="look-txt"${S.look ? '' : ' hidden'}>${esc(lang === 'en' ? h[1] : h[0])}</span></div>`;
  }
  function renderLesson(l, keep) {
    killStages();
    const same = keep && S.lesson === l;
    S.lesson = l; S.guessed = same ? keep.guessed : false; S.choice = same ? keep.choice : null; S.lab = false; S.labParams = null; S.showRef = false;
    if (!same) S.look = false;
    const i = LESSONS.indexOf(l), ch = chOf(l.ch), prev = LESSONS[i - 1], next = LESSONS[i + 1];
    document.title = `${lt(l, 't')} · Motion Eye`;
    $('#main').innerHTML = `<article class="lv">
      <header class="lv-head"><div class="eyebrow"><span>${T[lang].ch(chNum(l.ch))} · ${lang === 'en' ? ct(ch, 'name') : ch.name + ' ' + ch.en}</span><span class="num">${badge(l)}${pad(i + 1)} / ${LESSONS.length}</span></div>
        <h1>${esc(lt(l, 'q'))}</h1></header>
      <div class="duel">${['A', 'B'].map(s => `<figure class="stage" data-side="${s}"><div class="stage-box"><span class="stage-tag">${s}</span></div><figcaption class="cap"></figcaption></figure>`).join('')}</div>
      <div class="controls">
        <button class="btn" id="replay"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M13 8a5 5 0 1 1-1.5-3.5M13 2.5V5h-2.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>${t('replay')}<kbd>R</kbd></button>
        <button class="btn" id="seq">${t('seq')}<kbd>Q</kbd></button>
        <button class="btn${S.slow ? ' is-on' : ''}" id="slow" aria-pressed="${S.slow}">${t('slow')}<kbd>S</kbd></button>
        <span class="hint">${INTERACTIVE.has(l.demo) ? t('tryIt') : ''}${REDUCED ? ' ' + t('reduced') : ''}</span>
      </div>
      ${lookHTML(l)}
      <div id="guess-slot"></div>
      <nav class="lv-nav">${prev ? `<a href="#${prev.id}"><span>${t('prev')}</span>${esc(lt(prev, 't'))}</a>` : '<span></span>'}${next ? `<a href="#${next.id}" class="next"><span>${t('next')}</span>${esc(lt(next, 't'))}</a>` : `<a href="#outline" class="next"><span>${t('done')}</span>${t('backHome')}</a>`}</nav>
    </article>`;
    $('#replay').addEventListener('click', playBoth);
    $('#seq').addEventListener('click', playSeq);
    $('#slow').addEventListener('click', toggleSlow);
    const lb = $('#look-btn');
    if (lb) lb.addEventListener('click', () => { S.look = !S.look; lb.setAttribute('aria-expanded', S.look); $('.look-txt').hidden = !S.look; $('.look').classList.toggle('is-open', S.look); });
    renderGuess();
    if (REDUCED) { mount('A', false); mount('B', false); } else playBoth();
    if (!same) window.scrollTo(0, 0);
    renderRail();
    closeRail();
  }
  function renderGuess() {
    const l = S.lesson, slot = $('#guess-slot');
    captions();
    if (!S.guessed) {
      slot.innerHTML = `<div class="guess"><span>${t('ask')}</span>
        <div class="guess-btns"><button class="btn-pick" data-pick="A">${t('pickA')}<kbd>A</kbd></button><button class="btn-pick" data-pick="B">${t('pickB')}<kbd>B</kbd></button></div>
        <button class="link" id="skip">${t('skip')}</button></div>`;
      slot.querySelectorAll('[data-pick]').forEach(b => b.addEventListener('click', () => pick(b.dataset.pick)));
      $('#skip').addEventListener('click', () => pick(null));
      return;
    }
    const gs = goodSide(l.id), hit = S.choice === gs, ch = chOf(l.ch);
    const verdict = S.choice == null ? `<div class="verdict"><b>${T[lang].answer(gs)}</b></div>`
      : `<div class="verdict ${hit ? 'is-hit' : 'is-miss'}"><b>${hit ? T[lang].hit(gs) : T[lang].miss(gs)}</b><span>${hit ? t('hitSub') : t('missSub')}</span></div>`;
    const q = lang === 'en' ? EN.CH[ch.id].quote : ch.quote;
    slot.innerHTML = `<section class="reveal">${verdict}
      <div class="reveal-grid"><div class="reveal-text"><p class="why">${esc(lt(l, 'why'))}</p><p class="rule"><span>${t('rule')}</span>${esc(lt(l, 'rule'))}</p>${diffHTML(l)}${srcHTML(l)}</div>${vizHTML(l)}</div>
      <div class="reveal-actions">${l.knobs.length ? `<button class="btn" id="open-lab">${t('openLab')}</button>` : ''}
        ${q && q[1] ? `<blockquote>“${esc(q[0])}”<cite>${esc(q[1])}</cite></blockquote>` : ''}</div>
      <div id="lab-slot"></div></section>`;
    const ol = $('#open-lab');
    if (ol) ol.addEventListener('click', () => {
      S.lab = !S.lab;
      ol.textContent = S.lab ? t('closeLab') : t('openLab');
      if (S.lab) { S.labParams = params(l, false); refreshLab(); } else { $('#lab-slot').innerHTML = ''; S.labParams = null; }
      captions();
      mount(badSide(), true);
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

  /* ---------- home ---------- */
  const HOME = {
    zh: {
      eyebrow: n => `动效眼力训练 · ${n} 组 A/B 对比 · Web / SaaS · 出处已核对`,
      h1: '一眼看出哪个动效更好，<br>并且说得出为什么。',
      lede: '每一组都是同一个组件的两个版本，只差一两个参数。先凭直觉选，再看原因、看曲线，最后亲手把差的那一版调好。',
      cta: a => (a ? '继续训练' : '开始第一组'), ctaSub: (a, h) => (a ? `已完成 ${a} 组，答对 ${h} 组` : '大约 2 分钟一组，每次练一章最合适'),
      howH: '怎么练', howSub: '眼光是练出来的。认知心理学叫它"知觉学习"：专家和新手的区别，是专家知道该看哪里。每一组都按这个循环走。',
      steps: [['猜', '先凭第一感觉选。看不出来很正常，选错也有用。'], ['看哪里', '点"看哪里？"，知道该盯住哪一刻。'], ['轮流 + 慢放', '按 Q 先看 A 再看 B，按 S 用 ×4 慢放。'], ['修好它', '用一句话说出原因，再在调参台把差的一版调好。']],
      qsH: '看任何动效的 6 个问题', qsSub: '在产品里、在别人的作品里，遇到任何动效都可以用这 6 个问题过一遍。它们对应下面的章节。',
      qs: [['目的', '它在解释什么？位置、关系、状态变化？还是纯装饰？', '克制'], ['曲线', '进场在减速吗？屏幕内移动有加速和减速吗？', '缓动'], ['时长', '和移动距离、元素大小、使用频率相称吗？', '时长'], ['空间', '它从原因处出现吗？方向符合布局吗？', '空间'], ['顺序', '眼睛知道先看哪里吗？有没有人在排队？', '编排'], ['手感', '按下有反应吗？可以打断吗？松手后像物理世界吗？', '反馈 · 物理']],
      olH: '大纲', olSub: (b, a) => `九章，由浅入深：前三章是"参数"，中间三章是"关系"，最后三章是"判断"。${b} 组基础 + ${a} 组进阶技法。`,
      sheetH: '速查表', sheetSub: '起步用的默认值，数字已对照原文核实（2026 年 11 月）。练熟之后你会知道什么时候该打破它们。',
      th: ['场景', '时长', '曲线', '备注'],
      rows: [['hover、focus、按下', '~100ms', 'ease-out', '按下 scale(0.97)（Emil）；简单反馈约 100ms（NN/g）'], ['tooltip', '125ms', 'ease-out', '从 scale(0.97) 开始；首次延迟，预热后瞬间、无动画（Emil）'], ['下拉菜单、popover', '150–250ms', '<code>cubic-bezier(.23,1,.32,1)</code>', 'UI 动画一般不超过 300ms；从 0.9 以上缩放，origin 指向触发点（Emil）'], ['选择控件（开关、复选框）', '200ms', 'M3 standard <code>(.2,0,0,1)</code>', 'Material 3 规格'], ['对话框、抽屉', '250–400ms', '进场 M3 decelerate <code>(.05,.7,.1,1)</code>', '面积越大时长越长（M3 medium 250–400ms）'], ['卡片展开到全屏', '~500ms', 'M3 emphasized', 'M3 long 450–600ms'], ['永久离场', '~200ms', 'M3 accelerate <code>(.3,0,.8,.15)</code>', '暂时离场用 emphasized，停在屏幕外（M3）'], ['原地消失（菜单关闭）', '进场的 ~70%', 'ease-out', '离场比进场短（M3、NN/g）'], ['键盘触发的操作', '0', '—', '不做动画（Emil）'], ['手势结束', '不用时长描述', 'spring：先 100% 阻尼', '继承速度、用速度预测落点（WWDC18）'], ['列表错峰', '每项 20–50ms', '—', '总和约 300ms 内，设上限（行业共识）'], ['循环（spinner）', '—', 'linear', '加载指示器延迟 ~300ms 再出现（行业共识）']],
      moreH: '继续看更多例子', moreSub: '练完这里，就去真实产品里"拆"动效。这些是本页引用过的原始来源。',
      links: [['animations.dev', 'Emil Kowalski 的动效课程'], ['7 Practical Animation Tips', 'Emil Kowalski，本页多处引用'], ['Material 3 · Easing and duration', '时长与曲线 token'], ['Apple HIG · Motion', 'Apple 的动效准则'], ['WWDC18 · Designing Fluid Interfaces', '手势、速度、可打断性'], ['NN/g · Animation duration', '时长研究综述']],
      note: '关于出处：每一课揭晓后都有"出处"栏。标"已核对原文"的，引文直接摘自原页面（2026 年 11 月核对）；标"行业共识"的，没有找到单一权威来源，来自顶尖产品的普遍做法和动画原理。几处来源之间有分歧（比如离场用不用 ease-in），课里都写明了。另外，Material 3 Expressive 已把组件动效迁移到 spring 物理系统，曲线 + 时长体系仍用于转场，但官方已不再维护。',
      reset: '清空我的答题记录', sure: '确定清空？', yes: '清空', no: '取消'
    },
    en: {
      eyebrow: n => `Train your eye for motion · ${n} A/B pairs · Web / SaaS · sources checked`,
      h1: 'Spot the better animation at a glance,<br>and say why.',
      lede: 'Each pair is the same component twice, one or two parameters apart. Pick on instinct, read why, study the curve, then fix the weaker version yourself.',
      cta: a => (a ? 'Continue' : 'Start the first pair'), ctaSub: (a, h) => (a ? `${a} done, ${h} correct` : 'About 2 minutes per pair; one chapter per session works well'),
      howH: 'How to train', howSub: 'A good eye is trained, not born. Cognitive psychology calls it perceptual learning: experts differ from beginners mainly in knowing where to look. Each pair runs this loop.',
      steps: [['Guess', 'Pick on first instinct. Not seeing a difference is normal, and wrong guesses still teach.'], ['Where to look', 'Tap "Where to look?" to learn which moment to watch.'], ['Take turns + slow-mo', 'Press Q to watch A, then B. Press S for ×4 slow motion.'], ['Fix it', 'Say the reason in one sentence, then tune the weaker version in the lab.']],
      qsH: '6 questions for any animation', qsSub: 'Use these six questions on any motion you meet, in products or other people\'s work. They map to the chapters below.',
      qs: [['Purpose', 'What is it explaining: position, relationship, change of state? Or is it decoration?', 'Restraint'], ['Curve', 'Do entrances decelerate? Do on-screen moves speed up and slow down?', 'Easing'], ['Duration', 'Does it fit the distance, size and frequency?', 'Duration'], ['Space', 'Does it come from its cause? Does direction match the layout?', 'Space'], ['Order', 'Does the eye know where to look first? Is anything queuing?', 'Choreography'], ['Feel', 'Does a press respond? Can it be interrupted? Does release feel physical?', 'Feedback · Physics']],
      olH: 'Outline', olSub: (b, a) => `Nine chapters, easy to hard: the first three are parameters, the middle three relationships, the last three judgement. ${b} core pairs + ${a} advanced techniques.`,
      sheetH: 'Cheat sheet', sheetSub: 'Starting defaults, numbers checked against the original sources (November 2026). With practice you\'ll know when to break them.',
      th: ['Situation', 'Duration', 'Curve', 'Notes'],
      rows: [['Hover, focus, press', '~100ms', 'ease-out', 'Press scale(0.97) (Emil); simple feedback ~100ms (NN/g)'], ['Tooltip', '125ms', 'ease-out', 'Start at scale(0.97); delay the first, then instant with no animation (Emil)'], ['Dropdown, popover', '150–250ms', '<code>cubic-bezier(.23,1,.32,1)</code>', 'UI animations generally under 300ms; scale from 0.9+, origin at the trigger (Emil)'], ['Selection controls', '200ms', 'M3 standard <code>(.2,0,0,1)</code>', 'Material 3 spec'], ['Dialog, drawer', '250–400ms', 'enter: M3 decelerate <code>(.05,.7,.1,1)</code>', 'Larger area, longer duration (M3 medium 250–400ms)'], ['Card to full screen', '~500ms', 'M3 emphasized', 'M3 long 450–600ms'], ['Permanent exit', '~200ms', 'M3 accelerate <code>(.3,0,.8,.15)</code>', 'Temporary exits use emphasized and rest off screen (M3)'], ['Disappear in place (menu close)', '~70% of enter', 'ease-out', 'Exits shorter than entrances (M3, NN/g)'], ['Keyboard-initiated actions', '0', '—', 'Don\'t animate (Emil)'], ['End of a gesture', 'not described by duration', 'spring: start at 100% damping', 'Carry velocity, project the landing point (WWDC18)'], ['List stagger', '20–50ms per item', '—', 'Total within ~300ms, with a cap (consensus)'], ['Loops (spinner)', '—', 'linear', 'Show loading indicators after ~300ms (consensus)']],
      moreH: 'Keep looking at examples', moreSub: 'After this, go take apart motion in real products. These are the original sources cited on this page.',
      links: [['animations.dev', 'Emil Kowalski\'s animation course'], ['7 Practical Animation Tips', 'Emil Kowalski, cited throughout'], ['Material 3 · Easing and duration', 'Duration and easing tokens'], ['Apple HIG · Motion', 'Apple\'s motion guidelines'], ['WWDC18 · Designing Fluid Interfaces', 'Gestures, velocity, interruptibility'], ['NN/g · Animation duration', 'Research summary on duration']],
      note: 'About sources: every lesson has a Sources panel after the reveal. "Checked against the original" means the quote was copied from the source page (checked November 2026); "Industry consensus" means no single authoritative source was found, and the rule comes from common practice and animation principles. Where sources disagree (for example, ease-in on exit), the lesson says so. Also note that Material 3 Expressive has moved component motion to a spring physics system; the easing-and-duration system is still used for transitions but is no longer maintained.',
      reset: 'Clear my answers', sure: 'Clear everything?', yes: 'Clear', no: 'Cancel'
    }
  };
  const LINK_URLS = ['https://animations.dev', 'https://emilkowal.ski/ui/7-practical-animation-tips', 'https://m3.material.io/styles/motion/easing-and-duration/applying-easing-and-duration', 'https://developer.apple.com/design/human-interface-guidelines/motion', 'https://developer.apple.com/videos/play/wwdc2018/803/', 'https://www.nngroup.com/articles/animation-duration/'];

  function renderHome() {
    killStages(); S.lesson = null;
    document.title = 'Motion Eye';
    const H = HOME[lang];
    const resume = LESSONS.find(l => !saved.results[l.id]) || LESSONS[0];
    const sc = score();
    $('#main').innerHTML = `<article class="home">
      <header class="hero"><p class="eyebrow">${H.eyebrow(LESSONS.length)}</p><h1>${H.h1}</h1><p class="lede">${H.lede}</p>
        <div class="hero-cta"><a class="btn btn-primary" href="#${resume.id}">${H.cta(sc.answered)} →</a><span class="muted">${H.ctaSub(sc.answered, sc.hits)}</span></div>
        <div class="hero-demo" aria-hidden="true">${['out-quint', 'ease-in', 'linear'].map(n => `<div class="hd-row"><code>${E.easeLabel(n, lang)}</code><div class="hd-track"><i data-ease="${n}"></i></div></div>`).join('')}</div>
      </header>
      <section class="block"><h2>${H.howH}</h2><p class="block-sub">${H.howSub}</p>
        <ol class="loop">${H.steps.map(s => `<li><b>${s[0]}</b><span>${s[1]}</span></li>`).join('')}</ol></section>
      <section class="block"><h2>${H.qsH}</h2><p class="block-sub">${H.qsSub}</p>
        <div class="qs">${H.qs.map((q, i) => `<div class="q"><span class="q-n">${i + 1}</span><b>${q[0]}</b><p>${q[1]}</p><em>${q[2]}</em></div>`).join('')}</div></section>
      <section class="block"><h2>${H.olH}</h2><p class="block-sub">${H.olSub(LESSONS.filter(l => l.level !== 'adv').length, LESSONS.filter(l => l.level === 'adv').length)}</p>
        <div class="chapters">${CHAPTERS.map((c, ci) => {
          const ls = LESSONS.filter(l => l.ch === c.id), done = ls.filter(l => saved.results[l.id]).length;
          return `<section class="chap"><div class="chap-h"><span class="chap-n">${ci + 1}</span><div><h3>${lang === 'en' ? ct(c, 'name') : c.name + ` <em>${c.en}</em>`}</h3><p class="chap-sub">${esc(ct(c, 'sub'))}</p></div><span class="chap-prog">${done}/${ls.length}</span></div>
            <p class="chap-desc">${esc(ct(c, 'desc'))}</p>
            <ol class="chap-list">${ls.map(l => `<li><a href="#${l.id}"><span class="dot ${saved.results[l.id] || ''}"></span><span class="rail-n">${pad(LESSONS.indexOf(l) + 1)}</span>${esc(lt(l, 't'))}${badge(l)}</a></li>`).join('')}</ol></section>`;
        }).join('')}</div></section>
      <section class="block"><h2>${H.sheetH}</h2><p class="block-sub">${H.sheetSub}</p>
        <div class="sheet-wrap"><table class="sheet"><thead><tr>${H.th.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${H.rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div></section>
      <section class="block"><h2>${H.moreH}</h2><p class="block-sub">${H.moreSub}</p>
        <ul class="links">${H.links.map((k, i) => `<li><a href="${LINK_URLS[i]}" target="_blank" rel="noopener">${k[0]}</a><span>${k[1]}</span></li>`).join('')}</ul>
        <p class="note">${H.note}</p>
        ${sc.answered ? `<div><button class="link" id="reset-progress">${H.reset}</button><span class="reset-confirm" hidden> ${H.sure} <button class="link" id="reset-yes">${H.yes}</button> <button class="link" id="reset-no">${H.no}</button></span></div>` : ''}
      </section></article>`;
    heroDemo();
    const rp = $('#reset-progress');
    if (rp) {
      rp.addEventListener('click', () => { rp.hidden = true; $('.reset-confirm').hidden = false; });
      $('#reset-no').addEventListener('click', () => { rp.hidden = false; $('.reset-confirm').hidden = true; });
      $('#reset-yes').addEventListener('click', () => { saved = { results: {} }; persist(); renderHome(); });
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
    const l = LESSONS.find(x => x.id === location.hash.slice(1));
    if (heroCtx && l) { heroCtx.kill(); heroCtx = null; }
    if (l) renderLesson(l); else renderHome();
  }
  function openRail() { document.body.classList.add('rail-open'); }
  function closeRail() { document.body.classList.remove('rail-open'); }
  $('#rail-toggle').addEventListener('click', () => (document.body.classList.contains('rail-open') ? closeRail() : openRail()));
  $('.rail-scrim').addEventListener('click', closeRail);

  document.addEventListener('keydown', e => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const tag = (e.target.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'select' || tag === 'textarea') return;
    const k = e.key.toLowerCase();
    if (k === 'escape') return closeRail();
    if (!S.lesson) return;
    const i = LESSONS.indexOf(S.lesson);
    if (k === 'r') playBoth();
    else if (k === 'q') playSeq();
    else if (k === 's') toggleSlow();
    else if ((k === 'a' || k === 'b') && !S.guessed) pick(k.toUpperCase());
    else if (k === 'arrowright' && LESSONS[i + 1]) location.hash = LESSONS[i + 1].id;
    else if (k === 'arrowleft' && LESSONS[i - 1]) location.hash = LESSONS[i - 1].id;
  });

  window.addEventListener('hashchange', route);
  route();
})();
