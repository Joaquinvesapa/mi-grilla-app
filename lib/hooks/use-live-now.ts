"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";

import type { GridDay, LiveStage } from "@/lib/schedule-types";
import { computeLiveStages } from "@/lib/schedule-utils";
import {
  FESTIVAL_TIMEZONE,
  getCurrentFestivalDay,
  getCurrentFestivalMinutes,
} from "@/lib/festival-config";
import { getCachedSchedule } from "@/lib/grilla-offline-store";

// ── Types ──────────────────────────────────────────────────

interface UseLiveNowReturn {
  liveStages: LiveStage[];
  currentDay: string | null;
  isLive: boolean;
  nextShowIn: number | null;
  isLoading: boolean;
}

// ── Constants ──────────────────────────────────────────────

/** Polling interval in milliseconds (60 seconds) */
const POLL_INTERVAL_MS = 60_000;

// ── Debug time override (dev only) ────────────────────────

/**
 * Parse the `debug_time` query param as a Date in the festival timezone.
 * Only runs in development mode. Accepts ISO-like local times:
 *   ?debug_time=2026-03-13T18:30
 *   ?debug_time=2026-03-14T01:00
 *
 * Returns null if absent, invalid, or running in production.
 */
function getDebugTimeOverride(): Date | null {
  if (process.env.NODE_ENV !== "development") return null;
  if (typeof window === "undefined") return null;

  const params = new URLSearchParams(window.location.search);
  const raw = params.get("debug_time");
  if (!raw) return null;

  // Interpret the value as a local time in Buenos Aires.
  // Intl.DateTimeFormat gives us the UTC offset for the festival TZ,
  // but the simplest correct approach is to build an "instant" that
  // corresponds to the requested wall-clock in Buenos Aires.
  // We do this by formatting a probe date in the TZ and computing
  // the offset, then applying it.
  const naive = new Date(raw);
  if (Number.isNaN(naive.getTime())) return null;

  // Get the UTC offset for Buenos Aires at that approximate instant
  // by comparing UTC-interpreted time with the TZ-formatted time.
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: FESTIVAL_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  // Parse the naive date as UTC to get a stable reference
  const parts = raw.split("T");
  const [y, m, d] = (parts[0] ?? "").split("-").map(Number);
  const timeParts = (parts[1] ?? "00:00").split(":").map(Number);
  const hr = timeParts[0] ?? 0;
  const min = timeParts[1] ?? 0;

  // We want: "what UTC instant has wall-clock y-m-d hr:min in Buenos Aires?"
  // Buenos Aires is UTC-3 (no DST since 2009), so UTC = local + 3h.
  const utcDate = new Date(Date.UTC(y, m - 1, d, hr + 3, min));

  // Verify the conversion roundtrips correctly via the formatter
  const check = fmt.formatToParts(utcDate);
  const getP = (type: Intl.DateTimeFormatPartTypes): number => {
    const p = check.find((x) => x.type === type);
    return p ? Number(p.value) : 0;
  };

  if (getP("hour") !== hr || getP("minute") !== min) {
    // If roundtrip fails, log and return null
    console.warn("[debug_time] Could not resolve timezone offset for:", raw);
    return null;
  }

  console.info(
    `[debug_time] Overriding current time → ${raw} (Buenos Aires)`,
  );
  return utcDate;
}

// ── Helpers ────────────────────────────────────────────────

/**
 * Compute the empty/default state returned when the festival is not
 * active or no schedule data is available.
 */
function emptyState(isLoading: boolean): UseLiveNowReturn {
  return {
    liveStages: [],
    currentDay: null,
    isLive: false,
    nextShowIn: null,
    isLoading,
  };
}

/**
 * Given a list of stages and the current minute, determine how many
 * minutes until the next show starts. Returns null if no upcoming
 * shows exist across any stage.
 */
