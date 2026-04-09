import Link from "next/link";

// ── Demo Catch-All ──────────────────────────────────────────
// Catches any unmatched /demo/* route. Renders a 404 UI inline
// (static export does not support notFound()).

export default function DemoCatchAllPage() {
  return (
    <div
      className="flex flex-col items-center justify-center px-6 text-center gap-6 animate-fade-in-up"
      style={{
        height: "var(--app-viewport-height)",
        color: "var(--color-foreground)",
      }}
    >
      <h1 className="font-display text-8xl uppercase tracking-wider text-primary">
        404
      </h1>
      <div className="flex flex-col gap-2">
        <p className="font-display text-xl uppercase tracking-wide">
          Página no encontrada
        </p>
        <p
          className="font-sans text-sm max-w-xs leading-relaxed"
          style={{ color: "var(--color-muted)" }}
        >
          Esta ruta no existe en el demo. Probá volver a la grilla y explorá
          desde ahí.
        </p>
      </div>
      <Link
        href="/demo/grilla"
        className="font-display uppercase tracking-wider px-8 py-3 rounded-full text-sm transition-opacity duration-150 hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 touch-manipulation"
        style={{
          backgroundColor: "var(--color-primary)",
          color: "var(--color-primary-foreground)",
        }}
      >
        IR A LA GRILLA
      </Link>
    </div>
  );
}
