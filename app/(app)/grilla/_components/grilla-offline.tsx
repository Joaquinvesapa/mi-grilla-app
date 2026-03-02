"use client";

import { useEffect, useState } from "react";
import type { GridDay } from "@/lib/schedule-types";
import { getCachedSchedule } from "@/lib/grilla-offline-store";
import { getCachedAttendance } from "@/lib/agenda-offline-store";
import { ScheduleGrid } from "./schedule-grid";

// ── Types ──────────────────────────────────────────────────

interface CachedGrillaData {
  eventName: string;
  days: GridDay[];
  attendance: string[];
}

// ── Component ──────────────────────────────────────────────

/**
 * Offline fallback for the grilla page.
 * Loads schedule data + attendance from IndexedDB when the server
 * can't render (offline + not in SW cache).
 */
export function GrillaOffline() {
  const [data, setData] = useState<CachedGrillaData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [schedule, attendance] = await Promise.all([
          getCachedSchedule(),
          getCachedAttendance(),
        ]);

        if (schedule) {
          setData({
            eventName: schedule.eventName,
            days: schedule.days,
            attendance: attendance ?? [],
          });
        }
      } catch {
        // IDB failed
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <div
          className="h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"
          style={{ borderColor: "var(--color-primary)", borderTopColor: "transparent" }}
        />
        <p className="text-sm text-muted">Cargando datos offline…</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center gap-3 py-20 text-center">
        <span className="text-4xl" role="img" aria-label="Sin datos">
          📡
        </span>
        <p className="text-sm text-muted">
          No hay datos de la grilla guardados offline.
        </p>
        <p className="max-w-xs text-xs text-muted">
          Visitá la grilla con conexión para guardarla localmente.
        </p>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col overflow-hidden px-4 pt-6"
      style={{ height: "var(--app-viewport-height)" }}
    >
      <div className="flex shrink-0 flex-col gap-1 pb-4">
        <div className="flex items-center gap-2">
          <h1 className="font-display text-2xl uppercase tracking-wider text-foreground text-pretty">
            {data.eventName}
          </h1>
          <span
            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium"
            style={{
              backgroundColor: "color-mix(in srgb, var(--color-accent-pink) 12%, transparent)",
              color: "var(--color-accent-pink)",
            }}
          >
            offline
          </span>
        </div>
        <p className="font-sans text-sm text-muted">
          Estás viendo la grilla guardada localmente
        </p>
      </div>

      <ScheduleGrid
        days={data.days}
        eventName={data.eventName}
        initialAttendance={data.attendance}
        isAuthenticated={false}
      />
    </div>
  );
}
