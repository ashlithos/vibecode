# Clean site principles

Distilled from auditing ashlidesigns.com against jasonkim.me (Oct 2026) and from standard
typography and responsive-design practice. Each rule has a test you can actually run.

## 1. Typography: one voice

- **One font family does the work.** A second face (serif italic, display) is allowed only for one
  or two signature moments per page: a wordmark, a highlighted word. Jason's site: Inter only.
- **4–5 sizes per page.** Every extra size is a new level of hierarchy the reader has to decode.
  Jason's homepage uses three: 24px titles, 14px body, 12px labels.
- **Text stays the same size across screens** unless it's a hero headline. Layout adapts; type stays put.
- **Small uppercase labels are seasoning.** A page full of tracked-out mono caps reads as a dashboard.
  Prefer one quiet sentence-case meta line: "Figma · May 2025".
- **Line length 45–75 characters** (about 66 ideal; Bringhurst). Cap with `max-width` in `ch`.
- *Test:* the audit's size/weight inventory at one width has ≤ 6 entries, and ≤ 2 families.

## 2. Color: let the work be the color

- **One ink, one grey, one background, at most one accent.** Greys that differ by a few percent
  (#1a1a1a vs #141412) are noise; merge them.
- **No colored fills behind content** unless they carry meaning. The work's screenshots supply color.
- **Use the accent once or twice per page,** for the signature moment and maybe selection. If it's
  everywhere it stops meaning anything.
- *Test:* ≤ 3 text colors in the inventory.

## 3. Grid: one layout, repeated

- **Every project uses the same block:** title + meta line on the left half, description on the right
  half, media underneath, hairline divider. Repetition is what makes a page feel calm. The eye learns
  the pattern once.
- **One content column with a ceiling** (~1080–1440px). On big monitors the extra width becomes margin.
- **Wide media, narrow text.** Let screenshots and videos use the full container width, but cap running
  text with its own `max-width` in `ch`. When work looks too small, widen the container, not the lines.
- **Edges line up.** If two sections use different column splits, their left edges won't align. Pick one.
- *Test:* draw vertical lines at the left edge of each text block in a screenshot; there should be ≤ 2.

## 4. Whitespace: chosen, not left over

- **Proximity:** space inside a group must be smaller than space between groups. Title → summary
  8–24px; project → project 64–96px. This most often breaks when columns stack on phones.
- **A spacing scale** (8 · 16 · 24 · 40 · 64 · 96) instead of one-off gaps. Macro space (between
  sections) gives calm; micro space (line height, padding) gives readability.
- **No accidental space:** a footer floating mid-screen, a giant empty placeholder, a gap kept from the
  desktop layout. Fix with a page shell (`min-height: 100dvh`, main `flex: 1`) and by hiding
  containers that have nothing in them.
- *Test:* on the tallest screen, the footer touches the bottom; no box on the page is empty.

## 5. Responsive: change the frame, not the system

- **Few breakpoints, placed where content breaks.** Jason uses three (desktop / tablet / phone) and
  only the side gutters change: 60 → 40 → 20px. Add a breakpoint at the exact width something
  overflows (the audit's "scrolls sideways" line), not at "768 because iPad".
- **Fluid between breakpoints:** `clamp(min, preferred-vw, max)` for hero type, big spacing and
  components that must shrink (Utopia: define small and large, let the browser interpolate).
- **Stacking order on phones:** title → meta → description → media. Keep each group tight.
- **Check the in-between widths:** 720–980px (half a laptop screen, iPad portrait) is where fixed-width
  components break.
- *Test:* audit at 1920, 1440, 1280, 1024, 820, 390: no sideways scroll, no floating footer.

## 6. Content: show the work early

- **First screen shows real work.** On a 1440×900 laptop the first project title should start above
  900px (Jason: 346px). Keep heroes short, or put the work right under them.
- **Every project = name, "Company · Area · Date", 2–3 sentences with one outcome, one visual.**
  Long write-ups live behind a link.
- **Hide unfinished work** in production rather than showing placeholders.

## 7. Media: motion as close-ups

- **Use MP4, not GIF:** `<video autoplay muted loop playsinline>` with a poster image. Sharper and
  several times smaller than GIF.
- **Crop to one interaction.** Place an oversized recording inside a fixed card so only the relevant
  part of the UI shows, like a film close-up. 7–14 second loops.
- **Readable beats symmetrical.** Half-width clips work only with the zoom camera below; without it,
  UI text is too small, so give each clip the full width instead.
- **Camera moves for dense UI** (the `product-video` skill has the full motion rules and renderer): start wide on the whole app so its header
  shows it's a real product, zoom ~1.8× into the action and follow it, zoom back out before looping.
- **End on the payoff and hold it ~1.5s;** use that payoff frame as the poster.
- **Cards keep their proportions** at every width; on phones, side-by-side media stacks.

## Sources

- Bringhurst's 45–75 character measure, via UXPin "Optimal line length for readability"
- Utopia fluid type and space: utopia.fyi; Tim Brown's CSS locks
- Content-based breakpoints and `clamp()`: UXPin responsive design guide
- Gestalt law of proximity; macro vs micro whitespace (Ramotion, Tilda, Mapletree)
- Reference implementation: jasonkim.me (built with Figma Sites), measured at six widths
