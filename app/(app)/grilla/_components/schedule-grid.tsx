"use client";

import { useState } from "react";
import type { GridDay } from "@/lib/schedule-types";
import { PX_PER_MINUTE } from "@/lib/schedule-utils";
import { ArtistCard } from "./artist-card";
import { TimeAxis } from "./time-axis";
import { DayTabs } from "./day-tabs";

interface ScheduleGridProps {
  days: GridDay[];
}

export function ScheduleGrid({ days }: ScheduleGridProps) {
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const day = days[activeDayIndex];

  const stageCount = day.stages.length;
  const totalRows = day.bounds.totalMinutes;

  /**
   * Grid layout:
   * - Column 1: time axis (56px fixed)
   * - Columns 2..N+1: one per stage (equal width, min 120px)
   * - Rows: 1 row = 1 minute of real time. Header is row 1.
   *
   * Total grid height = totalMinutes * PX_PER_MINUTE + header
   */
  const gridHeight = totalRows * PX_PER_MINUTE + 48; // 48px for header row

  return (
    <div className="flex w-full flex-col gap-4">
      {/* Day selector */}
      <DayTabs
        days={days.map((d) => d.label)}
        activeDay={activeDayIndex}
        onDayChange={setActiveDayIndex}
      />

      {/* Scrollable grid area */}
      <div className="overflow-x-auto overflow-y-auto overscroll-contain touch-manipulation rounded-lg border border-white/5">
        <div
          className="relative grid min-w-max"
          style={{
            gridTemplateColumns: `56px repeat(${stageCount}, minmax(120px, 1fr))`,
            gridTemplateRows: `48px repeat(${totalRows}, ${PX_PER_MINUTE}px)`,
            height: gridHeight,
            backgroundColor: "var(--color-grid-bg)",
          }}
        >
          {/* ── Header row: stage names ── */}
          <div
            className="sticky top-0 z-20 flex items-center justify-center border-b border-white/10 text-[10px] font-semibold uppercase tracking-widest"
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
              className="sticky top-0 z-20 flex items-center justify-center border-b border-white/10 px-2 text-center font-display text-xs uppercase tracking-wider text-white"
              style={{
                gridColumn: i + 2,
                gridRow: 1,
                backgroundColor: "var(--color-grid-bg)",
              }}
            >
              {stage.name}
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
            />
          ))}
        </div>
      </div>
    </div>
  );
}
