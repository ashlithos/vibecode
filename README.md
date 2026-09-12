# Gym Copilot

A personalized visual exercise library that helps you discover exercises, understand
which muscles they train, remember what you did, and automatically choose what to do
next based on preferences, goals, and recent training history.

> **Don't make me remember the workout. Don't make me plan the workout.
> Show me what to do next.**

## Status

Pre-implementation. The workspace is scaffolded and the layout study is done; the
data model and recommendation engine are next.

- **`docs/wireframes.html`** — lo-fi variants for six open layout and flow decisions,
  each with trade-offs and a recommendation. Open it in a browser.

## Structure

```
packages/
  shared/   TypeScript taxonomy + zod schemas, imported by both sides
  server/   Fastify + Prisma (SQLite); the recommendation engine lives here
  web/      Vite + React SPA, mobile-first
data/       exercises.seed.json — the curated exercise catalog
docs/       design study and data-authoring guides
```

The taxonomy in `packages/shared` is deliberately the single source of truth for
muscles, movement patterns and equipment. Everything downstream — seed validation,
API filters, UI filter chips — reads from it, so an unknown term fails the build
instead of producing an exercise the recommender silently never picks.

## The core idea

The product is not the UI, it's the graph underneath it:

```
Exercise → Muscle → Movement → Equipment → Preference → History → Recovery → Recommendation
```

The recommendation engine is written as pure functions over plain data with no
database access, which keeps it unit-testable and makes a future natural-language
layer a thin addition rather than a rewrite.

## Scope

**Building:** exercise library with muscle mapping and machine identification,
preference states (favorite / neutral / skip today / never), workout tracking with
set logging, simple progressive overload suggestions, and full-body recommendations
that account for recent training and recovery.

**Not building:** calorie or food tracking, body-fat estimation, medical or physical
therapy advice, social features, wearable integration, and complex periodization.

## Development

```bash
npm install
npm run dev          # server + web
npm test             # seed validation + engine unit tests
```
