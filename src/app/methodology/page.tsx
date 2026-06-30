import type { Metadata } from "next";
import Link from "next/link";

import {
  Breadcrumb,
  PageHero,
  PageShell,
  SectionCard,
} from "@/components/layout/page-primitives";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import { DEFAULT_OG_IMAGE_PATH, SITE_NAME, absoluteUrl, getTrustPageDescription } from "@/lib/seo";
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
    <PageShell className="max-w-5xl">
      <JsonLdScript
        id="methodology-json-ld"
        data={{
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
        }}
      />
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Methodology" }]} />
      <PageHero eyebrow="Methodology" title="How Tara Akyat evaluates a hike day">
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          The app uses mountain coordinates with forecast and archive weather data to estimate whether a target day looks generally good, cautionary, or not recommended for hiking.
        </p>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          These results are planning support, not official safety clearance. Local advisories, on-the-ground guide calls, and your own preparation still matter more than any weather tool.
        </p>
      </PageHero>
      <section className="mt-5 grid gap-3 lg:grid-cols-2">
        <SectionCard>
          <h2 className="text-base font-semibold tracking-tight text-foreground">Primary weather input</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Daily and hourly forecast data comes from Open-Meteo. The app also looks at the 4am to 2pm hike window so rain signals better reflect a typical morning hike, not just the whole calendar day.
          </p>
        </SectionCard>
        <SectionCard>
          <h2 className="text-base font-semibold tracking-tight text-foreground">Second opinion (Visual Crossing)</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            If a Visual Crossing API key is configured, the app compares the short-range result against a second provider for the next {SECONDARY_PROVIDER_MAX_DAYS} days.
          </p>
        </SectionCard>
      </section>
      <SectionCard className="mt-5">
        <h2 className="text-base font-semibold tracking-tight text-foreground">Forecast windows and reliability</h2>
        <div className="mt-4 grid gap-3 lg:grid-cols-3">
          <article className="rounded-[18px] border border-border bg-secondary px-4 py-4">
            <h3 className="text-sm font-semibold text-foreground">Days 1 to {PRIMARY_DAYS}</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">This is the most useful range for go or no-go hiking decisions.</p>
          </article>
          <article className="rounded-[18px] border border-border bg-secondary px-4 py-4">
            <h3 className="text-sm font-semibold text-foreground">Days 8 to {MAX_FORECAST_DAYS}</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">Still uses day-level forecast data, but confidence drops and should be treated more cautiously.</p>
          </article>
          <article className="rounded-[18px] border border-border bg-secondary px-4 py-4">
            <h3 className="text-sm font-semibold text-foreground">Beyond {MAX_FORECAST_DAYS} days</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              The app shifts to planning outlook and historical month/date context, with the strongest long-range planning cap at {MAX_PLANNING_DAYS} days.
            </p>
          </article>
        </div>
      </SectionCard>
      <SectionCard className="mt-5">
        <h2 className="text-base font-semibold tracking-tight text-foreground">Scoring signals</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Recommendation levels are based on severe weather flags, rain probability, expected rainfall, exposed-ridge wind, and heat stress signals. A calm day can still become risky if local trail conditions, closures, lightning risk, or water crossings change fast.
        </p>
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          <article className="rounded-[18px] border border-border bg-secondary px-4 py-4">
            <h3 className="text-sm font-semibold text-foreground">What the app measures well</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">Rain timing, broad weather stability, exposed wind risk, and how forecast confidence changes as the target date moves farther out.</p>
          </article>
          <article className="rounded-[18px] border border-border bg-secondary px-4 py-4">
            <h3 className="text-sm font-semibold text-foreground">What still needs human judgment</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">River crossings, trail closures, slope condition, permits, guide requirements, and whether your group is equipped for the actual route.</p>
          </article>
        </div>
      </SectionCard>
      <SectionCard className="mt-5">
        <h2 className="text-base font-semibold tracking-tight text-foreground">Next stops</h2>
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          <Link href="/about" className="rounded-[18px] border border-border bg-secondary px-4 py-4 transition hover:border-slate-300 hover:bg-card">
            <h3 className="text-sm font-semibold text-foreground">About Tara Akyat</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">Who the site is for and how to use it responsibly for trip planning.</p>
          </Link>
          <Link href="/sources" className="rounded-[18px] border border-border bg-secondary px-4 py-4 transition hover:border-slate-300 hover:bg-card">
            <h3 className="text-sm font-semibold text-foreground">Sources and editorial policy</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">Reference sources behind mountain difficulty, photo credits, and curated tip links.</p>
          </Link>
        </div>
      </SectionCard>
    </PageShell>
  );
}
