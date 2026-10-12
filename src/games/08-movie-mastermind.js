// TITLE: 08 · Movie Mastermind (cryptic clues)
(function () {
  const C = Core;
  const SETS = [
    { a: 'Titanic', alt: ['titanic'], c: ['An unsinkable promise, broken by frozen water.', 'A portrait session goes better than the maiden voyage.', '“I’m the king of the world!” …and a door with room for two.'], wrong: ['Poseidon', 'The Notebook'] },
    { a: 'Jurassic Park', alt: ['jurassic park', 'jurassic world'], c: ['A theme park whose main attractions refuse to stay extinct.', 'Life, uh, finds a way, especially through electric fences.', 'A glass of water ripples. Something large with tiny arms is near.'], wrong: ['King Kong', 'Godzilla'] },
    { a: 'The Lion King', alt: ['lion king', 'the lion king'], c: ['A royal succession dispute settled on a rock at sunrise.', 'An uncle, a stampede, and a carefree philosophy from a meerkat and a warthog.', 'Hakuna Matata.'], wrong: ['Hamlet', 'Madagascar'] },
    { a: 'Finding Nemo', alt: ['finding nemo', 'nemo'], c: ['A single father crosses an ocean with a companion who forgets everything.', 'A dentist’s aquarium plans a great escape.', 'Just keep swimming (orange and white stripes).'], wrong: ['Shark Tale', 'The Little Mermaid'] },
    { a: 'Jaws', alt: ['jaws'], c: ['A beach town’s mayor refuses to close for the summer season.', 'Two notes on a cello mean you should get out of the water.', 'You’re gonna need a bigger boat.'], wrong: ['The Meg', 'Moby Dick'] },
    { a: 'The Wizard of Oz', alt: ['wizard of oz', 'the wizard of oz', 'oz'], c: ['A storm relocates a farm girl’s house onto somebody’s sister.', 'A road paved in a precious metal leads to a man behind a curtain.', 'Ruby slippers. There’s no place like home.'], wrong: ['Twister', 'Alice in Wonderland'] },
    { a: 'Back to the Future', alt: ['back to the future'], c: ['A teenager nearly erases himself by attending a school dance.', '88 miles per hour. 1.21 gigawatts.', 'A DeLorean that travels through time.'], wrong: ['Hot Tub Time Machine', 'Grease'] },
    { a: 'Toy Story', alt: ['toy story'], c: ['A cowboy’s job security is threatened by a new arrival with a laser.', 'They belong to Andy and freeze whenever humans walk in.', 'To infinity and beyond!'], wrong: ['Night at the Museum', 'Small Soldiers'] },
  ];
  const PTS = [5, 3, 2], HINT_COST = 2, LOCK = 10, ROUND = 90, START = 6;
  const TEAMS = [{ id: 'A', name: 'Popcorn', emoji: '🍿', members: ['maya', 'dev', 'priya', 'leo'], greed: .35 }, { id: 'B', name: 'Nachos', emoji: '🌮', members: ['sam', 'zoe', 'omar'], greed: .2 }];

  let st;
  const fresh = () => ({ set: C.sample(SETS, 8), r: 0, level: 0, start: 0, lock: null, done: false, teams: TEAMS.map(t => ({ ...t, score: START, hints: 0, wrong: 0 })), log: [] });
  const norm = s => s.toLowerCase().replace(/[^a-z ]/g, '').trim();
  const T = id => st.teams.find(t => t.id === id);
  const elapsed = () => ROUND - C.timerLeft();

  function screen(msg) {
    const s = st.set[st.r], host = C.mode === 'host';
    C.stage('<div class="card"><div class="spread"><div class="kicker">Round ' + (st.r + 1) + ' of 8 · worth ' + (PTS[st.level] || 0) + ' pts now</div>' + (st.lock ? '<span class="tag warn">🔒 ' + C.esc(T(st.lock.team).name) + ' has a ' + LOCK + 's head start</span>' : '') + '</div>' +
      '<div class="clues">' + s.c.map((c, i) => '<div class="clue ' + (i <= st.level ? 'open' : '') + '"><div class="kicker">Clue ' + (i + 1) + ' · ' + PTS[i] + ' pts</div>' + (i <= st.level ? '<p>' + C.esc(c) + '</p>' : '<p class="muted">🔒 unlocks at ' + (i * 30) + 's, or ask the AI</p>') + '</div>').join('') + '</div>' +
      (st.done ? '<p class="big-text">🎬 ' + C.esc(s.a) + '</p>' : '') + (msg ? '<p class="big-text">' + msg + '</p>' : '') + '</div>' +
      '<div class="cols">' + st.teams.map(t => '<div class="card tint"><div class="spread"><h3>' + t.emoji + ' ' + t.name + '</h3><span class="score">' + t.score + '</span></div><div>' + t.members.map(id => C.chip(id)).join(' ') + '</div>' +
        (host && !st.done ? '<div class="row" style="margin-top:10px"><input id="ans' + t.id + '" data-enter="guess" data-t="' + t.id + '" placeholder="Team’s guess"><button class="btn" data-act="guess" data-t="' + t.id + '">Guess</button>' +
          '<button class="btn ghost" data-act="hint" data-t="' + t.id + '"' + (st.level >= 2 || t.score < HINT_COST ? ' disabled' : '') + '>🤖 Ask AI (−' + HINT_COST + ')</button></div>' : '') +
        '<small>Hints bought: ' + t.hints + ' · wrong guesses: ' + t.wrong + '</small></div>').join('') + '</div>' +
      (host && st.done ? '<button class="btn big" data-act="next">' + (st.r < 7 ? 'Next round →' : '🏆 Final scores') + '</button>' : '') + (host && !st.done ? '<button class="btn ghost" data-act="skip">Nobody got it → reveal</button>' : ''));
  }
  function startRound() { st.started = true; st.level = 0; st.lock = null; st.done = false; C.timer('Round', ROUND); screen(); }
  function revealNext(by) {
    if (st.level >= 2) return;
    st.level++;
    if (by) { const t = T(by); t.score -= HINT_COST; t.hints++; st.lock = { team: by, until: elapsed() + LOCK }; C.log(t.members[0], ' (' + t.name + ') spent ' + HINT_COST + ' pts: the AI reveals clue ' + (st.level + 1) + ' early, plus a ' + LOCK + 's head start', 'say'); }
    else C.log(null, '⏱ Clue ' + (st.level + 1) + ' auto-revealed', 'sys');
    screen();
  }
  function guess(teamId, text) {
    const s = st.set[st.r], t = T(teamId);
    if (st.lock && st.lock.team !== teamId && elapsed() < st.lock.until) { C.log(null, '🔒 ' + t.name + ' is locked out for a moment', 'sys'); return false; }
    if (s.alt.includes(norm(text))) { t.score += PTS[st.level]; st.done = true; C.clearTimer(); C.log(t.members[0], ' (' + t.name + ') got it: “' + text + '” for ' + PTS[st.level] + ' pts!', 'say'); screen('✅ ' + t.emoji + ' ' + t.name + ' +' + PTS[st.level]); return true; }
    t.score -= 1; t.wrong++; C.log(t.members[0], ' (' + t.name + ') guessed “' + text + '”: wrong, −1', 'say'); screen(); return false;
  }
  // Auto-reveal clues on the clock (host mode; the sim drives its own loop).
  setInterval(() => {
    if (C.mode !== 'host' || !st || !st.started || st.done || C.finished) return;
    if (C.timerLeft() <= 0 && st.level >= 2) return;
    if (st.level < 2 && elapsed() >= (st.level + 1) * 30) revealNext();
  }, 400);
  const lb = () => '<div class="cols">' + st.teams.slice().sort((a, b) => b.score - a.score).map((t, i) => '<div class="card tint center"><div class="kicker">' + (i ? '2nd' : '🏆 Winner') + '</div><h2>' + t.emoji + ' ' + t.name + '</h2><div class="score">' + t.score + '</div><small>' + t.hints + ' hints bought · ' + t.wrong + ' wrong guesses</small></div>').join('') + '</div>';
  const summary = () => st ? lb() : '';

  const acts = {
    start() { C.phase('Rounds', 1200); startRound(); },
    guess(d) { const i = C.$('#ans' + d.t); if (i && i.value.trim()) guess(d.t, i.value.trim()); },
    hint(d) { revealNext(d.t); },
    skip() { st.done = true; C.clearTimer(); screen('Nobody got it 🫠'); },
    next() { if (st.r < 7) { st.r++; startRound(); } else { C.phase('Final scores', 60); C.stage(lb() + '<button class="btn big" data-act="end">🏁 Finish & pacing report</button>'); } },
    end() { C.finish(summary()); },
  };

  async function simulate() {
    st = fresh();
    C.phase('Intro & rules', 120); C.stage('<div class="card"><h2>🕵️ Movie Mastermind</h2>' + C.script('Cryptic clues about a famous movie. A new clue unlocks every 30 seconds, and each clue is worth less. Stuck? Pay 2 points and the AI reveals the next clue right now, and your team gets a 10-second head start.') + '</div>');
    await C.sys('Facilitator explains the hint economy', 70); await C.say('leo', 'So it’s a bidding war for information. I love it.', 8); await C.sys('Teams huddle', 30);
    C.phase('Rounds', 1200);
    for (let r = 0; r < 8; r++) {
      st.r = r; startRound(); const s = st.set[r];
      await C.sys('Clue 1 read aloud', 6);
      let lastLevelAt = 0;
      while (!st.done && elapsed() < ROUND) {
        await C.wait(5);
        if (st.level < 2 && elapsed() >= (st.level + 1) * 30) { revealNext(); lastLevelAt = elapsed(); }
        for (const t of C.shuffle(st.teams)) {
          if (st.done) break;
          if (st.lock && st.lock.team !== t.id && elapsed() < st.lock.until) continue;
          const pRight = [.06, .17, .38][st.level] * (t.id === 'A' ? 1.1 : 1);
          if (C.chance(pRight)) { await C.say(C.pick(t.members), s.a + '!', 1); guess(t.id, s.a); break; }
          if (C.chance(.04)) { const w = C.pick(s.wrong); await C.say(C.pick(t.members), w + '?', 1); guess(t.id, w); }
          else if (st.level < 2 && t.score >= HINT_COST + 1 && elapsed() - lastLevelAt > 12 && C.chance(t.greed * .35)) {
            await C.say(C.pick(t.members), C.pick(['Buy the hint. BUY IT.', 'Worth two points, trust me.', 'We’re stuck. Ask the robot.']), 2);
            revealNext(t.id); lastLevelAt = elapsed();
          }
        }
      }
      if (!st.done) { st.done = true; C.clearTimer(); screen('Nobody got it 🫠'); await C.sys('Answer: ' + s.a + '. Groans.', 6); }
      await C.sys('Score check: ' + st.teams.map(t => t.emoji + ' ' + t.score).join(' vs '), 8);
      if (r === 3) await C.say('omar', 'Halftime speech: we stop buying hints. We are better than this.', 10);
      await C.wait(10);
    }
    C.phase('Final scores', 60); C.stage(lb()); await C.sys('Winner announced', 30);
  }

  C.css('.clues{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px;margin-top:10px}.clue{border:2px dashed var(--line);border-radius:14px;padding:12px}.clue.open{border-style:solid;border-color:var(--accent2);animation:pop .4s}.clue p{font-size:1.1rem;font-weight:650;margin:6px 0 0}.score{font-size:2rem;font-weight:900;font-variant-numeric:tabular-nums}');

  C.game({
    num: '08', title: 'Movie Mastermind', emoji: '🕵️',
    tagline: 'Two teams decode cryptic clues about famous movies. Clues get more obvious every 30 seconds and are worth less. Or pay points to make the AI reveal the next one early.',
    how: '<ol class="tight"><li>Clue 1 (5 pts) → clue 2 at 30s (3 pts) → clue 3 at 60s (2 pts)</li><li>🤖 Ask AI: −2 pts, reveals the next clue now, and gives your team a 10s head start</li><li>Wrong guess: −1</li><li>8 rounds, 90s max each</li></ol>',
    plan: [{ name: 'Intro & rules', sec: 120 }, { name: 'Rounds', sec: 1200 }, { name: 'Final scores', sec: 60 }],
    evaluating: ['Does the hint economy create interesting decisions?', 'Round timing?'],
    notes: '<p><b>Verdict: solid team game, and the hint economy works, but only barely.</b> But it’s short: 8 rounds run only about 8–10 min.</p>' +
      '<h4>Hint economy</h4><ul class="tight"><li>Buying a hint makes sense mid-clue-1 (pay 2, then win 3 = net +1, plus the head start). That’s a real decision, and teams argue about it, which is good team chatter for strangers.</li><li>But because the clue unlocks for <b>both</b> teams, the 10s head start is the only exclusive benefit. Without it, nobody would ever buy.</li><li>Tweak: make the AI hint a <i>different</i> clue that only the buying team sees (on their phones), not just an early reveal.</li></ul>' +
      '<h4>Round timing</h4><p>Average round is about 50–75s including the score check, and most rounds end on clue 2. To fill 20+ min, use 14–16 movies, or add a final lightning round. Keep the 30s clue interval: anything shorter and a hint is never worth buying.</p>' +
      '<div class="risk"><b>Facilitator risk note:</b> low. Teams of strangers default to the loudest person answering. Rotate a “team captain” who submits answers each round.</div>',
    host() {
      st = fresh(); C.phase('Intro & rules', 120);
      C.stage('<div class="card"><h2>🕵️ Movie Mastermind</h2>' + C.script('Cryptic clues about a famous movie. A new clue unlocks every 30 seconds, and each clue is worth less. Stuck? Pay 2 points and the AI reveals the next clue right now, and your team gets a 10-second head start.') +
        '<p>Teams: ' + st.teams.map(t => t.emoji + ' <b>' + t.name + '</b> ' + t.members.map(id => C.chip(id)).join(' ')).join(' &nbsp; ') + '</p><button class="btn big" data-act="start">Round 1 →</button></div>');
    },
    simulate, summary, acts,
  });
})();
