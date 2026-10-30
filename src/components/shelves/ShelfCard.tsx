"use client";

import Link from "next/link";
import { m } from "motion/react";
import { useRef } from "react";
import { useReveal, useTilt } from "../motion/home-motion";
import { FadeImage } from "../FadeImage";
import { site } from "../../../content/site";
import type { ProjectCard } from "./types";

// Spring-driven pointer tilt (max 4deg) with a specular highlight. Keyboard focus gets the same lift via CSS
// (:focus-visible). Cards rise in as they scroll into view; with JS off or reduced motion they just render.
export function ShelfCard({ project, index }: { project: ProjectCard; index: number }) {
  const card = useRef<HTMLLIElement | null>(null);
  const { enabled, rotateX, rotateY, imageScale, bind } = useTilt(4);
  const { opacity, y } = useReveal(card, Math.min(index, 6) * 0.06, 16);

  function move(e: React.PointerEvent<HTMLDivElement>) {
    if (!enabled || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${((e.clientX - r.left) / r.width) * 100}%`);
    e.currentTarget.style.setProperty("--my", `${((e.clientY - r.top) / r.height) * 100}%`);
    bind.onPointerMove(e);
  }

  const flag = site.flags[project.flag];
  const cover = project.cover;

  return (
    <m.li
      ref={card}
      className="shelf-card"
      style={{ "--i": index, "--flag": flag.bg, "--flag-ink": flag.ink, opacity, y, animation: "none" } as never}
    >
      <Link href={project.href} className="shelf-link">
        <m.div
          className="shelf-media"
          onPointerMove={enabled ? move : undefined}
          onPointerLeave={enabled ? bind.onPointerLeave : undefined}
          style={
            enabled
              ? ({ rotateX, rotateY, transformPerspective: 1000, "--img-scale": imageScale, transition: "box-shadow 300ms" } as never)
              : { transform: "none", transition: "box-shadow 300ms" }
          }
        >
          <span className="shelf-badge">{project.org ?? project.domain}</span>
          {cover && (
            <FadeImage
              src={cover.src}
              alt=""
              width={cover.width}
              height={cover.height}
              loading="lazy"
              draggable={false}
              className={`${cover.fit === "contain" ? "object-contain p-3" : "object-cover"} [transform:scale(var(--img-scale,1))]`}
            />
          )}
        </m.div>
        <div className="shelf-meta">
          <h3 className="shelf-name">{project.title}</h3>
          <p className="shelf-claim">{project.claim}</p>
        </div>
      </Link>
    </m.li>
  );
}
