import type { Block, Section } from "../../../content/types";
import { Fig } from "./Fig";
import { LoopVideo } from "./LoopVideo";
import { RichText } from "./RichText";
import { imageDims } from "../../lib/image-dims";

function renderListItem(item: string) {
  const match = item.match(/^([^:\n]+):\s*(.*)$/);
  if (match) {
    const [, term, rest] = match;
    if (!/^(https?|ftp)$/i.test(term)) {
      return (
        <>
          <strong className="strong">{term}</strong>: <RichText text={rest} />
        </>
      );
    }
  }
  return <RichText text={item} />;
}

export function BlockRenderer({ block, studyTitle = "", sectionLabel = "" }: { block: Block; studyTitle?: string; sectionLabel?: string }) {
  const label = sectionLabel.trim();
  const fallbackAlt = label ? `${studyTitle}: ${label}` : `${studyTitle} screenshot`;

  switch (block.type) {
    case "heading":
      // A heading that only repeats its section label adds nothing.
      if (label && block.text.trim().toLowerCase() === label.toLowerCase()) return null;
      return <h4 className="lead">{block.text}</h4>;

    case "paragraph":
      return (
        <p style={{ whiteSpace: "pre-line" }}>
          <RichText text={block.text} />
        </p>
      );

    case "list":
      return (
        <ul className="list">
          {block.items.map((item, i) => (
            <li key={i}>{renderListItem(item)}</li>
          ))}
        </ul>
      );

    case "images": {
      if (!block.images?.length) return null;
      return (
        <div className="imgs">
          {block.images.map((img, i) => (
            <Fig key={i} src={img.src} alt={img.alt?.trim() ? img.alt : fallbackAlt} />
          ))}
        </div>
      );
    }

    case "figure":
      return <Fig src={block.image.src} alt={block.image.alt?.trim() || block.caption || fallbackAlt} caption={block.caption} />;

    case "loop": {
      const d = imageDims(block.poster);
      return (
        <figure className="fig">
          <div className="fig__frame">
            <LoopVideo src={block.src} poster={block.poster} label={block.caption?.trim() || `${studyTitle} looping demo`} width={d.width} height={d.height} />
          </div>
          {block.caption?.trim() && <figcaption className="small">{block.caption}</figcaption>}
        </figure>
      );
    }

    case "cards":
      return (
        <div className="tiles">
          {block.cards.map((card, i) => (
            <div key={i}>
              <h4 className="strong">{card.label}</h4>
              {card.value.split("\n").map((line, j) => (
                <p key={j} className="muted">
                  {line}
                </p>
              ))}
            </div>
          ))}
        </div>
      );

    case "metrics":
      return (
        <div className="cs-figures">
          {block.items.map((m, i) => (
            <div key={i}>
              <strong>{m.value}</strong>
              <p>{m.label}</p>
            </div>
          ))}
        </div>
      );

    case "bento":
      return (
        <div className="tiles">
          {block.items.map((t, i) => (
            <div key={i}>
              <h4 className="strong">{t.title}</h4>
              {t.source.map((b, j) => (
                <BlockRenderer key={j} block={b} studyTitle={studyTitle} sectionLabel={label} />
              ))}
            </div>
          ))}
        </div>
      );

    case "widgets":
      return (
        <div className="tiles">
          {block.items.map((w, i) => (
            <div key={i}>
              <Fig src={w.preview.src} alt={w.preview.alt?.trim() || `${w.title}: ${w.subtitle}`} />
              <h4 className="strong">{w.title}</h4>
              <p className="muted">{w.subtitle}</p>
              {(["swiftui", "flutter", "tailwind"] as const).map((k) => (
                <details key={k} className="code">
                  <summary className="link">{k === "swiftui" ? "SwiftUI" : k === "flutter" ? "Flutter" : "Tailwind"} code</summary>
                  <pre>
                    <code>{w.code[k]}</code>
                  </pre>
                </details>
              ))}
            </div>
          ))}
        </div>
      );

    case "devices":
      return (
        <div className="imgs">
          {block.items.map((d, i) => (
            <Fig key={i} src={d.src} alt={d.alt} caption={d.caption} />
          ))}
        </div>
      );

    case "video":
      return (
        <div className="prototype__frame" style={{ aspectRatio: "16 / 9" }}>
          <iframe
            src={`https://player.vimeo.com/video/${block.vimeoId}?autoplay=1&muted=1&loop=1&background=1`}
            title={`${studyTitle}${label ? `: ${label}` : ""} video`}
            loading="lazy"
            allow="autoplay; fullscreen"
          />
        </div>
      );

    case "embed":
      return (
        <div className="prototype__frame" style={{ aspectRatio: "16 / 10" }}>
          <iframe src={block.src} title={`${studyTitle} interactive prototype`} loading="lazy" allow="autoplay; fullscreen" />
        </div>
      );

    default:
      return null;
  }
}

// One section of the long material, under "Full notes".
export function NoteSection({ section, index, studyTitle }: { section: Section; index: number; studyTitle: string }) {
  const label = section.label?.trim() || "Introduction";
  return (
    <section id={`section-${index}`} className="note-sec" aria-labelledby={`note-${index}`}>
      <h3 id={`note-${index}`} className="lead">
        {label}
      </h3>
      <div className="note-sec__body">
        {section.blocks.map((b, i) => (
          <BlockRenderer key={i} block={b} studyTitle={studyTitle} sectionLabel={section.label} />
        ))}
      </div>
    </section>
  );
}
