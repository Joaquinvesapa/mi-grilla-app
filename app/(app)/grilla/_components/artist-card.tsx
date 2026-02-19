import type { GridArtist, GridBounds } from "@/lib/schedule-types";
import {
  minuteToRow,
  STAGE_COLORS,
  STAGE_BORDER_COLORS,
} from "@/lib/schedule-utils";

interface ArtistCardProps {
  artist: GridArtist;
  bounds: GridBounds;
  totalStages: number;
}

export function ArtistCard({ artist, bounds }: ArtistCardProps) {
  const rowStart = minuteToRow(artist.startMin, bounds.startMin);
  const rowEnd = minuteToRow(artist.endMin, bounds.startMin);
  const durationMin = artist.endMin - artist.startMin;

  // Column: +2 because col 1 = time axis
  const col = artist.stageIndex + 2;

  const bgColor = STAGE_COLORS[artist.stageName] ?? "rgba(255,255,255,0.08)";
  const borderColor =
    STAGE_BORDER_COLORS[artist.stageName] ?? "rgba(255,255,255,0.15)";

  return (
    <div
      className="relative flex flex-col items-center justify-center overflow-hidden rounded-sm border-l-2 px-1 text-center transition-colors hover:brightness-125"
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
        className={`font-display uppercase leading-tight tracking-wide text-white ${
          durationMin >= 45 ? "text-xs" : "text-[10px]"
        }`}
      >
        {artist.name}
      </span>

      {artist.subtitle && durationMin >= 45 && (
        <span className="text-[9px] leading-tight text-white/70">
          {artist.subtitle}
        </span>
      )}

      {durationMin >= 40 && (
        <span className="mt-0.5 text-[9px] leading-tight tabular-nums text-white/60">
          {artist.startTime} – {artist.endTime}
        </span>
      )}
    </div>
  );
}
