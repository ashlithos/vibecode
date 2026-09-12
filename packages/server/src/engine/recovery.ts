import {
  MUSCLES,
  TUNING,
  type ExerciseCatalogEntry,
  type FatigueBand,
  type FatigueMap,
  type MuscleRecovery,
  type Muscle,
  type RecoveryReportRecord,
  type SetRecord,
} from '@gym/shared';

/**
 * How recently and how hard each muscle has been trained, as a 0..1 score.
 *
 * Pure function over plain data — no database access — so it can be exercised
 * directly in tests and, later, called by a natural-language layer.
 *
 * The model is deliberately simple: every completed set deposits exposure on
 * the muscles it trains, and that exposure decays exponentially. Self-reported
 * soreness only nudges the result, because soreness is a weak proxy for
 * readiness — you can be sore and recovered, or fresh and under-recovered.
 * Training history is the signal; the report is a hint.
 */

export interface FatigueInput {
  sets: SetRecord[];
  exercises: ExerciseCatalogEntry[];
  reports?: RecoveryReportRecord[];
  now?: Date;
}

const HOUR_MS = 1000 * 60 * 60;

const emptyFatigue = (): FatigueMap =>
  Object.fromEntries(MUSCLES.map((m) => [m, 0])) as FatigueMap;

/** Exponential decay: exposure halves every `fatigueHalfLifeHours`. */
function decayFactor(hoursAgo: number): number {
  if (hoursAgo <= 0) return 1;
  return Math.pow(0.5, hoursAgo / TUNING.fatigueHalfLifeHours);
}

export function computeMuscleFatigue(input: FatigueInput): FatigueMap {
  const now = input.now ?? new Date();
  const byId = new Map(input.exercises.map((e) => [e.id, e]));
  const raw = emptyFatigue();

  for (const set of input.sets) {
    const exercise = byId.get(set.exerciseId);
    if (!exercise) continue;

    const hoursAgo = (now.getTime() - new Date(set.completedAt).getTime()) / HOUR_MS;
    // Sets logged slightly in the future (clock skew) still count as "now".
    const decay = decayFactor(hoursAgo);
    if (decay <= 0.001) continue;

    for (const muscle of exercise.primaryMuscles) {
      raw[muscle] += TUNING.exposureWeight.primary * decay;
    }
    for (const muscle of exercise.secondaryMuscles) {
      raw[muscle] += TUNING.exposureWeight.secondary * decay;
    }
  }

  const fatigue = emptyFatigue();
  for (const muscle of MUSCLES) {
    fatigue[muscle] = Math.min(1, raw[muscle] / TUNING.fatigueSaturation);
  }

  // Self-reported readiness nudges the score. Applied after normalization so a
  // report can never single-handedly push a well-rested muscle into the red.
  for (const report of input.reports ?? []) {
    const ageHours = (now.getTime() - new Date(report.reportedAt).getTime()) / HOUR_MS;
    if (ageHours > 24 || ageHours < -1) continue; // only today's reports matter

    const nudge = TUNING.recoveryReportNudge[report.rating] ?? 0;
    fatigue[report.muscle] = clamp01(fatigue[report.muscle] + nudge);
  }

  return fatigue;
}

export function bandFor(fatigue: number): FatigueBand {
  if (fatigue < TUNING.fatigueBands.fresh) return 'fresh';
  if (fatigue < TUNING.fatigueBands.recent) return 'recent';
  return 'needs_recovery';
}

/**
 * Per-muscle recovery for display, including when each was last trained.
 * This is what the Today screen's recovery strip renders.
 */
export function buildRecoveryView(input: FatigueInput): MuscleRecovery[] {
  const now = input.now ?? new Date();
  const fatigue = computeMuscleFatigue(input);
  const byId = new Map(input.exercises.map((e) => [e.id, e]));

  const lastTrained = new Map<Muscle, number>();
  for (const set of input.sets) {
    const exercise = byId.get(set.exerciseId);
    if (!exercise) continue;
    const at = new Date(set.completedAt).getTime();
    // Secondary work counts as having trained the muscle for "last trained".
    for (const muscle of [...exercise.primaryMuscles, ...exercise.secondaryMuscles]) {
      if (!lastTrained.has(muscle) || at > lastTrained.get(muscle)!) {
        lastTrained.set(muscle, at);
      }
    }
  }

  return MUSCLES.map((muscle) => {
    const at = lastTrained.get(muscle) ?? null;
    return {
      muscle,
      fatigue: fatigue[muscle],
      band: bandFor(fatigue[muscle]),
      lastTrainedAt: at === null ? null : new Date(at).toISOString(),
      daysSinceTrained:
        at === null ? null : Math.floor((now.getTime() - at) / (24 * HOUR_MS)),
    };
  });
}

/**
 * Fatigue for one exercise, weighted by muscle role — how taxed the muscles
 * this exercise trains currently are, as a single 0..1 number.
 */
export function exerciseFatigue(exercise: ExerciseCatalogEntry, fatigue: FatigueMap): number {
  let weighted = 0;
  let total = 0;

  for (const muscle of exercise.primaryMuscles) {
    weighted += fatigue[muscle] * TUNING.exposureWeight.primary;
    total += TUNING.exposureWeight.primary;
  }
  for (const muscle of exercise.secondaryMuscles) {
    weighted += fatigue[muscle] * TUNING.exposureWeight.secondary;
    total += TUNING.exposureWeight.secondary;
  }

  return total === 0 ? 0 : weighted / total;
}

/**
 * Fatigue of the single most-taxed primary muscle.
 *
 * Deliberately a max rather than an average: an exercise whose main target is
 * fried is a bad pick today even if its other muscles are fresh. This is what
 * stops a fourth consecutive glute day.
 */
export function peakPrimaryFatigue(
  exercise: ExerciseCatalogEntry,
  fatigue: FatigueMap,
): number {
  return exercise.primaryMuscles.reduce((max, m) => Math.max(max, fatigue[m]), 0);
}

function clamp01(n: number): number {
  return Math.min(1, Math.max(0, n));
}
