// Run: node --test src/lib/jd.test.ts   (Node 22.18+ strips types natively)
import { test } from "node:test";
import assert from "node:assert/strict";
import { classifyInput, fetchJobDescription } from "./jd.ts";

test("classifyInput routes links, descriptions and questions", () => {
  assert.deepEqual(classifyInput("   "), { kind: "empty" });
  assert.equal(classifyInput("https://jobs.example.com/roles/123?x=1").kind, "url");
  assert.equal(classifyInput("http://example.com").kind, "url");
  assert.equal(classifyInput("https://example.com and more words").kind, "ask");
  assert.equal(classifyInput("ftp://example.com/file").kind, "ask");
  assert.equal(classifyInput("javascript:alert(1)").kind, "ask");
  assert.equal(classifyInput("What did you build for Vision Pro?").kind, "ask");
  assert.equal(classifyInput("Senior designer\nFigma, prototyping").kind, "jd");
  assert.equal(classifyInput("x".repeat(181)).kind, "jd");
  assert.equal(classifyInput("x".repeat(180)).kind, "ask");
});

test("fetchJobDescription returns null without an endpoint", async () => {
  assert.equal(await fetchJobDescription("https://example.com/job", undefined), null);
});
