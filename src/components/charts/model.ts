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
