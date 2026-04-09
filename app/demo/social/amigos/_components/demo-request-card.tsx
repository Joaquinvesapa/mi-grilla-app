"use client";

// ── DemoRequestCard ────────────────────────────────────────
// Shows a pending friend request in demo mode.
// Aceptar → acceptFriendRequest, Rechazar → rejectFriendRequest.

import type { Profile } from "@/lib/profile-types";
import { Avatar, AVATAR_SIZE } from "@/components/avatar";
import { useDemoContext } from "@/lib/demo/demo-context";

// ── Props ──────────────────────────────────────────────────

interface DemoRequestCardProps {
  friendshipId: string;
  profile: Profile;
}

// ── Component ──────────────────────────────────────────────

export function DemoRequestCard({ friendshipId, profile }: DemoRequestCardProps) {
  const { acceptFriendRequest, rejectFriendRequest } = useDemoContext();

  function handleAccept() {
    acceptFriendRequest(friendshipId);
  }

  function handleReject() {
    rejectFriendRequest(friendshipId);
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
        size={AVATAR_SIZE.LG}
      />

      {/* Info */}
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-sm font-semibold text-surface-foreground">
          @{profile.username}
        </span>
        {profile.instagram && (
          <span className="truncate text-xs text-muted">
            ig: {profile.instagram}
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex shrink-0 items-center gap-1.5">
        <button
          type="button"
          onClick={handleAccept}
          aria-label={`Aceptar solicitud de ${profile.username}`}
          className="rounded-xl bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90 active:scale-95 transition-all duration-150 touch-manipulation"
        >
          Aceptar
        </button>
        <button
          type="button"
          onClick={handleReject}
          aria-label={`Rechazar solicitud de ${profile.username}`}
          className="flex h-8 w-8 items-center justify-center rounded-full text-muted hover:bg-accent-pink/10 hover:text-accent-pink active:scale-95 transition-all duration-150 touch-manipulation"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M4 4L12 12M12 4L4 12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
