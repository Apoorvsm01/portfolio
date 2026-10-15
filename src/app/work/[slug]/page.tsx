import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { site } from "../../../../content/site";
import { getAllStudies, getStudy, coverFor } from "../../../lib/content";
import { studyMeta } from "../../../../content/study-meta";
import {
  Hero,
  ChapterBar,
  PrototypeEmbed,
  HeroImages,
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
  const meta = studyMeta[slug];

  if (!study) {
    return {};
  }

  const desc = meta?.claim || study.description || site.hero.intro;
  const url = `${site.url}/work/${slug}/`;

  return {
    title: study.title,
    description: desc,
    alternates: {
      canonical: `/work/${slug}/`,
    },
    openGraph: {
      title: `${study.title} — ${site.name}`,
      description: desc,
      url,
      siteName: site.name,
      locale: "en_US",
      type: "article",
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

  const meta = studyMeta[slug] ?? {
    claim: study.description,
    band: "#12110f",
    flag: "amber" as const,
    facts: study.facts.map((f) => ({ label: f.label, value: f.value })),
  };

  const flagBg = site.flags[meta.flag]?.bg ?? "#f5a524";
  const firstImage = study.heroImages?.[0] ?? coverFor(study.slug)?.img;
  const remainingHeroImages = study.heroImages?.slice(1) ?? [];

  const labelledSections = study.sections
    .map((section, index) => ({ section, index }))
    .filter(({ section }) => Boolean(section.label && section.label.trim() !== ""));

  return (
    <main id="main" className="flex-1 w-full bg-ground">
      <div className="reading-progress-bar" aria-hidden="true" />
      <article>
        {/* Full-bleed hero on studyMeta[slug].band */}
        <Hero
          study={study}
          meta={meta}
          firstImage={firstImage}
          labelledSections={labelledSections}
        />

        {/* Compact sticky chapter bar replacing the sticky TOC rail */}
        <ChapterBar
          sections={study.sections}
          flagColor={flagBg}
        />

        {/* Article content in readable single column on ink */}
        <div className="container-page py-12 md:py-16">
          <div className="w-full">
            <PrototypeEmbed
              prototype={study.prototype}
              title={study.title}
              flag={meta.flag}
            />
            {remainingHeroImages.length > 0 && (
              <HeroImages images={remainingHeroImages} title={study.title} />
            )}
            {study.sections.map((section, index) => (
              <SectionBlock
                key={index}
                section={section}
                index={index}
                studyTitle={study.title}
                flag={meta.flag}
              />
            ))}
          </div>

          {/* End with Next project card + CTA */}
          <StudyNav currentSlug={study.slug} />
        </div>
      </article>
    </main>
  );
}
