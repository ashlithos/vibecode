import {
  MUSCLE_LABELS,
  TUNING,
  type Equipment,
  type ExerciseCatalogEntry,
  type FatigueMap,
  type MovementPattern,
  type PreferenceRecord,
  type RecommendedExercise,
  type SetRecord,
  type WorkoutPlan,
} from '@gym/shared';
import { bandFor, exerciseFatigue, peakPrimaryFatigue } from './recovery.js';
import { hasProgressionOpportunity, suggestNextTarget } from './progression.js';

/**
 * Builds a full-body session from the catalog.
 *
 * The philosophy the whole product rests on: distribute work across movement
 * patterns rather than running a rigid Monday-back / Tuesday-legs split, and
 * let recent training decide what gets trained today.
 */

/**
 * Slots are filled from pattern groups, not single patterns, so a "pull" slot
 * can be satisfied by a lat pulldown or a row depending on what's fresh.
 */
const PATTERN_GROUPS = {
  legs: ['squat', 'knee_extension'],
  pull: ['vertical_pull', 'horizontal_pull'],
  push: ['horizontal_push', 'vertical_push'],
  posterior: ['hip_hinge', 'hip_extension', 'knee_flexion'],
  core: ['core_stabilization', 'carry'],
  accessory: ['isolation'],
} satisfies Record<string, MovementPattern[]>;

type GroupName = keyof typeof PATTERN_GROUPS;

/**
 * Session shape, compounds first. Truncated to the slot count — so a short
 * session keeps the highest-value movements and drops the accessories.
 */
const SLOT_TEMPLATE: GroupName[] = [
  'legs',
  'pull',
  'push',
  'posterior',
  'pull',
  'core',
  'push',
  'accessory',
];

export interface SelectionInput {
  exercises: ExerciseCatalogEntry[];
  preferences: PreferenceRecord[];
  availableEquipment: Equipment[];
  fatigue: FatigueMap;
  history: SetRecord[];
  targetMinutes: number;
  now?: Date;
  /** Stabilizes tie-breaks. Defaults to the local date, so a plan holds all day. */
  seed?: string;
}

export function slotCountForMinutes(minutes: number): number {
  return Math.max(2, Math.min(8, Math.round(minutes / TUNING.minutesPerExercise)));
}

export function recommendWorkout(input: SelectionInput): WorkoutPlan {
  const now = input.now ?? new Date();
  const seed = input.seed ?? now.toISOString().slice(0, 10);
  const slots = slotCountForMinutes(input.targetMinutes);

  const prefByExercise = new Map(input.preferences.map((p) => [p.exerciseId, p]));
  const equipment = new Set(input.availableEquipment);
  const lastPerformed = buildLastPerformedMap(input.history);

  // --- hard constraints --------------------------------------------------

  const eligible = input.exercises.filter((ex) => {
    const pref = prefByExercise.get(ex.id);
    if (pref?.status === 'never') return false;
    if (pref?.skipUntil && new Date(pref.skipUntil).getTime() > now.getTime()) return false;
    if (!equipment.has(ex.equipment)) return false;
    return true;
  });

  if (eligible.length === 0) {
    return {
      exercises: [],
      targetMinutes: input.targetMinutes,
      shortfall:
        'No exercises match your available equipment. Check your equipment settings, or un-hide some exercises.',
    };
  }

  // --- fill slots --------------------------------------------------------

  const chosen: RecommendedExercise[] = [];
  const usedIds = new Set<string>();
  const usedPatterns = new Set<MovementPattern>();

  for (let i = 0; i < slots; i++) {
    const group = SLOT_TEMPLATE[i % SLOT_TEMPLATE.length];
    const wanted = PATTERN_GROUPS[group] as MovementPattern[];

    let candidate = bestCandidate(eligible, {
      patterns: wanted,
      usedIds,
      usedPatterns,
      input,
      lastPerformed,
      seed,
      now,
    });

    // If everything this slot could offer is under-recovered, don't force it —
    // take the best fresh option from any pattern instead. This is what keeps
    // a sore muscle group from being trained four days running.
    if (candidate && peakPrimaryFatigue(candidate.exercise, input.fatigue) > TUNING.fatigueBands.recent) {
      const anywhere = bestCandidate(eligible, {
        patterns: null,
        usedIds,
        usedPatterns,
        input,
        lastPerformed,
        seed,
        now,
        maxPrimaryFatigue: TUNING.fatigueBands.recent,
      });
      if (anywhere) candidate = anywhere;
    }

    if (!candidate) continue;

    const { exercise, score, pattern } = candidate;
    usedIds.add(exercise.id);
    usedPatterns.add(pattern);

    const target = suggestNextTarget({ exercise, history: input.history });

    chosen.push({
      exerciseId: exercise.id,
      order: chosen.length,
      pattern,
      target,
      score,
      rationale: explain(exercise, input, lastPerformed, prefByExercise.get(exercise.id)),
      alternatives: exercise.alternatives.filter((id) =>
        eligible.some((e) => e.id === id && !usedIds.has(id)),
      ),
    });
  }

  return {
    exercises: chosen,
    targetMinutes: input.targetMinutes,
    shortfall:
      chosen.length < slots
        ? `Only ${chosen.length} of ${slots} slots could be filled from your available equipment and preferences.`
        : null,
  };
}

