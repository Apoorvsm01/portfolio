import type { MetadataRoute } from "next";
import { site } from "../../content/site";

export const dynamic = "force-static";

// Everything is public and meant to be found, including by AI search and assistant crawlers.
// Note: crawlers only read robots.txt at a domain's root. Under GitHub Pages' /portfolio path this file
// is served at /portfolio/robots.txt, so it takes effect once the site moves to its own domain.
const aiCrawlers = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "Bingbot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/" }, ...aiCrawlers.map((userAgent) => ({ userAgent, allow: "/" }))],
    sitemap: `${site.url}/sitemap.xml`,
  };
}
