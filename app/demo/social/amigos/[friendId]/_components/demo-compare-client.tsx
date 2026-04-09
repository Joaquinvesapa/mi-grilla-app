"use client";

// ── DemoCompareClient ──────────────────────────────────────
// Client component for the friend compare page. Extracted from
// page.tsx so generateStaticParams() can coexist (server export).

import Link from "next/link";
import { useDemoContext } from "@/lib/demo/demo-context";
import { Avatar, AVATAR_SIZE } from "@/components/avatar";
import { CompareView } from "@/app/(app)/social/amigos/[friendId]/_components/compare-view";

// ── Props ──────────────────────────────────────────────────

interface DemoCompareClientProps {
  friendId: string;
}

// ── Component ──────────────────────────────────────────────

export function DemoCompareClient({ friendId }: DemoCompareClientProps) {
  const { allProfiles, attendance, days, getFriendAttendance } =
    useDemoContext();

  const friendProfile = allProfiles.find((p) => p.id === friendId);

  // ── Not found guard ───────────────────────────────────────
  if (!friendProfile) {
    return (
      <div className="flex flex-col items-center gap-2 py-12 text-center">
        <p className="text-sm text-muted">
          Usuario no encontrado.
        </p>
        <Link
          href="/demo/social/amigos"
          className="text-xs text-primary underline underline-offset-2"
          aria-label="Volver a amigos"
        >
          Volver a Amigos
        </Link>
      </div>
    );
  }

  const myAttendance = Array.from(attendance);
  const friendAttendance = getFriendAttendance(friendId);

  return (
    <div
      className="flex flex-col overflow-hidden px-4 pt-6"
      style={{ height: "var(--app-viewport-height)" }}
    >
      {/* Header */}
      <div className="flex shrink-0 items-center gap-3 pb-4">
        <Link
          href="/demo/social/amigos"
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
