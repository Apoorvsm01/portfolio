// Run: node --test src/components/graph/model.test.ts   (Node 22.18+ strips types natively)
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
import type { Evidence } from "../../lib/ask/types";
import { buildGraph, highlightFor, layout, MIN_GAP, CENTER_ID, type Graph, type Layout } from "./model.ts";

const readJson = <T>(dir: URL) =>
  readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => JSON.parse(readFileSync(new URL(f, dir), "utf8")) as T);

const studies = readJson<CaseStudy>(new URL("../../../content/case-studies/", import.meta.url));
// Real, approved evidence: the graph is judged on the data the home page will actually show.
const evidence = readJson<Evidence[]>(new URL("../../../content/brain/evidence/", import.meta.url)).flat();
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
const make = () => createAsk({ site, studies, studyMeta, personal, config, taxonomy: facets, evidence });
const graph = buildGraph(make());

const sizes: [number, number, boolean][] = [
  [1200, 680, false],
  [375, 560, true],
];

test("graph has the requested ring sizes", () => {
  const count = (k: string) => graph.nodes.filter((n) => n.kind === k).length;
  assert.equal(count("center"), 1);
  assert.ok(count("domain") > 0 && count("domain") <= 8);
  assert.ok(count("source") > 0 && count("source") <= Math.max(14, studies.length));
  assert.ok(count("skill") > 0 && count("skill") <= 10);
  console.log("ring counts", { domains: count("domain"), sources: count("source"), skills: count("skill"), edges: graph.edges.length });
});

test("same input gives identical graph and layout", () => {
  const again = buildGraph(make());
  assert.deepEqual(again, graph);
  for (const [w, h, c] of sizes) assert.deepEqual(layout(again, { width: w, height: h, compact: c }), layout(graph, { width: w, height: h, compact: c }));
});

test("every edge endpoint exists and ids are unique", () => {
  const ids = new Set(graph.nodes.map((n) => n.id));
  assert.equal(ids.size, graph.nodes.length);
  assert.equal(new Set(graph.edges.map((e) => e.id)).size, graph.edges.length);
  for (const e of graph.edges) {
    assert.ok(ids.has(e.from), e.from);
    assert.ok(ids.has(e.to), e.to);
  }
  for (const [w, h, c] of sizes) {
    const l = layout(graph, { width: w, height: h, compact: c });
    const lids = new Set(l.nodes.map((n) => n.id));
    for (const e of l.edges) assert.ok(lids.has(e.from) && lids.has(e.to));
  }
});

test("each source has at most 3 domain and 3 skill edges", () => {
  for (const s of graph.nodes.filter((n) => n.kind === "source")) {
    const dom = graph.edges.filter((e) => e.to === s.id && e.from.startsWith("domain:")).length;
    const skl = graph.edges.filter((e) => e.from === s.id && e.to.startsWith("skill:")).length;
    assert.ok(dom <= 3, `${s.id} domains ${dom}`);
    assert.ok(skl <= 3, `${s.id} skills ${skl}`);
  }
});

function minSeparation(l: Layout) {
  let worst = Infinity;
  let pair = "";
  for (let i = 0; i < l.nodes.length; i++)
    for (let j = i + 1; j < l.nodes.length; j++) {
      const a = l.nodes[i];
      const b = l.nodes[j];
      const slack = Math.hypot(a.x - b.x, a.y - b.y) - (a.r + b.r + MIN_GAP);
      if (slack < worst) {
        worst = slack;
        pair = `${a.id} / ${b.id}`;
      }
    }
  return { worst, pair };
}

for (const [w, h, c] of sizes) {
  test(`no overlapping nodes at ${w}x${h}${c ? " (compact)" : ""}`, () => {
    const l = layout(graph, { width: w, height: h, compact: c });
    const { worst, pair } = minSeparation(l);
    assert.ok(worst >= 0, `${pair} closer than radii + ${MIN_GAP}px by ${-worst}`);
    for (const n of l.nodes) assert.ok(n.x - n.r >= 0 && n.x + n.r <= w && n.y - n.r >= 0 && n.y + n.r <= h, `${n.id} inside the canvas`);
    if (c) assert.ok(l.nodes.every((n) => n.kind !== "skill"), "compact has no skill ring");
  });
}

test("no two shown labels overlap", () => {
  for (const [w, h, c] of sizes) {
    const l = layout(graph, { width: w, height: h, compact: c });
    const boxes = l.nodes
      .filter((n) => n.labelBox.show)
      .map((n) => {
        const b = n.labelBox;
        const x0 = b.anchor === "start" ? b.x : b.anchor === "end" ? b.x - b.width : b.x - b.width / 2;
        return { id: n.id, x0, x1: x0 + b.width, y0: b.y - b.fontSize, y1: b.y + 4 };
      });
    for (let i = 0; i < boxes.length; i++)
      for (let j = i + 1; j < boxes.length; j++) {
        const p = boxes[i];
        const q = boxes[j];
        assert.ok(!(p.x0 < q.x1 && q.x0 < p.x1 && p.y0 < q.y1 && q.y0 < p.y1), `${p.id} / ${q.id}`);
      }
  }
});

