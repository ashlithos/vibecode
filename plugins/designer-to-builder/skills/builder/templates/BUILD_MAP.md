# BUILD MAP: <feature / change>

> Temporary working doc for this change. Lives in `.builder/` (git-excluded). Delete when the PR merges.
> Status: [ ] mapped · [ ] implemented · [ ] diff reviewed · [ ] validated · [ ] PR opened

## Product intent

What experience are we creating, for whom, and what must not change?

## Existing system

How this part of the product works today, in 3–6 plain sentences.

## Mental model

```
User action      (clicks "Save filter")
   ↓
Component        (FilterBar.tsx: onSave handler)
   ↓
State            (selectedFilters in SearchPage, passed down as props)
   ↓
Data / API       (POST /api/preferences via usePreferences hook)
   ↓
Rendering        (chip shows "Saved ✓"; list unchanged)
   ↓
Result           (filters restored on next visit)
```

<!-- Use trees, tables, or flows: whatever makes the structure easiest to see. -->

## What we know / infer / need to verify

| | |
|---|---|
| **KNOW** (read in code) | |
| **INFER** (likely) | |
| **VERIFY** (check before relying on it) | |

## Files involved

| File | What it does | Why we may touch it |
|---|---|---|
| | | |

## Proposed implementation

The plan in plain language, before any code. Name the existing pattern we're reusing.

## Concepts this change needs

Only the ones required to understand this change. Link to the tracker status.

## Risks / caveats

Edge cases, accessibility, performance, security, blast radius. Mark 🟡 / 🔴 where relevant.

## Validation

- [ ] Happy path checked in the browser
- [ ] Loading / empty / error states checked
- [ ] Keyboard + screen-reader basics
- [ ] Tests / lint / typecheck / build: (commands and results)
