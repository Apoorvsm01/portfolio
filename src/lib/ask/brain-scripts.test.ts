// Run: node --test src/lib/ask/brain-scripts.test.ts   (Node 22.18+ strips types natively)
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, readFileSync, cpSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { validateDirs } from "../../../scripts/brain/validate.mjs";
import { genIndex } from "../../../scripts/brain/gen-index.mjs";
import { classifyFile } from "../../../scripts/brain/lib.mjs";

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

test("classifyFile: include, exclude and tier rules", () => {

  const c = (p: string, n = 5000, o = false) => classifyFile(p, n, { ownFolder: o });
  assert.equal(c("Root/HCI 999/Apoorv Mahajan Final Report.txt"), "own");
  assert.equal(c("Root/HCI 999/Team Persona Deliverable.txt"), "deliverable");
  assert.equal(c("Root/HCI 999/Week 3 Notes.txt"), null); // no tier match
  assert.equal(c("Root/HCI 999/Lecture 4 slides.txt"), null);
  assert.equal(c("Root/HCI 999/Books and reading/Apoorv report.txt"), null);
  assert.equal(c("Root/HCI 999/Report Template.txt"), null);
  assert.equal(c("Root/HCI 999/previous_examples/Final report.txt"), null);
  assert.equal(c("Root/HCI 999/Project proposal copy.txt"), null);
  assert.equal(c("Root/HCI 999/Project proposal with Jo comments.txt"), null);
  assert.equal(c("Root/HCI 999/Apoorv final report.txt", 150001), null);
  assert.equal(c("Root/Omnia/Meeting notes.txt", 5000, true), "own");
  assert.equal(c("Root/Omnia/Sample notes.txt", 5000, true), null);
});

// ---- review-gen / review-apply ----------------------------------------------------------------
import { parseReview as parseReviewRaw } from "../../../scripts/brain/review-apply.mjs";

type Parsed = { unit: string; id: string; ticked: boolean; strength: string; claim: string; malformed?: boolean };
const parseReview = (md: string) => parseReviewRaw(md) as Parsed[];
import { flagsFor } from "../../../scripts/brain/review-gen.mjs";

const reviewMd = [
  "# Brain review",
  "",
  "Tick `[x]` to approve an item.",
  "",
  "## Course label (depaul-hci-450)",
  "- [x] `alpha-one` **built** · Built a clickable prototype for the checkout flow.",
  "  2024-03 · roles: ux-designer",
  "- [ ] `alpha-two` **studied** · Read three papers on onboarding.",
  "  2024-04",
  "",
  "## Other label (depaul-hci-445)",
  "- [x] `beta-one` **shipped** · Edited claim text stays exactly as typed here.",
  "  2023",
  "",
].join("\n");

test("parseReview: tick state, unit and item ids", () => {
  const items = parseReview(reviewMd);
  assert.deepEqual(
    items.map((i) => [i.id, i.ticked, i.unit]),
    [
      ["alpha-one", true, "depaul-hci-450"],
      ["alpha-two", false, "depaul-hci-450"],
      ["beta-one", true, "depaul-hci-445"],
    ],
  );
});

test("parseReview: edited claim and strength change are read back", () => {
  const items = parseReview(reviewMd);
  const beta = items.find((i) => i.id === "beta-one")!;
  assert.equal(beta.claim, "Edited claim text stays exactly as typed here.");
  assert.equal(beta.strength, "shipped");
  const alpha = items.find((i) => i.id === "alpha-one")!;
  assert.equal(alpha.strength, "built");
});

test("parseReview: an item line that does not match the format is reported, not dropped", () => {
  const items = parseReview("## Label (depaul-hci-450)\n- [x] `gamma` strength missing · claim\n");
  assert.equal(items.length, 1);
  assert.ok(items[0].malformed);
});

const item = (id: string, claim: string, extra: object = {}) => ({
  id,
  claim,
  strength: "built",
  date: "2024",
  facets: {},
  source: { kind: "course", label: "HCI" },
  status: "draft",
  ...extra,
});

