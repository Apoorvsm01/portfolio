"use client";

import { useRef, useEffect, type ReactNode } from "react";

export function CardSpotlight({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const cardRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    let rafId: number | null = null;

    const handlePointerMove = (e: PointerEvent) => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

      const rect = el.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      if (rafId !== null) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        el.style.setProperty("--mx", `${mx.toFixed(1)}px`);
        el.style.setProperty("--my", `${my.toFixed(1)}px`);
      });
    };

    el.addEventListener("pointermove", handlePointerMove, { passive: true });

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      el.removeEventListener("pointermove", handlePointerMove);
    };
  }, []);

  return (
    <article ref={cardRef} className={className}>
      <div className="work-card-spotlight" aria-hidden="true" />
      {children}
    </article>
  );
}
