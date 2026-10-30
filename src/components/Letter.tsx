import { site } from "../../content/site";
import { Img } from "./Img";

// A founder's letter in a narrow column: first person, short paragraphs. Every claim restates something
// the case studies or the résumé already say.
export function Letter() {
  return (
    <section className="letter" aria-labelledby="letter-title" data-reveal-group>
      <h2 id="letter-title" className="sr-only">
        About me
      </h2>
      <Img
        data-reveal
        className="letter__portrait"
        src={site.hero.image.src}
        alt="Apoorv Mahajan"
        width={112}
        height={112}
      />
      <p data-reveal>
        I’m Apoorv. I’m a senior product designer and UX engineer, and I design what happens inside a car and around the person driving it.
      </p>
      <p data-reveal>
        From November 2025 to October 2026 I was the UX engineer behind Drive Coach at Woven by Toyota, an in-car AI that coaches new drivers by voice. I took it from raw research on 100+ drivers to a simulator rig with real steering and pedals, and then into the car.
      </p>
      <p data-reveal>
        Before that I designed for Apple Vision Pro and Meta Quest at Omnia, and ran my own UX consultancy, Crazy Minds, for four years. I studied human-computer interaction at DePaul.
      </p>
      <p data-reveal>I run the study and I build the interface, so what the research finds and what ships are the same thing.</p>
      <p data-reveal>
        <mark>I’m looking for my next team.</mark> If you’re building for cars, spatial computing or AI, write to me.
      </p>
      <div className="letter__sign" data-reveal>
        <p className="lead">{site.name}</p>
        <p className="small muted">{site.role}</p>
      </div>
    </section>
  );
}
