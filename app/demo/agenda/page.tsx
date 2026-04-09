"use client";

// ── Demo Agenda Page ─────────────────────────────────────────
// Client component: reads schedule data from DemoContext and
// renders DemoAgendaView — no Supabase, no server fetch.

import { useDemoContext } from "@/lib/demo/demo-context";
import { DemoAgendaView } from "./_components/demo-agenda-view";

// ── Component ────────────────────────────────────────────────

export default function DemoAgendaPage() {
  const { days } = useDemoContext();

  return (
    <div
      className="flex flex-col overflow-hidden px-4 pt-6"
      style={{ height: "var(--app-viewport-height)" }}
    >
      <div className="flex shrink-0 flex-col gap-1 pb-4">
        <h1 className="font-display text-2xl uppercase tracking-wider text-foreground text-pretty">
          MI AGENDA
        </h1>
        <p className="font-sans text-sm text-muted">
          Tu selección de shows del festival — modo demo
        </p>
      </div>

      <DemoAgendaView days={days} />
    </div>
  );
}
