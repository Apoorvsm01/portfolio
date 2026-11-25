import { useId } from "react";
import { SrTable } from "./parts";

const S = 200;
const C = S / 2;
const STROKE = 16;
const R = (S - STROKE) / 2 - 4;
const CIRC = 2 * Math.PI * R;

/** Donut of the share of requirements backed by evidence. The arc draws in again whenever `pct` changes. */
export function MatchRing({ pct, matched, total }: { pct: number; matched: number; total: number }) {
  const uid = useId();
  const p = Math.min(Math.max(Math.round(pct), 0), 100);
  const offset = CIRC * (1 - p / 100);
  const caption = `${matched} of ${total} requirements backed by evidence`;

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
      <SrTable caption="Requirement match" head={["Measure", "Value"]} rows={[["Matched", matched], ["Total", total], ["Percent", `${p}%`]]} />
    </figure>
  );
}
