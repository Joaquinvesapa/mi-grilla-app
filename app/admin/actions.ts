"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { RawSchedule } from "@/lib/schedule-types";
import fallbackData from "@/lollapalooza-schedule.json";

// ── Helpers ────────────────────────────────────────────────

/**
 * Verifies the current user is an admin. Returns user ID or null.
 */
async function requireAdmin(): Promise<string | null> {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) return null;

  return user.id;
}

// ── Actions ────────────────────────────────────────────────

/**
 * Gets the current schedule data from the database.
 * If no row exists, returns the static fallback.
 */
export async function getAdminSchedule(): Promise<{
  data: RawSchedule;
  updatedAt: string | null;
  isFromDb: boolean;
}> {
  const adminId = await requireAdmin();
  if (!adminId) {
    return { data: fallbackData as RawSchedule, updatedAt: null, isFromDb: false };
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("schedule")
    .select("data, updated_at")
    .limit(1)
    .single();

  if (error || !data) {
    return { data: fallbackData as RawSchedule, updatedAt: null, isFromDb: false };
  }

  return {
    data: data.data as RawSchedule,
    updatedAt: data.updated_at as string,
    isFromDb: true,
  };
}

/**
 * Seeds the schedule table with the static JSON data.
 * Only runs if the table is empty (first deploy).
 */
export async function seedSchedule(): Promise<{
  success: boolean;
  error?: string;
}> {
  const adminId = await requireAdmin();
  if (!adminId) {
    return { success: false, error: "No autorizado" };
  }

  const admin = createAdminClient();

  // Check if already seeded
  const { data: existing } = await admin
    .from("schedule")
    .select("id")
    .limit(1)
    .single();

  if (existing) {
    return { success: false, error: "La grilla ya existe en la base de datos" };
  }

  const { error } = await admin.from("schedule").insert({
    data: fallbackData,
    updated_by: adminId,
  });

  if (error) {
    console.error("Error seeding schedule:", error.message);
    return { success: false, error: "Error al guardar la grilla" };
  }

  revalidatePath("/grilla", "page");
  revalidatePath("/agenda", "page");

  return { success: true };
}

/**
 * Updates the full schedule JSON in the database.
 * Validates the structure before saving.
 */
export async function updateSchedule(
  schedule: RawSchedule,
): Promise<{ success: boolean; error?: string }> {
  const adminId = await requireAdmin();
  if (!adminId) {
    return { success: false, error: "No autorizado" };
  }

  // ── Basic structure validation ──
  if (!schedule.evento || !Array.isArray(schedule.dias)) {
    return { success: false, error: "Estructura de grilla inválida" };
  }

  for (const dia of schedule.dias) {
    if (!dia.dia || !Array.isArray(dia.escenarios)) {
      return { success: false, error: `Día inválido: ${dia.dia}` };
    }
    for (const esc of dia.escenarios) {
      if (!esc.nombre || !Array.isArray(esc.artistas)) {
        return { success: false, error: `Escenario inválido: ${esc.nombre}` };
      }
      for (const art of esc.artistas) {
        if (!art.nombre || !art.inicio || !art.fin) {
          return {
            success: false,
            error: `Artista inválido en ${esc.nombre}: ${art.nombre || "sin nombre"}`,
          };
        }
        // Validate time format HH:mm
        const timeRegex = /^\d{2}:\d{2}$/;
        if (!timeRegex.test(art.inicio) || !timeRegex.test(art.fin)) {
          return {
            success: false,
            error: `Formato de hora inválido para ${art.nombre}: ${art.inicio} - ${art.fin}`,
          };
        }
      }
    }
  }

  const supabase = await createServerSupabaseClient();

  // Upsert: update existing row or insert if none exists
  const { data: existing } = await supabase
    .from("schedule")
    .select("id")
    .limit(1)
    .single();

  if (existing) {
    const { error } = await supabase
      .from("schedule")
      .update({
        data: schedule,
        updated_at: new Date().toISOString(),
        updated_by: adminId,
      })
      .eq("id", existing.id);

    if (error) {
      console.error("Error updating schedule:", error.message);
      return { success: false, error: "Error al actualizar la grilla" };
    }
  } else {
    const { error } = await supabase.from("schedule").insert({
      data: schedule,
      updated_by: adminId,
    });

    if (error) {
      console.error("Error inserting schedule:", error.message);
      return { success: false, error: "Error al guardar la grilla" };
    }
  }

  revalidatePath("/grilla", "page");
  revalidatePath("/agenda", "page");

  return { success: true };
}

/**
 * Resets the schedule back to the original static JSON values.
 * Overwrites the DB row with the fallback data baked into the build.
 */
export async function resetSchedule(): Promise<{
  success: boolean;
  error?: string;
}> {
  const adminId = await requireAdmin();
  if (!adminId) {
    return { success: false, error: "No autorizado" };
  }

  const supabase = await createServerSupabaseClient();

  const { data: existing } = await supabase
    .from("schedule")
    .select("id")
    .limit(1)
    .single();

  if (!existing) {
    return { success: false, error: "No hay grilla para resetear" };
  }

  const { error } = await supabase
    .from("schedule")
    .update({
      data: fallbackData,
      updated_at: new Date().toISOString(),
      updated_by: adminId,
    })
    .eq("id", existing.id);

  if (error) {
    console.error("Error resetting schedule:", error.message);
    return { success: false, error: "Error al resetear la grilla" };
  }

  revalidatePath("/grilla", "page");
  revalidatePath("/agenda", "page");

  return { success: true };
}

/**
 * Updates a single artist's times within the schedule.
 * This is the most common operation from the festival — quick time edits.
 */
export async function updateArtistTime(
  dayName: string,
  stageName: string,
  artistName: string,
  newInicio: string,
  newFin: string,
): Promise<{ success: boolean; error?: string }> {
  const adminId = await requireAdmin();
  if (!adminId) {
    return { success: false, error: "No autorizado" };
  }

  // Validate time format
  const timeRegex = /^\d{2}:\d{2}$/;
  if (!timeRegex.test(newInicio) || !timeRegex.test(newFin)) {
    return { success: false, error: "Formato de hora inválido (usar HH:mm)" };
  }

  const supabase = await createServerSupabaseClient();

  const { data: row, error: fetchError } = await supabase
    .from("schedule")
    .select("id, data")
    .limit(1)
    .single();

  if (fetchError || !row) {
    return { success: false, error: "No se encontró la grilla" };
  }

  const schedule = row.data as RawSchedule;
  let found = false;

  for (const dia of schedule.dias) {
    if (dia.dia !== dayName) continue;
    for (const esc of dia.escenarios) {
      if (esc.nombre !== stageName) continue;
      for (const art of esc.artistas) {
        if (art.nombre !== artistName) continue;
        art.inicio = newInicio;
        art.fin = newFin;
        found = true;
        break;
      }
    }
  }

  if (!found) {
    return {
      success: false,
      error: `No se encontró: ${artistName} en ${stageName} (${dayName})`,
    };
  }

  const { error: updateError } = await supabase
    .from("schedule")
    .update({
      data: schedule,
      updated_at: new Date().toISOString(),
      updated_by: adminId,
    })
    .eq("id", row.id);

  if (updateError) {
    console.error("Error updating artist time:", updateError.message);
    return { success: false, error: "Error al actualizar el horario" };
  }

  revalidatePath("/grilla", "page");
  revalidatePath("/agenda", "page");

  return { success: true };
}

/**
 * Moves an artist from one stage to another within the same day.
 * Preserves all artist fields (nombre, subtitulo, inicio, fin).
 */
export async function moveArtistStage(
  dayName: string,
  sourceStageName: string,
  targetStageName: string,
  artistName: string,
): Promise<{ success: boolean; error?: string }> {
  const adminId = await requireAdmin();
  if (!adminId) {
    return { success: false, error: "No autorizado" };
  }

  if (sourceStageName === targetStageName) {
    return {
      success: false,
      error: "El escenario destino es el mismo que el actual",
    };
  }

  const supabase = await createServerSupabaseClient();

  const { data: row, error: fetchError } = await supabase
    .from("schedule")
    .select("id, data")
    .limit(1)
    .single();

  if (fetchError || !row) {
    return { success: false, error: "No se encontró la grilla" };
  }

  const schedule = row.data as RawSchedule;

  // ── Find the day ──
  const dia = schedule.dias.find((d) => d.dia === dayName);
  if (!dia) {
    return { success: false, error: `Día no encontrado: ${dayName}` };
  }

  // ── Find source stage and artist ──
  const sourceStage = dia.escenarios.find((e) => e.nombre === sourceStageName);
  if (!sourceStage) {
    return {
      success: false,
      error: `No se encontró: ${artistName} en ${sourceStageName} (${dayName})`,
    };
  }

  const artistIndex = sourceStage.artistas.findIndex(
    (a) => a.nombre === artistName,
  );
  if (artistIndex === -1) {
    return {
      success: false,
      error: `No se encontró: ${artistName} en ${sourceStageName} (${dayName})`,
    };
  }

  // ── Find target stage ──
  const targetStage = dia.escenarios.find((e) => e.nombre === targetStageName);
  if (!targetStage) {
    return {
      success: false,
      error: `Escenario destino no encontrado: ${targetStageName}`,
    };
  }

  // ── Move artist: splice from source, push to target ──
  const [artist] = sourceStage.artistas.splice(artistIndex, 1);
  targetStage.artistas.push(artist);

  // ── Persist ──
  const { error: updateError } = await supabase
    .from("schedule")
    .update({
      data: schedule,
      updated_at: new Date().toISOString(),
      updated_by: adminId,
    })
    .eq("id", row.id);

  if (updateError) {
    console.error("Error moving artist stage:", updateError.message);
    return { success: false, error: "Error al mover el artista de escenario" };
  }

  revalidatePath("/grilla", "page");
  revalidatePath("/agenda", "page");

  return { success: true };
}
