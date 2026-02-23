"use client";

import { useState, useEffect, useTransition } from "react";
import type { GridDay, GridArtist } from "@/lib/schedule-types";
import { DayTabs } from "../../grilla/_components/day-tabs";
import { AgendaCard } from "./agenda-card";
import { AgendaEmpty } from "./agenda-empty";
import { DownloadAgendaButton } from "./download-agenda-button";
import { removeFromAgenda } from "../actions";
import {
  cacheAttendance,
  enqueueMutation,
  getMutationQueue,
} from "@/lib/agenda-offline-store";
import { useNetworkStatus } from "@/lib/hooks/use-network-status";

import type { SocialAttendee } from "../../grilla/actions";

interface AgendaViewProps {
  days: GridDay[];
  initialAttendance: string[];
  isAuthenticated: boolean;
  socialAttendance?: Record<string, SocialAttendee[]>;
}

/* ────────────────────────────────────────────
 * Conflict detection
 * Dos shows "conflictan" si se superponen en tiempo
 * (la persona no puede estar en dos escenarios a la vez)
 * ──────────────────────────────────────────── */

function detectConflicts(artists: GridArtist[]): Map<string, string[]> {
  const conflicts = new Map<string, string[]>();

  for (let i = 0; i < artists.length; i++) {
    for (let j = i + 1; j < artists.length; j++) {
      const a = artists[i];
      const b = artists[j];

      // Overlap: A empieza antes de que B termine Y B empieza antes de que A termine
      if (a.startMin < b.endMin && b.startMin < a.endMin) {
        if (!conflicts.has(a.id)) conflicts.set(a.id, []);
        if (!conflicts.has(b.id)) conflicts.set(b.id, []);
        conflicts.get(a.id)!.push(b.name);
        conflicts.get(b.id)!.push(a.name);
      }
    }
  }

  return conflicts;
}

/** Cuenta los pares únicos de conflictos (A↔B = 1 par, no 2) */
function countConflictPairs(artists: GridArtist[]): number {
  let count = 0;
  for (let i = 0; i < artists.length; i++) {
    for (let j = i + 1; j < artists.length; j++) {
      if (
        artists[i].startMin < artists[j].endMin &&
        artists[j].startMin < artists[i].endMin
      ) {
        count++;
      }
    }
  }
  return count;
}

/* ────────────────────────────────────────────
 * Time grouping
 * Agrupa shows por horario de inicio para el timeline
 * ──────────────────────────────────────────── */

function groupByStartTime(
  artists: GridArtist[],
): Array<[string, GridArtist[]]> {
  const groups: Array<[string, GridArtist[]]> = [];
  let currentTime = "";

  for (const artist of artists) {
    if (artist.startTime !== currentTime) {
      currentTime = artist.startTime;
      groups.push([currentTime, []]);
    }
    groups[groups.length - 1][1].push(artist);
  }

  return groups;
}

