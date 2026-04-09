import type { NextConfig } from "next";

// ── GitHub Pages flag ──────────────────────────────────────
const isGitHubPages = process.env.GITHUB_PAGES === "1";

// ── Security Headers ───────────────────────────────────────

const ContentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.supabase.co https://lh3.googleusercontent.com",
  "font-src 'self'",
  "connect-src 'self' https://*.supabase.co",
  "worker-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: ContentSecurityPolicy },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

// ── Config ─────────────────────────────────────────────────

const productionOrigin = process.env.NEXT_PUBLIC_SITE_URL
  ? [new URL(process.env.NEXT_PUBLIC_SITE_URL).host]
  : [];

const nextConfig: NextConfig = {
  ...(isGitHubPages && {
    output: "export",
    basePath: "/mi-grilla-app",
    trailingSlash: true,
  }),
  experimental: {
    viewTransition: true,
    ...(!isGitHubPages && {
      serverActions: {
        allowedOrigins: ["localhost:3000", ...productionOrigin],
      },
    }),
  },
  images: isGitHubPages
    ? { unoptimized: true }
    : {
        remotePatterns: [
          {
            protocol: "https",
            hostname: "lh3.googleusercontent.com",
          },
          {
            protocol: "https",
            hostname: "*.supabase.co",
            pathname: "/storage/v1/object/public/**",
          },
        ],
      },
  ...(!isGitHubPages && {
    async headers() {
      return [
        {
          source: "/(.*)",
          headers: securityHeaders,
        },
      ];
    },
  }),
};

// ── Serwist (Service Worker) — production only ─────────────
// Only initialize Serwist in production builds.
// withSerwistInit() injects webpack config that forces
// Next.js 16 to fall back from Turbopack → webpack even in
// dev mode. By deferring the require + init to production,
// the dev server keeps Turbopack and all its benefits.

let configExport: NextConfig = nextConfig;

if (process.env.NODE_ENV === "production" && !isGitHubPages) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const withSerwistInit = require("@serwist/next").default;
  const withSerwist = withSerwistInit({
    swSrc: "app/sw.ts",
    swDest: "public/sw.js",
    additionalPrecacheEntries: [{ url: "/~offline", revision: crypto.randomUUID() }],
  });
  configExport = withSerwist(nextConfig);
}

export default configExport;
