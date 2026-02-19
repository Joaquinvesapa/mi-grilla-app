export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <span className="text-5xl">🎸</span>
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          Mi<span style={{ color: "var(--color-primary)" }}>Grilla</span>
        </h1>
        <p className="text-lg text-foreground/70">
          Armá tu agenda del festival y coordiná con tus amigos.
        </p>
      </div>

      <div
        className="rounded-2xl px-8 py-4 text-white font-semibold text-base cursor-pointer"
        style={{ backgroundColor: "var(--color-primary)" }}
      >
        Próximamente
      </div>
    </main>
  );
}
