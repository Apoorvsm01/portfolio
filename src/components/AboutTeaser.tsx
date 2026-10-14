import Link from "next/link";
import { site } from "../../content/site";
import { Reveal } from "./Reveal";

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
  const recentTimeline = site.timeline.slice(-3).reverse();

  return (
    <Reveal
      as="section"
      aria-labelledby="about-teaser-heading"
      className="py-14 md:py-16 border-b border-line"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left column: h2 + the 2-line intro + 'The long way here →' link */}
        <div className="lg:col-span-5 flex flex-col">
          <h2
            id="about-teaser-heading"
            className="text-xs uppercase tracking-[0.14em] text-muted font-medium"
          >
            About
          </h2>

          <p className="mt-4 text-base sm:text-lg text-muted leading-relaxed line-clamp-2 max-w-[34rem]">
            {site.hero.intro}
          </p>

          <div className="mt-6">
            <Link
              href="/about/"
              className="link-underline min-h-[44px] inline-flex items-center gap-1.5 text-sm sm:text-base font-medium text-text hover:text-accent transition-colors group"
            >
              <span>The long way here</span>
              <span aria-hidden="true" className="arrow-nudge-right font-bold">
                →
              </span>
            </Link>
          </div>
        </div>

        {/* Right column: the 3 timeline rows as a compact ol */}
        <div className="lg:col-span-7">
          <div className="relative">
            <div
              className="absolute left-[9px] top-2 bottom-2 w-[2px] bg-line pointer-events-none"
              aria-hidden="true"
            />
            <ol className="relative pl-6 sm:pl-7 divide-y divide-line/60 list-none p-0 m-0">
              {recentTimeline.map((item) => (
                <li
                  key={`${item.years}-${item.role}`}
                  className="relative py-3.5 first:pt-0 last:pb-0 grid grid-cols-1 sm:grid-cols-12 gap-1 sm:gap-4 items-baseline"
                >
                  <span
                    className="absolute left-[5px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-accent bg-accent pointer-events-none"
                    aria-hidden="true"
                  />
                  <div className="sm:col-span-4 text-xs sm:text-sm font-mono text-muted">
                    {renderYears(item.years)}
                  </div>
                  <div className="sm:col-span-8">
                    <div className="text-sm sm:text-base font-display font-semibold text-text leading-snug">
                      {item.role}
                      {item.org && (
                        <span className="font-normal text-muted"> · {item.org}</span>
                      )}
                    </div>
                    {item.note && (
                      <p className="mt-0.5 text-xs sm:text-sm text-muted leading-relaxed line-clamp-1">
                        {item.note}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </Reveal>
  );
}
