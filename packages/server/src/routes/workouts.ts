import type { FastifyInstance } from 'fastify';
import { computeMuscleFatigue } from '../engine/recovery.js';
import { suggestNextTarget } from '../engine/progression.js';
import { recommendWorkout } from '../engine/selection.js';
import { prisma } from '../db.js';
import { getCatalog, getEngineContext, getSetHistory } from '../repository.js';
import { startOfLocalToday } from '../time.js';

export async function workoutRoutes(app: FastifyInstance) {
  /** Preview today's plan without committing it to the database. */
  app.get('/api/recommendation', async (req) => {
    const q = req.query as { minutes?: string };
    const ctx = await getEngineContext(req.user!.id);
    const minutes = Number(q.minutes) || ctx.settings.defaultSessionMinutes;

    const fatigue = computeMuscleFatigue({
      sets: ctx.history,
      exercises: ctx.exercises,
      reports: ctx.reports,
    });

    const plan = recommendWorkout({
      exercises: ctx.exercises,
      preferences: ctx.preferences,
      availableEquipment: ctx.availableEquipment,
      fatigue,
      history: ctx.history,
      targetMinutes: minutes,
    });

    return decoratePlan(plan, ctx.exercises);
  });

  /**
   * Today's workout, creating one from the recommendation if none exists.
   *
   * This is what makes the zero-question flow work: by the time the Today
   * screen renders, the plan already exists.
   */
  app.get('/api/workouts/today', async (req) => {
    const userId = req.user!.id;
    const existing = await findTodaysWorkout(userId);
    if (existing) return serializeWorkout(existing.id);

    const ctx = await getEngineContext(userId);
    const fatigue = computeMuscleFatigue({
      sets: ctx.history,
      exercises: ctx.exercises,
      reports: ctx.reports,
    });

    const plan = recommendWorkout({
      exercises: ctx.exercises,
      preferences: ctx.preferences,
      availableEquipment: ctx.availableEquipment,
      fatigue,
      history: ctx.history,
      targetMinutes: ctx.settings.defaultSessionMinutes,
    });

    const workout = await prisma.workout.create({
      data: {
        userId,
        status: 'planned',
        targetMinutes: plan.targetMinutes,
        exercises: {
          create: plan.exercises.map((rec) => ({
            exerciseId: rec.exerciseId,
            order: rec.order,
            targetSets: rec.target.sets,
            targetRepsLow: rec.target.repsLow,
            targetRepsHigh: rec.target.repsHigh,
            suggestedLoad: rec.target.load,
            rationale: rec.rationale,
          })),
        },
      },
    });

    return serializeWorkout(workout.id);
  });

  /** Discard today's plan and build a fresh one. */
  app.post('/api/workouts/today/regenerate', async (req, reply) => {
    const userId = req.user!.id;
    const existing = await findTodaysWorkout(userId);

    if (existing && existing.status !== 'planned') {
      return reply.code(409).send({
        error: "Today's workout is already underway. Finish or abandon it before regenerating.",
      });
    }

    if (existing) await prisma.workout.delete({ where: { id: existing.id } });

    const ctx = await getEngineContext(userId);
    const fatigue = computeMuscleFatigue({
      sets: ctx.history,
      exercises: ctx.exercises,
      reports: ctx.reports,
    });
    const plan = recommendWorkout({
      exercises: ctx.exercises,
      preferences: ctx.preferences,
      availableEquipment: ctx.availableEquipment,
      fatigue,
      history: ctx.history,
      targetMinutes: ctx.settings.defaultSessionMinutes,
      // Re-roll the tie-break so "regenerate" actually produces something new.
      seed: `${Date.now()}`,
    });

    const workout = await prisma.workout.create({
      data: {
        userId,
        status: 'planned',
        targetMinutes: plan.targetMinutes,
        exercises: {
          create: plan.exercises.map((rec) => ({
            exerciseId: rec.exerciseId,
            order: rec.order,
            targetSets: rec.target.sets,
            targetRepsLow: rec.target.repsLow,
            targetRepsHigh: rec.target.repsHigh,
            suggestedLoad: rec.target.load,
            rationale: rec.rationale,
          })),
        },
      },
    });

    return serializeWorkout(workout.id);
  });

  app.get('/api/workouts/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    const workout = await ownedWorkout(id, req.user!.id);
    if (!workout) return reply.code(404).send({ error: 'No such workout' });
    return serializeWorkout(id);
  });

  app.post('/api/workouts/:id/start', async (req, reply) => {
    const { id } = req.params as { id: string };
    const workout = await ownedWorkout(id, req.user!.id);
    if (!workout) return reply.code(404).send({ error: 'No such workout' });

    if (workout.status === 'planned') {
      await prisma.workout.update({ where: { id }, data: { status: 'in_progress' } });
    }
    return serializeWorkout(id);
  });

  app.post('/api/workouts/:id/complete', async (req, reply) => {
    const { id } = req.params as { id: string };
    const workout = await ownedWorkout(id, req.user!.id);
    if (!workout) return reply.code(404).send({ error: 'No such workout' });

    await prisma.workout.update({
      where: { id },
      data: { status: 'completed', completedAt: new Date() },
    });
    return serializeWorkout(id);
  });

  /**
   * Edit a slot: reorder, skip, or swap for an alternative.
   *
   * Swapping keeps the original id in swappedFromId. Nothing reads it yet, but
   * it's the raw material for learning preferences without asking.
   */
  app.patch('/api/workouts/:id/exercises/:weId', async (req, reply) => {
    const { weId } = req.params as { id: string; weId: string };
    const body = (req.body ?? {}) as {
      status?: string;
      order?: number;
      swapToExerciseId?: string;
      targetSets?: number;
      targetRepsLow?: number;
      targetRepsHigh?: number;
      suggestedLoad?: number | null;
    };

    const existing = await ownedSlot(weId, req.user!.id);
    if (!existing) return reply.code(404).send({ error: 'No such workout exercise' });

    const data: Record<string, unknown> = {};

    if (body.swapToExerciseId) {
      const catalog = await getCatalog();
      const replacement = catalog.find((e) => e.id === body.swapToExerciseId);
      if (!replacement) return reply.code(400).send({ error: 'Unknown replacement exercise' });

      const history = await getSetHistory(req.user!.id);
      const target = suggestNextTarget({ exercise: replacement, history });

      data.exerciseId = replacement.id;
      data.swappedFromId = existing.exerciseId;
      data.targetSets = target.sets;
      data.targetRepsLow = target.repsLow;
      data.targetRepsHigh = target.repsHigh;
      data.suggestedLoad = target.load;
      data.rationale = `Swapped in for ${existing.exerciseId}.`;
    }

    for (const key of [
      'status',
      'order',
      'targetSets',
      'targetRepsLow',
      'targetRepsHigh',
      'suggestedLoad',
    ] as const) {
      if (body[key] !== undefined) data[key] = body[key];
    }

    const updated = await prisma.workoutExercise.update({ where: { id: weId }, data });
    return serializeWorkout(updated.workoutId);
  });

  app.delete('/api/workouts/:id/exercises/:weId', async (req, reply) => {
    const { id, weId } = req.params as { id: string; weId: string };
    const existing = await ownedSlot(weId, req.user!.id);
    if (!existing) return reply.code(404).send({ error: 'No such workout exercise' });

    await prisma.workoutExercise.delete({ where: { id: weId } });
    return serializeWorkout(id);
  });

  /** Log a completed set. */
  app.post('/api/workouts/:id/exercises/:weId/sets', async (req, reply) => {
    const { id, weId } = req.params as { id: string; weId: string };
    const body = (req.body ?? {}) as {
      reps?: number;
      load?: number | null;
      rir?: number | null;
      notes?: string;
      unit?: string;
    };

    if (typeof body.reps !== 'number' || body.reps < 0) {
      return reply.code(400).send({ error: 'reps is required and must be zero or more' });
    }

    const we = await prisma.workoutExercise.findFirst({
      where: { id: weId, workout: { userId: req.user!.id } },
      include: { sets: true },
    });
    if (!we) return reply.code(404).send({ error: 'No such workout exercise' });

    const setIndex = we.sets.length;

    await prisma.setLog.create({
      data: {
        workoutExerciseId: weId,
        setIndex,
        reps: body.reps,
        load: body.load ?? null,
        rir: body.rir ?? null,
        notes: body.notes,
        unit: body.unit ?? 'lb',
      },
    });

    // Mark the slot done once the planned sets are in, and the workout as
    // underway on the first set of the session.
    const nextStatus = setIndex + 1 >= we.targetSets ? 'completed' : 'active';
    await prisma.workoutExercise.update({ where: { id: weId }, data: { status: nextStatus } });
    await prisma.workout.updateMany({
      where: { id, status: 'planned' },
      data: { status: 'in_progress' },
    });

    return serializeWorkout(id);
  });

  app.patch('/api/workouts/:id/sets/:setId', async (req, reply) => {
    const { id, setId } = req.params as { id: string; setId: string };
    const body = (req.body ?? {}) as { reps?: number; load?: number | null; rir?: number | null };

    const existing = await ownedSet(setId, req.user!.id);
    if (!existing) return reply.code(404).send({ error: 'No such set' });

    await prisma.setLog.update({
      where: { id: setId },
      data: {
        ...(body.reps !== undefined ? { reps: body.reps } : {}),
        ...(body.load !== undefined ? { load: body.load } : {}),
        ...(body.rir !== undefined ? { rir: body.rir } : {}),
      },
    });

    return serializeWorkout(id);
  });

  app.delete('/api/workouts/:id/sets/:setId', async (req, reply) => {
    const { id, setId } = req.params as { id: string; setId: string };
    const existing = await ownedSet(setId, req.user!.id);
    if (!existing) return reply.code(404).send({ error: 'No such set' });

    await prisma.setLog.delete({ where: { id: setId } });
    await prisma.workoutExercise.update({
      where: { id: existing.workoutExerciseId },
      data: { status: 'active' },
    });
    return serializeWorkout(id);
  });

  /** Recent sessions for the Today screen's history strip. */
  app.get('/api/workouts', async (req) => {
    const q = req.query as { limit?: string };
    const take = Math.min(Number(q.limit) || 10, 50);

    const rows = await prisma.workout.findMany({
      where: { userId: req.user!.id, status: 'completed' },
      orderBy: { date: 'desc' },
      take,
      include: {
        exercises: { include: { sets: true, exercise: { select: { name: true } } } },
      },
    });

    return {
      workouts: rows.map((w) => ({
        id: w.id,
        date: w.date.toISOString(),
        status: w.status,
        exerciseCount: w.exercises.length,
        setCount: w.exercises.reduce((n, e) => n + e.sets.length, 0),
        exerciseNames: w.exercises
          .sort((a, b) => a.order - b.order)
          .map((e) => e.exercise.name),
      })),
    };
  });
}

