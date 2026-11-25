"use client";

import Link from "next/link";
import { useId, useMemo, useState, type ReactNode } from "react";
import type { SourceGroup, Strength, Taxonomy } from "../../lib/ask/types";
import { STRENGTH_LABEL, requirementLabel, requirementLinks, type Requirement, type RequirementLink } from "./model";
import { SrTable, plural, truncate } from "./parts";

type Focus = { kind: "req" | "src"; key: string } | null;

const rid = (r: Requirement) => `${r.group}:${r.id}`;
const ROW_H = 44;
const ROW_GAP = 10;
const NODE_PAD = 14;

type Layout = {
  w: number;
  h: number;
  req: (i: number) => { x: number; y: number; w: number; dotX: number; dotY: number };
  src: (i: number) => { x: number; y: number; w: number; dotX: number; dotY: number };
  path: (a: { dotX: number; dotY: number }, b: { dotX: number; dotY: number }, k: number) => string;
};

function desktop(nReq: number, nSrc: number): Layout {
  const w = 720;
  const colW = 240;
  const rows = Math.max(nReq, nSrc, 1);
  const h = rows * ROW_H + (rows - 1) * ROW_GAP;
  const at = (n: number, x: number, dotX: number) => (i: number) => {
    // Spread the shorter column over the full height so connectors stay gentle.
    const gap = n > 1 ? (h - n * ROW_H) / (n - 1) : 0;
    const y = n > 1 ? i * (ROW_H + gap) : (h - ROW_H) / 2;
    return { x, y, w: colW, dotX, dotY: y + ROW_H / 2 };
  };
  return {
    w,
    h,
    req: at(nReq, 0, colW),
    src: at(nSrc, w - colW, w - colW),
    path: (a, b) => {
      const mx = (a.dotX + b.dotX) / 2;
      return `M${a.dotX},${a.dotY} C${mx},${a.dotY} ${mx},${b.dotY} ${b.dotX},${b.dotY}`;
    },
  };
}

function mobile(nReq: number, nSrc: number): Layout {
  const w = 360;
  const gutter = 64;
  const block = (n: number) => n * ROW_H + Math.max(n - 1, 0) * ROW_GAP;
  const gap = 92;
  const h = block(nReq) + gap + block(nSrc);
  const col = (offset: number) => (i: number) => {
    const y = offset + i * (ROW_H + ROW_GAP);
    return { x: gutter, y, w: w - gutter, dotX: 58, dotY: y + ROW_H / 2 };
  };
  return {
    w,
    h,
    req: col(0),
    src: col(block(nReq) + gap),
    // Connectors run down the left gutter, each bulging a little further out so they stay apart.
    path: (a, b, k) => {
      const bulge = 4 + (k % 12) * 4;
      return `M${a.dotX},${a.dotY} C${bulge},${a.dotY + 36} ${bulge},${b.dotY - 36} ${b.dotX},${b.dotY}`;
    },
  };
}

