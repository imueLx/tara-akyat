import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { TaxonomyHubPage } from "@/components/seo/taxonomy-hub-page";
import { getActiveMonthHubs, getDifficultyHubBySlug, getDifficultyHubs, getMountainsForDifficultySlug, getRegionHubs } from "@/lib/mountain-taxonomy";
import { DEFAULT_OG_IMAGE_PATH, SITE_NAME, getDifficultyPageDescription, getDifficultySearchKeywords } from "@/lib/seo";

type Props = {
  params: Promise<{ level: string }>;
};

export async function generateStaticParams() {
  return getDifficultyHubs().map((hub) => ({ level: hub.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { level } = await params;
  const hub = getDifficultyHubBySlug(level);

  if (!hub) {
    return {
      title: "Difficulty Level Not Found",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const mountains = getMountainsForDifficultySlug(level);
  const title = `${hub.name} Philippine Mountain Guides`;
  const description = getDifficultyPageDescription(hub.name, mountains.length);
  const image = mountains[0]?.image_url ?? DEFAULT_OG_IMAGE_PATH;
  const pathname = `/difficulty/${level}`;

  return {
    title,
    description,
    keywords: getDifficultySearchKeywords(hub.name),
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

export default async function DifficultyHubPage({ params }: Props) {
  const { level } = await params;
  const hub = getDifficultyHubBySlug(level);

  if (!hub) {
    notFound();
  }

  const mountains = getMountainsForDifficultySlug(level);
  const description = getDifficultyPageDescription(hub.name, mountains.length);
  const faqs = [
    {
      question: `What counts as a ${hub.name.toLowerCase()} hike here?`,
      answer: `This page groups mountains with difficulty scores that fit the ${hub.name.toLowerCase()} bucket. It is a planning shortcut, not a guarantee, because trail condition and weather can still make an easier route feel harder.`,
    },
    {
      question: `Can beginners rely on the ${hub.name.toLowerCase()} label alone?`,
      answer: `No. Always read the full mountain page, check the target date weather, and factor in heat, rain, ridge exposure, and your own hiking experience before deciding.`,
    },
    {
      question: `Does this help with searches like '${hub.name.toLowerCase()} hikes Philippines'?`,
      answer: `Yes. The hub is designed to help hikers compare mountains by effort level, then open more detailed guides with weather planning support.`,
    },
  ] as const;

  return (
    <TaxonomyHubPage
      eyebrow="Difficulty Hub"
      title={`${hub.name} Philippine mountain guides`}
      description={description}
      pathname={`/difficulty/${level}`}
      breadcrumbLabel={hub.name}
      intro={[
        hub.description,
        `Use this page when your search starts with difficulty rather than a specific mountain. It helps narrow the shortlist before you compare full guides and weather for your target hike date.`,
      ]}
      faqs={faqs}
      mountains={mountains}
      emptyState={`There are no mountain guides in the ${hub.name.toLowerCase()} bucket yet.`}
      supportLinks={[
        ...(getRegionHubs()[0]
          ? [
              {
                href: getRegionHubs()[0].href,
                label: `${getRegionHubs()[0].name} mountain guides`,
                description: `${getRegionHubs()[0].mountainCount} guides currently grouped under ${getRegionHubs()[0].name}.`,
              },
            ]
          : []),
        ...(getActiveMonthHubs()[0]
          ? [
              {
                href: getActiveMonthHubs()[0].href,
                label: `${getActiveMonthHubs()[0].name} hiking picks`,
                description: `${getActiveMonthHubs()[0].mountainCount} mountains currently match ${getActiveMonthHubs()[0].name}.`,
              },
            ]
          : []),
        {
          href: "/methodology",
          label: "How difficulty and weather work together",
          description: "See why even a lower-score route can still become risky in rain, wind, or heat.",
        },
      ]}
    />
  );
}
