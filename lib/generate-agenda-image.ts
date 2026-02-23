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
  DAY_ACCENT_COLORS,
  STAGE_SELECTED_BG,
  STAGE_SELECTED_BORDER,
  roundRect,
  resolveFont,
  truncateText,
  drawHeader,
} from "./canvas-utils";

// ============================================================
// Agenda-specific layout constants
// ============================================================
export const CARD_HEIGHT_BASE = 116;
export const CARD_HEIGHT_MIN = 82;
export const CARD_GAP = 10;
const CARD_BORDER_LEFT = 4;
const CARD_RADIUS = 10;
export const TIME_GROUP_GAP = 28;
export const TIME_LABEL_HEIGHT = 36;
export const TIME_LABEL_GAP = 14;
const FOOTER_HEIGHT = 50;

// ============================================================
// Helpers
// ============================================================

/** Format social names — compact, for right-side display inside cards */
function formatSocialTextCompact(names: string[]): string {
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} y ${names[1]}`;
  return `${names[0]} y ${names.length - 1} más`;
}

/** Group artists by start time, preserving chronological order */
export function groupByStartTime(
  artists: GridArtist[],
): Array<[string, GridArtist[]]> {
  const groups: Array<[string, GridArtist[]]> = [];
  let currentTime = "";

  for (const artist of artists) {
    if (artist.startTime !== currentTime) {
      currentTime = artist.startTime;
      groups.push([currentTime, []]);
    }
    groups[groups.length - 1][1].push(artist);
  }

  return groups;
}

/** Calculate total content height for a given card height */
export function calculateContentHeight(
  timeGroups: Array<[string, GridArtist[]]>,
  cardHeight: number,
): number {
  let total = 0;

  for (let g = 0; g < timeGroups.length; g++) {
    const [, artists] = timeGroups[g];

    // Time label + gap to first card
    total += TIME_LABEL_HEIGHT + TIME_LABEL_GAP;

    // Cards + gaps between cards
    total += artists.length * cardHeight + (artists.length - 1) * CARD_GAP;

    // Gap between groups (not after last)
    if (g < timeGroups.length - 1) {
      total += TIME_GROUP_GAP;
    }
  }

  return total;
}

// ============================================================
// Main generation function
// ============================================================

export interface GenerateAgendaImageOptions {
  day: GridDay;
  selectedArtists: Set<string>;
  /** Map of artistId → usernames of social circle attending */
  socialOverlay?: Record<string, string[]>;
}

export async function generateAgendaImage(
  options: GenerateAgendaImageOptions,
): Promise<Blob> {
  const { day, selectedArtists, socialOverlay } = options;

  // Get attending artists for this day, sorted chronologically
  const attending = day.artists
    .filter((a) => selectedArtists.has(a.id))
    .sort((a, b) => a.startMin - b.startMin);

  if (attending.length === 0) {
    throw new Error("No shows selected for this day");
  }

  const timeGroups = groupByStartTime(attending);

  // Detect dark mode
  const isDark = document.documentElement.classList.contains("dark");
  const colors = isDark ? DARK_COLORS : LIGHT_COLORS;

  // Fonts
  await document.fonts.ready;
  const displayFont = resolveFont("font-display");
  const sansFont = resolveFont("font-sans");

  // Canvas
  const canvas = document.createElement("canvas");
  canvas.width = IMG_WIDTH;
  canvas.height = IMG_HEIGHT;
  const ctx = canvas.getContext("2d")!;

  // ── 1. Background ──
  ctx.fillStyle = colors.background;
  ctx.fillRect(0, 0, IMG_WIDTH, IMG_HEIGHT);

  // ── 2. Layout calculation ──
  const GAP_AFTER_HEADER = 40;
  const safeZoneHeight = IMG_HEIGHT - SAFE_TOP - SAFE_BOTTOM;
  const availableForContent =
    safeZoneHeight - HEADER_ROW_HEIGHT - GAP_AFTER_HEADER - FOOTER_HEIGHT;

  // Scale card height down if content doesn't fit at base size
  let cardHeight = CARD_HEIGHT_BASE;
  let contentHeight = calculateContentHeight(timeGroups, cardHeight);

  if (contentHeight > availableForContent) {
    // Binary search for optimal card height that fits
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

  // Center content vertically in safe zone
  const totalBlockHeight =
    HEADER_ROW_HEIGHT + GAP_AFTER_HEADER + contentHeight + FOOTER_HEIGHT;
  const verticalMargin = Math.max(
    0,
    Math.round((safeZoneHeight - totalBlockHeight) / 2),
  );

  const headerY = SAFE_TOP + verticalMargin;
  let cursorY = headerY + HEADER_ROW_HEIGHT + GAP_AFTER_HEADER;

  // Content area X bounds
  const contentLeft = PADDING_X;
  const contentRight = IMG_WIDTH - PADDING_X;
  const contentWidth = contentRight - contentLeft;

  // ── 3. Header (Logo + Day label) ──
  await drawHeader(ctx, headerY, day.label, colors, displayFont);

  // ── 4. Time groups + cards ──
  const dayAccent = DAY_ACCENT_COLORS[day.label] ?? "#3A86FF";

  for (let g = 0; g < timeGroups.length; g++) {
    const [time, artists] = timeGroups[g];

    // Time label
    ctx.fillStyle = dayAccent;
    ctx.font = `700 32px ${sansFont}`;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    const labelCenterY = cursorY + TIME_LABEL_HEIGHT / 2;
    ctx.fillText(time, contentLeft, labelCenterY);

    // Horizontal line after label
    const labelWidth = ctx.measureText(time).width;
    ctx.strokeStyle = isDark
      ? "rgba(255, 255, 255, 0.12)"
      : "rgba(0, 0, 0, 0.08)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(contentLeft + labelWidth + 16, labelCenterY);
    ctx.lineTo(contentRight, labelCenterY);
    ctx.stroke();

    cursorY += TIME_LABEL_HEIGHT + TIME_LABEL_GAP;

    // Artist cards
    for (let a = 0; a < artists.length; a++) {
      drawAgendaCard(ctx, {
        artist: artists[a],
        x: contentLeft,
        y: cursorY,
        width: contentWidth,
        height: cardHeight,
        colors,
        isDark,
        displayFont,
        sansFont,
        socialNames: socialOverlay?.[artists[a].id] ?? [],
      });

      cursorY += cardHeight;
      if (a < artists.length - 1) cursorY += CARD_GAP;
    }

    // Gap between groups
    if (g < timeGroups.length - 1) {
      cursorY += TIME_GROUP_GAP;
    }
  }

  // ── 5. Footer: show count (izq) + branding MiGrilla (der) ──
  const footerY = cursorY + FOOTER_HEIGHT / 2 + 8;
  const showCount = attending.length;
  const statsText = `${showCount} ${showCount === 1 ? "show" : "shows"}`;

  // Show count — left aligned
  ctx.fillStyle = colors.gridTextMuted;
  ctx.font = `500 28px ${sansFont}`;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(statsText, contentLeft, footerY);

  // App branding — right aligned, display font, day accent color
  ctx.fillStyle = dayAccent;
  ctx.font = `400 28px ${displayFont}`;
  ctx.textAlign = "right";
  ctx.fillText("MIGRILLA", contentRight, footerY);

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
// Agenda card drawing
// ============================================================

export interface DrawAgendaCardOptions {
  artist: GridArtist;
  x: number;
  y: number;
  width: number;
  height: number;
  colors: ImageColors;
  isDark: boolean;
  displayFont: string;
  sansFont: string;
  socialNames: string[];
}

export function drawAgendaCard(
  ctx: CanvasRenderingContext2D,
  opts: DrawAgendaCardOptions,
) {
  const {
    artist,
    x,
    y,
    width,
    height,
    colors,
    isDark,
    displayFont,
    sansFont,
    socialNames,
  } = opts;

  const stageBg = STAGE_SELECTED_BG[artist.stageName] ?? "rgb(58, 134, 255)";
  const borderColor =
    STAGE_SELECTED_BORDER[artist.stageName] ?? stageBg;

  ctx.save();
  roundRect(ctx, x, y, width, height, CARD_RADIUS);
  ctx.clip();

  // Card base background
  ctx.fillStyle = colors.gridCell;
  ctx.fillRect(x, y, width, height);

  // Subtle stage color overlay
  ctx.globalAlpha = isDark ? 0.10 : 0.06;
  ctx.fillStyle = stageBg;
  ctx.fillRect(x, y, width, height);
  ctx.globalAlpha = 1;

  // Left accent border
  ctx.fillStyle = borderColor;
  ctx.fillRect(x, y, CARD_BORDER_LEFT, height);

  // Subtle card outline
  ctx.strokeStyle = colors.gridBorder;
  ctx.lineWidth = 1;
  roundRect(ctx, x, y, width, height, CARD_RADIUS);
  ctx.stroke();

  // ── Text content ──
  const textLeft = x + CARD_BORDER_LEFT + 24;
  const textRight = x + width - 24;
  const maxTextWidth = width - CARD_BORDER_LEFT - 48;

  // Scale font sizes based on card height
  const isCompact = height < 98;
  const nameFontSize = isCompact ? 34 : 38;
  const infoFontSize = isCompact ? 23 : 26;
  const socialFontSize = isCompact ? 20 : 22;
  const dotRadius = isCompact ? 6 : 7;

  // ── Measure social right-side content to reserve space ──
  const hasSocial = socialNames.length > 0;
  let socialAreaWidth = 0;
  let socialDisplayText = "";

  if (hasSocial) {
    socialDisplayText = formatSocialTextCompact(socialNames);
    ctx.font = `500 ${socialFontSize}px ${sansFont}`;
    const iconWidth = socialFontSize * 0.9;
    const rawTextWidth = ctx.measureText(socialDisplayText).width;
    // Cap social area at 40% of card content width
    socialAreaWidth = Math.min(
      iconWidth + 8 + rawTextWidth,
      maxTextWidth * 0.4,
    );
  }

  const nameMaxWidth = hasSocial
    ? maxTextWidth - socialAreaWidth - 16
    : maxTextWidth;

  // Vertical centering: name + info line (social goes to the right, no extra height)
  const nameLineHeight = nameFontSize;
  const infoLineHeight = infoFontSize;
  const gapBetween = isCompact ? 8 : 12;
  const totalTextHeight = nameLineHeight + gapBetween + infoLineHeight;
  const textBaseY = y + (height - totalTextHeight) / 2;

  // Artist name — display font, uppercase
  ctx.fillStyle = colors.gridText;
  ctx.font = `400 ${nameFontSize}px ${displayFont}`;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  const nameText = truncateText(ctx, artist.name.toUpperCase(), nameMaxWidth);
  ctx.fillText(nameText, textLeft, textBaseY);

  // ── Social indicator: right-aligned on the name line ──
  if (hasSocial) {
    const socialCY = textBaseY + nameFontSize * 0.45;

    // People indicator: two offset circles (heads)
    const iconDotR = socialFontSize * 0.22;
    const maxSocialTextW = socialAreaWidth - socialFontSize * 0.9 - 8;

    // Social text — right-aligned
    ctx.fillStyle = colors.gridTextMuted;
    ctx.font = `500 ${socialFontSize}px ${sansFont}`;
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    const displayText = truncateText(ctx, socialDisplayText, maxSocialTextW);
    ctx.fillText(displayText, textRight, socialCY);

    // Icon positioned to the left of the text
    const textW = ctx.measureText(displayText).width;
    const iconBaseX = textRight - textW - 8;
    ctx.fillStyle = stageBg;
    ctx.beginPath();
    ctx.arc(iconBaseX - iconDotR * 1.2, socialCY + 1, iconDotR, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(iconBaseX + iconDotR * 0.4, socialCY - 1, iconDotR * 0.75, 0, Math.PI * 2);
    ctx.fill();
  }

  // Info line: ● Stage  ·  HH:MM – HH:MM
  const infoY = textBaseY + nameLineHeight + gapBetween;

  // Stage color dot
  ctx.fillStyle = stageBg;
  ctx.beginPath();
  ctx.arc(
    textLeft + dotRadius,
    infoY + infoLineHeight / 2,
    dotRadius,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Stage name
  ctx.fillStyle = colors.gridTextMuted;
  ctx.font = `400 ${infoFontSize}px ${sansFont}`;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  const stageText = artist.stageName;
  const stageX = textLeft + dotRadius * 2 + 10;
  ctx.fillText(stageText, stageX, infoY);

  // Separator dot
  const stageWidth = ctx.measureText(stageText).width;
  const sepX = stageX + stageWidth + 14;
  ctx.fillStyle = colors.gridBorder;
  ctx.font = `400 ${infoFontSize}px ${sansFont}`;
  ctx.fillText("\u00b7", sepX, infoY);

  // Time range
  const timeX = sepX + ctx.measureText("\u00b7").width + 14;
  ctx.fillStyle = colors.gridTextMuted;
  ctx.font = `600 ${infoFontSize}px ${sansFont}`;
  ctx.fillText(`${artist.startTime} \u2013 ${artist.endTime}`, timeX, infoY);

  ctx.restore();
}
