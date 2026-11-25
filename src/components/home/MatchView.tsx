"use client";

import { forwardRef } from "react";
import { facets } from "../../../content/brain/taxonomy";
import { brainCopy } from "../../../content/brain/copy";
import type { SourceGroup } from "../../lib/ask/types";
import { MatchRing } from "../charts/MatchRing";
import { RequirementMap } from "../charts/RequirementMap";
import { coverage, strengthScore, type ChartItem, type Requirement } from "../charts/model";

type Props = {
  title?: string;
  company?: string;
  requirements: Requirement[];
  items: ChartItem[];
  groups: SourceGroup[];
  onClose: () => void;
};

// Job description mode: how much of the posting the evidence backs, and which work backs which requirement.
// The heading takes focus when the view opens, so keyboard and screen reader users land on it.
export const MatchView = forwardRef<HTMLHeadingElement, Props>(function MatchView({ title, company, requirements, items, groups, onClose }, headingRef) {
  const score = strengthScore(requirements, items);
  const backed = coverage(requirements, items).matched.length;
  return (
    <section id="match" className="home-section home-match container-page" aria-labelledby="match-title">
      <div className="home-match-head">
        <h2 id="match-title" ref={headingRef} tabIndex={-1} className="home-h2">
          {brainCopy.jd.heading(title, company)}
        </h2>
        <button type="button" className="brain-link-button" onClick={onClose}>
          {brainCopy.jd.close}
        </button>
      </div>
      <p className="home-caption">{brainCopy.jd.lede(backed, requirements.length)}</p>
      <div className="match-grid">
        <div className="match-ring">
          <MatchRing pct={score.pct} counts={score.counts} missing={score.missing} total={requirements.length} />
        </div>
        <div className="match-map">
          <RequirementMap requirements={requirements} groups={groups} taxonomy={facets} />
        </div>
      </div>
    </section>
  );
});
