import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { RawSchedule } from "@/lib/schedule-types";
import originalData from "@/lollapalooza-schedule.json";
import { getAdminSchedule } from "./actions";
import { ScheduleEditor } from "./_components/schedule-editor";

export const metadata = {
  title: "Admin | MiGrilla",
  description: "Panel de administración de la grilla",
};

export default async function AdminPage() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) redirect("/grilla");

  const { data: schedule, updatedAt, isFromDb } = await getAdminSchedule();

  return (
    <div className="flex min-h-screen flex-col px-4 py-6">
      <div className="flex flex-col gap-1 pb-6">
        <h1 className="font-display text-2xl uppercase tracking-wider text-foreground">
          Admin Panel
        </h1>
        <p className="text-sm text-muted">
          Editá los horarios de la grilla en vivo
        </p>
        {updatedAt && (
          <p className="text-xs text-muted">
            Última actualización:{" "}
            {new Date(updatedAt).toLocaleString("es-AR", {
              dateStyle: "short",
              timeStyle: "short",
            })}
          </p>
        )}
      </div>

      <ScheduleEditor
        schedule={schedule}
        originalSchedule={originalData as RawSchedule}
        isFromDb={isFromDb}
      />
    </div>
  );
}
