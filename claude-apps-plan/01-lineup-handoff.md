# Handoff 01: Lineup → a Claude / ChatGPT app

Paste this whole file into Claude Code, opened in the **lineup** repo
(`ashlithos/lineup`; the package is named `penciled`).

---

## Your job

Add an **MCP server with MCP Apps widgets** to this existing Next.js app, at
`/mcp`, so Ashley can ask Claude about her bookings and see Lineup's own
widgets inline. **Don't rebuild, move or restyle the web app.** The `/mcp`
route is a second door into the same data and the same rules.

Work in the phases below. **Ship and verify each phase before starting the
next**, and stop for Ashley at each gate.

## Read first

- `AGENTS.md`, including how to report back to Ashley (she's not an
  engineer and reads on her phone). Follow it exactly.
- `node_modules/next/dist/docs/`: this is Next.js 16.2.9, which has breaking
  changes (for example, `middleware.ts` is now `proxy.ts`, and `params` and
  `cookies()` are async).
- The MCP Apps docs. Check them at build time rather than trusting memory,
  because the APIs are new:
  - https://github.com/modelcontextprotocol/ext-apps (README, `examples/`)
  - spec `specification/2026-01-26/apps.mdx` in that repo
  - If a `build-mcp-app` or `claude-api` skill is available, load it.

## What's already here (verified)

| Thing | Where | Notes |
|---|---|---|
| Data | Supabase table `penciled_bookings` | Accessed only server-side via the service-role key (`lib/supabase.ts`, `getSupabase()`) |
| Row ↔ model | `rowToBooking`, `bookingToRow` in `lib/supabase.ts` | **Always write through `bookingToRow`.** It strips time zones on purpose (`wallClock`), because the app stores times as wall clock. A raw insert shifts bookings by their UTC offset |
| Types | `lib/types.ts` | `Booking`, statuses `upcoming · tobook · cancelled · done · plan`, `CATEGORY_META` emoji |
| Cancel-by logic | `lib/urgency.ts` | `getUrgency` (urgent ≤48h, soon ≤7d, calm, locked, passed), `needsAttention`, `countdown` |
| Plan checks | `lib/planCheck.ts` | `runRules(bookings)` → `Finding[]`, deterministic, "never wrong". `sortFindings` |
| To-book logic | `lib/handoff.ts` | `bookUrgency`, `bookByLine`, `needsBooking` |
| Views to mirror | `lib/trips.ts` `buildTrips`, `lib/agenda.ts` `tripDays`, `lib/freetime.ts` `buildWeek`, `lib/density.ts` `buildDensity` | These drive the itinerary, timetable (`WeekGrid`) and year view (`YearDensity`) |
| Times | `lib/localtime.ts` | `nowStamp`, `localStamp`. Use these, never `Date.now()` comparisons on raw ISO |
| Auth | **None** | Single-user by PRD design. See security notes |

## Security notes (do these in Phase 0)

1. `/mcp` **must require an OAuth access token** on every request. No token,
   or a wrong user → 401 with a `WWW-Authenticate` header that points to the
   protected-resource metadata.
2. Today `GET /api/bookings` has no auth and returns every booking, and
   `/api/upload` writes to a **public** `trip-photos` bucket. Don't copy that
   pattern into `/mcp`. Report it to Ashley as a separate, recommended fix.
   Don't change the web app's auth without her go-ahead.
3. `/api/cron/reminders` only checks `CRON_SECRET` *if it's set*. Ask Ashley
   to confirm it's set in Vercel.
4. Never return the service-role key, Gmail tokens (`penciled_config`) or
   raw rows to the model. Tools return the shaped `Booking` fields only.

## Phase 0: lock the door

