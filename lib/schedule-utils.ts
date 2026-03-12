import type {
  RawSchedule,
  RawDia,
  GridArtist,
  GridStage,
  GridBounds,
  GridDay,
  LiveStage,
} from "./schedule-types";

/**
 * Pixels per minute — controls the vertical density of the grid.
 * 1.5px/min means a 60-min show = 90px tall.
 * 1.1px/min means a 60-min show = 66px tall (compact).
 */
export const PX_PER_MINUTE = 1.1;

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
 * These are semi-transparent to let the grid show through.
 *
 * Palette: #3A86FF · #F5B400 · #FF006E · #8338EC · #FB5607
 */
export const STAGE_COLORS: Record<string, string> = {
  "Flow Stage": "rgba(58, 134, 255, 0.22)",       // Blue
  "Samsung Stage": "rgba(138, 201, 38, 0.22)",      // Green
  "Alternative Stage": "rgba(255, 0, 110, 0.18)",  // Pink
  "Perry's Stage": "rgba(131, 56, 236, 0.18)",     // Purple
  KidzaPalooza: "rgba(251, 86, 7, 0.18)",          // Orange
};

/**
 * Border accent color per stage (slightly more visible).
 */
export const STAGE_BORDER_COLORS: Record<string, string> = {
  "Flow Stage": "rgba(58, 134, 255, 0.50)",       // Blue
  "Samsung Stage": "rgba(138, 201, 38, 0.50)",     // Green
  "Alternative Stage": "rgba(255, 0, 110, 0.40)", // Pink
  "Perry's Stage": "rgba(131, 56, 236, 0.40)",    // Purple
  KidzaPalooza: "rgba(251, 86, 7, 0.35)",         // Orange
};

/**
 * Solid backgrounds for selected (attending) artist cards.
 * No transparency — fully opaque to stand out from the grid.
 */
export const STAGE_SELECTED_COLORS: Record<string, string> = {
  "Flow Stage": "rgb(58, 134, 255)",       // Blue
  "Samsung Stage": "rgb(138, 201, 38)",     // Green
  "Alternative Stage": "rgb(255, 0, 110)", // Pink
  "Perry's Stage": "rgb(131, 56, 236)",    // Purple
  KidzaPalooza: "rgb(251, 86, 7)",         // Orange
};

/**
 * Solid border for selected artist cards — slightly brighter variant.
 */
export const STAGE_SELECTED_BORDER_COLORS: Record<string, string> = {
  "Flow Stage": "rgb(80, 155, 255)",        // Blue light
  "Samsung Stage": "rgb(163, 221, 58)",     // Green light
  "Alternative Stage": "rgb(255, 50, 140)", // Pink light
  "Perry's Stage": "rgb(155, 85, 245)",     // Purple light
  KidzaPalooza: "rgb(255, 110, 40)",        // Orange light
};

// ── Live Now ───────────────────────────────────────────────

/**
 * For each stage in the day, find the artist currently performing
 * (whose time range contains `currentMinutes`) and the next upcoming
 * artist. Used by the "EN VIVO" overlay / FAB.
 *
 * Artists within each stage are sorted by start time so "up next"
 * is always the earliest show that hasn't started yet.
 */
export function computeLiveStages(
  day: GridDay,
  currentMinutes: number,
): LiveStage[] {
  return day.stages.map((stage) => {
    // Filter artists belonging to this stage, sorted by start time
    const stageArtists = day.artists
      .filter((a) => a.stageIndex === stage.index)
      .sort((a, b) => a.startMin - b.startMin);

    // Currently performing: startMin <= currentMinutes < endMin
    const nowPlaying =
      stageArtists.find(
        (a) => a.startMin <= currentMinutes && currentMinutes < a.endMin,
      ) ?? null;

    // Up next: first artist whose start is strictly in the future
    const upNext =
      stageArtists.find((a) => a.startMin > currentMinutes) ?? null;

    return {
      stageName: stage.name,
      stageIndex: stage.index,
      nowPlaying,
      upNext,
    };
  });
}
