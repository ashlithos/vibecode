# Mobile Web Pattern Library — learned from United's app

A dependency-free HTML/CSS/JS component set. Open `index.html` in a mobile
viewport (or a phone) to see it live. No build step — copy the CSS/markup
you need straight into any of your existing apps.

## Why the United screenshot feels so good

Six things are doing the work, and none of them are about the blue color
or the CN Tower photo. They're structural — which is exactly why they
port to any app.

1. **Urgency is the first thing you see, not the last.**
   The "1 hour" badge sits top-left on the hero image, before the flight
   number, before the route. United decided *time pressure* is the most
   important fact on the whole trip, and gave it the most prominent
   position — not buried in a subtitle. → `.trip-card__urgency`

2. **One primary action, always solid, always first.**
   "Boarding pass" is the only filled/solid button; everything else
   ("Change seats", "Check bags") is outlined. Your eye doesn't have to
   evaluate options — it's told which one matters. Outlined siblings stay
   visible but visually quieter. → `.pill-btn--primary` vs `.pill-btn--secondary`

3. **Secondary actions overflow sideways, not down.**
   Rather than stacking every action vertically (which pushes the next
   card off-screen), United scrolls them horizontally in one row. The
   card's height stays predictable, so scanning multiple trips stays fast.
   → `.trip-card__actions { overflow-x: auto }`

4. **The primary action re-appears as a floating pill when you scroll.**
   Once the card scrolls past the fold, "Boarding pass" reappears fixed
   at the bottom-right — because the *reason you opened this screen* is
   almost always "show me my boarding pass," and United refuses to make
   you scroll back up for it. → `.fab`

5. **Progressive disclosure via a chevron.**
   The route title has a `›` — a promise that there's more detail one tap
   away, without cluttering the list view with it now. Card = summary.
   Detail screen = everything else.

6. **Navigation never moves.** Top bar and bottom tab bar are both
   `position: sticky`, so the frame — where am I, what can I always reach
   — never disappears no matter what's happening in the content. The
   bottom tab bar also sits exactly in the thumb zone on a one-handed
   phone grip.

The underlying principle (worth remembering across all your apps): **rank
before you decorate.** United didn't make this screen pretty first — they
decided what the user needs in the next 30 seconds (time pressure →
boarding pass), and built the hierarchy around that. Everything else is
execution.

## What's in this repo

```
index.html            demo page assembling every component
styles/tokens.css      design tokens (color, spacing, radius, shadow, type)
styles/components.css  the components themselves
scripts/app.js         minimal interaction: tab switching, expand, collapse
```

## Components

| Component | Class | United pattern it captures |
|---|---|---|
| Top bar | `.topbar` | Sticky, dark, title centered, avatar as identity anchor |
| Segmented control | `.segmented` | Current / Past — binary state switch, not a dropdown |
| List header | `.list-header` | Count + density toggle |
| Trip card | `.trip-card` | Hero image, urgency badge, meta line, big route title, chevron |
| Pill buttons | `.pill-btn--primary` / `--secondary` | One filled CTA, N outlined siblings |
| Floating quick action | `.fab` | Primary action re-surfaces on scroll |
| Bottom tab bar | `.tabbar` | Sticky, 5 destinations max, active state via color |

## Applying this to one of your existing apps

1. Copy `styles/tokens.css` in, then override the `--color-primary` etc.
   to your app's actual brand — the components never hardcode color.
2. Find your app's main list/dashboard screen. Ask: **what's the one
   urgent fact, and what's the one action 80% of visits are for?**
   Those become the badge and the primary pill, respectively.
3. Move every action that isn't that one into outlined pills in a
   horizontal-scroll row, or off the card entirely (behind the chevron).
4. If your primary action is currently only reachable by scrolling back
   to the top, add the `.fab` pattern.

## Note on brand vs. pattern

Intentionally: no United blue, no United logo, no destination photography.
This library copies the *interaction design* — hierarchy, disclosure,
navigation persistence — not United's visual identity, so it's safe to
reuse as a genuine style-neutral base across all of your apps.
