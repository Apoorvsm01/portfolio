/* eslint-disable @next/next/no-img-element */
import type { ComponentProps } from "react";
import { asset } from "../lib/asset";
import { imageDims } from "../lib/image-dims";

type Props = Omit<ComponentProps<"img">, "src" | "alt"> & { src: string; alt: string };

// A plain <img> for the static export: base path applied, intrinsic size from content/image-dims.json,
// lazy by default (pass loading="eager" for the first screen).
export function Img({ src, alt, width, height, loading = "lazy", decoding = "async", ...rest }: Props) {
  const dims = imageDims(src);
  return (
    <img
      src={asset(src)}
      alt={alt}
      width={width ?? dims.width}
      height={height ?? dims.height}
      loading={loading}
      decoding={decoding}
      {...rest}
    />
  );
}
