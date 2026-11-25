"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { brainCopy } from "../../../content/brain/copy";
import { copyText } from "../../lib/copy-text";
import { useId } from "react";
import type { Token } from "./state";

type Props = {
  count: number | null;
  tokens: Token[];
  onRemove: (token: Token) => void;
  onClear: () => void;
  buildSummary: () => string;
  compact: boolean;
  match: "all" | "any";
  facetCount: number;
  onMatch: (m: "all" | "any") => void;
  // Controls that share the bar: one before the count, one at the far end.
  start?: ReactNode;
  end?: ReactNode;
};

type Status = "link" | "summary" | "failed" | null;

export function QueryBar({ count, tokens, onRemove, onClear, buildSummary, compact, match, facetCount, onMatch, start, end }: Props) {
  const matchName = useId();
  const [status, setStatus] = useState<Status>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  async function copy(kind: "link" | "summary") {
    const text = kind === "link" ? window.location.href : buildSummary();
    const ok = await copyText(text);
    setStatus(ok ? kind : "failed");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setStatus(null), 2000);
  }

  const matchControl =
    facetCount >= 2 ? (
      <fieldset className="brain-match">
        <legend className="sr-only">{brainCopy.bar.matchLegend}</legend>
        {(["all", "any"] as const).map((m) => (
          <span key={m} className="brain-match-option">
            <input id={`${matchName}-${m}`} type="radio" name={matchName} className="brain-segment-input" checked={match === m} onChange={() => onMatch(m)} />
            <label htmlFor={`${matchName}-${m}`} className="brain-segment-label">
              {m === "all" ? brainCopy.bar.matchAll : brainCopy.bar.matchAny}
            </label>
          </span>
        ))}
      </fieldset>
    ) : null;

  const actions = (
    <>
      {tokens.length > 0 && (
        <button type="button" className="brain-link-button" onClick={onClear}>
          {brainCopy.bar.clear}
        </button>
      )}
      <button type="button" className="brain-link-button" onClick={() => copy("link")}>
        {status === "link" ? brainCopy.bar.copied : brainCopy.bar.copyLink}
      </button>
      <button type="button" className="brain-link-button" onClick={() => copy("summary")} disabled={count === null}>
        {status === "summary" ? brainCopy.bar.copied : brainCopy.bar.copySummary}
      </button>
    </>
  );

  return (
    <div className="brain-bar" role="region" aria-label={brainCopy.bar.label}>
      <div className="container-page brain-bar-inner">
        {start}
        <p className="brain-count" aria-live="polite" aria-atomic="true">
          {count === null ? brainCopy.bar.loading : brainCopy.bar.showing(count)}
        </p>
        {tokens.length > 0 && (
          <ul className="brain-tokens">
            {tokens.map((t) => {
              const k = t.kind === "facet" ? `${t.group}:${t.id}` : t.kind === "source" ? `source:${t.key}` : t.kind;
              return (
                <li key={k}>
                  <button type="button" className="brain-token" onClick={() => onRemove(t)} aria-label={brainCopy.bar.remove(t.label)}>
                    <span>{t.label}</span>
                    <span aria-hidden="true" className="brain-token-x">
                      ×
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
        {!compact && matchControl}
        {compact ? (
          <details className="brain-share">
            <summary className="brain-share-summary">{brainCopy.bar.share}</summary>
            <div className="brain-share-panel">
              {matchControl}
              {actions}
            </div>
          </details>
        ) : (
          <div className="brain-actions">{actions}</div>
        )}
        {end && <div className="brain-bar-end">{end}</div>}
        <span className="sr-only" aria-live="polite">
          {status === "failed" ? brainCopy.bar.copyFailed : status ? brainCopy.bar.copied : ""}
        </span>
      </div>
    </div>
  );
}
