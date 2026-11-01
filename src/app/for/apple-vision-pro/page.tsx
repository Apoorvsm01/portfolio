import type { Metadata } from "next";
import Link from "next/link";
import { site } from "../../../../content/site";
import { appleVisionPro as copy } from "../../../../content/for-apple-vision-pro";
import { getProjectCards } from "../../../lib/projects";
import { Shelf } from "../../../components/shelves/Shelf";
import { CopyEmail } from "../../../components/CopyEmail";

// A page for one application: shareable by link, kept out of search results and the sitemap.
export const metadata: Metadata = {
  title: `For Apple: ${copy.role}`,
  description: copy.intro,
  robots: { index: false, follow: true, googleBot: { index: false, follow: true } },
};

export default function AppleVisionProPage() {
  const cards = new Map(getProjectCards().map((p) => [p.slug, p]));
  const pick = (slugs: readonly string[]) => slugs.map((s) => cards.get(s)).filter((p) => p !== undefined);

  return (
    <main id="main" className="flex-1 w-full role-page">
      <header className="container-page role-hero">
        <p className="role-kicker">
          {copy.kicker} <span className="role-number">· {copy.roleNumber}</span>
        </p>
        <h1 className="role-headline">{copy.headline}</h1>
        <p className="role-intro">{copy.intro}</p>
        <div className="role-actions">
          <a className="role-button role-button-primary" href="#ask">
            {copy.askTitle}
          </a>
          <a className="role-button" href="#contact">
            {copy.closingTitle}
          </a>
        </div>
      </header>

      <section className="container-page role-fit" aria-labelledby="fit-title">
        <h2 id="fit-title" className="role-section-title">
          {copy.fitTitle}
        </h2>
        <ol className="role-fit-list">
          {copy.fit.map((row) => (
            <li key={row.title} className="role-fit-row">
              <p className="role-need">“{row.need}”</p>
              <div>
                <h3 className="role-fit-title">{row.title}</h3>
                <p className="role-fit-body">{row.body}</p>
                {"showPlatforms" in row && row.showPlatforms && (
                  <ul className="role-platforms">
                    {site.platforms.map((p) => (
                      <li key={p}>{p}</li>
                    ))}
                  </ul>
                )}
                <Link className="role-fit-link" href={row.href}>
                  {row.linkLabel} <span aria-hidden="true">→</span>
                </Link>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Nested like the home page: .shelves' padding shorthand would otherwise drop the page gutters. */}
      <div className="container-page">
        <div className="shelves">
          {copy.shelves.map((s) => (
            <Shelf key={s.id} id={s.id} title={s.title} kicker={s.kicker} projects={pick(s.slugs)} />
          ))}
        </div>
      </div>

      <section id="ask" className="container-page role-ask" aria-labelledby="ask-title">
        <h2 id="ask-title" className="role-section-title">
          {copy.askTitle}
        </h2>
        <p className="role-fit-body">{copy.askBody}</p>
        <ul className="role-prompts">
          {copy.askPrompts.map((q) => (
            <li key={q}>
              <Link className="ask-chip" href={`/?q=${encodeURIComponent(q)}`}>
                {q}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section id="contact" className="container-page role-contact" aria-labelledby="contact-title">
        <h2 id="contact-title" className="role-section-title">
          {copy.closingTitle}
        </h2>
        <p className="role-fit-body">{copy.closingBody}</p>
        <div className="role-contact-row">
          <CopyEmail />
          <a className="role-fit-link" href={site.linkedin} target="_blank" rel="noopener noreferrer">
            LinkedIn <span aria-hidden="true">↗</span>
          </a>
        </div>
      </section>
    </main>
  );
}
