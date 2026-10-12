// TITLE: 07 · Copilot or Human? (Real or AI clips)
(function () {
  const C = Core;
  // Free-source deck. Real media is public domain or freely licensed on Wikimedia Commons, loaded by file name.
  // AI images are generated live (FLUX via Pollinations) in the style of the real ones, to make them harder.
  // `seen` describes the shot without giving the answer away (shown only if the media can't load).
  const FILEPATH = 'https://commons.wikimedia.org/wiki/Special:FilePath/';
  const FILEPAGE = 'https://commons.wikimedia.org/wiki/File:';
  const DECK = [
    { type: 'movie', media: 'image', file: 'Le Voyage dans la lune.jpg', seen: 'A rocket stuck in the eye of a man-in-the-moon face. Black and white, painted sets.', src: 'A Trip to the Moon, Georges Méliès (1902)', lic: 'Public domain' },
    { type: 'movie', media: 'image', file: 'Sallie Gardner at a Gallop.gif', seen: 'A jockey on a galloping horse, flickering in silhouette against a lined backdrop.', src: 'Sallie Gardner at a Gallop, Eadweard Muybridge (1878), one of the first moving pictures', lic: 'Public domain' },
    { type: 'movie', media: 'image', file: 'Roundhay Garden Scene.gif', seen: 'A few people in Victorian clothes walking in circles on a garden lawn, very grainy.', src: 'Roundhay Garden Scene, Louis Le Prince (1888), the oldest surviving film', lic: 'Public domain' },
    { type: 'vlog', media: 'video', file: 'Alaskan Huskies - Sled Dogs - Ivalo 2013.ogv', seen: 'Handheld footage of sled dogs in the snow, barking and waiting to run.', src: 'Home video, Ivalo, Finland (2013)', lic: 'Freely licensed, own work by a Commons user (credit on the file page)' },
    { type: 'vlog', media: 'video', file: '02-Grey Squirrel 2021-09-13 nX2.webm', seen: 'A grey squirrel in a garden, filmed close up on a sunny day.', src: 'Home video of a grey squirrel (2021)', lic: 'Freely licensed, own work by a Commons user (credit on the file page)' },
    { type: 'aivideo', media: 'video', file: 'Gen2-Example-Dog-Podium.webm', seen: 'A dog standing on a podium, the camera slowly moving.', src: 'Made with Runway Gen-2 (text-to-video AI)', lic: 'See file page' },
    { type: 'aivideo', media: 'video', file: 'Generative ai - electronic head moving Dec 2023.webm', seen: 'A glossy electronic head turning slowly, with soft studio light.', src: 'AI-generated video (December 2023)', lic: 'See file page' },
    { type: 'aivideo', media: 'video', file: 'Gen-1 IMG 9350 - Watercolor painting, scenic landscape, soft.webm', seen: 'A moving landscape that looks like a watercolor painting.', src: 'Real phone footage restyled by Runway Gen-1 (video-to-video AI). Tricky: it started real!', lic: 'See file page' },
    { type: 'aiimage', media: 'ai', prompt: '1902 silent film still, astronomers in top hats and long robes gathered around a brass rocket, painted theater backdrop, black and white, heavy film grain and scratches', seen: 'Astronomers in top hats gathered around a brass rocket. Black and white, scratched film.', src: 'Generated live by FLUX, prompted to imitate a 1902 film still' },
    { type: 'aiimage', media: 'ai', prompt: 'candid smartphone photo of husky sled dogs resting in deep snow in Lapland, slightly blurry, overcast light, unedited', seen: 'Husky sled dogs resting in deep snow, slightly blurry phone photo.', src: 'Generated live by FLUX, prompted to imitate a phone photo' },
    { type: 'aiimage', media: 'ai', prompt: '1888 early film frame, Victorian family walking on a garden lawn, faded sepia, extremely grainy, motion blur, vignette', seen: 'A Victorian family walking on a lawn, faded sepia and very grainy.', src: 'Generated live by FLUX, prompted to imitate the 1888 Roundhay film' },
  ];
  const TYPES = { movie: ['🎬', 'Real movie scene', 'real'], vlog: ['📱', 'Real home video', 'real'], aiimage: ['🖼', 'AI image', 'ai'], aivideo: ['🎞', 'AI video', 'ai'] };
  // How often each persona tells real from AI correctly, and how likely they then name the exact type.
  const SKILL = { maya: .5, dev: .7, priya: .58, leo: .75, sam: .72, zoe: .55, omar: .62 };
  const HARD = { movie: -.1, vlog: .12, aiimage: -.15, aivideo: .1 };
  const ROUNDS = 10;

  let st;
  const fresh = () => ({ deck: [], i: 0, board: null, score: {}, hist: [] });
  function deal() {
    for (let t = 0; t < 200; t++) {
      const d = C.sample(DECK, ROUNDS);
      if (Object.keys(TYPES).every(k => d.filter(x => x.type === k).length >= 2)) return d;
    }
    return C.sample(DECK, ROUNDS);
  }
  const url = r => r.media === 'ai' ? C.imgUrl(r.prompt, 'image') : FILEPATH + encodeURIComponent(r.file.replace(/ /g, '_'));
  const lb = () => '<table class="rtable">' + C.players.slice().sort((a, b) => (st.score[b.id] || 0) - (st.score[a.id] || 0)).map((p, i) => '<tr><td>' + (i + 1) + '</td><td>' + C.chip(p) + '</td><td class="n"><b>' + (st.score[p.id] || 0) + '</b></td></tr>').join('') + '</table>';

  function mediaHtml(r) {
    const u = C.esc(url(r));
    return '<div class="clipbox" id="clipbox">' + (r.media === 'video' ? '<video class="clip" src="' + u + '" muted autoplay loop playsinline preload="auto"></video>' : '<img class="clip" src="' + u + '" alt="">') +
      '<div class="fallback">📼 This clip couldn’t load here (offline, an unsupported format, or a viewer that blocks outside media). Read the description out loud instead:<p class="big-text">' + C.esc(r.seen) + '</p></div></div>';
  }
  // Show the description if the media errors or hasn't loaded after 12 seconds.
  function watchMedia() {
    const box = document.getElementById('clipbox'); if (!box) return;
    const el = box.querySelector('.clip'), fail = () => box.classList.add('fail');
    el.addEventListener('error', fail);
    setTimeout(() => { const ok = el.tagName === 'IMG' ? el.complete && el.naturalWidth > 0 : el.readyState >= 2; if (!ok) fail(); }, 12000);
  }
  function roundScreen(reveal) {
    const r = st.deck[st.i], t = TYPES[r.type];
    if (!reveal) st.board = new C.VoteBoard({ title: 'Real or AI?', options: Object.entries(TYPES).map(([k, v]) => ({ id: k, label: v[1], emoji: v[0] })) });
    C.stage('<div class="cols clipcols"><div class="card"><div class="kicker">Clip ' + (st.i + 1) + ' of ' + ROUNDS + '</div>' + mediaHtml(r) +
      (reveal ? '<div class="answer ' + t[2] + '"><span class="big-text">' + t[0] + ' ' + t[1] + '</span><p>' + C.esc(r.src) + '</p>' +
        (r.file ? '<p><small>' + C.esc(r.lic) + ' · <a href="' + C.esc(FILEPAGE + r.file.replace(/ /g, '_')) + '" target="_blank" rel="noopener">source on Wikimedia Commons ↗</a></small></p>' : '') + '</div>' : '') + '</div>' +
      '<div class="card"><p class="muted">+1 for real vs. AI, +1 more for the exact type.</p>' + st.board.html() +
      (C.mode === 'host' ? '<div class="cta">' + (reveal ? '<button class="btn big" data-act="next">' + (st.i < ROUNDS - 1 ? 'Next clip →' : '🏆 Final scores') + '</button>' : '<button class="btn big pink" data-act="reveal">Reveal →</button>') + '</div>' : '') +
      '<h3>Scoreboard</h3>' + lb() + '</div></div>');
    watchMedia();
  }
  function score() {
    const r = st.deck[st.i], side = TYPES[r.type][2];
    let right = 0;
    Object.entries(st.board.votes.main).forEach(([v, o]) => {
      if (TYPES[o][2] === side) { st.score[v] = (st.score[v] || 0) + 1; right++; }
      if (o === r.type) st.score[v] = (st.score[v] || 0) + 1;
    });
    st.hist.push({ r, pct: right / 7 });
  }
  function summary() {
    if (!st.hist.length) return '';
    const hard = st.hist.slice().sort((a, b) => a.pct - b.pct)[0], t = TYPES[hard.r.type];
    return '<div class="card"><h2>🏆 Final scores</h2>' + lb() + '<p><b>Most convincing clip:</b> only ' + Math.round(hard.pct * 100) + '% got real vs. AI right on “' + C.esc(hard.r.seen) + '” (it was ' + t[0] + ' ' + t[1].toLowerCase() + ').</p></div>';
  }

  const acts = {
    start() { st.i = 0; C.phase('Clip rounds', 720); C.timer('Vote', 25); roundScreen(false); },
    reveal() { C.clearTimer(); score(); roundScreen(true); },
    next() { if (st.i < ROUNDS - 1) { st.i++; C.timer('Vote', 25); roundScreen(false); } else { C.phase('Final scores', 60); C.stage(summary() + '<button class="btn big" data-act="end">🏁 Finish & pacing report</button>'); } },
    end() { C.finish(summary()); },
  };

  async function simulate() {
    st = fresh(); st.deck = deal();
    C.phase('Intro', 60); C.stage('<div class="card"><h2>🎬 or 🤖?</h2>' + C.script('Ten clips and stills. Some are real (old films, home videos), some were made by AI. Vote for what you think it is. You get a point for real vs. AI, and a bonus for the exact type.') + '</div>');
    await C.sys('Facilitator explains', 40); await C.say('dev', 'Old films are easy. They look old.', 8); await C.say('zoe', 'Unless the AI makes them look old.', 6);
    C.phase('Clip rounds', 720);
    for (let i = 0; i < ROUNDS; i++) {
      st.i = i; const r = st.deck[i], side = TYPES[r.type][2]; C.timer('Vote', 25); roundScreen(false);
      await C.sys(r.media === 'video' ? 'Clip plays on loop (5–20s)' : 'Image on screen, everyone leans in', 10);
      if (C.chance(.65)) await C.say(C.pick(C.players), C.pick(['Look at the hands. Always look at the hands.', 'The grain looks too perfect.', 'That motion is weird, right?', 'No AI would make something this boring. Real.', 'I genuinely can’t tell.', 'The shadows are wrong. AI.']), 6);
      await C.simVotes(st.board, v => {
        const okSide = C.chance(SKILL[v.id] + HARD[r.type]);
        const pool = Object.keys(TYPES).filter(k => (TYPES[k][2] === side) === okSide);
        return okSide && C.chance(.7) ? r.type : C.pick(pool);
      }, { gap: 2, straggler: 4 });
      C.clearTimer(); score(); roundScreen(true); await C.wait(4);
      const pct = st.hist[st.hist.length - 1].pct;
      await C.sys(pct < .5 ? 'Gasps: “NO WAY that’s ' + (side === 'ai' ? 'AI' : 'real') + '!”' : 'Mostly right. Some smugness.', 6);
      await C.say(C.pick(C.players), C.pick(['What gave it away for you?', 'Okay the watercolor one is cheating.', 'I’m never trusting a video again.', 'I was so sure.']), 8);
      await C.sys('Quick “what gave it away?” chat', C.rand(12, 22));
    }
    C.phase('Final scores', 60); C.stage(summary()); await C.sys('Winner crowned 👑', 30);
  }

  C.css('.clipbox{position:relative;border-radius:14px;overflow:hidden;background:#000;margin-top:10px;min-height:220px;display:grid;place-items:center}.clip{display:block;width:100%;max-height:60vh;object-fit:contain}.fallback{display:none;padding:18px;color:var(--ink);background:var(--card2);width:100%}.clipbox.fail{background:var(--card2)}.clipbox.fail .clip{display:none}.clipbox.fail .fallback{display:block}' +
    '.answer{margin-top:12px;padding:12px 14px;border-radius:14px;border:3px solid var(--good);animation:pop .4s}.answer.ai{border-color:var(--accent2)}.answer p{margin:.3em 0}.clipcols{grid-template-columns:repeat(auto-fit,minmax(300px,1fr))}');

  C.game({
    num: '07', title: 'Copilot or Human? Clips', emoji: '🤖',
    tagline: 'A 10-round quiz with real pictures and video. Each round shows a clip or still: a real old movie scene, a real home video, an AI-generated video, or an AI image made to imitate the real ones. Vote for what you think it is.',
    how: '<ol class="tight"><li>Clip or still plays on loop</li><li>25 seconds: vote 🎬 real movie, 📱 real home video, 🖼 AI image or 🎞 AI video</li><li>Reveal with the source</li><li>+1 for real vs. AI, +1 bonus for the exact type</li><li>10 rounds, at least 2 of each type</li></ol><p class="muted">Real media: public domain or freely licensed files on Wikimedia Commons. AI images are generated live. Media loads when you open the downloaded file in a browser. The claude.ai preview blocks it and shows descriptions instead.</p>',
    plan: [{ name: 'Intro', sec: 60 }, { name: 'Clip rounds', sec: 720 }, { name: 'Final scores', sec: 60 }],
    evaluating: ['Is spotting real vs. AI media more fun than the quote quiz?', 'Pacing for 10 clip rounds?', 'Does “what gave it away?” spark conversation?'],
    notes: '<p><b>Verdict: a much better game than the quote version.</b> Pictures give everyone something to point at (“look at the hands”), and “what gave it away?” turns into a real conversation about how we read AI. 10 rounds take about 12–14 min.</p>' +
      '<h4>What makes a good clip</h4><ul class="tight"><li>AI images made to <b>imitate</b> a real clip (a grainy 1888 garden, a blurry phone photo) are the hardest and the most fun.</li><li>Borderline cases spark the best debates, like real footage restyled by AI (the watercolor clip).</li><li>Very old films are a bit easy: they look “too old to be AI”. Modern home video is harder.</li></ul>' +
      '<h4>Known limits</h4><ul class="tight"><li>The real clips come from Wikimedia Commons file names, which I couldn’t test from where I built this. If one doesn’t load, the round shows a written description instead, and the game still works.</li><li>Safari can’t play .ogv files (the sled-dog clip). Use Chrome for the full deck.</li><li>For modern movie scenes, pick clips yourself and swap them into the deck at the top of the game’s source.</li></ul>' +
      '<div class="risk"><b>Facilitator risk note:</b> very low. Nobody shares anything personal, and being fooled is the fun part.</div>',
    host() {
      st = fresh(); st.deck = deal(); C.phase('Intro', 60);
      C.stage('<div class="card"><h2>🎬 or 🤖?</h2>' + C.script('Ten clips and stills. Some are real (old films, home videos), some were made by AI. Vote for what you think it is. You get a point for real vs. AI, and a bonus for the exact type.') + '<button class="btn big" data-act="start">First clip →</button></div>');
    },
    simulate, summary, acts,
  });
})();
