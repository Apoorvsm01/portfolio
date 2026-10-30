"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Reveals [data-reveal] elements once, as they enter the viewport. Siblings that arrive together are
// staggered: each element's --i is its position among the revealed elements of its section.
export function RevealInit() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]:not(.in)"));
    root.setAttribute("data-reveal-ready", "");
    if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      els.forEach((el) => el.classList.add("in"));
      return;
    }
    // Index each element within its group (nearest section, or the whole page).
    const counters = new Map<Element, number>();
    els.forEach((el) => {
      const group = el.closest("[data-reveal-group]") ?? document.body;
      const n = counters.get(group) ?? 0;
      counters.set(group, n + 1);
      el.style.setProperty("--i", String(Math.min(n, 5)));
    });
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [pathname]);

  return null;
}
