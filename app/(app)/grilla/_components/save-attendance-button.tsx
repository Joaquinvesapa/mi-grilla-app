"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

const STATUS = {
  IDLE: "idle",
  SAVING: "saving",
  SAVED: "saved",
  ERROR: "error",
} as const;

type SaveStatus = (typeof STATUS)[keyof typeof STATUS];

interface SaveAttendanceButtonProps {
  isDirty: boolean;
  selectedCount: number;
  onSave: () => Promise<{ success: boolean; error?: string }>;
}

export function SaveAttendanceButton({
  isDirty,
  selectedCount,
  onSave,
}: SaveAttendanceButtonProps) {
  const [status, setStatus] = useState<SaveStatus>(STATUS.IDLE);

  async function handleSave() {
    setStatus(STATUS.SAVING);

    const result = await onSave();

    if (result.success) {
      setStatus(STATUS.SAVED);
      // Reset after showing success
      setTimeout(() => setStatus(STATUS.IDLE), 1500);
    } else {
      setStatus(STATUS.ERROR);
      setTimeout(() => setStatus(STATUS.IDLE), 2500);
    }
  }

  // Only show when there are unsaved changes OR showing feedback
  if (!isDirty && status === STATUS.IDLE) return null;

  const isSaving = status === STATUS.SAVING;
  const isSaved = status === STATUS.SAVED;
  const isError = status === STATUS.ERROR;

  return (
    <div
      className="fixed right-4 z-40 flex flex-col items-end gap-2"
      style={{ bottom: "calc(5rem + var(--safe-area-bottom))" }}
    >
      <button
        type="button"
        onClick={handleSave}
        disabled={isSaving || isSaved}
        className={cn(
          "flex items-center gap-2 rounded-full px-5 py-3 font-display text-sm uppercase tracking-wider shadow-xl transition-[background-color,opacity,transform] duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
          isSaved
            ? "bg-primary text-primary-foreground"
            : isError
              ? "bg-red-500 text-white"
              : "bg-primary text-primary-foreground hover:brightness-110 active:scale-95",
          isSaving && "opacity-80",
        )}
      >
        {isSaving && (
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

        {isSaved && (
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

        {isSaving
          ? "Guardando\u2026"
          : isSaved
            ? "Guardado"
            : isError
              ? "Error, intentá de nuevo"
              : "Guardar agenda"}
      </button>
    </div>
  );
}
