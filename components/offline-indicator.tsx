"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useNetworkStatus } from "@/lib/hooks/use-network-status";
import { syncOfflineMutations } from "@/lib/background-sync";
import { getPendingMutationCount } from "@/lib/background-sync";

// ── Constants ──────────────────────────────────────────────

/** How long to show the "back online" toast before auto-hiding (ms) */
const ONLINE_TOAST_DURATION = 4000;

/** How long to show the "syncing" toast before auto-hiding (ms) */
const SYNC_TOAST_DURATION = 3000;

// ── Component ──────────────────────────────────────────────

/**
 * Floating indicator that shows network status transitions:
 * - "Sin conexión" persistent banner when offline
 * - "Conexión restaurada" transient toast when coming back online
 * - "Sincronizando cambios…" when processing offline queue
 * - "X cambios pendientes" badge when there are unsynced mutations
 */
export function OfflineIndicator() {
  const { isOnline, lastTransition } = useNetworkStatus();
  const [showOnlineToast, setShowOnlineToast] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{
    synced: number;
    failed: number;
  } | null>(null);
  const [pendingCount, setPendingCount] = useState(0);

  // Check for pending mutations on mount
  useEffect(() => {
    getPendingMutationCount().then(setPendingCount).catch(() => {});
  }, []);

  // Handle transition to online: show toast + trigger sync
  useEffect(() => {
    if (lastTransition !== "went-online") return;

    setShowOnlineToast(true);
    const timer = setTimeout(() => setShowOnlineToast(false), ONLINE_TOAST_DURATION);

    // Auto-sync pending mutations
    setIsSyncing(true);
    syncOfflineMutations()
      .then((result) => {
        setSyncResult({ synced: result.synced, failed: result.failed });
        setPendingCount(result.failed);

        // Clear sync result after delay
        setTimeout(() => setSyncResult(null), SYNC_TOAST_DURATION);
      })
      .catch((error) => {
        console.error("[offline-indicator] Sync failed:", error);
      })
      .finally(() => {
        setIsSyncing(false);
      });

    return () => clearTimeout(timer);
  }, [lastTransition]);

  // ── Offline banner (persistent) ──
  if (!isOnline) {
    return (
      <div
        role="status"
        aria-live="assertive"
        className={cn(
          "fixed left-4 right-4 top-[calc(var(--safe-area-top)+0.5rem)] z-50 mx-auto max-w-sm",
          "flex items-center gap-2.5 rounded-xl border border-border bg-surface px-4 py-3 shadow-lg",
          "animate-slide-in-right",
        )}
      >
        {/* Wifi-off icon */}
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
          className="shrink-0 text-accent-pink"
        >
          <line x1="2" y1="2" x2="22" y2="22" />
          <path d="M8.5 16.5a5 5 0 0 1 7 0" />
          <path d="M2 8.82a15 15 0 0 1 4.17-2.65" />
          <path d="M10.66 5c4.01-.36 8.14.9 11.34 3.76" />
          <path d="M16.85 11.25a10 10 0 0 1 2.22 1.68" />
          <path d="M5 12.86a10 10 0 0 1 5.17-2.89" />
          <line x1="12" y1="20" x2="12.01" y2="20" />
        </svg>

        <div className="flex flex-col">
          <span className="font-sans text-sm font-semibold text-foreground">
            Sin conexión
          </span>
          <span className="font-sans text-xs text-muted">
            {pendingCount > 0
              ? `${pendingCount} ${pendingCount === 1 ? "cambio pendiente" : "cambios pendientes"}`
              : "Los cambios se guardarán localmente"}
          </span>
        </div>
      </div>
    );
  }

  // ── Syncing indicator ──
  if (isSyncing) {
    return (
      <div
        role="status"
        aria-live="polite"
        className={cn(
          "fixed left-4 right-4 top-[calc(var(--safe-area-top)+0.5rem)] z-50 mx-auto max-w-sm",
          "flex items-center gap-2.5 rounded-xl border border-border bg-surface px-4 py-3 shadow-lg",
          "animate-slide-in-right",
        )}
      >
        {/* Sync spinner */}
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
          className="shrink-0 animate-spin text-primary"
        >
          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>

        <span className="font-sans text-sm font-medium text-foreground">
          Sincronizando cambios…
        </span>
      </div>
    );
  }

  // ── Sync result toast ──
  if (syncResult && syncResult.synced > 0) {
    return (
      <div
        role="status"
        aria-live="polite"
        className={cn(
          "fixed left-4 right-4 top-[calc(var(--safe-area-top)+0.5rem)] z-50 mx-auto max-w-sm",
          "flex items-center gap-2.5 rounded-xl border border-border bg-surface px-4 py-3 shadow-lg",
          "animate-slide-in-right",
        )}
      >
        {/* Check icon */}
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className="shrink-0 text-accent-green"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>

        <span className="font-sans text-sm font-medium text-foreground">
          {syncResult.synced}{" "}
          {syncResult.synced === 1 ? "cambio sincronizado" : "cambios sincronizados"}
          {syncResult.failed > 0 && (
            <span className="text-accent-pink">
              {" "}
              · {syncResult.failed} fallido{syncResult.failed > 1 ? "s" : ""}
            </span>
          )}
        </span>
      </div>
    );
  }

  // ── "Back online" toast (transient) ──
  if (showOnlineToast) {
    return (
      <div
        role="status"
        aria-live="polite"
        className={cn(
          "fixed left-4 right-4 top-[calc(var(--safe-area-top)+0.5rem)] z-50 mx-auto max-w-sm",
          "flex items-center gap-2.5 rounded-xl border border-border bg-surface px-4 py-3 shadow-lg",
          "animate-slide-in-right",
        )}
      >
        {/* Wifi icon */}
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
          className="shrink-0 text-primary"
        >
          <path d="M5 12.55a11 11 0 0 1 14.08 0" />
          <path d="M1.42 9a16 16 0 0 1 21.16 0" />
          <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
          <line x1="12" y1="20" x2="12.01" y2="20" />
        </svg>

        <span className="font-sans text-sm font-medium text-foreground">
          Conexión restaurada
        </span>
      </div>
    );
  }

  return null;
}
