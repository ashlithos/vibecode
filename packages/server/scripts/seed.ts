import { loadSeed } from '../src/data/loadSeed.js';
import { prisma } from '../src/db.js';

/**
 * Loads the exercise catalog into the database.
 *
 * Catalog rows are upserted rather than wiped, so re-seeding after editing the
 * JSON keeps workout history and preferences intact.
 *
 * Only shared reference data lives here. Per-user defaults (settings, equipment
 * availability) are created on first sign-in — see routes/auth.ts — because
 * there is no user to attach them to until someone actually signs in.
 */
async function main() {
  const { exercises, issues, filesRead } = loadSeed();

  if (issues.length > 0) {
    console.error(`✖ Refusing to seed — ${issues.length} validation issue(s).`);
    console.error('  Run `npm run validate:seed` for details.');
    process.exit(1);
  }

  console.log(`Seeding ${exercises.length} exercises from ${filesRead.length} files…`);

  for (const ex of exercises) {
    const scalar = {
      name: ex.name,
      bodyRegion: ex.bodyRegion,
      equipment: ex.equipment,
      difficulty: ex.difficulty,
      loadType: ex.loadType,
      loadIncrement: ex.loadIncrement,
      defaultSets: ex.defaultSets,
      defaultRepsLow: ex.defaultRepsLow,
      defaultRepsHigh: ex.defaultRepsHigh,
      machineIdentification: ex.machineIdentification,
      instructions: JSON.stringify(ex.instructions),
      keyCues: JSON.stringify(ex.keyCues),
      commonMistakes: JSON.stringify(ex.commonMistakes),
      mediaUrl: ex.mediaUrl,
      mediaKind: ex.mediaKind,
    };

    await prisma.exercise.upsert({
      where: { id: ex.id },
      create: { id: ex.id, ...scalar },
      update: scalar,
    });

    // Join rows are replaced wholesale — simpler than diffing, and these are
    // authored data rather than anything the user has touched.
    await prisma.exerciseMuscle.deleteMany({ where: { exerciseId: ex.id } });
    await prisma.exerciseMuscle.createMany({
      data: [
        ...ex.primaryMuscles.map((muscle) => ({ exerciseId: ex.id, muscle, role: 'primary' })),
        ...ex.secondaryMuscles.map((muscle) => ({
          exerciseId: ex.id,
          muscle,
          role: 'secondary',
        })),
      ],
    });

    await prisma.exercisePattern.deleteMany({ where: { exerciseId: ex.id } });
    await prisma.exercisePattern.createMany({
      data: ex.movementPatterns.map((pattern) => ({ exerciseId: ex.id, pattern })),
    });
  }

  // Alternatives are linked in a second pass, once every exercise row exists.
  for (const ex of exercises) {
    await prisma.exerciseAlternative.deleteMany({ where: { exerciseId: ex.id } });
    await prisma.exerciseAlternative.createMany({
      data: ex.alternatives.map((alternativeId, rank) => ({
        exerciseId: ex.id,
        alternativeId,
        rank,
      })),
    });
  }

  const counts = {
    exercises: await prisma.exercise.count(),
    muscleLinks: await prisma.exerciseMuscle.count(),
    patternLinks: await prisma.exercisePattern.count(),
    alternatives: await prisma.exerciseAlternative.count(),
  };

  console.log(`
✔ Seeded
  ${counts.exercises} exercises
  ${counts.muscleLinks} muscle links
  ${counts.patternLinks} pattern links
  ${counts.alternatives} alternative links

  Next: review the muscle mappings — they were AI-drafted, and a wrong one
  silently skews every future recommendation. See docs/exercise-data-guide.md.
`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
