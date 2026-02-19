import type { GridBounds } from "@/lib/schedule-types";
import { getTimeMarkers, minuteToRow } from "@/lib/schedule-utils";

interface TimeAxisProps {
  bounds: GridBounds;
}

export function TimeAxis({ bounds }: TimeAxisProps) {
  const markers = getTimeMarkers(bounds);

  return (
    <>
      {markers.map((marker) => {
        const row = minuteToRow(marker.minutes, bounds.startMin);

        return (
          <div
            key={marker.minutes}
            className="pointer-events-none z-10 flex items-start justify-end pr-2 font-sans text-[10px] font-medium leading-none tabular-nums"
            style={{
              gridColumn: 1,
              gridRowStart: row,
              gridRowEnd: row + 1,
              color: "var(--color-grid-time)",
            }}
          >
            {marker.label}
          </div>
        );
      })}
    </>
  );
}
