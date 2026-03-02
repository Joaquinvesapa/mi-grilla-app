"use client";

import { useNetworkStatus } from "@/lib/hooks/use-network-status";

// ── Component ──────────────────────────────────────────────

/**
 * Shows "Social" when online, "Grupos" when offline.
 * Offline mode only supports the Grupos section, so the heading
 * should reflect that — no point saying "Social" with a single section.
 */
export function SocialHeading() {
  const { isOnline } = useNetworkStatus();

  return (
    <h1 className="text-3xl font-display uppercase tracking-tight text-foreground text-center">
      {isOnline ? "Social" : "Grupos"}
    </h1>
  );
}
