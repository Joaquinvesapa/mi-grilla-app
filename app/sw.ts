/// <reference no-default-lib="true" />
/// <reference lib="esnext" />
/// <reference lib="webworker" />

import {
  defaultCache,
  PAGES_CACHE_NAME,
} from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist, NetworkFirst, ExpirationPlugin } from "serwist";

// ── Type declarations for Serwist injection point ──────────

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

// ── Custom runtime caching ─────────────────────────────────
// Override defaultCache rules for pages (RSC + HTML) to add
// networkTimeoutSeconds. Without it, flaky connections hang
// indefinitely before falling back to cache.
//
// These rules are placed BEFORE defaultCache so they match first.
// The duplicated entries in defaultCache are harmlessly shadowed.

const NETWORK_TIMEOUT_SECONDS = 5;

const pagesCaching = [
  // RSC prefetch requests (background prefetching by Next.js router)
  {
    matcher: ({ request, url: { pathname }, sameOrigin }: {
      request: Request;
      url: URL;
      sameOrigin: boolean;
    }) =>
      request.headers.get("RSC") === "1" &&
      request.headers.get("Next-Router-Prefetch") === "1" &&
      sameOrigin &&
      !pathname.startsWith("/api/"),
    handler: new NetworkFirst({
      cacheName: PAGES_CACHE_NAME.rscPrefetch,
      networkTimeoutSeconds: NETWORK_TIMEOUT_SECONDS,
      plugins: [
        new ExpirationPlugin({
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60,
        }),
      ],
    }),
  },
  // RSC navigation requests (client-side navigation via router.push/Link)
  {
    matcher: ({ request, url: { pathname }, sameOrigin }: {
      request: Request;
      url: URL;
      sameOrigin: boolean;
    }) =>
      request.headers.get("RSC") === "1" &&
      sameOrigin &&
      !pathname.startsWith("/api/"),
    handler: new NetworkFirst({
      cacheName: PAGES_CACHE_NAME.rsc,
      networkTimeoutSeconds: NETWORK_TIMEOUT_SECONDS,
      plugins: [
        new ExpirationPlugin({
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60,
        }),
      ],
    }),
  },
  // HTML document requests (full page navigations)
  {
    matcher: ({ request, url: { pathname }, sameOrigin }: {
      request: Request;
      url: URL;
      sameOrigin: boolean;
    }) =>
      request.headers.get("Content-Type")?.includes("text/html") &&
      sameOrigin &&
      !pathname.startsWith("/api/"),
    handler: new NetworkFirst({
      cacheName: PAGES_CACHE_NAME.html,
      networkTimeoutSeconds: NETWORK_TIMEOUT_SECONDS,
      plugins: [
        new ExpirationPlugin({
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60,
        }),
      ],
    }),
  },
  // Catch-all for other same-origin non-API requests
  {
    matcher: ({ url: { pathname }, sameOrigin }: {
      url: URL;
      sameOrigin: boolean;
    }) =>
      sameOrigin && !pathname.startsWith("/api/"),
    handler: new NetworkFirst({
      cacheName: "others",
      networkTimeoutSeconds: NETWORK_TIMEOUT_SECONDS,
      plugins: [
        new ExpirationPlugin({
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60,
        }),
      ],
    }),
  },
];

// ── Service Worker ─────────────────────────────────────────

const serwist = new Serwist({
  // Precache entries injected at build time by @serwist/next
  precacheEntries: self.__SW_MANIFEST,

  // Activate immediately — don't wait for tabs to close
  skipWaiting: true,

  // Take control of all clients as soon as SW activates
  clientsClaim: true,

  // Navigation preload for faster first paint on navigation requests
  navigationPreload: true,

  // Custom pages rules (with timeout) + default rules for everything else
  runtimeCaching: [...pagesCaching, ...defaultCache],

  // Offline fallback — show /~offline when navigation fails
  fallbacks: {
    entries: [
      {
        url: "/~offline",
        matcher({ request }) {
          return request.destination === "document";
        },
      },
    ],
  },
});

// ── Global catch handler ───────────────────────────────────
// Safety net for ANY route failure (network down + cache miss).
// The `fallbacks` config only handles document requests.
// This handler catches RSC failures too and returns the offline
// page as a redirect so the browser does a full document nav.

serwist.setCatchHandler(async ({ request }) => {
  const dest = request.destination;

  // Document requests → serve precached /~offline page
  if (dest === "document") {
    const match = await serwist.matchPrecache("/~offline");
    return match ?? Response.error();
  }

  // RSC requests (client-side navigation) → redirect to same URL
  // as a full page navigation so the SW can serve cached HTML
  // or the /~offline fallback on the next request.
  if (request.headers.get("RSC") === "1") {
    return new Response(null, {
      status: 302,
      headers: { Location: new URL(request.url).pathname },
    });
  }

  return Response.error();
});

serwist.addEventListeners();

// ── SKIP_WAITING handler for update prompt ─────────────────
// When the client sends a SKIP_WAITING message, activate the
// new SW immediately so the app reloads with fresh code.

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
