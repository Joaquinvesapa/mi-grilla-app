"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────

interface DemoSocialTab {
  href: string;
  label: string;
  exact: boolean;
}

// ── Constants ──────────────────────────────────────────────

const DEMO_SOCIAL_TAB_ITEMS: DemoSocialTab[] = [
  { href: "/demo/social", label: "Comunidad", exact: true },
  { href: "/demo/social/amigos", label: "Amigos", exact: false },
  { href: "/demo/social/grupos", label: "Grupos", exact: false },
];

// ── Component ──────────────────────────────────────────────

export function DemoSocialTabs() {
  const pathname = usePathname();

  return (
    <div
      className="flex gap-1 rounded-2xl p-1"
      style={{ backgroundColor: "var(--color-surface)" }}
      role="tablist"
      aria-label="Secciones sociales"
    >
      {DEMO_SOCIAL_TAB_ITEMS.map((tab) => {
        const isActive = tab.exact
          ? pathname === tab.href
          : pathname.startsWith(tab.href);

        return (
          <Link
            key={tab.href}
            href={tab.href}
            role="tab"
            aria-current={isActive ? "page" : undefined}
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
