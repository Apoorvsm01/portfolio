"use client";

import type { SuggestedPrompt } from "../../../content/ask";
import { site } from "../../../content/site";

// Suggested prompts. The highlight inside each chip follows the pointer's horizontal position.
export function Chips({ prompts, onPick, disabled }: { prompts: SuggestedPrompt[]; onPick: (p: SuggestedPrompt) => void; disabled?: boolean }) {
  return (
    <ul className="ask-chips" data-role="starter" aria-label="Suggested questions">
      {prompts.map((p, i) => (
        <li key={p.id}>
          <button
            type="button"
            className="ask-chip"
            disabled={disabled}
            style={
              {
                "--i": i,
                "--chip": `var(--flag-${p.flag})`,
                "--flag-ink": site.flags[p.flag].ink,
              } as React.CSSProperties
            }
            onPointerMove={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              e.currentTarget.style.setProperty("--cx", `${((e.clientX - r.left) / r.width) * 100}%`);
            }}
            onClick={() => onPick(p)}
          >
            {p.label}
          </button>
        </li>
      ))}
    </ul>
  );
}
