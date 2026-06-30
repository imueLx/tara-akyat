import type { Metadata } from "next";

import type { Mountain } from "@/types/hiking";

import { isValidDate } from "@/lib/date";
import { formatMountainMonthWindow } from "@/lib/mountain-page-content";

export const SITE_NAME = "Tara Akyat";
export const SITE_ALTERNATE_NAME = "Tara Akyat PH";
export const SITE_TAGLINE = "Philippines hiking weather planner and mountain guides";
export const SITE_DESCRIPTION = "Plan safer hikes in the Philippines with date-based weather checks, forecast reliability, and mountain guides.";
export const DEFAULT_OG_IMAGE_PATH = "/mountains/verified/mt-pulag.webp";
export const PRODUCTION_SITE_URL = "https://tara-akyat.vercel.app";
export const SITE_LOGO_PATH = "/brand/tara-akyat-mark.svg";
export const SITE_LOCALE = "en_PH";

function normalizeBaseUrl(rawValue: string | undefined): string | null {
  const value = rawValue?.trim();

  if (!value) {
    return null;
  }

  const withProtocol = value.startsWith("http://") || value.startsWith("https://") ? value : `https://${value}`;

  return withProtocol.endsWith("/") ? withProtocol.slice(0, -1) : withProtocol;
}

export function getBaseUrl(): string {
  const configuredSiteUrl = normalizeBaseUrl(process.env.NEXT_PUBLIC_SITE_URL);
  if (configuredSiteUrl) {
    return configuredSiteUrl;
  }

  // Fallback for Vercel deployments when NEXT_PUBLIC_SITE_URL is not configured.
  const vercelProductionUrl = normalizeBaseUrl(process.env.VERCEL_PROJECT_PRODUCTION_URL);
  if (vercelProductionUrl) {
    return vercelProductionUrl;
  }

  const productionSiteUrl = normalizeBaseUrl(PRODUCTION_SITE_URL);
  if (productionSiteUrl) {
    return productionSiteUrl;
  }

  const vercelPreviewUrl = normalizeBaseUrl(process.env.VERCEL_URL);
  if (vercelPreviewUrl) {
    return vercelPreviewUrl;
  }

  return "https://example.com";
}

