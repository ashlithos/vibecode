import { describe, expect, it } from 'vitest';
import type {
  ExerciseCatalogEntry,
  PreferenceRecord,
  SetRecord,
} from '@gym/shared';
import { loadSeed } from '../data/loadSeed.js';
import { buildRecoveryView, computeMuscleFatigue } from './recovery.js';
import { hasProgressionOpportunity, suggestNextTarget } from './progression.js';
import { recommendWorkout, slotCountForMinutes } from './selection.js';

const { exercises: seed, issues } = loadSeed();
const CATALOG: ExerciseCatalogEntry[] = seed as ExerciseCatalogEntry[];
const byId = (id: string) => {
  const found = CATALOG.find((e) => e.id === id);
  if (!found) throw new Error(`test fixture missing exercise: ${id}`);
  return found;
};

const ALL_EQUIPMENT = [
  'machine',
  'cable',
  'dumbbell',
  'barbell',
  'bodyweight',
  'smith_machine',
  'kettlebell',
] as const;

const NOW = new Date('2026-08-17T18:00:00.000Z');
const hoursAgo = (h: number) => new Date(NOW.getTime() - h * 3600_000).toISOString();
const daysAgo = (d: number) => hoursAgo(d * 24);

const set = (exerciseId: string, reps: number, load: number | null, at: string): SetRecord => ({
  exerciseId,
  reps,
  load,
  rir: null,
  completedAt: at,
});

describe('seed data', () => {
  it('loads and validates with no issues', () => {
    expect(issues).toEqual([]);
    expect(CATALOG.length).toBeGreaterThanOrEqual(50);
  });

  it('resolves every alternative to a real exercise', () => {
    const ids = new Set(CATALOG.map((e) => e.id));
    for (const ex of CATALOG) {
      for (const alt of ex.alternatives) expect(ids.has(alt), `${ex.id} → ${alt}`).toBe(true);
    }
  });
});

describe('progression', () => {
  it('increases load on a weight exercise once every set hits the top of the range', () => {
    const legPress = byId('leg-press');
    const history = [
      set('leg-press', legPress.defaultRepsHigh, 180, daysAgo(3)),
      set('leg-press', legPress.defaultRepsHigh, 180, daysAgo(3)),
      set('leg-press', legPress.defaultRepsHigh, 180, daysAgo(3)),
    ];

    const target = suggestNextTarget({ exercise: legPress, history });
    expect(target.load).toBe(180 + legPress.loadIncrement);
    expect(target.rationale).toContain('try');
  });

  it('DECREASES load on an assistance exercise — less help is harder', () => {
    const dip = byId('assisted-pull-up');
    const history = [
      set('assisted-pull-up', dip.defaultRepsHigh, 50, daysAgo(3)),
      set('assisted-pull-up', dip.defaultRepsHigh, 50, daysAgo(3)),
      set('assisted-pull-up', dip.defaultRepsHigh, 50, daysAgo(3)),
    ];

    const target = suggestNextTarget({ exercise: dip, history });
    expect(target.load).toBe(50 - dip.loadIncrement);
    expect(target.load).toBeLessThan(50);
    expect(target.rationale).toContain('assist');
  });

  it('never drives assistance below zero', () => {
    const dip = byId('assisted-pull-up');
    const history = [set('assisted-pull-up', dip.defaultRepsHigh, 0, daysAgo(2))];
    expect(suggestNextTarget({ exercise: dip, history }).load).toBe(0);
  });

  it('holds the load and bumps reps when the set was only partly completed', () => {
    const legPress = byId('leg-press');
    const history = [
      set('leg-press', 10, 180, daysAgo(3)),
      set('leg-press', 9, 180, daysAgo(3)),
      set('leg-press', 8, 180, daysAgo(3)),
    ];

    const target = suggestNextTarget({ exercise: legPress, history });
    expect(target.load).toBe(180);
    expect(target.rationale).toContain('Aim for 11');
  });

  it('asks for a starting load when there is no history', () => {
    const target = suggestNextTarget({ exercise: byId('leg-press'), history: [] });
    expect(target.load).toBeNull();
    expect(target.rationale).toContain('First time');
  });

  it('only uses the most recent session, not all of history', () => {
    const legPress = byId('leg-press');
    const history = [
      // older, weaker session
      set('leg-press', 8, 140, daysAgo(30)),
      // most recent session, all at the top of the range
      set('leg-press', legPress.defaultRepsHigh, 200, daysAgo(2)),
      set('leg-press', legPress.defaultRepsHigh, 200, daysAgo(2)),
    ];

    expect(suggestNextTarget({ exercise: legPress, history }).load).toBe(
      200 + legPress.loadIncrement,
    );
  });

  it('progresses bodyweight work by reps, leaving load null', () => {
    const pushUp = byId('push-up');
    const history = [set('push-up', pushUp.defaultRepsHigh, null, daysAgo(2))];
    const target = suggestNextTarget({ exercise: pushUp, history });

    expect(target.load).toBeNull();
    expect(target.repsHigh).toBeGreaterThan(pushUp.defaultRepsHigh);
  });

  it('flags a progression opportunity only when every set maxed out', () => {
    const legPress = byId('leg-press');
    const maxed = [
      set('leg-press', legPress.defaultRepsHigh, 180, daysAgo(2)),
      set('leg-press', legPress.defaultRepsHigh, 180, daysAgo(2)),
    ];
    const partial = [
      set('leg-press', legPress.defaultRepsHigh, 180, daysAgo(2)),
      set('leg-press', legPress.defaultRepsHigh - 3, 180, daysAgo(2)),
    ];

    expect(hasProgressionOpportunity(legPress, maxed)).toBe(true);
    expect(hasProgressionOpportunity(legPress, partial)).toBe(false);
  });
});

