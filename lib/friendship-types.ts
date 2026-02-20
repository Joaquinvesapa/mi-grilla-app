// ── Friendship types ───────────────────────────────────────
// Mirrors the `friendships` table in Supabase.

import type { Profile } from "./profile-types";

// ── Status ─────────────────────────────────────────────────

const FRIENDSHIP_STATUS = {
  PENDING: "pending",
  ACCEPTED: "accepted",
  REJECTED: "rejected",
} as const;

type FriendshipStatus =
  (typeof FRIENDSHIP_STATUS)[keyof typeof FRIENDSHIP_STATUS];

export { FRIENDSHIP_STATUS };
export type { FriendshipStatus };

// ── DB row ─────────────────────────────────────────────────

export interface Friendship {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: FriendshipStatus;
  created_at: string;
}

// ── Enriched types for UI ──────────────────────────────────

/** A friendship row joined with the OTHER user's profile */
export interface FriendshipWithProfile extends Friendship {
  profile: Profile;
}

/**
 * Friendship state relative to the current user viewing a profile.
 * Used to decide which button/badge to show in UserCard.
 */
const FRIENDSHIP_RELATION = {
  NONE: "none",
  PENDING_SENT: "pending_sent",
  PENDING_RECEIVED: "pending_received",
  ACCEPTED: "accepted",
  SELF: "self",
} as const;

type FriendshipRelation =
  (typeof FRIENDSHIP_RELATION)[keyof typeof FRIENDSHIP_RELATION];

export { FRIENDSHIP_RELATION };
export type { FriendshipRelation };
