"use client";

import { useEffect, useState } from "react";
import type { GroupWithMeta } from "@/lib/group-types";
import {
  cacheGroupsList,
  getCachedGroupsList,
} from "@/lib/groups-offline-store";
import { useNetworkStatus } from "@/lib/hooks/use-network-status";
import { GroupCard } from "./group-card";

interface GroupsListClientProps {
  groups: GroupWithMeta[];
}

/**
 * Client wrapper for the groups list that:
 * - Caches data to IndexedDB when online (for offline access)
 * - Falls back to IDB cached data when offline and server data is empty
 */
export function GroupsListClient({ groups }: GroupsListClientProps) {
  const { isOnline } = useNetworkStatus();
  const [displayGroups, setDisplayGroups] = useState<GroupWithMeta[]>(groups);
  const [isFromCache, setIsFromCache] = useState(false);

  // ── Cache groups list to IndexedDB on mount (when online) ──
  useEffect(() => {
    if (groups.length > 0) {
      cacheGroupsList(groups).catch(() => {});
      setDisplayGroups(groups);
      setIsFromCache(false);
    }
  }, [groups]);

  // ── Load from IDB cache when offline and server data is empty ──
  useEffect(() => {
    if (!isOnline && groups.length === 0) {
      getCachedGroupsList()
        .then((cached) => {
          if (cached && cached.groups.length > 0) {
            setDisplayGroups(cached.groups);
            setIsFromCache(true);
          }
        })
        .catch(() => {});
    }
  }, [isOnline, groups]);

  if (displayGroups.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-12 text-center">
        <span className="text-4xl" role="img" aria-label="Grupos">
          👥
        </span>
        <p className="text-sm text-muted">
          {!isOnline
            ? "No hay datos de grupos guardados offline."
            : "Todavía no sos parte de ningún grupo."}
        </p>
        {isOnline && (
          <p className="max-w-xs text-xs text-muted">
            Creá un grupo nuevo o unite a uno con un código de invitación.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 pl-1">
        <p className="text-xs text-muted">
          {displayGroups.length}{" "}
          {displayGroups.length === 1 ? "grupo" : "grupos"}
        </p>
        {isFromCache && (
          <span
            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium"
            style={{
              backgroundColor:
                "color-mix(in srgb, var(--color-accent-pink) 12%, transparent)",
              color: "var(--color-accent-pink)",
            }}
          >
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
            offline
          </span>
        )}
      </div>
      {displayGroups.map((group) => (
        <GroupCard key={group.id} group={group} />
      ))}
    </div>
  );
}
