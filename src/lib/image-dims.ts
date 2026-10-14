import imageDimsData from "../../content/image-dims.json";

/**
 * Returns the intrinsic width and height for an image asset from content/image-dims.json.
 */
export function imageDims(src: string): { width: number; height: number } {
  const normalized = src.startsWith("/") ? src : `/${src}`;
  const record = imageDimsData as Record<string, number[]>;
  const dims = record[normalized] ?? record[src];
  if (dims && typeof dims[0] === "number" && typeof dims[1] === "number") {
    return { width: dims[0], height: dims[1] };
  }
  return { width: 1200, height: 800 };
}
