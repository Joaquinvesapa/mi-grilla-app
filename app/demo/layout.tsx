"use client";

// ── Demo Layout ─────────────────────────────────────────────
// Simplified shell for demo mode. No Supabase, no PWA, no
// offline or community-onboarding overhead.
//
// On desktop (≥768px), wraps everything in a DeviceFrame that
// renders the app inside a phone mockup. On mobile, renders
// directly — the app already looks native.

import { usePathname } from "next/navigation";
import { DemoProvider } from "@/lib/demo/demo-context";
import { DarkModeToggle } from "@/components/dark-mode-toggle";
import { DemoBanner } from "./_components/demo-banner";
import { DemoLiveNowMenu } from "./_components/demo-live-now-menu";
import { DemoBottomNav } from "./_components/demo-bottom-nav";
import { DeviceFrame } from "./_components/device-frame";

// ── Component ───────────────────────────────────────────────

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // The landing page (/demo) renders full-screen without a device frame
  const isLanding = pathname === "/demo";

  const appShell = (
    <>
      <DarkModeToggle />

      {/* Main content: bottom padding reserves space for the fixed nav.
          In PWA standalone mode the nav is taller due to safe-area-inset-bottom. */}
      <main
        style={{ paddingBottom: "calc(4rem + var(--safe-area-bottom))" }}
      >
        {children}
      </main>

      <DemoLiveNowMenu />

      <DemoBottomNav />
    </>
  );

  // Landing page: full-screen, no nav, no device frame, no banner
  if (isLanding) {
    return (
      <DemoProvider>
        <DarkModeToggle />
        <main>{children}</main>
      </DemoProvider>
    );
  }

  return (
    <DemoProvider>
      <DeviceFrame banner={<DemoBanner />}>{appShell}</DeviceFrame>
    </DemoProvider>
  );
}
