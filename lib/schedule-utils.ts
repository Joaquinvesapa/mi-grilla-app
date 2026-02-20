import type {
  RawSchedule,
  RawDia,
  GridArtist,
  GridStage,
  GridBounds,
  GridDay,
} from "./schedule-types";

/**
 * Pixels per minute — controls the vertical density of the grid.
 * 2px/min means a 60-min show = 120px tall.
 */
export const PX_PER_MINUTE = 1.5;

/**
 * We consider any show ending at or before this hour as "next day".
 * e.g. Peggy Gou 23:30→01:00 — the "01:00" gets +24h offset.
 */
const NEXT_DAY_THRESHOLD = 6; // 06:00

/**
 * Convert "HH:mm" string to absolute minutes from midnight.
 * If the time is between 00:00 and NEXT_DAY_THRESHOLD, we add 24*60
 * so that 01:00 → 1500 instead of 60 (keeps ordering correct).
 */
export function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  const total = h * 60 + m;

  // Times like 01:00, 02:30 etc. are "next day" in festival context
  if (h < NEXT_DAY_THRESHOLD) {
    return total + 24 * 60;
  }

  return total;
}

/**
 * Convert minutes back to "HH:mm" display string.
 * Handles the >24h wrap (1500min → "01:00").
 */
export function minutesToDisplay(minutes: number): string {
  const normalized = minutes % (24 * 60);
  const h = Math.floor(normalized / 60);
  const m = normalized % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

/**
 * Floor a minute value to the nearest 30-min slot.
 * 795 → 780 (13:15 → 13:00)
 */
function floorTo30(min: number): number {
  return Math.floor(min / 30) * 30;
}

/**
 * Ceil a minute value to the nearest 30-min slot.
 * 795 → 810 (13:15 → 13:30)
 */
function ceilTo30(min: number): number {
  return Math.ceil(min / 30) * 30;
}

/**
 * Calculate the visible bounds for a day's grid.
 * Scans all artists to find the earliest start and latest end,
 * then rounds to 30-min boundaries.
 */
export function getGridBounds(day: RawDia): GridBounds {
  let earliest = Infinity;
  let latest = -Infinity;

  for (const stage of day.escenarios) {
    for (const artist of stage.artistas) {
      const start = timeToMinutes(artist.inicio);
      const end = timeToMinutes(artist.fin);
      if (start < earliest) earliest = start;
      if (end > latest) latest = end;
    }
  }

  const startMin = floorTo30(earliest);
  const endMin = ceilTo30(latest);

  return {
    startMin,
    endMin,
    totalMinutes: endMin - startMin,
  };
}

/**
 * Generate the time markers for the left axis.
 * Returns every 30-minute tick between bounds.
 */
export function getTimeMarkers(
  bounds: GridBounds
): Array<{ label: string; minutes: number }> {
  const markers: Array<{ label: string; minutes: number }> = [];

  for (let min = bounds.startMin; min < bounds.endMin; min += 30) {
    markers.push({
      label: minutesToDisplay(min),
      minutes: min,
    });
  }

  return markers;
}

/**
 * Convert a raw minute value to a grid row number.
 * Row 1 = header row. Row 2+ = content.
 */
export function minuteToRow(minute: number, boundsStart: number): number {
  return minute - boundsStart + 2; // +2 because row 1 is the header
}

/**
 * Parse the full schedule JSON for a specific day.
 * Returns everything the grid needs to render.
 */
export function parseDay(day: RawDia): GridDay {
  const bounds = getGridBounds(day);

  const stages: GridStage[] = day.escenarios.map((esc, i) => ({
    name: esc.nombre,
    index: i,
  }));

  const artists: GridArtist[] = [];

  for (const [stageIndex, stage] of day.escenarios.entries()) {
    for (const artist of stage.artistas) {
      const startMin = timeToMinutes(artist.inicio);
      const endMin = timeToMinutes(artist.fin);

      artists.push({
        id: `${day.dia}-${stage.nombre}-${artist.nombre}`.replace(/\s+/g, "-"),
        name: artist.nombre,
        subtitle: artist.subtitulo,
        startTime: artist.inicio,
        endTime: artist.fin,
        startMin,
        endMin,
        stageName: stage.nombre,
        stageIndex,
      });
    }
  }

  return {
    label: day.dia,
    stages,
    artists,
    bounds,
  };
}

/**
 * Parse the entire schedule into an array of GridDays.
 */
export function parseSchedule(schedule: RawSchedule): GridDay[] {
  return schedule.dias.map(parseDay);
}

/**
 * Map of stage name → CSS color (used for card backgrounds).
 * These are semi-transparent to let the dark grid show through.
 */
export const STAGE_COLORS: Record<string, string> = {
  "Flow Stage": "rgba(7, 184, 156, 0.25)",
  "Samsung Stage": "rgba(221, 201, 138, 0.25)",
  "Alternative Stage": "rgba(232, 85, 85, 0.20)",
  "Perry's Stage": "rgba(240, 45, 125, 0.20)",
  KidzaPalooza: "rgba(212, 236, 42, 0.18)",
};

/**
 * Border accent color per stage (slightly more visible).
 */
export const STAGE_BORDER_COLORS: Record<string, string> = {
  "Flow Stage": "rgba(7, 184, 156, 0.50)",
  "Samsung Stage": "rgba(221, 201, 138, 0.50)",
  "Alternative Stage": "rgba(232, 85, 85, 0.40)",
  "Perry's Stage": "rgba(240, 45, 125, 0.40)",
  KidzaPalooza: "rgba(212, 236, 42, 0.35)",
};

/**
 * Solid backgrounds for selected (attending) artist cards.
 * No transparency — fully opaque to stand out from the grid.
 */
export const STAGE_SELECTED_COLORS: Record<string, string> = {
  "Flow Stage": "rgb(7, 184, 156)",
  "Samsung Stage": "rgb(221, 201, 138)",
  "Alternative Stage": "rgb(232, 85, 85)",
  "Perry's Stage": "rgb(240, 45, 125)",
  KidzaPalooza: "rgb(212, 236, 42)",
};

/**
 * Solid border for selected artist cards.
 */
export const STAGE_SELECTED_BORDER_COLORS: Record<string, string> = {
  "Flow Stage": "rgb(10, 220, 186)",
  "Samsung Stage": "rgb(240, 220, 155)",
  "Alternative Stage": "rgb(245, 105, 105)",
  "Perry's Stage": "rgb(250, 65, 145)",
  KidzaPalooza: "rgb(225, 245, 65)",
};
