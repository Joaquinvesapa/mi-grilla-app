"use client";

import { useEffect, useRef } from "react";
import { useNavigationPending } from "@/lib/navigation-pending";
import { cn } from "@/lib/utils";

// ── Component ──────────────────────────────────────────────

export function NavigationProgressBar() {
  const pending = useNavigationPending();
  const barRef = useRef<HTMLDivElement>(null);
  const prevPendingRef = useRef(false);

  // Track transitions: pending → not-pending triggers the "complete" animation
  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;

    if (pending) {
      // Starting: reset any "complete" animation, play the crawl
      bar.classList.remove("animate-nav-progress-complete");
      // Force reflow to restart the animation if re-entering pending rapidly
      void bar.offsetWidth;
      bar.classList.add("animate-nav-progress");
      bar.style.display = "block";
    } else if (prevPendingRef.current && !pending) {
      // Transition finished: play fill-to-100% + fade-out
      bar.classList.remove("animate-nav-progress");
      void bar.offsetWidth;
      bar.classList.add("animate-nav-progress-complete");

      const handleEnd = () => {
        bar.style.display = "none";
        bar.classList.remove("animate-nav-progress-complete");
        bar.removeEventListener("animationend", handleEnd);
      };
      bar.addEventListener("animationend", handleEnd);
    }

    prevPendingRef.current = pending;
  }, [pending]);

  return (
    <div
      ref={barRef}
      aria-hidden="true"
      className={cn(
        "fixed top-0 left-0 right-0 z-[60]",
        "h-[3px] origin-left",
      )}
      style={{
        backgroundColor: "var(--color-primary)",
        display: "none",
      }}
    />
  );
}
