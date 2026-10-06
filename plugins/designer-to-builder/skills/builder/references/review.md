# Review: diff walkthrough, pre-PR gauntlet, explainability, retro

Reading diffs is a core skill. The learner may not write every line, but they should be able to read every file that changed and say why.

## Contents
1. Diff walkthrough (`/builder diff`)
2. Pre-PR gauntlet (`/builder review`)
3. Validation report
4. Explainability check
5. PR description
6. Retro (`/builder retro`)

## 1. Diff walkthrough

Get the real diff (`git status`, `git diff --stat`, `git diff`, plus untracked files). Never describe a diff from memory.

**Stage 1 (conceptual).** Start with a table, then 2–4 lines of story:

| File | What changed | Why | Essential? |
|---|---|---|---|
| `FilterBar.tsx` | Added Save button + handler | Entry point for the feature | Yes |
| `usePreferences.ts` | Added `savedFilters` field | Reuses existing persistence | Yes |
| `package-lock.json` | 1,200 lines | ⚠️ A dependency was added. Was that intended? | Check |

**Stage 2+.** Invite them to explain one file first: "Take `FilterBar.tsx`. What do you think the new code does?" Then fill gaps.

Always answer these eight questions, briefly:
1. What changed?
2. Why did each file change?
3. Which changes are essential and which are incidental?
4. Did anything change by accident (formatting churn, debug logs, stray files, lockfile)?
5. Is it larger than it needs to be? (Scope alarm thresholds are in recon-risk-scope.md.)
6. Any new dependencies?
7. What could break, and where else is this code used?
8. Does it follow the patterns already in this repo?

Fix accidental changes before moving on. Point out the habit: "Always scan for files you didn't expect to touch."

## 2. Pre-PR gauntlet

Run before any production PR, and for personal work when they ask. Keep each pass short. Report only real findings, not empty checklists.

**Architecture.** Consistent with nearby code? Unnecessary abstraction? Sensible component boundaries? New dependencies justified? Blast radius understood?

**Simplification.** Could this be less code? Could an existing component, hook, or utility replace new code? Is anything clever where boring would do?

**QA states.** Happy path · loading · empty · error · unusual input (long text, zero, special characters) · repeated actions (double-click, rapid toggling) · race conditions where data loads async · responsive at real breakpoints · browser back/refresh where state matters.

**Accessibility.** Semantic elements (a real `<button>`, not a clickable `<div>`) · keyboard reachable and operable · visible focus, with focus moved sensibly after dialogs and route changes · labels and accessible names · screen-reader announcements for dynamic changes where relevant · contrast where colors changed.

**Engineering validation.** Find the commands in `package.json` scripts, the README/CONTRIBUTING, and CI config. Typical: `test`, `lint`, `typecheck`/`tsc --noEmit`, `build`. Run them. If a check fails, read the failure and fix it or explain it. Don't hide it.

## 3. Validation report

Always use this shape. Be literal:

```
VERIFIED
  ✓ npm run lint: passed
  ✓ npm test -- FilterBar: 6 passed
  ✓ Checked happy path + error state in the browser (dev server)
NOT VERIFIED
  • No test covers the saved-filter API call
  • Didn't check Safari / mobile breakpoints
NEEDS HUMAN REVIEW
  • Preferences endpoint behavior for logged-out users (🟡)
```

Never write ✓ for something that didn't run. "It compiles" goes under NOT VERIFIED for behavior.

## 4. Explainability check

Before a meaningful PR, ask: **"Could you explain this change to an engineer if they asked why it works this way?"**

Not line-by-line. They should be able to cover:
- the architecture involved (which components and where state lives)
- the important data flow
- the major implementation choice and the alternative not taken
- the main risk or tradeoff
- why each file changed

If they're unsure, offer a 2-minute walkthrough, or have them try a 5-sentence explanation and fill the gaps:

> "This adds ___ so users can ___. The state lives in ___ because ___. It saves through the existing ___ instead of ___ because ___. The main risk is ___, which I checked by ___. Files changed: ___."

That paragraph often becomes the PR description.

## 5. PR description

Follow the repo's PR template if one exists. Otherwise:

```
## What
## Why (user problem)
## How (approach + pattern reused)
## Screenshots / recording (before → after, incl. loading/empty/error)
## Testing (VERIFIED / NOT VERIFIED)
## Risks & questions for reviewers
```

Help them pre-empt reviewer questions. A PR that names its own risks earns trust.

## 6. Retro

Optional, after meaningful work, one question: **"What did building this teach us about the design?"** Look for:

- hidden states the mockups didn't show (loading, partial, stale, offline)
- latency that changes the interaction
- permissions or roles that change who sees what
- data limits (missing fields, pagination, slow queries)
- reusable patterns found, or patterns that should exist
- accessibility implications
- **a simpler UX that would produce much simpler software.** This is the most valuable finding for a designer-builder.

Keep it to a few bullets. Suggest adding a "Remember" line to the learning log if something generalizes.
