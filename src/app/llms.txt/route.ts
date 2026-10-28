import { site } from "../../../content/site";
import { seo } from "../../../content/seo";
import { studyMeta } from "../../../content/study-meta";
import { getAllStudies } from "../../lib/content";

// llms.txt (https://llmstxt.org): a plain-language summary that AI assistants and crawlers can read
// without running JavaScript. Built from content/ at build time, so it always matches the site.
export const dynamic = "force-static";

function body(): string {
  const lines: string[] = [];
  const work = (slug: string) => site.work.find((w) => w.slug === slug) as { org?: string; domain?: string } | undefined;

  lines.push(`# ${site.name}`, "");
  lines.push(`> ${seo.description}`, "");
  lines.push(`- Roles: ${seo.roles.join(", ")}`);
  lines.push(`- Location: ${site.location}`);
  lines.push(`- Status: ${site.cta.headline} ${site.cta.body}`);
  lines.push(`- Email: ${site.email}`);
  lines.push(`- LinkedIn: ${site.linkedin}`);
  lines.push(`- GitHub: ${site.github}`);
  lines.push(`- Portfolio: ${site.url}/`, "");

  lines.push("## About", "", site.hero.intro, "");

  lines.push("## Case studies", "");
  for (const study of getAllStudies()) {
    const meta = studyMeta[study.slug];
    const ref = work(study.slug);
    const org = ref?.org ?? (study.slug === site.featured.slug ? site.featured.org : undefined);
    const context = [org, ref?.domain ?? (study.slug === site.featured.slug ? site.featuredDomain : undefined)].filter(Boolean).join(", ");
    lines.push(`- [${study.title}](${site.url}/work/${study.slug}/): ${meta?.claim ?? study.description}${context ? ` (${context})` : ""}`);
    for (const outcome of meta?.outcomes?.items ?? []) {
      lines.push(`  - ${outcome.from ? `${outcome.from} to ` : ""}${outcome.value} ${outcome.label}`);
    }
  }
  lines.push(`- [${site.personal.lead.title}](${site.url}/personal/): ${site.personal.lead.claim} (Personal project)`, "");

  lines.push("## How I work", "", site.howIWorkIntro, "");
  for (const step of site.howIWork) lines.push(`- ${step.title}: ${step.body}`);
  lines.push("");

  lines.push("## Experience", "");
  for (const t of site.timeline) {
    const note = "note" in t && t.note ? ` ${t.note}` : "";
    lines.push(`- ${t.years}: ${t.role}, ${t.org}.${note}`);
  }
  lines.push("");

  lines.push("## Skills and domains", "", seo.knowsAbout.join(", "), "");
  lines.push("## Platforms designed for", "", site.platforms.join(", "), "");
  return lines.join("\n");
}

export function GET() {
  return new Response(body(), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
