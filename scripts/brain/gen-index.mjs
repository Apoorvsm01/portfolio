// Regenerates content/brain/evidence/index.ts from the JSON files in that folder.
// Usage: node scripts/brain/gen-index.mjs [--dir <evidence dir>]
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { EVIDENCE_DIR, jsonFiles, renderIndex } from "./lib.mjs";

export function genIndex(dir = EVIDENCE_DIR) {
  const files = jsonFiles(dir);
  writeFileSync(join(dir, "index.ts"), renderIndex(files));
  return files;
}

if (import.meta.main) {
  const i = process.argv.indexOf("--dir");
  const files = genIndex(i > 0 ? process.argv[i + 1] : EVIDENCE_DIR);
  console.log(`index.ts: ${files.length} evidence file(s)`);
}
