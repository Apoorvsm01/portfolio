"use client";

import { useEffect, useRef, useState } from "react";
import type { ScopeCheck } from "../../lib/ask/types";
import { askCopy } from "../../../content/ask";
import { useReducedMotion } from "../../lib/use-reduced-motion";

type Props = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onFirstTouch: () => void;
  scope: ScopeCheck;
  busy: boolean;
};

// Prompt pill wrapped in the rotating Apple Intelligence ring. The placeholder types itself through
// example questions; the send button leans toward the pointer.
export function PromptBox({ value, onChange, onSubmit, onFirstTouch, scope, busy }: Props) {
  const [focused, setFocused] = useState(false);
  const [ghost, setGhost] = useState("");
  const reduced = useReducedMotion();
  const sendRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const phrases = askCopy.placeholders;
    if (reduced || value || focused) return;
    let phrase = 0;
    let chars = 0;
    let deleting = false;
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      const text = phrases[phrase];
      chars += deleting ? -1 : 1;
      setGhost(text.slice(0, Math.max(chars, 0)));
      let delay = deleting ? 22 : 48;
      if (!deleting && chars >= text.length) {
        deleting = true;
        delay = 1900;
      } else if (deleting && chars <= 0) {
        deleting = false;
        phrase = (phrase + 1) % phrases.length;
        delay = 380;
      }
      timer = setTimeout(tick, delay);
    };
    timer = setTimeout(tick, 600);
    return () => clearTimeout(timer);
  }, [value, focused, reduced]);

  function lean(e: React.PointerEvent<HTMLFormElement>) {
    const btn = sendRef.current;
    if (!btn || reduced || e.pointerType === "touch") return;
    const r = btn.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    const dist = Math.hypot(dx, dy);
    const pull = dist < 110 ? Math.min(8, dist * 0.16) / Math.max(dist, 1) : 0;
    btn.style.setProperty("--mx", `${dx * pull}px`);
    btn.style.setProperty("--my", `${dy * pull}px`);
  }
  function unlean() {
    sendRef.current?.style.setProperty("--mx", "0px");
    sendRef.current?.style.setProperty("--my", "0px");
  }

  const out = scope === "out" && value.trim().length > 0;

  return (
    <>
      <div className="glow-ring" data-scope={out ? "out" : "in"}>
        <form
          className="ask-box"
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
          onPointerMove={lean}
          onPointerLeave={unlean}
        >
          <div className="ask-field">
            <input
              className="ask-input"
              type="text"
              value={value}
              maxLength={200}
              autoComplete="off"
              enterKeyHint="search"
              aria-label="Ask about Apoorv’s work"
              aria-describedby="ask-hint"
              placeholder="Ask about Apoorv’s work"
              onChange={(e) => onChange(e.target.value)}
              onFocus={() => {
                setFocused(true);
                onFirstTouch();
              }}
              onBlur={() => setFocused(false)}
            />
            <span className="ask-ghost" data-hidden={Boolean(value) || focused} aria-hidden="true">
              {reduced ? askCopy.placeholders[0] : ghost}
              {!reduced && <i className="ask-caret" />}
            </span>
          </div>
          <button ref={sendRef} className="ask-send" type="submit" disabled={busy || !value.trim()} aria-label={askCopy.submit}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </form>
      </div>
      <p id="ask-hint" className="ask-hint" data-tone={out ? "warn" : undefined} aria-live="polite">
        {out ? askCopy.scopeHint : ""}
      </p>
    </>
  );
}
