import { describe, expect, it } from "vitest";

import { getDateQueryParamRobots, getMountainImageAlt } from "@/lib/seo";

describe("seo helpers", () => {
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
});
