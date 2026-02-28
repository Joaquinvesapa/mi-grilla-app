import { describe, it, expect } from "vitest"
import {
  detectConflicts,
  countConflictPairs,
  formatConflictNames,
} from "@/lib/agenda-utils"
import type { GridArtist } from "@/lib/schedule-types"

// ── Helpers ────────────────────────────────────────────────

function makeArtist(overrides?: Partial<GridArtist>): GridArtist {
  return {
    id: "test-id",
    name: "Test Artist",
    startTime: "14:00",
    endTime: "15:00",
    startMin: 840,
    endMin: 900,
    stageName: "Flow Stage",
    stageIndex: 0,
    ...overrides,
  }
}

// ── detectConflicts ────────────────────────────────────────

describe("detectConflicts", () => {
  it("returns conflict map with overlapping artist names", () => {
    const artists = [
      makeArtist({ id: "a", name: "A", startMin: 840, endMin: 900 }), // 14:00-15:00
      makeArtist({ id: "b", name: "B", startMin: 870, endMin: 960 }), // 14:30-16:00
    ]

    const conflicts = detectConflicts(artists)
    expect(conflicts.get("a")).toEqual(["B"])
    expect(conflicts.get("b")).toEqual(["A"])
  })

  it("returns empty map when no overlaps exist", () => {
    const artists = [
      makeArtist({ id: "a", name: "A", startMin: 840, endMin: 900 }), // 14:00-15:00
      makeArtist({ id: "b", name: "B", startMin: 900, endMin: 960 }), // 15:00-16:00 (starts exactly when A ends)
    ]

    const conflicts = detectConflicts(artists)
    expect(conflicts.size).toBe(0)
  })

  it("detects partial overlap correctly", () => {
    const artists = [
      makeArtist({ id: "a", name: "A", startMin: 840, endMin: 900 }), // 14:00-15:00
      makeArtist({ id: "b", name: "B", startMin: 870, endMin: 960 }), // 14:30-16:00
    ]

    const conflicts = detectConflicts(artists)
    expect(conflicts.has("a")).toBe(true)
    expect(conflicts.has("b")).toBe(true)
  })

  it("handles multiple conflicts for one artist", () => {
    const artists = [
      makeArtist({ id: "a", name: "A", startMin: 840, endMin: 960 }), // 14:00-16:00 (long show)
      makeArtist({ id: "b", name: "B", startMin: 840, endMin: 900 }), // 14:00-15:00
      makeArtist({ id: "c", name: "C", startMin: 900, endMin: 960 }), // 15:00-16:00
    ]

    const conflicts = detectConflicts(artists)
    // A conflicts with B (overlaps 14:00-15:00) and C (overlaps 15:00-16:00)
    // Wait: A: 840-960, C: 900-960. A.start(840) < C.end(960) && C.start(900) < A.end(960) → overlap
    expect(conflicts.get("a")).toContain("B")
    expect(conflicts.get("a")).toContain("C")
  })

  it("returns empty map for empty array", () => {
    expect(detectConflicts([]).size).toBe(0)
  })

  it("returns empty map for single artist", () => {
    expect(detectConflicts([makeArtist()]).size).toBe(0)
  })
})

// ── countConflictPairs ─────────────────────────────────────

describe("countConflictPairs", () => {
  it("counts unique conflict pairs (not double-count)", () => {
    const artists = [
      makeArtist({ id: "a", startMin: 840, endMin: 900 }),
      makeArtist({ id: "b", startMin: 870, endMin: 960 }),
    ]

    // A↔B = 1 pair
    expect(countConflictPairs(artists)).toBe(1)
  })

  it("returns 0 when no conflicts", () => {
    const artists = [
      makeArtist({ id: "a", startMin: 840, endMin: 900 }),
      makeArtist({ id: "b", startMin: 900, endMin: 960 }),
    ]

    expect(countConflictPairs(artists)).toBe(0)
  })

  it("counts multiple pairs correctly", () => {
    const artists = [
      makeArtist({ id: "a", startMin: 840, endMin: 960 }), // overlaps with b AND c
      makeArtist({ id: "b", startMin: 840, endMin: 900 }),
      makeArtist({ id: "c", startMin: 900, endMin: 960 }),
    ]

    // A↔B, A↔C = 2 pairs (B and C don't overlap: B.end=900 === C.start=900)
    expect(countConflictPairs(artists)).toBe(2)
  })

  it("returns 0 for empty array", () => {
    expect(countConflictPairs([])).toBe(0)
  })
})

// ── formatConflictNames ────────────────────────────────────

describe("formatConflictNames", () => {
  it("returns single name as-is", () => {
    expect(formatConflictNames(["Lorde"])).toBe("Lorde")
  })

  it("joins two names with 'y'", () => {
    expect(formatConflictNames(["Lorde", "Peggy Gou"])).toBe(
      "Lorde y Peggy Gou",
    )
  })

  it("joins three+ names with commas and 'y'", () => {
    expect(formatConflictNames(["Lorde", "Peggy Gou", "DJO"])).toBe(
      "Lorde, Peggy Gou y DJO",
    )
  })

  it("returns empty string for empty array", () => {
    expect(formatConflictNames([])).toBe("")
  })
})
