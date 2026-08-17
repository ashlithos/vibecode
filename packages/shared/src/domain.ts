import type {
  BodyRegion,
  Difficulty,
  Equipment,
  LoadType,
  MovementPattern,
  Muscle,
  PreferenceStatus,
  RecoveryRating,
  WorkoutExerciseStatus,
  WorkoutStatus,
} from './taxonomy.js';

/**
 * Plain-data shapes the recommendation engine operates on.
 *
 * Deliberately free of any Prisma or database types: the engine takes plain
 * objects and returns plain objects, which is what makes it unit-testable and
 * what will later let a natural-language layer call it directly.
 */

export interface ExerciseCatalogEntry {
  id: string;
  name: string;
  bodyRegion: BodyRegion;
  equipment: Equipment;
  difficulty: Difficulty;
  loadType: LoadType;
  loadIncrement: number;
  defaultSets: number;
  defaultRepsLow: number;
  defaultRepsHigh: number;
  primaryMuscles: Muscle[];
  secondaryMuscles: Muscle[];
  movementPatterns: MovementPattern[];
  machineIdentification: string | null;
  instructions: string[];
  keyCues: string[];
  commonMistakes: string[];
  alternatives: string[];
  mediaUrl: string | null;
  mediaKind: 'image' | 'gif' | 'video' | null;
}

export interface PreferenceRecord {
  exerciseId: string;
  status: PreferenceStatus;
  /** Exclude from recommendations until this instant. Set by "skip today". */
  skipUntil: string | null;
  updatedAt: string;
}

export interface RecoveryReportRecord {
  muscle: Muscle;
  rating: RecoveryRating;
  /** ISO date-time the report refers to. */
  reportedAt: string;
}

/** One completed set, flattened for the engine. */
export interface SetRecord {
  exerciseId: string;
  load: number | null;
  reps: number;
  rir: number | null;
  completedAt: string;
}

export interface WorkoutSummary {
  id: string;
  date: string;
  status: WorkoutStatus;
  exerciseIds: string[];
}

/** 0..1 per muscle, where 1 means "trained hard, very recently". */
export type FatigueMap = Record<Muscle, number>;

export type FatigueBand = 'fresh' | 'recent' | 'needs_recovery';

export interface MuscleRecovery {
  muscle: Muscle;
  fatigue: number;
  band: FatigueBand;
  lastTrainedAt: string | null;
  daysSinceTrained: number | null;
}

export interface ProgressionTarget {
  load: number | null;
  sets: number;
  repsLow: number;
  repsHigh: number;
  /** Short human sentence. An unexplained number is a number people ignore. */
  rationale: string;
}

export interface RecommendedExercise {
  exerciseId: string;
  order: number;
  pattern: MovementPattern;
  target: ProgressionTarget;
  score: number;
  rationale: string;
  alternatives: string[];
}

export interface WorkoutPlan {
  exercises: RecommendedExercise[];
  targetMinutes: number;
  /** Set when fewer slots could be filled than requested, with the reason why. */
  shortfall: string | null;
}

export interface UserSettingsRecord {
  goal: string;
  daysPerWeek: number;
  defaultSessionMinutes: number;
  unit: 'lb' | 'kg';
}

export interface WorkoutExerciseRecord {
  id: string;
  exerciseId: string;
  order: number;
  targetSets: number;
  targetRepsLow: number;
  targetRepsHigh: number;
  suggestedLoad: number | null;
  status: WorkoutExerciseStatus;
}
