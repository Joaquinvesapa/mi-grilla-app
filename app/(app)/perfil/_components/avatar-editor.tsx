"use client";

import { useState, useRef, useTransition } from "react";
import { Avatar, AVATAR_SIZE } from "@/components/avatar";
import { AVATAR_COLORS, type Profile } from "@/lib/profile-types";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import {
  updateAvatarColor,
  updateAvatarUrl,
  removeAvatarPhoto,
} from "../actions";

// ── Constants ──────────────────────────────────────────────

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

// ── Props ──────────────────────────────────────────────────

interface AvatarEditorProps {
  profile: Profile;
  googleAvatarUrl: string | null;
}

// ── Component ──────────────────────────────────────────────

export function AvatarEditor({ profile, googleAvatarUrl }: AvatarEditorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [optimisticColor, setOptimisticColor] = useState(profile.avatar);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentSrc = profile.avatar_url ?? googleAvatarUrl;
  const isBusy = isPending || isUploading;

  // ── Color change ─────────────────────────────────────────

  function handleColorChange(color: string) {
    setOptimisticColor(color);
    setError(null);
    startTransition(async () => {
      const result = await updateAvatarColor(color);
      if (!result.success) {
        setOptimisticColor(profile.avatar);
        setError(result.error ?? "Error al cambiar el color");
      }
    });
  }

  // ── Photo upload ─────────────────────────────────────────

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset so same file can be re-selected
    e.target.value = "";

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError("Formato no soportado. Usá JPG, PNG, WebP o GIF.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("La imagen es muy pesada. Máximo 2 MB.");
      return;
    }

    setError(null);
    setIsUploading(true);

    try {
      const supabase = createClient();
      const filePath = `${profile.id}/avatar`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true, contentType: file.type });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      const publicUrl = `${data.publicUrl}?t=${Date.now()}`;

      startTransition(async () => {
        const result = await updateAvatarUrl(publicUrl);
        if (!result.success) {
          setError(result.error ?? "Error al guardar la foto");
        }
      });
    } catch (err) {
      console.error("Avatar upload error:", err);
      setError("No se pudo subir la imagen. Intentá de nuevo.");
    } finally {
      setIsUploading(false);
    }
  }

  // ── Photo remove ─────────────────────────────────────────

  function handleRemovePhoto() {
    setError(null);
    startTransition(async () => {
      const result = await removeAvatarPhoto();
      if (!result.success) {
        setError(result.error ?? "Error al eliminar la foto");
      }
    });
  }

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Avatar with edit overlay */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="group relative touch-manipulation"
        aria-label="Editar avatar"
        aria-expanded={isOpen}
      >
        <Avatar
          username={profile.username}
          color={optimisticColor}
          src={currentSrc}
          size={AVATAR_SIZE.XL}
          className={cn(
            "ring-4 ring-primary ring-offset-2 ring-offset-background transition-opacity duration-150",
            isBusy && "opacity-50",
          )}
        />

        {/* Edit badge */}
        <span
          className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md transition-transform duration-150 group-hover:scale-110"
          aria-hidden="true"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
            <path d="m15 5 4 4" />
          </svg>
        </span>

        {/* Loading spinner */}
        {isBusy && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
          </div>
        )}
      </button>

      {/* Editor panel */}
      {isOpen && (
        <div className="flex w-full max-w-xs flex-col gap-4 rounded-2xl border border-border bg-surface p-4">
          {/* Color picker */}
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-foreground/70 pl-1">
              Color de avatar
            </span>
            <div className="flex items-center justify-center gap-3">
              {AVATAR_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => handleColorChange(color)}
                  disabled={isBusy}
                  aria-label={`Elegir color ${color}`}
                  aria-pressed={optimisticColor === color}
                  className={cn(
                    "h-10 w-10 rounded-full transition-all duration-150 touch-manipulation",
                    optimisticColor === color
                      ? "scale-110 ring-2 ring-foreground ring-offset-2 ring-offset-surface"
                      : "opacity-60 hover:scale-105 hover:opacity-100",
                    isBusy && "cursor-not-allowed",
                  )}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-border" />

          {/* Photo actions */}
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-foreground/70 pl-1">
              Foto de perfil
            </span>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={handleFileChange}
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isBusy}
              className="w-full rounded-xl border border-border bg-surface py-2.5 text-sm font-medium text-surface-foreground hover:border-primary/30 hover:text-primary active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-150 touch-manipulation"
            >
              {isUploading ? "Subiendo…" : "Subir foto"}
            </button>

            {profile.avatar_url && (
              <button
                type="button"
                onClick={handleRemovePhoto}
                disabled={isBusy}
                className="w-full rounded-xl border border-border bg-surface py-2.5 text-sm font-medium text-muted hover:text-accent-pink hover:border-accent-pink/30 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-150 touch-manipulation"
              >
                Quitar foto
              </button>
            )}
          </div>

          {/* Error */}
          {error && (
            <p className="text-center text-xs text-accent-pink" role="alert">
              {error}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
