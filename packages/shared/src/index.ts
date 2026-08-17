/**
 * Shared taxonomy for Gym Copilot.
 *
 * Every term the recommender reasons about is defined exactly once, here, and
 * consumed by the seed validator, the API and the UI. A typo in seed data then
 * becomes a build error rather than an exercise that silently never surfaces.
 *
 * Populated in Phase 1 — see docs/wireframes.html for the layout decisions that
 * render over this graph, and the implementation plan for the schema itself.
 */

export const PLACEHOLDER = true;
