import type { Metadata } from "next";
import { Chivo, JetBrains_Mono } from "next/font/google";

import { AppTopNav } from "@/components/app-top-nav";
import { DEFAULT_OG_IMAGE_PATH, SITE_DESCRIPTION, SITE_LOCALE, SITE_NAME, getBaseUrl } from "@/lib/seo";

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
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: SITE_LOCALE,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: "/",
    images: [
      {
        url: DEFAULT_OG_IMAGE_PATH,
        width: 1200,
        height: 630,
        alt: "Tara Akyat mountain hiking weather planner",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE_PATH],
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
    <html lang="en-PH" data-scroll-behavior="smooth" className={`${chivo.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen bg-slate-100 text-slate-900">
        <AppTopNav />
        {children}
      </body>
    </html>
  );
}
