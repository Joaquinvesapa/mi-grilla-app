"use client";

import { useMemo, useState, useTransition } from "react";
import type { RawSchedule, RawDia, RawEscenario, RawArtista } from "@/lib/schedule-types";
import { STAGE_COLORS, STAGE_BORDER_COLORS, STAGE_SELECTED_COLORS } from "@/lib/schedule-utils";
import { seedSchedule, updateArtistTime, resetSchedule, moveArtistStage } from "../actions";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────

interface ScheduleEditorProps {
  schedule: RawSchedule;
  originalSchedule: RawSchedule;
  isFromDb: boolean;
}

interface EditingArtist {
  dayName: string;
  stageName: string;
  artist: RawArtista;
}

// ── Helpers ────────────────────────────────────────────────

/** Build a lookup key for an artist: "Viernes|Tyler, The Creator" */
function artistKey(day: string, name: string): string {
  return `${day}|${name}`;
}

/**
 * Build a map of original artist data from the static JSON.
 * Used to detect which artists have been modified (time or stage).
 */
function buildOriginalTimesMap(
  schedule: RawSchedule,
): Map<string, { inicio: string; fin: string; stageName: string }> {
  const map = new Map<string, { inicio: string; fin: string; stageName: string }>();
  for (const dia of schedule.dias) {
    for (const esc of dia.escenarios) {
      for (const art of esc.artistas) {
        map.set(artistKey(dia.dia, art.nombre), {
          inicio: art.inicio,
          fin: art.fin,
          stageName: esc.nombre,
        });
      }
    }
  }
  return map;
}

// ── Component ──────────────────────────────────────────────

