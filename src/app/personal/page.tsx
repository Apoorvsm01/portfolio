import type { Metadata } from "next";
import Link from "next/link";
import { site } from "../../../content/site";
import { personal, type Shot } from "../../../content/personal";
import { getStudy, imageDims, studyHref } from "../../lib/content";
import { studyMeta } from "../../../content/study-meta";
import { FadeImage } from "../../components/FadeImage";
import { Reveal } from "../../components/Reveal";
import { FoldHero } from "../../components/fold/FoldHero";
import { FoldSpread } from "../../components/fold/FoldSpread";
import { FlipCompare } from "../../components/fold/FlipCompare";

export const metadata: Metadata = {
  title: "Personal projects",
  description: personal.intro,
  alternates: { canonical: "/personal/" },
  openGraph: {
    title: `Personal projects — ${site.name}`,
    description: personal.intro,
    url: `${site.url}/personal/`,
  },
};

function Img({ shot, className = "" }: { shot: Shot; className?: string }) {
  const { width, height } = imageDims(shot.src);
  return (
    <FadeImage
      src={shot.src}
      alt={shot.alt}
      width={width}
      height={height}
      loading="lazy"
      className={className}
    />
  );
}

function ChapterHead({ label, title, body }: { label: string; title: string; body: string }) {
  return (
    <Reveal className="blur-reveal max-w-[42rem] mb-10 sm:mb-12">
      <p className="font-sans text-xs uppercase tracking-[0.14em] text-muted font-medium mb-3">
        {label}
      </p>
      <h2 className="font-display font-black text-h2 text-fg leading-tight mb-4">{title}</h2>
      <p className="font-serif text-base sm:text-lg text-fg-2 leading-relaxed text-pretty">{body}</p>
    </Reveal>
  );
}

