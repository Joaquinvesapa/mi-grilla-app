import { useSyncExternalStore } from "react";

// ── Module-level store ─────────────────────────────────────

let isPending = false;
const listeners = new Set<() => void>();

function subscribe(callback: () => void): () => void {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

function getSnapshot(): boolean {
  return isPending;
}

function getServerSnapshot(): boolean {
  return false;
}

function notify(): void {
  for (const listener of listeners) {
    listener();
  }
}

// ── Public API ─────────────────────────────────────────────

/** Set global navigation pending state. Call from BottomNav transitions. */
export function setNavigationPending(pending: boolean): void {
  if (isPending === pending) return;
  isPending = pending;
  notify();
}

/** React hook — subscribes to navigation pending state via useSyncExternalStore. */
export function useNavigationPending(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
