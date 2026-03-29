import type { Mountain } from "@/types/hiking";

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
  return `Check hiking weather by date for ${mountainCount} Philippine mountains across ${regions.join(", ")}. Helpful for searches like uulan ba bukas, weather sa Mt. Ulap, and best hiking months before your trip.`;
}

export function getRegionPageDescription(region: string, mountainCount: number): string {
  return `${region} mountain guides and hiking weather planning for ${mountainCount} Philippine hikes. Compare routes, best months, and date-based weather checks before your trip.`;
}

export function getMonthPageDescription(month: string, mountainCount: number): string {
  return `Philippine mountain guides for hikes commonly planned in ${month}. Explore ${mountainCount} matching mountains, best months, and weather-by-date planning before you go.`;
}

export function getDifficultyPageDescription(levelName: string, mountainCount: number): string {
  return `${levelName} Philippine mountain guides for ${mountainCount} hikes. Use this page to shortlist mountains by route difficulty, best months, and weather planning support.`;
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

export function getMountainMetaDescription(mountain: Mountain): string {
  const bestMonthsWindow = formatBestMonthsWindow(mountain.best_months);
  const bestMonthsSnippet = bestMonthsWindow ? ` Typical hiking window: ${bestMonthsWindow}.` : "";

  return `${mountain.name} hiking guide for ${formatMountainLocation(mountain)}. Check weather by date, elevation, ${mountain.difficulty.toLowerCase()} difficulty (${mountain.difficulty_score}/9), best hiking months, and trail notes before your hike.${bestMonthsSnippet}`;
}

export function getHomeSearchKeywords(featuredMountainNames: string[]): string[] {
  return [
    "Philippines hiking weather",
    "mountain weather Philippines",
    "hiking weather by date",
    "uulan ba bukas",
    "uulan ba sa bundok",
    "safe ba mag hike bukas",
    "weather check bago mag hike",
    "bundok weather forecast",
    ...featuredMountainNames.flatMap((name) => [
      `${name} weather`,
      `${name} weather bukas`,
      `uulan ba sa ${name}`,
      `best months sa ${name}`,
    ]),
  ];
}

export function getMountainSearchKeywords(mountain: Mountain): string[] {
  return [
    `${mountain.name} weather`,
    `${mountain.name} weather tomorrow`,
    `${mountain.name} weather bukas`,
    `uulan ba sa ${mountain.name}`,
    `${mountain.name} best months`,
    `best months sa ${mountain.name}`,
    `${mountain.name} hiking guide`,
    `${mountain.name} difficulty`,
    `${mountain.name} elevation`,
    `${mountain.name} date hike`,
  ];
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

export function getDifficultySearchKeywords(levelName: string): string[] {
  const normalizedLevel = levelName.toLowerCase();

  return [
    `${normalizedLevel} hikes Philippines`,
    `${normalizedLevel} mountain guides`,
    `${normalizedLevel} bundok Philippines`,
    `${normalizedLevel} hiking weather`,
  ];
}

