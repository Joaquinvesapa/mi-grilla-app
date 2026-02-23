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
 * Tracks the browser's online/offline status via navigator.onLine
 * and the online/offline window events.
 *
 * Returns the current status + last transition direction so the UI
 * can show contextual toasts (e.g., "Volviste a tener conexión").
 */
export function useNetworkStatus(): NetworkStatus {
  const [status, setStatus] = useState<NetworkStatus>(() => ({
    isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
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
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [handleOnline, handleOffline]);

  return status;
}
