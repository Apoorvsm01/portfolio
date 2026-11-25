// Pure model and layout for the home knowledge graph. No React, no DOM, no randomness: the same engine and
// options always give the same nodes, edges and coordinates.
import { facets as taxonomy, strengths as strengthOrder, type FacetGroup } from "../../../content/brain/taxonomy.ts";
import type { AskEngine } from "../../lib/ask/engine.ts";
import type { Facets, Strength } from "../../lib/ask/types";

export type NodeKind = "center" | "domain" | "source" | "skill";

export type GraphNode = {
  id: string;
  kind: NodeKind;
  label: string;
  weight: number;
  strongest?: Strength;
  // Domain and skill nodes toggle this facet.
  facet?: { group: FacetGroup; id: string };
  // Source nodes: the engine's source key, the case study they link to and the organisation behind them.
  key?: string;
  slug?: string;
  org?: string;
};

export type GraphEdge = { id: string; from: string; to: string; weight: number };

export type Graph = { nodes: GraphNode[]; edges: GraphEdge[]; orgToStudy: Record<string, string> };

export type GraphOptions = {
  maxDomains?: number;
  maxSources?: number;
  maxSkills?: number;
  maxDomainEdgesPerSource?: number;
  maxSkillEdgesPerSource?: number;
};

export const CENTER_ID = "me";
export const strengthWeight: Record<Strength, number> = { shipped: 4, built: 3, studied: 2, watched: 1 };
const rank = (s: Strength | undefined) => (s ? strengthOrder.length - strengthOrder.indexOf(s) : 0);
const stronger = (a: Strength | undefined, b: Strength | undefined) => (rank(b) > rank(a) ? b : a);


type Acc = { weight: number; strongest?: Strength };
const bump = (m: Map<string, Acc>, key: string, s: Strength | undefined) => {
  const a = m.get(key) ?? { weight: 0 };
  a.weight += s ? strengthWeight[s] : 1;
  a.strongest = stronger(a.strongest, s);
  m.set(key, a);
};
const byWeight = <T extends { weight: number; id: string }>(a: T, b: T) => b.weight - a.weight || a.id.localeCompare(b.id);

// Labels that read better than the raw source name.
export const labelAlias: Record<string, string> = {
  "Apoorvsm01.github.io": "Portfolio site",
  DePaul: "DePaul HCI",
  youtube: "YouTube work",
};
const YOUTUBE_KEY = "youtube";
const FOLD_MAX_ITEMS = 2; // an org this thin that is also a case study's org folds into that study

type Chunkish = { slug?: string; org?: string; href: string };

// The source node a piece of evidence belongs to: its case study, else its employer, else YouTube work.
// Items with none of these (the bare "Resume" bucket, solo side projects) belong to no source node.
export function sourceKeyFor(graph: Pick<Graph, "orgToStudy">, chunk: Chunkish): string | undefined {
  if (chunk.slug) return chunk.slug;
  if (chunk.org) return graph.orgToStudy[chunk.org] ?? chunk.org;
  return /^https?:\/\/(www\.)?(youtu\.be|youtube\.com)\//.test(chunk.href) ? YOUTUBE_KEY : undefined;
}

