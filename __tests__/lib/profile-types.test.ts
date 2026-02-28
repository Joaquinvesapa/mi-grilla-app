import { describe, it, expect } from "vitest"
import { AVATAR_COLORS, randomAvatar } from "@/lib/profile-types"

describe("AVATAR_COLORS", () => {
  it("has exactly 5 colors", () => {
    expect(AVATAR_COLORS).toHaveLength(5)
  })

  it("all colors are valid hex strings", () => {
    for (const color of AVATAR_COLORS) {
      expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/)
    }
  })
})

describe("randomAvatar", () => {
  it("always returns a color from AVATAR_COLORS", () => {
    // Run multiple times to reduce flakiness
    for (let i = 0; i < 50; i++) {
      const result = randomAvatar()
      expect(AVATAR_COLORS).toContain(result)
    }
  })

  it("returns a string", () => {
    expect(typeof randomAvatar()).toBe("string")
  })
})
