import { ViewTransition } from "react";
import { BottomNav } from "@/components/bottom-nav";
import { CommunityOnboardingModal } from "@/components/community-onboarding-modal";
import { DarkModeToggle } from "@/components/dark-mode-toggle";
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

      {showCommunityModal && <CommunityOnboardingModal />}

      {/* Main content: pb-16 reserves space so content doesn't hide behind the nav */}
      <ViewTransition>
        <main className="min-h-screen pb-16">{children}</main>
      </ViewTransition>

      <BottomNav showSocial={showSocial} />
    </>
  );
}
