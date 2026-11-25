import { brainCopy } from "../../../content/brain/copy.ts";
import type { SourceGroup } from "../../lib/ask/types";
import { STRENGTH_WEIGHT } from "../charts/model.ts";
import type { Strength } from "../../lib/ask/types";

const CASE_STUDY_FACTOR = 1.5;

export const groupScore = (g: SourceGroup): number =>
  g.items.reduce((n, it) => n + (it.chunk.strength ? STRENGTH_WEIGHT[it.chunk.strength as Strength] : 1), 0) * (g.slug ? CASE_STUDY_FACTOR : 1);

// The bare "Resume" bucket: evidence from the resume with no employer behind it.
const isBareResume = (g: SourceGroup) => !g.slug && !g.org && (g.key.trim().toLowerCase() === "resume" || g.label.trim().toLowerCase() === "resume");

// Cards by summed strength weight (case studies count 1.5x); of equal weight, groups with several points come before
// single-point ones. The bare resume bucket is relabelled and always comes last.
export function orderGroups(groups: SourceGroup[]): SourceGroup[] {
  const rows = groups.map((g) => ({ g: isBareResume(g) ? { ...g, label: brainCopy.results.resumeLabel } : g, resume: isBareResume(g), score: groupScore(g) }));
  rows.sort(
    (a, b) =>
      Number(a.resume) - Number(b.resume) ||
      b.score - a.score ||
      Number(a.g.items.length < 2) - Number(b.g.items.length < 2) ||
      a.g.label.localeCompare(b.g.label),
  );
  return rows.map((r) => r.g);
}
