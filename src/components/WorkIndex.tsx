"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { StagePicture } from "../../content/home";
import { Stage } from "./Stage";
import { Img } from "./Img";

export type IndexRow = {
  slug: string;
  title: string;
  company: string;
  role: string;
  years?: string;
  claim: string;
  href: string;
  stage: StagePicture;
};

// A small index on the left, one large picture on the right. The picture is the project in view: as a row
// crosses the middle of the screen the stage crossfades to its picture. On a phone the stage sits under the
// navigation and the rows scroll beneath it.
export function WorkIndex({
  rows,
  title,
  intro,
  id,
  asPage = false,
}: {
  rows: IndexRow[];
  title: string;
  intro?: string;
  id?: string;
  asPage?: boolean;
}) {
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLLIElement | null)[]>([]);
  const Heading = asPage ? "h1" : "h2";

  useEffect(() => {
    const phone = window.matchMedia("(max-width: 899px)").matches;
    const margin = phone ? "-40% 0px -50% 0px" : "-42% 0px -48% 0px";
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const i = refs.current.indexOf(e.target as HTMLLIElement);
            if (i >= 0) setActive(i);
          }
        });
      },
      { rootMargin: margin },
    );
    refs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, [rows.length]);

  return (
    <section id={id} className={`work${asPage ? " work--page" : ""}`} aria-labelledby={`${id ?? "work"}-title`} data-reveal-group>
      <div className="work__list">
        <div className="work__intro">
          <Heading id={`${id ?? "work"}-title`} className="head" data-reveal>
            {title}
          </Heading>
          {intro && (
            <p className="lead-p muted" data-reveal>
              {intro}
            </p>
          )}
        </div>
        <ol>
          {rows.map((r, i) => (
            <li
              key={r.slug}
              ref={(el) => {
                refs.current[i] = el;
              }}
              className="row"
              aria-current={i === active ? "true" : undefined}
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
            >
              <div data-reveal style={{ display: "grid", gap: 10 }}>
                <div className="row__pic" data-fit={r.stage.fit} style={r.stage.bg ? { background: r.stage.bg } : undefined}>
                  <Img src={r.stage.src} alt={r.stage.alt} style={{ objectPosition: r.stage.position }} />
                </div>
                <h3 className="row__title">
                  <Link href={r.href}>{r.title}</Link>
                </h3>
                <p className="small">
                  {[r.company, r.role, r.years].filter(Boolean).join(" · ")}
                </p>
                <p>{r.claim}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
      <div className="work__stage">
        <Stage pictures={rows.map((r) => r.stage)} active={active} className="" />
      </div>
    </section>
  );
}
