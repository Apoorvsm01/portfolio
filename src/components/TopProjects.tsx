import { site } from "../../content/site";
import { WorkCard } from "./WorkCard";

/** The other two of the top three, directly under the featured Generative Drive Coach band. */
export function TopProjects() {
  const items = site.home.top
    .map((slug) => site.work.find((w) => w.slug === slug))
    .filter((w): w is (typeof site.work)[number] => Boolean(w));

  return (
    <section
      aria-label="Top projects"
      className="w-full bg-ground border-b border-rule py-16 md:py-24"
    >
      <div className="container-page">
        <p className="font-sans text-xs uppercase tracking-[0.14em] text-muted font-medium mb-6">
          {site.home.topKicker}
        </p>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 list-none p-0 m-0">
          {items.map((work, index) => (
            <li key={work.slug} style={{ "--i": index } as React.CSSProperties} className="grid-item-enter">
              <WorkCard work={work} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
