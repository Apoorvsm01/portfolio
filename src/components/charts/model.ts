// Pure helpers behind the evidence charts. No React, no DOM: these run under node:test.
// Type-only imports keep this file loadable by Node's type stripping without path aliases.
import type { Chunk, FacetGroup, Strength, SourceGroup, Taxonomy } from "../../lib/ask/types";

export type ChartItem = { chunk: Pick<Chunk, "facets" | "strength" | "date"> };

/** Strongest first. Mirrors `strengths` in content/brain/taxonomy.ts. */
export const STRENGTHS: readonly Strength[] = ["shipped", "built", "studied", "watched"];

export const STRENGTH_WEIGHT: Record<Strength, number> = { shipped: 4, built: 3, studied: 2, watched: 1 };

export const STRENGTH_LABEL: Record<Strength, string> = {
  shipped: "Shipped",
  built: "Built",
  studied: "Studied",
  watched: "Watched",
};

const rank = (s: Strength | undefined) => (s ? STRENGTHS.length - STRENGTHS.indexOf(s) : 0);

export type SkillScore = { id: string; label: string; score: number; value: number; count: number };

/** Top `n` skills by weighted evidence. `value` is score / best score, so it lies in 0..1. */
export function skillScores(items: ChartItem[], taxonomy: Taxonomy, n = 8): SkillScore[] {
  const raw = new Map<string, { score: number; count: number }>();
  for (const { chunk } of items) {
    const w = chunk.strength ? STRENGTH_WEIGHT[chunk.strength] : 0;
    if (!w) continue;
    for (const id of new Set(chunk.facets?.skills ?? [])) {
      const cur = raw.get(id) ?? { score: 0, count: 0 };
      cur.score += w;
      cur.count += 1;
      raw.set(id, cur);
    }
  }
  const labels = new Map(taxonomy.skills.map((s) => [s.id, s.label]));
  const rows = [...raw.entries()]
    .map(([id, v]) => ({ id, label: labels.get(id) ?? id, score: v.score, count: v.count }))
    .sort((a, b) => b.score - a.score || b.count - a.count || a.label.localeCompare(b.label))
    .slice(0, n);
  const max = rows[0]?.score ?? 0;
  return rows.map((r) => ({ ...r, value: max > 0 ? r.score / max : 0 }));
}

export type StrengthCounts = Record<Strength, number>;

export function strengthCounts(items: ChartItem[]): StrengthCounts {
  const out: StrengthCounts = { shipped: 0, built: 0, studied: 0, watched: 0 };
  for (const { chunk } of items) if (chunk.strength) out[chunk.strength] += 1;
  return out;
}

export type YearRow = { year: number; total: number } & StrengthCounts;

/** One row per year from the earliest to the latest dated item, gaps included as zeros. */
export function timeline(items: ChartItem[]): YearRow[] {
  const byYear = new Map<number, StrengthCounts>();
  for (const { chunk } of items) {
    const year = Number.parseInt(chunk.date?.slice(0, 4) ?? "", 10);
    if (!Number.isFinite(year) || !chunk.strength) continue;
    const row = byYear.get(year) ?? { shipped: 0, built: 0, studied: 0, watched: 0 };
    row[chunk.strength] += 1;
    byYear.set(year, row);
  }
  if (byYear.size === 0) return [];
  const years = [...byYear.keys()];
  const lo = Math.min(...years);
  const hi = Math.max(...years);
  const rows: YearRow[] = [];
  for (let year = lo; year <= hi; year++) {
    const c = byYear.get(year) ?? { shipped: 0, built: 0, studied: 0, watched: 0 };
    rows.push({ year, ...c, total: c.shipped + c.built + c.studied + c.watched });
  }
  return rows;
}

export type Requirement = { group: FacetGroup; id: string; label?: string };

const carries = (item: ChartItem, r: Requirement) => (item.chunk.facets?.[r.group] ?? []).includes(r.id);

export type Match = { matched: string[]; missing: string[]; pct: number };

export function matchScore(requirements: Requirement[], items: ChartItem[]): Match {
  const matched: string[] = [];
  const missing: string[] = [];
  for (const r of requirements) (items.some((i) => carries(i, r)) ? matched : missing).push(r.id);
  const pct = requirements.length ? Math.round((matched.length / requirements.length) * 100) : 0;
  return { matched, missing, pct };
}

/** The old measure: the share of requirements with any evidence at all. Weak evidence counts as much as shipped work. */
export const coverage = matchScore;

export const STRENGTH_CREDIT: Record<Strength, number> = { shipped: 1, built: 0.75, studied: 0.5, watched: 0.25 };

export type StrengthScore = { pct: number; total: number; counts: StrengthCounts; missing: number };

