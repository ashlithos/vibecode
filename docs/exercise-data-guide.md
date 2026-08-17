# Exercise data guide

The exercise catalog lives in `data/exercises/*.json`, split by muscle group so
you can review one area at a time rather than scrolling a single huge file.

```
data/exercises/
  arms.json             back.json          chest.json
  core.json             glutes.json        legs-posterior.json
  legs-quads.json       shoulders.json
```

Every file is an array of exercise objects. Files are merged at load time — the
split is purely for your convenience, and moving an exercise between files
changes nothing.

## This data was AI-drafted. Please review it.

The muscle mappings in particular deserve your eyes before you trust the
recommendations. They are the input to the recovery model, so a wrong mapping
doesn't produce an obvious bug — it produces an app that quietly suggests the
wrong thing on the wrong day, forever, with no visible symptom.

Worth checking first:

- **Primary vs secondary.** Primary means the muscle the exercise is *for*.
  Secondary means meaningfully involved but not the target. Getting this
  backwards skews recovery scoring, because primary counts double.
- **Anything you actually do.** Your own regular exercises matter far more than
  the long tail you may never touch.
- **`loadType` on assistance machines.** If an assisted pull-up is marked
  `weight` instead of `assistance`, progression will tell you to *add*
  assistance as you get stronger.

Run `npm run validate:seed` after any edit. It checks structure and, more
usefully, catches broken alternative links and thin movement-pattern coverage.

## Fields

| Field | Notes |
| --- | --- |
| `id` | Lowercase kebab-case slug. Referenced by `alternatives`, so renaming means updating every reference. |
| `name` | Display name. |
| `bodyRegion` | `upper` / `lower` / `core`. |
| `equipment` | One value. Drives the availability filter in Settings. |
| `difficulty` | `beginner` / `intermediate` / `advanced`. |
| `loadType` | `weight`, `assistance`, `bodyweight`, or `time`. See below. |
| `loadIncrement` | Smallest sensible step. Required above 0 for `weight` and `assistance`. |
| `defaultSets` / `defaultRepsLow` / `defaultRepsHigh` | Starting targets before any history exists. |
| `primaryMuscles` | At least one. Counts full weight toward fatigue. |
| `secondaryMuscles` | Counts half. Must not repeat a primary muscle. |
| `movementPatterns` | One or more. Drives session variety and slot filling. |
| `machineIdentification` | Plain-language "how to spot it". `null` for free weights and bodyweight. |
| `instructions` | 2–8 setup steps. |
| `keyCues` | **Max 4.** Three cues you read beat eight you skip. |
| `commonMistakes` | **Max 3.** |
| `alternatives` | Slugs of functional equivalents. Must resolve. |
| `mediaUrl` / `mediaKind` | `null` until you add media. |

### `loadType` matters more than it looks

- **`weight`** — normal. Progression steps the load *up*.
- **`assistance`** — assisted pull-up and dip machines, where the stack
  *offsets* your bodyweight. More weight is easier, so progression steps the
  load **down**. Getting this wrong inverts your progress.
- **`bodyweight`** — no load. Progression works through reps.
- **`time`** — planks and carries. `defaultRepsLow`/`High` are seconds.

## Adding media

There is no media at launch, and the UI is built to look deliberate without it
rather than showing broken images.

1. Drop the file in `packages/web/public/media/`.
2. Point the exercise at it:
   ```json
   "mediaUrl": "/media/assisted-pull-up.gif",
   "mediaKind": "gif"
   ```
   `mediaKind` is `image`, `gif`, or `video`.
3. `npm run db:seed` to pick up the change.

Only use footage you have the rights to. If you shoot your own machine photos at
your gym, that sidesteps the licensing question entirely and gives you something
better than stock — the actual machines you'll be standing in front of.

Two layouts in the design study (`docs/wireframes.html`) are waiting on real
media and become worth revisiting once it exists: the pinned-media exercise
detail (5C) and the body-map library browser (4B).

## Adding an exercise

Append to whichever file fits, then:

```bash
npm run validate:seed   # structure, links, coverage
npm run db:seed         # upserts; your history and preferences survive
```

Add it to the `alternatives` of two or three related exercises as well —
otherwise the recommender can offer it but never offer it *as a swap*, which is
where most discovery actually happens.
