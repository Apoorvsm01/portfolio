import type { Metadata } from "next";
import Link from "next/link";
import { site } from "../../../content/site";
import { personal, type Shot } from "../../../content/personal";
import { projectRows } from "../../../content/home";
import { studyMeta } from "../../../content/study-meta";
import { Fig, LoopVideo } from "../../components/case-study";
import { imageDims } from "../../lib/image-dims";

export const metadata: Metadata = {
  title: "Side projects",
  description: personal.intro,
  alternates: { canonical: "/personal/" },
  openGraph: {
    title: `Side projects — ${site.name}`,
    description: personal.intro,
    url: `${site.url}/personal/`,
  },
};

function Shotfig({ shot, contain }: { shot: Shot; contain?: boolean }) {
  return <Fig src={shot.src} alt={shot.alt} caption={shot.caption} contain={contain} eager />;
}

function Chapter({ id, title, body, children }: { id: string; title: string; body: string; children: React.ReactNode }) {
  return (
    <section className="sec" aria-labelledby={id} data-reveal-group>
      <div className="decision__text" style={{ marginBottom: "clamp(28px, 4vw, 56px)" }}>
        <h2 id={id} className="head" data-reveal>
          {title}
        </h2>
        <p data-reveal>{body}</p>
      </div>
      <div data-reveal>{children}</div>
    </section>
  );
}

export default function PersonalPage() {
  const { hero, sketch, shipped, now, v1, workflow } = personal;
  const poster = imageDims(hero.poster);
  const others = projectRows.filter((p) => p.company === "Side project" && p.slug !== "good-roommate");

  return (
    <main id="main" className="flex-1 w-full">
      <header className="cs-head">
        <h1 className="display rise">Side projects</h1>
        <p className="lead-p rise" style={{ "--i": 1 } as React.CSSProperties}>
          {personal.title}
        </p>
        <p className="rise" style={{ "--i": 2 } as React.CSSProperties}>
          {personal.intro}
        </p>
      </header>

      <div className="sec sec--tight" style={{ paddingBottom: 0 }}>
        <figure className="fig rise" style={{ "--i": 3 } as React.CSSProperties}>
          <div className="fig__frame" style={{ display: "grid", placeItems: "center" }}>
            <div style={{ width: "min(100%, 920px)" }}>
              <LoopVideo src={hero.video} poster={hero.poster} label={hero.videoLabel} width={poster.width} height={poster.height} eager />
            </div>
          </div>
          <figcaption className="small">
            {hero.eyebrow}: {hero.headline}
          </figcaption>
        </figure>
        <dl className="cs-meta" style={{ paddingInline: 0 }}>
          {hero.facts.map((f) => (
            <div key={f.label}>
              <dt className="small">{f.label}</dt>
              <dd>{f.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <Chapter id="sketch" title={sketch.title} body={sketch.body}>
        <div className="pair">
          <Shotfig shot={sketch.left} />
          <Shotfig shot={sketch.right} />
        </div>
      </Chapter>

      <Chapter id="shipped" title={shipped.title} body={shipped.body}>
        <div className="pair">
          <Shotfig shot={shipped.left} />
          <Shotfig shot={shipped.right} />
        </div>
      </Chapter>

      <Chapter id="now" title={now.title} body={now.body}>
        <div className="stack" style={{ gap: "clamp(28px, 4vw, 56px)" }}>
          <div className="pair">
            <Shotfig shot={now.lead.left} />
            <Shotfig shot={now.lead.right} />
          </div>
          <div className="imgs">
            {now.more.map((m) => (
              <Shotfig key={m.src} shot={m} />
            ))}
          </div>
          <Shotfig shot={now.cover} />
        </div>
      </Chapter>

      <Chapter id="v1" title={v1.title} body={v1.body}>
        <ul className="imgs">
          {v1.steps.map((s) => (
            <li key={s.shot.src}>
              <Fig
                src={s.shot.src}
                alt={s.shot.alt}
                eager
                caption={`${s.version}, ${s.name}. ${s.shot.caption}`}
              />
            </li>
          ))}
        </ul>
      </Chapter>

      <section className="sec sec--field" aria-labelledby="workflow" data-reveal-group>
        <div className="decision__text" style={{ marginBottom: "clamp(28px, 4vw, 56px)" }}>
          <h2 id="workflow" className="head" data-reveal>
            {workflow.title}
          </h2>
          <p data-reveal>{workflow.body}</p>
        </div>
        <div className="cols">
          {workflow.steps.map((s) => (
            <div key={s.tool}>
              <h3 className="lead">
                {s.tool}: {s.role}
              </h3>
              <ul className="stack" style={{ gap: 12 }}>
                {s.points.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
              <p className="strong">What’s mine: {s.mine}</p>
            </div>
          ))}
        </div>
        <p className="muted" style={{ marginTop: 40 }}>
          {personal.versionsNote}
        </p>
      </section>

      <section className="sec" aria-labelledby="more-side" data-reveal-group>
        <h2 id="more-side" className="head" style={{ marginBottom: "clamp(28px, 4vw, 56px)" }} data-reveal>
          More side projects
        </h2>
        <div className="cols">
          {others.map((o) => (
            <div key={o.slug}>
              <h3 className="lead">
                <Link className="link" href={o.href}>
                  {o.title}
                </Link>
              </h3>
              <p>{studyMeta[o.slug]?.claim}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
