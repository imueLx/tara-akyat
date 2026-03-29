import { statSync } from "node:fs";
import { join } from "node:path";

import type { MetadataRoute } from "next";

import { getActiveMonthHubs, getDifficultyHubs, getRegionHubs } from "@/lib/mountain-taxonomy";
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
  const regionHubs = getRegionHubs();
  const monthHubs = getActiveMonthHubs();
  const difficultyHubs = getDifficultyHubs();
  const homeLastModified = getLatestModified("src/app/page.tsx", "src/components/mountains/home-planner-client.tsx", "src/data/mountains.json");
  const mountainsIndexLastModified = getLatestModified(
    "src/app/mountains/page.tsx",
    "src/components/mountains/mountain-list-client.tsx",
    "src/data/mountains.json",
  );
  const mountainPageLastModified = getLatestModified("src/app/mountains/[slug]/page.tsx", "src/data/mountains.json", "src/data/tips.json");
  const hubPageLastModified = getLatestModified("src/lib/mountain-taxonomy.ts", "src/components/seo/taxonomy-hub-page.tsx", "src/data/mountains.json");
  const trustPageLastModified = getLatestModified(
    "src/app/about/page.tsx",
    "src/app/methodology/page.tsx",
    "src/app/sources/page.tsx",
    "src/data/mountains.json",
    "src/data/tips.json",
  );

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
    {
      url: absoluteUrl("/about"),
      lastModified: trustPageLastModified,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: absoluteUrl("/methodology"),
      lastModified: trustPageLastModified,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: absoluteUrl("/sources"),
      lastModified: trustPageLastModified,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  const mountainPages: MetadataRoute.Sitemap = mountains.map((mountain) => ({
    url: absoluteUrl(`/mountains/${mountain.slug}`),
    lastModified: mountainPageLastModified,
    changeFrequency: "monthly",
    priority: 0.8,
    images: [absoluteUrl(mountain.image_url)],
  }));

  const regionPages: MetadataRoute.Sitemap = regionHubs.map((hub) => ({
    url: absoluteUrl(hub.href),
    lastModified: hubPageLastModified,
    changeFrequency: "weekly",
    priority: 0.75,
  }));

  const monthPages: MetadataRoute.Sitemap = monthHubs.map((hub) => ({
    url: absoluteUrl(hub.href),
    lastModified: hubPageLastModified,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const difficultyPages: MetadataRoute.Sitemap = difficultyHubs.map((hub) => ({
    url: absoluteUrl(hub.href),
    lastModified: hubPageLastModified,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticPages, ...regionPages, ...monthPages, ...difficultyPages, ...mountainPages];
}
