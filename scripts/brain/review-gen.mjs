// Writes brain-inbox/review.md: a hand-editable checklist of every draft item.
// Usage: node scripts/brain/review-gen.mjs   (or npm run brain:review)
// Edit the file, then run `npm run brain:apply`. Re-running this overwrites review.md.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { blockedWords } from "../../content/ask.ts";
import { strengths } from "../../content/brain/taxonomy.ts";
import { DRAFTS_DIR, EVIDENCE_DIR, REVIEW_PATH, jsonFiles, readJson, unitOf } from "./lib.mjs";

export const FLAG_RESUME = "metric from a resume — confirm it is still accurate";
export const FLAG_BLOCKED = (w) => `blocked word: ${w}`;
export const FLAG_DUP = (id) => `possible duplicate of ${id}`;
export const DUP_THRESHOLD = 0.6;

const wordSet = (s) => new Set(String(s).toLowerCase().split(/[^\p{L}\p{N}]+/u).filter(Boolean));
const jaccard = (a, b) => {
  let inter = 0;
  for (const w of a) if (b.has(w)) inter++;
  const union = a.size + b.size - inter;
  return union ? inter / union : 0;
};
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Flags for one item. `allItems` is the full ordered list (earlier items come first); only the later
// item of a duplicate pair is flagged. `unit` is the draft's unit name (used by the resume rule).
export function flagsFor(item, allItems, blockedWordList, unit = "") {
  const flags = [];
  const claim = String(item.claim ?? "");
  const text = [item.claim, item.detail].filter((s) => typeof s === "string").join(" \n ");

  if ((item.source?.kind === "resume" || unit.includes("resume")) && /\d/.test(claim)) flags.push(FLAG_RESUME);

  for (const w of blockedWordList) {
    const re = new RegExp(`(?<![\\p{L}\\p{N}])${escapeRe(w)}(?![\\p{L}\\p{N}])`, "iu");
    if (re.test(text)) flags.push(FLAG_BLOCKED(w));
  }

  const idx = allItems.indexOf(item);
  const earlier = idx === -1 ? allItems.filter((o) => o.id !== item.id) : allItems.slice(0, idx);
  const mine = wordSet(claim);
  const dup = earlier.find((o) => o !== item && jaccard(mine, wordSet(o.claim ?? "")) >= DUP_THRESHOLD);
  if (dup) flags.push(FLAG_DUP(dup.id));

  return flags;
}

const flagType = (f) =>
  f.startsWith("metric from a resume") ? "resume" : f.startsWith("blocked word") ? "blocked" : "duplicate";

// Draft files (array or {items: [...]}) merged by unit: parts of one unit are concatenated in file order.
// Returns [{unit, items}] sorted by unit name.
export function loadDrafts(dir) {
  const byUnit = new Map();
  for (const f of jsonFiles(dir)) {
    const data = readJson(join(dir, f));
    const items = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : [];
    const unit = unitOf(f);
    byUnit.set(unit, [...(byUnit.get(unit) ?? []), ...items]);
  }
  return [...byUnit.keys()].sort().map((unit) => ({ unit, items: byUnit.get(unit) }));
}

// Ids already approved in content/brain/evidence/*.json.
function approvedIds(dir) {
  const ids = new Set();
  for (const f of jsonFiles(dir)) {
    const data = readJson(join(dir, f));
    if (!Array.isArray(data)) continue;
    for (const it of data) if (it?.status === "approved" && it.id) ids.add(it.id);
  }
  return ids;
}

const itemLine = (item, ticked, strength, claim) => `- [${ticked ? "x" : " "}] \`${item.id}\` **${strength}** · ${claim}`;

export function renderReview(groups, approved, blocked) {
  const flat = groups.flatMap((g) => g.items.map((item) => ({ unit: g.unit, item })));
  const allItems = flat.map((x) => x.item);
  const counts = { units: groups.length, items: flat.length, preTicked: 0, flagged: 0, resume: 0, blocked: 0, duplicate: 0 };

  const out = [
    "# Brain review",
    "",
    "Tick `[x]` to approve an item. Leave `[ ]` to reject it.",
    "Edit the claim text after the `· ` on the same line freely.",
    `To change the strength, replace the word in **bold** with one of: ${strengths.join(", ")}.`,
    "Then run `npm run brain:apply`. Re-running `npm run brain:review` overwrites this file.",
    "",
  ];

  for (const g of groups) {
    const label = g.items[0]?.source?.label ?? g.unit;
    out.push(`## ${label} (${g.unit})`);
    for (const item of g.items) {
      const ticked = approved.has(item.id);
      if (ticked) counts.preTicked++;
      const flags = flagsFor(item, allItems, blocked, g.unit);
      if (flags.length) counts.flagged++;
      for (const f of flags) counts[flagType(f)]++;
      const facetIds = Object.values(item.facets ?? {}).flat().filter(Boolean);
      const meta = [item.date, facetIds.length ? facetIds.join(", ") : null, flags.length ? `⚠ ${flags.join("; ")}` : null]
        .filter(Boolean)
        .join(" · ");
      out.push(itemLine(item, ticked, item.strength, String(item.claim ?? "").trim()));
      out.push(`  ${meta}`);
    }
    out.push("");
  }

  return { markdown: out.join("\n"), counts };
}

if (import.meta.main) {
  const groups = loadDrafts(DRAFTS_DIR);
  const approved = approvedIds(EVIDENCE_DIR);
  const { markdown, counts } = renderReview(groups, approved, blockedWords);
  mkdirSync(dirname(REVIEW_PATH), { recursive: true });
  // Never silently discard hand edits: an existing sheet with ticks must be applied first, or overwritten on purpose.
  if (existsSync(REVIEW_PATH) && /^- \[x\]/im.test(readFileSync(REVIEW_PATH, "utf8")) && !process.argv.includes("--force")) {
    console.error("review.md has ticked items. Run `npm run brain:apply` first, or pass --force to overwrite it.");
    process.exit(1);
  }
  writeFileSync(REVIEW_PATH, markdown);
  console.log(`review.md: ${counts.units} unit(s), ${counts.items} item(s), ${counts.preTicked} pre-ticked (already approved)`);
  console.log(
    `flagged items: ${counts.flagged} (resume metric: ${counts.resume}, blocked word: ${counts.blocked}, possible duplicate: ${counts.duplicate})`,
  );
}
