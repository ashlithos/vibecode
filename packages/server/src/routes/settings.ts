import type { FastifyInstance } from 'fastify';
import { EQUIPMENT, MUSCLES, RECOVERY_RATINGS, type Muscle } from '@gym/shared';
import { buildRecoveryView } from '../engine/recovery.js';
import { prisma, USER_ID } from '../db.js';
import { getEngineContext, getSettings } from '../repository.js';
import { localDateKey } from '../time.js';

export async function settingsRoutes(app: FastifyInstance) {
  app.get('/api/settings', async () => {
    const [settings, equipment] = await Promise.all([
      getSettings(),
      prisma.equipmentAvailability.findMany({ where: { userId: USER_ID } }),
    ]);

    const availability = new Map(equipment.map((e) => [e.equipment, e.available]));

    return {
      ...settings,
      equipment: EQUIPMENT.map((id) => ({
        id,
        available: availability.get(id) ?? true,
      })),
    };
  });

  app.put('/api/settings', async (req) => {
    const body = (req.body ?? {}) as {
      goal?: string;
      daysPerWeek?: number;
      defaultSessionMinutes?: number;
      unit?: 'lb' | 'kg';
    };

    await prisma.userSettings.upsert({
      where: { userId: USER_ID },
      create: { userId: USER_ID, ...body },
      update: body,
    });

    return getSettings();
  });

  /**
   * Equipment availability. With no time selector in the flow, this is the main
   * lever that shapes what gets recommended, so it takes a full replacement set
   * rather than one toggle at a time.
   */
  app.put('/api/equipment', async (req, reply) => {
    const body = (req.body ?? {}) as { equipment?: { id: string; available: boolean }[] };
    if (!Array.isArray(body.equipment)) {
      return reply.code(400).send({ error: 'Expected an equipment array' });
    }

    for (const item of body.equipment) {
      if (!EQUIPMENT.includes(item.id as never)) {
        return reply.code(400).send({ error: `Unknown equipment "${item.id}"` });
      }
      await prisma.equipmentAvailability.upsert({
        where: { userId_equipment: { userId: USER_ID, equipment: item.id } },
        create: { userId: USER_ID, equipment: item.id, available: item.available },
        update: { available: item.available },
      });
    }

    const rows = await prisma.equipmentAvailability.findMany({ where: { userId: USER_ID } });
    return { equipment: rows.map((r) => ({ id: r.equipment, available: r.available })) };
  });

  /** Per-muscle recovery — the "why" behind today's recommendation. */
  app.get('/api/recovery', async () => {
    const ctx = await getEngineContext();
    return {
      muscles: buildRecoveryView({
        sets: ctx.history,
        exercises: ctx.exercises,
        reports: ctx.reports,
      }),
    };
  });

  /** Optional soreness check-in. One report per muscle per day. */
  app.put('/api/recovery/report', async (req, reply) => {
    const body = (req.body ?? {}) as { muscle?: Muscle; rating?: string };

    if (!body.muscle || !MUSCLES.includes(body.muscle)) {
      return reply.code(400).send({ error: 'A valid muscle is required' });
    }
    if (!body.rating || !RECOVERY_RATINGS.includes(body.rating as never)) {
      return reply.code(400).send({ error: 'A valid rating is required' });
    }

    const date = localDateKey();
    await prisma.recoveryReport.upsert({
      where: { userId_date_muscle: { userId: USER_ID, date, muscle: body.muscle } },
      create: {
        userId: USER_ID,
        date,
        muscle: body.muscle,
        rating: body.rating,
        reportedAt: new Date(),
      },
      update: { rating: body.rating, reportedAt: new Date() },
    });

    return { muscle: body.muscle, rating: body.rating, date };
  });
}
