import { describe, it, expect } from "vitest"
import {
  validateUsername,
  validatePin,
  validateInstagram,
  cleanInstagram,
  toFakeEmail,
} from "@/lib/validation"

// ── validateUsername ────────────────────────────────────────

describe("validateUsername", () => {
  it("returns null for valid username", () => {
    expect(validateUsername("migrilla")).toBeNull()
  })

  it("returns error for too short (< 3 chars)", () => {
    expect(validateUsername("ab")).toBeTruthy()
  })

  it("returns error for too long (> 20 chars)", () => {
    expect(validateUsername("a".repeat(21))).toBeTruthy()
  })

  it("returns error for spaces", () => {
    expect(validateUsername("user name")).toBeTruthy()
  })

  it("returns error for uppercase letters", () => {
    expect(validateUsername("UserName")).toBeTruthy()
  })

  it("returns error for special characters", () => {
    expect(validateUsername("user@name")).toBeTruthy()
  })

  it("allows underscores", () => {
    expect(validateUsername("_valid_user_")).toBeNull()
  })

  it("allows numbers", () => {
    expect(validateUsername("user123")).toBeNull()
  })

  it("returns error for empty string", () => {
    expect(validateUsername("")).toBeTruthy()
  })

  it("accepts exactly 3 chars (minimum)", () => {
    expect(validateUsername("abc")).toBeNull()
  })

  it("accepts exactly 20 chars (maximum)", () => {
    expect(validateUsername("a".repeat(20))).toBeNull()
  })
})

// ── validatePin ────────────────────────────────────────────

describe("validatePin", () => {
  it("returns null for valid 6-digit PIN", () => {
    expect(validatePin("123456")).toBeNull()
  })

  it("returns error for less than 6 digits", () => {
    expect(validatePin("12345")).toBeTruthy()
  })

  it("returns error for more than 6 digits", () => {
    expect(validatePin("1234567")).toBeTruthy()
  })

  it("returns error for letters", () => {
    expect(validatePin("abcdef")).toBeTruthy()
  })

  it("returns error for empty string", () => {
    expect(validatePin("")).toBeTruthy()
  })

  it("returns error for mixed letters and numbers", () => {
    expect(validatePin("123abc")).toBeTruthy()
  })
})

// ── validateInstagram ──────────────────────────────────────

describe("validateInstagram", () => {
  it("returns null for valid handle", () => {
    expect(validateInstagram("migrilla")).toBeNull()
  })

  it("returns null for handle with @", () => {
    expect(validateInstagram("@migrilla")).toBeNull()
  })

  it("returns null for empty string (optional field)", () => {
    expect(validateInstagram("")).toBeNull()
  })

  it("returns error for spaces", () => {
    expect(validateInstagram("a b c")).toBeTruthy()
  })

  it("allows dots and underscores", () => {
    expect(validateInstagram("user.name_123")).toBeNull()
  })
})

// ── cleanInstagram ─────────────────────────────────────────

describe("cleanInstagram", () => {
  it("strips leading @", () => {
    expect(cleanInstagram("@migrilla")).toBe("migrilla")
  })

  it("returns unchanged if no @", () => {
    expect(cleanInstagram("migrilla")).toBe("migrilla")
  })

  it("only strips first @", () => {
    expect(cleanInstagram("@@double")).toBe("@double")
  })
})

// ── toFakeEmail ────────────────────────────────────────────

describe("toFakeEmail", () => {
  it("generates correct fake email", () => {
    expect(toFakeEmail("migrilla")).toBe("migrilla@migrilla.app")
  })

  it("uses the username as-is (no transformation)", () => {
    expect(toFakeEmail("test_user")).toBe("test_user@migrilla.app")
  })
})
