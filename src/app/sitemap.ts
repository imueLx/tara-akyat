import type { MetadataRoute } from "next";

import { getMountains } from "@/lib/mountains";
import { absoluteUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const mountains = getMountains();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl("/"),
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: absoluteUrl("/mountains"),
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  const mountainPages: MetadataRoute.Sitemap = mountains.map((mountain) => ({
    url: absoluteUrl(`/mountains/${mountain.slug}`),
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
    images: [absoluteUrl(mountain.image_url)],
  }));

  return [...staticPages, ...mountainPages];
}
