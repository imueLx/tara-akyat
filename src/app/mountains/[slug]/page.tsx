import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { DateWeatherChecker } from "@/components/mountains/date-weather-checker";
import { DifficultyPill } from "@/components/mountains/difficulty-pill";
import { MountainPhotoLightbox } from "@/components/mountains/mountain-photo-lightbox";
import { TipsList } from "@/components/mountains/tips-list";
import { getMountainImageObjectPosition } from "@/lib/mountain-image";
import { getCommunityTipByMountainId, getMountainBySlug, getMountains, getTipsByMountainId } from "@/lib/mountains";
import { DEFAULT_OG_IMAGE_PATH, SITE_NAME, absoluteUrl } from "@/lib/seo";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ date?: string }>;
};

const monthOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] as const;

function sortMonths(months: string[]): string[] {
  return [...months].sort((a, b) => monthOrder.indexOf(a as (typeof monthOrder)[number]) - monthOrder.indexOf(b as (typeof monthOrder)[number]));
}

function formatMonthWindow(months: string[]): string {
  const ordered = sortMonths(months);

  if (ordered.length === 0) {
    return "Year-round";
  }

  if (ordered.length === 1) {
    return ordered[0];
  }

  return `${ordered[0]} to ${ordered[ordered.length - 1]}`;
}

function getSeasonFeel(months: string[]): { eyebrow: string; title: string; body: string } {
  const ordered = sortMonths(months);
  const window = formatMonthWindow(ordered);
  const startsLateYear = ordered.some((month) => month === "Nov" || month === "Dec");
  const includesSummer = ordered.some((month) => month === "Mar" || month === "Apr" || month === "May");

  if (ordered.length <= 2) {
    return {
      eyebrow: "Narrower window",
      title: `Usually better around ${window}.`,
      body: "This mountain is best treated as having a tighter seasonal window, so these months are a smarter starting point before checking trail updates and the exact weather closer to your hike.",
    };
  }

  if (startsLateYear && includesSummer) {
    return {
      eyebrow: "Broader season",
      title: `Usually workable from ${window}.`,
      body: "This mountain has a longer workable season than most, which gives you a bit more flexibility when planning while still making it worth checking the exact conditions near your hike date.",
    };
  }

  if (startsLateYear) {
    return {
      eyebrow: "Typical dry-season pick",
      title: `Usually favored from ${window}.`,
      body: "This follows the more common cool-to-dry hiking season, so these months are best treated as a reliable planning guide rather than a guarantee for every trip.",
    };
  }

  return {
    eyebrow: "Season baseline",
    title: `Usually aim for ${window}.`,
    body: "The month range here works best as a general planning guide, then refined with day-specific weather and local trail conditions before you lock in the hike.",
  };
}

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
  const orderedBestMonths = sortMonths(mountain.best_months);
  const seasonFeel = getSeasonFeel(mountain.best_months);
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

          {communityTip ? (
            <div className="mt-5 rounded-[24px] border border-orange-200/80 bg-[linear-gradient(135deg,rgba(255,247,237,0.95),rgba(255,251,235,0.92))] px-4 py-4 shadow-[0_14px_30px_rgba(251,146,60,0.08)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-orange-700">From hikers</p>
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

          <div className="mt-6 grid gap-3 lg:grid-cols-[1.1fr,0.9fr]">
            <div className="rounded-[28px] border border-slate-200/80 bg-white/90 p-4 shadow-[0_14px_32px_rgba(15,23,42,0.06)] sm:p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">At a glance</p>
              <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-[22px] bg-slate-50 px-4 py-3">
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Elevation</dt>
                  <dd className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">{mountain.elevation_m.toLocaleString()} m</dd>
                </div>
                <div className="rounded-[22px] bg-slate-50 px-4 py-3">
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Best months</dt>
                  <dd className="mt-2 flex flex-wrap gap-2">
                    {orderedBestMonths.map((month) => (
                      <span
                        key={month}
                        className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-800 shadow-[0_4px_10px_rgba(15,23,42,0.04)]"
                      >
                        {month}
                      </span>
                    ))}
                  </dd>
                  <p className="mt-2 text-xs leading-5 text-slate-600">Typical hiking window: {formatMonthWindow(orderedBestMonths)}.</p>
                </div>
              </dl>
            </div>
            <div className="rounded-[28px] border border-slate-200/80 bg-slate-950 px-4 py-4 text-slate-50 shadow-[0_20px_40px_rgba(15,23,42,0.18)] sm:p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">{seasonFeel.eyebrow}</p>
              <p className="mt-3 text-lg font-semibold tracking-tight">{seasonFeel.title}</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                {seasonFeel.body}
              </p>
            </div>
          </div>
        </div>
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
