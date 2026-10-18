# Handoff 03: Slowcart → a Claude / ChatGPT app

Paste this whole file into Claude Code, opened in the **slowcart** repo
(`ashlithos/slowcart`). **Start only after Lineup's Phase 1 has passed its
gate.** Reuse its auth setup, route shape and widget bundling.

---

## Your job

Add an **MCP server with MCP Apps widgets** at `/mcp` to this existing
Next.js app. Slowcart is *"a wishlist that helps you wait"*, and the chat door
should feel the same: a **parking lot** of things Ashley wants, and a
**"Should I buy?"** card that weighs the price, any drop, and the next
predicted sale. **Don't rebuild or restyle the web app.**

**House rule: total Anthropic spend stays under $10/month** (see `JOURNEY.md`
and `lib/ai-usage.ts`). The chat door should **lower** spend, not add to it.

Work in phases. Ship and verify each one, and stop for Ashley at each gate.

## Read first

- `AGENTS.md`, `BUILD_NOTES.md`, `JOURNEY.md`. Use Lineup's way of reporting
  back: lead with what you did, then a numbered list of what Ashley needs to
  do, and one line on anything you couldn't verify. She's not an engineer and
  reads on her phone.
- `node_modules/next/dist/docs/`. This is **Next 16.2.4**: `proxy.ts`
  replaces middleware. Make sure `proxy.ts` doesn't redirect `/mcp` or
  `/.well-known/*` to `/login`.
- MCP Apps: https://github.com/modelcontextprotocol/ext-apps and its spec
  `specification/2026-01-26/apps.mdx`. Look at Lineup's `app/mcp/` once it
  exists.

## What's already here (verified)

| Thing | Where | Notes |
|---|---|---|
| Auth | **Supabase Auth** (Google + magic link), `lib/auth.ts` `getCurrentUser` | Real per-user accounts. Friends may use it too |
| Data | `public.items`, `public.item_photos`, `shared_lists`, `url_extraction_cache`, `ai_usage_daily` | **RLS: users only see their own rows.** Types in `lib/supabase/types.ts` |
| Statuses | `wanting · bought` shown (`lib/items.ts`); `passed`/`archived` are legacy | To say no, the user deletes |
| Price fields | `price`, `sale_price`, `currency`, `product_url`, `last_price_check_at`, `price_dropped_at` | The nightly cron `/api/cron/refresh-prices` keeps them fresh |
| Sale prediction | `lib/predict-sale.ts` `predictNextSale(brand)` | Bundled JSON, no API, about 1ms. Returns `saleName`, `nextStart`, `daysUntil`, `confidence` |
| Free URL path | `lib/price-sync.ts` `fetchStructuredProduct` / `extractStructuredProductFromHtml` | JSON-LD / OG meta, costs $0 |
| Paid paths | `/api/extract` (vision), the AI fallback in `/api/find-photos`, `lib/render-page.ts` (Browserbase) | **Don't call any of these from `/mcp`** |
| Photos | Private `item-photos` bucket. `lib/photo-url.ts` signs URLs (1h TTL) | Widgets need the Supabase storage origin in `_meta.ui.csp.resourceDomains` |
| Saving | `app/capture/actions.ts` `saveItem` (server action) | Reuse its insert logic, not the action itself |

## Security notes

1. `/mcp` requires an OAuth token on every request: 401 plus
   `WWW-Authenticate` without one.
2. **Prefer the user's own token over the service-role key.** Supabase OAuth
   2.1 access tokens are Supabase user JWTs, so create the Supabase client
   with the caller's token and **RLS does the scoping**. Use
   `createServiceClient` only where the existing code already needs it.
   This is also what makes the app safe for friends.
3. Signed photo URLs expire after an hour. Sign them at tool-call time, and
   never cache them in tool output that's reused later.

## Phase 0: lock the door

Turn on the **Supabase OAuth 2.1 server** on Slowcart's project
(Authentication → OAuth Server, with dynamic client registration). Write the
click path for Ashley as a numbered list. Add the consent page, and serve
`/.well-known/oauth-protected-resource`. If Lineup already shares this
project, **reuse its consent page and settings**, so there's one login.

Unlike Lineup, **don't allowlist a single email**. Any signed-in Slowcart
user may connect, and RLS limits them to their own items.

**Gate:** adding the connector in Claude shows the consent screen, a request
without a token gets a 401, and a second test account sees only its own
items.

## Phase 1: read-only tools and the parking lot

| Tool | Input | Returns | Built on |
|---|---|---|---|
| `list_wanting` | `{ category?, brand?, droppedOnly? }` | `wanting` items with primary photo (signed), price, sale price, **days parked** (now − `created_at`), and the "Just dropped" flag (`price_dropped_at` within 7 days) | `items` + `item_photos` |
| `should_i_buy` | `{ itemId }` | Price now vs list, the drop, `predictNextSale(brand)`, days parked, and when the price was last checked | `predict-sale.ts`, price fields |
| `whats_on_sale` | `{}` | Items with `sale_price` set or recently dropped | price fields |

**Widget 1: parking lot**, `ui://slowcart/lot.html`, linked from
`list_wanting`. A photo grid in Slowcart's look: warm off-white `#F5F4F1`,
ink `#0A0A0A`, a single yellow accent `#FFD029` (`lib/brand-colors.ts`).
Show a "Just dropped" badge and days parked.

**Widget 2: "Should I buy?" card**, `ui://slowcart/verdict.html`, linked from
`should_i_buy`. One item, one honest line, for example *"$128, down from
$168. Their Summer sale usually starts in about 12 days (high confidence).
You've parked it for 41 days."* Show the data. **Don't hard-code a
buy/wait verdict**; Claude gives its opinion in the chat text.

**Gate:** Ashley asks *"anything in my Slowcart on sale?"* and *"should I buy
the Vuori crops?"* on desktop and phone, and both widgets render with photos.

## Phase 2: adding from chat

| Tool | Visibility | Notes |
|---|---|---|
| `add_item_from_url` | model + app | Run the **free path only** (`fetchStructuredProduct`). Whatever it can't find (brand, name, category), **Claude passes in from the chat**: it can read the page or the user's description itself. No Anthropic call and no Browserbase, so **$0 per add**. Download the product image server-side into `item-photos/{user_id}/{item_id}/…`, as `saveItem` does |
| `add_item` | model + app | Fields only (brand, item, price, size, color, store, tags, note). For "I saw this in store". Photo optional, added later in the web app |
| `mark_bought` | app only | `status: "bought"`, with a confirm in the widget |
| `remove_item` | app only | Deletes, with a confirm, per Slowcart's "to say no, delete" rule |

- **Photo capture stays in the web app for now.** A chat can't yet
  reliably hand an image file to a tool. Say this plainly in the tool
  description, so Claude offers the web app link for photo capture.
- Run a duplicate check on `product_url` (or brand + name) before inserting.

**Gate:** Ashley pastes a product link in chat, the item appears in the web
gallery with photo and price, and `ai_usage_daily` doesn't move.

## Phase 3 (after Ashley says go)

Shared lists (`shared_lists`, `createShare` in `app/items/actions.ts`) as a
"share this lot" button, then the ChatGPT check.

## Definition of done, each phase

`npm run lint`, `npm run typecheck` and `npm run build` pass, it's tested on
a Vercel preview first, RLS is proven with a second account, no secrets or
long-lived URLs appear in output, and the report to Ashley follows the format
above.
