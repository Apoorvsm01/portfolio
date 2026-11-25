"use client";

import Link from "next/link";
import { useEffect } from "react";
import { brainCopy } from "../../../content/brain/copy";
import { BASE_PATH } from "../../lib/asset";

// /brain/ moved to the home page. Static export has no server redirects, so the page sends the browser on
// itself, keeping the query string so shared filter links still open the same view.
export function RedirectToHome() {
  useEffect(() => {
    window.location.replace(`${BASE_PATH}/${window.location.search}`);
  }, []);
  return (
    <p className="brain-moved">
      <Link href="/" className="ask-brain-link">
        {brainCopy.moved.link} →
      </Link>
    </p>
  );
}
