import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import {
  EQUIPMENT_LABELS,
  MOVEMENT_PATTERN_LABELS,
  type PreferenceStatus,
} from '@gym/shared';
import { api } from '../api';
import { MediaPanel, MuscleChips, relativeDay } from '../components';

/**
 * Exercise detail — single scroll (design study variant 5A).
 *
 * Ordered by what you need first when standing in front of an unfamiliar
 * machine: what it looks like, what it trains, where to find it, how to do it.
 * Nothing hidden behind a tab you forget exists.
 */
export function ExerciseDetail() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['exercise', id],
    queryFn: () => api.exercise(id!),
    enabled: Boolean(id),
  });

  const setPreference = useMutation({
    mutationFn: (body: { status?: PreferenceStatus; skipToday?: boolean }) =>
      api.setPreference(id!, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercise', id] });
      queryClient.invalidateQueries({ queryKey: ['exercises'] });
      queryClient.invalidateQueries({ queryKey: ['today'] });
    },
  });

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
        <div className="banner error">{(error as Error)?.message ?? 'Not found'}</div>
      </div>
    );
  }

  const skipped = data.skipUntil && new Date(data.skipUntil) > new Date();

  return (
    <div className="screen stack loose">
      {/* Name first: the back button carries no title, so this page has to say
          what it is before it says where to find it. */}
      <section className="stack">
        <div>
          <h2 style={{ fontSize: 23, fontWeight: 720, letterSpacing: '-0.025em', margin: '0 0 8px' }}>
            {data.name}
          </h2>
          <MuscleChips primary={data.primaryMuscles} secondary={data.secondaryMuscles} />
        </div>

        <div className="row" style={{ flexWrap: 'wrap', gap: 8 }}>
          <span className="tiny">{EQUIPMENT_LABELS[data.equipment]}</span>
          <span className="tiny">·</span>
          <span className="tiny">{data.difficulty}</span>
          <span className="tiny">·</span>
          <span className="tiny">
            {data.movementPatterns.map((p) => MOVEMENT_PATTERN_LABELS[p]).join(', ')}
          </span>
          <span className="tiny">·</span>
          <span className="tiny">
            {data.lastPerformedAt ? `last done ${relativeDay(data.lastPerformedAt)}` : 'never done'}
          </span>
        </div>

        <MediaPanel
          mediaUrl={data.mediaUrl}
          mediaKind={data.mediaKind}
          machineIdentification={data.machineIdentification}
          name={data.name}
        />
      </section>

      <section className="stack tight">
        <h2 className="section">Setup</h2>
        <ol className="numbered">
          {data.instructions.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </section>

      <section className="stack tight">
        <h2 className="section">Key cues</h2>
        <ul className="bullets">
          {data.keyCues.map((cue) => (
            <li key={cue}>{cue}</li>
          ))}
        </ul>
      </section>

      <section className="stack tight">
        <h2 className="section">Common mistakes</h2>
        <ul className="bullets">
          {data.commonMistakes.map((m) => (
            <li key={m}>{m}</li>
          ))}
        </ul>
      </section>

      <section className="stack tight">
        <h2 className="section">Your preference</h2>
        <div className="chips">
          {(['favorite', 'neutral', 'never'] as const).map((status) => (
            <button
              key={status}
              type="button"
              className={`chip ${data.preference === status ? 'on' : ''}`}
              style={{ padding: '9px 14px' }}
              onClick={() => setPreference.mutate({ status })}
              disabled={setPreference.isPending}
            >
              {status === 'favorite' ? '♥ Favorite' : status === 'never' ? '⊘ Never show' : 'Neutral'}
            </button>
          ))}
          <button
            type="button"
            className={`chip ${skipped ? 'on' : ''}`}
            style={{ padding: '9px 14px' }}
            onClick={() => setPreference.mutate({ skipToday: !skipped })}
            disabled={setPreference.isPending}
          >
            ⏭ {skipped ? 'Skipped today' : 'Skip today'}
          </button>
        </div>
        <p className="tiny">
          Skipping only affects today. "Never show" hides it from recommendations but keeps it in
          the library, so you can always bring it back.
        </p>
      </section>

      {data.alternatives.length > 0 && (
        <section className="stack tight">
          <h2 className="section">Similar exercises</h2>
          <div className="list">
            {data.alternatives.map((alt) => (
              <Link key={alt.id} to={`/library/${alt.id}`} className="card tap">
                <div className="row between">
                  <strong style={{ fontSize: 14.5 }}>{alt.name}</strong>
                  <span className="tiny">{EQUIPMENT_LABELS[alt.equipment]}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {data.history.length > 0 && (
        <section className="stack tight">
          <h2 className="section">Your history</h2>
          <div className="list">
            {data.history.slice(0, 12).map((h, i) => (
              <div key={i} className="set-row">
                <span className="n">{relativeDay(h.completedAt)}</span>
                <span className="v">
                  {h.load !== null ? `${h.load} ${h.unit} × ` : ''}
                  {h.reps}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
