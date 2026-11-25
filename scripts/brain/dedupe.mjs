// Clusters near-duplicate claims across ALL evidence files and keeps one canonical item per cluster.
// Usage: node scripts/brain/dedupe.mjs [--dry-run]
//   --dry-run  writes brain-inbox/dedupe-report.md only.
//   (default)  also removes dropped items from evidence files, unticks them in brain-inbox/review.md,
//              merges their facets into the kept item, and regenerates index.ts.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { strengths } from "../../content/brain/taxonomy.ts";
import { EVIDENCE_DIR, REVIEW_PATH, ROOT, jsonFiles, readJson, detectEmployer } from "./lib.mjs";

export const JACCARD = 0.5;
const STOP = new Set(("a an the and or of for to in on at by with from as is are was were be been being it its this that these those " +
  "i my me we our us you your their his her over into per via across using use used while than then also both each more most").split(" "));

const norm = (s) => s.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, " ").replace(/\s+/g, " ").trim();
export const wordSet = (s) => new Set(norm(s).split(" ").filter((w) => w && !STOP.has(w)));
export const jaccard = (a, b) => {
  let i = 0;
  for (const w of a) if (b.has(w)) i++;
  const u = a.size + b.size - i;
  return u ? i / u : 0;
};
// Numeric facts such as "25+", "4.9/5", "40%", "3x".
export const numbers = (s) => new Set((s.toLowerCase().match(/\d[\d,.]*\d?(?:\s?\/\s?\d+|\s?[+%x]|k\b)?/g) ?? []).map((n) => n.replace(/\s+/g, "").replace(/[.,]$/, "")));
const sharedNumbers = (a, b) => [...a].filter((n) => b.has(n)).length;

// Entities by which "same employer" is judged.
const employerOf = (it) => it.org ?? detectEmployer(`${it.claim} ${it.detail ?? ""}`);

export function cluster(items) {
  const info = items.map((it) => ({ it, w: wordSet(it.claim), n: numbers(it.claim), emp: employerOf(it) }));
  const parent = items.map((_, i) => i);
  const find = (i) => (parent[i] === i ? i : (parent[i] = find(parent[i])));
  for (let i = 0; i < info.length; i++)
    for (let j = i + 1; j < info.length; j++) {
      const a = info[i], b = info[j];
      const sim = jaccard(a.w, b.w);
      // Third rule (beyond the two in the brief): same employer, one identical number, and loosely similar wording
      // catches rewordings like "25+ UX/UI projects ... fintech" vs "25+ UX/UI projects ... fintech, healthtech, 4.9/5".
      const same =
        sim >= JACCARD ||
        (a.emp && a.emp === b.emp && sharedNumbers(a.n, b.n) >= 2) ||
        (a.emp && a.emp === b.emp && sharedNumbers(a.n, b.n) >= 1 && sim >= 0.3);
      if (same) parent[find(j)] = find(i);
    }
  const groups = new Map();
  items.forEach((it, i) => {
    const r = find(i);
    if (!groups.has(r)) groups.set(r, []);
    groups.get(r).push(it);
  });
  return [...groups.values()].filter((g) => g.length > 1);
}

const strengthRank = (s) => strengths.length - strengths.indexOf(s);
const specificity = (it) => (it.claim.match(/\d+/g)?.length ?? 0) + (it.claim.match(/(?<!^|[.!?]\s)\b[A-Z][\w-]+/g)?.length ?? 0);
const lenScore = (it) => (it.claim.length <= 160 ? it.claim.length : 0);

// Higher strength, then more specific (numbers + proper nouns, then longer within 160 chars), then newest date.
export function rankCanonical(group) {
  return [...group].sort(
    (a, b) =>
      strengthRank(b.strength) - strengthRank(a.strength) ||
      specificity(b) - specificity(a) ||
      lenScore(b) - lenScore(a) ||
      b.date.localeCompare(a.date) ||
      a.id.localeCompare(b.id),
  );
}

export function mergeFacets(into, from) {
  const out = { ...into };
  for (const [g, ids] of Object.entries(from ?? {})) out[g] = [...new Set([...(out[g] ?? []), ...ids])];
  return out;
}

if (import.meta.main) {
  const dry = process.argv.includes("--dry-run");
  const files = jsonFiles(EVIDENCE_DIR);
  const data = new Map(files.map((f) => [f, readJson(join(EVIDENCE_DIR, f))]));
  const all = [...data.values()].flat();
  const clusters = cluster(all).map((g) => {
    const [keep, ...drop] = rankCanonical(g);
    return { keep, drop };
  }).sort((a, b) => b.drop.length - a.drop.length || a.keep.id.localeCompare(b.keep.id));

  const dropIds = new Set(clusters.flatMap((c) => c.drop.map((d) => d.id)));
  const lines = [
    "# Dedupe report",
    "",
    `${all.length} items, ${clusters.length} clusters, ${dropIds.size} dropped, ${all.length - dropIds.size} kept.`,
    "",
  ];
  clusters.forEach((c, i) => {
    lines.push(`## Cluster ${i + 1} (${c.drop.length + 1} items)`, "", `- KEEP \`${c.keep.id}\` (${c.keep.strength}, ${c.keep.date}): ${c.keep.claim}`);
    for (const d of c.drop) lines.push(`- drop \`${d.id}\` (${d.strength}, ${d.date}): ${d.claim}`);
    lines.push("");
  });
  writeFileSync(join(ROOT, "brain-inbox/dedupe-report.md"), lines.join("\n"));
  console.log(`dedupe: ${all.length} items, ${clusters.length} clusters, ${dropIds.size} to drop${dry ? " (dry run, report only)" : ""}`);
  if (dry) process.exit(0);

  const keepById = new Map(clusters.map((c) => [c.keep.id, c]));
  for (const [f, items] of data) {
    const next = items
      .filter((it) => !dropIds.has(it.id))
      .map((it) => {
        const c = keepById.get(it.id);
        return c ? { ...it, facets: c.drop.reduce((acc, d) => mergeFacets(acc, d.facets), it.facets) } : it;
      });
    if (next.length !== items.length || JSON.stringify(next) !== JSON.stringify(items)) writeFileSync(join(EVIDENCE_DIR, f), JSON.stringify(next, null, 2) + "\n");
  }

  if (existsSync(REVIEW_PATH)) {
    let n = 0;
    const out = readFileSync(REVIEW_PATH, "utf8").split("\n").map((line) => {
      const m = line.match(/^- \[[xX]\] `([^`]+)`/);
      if (m && dropIds.has(m[1])) { n++; return line.replace("- [x]", "- [ ]").replace("- [X]", "- [ ]"); }
      return line;
    });
    writeFileSync(REVIEW_PATH, out.join("\n"));
    console.log(`review.md: unticked ${n} item(s)`);
  }
  const gen = spawnSync(process.execPath, [join(ROOT, "scripts/brain/gen-index.mjs")], { stdio: "inherit" });
  process.exit(gen.status ?? 0);
}
