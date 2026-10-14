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
      className="scroll-mt-24 py-14 md:py-16 border-b border-line"
    >
      <div className="flex items-center justify-between gap-4 mb-6 sm:mb-8">
        <h2
          id="selected-work-heading"
          className="text-xs uppercase tracking-[0.14em] text-muted font-medium"
        >
          Selected work
        </h2>
        <Link
          href="/work/"
          className="hidden md:inline-flex link-underline min-h-[44px] items-center gap-1.5 text-sm sm:text-base font-medium text-text hover:text-accent transition-colors group"
        >
          <span>All projects (9)</span>
          <span aria-hidden="true" className="arrow-nudge-right font-bold">
            →
          </span>
        </Link>
      </div>

      <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 lg:gap-6 list-none p-0">
        {selected.map((work) => (
          <li key={work.slug} className="col-span-1">
            <WorkCard work={work} isLead={false} compact={true} />
          </li>
        ))}
      </ul>

      <div className="mt-8 md:hidden">
        <Link
          href="/work/"
          className="group min-h-[44px] inline-flex items-center gap-2 px-6 py-3 rounded-full bg-surface border border-line text-text hover:border-accent hover:text-accent font-medium text-sm transition-colors"
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
