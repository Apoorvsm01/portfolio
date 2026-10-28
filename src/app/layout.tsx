import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Geist, Instrument_Serif, Mona_Sans, Newsreader } from "next/font/google";
import Script from "next/script";
import { site } from "../../content/site";
import { seo } from "../../content/seo";
import { JsonLd, siteGraph } from "../lib/structured-data";
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

// Ask landing pair (v6): Instrument Serif for the greeting, answers' lead line and section titles; Geist for
// everything functional (input, chips, labels, body). A high-contrast serif over a quiet neutral sans.
const fontAskDisplay = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-ask-display",
  display: "swap",
});
const fontAskUi = Geist({
  subsets: ["latin"],
  variable: "--font-ask-ui",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#12110f" },
    { media: "(prefers-color-scheme: light)", color: "#ede7db" },
  ],
  colorScheme: "dark light",
};

// Absolute on purpose: the site lives under /portfolio, and a root-relative path would drop it.
const ogImage = {
  url: `${site.url}${seo.ogImage.path}`,
  width: seo.ogImage.width,
  height: seo.ogImage.height,
  alt: seo.ogImage.alt,
};

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: seo.title,
    template: `%s — ${site.name}`,
  },
  description: seo.description,
  applicationName: site.name,
  authors: [{ name: site.name, url: site.url }],
  creator: site.name,
  alternates: {
    canonical: "./",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  openGraph: {
    title: seo.title,
    description: seo.description,
    url: site.url,
    siteName: site.name,
    locale: "en_US",
    type: "profile",
    firstName: "Apoorv",
    lastName: "Mahajan",
    images: [ogImage],
  },
  twitter: {
    card: "summary_large_image",
    title: seo.title,
    description: seo.description,
    images: [ogImage.url],
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

const apolloTrackerScript = `function initApollo(){var n=Math.random().toString(36).substring(7),o=document.createElement("script");
o.src="https://assets.apollo.io/micro/website-tracker/tracker.iife.js?nocache="+n,o.async=!0,o.defer=!0,
o.onload=function(){window.trackingFunctions.onLoad({appId:"6a8470f7d78c1f000ce6626d"})},
document.head.appendChild(o)}initApollo();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-theme="dark"
      suppressHydrationWarning
      className={`${fontSans.variable} ${fontDisplay.variable} ${fontSerif.variable} ${fontAskDisplay.variable} ${fontAskUi.variable} h-full antialiased`}
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
        <JsonLd data={siteGraph()} />
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
        <Script id="apollo-tracker" strategy="afterInteractive">
          {apolloTrackerScript}
        </Script>
      </body>
    </html>
  );
}
