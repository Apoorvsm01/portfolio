"use client";

import { useEffect, useRef } from "react";

/**
 * Writes a 0..1 scroll progress to the element's `--fold` CSS variable (0 = folded, 1 = flat).
 * Progress is 0 while the element's top is at the bottom of the viewport and 1 once its center
 * reaches `settleAt` (a fraction of the viewport height from the top). Under reduced motion it
 * is flat from the start. One passive scroll listener, one rAF per frame, no React state.
 */
export function useFoldProgress<T extends HTMLElement>(settleAt = 0.5) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      el.style.setProperty("--fold", "1");
      return;
    }

    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const center = rect.top + rect.height / 2;
      const start = vh; // center enters from the bottom edge
      const end = vh * settleAt;
      const raw = (start - center) / (start - end);
      const p = Math.min(1, Math.max(0, raw));
      // ease-out so the last degrees of the fold settle slowly, like a hinge catching
      el.style.setProperty("--fold", (1 - Math.pow(1 - p, 3)).toFixed(4));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [settleAt]);

  return ref;
}
