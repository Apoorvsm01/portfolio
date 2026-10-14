import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page not found",
};

export default function NotFound() {
  return (
    <main
      id="main"
      className="container-page flex-1 flex flex-col items-center justify-center py-24 sm:py-32 text-center"
    >
      <p className="text-xs uppercase tracking-[0.14em] text-accent font-semibold mb-3">
        404
      </p>
      <h1 className="font-display text-h1 font-bold tracking-tight text-text mb-8">
        Page not found
      </h1>
      <Link
        href="/"
        className="group min-h-[44px] min-w-[44px] inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-text text-bg font-medium text-sm hover:opacity-90 active:scale-[0.97] transition-all"
      >
        <span aria-hidden="true" className="arrow-nudge-left">←</span>
        <span>Return home</span>
      </Link>
    </main>
  );
}
