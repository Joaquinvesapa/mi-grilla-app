"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/profile-types";
import {
  FRIENDSHIP_STATUS,
  FRIENDSHIP_RELATION,
  type Friendship,
  type FriendshipWithProfile,
  type FriendshipRelation,
} from "@/lib/friendship-types";
import { isValidUuid, validateUuids } from "@/lib/security";

// ── Helpers ────────────────────────────────────────────────

async function requireUser() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("No autenticado");
  return { supabase, userId: user.id };
}

// ── Types ──────────────────────────────────────────────────

export type FriendshipActionResult = {
  success: boolean;
  error?: string;
};

// ── Send friend request ────────────────────────────────────

export async function sendFriendRequest(
  addresseeId: string,
): Promise<FriendshipActionResult> {
  const { supabase, userId } = await requireUser();

  if (!isValidUuid(addresseeId)) {
    return { success: false, error: "ID de usuario inv\u00e1lido" };
  }

  if (addresseeId === userId) {
    return { success: false, error: "No podés agregarte a vos mismo" };
  }

  // Check if a relationship already exists (in either direction)
  const { data: existing } = await supabase
    .from("friendships")
    .select("id, status")
    .or(
      `and(requester_id.eq.${userId},addressee_id.eq.${addresseeId}),and(requester_id.eq.${addresseeId},addressee_id.eq.${userId})`,
    )
    .maybeSingle();

  if (existing) {
    if (existing.status === FRIENDSHIP_STATUS.ACCEPTED) {
      return { success: false, error: "Ya son amigos" };
    }
    if (existing.status === FRIENDSHIP_STATUS.PENDING) {
      return { success: false, error: "Ya hay una solicitud pendiente" };
    }
  }

  const { error } = await supabase.from("friendships").insert({
    requester_id: userId,
    addressee_id: addresseeId,
  });

  if (error) {
    return { success: false, error: "No se pudo enviar la solicitud" };
  }

  revalidatePath("/social");
  revalidatePath("/social/amigos");
  return { success: true };
}

// ── Accept friend request ──────────────────────────────────

export async function acceptFriendRequest(
  friendshipId: string,
): Promise<FriendshipActionResult> {
  const { supabase, userId } = await requireUser();

  const { error } = await supabase
    .from("friendships")
    .update({ status: FRIENDSHIP_STATUS.ACCEPTED })
    .eq("id", friendshipId)
    .eq("addressee_id", userId)
    .eq("status", FRIENDSHIP_STATUS.PENDING);

  if (error) {
    return { success: false, error: "No se pudo aceptar la solicitud" };
  }

  revalidatePath("/social");
  revalidatePath("/social/amigos");
  return { success: true };
}

// ── Reject friend request ──────────────────────────────────

export async function rejectFriendRequest(
  friendshipId: string,
): Promise<FriendshipActionResult> {
  const { supabase, userId } = await requireUser();

  const { error } = await supabase
    .from("friendships")
    .delete()
    .eq("id", friendshipId)
    .eq("addressee_id", userId)
    .eq("status", FRIENDSHIP_STATUS.PENDING);

  if (error) {
    return { success: false, error: "No se pudo rechazar la solicitud" };
  }

  revalidatePath("/social");
  revalidatePath("/social/amigos");
  return { success: true };
}

// ── Remove friend ──────────────────────────────────────────

