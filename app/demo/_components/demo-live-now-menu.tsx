"use client";

import { useState, useEffect, useRef, useCallback } from "react";

import type { GridArtist, LiveStage } from "@/lib/schedule-types";
import {
  STAGE_SELECTED_COLORS,
  STAGE_BORDER_COLORS,
  minutesToDisplay,
} from "@/lib/schedule-utils";
import { useDemoContext } from "@/lib/demo/demo-context";
import { cn } from "@/lib/utils";

// ── LiveDot ────────────────────────────────────────────────

/**
 * Pulsing red dot SVG — indicates live status on the FAB.
 * Uses the `live-pulse` keyframes defined in globals.css.
 */
function LiveDot({ pulse }: { pulse: boolean }) {
  return (
    <span className="relative inline-flex h-2.5 w-2.5 shrink-0" aria-hidden="true">
      {/* Pulse ring */}
      {pulse && (
        <span
          className="absolute inset-0 rounded-full bg-red-500 animate-live-pulse"
          style={{ animation: "live-pulse 1.5s ease-in-out infinite" }}
        />
      )}
      {/* Solid dot */}
      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
    </span>
  );
}

// ── LiveFab ────────────────────────────────────────────────

interface LiveFabProps {
  isLive: boolean;
  hasStages: boolean;
  isOpen: boolean;
  onClick: () => void;
  ref?: React.Ref<HTMLButtonElement>;
}

/**
 * Pill-shaped floating action button positioned above the BottomNav.
 * Shows "EN VIVO" with a pulsing red dot when artists are performing,
 * or "PRÓXIMO" when only upcoming shows exist.
 */
function LiveFab({ isLive, hasStages, isOpen, onClick, ref }: LiveFabProps) {
  if (!hasStages) return null;

  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      aria-label="Ver artistas en vivo"
      aria-expanded={isOpen}
      className={cn(
        "fixed z-40",
        "flex items-center gap-2 rounded-full",
        "px-4 py-2.5",
        "text-xs font-display uppercase tracking-wider",
        "border shadow-lg backdrop-blur-sm",
        "transition-all duration-150",
        "touch-manipulation",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        "active:scale-95",
        isLive
          ? "text-red-500 border-red-500/30"
          : "text-muted border-border",
      )}
      style={{
        right: "1rem",
        bottom: "calc(5rem + var(--safe-area-bottom) + 1rem)",
        backgroundColor: "color-mix(in srgb, var(--color-surface) 85%, transparent)",
      }}
    >
      {isLive ? (
        <>
          <LiveDot pulse />
          <span>EN VIVO</span>
        </>
      ) : (
        <>
          <LiveDot pulse={false} />
          <span>PRÓXIMO</span>
        </>
      )}
    </button>
  );
}

// ── LiveStageCard ──────────────────────────────────────────

interface LiveStageCardProps {
  stage: LiveStage;
}

/**
 * Compact card showing a single stage's live status.
 * Left border color matches the stage's identity color.
 * Shows "Ahora" (now playing) and/or "Sigue" (up next) sections.
 */
function LiveStageCard({ stage }: LiveStageCardProps) {
  const borderColor =
    STAGE_SELECTED_COLORS[stage.stageName] ??
    STAGE_BORDER_COLORS[stage.stageName] ??
    "var(--color-primary)";

  const badgeColor =
    STAGE_SELECTED_COLORS[stage.stageName] ?? "var(--color-primary)";

  const isLiveOnStage = stage.nowPlaying !== null;

  // Don't render cards for stages with nothing to show
  if (!stage.nowPlaying && !stage.upNext) return null;

  return (
    <div
      className={cn(
        "rounded-lg border border-border border-l-[3px] p-3",
        isLiveOnStage && "animate-live-card-pulse",
      )}
      style={{
        borderLeftColor: borderColor,
        backgroundColor: "var(--color-surface)",
      }}
    >
      {/* Stage name badge */}
      <div className="mb-2 flex items-center gap-2">
        {isLiveOnStage ? (
          <LiveDot pulse />
        ) : (
          <span
            className="inline-block h-2 w-2 shrink-0 rounded-full"
            style={{ backgroundColor: badgeColor }}
            aria-hidden="true"
          />
        )}
        <span className="text-xs font-display uppercase tracking-wide text-surface-foreground">
          {stage.stageName}
        </span>
      </div>

      {/* Ahora section */}
      {stage.nowPlaying && (
        <ArtistLine label="Ahora" artist={stage.nowPlaying} showTimeRange />
      )}

      {/* Sigue section */}
      {stage.upNext && (
        <ArtistLine label="Sigue" artist={stage.upNext} showTimeRange={false} />
      )}
    </div>
  );
}

