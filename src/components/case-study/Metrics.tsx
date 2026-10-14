"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { Metric } from "../../../content/types";

interface ParsedNumber {
  target: number;
  decimals: number;
}

function parseNumber(raw: string): ParsedNumber | null {
  const match = raw.trim().match(/^(\d+(?:\.\d+)?)\s*([a-zA-Z%]+)?$/);
  if (!match) return null;
  const numStr = match[1];
  const target = parseFloat(numStr);
  if (isNaN(target)) return null;
  const dotIndex = numStr.indexOf(".");
  const decimals = dotIndex >= 0 ? numStr.length - dotIndex - 1 : 0;
  return { target, decimals };
}

function subscribeReducedMotion(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  mediaQuery.addEventListener("change", callback);
  return () => mediaQuery.removeEventListener("change", callback);
}

function getReducedMotionSnapshot() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getReducedMotionServerSnapshot() {
  return false;
}

function StatTile({
  item,
  inView,
  prefersReduced,
}: {
  item: Metric;
  inView: boolean;
  prefersReduced: boolean;
}) {
  const parsed = parseNumber(item.value);
  const [currentValue, setCurrentValue] = useState<number | null>(
    parsed ? 0 : null
  );
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    if (!parsed || !inView || complete || prefersReduced) {
      return;
    }

    const duration = 1000;
    const startTime = performance.now();
    let rafId: number | null = null;

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const val = eased * parsed.target;

      setCurrentValue(val);

      if (progress < 1) {
        rafId = requestAnimationFrame(tick);
      } else {
        setComplete(true);
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [inView, parsed, complete, prefersReduced]);

  // Strip to digits for the count-up animation, then keep the original string as final text
  let displayValue = item.value;
  if (parsed && inView && !complete && !prefersReduced && currentValue !== null) {
    displayValue = currentValue.toFixed(parsed.decimals);
  }

  return (
    <div className="p-5 sm:p-6 rounded-[20px] bg-surface border border-line flex flex-col justify-start">
      <dd className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-text tracking-tight mb-2">
        {displayValue}
      </dd>
      <dt className="text-xs uppercase tracking-[0.14em] text-muted font-medium">
        {item.label}
      </dt>
    </div>
  );
}

export function Metrics({ items }: { items: Metric[] }) {
  const containerRef = useRef<HTMLDListElement | null>(null);
  const [inView, setInView] = useState(false);
  const prefersReduced = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setInView(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (!items || items.length === 0) return null;

  return (
    <dl
      ref={containerRef}
      className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 my-8 first:mt-0 last:mb-0"
    >
      {items.map((item, index) => (
        <StatTile
          key={`${item.label}-${index}`}
          item={item}
          inView={inView}
          prefersReduced={prefersReduced}
        />
      ))}
    </dl>
  );
}
