# Parent-Approved

A small website listing the places, activities and events I've taken my parents to, with my impressions and ratings. It's for friends whose parents are visiting and who want to know where to take them.

## How each place is rated

| Rubric | Scale | What it means |
| --- | --- | --- |
| Senior-friendly | 1–5 | 5 = easy and enjoyable for older parents |
| Family-friendly | 1–5 | 5 = great with kids along too |
| Physical effort | 1–5 | 1 sit-down · 2 easy stroll · 3 moderate walking · 4 hills or stairs · 5 strenuous |
| Language | 0–2 | 0 no words needed · 1 some English helps · 2 needs good English |
| Overall | 1–5 | My gut rating for a visit with parents (half points OK) |

Each place also lists practical details: cost, time needed, restrooms, benches, parking, wheelchair access, food and shade.

Visitors can filter by **who's visiting** (parents who tire easily, bringing kids, little or no English, wheelchair or walker, free), search, and sort.

## Adding a place

Everything lives in **`places.js`**. Each place is one `{ ... }` block, like a row in a spreadsheet.

1. Open `places.js`.
2. Copy the TEMPLATE block at the bottom of the file.
3. Paste it into the list, fill in the blanks, and save.

The six entries marked `sample: true` are placeholders that show the format. Delete them once you've added your own.

## Viewing it

Open `index.html` in a browser. There's nothing to install. To put it online for free, turn on GitHub Pages for this repository (Settings → Pages → deploy from the `main` branch).
