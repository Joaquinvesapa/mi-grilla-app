"use server";

import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { randomAvatar } from "@/lib/profile-types";

// ── Types ──────────────────────────────────────────────────

export type AuthState = {
  error?: string;
  fieldErrors?: Partial<Record<"pin", string>>;
} | null;

// ── Constants ──────────────────────────────────────────────

const EMAIL_DOMAIN = "migrilla.app";

const USERNAME_REGEX = /^[a-z0-9_]{3,20}$/;
const PIN_REGEX = /^[0-9]{6}$/;

// ── Helpers ────────────────────────────────────────────────

function toFakeEmail(username: string): string {
  return `${username}@${EMAIL_DOMAIN}`;
}

function validateUsername(raw: string): string | null {
  if (!raw) return "Ingresá un nombre de usuario";
  if (raw.length < 3) return "Mínimo 3 caracteres";
  if (raw.length > 20) return "Máximo 20 caracteres";
  if (!USERNAME_REGEX.test(raw))
    return "Solo letras minúsculas, números y guiones bajos";
  return null;
}

function validatePin(pin: string): string | null {
  if (!pin) return "Ingresá un PIN";
  if (!PIN_REGEX.test(pin)) return "El PIN debe tener exactamente 6 dígitos";
  return null;
}

// ── Step 1: Check if username exists ───────────────────────

export async function checkUsername(username: string): Promise<boolean> {
  const admin = createAdminClient();
  const { data } = await admin.rpc("is_username_available", {
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
  const isNewUser = formData.get("isNewUser") === "true";

  // ── Server-side validation (safety net) ──
  const usernameErr = validateUsername(username);
  if (usernameErr)
    return { error: "Usuario inválido. Volvé al paso anterior." };

  const pinErr = validatePin(pin);
  if (pinErr) return { fieldErrors: { pin: pinErr } };

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

    const supabase = await createServerSupabaseClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: toFakeEmail(username),
      password: pin,
    });

    if (signInError) {
      return {
        error: "Cuenta creada, pero no se pudo iniciar sesión. Probá entrar.",
      };
    }
  } else {
    // ── Sign in existing user ──
    const supabase = await createServerSupabaseClient();
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
