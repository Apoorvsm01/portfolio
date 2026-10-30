// What the home page and /work/ show for each project: the index row (company, role, years, one-line
// claim comes from study-meta) and the picture the sticky stage crossfades to. Everything here restates
// facts that already appear in site.ts, study-meta.ts or the case studies.

export type StagePicture = {
  src: string;
  alt: string;
  fit?: "cover" | "contain";
  bg?: string; // field behind a contained picture
  video?: string; // muted loop; src is then its poster
  position?: string; // object-position for a cropped picture
};

export type ProjectRow = {
  slug: string; // case-study slug, or "good-roommate"
  title: string;
  company: string;
  role: string;
  years?: string;
  href: string;
  stage: StagePicture;
};

export const projectRows: ProjectRow[] = [
  {
    slug: "woven",
    title: "Generative Drive Coach",
    company: "Woven by Toyota",
    role: "UX engineer",
    years: "2025 to 2026",
    href: "/work/woven/",
    stage: { src: "/work/woven/01.jpg", alt: "View from the driver's seat of a car on a country road, with the instrument cluster and a phone navigation display" },
  },
  {
    slug: "fleet-console",
    title: "Fleet Console",
    company: "Woven by Toyota",
    role: "Concept, self-initiated",
    href: "/work/fleet-console/",
    stage: {
      src: "/work/fleet-console/reel.jpg",
      video: "/work/fleet-console/reel.mp4",
      alt: "Fleet Console motion reel: the Now screen, an escalation acknowledged, the iPhone takeover, then an in-vehicle tag.",
      position: "left top",
    },
  },
  {
    slug: "how2to",
    title: "How2To",
    company: "Omnia",
    role: "UI design and UX research",
    years: "2024 to 2025",
    href: "/work/how2to/",
    stage: { src: "/work/how2to/03.png", alt: "A spatial tutorial for Vision Pro with an ingredients panel floating in a kitchen" },
  },
  {
    slug: "omniabrowser",
    title: "Omnia Spatial Browser",
    company: "Omnia",
    role: "UI design and UX research",
    years: "2024 to 2025",
    href: "/work/omniabrowser/",
    stage: { src: "/work/omniabrowser/02.png", alt: "A spatial web page with an image carousel and an AI summary panel, in a Vision Pro room" },
  },
  {
    slug: "spatialshowroom",
    title: "Spatial Showroom",
    company: "Omnia",
    role: "UI design and UX research",
    years: "2024",
    href: "/work/spatialshowroom/",
    stage: { src: "/work/spatialshowroom/01.png", alt: "A virtual car showroom in Vision Pro with a model picker" },
  },
  {
    slug: "syncare-ai-health",
    title: "SynCare AI",
    company: "Patched Reality",
    role: "UX design and research",
    years: "2024",
    href: "/work/syncare-ai-health/",
    stage: { src: "/work/syncare-ai-health/01.png", alt: "SynCare AI mobile screens on a dark ground", fit: "contain", bg: "#0b1210" },
  },
  {
    slug: "sitelens",
    title: "SiteLens AR",
    company: "Omnia",
    role: "UX design and research",
    years: "2024 to 2025",
    href: "/work/sitelens/",
    stage: { src: "/work/sitelens/02.png", alt: "A pair of smart glasses on a dark ground" },
  },
  {
    slug: "just-fill-it",
    title: "Just Fill it!",
    company: "Side project",
    role: "Designer and builder",
    years: "2026",
    href: "/work/just-fill-it/",
    stage: { src: "/work/just-fill-it/panel-glass-done-light.png", alt: "The Just Fill it! panel in Safari, in Liquid Glass, with a finished resume ready to attach" },
  },
  {
    slug: "design-crew",
    title: "Design Crew",
    company: "Side project",
    role: "Designer",
    years: "2026",
    href: "/work/design-crew/",
    stage: { src: "/work/design-crew/pipeline.svg", alt: "The agent pipeline: each arrow is a file one agent hands the next, with two human gates.", fit: "contain", bg: "#25231f" },
  },
  {
    slug: "good-roommate",
    title: "The Good Roommate",
    company: "Side project",
    role: "Product, UX and UI",
    years: "2026",
    href: "/personal/",
    stage: { src: "/work/good-roommate/process/now-up-next.png", alt: "The Good Roommate on the folded iPhone Duo: Up next, with the most overdue chore aimed at by the camera", fit: "contain", bg: "#25231f" },
  },
];

export function stageFor(slug: string): StagePicture | undefined {
  return projectRows.find((p) => p.slug === slug)?.stage;
}

// The slow crossfade at the top of the home page: Drive Coach, in four pictures that already sit in its case study.
export const heroPictures: StagePicture[] = [
  { src: "/work/woven/01.jpg", alt: "View from the driver's seat of a car on a country road, with the instrument cluster and a phone navigation display" },
  { src: "/work/woven/03.jpg", alt: "A person driving in a simulator rig with a steering wheel and screens", position: "70% 40%" },
  { src: "/work/woven/12.jpg", alt: "A simulator rig with a racing seat, two monitors and pedals" },
  { src: "/work/woven/11.jpg", alt: "A racing simulator with a seat and three screens" },
];
