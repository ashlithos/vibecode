# Dashboard theme library: is it a real need?
*Research, 1 Nov 2026. Tags: **[obs]** observed this session · **[prior]** background knowledge, not re-checked · **[inf]** inference.*

## Verdict: a real need, medium-strong, but only in a reshaped form

**Demand is real.** [obs]
- Dashboards are the largest single category of AI design prompts: about 1 in 7 (13,151 of ~194k Superdesign prompts, Jan–Jun 2026).
- The default look is a blue gradient on a dark background.
- Dark-theme requests rose from 26.8% to 38.1% over the same period.
- People install "pick a named look" libraries: Anthropic `theme-factory` (~71.9k installs), awesome-design-md (125k★), tweakcn (10.5k★).

**The baseline has moved.**
- Claude Code bundles `/dataviz`, which already handles chart choice, a color validator and light/dark parity.
- It explicitly says: *"swap that file's values for your brand's"*. It ships **one** palette and no slots for typography, density or chrome.
- So "make my charts accessible" is mostly solved. "Make them look like *mine*, consistently" is not.

**A plain theme pack doesn't get traction.** [obs]
- awesome-dashboard-skill (10 themes): 6★.
- data-craft (6 themes): 8★.
- A list of themes alone isn't the hook.

**Durability.**
- Plain theme pack: **2/7**.
- Reshaped version: **6.5/7**. It adds a specimen page, a validator, a render-and-review loop, taste notes, and adapters to real chart libraries.

## Landscape
| Repo / tool | Traction | Covers | Gap |
|---|---|---|---|
| Claude Code `/dataviz` (bundled) | Every session | Chart choice, color roles, validator, light/dark | One neutral palette, no library of looks, no number type or density settings |
| anthropics `theme-factory` | ~71.9k installs | 10 themes (4 hex + fonts), for slide decks | No chart roles, no dark mode, no validation |
| taste-skill / hallmark / impeccable / ui-ux-pro-max | 98k–143k★ | Dashboard anti-slop rules | One house aesthetic each; no swappable themes |
| awesome-design-md / Google design.md | 125k / 28.7k★ | Brand UI tokens | The spec has zero chart/dataviz tokens |
| awesome-dashboard-skill | 6★ | 10 colorblind-checked themes, ECharts | Closest competitor; ECharts only; no growth loop |
| data-craft | 8★ | 6 editorial themes + writing voice | No validator |
| shadcn/ui charts | 127k★ | `--chart-N` CSS variables | Color only; chrome set per chart |
| tweakcn | 10.5k★ | Visual shadcn theme editor | No chart chrome, no checks |
| ECharts / vega-themes / Nivo / Plotly / Highcharts | Varies | Each library has its own theme format | **Separate formats; no shared spec across libraries** |
| Claude Dashboards (first-party, Oct 2026) | Paid beta | Live dashboards from your data warehouse | Nothing announced on themes or branding |

## Gaps, ranked
1. **No portable "whole look" spec.** Nothing covers color roles, number typography, density, chart chrome and KPI tiles together, and compiles to several libraries.
2. **`/dataviz` invites palette swaps but ships no alternatives.**
3. **No like-for-like visual proof.** No one renders every theme on the same specimen dashboard.
4. **No taste-growth loop.** Nothing goes from a reference, to a candidate theme, to approve/reject, to a logged reason.
5. **Number typography is barely tokenized.** Tabular numerals, KPI scale, delta format and unit abbreviation are mostly missing.
6. **Annotation style is not themed anywhere.** Callouts, reference lines, highlight bands.

## Positioning
- **Working name:** `looks` (`/look`). Alternatives: `swatchbook`, `chartroom`.
- **Pitch:** "Named, tested looks for dashboards. One recipe card, every chart library, proven on a specimen page before it touches your data."
- **Enemy line:** "Every AI dashboard is the same navy gradient with four KPI cards and a donut."
- **Fit:** theme packs for Claude Code's built-in `/dataviz`. `/dataviz` decides *how* to chart; `looks` decides *what it looks like*.
- **What makes it hers:**
  - 3–8 curated looks
  - "best for / never for" lines
  - a taste-notes ledger per look
  - the specimen layout itself
- **What makes it durable:**
  - theme spec
  - specimen renderer
  - validator
  - screenshot → fix loop
  - adapters that write real files
