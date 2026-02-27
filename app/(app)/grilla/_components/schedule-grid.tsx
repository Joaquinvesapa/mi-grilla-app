"use client";

import { useState, useRef } from "react";
import type { GridDay } from "@/lib/schedule-types";
import { PX_PER_MINUTE } from "@/lib/schedule-utils";
import { ArtistCard } from "./artist-card";
import { TimeAxis } from "./time-axis";
import { DayTabs } from "./day-tabs";
import { SaveAttendanceButton } from "./save-attendance-button";
import { DownloadGrillaButton } from "./download-grilla-button";
import { saveAttendance, type SocialAttendee } from "../actions";

interface ScheduleGridProps {
  days: GridDay[];
  initialAttendance?: string[];
  isAuthenticated?: boolean;
  socialAttendance?: Record<string, SocialAttendee[]>;
}

export function ScheduleGrid({
  days,
  initialAttendance = [],
  isAuthenticated = false,
  socialAttendance = {},
}: ScheduleGridProps) {
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const day = days[activeDayIndex];

  // ── Attendance state ────────────────────────────────────
  const [selectedArtists, setSelectedArtists] = useState<Set<string>>(
    () => new Set(initialAttendance),
  );
  const savedArtistsRef = useRef<Set<string>>(new Set(initialAttendance));
  const [, forceUpdate] = useState(0);

  // ── Grid dimensions ─────────────────────────────────────
  const stageCount = day.stages.length;
  const totalRows = day.bounds.totalMinutes;
  const gridHeight = totalRows * PX_PER_MINUTE + 40; // 40px header row

  // ── Dirty check ─────────────────────────────────────────
  function computeIsDirty(): boolean {
    const saved = savedArtistsRef.current;
    if (selectedArtists.size !== saved.size) return true;
    for (const id of selectedArtists) {
      if (!saved.has(id)) return true;
    }
    return false;
  }

  const isDirty = computeIsDirty();

  function handleToggle(artistId: string) {
    setSelectedArtists((prev) => {
      const next = new Set(prev);
      if (next.has(artistId)) {
        next.delete(artistId);
      } else {
        next.add(artistId);
      }
      return next;
    });
  }

  async function handleSave(): Promise<{ success: boolean; error?: string }> {
    const result = await saveAttendance(Array.from(selectedArtists));
    if (result.success) {
      savedArtistsRef.current = new Set(selectedArtists);
      forceUpdate((n) => n + 1);
    }
    return result;
  }

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col gap-4">
      {/* Day selector + download */}
      <div className="flex items-center gap-2">
        <DayTabs
          days={days.map((d) => d.label)}
          activeDay={activeDayIndex}
          onDayChange={setActiveDayIndex}
        />
        <DownloadGrillaButton
          days={days}
          selectedArtists={selectedArtists}
          socialAttendance={socialAttendance}
        />
      </div>

      {/* Scrollable grid area */}
      <div className="mb-3 min-h-0 flex-1 touch-manipulation overflow-x-auto overflow-y-auto overscroll-contain rounded-lg border border-grid-border">
        <div
          className="relative grid min-w-max"
          style={{
            gridTemplateColumns: `48px repeat(${stageCount}, minmax(85px, 1fr))`,
            gridTemplateRows: `40px repeat(${totalRows}, ${PX_PER_MINUTE}px)`,
            height: gridHeight,
            backgroundColor: "var(--color-grid-bg)",
          }}
        >
          {/* ── Header row: stage names ── */}
          <div
            className="sticky left-0 top-0 z-30 flex items-center justify-center border-b border-r border-grid-border text-[10px] font-semibold uppercase tracking-widest"
            style={{
              gridColumn: 1,
              gridRow: 1,
              backgroundColor: "var(--color-grid-bg)",
              color: "var(--color-grid-time)",
            }}
          >
            HORA
          </div>

          {day.stages.map((stage, i) => (
            <div
              key={stage.name}
              className="sticky top-0 z-20 flex items-center justify-center border-b border-grid-border px-1 text-center font-display text-sm uppercase tracking-wider text-grid-text"
              style={{
                gridColumn: i + 2,
                gridRow: 1,
                backgroundColor: "var(--color-grid-bg)",
              }}
            >
              {stage.name.replace(/\s*Stage\s*$/i, "").trim()}
            </div>
          ))}

          {/* ── Horizontal grid lines every 30 min ── */}
          {Array.from(
            { length: Math.floor(totalRows / 30) + 1 },
            (_, i) => i * 30,
          ).map((offset) => (
            <div
              key={`line-${offset}`}
              className="pointer-events-none"
              style={{
                gridColumn: `1 / -1`,
                gridRowStart: offset + 2,
                gridRowEnd: offset + 3,
                borderTop: "1px solid var(--color-grid-line)",
              }}
            />
          ))}

          {/* ── Time axis labels ── */}
          <TimeAxis bounds={day.bounds} />

          {/* ── Artist cards ── */}
          {day.artists.map((artist) => (
            <ArtistCard
              key={artist.id}
              artist={artist}
              bounds={day.bounds}
              totalStages={stageCount}
              isSelected={selectedArtists.has(artist.id)}
              isSelectable={isAuthenticated}
              onToggle={handleToggle}
              socialAttendees={socialAttendance[artist.id]}
            />
          ))}
        </div>
      </div>

      {/* Floating save button — only for authenticated users with unsaved changes */}
      {isAuthenticated && (
        <SaveAttendanceButton
          isDirty={isDirty}
          selectedCount={selectedArtists.size}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
