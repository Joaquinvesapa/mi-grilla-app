// ── Demo Group Utilities ────────────────────────────────────
// Pure helper functions for demo group computations.
// Extracted from page files to comply with Next.js 16 page
// export restrictions (only framework-defined exports allowed).

import type { Profile } from "@/lib/profile-types";
import type { DemoGroupMemberWithProfile } from "@/lib/demo/demo-types";

// ── computeGroupAttendance ──────────────────────────────────

/**
 * Computes Record<artistId, Profile[]> showing which group members
 * are attending each show. The demo user's attendance comes from the
 * reactive Set; friends' attendance comes from the static Record.
 */
export function computeGroupAttendance(
  members: DemoGroupMemberWithProfile[],
  demoAttendance: Set<string>,
  friendAttendance: Record<string, string[]>,
): Record<string, Profile[]> {
  const result: Record<string, Profile[]> = {};

  for (const member of members) {
    // Prefer explicit friendAttendance entry; fall back to demo user's Set
    const artistIds: string[] =
      member.user_id in friendAttendance
        ? friendAttendance[member.user_id]
        : Array.from(demoAttendance);

    for (const artistId of artistIds) {
      if (!result[artistId]) result[artistId] = [];
      result[artistId].push(member.profile);
    }
  }

  return result;
}
