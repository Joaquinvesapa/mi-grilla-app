import { describe, it, expect } from "vitest"
import { cn } from "@/lib/utils"

describe("cn() — Tailwind class merge utility", () => {
  it("merges multiple class strings", () => {
    expect(cn("foo", "bar")).toBe("foo bar")
  })

  it("last Tailwind class wins on conflict (padding)", () => {
    expect(cn("p-4", "p-2")).toBe("p-2")
  })

  it("ignores falsy values (undefined, null, false)", () => {
    expect(cn("foo", undefined, "bar")).toBe("foo bar")
  })

  it("last color class wins on conflict", () => {
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500")
  })
})
