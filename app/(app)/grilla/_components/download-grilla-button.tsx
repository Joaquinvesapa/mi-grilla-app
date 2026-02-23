"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type { GridDay } from "@/lib/schedule-types";
import {
  generateGrillaImage,
  downloadOrShareImage,
} from "@/lib/generate-grilla-image";
import { generateStoryImage } from "@/lib/generate-story-image";
import { cn } from "@/lib/utils";
import type { SocialAttendee } from "../actions";

// ── Types ───────────────────────────────────────────────────

interface DownloadGrillaButtonProps {
  days: GridDay[];
  selectedArtists: Set<string>;
  socialAttendance?: Record<string, SocialAttendee[]>;
}

type Status = "idle" | "generating" | "done" | "error";
type Format = "wallpaper" | "story";

// ── Constants ───────────────────────────────────────────────

const DAY_ACCENT_BG: Record<string, string> = {
  Viernes: "bg-day-viernes",
  "\u0053\u00e1bado": "bg-day-sabado",
  Domingo: "bg-day-domingo",
};

const DAY_ACCENT_TEXT: Record<string, string> = {
  Viernes: "text-day-viernes",
  "\u0053\u00e1bado": "text-day-sabado",
  Domingo: "text-day-domingo",
};

// ── Component ───────────────────────────────────────────────

