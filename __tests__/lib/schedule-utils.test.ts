import { describe, it, expect } from "vitest"
import {
  timeToMinutes,
  minutesToDisplay,
  getGridBounds,
  getTimeMarkers,
  minuteToRow,
  parseDay,
  parseSchedule,
} from "@/lib/schedule-utils"
import type { RawDia, RawSchedule } from "@/lib/schedule-types"

// ── Helpers ────────────────────────────────────────────────

/** Factory for a minimal RawDia with one stage and one artist */
function makeDay(overrides?: Partial<RawDia>): RawDia {
  return {
    dia: "Viernes",
    escenarios: [
      {
        nombre: "Flow Stage",
        artistas: [
          { nombre: "Tame Impala", inicio: "14:00", fin: "15:30" },
        ],
      },
    ],
    ...overrides,
  }
}

// ── timeToMinutes ──────────────────────────────────────────

describe("timeToMinutes", () => {
  it("converts basic HH:mm to minutes", () => {
    expect(timeToMinutes("14:30")).toBe(870)
  })

  it("treats hours before 06:00 as next-day (+24h)", () => {
    // 02:00 = 120min + 1440 = 1560
    expect(timeToMinutes("02:00")).toBe(1560)
  })

  it("does NOT add +24h for 06:00 and after", () => {
    expect(timeToMinutes("06:00")).toBe(360)
  })

  it("handles midnight (00:00) as next-day", () => {
    // 00:00 = 0 + 1440 = 1440
    expect(timeToMinutes("00:00")).toBe(1440)
  })

  it("handles edge case 05:59 as next-day", () => {
    // 05:59 = 359 + 1440 = 1799
    expect(timeToMinutes("05:59")).toBe(1799)
  })
})

// ── minutesToDisplay ───────────────────────────────────────

describe("minutesToDisplay", () => {
  it("converts minutes to HH:mm display string", () => {
    expect(minutesToDisplay(870)).toBe("14:30")
  })

  it("handles >24h wrap (1560min → 02:00)", () => {
    expect(minutesToDisplay(1560)).toBe("02:00")
  })

  it("handles zero", () => {
    expect(minutesToDisplay(0)).toBe("00:00")
  })

  it("handles exact 24h (1440 min → 00:00)", () => {
    expect(minutesToDisplay(1440)).toBe("00:00")
  })
})

// ── getGridBounds ──────────────────────────────────────────

describe("getGridBounds", () => {
  it("calculates bounds rounded to 30min for a normal day", () => {
    const day = makeDay({
      escenarios: [
        {
          nombre: "Flow Stage",
          artistas: [
            { nombre: "Artist A", inicio: "14:15", fin: "15:45" },
            { nombre: "Artist B", inicio: "16:00", fin: "17:30" },
          ],
        },
      ],
    })

    const bounds = getGridBounds(day)
    // 14:15 → floor to 14:00 = 840
    expect(bounds.startMin).toBe(840)
    // 17:30 → ceil to 17:30 = 1050
    expect(bounds.endMin).toBe(1050)
    expect(bounds.totalMinutes).toBe(1050 - 840)
  })

  it("handles day with artists spanning midnight", () => {
    const day = makeDay({
      escenarios: [
        {
          nombre: "Flow Stage",
          artistas: [
            { nombre: "Late Show", inicio: "23:00", fin: "01:00" },
          ],
        },
      ],
    })

    const bounds = getGridBounds(day)
    // 23:00 = 1380 → floor = 1380
    expect(bounds.startMin).toBe(1380)
    // 01:00 = 1500 → ceil = 1500
    expect(bounds.endMin).toBe(1500)
  })

  it("handles empty day (no artists) gracefully", () => {
    const day = makeDay({
      escenarios: [{ nombre: "Empty Stage", artistas: [] }],
    })

    // With no artists, earliest=Infinity and latest=-Infinity
    // floorTo30(Infinity) and ceilTo30(-Infinity) will produce unusual values
    // but it should not throw
    expect(() => getGridBounds(day)).not.toThrow()
  })
})

