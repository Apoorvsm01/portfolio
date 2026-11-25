// Validates evidence JSON. Usage: node scripts/brain/validate.mjs [--drafts] [--dir <path>]...
// Default: content/brain/evidence/*.json. With --drafts: brain-inbox/drafts/*.json ({items,suggestedFacets} or array).
import { join } from "node:path";
import { facets, facetGroups, strengths } from "../../content/brain/taxonomy.ts";
import { blockedWords, blockedPhrases } from "../../content/ask.ts";
import { EVIDENCE_DIR, DRAFTS_DIR, jsonFiles, readJson } from "./lib.mjs";

const KINDS = ["project", "course", "resume", "video", "repo"];
const STATUSES = ["draft", "approved"];
const MAX_CLAIM = 160;

const norm = (s) => s.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, " ").replace(/\s+/g, " ").trim();
const words = (s) => new Set(norm(s).split(" ").filter(Boolean));
const jaccard = (a, b) => {
  let i = 0;
  for (const w of a) if (b.has(w)) i++;
  const u = a.size + b.size - i;
  return u ? i / u : 0;
};
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const wordRes = blockedWords.map((w) => new RegExp(`\\b${esc(w)}s?\\b`, "i"));
const phraseRes = blockedPhrases.map((p) => new RegExp(`\\b${esc(p)}\\b`, "i"));

const PRIVACY = [
  [/[\w.+-]+@[\w-]+\.[\w.-]+/, "email address"],
  [/(?<!\d)(?:\+?\d{1,2}[\s.-]?)?(?:\(\d{3}\)|\d{3})[\s.-]\d{3}[\s.-]\d{4}(?!\d)/, "phone number"],
  [/\b\d{1,5}\s+(?:[A-Z][a-z]+\s+){1,3}(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Lane|Ln|Court|Ct|Way|Place|Pl)\b\.?/, "street address"],
  [/\b(?:grades?|graded|gpa)\b/i, "grade/GPA"],
  [/\b[ABCDF][+-](?=[\s.,;:)]|$)/, "letter grade"],
  [/\b\d{1,3}(?:\.\d+)?\s*(?:\/|out of)\s*100\b/i, "score"],
];

const isStr = (v) => typeof v === "string";

export function checkItem(it, where) {
  const errs = [];
  const e = (m) => errs.push(`${where}: ${m}`);
  if (!it || typeof it !== "object" || Array.isArray(it)) return [`${where}: not an object`];
  if (!isStr(it.id) || !/^[a-z0-9][a-z0-9-]*$/.test(it.id)) e("id must be kebab-case string");
  if (!isStr(it.claim) || !it.claim.trim()) e("claim missing");
  else if (it.claim.length > MAX_CLAIM) e(`claim is ${it.claim.length} chars (max ${MAX_CLAIM})`);
  if (it.detail !== undefined && !isStr(it.detail)) e("detail must be a string");
  if (!strengths.includes(it.strength)) e(`strength "${it.strength}" not in ${strengths.join("|")}`);
  if (!STATUSES.includes(it.status)) e(`status "${it.status}" not in ${STATUSES.join("|")}`);
  if (!isStr(it.date) || !/^\d{4}(-(0[1-9]|1[0-2]))?$/.test(it.date)) e(`date "${it.date}" must be YYYY or YYYY-MM`);
  if (!it.source || typeof it.source !== "object") e("source missing");
  else {
    if (!KINDS.includes(it.source.kind)) e(`source.kind "${it.source.kind}" not in ${KINDS.join("|")}`);
    if (!isStr(it.source.label) || !it.source.label.trim()) e("source.label missing");
    if (it.source.href !== undefined && !isStr(it.source.href)) e("source.href must be a string");
  }
  if (it.slug !== undefined && !isStr(it.slug)) e("slug must be a string");
  if (!it.facets || typeof it.facets !== "object" || Array.isArray(it.facets)) e("facets missing");
  else {
    for (const [group, ids] of Object.entries(it.facets)) {
      if (!facetGroups.includes(group)) { e(`unknown facet group "${group}"`); continue; }
      if (!Array.isArray(ids)) { e(`facets.${group} must be an array`); continue; }
      const known = new Set(facets[group].map((f) => f.id));
      for (const id of ids) if (!known.has(id)) e(`facets.${group}: unknown id "${id}"`);
    }
  }
  const text = [it.claim, it.detail, it.source?.label].filter(isStr).join(" \n ");
  for (const [re, name] of PRIVACY) if (re.test(text)) e(`privacy: contains ${name}`);
  for (const re of wordRes) if (re.test(text)) e(`privacy: blocked word "${re.source.replace(/\\b|s\?/g, "")}"`);
  for (const re of phraseRes) if (re.test(text)) e(`privacy: blocked phrase "${re.source.replace(/\\b/g, "")}"`);
  return errs;
}

export function validateDirs(dirs, { drafts = false } = {}) {
  const errors = [], warnings = [], all = [];
  let fileCount = 0;
  for (const dir of dirs) {
    for (const f of jsonFiles(dir)) {
      fileCount++;
      let data;
      try { data = readJson(join(dir, f)); } catch (err) { errors.push(`${f}: invalid JSON (${err.message})`); continue; }
      const items = Array.isArray(data) ? data : drafts && data && Array.isArray(data.items) ? data.items : null;
      if (!items) { errors.push(`${f}: expected an array${drafts ? " or {items:[...]}" : ""}`); continue; }
      items.forEach((it, i) => {
        errors.push(...checkItem(it, `${f}[${i}]${it?.id ? ` (${it.id})` : ""}`));
        all.push({ f, it });
      });
    }
  }
  const byId = new Map();
  for (const { f, it } of all) {
    if (!it?.id) continue;
    if (byId.has(it.id)) errors.push(`${f}: duplicate id "${it.id}" (also in ${byId.get(it.id)})`);
    else byId.set(it.id, f);
  }
  const claims = all.filter(({ it }) => isStr(it?.claim)).map(({ f, it }) => ({ f, id: it.id, n: norm(it.claim), w: words(it.claim) }));
  for (let i = 0; i < claims.length; i++)
    for (let j = i + 1; j < claims.length; j++) {
      const a = claims[i], b = claims[j];
      if (a.n === b.n || jaccard(a.w, b.w) >= 0.8) warnings.push(`near-duplicate claims: "${a.id}" (${a.f}) and "${b.id}" (${b.f})`);
    }
  return { errors, warnings, items: all.length, files: fileCount };
}

if (import.meta.main) {
  const args = process.argv.slice(2);
  const drafts = args.includes("--drafts");
  const dirs = [];
  for (let i = 0; i < args.length; i++) if (args[i] === "--dir") dirs.push(args[++i]);
  if (!dirs.length) dirs.push(drafts ? DRAFTS_DIR : EVIDENCE_DIR);
  const { errors, warnings, items, files } = validateDirs(dirs, { drafts });
  for (const w of warnings) console.warn(`warning: ${w}`);
  for (const e of errors) console.error(`error: ${e}`);
  console.log(`${files} file(s), ${items} item(s), ${errors.length} error(s), ${warnings.length} warning(s)`);
  process.exit(errors.length ? 1 : 0);
}
