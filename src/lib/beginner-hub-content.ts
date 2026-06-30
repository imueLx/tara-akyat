import type { Mountain } from "@/types/hiking";

import { formatMountainMonthWindow, sortMountainBestMonths } from "@/lib/mountain-page-content";

export type BeginnerHubFaq = {
  question: string;
  answer: string;
};

export function getBeginnerHubIntro(mountainCount: number): string[] {
  return [
    "This page is for hikers searching for beginner-friendly mountains in the Philippines—your first ridge walk, a shorter day trip, or an easier climb before moving up in difficulty.",
    `Compare ${mountainCount} lower-difficulty guides below, then open any mountain page for best months, trail notes, and a date-based weather check before you commit to the hike.`,
    "Difficulty scores here are planning shortcuts. Weather, heat, rain, and trail closures can still make an easier route feel harder on the day.",
  ];
}

export function getBeginnerHubFaqs(mountainCount: number): readonly BeginnerHubFaq[] {
  return [
    {
      question: "What are good beginner hikes in the Philippines?",
      answer: `This hub lists ${mountainCount} mountains with lower difficulty scores (1–3 out of 9). Popular starting points include day hikes with shorter ridge walks and more approachable elevation gain. Open any guide for best months and weather planning.`,
    },
    {
      question: "Is mountain hiking for beginners in the Philippines safe?",
      answer:
        "It can be, when you pick the right mountain, check the weather for your exact hike date, bring basics like water and sun protection, and avoid pushing through heavy rain or strong wind on exposed ridges. Use this page to shortlist easier routes, then read the full guide before going.",
    },
    {
      question: "How do I choose a beginner mountain hike?",
      answer:
        "Start with difficulty score, travel time, and best hiking months. Then use the date checker on each mountain page to see whether your target day looks workable. A lower-score hike in bad weather is still riskier than a well-timed easier route.",
    },
    {
      question: "Can I check weather before a beginner hike?",
      answer:
        "Yes. Each mountain guide includes date-based weather planning built for hiking—not just a generic city forecast. Check a few days before your trip when day-level forecasts are more reliable.",
    },
    {
      question: "Does this page help with searches like 'hiking for beginners Philippines'?",
      answer:
        "Yes. It groups approachable Philippine mountains in one place so you can compare beginner hike options, best months, and weather planning without starting from scratch.",
    },
  ] as const;
}

export function getBeginnerHubPicks(mountains: Mountain[]): Array<{ mountain: Mountain; reason: string }> {
  const featuredSlugs = ["mt-ulap", "mt-buntis", "mt-gulugod-baboy", "mt-talamitam", "osmena-peak"];

  const picks = featuredSlugs.flatMap((slug) => {
    const mountain = mountains.find((entry) => entry.slug === slug);
    if (!mountain) {
      return [];
    }

    const bestWindow = formatMountainMonthWindow(sortMountainBestMonths(mountain.best_months));
    return [
      {
        mountain,
        reason: `${mountain.elevation_m.toLocaleString()} m elevation • usually better around ${bestWindow}`,
      },
    ];
  });

  if (picks.length >= 3) {
    return picks;
  }

  return mountains.slice(0, 5).map((mountain) => ({
    mountain,
    reason: `${mountain.province}, ${mountain.region} • difficulty ${mountain.difficulty_score}/9`,
  }));
}
