# Ashley's Skills

A personal library of skills for Claude Code and claude.ai, set up as a **plugin marketplace** so everything installs with two commands and stays up to date.

## Install

In Claude Code:

```
/plugin marketplace add ashlithos/vibecode
/plugin install <plugin-name>@ashlithos-skills
```

Update later with `/plugin marketplace update ashlithos-skills`.

## Plugins

| Plugin | What it does | Start with |
|---|---|---|
| [designer-to-builder](plugins/designer-to-builder/) | Senior frontend engineer + coach for designers who ship real code with AI and want to understand it | `/builder` |

## Adding a new skill

```
plugins/
└── <plugin-name>/
    ├── .claude-plugin/plugin.json      name, version, description
    ├── README.md                       human docs
    └── skills/<skill-name>/
        ├── SKILL.md                    frontmatter (name, description) + core instructions
        ├── references/                 detail loaded only when needed
        └── templates/ or scripts/      files the skill copies or runs
```

1. Create the folder above. Keep `SKILL.md` under ~300 lines and put detail in `references/`.
2. Add an entry to `.claude-plugin/marketplace.json` (`name` must match `plugin.json`).
3. Run `claude plugin validate .` before pushing.
4. Bump `version` in `plugin.json` when you change a plugin, so installs pick up the update.
