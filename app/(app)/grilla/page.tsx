import { parseSchedule } from "@/lib/schedule-utils";
import { getScheduleData } from "@/lib/schedule-data";
import { ScheduleGrid } from "./_components/schedule-grid";
import { getMyAttendance, getSocialAttendance } from "./actions";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Grilla | MiGrilla",
  description: "Grilla de horarios del Lollapalooza Argentina",
};

export default async function GrillaPage() {
  // Fetch schedule from DB + auth + attendance in parallel
  const supabase = await createServerSupabaseClient();
  const [data, { data: authData }, initialAttendance, socialAttendance] =
    await Promise.all([
      getScheduleData(),
      supabase.auth.getUser(),
      getMyAttendance(),
      getSocialAttendance(),
    ]);

  const days = parseSchedule(data);

  const isAuthenticated = !!authData.user;

  return (
    <div
      className="flex flex-col overflow-hidden px-4 pt-6"
      style={{ height: "var(--app-viewport-height)" }}
    >
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
