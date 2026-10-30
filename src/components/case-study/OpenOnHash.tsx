"use client";

import { useEffect } from "react";

// Links like /work/woven/#section-3 point inside the closed "Full notes" disclosure: open it and scroll there.
export function OpenOnHash() {
  useEffect(() => {
    const go = () => {
      const id = decodeURIComponent(window.location.hash.slice(1));
      if (!id) return;
      const el = document.getElementById(id);
      const details = el?.closest("details");
      if (el && details && !details.open) {
        details.open = true;
        requestAnimationFrame(() => el.scrollIntoView());
      }
    };
    go();
    window.addEventListener("hashchange", go);
    return () => window.removeEventListener("hashchange", go);
  }, []);
  return null;
}
