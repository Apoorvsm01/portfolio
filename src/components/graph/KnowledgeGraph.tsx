"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { layout, neighbourhood, type Graph, type GraphNode, type Highlight, type PlacedNode } from "./model";

type Props = {
  graph: Graph;
  highlight?: Highlight | null;
  selected?: Set<string>;
  onToggle?: (node: GraphNode) => void;
  className?: string;
};

const COMPACT_BELOW = 768;
const DEFAULT_WIDTH = 1200;

function sizeFor(width: number) {
  const compact = width < COMPACT_BELOW;
  const raw = compact ? width * 1.5 : width * 0.567;
  const height = Math.round(compact ? Math.min(640, Math.max(480, raw)) : Math.min(720, Math.max(400, raw)));
  return { compact, height };
}

export default function KnowledgeGraph({ graph, highlight = null, selected, onToggle, className }: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(DEFAULT_WIDTH);
  const [hover, setHover] = useState<string | null>(null);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const apply = (w: number) => w > 0 && setWidth(Math.round(w));
    apply(el.getBoundingClientRect().width);
    const ro = new ResizeObserver((entries) => apply(entries[0].contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const { compact, height } = sizeFor(width);
  const placed = useMemo(() => layout(graph, { width, height, compact }), [graph, width, height, compact]);
  const hoverSet = useMemo(() => (hover ? neighbourhood(graph, hover) : null), [graph, hover]);
  const active = hoverSet ?? highlight;
  const byId = useMemo(() => new Map(placed.nodes.map((n) => [n.id, n])), [placed]);

  const sourcesOf = useMemo(() => {
    const out = new Map<string, GraphNode[]>();
    for (const e of graph.edges) {
      if (!e.from.startsWith("domain:") || !e.to.startsWith("source:")) continue;
      const src = graph.nodes.find((n) => n.id === e.to);
      if (src) out.set(e.from, [...(out.get(e.from) ?? []), src]);
    }
    return out;
  }, [graph]);

  const handlers = (n: PlacedNode) => ({
    onMouseEnter: () => setHover(n.id),
    onMouseLeave: () => setHover((h) => (h === n.id ? null : h)),
    onFocus: () => setHover(n.id),
    onBlur: () => setHover((h) => (h === n.id ? null : h)),
  });

  const renderNode = (n: PlacedNode) => {
    const lit = !active || active.nodes.has(n.id);
    const isSelected = !!selected?.has(n.id);
    const toggle = n.kind === "domain" || n.kind === "skill";
    const cls = [
      "kg-node",
      `kg-node--${n.kind}`,
      n.strongest ? `kg-s-${n.strongest}` : "",
      lit ? "" : "kg-dim",
      active && lit && n.kind !== "center" ? "kg-lit" : "",
      isSelected ? "kg-selected" : "",
      n.labelBox.show ? "" : "kg-label-collapsed",
    ]
      .filter(Boolean)
      .join(" ");
    const lb = n.labelBox;
    const body: ReactNode = (
      <>
        {n.kind === "center" && <circle className="kg-breath" cx={n.x} cy={n.y} r={n.r + 10} />}
        <circle className="kg-halo" cx={n.x} cy={n.y} r={n.r + 7} />
        <circle className="kg-hit" cx={n.x} cy={n.y} r={n.r + 8} />
        <circle className="kg-dot" cx={n.x} cy={n.y} r={n.r} />
        <circle className="kg-focus" cx={n.x} cy={n.y} r={n.r + 5} />
        <text className="kg-label" x={lb.x} y={lb.y} textAnchor={lb.anchor} fontSize={lb.fontSize}>
          {lb.text}
        </text>
      </>
    );

    if (n.kind === "center") {
      return (
        <g key={n.id} className={cls} aria-hidden="true">
          {body}
        </g>
      );
    }
    if (toggle) {
      const press = () => onToggle?.(n);
      const onKeyDown = (e: KeyboardEvent<SVGGElement>) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          press();
        }
      };
      return (
        <g
          key={n.id}
          className={cls}
          role="button"
          tabIndex={0}
          aria-pressed={isSelected}
          aria-label={n.label}
          onClick={press}
          onKeyDown={onKeyDown}
          {...handlers(n)}
        >
          {body}
        </g>
      );
    }
    if (n.slug) {
      return (
        <Link key={n.id} href={`/work/${n.slug}/`} aria-label={`${n.label} case study`} className={`${cls} kg-link`} {...handlers(n)}>
          {body}
        </Link>
      );
    }
    // Sources without a case study are shown on hover only; the hidden list below is the keyboard route to them.
    return (
      <g key={n.id} className={cls} aria-hidden="true" {...handlers(n)}>
        {body}
      </g>
    );
  };

  return (
    <div ref={wrap} className={["kg", active ? "kg--active" : "", className].filter(Boolean).join(" ")} data-compact={compact ? "true" : "false"}>
      <svg
        className="kg-svg"
        viewBox={`0 0 ${width} ${height}`}
        width={width}
        height={height}
        role="group"
        aria-label="Knowledge graph: domains, the work that proves them, and skills. Use the list below for a text version."
      >
        <g className="kg-edges" aria-hidden="true">
          {placed.edges.map((e) => {
            const on = !!active && active.edges.has(e.id);
            const mode = on ? (hoverSet ? "kg-edge--hover" : "kg-edge--on") : "";
            const dim = active && !on ? "kg-dim" : "";
            return <path key={e.id} d={e.d} pathLength={1} className={["kg-edge", mode, dim].filter(Boolean).join(" ")} />;
          })}
        </g>
        <g className="kg-nodes">{placed.nodes.map((n) => renderNode(byId.get(n.id) as PlacedNode))}</g>
      </svg>

      <ul className="kg-sr" aria-label="Domains and the work behind them">
        {graph.nodes
          .filter((n) => n.kind === "domain")
          .map((d) => (
            <li key={d.id}>
              {d.label}
              <ul>
                {(sourcesOf.get(d.id) ?? []).map((s) => (
                  <li key={s.id}>{s.slug ? <Link href={`/work/${s.slug}/`}>{s.label}</Link> : s.label}</li>
                ))}
              </ul>
            </li>
          ))}
      </ul>
    </div>
  );
}
