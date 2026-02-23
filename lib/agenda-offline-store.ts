/**
 * Offline store for agenda data using IndexedDB via idb-keyval.
 *
 * Provides read-through caching: when online data arrives, it's persisted
 * to IDB. When offline, the cached copy is used as fallback.
 *
 * Also manages a mutation queue for offline changes (add/remove attendance)
 * that gets synced when the connection is restored.
 */

import { get, set, del } from "idb-keyval";

// ── Types ──────────────────────────────────────────────────

/** A single queued mutation (add or remove an artist from attendance) */
interface OfflineMutation {
  id: string;
  type: "add" | "remove";
  artistId: string;
  timestamp: number;
}

// ── Keys ───────────────────────────────────────────────────

const ATTENDANCE_KEY = "migrilla:attendance";
const MUTATION_QUEUE_KEY = "migrilla:mutation-queue";
const LAST_SYNC_KEY = "migrilla:last-sync";

// ── Attendance cache (read/write) ──────────────────────────

/**
 * Save the full attendance set to IndexedDB.
 * Called after a successful server fetch to keep the offline copy fresh.
 */
export async function cacheAttendance(artistIds: string[]): Promise<void> {
  try {
    await set(ATTENDANCE_KEY, artistIds);
  } catch (error) {
    console.error("[offline-store] Failed to cache attendance:", error);
  }
}

/**
 * Read the cached attendance from IndexedDB.
 * Returns null if no cached data exists.
 */
export async function getCachedAttendance(): Promise<string[] | null> {
  try {
    const data = await get<string[]>(ATTENDANCE_KEY);
    return data ?? null;
  } catch (error) {
    console.error("[offline-store] Failed to read cached attendance:", error);
    return null;
  }
}

/**
 * Clear the cached attendance (e.g., on logout).
 */
export async function clearCachedAttendance(): Promise<void> {
  try {
    await del(ATTENDANCE_KEY);
  } catch (error) {
    console.error("[offline-store] Failed to clear cached attendance:", error);
  }
}

// ── Mutation queue (offline changes) ───────────────────────

/**
 * Get all pending mutations from the queue.
 */
export async function getMutationQueue(): Promise<OfflineMutation[]> {
  try {
    const queue = await get<OfflineMutation[]>(MUTATION_QUEUE_KEY);
    return queue ?? [];
  } catch (error) {
    console.error("[offline-store] Failed to read mutation queue:", error);
    return [];
  }
}

/**
 * Add a mutation to the offline queue.
 * Deduplicates: if the same artistId already has a pending mutation,
 * it's replaced (last write wins).
 */
export async function enqueueMutation(
  type: "add" | "remove",
  artistId: string,
): Promise<void> {
  try {
    const queue = await getMutationQueue();

    // Remove any existing mutation for this artist (last write wins)
    const filtered = queue.filter((m) => m.artistId !== artistId);

    filtered.push({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      type,
      artistId,
      timestamp: Date.now(),
    });

    await set(MUTATION_QUEUE_KEY, filtered);
  } catch (error) {
    console.error("[offline-store] Failed to enqueue mutation:", error);
  }
}

/**
 * Remove specific mutations from the queue (after successful sync).
 */
export async function dequeueMutations(ids: string[]): Promise<void> {
  try {
    const queue = await getMutationQueue();
    const idSet = new Set(ids);
    const remaining = queue.filter((m) => !idSet.has(m.id));
    await set(MUTATION_QUEUE_KEY, remaining);
  } catch (error) {
    console.error("[offline-store] Failed to dequeue mutations:", error);
  }
}

/**
 * Clear the entire mutation queue.
 */
export async function clearMutationQueue(): Promise<void> {
  try {
    await del(MUTATION_QUEUE_KEY);
  } catch (error) {
    console.error("[offline-store] Failed to clear mutation queue:", error);
  }
}

// ── Sync timestamp ─────────────────────────────────────────

/**
 * Record when the last successful sync happened.
 */
export async function setLastSyncTimestamp(): Promise<void> {
  try {
    await set(LAST_SYNC_KEY, Date.now());
  } catch (error) {
    console.error("[offline-store] Failed to set last sync timestamp:", error);
  }
}

/**
 * Get the timestamp of the last successful sync.
 * Returns null if never synced.
 */
export async function getLastSyncTimestamp(): Promise<number | null> {
  try {
    const ts = await get<number>(LAST_SYNC_KEY);
    return ts ?? null;
  } catch (error) {
    console.error("[offline-store] Failed to get last sync timestamp:", error);
    return null;
  }
}
