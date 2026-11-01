# What to build next: designer skills on GitHub
*Combined report from two research agents · 31 Oct 2026*

- **Part 1: Synthesis.** Where the two reports overlap, and what to do.
- **Part 2: Trend research.** What GitHub rewards right now.
- **Part 3: Creative brainstorm.** Your workflow gaps and 7 directions.

---

# Part 1: Synthesis

## Where the agents agree
1. **What lasts is taste plus measurement plus loops.** Both agents arrived at the same rule from different directions. Skills that only repeat best practice lose value with every model release. Three things keep their value: personal taste data (what you rejected and why), scripts that check the real output, and loops that check, fix and check again.
2. **Your skills already pass that test.** clean-site has the audit script and the keep/drop specimen page. product-video has frame-accurate rendering, beat detection and a rejected-and-why table. **The substance is strong. What's missing is visibility:** 0 stars and no demo media.
3. **Every output should advertise the tool.** Boards, loops, posters and cards should carry a small "made with ___" credit.

## Where they disagree, and how I resolved it
| | Brainstorm agent said | Research data says | Verdict |
|---|---|---|---|
| **Doors** (3 directions, pick one) | Flagship, 5/5 overlap | Direction pickers are being built into 100k-star incumbents: taste-skill deals 3 of 20, hallmark deals 3 of 50, plus impeccable `live` and oil-ui | **Don't ship it as a generic web tool.** Use it inside motion, where nobody offers it |
| **TASTE.md** | Quick-win foundation | DESIGN.md is huge (125k-star awesome list, a Google spec) | **Position it as DESIGN.md's companion.** DESIGN.md says what the brand looks like. TASTE.md says what you refused, and why |
| **product-video** | Barely covered (only the sound add-on) | Fastest-rising nearby category; the real-recording-to-designed-loop gap has a 4-star competitor; Claude Motion is Team/Enterprise only | **Make it the flagship** |
| **Steal Sheet** | Second hit, 5/5 engagement | design-extract (4.4k) and awesome-design-md already exist for static design. Motion teardown (reanimate) is brand new | Do later, and only the *motion-measuring* angle |
| **designer-to-builder** | Not covered | Most exposed to model decay: a coaching persona built on knowledge the model already has | Re-ground it in your own method, or demote it |

## The overlap pick: **product-video as the flagship, with Doors and TASTE built in**
- **Public engagement:** this is the hottest area next to your work (hyperframes 77k, brag 20k, shotcraft 15k stars), and every finished loop is a free ad.
- **Daily use:** motion is your signature craft, and you already use this skill.
- **What's yours alone:** it works on *real* screen recordings, frame-accurate and on your own machine, with a written record of your taste.
- **What makes it last:** the verification loop below.

### The four upgrades
1. **Verify loop.** Render, measure, compare, fix, for up to N rounds. The script checks:
   - the loop seam (pixel difference between the first and last frame)
   - whether the measured zoom curve matches the declared easing
   - dead time
   - whether the move lands on the hero frame (`beats.py` already finds it)
   - stray tooltips and black corners

   It outputs a pass/fail report and a contact sheet.
2. **Doors for motion.** Three film treatments of the same recording, side by side on a board: "Editorial calm", "Brisk demo", "Playful". Pick one, and it builds that one and logs why the others lost.
3. **Taste ledger.** The rejected-and-why table grows automatically. Pull it out into a shared TASTE.md that clean-site reads too.
4. **A verb name.** Use a command that is also the action, e.g. `/reel`, plus an enemy line: *"Screen recordings that move like they were designed, not zoomed."*

### Durability check on the flagship (7 tests)
| Test | Pass? |
|---|---|
| Delete: beats the bare model | ✅ The model can't render or time video frames without the skill |
| Wikipedia: content isn't public knowledge | ✅ Your motion rules |
| Eyes: observes the result | ✅ ffmpeg and frame analysis |
| Taste ledger | ✅ Already exists |
| Loop | ⏳ Upgrade 1 adds it |
| Wire: connects to real tools | ✅ Recordings and ffmpeg |
| Slim: little to cut after an upgrade | ✅ Mostly tools, not prose |

