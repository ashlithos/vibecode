// TITLE: 05 · Describe Your Angel (vibe portraits)
(function () {
  const C = Core;
  // Vibe prompts about each subject, built from what they said in lightning intros. [prompt, clarity 0..1, why]
  const VIBES = {
    maya: ['chaotic houseplant witch energy, gets lost in IKEA on purpose and loves it', .7, 'You said you got lost in IKEA and loved it. That’s a whole worldview.'],
    dev: ['a calm stone statue who secretly keeps the whole server room alive', .55, 'Five identical shirts is the most powerful energy I’ve ever heard of.'],
    priya: ['a golden retriever who brings homemade cookies to every meeting', .75, 'You literally promised us cookies in week three.'],
    leo: ['a caffeinated cheetah running a marathon while writing a roadmap', .8, 'Three marathons, two startups. I did the math.'],
    sam: ['a quiet owl watching the sunrise from a mountaintop, knows all the answers', .45, 'You said quiet hikes, and you have big “knows everything, says little” energy.'],
    zoe: ['a theater kid who turns every name into a pun, with extra sparkles', .7, 'You warned us about the puns. I’m preparing emotionally.'],
    omar: ['a wandering bard with a legendary story for every airport', .65, 'The Lisbon story. We need the full version.'],
  };
  const INTRO = { maya: 'Maya, design. Got lost in IKEA for two hours and loved it.', dev: 'Dev, backend. I own five copies of one shirt.', priya: 'Priya, research. I stress-bake. Cookies in week three.', leo: 'Leo, PM. Three marathons, two startups, one tired dog.', sam: 'Sam, data. I like quiet hikes at sunrise.', zoe: 'Zoe, marketing. I will pun your name within a week.', omar: 'Omar, eng. Ask me about missing a flight in Lisbon.' };
  // Simple kindness check: flags descriptions of looks or put-downs. First-time teams have no shared context to absorb a joke that lands wrong.
  const UNKIND = /\b(ugly|fat|old|skinny|short|bald|tired[- ]looking|hasn'?t slept|annoying|lazy|loud|weird[- ]looking|nerdy?|awkward|creepy|smelly|boring)\b/i;

  let st;
  const fresh = () => ({ pairs: [], idx: 0, board: null, score: {}, log: [] });
  function makePairs() {
    const perm = C.derange(7);
    return C.shuffle(C.players.map((d, i) => { const s = C.players[perm[i]]; return { describer: d, subject: s, vibe: VIBES[s.id][0], clarity: VIBES[s.id][1], why: VIBES[s.id][2] }; }));
  }
  const add = (id, n) => { st.score[id] = (st.score[id] || 0) + n; };
  const lb = () => '<table class="rtable">' + C.players.slice().sort((a, b) => (st.score[b.id] || 0) - (st.score[a.id] || 0)).map((p, i) => '<tr><td>' + (i + 1) + '</td><td>' + C.chip(p) + '</td><td class="n"><b>' + (st.score[p.id] || 0) + '</b> pts</td></tr>').join('') + '</table>';

  function writeScreen() {
    C.stage('<div class="card"><div class="kicker">Write your vibe prompt</div><h2>Describe your person’s <i>vibe</i>, not their looks</h2>' +
      C.script('You each have a secret person. Write an image prompt that captures their <b>vibe</b>, based on what they shared in intros. No names, and nothing about appearance. Think “golden retriever energy”, not “has curly hair”.') +
      '<div class="pgrid">' + st.pairs.map((x, i) => '<div class="pcell">' + C.chip(x.describer) + '<span class="cat">describes 🤫 ' + (C.mode === 'host' ? C.esc(x.subject.name) : 'secret') + '</span>' +
        (C.mode === 'host' ? '<textarea data-vi="' + i + '" style="min-height:70px">' + C.esc(x.vibe) + '</textarea><small class="kind" id="kind' + i + '"></small>' : '<span class="muted" id="vs' + i + '">writing…</span>') + '</div>').join('') + '</div>' +
      '<div class="cta"><button class="btn big pink" data-act="startRounds">Start the portraits →</button></div></div>');
  }
  function roundScreen() {
    const x = st.pairs[st.idx];
    st.board = new C.VoteBoard({ title: 'Who is this?', voters: C.players.filter(p => p.id !== x.describer.id), options: C.players.filter(p => p.id !== x.describer.id).map(p => ({ id: p.id, label: p.name, emoji: p.emoji })) });
    C.stage('<div class="cols"><div>' + C.genCard({ id: 'por', kind: 'square', prompt: x.vibe + ', warm illustrated portrait, no text', title: 'Portrait #' + (st.idx + 1) }) + '</div>' +
      '<div class="card"><div class="kicker">Round ' + (st.idx + 1) + ' of 7 · described by ' + C.esc(x.describer.name) + '</div><h3>Who is it?</h3><p class="muted">If it’s you, vote for yourself: +2 bonus.</p>' + st.board.html() +
      '<button class="btn big pink" data-act="reveal">Reveal →</button></div></div>');
  }
  function score() {
    const x = st.pairs[st.idx], right = st.board.count('main', x.subject.id);
    Object.entries(st.board.votes.main).forEach(([v, o]) => { if (o === x.subject.id) add(v, v === x.subject.id ? 2 : 1); });
    if (right >= 3) add(x.describer.id, 1);
    return right;
  }
  function revealScreen(right) {
    const x = st.pairs[st.idx], self = st.board.votes.main[x.subject.id] === x.subject.id;
    C.stage('<div class="cols"><div>' + C.genCard({ kind: 'square', prompt: x.vibe, loading: false, title: 'It’s ' + x.subject.name + '!' }) + '</div><div class="card">' +
      '<p class="big-text">It’s ' + C.chip(x.subject, { big: true }) + '</p><p>' + right + ' of 6 guessed right' + (self ? ' · 🪞 ' + C.esc(x.subject.name) + ' recognized themselves (+2)' : '') + (right >= 3 ? ' · ✍️ clear description (+1 to ' + C.esc(x.describer.name) + ')' : '') + '</p>' +
      C.script(C.esc(x.describer.name) + ', why that vibe?') + '<h4>Leaderboard</h4>' + lb() +
      '<button class="btn big" data-act="next">' + (st.idx < 6 ? 'Next portrait →' : '🏆 Final leaderboard') + '</button></div></div>');
  }
  const summary = () => st.pairs.length ? '<div class="card"><h2>🏆 Final leaderboard</h2>' + lb() + '</div>' : '';

  const acts = {
    intros() { C.phase('Lightning intros', 240); C.stage('<div class="card"><h2>⚡ Lightning intros (30s each)</h2>' + C.script('Name, role and one thing that makes you <i>you</i>. Listen closely: you’ll need it in five minutes.') + '<button class="btn big" data-act="write">Everyone’s done → write vibes</button></div>'); },
    write() { C.phase('Write vibe prompts', 120); C.timer('Write', 120); writeScreen(); },
    startRounds() { C.$$('[data-vi]').forEach(t => { st.pairs[+t.dataset.vi].vibe = t.value.trim() || st.pairs[+t.dataset.vi].vibe; }); C.clearTimer(); st.idx = 0; acts.round(); },
    async round() { C.phase('Portrait & guessing', 60); roundScreen(); await C.generate('por'); },
    reveal() { C.phase('Reveal & explain', 45); revealScreen(score()); },
    next() { if (st.idx < 6) { st.idx++; acts.round(); } else { C.phase('Leaderboard & wrap', 60); C.stage(summary() + '<button class="btn big" data-act="end">🏁 Finish & pacing report</button>'); } },
    end() { C.finish(summary()); },
  };

  async function simulate() {
    st = fresh(); st.pairs = makePairs();
    C.phase('Welcome', 60); C.stage('<div class="card"><h2>🪞 Describe Your Angel</h2>' + C.script('First quick intros. Then you’ll each describe a secret teammate’s vibe as an AI image prompt, and we guess who it is.') + '</div>');
    await C.sys('Facilitator explains', 45);
    C.phase('Lightning intros', 240);
    for (const p of C.players) { await C.say(p, INTRO[p.id], C.rand(22, 38)); await C.wait(4); }
    C.phase('Write vibe prompts', 120); C.timer('Write', 120); writeScreen();
    for (const k of C.shuffle([0, 1, 2, 3, 4, 5, 6])) {
      await C.wait(C.rand(8, 16)); const x = st.pairs[k];
      if (x.describer.id === 'maya') {
        const draft = 'chaotic gremlin who clearly hasn’t slept';
        await C.act(x.describer, ' drafted: “' + draft + '”', 2);
        await C.sys('🛡️ Kindness check flagged “hasn’t slept” (about looks or state). Maya rewrites.', 10);
      }
      C.$('#vs' + k).innerHTML = '✅ <b>' + C.esc(x.vibe) + '</b>'; await C.act(x.describer, ' submitted a vibe prompt', 1);
    }
    C.clearTimer();
    for (let i = 0; i < 7; i++) {
      st.idx = i; const x = st.pairs[i];
      C.phase('Portrait & guessing', 60); roundScreen(); await C.generate('por', 8);
      await C.say(C.pick(C.players.filter(p => p.id !== x.describer.id)), C.pick(['Oh I KNOW who this is.', 'Hmm, could be two people…', 'Is that… me?', 'The ' + x.vibe.split(' ').slice(1, 3).join(' ') + ' part is a giveaway.']), 8);
      await C.simVotes(st.board, v => v.id === x.subject.id ? (C.chance(x.clarity) ? v.id : C.pick(st.board.options).id) : C.chance(x.clarity) ? x.subject.id : C.pick(st.board.options.filter(o => o.id !== v.id)).id, { gap: 3 });
      C.phase('Reveal & explain', 45); const right = score(); revealScreen(right);
      await C.say(x.subject, right >= 3 ? C.pick(['Okay, I feel SEEN.', 'This is the nicest thing anyone has called me.', 'I’ll take it!']) : C.pick(['Wait, that’s me? I love it.', 'Honestly flattered, if confused.']), 8);
      await C.say(x.describer, x.why, 14); await C.wait(6);
    }
    C.phase('Leaderboard & wrap', 60); C.stage(summary()); await C.sys('Scores read out, applause', 40);
  }

  // Host: live kindness check while typing.
  document.addEventListener('input', e => {
    const t = e.target.closest('[data-vi]'); if (!t) return;
    const m = t.value.match(UNKIND), out = document.getElementById('kind' + t.dataset.vi);
    if (out) out.innerHTML = m ? '⚠️ “' + C.esc(m[0]) + '” reads as looks or a put-down. Describe vibe and energy instead.' : '';
  });
  C.css('.kind{color:var(--bad);font-weight:650}');

  C.game({
    num: '05', title: 'Describe Your Angel', emoji: '🪞',
    tagline: 'Each player secretly describes a teammate’s <i>vibe</i> (not their name or looks) as an image prompt, like “golden retriever who brings cookies to every meeting”. The room guesses who it is.',
    how: '<ol class="tight"><li>Lightning intros (needed: you’re strangers!)</li><li>Each person writes a vibe prompt for a secret teammate</li><li>7 quick rounds: portrait → guess → reveal → “why that vibe?”</li><li>Points: +1 correct guess, +2 if you recognize yourself, +1 to clear describers</li></ol>',
    plan: [{ name: 'Welcome', sec: 60 }, { name: 'Lightning intros', sec: 240 }, { name: 'Write vibe prompts', sec: 120 }, { name: 'Portrait & guessing', sec: 420 }, { name: 'Reveal & explain', sec: 315 }, { name: 'Leaderboard & wrap', sec: 60 }],
    evaluating: ['Is it flattering or risky with new teammates?', 'Does guessing stay kind?', 'Pacing per round?'],
    notes: '<p><b>Verdict: lovely when it works, but risky with first-time teammates.</b> The core problem is that <b>strangers have no vibe data</b>. Without intros, people describe what they can see (looks, age, clothes), and that’s exactly where it goes wrong.</p>' +
      '<h4>Making it kind</h4><ul class="tight"><li>Lightning intros are mandatory here, and vibes must reference something the person <i>said</i>.</li><li>Keep a kindness check (this prototype flags words about looks or put-downs) and a positive-only frame: “What would their superpower be?”</li><li>The +2 “recognize yourself” bonus is the best mechanic: it makes being described feel like a gift.</li></ul>' +
      '<h4>Pacing</h4><p>About 1:45 per round × 7 is about 12 min, plus intros and writing. The whole thing is about 18 min. Rounds feel snappy; the “why that vibe” explanations are the warm part.</p>' +
      '<div class="risk"><b>Facilitator risk note:</b> medium. Better as a <i>second</i> meeting game, once people know each other a little. If you run it at a first meeting, describers must base vibes on intro answers only, and the facilitator should read each prompt before it’s shown.</div>',
    host() {
      st = fresh(); st.pairs = makePairs(); C.phase('Welcome', 60);
      C.stage('<div class="card"><h2>🪞 Describe Your Angel</h2>' + C.script('First quick intros. Then you’ll each describe a secret teammate’s vibe as an AI image prompt, and we guess who it is.') + '<p class="muted">Vibe fields are pre-filled with samples; edit them freely. The kindness check runs as you type.</p><button class="btn big" data-act="intros">Lightning intros →</button></div>');
    },
    simulate, summary, acts,
  });
})();
