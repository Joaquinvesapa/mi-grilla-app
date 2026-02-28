import type { GridArtist } from "./schedule-types"

// ── Conflict Detection ─────────────────────────────────────

/**
 * Detect time conflicts between attending artists.
 * Two shows "conflict" if they overlap in time (person can't be at two stages).
 * Returns a Map of artistId → array of conflicting artist names.
 */
export function detectConflicts(artists: GridArtist[]): Map<string, string[]> {
  const conflicts = new Map<string, string[]>()

  for (let i = 0; i < artists.length; i++) {
    for (let j = i + 1; j < artists.length; j++) {
      const a = artists[i]
      const b = artists[j]

      // Overlap: A starts before B ends AND B starts before A ends
      if (a.startMin < b.endMin && b.startMin < a.endMin) {
        if (!conflicts.has(a.id)) conflicts.set(a.id, [])
        if (!conflicts.has(b.id)) conflicts.set(b.id, [])
        conflicts.get(a.id)!.push(b.name)
        conflicts.get(b.id)!.push(a.name)
      }
    }
  }

  return conflicts
}

/**
 * Count unique conflict pairs (A↔B = 1 pair, not 2).
 */
export function countConflictPairs(artists: GridArtist[]): number {
  let count = 0
  for (let i = 0; i < artists.length; i++) {
    for (let j = i + 1; j < artists.length; j++) {
      if (
        artists[i].startMin < artists[j].endMin &&
        artists[j].startMin < artists[i].endMin
      ) {
        count++
      }
    }
  }
  return count
}

// ── Conflict Formatting ────────────────────────────────────

/**
 * Format conflict names into readable Spanish text.
 * 1 name:  "Lorde"
 * 2 names: "Lorde y Peggy Gou"
 * 3+:      "Lorde, Peggy Gou y DJO"
 * 0 names: ""
 */
export function formatConflictNames(names: string[]): string {
  if (names.length === 0) return ""
  if (names.length === 1) return names[0]
  if (names.length === 2) return `${names[0]} y ${names[1]}`
  return `${names.slice(0, -1).join(", ")} y ${names[names.length - 1]}`
}
