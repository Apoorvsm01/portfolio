import { ShelfCard } from "./ShelfCard";
import type { ProjectCard } from "./types";

export function Shelf({
  id,
  title,
  kicker,
  projects,
  matches = false,
  enter = false,
}: {
  id: string;
  title: string;
  kicker: string;
  projects: ProjectCard[];
  matches?: boolean;
  enter?: boolean;
}) {
  if (projects.length === 0) return null;
  return (
    <section id={id} className="shelf" aria-labelledby={`${id}-title`} data-matches={matches} data-enter={enter}>
      <div className="shelf-head">
        <h2 id={`${id}-title`} className="shelf-title">
          {title}
        </h2>
        <p className="shelf-kicker">{kicker}</p>
      </div>
      <ul className="shelf-track" role="list">
        {projects.map((p, i) => (
          <ShelfCard key={`${id}-${p.slug}`} project={p} index={i} />
        ))}
      </ul>
    </section>
  );
}
