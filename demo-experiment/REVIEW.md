# Review → revise (one round)

Each v1 film was reviewed against `mg-styles-15/rubric.md`: a contact sheet every 0.5 s, full-resolution frames at the
key times, a spec check (ffprobe + `ebur128` loudness / true peak), and a check of where the loudest 50 ms of audio lands.
Scores use the rubric's scale (5 = competent student, 6 = template, 7 = solid professional, 8 = high-end agency) and were
set by the maker, not an independent jury, so read them as honest but not neutral. v1 renders are kept in
`out/data-ux-intro/v1/` for comparison.

## Spec check (all v1 and v2 renders)

| Check | Result |
|---|---|
| Duration / frames | 7.000 s, 210 frames, 30 fps, 1920×1080, H.264 + AAC 48 kHz stereo |
| Loudness | −14.0 ± 0.1 LUFS integrated; true peak −1.1 to −1.6 dBTP (≤ −1) |
| Title | "Data UX" fully formed on frame 120 (4.000 s); readable well before 4.5 s; near-still hold to 7 s |
| Sonic logo | D4 → A4 → E5 at 3.50 / 3.75 / 4.00 s in every film; the landing (4.0–4.3 s) holds the loudest 50 ms of every mix, 6–11 dB above the median of the pre-title bed |
| Tail | digital silence from 6.80 s (verified sample peak = 0) |
| Fonts / assets | only OFL fonts (subset to Latin, in `fonts/`), CC0 / public-domain / own-work images, see `CREDITS.md` |

## Scores and fixes

| # | Film | Style | Concept | Motion | Design/Type | Finish | Sound/Sync | Tech | v1 critical issues → v2 fix |
|---|---|---|---|---|---|---|---|---|---|
| 01 | Cel Boil | 8 | 8 | 7 | 7 | 7 | 7 | 8 | **Weak hook**: 0–0.25 s was a near-empty page with a tiny cursor → cursor enlarged 1.7× and the first ink stroke starts at 0.18 s. Pizz bass on 0.5 s was louder than the landing → bass now enters with the first bar, SFX bus −5 dB. |
| 02 | Line Art | 8 | 7 | 7 | 6 | 7 | 7 | 8 | **The script read as "Datta/UX)"** (early test): rewrote the monoline letterforms so joins run along the baseline and up-strokes retrace their own stems. **No visible hero moment on the resolve** → a warm bloom now runs along the finished title at 4.0 s; title set 10 % larger. |
| 03 | Shape Morph | 8 | 6 | 7 | 7 | 7 | 7 | 8 | Overlapping contours in Outfit's D, t and X were cut by even-odd fill (white notches) → non-zero fill with per-contour winding. **Scatter phase too brief and clustered** → cloud spread 25 % wider and the dots arrive 0.17 s sooner, so the scatter reads for ~0.3 s longer. |
| 04 | Sticker Explainer | 8 | 7 | 6 | 8 | 7 | 7 | 7 | **Whip-pans showed double images** (2 motion-blur sub-samples on very fast moves) → 6 sub-samples, shutter 0.6. **Render took 5.6 s/frame** (per-frame blur filters) → shadows pre-blurred once, dot grid as a pattern. The empty board on frame 1 → the opening sticker is already falling at t = 0. |
| 05 | Collage | 8 | 8 | 7 | 7 | 8 | 7 | 8 | The blurred portrait-crop eye didn't read as an eye → drew an engraved eye and halftoned it. **Legend too small to be the hero** → legend set 12 % larger. |
| 06 | Bauhaus | 8 | 7 | 6 | 8 | 7 | 7 | 8 | **The A's read as "Λ"** → each A gains a triangular counter (two more scatter circles feed it, so every part still comes from a data shape) and a shorter leg notch. Squares slid in from the side and read as one long bar → they drop straight down, cascading across the columns in 16ths. The 14-module axes no longer spin across the frame on the drop. |
| 07 | Synthwave | 9 | 8 | 7 | 8 | 8 | 8 | 7 | **The pie-chart sun barely read as a pie** → wider slice gaps, the 20 % slice explodes 48 px and takes a magenta tint. Hit flash washed the frame grey → halved. Title set 12 % larger. Blur filters cached (render ~4× faster). |

## What still holds them back (honest)

- **01**: the boil is noise-displacement of clean vectors, not hand-drawn variants; the smoke puffs are a bit geometric.
- **02**: one-line purists will notice the retraced strokes; the camera framing during the grid is generic.
- **03**: the bar → row → letter fold (2.9–3.3 s) is busy, and the capsule bridge between rows and letters overlaps neighbours for a few frames.
- **04**: the whip-pans are still too fast for the frame rate: even with 6 blur sub-samples a pan frame shows stepped copies of the sticker (e.g. 0.8 s). The real fix is a slower, longer camera path or a closer board layout. Also no leader-line labels or count-ups (the PaperClip signature) because the brief allows no text besides "Data UX" and "SELECT *".
- **05**: the stop-motion jitter is subtle; a real torn-paper transition into the end card would add wow.
- **06**: the quarter-turn cascade is mechanical but crowded for ~0.3 s around 3.6 s.
- **07**: the terrain is a procedural Gaussian field, not real data; the VHS tracking glitch could be more tape-like.