/** Requirements (left) wired to the sources that prove them (right). Requirements without evidence are shown, dashed. */
export function RequirementMap({
  requirements,
  groups,
  taxonomy,
  caption,
  maxSources = 8,
}: {
  requirements: Requirement[];
  groups: SourceGroup[];
  taxonomy: Taxonomy;
  caption?: string;
  /** Most source nodes to draw. Every backed requirement keeps at least its strongest source. */
  maxSources?: number;
}) {
  const uid = useId();
  const [focus, setFocus] = useState<Focus>(null);

  const model = useMemo(() => {
    const all = requirementLinks(requirements, groups);
    const order = new Map(groups.map((g, i) => [g.key, i]));
    const rankOf = (s: Strength) => ORDER.indexOf(s);
    // Coverage first: each backed requirement contributes its strongest source. Then the sources that prove the most.
    const keep = new Set<string>();
    for (const r of requirements) {
      const own = all.filter((l) => l.group === r.group && l.id === r.id);
      own.sort((a, b) => rankOf(a.strength) - rankOf(b.strength) || order.get(a.source)! - order.get(b.source)!);
      if (own[0]) keep.add(own[0].source);
    }
    const reach = new Map<string, number>();
    for (const l of all) reach.set(l.source, (reach.get(l.source) ?? 0) + 1);
    const rest = [...reach.keys()]
      .filter((k) => !keep.has(k))
      .sort((a, b) => reach.get(b)! - reach.get(a)! || order.get(a)! - order.get(b)!);
    for (const k of rest) if (keep.size < maxSources) keep.add(k);
    const sources = groups.filter((g) => keep.has(g.key));
    const total = reach.size;
    return { links: all.filter((l) => keep.has(l.source)), allLinks: all, sources, total };
  }, [requirements, groups, maxSources]);

  const { links, allLinks, sources, total } = model;
  if (requirements.length === 0) return <p className="chart-empty">Paste a job description to see which requirements the evidence backs.</p>;

  const linksOf = (r: Requirement) => allLinks.filter((l) => l.group === r.group && l.id === r.id);
  const lit = (l: RequirementLink, r: Requirement) =>
    !focus || (focus.kind === "req" ? focus.key === rid(r) : focus.key === l.source);
  const reqLit = (r: Requirement) =>
    !focus ||
    (focus.kind === "req" ? focus.key === rid(r) : links.some((l) => l.group === r.group && l.id === r.id && l.source === focus.key));
  const srcLit = (key: string) =>
    !focus ||
    (focus.kind === "src"
      ? focus.key === key
      : links.some((l) => `${l.group}:${l.id}` === focus.key && l.source === key));

  const srcIndex = new Map(sources.map((s, i) => [s.key, i]));
  const reqIndex = new Map(requirements.map((r, i) => [rid(r), i]));
  const proven = requirements.filter((r) => linksOf(r).length > 0).length;
  const title = "Requirement map";
  const desc = `${proven} of ${requirements.length} requirements are backed by evidence from ${plural(sources.length, "source")}. Requirements without evidence are drawn with a dashed outline.`;

  const variants: { name: "wide" | "narrow"; L: Layout }[] = [
    { name: "wide", L: desktop(requirements.length, sources.length) },
    { name: "narrow", L: mobile(requirements.length, sources.length) },
  ];

  return (
    <figure className="chart chart-map">
      {variants.map(({ name, L }) => (
        <svg
          key={name}
          className={`chart-svg chart-map__svg chart-map__svg--${name}`}
          viewBox={`0 0 ${L.w} ${L.h}`}
          role="group"
          aria-labelledby={`${uid}${name}t ${uid}${name}d`}
          style={{ aspectRatio: `${L.w} / ${L.h}` }}
          onMouseLeave={() => setFocus(null)}
        >
          <title id={`${uid}${name}t`}>{title}</title>
          <desc id={`${uid}${name}d`}>{desc}</desc>

          <g aria-hidden="true">
            {links.map((l) => {
              const ri = reqIndex.get(`${l.group}:${l.id}`);
              const si = srcIndex.get(l.source);
              if (ri === undefined || si === undefined) return null;
              const r = requirements[ri];
              return (
                <path
                  key={`${l.group}:${l.id}>${l.source}`}
                  className={`chart-link chart-stroke-${l.strength}`}
                  data-dim={lit(l, r) ? undefined : "true"}
                  d={L.path(L.req(ri), L.src(si), ri * 7 + si * 3)}
                />
              );
            })}
          </g>

          {requirements.map((r, i) => {
            const p = L.req(i);
            const ls = linksOf(r);
            const label = requirementLabel(r, taxonomy);
            const best = ls.length ? bestOf(ls) : undefined;
            const aria = ls.length
              ? `${label}: backed by ${plural(ls.length, "source")}, strongest ${STRENGTH_LABEL[best!].toLowerCase()}`
              : `${label}: no evidence yet`;
            return (
              <g
                key={rid(r)}
                className="chart-node"
                data-dim={reqLit(r) ? undefined : "true"}
                tabIndex={0}
                role="group"
                aria-label={aria}
                onMouseEnter={() => setFocus({ kind: "req", key: rid(r) })}
                onFocus={() => setFocus({ kind: "req", key: rid(r) })}
                onBlur={() => setFocus(null)}
              >
                <rect
                  className={ls.length ? "chart-chip" : "chart-chip chart-chip--empty"}
                  x={p.x + 0.5}
                  y={p.y + 0.5}
                  width={p.w - 1}
                  height={ROW_H - 1}
                  rx={10}
                />
                <text className="chart-label chart-label--strong" x={p.x + NODE_PAD + (name === "narrow" ? 0 : 0)} y={p.y + (ls.length ? 27 : 19)}>
                  {truncate(label, name === "narrow" ? 30 : 28)}
                </text>
                {!ls.length && (
                  <text className="chart-label chart-label--note" x={p.x + NODE_PAD} y={p.y + 35}>
                    No evidence yet
                  </text>
                )}
                {ls.length > 0 && <circle className={`chart-fill-${best}`} cx={p.dotX} cy={p.dotY} r={5} />}
                {!ls.length && <circle className="chart-dot--empty" cx={p.dotX} cy={p.dotY} r={4.5} />}
              </g>
            );
          })}

          {sources.map((s, i) => {
            const p = L.src(i);
            const node: ReactNode = (
              <g
                className="chart-node"
                data-dim={srcLit(s.key) ? undefined : "true"}
                onMouseEnter={() => setFocus({ kind: "src", key: s.key })}
                onFocus={() => setFocus({ kind: "src", key: s.key })}
                onBlur={() => setFocus(null)}
              >
                <rect className="chart-chip" x={p.x + 0.5} y={p.y + 0.5} width={p.w - 1} height={ROW_H - 1} rx={10} />
                <text className="chart-label chart-label--strong" x={p.x + NODE_PAD + (name === "wide" ? 4 : 0)} y={p.y + 19}>
                  {truncate(s.label, 28)}
                </text>
                <text className="chart-label chart-label--note" x={p.x + NODE_PAD + (name === "wide" ? 4 : 0)} y={p.y + 35}>
                  {plural(s.items.length, "item")}
                  {s.strongest ? `, best: ${STRENGTH_LABEL[s.strongest].toLowerCase()}` : ""}
                </text>
                <circle className={`chart-fill-${s.strongest ?? "watched"}`} cx={p.dotX} cy={p.dotY} r={5} />
              </g>
            );
            return s.href ? (
              <Link key={s.key} href={s.href} aria-label={`${s.label}, open case study`} className="chart-node-link">
                {node}
              </Link>
            ) : (
              <g key={s.key} role="group" aria-label={s.label} tabIndex={0}>
                {node}
              </g>
            );
          })}
        </svg>
      ))}
      <figcaption className="chart-caption">{caption ?? `${proven} of ${requirements.length} requirements backed by evidence${total > sources.length ? `, showing the ${sources.length} strongest of ${total} sources` : ""}.`}</figcaption>
      <SrTable
        caption={title}
        head={["Requirement", "Evidence", "Sources"]}
        rows={requirements.map((r) => {
          const ls = linksOf(r);
          return [
            requirementLabel(r, taxonomy),
            ls.length ? "Backed" : "No evidence yet",
            ls.map((l) => `${groups.find((s) => s.key === l.source)?.label ?? l.source} (${l.strength})`).join("; ") || "none",
          ];
        })}
      />
    </figure>
  );
}

const ORDER: Strength[] = ["shipped", "built", "studied", "watched"];
const bestOf = (ls: RequirementLink[]) => ORDER.find((s) => ls.some((l) => l.strength === s))!;
