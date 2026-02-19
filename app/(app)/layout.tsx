import { BottomNav } from "@/components/bottom-nav";
import { DarkModeToggle } from "@/components/dark-mode-toggle";
import { ViewTransition } from "react";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <DarkModeToggle />

      {/* Main content: pb-16 reserves space so content doesn't hide behind the nav */}
      <ViewTransition>
        <main className="min-h-screen pb-16">{children}</main>
      </ViewTransition>

      <BottomNav />
    </>
  );
}
