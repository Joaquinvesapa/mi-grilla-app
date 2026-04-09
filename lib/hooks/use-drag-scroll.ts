"use client";

// ── useDragScroll ───────────────────────────────────────────
// Enables click-and-drag scrolling on a container, simulating
// touch scroll behavior on desktop. Distinguishes drags from
// clicks: if the pointer moves more than DRAG_THRESHOLD pixels
// the gesture is treated as a scroll and the subsequent click
// event is suppressed (so ArtistCard toggles don't fire).

import { useRef, useEffect, useCallback } from "react";

// ── Constants ───────────────────────────────────────────────

/** Minimum px movement to consider the gesture a drag (not a click) */
const DRAG_THRESHOLD = 5;

// ── Hook ────────────────────────────────────────────────────

/**
 * Attach to a scrollable container to allow mouse-drag scrolling.
 *
 * @returns A ref to attach to the scrollable element.
 *
 * @example
 * ```tsx
 * const dragRef = useDragScroll();
 * <div ref={dragRef} className="overflow-auto">...</div>
 * ```
 */
export function useDragScroll<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null);

  // Track drag state across event handlers without re-renders
  const state = useRef({
    isDown: false,
    isDragging: false,
    startX: 0,
    startY: 0,
    scrollLeft: 0,
    scrollTop: 0,
  });

  const onMouseDown = useCallback((e: MouseEvent) => {
    const el = ref.current;
    if (!el) return;

    // Only handle left mouse button
    if (e.button !== 0) return;

    // Prevent native drag behavior on buttons/images inside the grid
    e.preventDefault();

    state.current = {
      isDown: true,
      isDragging: false,
      startX: e.clientX,
      startY: e.clientY,
      scrollLeft: el.scrollLeft,
      scrollTop: el.scrollTop,
    };

    el.style.cursor = "grab";
  }, []);

  const onMouseMove = useCallback((e: MouseEvent) => {
    const el = ref.current;
    const s = state.current;
    if (!el || !s.isDown) return;

    const dx = e.clientX - s.startX;
    const dy = e.clientY - s.startY;

    // Check if we've crossed the drag threshold
    if (
      !s.isDragging &&
      Math.abs(dx) + Math.abs(dy) > DRAG_THRESHOLD
    ) {
      s.isDragging = true;
      el.style.cursor = "grabbing";
      // Prevent text selection while dragging
      el.style.userSelect = "none";
    }

    if (s.isDragging) {
      el.scrollLeft = s.scrollLeft - dx;
      el.scrollTop = s.scrollTop - dy;
    }
  }, []);

  const onMouseUp = useCallback(() => {
    const el = ref.current;
    const s = state.current;
    if (!el) return;

    el.style.cursor = "";
    el.style.userSelect = "";

    // If we were dragging, suppress the next click so it doesn't
    // toggle an ArtistCard by accident.
    if (s.isDragging) {
      const suppressClick = (e: MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
      };
      el.addEventListener("click", suppressClick, {
        once: true,
        capture: true,
      });
    }

    s.isDown = false;
    s.isDragging = false;
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    el.addEventListener("mousedown", onMouseDown);
    // Attach move/up to window so dragging outside the element works
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    return () => {
      el.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [onMouseDown, onMouseMove, onMouseUp]);

  return ref;
}
