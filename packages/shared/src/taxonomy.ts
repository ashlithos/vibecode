/**
 * The single source of truth for every term the recommender reasons about.
 *
 * Seed validation, API filters and UI filter chips all read from here, so an
 * unknown muscle or pattern fails the build instead of quietly producing an
 * exercise that never gets recommended.
 */

export const BODY_REGIONS = ['upper', 'lower', 'core'] as const;
export type BodyRegion = (typeof BODY_REGIONS)[number];

export const MUSCLES = [
  'glutes',
  'quads',
  'hamstrings',
  'calves',
  'back',
  'chest',
  'shoulders',
  'biceps',
  'triceps',
  'forearms',
  'core',
] as const;
export type Muscle = (typeof MUSCLES)[number];

export const MOVEMENT_PATTERNS = [
  'squat',
  'hip_hinge',
  'hip_extension',
  'knee_extension',
  'knee_flexion',
  'horizontal_push',
  'horizontal_pull',
  'vertical_push',
  'vertical_pull',
  'core_stabilization',
  'carry',
  'isolation',
] as const;
export type MovementPattern = (typeof MOVEMENT_PATTERNS)[number];

export const EQUIPMENT = [
  'machine',
  'cable',
  'dumbbell',
  'barbell',
  'bodyweight',
  'smith_machine',
  'kettlebell',
] as const;
export type Equipment = (typeof EQUIPMENT)[number];

export const DIFFICULTIES = ['beginner', 'intermediate', 'advanced'] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

/**
 * How resistance is applied — this is not cosmetic.
 *
 * On an assisted pull-up, *less* weight is *harder*. Progression logic that
 * doesn't branch on this will confidently tell you to go backwards.
 */
export const LOAD_TYPES = ['weight', 'assistance', 'bodyweight', 'time'] as const;
export type LoadType = (typeof LOAD_TYPES)[number];

export const PREFERENCE_STATUSES = ['favorite', 'neutral', 'never'] as const;
export type PreferenceStatus = (typeof PREFERENCE_STATUSES)[number];

export const MUSCLE_ROLES = ['primary', 'secondary'] as const;
export type MuscleRole = (typeof MUSCLE_ROLES)[number];

export const WORKOUT_STATUSES = ['planned', 'in_progress', 'completed', 'abandoned'] as const;
export type WorkoutStatus = (typeof WORKOUT_STATUSES)[number];

export const WORKOUT_EXERCISE_STATUSES = ['pending', 'active', 'completed', 'skipped'] as const;
export type WorkoutExerciseStatus = (typeof WORKOUT_EXERCISE_STATUSES)[number];

/** Optional self-reported readiness. Nudges the fatigue model; never overrides it. */
export const RECOVERY_RATINGS = ['good', 'okay', 'sore', 'very_sore'] as const;
export type RecoveryRating = (typeof RECOVERY_RATINGS)[number];

// ---------------------------------------------------------------------------
// Display labels
// ---------------------------------------------------------------------------

export const MUSCLE_LABELS: Record<Muscle, string> = {
  glutes: 'Glutes',
  quads: 'Quads',
  hamstrings: 'Hamstrings',
  calves: 'Calves',
  back: 'Back',
  chest: 'Chest',
  shoulders: 'Shoulders',
  biceps: 'Biceps',
  triceps: 'Triceps',
  forearms: 'Forearms',
  core: 'Core',
};

export const MOVEMENT_PATTERN_LABELS: Record<MovementPattern, string> = {
  squat: 'Squat',
  hip_hinge: 'Hip hinge',
  hip_extension: 'Hip extension',
  knee_extension: 'Knee extension',
  knee_flexion: 'Knee flexion',
  horizontal_push: 'Horizontal push',
  horizontal_pull: 'Horizontal pull',
  vertical_push: 'Vertical push',
  vertical_pull: 'Vertical pull',
  core_stabilization: 'Core stabilization',
  carry: 'Carry',
  isolation: 'Isolation',
};

export const EQUIPMENT_LABELS: Record<Equipment, string> = {
  machine: 'Machine',
  cable: 'Cable',
  dumbbell: 'Dumbbell',
  barbell: 'Barbell',
  bodyweight: 'Bodyweight',
  smith_machine: 'Smith machine',
  kettlebell: 'Kettlebell',
};

export const BODY_REGION_LABELS: Record<BodyRegion, string> = {
  upper: 'Upper body',
  lower: 'Lower body',
  core: 'Core',
};

export const RECOVERY_RATING_LABELS: Record<RecoveryRating, string> = {
  good: 'Good',
  okay: 'Okay',
  sore: 'Sore',
  very_sore: 'Very sore',
};

export const MUSCLES_BY_REGION: Record<BodyRegion, readonly Muscle[]> = {
  upper: ['back', 'chest', 'shoulders', 'biceps', 'triceps', 'forearms'],
  lower: ['glutes', 'quads', 'hamstrings', 'calves'],
  core: ['core'],
};

// ---------------------------------------------------------------------------
// Recommendation tuning
//
// Grouped here rather than scattered through the engine so the whole model can
// be re-tuned from one place once there's real training history to judge it by.
// ---------------------------------------------------------------------------

export const TUNING = {
  /** A set contributes this much exposure to each muscle, by role. */
  exposureWeight: { primary: 1.0, secondary: 0.5 } as Record<MuscleRole, number>,

  /** Hours for accumulated muscle exposure to decay by half. */
  fatigueHalfLifeHours: 36,

  /** Exposure (post-decay) treated as fully fatigued when normalizing to 0..1. */
  fatigueSaturation: 9,

  /** Self-reported readiness adjustments, added to the 0..1 fatigue score. */
  recoveryReportNudge: {
    good: -0.15,
    okay: 0,
    sore: 0.2,
    very_sore: 0.35,
  } as Record<RecoveryRating, number>,

  /** Fatigue thresholds for the three-state recovery display. */
  fatigueBands: { fresh: 0.3, recent: 0.65 },

  /** Rough minutes per exercise, used to turn session length into a slot count. */
  minutesPerExercise: 7.5,

  /** Selection scoring weights. */
  score: {
    favorite: 2.0,
    noveltyMax: 1.0,
    noveltyDaysToMax: 10,
    freshness: 1.5,
    repeatedPatternPenalty: -1.5,
    progressionOpportunity: 0.5,
  },
} as const;
