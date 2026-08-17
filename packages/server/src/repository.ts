import type {
  Equipment,
  ExerciseCatalogEntry,
  MuscleRole,
  PreferenceRecord,
  RecoveryReportRecord,
  SetRecord,
  UserSettingsRecord,
} from '@gym/shared';
import { prisma, USER_ID } from './db.js';

/**
 * The seam between Prisma and the engine.
 *
 * Everything below returns the engine's plain-data shapes, so no Prisma type
 * ever reaches engine/. That's what keeps the recommendation logic testable
 * without a database.
 */

/** Catalog rows are read on nearly every request and only change on re-seed. */
let catalogCache: ExerciseCatalogEntry[] | null = null;

export function invalidateCatalogCache(): void {
  catalogCache = null;
}

export async function getCatalog(): Promise<ExerciseCatalogEntry[]> {
  if (catalogCache) return catalogCache;

  const rows = await prisma.exercise.findMany({
    include: {
      muscles: true,
      patterns: true,
      alternatives: { orderBy: { rank: 'asc' } },
    },
    orderBy: { name: 'asc' },
  });

  catalogCache = rows.map((row) => ({
    id: row.id,
    name: row.name,
    bodyRegion: row.bodyRegion as ExerciseCatalogEntry['bodyRegion'],
    equipment: row.equipment as Equipment,
    difficulty: row.difficulty as ExerciseCatalogEntry['difficulty'],
    loadType: row.loadType as ExerciseCatalogEntry['loadType'],
    loadIncrement: row.loadIncrement,
    defaultSets: row.defaultSets,
    defaultRepsLow: row.defaultRepsLow,
    defaultRepsHigh: row.defaultRepsHigh,
    primaryMuscles: musclesWithRole(row.muscles, 'primary'),
    secondaryMuscles: musclesWithRole(row.muscles, 'secondary'),
    movementPatterns: row.patterns.map(
      (p) => p.pattern as ExerciseCatalogEntry['movementPatterns'][number],
    ),
    machineIdentification: row.machineIdentification,
    instructions: JSON.parse(row.instructions) as string[],
    keyCues: JSON.parse(row.keyCues) as string[],
    commonMistakes: JSON.parse(row.commonMistakes) as string[],
    alternatives: row.alternatives.map((a) => a.alternativeId),
    mediaUrl: row.mediaUrl,
    mediaKind: row.mediaKind as ExerciseCatalogEntry['mediaKind'],
  }));

  return catalogCache;
}

function musclesWithRole(
  muscles: { muscle: string; role: string }[],
  role: MuscleRole,
): ExerciseCatalogEntry['primaryMuscles'] {
  return muscles
    .filter((m) => m.role === role)
    .map((m) => m.muscle as ExerciseCatalogEntry['primaryMuscles'][number]);
}

export async function getPreferences(): Promise<PreferenceRecord[]> {
  const rows = await prisma.exercisePreference.findMany({ where: { userId: USER_ID } });
  return rows.map((row) => ({
    exerciseId: row.exerciseId,
    status: row.status as PreferenceRecord['status'],
    skipUntil: row.skipUntil?.toISOString() ?? null,
    updatedAt: row.updatedAt.toISOString(),
  }));
}

export async function getAvailableEquipment(): Promise<Equipment[]> {
  const rows = await prisma.equipmentAvailability.findMany({
    where: { userId: USER_ID, available: true },
  });
  return rows.map((r) => r.equipment as Equipment);
}

export async function getSettings(): Promise<UserSettingsRecord> {
  const row = await prisma.userSettings.upsert({
    where: { userId: USER_ID },
    create: { userId: USER_ID },
    update: {},
  });

  return {
    goal: row.goal,
    daysPerWeek: row.daysPerWeek,
    defaultSessionMinutes: row.defaultSessionMinutes,
    unit: row.unit as 'lb' | 'kg',
  };
}

/**
 * Completed sets, newest-relevant-first. Bounded by a lookback window because
 * fatigue decays to nothing well before then and progression only reads the
 * most recent session.
 */
export async function getSetHistory(lookbackDays = 60): Promise<SetRecord[]> {
  const since = new Date(Date.now() - lookbackDays * 24 * 3600_000);

  const rows = await prisma.setLog.findMany({
    where: { completedAt: { gte: since } },
    include: { workoutExercise: { select: { exerciseId: true } } },
    orderBy: { completedAt: 'desc' },
  });

  return rows.map((row) => ({
    exerciseId: row.workoutExercise.exerciseId,
    load: row.load,
    reps: row.reps,
    rir: row.rir,
    completedAt: row.completedAt.toISOString(),
  }));
}

export async function getRecoveryReports(days = 2): Promise<RecoveryReportRecord[]> {
  const since = new Date(Date.now() - days * 24 * 3600_000);
  const rows = await prisma.recoveryReport.findMany({
    where: { userId: USER_ID, reportedAt: { gte: since } },
  });

  return rows.map((row) => ({
    muscle: row.muscle as RecoveryReportRecord['muscle'],
    rating: row.rating as RecoveryReportRecord['rating'],
    reportedAt: row.reportedAt.toISOString(),
  }));
}

/** Everything the engine needs, fetched in one round trip. */
export async function getEngineContext() {
  const [exercises, preferences, availableEquipment, history, reports, settings] =
    await Promise.all([
      getCatalog(),
      getPreferences(),
      getAvailableEquipment(),
      getSetHistory(),
      getRecoveryReports(),
      getSettings(),
    ]);

  return { exercises, preferences, availableEquipment, history, reports, settings };
}

/** Last time each exercise was performed, for library cards. */
export async function getLastPerformedMap(): Promise<Map<string, string>> {
  const rows = await prisma.setLog.groupBy({
    by: ['workoutExerciseId'],
    _max: { completedAt: true },
  });

  const weIds = rows.map((r) => r.workoutExerciseId);
  if (weIds.length === 0) return new Map();

  const links = await prisma.workoutExercise.findMany({
    where: { id: { in: weIds } },
    select: { id: true, exerciseId: true },
  });
  const exerciseByWe = new Map(links.map((l) => [l.id, l.exerciseId]));

  const out = new Map<string, string>();
  for (const row of rows) {
    const exerciseId = exerciseByWe.get(row.workoutExerciseId);
    const at = row._max.completedAt;
    if (!exerciseId || !at) continue;
    const iso = at.toISOString();
    const existing = out.get(exerciseId);
    if (!existing || iso > existing) out.set(exerciseId, iso);
  }
  return out;
}
