import { SocialTabs } from "./_components/social-tabs";

export default function SocialLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 px-4 pt-6">
      <h1 className="text-3xl font-display uppercase tracking-tight text-foreground text-center">
        Social
      </h1>

      <SocialTabs />

      {children}
    </div>
  );
}
