"use client";

import Link from "next/link";
import { useState } from "react";
import { facetGroups, facets } from "../../../content/brain/taxonomy";
import { brainCopy } from "../../../content/brain/copy";
import type { Chunk, FilterItem, Strength } from "../../lib/ask/types";

const STAGGER_CAP = 12;

// The claim is the main line; anything after it is optional detail behind "More".
export function splitClaim(chunk: Chunk): { claim: string; detail: string } {
  if (chunk.kind === "evidence") {
    const detail = chunk.text.startsWith(chunk.title) ? chunk.text.slice(chunk.title.length).trim() : "";
    return { claim: chunk.title, detail };
  }
  if (chunk.claim) {
    const detail = chunk.text.startsWith(chunk.claim) ? chunk.text.slice(chunk.claim.length).trim() : "";
    return { claim: chunk.claim, detail };
  }
  const m = chunk.text.match(/^(.{20,220}?[.!?])(\s|$)/);
  if (m) return { claim: m[1], detail: chunk.text.slice(m[0].length).trim() };
  return { claim: chunk.text.length > 220 ? `${chunk.text.slice(0, 217).trimEnd()}…` : chunk.text, detail: "" };
}

export const yearOf = (chunk: Chunk) => chunk.date?.slice(0, 4);

const labelFor = (group: (typeof facetGroups)[number], id: string) => facets[group].find((e) => e.id === id)?.label ?? id;

function SourceLink({ chunk }: { chunk: Chunk }) {
  const label = chunk.label || brainCopy.results.sourceFallback;
  if (chunk.href.startsWith("/work/")) {
    return (
      <Link href={chunk.href} className="brain-source">
        {label}
      </Link>
    );
  }
  if (/^https?:\/\//.test(chunk.href)) {
    return (
      <a href={chunk.href} target="_blank" rel="noopener noreferrer" className="brain-source">
        {label}
        <span className="sr-only">{brainCopy.results.opensInNewTab}</span>
      </a>
    );
  }
  return <span>{label}</span>;
}

function Row({ item, index, of }: { item: FilterItem; index: number; of?: number }) {
  const [open, setOpen] = useState(false);
  const { chunk } = item;
  const { claim, detail } = splitClaim(chunk);
  const strength = chunk.strength as Strength | undefined;
  const year = yearOf(chunk);
  const matched = facetGroups.flatMap((g) => (item.matched[g] ?? []).map((id) => labelFor(g, id)));
  const detailId = `brain-detail-${chunk.id.replace(/[^a-z0-9]+/gi, "-")}`;
  return (
    <li className="brain-row" style={{ "--i": Math.min(index, STAGGER_CAP) } as React.CSSProperties}>
      <p className="brain-claim">{claim}</p>
      <div className="brain-meta">
        {strength && (
          <span className="brain-pill" data-strength={strength}>
            {brainCopy.strength.pillLabels[strength]}
          </span>
        )}
        <SourceLink chunk={chunk} />
        {year && <span>{year}</span>}
        {of !== undefined && <span>{brainCopy.results.matches(matched.length, of)}</span>}
        {matched.length > 0 && <span className="brain-matched">{matched.join(", ")}</span>}
        {detail && (
          <button type="button" className="brain-link-button" aria-expanded={open} aria-controls={detailId} onClick={() => setOpen((v) => !v)}>
            {open ? brainCopy.results.less : brainCopy.results.more}
          </button>
        )}
      </div>
      {detail && (
        <p id={detailId} className="brain-detail" hidden={!open}>
          {detail}
        </p>
      )}
    </li>
  );
}

type Props = {
  items: FilterItem[];
  total: number;
  showAll: boolean;
  onShowAll: () => void;
  lastLabel?: string;
  onRemoveLast: () => void;
  onClear: () => void;
  anyFilter: boolean;
  generation: string;
  match: "all" | "any";
  facetCount: number;
  onMatchAny: () => void;
};

export function ResultList({ items, total, showAll, onShowAll, lastLabel, onRemoveLast, onClear, anyFilter, generation, match, facetCount, onMatchAny }: Props) {
  const visible = showAll ? items : items.slice(0, 12);
  if (total === 0) {
    return (
      <div className="brain-empty">
        <p className="brain-empty-title">{anyFilter ? brainCopy.results.empty : brainCopy.results.emptyNoFilters}</p>
        {lastLabel && <p className="brain-empty-hint">{brainCopy.results.emptyHint(lastLabel)}</p>}
        <div className="brain-empty-actions">
          {lastLabel && (
            <button type="button" className="brain-button" onClick={onRemoveLast}>
              {brainCopy.results.emptyRemove(lastLabel)}
            </button>
          )}
          {match === "all" && facetCount >= 2 && (
            <button type="button" className="brain-button" onClick={onMatchAny}>
              {brainCopy.results.matchAnyInstead}
            </button>
          )}
          {anyFilter && (
            <button type="button" className="brain-link-button" onClick={onClear}>
              {brainCopy.results.emptyClear}
            </button>
          )}
        </div>
      </div>
    );
  }
  return (
    <>
      <ol key={generation} className="brain-list">
        {visible.map((item, i) => (
          <Row key={item.chunk.id} item={item} index={i} of={match === "any" && facetCount >= 2 ? facetCount : undefined} />
        ))}
      </ol>
      {!showAll && total > visible.length && (
        <button type="button" className="brain-button brain-showall" onClick={onShowAll}>
          {brainCopy.results.showAll(total)}
        </button>
      )}
    </>
  );
}
