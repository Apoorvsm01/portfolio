"use client";

import { useEffect, useRef } from "react";
import { asset } from "@/lib/asset";

const SPACING = 110; // px of pointer travel between images
const MAX_LIVE = 6;
const HOLD = 500; // ms fully visible

// Spatial-interface screenshots that pop up along the pointer's path and fade, behind the hero's
// content. Mouse and trackpad only; off for touch and for reduced motion.
export function CursorTrail({ images }: { images: string[] }) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    const area = host?.parentElement;
    if (!host || !area || !images.length) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const sources = images.map(asset);
    sources.forEach((src) => {
      const img = new Image();
      img.src = src;
    });

    let last: { x: number; y: number } | null = null;
    let next = 0;
    let live = 0;

    const spawn = (x: number, y: number) => {
      const img = document.createElement("img");
      img.src = sources[next];
      next = (next + 1) % sources.length;
      img.alt = "";
      img.className = "trail-img";
      img.style.left = `${x}px`;
      img.style.top = `${y}px`;
      // A small random turn in depth, so each window reads as floating in space.
      const ry = (Math.random() * 2 - 1) * 14;
      const rx = (Math.random() * 2 - 1) * 8;
      const base = `translate(-50%, -50%) rotateX(${rx}deg) rotateY(${ry}deg)`;
      host.appendChild(img);
      live++;
      const enter = img.animate(
        [
          { opacity: 0, transform: `${base} scale(0.95)` },
          { opacity: 1, transform: `${base} scale(1)` },
        ],
        { duration: 450, easing: "cubic-bezier(0.2, 0.7, 0.2, 1)", fill: "forwards" }
      );
      enter.finished
        .then(
          () =>
            img.animate(
              [
                { opacity: 1, transform: `${base} scale(1)` },
                { opacity: 0, transform: `${base} scale(0.9)` },
              ],
              { duration: 400, delay: HOLD, easing: "cubic-bezier(0.84, 0, 0.24, 1)", fill: "forwards" }
            ).finished
        )
        .catch(() => {})
        .finally(() => {
          img.remove();
          live--;
        });
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      // Not while the pointer is working a control (intent picker, links).
      if ((e.target as Element | null)?.closest?.("a, button, input, [role='button']")) {
        last = null;
        return;
      }
      const r = area.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      if (last && Math.hypot(x - last.x, y - last.y) < SPACING) return;
      last = { x, y };
      if (live < MAX_LIVE) spawn(x, y);
    };
    const onLeave = () => {
      last = null;
    };

    area.addEventListener("pointermove", onMove);
    area.addEventListener("pointerleave", onLeave);
    return () => {
      area.removeEventListener("pointermove", onMove);
      area.removeEventListener("pointerleave", onLeave);
      host.replaceChildren();
    };
  }, [images]);

  return <div ref={hostRef} className="trail-host" aria-hidden="true" />;
}
