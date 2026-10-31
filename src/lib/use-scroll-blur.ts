"use client";

import { useEffect, useRef } from "react";

/**
 * Scroll-linked blur in the manner of the Duo fold sections, without the fold.
 * - "in": the element starts blurred and faded as its top edge rises from the bottom of the screen, and is
 *   sharp once that edge is about 40% of the way up. Keyed to the top edge, not the centre: a tall block's
 *   centre can stay below mid-screen while the block fills the window, which left it blurred and dim.
 * - "out": the element stays sharp while it is being read. It blurs and fades only once the visitor has
 *   scrolled and its bottom edge has risen into the upper half of the screen, reaching full blur as it leaves.
 * Writes `--blur` and `--blur-o` and toggles `data-blurred`; the `.scroll-blur` CSS applies them. One passive
 * scroll listener and one rAF per frame, no React state. Does nothing under reduced motion.
 */
export function useScrollBlur<T extends HTMLElement>(mode: "in" | "out", maxBlur = 12) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      let blur: number;
      let opacity: number;
      if (mode === "in") {
        const raw = Math.min(1, Math.max(0, (vh - rect.top) / (vh * 0.4)));
        const sharp = 1 - Math.pow(1 - raw, 3);
        blur = (1 - sharp) * maxBlur;
        opacity = 0.5 + sharp * 0.5;
      } else {
        // Two gates: the bottom edge is high on screen, and the page has really been scrolled (a short docked
        // answer on a tall screen would otherwise start blurred at rest).
        const exiting = Math.min(1, Math.max(0, (vh * 0.55 - rect.bottom) / (vh * 0.55)));
        const scrolled = Math.min(1, window.scrollY / (vh * 0.25));
        const away = exiting * scrolled;
        blur = away * maxBlur;
        opacity = 1 - away * 0.6;
      }
      const on = blur > 0.25;
      if (on) {
        el.style.setProperty("--blur", `${blur.toFixed(2)}px`);
        el.style.setProperty("--blur-o", opacity.toFixed(3));
        el.setAttribute("data-blurred", "true");
      } else {
        el.removeAttribute("data-blurred");
      }
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
  }, [mode, maxBlur]);

  return ref;
}