/** Strength-weighted match: each requirement takes the credit of its best evidence, the mean is the score. */
export function strengthScore(requirements: Requirement[], items: ChartItem[]): StrengthScore {
  const counts: StrengthCounts = { shipped: 0, built: 0, studied: 0, watched: 0 };
  let missing = 0;
  let credit = 0;
  for (const r of requirements) {
    let best: Strength | undefined;
    for (const i of items) if (carries(i, r) && rank(i.chunk.strength) > rank(best)) best = i.chunk.strength;
    if (best) {
      counts[best] += 1;
      credit += STRENGTH_CREDIT[best];
    } else missing += 1;
  }
  const pct = requirements.length ? Math.round((credit / requirements.length) * 100) : 0;
  return { pct, total: requirements.length, counts, missing };
}

export type RequirementLink = { group: FacetGroup; id: string; source: string; strength: Strength };

/** One edge per requirement and source group that proves it, carrying that link's strongest strength. */
export function requirementLinks(requirements: Requirement[], groups: SourceGroup[]): RequirementLink[] {
  const edges: RequirementLink[] = [];
  for (const r of requirements) {
    for (const g of groups) {
      let best: Strength | undefined;
      for (const item of g.items) {
        if (carries(item, r) && rank(item.chunk.strength) > rank(best)) best = item.chunk.strength;
      }
      if (best) edges.push({ group: r.group, id: r.id, source: g.key, strength: best });
    }
  }
  return edges;
}

/** Label lookup for a requirement: explicit label, else the taxonomy entry, else the id. */
export function requirementLabel(r: Requirement, taxonomy: Taxonomy): string {
  return r.label ?? taxonomy[r.group]?.find((e) => e.id === r.id)?.label ?? r.id;
}

export type MapLink = RequirementLink & { count: number };
export type MapModel = {
  /** Requirements in display order: barycenter of their sources, unbacked ones last. */
  requirements: Requirement[];
  /** Sources in display order. */
  sources: SourceGroup[];
  links: MapLink[];
  /** All sources that back at least one requirement, before the cap. */
  totalSources: number;
};

/**
 * The readable version of the requirement map: each requirement keeps its top `perReq` sources (best strength,
 * then most items), at most `maxSources` sources survive (those that are a top source for the most requirements),
 * then one barycenter pass orders sources by their requirements and requirements by their sources.
 */
export function mapModel(requirements: Requirement[], groups: SourceGroup[], perReq = 2, maxSources = 6): MapModel {
  const all: MapLink[] = [];
  requirements.forEach((r) => {
    for (const g of groups) {
      let best: Strength | undefined;
      let count = 0;
      for (const item of g.items) {
        if (!carries(item, r)) continue;
        count += 1;
        if (rank(item.chunk.strength) > rank(best)) best = item.chunk.strength;
      }
      if (best) all.push({ group: r.group, id: r.id, source: g.key, strength: best, count });
    }
  });
  const order = new Map(groups.map((g, i) => [g.key, i]));
  const top: MapLink[] = [];
  for (const r of requirements) {
    const own = all
      .filter((l) => l.group === r.group && l.id === r.id)
      .sort((a, b) => rank(b.strength) - rank(a.strength) || b.count - a.count || order.get(a.source)! - order.get(b.source)!);
    top.push(...own.slice(0, perReq));
  }
  const reach = new Map<string, number>();
  for (const l of top) reach.set(l.source, (reach.get(l.source) ?? 0) + 1);
  const keep = new Set(
    [...reach.keys()].sort((a, b) => reach.get(b)! - reach.get(a)! || order.get(a)! - order.get(b)!).slice(0, maxSources),
  );
  const links = top.filter((l) => keep.has(l.source));

  const reqKey = (r: Requirement) => `${r.group}:${r.id}`;
  const reqIdx = new Map(requirements.map((r, i) => [reqKey(r), i]));
  const bary = (vals: number[], fallback: number) => (vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : fallback);

  const srcKeys = [...keep].sort((a, b) => reach.get(b)! - reach.get(a)! || order.get(a)! - order.get(b)!);
  const srcBary = new Map(srcKeys.map((k, i) => [k, bary(links.filter((l) => l.source === k).map((l) => reqIdx.get(`${l.group}:${l.id}`)!), i)]));
  const srcOrdered = [...srcKeys].sort((a, b) => srcBary.get(a)! - srcBary.get(b)! || order.get(a)! - order.get(b)!);
  const srcIdx = new Map(srcOrdered.map((k, i) => [k, i]));

  const backed = requirements.filter((r) => links.some((l) => l.group === r.group && l.id === r.id));
  const unbacked = requirements.filter((r) => !backed.includes(r));
  const reqBary = new Map(backed.map((r) => [reqKey(r), bary(links.filter((l) => l.group === r.group && l.id === r.id).map((l) => srcIdx.get(l.source)!), 0)]));
  const reqOrdered = [...backed].sort((a, b) => reqBary.get(reqKey(a))! - reqBary.get(reqKey(b))! || reqIdx.get(reqKey(a))! - reqIdx.get(reqKey(b))!);

  const byKey = new Map(groups.map((g) => [g.key, g]));
  return {
    requirements: [...reqOrdered, ...unbacked],
    sources: srcOrdered.map((k) => byKey.get(k)!),
    links,
    totalSources: reach.size,
  };
}
