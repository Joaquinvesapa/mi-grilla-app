"use client";

// ── Demo Grilla Page ─────────────────────────────────────────
// Client component: reads schedule data from DemoContext and
// renders DemoScheduleGrid — no Supabase, no server fetch.

import { useDemoContext } from "@/lib/demo/demo-context";
import { DemoScheduleGrid } from "./_components/demo-schedule-grid";

// ── Component ────────────────────────────────────────────────

export default function DemoGrillaPage() {
  const { days, eventName, demoCurrentMin, demoDayLabel } = useDemoContext();

  return (
    <div
      className="flex flex-col overflow-hidden px-4 pt-6"
      style={{ height: "var(--app-viewport-height)" }}
    >
      <div className="flex shrink-0 flex-col gap-1 pb-4">
        <h1 className="font-display text-2xl uppercase tracking-wider text-foreground text-pretty">
          {eventName}
        </h1>
        <p className="font-sans text-sm text-muted-foreground">
          Tocá los shows que querés ver — modo demo
        </p>
      </div>

      <DemoScheduleGrid
        days={days}
        eventName={eventName}
        currentMin={demoCurrentMin}
        currentDayLabel={demoDayLabel}
      />
    </div>
  );
}
