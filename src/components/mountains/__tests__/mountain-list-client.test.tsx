import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { MountainListClient } from "@/components/mountains/mountain-list-client";
import type { Mountain } from "@/types/hiking";

const mountains: Mountain[] = [
  {
    id: "mt-ulap",
    name: "Mt. Ulap",
    slug: "mt-ulap",
    region: "Luzon",
    province: "Benguet",
    lat: 16.4,
    lon: 120.6,
    image_url: "https://picsum.photos/seed/mt-ulap/960/640",
    elevation_m: 1846,
    difficulty_score: 3,
    difficulty: "Beginner",
    best_months: ["December"],
    summary: "Cool beginner ridge.",
  },
  {
    id: "mt-apo",
    name: "Mt. Apo",
    slug: "mt-apo",
    region: "Mindanao",
    province: "Davao del Sur",
    lat: 6.9,
    lon: 125.2,
    image_url: "https://picsum.photos/seed/mt-apo/960/640",
    elevation_m: 2954,
    difficulty_score: 8,
    difficulty: "Advanced",
    best_months: ["January"],
    summary: "Multi-day high summit.",
  },
];

afterEach(() => {
  vi.restoreAllMocks();
});

describe("MountainListClient", () => {
  it("filters mountains by search query", async () => {
    render(<MountainListClient mountains={mountains} regions={["Luzon", "Mindanao"]} />);

    fireEvent.change(screen.getByLabelText("Search mountains"), {
      target: { value: "Apo" },
    });

    await waitFor(() => {
      expect(screen.getByText("Mt. Apo")).toBeInTheDocument();
      expect(screen.queryByText("Mt. Ulap")).not.toBeInTheDocument();
    });
  });

  it("sorts mountains alphabetically", async () => {
    render(<MountainListClient mountains={mountains} regions={["Luzon", "Mindanao"]} />);

    fireEvent.click(screen.getByRole("button", { name: "Sort mountains" }));
    fireEvent.click(screen.getByRole("menuitemradio", { name: "Alphabetical" }));

    expect(screen.getByRole("heading", { level: 2, name: "Alphabetical browse" })).toBeInTheDocument();

    const mountainLinks = screen.getAllByRole("link", { name: "Open guide" });
    expect(mountainLinks[0]).toHaveAttribute("href", "/mountains/mt-apo");
    expect(mountainLinks[1]).toHaveAttribute("href", "/mountains/mt-ulap");
  });

  it("closes the sort menu on outside click", () => {
    render(<MountainListClient mountains={mountains} regions={["Luzon", "Mindanao"]} />);

    fireEvent.click(screen.getByRole("button", { name: "Sort mountains" }));
    expect(screen.getByRole("menu", { name: "Sort mountains options" })).toBeInTheDocument();

    fireEvent.pointerDown(document.body);

    expect(screen.queryByRole("menu", { name: "Sort mountains options" })).not.toBeInTheDocument();
  });

  it("supports keyboard navigation in the sort menu", async () => {
    render(<MountainListClient mountains={mountains} regions={["Luzon", "Mindanao"]} />);

    const trigger = screen.getByRole("button", { name: "Sort mountains" });

    fireEvent.keyDown(trigger, { key: "ArrowDown" });

    const firstItem = await screen.findByRole("menuitemradio", { name: "By difficulty" });
    await waitFor(() => {
      expect(firstItem).toHaveFocus();
    });

    fireEvent.keyDown(firstItem, { key: "ArrowDown" });

    await waitFor(() => {
      expect(screen.getByRole("menuitemradio", { name: "Alphabetical" })).toHaveFocus();
    });

    fireEvent.keyDown(screen.getByRole("menuitemradio", { name: "Alphabetical" }), { key: "Escape" });

    await waitFor(() => {
      expect(trigger).toHaveFocus();
    });

    expect(screen.queryByRole("menu", { name: "Sort mountains options" })).not.toBeInTheDocument();
  });

  it("filters mountains by custom region menu", async () => {
    render(<MountainListClient mountains={mountains} regions={["Luzon", "Mindanao"]} />);

    fireEvent.click(screen.getByRole("button", { name: "Filter by region" }));
    fireEvent.click(screen.getByRole("menuitemradio", { name: "Mindanao" }));

    await waitFor(() => {
      expect(screen.getByText("Mt. Apo")).toBeInTheDocument();
      expect(screen.queryByText("Mt. Ulap")).not.toBeInTheDocument();
    });
  });

  it("filters mountains by custom difficulty menu", async () => {
    render(<MountainListClient mountains={mountains} regions={["Luzon", "Mindanao"]} />);

    fireEvent.click(screen.getByRole("button", { name: "Filter by difficulty" }));
    fireEvent.click(screen.getByRole("menuitemradio", { name: "Advanced (7-8/9)" }));

    await waitFor(() => {
      expect(screen.getByText("Mt. Apo")).toBeInTheDocument();
      expect(screen.queryByText("Mt. Ulap")).not.toBeInTheDocument();
    });
  });
});