test("flagsFor: resume metric is flagged only when a digit appears in the claim", () => {
  const r = item("r-1", "Cut page load time by 40% on the dashboard.", { source: { kind: "resume", label: "Resume" } });
  assert.ok(flagsFor(r, [r], []).includes("metric from a resume — confirm it is still accurate"));
  const plain = item("r-2", "Cut page load time on the dashboard.", { source: { kind: "resume", label: "Resume" } });
  assert.equal(flagsFor(plain, [plain], []).length, 0);
  const unitRule = item("r-3", "Led 3 designers on a redesign.");
  assert.ok(flagsFor(unitRule, [unitRule], [], "apoorv-resume-2024").includes("metric from a resume — confirm it is still accurate"));
});

test("flagsFor: blocked word matches whole words only, case-insensitively", () => {
  const hit = item("b-1", "Presented findings to the Salary committee.");
  assert.ok(flagsFor(hit, [hit], ["salary"]).includes("blocked word: salary"));
  const miss = item("b-2", "Redesigned the salaryless onboarding wizard.");
  assert.deepEqual(flagsFor(miss, [miss], ["salary"]), []);
  const inDetail = { ...item("b-3", "Ran a usability study."), detail: "Discussed the PASSWORD reset flow." };
  assert.ok(flagsFor(inDetail, [inDetail], ["password"]).includes("blocked word: password"));
});

test("flagsFor: near-duplicate claim flags the later item only", () => {
  const first = item("d-first", "Ran a moderated usability test with five participants.");
  const second = item("d-second", "Ran a moderated usability test with five participants today.");
  const all = [first, second];
  assert.deepEqual(flagsFor(first, all, []), []);
  assert.ok(flagsFor(second, all, []).includes("possible duplicate of d-first"));
  const unrelated = item("d-third", "Designed a food delivery app for couriers.");
  assert.deepEqual(flagsFor(unrelated, [first, unrelated], []), []);
});

test("validate: near-duplicate claims are errors in evidence and warnings in drafts", () => {
  const dir = mkdtempSync(join(tmpdir(), "brain-dup-"));
  try {
    const a = { ...good, id: "dup-a", claim: "Delivered 25 UX projects across fintech and health clients at Crazy Minds." };
    const b = { ...good, id: "dup-b", claim: "Delivered 25 UX projects across fintech and health clients for Crazy Minds." };
    writeFileSync(join(dir, "t.json"), JSON.stringify([a, b]));
    const real = validateDirs([dir]);
    assert.ok(real.errors.some((e: string) => e.includes("near-duplicate")));
    const draft = validateDirs([dir], { drafts: true });
    assert.ok(!draft.errors.some((e: string) => e.includes("near-duplicate")));
    assert.ok(draft.warnings.some((w: string) => w.includes("near-duplicate")));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("validate: org must be a non-empty string when present", () => {
  assert.deepEqual(check({ ...good, org: "Omnia" }).errors, []);
  assert.ok(check({ ...good, org: "" }).errors.some((e: string) => e.includes("org")));
});

test("withOrg: resume label and org come from the employer named in the claim", async () => {
  const { withOrg, detectEmployer } = await import("../../../scripts/brain/lib.mjs");
  const r = withOrg({ ...good, source: { kind: "resume", label: "Resume" }, claim: "Led design at Omnia." }, "depaul-resume");
  assert.equal(r.org, "Omnia");
  assert.equal(r.source.label, "Resume · Omnia");
  assert.equal(withOrg({ ...good, source: { kind: "resume", label: "Resume" }, claim: "Knows Figma." }, "depaul-resume").source.label, "Resume");
  assert.equal(withOrg({ ...good }, "depaul-hci-445").org, "DePaul");
  assert.equal(withOrg({ ...good, source: { kind: "project", label: "x" } }, "depaul-patched-reality").org, "Patched Reality");
  assert.equal(detectEmployer("Shipped at Woven by Toyota"), "Woven by Toyota");
});
