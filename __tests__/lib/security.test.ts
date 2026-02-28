import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import {
  isValidUuid,
  validateUuids,
  safeRedirectPath,
  escapeIlike,
  isValidStorageUrl,
} from "@/lib/security"

// ── isValidUuid ────────────────────────────────────────────

describe("isValidUuid", () => {
  it("returns true for a valid UUID v4", () => {
    expect(isValidUuid("550e8400-e29b-41d4-a716-446655440000")).toBe(true)
  })

  it("returns false for an invalid string", () => {
    expect(isValidUuid("not-a-uuid")).toBe(false)
  })

  it("returns false for empty string", () => {
    expect(isValidUuid("")).toBe(false)
  })

  it("returns true for uppercase UUID", () => {
    expect(isValidUuid("550E8400-E29B-41D4-A716-446655440000")).toBe(true)
  })

  it("returns false for UUID missing a segment", () => {
    expect(isValidUuid("550e8400-e29b-41d4-a716")).toBe(false)
  })
})

// ── validateUuids ──────────────────────────────────────────

describe("validateUuids", () => {
  it("returns original array if all UUIDs are valid", () => {
    const uuids = [
      "550e8400-e29b-41d4-a716-446655440000",
      "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
    ]
    expect(validateUuids(uuids)).toEqual(uuids)
  })

  it("returns empty array if any UUID is invalid", () => {
    const uuids = [
      "550e8400-e29b-41d4-a716-446655440000",
      "invalid-uuid",
    ]
    expect(validateUuids(uuids)).toEqual([])
  })

  it("returns empty array for empty input", () => {
    // All items are valid (vacuously true), so returns original
    expect(validateUuids([])).toEqual([])
  })
})

// ── safeRedirectPath ───────────────────────────────────────

describe("safeRedirectPath", () => {
  it("passes through valid relative path", () => {
    expect(safeRedirectPath("/grilla")).toBe("/grilla")
  })

  it("rejects protocol-relative URL (open redirect)", () => {
    expect(safeRedirectPath("//evil.com")).toBe("/grilla")
  })

  it("rejects absolute URL", () => {
    expect(safeRedirectPath("https://evil.com")).toBe("/grilla")
  })

  it("returns fallback for empty string", () => {
    expect(safeRedirectPath("")).toBe("/grilla")
  })

  it("uses custom fallback when provided", () => {
    expect(safeRedirectPath("//evil.com", "/agenda")).toBe("/agenda")
  })

  it("rejects paths not starting with /", () => {
    expect(safeRedirectPath("evil.com/path")).toBe("/grilla")
  })
})

// ── escapeIlike ────────────────────────────────────────────

describe("escapeIlike", () => {
  it("escapes % wildcard", () => {
    expect(escapeIlike("100%")).toBe("100\\%")
  })

  it("escapes _ wildcard", () => {
    expect(escapeIlike("user_name")).toBe("user\\_name")
  })

  it("escapes backslash", () => {
    expect(escapeIlike("test\\path")).toBe("test\\\\path")
  })

  it("escapes multiple special chars in one string", () => {
    expect(escapeIlike("100%_\\test")).toBe("100\\%\\_\\\\test")
  })

  it("returns unchanged string with no special chars", () => {
    expect(escapeIlike("normal text")).toBe("normal text")
  })
})

// ── isValidStorageUrl ──────────────────────────────────────

describe("isValidStorageUrl", () => {
  const MOCK_SUPABASE_URL = "https://abc123.supabase.co"

  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", MOCK_SUPABASE_URL)
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it("returns true for valid Supabase Storage URL", () => {
    const url = `${MOCK_SUPABASE_URL}/storage/v1/object/public/avatars/photo.jpg`
    expect(isValidStorageUrl(url)).toBe(true)
  })

  it("returns false for URL pointing to different host", () => {
    expect(
      isValidStorageUrl("https://evil.com/storage/v1/object/public/file.jpg"),
    ).toBe(false)
  })

  it("returns false for HTTP (non-HTTPS)", () => {
    const url = `http://abc123.supabase.co/storage/v1/object/public/file.jpg`
    expect(isValidStorageUrl(url)).toBe(false)
  })

  it("returns false for path not starting with /storage/v1/object/public/", () => {
    const url = `${MOCK_SUPABASE_URL}/api/some-endpoint`
    expect(isValidStorageUrl(url)).toBe(false)
  })

  it("returns false for invalid URL string", () => {
    expect(isValidStorageUrl("not-a-url")).toBe(false)
  })

  it("returns false when NEXT_PUBLIC_SUPABASE_URL is not set", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "")
    expect(
      isValidStorageUrl("https://abc123.supabase.co/storage/v1/object/public/file.jpg"),
    ).toBe(false)
  })
})
