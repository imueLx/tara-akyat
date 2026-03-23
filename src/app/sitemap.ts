import { statSync } from "node:fs";
import { join } from "node:path";

import type { MetadataRoute } from "next";

import { getMountains } from "@/lib/mountains";
import { absoluteUrl } from "@/lib/seo";

function getLatestModified(...relativePaths: string[]): Date {
  const latestTimestamp = relativePaths.reduce((latest, relativePath) => {
    const fileTimestamp = statSync(join(/* turbopackIgnore: true */ process.cwd(), relativePath)).mtimeMs;
    return Math.max(latest, fileTimestamp);
  }, 0);

  return new Date(latestTimestamp);
}

export default function sitemap(): MetadataRoute.Sitemap {
  const mountains = getMountains();
  const homeLastModified = getLatestModified("src/app/page.tsx", "src/components/mountains/home-planner-client.tsx", "src/data/mountains.json");
  const mountainsIndexLastModified = getLatestModified(
    "src/app/mountains/page.tsx",
    "src/components/mountains/mountain-list-client.tsx",
    "src/data/mountains.json",
  );
  const mountainPageLastModified = getLatestModified("src/app/mountains/[slug]/page.tsx", "src/data/mountains.json", "src/data/tips.json");

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl("/"),
      lastModified: homeLastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: absoluteUrl("/mountains"),
      lastModified: mountainsIndexLastModified,
      changeFrequency: "weekly",
      priority: 0.9,
    },
  ];

  const mountainPages: MetadataRoute.Sitemap = mountains.map((mountain) => ({
    url: absoluteUrl(`/mountains/${mountain.slug}`),
    lastModified: mountainPageLastModified,
    changeFrequency: "monthly",
    priority: 0.8,
    images: [absoluteUrl(mountain.image_url)],
  }));

  return [...staticPages, ...mountainPages];
}
