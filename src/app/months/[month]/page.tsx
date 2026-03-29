import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { TaxonomyHubPage } from "@/components/seo/taxonomy-hub-page";
import { ALL_MONTHS, getActiveMonthHubs, getDifficultyHubs, getMonthBySlug, getMountainsForMonthSlug, getRegionHubs } from "@/lib/mountain-taxonomy";
import { DEFAULT_OG_IMAGE_PATH, SITE_NAME, getMonthPageDescription, getMonthSearchKeywords } from "@/lib/seo";

type Props = {
  params: Promise<{ month: string }>;
};

export async function generateStaticParams() {
  return ALL_MONTHS.map((month) => ({ month: month.toLowerCase() }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { month: slug } = await params;
  const month = getMonthBySlug(slug);

  if (!month) {
    return {
      title: "Month Not Found",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const mountains = getMountainsForMonthSlug(slug);
  const title = `Best Philippine Mountains to Hike in ${month}`;
  const description = getMonthPageDescription(month, mountains.length);
  const image = mountains[0]?.image_url ?? DEFAULT_OG_IMAGE_PATH;
  const pathname = `/months/${slug}`;

  return {
    title,
    description,
    keywords: getMonthSearchKeywords(month),
    alternates: {
      canonical: pathname,
    },
    robots: mountains.length === 0 ? { index: false, follow: true } : undefined,
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

export default async function MonthHubPage({ params }: Props) {
  const { month: slug } = await params;
  const month = getMonthBySlug(slug);

  if (!month) {
    notFound();
  }

  const mountains = getMountainsForMonthSlug(slug);
  const description = getMonthPageDescription(month, mountains.length);
  const faqs = [
    {
      question: `Is ${month} a good month for hiking in the Philippines?`,
      answer: `It depends on the mountain. This page groups mountains that currently list ${month} in their better hiking window, then each mountain page lets you check the exact weather for your target date.`,
    },
    {
      question: `Can this page help with searches like 'best hike in ${month.toLowerCase()}'?`,
      answer: `Yes. It is meant to turn broad seasonal searches into a shortlist of mountain guides, difficulty context, and date-based weather checks.`,
    },
    {
      question: `If a mountain appears here, does that mean it is always safe in ${month}?`,
      answer: `No. Best-month guidance is a planning baseline. You should still check the actual forecast near hike day because storms, rain, and trail condition can still change fast.`,
    },
  ] as const;

  return (
    <TaxonomyHubPage
      eyebrow="Month Hub"
      title={`Philippine mountain guides for ${month}`}
      description={description}
      pathname={`/months/${slug}`}
      breadcrumbLabel={month}
      intro={[
        `${month} can be a strong planning month for some mountains and a weak one for others. This hub narrows the list to guides that currently flag ${month} as part of a typical hiking window.`,
        `Use this page for seasonal shortlisting first, then open the mountain page you want and run the date-based weather check before locking in the trip.`,
      ]}
      faqs={faqs}
      mountains={mountains}
      emptyState={`No mountains in the current data set list ${month} as a usual hiking month yet. Browse the nearby month hubs or use the full mountain browser for route-specific planning.`}
      supportLinks={[
        ...getActiveMonthHubs(2)
          .filter((item) => item.slug !== slug)
          .map((item) => ({
            href: item.href,
            label: `${item.name} mountain picks`,
            description: `${item.mountainCount} guides currently match ${item.name}.`,
          })),
        ...(getRegionHubs()[0]
          ? [
              {
                href: getRegionHubs()[0].href,
                label: `${getRegionHubs()[0].name} mountain guides`,
                description: `${getRegionHubs()[0].mountainCount} guides currently grouped under ${getRegionHubs()[0].name}.`,
              },
            ]
          : []),
        ...(getDifficultyHubs()[0]
          ? [
              {
                href: getDifficultyHubs()[0].href,
                label: `${getDifficultyHubs()[0].name} hikes`,
                description: getDifficultyHubs()[0].description ?? `${getDifficultyHubs()[0].mountainCount} guides sit in this difficulty bucket.`,
              },
            ]
          : []),
      ]}
    />
  );
}
