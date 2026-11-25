import type { Strength } from "../../lib/ask/types";
import { STRENGTHS, STRENGTH_LABEL, type SkillProof as Row } from "./model";

const countLine = (r: Row) =>
  STRENGTHS.filter((s) => r.counts[s] > 0)
    .map((s) => `${r.counts[s]} ${s}`)
    .join(" · ");

/**
 * What each skill is proven by: strongest evidence as a badge, the count line, and a bar of the skill's OWN mix.
 * Every bar is full width, so no skill reads as smaller than another.
 */
export function SkillProof({
  skills,
  selected = [],
  onToggle,
  title,
  caption,
}: {
  skills: Row[];
  selected?: string[];
  onToggle?: (id: string) => void;
  title: string;
  caption: string;
}) {
  if (skills.length === 0) return <p className="chart-empty">No skills to show yet.</p>;
  return (
    <div className="chart skill-proof">
      <h3 className="skill-proof__title">{title}</h3>
      <p className="chart-caption skill-proof__caption">{caption}</p>
      <ul className="skill-proof__list">
        {skills.map((r) => {
          const spoken = countLine(r).replaceAll(" · ", ", ");
          return (
            <li key={r.id}>
              <button
                type="button"
                className="skill-proof__row"
                aria-pressed={selected.includes(r.id)}
                aria-label={`${r.label}: proven by ${r.strongest} work. ${spoken}. Filter by ${r.label}.`}
                onClick={() => onToggle?.(r.id)}
                disabled={!onToggle}
              >
                <span className="skill-proof__head">
                  <span className="skill-proof__label">{r.label}</span>
                  <span className="brain-pill" data-strength={r.strongest satisfies Strength}>
                    {STRENGTH_LABEL[r.strongest]}
                  </span>
                </span>
                <span className="skill-proof__counts">{countLine(r)}</span>
                <span className="skill-proof__bar" aria-hidden="true">
                  {STRENGTHS.filter((s) => r.counts[s] > 0).map((s) => (
                    <span key={s} className={`skill-proof__seg chart-bg-${s}`} style={{ flexGrow: r.counts[s] }} />
                  ))}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
