"use client";

import { useId } from "react";
import type { Strength } from "../../lib/ask/types";
import { STRENGTHS, STRENGTH_LABEL, type StrengthCounts } from "./model";
import { SrTable, plural } from "./parts";

const W = 360;
const ROW_H = 40;
const BAR_Y = 26;
const BAR_H = 8;

/** Four bars, strongest first. Each row is a button: `onPick(strength)` filters to that strength, `selected` marks it. */
export function StrengthBars({
  counts,
  selected = null,
  onPick,
  onClear,
  clearLabel = "Clear",
  caption,
}: {
  counts: StrengthCounts;
  selected?: Strength | null;
  onPick?: (strength: Strength) => void;
  onClear?: () => void;
  clearLabel?: string;
  caption?: string;
}) {
  const uid = useId();
  // Never show a zero row. Counts are never filtered by this chart, so a missing row is genuinely empty.
  const shown = STRENGTHS.filter((s) => counts[s] > 0);
  const max = Math.max(...shown.map((s) => counts[s]), 1);
  const floor = selected ? STRENGTHS.indexOf(selected) : -1;
  const total = STRENGTHS.reduce((n, s) => n + counts[s], 0);

  return (
    <figure className="chart chart-bars">
      <div role="group" aria-labelledby={`${uid}c`} className="chart-bars__list">
        {shown.map((s) => {
          const dim = floor >= 0 && STRENGTHS.indexOf(s) > floor;
          const n = counts[s];
          const w = n > 0 ? Math.max((n / max) * W, 6) : 0;
          return (
            <button
              key={s}
              type="button"
              className="chart-bars__row"
              data-dim={dim || undefined}
              aria-pressed={selected === s}
              aria-label={`${STRENGTH_LABEL[s]}: ${plural(n, "item")}`}
              onClick={() => onPick?.(s)}
              disabled={!onPick}
            >
              <svg viewBox={`0 0 ${W} ${ROW_H}`} className="chart-svg" style={{ aspectRatio: `${W} / ${ROW_H}` }} aria-hidden="true" focusable="false">
                <text className="chart-label chart-label--strong" x={0} y={15}>
                  {STRENGTH_LABEL[s]}
                  <tspan className="chart-num" dx={8}>
                    {n}
                  </tspan>
                </text>
                <rect className="chart-track" x={0} y={BAR_Y} width={W} height={BAR_H} rx={BAR_H / 2} />
                {w > 0 && <rect className={`chart-fill-${s}`} x={0} y={BAR_Y} width={w} height={BAR_H} rx={BAR_H / 2} />}
              </svg>
            </button>
          );
        })}
      </div>
      <figcaption id={`${uid}c`} className="chart-caption">
        {caption ?? `Evidence by strength, ${total} items.`}
        {selected && onClear && (
          <>
            {" "}
            <button type="button" className="chart-clear" onClick={onClear}>
              {clearLabel}
            </button>
          </>
        )}
      </figcaption>
      <SrTable caption="Evidence by strength" head={["Strength", "Items"]} rows={shown.map((s) => [STRENGTH_LABEL[s], counts[s]])} />
    </figure>
  );
}
