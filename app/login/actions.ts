"use server";

import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { randomAvatar } from "@/lib/profile-types";
import { validateUsername, validatePin, toFakeEmail } from "@/lib/validation";

// ── Types ──────────────────────────────────────────────────

export type AuthState = {
  error?: string;
  fieldErrors?: Partial<Record<"pin", string>>;
} | null;

// ── Step 1: Check if username exists ───────────────────────

export async function checkUsername(username: string): Promise<boolean> {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.rpc("is_username_available", {
    target_username: username.toLowerCase(),
  });
  return data === true;
}

// ── Step 2: Authenticate (create or sign in) ──────────────

export async function authenticate(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const username = ((formData.get("username") as string) ?? "")
    .toLowerCase()
    .trim();
  const pin = (formData.get("pin") as string) ?? "";

  // ── Server-side validation (safety net) ──
  const usernameErr = validateUsername(username);
  if (usernameErr)
    return { error: "Usuario inv\u00e1lido. Volv\u00e9 al paso anterior." };

  const pinErr = validatePin(pin);
  if (pinErr) return { fieldErrors: { pin: pinErr } };

  // ── Server determines if this is a new user (never trust client) ──
  const supabase = await createServerSupabaseClient();
  const { data: isAvailable } = await supabase.rpc("is_username_available", {
    target_username: username,
  });
  const isNewUser = isAvailable === true;

  if (isNewUser) {
    // ── Create user + profile + sign in ──
    const admin = createAdminClient();
    const { data: authData, error: authError } =
      await admin.auth.admin.createUser({
        email: toFakeEmail(username),
        password: pin,
        email_confirm: true,
        user_metadata: { username },
      });

    if (authError || !authData.user) {
      if (authError?.message?.includes("already been registered")) {
        return { error: "Ese usuario ya fue tomado. Volvé a intentar." };
      }
      return { error: "No se pudo crear la cuenta. Intentá de nuevo." };
    }

    const { error: profileError } = await admin.from("profiles").insert({
      id: authData.user.id,
      username,
      avatar: randomAvatar(),
    });

    if (profileError) {
      await admin.auth.admin.deleteUser(authData.user.id);
      return { error: "No se pudo crear el perfil. Intentá de nuevo." };
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: toFakeEmail(username),
      password: pin,
    });

    if (signInError) {
      return {
        error:
          "Cuenta creada, pero no se pudo iniciar sesi\u00f3n. Prob\u00e1 entrar.",
      };
    }
  } else {
    // ── Sign in existing user ──
    const { error } = await supabase.auth.signInWithPassword({
      email: toFakeEmail(username),
      password: pin,
    });

    if (error) {
      return { error: "PIN incorrecto" };
    }
  }

  redirect("/grilla");
}

// ── Google OAuth ───────────────────────────────────────────

export async function signInWithGoogle() {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=/`,
    },
  });

  if (error || !data.url) {
    redirect("/login?error=oauth_error");
  }

  redirect(data.url);
}
