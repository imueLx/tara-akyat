#!/usr/bin/env node

import { promises as fs } from "node:fs";
import path from "node:path";
import process from "node:process";

const ROOT_DIR = process.cwd();
const MOUNTAINS_PATH = path.join(ROOT_DIR, "src", "data", "mountains.json");
const VERIFIED_IMAGES_DIR = path.join(ROOT_DIR, "public", "mountains", "verified");
const WIKIMEDIA_API_URL = "https://commons.wikimedia.org/w/api.php";
const DEFAULT_WIDTH = 1280;
const IMAGE_WIDTH = Number.parseInt(process.env.WIKIMEDIA_IMAGE_WIDTH ?? `${DEFAULT_WIDTH}`, 10) || DEFAULT_WIDTH;
const ALLOWED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);
const RETRYABLE_STATUS_CODES = new Set([408, 425, 429, 500, 502, 503, 504]);
const MAX_RETRIES = 7;
const BASE_RETRY_DELAY_MS = 900;
const REQUEST_PAUSE_MS = 240;

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function retryDelayFromResponse(response, attempt) {
  const retryAfterHeader = response.headers.get("retry-after");

  if (retryAfterHeader) {
    const seconds = Number.parseInt(retryAfterHeader, 10);
    if (Number.isFinite(seconds) && seconds > 0) {
      return seconds * 1000;
    }
  }

  return BASE_RETRY_DELAY_MS * attempt;
}

async function fetchWithRetry(url, init, label) {
  let lastError = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt += 1) {
    try {
      const response = await fetch(url, init);

      if (response.ok) {
        return response;
      }

      if (!RETRYABLE_STATUS_CODES.has(response.status)) {
        throw new Error(`${label} failed (${response.status}).`);
      }

      const retryDelay = retryDelayFromResponse(response, attempt);
      await sleep(retryDelay);
    } catch (error) {
      lastError = error;

      if (attempt === MAX_RETRIES) {
        break;
      }

      await sleep(BASE_RETRY_DELAY_MS * attempt);
    }
  }

  if (lastError instanceof Error) {
    throw lastError;
  }

  throw new Error(`${label} failed after ${MAX_RETRIES} retries.`);
}

function normalizeFileTitle(title) {
  const decodedTitle = decodeURIComponent(title).trim().replace(/^\/+/, "");
  const lowerTitle = decodedTitle.toLowerCase();

  if (!lowerTitle.startsWith("file:")) {
    return null;
  }

  return `File:${decodedTitle.slice(5)}`;
}

function getFileTitleFromSource(sourceUrl) {
  try {
    const parsed = new URL(sourceUrl);

    if (parsed.hostname !== "commons.wikimedia.org") {
      return null;
    }

    const titleFromPath = parsed.pathname.startsWith("/wiki/")
      ? normalizeFileTitle(parsed.pathname.slice("/wiki/".length))
      : null;
    if (titleFromPath) {
      return titleFromPath;
    }

    const titleFromQuery = parsed.searchParams.get("title");
    if (titleFromQuery) {
      return normalizeFileTitle(titleFromQuery);
    }

    return null;
  } catch {
    return null;
  }
}

async function getWikimediaImageInfo(fileTitle) {
  const requestUrl = new URL(WIKIMEDIA_API_URL);
  requestUrl.searchParams.set("action", "query");
  requestUrl.searchParams.set("format", "json");
  requestUrl.searchParams.set("formatversion", "2");
  requestUrl.searchParams.set("prop", "imageinfo");
  requestUrl.searchParams.set("titles", fileTitle);
  requestUrl.searchParams.set("iiprop", "url");
  requestUrl.searchParams.set("iiurlwidth", String(IMAGE_WIDTH));

  const response = await fetchWithRetry(requestUrl, {
    headers: {
      "User-Agent": "hike-this-day-image-sync/1.0",
    },
  }, `Wikimedia API for ${fileTitle}`);

  const payload = await response.json();
  const page = payload?.query?.pages?.find((candidate) => !candidate?.missing);
  const imageInfo = page?.imageinfo?.[0];

  if (!imageInfo?.thumburl && !imageInfo?.url) {
    throw new Error("No downloadable image URL returned by Wikimedia.");
  }

  return imageInfo.thumburl ?? imageInfo.url;
}

function getExtensionFromUrl(url) {
  try {
    const extension = path.extname(new URL(url).pathname).toLowerCase();

    if (ALLOWED_EXTENSIONS.has(extension)) {
      return extension;
    }
  } catch {
    // Fall back to .jpg.
  }

  return ".jpg";
}

async function removeOldVariants(slug, keepFileName) {
  const existingFiles = await fs.readdir(VERIFIED_IMAGES_DIR);
  const obsoleteFiles = existingFiles.filter((fileName) => fileName.startsWith(`${slug}.`) && fileName !== keepFileName);

  await Promise.all(obsoleteFiles.map((fileName) => fs.unlink(path.join(VERIFIED_IMAGES_DIR, fileName))));
}

async function downloadToFile(url, destinationPath) {
  const response = await fetchWithRetry(url, undefined, `Image download ${url}`);

  const imageBuffer = Buffer.from(await response.arrayBuffer());
  await fs.writeFile(destinationPath, imageBuffer);
  return imageBuffer.byteLength;
}

async function main() {
  const mountainsRaw = await fs.readFile(MOUNTAINS_PATH, "utf8");
  const mountains = JSON.parse(mountainsRaw);

  await fs.mkdir(VERIFIED_IMAGES_DIR, { recursive: true });

  const verifiedMountains = mountains.filter((mountain) => mountain.image_verified && mountain.image_source_url);
  let syncedCount = 0;
  let failedCount = 0;
  let totalBytes = 0;

  for (const mountain of verifiedMountains) {
    const fileTitle = getFileTitleFromSource(mountain.image_source_url);
    if (!fileTitle) {
      failedCount += 1;
      console.warn(`[skip] ${mountain.slug}: cannot parse Wikimedia source URL.`);
      continue;
    }

    try {
      const wikiImageUrl = await getWikimediaImageInfo(fileTitle);
      const extension = getExtensionFromUrl(wikiImageUrl);
      const fileName = `${mountain.slug}${extension}`;
      const destinationPath = path.join(VERIFIED_IMAGES_DIR, fileName);

      await removeOldVariants(mountain.slug, fileName);
      const bytes = await downloadToFile(wikiImageUrl, destinationPath);

      mountain.image_url = `/mountains/verified/${fileName}`;
      syncedCount += 1;
      totalBytes += bytes;

      console.log(`[ok] ${mountain.slug} -> ${mountain.image_url}`);
      await sleep(REQUEST_PAUSE_MS);
    } catch (error) {
      failedCount += 1;
      console.warn(`[skip] ${mountain.slug}: ${error instanceof Error ? error.message : "Unknown error."}`);
    }
  }

  await fs.writeFile(MOUNTAINS_PATH, `${JSON.stringify(mountains, null, 2)}\n`, "utf8");

  console.log(`Synced ${syncedCount} of ${verifiedMountains.length} verified images.`);
  console.log(`Failed ${failedCount} verified images.`);
  console.log(`Ignored ${mountains.length - verifiedMountains.length} unverified mountains.`);
  console.log(`Downloaded ${(totalBytes / (1024 * 1024)).toFixed(2)} MB of images.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
