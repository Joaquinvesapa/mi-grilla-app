export default function PerfilLoading() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center px-6 pt-12 pb-8 gap-8">
      {/* Avatar skeleton */}
      <div className="h-24 w-24 rounded-full bg-muted/20 animate-pulse" />

      {/* Username + instagram */}
      <div className="flex flex-col items-center gap-2">
        <div className="h-8 w-48 rounded bg-muted/20 animate-pulse" />
        <div className="h-4 w-28 rounded bg-muted/10 animate-pulse" />
      </div>

      {/* Form skeleton */}
      <div className="flex w-full max-w-xs flex-col gap-4">
        {/* Username field */}
        <div className="flex flex-col gap-1.5">
          <div className="h-3 w-16 rounded bg-muted/10 animate-pulse" />
          <div
            className="h-12 w-full rounded-2xl border border-border animate-pulse"
            style={{ backgroundColor: "var(--color-surface)" }}
          />
        </div>

        {/* Instagram field */}
        <div className="flex flex-col gap-1.5">
          <div className="h-3 w-20 rounded bg-muted/10 animate-pulse" />
          <div
            className="h-12 w-full rounded-2xl border border-border animate-pulse"
            style={{ backgroundColor: "var(--color-surface)" }}
          />
        </div>

        {/* Visibility toggle */}
        <div className="flex items-center justify-between py-2">
          <div className="h-4 w-24 rounded bg-muted/10 animate-pulse" />
          <div className="h-6 w-11 rounded-full bg-muted/20 animate-pulse" />
        </div>

        {/* Save button */}
        <div className="h-12 w-full rounded-2xl bg-muted/15 animate-pulse" />
      </div>

      {/* Sign out button */}
      <div
        className="h-12 w-full max-w-xs rounded-2xl border border-border animate-pulse"
        style={{ backgroundColor: "var(--color-surface)" }}
      />
    </div>
  );
}
