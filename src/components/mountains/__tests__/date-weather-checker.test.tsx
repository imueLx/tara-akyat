import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { DateWeatherChecker } from "@/components/mountains/date-weather-checker";

const originalScrollIntoView = HTMLElement.prototype.scrollIntoView;

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();

  if (originalScrollIntoView) {
    Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
      configurable: true,
      value: originalScrollIntoView,
    });
    return;
  }

  delete (HTMLElement.prototype as Partial<HTMLElement>).scrollIntoView;
});

describe("DateWeatherChecker", () => {
  const mockPayload = {
    date: "2026-03-25",
    mode: "forecast",
    recommendation: "Good",
    actionable: true,
    confidence: "high",
    reasons: ["Weather looks stable for hiking"],
    metrics: {
      precipitationProbability: 10,
      precipitationSum: 0,
      windSpeedMax: 12,
      temperatureMax: 27,
      apparentTemperatureMax: 29,
      weatherCode: 1,
    },
    hikeWindowRain: {
      label: "4am-2pm",
      startHour: 4,
      endHour: 14,
      sampleHours: 11,
      precipitationProbability: 0,
      precipitationSum: 0,
    },
    climate: null,
    reliability: {
      selectedLabel: "3-day",
      selectedDays: 3,
      estimatedAccuracy: 90,
      guidance: "3-day forecast confidence is about 90%. Best for go or no-go decisions.",
      tiers: [
        {
          label: "3-day",
          days: 3,
          estimatedAccuracy: 90,
          notes: "Best for go or no-go decisions.",
          reliesOnHistory: false,
        },
      ],
    },
  };

  const climatePayload = {
    date: "2026-04-30",
    mode: "climate",
    recommendation: null,
    actionable: false,
    confidence: "low",
    reasons: ["Date is outside reliable daily forecast range."],
    metrics: null,
    hikeWindowRain: null,
    climate: {
      month: "April",
      avgPrecipitation: 3.8,
      wetDayChance: 42,
      advisory: "Mixed month historically. Keep a backup date and monitor closer to your trip.",
    },
    reliability: {
      selectedLabel: "30-day",
      selectedDays: 30,
      estimatedAccuracy: 45,
      guidance: "Use climate/history guidance, not day-level trust.",
      tiers: [
        {
          label: "30-day",
          days: 30,
          estimatedAccuracy: 45,
          notes: "Use climate/history guidance, not day-level trust.",
          reliesOnHistory: true,
        },
      ],
    },
  };

  const climateDetailsPayload = {
    date: "2026-04-30",
    mode: "climate",
    history: {
      periodStart: "2024-04-01",
      periodEnd: "2026-03-31",
      avgDailyPrecipitation: 2.2,
      wetDayChance: 40,
      targetMonthAvgPrecipitation: 3.8,
      targetMonthWetDayChance: 42,
      targetDateAvgPrecipitation: 2.5,
      targetDateWetDayChance: 50,
      targetDateSamples: 2,
      note: "Last 2 years show mixed conditions for this month. Recheck weather near hike day.",
    },
    consensus: {
      primaryProvider: "Open-Meteo",
      secondaryProvider: "Visual Crossing",
      secondaryAvailable: false,
      secondaryRecommendation: null,
      secondaryMetrics: null,
      primaryHikeWindowRain: null,
      secondaryHikeWindowRain: null,
      agreement: "unavailable",
      note: "Consensus is only generated for day-level forecast dates within 15 days.",
    },
  };

  it("shows recommendation after date check", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(new Response(JSON.stringify(mockPayload), { status: 200 }));

    render(<DateWeatherChecker lat={14.6} lon={121.1} />);
    fireEvent.click(screen.getByRole("button", { name: "Check hiking day" }));

    await waitFor(() => {
      expect(screen.getByText("Good")).toBeInTheDocument();
      expect(screen.getByText(/Weather looks stable for hiking/)).toBeInTheDocument();
      expect(screen.getByText(/Good day for hiking/)).toBeInTheDocument();
      expect(screen.getByText(/Exact forecast is day-specific up to 15 days/)).toBeInTheDocument();
      expect(screen.getByText(/Why this result/)).toBeInTheDocument();
      expect(screen.getAllByText(/How reliable/).length).toBeGreaterThan(0);
      expect(screen.getByText(/No rain expected/)).toBeInTheDocument();
      expect(screen.getByText("None")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Cross-checks/i })).toHaveAttribute("aria-expanded", "false");
      expect(screen.queryByText(/Usually drier|Mixed month|Historically wet/)).not.toBeInTheDocument();
    });
  });

  it("uses the passed date and auto-checks on mount", async () => {
    const fetchSpy = vi
      .spyOn(global, "fetch")
      .mockResolvedValue(new Response(JSON.stringify(mockPayload), { status: 200 }));

    render(<DateWeatherChecker lat={14.6} lon={121.1} initialDate="2026-03-25" />);

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith("/api/weather/check?lat=14.6&lon=121.1&date=2026-03-25");
      expect(screen.getByDisplayValue("2026-03-25")).toBeInTheDocument();
    });
  });

  it("lets the user change the date after initial date is applied", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(new Response(JSON.stringify(mockPayload), { status: 200 }));

    render(<DateWeatherChecker lat={14.6} lon={121.1} initialDate="2026-03-25" />);

    await waitFor(() => {
      expect(screen.getByDisplayValue("2026-03-25")).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText("Hiking Date"), {
      target: { value: "2026-03-29" },
    });

    await waitFor(() => {
      expect(screen.getByDisplayValue("2026-03-29")).toBeInTheDocument();
    });

    expect(screen.queryByDisplayValue("2026-03-25")).not.toBeInTheDocument();
  });

  it("uses auto scrolling when reduced motion is preferred", async () => {
    const scrollIntoView = vi.fn();

    Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
      configurable: true,
      value: scrollIntoView,
    });

    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
      callback(0);
      return 1;
    });
    vi.stubGlobal(
      "matchMedia",
      vi.fn((query: string) => ({
        matches: query === "(prefers-reduced-motion: reduce)",
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(() => false),
      })),
    );
    vi.spyOn(global, "fetch").mockResolvedValue(new Response(JSON.stringify(mockPayload), { status: 200 }));

    render(<DateWeatherChecker lat={14.6} lon={121.1} />);
    fireEvent.click(screen.getByRole("button", { name: "Check hiking day" }));

    await waitFor(() => {
      expect(scrollIntoView).toHaveBeenCalledWith({ behavior: "auto", block: "start" });
    });
  });

  it("uses month context in rain guidance when day-level forecast is unavailable", async () => {
    const fetchSpy = vi
      .spyOn(global, "fetch")
      .mockResolvedValueOnce(new Response(JSON.stringify(climatePayload), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify(climateDetailsPayload), { status: 200 }));

    render(<DateWeatherChecker lat={14.6} lon={121.1} initialDate="2026-04-30" />);

    await waitFor(() => {
      expect(screen.getByRole("heading", { level: 3, name: /Planning outlook/i })).toBeInTheDocument();
    });

    expect(fetchSpy).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: /Cross-checks/i }));

    await waitFor(() => {
      expect(screen.getByText("2-year history")).toBeInTheDocument();
      expect(screen.getAllByText("42% wet days").length).toBeGreaterThan(0);
      expect(screen.getByText(/^Same date$/)).toBeInTheDocument();
      expect(screen.queryByText("Another forecast source")).not.toBeInTheDocument();
    });

    expect(fetchSpy).toHaveBeenCalledTimes(2);
    expect(fetchSpy).toHaveBeenLastCalledWith("/api/weather/check/details?lat=14.6&lon=121.1&date=2026-04-30");

    fireEvent.click(screen.getByRole("button", { name: /Cross-checks/i }));
    fireEvent.click(screen.getByRole("button", { name: /Cross-checks/i }));

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledTimes(2);
    });
  });
});
