/**
 * Local-day helpers.
 *
 * "Skip today" and one-report-per-muscle-per-day both hinge on where the day
 * boundary sits, and the server is the only place that decides it. Single-user
 * app on one machine, so the server's local timezone is the user's.
 */

export function endOfLocalToday(now: Date = new Date()): Date {
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);
  return end;
}

export function startOfLocalToday(now: Date = new Date()): Date {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  return start;
}

/** YYYY-MM-DD in local time, for day-keyed rows. */
export function localDateKey(now: Date = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
