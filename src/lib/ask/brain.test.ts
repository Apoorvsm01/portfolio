// Run: node --test src/lib/ask/brain.test.ts   (Node 22.18+ strips types natively)
import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { createAsk } from "./engine.ts";
import { site } from "../../../content/site.ts";
import { studyMeta } from "../../../content/study-meta.ts";
import { personal } from "../../../content/personal.ts";
import * as askContent from "../../../content/ask.ts";
import { facets, facetGroups, strengths } from "../../../content/brain/taxonomy.ts";
import type { CaseStudy } from "../../../content/types.ts";
import type { Evidence, FilterState } from "./types";

const readJson = <T>(dir: URL) =>
  readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => ({ file: f, data: JSON.parse(readFileSync(new URL(f, dir), "utf8")) as T }));

const studies = readJson<CaseStudy>(new URL("../../../content/case-studies/", import.meta.url)).map((f) => f.data);
const evidenceFiles = readJson<Evidence[]>(new URL("../../../content/brain/evidence/", import.meta.url));
const evidence = evidenceFiles.flatMap((f) => f.data);

const config = {
  copy: askContent.askCopy,
  suggestedPrompts: askContent.suggestedPrompts,
  topics: askContent.topics,
  synonymGroups: askContent.synonymGroups,
  stopwords: askContent.stopwords,
  blockedWords: askContent.blockedWords,
  blockedPhrases: askContent.blockedPhrases,
  offTopicPatterns: askContent.offTopicPatterns,
  injectionPatterns: askContent.injectionPatterns,
};

const make = (ev: Evidence[] = evidence) => createAsk({ site, studies, studyMeta, personal, config, taxonomy: facets, evidence: ev });
const engine = make();

const empty: FilterState = { roles: [], skills: [], domains: [], platforms: [], methods: [] };
const state = (patch: Partial<FilterState>): FilterState => ({ ...empty, ...patch });
const ids = (s: FilterState, e = engine) => e.filter(s).items.map((i) => i.chunk.id);

const item = (id: string, patch: Partial<Evidence> = {}): Evidence => ({
  id,
  claim: `Claim for ${id}.`,
  strength: "built",
  date: "2024",
  facets: { skills: ["figma"] },
  source: { kind: "course", label: `SAMPLE source ${id}` },
  status: "approved",
  ...patch,
});

test("draft evidence never appears, even when it matches", () => {
  const all = ids(empty);
  assert.ok(all.includes("evidence:sample-course-usability-test"));
  assert.ok(!all.some((id) => id.includes("draft")));
  assert.ok(!engine.chunks.some((c) => c.kind === "evidence"), "evidence must not enter the ask() corpus");
  const r = engine.filter(state({ domains: ["healthcare"], skills: ["figma"] }));
  assert.ok(!r.items.some((i) => i.chunk.id.includes("draft")));
});

test("OR within a group, AND across groups", () => {
  const either = ids(state({ roles: ["media-producer", "front-end-engineer"] }));
  assert.ok(either.includes("evidence:sample-video-short-film"));
  assert.ok(either.includes("evidence:sample-resume-react-dashboard"));

  const both = ids(state({ roles: ["front-end-engineer"], skills: ["scriptwriting"] }));
  assert.deepEqual(both, []);

  const narrowed = ids(state({ roles: ["ux-researcher"], methods: ["heuristic-evaluation"] }));
  assert.deepEqual(narrowed, ["evidence:sample-course-heuristic-eval"]);
});

test("matched facets list only selected ids the item carries", () => {
  const r = engine.filter(state({ roles: ["ux-designer", "ux-researcher"], methods: ["heuristic-evaluation"] }));
  const hit = r.items.find((i) => i.chunk.id === "evidence:sample-course-heuristic-eval");
  assert.ok(hit);
  assert.deepEqual(hit.matched.roles?.sort(), ["ux-designer", "ux-researcher"]);
  assert.deepEqual(hit.matched.methods, ["heuristic-evaluation"]);
});

test("minStrength drops weaker items", () => {
  const rank = (s: string) => strengths.indexOf(s as (typeof strengths)[number]);
  for (const min of strengths) {
    for (const i of engine.filter(state({ minStrength: min })).items) {
      assert.ok(rank(i.chunk.strength!) <= rank(min), `${i.chunk.id} is ${i.chunk.strength}, below ${min}`);
    }
  }
  assert.ok(!ids(state({ minStrength: "built" })).includes("evidence:sample-course-usability-test"));
  assert.ok(ids(state({ minStrength: "studied" })).includes("evidence:sample-course-usability-test"));
  assert.deepEqual(ids(state({ minStrength: "shipped", roles: ["media-producer"] })), ["evidence:sample-video-short-film"]);
});

