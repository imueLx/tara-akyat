import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { PageShell } from "@/components/layout/page-primitives";
import { HomePlannerQueryBridge } from "@/components/mountains/home-planner-query-bridge";
import { HomePlannerShell } from "@/components/mountains/home-planner-shell";
import { FaqSection } from "@/components/seo/faq-section";
import { getMountainBySlug, getMountains, getRegions } from "@/lib/mountains";
import {
  SITE_ALTERNATE_NAME,
  SITE_DESCRIPTION,
  SITE_LOGO_PATH,
  SITE_NAME,
  absoluteUrl,
  getHomeMetaDescription,
  getHomeSearchKeywords,
  serializeJsonLd,
} from "@/lib/seo";

const mountains = getMountains();
const regionNames = getRegions();
const mountainCount = mountains.length;
const featuredMountains = ["mt-ulap", "mt-pulag", "mt-apo", "mt-daraitan"].flatMap((slug) => {
  const mountain = getMountainBySlug(slug);
  return mountain ? [mountain] : [];
});
const homeTitle = "Philippines Hiking Weather Planner and Mountain Guides";
const homeDescription = getHomeMetaDescription(mountainCount, regionNames);
const homeKeywords = getHomeSearchKeywords(featuredMountains.map((mountain) => mountain.name));
const plannerMountains = mountains.map((mountain) => ({
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
  elevation_m: mountain.elevation_m,
  best_months: mountain.best_months,
  summary: mountain.summary,
}));

export const metadata: Metadata = {
  title: homeTitle,
  description: homeDescription,
  keywords: homeKeywords,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    siteName: SITE_NAME,
    title: `${homeTitle} | ${SITE_NAME}`,
    description: homeDescription,
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: `${homeTitle} | ${SITE_NAME}`,
    description: homeDescription,
  },
};

