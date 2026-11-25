// Sets `org` and resume source labels on every evidence item. Usage: node scripts/brain/orgs.mjs [--dry-run]
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { EVIDENCE_DIR, jsonFiles, readJson, unitOf, withOrg } from "./lib.mjs";

const dry = process.argv.includes("--dry-run");
let changed = 0;
for (const f of jsonFiles(EVIDENCE_DIR)) {
  const items = readJson(join(EVIDENCE_DIR, f));
  const next = items.map((it) => withOrg(it, unitOf(f)));
  const text = JSON.stringify(next, null, 2) + "\n";
  if (JSON.stringify(items) !== JSON.stringify(next)) {
    changed++;
    if (!dry) writeFileSync(join(EVIDENCE_DIR, f), text);
  }
}
console.log(`orgs: ${changed} file(s) ${dry ? "would change" : "updated"}`);
