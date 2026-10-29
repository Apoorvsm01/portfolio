// Word budget check for the snapshot case studies (excludes alt text; hero facts reported separately).
import fs from "node:fs";
const budgets = { "fleet-console": 450, "design-crew": 300 };
const count = (s) => String(s).replace(/\[([^\]]*)\]\([^)]*\)/g, "$1").split(/\s+/).filter(Boolean).length;
function walk(b) {
  let n = 0;
  if (b.text) n += count(b.text);
  if (b.caption) n += count(b.caption);
  for (const i of b.items ?? []) n += typeof i === "string" ? count(i) : count(i.value) + count(i.label);
  for (const c of b.cards ?? []) n += count(c.label) + count(c.value);
  return n;
}
let bad = false;
for (const [slug, max] of Object.entries(budgets)) {
  const d = JSON.parse(fs.readFileSync(`content/case-studies/${slug}.json`, "utf8"));
  const body = d.sections.reduce((a, s) => a + s.blocks.reduce((x, b) => x + walk(b), 0), 0);
  const facts = d.facts.reduce((a, f) => a + count(f.value), 0);
  console.log(`${slug}: body ${body}/${max}, hero facts ${facts}`);
  if (body > max) bad = true;
}
process.exit(bad ? 1 : 0);
