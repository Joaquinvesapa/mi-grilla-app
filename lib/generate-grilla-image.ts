import type { GridDay, GridArtist } from "./schedule-types";

import { createLogoSvg, LOGO_ASPECT_RATIO } from "./logo-svg";

// ============================================================
// Image dimensions — iPhone Pro Max native resolution (19.5:9)
// Retina-sharp at 3x, perfect for lock screen wallpaper
// ============================================================
const IMG_WIDTH = 1290;
const IMG_HEIGHT = 2796;
const PADDING_X = 50;

// ============================================================
// iPhone lock screen safe zones (at 3x resolution)
// SAFE_TOP: below status bar + date + clock (~21% from top)
// SAFE_BOTTOM: above home indicator + flashlight/camera (~12% from bottom)
// ============================================================
const SAFE_TOP = 520;
const SAFE_BOTTOM = 330;

// ============================================================
// Layout constants — scaled ~1.2x from 1080 base for 1290 res
// ============================================================
const LOGO_WIDTH = 442;
const LOGO_HEIGHT = Math.round(LOGO_WIDTH / LOGO_ASPECT_RATIO);
const DAY_LABEL_FONT_SIZE = 62;
const HEADER_ROW_HEIGHT = LOGO_HEIGHT; // logo + day label share this row
const STAGE_HEADER_HEIGHT = 94;
const TIME_AXIS_WIDTH = 144;
const CARD_GAP = 3; // px gap between artist cards
const CARD_BORDER_LEFT = 3; // left accent border width — matches screen border-l-2

// ============================================================
// Color configurations — matching globals.css tokens
// ============================================================
interface ImageColors {
  background: string;
  foreground: string;
  gridBg: string;
  gridCell: string;
  gridCellForeground: string;
  gridLine: string;
  gridBorder: string;
  gridTime: string;
  gridText: string;
  gridTextMuted: string;
  gridTextDimmed: string; // very faded — non-selected artist names
  gridHeaderBg: string;
  gridHeaderForeground: string;
  logoMain: string;
  logoDetail: string;
}

const LIGHT_COLORS: ImageColors = {
  background: "#fee4c7",
  foreground: "#1a1a1a",
  gridBg: "#faf7f4",
  gridCell: "#ffffff",
  gridCellForeground: "#000000",
  gridLine: "rgba(0, 0, 0, 0.08)",
  gridBorder: "rgba(0, 0, 0, 0.10)",
  gridTime: "rgba(0, 0, 0, 0.50)",
  gridText: "#2a2a2a",
  gridTextMuted: "rgba(0, 0, 0, 0.45)",
  gridTextDimmed: "rgba(0, 0, 0, 0.28)",
  gridHeaderBg: "#f2ede8",
  gridHeaderForeground: "#000000",
  logoMain: "#1a1a1a",
  logoDetail: "#fee4c7",
};

const DARK_COLORS: ImageColors = {
  background: "#0f0f0f",
  foreground: "#f0ece8",
  gridBg: "#0d0d1a",
  gridCell: "#1c1c1c",
  gridCellForeground: "#f0ece8",
  gridLine: "rgba(255, 255, 255, 0.08)",
  gridBorder: "rgba(255, 255, 255, 0.10)",
  gridTime: "rgba(255, 255, 255, 0.65)",
  gridText: "#ffffff",
  gridTextMuted: "rgba(255, 255, 255, 0.55)",
  gridTextDimmed: "rgba(255, 255, 255, 0.28)",
  gridHeaderBg: "#141414",
  gridHeaderForeground: "#f0ece8",
  logoMain: "#f0ece8",
  logoDetail: "#0f0f0f",
};

/** Accent color per day label */
const DAY_ACCENT_COLORS: Record<string, string> = {
  Viernes: "#0cbba5",
  "S\u00e1bado": "#ddc98a",
  Domingo: "#e85555",
};

/** Solid stage background for SELECTED artist cards */
const STAGE_SELECTED_BG: Record<string, string> = {
  "Flow Stage": "rgb(7, 184, 156)",
  "Samsung Stage": "rgb(221, 201, 138)",
  "Alternative Stage": "rgb(232, 85, 85)",
  "Perry's Stage": "rgb(240, 45, 125)",
  KidzaPalooza: "rgb(212, 236, 42)",
};

/** Semi-transparent stage background for NON-selected artist cards — very subtle */
const STAGE_DEFAULT_BG: Record<string, string> = {
  "Flow Stage": "rgba(7, 184, 156, 0.07)",
  "Samsung Stage": "rgba(221, 201, 138, 0.07)",
  "Alternative Stage": "rgba(232, 85, 85, 0.05)",
  "Perry's Stage": "rgba(240, 45, 125, 0.05)",
  KidzaPalooza: "rgba(212, 236, 42, 0.04)",
};

