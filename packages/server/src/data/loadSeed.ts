import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  MOVEMENT_PATTERNS,
  seedFileSchema,
  type MovementPattern,
  type SeedExercise,
} from '@gym/shared';

const here = path.dirname(fileURLToPath(import.meta.url));

/** repo-root/data/exercises */
export const SEED_DIR = path.resolve(here, '../../../../data/exercises');

/**
 * Every movement pattern needs at least this many exercises, so the recommender
 * still has somewhere to go when the user marks one "never" and skips another.
 */
const MIN_EXERCISES_PER_PATTERN = 3;

export interface SeedIssue {
  file: string;
  exerciseId?: string;
  message: string;
}

export interface SeedLoadResult {
  exercises: SeedExercise[];
  issues: SeedIssue[];
  filesRead: string[];
}

/**
 * Reads and validates every exercise file.
 *
 * Structural validation is zod's job (see seedExerciseSchema). This function
 * adds the checks that only make sense across the whole set: unique slugs,
 * alternatives that actually resolve, and enough coverage per pattern.
 */
export function loadSeed(dir: string = SEED_DIR): SeedLoadResult {
  const issues: SeedIssue[] = [];
  const exercises: SeedExercise[] = [];
  const filesRead: string[] = [];

  const files = readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .sort();

  if (files.length === 0) {
    issues.push({ file: dir, message: 'no .json exercise files found' });
    return { exercises, issues, filesRead };
  }

  for (const file of files) {
    filesRead.push(file);
    const raw = readFileSync(path.join(dir, file), 'utf8');

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch (err) {
      issues.push({ file, message: `invalid JSON: ${(err as Error).message}` });
      continue;
    }

    const result = seedFileSchema.safeParse(parsed);
    if (!result.success) {
      for (const issue of result.error.issues) {
        // path[0] is the array index within the file — resolve it to a slug so
        // the error names the exercise rather than a number.
        const index = typeof issue.path[0] === 'number' ? issue.path[0] : null;
        const entry = index !== null ? (parsed as SeedExercise[])[index] : undefined;
        issues.push({
          file,
          exerciseId: entry?.id ?? (index !== null ? `[${index}]` : undefined),
          message: `${issue.path.slice(1).join('.') || 'root'}: ${issue.message}`,
        });
      }
      continue;
    }

    exercises.push(...result.data);
  }

  // --- cross-file checks -------------------------------------------------

  const byId = new Map<string, SeedExercise>();
  for (const ex of exercises) {
    if (byId.has(ex.id)) {
      issues.push({ file: '(cross-file)', exerciseId: ex.id, message: 'duplicate exercise id' });
      continue;
    }
    byId.set(ex.id, ex);
  }

  for (const ex of exercises) {
    for (const alt of ex.alternatives) {
      if (!byId.has(alt)) {
        issues.push({
          file: '(cross-file)',
          exerciseId: ex.id,
          message: `alternative "${alt}" does not resolve to a known exercise`,
        });
      }
    }
  }

  const patternCounts = new Map<MovementPattern, number>(
    MOVEMENT_PATTERNS.map((p) => [p, 0]),
  );
  for (const ex of exercises) {
    for (const pattern of ex.movementPatterns) {
      patternCounts.set(pattern, (patternCounts.get(pattern) ?? 0) + 1);
    }
  }

  for (const [pattern, count] of patternCounts) {
    if (count < MIN_EXERCISES_PER_PATTERN) {
      issues.push({
        file: '(coverage)',
        message: `movement pattern "${pattern}" has only ${count} exercise(s); needs at least ${MIN_EXERCISES_PER_PATTERN} so the recommender has fallbacks`,
      });
    }
  }

  return { exercises, issues, filesRead };
}