export default function Home() {
  const faqs = [
    {
      question: "Anong ginagawa ng Tara Akyat?",
      answer: `Tara Akyat is a hiking weather checker for ${mountainCount} Philippine mountains across ${regionNames.join(", ")}. You can compare rain chance, wind, and hiking conditions by date before your climb.`,
    },
    {
      question: "Puwede ba akong mag-check ng weather for different mountains, hindi lang Mt. Ulap?",
      answer: "Yes. You can check multiple mountains like Mt. Pulag, Mt. Apo, Mt. Daraitan, Mt. Batulao, and many more. The site is meant for broad Philippine mountain weather checking, not just one trail.",
    },
    {
      question: "Kung search ko ay 'uulan ba bukas' or 'safe ba mag-hike bukas', bagay ba ito dito?",
      answer: "Yes. Pick your mountain and target date first, then use the result as your hike-specific answer. That is more useful than a generic city forecast because mountain conditions can change fast with elevation, wind, and local rain patterns.",
    },
    {
      question: "Puwede ba akong mag-check ng date sa Mt. Ulap, Mt. Pulag, o ibang bundok sa app?",
      answer: "Yes. Choose any supported mountain, then set your target date to check that specific hike day. This works for Mt. Ulap, Mt. Pulag, Mt. Apo, Mt. Batulao, Mt. Daraitan, and the rest of the mountain list in the app.",
    },
    {
      question: "Kailan pinaka-useful mag-check ng hiking weather?",
      answer: "The most useful time is usually a few days before your hike, when day-level forecasts are more reliable. For far-ahead dates, use the result as planning guidance and recheck closer to the actual climb.",
    },
    {
      question: "Best months for hiking sa Pilipinas?",
      answer: "It depends on the mountain, region, and season. Each mountain page includes best months to hike, but you should still check the actual weather forecast for your target date before going.",
    },
  ] as const;

  return (
    <PageShell className="pb-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "Organization",
                "@id": absoluteUrl("/#organization"),
                name: SITE_NAME,
                alternateName: SITE_ALTERNATE_NAME,
                description: SITE_DESCRIPTION,
                url: absoluteUrl("/"),
                logo: {
                  "@type": "ImageObject",
                  url: absoluteUrl(SITE_LOGO_PATH),
                  width: 512,
                  height: 512,
                },
              },
              {
                "@type": "WebSite",
                "@id": absoluteUrl("/#website"),
                name: SITE_NAME,
                alternateName: SITE_ALTERNATE_NAME,
                description: homeDescription,
                inLanguage: "en-PH",
                url: absoluteUrl("/"),
                about: [
                  absoluteUrl("/about"),
                  absoluteUrl("/methodology"),
                  absoluteUrl("/sources"),
                ],
                publisher: {
                  "@id": absoluteUrl("/#organization"),
                },
              },
              {
                "@type": "WebPage",
                "@id": absoluteUrl("/#webpage"),
                name: homeTitle,
                description: homeDescription,
                url: absoluteUrl("/"),
                isPartOf: {
                  "@id": absoluteUrl("/#website"),
                },
                about: [
                  {
                    "@type": "Thing",
                    name: "Hiking weather",
                  },
                  {
                    "@type": "Thing",
                    name: "Philippine mountains",
                  },
                ],
              },
              {
                "@type": "WebApplication",
                "@id": absoluteUrl("/#app"),
                name: SITE_NAME,
                description: SITE_DESCRIPTION,
                url: absoluteUrl("/"),
                applicationCategory: "TravelApplication",
                operatingSystem: "Web",
                offers: {
                  "@type": "Offer",
                  price: "0",
                  priceCurrency: "PHP",
                },
                featureList: [
                  "Date-based hiking weather checks",
                  "Forecast reliability guidance",
                  "Philippine mountain guide pages",
                ],
              },
              {
                "@type": "FAQPage",
                mainEntity: faqs.map((faq) => ({
                  "@type": "Question",
                  name: faq.question,
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: faq.answer,
                  },
                })),
              },
            ],
          }),
        }}
      />

      <div className="mb-6 rounded-[24px] border border-border bg-card/90 px-4 py-5 shadow-[0_12px_28px_rgba(15,23,42,0.04)] sm:px-6 sm:py-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-sky-700">Tara Akyat</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Philippines hiking weather planner
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-[15px]">
          Plan safer hikes across {regionNames.join(", ")}. Search a mountain, pick your date, and get a hike-specific weather read before you go.
        </p>
      </div>

      <Suspense fallback={<HomePlannerShell mountainCount={plannerMountains.length} />}>
        <HomePlannerQueryBridge mountains={plannerMountains} />
      </Suspense>

      <section className="mt-6 grid gap-3 lg:grid-cols-3">
        <article className="rounded-[22px] border border-border bg-card px-4 py-4 shadow-[0_12px_28px_rgba(15,23,42,0.04)]">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">How it works</p>
          <h2 className="mt-1 text-base font-semibold tracking-tight text-foreground">Search, date, check</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Use the mountain finder above, set your hike date, then compare rain, wind, and temperature for that specific trail day.
          </p>
        </article>
        <article className="rounded-[22px] border border-border bg-card px-4 py-4 shadow-[0_12px_28px_rgba(15,23,42,0.04)]">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">Forecast trust</p>
          <h2 className="mt-1 text-base font-semibold tracking-tight text-foreground">Know what the date means</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Near-term dates are better for go or no-go calls. Farther dates shift into planning outlook and historical context.
          </p>
        </article>
        <article className="rounded-[22px] border border-border bg-card px-4 py-4 shadow-[0_12px_28px_rgba(15,23,42,0.04)]">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">Mountain guides</p>
          <h2 className="mt-1 text-base font-semibold tracking-tight text-foreground">Go deeper before the trip</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Open full guides for best months, difficulty, references, and trail notes after you shortlist a mountain.
          </p>
        </article>
      </section>

      <section className="mt-5 rounded-[22px] border border-border bg-card px-4 py-4 shadow-[0_12px_28px_rgba(15,23,42,0.04)] sm:px-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">Popular guides</p>
            <h2 className="mt-1 text-base font-semibold tracking-tight text-foreground sm:text-lg">Start with a well-known climb</h2>
          </div>
          <Link href="/mountains" className="text-sm font-semibold text-sky-700 transition hover:text-sky-800">
            Browse all {mountainCount} mountains
          </Link>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {featuredMountains.map((mountain) => (
            <Link
              key={mountain.id}
              href={`/mountains/${mountain.slug}`}
              className="rounded-[18px] border border-border bg-secondary/30 px-4 py-4 transition hover:border-sky-200 hover:bg-sky-50/50"
            >
              <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                {mountain.province}, {mountain.region}
              </p>
              <h3 className="mt-2 text-base font-semibold tracking-tight text-foreground">{mountain.name}</h3>
              <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">{mountain.summary}</p>
            </Link>
          ))}
        </div>
      </section>

      <FaqSection
        title="Quick hiking weather FAQ"
        description="Short answers for common trip-planning questions."
        faqs={faqs}
      />
    </PageShell>
  );
}
