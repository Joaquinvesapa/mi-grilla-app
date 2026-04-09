"use client";

// ── Demo Grupos Page ────────────────────────────────────────
// Lists the demo user's groups read from DemoContext.
// Read-only — no Crear grupo / Unirse actions.

import { useDemoContext } from "@/lib/demo/demo-context";
import { DemoGroupCard } from "./_components/demo-group-card";

// ── Component ──────────────────────────────────────────────

export default function DemoGruposPage() {
  const { groups } = useDemoContext();

  if (groups.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <span className="text-4xl" role="img" aria-label="Sin grupos">
          👥
        </span>
        <p className="text-sm text-muted">
          No pertenecés a ningún grupo todavía.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {groups.map((group) => (
        <DemoGroupCard key={group.id} group={group} />
      ))}
    </div>
  );
}