/** Left border accent — selected */
const STAGE_SELECTED_BORDER: Record<string, string> = {
  "Flow Stage": "rgb(10, 220, 186)",
  "Samsung Stage": "rgb(240, 220, 155)",
  "Alternative Stage": "rgb(245, 105, 105)",
  "Perry's Stage": "rgb(250, 65, 145)",
  KidzaPalooza: "rgb(225, 245, 65)",
};

/** Left border accent — non-selected — barely visible */
const STAGE_DEFAULT_BORDER: Record<string, string> = {
  "Flow Stage": "rgba(7, 184, 156, 0.20)",
  "Samsung Stage": "rgba(221, 201, 138, 0.20)",
  "Alternative Stage": "rgba(232, 85, 85, 0.15)",
  "Perry's Stage": "rgba(240, 45, 125, 0.15)",
  KidzaPalooza: "rgba(212, 236, 42, 0.12)",
};

// ============================================================
// Canvas helpers
// ============================================================

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

/** Load an SVG string as an Image ready for drawImage */
function loadSvgImage(svgString: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load SVG logo"));
    };
    img.src = url;
  });
}

/** Resolve the actual font-family string from a Tailwind class name */
function resolveFont(className: string): string {
  const el = document.createElement("span");
  el.className = className;
  el.style.position = "absolute";
  el.style.visibility = "hidden";
  document.body.appendChild(el);
  const font = getComputedStyle(el).fontFamily;
  document.body.removeChild(el);
  return font;
}

/** Truncate text to fit within maxWidth, adding "..." if needed */
function truncateText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let truncated = text;
  while (
    truncated.length > 1 &&
    ctx.measureText(truncated + "\u2026").width > maxWidth
  ) {
    truncated = truncated.slice(0, -1);
  }
  return truncated + "\u2026";
}

/**
 * Format minutes as time label for the grid axis.
 * Full hours → "XX HS" | Half hours → "XX:30"
 */
function formatTimeLabel(totalMinutes: number): string {
  const normalized = totalMinutes % (24 * 60);
  const h = Math.floor(normalized / 60);
  const m = normalized % 60;
  if (m === 0) {
    return `${h.toString().padStart(2, "0")} HS`;
  }
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

/**
 * Draw text centered at (x, centerY) with automatic word-wrapping.
 * Used for multi-line stage headers (e.g. "ALTERNATIVE STAGE").
 */
function drawMultilineText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  centerY: number,
  maxWidth: number,
  lineHeight: number,
) {
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = words[0];

  for (let i = 1; i < words.length; i++) {
    const testLine = currentLine + " " + words[i];
    if (ctx.measureText(testLine).width <= maxWidth) {
      currentLine = testLine;
    } else {
      lines.push(currentLine);
      currentLine = words[i];
    }
  }
  lines.push(currentLine);

  const totalHeight = lines.length * lineHeight;
  const startY = centerY - totalHeight / 2 + lineHeight / 2;

  for (let i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i], x, startY + i * lineHeight);
  }
}

// ============================================================
// Main generation function
// ============================================================

export interface GenerateGrillaImageOptions {
  day: GridDay;
  selectedArtists: Set<string>;
}

