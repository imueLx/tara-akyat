import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { DateWeatherChecker } from "@/components/mountains/date-weather-checker";
import { DifficultyPill } from "@/components/mountains/difficulty-pill";
import { TipsList } from "@/components/mountains/tips-list";
import { getMountainVerificationSummary } from "@/lib/content-quality";
import { getMountainImageObjectPosition } from "@/lib/mountain-image";
import { getCommunityTipByMountainId, getMountainBySlug, getMountains, getTipsByMountainId } from "@/lib/mountains";
import { DEFAULT_OG_IMAGE_PATH, SITE_NAME, absoluteUrl } from "@/lib/seo";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ date?: string }>;
};

export async function generateStaticParams() {
  return getMountains().map((mountain) => ({ slug: mountain.slug }));
}

export async function generateMetadata({ params }: Pick<Props, "params">): Promise<Metadata> {
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
  const description = `${mountain.name} in ${mountain.province}, ${mountain.region}. Elevation ${mountain.elevation_m.toLocaleString()} m. ${mountain.summary}`;

  return {
    title: `${mountain.name} Hiking Guide`,
    description,
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      type: "article",
      title: `${mountain.name} - ${SITE_NAME}`,
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
      title: `${mountain.name} - ${SITE_NAME}`,
      description,
      images: [imageUrl],
    },
  };
}

export default async function MountainPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { date } = await searchParams;
  const mountain = getMountainBySlug(slug);

  if (!mountain) {
    notFound();
  }

  const tips = getTipsByMountainId(mountain.id);
  const communityTip = getCommunityTipByMountainId(mountain.id);
  const verification = getMountainVerificationSummary(mountain);
  const difficultyNote =
    mountain.difficulty_source_note ??
    "This score is a mountain-level estimate. Route condition, season, weather, and closures can make the actual hike easier or harder.";

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-4 pb-20 pt-5 sm:px-6 sm:pt-7">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "TouristAttraction",
            name: mountain.name,
            description: mountain.summary,
            image: absoluteUrl(mountain.image_url),
            url: absoluteUrl(`/mountains/${mountain.slug}`),
            geo: {
              "@type": "GeoCoordinates",
              latitude: mountain.lat,
              longitude: mountain.lon,
            },
            address: {
              "@type": "PostalAddress",
              addressRegion: mountain.province,
              addressCountry: "PH",
            },
            additionalProperty: [
              {
                "@type": "PropertyValue",
                name: "Elevation (m)",
                value: mountain.elevation_m,
              },
              {
                "@type": "PropertyValue",
                name: "Difficulty Score",
                value: mountain.difficulty_score,
              },
            ],
          }),
        }}
      />
      <div className="mb-3">
        <Link
          href="/mountains"
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
        >
          <span aria-hidden="true">←</span>
          <span>Back to list</span>
        </Link>
      </div>
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="relative mb-4 h-52 w-full overflow-hidden rounded-2xl sm:h-64">
          <Image
            src={mountain.image_url}
            alt={mountain.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 960px"
            preload
            quality={75}
            style={{ objectPosition: getMountainImageObjectPosition(mountain.slug) }}
          />
        </div>
        {mountain.image_source_url ? (
          <div className="mb-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-xs text-slate-600">
            <p className="font-medium text-slate-900">
              Photo credit: {mountain.image_credit ?? "Wikimedia Commons contributor"}
            </p>
            {mountain.image_license ? <p className="mt-1">License: {mountain.image_license}</p> : null}
            <a
              href={mountain.image_source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block font-medium text-sky-700 hover:text-sky-800"
            >
              Open image source
            </a>
          </div>
        ) : (
          <p className="mb-3 text-xs text-slate-500">Exact mountain photo is still pending verification for this mountain.</p>
        )}
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">{mountain.name}</h1>
            <p className="mt-1 text-sm text-slate-600">
              {mountain.province}, {mountain.region}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className={`rounded-full border px-2 py-1 text-[11px] font-semibold ${verification.photoTone}`}>
                {verification.photoLabel}
              </span>
              <span className={`rounded-full border px-2 py-1 text-[11px] font-semibold ${verification.difficultyTone}`}>
                {verification.difficultyLabel}
              </span>
            </div>
          </div>
          <DifficultyPill
            score={mountain.difficulty_score}
            interactive
            note={difficultyNote}
            sourceUrl={mountain.difficulty_source_url}
          />
        </div>

        <p className="mt-3 text-sm text-slate-700">{mountain.summary}</p>

        {communityTip ? (
          <div className="mt-4 rounded-2xl border border-orange-200 bg-orange-50/70 px-4 py-4">
            <p className="text-[11px] uppercase tracking-[0.12em] text-orange-700">From hikers</p>
            <p className="mt-2 text-sm leading-6 text-slate-700">{communityTip.note}</p>
            <a
              href={communityTip.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block text-xs font-semibold text-sky-700 hover:text-sky-800"
            >
              Open Reddit source
            </a>
          </div>
        ) : null}

        <dl className="mt-4 grid grid-cols-2 gap-2 text-xs text-slate-700 sm:grid-cols-4">
          <div className="rounded-xl bg-slate-50 px-3 py-2">
            <dt>Elevation</dt>
            <dd className="font-semibold">{mountain.elevation_m.toLocaleString()} m</dd>
          </div>
          <div className="rounded-xl bg-slate-50 px-3 py-2">
            <dt>Latitude</dt>
            <dd className="font-semibold">{mountain.lat}</dd>
          </div>
          <div className="rounded-xl bg-slate-50 px-3 py-2">
            <dt>Longitude</dt>
            <dd className="font-semibold">{mountain.lon}</dd>
          </div>
          <div className="rounded-xl bg-slate-50 px-3 py-2">
            <dt>Best months</dt>
            <dd className="font-semibold">{mountain.best_months.join(", ")}</dd>
          </div>
        </dl>
      </section>
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[1.05fr,0.95fr]">
        <DateWeatherChecker lat={mountain.lat} lon={mountain.lon} initialDate={date} />
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
    </main>
  );
}
