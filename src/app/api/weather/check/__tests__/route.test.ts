import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { GET } from "@/app/api/weather/check/route";
import { addDays, formatISODate } from "@/lib/date";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("GET /api/weather/check", () => {
  it("returns 400 for invalid params", async () => {
    const request = new NextRequest("http://localhost/api/weather/check?lat=a&lon=1&date=2026-03-22");
    const response = await GET(request);
    expect(response.status).toBe(400);
  });

  it("returns forecast recommendation for valid date", async () => {
    vi.spyOn(global, "fetch")
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            daily: {
              time: ["2026-03-24"],
              weather_code: [1],
              precipitation_sum: [0],
              precipitation_probability_max: [10],
              wind_speed_10m_max: [15],
              temperature_2m_max: [27],
              apparent_temperature_max: [29],
            },
          }),
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            daily: {
              time: ["2024-03-01", "2025-03-01"],
              precipitation_sum: [1, 2],
            },
          }),
        ),
      );

    const request = new NextRequest("http://localhost/api/weather/check?lat=16.6&lon=120.9&date=2026-03-24");
    const response = await GET(request);
    const body = (await response.json()) as {
      mode: string;
      recommendation: string | null;
      actionable: boolean;
      history: unknown;
      consensus: { primaryProvider: string };
      reliability: { selectedLabel: string };
    };

    expect(response.status).toBe(200);
    expect(body.mode).toBe("forecast");
    expect(body.recommendation).toBe("Good");
    expect(body.actionable).toBe(true);
    expect(body.history).toBeTruthy();
    expect(body.consensus.primaryProvider).toBe("Open-Meteo");
    expect(body.reliability.selectedLabel).toBeTruthy();
  });

  it("returns climate guidance for far dates", async () => {
    const farDate = formatISODate(addDays(new Date(), 35));

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
            daily: {
              time: ["2024-01-01", "2025-01-01"],
              precipitation_sum: [2, 1],
            },
          }),
        ),
      );

    const request = new NextRequest(`http://localhost/api/weather/check?lat=14.6&lon=121.0&date=${farDate}`);
    const response = await GET(request);
    const body = (await response.json()) as {
      mode: string;
      actionable: boolean;
      climate: unknown;
      reasons: string[];
      history: { periodStart: string };
      reliability: { selectedLabel: string };
    };

    expect(response.status).toBe(200);
    expect(body.mode).toBe("climate");
    expect(body.actionable).toBe(false);
    expect(body.climate).toBeTruthy();
    expect(body.history.periodStart).toBeTruthy();
    expect(body.reliability.selectedLabel).toBe("35-day");
    expect(body.reasons[0]).toContain("outside reliable daily forecast range");
  });
});