**Auth provider: Supabase Auth's OAuth 2.1 server**
(https://supabase.com/docs/guides/auth/oauth-server/mcp-authentication).

1. Ask Ashley one thing first: is Lineup's `SUPABASE_URL` the **same
   project** as Slowcart's? If yes, use that project's Auth, so one login
   covers both apps later. If not, enable Auth on Lineup's project.
2. Enable the OAuth 2.1 server and dynamic client registration in the
   Supabase dashboard (Authentication → OAuth Server). Write the exact
   click path for Ashley as a numbered list. She does the clicks.
3. Add the consent page the OAuth server redirects to (for example
   `app/oauth/consent/page.tsx`). It shows the client name and scopes, with
   Approve and Deny buttons. Sign-in on that page can use Google or a magic
   link.
4. **Allowlist one user.** Read the allowed email from an env var
   (`MCP_OWNER_EMAIL`), and reject any other identity even with a valid
   token. Lineup is single-user, so a valid Supabase user isn't enough.
5. Serve the protected-resource metadata
   (`/.well-known/oauth-protected-resource`) that points at the Supabase
   authorization server.
6. Verify the token's signature, issuer, audience and expiry on every `/mcp`
   request.

**Gate:** with no token, `curl https://<preview-url>/mcp` returns 401. Adding
the connector in Claude opens the consent screen, and after approval the tool
list loads.

## Phase 1: read-only tools and one widget

Use the official MCP TypeScript SDK and the MCP Apps server helpers from
`@modelcontextprotocol/ext-apps/server`, served from a Next.js route handler
at `app/mcp/route.ts` (streamable HTTP). If Vercel's `mcp-handler` package
supports the current SDK version, it's fine to use. Check versions first.

### Tools (all read-only, all model-visible)

| Tool | Input | Returns | Built on |
|---|---|---|---|
| `list_cancel_deadlines` | `{ withinDays?: number }` | Bookings where `needsAttention` is true, sorted by `cancelBy`, each with `urgency`, `countdown`, `amount`, `cancelUrl` | `lib/urgency.ts` |
| `list_upcoming` | `{ from?, to?, category? }` | Upcoming bookings sorted by `eventAt`, grouped by trip | `buildTrips`, `collapseFlights` |
| `check_plan` | `{ tripName? }` | `sortFindings(runRules(...))`. **Rules only, no AI pass** | `lib/planCheck.ts` |
| `list_to_book` | `{}` | `tobook` items with `bookByLine` / `bookUrgency` | `lib/handoff.ts` |

- Describe each tool in plain words, so Claude knows when to use it (for
  example *"Use when the user asks what they can still cancel for free"*).
- Exclude `isDemo` rows and `cancelled` / `done` rows unless asked.
- Return both `structuredContent` (for the widget) and a short text summary
  (for hosts that don't render widgets).

### The one widget: cancel-by radar

- Resource `ui://lineup/radar.html`, MIME `text/html;profile=mcp-app`.
  `list_cancel_deadlines` links to it via `_meta.ui.resourceUri`.
- Shows each booking as a row with a countdown (red ≤48h, amber ≤7d, calm
  beyond), the amount at stake, and a **Cancel at vendor** link
  (`cancelUrl`). Copy tone from the PRD: *"3h left to cancel free, then you
  lose $240"*.
- Build it as **one self-contained HTML file** (inline CSS and JS, bundled
  with Vite single-file or similar), using the App class from
  `@modelcontextprotocol/ext-apps`. Reuse Lineup's colors from
  `app/globals.css`. Respect the host's light and dark theme.
- **No buttons that write data yet.** Links out are fine. Declare any
  external origins in `_meta.ui.csp`.
- Mobile first: it must read well at 375px wide.

**Gate:** Ashley adds the connector and asks *"what can I still cancel for
free?"* on Claude **web, desktop and her phone**, and reports which ones render
the radar. **Whether widgets from a custom connector render on Claude mobile
on her plan is unverified. This phase exists to find out.** If mobile shows
text only, carry on: the tools still work, and widgets just won't render on
mobile.

## Phase 2: writes, with a confirm

| Tool | Visibility | Notes |
|---|---|---|
| `add_booking` | model + app | Takes **already-extracted fields** (title, category, eventAt, cancelBy, amount, …). Claude extracts them from the pasted email in chat, so **don't call `/api/extract`**, which saves the Anthropic cost. Write through `bookingToRow`. Return the saved booking and render a confirm card |
| `keep_booking` | app only | Sets `kept: true` (the "Keep" button) |
| `mark_cancelled` | app only | Sets `status: "cancelled"` after Ashley cancels at the vendor |
| `update_booking` | model + app | Partial update. Never touches `status` to `done` silently |

- Mark write tools with the `destructiveHint` / `readOnlyHint` annotations
  correctly, so hosts ask before calling them.
- Check for duplicates before `add_booking` inserts, using the existing
  logic: the same-confirmation-code rule in `lib/planCheck.ts` and
  `sameOuting` in `lib/samePlace.ts`. Return *"looks like a duplicate of X"*
  instead of inserting twice.

**Gate:** Ashley pastes a real confirmation email in chat, the booking appears
in the Lineup web app with the right times (check the time zone), and Keep
from the radar sticks.

## Phase 3: the other views (only after Ashley says go)

Widgets for **list · cards · timetable · year view**, one at a time, reusing
`buildTrips`, `tripDays`, `buildWeek` and `buildDensity`. Then test the same
server in ChatGPT developer mode, where the same `ui://` contract applies.

## Definition of done, each phase

- `npm run lint` and `npm run build` pass.
- Tested against a Vercel **preview** deployment before production.
- No secrets in tool output or logs.
- A report to Ashley in the `AGENTS.md` format: what shipped, then a numbered
  list of what she needs to do, and one line on anything unverified.
