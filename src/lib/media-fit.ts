import { imageDims } from "./image-dims";

// Tall phone-shaped captures from the Duo phase get a height cap so they never fill the screen.
// Scoped to /duo/ assets so older case studies keep their existing layout.
export function isTallDuo(src: string): boolean {
  if (!src.includes("/duo/")) return false;
  const { width, height } = imageDims(src);
  return height > width * 1.2;
}

export const TALL_CAP = "max-h-[75vh] sm:max-h-[640px] w-auto max-w-full mx-auto block";