## Sequence (one shippable thing at a time)
| When | What | Why |
|---|---|---|
| **Week 0 (2–3 h)** | Storefront: hero loop at the top of the README (made with product-video), a designed social preview image, `npx skills add` support, PRs to 4 awesome lists | Both agents flagged this; with 0 stars, distribution is the cheapest win |
| **Weeks 1–2** | Verify loop in product-video, with a verb rename | This is what makes it last |
| **Weeks 3–4** | Doors for motion (3 treatments board) | The signature "aha" demo |
| **Week 5** | TASTE.md pulled out as a shared layer; clean-site reads it | "DESIGN.md's companion" launch line |
| **Later** | clean-site becomes a designer **portfolio audit CLI**; motion Steal Sheet; Score (sound) as product-video v2; Blind Taste Test as TASTE.md onboarding | In whatever order your energy goes |
| **Keep private** | Fresh Eyes (visual QA) | High daily use, low public pull |

---

# Part 2: Trend research report (Agent 1)

## 1. Executive summary
- **Design is one of the busiest areas of the skills ecosystem, and a few repos take most of the attention.** Five design-focused repos each have roughly 45k–145k stars: ui-ux-pro-max (143k), taste-skill (107k), impeccable (98k), emilkowalski/skills (52k) and hallmark (44k). On skills.sh, Anthropic's `frontend-design` has about 1.1M installs, which is top 15 of all skills. New supply has flattened at about 12k "design skill" repos per quarter, and most get almost no stars.
- **The leaders now work as tools that check their own output, not as prompt packs.** In the last few months all of the top three rebuilt around real-browser screenshots at several widths, deterministic "slop" detectors that run with no AI involved, curated private data (247 studied sites, 755 licensed photos, 1,400 classified logos), and loops where the agent fixes its own work and checks it again. taste-skill moved its seven style-only skills into a "classics" repo and removed a prompt workaround for agents cutting their output short.
- **Video and motion is the fastest-rising area next to Ashley's work.** hyperframes has 76k stars and 3 of the top 7 skills on skills.sh. brag got 19.8k stars in 4.5 months and video-shotcraft 15.5k in 3.4 months. Narrow motion tools appear weekly (reanimate: 453 stars in 2 days). **Turning a real screen recording into a designed product loop is still almost empty**; the closest repo has 4 stars.
- **Anti-slop is the most successful framing** (hallmark, unslop with 3.4k stars in ~2 days, impeccable, taste-skill, anti-slop with 7.7k). The catch is that slop changes with each model. impeccable's README now describes the new default as "cream page, thin serif, italic accent, pill buttons." Detectors only stay useful if someone keeps updating them.
- **Skills that only repeat what the model already knows are fading:** generic heuristics, WCAG checklists, style prompts, "act as a senior designer" personas. brag shipped `/brag-slim`, "rebuilt lean for Opus 5.5". It dropped the heavy tooling and kept the creative rules, so scaffolding the model no longer needs can also go stale. What lasts is proprietary taste plus checking against something real.
- **The big platforms are moving in.** Figma's official Claude Code plugin ships skills. Anthropic's knowledge-work plugins cover generic critique, accessibility, UX copy and research synthesis. Claude Design (April 2026) and Claude Motion (October 2026 beta, Team/Enterprise only) launched. Generic designer skills are getting harder to stand out with.
- **For Ashley:** `product-video` is the strongest bet: a hot area with little direct competition, and it already has scripts and written-down taste. `clean-site` competes with 40k–140k-star incumbents and needs a narrower position. The repo has 0 stars and no demo media, so distribution and proof are the most urgent fixes.

## 2. Landscape map
Metrics come from the GitHub search API on 2026-10-31. Velocity = stars ÷ months since the repo was created (minimum 0.5).

