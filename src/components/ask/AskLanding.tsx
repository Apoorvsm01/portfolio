"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { askCopy, featuredSlugs, shelfCopy, shelves, suggestedPrompts, type SuggestedPrompt } from "../../../content/ask";
import { site } from "../../../content/site";
import { seo } from "../../../content/seo";
import { loadEngine } from "../../lib/ask/load";
import type { AskEngine } from "../../lib/ask/engine";
import type { AskResult, ScopeCheck } from "../../lib/ask/types";
import { FeaturedCarousel } from "../shelves/FeaturedCarousel";
import { Shelf } from "../shelves/Shelf";
import type { ProjectCard } from "../shelves/types";
import { AnswerPanel, RefusalPanel, ThinkingPanel } from "./AnswerPanel";
import { Chips } from "./Chips";
import { Orb, type OrbState } from "./Orb";
import { ScrollBlur } from "./ScrollBlur";
import { useScrollBlur } from "../../lib/use-scroll-blur";
import { PromptBox } from "./PromptBox";

type Phase = "idle" | "thinking" | "answered" | "refused";

const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Runs a state change inside a View Transition, so the prompt box and orb glide to their docked
// positions. Falls back to a plain update where the API is missing.
function morph(update: () => void) {
  const doc = document as Document & {
    startViewTransition?: (cb: () => void) => { ready?: Promise<unknown>; finished?: Promise<unknown>; updateCallbackDone?: Promise<unknown> };
  };
  if (!doc.startViewTransition || prefersReducedMotion() || document.hidden) {
    update();
    return;
  }
  // If the browser never gets to render a frame (background tab), the transition stalls: apply the
  // update anyway rather than leaving the question hanging.
  let ran = false;
  const apply = () => {
    if (ran) return;
    ran = true;
    flushSync(update);
  };
  const transition = doc.startViewTransition(apply);
  // A skipped or aborted transition rejects these promises; that is expected and harmless.
  const ignore = () => undefined;
  transition.ready?.catch(ignore);
  transition.finished?.catch(ignore);
  transition.updateCallbackDone?.catch(ignore);
  setTimeout(apply, 350);
}

