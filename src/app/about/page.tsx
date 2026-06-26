import type { Metadata } from "next";
import Link from "next/link";

import {
  Breadcrumb,
  PageHero,
  PageShell,
  SectionCard,
  SectionHeader,
} from "@/components/layout/page-primitives";
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
    <PageShell>
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
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "About" }]} />
      <PageHero eyebrow="About" title="Why Tara Akyat exists">
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Tara Akyat is built for hikers who want a faster answer to practical questions like whether a mountain day looks rainy, windy, or generally worth keeping on the calendar.
        </p>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          The site combines date-based mountain weather checks, route difficulty context, best-month guidance, and curated source links so trip planning feels more grounded than relying on a generic city forecast.
        </p>
      </PageHero>
      <section className="mt-5 grid gap-3 lg:grid-cols-3">
        <SectionCard>
          <h2 className="text-base font-semibold tracking-tight text-foreground">Who it helps</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Day hikers, weekend joiners, and mountain planners comparing weather, best months, and difficulty across Philippine hikes.
          </p>
        </SectionCard>
        <SectionCard>
          <h2 className="text-base font-semibold tracking-tight text-foreground">What it does</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            It surfaces forecast signals, long-range planning guidance, and mountain-specific references so you can shortlist dates and routes faster.
          </p>
        </SectionCard>
        <SectionCard>
          <h2 className="text-base font-semibold tracking-tight text-foreground">What it does not replace</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Local guides, LGU or park advisories, trail closure notices, and your own judgment on safety, fitness, and equipment.
          </p>
        </SectionCard>
      </section>
      <SectionCard className="mt-5">
        <SectionHeader
          eyebrow="Trust Layer"
          title="How the site stays transparent"
          description="These pages explain how the app works and where its mountain content comes from."
        />
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          <Link href="/methodology" className="rounded-[18px] border border-border bg-secondary px-4 py-4 transition hover:border-slate-300 hover:bg-card">
            <h3 className="text-base font-semibold tracking-tight text-foreground">Methodology</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">Weather providers, forecast windows, reliability tiers, and the limits of long-range planning.</p>
          </Link>
          <Link href="/sources" className="rounded-[18px] border border-border bg-secondary px-4 py-4 transition hover:border-slate-300 hover:bg-card">
            <h3 className="text-base font-semibold tracking-tight text-foreground">Sources and editorial policy</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">Mountain references, image credits, external guide links, and how source notes are used across the site.</p>
          </Link>
        </div>
      </SectionCard>
      <MountainLinkGrid
        title="Popular mountains to start with"
        description="These guides combine weather planning, best months, difficulty, and curated references."
        mountains={featuredMountains}
      />
    </PageShell>
  );
}
