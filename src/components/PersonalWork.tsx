import Link from "next/link";
import { site } from "../../content/site";
import { imageDims } from "../lib/content";
import { FadeImage } from "./FadeImage";
import { WorkCard } from "./WorkCard";

export function PersonalWork() {
  const { kicker, headline, intro, personalLabel, lead, others } = site.personal;

  return (
    <section
      id="personal"
      aria-labelledby="personal-heading"
      className="w-full bg-ground border-b border-rule py-16 md:py-24"
    >
      <div className="container-page">
        {/* Section Header: small caps kicker, h2 headline, intro paragraph */}
        <div className="max-w-[42rem] mb-10 sm:mb-12">
          <p className="font-sans text-xs uppercase tracking-[0.14em] text-muted font-medium mb-3">
            {kicker}
          </p>
          <h2
            id="personal-heading"
            className="font-display font-black text-h2 text-fg leading-tight mb-4"
          >
            {headline}
          </h2>
          <p className="font-serif text-base sm:text-lg text-fg-2 leading-relaxed text-pretty">
            {intro}
          </p>
        </div>

        {/* LEAD card: the Good Roommate, straight to the /personal page */}
        <article
          style={{ borderTopColor: "#ee5c96" }}
          className="rounded-[6px] bg-surface border border-rule border-t-[3px] p-5 sm:p-7 md:p-9 card-lift mb-8 sm:mb-12"
        >
          <Link
            href="/personal/"
            aria-label={`${lead.title}: ${lead.cta}`}
            className="flex items-end justify-center gap-4 sm:gap-8 flex-wrap"
          >
            {lead.shots.map((shot) => {
              const { width, height } = imageDims(shot.src);
              return (
                <FadeImage
                  key={shot.src}
                  src={shot.src}
                  alt={shot.alt}
                  width={width}
                  height={height}
                  loading="lazy"
                  className="block h-auto w-auto max-w-[44%] max-h-[26rem] sm:max-h-[30rem] object-contain"
                />
              );
            })}
          </Link>

          <div className="mt-8 pt-8 border-t border-rule/60 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-start">
            <div className="lg:col-span-7 flex flex-col">
              <span className="font-sans text-xs text-muted font-medium mb-1.5">
                {personalLabel}
              </span>
              <h3 className="font-display font-black text-2xl sm:text-3xl text-fg leading-tight">
                <Link href="/personal/" className="hover:text-accent transition-colors">
                  {lead.title}
                </Link>
              </h3>
              <p className="mt-3 font-serif text-base sm:text-lg text-muted leading-relaxed max-w-[38rem]">
                {lead.claim}
              </p>
            </div>

            <div className="lg:col-span-5 flex flex-col justify-between">
              <ul className="space-y-2.5 list-none p-0 m-0" aria-label="Key highlights">
                {lead.points.map((pt, idx) => (
                  <li
                    key={idx}
                    className="flex items-baseline gap-2.5 font-serif text-sm sm:text-base text-fg-2 leading-relaxed"
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full shrink-0 self-center"
                      style={{ backgroundColor: "#ee5c96" }}
                      aria-hidden="true"
                    />
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                <Link
                  href="/personal/"
                  className="group link-wipe min-h-[44px] inline-flex items-center gap-1.5 font-sans font-medium text-sm sm:text-base text-fg hover:text-accent transition-colors"
                >
                  <span>{lead.cta}</span>
                  <span aria-hidden="true" className="arrow-slide-right font-bold text-accent">
                    →
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </article>

        {/* Below the lead: others slugs as regular compact WorkCard(s) with optional external link */}
        {others.length > 0 && (
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 list-none p-0 m-0">
            {others.map((slug, idx) => {
              const workRef = site.work.find((w) => w.slug === slug);
              if (!workRef) return null;

              return (
                <li
                  key={slug}
                  style={{ "--i": idx + 1 } as React.CSSProperties}
                  className="col-span-1 grid-item-enter flex flex-col"
                >
                  <WorkCard work={workRef} compact={true} />
                  {workRef.link && (
                    <div className="mt-3 flex items-center">
                      <a
                        href={workRef.link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group link-wipe min-h-[44px] inline-flex items-center gap-1.5 font-sans font-medium text-xs sm:text-sm text-fg-2 hover:text-fg transition-colors"
                      >
                        <span>{workRef.link.label}</span>
                        <span
                          aria-hidden="true"
                          className="arrow-slide-diag font-bold text-accent"
                        >
                          ↗
                        </span>
                        <span className="sr-only">(opens in a new tab)</span>
                      </a>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
