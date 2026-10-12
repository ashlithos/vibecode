// TITLE: 03 · Prompt Roulette: Prompt-DJ edition
(function () {
  const C = Core;
  const CATS = ['adjective', 'creature', 'material', 'activity (-ing)', 'place', 'art style'];
  const POOL = {
    adjective: ['majestic', 'soggy', 'haunted', 'tiny', 'furious', 'glamorous', 'confused', 'sparkly'],
    creature: ['goose', 'dragon', 'sloth', 'octopus', 'corgi', 'raccoon', 'unicorn', 'shark'],
    material: ['bubble wrap', 'cheese', 'stained glass', 'spaghetti', 'LEGO', 'velvet', 'ice', 'old receipts'],
    'activity (-ing)': ['doing taxes', 'breakdancing', 'giving a TED talk', 'knitting', 'crying softly', 'skateboarding', 'running a meeting', 'meditating'],
    place: ['the DMV', 'the moon', 'a Victorian ballroom', 'IKEA', 'a submarine', 'Times Square', 'a haunted Costco', 'the cloud'],
    'art style': ['Pixar', 'a Renaissance painting', 'a 90s infomercial', 'Studio Ghibli', 'a crayon drawing', 'film noir', 'claymation', 'a corporate stock photo'],
  };
  const TPL = ['A', 0, 1, 'made of', 2, ',', 3, 'at', 4, ', in the style of', 5];
  const DJ_STYLE = { maya: [3, 'Chaos it is.'], dev: [6, 'Hmm.'], priya: [5, 'Ooh, what if…'], leo: [3, 'Optimizing for maximum comedy.'], sam: [11, '…'], zoe: [4, 'Puns are not allowed in slots? Fine.'], omar: [8, 'Picture this…'] };
  const BANTER = ['Put the cheese in the art style slot!', 'No no no, swap those two.', 'DJ, you have the power. Use it wisely.', 'Make it cursed.', 'Oh this is going somewhere.', 'Do it. Do it.', 'I can’t watch.'];

  let st;
  const ROUNDS = 3;
  const fresh = () => ({ round: 0, djOrder: C.sample(C.players.map(p => p.id), ROUNDS), items: [], tray: [], slots: [null, null, null, null, null, null], sel: null, board: null, results: [], deadAir: 0 });
  const dj = () => C.player(st.djOrder[st.round - 1]);

  function sentence(withSlots) {
    return TPL.map(x => {
      if (typeof x === 'string') return '<span>' + C.esc(x) + '</span>';
      const w = st.slots[x];
      if (!withSlots) return w ? '<b class="aw">' + C.esc(w.word) + '</b>' : '<span class="blank">_____</span>';
      return '<span class="djslot' + (w ? ' full' : '') + '" data-act="slot" data-i="' + x + '" data-drop="' + x + '">' + (w ? C.esc(w.word) : 'slot ' + (x + 1)) + '</span>';
    }).join(' ');
  }
  const promptText = () => TPL.map(x => typeof x === 'string' ? x : st.slots[x] ? st.slots[x].word : '___').join(' ').replace(/ ,/g, ',');

  function collectScreen() {
    C.stage('<div class="card"><div class="kicker">Round ' + st.round + ' of ' + ROUNDS + ' · DJ: ' + C.esc(dj().name) + '</div><h2>Everyone except the DJ: one word each</h2>' +
      C.script(C.esc(dj().name) + ' is our Prompt DJ this round. Everyone else, drop one word in your category. The DJ decides where it goes. Your “place” might end up as the art style.') +
      C.collectGrid('grid', st.items, { fillAct: 'fill' }) + '<div class="cta"><button class="btn big pink" data-act="toDJ">🎧 Hand it to the DJ</button></div></div>');
  }
  function djScreen() {
    const host = C.mode === 'host';
    C.stage('<div class="dj"><div class="card"><div class="kicker">🎧 DJ console · ' + C.esc(dj().name) + '</div>' +
      '<p class="muted">' + (host ? 'Tap a word, then tap a slot (or drag). Tap a filled slot to send it back.' : 'The DJ is arranging…') + '</p>' +
      '<div class="tray">' + st.tray.map((w, i) => w.used ? '' : '<span class="djchip' + (st.sel === i ? ' sel' : '') + '" draggable="true" data-act="pickChip" data-i="' + i + '" data-drag="' + i + '" style="--pc:' + w.p.color + '">' + C.esc(w.word) + '<small>' + C.esc(w.p.name) + '</small></span>').join('') + '</div>' +
      '<div class="djtpl">' + sentence(true) + '</div>' +
      '<div class="cta"><button class="btn ghost" data-act="shuffle">🔀 Random arrangement</button><button class="btn big pink" data-act="gen"' + (st.slots.every(Boolean) ? '' : ' disabled') + '>✨ Drop the beat (generate)</button></div></div>' +
      '<div class="card audience"><div class="kicker">📺 Audience view</div><p class="big-text">' + sentence(false) + '</p></div></div>');
    if (host) wireDrag();
  }
  function wireDrag() {
    C.$$('[data-drag]').forEach(el => el.addEventListener('dragstart', e => e.dataTransfer.setData('text/plain', el.dataset.drag)));
    C.$$('[data-drop]').forEach(el => {
      el.addEventListener('dragover', e => e.preventDefault());
      el.addEventListener('drop', e => { e.preventDefault(); place(+e.dataTransfer.getData('text/plain'), +el.dataset.drop); djScreen(); });
    });
  }
  function place(ti, si) {
    const prev = st.slots[si]; if (prev) prev.used = false;
    st.slots[si] = st.tray[ti]; st.tray[ti].used = true; st.sel = null;
  }
  function revealScreen() {
    st.board = new C.VoteBoard({ title: 'This one is…', options: [{ id: 'funny', label: 'Funniest', emoji: '😂' }, { id: 'cursed', label: 'Most cursed', emoji: '💀' }, { id: 'beautiful', label: 'Most beautiful', emoji: '✨' }] });
    C.stage('<div class="cols"><div>' + C.genCard({ id: 'out', prompt: promptText(), title: 'DJ ' + dj().name + ' presents' }) + '</div>' +
      '<div class="card"><h3>Vote: what is it?</h3>' + st.board.html() + '<div class="cta">' + (st.round < ROUNDS ? '<button class="btn big" data-act="nextRound">Next DJ →</button>' : '<button class="btn big pink" data-act="awards">🏆 Awards</button>') + '</div></div></div>');
  }
  function awardsHtml() {
    const cats = [['funny', '😂 Funniest'], ['cursed', '💀 Most cursed'], ['beautiful', '✨ Most beautiful']];
    return '<div class="card"><h2>🏆 Awards</h2><div class="cols">' + cats.map(([k, l]) => {
      const best = st.results.slice().sort((a, b) => b.votes[k] - a.votes[k])[0];
      return best ? '<div><div class="kicker">' + l + '</div>' + C.genCard({ prompt: best.prompt, loading: false, title: 'DJ ' + best.dj.name + ' · ' + best.votes[k] + ' votes' }) + '</div>' : '';
    }).join('') + '</div>' + (C.mode === 'sim' ? '<p><b>Dead air measured:</b> ' + Math.round(st.deadAir) + 's of silence while DJs built prompts (' + Math.round(st.deadAir / ROUNDS) + 's per round).</p>' : '') + '</div>';
  }
  function saveResult() { st.results.push({ dj: dj(), prompt: promptText(), votes: { funny: st.board.count('main', 'funny'), cursed: st.board.count('main', 'cursed'), beautiful: st.board.count('main', 'beautiful') } }); }

  function newRound() {
    st.round++; st.slots = [null, null, null, null, null, null]; st.sel = null;
    const others = C.players.filter(p => p.id !== dj().id).slice(0, 6);
    st.items = others.map((p, i) => ({ p, cat: CATS[(i + st.round) % 6], word: '' }));
    C.phase('Collect words', 75); C.timer('Words in', 60); collectScreen();
  }
  const acts = {
    begin() { newRound(); },
    fill() { st.items.forEach(x => x.word = C.pick(POOL[x.cat])); collectScreen(); },
    toDJ() { C.readGrid('grid', st.items); st.items.forEach(x => { if (!x.word) x.word = C.pick(POOL[x.cat]); }); st.tray = C.shuffle(st.items.map(x => ({ ...x, used: false }))); C.clearTimer(); C.phase('DJ builds the prompt', 60); djScreen(); },
    pickChip(d) { st.sel = +d.i; djScreen(); },
    slot(d) { const i = +d.i; if (st.sel != null) place(st.sel, i); else if (st.slots[i]) { st.slots[i].used = false; st.slots[i] = null; } djScreen(); },
    shuffle() { st.tray.forEach(w => w.used = false); const order = C.shuffle(st.tray.map((_, i) => i)); order.forEach((ti, si) => place(ti, si)); djScreen(); },
    async gen() { C.phase('Generate, reveal & vote', 105); revealScreen(); await C.generate('out'); },
    nextRound() { saveResult(); newRound(); },
    awards() { saveResult(); C.phase('Awards & wrap', 120); C.stage(awardsHtml() + (C.mode === 'host' ? '<button class="btn big" data-act="end">🏁 Finish & pacing report</button>' : '')); },
    end() { C.finish(awardsHtml()); },
  };

  async function simulate() {
    st = fresh();
    C.phase('Intro & rules', 120);
    C.stage('<div class="card"><h2>🎧 Prompt DJ</h2>' + C.script('Everyone throws in a word. One person, the DJ, arranges them into a prompt live while we watch. Then we vote: funniest, most cursed or most beautiful.') + '</div>');
    await C.sys('Facilitator explains, shows the DJ console', 60); await C.say('zoe', 'So the DJ has all the power. Got it.', 8); await C.sys('First DJ picked', 20);
    for (let r = 1; r <= ROUNDS; r++) {
      newRound(); await C.wait(8);
      for (const k of C.shuffle([0, 1, 2, 3, 4, 5])) { await C.wait(C.rand(6, 13)); st.items[k].word = C.pick(POOL[st.items[k].cat]); C.markGrid('grid', st.items, k); await C.act(st.items[k].p, ' dropped a word (' + st.items[k].cat + ')', 1); }
      acts.toDJ();
      const d = dj(), [think, line] = DJ_STYLE[d.id];
      await C.say(d, line, 4);
      const order = C.shuffle([0, 1, 2, 3, 4, 5]);
      for (let si = 0; si < 6; si++) {
        const pause = think * C.rand(.6, 1.6);
        if (pause > 8) { st.deadAir += pause; await C.sys('…(' + Math.round(pause) + 's of silence while ' + d.name + ' thinks)', pause); }
        else await C.wait(pause);
        place(order[si], si); djScreen();
        await C.act(d, ' placed “' + st.slots[si].word + '” in slot ' + (si + 1), 1);
        if (C.chance(.45)) await C.say(C.pick(C.players.filter(p => p.id !== d.id)), C.pick(BANTER), 4);
      }
      if (C.chance(.5)) { const a = C.randi(0, 5), b = (a + 2) % 6; [st.slots[a], st.slots[b]] = [st.slots[b], st.slots[a]]; djScreen(); await C.act(d, ' swapped two slots at the last second 🔀', 4); }
      await acts.gen();
      await C.sys('Room reads the prompt aloud 😂', 8);
      await C.simVotes(st.board, () => C.pick(['funny', 'funny', 'cursed', 'cursed', 'beautiful']), { gap: 2 });
      await C.say(C.pick(C.players), C.pick(['That is objectively cursed.', 'I hate that I love it.', 'Gallery-worthy.', 'Who put “' + st.slots[2].word + '” there?!']), 10);
      await C.say(dj(), C.pick(['I regret nothing.', 'The art style slot was always going to be chaos.', 'Honestly I just went with my gut.']), 12);
      await C.sys('Laughter, people riff on the image', C.rand(40, 60));
      if (r < ROUNDS) saveResult();
    }
    acts.awards(); await C.sys('Awards read out', 45);
  }

  C.css('.dj{display:grid;grid-template-columns:minmax(0,1.3fr) minmax(0,1fr);gap:16px}@media(max-width:800px){.dj{grid-template-columns:1fr}}' +
    '.tray{display:flex;flex-wrap:wrap;gap:8px;min-height:56px;padding:10px;border:2px dashed var(--line);border-radius:14px}' +
    '.djchip{display:inline-flex;flex-direction:column;align-items:center;padding:8px 14px;border-radius:12px;background:color-mix(in srgb,var(--pc) 18%,var(--card));border:2px solid var(--pc);font-weight:750;cursor:grab;min-height:48px;user-select:none}.djchip small{font-weight:600;font-size:.65rem;color:var(--muted)}.djchip.sel{outline:3px solid var(--accent2);transform:scale(1.05)}' +
    '.djtpl{font-size:1.25rem;line-height:2.6;margin:14px 0}.djslot{display:inline-block;min-width:96px;text-align:center;padding:4px 12px;border:2px dashed var(--accent2);border-radius:12px;color:var(--muted);cursor:pointer;line-height:1.5}.djslot.full{border-style:solid;color:var(--ink);font-weight:800;background:var(--card2)}' +
    '.audience{background:var(--ink);color:var(--bg)}.audience .kicker{color:var(--accent)}.audience .blank{opacity:.35}.audience .aw{color:#ffd166;animation:pop .4s}');

  C.game({
    num: '03', title: 'Prompt Roulette: DJ Edition', emoji: '🎧',
    tagline: 'Like Exquisite Corpse, but one player is the Prompt DJ who arranges everyone’s words live, slot by slot, while the room watches. Then the room votes: funniest, most cursed, or most beautiful.',
    how: '<ol class="tight"><li>6 players drop a word each; the DJ sits out</li><li>DJ drags words into slots (any word, any slot)</li><li>Audience watches the prompt build on the big screen</li><li>Generate → 3-way vote</li><li>DJ rotates, 3 rounds, then awards</li></ol>',
    plan: [{ name: 'Intro & rules', sec: 120 }, { name: 'Collect words', sec: 225 }, { name: 'DJ builds the prompt', sec: 180 }, { name: 'Generate, reveal & vote', sec: 315 }, { name: 'Awards & wrap', sec: 120 }],
    evaluating: ['Is the DJ role fun to watch, or does it create dead air?', 'Does voting add energy?'],
    notes: '<p><b>Verdict: depends almost entirely on who DJs.</b> A fast, performative DJ (Leo, Maya) makes it the most watchable format in the set. A thoughtful or shy DJ (Sam, Omar) produces 10–20s silences per slot, and the room goes quiet.</p>' +
      '<h4>Dead air</h4><ul class="tight"><li>Shy DJs freeze because they feel watched. Let the DJ <b>narrate</b> (“and the cheese goes… in the art style”).</li><li>Add a 45s DJ shot clock. Pressure is funnier than silence.</li><li>Let the audience shout suggestions; the simulation shows banter fills gaps.</li><li><b>Don’t</b> make a first-time teammate DJ involuntarily. Ask for volunteers.</li></ul>' +
      '<h4>Does voting add energy?</h4><p>Yes. The 3-way vote is a fast, low-stakes reaction (about 30s), and the awards at the end give the three rounds a payoff. Keep it to one tap per person.</p>' +
      '<h4>Timing</h4><p>3 rounds is about 15–18 min. You can fit 5–6 DJs in 30 min, but not all 7, so tell people up front who will DJ.</p>' +
      '<div class="risk"><b>Facilitator risk note:</b> low-medium. The only real risk is spotlighting a shy person as DJ.</div>',
    host() {
      st = fresh(); C.phase('Intro & rules', 120);
      C.stage('<div class="card"><h2>🎧 Prompt DJ</h2>' + C.script('Everyone throws in a word. One person, the DJ, arranges them into a prompt live while we watch. Then we vote: funniest, most cursed or most beautiful.') +
        '<p>DJs this session: ' + st.djOrder.map(id => C.chip(id)).join(' ') + '</p><button class="btn big" data-act="begin">Round 1 →</button></div>');
    },
    simulate, acts, summary: () => st.results.length ? awardsHtml() : '',
  });
})();
