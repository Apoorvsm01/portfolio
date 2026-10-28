import { AskLanding } from "../components/ask/AskLanding";
import type { ProjectCard } from "../components/shelves/types";
import { HowIWork } from "../components/HowIWork";
import { AboutTeaser } from "../components/AboutTeaser";
import { HeadsetWall } from "../components/HeadsetWall";
import { getAllStudies, coverFor, studyHref, imageDims } from "../lib/content";
import { studyMeta } from "../../content/study-meta";
import { site } from "../../content/site";
import { JsonLd, profilePageGraph } from "../lib/structured-data";

export default function Home() {
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

  // The Good Roommate has no case study; its story lives on /personal.
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

  return (
    <main id="main" className="flex-1 w-full">
      <JsonLd data={profilePageGraph()} />
      <AskLanding projects={projects} />
      <HowIWork />
      <HeadsetWall />
      <AboutTeaser />
    </main>
  );
}
