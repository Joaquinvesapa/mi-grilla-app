export default function SocialLoading() {
  return (
    <div className="flex flex-col gap-4" aria-hidden="true">
      <div role="status" className="sr-only">
        Cargando comunidad…
      </div>

      {/* Search bar skeleton */}
      <div
        className="h-12 w-full rounded-2xl border border-border animate-pulse"
        style={{ backgroundColor: "var(--color-surface)" }}
      />

      {/* User cards skeleton */}
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
    </div>
  );
}
