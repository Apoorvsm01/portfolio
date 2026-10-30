"use client";

import { m } from "motion/react";
import type { ReactNode } from "react";
import { useTilt } from "./home-motion";

// Wraps a card with a subtle pointer-follow 3D tilt. Children can scale their image with
// `[transform:scale(var(--img-scale,1))]`. Does nothing on touch or when reduced motion is on.
export function HomeTilt({ children, className }: { children: ReactNode; className?: string }) {
  const { enabled, rotateX, rotateY, imageScale, bind } = useTilt(4);
  return (
    <m.div
      className={className}
      {...bind}
      style={
        enabled
          ? ({ rotateX, rotateY, transformPerspective: 1000, "--img-scale": imageScale } as never)
          : undefined
      }
    >
      {children}
    </m.div>
  );
}
