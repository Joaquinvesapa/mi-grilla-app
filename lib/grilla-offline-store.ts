/**
 * Offline store for schedule grid data using IndexedDB via idb-keyval.
 *
 * Caches the parsed schedule days (GridDay[]) and event name so the
 * grilla and agenda can render offline without a server round-trip.
 */

import { get, set, del } from "idb-keyval";

import type { GridDay } from "./schedule-types";

// ── Types ──────────────────────────────────────────────────

interface CachedSchedule {
  eventName: string;
  days: GridDay[];
  cachedAt: number;
}

// ── Keys ───────────────────────────────────────────────────

const SCHEDULE_KEY = "migrilla:schedule";

// ── Schedule cache (read/write) ────────────────────────────

/**
 * Save the parsed schedule to IndexedDB.
 * Called after a successful server fetch to keep the offline copy fresh.
 */
export async function cacheSchedule(
  eventName: string,
  days: GridDay[],
): Promise<void> {
  try {
    const data: CachedSchedule = {
      eventName,
      days,
      cachedAt: Date.now(),
    };
    await set(SCHEDULE_KEY, data);
  } catch (error) {
    console.error("[grilla-offline-store] Failed to cache schedule:", error);
  }
}

/**
 * Read the cached schedule from IndexedDB.
 * Returns null if no cached data exists.
 */
export async function getCachedSchedule(): Promise<CachedSchedule | null> {
  try {
    const data = await get<CachedSchedule>(SCHEDULE_KEY);
    return data ?? null;
  } catch (error) {
    console.error("[grilla-offline-store] Failed to read cached schedule:", error);
    return null;
  }
}

/**
 * Clear the cached schedule (e.g., on logout or cache bust).
 */
export async function clearCachedSchedule(): Promise<void> {
  try {
    await del(SCHEDULE_KEY);
  } catch (error) {
    console.error("[grilla-offline-store] Failed to clear cached schedule:", error);
  }
}

/**
 * Check if we have any cached schedule data.
 */
export async function hasScheduleCache(): Promise<boolean> {
  try {
    const data = await get<CachedSchedule>(SCHEDULE_KEY);
    return data != null && data.days.length > 0;
  } catch {
    return false;
  }
}
