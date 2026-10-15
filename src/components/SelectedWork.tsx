import Link from "next/link";
import { site } from "../../content/site";
import { WorkCard } from "./WorkCard";

export function SelectedWork() {
  const selected = site.work.slice(0, 4);

  return (
    <section
      id="work"
      aria-labelledby="selected-work-heading"
      className="w-full bg-ground border-b border-rule py-16 md:py-24"
    >
      <div className="container-page">
        {/* Section Header */}
        <div className="flex items-center justify-between gap-4 mb-8 sm:mb-12">
          <h2
            id="selected-work-heading"
            className="font-display font-black text-h2 text-fg leading-tight"
          >
            Selected work
          </h2>
          <Link
            href="/work/"
            className="group link-wipe min-h-[44px] inline-flex items-center gap-1.5 font-sans font-medium text-sm sm:text-base text-fg hover:text-accent transition-colors"
          >
            <span>All projects ({site.work.length + 1})</span>
            <span
              aria-hidden="true"
              className="arrow-slide-right font-bold text-accent"
            >
              →
            </span>
          </Link>
        </div>

        {/* 2x2 Grid of Cards */}
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 list-none p-0">
          {selected.map((work, index) => (
            <li
              key={work.slug}
              style={{ "--i": index } as React.CSSProperties}
              className="col-span-1 grid-item-enter"
            >
              <WorkCard work={work} compact={true} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