export function buildGraph(engine: AskEngine, opts: GraphOptions = {}): Graph {
  const maxDomains = opts.maxDomains ?? 8;
  const maxSources = opts.maxSources ?? 14; // case studies always count, whatever the cap
  const maxSkills = opts.maxSkills ?? 10;
  const maxDomEdges = opts.maxDomainEdgesPerSource ?? 3;
  const maxSkillEdges = opts.maxSkillEdgesPerSource ?? 3;

  // Every filterable chunk, not engine.filter(), which caps and drops some studies when nothing is selected.
  const items = engine.filterable.map((chunk) => ({ chunk }));

  // Weighted evidence per facet entry, over every filterable item (sourced or not).
  const domainAcc = new Map<string, Acc>();
  const skillAcc = new Map<string, Acc>();
  for (const { chunk } of items) {
    for (const id of chunk.facets?.domains ?? []) bump(domainAcc, id, chunk.strength);
    for (const id of chunk.facets?.skills ?? []) bump(skillAcc, id, chunk.strength);
  }
  const label = (group: FacetGroup, id: string) => taxonomy[group].find((e) => e.id === id)?.label ?? id;
  const facetNodes = (group: "domains" | "skills", acc: Map<string, Acc>, kind: "domain" | "skill", max: number): GraphNode[] =>
    [...acc.entries()]
      .filter(([id]) => taxonomy[group].some((e) => e.id === id))
      .map(([id, a]) => ({ id: `${kind}:${id}`, kind, label: label(group, id), weight: a.weight, strongest: a.strongest, facet: { group, id } }) satisfies GraphNode)
      .sort(byWeight)
      .slice(0, max);

  const domains = facetNodes("domains", domainAcc, "domain", maxDomains);
  const skills = facetNodes("skills", skillAcc, "skill", maxSkills);

  // Thin orgs that are also a case study's org fold into the study (e.g. one resume line for Woven by Toyota).
  const studyOfOrg: Record<string, string> = {};
  const orgCount = new Map<string, number>();
  for (const { chunk } of items) {
    if (chunk.slug && chunk.org) studyOfOrg[chunk.org] = chunk.slug;
    else if (chunk.org) orgCount.set(chunk.org, (orgCount.get(chunk.org) ?? 0) + 1);
  }
  const orgToStudy: Record<string, string> = {};
  for (const [org, n] of orgCount) if (studyOfOrg[org] && n <= FOLD_MAX_ITEMS) orgToStudy[org] = studyOfOrg[org];

  type Grp = { key: string; label: string; study: boolean; slug?: string; org?: string; strongest?: Strength; weight: number; chunks: (typeof items)[number]["chunk"][] };
  const groups = new Map<string, Grp>();
  for (const { chunk } of items) {
    const key = sourceKeyFor({ orgToStudy }, chunk);
    if (key === undefined) continue;
    let g = groups.get(key);
    if (!g) {
      g = { key, label: labelAlias[key] ?? (chunk.slug ? chunk.label : (chunk.org ?? chunk.label)), study: !!chunk.slug, slug: chunk.slug, org: chunk.org, weight: 0, chunks: [] };
      groups.set(key, g);
    }
    // A study's own chunk names it; later evidence for the same slug must not rename it.
    if (chunk.slug && (chunk.kind === "summary" || chunk.id.endsWith(":overview"))) g.label = chunk.label;
    g.weight += chunk.strength ? strengthWeight[chunk.strength] : 1;
    g.strongest = stronger(g.strongest, chunk.strength);
    g.chunks.push(chunk);
  }
  const all = [...groups.values()];
  const studies = all.filter((g) => g.study).sort((x, y) => y.weight - x.weight || x.key.localeCompare(y.key));
  const orgs = all.filter((g) => !g.study).sort((x, y) => y.weight - x.weight || x.key.localeCompare(y.key));
  const picked = [...studies, ...orgs.slice(0, Math.max(0, maxSources - studies.length))];

  const sources: GraphNode[] = picked.map((g) => ({
    id: `source:${g.key}`,
    kind: "source" as const,
    label: g.label,
    weight: g.weight,
    strongest: g.strongest,
    key: g.key,
    ...(g.slug ? { slug: g.slug } : {}),
    ...(g.org && !g.study ? { org: g.org } : {}),
  }));

  const domainIds = new Set(domains.map((d) => d.id));
  const skillIds = new Set(skills.map((s) => s.id));

  const edges: GraphEdge[] = [];
  const push = (from: string, to: string, weight: number) => edges.push({ id: `${from}>${to}`, from, to, weight });

  for (const d of domains) push(CENTER_ID, d.id, d.weight);

  for (const g of picked) {
    const sid = `source:${g.key}`;
    const dom = new Map<string, number>();
    const skl = new Map<string, number>();
    for (const chunk of g.chunks) {
      for (const id of chunk.facets?.domains ?? []) if (domainIds.has(`domain:${id}`)) dom.set(id, (dom.get(id) ?? 0) + 1);
      for (const id of chunk.facets?.skills ?? []) if (skillIds.has(`skill:${id}`)) skl.set(id, (skl.get(id) ?? 0) + 1);
    }
    const top = (m: Map<string, number>, n: number) =>
      [...m.entries()].sort((x, y) => y[1] - x[1] || x[0].localeCompare(y[0])).slice(0, n);
    for (const [id, w] of top(dom, maxDomEdges)) push(`domain:${id}`, sid, w);
    for (const [id, w] of top(skl, maxSkillEdges)) push(sid, `skill:${id}`, w);
  }

  const center: GraphNode = { id: CENTER_ID, kind: "center", label: "Apoorv", weight: 1 };
  return { nodes: [center, ...domains, ...sources, ...skills], edges, orgToStudy };
}

