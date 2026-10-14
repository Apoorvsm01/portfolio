import { site } from "../../content/site";
import { Reveal } from "./Reveal";

export function HowIWork() {
  return (
    <Reveal as="section" aria-label="How I work" className="py-24 md:py-32 border-b border-line">
      <div className="mb-12">
        <h2 className="font-display text-[clamp(1.75rem,3.5vw,2.75rem)] font-bold tracking-tight text-text">
          How I work
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        {site.howIWork.map((item, index) => (
          <div
            key={item.title}
            className="p-6 sm:p-8 rounded-[20px] bg-surface border border-line flex flex-col justify-between"
          >
            <div>
              <span className="font-mono text-xs uppercase tracking-[0.14em] text-accent font-semibold">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="font-display text-xl sm:text-2xl font-bold text-text mt-3">
                {item.title}
              </h3>
              <p className="mt-3 text-sm sm:text-base text-muted leading-relaxed">
                {item.body}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Reveal>
  );
}
