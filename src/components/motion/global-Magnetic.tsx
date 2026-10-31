"use client";

import { useRef, type ComponentProps } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";

const MAX_PULL = 6; // px

// An anchor that leans up to 6px toward a fine pointer and springs back on leave. No-op on touch / reduced motion.
export function GlobalMagnetic({ children, className, href, ...rest }: Pick<ComponentProps<"a">, "children" | "className" | "href" | "aria-label">) {
  const ref = useRef<HTMLAnchorElement>(null);
  const reduce = useReducedMotion();
  const x = useSpring(useMotionValue(0), { stiffness: 320, damping: 20, mass: 0.6 });
  const y = useSpring(useMotionValue(0), { stiffness: 320, damping: 20, mass: 0.6 });

  const move = (e: React.PointerEvent) => {
    if (reduce || e.pointerType !== "mouse" || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
    const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
    x.set(Math.max(-1, Math.min(1, dx)) * MAX_PULL);
    y.set(Math.max(-1, Math.min(1, dy)) * MAX_PULL);
  };
  const leave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.a ref={ref} href={href} className={className} data-magnetic="" style={{ x, y }} onPointerMove={move} onPointerLeave={leave} {...rest}>
      {children}
    </motion.a>
  );
}
