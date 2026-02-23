export default function AgendaLoading() {
  return (
    <div className="flex flex-col overflow-hidden px-4 pt-6" style={{ height: "var(--app-viewport-height)" }}>
      {/* Header skeleton */}
      <div className="flex shrink-0 flex-col gap-1 pb-4">
        <div className="h-7 w-36 rounded bg-muted/20 animate-pulse" />
        <div className="h-4 w-52 rounded bg-muted/10 animate-pulse" />
      </div>

      {/* Stats pills skeleton */}
      <div className="flex shrink-0 flex-wrap items-center gap-2 pb-4">
        <div className="h-7 w-24 rounded-full bg-muted/10 animate-pulse" />
        <div className="h-7 w-28 rounded-full bg-muted/10 animate-pulse" />
      </div>

      {/* Day tabs skeleton */}
      <div className="flex shrink-0 items-center gap-2 pb-4">
        <div className="flex gap-1 rounded-lg bg-surface/50 p-1">
          {["w-20", "w-20", "w-24"].map((w, i) => (
            <div
              key={i}
              className={`h-9 ${w} rounded-md bg-muted/20 animate-pulse`}
            />
          ))}
        </div>
        <div className="h-9 w-9 rounded-md bg-muted/10 animate-pulse" />
      </div>

      {/* Timeline cards skeleton */}
      <div className="min-h-0 flex-1 overflow-hidden">
        {Array.from({ length: 3 }).map((_, groupIdx) => (
          <div key={groupIdx} className="flex flex-col gap-2 mb-5">
            {/* Time divider */}
            <div className="flex items-center gap-3">
              <div className="h-3 w-10 shrink-0 rounded bg-muted/20 animate-pulse" />
              <div
                className="h-px flex-1"
                style={{ backgroundColor: "var(--color-border)" }}
              />
            </div>

            {/* Cards */}
            {Array.from({ length: groupIdx === 0 ? 2 : 1 }).map((_, cardIdx) => (
              <div
                key={cardIdx}
                className="flex items-center gap-3 rounded-2xl border border-border p-3 animate-pulse"
                style={{ backgroundColor: "var(--color-surface)" }}
              >
                {/* Color bar */}
                <div className="h-12 w-1 shrink-0 rounded-full bg-muted/20" />

                <div className="flex flex-1 flex-col gap-1.5">
                  <div className="h-4 w-36 rounded bg-muted/20" />
                  <div className="flex gap-2">
                    <div className="h-3 w-20 rounded bg-muted/10" />
                    <div className="h-3 w-16 rounded bg-muted/10" />
                  </div>
                </div>

                {/* Remove button placeholder */}
                <div className="h-8 w-8 shrink-0 rounded-full bg-muted/10" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
