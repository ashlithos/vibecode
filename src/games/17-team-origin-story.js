// TITLE: 17 · Team Origin Story
(function () {
  const C = Core;

  // Round categories. 7 players, so each round spreads 3 categories across 7 seats.
  const R1 = ['adjective', 'creature', 'power', 'adjective', 'creature', 'power', 'adjective'];
  const R2 = ['food', 'battle-cry verb', 'value', 'food', 'value', 'battle-cry verb', 'value'];
  const HINT = { adjective: 'e.g. fearless', creature: 'e.g. axolotl', power: 'e.g. infinite snacks', value: 'e.g. curiosity', food: 'e.g. dumplings', 'battle-cry verb': 'e.g. Charge' };

  // Synthetic word choices + the "why" they share in the sharing circle.
  // depth: surface | personal | story. This is what the evaluator is watching for.
  const WORDS = {
    maya:  { 1: [['feral', 'Honestly my calendar is feral and I wanted the mascot to match.', 'surface'], ['unhinged', 'I grew up with four siblings. Unhinged is just my baseline.', 'personal']],
             2: [['hot cheetos', 'I moved here alone last year and hot cheetos at 2am got me through it.', 'personal'], ['cold pizza', 'Best breakfast. No notes.', 'surface']] },
    dev:   { 1: [['goose', 'Geese fear nothing. Professionally, I aspire to that.', 'surface'], ['capybara', 'My kid is obsessed with capybaras, so now they’re my whole personality.', 'personal']],
             2: [['Ship', 'I’ve watched too many good projects die in a doc. Ship it.', 'personal'], ['Persist', 'It sounded intimidating.', 'surface']] },
    priya: { 1: [['remembering everyone’s birthday', 'My grandmother remembered every birthday in our village without a phone. I’m trying to be her.', 'story'], ['infinite snacks', 'Snacks are love.', 'surface']],
             2: [['kindness', 'My first manager was kind when I messed up badly. It’s why I stayed in this field.', 'story'], ['patience', 'I need more of it.', 'surface']] },
    leo:   { 1: [['relentless', 'I train for marathons, so relentless is kind of my default setting.', 'personal'], ['turbo', 'Fast is fun.', 'surface']],
             2: [['overnight oats', 'Meal-prep Sunday is my therapy, honestly.', 'personal'], ['espresso', 'Fuel.', 'surface']] },
    sam:   { 1: [['axolotl', 'They regrow parts of themselves. Starting a new job feels a bit like that.', 'story'], ['owl', 'I do my best thinking after 11pm.', 'personal']],
             2: [['curiosity', 'I switched careers from biology. Curiosity is the one thing I brought with me.', 'story'], ['calm', 'We’ll need it.', 'surface']] },
    zoe:   { 1: [['pun-based mind control', 'Because if you groan, I win.', 'surface'], ['teleporting to the snack table', 'Self-explanatory.', 'surface']],
             2: [['Yeet', 'It’s the only battle cry my nephew taught me that I’m allowed to say at work.', 'personal'], ['Pounce', 'Cats are right about most things.', 'surface']] },
    omar:  { 1: [['legendary', 'My dad told stories about everyone at dinner. I want us to be a team worth a story.', 'story'], ['majestic', 'Aim high.', 'surface']],
             2: [['trust', 'I was once on a team where nobody trusted each other. Never again.', 'story'], ['honesty', 'Saves time.', 'surface']] },
  };
  const FILL = {
    adjective: ['fearless', 'sparkly', 'caffeinated', 'cozy', 'mighty', 'sleepy'], creature: ['otter', 'dragon', 'raccoon', 'narwhal', 'hedgehog', 'phoenix'],
    power: ['time travel', 'instant naps', 'reading minds', 'summoning pizza', 'flight'], value: ['curiosity', 'courage', 'play', 'candor', 'care'],
    food: ['dumplings', 'tacos', 'mango', 'croissants', 'ramen'], 'battle-cry verb': ['Charge', 'Rise', 'Ship', 'Rally', 'Pounce'],
  };
  const INTROS = {
    maya: ['Hi! Maya, product design. Fun fact: I once got lost in IKEA for two hours and kind of loved it. Also I have a lot of plants, probably too many plants, like 40', 58],
    dev: ['Dev. Backend. I own one shirt in five copies.', 28],
    priya: ['I’m Priya, I’m in research and I’m so happy to be here! I bake when I’m stressed, so expect cookies in week three.', 48],
    leo: ['Leo, PM. Three marathons, two startups, one very tired dog. I’m excited because this team’s roadmap is honestly the most interesting thing I’ve seen in years and…', 64],
    sam: ['Sam. Data. I like quiet hikes.', 26],
    zoe: ['Zoe, marketing! I’m the person who will make a pun out of your name within a week. Sorry in advance, Dev.', 44],
    omar: ['Omar, engineering. So, funny story about how I got here. It involves a missed flight in Lisbon, a stranger, and a startup that no longer exists…', 78],
  };

  let st;
  const fresh = () => ({ screen: 'welcome', intro: 0, r1: [], r2: [], choice: {}, order: [], share: 0, depth: {}, candidates: [], board: null, mascotPrompt: '', motto: '', name: '' });

  function items(round) {
    const cats = round === 1 ? R1 : R2;
    return C.players.map((p, i) => ({ p, cat: cats[i], hint: HINT[cats[i]], word: '' }));
  }
  const words = (list, cat) => list.filter(x => x.cat === cat);
  function mascotParts(list) {
    const a = words(list, 'adjective'), c = words(list, 'creature'), w = words(list, 'power');
    return ['A', a[0], ',', a[1], ',', a[2], c[0], '–', c[1], 'hybrid with the power of', w[0], 'and', w[1]];
  }
  function mottoParts(list) {
    const v = words(list, 'value'), f = words(list, 'food'), b = words(list, 'battle-cry verb');
    return [b[0], '!', b[1], '! We stand for', v[0], ',', v[1], 'and', v[2], ', fueled by', f[0], 'and', f[1], '.'];
  }
  const partsText = parts => parts.map(x => typeof x === 'string' ? x : x.word).join(' ').replace(/ ([,!.])/g, '$1').replace(/ – /g, '–');

  // ---------- screens ----------
  function welcome() {
    C.stage('<div class="card"><div class="kicker">Phase 0 · Welcome</div><h2>Today we invent our team’s origin story 🛡️</h2>' +
      C.script('We’ve never all been in one room before, so instead of a boring round of intros we’re going to <b>build a team crest together</b>: a mascot, a motto and a name. Every word you add becomes part of it, and later you’ll tell us why you picked yours.') +
      '<p class="muted">Arc: lightning intros → mascot words → motto words → sharing circle → name the mascot → crest.</p>' +
      '<button class="btn big" data-act="startIntros">Start lightning intros →</button></div>');
  }
  function introScreen() {
    const p = C.players[st.intro];
    C.stage('<div class="card center"><div class="kicker">Phase 1 · Lightning intros · ' + (st.intro + 1) + ' of 7</div>' +
      '<div style="margin:18px 0">' + C.chip(p, { big: true }) + '</div><p class="big-text">Name · what you do · one fun fact</p>' +
      '<p class="muted">45 seconds. The timer goes red at zero. Be kind but firm.</p>' +
      '<div class="row" style="justify-content:center">' + C.players.map((q, i) => C.chip(q, { dim: i !== st.intro })).join(' ') + '</div>' +
      '<div class="cta" style="justify-content:center"><button class="btn big" data-act="nextIntro">' + (st.intro < 6 ? 'Next speaker →' : 'On to the mascot →') + '</button></div></div>');
  }
  function collectScreen(round) {
    const list = round === 1 ? st.r1 : st.r2;
    C.stage('<div class="card"><div class="kicker">Phase ' + (round + 1) + ' · Round ' + round + ': ' + (round === 1 ? 'the team mascot' : 'the team motto') + '</div>' +
      '<h2>' + (round === 1 ? 'Everyone secretly picks one word for our mascot' : 'Now one word each for our motto') + '</h2>' +
      C.script(round === 1 ? 'Look at your category, pick a word that feels like <i>you</i>, and keep it secret. Remember why you picked it. You’ll tell us later.' : 'Same thing: one word in your category. Values, a food, or a battle cry. Pick something you could explain in a sentence.') +
      C.collectGrid('grid' + round, list, { fillAct: 'fill' + round }) +
      '<div class="cta"><button class="btn big pink" data-act="gen' + round + '">✨ Generate the ' + (round === 1 ? 'mascot' : 'motto') + '</button></div></div>');
  }
  function mascotScreen() {
    const parts = mascotParts(st.r1);
    st.mascotPrompt = partsText(parts) + ', heroic mascot, sticker style';
    C.stage('<div class="card"><div class="kicker">Round 1 · Assembly</div><h2>Our mascot is…</h2>' + C.slotSentence('mslots', parts) +
      '<div style="margin-top:18px" id="mwrap"></div><div class="cta" id="mnext"></div></div>');
  }
  function mottoScreen() {
    const parts = mottoParts(st.r2);
    st.motto = partsText(parts);
    C.stage('<div class="card"><div class="kicker">Round 2 · Assembly</div><h2>Our motto is…</h2>' + C.slotSentence('tslots', parts) +
      '<div class="cta" id="tnext"></div></div>');
  }
  function shareScreen() {
    const p = C.player(st.order[st.share]);
    const i = C.players.indexOf(p), w1 = st.r1[i], w2 = st.r2[i];
    C.stage('<div class="card"><div class="kicker">Phase 4 · Sharing circle · ' + (st.share + 1) + ' of 7</div>' +
      '<div class="spread"><div>' + C.chip(p, { big: true }) + '</div><div class="row">' + st.order.map((id, k) => C.chip(id, { dim: k !== st.share })).join(' ') + '</div></div>' +
      '<p class="big-text" style="margin-top:16px">You picked <span class="tag">' + C.esc(w1.word) + '</span> and <span class="tag">' + C.esc(w2.word) + '</span>. Why?</p>' +
      C.script('No wrong answers. "It sounded funny" is fine. But if there’s a story, we want it.') +
      '<p class="muted">How deep did they go? (tap; this is the thing you’re evaluating)</p><div class="row" id="depthBtns">' +
      ['surface', 'personal', 'story'].map(d => '<button class="btn small ' + (st.depth[p.id] === d ? '' : 'ghost') + '" data-act="depth" data-d="' + d + '">' + { surface: '🙂 surface', personal: '💛 personal', story: '📖 real story' }[d] + '</button>').join('') +
      '</div><div class="cta"><button class="btn big" data-act="nextShare">' + (st.share < 6 ? 'Next person →' : 'Name the mascot →') + '</button></div></div>');
  }
  function suggestNames() {
    const c = words(st.r1, 'creature').map(x => x.word), a = words(st.r1, 'adjective').map(x => x.word);
    const cap = s => s ? s[0].toUpperCase() + s.slice(1) : s;
    return [cap(c[0]) + cap(c[1] || '').slice(0, 4), 'Sir ' + cap(a[0]) + ' the ' + cap(c[1] || c[0]), 'Captain ' + cap(a[1] || a[0]), 'The ' + cap(a[2] || a[0]) + ' One'];
  }
  function nameScreen() {
    if (C.mode === 'host' && !st.candidates.length) {
      const sug = suggestNames();
      C.stage('<div class="card"><div class="kicker">Phase 5 · Name the mascot</div><h2>Shout out names. Pick 4 finalists.</h2>' +
        '<div class="mascot-mini">' + C.genCard({ kind: 'square', prompt: st.mascotPrompt, loading: false, hidePrompt: true }) + '</div>' +
        '<div class="namegrid">' + sug.map((s, k) => '<input class="cand" value="' + C.esc(s) + '" aria-label="Finalist ' + (k + 1) + '">').join('') + '</div>' +
        '<button class="btn big" data-act="openVote">Open the vote →</button></div>');
      return;
    }
    st.board = new C.VoteBoard({ title: 'Name our mascot', options: st.candidates.map((c, k) => ({ id: 'c' + k, label: c })) });
    C.stage('<div class="card"><div class="kicker">Phase 5 · Name the mascot</div><h2>Vote: what’s our mascot called?</h2>' + st.board.html() +
      '<div class="cta"><button class="btn big pink" data-act="crest">🛡️ Reveal our team crest</button></div></div>');
  }
  function crestScreen() {
    const w = st.board.winner(); st.name = w && w.n ? w.label : st.candidates[0];
    C.stage(crestHtml());
  }
  function crestHtml() {
    return '<div class="card crest center"><div class="kicker">Phase 6 · Our team crest</div>' +
      '<div class="crest-shield">' + C.genCard({ kind: 'square', prompt: st.mascotPrompt, loading: false, hidePrompt: true, overlayTitle: st.name, overlaySub: 'Est. ' + new Date().getFullYear() }) + '</div>' +
      '<p class="big-text">“' + C.esc(st.motto) + '”</p><div class="row" style="justify-content:center">' + C.players.map(p => C.chip(p)).join(' ') + '</div>' +
      (C.mode === 'host' ? '<div class="cta" style="justify-content:center"><button class="btn big" data-act="end">🏁 Finish & see pacing report</button></div>' : '') + '</div>';
  }
  function summary() {
    const d = Object.values(st.depth), n = k => d.filter(x => x === k).length;
    return (st.name ? crestHtml() : '') + '<div class="card"><h2>💛 Did the sharing circle produce real sharing?</h2>' +
      '<p class="big-text">' + (n('personal') + n('story')) + ' of ' + (d.length || 7) + ' people went beyond surface level</p>' +
      '<p>📖 real story: <b>' + n('story') + '</b> · 💛 personal: <b>' + n('personal') + '</b> · 🙂 surface: <b>' + n('surface') + '</b></p>' +
      '<p class="muted">In the simulation, people who got an <i>abstract</i> category (value, creature) went deeper than people who got a jokey one (power, battle-cry verb). That’s a design lever: give everyone at least one “meaningful” category.</p></div>';
  }

  // ---------- host actions ----------
  const acts = {
    startIntros() { C.phase('Lightning intros', 360); st.intro = 0; C.timer('Intro', 45); introScreen(); },
    nextIntro() {
      C.log(C.players[st.intro], ' finished their intro', 'say');
      if (st.intro < 6) { st.intro++; C.timer('Intro', 45); introScreen(); }
      else { C.clearTimer(); C.phase('Round 1: mascot words', 150); C.timer('Pick your word', 90); collectScreen(1); }
    },
    fill1() { st.r1.forEach(x => { x.word = C.pick(FILL[x.cat]); }); collectScreen(1); },
    fill2() { st.r2.forEach(x => { x.word = C.pick(FILL[x.cat]); }); collectScreen(2); },
    async gen1() {
      C.readGrid('grid1', st.r1); st.r1.forEach(x => { if (!x.word) x.word = C.pick(FILL[x.cat]); });
      C.clearTimer(); mascotScreen(); await C.revealSlots('mslots');
      C.$('#mwrap').innerHTML = C.genCard({ id: 'mascot', kind: 'square', prompt: st.mascotPrompt }); await C.generate('mascot');
      C.$('#mnext').innerHTML = '<button class="btn big" data-act="toR2">Round 2: the motto →</button>';
      C.log(null, '🦄 Mascot: ' + st.mascotPrompt, 'sys');
    },
    toR2() { C.phase('Round 2: motto words', 150); C.timer('Pick your word', 90); collectScreen(2); },
    async gen2() {
      C.readGrid('grid2', st.r2); st.r2.forEach(x => { if (!x.word) x.word = C.pick(FILL[x.cat]); });
      C.clearTimer(); mottoScreen(); await C.revealSlots('tslots');
      C.$('#tnext').innerHTML = '<button class="btn big" data-act="toShare">Sharing circle →</button>';
      C.log(null, '📣 Motto: ' + st.motto, 'sys');
    },
    toShare() { C.phase('Sharing circle', 450); st.order = C.players.map(p => p.id); st.share = 0; C.timer('Why that word?', 60); shareScreen(); },
    depth(d) { st.depth[st.order[st.share]] = d.d; shareScreen(); },
    nextShare() { if (st.share < 6) { st.share++; C.timer('Why that word?', 60); shareScreen(); } else { C.clearTimer(); C.phase('Name the mascot', 180); nameScreen(); } },
    openVote() { st.candidates = C.$$('.cand').map(x => x.value.trim()).filter(Boolean); if (!st.candidates.length) st.candidates = suggestNames(); nameScreen(); },
    crest() { C.phase('Crest finale', 120); crestScreen(); },
    end() { C.finish(summary()); },
  };

  // ---------- simulation ----------
  async function simulate() {
    st = fresh();
    C.phase('Welcome & framing', 60); welcome();
    await C.say('maya', 'Wait, we get a mascot?? I’m in.', 20); await C.sys('Facilitator explains the arc', 35);

    acts.startIntros();
    for (let i = 0; i < 7; i++) {
      const p = C.players[i]; st.intro = i; C.timer('Intro', 45); introScreen();
      const [line, sec] = INTROS[p.id];
      await C.say(p, line, sec);
      if (sec > 55) await C.sys('⏰ Timer went red. Facilitator gently wraps them up.', 6);
      await C.wait(5);
    }
    C.clearTimer();

    // Round 1
    C.phase('Round 1: mascot words', 150); C.timer('Pick your word', 90);
    st.r1 = items(1); collectScreen(1);
    await C.say('sam', 'Can the creature be made up?', 6); await C.sys('Facilitator: “Anything goes.”', 5);
    for (const k of C.shuffle([0, 1, 2, 3, 4, 5, 6])) {
      await C.wait(C.rand(7, 16));
      const p = C.players[k], opt = C.pick(WORDS[p.id][1]);
      st.r1[k].word = opt[0]; st.choice[p.id] = [opt]; C.markGrid('grid1', st.r1, k);
      await C.act(p, ' submitted a word (' + st.r1[k].cat + ')', 1);
    }
    C.clearTimer(); mascotScreen(); await C.sys('Assembling the mascot prompt…', 2); await C.revealSlots('mslots', 2.5);
    C.$('#mwrap').innerHTML = C.genCard({ id: 'mascot', kind: 'square', prompt: st.mascotPrompt }); await C.generate('mascot', 10);
    await C.say('zoe', 'It’s… beautiful? I think?', 6); await C.say('dev', 'I would follow it into battle.', 6); await C.say('priya', 'It needs a tiny hat.', 8);

    // Round 2
    C.phase('Round 2: motto words', 150); C.timer('Pick your word', 90);
    st.r2 = items(2); collectScreen(2);
    for (const k of C.shuffle([0, 1, 2, 3, 4, 5, 6])) {
      await C.wait(C.rand(8, 18));
      const p = C.players[k], opt = C.pick(WORDS[p.id][2]);
      st.r2[k].word = opt[0]; st.choice[p.id].push(opt); C.markGrid('grid2', st.r2, k);
      await C.act(p, ' submitted a word (' + st.r2[k].cat + ')', 1);
    }
    C.clearTimer(); mottoScreen(); await C.revealSlots('tslots', 2.5);
    await C.say('leo', 'Okay this is going on a hoodie.', 6); await C.say('omar', 'Read it again, dramatically.', 10);

    // Sharing circle
    C.phase('Sharing circle', 450); st.order = C.shuffle(C.players.map(p => p.id));
    for (let k = 0; k < 7; k++) {
      st.share = k; const id = st.order[k], p = C.player(id); C.timer('Why that word?', 60); shareScreen();
      const picks = st.choice[id].slice().sort((a, b) => ({ surface: 0, personal: 1, story: 2 }[b[2]] - { surface: 0, personal: 1, story: 2 }[a[2]]));
      const best = picks[0];
      st.depth[id] = best[2]; shareScreen();
      await C.wait(C.rand(4, 9)); // the "um, okay so…" pause before answering
      await C.say(p, 'I picked “' + best[0] + '”. ' + best[1], best[2] === 'story' ? 58 : best[2] === 'personal' ? 42 : 18);
      if (best[2] !== 'surface') await C.say(C.pick(C.players.filter(q => q.id !== id)), C.pick(['Oh that’s lovely.', 'Wait, tell me more about that later.', 'Okay I wasn’t ready for feelings.', 'Same, honestly.', 'Love that.']), 10);
      else await C.sys('Light laugh, quick handoff', 6);
      await C.wait(8);
    }
    C.clearTimer();

    // Vote
    C.phase('Name the mascot', 180);
    await C.sys('Facilitator: “Shout out names!” (room brainstorms)', 25);
    await C.say('zoe', 'Sir Honks-a-Lot. I will not be taking questions.', 12);
    await C.say('maya', 'Chaos Goblin!!', 8); await C.say('priya', 'What about… Biscuit?', 10);
    st.candidates = ['Sir Honks-a-Lot', 'Chaos Goblin', 'Biscuit', suggestNames()[0]];
    nameScreen(); await C.wait(10);
    await C.simVotes(st.board, v => v.id === 'zoe' ? 'c0' : v.id === 'maya' ? 'c1' : C.pick(['c0', 'c0', 'c1', 'c2', 'c2', 'c3']));
    await C.say('dev', 'Democracy has spoken.', 8); await C.say('zoe', 'I demand a recount.', 10);

    C.phase('Crest finale', 120); crestScreen();
    await C.sys('Crest revealed. Group screenshot 📸', 30); await C.say('sam', 'Can this be our Slack emoji?', 15); await C.sys('Facilitator wraps: “That’s us now.”', 30);
  }

  C.css('.crest-shield .gen{margin:12px auto;max-width:340px;border-radius:40px 40px 50% 50%/40px 40px 30% 30%} .mascot-mini .gen{max-width:220px}');

  C.game({
    num: '17', title: 'Team Origin Story', emoji: '🛡️',
    tagline: 'A brand-new team invents its own mascot, motto and name, one secret word at a time. Then everyone shares <i>why</i> they picked their word. That sharing is the real get-to-know-you engine.',
    how: '<ol class="tight"><li>Lightning intros (45s each)</li><li>Round 1: one word each → AI mascot</li><li>Round 2: one word each → team motto</li><li>Sharing circle: why did you pick that?</li><li>Vote on the mascot’s name → team crest</li></ol>',
    plan: [{ name: 'Welcome & framing', sec: 60 }, { name: 'Lightning intros', sec: 360 }, { name: 'Round 1: mascot words', sec: 150 }, { name: 'Round 2: motto words', sec: 150 }, { name: 'Sharing circle', sec: 450 }, { name: 'Name the mascot', sec: 180 }, { name: 'Crest finale', sec: 120 }],
    evaluating: ['Does the “why did you pick that word” sharing actually produce personal sharing?', 'Does the whole arc fit in 30 minutes?'],
    notes: '<p><b>Verdict: the strongest candidate for a first meeting.</b> The simulation lands at about 24–25 min, transitions included. Real groups add a few minutes of settling in and laughter, so plan on 27–29. It runs low-risk early (intros, secret words) and builds to opt-in vulnerability (the sharing circle), and it ends with an artifact the team keeps.</p>' +
      '<h4>Where time leaks</h4><ul class="tight"><li><b>Intros</b>: storytellers and over-achievers run 60–80s. The 45s timer must be visible and enforced, or this phase eats 2 extra minutes.</li><li><b>Sharing circle</b>: real stories take about 60s each, which is the point. Budget 7½ min and protect it.</li></ul>' +
      '<h4>Does the sharing work?</h4><p>Mostly. Abstract categories (<i>value</i>, <i>creature</i>, <i>adjective</i>) pull out stories. Jokey ones (<i>power</i>, <i>battle-cry verb</i>) tend to get one-liners. Fix: let each person explain only their <b>more meaningful</b> word, or make Round 2 all “value” words.</p>' +
      '<h4>If you need to cut</h4><ul class="tight"><li>Cut intros to name + one word (20s each): saves about 3 min, since the sharing circle replaces fun facts anyway.</li><li>Skip the naming vote and let the AI name it: saves about 2 min.</li></ul>' +
      '<div class="risk"><b>Facilitator risk note:</b> low. Nobody is singled out, and sharing is opt-in depth (“it sounded funny” is a valid answer). Model it yourself by going first with a real story.</div>',
    host() { st = fresh(); st.r1 = items(1); st.r2 = items(2); st.choice = {}; C.phase('Welcome & framing', 60); welcome(); },
    simulate, summary, acts,
  });
})();
