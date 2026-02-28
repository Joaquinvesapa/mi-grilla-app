"use client";

import type { GridArtist } from "@/lib/schedule-types";
import { STAGE_SELECTED_COLORS } from "@/lib/schedule-utils";
import { formatConflictNames } from "@/lib/agenda-utils";
import { cn } from "@/lib/utils";

interface AgendaCardProps {
  artist: GridArtist;
  conflicts: string[];
  onRemove: (id: string) => void;
}

export function AgendaCard({ artist, conflicts, onRemove }: AgendaCardProps) {
  const stageColor =
    STAGE_SELECTED_COLORS[artist.stageName] ?? "var(--color-primary)";
  const hasConflict = conflicts.length > 0;

  return (
    <div
      className={cn(
        "relative flex items-start gap-3 rounded-xl border border-border border-l-[3px] p-4 shadow-sm transition-colors duration-150",
        hasConflict
          ? "ring-1 ring-accent-pink/20"
          : "",
      )}
      style={{
        borderLeftColor: stageColor,
        backgroundColor: "var(--color-surface)",
      }}
    >
      {/* Content */}
      <div className="min-w-0 flex-1">
        {/* Conflict badge */}
        {hasConflict && (
          <p className="mb-1.5 flex items-center gap-1 text-[11px] font-medium text-accent-pink">
            <svg
              width="12"
              height="12"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M8 1L9.5 6H14.5L10.5 9L12 14L8 11L4 14L5.5 9L1.5 6H6.5L8 1Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>
            Se superpone con {formatConflictNames(conflicts)}
          </p>
        )}

        {/* Artist name */}
        <h3 className="truncate font-display text-base uppercase tracking-wide text-surface-foreground">
          {artist.name}
        </h3>

        {/* Stage + time */}
        <div className="mt-1 flex items-center gap-2 text-xs text-muted">
          <span className="inline-flex items-center gap-1.5">
            <span
              className="inline-block h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: stageColor }}
              aria-hidden="true"
            />
            {artist.stageName}
          </span>

          <span aria-hidden="true" className="text-border">
            /
          </span>

          <span className="tabular-nums">
            {artist.startTime}&ndash;{artist.endTime}
          </span>
        </div>
      </div>

      {/* Remove button */}
      <button
        type="button"
        onClick={() => onRemove(artist.id)}
        aria-label={`Quitar ${artist.name} de tu agenda`}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted transition-colors duration-150 hover:bg-accent-pink/10 hover:text-accent-pink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-pink/50 active:scale-95 touch-manipulation"
      >
        <svg
          width="14"
          height="14"
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
  );
}
