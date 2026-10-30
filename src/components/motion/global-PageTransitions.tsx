"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";

// Native View Transitions for internal navigation: main content cross-fades with an 8px rise while the
// header (named in CSS) stays put. Where the API is missing or motion is reduced, links behave as normal.
// Next's own viewTransition flag is not used: a small click interceptor is more predictable with static export.
type VTDocument = Document & { startViewTransition?: (cb: () => Promise<void> | void) => { finished: Promise<void> } };

export function GlobalPageTransitions() {
  const router = useRouter();
  const pathname = usePathname();
  const settle = useRef<(() => void) | null>(null);

  // Route committed: let the transition capture the new page after it has painted.
  useEffect(() => {
    if (!settle.current) return;
    const done = settle.current;
    settle.current = null;
    requestAnimationFrame(() => requestAnimationFrame(done));
  }, [pathname]);

  useEffect(() => {
    const doc = document as VTDocument;
    if (!doc.startViewTransition) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)");

    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (still.matches) return;
      const a = (e.target as Element | null)?.closest?.("a");
      if (!a || a.target || a.hasAttribute("download") || a.hasAttribute("data-no-vt")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin) return;
      if (url.pathname === location.pathname) return; // same page or hash jump: leave to the browser/Next
      e.preventDefault();

      const root = document.documentElement;
      root.setAttribute("data-page-vt", "");
      const vt = doc.startViewTransition!(
        () =>
          new Promise<void>((resolve) => {
            const timer = window.setTimeout(resolve, 1500); // never hang on a slow route
            settle.current = () => {
              window.clearTimeout(timer);
              resolve();
            };
            // a.href is absolute and already includes the basePath; router wants the app-relative path.
            router.push(a.getAttribute("href") ?? url.pathname);
          }),
      );
      const clear = () => root.removeAttribute("data-page-vt");
      vt.finished.then(clear, clear);
    };

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [router]);

  return null;
}
