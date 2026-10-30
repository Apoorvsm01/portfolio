import { createElement } from "react";
import { site } from "../../content/site";
import { seo } from "../../content/seo";
import type { CaseStudy } from "../../content/types";

// schema.org JSON-LD: tells search engines and AI crawlers who Apoorv is and what each case study is,
// in a form they parse directly instead of guessing from page text.

const personId = `${site.url}/#person`;
const websiteId = `${site.url}/#website`;
const abs = (path: string) => (path.startsWith("http") ? path : `${site.url}${path}`);

export function personNode() {
  return {
    "@type": "Person",
    "@id": personId,
    name: site.name,
    givenName: "Apoorv",
    familyName: "Mahajan",
    url: `${site.url}/`,
    image: abs(site.hero.image.src),
    jobTitle: seo.jobTitle,
    description: seo.description,
    email: `mailto:${site.email}`,
    address: {
      "@type": "PostalAddress",
      addressCountry: seo.location.country,
    },
    worksFor: { "@type": "Organization", name: seo.worksFor },
    alumniOf: seo.alumniOf.map((name) => ({ "@type": "CollegeOrUniversity", name })),
    hasOccupation: seo.roles.map((name) => ({ "@type": "Occupation", name })),
    knowsAbout: [...seo.knowsAbout],
    sameAs: [site.linkedin, site.github],
  };
}

export function siteGraph() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      personNode(),
      {
        "@type": "WebSite",
        "@id": websiteId,
        url: `${site.url}/`,
        name: `${site.name} portfolio`,
        description: seo.description,
        inLanguage: "en-US",
        publisher: { "@id": personId },
        about: { "@id": personId },
      },
    ],
  };
}

// Only on the home page: it is the page about Apoorv.
export function profilePageGraph() {
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "@id": `${site.url}/#profile`,
    url: `${site.url}/`,
    name: seo.title,
    isPartOf: { "@id": websiteId },
    mainEntity: { "@id": personId },
  };
}

export function caseStudyGraph(study: CaseStudy, claim: string, image?: string) {
  const url = `${site.url}/work/${study.slug}/`;
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "@id": `${url}#work`,
    url,
    name: study.title,
    headline: study.title,
    description: claim,
    genre: "UX case study",
    keywords: study.tags.join(", "),
    ...(image ? { image: abs(image) } : {}),
    author: { "@id": personId, "@type": "Person", name: site.name, url: `${site.url}/` },
    creator: { "@id": personId },
    isPartOf: { "@id": websiteId },
    inLanguage: "en-US",
  };
}

// Serialises safely: "<" is escaped so content can never close the script tag early.
export function JsonLd({ data }: { data: unknown }) {
  return createElement("script", {
    type: "application/ld+json",
    dangerouslySetInnerHTML: { __html: JSON.stringify(data).replace(/</g, "\\u003c") },
  });
}
