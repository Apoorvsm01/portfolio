import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { site } from "../../../../content/site";
import { getAllStudies, getStudy } from "../../../lib/content";
import {
  Hero,
  Facts,
  PrototypeEmbed,
  HeroImages,
  Toc,
  SectionBlock,
  StudyNav,
} from "../../../components/case-study";

export function generateStaticParams() {
  return getAllStudies().map((study) => ({
    slug: study.slug,
  }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const study = getStudy(slug);

  if (!study) {
    return {};
  }

  return {
    title: study.title,
    description: study.description || site.hero.intro,
    openGraph: {
      title: `${study.title} — ${site.name}`,
      description: study.description || site.hero.intro,
    },
  };
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const study = getStudy(slug);

  if (!study) {
    notFound();
  }

  return (
    <main id="main" className="max-w-[72rem] w-full mx-auto px-4 sm:px-6 lg:px-8 flex-1">
      <Hero study={study} />
      <Facts facts={study.facts} />
      <PrototypeEmbed prototype={study.prototype} title={study.title} />
      <HeroImages images={study.heroImages} title={study.title} />
      <Toc sections={study.sections} />
      {study.sections.map((section, index) => (
        <SectionBlock
          key={index}
          section={section}
          index={index}
          studyTitle={study.title}
        />
      ))}
      <StudyNav currentSlug={study.slug} />
    </main>
  );
}
