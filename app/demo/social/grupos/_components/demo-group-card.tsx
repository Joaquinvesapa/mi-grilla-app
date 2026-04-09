import Link from "next/link";
import type { DemoGroupWithMeta } from "@/lib/demo/demo-types";
import { GROUP_ROLE } from "@/lib/group-types";

// ── Props ──────────────────────────────────────────────────

interface DemoGroupCardProps {
  group: DemoGroupWithMeta;
}

// ── Component ──────────────────────────────────────────────

export function DemoGroupCard({ group }: DemoGroupCardProps) {
  const isAdmin = group.my_role === GROUP_ROLE.ADMIN;

  return (
    <Link
      href={`/demo/social/grupos/${group.id}`}
      aria-label={`Ver grupo ${group.name}`}
      className="flex items-center gap-3 rounded-2xl border border-border p-4 transition-colors duration-150 hover:border-primary/30"
      style={{ backgroundColor: "var(--color-surface)" }}
    >
      {/* Icon */}
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-lg"
        style={{
          backgroundColor: "color-mix(in srgb, var(--color-primary) 12%, transparent)",
          color: "var(--color-primary)",
        }}
      >
        👥
      </div>

      {/* Info */}
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-sm font-semibold text-surface-foreground">
          {group.name}
        </span>
        <span className="text-xs text-muted">
          {group.member_count} {group.member_count === 1 ? "miembro" : "miembros"}
        </span>
      </div>

      {/* Role badge */}
      <span
        className="shrink-0 rounded-lg px-2 py-0.5 text-[11px] font-medium"
        style={
          isAdmin
            ? {
                backgroundColor: "color-mix(in srgb, var(--color-primary) 12%, transparent)",
                color: "var(--color-primary)",
              }
            : {
                backgroundColor: "color-mix(in srgb, var(--color-muted) 12%, transparent)",
                color: "var(--color-muted)",
              }
        }
      >
        {isAdmin ? "Admin" : "Miembro"}
      </span>

      {/* Arrow */}
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="shrink-0 text-muted"
        aria-hidden="true"
      >
        <path d="M9 18l6-6-6-6" />
      </svg>
    </Link>
  );
}
