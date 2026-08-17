import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { MUSCLE_LABELS } from '@gym/shared';
import { api, type Workout as WorkoutData, type WorkoutSlot } from '../api';
import { MediaPanel, MuscleChips, Pips, Stepper } from '../components';

/**
 * Workout — split reference / logger (design study variant 3C).
 *
 * Top half is reference: media (or the machine-identification strip while there
 * is no media) plus the cues. Bottom half is the logger. One exercise at a
 * time, one obvious primary action.
 */
export function Workout() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['workout', id],
    queryFn: () => api.startWorkout(id!),
    enabled: Boolean(id),
  });

  const onWorkoutChange = (next: WorkoutData) => {
    queryClient.setQueryData(['workout', id], next);
    queryClient.invalidateQueries({ queryKey: ['today'] });
    queryClient.invalidateQueries({ queryKey: ['recovery'] });
  };

  const logSet = useMutation({
    mutationFn: (vars: { slotId: string; reps: number; load: number | null }) =>
      api.logSet(id!, vars.slotId, { reps: vars.reps, load: vars.load }),
    onSuccess: onWorkoutChange,
  });

  const undoSet = useMutation({
    mutationFn: (setId: string) => api.deleteSet(id!, setId),
    onSuccess: onWorkoutChange,
  });

  const swap = useMutation({
    mutationFn: (vars: { slotId: string; exerciseId: string }) =>
      api.updateSlot(id!, vars.slotId, { swapToExerciseId: vars.exerciseId }),
    onSuccess: onWorkoutChange,
  });

  const finish = useMutation({
    mutationFn: () => api.completeWorkout(id!),
    onSuccess: (next) => {
      onWorkoutChange(next);
      queryClient.invalidateQueries({ queryKey: ['history', 3] });
      navigate('/');
    },
  });

  const [index, setIndex] = useState(0);
  const [showSwap, setShowSwap] = useState(false);

  const slots = data?.exercises ?? [];

  // Land on the first unfinished exercise rather than always at the top — you
  // usually reopen this mid-session, not at the start.
  const firstUnfinished = useMemo(
    () => Math.max(0, slots.findIndex((s) => s.status !== 'completed')),
    [slots],
  );

  useEffect(() => {
    if (slots.length > 0) setIndex(firstUnfinished);
    // Only on first load of a workout — after that the user drives navigation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.id]);

  if (isLoading) {
    return (
      <div className="screen">
        <p className="muted">Loading…</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="screen">
        <div className="banner error">{(error as Error)?.message ?? 'Workout not found'}</div>
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="screen empty">
        <span className="glyph">◎</span>
        <p>This workout has no exercises.</p>
        <Link to="/" className="btn subtle" style={{ marginTop: 16 }}>
          Back to today
        </Link>
      </div>
    );
  }

  const slot = slots[Math.min(index, slots.length - 1)];
  const allDone = slots.every((s) => s.status === 'completed');

  return (
    <div className="screen stack loose">
      <Pips total={slots.length} done={slots.filter((s) => s.status === 'completed').length} />

      {/* ---------- reference half ---------- */}
      <section className="stack">
        <div>
          <div className="label">
            Exercise {index + 1} of {slots.length}
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 720, letterSpacing: '-0.025em', margin: '4px 0 8px' }}>
            {slot.name}
          </h2>
          <MuscleChips primary={slot.primaryMuscles} secondary={slot.secondaryMuscles} />
        </div>

        <MediaPanel
          mediaUrl={slot.mediaUrl}
          mediaKind={slot.mediaKind}
          machineIdentification={slot.machineIdentification}
          name={slot.name}
        />

        {slot.keyCues.length > 0 && (
          <div className="card">
            <div className="label" style={{ marginBottom: 6 }}>
              Remember
            </div>
            <ul className="bullets" style={{ marginBottom: 0 }}>
              {slot.keyCues.map((cue) => (
                <li key={cue}>{cue}</li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <hr className="divider" />

      {/* ---------- logger half ---------- */}
      <SetLogger
        key={slot.id}
        slot={slot}
        onLog={(reps, load) => logSet.mutate({ slotId: slot.id, reps, load })}
        onUndo={(setId) => undoSet.mutate(setId)}
        busy={logSet.isPending || undoSet.isPending}
      />

      {/* ---------- navigation & secondary actions ---------- */}
      <section className="stack tight">
        {index < slots.length - 1 && (
          <p className="tiny" style={{ margin: 0, textAlign: 'center' }}>
            Up next: {slots[index + 1].name}
          </p>
        )}

        <div className="row" style={{ gap: 8 }}>
          <button
            type="button"
            className="btn subtle"
            onClick={() => setIndex((i) => Math.max(0, i - 1))}
            disabled={index === 0}
          >
            ‹ Previous
          </button>
          <button
            type="button"
            className="btn subtle"
            onClick={() => setIndex((i) => Math.min(slots.length - 1, i + 1))}
            disabled={index >= slots.length - 1}
          >
            Next ›
          </button>
        </div>

        {slot.alternatives.length > 0 && (
          <>
            <button
              type="button"
              className="btn ghost"
              onClick={() => setShowSwap((s) => !s)}
              aria-expanded={showSwap}
            >
              {showSwap ? 'Cancel swap' : 'Swap this exercise'}
            </button>

            {showSwap && (
              <div className="list">
                {slot.alternatives.map((alt) => (
                  <button
                    key={alt.id}
                    type="button"
                    className="card tap"
                    onClick={() => {
                      swap.mutate({ slotId: slot.id, exerciseId: alt.id });
                      setShowSwap(false);
                    }}
                  >
                    <div className="row between">
                      <strong style={{ fontSize: 14.5 }}>{alt.name}</strong>
                      <span className="tiny">{alt.equipment}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        <Link className="btn ghost" to={`/library/${slot.exerciseId}`}>
          Full instructions
        </Link>

        {allDone && (
          <button
            type="button"
            className="btn"
            onClick={() => finish.mutate()}
            disabled={finish.isPending}
          >
            {finish.isPending ? 'Saving…' : 'Finish workout'}
          </button>
        )}
      </section>
    </div>
  );
}

// ---------------------------------------------------------------------------

function SetLogger({
  slot,
  onLog,
  onUndo,
  busy,
}: {
  slot: WorkoutSlot;
  onLog: (reps: number, load: number | null) => void;
  onUndo: (setId: string) => void;
  busy: boolean;
}) {
  const usesLoad = slot.loadType === 'weight' || slot.loadType === 'assistance';
  const isTime = slot.loadType === 'time';

  const lastSet = slot.sets[slot.sets.length - 1];
  const [load, setLoad] = useState<number>(
    lastSet?.load ?? slot.suggestedLoad ?? 0,
  );
  const [reps, setReps] = useState<number>(lastSet?.reps ?? slot.targetRepsLow);

  const setNumber = slot.sets.length + 1;
  const complete = slot.status === 'completed';

  return (
    <section className="stack">
      <div className="row between">
        <h2 className="section">
          {complete ? 'All sets logged' : `Set ${setNumber} of ${slot.targetSets}`}
        </h2>
        <span className="tiny">
          target {slot.targetRepsLow}–{slot.targetRepsHigh}
          {isTime ? 's' : ' reps'}
          {usesLoad && slot.suggestedLoad !== null
            ? ` @ ${slot.suggestedLoad}${slot.loadType === 'assistance' ? ' assist' : ''}`
            : ''}
        </span>
      </div>

      {slot.sets.length > 0 && (
        <div className="list">
          {slot.sets.map((s) => (
            <div key={s.id} className="set-row done">
              <span className="n">SET {s.setIndex + 1}</span>
              <span className="v">
                {s.load !== null ? `${s.load} ${s.unit} × ` : ''}
                {s.reps}
                {isTime ? 's' : ''}
              </span>
              <button
                type="button"
                className="btn ghost sm"
                style={{ marginLeft: 'auto' }}
                onClick={() => onUndo(s.id)}
                disabled={busy}
              >
                Undo
              </button>
            </div>
          ))}
        </div>
      )}

      {!complete && (
        <>
          {/*
            No suggested load means no history to base one on. Saying so beats
            showing a bare 0 — on an assistance machine 0 means no help at all,
            which is the hardest possible setting, not a neutral starting point.
          */}
          {usesLoad && slot.suggestedLoad === null && slot.sets.length === 0 && (
            <p className="tiny" style={{ margin: 0 }}>
              First time doing this — set a{' '}
              {slot.loadType === 'assistance' ? 'level of assistance' : 'load'} you can control
              for {slot.targetRepsLow}–{slot.targetRepsHigh} reps. Next time it'll suggest one.
            </p>
          )}

          {usesLoad && (
            <Stepper
              value={load}
              unit={slot.loadType === 'assistance' ? 'lb assist' : 'lb'}
              step={slot.loadIncrement || 5}
              onChange={setLoad}
              disabled={busy}
            />
          )}

          <Stepper
            value={reps}
            unit={isTime ? 'seconds' : 'reps'}
            step={isTime ? 5 : 1}
            min={0}
            onChange={setReps}
            disabled={busy}
          />

          <button
            type="button"
            className="btn"
            onClick={() => onLog(reps, usesLoad ? load : null)}
            disabled={busy}
          >
            {busy ? 'Saving…' : `Complete set ${setNumber}`}
          </button>
        </>
      )}

      {complete && (
        <p className="muted" style={{ margin: 0 }}>
          ✓ {slot.name} done — {slot.primaryMuscles.map((m) => MUSCLE_LABELS[m]).join(', ')}
        </p>
      )}
    </section>
  );
}
