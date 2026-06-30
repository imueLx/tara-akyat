import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import Script from "next/script";
import { Chivo, JetBrains_Mono } from "next/font/google";

import { AppTopNav } from "@/components/app-top-nav";
import { SiteFooter } from "@/components/site-footer";
import { Toaster } from "@/components/ui/sonner";
import { getNavHubQuickLinks } from "@/lib/hub-links";
import { SITE_DESCRIPTION, SITE_LOCALE, SITE_LOGO_PATH, SITE_NAME, getBaseUrl } from "@/lib/seo";
import { getThemeBootstrapScript } from "@/lib/theme";

import "./globals.css";

const chivo = Chivo({
  variable: "--font-chivo",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(getBaseUrl()),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  icons: {
    icon: [
      { url: "/icon", type: "image/png", sizes: "512x512" },
      { url: SITE_LOGO_PATH, type: "image/svg+xml", sizes: "any" },
    ],
    apple: [{ url: "/apple-icon", type: "image/png", sizes: "180x180" }],
    shortcut: [{ url: "/icon", type: "image/png", sizes: "512x512" }],
  },
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: SITE_LOCALE,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  verification: {
    google: "ka2UD9ZHpo9uoxKyW3eLDmMoZTLrQm7AKxQLW-7QYyM",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en-PH"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${chivo.variable} ${jetbrainsMono.variable}`}
    >
      <body className="min-h-screen bg-background text-foreground">
        <Script
          id="theme-bootstrap"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: getThemeBootstrapScript(),
          }}
        />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-60 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-primary-foreground"
        >
          Skip to content
        </a>
        <AppTopNav hubQuickLinks={getNavHubQuickLinks()} />
        <div id="main-content" className="min-h-[calc(100vh-4rem)]">
          {children}
        </div>
        <SiteFooter />
        <Toaster />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
