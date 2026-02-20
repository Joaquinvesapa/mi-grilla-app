import type { GridArtist, GridBounds } from "@/lib/schedule-types";
import {
  minuteToRow,
  STAGE_COLORS,
  STAGE_BORDER_COLORS,
  STAGE_SELECTED_COLORS,
  STAGE_SELECTED_BORDER_COLORS,
} from "@/lib/schedule-utils";
import { cn } from "@/lib/utils";

interface ArtistCardProps {
  artist: GridArtist;
  bounds: GridBounds;
  totalStages: number;
  isSelected?: boolean;
  isSelectable?: boolean;
  onToggle?: (artistId: string) => void;
}

export function ArtistCard({
  artist,
  bounds,
  isSelected = false,
  isSelectable = false,
  onToggle,
}: ArtistCardProps) {
  const rowStart = minuteToRow(artist.startMin, bounds.startMin);
  const rowEnd = minuteToRow(artist.endMin, bounds.startMin);
  const durationMin = artist.endMin - artist.startMin;

  // Column: +2 because col 1 = time axis
  const col = artist.stageIndex + 2;

  const bgDefault = STAGE_COLORS[artist.stageName] ?? "rgba(255,255,255,0.08)";
  const bgSelected =
    STAGE_SELECTED_COLORS[artist.stageName] ?? "rgba(255,255,255,0.25)";

  const borderDefault =
    STAGE_BORDER_COLORS[artist.stageName] ?? "rgba(255,255,255,0.15)";
  const borderSelected =
    STAGE_SELECTED_BORDER_COLORS[artist.stageName] ?? "rgba(255,255,255,0.50)";

  const bgColor = isSelected ? bgSelected : bgDefault;
  const borderColor = isSelected ? borderSelected : borderDefault;



  function handleClick() {
    if (isSelectable && onToggle) {
      onToggle(artist.id);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!isSelectable}
      aria-pressed={isSelectable ? isSelected : undefined}
      className={cn(
        "relative flex flex-col items-center justify-center rounded-sm border-l-2 px-3 py-0 text-center transition-all duration-150",
        isSelectable ? "cursor-pointer active:scale-[0.97]" : "cursor-default",
        isSelectable && !isSelected && "hover:brightness-125",
        isSelected && "ring-1 ring-grid-text/30",
      )}
      style={{
        gridColumn: col,
        gridRowStart: rowStart,
        gridRowEnd: rowEnd,
        backgroundColor: bgColor,
        borderLeftColor: borderColor,
        minHeight: 0,
      }}
    >
      <span
        className={cn(
          "line-clamp-2 w-full font-display uppercase leading-tight tracking-normal",
          isSelected ? "text-white" : "text-grid-text",
          durationMin >= 45 ? "text-2xl" : "text-lg",
        )}
      >
        {artist.name}
      </span>

      {artist.subtitle && durationMin >= 45 && (
        <span
          className={cn(
            "text-md leading-tight",
            isSelected ? "text-white/70" : "text-grid-text-muted",
          )}
        >
          {artist.subtitle}
        </span>
      )}

      {durationMin >= 40 && (
        <span
          className={cn(
            "mt-0.5 text-md leading-tight tabular-nums",
            isSelected ? "text-white/60" : "text-grid-text-muted",
          )}
        >
          {artist.startTime} – {artist.endTime}
        </span>
      )}
    </button>
  );
}
