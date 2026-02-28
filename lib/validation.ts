// ── Constants ──────────────────────────────────────────────

const USERNAME_REGEX = /^[a-z0-9_]{3,20}$/
const PIN_REGEX = /^[0-9]{6}$/
const INSTAGRAM_REGEX = /^[a-z0-9._]{1,30}$/i
const EMAIL_DOMAIN = "migrilla.app"

// ── Username ───────────────────────────────────────────────

/**
 * Validates a username. Returns error message or null if valid.
 * Rules: 3-20 chars, lowercase letters, numbers, underscores only.
 */
export function validateUsername(raw: string): string | null {
  if (!raw) return "Ingresá un nombre de usuario"
  if (raw.length < 3) return "Mínimo 3 caracteres"
  if (raw.length > 20) return "Máximo 20 caracteres"
  if (!USERNAME_REGEX.test(raw))
    return "Solo letras minúsculas, números y guiones bajos"
  return null
}

// ── PIN ────────────────────────────────────────────────────

/**
 * Validates a 6-digit PIN. Returns error message or null if valid.
 */
export function validatePin(pin: string): string | null {
  if (!pin) return "Ingresá un PIN"
  if (!PIN_REGEX.test(pin)) return "El PIN debe tener exactamente 6 dígitos"
  return null
}

// ── Instagram ──────────────────────────────────────────────

/**
 * Cleans an Instagram handle by stripping the leading @.
 * Returns the cleaned string, or empty string if input was empty.
 */
export function cleanInstagram(raw: string): string {
  return raw.replace(/^@/, "")
}

/**
 * Validates an Instagram handle (after cleaning).
 * Returns error message or null if valid.
 * Empty string is valid (field is optional).
 */
export function validateInstagram(raw: string): string | null {
  if (!raw) return null // optional field
  const clean = cleanInstagram(raw)
  if (!INSTAGRAM_REGEX.test(clean))
    return "Instagram inválido (solo letras, números, puntos y guiones bajos)"
  return null
}

// ── Fake Email ─────────────────────────────────────────────

/**
 * Generates a fake email from a username (for Supabase auth with username+PIN).
 */
export function toFakeEmail(username: string): string {
  return `${username}@${EMAIL_DOMAIN}`
}
