import type { DayLabel, GridDay } from "./schedule-types";

// ── Constants ──────────────────────────────────────────────

/**
 * Maps each festival day label to its calendar date (ISO format).
 * Update these values each year before the festival.
 */
export const FESTIVAL_DATES = {
  Viernes: "2026-03-13",
  Sabado: "2026-03-14",
  Domingo: "2026-03-15",
} as const satisfies Record<DayLabel, string>;

/**
 * IANA timezone for the festival venue (Buenos Aires, Argentina).
 * All time computations use this timezone via Intl.DateTimeFormat.
 */
export const FESTIVAL_TIMEZONE = "America/Buenos_Aires";

/**
 * Minute-of-day threshold below which we consider the time as
 * "still the previous day's festival night".
 * 6 * 60 = 360 → 06:00 AM. Matches schedule-utils NEXT_DAY_THRESHOLD.
 */
export const NEXT_DAY_THRESHOLD = 6 * 60;

// ── Helpers ────────────────────────────────────────────────

/**
 * Get the current hour and minute in Buenos Aires timezone.
 * Uses Intl.DateTimeFormat for timezone-safe conversion without
 * external libraries.
 */
function getBuenosAiresTime(now: Date = new Date()): {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
} {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: FESTIVAL_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(now);

  const get = (type: Intl.DateTimeFormatPartTypes): number => {
    const part = parts.find((p) => p.type === type);
    return part ? Number(part.value) : 0;
  };

  return {
    year: get("year"),
    month: get("month"),
    day: get("day"),
    hour: get("hour"),
    minute: get("minute"),
  };
}

// ── Public API ─────────────────────────────────────────────

/**
 * Determine which festival day is "today" based on the current
 * Buenos Aires time. Handles overnight wrap: 00:00–05:59 is treated
 * as the previous calendar day's festival night.
 *
 * @param days - The parsed GridDay array from the schedule
 * @returns The matching day label (e.g., "Viernes") or null if
 *          today is not a festival date
 */
export function getCurrentFestivalDay(
  days: GridDay[],
  overrideNow?: Date,
): string | null {
  const { year, month, day, hour } = getBuenosAiresTime(overrideNow);

  // During overnight hours (00:00–05:59), we're still in
  // the previous calendar day's festival night
  const isOvernight = hour < NEXT_DAY_THRESHOLD / 60;

  // Build the "effective" date — subtract one day if overnight
  let effectiveDate: Date;
  if (isOvernight) {
    effectiveDate = new Date(year, month - 1, day - 1);
  } else {
    effectiveDate = new Date(year, month - 1, day);
  }

  const effectiveISO = effectiveDate.toISOString().split("T")[0];

  // Find the day label that matches this calendar date
  const entries = Object.entries(FESTIVAL_DATES) as [DayLabel, string][];
  const match = entries.find(([, date]) => date === effectiveISO);

  if (!match) return null;

  const [dayLabel] = match;

  // Verify this day actually exists in the parsed schedule
  const exists = days.some((d) => d.label === dayLabel);
  return exists ? dayLabel : null;
}

/**
 * Convert the current Buenos Aires time to absolute minutes,
 * using the same convention as `timeToMinutes()` in schedule-utils:
 * hours before 06:00 get +1440 offset to maintain chronological ordering.
 *
 * Examples:
 * - 16:45 → 1005 (16 * 60 + 45)
 * - 01:30 → 1530 (1 * 60 + 30 + 1440)
 * - 00:00 → 1440 (0 + 1440)
 * - 06:00 → 360  (6 * 60, no offset)
 */
export function getCurrentFestivalMinutes(overrideNow?: Date): number {
  const { hour, minute } = getBuenosAiresTime(overrideNow);
  const total = hour * 60 + minute;

  // Match timeToMinutes() convention: hours before 06:00 get +1440
  if (hour < NEXT_DAY_THRESHOLD / 60) {
    return total + 24 * 60;
  }

  return total;
}
