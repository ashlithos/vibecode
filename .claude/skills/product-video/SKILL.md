---
name: product-video
description: Turn a raw screen recording into a short, looping portfolio or product video with smooth, intentional camera motion (eased zooms and glides, a spotlight on the key detail, dead time cut, seamless loop). Use when someone shares a screen recording (.mp4/.mov) for a portfolio, case study, landing page or launch; asks to zoom in/out, highlight a feature, follow the cursor, or make a recording "clearer", "smoother", "less AI", "less harsh"; or asks how a product video should move. Includes a frame-accurate renderer driven by a JSON shot list, a beat finder and a contact-sheet tool.
---

# Product video

A good product video is a small film: three beats, a still camera that moves only with purpose, and
moves that start briskly and settle softly. Read `references/motion-principles.md` before cutting:
it holds the rules and the owner's taste notes. This file is the workflow.

## Workflow

### 1. Read the recording

```bash
ffprobe -v error -show_entries stream=width,height,r_frame_rate,duration -of compact rec.mp4
bash scripts/sheet.sh rec.mp4 /tmp/sheet.png 0 16 2 4     # every 0.5s, timestamped
```

Look at the sheets (and full-size frames of key moments) and write down: what the user does, the
**hero moment** (the frame that proves the feature; ask the owner if unsure), where things are in
source pixels, and any dead time, stray tooltips or black window corners.

### 2. Find the beats to the frame

```bash
python3 scripts/beats.py rec.mp4 4.6 1.4 banner=300,76 newtab=1030,1119 toast=760,1062
```

Watch a pixel that changes when each UI event happens. Moves must land just *before* the hero
change; a click and its result can be 30ms apart.

### 3. Write the shot list

Copy `examples/personal-tabs.json`. Name framings as `[zoom, center_x, center_y]` (WIDE is
`[1, w/2, h/2]`), then one take per beat:

- take 1: `start`/`dur` around the trigger, `frame: WIDE`, a `move` to the hero framing that ends
  ~0.1s before the hero change (`emphasized`, 0.8s), a `spotlight` box over everything except the
  hero (output pixels, `decelerate`, alpha 0.6), `hold` ~0.6s;
- take 2: jump past dead time, start at the hero framing, glide (`emphasized`, 0.9s) to the system
  view as it appears, hold while it's read, then a final move back to WIDE so the loop is seamless
  (`length` longer than `dur` keeps the last frame);
- `dissolve: 0.4`, `clean_corners: 12` if the recording has black rounded corners, `size`
  1600×(aspect), `crf` 20.

### 4. Render and review

```bash
python3 scripts/edit.py spec.json                          # ~40s for 12s of 1600px video
bash scripts/sheet.sh out.mp4 /tmp/review.png 2.4 1.2 10 4 # check a move at 10fps
ffmpeg -ss 4.3 -i out.mp4 -frames:v 1 -c:v libwebp -quality 85 poster.webp   # hero frame
```

Check: the move settles before the hero change, nothing distracting in the hero hold, the bottom
edge isn't cropped, no black corners, the last frame matches the first framing. Send the video to the
owner and iterate on their words; adjust durations before curves.

### 5. Ship it with the source

Commit the original recording (not in the served folder), the spec, and the render command next to
it, so the video can be re-cut without a re-upload.

## Defaults when the owner has no preference

- Three beats, 8–14s, ends where it began.
- Camera: `emphasized` (0.2, 0, 0, 1), 0.8s zoom / 0.9s glide, still in between.
- Spotlight: white 60%, `decelerate`, ~0.45s, starting just after the hero lands.
- Dissolve 0.4s between takes. Hold the system view 3–5s.
- 1600px wide, CRF 20, 30fps, no audio; poster = hero frame.

## Older tool

`../clean-site/scripts/camera.py` writes an ffmpeg zoompan filter (cosine easing, whole-pixel steps).
Fine for a quick single move; use `scripts/edit.py` for anything that should feel designed.
