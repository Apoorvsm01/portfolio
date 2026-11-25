"use client";

import { useLayoutEffect, useRef } from "react";
import type { ScopeCheck } from "../../lib/ask/types";
import { askCopy } from "../../../content/ask";
import { brainCopy } from "../../../content/brain/copy";
import { m } from "motion/react";
import { useReducedMotion } from "../../lib/use-reduced-motion";
import { useEnter } from "../motion/home-motion";

type Props = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onFirstTouch: () => void;
  scope: ScopeCheck;
  busy: boolean;
  // Status line under the box (for example "Fetching the job description…"); the scope hint wins over it.
  notice?: string;
};

// The one home input: a pill in the rotating Apple Intelligence ring. A textarea that grows with pasted text;
// Enter sends, Shift+Enter adds a line. The send button leans toward the pointer.
export function PromptBox({ value, onChange, onSubmit, onFirstTouch, scope, busy, notice }: Props) {
  const reduced = useReducedMotion();
  const sendRef = useRef<HTMLButtonElement | null>(null);
  const areaRef = useRef<HTMLTextAreaElement | null>(null);
  const enter = useEnter(0.58, 12);

  // Grow with the text, up to the CSS max-height, then scroll inside.
  useLayoutEffect(() => {
    const el = areaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

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
      <m.div className="glow-ring" data-scope={out ? "out" : "in"} style={{ opacity: enter.opacity, y: enter.y }}>
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
            <textarea
              ref={areaRef}
              className="ask-input"
              rows={1}
              value={value}
              autoComplete="off"
              spellCheck={false}
              enterKeyHint="send"
              aria-label={brainCopy.input.label}
              aria-describedby="ask-hint"
              placeholder={brainCopy.input.placeholder}
              onChange={(e) => onChange(e.target.value)}
              onFocus={onFirstTouch}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                  e.preventDefault();
                  if (!busy && value.trim()) onSubmit();
                }
              }}
            />
          </div>
          <button ref={sendRef} className="ask-send" type="submit" disabled={busy || !value.trim()} aria-label={askCopy.submit}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </form>
      </m.div>
      <p id="ask-hint" className="ask-hint" data-tone={out ? "warn" : undefined} aria-live="polite">
        {out ? askCopy.scopeHint : (notice ?? "")}
      </p>
    </>
  );
}