export default function PersonalPage() {
  const { hero, sketch, shipped, now, v1, workflow } = personal;
  const nextStudy = getStudy(personal.next.slug);
  const nextMeta = studyMeta[personal.next.slug];

  return (
    <main id="main" className="flex-1 w-full bg-ground">
      {/* Hero: title, demo video unfolding from a blur */}
      <header className="w-full bg-ground border-b border-rule py-16 md:py-24">
        <div className="container-page">
          <p className="font-sans text-xs uppercase tracking-[0.14em] text-muted font-medium mb-3">
            {personal.kicker}
          </p>
          <h1 className="font-display font-black text-h1 text-fg leading-[1.08] mb-6 max-w-[16ch] sm:max-w-none">
            {personal.title}
          </h1>
          <p className="font-serif text-fg-2 text-base sm:text-lg lg:text-xl leading-[1.6] max-w-[46rem] text-pretty mb-12">
            {personal.intro}
          </p>

          <FoldHero src={hero.video} poster={hero.poster} label={hero.videoLabel} />

          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-3">
              <p className="font-display font-black text-2xl sm:text-3xl text-fg leading-tight">
                <Link href={studyHref("good-roommate")} className="hover:text-accent transition-colors">
                  {hero.eyebrow}
                </Link>
                <span className="text-muted font-serif font-normal text-lg sm:text-xl"> · {hero.headline}</span>
              </p>
            </div>
            {hero.facts.map((f, i) => (
              <Reveal key={f.label} index={i} className="blur-reveal glass-panel p-5">
                <p className="font-sans text-xs uppercase tracking-[0.14em] text-muted font-medium mb-2">
                  {f.label}
                </p>
                <p className="font-serif text-fg-2 text-base leading-relaxed">{f.value}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </header>

      {/* 01 Sketch -> Figma, two halves opening on the hinge */}
      <section className="w-full border-b border-rule py-16 md:py-24">
        <div className="container-page">
          <ChapterHead label={sketch.label} title={sketch.title} body={sketch.body} />
          <FoldSpread
            left={<Img shot={sketch.left} />}
            right={<Img shot={sketch.right} />}
            leftLabel={sketch.left.caption}
            rightLabel={sketch.right.caption}
          />
        </div>
      </section>

      {/* 02 Figma <-> shipped, a card that turns on its hinge */}
      <section className="w-full border-b border-rule py-16 md:py-24">
        <div className="container-page">
          <ChapterHead label={shipped.label} title={shipped.title} body={shipped.body} />
          <FlipCompare
            frontLabel="Figma"
            backLabel="the shipped app"
            front={<Img shot={shipped.left} />}
            back={<Img shot={shipped.right} />}
          />
          <p className="mt-4 text-center font-sans text-xs sm:text-sm text-muted max-w-[34rem] mx-auto leading-relaxed">
            {shipped.left.caption} {shipped.right.caption}
          </p>
        </div>
      </section>

      {/* 03 Now: the newest designs, big, in the Duo bezel */}
      <section className="w-full border-b border-rule py-16 md:py-24">
        <div className="container-page">
          <ChapterHead label={now.label} title={now.title} body={now.body} />
          <FoldSpread
            className="now-spread"
            left={<Img shot={now.lead.left} className="now-shot" />}
            right={<Img shot={now.lead.right} className="now-shot" />}
            leftLabel={now.lead.left.caption}
            rightLabel={now.lead.right.caption}
          />
          <ul className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-6 list-none p-0 m-0">
            {now.more.map((m, i) => (
              <Reveal as="li" key={m.src} index={i} className="blur-reveal glass-panel p-5 flex flex-col items-center gap-3">
                <Img shot={m} className="now-shot" />
                <p className="font-sans text-xs text-muted text-center leading-relaxed max-w-[22rem]">{m.caption}</p>
              </Reveal>
            ))}
          </ul>
          <Reveal className="blur-reveal mt-6 glass-panel p-5 sm:p-8 flex flex-col items-center gap-3">
            <Img shot={now.cover} className="block h-auto w-full max-w-[44rem]" />
            <p className="font-sans text-xs sm:text-sm text-muted text-center leading-relaxed max-w-[34rem]">{now.cover.caption}</p>
          </Reveal>
        </div>
      </section>

      {/* 04 Version 1: small carousel */}
      <section className="w-full border-b border-rule py-16 md:py-24">
        <div className="container-page">
          <ChapterHead label={v1.label} title={v1.title} body={v1.body} />
          <ul
            tabIndex={0}
            aria-label="Version 1 screens, scroll sideways"
            className="v1-carousel list-none p-0 m-0"
          >
            {v1.steps.map((s) => (
              <li key={s.shot.src} className="v1-card">
                <Img shot={s.shot} className="v1-shot" />
                <p className="font-display font-black text-sm text-fg mt-3">
                  {s.version} <span className="font-serif font-normal text-muted">· {s.name}</span>
                </p>
                <p className="font-serif text-xs text-fg-2 leading-relaxed mt-1">{s.shot.caption}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 04 Workflow: Linear -> Figma -> Claude Code, with what is mine under each */}
      <section className="w-full border-b border-rule py-16 md:py-24">
        <div className="container-page">
          <ChapterHead label={workflow.label} title={workflow.title} body={workflow.body} />
          <ol className="grid grid-cols-1 lg:grid-cols-3 gap-6 list-none p-0 m-0">
            {workflow.steps.map((s, i) => (
              <Reveal as="li" key={s.tool} index={i} className="blur-reveal glass-panel p-6 flex flex-col">
                <p className="font-sans text-xs uppercase tracking-[0.14em] text-muted font-medium mb-1">
                  {String(i + 1).padStart(2, "0")} · {s.role}
                </p>
                <h3 className="font-display font-black text-2xl text-fg mb-4">{s.tool}</h3>
                <ul className="space-y-3 list-none p-0 m-0 mb-6">
                  {s.points.map((p) => (
                    <li key={p} className="font-serif text-base text-fg-2 leading-relaxed">
                      {p}
                    </li>
                  ))}
                </ul>
                <p className="mt-auto pt-4 border-t border-rule/60 font-serif text-base text-fg leading-relaxed">
                  <span className="font-sans text-xs uppercase tracking-[0.14em] text-accent font-medium block mb-1">
                    Mine
                  </span>
                  {s.mine}
                </p>
              </Reveal>
            ))}
          </ol>
          <Reveal className="blur-reveal mt-8 max-w-[40rem]">
            <p className="font-serif text-fg-2 text-base leading-relaxed">{personal.versionsNote}</p>
          </Reveal>
        </div>
      </section>

      {/* Next: the other personal project */}
      {nextStudy && (
        <section className="w-full py-16 md:py-24">
          <div className="container-page">
            <Reveal className="blur-reveal">
              <p className="font-sans text-xs uppercase tracking-[0.14em] text-muted font-medium mb-3">
                {personal.next.title}
              </p>
              <h2 className="font-display font-black text-h2 text-fg leading-tight mb-3">
                <Link href={studyHref(nextStudy.slug)} className="hover:text-accent transition-colors">
                  {nextStudy.title}
                </Link>
              </h2>
              {nextMeta?.claim && (
                <p className="font-serif text-lg text-fg-2 leading-relaxed max-w-[38rem]">{nextMeta.claim}</p>
              )}
            </Reveal>
          </div>
        </section>
      )}
    </main>
  );
}
