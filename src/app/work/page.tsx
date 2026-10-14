import type { Metadata } from "next";
import { site } from "../../../content/site";
import { WorkIndex } from "../../components/WorkIndex";

export const metadata: Metadata = {
  title: "Work",
  description: "Case studies in automotive, spatial, and health UX by Apoorv Mahajan.",
  alternates: {
    canonical: "/work/",
  },
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
  return <WorkIndex />;
}
