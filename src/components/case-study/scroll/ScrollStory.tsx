"use client";

import { useLayoutEffect } from "react";
import { useReducedMotion } from "../../../lib/use-reduced-motion";
import { registerScrollTrigger } from "./register";

/*
 * Scroll storytelling layer for a case study. Renders nothing; wires GSAP ScrollTrigger to data attributes
 * that the case-study components emit:
 *   [data-story-headline]  section/block headings: words rise in once
 *   [data-story-body]      children (p, ul, h3) rise in once, 80ms after the headline
 *   [data-story-media]     image/video frame: scale .94 -> 1 and the mask opens, scrubbed
 *   [data-story-parallax]  overflow-hidden frame whose <img> drifts a few px
 *   [data-story-batch]     cards, tiles, widgets: staggered batch reveal
 *   [data-story-count]     numeric values count up once
 *   [data-story-ia]        the IA diagram: revealed top row, then bottom row
 * Every hidden/initial state is applied here, so static HTML and no-JS stay fully visible. Reduced motion
 * skips the whole layer.
 */

const NUM = /^([^\d\s]?\s?)(\d{1,3}(?:,\d{3})+|\d+)(\.\d+)?([^\d]{0,6})$/;

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function ScrollStory() {
  const reduced = useReducedMotion();

  useLayoutEffect(() => {
    if (reduced) return;
    const root = document.querySelector("article");
    if (!root) return;

    const { gsap, ScrollTrigger } = registerScrollTrigger();
    const restores: Array<() => void> = [];

    const ctx = gsap.context(() => {
      const q = (sel: string) => Array.from(root.querySelectorAll<HTMLElement>(sel));

      // 1. Section media: scale + mask open, scrubbed.
      q("[data-story-media]").forEach((el) => {
        gsap.fromTo(
          el,
          { scale: 0.94, clipPath: "inset(5% 5% 5% 5% round 6px)" },
          {
            scale: 1,
            clipPath: "inset(0% 0% 0% 0% round 6px)",
            ease: "none",
            scrollTrigger: { trigger: el, start: "top 96%", end: "top 58%", scrub: true },
          },
        );
      });

      // Hero image parallax (32px total travel); image slightly oversized so the frame never shows a gap.
      q("[data-story-parallax]").forEach((frame) => {
        const img = frame.querySelector("img");
        if (!img) return;
        gsap.fromTo(
          img,
          { y: -16, scale: 1.1 },
          {
            y: 16,
            scale: 1.1,
            ease: "none",
            scrollTrigger: { trigger: frame, start: "top bottom", end: "bottom top", scrub: true },
          },
        );
      });

      // 2. Headlines: words rise once.
      q("[data-story-headline]").forEach((el) => {
        const original = el.innerHTML;
        const text = el.textContent ?? "";
        const words = text.split(/\s+/).filter(Boolean);
        if (words.length === 0) return;
        el.setAttribute("aria-label", text);
        el.innerHTML = words
          .map((w) => `<span aria-hidden="true" style="display:inline-block">${esc(w)}</span>`)
          .join(" ");
        restores.push(() => {
          el.innerHTML = original;
          el.removeAttribute("aria-label");
        });
        const spans = el.querySelectorAll("span");
        gsap.set(spans, { opacity: 0, y: "0.7em" });
        ScrollTrigger.create({
          trigger: el,
          start: "top 88%",
          once: true,
          onEnter: () =>
            gsap.to(spans, {
              opacity: 1,
              y: 0,
              duration: 0.6,
              ease: "power3.out",
              stagger: 0.045,
              clearProps: "transform,opacity",
            }),
        });
      });

      // Body follows the headline by 80ms; items reveal as they reach the viewport.
      const bodyItems = q("[data-story-body] > p, [data-story-body] > ul, [data-story-body] > h3");
      if (bodyItems.length) {
        gsap.set(bodyItems, { opacity: 0, y: 14 });
        ScrollTrigger.batch(bodyItems, {
          start: "top 90%",
          once: true,
          interval: 0.08,
          // onLeave covers jumps past the trigger (chapter menu, back-to-top, anchors).
          onLeave: (batch) => gsap.set(batch, { clearProps: "transform,opacity" }),
          onEnter: (batch) =>
            gsap.to(batch, {
              opacity: 1,
              y: 0,
              duration: 0.6,
              delay: 0.08,
              ease: "power3.out",
              stagger: 0.06,
              overwrite: true,
              clearProps: "transform,opacity",
            }),
        });
      }

      // 3. Cards / bento / widgets: staggered batch.
      const batchItems = q("[data-story-batch]");
      if (batchItems.length) {
        gsap.set(batchItems, { opacity: 0, y: 20 });
        ScrollTrigger.batch(batchItems, {
          start: "top 92%",
          once: true,
          interval: 0.1,
          batchMax: 8,
          onLeave: (batch) => gsap.set(batch, { clearProps: "transform,opacity" }),
          onEnter: (batch) =>
            gsap.to(batch, {
              opacity: 1,
              y: 0,
              duration: 0.65,
              ease: "power3.out",
              stagger: 0.06,
              overwrite: true,
              clearProps: "transform,opacity",
            }),
        });
      }

      // Safety net: at the end of the page, nothing may still be waiting to reveal.
      ScrollTrigger.create({
        trigger: document.documentElement,
        start: "bottom bottom+=4",
        once: true,
        onEnter: () => gsap.set([...bodyItems, ...batchItems], { clearProps: "transform,opacity" }),
      });

      // 4. Count-up numerals, once. Only plain numeric values ("34", "2.43M", "70%").
      q("[data-story-count]").forEach((el) => {
        if (el.children.length) return;
        const raw = (el.textContent ?? "").trim();
        const m = raw.match(NUM);
        if (!m) return;
        const [, prefix, intPart, dec = "", suffix] = m;
        const target = parseFloat(intPart.replace(/,/g, "") + dec);
        if (!isFinite(target) || target === 0) return;
        const decimals = dec ? dec.length - 1 : 0;
        const commas = intPart.includes(",");
        const fmt = (v: number) =>
          commas
            ? v.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
            : v.toFixed(decimals);
        const state = { v: 0 };
        ScrollTrigger.create({
          trigger: el,
          start: "top 90%",
          once: true,
          onEnter: () =>
            gsap.to(state, {
              v: target,
              duration: 1.1,
              ease: "power2.out",
              onUpdate: () => {
                el.textContent = `${prefix}${fmt(state.v)}${suffix}`;
              },
              onComplete: () => {
                el.textContent = raw;
              },
            }),
        });
        restores.push(() => {
          el.textContent = raw;
        });
      });

      // 5. Signature: IA diagram, top row (verbs) then bottom row (objects). Scrubbed, not pinned, so the
      // sticky ChapterBar and nav keep working.
      q("[data-story-ia]").forEach((el) => {
        const tl = gsap.timeline({
          scrollTrigger: { trigger: el, start: "top 78%", end: "bottom 52%", scrub: 0.5 },
        });
        tl.fromTo(
          el,
          { clipPath: "inset(0% 0% 100% 0%)" },
          { clipPath: "inset(0% 0% 56% 0%)", ease: "power2.out", duration: 1 },
        ).to(el, { clipPath: "inset(0% 0% 0% 0%)", ease: "power2.inOut", duration: 1 }, ">+=0.15");
      });
    }, root);

    // Layout shifts as images/fonts arrive: re-measure.
    let t: number | undefined;
    const refresh = () => {
      window.clearTimeout(t);
      t = window.setTimeout(() => ScrollTrigger.refresh(), 120);
    };
    root.addEventListener("load", refresh, true);
    window.addEventListener("load", refresh);
    document.fonts?.ready.then(refresh).catch(() => {});
    refresh();

    return () => {
      window.clearTimeout(t);
      root.removeEventListener("load", refresh, true);
      window.removeEventListener("load", refresh);
      ctx.revert();
      restores.forEach((fn) => fn());
    };
  }, [reduced]);

  return null;
}
