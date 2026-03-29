import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { TaxonomyHubPage } from "@/components/seo/taxonomy-hub-page";
import { getActiveMonthHubs, getDifficultyHubs, getMountainsForRegionSlug, getRegionBySlug, getRegionHubs } from "@/lib/mountain-taxonomy";
import { DEFAULT_OG_IMAGE_PATH, SITE_NAME, getRegionPageDescription, getRegionSearchKeywords } from "@/lib/seo";

type Props = {
  params: Promise<{ region: string }>;
};

export async function generateStaticParams() {
  return getRegionHubs().map((region) => ({ region: region.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { region: slug } = await params;
  const region = getRegionBySlug(slug);

  if (!region) {
    return {
      title: "Region Not Found",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const mountains = getMountainsForRegionSlug(slug);
  const title = `${region} Mountain Guides and Hiking Weather`;
  const description = getRegionPageDescription(region, mountains.length);
  const image = mountains[0]?.image_url ?? DEFAULT_OG_IMAGE_PATH;
  const pathname = `/regions/${slug}`;

  return {
    title,
    description,
    keywords: getRegionSearchKeywords(region),
    alternates: {
      canonical: pathname,
    },
    openGraph: {
      siteName: SITE_NAME,
      title: `${title} | ${SITE_NAME}`,
      description,
      url: pathname,
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${SITE_NAME}`,
      description,
      images: [image],
    },
  };
}

export default async function RegionHubPage({ params }: Props) {
  const { region: slug } = await params;
  const region = getRegionBySlug(slug);

  if (!region) {
    notFound();
  }

  const mountains = getMountainsForRegionSlug(slug);
  const description = getRegionPageDescription(region, mountains.length);
  const faqs = [
    {
      question: `What are good mountains to check in ${region}?`,
      answer: `${region} covers a wide range of hikes, so the best pick depends on your target date, trail difficulty, and how far you want to travel. Start with the guides on this page, then open the weather checker for your exact hike day.`,
    },
    {
      question: `Can I use this page for searches like '${region} hiking' or 'bundok sa ${region.toLowerCase()}'?`,
      answer: `Yes. This hub is meant to help hikers browse mountain guides in ${region}, compare routes, and open date-based weather checks for the mountains that fit their plan.`,
    },
    {
      question: `Does ${region} weather mean the same thing for every mountain?`,
      answer: `No. Mountain weather can change a lot with elevation, ridge exposure, and local rain patterns, so use each mountain page for the more useful day-by-day check.`,
    },
  ] as const;

  return (
    <TaxonomyHubPage
      eyebrow="Region Hub"
      title={`${region} mountain guides and weather planning`}
      description={description}
      pathname={`/regions/${slug}`}
      breadcrumbLabel={region}
      intro={[
        `Use this page to shortlist mountains in ${region}, compare route types, and open full guides with weather planning support.`,
        `The goal is to make broad searches like "${region} hiking" more useful by turning them into specific mountain and date decisions instead of vague regional forecasts.`,
      ]}
      faqs={faqs}
      mountains={mountains}
      emptyState={`There are no ${region} mountains in the current data set yet. Use the full mountain browser while this hub grows.`}
      supportLinks={[
        ...getActiveMonthHubs(2).map((month) => ({
          href: month.href,
          label: `${month.name} hiking picks`,
          description: `${month.mountainCount} mountains in the current data set list ${month.name} as part of their better hiking window.`,
        })),
        ...(getDifficultyHubs()[0]
          ? [
              {
                href: getDifficultyHubs()[0].href,
                label: `${getDifficultyHubs()[0].name} hikes`,
                description:
                  getDifficultyHubs()[0].description ?? `${getDifficultyHubs()[0].mountainCount} mountain guides grouped under this difficulty tier.`,
              },
            ]
          : []),
        {
          href: "/methodology",
          label: "How weather guidance works",
          description: "See forecast windows, reliability limits, and how the app treats short-range versus long-range planning.",
        },
      ]}
    />
  );
}
