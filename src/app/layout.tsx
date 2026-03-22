import type { Metadata } from "next";
import { Chivo, JetBrains_Mono } from "next/font/google";

import { AppTopNav } from "@/components/app-top-nav";

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
  title: "Tara Akyat",
  description: "Check if the day is good for hiking in the Philippines.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${chivo.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen bg-slate-100 text-slate-900">
        <AppTopNav />
        {children}
      </body>
    </html>
  );
}
