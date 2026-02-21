"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { FRIENDSHIP_STATUS } from "@/lib/friendship-types";
import type { Profile } from "@/lib/profile-types";

/**
 * Obtiene los artist IDs que el usuario logueado marcó como "voy".
 * Devuelve un array vacío si no hay sesión.
 */
export async function getMyAttendance(): Promise<string[]> {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("attendance")
    .select("artist_id")
    .eq("user_id", user.id);

  if (error) {
    console.error("Error fetching attendance:", error.message);
    return [];
  }

  return data.map((row) => row.artist_id);
}

/**
 * Guarda la selección completa de artistas del usuario.
 * Hace un diff contra lo que ya existe: inserta los nuevos, elimina los que ya no están.
 *
 * @param artistIds - Array completo de artist IDs seleccionados
 * @returns Objeto con éxito o error
 */
export async function saveAttendance(
  artistIds: string[],
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "No autenticado" };
  }

  // 1. Obtener las selecciones actuales
  const { data: existing, error: fetchError } = await supabase
    .from("attendance")
    .select("artist_id")
    .eq("user_id", user.id);

  if (fetchError) {
    return { success: false, error: fetchError.message };
  }

  const existingIds = new Set(existing.map((row) => row.artist_id));
  const newIds = new Set(artistIds);

  // 2. Calcular diff
  const toInsert = artistIds.filter((id) => !existingIds.has(id));
  const toDelete = existing
    .map((row) => row.artist_id)
    .filter((id) => !newIds.has(id));

  // 3. Insertar nuevos
  if (toInsert.length > 0) {
    const { error: insertError } = await supabase.from("attendance").insert(
      toInsert.map((artistId) => ({
        user_id: user.id,
        artist_id: artistId,
      })),
    );

    if (insertError) {
      return { success: false, error: insertError.message };
    }
  }

  // 4. Eliminar los que ya no están
  if (toDelete.length > 0) {
    const { error: deleteError } = await supabase
      .from("attendance")
      .delete()
      .eq("user_id", user.id)
      .in("artist_id", toDelete);

    if (deleteError) {
      return { success: false, error: deleteError.message };
    }
  }

  return { success: true };
}

// ── Social attendance data ─────────────────────────────────

/** Lightweight profile for social badges in the grid */
export interface SocialAttendee {
  id: string;
  username: string;
  avatar: string;
  avatar_url: string | null;
}

/**
 * For each artist, returns which friends/group-members are attending.
 * Used to show "3 amigos van" badges on artist cards in the grid.
 *
 * Combines: accepted friends + all group co-members (deduplicated).
 */
export async function getSocialAttendance(): Promise<
  Record<string, SocialAttendee[]>
> {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return {};

  // 1. Get accepted friend user IDs
  const { data: friendships } = await supabase
    .from("friendships")
    .select("requester_id, addressee_id")
    .eq("status", FRIENDSHIP_STATUS.ACCEPTED)
    .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`);

  const friendIds = new Set<string>();
  for (const f of friendships ?? []) {
    const otherId =
      f.requester_id === user.id ? f.addressee_id : f.requester_id;
    friendIds.add(otherId);
  }

  // 2. Get group co-member user IDs
  const { data: myMemberships } = await supabase
    .from("group_members")
    .select("group_id")
    .eq("user_id", user.id);

  if (myMemberships && myMemberships.length > 0) {
    const groupIds = myMemberships.map((m) => m.group_id);
    const { data: coMembers } = await supabase
      .from("group_members")
      .select("user_id")
      .in("group_id", groupIds)
      .neq("user_id", user.id);

    for (const m of coMembers ?? []) {
      friendIds.add(m.user_id);
    }
  }

  if (friendIds.size === 0) return {};

  const socialUserIds = Array.from(friendIds);

  // 3. Fetch profiles for these users
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, username, avatar, avatar_url")
    .in("id", socialUserIds);

  const profileMap = new Map<string, SocialAttendee>();
  for (const p of (profiles ?? []) as SocialAttendee[]) {
    profileMap.set(p.id, p);
  }

  // 4. Fetch attendance for all social users
  const { data: attendance } = await supabase
    .from("attendance")
    .select("user_id, artist_id")
    .in("user_id", socialUserIds);

  // 5. Build map: artistId → SocialAttendee[]
  const result: Record<string, SocialAttendee[]> = {};

  for (const row of attendance ?? []) {
    const profile = profileMap.get(row.user_id);
    if (!profile) continue;

    if (!result[row.artist_id]) {
      result[row.artist_id] = [];
    }
    result[row.artist_id].push(profile);
  }

  return result;
}
