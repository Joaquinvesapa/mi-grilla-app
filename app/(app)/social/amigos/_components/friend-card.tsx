"use client";

import { useTransition } from "react";
import Link from "next/link";
import type { FriendshipWithProfile } from "@/lib/friendship-types";
import { removeFriend } from "../actions";

export function FriendCard({
  friendship,
}: {
  friendship: FriendshipWithProfile;
}) {
  const [isPending, startTransition] = useTransition();
  const { profile } = friendship;

  function handleRemove() {
    startTransition(async () => {
      await removeFriend(friendship.id);
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
        style={{ backgroundColor: profile.avatar, color: "#ffffff" }}
      >
        {profile.username.charAt(0)}
      </div>

      {/* Info */}
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-sm font-semibold text-surface-foreground">
          @{profile.username}
        </span>
        {profile.instagram && (
          <span className="truncate text-xs text-muted">
            ig: @{profile.instagram}
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex shrink-0 items-center gap-1.5">
        <Link
          href={`/social/amigos/${profile.id}`}
          className="rounded-xl bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20 transition-colors duration-150"
        >
          Comparar
        </Link>
        <button
          type="button"
          onClick={handleRemove}
          disabled={isPending}
          aria-label={`Eliminar a ${profile.username}`}
          className="flex h-8 w-8 items-center justify-center rounded-full text-muted hover:bg-accent-pink/10 hover:text-accent-pink active:scale-95 disabled:opacity-50 transition-all duration-150 touch-manipulation"
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
