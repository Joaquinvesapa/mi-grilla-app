import type { GridDay, GridArtist } from "./schedule-types";

import {
  IMG_WIDTH,
  IMG_HEIGHT,
  PADDING_X,
  SAFE_TOP,
  SAFE_BOTTOM,
  HEADER_ROW_HEIGHT,
  type ImageColors,
  LIGHT_COLORS,
  DARK_COLORS,
  STAGE_SELECTED_BG,
  STAGE_DEFAULT_BG,
  STAGE_SELECTED_BORDER,
  STAGE_DEFAULT_BORDER,
  roundRect,
  resolveFont,
  truncateText,
  formatTimeLabel,
  drawMultilineText,
  drawHeader,
} from "./canvas-utils";

// Re-export for backward compatibility — download-grilla-button.tsx imports from here
export { downloadOrShareImage } from "./canvas-utils";

// ============================================================
// Grilla-specific layout constants
// ============================================================
const STAGE_HEADER_HEIGHT = 94;
const TIME_AXIS_WIDTH = 90;
const CARD_GAP = 3;
const CARD_BORDER_LEFT = 3;

// ============================================================
// Main generation function
// ============================================================

export interface GenerateGrillaImageOptions {
  day: GridDay;
  selectedArtists: Set<string>;
  /** Map of artistId → usernames of social circle attending */
  socialOverlay?: Record<string, string[]>;
}

