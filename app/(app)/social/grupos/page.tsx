import { Suspense } from "react";
import Link from "next/link";
import { getMyGroups } from "./actions";
import { GroupCard } from "./_components/group-card";

// ── Page ───────────────────────────────────────────────────

export default function GruposPage() {
  return (
    <div className="flex flex-col gap-4">
      {/* Action buttons */}
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

      {/* Groups list */}
      <Suspense fallback={<GroupsListSkeleton />}>
        <GroupsList />
      </Suspense>
    </div>
  );
}

// ── Groups list (async server component) ───────────────────

async function GroupsList() {
  const groups = await getMyGroups();

  if (groups.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-12 text-center">
        <span className="text-4xl" role="img" aria-label="Grupos">
          👥
        </span>
        <p className="text-sm text-muted">
          Todavía no sos parte de ningún grupo.
        </p>
        <p className="max-w-xs text-xs text-muted">
          Creá un grupo nuevo o unite a uno con un código de invitación.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs text-muted pl-1">
        {groups.length} {groups.length === 1 ? "grupo" : "grupos"}
      </p>
      {groups.map((group) => (
        <GroupCard key={group.id} group={group} />
      ))}
    </div>
  );
}

// ── Skeleton ───────────────────────────────────────────────

function GroupsListSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 rounded-2xl border border-border p-4 animate-pulse"
          style={{ backgroundColor: "var(--color-surface)" }}
        >
          <div className="h-11 w-11 shrink-0 rounded-full bg-muted/20" />
          <div className="flex flex-1 flex-col gap-1.5">
            <div className="h-4 w-32 rounded bg-muted/20" />
            <div className="h-3 w-20 rounded bg-muted/10" />
          </div>
        </div>
      ))}
    </div>
  );
}
