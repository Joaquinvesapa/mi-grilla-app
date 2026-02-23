"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

type Platform =
  | "ios-safari"
  | "ios-other"
  | "android-chromium"
  | "standalone"
  | "unknown";

// ── Constants ──────────────────────────────────────────────

const DISMISS_KEY = "pwa-install-dismissed";
const DISMISS_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// ── Helpers ────────────────────────────────────────────────

function detectPlatform(): Platform {
  if (typeof window === "undefined") return "unknown";

  // Already installed as PWA
  if (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in window.navigator &&
      (window.navigator as Navigator & { standalone?: boolean }).standalone)
  ) {
    return "standalone";
  }

  const ua = window.navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

  if (isIOS) {
    // Safari on iOS: no "CriOS", no "FxiOS", no "OPiOS", no "brave"
    const isSafari =
      /Safari/.test(ua) &&
      !/CriOS|FxiOS|OPiOS|EdgiOS|BraveIO/i.test(ua) &&
      !/Chrome/.test(ua);
    return isSafari ? "ios-safari" : "ios-other";
  }

  // Android / Desktop Chromium — beforeinstallprompt will fire
  return "android-chromium";
}

function isDismissed(): boolean {
  try {
    const raw = localStorage.getItem(DISMISS_KEY);
    if (!raw) return false;
    const timestamp = Number(raw);
    if (Date.now() - timestamp < DISMISS_DURATION_MS) return true;
    localStorage.removeItem(DISMISS_KEY);
    return false;
  } catch {
    return false;
  }
}

function saveDismiss(): void {
  try {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
  } catch {
    // ignore — private browsing
  }
}

// ── Icons ──────────────────────────────────────────────────

function ShareIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="inline-block h-4 w-4 align-text-bottom"
      aria-hidden="true"
    >
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <polyline points="16 6 12 2 8 6" />
      <line x1="12" y1="2" x2="12" y2="15" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

// ── Component ──────────────────────────────────────────────

export function PWAInstallPrompt() {
  const [platform, setPlatform] = useState<Platform>("unknown");
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [installing, setInstalling] = useState(false);

  // Detect platform + listen for beforeinstallprompt
  useEffect(() => {
    if (isDismissed()) return;

    const detected = detectPlatform();
    setPlatform(detected);

    // Already installed — never show
    if (detected === "standalone") return;

    // iOS — show after short delay for better UX
    if (detected === "ios-safari" || detected === "ios-other") {
      const timer = setTimeout(() => setVisible(true), 2000);
      return () => clearTimeout(timer);
    }

    // Android/Desktop — wait for the browser install event
    function handleBeforeInstall(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setVisible(true);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    return () =>
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
  }, []);

  function dismiss() {
    saveDismiss();
    setVisible(false);
  }

  async function handleInstallClick() {
    if (!deferredPrompt) return;
    setInstalling(true);

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setVisible(false);
      }
    } finally {
      setDeferredPrompt(null);
      setInstalling(false);
    }
  }

  if (!visible) return null;

  return (
    <div
      role="alert"
      className={cn(
        "fixed bottom-20 left-4 right-4 z-50 mx-auto max-w-sm",
        "rounded-2xl border border-border bg-surface p-4 shadow-lg",
        "animate-slide-in-right",
      )}
    >
      {/* Close button */}
      <button
        type="button"
        onClick={dismiss}
        aria-label="Cerrar banner de instalación"
        className="absolute right-3 top-3 rounded-full p-1 text-muted transition-colors duration-150 hover:text-foreground touch-manipulation"
      >
        <CloseIcon />
      </button>

      <div className="flex flex-col gap-3 pr-6">
        {/* Header */}
        <div className="flex items-center gap-2">
          <span className="text-xl" role="img" aria-label="Guitarra">
            🎸
          </span>
          <p className="font-display text-lg uppercase tracking-wide text-foreground">
            Instalá MiGrilla
          </p>
        </div>

        {/* ── Android / Desktop Chromium ── */}
        {platform === "android-chromium" && deferredPrompt && (
          <>
            <p className="text-sm text-muted">
              Acceso directo desde tu pantalla de inicio. Funciona offline en el
              festival.
            </p>
            <button
              type="button"
              onClick={handleInstallClick}
              disabled={installing}
              className="w-full rounded-xl bg-primary py-2.5 text-sm font-semibold uppercase tracking-wide text-primary-foreground transition-opacity duration-150 hover:opacity-90 active:scale-95 disabled:opacity-50 touch-manipulation"
            >
              {installing ? "Instalando…" : "Instalar app"}
            </button>
          </>
        )}

        {/* ── iOS Safari ── */}
        {platform === "ios-safari" && (
          <p className="text-sm leading-relaxed text-muted">
            Tocá{" "}
            <span className="inline-flex items-center gap-0.5 font-semibold text-foreground">
              Compartir <ShareIcon />
            </span>{" "}
            y después{" "}
            <span className="font-semibold text-foreground">
              &quot;Agregar a pantalla de inicio&quot;
            </span>{" "}
            para instalar la app.
          </p>
        )}

        {/* ── iOS non-Safari (Brave, Chrome, etc.) ── */}
        {platform === "ios-other" && (
          <p className="text-sm leading-relaxed text-muted">
            En iPhone, solo{" "}
            <span className="font-semibold text-foreground">Safari</span> puede
            instalar apps web. Abrí{" "}
            <span className="font-semibold text-foreground">
              MiGrilla en Safari
            </span>{" "}
            y tocá{" "}
            <span className="inline-flex items-center gap-0.5 font-semibold text-foreground">
              Compartir <ShareIcon />
            </span>{" "}
            → &quot;Agregar a pantalla de inicio&quot;.
          </p>
        )}
      </div>
    </div>
  );
}
