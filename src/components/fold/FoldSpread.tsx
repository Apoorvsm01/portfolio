"use client";

import type { ReactNode } from "react";
import { useFoldProgress } from "./useFoldProgress";

/**
 * Two panels that open like an unfolding Duo as they scroll into view: each half rotates around the
 * center hinge and sharpens from a blur. Below md they stack and only the blur-in remains.
 */
export function FoldSpread({
  left,
  right,
  leftLabel,
  rightLabel,
  className = "",
}: {
  left: ReactNode;
  right: ReactNode;
  leftLabel?: string;
  rightLabel?: string;
  className?: string;
}) {
  const ref = useFoldProgress<HTMLDivElement>(0.55);

  return (
    <div ref={ref} className={`fold-spread ${className}`} style={{ "--fold": 0 } as React.CSSProperties}>
      <div className="fold-stage">
        <div className="fold-half fold-half-left">
          {left}
          {leftLabel && <span className="fold-tag">{leftLabel}</span>}
        </div>
        <div className="fold-half fold-half-right">
          {right}
          {rightLabel && <span className="fold-tag">{rightLabel}</span>}
        </div>
        <div className="fold-seam" aria-hidden="true" />
      </div>
    </div>
  );
}
