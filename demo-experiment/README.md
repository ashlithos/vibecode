# Demo experiment: Data UX intro variants

A reusable 7-second intro for the **Data UX** design team, played before every team demo. There are seven variants, one
per motion style, built from the original [mg-styles-15](https://github.com/Vincentwei1021/mg-styles-15) prompts. Each
prompt's *Signature features* and shared parts are kept exactly; only *Output* and *Creative seed* were replaced (theme:
**data made human**).

**Open `out/data-ux-intro/index.html`** to see all seven in a grid and click any of them to play it with sound.

| # | Style (original prompt) | Creative seed | File |
|---|---|---|---|
| 01 | Cel animation / line boil (`prompts/05-cel-boil.md`) | A hand-drawn cursor sketches a wobbly bar chart; the bars boil and grow one by one; the chart's pieces leap and redraw into hand-lettered "Data UX" (y-axis → D, bars → a t a U X, baseline → underline) | `out/data-ux-intro/01-cel-boil.mp4` |
| 02 | Line art (`prompts/02-line-art.md`) | One unbroken gold line: rising line chart → table grid → circles one data point (line-to-fill) → writes "Data UX" and rests | `02-line-art.mp4` |
| 03 | Shape morph (`prompts/08-morph.md`) | One point → scatter cloud → bar chart → table rows → the rows fold into "Data UX" | `03-morph.mp4` |
| 04 | Sticker explainer (`prompts/19-paperclip.md`) | Spreadsheet cell, pie chart, magnifier, "SELECT *" bubble and a check label slap on, one per beat; the check peels back to reveal the "Data UX" sticker | `04-sticker.mp4` |
| 05 | Collage (`prompts/06-collage.md`) | Stock-table newsprint, graph paper, a ruler, a hand and an eye paste into a person reading a chart; the legend reads "Data UX" | `05-collage.mp4` |
| 06 | Bauhaus (`prompts/09-bauhaus.md`) | Circles → scatter plot, squares → bars, triangle → trend arrow, on a 120 px grid in beats; every shape rotates into geometric "DATA UX" | `06-bauhaus.mp4` |
| 07 | Synthwave (`prompts/10-synthwave.md`) | Neon grid horizon = 3D data surface with rolling peaks; striped pie-chart sun; chrome "DATA UX" rises with a VHS tracking glitch | `07-synthwave.mp4` |

## Shared rules (all variants)
- 1920×1080, 30 fps, exactly 7.000 s; −14 LUFS, true peak ≤ −1 dBTP.
- The only text is "Data UX" ("DATA UX" for Bauhaus/Synthwave). Exceptions requested by the seeds: "SELECT *" in 04 and
  stock-table digits in 05.
- "Data UX" **resolves on frame 120 (4.000 s)** and holds nearly still to 7 s, so a live demo can cut in cleanly.
- **Sonic logo**: D4 → A4 → E5 (root, fifth, ninth) at 3.50 / 3.75 / 4.00 s, re-orchestrated per style (`shared/sonic.py`).
  The landing is the one big accent; no stock risers and no four-on-the-floor; SFX only on visible actions; digital silence from 6.8 s.
  See each film's `audio_notes.md`.
- Fonts are OFL; images are CC0 / public domain / own work (`CREDITS.md`).

## Layout
```
films/<nn-style>/index.html    the picture: window.renderAt(t) draws any frame (deterministic, seeded)
films/<nn-style>/cues.json     the cue sheet both picture and sound read
films/<nn-style>/audio.py      the soundtrack (mgaudio) → out/audio.wav
films/<nn-style>/audio_notes.md
shared/lib.js · shared/sonic.py · shared/tex/   shared helpers, the sonic-logo module, paper + grain
fonts/                          OFL fonts (static instances, Latin subset) + licences
tools/                          setup, render helpers, contact sheets, spec check
out/data-ux-intro/              final MP4s, posters, gallery (index.html); v1/ = first renders before the revision
REVIEW.md                       rubric review of v1 and what v2 changed
```

## Rebuild
```bash
tools/setup.sh                       # clones mg-styles-15 next to this repo, npm/pip installs, links this folder in as /dux
source tools/env.sh                  # MG_CHROME / GPU flags (defaults suit a headless Linux box)
python3 films/05-collage/prep.py     # (only if you change the collage scraps)
node tools/dump.mjs 02-line-art      # pen-tip speed for the line-art pen whisper
python3 films/01-cel-boil/audio.py   # → films/01-cel-boil/out/audio.wav
render 01-cel-boil                   # harness/render.mjs → films/01-cel-boil/out/video.mp4 (muxes the audio)
stills 01-cel-boil 1,2,4 0.5         # quick half-res stills
```
