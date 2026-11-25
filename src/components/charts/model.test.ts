// Run: node --test src/components/charts/model.test.ts   (Node 22.18+ strips types natively)
import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { createAsk } from "../../lib/ask/engine.ts";
import { site } from "../../../content/site.ts";
import { studyMeta } from "../../../content/study-meta.ts";
import { personal } from "../../../content/personal.ts";
import * as askContent from "../../../content/ask.ts";
import { facets } from "../../../content/brain/taxonomy.ts";
import type { CaseStudy } from "../../../content/types.ts";
import type { Evidence, FilterState, SourceGroup } from "../../lib/ask/types";
import { coverage, mapModel, matchScore, requirementLinks, strengthScore, skillScores, skillProof, withoutOwnFilter, strengthCounts, timeline, type Requirement } from "./model.ts";

const readJson = <T>(dir: URL) =>
  readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => JSON.parse(readFileSync(new URL(f, dir), "utf8")) as T);

const studies = readJson<CaseStudy>(new URL("../../../content/case-studies/", import.meta.url));
const evidence = readJson<Evidence[]>(new URL("../../../content/brain/evidence/", import.meta.url)).flat();

const engine = createAsk({
  site,
  studies,
  studyMeta,
  personal,
  taxonomy: facets,
  evidence,
  config: {
    copy: askContent.askCopy,
    suggestedPrompts: askContent.suggestedPrompts,
    topics: askContent.topics,
    synonymGroups: askContent.synonymGroups,
    stopwords: askContent.stopwords,
    blockedWords: askContent.blockedWords,
    blockedPhrases: askContent.blockedPhrases,
    offTopicPatterns: askContent.offTopicPatterns,
    injectionPatterns: askContent.injectionPatterns,
  },
});

const empty: FilterState = { roles: [], skills: [], domains: [], platforms: [], methods: [] };
const all = engine.filter(empty).items;
const groups = engine.groupBySource(all);

test("the real engine yields items to chart", () => {
  assert.ok(all.length > 20);
  assert.ok(groups.length > 3);
});

test("skillScores: at most n, sorted, normalized 0..1 with a top of exactly 1", () => {
  const rows = skillScores(all, facets, 8);
  assert.equal(rows.length, 8);
  assert.equal(rows[0].value, 1);
  for (const r of rows) {
    assert.ok(r.value >= 0 && r.value <= 1);
    assert.ok(facets.skills.some((s) => s.id === r.id));
  }
  for (let i = 1; i < rows.length; i++) assert.ok(rows[i - 1].score >= rows[i].score);
  assert.deepEqual(skillScores([], facets), []);
});

test("skillScores weights strength: shipped 4, built 3, studied 2, watched 1", () => {
  const mk = (strength: "shipped" | "built" | "studied" | "watched", skills: string[]) => ({
    chunk: { strength, date: "2024", facets: { skills } },
  });
  const rows = skillScores([mk("shipped", ["figma"]), mk("watched", ["figma", "react"]), mk("built", ["react"])], facets);
  assert.equal(rows.find((r) => r.id === "figma")?.score, 5);
  assert.equal(rows.find((r) => r.id === "react")?.score, 4);
});

test("strengthCounts sum to the item count", () => {
  const c = strengthCounts(all);
  assert.equal(c.shipped + c.built + c.studied + c.watched, all.length);
});

test("timeline: years ascending and contiguous, totals match", () => {
  const rows = timeline(all);
  assert.ok(rows.length > 0);
  for (let i = 1; i < rows.length; i++) assert.equal(rows[i].year, rows[i - 1].year + 1);
  for (const r of rows) assert.equal(r.total, r.shipped + r.built + r.studied + r.watched);
  assert.equal(
    rows.reduce((n, r) => n + r.total, 0),
    all.filter((i) => i.chunk.date && i.chunk.strength).length,
  );
  // Undated items (some case studies) cannot sit on a year axis, so they are excluded from the totals above.
  const datedShipped = all.filter((i) => i.chunk.date && i.chunk.strength === "shipped").length;
  assert.equal(rows.reduce((n, r) => n + r.shipped, 0), datedShipped);
});

test("matchScore: pct math and missing list", () => {
  const reqs: Requirement[] = [
    { group: "skills", id: "figma" },
    { group: "skills", id: "react" },
    { group: "domains", id: "automotive" },
    { group: "skills", id: "no-such-skill" },
  ];
  const m = matchScore(reqs, all);
  assert.deepEqual(m.missing, ["no-such-skill"]);
  assert.equal(m.matched.length, 3);
  assert.equal(m.pct, 75);
  assert.equal(matchScore([], all).pct, 0);
  assert.equal(matchScore(reqs, []).pct, 0);
  assert.deepEqual(matchScore(reqs, []).missing, reqs.map((r) => r.id));
});

