import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { site } from "../../content/site";
import { seo } from "../../content/seo";
import { JsonLd, siteGraph } from "../lib/structured-data";
import { Nav } from "../components/Nav";
import { Footer } from "../components/Footer";
import { RevealInit } from "../components/RevealInit";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#1b1a17",
  colorScheme: "dark",
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

// Marks the document as scripted, so entrances may hide content until they run. If the script that
// reveals it never starts, everything is shown after 2.5 seconds.
const bootScript = `(function(){var d=document.documentElement;d.classList.add('js');setTimeout(function(){if(!d.hasAttribute('data-reveal-ready'))d.classList.add('reveal-all')},2500)})();`;

const apolloTrackerScript = `function initApollo(){var n=Math.random().toString(36).substring(7),o=document.createElement("script");
o.src="https://assets.apollo.io/micro/website-tracker/tracker.iife.js?nocache="+n,o.async=!0,o.defer=!0,
o.onload=function(){window.trackingFunctions.onLoad({appId:"6a8470f7d78c1f000ce6626d"})},
document.head.appendChild(o)}initApollo();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full">
      <head>
        <link rel="preconnect" href="https://api.fontshare.com" />
        <link rel="preconnect" href="https://cdn.fontshare.com" crossOrigin="" />
        <link href="https://api.fontshare.com/v2/css?f[]=clash-grotesk@400,500&display=swap" rel="stylesheet" />
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
        <JsonLd data={siteGraph()} />
      </head>
      <body className="min-h-full flex flex-col">
        <a href="#main" className="skip">
          Skip to content
        </a>
        <Nav />
        <div className="flex-1 flex flex-col">{children}</div>
        <Footer />
        <RevealInit />
        <Script id="apollo-tracker" strategy="afterInteractive">
          {apolloTrackerScript}
        </Script>
      </body>
    </html>
  );
}
