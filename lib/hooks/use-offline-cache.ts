"use client";

import { useState, useEffect } from "react";

import { hasScheduleCache } from "@/lib/grilla-offline-store";
import { getCachedAttendance } from "@/lib/agenda-offline-store";
import { hasGroupsCache } from "@/lib/groups-offline-store";

// ── Types ──────────────────────────────────────────────────

interface OfflineCacheStatus {
  /** Whether we've finished checking what's cached */
  isChecked: boolean;
  /** Schedule grid data is available offline */
  hasGrilla: boolean;
  /** Agenda (attendance + schedule) data is available offline */
  hasAgenda: boolean;
  /** At least one group is cached for offline viewing */
  hasGrupos: boolean;
}

// ── Hook ───────────────────────────────────────────────────

/**
 * Checks IndexedDB to determine which sections have offline data.
 * Used by the bottom nav and offline fallback page to restrict
 * navigation to only the sections that can render without network.
 *
 * Runs once on mount and whenever the `refreshKey` changes.
 */
export function useOfflineCacheStatus(refreshKey?: number): OfflineCacheStatus {
  const [status, setStatus] = useState<OfflineCacheStatus>({
    isChecked: false,
    hasGrilla: false,
    hasAgenda: false,
    hasGrupos: false,
  });

  useEffect(() => {
    let cancelled = false;

    async function check() {
      try {
        const [grilla, attendance, grupos] = await Promise.all([
          hasScheduleCache(),
          getCachedAttendance(),
          hasGroupsCache(),
        ]);

        if (!cancelled) {
          setStatus({
            isChecked: true,
            hasGrilla: grilla,
            // Agenda needs both schedule (to render artist cards) AND attendance
            hasAgenda: grilla && attendance != null && attendance.length > 0,
            hasGrupos: grupos,
          });
        }
      } catch {
        if (!cancelled) {
          setStatus({
            isChecked: true,
            hasGrilla: false,
            hasAgenda: false,
            hasGrupos: false,
          });
        }
      }
    }

    check();

    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  return status;
}
