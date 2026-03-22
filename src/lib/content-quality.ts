import type { Mountain, TipSource } from "@/types/hiking";

type VerificationMountain = Pick<Mountain, "image_verified" | "difficulty_source_url">;

export function getMountainVerificationSummary(mountain: VerificationMountain): {
  photoLabel: string;
  photoTone: string;
  difficultyLabel: string;
  difficultyTone: string;
} {
  return {
    photoLabel: mountain.image_verified ? "Photo verified" : "Photo pending",
    photoTone: mountain.image_verified
      ? "bg-emerald-100 text-emerald-800 border-emerald-200"
      : "bg-amber-100 text-amber-800 border-amber-200",
    difficultyLabel: mountain.difficulty_source_url ? "Score sourced" : "Source pending",
    difficultyTone: mountain.difficulty_source_url
      ? "bg-sky-100 text-sky-800 border-sky-200"
      : "bg-slate-100 text-slate-700 border-slate-200",
  };
}

export function getTipHostLabel(url: string): string {
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, "");
    return hostname;
  } catch {
    return "external source";
  }
}

export function isBroadSourceLink(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.pathname === "/" || parsed.pathname === "";
  } catch {
    return false;
  }
}

export function sortTipsForReading(tips: TipSource[]): TipSource[] {
  const weight: Record<TipSource["source_type"], number> = {
    official: 0,
    travel_agency: 1,
    facebook: 2,
    reddit: 3,
  };

  return [...tips].sort((a, b) => {
    const sourceDiff = weight[a.source_type] - weight[b.source_type];
    if (sourceDiff !== 0) {
      return sourceDiff;
    }

    return a.title.localeCompare(b.title);
  });
}
