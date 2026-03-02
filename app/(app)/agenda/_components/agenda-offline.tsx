"use client";

import { useEffect, useState } from "react";
import type { GridDay } from "@/lib/schedule-types";
import { getCachedSchedule } from "@/lib/grilla-offline-store";
import { getCachedAttendance } from "@/lib/agenda-offline-store";
import { AgendaView } from "./agenda-view";

// ── Types ──────────────────────────────────────────────────

interface CachedAgendaData {
  days: GridDay[];
  attendance: string[];
}

// ── Component ──────────────────────────────────────────────

/**
 * Offline fallback for the agenda page.
 * Loads schedule + attendance from IndexedDB when the server
 * can't render (offline + not in SW cache).
 */
export function AgendaOffline() {
  const [data, setData] = useState<CachedAgendaData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [schedule, attendance] = await Promise.all([
          getCachedSchedule(),
          getCachedAttendance(),
        ]);

        if (schedule && attendance && attendance.length > 0) {
          setData({
            days: schedule.days,
            attendance,
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
        <p className="text-sm text-muted">Cargando agenda offline…</p>
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
          No hay datos de tu agenda guardados offline.
        </p>
        <p className="max-w-xs text-xs text-muted">
          Visitá tu agenda con conexión para guardarla localmente.
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
            Mi Agenda
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
          Estás viendo tu agenda guardada localmente
        </p>
      </div>

      <AgendaView
        days={data.days}
        initialAttendance={data.attendance}
        isAuthenticated={true}
      />
    </div>
  );
}
