export default function FriendCompareLoading() {
  return (
    <div className="flex flex-col overflow-hidden px-4 pt-6" style={{ height: "var(--app-viewport-height)" }}>
      {/* Header skeleton */}
      <div className="flex shrink-0 items-center gap-3 pb-4">
        {/* Back button */}
        <div className="h-8 w-8 rounded-full bg-muted/10 animate-pulse" />

        {/* Friend avatar */}
        <div className="h-8 w-8 rounded-full bg-muted/20 animate-pulse" />

        <div className="flex flex-col gap-1">
          <div className="h-5 w-40 rounded bg-muted/20 animate-pulse" />
          <div className="h-3 w-32 rounded bg-muted/10 animate-pulse" />
        </div>
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
      </div>

      {/* Compare cards skeleton */}
      <div className="min-h-0 flex-1 overflow-hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="mb-2 flex items-center gap-3 rounded-2xl border border-border p-3 animate-pulse"
            style={{ backgroundColor: "var(--color-surface)" }}
          >
            <div className="h-10 w-1 shrink-0 rounded-full bg-muted/20" />
            <div className="flex flex-1 flex-col gap-1.5">
              <div className="h-4 w-32 rounded bg-muted/20" />
              <div className="h-3 w-24 rounded bg-muted/10" />
            </div>
            <div className="flex gap-1">
              <div className="h-6 w-6 rounded-full bg-muted/15" />
              <div className="h-6 w-6 rounded-full bg-muted/15" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
