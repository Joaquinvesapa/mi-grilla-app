import { ViewTransition } from "react";
import { BottomNav } from "@/components/bottom-nav";
import { CommunityOnboardingModal } from "@/components/community-onboarding-modal";
import { LiveNowMenu } from "@/components/live-now-menu";
import { DarkModeToggle } from "@/components/dark-mode-toggle";
import { NavigationProgressBar } from "@/components/navigation-progress-bar";
import { PWAInstallPrompt } from "@/components/pwa-install-prompt";
import { OfflineIndicator } from "@/components/offline-indicator";
import { SWUpdatePrompt } from "@/components/sw-update-prompt";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let showCommunityModal = false;
  let showSocial = true;

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_public, community_onboarding_completed")
      .eq("id", user.id)
      .single();

    if (profile) {
      showCommunityModal = !profile.community_onboarding_completed;
      showSocial = profile.is_public;
    }
  }

  return (
    <>
      <DarkModeToggle />

      <NavigationProgressBar />

      {showCommunityModal && <CommunityOnboardingModal />}

      {/* Main content: bottom padding reserves space for the fixed nav.
          In PWA standalone mode the nav is taller due to safe-area-inset-bottom. */}
      <ViewTransition>
        <main
          className="min-h-screen"
          style={{ paddingBottom: "calc(4rem + var(--safe-area-bottom))" }}
        >
          {children}
        </main>
      </ViewTransition>

      <LiveNowMenu />

      <BottomNav showSocial={showSocial} />

      <PWAInstallPrompt />

      <OfflineIndicator />

      <SWUpdatePrompt />
    </>
  );
}
