"use client";

import { m } from "motion/react";
import type { SuggestedPrompt } from "../../../content/ask";
import { site } from "../../../content/site";
import { useReducedMotion } from "../../lib/use-reduced-motion";
import { SPRING_PRESS, SPRING_SOFT, useCoarsePointer, useEnter } from "./home-motion";

function Chip({
  prompt,
  index,
  selected,
  disabled,
  onPick,
}: {
  prompt: SuggestedPrompt;
  index: number;
  selected: boolean;
  disabled?: boolean;
  onPick: (p: SuggestedPrompt) => void;
}) {
  const reduced = useReducedMotion();
  const coarse = useCoarsePointer();
  const { opacity, y } = useEnter(0.72 + index * 0.04, 10);
  const live = !reduced && !disabled;

  return (
    <m.li style={{ opacity, y }}>
      <m.button
        type="button"
        className="ask-chip"
        disabled={disabled}
        data-selected={selected || undefined}
        whileHover={live && !coarse ? { y: -2 } : undefined}
        whileTap={live ? { scale: 0.97 } : undefined}
        transition={SPRING_PRESS}
        style={
          {
            "--i": index,
            "--chip": `var(--flag-${prompt.flag})`,
            "--flag-ink": site.flags[prompt.flag].ink,
            // Motion owns transform and the entrance; the stylesheet's keyframes and transform transition step aside.
            animation: "none",
            transition: "border-color 200ms, background-color 200ms",
          } as never
        }
        onPointerMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          e.currentTarget.style.setProperty("--cx", `${((e.clientX - r.left) / r.width) * 100}%`);
        }}
        onClick={() => onPick(prompt)}
      >
        {selected && (
          <m.span
            layoutId="home-chip-highlight"
            aria-hidden="true"
            transition={reduced ? { duration: 0 } : SPRING_SOFT}
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 999,
              background: "color-mix(in srgb, var(--chip) 30%, transparent)",
              boxShadow: "inset 0 0 0 1px color-mix(in srgb, var(--chip) 70%, transparent)",
              pointerEvents: "none",
            }}
          />
        )}
        <span style={{ position: "relative" }}>{prompt.label}</span>
      </m.button>
    </m.li>
  );
}

// Suggested prompts with spring press and hover lift. A selected chip carries a highlight that slides between chips.
export function HomeChips({
  prompts,
  onPick,
  disabled,
  selectedId,
}: {
  prompts: SuggestedPrompt[];
  onPick: (p: SuggestedPrompt) => void;
  disabled?: boolean;
  selectedId?: string | null;
}) {
  return (
    <ul className="ask-chips" data-role="starter" aria-label="Suggested questions">
      {prompts.map((p, i) => (
        <Chip key={p.id} prompt={p} index={i} selected={p.id === selectedId} disabled={disabled} onPick={onPick} />
      ))}
    </ul>
  );
}
