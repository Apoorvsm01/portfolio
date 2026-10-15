import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Mona_Sans, Newsreader } from "next/font/google";
import { site } from "../../content/site";
import { Nav } from "../components/Nav";
import { Footer } from "../components/Footer";
import { CommandPalette } from "../components/CommandPalette";
import { BackToTop } from "../components/BackToTop";
import { getNavIndex } from "../lib/nav-index";
import "./globals.css";

// v4 T: Mona_Sans with axes: ["wdth"] for display/headlines
const fontDisplay = Mona_Sans({
  subsets: ["latin"],
  variable: "--font-display",
  axes: ["wdth"],
  display: "swap",
});

// v4 T: Bricolage_Grotesque for subheads, tagline, UI, buttons, labels
const fontSans = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

// v4 T: Newsreader (serif) for body paragraphs
const fontSerif = Newsreader({
  subsets: ["latin"],
  variable: "--font-serif",
  style: ["normal", "italic"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#12110f" },
    { media: "(prefers-color-scheme: light)", color: "#ede7db" },
  ],
  colorScheme: "dark light",
};

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.role}`,
    template: `%s — ${site.name}`,
  },
  description: site.hero.intro,
  alternates: {
    canonical: "./",
  },
  openGraph: {
    title: `${site.name} — ${site.role}`,
    description: site.hero.intro,
    url: site.url,
    siteName: site.name,
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — ${site.role}`,
    description: site.hero.intro,
  },
};

// CSS custom properties generated from site.flags (v4 C)
const flagStyles = Object.entries(site.flags)
  .map(([name, { bg, ink }]) => `--flag-${name}: ${bg}; --flag-${name}-ink: ${ink};`)
  .join(" ");

// Theme bootstrap script: sets dark by default, respects localStorage
const themeBootstrapScript = `(function() {
  document.documentElement.setAttribute('data-js', '');
  try {
    var stored = localStorage.getItem('theme');
    var theme = stored === 'light' || stored === 'dark' ? stored : 'dark';
    document.documentElement.setAttribute('data-theme', theme);
  } catch (e) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-theme="dark"
      suppressHydrationWarning
      className={`${fontSans.variable} ${fontDisplay.variable} ${fontSerif.variable} h-full antialiased`}
    >
      <head>
        <style
          dangerouslySetInnerHTML={{
            __html: `:root { ${flagStyles} }`,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: themeBootstrapScript,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-ground text-fg">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2.5 focus:min-h-[44px] focus:inline-flex focus:items-center focus:bg-surface focus:text-fg focus:border focus:border-rule focus:rounded-[6px] focus:shadow-lg focus:outline-none"
        >
          Skip to content
        </a>
        <Nav />
        <div className="flex-1 flex flex-col">{children}</div>
        <Footer />
        <BackToTop />
        <CommandPalette items={getNavIndex()} />
      </body>
    </html>
  );
}
