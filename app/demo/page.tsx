import type { Metadata } from "next";
import Link from "next/link";

// ── Metadata ────────────────────────────────────────────────

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "MiGrilla Demo",
    description:
      "Explorá MiGrilla con datos de ejemplo del Lollapalooza Argentina 2025. " +
      "Armá tu agenda, seguí a tus amigos y coordiná con tu grupo.",
    robots: {
      index: false,
      follow: false,
    },
  };
}

// ── Component ────────────────────────────────────────────────

/**
 * Demo landing page — static Server Component.
 * Showcases the app concept and sends visitors to /demo/grilla.
 * Marked noindex so it doesn't appear in search results.
 */
export default function DemoPage() {
  return (
    <div
      className="animate-fade-in flex min-h-screen flex-col items-center justify-center px-6 py-16 text-center"
      style={{ backgroundColor: "var(--color-background)", color: "var(--color-foreground)" }}
    >
      {/* ── Brand ──────────────────────────────────────────── */}
      <h1
        className="animate-fade-in-up font-display text-6xl uppercase tracking-wider mb-2"
        style={{ animationDelay: "0ms" }}
      >
        MIGRILLA
      </h1>

      {/* ── Tagline ────────────────────────────────────────── */}
      <p
        className="animate-fade-in-up font-sans text-lg mb-2 max-w-sm leading-snug"
        style={{ animationDelay: "80ms" }}
      >
        Tu grilla de festival, tu agenda, tu grupo.{" "}
        <span style={{ color: "var(--color-muted)" }}>
          Todo en un solo lugar.
        </span>
      </p>

      {/* ── Demo notice ────────────────────────────────────── */}
      <p
        className="animate-fade-in-up font-sans text-sm mb-10"
        style={{ animationDelay: "160ms", color: "var(--color-muted)" }}
      >
        Versión demo con datos de ejemplo del Lollapalooza Argentina 2025
      </p>

      {/* ── CTA ────────────────────────────────────────────── */}
      <div className="animate-fade-in-up" style={{ animationDelay: "240ms" }}>
        <Link
          href="/demo/grilla"
          className="font-display uppercase tracking-wider px-8 py-3 rounded-full text-sm transition-opacity duration-150 hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 touch-manipulation"
          style={{
            backgroundColor: "var(--color-primary)",
            color: "var(--color-primary-foreground)",
          }}
        >
          EXPLORAR DEMO
        </Link>
      </div>

      {/* ── Stack badges ───────────────────────────────────── */}
      <div
        className="animate-fade-in-up flex flex-wrap items-center justify-center gap-2 mt-12"
        aria-hidden="true"
        style={{ animationDelay: "320ms" }}
      >
        {["Next.js", "React 19", "Supabase", "Tailwind CSS"].map((tech) => (
          <span
            key={tech}
            className="font-sans text-xs px-2.5 py-1 rounded-full border"
            style={{
              borderColor: "var(--color-border)",
              color: "var(--color-muted)",
              backgroundColor: "var(--color-surface)",
            }}
          >
            {tech}
          </span>
        ))}
      </div>
    </div>
  );
}
