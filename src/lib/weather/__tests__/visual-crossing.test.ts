import { describe, expect, it } from "vitest";

import {
  parseVisualCrossingDayMetrics,
  parseVisualCrossingHikeWindowRain,
  type VisualCrossingDay,
} from "@/lib/weather/visual-crossing";

function createDay(overrides: Partial<VisualCrossingDay> = {}): VisualCrossingDay {
  return {
    datetime: "2026-06-28",
    tempmax: 25,
    feelslikemax: 26,
    precip: 8.8,
    precipprob: 100,
    windspeed: 9,
    conditions: "Rain, Overcast",
    hours: [
      { datetime: "04:00:00", precip: 0, precipprob: 0 },
      { datetime: "09:00:00", precip: 0, precipprob: 90 },
      { datetime: "10:00:00", precip: 0.1, precipprob: 90 },
      { datetime: "11:00:00", precip: 0.4, precipprob: 90 },
      { datetime: "14:00:00", precip: 1.5, precipprob: 90 },
      { datetime: "16:00:00", precip: 2.0, precipprob: 90 },
    ],
    ...overrides,
  };
}

describe("parseVisualCrossingDayMetrics", () => {
  it("maps daily fields and rain conditions to a weather code", () => {
    const metrics = parseVisualCrossingDayMetrics(createDay());

    expect(metrics.precipitationSum).toBe(8.8);
    expect(metrics.precipitationProbability).toBe(100);
    expect(metrics.weatherCode).toBe(63);
  });
});

describe("parseVisualCrossingHikeWindowRain", () => {
  it("summarizes rain inside the 4am-2pm hiking window", () => {
    const hikeWindow = parseVisualCrossingHikeWindowRain(createDay());

    expect(hikeWindow).toEqual({
      label: "4am-2pm",
      startHour: 4,
      endHour: 14,
      sampleHours: 5,
      precipitationProbability: 90,
      precipitationSum: 2,
    });
  });

  it("returns null when hourly precip fields are missing", () => {
    const hikeWindow = parseVisualCrossingHikeWindowRain(
      createDay({
        hours: [{ datetime: "09:00:00" }, { datetime: "10:00:00" }],
      }),
    );

    expect(hikeWindow).toEqual({
      label: "4am-2pm",
      startHour: 4,
      endHour: 14,
      sampleHours: 2,
      precipitationProbability: 0,
      precipitationSum: 0,
    });
  });
});
