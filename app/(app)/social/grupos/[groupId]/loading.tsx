export default function GroupDetailLoading() {
  return (
    <div className="flex flex-col gap-6">
      {/* Back link skeleton */}
      <div className="h-4 w-20 rounded bg-muted/10 animate-pulse" />

      {/* Group header skeleton */}
      <div
        className="flex flex-col gap-3 rounded-2xl border border-border p-5 animate-pulse"
        style={{ backgroundColor: "var(--color-surface)" }}
      >
        <div className="flex items-center justify-between">
          <div className="h-6 w-40 rounded bg-muted/20" />
          <div className="h-8 w-8 rounded-full bg-muted/10" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-20 rounded bg-muted/10" />
          <div className="h-7 w-24 rounded-lg bg-muted/15" />
        </div>
      </div>

      {/* Members section skeleton */}
      <div className="flex flex-col gap-2">
        <div className="h-4 w-24 rounded bg-muted/15 animate-pulse ml-1" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-2xl border border-border p-3 animate-pulse"
            style={{ backgroundColor: "var(--color-surface)" }}
          >
            <div className="h-10 w-10 shrink-0 rounded-full bg-muted/20" />
            <div className="flex flex-1 flex-col gap-1.5">
              <div className="h-4 w-28 rounded bg-muted/20" />
              <div className="h-3 w-16 rounded bg-muted/10" />
            </div>
          </div>
        ))}
      </div>

      {/* Group agenda section skeleton */}
      <div className="flex flex-col gap-2">
        <div className="h-4 w-32 rounded bg-muted/15 animate-pulse ml-1" />

        {/* Day tabs */}
        <div className="flex gap-1 rounded-lg bg-surface/50 p-1">
          {["w-20", "w-20", "w-24"].map((w, i) => (
            <div
              key={i}
              className={`h-9 ${w} rounded-md bg-muted/20 animate-pulse`}
            />
          ))}
        </div>

        {/* Agenda cards */}
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-2xl border border-border p-3 animate-pulse"
            style={{ backgroundColor: "var(--color-surface)" }}
          >
            <div className="h-10 w-1 shrink-0 rounded-full bg-muted/20" />
            <div className="flex flex-1 flex-col gap-1.5">
              <div className="h-4 w-36 rounded bg-muted/20" />
              <div className="h-3 w-24 rounded bg-muted/10" />
            </div>
            <div className="flex -space-x-1">
              {Array.from({ length: 2 }).map((_, j) => (
                <div
                  key={j}
                  className="h-6 w-6 rounded-full bg-muted/15 ring-2 ring-surface"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
