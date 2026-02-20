// ── Profile types ──────────────────────────────────────────
// Mirrors the `profiles` table in Supabase.

export interface Profile {
  id: string;
  username: string;
  instagram: string | null;
  is_public: boolean;
  avatar: string;
  created_at: string;
}

export interface ProfileUpdate {
  username?: string;
  instagram?: string | null;
  is_public?: boolean;
}

// ── Constants ──────────────────────────────────────────────

export const AVATAR_COLORS = [
  "#8ac926",
  "#FB5607",
  "#FF006E",
  "#8338EC",
  "#3A86FF",
] as const;

export function randomAvatar(): string {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
}
