import type { Metadata } from "next";
import Link from "next/link";

import { DEFAULT_OG_IMAGE_PATH, SITE_NAME, absoluteUrl, getTrustPageDescription, serializeJsonLd } from "@/lib/seo";
import { MAX_FORECAST_DAYS, MAX_PLANNING_DAYS, PRIMARY_DAYS, SECONDARY_PROVIDER_MAX_DAYS } from "@/lib/weather/service";

const pageTitle = "Methodology and Forecast Limits";
const pageDescription = getTrustPageDescription("methodology");

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  alternates: {
    canonical: "/methodology",
  },
  openGraph: {
    siteName: SITE_NAME,
    title: `${pageTitle} | ${SITE_NAME}`,
    description: pageDescription,
    url: "/methodology",
    images: [DEFAULT_OG_IMAGE_PATH],
  },
  twitter: {
    card: "summary_large_image",
    title: `${pageTitle} | ${SITE_NAME}`,
    description: pageDescription,
    images: [DEFAULT_OG_IMAGE_PATH],
  },
};

export default function MethodologyPage() {
  const pageUrl = absoluteUrl("/methodology");

  return (
    <div className="min-h-screen pb-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "BreadcrumbList",
                itemListElement: [
                  {
                    "@type": "ListItem",
                    position: 1,
                    name: "Home",
                    item: absoluteUrl("/"),
                  },
                  {
                    "@type": "ListItem",
                    position: 2,
                    name: pageTitle,
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
                isPartOf: {
                  "@id": absoluteUrl("/#website"),
                },
              },
            ],
          }),
        }}
      />
      <main className="mx-auto max-w-5xl px-3 pt-3 sm:px-6 sm:pt-5">
        <nav aria-label="Breadcrumb" className="mb-3 text-sm text-slate-500">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href="/" className="transition hover:text-slate-800">
                Home
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-slate-800">
              Methodology
            </li>
          </ol>
        </nav>
        <section className="rounded-2xl border border-slate-200 bg-white px-4 py-4 sm:px-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-700">Methodology</p>
          <h1 className="mt-2 text-xl font-semibold tracking-tight text-slate-950 sm:text-2xl">How Tara Akyat evaluates a hike day</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            The app uses mountain coordinates with forecast and archive weather data to estimate whether a target day looks generally good, cautionary, or not recommended for hiking.
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            These results are planning support, not official safety clearance. Local advisories, on-the-ground guide calls, and your own preparation still matter more than any weather tool.
          </p>
        </section>
        <section className="mt-5 grid gap-3 lg:grid-cols-2">
          <article className="rounded-[22px] border border-slate-200/80 bg-white px-4 py-4 shadow-[0_12px_28px_rgba(15,23,42,0.04)]">
            <h2 className="text-base font-semibold tracking-tight text-slate-950">Primary weather input</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Daily and hourly forecast data comes from Open-Meteo. The app also looks at the 4am to 2pm hike window so rain signals better reflect a typical morning hike, not just the whole calendar day.
            </p>
          </article>
          <article className="rounded-[22px] border border-slate-200/80 bg-white px-4 py-4 shadow-[0_12px_28px_rgba(15,23,42,0.04)]">
            <h2 className="text-base font-semibold tracking-tight text-slate-950">Secondary cross-check</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              If a Visual Crossing API key is configured, the app compares the short-range result against a second provider for the next {SECONDARY_PROVIDER_MAX_DAYS} days.
            </p>
          </article>
        </section>
        <section className="mt-5 rounded-[22px] border border-slate-200/80 bg-white px-4 py-4 shadow-[0_12px_28px_rgba(15,23,42,0.04)] sm:px-5">
          <h2 className="text-base font-semibold tracking-tight text-slate-950">Forecast windows and reliability</h2>
          <div className="mt-4 grid gap-3 lg:grid-cols-3">
            <article className="rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-4">
              <h3 className="text-sm font-semibold text-slate-900">Days 1 to {PRIMARY_DAYS}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">This is the most useful range for go or no-go hiking decisions.</p>
            </article>
            <article className="rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-4">
              <h3 className="text-sm font-semibold text-slate-900">Days 8 to {MAX_FORECAST_DAYS}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">Still uses day-level forecast data, but confidence drops and should be treated more cautiously.</p>
            </article>
            <article className="rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-4">
              <h3 className="text-sm font-semibold text-slate-900">Beyond {MAX_FORECAST_DAYS} days</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                The app shifts to planning outlook and historical month/date context, with the strongest long-range planning cap at {MAX_PLANNING_DAYS} days.
              </p>
            </article>
          </div>
        </section>
        <section className="mt-5 rounded-[22px] border border-slate-200/80 bg-white px-4 py-4 shadow-[0_12px_28px_rgba(15,23,42,0.04)] sm:px-5">
          <h2 className="text-base font-semibold tracking-tight text-slate-950">Scoring signals</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Recommendation levels are based on severe weather flags, rain probability, expected rainfall, exposed-ridge wind, and heat stress signals. A calm day can still become risky if local trail conditions, closures, lightning risk, or water crossings change fast.
          </p>
          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            <article className="rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-4">
              <h3 className="text-sm font-semibold text-slate-900">What the app measures well</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">Rain timing, broad weather stability, exposed wind risk, and how forecast confidence changes as the target date moves farther out.</p>
            </article>
            <article className="rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-4">
              <h3 className="text-sm font-semibold text-slate-900">What still needs human judgment</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">River crossings, trail closures, slope condition, permits, guide requirements, and whether your group is equipped for the actual route.</p>
            </article>
          </div>
        </section>
        <section className="mt-5 rounded-[22px] border border-slate-200/80 bg-white px-4 py-4 shadow-[0_12px_28px_rgba(15,23,42,0.04)] sm:px-5">
          <h2 className="text-base font-semibold tracking-tight text-slate-950">Next stops</h2>
          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            <Link href="/about" className="rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-4 transition hover:border-slate-300 hover:bg-white">
              <h3 className="text-sm font-semibold text-slate-900">About Tara Akyat</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">Who the site is for and how to use it responsibly for trip planning.</p>
            </Link>
            <Link href="/sources" className="rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-4 transition hover:border-slate-300 hover:bg-white">
              <h3 className="text-sm font-semibold text-slate-900">Sources and editorial policy</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">Reference sources behind mountain difficulty, photo credits, and curated tip links.</p>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
