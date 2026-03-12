"use client";

import { useState, useEffect, useCallback } from "react";

// ── Types ──────────────────────────────────────────────────

interface NetworkStatus {
  /** Whether the browser reports being online */
  isOnline: boolean;
  /** Timestamp of the last status change (ms since epoch) */
  lastChanged: number | null;
  /** Direction of the last transition: "went-online" | "went-offline" | null */
  lastTransition: "went-online" | "went-offline" | null;
}

// ── Hook ───────────────────────────────────────────────────

/**
 * Tracks the browser's online/offline status via window online/offline events.
 *
 * Initial state: reads `navigator.onLine` when available. While `navigator.onLine`
 * can give false positives (says online behind captive portals, VPNs, etc.),
 * when it returns `false` it's ALWAYS reliable — the device has no network at all.
 * This lets us detect "already offline at mount" which is critical for PWA
 * pages served from Service Worker cache.
 *
 * After mount, we listen to online/offline events for real-time transitions.
 */
export function useNetworkStatus(): NetworkStatus {
  const [status, setStatus] = useState<NetworkStatus>(() => ({
    // Always initialize as online to match SSR (server has no navigator).
    // The useEffect below syncs with the real navigator.onLine on mount.
    isOnline: true,
    lastChanged: null,
    lastTransition: null,
  }));

  const handleOnline = useCallback(() => {
    setStatus({
      isOnline: true,
      lastChanged: Date.now(),
      lastTransition: "went-online",
    });
  }, []);

  const handleOffline = useCallback(() => {
    setStatus({
      isOnline: false,
      lastChanged: Date.now(),
      lastTransition: "went-offline",
    });
  }, []);

  useEffect(() => {
    // Sync with actual browser state on mount (handles hydration mismatch)
    const actual = navigator.onLine;
    setStatus((prev) => {
      if (prev.isOnline !== actual) {
        return {
          isOnline: actual,
          lastChanged: Date.now(),
          lastTransition: actual ? "went-online" : "went-offline",
        };
      }
      return prev;
    });

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [handleOnline, handleOffline]);

  return status;
}
