import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { MuscleChips, Pips, RecoveryStrip, Thumb, relativeDay } from '../components';

/**
 * Today — plan-forward (design study variant 2A) with a zero-question flow (6A).
 *
 * The plan already exists by the time this renders: nothing is asked before the
 * first rep. Because there's no session-length prompt, editing the list here is
 * the pressure valve for a short day, so removing a slot is a first-class
 * action rather than something buried in the workout screen.
 */
export function Today() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const workout = useQuery({ queryKey: ['today'], queryFn: api.today });
  const recovery = useQuery({ queryKey: ['recovery'], queryFn: api.recovery });
  const history = useQuery({ queryKey: ['history', 3], queryFn: () => api.history(3) });

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['today'] });
    queryClient.invalidateQueries({ queryKey: ['recovery'] });
  };

  const regenerate = useMutation({ mutationFn: api.regenerate, onSuccess: refresh });
  const removeSlot = useMutation({
    mutationFn: ({ workoutId, slotId }: { workoutId: string; slotId: string }) =>
      api.removeSlot(workoutId, slotId),
    onSuccess: refresh,
  });

  if (workout.isLoading) {
    return (
      <div className="screen">
        <p className="muted">Building today's workout…</p>
      </div>
    );
  }

  if (workout.error) {
    return (
      <div className="screen">
        <div className="banner error">{(workout.error as Error).message}</div>
      </div>
    );
  }

  const plan = workout.data!;
  const done = plan.exercises.filter((e) => e.status === 'completed').length;
  const inProgress = plan.status === 'in_progress';
  const allDone = plan.exercises.length > 0 && done === plan.exercises.length;

  return (
    <div className="screen stack loose">
      {recovery.data && recovery.data.muscles.some((m) => m.lastTrainedAt) && (
        <section className="stack tight">
          <div className="row between">
            <h2 className="section">Recovery</h2>
            <span className="pill-count">why these picks</span>
          </div>
          <RecoveryStrip muscles={recovery.data.muscles} />
        </section>
      )}

      <section className="stack">
        <div className="row between">
          <h2 className="section">
            {inProgress ? 'In progress' : 'Today'} · {plan.exercises.length} exercises
          </h2>
          <span className="pill-count">~{plan.targetMinutes} min</span>
        </div>

        {plan.exercises.length > 0 && <Pips total={plan.exercises.length} done={done} />}

        {plan.exercises.length === 0 && (
          <div className="empty">
            <span className="glyph">◎</span>
            <p>
              No exercises could be planned. Check your available equipment in Settings, or
              un-hide some exercises.
            </p>
          </div>
        )}

        <div className="list">
          {plan.exercises.map((slot, i) => (
            <div key={slot.id} className={`card ${slot.status === 'completed' ? '' : ''}`}>
              <div className="row">
                <Thumb mediaUrl={slot.mediaUrl} equipment={slot.equipment} alt={slot.name} />
                <div className="grow">
                  <div className="row between">
                    <strong style={{ fontSize: 15.5, letterSpacing: '-0.01em' }}>
                      {i + 1}. {slot.name}
                    </strong>
                    <span className="tiny">
                      {slot.status === 'completed'
                        ? '✓'
                        : `${slot.targetSets}×${slot.targetRepsLow}–${slot.targetRepsHigh}`}
                    </span>
                  </div>
                  <div style={{ marginTop: 6 }}>
                    <MuscleChips
                      primary={slot.primaryMuscles}
                      secondary={slot.secondaryMuscles}
                      max={3}
                    />
                  </div>
                  {/*
                    The rationale is a snapshot of why this was picked when the
                    plan was built. Once the exercise is done it's both stale
                    ("you haven't tried this one yet" after you just did) and
                    beside the point — what you lifted matters more.
                  */}
                  {slot.status === 'completed' ? (
                    <p className="tiny" style={{ margin: '7px 0 0' }}>
                      {slot.sets.length} set{slot.sets.length === 1 ? '' : 's'} logged
                    </p>
                  ) : (
                    slot.rationale && (
                      <p className="tiny" style={{ margin: '7px 0 0' }}>
                        {slot.rationale}
                      </p>
                    )
                  )}
                </div>
              </div>

              {plan.status === 'planned' && (
                <button
                  type="button"
                  className="btn ghost sm"
                  style={{ marginTop: 10 }}
                  onClick={() => removeSlot.mutate({ workoutId: plan.id, slotId: slot.id })}
                  disabled={removeSlot.isPending}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>

        {plan.exercises.length > 0 && (
          <div className="stack tight">
            <button
              type="button"
              className="btn"
              onClick={() => navigate(`/workout/${plan.id}`)}
            >
              {allDone ? 'Review workout' : inProgress ? 'Continue workout' : 'Start workout'}
            </button>

            {plan.status === 'planned' && (
              <button
                type="button"
                className="btn ghost"
                onClick={() => regenerate.mutate()}
                disabled={regenerate.isPending}
              >
                {regenerate.isPending ? 'Rebuilding…' : 'Build a different workout'}
              </button>
            )}
          </div>
        )}
      </section>

      {history.data && history.data.workouts.length > 0 && (
        <section className="stack tight">
          <h2 className="section">Recent sessions</h2>
          <div className="list">
            {history.data.workouts.map((w) => (
              <div key={w.id} className="card">
                <div className="row between">
                  <strong style={{ fontSize: 14.5 }}>{relativeDay(w.date)}</strong>
                  <span className="tiny">
                    {w.exerciseCount} exercises · {w.setCount} sets
                  </span>
                </div>
                <p className="tiny" style={{ margin: '5px 0 0' }}>
                  {w.exerciseNames.join(' · ')}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
