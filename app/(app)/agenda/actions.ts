"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";

/**
 * Elimina un artista de la agenda del usuario logueado.
 * Se usa para el botón de "quitar" en cada card de la agenda.
 */
export async function removeFromAgenda(
  artistId: string,
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "No autenticado" };
  }

  const { error } = await supabase
    .from("attendance")
    .delete()
    .eq("user_id", user.id)
    .eq("artist_id", artistId);

  if (error) {
    return { success: false, error: "No se pudo quitar al artista de la agenda." };
  }

  return { success: true };
}
