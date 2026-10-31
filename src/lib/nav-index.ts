import { site } from "../../content/site";
import { getAllStudies, coverFor, imageDims } from "./content";

export interface NavSection {
  id: string;
  index: number;
  label: string;
}

export interface NavCover {
  src: string;
  alt: string;
  width: number;
  height: number;
  fit: "cover" | "contain";
}

export interface NavIndexItem {
  slug: string;
  title: string;
  domain: string;
  org?: string;
  tags: string[];
  blurb: string;
  cover: NavCover;
  sections: NavSection[];
}

export const navIndex: NavIndexItem[] = getAllStudies().map((study) => {
  const domain =
    study.slug === site.featured.slug
      ? site.featuredDomain
      : site.work.find((w) => w.slug === study.slug)?.domain ?? "";
  const org =
    study.slug === site.featured.slug
      ? site.featured.org
      : site.work.find((w) => w.slug === study.slug)?.org;
  const blurb =
    site.work.find((w) => w.slug === study.slug)?.blurb ??
    (study.slug === site.featured.slug
      ? site.featured.summary
      : study.description);

  const coverInfo = coverFor(study.slug);
  const coverImg = coverInfo?.img;
  const dims = coverImg ? imageDims(coverImg.src) : { width: 1200, height: 800 };

  const sections: NavSection[] = study.sections
    .map((sec, sIdx) => ({
      id: `section-${sIdx}`,
      index: sIdx,
      label: sec.label?.trim() ?? "",
    }))
    .filter((sec) => sec.label !== "");

  return {
    slug: study.slug,
    title: study.title,
    domain,
    org,
    tags: study.tags?.slice(0, 3) ?? [],
    blurb,
    cover: {
      src: coverImg?.src ?? "",
      alt: coverImg?.alt ?? study.title,
      width: dims.width,
      height: dims.height,
      fit: coverInfo?.fit ?? "cover",
    },
    sections,
  };
});

export function getNavIndex(): NavIndexItem[] {
  return navIndex;
}
