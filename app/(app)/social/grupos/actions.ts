"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/profile-types";
import {
  GROUP_ROLE,
  type Group,
  type GroupWithMeta,
  type GroupDetail,
  type GroupMemberWithProfile,
  type GroupPreview,
} from "@/lib/group-types";

// ── Helpers ────────────────────────────────────────────────

async function requireUser() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("No autenticado");
  return { supabase, userId: user.id };
}

// ── Types ──────────────────────────────────────────────────

export type GroupActionResult = {
  success: boolean;
  error?: string;
};

export type CreateGroupState = {
  error?: string;
  fieldErrors?: Partial<Record<"name", string>>;
} | null;

export type JoinGroupState = {
  error?: string;
  fieldErrors?: Partial<Record<"code", string>>;
  preview?: GroupPreview;
} | null;

// ── Create group ───────────────────────────────────────────

export async function createGroup(
  _prev: CreateGroupState,
  formData: FormData,
): Promise<CreateGroupState> {
  const { supabase, userId } = await requireUser();

  const name = ((formData.get("name") as string) ?? "").trim();

  if (!name || name.length < 2) {
    return { fieldErrors: { name: "El nombre debe tener al menos 2 caracteres" } };
  }
  if (name.length > 40) {
    return { fieldErrors: { name: "El nombre no puede tener más de 40 caracteres" } };
  }

  // Create the group
  const { data: group, error: groupError } = await supabase
    .from("groups")
    .insert({ name, created_by: userId })
    .select("id")
    .single();

  if (groupError || !group) {
    return { error: "No se pudo crear el grupo. Intentá de nuevo." };
  }

  // Add creator as admin member
  const { error: memberError } = await supabase.from("group_members").insert({
    group_id: group.id,
    user_id: userId,
    role: GROUP_ROLE.ADMIN,
  });

  if (memberError) {
    // Rollback: delete the group
    await supabase.from("groups").delete().eq("id", group.id);
    return { error: "No se pudo crear el grupo. Intentá de nuevo." };
  }

  revalidatePath("/social/grupos");
  redirect(`/social/grupos/${group.id}`);
}

// ── Find group by invite code (for preview before joining) ─

export async function findGroupByCode(
  code: string,
): Promise<GroupPreview | null> {
  const { supabase } = await requireUser();

  const { data, error } = await supabase
    .rpc("find_group_by_invite_code", { code: code.toUpperCase() })
    .maybeSingle();

  if (error) {
    console.error("[findGroupByCode] RPC error:", error.message, error.code);
    return null;
  }

  return data as GroupPreview | null;
}

// ── Search and preview group ───────────────────────────────

export async function searchGroup(
  _prev: JoinGroupState,
  formData: FormData,
): Promise<JoinGroupState> {
  const code = ((formData.get("code") as string) ?? "").trim().toUpperCase();

  if (!code || code.length !== 6) {
    return { fieldErrors: { code: "El código debe tener 6 caracteres" } };
  }

  const { supabase } = await requireUser();

  const { data, error } = await supabase
    .rpc("find_group_by_invite_code", { code })
    .maybeSingle();

  if (error) {
    console.error("[searchGroup] RPC error:", error.message, error.code);
    return { error: "Error al buscar el grupo. Intentá de nuevo." };
  }

  if (!data) {
    return { fieldErrors: { code: "No se encontró un grupo con ese código" } };
  }

  return { preview: data as GroupPreview };
}

// ── Join group ─────────────────────────────────────────────

export async function joinGroup(
  groupId: string,
): Promise<GroupActionResult> {
  const { supabase, userId } = await requireUser();

  // Check if already a member
  const { data: existing } = await supabase
    .from("group_members")
    .select("id")
    .eq("group_id", groupId)
    .eq("user_id", userId)
    .maybeSingle();

  if (existing) {
    redirect(`/social/grupos/${groupId}`);
  }

  const { error } = await supabase.from("group_members").insert({
    group_id: groupId,
    user_id: userId,
    role: GROUP_ROLE.MEMBER,
  });

  if (error) {
    return { success: false, error: "No se pudo unir al grupo" };
  }

  revalidatePath("/social/grupos");
  redirect(`/social/grupos/${groupId}`);
}

// ── Leave group ────────────────────────────────────────────

export async function leaveGroup(
  groupId: string,
): Promise<GroupActionResult> {
  const { supabase, userId } = await requireUser();

  const { error } = await supabase
    .from("group_members")
    .delete()
    .eq("group_id", groupId)
    .eq("user_id", userId);

  if (error) {
    return { success: false, error: "No se pudo abandonar el grupo" };
  }

  revalidatePath("/social/grupos");
  return { success: true };
}

// ── Remove member (admin only) ─────────────────────────────

