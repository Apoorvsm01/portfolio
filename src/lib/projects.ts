import type { ProjectCard } from "../components/shelves/types";
import { getAllStudies, coverFor, studyHref, imageDims } from "./content";
import { studyMeta } from "../../content/study-meta";
import { site } from "../../content/site";

// Card data for every project, as the carousel and shelves show them: each case study plus The Good
// Roommate, whose story lives on /personal rather than in a case study.
export function getProjectCards(): ProjectCard[] {
  const projects: ProjectCard[] = getAllStudies().map((study) => {
    const meta = studyMeta[study.slug];
    const ref = site.work.find((w) => w.slug === study.slug) as { org?: string; domain?: string } | undefined;
    const cover = coverFor(study.slug);
    const dims = cover ? imageDims(cover.img.src) : undefined;
    return {
      slug: study.slug,
      href: studyHref(study.slug),
      title: study.title,
      claim: meta?.claim ?? study.description,
      org:
        ref?.org ??
        (study.slug === site.featured.slug ? site.featured.org : ref?.domain === "Personal" ? site.personal.personalLabel : undefined),
      domain: ref?.domain ?? site.featuredDomain,
      flag: meta?.flag ?? "amber",
      cover: cover && dims ? { src: cover.img.src, alt: study.title, width: dims.width, height: dims.height, fit: cover.fit } : undefined,
    };
  });

  const roommate = site.personal.lead;
  const shot = roommate.shots[0];
  const shotDims = imageDims(shot.src);
  projects.push({
    slug: "good-roommate",
    href: "/personal/",
    title: roommate.title,
    claim: roommate.claim,
    org: site.personal.personalLabel,
    domain: "Personal",
    flag: "pink",
    cover: { src: shot.src, alt: shot.alt, width: shotDims.width, height: shotDims.height, fit: "contain" },
  });
  return projects;
}
