// ── Demo Types ─────────────────────────────────────────────
// Type definitions for the demo mode data layer.
// These mirror the production Supabase types but are standalone
// so the demo has zero dependency on auth or server code.

import type { Profile } from "@/lib/profile-types"
import type { FriendshipStatus } from "@/lib/friendship-types"
import type { GroupRole } from "@/lib/group-types"
import type { GridDay, LiveStage } from "@/lib/schedule-types"

// ── Friendship ─────────────────────────────────────────────

/** Demo-mode friendship row — mirrors the Supabase `friendships` table shape */
export interface DemoFriendship {
  id: string
  requester_id: string
  addressee_id: string
  status: FriendshipStatus
  created_at: string
}

// ── Groups ─────────────────────────────────────────────────

/** A group member with their profile — demo variant (no `id` or `joined_at` needed) */
export interface DemoGroupMemberWithProfile {
  group_id: string
  user_id: string
  role: GroupRole
  profile: Profile
}

/** Group list item with member count and viewer's role */
export interface DemoGroupWithMeta {
  id: string
  name: string
  invite_code: string
  created_by: string
  created_at: string
  member_count: number
  my_role: GroupRole
}

/** Full group detail with resolved member profiles */
export interface DemoGroupDetail {
  id: string
  name: string
  invite_code: string
  created_by: string
  created_at: string
  members: DemoGroupMemberWithProfile[]
  my_role: GroupRole
}

// ── Context ────────────────────────────────────────────────

/** Full shape of the DemoContext value exposed by DemoProvider */
export interface DemoContextValue {
  // ── Demo user ──
  demoUser: Profile

  // ── Schedule ──
  days: GridDay[]
  eventName: string

  // ── EN VIVO (fixed simulated time) ──
  liveStages: LiveStage[]
  demoCurrentMin: number
  demoDayLabel: string

  // ── Attendance ──
  attendance: Set<string>
  toggleAttendance: (artistId: string) => void

  // ── Social state ──
  allProfiles: Profile[]
  friendships: DemoFriendship[]
  groups: DemoGroupWithMeta[]
  groupDetails: Record<string, DemoGroupDetail>
  friendAttendance: Record<string, string[]>

  // ── Social mutations ──
  sendFriendRequest: (targetId: string) => void
  acceptFriendRequest: (friendshipId: string) => void
  rejectFriendRequest: (friendshipId: string) => void
  removeFriend: (friendshipId: string) => void

  // ── Attendance queries ──
  getFriendAttendance: (friendId: string) => string[]
}
