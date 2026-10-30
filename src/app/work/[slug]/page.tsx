import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { site } from "../../../../content/site";
import { getAllStudies, getStudy, coverFor, getStudyNeighbors, studyHref } from "../../../lib/content";
import { studyMeta } from "../../../../content/study-meta";
import { decisions } from "../../../../content/decisions";
import { projectRows } from "../../../../content/home";
import { JsonLd, caseStudyGraph } from "../../../lib/structured-data";
import { Fig, LoopVideo, NoteSection } from "../../../components/case-study";
import { OpenOnHash } from "../../../components/case-study/OpenOnHash";
import { Img } from "../../../components/Img";
import { CopyEmail } from "../../../components/CopyEmail";

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

  const claim = meta?.claim || study.description || site.hero.intro;
  // The claim alone is short; naming the work and the author helps searches like "Woven UX case study".
  const desc = `${claim} A UX case study by ${site.name}, ${site.role}.`;
  const url = `${site.url}/work/${slug}/`;
  const cover = coverFor(slug)?.img;
  const images = cover ? [{ url: `${site.url}${cover.src}`, alt: cover.alt || study.title }] : undefined;

  return {
    title: `${study.title}: UX case study`,
    description: desc,
    keywords: study.tags,
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
      authors: [site.name],
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: `${study.title} — ${site.name}`,
      description: desc,
      images: images?.map((i) => i.url),
    },
  };
}

export default async function CaseStudyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const study = getStudy(slug);
  if (!study) notFound();

  const meta = studyMeta[slug];
  const row = projectRows.find((r) => r.slug === slug);
  const stage = row?.stage;
  const claim = meta?.claim ?? study.description;
  const fact = (label: string) => meta?.facts.find((f) => f.label === label)?.value;
  const metaRows = [
    { label: "Company", value: row?.company },
    { label: "Role", value: row?.role },
    { label: "Years", value: row?.years },
    { label: "Status", value: fact("Status") },
    { label: "Built on", value: fact("Built on") },
  ].filter((r): r is { label: string; value: string } => Boolean(r.value));

  const overview = meta?.tldr ? [meta.tldr.problem, meta.tldr.decision, meta.tldr.outcome].join(" ") : study.description;
  const picks = decisions[slug] ?? [];
  const extraHero = study.heroImages.slice(1).filter((img) => img.src !== stage?.src);
  const next = getStudyNeighbors(slug).next;
  const cover = coverFor(slug)?.img;

  return (
    <main id="main" className="flex-1 w-full">
      <JsonLd data={caseStudyGraph(study, claim, cover?.src)} />
      <OpenOnHash />
      <article>
        <header className="cs-head">
          <h1 className="display rise">{study.title}</h1>
          <p className="lead-p rise" style={{ "--i": 1 } as React.CSSProperties}>
            {claim}
          </p>
        </header>

        {stage && (
          <div className={`cs-hero rise${stage.fit === "contain" ? " cs-hero--contain" : ""}`} style={{ "--i": 2, ...(stage.bg ? { background: stage.bg } : {}) } as React.CSSProperties}>
            {stage.video ? (
              <LoopVideo src={stage.video} poster={stage.src} label={stage.alt} fill eager />
            ) : (
              <Img src={stage.src} alt={stage.alt} loading="eager" style={{ objectPosition: stage.position }} />
            )}
          </div>
        )}

        <dl className="cs-meta" data-reveal-group>
          {metaRows.map((r) => (
            <div key={r.label} data-reveal>
              <dt className="small">{r.label}</dt>
              <dd>{r.value}</dd>
            </div>
          ))}
        </dl>

        <section className="sec sec--split" aria-labelledby="overview" data-reveal-group style={{ paddingBottom: 0 }}>
          <h2 id="overview" className="lead" data-reveal>
            Overview
          </h2>
          <div className="stack">
            <p className="lead-p" style={{ maxWidth: "36ch" }} data-reveal>
              {overview}
            </p>
            {meta?.outcomes && (
              <div data-reveal>
                <div className="cs-figures">
                  {meta.outcomes.items.map((o, i) => (
                    <div key={i}>
                      <strong>{o.from ? `${o.from} → ${o.value}` : o.value}</strong>
                      <p>{o.label}</p>
                    </div>
                  ))}
                </div>
                {meta.outcomes.note && <p className="cs-note small">{meta.outcomes.note}</p>}
              </div>
            )}
          </div>
        </section>

        {meta?.tldr && (
          <section className="sec sec--split" aria-labelledby="role" data-reveal-group style={{ paddingBottom: 0 }}>
            <h2 id="role" className="lead" data-reveal>
              My role
            </h2>
            <div className="stack">
              <p data-reveal>{meta.tldr.role}</p>
              {fact("With") && <p className="muted" data-reveal>Worked with {fact("With")}.</p>}
            </div>
          </section>
        )}

        {study.prototype && (
          <section className="sec sec--split" aria-labelledby="proto" data-reveal-group style={{ paddingBottom: 0 }}>
            <h2 id="proto" className="lead" data-reveal>
              Try the prototype
            </h2>
            <div className="prototype" data-reveal>
              <div className="prototype__frame" style={{ aspectRatio: study.prototype.aspect?.trim() || "16 / 10" }}>
                <iframe src={study.prototype.embed} title={`${study.title} interactive prototype`} loading="lazy" allow="autoplay; fullscreen" />
              </div>
              <div>
                <a className="btn" href={study.prototype.link ?? study.prototype.embed} target="_blank" rel="noopener noreferrer">
                  Open the prototype <span className="arrow" aria-hidden="true">↗</span>
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </div>
            </div>
          </section>
        )}

        {picks.map((d, i) => (
          <section key={d.heading} className="decision" aria-labelledby={`decision-${i}`} data-reveal-group>
            <div className="decision__text">
              <h2 id={`decision-${i}`} className="head" data-reveal>
                {d.heading}
              </h2>
              <p data-reveal>{d.body}</p>
            </div>
            <div data-reveal>
              <Fig src={d.image.src} alt={d.image.alt} caption={d.caption} contain={d.fit === "contain"} />
            </div>
          </section>
        ))}

        <details className="notes" id="notes">
          <summary>
            <span>Full notes</span>
            <span className="plus" aria-hidden="true">
              +
            </span>
          </summary>
          <div className="notes__body">
            <p className="lead-p">How might we {study.hmw}</p>
            {extraHero.length > 0 && (
              <div className="imgs">
                {extraHero.map((img) => (
                  <Fig key={img.src} src={img.src} alt={img.alt?.trim() || `${study.title} screenshot`} />
                ))}
              </div>
            )}
            {study.sections.map((section, i) => (
              <NoteSection key={i} section={section} index={i} studyTitle={study.title} />
            ))}
          </div>
        </details>

        <section className="talk" aria-labelledby="talk-title" data-reveal-group>
          <div className="stack">
            <h2 id="talk-title" className="head" data-reveal>
              Let’s talk
            </h2>
            <p data-reveal>{site.cta.body}</p>
          </div>
          <div className="talk__actions" data-reveal>
            <a className="btn" href={`mailto:${site.email}`}>
              Email me <span className="arrow" aria-hidden="true">→</span>
            </a>
            <CopyEmail />
          </div>
        </section>

        {next && (
          <section className="next" aria-labelledby="next-title">
            <h2 id="next-title" className="lead">
              Next: <Link className="link" href={studyHref(next.slug)}>{next.title}</Link>
            </h2>
            <p className="muted">{studyMeta[next.slug]?.claim}</p>
          </section>
        )}
      </article>
    </main>
  );
}
