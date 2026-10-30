"use client";

import { useEffect, useState } from "react";
import type { StagePicture } from "../../content/home";
import { Stage } from "./Stage";
import { useReducedMotion } from "../lib/use-reduced-motion";

const HOLD_MS = 6000;

// The picture beside the first screen: Drive Coach, in four pictures that crossfade slowly. Pauses while
// the tab is hidden; under reduced motion it shows the first picture only.
export function HeroStage({ pictures }: { pictures: StagePicture[] }) {
  const [active, setActive] = useState(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced || pictures.length < 2) return;
    let id: ReturnType<typeof setInterval> | undefined;
    const start = () => {
      stop();
      id = setInterval(() => setActive((n) => (n + 1) % pictures.length), HOLD_MS);
    };
    const stop = () => {
      if (id) clearInterval(id);
      id = undefined;
    };
    const onVisibility = () => (document.hidden ? stop() : start());
    if (!document.hidden) start();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [reduced, pictures.length]);

  return <Stage pictures={pictures} active={reduced ? 0 : active} className="hero__stage" />;
}
