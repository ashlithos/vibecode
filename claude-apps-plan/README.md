# Lineup, Myra and Slowcart inside Claude and ChatGPT

**Last updated:** 2026-10-17 · **Owner:** Ashley

## The idea in one line

Don't rebuild or merge anything. Each app gets a **second door**: a `/mcp`
endpoint added to the Next.js app that already runs on Vercel. Through it,
Claude (and later ChatGPT) can read and write your existing data and show
your own small screens, called widgets, right inside the chat.

> Analogy: your web app is the shop's front door. `/mcp` is a service window
> at the side of the same shop, with the same stock and the same till. Claude
> walks up to the window instead of coming in, and you hand it a little menu
> card (the widget) to show you.

## Why this works now

**MCP Apps** is a shared standard that lets an app's tools return interactive
HTML inside the chat. Claude supports it (web, desktop, mobile) and ChatGPT
uses the same contract, so one widget can serve both. The pieces are:

| Piece | What it is | Example |
|---|---|---|
| Tool | A function Claude can call | `list_cancel_deadlines` |
| UI resource | A small HTML page with a `ui://` address | `ui://lineup/radar.html` |
| Link | The tool's `_meta.ui.resourceUri` points at that page | the radar renders when the tool runs |
| App-only tool | A tool only the widget can call (`visibility: ["app"]`) | the "Keep" button on a card |

## What each app becomes

| App | What it keeps | Chat-side widgets | First tools |
|---|---|---|---|
| **Lineup** (package name `penciled`) | The rules that are plain code "so they're never wrong": `lib/urgency.ts`, `lib/planCheck.ts`, `lib/handoff.ts` | Cancel-by radar · list / cards / timetable / year view | `list_cancel_deadlines`, `list_upcoming`, `check_plan` |
| **Myra** | The visual board, plus the best-month and companion logic (`lib/best-time.ts`, `travel-matrix`) | Bucket board with the same four views (card · list · map · calendar) | `list_bucket`, `best_time_for`, `add_experience` |
| **Slowcart** | Price-drop tracking, sale prediction (`lib/predict-sale.ts`), the under-$10/month rule | Parking lot · "Should I buy?" card | `list_wanting`, `should_i_buy`, `add_item_from_url` |

**Cost win:** inside the chat, Claude itself reads your confirmation email
or product page and passes clean fields to the tool. The apps' own Anthropic
calls (`/api/extract`, `/api/ai/autofill`) aren't needed on that path, so
the chat door adds roughly $0 to your API bill.

## Order and phases

Lineup goes first because its logic is the most self-contained. Myra and
Slowcart reuse whatever Lineup proves.

| Phase | What ships | Gate to move on |
|---|---|---|
| **0 · Lock the door** | Sign-in on `/mcp`, so only you can reach your data | Claude asks you to log in when you add the connector, and a stranger's request gets a 401 |
| **1 · Look, don't touch** | Read-only tools plus **one** widget (Lineup's cancel-by radar) | The radar renders on Claude **web, desktop and your phone** |
| **2 · Write, with a confirm** | Add / keep / cancel / snooze, each confirmed in the widget | You've added a booking from chat and it shows up in the web app |
| **3 · Fill out** | Other views, Myra, Slowcart, then the ChatGPT check | Each app is used from chat for a week |

**Phase 1 tests the one thing that can't be checked from here:** whether
widgets from *your own* connector render on Claude mobile on your plan. If
they don't, the tools still work as plain text answers, and widgets wait for
desktop.

## Sign-in: one login for all three

Claude's custom connectors sign in with OAuth (the "Sign in with…" pop-up).
**Recommendation:** use **Supabase Auth's OAuth 2.1 server** as the single
login for all three apps.

- **Slowcart** already uses Supabase Auth with per-user row security, so this
  is close to free.
- **Lineup** stores bookings in Supabase but has no login. Its table is named
  `penciled_bookings` so it could share a project. If it shares Slowcart's
  project, the same login covers it.
- **Myra** uses Turso and Google sign-in, so it would trust the Supabase
  token and map your email to your Myra account.

## Things the code review turned up

1. **Lineup's data is reachable by anyone who has the URL today.**
   `app/api/bookings/route.ts` has no login check and uses the service-role
   key, so `GET /api/bookings` returns every booking. Trip photos are also
   written to a *public* storage bucket (`app/api/upload/route.ts`). That was
   fine under the "just me, no auth" PRD, but `/mcp` must not copy it.
   Phase 0 fixes this for `/mcp`. Whether to also lock the web app is your
   call; I recommend yes.
2. **Lineup's daily reminder cron is open when `CRON_SECRET` isn't set**
   (`app/api/cron/reminders/route.ts`). Worth confirming it's set in Vercel.
3. **Myra treats every preview deploy as signed in** (`src/lib/get-user.ts`
   returns a "dev" user when `VERCEL_ENV === "preview"`). Fine for testing,
   but the `/mcp` door must never use that shortcut.
4. **Slowcart's photos are private, with signed URLs that expire after one
   hour.** Widgets have to allow your Supabase storage domain in their
   security settings, or the images show up blank.
5. **Photo capture stays in the web apps for now.** A chat can't reliably
   hand an image file to a tool yet. Pasted text and URLs work well, and
   Claude reads screenshots for you and passes the fields along.

## Files in this folder

| File | Who it's for |
|---|---|
| `README.md` | You. This plan |
| `01-lineup-handoff.md` | Paste into Claude Code inside the **lineup** repo |
| `02-myra-handoff.md` | Paste into Claude Code inside the **myra** repo, after Lineup's Phase 1 |
| `03-slowcart-handoff.md` | Paste into Claude Code inside the **slowcart** repo, after Lineup's Phase 1 |

## What you do next

1. Open Claude Code in the **lineup** repo.
2. Paste in the whole of `01-lineup-handoff.md`.
3. When it asks, check in Supabase whether Lineup and Slowcart share a
   project (Dashboard → the project URL in each app's Vercel env vars).
4. After Phase 1 deploys, add the connector in Claude (Settings →
   Connectors → Add custom connector → `https://<lineup-url>/mcp`). Then ask
   *"what can I still cancel for free?"* on your laptop **and** your phone.

## Sources

- [MCP Apps README](https://github.com/modelcontextprotocol/ext-apps)
- [MCP Apps spec (2026-01-26)](https://github.com/modelcontextprotocol/ext-apps/blob/main/specification/2026-01-26/apps.mdx)
- [Interactive connectors and MCP Apps (Claude)](https://claude.com/blog/interactive-tools-in-claude)
- [Supabase OAuth 2.1 for MCP](https://supabase.com/docs/guides/auth/oauth-server/mcp-authentication)
- [OpenAI Apps SDK guide](https://thenewstack.io/openais-apps-sdk-a-developers-guide-to-getting-started/)
