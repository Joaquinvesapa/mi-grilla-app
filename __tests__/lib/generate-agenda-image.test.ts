import { describe, it, expect } from "vitest"
import {
  groupByStartTime,
  calculateContentHeight,
  TIME_LABEL_HEIGHT,
  TIME_LABEL_GAP,
  TIME_GROUP_GAP,
  CARD_GAP,
} from "@/lib/generate-agenda-image"
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

// ── groupByStartTime ───────────────────────────────────────

describe("groupByStartTime", () => {
  it("groups artists by their start time", () => {
    const artists = [
      makeArtist({ startTime: "14:00", name: "A" }),
      makeArtist({ startTime: "14:00", name: "B" }),
      makeArtist({ startTime: "15:00", name: "C" }),
    ]

    const groups = groupByStartTime(artists)
    expect(groups).toHaveLength(2)
    expect(groups[0][0]).toBe("14:00")
    expect(groups[0][1]).toHaveLength(2)
    expect(groups[1][0]).toBe("15:00")
    expect(groups[1][1]).toHaveLength(1)
  })

  it("returns empty array for empty input", () => {
    expect(groupByStartTime([])).toEqual([])
  })

  it("handles single artist", () => {
    const groups = groupByStartTime([makeArtist()])
    expect(groups).toHaveLength(1)
    expect(groups[0][1]).toHaveLength(1)
  })

  it("preserves chronological order (does not sort, relies on input order)", () => {
    const artists = [
      makeArtist({ startTime: "16:00", name: "Late" }),
      makeArtist({ startTime: "14:00", name: "Early" }),
    ]

    const groups = groupByStartTime(artists)
    // Since it doesn't sort, order follows input
    expect(groups[0][0]).toBe("16:00")
    expect(groups[1][0]).toBe("14:00")
  })
})

// ── calculateContentHeight ─────────────────────────────────

describe("calculateContentHeight", () => {
  it("calculates height for a single group with one artist", () => {
    const groups: Array<[string, GridArtist[]]> = [
      ["14:00", [makeArtist()]],
    ]
    const cardHeight = 100

    // TIME_LABEL_HEIGHT + TIME_LABEL_GAP + 1 card * cardHeight + 0 gaps between cards
    const expected = TIME_LABEL_HEIGHT + TIME_LABEL_GAP + cardHeight
    expect(calculateContentHeight(groups, cardHeight)).toBe(expected)
  })

  it("calculates height for multiple groups", () => {
    const groups: Array<[string, GridArtist[]]> = [
      ["14:00", [makeArtist(), makeArtist()]],
      ["15:00", [makeArtist()]],
    ]
    const cardHeight = 100

    // Group 1: label + gap + 2 cards + 1 card gap
    const group1 = TIME_LABEL_HEIGHT + TIME_LABEL_GAP + 2 * cardHeight + CARD_GAP
    // Group gap
    const gap = TIME_GROUP_GAP
    // Group 2: label + gap + 1 card
    const group2 = TIME_LABEL_HEIGHT + TIME_LABEL_GAP + cardHeight

    expect(calculateContentHeight(groups, cardHeight)).toBe(group1 + gap + group2)
  })

  it("returns 0 for empty groups", () => {
    expect(calculateContentHeight([], 100)).toBe(0)
  })
})
