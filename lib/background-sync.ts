/**
 * Background Sync — Processes offline mutation queue when connection is restored.
 *
 * Strategy:
 * 1. When online, read the mutation queue from IndexedDB
 * 2. Process each mutation by calling the appropriate Server Action
 * 3. On success, remove from queue + update cached attendance
 * 4. On failure, leave in queue for retry
 *
 * Falls back to manual polling since Background Sync API has limited support.
 */

import {
  getMutationQueue,
  dequeueMutations,
  cacheAttendance,
  getCachedAttendance,
  setLastSyncTimestamp,
} from "@/lib/agenda-offline-store";
import { removeFromAgenda } from "@/app/(app)/agenda/actions";
import { saveAttendance } from "@/app/(app)/grilla/actions";

// ── Types ──────────────────────────────────────────────────

interface SyncResult {
  /** Number of mutations successfully synced */
  synced: number;
  /** Number of mutations that failed (remain in queue) */
  failed: number;
  /** Whether there are still pending mutations */
  hasPending: boolean;
}

// ── Sync logic ─────────────────────────────────────────────

/**
 * Process all pending offline mutations.
 * Returns a summary of what happened.
 */
export async function syncOfflineMutations(): Promise<SyncResult> {
  const queue = await getMutationQueue();

  if (queue.length === 0) {
    return { synced: 0, failed: 0, hasPending: false };
  }

  // Sort by timestamp (oldest first) to preserve order
  const sorted = [...queue].sort((a, b) => a.timestamp - b.timestamp);

  // Separate into adds and removes
  const removes = sorted.filter((m) => m.type === "remove");
  const adds = sorted.filter((m) => m.type === "add");

  const syncedIds: string[] = [];
  const failedIds: string[] = [];

  // Process removes one by one (each is an independent server action)
  for (const mutation of removes) {
    try {
      const result = await removeFromAgenda(mutation.artistId);
      if (result.success) {
        syncedIds.push(mutation.id);
      } else {
        console.warn(
          `[background-sync] Failed to sync remove for ${mutation.artistId}:`,
          result.error,
        );
        failedIds.push(mutation.id);
      }
    } catch (error) {
      console.error(
        `[background-sync] Error syncing remove for ${mutation.artistId}:`,
        error,
      );
      failedIds.push(mutation.id);
    }
  }

  // Process adds as a batch via saveAttendance (more efficient)
  if (adds.length > 0) {
    try {
      // Get current cached attendance + new adds to build the full set
      const cached = (await getCachedAttendance()) ?? [];
      const currentSet = new Set(cached);

      // Apply pending removes
      for (const rm of removes) {
        if (syncedIds.includes(rm.id)) {
          currentSet.delete(rm.artistId);
        }
      }

      // Apply pending adds
      for (const add of adds) {
        currentSet.add(add.artistId);
      }

      const result = await saveAttendance(Array.from(currentSet));
      if (result.success) {
        syncedIds.push(...adds.map((m) => m.id));
      } else {
        console.warn(
          "[background-sync] Failed to sync adds batch:",
          result.error,
        );
        failedIds.push(...adds.map((m) => m.id));
      }
    } catch (error) {
      console.error("[background-sync] Error syncing adds batch:", error);
      failedIds.push(...adds.map((m) => m.id));
    }
  }

  // Dequeue successful mutations
  if (syncedIds.length > 0) {
    await dequeueMutations(syncedIds);
  }

  // Update cached attendance with latest state
  if (syncedIds.length > 0) {
    const cached = (await getCachedAttendance()) ?? [];
    const updated = new Set(cached);

    for (const mutation of sorted) {
      if (syncedIds.includes(mutation.id)) {
        if (mutation.type === "add") {
          updated.add(mutation.artistId);
        } else {
          updated.delete(mutation.artistId);
        }
      }
    }

    await cacheAttendance(Array.from(updated));
    await setLastSyncTimestamp();
  }

  return {
    synced: syncedIds.length,
    failed: failedIds.length,
    hasPending: failedIds.length > 0,
  };
}

/**
 * Check if there are pending mutations that need syncing.
 */
export async function hasPendingMutations(): Promise<boolean> {
  const queue = await getMutationQueue();
  return queue.length > 0;
}

/**
 * Get the count of pending mutations.
 */
export async function getPendingMutationCount(): Promise<number> {
  const queue = await getMutationQueue();
  return queue.length;
}
