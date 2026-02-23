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
 * IMPORTANT: We start optimistically as `isOnline: true` and only flip to
 * offline when the `offline` EVENT fires. This avoids false negatives from
 * `navigator.onLine` which is unreliable on many platforms (PWAs, VPNs,
 * certain mobile networks). The offline/online events are much more
 * trustworthy than the static property.
 */
export function useNetworkStatus(): NetworkStatus {
  const [status, setStatus] = useState<NetworkStatus>({
    isOnline: true,
    lastChanged: null,
    lastTransition: null,
  });

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
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [handleOnline, handleOffline]);

  return status;
}
