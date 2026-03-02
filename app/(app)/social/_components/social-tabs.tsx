"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useNetworkStatus } from "@/lib/hooks/use-network-status";

interface SocialTab {
  href: string;
  label: string;
  exact: boolean;
  /** If true, this tab is available offline */
  offlineAvailable?: boolean;
}

const SOCIAL_TAB_ITEMS: SocialTab[] = [
  { href: "/social", label: "Comunidad", exact: true },
  { href: "/social/amigos", label: "Amigos", exact: false },
  { href: "/social/grupos", label: "Grupos", exact: false, offlineAvailable: true },
];

export function SocialTabs() {
  const pathname = usePathname();
  const { isOnline } = useNetworkStatus();

  // When offline, only show tabs that are available offline
  const visibleTabs = isOnline
    ? SOCIAL_TAB_ITEMS
    : SOCIAL_TAB_ITEMS.filter((tab) => tab.offlineAvailable);

  // When offline there's only one tab (Grupos) — no point showing a tab bar
  if (!isOnline) return null;

  return (
    <div
      className="flex gap-1 rounded-2xl p-1"
      style={{ backgroundColor: "var(--color-surface)" }}
      role="tablist"
      aria-label="Secciones sociales"
    >
      {visibleTabs.map((tab) => {
        const isActive = tab.exact
          ? pathname === tab.href
          : pathname.startsWith(tab.href);

        return (
          <Link
            key={tab.href}
            href={tab.href}
            role="tab"
            aria-selected={isActive}
            className={cn(
              "flex-1 rounded-xl py-2 text-center text-sm font-medium transition-all duration-150",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
              isActive
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted hover:text-foreground",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
