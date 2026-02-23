"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/profile-types";
import type { FriendshipRelation } from "@/lib/friendship-types";
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

  const from = (safePage - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let dbQuery = supabase
    .from("profiles")
    .select("*", { count: "exact" })
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (safeQuery) {
    dbQuery = dbQuery.ilike("username", `%${escapeIlike(safeQuery)}%`);
  }

  const { data, count } = await dbQuery;
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
    page,
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
