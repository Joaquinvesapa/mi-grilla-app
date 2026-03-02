import { Suspense } from "react";
import type { GroupWithMeta } from "@/lib/group-types";
import { getMyGroups } from "./actions";
import { GroupsListClient } from "./_components/groups-list-client";
import { GroupsActionButtons } from "./_components/groups-action-buttons";

// ── Page ───────────────────────────────────────────────────

export default function GruposPage() {
  return (
    <div className="flex flex-col gap-4">
      {/* Action buttons — hidden when offline */}
      <GroupsActionButtons />

      {/* Groups list */}
      <Suspense fallback={<GroupsListSkeleton />}>
        <GroupsList />
      </Suspense>
    </div>
  );
}

// ── Groups list (async server component) ───────────────────
// Wrapped in try/catch so offline SW-cached pages degrade gracefully:
// if the Supabase fetch fails, GroupsListClient loads from IndexedDB.

async function GroupsList() {
  let groups: GroupWithMeta[];
  try {
    groups = await getMyGroups();
  } catch {
    groups = [];
  }

  return <GroupsListClient groups={groups} />;
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