// ── ArtistLine ─────────────────────────────────────────────

interface ArtistLineProps {
  label: string;
  artist: GridArtist;
  showTimeRange: boolean;
}

/**
 * A single artist line within a LiveStageCard.
 * Shows the section label, artist name, and time info.
 */
function ArtistLine({ label, artist, showTimeRange }: ArtistLineProps) {
  return (
    <div className="flex items-baseline gap-2 py-0.5">
      <span className="shrink-0 text-[10px] font-sans font-medium uppercase tracking-wider text-muted">
        {label}
      </span>
      <span className="min-w-0 truncate font-sans text-sm font-medium text-surface-foreground">
        {artist.name}
      </span>
      <span className="ml-auto shrink-0 font-sans text-[11px] tabular-nums text-muted">
        {showTimeRange
          ? `${minutesToDisplay(artist.startMin)}–${minutesToDisplay(artist.endMin)}`
          : minutesToDisplay(artist.startMin)}
      </span>
    </div>
  );
}

// ── LiveSheet ──────────────────────────────────────────────

interface LiveSheetProps {
  isOpen: boolean;
  isLive: boolean;
  stages: LiveStage[];
  onClose: () => void;
  closeButtonRef: React.RefObject<HTMLButtonElement | null>;
}

/**
 * Bottom sheet overlay showing per-stage live status.
 * Slides up from the bottom with a semi-transparent backdrop.
 */
function LiveSheet({
  isOpen,
  isLive,
  stages,
  onClose,
  closeButtonRef,
}: LiveSheetProps) {
  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-[55] transition-opacity duration-200",
          isOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0",
        )}
        style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={isLive ? "Artistas en vivo ahora" : "Próximos artistas"}
        className={cn(
          "fixed inset-x-0 bottom-0 z-[55]",
          "flex max-h-[70vh] flex-col",
          "rounded-t-2xl border-t",
          "transition-transform duration-300 ease-out",
          isOpen ? "translate-y-0" : "translate-y-full",
        )}
        style={{
          backgroundColor: "var(--color-surface)",
          borderColor: "var(--color-border)",
        }}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b px-4 py-3" style={{ borderColor: "var(--color-border)" }}>
          <h2 className="font-display text-sm uppercase tracking-wide text-surface-foreground">
            {isLive ? "EN VIVO AHORA" : "PRÓXIMAMENTE"}
          </h2>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full",
              "text-muted transition-colors duration-150",
              "hover:bg-border/50 hover:text-surface-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
              "touch-manipulation",
            )}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M4 4L12 12M12 4L4 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-4">
          <div className="flex flex-col gap-3">
            {stages.map((stage) => (
              <LiveStageCard key={stage.stageName} stage={stage} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

// ── DemoLiveNowMenu (main export) ──────────────────────────

/**
 * Demo-mode version of LiveNowMenu.
 *
 * Key differences from LiveNowMenu:
 * - No polling (no setInterval, no visibilitychange listener)
 * - No IDB cache reading
 * - No useLiveNow() hook
 * - Reads liveStages directly from useDemoContext() — pre-computed, static
 * - isLive derived from liveStages.some(s => s.nowPlaying !== null)
 * - hasStages derived from liveStages.some(s => s.nowPlaying || s.upNext)
 *
 * All presentational JSX (LiveFab, LiveSheet, LiveStageCard, ArtistLine, LiveDot)
 * is duplicated here since the sub-components in live-now-menu.tsx are not exported.
 */
export function DemoLiveNowMenu() {
  const { liveStages } = useDemoContext();
  const [isOpen, setIsOpen] = useState(false);

  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const fabRef = useRef<HTMLButtonElement | null>(null);

  // ── Derived state (computed once from static demo data) ───

  const isLive = liveStages.some((s) => s.nowPlaying !== null);
  const hasStages = liveStages.some((s) => s.nowPlaying || s.upNext);

  // ── Open/close handlers ─────────────────────────────────

  const handleOpen = useCallback(() => {
    setIsOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    // Return focus to FAB when sheet closes
    fabRef.current?.focus();
  }, []);

  // ── Focus close button when sheet opens ─────────────────

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // ── Escape key to close sheet ───────────────────────────

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        handleClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleClose]);

  // ── Don't render if no stages to show ──────────────────

  if (!hasStages) return null;

  return (
    <>
      <LiveFab
        isLive={isLive}
        hasStages={hasStages}
        isOpen={isOpen}
        onClick={handleOpen}
        ref={fabRef}
      />
      <LiveSheet
        isOpen={isOpen}
        isLive={isLive}
        stages={liveStages}
        onClose={handleClose}
        closeButtonRef={closeButtonRef}
      />
    </>
  );
}