### A. Design-to-code / frontend look and feel ("anti-slop"), the most crowded category
| Repo | Stars | Forks | Created | Last push | Stars/mo |
|---|---|---|---|---|---|
| nextlevelbuilder/ui-ux-pro-max-skill | 143,411 | 15,185 | 2025-11-30 | 2026-10-31 | 13,031 |
| Leonxlnx/taste-skill | 107,016 | 7,242 | 2026-02-19 | 2026-10-31 | 12,825 |
| pbakaus/impeccable | 98,230 | 5,792 | 2025-11-16 | 2026-10-31 | 8,568 |
| Nutlope/hallmark (Together AI) | 43,897 | 2,310 | 2026-04-27 | 2026-10-29 | 7,146 |
| alchaincyf/huashu-design | 28,310 | 3,066 | 2026-04-19 | 2026-10-30 | 4,419 |
| miqdadbadjuber/anti-slop | 7,761 | 529 | 2026-08-07 | 2026-10-28 | 2,779 |
| heydamir/unslop | 3,400 | 169 | 2026-10-29 | 2026-10-29 | about 1,700 per day |
| oil-oil/oil-ui | 2,554 | 142 | 2026-09-30 | 2026-10-30 | 2,508 |
| superdesigndev/superdesign-skill | 927 | 70 | 2026-01-21 | 2026-08-21 | 100 |

The reference point is anthropics/skills `frontend-design`: 71 lines, about 1.5k words, roughly 1.1M installs.

### B. DESIGN.md files, design systems and tokens
| Repo | Stars | Created | Stars/mo | Note |
|---|---|---|---|---|
| VoltAgent/awesome-design-md | 124,857 | 2026-03-31 | 17,760 | Brand DESIGN.md files ready to drop in |
| google-labs-code/design.md | 28,676 | 2026-04-10 | 4,279 | Format spec |
| google-labs-code/stitch-skills | 8,649 | 2026-01-16 | 914 | |
| Manavarya09/design-extract | 4,437 | 2026-04-15 | 679 | Extracts tokens from a URL |
| plugin87/ux-ui-agent-skills | 3,066 | 2026-03-16 | 408 | |
| dominikmartn/hue | 857 | 2026-04-12 | 129 | |
| murphytrueman/design-system-ops | 212 | 2026-03-09 | 27 | |
| redongreen/uSpec | 249 | 2026-01-23 | 27 | |

### C. Figma and other design-tool bridges (most stars go to MCP servers)
| Repo | Stars | Created | Stars/mo |
|---|---|---|---|
| GLips/Figma-Context-MCP | 16,130 | 2025-02-13 | 786 |
| grab/cursor-talk-to-figma-mcp | 7,078 | 2025-03-16 | 363 |
| southleft/figma-console-mcp | 2,635 | 2025-10-05 | 205 |
| figma/mcp-server-guide (official skills) | 2,137 | 2025-08-05 | 144 |
| referodesign/refero_skill (150k real screens) | 333 | 2026-02-05 | 38 |

The design-category plugins in Anthropic's official marketplace (315 plugins) are almost all from vendors: figma, canva, adobe-for-creativity, hyperframes, runway-api, superdesign, ui-theme-designer.

### D. Motion, video and screen recordings (the fastest-growing area)
| Repo | Stars | Created | Stars/mo |
|---|---|---|---|
| heygen-com/hyperframes | 76,555 | 2026-03-10 | 9,916 |
| emilkowalski/skills (mostly animation) | 52,429 | 2026-03-16 | 6,969 |
| latent-spaces/brag (project → launch video) | 19,781 | 2026-06-16 | 4,395 |
| Vincentwei1021/video-shotcraft | 15,477 | 2026-07-19 | 4,530 |
| remotion-dev/skills | 5,978 | 2026-01-19 | 638 |
| oil-oil/oil-motion | 2,751 | 2026-08-07 | 985 |
| echris6/motion-video-kit (critic loop) | 1,314 | 2026-09-27 | 1,176 |
| howseen-ai/claude-motion-design | 743 | 2026-09-27 | 665 |
| NiazMorshed2007/reanimate (record → rebuild → compare) | 453 | 2026-10-29 | 2 days old |
| Bomx/super-video-maker-skill | 329 | 2026-05-17 | 60 |
| Malik1942/product-film (recording → film) | 4 | 2026-08-05 | 1 |

