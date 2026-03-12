export default function GruposLoading() {
  return (
    <div className="flex flex-col gap-4" aria-hidden="true">
      <div role="status" className="sr-only">
        Cargando grupos…
      </div>

      {/* Action buttons skeleton (Crear grupo + Unirse) */}
      <div className="flex gap-2">
        <div className="h-10 flex-1 rounded-2xl bg-muted/15 animate-pulse" />
        <div className="h-10 flex-1 rounded-2xl bg-muted/10 animate-pulse" />
      </div>

      {/* Group cards skeleton */}
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
    </div>
  );
}
