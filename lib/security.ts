// ── UUID Validation ────────────────────────────────────────

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Returns true if the string is a valid UUID v4 format. */
export function isValidUuid(value: string): boolean {
  return UUID_REGEX.test(value);
}

/**
 * Validates every item in the array is a valid UUID.
 * Returns the array unchanged if valid, empty array if any item is invalid.
 */
export function validateUuids(values: string[]): string[] {
  return values.every(isValidUuid) ? values : [];
}

// ── Safe Redirect ──────────────────────────────────────────

/**
 * Sanitises a `next` redirect path to prevent open-redirect attacks.
 * Only allows relative paths that start with `/` (no protocol-relative `//`).
 */
export function safeRedirectPath(
  next: string,
  fallback: string = "/grilla",
): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return fallback;
  return next;
}

// ── ILIKE Escaping ─────────────────────────────────────────

/**
 * Escapes PostgreSQL LIKE/ILIKE wildcard characters (`%`, `_`, `\`)
 * so they are treated as literals in search queries.
 */
export function escapeIlike(value: string): string {
  return value.replace(/[%_\\]/g, "\\$&");
}

// ── Supabase Storage URL Validation ────────────────────────

/**
 * Validates that a URL points to the project's own Supabase Storage bucket.
 * Prevents storing arbitrary/malicious URLs in avatar_url.
 */
export function isValidStorageUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl) return false;
    const supabaseHost = new URL(supabaseUrl).hostname;
    return (
      parsed.protocol === "https:" &&
      parsed.hostname === supabaseHost &&
      parsed.pathname.startsWith("/storage/v1/object/public/")
    );
  } catch {
    return false;
  }
}
