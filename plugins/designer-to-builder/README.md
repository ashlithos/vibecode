# Designer → Builder

A Claude Code skill for product/UX designers who want to **ship real frontend code with AI and understand what they ship**.

It acts as a senior frontend engineer sitting beside you, a code-review guardrail, a translator between design intent and software structure, and a coach who gradually steps back as you grow. It is not a coding course, an engineer replacement, or an autonomous vibe-coder.

> **North star:** you can open an unfamiliar frontend repo, make a small product change with AI, run and debug it, read the diff, and open a PR you can explain to an engineer.

## Install

**Option A: Claude Code plugin (recommended; gets updates)**

```
/plugin marketplace add ashlithos/vibecode
/plugin install designer-to-builder@ashlithos-skills
```

If the repo is private, Claude Code uses your existing GitHub/git credentials.

**Option B: copy the skill (no plugin system)**

```bash
git clone https://github.com/ashlithos/vibecode
mkdir -p ~/.claude/skills
cp -r vibecode/plugins/designer-to-builder/skills/builder ~/.claude/skills/builder
```

**Option C: claude.ai (web, desktop, cloud sessions)**

Upload `builder.skill` (or a zip of the `skills/builder` folder) in claude.ai → Settings → Capabilities → Skills.

**Make it engage automatically** by adding one line to `~/.claude/CLAUDE.md`:

```
I'm a product designer learning to build. For coding work, use the builder skill (Designer → Builder).
```

## First run

Type `/builder` (or `/designer-to-builder:builder` if another command is already called `builder`). It offers a 5-minute, scenario-based calibration. You can skip it and start with beginner defaults.

## Controls

Type `/builder <mode>`, or just say it in plain words.

| Say | It does |
|---|---|
| `/builder onboard` | Calibrate or reset your profile |
| `/builder map` | Build/update a BUILD_MAP for the current change |
| `/builder teach` | Go deeper on the concept in play |
| `/builder why` | Why does the implementation work this way? |
| `/builder diff` | Walk through the current diff |
| `/builder review` | Pre-PR gauntlet: architecture, simplification, QA, accessibility, validation |
| `/builder quiz` | A few quick recall questions |
| `/builder concepts` | Show your concept tracker |
| `/builder comfortable props` | Graduate a concept (after confirmation) |
| `/builder retro` | What did building this teach us about the design? |
| `/builder ship` | Minimal teaching, focus on finishing |
| `/builder learn` | Deeper teaching for a while |
| `/builder wrap` | Log today's session |
| "tell me" / "skip" / "not now" | Answer now; no quiz |

## Where your files live

| File | Location | Purpose |
|---|---|---|
| `LEARNER_PROFILE.md` | `~/.claude/designer-to-builder/` | Your level, ship/learn ratio, preferences. You own it. |
| `CONCEPTS.md` | same | ~60 concepts, each `[ ]` not learned, `[~]` learning, or `[x]` comfortable. You graduate them. |
| `LEARNING_LOG.md` | same | 5 lines per session, plus a "next time, explain" warm-up question |
| `BUILD_MAP.md` | `.builder/` in the project | Temporary map for a meaningful change; git-excluded, never committed |

Set `BUILDER_HOME` to store state somewhere else, for example a synced folder.

**Cloud sessions** (claude.ai/code) start each session in a fresh container, so the home folder resets. For personal projects, keep the state files in the project's `.builder/` folder and commit them. In work repos, keep them local only.

## How it decides how much to teach

- **Your profile, not guesswork.** It reads your explicit level and concept statuses. It won't silently decide you're "advanced" after one good task.
- **Scaled ceremony.** A copy tweak gets one line. A new feature gets recon, a map, a diff walkthrough, and a review gauntlet.
- **A teaching budget.** By default, at most two teaching moments and one question per task, anchored in your real code.
- **Progressive autonomy.** Stage 1: it explains. Stage 2: it asks you to predict and explain parts. Stage 3: it's your reviewer and sounding board.
- **Retrieval practice.** Each session ends with a short log entry, and the next one can open with a one-line "explain this from memory" warm-up. That's how 20 sessions add up to real skill rather than 20 nice explanations.

## What's inside

```
skills/builder/
├── SKILL.md                     always-on core rules (loaded when the skill triggers)
├── references/                  loaded only when needed
│   ├── onboarding.md            calibration flow + scenarios
│   ├── teaching.md              explanation shape, analogy bank, quizzes, autonomy stages
│   ├── review.md                diff walkthrough, gauntlet, validation report, explainability, retro
│   ├── recon-risk-scope.md      recon checklist, GREEN/YELLOW/RED, scope alarm, engineer questions
│   └── examples.md              beginner, intermediate, and production-repo examples
└── templates/
    ├── LEARNER_PROFILE.md
    ├── CONCEPTS.md
    ├── LEARNING_LOG.md
    └── BUILD_MAP.md
```

## Using it with other coding agents

`SKILL.md` follows the open Agent Skills format (a folder with a `SKILL.md`, YAML frontmatter, and markdown), so agents that support skills can load it as is. For agents without skill support, paste the body of `SKILL.md` into their instructions file (for example `AGENTS.md` or `.cursor/rules`) and keep `references/` and `templates/` alongside it. The only Claude Code–specific pieces are the `/builder` slash command and `$ARGUMENTS`. Elsewhere, use the plain-language controls.
