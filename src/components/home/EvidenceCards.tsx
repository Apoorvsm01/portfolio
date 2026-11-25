"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { brainCopy } from "../../../content/brain/copy";
import type { SourceGroup, Strength } from "../../lib/ask/types";
import { splitClaim } from "../brain/claims";

const TOP_CLAIMS = 3;

function Card({ group }: { group: SourceGroup }) {
  const [open, setOpen] = useState(false);
  const listId = useId();
  const rest = group.items.length - TOP_CLAIMS;
  const shown = open ? group.items : group.items.slice(0, TOP_CLAIMS);
  const meta = [group.org && group.org !== group.label ? group.org : undefined, brainCopy.results.points(group.items.length)].filter(Boolean).join(" · ");

  return (
    <li className="ev-card" data-strength={group.strongest}>
      <div className="ev-card-head">
        <h3 className="ev-card-title">{group.label}</h3>
        {group.strongest && (
          <span className="brain-pill" data-strength={group.strongest}>
            {brainCopy.strength.pillLabels[group.strongest]}
          </span>
        )}
      </div>
      <p className="ev-card-meta">{meta}</p>
      <ul id={listId} className="ev-claims">
        {shown.map((it) => {
          const strength = it.chunk.strength as Strength | undefined;
          return (
            <li key={it.chunk.id} className="ev-claim">
              <span className="ev-dot" data-strength={strength} aria-hidden="true" />
              {strength && <span className="sr-only">{brainCopy.strength.pillLabels[strength]}: </span>}
              {splitClaim(it.chunk).claim}
            </li>
          );
        })}
      </ul>
      <div className="ev-card-foot">
        {rest > 0 && (
          <button type="button" className="brain-link-button" aria-expanded={open} aria-controls={listId} onClick={() => setOpen((v) => !v)}>
            {open ? brainCopy.results.fewerClaims : brainCopy.results.moreClaims(rest)}
          </button>
        )}
        {group.slug && (
          <Link href={`/work/${group.slug}/`} className="ev-case-link">
            {brainCopy.results.caseStudy} <span aria-hidden="true">→</span>
          </Link>
        )}
      </div>
    </li>
  );
}

type Props = {
  groups: SourceGroup[];
  points: number;
  showAll: boolean;
  onShowAll: () => void;
  lastLabel?: string;
  onRemoveLast: () => void;
  onClear: () => void;
  anyFilter: boolean;
  match: "all" | "any";
  facetCount: number;
  onMatchAny: () => void;
};

const FIRST_PAGE = 9;

// Evidence grouped by source: one card per case study, employer or project.
export function EvidenceCards({ groups, points, showAll, onShowAll, lastLabel, onRemoveLast, onClear, anyFilter, match, facetCount, onMatchAny }: Props) {
  if (groups.length === 0) {
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
  const visible = showAll ? groups : groups.slice(0, FIRST_PAGE);
  return (
    <>
      <p className="home-caption">{brainCopy.results.caption(points, groups.length)}</p>
      <ul className="ev-grid">
        {visible.map((g) => (
          <Card key={g.key} group={g} />
        ))}
      </ul>
      {!showAll && groups.length > FIRST_PAGE && (
        <button type="button" className="brain-button brain-showall" onClick={onShowAll}>
          {brainCopy.results.showAllSources(groups.length)}
        </button>
      )}
    </>
  );
}
