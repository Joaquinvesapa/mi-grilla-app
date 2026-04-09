"use client";

// ── Demo Group Header ───────────────────────────────────────
// Read-only group header for demo mode.
// Shows: name (font-display), invite code with copy, member count, role badge.
// NO rename, NO delete group — demo is read-only.

import { useState } from "react";
import type { DemoGroupDetail } from "@/lib/demo/demo-types";
import { GROUP_ROLE } from "@/lib/group-types";

// ── Props ──────────────────────────────────────────────────

interface DemoGroupHeaderProps {
  group: DemoGroupDetail;
}

// ── Component ──────────────────────────────────────────────

export function DemoGroupHeader({ group }: DemoGroupHeaderProps) {
  const [isCopied, setIsCopied] = useState(false);
  const isAdmin = group.my_role === GROUP_ROLE.ADMIN;

  async function handleCopyCode() {
    try {
      await navigator.clipboard.writeText(group.invite_code);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      // Clipboard not available
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Group name + role badge */}
      <div className="flex items-center gap-2">
        <h2 className="font-display text-xl uppercase tracking-wider text-foreground">
          {group.name}
        </h2>
        <span
          className="shrink-0 rounded-lg px-2 py-0.5 text-[11px] font-medium"
          style={
            isAdmin
              ? {
                  backgroundColor: "color-mix(in srgb, var(--color-primary) 12%, transparent)",
                  color: "var(--color-primary)",
                }
              : {
                  backgroundColor: "color-mix(in srgb, var(--color-muted) 12%, transparent)",
                  color: "var(--color-muted)",
                }
          }
        >
          {isAdmin ? "Admin" : "Miembro"}
        </span>
      </div>

      {/* Invite code + copy button */}
      <div
        className="flex items-center justify-between gap-3 rounded-2xl border border-border p-3"
        style={{ backgroundColor: "var(--color-surface)" }}
      >
        <div className="flex flex-col">
          <span className="text-[11px] text-muted uppercase tracking-wide">
            Código de invitación
          </span>
          <span className="font-mono text-lg font-bold tracking-[0.3em] text-surface-foreground">
            {isCopied ? "Copiado ✓" : group.invite_code}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Member count */}
          <span className="text-xs text-muted">
            {group.members.length} {group.members.length === 1 ? "miembro" : "miembros"}
          </span>

          {/* Copy button */}
          <button
            type="button"
            onClick={handleCopyCode}
            aria-label="Copiar código de invitación"
            className="rounded-xl border border-border px-3 py-1.5 text-xs font-medium text-muted hover:text-foreground hover:border-primary/30 active:scale-95 transition-all duration-150 touch-manipulation"
          >
            {isCopied ? "Copiado ✓" : "Copiar"}
          </button>
        </div>
      </div>
    </div>
  );
}
