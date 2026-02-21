"use client";

import { useState } from "react";
import type { GridDay, GridArtist } from "@/lib/schedule-types";
import type { Profile } from "@/lib/profile-types";
import { Avatar, AVATAR_SIZE } from "@/components/avatar";
import { STAGE_SELECTED_COLORS } from "@/lib/schedule-utils";
import { DayTabs } from "../../../../grilla/_components/day-tabs";

interface GroupAgendaProps {
  days: GridDay[];
  /** Map of artistId → profiles of members attending */
  groupAttendance: Record<string, Profile[]>;
  memberCount: number;
}

export function GroupAgenda({
  days,
  groupAttendance,
  memberCount,
}: GroupAgendaProps) {
  const [activeDayIndex, setActiveDayIndex] = useState(0);

  const day = days[activeDayIndex];

  // Artists that at least one member is attending, sorted by time
  const attendedArtists = day.artists
    .filter((a) => groupAttendance[a.id] && groupAttendance[a.id].length > 0)
    .sort((a, b) => a.startMin - b.startMin);

  // Global stats
  const totalUniqueArtists = new Set(Object.keys(groupAttendance)).size;

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col gap-4">
      {/* Stats */}
      <div className="flex shrink-0 flex-wrap items-center gap-2">
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium tabular-nums"
          style={{
            backgroundColor: "color-mix(in srgb, var(--color-primary) 12%, transparent)",
            color: "var(--color-primary)",
          }}
        >
          {totalUniqueArtists} shows entre {memberCount} miembros
        </span>
      </div>

      {/* Day tabs */}
      <DayTabs
        days={days.map((d) => d.label)}
        activeDay={activeDayIndex}
        onDayChange={setActiveDayIndex}
      />

      {/* Artist list */}
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-4">
        {attendedArtists.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12 text-center">
            <span className="text-3xl" role="img" aria-label="Sin shows">
              🎵
            </span>
            <p className="text-sm text-muted">
              Nadie del grupo marcó shows para {day.label}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {attendedArtists.map((artist) => (
              <GroupArtistCard
                key={artist.id}
                artist={artist}
                attendees={groupAttendance[artist.id] ?? []}
                memberCount={memberCount}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Group artist card ──────────────────────────────────────

function GroupArtistCard({
  artist,
  attendees,
  memberCount,
}: {
  artist: GridArtist;
  attendees: Profile[];
  memberCount: number;
}) {
  const stageColor =
    STAGE_SELECTED_COLORS[artist.stageName] ?? "var(--color-primary)";

  const allGoing = attendees.length === memberCount;

  return (
    <div
      className="relative flex items-start gap-3 rounded-xl border border-border border-l-[3px] p-3 transition-colors duration-150"
      style={{
        borderLeftColor: stageColor,
        backgroundColor: "var(--color-surface)",
      }}
    >
      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="truncate font-display text-sm uppercase tracking-wide text-surface-foreground">
            {artist.name}
          </h3>
          {allGoing && (
            <span className="shrink-0 rounded-lg bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary">
              TODOS
            </span>
          )}
        </div>
        <div className="mt-0.5 flex items-center gap-2 text-xs text-muted">
          <span className="inline-flex items-center gap-1">
            <span
              className="inline-block h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: stageColor }}
              aria-hidden="true"
            />
            {artist.stageName}
          </span>
          <span aria-hidden="true" className="text-border">/</span>
          <span className="tabular-nums">
            {artist.startTime}&ndash;{artist.endTime}
          </span>
        </div>
      </div>

      {/* Attendee avatars (stacked) */}
      <div className="flex shrink-0 items-center">
        <div className="flex -space-x-2">
          {attendees.slice(0, 5).map((profile) => (
            <Avatar
              key={profile.id}
              username={profile.username}
              color={profile.avatar}
              src={profile.avatar_url}
              size={AVATAR_SIZE.XS}
              className="ring-2 ring-surface"
            />
          ))}
          {attendees.length > 5 && (
            <div
              className="flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-medium ring-2 ring-surface"
              style={{
                backgroundColor: "var(--color-muted)",
                color: "#ffffff",
              }}
            >
              +{attendees.length - 5}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