// ---------------------------------------------------------------------------

/**
 * Ownership helpers.
 *
 * Every :id in a URL is attacker-controlled, so each lookup filters by the
 * caller rather than fetching by id and trusting it. A workout belonging to
 * someone else returns 404, not 403 — no reason to confirm it exists.
 */
async function ownedWorkout(id: string, userId: string) {
  return prisma.workout.findFirst({ where: { id, userId } });
}

async function ownedSlot(id: string, userId: string) {
  return prisma.workoutExercise.findFirst({ where: { id, workout: { userId } } });
}

async function ownedSet(id: string, userId: string) {
  return prisma.setLog.findFirst({
    where: { id, workoutExercise: { workout: { userId } } },
  });
}

async function findTodaysWorkout(userId: string) {
  return prisma.workout.findFirst({
    where: {
      userId,
      date: { gte: startOfLocalToday() },
      status: { in: ['planned', 'in_progress'] },
    },
    orderBy: { date: 'desc' },
  });
}

/** Full workout shape the client renders, catalog details included. */
async function serializeWorkout(id: string) {
  const workout = await prisma.workout.findUnique({
    where: { id },
    include: {
      exercises: {
        orderBy: { order: 'asc' },
        include: { sets: { orderBy: { setIndex: 'asc' } } },
      },
    },
  });
  if (!workout) return null;

  const catalog = await getCatalog();
  const byId = new Map(catalog.map((e) => [e.id, e]));

  return {
    id: workout.id,
    date: workout.date.toISOString(),
    status: workout.status,
    targetMinutes: workout.targetMinutes,
    completedAt: workout.completedAt?.toISOString() ?? null,
    exercises: workout.exercises.map((we) => {
      const ex = byId.get(we.exerciseId);
      return {
        id: we.id,
        exerciseId: we.exerciseId,
        name: ex?.name ?? we.exerciseId,
        equipment: ex?.equipment ?? null,
        loadType: ex?.loadType ?? 'weight',
        loadIncrement: ex?.loadIncrement ?? 5,
        primaryMuscles: ex?.primaryMuscles ?? [],
        secondaryMuscles: ex?.secondaryMuscles ?? [],
        keyCues: ex?.keyCues ?? [],
        machineIdentification: ex?.machineIdentification ?? null,
        mediaUrl: ex?.mediaUrl ?? null,
        mediaKind: ex?.mediaKind ?? null,
        order: we.order,
        status: we.status,
        rationale: we.rationale,
        targetSets: we.targetSets,
        targetRepsLow: we.targetRepsLow,
        targetRepsHigh: we.targetRepsHigh,
        suggestedLoad: we.suggestedLoad,
        alternatives: (ex?.alternatives ?? [])
          .map((altId) => byId.get(altId))
          .filter((a): a is NonNullable<typeof a> => Boolean(a))
          .map((a) => ({ id: a.id, name: a.name, equipment: a.equipment })),
        sets: we.sets.map((s) => ({
          id: s.id,
          setIndex: s.setIndex,
          reps: s.reps,
          load: s.load,
          rir: s.rir,
          unit: s.unit,
          completedAt: s.completedAt.toISOString(),
        })),
      };
    }),
  };
}

/** Attach catalog details to a preview plan (which holds only ids). */
function decoratePlan(
  plan: ReturnType<typeof recommendWorkout>,
  catalog: Awaited<ReturnType<typeof getCatalog>>,
) {
  const byId = new Map(catalog.map((e) => [e.id, e]));
  return {
    targetMinutes: plan.targetMinutes,
    shortfall: plan.shortfall,
    exercises: plan.exercises.map((rec) => {
      const ex = byId.get(rec.exerciseId);
      return {
        ...rec,
        name: ex?.name ?? rec.exerciseId,
        equipment: ex?.equipment ?? null,
        primaryMuscles: ex?.primaryMuscles ?? [],
        secondaryMuscles: ex?.secondaryMuscles ?? [],
        mediaUrl: ex?.mediaUrl ?? null,
      };
    }),
  };
}
