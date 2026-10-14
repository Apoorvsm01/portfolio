import Link from "next/link";
import { CardSpotlight } from "./CardSpotlight";
import { FadeImage } from "./FadeImage";
import type { NavIndexItem } from "../lib/nav-index";
import { getNavIndex } from "../lib/nav-index";
import { Reveal } from "./Reveal";

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
  const blurb = navItem?.blurb ?? ("blurb" in work ? work.blurb : "");
  const org = navItem?.org ?? ("org" in work ? work.org : undefined);
  const tags = navItem?.tags ?? [];
  const cover = navItem?.cover;
  const href = `/work/${work.slug}/`;

  return (
    <CardSpotlight
      className={`work-card group relative flex flex-col h-full rounded-[20px] bg-surface border border-line ${
        compact ? "p-4 sm:p-5" : "p-5 sm:p-6"
      } focus-within:outline focus-within:outline-2 focus-within:outline-accent focus-within:outline-offset-2 ${
        isLead ? "xl:grid xl:grid-cols-12 xl:gap-8 xl:items-center" : ""
      }`}
    >
      <span
        aria-hidden="true"
        className={`work-card-arrow absolute ${
          compact ? "top-4 right-4 sm:top-5 sm:right-5" : "top-5 right-5 sm:top-6 sm:right-6"
        } text-accent text-lg font-bold z-10`}
      >
        ↗
      </span>

      {cover && cover.src && (
        <figure
          className={`${
            compact ? "aspect-[4/3] mb-3.5" : "aspect-[16/10] mb-5"
          } w-full overflow-hidden rounded-[16px] bg-bg/50 border border-line/40 ${
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
              cover.fit === "contain" ? "object-contain" : "object-cover"
            }`}
          />
        </figure>
      )}

      <div className={`flex flex-col flex-1 relative z-10 ${isLead ? "xl:col-span-5" : ""}`}>
        {org && (
          <span className="text-xs uppercase tracking-[0.14em] text-muted font-medium mb-1.5">
            {org}
          </span>
        )}
        <h3 className={`font-display ${compact ? "text-base sm:text-lg" : "text-h3"} font-bold text-text group-hover:text-accent transition-colors leading-snug`}>
          <Link
            href={href}
            className="after:absolute after:inset-0 after:content-[''] focus:outline-none"
          >
            {title}
          </Link>
        </h3>
        <p className={`mt-2 text-sm text-muted leading-relaxed ${compact ? "line-clamp-2" : "flex-1 max-w-[42rem]"}`}>
          {blurb}
        </p>
        {!compact && tags.length > 0 && (
          <ul
            className="mt-5 pt-4 border-t border-line/40 flex flex-wrap gap-2 list-none p-0"
            aria-label="Tags"
          >
            {tags.map((tag) => (
              <li
                key={tag}
                className="text-xs px-2.5 py-1 rounded-md bg-bg text-muted border border-line/50"
              >
                {tag}
              </li>
            ))}
          </ul>
        )}
      </div>
    </CardSpotlight>
  );
}

export function WorkSection() {
  const items = getNavIndex();
  return (
    <Reveal
      as="section"
      id="work"
      aria-labelledby="work-heading"
      className="scroll-mt-24 py-24 md:py-32 border-b border-line"
    >
      <div className="mb-10 sm:mb-12">
        <h2
          id="work-heading"
          className="text-xs uppercase tracking-[0.14em] text-muted font-medium"
        >
          Work
        </h2>
      </div>
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 list-none p-0">
        {items.map((work, index) => (
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
    </Reveal>
  );
}