export async function removeFriend(
  friendshipId: string,
): Promise<FriendshipActionResult> {
  const { supabase, userId } = await requireUser();

  const { error } = await supabase
    .from("friendships")
    .delete()
    .eq("id", friendshipId)
    .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`);

  if (error) {
    return { success: false, error: "No se pudo eliminar al amigo" };
  }

  revalidatePath("/social");
  revalidatePath("/social/amigos");
  return { success: true };
}

// ── Get accepted friends (with profiles) ───────────────────

export async function getAcceptedFriends(): Promise<FriendshipWithProfile[]> {
  const { supabase, userId } = await requireUser();

  // Friendships where I'm the requester
  const { data: asRequester } = await supabase
    .from("friendships")
    .select("*, profile:profiles!friendships_addressee_id_fkey(*)")
    .eq("requester_id", userId)
    .eq("status", FRIENDSHIP_STATUS.ACCEPTED);

  // Friendships where I'm the addressee
  const { data: asAddressee } = await supabase
    .from("friendships")
    .select("*, profile:profiles!friendships_requester_id_fkey(*)")
    .eq("addressee_id", userId)
    .eq("status", FRIENDSHIP_STATUS.ACCEPTED);

  const friends: FriendshipWithProfile[] = [
    ...((asRequester ?? []) as FriendshipWithProfile[]),
    ...((asAddressee ?? []) as FriendshipWithProfile[]),
  ];

  return friends.sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
}

// ── Get pending requests received ──────────────────────────

export async function getPendingReceived(): Promise<FriendshipWithProfile[]> {
  const { supabase, userId } = await requireUser();

  const { data } = await supabase
    .from("friendships")
    .select("*, profile:profiles!friendships_requester_id_fkey(*)")
    .eq("addressee_id", userId)
    .eq("status", FRIENDSHIP_STATUS.PENDING)
    .order("created_at", { ascending: false });

  return (data ?? []) as FriendshipWithProfile[];
}

// ── Get pending requests sent ──────────────────────────────

export async function getPendingSent(): Promise<FriendshipWithProfile[]> {
  const { supabase, userId } = await requireUser();

  const { data } = await supabase
    .from("friendships")
    .select("*, profile:profiles!friendships_addressee_id_fkey(*)")
    .eq("requester_id", userId)
    .eq("status", FRIENDSHIP_STATUS.PENDING)
    .order("created_at", { ascending: false });

  return (data ?? []) as FriendshipWithProfile[];
}

// ── Get friendship map for a list of profile IDs ───────────
// Returns a map of profileId → FriendshipRelation
// Used by the community page to show correct button per user

export async function getFriendshipMap(
  profileIds: string[],
): Promise<Record<string, { relation: FriendshipRelation; friendshipId: string | null }>> {
  const { supabase, userId } = await requireUser();

  if (profileIds.length === 0) return {};

  // Validate all IDs are UUIDs before interpolating into .or() filter
  const safeIds = validateUuids(profileIds);
  if (safeIds.length === 0) return {};

  const { data } = await supabase
    .from("friendships")
    .select("id, requester_id, addressee_id, status")
    .or(
      `and(requester_id.eq.${userId},addressee_id.in.(${safeIds.join(",")})),and(addressee_id.eq.${userId},requester_id.in.(${safeIds.join(",")}))`,
    );

  const map: Record<string, { relation: FriendshipRelation; friendshipId: string | null }> = {};

  // Default all to NONE
  for (const id of safeIds) {
    if (id === userId) {
      map[id] = { relation: FRIENDSHIP_RELATION.SELF, friendshipId: null };
    } else {
      map[id] = { relation: FRIENDSHIP_RELATION.NONE, friendshipId: null };
    }
  }

  for (const row of data ?? []) {
    const otherId =
      row.requester_id === userId ? row.addressee_id : row.requester_id;

    if (row.status === FRIENDSHIP_STATUS.ACCEPTED) {
      map[otherId] = { relation: FRIENDSHIP_RELATION.ACCEPTED, friendshipId: row.id };
    } else if (row.status === FRIENDSHIP_STATUS.PENDING) {
      if (row.requester_id === userId) {
        map[otherId] = { relation: FRIENDSHIP_RELATION.PENDING_SENT, friendshipId: row.id };
      } else {
        map[otherId] = { relation: FRIENDSHIP_RELATION.PENDING_RECEIVED, friendshipId: row.id };
      }
    }
  }

  return map;
}

// ── Get friend's attendance ────────────────────────────────

export async function getFriendAttendance(
  friendUserId: string,
): Promise<string[]> {
  const { supabase, userId } = await requireUser();

  if (!isValidUuid(friendUserId)) return [];

  // Verify they are actually friends
  const { data: friendship } = await supabase
    .from("friendships")
    .select("id")
    .eq("status", FRIENDSHIP_STATUS.ACCEPTED)
    .or(
      `and(requester_id.eq.${userId},addressee_id.eq.${friendUserId}),and(requester_id.eq.${friendUserId},addressee_id.eq.${userId})`,
    )
    .maybeSingle();

  if (!friendship) return [];

  const { data } = await supabase
    .from("attendance")
    .select("artist_id")
    .eq("user_id", friendUserId);

  return (data ?? []).map((row) => row.artist_id);
}

// ── Get friend profile ─────────────────────────────────────

export async function getFriendProfile(
  friendUserId: string,
): Promise<Profile | null> {
  const { supabase, userId } = await requireUser();

  if (!isValidUuid(friendUserId)) return null;

  // Verify they are actually friends
  const { data: friendship } = await supabase
    .from("friendships")
    .select("id")
    .eq("status", FRIENDSHIP_STATUS.ACCEPTED)
    .or(
      `and(requester_id.eq.${userId},addressee_id.eq.${friendUserId}),and(requester_id.eq.${friendUserId},addressee_id.eq.${userId})`,
    )
    .maybeSingle();

  if (!friendship) return null;

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", friendUserId)
    .single();

  return data as Profile | null;
}
