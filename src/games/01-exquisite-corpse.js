// TITLE: 01 · Exquisite Corpse (collaborative prompt)
(function () {
  const C = Core;
  const CATS = ['number', 'description', 'animal', 'name', 'character', 'activity', 'place'];
  const HINT = { number: 'e.g. 9,000', description: 'e.g. sparkly', animal: 'e.g. goose', name: 'e.g. Gary', character: 'e.g. pirate accountant', activity: 'e.g. starting a band', place: 'e.g. a Costco at midnight' };
  // Persona word pools, per category (pipe-separated).
  const POOL = {
    maya:  { number: '9,000|a baker’s dozen|negative three', name: 'Gary|Beyoncé|Clippy', character: 'pirate accountant|retired wizard|haunted DJ', description: 'sticky|unhinged|glitter-covered', animal: 'raccoon|goose|possum', place: 'a Costco at midnight|a bouncy castle|the group chat', activity: 'starting a cult|speedrunning taxes|yelling at clouds' },
    dev:   { number: '1|404|exactly 12', name: 'Steve|Kevin|Linda', character: 'middle manager|tax auditor|substitute teacher', description: 'mildly disappointed|beige|unbothered', animal: 'pigeon|sloth|capybara', place: 'a waiting room|a parking garage|Ohio', activity: 'filing paperwork|waiting for the build|staring at a wall' },
    priya: { number: 'two|a hundred|seven', name: 'Biscuit|Sunny|Grandma Rose', character: 'kindergarten teacher|baker|lighthouse keeper', description: 'fluffy|sparkly|cozy', animal: 'otter|bunny|baby penguin', place: 'a flower market|a cozy library|grandma’s kitchen', activity: 'baking cookies|knitting scarves|hugging trees' },
    leo:   { number: '10x|one million|1,000', name: 'Serena|Chad|Elon', character: 'startup founder|Olympic coach|CEO', description: 'turbocharged|ultra-efficient|bulletproof', animal: 'cheetah|falcon|shark', place: 'a rooftop gym|Mars|a TED stage', activity: 'crushing quarterly goals|running a marathon|scaling to infinity' },
    sam:   { number: 'three|eleven|a few', name: 'Moss|Juniper|Arlo', character: 'night librarian|beekeeper|park ranger', description: 'misty|tiny|thoughtful', animal: 'owl|axolotl|moth', place: 'a foggy forest|an old greenhouse|a quiet train', activity: 'reading poetry|stargazing|whispering secrets' },
    zoe:   { number: 'a pun-dred|sixty-six|forty-two', name: 'Bread Pitt|Taylor Drift|Shirley Temple', character: 'stand-up comedian|magician|game show host', description: 'extra crispy|dramatic|punny', animal: 'llama|flamingo|cat', place: 'a karaoke bar|a cheese shop|the Louvre', activity: 'doing improv|telling dad jokes|tap dancing' },
    omar:  { number: 'forty|one thousand and one|seven', name: 'Sinbad|Aunt Nadia|Old Tom', character: 'sea captain|time traveler|wandering bard', description: 'legendary|ancient|mysterious', animal: 'camel|whale|dragon', place: 'a desert caravan|a sunken city|a night train across Europe', activity: 'telling epic stories|searching for treasure|solving a mystery' },
  };
  const word = (pid, cat) => C.pick(POOL[pid][cat].split('|'));
  const REACT = ['I’m crying. Why is it so accurate.', 'This is the best thing I’ve seen all week.', 'Can we print this?', 'Okay who wrote “' + '%w' + '”?', 'The AI really committed to it.', 'I need this as my wallpaper.', 'This feels like a fever dream.', 'Honestly? Kind of beautiful.'];

  let st;
  const ROUNDS = 3;
  const fresh = () => ({ round: 0, items: [], history: [], board: null });
  const plural = a => /s$/.test(a) ? a : a + 's';

  function assign(r) { return C.players.map((p, i) => ({ p, cat: CATS[(i + r) % 7], hint: HINT[CATS[(i + r) % 7]], word: '' })); }
  function parts(items) {
    const g = c => items.find(x => x.cat === c);
    const an = g('animal');
    return [g('number'), g('description'), { ...an, word: plural(an.word) }, 'led by', g('name'), 'the', g('character'), ',', g('activity'), 'in', g('place')];
  }
  const text = ps => ps.map(x => typeof x === 'string' ? x : x.word).join(' ').replace(/ ,/g, ',');

  function intro() {
    C.stage('<div class="card"><div class="kicker">Welcome</div><h2>One prompt. Seven brains. Zero coordination.</h2>' +
      C.script('Each of you gets a secret category: a number, a name, an animal, and so on. Type one word without peeking at anyone else’s. I’ll glue them into one giant prompt and the AI draws it. Three rounds, and categories rotate.') +
      '<button class="btn big" data-act="assign">Start round 1 →</button></div>');
  }
  function assignScreen() {
    C.stage('<div class="card"><div class="kicker">Round ' + st.round + ' of ' + ROUNDS + ' · Category assignment</div><h2>Here’s your secret category</h2>' +
      '<div class="pgrid">' + st.items.map(x => '<div class="pcell">' + C.chip(x.p) + '<span class="big-text" style="font-size:1.2rem">' + x.cat + '</span></div>').join('') + '</div>' +
      '<p class="muted">Categories rotate each round, so nobody is stuck being “the number person”.</p>' +
      '<button class="btn big" data-act="collect">Everyone go! Collect words →</button></div>');
  }
  function collectScreen() {
    C.stage('<div class="card"><div class="kicker">Round ' + st.round + ' · Collecting</div><h2>Type one word. Don’t look at your neighbor.</h2>' +
      C.collectGrid('grid', st.items, { fillAct: 'fill' }) + '<div class="cta"><button class="btn big pink" data-act="assemble">🧩 Assemble the prompt</button></div></div>');
  }
  function assembleScreen() {
    const ps = parts(st.items);
    C.stage('<div class="card"><div class="kicker">Round ' + st.round + ' · The assembly</div><h2>And the prompt is…</h2>' + C.slotSentence('slots', ps) +
      '<div id="genwrap" style="margin-top:18px"></div><div class="cta" id="after"></div></div>' + historyHtml());
  }
  function historyHtml() {
    if (!st.history.length) return '';
    return '<div class="card"><h3>Round history</h3><div class="cols">' + st.history.map((h, i) => '<div>' + C.genCard({ kind: 'image', prompt: h, loading: false, title: 'Round ' + (i + 1) }) + '</div>').join('') + '</div></div>';
  }
  async function doAssemble() {
    const ps = parts(st.items), prompt = text(ps);
    C.phase('Assemble & generate', 45); assembleScreen();
    await C.revealSlots('slots', 2.2);
    C.$('#genwrap').innerHTML = C.genCard({ id: 'g' + st.round, prompt: prompt + ', vivid illustration' });
    await C.generate('g' + st.round, 10);
    st.history.push(prompt + ', vivid illustration');
    C.log(null, '🖼️ Round ' + st.round + ': ' + prompt, 'sys');
    C.phase('React', 120);
    C.$('#after').innerHTML = st.round < ROUNDS ? '<button class="btn big" data-act="assign">Next round →</button>' : '<button class="btn big pink" data-act="final">🏆 Pick the favorite →</button>';
  }
  function finalScreen() {
    C.phase('Favorite vote & wrap', 150);
    st.board = new C.VoteBoard({ title: 'Favorite creation of the night', options: st.history.map((h, i) => ({ id: 'r' + i, label: 'Round ' + (i + 1) + ': ' + h.slice(0, 50) + '…', short: 'Round ' + (i + 1) })) });
    C.stage('<div class="card"><div class="kicker">Finale</div><h2>Which one goes on the team wall?</h2>' + st.board.html() +
      (C.mode === 'host' ? '<div class="cta"><button class="btn big" data-act="end">🏁 Finish & pacing report</button></div>' : '') + '</div>' + historyHtml());
  }
  function summary() {
    if (!st.board) return historyHtml();
    const w = st.board.winner();
    const i = +w.id.slice(1);
    return '<div class="card center"><div class="kicker">Winner</div><h2>🏆 Round ' + (i + 1) + '</h2><div style="display:flex;justify-content:center">' + C.genCard({ prompt: st.history[i], loading: false }) + '</div></div>';
  }

  const acts = {
    assign() { st.round++; st.items = assign(st.round); C.phase('Assign categories', 30); assignScreen(); },
    collect() { C.phase('Collect words', 90); C.timer('Words in!', 75); collectScreen(); },
    fill() { st.items.forEach(x => x.word = word(x.p.id, x.cat)); collectScreen(); },
    assemble() { C.readGrid('grid', st.items); st.items.forEach(x => { if (!x.word) x.word = word(x.p.id, x.cat); }); C.clearTimer(); doAssemble(); },
    final: finalScreen,
    end() { C.finish(summary()); },
  };

  async function simulate() {
    st = fresh();
    C.phase('Intro & rules', 120); intro();
    await C.sys('Facilitator explains the rules', 40); await C.say('dev', 'So we just… type a word?', 6); await C.say('maya', 'Oh this is going to be chaos. Good.', 8);
    await C.sys('Quick demo prompt so people get it', 45);
    for (let r = 1; r <= ROUNDS; r++) {
      acts.assign(); await C.wait(10);
      if (r === 1) await C.say('sam', 'Wait, can a “character” be a job?', 8), await C.sys('Facilitator: “Yes, anything goes.”', 4);
      await C.wait(8);
      C.phase('Collect words', 90); C.timer('Words in!', 75); collectScreen();
      for (const k of C.shuffle([0, 1, 2, 3, 4, 5, 6])) {
        await C.wait(C.rand(4, r === 1 ? 14 : 9));
        st.items[k].word = word(st.items[k].p.id, st.items[k].cat); C.markGrid('grid', st.items, k);
        await C.act(st.items[k].p, ' submitted (' + st.items[k].cat + ')', 1);
      }
      if (r === 1) await C.say('omar', 'Sorry, still thinking… okay done!', 5);
      C.clearTimer();
      await doAssemble();
      const reactors = C.sample(C.players, 4);
      await C.sys('Room reads it out loud, laughter 😂', 15);
      for (const p of reactors) await C.say(p, C.pick(REACT).replace('%w', C.pick(st.items).word), C.rand(10, 18));
      await C.sys('“Who wrote ' + C.pick(st.items).word + '?!” Authors get outed, side conversations', C.rand(25, 40));
      if (r === 2) await C.say('leo', 'Can we do one more? This is fun.', 5);
    }
    finalScreen(); await C.wait(15);
    await C.simVotes(st.board, () => C.pick(['r0', 'r1', 'r1', 'r2', 'r2', 'r2']));
    await C.say('priya', 'Round ' + (+st.board.winner().id.slice(1) + 1) + ' deserved it.', 10); await C.sys('Wrap-up', 40);
  }

  C.game({
    num: '01', title: 'Exquisite Corpse', emoji: '🧩',
    tagline: 'Seven people each secretly add one ingredient: a number, a name, an animal… The host glues them into one mega-prompt, the AI draws it, and the room reacts.',
    how: '<ol class="tight"><li>Each player gets a secret category (rotates each round)</li><li>Everyone types one word at once</li><li>Words fly into a sentence template</li><li>AI “generates” the image → reactions</li><li>3 rounds, then vote on the favorite</li></ol>',
    plan: [{ name: 'Intro & rules', sec: 120 }, { name: 'Assign categories', sec: 90 }, { name: 'Collect words', sec: 270 }, { name: 'Assemble & generate', sec: 135 }, { name: 'React', sec: 360 }, { name: 'Favorite vote & wrap', sec: 150 }],
    evaluating: ['Does the assembly moment feel exciting?', 'Is 2–3 rounds the right count for 30 min?'],
    notes: '<p><b>Verdict: fun and safe, but thin for 30 minutes.</b> Three rounds take only about 16 min, including the intro, transitions and vote. The assembly reveal is the peak, and it works <i>because</i> words land one by one with the writer’s name under each.</p>' +
      '<h4>Assembly moment</h4><ul class="tight"><li>Keep the one-word-at-a-time reveal (~2s per slot). Showing the whole sentence at once kills the suspense.</li><li>Show the author name under each word. That’s where the laughs come from (“DEV wrote <i>beige</i>”).</li></ul>' +
      '<h4>Round count</h4><p>2 rounds feels like a warm-up; 3 is the sweet spot for laughs. Round 1 is slow (people learn the rules), and rounds 2–3 run faster. 3 rounds alone leave about 14 min of a 30-min slot empty. A 4th round with the <i>same</i> template shows diminishing returns, so if you add rounds, change the template.</p>' +
      '<h4>To fill 30 min well</h4><ul class="tight"><li>Add a 60s “why did you pick that word?” beat after round 3. It turns jokes into get-to-know-you (see #17).</li><li>Or change the template each round (movie poster → product ad → team photo).</li></ul>' +
      '<div class="risk"><b>Facilitator risk note:</b> very low. Words are anonymous until the reveal, and nobody is the butt of the joke.</div>',
    host() { st = fresh(); C.phase('Intro & rules', 120); intro(); },
    simulate, summary, acts,
  });
})();
