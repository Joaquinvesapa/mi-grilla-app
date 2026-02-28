import { describe, it, expect } from "vitest"
import { formatTimeLabel } from "@/lib/canvas-utils"

// ── formatTimeLabel ────────────────────────────────────────

describe("formatTimeLabel", () => {
  it("formats full hours as 'XX HS'", () => {
    // 840 = 14 * 60 → "14 HS"
    expect(formatTimeLabel(840)).toBe("14 HS")
  })

  it("formats half hours as 'XX:30'", () => {
    // 870 = 14*60 + 30 → "14:30"
    expect(formatTimeLabel(870)).toBe("14:30")
  })

  it("handles zero minutes", () => {
    expect(formatTimeLabel(0)).toBe("00 HS")
  })

  it("handles >24h wrap (1500 min = 25*60 → 01:00 display → '01 HS')", () => {
    expect(formatTimeLabel(1500)).toBe("01 HS")
  })

  it("formats 15-minute marks with colon", () => {
    // 855 = 14*60 + 15 → "14:15"
    expect(formatTimeLabel(855)).toBe("14:15")
  })

  it("pads single-digit hours", () => {
    // 360 = 6*60 → "06 HS"
    expect(formatTimeLabel(360)).toBe("06 HS")
  })
})
