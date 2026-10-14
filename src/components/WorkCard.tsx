"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
import { site, type WorkRef } from "../../content/site";
import { coverFor, getStudy, imageDims, studyHref } from "../lib/content";
import { Reveal } from "./Reveal";
import { FadeImage } from "./FadeImage";

export function WorkCard({
  work,
  isLead = false,
}: {
  work: WorkRef;
  isLead?: boolean;
}) {
  const study = getStudy(work.slug);
  const coverInfo = coverFor(work.slug);
  const cover = coverInfo?.img;
  const tags = study?.tags?.slice(0, 3) ?? [];
  const title = study?.title ?? work.slug;
  const dims = cover ? imageDims(cover.src) : undefined;
  const cardRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    let rafId: number | null = null;

    const handlePointerMove = (e: PointerEvent) => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

      const rect = el.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      if (rafId !== null) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        el.style.setProperty("--mx", `${mx.toFixed(1)}px`);
        el.style.setProperty("--my", `${my.toFixed(1)}px`);
      });
    };

    el.addEventListener("pointermove", handlePointerMove, { passive: true });

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      el.removeEventListener("pointermove", handlePointerMove);
    };
  }, []);

  return (
    <article
      ref={cardRef}
      className={`work-card group relative flex flex-col h-full rounded-[20px] bg-surface border border-line p-5 sm:p-6 focus-within:outline focus-within:outline-2 focus-within:outline-accent focus-within:outline-offset-2 ${
        isLead ? "xl:grid xl:grid-cols-12 xl:gap-8 xl:items-center" : ""
      }`}
    >
      <div className="work-card-spotlight" aria-hidden="true" />
      <span
        aria-hidden="true"
        className="work-card-arrow absolute top-5 right-5 sm:top-6 sm:right-6 text-accent text-lg font-bold z-10"
      >
        ↗
      </span>

      {cover && dims && (
        <figure
          className={`aspect-[16/10] w-full overflow-hidden rounded-[16px] bg-bg/50 border border-line/40 mb-5 ${
            isLead ? "xl:col-span-7 xl:mb-0" : ""
          }`}
        >
          <FadeImage
            src={cover.src}
            alt=""
            width={dims.width}
            height={dims.height}
            loading="lazy"
            className={`w-full h-full ${
              coverInfo?.fit === "contain" ? "object-contain" : "object-cover"
            }`}
          />
        </figure>
      )}
      <div className={`flex flex-col flex-1 relative z-10 ${isLead ? "xl:col-span-5" : ""}`}>
        {work.org && (
          <span className="text-xs uppercase tracking-[0.14em] text-muted font-medium mb-2">
            {work.org}
          </span>
        )}
        <h3 className="font-display text-h3 font-bold text-text group-hover:text-accent transition-colors">
          <Link
            href={studyHref(work.slug)}
            className="after:absolute after:inset-0 after:content-[''] focus:outline-none"
          >
            {title}
          </Link>
        </h3>
        <p className="mt-2.5 text-sm sm:text-base text-muted leading-relaxed flex-1 max-w-[42rem]">
          {work.blurb}
        </p>
        {tags.length > 0 && (
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
    </article>
  );
}

export function WorkSection() {
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
        {site.work.map((work, index) => (
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
