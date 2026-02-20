// ── Group types ────────────────────────────────────────────
// Mirrors the `groups` and `group_members` tables in Supabase.

import type { Profile } from "./profile-types";

// ── Roles ──────────────────────────────────────────────────

const GROUP_ROLE = {
  ADMIN: "admin",
  MEMBER: "member",
} as const;

type GroupRole = (typeof GROUP_ROLE)[keyof typeof GROUP_ROLE];

export { GROUP_ROLE };
export type { GroupRole };

// ── DB rows ────────────────────────────────────────────────

export interface Group {
  id: string;
  name: string;
  invite_code: string;
  created_by: string;
  created_at: string;
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  role: GroupRole;
  joined_at: string;
}

// ── Enriched types for UI ──────────────────────────────────

export interface GroupMemberWithProfile extends GroupMember {
  profile: Profile;
}

/** Group with member count — used in the groups list */
export interface GroupWithMeta extends Group {
  member_count: number;
  my_role: GroupRole;
}

/** Full group detail with members */
export interface GroupDetail extends Group {
  members: GroupMemberWithProfile[];
  my_role: GroupRole;
}

/** Result from find_group_by_invite_code RPC */
export interface GroupPreview {
  id: string;
  name: string;
  invite_code: string;
  member_count: number;
}
