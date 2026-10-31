"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { AskAnswer, AskRefusal, SourceRef } from "../../lib/ask/types";
import { askCopy, type SuggestedPrompt } from "../../../content/ask";
import { copyText } from "../../lib/copy-text";
import { useReducedMotion } from "../../lib/use-reduced-motion";
import { Sparkle } from "./Sparkle";

const LINKISH = /^(https?:\/\/[^\s]+?|[\w.+-]+@[\w-]+\.[\w.-]+?)([.,;:)]*)(\s*)$/;

// A mailto: link does nothing without a mail app, so an email in an answer also gets a Copy button.
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className="ask-copy"
      onClick={async () => {
        if (await copyText(text)) {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }
      }}
      aria-label={copied ? "Email copied" : `Copy ${text}`}
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

function Token({ text }: { text: string }) {
  const m = text.match(LINKISH);
  if (!m) return <span className="tok">{text}</span>;
  const [, url, trail, space] = m;
  const isEmail = url.includes("@") && !url.startsWith("http");
  const href = isEmail ? `mailto:${url}` : url;
  return (
    <span className="tok">
      <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className="underline underline-offset-4 decoration-[var(--ai-3)] hover:text-fg">
        {url}
      </a>
      {isEmail && <CopyButton text={url} />}
      {trail}
      {space}
    </span>
  );
}

function SourceChip({ source, index }: { source: SourceRef; index: number }) {
  const style = { "--i": index } as React.CSSProperties;
  const arrow = <span aria-hidden="true">{source.external ? "↗" : "→"}</span>;
  if (source.external) {
    return (
      <a className="ask-source" style={style} href={source.href} target={source.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer">
        {source.label} {arrow}
      </a>
    );
  }
  return (
    <Link className="ask-source" style={style} href={source.href}>
      {source.label} {arrow}
    </Link>
  );
}

const words = (text: string) => text.match(/\S+\s*/g) ?? [];

type AnswerProps = {
  result: AskAnswer;
  matchCount: number;
  onPick: (p: SuggestedPrompt) => void;
  onStreaming: (streaming: boolean) => void;
  onReset: () => void;
};

// Writes the answer word by word: each word fades in out of a blur. The text itself is already composed
// from the site's own copy; streaming is purely the reveal.
export function AnswerPanel({ result, matchCount, onPick, onStreaming, onReset }: AnswerProps) {
  const lead = useMemo(() => words(result.lead), [result.lead]);
  const bullets = useMemo(() => result.bullets.map((b) => words(b.text)), [result.bullets]);
  const total = lead.length + bullets.reduce((n, b) => n + b.length, 0);
  const reduced = useReducedMotion();
  const [streamed, setStreamed] = useState(0);
  const shown = reduced ? total : streamed;
  const done = shown >= total;

  // The updater stays pure; telling the parent about streaming happens in effects, never during render.
  useEffect(() => {
    if (reduced || done) return;
    const perTick = total > 90 ? 2 : 1;
    const id = setInterval(() => setStreamed((n) => Math.min(total, n + perTick)), 34);
    return () => clearInterval(id);
  }, [reduced, done, total]);

  useEffect(() => {
    onStreaming(!done);
  }, [done, onStreaming]);
  useEffect(() => () => onStreaming(false), [onStreaming]);

  // First word index of each block, so a block shows only the words the stream has reached.
  const starts = bullets.reduce<number[]>((acc, b, i) => [...acc, i === 0 ? lead.length : acc[i - 1] + bullets[i - 1].length], []);
  const renderWords = (list: string[], start: number) =>
    list.map((w, i) => (start + i < shown ? <Token key={i} text={w} /> : null));

  return (
    <article className="ask-answer" aria-live="polite" aria-label="Answer">
      <div className="ask-answer-head">
        <Sparkle busy={!done} />
        <span>{result.headline}</span>
      </div>
      <p className="ask-lead">{renderWords(lead, 0)}</p>
      {result.bullets.length > 0 && (
        <ul className="ask-bullets">
          {bullets.map((b, i) => (
            <li key={i} hidden={starts[i] >= shown}>
              {renderWords(b, starts[i])}
            </li>
          ))}
        </ul>
      )}
      {done && (
        <>
          {result.sources.length > 0 && (
            <>
              <p className="ask-label">{askCopy.sourcesLabel}</p>
              <ul className="ask-sources">
                {result.sources.map((s, i) => (
                  <li key={s.href + s.label}>
                    <SourceChip source={s} index={i} />
                  </li>
                ))}
                {matchCount > 0 && (
                  <li>
                    <a className="ask-source" style={{ "--i": result.sources.length } as React.CSSProperties} href="#ask-matches">
                      See {matchCount} matching {matchCount === 1 ? "project" : "projects"} <span aria-hidden="true">↓</span>
                    </a>
                  </li>
                )}
              </ul>
            </>
          )}
          {result.followUps.length > 0 && (
            <>
              <p className="ask-label">{askCopy.followUpsLabel}</p>
              <ul className="ask-followups">
                {result.followUps.map((p, i) => (
                  <li key={p.id}>
                    <button type="button" className="ask-followup" style={{ "--i": i } as React.CSSProperties} onClick={() => onPick(p)}>
                      {p.label}
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
          <button type="button" className="ask-reset" onClick={onReset}>
            Ask something else
          </button>
        </>
      )}
    </article>
  );
}

export function RefusalPanel({ result, onPick, onReset }: { result: AskRefusal; onPick: (p: SuggestedPrompt) => void; onReset: () => void }) {
  return (
    <article className="ask-answer ask-refusal" role="status" aria-label="Out of scope">
      <div className="ask-answer-head">
        <Sparkle />
        <span>{result.reason === "empty" ? "Ask me something" : "Out of scope"}</span>
      </div>
      <p className="ask-lead">{result.message}</p>
      <p className="ask-label">{askCopy.refusals.tryInstead}</p>
      <ul className="ask-followups">
        {result.suggestions.map((p, i) => (
          <li key={p.id}>
            <button type="button" className="ask-followup" style={{ "--i": i } as React.CSSProperties} onClick={() => onPick(p)}>
              {p.label}
            </button>
          </li>
        ))}
      </ul>
      <button type="button" className="ask-reset" onClick={onReset}>
        Clear and start over
      </button>
    </article>
  );
}

export function ThinkingPanel() {
  return (
    <article className="ask-answer" aria-live="polite" aria-busy="true" aria-label="Searching">
      <div className="ask-answer-head">
        <Sparkle busy />
        <span>{askCopy.thinking}</span>
      </div>
      <div className="ask-skeleton">
        <i />
        <i />
        <i />
      </div>
    </article>
  );
}
