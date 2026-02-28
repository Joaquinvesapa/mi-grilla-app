"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { AVATAR_COLORS, type Profile, type ProfileUpdate } from "@/lib/profile-types";
import { isValidStorageUrl } from "@/lib/security";
import { validateUsername, validateInstagram } from "@/lib/validation";

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

// ── Update avatar color ────────────────────────────────────

export async function updateAvatarColor(
  color: string,
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  if (
    !AVATAR_COLORS.includes(color as (typeof AVATAR_COLORS)[number])
  ) {
    return { success: false, error: "Color inválido" };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ avatar: color })
    .eq("id", user.id);

  if (error) {
    console.error("updateAvatarColor error:", error);
    return { success: false, error: "No se pudo actualizar el color." };
  }

  revalidatePath("/perfil");
  revalidatePath("/", "layout");
  return { success: true };
}

// ── Update avatar photo URL ────────────────────────────────

export async function updateAvatarUrl(
  url: string,
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  if (!isValidStorageUrl(url)) {
    return { success: false, error: "URL de imagen inv\u00e1lida." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ avatar_url: url })
    .eq("id", user.id);

  if (error) {
    console.error("updateAvatarUrl error:", error);
    return { success: false, error: "No se pudo guardar la foto." };
  }

  revalidatePath("/perfil");
  revalidatePath("/", "layout");
  return { success: true };
}

// ── Remove avatar photo ────────────────────────────────────

export async function removeAvatarPhoto(): Promise<{
  success: boolean;
  error?: string;
}> {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Remove from storage
  const { error: storageError } = await supabase.storage
    .from("avatars")
    .remove([`${user.id}/avatar`]);

  if (storageError) {
    console.error("removeAvatarPhoto storage error:", storageError);
    // Continue — clear the URL even if storage delete fails
  }

  // Clear the URL in the profile
  const { error } = await supabase
    .from("profiles")
    .update({ avatar_url: null })
    .eq("id", user.id);

  if (error) {
    console.error("removeAvatarPhoto error:", error);
    return { success: false, error: "No se pudo eliminar la foto." };
  }

  revalidatePath("/perfil");
  revalidatePath("/", "layout");
  return { success: true };
}

// ── Sign out ───────────────────────────────────────────────

export async function signOut() {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  redirect("/login");
}
