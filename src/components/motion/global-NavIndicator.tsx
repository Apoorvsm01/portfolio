"use client";

import { motion, useReducedMotion } from "motion/react";
import { NO_MOTION, SPRING_SNAP } from "./global-ease";

// The current-page marker under a desktop nav link. One shared layoutId, so it glides between items.
export function GlobalNavIndicator() {
  const reduce = useReducedMotion();
  return (
    <motion.span
      layoutId="global-nav-indicator"
      transition={reduce ? NO_MOTION : SPRING_SNAP}
      className="absolute left-3 right-3 bottom-[9px] h-[2px] rounded-full bg-accent"
      aria-hidden="true"
    />
  );
}
