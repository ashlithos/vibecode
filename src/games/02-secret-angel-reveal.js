// TITLE: 02 · Secret Angel: the AI reveal ceremony
(function () {
  const C = Core;
  // What each angel "learned" about their recipient during the async week.
  const TRAIT = { maya: ['has 40 houseplants', 'plants'], dev: ['owns five copies of the same shirt', 'shirts'], priya: ['stress-bakes cookies', 'cookies'], leo: ['runs marathons before breakfast', 'marathons'], sam: ['loves quiet sunrise hikes', 'hikes'], zoe: ['puns on everyone’s name', 'puns'], omar: ['tells epic stories about missed flights', 'stories'] };
  // Each angel persona has a favorite medium and a "style tell" the room can pick up on.
  const STYLE = { maya: 'fake-ad', dev: 'poem', priya: 'song', leo: 'image', sam: 'poem', zoe: 'song', omar: 'image' };
  const MEDIUM = {
    'fake-ad': (n, t, k) => ({ title: 'Introducing ' + n + '™', l1: 'As seen on TV: the only teammate who ' + t + '.', l2: 'Side effects may include joy, productivity, and an urge to buy more ' + k + '.', kind: 'video', prompt: '30-second infomercial, 90s VHS style, hero product is ' + n + ' who ' + t }),
    poem: (n, t, k) => ({ title: 'Ode to ' + n, l1: 'A twelve-line sonnet about a person who ' + t + '.', l2: 'Ends with a rhyme for “' + k + '” that should not work, but does.', kind: 'text', prompt: 'Shakespearean sonnet celebrating ' + n + ', who ' + t + ', warm and funny' }),
    song: (n, t, k) => ({ title: n + '’s Anthem (feat. the whole team)', l1: 'A synth-pop banger about someone who ' + t + '.', l2: 'Chorus: “' + n + ', ' + n + ', never change, we love your ' + k + '!”', kind: 'song', prompt: 'upbeat synth-pop song, 30 seconds, celebrating ' + n + ' who ' + t }),
    image: (n, t, k) => ({ title: n + ', as painted by the Old Masters', l1: 'A Renaissance oil portrait of a legend who ' + t + '.', l2: 'Gold frame. Dramatic lighting. Several cherubs holding ' + k + '.', kind: 'image', prompt: 'Renaissance oil painting portrait, heroic, a person who ' + t + ', cherubs, gold frame' }),
  };
  const REACT = {
    maya: 'I’m going to frame this next to plant number 41.', dev: '…Okay. That’s actually really nice. Thank you.', priya: 'Stop, I’m going to cry. I’m making whoever did this cookies.',
    leo: 'I didn’t know I needed this. Setting it as my Strava banner.', sam: 'Oh. Wow. That’s… really thoughtful. Thank you.', zoe: 'I am honored and slightly afraid. 10/10.', omar: 'This is going in the story I tell about this team.',
  };
  const WHY = { maya: 'I just thought you deserved an infomercial.', dev: 'Poems are efficient. Feelings, compressed.', priya: 'You mentioned it once in Slack and I couldn’t stop thinking about it!', leo: 'I did three drafts. This one had the most cherubs.', sam: 'You seemed like a poem person.', zoe: 'I wanted to give you a song you can’t un-hear.', omar: 'Every legend deserves a portrait.' };

  let st;
  const fresh = () => ({ gifts: [], idx: 0, board: null, finalBoard: null, energy: 90, correct: 0 });
  function makeGifts() {
    const perm = C.derange(7);
    return C.players.map((angel, i) => {
      const r = C.players[perm[i]], [t, k] = TRAIT[r.id], g = MEDIUM[STYLE[angel.id]](r.name, t, k);
      return { angel, recipient: r, medium: STYLE[angel.id], ...g };
    });
  }

  function giftCard(g, reveal, id) {
    return '<div class="card"><div class="spread"><div class="kicker">Gift ' + (st.idx + 1) + ' of 7 · ' + g.medium + '</div><div>For ' + C.chip(g.recipient) + '</div></div>' +
      '<div class="cols" style="margin-top:12px"><div>' + C.genCard({ id, kind: g.kind === 'text' ? 'square' : g.kind === 'video' ? 'image' : g.kind, prompt: g.prompt, title: g.title, loading: !!id, sub: '<p style="margin:4px 0">' + C.esc(g.l1) + '<br>' + C.esc(g.l2) + '</p>' }) + '</div>' +
      '<div class="stack"><div class="angel ' + (reveal ? 'shown' : '') + '"><div class="kicker">The angel</div><div class="big-text">' + (reveal ? C.chip(g.angel, { big: true }) : '❓ Who made this?') + '</div></div>' +
      (C.mode === 'sim' ? '<div><small>Room energy</small><div class="energy"><i style="width:' + st.energy + '%"></i></div></div>' : '') + '</div></div></div>';
  }
  function presentScreen() {
    const g = st.gifts[st.idx];
    C.stage(giftCard(g, false, 'gift') + '<div class="card">' + C.script('This gift is for <b>' + C.esc(g.recipient.name) + '</b>. ' + C.esc(g.recipient.name) + ', read it out loud for us!') +
      '<button class="btn big" data-act="guess">🕵️ Guess the angel →</button></div>');
    C.generate('gift', 6);
  }
  function guessScreen() {
    const g = st.gifts[st.idx];
    st.board = new C.VoteBoard({ title: 'Who is the angel?', options: C.players.map(p => ({ id: p.id, label: p.name, emoji: p.emoji, short: p.name })), exclude: (v, o) => o.id === g.recipient.id || o.id === v.id && v.id !== g.angel.id });
    C.stage(giftCard(g, false) + '<div class="card"><h3>Everyone guesses (one vote each)</h3><p class="muted">The angel votes too. Bluffing encouraged.</p>' + st.board.html() +
      '<button class="btn big pink" data-act="reveal">🎉 Reveal the angel</button></div>');
  }
  function revealScreen() {
    const g = st.gifts[st.idx], right = st.board.count('main', g.angel.id);
    st.correct += right;
    C.stage(giftCard(g, true) + '<div class="card"><p class="big-text">' + right + ' of 7 guessed right ' + (right >= 4 ? '🎯' : right === 0 ? '🫣 total fake-out!' : '') + '</p>' +
      C.script(C.esc(g.recipient.name) + ', how do you feel? And ' + C.esc(g.angel.name) + ', why this gift?') +
      '<button class="btn big" data-act="next">' + (st.idx < 6 ? 'Next gift →' : '🏆 Final awards →') + '</button></div>');
  }
  function finalScreen() {
    st.finalBoard = new C.VoteBoard({ cats: [{ id: 'thoughtful', label: '💛 Most thoughtful' }, { id: 'funny', label: '😂 Funniest' }], options: st.gifts.map(g => ({ id: g.angel.id, label: g.title, short: 'for ' + g.recipient.name })), exclude: (v, o) => o.id === v.id });
    C.stage('<div class="card"><div class="kicker">Finale</div><h2>The awards</h2><p class="muted">You can’t vote for your own gift.</p>' + st.finalBoard.html() +
      (C.mode === 'host' ? '<button class="btn big" data-act="end">🏁 Finish & pacing report</button>' : '') + '</div>');
  }
  function summary() {
    if (!st.finalBoard) return '';
    const t = st.finalBoard.winner('thoughtful'), f = st.finalBoard.winner('funny'), g = id => st.gifts.find(x => x.angel.id === id);
    return '<div class="card"><h2>🏆 Winners</h2><p class="big-text">💛 ' + C.esc(g(t.id).title) + ' by ' + C.chip(g(t.id).angel) + '</p><p class="big-text">😂 ' + C.esc(g(f.id).title) + ' by ' + C.chip(g(f.id).angel) + '</p>' +
      '<p>Angels were guessed correctly ' + st.correct + ' times out of 49 guesses (' + Math.round(st.correct / 49 * 100) + '%).</p></div>';
  }

  const acts = {
    start() { C.phase('Present gift', 45); presentScreen(); },
    guess() { C.phase('Guess the angel', 60); guessScreen(); },
    reveal() { C.phase('Reveal + reaction + why', 105); revealScreen(); },
    next() { if (st.idx < 6) { st.idx++; acts.start(); } else { C.phase('Final awards vote', 180); finalScreen(); } },
    end() { C.finish(summary()); },
  };

  async function simulate() {
    st = fresh(); st.gifts = C.shuffle(makeGifts());
    C.phase('Welcome', 120);
    C.stage('<div class="card"><h2>🎁 The reveal ceremony</h2>' + C.script('All week you secretly made an AI gift for one teammate. Today we unwrap them one at a time. For each gift you guess who the angel was, then we reveal.') + '</div>');
    await C.sys('Facilitator explains the ceremony', 50); await C.say('zoe', 'I’ve been holding this secret for FIVE DAYS.', 10); await C.sys('Everyone settles; first gift queued', 30);
    for (let i = 0; i < 7; i++) {
      st.idx = i; const g = st.gifts[i];
      C.phase('Present gift', 45); presentScreen(); await C.wait(8);
      await C.say(g.recipient, 'Okay, reading it: “' + g.title + '”. ' + g.l2, 38 + i * 2);
      await C.sys('Room reacts to the gift 😂💛', 14);
      C.phase('Guess the angel', 60); guessScreen();
      const debate = i < 3 ? 2 : i < 5 ? 3 : 4; // guessing gets slower as the room gets looser
      for (let d = 0; d < debate; d++) await C.say(C.pick(C.players.filter(p => p.id !== g.recipient.id)), C.pick(['It’s a ' + g.medium + '. That screams ' + C.pick(C.players).name + '.', 'The ' + g.medium + ' thing… I have a theory.', 'Whoever did this is a menace.', 'I’m voting for whoever looks the most guilty.', 'Wait, did someone bring a ' + g.medium + ' last time?']), 11);
      await C.simVotes(st.board, v => v.id === g.angel.id ? C.pick(C.players.filter(p => p.id !== g.angel.id && p.id !== g.recipient.id)).id : C.chance(.38) ? g.angel.id : C.pick(C.players.filter(p => p.id !== g.recipient.id && p.id !== v.id)).id, { gap: 3 });
      C.phase('Reveal + reaction + why', 105); revealScreen(); await C.wait(6);
      const right = st.board.count('main', g.angel.id);
      await C.sys(right >= 3 ? 'Room: “I KNEW it!”' : 'Room gasps. Nobody saw that coming.', 6);
      await C.say(g.recipient, REACT[g.recipient.id], 20);
      await C.say(g.angel, WHY[g.angel.id], 24);
      await C.sys('Applause 👏', 8);
      st.energy = Math.max(35, st.energy - (i > 3 ? 9 : 4) + (right === 0 ? 8 : 0));
      if (i === 4) await C.say('dev', '(quietly checking the time)', 3);
      await C.wait(12);
    }
    C.phase('Final awards vote', 180); finalScreen(); await C.wait(15);
    await C.simVotes(st.finalBoard, () => C.pick(st.gifts.filter(g => g.medium === 'song' || g.medium === 'poem')).angel.id, { cat: 'thoughtful', gap: 3 });
    await C.simVotes(st.finalBoard, () => C.pick(st.gifts.filter(g => g.medium === 'fake-ad' || g.medium === 'image')).angel.id, { cat: 'funny', gap: 3 });
    await C.sys('Applause, winners announced', 30);
  }

  C.css('.energy{height:12px;border-radius:8px;background:var(--line);overflow:hidden}.energy i{display:block;height:100%;background:linear-gradient(90deg,var(--warn),var(--good))}.angel{border:2px dashed var(--line);border-radius:16px;padding:16px;text-align:center}.angel.shown{border-style:solid;border-color:var(--accent);animation:pop .5s}');

  C.game({
    num: '02', title: 'Secret Angel: Reveal Ceremony', emoji: '😇',
    tagline: 'All week, each player secretly made an AI gift for an assigned teammate. This is the 30-minute reveal: show each gift anonymously, guess the angel, reveal, react, then hand out awards.',
    how: '<p><b>Note:</b> the real game includes async gift-making over several days. This prototype only covers the live ceremony.</p><ol class="tight"><li>Gift shown anonymously; recipient reads it aloud</li><li>Everyone votes: who’s the angel?</li><li>Reveal → recipient reacts → angel says why</li><li>×7, then “most thoughtful” and “funniest” awards</li></ol>',
    plan: [{ name: 'Welcome', sec: 120 }, { name: 'Present gift', sec: 315 }, { name: 'Guess the angel', sec: 420 }, { name: 'Reveal + reaction + why', sec: 735 }, { name: 'Final awards vote', sec: 180 }],
    evaluating: ['Does ~3.5 min per gift fit 7 gifts in 30 min?', 'Does the guessing mechanic create suspense or drag?'],
    notes: '<p><b>Verdict: emotionally the strongest format, but the ceremony is tight.</b> 7 gifts × about 3.5 min is 25 min, before the welcome and awards. The simulation (transitions included) lands right at 30 min, with zero buffer.</p>' +
      '<h4>Suspense or drag?</h4><p>Gifts 1–3: suspense (people don’t know each other’s styles yet, so every reveal is a surprise). From gift 4 on the guessing <b>drags</b>: people start pattern-matching mediums (“it’s a poem, so it’s Dev”) and debating, so each guess phase grows by 20–30s.</p>' +
      '<h4>Suggested cuts</h4><ul class="tight"><li><b>Best fix:</b> make guessing a 15s show of hands instead of a tallied vote. Saves about 4 min.</li><li>Or guess all 7 angels at once at the end, as a matching game: one big suspense moment instead of seven small ones.</li><li>Cap “why did you make this” at 20s.</li></ul>' +
      '<div class="risk"><b>Facilitator risk note:</b> medium-low. First-time teammates know little about each other, so gifts will be generic unless angels get a prompt sheet (“ask your person 3 questions this week”). Make sure every recipient gets something of similar effort: an obviously low-effort gift stings in public.</div>',
    host() {
      st = fresh(); st.gifts = C.shuffle(makeGifts());
      C.phase('Welcome', 120);
      C.stage('<div class="card"><h2>🎁 The reveal ceremony</h2>' + C.script('All week you secretly made an AI gift for one teammate. Today we unwrap them one at a time. For each gift you guess who the angel was, then we reveal.') +
        '<p class="muted">Gifts here are sample gifts generated for your 7 players.</p><button class="btn big" data-act="start">Unwrap gift 1 →</button></div>');
    },
    simulate, summary, acts,
  });
})();
