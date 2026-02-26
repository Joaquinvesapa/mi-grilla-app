import type { GridArtist, GridBounds } from "@/lib/schedule-types";
import {
  minuteToRow,
  STAGE_COLORS,
  STAGE_BORDER_COLORS,
  STAGE_SELECTED_COLORS,
  STAGE_SELECTED_BORDER_COLORS,
} from "@/lib/schedule-utils";
import { cn } from "@/lib/utils";
import type { SocialAttendee } from "../actions";

interface ArtistCardProps {
  artist: GridArtist;
  bounds: GridBounds;
  totalStages: number;
  isSelected?: boolean;
  isSelectable?: boolean;
  onToggle?: (artistId: string) => void;
  socialAttendees?: SocialAttendee[];
}

export function ArtistCard({
  artist,
  bounds,
  isSelected = false,
  isSelectable = false,
  onToggle,
  socialAttendees,
}: ArtistCardProps) {
  const socialCount = socialAttendees?.length ?? 0;
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
        "relative flex flex-col items-center justify-center rounded-sm border-l-2 px-1.5 py-0 text-center transition-[background-color,border-color,opacity,transform,box-shadow] duration-150",
        isSelectable ? "cursor-pointer active:scale-[0.97]" : "cursor-default",
        isSelectable && !isSelected && "hover:brightness-125",
        isSelected && "ring-1 ring-grid-text/30",
        isSelectable &&
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
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
          durationMin >= 45 ? "text-lg" : "text-sm",
        )}
      >
        {artist.name}
      </span>

      {artist.subtitle && durationMin >= 45 && (
        <span
          className={cn(
            "text-xs leading-tight font-sans",
            isSelected ? "text-white/70" : "text-grid-text-muted",
          )}
        >
          {artist.subtitle}
        </span>
      )}

      {durationMin >= 40 && (
        <span
          className={cn(
            "mt-0.5 text-xs leading-tight tabular-nums font-sans",
            isSelected ? "text-white/60" : "text-grid-text-muted",
          )}
        >
          {artist.startTime} – {artist.endTime}
        </span>
      )}

      {/* Social badge: friends/group members attending */}
      {socialCount > 0 && (
        <span
          className="absolute right-1 top-1 flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[9px] font-bold leading-none shadow-sm"
          style={{
            backgroundColor: isSelected
              ? "rgba(255,255,255,0.25)"
              : "var(--color-primary)",
            color: isSelected ? "#ffffff" : "var(--color-primary-foreground)",
          }}
          title={socialAttendees!
            .map((a) => `@${a.username}`)
            .join(", ")}
        >
          <svg
            width="8"
            height="8"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          {socialCount}
        </span>
      )}
    </button>
  );
}
