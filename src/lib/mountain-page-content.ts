import type { Mountain } from "@/types/hiking";

const monthOrder = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

type MonthName = (typeof monthOrder)[number];

export type MountainSeasonFeel = {
  eyebrow: string;
  title: string;
  body: string;
};

export type MountainPageFaq = {
  question: string;
  answer: string;
};

type MountainJsonLdSource = Pick<
  Mountain,
  "name" | "summary" | "lat" | "lon" | "province" | "slug" | "elevation_m" | "difficulty_score"
>;

type MountainCopySource = Pick<Mountain, "name" | "best_months">;

function getMonthIndex(month: string): number {
  const index = monthOrder.indexOf(month as MonthName);
  return index === -1 ? monthOrder.length : index;
}

export function sortMountainBestMonths(months: readonly string[]): string[] {
  return [...months].sort((left, right) => getMonthIndex(left) - getMonthIndex(right));
}

export function formatMountainMonthWindow(months: readonly string[]): string {
  const ordered = sortMountainBestMonths(months);

  if (ordered.length === 0) {
    return "Year-round";
  }

  if (ordered.length === 1) {
    return ordered[0];
  }

  return `${ordered[0]} to ${ordered[ordered.length - 1]}`;
}

export function getMountainSeasonFeel(months: readonly string[]): MountainSeasonFeel {
  const ordered = sortMountainBestMonths(months);
  const window = formatMountainMonthWindow(ordered);
  const startsLateYear = ordered.some((month) => month === "November" || month === "December");
  const includesSummer = ordered.some((month) => month === "March" || month === "April" || month === "May");

  if (ordered.length <= 2) {
    return {
      eyebrow: "Narrower window",
      title: `Usually better around ${window}.`,
      body: "This mountain is best treated as having a tighter seasonal window, so these months are a smarter starting point before checking trail updates and the exact weather closer to your hike.",
    };
  }

  if (startsLateYear && includesSummer) {
    return {
      eyebrow: "Broader season",
      title: `Usually workable from ${window}.`,
      body: "This mountain has a longer workable season than most, which gives you a bit more flexibility when planning while still making it worth checking the exact conditions near your hike date.",
    };
  }

  if (startsLateYear) {
    return {
      eyebrow: "Typical dry-season pick",
      title: `Usually favored from ${window}.`,
      body: "This follows the more common cool-to-dry hiking season, so these months are best treated as a reliable planning guide rather than a guarantee for every trip.",
    };
  }

  return {
    eyebrow: "Season baseline",
    title: `Usually aim for ${window}.`,
    body: "The month range here works best as a general planning guide, then refined with day-specific weather and local trail conditions before you lock in the hike.",
  };
}

export function getMountainWhenToGoCopy(mountain: MountainCopySource): string {
  const orderedBestMonths = sortMountainBestMonths(mountain.best_months);

  if (orderedBestMonths.length > 0) {
    return `${mountain.name} is usually better planned around ${formatMountainMonthWindow(orderedBestMonths)}. Treat that as the seasonal starting point, then still check the exact hike date because rain and ridge conditions can shift quickly.`;
  }

  return `${mountain.name} still needs a date-specific weather check even if the broader hiking season is flexible, because conditions can change a lot from one week to the next.`;
}

export function getMountainWeatherPlanningCopy(mountainName: string): string {
  return `Use the date checker on this page for ${mountainName} when you want an answer to questions like "uulan ba" or whether the day looks workable for hiking. Short-range dates are better for go or no-go decisions, while longer-range dates should be treated as planning guidance only.`;
}

export function getMountainFaqs(mountain: MountainCopySource): MountainPageFaq[] {
  const orderedBestMonths = sortMountainBestMonths(mountain.best_months);

  return [
    {
      question: `Paano mag-check kung uulan ba sa ${mountain.name}?`,
      answer: `Use the date-based weather checker on this page, then choose your target hike date for ${mountain.name}. That gives you a more useful hiking answer than a generic nearby city forecast.`,
    },
    {
      question: `Puwede bang mag-check ng ${mountain.name} weather bukas or sa specific date?`,
      answer: `Yes. This page is built for date-based trip planning, so you can check tomorrow or another target date before your climb and then review the reliability guidance for that forecast window.`,
    },
    {
      question: `Kailan best months sa ${mountain.name}?`,
      answer:
        orderedBestMonths.length > 0
          ? `${mountain.name} is usually better planned around ${formatMountainMonthWindow(orderedBestMonths)}. Treat that as a planning baseline, then still recheck the exact weather near your hike day.`
          : `Check the mountain guide and weather section on this page, because ${mountain.name} still needs date-based weather confirmation even if the broader hiking window is flexible.`,
    },
    {
      question: `Enough ba ang city weather para sa hike sa ${mountain.name}?`,
      answer: `Not always. Mountain weather can feel different because of elevation, terrain, rain exposure, and wind. It is safer to use a mountain-specific check for ${mountain.name} instead of relying only on a city forecast.`,
    },
  ];
}

export function buildMountainJsonLd(params: {
  mountain: MountainJsonLdSource;
  faqs: readonly MountainPageFaq[];
  homeUrl: string;
  imageUrl: string;
  pageDescription: string;
  pageTitle: string;
  pageUrl: string;
  websiteId: string;
}) {
  const { faqs, homeUrl, imageUrl, mountain, pageDescription, pageTitle, pageUrl, websiteId } = params;
  const graph: Array<Record<string, unknown>> = [
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: homeUrl,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Mountains",
          item: `${homeUrl}mountains`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: mountain.name,
          item: pageUrl,
        },
      ],
    },
    {
      "@type": "WebPage",
      "@id": `${pageUrl}#webpage`,
      name: pageTitle,
      description: pageDescription,
      url: pageUrl,
      primaryImageOfPage: imageUrl,
      isPartOf: {
        "@id": websiteId,
      },
      about: {
        "@id": `${pageUrl}#place`,
      },
    },
    {
      "@type": "TouristAttraction",
      "@id": `${pageUrl}#place`,
      name: mountain.name,
      description: mountain.summary,
      image: {
        "@type": "ImageObject",
        url: imageUrl,
        caption: mountain.name,
      },
      url: pageUrl,
      touristType: "Hikers",
      geo: {
        "@type": "GeoCoordinates",
        latitude: mountain.lat,
        longitude: mountain.lon,
      },
      address: {
        "@type": "PostalAddress",
        addressLocality: mountain.province,
        addressCountry: "PH",
      },
      additionalProperty: [
        {
          "@type": "PropertyValue",
          name: "Elevation (m)",
          value: mountain.elevation_m,
        },
        {
          "@type": "PropertyValue",
          name: "Difficulty Score",
          value: mountain.difficulty_score,
        },
      ],
    },
  ];

  if (faqs.length > 0) {
    graph.push({
      "@type": "FAQPage",
      "@id": `${pageUrl}#faq`,
      mainEntity: faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      })),
    });
  }

  return {
    "@context": "https://schema.org",
    "@graph": graph,
  };
}
