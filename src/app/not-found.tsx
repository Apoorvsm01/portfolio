import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <main id="main" className="flex-1 w-full cs-head" style={{ alignContent: "center" }}>
      <h1 className="display">Page not found</h1>
      <p className="lead-p">The page you’re looking for doesn’t exist or has moved.</p>
      <p>
        <Link href="/" className="btn">
          <span aria-hidden="true">←</span> Return home
        </Link>
      </p>
    </main>
  );
}
