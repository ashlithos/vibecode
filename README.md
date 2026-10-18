# vibecode

Ashley's reusable toolkit for vibe-coded projects.

## Skills

| Skill | What it does |
|---|---|
| [`clean-site`](.claude/skills/clean-site/SKILL.md) | Make a site look clean and hold up at every screen size: principles, a workflow (audit → choose → apply → prove), and an audit script that screenshots every page at six widths and lists every font, size and color in use. |
| [`product-video`](.claude/skills/product-video/SKILL.md) | Turn a raw screen recording into a short looping product video with designed motion: Material 3 emphasized easing, log-space zooms, a spotlight on the hero moment, dead time cut, a seamless loop. A renderer driven by a JSON shot list, a beat finder and a contact-sheet tool, plus the motion rules and taste notes. |

### Use a skill

- **In Claude Code sessions on this repo:** it loads automatically from `.claude/skills/`.
- **In any other project:** copy the skill folder into that project's `.claude/skills/`, or into
  `~/.claude/skills/` on your computer so every project sees it.
- **On claude.ai:** zip the skill folder and upload it under Settings → Capabilities → Skills.

The audit script needs Playwright in the project you're auditing (`npm i -D playwright`).
The video scripts need `ffmpeg` and Python with Pillow (`pip install pillow`).
