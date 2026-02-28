import { redirect } from "next/navigation";
import Link from "next/link";
import { parseSchedule } from "@/lib/schedule-utils";
import { getScheduleData } from "@/lib/schedule-data";
import { getMyAttendance } from "../../../grilla/actions";
import { getFriendAttendance, getFriendProfile } from "../actions";
import { Avatar, AVATAR_SIZE } from "@/components/avatar";
import { CompareView } from "./_components/compare-view";

// ── Page ───────────────────────────────────────────────────

export default async function ComparePage({
  params,
}: {
  params: Promise<{ friendId: string }>;
}) {
  const { friendId } = await params;

  const [friendProfile, myAttendance, friendAttendance, data] = await Promise.all([
    getFriendProfile(friendId),
    getMyAttendance(),
    getFriendAttendance(friendId),
    getScheduleData(),
  ]);

  // If not friends or profile not found, go back
  if (!friendProfile) {
    redirect("/social/amigos");
  }

  const days = parseSchedule(data);

  return (
    <div className="flex flex-col overflow-hidden px-4 pt-6" style={{ height: "var(--app-viewport-height)" }}>
      {/* Header */}
      <div className="flex shrink-0 items-center gap-3 pb-4">
        <Link
          href="/social/amigos"
          className="flex h-8 w-8 items-center justify-center rounded-full text-muted hover:text-foreground hover:bg-foreground/5 transition-colors duration-150 touch-manipulation"
          aria-label="Volver a amigos"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M19 12H5" />
            <path d="M12 19l-7-7 7-7" />
          </svg>
        </Link>

        {/* Friend avatar */}
        <Avatar
          username={friendProfile.username}
          color={friendProfile.avatar}
          src={friendProfile.avatar_url}
          size={AVATAR_SIZE.SM}
        />

        <div className="flex flex-col">
          <h1 className="font-display text-lg uppercase tracking-wider text-foreground">
            Vos vs @{friendProfile.username}
          </h1>
          <p className="text-xs text-muted">Comparación de agendas</p>
        </div>
      </div>

      <CompareView
        days={days}
        myAttendance={myAttendance}
        friendAttendance={friendAttendance}
        friendProfile={friendProfile}
      />
    </div>
  );
}
