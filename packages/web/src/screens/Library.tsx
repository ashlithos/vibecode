import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  BODY_REGIONS,
  BODY_REGION_LABELS,
  EQUIPMENT,
  EQUIPMENT_LABELS,
  MUSCLES,
  MUSCLE_LABELS,
  type BodyRegion,
  type Equipment,
  type Muscle,
} from '@gym/shared';
import { api } from '../api';
import { MuscleChips, Thumb, relativeDay } from '../components';

/**
 * Library — filter chips + card grid (design study variant 4A).
 *
 * Hidden exercises get a visible section at the bottom rather than living in a
 * settings menu, so "never show this again" stays reversible by anyone who
 * didn't read the docs.
 */
export function Library() {
  const [region, setRegion] = useState<BodyRegion | null>(null);
  const [muscle, setMuscle] = useState<Muscle | null>(null);
  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [search, setSearch] = useState('');
  const [showHidden, setShowHidden] = useState(false);

  const params: Record<string, string> = {};
  if (region) params.bodyRegion = region;
  if (muscle) params.muscle = muscle;
  if (equipment) params.equipment = equipment;
  if (search.trim()) params.q = search.trim();

  const list = useQuery({
    queryKey: ['exercises', params],
    queryFn: () => api.exercises(params),
  });

  const hidden = useQuery({
    queryKey: ['exercises', 'hidden'],
    queryFn: () => api.exercises({ hidden: 'true' }),
    enabled: showHidden,
  });

  const hiddenCount = list.data?.hiddenCount ?? 0;

  return (
    <div className="screen stack">
      <input
        className="card"
        style={{ width: '100%', fontSize: 16, padding: '13px 14px' }}
        type="search"
        placeholder="Search exercises"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        aria-label="Search exercises"
      />

      <div className="stack tight">
        <div className="chip-scroll">
          {BODY_REGIONS.map((r) => (
            <button
              key={r}
              type="button"
              className={`chip ${region === r ? 'on' : ''}`}
              onClick={() => setRegion(region === r ? null : r)}
            >
              {BODY_REGION_LABELS[r]}
            </button>
          ))}
        </div>

        <div className="chip-scroll">
          {MUSCLES.map((m) => (
            <button
              key={m}
              type="button"
              className={`chip ${muscle === m ? 'on' : ''}`}
              onClick={() => setMuscle(muscle === m ? null : m)}
            >
              {MUSCLE_LABELS[m]}
            </button>
          ))}
        </div>

        <div className="chip-scroll">
          {EQUIPMENT.map((e) => (
            <button
              key={e}
              type="button"
              className={`chip ${equipment === e ? 'on' : ''}`}
              onClick={() => setEquipment(equipment === e ? null : e)}
            >
              {EQUIPMENT_LABELS[e]}
            </button>
          ))}
        </div>
      </div>

      <div className="row between">
        <span className="pill-count">
          {list.data ? `${list.data.exercises.length} exercises` : 'Loading…'}
        </span>
        {(region || muscle || equipment || search) && (
          <button
            type="button"
            className="btn ghost sm"
            onClick={() => {
              setRegion(null);
              setMuscle(null);
              setEquipment(null);
              setSearch('');
            }}
          >
            Clear filters
          </button>
        )}
      </div>

      {list.data?.exercises.length === 0 && (
        <div className="empty">
          <span className="glyph">⌕</span>
          <p>Nothing matches those filters.</p>
        </div>
      )}

      <div className="list">
        {list.data?.exercises.map((ex) => (
          <Link key={ex.id} to={`/library/${ex.id}`} className="card tap">
            <div className="row">
              <Thumb mediaUrl={ex.mediaUrl} equipment={ex.equipment} alt={ex.name} />
              <div className="grow">
                <div className="row between">
                  <strong style={{ fontSize: 15.5, letterSpacing: '-0.01em' }}>
                    {ex.name}
                  </strong>
                  {ex.preference === 'favorite' && <span aria-label="Favorite">♥</span>}
                </div>
                <div style={{ margin: '6px 0 4px' }}>
                  <MuscleChips
                    primary={ex.primaryMuscles}
                    secondary={ex.secondaryMuscles}
                    max={3}
                  />
                </div>
                <span className="tiny">
                  {EQUIPMENT_LABELS[ex.equipment]}
                  {ex.lastPerformedAt ? ` · last done ${relativeDay(ex.lastPerformedAt)}` : ''}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {hiddenCount > 0 && (
        <section className="stack tight" style={{ marginTop: 12 }}>
          <hr className="divider" />
          <button
            type="button"
            className="btn ghost"
            onClick={() => setShowHidden((s) => !s)}
            aria-expanded={showHidden}
          >
            Hidden ({hiddenCount}) {showHidden ? '▾' : '▸'}
          </button>

          {showHidden && (
            <div className="list">
              {hidden.data?.exercises.map((ex) => (
                <Link key={ex.id} to={`/library/${ex.id}`} className="card tap">
                  <div className="row between">
                    <span style={{ fontSize: 14.5 }}>{ex.name}</span>
                    <span className="tiny">tap to restore</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
