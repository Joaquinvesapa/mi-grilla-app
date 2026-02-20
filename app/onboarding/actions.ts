"use server";

import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { randomAvatar } from "@/lib/profile-types";

// ── Types ──────────────────────────────────────────────────

export type OnboardingState = {
  error?: string;
  fieldErrors?: Partial<Record<"username", string>>;
} | null;

// ── Constants ──────────────────────────────────────────────

const USERNAME_REGEX = /^[a-z0-9_]{3,20}$/;

// ── Helpers ────────────────────────────────────────────────

function validateUsername(raw: string): string | null {
  if (!raw) return "Ingresá un nombre de usuario";
  if (raw.length < 3) return "Mínimo 3 caracteres";
  if (raw.length > 20) return "Máximo 20 caracteres";
  if (!USERNAME_REGEX.test(raw))
    return "Solo letras minúsculas, números y guiones bajos";
  return null;
}

// ── Create profile for OAuth users ─────────────────────────

export async function createProfile(
  _prev: OnboardingState,
  formData: FormData,
): Promise<OnboardingState> {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const username = ((formData.get("username") as string) ?? "")
    .toLowerCase()
    .trim();

  // ── Validation ──
  const usernameErr = validateUsername(username);
  if (usernameErr) return { fieldErrors: { username: usernameErr } };

  // ── Check availability ──
  const { data: available } = await supabase.rpc("is_username_available", {
    target_username: username,
  });

  if (!available) {
    return { fieldErrors: { username: "Ese usuario ya está en uso" } };
  }

  // ── Insert profile ──
  const { error } = await supabase.from("profiles").insert({
    id: user.id,
    username,
    avatar: randomAvatar(),
  });

  if (error) {
    if (error.code === "23505") {
      return { fieldErrors: { username: "Ese usuario ya está en uso" } };
    }
    return { error: "No se pudo crear el perfil. Intentá de nuevo." };
  }

  redirect("/grilla");
}
