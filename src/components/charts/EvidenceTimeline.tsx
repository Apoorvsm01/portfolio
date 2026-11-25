import { useId } from "react";
import type { Strength } from "../../lib/ask/types";
import { STRENGTHS, STRENGTH_LABEL, type YearRow } from "./model";
import { SrTable } from "./parts";

const H = 232;
const TOP = 30;
const BASE = 192;
const PAD = 14;
const TIP_W = 112;
const TIP_LINE = 15;

const breakdown = (r: YearRow) => STRENGTHS.filter((s) => r[s] > 0).map((s) => `${r[s]} ${s}`);

/** Stacked columns per year, strongest evidence at the bottom. Columns take focus and show a tooltip on hover or focus. */
export function EvidenceTimeline({ rows, caption }: { rows: YearRow[]; caption?: string }) {
  const uid = useId();
  if (rows.length === 0) return <p className="chart-empty">No dated evidence to chart yet.</p>;

  const n = rows.length;
  const W = Math.max(420, n * 36 + PAD * 2);
  const colW = (W - PAD * 2) / n;
  const barW = Math.min(colW * 0.64, 26);
  const max = Math.max(...rows.map((r) => r.total), 1);
  const scale = (BASE - TOP) / max;
  const first = rows[0].year;
  const last = rows[n - 1].year;
  const title = "Evidence over time";
  const desc = `Evidence items per year from ${first} to ${last}, stacked by strength with the strongest at the bottom.`;

  return (
    <figure className="chart chart-timeline">
      <div className="chart-scroll">
        <svg
          className="chart-svg"
          viewBox={`0 0 ${W} ${H}`}
          role="group"
          aria-labelledby={`${uid}t ${uid}d`}
          style={{ aspectRatio: `${W} / ${H}`, minWidth: Math.round(W * 0.8) }}
        >
          <title id={`${uid}t`}>{title}</title>
          <desc id={`${uid}d`}>{desc}</desc>
          <line className="chart-baseline" x1={PAD} y1={BASE} x2={W - PAD} y2={BASE} />
          {rows.map((r, i) => {
            const cx = PAD + colW * i + colW / 2;
            let y = BASE;
            const parts = breakdown(r);
            const label = `${r.year}: ${parts.length ? parts.join(", ") : "no evidence"}`;
            const tipH = TIP_LINE * (parts.length + 1) + 10;
            const tipX = Math.min(Math.max(cx - TIP_W / 2, 2), W - TIP_W - 2);
            const tipY = Math.max(BASE - r.total * scale - tipH - 8, 2);
            return (
              <g key={r.year} className="chart-col" tabIndex={0} role="img" aria-label={label}>
                <rect className="chart-col__hit" x={cx - colW / 2} y={0} width={colW} height={H} />
                <rect className="chart-col__ring" x={cx - colW / 2 + 1} y={1} width={colW - 2} height={H - 2} rx={6} />
                {STRENGTHS.map((s) => {
                  const h = r[s] * scale;
                  if (h <= 0) return null;
                  y -= h;
                  return <rect key={s} className={`chart-fill-${s} chart-seg`} x={cx - barW / 2} y={y} width={barW} height={h} rx={2} />;
                })}
                {r.total > 0 && (
                  <text className="chart-num chart-num--small" x={cx} y={BASE - r.total * scale - 6} textAnchor="middle">
                    {r.total}
                  </text>
                )}
                <text className="chart-label chart-label--axis" x={cx} y={BASE + 20} textAnchor="middle">
                  {r.year}
                </text>
                <g className="chart-tip" transform={`translate(${tipX} ${tipY})`} aria-hidden="true">
                  <rect className="chart-tip__box" width={TIP_W} height={tipH} rx={8} />
                  <text className="chart-label chart-label--strong" x={10} y={TIP_LINE}>
                    {r.year}
                  </text>
                  {parts.length === 0 && (
                    <text className="chart-label" x={10} y={TIP_LINE * 2}>
                      none
                    </text>
                  )}
                  {STRENGTHS.filter((s) => r[s] > 0).map((s, k) => (
                    <g key={s} transform={`translate(10 ${TIP_LINE * (k + 2) - 4})`}>
                      <rect className={`chart-fill-${s}`} width={8} height={8} rx={2} y={-6} />
                      <text className="chart-label" x={14} y={0}>
                        {r[s]} {STRENGTH_LABEL[s].toLowerCase()}
                      </text>
                    </g>
                  ))}
                </g>
              </g>
            );
          })}
        </svg>
      </div>
      <Legend present={STRENGTHS.filter((s) => rows.some((r) => r[s] > 0))} />
      <figcaption className="chart-caption">{caption ?? `Evidence per year, ${first} to ${last}.`}</figcaption>
      <SrTable
        caption={title}
        head={["Year", ...STRENGTHS.map((s) => STRENGTH_LABEL[s]), "Total"]}
        rows={rows.map((r) => [r.year, ...STRENGTHS.map((s) => r[s]), r.total])}
      />
    </figure>
  );
}

function Legend({ present }: { present: Strength[] }) {
  return (
    <ul className="chart-legend" aria-hidden="true">
      {present.map((s) => (
        <li key={s}>
          <svg viewBox="0 0 10 10" width={10} height={10} focusable="false">
            <rect className={`chart-fill-${s}`} width={10} height={10} rx={2} />
          </svg>
          {STRENGTH_LABEL[s]}
        </li>
      ))}
    </ul>
  );
}
