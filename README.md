# vibecode

Playground. One folder per experiment, self-contained, mostly disposable.

Nothing here is maintained. If something needs maintaining, it doesn't belong here — see [Graduation](#graduation).

## Index

| Experiment | What I was trying | Status |
| --- | --- | --- |
| _(nothing yet)_ | | |

Statuses: **alive** (still poking at it) · **parked** (might come back) · **dead** (answered its question, kept for the notes)

## Conventions

- One top-level folder per experiment, named `YYYY-MM-slug`. The date prefix means the folder list sorts chronologically for free, and I never have to remember which idea came first.
- Every experiment gets a `README.md` — two lines minimum: what I was trying, and whether it worked. Six months from now that's the only part with any value.
- Experiments are self-contained. Own deps, own lockfile, own runner. Nothing at the repo root is shared, so no experiment can break another one.
- No cross-experiment imports. If two folders want the same code, that's a signal the code should graduate, not that the folders should couple.
- Add a row to the index above when you start, update the status when you stop.

## Starting one

```sh
./new.sh thing-im-curious-about
```

Creates `2026-08-thing-im-curious-about/` from `_template/` and prints the path. That's the whole ceremony — friction here kills small ideas, which are the ones worth having.

## Graduation

Split an experiment into its own repo the moment any of these is true:

- it gets a deploy target
- a second person contributes
- you want issues, releases, or CI on it

```sh
git subtree split -P 2026-08-slug -b split-slug
# then push split-slug to a fresh repo as its main
```

Cheap precisely because every experiment is already an isolated folder with its own history.

## Secrets

This repo is private, but treat it as if it weren't. Real credentials go in a `.env` (gitignored repo-wide) — never inline in a scratch file, because scratch files are exactly the ones that get pasted into issues and gists.
