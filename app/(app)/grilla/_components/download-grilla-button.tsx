"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type { GridDay } from "@/lib/schedule-types";
import {
  generateGrillaImage,
  downloadOrShareImage,
} from "@/lib/generate-grilla-image";
import { cn } from "@/lib/utils";
import type { SocialAttendee } from "../actions";

interface DownloadGrillaButtonProps {
  days: GridDay[];
  selectedArtists: Set<string>;
  socialAttendance?: Record<string, SocialAttendee[]>;
}

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

type Status = "idle" | "generating" | "done" | "error";

export function DownloadGrillaButton({
  days,
  selectedArtists,
  socialAttendance,
}: DownloadGrillaButtonProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [generatingDay, setGeneratingDay] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    if (!showPicker) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setShowPicker(false);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showPicker]);

  // Convert SocialAttendee[] → string[] for the image generator
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
        const blob = await generateGrillaImage({
          day,
          selectedArtists,
          socialOverlay,
        });
        await downloadOrShareImage(blob, day.label);
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
    [days, selectedArtists, socialOverlay],
  );

  return (
    <>
      {/* Download trigger button */}
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

      {/* Day picker modal overlay */}
      {showPicker && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={() => {
            if (status !== "generating") setShowPicker(false);
          }}
          role="dialog"
          aria-modal="true"
          aria-label="Elegir d\u00eda para descargar"
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50" />

          {/* Modal card */}
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
                className="text-sm font-sans"
                style={{ color: "var(--color-muted)" }}
              >
                Elegí el día que queres descargar
              </p>
            </div>

            {/* Day buttons */}
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

            {/* Close button */}
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