export async function generateGrillaImage(
  options: GenerateGrillaImageOptions,
): Promise<Blob> {
  const { day, selectedArtists, socialOverlay } = options;

  // Detect dark mode from the current page
  const isDark = document.documentElement.classList.contains("dark");
  const colors = isDark ? DARK_COLORS : LIGHT_COLORS;

  // Wait for fonts to be available
  await document.fonts.ready;

  // Resolve font families
  const displayFont = resolveFont("font-display");
  const sansFont = resolveFont("font-sans");

  // Create offscreen canvas
  const canvas = document.createElement("canvas");
  canvas.width = IMG_WIDTH;
  canvas.height = IMG_HEIGHT;
  const ctx = canvas.getContext("2d")!;

  // ── 1. Background ──
  ctx.fillStyle = colors.background;
  ctx.fillRect(0, 0, IMG_WIDTH, IMG_HEIGHT);

  // ── 2. Layout — center content block within lock screen safe zone ──
  const GAP_AFTER_HEADER = 30;
  const MAX_GRID_HEIGHT = 1530;

  const safeZoneHeight = IMG_HEIGHT - SAFE_TOP - SAFE_BOTTOM;
  const gridHeight = Math.min(
    MAX_GRID_HEIGHT,
    safeZoneHeight - HEADER_ROW_HEIGHT - GAP_AFTER_HEADER,
  );
  const totalContentHeight = HEADER_ROW_HEIGHT + GAP_AFTER_HEADER + gridHeight;
  const contentMargin = Math.round((safeZoneHeight - totalContentHeight) / 2);

  const headerY = SAFE_TOP + contentMargin;
  const gridTop = headerY + HEADER_ROW_HEIGHT + GAP_AFTER_HEADER;
  const gridBottom = gridTop + gridHeight;
  const gridLeft = PADDING_X;
  const gridRight = IMG_WIDTH - PADDING_X;
  const gridWidth = gridRight - gridLeft;

  const stageCount = day.stages.length;
  const columnsLeft = gridLeft + TIME_AXIS_WIDTH;
  const columnsWidth = gridRight - columnsLeft;
  const colWidth = columnsWidth / stageCount;

  const contentTop = gridTop + STAGE_HEADER_HEIGHT;
  const contentHeight = gridHeight - STAGE_HEADER_HEIGHT;
  const pxPerMin = contentHeight / day.bounds.totalMinutes;

  // ── 3. Header (Logo + Day label) ──
  await drawHeader(ctx, headerY, day.label, colors, displayFont);

  // ── 4. Grid background ──
  ctx.fillStyle = colors.gridBg;
  roundRect(ctx, gridLeft, gridTop, gridWidth, gridHeight, 15);
  ctx.fill();

  // Grid border
  ctx.strokeStyle = colors.gridBorder;
  ctx.lineWidth = 1;
  roundRect(ctx, gridLeft, gridTop, gridWidth, gridHeight, 15);
  ctx.stroke();

  // ── 5. Stage headers ──
  // Header background
  ctx.save();
  roundRect(ctx, gridLeft, gridTop, gridWidth, STAGE_HEADER_HEIGHT, 15);
  // Clip to top rounded corners only
  ctx.rect(gridLeft, gridTop + 15, gridWidth, STAGE_HEADER_HEIGHT - 15);
  ctx.clip("evenodd");
  ctx.fillStyle = colors.gridHeaderBg;
  ctx.fillRect(gridLeft, gridTop, gridWidth, STAGE_HEADER_HEIGHT);
  ctx.restore();

  // Header bottom border
  ctx.strokeStyle = colors.gridBorder;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(gridLeft, gridTop + STAGE_HEADER_HEIGHT);
  ctx.lineTo(gridRight, gridTop + STAGE_HEADER_HEIGHT);
  ctx.stroke();

  // Stage names
  ctx.fillStyle = colors.gridHeaderForeground;
  ctx.font = `400 24px ${displayFont}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  for (let i = 0; i < stageCount; i++) {
    const x = columnsLeft + i * colWidth + colWidth / 2;
    const y = gridTop + STAGE_HEADER_HEIGHT / 2;
    const maxW = colWidth - 14;
    drawMultilineText(
      ctx,
      day.stages[i].name
        .replace(/\s*Stage\s*$/i, "")
        .trim()
        .toUpperCase(),
      x,
      y,
      maxW,
      28,
    );
  }

  // ── 6. Horizontal grid lines (every 30 min) ──
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

  // ── 7. Vertical stage separators ──
  ctx.strokeStyle = colors.gridBorder;
  ctx.lineWidth = 1;
  // Separator between time axis and first column
  ctx.beginPath();
  ctx.moveTo(columnsLeft, gridTop);
  ctx.lineTo(columnsLeft, gridBottom);
  ctx.stroke();
  // Separators between stage columns
  for (let i = 1; i < stageCount; i++) {
    const x = columnsLeft + i * colWidth;
    ctx.beginPath();
    ctx.moveTo(x, gridTop + STAGE_HEADER_HEIGHT);
    ctx.lineTo(x, gridBottom);
    ctx.stroke();
  }

  // ── 8. Time axis labels — every 60 min, "XX HS" format ──
  ctx.fillStyle = colors.gridTime;
  ctx.font = `700 25px ${sansFont}`;
  ctx.textAlign = "right";
  ctx.textBaseline = "top";

  const TIME_LABEL_HEIGHT = 25;
  for (let i = 0; i < totalSlots; i++) {
    const offset = i * 30;
    const minutes = day.bounds.startMin + offset;
    const normalized = minutes % (24 * 60);
    const m = normalized % 60;

    // Only full hours
    if (m !== 0) continue;

    const y = contentTop + offset * pxPerMin + 3;

    // Skip labels that would overflow
    if (y + TIME_LABEL_HEIGHT > gridBottom) continue;

    const label = formatTimeLabel(minutes);
    ctx.fillText(label, columnsLeft - 10, y);
  }

  // ── 9. Artist cards ──
  // Sort: draw non-selected first, then selected on top
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

  // ── Convert to blob ──
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

// ============================================================
// Artist card drawing
// ============================================================

interface DrawCardOptions {
  artist: GridArtist;
  isSelected: boolean;
  contentTop: number;
  columnsLeft: number;
  colWidth: number;
  pxPerMin: number;
  boundsStart: number;
  colors: ImageColors;
  displayFont: string;
  sansFont: string;
  gridBottom: number;
  socialNames: string[];
}

function drawArtistCard(ctx: CanvasRenderingContext2D, opts: DrawCardOptions) {
  const {
    artist,
    isSelected,
    contentTop,
    columnsLeft,
    colWidth,
    pxPerMin,
    boundsStart,
    colors,
    displayFont,
    sansFont,
    gridBottom,
  } = opts;

  const x = columnsLeft + artist.stageIndex * colWidth + CARD_GAP;
  const y = contentTop + (artist.startMin - boundsStart) * pxPerMin + CARD_GAP;
  const w = colWidth - CARD_GAP * 2;
  const h = (artist.endMin - artist.startMin) * pxPerMin - CARD_GAP * 2;

  // Don't draw if card is outside visible area
  if (y + h < contentTop || y > gridBottom) return;

  const durationMin = artist.endMin - artist.startMin;

  // Card background
  const bgColor = isSelected
    ? (STAGE_SELECTED_BG[artist.stageName] ?? "rgba(255,255,255,0.25)")
    : (STAGE_DEFAULT_BG[artist.stageName] ?? "rgba(255,255,255,0.08)");

  ctx.save();
  roundRect(ctx, x, y, w, h, 3);
  ctx.clip();

  // Fill background
  ctx.fillStyle = bgColor;
  ctx.fillRect(x, y, w, h);

  // Left accent border
  const borderColor = isSelected
    ? (STAGE_SELECTED_BORDER[artist.stageName] ?? "rgba(255,255,255,0.50)")
    : (STAGE_DEFAULT_BORDER[artist.stageName] ?? "rgba(255,255,255,0.15)");
  ctx.fillStyle = borderColor;
  ctx.fillRect(x, y, CARD_BORDER_LEFT, h);

  // ── Text rendering ──
  const textX = x + CARD_BORDER_LEFT + (w - CARD_BORDER_LEFT) / 2;
  const maxTextW = w - CARD_BORDER_LEFT - 16;

  let nameFontSize = durationMin >= 45 ? 29 : durationMin >= 30 ? 22 : 17;
  const subtitleFontSize = 19;
  const timeFontSize = 19;

  // Auto-shrink font for long names without spaces
  const nameUpper = artist.name.toUpperCase();
  ctx.font = `400 ${nameFontSize}px ${displayFont}`;
  const nameWords = nameUpper.split(" ");
  const widestWord = Math.max(
    ...nameWords.map((w) => ctx.measureText(w).width),
  );
  if (widestWord > maxTextW) {
    nameFontSize = Math.max(
      12,
      Math.floor(nameFontSize * (maxTextW / widestWord)),
    );
    ctx.font = `400 ${nameFontSize}px ${displayFont}`;
  }

  const nameColor = isSelected ? "#ffffff" : colors.gridTextDimmed;
  ctx.fillStyle = nameColor;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const hasTime = durationMin >= 40;
  const hasSubtitle = !!artist.subtitle && durationMin >= 45;

  // Calculate vertical text block height for centering
  let textBlockHeight = nameFontSize;
  if (hasSubtitle) textBlockHeight += subtitleFontSize + 4;
  if (hasTime) textBlockHeight += timeFontSize + 8;

  const textStartY = y + (h - textBlockHeight) / 2 + nameFontSize / 2;

  // Artist name — word-wrap to 2 lines max
  drawMultilineText(
    ctx,
    truncateText(ctx, nameUpper, maxTextW * 2),
    textX,
    textStartY,
    maxTextW,
    nameFontSize + 2,
  );

  // Subtitle
  let nextTextY = textStartY + nameFontSize / 2;
  if (hasSubtitle && artist.subtitle) {
    nextTextY += subtitleFontSize + 2;
    ctx.fillStyle = isSelected
      ? "rgba(255,255,255,0.70)"
      : colors.gridTextDimmed;
    ctx.font = `400 ${subtitleFontSize}px ${sansFont}`;
    const subText = truncateText(ctx, artist.subtitle, maxTextW);
    ctx.fillText(subText, textX, nextTextY);
  }

  // Time range
  if (hasTime) {
    nextTextY += timeFontSize + 6;
    ctx.fillStyle = isSelected
      ? "rgba(255,255,255,0.95)"
      : colors.gridTextDimmed;
    ctx.font = `${isSelected ? 800 : 700} ${timeFontSize}px ${sansFont}`;
    ctx.fillText(
      `${artist.startTime} \u2013 ${artist.endTime}`,
      textX,
      nextTextY,
    );
  }

  // ── Social badge: show how many from your circle are also attending ──
  const socialCount = opts.socialNames.length;
  if (socialCount > 0 && h >= 35) {
    const badgeFontSize = 16;
    const badgeText = `${socialCount}`;
    ctx.font = `800 ${badgeFontSize}px ${sansFont}`;
    const badgeTextW = ctx.measureText(badgeText).width;

    // Two-dot people indicator + count
    const dotR = 4;
    const iconW = dotR * 3.5;
    const padX = 7;
    const padY = 4;
    const pillW = padX + iconW + 5 + badgeTextW + padX;
    const pillH = badgeFontSize + padY * 2;
    const pillX = x + w - pillW - 5;
    const pillY = y + 5;

    // Badge background
    ctx.fillStyle = isSelected
      ? "rgba(255,255,255,0.28)"
      : "rgba(255,255,255,0.12)";
    roundRect(ctx, pillX, pillY, pillW, pillH, pillH / 2);
    ctx.fill();

    const iconColor = isSelected ? "#ffffff" : "rgba(255,255,255,0.70)";

    // People indicator: two offset circles (heads)
    ctx.fillStyle = iconColor;
    ctx.beginPath();
    ctx.arc(
      pillX + padX + dotR,
      pillY + pillH / 2 + 1,
      dotR,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.beginPath();
    ctx.arc(
      pillX + padX + dotR * 2.2,
      pillY + pillH / 2 - 1,
      dotR * 0.75,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    // Count text
    ctx.fillStyle = isSelected ? "#ffffff" : "rgba(255,255,255,0.70)";
    ctx.font = `800 ${badgeFontSize}px ${sansFont}`;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(badgeText, pillX + padX + iconW + 5, pillY + pillH / 2);
  }

  ctx.restore();
}