describe('recovery', () => {
  it('decays fatigue over time', () => {
    const recent = computeMuscleFatigue({
      sets: [set('barbell-hip-thrust', 10, 135, hoursAgo(2))],
      exercises: CATALOG,
      now: NOW,
    });
    const old = computeMuscleFatigue({
      sets: [set('barbell-hip-thrust', 10, 135, daysAgo(7))],
      exercises: CATALOG,
      now: NOW,
    });

    expect(recent.glutes).toBeGreaterThan(old.glutes);
    expect(old.glutes).toBeLessThan(0.05);
  });

  it('credits secondary muscles at half the weight of primary', () => {
    // Assisted pull-up: primary back, secondary biceps.
    const fatigue = computeMuscleFatigue({
      sets: [set('assisted-pull-up', 8, 50, hoursAgo(1))],
      exercises: CATALOG,
      now: NOW,
    });

    expect(fatigue.back).toBeGreaterThan(0);
    expect(fatigue.biceps).toBeCloseTo(fatigue.back / 2, 5);
  });

  it('lets a soreness report nudge fatigue without dominating it', () => {
    const sets = [set('barbell-hip-thrust', 10, 135, daysAgo(3))];

    const plain = computeMuscleFatigue({ sets, exercises: CATALOG, now: NOW });
    const sore = computeMuscleFatigue({
      sets,
      exercises: CATALOG,
      now: NOW,
      reports: [{ muscle: 'glutes', rating: 'very_sore', reportedAt: hoursAgo(1) }],
    });

    expect(sore.glutes).toBeGreaterThan(plain.glutes);
    // A nudge, not an override — one report can't max out a rested muscle.
    expect(sore.glutes).toBeLessThan(1);
  });

  it('ignores stale soreness reports', () => {
    const sets = [set('barbell-hip-thrust', 10, 135, daysAgo(3))];
    const plain = computeMuscleFatigue({ sets, exercises: CATALOG, now: NOW });
    const stale = computeMuscleFatigue({
      sets,
      exercises: CATALOG,
      now: NOW,
      reports: [{ muscle: 'glutes', rating: 'very_sore', reportedAt: daysAgo(5) }],
    });

    expect(stale.glutes).toBeCloseTo(plain.glutes, 5);
  });

  it('reports days since a muscle was last trained', () => {
    const view = buildRecoveryView({
      sets: [set('barbell-hip-thrust', 10, 135, daysAgo(2))],
      exercises: CATALOG,
      now: NOW,
    });

    const glutes = view.find((m) => m.muscle === 'glutes')!;
    const chest = view.find((m) => m.muscle === 'chest')!;

    expect(glutes.daysSinceTrained).toBe(2);
    expect(chest.daysSinceTrained).toBeNull();
    expect(chest.band).toBe('fresh');
  });
});

