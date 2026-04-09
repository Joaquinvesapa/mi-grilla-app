"use client";

import { cn } from "@/lib/utils";

// ── Types ───────────────────────────────────────────────────

interface DemoBannerProps {
  className?: string;
}

// ── Component ───────────────────────────────────────────────

/**
 * Persistent, non-blocking banner shown at the top of all demo pages.
 * Informs the visitor that they are viewing demo data and that
 * it resets on page reload.
 *
 * Does NOT block interaction — it sits above content but flows
 * with the layout rather than using a fixed overlay.
 */
export function DemoBanner({ className }: DemoBannerProps) {
  return (
    <div
      role="status"
      aria-label="Aviso de modo demostración"
      className={cn(
        "flex items-center justify-center gap-2 px-4 py-2",
        "border-b border-[var(--color-border)]",
        "bg-[var(--color-surface)] text-[var(--color-muted)]",
        "font-sans text-xs leading-snug",
        className,
      )}
    >
      {/* Demo icon */}
      <svg
        width="13"
        height="13"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="shrink-0"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>

      <span>
        <span className="font-semibold text-[var(--color-foreground)]">
          Modo Demo
        </span>
        {" — "}
        Los datos son de ejemplo y se resetean al recargar
      </span>
    </div>
  );
}