export function AgendaView({
  days,
  initialAttendance,
  isAuthenticated,
  socialAttendance,
}: AgendaViewProps) {
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [attendance, setAttendance] = useState(
    () => new Set(initialAttendance),
  );
  const [, startTransition] = useTransition();
  const { isOnline } = useNetworkStatus();
  const [pendingCount, setPendingCount] = useState(0);

  // ── Cache attendance to IndexedDB on mount + when it changes ──
  useEffect(() => {
    if (isAuthenticated && initialAttendance.length > 0) {
      cacheAttendance(initialAttendance).catch(() => {});
    }
  }, [isAuthenticated, initialAttendance]);

  // ── Check for pending offline mutations on mount ──
  useEffect(() => {
    getMutationQueue()
      .then((queue) => setPendingCount(queue.length))
      .catch(() => {});
  }, []);

  // ── Current day data ──
  const day = days[activeDayIndex];
  const attendingArtists = day.artists
    .filter((a) => attendance.has(a.id))
    .sort((a, b) => a.startMin - b.startMin);
  const conflicts = detectConflicts(attendingArtists);
  const timeGroups = groupByStartTime(attendingArtists);

  // ── Global stats ──
  const totalShows = days.reduce(
    (acc, d) => acc + d.artists.filter((a) => attendance.has(a.id)).length,
    0,
  );

  const totalConflictPairs = days.reduce((acc, d) => {
    const dayArtists = d.artists
      .filter((a) => attendance.has(a.id))
      .sort((a, b) => a.startMin - b.startMin);
    return acc + countConflictPairs(dayArtists);
  }, 0);

  // ── Remove handler with optimistic update + offline support ──
  function handleRemove(artistId: string) {
    // Optimistic: remove immediately from UI
    setAttendance((prev) => {
      const next = new Set(prev);
      next.delete(artistId);
      return next;
    });

    if (!isOnline) {
      // Offline: queue the mutation for later sync
      enqueueMutation("remove", artistId)
        .then(() => {
          setPendingCount((c) => c + 1);
          // Update the cached attendance too
          cacheAttendance(
            Array.from(attendance).filter((id) => id !== artistId),
          ).catch(() => {});
        })
        .catch(() => {
          // Rollback on queue failure
          setAttendance((prev) => new Set([...prev, artistId]));
        });
      return;
    }

    // Online: persist to server, rollback on error
    startTransition(async () => {
      const result = await removeFromAgenda(artistId);
      if (result.success) {
        // Update cached copy
        cacheAttendance(
          Array.from(attendance).filter((id) => id !== artistId),
        ).catch(() => {});
      } else {
        setAttendance((prev) => new Set([...prev, artistId]));
      }
    });
  }

  // ── Auth guard ──
  if (!isAuthenticated) {
    return <AgendaEmpty type="unauthenticated" />;
  }

  // ── Global empty state ──
  if (totalShows === 0) {
    return <AgendaEmpty type="no-shows" />;
  }

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col gap-4">
      {/* ── Summary stats ── */}
      <div className="flex shrink-0 flex-wrap items-center gap-2">
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-sans text-xs font-medium tabular-nums"
          style={{
            backgroundColor: "color-mix(in srgb, var(--color-primary) 12%, transparent)",
            color: "var(--color-primary)",
          }}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M9 18V5l12-2v13" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="18" cy="16" r="3" />
          </svg>
          {totalShows} {totalShows === 1 ? "show" : "shows"}
        </span>

        {totalConflictPairs > 0 && (
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-sans text-xs font-medium tabular-nums"
            style={{
              backgroundColor: "color-mix(in srgb, var(--color-accent-pink) 12%, transparent)",
              color: "var(--color-accent-pink)",
            }}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M8 2V10M8 14V14.01" />
            </svg>
            {totalConflictPairs}{" "}
            {totalConflictPairs === 1 ? "conflicto" : "conflictos"}
          </span>
        )}

        {/* Pending offline mutations badge */}
        {pendingCount > 0 && isOnline && (
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-sans text-xs font-medium tabular-nums"
            style={{
              backgroundColor: "color-mix(in srgb, var(--color-accent-green) 12%, transparent)",
              color: "var(--color-accent-green)",
            }}
          >
            <svg
              width="12"
              height="12"
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
            {pendingCount} pendiente{pendingCount > 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* ── Day tabs + download ── */}
      <div className="flex shrink-0 items-center gap-2">
        <DayTabs
          days={days.map((d) => d.label)}
          activeDay={activeDayIndex}
          onDayChange={setActiveDayIndex}
        />
        <DownloadAgendaButton
          days={days}
          selectedArtists={attendance}
          socialAttendance={socialAttendance}
        />
      </div>

      {/* ── Timeline / Card list ── */}
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-4">
        {attendingArtists.length === 0 ? (
          <AgendaEmpty type="empty-day" dayLabel={day.label} />
        ) : (
          <div className="flex flex-col gap-5">
            {timeGroups.map(([time, artists]) => (
              <div key={time} className="flex flex-col gap-2">
                {/* Time divider */}
                <div className="flex items-center gap-3">
                  <span className="shrink-0 font-sans text-xs font-semibold tabular-nums text-muted">
                    {time}
                  </span>
                  <div
                    className="h-px flex-1"
                    style={{ backgroundColor: "var(--color-border)" }}
                  />
                </div>

                {/* Cards in this time group */}
                <div className="flex flex-col gap-2">
                  {artists.map((artist) => (
                    <AgendaCard
                      key={artist.id}
                      artist={artist}
                      conflicts={conflicts.get(artist.id) ?? []}
                      onRemove={handleRemove}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