export function ScheduleEditor({ schedule, originalSchedule, isFromDb }: ScheduleEditorProps) {
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [editing, setEditing] = useState<EditingArtist | null>(null);
  const [inicio, setInicio] = useState("");
  const [fin, setFin] = useState("");
  const [selectedStage, setSelectedStage] = useState("");
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [seeded, setSeeded] = useState(isFromDb);
  const [confirmReset, setConfirmReset] = useState(false);

  const activeDay = schedule.dias[activeDayIndex];

  const originalTimes = useMemo(
    () => buildOriginalTimesMap(originalSchedule),
    [originalSchedule],
  );

  /** Check if an artist's times or stage differ from the original JSON */
  function isModified(dayName: string, stageName: string, artist: RawArtista): boolean {
    const original = originalTimes.get(artistKey(dayName, artist.nombre));
    if (!original) return false;
    return (
      artist.inicio !== original.inicio ||
      artist.fin !== original.fin ||
      stageName !== original.stageName
    );
  }

  // ── Seed handler ─────────────────────────────────────────

  function handleSeed() {
    startTransition(async () => {
      const result = await seedSchedule();
      if (result.success) {
        setSeeded(true);
        setMessage({ text: "Grilla cargada en la base de datos", type: "success" });
      } else {
        setMessage({ text: result.error ?? "Error al cargar", type: "error" });
      }
    });
  }

  // ── Edit handlers ────────────────────────────────────────

  function startEdit(dayName: string, stageName: string, artist: RawArtista) {
    setEditing({ dayName, stageName, artist });
    setInicio(artist.inicio);
    setFin(artist.fin);
    setSelectedStage(stageName);
    setMessage(null);
  }

  function cancelEdit() {
    setEditing(null);
    setInicio("");
    setFin("");
    setSelectedStage("");
  }

  function handleReset() {
    if (!confirmReset) {
      setConfirmReset(true);
      return;
    }

    startTransition(async () => {
      const result = await resetSchedule();
      if (result.success) {
        setMessage({ text: "Grilla reseteada a los valores originales", type: "success" });
        setConfirmReset(false);
        window.location.reload();
      } else {
        setMessage({ text: result.error ?? "Error al resetear", type: "error" });
        setConfirmReset(false);
      }
    });
  }

  function handleSave() {
    if (!editing) return;

    const stageChanged = selectedStage !== editing.stageName;
    const timeChanged = inicio !== editing.artist.inicio || fin !== editing.artist.fin;

    // Nothing changed → close editor
    if (!stageChanged && !timeChanged) {
      setEditing(null);
      return;
    }

    startTransition(async () => {
      // ── Stage move ──
      if (stageChanged) {
        const moveResult = await moveArtistStage(
          editing.dayName,
          editing.stageName,
          selectedStage,
          editing.artist.nombre,
        );

        if (!moveResult.success) {
          setMessage({ text: moveResult.error ?? "Error al mover de escenario", type: "error" });
          return;
        }

        // ── Optimistic local state: move artist between stages ──
        const day = schedule.dias.find((d) => d.dia === editing.dayName);
        if (day) {
          const sourceStage = day.escenarios.find((e) => e.nombre === editing.stageName);
          const targetStage = day.escenarios.find((e) => e.nombre === selectedStage);
          if (sourceStage && targetStage) {
            const idx = sourceStage.artistas.findIndex((a) => a.nombre === editing.artist.nombre);
            if (idx !== -1) {
              const [moved] = sourceStage.artistas.splice(idx, 1);
              targetStage.artistas.push(moved);
            }
          }
        }
      }

      // ── Time update (use NEW stage name if stage was moved) ──
      if (timeChanged) {
        const effectiveStageName = stageChanged ? selectedStage : editing.stageName;
        const timeResult = await updateArtistTime(
          editing.dayName,
          effectiveStageName,
          editing.artist.nombre,
          inicio,
          fin,
        );

        if (!timeResult.success) {
          // Stage move already succeeded — show error but keep the stage change
          const prefix = stageChanged
            ? `Escenario actualizado, pero error en horario: `
            : "";
          setMessage({
            text: `${prefix}${timeResult.error ?? "Error al guardar horario"}`,
            type: "error",
          });
          if (stageChanged) {
            setEditing(null);
          }
          return;
        }

        // Optimistic local state: update time
        editing.artist.inicio = inicio;
        editing.artist.fin = fin;
      }

      // ── Success message ──
      const parts: string[] = [];
      if (stageChanged) parts.push(`→ ${selectedStage}`);
      if (timeChanged) parts.push(`${inicio} - ${fin}`);
      setMessage({
        text: `${editing.artist.nombre}: ${parts.join(" · ")} ✓`,
        type: "success",
      });
      setEditing(null);
    });
  }

  // ── Seed prompt ──────────────────────────────────────────

  if (!seeded) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-surface p-6 text-center">
        <svg
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-primary"
          aria-hidden="true"
        >
          <path d="M12 5v14" />
          <path d="M5 12h14" />
        </svg>
        <p className="text-sm text-foreground">
          La grilla todavía no está en la base de datos.
          <br />
          Cargala para poder editarla en vivo.
        </p>
        <button
          type="button"
          onClick={handleSeed}
          disabled={isPending}
          className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-colors duration-150 hover:bg-primary/90 disabled:opacity-50 touch-manipulation"
          aria-label="Cargar grilla en la base de datos"
        >
          {isPending ? "Cargando..." : "Cargar grilla"}
        </button>
        {message && (
          <p className={cn("text-xs", message.type === "error" ? "text-red-500" : "text-green-500")}>
            {message.text}
          </p>
        )}
      </div>
    );
  }

  // ── Main editor ──────────────────────────────────────────

  return (
    <div className="flex flex-col gap-4">
      {/* Status message */}
      {message && (
        <div
          className={cn(
            "rounded-lg px-4 py-2.5 text-sm font-medium",
            message.type === "error"
              ? "bg-red-500/10 text-red-500 border border-red-500/20"
              : "bg-green-500/10 text-green-500 border border-green-500/20",
          )}
          role="status"
        >
          {message.text}
        </div>
      )}

      {/* Day tabs */}
      <div className="flex gap-2" role="tablist" aria-label="Días del festival">
        {schedule.dias.map((day: RawDia, index: number) => (
          <button
            key={day.dia}
            type="button"
            role="tab"
            aria-selected={index === activeDayIndex}
            aria-controls={`panel-${day.dia}`}
            onClick={() => {
              setActiveDayIndex(index);
              cancelEdit();
            }}
            className={cn(
              "flex-1 rounded-lg py-2.5 text-sm font-semibold transition-colors duration-150 touch-manipulation",
              index === activeDayIndex
                ? "bg-primary text-primary-foreground"
                : "bg-surface text-muted border border-border hover:text-foreground",
            )}
          >
            {day.dia}
          </button>
        ))}
      </div>

      {/* Edit modal — fixed bottom sheet */}
      {editing && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/50"
            onClick={cancelEdit}
            aria-hidden="true"
          />

          {/* Bottom sheet */}
          <div
            className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl border-t border-border bg-surface p-5 shadow-lg"
            style={{ paddingBottom: "calc(1.25rem + var(--safe-area-bottom))" }}
            role="dialog"
            aria-label={`Editar horario de ${editing.artist.nombre}`}
            aria-modal="true"
          >
            {/* Drag handle */}
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border" aria-hidden="true" />

            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                   {/* Stage color dot */}
                  <div
                    className="h-3 w-3 shrink-0 rounded-full"
                    style={{ backgroundColor: STAGE_SELECTED_COLORS[selectedStage] ?? "var(--color-muted)" }}
                    aria-hidden="true"
                  />
                  <div>
                    <p className="text-base font-semibold text-foreground">
                      {editing.artist.nombre}
                    </p>
                    <p className="text-xs text-muted">
                      {selectedStage !== editing.stageName
                        ? `${editing.stageName} → ${selectedStage}`
                        : editing.stageName} · {editing.dayName}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-muted hover:text-foreground hover:bg-foreground/5 transition-colors duration-150 touch-manipulation"
                  aria-label="Cancelar edición"
                >
                  <svg
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
                    <path d="M18 6L6 18" />
                    <path d="M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="edit-stage" className="text-xs font-medium text-muted">
                  Escenario
                </label>
                <select
                  id="edit-stage"
                  value={selectedStage}
                  onChange={(e) => setSelectedStage(e.target.value)}
                  className="rounded-lg border border-border bg-background px-3 py-2.5 text-base text-foreground focus:border-primary focus:outline-none touch-manipulation"
                  aria-label="Escenario del artista"
                >
                  {activeDay.escenarios.map((esc: RawEscenario) => (
                    <option key={esc.nombre} value={esc.nombre}>
                      {esc.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex flex-1 flex-col gap-1.5">
                  <label htmlFor="edit-inicio" className="text-xs font-medium text-muted">
                    Inicio
                  </label>
                  <input
                    id="edit-inicio"
                    type="time"
                    value={inicio}
                    onChange={(e) => setInicio(e.target.value)}
                    className="rounded-lg border border-border bg-background px-3 py-2.5 text-base text-foreground focus:border-primary focus:outline-none touch-manipulation"
                  />
                </div>

                <div className="flex flex-1 flex-col gap-1.5">
                  <label htmlFor="edit-fin" className="text-xs font-medium text-muted">
                    Fin
                  </label>
                  <input
                    id="edit-fin"
                    type="time"
                    value={fin}
                    onChange={(e) => setFin(e.target.value)}
                    className="rounded-lg border border-border bg-background px-3 py-2.5 text-base text-foreground focus:border-primary focus:outline-none touch-manipulation"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="flex-1 rounded-lg border border-border bg-surface py-3 text-sm font-medium text-muted transition-colors duration-150 hover:text-foreground touch-manipulation"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isPending || (inicio === editing.artist.inicio && fin === editing.artist.fin && selectedStage === editing.stageName)}
                  className="flex-1 rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground transition-colors duration-150 hover:bg-primary/90 disabled:opacity-50 touch-manipulation"
                  aria-label={`Guardar cambios de ${editing.artist.nombre}`}
                >
                  {isPending ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Stages + artists list */}
      <div
        id={`panel-${activeDay.dia}`}
        role="tabpanel"
        className="flex flex-col gap-4"
      >
        {activeDay.escenarios.map((stage: RawEscenario) => {
          const stageColor = STAGE_COLORS[stage.nombre];
          const stageBorder = STAGE_BORDER_COLORS[stage.nombre];
          const stageSolid = STAGE_SELECTED_COLORS[stage.nombre];

          return (
            <div
              key={stage.nombre}
              className="rounded-xl overflow-hidden"
              style={{
                border: `1px solid ${stageBorder ?? "var(--color-border)"}`,
              }}
            >
              {/* Stage header — colored */}
              <div
                className="flex items-center gap-2 px-4 py-2.5"
                style={{
                  backgroundColor: stageColor ?? "var(--color-surface)",
                  borderBottom: `1px solid ${stageBorder ?? "var(--color-border)"}`,
                }}
              >
                <div
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: stageSolid ?? "var(--color-muted)" }}
                  aria-hidden="true"
                />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                  {stage.nombre}
                </h3>
              </div>

              {/* Artist rows */}
              <div className="divide-y divide-border bg-surface">
                {stage.artistas.map((artist: RawArtista) => {
                  const isEditingThis =
                    editing?.dayName === activeDay.dia &&
                    editing?.stageName === stage.nombre &&
                    editing?.artist.nombre === artist.nombre;
                  const modified = isModified(activeDay.dia, stage.nombre, artist);
                  const original = modified
                    ? originalTimes.get(artistKey(activeDay.dia, artist.nombre))
                    : null;

                  return (
                    <button
                      key={artist.nombre}
                      type="button"
                      onClick={() => startEdit(activeDay.dia, stage.nombre, artist)}
                      disabled={isPending}
                      className={cn(
                        "flex w-full items-center justify-between px-4 py-3 text-left transition-colors duration-150 touch-manipulation",
                        isEditingThis
                          ? "bg-primary/10"
                          : "hover:bg-foreground/[0.03] active:bg-foreground/[0.06]",
                      )}
                      aria-label={`Editar horario de ${artist.nombre}`}
                    >
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-foreground">
                            {artist.nombre}
                          </span>
                          {modified && (
                            <span
                              className="inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white"
                              style={{ backgroundColor: stageSolid ?? "var(--color-primary)" }}
                            >
                              Modificado
                            </span>
                          )}
                        </div>
                        {artist.subtitulo && (
                          <span className="text-xs text-muted">
                            {artist.subtitulo}
                          </span>
                        )}
                        {modified && original && (
                          <span className="text-[10px] text-muted line-through">
                            {original.stageName !== stage.nombre
                              ? `${original.stageName} · `
                              : ""}{original.inicio} - {original.fin}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-md bg-foreground/5 px-2.5 py-1 text-xs font-mono font-medium text-foreground tabular-nums">
                          {artist.inicio} - {artist.fin}
                        </span>
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-muted"
                          aria-hidden="true"
                        >
                          <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                        </svg>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Actions footer */}
      <div className="mt-4 flex flex-col gap-3">
        {/* Reset button */}
        <button
          type="button"
          onClick={handleReset}
          disabled={isPending}
          className={cn(
            "flex items-center justify-center gap-2 rounded-lg py-3 text-sm font-medium transition-colors duration-150 touch-manipulation",
            confirmReset
              ? "bg-red-500 text-white hover:bg-red-600"
              : "border border-red-500/30 text-red-500 hover:bg-red-500/10",
            isPending && "opacity-50",
          )}
          aria-label={confirmReset ? "Confirmar reset de la grilla" : "Resetear grilla a valores originales"}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
          </svg>
          {isPending
            ? "Reseteando..."
            : confirmReset
              ? "¿Estás seguro? Tocá de nuevo para confirmar"
              : "Resetear a valores originales"}
        </button>
        {confirmReset && !isPending && (
          <button
            type="button"
            onClick={() => setConfirmReset(false)}
            className="text-xs text-muted hover:text-foreground transition-colors duration-150 touch-manipulation"
          >
            Cancelar
          </button>
        )}

        {/* Back to grid link */}
        <a
          href="/grilla"
          className="flex items-center justify-center gap-2 rounded-lg border border-border bg-surface py-3 text-sm font-medium text-muted transition-colors duration-150 hover:text-foreground touch-manipulation"
        >
          <svg
            width="16"
            height="16"
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
          Volver a la grilla
        </a>
      </div>
    </div>
  );
}
