// TITLE: 10 · AI Recognition Songs (awards night)
(function () {
  const C = Core;
  const TRAIT = { maya: 'forty houseplants', dev: 'five identical shirts', priya: 'stress-baked cookies', leo: 'marathon legs', sam: 'sunrise hikes', zoe: 'the puns', omar: 'stories from Lisbon' };
  const GENRES = {
    'Power ballad': (n, t) => [n + ', you light the darkest sprint', 'with ' + t + ' and that quiet glint', 'when the build is red and hope is thin', 'you’re the reason we begin'],
    'Country': (n, t) => ['Well, ' + n + ' rode in on a Monday morn', 'with ' + t + ' and a heart well-worn', 'ain’t no bug they couldn’t tame', 'Lord, this team ain’t been the same'],
    'Sea shanty': (n, t) => ['Oh ' + n + ', ' + n + ', bring us ' + t + '!', 'Heave ho, the backlog’s sailing far', 'through the storm of meetings we will row', 'with ' + n + ' at the helm, yo-ho!'],
    'Synth-pop': (n, t) => [n + ' on the dance floor of the Q3 plan', t + ' in the neon, yes they can', 'ooh-ooh, ship it tonight', n + ', you make the roadmap bright'],
    'Lo-fi': (n, t) => ['slow mornings, ' + t + ', rain on the glass', n + ' drafts the future, lets the meetings pass', 'soft keys, warm mug, everything’s fine', n + ', you’re the beat behind the deadline'],
    'Opera': (n, t) => ['O ' + n + '! O keeper of ' + t + '!', 'The heavens weep, the stand-up ends!', 'Sing, sing of merges clean and bright', n + ', our aria tonight!'],
    '80s rock': (n, t) => [n + '! (whoa-oh) Born to ship!', t + ' burning on a midnight trip', 'turn it up, the servers scream', n + ', the hero of the team!'],
  };
  const REACT = { maya: 'I’m going to play this for my plants.', dev: 'I have never been sung to. I don’t hate it.', priya: 'Okay I’m actually emotional?', leo: 'Adding this to my running playlist immediately.', sam: '…that was really sweet. Thank you.', zoe: 'Encore! ENCORE!', omar: 'This will be in my memoir.' };

  let st;
  const fresh = () => ({ songs: [], i: -1, playing: false, applause: 0, energy: [], board: null });
  function make() {
    const g = C.shuffle(Object.keys(GENRES));
    return C.shuffle(C.players).map((p, k) => ({ p, genre: g[k], title: C.pick(['Ballad of ', 'Ode to ', 'Hymn for ', '', 'Legend of ']) + p.name, lyrics: GENRES[g[k]](p.name, TRAIT[p.id] || 'their brilliance') }));
  }
  function songScreen() {
    const s = st.songs[st.i];
    C.stage('<div class="card"><div class="kicker">Nominee ' + (st.i + 1) + ' of 7 · ' + C.esc(s.genre) + '</div><div class="spread"><h2>🎵 “' + C.esc(s.title) + '”</h2>' + C.chip(s.p, { big: true }) + '</div>' +
      '<div class="cols"><div class="lyrics">' + s.lyrics.map(l => '<p>' + C.esc(l) + '</p>').join('') + '</div>' +
      '<div><div class="player"><button class="playbtn" data-act="play">' + (st.playing ? '❚❚' : '▶') + '</button><div class="pmeta"><b>' + C.esc(s.title) + '</b><small>AI song · ' + C.esc(s.genre) + ' · 0:30 · placeholder audio</small><div class="pbar"><i id="pbar"></i></div></div></div>' +
      '<!-- REAL API PLUG-IN POINT: generate a 30s song from these lyrics + genre with an AI music API and play it here. -->' +
      '<div class="gen-prompt">Prompt that would be sent: 30-second ' + C.esc(s.genre.toLowerCase()) + ' song celebrating ' + C.esc(s.p.name) + ', lyrics: ' + C.esc(s.lyrics.join(' / ')) + '</div>' +
      '<h4>👏 Applause meter</h4><div class="applause"><i id="ap" style="width:' + st.applause + '%"></i></div>' +
      (C.mode === 'host' ? '<div class="cta"><button class="btn big" data-act="clap">👏 Clap (tap fast!)</button><button class="btn big ghost" data-act="next">' + (st.i < 6 ? 'Next nominee →' : '🏆 Track of the Night →') + '</button></div>' : '') + '</div></div></div>');
  }
  // Animate the fake progress bar from the round timer (works in both host and sim clocks).
  setInterval(() => {
    const b = document.getElementById('pbar'); if (!b) return;
    b.style.width = st && st.playing ? Math.min(100, (30 - C.timerLeft()) / 30 * 100) + '%' : b.style.width;
    if (st && st.playing && C.timerLeft() <= 0) { st.playing = false; C.clearTimer(); const pb = C.$('.playbtn'); if (pb) pb.textContent = '▶'; }
    if (st && st.applause > 0 && C.mode === 'host') { st.applause = Math.max(0, st.applause - 1.2); const a = document.getElementById('ap'); if (a) a.style.width = st.applause + '%'; }
  }, 100);
  function energyChart() {
    return '<div class="echart">' + st.energy.map((e, k) => '<div><i style="height:' + e + '%"></i><small>' + (k + 1) + '</small></div>').join('') + '</div>';
  }
  function voteScreen() {
    st.board = new C.VoteBoard({ title: 'Track of the Night', options: st.songs.map(s => ({ id: s.p.id, label: s.title + ' (' + s.genre + ')', short: s.genre })), exclude: (v, o) => v.id === o.id });
    C.stage('<div class="card"><h2>🏆 Track of the Night</h2><p class="muted">You can’t vote for your own song.</p>' + st.board.html() + (C.mode === 'host' ? '<button class="btn big" data-act="end">🏁 Finish & pacing report</button>' : '') + '</div>');
  }
  function summary() {
    let h = '';
    if (st.board && st.board.voted()) { const w = st.songs.find(s => s.p.id === st.board.winner().id); h += '<div class="card center"><div class="kicker">Track of the Night</div><h2>🏆 “' + C.esc(w.title) + '”</h2><p>' + C.esc(w.genre) + ' for ' + C.chip(w.p) + '</p></div>'; }
    if (st.energy.length) h += '<div class="card"><h3>Room energy (applause peak) per song</h3>' + energyChart() + '<p class="muted">Watch for the dip in the middle of the ceremony.</p></div>';
    return h;
  }

  const acts = {
    start() { st.i = 0; C.phase('Songs', 630); songScreen(); },
    play() { st.playing = true; C.timer('Now playing', 30); songScreen(); },
    clap() { st.applause = Math.min(100, st.applause + 9); C.$('#ap').style.width = st.applause + '%'; },
    next() { st.energy.push(Math.round(Math.max(st.applause, 10))); st.applause = 0; st.playing = false; C.clearTimer(); if (st.i < 6) { st.i++; songScreen(); } else { C.phase('Track of the Night vote', 120); voteScreen(); } },
    end() { C.finish(summary()); },
  };

  async function simulate() {
    st = fresh(); st.songs = make();
    C.phase('Welcome to the awards', 120); C.stage('<div class="card"><h2>🎤 The Team Music Awards</h2>' + C.script('Tonight, every one of you is a nominee. The AI wrote each of you a 30-second song. Applause is mandatory. Then we crown the Track of the Night.') + '</div>');
    await C.sys('Host does a red-carpet bit', 60); await C.say('zoe', 'I’ve prepared a speech.', 8); await C.sys('Laughter; first nominee queued', 25);
    C.phase('Songs', 630);
    const curve = [95, 85, 72, 58, 50, 60, 82]; // energy dips mid-ceremony, recovers for the finale
    for (let i = 0; i < 7; i++) {
      st.i = i; const s = st.songs[i]; st.applause = 0; songScreen();
      await C.sys('🎙️ “Our next nominee: ' + s.p.name + ', in the ' + s.genre.toLowerCase() + ' category!” (host does a little bit)', 20);
      st.playing = true; C.timer('Now playing', 30); songScreen(); await C.wait(30);
      st.playing = false;
      st.applause = curve[i] + C.randi(-6, 6); C.$('#ap').style.width = st.applause + '%';
      await C.sys(st.applause > 75 ? '👏👏👏 Big applause, someone whoops' : st.applause > 55 ? '👏👏 Warm applause' : '👏 Polite applause…', 15);
      await C.say(s.p, REACT[s.p.id], 20);
      if (i === 4) await C.say('dev', '(whispers) How many more?', 3);
      if (i === 3) await C.say('maya', 'Can we do the sea shanty again?', 5);
      st.energy.push(st.applause); C.clearTimer(); await C.wait(8);
    }
    C.phase('Track of the Night vote', 120); voteScreen(); await C.wait(10);
    await C.simVotes(st.board, () => C.pick(st.songs.filter(s => /shanty|80s|Opera/.test(s.genre)).concat(st.songs)).p.id, { gap: 3 });
    C.phase('Winner + encore', 60); await C.sys('Winner announced. Encore played 🎉', 45);
  }

  C.css('.lyrics{font-family:Georgia,serif;font-size:1.3rem;line-height:1.5;padding:14px 18px;background:var(--card2);border-radius:14px}.lyrics p{margin:.3em 0}' +
    '.player{display:flex;gap:12px;align-items:center;padding:12px;border-radius:16px;background:var(--ink);color:var(--bg)}.playbtn{width:56px;height:56px;border-radius:50%;border:0;background:var(--accent);color:#fff;font-size:1.3rem;cursor:pointer}.pmeta{flex:1;display:flex;flex-direction:column;gap:4px}.pmeta small{opacity:.7}.pbar{height:6px;border-radius:4px;background:rgba(127,127,127,.4);overflow:hidden}.pbar i{display:block;height:100%;width:0;background:var(--accent)}' +
    '.applause{height:22px;border-radius:12px;background:var(--line);overflow:hidden}.applause i{display:block;height:100%;background:linear-gradient(90deg,var(--warn),var(--accent));transition:width .2s}' +
    '.echart{display:flex;gap:10px;align-items:flex-end;height:140px;padding-top:10px}.echart div{flex:1;display:flex;flex-direction:column;align-items:center;height:100%;justify-content:flex-end}.echart i{display:block;width:100%;background:var(--accent2);border-radius:6px 6px 0 0}');

  C.game({
    num: '10', title: 'AI Recognition Songs', emoji: '🎤',
    tagline: 'A mock awards ceremony. Each player gets a 30-second AI-written appreciation song in a different genre. Play each one, applaud, react, then crown the Track of the Night.',
    how: '<ol class="tight"><li>Host introduces each nominee</li><li>Play the 30s song (lyrics on screen)</li><li>Applause break (the meter is tappable)</li><li>Nominee reacts</li><li>×7, then vote for Track of the Night</li></ol>',
    plan: [{ name: 'Welcome to the awards', sec: 120 }, { name: 'Songs', sec: 630 }, { name: 'Track of the Night vote', sec: 120 }, { name: 'Winner + encore', sec: 60 }],
    evaluating: ['Does the ceremony format carry 7 songs, or does energy dip halfway?'],
    notes: '<p><b>Verdict: delightful for 3–4 songs, then it sags.</b> 7 songs is about 11 min, and the whole ceremony is about 14–15 min, so it fits easily. But the energy chart in the simulation dips hard around songs 4–5: same structure, same 30s wait, and people become an audience instead of participants.</p>' +
      '<h4>Fixes for the mid-ceremony dip</h4><ul class="tight"><li>Use <b>15-second clips</b> instead of 30. The joke lands in the first chorus.</li><li>Split into two “sets” with the vote in between, or crown a different category after each set.</li><li>Get the room involved: everyone sings the last line together, or the nominee picks the genre live.</li><li>Order matters: open with the funniest genre (sea shanty, opera) and close with the most heartfelt.</li></ul>' +
      '<div class="risk"><b>Facilitator risk note:</b> low-medium. Being sung to in front of strangers is intense for introverts. Let people opt out (“skip mine, I’ll vote”). With only intro-level facts, lyrics risk feeling generic, so collect one fun fact per person beforehand.</div>',
    host() {
      st = fresh(); st.songs = make(); C.phase('Welcome to the awards', 120);
      C.stage('<div class="card"><h2>🎤 The Team Music Awards</h2>' + C.script('Tonight, every one of you is a nominee. The AI wrote each of you a 30-second song. Applause is mandatory. Then we crown the Track of the Night.') + '<button class="btn big" data-act="start">First nominee →</button></div>');
    },
    simulate, summary, acts,
  });
})();
