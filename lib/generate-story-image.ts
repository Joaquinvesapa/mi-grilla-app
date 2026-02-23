import type { GridDay } from "./schedule-types";
import { createLogoSvg, LOGO_ASPECT_RATIO } from "./logo-svg";

import {
  LOGO_WIDTH as BASE_LOGO_WIDTH,
  IMG_WIDTH as BASE_IMG_WIDTH,
  DARK_COLORS,
  DAY_ACCENT_COLORS,
  roundRect,
  loadSvgImage,
  resolveFont,
  formatTimeLabel,
  drawMultilineText,
} from "./canvas-utils";

import { drawArtistCard } from "./generate-grilla-image";

// ── Dimensiones Instagram Story (9:16) ─────────────────────
const STORY_WIDTH = 1080;
const STORY_HEIGHT = 1920;
const STORY_PADDING_X = 46;

// ── Escala proporcional respecto a la imagen base (1290px) ──
const SCALE = STORY_WIDTH / BASE_IMG_WIDTH; // ~0.837

// ── Header ─────────────────────────────────────────────────
const STORY_LOGO_WIDTH = Math.round(BASE_LOGO_WIDTH * SCALE);
const STORY_LOGO_HEIGHT = Math.round(STORY_LOGO_WIDTH / LOGO_ASPECT_RATIO);
const STORY_HEADER_PAD_TOP = 56;
const STORY_HEADER_PAD_BOTTOM = 48;
const STORY_HEADER_HEIGHT =
  STORY_HEADER_PAD_TOP + STORY_LOGO_HEIGHT + STORY_HEADER_PAD_BOTTOM;

// ── Grid ───────────────────────────────────────────────────
const STORY_STAGE_HEADER_HEIGHT = 78;
const STORY_TIME_AXIS_WIDTH = 82;

// ── Footer de branding ─────────────────────────────────────
const STORY_FOOTER_GAP = 24;
const STORY_FOOTER_HEIGHT = 160;

// ── Fuentes escaladas ──────────────────────────────────────
const STORY_DAY_LABEL_FONT = Math.round(62 * SCALE);
const STORY_STAGE_HEADER_FONT = Math.round(24 * SCALE);
const STORY_TIME_AXIS_FONT = Math.round(25 * SCALE);

// ============================================================
// Función principal
// ============================================================

export interface GenerateStoryImageOptions {
  day: GridDay;
  selectedArtists: Set<string>;
  socialOverlay?: Record<string, string[]>;
}

