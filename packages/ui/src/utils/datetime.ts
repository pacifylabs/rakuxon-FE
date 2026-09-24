/**
 * Every clock-style timestamp in the app renders 12-hour with AM/PM — never
 * the browser locale's 24-hour default (e.g. en-GB), which is what
 * `toLocaleTimeString()`/`toLocaleString()` fall back to without `hour12`.
 */
function toDate(value: string | Date): Date {
  return typeof value === 'string' ? new Date(value) : value;
}

/** e.g. "7:24 AM". */
export function formatTime(value: string | Date): string {
  return toDate(value).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
}

/** e.g. "24/09/2026, 7:24 AM". */
export function formatDateTime(value: string | Date): string {
  return toDate(value).toLocaleString([], {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}
