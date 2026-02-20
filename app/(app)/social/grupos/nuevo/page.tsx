"use client";

import { useActionState } from "react";
import Link from "next/link";
import { createGroup, type CreateGroupState } from "../actions";

const inputBase =
  "w-full rounded-2xl border border-border bg-surface px-4 py-3.5 text-base text-surface-foreground placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 touch-manipulation";

const buttonPrimary =
  "w-full cursor-pointer rounded-2xl bg-primary py-3.5 text-sm font-semibold uppercase tracking-wide text-primary-foreground hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 touch-manipulation transition-[opacity,transform] duration-150";

const errorText = "text-xs text-accent-pink pl-1 pt-1";

export default function NuevoGrupoPage() {
  const [state, action, isPending] = useActionState(createGroup, null);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/social/grupos"
          className="flex h-8 w-8 items-center justify-center rounded-full text-muted hover:text-foreground hover:bg-foreground/5 transition-colors duration-150 touch-manipulation"
          aria-label="Volver a grupos"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M19 12H5" />
            <path d="M12 19l-7-7 7-7" />
          </svg>
        </Link>
        <h2 className="font-display text-lg uppercase tracking-wider text-foreground">
          Crear grupo
        </h2>
      </div>

      {/* Form */}
      <form action={action} className="flex flex-col gap-4">
        <div>
          <input
            name="name"
            type="text"
            placeholder="Nombre del grupo"
            autoComplete="off"
            autoFocus
            maxLength={40}
            className={inputBase}
          />
          {state?.fieldErrors?.name && (
            <p className={errorText}>{state.fieldErrors.name}</p>
          )}
        </div>

        {state?.error && (
          <p className="text-center text-sm text-accent-pink" role="alert">
            {state.error}
          </p>
        )}

        <button type="submit" disabled={isPending} className={buttonPrimary}>
          {isPending ? "Creando\u2026" : "Crear grupo"}
        </button>
      </form>

      <p className="text-center text-xs text-muted">
        Se generará un código de invitación que podés compartir con tus amigos.
      </p>
    </div>
  );
}
