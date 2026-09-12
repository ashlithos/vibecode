import type { ExerciseCatalogEntry, ProgressionTarget, SetRecord } from '@gym/shared';

/**
 * What to aim for next, based on what happened last time.
 *
 * Deliberately simple — a rep ladder with a load step at the top, not
 * periodization. The `rationale` string matters as much as the numbers: an
 * unexplained target is a target people ignore or override.
 */

/** Group a flat set list into sessions, newest first, by calendar day. */
function groupIntoSessions(sets: SetRecord[]): SetRecord[][] {
  const byDay = new Map<string, SetRecord[]>();

  for (const set of sets) {
    const day = new Date(set.completedAt).toISOString().slice(0, 10);
    const bucket = byDay.get(day);
    if (bucket) bucket.push(set);
    else byDay.set(day, [set]);
  }

  return [...byDay.entries()]
    .sort((a, b) => (a[0] < b[0] ? 1 : -1))
    .map(([, group]) => group.sort((a, b) => a.completedAt.localeCompare(b.completedAt)));
}

/**
 * Assistance machines invert progression: less assistance is harder, so
 * "progress" means stepping the load *down*, not up.
 */
function steppedLoad(exercise: ExerciseCatalogEntry, from: number): number {
  if (exercise.loadType === 'assistance') {
    return Math.max(0, from - exercise.loadIncrement);
  }
  return from + exercise.loadIncrement;
}

function describeLoad(exercise: ExerciseCatalogEntry, load: number, unit = 'lb'): string {
  if (exercise.loadType === 'assistance') return `${load} ${unit} assist`;
  if (exercise.loadType === 'time') return `${load}s`;
  return `${load} ${unit}`;
}

export interface ProgressionInput {
  exercise: ExerciseCatalogEntry;
  /** Sets for this exercise only, any order. */
  history: SetRecord[];
  unit?: string;
}

export function suggestNextTarget(input: ProgressionInput): ProgressionTarget {
  const { exercise, history, unit = 'lb' } = input;

  const base = {
    sets: exercise.defaultSets,
    repsLow: exercise.defaultRepsLow,
    repsHigh: exercise.defaultRepsHigh,
  };

  const relevant = history.filter((s) => s.exerciseId === exercise.id);
  const sessions = groupIntoSessions(relevant);
  const last = sessions[0];

  if (!last || last.length === 0) {
    return {
      ...base,
      load: null,
      rationale:
        exercise.loadType === 'bodyweight' || exercise.loadType === 'time'
          ? `First time — aim for ${base.repsLow}–${base.repsHigh} and see how it feels.`
          : `First time — pick a load you can control for ${base.repsLow}–${base.repsHigh}.`,
    };
  }

  const lastLoad = last.find((s) => s.load !== null)?.load ?? null;
  const reps = last.map((s) => s.reps);
  const minReps = Math.min(...reps);
  const maxReps = Math.max(...reps);
  const repsSummary = reps.join('/');

  // Unloaded work progresses by reps alone — there's nothing to step.
  if (exercise.loadType === 'bodyweight' || exercise.loadType === 'time') {
    const unitWord = exercise.loadType === 'time' ? 'seconds' : 'reps';
    if (minReps >= base.repsHigh) {
      return {
        ...base,
        repsLow: base.repsHigh,
        repsHigh: base.repsHigh + Math.max(2, Math.round(base.repsHigh * 0.2)),
        load: null,
        rationale: `You hit ${repsSummary} last time — push the ${unitWord} higher.`,
      };
    }
    return {
      ...base,
      load: null,
      rationale: `Last time: ${repsSummary}. Beat ${maxReps} on your best set.`,
    };
  }

  if (lastLoad === null) {
    return {
      ...base,
      load: null,
      rationale: `Last time: ${repsSummary}. Log your load this time so progression can track it.`,
    };
  }

  // Top of the range on *every* set is the trigger — one strong set isn't enough.
  if (minReps >= base.repsHigh) {
    const next = steppedLoad(exercise, lastLoad);
    return {
      ...base,
      load: next,
      rationale: `You hit ${repsSummary} at ${describeLoad(exercise, lastLoad, unit)} — try ${describeLoad(exercise, next, unit)}.`,
    };
  }

  const targetReps = Math.min(maxReps + 1, base.repsHigh);
  return {
    ...base,
    load: lastLoad,
    rationale: `Last time: ${repsSummary} at ${describeLoad(exercise, lastLoad, unit)}. Aim for ${targetReps}.`,
  };
}

/**
 * Whether this exercise is sitting on a load increase — used as a small bonus
 * in selection, so sessions favour exercises where you're about to move up.
 */
export function hasProgressionOpportunity(
  exercise: ExerciseCatalogEntry,
  history: SetRecord[],
): boolean {
  const relevant = history.filter((s) => s.exerciseId === exercise.id);
  if (relevant.length === 0) return false;

  const last = groupIntoSessions(relevant)[0];
  if (!last || last.length === 0) return false;

  return Math.min(...last.map((s) => s.reps)) >= exercise.defaultRepsHigh;
}
