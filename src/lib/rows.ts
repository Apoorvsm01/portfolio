import { projectRows, type ProjectRow } from "../../content/home";
import { site } from "../../content/site";
import { studyMeta } from "../../content/study-meta";
import type { IndexRow } from "../components/WorkIndex";

// The project index shown on the home page and on /work/: one row per project with its one-line claim.
export function getIndexRows(): IndexRow[] {
  return projectRows.map((p: ProjectRow) => ({
    ...p,
    claim: studyMeta[p.slug]?.claim ?? (p.slug === "good-roommate" ? site.personal.lead.claim : ""),
  }));
}
