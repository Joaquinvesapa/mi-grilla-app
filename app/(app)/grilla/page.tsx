import { parseSchedule } from "@/lib/schedule-utils";
import type { RawSchedule } from "@/lib/schedule-types";
import { ScheduleGrid } from "./_components/schedule-grid";
import { getMyAttendance, getSocialAttendance } from "./actions";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import scheduleData from "@/lollapalooza-schedule.json";

export const metadata = {
  title: "Grilla | MiGrilla",
  description: "Grilla de horarios del Lollapalooza Argentina",
};

export default async function GrillaPage() {
  const data = scheduleData as RawSchedule;
  const days = parseSchedule(data);

  // Check auth + fetch initial attendance + social data in parallel
  const supabase = await createServerSupabaseClient();
  const [{ data: authData }, initialAttendance, socialAttendance] =
    await Promise.all([
      supabase.auth.getUser(),
      getMyAttendance(),
      getSocialAttendance(),
    ]);

  const isAuthenticated = !!authData.user;

  return (
    <div className="flex h-[calc(100dvh-4rem)] flex-col overflow-hidden px-4 pt-6">
      <div className="flex shrink-0 flex-col gap-1 pb-4">
        <h1 className="font-display text-2xl uppercase tracking-wider color-foreground text-pretty">
          {data.evento}
        </h1>
        <p className="font-sans text-sm color-muted">
          {isAuthenticated
            ? "Tocá los shows que querés ver y guardá tu agenda"
            : "Iniciá sesión para armar tu agenda"}
        </p>
      </div>

      <ScheduleGrid
        days={days}
        initialAttendance={initialAttendance}
        isAuthenticated={isAuthenticated}
        socialAttendance={socialAttendance}
      />
    </div>
  );
}
