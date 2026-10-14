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

  const desc = study.description || site.hero.intro;
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

  const labelledSections = study.sections
    .map((section, index) => ({ section, index }))
    .filter(({ section }) => Boolean(section.label && section.label.trim() !== ""));
  const showToc = labelledSections.length >= 3;

  return (
    <main id="main" className="container-page flex-1">
      <div className="reading-progress-bar" aria-hidden="true" />
      <article>
        <Hero study={study} />
        <Facts facts={study.facts} />

        {/* Below lg: horizontal scrollable chip row under facts */}
        {showToc && (
          <div className="lg:hidden">
            <Toc sections={study.sections} variant="chip-row" />
          </div>
        )}

        {/* lg+: 12-column grid with sticky TOC rail in cols 1-3 and content in cols 4-12 */}
        <div className={showToc ? "lg:grid lg:grid-cols-12 lg:gap-12" : ""}>
          {showToc && (
            <aside className="hidden lg:block lg:col-span-3">
              <div className="sticky top-[calc(var(--nav-h)+2rem)] py-12">
                <Toc sections={study.sections} variant="rail" />
              </div>
            </aside>
          )}
          <div className={showToc ? "lg:col-span-9" : "w-full"}>
            <PrototypeEmbed prototype={study.prototype} title={study.title} />
            <HeroImages images={study.heroImages} title={study.title} />
            {study.sections.map((section, index) => (
              <SectionBlock
                key={index}
                section={section}
                index={index}
                studyTitle={study.title}
              />
            ))}
          </div>
        </div>

        <StudyNav currentSlug={study.slug} />
      </article>
    </main>
  );
}
