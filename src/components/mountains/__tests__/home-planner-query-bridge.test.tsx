import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const useSearchParamsMock = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  useSearchParams: useSearchParamsMock,
}));

vi.mock("@/components/mountains/home-planner-client", () => ({
  HomePlannerClient: ({ initialDate, mountains }: { initialDate?: string; mountains: Array<{ id: string }> }) => (
    <div data-testid="home-planner-client" data-count={mountains.length} data-initial-date={initialDate ?? ""}>
      {initialDate ?? "no-date"}
    </div>
  ),
}));

import { HomePlannerQueryBridge } from "@/components/mountains/home-planner-query-bridge";

const mountains = [
  {
    id: "mt-ulap",
    name: "Mt. Ulap",
    slug: "mt-ulap",
    region: "Luzon",
    province: "Benguet",
    lat: 16.4,
    lon: 120.6,
    image_url: "https://example.com/ulap.jpg",
    difficulty_score: 3,
    summary: "Ridgeline views and pine-tree sections.",
  },
];

describe("HomePlannerQueryBridge", () => {
  beforeEach(() => {
    useSearchParamsMock.mockReset();
  });

  it("forwards a valid date query to the home planner", () => {
    useSearchParamsMock.mockReturnValue(new URLSearchParams("date=2026-04-30"));

    render(<HomePlannerQueryBridge mountains={mountains} />);

    expect(screen.getByTestId("home-planner-client")).toHaveAttribute("data-initial-date", "2026-04-30");
    expect(screen.getByTestId("home-planner-client")).toHaveAttribute("data-count", "1");
  });

  it("ignores invalid or missing date queries", () => {
    useSearchParamsMock.mockReturnValue(new URLSearchParams("date=invalid"));

    const { rerender } = render(<HomePlannerQueryBridge mountains={mountains} />);

    expect(screen.getByTestId("home-planner-client")).toHaveAttribute("data-initial-date", "");

    useSearchParamsMock.mockReturnValue(new URLSearchParams());
    rerender(<HomePlannerQueryBridge mountains={mountains} />);

    expect(screen.getByTestId("home-planner-client")).toHaveAttribute("data-initial-date", "");
  });
});
