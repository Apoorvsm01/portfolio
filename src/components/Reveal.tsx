"use client";

import { useEffect, useRef, ReactNode, CSSProperties, HTMLAttributes } from "react";

type SupportedTag =
  | "div"
  | "section"
  | "article"
  | "aside"
  | "header"
  | "footer"
  | "main"
  | "p"
  | "span"
  | "li"
  | "ul"
  | "ol";

interface RevealProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  as?: SupportedTag;
  index?: number;
}

export function Reveal({
  children,
  as: Tag = "div",
  className = "",
  index,
  style,
  ...rest
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // If already revealed or user prefers reduced motion, reveal immediately
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      element.setAttribute("data-revealed", "true");
      return;
    }

    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      element.setAttribute("data-revealed", "true");
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.setAttribute("data-revealed", "true");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -40px 0px",
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

  const combinedStyle: CSSProperties = {
    ...(index !== undefined ? ({ "--i": index } as CSSProperties) : {}),
    ...style,
  };

  const Component = Tag as "div";

  return (
    <Component
      ref={(node: HTMLElement | null) => {
        ref.current = node;
      }}
      data-reveal=""
      style={combinedStyle}
      className={className}
      {...rest}
    >
      {children}
    </Component>
  );
}
