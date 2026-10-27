import Link from "next/link";
import { site } from "../../content/site";
import { HeroPortrait } from "./HeroPortrait";

function renderYears(years: string) {
  const parts = years.split(/[–—-]/).map((p) => p.trim());
  if (parts.length === 2) {
    const [start, end] = parts;
    const startNum = start.match(/\d{4}/)?.[0];
    const endNum = end.match(/\d{4}/)?.[0];
    return (
      <>
        {startNum ? <time dateTime={startNum}>{start}</time> : start}
        {" – "}
        {endNum ? <time dateTime={endNum}>{end}</time> : <span>{end}</span>}
      </>
    );
  }
  const yearMatch = years.match(/\d{4}/)?.[0];
  if (yearMatch) {
    return <time dateTime={yearMatch}>{years}</time>;
  }
  return years;
}

export function AboutTeaser() {
  const recentTimeline = site.timeline.slice(0, 3);

  return (
    <section
      aria-labelledby="about-teaser-heading"
      className="w-full bg-ground border-b border-rule py-16 md:py-24"
    >
      <div className="container-page">
        {/* Section Heading & Intro */}
        <div className="grid gap-8 md:grid-cols-12 md:items-end mb-10 sm:mb-14">
          <div className="md:col-span-8 max-w-[44rem]">
            <h2
              id="about-teaser-heading"
              className="font-display font-black text-h2 text-fg leading-tight mb-3"
            >
              The long way here
            </h2>
            <p
              className="font-sans font-medium text-muted leading-snug"
              style={{ fontSize: "clamp(1.375rem, 1.1rem + 1vw, 1.75rem)" }}
            >
              {site.timelineIntro}
            </p>
          </div>
          <div className="md:col-span-4 md:max-w-[16rem] md:justify-self-end w-full">
            <HeroPortrait
              src={site.hero.image.src}
              alt={site.hero.image.alt}
              width={site.hero.image.width}
              height={site.hero.image.height}
            />
          </div>
        </div>

        {/* 3 newest timeline rows formatted per v4 Timeline style */}
        <ol className="border-t border-rule divide-y divide-rule list-none p-0 m-0">
          {recentTimeline.map((item) => {
            const flagBg =
              site.flags[item.flag as keyof typeof site.flags]?.bg ?? "#f5a524";

            return (
              <li
                key={`${item.years}-${item.role}`}
                className="py-6 sm:py-8 grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-8 items-start"
              >
                {/* 1. years (muted, small, left) */}
                <div className="md:col-span-3 font-sans text-xs sm:text-sm text-muted">
                  {renderYears(item.years)}
                </div>

                {/* 2. role (Mona Sans 900, ~1.75rem) with note below in serif, muted */}
                <div className="md:col-span-6">
                  <h3 className="font-display font-black text-xl sm:text-2xl text-fg leading-tight">
                    {item.role}
                  </h3>
                  {item.note && (
                    <p className="mt-2 font-serif text-sm sm:text-base text-muted leading-relaxed">
                      {item.note}
                    </p>
                  )}
                </div>

                {/* 3. org chips on the right: 10px square in the org's flag plus the org name, muted */}
                <div className="md:col-span-3 md:text-right flex items-center md:justify-end gap-2 text-xs sm:text-sm text-muted font-sans">
                  {item.org && (
                    <>
                      <span
                        className="w-2.5 h-2.5 rounded-[1px] shrink-0"
                        style={{ backgroundColor: flagBg }}
                        aria-hidden="true"
                      />
                      <span>{item.org}</span>
                    </>
                  )}
                </div>
              </li>
            );
          })}
        </ol>

        {/* Link to /about/ */}
        <div className="mt-10 sm:mt-12">
          <Link
            href="/about/"
            className="group link-wipe min-h-[44px] inline-flex items-center gap-1.5 font-sans font-medium text-sm sm:text-base text-fg hover:text-accent transition-colors"
          >
            <span>The long way here</span>
            <span
              aria-hidden="true"
              className="arrow-slide-right font-bold text-accent"
            >
              →
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
