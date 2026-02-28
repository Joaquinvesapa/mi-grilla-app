"use client";

import { useState } from "react";
import type { GridDay, GridArtist } from "@/lib/schedule-types";
import type { Profile } from "@/lib/profile-types";
import { STAGE_SELECTED_COLORS } from "@/lib/schedule-utils";
import { categorizeArtists } from "@/lib/compare-utils";
import { DayTabs } from "../../../../grilla/_components/day-tabs";

// ── Types ──────────────────────────────────────────────────

const COMPARE_FILTER = {
  ALL: "all",
  COMMON: "common",
  ONLY_ME: "only_me",
  ONLY_FRIEND: "only_friend",
} as const;

type CompareFilter = (typeof COMPARE_FILTER)[keyof typeof COMPARE_FILTER];

interface CompareViewProps {
  days: GridDay[];
  myAttendance: string[];
  friendAttendance: string[];
  friendProfile: Profile;
}

// ── Component ──────────────────────────────────────────────

export function CompareView({
  days,
  myAttendance,
  friendAttendance,
  friendProfile,
}: CompareViewProps) {
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [filter, setFilter] = useState<CompareFilter>(COMPARE_FILTER.ALL);

  const mySet = new Set(myAttendance);
  const friendSet = new Set(friendAttendance);

  const day = days[activeDayIndex];

  // Categorize artists for this day
  const { common, onlyMe, onlyFriend } = categorizeArtists(
    day.artists,
    mySet,
    friendSet,
  );

  // Global stats
  const totalCommon = days.reduce(
    (acc, d) =>
      acc + d.artists.filter((a) => mySet.has(a.id) && friendSet.has(a.id)).length,
    0,
  );
  const totalMe = days.reduce(
    (acc, d) => acc + d.artists.filter((a) => mySet.has(a.id)).length,
    0,
  );
  const totalFriend = days.reduce(
    (acc, d) => acc + d.artists.filter((a) => friendSet.has(a.id)).length,
    0,
  );

  // Apply filter
  let visibleArtists: Array<{ artist: GridArtist; tag: "common" | "only_me" | "only_friend" }>;

  switch (filter) {
    case COMPARE_FILTER.COMMON:
      visibleArtists = common.map((a) => ({ artist: a, tag: "common" as const }));
      break;
    case COMPARE_FILTER.ONLY_ME:
      visibleArtists = onlyMe.map((a) => ({ artist: a, tag: "only_me" as const }));
      break;
    case COMPARE_FILTER.ONLY_FRIEND:
      visibleArtists = onlyFriend.map((a) => ({ artist: a, tag: "only_friend" as const }));
      break;
    default:
      visibleArtists = [
        ...common.map((a) => ({ artist: a, tag: "common" as const })),
        ...onlyMe.map((a) => ({ artist: a, tag: "only_me" as const })),
        ...onlyFriend.map((a) => ({ artist: a, tag: "only_friend" as const })),
      ];
  }

  visibleArtists.sort((a, b) => a.artist.startMin - b.artist.startMin);

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col gap-4">
      {/* Stats */}
      <div className="flex shrink-0 flex-wrap items-center gap-2">
        <StatBadge label="En común" count={totalCommon} color="var(--color-primary)" />
        <StatBadge label="Vos" count={totalMe} color="var(--color-accent-green)" />
        <StatBadge
          label={`@${friendProfile.username}`}
          count={totalFriend}
          color={friendProfile.avatar}
        />
      </div>

      {/* Day tabs */}
      <DayTabs
        days={days.map((d) => d.label)}
        activeDay={activeDayIndex}
        onDayChange={setActiveDayIndex}
      />

      {/* Filter chips */}
      <div className="flex shrink-0 flex-wrap gap-1.5">
        {(
          [
            { key: COMPARE_FILTER.ALL, label: `Todos (${common.length + onlyMe.length + onlyFriend.length})` },
            { key: COMPARE_FILTER.COMMON, label: `En común (${common.length})` },
            { key: COMPARE_FILTER.ONLY_ME, label: `Solo vos (${onlyMe.length})` },
            { key: COMPARE_FILTER.ONLY_FRIEND, label: `Solo @${friendProfile.username} (${onlyFriend.length})` },
          ] as const
        ).map((chip) => (
          <button
            key={chip.key}
            type="button"
            onClick={() => setFilter(chip.key)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-all duration-150 touch-manipulation ${
              filter === chip.key
                ? "bg-primary text-primary-foreground"
                : "border border-border text-muted hover:text-foreground"
            }`}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Artist list */}
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-4">
        {visibleArtists.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12 text-center">
            <span className="text-3xl" role="img" aria-label="Sin shows">
              🎵
            </span>
            <p className="text-sm text-muted">
              No hay shows en esta categoría para {day.label}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {visibleArtists.map(({ artist, tag }) => (
              <CompareCard
                key={artist.id}
                artist={artist}
                tag={tag}
                friendUsername={friendProfile.username}
                friendAvatar={friendProfile.avatar}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Stat badge ─────────────────────────────────────────────

function StatBadge({
  label,
  count,
  color,
}: {
  label: string;
  count: number;
  color: string;
}) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium tabular-nums"
      style={{
        backgroundColor: `color-mix(in srgb, ${color} 12%, transparent)`,
        color,
      }}
    >
      {count} {label}
    </span>
  );
}

// ── Compare card ───────────────────────────────────────────

function CompareCard({
  artist,
  tag,
  friendUsername,
  friendAvatar,
}: {
  artist: GridArtist;
  tag: "common" | "only_me" | "only_friend";
  friendUsername: string;
  friendAvatar: string;
}) {
  const stageColor =
    STAGE_SELECTED_COLORS[artist.stageName] ?? "var(--color-primary)";

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
        <h3 className="truncate font-display text-sm uppercase tracking-wide text-surface-foreground">
          {artist.name}
        </h3>
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

      {/* Tag */}
      <CompareTag tag={tag} friendUsername={friendUsername} friendAvatar={friendAvatar} />
    </div>
  );
}

// ── Tag indicator ──────────────────────────────────────────

function CompareTag({
  tag,
  friendUsername,
  friendAvatar,
}: {
  tag: "common" | "only_me" | "only_friend";
  friendUsername: string;
  friendAvatar: string;
}) {
  switch (tag) {
    case "common":
      return (
        <span className="shrink-0 rounded-lg bg-primary/10 px-2 py-1 text-[11px] font-medium text-primary">
          Ambos
        </span>
      );
    case "only_me":
      return (
        <span className="shrink-0 rounded-lg bg-foreground/5 px-2 py-1 text-[11px] font-medium text-muted">
          Solo vos
        </span>
      );
    case "only_friend":
      return (
        <span
          className="shrink-0 rounded-lg px-2 py-1 text-[11px] font-medium"
          style={{
            backgroundColor: `color-mix(in srgb, ${friendAvatar} 12%, transparent)`,
            color: friendAvatar,
          }}
        >
          @{friendUsername}
        </span>
      );
  }
}
