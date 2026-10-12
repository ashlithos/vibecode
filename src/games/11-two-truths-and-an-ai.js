// TITLE: 11 · Two Truths and an AI
(function () {
  const C = Core;
  const TRUTHS = {
    maya: ['I have over 40 houseplants.', 'I once got lost in IKEA for two hours.'],
    dev: ['I own five copies of the same shirt.', 'I’ve never seen a single Star Wars movie.'],
    priya: ['I bake when I’m stressed.', 'My grandmother taught me to fold dumplings.'],
    leo: ['I’ve run three marathons.', 'I started two companies before I turned 30.'],
    sam: ['I used to work as a field biologist.', 'I go on sunrise hikes most weekends.'],
    zoe: ['I did musical theater all through college.', 'I once won a pun competition.'],
    omar: ['I missed a flight in Lisbon and ended up joining a startup.', 'I speak four languages.'],
  };
  const L = {
    local: ['local car dealership', 'regional pizza chain', 'small-town furniture store', 'late-night mattress'], product: ['mattresses', 'frozen waffles', 'a water park', 'a dental clinic'],
    n: ['14', '22', '9', '17'], mundane: ['snow', 'the ocean', 'a real cow', 'a Broadway show'], skill: ['juggle', 'solve a Rubik’s cube in under two minutes', 'play the accordion', 'do a passable British accent'],
    time: ['the 2020 lockdown', 'a very long summer at camp', 'a boring internship', 'a semester abroad'], who: ['a famous chef', 'an Olympic swimmer', 'a 90s pop star', 'a late-night TV host'],
    place: ['an airport bookstore', 'a hardware store', 'a wedding', 'a laundromat'], job: ['scooping ice cream', 'a lifeguard', 'a mall Santa’s elf', 'washing dishes'],
    work: ['a theme park', 'a bowling alley', 'a hotel in Vegas', 'a summer camp'], pet: ['parrot', 'tortoise', 'hedgehog', 'three-legged cat'], petname: ['Professor', 'Waffles', 'Gerald', 'Admiral Snuggles'],
    contest: ['spelling bee', 'chili cook-off', 'yo-yo contest', 'regional chess tournament'], grade: ['fourth grade', 'high school', 'college', 'my first job'],
    verb: ['wrestled', 'adopted', 'outran', 'accidentally befriended', 'sold a car to'], animal: ['an alpaca', 'a goose', 'a raccoon', 'an emu', 'a llama'], aplace: ['a Walmart parking lot', 'the Louvre', 'a funeral', 'an airplane bathroom'],
  };
  const g = k => C.pick(L[k]);
  const PLAUSIBLE = [() => 'I was an extra in a ' + g('local') + ' commercial for ' + g('product') + '.', () => 'I’ve been to ' + g('n') + ' countries but have never seen ' + g('mundane') + '.', () => 'I can ' + g('skill') + '. I learned during ' + g('time') + '.', () => 'I once met ' + g('who') + ' at ' + g('place') + ' and didn’t recognize them.', () => 'My first job was ' + g('job') + ' at ' + g('work') + '.', () => 'I have a ' + g('pet') + ' named ' + g('petname') + '.', () => 'I won a ' + g('contest') + ' in ' + g('grade') + '.'];
  const ABSURD = [() => 'I once ' + g('verb') + ' ' + g('animal') + ' in ' + g('aplace') + '.'];
  const lie = mode => C.pick(mode === 'absurd' ? ABSURD : PLAUSIBLE)();

  let st;
  const fresh = () => ({ subs: {}, order: [], i: 0, board: null, score: {}, res: [] });
  function initSubs() { C.players.forEach(p => { st.subs[p.id] = { t1: TRUTHS[p.id][0], t2: TRUTHS[p.id][1], lie: lie('plausible'), mode: 'plausible' }; }); }
  const add = (id, n) => st.score[id] = (st.score[id] || 0) + n;
  const lb = () => '<table class="rtable">' + C.players.slice().sort((a, b) => (st.score[b.id] || 0) - (st.score[a.id] || 0)).map((p, i) => '<tr><td>' + (i + 1) + '</td><td>' + C.chip(p) + '</td><td class="n"><b>' + (st.score[p.id] || 0) + '</b></td></tr>').join('') + '</table>';

  function submitScreen() {
    const host = C.mode === 'host';
    C.stage('<div class="card"><div class="kicker">Submissions</div><h2>Two truths + one AI lie</h2>' + C.script('Write two true things about yourself. Then hit “Generate my lie”: the AI writes a believable fake. Edit it to sound like you.') +
      '<div class="subs">' + C.players.map(p => { const s = st.subs[p.id]; return '<div class="pcell">' + C.chip(p) +
        (host ? '<input data-f="t1" data-p="' + p.id + '" value="' + C.esc(s.t1) + '"><input data-f="t2" data-p="' + p.id + '" value="' + C.esc(s.t2) + '"><div class="row"><input data-f="lie" data-p="' + p.id + '" value="' + C.esc(s.lie) + '" style="flex:1"><button class="btn small" data-act="gen" data-p="' + p.id + '" data-m="plausible">🤖 Plausible lie</button><button class="btn small ghost" data-act="gen" data-p="' + p.id + '" data-m="absurd">🤪 Absurd</button></div>'
          : '<span class="muted" id="sub' + p.id + '">writing truths…</span>') + '</div>'; }).join('') + '</div>' +
      (host ? '<div class="cta"><button class="btn big pink" data-act="go">Start presenting →</button></div>' : '') + '</div>');
  }
  function readSubs() { C.$$('[data-f]').forEach(i => { st.subs[i.dataset.p][i.dataset.f] = i.value.trim(); }); }
  function presentScreen(reveal) {
    const p = C.player(st.order[st.i]), s = st.subs[p.id];
    if (!s.shuffled) s.shuffled = C.shuffle([{ t: s.t1, lie: false }, { t: s.t2, lie: false }, { t: s.lie, lie: true }]);
    if (!reveal) st.board = new C.VoteBoard({ title: 'Which one is the AI lie?', voters: C.players.filter(q => q.id !== p.id), options: s.shuffled.map((x, k) => ({ id: 'abc'[k], label: 'ABC'[k] + ': ' + x.t.slice(0, 40) + (x.t.length > 40 ? '…' : ''), short: 'ABC'[k] })) });
    C.stage('<div class="card"><div class="spread"><div class="kicker">Player ' + (st.i + 1) + ' of 7</div>' + C.chip(p, { big: true }) + '</div>' +
      '<div class="stmts">' + s.shuffled.map((x, k) => '<div class="stmt ' + (reveal ? (x.lie ? 'lie' : 'truth') : '') + '"><b>' + 'ABC'[k] + '</b> ' + C.esc(x.t) + (reveal ? (x.lie ? ' <span class="tag bad">🤖 AI LIE</span>' : ' <span class="tag good">TRUE</span>') : '') + '</div>').join('') + '</div></div>' +
      '<div class="cols"><div class="card">' + st.board.html() + (C.mode === 'host' ? '<div class="cta">' + (reveal ? '<button class="btn big" data-act="next">' + (st.i < 6 ? 'Next player →' : '🏆 Final scores') + '</button>' : '<button class="btn big pink" data-act="reveal">Reveal the lie →</button>') + '</div>' : '') + '</div><div class="card"><h3>Scores</h3>' + lb() + '</div></div>');
  }
  function score() {
    const p = C.player(st.order[st.i]), s = st.subs[p.id], lieId = 'abc'[s.shuffled.findIndex(x => x.lie)];
    let right = 0;
    Object.entries(st.board.votes.main).forEach(([v, o]) => { if (o === lieId) { add(v, 1); right++; } else add(p.id, 1); });
    st.res.push({ p, mode: s.mode, fooled: 6 - right });
  }
  function summary() {
    if (!st.res.length) return '';
    const avg = m => { const r = st.res.filter(x => x.mode === m); return r.length ? (r.reduce((a, x) => a + x.fooled, 0) / r.length).toFixed(1) : '–'; };
    return '<div class="card"><h2>🏆 Final scores</h2>' + lb() + '<h3>How good were the AI lies?</h3><p>Average people fooled (out of 6): 🤖 plausible lies <b>' + avg('plausible') + '</b> · 🤪 absurd lies <b>' + avg('absurd') + '</b></p></div>';
  }

  const acts = {
    gen(d) { readSubs(); st.subs[d.p].lie = lie(d.m); st.subs[d.p].mode = d.m; submitScreen(); },
    go() { readSubs(); C.clearTimer(); st.order = C.shuffle(C.players.map(p => p.id)); st.i = 0; C.phase('Present + questions', 80); presentScreen(false); },
    reveal() { C.phase('Vote, reveal + story', 90); score(); presentScreen(true); },
    next() { if (st.i < 6) { st.i++; C.phase('Present + questions', 80); presentScreen(false); } else { C.phase('Final scores', 60); C.stage(summary() + '<button class="btn big" data-act="end">🏁 Finish & pacing report</button>'); } },
    end() { C.finish(summary()); },
  };

  async function simulate() {
    st = fresh(); initSubs();
    C.phase('Intro', 90); C.stage('<div class="card"><h2>🤥 Two Truths and an AI</h2>' + C.script('Classic two truths and a lie, except the AI writes your lie. Your job: make it sound like you.') + '</div>');
    await C.sys('Facilitator explains', 50); await C.say('omar', 'Can my truth be a long story?', 6); await C.sys('Facilitator: “One sentence, please, Omar.” (laughter)', 10);
    C.phase('Write truths + generate lies', 240); C.timer('Submit', 240); submitScreen();
    for (const p of C.shuffle(C.players)) {
      await C.wait(C.rand(18, 32)); const s = st.subs[p.id];
      if (p.id === 'maya') { s.lie = lie('absurd'); s.mode = 'absurd'; await C.act(p, ' clicked 🤪 Absurd: “' + s.lie + '”', 2); }
      else if (C.chance(.4)) { await C.act(p, ' regenerated the lie twice (first ones didn’t sound like them)', 6); s.lie = lie('plausible'); }
      C.$('#sub' + p.id).textContent = '✅ ready'; await C.act(p, ' submitted', 1);
    }
    C.clearTimer(); st.order = C.shuffle(C.players.map(p => p.id));
    for (let i = 0; i < 7; i++) {
      st.i = i; const p = C.player(st.order[i]), s = st.subs[p.id];
      C.phase('Present + questions', 80); presentScreen(false);
      await C.say(p, 'A, B or C. One of these is the AI.', 18);
      for (let q = 0; q < 2; q++) await C.say(C.pick(C.players.filter(x => x.id !== p.id)), C.pick(['Which countries?', 'What was the dog’s name?', 'Prove it. Do the accent.', 'How long ago?', 'Wait, say B again.']), 10), await C.say(p, C.pick(['No comment.', 'You’ll find out.', 'It was a long time ago…', 'Next question.']), 8);
      C.phase('Vote, reveal + story', 90);
      const lieId = 'abc'[s.shuffled.findIndex(x => x.lie)], hit = s.mode === 'absurd' ? .85 : .38;
      await C.simVotes(st.board, () => C.chance(hit) ? lieId : C.pick(['a', 'b', 'c'].filter(x => x !== lieId)), { gap: 3 });
      score(); presentScreen(true);
      const r = st.res[st.res.length - 1];
      await C.sys(r.fooled >= 4 ? '😱 ' + r.fooled + ' people fooled!' : r.fooled === 0 ? 'Everyone spotted it instantly.' : r.fooled + ' fooled', 5);
      await C.say(p, 'The true story behind “' + s.t2.slice(0, 40) + '…”: ' + C.pick(['it was worse than it sounds.', 'my mom still brings it up.', 'it changed my career, honestly.', 'there are photos.']), 35);
      await C.wait(8);
    }
    C.phase('Final scores', 60); C.stage(summary()); await C.sys('Scores + best liar crowned', 30);
  }

  C.css('.subs{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:10px}.subs input{min-height:38px;padding:6px 10px;font-size:.9rem}.stmts{display:flex;flex-direction:column;gap:10px;margin-top:12px}.stmt{font-size:1.2rem;padding:14px 16px;border:2px solid var(--line);border-radius:14px}.stmt b{display:inline-grid;place-items:center;width:30px;height:30px;border-radius:50%;background:var(--ink);color:var(--bg);margin-right:8px}.stmt.lie{border-color:var(--bad);animation:pop .4s}.stmt.truth{border-color:var(--good);opacity:.75}');

  C.game({
    num: '11', title: 'Two Truths and an AI', emoji: '🤥',
    tagline: 'Each player submits 2 true facts plus 1 lie written by an AI lie generator. The room guesses which is the AI lie, then hears the real story behind a truth.',
    how: '<ol class="tight"><li>Everyone writes 2 truths, then clicks “generate my lie”</li><li>One at a time: 3 shuffled statements + quick questions</li><li>Vote: which is the lie?</li><li>Reveal + the story behind a truth</li><li>+1 per correct guess; presenter +1 per person fooled</li></ol>',
    plan: [{ name: 'Intro', sec: 90 }, { name: 'Write truths + generate lies', sec: 240 }, { name: 'Present + questions', sec: 560 }, { name: 'Vote, reveal + story', sec: 630 }, { name: 'Final scores', sec: 60 }],
    evaluating: ['~3.5 min per person × 7: does it fit in 30 min?', 'Does the lie generator produce good lies?'],
    notes: '<p><b>Verdict: the best pure get-to-know-you format in the set, and it fits.</b> In practice each person takes about 2¼ min, not 3½, so 7 people take about 16 min. With about 6 min of setup the simulation lands at 22–23 min, which leaves room for longer stories.</p>' +
      '<h4>Lie generator quality</h4><ul class="tight"><li><b>Absurd templates</b> (“I once wrestled an emu in the Louvre”) are funny but fool almost nobody (about 1 of 6). They become the obvious answer.</li><li><b>Plausible templates</b> (commercial extra, first job, a pet’s name) fool about 3–4 of 6. Much better game.</li><li>The real tell is <i>voice</i>: AI lies sound slightly generic. Prompt players to edit the lie so it sounds like them.</li></ul>' +
      '<h4>Where time leaks</h4><p>The “story behind the truth” is the best part and the biggest leak (30–60s). If you’re over, cap questions at 2 per person and keep the story.</p>' +
      '<div class="risk"><b>Facilitator risk note:</b> low. People control exactly what they share. Remind them to pick truths they’re happy for the team to know.</div>',
    host() {
      st = fresh(); initSubs(); C.phase('Intro', 90);
      C.stage('<div class="card"><h2>🤥 Two Truths and an AI</h2>' + C.script('Classic two truths and a lie, except the AI writes your lie. Your job: make it sound like you.') + '<button class="btn big" data-act="write">Write submissions →</button></div>');
    },
    simulate, summary, acts: Object.assign(acts, { write() { C.phase('Write truths + generate lies', 240); C.timer('Submit', 240); submitScreen(); } }),
  });
})();
