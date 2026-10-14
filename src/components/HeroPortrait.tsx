"use client";

import { useRef, useEffect } from "react";
import { FadeImage } from "./FadeImage";

export function HeroPortrait({
  src,
  alt,
  width,
  height,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let rafId: number | null = null;

    const handlePointerMove = (e: PointerEvent) => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      const rotX = (0.5 - y) * 8; // ±4 deg
      const rotY = (x - 0.5) * 8; // ±4 deg

      if (rafId !== null) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        el.style.setProperty("--tilt-x", `${rotX.toFixed(2)}deg`);
        el.style.setProperty("--tilt-y", `${rotY.toFixed(2)}deg`);
      });
    };

    const handlePointerLeave = () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        el.style.setProperty("--tilt-x", "0deg");
        el.style.setProperty("--tilt-y", "0deg");
      });
    };

    el.addEventListener("pointermove", handlePointerMove, { passive: true });
    el.addEventListener("pointerleave", handlePointerLeave, { passive: true });

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      el.removeEventListener("pointermove", handlePointerMove);
      el.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="portrait-container hero-portrait-reveal w-full max-w-[22rem] md:max-w-none aspect-[4/5] max-h-[70svh] rounded-[16px] overflow-hidden border border-line/60"
    >
      <FadeImage
        src={src}
        alt={alt}
        width={width}
        height={height}
        className="portrait-img w-full h-full object-cover rounded-[16px]"
      />
    </div>
  );
}
