import { afterAll, beforeAll, describe, expect, it } from 'vitest';

/**
 * Cross-user isolation.
 *
 * Runs against a real Postgres because the thing under test is the SQL WHERE
 * clause itself — a mocked client would happily return whatever it was told to,
 * which is exactly the bug these guard against.
 *
 * SetLog carries no userId of its own; it reaches its owner through
 * workoutExercise -> workout. Before auth existed, getSetHistory and
 * getLastPerformedMap queried it unfiltered — invisible with a single user, and
 * every account would have shared one training history.
 *
 * Skipped when DATABASE_URL is unset so `npm test` still runs the pure engine
 * suite with no infrastructure. CI and pre-deploy runs must set it.
 */
const DB = process.env.DATABASE_URL;

const ALICE = 'test-user-alice';
const BOB = 'test-user-bob';
const CAROL = 'test-user-carol';

describe.skipIf(!DB)('cross-user isolation', () => {
  // Imported lazily: db.ts throws on a missing DATABASE_URL at module load,
  // which would fail the file before skipIf could take effect.
  let repo: typeof import('./repository.js');
  let prisma: typeof import('./db.js')['prisma'];

  async function makeUserWithSets(
    id: string,
    email: string,
    exerciseId: string,
    reps: number[],
  ) {
    await prisma.user.create({ data: { id, email } });

    const workout = await prisma.workout.create({
      data: {
        userId: id,
        status: 'completed',
        exercises: {
          create: [
            { exerciseId, order: 0, targetSets: reps.length, targetRepsLow: 8, targetRepsHigh: 12 },
          ],
        },
      },
      include: { exercises: true },
    });

    for (const [i, r] of reps.entries()) {
      await prisma.setLog.create({
        data: { workoutExerciseId: workout.exercises[0].id, setIndex: i, reps: r, load: 100 },
      });
    }
  }

  beforeAll(async () => {
    repo = await import('./repository.js');
    ({ prisma } = await import('./db.js'));

    await prisma.user.deleteMany({ where: { id: { in: [ALICE, BOB, CAROL] } } });
    await makeUserWithSets(ALICE, 'alice@test.local', 'leg-press', [10, 9, 8]);
    await makeUserWithSets(BOB, 'bob@test.local', 'lat-pulldown', [12]);
    await prisma.exercisePreference.create({
      data: { userId: ALICE, exerciseId: 'plank', status: 'never' },
    });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { id: { in: [ALICE, BOB, CAROL] } } });
    await prisma.$disconnect();
  });

  it('getSetHistory returns only the requesting user rows', async () => {
    const alice = await repo.getSetHistory(ALICE);
    const bob = await repo.getSetHistory(BOB);

    expect(alice).toHaveLength(3);
    expect(bob).toHaveLength(1);
    expect(alice.every((s) => s.exerciseId === 'leg-press')).toBe(true);
    expect(bob.every((s) => s.exerciseId === 'lat-pulldown')).toBe(true);
  });

  it('getLastPerformedMap does not leak another user exercises', async () => {
    const alice = await repo.getLastPerformedMap(ALICE);
    const bob = await repo.getLastPerformedMap(BOB);

    expect(alice.has('leg-press')).toBe(true);
    expect(alice.has('lat-pulldown')).toBe(false);
    expect(bob.has('lat-pulldown')).toBe(true);
    expect(bob.has('leg-press')).toBe(false);
  });

  it('preferences are per-user', async () => {
    expect((await repo.getPreferences(ALICE)).map((p) => p.exerciseId)).toEqual(['plank']);
    expect(await repo.getPreferences(BOB)).toEqual([]);
  });

  it('a brand-new user sees an empty history, not the first user history', async () => {
    await prisma.user.create({ data: { id: CAROL, email: 'carol@test.local' } });

    const ctx = await repo.getEngineContext(CAROL);
    expect(ctx.history).toEqual([]);
    expect(ctx.preferences).toEqual([]);
    // The shared catalog is still fully visible — it is reference data.
    expect(ctx.exercises.length).toBeGreaterThan(50);
  });
});
