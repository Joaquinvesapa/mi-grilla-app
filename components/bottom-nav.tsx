"use client";

import { useEffect, useRef, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { setNavigationPending } from "@/lib/navigation-pending";
import { useNetworkStatus } from "@/lib/hooks/use-network-status";
import { useOfflineCacheStatus } from "@/lib/hooks/use-offline-cache";

// ── Types ──────────────────────────────────────────────────

interface BottomNavProps {
  showSocial?: boolean;
}

type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
  disabled?: boolean;
  /** When true, any pathname starting with href activates this tab */
  prefixMatch?: boolean;
  /** The IDB cache key to check for offline availability */
  offlineKey?: "hasGrilla" | "hasAgenda" | "hasGrupos";
};

// ── Nav item definitions ───────────────────────────────────

const NAV_ITEMS: NavItem[] = [
  {
    href: "/home",
    label: "Home",
    disabled: true,
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    href: "/grilla",
    label: "Grilla",
    offlineKey: "hasGrilla",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    href: "/agenda",
    label: "Agenda",
    offlineKey: "hasAgenda",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    href: "/social",
    label: "Social",
    prefixMatch: true,
    offlineKey: "hasGrupos",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    href: "/perfil",
    label: "Perfil",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
];

// ── Component ──────────────────────────────────────────────

export function BottomNav({ showSocial = true }: BottomNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isOnline } = useNetworkStatus();
  const offlineCache = useOfflineCacheStatus();
  const [isPending, startTransition] = useTransition();
  const pendingHrefRef = useRef<string | null>(null);

  // ── Sync isPending → global navigation-pending store ────
  useEffect(() => {
    if (isPending) {
      setNavigationPending(true);
    } else {
      // Transition ended — clear pending state
      setNavigationPending(false);
      pendingHrefRef.current = null;
    }
  }, [isPending]);

  // ── Prefetch all enabled routes (replaces Link's prefetching) ──
  useEffect(() => {
    const enabledHrefs = NAV_ITEMS.filter((item) => {
      if (item.disabled) return false;
      if (item.href === "/social" && !showSocial) return false;
      if (!isOnline) {
        if (!offlineCache.isChecked) return false;
        if (item.offlineKey) return offlineCache[item.offlineKey];
        return false;
      }
      return true;
    }).map((item) => getHref(item, isOnline));

    for (const href of enabledHrefs) {
      router.prefetch(href);
    }
  }, [router, showSocial, isOnline, offlineCache]);

  // When offline, redirect Social tab directly to grupos (the only cached section)
  const getHref = (item: NavItem, online: boolean): string => {
    if (!online && item.href === "/social") {
      return "/social/grupos";
    }
    return item.href;
  };

  // Determine if a tab should be accessible
  const isAccessible = (item: NavItem): boolean => {
    if (item.disabled) return false;

    // When online, all non-disabled tabs are accessible
    if (isOnline) return true;

    // When offline, only tabs with cached data are accessible
    if (!offlineCache.isChecked) return false;

    if (item.offlineKey) {
      return offlineCache[item.offlineKey];
    }

    // Tabs without offline support (Home, Perfil) are not accessible offline
    return false;
  };

  // ── Navigate via transition ─────────────────────────────
  const handleNavigation = (href: string) => {
    // Skip if already on this route
    if (pathname === href) return;
    // Skip if already navigating to this route
    if (isPending && pendingHrefRef.current === href) return;

    // When offline, use full document navigation instead of client-side.
    // Client-side nav sends RSC fetch requests that may not be cached.
    // Full document nav lets the SW serve cached HTML or the /~offline fallback.
    if (!isOnline) {
      window.location.href = href;
      return;
    }

    pendingHrefRef.current = href;
    startTransition(() => {
      router.push(href);
    });
  };

  return (
    <nav
      aria-label="Navegación principal"
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50",
        "border-t",
        "flex items-stretch",
        "touch-manipulation",
      )}
      style={{
        backgroundColor: "var(--color-surface)",
        borderColor: "var(--color-border)",
        height: "calc(4rem + var(--safe-area-bottom))",
        paddingBottom: "var(--safe-area-bottom)",
      }}
    >
      {/* Screen-reader live region for navigation state */}
      <span className="sr-only" aria-live="polite" role="status">
        {isPending ? "Cargando..." : ""}
      </span>

      {NAV_ITEMS.filter((item) => {
        if (item.disabled) return false;
        if (item.href === "/social" && !showSocial) return false;
        // When offline, hide tabs without cached data entirely
        if (!isOnline) {
          if (!offlineCache.isChecked) return false;
          if (item.offlineKey) return offlineCache[item.offlineKey];
          return false; // No offline support = hide
        }
        return true;
      }).map((item) => {
        const href = getHref(item, isOnline);
        const accessible = isAccessible(item);
        const isActive = item.prefixMatch
          ? pathname.startsWith(item.href)
          : pathname === item.href;
        const isThisPending =
          isPending && pendingHrefRef.current === href;

        // When offline and the tab label is "Social", show "Grupos" instead
        const label =
          !isOnline && item.href === "/social" ? "Grupos" : item.label;

        if (!accessible) {
          return (
            <span
              key={item.href}
              aria-disabled="true"
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-1",
                "text-xs font-medium font-sans",
                "opacity-30 cursor-not-allowed",
              )}
              style={{ color: "var(--color-muted)" }}
            >
              <span className="flex items-center justify-center w-6 h-6">
                {item.icon}
              </span>
              <span>{label}</span>
            </span>
          );
        }

        return (
          <button
            key={item.href}
            type="button"
            onClick={() => handleNavigation(href)}
            aria-label={label}
            aria-current={isActive ? "page" : undefined}
            aria-busy={isThisPending ? "true" : undefined}
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-1",
              "text-xs font-medium font-sans",
              "transition-colors duration-150",
              "touch-manipulation",
              // Reset default button styles
              "bg-transparent border-none outline-none p-0",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary",
              "hover:opacity-80",
              isActive ? "text-primary" : "hover:text-primary",
            )}
            style={
              isActive
                ? { color: "var(--color-primary)" }
                : { color: "var(--color-muted)" }
            }
          >
            <span
              className={cn(
                "flex items-center justify-center w-6 h-6",
                "transition-transform duration-150",
                isActive && "scale-110",
                isThisPending && "animate-pulse",
              )}
            >
              {item.icon}
            </span>
            <span>{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
