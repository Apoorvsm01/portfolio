// Applies brain-inbox/review.md to content/brain/evidence/<unit>.json, then regenerates index.ts and validates.
// Usage: node scripts/brain/review-apply.mjs [--dry-run]   (or npm run brain:apply)
// Ticked items are upserted (status "approved"); unticked items already in an evidence file are removed.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { strengths } from "../../content/brain/taxonomy.ts";
import { DRAFTS_DIR, EVIDENCE_DIR, REVIEW_PATH, ROOT, withOrg } from "./lib.mjs";
import { loadDrafts } from "./review-gen.mjs";

const SECTION_RE = /^## (.+) \(([^()]+)\)\s*$/;
const ITEM_RE = /^- \[([ xX])\] `([^`]+)` \*\*([^*]+)\*\* · (.*)$/;

// Parses review.md into [{unit, id, ticked, strength, claim}]. Item lines that do not match the
// format come back as {unit, malformed: line} so the caller can report them.
export function parseReview(markdown) {
  const out = [];
  let unit = null;
  for (const raw of markdown.split(/\r?\n/)) {
    const section = raw.match(SECTION_RE);
    if (section) {
      unit = section[2];
      continue;
    }
    if (!raw.startsWith("- [") || !unit) continue;
    const m = raw.match(ITEM_RE);
    if (!m) {
      out.push({ unit, malformed: raw });
      continue;
    }
    out.push({ unit, id: m[2], ticked: m[1] !== " ", strength: m[3].trim(), claim: m[4].trim() });
  }
  return out;
}

const byId = (a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0);

if (import.meta.main) {
  const dryRun = process.argv.includes("--dry-run");
  const entries = parseReview(readFileSync(REVIEW_PATH, "utf8"));

  const draftById = new Map();
  for (const g of loadDrafts(DRAFTS_DIR)) for (const it of g.items) if (!draftById.has(it.id)) draftById.set(it.id, it);

  const errors = [];
  const perUnit = new Map();
  for (const e of entries) {
    if (e.malformed !== undefined) {
      errors.push(`review.md: cannot parse item line: ${e.malformed.slice(0, 80)}`);
      continue;
    }
    if (!perUnit.has(e.unit)) perUnit.set(e.unit, []);
    perUnit.get(e.unit).push(e);
  }

  const plan = [];
  for (const [unit, list] of [...perUnit.entries()].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))) {
    const file = join(EVIDENCE_DIR, `${unit}.json`);
    const existingText = existsSync(file) ? readFileSync(file, "utf8") : null;
    const existing = existingText ? JSON.parse(existingText) : [];
    const current = new Map(existing.map((it) => [it.id, it]));
    const counts = { unit, approved: 0, removed: 0, unchanged: 0 };

    for (const e of list) {
      if (e.ticked) {
        if (!strengths.includes(e.strength)) errors.push(`${e.id} (${unit}): strength "${e.strength}" not in ${strengths.join("|")}`);
        if (!e.claim) errors.push(`${e.id} (${unit}): claim is empty`);
        const base = draftById.get(e.id) ?? current.get(e.id);
        if (!base) {
          errors.push(`${e.id} (${unit}): no draft or evidence item with this id`);
          continue;
        }
        current.set(e.id, withOrg({ ...base, claim: e.claim, strength: e.strength, status: "approved" }, unit));
        counts.approved++;
      } else if (current.has(e.id)) {
        current.delete(e.id);
        counts.removed++;
      } else {
        counts.unchanged++;
      }
    }
    plan.push({ unit, file, existingText, items: [...current.values()].sort(byId), counts });
  }

  if (errors.length) {
    for (const err of errors) console.error(`error: ${err}`);
    console.error("nothing written; fix the errors above in review.md and run again");
    process.exit(1);
  }

  for (const p of plan) {
    const text = JSON.stringify(p.items, null, 2) + "\n";
    if (!dryRun && text !== p.existingText) writeFileSync(p.file, text);
    console.log(`${p.unit}: approved ${p.counts.approved}, removed ${p.counts.removed}, unchanged ${p.counts.unchanged}`);
  }
  const total = plan.reduce((t, p) => ({
    approved: t.approved + p.counts.approved,
    removed: t.removed + p.counts.removed,
    unchanged: t.unchanged + p.counts.unchanged,
  }), { approved: 0, removed: 0, unchanged: 0 });
  console.log(`total: approved ${total.approved}, removed ${total.removed}, unchanged ${total.unchanged}${dryRun ? " (dry run, nothing written)" : ""}`);

  if (dryRun) process.exit(0);

  const gen = spawnSync(process.execPath, [join(ROOT, "scripts/brain/gen-index.mjs")], { stdio: "inherit" });
  if (gen.status !== 0) process.exit(gen.status ?? 1);
  const val = spawnSync(process.execPath, [join(ROOT, "scripts/brain/validate.mjs")], { stdio: "inherit" });
  process.exit(val.status ?? 1);
}
