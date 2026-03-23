import { describe, expect, it } from "vitest";

import { getRegions } from "@/lib/mountains";

describe("getRegions", () => {
  it("returns regions in Luzon, Visayas, Mindanao order", () => {
    expect(getRegions()).toEqual(["Luzon", "Visayas", "Mindanao"]);
  });
});
