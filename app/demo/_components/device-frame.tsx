"use client";

// ── DeviceFrame ─────────────────────────────────────────────
// Wraps the demo content in a phone-shaped container on desktop.
// On mobile viewports (<768px) it renders children directly —
// the app already looks native.
//
// The CSS trick: `transform: translateZ(0)` on the phone frame
// creates a new containing block, which causes `position: fixed`
// children (BottomNav, LiveNowMenu, Banner) to position relative
// to the frame instead of the viewport.

import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

// ── Constants ───────────────────────────────────────────────

/** Breakpoint below which we skip the frame (real mobile) */
const MOBILE_BREAKPOINT = 768;

/** Phone frame dimensions (iPhone 14-ish proportions) */
const FRAME_WIDTH = 390;
const FRAME_HEIGHT = 844;

// ── Types ───────────────────────────────────────────────────

interface DeviceFrameProps {
  children: React.ReactNode;
  /** Optional element rendered below the phone frame (e.g. DemoBanner) */
  banner?: React.ReactNode;
}

// ── DesktopShell ────────────────────────────────────────────
// The full desktop experience: backdrop + branding + phone frame +
// scrollable inner area + optional banner below the frame.

function DesktopShell({
  children,
  banner,
}: {
  children: React.ReactNode;
  banner?: React.ReactNode;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);

  // Forward wheel events to the correct scroll container.
  // The `overflow: hidden` + `transform: translateZ(0)` combo on the
  // phone frame can swallow native wheel scroll, so we handle ALL
  // wheel events manually and route them to the right target:
  //   - Over a `[data-scroll-container]` → scroll that container
  //   - Anywhere else in the frame → scroll the main content area
  useEffect(() => {
    const frame = frameRef.current;
    const scrollEl = scrollRef.current;
    if (!frame || !scrollEl) return;

    function onWheel(e: WheelEvent) {
      const target = e.target as HTMLElement;
      const nested = target.closest(
        "[data-scroll-container]"
      ) as HTMLElement | null;

      const dest = nested ?? scrollEl;
      if (!dest) return;

      dest.scrollTop += e.deltaY;
      dest.scrollLeft += e.deltaX;
      e.preventDefault();
    }

    frame.addEventListener("wheel", onWheel, { passive: false });
    return () => frame.removeEventListener("wheel", onWheel);
  }, []);

  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{ backgroundColor: "var(--color-background)" }}
    >
      {/* ── Left side: branding info ────────────────────────── */}
      <div className="hidden lg:flex flex-col items-end justify-center pr-12 select-none">
        <h2
          className="font-display text-5xl uppercase tracking-wider mb-3"
          style={{ color: "var(--color-primary)" }}
        >
          MIGRILLA
        </h2>
        <p
          className="font-sans text-sm max-w-[260px] text-right leading-relaxed"
          style={{ color: "var(--color-muted)" }}
        >
          Tu grilla de festival, tu agenda, tu grupo.
          Todo en un solo lugar.
        </p>
        <div
          className="flex items-center gap-2 mt-4"
          aria-hidden="true"
        >
          {["Next.js", "React", "Supabase", "Tailwind"].map((tech) => (
            <span
              key={tech}
              className="font-sans text-[10px] px-2 py-0.5 rounded-full border"
              style={{
                borderColor: "var(--color-border)",
                color: "var(--color-muted)",
              }}
            >
              {tech}
            </span>
          ))}
        </div>
      </div>

      {/* ── Phone + banner column ────────────────────────────── */}
      <div className="flex flex-col items-center gap-3">
        {/* ── Phone frame ──────────────────────────────────────── */}
        <div
          ref={frameRef}
          className={cn(
            "relative flex-shrink-0",
            "rounded-[3rem] border-[6px]",
            "shadow-2xl shadow-black/50",
            "overflow-hidden",
          )}
          style={{
            width: FRAME_WIDTH,
            height: FRAME_HEIGHT,
            borderColor: "#000000",
            backgroundColor: "var(--color-background)",
            // Creates a new containing block so `position: fixed`
            // children behave like `absolute`
            transform: "translateZ(0)",
          }}
        >
          {/* ── Notch ──────────────────────────────────────────── */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 z-[100] rounded-b-2xl"
            style={{
              width: 126,
              height: 28,
              backgroundColor: "#000000",
            }}
            aria-hidden="true"
          />

          {/* ── Scrollable content area ────────────────────────── */}
          <div
            ref={scrollRef}
            className="absolute inset-0 overflow-y-auto overflow-x-hidden overscroll-contain device-frame-scroll"
            style={{
              paddingTop: 28,
              // Override --app-viewport-height so pages inside the
              // frame calculate their height relative to the frame
              // (844px) instead of the real browser viewport (100dvh).
              // 28px notch + 64px bottom nav = 92px chrome.
              ["--app-viewport-height" as string]: `${FRAME_HEIGHT - 92}px`,
            }}
          >
            {children}
          </div>
        </div>

        {/* ── Banner below the frame ─────────────────────────── */}
        {banner && (
          <div
            className="rounded-xl overflow-hidden"
            style={{ width: FRAME_WIDTH - 40 }}
          >
            {banner}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Component ───────────────────────────────────────────────

export function DeviceFrame({ children, banner }: DeviceFrameProps) {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    function check() {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    }
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // ── SSR / first render: hide until we know the viewport ──
  // This prevents the desktop flash where content renders
  // without the frame before the useEffect fires.
  if (isMobile === null) {
    return <div className="opacity-0" aria-hidden="true">{children}</div>;
  }

  // ── Mobile: render children directly (no frame) ──────────
  if (isMobile) {
    return <>{children}</>;
  }

  // ── Desktop: phone frame + backdrop ──────────────────────
  return (
    <DesktopShell banner={banner}>
      {children}
    </DesktopShell>
  );
}
