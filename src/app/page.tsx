import type { Metadata } from "next";

import { HomePlannerClient } from "@/components/mountains/home-planner-client";
import { getMountains } from "@/lib/mountains";
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
  const faqs = [
    {
      question: "Uulan ba sa Mt. Ulap sa napili kong date?",
      answer: "Gamitin ang weather checker para makita ang rain chance, ulan in mm, at recommendation para sa date mo sa Mt. Ulap.",
    },
    {
      question: "Paano mag weather check bago mag-hike sa Philippines?",
      answer: "Piliin ang mountain at date, tapos tingnan ang weather guidance at forecast trust para mas safe ang hike plan.",
    },
    {
      question: "Anong Tagalog words ang puwedeng gamitin sa hiking weather search?",
      answer: "Common searches include: uulan ba sa bundok, weather check Mt. Ulap, maulan ba sa Mt. Pulag, at pwede ba mag-hike bukas.",
    },
    {
      question: "Best months for hiking sa Pilipinas?",
      answer: "Depende sa mountain, pero puwede mong i-check ang best months sa bawat mountain page at i-verify pa rin ang weather forecast sa exact hike date.",
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
        <section className="mt-4 rounded-2xl border border-slate-200 bg-white px-4 py-4 sm:px-5">
          <h2 className="text-base font-semibold text-slate-950 sm:text-lg">Quick hiking weather FAQ</h2>
          <div className="mt-3 space-y-2">
            {faqs.map((faq) => (
              <details key={faq.question} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
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
