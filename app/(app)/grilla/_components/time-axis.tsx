import type { GridBounds } from "@/lib/schedule-types";
import { getTimeMarkers, minuteToRow } from "@/lib/schedule-utils";

interface TimeAxisProps {
  bounds: GridBounds;
}

export function TimeAxis({ bounds }: TimeAxisProps) {
  const markers = getTimeMarkers(bounds);

  return (
    <>
      {markers.map((marker, i) => {
        const row = minuteToRow(marker.minutes, bounds.startMin);
        const nextRow =
          i + 1 < markers.length
            ? minuteToRow(markers[i + 1].minutes, bounds.startMin)
            : bounds.totalMinutes + 2; // stretch last marker to end of grid

        return (
          <div
            key={marker.minutes}
            className="pointer-events-none sticky left-0 z-10 flex items-start justify-end border-r border-grid-border pr-2 font-sans text-[10px] font-medium leading-none tabular-nums"
            style={{
              gridColumn: 1,
              gridRowStart: row,
              gridRowEnd: nextRow,
              color: "var(--color-grid-time)",
              backgroundColor: "var(--color-grid-bg)",
            }}
          >
            {marker.label}
          </div>
        );
      })}
    </>
  );
}
