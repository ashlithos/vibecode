import { useQuery } from '@tanstack/react-query';
import { api } from '../api';
import { RecoveryStrip, relativeDay } from '../components';

export function History() {
  const history = useQuery({ queryKey: ['history', 30], queryFn: () => api.history(30) });
  const recovery = useQuery({ queryKey: ['recovery'], queryFn: api.recovery });

  const workouts = history.data?.workouts ?? [];

  return (
    <div className="screen stack loose">
      {recovery.data && (
        <section className="stack tight">
          <h2 className="section">Recovery right now</h2>
          <RecoveryStrip muscles={recovery.data.muscles} />
          <p className="tiny">
            Based on what you've trained recently, not on how sore you feel. Exposure fades over
            about a day and a half.
          </p>
        </section>
      )}

      <section className="stack tight">
        <h2 className="section">Completed sessions</h2>

        {history.isLoading && <p className="muted">Loading…</p>}

        {!history.isLoading && workouts.length === 0 && (
          <div className="empty">
            <span className="glyph">◷</span>
            <p>No finished workouts yet. They'll show up here once you complete one.</p>
          </div>
        )}

        <div className="list">
          {workouts.map((w) => (
            <div key={w.id} className="card">
              <div className="row between">
                <strong style={{ fontSize: 15 }}>{relativeDay(w.date)}</strong>
                <span className="tiny">
                  {w.exerciseCount} exercises · {w.setCount} sets
                </span>
              </div>
              <p className="tiny" style={{ margin: '6px 0 0' }}>
                {w.exerciseNames.join(' · ')}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