export async function generateStoryImage(
  options: GenerateStoryImageOptions,
): Promise<Blob> {
  const { day, selectedArtists, socialOverlay } = options;

  // Las historias siempre en dark — se ven mejor en el contexto de Instagram
  const colors = DARK_COLORS;

  await document.fonts.ready;
  const displayFont = resolveFont("font-display");
  const sansFont = resolveFont("font-sans");

  const canvas = document.createElement("canvas");
  canvas.width = STORY_WIDTH;
  canvas.height = STORY_HEIGHT;
  const ctx = canvas.getContext("2d")!;

  const dayAccent = DAY_ACCENT_COLORS[day.label] ?? "#3A86FF";

  // ── 1. Fondo ───────────────────────────────────────────────
  ctx.fillStyle = colors.background;
  ctx.fillRect(0, 0, STORY_WIDTH, STORY_HEIGHT);

  // Degradado sutil con el color del día en la parte superior
  const grad = ctx.createLinearGradient(0, 0, 0, STORY_HEIGHT * 0.45);
  grad.addColorStop(0, `${dayAccent}20`);
  grad.addColorStop(1, "transparent");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, STORY_WIDTH, STORY_HEIGHT);

  // ── 2. Layout del grid ─────────────────────────────────────
  const gridHeight =
    STORY_HEIGHT - STORY_HEADER_HEIGHT - STORY_FOOTER_HEIGHT - STORY_FOOTER_GAP;
  const gridTop = STORY_HEADER_HEIGHT;
  const gridBottom = gridTop + gridHeight;
  const gridLeft = STORY_PADDING_X;
  const gridRight = STORY_WIDTH - STORY_PADDING_X;
  const gridWidth = gridRight - gridLeft;

  const stageCount = day.stages.length;
  const columnsLeft = gridLeft + STORY_TIME_AXIS_WIDTH;
  const columnsWidth = gridRight - columnsLeft;
  const colWidth = columnsWidth / stageCount;

  const contentTop = gridTop + STORY_STAGE_HEADER_HEIGHT;
  const contentHeight = gridHeight - STORY_STAGE_HEADER_HEIGHT;
  const pxPerMin = contentHeight / day.bounds.totalMinutes;

  // ── 3. Header: Logo (izq) + día (der) ─────────────────────
  const logoSvg = createLogoSvg(colors.logoMain, colors.logoDetail);
  const logoImg = await loadSvgImage(logoSvg);
  ctx.drawImage(
    logoImg,
    STORY_PADDING_X,
    STORY_HEADER_PAD_TOP,
    STORY_LOGO_WIDTH,
    STORY_LOGO_HEIGHT,
  );

  ctx.fillStyle = dayAccent;
  ctx.font = `400 ${STORY_DAY_LABEL_FONT}px ${displayFont}`;
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  ctx.fillText(
    day.label.toUpperCase(),
    STORY_WIDTH - STORY_PADDING_X,
    STORY_HEADER_PAD_TOP + STORY_LOGO_HEIGHT / 2,
  );

  // ── 4. Fondo del grid ──────────────────────────────────────
  ctx.fillStyle = colors.gridBg;
  roundRect(ctx, gridLeft, gridTop, gridWidth, gridHeight, 12);
  ctx.fill();

  ctx.strokeStyle = colors.gridBorder;
  ctx.lineWidth = 1;
  roundRect(ctx, gridLeft, gridTop, gridWidth, gridHeight, 12);
  ctx.stroke();

  // ── 5. Encabezado de stages ────────────────────────────────
  ctx.save();
  roundRect(ctx, gridLeft, gridTop, gridWidth, STORY_STAGE_HEADER_HEIGHT, 12);
  ctx.rect(gridLeft, gridTop + 12, gridWidth, STORY_STAGE_HEADER_HEIGHT - 12);
  ctx.clip("evenodd");
  ctx.fillStyle = colors.gridHeaderBg;
  ctx.fillRect(gridLeft, gridTop, gridWidth, STORY_STAGE_HEADER_HEIGHT);
  ctx.restore();

  ctx.strokeStyle = colors.gridBorder;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(gridLeft, gridTop + STORY_STAGE_HEADER_HEIGHT);
  ctx.lineTo(gridRight, gridTop + STORY_STAGE_HEADER_HEIGHT);
  ctx.stroke();

  ctx.fillStyle = colors.gridHeaderForeground;
  ctx.font = `400 ${STORY_STAGE_HEADER_FONT}px ${displayFont}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  for (let i = 0; i < stageCount; i++) {
    const x = columnsLeft + i * colWidth + colWidth / 2;
    const y = gridTop + STORY_STAGE_HEADER_HEIGHT / 2;
    const maxW = colWidth - 12;
    drawMultilineText(
      ctx,
      day.stages[i].name
        .replace(/\s*Stage\s*$/i, "")
        .trim()
        .toUpperCase(),
      x,
      y,
      maxW,
      STORY_STAGE_HEADER_FONT + 4,
    );
  }

  // ── 6. Líneas horizontales (cada 30 min) ───────────────────
  ctx.strokeStyle = colors.gridLine;
  ctx.lineWidth = 1;
  const totalSlots = Math.floor(day.bounds.totalMinutes / 30) + 1;
  for (let i = 0; i < totalSlots; i++) {
    const offset = i * 30;
    const y = contentTop + offset * pxPerMin;
    if (y > gridBottom) break;
    ctx.beginPath();
    ctx.moveTo(gridLeft, y);
    ctx.lineTo(gridRight, y);
    ctx.stroke();
  }

  // ── 7. Separadores verticales de stages ───────────────────
  ctx.strokeStyle = colors.gridBorder;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(columnsLeft, gridTop);
  ctx.lineTo(columnsLeft, gridBottom);
  ctx.stroke();
  for (let i = 1; i < stageCount; i++) {
    const x = columnsLeft + i * colWidth;
    ctx.beginPath();
    ctx.moveTo(x, gridTop + STORY_STAGE_HEADER_HEIGHT);
    ctx.lineTo(x, gridBottom);
    ctx.stroke();
  }

  // ── 8. Etiquetas del eje de tiempo (cada 60 min) ──────────
  ctx.fillStyle = colors.gridTime;
  ctx.font = `700 ${STORY_TIME_AXIS_FONT}px ${sansFont}`;
  ctx.textAlign = "right";
  ctx.textBaseline = "top";

  for (let i = 0; i < totalSlots; i++) {
    const offset = i * 30;
    const minutes = day.bounds.startMin + offset;
    const normalized = minutes % (24 * 60);
    const m = normalized % 60;
    if (m !== 0) continue;
    const y = contentTop + offset * pxPerMin + 3;
    if (y + STORY_TIME_AXIS_FONT > gridBottom) continue;
    ctx.fillText(formatTimeLabel(minutes), columnsLeft - 8, y);
  }

  // ── 9. Cards de artistas ───────────────────────────────────
  // No-seleccionados primero, seleccionados encima
  const sortedArtists = [...day.artists].sort((a, b) => {
    const aSelected = selectedArtists.has(a.id) ? 1 : 0;
    const bSelected = selectedArtists.has(b.id) ? 1 : 0;
    return aSelected - bSelected;
  });

  for (const artist of sortedArtists) {
    const isSelected = selectedArtists.has(artist.id);
    drawArtistCard(ctx, {
      artist,
      isSelected,
      contentTop,
      columnsLeft,
      colWidth,
      pxPerMin,
      boundsStart: day.bounds.startMin,
      colors,
      displayFont,
      sansFont,
      gridBottom,
      socialNames: socialOverlay?.[artist.id] ?? [],
    });
  }

  // ── 10. Footer de branding ─────────────────────────────────
  const footerTop = gridBottom + STORY_FOOTER_GAP;

  // Línea divisoria sutil
  ctx.strokeStyle = "rgba(255, 255, 255, 0.10)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(STORY_PADDING_X, footerTop + 14);
  ctx.lineTo(STORY_WIDTH - STORY_PADDING_X, footerTop + 14);
  ctx.stroke();

  // "Armá la tuya en" — pequeño, muted
  ctx.fillStyle = "rgba(255, 255, 255, 0.38)";
  ctx.font = `400 22px ${sansFont}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("Armá la tuya en", STORY_WIDTH / 2, footerTop + 52);

  // "MIGRILLA" — display font, blanco
  ctx.fillStyle = "#ffffff";
  ctx.font = `400 52px ${displayFont}`;
  ctx.fillText("MIGRILLA", STORY_WIDTH / 2, footerTop + 102);

  // "migrilla.app" — URL en el color del día
  ctx.fillStyle = dayAccent;
  ctx.font = `500 22px ${sansFont}`;
  ctx.fillText("migrilla.app", STORY_WIDTH / 2, footerTop + 140);

  // ── Convertir a blob ───────────────────────────────────────
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Canvas toBlob returned null"));
      },
      "image/jpeg",
      0.92,
    );
  });
}
