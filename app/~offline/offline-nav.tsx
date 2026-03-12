"use client";

import { useOfflineCacheStatus } from "@/lib/hooks/use-offline-cache";

// ── Types ──────────────────────────────────────────────────

interface OfflineSection {
  href: string;
  label: string;
  description: string;
  cacheKey: "hasGrilla" | "hasAgenda" | "hasGrupos";
  icon: React.ReactNode;
}

// ── Sections ───────────────────────────────────────────────

const OFFLINE_SECTIONS: OfflineSection[] = [
  {
    href: "/grilla",
    label: "Grilla",
    description: "Horarios y escenarios del festival",
    cacheKey: "hasGrilla",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    href: "/agenda",
    label: "Mi Agenda",
    description: "Tu selección de shows",
    cacheKey: "hasAgenda",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    href: "/social/grupos",
    label: "Mis Grupos",
    description: "Qué van a ver los integrantes",
    cacheKey: "hasGrupos",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
];

// ── Component ──────────────────────────────────────────────

/**
 * Shows available offline sections based on what's cached in IndexedDB.
 * Used in the offline fallback page to guide users to cached content.
 */
export function OfflineNav() {
  const cache = useOfflineCacheStatus();

  if (!cache.isChecked) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-16 animate-pulse rounded-2xl border border-border"
            style={{ backgroundColor: "var(--color-surface)" }}
          />
        ))}
      </div>
    );
  }

  const available = OFFLINE_SECTIONS.filter((s) => cache[s.cacheKey]);

  if (available.length === 0) {
    return (
      <p className="text-sm text-muted/60">
        Tip: Instalá MiGrilla y visitá la grilla, agenda y tus grupos para
        tenerlos disponibles sin conexión.
      </p>
    );
  }

  return (
    <div className="flex w-full max-w-sm flex-col gap-2">
      <p className="text-center text-xs font-medium text-muted">
        Secciones disponibles offline:
      </p>
      {available.map((section) => (
        // Use <a> instead of <Link> for full document navigation.
        // When offline, the SW serves cached HTML for these routes.
        // <Link> would trigger an RSC fetch that fails without cache.
        <a
          key={section.href}
          href={section.href}
          className="flex items-center gap-3 rounded-2xl border border-border p-4 transition-all duration-150 hover:border-primary/30 active:scale-[0.98] touch-manipulation"
          style={{ backgroundColor: "var(--color-surface)" }}
        >
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
            style={{
              backgroundColor:
                "color-mix(in srgb, var(--color-primary) 12%, transparent)",
              color: "var(--color-primary)",
            }}
          >
            {section.icon}
          </span>
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="text-sm font-semibold text-surface-foreground">
              {section.label}
            </span>
            <span className="text-xs text-muted">{section.description}</span>
          </div>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="shrink-0 text-muted"
            aria-hidden="true"
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
        </a>
      ))}
    </div>
  );
}