### E. Visual assets and brand
| Repo | Stars | Stars/mo |
|---|---|---|
| ParthJadhav/app-store-screenshots | 7,749 | 991 |
| kaankiziltug/logo-design-skill (1,400-logo library + tests) | 5,602 | 4,872 |
| JimLiu/baoyu-design | 5,665 | 1,181 |
| arnabbagxd/Brand-building-skills | 813 | — |

### F. Accessibility: clearly needed, very few stars
meodai/skill.color-expert has 631 stars. a11y-specialist-skills has 61. born-accessible-ui (a Playwright + axe checking loop) has 12. In practice, accessibility lives *inside* the big skills: impeccable `audit`, hallmark's "Floor" gates, and plugin87's WCAG sections.

### G. UX writing, research synthesis and critique: the least supply
content-designer/ux-writing-skill has 249 stars. Gesso-Build/skills (73 deterministic critique checks) has 93. Anthropic's knowledge-work-plugins (34k) already ship critique, ux-copy, research-synthesis and accessibility-review skills.

### H. Collections and "awesome" lists
bergside/awesome-design-skills has 3.4k stars, Owl-Listener/designer-skills 3.2k, zhuyansen/awesome-claude-video-skills 1.4k (new), and Claude-Code-Frontend-Design-Toolkit 1.3k.

## 3. (a) What is getting traction now
1. **Anti-slop systems that check themselves** (taste-skill, impeccable, hallmark, ui-ux-pro-max). They have the four highest velocities, at 7k–13k stars a month. They name a pain everyone can see, show before/after images on the first screen, and now check their work in a real browser. impeccable ships 62 deterministic rules, a CLI, a Chrome extension, a CI mode and an edit hook.
2. **Agent-native video and motion** (hyperframes, brag, shotcraft, emilkowalski). A video is the output people share most, so every run is an ad. The video is drawn in code from the user's own screens. Every successful repo has a public gallery.
3. **Taste from a named expert** (emilkowalski/skills, 52k): a famous person, very narrow skills, and opinions a model would not reach by default.
4. **Shareable design context (DESIGN.md)**: awesome-design-md has 125k stars, the fastest velocity in the set. This is about data and format, not instructions.
5. **Narrow deliverable tools with built-in references** (logo-design-skill, app-store-screenshots): a reference library plus Python tests on the output.
6. **Figma MCP bridges**: steady, older stars. The value is the integration, and Figma's own plugin now covers the basics.

## 4. (b) What will get traction next
1. **Verification loops for motion and video.** reanimate records the reference, rebuilds it and compares timing, easing and pixels. Motion is becoming measurable, and almost nobody checks it with scripts yet.
2. **Real recordings as input (the gap).** Promo generators build footage from screenshots or code. Turning a real screen recording into a polished loop is the work Screen Studio does as a commercial product. As a skill, it has almost no supply. Claude Motion is Team/Enterprise only and, per secondary sources, does not take recordings.
3. **Human taste choices built into the flow** (oil-ui, taste-skill, hallmark, impeccable `live`): pickers that hand the taste decision back to a person.
4. **Hooks, CI and standalone CLIs.** Design quality is becoming something that blocks a release.
5. **Curated private references delivered as MCP or data** (Refero, Mobbin, logo libraries, site studies).
6. **Cross-agent distribution.** `npx skills add` is now the default installer. Install friction is the most-commented issue in the big repos.
7. **Risky to build:** generic Figma, critique, UX copy and research skills. Figma, Anthropic, Canva and Adobe are filling these spots.

## 5. (c) What is declining as models improve
**Evidence:**
- Anthropic's guidance: "Claude is already very smart. Only add context Claude doesn't already have."
- taste-skill v2 moved its style-only skills to a "classics" repo.
- brag shipped `/brag-slim`, dropping its scaffolding and keeping its taste rules.
- Tessl's evaluation found some skills flipped from helping to hurting after a model upgrade.
- The look of slop keeps changing.

