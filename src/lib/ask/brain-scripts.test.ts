// Run: node --test src/lib/ask/brain-scripts.test.ts   (Node 22.18+ strips types natively)
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, readFileSync, cpSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { validateDirs } from "../../../scripts/brain/validate.mjs";
import { genIndex } from "../../../scripts/brain/gen-index.mjs";

const good = {
  id: "t-usability-test",
  claim: "Ran a moderated usability test with five participants and reported task success.",
  strength: "studied",
  date: "2024-03",
  facets: { roles: ["ux-researcher"], skills: ["ux-research"], methods: ["usability-testing"] },
  source: { kind: "course", label: "HCI 445 · DePaul" },
  status: "draft",
};

function check(item: object | null) {
  const dir = mkdtempSync(join(tmpdir(), "brain-validate-"));
  try {
    writeFileSync(join(dir, "t.json"), JSON.stringify(item ? [item] : [good]));
    return validateDirs([dir]);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

test("validate: a good file passes", () => {
  const r = check(null);
  assert.deepEqual(r.errors, []);
});

test("validate: unknown facet id fails", () => {
  const r = check({ ...good, facets: { skills: ["not-a-real-skill"] } });
  assert.ok(r.errors.some((e: string) => e.includes("unknown id")));
});

test("validate: email fails", () => {
  const r = check({ ...good, detail: "Contact me at someone@example.com for the report." });
  assert.ok(r.errors.some((e: string) => e.includes("email")));
});

test("validate: grade fails", () => {
  const r = check({ ...good, detail: "Received an A- on the final project." });
  assert.ok(r.errors.some((e: string) => e.includes("grade")));
});

test("validate: over-long claim fails", () => {
  const r = check({ ...good, claim: "Designed " + "x".repeat(170) });
  assert.ok(r.errors.some((e: string) => e.includes("claim is")));
});

test("gen-index: deterministic, sorted, and independent of file creation order", () => {
  const dir = mkdtempSync(join(tmpdir(), "brain-index-"));
  try {
    for (const n of ["zeta", "alpha"]) writeFileSync(join(dir, `${n}.json`), "[]");
    genIndex(dir);
    const first = readFileSync(join(dir, "index.ts"), "utf8");
    genIndex(dir);
    assert.equal(readFileSync(join(dir, "index.ts"), "utf8"), first);
    assert.ok(first.indexOf("./alpha.json") < first.indexOf("./zeta.json"));
    assert.match(first, /GENERATED/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("gen-index: reproduces the committed index for the real evidence folder", () => {
  const real = new URL("../../../content/brain/evidence/", import.meta.url).pathname;
  const dir = mkdtempSync(join(tmpdir(), "brain-index-real-"));
  try {
    cpSync(real, dir, { recursive: true });
    genIndex(dir);
    assert.equal(readFileSync(join(dir, "index.ts"), "utf8"), readFileSync(join(real, "index.ts"), "utf8"));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
