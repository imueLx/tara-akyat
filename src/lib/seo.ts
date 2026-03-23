import type { Mountain } from "@/types/hiking";

export const SITE_NAME = "Tara Akyat";
export const SITE_ALTERNATE_NAME = "Tara Akyat PH";
export const SITE_TAGLINE = "Philippines hiking weather planner and mountain guides";
export const SITE_DESCRIPTION = "Plan safer hikes in the Philippines with date-based weather checks, forecast reliability, and mountain guides.";
export const DEFAULT_OG_IMAGE_PATH = "/mountains/verified/mt-pulag.jpg";
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

  if (months.length === 1) {
    return months[0];
  }

  return `${months[0]} to ${months[months.length - 1]}`;
}

export function getBrowsePageDescription(mountainCount: number, regions: string[]): string {
  return `Browse ${mountainCount} Philippine mountains across ${regions.join(", ")}. Filter by region and difficulty, then open mountain guides with weather planning support.`;
}

export function getMountainMetaDescription(mountain: Mountain): string {
  const bestMonthsWindow = formatBestMonthsWindow(mountain.best_months);
  const bestMonthsSnippet = bestMonthsWindow ? ` Typical hiking window: ${bestMonthsWindow}.` : "";

  return `${mountain.name} hiking guide for ${formatMountainLocation(mountain)}. Check elevation, ${mountain.difficulty.toLowerCase()} difficulty (${mountain.difficulty_score}/9), weather planning, and trail notes before your hike.${bestMonthsSnippet}`;
}
