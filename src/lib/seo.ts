export const SITE_NAME = "Tara Akyat";
export const SITE_DESCRIPTION = "Check hiking weather and mountain difficulty insights across the Philippines.";
export const DEFAULT_OG_IMAGE_PATH = "/mountains/verified/mt-pulag.jpg";

export function getBaseUrl(): string {
  const rawUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (!rawUrl) {
    return "https://example.com";
  }

  return rawUrl.endsWith("/") ? rawUrl.slice(0, -1) : rawUrl;
}

export function absoluteUrl(pathname: string): string {
  const normalizedPathname = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${getBaseUrl()}${normalizedPathname}`;
}
