import Link from "next/link";
import { site } from "../../content/site";
import { imageDims } from "../lib/content";
import { FadeImage } from "./FadeImage";

/** The Good Roommate, as a half-width card that opens /personal. */
export function PersonalWork() {
  const { personalLabel, lead } = site.personal;
  const flag = site.flags.pink?.bg ?? "#ee5c96";

  return (
    <article
      id="personal"
      style={{ borderTopColor: flag }}
      className="group relative flex flex-col h-full rounded-[6px] bg-surface border border-rule border-t-[3px] p-6 sm:p-8 card-lift"
    >
      <figure className="flex items-end justify-center gap-4 sm:gap-6 mb-6 aspect-[16/10] w-full overflow-hidden rounded-[6px] bg-ground/50 border border-rule/40 px-4 pt-4">
        {lead.shots.map((shot) => {
          const { width, height } = imageDims(shot.src);
          return (
            <FadeImage
              key={shot.src}
              src={shot.src}
              alt={shot.alt}
              width={width}
              height={height}
              loading="lazy"
              className="block h-auto w-auto max-w-[46%] max-h-full object-contain object-bottom"
            />
          );
        })}
      </figure>

      <div className="flex flex-col flex-1 relative z-10">
        <span className="font-sans text-xs text-muted font-medium mb-1.5">{personalLabel}</span>
        <h3 className="font-display font-black text-xl sm:text-2xl text-fg group-hover:text-accent transition-colors leading-snug">
          <Link
            href="/personal/"
            className="after:absolute after:inset-0 after:content-[''] focus:outline-none"
          >
            {lead.title}
          </Link>
        </h3>
        <p className="mt-2.5 font-serif text-sm sm:text-base text-muted leading-relaxed">{lead.claim}</p>
        <span className="mt-auto pt-4 inline-flex items-center gap-1.5 font-sans font-medium text-sm text-fg group-hover:text-accent transition-colors">
          {lead.cta}
          <span aria-hidden="true" className="font-bold text-accent">→</span>
        </span>
      </div>
    </article>
  );
}
