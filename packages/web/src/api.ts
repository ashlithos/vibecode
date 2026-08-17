import type {
  BodyRegion,
  Difficulty,
  Equipment,
  FatigueBand,
  LoadType,
  MovementPattern,
  Muscle,
  PreferenceStatus,
} from '@gym/shared';

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  // Only declare a JSON content-type when there's actually a body — Fastify
  // rejects an empty body sent with content-type: application/json as a 400.
  const headers = init?.body
    ? { 'content-type': 'application/json', ...(init?.headers ?? {}) }
    : init?.headers;

  const res = await fetch(url, { ...init, headers });

  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? `Request failed (${res.status})`);
  }

  return res.json() as Promise<T>;
}

// --- types the client renders ---------------------------------------------

export interface ExerciseCard {
  id: string;
  name: string;
  bodyRegion: BodyRegion;
  equipment: Equipment;
  difficulty: Difficulty;
  primaryMuscles: Muscle[];
  secondaryMuscles: Muscle[];
  movementPatterns: MovementPattern[];
  mediaUrl: string | null;
  mediaKind: string | null;
  preference: PreferenceStatus;
  skipUntil: string | null;
  lastPerformedAt: string | null;
}

export interface ExerciseDetail extends ExerciseCard {
  loadType: LoadType;
  loadIncrement: number;
  defaultSets: number;
  defaultRepsLow: number;
  defaultRepsHigh: number;
  machineIdentification: string | null;
  instructions: string[];
  keyCues: string[];
  commonMistakes: string[];
  alternatives: { id: string; name: string; equipment: Equipment; primaryMuscles: Muscle[] }[];
  history: { load: number | null; reps: number; rir: number | null; unit: string; completedAt: string }[];
}

export interface SetEntry {
  id: string;
  setIndex: number;
  reps: number;
  load: number | null;
  rir: number | null;
  unit: string;
  completedAt: string;
}

export interface WorkoutSlot {
  id: string;
  exerciseId: string;
  name: string;
  equipment: Equipment | null;
  loadType: LoadType;
  loadIncrement: number;
  primaryMuscles: Muscle[];
  secondaryMuscles: Muscle[];
  keyCues: string[];
  machineIdentification: string | null;
  mediaUrl: string | null;
  mediaKind: string | null;
  order: number;
  status: 'pending' | 'active' | 'completed' | 'skipped';
  rationale: string | null;
  targetSets: number;
  targetRepsLow: number;
  targetRepsHigh: number;
  suggestedLoad: number | null;
  alternatives: { id: string; name: string; equipment: Equipment }[];
  sets: SetEntry[];
}

export interface Workout {
  id: string;
  date: string;
  status: 'planned' | 'in_progress' | 'completed' | 'abandoned';
  targetMinutes: number;
  completedAt: string | null;
  exercises: WorkoutSlot[];
}

export interface MuscleRecoveryView {
  muscle: Muscle;
  fatigue: number;
  band: FatigueBand;
  lastTrainedAt: string | null;
  daysSinceTrained: number | null;
}

export interface Settings {
  goal: string;
  daysPerWeek: number;
  defaultSessionMinutes: number;
  unit: 'lb' | 'kg';
  equipment: { id: Equipment; available: boolean }[];
}

export interface WorkoutSummaryRow {
  id: string;
  date: string;
  status: string;
  exerciseCount: number;
  setCount: number;
  exerciseNames: string[];
}

// --- calls -----------------------------------------------------------------

export const api = {
  exercises: (params: Record<string, string> = {}) =>
    request<{ exercises: ExerciseCard[]; hiddenCount: number }>(
      `/api/exercises?${new URLSearchParams(params)}`,
    ),

  exercise: (id: string) => request<ExerciseDetail>(`/api/exercises/${id}`),

  setPreference: (id: string, body: { status?: PreferenceStatus; skipToday?: boolean }) =>
    request<{ exerciseId: string; status: PreferenceStatus; skipUntil: string | null }>(
      `/api/exercises/${id}/preference`,
      { method: 'PUT', body: JSON.stringify(body) },
    ),

  today: () => request<Workout>('/api/workouts/today'),

  regenerate: () => request<Workout>('/api/workouts/today/regenerate', { method: 'POST' }),

  startWorkout: (id: string) => request<Workout>(`/api/workouts/${id}/start`, { method: 'POST' }),

  completeWorkout: (id: string) =>
    request<Workout>(`/api/workouts/${id}/complete`, { method: 'POST' }),

  logSet: (workoutId: string, slotId: string, body: { reps: number; load: number | null }) =>
    request<Workout>(`/api/workouts/${workoutId}/exercises/${slotId}/sets`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  deleteSet: (workoutId: string, setId: string) =>
    request<Workout>(`/api/workouts/${workoutId}/sets/${setId}`, { method: 'DELETE' }),

  updateSlot: (
    workoutId: string,
    slotId: string,
    body: { status?: string; order?: number; swapToExerciseId?: string },
  ) =>
    request<Workout>(`/api/workouts/${workoutId}/exercises/${slotId}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),

  removeSlot: (workoutId: string, slotId: string) =>
    request<Workout>(`/api/workouts/${workoutId}/exercises/${slotId}`, { method: 'DELETE' }),

  recovery: () => request<{ muscles: MuscleRecoveryView[] }>('/api/recovery'),

  settings: () => request<Settings>('/api/settings'),

  updateSettings: (body: Partial<Omit<Settings, 'equipment'>>) =>
    request<Settings>('/api/settings', { method: 'PUT', body: JSON.stringify(body) }),

  updateEquipment: (equipment: { id: Equipment; available: boolean }[]) =>
    request<{ equipment: { id: Equipment; available: boolean }[] }>('/api/equipment', {
      method: 'PUT',
      body: JSON.stringify({ equipment }),
    }),

  history: (limit = 15) =>
    request<{ workouts: WorkoutSummaryRow[] }>(`/api/workouts?limit=${limit}`),
};
