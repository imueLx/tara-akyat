import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { HomePlannerQueryBridge } from "@/components/mountains/home-planner-query-bridge";
import { HomePlannerShell } from "@/components/mountains/home-planner-shell";
import { getMountainBySlug, getMountains, getRegions } from "@/lib/mountains";
import {
  DEFAULT_OG_IMAGE_PATH,
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
    images: [
      {
        url: DEFAULT_OG_IMAGE_PATH,
        width: 1200,
        height: 630,
        alt: "Tara Akyat weather checker for Philippine mountains",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${homeTitle} | ${SITE_NAME}`,
    description: homeDescription,
    images: [DEFAULT_OG_IMAGE_PATH],
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
    <div className="min-h-screen pb-10">
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
      <main className="mx-auto max-w-6xl px-3 pt-3 sm:px-5 sm:pt-5 md:px-6 md:pt-6">
        <section className="mb-4 rounded-2xl border border-slate-200 bg-white px-4 py-4 sm:px-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-700">{SITE_NAME}</p>
          <h1 className="mt-2 text-xl font-semibold text-slate-950 sm:text-2xl">Philippines hiking weather planner</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Plan safer hikes with date-based weather checks, forecast reliability, and mountain guides for {mountainCount} mountains across {regionNames.join(", ")}.
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Need a quick answer to &quot;Uulan ba sa bundok?&quot; Pick a mountain and date below, then open the full guide for best hiking months, difficulty, and trip notes.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <a
              href="#planner"
              className="inline-flex items-center rounded-full bg-slate-950 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Start weather check
            </a>
            <Link
              href="/mountains"
              className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm font-semibold text-slate-900 transition hover:border-slate-300 hover:bg-white"
            >
              Browse all mountain guides
            </Link>
          </div>
        </section>
        <section id="planner" className="scroll-mt-28 sm:scroll-mt-32">
          <Suspense fallback={<HomePlannerShell mountainCount={plannerMountains.length} />}>
            <HomePlannerQueryBridge mountains={plannerMountains} />
          </Suspense>
        </section>
        <section className="mt-5 grid gap-3 lg:grid-cols-2">
          <article className="rounded-[22px] border border-slate-200/80 bg-white px-4 py-4 shadow-[0_12px_28px_rgba(15,23,42,0.04)]">
            <h2 className="text-base font-semibold tracking-tight text-slate-950">How to use the checker</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Pick your mountain, set the target date, then compare rain chance, wind, and temperature before you commit to the trip.
            </p>
          </article>
          <article className="rounded-[22px] border border-slate-200/80 bg-white px-4 py-4 shadow-[0_12px_28px_rgba(15,23,42,0.04)]">
            <h2 className="text-base font-semibold tracking-tight text-slate-950">Read the forecast with context</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              The planner explains whether your selected date is close enough for a dependable forecast or better treated as advance planning guidance.
            </p>
          </article>
        </section>
        <section className="mt-5 rounded-[22px] border border-slate-200/80 bg-white px-4 py-4 shadow-[0_12px_28px_rgba(15,23,42,0.04)] sm:px-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">Need more than the weather?</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Open a full mountain guide for best months, difficulty, references, and trip-planning context.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/mountains"
                className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm font-semibold text-slate-900 transition hover:border-slate-300 hover:bg-white"
              >
                Browse mountain guides
              </Link>
              <Link
                href="/methodology"
                className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
              >
                How forecasts work
              </Link>
            </div>
          </div>
        </section>
        <section className="mt-5 rounded-[22px] border border-slate-200/80 bg-white px-4 py-4 shadow-[0_12px_28px_rgba(15,23,42,0.04)] sm:px-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">Popular Guides</p>
              <h2 className="mt-1 text-base font-semibold tracking-tight text-slate-950 sm:text-lg">Popular mountain guides to open next</h2>
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
                className="rounded-[18px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] px-4 py-4 transition hover:border-slate-300 hover:bg-white"
              >
                <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-500">
                  {mountain.province}, {mountain.region}
                </p>
                <h3 className="mt-2 text-base font-semibold tracking-tight text-slate-950">{mountain.name}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{mountain.summary}</p>
              </Link>
            ))}
          </div>
        </section>
        <section className="mt-5 rounded-[22px] border border-slate-200/80 bg-white px-4 py-4 shadow-[0_12px_28px_rgba(15,23,42,0.04)] sm:px-5">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">FAQ</p>
              <h2 className="mt-1 text-base font-semibold tracking-tight text-slate-950 sm:text-lg">Quick hiking weather FAQ</h2>
            </div>
            <p className="text-sm text-slate-500">Short answers for common trip-planning questions.</p>
          </div>
          <div className="mt-4 space-y-2.5">
            {faqs.map((faq) => (
              <details key={faq.question} className="rounded-[18px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] px-4 py-3.5">
                <summary className="cursor-pointer text-sm font-semibold text-slate-900">{faq.question}</summary>
                <p className="mt-2 text-sm leading-6 text-slate-600">{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
