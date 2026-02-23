export default function GrillaLoading() {
  return (
    <div className="flex flex-col overflow-hidden px-4 pt-6" style={{ height: "var(--app-viewport-height)" }}>
      {/* Header skeleton */}
      <div className="flex shrink-0 flex-col gap-1 pb-4">
        <div className="h-7 w-64 rounded bg-muted/20 animate-pulse" />
        <div className="h-4 w-48 rounded bg-muted/10 animate-pulse" />
      </div>

      {/* Day tabs + download button skeleton */}
      <div className="flex items-center gap-2 pb-4">
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

      {/* Grid skeleton */}
      <div
        className="mb-3 min-h-0 flex-1 rounded-lg border animate-pulse"
        style={{
          borderColor: "var(--color-grid-border)",
          backgroundColor: "var(--color-grid-bg)",
        }}
      >
        {/* Stage header row */}
        <div
          className="flex h-12 items-stretch border-b"
          style={{ borderColor: "var(--color-grid-border)" }}
        >
          <div
            className="flex w-14 shrink-0 items-center justify-center border-r"
            style={{ borderColor: "var(--color-grid-border)" }}
          >
            <div className="h-3 w-8 rounded bg-muted/20" />
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex flex-1 items-center justify-center">
              <div className="h-5 w-16 rounded bg-muted/15" />
            </div>
          ))}
        </div>

        {/* Grid rows */}
        <div className="flex flex-col gap-px p-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2 py-3">
              <div className="w-12 shrink-0">
                <div className="h-3 w-10 rounded bg-muted/10" />
              </div>
              {Array.from({ length: 5 }).map((_, j) => (
                <div
                  key={j}
                  className="flex-1 rounded-lg"
                  style={{
                    height: `${32 + ((i + j) % 3) * 16}px`,
                    backgroundColor: "var(--color-grid-cell)",
                    opacity: 0.5,
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
