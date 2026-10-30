// Shared motion tokens (mirror the --ease-* CSS variables in globals.css).
export const EASE_OUT_EXPO = [0.22, 1, 0.36, 1] as const;
export const SPRING_SOFT = { type: "spring", stiffness: 260, damping: 30, mass: 0.9 } as const;
export const SPRING_SNAP = { type: "spring", stiffness: 420, damping: 32, mass: 0.7 } as const;
export const NO_MOTION = { duration: 0 } as const;
