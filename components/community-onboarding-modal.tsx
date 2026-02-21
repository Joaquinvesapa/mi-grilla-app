"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setCommunityChoice } from "@/app/(app)/perfil/actions";
import { cn } from "@/lib/utils";

// ── Styles ─────────────────────────────────────────────────

const buttonBase =
  "w-full cursor-pointer rounded-2xl py-3.5 text-sm font-semibold uppercase tracking-wide focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 touch-manipulation transition-[opacity,transform] duration-150";

// ── Component ──────────────────────────────────────────────

export function CommunityOnboardingModal() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleChoice(wantsCommunity: boolean) {
    startTransition(async () => {
      await setCommunityChoice(wantsCommunity);
      router.refresh();
    });
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="community-modal-title"
      aria-describedby="community-modal-description"
    >
      <div className="w-full max-w-sm rounded-3xl border border-border bg-surface p-6 shadow-2xl flex flex-col items-center gap-5 text-center">
        {/* Icon */}
        <div
          className="flex h-16 w-16 items-center justify-center rounded-full"
          style={{ backgroundColor: "var(--color-primary)", opacity: 0.15 }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            style={{ color: "var(--color-primary)", opacity: 1 }}
          >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        </div>

        {/* Title */}
        <h2
          id="community-modal-title"
          className="font-display text-2xl uppercase text-surface-foreground leading-tight"
        >
          ¿Querés ser parte de la comunidad?
        </h2>

        {/* Description */}
        <p
          id="community-modal-description"
          className="text-sm leading-relaxed"
          style={{ color: "var(--color-muted)" }}
        >
          Si activás la comunidad, otros usuarios van a poder encontrarte,
          agregarte como amigo y coordinar la grilla juntos.
        </p>

        {/* Buttons */}
        <div className="w-full flex flex-col gap-3 mt-1">
          <button
            type="button"
            onClick={() => handleChoice(true)}
            disabled={isPending}
            autoFocus
            className={cn(
              buttonBase,
              "bg-primary text-primary-foreground hover:opacity-90",
            )}
          >
            {isPending ? "Guardando\u2026" : "Sí, quiero"}
          </button>

          <button
            type="button"
            onClick={() => handleChoice(false)}
            disabled={isPending}
            className={cn(
              buttonBase,
              "border border-border bg-transparent hover:opacity-70",
            )}
            style={{ color: "var(--color-muted)" }}
          >
            {isPending ? "Guardando\u2026" : "No, gracias"}
          </button>
        </div>

        {/* Note */}
        <p className="text-xs" style={{ color: "var(--color-muted)" }}>
          Siempre podés cambiar esto desde tu perfil
        </p>
      </div>
    </div>
  );
}
