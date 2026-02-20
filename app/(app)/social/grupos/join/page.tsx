"use client";

import { useActionState, useTransition } from "react";
import Link from "next/link";
import { searchGroup, joinGroup, type JoinGroupState } from "../actions";

const inputBase =
  "w-full rounded-2xl border border-border bg-surface px-4 py-3.5 text-center text-xl font-mono uppercase tracking-[0.4em] text-surface-foreground placeholder:text-muted placeholder:tracking-normal placeholder:text-base placeholder:font-sans focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 touch-manipulation";

const buttonPrimary =
  "w-full cursor-pointer rounded-2xl bg-primary py-3.5 text-sm font-semibold uppercase tracking-wide text-primary-foreground hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 touch-manipulation transition-[opacity,transform] duration-150";

const errorText = "text-xs text-accent-pink pl-1 pt-1";

export default function JoinGrupoPage() {
  const [state, searchAction, isSearching] = useActionState(searchGroup, null);
  const [isJoining, startTransition] = useTransition();

  function handleJoin() {
    if (!state?.preview) return;
    startTransition(async () => {
      await joinGroup(state.preview!.id);
    });
  }

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
          Unirse a un grupo
        </h2>
      </div>

      {/* Search form */}
      <form action={searchAction} className="flex flex-col gap-4">
        <div>
          <input
            name="code"
            type="text"
            placeholder="Código de invitación"
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            maxLength={6}
            autoFocus
            className={inputBase}
          />
          {state?.fieldErrors?.code && (
            <p className={errorText}>{state.fieldErrors.code}</p>
          )}
        </div>

        {state?.error && (
          <p className="text-center text-sm text-accent-pink" role="alert">
            {state.error}
          </p>
        )}

        {!state?.preview && (
          <button
            type="submit"
            disabled={isSearching}
            className={buttonPrimary}
          >
            {isSearching ? "Buscando\u2026" : "Buscar grupo"}
          </button>
        )}
      </form>

      {/* Preview */}
      {state?.preview && (
        <div className="flex flex-col gap-4">
          <div
            className="flex flex-col items-center gap-2 rounded-2xl border border-primary/20 p-6"
            style={{ backgroundColor: "color-mix(in srgb, var(--color-primary) 5%, var(--color-surface))" }}
          >
            <span className="text-3xl" role="img" aria-label="Grupo encontrado">
              🎉
            </span>
            <p className="text-lg font-display uppercase tracking-tight text-foreground">
              {state.preview.name}
            </p>
            <p className="text-sm text-muted">
              {state.preview.member_count}{" "}
              {state.preview.member_count === 1 ? "miembro" : "miembros"}
            </p>
          </div>

          <button
            type="button"
            onClick={handleJoin}
            disabled={isJoining}
            className={buttonPrimary}
          >
            {isJoining ? "Uniéndose\u2026" : "Unirse al grupo"}
          </button>
        </div>
      )}

      <p className="text-center text-xs text-muted">
        Pedile el código de 6 caracteres al creador del grupo.
      </p>
    </div>
  );
}
