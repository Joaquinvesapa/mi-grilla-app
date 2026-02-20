"use client";

import { useActionState } from "react";
import { updateProfile, type ProfileActionState } from "../actions";
import type { Profile } from "@/lib/profile-types";

// ── Shared styles ──────────────────────────────────────────

const inputBase =
  "w-full rounded-2xl border border-border bg-surface px-4 py-3.5 text-base text-surface-foreground placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 touch-manipulation";

const inputWithPrefix =
  "w-full rounded-2xl border border-border bg-surface pl-9 pr-4 py-3.5 text-base text-surface-foreground placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 touch-manipulation";

const buttonPrimary =
  "w-full cursor-pointer rounded-2xl bg-primary py-3.5 text-sm font-semibold uppercase tracking-wide text-primary-foreground hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 touch-manipulation transition-[opacity,transform] duration-150";

const errorText = "text-xs text-accent-pink pl-1 pt-1";
const labelText = "text-sm font-medium text-foreground/70 pl-1";

// ── Component ──────────────────────────────────────────────

export function ProfileEditForm({ profile }: { profile: Profile }) {
  const [state, action, isPending] = useActionState(updateProfile, null);

  return (
    <form action={action} className="flex w-full flex-col gap-5">
      {/* Username */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="username" className={labelText}>
          Usuario
        </label>
        <div className="relative">
          <span
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 select-none text-muted"
            aria-hidden="true"
          >
            @
          </span>
          <input
            id="username"
            name="username"
            type="text"
            defaultValue={profile.username}
            placeholder="tu_usuario"
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            className={inputWithPrefix}
          />
        </div>
        {state?.fieldErrors?.username && (
          <p className={errorText}>{state.fieldErrors.username}</p>
        )}
      </div>

      {/* Instagram */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="instagram" className={labelText}>
          Instagram{" "}
          <span className="text-muted font-normal">(opcional)</span>
        </label>
        <div className="relative">
          <span
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 select-none text-muted"
            aria-hidden="true"
          >
            @
          </span>
          <input
            id="instagram"
            name="instagram"
            type="text"
            defaultValue={profile.instagram ?? ""}
            placeholder="tu_instagram"
            autoCapitalize="none"
            spellCheck={false}
            className={inputWithPrefix}
          />
        </div>
        {state?.fieldErrors?.instagram && (
          <p className={errorText}>{state.fieldErrors.instagram}</p>
        )}
      </div>

      {/* Visibility toggle */}
      <label
        htmlFor="is_public"
        className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-surface px-4 py-3.5 touch-manipulation cursor-pointer"
      >
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-medium text-surface-foreground">
            Aparecer en Comunidad
          </span>
          <span className="text-xs text-muted">
            Otros usuarios pueden encontrarte y agregarte como amigo
          </span>
        </div>
        <input
          id="is_public"
          name="is_public"
          type="checkbox"
          defaultChecked={profile.is_public}
          className="h-5 w-5 rounded accent-primary cursor-pointer"
        />
      </label>

      {/* General error */}
      {state?.error && (
        <p className="text-center text-sm text-accent-pink" role="alert">
          {state.error}
        </p>
      )}

      {/* Success message */}
      {state?.success && (
        <p
          className="text-center text-sm text-primary font-medium"
          role="status"
        >
          Perfil actualizado
        </p>
      )}

      <button type="submit" disabled={isPending} className={buttonPrimary}>
        {isPending ? "Guardando\u2026" : "Guardar cambios"}
      </button>
    </form>
  );
}
