"use client";

import { useTransition } from "react";
import Link from "next/link";
import type { Profile } from "@/lib/profile-types";
import { FRIENDSHIP_RELATION, type FriendshipRelation } from "@/lib/friendship-types";
import {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
} from "../amigos/actions";

interface UserCardProps {
  profile: Profile;
  relation: FriendshipRelation;
  friendshipId: string | null;
}

export function UserCard({ profile, relation, friendshipId }: UserCardProps) {
  const [isPending, startTransition] = useTransition();

  function handleSendRequest() {
    startTransition(async () => {
      await sendFriendRequest(profile.id);
    });
  }

  function handleAccept() {
    if (!friendshipId) return;
    startTransition(async () => {
      await acceptFriendRequest(friendshipId);
    });
  }

  function handleReject() {
    if (!friendshipId) return;
    startTransition(async () => {
      await rejectFriendRequest(friendshipId);
    });
  }

  return (
    <div
      className="flex items-center gap-3 rounded-2xl border border-border p-3 transition-colors duration-150"
      style={{ backgroundColor: "var(--color-surface)" }}
    >
      {/* Avatar */}
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-base font-display uppercase"
        style={{
          backgroundColor: profile.avatar,
          color: "#ffffff",
        }}
      >
        {profile.username.charAt(0)}
      </div>

      {/* Info */}
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-sm font-semibold text-surface-foreground">
          @{profile.username}
        </span>
        {profile.instagram && (
          <a
            href={`https://instagram.com/${profile.instagram}`}
            target="_blank"
            rel="noopener noreferrer"
            className="truncate text-xs text-muted hover:text-primary transition-colors duration-150"
          >
            ig: @{profile.instagram}
          </a>
        )}
      </div>

      {/* Action area */}
      <div className="flex shrink-0 items-center gap-1.5">
        <FriendshipAction
          relation={relation}
          friendshipId={friendshipId}
          profileId={profile.id}
          isPending={isPending}
          onSendRequest={handleSendRequest}
          onAccept={handleAccept}
          onReject={handleReject}
        />
      </div>
    </div>
  );
}

// ── Friendship action button/badge ─────────────────────────

function FriendshipAction({
  relation,
  friendshipId,
  profileId,
  isPending,
  onSendRequest,
  onAccept,
  onReject,
}: {
  relation: FriendshipRelation;
  friendshipId: string | null;
  profileId: string;
  isPending: boolean;
  onSendRequest: () => void;
  onAccept: () => void;
  onReject: () => void;
}) {
  switch (relation) {
    case FRIENDSHIP_RELATION.SELF:
      return (
        <span className="rounded-xl bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">
          Vos
        </span>
      );

    case FRIENDSHIP_RELATION.ACCEPTED:
      return (
        <Link
          href={`/social/amigos/${profileId}`}
          className="rounded-xl bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20 transition-colors duration-150"
        >
          Amigos
        </Link>
      );

    case FRIENDSHIP_RELATION.PENDING_SENT:
      return (
        <span className="rounded-xl border border-border px-3 py-1.5 text-xs font-medium text-muted">
          Pendiente
        </span>
      );

    case FRIENDSHIP_RELATION.PENDING_RECEIVED:
      return (
        <>
          <button
            type="button"
            onClick={onAccept}
            disabled={isPending}
            className="rounded-xl bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90 active:scale-95 disabled:opacity-50 transition-all duration-150 touch-manipulation"
          >
            {isPending ? "…" : "Aceptar"}
          </button>
          <button
            type="button"
            onClick={onReject}
            disabled={isPending}
            className="rounded-xl border border-border px-3 py-1.5 text-xs font-medium text-muted hover:text-accent-pink hover:border-accent-pink/30 active:scale-95 disabled:opacity-50 transition-all duration-150 touch-manipulation"
          >
            ✕
          </button>
        </>
      );

    case FRIENDSHIP_RELATION.NONE:
    default:
      return (
        <button
          type="button"
          onClick={onSendRequest}
          disabled={isPending}
          className="rounded-xl bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90 active:scale-95 disabled:opacity-50 transition-all duration-150 touch-manipulation"
        >
          {isPending ? "…" : "Agregar"}
        </button>
      );
  }
}
