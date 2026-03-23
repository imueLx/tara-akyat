import type { Metadata } from "next";

import { HomePlannerClient } from "@/components/mountains/home-planner-client";
import { getMountains, getRegions } from "@/lib/mountains";
import { DEFAULT_OG_IMAGE_PATH, SITE_NAME, absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Hiking Weather Check Philippines (Uulan Ba Sa Bundok?)",
  description:
    "Check if uulan sa bundok like Mt. Ulap, Mt. Pulag, and more. Tagalog-English hiking weather checker with date-based forecast and safer hike guidance.",
  keywords: [
    "uulan ba sa mt ulap",
    "uulan ba sa bundok",
    "weather check mt ulap",
    "hiking weather philippines",
    "panahon sa bundok",
    "check weather bago mag hike",
    "ulan forecast bundok",
    "maulan ba sa mt pulag",
    "weather sa bundok ngayon",
    "pwede ba mag hike bukas",
    "best months for hiking",
    "best months to hike philippines",
    "best month mag hike",
    "pinakamagandang buwan mag hike",
    "tara akyat weather checker",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: `${SITE_NAME} - Uulan Ba Sa Bundok? Weather Check PH`,
    description: "Check mountain weather by date (Tagalog-English). See if uulan sa Mt. Ulap, Mt. Pulag, and more before your hike.",
    url: "/",
    images: [
      {
        url: DEFAULT_OG_IMAGE_PATH,
        width: 1200,
        height: 630,
        alt: "Tara Akyat weather checker for Philippine mountains",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} - Uulan Ba Sa Bundok?`,
    description: "Tagalog-English hiking weather checker for Mt. Ulap, Mt. Pulag, and other PH mountains.",
    images: [DEFAULT_OG_IMAGE_PATH],
  },
};

type Props = {
  searchParams?: Promise<{ date?: string }>;
};

export default async function Home({ searchParams }: Props) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const initialDate = resolvedSearchParams?.date;
  const regionNames = getRegions();
  const mountainCount = getMountains().length;
  const faqs = [
    {
      question: "Anong ginagawa ng Tara Akyat?",
      answer: `Tara Akyat is a hiking weather checker for ${mountainCount} Philippine mountains across ${regionNames.join(", ")}. You can compare rain chance, wind, and hiking conditions by date before your climb.`,
    },
    {
      question: "Puwede ba akong mag-check ng weather for different mountains, hindi lang Mt. Ulap?",
      answer: "Yes. You can check multiple mountains like Mt. Pulag, Mt. Apo, Mt. Daraitan, Mt. Batulao, and many more. The site is meant for broad Philippine mountain weather checking, not just one trail.",
    },
    {
      question: "Kailan pinaka-useful mag-check ng hiking weather?",
      answer: "The most useful time is usually a few days before your hike, when day-level forecasts are more reliable. For far-ahead dates, use the result as planning guidance and recheck closer to the actual climb.",
    },
    {
      question: "Anong Tagalog or Taglish searches ang bagay sa site na ito?",
      answer: "Common searches include: uulan ba sa bundok, weather check bago mag-hike, maulan ba sa Mt. Pulag, weather sa bundok ngayon, and puwede ba mag-hike bukas.",
    },
    {
      question: "Best months for hiking sa Pilipinas?",
      answer: "It depends on the mountain, region, and season. Each mountain page includes best months to hike, but you should still check the actual weather forecast for your target date before going.",
    },
    {
      question: "Useful ba ito for beginners?",
      answer: "Yes. Beginners can use the site to compare easier mountains, see basic weather risk signals, and avoid obviously bad weather before choosing a beginner-friendly hike.",
    },
  ] as const;
  const mountains = getMountains().map((mountain) => ({
    id: mountain.id,
    name: mountain.name,
    slug: mountain.slug,
    region: mountain.region,
    province: mountain.province,
    lat: mountain.lat,
    lon: mountain.lon,
    image_url: mountain.image_url,
    image_verified: mountain.image_verified,
    difficulty_source_url: mountain.difficulty_source_url,
    difficulty_score: mountain.difficulty_score,
    elevation_m: mountain.elevation_m,
    best_months: mountain.best_months,
    summary: mountain.summary,
  }));

  return (
    <div className="min-h-screen pb-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "WebApplication",
                name: SITE_NAME,
                url: absoluteUrl("/"),
                applicationCategory: "TravelApplication",
                operatingSystem: "Web",
              },
              {
                "@type": "FAQPage",
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
      <main className="mx-auto max-w-6xl px-3 pt-3 sm:px-5 sm:pt-5 md:px-6 md:pt-6">
        <section className="mb-4 rounded-2xl border border-slate-200 bg-white px-4 py-4 sm:px-5">
          <h1 className="text-xl font-semibold text-slate-950 sm:text-2xl">Hiking weather check for Philippine mountains</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Check rain chance, wind, and hiking conditions for your selected mountain and date.
          </p>
        </section>
        <section id="planner" className="scroll-mt-28 sm:scroll-mt-32">
          <HomePlannerClient mountains={mountains} initialDate={initialDate} />
        </section>
        <section className="mt-5 rounded-[22px] border border-slate-200/80 bg-white px-4 py-4 shadow-[0_12px_28px_rgba(15,23,42,0.04)] sm:px-5">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">FAQ</p>
              <h2 className="mt-1 text-base font-semibold tracking-tight text-slate-950 sm:text-lg">Quick hiking weather FAQ</h2>
            </div>
            <p className="text-sm text-slate-500">Short answers for common trip-planning questions.</p>
          </div>
          <div className="mt-4 space-y-2.5">
            {faqs.map((faq) => (
              <details key={faq.question} className="rounded-[18px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] px-4 py-3.5">
                <summary className="cursor-pointer text-sm font-semibold text-slate-900">{faq.question}</summary>
                <p className="mt-2 text-sm leading-6 text-slate-600">{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
