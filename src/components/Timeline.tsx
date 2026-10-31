"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useSpring } from "motion/react";
import { SPRING_SNAP, NO_MOTION } from "./motion/global-ease";
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
  const listRef = useRef<HTMLOListElement>(null);
  const reduce = useReducedMotion();
  // The accent rule fills as the list scrolls through the viewport.
  const { scrollYProgress } = useScroll({ target: listRef, offset: ["start 75%", "end 55%"] });
  const fill = useSpring(scrollYProgress, { stiffness: 140, damping: 26, mass: 0.6 });

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

        <ol ref={listRef} className="relative border-t border-rule divide-y divide-rule list-none m-0 p-0 pl-6 sm:pl-8">
          {/* Left rule: a hairline track with an accent fill that scrubs with scroll (decorative). */}
          <span aria-hidden="true" className="absolute left-0 top-0 bottom-0 w-px bg-rule" />
          <motion.span
            aria-hidden="true"
            data-gm=""
            className="absolute left-0 top-0 bottom-0 w-px bg-accent origin-top"
            style={{ scaleY: reduce ? 1 : fill }}
          />
          {site.timeline.map((item) => {
            const flagBg =
              site.flags[item.flag as keyof typeof site.flags]?.bg ?? "#f5a524";

            return (
              <li
                key={`${item.years}-${item.role}`}
                className="relative py-6 sm:py-8 grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-8 items-start"
              >
                {/* Marker on the rule: pops in when scrolled to */}
                <motion.span
                  aria-hidden="true"
                  data-gm=""
                  className="absolute -left-6 sm:-left-8 top-[2.15rem] sm:top-[2.65rem] w-2.5 h-2.5 -ml-[5px] rounded-full bg-accent ring-4 ring-[var(--ground)]"
                  initial={reduce ? false : { scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true, margin: "0px 0px -35% 0px" }}
                  transition={reduce ? NO_MOTION : SPRING_SNAP}
                />

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