// ---------- highlight ----------

export type Highlight = { nodes: Set<string>; edges: Set<string> };

// Lights the centre, the matched domain and skill nodes, the sources holding matching evidence, and the edges
// between lit nodes. Ids that are not in the graph are ignored.
export function highlightFor(graph: Graph, matchedFacets: Facets | undefined, matchedSources: Iterable<string> | undefined): Highlight {
  const nodes = new Set<string>([CENTER_ID]);
  const wantedSources = new Set(matchedSources ?? []);
  for (const n of graph.nodes) {
    if (n.facet && matchedFacets?.[n.facet.group]?.includes(n.facet.id)) nodes.add(n.id);
    else if (n.kind === "source" && n.key !== undefined && wantedSources.has(n.key)) nodes.add(n.id);
  }
  const edges = new Set<string>();
  for (const e of graph.edges) if (nodes.has(e.from) && nodes.has(e.to)) edges.add(e.id);
  return { nodes, edges };
}

// A node, its direct neighbours and the edges between them: what hover and focus light up.
export function neighbourhood(graph: Graph, id: string): Highlight {
  const nodes = new Set<string>([id]);
  const edges = new Set<string>();
  for (const e of graph.edges) {
    if (e.from === id || e.to === id) {
      nodes.add(e.from);
      nodes.add(e.to);
      edges.add(e.id);
    }
  }
  return { nodes, edges };
}

// ---------- layout ----------

export type LayoutOptions = { width: number; height: number; compact?: boolean; domainOrder?: "related" | "weight" };

export type LabelBox = { x: number; y: number; anchor: "start" | "middle" | "end"; text: string; width: number; fontSize: number; show: boolean };

export type PlacedNode = GraphNode & { x: number; y: number; r: number; ring: 0 | 1 | 2 | 3; angle: number; labelBox: LabelBox };
export type PlacedEdge = GraphEdge & { d: string };
export type Layout = { width: number; height: number; compact: boolean; nodes: PlacedNode[]; edges: PlacedEdge[] };

export const MIN_GAP = 8;
const EVEN_PULL = 0.5; // 0 = pure circular mean of connected nodes, 1 = perfectly even spacing
const TAU = Math.PI * 2;
const norm = (t: number) => ((t % TAU) + TAU) % TAU;

function radiusOf(n: GraphNode, maxByKind: Record<NodeKind, number>, compact: boolean): number {
  if (n.kind === "center") return compact ? 26 : 34;
  if (n.kind === "skill") return compact ? 3.5 : 4;
  const [lo, hi] = n.kind === "domain" ? [11, 18] : [6, 11];
  // One heavy node (DePaul) must not shrink everything else to the minimum, so the scale saturates at half the max.
  const k = Math.min(1, Math.sqrt(n.weight / Math.max(1, maxByKind[n.kind] * 0.5)));
  const scale = compact ? 0.85 : 1;
  return (lo + (hi - lo) * k) * scale;
}

// Circular mean of angles, weighted. Returns undefined when there is nothing to average.
function circularMean(parts: { t: number; w: number }[]): number | undefined {
  let sx = 0;
  let sy = 0;
  for (const p of parts) {
    sx += Math.cos(p.t) * p.w;
    sy += Math.sin(p.t) * p.w;
  }
  if (Math.abs(sx) < 1e-9 && Math.abs(sy) < 1e-9) return parts[0]?.t;
  return Math.atan2(sy, sx);
}

type Item = { id: string; r: number; t: number };

