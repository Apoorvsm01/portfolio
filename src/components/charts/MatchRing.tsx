import { useId } from "react";
import { STRENGTHS, type StrengthCounts } from "./model";
import { SrTable } from "./parts";

const S = 200;
const C = S / 2;
const STROKE = 16;
const R = (S - STROKE) / 2 - 4;
const CIRC = 2 * Math.PI * R;

/** Donut of the strength-weighted match, with a per-strength breakdown. The arc draws in again whenever `pct` changes. */
export function MatchRing({ pct, counts, missing, total }: { pct: number; counts: StrengthCounts; missing: number; total: number }) {
  const uid = useId();
  const p = Math.min(Math.max(Math.round(pct), 0), 100);
  const offset = CIRC * (1 - p / 100);
  const caption = `Evidence strength across ${total} ${total === 1 ? "requirement" : "requirements"}`;
  const parts = [...STRENGTHS.filter((st) => st !== "watched" || counts.watched > 0).map((st) => ({ key: st as string, n: counts[st], label: st })), { key: "missing", n: missing, label: "missing" }];

  return (
    <figure className="chart chart-ring">
      <svg className="chart-svg" viewBox={`0 0 ${S} ${S}`} role="img" aria-labelledby={`${uid}t ${uid}d`} style={{ aspectRatio: "1 / 1" }}>
        <title id={`${uid}t`}>Requirement match</title>
        <desc id={`${uid}d`}>{`${p} percent. ${caption}.`}</desc>
        <circle className="chart-ring__track" cx={C} cy={C} r={R} strokeWidth={STROKE} />
        {p > 0 && (
          <circle
            key={p}
            className="chart-ring__arc"
            cx={C}
            cy={C}
            r={R}
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={CIRC}
            strokeDashoffset={offset}
            transform={`rotate(-90 ${C} ${C})`}
            style={{ ["--ring-c" as string]: CIRC }}
          />
        )}
        <text className="chart-ring__num" x={C} y={C} textAnchor="middle" dominantBaseline="central">
          {p}
          <tspan className="chart-ring__pct" dx={2}>
            %
          </tspan>
        </text>
      </svg>
      <figcaption className="chart-caption chart-caption--center">{caption}</figcaption>
      <ul className="chart-breakdown">
        {parts.map((part) => (
          <li key={part.key}>
            <span className="ev-dot" data-strength={part.key === "missing" ? undefined : part.key} data-missing={part.key === "missing" ? "true" : undefined} aria-hidden="true" />
            {part.n} {part.label}
          </li>
        ))}
      </ul>
      <SrTable caption="Requirement match" head={["Measure", "Value"]} rows={[...parts.map((part) => [part.label, part.n]), ["Score", `${p}%`]]} />
    </figure>
  );
}
