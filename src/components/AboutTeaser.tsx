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
      className="py-16 md:py-24 border-b border-line"
    >
      <div className="mb-8">
        <h2
          id="about-teaser-heading"
          className="text-xs uppercase tracking-[0.14em] text-muted font-medium"
        >
          About
        </h2>
      </div>

      {/* 2 lines from site.hero.intro */}
      <p className="max-w-[42rem] text-lg sm:text-xl text-muted leading-relaxed line-clamp-2 mb-12">
        {site.hero.intro}
      </p>

      {/* The 3 most recent timeline rows */}
      <div className="relative max-w-[56rem] mb-10">
        <div
          className="absolute left-[11px] sm:left-[15px] top-3 bottom-3 w-[2px] bg-line pointer-events-none"
          aria-hidden="true"
        />
        <ol className="relative pl-7 sm:pl-9 divide-y divide-line/60 list-none p-0 m-0">
          {recentTimeline.map((item) => (
            <li
              key={`${item.years}-${item.role}`}
              className="relative py-6 first:pt-0 last:pb-0 grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-8 items-baseline"
            >
              <span
                className="absolute left-[7px] sm:left-[11px] top-2 sm:top-1.5 w-2.5 h-2.5 rounded-full border-2 border-accent bg-accent pointer-events-none"
                aria-hidden="true"
              />
              <div className="md:col-span-4 text-sm font-mono text-muted">
                {renderYears(item.years)}
              </div>
              <div className="md:col-span-8">
                <div className="text-base sm:text-lg font-display font-semibold text-text">
                  {item.role}
                  {item.org && (
                    <span className="font-normal text-muted"> · {item.org}</span>
                  )}
                </div>
                {item.note && (
                  <p className="mt-1 text-sm sm:text-base text-muted leading-relaxed max-w-[42rem]">
                    {item.note}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* Link to /about/ */}
      <div>
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
    </Reveal>
  );
}
