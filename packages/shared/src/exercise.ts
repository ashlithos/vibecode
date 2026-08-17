import { z } from 'zod';
import {
  BODY_REGIONS,
  DIFFICULTIES,
  EQUIPMENT,
  LOAD_TYPES,
  MOVEMENT_PATTERNS,
  MUSCLES,
} from './taxonomy.js';

/**
 * Schema for authored exercise seed data (`data/exercises/*.json`).
 *
 * The caps on cues and mistakes are a product decision, not an arbitrary limit:
 * three cues you read beat eight you skip. Enforcing it here means the data
 * can't quietly drift into a wall of text later.
 */
export const seedExerciseSchema = z
  .object({
    id: z
      .string()
      .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'must be a lowercase kebab-case slug'),
    name: z.string().min(1),
    bodyRegion: z.enum(BODY_REGIONS),
    equipment: z.enum(EQUIPMENT),
    difficulty: z.enum(DIFFICULTIES),
    loadType: z.enum(LOAD_TYPES),

    /** Smallest sensible resistance step, in the user's unit. 0 for bodyweight. */
    loadIncrement: z.number().min(0),

    defaultSets: z.number().int().min(1).max(6),
    defaultRepsLow: z.number().int().min(1).max(60),
    defaultRepsHigh: z.number().int().min(1).max(60),

    primaryMuscles: z.array(z.enum(MUSCLES)).min(1),
    secondaryMuscles: z.array(z.enum(MUSCLES)),
    movementPatterns: z.array(z.enum(MOVEMENT_PATTERNS)).min(1),

    /** Plain-language "how to spot this thing on the gym floor". */
    machineIdentification: z.string().min(1).nullable(),

    instructions: z.array(z.string().min(1)).min(2).max(8),
    keyCues: z.array(z.string().min(1)).min(1).max(4),
    commonMistakes: z.array(z.string().min(1)).min(1).max(3),

    /** Functional equivalents — same pattern, similar muscles. Slugs. */
    alternatives: z.array(z.string()),

    mediaUrl: z.string().nullable().default(null),
    mediaKind: z.enum(['image', 'gif', 'video']).nullable().default(null),
  })
  .strict()
  .superRefine((ex, ctx) => {
    if (ex.defaultRepsHigh < ex.defaultRepsLow) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['defaultRepsHigh'],
        message: `defaultRepsHigh (${ex.defaultRepsHigh}) must be >= defaultRepsLow (${ex.defaultRepsLow})`,
      });
    }

    const overlap = ex.secondaryMuscles.filter((m) => ex.primaryMuscles.includes(m));
    if (overlap.length > 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['secondaryMuscles'],
        message: `muscle listed as both primary and secondary: ${overlap.join(', ')}`,
      });
    }

    if (ex.alternatives.includes(ex.id)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['alternatives'],
        message: 'an exercise cannot be its own alternative',
      });
    }

    // A loaded exercise with no increment leaves progression with nothing to step by.
    if ((ex.loadType === 'weight' || ex.loadType === 'assistance') && ex.loadIncrement <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['loadIncrement'],
        message: `loadType "${ex.loadType}" requires a loadIncrement greater than 0`,
      });
    }
  });

export type SeedExercise = z.infer<typeof seedExerciseSchema>;

export const seedFileSchema = z.array(seedExerciseSchema);
