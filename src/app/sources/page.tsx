import type { Metadata } from "next";
import Link from "next/link";

import { getMountains, getTips } from "@/lib/mountains";
import { DEFAULT_OG_IMAGE_PATH, SITE_NAME, absoluteUrl, getTrustPageDescription, serializeJsonLd } from "@/lib/seo";

const pageTitle = "Sources and Editorial Policy";
const pageDescription = getTrustPageDescription("sources");

function safeHostname(url: string | null | undefined): string | null {
  if (!url) {
    return null;
  }

  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

function getSourceSummaries(): Array<{ hostname: string; count: number }> {
  const mountains = getMountains();
  const tips = getTips();
  const counts = new Map<string, number>();

  for (const mountain of mountains) {
    for (const url of [mountain.image_source_url, mountain.difficulty_source_url]) {
      const hostname = safeHostname(url);
      if (!hostname) {
        continue;
      }

      counts.set(hostname, (counts.get(hostname) ?? 0) + 1);
    }
  }

  for (const tip of tips) {
    const hostname = safeHostname(tip.url);
    if (!hostname) {
      continue;
    }

    counts.set(hostname, (counts.get(hostname) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([hostname, count]) => ({ hostname, count }))
    .sort((left, right) => right.count - left.count || left.hostname.localeCompare(right.hostname));
}

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  alternates: {
    canonical: "/sources",
  },
  openGraph: {
    siteName: SITE_NAME,
    title: `${pageTitle} | ${SITE_NAME}`,
    description: pageDescription,
    url: "/sources",
    images: [DEFAULT_OG_IMAGE_PATH],
  },
  twitter: {
    card: "summary_large_image",
    title: `${pageTitle} | ${SITE_NAME}`,
    description: pageDescription,
    images: [DEFAULT_OG_IMAGE_PATH],
  },
};

export default function SourcesPage() {
  const pageUrl = absoluteUrl("/sources");
  const sourceSummaries = getSourceSummaries();

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
              Sources
            </li>
          </ol>
        </nav>
        <section className="rounded-2xl border border-slate-200 bg-white px-4 py-4 sm:px-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-700">Sources</p>
          <h1 className="mt-2 text-xl font-semibold tracking-tight text-slate-950 sm:text-2xl">Sources and editorial policy</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Tara Akyat combines structured mountain data with curated external references. Source links are meant to show where a difficulty note, photo credit, or planning tip came from, not to imply that every source endorses the site.
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            When a mountain page includes external references, they are there to help hikers cross-check route feel, logistics, or community context before relying on any single source.
          </p>
        </section>
        <section className="mt-5 grid gap-3 lg:grid-cols-2">
          <article className="rounded-[22px] border border-slate-200/80 bg-white px-4 py-4 shadow-[0_12px_28px_rgba(15,23,42,0.04)]">
            <h2 className="text-base font-semibold tracking-tight text-slate-950">Editorial approach</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              The app prefers traceable references over unsourced claims. Difficulty, imagery, and trip notes are shown with supporting links whenever available, and gaps are treated as gaps instead of being padded with invented detail.
            </p>
          </article>
          <article className="rounded-[22px] border border-slate-200/80 bg-white px-4 py-4 shadow-[0_12px_28px_rgba(15,23,42,0.04)]">
            <h2 className="text-base font-semibold tracking-tight text-slate-950">Source limits</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Trail conditions, access rules, fees, and closure policies can change quickly. Always confirm with local organizers, guides, park offices, or current community updates before hiking.
            </p>
          </article>
        </section>
        <section className="mt-5 rounded-[22px] border border-slate-200/80 bg-white px-4 py-4 shadow-[0_12px_28px_rgba(15,23,42,0.04)] sm:px-5">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">Reference Domains</p>
              <h2 className="mt-1 text-base font-semibold tracking-tight text-slate-950 sm:text-lg">Domains currently referenced in the data set</h2>
            </div>
            <p className="text-sm text-slate-500">Counts combine image credits, difficulty references, and curated tip links.</p>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {sourceSummaries.map((source) => (
              <div key={source.hostname} className="rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-sm font-semibold text-slate-900">{source.hostname}</p>
                <p className="mt-1 text-sm text-slate-600">{source.count} linked references in the current data set</p>
              </div>
            ))}
          </div>
        </section>
        <section className="mt-5 rounded-[22px] border border-slate-200/80 bg-white px-4 py-4 shadow-[0_12px_28px_rgba(15,23,42,0.04)] sm:px-5">
          <h2 className="text-base font-semibold tracking-tight text-slate-950">Related trust pages</h2>
          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            <Link href="/about" className="rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-4 transition hover:border-slate-300 hover:bg-white">
              <h3 className="text-sm font-semibold text-slate-900">About Tara Akyat</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">Who the site is for and what it helps with.</p>
            </Link>
            <Link href="/methodology" className="rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-4 transition hover:border-slate-300 hover:bg-white">
              <h3 className="text-sm font-semibold text-slate-900">Methodology</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">How weather inputs, reliability messaging, and scoring are handled.</p>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
