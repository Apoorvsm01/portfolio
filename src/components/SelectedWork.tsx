import Link from "next/link";
import { site } from "../../content/site";
import { WorkCard } from "./WorkCard";
import { Reveal } from "./Reveal";

export function SelectedWork() {
  const selected = site.work.slice(0, 4);

  return (
    <Reveal
      as="section"
      id="work"
      aria-labelledby="selected-work-heading"
      className="scroll-mt-24 py-24 md:py-32 border-b border-line"
    >
      <div className="mb-10 sm:mb-12">
        <h2
          id="selected-work-heading"
          className="text-xs uppercase tracking-[0.14em] text-muted font-medium"
        >
          Selected work
        </h2>
      </div>

      <ul className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 list-none p-0">
        {selected.map((work, index) => (
          <li
            key={work.slug}
            className={
              index === 0
                ? "col-span-1 md:col-span-1 xl:col-span-2"
                : "col-span-1"
            }
          >
            <WorkCard work={work} isLead={index === 0} />
          </li>
        ))}
      </ul>

      <div className="mt-12 sm:mt-16">
        <Link
          href="/work/"
          className="group min-h-[44px] inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-surface border border-line text-text hover:border-accent hover:text-accent font-medium text-sm sm:text-base transition-colors"
        >
          <span>All projects (9)</span>
          <span aria-hidden="true" className="arrow-nudge-right font-bold">
            →
          </span>
        </Link>
      </div>
    </Reveal>
  );
}
