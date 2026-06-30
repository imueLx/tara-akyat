import { describe, expect, it } from "vitest";

import { getMountains } from "@/lib/mountains";
import {
  getDateQueryParamRobots,
  getDifficultyPageDescription,
  getDifficultyPageTitle,
  getDifficultySearchKeywords,
  getHomePageTitle,
  getMountainImageAlt,
  getMountainMetaDescription,
  getMountainPageTitle,
  isBeginnerMountain,
} from "@/lib/seo";

describe("seo helpers", () => {
  const mtUlap = getMountains().find((mountain) => mountain.slug === "mt-ulap");

  it("builds descriptive mountain image alt text", () => {
    expect(
      getMountainImageAlt({
        name: "Mt. Ulap",
        province: "Benguet",
        region: "Luzon",
      }),
    ).toBe("Mt. Ulap hiking trail in Benguet, Luzon");
  });

  it("returns noindex robots for valid date query params", () => {
    expect(getDateQueryParamRobots("2026-04-30")).toEqual({ index: false, follow: true });
  });

  it("returns undefined robots for missing or invalid date query params", () => {
    expect(getDateQueryParamRobots(undefined)).toBeUndefined();
    expect(getDateQueryParamRobots("not-a-date")).toBeUndefined();
  });

  it("builds planning-focused mountain titles and descriptions", () => {
    expect(mtUlap).toBeDefined();
    if (!mtUlap) {
      return;
    }

    expect(getMountainPageTitle(mtUlap)).toContain("Mt. Ulap Hiking Guide");
    expect(getMountainPageTitle(mtUlap)).toContain("Best Months");
    expect(getMountainMetaDescription(mtUlap)).toContain("beginner hikes");
    expect(isBeginnerMountain(mtUlap)).toBe(true);
  });

  it("builds beginner hub metadata around search intent", () => {
    expect(getDifficultyPageTitle("beginner", "Beginner", 16)).toContain("Beginner Hikes in the Philippines");
    expect(getDifficultyPageDescription("beginner", "Beginner", 16).toLowerCase()).toContain("hiking for beginners");
    expect(getDifficultySearchKeywords("beginner", "Beginner")).toContain("hiking for beginners Philippines");
  });

  it("uses a home title focused on planning and beginner guides", () => {
    expect(getHomePageTitle()).toContain("Beginner Guides");
  });
});
