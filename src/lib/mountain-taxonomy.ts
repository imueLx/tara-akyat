import { getMountains, getRegions, getTipsByMountainId } from "@/lib/mountains";
import type { Mountain } from "@/types/hiking";

export const ALL_MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

export type MonthName = (typeof ALL_MONTHS)[number];
export type DifficultyLevel = "beginner" | "intermediate" | "advanced";

type DifficultyHub = {
  slug: DifficultyLevel;
  name: string;
  minScore: number;
  maxScore: number;
  description: string;
};

const difficultyHubs: DifficultyHub[] = [
  {
    slug: "beginner",
    name: "Beginner",
    minScore: 1,
    maxScore: 3,
    description: "Lower-score hikes for newer hikers, shorter ridge walks, and more approachable day trips.",
  },
  {
    slug: "intermediate",
    name: "Intermediate",
    minScore: 4,
    maxScore: 6,
    description: "Steadier climbs that ask for more endurance, trail confidence, and weather awareness.",
  },
  {
    slug: "advanced",
    name: "Advanced",
    minScore: 7,
    maxScore: 9,
    description: "Longer or tougher climbs where weather timing, route condition, and preparation matter much more.",
  },
];

type HubSummary = {
  slug: string;
  name: string;
  href: string;
  mountainCount: number;
  description?: string;
};

function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function sortMountainsForHub(mountains: Mountain[]): Mountain[] {
  return [...mountains].sort((left, right) => {
    const tipDelta = getTipsByMountainId(right.id).length - getTipsByMountainId(left.id).length;
    if (tipDelta !== 0) {
      return tipDelta;
    }

    return left.name.localeCompare(right.name);
  });
}

function sharedMonthCount(left: Mountain, right: Mountain): number {
  const rightMonths = new Set(right.best_months);
  return left.best_months.filter((month) => rightMonths.has(month)).length;
}

export function getRegionSlug(region: string): string {
  return slugify(region);
}

export function getRegionBySlug(slug: string): string | null {
  return getRegions().find((region) => getRegionSlug(region) === slug) ?? null;
}

export function getRegionHubs(): HubSummary[] {
  const mountains = getMountains();

  return getRegions().map((region) => ({
    slug: getRegionSlug(region),
    name: region,
    href: `/regions/${getRegionSlug(region)}`,
    mountainCount: mountains.filter((mountain) => mountain.region === region).length,
  }));
}

export function getMountainsForRegionSlug(slug: string): Mountain[] {
  const region = getRegionBySlug(slug);
  if (!region) {
    return [];
  }

  return sortMountainsForHub(getMountains().filter((mountain) => mountain.region === region));
}

export function getMonthBySlug(slug: string): MonthName | null {
  return ALL_MONTHS.find((month) => slugify(month) === slug) ?? null;
}

export function getMonthHubs(): HubSummary[] {
  const mountains = getMountains();

  return ALL_MONTHS.map((month) => ({
    slug: slugify(month),
    name: month,
    href: `/months/${slugify(month)}`,
    mountainCount: mountains.filter((mountain) => mountain.best_months.includes(month)).length,
  }));
}

export function getActiveMonthHubs(limit?: number): HubSummary[] {
  const hubs = getMonthHubs()
    .filter((hub) => hub.mountainCount > 0)
    .sort((left, right) => right.mountainCount - left.mountainCount || ALL_MONTHS.indexOf(left.name as MonthName) - ALL_MONTHS.indexOf(right.name as MonthName));

  return typeof limit === "number" ? hubs.slice(0, limit) : hubs;
}

export function getMountainsForMonthSlug(slug: string): Mountain[] {
  const month = getMonthBySlug(slug);
  if (!month) {
    return [];
  }

  return sortMountainsForHub(getMountains().filter((mountain) => mountain.best_months.includes(month)));
}

export function getDifficultyHubs(): Array<HubSummary & { slug: DifficultyLevel }> {
  const mountains = getMountains();

  return difficultyHubs.map((hub) => ({
    slug: hub.slug,
    name: hub.name,
    href: `/difficulty/${hub.slug}`,
    mountainCount: mountains.filter((mountain) => mountain.difficulty_score >= hub.minScore && mountain.difficulty_score <= hub.maxScore).length,
    description: hub.description,
  }));
}

export function getDifficultyHubBySlug(slug: string): DifficultyHub | null {
  return difficultyHubs.find((hub) => hub.slug === slug) ?? null;
}

export function getMountainsForDifficultySlug(slug: string): Mountain[] {
  const hub = getDifficultyHubBySlug(slug);
  if (!hub) {
    return [];
  }

  return sortMountainsForHub(
    getMountains().filter((mountain) => mountain.difficulty_score >= hub.minScore && mountain.difficulty_score <= hub.maxScore),
  );
}

export function getDifficultyLevelForMountain(mountain: Mountain): DifficultyLevel {
  if (mountain.difficulty_score <= 3) {
    return "beginner";
  }

  if (mountain.difficulty_score <= 6) {
    return "intermediate";
  }

  return "advanced";
}

export function getRelatedMountains(mountain: Mountain, limit = 4): Mountain[] {
  return getMountains()
    .filter((candidate) => candidate.slug !== mountain.slug)
    .map((candidate) => {
      let score = 0;

      if (candidate.region === mountain.region) {
        score += 5;
      }

      if (getDifficultyLevelForMountain(candidate) === getDifficultyLevelForMountain(mountain)) {
        score += 3;
      }

      score += sharedMonthCount(candidate, mountain) * 2;
      score -= Math.abs(candidate.difficulty_score - mountain.difficulty_score);

      return { candidate, score };
    })
    .sort((left, right) => right.score - left.score || left.candidate.name.localeCompare(right.candidate.name))
    .slice(0, limit)
    .map((item) => item.candidate);
}
