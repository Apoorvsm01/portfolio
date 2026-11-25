import type { Chunk } from "../../lib/ask/types";

// The claim is the main line; anything after it is optional detail.
export function splitClaim(chunk: Chunk): { claim: string; detail: string } {
  if (chunk.kind === "evidence") {
    const detail = chunk.text.startsWith(chunk.title) ? chunk.text.slice(chunk.title.length).trim() : "";
    return { claim: chunk.title, detail };
  }
  if (chunk.claim) {
    const detail = chunk.text.startsWith(chunk.claim) ? chunk.text.slice(chunk.claim.length).trim() : "";
    return { claim: chunk.claim, detail };
  }
  const m = chunk.text.match(/^(.{20,220}?[.!?])(\s|$)/);
  if (m) return { claim: m[1], detail: chunk.text.slice(m[0].length).trim() };
  return { claim: chunk.text.length > 220 ? `${chunk.text.slice(0, 217).trimEnd()}…` : chunk.text, detail: "" };
}

export const yearOf = (chunk: Chunk) => chunk.date?.slice(0, 4);
