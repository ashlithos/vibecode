// TITLE: 04 · Secret Angel: Movie Poster Gallery
(function () {
  const C = Core;
  // Two poster ideas per recipient; the angel's persona picks one.
  const POSTERS = {
    maya: [['THE GREEN MILE', 'One woman. Forty houseplants. Zero regrets.', 'Botanical thriller', 'Maya · and 40 Plants as “The Plants”'], ['LOST IN IKEA', 'She went in for a lamp. She came out a legend.', 'Survival epic', 'Maya · Introducing an Allen Key']],
    dev: [['THE SHIRT', 'He owns five. They are all the same. He is at peace.', 'Minimalist drama', 'Dev · Shirts 1 through 5'], ['404: EMOTION NOT FOUND', 'Deadpan. Dependable. Secretly hilarious.', 'Tech noir', 'Dev · with a Very Calm Terminal']],
    priya: [['BAKE ME HOME', 'When stress rises, so does the dough.', 'Feel-good comedy', 'Priya · and a Batch of Cookies'], ['THE GREAT RESEARCH BAKE OFF', 'Hypothesis: everyone deserves a cookie.', 'Heartwarming documentary', 'Priya · co-starring Oven Mitts']],
    leo: [['MARATHON MAN 3: ROADMAP', 'He ran 26.2 miles. Then he wrote a PRD.', 'Action', 'Leo · and One Very Tired Dog'], ['THE OVERACHIEVER', 'Two startups. Three marathons. One calendar.', 'Sports biopic', 'Leo · as Leo, twice']],
    sam: [['QUIET HOURS', 'Some heroes don’t talk. They hike.', 'Indie drama', 'Sam · and the Sunrise'], ['THE DATA WHISPERER', 'She sees the patterns nobody else sees.', 'Mystery', 'Sam · with a Spreadsheet']],
    zoe: [['PUN INTENDED', 'No name is safe.', 'Romantic comedy', 'Zoe · and Your Name, Probably'], ['THE PUNISHER (OF PUNS)', 'Groans are her currency.', 'Action comedy', 'Zoe · Introducing Dev as “The Victim”']],
    omar: [['MISSED FLIGHT', 'Lisbon. A stranger. A startup. A story he will tell you.', 'Epic adventure', 'Omar · Narrated by Omar'], ['THE STORYTELLER', 'Every legend starts with “so, funny story…”', 'Fantasy saga', 'Omar · and a Cast of Thousands']],
  };
  const PICK = { maya: 1, dev: 1, priya: 0, leo: 0, sam: 0, zoe: 0, omar: 1 };
  const WALK = ['I need “The Green Mile” framed.', 'Who made the shirt one?? I’m dying.', 'These are so good.', 'Okay the tagline on that one is perfect.', 'I want the director’s cut of all of these.', 'Wait, is that a real movie?', 'The fonts are doing a lot of work.'];

  let st;
  const fresh = () => ({ posters: [], idx: -1, revealed: {}, board: null, best: null, right: 0 });
  function make() {
    const perm = C.derange(7);
    return C.shuffle(C.players.map((angel, i) => {
      const r = C.players[perm[i]], [title, tagline, genre, star] = POSTERS[r.id][PICK[angel.id]];
      return { angel, recipient: r, title, tagline, genre, star, prompt: 'movie poster, ' + genre.toLowerCase() + ', titled "' + title + '", tagline "' + tagline + '", starring a person who looks like ' + r.name };
    }));
  }
  function gallery() {
    return '<div class="gallery">' + st.posters.map((p, i) => '<div class="gpost' + (st.idx >= 0 && i !== st.idx ? ' dim' : '') + (i === st.idx ? ' cur' : '') + '">' +
      C.genCard({ kind: 'poster', prompt: p.prompt, loading: false, hidePrompt: true, overlayTitle: p.title, overlaySub: p.tagline, emoji: C.emojisFor(p.prompt + ' movie', 2) }) +
      '<div class="gmeta"><span class="tag">' + C.esc(p.genre) + '</span><div><small>Starring</small> ' + C.esc(p.star) + '</div><div><small>For</small> ' + C.chip(p.recipient) + '</div>' +
      '<div class="gangel">' + (st.revealed[i] ? '🎬 Made by ' + C.chip(p.angel) : '🎬 Made by ❓') + '</div></div></div>').join('') + '</div>';
  }
  function walkScreen() {
    C.stage('<div class="card"><div class="kicker">Gallery walk · 3 min</div><h2>Opening night 🎬</h2>' + C.script('Seven posters, one for each of you. Take three minutes, look at them all, and form theories about who made what.') +
      '<button class="btn big" data-act="first">Start guessing →</button></div>' + gallery());
  }
  function guessScreen() {
    const p = st.posters[st.idx];
    st.board = new C.VoteBoard({ title: 'Who made “' + p.title + '”?', options: C.players.map(q => ({ id: q.id, label: q.name, emoji: q.emoji })), exclude: (v, o) => o.id === p.recipient.id || (o.id === v.id && v.id !== p.angel.id) });
    C.stage('<div class="cols"><div class="card"><div class="kicker">Poster ' + (st.idx + 1) + ' of 7</div><h2>' + C.esc(p.title) + '</h2><p>For ' + C.chip(p.recipient) + '</p>' + st.board.html() +
      '<button class="btn big pink" data-act="reveal">🎬 Reveal the director</button></div><div>' + gallery() + '</div></div>');
  }
  function revealScreen() {
    const p = st.posters[st.idx]; st.revealed[st.idx] = true;
    const n = st.board.count('main', p.angel.id); st.right += n;
    C.stage('<div class="cols"><div class="card"><div class="kicker">Poster ' + (st.idx + 1) + ' of 7 · revealed</div><h2>' + C.esc(p.title) + '</h2><p class="big-text">Directed by ' + C.chip(p.angel, { big: true }) + '</p><p>' + n + ' of 7 guessed it.</p>' +
      '<button class="btn big" data-act="next">' + (st.idx < 6 ? 'Next poster →' : '🏆 Vote for best poster →') + '</button></div><div>' + gallery() + '</div></div>');
  }
  function bestScreen() {
    st.idx = -1;
    st.best = new C.VoteBoard({ title: 'Best poster of the night', options: st.posters.map((p, i) => ({ id: 'p' + i, label: p.title, short: p.title.slice(0, 16) })), exclude: (v, o) => st.posters[+o.id.slice(1)].angel.id === v.id });
    C.stage('<div class="card"><h2>🏆 Best poster</h2><p class="muted">You can’t vote for your own.</p>' + st.best.html() + (C.mode === 'host' ? '<button class="btn big" data-act="end">🏁 Finish & pacing report</button>' : '') + '</div>' + gallery());
  }
  function summary() {
    if (!st.best || !st.best.voted()) return '';
    const w = st.posters[+st.best.winner().id.slice(1)];
    return '<div class="card center"><div class="kicker">Winner</div><h2>🏆 ' + C.esc(w.title) + '</h2><p>by ' + C.chip(w.angel) + ' for ' + C.chip(w.recipient) + '</p><div style="max-width:300px;margin:auto">' +
      C.genCard({ kind: 'poster', prompt: w.prompt, loading: false, overlayTitle: w.title, overlaySub: w.tagline }) + '</div><p>Directors guessed correctly ' + st.right + '/49 times.</p></div>';
  }

  const acts = {
    walk() { C.phase('Gallery walk', 180); C.timer('Gallery walk', 180); walkScreen(); },
    first() { C.clearTimer(); st.idx = 0; C.phase('Guess the director', 45); guessScreen(); },
    reveal() { C.phase('Reveal + recipient reaction', 45); revealScreen(); },
    next() { if (st.idx < 6) { st.idx++; C.phase('Guess the director', 45); guessScreen(); } else { C.phase('Best poster vote', 120); bestScreen(); } },
    end() { C.finish(summary()); },
  };

  async function simulate() {
    st = fresh(); st.posters = make();
    C.phase('Welcome', 90);
    C.stage('<div class="card"><h2>🎬 Opening night</h2>' + C.script('All week, each of you made a movie poster about one teammate’s life. Tonight is the premiere.') + '</div>');
    await C.sys('Facilitator sets up the premiere', 45); await C.say('omar', 'I brought popcorn. Metaphorically.', 8); await C.wait(20);
    C.phase('Gallery walk', 180); walkScreen();
    for (const line of C.sample(WALK, 5)) { await C.wait(C.rand(12, 25)); await C.say(C.pick(C.players), line, 6); }
    await C.wait(30);
    for (let i = 0; i < 7; i++) {
      st.idx = i; const p = st.posters[i];
      C.phase('Guess the director', 45); guessScreen(); await C.wait(5);
      await C.say(C.pick(C.players), C.pick(['That tagline is SO ' + C.pick(C.players).name + '.', 'Genre: ' + p.genre + '. Has to be someone dramatic.', 'I have no idea. Voting for vibes.']), 9);
      await C.say(C.pick(C.players), C.pick(['No way, they’d never pick that genre.', 'It’s always the quiet ones.', 'Final answer: ' + C.pick(C.players).name + '.']), 7);
      await C.simVotes(st.board, v => v.id === p.angel.id ? C.pick(C.players.filter(q => q.id !== p.angel.id && q.id !== p.recipient.id)).id : C.chance(.33) ? p.angel.id : C.pick(C.players.filter(q => q.id !== p.recipient.id && q.id !== v.id)).id, { gap: 2.5 });
      C.phase('Reveal + recipient reaction', 45); revealScreen(); await C.wait(5);
      await C.say(p.recipient, C.pick(['I will be using this as my LinkedIn banner.', 'This is the nicest thing. Also slightly attacked.', 'Accurate. Painfully accurate.', 'Can I get a signed copy?']), 18);
      await C.sys('Laughter 😂', 8);
      await C.say(p.angel, C.pick(['The tagline came to me in the shower.', 'I tried four genres before this one.', 'You said one thing in Slack and I ran with it.']), 15);
      await C.wait(6);
    }
    C.phase('Best poster vote', 120); bestScreen(); await C.wait(10);
    await C.simVotes(st.best, () => 'p' + C.pick([0, 1, 2, 2, 3, 4, 5, 6]), { gap: 3 });
    await C.sys('Winner announced 🏆', 25);
    C.phase('Wrap', 60); await C.sys('Facilitator: “these go in our team wiki”', 35);
  }

  C.css('.gallery{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:12px}.gpost{transition:opacity .3s,transform .3s}.gpost.dim{opacity:.35}.gpost.cur{transform:scale(1.03)}.gpost .gen{max-width:none}.gpost .gen-art .over .pt{font-size:1rem}.gpost .gen-art .over .ps{font-size:.72rem}.gpost .gen-meta{display:none}' +
    '.gmeta{font-size:.82rem;padding:6px 2px;display:flex;flex-direction:column;gap:4px}.gangel{font-weight:700}');

  C.game({
    num: '04', title: 'Secret Angel: Poster Gallery', emoji: '🎬',
    tagline: 'Same secret-angel idea as #2, but every gift is the same medium: a movie poster about a teammate’s life. A gallery of 7, a guess for each director, then best poster.',
    how: '<ol class="tight"><li>Gallery walk: all 7 posters at once</li><li>For each poster, guess the director (angel)</li><li>Reveal + 1-line reactions</li><li>Vote for best poster</li></ol>',
    plan: [{ name: 'Welcome', sec: 90 }, { name: 'Gallery walk', sec: 180 }, { name: 'Guess the director', sec: 315 }, { name: 'Reveal + recipient reaction', sec: 315 }, { name: 'Best poster vote', sec: 120 }, { name: 'Wrap', sec: 60 }],
    evaluating: ['Does the uniform medium make comparison more fun?', 'Is the gallery view readable with 7 items?'],
    notes: '<p><b>Verdict: tighter and fairer than #2, with time to spare.</b> It runs about 19–20 min. The uniform medium makes the “best poster” vote meaningful (apples to apples) and makes effort gaps less obvious, which matters for new teams.</p>' +
      '<h4>Uniform medium</h4><ul class="tight"><li>✅ Comparison is fun: people debate taglines and genres, not “a song vs. a poem”.</li><li>⚠️ Guessing gets harder, because there are no medium clues. Correct-guess rates fall to about 30%. That’s fine: more surprise.</li></ul>' +
      '<h4>Gallery readability</h4><p>7 posters fit as a 4+3 grid on a laptop or TV and 2 columns on a phone. At poster size the <b>title reads, the tagline barely does</b>. On a shared screen, show the current poster big beside the dimmed gallery (as this prototype does during guessing).</p>' +
      '<h4>Using the spare ~9 min</h4><ul class="tight"><li>Give each recipient 30s to “pitch their movie” as if it were real. Big laughs, and they share something about themselves.</li></ul>' +
      '<div class="risk"><b>Facilitator risk note:</b> low-medium. Posters about someone’s “life” can poke at appearance. Give angels a rule: <i>the poster is about something they told you, not how they look.</i></div>',
    host() {
      st = fresh(); st.posters = make();
      C.phase('Welcome', 90);
      C.stage('<div class="card"><h2>🎬 Opening night</h2>' + C.script('All week, each of you made a movie poster about one teammate’s life. Tonight is the premiere.') + '<button class="btn big" data-act="walk">Open the gallery →</button></div>');
    },
    simulate, summary, acts,
  });
})();
