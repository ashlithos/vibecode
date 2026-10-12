// TITLE: 14 · Ship-it Challenge (demo day)
(function () {
  const C = Core;
  const THEMES = ['Redesign our team as a product', 'An app nobody asked for', 'Fix the worst part of Mondays'];
  const TEAMS = [{ id: 't1', name: 'Team Turbo', emoji: '⚡', members: ['maya', 'leo', 'zoe'], kind: 'landing page' }, { id: 't2', name: 'Team Quiet Storm', emoji: '🌩️', members: ['dev', 'sam'], kind: 'mascot' }, { id: 't3', name: 'Team Biscuit', emoji: '🍪', members: ['priya', 'omar'], kind: 'jingle' }];
  // Synthetic output per theme × team: [product name, artifact text, 2-line pitch]
  const OUT = {
    0: { t1: ['TeamOS 1.0', 'HERO: “Seven humans. One shared brain cell. Infinite snacks.” CTA: [Request a sync →] Pricing: free, but you have to come to stand-up.', 'We’re the only team with a 99.9% uptime on vibes.|Early adopters get Maya’s houseplants.'], t2: ['Sir Debug', 'A calm stone owl in a hoodie who silently fixes your bugs at 2am and leaves a single nod emoji.', 'He doesn’t talk. He ships.|Available as a sticker pack.'], t3: ['The Team Song', '♪ “We’re seven strangers, now we’re a crew / we bake, we ship, we’ll debug for you” ♪ (ukulele, 20s)', 'Catchy enough to be annoying.|We’ll play it at every launch.'] },
    1: { t1: ['Snoozr', 'HERO: “The alarm that negotiates with you.” Features: counteroffers, guilt trips, a 5-minute payment plan.', 'You’ve been snoozing wrong your whole life.|Series A: one croissant.'], t2: ['Mr. Receipt', 'A crumpled receipt with googly eyes who tracks every coffee you swore you didn’t buy.', 'Personal finance, but judgmental.|He sees everything.'], t3: ['Plant Parent Pro', '♪ “Did you water me? (No you didn’t) / I’m a fern and I’m feeling forgotten” ♪ (sad country, 25s)', 'An app that guilt-trips you on behalf of your plants.|Maya is our first customer.'] },
    2: { t1: ['Monday.exe', 'HERO: “Monday, but it starts at 11.” CTA: [Delay my week →] Testimonial: “I cried (happy)” — Leo', 'We moved Monday to Tuesday.|Patent pending.'], t2: ['The Calm Capybara', 'A capybara in a bathrobe who blocks your calendar until you’ve had coffee.', 'No meetings before caffeine.|Enforced by a rodent.'], t3: ['Monday Morning Anthem', '♪ “Inbox at a hundred, coffee in my hand / Monday you’re a mountain, but we’re a band” ♪ (80s power rock, 30s)', 'Plays automatically at 9:00 AM.|Volume cannot be lowered.'] },
  };
  const STAGES = [['💡', 'Idea'], ['✏️', 'Sketch'], ['🔨', 'Building'], ['😱', 'Panic'], ['🚀', 'Shipped']];
  const BUILD_MIN = 20;
  const CHATTER = { t1: ['What if it has a pricing page?', 'Ship it. SHIP IT.', 'Zoe, the tagline needs a pun.', 'I made a logo. Don’t look at it yet.'], t2: ['…', 'Should he have a hoodie?', 'Yes.', 'Done.'], t3: ['I hummed a melody into my phone.', 'Can it rhyme with Monday? Nothing rhymes with Monday.', 'Sunday! Fun day!', 'Okay we’re geniuses.'] };

  let st;
  const fresh = () => ({ theme: 0, stage: { t1: 0, t2: 0, t3: 0 }, out: null, d: 0, board: null });
  const teamOf = pid => TEAMS.find(t => t.members.includes(pid));

  function themeScreen() {
    C.stage('<div class="card"><div class="kicker">Theme + teams</div><h2>🚢 Ship-it challenge</h2>' + C.script('You have ' + BUILD_MIN + ' minutes to build something with AI. Then it’s demo day.') +
      '<div class="row">' + THEMES.map((t, i) => '<button class="btn ' + (st.theme === i ? '' : 'ghost') + '" data-act="theme" data-i="' + i + '">' + C.esc(t) + '</button>').join('') + '</div>' +
      '<div class="cols" style="margin-top:14px">' + TEAMS.map(t => '<div class="card tint"><h3>' + t.emoji + ' ' + t.name + '</h3>' + t.members.map(id => C.chip(id)).join(' ') + '<p><small>Building: a ' + t.kind + '</small></p></div>').join('') + '</div>' +
      (C.mode === 'host' ? '<div class="cta"><button class="btn big pink" data-act="ff">⏩ Fast-forward the build (montage)</button><button class="btn big ghost" data-act="real">⏱ Real ' + BUILD_MIN + '-min build timer</button></div>' : '') + '</div>');
  }
  function buildScreen() {
    C.stage('<div class="card"><div class="kicker">Build sprint · theme: ' + C.esc(THEMES[st.theme]) + '</div><h2>⏩ Build montage</h2><div class="lanes">' + TEAMS.map(t => '<div class="lane"><div class="spread"><b>' + t.emoji + ' ' + t.name + '</b><small>' + t.kind + '</small></div><div class="track">' +
      STAGES.map((s, i) => '<span class="stg ' + (i <= st.stage[t.id] ? 'on' : '') + '">' + s[0] + '<small>' + s[1] + '</small></span>').join('') + '</div>' +
      (st.stage[t.id] >= 4 ? '<div class="artifact">' + C.esc(OUT[st.theme][t.id][1]) + '</div>' : '') + '</div>').join('') + '</div>' +
      (C.mode === 'host' ? '<div class="cta"><button class="btn big" data-act="demos">🎤 Demo day →</button></div>' : '') + '</div>');
  }
  function demoScreen() {
    const t = TEAMS[st.d], [name, art, pitch] = OUT[st.theme][t.id];
    C.stage('<div class="card"><div class="kicker">Demo ' + (st.d + 1) + ' of 3 · ' + t.emoji + ' ' + t.name + '</div><h1>' + C.esc(name) + '</h1><div class="cols"><div>' +
      C.genCard({ kind: t.kind === 'jingle' ? 'song' : t.kind === 'mascot' ? 'square' : 'image', prompt: t.kind + ' for "' + name + '": ' + art, title: t.kind, loading: false }) + '</div>' +
      '<div><p class="big-text">' + pitch.split('|').map(C.esc).join('<br>') + '</p><p>' + t.members.map(id => C.chip(id)).join(' ') + '</p>' +
      (C.mode === 'host' ? '<button class="btn big" data-act="nextDemo">' + (st.d < 2 ? 'Next demo →' : '🗳️ Voting →') + '</button>' : '') + '</div></div></div>');
  }
  function voteScreen() {
    st.board = new C.VoteBoard({ cats: [{ id: 'ship', label: '🚢 Most shippable' }, { id: 'cursed', label: '💀 Most cursed' }, { id: 'demo', label: '🎤 Best demo' }], options: TEAMS.map(t => ({ id: t.id, label: OUT[st.theme][t.id][0], emoji: t.emoji })), exclude: (v, o) => teamOf(v.id).id === o.id });
    C.stage('<div class="card"><h2>🗳️ Category voting</h2><p class="muted">You can’t vote for your own team.</p>' + st.board.html() + (C.mode === 'host' ? '<button class="btn big" data-act="end">🏆 Winners & pacing report</button>' : '') + '</div>');
  }
  function summary() {
    if (!st.board) return '';
    return '<div class="card"><h2>🏆 Winners</h2><div class="cols">' + st.board.cats.map(c => { const w = st.board.winner(c.id), t = TEAMS.find(x => x.id === w.id); return '<div class="card tint center"><div class="kicker">' + c.label + '</div><h3>' + t.emoji + ' ' + C.esc(OUT[st.theme][t.id][0]) + '</h3><small>' + w.n + ' votes</small></div>'; }).join('') + '</div></div>';
  }

  const acts = {
    theme(d) { st.theme = +d.i; themeScreen(); },
    async ff() { C.phase('Build sprint', BUILD_MIN * 60); buildScreen(); for (let s = 1; s <= 4; s++) { await C.sleep(1100); TEAMS.forEach(t => st.stage[t.id] = Math.min(4, s + (t.id === 't2' ? 0 : C.randi(-1, 0)))); buildScreen(); } TEAMS.forEach(t => st.stage[t.id] = 4); buildScreen(); C.log(null, '⏩ Build fast-forwarded (real game: ' + BUILD_MIN + ' min)', 'sys'); },
    real() { C.phase('Build sprint', BUILD_MIN * 60); C.timer('Build', BUILD_MIN * 60); TEAMS.forEach(t => st.stage[t.id] = 2); buildScreen(); },
    demos() { C.clearTimer(); TEAMS.forEach(t => st.stage[t.id] = 4); st.d = 0; C.phase('Demos', 360); C.timer('Demo', 120); demoScreen(); },
    nextDemo() { if (st.d < 2) { st.d++; C.timer('Demo', 120); demoScreen(); } else { C.clearTimer(); C.phase('Voting', 120); voteScreen(); } },
    end() { C.finish(summary()); },
  };

  async function simulate() {
    st = fresh();
    C.phase('Theme & teams', 120); themeScreen(); await C.sys('Facilitator reveals 3 theme options; room votes', 30);
    st.theme = C.randi(0, 2); themeScreen(); await C.sys('Theme chosen: “' + THEMES[st.theme] + '”', 10); await C.sys('Teams form, tools explained (which AI to use, where to put the output)', 70);
    C.phase('Build sprint', BUILD_MIN * 60); C.timer('Build', BUILD_MIN * 60); buildScreen();
    for (let m = 1; m <= BUILD_MIN; m++) {
      await C.wait(55);
      for (const t of TEAMS) {
        const target = Math.min(4, Math.floor(m / (BUILD_MIN / 4) + (t.id === 't3' ? .3 : 0)));
        if (target > st.stage[t.id]) { st.stage[t.id] = target; buildScreen(); await C.act(t.members[0], ' (' + t.name + ') → ' + STAGES[target][0] + ' ' + STAGES[target][1], 1); }
        else if (C.chance(.22)) await C.say(C.pick(t.members), C.pick(CHATTER[t.id]), 1);
      }
      if (m === 15) await C.sys('“5 minutes left!” Panic sets in for ' + TEAMS[0].name, 1);
      if (m === BUILD_MIN) { await C.sys('“Pencils down!” … ' + TEAMS[0].name + ': “one more minute, the AI is still generating”', 50); }
    }
    TEAMS.forEach(t => st.stage[t.id] = 4); buildScreen(); C.clearTimer();
    C.phase('Demos', 360);
    for (let d = 0; d < 3; d++) {
      st.d = d; const t = TEAMS[d]; C.timer('Demo', 120); demoScreen();
      await C.sys('Screen-share handoff, “can you see my screen?”', 20);
      await C.say(t.members[0], OUT[st.theme][t.id][2].split('|')[0], 30);
      await C.say(C.pick(t.members), OUT[st.theme][t.id][2].split('|')[1], 25);
      await C.sys('Laughter, one question from the audience', 40);
    }
    C.clearTimer(); C.phase('Voting', 120); voteScreen(); await C.wait(10);
    for (const c of ['ship', 'cursed', 'demo']) await C.simVotes(st.board, () => C.pick(TEAMS).id, { cat: c, gap: 2, straggler: 4 });
    C.phase('Winners', 60); C.stage(summary()); await C.sys('Winners announced 🏆', 40);
  }

  C.css('.lanes{display:flex;flex-direction:column;gap:12px}.lane{border:2px solid var(--line);border-radius:16px;padding:12px}.track{display:flex;gap:6px;margin-top:8px}.stg{flex:1;display:flex;flex-direction:column;align-items:center;padding:8px 4px;border-radius:10px;background:var(--line);opacity:.4;font-size:1.3rem;transition:all .3s}.stg small{font-size:.65rem;font-weight:700}.stg.on{opacity:1;background:var(--card2);border:2px solid var(--accent2)}.artifact{margin-top:10px;padding:12px;border-radius:12px;background:var(--ink);color:var(--bg);font-size:.95rem;animation:pop .4s}');

  C.game({
    num: '14', title: 'Ship-it Challenge', emoji: '🚢',
    tagline: 'A fast-forwarded hackathon: 3 teams build a landing page, a mascot or a jingle with AI in 20 minutes, then it’s demo day with category voting.',
    how: '<ol class="tight"><li>Pick a theme (3 options)</li><li>3 teams of 2–3 build for 20 min (fast-forward montage in this prototype)</li><li>Demo day: artifact + 2-line pitch</li><li>Vote: most shippable / most cursed / best demo</li></ol>',
    plan: [{ name: 'Theme & teams', sec: 120 }, { name: 'Build sprint', sec: 1200 }, { name: 'Demos', sec: 360 }, { name: 'Voting', sec: 120 }, { name: 'Winners', sec: 60 }],
    evaluating: ['Does the compressed format still feel like a competition?', 'Is demo + voting enough, or does it need the real build time to work?'],
    notes: '<p><b>Verdict: needs the real build time, and that build time doesn’t fit.</b> As planned it’s 31 min. The simulation lands at about 29½ min, using the whole slot even though nothing goes wrong. Real teams always ask for “one more minute”, and screen-share handoffs eat 20s each.</p>' +
      '<h4>Does compressed still feel like a competition?</h4><p>The <b>demos and voting</b> do: three categories means every team can win something, and “most cursed” is the crowd favorite. But the montage (fast-forward) version has no stakes. The fun of a hackathon is the <i>panic</i> at minute 15, and you only get that by actually building.</p>' +
      '<h4>To fit 30 min</h4><ul class="tight"><li><b>12-minute build</b>, with one artifact type per team assigned up front (no deciding).</li><li>90s demos, no Q&A. Screen-share set up beforehand.</li><li>Pre-pick the theme and skip the theme vote.</li></ul>' +
      '<p>Or run it as a 45-min session. For first-time teammates, a pair or trio building together is one of the best bonding formats, so it may be worth the time.</p>' +
      '<div class="risk"><b>Facilitator risk note:</b> low-medium. Tool friction (accounts, logins) can eat the build. Have one shared AI tool ready, and make sure each team has someone comfortable driving.</div>',
    host() { st = fresh(); C.phase('Theme & teams', 120); themeScreen(); },
    simulate, summary, acts,
  });
})();
