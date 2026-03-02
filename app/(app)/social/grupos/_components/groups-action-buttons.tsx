"use client";

import Link from "next/link";
import { useNetworkStatus } from "@/lib/hooks/use-network-status";

/**
 * Action buttons for creating/joining groups.
 * Hidden when offline since those operations require network.
 */
export function GroupsActionButtons() {
  const { isOnline } = useNetworkStatus();

  // Don't show action buttons when offline
  if (!isOnline) return null;

  return (
    <div className="flex gap-2">
      <Link
        href="/social/grupos/nuevo"
        className="flex-1 rounded-2xl bg-primary py-3 text-center text-sm font-semibold uppercase tracking-wide text-primary-foreground hover:opacity-90 active:scale-95 transition-all duration-150 touch-manipulation"
      >
        Crear grupo
      </Link>
      <Link
        href="/social/grupos/join"
        className="flex-1 rounded-2xl border border-border py-3 text-center text-sm font-semibold uppercase tracking-wide text-surface-foreground hover:border-primary/30 hover:text-primary active:scale-95 transition-all duration-150 touch-manipulation"
        style={{ backgroundColor: "var(--color-surface)" }}
      >
        Unirse con código
      </Link>
    </div>
  );
}
