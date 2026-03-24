import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { GET } from "@/app/api/weather/check/details/route";
import { addDays, formatISODate } from "@/lib/date";

const originalVisualCrossingKey = process.env.VISUAL_CROSSING_API_KEY;

afterEach(() => {
  vi.restoreAllMocks();
  process.env.VISUAL_CROSSING_API_KEY = originalVisualCrossingKey;
});

describe("GET /api/weather/check/details", () => {
  it("returns 400 for invalid params", async () => {
    const request = new NextRequest("http://localhost/api/weather/check/details?lat=a&lon=1&date=2026-03-22");
    const response = await GET(request);
    expect(response.status).toBe(400);
  });

  it("returns same-date history context for long-range dates", async () => {
    process.env.VISUAL_CROSSING_API_KEY = "";
    const farDate = formatISODate(addDays(new Date(), 35));

    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          daily: {
            time: ["2024-04-01", "2025-04-01"],
            precipitation_sum: [2, 1],
          },
        }),
      ),
    );

    const request = new NextRequest(`http://localhost/api/weather/check/details?lat=14.6&lon=121.0&date=${farDate}`);
    const response = await GET(request);
    const body = (await response.json()) as {
      mode: string;
      history: { targetDateSamples: number };
      consensus: { primaryProvider: string; secondaryRecommendation: string | null };
    };

    expect(response.status).toBe(200);
    expect(response.headers.get("Server-Timing")).toMatch(/app;dur=/);
    expect(body.mode).toBe("climate");
    expect(body.history.targetDateSamples).toBeGreaterThanOrEqual(0);
    expect(body.consensus.primaryProvider).toBe("Open-Meteo");
    expect(body.consensus.secondaryAvailable).toBe(false);
    expect(body.consensus.secondaryRecommendation).toBeNull();
  });

  it("returns secondary provider consensus when VISUAL_CROSSING_API_KEY is set", async () => {
    process.env.VISUAL_CROSSING_API_KEY = "test-key";
    const targetDate = formatISODate(addDays(new Date(), 1));

    vi.spyOn(global, "fetch")
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            daily: {
              time: ["2024-04-01", "2025-04-01"],
              precipitation_sum: [2, 1],
            },
          }),
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            hourly: {
              time: [`${targetDate}T04:00`, `${targetDate}T10:00`, `${targetDate}T16:00`],
              precipitation: [0, 0, 0],
              precipitation_probability: [5, 5, 5],
            },
          }),
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            days: [
              {
                datetime: targetDate,
                tempmax: 27,
                feelslikemax: 29,
                precip: 0,
                precipprob: 5,
                windspeed: 10,
                conditions: "Clear",
              },
            ],
          }),
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            days: [
              {
                datetime: targetDate,
                hours: [
                  { datetime: "04:00:00", precip: 0, precipprob: 5 },
                  { datetime: "10:00:00", precip: 0, precipprob: 5 },
                  { datetime: "16:00:00", precip: 0, precipprob: 5 },
                ],
              },
            ],
          }),
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            daily: {
              time: [targetDate],
              weather_code: [1],
              precipitation_sum: [0],
              precipitation_probability_max: [5],
              wind_speed_10m_max: [10],
              temperature_2m_max: [27],
              apparent_temperature_max: [29],
            },
          }),
        ),
      );

    const request = new NextRequest(`http://localhost/api/weather/check/details?lat=14.6&lon=121.0&date=${targetDate}`);
    const response = await GET(request);
    const body = (await response.json()) as {
      consensus: {
        secondaryAvailable: boolean;
        secondaryRecommendation: string | null;
        agreement: string;
      };
    };

    expect(response.status).toBe(200);
    expect(response.headers.get("Server-Timing")).toMatch(/app;dur=/);
    expect(body.consensus.secondaryAvailable).toBe(true);
    expect(body.consensus.secondaryRecommendation).toBe("Good");
    expect(body.consensus.agreement).toBe("aligned");
  });

  it("returns 504 when upstream provider times out", async () => {
    const timeoutError = new Error("The operation was aborted.");
    timeoutError.name = "AbortError";
    vi.spyOn(global, "fetch").mockRejectedValue(timeoutError);

    const targetDate = formatISODate(addDays(new Date(), 1));
    const request = new NextRequest(`http://localhost/api/weather/check/details?lat=14.6&lon=121.0&date=${targetDate}`);
    const response = await GET(request);
    const body = (await response.json()) as { error: string };

    expect(response.status).toBe(504);
    expect(body.error).toContain("taking too long");
  });
});