// Enforces a minimum distance between neighbours on an ellipse ring by pushing their parametric angles apart,
// symmetrically. Arc speed varies around an ellipse, so the angular gap is derived from the local speed.
function spread(items: Item[], a: number, b: number): void {
  const n = items.length;
  if (n < 2) return;
  items.sort((p, q) => norm(p.t) - norm(q.t) || p.id.localeCompare(q.id));
  for (const it of items) it.t = norm(it.t);
  const speed = (t: number) => Math.sqrt((a * Math.sin(t)) ** 2 + (b * Math.cos(t)) ** 2);
  const need = (p: Item, q: Item) => {
    const mid = (p.t + (q.t < p.t ? q.t + TAU : q.t)) / 2;
    // A little extra so the chord (not the arc) still clears the gap on curved stretches.
    return ((p.r + q.r + MIN_GAP) * 1.12) / Math.max(1, speed(mid));
  };
  for (let iter = 0; iter < 400; iter++) {
    let moved = false;
    for (let i = 0; i < n; i++) {
      const p = items[i];
      const q = items[(i + 1) % n];
      const gap = q.t - p.t + (i === n - 1 ? TAU : 0);
      const want = need(p, q);
      if (gap < want - 1e-6) {
        const push = (want - gap) / 2;
        p.t -= push;
        q.t += push;
        moved = true;
      }
    }
    if (!moved) break;
  }
  for (const it of items) it.t = norm(it.t);
}

const PRIORITY: Record<NodeKind, number> = { center: 4, domain: 3, source: 2, skill: 1 };
const LABEL_LIMITS = [26, 18, 13, 9];
const COMPACT_LIMITS = [12, 9, 6];
const short = (s: string, max = LABEL_LIMITS[0]) => (s.length > max ? `${s.slice(0, max - 1).trimEnd()}…` : s);

// Greedy chain over domain co-occurrence (shared sources): start at the heaviest domain, then keep appending the
// unplaced domain that shares the most evidence with the chain's current end. Ties go to the heavier domain.
function relatedOrder(domains: GraphNode[], edges: GraphEdge[]): GraphNode[] {
  const perSource = new Map<string, Map<string, number>>();
  for (const e of edges) {
    if (!e.from.startsWith("domain:")) continue;
    const m = perSource.get(e.to) ?? new Map<string, number>();
    m.set(e.from, e.weight);
    perSource.set(e.to, m);
  }
  const co = new Map<string, number>();
  for (const m of perSource.values()) {
    const ds = [...m.entries()];
    for (const [a, wa] of ds)
      for (const [b, wb] of ds) if (a !== b) co.set(`${a}|${b}`, (co.get(`${a}|${b}`) ?? 0) + Math.min(wa, wb));
  }
  const left = [...domains].sort((a, b) => b.weight - a.weight || a.id.localeCompare(b.id));
  const chain: GraphNode[] = left.splice(0, 1);
  while (left.length) {
    const end = chain[chain.length - 1].id;
    let best = 0;
    for (let i = 1; i < left.length; i++) {
      const ci = co.get(`${end}|${left[i].id}`) ?? 0;
      const cb = co.get(`${end}|${left[best].id}`) ?? 0;
      if (ci > cb) best = i;
    }
    chain.push(...left.splice(best, 1));
  }
  return chain;
}

