"use client";

import { useTransition } from "react";
import type { GroupMemberWithProfile } from "@/lib/group-types";
import { Avatar, AVATAR_SIZE } from "@/components/avatar";
import { GROUP_ROLE } from "@/lib/group-types";
import { removeMember, leaveGroup } from "../../actions";
import { useRouter } from "next/navigation";

export function MemberList({
  members,
  myRole,
  groupId,
  currentUserId,
}: {
  members: GroupMemberWithProfile[];
  myRole: string;
  groupId: string;
  currentUserId: string;
}) {
  const isAdmin = myRole === GROUP_ROLE.ADMIN;

  return (
    <section className="flex flex-col gap-2">
      <h3 className="text-sm font-semibold text-foreground pl-1">
        Miembros ({members.length})
      </h3>

      <div className="flex flex-col gap-2">
        {members.map((member) => (
          <MemberCard
            key={member.id}
            member={member}
            isAdmin={isAdmin}
            isSelf={member.user_id === currentUserId}
            groupId={groupId}
          />
        ))}
      </div>
    </section>
  );
}

// ── Member card ────────────────────────────────────────────

function MemberCard({
  member,
  isAdmin,
  isSelf,
  groupId,
}: {
  member: GroupMemberWithProfile;
  isAdmin: boolean;
  isSelf: boolean;
  groupId: string;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { profile } = member;
  const isTargetAdmin = member.role === GROUP_ROLE.ADMIN;

  function handleRemove() {
    startTransition(async () => {
      await removeMember(groupId, member.user_id);
    });
  }

  function handleLeave() {
    if (!confirm("¿Seguro que querés abandonar el grupo?")) return;
    startTransition(async () => {
      await leaveGroup(groupId);
      router.push("/social/grupos");
    });
  }

  return (
    <div
      className="flex items-center gap-3 rounded-2xl border border-border p-3 transition-colors duration-150"
      style={{ backgroundColor: "var(--color-surface)" }}
    >
      {/* Avatar */}
      <Avatar
        username={profile.username}
        color={profile.avatar}
        src={profile.avatar_url}
        size={AVATAR_SIZE.MD}
      />

      {/* Info */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-1.5">
          <span className="truncate text-sm font-semibold text-surface-foreground">
            @{profile.username}
          </span>
          {isSelf && (
            <span className="text-[11px] text-primary font-medium">(vos)</span>
          )}
        </div>
        {isTargetAdmin && (
          <span className="text-[11px] text-muted">Admin</span>
        )}
      </div>

      {/* Actions */}
      {isSelf && !isTargetAdmin && (
        <button
          type="button"
          onClick={handleLeave}
          disabled={isPending}
          className="shrink-0 rounded-xl border border-border px-3 py-1.5 text-xs font-medium text-muted hover:text-accent-pink hover:border-accent-pink/30 disabled:opacity-50 transition-all duration-150 touch-manipulation"
        >
          Salir
        </button>
      )}

      {isAdmin && !isSelf && (
        <button
          type="button"
          onClick={handleRemove}
          disabled={isPending}
          aria-label={`Remover a ${profile.username}`}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted hover:bg-accent-pink/10 hover:text-accent-pink active:scale-95 disabled:opacity-50 transition-all duration-150 touch-manipulation"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      )}
    </div>
  );
}
