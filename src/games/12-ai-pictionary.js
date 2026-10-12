// TITLE: 12 · AI Pictionary
(function () {
  const C = Core;
  // [word, a prompter's description (never uses the word), near-miss guesses]
  const BANK = {
    easy: [['pizza', 'a round flat Italian dinner covered in melted cheese and red sauce, cut in triangles', ['quesadilla', 'pie']], ['cat', 'a small fluffy pet knocking a glass off a table, looking smug', ['dog', 'kitten']], ['rainbow', 'seven colored stripes arching across the sky after rain', ['sunset', 'prism']], ['rocket', 'a tall pointy vehicle blasting off toward the stars with fire underneath', ['spaceship', 'missile']], ['snowman', 'three stacked white balls with a carrot nose and a scarf', ['yeti', 'snow angel']], ['guitar', 'a wooden instrument with six strings strummed by a cowboy', ['banjo', 'violin']], ['volcano', 'a mountain exploding with orange lava', ['mountain', 'eruption']], ['penguin', 'a tuxedo bird waddling on ice', ['puffin', 'seal']], ['umbrella', 'a folding rain shield held over someone’s head', ['parasol', 'rain']], ['castle', 'a stone fortress with towers, a moat and a drawbridge', ['palace', 'fort']]],
    medium: [['lighthouse', 'a tall striped tower on rocky cliffs shining a beam over the sea at night', ['tower', 'beacon']], ['karaoke', 'a nervous office worker singing badly into a microphone while lyrics scroll on a TV', ['concert', 'open mic']], ['time machine', 'a glowing phone booth with clocks spinning around it, a man in 1985 and 1885 at once', ['teleporter', 'DeLorean']], ['treasure map', 'old paper with a dotted line, palm trees and a big red X', ['pirate', 'map']], ['haunted house', 'a creaky Victorian mansion with glowing windows and a ghost in the attic', ['mansion', 'ghost']], ['birthday party', 'kids in paper hats around a cake with candles, balloons everywhere', ['celebration', 'cake']], ['traffic jam', 'hundreds of red brake lights on a highway, angry drivers honking', ['highway', 'rush hour']], ['campfire', 'friends roasting marshmallows around flames under the stars', ['bonfire', 'camping']], ['submarine', 'a yellow metal tube underwater with a periscope', ['boat', 'whale']], ['yoga', 'people on mats in a peaceful studio bending into a downward triangle shape', ['stretching', 'pilates']]],
    cursed: [['Monday morning', 'a tired person staring at a coffee mug as their alarm clock explodes, gray sky', ['hangover', 'alarm clock']], ['the cloud', 'servers floating in the sky like fluffy white puffs, storing everyone’s photos', ['weather', 'heaven']], ['imposter syndrome', 'a person in a business suit nervously hiding behind a fake mustache in a meeting', ['spy', 'disguise']], ['reply-all', 'an email exploding into hundreds of envelopes landing on horrified coworkers', ['spam', 'email']], ['déjà vu', 'a woman walking past the same black cat twice, looking confused', ['glitch', 'Matrix']], ['a quick sync', 'two people in a tiny meeting room as a clock shows 60 minutes passing', ['meeting', 'standup']], ['scope creep', 'a tiny house blueprint slowly growing into a giant castle with a moat', ['renovation', 'blueprint']], ['the algorithm', 'a giant eye inside a phone choosing which cat videos people see', ['big brother', 'social media']], ['small talk', 'two strangers at an elevator talking about the weather awkwardly', ['elevator', 'weather']], ['inbox zero', 'an empty mailbox glowing with heavenly light, angels singing', ['vacation', 'empty']]],
  };
  const TIERS = ['easy', 'medium', 'medium', 'cursed', 'easy'];
  const ROUNDS = 5, GUESS_SEC = 60;

  let st;
  const fresh = () => ({ r: 0, prompters: C.sample(C.players.map(p => p.id), ROUNDS), card: null, mode: 'free', desc: '', show: false, got: [], board: null, score: {}, stats: [] });
  const prompter = () => C.player(st.prompters[st.r]);
  const add = (id, n) => st.score[id] = (st.score[id] || 0) + n;
  const lb = () => '<table class="rtable">' + C.players.slice().sort((a, b) => (st.score[b.id] || 0) - (st.score[a.id] || 0)).map((p, i) => '<tr><td>' + (i + 1) + '</td><td>' + C.chip(p) + '</td><td class="n"><b>' + (st.score[p.id] || 0) + '</b></td></tr>').join('') + '</table>';
  function deal() { const tier = TIERS[st.r]; const [w, d, near] = C.pick(BANK[tier]); st.card = { tier, w, d, near, opts: C.shuffle([w].concat(C.sample(BANK[tier].filter(x => x[0] !== w).map(x => x[0]), 3))) }; st.got = []; st.desc = ''; }
  const STOP = ['the', 'a', 'an', 'of', 'quick'];
  // Blocks the secret word (or its start, e.g. "cats" for "cat"), ignoring filler words like "the".
  const usesWord = (desc, w) => w.toLowerCase().split(/[\s-]+/).filter(part => !STOP.includes(part)).some(part => new RegExp('\\b' + part.replace(/[^a-zà-ÿ]/gi, ''), 'i').test(desc));

  function prompterScreen() {
    const host = C.mode === 'host', p = prompter();
    C.stage('<div class="card"><div class="kicker">Round ' + (st.r + 1) + ' of ' + ROUNDS + ' · ' + st.card.tier + ' word</div><div class="spread"><h2>🙈 Prompter only: ' + C.esc(p.name) + '</h2>' + C.chip(p, { big: true }) + '</div>' +
      '<div class="secret">' + (st.show || !host ? '<span class="big-text">' + C.esc(st.card.w) + '</span>' : '<button class="btn big ghost" data-act="peek">👁 Tap to see the secret word</button>') + '</div>' +
      '<p class="muted">Describe it to the image generator. You may not use the word itself. No drawing allowed.</p>' +
      (host ? '<textarea id="desc" placeholder="Describe it…">' + C.esc(st.desc) + '</textarea><small id="warn" class="kind"></small><div class="row" style="margin-top:8px"><label class="row"><input type="radio" name="gm" value="free" ' + (st.mode === 'free' ? 'checked' : '') + ' style="width:auto;min-height:0"> Free-text guessing</label><label class="row"><input type="radio" name="gm" value="mc" ' + (st.mode === 'mc' ? 'checked' : '') + ' style="width:auto;min-height:0"> 4-option multiple choice</label></div>' +
        '<div class="cta"><button class="btn ghost" data-act="sample">🎲 Sample description</button><button class="btn big pink" data-act="gen">✨ Generate & show the room</button></div>' : '<div class="syn" id="sdesc">' + C.esc(st.desc) + '</div>') + '</div>');
  }
  function guessScreen() {
    const p = prompter();
    if (st.mode === 'mc') st.board = new C.VoteBoard({ title: 'What’s the word?', voters: C.players.filter(q => q.id !== p.id), options: st.card.opts.map(o => ({ id: o, label: o })) });
    C.stage('<div class="cols"><div>' + C.genCard({ id: 'pic', prompt: st.desc, title: 'What did ' + p.name + ' describe?', hidePrompt: true }) + '</div><div class="card">' +
      '<div class="kicker">Guess! · ' + (st.mode === 'mc' ? 'multiple choice' : 'free text') + '</div>' +
      (st.mode === 'mc' ? st.board.html() : '<p class="muted">Shout guesses. Tap players in the order they get it right (first = +2).</p><div class="row">' + C.players.filter(q => q.id !== p.id).map(q => '<button class="vopt' + (st.got.includes(q.id) ? ' sel' : '') + '" data-act="got" data-p="' + q.id + '">' + q.emoji + ' ' + C.esc(q.name) + (st.got.includes(q.id) ? ' #' + (st.got.indexOf(q.id) + 1) : '') + '</button>').join('') + '</div><div id="glog" class="glog"></div>') +
      (C.mode === 'host' ? '<div class="cta"><button class="btn big" data-act="reveal">Reveal →</button></div>' : '') + '</div></div>');
  }
  function revealScreen() {
    const p = prompter(); let correct;
    if (st.mode === 'mc') { correct = Object.entries(st.board.votes.main).filter(([, o]) => o === st.card.w).map(([v]) => v); }
    else correct = st.got;
    correct.forEach((v, k) => add(v, st.mode === 'free' && k === 0 ? 2 : 1)); add(p.id, correct.length);
    st.stats.push({ mode: st.mode, tier: st.card.tier, n: correct.length, firstAt: st.firstAt, desc: st.desc });
    C.stage('<div class="cols"><div>' + C.genCard({ prompt: st.desc, loading: false, title: 'The word was: ' + st.card.w }) + '</div><div class="card"><p class="big-text">🎯 ' + C.esc(st.card.w) + '</p><p>' + correct.length + ' of 6 got it' + (st.mode === 'free' && correct.length ? ' · first: ' + C.esc(C.player(correct[0]).name) : '') + '</p><h3>Scores</h3>' + lb() +
      (C.mode === 'host' ? '<button class="btn big" data-act="next">' + (st.r < ROUNDS - 1 ? 'Next round →' : '🏆 Final') + '</button>' : '') + '</div></div>');
  }
  function summary() {
    if (!st.stats.length) return '';
    const by = m => st.stats.filter(s => s.mode === m), avg = (a, f) => a.length ? (a.reduce((x, s) => x + f(s), 0) / a.length).toFixed(1) : '–';
    return '<div class="card"><h2>🏆 Final scores</h2>' + lb() + '<h3>Free text vs. multiple choice</h3><table class="rtable"><tr><th></th><th>Rounds</th><th>Avg correct (of 6)</th><th>Avg time to first correct</th></tr>' +
      ['free', 'mc'].map(m => '<tr><td>' + (m === 'free' ? '✍️ Free text' : '🔘 Multiple choice') + '</td><td class="n">' + by(m).length + '</td><td class="n">' + avg(by(m), s => s.n) + '</td><td class="n">' + avg(by(m).filter(s => s.firstAt != null), s => s.firstAt) + 's</td></tr>').join('') + '</table></div>';
  }

  const acts = {
    begin() { deal(); C.phase('Deal + prompter writes', 55); prompterScreen(); },
    peek() { st.show = true; prompterScreen(); },
    sample() { st.desc = st.card.d; prompterScreen(); },
    async gen() {
      const d = C.$('#desc').value.trim(); const m = C.$('input[name=gm]:checked'); st.mode = m ? m.value : 'free';
      if (!d) { C.$('#warn').textContent = 'Write a description first.'; return; }
      if (usesWord(d, st.card.w)) { C.$('#warn').textContent = '🚫 You used the secret word. Rephrase!'; return; }
      st.desc = d; st.show = false; st.firstAt = null; C.phase('Guessing', 75); guessScreen(); await C.generate('pic'); C.timer('Guess', GUESS_SEC);
    },
    got(d) { if (!st.got.includes(d.p)) { st.got.push(d.p); if (st.firstAt == null) st.firstAt = Math.round(GUESS_SEC - C.timerLeft()); } guessScreen(); C.$('#pic').classList.remove('loading'); },
    reveal() { C.clearTimer(); C.phase('Reveal & points', 30); revealScreen(); },
    next() { if (st.r < ROUNDS - 1) { st.r++; acts.begin(); } else { C.phase('Final scores', 60); C.stage(summary() + '<button class="btn big" data-act="end">🏁 Finish & pacing report</button>'); } },
    end() { C.finish(summary()); },
  };

  async function simulate() {
    st = fresh();
    C.phase('Intro & rules', 90); C.stage('<div class="card"><h2>🖼️ AI Pictionary</h2>' + C.script('One person gets a secret word. They can’t draw. They can only describe it to the AI, and you guess from the picture. 60 seconds per round.') + '</div>');
    await C.sys('Facilitator explains', 45); await C.say('sam', 'So the AI is the one drawing? Phew.', 6); await C.wait(10);
    for (let r = 0; r < ROUNDS; r++) {
      st.r = r; deal(); st.mode = r < 3 ? 'free' : 'mc'; st.firstAt = null; const p = prompter();
      C.phase('Deal + prompter writes', 55); prompterScreen(); await C.sys('Secret word dealt to ' + p.name + ' (' + st.card.tier + ')', 8);
      const thinking = { easy: 20, medium: 32, cursed: 48 }[st.card.tier] * C.rand(.8, 1.3);
      if (st.card.tier === 'cursed') await C.say(p, 'Oh no. How do you even draw this.', 6);
      await C.wait(thinking); st.desc = st.card.d; C.$('#sdesc').textContent = st.desc; await C.act(p, ' typed: “' + st.desc + '”', 3);
      C.phase('Guessing', 75); guessScreen(); await C.generate('pic', 10); C.timer('Guess', GUESS_SEC);
      const others = C.shuffle(C.players.filter(q => q.id !== p.id));
      if (st.mode === 'free') {
        const pr = { easy: .3, medium: .16, cursed: .08 }[st.card.tier];
        for (let t = 0; t < GUESS_SEC && st.got.length < 6; t += 5) {
          await C.wait(5);
          for (const q of others) {
            if (st.got.includes(q.id)) continue;
            if (C.chance(pr)) { st.got.push(q.id); if (st.firstAt == null) st.firstAt = t + 5; await C.say(q, st.card.w + '!', 1); guessScreen(); C.$('#pic').classList.remove('loading'); }
            else if (C.chance(.18)) await C.say(q, C.pick(st.card.near.concat(['…a wizard?', 'Is it a vibe?', 'TACO?'])) + '?', 1);
          }
        }
      } else {
        const pr = { easy: .92, medium: .78, cursed: .58 }[st.card.tier];
        await C.wait(6);
        await C.simVotes(st.board, () => C.chance(pr) ? st.card.w : C.pick(st.card.opts.filter(o => o !== st.card.w)), { gap: 2.5, straggler: 2 });
        st.firstAt = 9;
      }
      C.clearTimer(); C.phase('Reveal & points', 30); revealScreen();
      await C.say(C.pick(others), C.pick(['How was that ' + st.card.w + '??', 'The AI really tried.', 'I was SO close.', 'In hindsight, obvious.']), 8);
      await C.wait(st.mode === 'mc' ? 8 : 14);
    }
    C.phase('Final scores', 60); C.stage(summary()); await C.sys('Winner crowned', 30);
  }

  C.css('.secret{display:grid;place-items:center;min-height:110px;margin:12px 0;border-radius:16px;background:var(--ink);color:var(--bg)}.kind{color:var(--bad);font-weight:650}.syn{min-height:60px;padding:10px;border:2px solid var(--line);border-radius:12px}.glog{margin-top:10px}');

  C.game({
    num: '12', title: 'AI Pictionary', emoji: '🖼️',
    tagline: 'One player gets a secret word and may only <i>describe</i> it to an image generator: no drawing. Everyone else guesses from the AI picture. 60 seconds a round.',
    how: '<ol class="tight"><li>Prompter sees the secret word (easy / medium / cursed)</li><li>Describes it without using the word → AI image</li><li>60s: room guesses (free text or 4-option multiple choice)</li><li>First correct +2, others +1, prompter +1 per correct</li><li>5 rounds</li></ol>',
    plan: [{ name: 'Intro & rules', sec: 90 }, { name: 'Deal + prompter writes', sec: 275 }, { name: 'Guessing', sec: 375 }, { name: 'Reveal & points', sec: 150 }, { name: 'Final scores', sec: 60 }],
    evaluating: ['Round timing: is 60 seconds right?', 'Is multiple-choice or free-text guessing better?'],
    notes: '<p><b>Verdict: high energy, easy to learn, and only about 13–14 min for 5 rounds.</b> You could run 8–9 rounds in 30 min, enough for every player to be prompter once.</p>' +
      '<h4>Is 60 seconds right?</h4><ul class="tight"><li><b>Easy words</b>: someone gets it in 10–20s. 60s is too long and the room waits.</li><li><b>Cursed words</b> (“scope creep”, “reply-all”): 60s is right, and often nobody gets it. That’s the funniest part.</li><li>Recommendation: <b>45s</b>, and the round ends as soon as 4 of 6 have it.</li></ul>' +
      '<h4>Free text vs. multiple choice</h4><p>Multiple choice is faster and more people score, but it’s quieter and kills the shouting of wrong guesses (“IS IT A WIZARD?”), which is where the laughs are. <b>Best:</b> free text for 40s, then reveal 4 options as a lifeline for the last 20s.</p>' +
      '<h4>Hidden time cost</h4><p>Prompters freeze on cursed words (40–60s of writing). Give them a 45s writing timer too.</p>' +
      '<div class="risk"><b>Facilitator risk note:</b> low. Some people dislike being the prompter, so let them pass or pair up.</div>',
    host() {
      st = fresh(); C.phase('Intro & rules', 90);
      C.stage('<div class="card"><h2>🖼️ AI Pictionary</h2>' + C.script('One person gets a secret word. They can’t draw. They can only describe it to the AI, and you guess from the picture. 60 seconds per round.') + '<p>Prompters: ' + st.prompters.map(id => C.chip(id)).join(' ') + '</p><button class="btn big" data-act="begin">Round 1 →</button></div>');
    },
    simulate, summary, acts,
  });
})();
