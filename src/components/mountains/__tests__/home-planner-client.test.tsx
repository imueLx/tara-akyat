import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { HomePlannerClient } from "@/components/mountains/home-planner-client";

const mountains = [
  {
    id: "mt-ulap",
    name: "Mt. Ulap",
    slug: "mt-ulap",
    region: "Luzon",
    province: "Benguet",
    lat: 16.4,
    lon: 120.6,
    image_url: "https://picsum.photos/seed/mt-ulap/960/640",
    image_verified: true,
    difficulty_source_url: "https://example.com/ulap-difficulty",
    difficulty_score: 3,
    summary: "Ridgeline views and pine-tree sections.",
  },
  {
    id: "mt-apo",
    name: "Mt. Apo",
    slug: "mt-apo",
    region: "Mindanao",
    province: "Davao del Sur",
    lat: 6.99,
    lon: 125.27,
    image_url: "https://picsum.photos/seed/mt-apo/960/640",
    image_verified: true,
    difficulty_source_url: "https://example.com/apo-difficulty",
    difficulty_score: 8,
    summary: "Highest mountain in the Philippines with multi-day routes.",
  },
  {
    id: "mt-pulag",
    name: "Mt. Pulag",
    slug: "mt-pulag",
    region: "Luzon",
    province: "Benguet",
    lat: 16.58,
    lon: 120.89,
    image_url: "https://picsum.photos/seed/mt-pulag/960/640",
    image_verified: false,
    difficulty_score: 5,
    summary: "Sea of clouds sunrise and cool summit conditions.",
  },
];

const originalScrollTo = window.scrollTo;

const climatePayload = {
  date: "2026-04-30",
  mode: "climate",
  recommendation: null,
  actionable: false,
  confidence: "low",
  reasons: ["Date is outside reliable daily forecast range."],
  metrics: null,
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
    agreement: "unavailable",
    note: "Consensus is only generated for day-level forecast dates.",
  },
};

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  window.scrollTo = originalScrollTo;
});

describe("HomePlannerClient", () => {
  it("supports combobox semantics and keyboard selection", async () => {
    render(<HomePlannerClient mountains={mountains} />);

    const combobox = screen.getByRole("combobox", { name: "Search mountains" });
    expect(combobox).toHaveAttribute("aria-haspopup", "true");
    expect(screen.getByText("Mt. Ulap • Benguet")).toBeInTheDocument();

    fireEvent.focus(combobox);
    fireEvent.change(combobox, { target: { value: "apo" } });

    await waitFor(() => {
      expect(screen.getByRole("option", { name: /Mt\. Apo/i })).toBeInTheDocument();
    });

    fireEvent.keyDown(combobox, { key: "Enter" });

    await waitFor(() => {
      expect(screen.getByText("Mt. Apo • Davao del Sur")).toBeInTheDocument();
    });
  });

  it("normalizes mountain search terms and shows empty states", async () => {
    render(<HomePlannerClient mountains={mountains} />);

    const combobox = screen.getByRole("combobox", { name: "Search mountains" });
    fireEvent.focus(combobox);

    fireEvent.change(combobox, { target: { value: "mt pulag" } });
    await waitFor(() => {
      expect(screen.getByRole("option", { name: /Mt\. Pulag/i })).toBeInTheDocument();
    });

    fireEvent.change(combobox, { target: { value: "unknown summit" } });
    await waitFor(() => {
      expect(screen.getByText("No mountain matches that search yet.")).toBeInTheDocument();
    });
  });

  it("opens a default dropdown list on focus", async () => {
    render(<HomePlannerClient mountains={mountains} />);

    const combobox = screen.getByRole("combobox", { name: "Search mountains" });
    expect(screen.getByText("Mt. Ulap • Benguet")).toBeInTheDocument();

    fireEvent.focus(combobox);

    await waitFor(() => {
      expect(screen.getByRole("option", { name: /Mt\. Ulap/i })).toBeInTheDocument();
      expect(screen.getByRole("option", { name: /Mt\. Apo/i })).toBeInTheDocument();
    });
  });

  it("updates the selected mountain when clicking an option from the dropdown", async () => {
    render(<HomePlannerClient mountains={mountains} />);

    const combobox = screen.getByRole("combobox", { name: "Search mountains" });
    fireEvent.focus(combobox);

    await waitFor(() => {
      expect(screen.getByRole("option", { name: /Mt\. Apo/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("option", { name: /Mt\. Apo/i }));

    await waitFor(() => {
      expect(screen.getByText("Mt. Apo • Davao del Sur")).toBeInTheDocument();
    });
  });

  it("shows month context instead of unavailable when day-level rain data is out of range", async () => {
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
      callback(0);
      return 1;
    });
    window.scrollTo = vi.fn();
    const fetchSpy = vi
      .spyOn(global, "fetch")
      .mockResolvedValueOnce(new Response(JSON.stringify(climatePayload), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify(climateDetailsPayload), { status: 200 }));

    render(<HomePlannerClient mountains={mountains} initialDate="2026-04-30" />);
    fireEvent.click(screen.getByRole("button", { name: /Check hiking weather/i }));

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledTimes(1);
    });

    fireEvent.click(screen.getByRole("button", { name: /Cross-checks/i }));

    await waitFor(() => {
      expect(screen.getByText("Recent history")).toBeInTheDocument();
      expect(screen.getAllByText("42% wet days").length).toBeGreaterThan(0);
      expect(screen.getByText(/^Same date$/)).toBeInTheDocument();
      expect(screen.queryByText("Another forecast source")).not.toBeInTheDocument();
      expect(screen.queryByText("Day-level rain forecast is unavailable for this date range.")).not.toBeInTheDocument();
    });

    expect(fetchSpy).toHaveBeenCalledTimes(2);
    expect(fetchSpy).toHaveBeenLastCalledWith("/api/weather/check/details?lat=16.4&lon=120.6&date=2026-04-30");
  });

  it("loads more details only once for repeated show or hide toggles", async () => {
    const fetchSpy = vi
      .spyOn(global, "fetch")
      .mockResolvedValueOnce(new Response(JSON.stringify(climatePayload), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify(climateDetailsPayload), { status: 200 }));

    render(<HomePlannerClient mountains={mountains} initialDate="2026-04-30" />);
    fireEvent.click(screen.getByRole("button", { name: /Check hiking weather/i }));

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledTimes(1);
    });

    fireEvent.click(screen.getByRole("button", { name: /Cross-checks/i }));
    await waitFor(() => {
      expect(screen.getByText("Recent history")).toBeInTheDocument();
      expect(fetchSpy).toHaveBeenCalledTimes(2);
    });

    fireEvent.click(screen.getByRole("button", { name: /Cross-checks/i }));
    fireEvent.click(screen.getByRole("button", { name: /Cross-checks/i }));

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledTimes(2);
    });
  });
});
