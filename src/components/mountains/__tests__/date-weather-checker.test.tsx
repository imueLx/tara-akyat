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
    climate: null,
    history: {
      periodStart: "2024-03-22",
      periodEnd: "2026-03-21",
      avgDailyPrecipitation: 2.1,
      wetDayChance: 42,
      targetMonthAvgPrecipitation: 1.8,
      targetMonthWetDayChance: 37,
      note: "Last 2 years suggest generally manageable rainfall patterns.",
    },
    consensus: {
      primaryProvider: "Open-Meteo",
      secondaryProvider: "Visual Crossing",
      secondaryAvailable: false,
      secondaryRecommendation: null,
      agreement: "unavailable",
      note: "Set VISUAL_CROSSING_API_KEY to enable secondary forecast consensus.",
    },
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

  it("shows recommendation after date check", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(new Response(JSON.stringify(mockPayload), { status: 200 }));

    render(<DateWeatherChecker lat={14.6} lon={121.1} />);
    fireEvent.click(screen.getByRole("button", { name: "Check hiking day" }));

    await waitFor(() => {
      expect(screen.getByText("Good")).toBeInTheDocument();
      expect(screen.getByText(/Weather looks stable for hiking/)).toBeInTheDocument();
      expect(screen.getByText(/Good day for hiking/)).toBeInTheDocument();
      expect(screen.getByText(/Pick one date to check/)).toBeInTheDocument();
      expect(screen.getByText(/Why this result/)).toBeInTheDocument();
      expect(screen.getAllByText(/How reliable/).length).toBeGreaterThan(0);
      expect(screen.getByText(/No rain expected/)).toBeInTheDocument();
      expect(screen.getByText("None")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /More details/i })).toHaveAttribute("aria-expanded", "false");
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
});
