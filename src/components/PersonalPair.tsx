import { site } from "../../content/site";
import { PersonalWork } from "./PersonalWork";
import { WorkCard } from "./WorkCard";

/** Half the width for the personal project, half for the Drive Coach app. */
export function PersonalPair() {
  const pair = site.work.find((w) => w.slug === site.home.pair);

  return (
    <section
      aria-label="Personal project and Drive Coach app"
      className="w-full bg-ground border-b border-rule py-16 md:py-24"
    >
      <div className="container-page">
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 list-none p-0 m-0">
          <li className="grid-item-enter">
            <PersonalWork />
          </li>
          {pair && (
            <li style={{ "--i": 1 } as React.CSSProperties} className="grid-item-enter">
              <WorkCard work={pair} />
            </li>
          )}
        </ul>
      </div>
    </section>
  );
}
