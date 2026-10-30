import type { Metadata } from "next";
import { site } from "../../../content/site";
import { WorkIndex } from "../../components/WorkIndex";
import { getIndexRows } from "../../lib/rows";

export const metadata: Metadata = {
  title: "Work",
  description: "Case studies in automotive, spatial, and health UX by Apoorv Mahajan.",
  alternates: { canonical: "/work/" },
  openGraph: {
    title: `Work — ${site.name}`,
    description: "Case studies in automotive, spatial, and health UX by Apoorv Mahajan.",
    url: `${site.url}/work/`,
    siteName: site.name,
    locale: "en_US",
    type: "website",
  },
};

export default function WorkPage() {
  return (
    <main id="main" className="flex-1 w-full">
      <WorkIndex
        id="work"
        asPage
        title="Work"
        intro="Cars, headsets and health, newest first. The picture follows the project you are reading."
        rows={getIndexRows()}
      />
    </main>
  );
}
