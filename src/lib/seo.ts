export const SITE_NAME = "Tara Akyat";
export const SITE_DESCRIPTION = "Check hiking weather and mountain difficulty insights across the Philippines.";
export const DEFAULT_OG_IMAGE_PATH = "/mountains/verified/mt-pulag.jpg";
export const PRODUCTION_SITE_URL = "https://tara-akyat.vercel.app";

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
