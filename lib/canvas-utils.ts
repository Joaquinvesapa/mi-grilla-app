import { createLogoSvg, LOGO_ASPECT_RATIO } from "./logo-svg";

// ============================================================
// Image dimensions — iPhone Pro Max native resolution (19.5:9)
// Retina-sharp at 3x, perfect for lock screen wallpaper
// ============================================================
export const IMG_WIDTH = 1290;
export const IMG_HEIGHT = 2796;
export const PADDING_X = 50;

// ============================================================
// iPhone lock screen safe zones (at 3x resolution)
// SAFE_TOP: below status bar + date + clock (~21% from top)
// SAFE_BOTTOM: above home indicator + flashlight/camera (~12% from bottom)
// ============================================================
export const SAFE_TOP = 520;
export const SAFE_BOTTOM = 330;

// ============================================================
// Logo — scaled ~1.2x from 1080 base for 1290 resolution
// ============================================================
export const LOGO_WIDTH = 442;
export const LOGO_HEIGHT = Math.round(LOGO_WIDTH / LOGO_ASPECT_RATIO);
export const DAY_LABEL_FONT_SIZE = 62;
export const HEADER_ROW_HEIGHT = LOGO_HEIGHT;

// ============================================================
// Color configurations — matching globals.css tokens
// ============================================================
export interface ImageColors {
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
  gridTextDimmed: string;
  gridHeaderBg: string;
  gridHeaderForeground: string;
  logoMain: string;
  logoDetail: string;
}

export const LIGHT_COLORS: ImageColors = {
  background: "#fdf8ff",
  foreground: "#1a1a2e",
  gridBg: "#f8f4ff",
  gridCell: "#ffffff",
  gridCellForeground: "#000000",
  gridLine: "rgba(0, 0, 0, 0.08)",
  gridBorder: "rgba(0, 0, 0, 0.10)",
  gridTime: "rgba(0, 0, 0, 0.50)",
  gridText: "#1a1a2e",
  gridTextMuted: "rgba(0, 0, 0, 0.45)",
  gridTextDimmed: "rgba(0, 0, 0, 0.28)",
  gridHeaderBg: "#f0eaf8",
  gridHeaderForeground: "#1a1a2e",
  logoMain: "#1a1a2e",
  logoDetail: "#fdf8ff",
};

export const DARK_COLORS: ImageColors = {
  background: "#0a0a14",
  foreground: "#eee8f5",
  gridBg: "#0d0d1a",
  gridCell: "#16162a",
  gridCellForeground: "#eee8f5",
  gridLine: "rgba(255, 255, 255, 0.08)",
  gridBorder: "rgba(255, 255, 255, 0.10)",
  gridTime: "rgba(255, 255, 255, 0.65)",
  gridText: "#ffffff",
  gridTextMuted: "rgba(255, 255, 255, 0.55)",
  gridTextDimmed: "rgba(255, 255, 255, 0.28)",
  gridHeaderBg: "#12122a",
  gridHeaderForeground: "#eee8f5",
  logoMain: "#eee8f5",
  logoDetail: "#0a0a14",
};

/** Accent color per day label */
export const DAY_ACCENT_COLORS: Record<string, string> = {
  Viernes: "#3A86FF",
  "S\u00e1bado": "#8338EC",
  Domingo: "#FF006E",
};

// ============================================================
// Stage color maps
// ============================================================

/** Solid stage background for SELECTED artist cards */
export const STAGE_SELECTED_BG: Record<string, string> = {
  "Flow Stage": "rgb(58, 134, 255)",
  "Samsung Stage": "rgb(138, 201, 38)",
  "Alternative Stage": "rgb(255, 0, 110)",
  "Perry's Stage": "rgb(131, 56, 236)",
  KidzaPalooza: "rgb(251, 86, 7)",
};

/** Semi-transparent stage background for NON-selected artist cards */
export const STAGE_DEFAULT_BG: Record<string, string> = {
  "Flow Stage": "rgba(58, 134, 255, 0.07)",
  "Samsung Stage": "rgba(138, 201, 38, 0.07)",
  "Alternative Stage": "rgba(255, 0, 110, 0.05)",
  "Perry's Stage": "rgba(131, 56, 236, 0.05)",
  KidzaPalooza: "rgba(251, 86, 7, 0.04)",
};

/** Left border accent — selected */
export const STAGE_SELECTED_BORDER: Record<string, string> = {
  "Flow Stage": "rgb(80, 155, 255)",
  "Samsung Stage": "rgb(163, 221, 58)",
  "Alternative Stage": "rgb(255, 50, 140)",
  "Perry's Stage": "rgb(155, 85, 245)",
  KidzaPalooza: "rgb(255, 110, 40)",
};

/** Left border accent — non-selected — barely visible */
export const STAGE_DEFAULT_BORDER: Record<string, string> = {
  "Flow Stage": "rgba(58, 134, 255, 0.20)",
  "Samsung Stage": "rgba(138, 201, 38, 0.20)",
  "Alternative Stage": "rgba(255, 0, 110, 0.15)",
  "Perry's Stage": "rgba(131, 56, 236, 0.15)",
  KidzaPalooza: "rgba(251, 86, 7, 0.12)",
};

// ============================================================
// Canvas helper functions
// ============================================================

export function roundRect(
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
export function loadSvgImage(svgString: string): Promise<HTMLImageElement> {
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
export function resolveFont(className: string): string {
  const el = document.createElement("span");
  el.className = className;
  el.style.position = "absolute";
  el.style.visibility = "hidden";
  document.body.appendChild(el);
  const font = getComputedStyle(el).fontFamily;
  document.body.removeChild(el);
  return font;
}

/** Truncate text to fit within maxWidth, adding "\u2026" if needed */
export function truncateText(
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
 * Full hours \u2192 "XX HS" | Half hours \u2192 "XX:30"
 */
export function formatTimeLabel(totalMinutes: number): string {
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
export function drawMultilineText(
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

/**
 * Draw the shared header row: Logo (left) + Day label (right).
 * Both image generators use this identical header.
 */
export async function drawHeader(
  ctx: CanvasRenderingContext2D,
  headerY: number,
  dayLabel: string,
  colors: ImageColors,
  displayFont: string,
): Promise<void> {
  // Logo
  const logoSvg = createLogoSvg(colors.logoMain, colors.logoDetail);
  const logoImg = await loadSvgImage(logoSvg);
  const logoX = PADDING_X;
  const logoY = headerY + (HEADER_ROW_HEIGHT - LOGO_HEIGHT) / 2;
  ctx.drawImage(logoImg, logoX, logoY, LOGO_WIDTH, LOGO_HEIGHT);

  // Day label — right aligned
  const dayAccent = DAY_ACCENT_COLORS[dayLabel] ?? "#3A86FF";
  ctx.fillStyle = dayAccent;
  ctx.font = `400 ${DAY_LABEL_FONT_SIZE}px ${displayFont}`;
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  ctx.fillText(
    dayLabel.toUpperCase(),
    IMG_WIDTH - PADDING_X,
    headerY + HEADER_ROW_HEIGHT / 2,
  );
}

// ============================================================
// Download / Share helper
// ============================================================

export async function downloadOrShareImage(
  blob: Blob,
  dayLabel: string,
  prefix: string = "migrilla",
): Promise<void> {
  const fileName = `${prefix}-${dayLabel
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")}.jpg`;

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