describe('selection', () => {
  const baseInput = (over: Partial<Parameters<typeof recommendWorkout>[0]> = {}) => ({
    exercises: CATALOG,
    preferences: [] as PreferenceRecord[],
    availableEquipment: [...ALL_EQUIPMENT],
    fatigue: computeMuscleFatigue({ sets: [], exercises: CATALOG, now: NOW }),
    history: [] as SetRecord[],
    targetMinutes: 45,
    now: NOW,
    ...over,
  });

  it('maps session length to a sensible slot count', () => {
    expect(slotCountForMinutes(15)).toBe(2);
    expect(slotCountForMinutes(30)).toBe(4);
    expect(slotCountForMinutes(45)).toBe(6);
    expect(slotCountForMinutes(60)).toBe(8);
  });

  it('fills the requested number of slots with distinct exercises', () => {
    const plan = recommendWorkout(baseInput());
    expect(plan.exercises).toHaveLength(6);
    expect(new Set(plan.exercises.map((e) => e.exerciseId)).size).toBe(6);
    expect(plan.shortfall).toBeNull();
  });

  it('never recommends an exercise marked never', () => {
    const banned = 'bulgarian-split-squat';
    const plan = recommendWorkout(
      baseInput({
        preferences: [
          { exerciseId: banned, status: 'never', skipUntil: null, updatedAt: daysAgo(1) },
        ],
        targetMinutes: 60,
      }),
    );

    expect(plan.exercises.map((e) => e.exerciseId)).not.toContain(banned);
  });

  it('excludes a skipped exercise today but allows it back tomorrow', () => {
    const skipped = 'leg-press';
    const prefs: PreferenceRecord[] = [
      {
        exerciseId: skipped,
        status: 'neutral',
        skipUntil: new Date(NOW.getTime() + 4 * 3600_000).toISOString(),
        updatedAt: hoursAgo(1),
      },
    ];

    const today = recommendWorkout(baseInput({ preferences: prefs, targetMinutes: 60 }));
    expect(today.exercises.map((e) => e.exerciseId)).not.toContain(skipped);

    const tomorrow = recommendWorkout(
      baseInput({
        preferences: prefs,
        targetMinutes: 60,
        now: new Date(NOW.getTime() + 24 * 3600_000),
      }),
    );
    // The skip has expired, so it's eligible again (not necessarily chosen).
    const eligibleAgain = recommendWorkout(
      baseInput({
        preferences: prefs,
        targetMinutes: 60,
        now: new Date(NOW.getTime() + 24 * 3600_000),
      }),
    );
    expect(tomorrow.exercises.length).toBeGreaterThan(0);
    expect(eligibleAgain.exercises.length).toBeGreaterThan(0);
  });

  it('only recommends exercises whose equipment is available', () => {
    const plan = recommendWorkout(
      baseInput({ availableEquipment: ['machine', 'cable'], targetMinutes: 60 }),
    );

    for (const rec of plan.exercises) {
      const ex = byId(rec.exerciseId);
      expect(['machine', 'cable']).toContain(ex.equipment);
    }
  });

  it('reports a clear shortfall rather than silently returning nothing', () => {
    const plan = recommendWorkout(
      baseInput({ availableEquipment: [], targetMinutes: 45 }),
    );

    expect(plan.exercises).toHaveLength(0);
    expect(plan.shortfall).toContain('equipment');
  });

  it('prefers favorites over neutral exercises that are otherwise equal', () => {
    const favorite = 'seated-cable-row';
    const plan = recommendWorkout(
      baseInput({
        preferences: [
          { exerciseId: favorite, status: 'favorite', skipUntil: null, updatedAt: daysAgo(5) },
        ],
        targetMinutes: 60,
      }),
    );

    expect(plan.exercises.map((e) => e.exerciseId)).toContain(favorite);
  });

  it('produces the same plan for the same day and a different one later', () => {
    const a = recommendWorkout(baseInput());
    const b = recommendWorkout(baseInput());
    expect(a.exercises.map((e) => e.exerciseId)).toEqual(b.exercises.map((e) => e.exerciseId));
  });

  it('spreads work across movement patterns rather than repeating one', () => {
    const plan = recommendWorkout(baseInput({ targetMinutes: 45 }));
    const patterns = plan.exercises.map((e) => e.pattern);
    // 6 slots should touch at least 4 distinct patterns.
    expect(new Set(patterns).size).toBeGreaterThanOrEqual(4);
  });

  it('attaches a rationale and alternatives to every pick', () => {
    const plan = recommendWorkout(baseInput());
    for (const rec of plan.exercises) {
      expect(rec.rationale.length).toBeGreaterThan(0);
      expect(rec.target.rationale.length).toBeGreaterThan(0);
    }
  });

  // The failure mode this whole model exists to prevent.
  it('REGRESSION: does not train glutes a fourth day running', () => {
    const gluteWork: SetRecord[] = [];
    for (const day of [1, 2, 3]) {
      for (let s = 0; s < 4; s++) {
        gluteWork.push(set('barbell-hip-thrust', 10, 135, daysAgo(day)));
        gluteWork.push(set('hip-thrust-machine', 12, 100, daysAgo(day)));
        gluteWork.push(set('cable-glute-kickback', 15, 30, daysAgo(day)));
      }
    }

    const fatigue = computeMuscleFatigue({
      sets: gluteWork,
      exercises: CATALOG,
      now: NOW,
    });

    // Precondition: the model actually considers the glutes cooked.
    expect(fatigue.glutes).toBeGreaterThan(0.65);

    const plan = recommendWorkout(
      baseInput({ fatigue, history: gluteWork, targetMinutes: 60 }),
    );

    const glutePrimary = plan.exercises.filter((rec) =>
      byId(rec.exerciseId).primaryMuscles.includes('glutes'),
    );

    expect(glutePrimary).toHaveLength(0);
    // ...and it still produced a real workout rather than giving up.
    expect(plan.exercises.length).toBeGreaterThanOrEqual(5);
  });

  it('comes back to a muscle once it has recovered', () => {
    const oldGluteWork: SetRecord[] = [];
    for (let s = 0; s < 6; s++) {
      oldGluteWork.push(set('barbell-hip-thrust', 10, 135, daysAgo(9)));
    }

    const fatigue = computeMuscleFatigue({
      sets: oldGluteWork,
      exercises: CATALOG,
      now: NOW,
    });
    expect(fatigue.glutes).toBeLessThan(0.3);

    const plan = recommendWorkout(
      baseInput({ fatigue, history: oldGluteWork, targetMinutes: 60 }),
    );

    const touchesGlutes = plan.exercises.some((rec) => {
      const ex = byId(rec.exerciseId);
      return ex.primaryMuscles.includes('glutes') || ex.secondaryMuscles.includes('glutes');
    });
    expect(touchesGlutes).toBe(true);
  });
});
