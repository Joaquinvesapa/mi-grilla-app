import { parseSchedule } from "@/lib/schedule-utils";
import type { RawSchedule } from "@/lib/schedule-types";
import { ScheduleGrid } from "./_components/schedule-grid";
import scheduleData from "@/lollapalooza-schedule.json";

export const metadata = {
  title: "Grilla | MiGrilla",
  description: "Grilla de horarios del Lollapalooza Argentina",
};

export default function GrillaPage() {
  const data = scheduleData as RawSchedule;
  const days = parseSchedule(data);

  return (
    <div className="flex flex-col gap-4 px-4 py-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-2xl uppercase tracking-wider color-foreground text-pretty">
          {data.evento}
        </h1>
        <p className="text-sm color-muted">
          Tocá un artista para agregarlo a tu agenda
        </p>
      </div>

      <ScheduleGrid days={days} />
    </div>
  );
}
