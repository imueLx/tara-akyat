import { describe, expect, it } from "vitest";

import { getMountainBySlug } from "@/lib/mountains";
import {
  getActiveMonthHubs,
  getMountainsForDifficultySlug,
  getMountainsForMonthSlug,
  getMountainsForRegionSlug,
  getRelatedMountains,
} from "@/lib/mountain-taxonomy";

describe("mountain taxonomy helpers", () => {
  it("filters mountains by region", () => {
    const mountains = getMountainsForRegionSlug("luzon");

    expect(mountains.length).toBeGreaterThan(0);
    expect(mountains.every((mountain) => mountain.region === "Luzon")).toBe(true);
  });

  it("filters mountains by month", () => {
    const mountains = getMountainsForMonthSlug("march");

    expect(mountains.length).toBeGreaterThan(0);
    expect(mountains.every((mountain) => mountain.best_months.includes("March"))).toBe(true);
  });

  it("filters mountains by difficulty bucket", () => {
    const mountains = getMountainsForDifficultySlug("beginner");

    expect(mountains.length).toBeGreaterThan(0);
    expect(mountains.every((mountain) => mountain.difficulty_score >= 1 && mountain.difficulty_score <= 3)).toBe(true);
  });

  it("exposes only active month hubs", () => {
    const monthSlugs = getActiveMonthHubs().map((hub) => hub.slug);

    expect(monthSlugs).toContain("march");
    expect(monthSlugs).not.toContain("june");
  });

  it("returns related mountains without including the current mountain", () => {
    const mountain = getMountainBySlug("mt-ulap");

    expect(mountain).toBeTruthy();

    const related = getRelatedMountains(mountain!, 4);

    expect(related.length).toBeGreaterThan(0);
    expect(related.length).toBeLessThanOrEqual(4);
    expect(related.some((candidate) => candidate.slug === mountain!.slug)).toBe(false);
  });
});
