# Recon, risk, scope, and asking engineers

## Contents
1. Codebase reconnaissance
2. Risk tiers in detail
3. Change-scope alarm
4. Professional-repo rules
5. Asking engineers high-information questions

## 1. Codebase reconnaissance

Goal: find the smallest true picture of how this part of the product works before changing it. Read; don't guess.

**Orient (first time in a repo, about 2 minutes):**
- `README`, `CLAUDE.md`/`AGENTS.md`, `CONTRIBUTING`. These contain the house rules
- `package.json`: framework (React/Next/Vue…), scripts (dev, test, lint, typecheck, build), key libraries (state, data fetching, styling, design system)
- Top-level folders: where components, pages/routes, hooks, API clients, and tests live

**Locate the feature:**
- Search for visible UI text, route names, or component names (`grep -rn "Save filter" src/`)
- Trace from the page/route file down to the component the user touches
- Find the design-system components used nearby, and reuse them

**Understand the flow (UI → state → data):**
- Where does the relevant state live? Who reads it? Who changes it?
- Where does data come from? (API client, hook, store, props from a parent)
- Existing patterns for the same kind of thing: how do other features persist preferences, show loading, handle errors?

**Check the safety net:**
- Tests near the files (`*.test.*`, `__tests__`, stories)
- `git log --oneline -- <file>` for recent history and owners; `CODEOWNERS`
- Auth/permission checks, analytics events, feature flags touching this code

**Report as KNOW / INFER / VERIFY.** Example:

```
KNOW    Filters live in SearchPage state (SearchPage.tsx:31) and pass down as props.
KNOW    User settings already persist via usePreferences → PATCH /api/preferences.
INFER   usePreferences is the intended place for saved filters (theme + density use it).
VERIFY  Whether /api/preferences has a size limit, and behavior for logged-out users.
```

## 2. Risk tiers in detail

**GREEN: proceed.** Styling, copy, layout, new presentational components, wiring props, local UI state, adding tests.

**YELLOW: explain, recommend a check, keep going unless they say pause.**
- New dependency or a version bump
- New pattern for this repo (state library, context provider, data-fetching approach)
- Diff larger than the request suggests
- Touching shared components used in many places
- Unclear state or code ownership
- Weak or no test coverage on changed logic
- Changing analytics events, feature flags, caching, or SEO-relevant markup
- Async edge cases (race conditions, stale data)

**RED: stop and recommend engineering review.**
- Authentication, authorization, sessions, tokens, permissions
- Anything touching secrets, credentials, or env config for production
- Database migrations, schema changes, data deletion or backfills
- Payments, billing, PII/privacy handling, logging of user data
- Destructive or irreversible commands (`rm -rf`, `git push --force` to shared branches, `git reset --hard` on shared work, dropping tables)
- Security-sensitive input handling (raw HTML injection, `dangerouslySetInnerHTML`, eval)
- Major architecture changes, or any code you can't confidently explain

For RED: say what the risk is in one or two plain sentences, what could go wrong, and who should review. Then help them draft the question (section 5). Offer to keep going on the GREEN parts while they wait.

## 3. Change-scope alarm

Triggers, relative to how small the request sounded:
- More than ~3 files, or more than ~150 changed lines, for a "small" change
- Any new dependency
- A new architectural pattern
- Edits to shared/global files (theme, API client, root layout, store setup, config)
- Lockfile churn you didn't expect
- The generated solution "rewrites" a working component instead of extending it

Response script:
> "🟡 Scope check: you asked for <small thing>, and this touches <N files / +X lines / new dependency>. Why is it this large? Let me look for an existing pattern we can reuse."

Then actually look: an existing prop, variant, hook, utility, or similar feature to copy. Present the smaller option side by side if one exists. If the large change really is needed, explain why in two lines. That understanding is the lesson.

Teach the habit: **disproportion is a smell.** A minor interaction change that needs 14 files and a new state library is usually the wrong approach, not a hard problem.

## 4. Professional-repo rules

- Repo instructions and conventions beat this skill's preferences
- Use the company's tooling, scripts, and branch/PR conventions
- Respect CODEOWNERS and required reviews; never suggest bypassing hooks, CI, or approvals
- Keep proprietary code, data, credentials, internal URLs, and confidential context inside the approved environment. Don't paste them into external tools or services unless explicitly permitted
- Keep `.builder/` local (`.git/info/exclude`); never commit learner files
- When unsure whether something is allowed, assume not and recommend checking

## 5. Asking engineers high-information questions

Do the homework first: inspect the repo, search existing patterns, read docs, check tests and history, reason about likely answers. Escalate only if the ambiguity is consequential.

Formula: **context → what I found → my hypothesis → a question they can answer in one line.**

Bad:
> "How does filtering work?"

Better:
> "I'm adding saved filters to Search. Filter state lives in `SearchPage`, and user settings persist through `usePreferences` → `PATCH /api/preferences`. I'm planning to store saved filters there rather than in localStorage, so they sync across devices. Is that consistent with how you want preferences used, and is there a payload size limit I should know about?"

Why it works: the expert can verify instead of explain, it shows respect for their time, and it often gets a yes/no in one message. Coach the learner to write these themselves at autonomy stage 3.
