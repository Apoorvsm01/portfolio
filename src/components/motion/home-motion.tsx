"use client";

import { animate, LazyMotion, useMotionValue, useSpring, type MotionValue } from "motion/react";
import { useLayoutEffect, useSyncExternalStore, type ReactNode, type RefObject } from "react";
import { useReducedMotion } from "../../lib/use-reduced-motion";

const loadFeatures = () => import("./home-features").then((mod) => mod.default);

// Feature bundle (drag, layout) loads after first paint, so it never blocks the initial render.
export function HomeMotion({ children }: { children: ReactNode }) {
  return <LazyMotion features={loadFeatures}>{children}</LazyMotion>;
}

export const SPRING_SOFT = { type: "spring", stiffness: 260, damping: 28, mass: 0.9 } as const;
export const SPRING_SNAP = { type: "spring", stiffness: 320, damping: 34 } as const;
export const SPRING_TILT = { stiffness: 150, damping: 20, mass: 0.6 } as const;
export const SPRING_PRESS = { type: "spring", stiffness: 500, damping: 30 } as const;

const COARSE = "(hover: none), (pointer: coarse)";

function subscribeCoarse(onChange: () => void) {
  const media = window.matchMedia(COARSE);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

// True on touch-first devices, where hover effects would stick or never fire.
export function useCoarsePointer(): boolean {
  return useSyncExternalStore(subscribeCoarse, () => window.matchMedia(COARSE).matches, () => false);
}

// Pointer-follow tilt. rotateX/rotateY are springs; `imageScale` is meant to feed the CSS variable --img-scale.
export function useTilt(max = 4) {
  const reduced = useReducedMotion();
  const coarse = useCoarsePointer();
  const enabled = !reduced && !coarse;
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const img = useMotionValue(1);
  const rotateX = useSpring(rx, SPRING_TILT);
  const rotateY = useSpring(ry, SPRING_TILT);
  const imageScale = useSpring(img, SPRING_TILT);

  const bind = {
        onPointerMove(e: React.PointerEvent<HTMLElement>) {
          if (!enabled || e.pointerType !== "mouse") return;
          const r = e.currentTarget.getBoundingClientRect();
          const px = (e.clientX - r.left) / r.width - 0.5;
          const py = (e.clientY - r.top) / r.height - 0.5;
          ry.set(px * 2 * max);
          rx.set(-py * 2 * max);
          img.set(1.03);
        },
        onPointerLeave() {
          rx.set(0);
          ry.set(0);
          img.set(1);
        },
      };

  return { enabled, rotateX, rotateY, imageScale, bind };
}

// Scroll reveal that is fully visible without JS: content renders normally, then (before first paint on the
// client) is lowered and faded, and springs in when it enters the viewport. Returns motion values for style.
export function useReveal(ref: RefObject<HTMLElement | null>, delay = 0, distance = 16) {
  const reduced = useReducedMotion();
  const opacity: MotionValue<number> = useMotionValue(1);
  const y: MotionValue<number> = useMotionValue(0);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || reduced || typeof IntersectionObserver === "undefined") return;
    opacity.set(0);
    y.set(distance);
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((en) => en.isIntersecting)) return;
        io.disconnect();
        animate(opacity, 1, { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] });
        animate(y, 0, { ...SPRING_SOFT, delay });
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      opacity.set(1);
      y.set(0);
    };
  }, [ref, reduced, delay, distance, opacity, y]);

  return { opacity, y };
}

// Staged entrance on load: same no-JS-safe approach as useReveal, but time-based (starts on mount, after `delay`).
export function useEnter(delay = 0, distance = 14) {
  const reduced = useReducedMotion();
  const opacity: MotionValue<number> = useMotionValue(1);
  const y: MotionValue<number> = useMotionValue(0);

  useLayoutEffect(() => {
    if (reduced) return;
    opacity.set(0);
    y.set(distance);
    const a = animate(opacity, 1, { duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] });
    const b = animate(y, 0, { ...SPRING_SOFT, delay });
    return () => {
      a.stop();
      b.stop();
      opacity.set(1);
      y.set(0);
    };
  }, [reduced, delay, distance, opacity, y]);

  return { opacity, y };
}
