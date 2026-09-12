import { MUSCLE_LABELS, type Muscle } from '@gym/shared';
import type { MuscleRecoveryView } from './api';

/**
 * Primary and secondary muscles are rendered as visually distinct chips and
 * never collapsed into one list — implying an exercise trains only its primary
 * muscle is the most common way exercise UIs mislead people.
 */
export function MuscleChips({
  primary,
  secondary,
  max,
}: {
  primary: Muscle[];
  secondary?: Muscle[];
  max?: number;
}) {
  const secondaries = secondary ?? [];
  const shown = max ? secondaries.slice(0, Math.max(0, max - primary.length)) : secondaries;
  const hidden = secondaries.length - shown.length;

  return (
    <div className="chips">
      {primary.map((m) => (
        <span key={m} className="chip primary-muscle">
          {MUSCLE_LABELS[m]}
        </span>
      ))}
      {shown.map((m) => (
        <span key={m} className="chip secondary-muscle">
          {MUSCLE_LABELS[m]}
        </span>
      ))}
      {hidden > 0 && <span className="chip secondary-muscle">+{hidden}</span>}
    </div>
  );
}

/**
 * Gym shorthand rather than emoji. Emoji render inconsistently — some
 * monochrome, some full colour — which looks like a bug in a list, and these
 * abbreviations are what's actually written on gym whiteboards anyway.
 */
const EQUIPMENT_SHORT: Record<string, string> = {
  machine: 'MCH',
  cable: 'CBL',
  dumbbell: 'DB',
  barbell: 'BB',
  bodyweight: 'BW',
  smith_machine: 'SM',
  kettlebell: 'KB',
};

export function Thumb({
  mediaUrl,
  equipment,
  alt,
}: {
  mediaUrl: string | null;
  equipment: string | null;
  alt: string;
}) {
  if (mediaUrl) return <img className="thumb" src={mediaUrl} alt={alt} />;
  return (
    <div className="thumb thumb-tag" aria-hidden="true">
      {EQUIPMENT_SHORT[equipment ?? ''] ?? '—'}
    </div>
  );
}

/**
 * Media panel for the workout and detail screens.
 *
 * There is no media at launch, so rather than showing a large empty rectangle
 * this collapses to a compact strip carrying the machine-identification text —
 * which is genuinely useful content. It expands to a real media panel the
 * moment a mediaUrl exists.
 */
export function MediaPanel({
  mediaUrl,
  mediaKind,
  machineIdentification,
  name,
}: {
  mediaUrl: string | null;
  mediaKind: string | null;
  machineIdentification: string | null;
  name: string;
}) {
  if (mediaUrl) {
    if (mediaKind === 'video') {
      return <video className="media" src={mediaUrl} autoPlay loop muted playsInline />;
    }
    return <img className="media" src={mediaUrl} alt={`${name} demonstration`} />;
  }

  if (!machineIdentification) return null;

  return (
    <div className="media-placeholder">
      <span className="glyph" aria-hidden="true">
        ⌖
      </span>
      <div>
        <div className="label" style={{ marginBottom: 3 }}>
          Find this machine
        </div>
        <div className="muted" style={{ fontSize: 14 }}>
          {machineIdentification}
        </div>
      </div>
    </div>
  );
}

export function RecoveryStrip({ muscles }: { muscles: MuscleRecoveryView[] }) {
  // Only muscles with some training history are worth showing — a wall of
  // "fresh" on day one tells you nothing.
  const trained = muscles.filter((m) => m.lastTrainedAt !== null);
  const shown = trained.length > 0 ? trained : muscles.slice(0, 6);

  return (
    <div className="recovery-strip">
      {shown.map((m) => (
        <div key={m.muscle} className={`recovery-cell ${m.band}`}>
          <span className="m">{MUSCLE_LABELS[m.muscle]}</span>
          <span className="d">
            {m.daysSinceTrained === null
              ? 'fresh'
              : m.daysSinceTrained === 0
                ? 'today'
                : `${m.daysSinceTrained}d`}
          </span>
        </div>
      ))}
    </div>
  );
}

export function Stepper({
  value,
  unit,
  step,
  min = 0,
  onChange,
  disabled,
}: {
  value: number;
  unit: string;
  step: number;
  min?: number;
  onChange: (next: number) => void;
  disabled?: boolean;
}) {
  return (
    <div className="stepper">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - step))}
        disabled={disabled || value <= min}
        aria-label={`Decrease ${unit}`}
      >
        −
      </button>
      <div className="value">
        <b>{value}</b>
        <span>{unit}</span>
      </div>
      <button
        type="button"
        onClick={() => onChange(value + step)}
        disabled={disabled}
        aria-label={`Increase ${unit}`}
      >
        +
      </button>
    </div>
  );
}

export function Pips({ total, done }: { total: number; done: number }) {
  return (
    <div className="pips" aria-label={`${done} of ${total} sets complete`}>
      {Array.from({ length: total }, (_, i) => (
        <i key={i} className={i < done ? 'done' : i === done ? 'active' : ''} />
      ))}
    </div>
  );
}

export function relativeDay(iso: string | null): string {
  if (!iso) return 'never';
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days} days ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}
