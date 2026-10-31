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
      <p className="font-sans text-xs sm:text-sm text-accent font-medium mb-3">
        404
      </p>
      <h1 className="font-display font-black text-h1 text-fg leading-tight mb-4">
        Page not found
      </h1>
      <p className="font-serif text-fg-2 text-base sm:text-lg mb-8 max-w-[28rem] text-pretty">
        The page you’re looking for doesn’t exist or has moved.
      </p>
      <Link
        href="/"
        className="group min-h-[44px] min-w-[44px] inline-flex items-center gap-2 px-6 py-3 rounded-[6px] bg-accent text-ground font-sans font-bold text-sm sm:text-base hover:brightness-105 active:translate-y-[1px] transition-all"
      >
        <span aria-hidden="true" className="arrow-nudge-left font-bold">
          ←
        </span>
        <span>Return home</span>
      </Link>
    </main>
  );
}
