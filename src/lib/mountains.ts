import mountains from "@/data/mountains.json";
import tips from "@/data/tips.json";
import { parseMountains, parseTips } from "@/lib/schemas/mountain";
import type { Mountain, TipSource } from "@/types/hiking";

const typedMountains = parseMountains(mountains);
const typedTips = parseTips(tips);
const canonicalRegionOrder = ["Luzon", "Visayas", "Mindanao"] as const;

export function getMountains(): Mountain[] {
  return typedMountains;
}

export function getMountainBySlug(slug: string): Mountain | undefined {
  return typedMountains.find((mountain) => mountain.slug === slug);
}

export function getTipsByMountainId(mountainId: string): TipSource[] {
  return typedTips.filter((tip) => tip.mountain_id === mountainId);
}

export function getTips(): TipSource[] {
  return typedTips;
}

export function getCommunityTipByMountainId(mountainId: string): TipSource | undefined {
  return typedTips.find((tip) => tip.mountain_id === mountainId && tip.source_type === "reddit");
}

export function getRegions(): string[] {
  return Array.from(new Set(typedMountains.map((mountain) => mountain.region))).sort((left, right) => {
    const leftIndex = canonicalRegionOrder.indexOf(left as (typeof canonicalRegionOrder)[number]);
    const rightIndex = canonicalRegionOrder.indexOf(right as (typeof canonicalRegionOrder)[number]);

    if (leftIndex !== -1 && rightIndex !== -1) {
      return leftIndex - rightIndex;
    }

    if (leftIndex !== -1) {
      return -1;
    }

    if (rightIndex !== -1) {
      return 1;
    }

    return left.localeCompare(right);
  });
}