// ---------------------------------------------------------------------------

interface CandidateContext {
  patterns: MovementPattern[] | null;
  usedIds: Set<string>;
  usedPatterns: Set<MovementPattern>;
  input: SelectionInput;
  lastPerformed: Map<string, number>;
  seed: string;
  now: Date;
  maxPrimaryFatigue?: number;
}

interface Candidate {
  exercise: ExerciseCatalogEntry;
  score: number;
  pattern: MovementPattern;
}

function bestCandidate(
  pool: ExerciseCatalogEntry[],
  ctx: CandidateContext,
): Candidate | null {
  let best: Candidate | null = null;

  for (const exercise of pool) {
    if (ctx.usedIds.has(exercise.id)) continue;

    const pattern = ctx.patterns
      ? exercise.movementPatterns.find((p) => ctx.patterns!.includes(p))
      : exercise.movementPatterns[0];
    if (!pattern) continue;

    if (
      ctx.maxPrimaryFatigue !== undefined &&
      peakPrimaryFatigue(exercise, ctx.input.fatigue) > ctx.maxPrimaryFatigue
    ) {
      continue;
    }

    const score = scoreExercise(exercise, pattern, ctx);
    if (!best || score > best.score) best = { exercise, score, pattern };
  }

  return best;
}

function scoreExercise(
  exercise: ExerciseCatalogEntry,
  pattern: MovementPattern,
  ctx: CandidateContext,
): number {
  const { input, lastPerformed, usedPatterns, now, seed } = ctx;
  const w = TUNING.score;
  let score = 0;

  const pref = input.preferences.find((p) => p.exerciseId === exercise.id);
  if (pref?.status === 'favorite') score += w.favorite;

  // Novelty — exercises you haven't touched in a while rise.
  const last = lastPerformed.get(exercise.id);
  const daysSince =
    last === undefined ? Infinity : (now.getTime() - last) / (1000 * 60 * 60 * 24);
  score += w.noveltyMax * Math.min(daysSince / w.noveltyDaysToMax, 1);

  // Freshness — the recovery model's main influence on what gets picked.
  score += w.freshness * (1 - exerciseFatigue(exercise, input.fatigue));

  // Variety — discourage two of the same pattern in one session.
  if (usedPatterns.has(pattern)) score += w.repeatedPatternPenalty;

  if (hasProgressionOpportunity(exercise, input.history)) {
    score += w.progressionOpportunity;
  }

  // Deterministic jitter so equal scores resolve the same way all day rather
  // than reshuffling the plan every time the screen is opened.
  score += hashUnit(`${seed}:${exercise.id}`) * 0.01;

  return score;
}

function explain(
  exercise: ExerciseCatalogEntry,
  input: SelectionInput,
  lastPerformed: Map<string, number>,
  pref: PreferenceRecord | undefined,
): string {
  if (pref?.status === 'favorite') return 'One of your favorites.';

  const band = bandFor(exerciseFatigue(exercise, input.fatigue));
  const primary = exercise.primaryMuscles[0];

  if (band === 'fresh') {
    const last = lastPerformed.get(exercise.id);
    if (last === undefined) return `${cap(primary)} is fresh, and you haven't tried this one yet.`;
    const days = Math.floor((Date.now() - last) / (1000 * 60 * 60 * 24));
    return days >= 1
      ? `${cap(primary)} is fresh — last did this ${days} day${days === 1 ? '' : 's'} ago.`
      : `${cap(primary)} is fresh.`;
  }

  // Movement-pattern names are internal vocabulary — "Covers isolation" means
  // nothing to a reader. Name the muscle instead.
  return `Targets ${exercise.primaryMuscles.map((m) => MUSCLE_LABELS[m].toLowerCase()).join(' and ')}.`;
}

function buildLastPerformedMap(history: SetRecord[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const set of history) {
    const at = new Date(set.completedAt).getTime();
    if (!map.has(set.exerciseId) || at > map.get(set.exerciseId)!) {
      map.set(set.exerciseId, at);
    }
  }
  return map;
}

/** Stable string hash mapped to [0, 1). */
function hashUnit(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 100000) / 100000;
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
