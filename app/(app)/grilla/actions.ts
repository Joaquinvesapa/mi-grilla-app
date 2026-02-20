"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";

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
