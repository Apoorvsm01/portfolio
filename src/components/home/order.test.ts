// Run: node --test src/components/home/order.test.ts   (Node 22.18+ strips types natively)
import { test } from "node:test";
import assert from "node:assert/strict";
import { orderGroups } from "./order.ts";
import type { SourceGroup } from "../../lib/ask/types";

const item = (strength: string) => ({ chunk: { strength }, score: 0, matched: {} }) as unknown as SourceGroup["items"][number];
const group = (key: string, strengths: string[], extra: Partial<SourceGroup> = {}): SourceGroup => ({ key, label: key, items: strengths.map(item), ...extra });

test("orders by summed weight, case studies 1.5x, resume bucket last and relabelled", () => {
  const out = orderGroups([
    group("Resume", ["shipped", "shipped", "shipped"]),
    group("Acme", ["built", "built"], { org: "Acme" }), // 6
    group("study", ["built", "built"], { slug: "study" }), // 9
    group("solo", ["shipped"], { org: "Solo" }), // 4
  ]);
  assert.deepEqual(out.map((g) => g.key), ["study", "Acme", "solo", "Resume"]);
  assert.equal(out[3].label, "More from my resume");
});

test("equal weight: several points before a single point", () => {
  const out = orderGroups([group("one", ["shipped"], { org: "A" }), group("two", ["studied", "studied"], { org: "B" })]);
  assert.deepEqual(out.map((g) => g.key), ["two", "one"]);
});