export function DownloadGrillaButton({
  days,
  selectedArtists,
  socialAttendance,
}: DownloadGrillaButtonProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [format, setFormat] = useState<Format>("wallpaper");
  const [status, setStatus] = useState<Status>("idle");
  const [generatingDay, setGeneratingDay] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Cerrar con Escape
  useEffect(() => {
    if (!showPicker) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setShowPicker(false);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showPicker]);

  // Resetear formato al cerrar
  useEffect(() => {
    if (!showPicker) {
      const timer = setTimeout(() => setFormat("wallpaper"), 200);
      return () => clearTimeout(timer);
    }
  }, [showPicker]);

  // Convert SocialAttendee[] → string[] para el generador de imágenes
  const socialOverlay = socialAttendance
    ? Object.fromEntries(
        Object.entries(socialAttendance).map(([artistId, attendees]) => [
          artistId,
          attendees.map((a) => a.username),
        ]),
      )
    : undefined;

  const handleDownload = useCallback(
    async (dayIndex: number) => {
      const day = days[dayIndex];
      setGeneratingDay(day.label);
      setStatus("generating");

      try {
        let blob: Blob;

        if (format === "story") {
          blob = await generateStoryImage({
            day,
            selectedArtists,
            socialOverlay: undefined,
          });
        } else {
          blob = await generateGrillaImage({
            day,
            selectedArtists,
            socialOverlay,
          });
        }

        const prefix = format === "story" ? "mi-historia" : "migrilla";
        await downloadOrShareImage(blob, day.label, prefix);

        setStatus("done");
        setTimeout(() => {
          setStatus("idle");
          setShowPicker(false);
          setGeneratingDay(null);
        }, 1200);
      } catch (err) {
        console.error("Error generating image:", err);
        setStatus("error");
        setTimeout(() => {
          setStatus("idle");
          setGeneratingDay(null);
        }, 2000);
      }
    },
    [days, format, selectedArtists, socialOverlay],
  );

  return (
    <>
      {/* Botón disparador */}
      <button
        type="button"
        onClick={() => setShowPicker(true)}
        aria-label="Descargar grilla como imagen"
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
          "border transition-colors duration-150",
          "hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        )}
        style={{
          backgroundColor: "var(--color-surface)",
          borderColor: "var(--color-border)",
          color: "var(--color-foreground)",
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
      </button>

      {/* Modal */}
      {showPicker && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={() => {
            if (status !== "generating") setShowPicker(false);
          }}
          role="dialog"
          aria-modal="true"
          aria-label="Elegir formato y día para descargar"
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50" />

          {/* Tarjeta del modal */}
          <div
            ref={modalRef}
            onClick={(e) => e.stopPropagation()}
            className={cn(
              "relative z-10 w-[320px] rounded-2xl border p-6 shadow-2xl",
              "flex flex-col gap-5",
              "overscroll-contain",
            )}
            style={{
              backgroundColor: "var(--color-surface)",
              borderColor: "var(--color-border)",
            }}
          >
            {/* Header */}
            <div className="flex flex-col gap-1">
              <h3
                className="font-display text-lg uppercase tracking-wider"
                style={{ color: "var(--color-foreground)" }}
              >
                Descargar grilla
              </h3>
              <p
                className="font-sans text-sm"
                style={{ color: "var(--color-muted)" }}
              >
                Elegí el formato y el día
              </p>
            </div>

            {/* Selector de formato */}
            <div
              className="grid grid-cols-2 rounded-xl border overflow-hidden"
              style={{ borderColor: "var(--color-border)" }}
            >
              {/* Fondo de pantalla */}
              <button
                type="button"
                onClick={() => setFormat("wallpaper")}
                disabled={status === "generating"}
                aria-pressed={format === "wallpaper"}
                className={cn(
                  "flex flex-col items-center gap-1.5 px-3 py-3",
                  "font-sans text-xs font-medium transition-colors duration-150",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary",
                  "disabled:opacity-40",
                  format === "wallpaper"
                    ? "bg-primary text-white"
                    : "hover:opacity-80",
                )}
                style={
                  format !== "wallpaper"
                    ? { color: "var(--color-foreground)" }
                    : undefined
                }
              >
                {/* Ícono teléfono */}
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
                  <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                  <line x1="12" y1="18" x2="12.01" y2="18" />
                </svg>
                Fondo
              </button>

              {/* Historia de Instagram */}
              <button
                type="button"
                onClick={() => setFormat("story")}
                disabled={status === "generating"}
                aria-pressed={format === "story"}
                className={cn(
                  "flex flex-col items-center gap-1.5 px-3 py-3",
                  "font-sans text-xs font-medium transition-colors duration-150",
                  "border-l focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary",
                  "disabled:opacity-40",
                  format === "story"
                    ? "bg-primary text-white border-transparent"
                    : "hover:opacity-80",
                )}
                style={
                  format !== "story"
                    ? {
                        color: "var(--color-foreground)",
                        borderColor: "var(--color-border)",
                      }
                    : undefined
                }
              >
                {/* Ícono historia (rectángulo con gradiente típico) */}
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
                  <rect x="3" y="3" width="18" height="18" rx="4" ry="4" />
                  <circle cx="12" cy="12" r="3" />
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor" strokeWidth="0" />
                </svg>
                Historia
              </button>
            </div>

            {/* Descripción del formato seleccionado */}
            <p
              className="font-sans text-xs -mt-2"
              style={{ color: "var(--color-muted)" }}
            >
              {format === "wallpaper"
                ? "Imagen para fondo de pantalla (iPhone Pro Max)"
                : "Imagen 9:16 para historia de Instagram, siempre en modo oscuro"}
            </p>

            {/* Botones de días */}
            <div className="flex flex-col gap-2">
              {days.map((day, i) => {
                const isGenerating =
                  status === "generating" && generatingDay === day.label;
                const isDone = status === "done" && generatingDay === day.label;
                const isError =
                  status === "error" && generatingDay === day.label;
                const accentBg = DAY_ACCENT_BG[day.label] ?? "bg-primary";
                const accentText = DAY_ACCENT_TEXT[day.label] ?? "text-primary";

                return (
                  <button
                    key={day.label}
                    type="button"
                    onClick={() => handleDownload(i)}
                    disabled={status === "generating"}
                    className={cn(
                      "flex items-center justify-center gap-2 rounded-lg px-4 py-3",
                      "font-display text-sm uppercase tracking-wider",
                      "transition-[background-color,opacity,transform,border-color] duration-150",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                      "disabled:opacity-60",
                      isGenerating || isDone || isError
                        ? `${accentBg} text-white`
                        : cn(
                            "border",
                            accentText,
                            "hover:opacity-80 active:scale-[0.97]",
                          ),
                    )}
                    style={
                      !(isGenerating || isDone || isError)
                        ? { borderColor: "var(--color-border)" }
                        : undefined
                    }
                  >
                    {isGenerating && (
                      <svg
                        className="h-4 w-4 animate-spin"
                        viewBox="0 0 24 24"
                        fill="none"
                        aria-hidden="true"
                      >
                        <circle
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeDasharray="60"
                          strokeDashoffset="20"
                          strokeLinecap="round"
                        />
                      </svg>
                    )}

                    {isDone && (
                      <svg
                        className="h-4 w-4"
                        viewBox="0 0 12 12"
                        fill="none"
                        aria-hidden="true"
                      >
                        <path
                          d="M2 6.5L4.5 9L10 3"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}

                    {isGenerating
                      ? "Generando\u2026"
                      : isDone
                        ? "\u00a1Listo!"
                        : isError
                          ? "Error, intent\u00e1 de nuevo"
                          : day.label}
                  </button>
                );
              })}
            </div>

            {/* Cerrar */}
            <button
              type="button"
              onClick={() => setShowPicker(false)}
              disabled={status === "generating"}
              className={cn(
                "text-sm font-sans font-medium transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded",
                "disabled:opacity-40",
              )}
              style={{ color: "var(--color-muted)" }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </>
  );
}