test("requirementLinks only reference existing groups, and agree with matchScore", () => {
  const reqs: Requirement[] = [
    { group: "skills", id: "figma" },
    { group: "domains", id: "automotive" },
    { group: "skills", id: "no-such-skill" },
  ];
  const edges = requirementLinks(reqs, groups);
  const keys = new Set(groups.map((g) => g.key));
  assert.ok(edges.length > 0);
  for (const e of edges) {
    assert.ok(keys.has(e.source));
    assert.ok(reqs.some((r) => r.id === e.id && r.group === e.group));
  }
  assert.ok(!edges.some((e) => e.id === "no-such-skill"));
  const linked = new Set(edges.map((e) => e.id));
  assert.deepEqual(matchScore(reqs, all).matched.sort(), [...linked].sort());
});

test("requirementLinks picks the strongest strength per link", () => {
  const g = {
    key: "k",
    label: "K",
    items: [
      { chunk: { strength: "watched", date: "2020", facets: { skills: ["figma"] } } },
      { chunk: { strength: "shipped", date: "2021", facets: { skills: ["figma"] } } },
    ],
  } as unknown as SourceGroup;
  const [edge] = requirementLinks([{ group: "skills", id: "figma" }], [g]);
  assert.equal(edge.strength, "shipped");
});

test("coverage is the old matchScore", () => {
  assert.equal(coverage, matchScore);
});

test("strengthScore weights each requirement by its best evidence", () => {
  const item = (strength: string, skill: string) => ({ chunk: { strength, facets: { skills: [skill] } } }) as unknown as (typeof all)[number];
  const reqs: Requirement[] = ["a", "b", "c", "d"].map((id) => ({ group: "skills", id }));
  const items = [item("watched", "a"), item("shipped", "a"), item("built", "b"), item("studied", "c")];
  const s = strengthScore(reqs, items);
  assert.deepEqual(s.counts, { shipped: 1, built: 1, studied: 1, watched: 0 });
  assert.equal(s.missing, 1);
  assert.equal(s.pct, Math.round(((1 + 0.75 + 0.5) / 4) * 100));
  // Watched-only evidence is not a full match, unlike coverage().
  const weak = [item("watched", "a")];
  assert.equal(coverage([reqs[0]], weak).pct, 100);
  assert.equal(strengthScore([reqs[0]], weak).pct, 25);
  assert.equal(strengthScore([], items).pct, 0);
  assert.equal(strengthScore(reqs, []).pct, 0);
});

test("mapModel: top 2 sources per requirement, at most 6 sources, stable and consistent", () => {
  const reqs: Requirement[] = [
    { group: "skills", id: "figma" },
    { group: "domains", id: "automotive" },
    { group: "skills", id: "no-such-skill" },
  ];
  const m = mapModel(reqs, groups);
  assert.ok(m.sources.length <= 6);
  for (const r of reqs) assert.ok(m.links.filter((l) => l.id === r.id && l.group === r.group).length <= 2);
  const keys = new Set(m.sources.map((g) => g.key));
  assert.ok(m.links.every((l) => keys.has(l.source)));
  assert.equal(m.requirements.length, reqs.length);
  assert.equal(m.requirements[m.requirements.length - 1].id, "no-such-skill");
});

test("skillProof: counts sum to total, strongest is the best present strength", () => {
  const rows = skillProof(all, facets, 100);
  assert.ok(rows.length > 8);
  for (const r of rows) {
    assert.equal(r.counts.shipped + r.counts.built + r.counts.studied + r.counts.watched, r.total);
    const best = (["shipped", "built", "studied", "watched"] as const).find((s) => r.counts[s] > 0);
    assert.equal(r.strongest, best);
  }
});

test("skillProof: ordered by shipped, then built, then total, then label; capped at n", () => {
  const rows = skillProof(all, facets, 100);
  for (let i = 1; i < rows.length; i++) {
    const a = rows[i - 1];
    const b = rows[i];
    const cmp =
      b.counts.shipped - a.counts.shipped ||
      b.counts.built - a.counts.built ||
      b.total - a.total ||
      a.label.localeCompare(b.label);
    assert.ok(cmp <= 0, `${a.id} should not come after ${b.id}`);
  }
  assert.equal(skillProof(all, facets).length, 8);
});

test("skillProof: figma, design systems and accessibility are each proven by shipped work", () => {
  const rows = skillProof(all, facets, 1000);
  for (const id of ["figma", "design-systems", "accessibility"]) {
    const r = rows.find((x) => x.id === id);
    assert.ok(r, `${id} has evidence`);
    assert.equal(r.strongest, "shipped", id);
  }
});

test("strength counts are identical with and without a strength floor once the chart's own filter is excluded", () => {
  const base = strengthCounts(engine.filter(empty).items);
  for (const minStrength of ["shipped", "built", "studied"] as const) {
    const set = { ...empty, minStrength };
    assert.notDeepEqual(strengthCounts(engine.filter(set).items), base, "the filtered view really differs");
    assert.deepEqual(strengthCounts(engine.filter(withoutOwnFilter(set, "strength")).items), base);
  }
});

test("skill proof keeps every skill when one skill is selected, once its own facet is excluded", () => {
  const set = { ...empty, skills: ["figma"] };
  const ids = (r: ReturnType<typeof skillProof>) => r.map((x) => x.id);
  assert.deepEqual(ids(skillProof(engine.filter(withoutOwnFilter(set, "skills")).items, facets)), ids(skillProof(all, facets)));
});
