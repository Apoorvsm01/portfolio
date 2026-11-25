import { useId } from "react";
import type { SkillScore } from "./model";
import { SrTable, wrap } from "./parts";

const W = 480;
const H = 380;
const CX = W / 2;
const CY = H / 2;
const R = 104;
const LABEL_GAP = 16;
const LINE_H = 14;

const polar = (i: number, n: number, r: number) => {
  const a = -Math.PI / 2 + (i * 2 * Math.PI) / n;
  return { x: CX + r * Math.cos(a), y: CY + r * Math.sin(a), cos: Math.cos(a), sin: Math.sin(a) };
};
const ring = (n: number, f: number) =>
  Array.from({ length: n }, (_, i) => {
    const p = polar(i, n, R * f);
    return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
  }).join(" ");

/** Top skills on radial axes. `value` (0..1) of each skill is the normalized weighted evidence score. */
export function SkillRadar({ skills, caption }: { skills: SkillScore[]; caption?: string }) {
  const uid = useId();
  const n = skills.length;
  const title = "Skill radar";
  const desc = n
    ? `Top ${n} skills by weighted evidence: ${skills.map((s) => `${s.label} ${Math.round(s.value * 100)} of 100`).join(", ")}.`
    : "No skills to chart.";

  if (n < 3) return <p className="chart-empty">Not enough evidence to draw a skill radar yet.</p>;

  const pts = skills.map((s, i) => ({ s, ...polar(i, n, R * Math.max(s.value, 0.03)) }));
  const shape = pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");

  return (
    <figure className="chart chart-radar">
      <svg
        className="chart-svg"
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-labelledby={`${uid}t ${uid}d`}
        style={{ aspectRatio: `${W} / ${H}` }}
      >
        <title id={`${uid}t`}>{title}</title>
        <desc id={`${uid}d`}>{desc}</desc>
        {[1 / 3, 2 / 3, 1].map((f) => (
          <polygon key={f} className="chart-grid" points={ring(n, f)} />
        ))}
        {skills.map((_, i) => {
          const p = polar(i, n, R);
          return <line key={i} className="chart-grid" x1={CX} y1={CY} x2={p.x} y2={p.y} />;
        })}
        <g className="chart-radar__shape" style={{ transformOrigin: `${CX}px ${CY}px` }}>
          <polygon className="chart-radar__area" points={shape} />
          {pts.map((p) => (
            <circle key={p.s.id} className="chart-radar__dot" cx={p.x} cy={p.y} r={4} />
          ))}
        </g>
        {skills.map((s, i) => {
          const p = polar(i, n, R + LABEL_GAP);
          const lines = wrap(s.label, 16, 2);
          const anchor = p.cos > 0.3 ? "start" : p.cos < -0.3 ? "end" : "middle";
          // Block of lines hangs below the point at the bottom, above it at the top, centred on the sides.
          const first = p.sin < -0.5 ? -(lines.length - 1) * LINE_H : p.sin > 0.5 ? LINE_H * 0.7 : -((lines.length - 1) * LINE_H) / 2 + 4;
          return (
            <text key={s.id} className="chart-label" x={p.x} y={p.y + first} textAnchor={anchor}>
              {lines.map((l, k) => (
                <tspan key={k} x={p.x} dy={k === 0 ? 0 : LINE_H}>
                  {l}
                </tspan>
              ))}
            </text>
          );
        })}
      </svg>
      <figcaption className="chart-caption">{caption ?? "Top skills, weighted by how strongly each is evidenced."}</figcaption>
      <SrTable
        caption={title}
        head={["Skill", "Relative score (0 to 100)", "Evidence items"]}
        rows={skills.map((s) => [s.label, Math.round(s.value * 100), s.count])}
      />
    </figure>
  );
}