- **Don't build:**
  - chart-choice rules or accessibility lectures
  - a dashboard generator
  - a web theme editor
  - a palette generator
  - more than 2–3 adapters
  - Anthropic's validator code copied in (it isn't MIT-licensed; write your own)

## Architecture: a test kitchen
- **Theme = recipe card** (`theme.json`). It holds:
  - *Identity:* name, mood line, best for, never for.
  - *Surfaces and ink*, light + dark.
  - *Data color:* categorical, highlight/mute, sequential, diverging, status.
  - *Numbers:* font, tabular numerals, KPI scale, delta style, units.
  - *Density.*
  - *Chrome:* grid, axis, legend, labels, radius, line width, tooltip.
  - *Annotation.*
  - *KPI tile.*
- **Adapters = plug adapters for different countries.** One recipe becomes CSS variables, shadcn/Recharts config, and an ECharts theme.
- **Specimen page = the paint-swatch wall.** One fixed fake dashboard with every element on it:
  - KPI row with deltas
  - annotated line chart
  - highlighted bar chart
  - stacked bar
  - heatmap
  - diverging bar
  - table
  - sparkline
  - status chips
  - an open tooltip
  - an empty state
- **Validators = the health inspector's checklist.** Pass/fail, with plain-English reasons and suggested fixes.
- **Taste notes = the chef's margin notes** (`taste.md` per theme).
- **Growth:** `/look capture <screenshot or URL>`
  1. Claude drafts a candidate recipe.
  2. It renders the specimen next to the reference.
  3. Ashley approves or rejects token by token.
  4. The validator checks it.
  5. It's saved, with rejections logged.
- **Bonus:** `/look try` puts 3 looks on real data side by side, then logs the losers' reasons.

## Guided build plan
| # | Goal | Ashley | Claude | Done when | Time |
|---|---|---|---|---|---|
| 1 | Specimen first | Picks 1 dashboard she loves + 1 she hates | Builds `specimen.html` (HTML/SVG + CSS variables), light/dark toggle | It opens, the toggle works, she can name 3 changes | < 1 h |
| 2 | Recipe card | Decides the format and naming style | Pulls the look into `theme.json` + `taste.md` | Editing one value changes the page | 1–1.5 h |
| 3 | Inspector | Makes one deliberately bad theme | Writes `validate.mjs` | The bad theme fails with reasons | 1–2 h |
| 4 | Eyes loop | Reviews the contact sheet, writes taste notes | `render.mjs` (2 widths × 2 modes) + validate → look → fix | One command gives the report + contact sheet | 1–2 h |
| 5 | First adapter | Picks the library (Recharts/shadcn or ECharts) | Writes the adapter, applies it to her real dashboard | Specimen and real dashboard look like siblings | 2 h |
| 6 | Grow the library | Brings 2 more references | Builds `/look capture` + side-by-side view | 3 themes, all passing | 2 h |
| 7 | Ship | Decides name and public vs private | SKILL.md (<150 lines) feeding `/dataviz`; adds it to the marketplace; gallery image | One prompt applies a look on a fresh session | 1–2 h |

## Scores
| Measure | Score (1–5) | Note |
|---|---|---|
| Effort | 3 | 2–3 weekends to v1 |
| Feasibility | 4 | |
| Engagement | 3 | Theme packs have shown little traction; distribution through `/dataviz` users is the lever |
| Durability | 4.5 | |

**Fit:** this is the natural first user of the planned shared TASTE layer.

**Caution:** product-video stays the flagship unless dashboards are a weekly activity.

## Sources
- [Superdesign prompt study](https://www.superdesign.dev/blog/ai-design-prompts-2026)
- [skillselion: dashboard skills](https://skillselion.com/guides/best-dashboard-skills-for-claude-code)
- [skillselion: dataviz skills](https://skillselion.com/guides/best-data-visualization-skills-for-claude-code)
- [Claude Dashboards launch](https://claude.com/resources/articles/dashboards-and-motion)
- [shadcn chart docs](https://ui.shadcn.com/docs/components/chart)
- [claude-code #72938](https://github.com/anthropics/claude-code/issues/72938)
- Repos: shinwood/awesome-dashboard-skill, yixiliu617/data-craft, Nutlope/hallmark, Leonxlnx/taste-skill, jnsahaj/tweakcn, vega/vega-themes, google-labs-code/design.md, socraticstatic/chart-color-audit
