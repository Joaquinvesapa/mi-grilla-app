"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { GridDay } from "@/lib/schedule-types";
import type { GroupDetail } from "@/lib/group-types";
import type { Profile } from "@/lib/profile-types";
import { getCachedGroupDetail } from "@/lib/groups-offline-store";
import { getCachedSchedule } from "@/lib/grilla-offline-store";
import { GroupAgenda } from "./group-agenda";
import { Avatar, AVATAR_SIZE } from "@/components/avatar";

// ── Types ──────────────────────────────────────────────────

interface CachedData {
  detail: GroupDetail;
  attendance: Record<string, Profile[]>;
  days: GridDay[];
}

// ── Component ──────────────────────────────────────────────

/**
 * Offline-only group detail view that loads entirely from IndexedDB.
 * Used when the Server Component can't render (offline + not in SW cache).
 */
export function GroupDetailOffline({ groupId }: { groupId: string }) {
  const [data, setData] = useState<CachedData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [cached, schedule] = await Promise.all([
          getCachedGroupDetail(groupId),
          getCachedSchedule(),
        ]);

        if (cached && schedule) {
          setData({
            detail: cached.detail,
            attendance: cached.attendance,
            days: schedule.days,
          });
        }
      } catch {
        // IDB read failed — nothing to show
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [groupId]);

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-16 animate-pulse rounded-2xl border border-border"
            style={{ backgroundColor: "var(--color-surface)" }}
          />
        ))}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-center">
        <span className="text-4xl" role="img" aria-label="Sin datos">
          📡
        </span>
        <p className="text-sm text-muted">
          No hay datos guardados de este grupo.
        </p>
        <Link
          href="/social/grupos"
          className="text-xs text-primary hover:underline touch-manipulation"
        >
          Volver a mis grupos
        </Link>
      </div>
    );
  }

  const { detail, attendance, days } = data;

  return (
    <div className="flex flex-col gap-6">
      {/* Offline badge */}
      <div className="flex items-center gap-2">
        <Link
          href="/social/grupos"
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
        <span
          className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium"
          style={{
            backgroundColor:
              "color-mix(in srgb, var(--color-accent-pink) 12%, transparent)",
            color: "var(--color-accent-pink)",
          }}
        >
          offline
        </span>
      </div>

      {/* Group name */}
      <h2 className="font-display text-xl uppercase tracking-wider text-foreground">
        {detail.name}
      </h2>

      {/* Members (read-only, no actions) */}
      <section className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold text-foreground pl-1">
          Miembros ({detail.members.length})
        </h3>
        <div className="flex flex-col gap-2">
          {detail.members.map((member) => (
            <div
              key={member.id}
              className="flex items-center gap-3 rounded-2xl border border-border p-3"
              style={{ backgroundColor: "var(--color-surface)" }}
            >
              <Avatar
                username={member.profile.username}
                color={member.profile.avatar}
                src={member.profile.avatar_url}
                size={AVATAR_SIZE.MD}
              />
              <span className="truncate text-sm font-semibold text-surface-foreground">
                @{member.profile.username}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Collective agenda */}
      <section className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold text-foreground pl-1">
          Agenda del grupo
        </h3>
        <GroupAgenda
          days={days}
          groupAttendance={attendance}
          memberCount={detail.members.length}
        />
      </section>
    </div>
  );
}