test("without q: strength first, then matched facets, then recency", () => {
  const order = engine.filter(empty).items.map((i) => i.chunk.strength);
  const ranks = order.map((s) => strengths.indexOf(s!));
  assert.deepEqual(ranks, [...ranks].sort((a, b) => a - b));

  const e = make([
    item("old", { date: "2020", facets: { skills: ["figma"] } }),
    item("new", { date: "2025-02", facets: { skills: ["figma"] } }),
    item("more", { date: "2019", facets: { skills: ["figma"], methods: ["usability-testing"] } }),
  ]);
  const r = e.filter(state({ skills: ["figma"], methods: ["usability-testing", "surveys"], minStrength: "built" }));
  assert.deepEqual(r.items.map((i) => i.chunk.id), ["evidence:more"]);
  const only = ids(state({ skills: ["figma"], minStrength: "built" }), e).filter((id) => id.startsWith("evidence:"));
  assert.ok(only.indexOf("evidence:new") < only.indexOf("evidence:old"), "newer first on a tie");
});

test("q ranks by BM25 and drops items with no matching word", () => {
  const r = engine.filter(state({ q: "usability test participants" }));
  assert.equal(r.items[0].chunk.id, "evidence:sample-course-usability-test");
  assert.ok(r.items[0].score > 0);
  assert.ok(r.items.every((i) => i.score > 0));
  // Synonym expansion lets weak matches through ("tests" in the sample detail), but they rank far below.
  const film = r.items.find((i) => i.chunk.id === "evidence:sample-video-short-film");
  assert.ok(!film || film.score < r.items[0].score / 4);

  const shortFilm = engine.filter(state({ q: "short film script editing" }));
  assert.equal(shortFilm.items[0].chunk.id, "evidence:sample-video-short-film");

  assert.equal(engine.filter(state({ q: "the of and" })).total, engine.filter(empty).total, "stopword-only q is ignored");
  assert.doesNotThrow(() => engine.filter(state({ q: "<script>\u0000 ".repeat(100) })));
});

test("diversity cap: at most 2 per slug or source label in the top 12", () => {
  const many = [
    ...Array.from({ length: 6 }, (_, i) => item(`same-label-${i}`, { source: { kind: "course", label: "SAMPLE one course" }, date: `2024-0${i + 1}` })),
    ...Array.from({ length: 6 }, (_, i) => item(`same-slug-${i}`, { slug: "woven", source: { kind: "project", label: `SAMPLE woven ${i}` } })),
    ...Array.from({ length: 6 }, (_, i) => item(`other-${i}`, { source: { kind: "video", label: `SAMPLE other ${i}` } })),
  ];
  const e = make(many);
  const r = e.filter(state({ skills: ["figma"] }));
  const top = r.items.slice(0, 12);
  const counts = new Map<string, number>();
  for (const i of top) counts.set(i.chunk.slug ?? i.chunk.label, (counts.get(i.chunk.slug ?? i.chunk.label) ?? 0) + 1);
  for (const [key, n] of counts) assert.ok(n <= 2, `${key} appears ${n} times in the top 12`);
  assert.equal(top.length, 12);
  assert.equal(r.items.length, r.total, "capped items follow the top 12 rather than vanishing");
});

test("facetCounts: sane counts for every taxonomy entry", () => {
  const counts = engine.facetCounts(empty);
  const entries = facetGroups.reduce((n, g) => n + facets[g].length, 0);
  assert.equal(counts.length, entries);
  const total = engine.filter(empty).total;
  for (const c of counts) assert.ok(c.count >= 0 && c.count <= total, `${c.id}: ${c.count} of ${total}`);

  const react = counts.find((c) => c.group === "skills" && c.id === "react")!;
  assert.ok(react.count >= 1);
  assert.equal(react.count, ids(state({ skills: ["react"] })).length);
  assert.ok(counts.filter((c) => c.count === 0).every((c) => c.strongest === undefined));
  assert.ok(counts.filter((c) => c.count > 0).every((c) => c.strongest));
  const film = counts.find((c) => c.id === "film-media")!;
  assert.equal(film.strongest, "shipped");

  // Adding to an OR group widens; adding to another group narrows.
  const base = state({ roles: ["media-producer"] });
  const withOr = engine.facetCounts(base).find((c) => c.id === "ux-researcher")!;
  assert.equal(withOr.count, ids(state({ roles: ["media-producer", "ux-researcher"] })).length);
  const withAnd = engine.facetCounts(base).find((c) => c.id === "react")!;
  assert.equal(withAnd.count, 0);
  // A selected entry reports the current result.
  assert.equal(engine.facetCounts(base).find((c) => c.id === "media-producer")!.count, engine.filter(base).total);
});

