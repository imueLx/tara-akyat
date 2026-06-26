import Link from "next/link";

import {
  Breadcrumb,
  PageHero,
  PageShell,
  SectionCard,
  SectionHeader,
} from "@/components/layout/page-primitives";
import { FaqSection } from "@/components/seo/faq-section";
import { absoluteUrl, serializeJsonLd } from "@/lib/seo";
import type { Mountain } from "@/types/hiking";

type FaqItem = {
  question: string;
  answer: string;
};

type SupportLink = {
  href: string;
  label: string;
  description: string;
};

type Props = {
  eyebrow: string;
  title: string;
  description: string;
  pathname: string;
  breadcrumbLabel: string;
  intro: string[];
  faqs: readonly FaqItem[];
  mountains: Mountain[];
  emptyState: string;
  supportLinks?: readonly SupportLink[];
};

export function TaxonomyHubPage({
  eyebrow,
  title,
  description,
  pathname,
  breadcrumbLabel,
  intro,
  faqs,
  mountains,
  emptyState,
  supportLinks = [],
}: Props) {
  const featuredMountains = mountains.slice(0, 12);
  const pageUrl = absoluteUrl(pathname);

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
                    name: breadcrumbLabel,
                    item: pageUrl,
                  },
                ],
              },
              {
                "@type": "CollectionPage",
                "@id": `${pageUrl}#webpage`,
                name: title,
                description,
                url: pageUrl,
                isPartOf: {
                  "@id": absoluteUrl("/#website"),
                },
              },
              {
                "@type": "ItemList",
                name: title,
                numberOfItems: mountains.length,
                itemListOrder: "https://schema.org/ItemListUnordered",
                url: pageUrl,
                itemListElement: mountains.slice(0, 12).map((mountain, index) => ({
                  "@type": "ListItem",
                  position: index + 1,
                  url: absoluteUrl(`/mountains/${mountain.slug}`),
                  name: mountain.name,
                })),
              },
              {
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
              },
            ],
          }),
        }}
      />
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: breadcrumbLabel }]} />
      <PageHero eyebrow={eyebrow} title={title}>
        {intro.map((paragraph) => (
          <p key={paragraph} className="mt-2 text-sm leading-6 text-muted-foreground">
            {paragraph}
          </p>
        ))}
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-full border border-border bg-secondary px-3 py-1.5 text-xs font-semibold text-secondary-foreground">
            {mountains.length} matching mountain guides
          </span>
          <Link
            href="/mountains"
            className="inline-flex items-center rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground transition hover:border-slate-300"
          >
            Browse all mountains
          </Link>
        </div>
      </PageHero>

      {supportLinks.length > 0 ? (
        <section className="mt-5 grid gap-3 lg:grid-cols-3">
          {supportLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-[22px] border border-border bg-card px-4 py-4 shadow-[0_12px_28px_rgba(15,23,42,0.04)] transition hover:border-slate-300"
            >
              <h2 className="text-base font-semibold tracking-tight text-foreground">{link.label}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{link.description}</p>
            </Link>
          ))}
        </section>
      ) : null}

      {featuredMountains.length > 0 ? (
        <SectionCard className="mt-5">
          <SectionHeader
            eyebrow="Featured Matches"
            title="Mountain guides for this topic"
            description="A fast shortlist before you open the full guide and date checker."
          />
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {featuredMountains.map((mountain) => (
              <Link
                key={mountain.id}
                href={`/mountains/${mountain.slug}`}
                className="rounded-[18px] border border-border bg-secondary px-4 py-4 transition hover:border-slate-300 hover:bg-card"
              >
                <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                  {mountain.province}, {mountain.region}
                </p>
                <h3 className="mt-2 text-base font-semibold tracking-tight text-foreground">{mountain.name}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{mountain.summary}</p>
              </Link>
            ))}
          </div>
        </SectionCard>
      ) : null}

      <SectionCard className="mt-5">
        <SectionHeader
          eyebrow="All Matches"
          title="Every matching mountain guide"
          description="Open any guide to check weather by date, difficulty, and best months."
        />
        {mountains.length > 0 ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {mountains.map((mountain) => (
              <Link
                key={mountain.slug}
                href={`/mountains/${mountain.slug}`}
                className="rounded-[18px] border border-border bg-secondary px-4 py-3 transition hover:border-slate-300 hover:bg-card"
              >
                <p className="text-sm font-semibold text-foreground">{mountain.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {mountain.province}, {mountain.region}
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm leading-6 text-muted-foreground">{emptyState}</p>
        )}
      </SectionCard>

      <FaqSection
        eyebrow="FAQ"
        title={`${breadcrumbLabel} FAQ`}
        description="Short answers built around the common searches hikers make before choosing a mountain."
        faqs={faqs}
      />
    </PageShell>
  );
}
