"use client";

import { type ReactNode } from "react";

export function CardSpotlight({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <article className={className}>
      {children}
    </article>
  );
}
