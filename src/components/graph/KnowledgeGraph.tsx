"use client";

import Link from "next/link";
import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { useReducedMotion } from "../../lib/use-reduced-motion";
import { CENTER_ID, layout, neighbourhood, type Graph, type GraphNode, type Highlight, type PlacedNode } from "./model";

type Props = {
  graph: Graph;
  highlight?: Highlight | null;
  selected?: Set<string>;
  onToggle?: (node: GraphNode) => void;
  className?: string;
  // Portrait for the centre node (already prefixed with the base path).
  portrait?: string;
  legend?: { domains: string; sources: string; skills: string };
};

const COMPACT_BELOW = 768;
const DEFAULT_WIDTH = 1200;

// The graph fills the box it is in: `measured` is that box's height. Without one, fall back to a width-based height.
function sizeFor(width: number, measured = 0) {
  const compact = width < COMPACT_BELOW;
  if (measured > 0) return { compact, height: Math.round(measured) };
  const raw = compact ? width * 1.5 : width * 0.567;
  const height = Math.round(compact ? Math.min(640, Math.max(480, raw)) : Math.min(720, Math.max(400, raw)));
  return { compact, height };
}

export default function KnowledgeGraph({ graph, highlight = null, selected, onToggle, className, portrait, legend }: Props) {
  const uid = useId();
  const reduced = useReducedMotion();
  const [hidden, setHidden] = useState(false);
  const [boxHeight, setBoxHeight] = useState(0);
  const wrap = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(DEFAULT_WIDTH);
  const [hover, setHover] = useState<string | null>(null);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const apply = (w: number, h: number) => {
      if (w > 0) setWidth(Math.round(w));
      setBoxHeight(Math.round(h));
    };
    const first = el.getBoundingClientRect();
    apply(first.width, first.height);
    const ro = new ResizeObserver((entries) => apply(entries[0].contentRect.width, entries[0].contentRect.height));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const onVisibility = () => setHidden(document.hidden);
    onVisibility();
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  const { compact, height } = sizeFor(width, boxHeight);
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

  // Four signals travel me > domain > source along the edge curves: the heaviest domains, each with its heaviest source.
  const signals = useMemo(() => {
    const edgeOf = new Map(placed.edges.map((e) => [`${e.from}>${e.to}`, e]));
    const out: { d: string; dur: number; begin: number }[] = [];
    const domains = placed.nodes.filter((n) => n.kind === "domain").sort((a, b) => b.weight - a.weight || a.id.localeCompare(b.id));
    for (const dom of domains) {
      if (out.length >= 4) break;
      const first = edgeOf.get(`${CENTER_ID}>${dom.id}`);
      const second = placed.edges.filter((e) => e.from === dom.id && e.to.startsWith("source:")).sort((a, b) => b.weight - a.weight || a.id.localeCompare(b.id))[0];
      if (!first || !second) continue;
      const i = out.length;
      out.push({ d: `${first.d}${second.d.replace(/^M[^Q]*/, "")}`, dur: [4.5, 5.5, 6.5, 7][i], begin: i * 1.3 });
    }
    return out;
  }, [placed]);
  const showSignals = !reduced && !hidden && !active && signals.length > 0;

  const handlers = (n: PlacedNode) => ({
    onMouseEnter: () => setHover(n.id),
    onMouseLeave: () => setHover((h) => (h === n.id ? null : h)),
    onFocus: () => setHover(n.id),
    onBlur: () => setHover((h) => (h === n.id ? null : h)),
  });

  const renderNode = (n: PlacedNode) => {
    const lit = !active || active.nodes.has(n.id);
    const isSelected = !!selected?.has(n.id);
    // Domains, skills and sources with no case study toggle a filter (sources by org); the rest link out.
    const toggle = n.kind === "domain" || n.kind === "skill" || (n.kind === "source" && !n.slug);
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
        {lb.text !== n.label && <title>{n.label}</title>}
        {n.kind === "center" && <circle className="kg-breath" cx={n.x} cy={n.y} r={n.r + 10} />}
        <circle className="kg-halo" cx={n.x} cy={n.y} r={n.r + 7} />
        <circle className="kg-hit" cx={n.x} cy={n.y} r={n.r + 8} />
        <circle className="kg-dot" cx={n.x} cy={n.y} r={n.r} />
        {n.kind === "center" && portrait && (
          <>
            <clipPath id={`${uid}-me`}>
              <circle cx={n.x} cy={n.y} r={n.r - 1} />
            </clipPath>
            <image href={portrait} x={n.x - n.r} y={n.y - n.r} width={n.r * 2} height={n.r * 2} preserveAspectRatio="xMidYMid slice" clipPath={`url(#${uid}-me)`} />
            <circle className="kg-ring" cx={n.x} cy={n.y} r={n.r} />
          </>
        )}
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
    return null;
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
            // Resting weight: the radial tree (me > domain > source) reads at .5, source > skill edges at .18.
            const tier = e.from.startsWith("source:") ? "kg-edge--minor" : "kg-edge--major";
            return <path key={e.id} id={`${uid}-${e.id}`} d={e.d} pathLength={1} className={["kg-edge", tier, mode, dim].filter(Boolean).join(" ")} />;
          })}
        </g>
        {showSignals && (
          <g className="kg-signals" aria-hidden="true">
            {signals.map((sg, i) => (
              <circle key={i} className="kg-signal" r={2.5} opacity={0}>
                <animateMotion path={sg.d} dur={`${sg.dur}s`} begin={`${sg.begin}s`} repeatCount="indefinite" />
                <animate attributeName="opacity" values="0;0.8;0.8;0" keyTimes="0;0.12;0.88;1" dur={`${sg.dur}s`} begin={`${sg.begin}s`} repeatCount="indefinite" />
              </circle>
            ))}
          </g>
        )}
        <g className="kg-nodes">{placed.nodes.map((n) => renderNode(byId.get(n.id) as PlacedNode))}</g>
      </svg>

      {legend && !compact && (
        <ul className="kg-legend" aria-hidden="true">
          <li><span className="kg-swatch kg-swatch--domain" />{legend.domains}</li>
          <li><span className="kg-swatch kg-swatch--source" />{legend.sources}</li>
          <li><span className="kg-swatch kg-swatch--skill" />{legend.skills}</li>
        </ul>
      )}

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
