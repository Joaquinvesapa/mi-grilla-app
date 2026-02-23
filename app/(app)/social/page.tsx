import { Suspense } from "react";
import { getCommunityProfiles } from "./actions";
import { SearchInput } from "./_components/search-input";
import { UserCard } from "./_components/user-card";
import { Pagination } from "./_components/pagination";

// ── Page ───────────────────────────────────────────────────

export default async function ComunidadPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q : "";
  const page = typeof params.page === "string" ? Math.max(1, Number(params.page)) : 1;

  return (
    <div className="flex flex-col gap-4">
      <Suspense>
        <SearchInput />
      </Suspense>

      <Suspense fallback={<CommunityListSkeleton />}>
        <CommunityList query={query} page={page} />
      </Suspense>
    </div>
  );
}

// ── Community list (async server component) ────────────────

async function CommunityList({
  query,
  page,
}: {
  query: string;
  page: number;
}) {
  const result = await getCommunityProfiles(query, page);

  const totalPages = Math.max(1, Math.ceil(result.total / result.pageSize));

  if (result.profiles.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-12 text-center">
        <span className="text-4xl" role="img" aria-label="Sin resultados">
          {query ? "🔍" : "👋"}
        </span>
        <p className="text-sm text-muted">
          {query
            ? `No se encontraron usuarios con "${query}"`
            : "Todavía no tenés amigos. ¡Buscá usuarios para agregar!"}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {/* Result count */}
      <p className="text-xs text-muted pl-1">
        {query
          ? `${result.total} ${result.total === 1 ? "usuario" : "usuarios"} para "${query}"`
          : `${result.total} ${result.total === 1 ? "amigo" : "amigos"}`}
      </p>

      {/* User list */}
      <div className="flex flex-col gap-2">
        {result.profiles.map((profile) => (
          <UserCard
            key={profile.id}
            profile={profile}
            relation={profile.relation}
            friendshipId={profile.friendshipId}
          />
        ))}
      </div>

      {/* Pagination */}
      <Suspense>
        <Pagination currentPage={page} totalPages={totalPages} />
      </Suspense>
    </div>
  );
}

// ── Skeleton ───────────────────────────────────────────────

function CommunityListSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 rounded-2xl border border-border p-3 animate-pulse"
          style={{ backgroundColor: "var(--color-surface)" }}
        >
          <div className="h-11 w-11 shrink-0 rounded-full bg-muted/20" />
          <div className="flex flex-1 flex-col gap-1.5">
            <div className="h-4 w-28 rounded bg-muted/20" />
            <div className="h-3 w-20 rounded bg-muted/10" />
          </div>
        </div>
      ))}
    </div>
  );
}
