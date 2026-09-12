import {
  EQUIPMENT,
  MOVEMENT_PATTERNS,
  MUSCLES,
  type Equipment,
  type MovementPattern,
  type Muscle,
} from '@gym/shared';
import { loadSeed } from '../src/data/loadSeed.js';

const { exercises, issues, filesRead } = loadSeed();

if (issues.length > 0) {
  console.error(`\n✖ Seed validation failed with ${issues.length} issue(s):\n`);
  for (const issue of issues) {
    const where = issue.exerciseId ? `${issue.file} › ${issue.exerciseId}` : issue.file;
    console.error(`  ${where}\n    ${issue.message}`);
  }
  console.error('');
  process.exit(1);
}

// --- coverage summary ------------------------------------------------------

const count = <T extends string>(keys: readonly T[], pick: (id: string) => T[]) => {
  const tally = new Map<T, number>(keys.map((k) => [k, 0]));
  for (const ex of exercises) {
    for (const key of pick(ex.id)) tally.set(key, (tally.get(key) ?? 0) + 1);
  }
  return tally;
};

const byId = new Map(exercises.map((e) => [e.id, e]));
const get = (id: string) => byId.get(id)!;

const muscleCounts = count<Muscle>(MUSCLES, (id) => [
  ...get(id).primaryMuscles,
  ...get(id).secondaryMuscles,
]);
const patternCounts = count<MovementPattern>(MOVEMENT_PATTERNS, (id) => get(id).movementPatterns);
const equipmentCounts = count<Equipment>(EQUIPMENT, (id) => [get(id).equipment]);

const bar = (n: number) => '▪'.repeat(Math.min(n, 30));
const table = <T extends string>(title: string, tally: Map<T, number>) => {
  console.log(`\n  ${title}`);
  const width = Math.max(...[...tally.keys()].map((k) => k.length));
  for (const [key, n] of [...tally].sort((a, b) => b[1] - a[1])) {
    console.log(`    ${key.padEnd(width)}  ${String(n).padStart(3)}  ${bar(n)}`);
  }
};

console.log(`\n✔ ${exercises.length} exercises validated across ${filesRead.length} files`);
console.log(`  ${filesRead.join(', ')}`);

table('Muscles (primary + secondary)', muscleCounts);
table('Movement patterns', patternCounts);
table('Equipment', equipmentCounts);

const withoutMedia = exercises.filter((e) => e.mediaUrl === null).length;
const withoutMachineId = exercises.filter((e) => e.machineIdentification === null).length;

console.log(`
  ────────────────────────────────────────────────────────────
  REVIEW NEEDED — this metadata was AI-drafted.

  Muscle mappings are the one thing that quietly poisons every
  downstream recommendation if they're wrong, and the failure is
  invisible from the UI: the app just keeps suggesting the wrong
  exercise on the wrong day. Spot-check them before trusting the
  recommendations.

  See docs/exercise-data-guide.md for how to review and edit.

  ${withoutMedia}/${exercises.length} exercises have no media yet.
  ${withoutMachineId}/${exercises.length} have no machine-identification text
  (expected for free-weight and bodyweight movements).
  ────────────────────────────────────────────────────────────
`);
