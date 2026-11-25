import type { Metadata } from "next";
import { brainCopy } from "../../../content/brain/copy";
import { RedirectToHome } from "../../components/brain/RedirectToHome";
import { BASE_PATH } from "../../lib/asset";

// The second brain is the home page now. This page stays so old links keep working.
export const metadata: Metadata = {
  title: brainCopy.moved.title,
  alternates: { canonical: "/" },
  robots: { index: false, follow: true },
};

export default function BrainMovedPage() {
  return (
    <main id="main" className="flex-1 w-full bg-ground">
      <meta httpEquiv="refresh" content={`0; url=${BASE_PATH}/`} />
      <div className="container-page brain-header">
        <h1 className="brain-title">{brainCopy.moved.title}</h1>
        <p className="brain-lede">{brainCopy.moved.body}</p>
        <RedirectToHome />
      </div>
    </main>
  );
}