export function layout(graph: Graph, { width, height, compact = false, domainOrder = "related" }: LayoutOptions): Layout {
  const visible = (n: GraphNode) => !(compact && n.kind === "skill");
  const nodes = graph.nodes.filter(visible);
  const ids = new Set(nodes.map((n) => n.id));
  const edges = graph.edges.filter((e) => ids.has(e.from) && ids.has(e.to));

  const maxByKind: Record<NodeKind, number> = { center: 1, domain: 1, source: 1, skill: 1 };
  for (const n of nodes) maxByKind[n.kind] = Math.max(maxByKind[n.kind], n.weight);

  const cx = width / 2;
  const cy = height / 2;
  const sideMargin = compact ? Math.min(70, width * 0.19) : Math.min(150, width * 0.13);
  const vMargin = compact ? 30 : 34;
  // The outer ring never reaches past 44% of the width, so skills do not drift to the far edges.
  const A = Math.max(40, Math.min(width / 2 - sideMargin, width * 0.44));
  const B = Math.max(40, height / 2 - vMargin);
  const fr = compact ? [0, 0.5, 1] : [0, 0.46, 0.74, 1];
  const ring = (i: number) => ({ a: A * fr[i], b: B * fr[i] });

  const r = new Map(nodes.map((n) => [n.id, radiusOf(n, maxByKind, compact)]));
  const t = new Map<string, number>();

  const ofKind = (k: NodeKind) => nodes.filter((n) => n.kind === k);
  const domains = ofKind("domain");
  const sources = ofKind("source");
  const skills = compact ? [] : ofKind("skill");

  // Ring 1: evenly spaced, starting at the top, clockwise, in an order that keeps related domains adjacent.
  const ordered = domainOrder === "weight" ? domains : relatedOrder(domains, edges);
  ordered.forEach((d, i) => t.set(d.id, -Math.PI / 2 + (i / Math.max(1, ordered.length)) * TAU));

  const place = (list: GraphNode[], neighbours: (id: string) => { id: string; w: number }[], ringIdx: number) => {
    const { a, b } = ring(ringIdx);
    const placed: Item[] = [];
    const orphans: GraphNode[] = [];
    for (const n of list) {
      const mean = circularMean(neighbours(n.id).filter((p) => t.has(p.id)).map((p) => ({ t: t.get(p.id) as number, w: p.w })));
      if (mean === undefined) orphans.push(n);
      else placed.push({ id: n.id, r: r.get(n.id) as number, t: mean });
    }
    // Nodes with no connection to the ring inside go in the widest empty stretch, one after another.
    if (orphans.length) {
      const base = placed.length ? placed.map((p) => norm(p.t)).sort((x, y) => x - y) : [0];
      let widest = { start: base[base.length - 1] - TAU, size: -1 };
      for (let i = 0; i < base.length; i++) {
        const prev = i === 0 ? base[base.length - 1] - TAU : base[i - 1];
        if (base[i] - prev > widest.size) widest = { start: prev, size: base[i] - prev };
      }
      orphans.forEach((n, i) => placed.push({ id: n.id, r: r.get(n.id) as number, t: widest.start + (widest.size * (i + 1)) / (orphans.length + 1) }));
    }
    // Pull the ring toward even spacing (keeping each node's order) so a few busy domains do not crowd one side.
    if (placed.length > 1) {
      placed.sort((p, q) => norm(p.t) - norm(q.t) || p.id.localeCompare(q.id));
      const n = placed.length;
      const slot = (i: number) => (i / n) * TAU;
      // Rotate the slots to the offset that moves nodes the least on average (circular mean of the differences).
      const off = circularMean(placed.map((p, i) => ({ t: p.t - slot(i), w: 1 }))) ?? 0;
      placed.forEach((p, i) => {
        const target = slot(i) + off;
        const diff = Math.atan2(Math.sin(target - p.t), Math.cos(target - p.t));
        p.t += diff * EVEN_PULL;
      });
    }
    spread(placed, a, b);
    for (const p of placed) t.set(p.id, p.t);
  };

  const kindOf = new Map(nodes.map((n) => [n.id, n.kind]));
  const neighboursOfKind = (kind: NodeKind) => (id: string) =>
    edges.flatMap((e) => {
      const other = e.from === id ? e.to : e.to === id ? e.from : undefined;
      return other && kindOf.get(other) === kind ? [{ id: other, w: e.weight }] : [];
    });

  place(sources, neighboursOfKind("domain"), 2);
  place(skills, neighboursOfKind("source"), 3);

  const ringOf = (n: GraphNode): 0 | 1 | 2 | 3 => (n.kind === "center" ? 0 : n.kind === "domain" ? 1 : n.kind === "source" ? 2 : 3);
  const ringIndex = ringOf;

  const placed: PlacedNode[] = nodes.map((n) => {
    const angle = t.get(n.id) ?? 0;
    const { a, b } = ring(ringIndex(n));
    const x = n.kind === "center" ? cx : cx + a * Math.cos(angle);
    const y = n.kind === "center" ? cy : cy + b * Math.sin(angle);
    const radius = r.get(n.id) as number;
    const fontSize = n.kind === "domain" ? 13 : n.kind === "center" ? 12 : 12;
    const text = short(n.label);
    return {
      ...n,
      x,
      y,
      r: radius,
      ring: ringOf(n),
      angle,
      labelBox: { x, y, anchor: "middle", text, width: text.length * fontSize * 0.56, fontSize, show: true },
    };
  });

  // Label placement. Each label tries its outward-facing side first, then the other sides; the first spot that
  // stays in bounds and clears every node circle and every already-placed label wins. Labels are placed in
  // priority order, so when nothing fits it is the lower-priority label that is hidden (shown on hover/focus).
  const centerNode = placed.find((n) => n.kind === "center");
  if (centerNode) {
    centerNode.labelBox.x = centerNode.x;
    // The label sits under the portrait.
    centerNode.labelBox.y = centerNode.y + centerNode.r + 14;
  }
  type Box = { x0: number; x1: number; y0: number; y1: number };
  const boxOf = (lb: LabelBox): Box => {
    const x0 = lb.anchor === "start" ? lb.x : lb.anchor === "end" ? lb.x - lb.width : lb.x - lb.width / 2;
    return { x0: x0 - 2, x1: x0 + lb.width + 2, y0: lb.y - lb.fontSize, y1: lb.y + 4 };
  };
  const overlap = (p: Box, q: Box) => p.x0 < q.x1 && q.x0 < p.x1 && p.y0 < q.y1 && q.y0 < p.y1;
  const hitsCircle = (p: Box, c: PlacedNode) => {
    const nx = Math.max(p.x0, Math.min(c.x, p.x1));
    const ny = Math.max(p.y0, Math.min(c.y, p.y1));
    return (nx - c.x) ** 2 + (ny - c.y) ** 2 < (c.r + 1) ** 2;
  };
  const spots = (n: PlacedNode): Pick<LabelBox, "x" | "y" | "anchor">[] => {
    const f = n.labelBox.fontSize;
    const right = { anchor: "start" as const, x: n.x + n.r + 6, y: n.y + 4 };
    const left = { anchor: "end" as const, x: n.x - n.r - 6, y: n.y + 4 };
    const above = { anchor: "middle" as const, x: n.x, y: n.y - n.r - 7 };
    const below = { anchor: "middle" as const, x: n.x, y: n.y + n.r + f + 3 };
    const c = Math.cos(n.angle);
    const s = Math.sin(n.angle);
    const side = c >= 0 ? [right, left] : [left, right];
    const vert = s < 0 ? [above, below] : [below, above];
    const base = Math.abs(c) > 0.35 ? [...side, ...vert] : [...vert, ...side];
    // Compact: when nothing fits, nudge the side labels up or down a line.
    return compact ? [...base, ...side.flatMap((p) => [{ ...p, y: p.y - f }, { ...p, y: p.y + f }])] : base;
  };

  const limits = compact ? COMPACT_LIMITS : LABEL_LIMITS;
  const glyph = compact ? 0.6 : 0.56;
  const pad = compact ? 8 : 2; // inner padding: labels stay this far inside the viewBox
  const order = [...placed].sort((p, q) => PRIORITY[q.kind] - PRIORITY[p.kind] || q.weight - p.weight || p.id.localeCompare(q.id));
  const taken: Box[] = centerNode ? [boxOf(centerNode.labelBox)] : [];
  for (const n of order) {
    if (n.kind === "center") continue;
    let chosen = false;
    // Shorten with an ellipsis (full text stays in `title`) before giving up on a label.
    for (const limit of limits) {
      const text = short(n.label, limit);
      const w = text.length * n.labelBox.fontSize * glyph;
      for (const spot of spots(n)) {
        const trial = { ...n.labelBox, ...spot, text, width: w };
        const b = boxOf(trial);
        const inBounds = b.x0 >= pad && b.x1 <= width - pad && b.y0 >= pad && b.y1 <= height - pad;
        if (!inBounds || taken.some((o) => overlap(b, o)) || placed.some((o) => o !== n && hitsCircle(b, o))) continue;
        Object.assign(n.labelBox, spot, { text, width: w });
        taken.push(b);
        chosen = true;
        break;
      }
      if (chosen) break;
    }
    if (!chosen) {
      // Hidden, but parked at the preferred spot so the hover reveal appears next to the node.
      Object.assign(n.labelBox, spots(n)[0], { show: false });
    }
  }

  // Edge path: a quadratic curve whose control point is nudged from the midpoint toward the centre.
  const pos = new Map(placed.map((n) => [n.id, n]));
  const placedEdges: PlacedEdge[] = edges.map((e) => {
    const p = pos.get(e.from) as PlacedNode;
    const q = pos.get(e.to) as PlacedNode;
    const mx = (p.x + q.x) / 2;
    const my = (p.y + q.y) / 2;
    const k = 0.16;
    const qx = mx + (cx - mx) * k;
    const qy = my + (cy - my) * k;
    const f = (v: number) => Math.round(v * 100) / 100;
    return { ...e, d: `M${f(p.x)} ${f(p.y)}Q${f(qx)} ${f(qy)} ${f(q.x)} ${f(q.y)}` };
  });

  return { width, height, compact, nodes: placed, edges: placedEdges };
}
