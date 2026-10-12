// TITLE: 09 · Emotion-aware AI Secret Santa (organizer)
(function () {
  const C = Core;
  const MOODS = { maya: 'running on cold brew and chaos', dev: 'fine. totally fine.', priya: 'excited for the long weekend!', leo: 'training for a half marathon, slightly hungry', sam: 'calm, a little sleepy', zoe: 'hyped about karaoke on Friday', omar: 'missing home cooking' };
  const BUCKETS = [
    ['tired', /tired|sleep|exhaust|coffee|cold brew|nap/i], ['stressed', /stress|deadline|busy|swamped|chaos|fine\. totally/i], ['hungry', /hungry|snack|lunch|food|starv/i],
    ['excited', /excited|pumped|hyped|can.t wait|weekend|vacation|trip|karaoke/i], ['nostalgic', /miss|nostalg|remember|home/i], ['calm', /calm|zen|chill|peace|relax/i],
  ];
  const NEED = { tired: 'a gift that gently tucks them in', stressed: 'something that makes deadlines vanish, or at least smell like lavender', hungry: 'snacks, obviously and urgently', excited: 'a co-conspirator for their hype', nostalgic: 'a small piece of home', calm: 'a tiny bit of chaos to keep life interesting', mysterious: 'a surprise even they can’t predict' };
  const GIVE = { tired: 'will choose thoughtfully, from bed', stressed: 'will over-plan this gift in a spreadsheet', hungry: 'will absolutely panic-buy food', excited: 'has enough energy to gift-wrap a car', nostalgic: 'will pick something with a backstory', calm: 'brings serene, perfectly chosen vibes', mysterious: 'operates entirely in the shadows' };
  const TPL = [
    (g, r, k) => 'The algorithm detected that ' + r.n + ' needs ' + NEED[r.b] + ', and ' + g.n + ' ' + GIVE[g.b] + '. Compatibility: ' + (87 + k % 13) + '%.',
    (g, r, k) => g.N + ' is “' + g.m + '”. ' + r.N + ' is “' + r.m + '”. Science cannot explain this pairing, but the vibes can.',
    (g, r, k) => 'Emotional forecast: ' + g.b + ' meets ' + r.b + '. Expect a gift that is ' + ['oddly specific', 'deeply sincere', 'mildly unhinged', 'perfectly timed'][k % 4] + '.',
    (g, r, k) => r.N + ' is ' + r.b + '. ' + g.N + ' is ' + g.b + '. Together they form a complete emotional breakfast.',
    (g, r, k) => 'Our mood-matching model (a hamster on a wheel) chose ' + g.n + ' for ' + r.n + ' because ' + g.b + ' energy is the known cure for ' + r.b + ' energy.',
    (g, r, k) => 'If ' + r.n + ' is “' + r.m + '”, the only person qualified to fix that is someone who ' + GIVE[g.b] + '.',
  ];

  let st;
  const fresh = () => ({ moods: Object.fromEntries(C.players.map(p => [p.id, MOODS[p.id]])), noMutual: true, excl: [], perm: null, lines: [], shown: 0, safe: true, draws: 0 });
  const bucket = m => (BUCKETS.find(([, re]) => re.test(m)) || ['mysterious'])[0];

  function pair() {
    // Derangement + constraints: no self, optional no mutual pairs (A→B and B→A), and exclusions (gifter ≠ giftee).
    for (let t = 0; t < 5000; t++) {
      const p = C.derange(7, st.noMutual);
      if (st.excl.some(([a, b]) => p[a] === b)) continue;
      st.perm = p; st.draws++; break;
    }
    if (!st.perm) { C.log(null, '⚠️ No valid pairing satisfies those exclusions', 'sys'); return; }
    st.lines = C.players.map((g, i) => ({ g, r: C.players[st.perm[i]], tpl: C.randi(0, TPL.length - 1), k: C.randi(0, 999) }));
    st.shown = 0;
  }
  // Reasoning text; in room-safe mode the gifter's name is replaced (their mood still shows).
  function text(x) {
    const gm = st.moods[x.g.id], rm = st.moods[x.r.id];
    const G = { n: st.safe ? 'their gifter' : x.g.name, N: st.safe ? 'Their gifter' : x.g.name, m: gm, b: bucket(gm) }, R = { n: x.r.name, N: x.r.name, m: rm, b: bucket(rm) };
    return TPL[x.tpl](G, R, x.k);
  }
  function setupScreen() {
    const host = C.mode === 'host';
    C.stage('<div class="card"><div class="kicker">Organizer · Step 1</div><h2>Names + one-line mood</h2><div class="pgrid">' + C.players.map((p, i) => '<div class="pcell">' + C.chip(p) + (host ? '<input data-m="' + p.id + '" value="' + C.esc(st.moods[p.id]) + '">' : '<span>“' + C.esc(st.moods[p.id]) + '”</span>') + '<small class="muted">mood bucket: ' + bucket(st.moods[p.id]) + '</small></div>').join('') + '</div></div>' +
      '<div class="card"><h3>Constraints</h3><label class="row"><input type="checkbox" style="width:auto;min-height:0" id="nm" ' + (st.noMutual ? 'checked' : '') + '> No mutual pairs (A→B and B→A)</label>' +
      '<p><b>Never pair (gifter → giftee):</b> ' + (st.excl.length ? st.excl.map(([a, b]) => C.chip(a) + '→' + C.chip(b)).join(' ') : '<span class="muted">none</span>') + '</p>' +
      (host ? '<div class="row"><select id="exA">' + C.players.map((p, i) => '<option value="' + i + '">' + C.esc(p.name) + '</option>').join('') + '</select><span>→</span><select id="exB">' + C.players.map((p, i) => '<option value="' + i + '"' + (i === 1 ? ' selected' : '') + '>' + C.esc(p.name) + '</option>').join('') + '</select><button class="btn ghost" data-act="addEx">+ Add exclusion</button></div>' : '') +
      (host ? '<div class="cta"><button class="btn big pink" data-act="pair">🎲 Pair everyone</button></div>' : '') + '</div>');
  }
  function revealScreen() {
    C.stage('<div class="card"><div class="spread"><div><div class="kicker">Pairings · draw #' + st.draws + '</div><h2>The algorithm has spoken</h2></div>' +
      '<label class="row"><input type="checkbox" style="width:auto;min-height:0" data-act="safe" ' + (st.safe ? 'checked' : '') + '> 🙈 Room-safe mode (hide gifters)</label></div>' +
      '<div class="pairs">' + st.lines.map((x, i) => '<div class="pair ' + (i < st.shown ? 'open' : '') + '">' + (i < st.shown ?
        '<div class="row">' + (st.safe ? '<span class="pchip"><span class="pe">🎁</span>Secret gifter</span>' : C.chip(x.g)) + ' → ' + C.chip(x.r) + '</div><p>' + C.esc(text(x)) + '</p>' : '<div class="back">🎁 #' + (i + 1) + '</div>') + '</div>').join('') + '</div>' +
      (C.mode === 'host' ? '<div class="cta">' + (st.shown < 7 ? '<button class="btn big" data-act="flip">Flip next card</button><button class="btn ghost" data-act="flipAll">Flip all</button>' : '') + '<button class="btn ghost" data-act="redraw">🔁 Re-draw</button><button class="btn ghost" data-act="back">← Edit moods / constraints</button><button class="btn" data-act="end">🏁 Finish</button></div>' : '') + '</div>');
  }
  const summary = () => st && st.lines.length ? (st.safe = false, '') + '<div class="card"><h2>🎁 Final pairings (organizer view: keep secret!)</h2><table class="rtable">' + st.lines.map(x => '<tr><td>' + C.chip(x.g) + '</td><td>→</td><td>' + C.chip(x.r) + '</td><td><small>' + C.esc(text(x)) + '</small></td></tr>').join('') + '</table></div>' : '';

  const acts = {
    addEx() { const a = +C.$('#exA').value, b = +C.$('#exB').value; if (a !== b) st.excl.push([a, b]); readSetup(); setupScreen(); },
    pair() { readSetup(); C.phase('Pairing reveal', 300); pair(); revealScreen(); },
    flip() { st.shown++; C.log(st.lines[st.shown - 1].r, ' got their match: ' + text(st.lines[st.shown - 1]), 'say'); revealScreen(); },
    flipAll() { st.shown = 7; revealScreen(); },
    safe() { st.safe = !st.safe; revealScreen(); },
    redraw() { C.phase('Re-draw', 90); pair(); revealScreen(); },
    back() { C.phase('Setup: names, moods, constraints', 180); setupScreen(); },
    end() { C.finish(summary()); },
  };
  function readSetup() { C.$$('[data-m]').forEach(i => st.moods[i.dataset.m] = i.value.trim() || st.moods[i.dataset.m]); const nm = C.$('#nm'); if (nm) st.noMutual = nm.checked; }

  async function simulate() {
    st = fresh();
    C.phase('Setup: names, moods, constraints', 180); setupScreen();
    await C.sys('Organizer asks the room: “one line, how are you feeling this week?”', 20);
    for (const p of C.players) await C.say(p, st.moods[p.id], C.rand(8, 14));
    await C.say('dev', 'Is “fine. totally fine.” a valid mood?', 6); await C.sys('Organizer: “It is now.”', 6);
    C.phase('Pairing reveal', 300); pair(); revealScreen(); await C.sys('Pairing… derangement found (no self-pairs, no mutual pairs)', 6);
    for (let i = 0; i < 7; i++) {
      st.shown = i + 1; revealScreen();
      await C.sys('Card ' + (i + 1) + ' read aloud: ' + text(st.lines[i]), 12);
      await C.say(C.pick(C.players), C.pick(['A complete emotional breakfast 😂', 'The hamster is never wrong.', 'Wait, who is my gifter??', 'This is weirdly accurate.', 'I feel profiled. Lovingly.']), 8);
    }
    C.phase('Re-draw', 90);
    await C.say('priya', 'Small thing: Omar and I already swap gifts at our book club. Can we exclude that?', 10);
    st.excl.push([2, 6], [6, 2]); await C.sys('Organizer adds exclusions Priya ↔ Omar and re-draws', 8);
    pair(); revealScreen(); await C.wait(3); st.shown = 7; revealScreen(); await C.sys('All 7 re-drawn cards flipped at once (faster)', 20);
    await C.say('zoe', 'The re-draw reasons are even better.', 8);
    C.phase('Wrap', 60); await C.sys('Organizer DMs each gifter privately', 30);
  }

  C.css('.pairs{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:12px;margin-top:12px}.pair{border:2px solid var(--line);border-radius:16px;padding:14px;min-height:130px}.pair.open{border-color:var(--accent);animation:pop .4s}.pair .back{display:grid;place-items:center;height:100px;font-size:1.6rem;font-weight:900;color:var(--muted);background:repeating-linear-gradient(45deg,var(--card2),var(--card2) 10px,var(--card) 10px,var(--card) 20px);border-radius:12px}');

  C.game({
    num: '09', title: 'Emotion-aware AI Secret Santa', emoji: '🎅', target: 600,
    tagline: 'The <i>organizer</i> side of Secret Santa. Enter 7 names and a one-line mood each; the app pairs gifters to giftees (no self-pairs, no mutual pairs, your exclusions) and writes a funny “emotional reasoning” line for each pair.',
    how: '<ol class="tight"><li>Names + one-line mood each</li><li>Constraints: no self, no mutual, exclusions</li><li>Pair → flip reveal cards with reasoning</li><li>Re-draw if needed</li></ol><p class="muted">Timed against a <b>10-minute</b> slot, not 30: this is a module, not a session.</p>',
    plan: [{ name: 'Setup: names, moods, constraints', sec: 180 }, { name: 'Pairing reveal', sec: 300 }, { name: 'Re-draw', sec: 90 }, { name: 'Wrap', sec: 60 }],
    evaluating: ['Is the pairing-reasoning comedy worth a standalone moment, or is this just a utility?'],
    notes: '<p><b>Verdict: a utility with one good 5-minute moment. Not a standalone session.</b></p>' +
      '<h4>The comedy</h4><ul class="tight"><li>The “mood check-in” is the most valuable part: one line from each person (“fine. totally fine.”) is a gentle, real check-in for a new team.</li><li>The reasoning cards get laughs for about 4 cards, then the templates show. Use 3–4 templates per session at most, or have a real LLM write them.</li></ul>' +
      '<h4>A real design problem</h4><p>Publicly revealing pairings defeats “secret” Santa. This prototype defaults to <b>🙈 room-safe mode</b>: the room sees recipients and reasons, gifters stay hidden, and the organizer DMs gifters privately. Mutual pairs are off by default so nobody can deduce their gifter.</p>' +
      '<h4>How to use it</h4><p>As a 5–8 min opener <b>before</b> #2 or #4 (the ceremonies), not as its own event.</p>' +
      '<div class="risk"><b>Facilitator risk note:</b> low, as long as moods are voluntary and light. Don’t display a mood that someone typed privately.</div>',
    host() { st = fresh(); C.phase('Setup: names, moods, constraints', 180); setupScreen(); },
    simulate, summary, acts,
  });
})();
