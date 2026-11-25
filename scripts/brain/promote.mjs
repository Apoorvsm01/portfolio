// Usage: node scripts/brain/promote.mjs <draft-file> [--ids a,b,c | --all] [--approve]
// Copies chosen items from a draft into content/brain/evidence/<unit-slug>.json (merge by id), then regenerates index.ts.
import { writeFileSync, existsSync } from "node:fs";
import { basename, join } from "node:path";
import { EVIDENCE_DIR, readJson } from "./lib.mjs";
import { genIndex } from "./gen-index.mjs";

const args = process.argv.slice(2);
const file = args.find((a) => !a.startsWith("--") && args[args.indexOf(a) - 1] !== "--ids");
const all = args.includes("--all");
const approve = args.includes("--approve");
const idsArg = args.indexOf("--ids");
const ids = idsArg >= 0 ? (args[idsArg + 1] ?? "").split(",").map((s) => s.trim()).filter(Boolean) : [];

if (!file || (!all && !ids.length)) {
  console.error("usage: node scripts/brain/promote.mjs <draft-file> [--ids a,b,c | --all] [--approve]");
  process.exit(2);
}
const data = readJson(file);
const items = Array.isArray(data) ? data : data.items;
if (!Array.isArray(items)) { console.error("draft has no items array"); process.exit(1); }
const chosen = all ? items : items.filter((it) => ids.includes(it.id));
const missing = ids.filter((id) => !items.some((it) => it.id === id));
if (missing.length) { console.error(`ids not found in draft: ${missing.join(", ")}`); process.exit(1); }

const unit = basename(file).replace(/\.json$/, "").replace(/\.part\d+$/, "");
const dest = join(EVIDENCE_DIR, `${unit}.json`);
const existing = existsSync(dest) ? readJson(dest) : [];
const merged = new Map(existing.map((it) => [it.id, it]));
for (const it of chosen) merged.set(it.id, { ...it, status: approve ? "approved" : it.status === "approved" ? "approved" : "draft" });
writeFileSync(dest, JSON.stringify([...merged.values()], null, 2) + "\n");
genIndex();
console.log(`${chosen.length} item(s) -> content/brain/evidence/${unit}.json (${merged.size} total)${approve ? ", approved" : ", draft"}`);
