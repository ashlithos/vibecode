// TITLE: 15 · AI Roast of the Team (About Us edition)
(function () {
  const C = Core;
  // Team-level observations (kind), each with the "AI corporate spin" it becomes on the About Us page.
  const POOL = [
    ['Already has 3 Slack channels and nobody knows which one is real.', 'Communication: we believe in redundancy. Our three Slack channels guarantee every message is missed in at least two places.', 'Culture'],
    ['Says “quick sync” and then books 60 minutes.', 'Efficiency: our “quick syncs” are a generous 60 minutes, because we respect every thought, especially the tangents.', 'Culture'],
    ['Has 47 browser tabs open at all times.', 'Focus: collectively we keep 47 tabs open, so no idea is ever truly closed.', 'Mission'],
    ['Every meeting starts with “can you see my screen?”', 'Transparency: we confirm visibility at the start of every meeting. Usually twice.', 'Culture'],
    ['Everyone brings snacks, nobody brings napkins.', 'Generosity: we lead with abundance (of snacks) and trust (that napkins will appear).', 'Values'],
    ['Will schedule a retro about having too many retros.', 'Continuous improvement: we reflect on our reflections, recursively, until enlightened.', 'Traction'],
    ['Nobody knows who owns the shared doc, but everyone has edited it.', 'Ownership: at our company, everyone owns everything. Legally, this is being reviewed.', 'Values'],
    ['Unmutes only after talking for 30 seconds.', 'Thought leadership: our best ideas happen on mute. We’re working on sharing them.', 'Traction'],
    ['Agrees to “circle back” and then lives on the circle forever.', 'Long-term thinking: we circle back on every topic, sometimes for years.', 'Mission'],
  ];
  const SECTIONS = ['Mission', 'Culture', 'Values', 'Traction'];
  const SPIN = r => 'Our culture embraces honesty: ' + r.replace(/\.$/, '') + '. We consider this a competitive advantage.';
  const METER = [['mild', '🧊', 'Mild'], ['right', '😄', 'Just right'], ['spicy', '🌶️', 'Spicy'], ['far', '🚩', 'Too far']];

  let st;
  const fresh = () => ({ subs: [], cur: -1, meter: [], company: C.pick(['Synergy Collective', 'Team Seven™', 'The Circle-Back Company']) });
  const names = () => C.players.map(p => p.name);
  const targetsPerson = text => names().find(n => new RegExp('\\b' + n + '\\b', 'i').test(text));
  const sectionOf = s => s.section || 'Culture';

  function riskPanel() {
    return '<div class="risk"><b>⚠️ Facilitator risk note.</b> With first-time teammates this format is <b>risky</b>. A roast only works with shared history and trust, and on day one there’s none. Rules if you run it: (1) roast <b>the team, our habits, or the company</b>, never one person; (2) anonymous submissions, read by the facilitator first; (3) any 🚩 vote removes the line, no discussion.</div>';
  }
  function submitScreen() {
    const host = C.mode === 'host';
    C.stage('<div class="card"><div class="kicker">Anonymous submission box</div><h2>One lovingly savage observation about <i>us</i></h2>' + C.script('Write one gentle roast of this team, our meetings or our tools. Not about one person. The AI will turn it into our official About Us page.') + riskPanel() +
      (host ? '<div class="row" style="margin-top:12px"><input id="roast" placeholder="e.g. Says “quick sync” and books 60 minutes" data-enter="add" style="flex:1"><button class="btn" data-act="add">Drop in box</button><button class="btn ghost" data-act="sample">🎲 Sample</button></div><small id="rw" class="kind"></small>' : '') +
      '<div class="box">' + st.subs.map(() => '<span class="slip">📄</span>').join('') + '<span class="muted">' + st.subs.length + ' / 7 anonymous slips</span></div>' +
      (host ? '<div class="cta"><button class="btn big pink" data-act="assemble">🤖 Assemble the About Us page</button></div>' : '') + '</div>');
  }
  function addSub(text, spin, section) {
    const who = targetsPerson(text);
    if (who) return who;
    st.subs.push({ text, spin: spin || SPIN(text), section: section || C.pick(SECTIONS) }); st.meter.push({ mild: 0, right: 0, spicy: 0, far: 0 });
    return null;
  }
  function pageHtml(upTo) {
    const by = {}; st.subs.forEach((s, i) => { if (i <= upTo) (by[sectionOf(s)] = by[sectionOf(s)] || []).push([s, i]); });
    return '<div class="aboutus"><div class="au-hero"><div class="kicker">About Us</div><h1>We are ' + C.esc(st.company) + '.</h1><p>Seven humans. One mission. Several Slack channels.</p></div>' +
      SECTIONS.filter(s => by[s]).map(s => '<h2>' + s + '</h2>' + by[s].map(([x, i]) => { const m = st.meter[i]; const flagged = m.far > 0; return '<div class="au-line' + (i === st.cur ? ' cur' : '') + (flagged ? ' flagged' : '') + '"><p>' + C.esc(x.spin) + '</p>' +
        (i <= st.cur ? '<div class="meter">' + METER.map(([k, e, l]) => '<button class="mbtn" data-act="meter" data-i="' + i + '" data-k="' + k + '" title="' + l + '">' + e + ' <b>' + m[k] + '</b></button>').join('') + (flagged ? '<span class="tag bad">removed: someone flagged it</span>' : '') + '</div>' : '') + '</div>'; }).join('')).join('') + '</div>';
  }
  function pageScreen() {
    C.stage('<div class="card"><div class="kicker">Presentation mode · host reads aloud</div>' + pageHtml(st.cur) +
      (C.mode === 'host' ? '<div class="cta">' + (st.cur < st.subs.length - 1 ? '<button class="btn big" data-act="nextLine">Read next line →</button>' : '<button class="btn big pink" data-act="discuss">💬 Debrief →</button>') + '</div>' : '') + '</div>');
  }
  function summary() {
    if (!st.subs.length) return '';
    const tot = k => st.meter.reduce((a, m) => a + m[k], 0);
    return '<div class="card"><h2>🌶️ Roast meter totals</h2><p>' + METER.map(([k, e, l]) => e + ' ' + l + ': <b>' + tot(k) + '</b>').join(' · ') + '</p><p>' + st.meter.filter(m => m.far).length + ' of ' + st.subs.length + ' lines were flagged 🚩 and removed.</p>' + riskPanel() + '</div>';
  }

  const acts = {
    add() { const i = C.$('#roast'); const v = i.value.trim(); if (!v) return; const who = addSub(v); C.$('#rw').textContent = who ? '🛡️ That names ' + who + '. Roast the team, not a person. Try rephrasing as “we”.' : ''; if (!who) { i.value = ''; submitScreen(); } },
    sample() { const unused = POOL.filter(p => !st.subs.some(s => s.text === p[0])); const p = C.pick(unused); addSub(p[0], p[1], p[2]); submitScreen(); },
    async assemble() { if (!st.subs.length) return; C.clearTimer(); C.phase('AI assembles the page', 60); C.stage('<div class="card center"><div class="gen loading" style="margin:auto;max-width:400px;min-height:200px"><div class="gen-load">🤖 Rewriting your roasts as corporate copy…</div></div></div>'); await C.beat(15, 1800); st.cur = 0; C.phase('Read-aloud + roast meter', 360); pageScreen(); },
    meter(d) { st.meter[+d.i][d.k]++; pageScreen(); },
    nextLine() { st.cur++; pageScreen(); },
    discuss() { C.phase('Debrief', 180); C.stage(summary() + '<div class="card">' + C.script('Which of these is <i>actually</i> true about how we want to work? Anything we want to fix on purpose?') + '<button class="btn big" data-act="end">🏁 Finish & pacing report</button></div>'); },
    end() { C.finish(summary()); },
  };

  async function simulate() {
    st = fresh();
    C.phase('Intro & rules', 90); C.stage('<div class="card"><h2>🔥 The AI Roast of Us</h2>' + riskPanel() + '</div>');
    await C.sys('Facilitator sets ground rules: team, not people', 50); await C.say('priya', 'So, nice roasts. Toasts with a little salt.', 8);
    C.phase('Anonymous submissions', 240); submitScreen();
    const picks = C.sample(POOL, 7);
    for (let k = 0; k < 7; k++) {
      await C.wait(C.rand(15, 30));
      if (k === 2) {
        const bad = 'Dev only owns one shirt lol';
        const who = addSub(bad); await C.sys('🛡️ Kindness check: a slip names ' + who + '. Bounced back: “roast the team, not a person”', 6);
        await C.sys('Submitter rewrites it as a team-level observation', 15);
      }
      addSub(picks[k][0], picks[k][1], picks[k][2]); submitScreen(); await C.sys('📄 Anonymous slip dropped in the box (' + st.subs.length + '/7)', 1);
    }
    C.phase('AI assembles the page', 60); await C.sys('🤖 Rewriting roasts as corporate copy…', 15);
    C.phase('Read-aloud + roast meter', 360);
    for (let i = 0; i < st.subs.length; i++) {
      st.cur = i; pageScreen();
      await C.sys('Host reads: “' + st.subs[i].spin + '”', 14);
      const spicy = /owns|lives on|mute/i.test(st.subs[i].text);
      for (let v = 0; v < 7; v++) { const r = Math.random(); st.meter[i][r < .15 ? 'mild' : r < (spicy ? .55 : .8) ? 'right' : r < .97 ? 'spicy' : 'far']++; }
      if (spicy && C.chance(.5)) st.meter[i].far++;
      pageScreen();
      await C.sys(st.meter[i].far ? '🚩 Flagged. Line removed, facilitator moves on without discussion.' : st.meter[i].spicy > 2 ? 'Big laugh 😂 with a few winces' : 'Laughter 😂', 12);
      if (C.chance(.4)) await C.say(C.pick(C.players), C.pick(['Okay who wrote that 😂', 'This is too real for day one.', 'I feel attacked, as a team.', 'Accurate.']), 8);
      await C.wait(6);
    }
    C.phase('Debrief', 180); C.stage(summary());
    await C.sys('“Which of these do we actually want to fix?”', 20); await C.say('leo', 'Honestly the three Slack channels thing. Let’s pick one.', 15); await C.say('sam', 'Agree.', 6); await C.sys('Team agrees on one working norm', 60);
    C.phase('Wrap', 60); await C.sys('Page saved to the team wiki as a joke… and a working agreement', 30);
  }

  C.css('.box{display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin-top:14px;padding:14px;border:2px dashed var(--line);border-radius:14px;min-height:60px}.slip{font-size:1.6rem;animation:pop .3s}.kind{color:var(--bad);font-weight:650}' +
    '.aboutus{max-width:760px;margin:auto;font-family:Georgia,serif}.au-hero{padding:24px;border-radius:16px;background:linear-gradient(135deg,var(--accent2),var(--accent));color:#fff;margin-bottom:12px}.au-hero .kicker{color:#fff;opacity:.85}.aboutus h2{margin-top:18px}.au-line{padding:10px 14px;border-left:4px solid var(--line);margin:8px 0;font-size:1.1rem;transition:all .3s}.au-line.cur{border-color:var(--accent);background:var(--card2)}.au-line.flagged p{filter:blur(4px)}' +
    '.meter{display:flex;gap:6px;flex-wrap:wrap;font-family:system-ui,sans-serif}.mbtn{font:inherit;font-size:.85rem;border:1.5px solid var(--line);background:var(--card);color:var(--ink);border-radius:10px;padding:4px 10px;min-height:34px;cursor:pointer}');

  C.game({
    num: '15', title: 'AI Roast of the Team', emoji: '🔥',
    tagline: 'Everyone anonymously submits one lovingly savage observation about the team. The AI turns them into a mock corporate About Us page, which the host reads aloud while the room rates each line on a roast meter.',
    how: '<ol class="tight"><li>Anonymous slips: one team-level roast each</li><li>Kindness check bounces slips that name a person</li><li>AI rewrites them as corporate About Us copy</li><li>Host reads each line; the room rates it 🧊 😄 🌶️ 🚩</li><li>🚩 removes a line instantly</li></ol>',
    plan: [{ name: 'Intro & rules', sec: 90 }, { name: 'Anonymous submissions', sec: 240 }, { name: 'AI assembles the page', sec: 60 }, { name: 'Read-aloud + roast meter', sec: 360 }, { name: 'Debrief', sec: 180 }, { name: 'Wrap', sec: 60 }],
    evaluating: ['With FIRST-TIME teammates, does this stay kind or get risky?'],
    notes: '<p><b>Honest verdict: don’t run this at a first meeting.</b> Run it at meeting 3+ or a team offsite instead.</p>' +
      '<h4>Why it’s risky on day one</h4><ul class="tight"><li><b>No material.</b> Strangers have nothing to roast but appearance and intro facts. Both are personal, and both land badly.</li><li><b>No trust buffer.</b> Between friends a roast says “I see you, and we’re close”. Between strangers it just says “I see you”.</li><li><b>Asymmetric harm.</b> One bad line can sour a whole first impression, and anonymity makes people bolder than they’d be face to face.</li></ul>' +
      '<h4>If you must, the safe version</h4><ul class="tight"><li>Roast <b>the company, our tools, or meeting culture</b>, never people. (This prototype bounces slips that name a teammate.)</li><li>The facilitator reads every slip before it goes on screen.</li><li>One 🚩 removes the line, no discussion.</li><li>End with the debrief: “which of these do we actually want to fix?” This turns jokes into working norms, and that’s the real value.</li></ul>' +
      '<p><b>Timing:</b> about 11–12 min, which leaves room for a longer debrief (the most valuable part).</p>' +
      '<div class="risk"><b>Facilitator risk note: HIGH for first-time teams, medium once people have worked together for a few weeks.</b></div>',
    host() {
      st = fresh(); C.phase('Intro & rules', 90);
      C.stage('<div class="card"><h2>🔥 The AI Roast of Us</h2>' + riskPanel() + '<div class="cta"><button class="btn big" data-act="open">Open the submission box →</button></div></div>');
    },
    simulate, summary, acts: Object.assign(acts, { open() { C.phase('Anonymous submissions', 240); C.timer('Submit', 240); submitScreen(); } }),
  });
})();
