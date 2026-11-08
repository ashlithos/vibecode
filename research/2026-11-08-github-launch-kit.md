# GitHub launch kit
*8 Nov 2026 · copy-paste fixes for every public repo, plus awesome-list entries*

## How to use this (about 15 minutes)
On each repo page, click the **⚙ gear next to "About"** (top right). Paste the **Description**, add the **Topics** one by one (press Enter after each), and fill **Website** where one is listed.

---

## 1. Public repos: description, topics, website

### ux-competitive-research ⭐ priority
- **Description:** Agent skill for designers: turn "how do other products solve X?" into a sourced competitive research report with real screenshots, charts, CUJs and principles.
- **Topics:** `claude-skills` `agent-skills` `claude-code` `ux-research` `competitive-analysis` `product-design` `ux-design`
- **Website:** `https://ashlithos.github.io/ux-competitive-research/examples/comments-at-scale/`
- **Also:** turn on Pages (**Settings → Pages → Deploy from a branch → `main` / root**), then merge [ashlithos/ux-competitive-research#1](https://github.com/ashlithos/ux-competitive-research/pull/1).

### UX-skills ⭐ priority
- **Description:** Claude Code plugins for designers who ship: designed product videos from screen recordings, clean responsive sites, competitive research reports, and a designer-to-builder coach.
- **Topics:** `claude-code` `claude-plugins` `claude-skills` `agent-skills` `ux-design` `product-design` `motion-design`
- **Also:** add an MIT license (**Add file → Create new file**, name it `LICENSE`, then pick the MIT template from the button that appears). Merge [ashlithos/UX-skills#4](https://github.com/ashlithos/UX-skills/pull/4).

### datascience (FlowDash)
- **Description:** Demo: a plain-English agent UX across a data-science workflow (cleaning → key drivers → storytelling → alerts), built on Claude skills, tools and SQLite.
- **Topics:** `agent-ux` `claude-agent-sdk` `claude-skills` `data-science` `ux-design` `demo`
- ⚠️ **Check first:** the README says it reproduces a design system from your private `jetski` repo. If that design system is from work, make this repo private or swap in neutral styling.

### lineup
- **Description:** LineUp: keep your plans and never miss a free-cancellation window. A booking and cancellation-deadline tracker.
- **Topics:** `nextjs` `supabase` `travel` `productivity` `personal-app`
- **Website:** `https://uselineup.vercel.app` (already set ✓)
- **Also:** replace the default Next.js README. It's your PRD in short form: the problem, a screenshot, how it works.

### myra
- **Description:** Your personal travel experience planner.
- **Topics:** `nextjs` `travel` `trip-planner` `personal-app`
- **Website:** `https://myra-lac.vercel.app` (already set ✓)
- **Also:** replace the default Next.js README, or make the repo private if it isn't meant to be shown.

### Meridian
- **Description** is already set ✓. Add topics: `data-analysis` `eda` `hypothesis` `agent-ux`
- **Also:** the README is 2 lines and there's no code yet. Make it private until there's something to show, or add a short "what this will be" paragraph.

### uxaudit-widget
- **Empty repo (0 files).** Delete it, make it private, or push the first commit. An empty public repo makes your profile look unfinished.

### vibecode
- **Description:** Ashley's playground for vibe-coded experiments and research notes. Skills live in ashlithos/UX-skills.
- **Topics:** `playground` `vibe-coding`

### Private repo fixes (only you see these)
- `tendi`: description typo, "econd brain" → "Second brain for admin".
- `ashley-portfolio`: the website field is a Vercel address that contains your email handle. Point it at `https://ashlidesigns.com` instead.

---

## 2. Profile-level fixes
- **Pin your 4 best repos** (profile → *Customize your pins*): UX-skills, ux-competitive-research, datascience, lineup.
- **Profile README:** create a public repo named exactly `ashlithos` with a `README.md`. GitHub shows it on your profile. Write 3 lines: who you are ("a product designer who ships with AI"), what you build, and links to UX-skills and your site.

---

## 3. Awesome-list entries (submit after Pages is on and the README PR is merged)
Lists check for a working demo, so submit once the live link works. Each list has its own format and contributing rules: read its CONTRIBUTING file, match the format of the neighbouring lines, and put one entry per pull request.

| List | Section to look for | Entry |
|---|---|---|
| [ComposioHQ/awesome-claude-skills](https://github.com/ComposioHQ/awesome-claude-skills) | Design / Research / Productivity | `[ux-competitive-research](https://github.com/ashlithos/ux-competitive-research) - Turns "how do other products solve X?" into a sourced competitive research report with real screenshots, charts and design principles.` |
| [VoltAgent/awesome-agent-skills](https://github.com/VoltAgent/awesome-agent-skills) | Design / Research | same line as above |
| [bergside/awesome-design-skills](https://github.com/bergside/awesome-design-skills) | Research / UX | `[ux-competitive-research](https://github.com/ashlithos/ux-competitive-research) - Competitive UX research as one shareable HTML report: CUJs, patterns, real product screenshots, principles and open questions.` |
| [zhuyansen/awesome-claude-video-skills](https://github.com/zhuyansen/awesome-claude-video-skills) | Screen recording / Product video | *(for product-video, once its demo exists)* `[product-video](https://github.com/ashlithos/UX-skills/tree/main/plugins/product-video) - Turns a raw screen recording into a short looping product video with designed motion: eased zooms, a spotlight on the hero moment, a seamless loop.` |

**Pull request title template:** `Add ux-competitive-research (competitive UX research reports)`

**Pull request body template:**
> Adds ux-competitive-research, an agent skill that turns a UX question into a sourced competitive research report (one HTML page with real product screenshots, charts and principles). Live example: https://ashlithos.github.io/ux-competitive-research/examples/comments-at-scale/ · MIT licensed.

---

## 4. The professional-repo checklist (used by the weekly audit)
A public repo is "audience-ready" when it has all of these:
1. A description (one sentence: who it's for + what it does)
2. 4–7 topics (include `claude-skills` / `agent-skills` for skills)
3. A README whose first screen shows **the promise, a visual, and how to try it**
4. A live demo or website link, with Pages on or a deployment that actually loads
5. A LICENSE file
6. No secrets, no private or work material, no default template README
7. For skills: valid SKILL.md frontmatter (name + "use when…" description) and an install path that works (marketplace and/or `npx skills`)
8. Recent activity, or a clear "status: stable" note
