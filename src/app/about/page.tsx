import type { Metadata } from "next";
import { site } from "../../../content/site";
import { asset } from "../../lib/asset";
import { Img } from "../../components/Img";

const headsets = [
  { src: "/me/headsets/vision-pro.jpg", name: "Apple Vision Pro", alt: "Apoorv wearing an Apple Vision Pro" },
  { src: "/me/headsets/hololens-2.jpg", name: "Microsoft HoloLens 2", alt: "Apoorv wearing a Microsoft HoloLens 2" },
  { src: "/me/headsets/spectacles.jpg", name: "Snap Spectacles", alt: "Apoorv wearing Snap Spectacles" },
  { src: "/me/headsets/tilt-five.jpg", name: "Tilt Five AR", alt: "Apoorv wearing Tilt Five AR glasses" },
  { src: "/me/headsets/even-g1.jpg", name: "Even Realities G1", alt: "Apoorv wearing Even Realities G1 smart glasses" },
  { src: "/me/headsets/realwear.jpg", name: "RealWear", alt: "Apoorv wearing a RealWear headset" },
  { src: "/me/headsets/quest-3.jpg", name: "Meta Quest 3", alt: "Apoorv holding Meta Quest 3 controllers at an outdoor demo" },
  { src: "/me/headsets/hololens-2-lab.jpg", name: "Microsoft HoloLens 2, in the lab", alt: "Apoorv wearing a HoloLens 2 in a blue-lit lab" },
];

export const metadata: Metadata = {
  title: "About",
  description: site.hero.intro,
  alternates: { canonical: "/about/" },
  openGraph: {
    title: `About — ${site.name}`,
    description: site.hero.intro,
    url: `${site.url}/about/`,
  },
};

export default function AboutPage() {
  return (
    <main id="main" className="flex-1 w-full">
      <header className="page-head">
        <div className="page-head__text">
          <h1 className="display rise">
            <span className="sr-only">About Apoorv Mahajan: </span>Designer and engineer.
          </h1>
          <p className="rise" style={{ "--i": 1 } as React.CSSProperties}>
            {site.hero.intro}
          </p>
          <p className="rise" style={{ "--i": 2 } as React.CSSProperties}>
            <a className="btn" href={asset("/resume/Apoorv-Mahajan-Resume.pdf")} target="_blank" rel="noopener noreferrer">
              Read my résumé <span className="arrow" aria-hidden="true">↗</span>
              <span className="sr-only"> (PDF, opens in a new tab)</span>
            </a>
          </p>
        </div>
        <Img
          className="page-head__photo rise"
          style={{ "--i": 2 } as React.CSSProperties}
          src={site.hero.image.src}
          alt={site.hero.image.alt}
          loading="eager"
        />
      </header>

      <section className="sec sec--split sec--tight" aria-labelledby="where" data-reveal-group>
        <h2 id="where" className="head" data-reveal>
          Where I’ve worked
        </h2>
        <div className="stack">
          <p className="lead-p muted" data-reveal>
            {site.timelineIntro}
          </p>
          <ol className="tl">
            {site.timeline.map((t) => (
              <li key={`${t.org}-${t.years}`} className="tl__row" data-reveal>
                <p className="muted">{t.years}</p>
                <div>
                  <h3 className="lead">{t.role}</h3>
                  <p>{t.org}</p>
                  {"note" in t && t.note && <p className="muted">{t.note}</p>}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="sec sec--field" aria-labelledby="how" data-reveal-group>
        <div className="stack" style={{ marginBottom: "clamp(32px, 5vw, 64px)" }}>
          <h2 id="how" className="head" data-reveal>
            How I work
          </h2>
          <p className="lead-p" data-reveal>
            {site.howIWorkIntro}
          </p>
        </div>
        <div className="cols">
          {site.howIWork.map((h) => (
            <div key={h.title} data-reveal>
              <h3 className="lead">{h.title}</h3>
              <p>{h.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="sec sec--split" aria-labelledby="platforms" data-reveal-group>
        <h2 id="platforms" className="head" data-reveal>
          Platforms I’ve designed for
        </h2>
        <div className="stack">
          <p className="lead-p" data-reveal>
            {site.platforms.join(", ")}.
          </p>
          <p className="muted" data-reveal>
            {site.platformsNote}
          </p>
        </div>
        <ul className="gallery" style={{ gridColumn: "1 / -1" }}>
          {headsets.map((h) => (
            <li key={h.src} data-reveal>
              <figure>
                <Img src={h.src} alt={h.alt} />
                <figcaption className="small muted">{h.name}</figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
