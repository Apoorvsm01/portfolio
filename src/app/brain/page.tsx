import type { Metadata } from "next";
import { site } from "../../../content/site";
import { brainCopy } from "../../../content/brain/copy";
import { BrainExplorer } from "../../components/brain/BrainExplorer";

export const metadata: Metadata = {
  title: brainCopy.meta.title,
  description: brainCopy.meta.description,
  alternates: { canonical: "/brain/" },
  openGraph: {
    title: `${brainCopy.meta.title} — ${site.name}`,
    description: brainCopy.meta.description,
    url: `${site.url}/brain/`,
  },
};

export default function BrainPage() {
  return (
    <main id="main" className="flex-1 w-full bg-ground">
      <header className="container-page brain-header">
        <h1 className="brain-title">{brainCopy.title}</h1>
        <p className="brain-lede">{brainCopy.lede}</p>
      </header>
      <BrainExplorer />
    </main>
  );
}
