import { describe, it, expect } from "vitest"
import { createLogoSvg, LOGO_ASPECT_RATIO } from "@/lib/logo-svg"

describe("createLogoSvg", () => {
  it("returns a string starting with <svg", () => {
    const svg = createLogoSvg("#fff", "#000")
    expect(svg.startsWith("<svg")).toBe(true)
  })

  it("contains the mainFill color in the SVG fill attribute", () => {
    const svg = createLogoSvg("#ff0000", "#00ff00")
    expect(svg).toContain('fill="#ff0000"')
  })

  it("contains the detailFill color in the CSS class", () => {
    const svg = createLogoSvg("#ff0000", "#00ff00")
    expect(svg).toContain("fill:#00ff00")
  })

  it("produces valid SVG with closing tag", () => {
    const svg = createLogoSvg("#fff", "#000")
    expect(svg).toContain("</svg>")
  })
})

describe("LOGO_ASPECT_RATIO", () => {
  it("is a positive number", () => {
    expect(LOGO_ASPECT_RATIO).toBeGreaterThan(0)
  })

  it("is approximately the expected ratio (1064.99 / 277.11 ≈ 3.84)", () => {
    expect(LOGO_ASPECT_RATIO).toBeCloseTo(1064.99 / 277.11, 2)
  })
})