function computeNextShowIn(
  stages: LiveStage[],
  currentMin: number,
): number | null {
  let earliest: number | null = null;

  for (const stage of stages) {
    // Check upNext — it has the nearest upcoming artist per stage
    if (stage.upNext && stage.upNext.startMin > currentMin) {
      const delta = stage.upNext.startMin - currentMin;
      if (earliest === null || delta < earliest) {
        earliest = delta;
      }
    }
  }

  return earliest;
}

// ── Hook ───────────────────────────────────────────────────

/**
 * Tracks which artists are currently performing across all festival stages.
 *
 * Data source: if `days` prop is provided, uses it directly. Otherwise,
 * reads from IDB via `getCachedSchedule()` (offline-first).
 *
 * Recomputes every 60 seconds via polling, and immediately on tab
 * visibility change (handles the "backgrounded for hours" case).
 */
export function useLiveNow(days?: GridDay[]): UseLiveNowReturn {
  const [state, setState] = useState<UseLiveNowReturn>(() =>
    // If days prop is provided we can compute synchronously on init
    emptyState(!days),
  );

  // ── Debug time override (parsed once) ──────────────────
  // useMemo ensures we read the URL only once per mount, not every poll
  const debugNow = useMemo(() => getDebugTimeOverride(), []);

  // Keep a ref to the latest days array to avoid stale closures in
  // the interval/visibility callbacks
  const daysRef = useRef<GridDay[] | undefined>(days);
  daysRef.current = days;

  // Track IDB-loaded days separately so we can reuse them across polls
  const idbDaysRef = useRef<GridDay[] | null>(null);

  /**
   * Core computation: resolves the days source, detects the current
   * festival day, and computes live stages. Updates state.
   */
  const recompute = useCallback(async () => {
    // Resolve the days source
    let resolvedDays = daysRef.current;

    if (!resolvedDays) {
      // Try IDB cache first from the ref (avoids re-reading every poll)
      if (!idbDaysRef.current) {
        const cached = await getCachedSchedule();
        if (cached) {
          idbDaysRef.current = cached.days;
        }
      }
      resolvedDays = idbDaysRef.current ?? undefined;
    }

    // No data available at all
    if (!resolvedDays || resolvedDays.length === 0) {
      setState(emptyState(false));
      return;
    }

    // Use debug override when present (dev only), otherwise real time
    const nowOverride = debugNow ?? undefined;

    // Determine which festival day is "now"
    const dayLabel = getCurrentFestivalDay(resolvedDays, nowOverride);

    if (!dayLabel) {
      // Outside festival dates — return empty, not loading
      setState(emptyState(false));
      return;
    }

    // Find the matching GridDay
    const currentGridDay = resolvedDays.find((d) => d.label === dayLabel);
    if (!currentGridDay) {
      setState(emptyState(false));
      return;
    }

    // Get the current time in festival minutes
    const currentMin = getCurrentFestivalMinutes(nowOverride);

    // Compute live stages
    const liveStages = computeLiveStages(currentGridDay, currentMin);

    // Determine if anything is actually live right now
    const isLive = liveStages.some((s) => s.nowPlaying !== null);

    // Compute minutes until next show (only meaningful if not live)
    const nextShowIn = isLive ? null : computeNextShowIn(liveStages, currentMin);

    setState({
      liveStages,
      currentDay: dayLabel,
      isLive,
      nextShowIn,
      isLoading: false,
    });
  }, [debugNow]);

  // ── Initial load + prop changes ──────────────────────────

  useEffect(() => {
    // When the `days` prop changes, invalidate IDB cache ref so we
    // use the fresh prop instead
    if (days) {
      idbDaysRef.current = null;
    }
    recompute();
  }, [days, recompute]);

  // ── Polling + visibility listener ────────────────────────

  useEffect(() => {
    // Poll every 60 seconds
    const intervalId = setInterval(() => {
      recompute();
    }, POLL_INTERVAL_MS);

    // Recompute immediately when the tab becomes visible again
    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        recompute();
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [recompute]);

  return state;
}
