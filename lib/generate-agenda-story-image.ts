import type { GridDay } from "./schedule-types";
import { createLogoSvg, LOGO_ASPECT_RATIO } from "./logo-svg";

import {
  LOGO_WIDTH as BASE_LOGO_WIDTH,
  IMG_WIDTH as BASE_IMG_WIDTH,
  DARK_COLORS,
  DAY_ACCENT_COLORS,
  loadSvgImage,
  resolveFont,
} from "./canvas-utils";

import {
  groupByStartTime,
  calculateContentHeight,
  drawAgendaCard,
  CARD_HEIGHT_BASE,
  CARD_HEIGHT_MIN,
  CARD_GAP,
  TIME_GROUP_GAP,
  TIME_LABEL_HEIGHT,
  TIME_LABEL_GAP,
} from "./generate-agenda-image";

// ── Dimensiones Instagram Story (9:16) ─────────────────────
const STORY_WIDTH = 1080;
const STORY_HEIGHT = 1920;
const STORY_PADDING_X = 50;

// ── Escala proporcional respecto a la imagen base (1290px) ──
const SCALE = STORY_WIDTH / BASE_IMG_WIDTH; // ~0.837

// ── Header ─────────────────────────────────────────────────
const STORY_LOGO_WIDTH = Math.round(BASE_LOGO_WIDTH * SCALE);
const STORY_LOGO_HEIGHT = Math.round(STORY_LOGO_WIDTH / LOGO_ASPECT_RATIO);
const STORY_HEADER_PAD_TOP = 56;
const STORY_HEADER_PAD_BOTTOM = 48;
const STORY_HEADER_HEIGHT =
  STORY_HEADER_PAD_TOP + STORY_LOGO_HEIGHT + STORY_HEADER_PAD_BOTTOM;

// ── Footer de branding ─────────────────────────────────────
const STORY_FOOTER_HEIGHT = 160;
const STORY_FOOTER_GAP = 24;

// ── Fuentes escaladas ──────────────────────────────────────
const STORY_DAY_LABEL_FONT = Math.round(62 * SCALE);
const GAP_AFTER_HEADER = 40;

// ============================================================
// Función principal
// ============================================================

export interface GenerateAgendaStoryImageOptions {
  day: GridDay;
  selectedArtists: Set<string>;
  socialOverlay?: Record<string, string[]>;
}

export async function generateAgendaStoryImage(
  options: GenerateAgendaStoryImageOptions,
): Promise<Blob> {
  const { day, selectedArtists, socialOverlay } = options;

  // Artistas del día que el usuario va a ver, orden cronológico
  const attending = day.artists
    .filter((a) => selectedArtists.has(a.id))
    .sort((a, b) => a.startMin - b.startMin);

  if (attending.length === 0) {
    throw new Error("No hay shows seleccionados para este día");
  }

  const timeGroups = groupByStartTime(attending);

  // Las historias siempre en dark
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

  // ── 2. Cálculo de layout ───────────────────────────────────
  const availableForContent =
    STORY_HEIGHT -
    STORY_HEADER_HEIGHT -
    GAP_AFTER_HEADER -
    STORY_FOOTER_HEIGHT -
    STORY_FOOTER_GAP;

  // Búsqueda binaria para ajustar altura de cards si no entran
  let cardHeight = CARD_HEIGHT_BASE;
  let contentHeight = calculateContentHeight(timeGroups, cardHeight);

  if (contentHeight > availableForContent) {
    let lo = CARD_HEIGHT_MIN;
    let hi = CARD_HEIGHT_BASE;
    while (hi - lo > 1) {
      const mid = Math.floor((lo + hi) / 2);
      if (calculateContentHeight(timeGroups, mid) <= availableForContent) {
        lo = mid;
      } else {
        hi = mid;
      }
    }
    cardHeight = lo;
    contentHeight = calculateContentHeight(timeGroups, cardHeight);
  }

  // Centrar el bloque verticalmente en el espacio disponible
  const verticalMargin = Math.max(
    0,
    Math.round((availableForContent - contentHeight) / 2),
  );

  const contentLeft = STORY_PADDING_X;
  const contentRight = STORY_WIDTH - STORY_PADDING_X;
  const contentWidth = contentRight - contentLeft;

  let cursorY = STORY_HEADER_HEIGHT + GAP_AFTER_HEADER + verticalMargin;

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

  // ── 4. Grupos de horario + cards ──────────────────────────
  for (let g = 0; g < timeGroups.length; g++) {
    const [time, artists] = timeGroups[g];

    // Etiqueta de hora
    ctx.fillStyle = dayAccent;
    ctx.font = `700 32px ${sansFont}`;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    const labelCenterY = cursorY + TIME_LABEL_HEIGHT / 2;
    ctx.fillText(time, contentLeft, labelCenterY);

    // Línea horizontal después del label
    const labelWidth = ctx.measureText(time).width;
    ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(contentLeft + labelWidth + 16, labelCenterY);
    ctx.lineTo(contentRight, labelCenterY);
    ctx.stroke();

    cursorY += TIME_LABEL_HEIGHT + TIME_LABEL_GAP;

    // Cards de artistas
    for (let a = 0; a < artists.length; a++) {
      drawAgendaCard(ctx, {
        artist: artists[a],
        x: contentLeft,
        y: cursorY,
        width: contentWidth,
        height: cardHeight,
        colors,
        isDark: true,
        displayFont,
        sansFont,
        socialNames: socialOverlay?.[artists[a].id] ?? [],
      });

      cursorY += cardHeight;
      if (a < artists.length - 1) cursorY += CARD_GAP;
    }

    if (g < timeGroups.length - 1) {
      cursorY += TIME_GROUP_GAP;
    }
  }

  // ── 5. Footer de branding ──────────────────────────────────
  const footerTop = STORY_HEIGHT - STORY_FOOTER_HEIGHT;

  // Línea divisoria sutil
  ctx.strokeStyle = "rgba(255, 255, 255, 0.10)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(STORY_PADDING_X, footerTop + 14);
  ctx.lineTo(STORY_WIDTH - STORY_PADDING_X, footerTop + 14);
  ctx.stroke();

  // "Mi agenda del festival en" — pequeño, muted
  ctx.fillStyle = "rgba(255, 255, 255, 0.38)";
  ctx.font = `400 22px ${sansFont}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("Mi agenda del festival en", STORY_WIDTH / 2, footerTop + 52);

  // "MIGRILLA" — display font, blanco
  ctx.fillStyle = "#ffffff";
  ctx.font = `400 52px ${displayFont}`;
  ctx.fillText("MIGRILLA", STORY_WIDTH / 2, footerTop + 102);

  // "migrilla.app" — URL en el color del día
  ctx.fillStyle = dayAccent;
  ctx.font = `500 22px ${sansFont}`;
  ctx.fillText("mi-grilla-app.vercel.app", STORY_WIDTH / 2, footerTop + 140);

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
