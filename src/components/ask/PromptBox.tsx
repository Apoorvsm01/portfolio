"use client";

import type { ScopeCheck } from "../../lib/ask/types";
import { askCopy } from "../../../content/ask";

type Props = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onFirstTouch: () => void;
  scope: ScopeCheck;
  busy: boolean;
};

// One flat field, the lightest thing on the page, with the send button inside its right end.
export function PromptBox({ value, onChange, onSubmit, onFirstTouch, scope, busy }: Props) {
  const out = scope === "out" && value.trim().length > 0;
  return (
    <>
      <form
        className="ask__form"
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
      >
        <input
          className="ask__input"
          type="text"
          value={value}
          maxLength={200}
          autoComplete="off"
          enterKeyHint="search"
          aria-label="Ask about Apoorv’s work"
          aria-describedby="ask-hint"
          placeholder="Ask me about my work"
          onChange={(e) => onChange(e.target.value)}
          onFocus={onFirstTouch}
        />
        <button className="ask__send" type="submit" disabled={busy || !value.trim()} aria-label={askCopy.submit}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="square" />
          </svg>
        </button>
      </form>
      <p id="ask-hint" className="ask__hint small" aria-live="polite">
        {out ? askCopy.scopeHint : ""}
      </p>
    </>
  );
}
