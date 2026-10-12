// TITLE: 06 · Lights, Camera, AI!
(function () {
  const C = Core;
  const BANK = ['submarine', 'grandma', 'volcano', 'spreadsheet', 'llama', 'heist', 'time machine', 'karaoke', 'haunted', 'croissant', 'robot', 'wedding', 'pirate', 'cactus', 'tax season', 'disco', 'penguin', 'zombie', 'IKEA', 'moon', 'cowboy', 'dragon', 'reality show', 'yoga', 'snowstorm', 'goldfish', 'hackathon', 'pizza', 'lighthouse', 'conspiracy'];
  const TEAMS = [{ id: 'A', name: 'Team Popcorn', emoji: '🍿', members: ['maya', 'dev', 'priya', 'leo'] }, { id: 'B', name: 'Team Nachos', emoji: '🌮', members: ['sam', 'zoe', 'omar'] }];
  const P = {
    role: ['washed-up karaoke champion', 'retired spy', 'overworked intern', 'disgraced pastry chef', 'small-town mayor'], name: ['Brenda', 'Rex', 'Captain Lou', 'Dr. Margo', 'Kevin'],
    power: ['rewind exactly 11 minutes', 'speak to office plants', 'predict the stock market of snacks', 'turn sadness into confetti'], sidekick: ['sarcastic goldfish', 'nervous accountant', 'teenage hacker', 'very old dog'],
    secret: ['a prince', 'their evil twin', 'fluent in dolphin', 'the one who started it all'], place: ['a lighthouse in Maine', 'a Las Vegas buffet', 'the bottom of the ocean', 'a suburban Costco', 'the moon'],
    villain: ['a billionaire with a jetpack', 'the HOA', 'an AI that only speaks in haiku', 'their ex'], lesson: ['friendship', 'the friends we made', 'a really good sandwich', 'believing in yourself'],
    adj: ['heartwarming', 'unhinged', 'explosive', 'tender', 'baffling'], rating: ['mild peril', 'excessive dancing', 'one very rude llama', 'emotional karaoke'],
  };
  const g = k => C.pick(P[k]);
  const cap = s => s.replace(/\b\w/g, c => c.toUpperCase());
  function madlib(words) {
    const name = g('name');
    const title = C.pick(['The ' + cap(words[0]) + ' Job', cap(words[1]) + ' Protocol', 'Return of the ' + cap(words[2]), 'Fast & ' + cap(words[0]) + 'ious', cap(words[2]) + ': Origins']);
    const syn = 'In a world where ' + words[0] + ' is outlawed, a ' + g('role') + ' named ' + name + ' discovers a ' + words[1] + ' that can ' + g('power') + '. With only three days before the ' + words[2] + ', ' + name + ' must team up with a ' + g('sidekick') + ' who is secretly ' + g('secret') + '. Together they race from ' + g('place') + ' to ' + g('place') + ', chased by ' + g('villain') + '. Along the way they learn that the real ' + words[1] + ' was ' + g('lesson') + ' all along. Packed with action and at least one slow-motion montage, ' + title + ' is the most ' + g('adj') + ' film of the year. Rated PG-13 for ' + g('rating') + '.';
    return { title, syn };
  }
  const wc = s => (s.trim().match(/\S+/g) || []).length;

  let st;
  const fresh = () => ({ teams: TEAMS.map(t => ({ ...t, words: [], title: '', syn: '', shown: 0, done: false })), board: null, cur: 0 });
  const team = id => st.teams.find(t => t.id === id);
  const teamOf = pid => st.teams.find(t => t.members.includes(pid));
  const posterPrompt = t => 'movie poster for "' + (t.title || 'Untitled') + '", featuring ' + t.words.join(', ') + ', cinematic, dramatic lighting';

  function teamsScreen() {
    C.stage('<div class="card"><div class="kicker">Team split</div><h2>Two studios, one premiere</h2><div class="cols">' + st.teams.map(t => '<div class="card tint"><h3>' + t.emoji + ' ' + t.name + '</h3>' + t.members.map(id => C.chip(id)).join(' ') + '</div>').join('') + '</div>' +
      '<button class="btn big" data-act="draw">🎲 Draw 3 words each →</button></div>');
  }
  function drawScreen() {
    C.stage('<div class="card"><div class="kicker">Word draw</div><h2>Your movie must include…</h2><div class="cols">' + st.teams.map(t => '<div class="card tint"><h3>' + t.emoji + ' ' + t.name + '</h3><div class="row">' + t.words.map(w => '<span class="wordcard">' + C.esc(w) + '</span>').join('') + '</div></div>').join('') + '</div>' +
      (C.mode === 'host' ? '<div class="cta"><button class="btn ghost" data-act="redraw">🔁 Redraw</button><button class="btn big" data-act="write">🎬 Start writing (12 min) →</button></div>' : '') + '</div>');
  }
  function workScreen() {
    const host = C.mode === 'host';
    C.stage('<div class="cols">' + st.teams.map(t => '<div class="card"><div class="spread"><h3>' + t.emoji + ' ' + t.name + '</h3><div class="row">' + t.words.map(w => '<span class="tag">' + C.esc(w) + '</span>').join('') + '</div></div>' +
      '<label><small>Title</small>' + (host ? '<input data-t="' + t.id + '" value="' + C.esc(t.title) + '" placeholder="Movie title">' : '<div class="big-text" id="title' + t.id + '">' + (C.esc(t.title) || '<span class="muted">arguing about it…</span>') + '</div>') + '</label>' +
      '<label><small>Synopsis (aim for 100 words) · <b id="wc' + t.id + '">' + wc(t.syn) + '</b> words</small>' + (host ? '<textarea data-s="' + t.id + '" style="min-height:180px">' + C.esc(t.syn) + '</textarea>' : '<div class="syn" id="syn' + t.id + '">' + C.esc(t.syn) + '</div>') + '</label>' +
      (host ? '<button class="btn small ghost" data-act="madlib" data-t="' + t.id + '">🎲 Mad-lib a sample</button>' : '') + '<div class="poster" id="post' + t.id + '"></div></div>').join('') + '</div>' +
      (host ? '<div class="cta"><button class="btn big pink" data-act="posters">🖼️ Generate posters →</button></div>' : ''));
  }
  function readWork() { C.$$('[data-t]').forEach(i => { if (i.tagName === 'INPUT') team(i.dataset.t).title = i.value.trim(); }); C.$$('[data-s]').forEach(i => { team(i.dataset.s).syn = i.value.trim(); }); }
  function pitchScreen(t) {
    C.stage('<div class="pitch card"><div class="kicker">' + t.emoji + ' ' + t.name + ' presents</div><div class="cols"><div>' + C.genCard({ kind: 'poster', prompt: posterPrompt(t), loading: false, overlayTitle: t.title, overlaySub: 'Starring ' + t.members.map(id => C.player(id).name).join(', ') }) + '</div>' +
      '<div><h1>' + C.esc(t.title) + '</h1><p style="font-size:1.15rem">' + C.esc(t.syn) + '</p><div class="row">' + t.words.map(w => '<span class="tag">' + C.esc(w) + '</span>').join('') + '</div>' +
      (C.mode === 'host' ? '<div class="cta"><button class="btn big" data-act="' + (st.cur === 0 ? 'pitch2' : 'vote') + '">' + (st.cur === 0 ? 'Next studio →' : '🗳️ Vote →') + '</button></div>' : '') + '</div></div></div>');
  }
  function voteScreen() {
    st.board = new C.VoteBoard({ title: 'Most creative movie', options: st.teams.map(t => ({ id: t.id, label: t.title || t.name, emoji: t.emoji })), exclude: (v, o) => teamOf(v.id).id === o.id });
    C.stage('<div class="card"><h2>🗳️ Most creative</h2><p class="muted">You can’t vote for your own studio. (With two teams, that means everyone votes for the other one, so watch out for that.)</p>' + st.board.html() + (C.mode === 'host' ? '<button class="btn big" data-act="end">🏁 Finish & pacing report</button>' : '') + '</div>');
  }
  function summary() {
    if (!st.board || !st.board.voted()) return '';
    const w = team(st.board.winner().id);
    return '<div class="card center"><div class="kicker">Best picture</div><h2>🏆 ' + C.esc(w.title) + '</h2><p>' + w.emoji + ' ' + w.name + '</p></div>';
  }

  const acts = {
    draw() { C.phase('Word draw', 60); st.teams.forEach(t => t.words = C.sample(BANK, 3)); drawScreen(); },
    redraw() { st.teams.forEach(t => t.words = C.sample(BANK, 3)); drawScreen(); },
    write() { C.phase('Writing: title + synopsis', 720); C.timer('Writers’ room', 720); workScreen(); },
    madlib(d) { readWork(); const t = team(d.t), m = madlib(t.words); t.title = m.title; t.syn = m.syn; workScreen(); },
    async posters() { readWork(); C.clearTimer(); C.phase('Poster generation', 90); st.teams.forEach(t => { C.$('#post' + t.id).innerHTML = C.genCard({ id: 'pg' + t.id, kind: 'poster', prompt: posterPrompt(t) }); }); await C.generate('pgA'); await C.generate('pgB', 0); C.$('.cta').innerHTML = '<button class="btn big" data-act="pitch1">🎤 Premiere →</button>'; },
    pitch1() { C.phase('Pitches', 360); st.cur = 0; C.timer('Pitch', 180); pitchScreen(st.teams[0]); },
    pitch2() { st.cur = 1; C.timer('Pitch', 180); pitchScreen(st.teams[1]); },
    vote() { C.clearTimer(); C.phase('Vote & winner', 120); voteScreen(); },
    end() { C.finish(summary()); },
  };

  async function simulate() {
    st = fresh();
    C.phase('Intro & rules', 120); C.stage('<div class="card"><h2>🎬 Lights, Camera, AI!</h2>' + C.script('Two studios. Three random words each. You have 12 minutes to make a movie: title, 100-word synopsis and an AI poster. Then you pitch it.') + '</div>');
    await C.sys('Facilitator explains', 60); await C.say('leo', 'Is there a budget? Asking for my vision.', 10); await C.sys('Q&A about the rules', 40);
    C.phase('Team split', 60); teamsScreen(); await C.sys('People shuffle seats, someone joins the wrong team', 75);
    acts.draw(); await C.wait(15); await C.say('zoe', 'We got “' + st.teams[1].words[1] + '”. Excellent.', 8); await C.say('maya', '“' + st.teams[0].words[2] + '”?? Okay. Okay okay okay.', 10); await C.wait(20);

    acts.write();
    const plan = st.teams.map(t => ({ t, m: madlib(t.words), titleSteps: t.id === 'A' ? 11 : 5, synSteps: t.id === 'A' ? 19 : 22, step: 0 }));
    const chatA = ['What if it’s a heist movie?', 'No, it HAS to be a musical.', 'Can we vote on the title? Again?', 'Okay but what if the llama is the villain.', 'We have 4 minutes and zero words.'];
    const chatB = ['I’ll type, you two talk.', 'Sentence three is perfect. Don’t touch it.', 'Is this 100 words? It feels like 300.', 'Cut the backstory.'];
    while (plan.some(x => !x.t.done)) {
      await C.wait(30);
      for (const x of plan) {
        if (x.t.done) continue; x.step++;
        if (x.step <= x.titleSteps) {
          if (x.step === x.titleSteps) { x.t.title = x.m.title; C.$('#title' + x.t.id).textContent = x.t.title; await C.act(x.t.members[0], ' locked the title: “' + x.t.title + '”', 1); }
          else if (C.chance(.4)) await C.say(C.pick(x.t.members), C.pick(x.t.id === 'A' ? chatA : chatB), 2);
        } else {
          const words = x.m.syn.split(' '), n = Math.min(words.length, Math.round((x.step - x.titleSteps) / x.synSteps * words.length));
          x.t.syn = words.slice(0, n).join(' '); C.$('#syn' + x.t.id).textContent = x.t.syn; C.$('#wc' + x.t.id).textContent = wc(x.t.syn);
          if (n >= words.length) { x.t.done = true; await C.act(x.t.members[1], ' “Done! ' + wc(x.t.syn) + ' words.”', 1); }
          else if (C.chance(.3)) await C.say(C.pick(x.t.members), C.pick(x.t.id === 'A' ? chatA : chatB), 2);
        }
      }
      if (C.timerLeft() < 0 && C.timerLeft() > -31) await C.sys('⏰ Time’s up! …“Just two more minutes!” Facilitator grants an extension.', 2);
    }
    C.clearTimer();
    C.phase('Poster generation', 90);
    st.teams.forEach(t => { C.$('#post' + t.id).innerHTML = C.genCard({ id: 'pg' + t.id, kind: 'poster', prompt: posterPrompt(t) }); });
    await C.say('dev', 'Do we write the poster prompt too? We didn’t.', 6); await C.sys('Teams scramble to write poster prompts', 45);
    await C.generate('pgA', 12); await C.generate('pgB', 2); await C.sys('“Can we regenerate? The llama has six legs.”', 30);

    C.phase('Pitches', 360);
    for (let i = 0; i < 2; i++) {
      st.cur = i; const t = st.teams[i]; C.timer('Pitch', 180); pitchScreen(t);
      await C.say(t.members[0], 'In a world… (dramatic pause) …' + t.title + '.', 20);
      await C.say(C.pick(t.members), 'Reading the synopsis: “' + t.syn.split('.')[0] + '…”', 60);
      await C.sys('Synopsis read in full, with dramatic voices', 70);
      await C.say(C.pick(TEAMS[1 - i].members.map(C.player)), C.pick(['Is there a sequel?', 'Who plays the llama?', 'I would watch this on a plane.']), 10);
      await C.sys('Q&A and laughter', 45);
    }
    C.clearTimer();
    C.phase('Vote & winner', 120); voteScreen(); await C.wait(10);
    await C.simVotes(st.board, v => teamOf(v.id).id === 'A' ? 'B' : 'A', { gap: 3 });
    await C.sys('Winner announced, applause. (Note: with 2 teams and no self-votes, it’s 3 vs 4: the bigger team always loses.)', 40);
  }

  C.css('.wordcard{font-size:1.4rem;font-weight:900;padding:14px 20px;border-radius:14px;background:var(--ink);color:var(--bg);animation:pop .4s}.syn{min-height:120px;padding:10px;border:2px solid var(--line);border-radius:12px;font-size:.95rem;white-space:pre-wrap}.poster .gen{max-width:220px;margin-top:10px}.pitch .gen{max-width:340px}');

  C.game({
    num: '06', title: 'Lights, Camera, AI!', emoji: '🎬',
    tagline: 'Two studios each draw 3 random words, then make a movie: a title, a 100-word synopsis and an AI poster. Then they pitch it to the room.',
    how: '<ol class="tight"><li>Split into 2 teams (4 + 3)</li><li>Draw 3 random words each</li><li>12 min: title + 100-word synopsis</li><li>AI poster</li><li>3-minute pitches → vote</li></ol>',
    plan: [{ name: 'Intro & rules', sec: 120 }, { name: 'Team split', sec: 60 }, { name: 'Word draw', sec: 60 }, { name: 'Writing: title + synopsis', sec: 720 }, { name: 'Poster generation', sec: 90 }, { name: 'Pitches', sec: 360 }, { name: 'Vote & winner', sec: 120 }],
    evaluating: ['Can this fit in 30 min at all, or is it a 45+ min game?', 'Where does time leak?'],
    notes: '<p><b>Verdict: this is a 40–45 minute game wearing a 30-minute costume.</b> Even the optimistic simulation (teams that never stall) runs about 30½ min with zero buffer. Real teams are slower: expect 40+.</p>' +
      '<h4>Where time leaks</h4><ul class="tight"><li><b>Title debate</b>: the 4-person team spends 4–5 min arguing about the title before writing a word.</li><li><b>100-word synopsis</b>: one person types while three talk. Writing by committee is slow, and nobody wants to “own” the keyboard on day one.</li><li><b>Poster prompt</b>: forgotten until the end, then 1–2 min of scrambling and regenerating.</li><li><b>Pitches</b> run 4 min with Q&A, not 3.</li></ul>' +
      '<h4>Suggested cut to fit 30 min</h4><ul class="tight"><li>Replace the 100-word synopsis with a <b>3-line Mad-lib logline</b> (“In a world where ___, one ___ must ___”). Saves about 6 min.</li><li>Have the AI write the poster prompt from the title automatically.</li><li>Hard 8-minute writing timer, no extensions. 2-minute pitches.</li><li>Use 3 teams of 2–3 instead of 2 teams. Smaller teams decide faster, and voting gets fairer (with 2 teams and no self-votes, the bigger team always loses 3–4).</li></ul>' +
      '<div class="risk"><b>Facilitator risk note:</b> low emotional risk, but quieter people disappear inside a 4-person writing team. Give each person a role (title / typist / poster / pitcher).</div>',
    host() {
      st = fresh(); C.phase('Intro & rules', 120);
      C.stage('<div class="card"><h2>🎬 Lights, Camera, AI!</h2>' + C.script('Two studios. Three random words each. You have 12 minutes to make a movie: title, 100-word synopsis and an AI poster. Then you pitch it.') + '<button class="btn big" data-act="split">Split teams →</button></div>');
    },
    simulate, summary, acts: Object.assign(acts, { split() { C.phase('Team split', 60); teamsScreen(); } }),
  });
})();
