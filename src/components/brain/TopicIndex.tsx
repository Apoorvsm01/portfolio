"use client";

import { facetGroups, facets, type FacetGroup } from "../../../content/brain/taxonomy";
import { brainCopy } from "../../../content/brain/copy";
import type { FacetCount } from "../../lib/ask/types";

type Props = {
  counts: Map<string, FacetCount>;
  selected: Record<FacetGroup, string[]>;
  onToggle: (group: FacetGroup, id: string) => void;
  ready: boolean;
};

// Three sizes by count: 0, low (at or under the median of the non-zero counts) and high.
export function sizeSteps(counts: Iterable<number>): { median: number } {
  const nonZero = [...counts].filter((n) => n > 0).sort((a, b) => a - b);
  return { median: nonZero.length ? nonZero[Math.floor((nonZero.length - 1) / 2)] : 0 };
}

export function TopicIndex({ counts, selected, onToggle, ready }: Props) {
  const { median } = sizeSteps([...counts.values()].map((c) => c.count));
  return (
    <div className="brain-index">
      {facetGroups.map((group) => {
        const labelId = `brain-group-${group}`;
        return (
          <section key={group} aria-labelledby={labelId} className="brain-group">
            <h3 id={labelId} className="brain-group-label">
              {brainCopy.topics.groupLabels[group]}
            </h3>
            <ul className="brain-topics">
              {facets[group].map((entry) => {
                const info = counts.get(`${group}:${entry.id}`);
                const count = info?.count ?? 0;
                const on = selected[group].includes(entry.id);
                const size = !ready || count === 0 ? "zero" : count <= median ? "low" : "high";
                return (
                  <li key={entry.id}>
                    <button
                      type="button"
                      className="brain-topic"
                      aria-pressed={on}
                      aria-label={ready ? brainCopy.topics.count(entry.label, count) : undefined}
                      data-size={on ? (size === "zero" ? "low" : size) : size}
                      data-dim={ready && count === 0 && !on ? "true" : undefined}
                      onClick={() => onToggle(group, entry.id)}
                    >
                      <span>{entry.label}</span>
                      {ready && (
                        <sup className="brain-topic-count" aria-hidden="true">
                          {count}
                        </sup>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