test("every evidence facet id exists in the taxonomy", () => {
  for (const ev of evidence) {
    for (const [group, list] of Object.entries(ev.facets)) {
      assert.ok(facetGroups.includes(group as never), `${ev.id}: unknown group ${group}`);
      const known = new Set(facets[group as keyof typeof facets].map((e) => e.id));
      for (const id of list ?? []) assert.ok(known.has(id), `${ev.id}: "${id}" is not in taxonomy.${group}`);
    }
  }
});

test("evidence items are well formed", () => {
  const seen = new Set<string>();
  for (const ev of evidence) {
    assert.ok(!seen.has(ev.id), `duplicate id ${ev.id}`);
    seen.add(ev.id);
    assert.ok(ev.claim.length > 0 && ev.claim.length <= 160, `${ev.id}: claim length ${ev.claim.length}`);
    assert.ok((strengths as readonly string[]).includes(ev.strength), `${ev.id}: bad strength`);
    assert.match(ev.date, /^\d{4}(-(0[1-9]|1[0-2]))?$/, `${ev.id}: bad date`);
    assert.ok(["draft", "approved"].includes(ev.status));
  }
  assert.ok(evidence.some((e) => e.status === "draft") && evidence.some((e) => e.status === "approved"));
  assert.ok(evidence.filter((e) => e.source.label.startsWith("SAMPLE")).length === evidence.length);
});

test("taxonomy ids are unique per group and reuse Topic ids", () => {
  for (const group of facetGroups) {
    const list = facets[group].map((e) => e.id);
    assert.equal(new Set(list).size, list.length, `duplicate id in ${group}`);
    for (const e of facets[group]) {
      assert.match(e.id, /^[a-z0-9]+(-[a-z0-9]+)*$/);
      assert.ok(e.aliases.every((a) => a === a.toLowerCase()), `${e.id}: aliases must be lowercase`);
    }
  }
  const topicIds = new Set(askContent.topics.map((t) => t.id));
  const reused = ["ux-engineer", "ux-designer", "ux-researcher", "healthcare", "automotive", "spatial", "voice-ai"];
  for (const id of reused) {
    assert.ok(topicIds.has(id), `${id} is not a Topic id`);
    assert.ok(facetGroups.some((g) => facets[g].some((e) => e.id === id)), `${id} missing from taxonomy`);
  }
});

test("every case study gets at least one facet and a strength", () => {
  for (const study of studies) {
    const chunk = engine.chunks.find((c) => c.id === `${study.slug}:summary` || c.id === `${study.slug}:overview`)!;
    const count = facetGroups.reduce((n, g) => n + (chunk.facets?.[g]?.length ?? 0), 0);
    assert.ok(count > 0, `${study.slug} has no facets`);
    assert.ok(chunk.strength, `${study.slug} has no strength`);
    assert.ok(engine.filterable.some((c) => c.slug === study.slug), `${study.slug} is not filterable`);
  }
  const strengthOf = (slug: string) => engine.chunks.find((c) => c.id === `${slug}:overview`)!.strength;
  assert.equal(strengthOf("omniabrowser"), "shipped");
  assert.equal(strengthOf("woven"), "built"); // site status is "Prototype"; no overrides
  assert.equal(strengthOf("fleet-console"), "built");
  assert.ok(ids(state({ domains: ["healthcare"] })).some((id) => id.startsWith("syncare-ai-health:")));
  assert.ok(ids(state({ domains: ["automotive"], roles: ["ux-engineer"] })).some((id) => id.startsWith("woven:")));
});

test("ask() output is unchanged by evidence", () => {
  const bare = createAsk({ site, studies, studyMeta, personal, config });
  for (const q of ["healthcare work", "CARLA simulator", "I’m searching for a UX designer"]) {
    assert.deepEqual(engine.ask(q), bare.ask(q));
  }
});
