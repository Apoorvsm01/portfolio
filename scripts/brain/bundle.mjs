// Groups brain-inbox/text into per-folder "units", dedupes, and writes brain-inbox/bundles/*.txt + index.json.
// Usage: node scripts/brain/bundle.mjs   (reads and writes only under brain-inbox/)
import { readdirSync, readFileSync, statSync, writeFileSync, mkdirSync, rmSync, existsSync } from "node:fs";
import { join, relative, basename, dirname, extname } from "node:path";
import { homedir } from "node:os";

const ROOT = new URL("../../", import.meta.url).pathname;
const TEXT = join(ROOT, "brain-inbox/text");
const OUT = join(ROOT, "brain-inbox/bundles");
const CLOUD = join(homedir(), "Library/CloudStorage");
const MIN_CHARS = 200;
const MAX_PART = 60000;
const SHINGLE = 5;
const DUP_RATIO = 0.8;

const rootShort = (name) => name.replace(/^OneDrive-/, "").replace(/UniversityInternational|International/g, "").replace(/University$/, "").toLowerCase().replace(/[^a-z0-9]+/g, "") || "root";
const kebab = (s) => s.toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

const walk = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(join(dir, e.name)) : e.name.endsWith(".txt") ? [join(dir, e.name)] : [],
  );

// Newest-first ordering: prefer the original document's mtime, else the text file's.
const dirCache = new Map();
function sourceMtime(textPath) {
  const rel = relative(TEXT, textPath);
  const dir = join(CLOUD, dirname(rel));
  const stem = basename(rel, ".txt");
  try {
    if (!dirCache.has(dir)) dirCache.set(dir, existsSync(dir) ? readdirSync(dir) : []);
    const hit = dirCache.get(dir).find((n) => n.slice(0, n.length - extname(n).length) === stem && n !== basename(rel));
    if (hit) return statSync(join(dir, hit)).mtime;
  } catch {}
  return statSync(textPath).mtime;
}

function clean(raw) {
  const pages = raw.replace(/\r/g, "").split("\f").filter((p) => p.trim());
  let counts = new Map();
  if (pages.length >= 3) {
    for (const p of pages) for (const l of new Set(p.split("\n").map((x) => x.trim().replace(/\s+/g, " ")).filter(Boolean))) counts.set(l, (counts.get(l) ?? 0) + 1);
  }
  const repeated = new Set([...counts].filter(([, n]) => n > pages.length / 2).map(([l]) => l));
  const kept = pages.map((p) => p.split("\n").filter((l) => !repeated.has(l.trim().replace(/\s+/g, " "))).join("\n"));
  return kept.join("\n").replace(/\s+/g, " ").trim();
}

const shingles = (text) => {
  const w = text.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, " ").split(/\s+/).filter(Boolean);
  const set = new Set();
  if (w.length < SHINGLE) set.add(w.join(" "));
  for (let i = 0; i + SHINGLE <= w.length; i++) set.add(w.slice(i, i + SHINGLE).join(" "));
  return set;
};
const contained = (a, b) => {
  if (!a.size) return true;
  let n = 0;
  for (const s of a) if (b.has(s)) n++;
  return n / a.size;
};

// Collect units.
const units = new Map(); // key -> {name, slug, files: []}
for (const rootName of existsSync(TEXT) ? readdirSync(TEXT) : []) {
  const rootDir = join(TEXT, rootName);
  if (!statSync(rootDir).isDirectory()) continue;
  const short = rootShort(rootName);
  for (const e of readdirSync(rootDir, { withFileTypes: true })) {
    const full = join(rootDir, e.name);
    const isDir = e.isDirectory();
    if (!isDir && !e.name.endsWith(".txt")) continue;
    const name = isDir ? `${rootName}/${e.name}` : `${rootName}/(root files)`;
    const slug = isDir ? `${short}-${kebab(e.name)}` : `${short}-misc`;
    if (!units.has(slug)) units.set(slug, { name, slug, files: [] });
    for (const f of isDir ? walk(full) : [full]) units.get(slug).files.push(f);
  }
}

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
const index = [];

for (const u of [...units.values()].sort((a, b) => a.slug.localeCompare(b.slug))) {
  const cands = [];
  for (const f of u.files) {
    const text = clean(readFileSync(f, "utf8"));
    if (text.length < MIN_CHARS) continue;
    cands.push({ rel: relative(TEXT, f), text, mtime: sourceMtime(f) });
  }
  cands.sort((a, b) => b.mtime - a.mtime || a.rel.localeCompare(b.rel));
  const kept = [];
  let dropped = 0;
  for (const c of cands) {
    c.sh = shingles(c.text);
    if (kept.some((k) => contained(c.sh, k.sh) >= DUP_RATIO)) { dropped++; continue; }
    kept.push(c);
  }
  if (!kept.length) continue;

  // Pack files into parts of at most MAX_PART chars; oversize files are cut into pieces.
  const pieces = [];
  for (const k of kept) {
    const date = k.mtime.toISOString().slice(0, 7);
    for (let i = 0, n = 1; i < k.text.length; i += MAX_PART - 2000, n++) {
      const body = k.text.slice(i, i + MAX_PART - 2000);
      pieces.push({ rel: k.rel, date, body, label: k.text.length > MAX_PART - 2000 ? `${k.rel} (piece ${n})` : k.rel });
    }
  }
  const parts = [];
  for (const p of pieces) {
    const cur = parts[parts.length - 1];
    if (cur && cur.chars + p.body.length <= MAX_PART - 2000) { cur.items.push(p); cur.chars += p.body.length; }
    else parts.push({ items: [p], chars: p.body.length });
  }
  let total = 0;
  parts.forEach((part, i) => {
    const file = `${u.slug}${i ? `.part${i + 1}` : ""}.txt`;
    const head = [
      `UNIT: ${u.name}`,
      `SLUG: ${u.slug}${i ? `.part${i + 1}` : ""}`,
      `PART: ${i + 1} of ${parts.length}`,
      `FILES (${part.items.length}):`,
      ...part.items.map((p) => `- ${p.label} [${p.date}]`),
      "",
    ].join("\n");
    const body = part.items.map((p) => `=== FILE: ${p.label} [${p.date}] ===\n${p.body}`).join("\n\n");
    const out = `${head}\n${body}\n`;
    total += out.length;
    writeFileSync(join(OUT, file), out);
  });
  index.push({ unit: u.name, slug: u.slug, parts: parts.length, files: kept.length, chars: total, droppedDuplicates: dropped });
}

writeFileSync(join(OUT, "index.json"), JSON.stringify(index, null, 2) + "\n");
const pad = (s, n) => String(s).padEnd(n);
console.log(`${pad("slug", 48)}${pad("parts", 6)}${pad("files", 6)}${pad("chars", 9)}dupes`);
for (const r of index) console.log(`${pad(r.slug, 48)}${pad(r.parts, 6)}${pad(r.files, 6)}${pad(r.chars, 9)}${r.droppedDuplicates}`);
console.log(`\n${index.length} units, ${index.reduce((a, r) => a + r.parts, 0)} bundle files, ${index.reduce((a, r) => a + r.droppedDuplicates, 0)} duplicates dropped`);
