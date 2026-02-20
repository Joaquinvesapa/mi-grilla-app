import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Image from "next/image";
import { signOut } from "./actions";

export default async function PerfilPage() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const name: string = user.user_metadata?.full_name ?? user.email ?? "Usuario";
  const username: string = (
    user.user_metadata?.name ??
    user.email?.split("@")[0] ??
    "usuario"
  )
    .toLowerCase()
    .replace(/\s+/g, "");
  const avatarUrl: string | null = user.user_metadata?.avatar_url ?? null;

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-6 gap-8">
      {/* Avatar */}
      <div className="relative">
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt={`Foto de perfil de ${name}`}
            width={96}
            height={96}
            className="rounded-full object-cover"
            style={{
              outline: "4px solid var(--color-primary)",
              outlineOffset: "2px",
            }}
            priority
          />
        ) : (
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center text-2xl font-bold"
            style={{
              backgroundColor: "var(--color-primary)",
              color: "var(--color-primary-foreground)",
            }}
          >
            {name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col items-center gap-1 text-center">
        <h1 className="text-3xl font-display uppercase tracking-tight text-foreground">
          @{username}
        </h1>
      </div>

      {/* Sign out */}
      <form action={signOut}>
        <button
          type="submit"
          className="px-6 py-3 rounded-full font-sans color-primary-foreground text-sm font-medium uppercase tracking-wide transition-opacity hover:opacity-80 active:scale-95"
          style={{
            backgroundColor: "var(--color-primary)",
            color: "var(--color-primary-foreground)",
          }}
        >
          Cerrar sesión
        </button>
      </form>
    </div>
  );
}
