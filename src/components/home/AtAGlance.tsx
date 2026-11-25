"use client";

import { useMemo } from "react";
import { facets } from "../../../content/brain/taxonomy";
import { brainCopy } from "../../../content/brain/copy";
import type { Strength } from "../../lib/ask/types";
import { EvidenceTimeline } from "../charts/EvidenceTimeline";
import { SkillProof } from "../charts/SkillProof";
import { StrengthBars } from "../charts/StrengthBars";
import { skillProof, strengthCounts, timeline, type ChartItem } from "../charts/model";

type Props = {
  items: ChartItem[] | null;
  /** Filtered by everything except the strength floor / the skill facet, so those charts never filter themselves. */
  strengthItems: ChartItem[] | null;
  skillItems: ChartItem[] | null;
  minStrength?: Strength;
  onPickStrength: (s: Strength) => void;
  onClearStrength?: () => void;
  selectedSkills?: string[];
  onToggleSkill?: (id: string) => void;
};

// Three charts of whatever is currently filtered (everything, by default).
export function AtAGlance({ items, strengthItems, skillItems, minStrength, onPickStrength, onClearStrength, selectedSkills, onToggleSkill }: Props) {
  const data = useMemo(
    () =>
      items && strengthItems && skillItems
        ? { skills: skillProof(skillItems, facets), counts: strengthCounts(strengthItems), rows: timeline(items) }
        : null,
    [items, strengthItems, skillItems],
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
            <SkillProof
              skills={data.skills}
              selected={selectedSkills}
              onToggle={onToggleSkill}
              title={brainCopy.glance.skills.title}
              caption={brainCopy.glance.skills.caption}
            />
          </div>
          <div className="glance-cell">
            <StrengthBars
              counts={data.counts}
              selected={minStrength ?? null}
              onPick={onPickStrength}
              onClear={onClearStrength}
              clearLabel={brainCopy.glance.clear}
              caption={brainCopy.glance.bars}
            />
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
