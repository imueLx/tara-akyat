import type { Metadata } from "next";
import Link from "next/link";

import { MountainLinkGrid } from "@/components/seo/mountain-link-grid";
import { getMountainBySlug } from "@/lib/mountains";
import { DEFAULT_OG_IMAGE_PATH, SITE_NAME, absoluteUrl, getTrustPageDescription, serializeJsonLd } from "@/lib/seo";

const pageTitle = "About Tara Akyat";
const pageDescription = getTrustPageDescription("about");
const featuredMountains = ["mt-ulap", "mt-pulag", "mt-apo"].flatMap((slug) => {
  const mountain = getMountainBySlug(slug);
  return mountain ? [mountain] : [];
});

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    siteName: SITE_NAME,
    title: `${pageTitle} | ${SITE_NAME}`,
    description: pageDescription,
    url: "/about",
    images: [DEFAULT_OG_IMAGE_PATH],
  },
  twitter: {
    card: "summary_large_image",
    title: `${pageTitle} | ${SITE_NAME}`,
    description: pageDescription,
    images: [DEFAULT_OG_IMAGE_PATH],
  },
};

export default function AboutPage() {
  const pageUrl = absoluteUrl("/about");

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
                "@type": "AboutPage",
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
      <main className="mx-auto max-w-6xl px-3 pt-3 sm:px-6 sm:pt-5">
        <nav aria-label="Breadcrumb" className="mb-3 text-sm text-slate-500">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href="/" className="transition hover:text-slate-800">
                Home
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-slate-800">
              About
            </li>
          </ol>
        </nav>
        <section className="rounded-2xl border border-slate-200 bg-white px-4 py-4 sm:px-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-700">About</p>
          <h1 className="mt-2 text-xl font-semibold tracking-tight text-slate-950 sm:text-2xl">Why Tara Akyat exists</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Tara Akyat is built for hikers who want a faster answer to practical questions like whether a mountain day looks rainy, windy, or generally worth keeping on the calendar.
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            The site combines date-based mountain weather checks, route difficulty context, best-month guidance, and curated source links so trip planning feels more grounded than relying on a generic city forecast.
          </p>
        </section>
        <section className="mt-5 grid gap-3 lg:grid-cols-3">
          <article className="rounded-[22px] border border-slate-200/80 bg-white px-4 py-4 shadow-[0_12px_28px_rgba(15,23,42,0.04)]">
            <h2 className="text-base font-semibold tracking-tight text-slate-950">Who it helps</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Day hikers, weekend joiners, and mountain planners comparing weather, best months, and difficulty across Philippine hikes.
            </p>
          </article>
          <article className="rounded-[22px] border border-slate-200/80 bg-white px-4 py-4 shadow-[0_12px_28px_rgba(15,23,42,0.04)]">
            <h2 className="text-base font-semibold tracking-tight text-slate-950">What it does</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              It surfaces forecast signals, long-range planning guidance, and mountain-specific references so you can shortlist dates and routes faster.
            </p>
          </article>
          <article className="rounded-[22px] border border-slate-200/80 bg-white px-4 py-4 shadow-[0_12px_28px_rgba(15,23,42,0.04)]">
            <h2 className="text-base font-semibold tracking-tight text-slate-950">What it does not replace</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Local guides, LGU or park advisories, trail closure notices, and your own judgment on safety, fitness, and equipment.
            </p>
          </article>
        </section>
        <section className="mt-5 rounded-[22px] border border-slate-200/80 bg-white px-4 py-4 shadow-[0_12px_28px_rgba(15,23,42,0.04)] sm:px-5">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">Trust Layer</p>
              <h2 className="mt-1 text-base font-semibold tracking-tight text-slate-950 sm:text-lg">How the site stays transparent</h2>
            </div>
            <p className="text-sm text-slate-500">These pages explain how the app works and where its mountain content comes from.</p>
          </div>
          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            <Link href="/methodology" className="rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-4 transition hover:border-slate-300 hover:bg-white">
              <h3 className="text-base font-semibold tracking-tight text-slate-950">Methodology</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">Weather providers, forecast windows, reliability tiers, and the limits of long-range planning.</p>
            </Link>
            <Link href="/sources" className="rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-4 transition hover:border-slate-300 hover:bg-white">
              <h3 className="text-base font-semibold tracking-tight text-slate-950">Sources and editorial policy</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">Mountain references, image credits, external guide links, and how source notes are used across the site.</p>
            </Link>
          </div>
        </section>
        <MountainLinkGrid
          title="Popular mountains to start with"
          description="These guides combine weather planning, best months, difficulty, and curated references."
          mountains={featuredMountains}
        />
      </main>
    </div>
  );
}
