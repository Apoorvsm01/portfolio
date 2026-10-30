import Link from "next/link";
import { heroPictures } from "../../content/home";
import { site } from "../../content/site";
import { Ask } from "../components/ask/Ask";
import { HeroStage } from "../components/HeroStage";
import { WorkIndex } from "../components/WorkIndex";
import { Letter } from "../components/Letter";
import { Contact } from "../components/Contact";
import { getIndexRows } from "../lib/rows";
import { JsonLd, profilePageGraph } from "../lib/structured-data";

export default function Home() {
  return (
    <main id="main" className="flex-1 w-full">
      <JsonLd data={profilePageGraph()} />

      <div className="hero">
        <div className="hero__text">
          <h1 className="display rise" style={{ "--i": 0 } as React.CSSProperties}>
            <span className="sr-only">Apoorv Mahajan: </span>I study how people drive.
          </h1>
          <p className="rise" style={{ "--i": 1 } as React.CSSProperties}>
            Then I build what they need. I’m Apoorv Mahajan, a senior product designer and UX engineer for in-car AI, voice and spatial products.
          </p>
          <div className="rise" style={{ "--i": 2 } as React.CSSProperties}>
            <Link href="#work" className="btn">
              See the work <span className="arrow" aria-hidden="true">→</span>
            </Link>
          </div>
          <p className="small muted rise" style={{ "--i": 3 } as React.CSSProperties}>
            {site.location}
          </p>
          <div className="rise" style={{ "--i": 4 } as React.CSSProperties} id="ask-wrap">
            <Ask />
          </div>
        </div>
        <HeroStage pictures={heroPictures} />
      </div>

      <WorkIndex
        id="work"
        title="Selected work"
        intro="Cars, headsets and health, newest first. The picture follows the project you are reading."
        rows={getIndexRows()}
      />

      <section className="band" aria-labelledby="proof-title" data-reveal-group>
        <div className="band__inner">
          <p className="band__figure" data-reveal aria-hidden="true">
            70%
          </p>
          <div className="band__text" data-reveal>
            <h2 id="proof-title" className="lead">
              70% of drivers understood the re-timed voice instructions.
            </h2>
            <p>
              That was the Drive Coach real-car retest at Woven by Toyota, a 50% improvement on the version before. Fixed-distance prompts reached speeding drivers too late, so I timed them by speed instead.
            </p>
            <Link href="/work/woven/" className="btn">
              Read the Drive Coach study <span className="arrow" aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>

      <Letter />
      <Contact />
    </main>
  );
}
