"use client";

import { useState, type ReactNode } from "react";

/** Front and back of one card on a vertical hinge. A real button toggles it; reduced motion cuts instead of turning. */
export function FlipCompare({
  front,
  back,
  frontLabel,
  backLabel,
}: {
  front: ReactNode;
  back: ReactNode;
  frontLabel: string;
  backLabel: string;
}) {
  const [flipped, setFlipped] = useState(false);
  return (
    <div className="flip-compare" data-flipped={flipped ? "true" : undefined}>
      <div className="flip-card">
        <div className="flip-face flip-front" aria-hidden={flipped}>{front}</div>
        <div className="flip-face flip-back" aria-hidden={!flipped}>{back}</div>
      </div>
      <button
        type="button"
        className="btn-pill flip-toggle"
        aria-pressed={flipped}
        onClick={() => setFlipped((f) => !f)}
      >
        {flipped ? `Show ${frontLabel}` : `Show ${backLabel}`}
      </button>
    </div>
  );
}
