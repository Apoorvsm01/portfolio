import { site } from "../../content/site";
import { Reveal } from "./Reveal";

export function Timeline() {
  return (
    <Reveal as="section" aria-label="Timeline" className="py-24 md:py-32 border-b border-line">
      <div className="mb-12">
        <h2 className="font-display text-[clamp(1.75rem,3.5vw,2.75rem)] font-bold tracking-tight text-text">
          The long way here
        </h2>
      </div>

      <div className="divide-y divide-line/60">
        {site.timeline.map((item) => (
          <div
            key={`${item.years}-${item.role}`}
            className="py-6 first:pt-0 last:pb-0 grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-8 items-baseline"
          >
            <div className="md:col-span-4 text-sm font-mono text-muted">
              {item.years}
            </div>
            <div className="md:col-span-8">
              <div className="text-base sm:text-lg font-display font-semibold text-text">
                {item.role}
                {item.org && (
                  <span className="font-normal text-muted"> · {item.org}</span>
                )}
              </div>
              {item.note && (
                <p className="mt-1.5 text-sm sm:text-base text-muted leading-relaxed">
                  {item.note}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </Reveal>
  );
}
