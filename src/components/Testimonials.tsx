import { site } from "../../content/site";

// Two short pull quotes from LinkedIn recommendations, on the home page between the headsets and About.
export function Testimonials() {
  const { heading, items, source } = site.testimonials;
  return (
    <section aria-labelledby="testimonials-heading" className="w-full bg-ground border-b border-rule py-16 md:py-24">
      <div className="container-page">
        <h2 id="testimonials-heading" className="font-display font-black text-h2 text-fg leading-tight mb-8 sm:mb-10">
          {heading}
        </h2>
        <ul className="grid gap-6 md:grid-cols-2 list-none p-0 m-0">
          {items.map((t) => (
            <li key={t.name} className="m-0">
              <figure className="h-full m-0 rounded-[6px] border border-rule bg-surface p-6 sm:p-8 flex flex-col gap-5">
                <blockquote className="m-0 font-serif text-fg text-base sm:text-lg leading-[1.6] text-pretty">
                  <p>“{t.quote}”</p>
                </blockquote>
                <figcaption className="mt-auto font-sans text-sm text-muted">
                  <span className="text-fg font-medium">{t.name}</span>
                  <span aria-hidden="true" className="hidden sm:inline"> · </span>
                  <span className="block sm:inline">{t.role}</span>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
        <p className="mt-5 font-sans text-xs sm:text-sm text-muted">{source}</p>
      </div>
    </section>
  );
}
