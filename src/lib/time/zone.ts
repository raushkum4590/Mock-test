/**
 * Time-zone helpers without external libraries. All storage is UTC; these
 * convert between UTC instants and wall-clock time in the exam time zone
 * (default Asia/Kolkata) for forms and display.
 */
export const DEFAULT_TIME_ZONE = process.env.EXAM_TIME_ZONE || "Asia/Kolkata";

function wallClockParts(date: Date, timeZone: string) {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const parts: Record<string, string> = {};
  for (const p of dtf.formatToParts(date)) parts[p.type] = p.value;
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour),
    minute: Number(parts.minute),
    second: Number(parts.second),
  };
}

/** Offset of `timeZone` from UTC at `date`, in milliseconds (IST = +19800000). */
export function timeZoneOffsetMs(date: Date, timeZone: string): number {
  const p = wallClockParts(date, timeZone);
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  const truncated = Math.floor(date.getTime() / 1000) * 1000;
  return asUtc - truncated;
}

const LOCAL_RE = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?$/;

export function isValidTimeZone(timeZone: string): boolean {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone });
    return true;
  } catch {
    return false;
  }
}

/**
 * Interpret a wall-clock value such as "2026-10-10T10:00" (as produced by
 * <input type="datetime-local">) in `timeZone` and return the UTC instant.
 */
export function zonedTimeToUtc(local: string, timeZone: string = DEFAULT_TIME_ZONE): Date {
  const m = LOCAL_RE.exec(local.trim());
  if (!m) throw new Error(`Invalid local date-time: "${local}"`);
  const [, y, mo, d, h, mi, s] = m;
  const guess = Date.UTC(Number(y), Number(mo) - 1, Number(d), Number(h), Number(mi), Number(s ?? 0));
  const offset1 = timeZoneOffsetMs(new Date(guess), timeZone);
  let result = guess - offset1;
  // Re-check around DST transitions (not relevant for IST, but correct in general).
  const offset2 = timeZoneOffsetMs(new Date(result), timeZone);
  if (offset2 !== offset1) result = guess - offset2;
  return new Date(result);
}

const pad = (n: number) => String(n).padStart(2, "0");

/** UTC instant -> "YYYY-MM-DDTHH:mm" wall-clock in `timeZone` (for datetime-local inputs). */
export function utcToZonedInput(date: Date, timeZone: string = DEFAULT_TIME_ZONE): string {
  const p = wallClockParts(date, timeZone);
  return `${p.year}-${pad(p.month)}-${pad(p.day)}T${pad(p.hour)}:${pad(p.minute)}`;
}

export function formatDateTime(
  date: Date | string | null | undefined,
  timeZone: string = DEFAULT_TIME_ZONE,
  locale: string = "en-IN",
): string {
  if (!date) return "—";
  return new Intl.DateTimeFormat(locale, {
    timeZone,
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  }).format(new Date(date));
}

export function formatTime(date: Date | string, timeZone: string = DEFAULT_TIME_ZONE, locale = "en-IN"): string {
  return new Intl.DateTimeFormat(locale, {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  }).format(new Date(date));
}

/** 3725 -> "01:02:05" */
export function formatDuration(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  return `${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
}
