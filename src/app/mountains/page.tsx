import type { Metadata } from "next";

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
      <MountainListClient mountains={mountains} regions={regions} initialRegion="Luzon" initialDifficulty="Beginner" initialSortBy="popular" />
    </div>
  );
}
