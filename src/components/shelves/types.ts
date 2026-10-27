export type ProjectCard = {
  slug: string;
  href: string;
  title: string;
  claim: string;
  org?: string;
  domain: string;
  flag: "amber" | "blue" | "lime" | "pink" | "teal" | "violet" | "yellow";
  cover?: { src: string; alt: string; width: number; height: number; fit: "cover" | "contain" };
};
