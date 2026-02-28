import { redirect } from "next/navigation";
import Link from "next/link";
import { parseSchedule } from "@/lib/schedule-utils";
import { getScheduleData } from "@/lib/schedule-data";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getGroupDetail, getGroupAttendance } from "../actions";
import { GroupHeader } from "./_components/group-header";
import { MemberList } from "./_components/member-list";
import { GroupAgenda } from "./_components/group-agenda";

export default async function GroupDetailPage({
  params,
}: {
  params: Promise<{ groupId: string }>;
}) {
  const { groupId } = await params;

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [groupDetail, groupAttendance, data] = await Promise.all([
    getGroupDetail(groupId),
    getGroupAttendance(groupId),
    getScheduleData(),
  ]);

  // Not a member or group doesn't exist
  if (!groupDetail) {
    redirect("/social/grupos");
  }

  const days = parseSchedule(data);

  return (
    <div className="flex flex-col gap-6">
      {/* Back link */}
      <Link
        href="/social/grupos"
        className="flex w-fit items-center gap-1.5 text-xs text-muted hover:text-foreground transition-colors duration-150 touch-manipulation"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M19 12H5" />
          <path d="M12 19l-7-7 7-7" />
        </svg>
        Mis grupos
      </Link>

      {/* Group header with name, code, share, admin actions */}
      <GroupHeader group={groupDetail} />

      {/* Members */}
      <MemberList
        members={groupDetail.members}
        myRole={groupDetail.my_role}
        groupId={groupDetail.id}
        currentUserId={user.id}
      />

      {/* Collective agenda */}
      <section className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold text-foreground pl-1">
          Agenda del grupo
        </h3>
        <GroupAgenda
          days={days}
          groupAttendance={groupAttendance}
          memberCount={groupDetail.members.length}
        />
      </section>
    </div>
  );
}