test("highlightFor returns only existing ids and the edges between lit nodes", () => {
  const ids = new Set(graph.nodes.map((n) => n.id));
  const eids = new Set(graph.edges.map((e) => e.id));
  const dom = graph.nodes.find((n) => n.kind === "domain")!;
  const src = graph.nodes.find((n) => n.kind === "source")!;
  const h = highlightFor(graph, { domains: [dom.facet!.id, "not-a-domain"], skills: ["nope"] }, [src.key!, "nope"]);
  assert.ok(h.nodes.has(CENTER_ID) && h.nodes.has(dom.id) && h.nodes.has(src.id));
  for (const n of h.nodes) assert.ok(ids.has(n), n);
  for (const e of h.edges) {
    assert.ok(eids.has(e), e);
    const edge = graph.edges.find((x) => x.id === e)!;
    assert.ok(h.nodes.has(edge.from) && h.nodes.has(edge.to));
  }
  assert.ok(h.edges.has(`${CENTER_ID}>${dom.id}`));
  const none = highlightFor(graph, {}, []);
  assert.deepEqual([...none.nodes], [CENTER_ID]);
  assert.equal(none.edges.size, 0);
});

test("a graph with only the centre still lays out", () => {
  const g: Graph = { nodes: [{ id: CENTER_ID, kind: "center", label: "Apoorv", weight: 1 }], edges: [], orgToStudy: {} };
  assert.equal(layout(g, { width: 1200, height: 680 }).nodes.length, 1);
});

test("every case study is a source, labelled by its title, and Woven is never missing", () => {
  const sources = graph.nodes.filter((n) => n.kind === "source");
  for (const s of studies) assert.ok(sources.some((n) => n.slug === s.slug), `missing case study ${s.slug}`);
  const woven = sources.find((n) => n.slug === "woven");
  assert.ok(woven);
  assert.equal(woven.label, studies.find((s) => s.slug === "woven")!.title);
  assert.ok(sources.length <= Math.max(14, studies.length));
});

test("org sources: no bare Resume bucket, aliases applied, case studies listed before orgs", () => {
  const sources = graph.nodes.filter((n) => n.kind === "source");
  const labels = sources.map((n) => n.label);
  assert.ok(!labels.includes("Resume"));
  assert.ok(sources.every((n) => n.slug || n.org || n.key === "youtube"), "every source is a study, an employer or YouTube");
  assert.ok(labels.includes("DePaul HCI") && !labels.includes("DePaul"));
  assert.ok(!labels.includes("Apoorvsm01.github.io"));
  const firstOrg = graph.nodes.findIndex((n) => n.kind === "source" && !n.slug);
  const lastStudy = graph.nodes.map((n) => n.kind === "source" && !!n.slug).lastIndexOf(true);
  assert.ok(lastStudy < firstOrg);
});

function crossings(l: Layout) {
  const segs = l.edges.map((e) => ({ e, a: l.nodes.find((n) => n.id === e.from)!, b: l.nodes.find((n) => n.id === e.to)! }));
  type P = { x: number; y: number };
  const orient = (p: P, q: P, r: P) => Math.sign((q.x - p.x) * (r.y - p.y) - (q.y - p.y) * (r.x - p.x));
  let n = 0;
  for (let i = 0; i < segs.length; i++)
    for (let j = i + 1; j < segs.length; j++) {
      const s = segs[i];
      const t = segs[j];
      if (s.e.from === t.e.from || s.e.from === t.e.to || s.e.to === t.e.from || s.e.to === t.e.to) continue;
      if (orient(s.a, s.b, t.a) !== orient(s.a, s.b, t.b) && orient(t.a, t.b, s.a) !== orient(t.a, t.b, s.b)) n++;
    }
  return n;
}

test("ordering domains by relatedness crosses fewer edges than ordering by weight", () => {
  const related = crossings(layout(graph, { width: 1200, height: 680, domainOrder: "related" }));
  const byWeight = crossings(layout(graph, { width: 1200, height: 680, domainOrder: "weight" }));
  console.log("edge crossings", { related, byWeight });
  assert.ok(related < byWeight, `${related} vs ${byWeight}`);
});

test("compact labels: long ones are shortened rather than hidden", () => {
  const l = layout(graph, { width: 375, height: 560, compact: true });
  const hidden = l.nodes.filter((n) => !n.labelBox.show);
  console.log("compact hidden labels", hidden.map((n) => n.label));
  assert.ok(hidden.length <= 3);
  for (const n of l.nodes.filter((x) => x.labelBox.show)) {
    const t = n.labelBox.text;
    assert.ok(t === n.label || (t.endsWith("…") && n.label.startsWith(t.slice(0, -1))), `${n.label} -> ${t}`);
  }
});
