# AI team-activity playtest prototypes

17 single-file HTML prototypes of AI-powered team activities, designed for **7 players, a 30-minute session, and teammates meeting for the first time**.

**Start here:** open `prototypes/index.html` in a browser. It links all 17 with a quick scorecard (simulated length, first-meeting risk). Every file works offline: no backend, no API keys, no CDNs, system fonts only.

## Each prototype has two modes

| Mode | What it does |
|---|---|
| **▶ Simulate with synthetic players** | Auto-plays a full session with 7 scripted personas (Maya the chaotic, Dev the deadpan, Priya the wholesome, Leo the overachiever, Sam the quiet one, Zoe the punster, Omar the storyteller). A timestamped transcript shows who did what, and when. The default 25× speed plays a 30-minute session in about a minute; 10× and 60× are also available. |
| **🎤 Host mode** | You click through it as the facilitator. You can rename the 7 seats to real teammates, and 🎲 buttons fill in sample answers so you can test fast. |

Both modes end with a **⏱ Pacing report**: planned vs. actual time per phase, where time leaked, a verdict against the 30-minute slot, and **📝 facilitator notes** (an honest assessment, a suggested cut, and a risk note for first-time teams).

Where the real game would call an image, video or music API, a **placeholder card** shows the exact prompt that would be sent. An HTML comment marks the plug-in point.

## The 17 prototypes

| # | File | Simulated length |
|---|---|---|
| 01 | `01-exquisite-corpse.html` | ~16 min |
| 02 | `02-secret-angel-reveal.html` | ~30 min |
| 03 | `03-prompt-dj.html` | ~16 min |
| 04 | `04-secret-angel-gallery.html` | ~19½ min |
| 05 | `05-describe-your-angel.html` | ~18 min |
| 06 | `06-lights-camera-ai.html` | ~30½ min |
| 07 | `07-copilot-or-human.html` | ~9 min |
| 08 | `08-movie-mastermind.html` | ~9 min |
| 09 | `09-emotion-aware-santa.html` | ~6 min (a 10-min module) |
| 10 | `10-recognition-songs.html` | ~14½ min |
| 11 | `11-two-truths-and-an-ai.html` | ~22½ min |
| 12 | `12-ai-pictionary.html` | ~14 min |
| 13 | `13-prompt-telephone.html` | ~18 min |
| 14 | `14-ship-it-challenge.html` | ~29½ min |
| 15 | `15-ai-roast-of-the-team.html` | ~11 min |
| 16 | `16-discussion-deck.html` | ~20–24 min |
| 17 | `17-team-origin-story.html` (frontrunner) | ~24½ min |

Lengths are averages of 3 simulated runs, including a 6–14s transition cost at every phase change.

## How it's built

```
src/core.css         shared styles (light + dark, mobile-friendly)
src/core.js          shared engine: session clock, phases, round timers, transcript,
                     simulated time, vote boards, placeholder AI cards, pacing report
src/games/NN-*.js    one file per game: screens, host actions, simulation script, notes
src/index.html       the index page
build.py             inlines core + game into prototypes/NN-*.html (one self-contained file each)
```

Edit files under `src/`, then rebuild:

```
python3 build.py
```

### Plugging in a real AI API later

Every generated result goes through `Core.genCard()` (renders the placeholder) and `Core.generate()` (reveals it). Replace `Core.generate()` in `src/core.js` with a real API call that uses the card's prompt, then rebuild.
