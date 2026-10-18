# Supabase cost audit — 2026-09-24

Org: **yaqihelloworld_experiment** (`nrrrtmiggiyqvpzjpkwz`) — plan **Pro**. This is the only org on the account.

## Projects

| Project | Ref | Region | Status | DB size | Auth users | Last real activity | Edge fns | Cron | Buckets |
|---|---|---|---|---|---|---|---|---|---|
| Personal Projects | `hctfopddfziadypwvfjd` | us-west-2 | ACTIVE | 12 MB | 2 (last sign-in Aug 25) | penciled_bookings write Sep 20; cravv_places Aug 31 | 0 | none | trip-photos, cravv-drinks (6 objects) |
| Slowcart | `iivgfzbliuaobcvvneqw` | us-east-2 | ACTIVE | 14 MB | 1 (last sign-in Aug 6) | items write Sep 18; AI usage last Aug 2 | 0 | none | item-photos (625 objects) |
| tendi | `xrlbehgpkytkmpeugicz` | us-east-1 | ACTIVE | 11 MB | 0 | 2 rows in `triages`, last Jun 22; 0 API requests in last 24h | 0 | none | triage-attachments (1 object) |
| yaqihelloworld-sketch's Project | `faziktlixfupueilonol` | us-west-2 | INACTIVE (paused) | — | — | — | — | — | — |

Tables:
- Personal Projects: `penciled_bookings` (67), `cravv_places` (56), `goals` (3), `cravv_profiles` (2), `penciled_config` (2), `cravv_shares` (1), `cards` (0)
- Slowcart: `item_photos` (611), `items` (388), `ai_usage_daily` (14), `wishlist_items` (0), `shared_lists` (0)
- tendi: `triages` (2)

**lineup:** confirmed from `ashlithos/lineup/supabase/schema.sql`. It's the `penciled_bookings` table in Personal Projects,
the most active table on the account (last write Sep 20).

## The math (confirmed)

Per Supabase docs, each active project costs ~$10/mo of Micro compute, Pro includes a $10 compute credit, paused projects cost $0.

```
$25  Pro plan
$30  3 active projects × ~$10 (Personal Projects, Slowcart, tendi)
-$10 compute credit
= $45/mo   ← matches the bill exactly
```

The paused sketch project contributes $0. Compute size couldn't be read through the API; the exact match to $45
implies all three are Micro. Double-check on the org Usage page → Compute Hours.

## Plan

| Project | Action | Saves | Why |
|---|---|---|---|
| Personal Projects | **KEEP** (the hub) | — | Most active; already hosts several apps with table prefixes (`penciled_`, `cravv_`). Covered by the $10 credit. |
| tendi | **PAUSE** (or DELETE) | $10/mo | 0 users, 2 rows, no traffic since June. Pausing is free and reversible. |
| Slowcart | **MERGE** into Personal Projects (same table names, no clashes) | $10/mo | Active but tiny (14 MB). Needs table + 625-photo + 1 auth-user migration and an env-var swap in the app. |
| yaqihelloworld-sketch's Project | **DELETE** (optional) | $0 | Already paused, costs nothing. Delete only to declutter. |

Result: **$45 → $35** after pausing tendi, **→ $25** after merging Slowcart.

Bigger lever (optional): move to a Free org → **$0**, but Free projects auto-pause after ~1 week idle and have no
backups. Only worth it if these stay side projects.

## Decisions (2026-09-24)

| Project | Decision | Done? |
|---|---|---|
| Personal Projects | KEEP | — |
| tendi | PAUSE | **Blocked.** Supabase won't pause a project in a paid org. To pause it, first transfer it to a Free org (then it costs $0 and auto-pauses when idle). The other option is to delete it. |
| Slowcart | MERGE | Planned, not started. See below. |
| yaqihelloworld-sketch's Project | Leave paused | — |

## Slowcart → Personal Projects merge plan

What was checked:
- No table-name clashes: Slowcart's `items`, `item_photos`, `ai_usage_daily`, `wishlist_items` and `shared_lists` don't exist in Personal Projects.
- The Slowcart app code (`ashlithos/slowcart`) reads from Supabase in 15 files. Its URL and keys come from env vars (`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`), so **no code changes are needed**.
- The only scheduled job is a Vercel cron (`/api/cron/refresh-prices`, daily 09:00 UTC). It moves automatically with the app.
- The Slowcart login uses the same email as an existing Personal Projects user but has a different user id. During the copy, rows will be re-pointed to the Personal Projects id.

Steps:
1. Apply Slowcart's 10 migrations (`supabase/migrations/0001…0010`) to Personal Projects.
2. Copy table rows, re-pointing the user id.
3. Copy the 625 files in the `item-photos` bucket. This needs both projects' service-role keys, run as a one-off script.
4. Swap the 3 env vars in Slowcart's Vercel project, then redeploy.
5. Use the app for a few days, then delete the Slowcart project. This is the step that saves $10/mo.

Note: Personal Projects is in us-west-2 and Slowcart is in us-east-2, so Slowcart may be a few tens of ms slower after the move.

## Status

No infrastructure has been changed yet. The tendi pause was attempted and refused by Supabase.
