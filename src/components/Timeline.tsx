import { site } from "../../content/site";

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
    <section
      aria-labelledby="timeline-heading"
      className="w-full bg-ground border-b border-rule py-16 md:py-24"
    >
      <div className="container-page">
        <div className="max-w-[44rem] mb-10 sm:mb-14">
          <h2
            id="timeline-heading"
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

        <ol className="border-t border-rule divide-y divide-rule list-none p-0 m-0">
          {site.timeline.map((item) => {
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

                {/* 3. org chips on the right: a 10px square in the org's flag plus the org name, muted */}
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
      </div>
    </section>
  );
}
