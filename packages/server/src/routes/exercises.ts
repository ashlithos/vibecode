import type { FastifyInstance } from 'fastify';
import type { PreferenceStatus } from '@gym/shared';
import { prisma, USER_ID } from '../db.js';
import { getCatalog, getLastPerformedMap, getPreferences } from '../repository.js';
import { endOfLocalToday } from '../time.js';

export async function exerciseRoutes(app: FastifyInstance) {
  /**
   * Library listing. Filters compose — `?muscle=back&equipment=cable` narrows
   * to both. `hidden=true` returns only "never" exercises, which is what backs
   * the restorable Hidden section rather than a settings-menu scavenger hunt.
   */
  app.get('/api/exercises', async (req) => {
    const q = req.query as Record<string, string | undefined>;
    const [catalog, preferences, lastPerformed] = await Promise.all([
      getCatalog(),
      getPreferences(),
      getLastPerformedMap(),
    ]);

    const prefById = new Map(preferences.map((p) => [p.exerciseId, p]));
    const search = q.q?.trim().toLowerCase();

    const results = catalog.filter((ex) => {
      const pref = prefById.get(ex.id);
      const isHidden = pref?.status === 'never';

      if (q.hidden === 'true') {
        if (!isHidden) return false;
      } else if (isHidden) {
        return false;
      }

      if (q.bodyRegion && ex.bodyRegion !== q.bodyRegion) return false;
      if (q.equipment && ex.equipment !== q.equipment) return false;
      if (q.difficulty && ex.difficulty !== q.difficulty) return false;
      if (q.preference === 'favorite' && pref?.status !== 'favorite') return false;

      if (q.muscle) {
        const trains =
          ex.primaryMuscles.includes(q.muscle as never) ||
          ex.secondaryMuscles.includes(q.muscle as never);
        if (!trains) return false;
      }

      if (q.pattern && !ex.movementPatterns.includes(q.pattern as never)) return false;

      if (search && !ex.name.toLowerCase().includes(search)) return false;

      return true;
    });

    return {
      exercises: results.map((ex) => ({
        id: ex.id,
        name: ex.name,
        bodyRegion: ex.bodyRegion,
        equipment: ex.equipment,
        difficulty: ex.difficulty,
        primaryMuscles: ex.primaryMuscles,
        secondaryMuscles: ex.secondaryMuscles,
        movementPatterns: ex.movementPatterns,
        mediaUrl: ex.mediaUrl,
        mediaKind: ex.mediaKind,
        preference: prefById.get(ex.id)?.status ?? 'neutral',
        skipUntil: prefById.get(ex.id)?.skipUntil ?? null,
        lastPerformedAt: lastPerformed.get(ex.id) ?? null,
      })),
      hiddenCount: catalog.filter((ex) => prefById.get(ex.id)?.status === 'never').length,
    };
  });

  app.get('/api/exercises/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    const [catalog, preferences, lastPerformed] = await Promise.all([
      getCatalog(),
      getPreferences(),
      getLastPerformedMap(),
    ]);

    const exercise = catalog.find((e) => e.id === id);
    if (!exercise) return reply.code(404).send({ error: `No exercise "${id}"` });

    const byId = new Map(catalog.map((e) => [e.id, e]));
    const prefById = new Map(preferences.map((p) => [p.exerciseId, p]));

    // Recent sets for this exercise, so the detail page can answer
    // "what did I do last time" without a second request.
    const recentSets = await prisma.setLog.findMany({
      where: { workoutExercise: { exerciseId: id } },
      orderBy: { completedAt: 'desc' },
      take: 30,
      select: { load: true, reps: true, rir: true, completedAt: true, unit: true },
    });

    return {
      ...exercise,
      preference: prefById.get(id)?.status ?? 'neutral',
      skipUntil: prefById.get(id)?.skipUntil ?? null,
      lastPerformedAt: lastPerformed.get(id) ?? null,
      alternatives: exercise.alternatives
        .map((altId) => byId.get(altId))
        .filter((a): a is NonNullable<typeof a> => Boolean(a))
        .map((a) => ({
          id: a.id,
          name: a.name,
          equipment: a.equipment,
          primaryMuscles: a.primaryMuscles,
        })),
      history: recentSets.map((s) => ({
        load: s.load,
        reps: s.reps,
        rir: s.rir,
        unit: s.unit,
        completedAt: s.completedAt.toISOString(),
      })),
    };
  });

  /**
   * Preference update.
   *
   * `skipToday` and `status` are separate on purpose — "not today" must never
   * be recorded as "I hate this". Skipping sets an expiry; nothing is deleted,
   * so a hidden exercise is always restorable.
   */
  app.put('/api/exercises/:id/preference', async (req, reply) => {
    const { id } = req.params as { id: string };
    const body = (req.body ?? {}) as { status?: PreferenceStatus; skipToday?: boolean };

    const catalog = await getCatalog();
    if (!catalog.some((e) => e.id === id)) {
      return reply.code(404).send({ error: `No exercise "${id}"` });
    }

    const data: { status?: string; skipUntil?: Date | null } = {};

    if (body.skipToday !== undefined) {
      data.skipUntil = body.skipToday ? endOfLocalToday() : null;
    }
    if (body.status !== undefined) {
      data.status = body.status;
      // Explicitly choosing favorite or neutral clears a pending skip —
      // the user is telling us about the exercise, not about today.
      if (body.skipToday === undefined) data.skipUntil = null;
    }

    if (Object.keys(data).length === 0) {
      return reply.code(400).send({ error: 'Provide a status, a skipToday flag, or both.' });
    }

    const row = await prisma.exercisePreference.upsert({
      where: { userId_exerciseId: { userId: USER_ID, exerciseId: id } },
      create: {
        userId: USER_ID,
        exerciseId: id,
        status: data.status ?? 'neutral',
        skipUntil: data.skipUntil ?? null,
      },
      update: data,
    });

    return {
      exerciseId: id,
      status: row.status,
      skipUntil: row.skipUntil?.toISOString() ?? null,
    };
  });
}
