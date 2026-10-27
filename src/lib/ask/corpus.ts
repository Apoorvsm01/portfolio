import type { Block, CaseStudy } from "../../../content/types";
import type { site as Site } from "../../../content/site";
import type { StudyMeta } from "../../../content/study-meta";
import type { personal as Personal } from "../../../content/personal";
import type { Chunk } from "./types";

export type CorpusInput = {
  site: typeof Site;
  studies: CaseStudy[];
  studyMeta: Record<string, StudyMeta>;
  personal: typeof Personal;
};

const clean = (s: string) => s.replace(/\s+/g, " ").trim();

// Personal-page keys that hold media paths or alt text, not copy.
const SKIP_KEYS = new Set(["src", "alt", "poster", "video", "videoLabel", "caption", "version"]);

function leafStrings(node: unknown, out: string[] = []): string[] {
  if (typeof node === "string") {
    if (!node.startsWith("/")) out.push(node);
  } else if (Array.isArray(node)) {
    node.forEach((n) => leafStrings(n, out));
  } else if (node && typeof node === "object") {
    for (const [key, value] of Object.entries(node)) {
      if (!SKIP_KEYS.has(key)) leafStrings(value, out);
    }
  }
  return out;
}

function blockText(block: Block): string {
  switch (block.type) {
    case "paragraph":
      return block.text;
    case "list":
      return block.items.join(". ");
    case "metrics":
      return block.items.map((m) => `${m.value} ${m.label}`).join(". ");
    case "cards":
      return block.cards.map((c) => `${c.label}: ${c.value}`).join(". ");
    case "widgets":
      return block.items.map((w) => `${w.title}: ${w.subtitle}`).join(". ");
    case "figure":
      return block.caption ?? "";
    case "devices":
      return block.caption ?? "";
    default:
      return "";
  }
}

