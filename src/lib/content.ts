import type { CaseStudy, Img } from "../../content/types";
import { site } from "../../content/site";
import imageDimsData from "../../content/image-dims.json";
import wovenData from "../../content/case-studies/woven.json";
import fleetCoPilotData from "../../content/case-studies/fleet-co-pilot.json";
import fleetDashboardData from "../../content/case-studies/fleet-dashboard.json";
import driveCoachIosData from "../../content/case-studies/drive-coach-ios.json";
import how2toData from "../../content/case-studies/how2to.json";
import omniaBrowserData from "../../content/case-studies/omniabrowser.json";
import spatialShowroomData from "../../content/case-studies/spatialshowroom.json";
import syncareAiHealthData from "../../content/case-studies/syncare-ai-health.json";
import sitelensData from "../../content/case-studies/sitelens.json";

// Case studies in canonical display order (woven first, followed by site.work order)
const studies: CaseStudy[] = [
  wovenData as CaseStudy,
  fleetCoPilotData as CaseStudy,
  fleetDashboardData as CaseStudy,
  driveCoachIosData as CaseStudy,
  how2toData as CaseStudy,
  omniaBrowserData as CaseStudy,
  spatialShowroomData as CaseStudy,
  syncareAiHealthData as CaseStudy,
  sitelensData as CaseStudy,
];

const studyMap = new Map<string, CaseStudy>(
  studies.map((study) => [study.slug, study])
);

/**
 * Returns the intrinsic width and height for an image asset from content/image-dims.json.
 */
export function imageDims(src: string): { width: number; height: number } {
  const normalized = src.startsWith("/") ? src : `/${src}`;
  const record = imageDimsData as Record<string, number[]>;
  const dims = record[normalized] ?? record[src];
  if (dims && typeof dims[0] === "number" && typeof dims[1] === "number") {
    return { width: dims[0], height: dims[1] };
  }
  return { width: 1200, height: 800 };
}

/**
 * Returns all case studies in canonical order.
 */
export function getAllStudies(): CaseStudy[] {
  return studies;
}

/**
 * Returns all case study slugs.
 */
export function getAllStudySlugs(): string[] {
  return studies.map((s) => s.slug);
}

/**
 * Returns a single case study by slug, or undefined if not found.
 */
export function getStudy(slug: string): CaseStudy | undefined {
  return studyMap.get(slug);
}

/**
 * Returns the canonical URL path for a case study.
 */
export function studyHref(slug: string): string {
  return `/work/${slug}/`;
}

/**
 * Returns the previous and next case study in canonical order for navigation.
 */
export function getStudyNeighbors(slug: string): {
  prev: CaseStudy | null;
  next: CaseStudy | null;
} {
  const index = studies.findIndex((s) => s.slug === slug);
  if (index === -1) {
    return { prev: null, next: null };
  }
  return {
    prev: index > 0 ? studies[index - 1] : null,
    next: index < studies.length - 1 ? studies[index + 1] : null,
  };
}

/**
 * Card cover for a study: the site.work override if set, else the first hero image,
 * else the first image anywhere in the study.
 */
export function coverFor(slug: string): { img: Img; fit: "cover" | "contain" } | undefined {
  const study = studyMap.get(slug);
  const ref = site.work.find((w) => w.slug === slug);
  const fit = ref?.coverFit ?? "cover";
  if (ref?.cover) return { img: { src: ref.cover, alt: study?.title ?? slug }, fit };
  if (!study) return undefined;
  const first =
    study.heroImages[0] ??
    study.sections.flatMap((s) => s.blocks).find((b) => b.type === "images")?.images[0];
  return first ? { img: first, fit } : undefined;
}