export function absoluteUrl(pathname: string): string {
  const normalizedPathname = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${getBaseUrl()}${normalizedPathname}`;
}

export function serializeJsonLd(payload: unknown): string {
  return JSON.stringify(payload).replace(/</g, "\\u003c");
}

export function formatMountainLocation(mountain: Pick<Mountain, "province" | "region">): string {
  return `${mountain.province}, ${mountain.region}`;
}

export function getMountainImageAlt(mountain: Pick<Mountain, "name" | "province" | "region">): string {
  return `${mountain.name} hiking trail in ${formatMountainLocation(mountain)}`;
}

export function getDateQueryParamRobots(dateParam: string | undefined): Metadata["robots"] | undefined {
  if (dateParam && isValidDate(dateParam)) {
    return { index: false, follow: true };
  }

  return undefined;
}

export function formatBestMonthsWindow(months: string[]): string | null {
  if (months.length === 0) {
    return null;
  }

  return formatMountainMonthWindow(months);
}

export function getBrowsePageDescription(mountainCount: number, regions: string[]): string {
  return `Browse ${mountainCount} Philippine mountains across ${regions.join(", ")}. Filter by region and difficulty, then open mountain guides with weather planning support.`;
}

export function getHomeMetaDescription(mountainCount: number, regions: string[]): string {
  return `Plan Philippine hikes with date-based weather checks, beginner mountain guides, and best-month planning for ${mountainCount} mountains across ${regions.join(", ")}. Built for trip planning—not generic city forecasts.`;
}

export function getHomePageTitle(): string {
  return "Philippines Hiking Planner — Beginner Guides & Weather by Date";
}

export function getRegionPageDescription(region: string, mountainCount: number): string {
  return `${region} mountain guides and hiking weather planning for ${mountainCount} Philippine hikes. Compare routes, best months, and date-based weather checks before your trip.`;
}

export function getMonthPageDescription(month: string, mountainCount: number): string {
  return `Philippine mountain guides for hikes commonly planned in ${month}. Explore ${mountainCount} matching mountains, best months, and weather-by-date planning before you go.`;
}

export function getDifficultyPageTitle(levelSlug: string, levelName: string, mountainCount: number): string {
  if (levelSlug === "beginner") {
    return `Beginner Hikes in the Philippines — ${mountainCount} Mountain Guides`;
  }

  return `${levelName} Philippine Mountain Guides`;
}

export function getDifficultyPageDescription(levelSlug: string, levelName: string, mountainCount: number): string {
  if (levelSlug === "beginner") {
    return `Hiking for beginners in the Philippines: compare ${mountainCount} approachable day hikes with best months, difficulty notes, and date-based weather planning before your first climb.`;
  }

  return `${levelName} Philippine mountain guides for ${mountainCount} hikes. Shortlist mountains by route difficulty, best months, and weather planning support.`;
}

export function getTrustPageDescription(page: "about" | "methodology" | "sources"): string {
  if (page === "about") {
    return "Learn what Tara Akyat is for, who it helps, and how to use the site for Philippine hiking weather checks and mountain planning.";
  }

  if (page === "methodology") {
    return "See how Tara Akyat handles weather providers, forecast windows, reliability guidance, and long-range hiking planning for Philippine mountains.";
  }

  return "Review the source approach, editorial standards, and reference links behind Tara Akyat mountain guides and hiking weather content.";
}

export function isBeginnerMountain(mountain: Pick<Mountain, "difficulty_score">): boolean {
  return mountain.difficulty_score <= 3;
}

export function getMountainPageTitle(mountain: Mountain): string {
  const bestMonthsWindow = formatBestMonthsWindow(mountain.best_months);
  const monthsSnippet = bestMonthsWindow && bestMonthsWindow !== "Year-round" ? ` — Best Months: ${bestMonthsWindow}` : "";

  return `${mountain.name} Hiking Guide${monthsSnippet}`;
}

export function getMountainMetaDescription(mountain: Mountain): string {
  const bestMonthsWindow = formatBestMonthsWindow(mountain.best_months);
  const bestMonthsSnippet = bestMonthsWindow ? ` Best hiking window: ${bestMonthsWindow}.` : "";
  const beginnerSnippet = isBeginnerMountain(mountain) ? " Often picked for beginner hikes in the Philippines." : "";

  return `${mountain.name} hiking guide for ${formatMountainLocation(mountain)}.${beginnerSnippet} Plan your climb with best months, ${mountain.difficulty.toLowerCase()} difficulty (${mountain.difficulty_score}/9), elevation, and date-based weather checks before you go.${bestMonthsSnippet}`;
}

export function getHomeSearchKeywords(featuredMountainNames: string[]): string[] {
  return [
    "Philippines hiking planner",
    "hiking for beginners Philippines",
    "beginner hike Philippines",
    "beginner mountain hikes Philippines",
    "Philippines hiking weather",
    "hiking weather by date",
    "uulan ba bukas",
    "uulan ba sa bundok",
    "safe ba mag hike bukas",
    "weather check bago mag hike",
    ...featuredMountainNames.flatMap((name) => [
      `${name} hiking guide`,
      `best months sa ${name}`,
      `uulan ba sa ${name}`,
    ]),
  ];
}

export function getMountainSearchKeywords(mountain: Mountain): string[] {
  const keywords = [
    `${mountain.name} hiking guide`,
    `${mountain.name} best months`,
    `best months sa ${mountain.name}`,
    `${mountain.name} hiking weather`,
    `uulan ba sa ${mountain.name}`,
    `${mountain.name} difficulty`,
    `${mountain.name} elevation`,
    `${mountain.name} hike planning`,
  ];

  if (isBeginnerMountain(mountain)) {
    keywords.push(
      `${mountain.name} beginner hike`,
      `is ${mountain.name} good for beginners`,
      `beginner hike ${mountain.province}`,
    );
  }

  return keywords;
}

export function getRegionSearchKeywords(region: string): string[] {
  return [
    `${region} hiking`,
    `${region} mountain guides`,
    `${region} mountain weather`,
    `bundok sa ${region.toLowerCase()}`,
    `best hikes in ${region.toLowerCase()}`,
  ];
}

export function getMonthSearchKeywords(month: string): string[] {
  return [
    `best hikes in ${month.toLowerCase()}`,
    `mountains to hike in ${month.toLowerCase()}`,
    `bundok na okay sa ${month.toLowerCase()}`,
    `${month.toLowerCase()} hiking Philippines`,
  ];
}

export function getDifficultySearchKeywords(levelSlug: string, levelName: string): string[] {
  const normalizedLevel = levelName.toLowerCase();

  if (levelSlug === "beginner") {
    return [
      "hiking for beginners Philippines",
      "beginner hike Philippines",
      "beginner hiking Philippines",
      "beginner mountain hikes Philippines",
      "mountain hiking for beginners Philippines",
      "hike for beginners Philippines",
      "first time hiking Philippines",
      "easy hikes Philippines",
    ];
  }

  return [
    `${normalizedLevel} hikes Philippines`,
    `${normalizedLevel} mountain guides`,
    `${normalizedLevel} bundok Philippines`,
    `${normalizedLevel} hiking weather`,
  ];
}

