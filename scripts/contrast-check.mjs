// WCAG 2.x contrast check for every text/background token pair, in both themes.
// Reads the real tokens from src/app/globals.css and study bands from content/study-meta.ts.
// Fails (exit 1) below 4.5:1 for text. Study-band body text (--fg on band) must reach 7:1.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const css = readFileSync(join(root, "src/app/globals.css"), "utf8");
const meta = readFileSync(join(root, "content/study-meta.ts"), "utf8");

function block(selector) {
  const i = css.indexOf(`${selector} {`);
  if (i < 0) throw new Error(`no block ${selector}`);
  const body = css.slice(i, css.indexOf("\n}", i));
  const out = {};
  for (const m of body.matchAll(/--([a-z0-9-]+):\s*([^;]+);/g)) out[m[1]] = m[2].trim();
  return out;
}
const dark = block(":root");
const light = { ...dark, ...block('[data-theme="light"]') };

function resolve(theme, name, depth = 0) {
  const v = theme[name];
  if (v === undefined) throw new Error(`missing token --${name}`);
  const m = v.match(/^var\(--([a-z0-9-]+)\)$/);
  if (m && depth < 10) return resolve(theme, m[1], depth + 1);
  return v;
}
function lum(hex) {
  const h = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4]
    .map((i) => parseInt(h.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function ratio(a, b) {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}

const results = [];
function check(label, fg, bg, min = 4.5) {
  const r = ratio(fg, bg);
  results.push({ label, fg, bg, r, min, ok: r >= min });
}

for (const [name, theme] of [
  ["dark", dark],
  ["light", light],
]) {
  const t = (n) => resolve(theme, n);
  for (const bg of ["ground", "surface", "surface-2"]) {
    for (const fg of ["fg", "fg-2", "muted"]) check(`${name}: ${fg} on ${bg}`, t(fg), t(bg));
    check(`${name}: accent on ${bg}`, t("accent"), t(bg));
    check(`${name}: focus on ${bg}`, t("focus"), t(bg));
  }
  // glow is a highlight/non-text colour; light #0F9F8A only needs the 3:1 non-text threshold (documented).
  check(`${name}: glow on ground (non-text, 3:1)`, t("glow"), t("ground"), 3);
  check(`${name}: accent-ink on accent (primary button)`, t("accent-ink"), t("accent"));
  check(`${name}: flag-amber-ink on flag-amber`, t("flag-amber-ink"), t("flag-amber"));
  check(`${name}: ground on accent (::selection)`, t("ground"), t("accent"));
  for (const f of ["blue", "lime", "pink", "teal", "violet", "yellow"]) {
    check(`${name}: flag-${f}-ink on flag-${f}`, t(`flag-${f}-ink`), t(`flag-${f}`));
  }
  for (const s of ["shipped", "built", "studied", "watched"]) {
    check(`${name}: strength-${s} pill`, t(`strength-${s}-ink`), t(`strength-${s}`));
  }
}
// Paper band is theme-independent.
check("paper: paper-ink on paper", dark["paper-ink"], dark.paper);
check("paper: paper-muted on paper", dark["paper-muted"], dark.paper);
check("paper: light accent on paper", light.accent, dark.paper);

// Study bands stay dark in both themes (.band-dark pins the dark tokens).
for (const m of meta.matchAll(/^ {2}(?:"([^"]+)"|([a-z]+)): \{\s*\n[^]*?band: "(#[0-9a-fA-F]{6})"/gm)) {
  const slug = m[1] ?? m[2];
  check(`band ${slug}: fg on band (>=7)`, dark.fg, m[3], 7);
  check(`band ${slug}: fg-2 on band`, dark["fg-2"], m[3]);
  check(`band ${slug}: muted on band`, dark.muted, m[3]);
}

let bad = 0;
for (const x of results) {
  if (!x.ok) bad++;
  console.log(`${x.ok ? "pass" : "FAIL"}  ${x.r.toFixed(2).padStart(5)}  (min ${x.min})  ${x.label}  ${x.fg} on ${x.bg}`);
}
console.log(`\n${results.length} pairs, ${bad} failing`);
process.exit(bad ? 1 : 0);