export async function removeMember(
  groupId: string,
  memberId: string,
): Promise<GroupActionResult> {
  const { supabase, userId } = await requireUser();

  // Verify caller is admin
  const { data: callerMember } = await supabase
    .from("group_members")
    .select("role")
    .eq("group_id", groupId)
    .eq("user_id", userId)
    .single();

  if (!callerMember || callerMember.role !== GROUP_ROLE.ADMIN) {
    return { success: false, error: "Solo el admin puede remover miembros" };
  }

  // Can't remove yourself with this action
  if (memberId === userId) {
    return { success: false, error: "Usá 'Abandonar grupo' para salir" };
  }

  const { error } = await supabase
    .from("group_members")
    .delete()
    .eq("group_id", groupId)
    .eq("user_id", memberId);

  if (error) {
    return { success: false, error: "No se pudo remover al miembro" };
  }

  revalidatePath(`/social/grupos/${groupId}`);
  return { success: true };
}

// ── Rename group (admin only) ──────────────────────────────

export async function renameGroup(
  groupId: string,
  newName: string,
): Promise<GroupActionResult> {
  const { supabase, userId } = await requireUser();

  const name = newName.trim();
  if (!name || name.length < 2 || name.length > 40) {
    return { success: false, error: "El nombre debe tener entre 2 y 40 caracteres" };
  }

  // RLS handles the auth check (only creator can update)
  const { error } = await supabase
    .from("groups")
    .update({ name })
    .eq("id", groupId)
    .eq("created_by", userId);

  if (error) {
    return { success: false, error: "No se pudo renombrar el grupo" };
  }

  revalidatePath(`/social/grupos/${groupId}`);
  revalidatePath("/social/grupos");
  return { success: true };
}

// ── Delete group (admin only) ──────────────────────────────

export async function deleteGroup(
  groupId: string,
): Promise<GroupActionResult> {
  const { supabase, userId } = await requireUser();

  const { error } = await supabase
    .from("groups")
    .delete()
    .eq("id", groupId)
    .eq("created_by", userId);

  if (error) {
    return { success: false, error: "No se pudo eliminar el grupo" };
  }

  revalidatePath("/social/grupos");
  return { success: true };
}

// ── Get my groups ──────────────────────────────────────────

export async function getMyGroups(): Promise<GroupWithMeta[]> {
  const { supabase, userId } = await requireUser();

  // Get groups where I'm a member
  const { data: memberships } = await supabase
    .from("group_members")
    .select("group_id, role")
    .eq("user_id", userId);

  if (!memberships || memberships.length === 0) return [];

  const groupIds = memberships.map((m) => m.group_id);
  const roleMap = new Map(memberships.map((m) => [m.group_id, m.role]));

  // Fetch groups
  const { data: groups } = await supabase
    .from("groups")
    .select("*")
    .in("id", groupIds)
    .order("created_at", { ascending: false });

  if (!groups) return [];

  // Count members per group
  const result: GroupWithMeta[] = [];

  for (const group of groups as Group[]) {
    const { count } = await supabase
      .from("group_members")
      .select("id", { count: "exact", head: true })
      .eq("group_id", group.id);

    result.push({
      ...group,
      member_count: count ?? 0,
      my_role: (roleMap.get(group.id) ?? GROUP_ROLE.MEMBER) as GroupWithMeta["my_role"],
    });
  }

  return result;
}

// ── Get group detail ───────────────────────────────────────

export async function getGroupDetail(
  groupId: string,
): Promise<GroupDetail | null> {
  const { supabase, userId } = await requireUser();

  // Fetch group (RLS ensures only members can see it)
  const { data: group } = await supabase
    .from("groups")
    .select("*")
    .eq("id", groupId)
    .single();

  if (!group) return null;

  // Fetch members with profiles
  const { data: members } = await supabase
    .from("group_members")
    .select("*, profile:profiles(*)")
    .eq("group_id", groupId)
    .order("joined_at", { ascending: true });

  const typedMembers = (members ?? []) as GroupMemberWithProfile[];

  // Find my role
  const myMembership = typedMembers.find((m) => m.user_id === userId);
  if (!myMembership) return null;

  return {
    ...(group as Group),
    members: typedMembers,
    my_role: myMembership.role,
  };
}

// ── Get group collective attendance ────────────────────────
// Returns a map of artistId → list of member profiles who are attending

export async function getGroupAttendance(
  groupId: string,
): Promise<Record<string, Profile[]>> {
  const { supabase } = await requireUser();

  // Fetch all members
  const { data: members } = await supabase
    .from("group_members")
    .select("user_id, profile:profiles(*)")
    .eq("group_id", groupId);

  if (!members || members.length === 0) return {};

  const profileMap = new Map<string, Profile>();
  const memberIds: string[] = [];

  for (const m of members) {
    memberIds.push(m.user_id);
    if (m.profile) {
      profileMap.set(m.user_id, m.profile as unknown as Profile);
    }
  }

  // Fetch attendance for all members (RLS allows via group membership)
  const { data: attendance } = await supabase
    .from("attendance")
    .select("user_id, artist_id")
    .in("user_id", memberIds);

  if (!attendance) return {};

  const result: Record<string, Profile[]> = {};

  for (const row of attendance) {
    const profile = profileMap.get(row.user_id);
    if (!profile) continue;

    if (!result[row.artist_id]) {
      result[row.artist_id] = [];
    }
    result[row.artist_id].push(profile);
  }

  return result;
}
