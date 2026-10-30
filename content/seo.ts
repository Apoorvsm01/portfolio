// How the site describes Apoorv to search engines and AI crawlers: page titles, the meta description,
// structured data (JSON-LD), the share image and llms.txt. Everything here must stay true to the rest of
// content/; it is a summary, not new claims. The role line is positioning Apoorv chose for job searches.

export const seo = {
  // Shown in search results and browser tabs. Keep the name first; roles people search for after it.
  title: "Apoorv Mahajan — Senior Product Designer & UX Engineer",
  // About 155 characters, so search results show it whole.
  description:
    "Senior product designer and UX engineer, open to relocation in the United States. I research, design and build in-car AI, voice and spatial products, from Woven by Toyota to Apple Vision Pro.",
  // Visible under the name in the home hero, and the job title in structured data.
  roleLine: "Senior Product Designer & UX Engineer",
  jobTitle: "Senior Product Designer and UX Engineer",
  // Titles recruiters search for, all backed by the timeline in site.ts.
  roles: ["UX Engineer", "Product Designer", "UX Designer", "UI/UX Designer", "UX Researcher", "Design Technologist"],
  // Skills and domains the case studies demonstrate.
  knowsAbout: [
    "User experience design",
    "Product design",
    "UI design",
    "Interaction design",
    "UX research",
    "Usability testing",
    "Voice user interfaces",
    "Conversational AI",
    "In-vehicle HMI",
    "Automotive UX",
    "Spatial computing",
    "Apple Vision Pro",
    "visionOS",
    "Meta Quest",
    "Augmented reality",
    "Health tech",
    "Design systems",
    "Prototyping",
    "Figma",
    "React",
    "TypeScript",
    "SwiftUI",
    "Flutter",
  ],
  location: { country: "US" },
  worksFor: "Woven by Toyota",
  alumniOf: ["DePaul University", "Symbiosis Centre for Media and Communication"],
  // Static share card in public/ (generated from scripts/og-card.html).
  ogImage: { path: "/og.png", width: 1200, height: 630, alt: "Apoorv Mahajan, Senior Product Designer and UX Engineer" },
  // Small status shown beside the name on the home page.
  status: "Looking for my next team",
} as const;
