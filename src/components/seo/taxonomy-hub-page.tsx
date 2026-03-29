import Link from "next/link";

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
              {breadcrumbLabel}
            </li>
          </ol>
        </nav>
        <section className="rounded-2xl border border-slate-200 bg-white px-4 py-4 sm:px-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-700">{eyebrow}</p>
          <h1 className="mt-2 text-xl font-semibold tracking-tight text-slate-950 sm:text-2xl">{title}</h1>
          {intro.map((paragraph) => (
            <p key={paragraph} className="mt-2 text-sm leading-6 text-slate-600">
              {paragraph}
            </p>
          ))}
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-800">
              {mountains.length} matching mountain guides
            </span>
            <Link
              href="/mountains"
              className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-900 transition hover:border-slate-300"
            >
              Browse all mountains
            </Link>
          </div>
        </section>

        {supportLinks.length > 0 ? (
          <section className="mt-5 grid gap-3 lg:grid-cols-3">
            {supportLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-[22px] border border-slate-200/80 bg-white px-4 py-4 shadow-[0_12px_28px_rgba(15,23,42,0.04)] transition hover:border-slate-300"
              >
                <h2 className="text-base font-semibold tracking-tight text-slate-950">{link.label}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">{link.description}</p>
              </Link>
            ))}
          </section>
        ) : null}

        {featuredMountains.length > 0 ? (
          <section className="mt-5 rounded-[22px] border border-slate-200/80 bg-white px-4 py-4 shadow-[0_12px_28px_rgba(15,23,42,0.04)] sm:px-5">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">Featured Matches</p>
                <h2 className="mt-1 text-base font-semibold tracking-tight text-slate-950 sm:text-lg">Mountain guides for this topic</h2>
              </div>
              <p className="text-sm text-slate-500">A fast shortlist before you open the full guide and date checker.</p>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
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
        ) : null}

        <section className="mt-5 rounded-[22px] border border-slate-200/80 bg-white px-4 py-4 shadow-[0_12px_28px_rgba(15,23,42,0.04)] sm:px-5">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">All Matches</p>
              <h2 className="mt-1 text-base font-semibold tracking-tight text-slate-950 sm:text-lg">Every matching mountain guide</h2>
            </div>
            <p className="text-sm text-slate-500">Open any guide to check weather by date, difficulty, and best months.</p>
          </div>
          {mountains.length > 0 ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {mountains.map((mountain) => (
                <Link
                  key={mountain.slug}
                  href={`/mountains/${mountain.slug}`}
                  className="rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-3 transition hover:border-slate-300 hover:bg-white"
                >
                  <p className="text-sm font-semibold text-slate-900">{mountain.name}</p>
                  <p className="mt-1 text-sm text-slate-600">
                    {mountain.province}, {mountain.region}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm leading-6 text-slate-600">{emptyState}</p>
          )}
        </section>

        <FaqSection
          eyebrow="FAQ"
          title={`${breadcrumbLabel} FAQ`}
          description="Short answers built around the common searches hikers make before choosing a mountain."
          faqs={faqs}
        />
      </main>
    </div>
  );
}