// ── getTimeMarkers ─────────────────────────────────────────

describe("getTimeMarkers", () => {
  it("generates 30-min tick markers between bounds", () => {
    const bounds = { startMin: 840, endMin: 960, totalMinutes: 120 }
    const markers = getTimeMarkers(bounds)

    expect(markers).toHaveLength(4) // 14:00, 14:30, 15:00, 15:30
    expect(markers[0]).toEqual({ label: "14:00", minutes: 840 })
    expect(markers[1]).toEqual({ label: "14:30", minutes: 870 })
    expect(markers[2]).toEqual({ label: "15:00", minutes: 900 })
    expect(markers[3]).toEqual({ label: "15:30", minutes: 930 })
  })

  it("returns empty array for zero-width bounds", () => {
    const bounds = { startMin: 840, endMin: 840, totalMinutes: 0 }
    expect(getTimeMarkers(bounds)).toHaveLength(0)
  })
})

// ── minuteToRow ────────────────────────────────────────────

describe("minuteToRow", () => {
  it("converts minute to CSS grid row (1-indexed, row 1 is header)", () => {
    // minute=850, boundsStart=840 → row = 850-840+2 = 12
    expect(minuteToRow(850, 840)).toBe(12)
  })

  it("first content minute maps to row 2", () => {
    expect(minuteToRow(840, 840)).toBe(2)
  })
})

// ── parseDay ───────────────────────────────────────────────

describe("parseDay", () => {
  it("parses a raw day into a complete GridDay", () => {
    const day = makeDay()
    const parsed = parseDay(day)

    expect(parsed.label).toBe("Viernes")
    expect(parsed.stages).toHaveLength(1)
    expect(parsed.stages[0]).toEqual({ name: "Flow Stage", index: 0 })
    expect(parsed.artists).toHaveLength(1)
    expect(parsed.artists[0].name).toBe("Tame Impala")
    expect(parsed.artists[0].startTime).toBe("14:00")
    expect(parsed.artists[0].endTime).toBe("15:30")
    expect(parsed.artists[0].stageName).toBe("Flow Stage")
    expect(parsed.artists[0].stageIndex).toBe(0)
  })

  it("generates deterministic IDs per artist", () => {
    const day = makeDay()
    const parsed = parseDay(day)

    // ID format: "dia-nombre" with spaces replaced by hyphens (stage-agnostic)
    expect(parsed.artists[0].id).toBe("Viernes-Tame-Impala")
  })

  it("assigns correct stageIndex for multi-stage days", () => {
    const day = makeDay({
      escenarios: [
        {
          nombre: "Flow Stage",
          artistas: [{ nombre: "A", inicio: "14:00", fin: "15:00" }],
        },
        {
          nombre: "Perry's Stage",
          artistas: [{ nombre: "B", inicio: "14:00", fin: "15:00" }],
        },
      ],
    })

    const parsed = parseDay(day)
    expect(parsed.artists[0].stageIndex).toBe(0)
    expect(parsed.artists[1].stageIndex).toBe(1)
  })
})

// ── parseSchedule ──────────────────────────────────────────

describe("parseSchedule", () => {
  it("parses a full schedule into array of GridDays", () => {
    const schedule: RawSchedule = {
      evento: "Lollapalooza 2026",
      dias: [
        makeDay({ dia: "Viernes" }),
        makeDay({ dia: "Sábado" }),
        makeDay({ dia: "Domingo" }),
      ],
    }

    const parsed = parseSchedule(schedule)
    expect(parsed).toHaveLength(3)
    expect(parsed[0].label).toBe("Viernes")
    expect(parsed[1].label).toBe("Sábado")
    expect(parsed[2].label).toBe("Domingo")
  })
})