export function buildCorpus({ site, studies, studyMeta, personal }: CorpusInput): Chunk[] {
  const chunks: Chunk[] = [];
  const add = (chunk: Chunk) => {
    const text = clean(chunk.text);
    if (text) chunks.push({ ...chunk, text, title: clean(chunk.title) });
  };

  for (const study of studies) {
    const { slug, title, tags } = study;
    const href = `/work/${slug}/`;
    const org = site.work.find((w) => w.slug === slug)?.org;
    const base = { slug, tags, href };

    add({
      ...base,
      id: `${slug}:overview`,
      kind: "study",
      title,
      label: title,
      text: `${title}${org ? `, at ${org}` : ""}: ${study.description} How might we ${study.hmw}`,
    });

    const facts = study.facts.map((f) => `${f.label}: ${f.value}`).join(". ");
    if (facts) add({ ...base, id: `${slug}:facts`, kind: "facts", title, label: `${title} · Facts`, text: facts });

    const meta = studyMeta[slug];
    if (meta) {
      const outcomes = meta.outcomes
        ? [
            meta.outcomes.title,
            ...meta.outcomes.items.map((o) => `${o.from ? `${o.from} to ` : ""}${o.value} ${o.label}`),
            meta.outcomes.note ?? "",
          ].join(". ")
        : "";
      const metaFacts = meta.facts.map((f) => `${f.label}: ${f.value}`).join(". ");
      add({
        ...base,
        id: `${slug}:summary`,
        kind: "summary",
        title,
        label: `${title} · Summary`,
        text: [meta.claim, metaFacts, outcomes].filter(Boolean).join(" "),
      });
    }

    study.sections.forEach((section, si) => {
      let heading = section.label;
      const sectionHref = `${href}#section-${si}`;
      section.blocks.forEach((block, bi) => {
        if (block.type === "heading") {
          heading = block.text;
          return;
        }
        const label = `${title} · ${heading || section.label || "Overview"}`;
        const common = { ...base, href: sectionHref, kind: "study" as const, title: heading || title, label };
        if (block.type === "bento") {
          block.items.forEach((tile, ti) =>
            add({
              ...common,
              id: `${slug}:s${si}:b${bi}:t${ti}`,
              title: heading && heading !== tile.title ? `${heading}. ${tile.title}` : tile.title,
              text: `${tile.title}. ${tile.condensed}`,
            }),
          );
          return;
        }
        add({ ...common, id: `${slug}:s${si}:b${bi}`, text: blockText(block) });
      });
    });
  }

  const profile = (id: string, text: string, label: string, href: string, kind: Chunk["kind"] = "profile") =>
    add({ id, kind, text, title: label, label, href, tags: [] });

  profile("site:hero", `${site.hero.headline} ${site.hero.intro}`, "About Apoorv", "/about/");
  profile(
    "site:contact",
    `Contact. Email ${site.email}. LinkedIn ${site.linkedin}. GitHub ${site.github}. Based in ${site.location}. ${site.cta.headline} ${site.cta.body}`,
    "Get in touch",
    `mailto:${site.email}`,
  );

  for (const intent of site.intents) {
    const href = `/work/${intent.links[0]}/`.replace("/work/good-roommate/", "/personal/");
    add({ id: `intent:${intent.id}`, kind: "intent", title: intent.label, label: intent.label, href, tags: [], text: `${intent.headline} ${intent.answer}` });
    intent.bullets.forEach((bullet, i) =>
      add({ id: `intent:${intent.id}:${i}`, kind: "intent", title: intent.label, label: intent.label, href, tags: [], text: bullet }),
    );
  }

  add({
    id: "featured:lede",
    kind: "study",
    slug: site.featured.slug,
    title: site.featured.headline,
    label: "Generative Drive Coach",
    href: `/work/${site.featured.slug}/`,
    tags: [],
    text: `${site.featured.summary} ${site.featured.lede.join(" ")}`,
  });
  for (const chapter of site.featured.chapters) {
    add({ id: `featured:${chapter.term}`, kind: "study", slug: site.featured.slug, title: chapter.term, label: `Generative Drive Coach · ${chapter.term}`, href: chapter.href, tags: [], text: `${chapter.term}. ${chapter.line}` });
  }

  profile("process:intro", `${site.howIWorkIntro} ${site.howIWork.map((s) => `${s.title}. ${s.body}`).join(" ")}`, "How I work", "/about/", "process");
  site.howIWork.forEach((step, i) => profile(`process:${i}`, `${step.title}. ${step.body}`, `How I work · ${step.title}`, "/about/", "process"));

  profile(
    "timeline:all",
    `${site.timelineIntro} ${site.timeline.map((t) => `${t.years}: ${t.role}, ${t.org}.${"note" in t && t.note ? ` ${t.note}` : ""}`).join(" ")}`,
    "Experience",
    "/about/",
    "timeline",
  );
  site.timeline.forEach((t, i) =>
    profile(`timeline:${i}`, `${t.years}: ${t.role}, ${t.org}.${"note" in t && t.note ? ` ${t.note}` : ""}`, `Experience · ${t.org}`, "/about/", "timeline"),
  );
  profile("site:platforms", `${site.platformsNote} Platforms: ${site.platforms.join(", ")}.`, "Platforms", "/about/");

  // Good Roommate and other personal-page copy, one chunk per section, long sections split by sentence.
  const lead = site.personal.lead;
  add({
    id: "personal:lead",
    kind: "personal",
    slug: "good-roommate",
    title: lead.title,
    label: lead.title,
    href: "/personal/",
    tags: ["Personal project", "SwiftUI", "iPhone Duo"],
    text: `${lead.title}. ${lead.claim} ${lead.points.join(". ")}`,
  });
  for (const [key, value] of Object.entries(personal)) {
    if (typeof value !== "object" || value === null) {
      add({ id: `personal:${key}`, kind: "personal", slug: "good-roommate", title: "Personal projects", label: "Personal projects", href: "/personal/", tags: [], text: String(value) });
      continue;
    }
    const strings = leafStrings(value);
    const label = (value as { title?: string; headline?: string }).title ?? (value as { headline?: string }).headline ?? key;
    let buffer = "";
    let part = 0;
    const flush = () => {
      if (buffer.trim()) {
        add({ id: `personal:${key}:${part++}`, kind: "personal", slug: "good-roommate", title: label, label: `The Good Roommate · ${label}`, href: "/personal/", tags: ["Personal project"], text: buffer });
      }
      buffer = "";
    };
    for (const s of strings) {
      if (buffer.length + s.length > 480) flush();
      buffer += `${buffer ? " " : ""}${s}`;
    }
    flush();
  }

  return chunks;
}
