"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { RawSchedule } from "@/lib/schedule-types";

// ── Fallback ───────────────────────────────────────────────
// Keep the static JSON as a fallback in case the DB row doesn't
// exist yet (first deploy before seed, or local dev without DB).
import fallbackData from "@/lollapalooza-schedule.json";

/**
 * Fetches the festival schedule from Supabase.
 * Falls back to the static JSON if the DB row doesn't exist.
 *
 * This replaces the static `import scheduleData from "@/lollapalooza-schedule.json"`
 * that was previously used in grilla, agenda, and social pages.
 */
export async function getScheduleData(): Promise<RawSchedule> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("schedule")
    .select("data")
    .limit(1)
    .single();

  if (error || !data) {
    console.warn("Schedule not found in DB, using static fallback:", error?.message);
    return fallbackData as RawSchedule;
  }

  return data.data as RawSchedule;
}
