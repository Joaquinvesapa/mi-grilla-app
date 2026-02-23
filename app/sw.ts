/// <reference no-default-lib="true" />
/// <reference lib="esnext" />
/// <reference lib="webworker" />

import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist } from "serwist";

// ── Type declarations for Serwist injection point ──────────

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

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

  // Default runtime caching strategies from @serwist/next
  // Includes: NetworkFirst for pages, CacheFirst for static assets,
  // StaleWhileRevalidate for API calls, etc.
  runtimeCaching: defaultCache,

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

serwist.addEventListeners();
