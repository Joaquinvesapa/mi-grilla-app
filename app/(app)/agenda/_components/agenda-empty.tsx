import Link from "next/link";

interface AgendaEmptyProps {
  type: "unauthenticated" | "no-shows" | "empty-day";
  dayLabel?: string;
}

export function AgendaEmpty({ type, dayLabel }: AgendaEmptyProps) {
  if (type === "unauthenticated") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-5 px-6 text-center">
        <div
          className="flex h-16 w-16 items-center justify-center rounded-2xl"
          style={{ backgroundColor: "var(--color-primary)", opacity: 0.15 }}
        >
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--color-primary)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>

        <div className="flex flex-col gap-1.5">
          <h2 className="font-display text-xl uppercase tracking-wider text-foreground">
            Inicia sesion
          </h2>
          <p className="max-w-[240px] font-sans text-sm leading-relaxed text-muted">
            Para armar tu agenda necesitas iniciar sesion primero
          </p>
        </div>

        <Link
          href="/login"
          className="rounded-full px-6 py-3 font-sans text-sm font-medium uppercase tracking-wide transition-opacity duration-150 hover:opacity-80 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 touch-manipulation"
          style={{
            backgroundColor: "var(--color-primary)",
            color: "var(--color-primary-foreground)",
          }}
        >
          Ir al login
        </Link>
      </div>
    );
  }

  if (type === "no-shows") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-5 px-6 text-center">
        <div
          className="flex h-16 w-16 items-center justify-center rounded-2xl"
          style={{ backgroundColor: "var(--color-primary)", opacity: 0.15 }}
        >
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--color-primary)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        </div>

        <div className="flex flex-col gap-1.5">
          <h2 className="font-display text-xl uppercase tracking-wider text-foreground">
            Tu agenda esta vacia
          </h2>
          <p className="max-w-[260px] font-sans text-sm leading-relaxed text-muted">
            Anda a la Grilla y elegi los shows que queres ver
          </p>
        </div>

        <Link
          href="/grilla"
          className="inline-flex items-center gap-2 rounded-full px-6 py-3 font-sans text-sm font-medium uppercase tracking-wide transition-opacity duration-150 hover:opacity-80 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 touch-manipulation"
          style={{
            backgroundColor: "var(--color-primary)",
            color: "var(--color-primary-foreground)",
          }}
        >
          Ir a la Grilla
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M3 8H13M13 8L9 4M13 8L9 12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>
      </div>
    );
  }

  // empty-day
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-12 text-center">
      <p className="font-sans text-sm leading-relaxed text-muted">
        No tenes shows para el{" "}
        <span className="font-medium text-foreground">{dayLabel}</span>
      </p>
      <Link
        href="/grilla"
        className="font-sans text-sm font-medium underline underline-offset-4 transition-opacity duration-150 hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
        style={{ color: "var(--color-primary)" }}
      >
        Agregar desde la Grilla
      </Link>
    </div>
  );
}
