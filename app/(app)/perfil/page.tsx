import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/profile-types";
import { ProfileEditForm } from "./_components/profile-edit-form";
import { AvatarEditor } from "./_components/avatar-editor";
import { signOut } from "./actions";

export default async function PerfilPage() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // ── Fetch profile from the profiles table ──
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/onboarding");

  const typedProfile = profile as Profile;

  // Google avatar from user_metadata (if available)
  const googleAvatarUrl: string | null =
    user.user_metadata?.avatar_url ?? null;

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center px-6 pt-12 pb-8 gap-8">
      {/* Avatar */}
      <AvatarEditor profile={typedProfile} googleAvatarUrl={googleAvatarUrl} />

      {/* Current username */}
      <div className="flex flex-col items-center gap-1 text-center">
        <h1 className="text-3xl font-display uppercase tracking-tight text-foreground">
          @{typedProfile.username}
        </h1>
        {typedProfile.instagram && (
          <a
            href={`https://instagram.com/${typedProfile.instagram}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted hover:text-primary transition-colors duration-150"
          >
            @{typedProfile.instagram}
          </a>
        )}
      </div>

      {/* Edit form */}
      <div className="w-full max-w-xs">
        <ProfileEditForm profile={typedProfile} />
      </div>

      {/* Sign out */}
      <form action={signOut} className="w-full max-w-xs">
        <button
          type="submit"
          className="w-full cursor-pointer rounded-2xl border border-border bg-surface py-3.5 text-sm font-semibold uppercase tracking-wide text-muted hover:text-accent-pink hover:border-accent-pink/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-pink/50 focus-visible:ring-offset-2 active:scale-95 touch-manipulation transition-[color,border-color,transform] duration-150"
        >
          Cerrar sesión
        </button>
      </form>
    </div>
  );
}
