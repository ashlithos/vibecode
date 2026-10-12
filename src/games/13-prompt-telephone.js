// TITLE: 13 · Prompt Telephone
(function () {
  const C = Core;
  // Scripted drift for the simulation: each link describes only the previous image.
  const CHAINS = [
    ['A corgi wearing a tiny crown, ruling over a kingdom of sandwiches', 'A small orange dog in a gold hat sitting on a pile of bread', 'A fox napping on a bakery shelf with a golden halo', 'A saintly fox guarding loaves of bread in an old church', 'A monk fox blessing baguettes in a candlelit cathedral', 'A religious ceremony for French bread, led by a red-robed animal', 'A cult of baguettes worshipping a giant croissant at sunset'],
    ['Our new team high-fiving on top of a mountain at sunrise', 'Seven people celebrating on a snowy peak in morning light', 'Mountain climbers waving at a helicopter in the snow', 'A rescue helicopter dropping hot cocoa onto a snowy hilltop', 'Hot chocolate raining from the sky over a ski resort', 'A chocolate blizzard burying a ski lodge, the guests delighted', 'A giant made of chocolate stomping through a winter village'],
  ];
  const LINES = { maya: 'Okay I see… a vibe. I’m going with it.', dev: 'Describing exactly what I see. Nothing more.', priya: 'Aww, I think it’s cozy? Writing cozy.', leo: 'Adding detail for maximum accuracy.', sam: '…hm.', zoe: 'I’m taking creative liberties.', omar: 'There’s clearly a story here.' };
  const STOP = new Set('a an the of on in at with over onto into and by for to its their our new'.split(' '));
  const words = s => new Set(s.toLowerCase().replace(/[^a-z ]/g, '').split(' ').filter(w => w && !STOP.has(w)));
  function drift(a, b) { const A = words(a), B = words(b); const inter = [...A].filter(x => B.has(x)).length; const uni = new Set([...A, ...B]).size || 1; return Math.round((1 - inter / uni) * 100); }
  const driftLabel = d => d < 40 ? 'Mild wobble' : d < 70 ? 'Classic telephone' : d < 90 ? 'Total drift' : 'Different universe 🌌';

  let st;
  const fresh = () => ({ c: 0, chains: [[], []], k: 0, orders: [C.players.map(p => p.id), C.players.map(p => p.id).reverse()] });
  const cur = () => st.chains[st.c];
  const who = k => C.player(st.orders[st.c][k]);
  const img = (text, id, loading) => C.genCard({ id, kind: 'square', prompt: text, loading, hidePrompt: true, emoji: C.emojisFor(text, 3) });

  function linkScreen() {
    const p = who(st.k), host = C.mode === 'host', prev = cur()[st.k - 1];
    C.stage('<div class="card"><div class="kicker">Chain ' + (st.c + 1) + ' of 2 · link ' + (st.k + 1) + ' of 7</div><div class="spread"><h2>' + (st.k === 0 ? '✍️ ' + C.esc(p.name) + ' writes the first prompt' : '👀 ' + C.esc(p.name) + ': describe ONLY what you see') + '</h2>' + C.chip(p, { big: true }) + '</div>' +
      '<div class="cols"><div>' + (prev ? img(prev, null, false) + '<p class="muted">You never see the words that made this.</p>' : '<p class="big-text">Write anything: a scene, a creature, a moment.</p>') + '</div><div>' +
      (host ? '<textarea id="ptxt" placeholder="' + (st.k ? 'Describe the image…' : 'A corgi wearing a tiny crown…') + '"></textarea><div class="cta"><button class="btn ghost" data-act="sample">🎲 Sample</button><button class="btn big pink" data-act="gen">✨ Generate & pass on</button></div>' : '<div class="syn" id="ptxt"></div>') +
      '<div id="out" style="margin-top:12px"></div></div></div></div>' + chainStrip());
  }
  function chainStrip() {
    if (!cur().length) return '';
    return '<div class="card"><h3>Chain so far <small>(hidden from players in the real game)</small></h3><div class="strip">' + cur().map((t, i) => '<div class="link"><div class="lt">' + C.chip(who(i)) + '<p>“' + C.esc(t) + '”</p></div>' + img(t, null, false) + '</div>').join('<div class="arrow">→</div>') + '</div></div>';
  }
  function handoffScreen() {
    const n = who(st.k + 1);
    C.stage('<div class="card center"><div class="kicker">Handoff</div><h2>Pass it to ' + C.chip(n, { big: true }) + '</h2><p class="big-text">🙈 Everyone else: eyes off the screen.</p><button class="btn big" data-act="nextLink">I’m ' + C.esc(n.name) + ', show me the image →</button></div>');
  }
  function revealScreen() {
    const ch = cur(), d = drift(ch[0], ch[6]);
    C.stage('<div class="card"><div class="kicker">Chain ' + (st.c + 1) + ' · the drift reveal</div><h2>From this… to THIS</h2><div class="cols vs"><div><div class="kicker">First prompt · ' + C.esc(who(0).name) + '</div><p class="big-text">“' + C.esc(ch[0]) + '”</p>' + img(ch[0], null, false) + '</div>' +
      '<div><div class="kicker">Last prompt · ' + C.esc(who(6).name) + '</div><p class="big-text">“' + C.esc(ch[6]) + '”</p>' + img(ch[6], null, false) + '</div></div>' +
      '<h3>Drift score: ' + d + '% · ' + driftLabel(d) + '</h3><div class="dmeter"><i id="dm" style="width:0%"></i></div>' +
      (C.mode === 'host' ? '<div class="cta"><button class="btn big" data-act="after">' + (st.c === 0 ? 'Chain 2 →' : '🏁 Finish & pacing report') + '</button></div>' : '') + '</div>' + chainStrip());
    setTimeout(() => { const m = C.$('#dm'); if (m) m.style.width = d + '%'; }, 80);
  }
  const summary = () => st && st.chains[0].length === 7 ? '<div class="card"><h2>📞 Both chains</h2>' + st.chains.filter(c => c.length === 7).map((c, i) => '<p><b>Chain ' + (i + 1) + '</b> drift ' + drift(c[0], c[6]) + '%: “' + C.esc(c[0]) + '” → “' + C.esc(c[6]) + '”</p>').join('') + '</div>' : '';

  async function commit(text) {
    cur().push(text); C.log(who(st.k), ' “' + text + '”', 'say');
    C.$('#out').innerHTML = img(text, 'lk', true); await C.generate('lk', 8);
  }
  const acts = {
    begin() { st.k = 0; C.phase('Chain ' + (st.c + 1) + ': building', 420); linkScreen(); },
    sample() { C.$('#ptxt').value = CHAINS[st.c][st.k]; },
    async gen() { const t = C.$('#ptxt').value.trim(); if (!t || cur().length > st.k) return; /* ignore double-clicks */ await commit(t); if (st.k < 6) setTimeout(handoffScreen, 900); else setTimeout(() => { C.phase('Drift reveal', 150); revealScreen(); }, 900); },
    nextLink() { st.k++; linkScreen(); },
    after() { if (st.c === 0) { st.c = 1; acts.begin(); } else C.finish(summary()); },
    end() { C.finish(summary()); },
  };

  async function simulate() {
    st = fresh();
    C.phase('Intro & rules', 90); C.stage('<div class="card"><h2>📞 Prompt Telephone</h2>' + C.script('Player 1 writes a prompt. The AI draws it. Player 2 sees only the picture and describes it. The AI draws that. Seven links, and then we see how far it drifted.') + '</div>');
    await C.sys('Facilitator explains, everyone promises not to peek', 50); await C.say('zoe', 'This is going to end with a llama. I can feel it.', 8);
    for (let c = 0; c < 2; c++) {
      st.c = c; st.k = 0; C.phase('Chain ' + (c + 1) + ': building', 420);
      for (let k = 0; k < 7; k++) {
        st.k = k; const p = who(k); linkScreen();
        await C.say(p, LINES[p.id], 3);
        await C.wait(k === 0 ? 30 : C.rand(25, 45));
        C.$('#ptxt').textContent = CHAINS[c][k];
        await commit(CHAINS[c][k]);
        if (k < 6) { handoffScreen(); await C.sys('Laptop passed to ' + who(k + 1).name, 10); }
      }
      C.phase('Drift reveal', 150); revealScreen();
      await C.sys('First prompt read aloud… then the last one. The room loses it 😂', 12);
      await C.say(who(0), C.pick(['HOW did we get from my corgi to a CULT?', 'I said a mountain. A MOUNTAIN.']), 10);
      await C.sys('Walk back through the chain link by link: “who added the chocolate?!”', 60);
      await C.say(C.pick(C.players), 'Link 4 is where it all went wrong.', 10);
    }
    C.phase('Wrap', 60); await C.sys('Vote: which chain drifted best? Screenshots taken', 40);
  }

  C.css('.strip{display:flex;gap:8px;overflow-x:auto;padding-bottom:8px;align-items:center}.link{min-width:170px;max-width:170px}.link .gen{max-width:none}.link .gen-meta{display:none}.lt p{font-size:.8rem;margin:4px 0}.arrow{font-size:1.4rem;color:var(--muted)}.vs .gen{max-width:320px}.dmeter{height:22px;border-radius:12px;background:var(--line);overflow:hidden}.dmeter i{display:block;height:100%;background:linear-gradient(90deg,var(--good),var(--warn),var(--bad));transition:width 1.6s cubic-bezier(.2,.9,.3,1)}.syn{min-height:60px;padding:10px;border:2px solid var(--line);border-radius:12px}');

  C.game({
    num: '13', title: 'Prompt Telephone', emoji: '📞',
    tagline: 'A chain of 7. Player 1 writes a prompt → AI image → Player 2 describes only what they see → new image → … Watch the meaning drift, then compare the first and last.',
    how: '<ol class="tight"><li>Player 1 writes a prompt</li><li>Each next player sees only the previous image and describes it</li><li>7 links, so 7 images</li><li>Drift reveal: first vs. last, with a drift score</li><li>2 chains (the second runs in reverse order)</li></ol>',
    plan: [{ name: 'Intro & rules', sec: 90 }, { name: 'Chain 1: building', sec: 420 }, { name: 'Drift reveal', sec: 300 }, { name: 'Chain 2: building', sec: 420 }, { name: 'Wrap', sec: 60 }],
    evaluating: ['Does the drift reveal land as the comedy climax?', 'How long does a 7-link chain take?'],
    notes: '<p><b>Verdict: the drift reveal is the best comedy beat in the whole set, but the build-up is dead time.</b> A 7-link chain takes about 6–7 min, and only <i>one</i> person is active at a time while 6 wait (and must not look).</p>' +
      '<h4>Does the reveal land?</h4><p>Yes. First vs. last (“a corgi ruling a sandwich kingdom” → “a baguette cult”) gets the biggest laugh, and walking back through the chain to find “where it went wrong” gives a second wave of laughs and real conversation.</p>' +
      '<h4>The pacing problem</h4><ul class="tight"><li>Sequential chains mean 6 people stare at the ceiling for about 6 minutes.</li><li><b>Fix: run all chains in parallel.</b> With phones, start 7 chains at once (one per person) and rotate. That’s 7 rounds of about 60s, so about 8 min total, and everyone is busy every round. Then reveal 3–4 of the chains.</li><li>If you’re stuck with one screen, do 2 chains of 4 links instead of 7.</li></ul>' +
      '<div class="risk"><b>Facilitator risk note:</b> very low. Misinterpretation is the point, so nobody can do it “wrong”.</div>',
    host() {
      st = fresh(); C.phase('Intro & rules', 90);
      C.stage('<div class="card"><h2>📞 Prompt Telephone</h2>' + C.script('Player 1 writes a prompt. The AI draws it. Player 2 sees only the picture and describes it. The AI draws that. Seven links, and then we see how far it drifted.') + '<p>Chain 1 order: ' + st.orders[0].map(id => C.chip(id)).join(' → ') + '</p><button class="btn big" data-act="begin">Start chain 1 →</button></div>');
    },
    simulate, summary, acts,
  });
})();
