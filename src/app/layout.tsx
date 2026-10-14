import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Mona_Sans, Newsreader } from "next/font/google";
import { site } from "../../content/site";
import { Nav } from "../components/Nav";
import { Footer } from "../components/Footer";
import { CommandPalette } from "../components/CommandPalette";
import { BackToTop } from "../components/BackToTop";
import { getNavIndex } from "../lib/nav-index";
import "./globals.css";

const fontDisplay = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const fontSans = Mona_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const fontSerif = Newsreader({
  subsets: ["latin"],
  variable: "--font-serif",
  style: ["normal", "italic"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0e0f0f" },
    { media: "(prefers-color-scheme: light)", color: "#f6f4ef" },
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

// Also marks <html> with data-js so reveal animations only hide content when JS is running.
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
        <script
          dangerouslySetInnerHTML={{
            __html: themeBootstrapScript,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-bg text-text">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2.5 focus:min-h-[44px] focus:inline-flex focus:items-center focus:bg-surface focus:text-text focus:border focus:border-line focus:rounded-md focus:shadow-lg focus:outline-none"
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
