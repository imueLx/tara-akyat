import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { DateWeatherCheckerShell } from "@/components/mountains/date-weather-checker-shell";
import { DateWeatherQueryBridge } from "@/components/mountains/date-weather-query-bridge";
import { DifficultyPill } from "@/components/mountains/difficulty-pill";
import { MountainPhotoLightbox } from "@/components/mountains/mountain-photo-lightbox";
import { TipsList } from "@/components/mountains/tips-list";
import { getMountainImageObjectPosition } from "@/lib/mountain-image";
import {
  buildMountainJsonLd,
  formatMountainMonthWindow,
  sortMountainBestMonths,
} from "@/lib/mountain-page-content";
import { getMountainBySlug, getMountains, getTipsByMountainId } from "@/lib/mountains";
import { DEFAULT_OG_IMAGE_PATH, SITE_NAME, absoluteUrl, getMountainMetaDescription, getMountainSearchKeywords, serializeJsonLd } from "@/lib/seo";

export async function generateStaticParams() {
  return getMountains().map((mountain) => ({ slug: mountain.slug }));
}

export async function generateMetadata({ params }: Pick<PageProps<"/mountains/[slug]">, "params">): Promise<Metadata> {
  const { slug } = await params;
  const mountain = getMountainBySlug(slug);

  if (!mountain) {
    return {
      title: "Mountain Not Found",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const pageUrl = `/mountains/${mountain.slug}`;
  const imageUrl = mountain.image_url || DEFAULT_OG_IMAGE_PATH;
  const description = getMountainMetaDescription(mountain);
  const pageTitle = `${mountain.name} Hiking Guide and Weather Planner`;

  return {
    title: pageTitle,
    description,
    keywords: getMountainSearchKeywords(mountain),
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      type: "article",
      siteName: SITE_NAME,
      title: `${pageTitle} | ${SITE_NAME}`,
      description,
      url: pageUrl,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: mountain.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${pageTitle} | ${SITE_NAME}`,
      description,
      images: [imageUrl],
    },
  };
}

export default async function MountainPage({ params }: PageProps<"/mountains/[slug]">) {
  const { slug } = await params;
  const mountain = getMountainBySlug(slug);

  if (!mountain) {
    notFound();
  }

  const tips = getTipsByMountainId(mountain.id);
  const orderedBestMonths = sortMountainBestMonths(mountain.best_months);
  const bestWindow = formatMountainMonthWindow(orderedBestMonths);
  const pageUrl = absoluteUrl(`/mountains/${mountain.slug}`);
  const pageTitle = `${mountain.name} Hiking Guide and Weather Planner`;
  const pageDescription = getMountainMetaDescription(mountain);
  const imageUrl = absoluteUrl(mountain.image_url || DEFAULT_OG_IMAGE_PATH);
  const homeUrl = absoluteUrl("/");
  const planningNote = orderedBestMonths.length
    ? `${mountain.name} is usually better planned around ${bestWindow}. Use the date checker above before locking in your hike.`
    : `${mountain.name} is still best treated as a date-by-date planning decision, because mountain conditions can change a lot from one week to the next.`;
  const difficultyNote =
    mountain.difficulty_source_note ??
    "This score is a mountain-level estimate. Route condition, season, weather, and closures can make the actual hike easier or harder.";

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-4 pb-20 pt-5 sm:px-6 sm:pt-7">
      <nav aria-label="Breadcrumb" className="mb-3 text-sm text-slate-500">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link href="/" className="transition hover:text-slate-800">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href="/mountains" className="transition hover:text-slate-800">
              Mountains
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-slate-800">
            {mountain.name}
          </li>
        </ol>
      </nav>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(
            buildMountainJsonLd({
              mountain,
              faqs: [],
              homeUrl,
              imageUrl,
              pageDescription,
              pageTitle,
              pageUrl,
              websiteId: absoluteUrl("/#website"),
            }),
          ),
        }}
      />
      <section className="overflow-hidden rounded-[32px] border border-slate-200/80 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.10)]">
        <div className="bg-[radial-gradient(circle_at_top_left,_rgba(14,116,144,0.10),_transparent_35%),linear-gradient(180deg,_rgba(248,250,252,0.96),_rgba(255,255,255,1))] p-5 sm:p-6">
          <MountainPhotoLightbox
            name={mountain.name}
            imageUrl={mountain.image_url}
            imageSourceUrl={mountain.image_source_url}
            objectPosition={getMountainImageObjectPosition(mountain.slug)}
          />
          {mountain.image_source_url ? (
            <div className="mb-3 text-[10px] leading-4 text-slate-500">
              <p>
                Photo: {mountain.image_credit ?? "Wikimedia Commons contributor"}
                {mountain.image_license ? ` • ${mountain.image_license}` : ""}
              </p>
              <a
                href={mountain.image_source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-[10px] font-medium text-sky-700 hover:text-sky-800"
              >
                Open image source
              </a>
            </div>
          ) : (
            <p className="mb-3 text-[10px] leading-4 text-slate-500">Photo source details are not available for this mountain yet.</p>
          )}
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="max-w-2xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Philippine hiking guide</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-[2.15rem]">{mountain.name}</h1>
              <p className="mt-1.5 text-sm text-slate-600 sm:text-[15px]">
                {mountain.province}, {mountain.region}
              </p>
            </div>
            <DifficultyPill
              score={mountain.difficulty_score}
              interactive
              note={difficultyNote}
              sourceUrl={mountain.difficulty_source_url}
            />
          </div>

          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-700 sm:text-[15px]">{mountain.summary}</p>
          <div className="mt-6 rounded-[28px] border border-slate-200/80 bg-white/90 p-4 shadow-[0_14px_32px_rgba(15,23,42,0.06)] sm:p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">At a glance</p>
            <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-[22px] bg-slate-50 px-4 py-3">
                <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Elevation</dt>
                <dd className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">{mountain.elevation_m.toLocaleString()} m</dd>
              </div>
              <div className="rounded-[22px] bg-slate-50 px-4 py-3">
                <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Best window</dt>
                <dd className="mt-1 text-lg font-semibold tracking-tight text-slate-950">{bestWindow}</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[1.05fr,0.95fr]">
        <Suspense fallback={<DateWeatherCheckerShell />}>
          <DateWeatherQueryBridge lat={mountain.lat} lon={mountain.lon} />
        </Suspense>
        <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <h2 className="text-base font-semibold text-slate-900">Curated hiking tips and references</h2>
          <p className="mt-1 text-sm text-slate-600">
            External references from travel guides, official sources, and Reddit discussions.
          </p>
          <div className="mt-3">
            <TipsList tips={tips} />
          </div>
        </section>
      </div>
      <section className="mt-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">Before you go</p>
            <h2 className="mt-1 text-base font-semibold tracking-tight text-slate-950 sm:text-lg">One quick planning note for {mountain.name}</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/methodology"
              className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-900 transition hover:border-slate-300 hover:bg-white"
            >
              Methodology
            </Link>
            <Link
              href="/sources"
              className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
            >
              Sources
            </Link>
          </div>
        </div>
        <p className="mt-3 text-sm leading-6 text-slate-600">{planningNote}</p>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Use the forecast on this page for the exact hike date, then check the methodology and sources if you want the deeper details behind the guidance.
        </p>
      </section>
    </main>
  );
}
