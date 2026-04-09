"use client";

// ── Demo Group Detail Page ──────────────────────────────────
// Shows full group detail for demo mode:
// - DemoGroupHeader (name, invite code, role badge)
// - Member list with Avatar + username + role badge
// - Group agenda (shows each member attends, computed from demo data)
// Read-only — no server actions, no IDB.

import { use } from "react";
import Link from "next/link";
import { useDemoContext } from "@/lib/demo/demo-context";
import { computeGroupAttendance } from "@/lib/demo/demo-group-utils";
import { DemoGroupHeader } from "./_components/demo-group-header";
import { GroupAgenda } from "@/app/(app)/social/grupos/[groupId]/_components/group-agenda";
import { Avatar, AVATAR_SIZE } from "@/components/avatar";
import { GROUP_ROLE } from "@/lib/group-types";

// ── Props ──────────────────────────────────────────────────

interface DemoGroupDetailPageProps {
  params: Promise<{ groupId: string }>;
}

// ── Static params (GitHub Pages export) ────────────────────

export function generateStaticParams() {
  return [{ groupId: "group-001" }, { groupId: "group-002" }];
}

// ── Component ──────────────────────────────────────────────

export default function DemoGroupDetailPage({ params }: DemoGroupDetailPageProps) {
  const { groupId } = use(params);
  const { days, groupDetails, attendance, friendAttendance } = useDemoContext();

  const group = groupDetails[groupId];

  // ── Not found guard ────────────────────────────────────────
  if (!group) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <span className="text-4xl" role="img" aria-label="Sin grupo">
          👥
        </span>
        <p className="text-sm text-muted">Grupo no encontrado.</p>
        <Link
          href="/demo/social/grupos"
          className="text-xs text-primary underline underline-offset-2"
          aria-label="Volver a grupos"
        >
          Volver a Grupos
        </Link>
      </div>
    );
  }

  // ── Compute group attendance ────────────────────────────────
  // Build Record<artistId, Profile[]> — which members attend each show.
  // For each member: if their user_id is in friendAttendance, use that.
  // Otherwise fall back to the demo user's attendance Set (the demo user
  // is the only member whose data lives in the reactive Set).

  const groupAttendance = computeGroupAttendance(
    group.members,
    attendance,
    friendAttendance,
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Back link */}
      <Link
        href="/demo/social/grupos"
        className="flex w-fit items-center gap-1.5 text-xs text-muted hover:text-foreground transition-colors duration-150 touch-manipulation"
      >
        <svg
          width="14"
          height="14"
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
        Mis grupos
      </Link>

      {/* Group header: name, invite code, role badge */}
      <DemoGroupHeader group={group} />

      {/* Member list */}
      <section className="flex flex-col gap-2">
        <h3 className="pl-1 text-sm font-semibold text-foreground">
          Miembros ({group.members.length})
        </h3>
        <div className="flex flex-col gap-2">
          {group.members.map((member) => {
            const isAdmin = member.role === GROUP_ROLE.ADMIN;
            return (
              <div
                key={member.user_id}
                className="flex items-center gap-3 rounded-2xl border border-border p-3 transition-colors duration-150"
                style={{ backgroundColor: "var(--color-surface)" }}
              >
                <Avatar
                  username={member.profile.username}
                  color={member.profile.avatar}
                  src={member.profile.avatar_url}
                  size={AVATAR_SIZE.MD}
                />
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-sm font-semibold text-surface-foreground">
                    @{member.profile.username}
                  </span>
                </div>
                {isAdmin && (
                  <span
                    className="shrink-0 rounded-lg px-2 py-0.5 text-[11px] font-medium"
                    style={{
                      backgroundColor:
                        "color-mix(in srgb, var(--color-primary) 12%, transparent)",
                      color: "var(--color-primary)",
                    }}
                  >
                    Admin
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Group agenda */}
      <section className="flex flex-col gap-2">
        <h3 className="pl-1 text-sm font-semibold text-foreground">
          Agenda del grupo
        </h3>
        <GroupAgenda
          days={days}
          groupAttendance={groupAttendance}
          memberCount={group.members.length}
        />
      </section>
    </div>
  );
}
