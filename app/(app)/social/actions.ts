"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/profile-types";
import {
  FRIENDSHIP_STATUS,
  FRIENDSHIP_RELATION,
  type FriendshipRelation,
} from "@/lib/friendship-types";
import { getFriendshipMap } from "./amigos/actions";
import { escapeIlike } from "@/lib/security";

// ── Constants ──────────────────────────────────────────────

const PAGE_SIZE = 20;

// ── Types ──────────────────────────────────────────────────

export interface CommunityProfile extends Profile {
  relation: FriendshipRelation;
  friendshipId: string | null;
}

export interface CommunityResult {
  profiles: CommunityProfile[];
  total: number;
  page: number;
  pageSize: number;
}

// ── Fetch community profiles ───────────────────────────────
//
// Mode A — no query: returns only accepted friends (ordered by friendship date)
// Mode B — with query: searches all public profiles by username

export async function getCommunityProfiles(
  query: string,
  page: number,
): Promise<CommunityResult> {
  const supabase = await createServerSupabaseClient();

  // ── Auth check (defense-in-depth — middleware also guards this route) ──
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { profiles: [], total: 0, page: 1, pageSize: PAGE_SIZE };
  }

  // ── Input sanitization ──
  const safePage = Math.max(1, Math.floor(page));
  const safeQuery = typeof query === "string" ? query.slice(0, 50) : "";

  // ── Mode A: no search query → show only accepted friends ──
  if (!safeQuery) {
    const [{ data: asRequester }, { data: asAddressee }] = await Promise.all([
      supabase
        .from("friendships")
        .select("id, created_at, profile:profiles!friendships_addressee_id_fkey(*)")
        .eq("requester_id", user.id)
        .eq("status", FRIENDSHIP_STATUS.ACCEPTED),
      supabase
        .from("friendships")
        .select("id, created_at, profile:profiles!friendships_requester_id_fkey(*)")
        .eq("addressee_id", user.id)
        .eq("status", FRIENDSHIP_STATUS.ACCEPTED),
    ]);

    type FriendRow = { id: string; created_at: string; profile: Profile };

    const allFriends = [
      ...((asRequester ?? []) as unknown as FriendRow[]),
      ...((asAddressee ?? []) as unknown as FriendRow[]),
    ].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );

    const total = allFriends.length;
    const from = (safePage - 1) * PAGE_SIZE;
    const paginated = allFriends.slice(from, from + PAGE_SIZE);

    const enriched: CommunityProfile[] = paginated.map((f) => ({
      ...f.profile,
      relation: FRIENDSHIP_RELATION.ACCEPTED as FriendshipRelation,
      friendshipId: f.id,
    }));

    return { profiles: enriched, total, page: safePage, pageSize: PAGE_SIZE };
  }

  // ── Mode B: with query → search all public profiles by username ──
  const from = (safePage - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data, count } = await supabase
    .from("profiles")
    .select("*", { count: "exact" })
    .eq("is_public", true)
    .ilike("username", `%${escapeIlike(safeQuery)}%`)
    .order("created_at", { ascending: false })
    .range(from, to);

  const profiles = (data ?? []) as Profile[];

  // Enrich with friendship status
  const profileIds = profiles.map((p) => p.id);
  const friendshipMap = await getFriendshipMap(profileIds);

  const enriched: CommunityProfile[] = profiles.map((p) => ({
    ...p,
    relation: friendshipMap[p.id]?.relation ?? "none",
    friendshipId: friendshipMap[p.id]?.friendshipId ?? null,
  }));

  return {
    profiles: enriched,
    total: count ?? 0,
    page: safePage,
    pageSize: PAGE_SIZE,
  };
}

// ── Get current user ID ────────────────────────────────────

export async function getCurrentUserId(): Promise<string | null> {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user?.id ?? null;
}
