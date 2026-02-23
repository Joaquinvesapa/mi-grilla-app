import { parseSchedule } from "@/lib/schedule-utils";
import type { RawSchedule } from "@/lib/schedule-types";
import { getMyAttendance, getSocialAttendance } from "../grilla/actions";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import scheduleData from "@/lollapalooza-schedule.json";
import { AgendaView } from "./_components/agenda-view";

export const metadata = {
  title: "Mi Agenda | MiGrilla",
  description: "Tu agenda personalizada del festival",
};

export default async function AgendaPage() {
  const data = scheduleData as RawSchedule;
  const days = parseSchedule(data);

  const supabase = await createServerSupabaseClient();
  const [{ data: authData }, initialAttendance, socialAttendance] =
    await Promise.all([
      supabase.auth.getUser(),
      getMyAttendance(),
      getSocialAttendance(),
    ]);

  const isAuthenticated = !!authData.user;

  return (
    <div className="flex flex-col overflow-hidden px-4 pt-6" style={{ height: "var(--app-viewport-height)" }}>
      <div className="flex shrink-0 flex-col gap-1 pb-4">
        <h1 className="font-display text-2xl uppercase tracking-wider text-foreground text-pretty">
          Mi Agenda
        </h1>
        <p className="font-sans text-sm text-muted">
          {isAuthenticated
            ? "Tu selección de shows del festival"
            : "Iniciá sesión para ver tu agenda"}
        </p>
      </div>

      <AgendaView
        days={days}
        initialAttendance={initialAttendance}
        isAuthenticated={isAuthenticated}
        socialAttendance={socialAttendance}
      />
    </div>
  );
}
