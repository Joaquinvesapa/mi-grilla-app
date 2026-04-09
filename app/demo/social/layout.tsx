import { DemoSocialTabs } from "./_components/demo-social-tabs";

// ── Component ──────────────────────────────────────────────

export default function DemoSocialLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 px-4 pt-6">
      <h1 className="text-3xl font-display uppercase tracking-tight text-foreground text-center">
        SOCIAL
      </h1>

      <DemoSocialTabs />

      {children}
    </div>
  );
}
