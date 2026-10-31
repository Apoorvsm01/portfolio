/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useRef, useEffect, ComponentProps } from "react";
import { asset } from "@/lib/asset";

export function FadeImage({
  alt = "",
  className = "",
  onLoad,
  src,
  ...props
}: ComponentProps<"img">) {
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    if (imgRef.current?.complete) {
      setLoaded(true);
    }
  }, []);

  return (
    <img
      ref={imgRef}
      alt={alt}
      src={typeof src === "string" ? asset(src) : src}
      {...props}
      onLoad={(e) => {
        setLoaded(true);
        onLoad?.(e);
      }}
      data-loaded={loaded ? "true" : undefined}
      className={`fade-image ${className}`}
    />
  );
}
