import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { EQUIPMENT_LABELS, type Equipment } from '@gym/shared';
import { api } from '../api';
import { useAuth, useSignOut } from '../AuthGate';

/**
 * Settings.
 *
 * With no session-length prompt in the flow (variant 6A), equipment
 * availability and default session length are the two levers that shape every
 * recommendation — so they live here rather than being buried.
 */
export function Settings() {
  const queryClient = useQueryClient();
  const user = useAuth();
  const signOut = useSignOut();
  const settings = useQuery({ queryKey: ['settings'], queryFn: api.settings });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['settings'] });
    queryClient.invalidateQueries({ queryKey: ['today'] });
    queryClient.invalidateQueries({ queryKey: ['exercises'] });
  };

  const updateEquipment = useMutation({
    mutationFn: api.updateEquipment,
    onSuccess: invalidate,
  });

  const updateSettings = useMutation({
    mutationFn: api.updateSettings,
    onSuccess: invalidate,
  });

  if (!settings.data) {
    return (
      <div className="screen">
        <p className="muted">Loading…</p>
      </div>
    );
  }

  const data = settings.data;
  const availableCount = data.equipment.filter((e) => e.available).length;

  const toggle = (id: Equipment) => {
    const next = data.equipment.map((e) =>
      e.id === id ? { ...e, available: !e.available } : e,
    );
    updateEquipment.mutate(next);
  };

  return (
    <div className="screen stack loose">
      <section className="stack tight">
        <h2 className="section">Account</h2>
        <div className="card">
          <div className="account-row">
            {user.image ? (
              <img className="avatar" src={user.image} alt="" />
            ) : (
              <div className="avatar" aria-hidden="true" />
            )}
            <div className="grow">
              {user.name && <strong style={{ fontSize: 14.5 }}>{user.name}</strong>}
              <div className="tiny">{user.email}</div>
            </div>
          </div>
          <button
            type="button"
            className="btn ghost"
            style={{ marginTop: 12 }}
            onClick={signOut}
          >
            Sign out
          </button>
        </div>
      </section>

      <section className="stack tight">
        <h2 className="section">Available equipment</h2>
        <p className="tiny">
          Only exercises using equipment you have access to get recommended. Turn things off if
          your gym doesn't have them.
        </p>

        {availableCount === 0 && (
          <div className="banner">
            Nothing is available, so no workout can be planned. Turn at least one on.
          </div>
        )}

        <div className="card">
          {data.equipment.map((e) => (
            <div key={e.id} className="toggle-row">
              <span>{EQUIPMENT_LABELS[e.id]}</span>
              <button
                type="button"
                role="switch"
                aria-checked={e.available}
                aria-label={EQUIPMENT_LABELS[e.id]}
                className={`switch ${e.available ? 'on' : ''}`}
                onClick={() => toggle(e.id)}
                disabled={updateEquipment.isPending}
              />
            </div>
          ))}
        </div>
      </section>

      <section className="stack tight">
        <h2 className="section">Session length</h2>
        <p className="tiny">
          Sets how many exercises get planned. You can still remove exercises from a plan on a
          short day.
        </p>
        <div className="chips">
          {[15, 30, 45, 60].map((mins) => (
            <button
              key={mins}
              type="button"
              className={`chip ${data.defaultSessionMinutes === mins ? 'on' : ''}`}
              style={{ padding: '10px 16px' }}
              onClick={() => updateSettings.mutate({ defaultSessionMinutes: mins })}
              disabled={updateSettings.isPending}
            >
              {mins} min
            </button>
          ))}
        </div>
      </section>

      <section className="stack tight">
        <h2 className="section">Training days per week</h2>
        <div className="chips">
          {[2, 3, 4, 5].map((days) => (
            <button
              key={days}
              type="button"
              className={`chip ${data.daysPerWeek === days ? 'on' : ''}`}
              style={{ padding: '10px 16px' }}
              onClick={() => updateSettings.mutate({ daysPerWeek: days })}
              disabled={updateSettings.isPending}
            >
              {days}
            </button>
          ))}
        </div>
      </section>

      <section className="stack tight">
        <h2 className="section">Units</h2>
        <div className="chips">
          {(['lb', 'kg'] as const).map((unit) => (
            <button
              key={unit}
              type="button"
              className={`chip ${data.unit === unit ? 'on' : ''}`}
              style={{ padding: '10px 16px' }}
              onClick={() => updateSettings.mutate({ unit })}
              disabled={updateSettings.isPending}
            >
              {unit}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
