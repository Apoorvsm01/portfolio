// The site can be served under a sub-path (GitHub Pages project site: /portfolio). Next.js prefixes
// <Link> hrefs and router pushes itself, but not plain <img> src or CSS url(), so those go through here.
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function asset(src: string): string {
  return BASE_PATH && src.startsWith("/") && !src.startsWith("//") ? `${BASE_PATH}${src}` : src;
}
