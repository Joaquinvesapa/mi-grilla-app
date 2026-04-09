"use client";

// ── Demo Agenda View ────────────────────────────────────────
// Demo-mode variant of AgendaView.
// Reads attendance from DemoContext instead of server state.
// No server actions, no IDB caching, no offline hooks.

import { useState } from "react";
import type { GridDay } from "@/lib/schedule-types";
import { detectConflicts, countConflictPairs } from "@/lib/agenda-utils";
import { groupByStartTime } from "@/lib/generate-agenda-image";
import { useDemoContext } from "@/lib/demo/demo-context";
import { DayTabs } from "@/app/(app)/grilla/_components/day-tabs";
import { AgendaCard } from "@/app/(app)/agenda/_components/agenda-card";
import { AgendaEmpty } from "@/app/(app)/agenda/_components/agenda-empty";
import { DownloadAgendaButton } from "@/app/(app)/agenda/_components/download-agenda-button";

// ── Types ───────────────────────────────────────────────────

interface DemoAgendaViewProps {
  days: GridDay[];
}

// ── Component ───────────────────────────────────────────────

export function DemoAgendaView({ days }: DemoAgendaViewProps) {
  const { attendance, toggleAttendance } = useDemoContext();
  const [activeDayIndex, setActiveDayIndex] = useState(0);

  // ── Current day data ───────────────────────────────────
  const day = days[activeDayIndex];
  const attendingArtists = day.artists
    .filter((a) => attendance.has(a.id))
    .sort((a, b) => a.startMin - b.startMin);
  const conflicts = detectConflicts(attendingArtists);
  const timeGroups = groupByStartTime(attendingArtists);

  // ── Global stats ───────────────────────────────────────
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

  // ── Remove handler — delegates to context (no server action) ──
  function handleRemove(artistId: string) {
    toggleAttendance(artistId);
  }

  // ── Global empty state ─────────────────────────────────
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
