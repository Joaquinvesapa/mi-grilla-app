/**
 * Generate PWA icons from the guitar SVG source.
 *
 * Produces:
 *   public/icons/icon-192x192.png   — manifest icon (small)
 *   public/icons/icon-512x512.png   — manifest icon (large) + splash
 *   public/icons/icon-maskable.png  — maskable icon (512, with safe-area padding)
 *   public/icons/apple-touch-icon.png — iOS home screen (180x180)
 *
 * Run:  node scripts/generate-icons.mjs
 */

import sharp from "sharp";
import { readFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const SVG_PATH = resolve(ROOT, "public/guitar_svg.svg");
const OUT_DIR = resolve(ROOT, "public/icons");

mkdirSync(OUT_DIR, { recursive: true });

const svgBuffer = readFileSync(SVG_PATH);

// ── Standard icons ─────────────────────────────────────────
const sizes = [192, 512];

for (const size of sizes) {
  await sharp(svgBuffer)
    .resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(resolve(OUT_DIR, `icon-${size}x${size}.png`));

  console.log(`✓ icon-${size}x${size}.png`);
}

// ── Apple Touch Icon (180×180) ─────────────────────────────
await sharp(svgBuffer)
  .resize(180, 180, { fit: "contain", background: { r: 253, g: 248, b: 255, alpha: 1 } })
  .flatten({ background: { r: 253, g: 248, b: 255 } })
  .png()
  .toFile(resolve(OUT_DIR, "apple-touch-icon.png"));

console.log("✓ apple-touch-icon.png (180×180)");

// ── Maskable Icon (512×512 with safe-area padding) ─────────
// Maskable icons need ~10% padding on each side so content
// isn't clipped by adaptive icon shapes.
const maskableSize = 512;
const padding = Math.round(maskableSize * 0.1);
const innerSize = maskableSize - padding * 2;

const innerIcon = await sharp(svgBuffer)
  .resize(innerSize, innerSize, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toBuffer();

await sharp({
  create: {
    width: maskableSize,
    height: maskableSize,
    channels: 4,
    background: { r: 253, g: 248, b: 255, alpha: 1 },
  },
})
  .composite([{ input: innerIcon, gravity: "center" }])
  .png()
  .toFile(resolve(OUT_DIR, "icon-maskable.png"));

console.log("✓ icon-maskable.png (512×512, maskable with safe-area)");

console.log("\nDone! All icons generated in public/icons/");
