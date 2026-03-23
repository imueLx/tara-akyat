import type { Metadata } from "next";

import { HomePlannerClient } from "@/components/mountains/home-planner-client";
import { getMountains } from "@/lib/mountains";
import { DEFAULT_OG_IMAGE_PATH, SITE_NAME, absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Hiking Weather Planner Philippines",
  description: "Plan your next Philippine mountain hike by date with forecast guidance, reliability hints, and curated mountain summaries.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: `${SITE_NAME} - Hiking Weather Planner Philippines`,
    description: "Check mountain hiking weather by date, compare conditions, and pick safer hike days in the Philippines.",
    url: "/",
    images: [
      {
        url: DEFAULT_OG_IMAGE_PATH,
        width: 1200,
        height: 630,
        alt: "Hiking weather planner for Philippine mountains",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} - Hiking Weather Planner Philippines`,
    description: "Check mountain hiking weather by date and plan safer hikes in the Philippines.",
    images: [DEFAULT_OG_IMAGE_PATH],
  },
};

type Props = {
  searchParams?: Promise<{ date?: string }>;
};

export default async function Home({ searchParams }: Props) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const initialDate = resolvedSearchParams?.date;
  const mountains = getMountains().map((mountain) => ({
    id: mountain.id,
    name: mountain.name,
    slug: mountain.slug,
    region: mountain.region,
    province: mountain.province,
    lat: mountain.lat,
    lon: mountain.lon,
    image_url: mountain.image_url,
    image_verified: mountain.image_verified,
    difficulty_source_url: mountain.difficulty_source_url,
    difficulty_score: mountain.difficulty_score,
    summary: mountain.summary,
  }));

  return (
    <div className="min-h-screen pb-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: SITE_NAME,
            url: absoluteUrl("/"),
            applicationCategory: "TravelApplication",
            operatingSystem: "Web",
          }),
        }}
      />
      <main className="mx-auto max-w-6xl px-3 pt-3 sm:px-5 sm:pt-5 md:px-6 md:pt-6">
        <section id="planner" className="scroll-mt-28 sm:scroll-mt-32">
          <HomePlannerClient mountains={mountains} initialDate={initialDate} />
        </section>
      </main>
    </div>
  );
}
