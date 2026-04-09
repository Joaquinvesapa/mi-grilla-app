"use client";

import { useState } from "react";
import Link from "next/link";
import type { Profile } from "@/lib/profile-types";
import { Avatar, AVATAR_SIZE } from "@/components/avatar";
import { FRIENDSHIP_RELATION, type FriendshipRelation } from "@/lib/friendship-types";
import { useDemoContext } from "@/lib/demo/demo-context";

// ── Types ──────────────────────────────────────────────────

interface DemoUserCardProps {
  profile: Profile;
}

// ── Helpers ────────────────────────────────────────────────

function computeRelation(
  profileId: string,
  demoUserId: string,
  friendships: { requester_id: string; addressee_id: string; status: string }[],
): FriendshipRelation {
  if (profileId === demoUserId) return FRIENDSHIP_RELATION.SELF;

  const friendship = friendships.find(
    (f) =>
      (f.requester_id === demoUserId && f.addressee_id === profileId) ||
      (f.addressee_id === demoUserId && f.requester_id === profileId),
  );

  if (!friendship) return FRIENDSHIP_RELATION.NONE;

  if (friendship.status === "accepted") return FRIENDSHIP_RELATION.ACCEPTED;

  if (friendship.status === "pending") {
    return friendship.requester_id === demoUserId
      ? FRIENDSHIP_RELATION.PENDING_SENT
      : FRIENDSHIP_RELATION.PENDING_RECEIVED;
  }

  return FRIENDSHIP_RELATION.NONE;
}

// ── Component ──────────────────────────────────────────────

export function DemoUserCard({ profile }: DemoUserCardProps) {
  const { demoUser, friendships, sendFriendRequest } = useDemoContext();
  const [requestSent, setRequestSent] = useState(false);

  const relation = computeRelation(profile.id, demoUser.id, friendships);

  function handleSendRequest() {
    sendFriendRequest(profile.id);
    setRequestSent(true);
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

      {/* Action area */}
      <div className="flex shrink-0 items-center gap-1.5">
        <DemoFriendshipAction
          relation={relation}
          profileId={profile.id}
          username={profile.username}
          requestSent={requestSent}
          onSendRequest={handleSendRequest}
        />
      </div>
    </div>
  );
}

// ── Friendship action button/badge ─────────────────────────

function DemoFriendshipAction({
  relation,
  profileId,
  username,
  requestSent,
  onSendRequest,
}: {
  relation: FriendshipRelation;
  profileId: string;
  username: string;
  requestSent: boolean;
  onSendRequest: () => void;
}) {
  // If request was just sent in this session, show sent state
  if (requestSent) {
    return (
      <span className="rounded-xl border border-border px-3 py-1.5 text-xs font-medium text-muted">
        Solicitud enviada
      </span>
    );
  }

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
          href={`/demo/social/amigos/${profileId}`}
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
        <span className="rounded-xl border border-border px-3 py-1.5 text-xs font-medium text-muted">
          Solicitud recibida
        </span>
      );

    case FRIENDSHIP_RELATION.NONE:
    default:
      return (
        <button
          type="button"
          onClick={onSendRequest}
          aria-label={`Agregar a ${username} como amigo`}
          className="rounded-xl bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90 active:scale-95 transition-all duration-150 touch-manipulation"
        >
          Agregar
        </button>
      );
  }
}
