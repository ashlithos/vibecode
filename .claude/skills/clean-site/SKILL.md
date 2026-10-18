---
name: clean-site
description: Make a personal website, portfolio or landing page look clean and hold up at every screen size. Use when designing, simplifying or reviewing a site's typography, color, spacing, grid or responsive layout; when someone says a site looks "busy", "cluttered", "not clean" or "broken on desktop/phone"; when comparing a site against a reference site; or before shipping visual changes. Includes an audit script that screenshots every page at six widths and inventories fonts, sizes and colors.
---

# Clean site

A clean site is a small system applied without exceptions: few fonts, few colors, one grid,
a short spacing scale, and work shown early. This skill audits a site against that system,
helps the owner choose the system, applies it, and proves the result with before/after screenshots.

Read `references/principles.md` before proposing changes. It is the rulebook; this file is the workflow.

## Workflow

### 1. Audit (measure before opinions)

Run the audit script from the project folder against a running build:

```bash
node <skill-dir>/scripts/audit.mjs --url http://localhost:3000 \
  --paths /,/about --widths 1920,1440,1280,1024,820,390 --out ./audit
```

It saves full-page screenshots and prints: sideways scroll, where the first piece of work lands
(`--fold` selector, default `main h2`), footers floating on tall screens, and the inventory of font
families, size/weight combos and text colors. Fluid (`clamp`) sizes show up as several values across
widths; judge counts at a single width.

Then look at the screenshots yourself. Scripts catch overflow; only eyes catch an empty box that
reads as broken, a summary drifting away from its title, or a first screen with no work on it.

If the owner names a reference site, run the same script on it (`HTTPS_PROXY` may be needed) and
measure the reference's container width, side gutters per width, columns, and type sizes. Copy its
system, not its look.

### 2. Let the owner choose the system

Don't decide taste for them. Build a specimen page (an Artifact works well) that renders every font,
size and color currently in use, at real size, labeled with where it appears, with keep / drop /
unsure buttons and a "copy my choices" summary. Then resolve contradictions in their picks with
specific questions (e.g. "you dropped the serif size but kept the highlighter on that word").

### 3. Apply

- Put every value in tokens at the top of the global stylesheet: colors, font families, the type
  scale, spacing, container width, gutters. Delete tokens that are no longer used.
- Replace one-offs with tokens; never add a new value to fix one spot.
- Fix layout bugs at the breakpoint where the content breaks, not at a device size.
- Check the edge cases: buttons don't inherit fonts by default (`button { font-family: inherit }`),
  empty states, the longest real string in each component, very short pages on tall screens.

### 4. Prove it

Re-run the audit at the same widths. Show before/after pairs at the same screen size, each with the
principle and the concrete change, plus a few numbers (e.g. "first project: 1,180px → 624px from the
top on a 1440×900 laptop"). Ship to a preview first; the owner approves before it goes live.

## Defaults when the owner has no preference

- One sans for everything; optionally one display/serif face for one or two signature moments.
- Text colors: one ink, one grey. Backgrounds: white plus at most one accent.
- Type scale on a page: 4–5 sizes (e.g. 60 / 32 / 25 / 15 / 13).
- Spacing scale: 8 · 16 · 24 · 40 · 64 · 96 (largest steps may grow fluidly on big screens).
- Container max ~1080–1440px (wider when the work is dense UI); side gutters ~60 / 40 / 20px for
  desktop / tablet / phone. Text keeps its own `ch` max-width.
- Running text 45–75 characters per line.
- Motion in case studies: muted, looping, autoplaying MP4 (not GIF), cropped to one interaction;
  for the camera, easing and editing, use the `product-video` skill.
