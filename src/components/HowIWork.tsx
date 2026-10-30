"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { site } from "../../content/site";
import { studyMeta } from "../../content/study-meta";
import { FadeImage } from "./FadeImage";
import { EASE_OUT_EXPO, NO_MOTION, SPRING_SNAP } from "./motion/global-ease";

export function HowIWork() {
  const photoSrc = "/work/woven/01.jpg";
  const reduce = useReducedMotion();
  const figureRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: figureRef, offset: ["start end", "end start"] });
  const shift = useTransform(scrollYProgress, [0, 1], ["-5%", "5%"]);
  const caption = studyMeta.woven?.claim ?? "A driving coach that talks, so new drivers don’t have to look.";

  return (
    <section
      aria-labelledby="how-i-work-heading"
      className="w-full bg-paper text-paper-ink band-paper border-b border-paper-rule py-16 md:py-24"
    >
      <div className="container-page">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* Left Side: h2 + howIWorkIntro + ol of 4 steps */}
          <div className="lg:col-span-7 flex flex-col justify-start">
            <h2
              id="how-i-work-heading"
              className="font-display font-black text-h2 text-paper-ink leading-[1.08] mb-4"
            >
              How I work
            </h2>

            <p
              className="font-sans font-medium text-paper-ink leading-snug text-balance mb-8"
              style={{ fontSize: "clamp(1.375rem, 1.1rem + 1vw, 1.75rem)" }}
            >
              {site.howIWorkIntro}
            </p>

            {/* 4 Steps separated by paper-rule hairlines */}
            <ol className="border-t border-paper-rule divide-y divide-paper-rule list-none p-0 m-0">
              {site.howIWork.map((item, index) => (
                <motion.li
                  key={item.title}
                  data-gm=""
                  className="py-6 first:pt-6 last:pb-0 flex items-start gap-4 sm:gap-5"
                  initial={reduce ? false : { opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "0px 0px -12% 0px" }}
                  transition={reduce ? NO_MOTION : { duration: 0.6, ease: EASE_OUT_EXPO, delay: index * 0.08 }}
                >
                  {/* 28px filled circle in accent with number in ink */}
                  <motion.span
                    data-gm=""
                    className="w-7 h-7 rounded-full bg-accent flex items-center justify-center shrink-0 mt-0.5"
                    aria-hidden="true"
                    initial={reduce ? false : { scale: 0.4 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true, margin: "0px 0px -12% 0px" }}
                    transition={reduce ? NO_MOTION : { ...SPRING_SNAP, delay: index * 0.08 + 0.1 }}
                  >
                    <span className="text-ground font-sans font-bold text-xs">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </motion.span>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-sans font-bold text-lg sm:text-xl text-paper-ink leading-snug">
                      {item.title}
                    </h3>
                    <p className="mt-1.5 font-serif text-paper-ink text-base leading-relaxed">
                      {item.body}
                    </p>
                  </div>
                </motion.li>
              ))}
            </ol>
          </div>

          {/* Right Side: photo with caption */}
          <div className="lg:col-span-5 self-start">
            <figure ref={figureRef} className="w-full">
              <div className="rounded-[6px] overflow-hidden border border-paper-rule bg-paper/80 aspect-[4/3]">
                <motion.div className="w-full h-full" style={reduce ? undefined : { y: shift, scale: 1.12 }}>
                  <FadeImage
                    src={photoSrc}
                    alt={caption}
                    width={1200}
                    height={800}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              </div>
              <figcaption className="mt-3 font-sans text-xs sm:text-sm text-paper-muted leading-relaxed">
                {caption}
              </figcaption>
            </figure>
          </div>
        </div>
      </div>
    </section>
  );
}
