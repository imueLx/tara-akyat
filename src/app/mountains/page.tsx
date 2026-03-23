import type { Metadata } from "next";

import { MountainListClient } from "@/components/mountains/mountain-list-client";
import { getMountains, getRegions } from "@/lib/mountains";
import { DEFAULT_OG_IMAGE_PATH, SITE_NAME, absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Browse Mountains",
  description: "Browse Philippine mountains by region and difficulty, then open mountain detail pages with weather planning support.",
  alternates: {
    canonical: "/mountains",
  },
  openGraph: {
    title: `${SITE_NAME} - Browse Philippine Mountains`,
    description: "Explore mountain pages with elevation, hike summaries, and weather planning tools.",
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
    title: `${SITE_NAME} - Browse Philippine Mountains`,
    description: "Explore mountain pages with elevation, hike summaries, and weather planning tools.",
    images: [DEFAULT_OG_IMAGE_PATH],
  },
};

export default function MountainsBrowsePage() {
  const mountains = getMountains();
  const regions = getRegions();

  return (
    <div className="min-h-screen pb-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "Philippine Mountains",
            url: absoluteUrl("/mountains"),
            itemListElement: mountains.slice(0, 100).map((mountain, index) => ({
              "@type": "ListItem",
              position: index + 1,
              url: absoluteUrl(`/mountains/${mountain.slug}`),
              name: mountain.name,
            })),
          }),
        }}
      />
      <MountainListClient mountains={mountains} regions={regions} />
    </div>
  );
}
