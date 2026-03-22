import { describe, expect, it } from "vitest";

import { scoreDay } from "@/lib/weather/scoring";

describe("scoreDay", () => {
  it("returns Good for low rain and moderate conditions", () => {
    const result = scoreDay("2026-01-10", {
      weatherCode: 1,
      precipitationProbability: 15,
      precipitationSum: 0,
      windSpeedMax: 18,
      temperatureMax: 27,
      apparentTemperatureMax: 29,
    });

    expect(result.recommendation).toBe("Good");
    expect(result.score).toBeGreaterThan(75);
  });

  it("returns Not Recommended for storm-heavy weather", () => {
    const result = scoreDay("2026-01-11", {
      weatherCode: 95,
      precipitationProbability: 90,
      precipitationSum: 18,
      windSpeedMax: 48,
      temperatureMax: 31,
      apparentTemperatureMax: 33,
    });

    expect(result.recommendation).toBe("Not Recommended");
  });

  it("returns Caution for borderline heat and rain", () => {
    const result = scoreDay("2026-01-12", {
      weatherCode: 2,
      precipitationProbability: 45,
      precipitationSum: 6,
      windSpeedMax: 28,
      temperatureMax: 34,
      apparentTemperatureMax: 35,
    });

    expect(result.recommendation).toBe("Caution");
  });

  it("returns Caution for moderate rain chance and moderate rain amount", () => {
    const result = scoreDay("2026-04-04", {
      weatherCode: 2,
      precipitationProbability: 61,
      precipitationSum: 3.6,
      windSpeedMax: 13,
      temperatureMax: 26,
      apparentTemperatureMax: 27.5,
    });

    expect(result.recommendation).toBe("Caution");
  });
});
