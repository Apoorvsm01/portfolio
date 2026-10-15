import Link from "next/link";
import { site } from "../../content/site";
import { studyMeta } from "../../content/study-meta";
import { FadeImage } from "./FadeImage";
import type { NavIndexItem } from "../lib/nav-index";
import { getNavIndex } from "../lib/nav-index";

export interface WorkCardProps {
  work: NavIndexItem | { slug: string; org?: string; blurb?: string };
  isLead?: boolean;
  compact?: boolean;
}

export function WorkCard({
  work,
  isLead = false,
  compact = false,
}: WorkCardProps) {
  const navItem =
    "title" in work && "cover" in work
      ? (work as NavIndexItem)
      : getNavIndex().find((s) => s.slug === work.slug);

  const title = navItem?.title ?? work.slug;
  const meta = studyMeta[work.slug];
  // v4: the study's claim is the blurb
  const blurb = meta?.claim ?? navItem?.blurb ?? ("blurb" in work ? work.blurb : "");
  const org = navItem?.org ?? ("org" in work ? work.org : undefined);
  const cover = navItem?.cover;
  const href = `/work/${work.slug}/`;

  const flagName = meta?.flag ?? "amber";
  const flagBg = site.flags[flagName]?.bg ?? "#f5a524";

  return (
    <article
      style={{ borderTopColor: flagBg }}
      className={`group relative flex flex-col h-full rounded-[6px] bg-surface border border-rule border-t-[3px] card-lift ${
        compact ? "p-5 sm:p-6" : "p-6 sm:p-8"
      } ${
        isLead ? "xl:grid xl:grid-cols-12 xl:gap-8 xl:items-center" : ""
      }`}
    >
      {cover && cover.src && (
        <figure
          className={`${
            compact ? "aspect-[4/3] mb-4" : "aspect-[16/10] mb-6"
          } w-full overflow-hidden rounded-[6px] bg-ground/50 border border-rule/40 ${
            isLead ? "xl:col-span-7 xl:mb-0" : ""
          }`}
        >
          <FadeImage
            src={cover.src}
            alt=""
            width={cover.width}
            height={cover.height}
            loading="lazy"
            className={`w-full h-full ${
              cover.fit === "contain" ? "object-contain p-2" : "object-cover"
            } group-hover:brightness-105 transition-[filter] duration-140`}
          />
        </figure>
      )}

      <div
        className={`flex flex-col flex-1 relative z-10 ${
          isLead ? "xl:col-span-5" : ""
        }`}
      >
        {org && (
          <span className="font-sans text-xs text-muted font-medium mb-1.5">
            {org}
          </span>
        )}
        <h3 className="font-display font-black text-xl sm:text-2xl text-fg group-hover:text-accent transition-colors leading-snug">
          <Link
            href={href}
            className="after:absolute after:inset-0 after:content-[''] focus:outline-none"
          >
            {title}
          </Link>
        </h3>
        <p className="mt-2.5 font-serif text-sm sm:text-base text-muted leading-relaxed line-clamp-2">
          {blurb}
        </p>
      </div>
    </article>
  );
}

export function WorkSection() {
  const items = getNavIndex();
  return (
    <section
      id="work"
      aria-labelledby="work-heading"
      className="scroll-mt-24 py-16 sm:py-24 border-b border-rule"
    >
      <div className="mb-10 sm:mb-12">
        <h2
          id="work-heading"
          className="font-display font-black text-h2 text-fg leading-tight"
        >
          Work
        </h2>
      </div>
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 list-none p-0">
        {items.map((work, index) => (
          <li
            key={work.slug}
            style={{ "--i": index } as React.CSSProperties}
            className={`grid-item-enter ${
              index === 0
                ? "col-span-1 md:col-span-1 xl:col-span-2"
                : "col-span-1"
            }`}
          >
            <WorkCard work={work} isLead={index === 0} />
          </li>
        ))}
      </ul>
    </section>
  );
}
