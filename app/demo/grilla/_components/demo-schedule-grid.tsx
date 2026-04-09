"use client";

// ── DemoScheduleGrid ─────────────────────────────────────────
// Demo variant of ScheduleGrid. Uses useDemoContext() for attendance
// state instead of server actions. No IDB, no save button, no auth check.

import { useState } from "react";
import type { GridDay } from "@/lib/schedule-types";
import { PX_PER_MINUTE } from "@/lib/schedule-utils";
import { ArtistCard } from "@/app/(app)/grilla/_components/artist-card";
import { TimeAxis } from "@/app/(app)/grilla/_components/time-axis";
import { DayTabs } from "@/app/(app)/grilla/_components/day-tabs";
import { DownloadGrillaButton } from "@/app/(app)/grilla/_components/download-grilla-button";
import { useDemoContext } from "@/lib/demo/demo-context";
import { useDragScroll } from "@/lib/hooks/use-drag-scroll";

// ── Types ────────────────────────────────────────────────────

interface DemoScheduleGridProps {
  days: GridDay[];
  eventName: string;
  currentMin: number;
  currentDayLabel: string;
}

// ── Component ────────────────────────────────────────────────

export function DemoScheduleGrid({
  days,
  eventName: _eventName,
  currentMin: _currentMin,
  currentDayLabel: _currentDayLabel,
}: DemoScheduleGridProps) {
  const { attendance, toggleAttendance } = useDemoContext();
  const dragRef = useDragScroll();

  const [activeDayIndex, setActiveDayIndex] = useState(0);

  const day = days[activeDayIndex];
  const stageCount = day.stages.length;
  const totalRows = day.bounds.totalMinutes;
  const gridHeight = totalRows * PX_PER_MINUTE + 40; // 40px header row

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
          selectedArtists={attendance}
        />
      </div>

      {/* Scrollable grid area */}
      <div ref={dragRef} data-scroll-container className="mb-3 min-h-0 flex-1 touch-manipulation overflow-x-auto overflow-y-auto overscroll-contain rounded-lg border border-grid-border device-frame-scroll">
        <div
          className="relative grid min-w-max"
          style={{
            gridTemplateColumns: `48px repeat(${stageCount}, minmax(85px, 1fr))`,
            gridTemplateRows: `40px repeat(${totalRows}, ${PX_PER_MINUTE}px)`,
            height: gridHeight,
            backgroundColor: "var(--color-grid-bg)",
          }}
        >
          {/* ── Header row: time corner ── */}
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

          {/* ── Header row: stage names ── */}
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
              isSelected={attendance.has(artist.id)}
              isSelectable={true}
              onToggle={toggleAttendance}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
