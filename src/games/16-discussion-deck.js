// TITLE: 16 · AI Discussion Deck (facilitation tool)
(function () {
  const C = Core;
  // 12 questions. Synthetic answers: persona -> [answer, energy 1..3]. Missing persona = they pass.
  const DECK = [
    { q: 'What’s something AI genuinely can’t do that you’re great at?', a: { priya: ['Remember that someone’s kid was sick last week and ask about it.', 3], omar: ['Tell a story that makes a room go quiet. AI can write one, but it can’t hold the room.', 3], dev: ['Know which alert to ignore at 3am.', 2], maya: ['Parallel park. Wait, AI can do that now. Okay: keep 40 plants alive.', 3], sam: ['Sit with a hard problem without rushing.', 2] } },
    { q: 'What AI tool secretly does 50% of your job?', a: { leo: ['Honestly? It writes the first draft of every PRD. I just argue with it.', 3], dev: ['Autocomplete. I haven’t typed a full for-loop since 2023.', 3], zoe: ['Subject lines. I have no shame.', 2], maya: ['It names my Figma layers. Life-changing.', 3], sam: ['SQL. Don’t tell anyone.', 2] } },
    { q: 'What’s the funniest or worst thing an AI has confidently told you?', a: { zoe: ['It told me a pun I made was “not a real word” and then used it in the next sentence.', 3], omar: ['It invented a whole biography of me. I was a marine biologist in Portugal. I wish.', 3], priya: ['It said my cookie recipe needed “2 cups of salt.” I did not listen.', 3], dev: ['It cited a library that doesn’t exist. Very confidently.', 2], leo: ['It told me I’d run a marathon in 1:52. Flattering. Wrong.', 3] } },
    { q: 'If you could hand one part of your week to an AI forever, what would it be?', a: { maya: ['Expense reports. Take them. Please.', 2], leo: ['Scheduling. All of it.', 2], sam: ['Writing status updates.', 1] } },
    { q: 'What’s a task you’d never let AI touch, and why?', a: { priya: ['Writing a thank-you note. It should cost me something.', 2], sam: ['Hmm. Probably… feedback for people. It needs to come from me.', 2] } },
    { q: 'What did you think AI would be like when you were a kid?', a: { omar: ['I thought it’d be a robot butler named Jeeves who made pancakes.', 3], zoe: ['Rosie from the Jetsons. Still waiting.', 3], maya: ['I thought my Tamagotchi was AI. It died a lot.', 3], dev: ['HAL 9000. So, about the same.', 2], priya: ['A talking teddy bear that helped with homework!', 2] } },
    { q: 'Which part of your job would a robot be worst at?', a: { leo: ['Reading the room when a launch goes sideways.', 2], dev: ['Saying no to a VP politely.', 2] } },
    { q: 'What’s one prompt you use so often it deserves a name?', a: { zoe: ['“Make it punchier.” I call it The Punch.', 3], leo: ['“Find the holes in this plan.” It’s my devil’s advocate.', 2], maya: ['“Explain it like I’m tired.”', 3], dev: ['I don’t name things.', 1] } },
    { q: 'If our team had an AI teammate, what should its personality be?', a: { zoe: ['A golden retriever who also does taxes.', 3], maya: ['Chaotic but kind. Like a raccoon with a heart.', 3], priya: ['Encouraging! It should say “great question” and mean it.', 2], omar: ['A wise old librarian who remembers everything we decided.', 3], sam: ['Quiet. Only speaks when it has something useful.', 2], leo: ['Ruthlessly efficient but sends memes on Fridays.', 3] } },
    { q: 'Have you ever been fooled by something AI-generated?', a: { omar: ['A photo of the Pope in a puffer jacket. I sent it to my mom.', 3], priya: ['A fake recipe video. I made it. It was bad.', 3], dev: ['A code review comment I agreed with. It was wrong.', 2], sam: ['A bird call. Long story.', 2] } },
    { q: 'What’s a skill you’re learning that has nothing to do with AI?', a: { sam: ['Pottery. My bowls are all slightly sad. I love them.', 3], leo: ['Sourdough. It’s humbling.', 2], omar: ['Portuguese, finally. For the Lisbon sequel.', 3], maya: ['Roller skating. I’ve fallen 30 times.', 3] } },
    { q: 'What does “good work” mean when AI can write a first draft in seconds?', a: { sam: ['Maybe… knowing what not to make?', 2], dev: ['Taste.', 1] } },
  ];
  const CARD_SEC = 180;

  let st;
  const fresh = () => ({ pile: C.shuffle(DECK.map((d, i) => i)), discard: [], card: null, seats: C.players.map(p => p.id), mic: 0, spoke: [], heat: {} });

  function seatsHtml() {
    return '<div class="circle">' + st.seats.map((id, i) => { const a = i / 7 * 2 * Math.PI - Math.PI / 2, p = C.player(id); return '<div class="seat' + (i === st.mic ? ' mic' : '') + (st.spoke.includes(id) ? ' spoke' : '') + '" style="left:' + (50 + 40 * Math.cos(a)) + '%;top:' + (50 + 40 * Math.sin(a)) + '%;--pc:' + p.color + '"><span>' + p.emoji + '</span><small>' + C.esc(p.name) + '</small></div>'; }).join('') +
      '<div class="ccenter">🎤<br><small>' + C.esc(C.player(st.seats[st.mic]).name) + '</small></div></div>';
  }
  function deckScreen() {
    const host = C.mode === 'host', d = st.card != null ? DECK[st.card] : null;
    C.stage('<div class="cols"><div class="card"><div class="spread"><span class="kicker">Deck · ' + st.pile.length + ' left · ' + st.discard.length + ' discussed</span>' +
      (host ? '<span class="row"><button class="btn small ghost" data-act="shuffle">🔀 Shuffle</button><button class="btn small" data-act="draw"' + (st.pile.length ? '' : ' disabled') + '>🃏 Draw</button><button class="btn small ghost" data-act="discard"' + (d ? '' : ' disabled') + '>🗑 Discard</button></span>' : '') + '</div>' +
      (d ? '<div class="qcard">' + C.esc(d.q) + '</div>' : '<div class="qcard back">🃏 Draw a card</div>') +
      (host && d ? '<div class="row"><span class="muted">How did it land?</span>' + [1, 2, 3].map(n => '<button class="btn small ' + (st.heat[st.card] && st.heat[st.card].host === n ? '' : 'ghost') + '" data-act="rate" data-n="' + n + '">' + ['😐 polite silence', '🙂 okay', '🔥 landed'][n - 1] + '</button>').join('') + '</div>' : '') + '</div>' +
      '<div class="card"><h3>🎤 Pass the mic</h3>' + seatsHtml() + (host ? '<div class="row" style="justify-content:center"><button class="btn" data-act="spoke">✅ Spoke → next</button><button class="btn ghost" data-act="pass">⏭ Pass</button></div>' : '') + '</div></div>' +
      (host ? '<div class="cta"><button class="btn big ghost" data-act="end">🏁 End session & see which cards landed</button></div>' : ''));
  }
  function nextSeat() { st.mic = (st.mic + 1) % 7; }
  function summary() {
    const rows = Object.entries(st.heat).map(([i, h]) => ({ q: DECK[i].q, avg: h.n ? h.sum / h.n : (h.host || 0), n: h.n, passes: h.passes || 0 })).sort((a, b) => b.avg - a.avg);
    if (!rows.length) return '';
    return '<div class="card"><h2>🌡️ Which questions landed?</h2><table class="rtable"><tr><th>Question</th><th>Energy</th><th>Answers</th><th>Passes</th></tr>' + rows.map(r => '<tr><td>' + C.esc(r.q) + '</td><td class="n">' + (r.avg >= 2.4 ? '🔥' : r.avg >= 1.8 ? '🙂' : '😐') + ' ' + r.avg.toFixed(1) + '</td><td class="n">' + r.n + '</td><td class="n">' + r.passes + '</td></tr>').join('') + '</table>' +
      '<p class="muted">Pattern: questions about <b>stories and funny failures</b> land. Questions asking for an <b>opinion or a value judgment</b> (“what does good work mean…”) get polite silence from people who just met.</p></div>';
  }

  const acts = {
    start() { C.phase('Discussion cards', 1560); deckScreen(); },
    shuffle() { st.pile = C.shuffle(st.pile); deckScreen(); },
    draw() { if (st.card != null) st.discard.push(st.card); st.card = st.pile.shift(); st.spoke = []; st.heat[st.card] = st.heat[st.card] || { sum: 0, n: 0, passes: 0 }; C.timer('This card', CARD_SEC); C.log(null, '🃏 ' + DECK[st.card].q, 'sys'); deckScreen(); },
    discard() { st.discard.push(st.card); st.card = null; C.clearTimer(); deckScreen(); },
    rate(d) { st.heat[st.card].host = +d.n; deckScreen(); },
    spoke() { const id = st.seats[st.mic]; if (!st.spoke.includes(id)) st.spoke.push(id); if (st.card != null) { st.heat[st.card].n++; st.heat[st.card].sum += st.heat[st.card].host || 2; } nextSeat(); deckScreen(); },
    pass() { if (st.card != null) st.heat[st.card].passes++; nextSeat(); deckScreen(); },
    end() { C.finish(summary()); },
  };

  async function simulate() {
    st = fresh();
    C.phase('Framing', 120); C.stage('<div class="card"><h2>🃏 The AI Discussion Deck</h2>' + C.script('No game, no points. We’ll draw a card, pass the mic around the circle, and anyone can pass. 3 minutes per card.') + '</div>');
    await C.sys('Facilitator frames the deck and explains passing', 60); await C.say('dev', 'Passing is allowed? Great.', 6); await C.wait(20);
    C.phase('Discussion cards', 1560);
    for (let c = 0; c < 8 && C.clock < 1680; c++) {
      acts.draw(); const d = DECK[st.card], h = st.heat[st.card];
      await C.sys('Card read aloud', 8);
      let lowStreak = 0;
      for (let k = 0; k < 7 && C.timerLeft() > 0; k++) {
        const id = st.seats[st.mic], p = C.player(id), ans = d.a[id];
        if (!ans) { h.passes++; await C.act(p, ' passes 🤐', 3); if (++lowStreak >= 3) { await C.sys('Three passes in a row: facilitator moves on', 4); nextSeat(); break; } nextSeat(); deckScreen(); continue; }
        const [txt, e] = ans; h.sum += e; h.n++; st.spoke.push(id); deckScreen();
        if (e === 1) await C.sys('…(' + C.randi(4, 8) + 's of silence)', 6);
        await C.say(p, txt, e === 3 ? 30 : e === 2 ? 22 : 10);
        if (e === 3 && C.chance(.6)) { await C.say(C.pick(C.players.filter(x => x.id !== id)), C.pick(['Wait, same!', 'Okay, that’s amazing.', 'Tell me more about that.', 'Hahaha. No.']), 8); await C.sys('Cross-talk, laughter', C.rand(10, 20)); }
        lowStreak = e === 1 ? lowStreak + 1 : 0;
        nextSeat();
        if (lowStreak >= 2) { await C.sys('Energy flat: facilitator wraps the card early', 4); break; }
      }
      const avg = h.n ? h.sum / h.n : 0;
      await C.sys(avg >= 2.4 ? '🔥 Card landed: conversation kept going' : avg >= 1.8 ? '🙂 Decent' : '😐 Polite silence', 5);
      C.clearTimer(); await C.wait(10);
    }
    C.phase('Closing round', 120); C.stage(summary()); await C.sys('Closing: one word each for how this felt', 70);
  }

  C.css('.qcard{font-size:clamp(1.3rem,3vw,1.9rem);font-weight:800;line-height:1.3;padding:28px;border-radius:20px;background:linear-gradient(135deg,var(--accent2),var(--accent));color:#fff;margin:14px 0;min-height:180px;display:flex;align-items:center;animation:pop .4s}.qcard.back{background:repeating-linear-gradient(45deg,var(--card2),var(--card2) 12px,var(--card) 12px,var(--card) 24px);color:var(--muted);justify-content:center}' +
    '.circle{position:relative;width:min(320px,100%);aspect-ratio:1;margin:10px auto}.seat{position:absolute;transform:translate(-50%,-50%);display:flex;flex-direction:column;align-items:center;transition:all .3s}.seat span{display:grid;place-items:center;width:48px;height:48px;border-radius:50%;background:var(--pc);font-size:1.3rem;border:3px solid transparent}.seat small{font-weight:700;font-size:.75rem}.seat.spoke span{opacity:.5}.seat.mic span{border-color:var(--ink);transform:scale(1.25);box-shadow:0 0 0 6px color-mix(in srgb,var(--pc) 35%,transparent)}.ccenter{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);text-align:center;font-size:1.6rem}');

  C.game({
    num: '16', title: 'AI Discussion Deck', emoji: '🃏',
    tagline: 'Not a game: a facilitation tool. 12 AI-themed questions for a new team, a 3-minute timer per card, and a pass-the-mic seating order for 7.',
    how: '<ol class="tight"><li>Draw a card (or shuffle / discard)</li><li>Mic goes around the circle; anyone can pass</li><li>3 minutes per card, or move on when energy drops</li><li>Rate how each card landed</li></ol>',
    plan: [{ name: 'Framing', sec: 120 }, { name: 'Discussion cards', sec: 1560 }, { name: 'Closing round', sec: 120 }],
    evaluating: ['Which questions spark real conversation vs. polite silence?'],
    notes: '<p><b>Verdict: lowest prep, lowest risk, and surprisingly good, if you curate the deck.</b> 3-minute cards mean about 7–9 cards in 30 min. In the simulation weak cards ended early, so 8 cards took about 20–24 min, which leaves time for an open-floor finish.</p>' +
      '<h4>What lands 🔥</h4><ul class="tight"><li>“Funniest or worst thing an AI confidently told you”: everyone has one, and failure stories are bonding.</li><li>“If our team had an AI teammate, what personality?”: creative, low-stakes, and secretly about team values.</li><li>“What did you think AI would be like as a kid?”: nostalgia, easy laughs.</li></ul>' +
      '<h4>What gets polite silence 😐</h4><ul class="tight"><li>“What does good work mean when AI can draft in seconds?”: too philosophical for strangers.</li><li>“A task you’d never let AI touch”: invites a values stance people don’t want to take on day one.</li><li>“Which part of your job would a robot be worst at?”: people get defensive about their role.</li></ul>' +
      '<h4>Tips</h4><ul class="tight"><li>Open with a story question, never a values question.</li><li>Pass-the-mic order matters: start each card with a high-energy person, not the quietest.</li><li>Move on after 2–3 passes in a row. Don’t wait for the timer.</li></ul>' +
      '<div class="risk"><b>Facilitator risk note:</b> very low. Passing is always allowed. The only failure mode is boredom, and the 3-minute cap protects against it.</div>',
    host() {
      st = fresh(); C.phase('Framing', 120);
      C.stage('<div class="card"><h2>🃏 The AI Discussion Deck</h2>' + C.script('No game, no points. We’ll draw a card, pass the mic around the circle, and anyone can pass. 3 minutes per card.') + '<button class="btn big" data-act="start">Open the deck →</button></div>');
    },
    simulate, summary, acts,
  });
})();
