import { describe, it, expect } from "vitest"
import { categorizeArtists } from "@/lib/compare-utils"
import type { GridArtist } from "@/lib/schedule-types"

// ── Helpers ────────────────────────────────────────────────

function makeArtist(id: string): GridArtist {
  return {
    id,
    name: `Artist ${id}`,
    startTime: "14:00",
    endTime: "15:00",
    startMin: 840,
    endMin: 900,
    stageName: "Flow Stage",
    stageIndex: 0,
  }
}

// ── categorizeArtists ──────────────────────────────────────

describe("categorizeArtists", () => {
  const artists = [makeArtist("a"), makeArtist("b"), makeArtist("c")]

  it("puts artists in both sets into 'common'", () => {
    const mySet = new Set(["a", "b"])
    const friendSet = new Set(["a", "c"])

    const result = categorizeArtists(artists, mySet, friendSet)
    expect(result.common.map((a) => a.id)).toEqual(["a"])
  })

  it("puts artists only in mySet into 'onlyMe'", () => {
    const mySet = new Set(["a", "b"])
    const friendSet = new Set(["a", "c"])

    const result = categorizeArtists(artists, mySet, friendSet)
    expect(result.onlyMe.map((a) => a.id)).toEqual(["b"])
  })

  it("puts artists only in friendSet into 'onlyFriend'", () => {
    const mySet = new Set(["a", "b"])
    const friendSet = new Set(["a", "c"])

    const result = categorizeArtists(artists, mySet, friendSet)
    expect(result.onlyFriend.map((a) => a.id)).toEqual(["c"])
  })

  it("excludes artists in neither set", () => {
    const mySet = new Set(["a"])
    const friendSet = new Set(["b"])

    const result = categorizeArtists(artists, mySet, friendSet)
    // "c" is in neither set, so not in any category
    const allIds = [
      ...result.common.map((a) => a.id),
      ...result.onlyMe.map((a) => a.id),
      ...result.onlyFriend.map((a) => a.id),
    ]
    expect(allIds).not.toContain("c")
  })

  it("handles empty sets", () => {
    const result = categorizeArtists(artists, new Set(), new Set())
    expect(result.common).toHaveLength(0)
    expect(result.onlyMe).toHaveLength(0)
    expect(result.onlyFriend).toHaveLength(0)
  })

  it("handles empty artists array", () => {
    const result = categorizeArtists(
      [],
      new Set(["a"]),
      new Set(["b"]),
    )
    expect(result.common).toHaveLength(0)
    expect(result.onlyMe).toHaveLength(0)
    expect(result.onlyFriend).toHaveLength(0)
  })
})
