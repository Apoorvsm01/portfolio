import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page not found",
};

export default function NotFound() {
  return (
    <main
      id="main"
      className="max-w-[72rem] w-full mx-auto px-4 sm:px-6 lg:px-8 flex-1 flex flex-col items-center justify-center py-24 sm:py-32 text-center"
    >
      <p className="text-xs uppercase tracking-[0.14em] text-accent font-semibold mb-3">
        404
      </p>
      <h1 className="font-display text-[clamp(2.5rem,5vw,4rem)] font-bold tracking-tight text-text mb-8">
        Page not found
      </h1>
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-text text-bg font-medium text-sm hover:opacity-90 transition-opacity"
      >
        <span aria-hidden="true">←</span>
        <span>All work</span>
      </Link>
    </main>
  );
}
