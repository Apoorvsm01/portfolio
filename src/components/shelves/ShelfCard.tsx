"use client";

import Link from "next/link";
import { useRef } from "react";
import { FadeImage } from "../FadeImage";
import { site } from "../../../content/site";
import type { ProjectCard } from "./types";

// Pointer tilt with a specular highlight. Keyboard focus gets the same lift via CSS (:focus-visible).
export function ShelfCard({ project, index }: { project: ProjectCard; index: number }) {
  const card = useRef<HTMLLIElement | null>(null);
  const media = useRef<HTMLDivElement | null>(null);
  const frame = useRef(0);

  function move(e: React.PointerEvent<HTMLAnchorElement>) {
    if (e.pointerType !== "mouse") return;
    const { clientX, clientY } = e;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const el = media.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const px = (clientX - r.left) / r.width;
      const py = (clientY - r.top) / r.height;
      el.style.setProperty("--ry", `${(px - 0.5) * 14}deg`);
      el.style.setProperty("--rx", `${(0.5 - py) * 10}deg`);
      el.style.setProperty("--mx", `${px * 100}%`);
      el.style.setProperty("--my", `${py * 100}%`);
      card.current?.setAttribute("data-active", "true");
    });
  }
  function leave() {
    cancelAnimationFrame(frame.current);
    const el = media.current;
    el?.style.removeProperty("--ry");
    el?.style.removeProperty("--rx");
    card.current?.removeAttribute("data-active");
  }

  const flag = site.flags[project.flag];
  const cover = project.cover;

  return (
    <li
      ref={card}
      className="shelf-card"
      style={{ "--i": index, "--flag": flag.bg, "--flag-ink": flag.ink } as React.CSSProperties}
    >
      <Link href={project.href} className="shelf-link" onPointerMove={move} onPointerLeave={leave}>
        <div ref={media} className="shelf-media">
          <span className="shelf-badge">{project.org ?? project.domain}</span>
          {cover && (
            <FadeImage
              src={cover.src}
              alt=""
              width={cover.width}
              height={cover.height}
              loading="lazy"
              draggable={false}
              className={cover.fit === "contain" ? "object-contain p-3" : "object-cover"}
            />
          )}
        </div>
        <div className="shelf-meta">
          <h3 className="shelf-name">{project.title}</h3>
          <p className="shelf-claim">{project.claim}</p>
        </div>
      </Link>
    </li>
  );
}