export async function generateGrillaImage(
  options: GenerateGrillaImageOptions,
): Promise<Blob> {
  const { day, selectedArtists } = options;

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
  // Block = header row (logo + day) + gap + grid, centered vertically
  const GAP_AFTER_HEADER = 30;
  const MAX_GRID_HEIGHT = 1530; // preserve previous grid height

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

  // ── 3. Logo (left-aligned in header row) ──
  const logoSvg = createLogoSvg(colors.logoMain, colors.logoDetail);
  const logoImg = await loadSvgImage(logoSvg);
  const logoX = PADDING_X;
  const logoY = headerY + (HEADER_ROW_HEIGHT - LOGO_HEIGHT) / 2;
  ctx.drawImage(logoImg, logoX, logoY, LOGO_WIDTH, LOGO_HEIGHT);

  // ── 4. Day label (right-aligned in header row) ──
  const dayAccent = DAY_ACCENT_COLORS[day.label] ?? "#07b89c";
  ctx.fillStyle = dayAccent;
  ctx.font = `400 ${DAY_LABEL_FONT_SIZE}px ${displayFont}`;
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  ctx.fillText(
    day.label.toUpperCase(),
    IMG_WIDTH - PADDING_X,
    headerY + HEADER_ROW_HEIGHT / 2,
  );

  // ── 5. Grid background ──
  ctx.fillStyle = colors.gridBg;
  roundRect(ctx, gridLeft, gridTop, gridWidth, gridHeight, 15);
  ctx.fill();

  // Grid border
  ctx.strokeStyle = colors.gridBorder;
  ctx.lineWidth = 1;
  roundRect(ctx, gridLeft, gridTop, gridWidth, gridHeight, 15);
  ctx.stroke();

  // ── 6. Stage headers ──
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

  // Stage names — scaled from 20→24px display font with word-wrap
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
      day.stages[i].name.toUpperCase(),
      x,
      y,
      maxW,
      28,
    );
  }

  // ── 7. Horizontal grid lines (every 30 min) ──
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

  // ── 8. Vertical stage separators ──
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

  // ── 9. Time axis labels — every 60 min, "XX HS" format ──
  ctx.fillStyle = colors.gridTime;
  ctx.font = `700 25px ${sansFont}`;
  ctx.textAlign = "right";
  ctx.textBaseline = "top";

  const TIME_LABEL_HEIGHT = 25; // approximate height of a label at 25px font
  for (let i = 0; i < totalSlots; i++) {
    const offset = i * 30;
    const minutes = day.bounds.startMin + offset;
    const normalized = minutes % (24 * 60);
    const m = normalized % 60;

    // Only full hours — skip half-hour slots entirely
    if (m !== 0) continue;

    const y = contentTop + offset * pxPerMin + 3;

    // Skip labels that would overflow past the grid bottom
    if (y + TIME_LABEL_HEIGHT > gridBottom) continue;

    const label = formatTimeLabel(minutes);
    ctx.fillText(label, columnsLeft - 10, y);
  }

  // ── 10. Artist cards ──
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
  // Clip to card bounds — rounded-sm scaled to 3px for higher resolution
  roundRect(ctx, x, y, w, h, 3);
  ctx.clip();

  // Fill background
  ctx.fillStyle = bgColor;
  ctx.fillRect(x, y, w, h);

  // Left accent border — border-l-2 (matches screen)
  const borderColor = isSelected
    ? (STAGE_SELECTED_BORDER[artist.stageName] ?? "rgba(255,255,255,0.50)")
    : (STAGE_DEFAULT_BORDER[artist.stageName] ?? "rgba(255,255,255,0.15)");
  ctx.fillStyle = borderColor;
  ctx.fillRect(x, y, CARD_BORDER_LEFT, h);

  // ── Text rendering ──
  // Horizontal padding: px-3 = 12px on screen, adapted for canvas
  const textX = x + CARD_BORDER_LEFT + (w - CARD_BORDER_LEFT) / 2;
  const maxTextW = w - CARD_BORDER_LEFT - 16;

  // Font sizes scaled ~1.2x from screen:
  // 24→29px (≥45min), 18→22px (≥30min), 14→17px (shorter)
  let nameFontSize = durationMin >= 45 ? 29 : durationMin >= 30 ? 22 : 17;
  // 16→19px for subtitle and time
  const subtitleFontSize = 19;
  const timeFontSize = 19;

  // Auto-shrink font for long names without spaces (e.g. "GUITARRICADELAFUENTE")
  const nameUpper = artist.name.toUpperCase();
  ctx.font = `400 ${nameFontSize}px ${displayFont}`;
  const nameWords = nameUpper.split(" ");
  const widestWord = Math.max(...nameWords.map((w) => ctx.measureText(w).width));
  if (widestWord > maxTextW) {
    nameFontSize = Math.max(12, Math.floor(nameFontSize * (maxTextW / widestWord)));
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
  if (hasTime) textBlockHeight += timeFontSize + 4;

  const textStartY = y + (h - textBlockHeight) / 2 + nameFontSize / 2;

  // Artist name — word-wrap to 2 lines max (matching screen line-clamp-2)
  drawMultilineText(
    ctx,
    truncateText(ctx, nameUpper, maxTextW * 2),
    textX,
    textStartY,
    maxTextW,
    nameFontSize + 2,
  );

  // Subtitle — screen: text-md leading-tight
  let nextTextY = textStartY + nameFontSize / 2;
  if (hasSubtitle && artist.subtitle) {
    nextTextY += subtitleFontSize + 2;
    ctx.fillStyle = isSelected ? "rgba(255,255,255,0.70)" : colors.gridTextDimmed;
    ctx.font = `400 ${subtitleFontSize}px ${sansFont}`;
    const subText = truncateText(ctx, artist.subtitle, maxTextW);
    ctx.fillText(subText, textX, nextTextY);
  }

  // Time range — screen: text-md mt-0.5 leading-tight tabular-nums
  if (hasTime) {
    nextTextY += timeFontSize + 2;
    ctx.fillStyle = isSelected ? "rgba(255,255,255,0.60)" : colors.gridTextDimmed;
    ctx.font = `500 ${timeFontSize}px ${sansFont}`;
    ctx.fillText(`${artist.startTime} \u2013 ${artist.endTime}`, textX, nextTextY);
  }

  ctx.restore();
}

// ============================================================
// Download / Share helper
// ============================================================

export async function downloadOrShareImage(
  blob: Blob,
  dayLabel: string,
): Promise<void> {
  const fileName = `migrilla-${dayLabel.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")}.jpg`;

  // Try native share on mobile
  if (navigator.share && navigator.canShare) {
    const file = new File([blob], fileName, { type: "image/jpeg" });
    const shareData = { files: [file] };

    if (navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // User cancelled share or share failed — fall through to download
      }
    }
  }

  // Desktop fallback: direct download
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
