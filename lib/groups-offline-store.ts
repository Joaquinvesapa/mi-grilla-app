/**
 * Offline store for groups data using IndexedDB via idb-keyval.
 *
 * Caches the user's groups list, group details (members), and group
 * collective attendance so group info is available offline.
 */

import { get, set, del } from "idb-keyval";

import type { GroupWithMeta, GroupDetail } from "./group-types";
import type { Profile } from "./profile-types";

// ── Types ──────────────────────────────────────────────────

interface CachedGroups {
  groups: GroupWithMeta[];
  cachedAt: number;
}

interface CachedGroupDetail {
  detail: GroupDetail;
  attendance: Record<string, Profile[]>;
  cachedAt: number;
}

// ── Keys ───────────────────────────────────────────────────

const GROUPS_LIST_KEY = "migrilla:groups-list";
const GROUP_DETAIL_PREFIX = "migrilla:group-detail:";

// ── Groups list cache ──────────────────────────────────────

/**
 * Save the user's groups list to IndexedDB.
 */
export async function cacheGroupsList(groups: GroupWithMeta[]): Promise<void> {
  try {
    const data: CachedGroups = {
      groups,
      cachedAt: Date.now(),
    };
    await set(GROUPS_LIST_KEY, data);
  } catch (error) {
    console.error("[groups-offline-store] Failed to cache groups list:", error);
  }
}

/**
 * Read the cached groups list from IndexedDB.
 */
export async function getCachedGroupsList(): Promise<CachedGroups | null> {
  try {
    const data = await get<CachedGroups>(GROUPS_LIST_KEY);
    return data ?? null;
  } catch (error) {
    console.error("[groups-offline-store] Failed to read cached groups:", error);
    return null;
  }
}

/**
 * Check if we have any cached groups.
 */
export async function hasGroupsCache(): Promise<boolean> {
  try {
    const data = await get<CachedGroups>(GROUPS_LIST_KEY);
    return data != null && data.groups.length > 0;
  } catch {
    return false;
  }
}

// ── Group detail cache ─────────────────────────────────────

/**
 * Save a group's detail (members) + collective attendance to IndexedDB.
 */
export async function cacheGroupDetail(
  groupId: string,
  detail: GroupDetail,
  attendance: Record<string, Profile[]>,
): Promise<void> {
  try {
    const data: CachedGroupDetail = {
      detail,
      attendance,
      cachedAt: Date.now(),
    };
    await set(`${GROUP_DETAIL_PREFIX}${groupId}`, data);
  } catch (error) {
    console.error("[groups-offline-store] Failed to cache group detail:", error);
  }
}

/**
 * Read a cached group detail from IndexedDB.
 */
export async function getCachedGroupDetail(
  groupId: string,
): Promise<CachedGroupDetail | null> {
  try {
    const data = await get<CachedGroupDetail>(
      `${GROUP_DETAIL_PREFIX}${groupId}`,
    );
    return data ?? null;
  } catch (error) {
    console.error("[groups-offline-store] Failed to read cached group detail:", error);
    return null;
  }
}

// ── Cleanup ────────────────────────────────────────────────

/**
 * Clear all cached groups data (e.g., on logout).
 */
export async function clearCachedGroups(): Promise<void> {
  try {
    await del(GROUPS_LIST_KEY);
    // Note: individual group details remain in IDB.
    // A full cleanup would require listing all keys with the prefix,
    // which idb-keyval doesn't support directly. For now, they'll be
    // overwritten on next cache or ignored.
  } catch (error) {
    console.error("[groups-offline-store] Failed to clear cached groups:", error);
  }
}
