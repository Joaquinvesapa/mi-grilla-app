import { BottomNav } from "@/components/bottom-nav";
import { DarkModeToggle } from "@/components/dark-mode-toggle";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <DarkModeToggle />

      {/* Main content: pb-16 reserves space so content doesn't hide behind the nav */}
      <main className="min-h-screen pb-16">
        {children}
      </main>

      <BottomNav />
    </>
  );
}
