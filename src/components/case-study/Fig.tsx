import { Img } from "../Img";
import { imageDims } from "../../lib/image-dims";

// One picture on a flat field with an optional one-sentence caption. Tall phone screens are capped in height.
export function Fig({
  src,
  alt,
  caption,
  contain = false,
  eager = false,
}: {
  src: string;
  alt: string;
  caption?: string;
  contain?: boolean;
  eager?: boolean;
}) {
  const { width, height } = imageDims(src);
  const tall = height / width > 1.15;
  return (
    <figure className={`fig${tall ? " fig--tall" : ""}${contain || src.endsWith(".svg") ? " fig--contain" : ""}`}>
      <div className="fig__frame">
        <Img src={src} alt={alt} loading={eager ? "eager" : "lazy"} />
      </div>
      {caption && caption.trim() !== "" && <figcaption className="small">{caption}</figcaption>}
    </figure>
  );
}
