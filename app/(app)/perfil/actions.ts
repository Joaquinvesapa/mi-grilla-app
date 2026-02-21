"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Profile, ProfileUpdate } from "@/lib/profile-types";

// ── Helpers ────────────────────────────────────────────────

const USERNAME_REGEX = /^[a-z0-9_]{3,20}$/;
const INSTAGRAM_REGEX = /^[a-z0-9._]{1,30}$/i;

function validateUsername(raw: string): string | null {
  if (!raw) return "Ingresá un nombre de usuario";
  if (raw.length < 3) return "Mínimo 3 caracteres";
  if (raw.length > 20) return "Máximo 20 caracteres";
  if (!USERNAME_REGEX.test(raw))
    return "Solo letras minúsculas, números y guiones bajos";
  return null;
}

function validateInstagram(raw: string): string | null {
  if (!raw) return null; // optional field
  const clean = raw.replace(/^@/, "");
  if (!INSTAGRAM_REGEX.test(clean))
    return "Instagram inválido (solo letras, números, puntos y guiones bajos)";
  return null;
}

// ── Types ──────────────────────────────────────────────────

export type ProfileActionState = {
  error?: string;
  fieldErrors?: Partial<Record<"username" | "instagram", string>>;
  success?: boolean;
} | null;

// ── Get profile ────────────────────────────────────────────

export async function getProfile(): Promise<Profile | null> {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return data as Profile | null;
}

// ── Update profile ─────────────────────────────────────────

export async function updateProfile(
  _prev: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const username = ((formData.get("username") as string) ?? "")
    .toLowerCase()
    .trim();
  const instagramRaw = ((formData.get("instagram") as string) ?? "").trim();
  const instagram = instagramRaw ? instagramRaw.replace(/^@/, "") : null;
  const isPublic = formData.get("is_public") === "on";

  // ── Validation ──
  const fieldErrors: Record<string, string> = {};

  const usernameErr = validateUsername(username);
  if (usernameErr) fieldErrors.username = usernameErr;

  if (instagramRaw) {
    const igErr = validateInstagram(instagramRaw);
    if (igErr) fieldErrors.instagram = igErr;
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  // ── Check if username changed and is available ──
  const { data: currentProfile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .single();

  if (currentProfile && currentProfile.username !== username) {
    const { data: available } = await supabase.rpc("is_username_available", {
      target_username: username,
    });

    if (!available) {
      return { fieldErrors: { username: "Ese usuario ya está en uso" } };
    }
  }

  // ── Update ──
  const update: ProfileUpdate = {
    username,
    instagram,
    is_public: isPublic,
  };

  const { error } = await supabase
    .from("profiles")
    .update(update)
    .eq("id", user.id);

  if (error) {
    if (error.code === "23505") {
      return { fieldErrors: { username: "Ese usuario ya está en uso" } };
    }
    return { error: "No se pudo actualizar el perfil. Intentá de nuevo." };
  }

  revalidatePath("/perfil");
  revalidatePath("/", "layout");
  return { success: true };
}

// ── Community onboarding choice ────────────────────────────

export async function setCommunityChoice(
  isPublic: boolean,
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { error } = await supabase
    .from("profiles")
    .update({
      is_public: isPublic,
      community_onboarding_completed: true,
    })
    .eq("id", user.id);

  if (error) {
    console.error("setCommunityChoice error:", error);
    return { success: false, error: "No se pudo guardar. Intentá de nuevo." };
  }

  revalidatePath("/", "layout");
  return { success: true };
}

// ── Sign out ───────────────────────────────────────────────

export async function signOut() {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  redirect("/login");
}
