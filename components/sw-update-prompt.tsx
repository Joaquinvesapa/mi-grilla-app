"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

// ── Component ──────────────────────────────────────────────

/**
 * Detects when a new Service Worker version is available and shows
 * a prompt to the user to update the app.
 *
 * Flow:
 * 1. Listen for SW registration's "updatefound" event
 * 2. When a new SW is "installed" (waiting to activate) → show prompt
 * 3. User clicks "Actualizar" → tell waiting SW to skip_waiting
 * 4. Listen for "controllerchange" → reload the page
 */
export function SWUpdatePrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [waitingSW, setWaitingSW] = useState<ServiceWorker | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    // Listen for controller changes (new SW took over) → reload
    function handleControllerChange() {
      window.location.reload();
    }
    navigator.serviceWorker.addEventListener(
      "controllerchange",
      handleControllerChange,
    );

    // Check for updates on the existing registration
    navigator.serviceWorker.ready.then((registration) => {
      // If there's already a waiting SW (page loaded after SW was updated)
      if (registration.waiting) {
        setWaitingSW(registration.waiting);
        setShowPrompt(true);
        return;
      }

      // Listen for new SWs being installed
      registration.addEventListener("updatefound", () => {
        const newSW = registration.installing;
        if (!newSW) return;

        newSW.addEventListener("statechange", () => {
          // New SW is installed and waiting to activate
          if (
            newSW.state === "installed" &&
            navigator.serviceWorker.controller
          ) {
            setWaitingSW(newSW);
            setShowPrompt(true);
          }
        });
      });
    });

    // Periodically check for SW updates (every 60 minutes)
    const interval = setInterval(
      () => {
        navigator.serviceWorker.ready.then((registration) => {
          registration.update().catch(() => {});
        });
      },
      60 * 60 * 1000,
    );

    return () => {
      navigator.serviceWorker.removeEventListener(
        "controllerchange",
        handleControllerChange,
      );
      clearInterval(interval);
    };
  }, []);

  function handleUpdate() {
    if (!waitingSW) return;

    setUpdating(true);

    // Tell the waiting SW to activate immediately
    waitingSW.postMessage({ type: "SKIP_WAITING" });
  }

  function handleDismiss() {
    setShowPrompt(false);
  }

  if (!showPrompt) return null;

  return (
    <div
      role="alert"
      className={cn(
        "fixed bottom-20 left-4 right-4 z-50 mx-auto max-w-sm",
        "rounded-2xl border border-border bg-surface p-4 shadow-lg",
        "animate-slide-in-right",
      )}
    >
      <div className="flex flex-col gap-3">
        {/* Header */}
        <div className="flex items-center gap-2">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className="shrink-0 text-primary"
          >
            <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
            <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
            <path d="M16 16h5v5" />
          </svg>
          <p className="font-sans text-sm font-semibold text-foreground">
            Nueva versión disponible
          </p>
        </div>

        <p className="font-sans text-xs text-muted">
          Hay una actualización de MiGrilla lista para instalar.
        </p>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleUpdate}
            disabled={updating}
            className="flex-1 rounded-xl bg-primary py-2 text-sm font-semibold uppercase tracking-wide text-primary-foreground transition-opacity duration-150 hover:opacity-90 active:scale-95 disabled:opacity-50 touch-manipulation"
          >
            {updating ? "Actualizando…" : "Actualizar"}
          </button>
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Cerrar notificación de actualización"
            className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-muted transition-colors duration-150 hover:text-foreground touch-manipulation"
          >
            Luego
          </button>
        </div>
      </div>
    </div>
  );
}
