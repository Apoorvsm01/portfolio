"use client";

import type { ReactNode } from "react";
import { useScrollBlur } from "../../lib/use-scroll-blur";

// Wraps a block so it sharpens from a blur as it scrolls into view.
export function ScrollBlur({ children, id, className = "" }: { children: ReactNode; id?: string; className?: string }) {
  const ref = useScrollBlur<HTMLDivElement>("in", 12);
  return (
    <div ref={ref} id={id} className={`scroll-blur ${className}`}>
      {children}
    </div>
  );
}
