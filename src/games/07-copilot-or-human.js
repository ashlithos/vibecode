// TITLE: 07 · Copilot or Human? (quote quiz)
(function () {
  const C = Core;
  // Real, famous movie quotes (verbatim as commonly cited).
  const REAL = [
    ['Here’s looking at you, kid.', 'Casablanca (1942)'],
    ['You’re gonna need a bigger boat.', 'Jaws (1975)'],
    ['Houston, we have a problem.', 'Apollo 13 (1995)'],
    ['Carpe diem. Seize the day, boys. Make your lives extraordinary.', 'Dead Poets Society (1989)'],
    ['Roads? Where we’re going, we don’t need roads.', 'Back to the Future (1985)'],
    ['Keep your friends close, but your enemies closer.', 'The Godfather Part II (1974)'],
    ['Just keep swimming.', 'Finding Nemo (2003)'],
    ['To infinity and beyond!', 'Toy Story (1995)'],
    ['There’s no place like home.', 'The Wizard of Oz (1939)'],
    ['You can’t handle the truth!', 'A Few Good Men (1992)'],
  ];
  // Plausible AI-generated "movie quotes" (written for this prototype, not from any film).
  const AI = [
    ['Some doors only open from the inside, and most of us never think to knock.', 'sounds like: a 2000s indie drama'],
    ['You don’t get to choose the storm. You only get to choose who’s in the boat with you.', 'sounds like: a sports-team underdog movie'],
    ['I didn’t come all this way to be ordinary, Charlie.', 'sounds like: a coming-of-age road trip'],
    ['The map was never the problem. We were.', 'sounds like: an adventure-movie finale'],
    ['Every hero is just someone who stayed five minutes longer.', 'sounds like: a firefighter drama'],
    ['Don’t look back, kid. The past already knows where you live.', 'sounds like: a neo-noir thriller'],
    ['We’re not lost. We’re just early.', 'sounds like: a sci-fi space epic'],
    ['If the world’s going to end, I’d at least like to finish my coffee.', 'sounds like: a disaster-movie comic relief'],
    ['Courage isn’t loud. Sometimes it just gets up and goes to work.', 'sounds like: an Oscar-bait biopic'],
    ['Funny thing about tomorrow: it never shows up when you’re waiting for it.', 'sounds like: a 90s romantic drama'],
  ];
  // How good each persona is at spotting AI (probability of answering correctly).
  const SKILL = { maya: .5, dev: .72, priya: .6, leo: .78, sam: .68, zoe: .55, omar: .62 };
  const ROUNDS = 10;

  let st;
  const fresh = () => ({ deck: [], i: 0, board: null, score: {}, hist: [] });
  function deck() {
    const r = C.sample(REAL, 5).map(q => ({ text: q[0], src: q[1], real: true }));
    const a = C.sample(AI, 5).map(q => ({ text: q[0], src: q[1], real: false }));
    return C.shuffle(r.concat(a));
  }
  const lb = () => '<table class="rtable">' + C.players.slice().sort((a, b) => (st.score[b.id] || 0) - (st.score[a.id] || 0)).map((p, i) => '<tr><td>' + (i + 1) + '</td><td>' + C.chip(p) + '</td><td class="n"><b>' + (st.score[p.id] || 0) + '</b></td></tr>').join('') + '</table>';

  function quoteScreen(reveal) {
    const q = st.deck[st.i];
    if (!reveal) st.board = new C.VoteBoard({ title: 'Human or AI?', options: [{ id: 'human', label: 'Human (real movie)', emoji: '🎬' }, { id: 'ai', label: 'AI-generated', emoji: '🤖' }] });
    C.stage('<div class="card quote ' + (reveal ? (q.real ? 'is-real' : 'is-ai') : '') + '"><div class="kicker">Quote ' + (st.i + 1) + ' of ' + ROUNDS + '</div><blockquote>“' + C.esc(q.text) + '”</blockquote>' +
      (reveal ? '<p class="big-text">' + (q.real ? '🎬 REAL: <i>' + C.esc(q.src) + '</i>' : '🤖 AI-GENERATED · ' + C.esc(q.src)) + '</p>' : '') + '</div>' +
      '<div class="cols"><div class="card">' + st.board.html() + (C.mode === 'host' ? '<div class="cta">' + (reveal ? '<button class="btn big" data-act="next">' + (st.i < ROUNDS - 1 ? 'Next quote →' : '🏆 Final scores') + '</button>' : '<button class="btn big pink" data-act="reveal">Reveal →</button>') + '</div>' : '') + '</div>' +
      '<div class="card"><h3>Scoreboard</h3>' + lb() + '</div></div>');
  }
  function score() {
    const q = st.deck[st.i], right = q.real ? 'human' : 'ai';
    Object.entries(st.board.votes.main).forEach(([v, o]) => { if (o === right) st.score[v] = (st.score[v] || 0) + 1; });
    st.hist.push({ q, pct: st.board.count('main', right) / 7 });
  }
  function summary() {
    if (!st.hist.length) return '';
    const hard = st.hist.slice().sort((a, b) => a.pct - b.pct)[0];
    return '<div class="card"><h2>🏆 Final scores</h2>' + lb() + '<p><b>Hardest quote:</b> “' + C.esc(hard.q.text) + '”: only ' + Math.round(hard.pct * 100) + '% got it right (' + (hard.q.real ? 'it was real: ' + C.esc(hard.q.src) : 'it was AI') + ').</p></div>';
  }

  const acts = {
    start() { st.i = 0; C.phase('Quiz rounds', 600); C.timer('Vote', 20); quoteScreen(false); },
    reveal() { C.clearTimer(); score(); quoteScreen(true); },
    next() { if (st.i < ROUNDS - 1) { st.i++; C.timer('Vote', 20); quoteScreen(false); } else { C.phase('Final scores', 60); C.stage(summary() + '<button class="btn big" data-act="end">🏁 Finish & pacing report</button>'); } },
    end() { C.finish(summary()); },
  };

  async function simulate() {
    st = fresh(); st.deck = deck();
    C.phase('Intro', 60); C.stage('<div class="card"><h2>🤖 or 🎬?</h2>' + C.script('Ten movie quotes. Half are real, half were written by an AI. Vote: human or AI?') + '</div>');
    await C.sys('Facilitator explains', 40); await C.say('dev', 'I’ve seen every movie. This will be easy.', 8);
    C.phase('Quiz rounds', 600);
    for (let i = 0; i < ROUNDS; i++) {
      st.i = i; const q = st.deck[i]; C.timer('Vote', 20); quoteScreen(false);
      await C.sys('Quote read aloud', 6);
      if (C.chance(.5)) await C.say(C.pick(C.players), C.pick(['That’s definitely from something.', 'Too inspirational. AI.', 'I feel like Tom Hanks said this.', 'This is a fortune cookie.', 'Wait, I know this one!']), 5);
      await C.simVotes(st.board, v => { const right = q.real ? 'human' : 'ai'; return C.chance(SKILL[v.id] + (q.real && /Toy|Nemo|Oz|Jaws/.test(q.src) ? .25 : 0)) ? right : (right === 'ai' ? 'human' : 'ai'); }, { gap: 1.8, straggler: 3 });
      C.clearTimer(); score(); quoteScreen(true); await C.wait(4);
      const pct = st.hist[st.hist.length - 1].pct;
      await C.sys(pct < .5 ? 'Groans: “NO WAY that’s ' + (q.real ? 'real' : 'AI') + '!”' : 'Mostly nods. Some smugness.', 6);
      if (i % 3 === 2) await C.say(C.pick(C.players), C.pick(['How is that AI? It made me feel something.', 'I need a rematch.', 'Leo is suspiciously good at this.']), 8);
      if (i === 6) await C.sys('Energy dips a little: rounds are starting to feel the same', 3);
      await C.wait(6);
    }
    C.phase('Final scores', 60); C.stage(summary()); await C.sys('Winner crowned 👑', 30);
  }

  C.css('.quote blockquote{font-size:clamp(1.4rem,3.5vw,2.3rem);font-weight:750;line-height:1.3;margin:14px 0;font-family:Georgia,serif}.quote.is-real{border-color:var(--good);border-width:3px}.quote.is-ai{border-color:var(--accent2);border-width:3px}');

  C.game({
    num: '07', title: 'Copilot or Human?', emoji: '🤖',
    tagline: 'A 10-round quiz. Each round shows one movie quote: a real famous one, or one an AI wrote. Everyone votes: human or AI?',
    how: '<ol class="tight"><li>Quote appears and is read aloud</li><li>20 seconds: vote 🎬 human or 🤖 AI</li><li>Reveal (with the movie, if real) + scores</li><li>10 rounds (5 real, 5 AI, shuffled)</li></ol>',
    plan: [{ name: 'Intro', sec: 60 }, { name: 'Quiz rounds', sec: 600 }, { name: 'Final scores', sec: 60 }],
    evaluating: ['Quiz pacing for 10 rounds in ~15 min?', 'Is it fun, or does it feel like trivia night?'],
    notes: '<p><b>Verdict: smooth and fast, but it <i>is</i> trivia night.</b> 10 rounds take about 9 min, well inside 15. Good as an opener or closer, not the main event.</p>' +
      '<h4>Pacing</h4><p>About 55–65s per round. Rounds 1–4 are lively (“I KNOW this one!”); by round 7 the rhythm feels samey. Famous quotes (Toy Story, Nemo) are too easy, while obscure real quotes and vague AI quotes are where the fun is.</p>' +
      '<h4>Making it less trivia, more team</h4><ul class="tight"><li>After each reveal, ask one person: “what gave it away?” 20s of real conversation about how we read AI.</li><li>Round 10 twist: show a quote the <i>team</i> wrote vs. one the AI wrote.</li><li>Play in pairs, so new teammates have to agree before voting. That’s a micro-collaboration.</li></ul>' +
      '<div class="risk"><b>Facilitator risk note:</b> very low. Individual scores can make people who don’t watch films feel left out, so consider showing team-pair scores instead.</div>',
    host() {
      st = fresh(); st.deck = deck(); C.phase('Intro', 60);
      C.stage('<div class="card"><h2>🤖 or 🎬?</h2>' + C.script('Ten movie quotes. Half are real, half were written by an AI. Vote: human or AI?') + '<button class="btn big" data-act="start">First quote →</button></div>');
    },
    simulate, summary, acts,
  });
})();
