# Handoff 02: Myra → a Claude / ChatGPT app

Paste this whole file into Claude Code, opened in the **myra** repo
(`ashlithos/myra`; the package is named `travel-planner`).
**Start only after Lineup's Phase 1 has passed its gate.** Reuse what Lineup
proved: the auth setup, the route shape, and how widgets are built and bundled.

---

## Your job

Add an **MCP server with MCP Apps widgets** at `/mcp` to this existing
Next.js app, so Ashley can browse and add to her bucket list from Claude. The
headline is that adding something takes **one chat message**: *"add the
northern lights in Tromsø, partner trip, before 40"*. Claude fills in the
fields, and the board widget shows where it landed. **Don't rebuild or
restyle the web app.**

Work in phases. Ship and verify each one, and stop for Ashley at each gate.

## Read first

- `AGENTS.md`. This repo's copy doesn't have the "how to report back" section,
  so use Lineup's: lead with what you did, then a numbered list of what Ashley
  needs to do, and one line on anything you couldn't verify. She's not an
  engineer and reads on her phone.
- `node_modules/next/dist/docs/`. **This repo is on Next ^15.5 and React 18**,
  unlike Lineup and Slowcart (Next 16, React 19). Don't upgrade as part of
  this work. Check that the MCP SDK and `ext-apps` packages work on these
  versions, since widgets are bundled separately and don't need the app's
  React.
- MCP Apps: https://github.com/modelcontextprotocol/ext-apps and its spec
  `specification/2026-01-26/apps.mdx`. Look at the server's code in
  `lineup/app/mcp/` once it exists.

## What's already here (verified)

| Thing | Where | Notes |
|---|---|---|
| Data | Turso (libsql) through Drizzle, `src/db/index.ts`. Local dev uses `travel.db` via better-sqlite3 | Tables: `experiences`, `trips`, `trip_experiences`, `experience_photos`, `buddies`, `friend_places`, `affinities` (`src/db/schema.ts`) |
| Ownership | Every row has `userId` = **Google account ID** (`src/lib/auth.ts` `session.user.id`) | All queries filter by `userId`. Keep that in every tool |
| Auth (web) | NextAuth v5 beta, Google provider | `src/lib/get-user.ts` |
| Lists | comma-separated text columns: `idealSeasons`, `idealPartnerTypes`, `plannedMonths` | Use `parseCommaSeparated` / `toCommaSeparated` from `src/lib/utils.ts` |
| Best-time logic | `src/lib/best-time.ts` | `idealMonths`, `classifyMonths` → `ideal / shoulder / skip` per month. Pure, no API |
| Knowledge base | `src/lib/travel-knowledge.ts` `lookupTravelInfo` | Free, instant. Use before anything else |
| Companions | `buddies` + `affinities` (`take-me-there · interested · open`), shown in `src/components/travel-matrix.tsx` | This is the "who wants to go with me" logic |
| Views to mirror | `src/components/bucket-list-view.tsx` | `card · list · map · calendar`. Calendar uses `plannedMonths`. Map uses Leaflet with CARTO tiles |
| Photos | `experience_photos` (Unsplash URLs + photographer credit) | Widgets must allow the Unsplash image origin in CSP and **must show the credit** |

## Security notes

1. **`getUser()` returns a fake "dev" user on preview deployments**
   (`VERCEL_ENV === "preview"`) and in development. **`/mcp` must not call
   `getUser()`.** It does its own token check, so a preview URL never exposes
   Ashley's data.
2. `/api/travel/public/[userId]` is intentionally public (the friend ranking
   page). Leave it alone, and don't expose `userId` values in tool output.
3. `/mcp` requires an OAuth token on every request: 401 plus
   `WWW-Authenticate` without one.

## Phase 0: lock the door

Use the **same Supabase OAuth 2.1 authorization server** Lineup set up, so
Ashley approves one login for all her apps.

- Validate the Supabase-issued token (signature, issuer, audience, expiry).
- Myra's data is keyed by Google account ID, not Supabase user ID. Map
  identity like this: token email must equal `MCP_OWNER_EMAIL`, and that
  user's data is read with `userId = MCP_OWNER_USER_ID` (an env var Ashley
  sets once). Tell her exactly how to find her Google account ID. It's the
  `user_id` already on her rows in Turso, so you can look it up for her.
- Serve `/.well-known/oauth-protected-resource`.

**Gate:** adding the connector in Claude shows the same consent screen as
Lineup, and a request without a token gets a 401.

## Phase 1: read-only tools and the board widget

| Tool | Input | Returns | Built on |
|---|---|---|---|
| `list_bucket` | `{ status?, season?, partnerType?, locality?, month? }` | Experiences with photo, `bestMonths`, `classifyMonths` strip, `doByAge` | `src/app/api/experiences/route.ts` filters |
| `best_time_for` | `{ experienceId } \| { name }` | Month strip (ideal / shoulder / skip) plus a tip | `best-time.ts`, `lookupTravelInfo` |
| `who_wants_to_go` | `{ experienceId }` | Buddies grouped by affinity tier | `affinities` + `buddies` |
| `whats_good_in` | `{ month }` | Wishlist items that are ideal that month, plus anything already planned for it | `classifyMonths`, `plannedMonths` |

**Widget: bucket board**, `ui://myra/board.html`, linked from `list_bucket`.

- Starts in **card** view, with a toggle for **list** and **calendar**. Leave
  **map** for Phase 3, because it needs Leaflet plus tile-server CSP and the
  most testing.
- Matches the web app's look: Playfair Display headings, the `#D4D0C8`
  borders, and status badges from `src/components/status-badge.tsx`. Respect
  the host's light and dark theme.
- Shows Unsplash photos, with the photographer credit.
- Read-only in this phase.

**Gate:** Ashley asks *"what's on my bucket list for spring?"* and *"what's
good in December?"* on desktop and phone, and the board renders.

## Phase 2: adding in one message

| Tool | Visibility | Notes |
|---|---|---|
| `add_experience` | model + app | Takes the fields Claude has already worked out: name, city, country, seasons, partner types, `bestMonths`, `estimatedDays`, `doByAge`, locality. **Don't call `/api/ai/autofill`** (it runs `claude-sonnet-4-6` on Ashley's key). In chat, Claude does that work for free. Use `lookupTravelInfo` to fill gaps. Return the saved item and render it on the board |
| `plan_month` | app only | Adds or removes a month in `plannedMonths` (the calendar toggle) |
| `mark_visited` | model + app | `status: "visited"`. Confirm first |
| `set_affinity` | app only | A buddy's tier for an experience |

- Photos: offer an **app-only** `pick_photo` tool that reuses
  `/api/photos/search`'s Unsplash query, so Ashley picks from 9 thumbnails in
  the widget.
- Run a duplicate check on name + city before inserting.

**Gate:** Ashley adds an experience in one message from her phone, and it shows
in the web app with the right months and seasons.

## Phase 3 (after Ashley says go)

Map view in the widget (Leaflet; declare `*.basemaps.cartocdn.com` in
`resourceDomains`), trips (`trips` + `trip_experiences`), then the ChatGPT
check.

## Definition of done, each phase

`npm run lint` and `npm run build` pass, it's tested on a Vercel preview
first, no `userId` or secrets appear in tool output, and the report to Ashley
follows the format above.
