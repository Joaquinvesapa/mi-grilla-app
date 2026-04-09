import Link from "next/link";

// ── Demo 404 ────────────────────────────────────────────────
// Shown when a visitor hits a non-existent /demo/* route.
// Keeps them inside the demo — no escape to auth routes.

export default function DemoNotFound() {
  return (
    <div
      className="flex flex-col items-center justify-center px-6 text-center gap-6 animate-fade-in-up"
      style={{
        height: "var(--app-viewport-height)",
        color: "var(--color-foreground)",
      }}
    >
      {/* ── Big 404 ──────────────────────────────────────── */}
      <h1 className="font-display text-8xl uppercase tracking-wider text-primary">
        404
      </h1>

      {/* ── Message ──────────────────────────────────────── */}
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

      {/* ── CTA ──────────────────────────────────────────── */}
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
