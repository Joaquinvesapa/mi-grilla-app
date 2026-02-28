import Link from "next/link";
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

      {/* Admin panel (admin only) */}
      {typedProfile.is_admin && (
        <Link
          href="/admin"
          className="w-full max-w-xs cursor-pointer rounded-2xl border border-accent-purple/30 bg-surface py-3.5 text-center text-sm font-semibold uppercase tracking-wide text-accent-purple hover:bg-accent-purple/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-purple/50 focus-visible:ring-offset-2 active:scale-95 touch-manipulation transition-[color,background-color,transform] duration-150"
          aria-label="Ir al panel de administración"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="inline-block size-4 mr-1.5 -mt-0.5"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M8.34 1.804A1 1 0 0 1 9.32 1h1.36a1 1 0 0 1 .98.804l.295 1.473c.497.144.971.342 1.416.587l1.25-.834a1 1 0 0 1 1.262.125l.962.962a1 1 0 0 1 .125 1.262l-.834 1.25c.245.445.443.919.587 1.416l1.473.295a1 1 0 0 1 .804.98v1.361a1 1 0 0 1-.804.98l-1.473.295a6.95 6.95 0 0 1-.587 1.416l.834 1.25a1 1 0 0 1-.125 1.262l-.962.962a1 1 0 0 1-1.262.125l-1.25-.834a6.953 6.953 0 0 1-1.416.587l-.295 1.473a1 1 0 0 1-.98.804H9.32a1 1 0 0 1-.98-.804l-.295-1.473a6.957 6.957 0 0 1-1.416-.587l-1.25.834a1 1 0 0 1-1.262-.125l-.962-.962a1 1 0 0 1-.125-1.262l.834-1.25a6.957 6.957 0 0 1-.587-1.416l-1.473-.295A1 1 0 0 1 1 10.68V9.32a1 1 0 0 1 .804-.98l1.473-.295c.144-.497.342-.971.587-1.416l-.834-1.25a1 1 0 0 1 .125-1.262l.962-.962A1 1 0 0 1 5.38 3.03l1.25.834a6.957 6.957 0 0 1 1.416-.587l.294-1.473ZM13 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
              clipRule="evenodd"
            />
          </svg>
          Panel de Admin
        </Link>
      )}

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
