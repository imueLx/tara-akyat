import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const useSearchParamsMock = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  useSearchParams: useSearchParamsMock,
}));

vi.mock("@/components/mountains/date-weather-checker", () => ({
  DateWeatherChecker: ({ initialDate, lat, lon }: { initialDate?: string; lat: number; lon: number }) => (
    <div data-testid="date-weather-checker" data-initial-date={initialDate ?? ""} data-lat={lat} data-lon={lon}>
      {initialDate ?? "no-date"}
    </div>
  ),
}));

import { DateWeatherQueryBridge } from "@/components/mountains/date-weather-query-bridge";

describe("DateWeatherQueryBridge", () => {
  beforeEach(() => {
    useSearchParamsMock.mockReset();
  });

  it("forwards a valid date query to the weather checker", () => {
    useSearchParamsMock.mockReturnValue(new URLSearchParams("date=2026-03-25"));

    render(<DateWeatherQueryBridge lat={16.4} lon={120.6} />);

    expect(screen.getByTestId("date-weather-checker")).toHaveAttribute("data-initial-date", "2026-03-25");
    expect(screen.getByTestId("date-weather-checker")).toHaveAttribute("data-lat", "16.4");
    expect(screen.getByTestId("date-weather-checker")).toHaveAttribute("data-lon", "120.6");
  });

  it("ignores invalid or missing date queries", () => {
    useSearchParamsMock.mockReturnValue(new URLSearchParams("date=not-a-date"));

    const { rerender } = render(<DateWeatherQueryBridge lat={16.4} lon={120.6} />);

    expect(screen.getByTestId("date-weather-checker")).toHaveAttribute("data-initial-date", "");

    useSearchParamsMock.mockReturnValue(new URLSearchParams());
    rerender(<DateWeatherQueryBridge lat={16.4} lon={120.6} />);

    expect(screen.getByTestId("date-weather-checker")).toHaveAttribute("data-initial-date", "");
  });
});
