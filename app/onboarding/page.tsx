"use client";

import { useActionState, useState, useTransition } from "react";
import { createProfile, type OnboardingState } from "./actions";

// ── Shared styles (same as login for visual consistency) ───

const inputWithPrefix =
  "w-full rounded-2xl border border-border bg-surface pl-9 pr-4 py-3.5 text-base text-surface-foreground placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 touch-manipulation";

const buttonPrimary =
  "w-full cursor-pointer rounded-2xl bg-primary py-3.5 text-sm font-semibold uppercase tracking-wide text-primary-foreground hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 touch-manipulation transition-[opacity,transform] duration-150";

const errorText = "text-xs text-accent-pink pl-1 pt-1";

// ── Client-side validation ─────────────────────────────────

function validateUsernameClient(raw: string): string | null {
  if (!raw) return "Ingresá un nombre de usuario";
  if (raw.length < 3) return "Mínimo 3 caracteres";
  if (raw.length > 20) return "Máximo 20 caracteres";
  if (!/^[a-z0-9_]+$/.test(raw))
    return "Solo letras minúsculas, números y guiones bajos";
  return null;
}

// ── Page ───────────────────────────────────────────────────

export default function OnboardingPage() {
  const [state, action] = useActionState(createProfile, null);
  const [clientError, setClientError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setClientError(null);
    const raw = ((formData.get("username") as string) ?? "")
      .toLowerCase()
      .trim();

    const validationError = validateUsernameClient(raw);
    if (validationError) {
      setClientError(validationError);
      return;
    }

    startTransition(() => action(formData));
  }

  const usernameError =
    clientError ?? state?.fieldErrors?.username ?? null;

  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center gap-8 px-6 font-sans">
      {/* Brand */}
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="text-6xl" role="img" aria-label="Fiesta">
          🎉
        </span>
        <h1 className="text-4xl font-display tracking-tight text-pretty">
          ¡Bienvenido a{" "}
          <span className="text-primary">MiGrilla</span>!
        </h1>
        <p className="max-w-xs text-base text-foreground/60 text-pretty">
          Elegí un nombre de usuario para que tus amigos te encuentren.
        </p>
      </div>

      {/* Username form */}
      <form
        action={handleSubmit}
        className="flex w-full max-w-xs flex-col gap-3"
      >
        <div>
          <div className="relative">
            <span
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 select-none text-muted"
              aria-hidden="true"
            >
              @
            </span>
            <input
              aria-label="Nombre de usuario"
              name="username"
              type="text"
              placeholder="tu_usuario"
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              autoFocus
              className={inputWithPrefix}
            />
          </div>
          {usernameError && <p className={errorText}>{usernameError}</p>}
        </div>

        {/* General error */}
        {state?.error && (
          <p className="text-center text-sm text-accent-pink" role="alert">
            {state.error}
          </p>
        )}

        <button type="submit" disabled={isPending} className={buttonPrimary}>
          {isPending ? "Creando perfil\u2026" : "Empezar"}
        </button>
      </form>

      {/* Hint */}
      <p className="max-w-xs text-center text-xs text-foreground/40">
        Solo letras minúsculas, números y guiones bajos. Entre 3 y 20
        caracteres.
      </p>
    </main>
  );
}
