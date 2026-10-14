/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useRef, useEffect, ComponentProps } from "react";

export function FadeImage({
  alt = "",
  className = "",
  onLoad,
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
