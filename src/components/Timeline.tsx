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

export function Timeline() {
  return (
    <Reveal as="section" aria-labelledby="timeline-heading" className="py-24 md:py-32 border-b border-line">
      <div className="mb-12">
        <h2 id="timeline-heading" className="font-display text-h2 font-bold tracking-tight text-text">
          The long way here
        </h2>
      </div>

      <ol className="divide-y divide-line/60 list-none p-0">
        {site.timeline.map((item) => (
          <li
            key={`${item.years}-${item.role}`}
            className="py-6 first:pt-0 last:pb-0 grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-8 items-baseline"
          >
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
                <p className="mt-1.5 text-sm sm:text-base text-muted leading-relaxed max-w-[42rem]">
                  {item.note}
                </p>
              )}
            </div>
          </li>
        ))}
      </ol>
    </Reveal>
  );
}
