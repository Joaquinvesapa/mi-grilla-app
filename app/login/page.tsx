"use client";

import { useActionState, useState, useTransition } from "react";
import {
  checkUsername,
  authenticate,
  signInWithGoogle,
  type AuthState,
} from "./actions";
import { PinInput } from "@/components/pin-input";

// ── Shared styles ──────────────────────────────────────────

const inputBase =
  "w-full rounded-2xl border border-border bg-surface px-4 py-3.5 text-base text-surface-foreground placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 touch-manipulation";

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

// ── Icons ──────────────────────────────────────────────────

function GoogleIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="20"
      height="20"
      aria-hidden="true"
    >
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

// ── Step 1: Username ───────────────────────────────────────

function UsernameStep({
  initialUsername,
  onResolved,
}: {
  initialUsername: string;
  onResolved: (username: string, isNewUser: boolean) => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    const raw = ((formData.get("username") as string) ?? "")
      .toLowerCase()
      .trim();

    const validationError = validateUsernameClient(raw);
    if (validationError) {
      setError(validationError);
      return;
    }

    startTransition(async () => {
      const available = await checkUsername(raw);
      onResolved(raw, available);
    });
  }

  return (
    <form action={handleSubmit} className="flex w-full flex-col gap-3">
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
            defaultValue={initialUsername}
            placeholder="tu_usuario"
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            className={inputWithPrefix}
          />
        </div>
        {error && <p className={errorText}>{error}</p>}
      </div>

      <button type="submit" disabled={isPending} className={buttonPrimary}>
        {isPending ? "Verificando\u2026" : "Continuar"}
      </button>
    </form>
  );
}

// ── Step 2: PIN ────────────────────────────────────────────

function PinStep({
  username,
  isNewUser,
  onBack,
}: {
  username: string;
  isNewUser: boolean;
  onBack: () => void;
}) {
  const [state, action, isPending] = useActionState(authenticate, null);

  return (
    <>
      <form action={action} className="flex w-full flex-col gap-3">
        <input type="hidden" name="username" value={username} />
        <input type="hidden" name="isNewUser" value={String(isNewUser)} />

        {/* Username badge */}
        <div className="flex flex-col items-center gap-1 text-center">
          <p className="font-display text-2xl uppercase tracking-tight text-foreground">
            @{username}
          </p>
          <p className="text-sm text-muted">
            {isNewUser ? "Elegí un PIN para tu nueva cuenta" : "Ingresá tu PIN"}
          </p>
        </div>

        {/* PIN */}
        <div className="flex flex-col items-center gap-2">
          <PinInput
            name="pin"
            autoFocus
            hasError={!!state?.fieldErrors?.pin || !!state?.error}
          />
          {state?.fieldErrors?.pin && (
            <p className={errorText}>{state.fieldErrors.pin}</p>
          )}
        </div>

        {/* General error */}
        {state?.error && (
          <p className="text-center text-sm text-accent-pink" role="alert">
            {state.error}
          </p>
        )}

        {/* Submit */}
        <button type="submit" disabled={isPending} className={buttonPrimary}>
          {isPending
            ? isNewUser
              ? "Creando cuenta\u2026"
              : "Entrando\u2026"
            : isNewUser
              ? "Crear cuenta"
              : "Entrar"}
        </button>
      </form>

      {/* Forgot PIN hint (existing users only) */}
      {!isNewUser && (
        <p className="text-center text-xs text-muted">
          ¿Olvidaste tu PIN?{" "}
          <span className="text-foreground/50">Hablá con un Admin</span>
        </p>
      )}

      {/* Back */}
      <button
        type="button"
        onClick={onBack}
        className="text-xs text-muted transition-colors duration-150 hover:text-foreground touch-manipulation"
      >
        ← Cambiar usuario
      </button>
    </>
  );
}

// ── Page ───────────────────────────────────────────────────

export default function LoginPage() {
  const [step, setStep] = useState<"username" | "pin">("username");
  const [animKey, setAnimKey] = useState(0);
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const [username, setUsername] = useState("");
  const [isNewUser, setIsNewUser] = useState(false);

  function handleUsernameResolved(name: string, available: boolean) {
    setUsername(name);
    setIsNewUser(available);
    setDirection("forward");
    setAnimKey((k) => k + 1);
    setStep("pin");
  }

  function handleBack() {
    setDirection("back");
    setAnimKey((k) => k + 1);
    setStep("username");
  }

  const animClass =
    direction === "forward"
      ? "animate-slide-in-right"
      : "animate-slide-in-left";

  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center gap-8 px-6 font-sans">
      {/* Brand */}
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="text-6xl" role="img" aria-label="Guitarra">
          🎸
        </span>
        <h1 className="text-4xl font-display tracking-tight text-pretty">
          Mi<span className="text-primary">Grilla</span>
        </h1>
        <p className="max-w-xs text-base text-foreground/60 text-pretty">
          Armá tu agenda del festival y coordiná con tus amigos.
        </p>
      </div>

      {/* Auth section */}
      <div className="flex w-full max-w-xs flex-col items-center gap-4">
        <div className="w-full overflow-hidden">
          <div key={animKey} className={animClass}>
            {step === "username" ? (
              <UsernameStep
                initialUsername={username}
                onResolved={handleUsernameResolved}
              />
            ) : (
              <PinStep
                username={username}
                isNewUser={isNewUser}
                onBack={handleBack}
              />
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="flex w-full items-center gap-4" role="separator">
          <div className="h-px flex-1 bg-border" />
          <span className="select-none text-xs text-muted">o</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        {/* Google OAuth */}
        <form action={signInWithGoogle} className="w-full">
          <button
            type="submit"
            aria-label="Continuar con Google"
            className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-2xl border border-border bg-surface px-6 py-3.5 text-sm font-semibold text-surface-foreground hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 active:scale-95 touch-manipulation transition-[opacity,transform] duration-150"
          >
            <GoogleIcon />
            Continuar con Google
          </button>
        </form>
      </div>

      {/* Legal */}
      <p className="max-w-xs text-center text-xs text-foreground/40">
        Al continuar, aceptás los términos y condiciones de MiGrilla.
      </p>

      {/* Made by */}
      <p className="absolute bottom-4 text-center text-xs text-foreground/30">
        Hecho con <span className="text-red-500">♥</span> por{" "}
        <a
          href="https://github.com/Joaquinvesapa"
          target="_blank"
          rel="noopener noreferrer"
          className="text-foreground/40 underline underline-offset-2 hover:text-foreground/70 transition-colors duration-150"
        >
          JoaquinVesapa
        </a>
      </p>
    </main>
  );
}
