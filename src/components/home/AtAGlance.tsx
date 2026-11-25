"use client";

import { useMemo } from "react";
import { facets } from "../../../content/brain/taxonomy";
import { brainCopy } from "../../../content/brain/copy";
import type { Strength } from "../../lib/ask/types";
import { EvidenceTimeline } from "../charts/EvidenceTimeline";
import { SkillRadar } from "../charts/SkillRadar";
import { StrengthBars } from "../charts/StrengthBars";
import { skillScores, strengthCounts, timeline, type ChartItem } from "../charts/model";

type Props = {
  items: ChartItem[] | null;
  minStrength?: Strength;
  onPickStrength: (s: Strength) => void;
};

// Three charts of whatever is currently filtered (everything, by default).
export function AtAGlance({ items, minStrength, onPickStrength }: Props) {
  const data = useMemo(
    () => (items ? { skills: skillScores(items, facets), counts: strengthCounts(items), rows: timeline(items) } : null),
    [items],
  );
  return (
    <section className="home-section container-page" aria-labelledby="glance-title">
      <h2 id="glance-title" className="home-h2">
        {brainCopy.glance.title}
      </h2>
      <p className="home-caption">{brainCopy.glance.caption}</p>
      {data ? (
        <div className="glance-grid">
          <div className="glance-cell">
            <SkillRadar skills={data.skills} caption={brainCopy.glance.radar} />
          </div>
          <div className="glance-cell">
            <StrengthBars counts={data.counts} selected={minStrength ?? null} onPick={onPickStrength} caption={brainCopy.glance.bars} />
          </div>
          <div className="glance-cell glance-cell--wide">
            <EvidenceTimeline rows={data.rows} caption={brainCopy.glance.timeline} />
          </div>
        </div>
      ) : (
        <div className="glance-grid glance-grid--loading" role="status">
          <span className="sr-only">{brainCopy.glance.loading}</span>
        </div>
      )}
    </section>
  );
}