export function AskLanding({ projects }: { projects: ProjectCard[] }) {
  const [query, setQuery] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [result, setResult] = useState<AskResult | null>(null);
  const [streaming, setStreaming] = useState(false);
  const [verdict, setVerdict] = useState<{ scope: ScopeCheck }>({ scope: "in" });
  const [ready, setReady] = useState(false);
  const [pulse, setPulse] = useState(0);
  const [asked, setAsked] = useState(0);
  const heroRef = useScrollBlur<HTMLElement>("out", 14);
  const engine = useRef<AskEngine | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const bySlug = useMemo(() => new Map(projects.map((p) => [p.slug, p])), [projects]);
  const pick = (slugs: string[]) => slugs.map((s) => bySlug.get(s)).filter((p): p is ProjectCard => Boolean(p));

  const warm = useCallback(() => {
    loadEngine().then((e) => {
      engine.current = e;
      setReady(true);
    });
  }, []);

  // Load the retrieval engine once the page is idle, so the first question is instant.
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
    const t = setTimeout(() => setVerdict({ scope: e.scope(query) }), 200);
    return () => clearTimeout(t);
  }, [query, ready]);
  const scope: ScopeCheck = query.trim() ? verdict.scope : "empty";

  const submit = useCallback(async (raw: string) => {
    const q = raw.trim();
    if (!q) return;
    clearTimeout(timer.current);
    morph(() => {
      setPhase("thinking");
      setResult(null);
    });
    setPulse((n) => n + 1);
    setAsked((n) => n + 1);
    const e = await loadEngine();
    engine.current = e;
    const wait = prefersReducedMotion() ? 0 : 700 + Math.min(500, q.length * 8);
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

  const resetState = useCallback(() => {
    clearTimeout(timer.current);
    morph(() => {
      setPhase("idle");
      setResult(null);
      setQuery("");
      setStreaming(false);
    });
  }, []);

  // "Ask something else": back to the empty prompt, ready to type.
  const reset = useCallback(() => {
    resetState();
    requestAnimationFrame(() => document.querySelector<HTMLInputElement>(".ask-input")?.focus());
  }, [resetState]);

  // The default home page: empty prompt, scrolled to the top. Used by the Back button and the nav name.
  const goHome = useCallback(() => {
    resetState();
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [resetState]);

  useEffect(() => {
    window.addEventListener("ask:reset", goHome);
    return () => window.removeEventListener("ask:reset", goHome);
  }, [goHome]);

  const orbState: OrbState = phase === "thinking" ? "thinking" : streaming ? "speaking" : "idle";
  const answer = result?.status === "answer" ? result : null;
  const matches = answer ? pick(answer.slugs) : [];
  const [lead, tail] = askCopy.greeting.split(askCopy.greetingAccent);

  // Each project shows once below the hero: the carousel first, then each shelf takes what is left.
  const shown = new Set<string>(pick(featuredSlugs).map((p) => p.slug));
  const shelfRows = shelves.map((s) => {
    const items = pick(s.slugs).filter((p) => !shown.has(p.slug));
    items.forEach((p) => shown.add(p.slug));
    return { ...s, items };
  });

  return (
    <>
      <section
        ref={heroRef}
        className="ask-hero container-page scroll-blur"
        data-docked={phase !== "idle"}
        aria-labelledby="ask-identity"
        onKeyDown={(e) => {
          if (e.key === "Escape" && phase !== "idle") reset();
        }}
      >
        <div className="ask-aurora" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        {phase !== "idle" && (
          <button type="button" className="ask-back" onClick={goHome}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M19 12H5M11 6l-6 6 6 6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>Back to home</span>
          </button>
        )}
        <Orb state={orbState} />
        {/* Who this is, before anything else: the page's real heading, for people and for crawlers. */}
        <div className="ask-identity">
          <h1 id="ask-identity" className="ask-identity-name">
            {site.name} <span className="ask-identity-sep" aria-hidden="true">·</span>{" "}
            <span className="ask-identity-role">{seo.roleLine}</span>
          </h1>
          <p className="ask-status">
            <span className="ask-status-dot" aria-hidden="true" />
            {seo.status}
          </p>
        </div>
        <h2 id="ask-greeting" className="ask-greeting">
          {lead}
          <span className="shimmer-text">{askCopy.greetingAccent}</span>
          {tail}
        </h2>
        <p className="ask-helper">{askCopy.helper}</p>
        <PromptBox
          value={query}
          onChange={setQuery}
          onSubmit={() => submit(query)}
          onFirstTouch={warm}
          scope={scope}
          busy={phase === "thinking"}
        />
        <Chips prompts={suggestedPrompts} onPick={choose} disabled={phase === "thinking"} />

        {phase === "thinking" && <ThinkingPanel />}
        {phase === "answered" && answer && (
          <AnswerPanel key={asked} result={answer} matchCount={matches.length} onPick={choose} onStreaming={setStreaming} onReset={reset} />
        )}
        {phase === "refused" && result?.status === "refused" && <RefusalPanel key={asked} result={result} onPick={choose} onReset={reset} />}
      </section>

      {pulse > 0 && <div key={pulse} className="edge-glow" aria-hidden="true" />}

      <div className="container-page">
        <ScrollBlur>
          <FeaturedCarousel projects={pick(featuredSlugs)} />
        </ScrollBlur>
        <div className="shelves">
          {matches.length > 0 && (
            <ScrollBlur key={`matches-${asked}`}>
              <Shelf
                id="ask-matches"
                title={shelfCopy.matchesTitle}
                kicker={shelfCopy.matchesKicker}
                projects={matches}
                matches
                enter
              />
            </ScrollBlur>
          )}
          {shelfRows.map((s) => (
            <ScrollBlur key={s.id}>
              <Shelf id={`shelf-${s.id}`} title={s.title} kicker={s.kicker} projects={s.items} />
            </ScrollBlur>
          ))}
        </div>
      </div>
    </>
  );
}
