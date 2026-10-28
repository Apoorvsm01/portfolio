import type { MetadataRoute } from "next";
import { site } from "../../content/site";
import { getAllStudies } from "../lib/content";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const page = (path: string, priority: number): MetadataRoute.Sitemap[number] => ({
    url: `${site.url}${path}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority,
  });
  return [
    page("/", 1),
    page("/work/", 0.9),
    page("/about/", 0.8),
    page("/personal/", 0.7),
    ...getAllStudies().map((s) => page(`/work/${s.slug}/`, s.slug === site.featured.slug ? 0.9 : 0.7)),
  ];
}
