import type { Metadata } from "next";
import Link from "next/link";

import {
  Breadcrumb,
  PageHero,
  PageShell,
  SectionCard,
  SectionHeader,
} from "@/components/layout/page-primitives";
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
    <PageShell className="max-w-5xl">
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
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Sources" }]} />
      <PageHero eyebrow="Sources" title="Sources and editorial policy">
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Tara Akyat combines structured mountain data with curated external references. Source links are meant to show where a difficulty note, photo credit, or planning tip came from, not to imply that every source endorses the site.
        </p>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          When a mountain page includes external references, they are there to help hikers cross-check route feel, logistics, or community context before relying on any single source.
        </p>
      </PageHero>
      <section className="mt-5 grid gap-3 lg:grid-cols-2">
        <SectionCard>
          <h2 className="text-base font-semibold tracking-tight text-foreground">Editorial approach</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            The app prefers traceable references over unsourced claims. Difficulty, imagery, and trip notes are shown with supporting links whenever available, and gaps are treated as gaps instead of being padded with invented detail.
          </p>
        </SectionCard>
        <SectionCard>
          <h2 className="text-base font-semibold tracking-tight text-foreground">Source limits</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Trail conditions, access rules, fees, and closure policies can change quickly. Always confirm with local organizers, guides, park offices, or current community updates before hiking.
          </p>
        </SectionCard>
      </section>
      <SectionCard className="mt-5">
        <SectionHeader
          eyebrow="Reference Domains"
          title="Domains currently referenced in the data set"
          description="Counts combine image credits, difficulty references, and curated tip links."
        />
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {sourceSummaries.map((source) => (
            <div key={source.hostname} className="rounded-[18px] border border-border bg-secondary px-4 py-3">
              <p className="text-sm font-semibold text-foreground">{source.hostname}</p>
              <p className="mt-1 text-sm text-muted-foreground">{source.count} linked references in the current data set</p>
            </div>
          ))}
        </div>
      </SectionCard>
      <SectionCard className="mt-5">
        <h2 className="text-base font-semibold tracking-tight text-foreground">Related trust pages</h2>
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          <Link href="/about" className="rounded-[18px] border border-border bg-secondary px-4 py-4 transition hover:border-slate-300 hover:bg-card">
            <h3 className="text-sm font-semibold text-foreground">About Tara Akyat</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">Who the site is for and what it helps with.</p>
          </Link>
          <Link href="/methodology" className="rounded-[18px] border border-border bg-secondary px-4 py-4 transition hover:border-slate-300 hover:bg-card">
            <h3 className="text-sm font-semibold text-foreground">Methodology</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">How weather inputs, reliability messaging, and scoring are handled.</p>
          </Link>
        </div>
      </SectionCard>
    </PageShell>
  );
}
