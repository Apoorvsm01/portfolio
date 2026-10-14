/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { site, type WorkRef } from "../../content/site";
import { coverFor, getStudy, studyHref } from "../lib/content";
import { Reveal } from "./Reveal";

export function WorkCard({ work }: { work: WorkRef }) {
  const study = getStudy(work.slug);
  const coverInfo = coverFor(work.slug);
  const cover = coverInfo?.img;
  const tags = study?.tags?.slice(0, 3) ?? [];
  const title = study?.title ?? work.slug;

  return (
    <Link
      href={studyHref(work.slug)}
      className="group flex flex-col rounded-[20px] bg-surface border border-line p-5 sm:p-6 hover:border-muted/60 transition-colors"
    >
      {cover && (
        <div className="aspect-[16/10] w-full overflow-hidden rounded-[16px] bg-bg/50 border border-line/40 mb-5">
          <img
            src={cover.src}
            alt=""
            width={800}
            height={500}
            loading="lazy"
            className={`w-full h-full ${coverInfo?.fit === "contain" ? "object-contain" : "object-cover"} group-hover:scale-[1.02] transition-transform duration-500`}
          />
        </div>
      )}
      <div className="flex flex-col flex-1">
        {work.org && (
          <span className="text-xs uppercase tracking-[0.14em] text-muted font-medium mb-2">
            {work.org}
          </span>
        )}
        <h3 className="font-display text-xl sm:text-2xl font-bold text-text group-hover:text-accent transition-colors">
          {title}
        </h3>
        <p className="mt-2.5 text-sm sm:text-base text-muted leading-relaxed flex-1">
          {work.blurb}
        </p>
        {tags.length > 0 && (
          <div className="mt-5 pt-4 border-t border-line/40 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="text-xs px-2.5 py-1 rounded-md bg-bg text-muted border border-line/50"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}

export function WorkSection() {
  return (
    <Reveal as="section" id="work" aria-label="Work" className="scroll-mt-24 py-24 md:py-32 border-b border-line">
      <div className="mb-10 sm:mb-12">
        <h2 className="text-xs uppercase tracking-[0.14em] text-muted font-medium">
          Work
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        {site.work.map((work) => (
          <WorkCard key={work.slug} work={work} />
        ))}
      </div>
    </Reveal>
  );
}
