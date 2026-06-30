import { describe, expect, it } from "vitest";

import { formatRainAmountDetail, getRainChanceGuidance, getTrailRainImpact, secondaryOpinionHeadline } from "@/lib/weather/presentation";

describe("trail rain presentation", () => {
  it("maps low mm values to short trail impact labels", () => {
    expect(getTrailRainImpact(0).label).toBe("Dry");
    expect(getTrailRainImpact(2.7).label).toBe("Wet");
    expect(getTrailRainImpact(2.7).gaugeSegments).toBe(2);
    expect(getTrailRainImpact(10).label).toBe("Heavy");
  });

  it("formats rain amount as mm only", () => {
    expect(formatRainAmountDetail(2.7)).toBe("2.7 mm");
    expect(formatRainAmountDetail(0)).toBe("0 mm");
  });

  it("uses stronger rain chance wording at 100 percent", () => {
    expect(getRainChanceGuidance(100)).toEqual({ label: "Very high", detail: "Rain expected" });
  });

  it("compares second opinion against the main forecast", () => {
    expect(
      secondaryOpinionHeadline({
        primaryProvider: "Open-Meteo",
        secondaryProvider: "Visual Crossing",
        secondaryAvailable: true,
        primaryRecommendation: "Good",
        secondaryRecommendation: "Good",
        secondaryMetrics: null,
        primaryHikeWindowRain: null,
        secondaryHikeWindowRain: null,
        agreement: "aligned",
        note: "Matches the main forecast above.",
      }),
    ).toBe("Good — matches main forecast");
  });
});
