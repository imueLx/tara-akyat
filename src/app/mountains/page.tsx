import type { Metadata } from "next";
import Link from "next/link";

import { MountainListClient } from "@/components/mountains/mountain-list-client";
import { getMountains, getRegions } from "@/lib/mountains";
import {
  DEFAULT_OG_IMAGE_PATH,
  SITE_NAME,
  absoluteUrl,
  getBrowsePageDescription,
  serializeJsonLd,
} from "@/lib/seo";

const mountains = getMountains();
const regions = getRegions();
const mountainCount = mountains.length;
const browsePageTitle = "Philippine Mountain Guides and Hiking Planner";
const browsePageDescription = getBrowsePageDescription(mountainCount, regions);

export const metadata: Metadata = {
  title: browsePageTitle,
  description: browsePageDescription,
  alternates: {
    canonical: "/mountains",
  },
  openGraph: {
    siteName: SITE_NAME,
    title: `${browsePageTitle} | ${SITE_NAME}`,
    description: browsePageDescription,
    url: "/mountains",
    images: [
      {
        url: DEFAULT_OG_IMAGE_PATH,
        width: 1200,
        height: 630,
        alt: "Browse Philippine mountains",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${browsePageTitle} | ${SITE_NAME}`,
    description: browsePageDescription,
    images: [DEFAULT_OG_IMAGE_PATH],
  },
};

export default function MountainsBrowsePage() {
  return (
    <div className="min-h-screen pb-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "BreadcrumbList",
                itemListElement: [
                  {
                    "@type": "ListItem",
                    position: 1,
                    name: "Home",
                    item: absoluteUrl("/"),
                  },
                  {
                    "@type": "ListItem",
                    position: 2,
                    name: "Mountains",
                    item: absoluteUrl("/mountains"),
                  },
                ],
              },
              {
                "@type": "CollectionPage",
                "@id": absoluteUrl("/mountains#webpage"),
                name: browsePageTitle,
                description: browsePageDescription,
                url: absoluteUrl("/mountains"),
                isPartOf: {
                  "@id": absoluteUrl("/#website"),
                },
              },
              {
                "@type": "ItemList",
                name: "Philippine Mountains",
                numberOfItems: mountains.length,
                itemListOrder: "https://schema.org/ItemListUnordered",
                url: absoluteUrl("/mountains"),
                itemListElement: mountains.slice(0, 100).map((mountain, index) => ({
                  "@type": "ListItem",
                  position: index + 1,
                  url: absoluteUrl(`/mountains/${mountain.slug}`),
                  name: mountain.name,
                })),
              },
            ],
          }),
        }}
      />
      <main className="mx-auto max-w-6xl px-3 pt-3 sm:px-6 sm:pt-5">
        <nav aria-label="Breadcrumb" className="mb-3 text-sm text-slate-500">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href="/" className="transition hover:text-slate-800">
                Home
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-slate-800">
              Mountains
            </li>
          </ol>
        </nav>
        <section className="rounded-2xl border border-slate-200 bg-white px-4 py-4 sm:px-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-700">Mountain Guides</p>
          <h1 className="mt-2 text-xl font-semibold tracking-tight text-slate-950 sm:text-2xl">Browse Philippine mountain guides</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Explore {mountainCount} mountains across {regions.join(", ")}. Filter by region and difficulty, then open full guides with weather planning support, best months, and trail summaries.
          </p>
        </section>
      </main>
      <MountainListClient mountains={mountains} regions={regions} />
    </div>
  );
}
