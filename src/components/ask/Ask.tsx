"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { askCopy, suggestedPrompts, type SuggestedPrompt } from "../../../content/ask";
import { loadEngine } from "../../lib/ask/load";
import type { AskEngine } from "../../lib/ask/engine";
import type { AskResult, ScopeCheck } from "../../lib/ask/types";
import { AnswerPanel, RefusalPanel, ThinkingPanel } from "./AnswerPanel";
import { PromptBox } from "./PromptBox";

// The first screen shows six starting points; every topic is still reachable by typing.
const SHOWN = ["ux-engineer", "ux-designer", "ux-researcher", "healthcare", "automotive", "best-work"];

type Phase = "idle" | "thinking" | "answered" | "refused";

const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// The one live thing on the page: ask a question, get an answer written only from this site's own copy.
// The retrieval engine loads when the page is idle, so the first question is instant.
export function Ask() {
  const [query, setQuery] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [result, setResult] = useState<AskResult | null>(null);
  const [verdict, setVerdict] = useState<ScopeCheck>("in");
  const [ready, setReady] = useState(false);
  const [asked, setAsked] = useState(0);
  const engine = useRef<AskEngine | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const warm = useCallback(() => {
    loadEngine().then((e) => {
      engine.current = e;
      setReady(true);
    });
  }, []);

  useEffect(() => {
    if (typeof window.requestIdleCallback === "function") {
      const handle = window.requestIdleCallback(warm, { timeout: 2500 });
      return () => window.cancelIdleCallback(handle);
    }
    const handle = window.setTimeout(warm, 1200);
    return () => clearTimeout(handle);
  }, [warm]);

  useEffect(() => () => clearTimeout(timer.current), []);

  // Live "is this about the portfolio?" hint while typing.
  useEffect(() => {
    const e = engine.current;
    if (!e || !query.trim()) return;
    const t = setTimeout(() => setVerdict(e.scope(query)), 200);
    return () => clearTimeout(t);
  }, [query, ready]);
  const scope: ScopeCheck = query.trim() ? verdict : "empty";

  const submit = useCallback(async (raw: string) => {
    const q = raw.trim();
    if (!q) return;
    clearTimeout(timer.current);
    setPhase("thinking");
    setResult(null);
    setAsked((n) => n + 1);
    const e = await loadEngine();
    engine.current = e;
    const wait = prefersReducedMotion() ? 0 : 500 + Math.min(400, q.length * 8);
    timer.current = setTimeout(() => {
      const r = e.ask(q);
      setResult(r);
      setPhase(r.status === "answer" ? "answered" : "refused");
    }, wait);
  }, []);

  const choose = useCallback(
    (p: SuggestedPrompt) => {
      setQuery(p.query);
      submit(p.query);
    },
    [submit],
  );

  const reset = useCallback(() => {
    clearTimeout(timer.current);
    setPhase("idle");
    setResult(null);
    setQuery("");
    requestAnimationFrame(() => document.querySelector<HTMLInputElement>(".ask__input")?.focus());
  }, []);

  const answer = result?.status === "answer" ? result : null;
  const selected = phase === "idle" ? null : (suggestedPrompts.find((p) => p.query === query)?.id ?? null);

  return (
    <section
      className="ask"
      aria-labelledby="ask-title"
      onKeyDown={(e) => {
        if (e.key === "Escape" && phase !== "idle") reset();
      }}
    >
      <h2 id="ask-title" className="lead">
        Ask about my work
      </h2>
      <p className="muted">{askCopy.helper}</p>
      <PromptBox
        value={query}
        onChange={setQuery}
        onSubmit={() => submit(query)}
        onFirstTouch={warm}
        scope={scope}
        busy={phase === "thinking"}
      />
      <ul className="chips" aria-label="Suggested questions">
        {suggestedPrompts.filter((p) => SHOWN.includes(p.id)).map((p) => (
          <li key={p.id}>
            <button
              type="button"
              className="chip"
              aria-pressed={selected === p.id}
              disabled={phase === "thinking"}
              onClick={() => choose(p)}
            >
              {p.label}
            </button>
          </li>
        ))}
      </ul>
      {phase === "thinking" && <ThinkingPanel />}
      {phase === "answered" && answer && (
        <AnswerPanel key={asked} result={answer} matchCount={answer.slugs.length} onPick={choose} onStreaming={() => {}} onReset={reset} />
      )}
      {phase === "refused" && result?.status === "refused" && <RefusalPanel key={asked} result={result} onPick={choose} onReset={reset} />}
    </section>
  );
}
