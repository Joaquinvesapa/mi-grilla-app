"use client";

// ── Demo Perfil Page ─────────────────────────────────────────
// Client component: reads demoUser from DemoContext and
// renders a profile view — no Supabase, no server actions.

import { useState } from "react";
import Link from "next/link";
import { useDemoContext } from "@/lib/demo/demo-context";
import { Avatar, AVATAR_SIZE } from "@/components/avatar";

// ── Component ────────────────────────────────────────────────

export default function DemoPerfilPage() {
  const { demoUser } = useDemoContext();

  // ── Community toggle — visual only, does not persist ──────
  const [showInCommunity, setShowInCommunity] = useState(false);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center px-6 pt-12 pb-8 gap-8">

      {/* ── Avatar ─────────────────────────────────────── */}
      <Avatar
        username={demoUser.username}
        color={demoUser.avatar}
        src={demoUser.avatar_url}
        size={AVATAR_SIZE.XL}
      />

      {/* ── Username & Instagram ──────────────────────── */}
      <div className="flex flex-col items-center gap-1 text-center">
        <h1 className="text-3xl font-display uppercase tracking-tight text-foreground">
          @{demoUser.username}
        </h1>

        {demoUser.instagram && (
          <a
            href={`https://instagram.com/${demoUser.instagram}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Ver perfil de Instagram ${demoUser.instagram}`}
            className="flex items-center gap-1 text-sm text-muted hover:text-primary transition-colors duration-150"
          >
            {/* Instagram icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="size-3.5 shrink-0"
              aria-hidden="true"
            >
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
            </svg>
            {demoUser.instagram}
          </a>
        )}
      </div>

      {/* ── Aparecer en Comunidad toggle ──────────────── */}
      <div className="w-full max-w-xs rounded-2xl border border-border bg-surface px-5 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-semibold text-foreground">
              Aparecer en Comunidad
            </span>
            <span className="text-xs text-muted">
              {showInCommunity
                ? "Tu perfil es visible para otros"
                : "Tu perfil está oculto"}
            </span>
          </div>

          {/* Toggle button — role=switch, aria-checked reflects state */}
          <button
            type="button"
            role="switch"
            aria-checked={showInCommunity}
            aria-label="Aparecer en Comunidad"
            onClick={() => setShowInCommunity((prev) => !prev)}
            className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 touch-manipulation"
            style={{
              backgroundColor: showInCommunity
                ? "var(--color-primary)"
                : "var(--color-border)",
            }}
          >
            <span
              className="pointer-events-none inline-block size-4 rounded-full bg-white shadow transition-transform duration-200"
              style={{
                transform: showInCommunity
                  ? "translateX(1.25rem)"
                  : "translateX(0.125rem)",
              }}
            />
          </button>
        </div>
      </div>

      {/* ── Quick links ────────────────────────────────── */}
      <div className="w-full max-w-xs flex flex-col gap-3">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted px-1">
          Accesos rápidos
        </h2>

        {/* Mi Agenda */}
        <Link
          href="/demo/agenda"
          aria-label="Ir a Mi Agenda"
          className="flex items-center justify-between rounded-2xl border border-border bg-surface px-5 py-3.5 hover:bg-surface/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 active:scale-95 touch-manipulation transition-[background-color,transform] duration-150"
        >
          <span className="text-sm font-semibold text-foreground">
            Mi Agenda
          </span>
          {/* Chevron right */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="size-4 text-muted"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z"
              clipRule="evenodd"
            />
          </svg>
        </Link>

        {/* Mis Grupos */}
        <Link
          href="/demo/social/grupos"
          aria-label="Ir a Mis Grupos"
          className="flex items-center justify-between rounded-2xl border border-border bg-surface px-5 py-3.5 hover:bg-surface/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 active:scale-95 touch-manipulation transition-[background-color,transform] duration-150"
        >
          <span className="text-sm font-semibold text-foreground">
            Mis Grupos
          </span>
          {/* Chevron right */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="size-4 text-muted"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z"
              clipRule="evenodd"
            />
          </svg>
        </Link>
      </div>
    </div>
  );
}
