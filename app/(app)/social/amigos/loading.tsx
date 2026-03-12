export default function AmigosLoading() {
  return (
    <div className="flex flex-col gap-6" aria-hidden="true">
      <div role="status" className="sr-only">
        Cargando amigos…
      </div>

      {/* Section: Solicitudes recibidas skeleton */}
      <div className="flex flex-col gap-2">
        <div className="h-5 w-40 rounded bg-muted/20 animate-pulse ml-1" />
        {Array.from({ length: 2 }).map((_, i) => (
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

      {/* Section: Amigos skeleton */}
      <div className="flex flex-col gap-2">
        <div className="h-5 w-32 rounded bg-muted/20 animate-pulse ml-1" />
        {Array.from({ length: 3 }).map((_, i) => (
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
