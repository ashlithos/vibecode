# Onboarding: lightweight calibration (~5 minutes)

Goal: set a sensible starting point for `LEARNER_PROFILE.md` and `CONCEPTS.md`. It is not an exam. People underrate and overrate themselves, and that's fine because the profile is editable and they graduate concepts over time.

## Rules

- Offer it, don't impose it. If they arrived with a task, offer to do it first and calibrate after.
- Use multiple-choice cards (AskUserQuestion in Claude Code) when available. They're fast and low-stress. Otherwise number the options so they can reply "1, 3, 2…".
- Use scenarios, not trivia. Ask how well they follow a situation, not for definitions.
- No grading language ("correct!", "wrong"). The point is to find their level, not to test them.
- Whole flow: 3 context questions + 6–8 scenarios + a summary they confirm.

## Step 1: Context (3 questions)

1. **What are you mainly building?** Personal projects · Work repos · Both · Not sure yet
2. **Ship/learn balance right now?** Mostly ship (70/30) · Balanced (50/50) · Mostly learn (30/70)
3. **How do you like explanations?** Analogy + example first · Diagram first · Straight to the code · Mix

Optional free-text: "Anything you already know you want to skip, or are nervous about?"

## Step 2: Scenarios

For each, they pick: **Could explain it** · **Roughly get it** · **Fuzzy** · **New to me**

| # | Scenario | Concepts it informs |
|---|---|---|
| 1 | You click **Save**. The button spins, then an error appears because the server rejected the request. | client/server, APIs, async, loading & error states |
| 2 | In a file you see `<Button variant="primary" onClick={save}>Save</Button>`. What are `variant` and `onClick` doing? | components, props, event handlers, variants ↔ props |
| 3 | Picking a filter chip updates the results list *and* a count in the page header. Where does "which filter is selected" need to be remembered? | state, state ownership, rendering |
| 4 | A teammate says: "Branch off main, open a PR, CI is red, take a look." | Git, branches, PRs, CI |
| 5 | The page is blank for one user; the console shows `Cannot read properties of undefined (reading 'name')`. | console, error messages, data shape, tracing data flow |
| 6 | A card grid looks right on desktop but overflows on a phone. | CSS layout, responsive design, DevTools |
| 7 | A keyboard user can't reach or open a custom dropdown. | accessibility, semantic HTML, focus |
| 8 | A PR shows `+48 −6` across 4 files and you're asked to review it. | diffs, blast radius, reviewing AI output |

Optional for people who say "Could explain it" on several: one tiny show-me, e.g. "In one sentence, why might the selected filter live in the page instead of the chip?" Skip it if they seem rushed.

## Step 3: Map to concept states

- **Could explain it.** Propose `[x]` COMFORTABLE for the related concepts and **confirm in the summary**, because graduation is theirs.
- **Roughly get it.** `[~]` LEARNING.
- **Fuzzy / New to me.** `[ ]` NOT LEARNED.
- Concepts not covered by any scenario stay `[ ]`. That's normal.

## Step 4: Set level and autonomy

| Pattern | Level | Autonomy stage |
|---|---|---|
| Mostly Fuzzy/New | Beginner | 1: agent explains important concepts proactively |
| Mostly Roughly, some Could | Intermediate | 2: agent sometimes asks them to predict first |
| Mostly Could, including 4 and 8 | Advanced | 3: agent acts mainly as reviewer and sounding board |

Ratio comes from question 2. Preferences come from question 3 and the free-text answer.

## Step 5: Confirm and write

Show a short summary:

```
Here's where I'll start. Change anything:
• Level: Beginner · Stage 1 · 50/50 ship/learn
• Comfortable: semantic HTML, CSS layout, components
• Learning: props, Git branches
• Everything else: I'll explain when it comes up
• You prefer analogies first and occasional quizzes
OK to save?
```

On yes: create the state directory if needed (`$BUILDER_HOME` or `~/.claude/designer-to-builder/`; in a cloud session or personal project where home resets, offer `.builder/` in the project). Copy the templates, fill in `LEARNER_PROFILE.md` (including the onboarding snapshot with today's date), set the statuses in `CONCEPTS.md`, and create an empty `LEARNING_LOG.md`. Tell them where the files are and that they can edit them by hand.

Then go straight back to their task.

## Reset / re-run

`/builder onboard` or "reset my profile": rename existing files to `*.bak`, then run the flow again. Mention that the old files are kept. Re-running every couple of months is a nice way to see progress. Compare against the snapshot.
