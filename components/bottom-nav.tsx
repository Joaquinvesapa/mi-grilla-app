"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

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
};

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

export function BottomNav({ showSocial = true }: BottomNavProps) {
  const pathname = usePathname();

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
      {NAV_ITEMS.filter((item) => {
        if (item.disabled) return false;
        if (item.href === "/social" && !showSocial) return false;
        return true;
      }).map((item) => {
        const isActive = item.prefixMatch
          ? pathname.startsWith(item.href)
          : pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-label={item.label}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-1",
              "text-xs font-medium font-sans",
              "transition-colors duration-150",
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
              )}
            >
              {item.icon}
            </span>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
