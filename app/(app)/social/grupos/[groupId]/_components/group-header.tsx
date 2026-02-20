"use client";

import { useState, useTransition } from "react";
import type { GroupDetail } from "@/lib/group-types";
import { GROUP_ROLE } from "@/lib/group-types";
import { renameGroup, deleteGroup } from "../../actions";
import { useRouter } from "next/navigation";

export function GroupHeader({ group }: { group: GroupDetail }) {
  const [isCopied, setIsCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const isAdmin = group.my_role === GROUP_ROLE.ADMIN;

  async function handleCopyCode() {
    const url = `${window.location.origin}/social/grupos/join?code=${group.invite_code}`;
    await navigator.clipboard.writeText(url);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  }

  async function handleShare() {
    const url = `${window.location.origin}/social/grupos/join?code=${group.invite_code}`;
    const text = `Unite a mi grupo "${group.name}" en MiGrilla: ${url}`;

    if (navigator.share) {
      try {
        await navigator.share({ text, url });
      } catch {
        // User cancelled share
      }
    } else {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  }

  function handleRename(formData: FormData) {
    const newName = ((formData.get("name") as string) ?? "").trim();
    if (!newName || newName === group.name) {
      setIsEditing(false);
      return;
    }
    startTransition(async () => {
      await renameGroup(group.id, newName);
      setIsEditing(false);
    });
  }

  function handleDelete() {
    if (!confirm(`¿Seguro que querés eliminar "${group.name}"? Esta acción no se puede deshacer.`)) {
      return;
    }
    startTransition(async () => {
      await deleteGroup(group.id);
      router.push("/social/grupos");
    });
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Group name */}
      {isEditing ? (
        <form action={handleRename} className="flex gap-2">
          <input
            name="name"
            type="text"
            defaultValue={group.name}
            autoFocus
            maxLength={40}
            className="flex-1 rounded-xl border border-border bg-surface px-3 py-1.5 text-sm text-surface-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          />
          <button
            type="submit"
            disabled={isPending}
            className="rounded-xl bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity duration-150"
          >
            {isPending ? "…" : "Ok"}
          </button>
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="rounded-xl border border-border px-3 py-1.5 text-xs font-medium text-muted hover:text-foreground transition-colors duration-150"
          >
            ✕
          </button>
        </form>
      ) : (
        <div className="flex items-center gap-2">
          <h2 className="font-display text-xl uppercase tracking-wider text-foreground">
            {group.name}
          </h2>
          {isAdmin && (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="text-muted hover:text-primary transition-colors duration-150 touch-manipulation"
              aria-label="Renombrar grupo"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
              </svg>
            </button>
          )}
        </div>
      )}

      {/* Invite code + share */}
      <div
        className="flex items-center justify-between gap-3 rounded-2xl border border-border p-3"
        style={{ backgroundColor: "var(--color-surface)" }}
      >
        <div className="flex flex-col">
          <span className="text-[11px] text-muted uppercase tracking-wide">
            Código de invitación
          </span>
          <span className="font-mono text-lg font-bold tracking-[0.3em] text-surface-foreground">
            {group.invite_code}
          </span>
        </div>

        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={handleCopyCode}
            className="rounded-xl border border-border px-3 py-1.5 text-xs font-medium text-muted hover:text-foreground hover:border-primary/30 active:scale-95 transition-all duration-150 touch-manipulation"
          >
            {isCopied ? "Copiado ✓" : "Copiar link"}
          </button>
          <button
            type="button"
            onClick={handleShare}
            className="rounded-xl bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90 active:scale-95 transition-all duration-150 touch-manipulation"
          >
            Compartir
          </button>
        </div>
      </div>

      {/* Admin: delete group */}
      {isAdmin && (
        <button
          type="button"
          onClick={handleDelete}
          disabled={isPending}
          className="self-end text-xs text-muted hover:text-accent-pink transition-colors duration-150 touch-manipulation"
        >
          Eliminar grupo
        </button>
      )}
    </div>
  );
}
