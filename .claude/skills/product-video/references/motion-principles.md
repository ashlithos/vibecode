# Motion principles for product videos

Learned while cutting the portfolio videos for ashlidesigns.com (Oct 2026), with Ashley's feedback
at each step. These are the rules; SKILL.md is the workflow.

## 1. The feel: decisive but soft

- **Camera moves use Material 3's emphasized curve, `cubic-bezier(0.2, 0, 0, 1)`.** Brisk start,
  long gentle settle ("quick to slow"). It reads as intentional without a jolt.
- **Give big moves time.** Material pairs emphasized with ~500ms for UI elements; a camera crossing
  the whole frame needs more: **~0.8s for a big zoom, ~0.9s for a glide.** 0.35s felt harsh.
- **Things that arrive decelerate.** Fades in (the spotlight) use emphasized decelerate,
  `(0.05, 0.7, 0.1, 1)`, ~0.45s. Things that leave use emphasized accelerate `(0.3, 0, 0.8, 0.15)`.
- **Zoom in log space**, about the point both framings share. Equal steps of scale look like they
  speed up as you zoom in; equal steps of log(scale) feel even (Mapbox fixed their camera this way).
- **Between moves the camera is still.** No slow drifting push-ins: they read as "AI". No linear or
  sine moves, no whip zooms, no hard snaps or hard cuts.

## 2. Timing: land before the action

- **Find the exact frame the key UI change happens** (`scripts/beats.py`) and finish the move just
  before it, so the camera is at rest when the new thing appears. A click and its result can be 30ms
  apart: if the hero is the result, leave the wide shot before the click.
- **Hold the payoff** long enough to read: ~0.6s on a hero detail, 3–5s on a menu or list.

## 3. Story: three beats, dead time cut

- **Trigger → hero → system.** Wide on what the user does (shows it's a real product), close on the
  moment that proves the feature, then the structure around it.
- **Cut dead time** (cursor travel, idle hovering, a stray tooltip). Join takes with a short eased
  dissolve (~0.4s), never a hard cut.
- **End by easing back to the opening framing** so the loop restarts invisibly.
- Aim for 8–14s. Shorter beats longer.

## 4. Pointing at a detail

- **Fade the rest of the frame back** (white at ~60%, eased in) instead of zooming harder. UI at the
  bottom edge can't be centered by the camera; the spotlight still makes it the obvious subject.

## 5. Fidelity

- **Never crop into the app.** If the recording has black rounded window corners, paint just those
  corner pixels white (`clean_corners`) and let the site's rounded frame do the rest. Cropping the
  bottom 10px hid the very tab bar the video was about.
- **Export 1600px wide, H.264 CRF 20, 30fps, no audio, `+faststart`.** On a Retina laptop a clip at
  ~740 CSS px is ~1480 real pixels; 1000px exports look soft. Under ~2 MB.
- **Record at full Retina resolution** (2× the CSS size) so zoomed-in shots stay sharp. A 1x
  recording zoomed 2.4× is readable but soft.
- **Keep the originals** in the repo (not served) with the spec that renders them.

## 6. Poster

- The poster (still before play) is the **hero frame**, spotlight included, as WebP quality 85. A
  recruiter who never presses play still sees the feature.

## What Ashley rejected, and why (taste notes)

| Tried | Feedback | Fix |
|---|---|---|
| Captions under clips | "the summary carries the story" | No captions |
| Zoomed in while the banner showed | wanted the whole screen while the banner is up | Wide until the click |
| Cropped bottom edge | "I can't see the full bottom app groups" | Paint corners, never crop |
| One long camera ride, 15s | motion sickness | Three beats, dead time cut |
| Slow drifting push-in | "looks very AI" | Still between moves |
| 0.35s snap zoom, hard cut | "too harsh" | Emphasized curve, 0.8s; eased dissolve |
| Emphasized 0.8s zoom, eased glide, ease back to wide | "I like it" | Keep this as the default |
