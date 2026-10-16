import { Hero } from "../components/Hero";
import { Featured } from "../components/Featured";
import { PersonalWork } from "../components/PersonalWork";
import { SelectedWork } from "../components/SelectedWork";
import { HowIWork } from "../components/HowIWork";
import { AboutTeaser } from "../components/AboutTeaser";
import { HeadsetWall } from "../components/HeadsetWall";
import { getAllStudies, coverFor, imageDims } from "../lib/content";
import { studyMeta } from "../../content/study-meta";
import { site } from "../../content/site";

export default function Home() {
  const allStudies = getAllStudies();
  const studyDataMap: Record<
    string,
    {
      slug: string;
      title: string;
      claim: string;
      coverSrc: string;
      coverAlt: string;
      coverWidth: number;
      coverHeight: number;
    }
  > = {};

  for (const s of allStudies) {
    const meta = studyMeta[s.slug];
    const coverInfo = coverFor(s.slug);
    const coverImg = coverInfo?.img;
    const dims = coverImg ? imageDims(coverImg.src) : { width: 1200, height: 800 };

    studyDataMap[s.slug] = {
      slug: s.slug,
      title: s.title,
      claim: meta?.claim ?? s.description,
      coverSrc: coverImg?.src ?? "",
      coverAlt: coverImg?.alt ?? s.title,
      coverWidth: dims.width,
      coverHeight: dims.height,
    };
  }

  const portraitDims = imageDims(site.hero.image.src);

  return (
    <main id="main" className="flex-1 w-full">
      <Hero studyDataMap={studyDataMap} portraitDims={portraitDims} />
      <Featured />
      <PersonalWork />
      <SelectedWork />
      <HowIWork />
      <HeadsetWall />
      <AboutTeaser />
    </main>
  );
}
