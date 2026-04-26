# whats-the-plan

A small app to help decide where to eat.

## Status

Not started. No code yet — still picking a direction.

## Open decisions

The user is choosing between these directions (no choice made yet):

1. **Simple web app (HTML/JS)** — manual list of restaurants, randomizer, basic filters (cuisine/price/distance). Fastest to ship.
2. **CLI tool (Python or Node)** — same idea, terminal-based, reads from a local JSON file.
3. **Smarter web app** — pulls from Google Places / Yelp API near current location, filters by "open now," randomizes from results. Needs an API key.
4. **Group decision app** — multiple people submit options, app picks via vote or weighted random.

Ask the user which direction before scaffolding anything.

## Project conventions

- Lives under `/home/user/vibecode/whats-the-plan/` inside the `vibecode` umbrella repo.
- Working branch: `claude/find-restaurant-project-E447r`.
- Other projects in the same repo (e.g. `myra/`) are unrelated — do not touch them.

## Next session

1. Confirm which of the 4 directions to build.
2. Scaffold the chosen stack inside this directory.
3. Update this file with the decision and progress.