**Likely to decline:**
- rewrites of public best practice (heuristics, WCAG, Material or Apple guidelines)
- persona prompts
- adjective checklists
- style-only prompt packs
- prompt workarounds for model weaknesses
- heavy setup code the model no longer needs

**Likely to last:**
- scripts that measure what the model can't see from text
- proprietary taste and data
- loops that check against an objective signal
- real integrations
- human choice points

### The durability test (score 0–1 on each; 4 or more means durable)
| # | Test | Question |
|---|---|---|
| 1 | Delete | Does output with the skill measurably beat output without it on 3 real tasks? |
| 2 | Wikipedia | Could the content be rebuilt from public docs or books? (Yes means it decays) |
| 3 | Eyes | Does it run something that observes the result? |
| 4 | Taste ledger | Does it hold judgments only you have, ideally with what failed and why? |
| 5 | Loop | Does it check, fix and check again, with a clear pass/fail rule? |
| 6 | Wire | Does it connect to a real tool or file the model can't otherwise reach? |
| 7 | Slim | After a model upgrade, could half of it be removed without losing quality? (Yes means trim it) |

## 6. What high-engagement repos have in common
- **Proof on the first screen**: before/after images, grids, a gallery site. Repos without media stay in the low hundreds of stars.
- **A one-line install for every agent**: `npx skills add`, a plugin marketplace, a Codex plugin.
- **A short name that is also the command**: `/unslop`, `/brag`, `/reanimate`.
- **An enemy and a promise**: "Stop shipping AI-slop UI."
- **Concrete numbers** that signal data: "62 rules", "1,400 logos".
- **A clear 5–8 step "how it works"**, naming the checking step.
- **One focused skill, or narrow skills from one person.** Big catalogs get stars but little install depth.
- **A public launch story** and a website.
- **A hosted version** for non-technical users.

## 7. Recommendations for UX-skills
1. **Make product-video the flagship, with a README that works as a demo**: raw recording vs finished loop at the top, a gallery, a verb command (`/reel`), and an enemy line.
2. **Add an automated check loop to product-video**: loop seam, easing match, dead time, hero-frame landing, stray tooltips. Output a pass/fail report and a contact sheet.
3. **Narrow clean-site to designer portfolios.** Package `audit.mjs` as `npx clean-site audit <url>` with a shareable HTML report. Keep the keep/drop specimen as the signature feature. Cut generic advice.
4. **Recheck every skill after each model release**: 3 eval tasks per skill, trim what stops helping, keep a "model notes" changelog. designer-to-builder is the most exposed.
5. **Widen distribution**: `npx skills add` support, PRs to awesome-claude-video-skills, awesome-design-skills, awesome-agent-skills and the community plugin marketplace, a "made with /reel" credit, and later a hosted page.

## 8. Method and limits
- **Data sources:** GitHub REST search via `gh` (about 40 queries), code-search counts, issue searches. Install counts come from skills.sh. Context comes from Anthropic docs, Tessl, and news and secondary guides.
- **Limits:**
  - Search caps at 1,000 results per query.
  - Code-search counts are noisy.
  - Stars are not usage, and some star and install numbers may be gamed.
  - There is no install data for plugin marketplaces.
  - Velocity is a lifetime average.
  - Claude Motion and Claude Design details come from secondary sources.
- **Observed vs inferred:** tables and counts are observed. Rankings and recommendations are inference.

