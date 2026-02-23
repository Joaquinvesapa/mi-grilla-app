import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sin Conexión | MiGrilla",
};

export default function OfflinePage() {
  return (
    <main
      id="main-content"
      className="flex min-h-dvh flex-col items-center justify-center gap-6 px-6 text-center"
    >
      {/* Offline icon */}
      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-surface">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-12 w-12 text-muted"
          aria-hidden="true"
        >
          {/* WiFi icon with slash */}
          <path d="M12 20h.01" />
          <path d="M8.5 16.429a5 5 0 0 1 7 0" />
          <path d="M5 12.859a10 10 0 0 1 5.17-2.69" />
          <path d="M13.83 10.17A10 10 0 0 1 19 12.859" />
          <path d="M1.42 9a16 16 0 0 1 9.78-5.37" />
          <path d="M12.82 3.63A16 16 0 0 1 22.58 9" />
          <line x1="2" y1="2" x2="22" y2="22" />
        </svg>
      </div>

      <div className="flex flex-col gap-2">
        <h1 className="font-display text-3xl uppercase tracking-wide text-foreground">
          Sin Conexión
        </h1>
        <p className="max-w-sm text-base text-muted">
          Parece que no tenés señal. Cuando vuelvas a estar conectado, la app se
          va a actualizar automáticamente.
        </p>
      </div>

      {/* Subtle hint */}
      <p className="mt-4 text-sm text-muted/60">
        Tip: Si instalaste MiGrilla, la grilla del festival está disponible
        offline.
      </p>
    </main>
  );
}