**Sources:**
- [Anthropic skill authoring best practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices)
- [skills.sh](https://skills.sh)
- [Tessl: skills when the model gets smarter](https://tessl.io/blog/kimi-k26-agent-skills-evaluation)
- [Addy Osmani: Agentic skill decay](https://addyosmani.com/blog/agentic-skill-decay/)
- [BestHub: Why agent skills are doomed to become obsolete](https://www.besthub.dev/articles/why-agent-skills-are-doomed-to-become-obsolete-031a20745858)
- [UX Planet: testing 3 Claude Code design skills](https://uxplanet.org/ive-tested-3-popular-claude-code-skills-for-web-design-24b7866e05a7)
- [Figma help center: MCP and skills](https://help.figma.com/hc/en-us/articles/39166810751895)
- [MacRumors: Claude Design launch](https://www.macrumors.com/2026/04/17/anthropic-claude-design/)
- [eesel: Claude Motion overview](https://eesel.ai/blog/claude-motion)

---

# Part 3: Creative brainstorm (Agent 2)

## Workflow gaps found
1. **You ask for directions, then sort them by hand.** You often ask for 3 directions, compare them in chat, and the reasons a direction lost are never written down.
2. **Your taste lives in your head and in one-off tables.** Every project re-teaches the agent the same things: calm, editorial, no drifting "AI" motion, no harsh snaps, don't crop the product.
3. **References don't turn into rules.** You collect a lot and ask for audits of sites you admire, but nothing turns a reference into measured rules you can reuse.
4. **Labels get polished late.** Microcopy renames come in rounds near the end.
5. **You can't see what has shipped.** You keep asking whether something is merged and where the latest preview is.
6. **Motion is your signature, and sound is the open gap.** No demo-video skill decides what the music should do.
7. **Stories about your work are assembled by hand.** Case studies and review docs are pieced together from scattered PRs.

## 7 directions
| Direction | Effort | Feasibility | Engagement | Durability | Daily use | Fun |
|---|---|---|---|---|---|---|
| **A. Doors**: three live directions, one decision, logged | M–L (~3 wknds) | 4 | 5 | 5 | 5 | 5 |
| **B. TASTE.md**: every "no" becomes a rule | S (1 wknd) | 5 | 4 | 5 | 5 | 4 |
| **C. Steal Sheet**: measured teardown of any site | M (~2 wknds) | 4 | 5 | 3 | 3 | 4 |
| **D. Fresh Eyes**: every width and state, automatically | M | 4 | 2 | 4 | 5 | 2 |
| **E. Field Notes**: a case study from build history | M | 4 | 3 | 3 | 2 | 4 |
| **F. Score**: sound direction for product loops | L | 2 | 4 | 3 | 1 | 5 |
| **G. Blind Taste Test**: a Wrapped-style taste profile | M | 4 | 5 | 3 | 1 (3 as onboarding) | 5 |

**Key details:**
- **A. Doors**
  - *Demo:* three doors swing open onto live variants, all reflow to phone width together, you click one and it opens into the real site.
  - *Risks:* variants drifting toward the same design (fix with set axes of difference), keeping variants apart, token cost.
  - *First slice:* a static board of three screenshots at three widths, with a Pick button.
- **B. TASTE.md**: each entry is *Tried / Feedback / Fix / Evidence*. A global file plus per-project overrides, a weekly `/taste review`, and a shareable taste card. Launch line: "AGENTS.md, but for taste."
- **C. Steal Sheet**: extend `audit.mjs` to capture the type scale, spacing rhythm, palette and motion timings (via frame diffs). Output a teardown poster plus tokens.json plus "3 rules worth stealing."
- **D. Fresh Eyes** (flag: high daily use, low public engagement): keep it internal. Ship only the status-line piece.
- **F. Score** (flag: strong demo, low daily use): ship it as a v2 module of product-video.
- **G. Blind Taste Test** (flag: viral spike, low daily use): launch it as onboarding for TASTE.md.

## Launch playbook
- **README:**
  1. hero loop
  2. one-sentence promise
  3. 2-command install
  4. how it works in 3 frames
  5. before/after gallery
  6. why it's different
  7. a real rejected-and-why table
  8. eval results as proof
  9. cross-agent support
  10. roadmap and good first issues
  11. a Chinese README
- **Repo hygiene:** a designed social preview, topics, releases, Discussions.
- **Channels:**
  - X and Threads native video
  - LinkedIn ("a designer, not an engineer")
  - 小红书 and 即刻
  - r/ClaudeAI, r/UXDesign
  - awesome lists
  - a UX Collective essay
  - a Figma Community file
  - Show HN
- **Rhythm:** launch Tuesday to Thursday mornings PT, answer issues within 72 hours, and post one series item a week.

> "The details are not the details. They make the design." (Charles Eames)
